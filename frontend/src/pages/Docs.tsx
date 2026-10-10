import { api } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { usePageMeta } from '../hooks/usePageMeta';
import { CodeBlock } from '../components/CodeBlock';
import { ErrorState, Loading, PageHead } from '../components/ui';
import type { ToolStatus } from '../types';

const statusLabel: Record<ToolStatus, string> = { active: 'Active', maintenance: 'Maintenance', not_configured: 'Not configured' };

export default function Docs() {
  usePageMeta('Docs', 'Dokumentasi SakuraApis: autentikasi, limit, error, dan daftar endpoint.');
  const { data, error, loading, retry } = useFetch(async (s) => {
    const [docs, tools] = await Promise.all([api.docs(s), api.tools(s)]);
    return { docs, tools: tools.tools };
  });

  return (
    <section className="container section">
      <PageHead eyebrow="Overview" title="Docs" desc="Semua yang dibutuhkan untuk memanggil API dengan API key." />
      {loading && <Loading />}
      {error && <ErrorState message={error.message} onRetry={retry} />}
      {data && (
        <>
          {data.docs.docs.map((d) => (
            <article className="card block" id={d.id} key={d.id}>
              <h3>{d.title}</h3>
              <p>{d.body}</p>
            </article>
          ))}

          <article className="card block">
            <h3>Contoh singkat</h3>
            <CodeBlock lang="bash" label="cURL" code={`curl "${window.location.origin}/api/v1/me" \\\n  -H 'X-API-Key: YOUR_API_KEY'`} />
          </article>

          <article className="card block">
            <h3>Endpoints</h3>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Method</th><th>Path</th><th>Akses</th><th>Keterangan</th></tr></thead>
                <tbody>
                  {data.docs.endpoints.map((e) => (
                    <tr key={`${e.method} ${e.path}`}>
                      <td><span className={`badge badge-${e.method.toLowerCase()}`}>{e.method}</span></td>
                      <td><code>{e.path}</code></td>
                      <td>{e.auth === 'apikey' ? 'API key' : 'Publik'}</td>
                      <td>{e.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="card block">
            <h3>Tools ({data.tools.length})</h3>
            <p className="muted small">Dipanggil lewat <code>POST /api/v1/tools/:slug/run</code>. Status Not configured berarti runner belum tersedia di server ini.</p>
            {data.tools.map((t) => (
              <details className="faq" key={t.slug}>
                <summary>{t.name} <code>{t.slug}</code> <span className={`badge badge-${t.status}`}>{statusLabel[t.status]}</span></summary>
                <p className="muted">{t.description}</p>
                {t.fields.length > 0 && (
                  <ul className="plain">
                    {t.fields.map((f) => (
                      <li key={f.name}><code>{f.name}</code> — {f.type}{f.required ? ', wajib' : ''}{f.options ? ` (${f.options.join(' | ')})` : ''}{f.default !== undefined ? `, default ${String(f.default)}` : ''}</li>
                    ))}
                  </ul>
                )}
              </details>
            ))}
          </article>
        </>
      )}
    </section>
  );
}
