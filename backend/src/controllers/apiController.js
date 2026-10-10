import { catalogRepository } from '../services/catalogRepository.js';
import { runTool } from '../services/toolService.js';
import { AppError } from '../services/errors.js';
import { snapshot } from '../services/statsService.js';
import { buildOpenApi } from '../services/openapi.js';
import { allPlans } from '../services/plans.js';
import { getDb } from '../services/store.js';
import { env } from '../config/env.js';

const startedAt = Date.now();

export const health = (_req, res) => {
  res.json({ status: 'ok', uptimeSeconds: Math.round((Date.now() - startedAt) / 1000), time: new Date().toISOString() });
};

export const listTools = (req, res) => {
  const { q, category, status } = req.query;
  let tools = catalogRepository.tools();
  if (typeof category === 'string' && category) tools = tools.filter((t) => t.category === category);
  if (typeof status === 'string' && status) tools = tools.filter((t) => t.status === status);
  if (typeof q === 'string' && q.trim()) {
    const needle = q.trim().toLowerCase().slice(0, 100);
    tools = tools.filter((t) => `${t.name} ${t.description} ${t.slug}`.toLowerCase().includes(needle));
  }
  res.json({ total: tools.length, tools });
};

export const getTool = (req, res) => {
  const tool = catalogRepository.tool(req.params.slug);
  if (!tool) throw new AppError(404, 'NOT_FOUND', 'Tool tidak ditemukan.');
  res.json({ tool });
};

// Dipanggil lewat POST /api/v1/tools/:slug/run dan wajib memakai API key (lihat routes/api.js).
export const runToolHandler = (req, res) => {
  res.json({ slug: req.params.slug, result: runTool(req.params.slug, req.body) });
};

export const listCategories = (_req, res) => {
  const tools = catalogRepository.tools();
  res.json({
    categories: catalogRepository.categories().map((c) => ({ ...c, toolCount: tools.filter((t) => t.category === c.id).length })),
  });
};

export const getDocs = (_req, res) => {
  const tools = catalogRepository.tools().filter((t) => t.status === 'active');
  const endpoints = [
    { method: 'GET', path: '/api/health', description: 'Health check layanan.' },
    { method: 'GET', path: '/api/tools', description: 'Daftar tools. Query: q, category, status.' },
    { method: 'GET', path: '/api/tools/:slug', description: 'Detail satu tool.' },
    { method: 'POST', path: '/api/v1/tools/:slug/run', description: 'Jalankan tool. Wajib header X-API-Key. Body JSON sesuai field tool.', auth: 'apikey' },
    { method: 'GET', path: '/api/v1/me', description: 'Info paket, limit harian, dan pemakaian hari ini untuk API key ini.', auth: 'apikey' },
    { method: 'GET', path: '/api/categories', description: 'Daftar kategori beserta jumlah tool.' },
    { method: 'GET', path: '/api/docs', description: 'Dokumentasi, FAQ, dan daftar endpoint.' },
    { method: 'GET', path: '/api/stats', description: 'Statistik request server (in-memory) dan jumlah akun/key.' },
    { method: 'GET', path: '/api/openapi.json', description: 'Spesifikasi OpenAPI 3.1 yang dibangkitkan dari katalog.' },
    { method: 'GET', path: '/api/changelog', description: 'Riwayat perubahan.' },
    { method: 'GET', path: '/api/plans', description: 'Paket layanan beserta limit harian dan batas key.' },
  ];
  res.json({ docs: catalogRepository.docs(), faq: catalogRepository.faq(), endpoints, runnableTools: tools.map((t) => ({ slug: t.slug, fields: t.fields })) });
};

export const getStats = (_req, res) => {
  const db = getDb();
  res.json({
    ...snapshot(),
    registeredUsers: db.users.length,
    activeKeys: db.keys.filter((k) => !k.revokedAt).length,
    keyedRequestsTotal: db.users.reduce((s, u) => s + (u.usage?.total ?? 0), 0),
    activeTools: catalogRepository.tools().filter((t) => t.status === 'active').length,
    categories: catalogRepository.categories().length,
  });
};

export const getOpenApi = (req, res) => res.json(buildOpenApi(`${req.protocol}://${req.get('host')}`));

export const getChangelog = (_req, res) => res.json({ changelog: catalogRepository.changelog() });

export const getPlans = (_req, res) => {
  res.json({ plans: allPlans(), buyContactUrl: env.buyContactUrl || null, note: 'Harga dan pembayaran diatur pemilik situs; aktivasi paket dilakukan admin.' });
};
