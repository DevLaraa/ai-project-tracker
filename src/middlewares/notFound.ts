import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/httpError';

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(new HttpError(404, 'Not Found'));
}

