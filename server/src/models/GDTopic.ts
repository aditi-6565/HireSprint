import mongoose, { Schema, Document } from 'mongoose';

export interface IGDTopic extends Document {
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  learningObjectives: string[];
  preparationGuide: string;
  rules: string[];
  isPublished: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const GDTopicSchema = new Schema<IGDTopic>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, default: 'Technology & Society', index: true },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    learningObjectives: [{ type: String }],
    preparationGuide: { type: String, default: '' },
    rules: [{ type: String }],
    isPublished: { type: Boolean, default: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const GDTopic = mongoose.model<IGDTopic>('GDTopic', GDTopicSchema);
