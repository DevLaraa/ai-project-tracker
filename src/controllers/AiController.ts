import type { NextFunction, Request, Response } from 'express';
import { generateTasksBodySchema } from '../schemas/ai';
import type { AiService } from '../services/AiService';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { HttpError } from '../utils/httpError';
import { generateAndCreateTasksSchema } from '../schemas/ai/generateAndCreateTasks.schema';
import { parseOrThrow } from '../utils/validation';

export class AiController {
  constructor(private readonly aiService: AiService) {}

  public generateTasks = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const payload = parseOrThrow(generateTasksBodySchema, req.body);
      const result = await this.aiService.generateTasks(payload);

      sendSuccess(res, result);
    }
  );

  public generateAndCreateTasks = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const payload = parseOrThrow(generateAndCreateTasksSchema, req.body);
      const userId = req.user?.id;

      if (!userId) {
        throw new HttpError(401, 'Unauthorized');
      }

      const result = await this.aiService.generateAndCreateTasks(payload, userId);

      sendSuccess(res, result, 201);
    }
  );
}

