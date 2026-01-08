import prisma from '../prisma.js';
import { SeasonStage } from '@prisma/client';
export const getTeams = async (req, res) => {
    try {
        const teams = await prisma.team.findMany();
        res.json(teams);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching teams' });
    }
};
export const getMatchups = async (req, res) => {
    try {
        const { week, stage } = req.query;
        const where = {};
        if (week)
            where.week = Number(week);
        if (stage)
            where.stage = stage;
        const matchups = await prisma.matchup.findMany({
            where,
            include: {
                homeTeam: true,
                awayTeam: true,
            },
            orderBy: { startTime: 'asc' },
        });
        res.json(matchups);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching matchups' });
    }
};
export const getTheme = async (req, res) => {
    try {
        const theme = await prisma.appSetting.findUnique({ where: { key: 'theme' } });
        res.json({ theme: theme?.value || 'lara-dark-blue' });
    }
    catch (error) {
        res.status(500).json({ theme: 'lara-dark-blue' });
    }
};
//# sourceMappingURL=data.controller.js.map