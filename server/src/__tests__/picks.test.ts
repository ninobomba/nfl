import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import prisma from '../prisma.js';

describe('Data & Standings API', () => {
  let userToken: string;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin' });
    userToken = loginRes.body.token;
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
