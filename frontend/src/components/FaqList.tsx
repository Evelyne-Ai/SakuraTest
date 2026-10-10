import type { FaqItem } from '../types';

export function FaqList({ items }: { items: FaqItem[] }) {
  return <>{items.map((f) => <details className="card faq" key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</>;
}
