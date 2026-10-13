import { Router } from 'express';
import { GDController } from '../controllers/gd.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.get('/personas', GDController.listPersonas);
router.get('/sessions', authenticate, GDController.listSessions);
router.post('/sessions', authenticate, GDController.createSession);
router.get('/sessions/:id', authenticate, GDController.getSession);
router.post('/sessions/:id/start', authenticate, GDController.startSession);
router.post('/sessions/:id/turn', authenticate, GDController.addTurn);
router.post('/sessions/:id/ai-turn', authenticate, GDController.generateAITurn);
router.post('/sessions/:id/complete', authenticate, GDController.completeSession);
router.get('/sessions/:id/evaluation', authenticate, GDController.getEvaluation);

export default router;
