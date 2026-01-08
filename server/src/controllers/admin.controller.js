import prisma from '../prisma.js';
import { SeasonStage } from '@prisma/client';
const POINTS_MAP = {
    REGULAR: 1,
    WILDCARD: 2,
    DIVISIONAL: 2,
    CONFERENCE: 2,
    SUPERBOWL: 3,
};
export const simulateGame = async (req, res) => {
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
        }
        else if (awayScore > homeScore) {
            winnerId = matchup.awayTeamId;
        }
        // Update Matchup
        await prisma.matchup.update({
            where: { id: matchupId },
            data: {
                homeScore: Number(homeScore),
                awayScore: Number(awayScore),
                winnerId,
                isFinished: true,
            },
        });
        // Score Picks
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error simulating game' });
    }
};
export const clearSchedule = async (req, res) => {
    try {
        // Also need to clear picks since they depend on matchups
        await prisma.pick.deleteMany();
        await prisma.matchup.deleteMany();
        // Reset user scores
        await prisma.user.updateMany({
            data: { score: 0 }
        });
        res.json({ message: "Schedule and scores cleared successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error clearing schedule" });
    }
};
export const getSettings = async (req, res) => {
    try {
        const settings = await prisma.appSetting.findMany();
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        res.json(settingsMap);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching settings" });
    }
};
export const updateSetting = async (req, res) => {
    try {
        const { key, value } = req.body;
        const setting = await prisma.appSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });
        res.json(setting);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating setting" });
    }
};
export const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                score: true,
                role: true,
                isActive: true,
                createdAt: true
            }
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
};
export const toggleUserStatus = async (req, res) => {
    try {
        const { id, isActive } = req.body;
        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { isActive: Boolean(isActive) }
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating user status" });
    }
};
export const createMatchup = async (req, res) => {
    try {
        const { week, stage, homeTeamId, awayTeamId, startTime } = req.body;
        // 1. Validar límite de 18 juegos por semana
        const count = await prisma.matchup.count({
            where: { week: Number(week), stage }
        });
        if (count >= 18) {
            res.status(400).json({ message: `La semana ${week} ya tiene el máximo de 18 juegos permitidos.` });
            return;
        }
        // 2. Validar que los equipos no tengan otro juego esa misma semana
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
            },
            include: { homeTeam: true, awayTeam: true }
        });
        if (conflict) {
            const teamInConflict = conflict.homeTeamId === Number(homeTeamId) || conflict.awayTeamId === Number(homeTeamId)
                ? "El equipo local"
                : "El equipo visitante";
            res.status(400).json({ message: `${teamInConflict} ya tiene un partido programado para la semana ${week}.` });
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear el partido" });
    }
};
export const updateMatchup = async (req, res) => {
    try {
        const { id, week, stage, homeTeamId, awayTeamId, startTime } = req.body;
        // 1. Validar límite de 18 juegos (excluyendo el actual)
        const count = await prisma.matchup.count({
            where: {
                week: Number(week),
                stage,
                NOT: { id: Number(id) }
            }
        });
        if (count >= 18) {
            res.status(400).json({ message: `La semana ${week} ya tiene 18 juegos.` });
            return;
        }
        // 2. Validar conflictos de equipos (excluyendo el actual)
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
            res.status(400).json({ message: "Uno de los equipos ya tiene un partido programado para esta semana." });
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
    }
    catch (error) {
        res.status(500).json({ message: "Error al actualizar el partido" });
    }
};
export const deleteMatchup = async (req, res) => {
    try {
        const { id } = req.params;
        // Eliminar primero los picks asociados por integridad referencial
        await prisma.pick.deleteMany({ where: { matchupId: Number(id) } });
        await prisma.matchup.delete({ where: { id: Number(id) } });
        res.json({ message: "Partido eliminado correctamente" });
    }
    catch (error) {
        res.status(500).json({ message: "Error al eliminar el partido" });
    }
};
export const updateTeam = async (req, res) => {
    try {
        const { id, name, city, conference, division } = req.body;
        const team = await prisma.team.update({
            where: { id: Number(id) },
            data: {
                name,
                city,
                conference,
                division
            }
        });
        res.json(team);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating team" });
    }
};
//# sourceMappingURL=admin.controller.js.map