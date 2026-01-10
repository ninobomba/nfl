import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('General Data API', () => {
  it('should get all teams', async () => {
    const res = await request(app).get('/api/teams');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should get matchups for week 1', async () => {
    const res = await request(app).get('/api/matchups?week=1');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get current theme', async () => {
    const res = await request(app).get('/api/theme');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('theme');
  });
});
