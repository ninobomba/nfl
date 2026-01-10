import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import prisma from '../prisma.js';

describe('Auth & Recovery API', () => {
  const randomSuffix = Math.floor(Math.random() * 10000);
  const testUser = {
    username: `tester${randomSuffix}`,
    email: `tester${randomSuffix}@nfl.com`,
    password: 'password123',
    lang: 'en'
  };

  beforeAll(async () => {
    // No limpiar todo, solo asegurar que este específico no exista
    await prisma.user.deleteMany({
      where: { OR: [{ username: testUser.username }, { email: testUser.email }] }
    });
  });

  it('should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: testUser.username, password: testUser.password });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.username).toBe(testUser.username);
  });

  it('should fail login with invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: testUser.username, password: 'wrongpassword' });
    
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('INVALID_CREDENTIALS');
  });

  it('should request a password reset key', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: testUser.email, lang: 'en' });
    
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('RESET_KEY_SENT');

    const resetRecord = await prisma.passwordReset.findFirst({
        where: { user: { email: testUser.email } }
    });
    expect(resetRecord).not.toBeNull();
    expect(resetRecord?.key).toHaveLength(6);
  });

  it('should reset password with valid key', async () => {
    const resetRecord = await prisma.passwordReset.findFirst({
        where: { user: { email: testUser.email } },
        orderBy: { createdAt: 'desc' }
    });
    
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({
        email: testUser.email,
        key: resetRecord?.key,
        newPassword: 'newpassword456'
      });
    
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('PASSWORD_RESET_SUCCESS');
  });
});
