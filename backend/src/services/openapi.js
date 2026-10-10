import { catalogRepository } from './catalogRepository.js';

const typeMap = { number: 'integer', select: 'string', text: 'string', textarea: 'string' };

export function buildOpenApi(serverUrl = '/') {
  const paths = {
    '/api/health': { get: { summary: 'Health check', responses: { 200: { description: 'OK' } } } },
    '/api/tools': { get: { summary: 'Daftar tools', parameters: ['q', 'category', 'status'].map((n) => ({ name: n, in: 'query', schema: { type: 'string' } })), responses: { 200: { description: 'OK' } } } },
    '/api/tools/{slug}': { get: { summary: 'Detail tool', parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' }, 404: { description: 'Tidak ditemukan' } } } },
    '/api/categories': { get: { summary: 'Daftar kategori', responses: { 200: { description: 'OK' } } } },
    '/api/docs': { get: { summary: 'Dokumentasi, FAQ, endpoint', responses: { 200: { description: 'OK' } } } },
    '/api/v1/me': { get: { summary: 'Info paket dan pemakaian API key', security: [{ ApiKey: [] }], responses: { 200: { description: 'OK' }, 401: { description: 'API key tidak valid' } } } },
    '/api/stats': { get: { summary: 'Statistik request (in-memory)', responses: { 200: { description: 'OK' } } } },
    '/api/changelog': { get: { summary: 'Changelog', responses: { 200: { description: 'OK' } } } },
    '/api/plans': { get: { summary: 'Paket (dari konfigurasi)', responses: { 200: { description: 'OK' } } } },
  };
  for (const t of catalogRepository.tools().filter((x) => x.status === 'active')) {
    const properties = {};
    const required = [];
    for (const f of t.fields) {
      properties[f.name] = { type: typeMap[f.type] ?? 'string', ...(f.options ? { enum: f.options } : {}), ...(f.min !== undefined ? { minimum: f.min } : {}), ...(f.max !== undefined ? (f.type === 'number' ? { maximum: f.max } : { maxLength: f.max }) : {}), ...(f.default !== undefined ? { default: f.default } : {}) };
      if (f.required) required.push(f.name);
    }
    paths[`/api/v1/tools/${t.slug}/run`] = {
      post: {
        security: [{ ApiKey: [] }],
        summary: t.name, description: t.description, tags: [t.category],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', additionalProperties: false, properties, ...(required.length ? { required } : {}) } } } },
        responses: { 200: { description: 'Hasil' }, 400: { description: 'VALIDATION_ERROR' }, 401: { description: 'API_KEY_REQUIRED / INVALID_API_KEY' }, 429: { description: 'RATE_LIMITED / DAILY_LIMIT' } },
      },
    };
  }
  return { openapi: '3.1.0', info: { title: 'SakuraApis', version: '2.0.0' }, servers: [{ url: serverUrl }], components: { securitySchemes: { ApiKey: { type: 'apiKey', in: 'header', name: 'X-API-Key' } } }, paths };
}
