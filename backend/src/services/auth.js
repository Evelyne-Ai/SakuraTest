import { createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { getDb } from './store.js';

const scryptAsync = promisify(scrypt);
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

export async function verifyPassword(password, stored) {
  const [saltHex, hashHex] = String(stored).split(':');
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = await scryptAsync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return timingSafeEqual(actual, expected);
}

const sign = (payload) => createHmac('sha256', getDb().meta.secret).update(payload).digest('base64url');

export function signToken(userId, ttlMs = TOKEN_TTL_MS) {
  const payload = `${userId}.${Date.now() + ttlMs}`;
  return `${payload}.${sign(payload)}`;
}

// Mengembalikan userId bila token valid dan belum kedaluwarsa, selain itu null.
export function verifyToken(token) {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [userId, exp, sig] = parts;
  const expected = sign(`${userId}.${exp}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (!(Number(exp) > Date.now())) return null;
  return userId;
}
