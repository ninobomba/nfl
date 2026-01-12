import type { Response, Request } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import prisma from '../prisma.js';
import { SeasonStage } from '@prisma/client';

export const getMyPicks = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const picks = await prisma.pick.findMany({
      where: { userId },
      include: { matchup: true },
    });
    res.json(picks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching picks' });
  }
};

export const makePick = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const { matchupId, selectedTeamId } = req.body;

    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const matchup = await prisma.matchup.findUnique({ where: { id: matchupId } });
    if (!matchup) {
      res.status(404).json({ message: 'Matchup not found' });
      return;
    }

    if (new Date() > matchup.startTime) {
      res.status(400).json({ message: 'Pick deadline has passed' });
      return;
    }

    if (selectedTeamId !== matchup.homeTeamId && selectedTeamId !== matchup.awayTeamId) {
        res.status(400).json({ message: 'Invalid team for this matchup' });
        return;
    }

    const pick = await prisma.pick.upsert({
      where: {
        userId_matchupId: {
          userId,
          matchupId,
        },
      },
      update: { selectedTeamId },
      create: {
        userId,
        matchupId,
        selectedTeamId,
      },
    });

    res.json(pick);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error making pick' });
  }
};

export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            where: { isActive: true, deletedAt: null },
            select: { id: true, username: true, score: true },
            orderBy: { score: 'desc' }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching leaderboard" });
    }
}

export const getWeeklyLeaderboard = async (req: Request, res: Response) => {
    try {
        const week = Number(req.query.week);
        const stage = (req.query.stage as string) as SeasonStage || SeasonStage.REGULAR;

        if (!week) {
            res.status(400).json({ message: "Semana requerida" });
            return;
        }

        // Obtener todos los picks de la semana para usuarios activos y no borrados
        const picks = await prisma.pick.findMany({
            where: {
                matchup: { week, stage },
                user: { isActive: true, deletedAt: null }
            },
            include: {
                user: { select: { id: true, username: true } }
            }
        });

        // Agrupar por usuario
        const userStats: Record<string, any> = {};

        picks.forEach(pick => {
            if (!pick.user) return;
            
            if (!userStats[pick.userId]) {
                userStats[pick.userId] = {
                    id: pick.userId,
                    username: pick.user.username,
                    correctPicks: 0,
                    lastPickDate: pick.updatedAt
                };
            }

            if (pick.isCorrect) {
                userStats[pick.userId].correctPicks++;
            }

            // El "momento de ingreso" es la fecha del pick más reciente de esa semana
            if (pick.updatedAt > userStats[pick.userId].lastPickDate) {
                userStats[pick.userId].lastPickDate = pick.updatedAt;
            }
        });

        // Convertir a array y ordenar
        const ranking = Object.values(userStats).sort((a, b) => {
            // 1. Mayor número de aciertos
            if (b.correctPicks !== a.correctPicks) {
                return b.correctPicks - a.correctPicks;
            }
            // 2. Desempate: El que terminó primero (fecha menor) gana
            return a.lastPickDate.getTime() - b.lastPickDate.getTime();
        });

        res.json(ranking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al calcular ranking semanal" });
    }
}