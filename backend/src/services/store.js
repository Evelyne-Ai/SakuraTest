import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { env } from '../config/env.js';

// Penyimpanan sederhana berbasis satu file JSON (cukup untuk satu instance server).
// Untuk skala lebih besar, ganti modul ini dengan database sungguhan.
const persistent = env.dataDir !== 'memory';
const file = path.join(env.dataDir, 'db.json');

const fresh = () => ({ meta: { secret: randomBytes(32).toString('hex') }, users: [], keys: [], logs: [], feedback: [] });

function load() {
  if (!persistent || !existsSync(file)) return fresh();
  const parsed = JSON.parse(readFileSync(file, 'utf8'));
  return { ...fresh(), ...parsed, meta: { ...fresh().meta, ...(parsed.meta ?? {}) } };
}

const db = load();
let timer = null;

export function flushNow() {
  if (!persistent) return;
  if (timer) { clearTimeout(timer); timer = null; }
  mkdirSync(env.dataDir, { recursive: true });
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, JSON.stringify(db), { mode: 0o600 });
  renameSync(tmp, file);
}

// Tulis ditunda 250ms agar banyak request tidak menulis disk berkali-kali.
export function save() {
  if (!persistent || timer) return;
  timer = setTimeout(() => { timer = null; try { flushNow(); } catch (e) { console.error('[store] gagal menulis:', e.message); } }, 250);
  timer.unref?.();
}

export const getDb = () => db;
if (persistent) flushNow(); // pastikan secret sesi tersimpan sejak awal
