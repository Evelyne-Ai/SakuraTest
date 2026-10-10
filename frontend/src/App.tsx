import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Shell } from './components/Shell';
import { Footer } from './components/Footer';
import { RequireAuth } from './components/RequireAuth';
import Home from './pages/Home';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Docs = lazy(() => import('./pages/Docs'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Profile = lazy(() => import('./pages/Profile'));
const BuyPlan = lazy(() => import('./pages/BuyPlan'));
const CodeSnippet = lazy(() => import('./pages/CodeSnippet'));
const Changelog = lazy(() => import('./pages/Changelog'));
const Feedback = lazy(() => import('./pages/Feedback'));
const RequestLog = lazy(() => import('./pages/RequestLog'));
const Stats = lazy(() => import('./pages/Stats'));
const Status = lazy(() => import('./pages/Status'));
const Legal = lazy(() => import('./pages/Legal'));
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  const { pathname, hash } = useLocation();
  useEffect(() => { if (!hash) window.scrollTo(0, 0); }, [pathname, hash]);

  return (
    <>
      <a href="#main" className="skip">Lewati ke konten</a>
      <Shell />
      <main id="main">
        <Suspense fallback={<div className="container section"><p className="muted">Memuat…</p></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/request-log" element={<RequireAuth><RequestLog /></RequireAuth>} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/buy-plan" element={<BuyPlan />} />
            <Route path="/code-snippet" element={<CodeSnippet />} />
            <Route path="/changelog" element={<Changelog />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/status" element={<Status />} />
            <Route path="/privacy" element={<Legal kind="privacy" />} />
            <Route path="/terms" element={<Legal kind="terms" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
