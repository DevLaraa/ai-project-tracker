import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import type { CreateUserInput, PublicUser, UserId } from '../models/User';
import type { UserService } from '../services/UserService';
import { createUserBodySchema, userIdParamSchema } from '../schemas/user';
import { asyncHandler } from '../utils/asyncHandler';
import { HttpError } from '../utils/httpError';

function parseOptionalNumber(value: unknown): number | undefined {
  if (typeof value === 'string') return value === '' ? undefined : Number(value);
  if (Array.isArray(value)) return value.length ? Number(value[0]) : undefined;
  return undefined;
}

export class UserController {
  constructor(private readonly userService: UserService) {}

  public getUsers = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const rawLimit = parseOptionalNumber(req.query.limit);
    const rawOffset = parseOptionalNumber(req.query.offset);

    const limit = rawLimit === undefined ? env.DEFAULT_PAGE_LIMIT : rawLimit;
    const offset = rawOffset === undefined ? 0 : rawOffset;

    if (!Number.isFinite(limit) || !Number.isFinite(offset)) {
      throw new HttpError(400, '`limit` and `offset` must be numbers');
    }

    const users: PublicUser[] = await this.userService.listUsers(limit, offset);

    res.json({
      data: users,
      pagination: {
        limit,
        offset
      }
    });
  });

  public postUser = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const parsed = createUserBodySchema.safeParse(req.body);
    if (!parsed.success) {
      const details = parsed.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message
      }));
      throw new HttpError(400, 'Validation failed', details);
    }

    const payload: CreateUserInput = parsed.data;
    const created = await this.userService.createUser(payload);
    res.status(201).json({ data: created });
  });

  public getUserById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const parsed = userIdParamSchema.safeParse(req.params);
    if (!parsed.success) {
      const details = parsed.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'params',
        message: issue.message
      }));
      throw new HttpError(400, 'Validation failed', details);
    }

    const userId: UserId = parsed.data.id;
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    res.json({ data: user });
  });
}

