import { Activity, CheckCircle2, KeyRound, Users, XCircle, Clock } from 'lucide-react';
import { api } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { usePageMeta } from '../hooks/usePageMeta';
import { ErrorState, Loading, PageHead, StatCard, fmt } from '../components/ui';

const uptime = (s: number) => (s >= 3600 ? `${Math.floor(s / 3600)} j ${Math.floor((s % 3600) / 60)} m` : `${Math.floor(s / 60)} m ${s % 60} d`);

export default function Stats() {
  usePageMeta('Stats', 'Statistik layanan SakuraApis.');
  const { data, error, loading, retry } = useFetch((s) => api.stats(s));
  return (
    <section className="container section">
      <PageHead eyebrow="Pages" title="Stats" desc="Statistik server. Hitungan request server bersifat in-memory dan reset saat restart." />
      {loading && <Loading />}
      {error && <ErrorState message={error.message} onRetry={retry} />}
      {data && (
        <>
          <div className="grid-2">
            <StatCard icon={<Activity size={16} />} label="Request (sejak start)" value={fmt(data.totalRequests)} sub={`Sejak ${new Date(data.since).toLocaleString('id-ID')}`} />
            <StatCard icon={<CheckCircle2 size={16} />} label="Success rate" value={data.successRate == null ? '—' : `${data.successRate}%`} />
            <StatCard icon={<XCircle size={16} />} label="Error" value={`${fmt(data.clientErrors)} / ${fmt(data.serverErrors)}`} sub="4xx / 5xx" />
            <StatCard icon={<Clock size={16} />} label="Uptime" value={uptime(data.uptimeSeconds)} />
            <StatCard icon={<Users size={16} />} label="Akun terdaftar" value={fmt(data.registeredUsers)} />
            <StatCard icon={<KeyRound size={16} />} label="API key aktif" value={fmt(data.activeKeys)} sub={`${fmt(data.keyedRequestsTotal)} request ber-key (permanen)`} />
          </div>
          <div className="card block">
            <h3>Endpoint teratas</h3>
            {data.topEndpoints.length === 0 ? <p className="muted">Belum ada request tercatat.</p> : (
              <ul className="activity">{data.topEndpoints.map((e) => <li key={e.endpoint}><code>{e.endpoint}</code><span className="muted small">{fmt(e.count)}</span></li>)}</ul>
            )}
          </div>
        </>
      )}
    </section>
  );
}
