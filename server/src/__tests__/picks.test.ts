import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import prisma from '../prisma.js';

describe('Picks API', () => {
  let token: string;
  let matchupId: number;
  let teamId: number;

  beforeAll(async () => {
    // 1. Obtener un token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin' });
    token = loginRes.body.token;

    // 2. Obtener un matchup y un equipo para la prueba
    let matchup = await prisma.matchup.findFirst({
        include: { homeTeam: true }
    });
    
    if (matchup) {
        // Asegurarnos de que el matchup no ha expirado para la prueba
        matchup = await prisma.matchup.update({
            where: { id: matchup.id },
            data: { startTime: new Date(new Date().getTime() + 1000000) }
        });
        
        matchupId = matchup.id;
        teamId = matchup.homeTeamId;
    }
  });

  it('should get current user picks', async () => {
    const res = await request(app)
      .get('/api/picks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should make a pick successfully', async () => {
    if (!matchupId) return;

    const res = await request(app)
      .post('/api/picks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        matchupId,
        selectedTeamId: teamId
      });

    expect(res.status).toBe(200);
    expect(res.body.selectedTeamId).toBe(teamId);
  });
});