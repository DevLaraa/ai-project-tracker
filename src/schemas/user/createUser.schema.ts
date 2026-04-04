import { z } from 'zod';
import type { CreateUserInput } from '../../models/User';
import { passwordSchema } from '../common/password.schema';

export const createUserBodySchema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().min(1).max(200),
  password: passwordSchema
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;

// Compile-time check that schema-derived type matches domain contract.
type _CreateUserBodyMatchesDomain = CreateUserBody extends CreateUserInput ? true : never;

