import type { Request, Response } from 'express';
import prisma from '../prisma.js';

export const getStandings = async (req: Request, res: Response) => {
  try {
    const teams = await prisma.team.findMany();
    const matchups = await prisma.matchup.findMany({
      where: { isFinished: true },
    });

    const standings = teams.map((team) => {
      const stats = {
        id: team.id,
        name: team.name,
        city: team.city,
        abbreviation: team.abbreviation,
        logoUrl: team.logoUrl,
        conference: team.conference,
        division: team.division,
        wins: 0,
        losses: 0,
        ties: 0,
        pointsFor: 0,
        pointsAgainst: 0,
      };

      matchups.forEach((m) => {
        if (m.homeTeamId === team.id) {
          stats.pointsFor += m.homeScore || 0;
          stats.pointsAgainst += m.awayScore || 0;
          if (m.winnerId === team.id) stats.wins++;
          else if (m.winnerId === null) stats.ties++;
          else stats.losses++;
        } else if (m.awayTeamId === team.id) {
          stats.pointsFor += m.awayScore || 0;
          stats.pointsAgainst += m.homeScore || 0;
          if (m.winnerId === team.id) stats.wins++;
          else if (m.winnerId === null) stats.ties++;
          else stats.losses++;
        }
      });

      const totalGames = stats.wins + stats.losses + stats.ties;
      const pct = totalGames > 0 ? (stats.wins + 0.5 * stats.ties) / totalGames : 0;

      return {
        ...stats,
        pct: pct.toFixed(3),
        diff: stats.pointsFor - stats.pointsAgainst,
      };
    });

    res.json(standings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching standings' });
  }
};
