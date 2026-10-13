import mongoose, { Schema, Document } from 'mongoose';
import { SessionType, SessionState } from 'hiresprint-shared';

export interface IGDSession extends Document {
  title: string;
  topicId?: mongoose.Types.ObjectId;
  topicTitle: string;
  sessionType: SessionType;
  status: SessionState;
  creatorId: mongoose.Types.ObjectId;
  creatorName?: string;
  scheduledAt: Date;
  durationMinutes: number;
  maxParticipants: number;
  moderationMode: 'TEXT' | 'SPOKEN';
  selectedPersonas: string[];
  joinCode: string;
  startedAt?: Date;
  endedAt?: Date;
  activeSpeaker?: string;
  timeRemainingSeconds?: number;
  createdAt: Date;
  updatedAt: Date;
}

const GDSessionSchema = new Schema<IGDSession>(
  {
    title: { type: String, required: true, trim: true },
    topicId: { type: Schema.Types.ObjectId, ref: 'GDTopic' },
    topicTitle: { type: String, required: true },
    sessionType: { type: String, enum: ['AI_PRACTICE', 'LIVE_GD'], required: true, index: true },
    status: {
      type: String,
      enum: ['CREATED', 'READY', 'ACTIVE', 'PAUSED', 'EVALUATING', 'COMPLETED', 'CANCELLED'],
      default: 'READY',
      index: true,
    },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    creatorName: { type: String },
    scheduledAt: { type: Date, default: Date.now },
    durationMinutes: { type: Number, default: 10 },
    maxParticipants: { type: Number, default: 6 },
    moderationMode: { type: String, enum: ['TEXT', 'SPOKEN'], default: 'TEXT' },
    selectedPersonas: [{ type: String }],
    joinCode: { type: String, default: () => Math.random().toString(36).substring(2, 8).toUpperCase() },
    startedAt: { type: Date },
    endedAt: { type: Date },
    activeSpeaker: { type: String },
    timeRemainingSeconds: { type: Number },
  },
  { timestamps: true }
);

GDSessionSchema.index({ status: 1, scheduledAt: 1 });

export const GDSession = mongoose.model<IGDSession>('GDSession', GDSessionSchema);
