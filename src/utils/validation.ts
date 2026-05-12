import type { ZodIssue, ZodType } from 'zod';
import { HttpError } from './httpError';

export type ValidationDetail = {
  field: string;
  message: string;
};

export function formatZodIssues(issues: ZodIssue[]): ValidationDetail[] {
  return issues.map((issue) => ({
    field: issue.path.map((part) => String(part)).join('.') || 'body',
    message: issue.message
  }));
}

export function parseOrThrow<TSchema extends ZodType>(
  schema: TSchema,
  value: unknown
): TSchema['_output'] {
  const parsed = schema.safeParse(value);

  if (!parsed.success) {
    throw new HttpError(400, 'Validation failed', formatZodIssues(parsed.error.issues));
  }

  return parsed.data;
}
