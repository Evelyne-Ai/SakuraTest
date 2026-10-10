import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageHead } from '../components/ui';

export default function Login() {
  const [params, setParams] = useSearchParams();
  const mode = params.get('mode') === 'register' ? 'register' : 'login';
  usePageMeta(mode === 'register' ? 'Daftar' : 'Login');
  const { user, login, register } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const from = (loc.state as { from?: string } | null)?.from ?? '/dashboard';

  if (user) return <Navigate to={from} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'register') await register(email.trim(), password, name.trim() || undefined);
      else await login(email.trim(), password);
      toast(mode === 'register' ? 'Akun dibuat' : 'Berhasil login', 'success');
      nav(from, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="container section narrow">
      <PageHead title={mode === 'register' ? 'Daftar' : 'Login'} desc={mode === 'register' ? 'Buat akun untuk mendapatkan API key.' : 'Masuk untuk membuka dashboard.'} />
      <form className="card form" onSubmit={submit}>
        {mode === 'register' && (
          <label>Nama (opsional)<input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="nickname" /></label>
        )}
        <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="nama@gmail.com" /></label>
        <label>Password<input type="password" required minLength={mode === 'register' ? 8 : 1} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
          {mode === 'register' && <span className="muted small">Minimal 8 karakter.</span>}
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn btn-dark btn-block" disabled={busy}>{busy ? 'Memproses…' : mode === 'register' ? 'Daftar' : 'Login'}</button>
        <p className="muted small center">
          {mode === 'register' ? 'Sudah punya akun? ' : 'Belum punya akun? '}
          <button type="button" className="link" onClick={() => setParams(mode === 'register' ? {} : { mode: 'register' })}>{mode === 'register' ? 'Login' : 'Daftar'}</button>
        </p>
      </form>
    </section>
  );
}
