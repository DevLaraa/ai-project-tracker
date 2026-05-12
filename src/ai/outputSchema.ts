import { z } from 'zod';

const generatedTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(2000)
});

const generatedTaskArraySchema = z.array(generatedTaskSchema).min(1).max(20);

export function parseGeneratedTasks(value: unknown) {
  const parsed = generatedTaskArraySchema.safeParse(value);

  if (!parsed.success) {
    throw new Error('AI response does not match the expected task schema');
  }

  return parsed.data.map((task) => ({
    title: task.title,
    description: task.description,
    status: 'todo' as const
  }));
}
