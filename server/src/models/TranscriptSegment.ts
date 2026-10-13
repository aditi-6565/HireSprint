import mongoose, { Schema, Document } from 'mongoose';

export interface ITranscriptSegment extends Document {
  sessionId: mongoose.Types.ObjectId;
  speakerId: string;
  speakerName: string;
  isAi: boolean;
  personaId?: string;
  text: string;
  timestamp: Date;
  sequence: number;
  source: 'live_speech' | 'typed_input' | 'ai_generated';
  isFinal: boolean;
  durationSeconds?: number;
}

const TranscriptSegmentSchema = new Schema<ITranscriptSegment>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'GDSession', required: true, index: true },
    speakerId: { type: String, required: true },
    speakerName: { type: String, required: true },
    isAi: { type: Boolean, default: false },
    personaId: { type: String },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    sequence: { type: Number, required: true },
    source: { type: String, enum: ['live_speech', 'typed_input', 'ai_generated'], default: 'typed_input' },
    isFinal: { type: Boolean, default: true },
    durationSeconds: { type: Number, default: 0 },
  },
  { timestamps: true }
);

TranscriptSegmentSchema.index({ sessionId: 1, sequence: 1 });

export const TranscriptSegment = mongoose.model<ITranscriptSegment>('TranscriptSegment', TranscriptSegmentSchema);
