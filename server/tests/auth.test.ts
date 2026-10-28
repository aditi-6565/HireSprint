import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';

describe('Auth & Role Authorization API Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('GET /api/v1/health should return ok status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('HireSprint Backend API');
  });

  it('POST /api/v1/auth/register should create a new student account', async () => {
    const testEmail = `teststudent_${Date.now()}@hiresprint.local`;
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test Student',
        email: testEmail,
        password: 'Password@123',
        role: 'STUDENT',
      });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.user.role).toBe('STUDENT');
  });

  it('POST /api/v1/auth/login should authenticate user with correct credentials', async () => {
    const testEmail = `login_${Date.now()}@hiresprint.local`;
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Login Test',
        email: testEmail,
        password: 'Password@123',
        role: 'TEACHER',
      });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: 'Password@123',
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();
    expect(loginRes.body.user.role).toBe('TEACHER');
  });

  it('GET /api/v1/auth/me should return current user profile when token is valid', async () => {
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Me Profile User',
        email: `me_${Date.now()}@hiresprint.local`,
        password: 'Password@123',
        role: 'STUDENT',
      });

    const token = regRes.body.token;

    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.name).toBe('Me Profile User');
    expect(meRes.body.user.role).toBe('STUDENT');
  });

  it('Should reject protected admin routes for student users', async () => {
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Regular Student',
        email: `regstudent_${Date.now()}@hiresprint.local`,
        password: 'Password@123',
        role: 'STUDENT',
      });

    const token = regRes.body.token;

    const adminRes = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${token}`);

    expect(adminRes.status).toBe(403);
    expect(adminRes.body.message).toContain('Access denied');
  });

  it('POST /api/v1/admin/users should create teacher and coordinator accounts for admins', async () => {
    const adminRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Staff Admin',
        email: `staffadmin_${Date.now()}@hiresprint.local`,
        password: 'Password@123',
        role: 'ADMIN',
      });
    const token = adminRes.body.token;

    for (const role of ['TEACHER', 'STUDENT_COORDINATOR']) {
      const email = `${role.toLowerCase()}_${Date.now()}@hiresprint.local`;
      const createRes = await request(app)
        .post('/api/v1/admin/users')
        .set('Cookie', 'token=' + token)
        .send({
          name: `Test ${role}`,
          email,
          password: 'Password@123',
          role,
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.user.email).toBe(email);
      expect(createRes.body.user.role).toBe(role);
      expect(createRes.body.user.passwordHash).toBeUndefined();
    }
  });

  it('POST /api/v1/admin/users should reject non-admins and roles outside teacher/coordinator', async () => {
    const studentRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Staff Creation Student',
        email: `staffstudent_${Date.now()}@hiresprint.local`,
        password: 'Password@123',
        role: 'STUDENT',
      });
    const studentToken = studentRes.body.token;

    const deniedRes = await request(app)
      .post('/api/v1/admin/users')
      .set('Cookie', 'token=' + studentToken)
      .send({
        name: 'Unauthorized Teacher',
        email: `unauthorized_${Date.now()}@hiresprint.local`,
        password: 'Password@123',
        role: 'TEACHER',
      });
    expect(deniedRes.status).toBe(403);

    const adminRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Role Validation Admin',
        email: `roleadmin_${Date.now()}@hiresprint.local`,
        password: 'Password@123',
        role: 'ADMIN',
      });
    const adminToken = adminRes.body.token;

    const invalidRoleRes = await request(app)
      .post('/api/v1/admin/users')
      .set('Cookie', 'token=' + adminToken)
      .send({
        name: 'Invalid Staff Role',
        email: `invalidrole_${Date.now()}@hiresprint.local`,
        password: 'Password@123',
        role: 'ADMIN',
      });
    expect(invalidRoleRes.status).toBe(400);
    expect(studentRes.body.token).toBeDefined();
    expect(adminRes.body.token).toBeDefined();
  });
});
