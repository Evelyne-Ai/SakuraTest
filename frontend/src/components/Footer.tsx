import { Link } from 'react-router-dom';
import { Logo } from './icons';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="brand"><Logo size={24} /><span>SakuraApis</span></div>
          <p className="muted small">Platform REST API dengan manajemen API key, dashboard pemakaian, dan request log.</p>
        </div>
        <div>
          <div className="footer-title">Produk</div>
          <Link to="/docs">Docs</Link><Link to="/code-snippet">Code Snippet</Link><Link to="/buy-plan">Buy Plan</Link><Link to="/changelog">Changelog</Link>
        </div>
        <div>
          <div className="footer-title">Legal</div>
          <Link to="/privacy">Privacy Policy</Link><Link to="/terms">Terms of Service</Link><Link to="/status">Status</Link><Link to="/feedback">Feedback</Link>
        </div>
      </div>
      <div className="container footer-bottom muted small">© {new Date().getFullYear()} SakuraApis</div>
    </footer>
  );
}
