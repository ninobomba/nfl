import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import prisma from '../prisma.js';

describe('Data & Standings API', () => {
  let userToken: string;
  let testMatchup: any;
  let testTeam: any;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test', password: 'test' });
    userToken = loginRes.body.token;

    testMatchup = await prisma.matchup.findFirst({
        where: { week: 1 }
    });
    testTeam = await prisma.team.findFirst({
        where: { id: testMatchup.homeTeamId }
    });
  });

  it('should get my picks', async () => {
    const res = await request(app)
      .get('/api/picks')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should make a pick', async () => {
    const res = await request(app)
      .post('/api/picks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        matchupId: testMatchup.id,
        selectedTeamId: testTeam.id
      });
    
    expect(res.status).toBe(200);
    expect(res.body.selectedTeamId).toBe(testTeam.id);
  });

  it('should get calculated standings', async () => {
    const res = await request(app)
      .get('/api/standings')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Verificar que un objeto de la lista tenga propiedades de stats
    if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('wins');
        expect(res.body[0]).toHaveProperty('pct');
    }
  });

  it('should get global leaderboard', async () => {
    const res = await request(app)
      .get('/api/picks/leaderboard')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get weekly leaderboard for week 1', async () => {
    const res = await request(app)
      .get('/api/picks/weekly?week=1')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
