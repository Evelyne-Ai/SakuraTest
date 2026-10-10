import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { api } from './routes/api.js';
import { requestLogger } from './middleware/requestLogger.js';
import { statsRecorder } from './middleware/statsRecorder.js';
import { requestTimeout } from './middleware/timeout.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(
    cors({
      origin(origin, cb) {
        if (!origin || env.corsOrigins.includes(origin)) return cb(null, true);
        cb(null, false);
      },
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    }),
  );
  app.use(requestLogger);
  app.use(statsRecorder);
  app.use(requestTimeout(env.requestTimeoutMs));
  app.use(
    '/api',
    rateLimit({
      windowMs: env.rateLimitWindowMs,
      limit: env.rateLimitMax,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      handler: (_req, res) =>
        res.status(429).json({ error: { code: 'RATE_LIMITED', message: 'Terlalu banyak request. Coba lagi nanti.' } }),
    }),
  );
  app.use(express.json({ limit: '300kb' }));
  app.use('/api', api);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
