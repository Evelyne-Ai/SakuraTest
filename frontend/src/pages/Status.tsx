import { api } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { usePageMeta } from '../hooks/usePageMeta';
import { ErrorState, Loading, PageHead } from '../components/ui';
import type { ToolStatus } from '../types';

const label: Record<ToolStatus, string> = { active: 'Active', maintenance: 'Maintenance', not_configured: 'Not configured' };

export default function Status() {
  usePageMeta('Status', 'Status layanan dan endpoint SakuraApis.');
  const { data, error, loading, retry } = useFetch(async (s) => {
    const [health, tools] = await Promise.all([api.health(s), api.tools(s)]);
    return { health, tools: tools.tools };
  });
  return (
    <section className="container section narrow">
      <PageHead eyebrow="Legal" title="Status" desc="Kondisi layanan saat halaman ini dimuat." />
      {loading && <Loading />}
      {error && <ErrorState message={error.message} onRetry={retry} />}
      {data && (
        <>
          <div className="card block">
            <span className={`badge ${data.health.status === 'ok' ? 'badge-ok' : 'badge-err'}`}>{data.health.status === 'ok' ? 'Operational' : data.health.status}</span>
            <p className="muted small">Waktu server: {new Date(data.health.time).toLocaleString('id-ID')}</p>
          </div>
          <div className="card block">
            <h3>Endpoint tools</h3>
            <ul className="activity">
              {data.tools.map((t) => <li key={t.slug}><span>{t.name}</span><span className={`badge badge-${t.status}`}>{label[t.status]}</span></li>)}
            </ul>
          </div>
        </>
      )}
    </section>
  );
}
