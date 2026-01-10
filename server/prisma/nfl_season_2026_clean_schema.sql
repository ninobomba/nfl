-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "SeasonStage" AS ENUM ('REGULAR', 'WILDCARD', 'DIVISIONAL', 'CONFERENCE', 'SUPERBOWL');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "logoUrl" TEXT,
    "conference" TEXT,
    "division" TEXT,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Matchup" (
    "id" SERIAL NOT NULL,
    "week" INTEGER NOT NULL,
    "stage" "SeasonStage" NOT NULL DEFAULT 'REGULAR',
    "startTime" TIMESTAMP(3) NOT NULL,
    "isFinished" BOOLEAN NOT NULL DEFAULT false,
    "homeTeamId" INTEGER NOT NULL,
    "awayTeamId" INTEGER NOT NULL,
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "winnerId" INTEGER,

    CONSTRAINT "Matchup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pick" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "matchupId" INTEGER NOT NULL,
    "selectedTeamId" INTEGER NOT NULL,
    "isCorrect" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Team_abbreviation_key" ON "Team"("abbreviation");

-- CreateIndex
CREATE UNIQUE INDEX "Pick_userId_matchupId_key" ON "Pick"("userId", "matchupId");

-- CreateIndex
CREATE UNIQUE INDEX "AppSetting_key_key" ON "AppSetting"("key");

-- AddForeignKey
ALTER TABLE "Matchup" ADD CONSTRAINT "Matchup_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matchup" ADD CONSTRAINT "Matchup_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pick" ADD CONSTRAINT "Pick_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pick" ADD CONSTRAINT "Pick_matchupId_fkey" FOREIGN KEY ("matchupId") REFERENCES "Matchup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pick" ADD CONSTRAINT "Pick_selectedTeamId_fkey" FOREIGN KEY ("selectedTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- NFL Teams
INSERT INTO "Team" ("name", "city", "abbreviation", "logoUrl", "conference", "division") VALUES
('Arizona Cardinals', 'Arizona', 'ARI', '/logos_30px30px/ARI.png', 'NFC', 'West'),
('Atlanta Falcons', 'Atlanta', 'ATL', '/logos_30px30px/ATL.png', 'NFC', 'South'),
('Baltimore Ravens', 'Baltimore', 'BAL', '/logos_30px30px/BAL.png', 'AFC', 'North'),
('Buffalo Bills', 'Buffalo', 'BUF', '/logos_30px30px/BUF.png', 'AFC', 'East'),
('Carolina Panthers', 'Carolina', 'CAR', '/logos_30px30px/CAR.png', 'NFC', 'South'),
('Chicago Bears', 'Chicago', 'CHI', '/logos_30px30px/CHI.png', 'NFC', 'North'),
('Cincinnati Bengals', 'Cincinnati', 'CIN', '/logos_30px30px/CIN.png', 'AFC', 'North'),
('Cleveland Browns', 'Cleveland', 'CLE', '/logos_30px30px/CLE.png', 'AFC', 'North'),
('Dallas Cowboys', 'Dallas', 'DAL', '/logos_30px30px/DAL.png', 'NFC', 'East'),
('Denver Broncos', 'Denver', 'DEN', '/logos_30px30px/DEN.png', 'AFC', 'West'),
('Detroit Lions', 'Detroit', 'DET', '/logos_30px30px/DET.png', 'NFC', 'North'),
('Green Bay Packers', 'Green Bay', 'GB', '/logos_30px30px/GB.png', 'NFC', 'North'),
('Houston Texans', 'Houston', 'HOU', '/logos_30px30px/HOU.png', 'AFC', 'South'),
('Indianapolis Colts', 'Indianapolis', 'IND', '/logos_30px30px/IND.png', 'AFC', 'South'),
('Jacksonville Jaguars', 'Jacksonville', 'JAX', '/logos_30px30px/JAX.png', 'AFC', 'South'),
('Kansas City Chiefs', 'Kansas City', 'KC', '/logos_30px30px/KC.png', 'AFC', 'West'),
('Las Vegas Raiders', 'Las Vegas', 'LV', '/logos_30px30px/LV.png', 'AFC', 'West'),
('Los Angeles Chargers', 'Los Angeles', 'LAC', '/logos_30px30px/LAC.png', 'AFC', 'West'),
('Los Angeles Rams', 'Los Angeles', 'LAR', '/logos_30px30px/LAR.png', 'NFC', 'West'),
('Miami Dolphins', 'Miami', 'MIA', '/logos_30px30px/MIA.png', 'AFC', 'East'),
('Minnesota Vikings', 'Minnesota', 'MIN', '/logos_30px30px/MIN.png', 'NFC', 'North'),
('New England Patriots', 'New England', 'NE', '/logos_30px30px/NE.png', 'AFC', 'East'),
('New Orleans Saints', 'New Orleans', 'NO', '/logos_30px30px/NO.png', 'NFC', 'South'),
('New York Giants', 'New York', 'NYG', '/logos_30px30px/NYG.png', 'NFC', 'East'),
('New York Jets', 'New York', 'NYJ', '/logos_30px30px/NYJ.png', 'AFC', 'East'),
('Philadelphia Eagles', 'Philadelphia', 'PHI', '/logos_30px30px/PHI.png', 'NFC', 'East'),
('Pittsburgh Steelers', 'Pittsburgh', 'PIT', '/logos_30px30px/PIT.png', 'AFC', 'North'),
('San Francisco 49ers', 'San Francisco', 'SF', '/logos_30px30px/SF.png', 'NFC', 'West'),
('Seattle Seahawks', 'Seattle', 'SEA', '/logos_30px30px/SEA.png', 'NFC', 'West'),
('Tampa Bay Buccaneers', 'Tampa Bay', 'TB', '/logos_30px30px/TB.png', 'NFC', 'South'),
('Tennessee Titans', 'Tennessee', 'TEN', '/logos_30px30px/TEN.png', 'AFC', 'South'),
('Washington Commanders', 'Washington', 'WAS', '/logos_30px30px/WAS.png', 'NFC', 'East');

-- Initial Users
INSERT INTO "User" ("username", "email", "password", "role", "updatedAt") VALUES
('admin', 'admin@nfl.com', '$2b$10$XJh8r0MV6d1nNMwKDdY2suWkyhkyacabeP4/PtcnWjxX/m0VWPwSe', 'ADMIN', CURRENT_TIMESTAMP),
('test', 'test@example.com', '$2b$10$Ktd9vr9NEIUOdXdPJSojGex8BlHeD6eMOY1Ftd0deYOz15Vsnie3q', 'USER', CURRENT_TIMESTAMP);