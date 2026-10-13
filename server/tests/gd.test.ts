import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';

describe('Group Discussion Engine Tests', () => {
  let authToken = '';
  let userId = '';

  beforeAll(async () => {
    await connectDB();
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'GD Test User',
        email: `gduser_${Date.now()}@hiresprint.local`,
        password: 'Password@123',
        role: 'STUDENT',
      });
    authToken = res.body.token;
    userId = res.body.user._id;
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('GET /api/v1/gd/personas should return all configured AI personas', async () => {
    const res = await request(app).get('/api/v1/gd/personas');
    expect(res.status).toBe(200);
    expect(res.body.personas).toBeDefined();
    expect(res.body.personas.length).toBeGreaterThanOrEqual(4);
    expect(res.body.personas.some((p: any) => p.id === 'confident_communicator')).toBe(true);
  });

  it('POST /api/v1/gd/sessions should create an AI Practice session with initial moderator statement', async () => {
    const res = await request(app)
      .post('/api/v1/gd/sessions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'AI Practice on Automation',
        topicTitle: 'Is AI Replacing Entry Level Engineers?',
        sessionType: 'AI_PRACTICE',
        durationMinutes: 10,
        selectedPersonas: ['confident_communicator', 'analytical_thinker'],
      });

    expect(res.status).toBe(201);
    expect(res.body.session).toBeDefined();
    expect(res.body.session.status).toBe('READY');
    expect(res.body.session.sessionType).toBe('AI_PRACTICE');

    const sessionId = res.body.session._id;

    // Check details has transcript with intro moderator statement
    const detailRes = await request(app)
      .get(`/api/v1/gd/sessions/${sessionId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.transcript.length).toBeGreaterThanOrEqual(1);
    expect(detailRes.body.transcript[0].speakerName).toBe('AI Moderator');
  });

  it('POST /api/v1/gd/sessions/:id/turn and ai-turn should progress turn-taking', async () => {
    // Create session
    const createRes = await request(app)
      .post('/api/v1/gd/sessions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Turn Taking Test',
        topicTitle: 'Remote vs Hybrid Work',
        sessionType: 'AI_PRACTICE',
      });
    const sessionId = createRes.body.session._id;

    // Add student turn
    const studentTurnRes = await request(app)
      .post(`/api/v1/gd/sessions/${sessionId}/turn`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        text: 'I believe hybrid models provide the optimal balance between productivity and in-person collaboration.',
        source: 'typed_input',
      });
    expect(studentTurnRes.status).toBe(200);
    expect(studentTurnRes.body.segment.text).toContain('hybrid models');

    // Generate AI persona turn
    const aiTurnRes = await request(app)
      .post(`/api/v1/gd/sessions/${sessionId}/ai-turn`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        personaId: 'analytical_thinker',
      });
    expect(aiTurnRes.status).toBe(200);
    expect(aiTurnRes.body.segment.isAi).toBe(true);
    expect(aiTurnRes.body.persona.id).toBe('analytical_thinker');

    // Complete session and verify multi-dimensional evaluation
    const completeRes = await request(app)
      .post(`/api/v1/gd/sessions/${sessionId}/complete`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(completeRes.status).toBe(200);
    expect(completeRes.body.session.status).toBe('COMPLETED');
    expect(completeRes.body.evaluations.length).toBeGreaterThanOrEqual(1);

    const rubric = completeRes.body.evaluations[0].rubric;
    expect(rubric.overallScore).toBeGreaterThanOrEqual(40);
    expect(rubric.clarityOfExpression).toBeDefined();
    expect(rubric.topicRelevance).toBeDefined();
    expect(rubric.strengths.length).toBeGreaterThan(0);
  });
});
