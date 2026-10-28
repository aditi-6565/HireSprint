import { z } from 'zod';

export const createResourceSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(1, 'Title is required').max(160),
      description: z.string().trim().min(1, 'Description is required').max(500),
      category: z.string().trim().max(80).optional(),
      type: z.enum(['article', 'video', 'guide', 'rubric', 'document']),
      content: z.string().max(20000).optional(),
      url: z.string().url('Enter a valid resource URL').optional(),
    })
    .refine((resource) => Boolean(resource.content?.trim() || resource.url), {
      message: 'Resource content or a resource URL is required',
      path: ['content'],
    }),
});
