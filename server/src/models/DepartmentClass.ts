import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartmentClass extends Document {
  name: string;
  code: string;
  department: string;
  year: number;
  academicYear: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentClassSchema = new Schema<IDepartmentClass>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    department: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    academicYear: { type: String, default: '2025-2026' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const DepartmentClass = mongoose.model<IDepartmentClass>('DepartmentClass', DepartmentClassSchema);
