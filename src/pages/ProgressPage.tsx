import { useMemo, type ReactNode } from 'react';
import { Bolt, Clock, Flame, Medal, Target, Trophy } from 'lucide-react';
import { Page } from '../components/AppShell';
import { Card, ProgressBar, Ring, SectionTitle } from '../components/ui';
import { TrackEmblem } from '../components/illustrations';
import { useData } from '../store/useProgress';
import { accuracyOf, liveStreak } from '../store/logic';
import { levelProgress, levelTitle } from '../features/gamification/levels';
import { AccuracyLine, ActivityHeatmap, XpBars } from '../features/progress/charts';
import { getLesson, lessonsForTrack, tracks } from '../data/curriculum';
import { formatDuration } from '../utils/date';
import { accuracy } from '../features/practice/srs';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function ProgressPage() {
  const d = useData((x) => x);
  useDocumentTitle('Progress');
  const lp = levelProgress(d.xp);
  const acc = accuracyOf(d);
  const streak = liveStreak(d);
  const mastered = useMemo(() => Object.entries(d.concepts).filter(([id, c]) => c.state === 'MASTERED' && getLesson(id)), [d.concepts]);
  const strongest = useMemo(
    () =>
      Object.entries(d.concepts)
        .filter(([id, c]) => getLesson(id) && c.correct + c.incorrect >= 3)
        .sort((a, b) => accuracy(b[1]) - accuracy(a[1]) || b[1].reps - a[1].reps)
        .slice(0, 4),
    [d.concepts]
  );
  const lessonsDone = Object.keys(d.lessons).filter((id) => getLesson(id)).length;

  return (
    <Page title="Progress" eyebrow="Engineering log">
      {/* Level */}
      <section className="bg-blueprint flex items-center gap-4 rounded-2xl border-2 border-ink bg-panel p-4">
        <Ring value={lp.fraction} size={88} stroke={9} label={`Level ${lp.level}, ${Math.round(lp.fraction * 100)} percent to next level`}>
          <span className="text-center">
            <span className="block font-mono text-[9px] font-bold uppercase tracking-wider text-ink-3">Level</span>
            <span className="block font-mono text-2xl font-bold leading-none">{lp.level}</span>
          </span>
        </Ring>
        <div className="min-w-0 flex-1">
          <p className="text-xl font-bold leading-tight">{levelTitle(lp.level)}</p>
          <p className="mt-0.5 font-mono text-xs text-ink-2">{lp.needed - lp.into} XP to level {lp.level + 1}</p>
          <ProgressBar value={lp.fraction} className="mt-2" label="Level progress" />
        </div>
      </section>

      <div className="stagger mt-3 grid grid-cols-2 gap-2.5">
        <Stat icon={<Bolt size={18} className="text-gold" />} label="Total XP" value={d.xp.toLocaleString()} />
        <Stat icon={<Flame size={18} className="text-brand" />} label="Streak · best" value={`${streak} · ${d.streak.longest}`} />
        <Stat icon={<Target size={18} className="text-blue" />} label="Accuracy" value={d.stats.answered ? `${Math.round(acc * 100)}%` : '—'} />
        <Stat icon={<Clock size={18} className="text-ink-2" />} label="Learning time" value={formatDuration(d.stats.seconds)} />
      </div>

      <SectionTitle>XP · last 14 days</SectionTitle>
      <Card className="p-4">
        <XpBars activity={d.activity} goal={d.settings.dailyGoal} />
      </Card>

      <SectionTitle>Learning activity</SectionTitle>
      <Card className="p-4">
        <ActivityHeatmap activity={d.activity} />
      </Card>

      <SectionTitle>First-try accuracy</SectionTitle>
      <Card className="p-4">
        <AccuracyLine activity={d.activity} />
        <p className="mt-2 font-mono text-[11px] text-ink-3">
          {d.stats.correct} correct · {d.stats.incorrect} incorrect · {d.stats.answered} answered
        </p>
      </Card>

      <SectionTitle action={<span className="font-mono text-[11px] font-bold text-ink-3">{lessonsDone} lessons</span>}>Lesson completion</SectionTitle>
      <Card className="divide-y divide-line">
        {tracks.map((t) => {
          const ls = lessonsForTrack(t.id);
          const done = ls.filter((l) => d.lessons[l.id]).length;
          const m = ls.filter((l) => d.concepts[l.id]?.state === 'MASTERED').length;
          return (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3">
              <TrackEmblem icon={t.icon} size={36} active={done > 0} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-semibold">{t.title}</span>
                  <span className="tabular shrink-0 font-mono text-xs font-bold text-ink-2">{done}/{ls.length}</span>
                </div>
                <div className="relative mt-1.5">
                  <ProgressBar value={done / ls.length} label={`${t.title} lessons completed`} />
                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
                    <div className="h-full bg-ok" style={{ width: `${(m / ls.length) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <p className="px-4 py-2 font-mono text-[11px] text-ink-3">
          <span className="mr-1 inline-block h-2 w-2 rounded-sm bg-ok" /> mastered · <span className="mx-1 inline-block h-2 w-2 rounded-sm bg-brand" /> completed
        </p>
      </Card>

      <SectionTitle>Topic mastery</SectionTitle>
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-ink bg-ok text-white"><Medal size={20} /></span>
          <div>
            <p className="font-bold">{mastered.length} concept{mastered.length === 1 ? '' : 's'} mastered</p>
            <p className="text-sm text-ink-2">Mastery takes 3+ spaced reviews with 80%+ accuracy.</p>
          </div>
        </div>
        {strongest.length > 0 && (
          <ul className="mt-3 space-y-2 border-t border-line pt-3">
            {strongest.map(([id, c]) => (
              <li key={id} className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{getLesson(id)!.title}</span>
                <span className="w-28"><ProgressBar value={accuracy(c)} tone={c.state === 'MASTERED' ? 'ok' : 'blue'} label={`${getLesson(id)!.title} accuracy`} /></span>
                <span className="tabular w-10 text-right font-mono text-xs font-bold">{Math.round(accuracy(c) * 100)}%</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <SectionTitle>Milestones</SectionTitle>
      <Card className="flex items-center gap-3 p-4">
        <Trophy size={22} className="shrink-0 text-gold" />
        <p className="text-sm text-ink-2">
          {Object.keys(d.nodes).filter((k) => k.endsWith(':review')).length} unit reviews · {Object.keys(d.nodes).filter((k) => k.endsWith(':challenge')).length} challenges · {Object.keys(d.circuits).length} circuits · {Object.values(d.projects).filter((p) => p.completedAt).length} projects
        </p>
      </Card>
    </Page>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-3">
      <div className="flex items-center gap-1.5">{icon}<span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-3">{label}</span></div>
      <p className="tabular mt-1 font-mono text-xl font-bold">{value}</p>
    </div>
  );
}
