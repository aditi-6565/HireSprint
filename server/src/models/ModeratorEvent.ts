import mongoose, { Schema, Document } from 'mongoose';

export interface IModeratorEvent extends Document {
  sessionId: mongoose.Types.ObjectId;
  eventType: 'intro' | 'rule' | 'prompt' | 'warning' | 'summary' | 'intervention';
  message: string;
  targetUserId?: string;
  targetUserName?: string;
  timestamp: Date;
}

const ModeratorEventSchema = new Schema<IModeratorEvent>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'GDSession', required: true, index: true },
    eventType: {
      type: String,
      enum: ['intro', 'rule', 'prompt', 'warning', 'summary', 'intervention'],
      required: true,
    },
    message: { type: String, required: true },
    targetUserId: { type: String },
    targetUserName: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const ModeratorEvent = mongoose.model<IModeratorEvent>('ModeratorEvent', ModeratorEventSchema);
