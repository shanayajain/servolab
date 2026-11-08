import { useEffect, useState } from 'react';
import { Bolt, ChevronDown, Flame, Target } from 'lucide-react';
import type { ResolvedQuestion } from '../../lib/types';
import { correctAnswerText } from '../../lib/answers';
import { Button, Ring } from '../../components/ui';
import { Robot } from '../../components/illustrations';
import { useData } from '../../store/useProgress';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface Action {
  label: string;
  onClick: () => void;
}

export interface CompletionProps {
  heading: string;
  title: string;
  xp: number;
  correct: number;
  total: number;
  concepts: string[];
  mistakes: ResolvedQuestion[];
  streak: number;
  streakExtended: boolean;
  passed?: boolean | null;
  passMark?: number;
  primary: Action;
  secondary?: Action;
}

function useCountUp(target: number, ms = 900): number {
  const reduced = useReducedMotion();
  const [v, setV] = useState(reduced ? target : 0);
  useEffect(() => {
    if (reduced) {
      setV(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, reduced]);
  return v;
}

export function CompletionScreen(p: CompletionProps) {
  const color = useData((d) => d.profile.avatarColor);
  const xp = useCountUp(p.xp);
  const acc = p.total ? p.correct / p.total : 0;
  const [showMistakes, setShowMistakes] = useState(false);
  const failed = p.passed === false;
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col bg-paper">
      <main className="pt-safe flex-1 px-5 pb-40">
        <div className="bg-dotgrid -mx-5 flex flex-col items-center px-5 pb-6 pt-10 text-center">
          <div className="anim-pop">
            <Robot size={120} color={color} mood={failed ? 'think' : 'happy'} />
          </div>
          <p className="mt-4 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">{p.title}</p>
          <h1 className="mt-1 text-3xl font-bold">{p.heading}</h1>
          {p.passMark !== undefined && (
            <p className={`mt-2 rounded-lg px-3 py-1 text-sm font-semibold ${failed ? 'bg-gold-soft text-ink' : 'bg-ok-soft text-ok'}`}>
              {failed ? `You need ${Math.round(p.passMark * 100)}% to pass — review and try again.` : `Passed with ${Math.round(acc * 100)}%`}
            </p>
          )}
        </div>

        <div className="stagger grid grid-cols-3 gap-2.5">
          <div className="rounded-2xl border-2 border-ink bg-gold-soft p-3 text-center">
            <Bolt className="mx-auto text-gold" size={22} aria-hidden />
            <p className="tabular mt-1 font-mono text-2xl font-bold" aria-label={`${p.xp} XP earned`}>+{xp}</p>
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-2">XP earned</p>
          </div>
          <div className="flex flex-col items-center rounded-2xl border-2 border-ink bg-panel p-3">
            <Ring value={acc} size={52} stroke={6} tone={acc >= 0.8 ? 'ok' : acc >= 0.5 ? 'gold' : 'brand'} label={`Accuracy ${Math.round(acc * 100)}%`}>
              <Target size={18} className="text-ink-2" aria-hidden />
            </Ring>
            <p className="tabular mt-1 font-mono text-lg font-bold leading-none">{Math.round(acc * 100)}%</p>
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-2">Accuracy</p>
          </div>
          <div className="rounded-2xl border-2 border-ink bg-brand-soft p-3 text-center">
            <Flame className={`mx-auto text-brand ${p.streakExtended ? 'anim-pop' : ''}`} size={22} aria-hidden />
            <p className="tabular mt-1 font-mono text-2xl font-bold">{p.streak}</p>
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-2">{p.streakExtended ? 'Streak +1' : 'Day streak'}</p>
          </div>
        </div>

        <p className="mt-3 text-center text-sm text-ink-2">
          {p.correct} of {p.total} correct on the first try
        </p>

        {p.concepts.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-3">Concepts {failed ? 'practised' : 'learned'}</h2>
            <div className="flex flex-wrap gap-2">
              {p.concepts.map((c) => (
                <span key={c} className="rounded-lg border border-line bg-panel px-2.5 py-1 text-sm font-semibold">{c}</span>
              ))}
            </div>
          </section>
        )}

        <section className="mt-6">
          {p.mistakes.length === 0 ? (
            <p className="rounded-2xl bg-ok-soft px-4 py-3 text-sm font-semibold text-ok">No mistakes — every answer right first time.</p>
          ) : (
            <div className="rounded-2xl border border-line bg-panel">
              <button onClick={() => setShowMistakes((s) => !s)} aria-expanded={showMistakes} className="press flex min-h-[52px] w-full items-center justify-between px-4 text-left font-bold">
                <span>Review {p.mistakes.length} mistake{p.mistakes.length > 1 ? 's' : ''}</span>
                <ChevronDown size={20} className={`transition-transform ${showMistakes ? 'rotate-180' : ''}`} />
              </button>
              {showMistakes && (
                <ul className="divide-y divide-line border-t border-line">
                  {p.mistakes.map((m) => (
                    <li key={m.qid} className="px-4 py-3">
                      <p className="text-sm font-semibold">{m.q.prompt}</p>
                      <p className="mt-1 whitespace-pre-line font-mono text-sm text-ok">✓ {correctAnswerText(m.q)}</p>
                      <p className="mt-1 text-sm text-ink-2">{m.q.explanation}</p>
                    </li>
                  ))}
                </ul>
              )}
              <p className="border-t border-line px-4 py-2 text-xs text-ink-3">Missed questions are added to your Practice review queue.</p>
            </div>
          )}
        </section>
      </main>
      <footer className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper">
        <div className="mx-auto flex max-w-2xl flex-col gap-2 px-4 py-3">
          <Button size="lg" block onClick={p.primary.onClick} autoFocus>{p.primary.label}</Button>
          {p.secondary && (
            <Button size="md" variant="ghost" block onClick={p.secondary.onClick}>{p.secondary.label}</Button>
          )}
        </div>
      </footer>
    </div>
  );
}
