import { api } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { usePageMeta } from '../hooks/usePageMeta';
import { EmptyState, ErrorState, Loading, PageHead, fmt } from '../components/ui';

export default function Leaderboard() {
  usePageMeta('Leaderboard', 'Peringkat pengguna berdasarkan jumlah request API.');
  const { data, error, loading, retry } = useFetch((s) => api.leaderboard(s));
  return (
    <section className="container section">
      <PageHead eyebrow="Pages" title="Leaderboard" desc="Peringkat 20 teratas berdasarkan total request API. Email tidak ditampilkan." />
      {loading && <Loading />}
      {error && <ErrorState message={error.message} onRetry={retry} />}
      {data && data.leaderboard.length === 0 && <EmptyState title="Belum ada data ranking" hint="Ranking muncul setelah ada request yang memakai API key." />}
      {data && data.leaderboard.length > 0 && (
        <div className="card block">
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Pengguna</th><th>Paket</th><th className="num">Request</th></tr></thead>
              <tbody>
                {data.leaderboard.map((r) => (
                  <tr key={r.rank}><td>{r.rank}</td><td>{r.name}</td><td>{r.plan}</td><td className="num">{fmt(r.requests)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
