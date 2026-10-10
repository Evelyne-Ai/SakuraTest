import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { usePageMeta } from '../hooks/usePageMeta';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { EmptyState, PageHead, fmtDate } from '../components/ui';

export default function Feedback() {
  usePageMeta('Feedback', 'Kirim saran atau laporan masalah.');
  const { user } = useAuth();
  const toast = useToast();
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [busy, setBusy] = useState(false);
  const mine = useFetch(async (s) => (user ? api.feedback(s) : { feedback: [] }), [user?.id]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.sendFeedback(message.trim(), rating || undefined);
      setMessage(''); setRating(0);
      toast('Terima kasih, feedback terkirim', 'success');
      mine.retry();
    } catch (err) { toast((err as Error).message, 'error'); } finally { setBusy(false); }
  };

  return (
    <section className="container section narrow">
      <PageHead eyebrow="Pages" title="Feedback" desc="Ceritakan saran, bug, atau fitur yang kamu butuhkan." />
      {!user ? (
        <div className="card block"><p>Silakan <Link className="link" to="/login" state={{ from: '/feedback' }}>login</Link> untuk mengirim feedback.</p></div>
      ) : (
        <form className="card block form" onSubmit={submit}>
          <label>Pesan<textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} minLength={5} maxLength={1000} required /></label>
          <div className="rating" role="radiogroup" aria-label="Rating (opsional)">
            {[1, 2, 3, 4, 5].map((n) => (
              <button type="button" key={n} role="radio" aria-checked={rating === n} className={`rate ${rating >= n ? 'on' : ''}`} onClick={() => setRating(rating === n ? 0 : n)}>{n}</button>
            ))}
            <span className="muted small">Rating opsional</span>
          </div>
          <button className="btn btn-dark" disabled={busy || message.trim().length < 5}>{busy ? 'Mengirim…' : 'Kirim feedback'}</button>
        </form>
      )}
      {user && (
        <div className="card block">
          <h3>Feedback kamu</h3>
          {mine.data && mine.data.feedback.length === 0 && <EmptyState title="Belum ada feedback" />}
          <ul className="activity">
            {mine.data?.feedback.map((f) => (
              <li key={f.id}><div><p>{f.message}</p><span className="muted small">{fmtDate(f.at)}{f.rating ? ` · rating ${f.rating}/5` : ''}</span></div></li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
