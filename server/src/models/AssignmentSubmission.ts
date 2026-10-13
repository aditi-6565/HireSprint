import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignmentSubmission extends Document {
  assignmentId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  sessionId?: mongoose.Types.ObjectId;
  reflectionNotes: string;
  status: 'submitted' | 'reviewed';
  score?: number;
  teacherFeedback?: string;
  submittedAt: Date;
  reviewedAt?: Date;
}

const AssignmentSubmissionSchema = new Schema<IAssignmentSubmission>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'GDSession' },
    reflectionNotes: { type: String, default: '' },
    status: { type: String, enum: ['submitted', 'reviewed'], default: 'submitted' },
    score: { type: Number },
    teacherFeedback: { type: String },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

AssignmentSubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

export const AssignmentSubmission = mongoose.model<IAssignmentSubmission>('AssignmentSubmission', AssignmentSubmissionSchema);
