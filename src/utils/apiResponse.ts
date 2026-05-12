import type { Response } from 'express';

export function sendSuccess<T>(res: Response, data: T, statusCode = 200) {
  return res.status(statusCode).json({ data });
}

export function sendNoContent(res: Response) {
  return res.status(204).send();
}
