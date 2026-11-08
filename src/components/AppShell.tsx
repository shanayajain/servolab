import { NavLink, useLocation } from 'react-router';
import { BookOpen, ChartColumn, Dumbbell, User, Wrench } from 'lucide-react';
import type { ReactNode } from 'react';

const TABS = [
  { to: '/learn', label: 'Learn', Icon: BookOpen },
  { to: '/practice', label: 'Practice', Icon: Dumbbell },
  { to: '/projects', label: 'Projects', Icon: Wrench },
  { to: '/progress', label: 'Progress', Icon: ChartColumn },
  { to: '/profile', label: 'Profile', Icon: User }
];

export function BottomNav() {
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-panel" aria-label="Main">
      <ul className="mx-auto grid max-w-2xl grid-cols-5">
        {TABS.map(({ to, label, Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `press group flex min-h-[60px] flex-col items-center justify-center gap-0.5 ${isActive ? 'text-ink' : 'text-ink-3'}`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`flex h-8 w-12 items-center justify-center rounded-lg transition-colors ${isActive ? 'bg-brand text-[#1C1F22]' : ''}`}>
                    <Icon size={21} strokeWidth={isActive ? 2.6 : 2.1} aria-hidden />
                  </span>
                  <span className={`font-mono text-[10px] font-bold uppercase tracking-wider ${isActive ? '' : ''}`}>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Standard tab page: sticky header + scrollable content above the bottom nav. */
export function Page({ title, eyebrow, actions, children, wide }: { title: string; eyebrow?: string; actions?: ReactNode; children: ReactNode; wide?: boolean }) {
  const loc = useLocation();
  return (
    <div className="nav-space min-h-[100dvh]">
      <header className="pt-safe sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur-sm">
        <div className={`mx-auto flex min-h-[56px] items-center justify-between gap-3 px-4 ${wide ? 'max-w-3xl' : 'max-w-2xl'}`}>
          <div className="min-w-0">
            {eyebrow && <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-3">{eyebrow}</p>}
            <h1 className="truncate text-[22px] font-bold leading-tight">{title}</h1>
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      </header>
      <main key={loc.pathname} className={`anim-fade mx-auto px-4 pb-6 pt-3 ${wide ? 'max-w-3xl' : 'max-w-2xl'}`}>{children}</main>
    </div>
  );
}

/** Sub-page header with a back button (no bottom nav padding when `bare`). */
export function SubHeader({ title, eyebrow, onBack, right }: { title: string; eyebrow?: string; onBack: () => void; right?: ReactNode }) {
  return (
    <header className="pt-safe sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex min-h-[56px] max-w-2xl items-center gap-2 px-2">
        <button onClick={onBack} className="press flex h-11 w-11 shrink-0 items-center justify-center rounded-xl hover:bg-sunken" aria-label="Back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <div className="min-w-0 flex-1">
          {eyebrow && <p className="truncate font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-3">{eyebrow}</p>}
          <h1 className="truncate text-lg font-bold leading-tight">{title}</h1>
        </div>
        {right}
      </div>
    </header>
  );
}
