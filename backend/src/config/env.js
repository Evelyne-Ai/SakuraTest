import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Muat .env dari cwd, lalu dari root repo (tidak menimpa variabel yang sudah ada).
dotenv.config();
dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../.env') });

const num = (v, d) => (Number.isFinite(Number(v)) && v !== undefined && v !== '' ? Number(v) : d);
const list = (v) => (v || '').split(',').map((s) => s.trim()).filter(Boolean);

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: num(process.env.PORT, 4000),
  corsOrigins: list(process.env.CORS_ORIGINS || 'http://localhost:5173'),
  rateLimitWindowMs: num(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
  rateLimitMax: num(process.env.RATE_LIMIT_MAX, 120),
  requestTimeoutMs: num(process.env.REQUEST_TIMEOUT_MS, 10_000),
  maintenanceTools: list(process.env.MAINTENANCE_TOOLS),
  // Penyimpanan data (user, API key, log). "memory" = tidak menulis file (dipakai untuk tes).
  dataDir: process.env.DATA_DIR || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../data'),
  // Email yang otomatis menjadi admin saat register (dipisah koma).
  adminEmails: list(process.env.ADMIN_EMAILS).map((e) => e.toLowerCase()),
  // Limit harian paket Free (request per hari UTC per akun).
  freeDailyLimit: num(process.env.FREE_DAILY_LIMIT, 100),
  // Kontak untuk pembelian paket (WhatsApp/Telegram/email). Kosong = tombol beli tidak ditampilkan.
  buyContactUrl: process.env.BUY_CONTACT_URL || '',
  integrations: {
    DOWNLOADER_PROVIDER_URL: process.env.DOWNLOADER_PROVIDER_URL || '',
    AI_PROVIDER_API_KEY: process.env.AI_PROVIDER_API_KEY || '',
  },
};
