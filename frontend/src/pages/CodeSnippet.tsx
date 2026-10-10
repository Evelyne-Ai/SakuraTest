import { useMemo, useState } from 'react';
import { buildSnippets } from '../services/snippets';
import { usePageMeta } from '../hooks/usePageMeta';
import { CodeBlock } from '../components/CodeBlock';
import { PageHead } from '../components/ui';

export default function CodeSnippet() {
  usePageMeta('Code Snippet', 'Contoh pemanggilan API dalam 12 bahasa.');
  const snippets = useMemo(() => buildSnippets(window.location.origin), []);
  const [id, setId] = useState(snippets[0].id);
  const active = snippets.find((s) => s.id === id) ?? snippets[0];
  return (
    <section className="container section">
      <PageHead eyebrow="Pages" title="Code Snippet" desc="Ganti YOUR_API_KEY dengan key dari dashboard. Jangan menaruh key di kode frontend publik." />
      <div className="tabs" role="tablist" aria-label="Bahasa">
        {snippets.map((s) => (
          <button key={s.id} role="tab" aria-selected={s.id === id} className={`tab ${s.id === id ? 'active' : ''}`} onClick={() => setId(s.id)}>{s.label}</button>
        ))}
      </div>
      <CodeBlock code={active.code} lang={active.lang} label={active.label} />
    </section>
  );
}
