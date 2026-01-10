import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../prisma.js';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initializeDatabase() {
    try {
        logger.info('Initializing database with SQL schema...');
        
        const sqlPath = path.join(process.cwd(), 'prisma', 'nfl_season_2026_clean_schema.sql');
        
        if (!fs.existsSync(sqlPath)) {
            logger.error(`SQL schema file not found at: ${sqlPath}`);
            return;
        }

        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        const statements = splitSqlStatements(sqlContent);

        for (const statement of statements) {
            try {
                await prisma.$executeRawUnsafe(statement);
            } catch (stmtError: any) {
                const msg = stmtError.message;
                if (msg.includes('already exists') || msg.includes('duplicate key')) {
                    continue;
                }
                logger.warn(`Statement failed: ${statement.substring(0, 100)}...`);
                logger.warn(msg);
            }
        }

        // Ensure we have some matchups for tests if the table is empty
        const matchupCount = await prisma.matchup.count();
        if (matchupCount === 0) {
            logger.info('Creating initial matchups for Week 1...');
            const teams = await prisma.team.findMany();
            if (teams.length >= 2) {
                const matchups = [];
                for (let i = 0; i < teams.length; i += 2) {
                    const home = teams[i];
                    const away = teams[i+1];
                    if (home && away) {
                        matchups.push({
                            week: 1,
                            stage: 'REGULAR' as any,
                            homeTeamId: home.id,
                            awayTeamId: away.id,
                            startTime: new Date(Date.now() + 86400000) // Tomorrow
                        });
                    }
                }
                await prisma.matchup.createMany({ data: matchups });
            }
        }
        
        logger.info('Database initialized successfully.');
    } catch (error) {
        logger.error('Error during database initialization:');
        logger.error(error);
    }
}

function splitSqlStatements(sql: string): string[] {
    const statements: string[] = [];
    const lines = sql.split(/\r?\n/);
    let currentStatement = '';
    let inDollarQuote = false;

    for (let line of lines) {
        if (currentStatement === '' && (line.trim().startsWith('--') || line.trim() === '')) {
            continue;
        }

        currentStatement += line + '\n';

        const dollarQuoteMatches = line.match(/\$\$/g);
        if (dollarQuoteMatches) {
            if (dollarQuoteMatches.length % 2 !== 0) {
                inDollarQuote = !inDollarQuote;
            }
        }

        if (!inDollarQuote && line.trim().endsWith(';')) {
            statements.push(currentStatement.trim());
            currentStatement = '';
        }
    }

    if (currentStatement.trim() !== '') {
        statements.push(currentStatement.trim());
    }

    return statements;
}
