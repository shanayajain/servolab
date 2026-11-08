import { useEffect } from 'react';
import { Target, TrendingUp, X } from 'lucide-react';
import { useUi, type Toast } from '../../store/useUi';
import { getAchievement } from './achievements';
import { levelTitle } from './levels';
import { AchievementBadge } from '../../components/illustrations';

/** Celebration toasts for level-ups, achievements and daily goals. */
export function Toasts() {
  const toasts = useUi((s) => s.toasts);
  return (
    <div className="pt-safe-3 pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 px-3" aria-live="polite">
      {toasts.slice(0, 1).map((t) => <ToastItem key={t.id} toast={t} />)}
    </div>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useUi((s) => s.dismiss);
  useEffect(() => {
    const id = setTimeout(() => dismiss(toast.id), 3800);
    return () => clearTimeout(id);
  }, [toast.id, dismiss]);
  const e = toast.event;
  let icon = null;
  let title = '';
  let body = '';
  if (e.kind === 'achievement') {
    const a = getAchievement(e.id);
    if (!a) return null;
    icon = <AchievementBadge icon={a.icon} tier={a.tier} unlocked size={46} />;
    title = `Achievement · ${a.title}`;
    body = a.description;
  } else if (e.kind === 'level') {
    icon = <span className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-ink bg-brand text-[#1C1F22]"><TrendingUp size={22} /></span>;
    title = `Level ${e.level} reached`;
    body = `You are now a ${levelTitle(e.level)}.`;
  } else if (e.kind === 'goal') {
    icon = <span className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-ink bg-gold text-[#1C1F22]"><Target size={22} /></span>;
    title = 'Daily goal complete';
    body = `${e.xp} XP today — keep the streak alive tomorrow.`;
  } else return null;
  return (
    <div role="status" className="anim-pop pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl border-2 border-ink bg-panel p-3 shadow-[0_4px_0_rgb(var(--ink))]">
      <span className="anim-unlock">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="font-bold leading-tight">{title}</p>
        <p className="text-sm leading-snug text-ink-2">{body}</p>
      </div>
      <button onClick={() => dismiss(toast.id)} className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-sunken" aria-label="Dismiss">
        <X size={18} />
      </button>
    </div>
  );
}
