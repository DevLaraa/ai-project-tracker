import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/httpError';
import { verifyJwt } from '../utils/jwt';

function extractBearerToken(headerValue: string | undefined): string | null {
  if (!headerValue) return null;
  const [scheme, token] = headerValue.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    return next(new HttpError(401, 'Missing or invalid authorization token'));
  }

  try {
    const payload = verifyJwt(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name
    };
    return next();
  } catch (_err) {
    return next(new HttpError(401, 'Invalid or expired token'));
  }
}

