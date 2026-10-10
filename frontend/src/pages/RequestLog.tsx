import { useState } from 'react';
import { api } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { usePageMeta } from '../hooks/usePageMeta';
import { Pagination } from '../components/Pagination';
import { EmptyState, ErrorState, Loading, PageHead, fmtDate } from '../components/ui';

export default function RequestLog() {
  usePageMeta('Request Log', 'Riwayat request API milikmu.');
  const [page, setPage] = useState(1);
  const { data, error, loading, retry } = useFetch((s) => api.logs(page, s), [page]);
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  return (
    <section className="container section">
      <PageHead eyebrow="Pages" title="Request Log" desc="Hanya metadata request. Isi body, header, query, dan IP tidak dicatat." />
      {loading && !data && <Loading />}
      {error && <ErrorState message={error.message} onRetry={retry} />}
      {data && data.items.length === 0 && <EmptyState title="Belum ada request" hint="Panggil API dengan API key untuk melihat log di sini." />}
      {data && data.items.length > 0 && (
        <div className="card block">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Waktu</th><th>Method</th><th>Route</th><th>Status</th><th className="num">ms</th><th>Key</th></tr></thead>
              <tbody>
                {data.items.map((l) => (
                  <tr key={l.id}>
                    <td>{fmtDate(l.at)}</td><td>{l.method}</td><td><code>{l.route}</code></td>
                    <td><span className={`badge ${l.status < 400 ? 'badge-ok' : 'badge-err'}`}>{l.status}</span></td>
                    <td className="num">{l.ms}</td><td><code>{l.keyPrefix}…</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pages={pages} onChange={setPage} />
          <p className="muted small">Log disimpan maksimal 5.000 entri terbaru untuk seluruh pengguna.</p>
        </div>
      )}
    </section>
  );
}
