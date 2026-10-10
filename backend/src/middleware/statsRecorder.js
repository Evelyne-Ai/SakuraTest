import { record } from '../services/statsService.js';

// Dipasang setelah router dipilih lewat res.on('finish'); memakai pola route (bukan URL penuh) agar tidak mencatat data pengguna.
export function statsRecorder(req, res, next) {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    if (!req.originalUrl.startsWith('/api')) return;
    const route = req.route ? `${req.baseUrl}${req.route.path}` : 'unmatched';
    record({ method: req.method, route, status: res.statusCode, ms: Number(process.hrtime.bigint() - start) / 1e6 });
  });
  next();
}
