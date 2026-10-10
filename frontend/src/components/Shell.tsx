import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity, BarChart3, BookOpen, Code2, CreditCard, FileText, History, LayoutDashboard, LogOut, Menu, MessageSquare,
  Radio, ScrollText, Trophy, User as UserIcon, X, type LucideIcon,
} from 'lucide-react';
import { Logo } from './icons';
import { useAuth } from '../context/AuthContext';

interface Item { to: string; label: string; icon: LucideIcon }
interface Group { title: string; items: Item[] }

const groups: Group[] = [
  { title: 'OVERVIEW', items: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/docs', label: 'Docs', icon: BookOpen },
  ] },
  { title: 'PAGES', items: [
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/profile', label: 'Profile', icon: UserIcon },
    { to: '/buy-plan', label: 'Buy Plan', icon: CreditCard },
    { to: '/code-snippet', label: 'Code Snippet', icon: Code2 },
    { to: '/changelog', label: 'Changelog', icon: History },
    { to: '/feedback', label: 'Feedback', icon: MessageSquare },
    { to: '/request-log', label: 'Request Log', icon: ScrollText },
    { to: '/stats', label: 'Stats', icon: BarChart3 },
  ] },
  { title: 'LEGAL', items: [
    { to: '/privacy', label: 'Privacy Policy', icon: FileText },
    { to: '/terms', label: 'Terms of Service', icon: FileText },
    { to: '/status', label: 'Status', icon: Radio },
  ] },
];

export function Shell() {
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const { user, logout } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setDrawer(false); setMenu(false); }, [loc.pathname]);

  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawer(false); };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [drawer]);

  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => { if (!menuRef.current?.contains(e.target as Node)) setMenu(false); };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [menu]);

  const signOut = () => { logout(); setDrawer(false); setMenu(false); nav('/'); };

  return (
    <>
      <header className="topbar">
        <Link to="/" className="brand" aria-label="SakuraApis beranda"><Logo size={26} /><span>SakuraApis</span></Link>
        <div className="topbar-actions">
          {user && <Link to="/dashboard" className="btn btn-ghost btn-sm hide-xs"><Activity size={14} /> Dashboard</Link>}
          <div className="menu-wrap" ref={menuRef}>
            <button className="icon-btn" aria-label="Menu akun" aria-expanded={menu} onClick={() => setMenu((o) => !o)}><UserIcon size={16} /></button>
            {menu && (
              <div className="dropdown" role="menu">
                {user ? (
                  <>
                    <div className="dropdown-email">{user.email}</div>
                    <Link role="menuitem" to="/dashboard"><LayoutDashboard size={14} /> Dashboard</Link>
                    <Link role="menuitem" to="/profile"><UserIcon size={14} /> Profile</Link>
                    <button role="menuitem" className="danger" onClick={signOut}><LogOut size={14} /> Sign Out</button>
                  </>
                ) : (
                  <>
                    <Link role="menuitem" to="/login"><UserIcon size={14} /> Login</Link>
                    <Link role="menuitem" to="/login?mode=register"><UserIcon size={14} /> Daftar</Link>
                  </>
                )}
              </div>
            )}
          </div>
          <button className="icon-btn" aria-label="Buka menu navigasi" aria-expanded={drawer} aria-controls="drawer" onClick={() => setDrawer(true)}><Menu size={16} /></button>
        </div>
      </header>

      <div className={`scrim ${drawer ? 'show' : ''}`} onClick={() => setDrawer(false)} aria-hidden="true" />
      <aside id="drawer" className={`drawer ${drawer ? 'open' : ''}`} aria-label="Navigasi utama" aria-hidden={!drawer}>
        <div className="drawer-head">
          <Link to="/" className="brand"><Logo size={26} /><span>SakuraApis</span></Link>
          <button className="icon-btn" aria-label="Tutup menu" onClick={() => setDrawer(false)} tabIndex={drawer ? 0 : -1}><X size={16} /></button>
        </div>
        <nav className="drawer-nav">
          {groups.map((g) => (
            <div key={g.title}>
              <div className="drawer-label">{g.title}</div>
              {g.items.map((i) => (
                <NavLink key={i.to} to={i.to} tabIndex={drawer ? 0 : -1} className={({ isActive }) => `drawer-link ${isActive ? 'active' : ''}`}>
                  <i.icon size={15} aria-hidden="true" /> {i.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="drawer-foot">
          {user ? (
            <>
              <div className="drawer-email">{user.email}</div>
              <Link className="btn btn-dark btn-block" to="/dashboard" tabIndex={drawer ? 0 : -1}><LayoutDashboard size={14} /> Dashboard</Link>
              <Link className="btn btn-line btn-block" to="/profile" tabIndex={drawer ? 0 : -1}><UserIcon size={14} /> Profile</Link>
              <button className="btn btn-danger btn-block" onClick={signOut} tabIndex={drawer ? 0 : -1}><LogOut size={14} /> Sign Out</button>
            </>
          ) : (
            <>
              <Link className="btn btn-dark btn-block" to="/login" tabIndex={drawer ? 0 : -1}>Login</Link>
              <Link className="btn btn-line btn-block" to="/login?mode=register" tabIndex={drawer ? 0 : -1}>Daftar</Link>
            </>
          )}
          <div className="drawer-note">SakuraApis</div>
        </div>
      </aside>
    </>
  );
}
