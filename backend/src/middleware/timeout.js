import { AppError } from '../services/errors.js';

export const requestTimeout = (ms) => (_req, res, next) => {
  const t = setTimeout(() => {
    if (!res.headersSent) next(new AppError(503, 'TIMEOUT', 'Permintaan melebihi batas waktu.'));
  }, ms);
  res.on('finish', () => clearTimeout(t));
  res.on('close', () => clearTimeout(t));
  next();
};
