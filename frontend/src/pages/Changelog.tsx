import { api } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { usePageMeta } from '../hooks/usePageMeta';
import { ErrorState, Loading, PageHead } from '../components/ui';

export default function Changelog() {
  usePageMeta('Changelog', 'Riwayat perubahan SakuraApis.');
  const { data, error, loading, retry } = useFetch((s) => api.changelog(s));
  return (
    <section className="container section narrow">
      <PageHead eyebrow="Pages" title="Changelog" desc="Riwayat perubahan SakuraApis." />
      {loading && <Loading />}
      {error && <ErrorState message={error.message} onRetry={retry} />}
      {data?.changelog.map((e) => (
        <article className="card block" key={e.version}>
          <h3>v{e.version} <span className="muted small">{e.date}</span></h3>
          <ul>{e.items.map((i) => <li key={i}>{i}</li>)}</ul>
        </article>
      ))}
    </section>
  );
}
