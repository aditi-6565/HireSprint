import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';

describe('LMS Subsystem Tests', () => {
  let teacherToken = '';
  let tnpToken = '';
  let studentToken = '';

  beforeAll(async () => {
    await connectDB();
    const teacherRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'LMS Teacher',
        email: `lmsteacher_${Date.now()}@hiresprint.local`,
        password: 'Password@123',
        role: 'TEACHER',
      });
    teacherToken = teacherRes.body.token;

    const tnpRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'LMS TnP User',
        email: `lmstnp_${Date.now()}@hiresprint.local`,
        password: 'Password@123',
        role: 'TNP',
      });
    tnpToken = tnpRes.body.token;

    const studentRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'LMS Student',
        email: `lmsstudent_${Date.now()}@hiresprint.local`,
        password: 'Password@123',
        role: 'STUDENT',
      });
    studentToken = studentRes.body.token;
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('GET /api/v1/lms/topics should return list of GD topics', async () => {
    const res = await request(app).get('/api/v1/lms/topics');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.topics)).toBe(true);
  });

  it('POST /api/v1/lms/topics should allow teachers to create a new topic', async () => {
    const res = await request(app)
      .post('/api/v1/lms/topics')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Cybersecurity In Cloud Infrastructure',
        description: 'Analyzing zero-trust security postures versus perimeter defenses.',
        category: 'Technology & Placement',
        difficulty: 'Advanced',
        learningObjectives: ['Zero trust architecture', 'Cloud security'],
      });

    expect(res.status).toBe(201);
    expect(res.body.topic.title).toBe('Cybersecurity In Cloud Infrastructure');
  });

  it('POST /api/v1/lms/resources should allow teachers and TnP users and reject students', async () => {
    for (const token of [teacherToken, tnpToken]) {
      const res = await request(app)
        .post('/api/v1/lms/resources')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Placement Interview Preparation',
          description: 'A practical resource for interview preparation.',
          category: 'Placement',
          type: 'guide',
          content: 'Research the organization and practice concise responses.',
        });

      expect(res.status).toBe(201);
      expect(res.body.resource.title).toBe('Placement Interview Preparation');
    }

    const deniedRes = await request(app)
      .post('/api/v1/lms/resources')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Student Resource',
        description: 'Students cannot publish resources.',
        type: 'guide',
        content: 'This request should be denied.',
      });

    expect(deniedRes.status).toBe(403);
  });

  it('POST /api/v1/lms/assignments should create an assignment and notify students', async () => {
    const res = await request(app)
      .post('/api/v1/lms/assignments')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Weekly GD Assignment: Cloud Security',
        instructions: 'Participate in one 10-minute session and submit your reflection notes.',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      });

    expect(res.status).toBe(201);
    expect(res.body.assignment.title).toBe('Weekly GD Assignment: Cloud Security');

    // Student should now have a notification
    const notifRes = await request(app)
      .get('/api/v1/lms/notifications')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(notifRes.status).toBe(200);
    expect(notifRes.body.notifications.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/v1/analytics/student should return personalized student analytics', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/student')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.readinessScore).toBeDefined();
    expect(res.body.latestRubric).toBeDefined();
    expect(res.body.attendanceRate).toBeDefined();
  });
});
