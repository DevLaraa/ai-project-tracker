import { z } from 'zod';

export const generateAndCreateTasksSchema = z.object({
  projectId: z.string().uuid(),
  taskCount: z.number().min(1).max(20).optional()
});
