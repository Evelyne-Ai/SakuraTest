import { z } from 'zod';
import { getDb, save } from '../services/store.js';
import { AppError } from '../services/errors.js';
import { signToken } from '../services/auth.js';
import * as users from '../services/users.js';
import { createKey, listKeys, revokeKey } from '../services/keys.js';
import { planOf, allPlans } from '../services/plans.js';
import { catalogRepository } from '../services/catalogRepository.js';
import { dayKey, ensureUsage, last30DaysCount, todayCount, trafficLast24h } from '../services/usage.js';

const parse = (schema, body) => {
  const r = schema.safeParse(body ?? {});
  if (!r.success) throw new AppError(400, 'VALIDATION_ERROR', r.error.issues[0]?.message || 'Input tidak valid.', r.error.flatten().fieldErrors);
  return r.data;
};

// ---- Auth ----
export const register = async (req, res) => {
  const user = await users.register(parse(users.registerSchema, req.body));
  res.status(201).json({ token: signToken(user.id), user: users.publicUser(user) });
};

export const login = async (req, res) => {
  const user = await users.login(parse(users.loginSchema, req.body));
  res.json({ token: signToken(user.id), user: users.publicUser(user) });
};

export const me = (req, res) => res.json({ user: users.publicUser(req.user) });

export const updateMe = (req, res) => {
  res.json({ user: users.publicUser(users.updateProfile(req.user, parse(users.profileSchema, req.body))) });
};

export const changePassword = async (req, res) => {
  await users.changePassword(req.user, parse(users.passwordSchema, req.body));
  res.json({ ok: true });
};

// ---- API keys ----
export const keysList = (req, res) => {
  const plan = planOf(req.user.plan);
  res.json({ keys: listKeys(req.user.id), maxKeys: plan.maxKeys ?? 3 });
};

const keySchema = z.object({ label: z.string().trim().min(1, 'Nama key wajib diisi').max(40) }).strict();
export const keysCreate = (req, res) => {
  const { label } = parse(keySchema, req.body);
  res.status(201).json(createKey(req.user, label)); // { key, record } — key hanya tampil sekali
};

export const keysRevoke = (req, res) => res.json({ key: revokeKey(req.user.id, req.params.id) });

// ---- Dashboard / logs ----
export const dashboard = (req, res) => {
  const u = ensureUsage(req.user);
  const plan = planOf(req.user.plan);
  const mine = getDb().logs.filter((l) => l.userId === req.user.id);
  const recent = mine.slice(-8).reverse();
  const latencySample = mine.slice(-100);
  res.json({
    totalEndpoints: catalogRepository.tools().filter((t) => t.status === 'active').length,
    categories: catalogRepository.categories().length,
    todayRequests: todayCount(req.user),
    dailyLimit: plan.dailyLimit,
    monthlyRequests: last30DaysCount(req.user),
    totalRequests: u.total,
    successRate: u.total ? Math.round(((u.total - u.errors) / u.total) * 1000) / 10 : null,
    avgLatencyMs: latencySample.length ? Math.round((latencySample.reduce((s, l) => s + l.ms, 0) / latencySample.length) * 10) / 10 : null,
    activeKeys: listKeys(req.user.id).filter((k) => !k.revokedAt).length,
    plan: { id: plan.id, name: plan.name },
    traffic: trafficLast24h(req.user),
    recent,
    day: dayKey(),
  });
};

export const requestLog = (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const pageSize = 20;
  const all = getDb().logs.filter((l) => l.userId === req.user.id).reverse();
  res.json({ total: all.length, page, pageSize, items: all.slice((page - 1) * pageSize, page * pageSize), retention: 'maksimal 5000 log terbaru untuk seluruh pengguna' });
};

// ---- Leaderboard (publik; tanpa email) ----
const displayName = (u) => u.name || u.email.split('@')[0];
export const leaderboard = (_req, res) => {
  const rows = getDb().users
    .filter((u) => (u.usage?.total ?? 0) > 0)
    .sort((a, b) => b.usage.total - a.usage.total)
    .slice(0, 20)
    .map((u, i) => ({ rank: i + 1, name: displayName(u), plan: planOf(u.plan).name, requests: u.usage.total }));
  res.json({ leaderboard: rows });
};

// ---- Feedback ----
const feedbackSchema = z.object({
  message: z.string().trim().min(5, 'Pesan minimal 5 karakter').max(1000),
  rating: z.coerce.number().int().min(1).max(5).optional(),
}).strict();

export const feedbackCreate = (req, res) => {
  const body = parse(feedbackSchema, req.body);
  const db = getDb();
  const mine = db.feedback.filter((f) => f.userId === req.user.id && Date.now() - Date.parse(f.at) < 60_000);
  if (mine.length >= 3) throw new AppError(429, 'RATE_LIMITED', 'Terlalu sering mengirim feedback. Coba lagi sebentar.');
  const item = { id: db.feedback.length + 1, userId: req.user.id, name: displayName(req.user), message: body.message, rating: body.rating ?? null, at: new Date().toISOString() };
  db.feedback.push(item);
  save();
  res.status(201).json({ feedback: item });
};

export const feedbackMine = (req, res) => res.json({ feedback: getDb().feedback.filter((f) => f.userId === req.user.id).reverse() });

// ---- Admin ----
const planSchema = z.object({ email: z.string().trim().email(), plan: z.string().trim().min(1).max(30) }).strict();
export const adminSetPlan = (req, res) => {
  const { email, plan } = parse(planSchema, req.body);
  if (!allPlans().some((p) => p.id === plan)) throw new AppError(400, 'VALIDATION_ERROR', `Paket tidak dikenal: ${plan}.`);
  res.json({ user: users.publicUser(users.setPlan(email, plan)) });
};
export const adminFeedback = (_req, res) => res.json({ feedback: [...getDb().feedback].reverse() });

// ---- Akses via API key ----
export const keyInfo = (req, res) => {
  const plan = planOf(req.user.plan);
  res.json({ plan: plan.id, dailyLimit: plan.dailyLimit, usedToday: todayCount(req.user), resetsAt: `${dayKey(new Date(Date.now() + 86_400_000))}T00:00:00Z` });
};
