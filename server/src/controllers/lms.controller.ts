import { Request, Response } from 'express';
import { LMSService } from '../services/lms/lmsService.js';
import { AttendanceRecord } from '../models/index.js';

export class LMSController {
  // Topics
  static async listTopics(req: Request, res: Response) {
    const topics = await LMSService.listTopics(req.query);
    return res.json({ topics });
  }

  static async createTopic(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const topic = await LMSService.createTopic(req.body, req.user.id);
    return res.status(201).json({ topic });
  }

  static async updateTopic(req: Request, res: Response) {
    const topic = await LMSService.updateTopic(req.params.id, req.body);
    return res.json({ topic });
  }

  static async deleteTopic(req: Request, res: Response) {
    await LMSService.deleteTopic(req.params.id);
    return res.json({ message: 'Topic deleted successfully' });
  }

  // Resources
  static async listResources(req: Request, res: Response) {
    const resources = await LMSService.listResources(req.query);
    return res.json({ resources });
  }

  static async createResource(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const resource = await LMSService.createResource(req.body, req.user.id, req.user.name);
    return res.status(201).json({ resource });
  }

  // Assignments
  static async listAssignments(req: Request, res: Response) {
    const assignments = await LMSService.listAssignments(req.user?.id);
    return res.json({ assignments });
  }

  static async createAssignment(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const assignment = await LMSService.createAssignment(req.body, req.user.id);
    return res.status(201).json({ assignment });
  }

  static async submitAssignment(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const submission = await LMSService.submitAssignment(req.params.id, req.user.id, req.body);
    return res.json({ submission });
  }

  // Attendance
  static async listAttendance(req: Request, res: Response) {
    const filter: any = {};
    if (req.query.sessionId) filter.sessionId = req.query.sessionId;
    if (req.user?.role === 'STUDENT') filter.userId = req.user.id;

    const records = await AttendanceRecord.find(filter).sort({ joinTime: -1 });
    return res.json({ attendance: records });
  }

  // Notifications
  static async listNotifications(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const notifications = await LMSService.listNotifications(req.user.id);
    return res.json({ notifications });
  }

  static async markNotificationRead(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const notif = await LMSService.markNotificationRead(req.params.id, req.user.id);
    return res.json({ notification: notif });
  }

  static async markAllNotificationsRead(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    await LMSService.markAllNotificationsRead(req.user.id);
    return res.json({ message: 'All notifications marked as read' });
  }
}
