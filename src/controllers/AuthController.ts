import type { NextFunction, Request, Response } from 'express';
import { loginBodySchema } from '../schemas/auth';
import type { AuthService } from '../services/AuthService';
import { asyncHandler } from '../utils/asyncHandler';
import { HttpError } from '../utils/httpError';
import { registerBodySchema } from '../schemas/auth';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  public register = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const parsed = registerBodySchema.safeParse(req.body);
  
    if (!parsed.success) {
      const details = parsed.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message
      }));
      throw new HttpError(400, 'Validation failed', details);
    }
  
    const result = await this.authService.register(parsed.data);
  
    res.status(201).json({
      data: result
    });
  });

  public login = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const parsed = loginBodySchema.safeParse(req.body);
    if (!parsed.success) {
      const details = parsed.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message
      }));
      throw new HttpError(400, 'Validation failed', details);
    }

    const result = await this.authService.login(parsed.data);
    res.json({
      data: result
    });
  });
}

