import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { HttpError } from '../utils/httpError';
import { logger } from '../utils/logger';

type ApiErrorResponse = {
  error: string;
  statusCode: number;
  details?: unknown;
};

function sendError(res: Response, payload: ApiErrorResponse) {
  return res.status(payload.statusCode).json(payload);
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (res.headersSent) return;

  if (err instanceof HttpError) {
    logger.warn({
      method: req.method,
      url: req.originalUrl,
      statusCode: err.statusCode,
      error: err.message,
      details: err.details
    });

    return sendError(res, {
      error: err.message,
      statusCode: err.statusCode,
      ...(err.details !== undefined ? { details: err.details } : {})
    });
  }

  logger.error({
    method: req.method,
    url: req.originalUrl,
    statusCode: 500,
    error: err instanceof Error ? err.message : 'Unknown error',
    details: err
  });
  const isProduction = env.NODE_ENV === 'production';

  const details =
    !isProduction && err instanceof Error
      ? {
          message: err.message,
          stack: err.stack
        }
      : undefined;

  return sendError(res, {
    error: 'Internal Server Error',
    statusCode: 500,
    ...(details !== undefined ? { details } : {})
  });
}

