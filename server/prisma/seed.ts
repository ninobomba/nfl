import { PrismaClient, SeasonStage } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const nflTeams = [
  { city: 'Arizona', name: 'Cardinals', abbreviation: 'ARI', logoUrl: '/logos_30px30px/ARI.png', conference: 'NFC', division: 'West' },
  { city: 'Atlanta', name: 'Falcons', abbreviation: 'ATL', logoUrl: '/logos_30px30px/ATL.png', conference: 'NFC', division: 'South' },
  { city: 'Baltimore', name: 'Ravens', abbreviation: 'BAL', logoUrl: '/logos_30px30px/BAL.png', conference: 'AFC', division: 'North' },
  { city: 'Buffalo', name: 'Bills', abbreviation: 'BUF', logoUrl: '/logos_30px30px/BUF.png', conference: 'AFC', division: 'East' },
  { city: 'Carolina', name: 'Panthers', abbreviation: 'CAR', logoUrl: '/logos_30px30px/CAR.png', conference: 'NFC', division: 'South' },
  { city: 'Chicago', name: 'Bears', abbreviation: 'CHI', logoUrl: '/logos_30px30px/CHI.png', conference: 'NFC', division: 'North' },
  { city: 'Cincinnati', name: 'Bengals', abbreviation: 'CIN', logoUrl: '/logos_30px30px/CIN.png', conference: 'AFC', division: 'North' },
  { city: 'Cleveland', name: 'Browns', abbreviation: 'CLE', logoUrl: '/logos_30px30px/CLE.png', conference: 'AFC', division: 'North' },
  { city: 'Dallas', name: 'Cowboys', abbreviation: 'DAL', logoUrl: '/logos_30px30px/DAL.png', conference: 'NFC', division: 'East' },
  { city: 'Denver', name: 'Broncos', abbreviation: 'DEN', logoUrl: '/logos_30px30px/DEN.png', conference: 'AFC', division: 'West' },
  { city: 'Detroit', name: 'Lions', abbreviation: 'DET', logoUrl: '/logos_30px30px/DET.png', conference: 'NFC', division: 'North' },
  { city: 'Green Bay', name: 'Packers', abbreviation: 'GB', logoUrl: '/logos_30px30px/GB.png', conference: 'NFC', division: 'North' },
  { city: 'Houston', name: 'Texans', abbreviation: 'HOU', logoUrl: '/logos_30px30px/HOU.png', conference: 'AFC', division: 'South' },
  { city: 'Indianapolis', name: 'Colts', abbreviation: 'IND', logoUrl: '/logos_30px30px/IND.png', conference: 'AFC', division: 'South' },
  { city: 'Jacksonville', name: 'Jaguars', abbreviation: 'JAX', logoUrl: '/logos_30px30px/JAX.png', conference: 'AFC', division: 'South' },
  { city: 'Kansas City', name: 'Chiefs', abbreviation: 'KC', logoUrl: '/logos_30px30px/KC.png', conference: 'AFC', division: 'West' },
  { city: 'Las Vegas', name: 'Raiders', abbreviation: 'LV', logoUrl: '/logos_30px30px/LV.png', conference: 'AFC', division: 'West' },
  { city: 'Los Angeles', name: 'Chargers', abbreviation: 'LAC', logoUrl: '/logos_30px30px/LAC.png', conference: 'AFC', division: 'West' },
  { city: 'Los Angeles', name: 'Rams', abbreviation: 'LAR', logoUrl: '/logos_30px30px/LAR.png', conference: 'NFC', division: 'West' },
  { city: 'Miami', name: 'Dolphins', abbreviation: 'MIA', logoUrl: '/logos_30px30px/MIA.png', conference: 'AFC', division: 'East' },
  { city: 'Minnesota', name: 'Vikings', abbreviation: 'MIN', logoUrl: '/logos_30px30px/MIN.png', conference: 'NFC', division: 'North' },
  { city: 'New England', name: 'Patriots', abbreviation: 'NE', logoUrl: '/logos_30px30px/NE.png', conference: 'AFC', division: 'East' },
  { city: 'New Orleans', name: 'Saints', abbreviation: 'NO', logoUrl: '/logos_30px30px/NO.png', conference: 'NFC', division: 'South' },
  { city: 'New York', name: 'Giants', abbreviation: 'NYG', logoUrl: '/logos_30px30px/NYG.png', conference: 'NFC', division: 'East' },
  { city: 'New York', name: 'Jets', abbreviation: 'NYJ', logoUrl: '/logos_30px30px/NYJ.png', conference: 'AFC', division: 'East' },
  { city: 'Philadelphia', name: 'Eagles', abbreviation: 'PHI', logoUrl: '/logos_30px30px/PHI.png', conference: 'NFC', division: 'East' },
  { city: 'Pittsburgh', name: 'Steelers', abbreviation: 'PIT', logoUrl: '/logos_30px30px/PIT.png', conference: 'AFC', division: 'North' },
  { city: 'San Francisco', name: '49ers', abbreviation: 'SF', logoUrl: '/logos_30px30px/SF.png', conference: 'NFC', division: 'West' },
  { city: 'Seattle', name: 'Seahawks', abbreviation: 'SEA', logoUrl: '/logos_30px30px/SEA.png', conference: 'NFC', division: 'West' },
  { city: 'Tampa Bay', name: 'Buccaneers', abbreviation: 'TB', logoUrl: '/logos_30px30px/TB.png', conference: 'NFC', division: 'South' },
  { city: 'Tennessee', name: 'Titans', abbreviation: 'TEN', logoUrl: '/logos_30px30px/TEN.png', conference: 'AFC', division: 'South' },
  { city: 'Washington', name: 'Commanders', abbreviation: 'WAS', logoUrl: '/logos_30px30px/WAS.png', conference: 'NFC', division: 'East' },
];

async function main() {
  console.log('Limpiando base de datos...');
  await prisma.pick.deleteMany();
  await prisma.matchup.deleteMany();

  console.log('Sembrando datos...');

  // Sembrar Usuario Admin
  const adminPassword = await bcrypt.hash('admin', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { password: adminPassword },
    create: {
      username: 'admin',
      email: 'admin@nfl.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Eliminar usuarios que no sean admin ni user (para limpieza previa a crear user)
  // Primero registros relacionados para evitar errores de FK
  const usersToCleanup = await prisma.user.findMany({
      where: { username: { notIn: ['admin', 'user'] } },
      select: { id: true }
  });
  const userIds = usersToCleanup.map(u => u.id);
  
  await prisma.pick.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.passwordReset.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.auditLog.deleteMany({ where: { userId: { in: userIds } } });

  await prisma.user.deleteMany({
    where: {
      username: {
        notIn: ['admin', 'user']
      }
    }
  });

  // Crear usuario User estándar
  const standardPassword = await bcrypt.hash('user', 10);
  await prisma.user.upsert({
    where: { username: 'user' },
    update: { password: standardPassword },
    create: {
      username: 'user',
      email: 'user@nfl.com',
      password: standardPassword,
      role: 'USER',
    },
  });

  // Sembrar Equipos
  for (const team of nflTeams) {
    await prisma.team.upsert({
      where: { abbreviation: team.abbreviation },
      update: {
        logoUrl: team.logoUrl,
        conference: team.conference,
        division: team.division
      },
      create: team,
    });
  }

  // Generar algunos partidos para la Semana 1
  const teams = await prisma.team.findMany();
  const week1Matchups = [];
  
  // Agrupar equipos de 2 en 2 para crear 16 partidos (32 equipos)
  for (let i = 0; i < teams.length; i += 2) {
      const home = teams[i];
      const away = teams[i+1];
      if (home && away) {
          week1Matchups.push({
              week: 1,
              stage: SeasonStage.REGULAR,
              homeTeamId: home.id,
              awayTeamId: away.id,
              startTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
          });
      }
  }

  await prisma.matchup.createMany({
      data: week1Matchups
  });

  // Tema por defecto
  await prisma.appSetting.upsert({
      where: { key: 'theme' },
      update: {},
      create: { key: 'theme', value: 'lara-dark-blue' }
  });

  console.log(`Seed finalizado: 16 partidos creados para la semana 1.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());