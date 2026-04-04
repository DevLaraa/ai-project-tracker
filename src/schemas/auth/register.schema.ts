import { z } from 'zod';
import { passwordSchema } from '../common/password.schema';

export const registerBodySchema = z.object({
  email: z.string().trim().email(),
  password: passwordSchema,
  name: z.string().trim().min(1).max(200).optional()
});
