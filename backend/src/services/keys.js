import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { getDb, save } from './store.js';
import { AppError } from './errors.js';
import { planOf } from './plans.js';

const sha256 = (s) => createHash('sha256').update(s).digest('hex');

export const publicKey = (k) => ({
  id: k.id, label: k.label, prefix: k.prefix, last4: k.last4,
  createdAt: k.createdAt, lastUsedAt: k.lastUsedAt, revokedAt: k.revokedAt, total: k.total ?? 0,
});

export const listKeys = (userId) => getDb().keys.filter((k) => k.userId === userId).map(publicKey);

// Key utuh hanya dikembalikan sekali saat dibuat; yang disimpan hanya hash SHA-256.
export function createKey(user, label) {
  const db = getDb();
  const max = planOf(user.plan).maxKeys ?? 3;
  const active = db.keys.filter((k) => k.userId === user.id && !k.revokedAt).length;
  if (active >= max) throw new AppError(409, 'KEY_LIMIT', `Batas ${max} API key aktif untuk paket ${planOf(user.plan).name} sudah tercapai.`);
  const raw = `sk_sakura_${randomBytes(24).toString('base64url')}`;
  const rec = {
    id: randomUUID(), userId: user.id, label, prefix: raw.slice(0, 14), last4: raw.slice(-4),
    hash: sha256(raw), createdAt: new Date().toISOString(), lastUsedAt: null, revokedAt: null, total: 0,
  };
  db.keys.push(rec);
  save();
  return { key: raw, record: publicKey(rec) };
}

export function revokeKey(userId, id) {
  const k = getDb().keys.find((x) => x.id === id && x.userId === userId);
  if (!k) throw new AppError(404, 'NOT_FOUND', 'API key tidak ditemukan.');
  if (!k.revokedAt) { k.revokedAt = new Date().toISOString(); save(); }
  return publicKey(k);
}

export function findActiveByRaw(raw) {
  if (typeof raw !== 'string' || raw.length < 20 || raw.length > 200) return null;
  const h = sha256(raw);
  return getDb().keys.find((k) => k.hash === h && !k.revokedAt) ?? null;
}
