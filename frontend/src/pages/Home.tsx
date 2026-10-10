import { Link } from 'react-router-dom';
import { Activity, BarChart3, Braces, FileJson, Gauge, KeyRound, ScrollText, ShieldCheck, Trophy } from 'lucide-react';
import { api } from '../services/api';
import { buildSnippets } from '../services/snippets';
import { useFetch } from '../hooks/useFetch';
import { usePageMeta } from '../hooks/usePageMeta';
import { useAuth } from '../context/AuthContext';
import { CodeBlock } from '../components/CodeBlock';
import { FaqList } from '../components/FaqList';
import { StatCard, fmt } from '../components/ui';

const features = [
  { icon: KeyRound, title: 'API Key', text: 'Buat dan cabut key kapan saja. Server hanya menyimpan hash, key utuh tampil sekali.' },
  { icon: FileJson, title: 'JSON Response', text: 'Semua endpoint membalas JSON dengan format error yang konsisten.' },
  { icon: Gauge, title: 'Rate Limit', text: 'Limit request harian per akun sesuai paket, sisa limit ada di header respons.' },
  { icon: Activity, title: 'Analytics', text: 'Grafik traffic 24 jam, request bulanan, dan success rate di dashboard.' },
  { icon: ScrollText, title: 'Request Log', text: 'Riwayat request per akun: method, route, status, durasi. Tanpa isi body.' },
  { icon: ShieldCheck, title: 'Validasi Input', text: 'Setiap field divalidasi di server dengan skema, input salah ditolak dengan 400.' },
  { icon: Braces, title: 'OpenAPI 3.1', text: 'Spesifikasi dibangkitkan otomatis di /api/openapi.json.' },
  { icon: Trophy, title: 'Leaderboard', text: 'Peringkat pengguna berdasarkan jumlah request. Email tidak ditampilkan.' },
];

export default function Home() {
  usePageMeta('Beranda', 'SakuraApis: REST API dengan manajemen API key, dashboard, dan request log.');
  const { user } = useAuth();
  const stats = useFetch((s) => api.stats(s));
  const faq = useFetch((s) => api.docs(s));
  const plans = useFetch((s) => api.plans(s));
  const free = plans.data?.plans.find((p) => p.id === 'free');
  const snippet = buildSnippets(window.location.origin)[0];

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Build powerful <span>SakuraApis</span> faster</h1>
          <p className="lead">Platform REST API dengan manajemen API key, dashboard pemakaian, request log, dan dokumentasi yang jelas.</p>
          <div className="hero-cta">
            <Link className="btn btn-dark" to={user ? '/dashboard' : '/login?mode=register'}>{user ? 'Go to Dashboard' : 'Get API Key'}</Link>
            <Link className="btn btn-line" to="/docs">View Documentation</Link>
          </div>
          <ul className="chips">
            <li>{free ? `${fmt(free.dailyLimit)} request/hari gratis` : 'Paket Free tersedia'}</li>
            <li>REST + JSON</li>
            <li>OpenAPI 3.1</li>
          </ul>
        </div>
      </section>

      <section className="container">
        <div className="grid-3">
          <StatCard icon={<Braces size={16} />} label="Endpoints" value={stats.loading ? '…' : fmt(stats.data?.activeTools)} />
          <StatCard icon={<Activity size={16} />} label="API Requests" value={stats.loading ? '…' : fmt(stats.data?.keyedRequestsTotal)} />
          <StatCard icon={<BarChart3 size={16} />} label="Success Rate" value={stats.loading ? '…' : stats.data?.successRate == null ? '—' : `${stats.data.successRate}%`} />
        </div>
        {stats.error && <p className="muted small">Statistik tidak tersedia: backend tidak terjangkau.</p>}
        <p className="muted small">Success rate dihitung sejak server terakhir menyala.</p>
      </section>

      <section className="container section">
        <div className="center">
          <span className="eyebrow">Features</span>
          <h2 className="h2">Everything you need to ship APIs</h2>
          <p className="muted">Fitur di bawah ini sudah berjalan di server ini, bukan rencana.</p>
        </div>
        <div className="grid-2 features-grid">
          {features.map((f) => (
            <div className="card feature" key={f.title}>
              <div className="stat-icon"><f.icon size={16} /></div>
              <h3>{f.title}</h3>
              <p className="muted small">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="center">
          <span className="eyebrow">API Example</span>
          <h2 className="h2">One request. Clean response.</h2>
          <p className="muted">Ganti YOUR_API_KEY dengan key dari dashboard. <Link to="/code-snippet" className="link">Lihat 12 bahasa</Link>.</p>
        </div>
        <CodeBlock code={snippet.code} lang="bash" label="cURL" />
        <CodeBlock code={'{\n  "slug": "hash",\n  "result": {\n    "algorithm": "sha256",\n    "output": "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"\n  }\n}'} lang="json" label="response" />
      </section>

      {faq.data && (
        <section className="container section">
          <div className="center"><span className="eyebrow">FAQ</span><h2 className="h2">Frequently asked questions</h2></div>
          <FaqList items={faq.data.faq} />
        </section>
      )}

      <section className="container section">
        <div className="card cta">
          <h2 className="h2">{user ? 'Welcome back! Your APIs are ready.' : 'Siap membuat API key pertama?'}</h2>
          <p className="muted">{user ? 'Buka dashboard untuk mengelola key dan memantau pemakaian.' : 'Daftar gratis lalu buat key dalam hitungan detik.'}</p>
          <div className="hero-cta">
            <Link className="btn btn-dark" to={user ? '/dashboard' : '/login?mode=register'}>{user ? 'Open Dashboard' : 'Daftar sekarang'}</Link>
            <Link className="btn btn-line" to="/docs">Read the Docs</Link>
          </div>
        </div>
      </section>
    </>
  );
}
