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

    let winnerId = null;
    if (homeScore > awayScore) {
        winnerId = matchup.homeTeamId;
    } else if (awayScore > homeScore) {
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
        const points = POINTS_MAP[matchup.stage] || 1;
        await prisma.user.update({
          where: { id: pick.userId },
          data: { score: { increment: points } },
        });
      }
    }

    res.json({ message: 'Game simulated and scores updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error simulating game' });
  }
};

export const createMatchup = async (req: Request, res: Response) => {
    try {
        const { week, stage, homeTeamId, awayTeamId, startTime } = req.body;

        if (Number(homeTeamId) === Number(awayTeamId)) {
            res.status(400).json({ message: "SAME_TEAM_CONFLICT" });
            return;
        }

        // 1. Validar límite de 18 juegos por semana

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
                    { homeTeamId: Number(homeTeamId) },
                    { awayTeamId: Number(homeTeamId) },
                    { homeTeamId: Number(awayTeamId) },
                    { awayTeamId: Number(awayTeamId) }
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
                homeTeamId: Number(homeTeamId),
                awayTeamId: Number(awayTeamId),
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
            where: { week: Number(week), stage, NOT: { id: Number(id) } }
        });

        if (count >= 18) {
            res.status(400).json({ message: "WEEK_LIMIT_EXCEEDED" });
            return;
        }

        const conflict = await prisma.matchup.findFirst({
            where: {
                week: Number(week),
                stage,
                NOT: { id: Number(id) },
                OR: [
                    { homeTeamId: Number(homeTeamId) },
                    { awayTeamId: Number(homeTeamId) },
                    { homeTeamId: Number(awayTeamId) },
                    { awayTeamId: Number(awayTeamId) }
                ]
            }
        });

        if (conflict) {
            res.status(400).json({ message: "TEAM_ALREADY_SCHEDULED" });
            return;
        }

        const matchup = await prisma.matchup.update({
            where: { id: Number(id) },
            data: {
                week: Number(week),
                stage,
                homeTeamId: Number(homeTeamId),
                awayTeamId: Number(awayTeamId),
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
        await prisma.pick.deleteMany({ where: { matchupId: Number(id) } });
        await prisma.matchup.delete({ where: { id: Number(id) } });
        res.json({ message: "DELETED" });
    } catch (error) {
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
            select: { id: true, username: true, email: true, score: true, role: true, isActive: true, createdAt: true }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
}

export const toggleUserStatus = async (req: Request, res: Response) => {
    try {
        const { id, isActive } = req.body;
        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { isActive: Boolean(isActive) }
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
            where: { id: Number(id) },
            data: { name, city, conference, division }
        });
        res.json(team);
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
}