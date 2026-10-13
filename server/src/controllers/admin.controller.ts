import { Request, Response } from 'express';
import { User, AuditLog, PlatformSetting } from '../models/index.js';

export class AdminController {
  static async listUsers(req: Request, res: Response) {
    const filter: any = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    const users = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 });
    return res.json({ users });
  }

  static async updateUserRole(req: Request, res: Response) {
    const { role, isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const prevRole = user.role;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    await user.save();

    // Log admin audit
    if (req.user) {
      await AuditLog.create({
        actorId: req.user.id,
        actorName: req.user.name,
        actorEmail: req.user.email,
        action: 'UPDATE_USER_ROLE_OR_STATUS',
        targetType: 'User',
        targetId: user._id.toString(),
        details: { previousRole: prevRole, newRole: user.role, isActive: user.isActive },
      });
    }

    return res.json({ message: 'User updated successfully', user });
  }

  static async listAuditLogs(req: Request, res: Response) {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(50);
    return res.json({ logs });
  }

  static async getSettings(req: Request, res: Response) {
    const settings = await PlatformSetting.find();
    return res.json({ settings });
  }

  static async updateSetting(req: Request, res: Response) {
    const { key, value } = req.body;
    const setting = await PlatformSetting.findOneAndUpdate(
      { key },
      { key, value, updatedBy: req.user?.id },
      { upsert: true, new: true }
    );
    return res.json({ setting });
  }
}
