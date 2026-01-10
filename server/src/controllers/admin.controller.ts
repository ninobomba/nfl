import type { Request, Response } from 'express';
import prisma from '../prisma.js';
import { SeasonStage } from '@prisma/client';

const POINTS_MAP: Record<SeasonStage, number> = {
  REGULAR: 1,
  WILDCARD: 2,
  DIVISIONAL: 2,
  CONFERENCE: 2,
  SUPERBOWL: 3,
};

export const simulateGame = async (req: Request, res: Response) => {
  try {
    const { matchupId, homeScore, awayScore } = req.body;

    const matchup = await prisma.matchup.findUnique({ where: { id: matchupId } });
    if (!matchup) {
      res.status(404).json({ message: 'Matchup not found' });
      return;
    }

    const points = POINTS_MAP[matchup.stage] || 1;

    // If game was already finished, we need to REVERSE previous points
    if (matchup.isFinished) {
        const previousCorrectPicks = await prisma.pick.findMany({
            where: { matchupId, isCorrect: true }
        });

        for (const pick of previousCorrectPicks) {
            await prisma.user.update({
                where: { id: pick.userId },
                data: { score: { decrement: points } }
            });
        }
    }

    let winnerId = null;
    if (Number(homeScore) > Number(awayScore)) {
        winnerId = matchup.homeTeamId;
    } else if (Number(awayScore) > Number(homeScore)) {
        winnerId = matchup.awayTeamId;
    }

    await prisma.matchup.update({
      where: { id: matchupId },
      data: {
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
        winnerId,
        isFinished: true,
      },
    });

    const picks = await prisma.pick.findMany({ where: { matchupId } });
    
    for (const pick of picks) {
      const isCorrect = winnerId !== null && pick.selectedTeamId === winnerId;
      
      await prisma.pick.update({
        where: { id: pick.id },
        data: { isCorrect },
      });

      if (isCorrect) {
        await prisma.user.update({
          where: { id: pick.userId },
          data: { score: { increment: points } },
        });
      }
    }

    await prisma.auditLog.create({
        data: { 
            action: 'GAME_SIMULATED', 
            details: `Matchup ${matchupId}: ${awayScore}-${homeScore}. Idempotency handled.` 
        }
    });

    res.json({ message: 'Game simulated and scores updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error simulating game' });
  }
};

export const createMatchup = async (req: Request, res: Response) => {
    try {
        const { week, stage, homeTeamId, awayTeamId, startTime } = req.body;

        if (homeTeamId === awayTeamId) {
            res.status(400).json({ message: "SAME_TEAM_CONFLICT" });
            return;
        }

        const count = await prisma.matchup.count({
            where: { week: Number(week), stage }
        });

        if (count >= 18) {
            res.status(400).json({ message: "WEEK_LIMIT_EXCEEDED" });
            return;
        }

        const conflict = await prisma.matchup.findFirst({
            where: {
                week: Number(week),
                stage,
                OR: [
                    { homeTeamId },
                    { awayTeamId: homeTeamId },
                    { homeTeamId: awayTeamId },
                    { awayTeamId }
                ]
            }
        });

        if (conflict) {
            res.status(400).json({ message: "TEAM_ALREADY_SCHEDULED" });
            return;
        }

        const matchup = await prisma.matchup.create({
            data: {
                week: Number(week),
                stage,
                homeTeamId,
                awayTeamId,
                startTime: new Date(startTime)
            }
        });
        res.json(matchup);
    } catch (error) {
        res.status(500).json({ message: "SERVER_ERROR" });
    }
}

export const updateMatchup = async (req: Request, res: Response) => {
    try {
        const { id, week, stage, homeTeamId, awayTeamId, startTime } = req.body;

        const count = await prisma.matchup.count({
            where: { week: Number(week), stage, NOT: { id } }
        });

        if (count >= 18) {
            res.status(400).json({ message: "WEEK_LIMIT_EXCEEDED" });
            return;
        }

        const conflict = await prisma.matchup.findFirst({
            where: {
                week: Number(week),
                stage,
                NOT: { id },
                OR: [
                    { homeTeamId },
                    { awayTeamId: homeTeamId },
                    { homeTeamId: awayTeamId },
                    { awayTeamId }
                ]
            }
        });

        if (conflict) {
            res.status(400).json({ message: "TEAM_ALREADY_SCHEDULED" });
            return;
        }

        const matchup = await prisma.matchup.update({
            where: { id },
            data: {
                week: Number(week),
                stage,
                homeTeamId,
                awayTeamId,
                startTime: new Date(startTime)
            }
        });
        res.json(matchup);
    } catch (error) {
        res.status(500).json({ message: "SERVER_ERROR" });
    }
}

export const deleteMatchup = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const matchup = await prisma.matchup.findUnique({ where: { id } });
        if (!matchup) {
            res.status(404).json({ message: "Matchup not found" });
            return;
        }

        // If game was finished, reverse points for users who won
        if (matchup.isFinished) {
            const points = POINTS_MAP[matchup.stage] || 1;
            const correctPicks = await prisma.pick.findMany({
                where: { matchupId: id, isCorrect: true }
            });

            for (const pick of correctPicks) {
                await prisma.user.update({
                    where: { id: pick.userId },
                    data: { score: { decrement: points } }
                });
            }
        }

        await prisma.pick.deleteMany({ where: { matchupId: id } });
        await prisma.matchup.delete({ where: { id } });

        await prisma.auditLog.create({
            data: { action: 'MATCHUP_DELETED', details: `Matchup ID: ${id}, Was Finished: ${matchup.isFinished}` }
        });

        res.json({ message: "DELETED" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "SERVER_ERROR" });
    }
}

export const clearSchedule = async (req: Request, res: Response) => {
    try {
        await prisma.pick.deleteMany();
        await prisma.matchup.deleteMany();
        await prisma.user.updateMany({ data: { score: 0 } });
        res.json({ message: "CLEARED" });
    } catch (error) {
        res.status(500).json({ message: "SERVER_ERROR" });
    }
}

export const getSettings = async (req: Request, res: Response) => {
    try {
        const settings = await prisma.appSetting.findMany();
        const settingsMap = settings.reduce((acc: any, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        res.json(settingsMap);
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
}

export const updateSetting = async (req: Request, res: Response) => {
    try {
        const { key, value } = req.body;
        const setting = await prisma.appSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });
        res.json(setting);
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
}

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, username: true, email: true, score: true, role: true, isActive: true, createdAt: true, deletedAt: true }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
}

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { type } = req.query; // 'soft' or 'hard'

        const userToDelete = await prisma.user.findUnique({ where: { id } });
        if (!userToDelete) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        if (type === 'hard') {
            await prisma.$transaction([
                prisma.pick.deleteMany({ where: { userId: id } }),
                prisma.passwordReset.deleteMany({ where: { userId: id } }),
                prisma.auditLog.deleteMany({ where: { userId: id } }),
                prisma.user.delete({ where: { id } })
            ]);
            res.json({ message: "USER_HARD_DELETED" });
        } else {
            // Soft delete: set deletedAt, deactivate AND rename to free up unique fields
            const timestamp = Date.now();
            await prisma.user.update({
                where: { id },
                data: { 
                    deletedAt: new Date(),
                    isActive: false,
                    username: `${userToDelete.username}_del_${timestamp}`,
                    email: `${userToDelete.email}_del_${timestamp}`
                }
            });

            await prisma.auditLog.create({
                data: { action: 'USER_SOFT_DELETED', details: `User ID: ${id}, Old Username: ${userToDelete.username}` }
            });

            res.json({ message: "USER_SOFT_DELETED" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting user" });
    }
}

export const toggleUserStatus = async (req: Request, res: Response) => {
    try {
        const { id, isActive } = req.body;
        const user = await prisma.user.update({
            where: { id },
            data: { isActive: Boolean(isActive) }
        });

        await prisma.auditLog.create({
            data: { action: 'USER_STATUS_TOGGLED', details: `User ID: ${id}, New Status: ${isActive}` }
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
}

export const updateTeam = async (req: Request, res: Response) => {
    try {
        const { id, name, city, conference, division } = req.body;
        const team = await prisma.team.update({
            where: { id },
            data: { name, city, conference, division }
        });
        res.json(team);
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
}

export const getAuditLogs = async (req: Request, res: Response) => {
    try {
        const logs = await prisma.auditLog.findMany({
            include: { user: { select: { username: true } } },
            orderBy: { createdAt: 'desc' },
            take: 100 // Últimos 100 registros
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: "Error al recuperar la bitácora" });
    }
}