import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';

export default function NotFound() {
  usePageMeta('Halaman tidak ditemukan');
  return (
    <section className="container section narrow center">
      <h1 className="h1">404</h1>
      <p className="muted">Halaman tidak ditemukan.</p>
      <Link className="btn btn-dark" to="/">Kembali ke beranda</Link>
    </section>
  );
}
