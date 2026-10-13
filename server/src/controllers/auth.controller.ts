import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth/authService.js';
import { User } from '../models/User.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      });
      return res.status(201).json({
        message: 'Registration successful',
        ...result,
      });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      });
      return res.json({
        message: 'Login successful',
        ...result,
      });
    } catch (err: any) {
      return res.status(401).json({ message: err.message });
    }
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie('token');
    return res.json({ message: 'Logged out successfully' });
  }

  static async me(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      const user = await User.findById(req.user.id).select('-passwordHash');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json({ user });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async changePassword(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      const { currentPassword, newPassword } = req.body;
      await AuthService.changePassword(req.user.id, currentPassword, newPassword);
      return res.json({ message: 'Password changed successfully' });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }
}
