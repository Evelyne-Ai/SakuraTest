import { verifyToken } from '../services/auth.js';
import { findById } from '../services/users.js';
import { findActiveByRaw } from '../services/keys.js';
import { AppError } from '../services/errors.js';
import { planOf } from '../services/plans.js';
import { dayKey, ensureUsage, recordUsage } from '../services/usage.js';

const bearer = (req) => {
  const h = req.get('authorization') || '';
  return h.startsWith('Bearer ') ? h.slice(7).trim() : '';
};

// Sesi dashboard: Authorization: Bearer <token dari /api/auth/login>.
export function requireSession(req, _res, next) {
  const id = verifyToken(bearer(req));
  const user = id && findById(id);
  if (!user) return next(new AppError(401, 'UNAUTHORIZED', 'Silakan login terlebih dahulu.'));
  req.user = user;
  next();
}

export function requireAdmin(req, _res, next) {
  if (req.user?.role !== 'admin') return next(new AppError(403, 'FORBIDDEN', 'Khusus admin.'));
  next();
}

// Akses API publik: header X-API-Key (atau Authorization: Bearer sk_sakura_...).
export function requireApiKey(req, res, next) {
  const raw = req.get('x-api-key') || bearer(req);
  if (!raw) return next(new AppError(401, 'API_KEY_REQUIRED', 'Sertakan API key lewat header X-API-Key.'));
  const key = findActiveByRaw(raw);
  const user = key && findById(key.userId);
  if (!key || !user) return next(new AppError(401, 'INVALID_API_KEY', 'API key tidak valid atau sudah dicabut.'));

  const limit = planOf(user.plan).dailyLimit;
  const used = ensureUsage(user).daily[dayKey()]?.n ?? 0;
  res.set('X-RateLimit-Limit', String(limit));
  res.set('X-RateLimit-Remaining', String(Math.max(0, limit - used - 1)));
  req.apiKey = key;
  req.user = user;

  if (used >= limit) {
    return next(new AppError(429, 'DAILY_LIMIT', `Limit harian ${limit} request (UTC) tercapai. Upgrade paket atau coba lagi besok.`));
  }
  // Request yang ditolak karena limit tidak dihitung sebagai pemakaian.
  const start = process.hrtime.bigint();
  const finish = () => {
    res.off('finish', finish);
    const route = req.route ? `${req.baseUrl}${req.route.path}` : req.path;
    recordUsage({ user, key, method: req.method, route, status: res.statusCode, ms: Number(process.hrtime.bigint() - start) / 1e6 });
  };
  res.on('finish', finish);
  next();
}
