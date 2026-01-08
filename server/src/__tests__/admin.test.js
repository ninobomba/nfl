import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import prisma from '../prisma.js';
describe('Admin Management API', () => {
    let adminToken;
    let teamA;
    let teamB;
    // Usar una semana alta para evitar conflictos con el seed de la semana 1
    const testWeek = Math.floor(Math.random() * 10) + 2;
    beforeAll(async () => {
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ username: 'admin', password: 'admin' });
        adminToken = loginRes.body.token;
        const teams = await prisma.team.findMany({ take: 2 });
        teamA = teams[0];
        teamB = teams[1];
        // Limpiar posibles conflictos previos
        await prisma.matchup.deleteMany({
            where: { week: testWeek }
        });
    });
    it('should get all users (admin only)', async () => {
        const res = await request(app)
            .get('/api/admin/users')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
    it('should create a new matchup', async () => {
        const res = await request(app)
            .post('/api/admin/matchups')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            week: testWeek,
            stage: 'REGULAR',
            homeTeamId: teamA.id,
            awayTeamId: teamB.id,
            startTime: new Date(Date.now() + 86400000)
        });
        expect(res.status).toBe(200);
        expect(res.body.week).toBe(testWeek);
    });
    it('should update team details', async () => {
        const res = await request(app)
            .post('/api/admin/teams/update')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            id: teamA.id,
            name: teamA.name,
            city: 'Updated City',
            conference: 'AFC',
            division: 'East'
        });
        expect(res.status).toBe(200);
        expect(res.body.city).toBe('Updated City');
    });
    it('should update application theme', async () => {
        const res = await request(app)
            .post('/api/admin/settings')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ key: 'theme', value: 'vela-blue' });
        expect(res.status).toBe(200);
        expect(res.body.value).toBe('vela-blue');
    });
});
//# sourceMappingURL=admin.test.js.map