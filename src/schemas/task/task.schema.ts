import { z } from 'zod';

const taskStatusSchema = z.enum(['todo', 'in_progress', 'done']);
const taskTitleSchema = z.string().trim().min(1).max(200);
const taskDescriptionSchema = z.string().trim().max(2000);
const uuidSchema = z.string().uuid();

export const createTaskBodySchema = z.object({
  projectId: uuidSchema,
  title: taskTitleSchema,
  description: taskDescriptionSchema.optional(),
  status: taskStatusSchema.optional(),
  assignedUserId: uuidSchema.optional(),
  dueDate: z.string().datetime().optional()
});

export const updateTaskBodySchema = z
  .object({
    projectId: uuidSchema.optional(),
    title: taskTitleSchema.optional(),
    description: taskDescriptionSchema.optional(),
    status: taskStatusSchema.optional(),
    assignedUserId: z.union([uuidSchema, z.null()]).optional(),
    dueDate: z.union([z.string().datetime(), z.null()]).optional()
  })
  .refine(
    (value) =>
      value.projectId !== undefined ||
      value.title !== undefined ||
      value.description !== undefined ||
      value.status !== undefined ||
      value.assignedUserId !== undefined ||
      value.dueDate !== undefined,
    { message: 'At least one field must be provided' }
  );

export const taskIdParamSchema = z.object({
  id: uuidSchema
});

export const listTasksQuerySchema = z.object({
  projectId: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => (Array.isArray(val) ? val[0] : val))
    .refine((value) => uuidSchema.safeParse(value).success, {
      message: 'Invalid UUID'
    })
    .optional()
});

export type CreateTaskBody = z.infer<typeof createTaskBodySchema>;
export type UpdateTaskBody = z.infer<typeof updateTaskBodySchema>;
export type TaskIdParam = z.infer<typeof taskIdParamSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;

