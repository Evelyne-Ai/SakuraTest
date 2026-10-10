import { ZodError } from 'zod';
import { AppError } from '../services/errors.js';

export function notFound(_req, _res, next) {
  next(new AppError(404, 'NOT_FOUND', 'Endpoint tidak ditemukan.'));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) {
    err = new AppError(400, 'VALIDATION_ERROR', 'Input tidak valid.', err.flatten().fieldErrors);
  }
  if (err?.type === 'entity.too.large') err = new AppError(413, 'PAYLOAD_TOO_LARGE', 'Body terlalu besar.');
  if (err?.type === 'entity.parse.failed') err = new AppError(400, 'VALIDATION_ERROR', 'Body bukan JSON yang valid.');
  const status = err instanceof AppError ? err.status : 500;
  if (status >= 500) console.error(`[error] ${req.method} ${req.path}:`, err?.message);
  res.status(status).json({
    error: {
      code: err instanceof AppError ? err.code : 'INTERNAL_ERROR',
      message: status >= 500 ? 'Terjadi kesalahan pada server.' : err.message,
      ...(err.details ? { details: err.details } : {}),
    },
  });
}
