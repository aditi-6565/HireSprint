import mongoose, { Schema, Document } from 'mongoose';

export interface IGDParticipant extends Document {
  sessionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userRole: string;
  role: 'host' | 'moderator' | 'speaker' | 'observer';
  isMuted: boolean;
  isVideoOn: boolean;
  hasRaisedHand: boolean;
  speakingSeconds: number;
  joinedAt: Date;
  leftAt?: Date;
  socketId?: string;
}

const GDParticipantSchema = new Schema<IGDParticipant>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'GDSession', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName: { type: String, required: true },
    userRole: { type: String, default: 'STUDENT' },
    role: { type: String, enum: ['host', 'moderator', 'speaker', 'observer'], default: 'speaker' },
    isMuted: { type: Boolean, default: false },
    isVideoOn: { type: Boolean, default: true },
    hasRaisedHand: { type: Boolean, default: false },
    speakingSeconds: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date },
    socketId: { type: String },
  },
  { timestamps: true }
);

GDParticipantSchema.index({ sessionId: 1, userId: 1 }, { unique: true });

export const GDParticipant = mongoose.model<IGDParticipant>('GDParticipant', GDParticipantSchema);
