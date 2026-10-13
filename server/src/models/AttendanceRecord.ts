import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendanceRecord extends Document {
  sessionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  joinTime: Date;
  leaveTime?: Date;
  durationSeconds: number;
  status: 'PRESENT' | 'ABSENT' | 'PARTIAL';
  correctedBy?: mongoose.Types.ObjectId;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'GDSession', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    joinTime: { type: Date, default: Date.now },
    leaveTime: { type: Date },
    durationSeconds: { type: Number, default: 0 },
    status: { type: String, enum: ['PRESENT', 'ABSENT', 'PARTIAL'], default: 'PRESENT' },
    correctedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    remarks: { type: String },
  },
  { timestamps: true }
);

AttendanceRecordSchema.index({ sessionId: 1, userId: 1 }, { unique: true });

export const AttendanceRecord = mongoose.model<IAttendanceRecord>('AttendanceRecord', AttendanceRecordSchema);
