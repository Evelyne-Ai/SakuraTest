import { getDb, save } from './store.js';

const MAX_LOGS = 5000;
const HOURS_KEPT = 48;
const DAYS_KEPT = 35;

export const dayKey = (d = new Date()) => d.toISOString().slice(0, 10); // UTC
export const hourKey = (d = new Date()) => d.toISOString().slice(0, 13); // UTC, YYYY-MM-DDTHH

export function ensureUsage(user) {
  user.usage ??= { total: 0, errors: 0, daily: {}, hourly: {} };
  return user.usage;
}

function prune(map, keep) {
  const keys = Object.keys(map).sort();
  for (const k of keys.slice(0, Math.max(0, keys.length - keep))) delete map[k];
}

export function todayCount(user) {
  return ensureUsage(user).daily[dayKey()]?.n ?? 0;
}

// Dipanggil setelah request ber-API-key selesai. Hanya menyimpan metadata, bukan isi request.
export function recordUsage({ user, key, method, route, status, ms }) {
  const u = ensureUsage(user);
  const isErr = status >= 400;
  u.total++;
  if (isErr) u.errors++;
  const d = (u.daily[dayKey()] ??= { n: 0, err: 0 });
  const h = (u.hourly[hourKey()] ??= { n: 0, err: 0 });
  d.n++; h.n++;
  if (isErr) { d.err++; h.err++; }
  prune(u.daily, DAYS_KEPT);
  prune(u.hourly, HOURS_KEPT);
  key.total = (key.total ?? 0) + 1;
  key.lastUsedAt = new Date().toISOString();
  const db = getDb();
  db.logs.push({ id: db.logs.length ? db.logs[db.logs.length - 1].id + 1 : 1, userId: user.id, keyId: key.id, keyPrefix: key.prefix, method, route, status, ms: Math.round(ms * 10) / 10, at: new Date().toISOString() });
  if (db.logs.length > MAX_LOGS) db.logs.splice(0, db.logs.length - MAX_LOGS);
  save();
}

export function trafficLast24h(user) {
  const u = ensureUsage(user);
  const out = [];
  const now = Date.now();
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now - i * 3_600_000);
    const b = u.hourly[hourKey(d)];
    out.push({ hour: `${String(d.getUTCHours()).padStart(2, '0')}:00`, requests: b?.n ?? 0, errors: b?.err ?? 0 });
  }
  return out;
}

export function last30DaysCount(user) {
  const u = ensureUsage(user);
  const since = dayKey(new Date(Date.now() - 29 * 86_400_000));
  return Object.entries(u.daily).reduce((s, [k, v]) => (k >= since ? s + v.n : s), 0);
}
