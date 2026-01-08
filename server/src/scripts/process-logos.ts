import axios from 'axios';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

// Corrected paths relative to project root
const ROOT_DIR = path.join(__dirname, '../../..');
const LOGO_DIR = path.join(ROOT_DIR, 'client/public/logos_60px60px');
const BACKUP_DIR = path.join(ROOT_DIR, 'client/public/logos_backup');

// Ensure directories exist
if (!fs.existsSync(LOGO_DIR)) fs.mkdirSync(LOGO_DIR, { recursive: true });
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

async function processLogos() {
  const teams = await prisma.team.findMany();
  console.log(`Processing logos for ${teams.length} teams (New size: 60x60 in logos_60px60px)...`);

  for (const team of teams) {
    const fileName = `${team.abbreviation}.png`;
    const backupPath = path.join(BACKUP_DIR, fileName);
    let buffer: Buffer;

    try {
      if (fs.existsSync(backupPath)) {
        console.log(`Using backup for ${team.name}`);
        buffer = fs.readFileSync(backupPath);
      } else {
        let sourceUrl = `https://static.www.nfl.com/t_q-best/league/api/clubs/logos/${team.abbreviation}.png`;
        console.log(`Downloading logo for ${team.name} from ${sourceUrl}`);
        const response = await axios({ url: sourceUrl, responseType: 'arraybuffer' });
        buffer = Buffer.from(response.data);
        fs.writeFileSync(backupPath, buffer);
      }

      // Resize to 60x60 and save to logos_60px60px
      const targetPath = path.join(LOGO_DIR, fileName);
      await sharp(buffer)
        .resize(60, 60, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(targetPath);

      // Update database to use new path
      const localUrl = `/logos_60px60px/${fileName}`;
      await prisma.team.update({
        where: { id: team.id },
        data: { logoUrl: localUrl },
      });

      console.log(`✅ Processed ${team.name} -> ${localUrl}`);
    } catch (error) {
      console.error(`❌ Failed to process ${team.name}:`, (error as Error).message);
    }
  }

  console.log('Finished processing logos.');
}

processLogos()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
