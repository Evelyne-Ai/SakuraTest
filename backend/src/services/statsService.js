// Statistik request in-memory (reset saat server restart). Tidak menyimpan IP, query, header, atau body.
const startedAt = Date.now();
const MAX_RECENT = 25;
const state = { total: 0, ok: 0, clientErr: 0, serverErr: 0, byEndpoint: new Map(), recent: [] };

export function record({ method, route, status, ms }) {
  state.total++;
  if (status < 400) state.ok++;
  else if (status < 500) state.clientErr++;
  else state.serverErr++;
  const key = `${method} ${route}`;
  state.byEndpoint.set(key, (state.byEndpoint.get(key) ?? 0) + 1);
  state.recent.unshift({ method, route, status, ms: Math.round(ms * 10) / 10, at: new Date().toISOString() });
  if (state.recent.length > MAX_RECENT) state.recent.pop();
}

export function snapshot() {
  const top = [...state.byEndpoint.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([endpoint, count]) => ({ endpoint, count }));
  return {
    since: new Date(startedAt).toISOString(),
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
    totalRequests: state.total,
    // null jika belum ada request; bukan angka karangan
    successRate: state.total ? Math.round((state.ok / state.total) * 1000) / 10 : null,
    clientErrors: state.clientErr,
    serverErrors: state.serverErr,
    topEndpoints: top,
    recent: state.recent,
    persistence: 'in-memory',
  };
}
