import { Component, lazy, Suspense, useEffect, useState, type ErrorInfo, type ReactNode } from 'react';
import { HashRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router';
import { TriangleAlert, X } from 'lucide-react';
import { BottomNav } from './components/AppShell';
import { Toasts } from './features/gamification/Toasts';
import { useData, useProgress } from './store/useProgress';
import LearnPage from './pages/LearnPage';
import LessonRoute from './pages/LessonPage';
import { Robot } from './components/illustrations';
import { Button } from './components/ui';

const SessionRoute = lazy(() => import('./pages/SessionPage'));
const PracticePage = lazy(() => import('./pages/PracticePage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPages').then((m) => ({ default: m.ProjectsPage })));
const ProjectPage = lazy(() => import('./pages/ProjectsPages').then((m) => ({ default: m.ProjectPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePages').then((m) => ({ default: m.ProfilePage })));
const AchievementsPage = lazy(() => import('./pages/ProfilePages').then((m) => ({ default: m.AchievementsPage })));
const SettingsPage = lazy(() => import('./pages/ProfilePages').then((m) => ({ default: m.SettingsPage })));
const SimPage = lazy(() => import('./pages/LabPages').then((m) => ({ default: m.SimPage })));
const CircuitPage = lazy(() => import('./pages/LabPages').then((m) => ({ default: m.CircuitPage })));

export default function App() {
  useAppearance();
  return (
    <HashRouter>
      <ErrorBoundary>
        <ScrollReset />
        <StorageNotice />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route element={<TabLayout />}>
              <Route path="/learn" element={<LearnPage />} />
              <Route path="/practice" element={<PracticePage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route path="/lesson/:id" element={<LessonRoute />} />
            <Route path="/session/:mode" element={<SessionRoute />} />
            <Route path="/lab/sim/:id" element={<SimPage />} />
            <Route path="/lab/circuit/:id" element={<CircuitPage />} />
            <Route path="/projects/:id" element={<ProjectPage />} />
            <Route path="/profile/achievements" element={<AchievementsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/" element={<Navigate to="/learn" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Toasts />
      </ErrorBoundary>
    </HashRouter>
  );
}

function TabLayout() {
  return (
    <>
      <Suspense fallback={<Loading />}>
        <Outlet />
      </Suspense>
      <BottomNav />
    </>
  );
}

function ScrollReset() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

function Loading() {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center" role="status">
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink-3">Loading…</span>
    </div>
  );
}

function NotFound() {
  return (
    <div className="pt-safe mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center px-6 text-center">
      <Robot size={110} mood="think" />
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <p className="mt-1 text-ink-2">That screen doesn’t exist. Your progress is safe.</p>
      <Button className="mt-6" onClick={() => (window.location.hash = '#/learn')}>Go to Learn</Button>
    </div>
  );
}

/** Applies theme, contrast and motion settings to <html>. */
function useAppearance() {
  const s = useData((d) => d.settings);
  useEffect(() => {
    const root = document.documentElement;
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = s.theme === 'dark' || (s.theme === 'system' && mq.matches);
      root.dataset.theme = dark ? 'dark' : 'light';
      root.dataset.contrast = s.highContrast ? 'high' : 'normal';
      root.dataset.motion = s.motion === 'system' ? '' : s.motion;
      const bg = dark ? '#16181B' : '#F3F0E8';
      document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', bg));
    };
    apply();
    mq.addEventListener?.('change', apply);
    return () => mq.removeEventListener?.('change', apply);
  }, [s.theme, s.highContrast, s.motion]);
}

function StorageNotice() {
  const boot = useProgress((s) => s.boot);
  const [hidden, setHidden] = useState(false);
  if (!boot || hidden) return null;
  let text = '';
  if (!boot.storageOk) text = 'This browser is blocking storage (private mode?). Progress lasts only until you close the app — use Settings → Export Progress to keep it.';
  else if (boot.recovered) text = 'Some saved data was damaged, so Servolab restored your most recent good copy.';
  if (!text) return null;
  return (
    <div className="pt-safe-3 fixed inset-x-0 top-0 z-[55] px-3">
      <div role="alert" className="mx-auto flex max-w-xl items-start gap-2 rounded-2xl border-2 border-ink bg-gold-soft p-3 text-sm font-medium shadow-[0_3px_0_rgb(var(--ink))]">
        <TriangleAlert size={18} className="mt-0.5 shrink-0" />
        <span className="flex-1">{text}</span>
        <button onClick={() => setHidden(true)} className="press -m-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" aria-label="Dismiss">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Servolab error:', error, info.componentStack);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="pt-safe mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center px-6 text-center">
        <Robot size={110} mood="sad" />
        <h1 className="mt-4 text-2xl font-bold">Something went wrong</h1>
        <p className="mt-1 text-ink-2">This screen hit an unexpected error. Your progress is saved on this device.</p>
        <p className="mt-2 max-w-full truncate font-mono text-xs text-ink-3">{this.state.error.message}</p>
        <div className="mt-6 flex flex-col gap-2">
          <Button onClick={() => { this.setState({ error: null }); window.location.hash = '#/learn'; }}>Go to Learn</Button>
          <Button variant="ghost" onClick={() => window.location.reload()}>Reload app</Button>
        </div>
      </div>
    );
  }
}
