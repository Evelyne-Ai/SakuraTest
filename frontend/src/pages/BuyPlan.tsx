import { Check } from 'lucide-react';
import { api } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { usePageMeta } from '../hooks/usePageMeta';
import { useAuth } from '../context/AuthContext';
import { ErrorState, Loading, PageHead } from '../components/ui';

export default function BuyPlan() {
  usePageMeta('Buy Plan', 'Pilih paket API sesuai kebutuhan.');
  const { user } = useAuth();
  const { data, error, loading, retry } = useFetch((s) => api.plans(s));
  return (
    <section className="container section">
      <PageHead eyebrow="Pages" title="Pilih Paket API" desc="Paket menentukan limit request harian dan jumlah API key aktif." />
      {loading && <Loading />}
      {error && <ErrorState message={error.message} onRetry={retry} />}
      {data && (
        <>
          <div className="plans">
            {data.plans.map((p) => {
              const current = user?.plan === p.id;
              return (
                <div className={`card plan ${p.highlighted ? 'plan-hl' : ''}`} key={p.id}>
                  {p.highlighted && <span className="eyebrow">Populer</span>}
                  <h3>{p.name}</h3>
                  <div className="price">{p.price || 'Harga hubungi admin'}{p.period && <span className="muted small"> / {p.period}</span>}</div>
                  <ul className="plain checks">
                    {p.features.map((f) => <li key={f}><Check size={14} /> {f}</li>)}
                  </ul>
                  {current ? <span className="badge badge-ok">Paket kamu saat ini</span>
                    : p.id === 'free' ? null
                    : data.buyContactUrl
                      ? <a className="btn btn-dark btn-block" href={data.buyContactUrl} target="_blank" rel="noopener noreferrer">Hubungi untuk membeli</a>
                      : <p className="muted small">Kontak pembelian belum diatur oleh pemilik situs.</p>}
                </div>
              );
            })}
          </div>
          <p className="muted small center">{data.note} Setelah pembayaran, sebutkan email akunmu agar admin mengaktifkan paket.</p>
        </>
      )}
    </section>
  );
}
