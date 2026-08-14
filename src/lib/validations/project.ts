import { z } from 'zod';

export const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters').trim(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description cannot exceed 5000 characters').trim(),
  max_members: z.number().int().min(1, 'Project must have at least 1 member').max(20, 'Project cannot have more than 20 members'),
  skills: z.array(z.string().uuid('Invalid skill ID')),
  roles: z.array(z.string().uuid('Invalid role ID')),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
