import { Copy } from 'lucide-react';
import { highlight } from './highlight';
import { useToast } from '../context/ToastContext';

export function CodeBlock({ code, lang = 'text', label }: { code: string; lang?: 'json' | 'bash' | 'text'; label?: string }) {
  const toast = useToast();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast('Disalin ke clipboard', 'success');
    } catch {
      toast('Gagal menyalin. Salin manual.', 'error');
    }
  };
  return (
    <div className="code">
      <div className="code-head">
        <span>{label ?? lang}</span>
        <button className="btn btn-ghost btn-sm" onClick={copy} aria-label="Copy kode"><Copy size={14} /> Copy</button>
      </div>
      <pre tabIndex={0}><code>{highlight(code, lang)}</code></pre>
    </div>
  );
}
