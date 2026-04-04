import { z } from 'zod';
import type { UserId } from '../../models/User';

export const userIdParamSchema = z.object({
  id: z.string().uuid()
});

export type UserIdParam = z.infer<typeof userIdParamSchema>;

// Compile-time check that schema-derived type matches domain contract.
type _UserIdMatchesDomain = UserIdParam['id'] extends UserId ? true : never;

