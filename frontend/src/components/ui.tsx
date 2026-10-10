import type { ReactNode } from 'react';
import { AlertTriangle, Inbox } from 'lucide-react';

export function PageHead({ eyebrow, title, desc, actions }: { eyebrow?: string; title: string; desc?: string; actions?: ReactNode }) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="h1">{title}</h1>
        {desc && <p className="muted">{desc}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

export function StatCard({ icon, label, value, sub }: { icon: ReactNode; label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="card stat">
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state" role="alert">
      <AlertTriangle size={26} />
      <h3>Gagal memuat data</h3>
      <p>{message}</p>
      {onRetry && <button className="btn btn-line btn-sm" onClick={onRetry}>Coba lagi</button>}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="state">
      <Inbox size={26} />
      <h3>{title}</h3>
      {hint && <p>{hint}</p>}
    </div>
  );
}

export function Loading({ label = 'Memuat…' }: { label?: string }) {
  return <div className="state" aria-busy="true"><p>{label}</p></div>;
}

export const fmt = (n: number | null | undefined) => (n == null ? '—' : n.toLocaleString('id-ID'));
export const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '—');
