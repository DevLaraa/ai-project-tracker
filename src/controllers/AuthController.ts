import type { NextFunction, Request, Response } from 'express';
import { loginBodySchema } from '../schemas/auth';
import type { AuthService } from '../services/AuthService';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { registerBodySchema } from '../schemas/auth';
import { parseOrThrow } from '../utils/validation';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  public register = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const payload = parseOrThrow(registerBodySchema, req.body);
    const result = await this.authService.register(payload);

    sendSuccess(res, result, 201);
  });

  public login = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const payload = parseOrThrow(loginBodySchema, req.body);
    const result = await this.authService.login(payload);

    sendSuccess(res, result);
  });
}

