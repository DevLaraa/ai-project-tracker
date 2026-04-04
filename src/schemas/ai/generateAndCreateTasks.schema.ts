import { z } from "zod";

export const generateAndCreateTasksSchema = z.object({
  projectId: z.string().uuid(),
  projectName: z.string().min(1),
  projectDescription: z.string().optional(),
  taskCount: z.number().min(1).max(20).optional()
});