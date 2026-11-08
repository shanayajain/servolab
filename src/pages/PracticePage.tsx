import { useMemo, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { CalendarCheck, Check, ChevronRight, CircleX, CircuitBoard, FlaskConical, History, RefreshCw, Sparkles, TrendingDown } from 'lucide-react';
import { Page } from '../components/AppShell';
import { Button, Card, Chip, SectionTitle } from '../components/ui';
import { TrackEmblem } from '../components/illustrations';
import { useData } from '../store/useProgress';
import { dayKey } from '../utils/date';
import { completedToday, dueConcepts, openMistakes, weakConcepts } from '../features/practice/sessions';
import { tracks, getLesson, lessonsForTrack } from '../data/curriculum';
import { circuitChallenges } from '../data/circuits';
import { SIMS } from '../features/simulation/simRegistry';
import type { ConceptState } from '../lib/types';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const STATE_STYLE: Record<ConceptState, string> = { NEW: 'bg-line', LEARNING: 'bg-brand', REVIEW: 'bg-blue', MASTERED: 'bg-ok' };

export default function PracticePage() {
  const d = useData((x) => x);
  const navigate = useNavigate();
  const today = dayKey();
  useDocumentTitle('Practice');
  const due = useMemo(() => dueConcepts(d, today), [d, today]);
  const weak = useMemo(() => weakConcepts(d, today), [d, today]);
  const mistakes = useMemo(() => openMistakes(d), [d]);
  const todays = useMemo(() => completedToday(d, today), [d, today]);
  const dailyScore = d.dailyChallenges[today];
  const counts = useMemo(() => {
    const c: Record<ConceptState, number> = { NEW: 0, LEARNING: 0, REVIEW: 0, MASTERED: 0 };
    for (const id of Object.keys(d.concepts)) if (getLesson(id)) c[d.concepts[id].state]++;
    return c;
  }, [d.concepts]);
  const totalConcepts = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <Page title="Practice" eyebrow="Review & lab">
      {/* Daily challenge */}
      <section className="relative overflow-hidden rounded-2xl border-2 border-ink bg-ink p-4 text-paper">
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full border-[10px] border-brand opacity-30" aria-hidden />
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] opacity-70">Daily challenge</p>
        <h2 className="mt-0.5 text-xl font-bold">{dailyScore !== undefined ? `Done today · ${Math.round(dailyScore * 100)}%` : '8 questions · bonus XP'}</h2>
        <p className="mt-1 text-sm opacity-80">A fresh mix from everything you have learned, the same for the whole day.</p>
        <Button className="mt-3" variant={dailyScore !== undefined ? 'secondary' : 'primary'} onClick={() => navigate('/session/daily')} icon={dailyScore !== undefined ? <Check size={18} /> : <CalendarCheck size={18} />}>
          {dailyScore !== undefined ? 'Play again' : 'Start daily challenge'}
        </Button>
      </section>

      {/* Smart review */}
      <Card className="mt-3 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-blue text-white"><Sparkles size={22} /></span>
          <div className="min-w-0 flex-1">
            <p className="font-bold">Smart review</p>
            <p className="text-sm text-ink-2">{due.length ? `${due.length} concept${due.length > 1 ? 's' : ''} due for spaced review` : weak.length ? `${weak.length} weak concept${weak.length > 1 ? 's' : ''} to strengthen` : 'Nothing due — you are up to date'}</p>
          </div>
        </div>
        <Button className="mt-3" block onClick={() => navigate('/session/smart')} disabled={!due.length && !weak.length}>Start smart review</Button>
      </Card>

      <div className="mt-3 grid grid-cols-3 gap-2.5">
        <QuickCard to="/session/weak" icon={<TrendingDown size={20} />} n={weak.length} label="Weak concepts" />
        <QuickCard to="/session/mistakes" icon={<CircleX size={20} />} n={mistakes.length} label="Mistakes" />
        <QuickCard to="/session/today" icon={<RefreshCw size={20} />} n={todays.length} label="Today’s lessons" />
      </div>

      {/* Concept states */}
      <SectionTitle>Spaced repetition</SectionTitle>
      <Card className="p-4">
        {totalConcepts === 0 ? (
          <p className="text-sm text-ink-2">Complete a lesson to start tracking concepts. Each lesson becomes a concept that moves from NEW → LEARNING → REVIEW → MASTERED as you practise.</p>
        ) : (
          <>
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-sunken" role="img" aria-label={`Concepts: ${counts.LEARNING} learning, ${counts.REVIEW} review, ${counts.MASTERED} mastered`}>
              {(['MASTERED', 'REVIEW', 'LEARNING', 'NEW'] as ConceptState[]).map((s) => counts[s] > 0 && <div key={s} className={STATE_STYLE[s]} style={{ width: `${(counts[s] / totalConcepts) * 100}%` }} />)}
            </div>
            <dl className="mt-3 grid grid-cols-4 gap-1 text-center">
              {(['LEARNING', 'REVIEW', 'MASTERED', 'NEW'] as ConceptState[]).map((s) => (
                <div key={s}>
                  <dt className="flex items-center justify-center gap-1 font-mono text-[9px] font-bold uppercase tracking-wider text-ink-3"><span className={`h-2 w-2 rounded-sm ${STATE_STYLE[s]}`} />{s}</dt>
                  <dd className="tabular font-mono text-lg font-bold">{counts[s]}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
        {weak.length > 0 && (
          <div className="mt-3 border-t border-line pt-3">
            <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-ink-3">Weakest</p>
            <ul className="space-y-1.5">
              {weak.slice(0, 5).map((l) => {
                const c = d.concepts[l.id];
                const acc = c.correct + c.incorrect ? Math.round((c.correct / (c.correct + c.incorrect)) * 100) : 0;
                return (
                  <li key={l.id}>
                    <Link to={`/session/lesson?lesson=${l.id}`} className="press flex min-h-[44px] items-center justify-between gap-2 rounded-xl px-2 hover:bg-sunken">
                      <span className="truncate font-semibold">{l.title}</span>
                      <span className="flex shrink-0 items-center gap-1"><Chip tone="bad">{acc}%</Chip><ChevronRight size={18} className="text-ink-3" /></span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </Card>

      {/* By track */}
      <SectionTitle>Practice by track</SectionTitle>
      <Card className="divide-y divide-line">
        {tracks.map((t) => {
          const done = lessonsForTrack(t.id).filter((l) => d.lessons[l.id]).length;
          return (
            <Link key={t.id} to={done ? `/session/track?track=${t.id}` : '/learn'} className="press flex min-h-[64px] items-center gap-3 px-4 py-2" aria-label={`Practice ${t.title}, ${done} lessons completed`}>
              <TrackEmblem icon={t.icon} size={40} active={done > 0} />
              <span className="min-w-0 flex-1">
                <span className="block font-bold">Practice {t.title}</span>
                <span className="block text-sm text-ink-2">{done ? `${done} completed lesson${done > 1 ? 's' : ''}` : 'Complete a lesson to unlock'}</span>
              </span>
              <ChevronRight size={20} className="text-ink-3" />
            </Link>
          );
        })}
      </Card>

      {/* Lab */}
      <SectionTitle>Circuit lab</SectionTitle>
      <div className="grid grid-cols-2 gap-2.5">
        {circuitChallenges.map((c) => {
          const solved = !!d.circuits[c.id];
          return (
            <Link key={c.id} to={`/lab/circuit/${c.id}`} className="press flex min-h-[96px] flex-col justify-between rounded-2xl border-2 border-ink bg-panel p-3 shadow-[0_3px_0_rgb(var(--ink))]">
              <span className="flex items-center justify-between">
                <CircuitBoard size={20} className="text-brand" aria-hidden />
                {solved ? <Chip tone="ok"><Check size={12} /> Solved</Chip> : c.sandbox ? <Chip tone="blue">Free</Chip> : <Chip>Lv {c.difficulty}</Chip>}
              </span>
              <span className="mt-2 text-[15px] font-bold leading-tight">{c.title}</span>
            </Link>
          );
        })}
      </div>

      <SectionTitle>Simulations</SectionTitle>
      <Card className="divide-y divide-line">
        {SIMS.map((s) => (
          <Link key={s.id} to={`/lab/sim/${s.id}`} className="press flex min-h-[64px] items-center gap-3 px-4 py-2">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-blue-soft text-blue"><FlaskConical size={20} /></span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 font-bold">{s.title} {d.simsOpened[s.id] && <Check size={15} className="text-ok" aria-label="explored" />}</span>
              <span className="block truncate text-sm text-ink-2">{s.blurb}</span>
            </span>
            <ChevronRight size={20} className="text-ink-3" />
          </Link>
        ))}
      </Card>

      {d.practiceHistory.length > 0 && (
        <>
          <SectionTitle>Recent practice</SectionTitle>
          <Card className="divide-y divide-line">
            {d.practiceHistory.slice(0, 6).map((h) => (
              <div key={h.id} className="flex items-center gap-3 px-4 py-3">
                <History size={18} className="shrink-0 text-ink-3" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{h.title}</span>
                  <span className="block font-mono text-xs text-ink-3">{new Date(h.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · +{h.xp} XP</span>
                </span>
                <span className="tabular font-mono text-sm font-bold">{h.correct}/{h.total}</span>
              </div>
            ))}
          </Card>
        </>
      )}
    </Page>
  );
}

function QuickCard({ to, icon, n, label }: { to: string; icon: ReactNode; n: number; label: string }) {
  return (
    <Link to={to} className="press flex min-h-[104px] flex-col justify-between rounded-2xl border-2 border-ink bg-panel p-3 shadow-[0_3px_0_rgb(var(--ink))]" aria-label={`${label}: ${n}`}>
      <span className="text-brand-deep">{icon}</span>
      <span>
        <span className="tabular block font-mono text-2xl font-bold leading-none">{n}</span>
        <span className="mt-1 block text-[12px] font-semibold leading-tight text-ink-2">{label}</span>
      </span>
    </Link>
  );
}
