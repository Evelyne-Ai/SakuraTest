import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, BookOpen, Check, Copy, CreditCard, Gauge, KeyRound, Layers, Plus, RefreshCw, ScrollText, Trash2, Code2, Link2 } from 'lucide-react';
import { api } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { usePageMeta } from '../hooks/usePageMeta';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/Modal';
import { TrafficChart } from '../components/TrafficChart';
import { ErrorState, EmptyState, Loading, PageHead, StatCard, fmt, fmtDate } from '../components/ui';

export default function Dashboard() {
  usePageMeta('Dashboard', 'Ringkasan pemakaian dan manajemen API key.');
  const toast = useToast();
  const dash = useFetch((s) => api.dashboard(s));
  const keys = useFetch((s) => api.keys(s));
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(() => { dash.retry(); keys.retry(); }, [dash, keys]);
  const close = useCallback(() => { setOpen(false); setCreated(null); setLabel(''); setCopied(false); }, []);

  const copy = async (text: string, msg = 'Disalin ke clipboard') => {
    try { await navigator.clipboard.writeText(text); toast(msg, 'success'); return true; } catch { toast('Gagal menyalin. Salin manual.', 'error'); return false; }
  };

  const create = async () => {
    if (!label.trim()) return;
    setBusy(true);
    try {
      const r = await api.createKey(label.trim());
      setCreated(r.key);
      refresh();
    } catch (e) { toast((e as Error).message, 'error'); } finally { setBusy(false); }
  };

  const revoke = async (id: string, name: string) => {
    if (!window.confirm(`Cabut key "${name}"? Aplikasi yang memakainya akan langsung ditolak.`)) return;
    try { await api.revokeKey(id); toast('Key dicabut', 'success'); refresh(); } catch (e) { toast((e as Error).message, 'error'); }
  };

  const d = dash.data;
  const list = keys.data?.keys ?? [];
  const activeKeys = list.filter((k) => !k.revokedAt).length;

  return (
    <section className="container section">
      <PageHead
        eyebrow="Overview · Real-time"
        title="Dashboard"
        desc="Monitoring pemakaian API, limit harian, dan aktivitas request terkini."
        actions={<><button className="btn btn-line btn-sm" onClick={refresh}><RefreshCw size={13} /> Refresh</button><Link className="btn btn-line btn-sm" to="/docs">Docs</Link></>}
      />

      {dash.loading && !d && <Loading />}
      {dash.error && <ErrorState message={dash.error.message} onRetry={dash.retry} />}

      {d && (
        <>
          <div className="grid-2">
            <StatCard icon={<Layers size={16} />} label="Total Endpoints" value={fmt(d.totalEndpoints)} sub={`${d.categories} kategori`} />
            <StatCard icon={<Activity size={16} />} label="Today's Request" value={fmt(d.todayRequests)} sub={`limit ${fmt(d.dailyLimit)}/hari · paket ${d.plan.name}`} />
            <StatCard icon={<Gauge size={16} />} label="Monthly Request" value={fmt(d.monthlyRequests)} sub={`${fmt(d.totalRequests)} total lifetime`} />
            <StatCard icon={<Check size={16} />} label="Success Rate" value={d.successRate == null ? '—' : `${d.successRate}%`} sub={d.avgLatencyMs == null ? 'Belum ada request' : `Avg latency ${d.avgLatencyMs} ms`} />
          </div>
          <div className="meter" aria-label="Pemakaian harian"><div style={{ width: `${Math.min(100, (d.todayRequests / Math.max(1, d.dailyLimit)) * 100)}%` }} /></div>

          <div className="card block">
            <div className="block-head"><h3>Traffic — last 24h</h3><div className="legend"><span className="dot dot-req" />Requests <span className="dot dot-err" />Errors</div></div>
            <TrafficChart data={d.traffic} />
            <p className="muted small">Jam dalam UTC.</p>
          </div>
        </>
      )}

      <div className="card block">
        <div className="block-head"><h3>Quick Action</h3></div>
        <div className="grid-3 tiles">
          <button className="tile" onClick={() => setOpen(true)}><span className="tile-icon"><KeyRound size={15} /></span>Generate API Key</button>
          <button className="tile" onClick={() => copy(`${window.location.origin}/api`, 'Base URL disalin')}><span className="tile-icon"><Link2 size={15} /></span>Copy Base URL</button>
          <Link className="tile" to="/docs"><span className="tile-icon"><BookOpen size={15} /></span>View Docs</Link>
          <Link className="tile" to="/code-snippet"><span className="tile-icon"><Code2 size={15} /></span>Code Snippet</Link>
          <Link className="tile" to="/request-log"><span className="tile-icon"><ScrollText size={15} /></span>Request Log</Link>
          <Link className="tile" to="/buy-plan"><span className="tile-icon"><CreditCard size={15} /></span>Buy Plan</Link>
        </div>
      </div>

      <div className="card block">
        <div className="block-head">
          <h3>API Keys <span className="muted small">{activeKeys}/{keys.data?.maxKeys ?? '—'} aktif</span></h3>
          <button className="btn btn-dark btn-sm" onClick={() => setOpen(true)}><Plus size={13} /> New key</button>
        </div>
        {keys.error && <ErrorState message={keys.error.message} onRetry={keys.retry} />}
        {keys.data && list.length === 0 && <EmptyState title="Belum ada API key" hint="Buat key pertama untuk mulai memanggil API." />}
        {list.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Nama</th><th>Key</th><th>Request</th><th>Terakhir dipakai</th><th /></tr></thead>
              <tbody>
                {list.map((k) => (
                  <tr key={k.id} className={k.revokedAt ? 'dim' : ''}>
                    <td>{k.label}{k.revokedAt && <span className="badge badge-off">dicabut</span>}</td>
                    <td><code>{k.prefix}…{k.last4}</code></td>
                    <td>{fmt(k.total)}</td>
                    <td>{fmtDate(k.lastUsedAt)}</td>
                    <td>{!k.revokedAt && <button className="icon-btn" aria-label={`Cabut key ${k.label}`} onClick={() => revoke(k.id, k.label)}><Trash2 size={14} /></button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card block">
        <div className="block-head"><h3>Recent Activity</h3><Link className="link small" to="/request-log">View all</Link></div>
        {d && d.recent.length === 0 && <EmptyState title="Belum ada request" hint="Kirim request pertamamu untuk melihat aktivitas di sini." />}
        {d && d.recent.length > 0 && (
          <ul className="activity">
            {d.recent.map((r) => (
              <li key={r.id}><span className={`badge ${r.status < 400 ? 'badge-ok' : 'badge-err'}`}>{r.status}</span><code>{r.method} {r.route}</code><span className="muted small">{r.ms} ms · {fmtDate(r.at)}</span></li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={open} onClose={close} label="Buat API key">
        {created ? (
          <>
            <h3>API key dibuat</h3>
            <p className="muted small">Salin sekarang. Key ini tidak akan ditampilkan lagi.</p>
            <code className="secret">{created}</code>
            <div className="modal-actions">
              <button className="btn btn-dark" onClick={async () => setCopied(await copy(created, 'API key disalin'))}><Copy size={14} /> {copied ? 'Tersalin' : 'Copy'}</button>
              <button className="btn btn-line" onClick={close}>Selesai</button>
            </div>
          </>
        ) : (
          <>
            <h3>Buat API key</h3>
            <label className="form"><span>Nama key</span><input value={label} maxLength={40} onChange={(e) => setLabel(e.target.value)} placeholder="mis. aplikasi-produksi" onKeyDown={(e) => { if (e.key === 'Enter') create(); }} /></label>
            <div className="modal-actions">
              <button className="btn btn-dark" disabled={busy || !label.trim()} onClick={create}>{busy ? 'Membuat…' : 'Buat key'}</button>
              <button className="btn btn-line" onClick={close}>Batal</button>
            </div>
          </>
        )}
      </Modal>
    </section>
  );
}
