import { z } from 'zod';

export const createStaffUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    email: z.string().trim().email('Valid email address is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['TEACHER', 'STUDENT_COORDINATOR']),
    departmentName: z.string().trim().max(120, 'Department name must be 120 characters or fewer').optional(),
  }),
});
