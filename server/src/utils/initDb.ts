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
                // If it's a "relation already exists" error, we might want to ignore it
                // but since we are using IF NOT EXISTS and DO blocks, we should log other errors
                if (!stmtError.message.includes('already exists')) {
                    logger.warn(`Statement failed: ${statement.substring(0, 50)}...`);
                    logger.warn(stmtError.message);
                }
            }
        }
        
        logger.info('Database initialized successfully from SQL file.');
    } catch (error) {
        logger.error('Error during database initialization:');
        logger.error(error);
    }
}

/**
 * Splits a SQL string into individual statements, respecting dollar-quoted strings (e.g., DO blocks).
 */
function splitSqlStatements(sql: string): string[] {
    const statements: string[] = [];
    const lines = sql.split(/\r?\n/);
    let currentStatement = '';
    let inDollarQuote = false;

    for (let line of lines) {
        // Skip comments and empty lines at the start of a statement
        if (currentStatement === '' && (line.trim().startsWith('--') || line.trim() === '')) {
            continue;
        }

        currentStatement += line + '\n';

        // Check for dollar quotes ($$)
        // This handles simple $$ quotes used in DO blocks
        const dollarQuoteMatches = line.match(/\$\$/g);
        if (dollarQuoteMatches) {
            if (dollarQuoteMatches.length % 2 !== 0) {
                inDollarQuote = !inDollarQuote;
            }
        }

        // If we are not inside a dollar quote and the line ends with a semicolon
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