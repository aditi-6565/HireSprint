import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../../models/User.js';
import { UserRole } from 'hiresprint-shared';

const JWT_SECRET = process.env.JWT_SECRET || 'hiresprint-secure-development-jwt-secret-replace-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
}

export class AuthService {
  static generateToken(user: IUser): string {
    return jwt.sign(
      {
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as any }
    );
  }

  static async register(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    departmentName?: string;
  }): Promise<{ user: Partial<IUser>; token: string }> {
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      role: data.role || 'STUDENT',
      departmentName: data.departmentName || 'Computer Science & Engineering',
      isActive: true,
    });

    const token = this.generateToken(user);
    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentName: user.departmentName,
      },
      token,
    };
  }

  static async login(email: string, password: string): Promise<{ user: Partial<IUser>; token: string }> {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    if (!user.isActive) {
      throw new Error('This account has been deactivated. Please contact your administrator.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    const token = this.generateToken(user);
    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentName: user.departmentName,
      },
      token,
    };
  }

  static async changePassword(userId: string, currentPass: string, newPass: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    const isMatch = await bcrypt.compare(currentPass, user.passwordHash);
    if (!isMatch) {
      throw new Error('Current password is incorrect.');
    }

    user.passwordHash = await bcrypt.hash(newPass, 10);
    await user.save();
  }
}
