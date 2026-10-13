import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  title: string;
  instructions: string;
  topicId?: mongoose.Types.ObjectId;
  assignedClasses: mongoose.Types.ObjectId[];
  dueDate: Date;
  createdBy: mongoose.Types.ObjectId;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    instructions: { type: String, required: true },
    topicId: { type: Schema.Types.ObjectId, ref: 'GDTopic' },
    assignedClasses: [{ type: Schema.Types.ObjectId, ref: 'DepartmentClass' }],
    dueDate: { type: Date, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
