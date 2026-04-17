import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation failed', details: err.errors });
  }
  const message = err instanceof Error ? err.message : 'Unexpected error';
  const status = (err as { status?: number })?.status ?? 500;
  if (!status || status >= 500) {
    // eslint-disable-next-line no-console
    console.error('[flaire]', err);
  }
  res.status(status).json({ error: message });
}

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
