import type { NextFunction, Request, Response } from 'express';
import { generateTasksBodySchema } from '../schemas/ai';
import type { AiService } from '../services/AiService';
import { asyncHandler } from '../utils/asyncHandler';
import { HttpError } from '../utils/httpError';
import { generateAndCreateTasksSchema } from '../schemas/ai/generateAndCreateTasks.schema';

function toValidationDetails(issues: { path: PropertyKey[]; message: string }[]) {
  return issues.map((issue) => ({
    field: issue.path.map((part) => String(part)).join('.') || 'body',
    message: issue.message
  }));
}

export class AiController {
  constructor(private readonly aiService: AiService) {}

  public generateTasks = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const parsed = generateTasksBodySchema.safeParse(req.body);
      if (!parsed.success) {
        throw new HttpError(
          400,
          'Validation failed',
          toValidationDetails(parsed.error.issues)
        );
      }

      const result = await this.aiService.generateTasks(parsed.data);
      res.json({ data: result });
    }
  );

  public generateAndCreateTasks = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const parsed = generateAndCreateTasksSchema.safeParse(req.body);

      if (!parsed.success) {
        throw new HttpError(
          400,
          'Validation failed',
          toValidationDetails(parsed.error.issues)
        );
      }

      const userId = req.user?.id;

      if (!userId) {
        throw new HttpError(401, 'Unauthorized');
      }

      const result = await this.aiService.generateAndCreateTasks(
        parsed.data,
        userId
      );

      res.status(201).json({ data: result });
    }
  );
}

