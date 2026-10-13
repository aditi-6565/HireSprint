import mongoose, { Schema, Document } from 'mongoose';

export interface ILearningResource extends Document {
  title: string;
  description: string;
  category: string;
  type: 'article' | 'video' | 'guide' | 'rubric' | 'document';
  content?: string;
  url?: string;
  authorId?: mongoose.Types.ObjectId;
  authorName?: string;
  isPublished: boolean;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const LearningResourceSchema = new Schema<ILearningResource>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, default: 'GD Skills', index: true },
    type: {
      type: String,
      enum: ['article', 'video', 'guide', 'rubric', 'document'],
      default: 'guide',
    },
    content: { type: String },
    url: { type: String },
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },
    authorName: { type: String, default: 'Placement Faculty' },
    isPublished: { type: Boolean, default: true, index: true },
    viewsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const LearningResource = mongoose.model<ILearningResource>('LearningResource', LearningResourceSchema);
