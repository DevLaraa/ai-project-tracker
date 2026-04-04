import { z } from 'zod';

const projectName = z.string().trim().min(1).max(200);
const projectDescription = z.string().trim().max(2000);

export const createProjectBodySchema = z.object({
  name: projectName,
  description: projectDescription.optional()
});

export const updateProjectBodySchema = z
  .object({
    name: projectName.optional(),
    description: projectDescription.optional()
  })
  .refine((value) => value.name !== undefined || value.description !== undefined, {
    message: 'At least one field must be provided'
  });

export const projectIdParamSchema = z.object({
  id: z.string().uuid()
});

export type CreateProjectBody = z.infer<typeof createProjectBodySchema>;
export type UpdateProjectBody = z.infer<typeof updateProjectBodySchema>;
export type ProjectIdParam = z.infer<typeof projectIdParamSchema>;

