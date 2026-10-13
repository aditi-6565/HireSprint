import { Request, Response } from 'express';
import { GDSessionService } from '../services/gd/gdSessionService.js';
import { GDSession, Evaluation, GDParticipant } from '../models/index.js';
import { AI_PERSONAS } from 'hiresprint-shared';

export class GDController {
  static async listPersonas(req: Request, res: Response) {
    return res.json({ personas: Object.values(AI_PERSONAS) });
  }

  static async createSession(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const session = await GDSessionService.createSession({
        ...req.body,
        creatorId: req.user.id,
      });
      return res.status(201).json({ session });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  static async listSessions(req: Request, res: Response) {
    try {
      const filter: any = {};
      if (req.query.type) filter.sessionType = req.query.type;
      if (req.query.status) filter.status = req.query.status;

      // Students see their sessions or public live sessions
      const sessions = await GDSession.find(filter).sort({ scheduledAt: -1 }).limit(30);
      return res.json({ sessions });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async getSession(req: Request, res: Response) {
    try {
      const details = await GDSessionService.getSessionDetails(req.params.id);
      return res.json(details);
    } catch (err: any) {
      return res.status(404).json({ message: err.message });
    }
  }

  static async startSession(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const session = await GDSessionService.startSession(req.params.id, req.user.id);
      return res.json({ session });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  static async addTurn(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const { text, source } = req.body;
      const segment = await GDSessionService.addTranscriptTurn(
        req.params.id,
        req.user.id,
        req.user.name,
        text,
        source
      );
      return res.json({ segment });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  static async generateAITurn(req: Request, res: Response) {
    try {
      const result = await GDSessionService.generateNextAIPersonaTurn(
        req.params.id,
        req.body?.personaId
      );
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  static async completeSession(req: Request, res: Response) {
    try {
      const result = await GDSessionService.completeSession(req.params.id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  static async getEvaluation(req: Request, res: Response) {
    try {
      const evaluation = await Evaluation.findOne({
        sessionId: req.params.id,
        ...(req.user?.role === 'STUDENT' ? { userId: req.user.id } : {}),
      });
      if (!evaluation) return res.status(404).json({ message: 'Evaluation not found' });
      return res.json({ evaluation });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }
}
