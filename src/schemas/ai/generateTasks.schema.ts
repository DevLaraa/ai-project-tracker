import { z } from 'zod';

export const generateTasksBodySchema = z.object({
  projectName: z.string().trim().min(1).max(200),
  projectDescription: z.string().trim().max(2000).optional(),
  goals: z.array(z.string().trim().min(1).max(300)).max(20).optional(),
  constraints: z.array(z.string().trim().min(1).max(300)).max(20).optional(),
  taskCount: z.number().int().min(1).max(20).optional()
});

export type GenerateTasksBody = z.infer<typeof generateTasksBodySchema>;

