import { Request, Response } from 'express';
import { LMSService } from '../services/lms/lmsService.js';
import { Evaluation, AttendanceRecord, GDSession } from '../models/index.js';

export class AnalyticsController {
  static async getStudentAnalytics(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const data = await LMSService.getStudentAnalytics(req.user.id);
    return res.json(data);
  }

  static async getTnPAnalytics(req: Request, res: Response) {
    const data = await LMSService.getTnPAnalytics();
    return res.json(data);
  }

  static async getAdminAnalytics(req: Request, res: Response) {
    const data = await LMSService.getAdminAnalytics();
    return res.json(data);
  }

  static async exportTnPReportCSV(req: Request, res: Response) {
    try {
      const evaluations = await Evaluation.find().sort({ createdAt: -1 });

      let csv = 'Candidate Name,Topic,Overall Score,Clarity,Relevance,Structure,Evidence,Listening,Disagreement,Teamwork,Participation,Date\n';

      for (const e of evaluations) {
        const r = e.rubric;
        const line = [
          `"${e.userName.replace(/"/g, '""')}"`,
          `"${e.topicTitle.replace(/"/g, '""')}"`,
          r.overallScore,
          r.clarityOfExpression,
          r.topicRelevance,
          r.logicalStructure,
          r.supportingArguments,
          r.activeListening,
          r.respectfulDisagreement,
          r.teamworkAndCollaboration,
          r.participationBalance,
          new Date(e.createdAt).toISOString().split('T')[0],
        ].join(',');
        csv += line + '\n';
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="hiresprint-placement-report.csv"');
      return res.status(200).send(csv);
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }
}
