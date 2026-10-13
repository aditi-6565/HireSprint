import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from 'hiresprint-shared';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  departmentId?: mongoose.Types.ObjectId;
  departmentName?: string;
  avatar?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['STUDENT', 'ADMIN', 'TEACHER', 'TNP', 'STUDENT_COORDINATOR'],
      default: 'STUDENT',
      index: true,
    },
    isActive: { type: Boolean, default: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'DepartmentClass' },
    departmentName: { type: String, default: 'Computer Science & Engineering' },
    avatar: { type: String },
    phone: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
