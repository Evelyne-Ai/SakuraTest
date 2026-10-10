import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { usePageMeta } from '../hooks/usePageMeta';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageHead, fmtDate } from '../components/ui';

export default function Profile() {
  usePageMeta('Profile');
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user?.name ?? '');
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [busy, setBusy] = useState(false);
  if (!user) return null;

  const saveName = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try { setUser((await api.updateMe(name.trim())).user); toast('Profil disimpan', 'success'); } catch (err) { toast((err as Error).message, 'error'); } finally { setBusy(false); }
  };

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try { await api.changePassword(current, next); setCurrent(''); setNext(''); toast('Password diganti', 'success'); } catch (err) { toast((err as Error).message, 'error'); } finally { setBusy(false); }
  };

  return (
    <section className="container section narrow">
      <PageHead eyebrow="Pages" title="Profile" />
      <div className="card block">
        <dl className="kv">
          <div><dt>Email</dt><dd>{user.email}</dd></div>
          <div><dt>Paket</dt><dd>{user.planName} · <Link className="link" to="/buy-plan">Buy Plan</Link></dd></div>
          <div><dt>Role</dt><dd>{user.role}</dd></div>
          <div><dt>Bergabung</dt><dd>{fmtDate(user.createdAt)}</dd></div>
        </dl>
      </div>
      <form className="card block form" onSubmit={saveName}>
        <h3>Nama tampilan</h3>
        <label>Nama (tampil di leaderboard)<input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} required /></label>
        <button className="btn btn-dark" disabled={busy || !name.trim() || name.trim() === user.name}>Simpan</button>
      </form>
      <form className="card block form" onSubmit={savePassword}>
        <h3>Ganti password</h3>
        <label>Password saat ini<input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required /></label>
        <label>Password baru<input type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" minLength={8} required /></label>
        <button className="btn btn-dark" disabled={busy || !current || next.length < 8}>Ganti password</button>
      </form>
    </section>
  );
}
