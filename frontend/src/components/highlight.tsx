import type { ReactNode } from 'react';

type Lang = 'json' | 'bash' | 'text';

// Highlighter sederhana (tanpa dependensi). Cukup untuk JSON dan perintah curl.
export function highlight(code: string, lang: Lang): ReactNode[] {
  if (lang === 'text') return [code];
  const re = lang === 'json'
    ? /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g
    : /('(?:[^']*)'|"(?:\\.|[^"\\])*")|(^|\s)(curl)(?=\s)|(\s-[A-Za-z-]+)/g;
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(code))) {
    if (m.index > last) out.push(code.slice(last, m.index));
    if (lang === 'json') {
      if (m[1]) out.push(<span key={i++} className={m[2] ? 'tk-key' : 'tk-str'}>{m[1]}</span>, m[2] ?? '');
      else if (m[3]) out.push(<span key={i++} className="tk-kw">{m[3]}</span>);
      else out.push(<span key={i++} className="tk-num">{m[4]}</span>);
    } else if (m[1]) out.push(<span key={i++} className="tk-str">{m[1]}</span>);
    else if (m[3]) out.push(m[2] ?? '', <span key={i++} className="tk-kw">{m[3]}</span>);
    else out.push(<span key={i++} className="tk-num">{m[4]}</span>);
    last = re.lastIndex;
  }
  out.push(code.slice(last));
  return out;
}
