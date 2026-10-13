import mongoose, { Schema, Document } from 'mongoose';
import { EvaluationRubric } from 'hiresprint-shared';

export interface IEvaluation extends Document {
  sessionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  topicTitle: string;
  evaluatorSource: 'ai' | 'teacher';
  rubric: EvaluationRubric;
  teacherNotes?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EvidenceItemSchema = new Schema({
  quote: { type: String, required: true },
  context: { type: String, default: '' },
  feedback: { type: String, required: true },
}, { _id: false });

const EvaluationRubricSchema = new Schema<EvaluationRubric>({
  clarityOfExpression: { type: Number, required: true, min: 0, max: 100 },
  topicRelevance: { type: Number, required: true, min: 0, max: 100 },
  logicalStructure: { type: Number, required: true, min: 0, max: 100 },
  supportingArguments: { type: Number, required: true, min: 0, max: 100 },
  activeListening: { type: Number, required: true, min: 0, max: 100 },
  respectfulDisagreement: { type: Number, required: true, min: 0, max: 100 },
  teamworkAndCollaboration: { type: Number, required: true, min: 0, max: 100 },
  participationBalance: { type: Number, required: true, min: 0, max: 100 },
  overallScore: { type: Number, required: true, min: 0, max: 100 },
  strengths: [{ type: String }],
  areasOfImprovement: [{ type: String }],
  actionableTips: [{ type: String }],
  evidenceExamples: [EvidenceItemSchema],
}, { _id: false });

const EvaluationSchema = new Schema<IEvaluation>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'GDSession', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName: { type: String, required: true },
    topicTitle: { type: String, required: true },
    evaluatorSource: { type: String, enum: ['ai', 'teacher'], default: 'ai' },
    rubric: { type: EvaluationRubricSchema, required: true },
    teacherNotes: { type: String },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

EvaluationSchema.index({ userId: 1, createdAt: -1 });

export const Evaluation = mongoose.model<IEvaluation>('Evaluation', EvaluationSchema);
