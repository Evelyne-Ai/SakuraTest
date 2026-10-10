import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as c from '../controllers/apiController.js';
import * as a from '../controllers/accountController.js';
import { requireAdmin, requireApiKey, requireSession } from '../middleware/auth.js';

const authLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ error: { code: 'RATE_LIMITED', message: 'Terlalu banyak percobaan. Coba lagi sebentar.' } }),
});

// Express 4 tidak menangkap promise yang ditolak; bungkus handler async.
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const api = Router();

// Publik
api.get('/health', c.health);
api.get('/tools', c.listTools);
api.get('/tools/:slug', c.getTool);
api.get('/categories', c.listCategories);
api.get('/docs', c.getDocs);
api.get('/stats', c.getStats);
api.get('/openapi.json', c.getOpenApi);
api.get('/changelog', c.getChangelog);
api.get('/plans', c.getPlans);
api.get('/leaderboard', a.leaderboard);

// Akun
api.post('/auth/register', authLimiter, wrap(a.register));
api.post('/auth/login', authLimiter, wrap(a.login));
api.get('/auth/me', requireSession, a.me);
api.patch('/me', requireSession, a.updateMe);
api.post('/me/password', authLimiter, requireSession, wrap(a.changePassword));
api.get('/me/dashboard', requireSession, a.dashboard);
api.get('/me/logs', requireSession, a.requestLog);

// API key
api.get('/keys', requireSession, a.keysList);
api.post('/keys', requireSession, a.keysCreate);
api.delete('/keys/:id', requireSession, a.keysRevoke);

// Feedback
api.get('/feedback', requireSession, a.feedbackMine);
api.post('/feedback', requireSession, a.feedbackCreate);

// Admin
api.put('/admin/users/plan', requireSession, requireAdmin, a.adminSetPlan);
api.get('/admin/feedback', requireSession, requireAdmin, a.adminFeedback);

// Dipakai klien dengan API key
api.get('/v1/me', requireApiKey, a.keyInfo);
api.post('/v1/tools/:slug/run', requireApiKey, c.runToolHandler);
