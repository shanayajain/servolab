import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useNavigate } from 'react-router';
import { Bolt, Check, ChevronDown, CircuitBoard, Flag, Flame, Lock, Play, RefreshCw, Star, Trophy } from 'lucide-react';
import { tracks, getLesson, getTrack } from '../data/curriculum';
import { buildPath, trackProgress, type PathNode, type PathUnit } from '../features/learning/path';
import { useData, useProgress } from '../store/useProgress';
import { liveStreak } from '../store/logic';
import { dayKey } from '../utils/date';
import { Button, Chip, Difficulty, ProgressBar, Sheet } from '../components/ui';
import { Robot, TrackEmblem } from '../components/illustrations';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { TrackId } from '../lib/types';

const OFFSETS = [0, 58, 84, 58, 0, -58, -84, -58];

export default function LearnPage() {
  const data = useData((d) => d);
  const selectTrack = useProgress((s) => s.selectTrack);
  const navigate = useNavigate();
  const trackId = data.selectedTrack;
  const track = getTrack(trackId) ?? tracks[0];
  const path = useMemo(() => buildPath(track.id, data), [track.id, data]);
  const [picker, setPicker] = useState(false);
  const [sheetNode, setSheetNode] = useState<PathNode | null>(null);
  const currentRef = useRef<HTMLDivElement | null>(null);
  const today = dayKey();
  const todayXp = data.activity[today]?.xp ?? 0;
  const streak = liveStreak(data, today);
  const currentLesson = path.currentId ? getLesson(path.currentId) : undefined;
  useDocumentTitle('Learn');

  useEffect(() => {
    const t = setTimeout(() => currentRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 250);
    return () => clearTimeout(t);
  }, [track.id]);

  const start = (n: PathNode) => {
    if (n.type === 'lesson') navigate(`/lesson/${n.id}`);
    else if (n.type === 'review') navigate(`/session/review?unit=${n.unit.id}`);
    else if (n.type === 'challenge') {
      if (n.circuitId) navigate(`/lab/circuit/${n.circuitId}?unit=${n.unit.id}`);
      else navigate(`/session/challenge?unit=${n.unit.id}`);
    }
  };

  return (
    <div className="nav-space min-h-[100dvh]">
      {/* Header */}
      <header className="pt-safe sticky top-0 z-30 border-b-2 border-ink bg-paper">
        <div className="mx-auto flex min-h-[60px] max-w-2xl items-center justify-between gap-2 px-3">
          <button onClick={() => setPicker(true)} className="press flex min-h-[48px] min-w-0 items-center gap-2.5 rounded-xl px-1.5 hover:bg-sunken" aria-label={`Current track: ${track.title}. Change track`}>
            <TrackEmblem icon={track.icon} size={38} />
            <span className="min-w-0 text-left">
              <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-3">Track</span>
              <span className="flex items-center gap-1 truncate text-[17px] font-bold leading-tight">
                {track.title} <ChevronDown size={18} className="shrink-0" />
              </span>
            </span>
          </button>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className={`flex h-10 items-center gap-1 rounded-xl border-2 px-2.5 font-mono text-sm font-bold ${streak > 0 ? 'border-ink bg-brand-soft' : 'border-line text-ink-3'}`} aria-label={`${streak} day streak`}>
              <Flame size={18} className={streak > 0 ? 'text-brand' : ''} aria-hidden /> {streak}
            </span>
            <span className="flex h-10 items-center gap-1 rounded-xl border-2 border-ink bg-gold-soft px-2.5 font-mono text-sm font-bold" aria-label={`${data.xp} total XP`}>
              <Bolt size={17} className="text-gold" aria-hidden /> {data.xp}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-4">
        {/* Today */}
        <section className="rounded-2xl border-2 border-ink bg-panel p-4" aria-label="Today">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-3">Up next</p>
              <p className="truncate text-lg font-bold leading-tight">{currentLesson ? currentLesson.title : path.done === path.total ? 'Track complete!' : 'Choose a lesson'}</p>
              {currentLesson && <p className="truncate text-sm text-ink-2">{currentLesson.topic} · {currentLesson.questions.length} questions · +{currentLesson.xp} XP</p>}
            </div>
            {currentLesson && (
              <Button onClick={() => navigate(`/lesson/${currentLesson.id}`)} icon={<Play size={18} />} className="shrink-0">
                {data.lessons[currentLesson.id] ? 'Replay' : path.done > 0 ? 'Continue' : 'Start'}
              </Button>
            )}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <ProgressBar value={todayXp / data.settings.dailyGoal} tone="gold" label="Daily goal progress" />
            <span className="tabular shrink-0 font-mono text-xs font-bold text-ink-2">{Math.min(todayXp, 9999)}/{data.settings.dailyGoal} XP</span>
          </div>
          <p className="mt-1.5 font-mono text-[11px] text-ink-3">
            Track progress {path.done}/{path.total} lessons
          </p>
        </section>

        {/* Path */}
        <div className="bg-dotgrid -mx-4 mt-4 px-4 pb-10">
          {path.units.map((u) => (
            <UnitSection key={u.unit.id} pu={u} currentId={path.currentId} currentRef={currentRef} color={data.profile.avatarColor} onNode={setSheetNode} />
          ))}
          <div className="flex flex-col items-center py-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-gold text-[#1C1F22]"><Flag size={26} /></span>
            <p className="mt-2 font-bold">End of the {track.title} track</p>
            <p className="text-sm text-ink-2">Try another track from the menu at the top.</p>
          </div>
        </div>
      </main>

      {/* Track picker */}
      <Sheet open={picker} onClose={() => setPicker(false)} title="Choose a track">
        <ul className="space-y-2">
          {tracks.map((t) => {
            const p = trackProgress(t.id, data);
            const active = t.id === track.id;
            return (
              <li key={t.id}>
                <button
                  onClick={() => {
                    selectTrack(t.id as TrackId);
                    setPicker(false);
                  }}
                  className={`press flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left ${active ? 'border-ink bg-brand-soft' : 'border-line bg-panel'}`}
                  aria-current={active}
                >
                  <TrackEmblem icon={t.icon} size={44} active={active || p.done > 0} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{t.title}</span>
                    <span className="block truncate text-sm text-ink-2">{t.tagline}</span>
                    <span className="mt-1.5 flex items-center gap-2">
                      <ProgressBar value={p.done / p.total} label={`${t.title} progress`} />
                      <span className="tabular shrink-0 font-mono text-[11px] font-bold text-ink-3">{p.done}/{p.total}</span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Sheet>

      {/* Node detail */}
      <NodeSheet node={sheetNode} onClose={() => setSheetNode(null)} onStart={(n) => { setSheetNode(null); start(n); }} />
    </div>
  );
}

function UnitSection({ pu, currentId, currentRef, color, onNode }: { pu: PathUnit; currentId: string | null; currentRef: RefObject<HTMLDivElement | null>; color: string; onNode: (n: PathNode) => void }) {
  const complete = pu.lessonsDone === pu.lessonsTotal;
  const started = pu.lessonsDone > 0 || pu.nodes.some((n) => n.status === 'current');
  const ROW = 142;
  const positions = pu.nodes.map((n, i) => ({ x: n.type === 'milestone' ? 0 : OFFSETS[i % OFFSETS.length], y: i * ROW + 66 }));
  const height = pu.nodes.length * ROW;
  // connectors
  const segs = pu.nodes.slice(1).map((n, i) => {
    const a = positions[i], b = positions[i + 1];
    const solid = n.status === 'done' || n.status === 'current';
    return { d: `M${a.x} ${a.y} C${a.x} ${a.y + 71} ${b.x} ${b.y - 71} ${b.x} ${b.y}`, solid };
  });
  return (
    <section className="pt-6" aria-labelledby={`unit-${pu.unit.id}`}>
      <div className={`relative overflow-hidden rounded-2xl border-2 p-4 ${complete ? 'border-ink bg-ink text-paper' : started ? 'border-ink bg-brand text-[#1C1F22]' : 'border-line bg-sunken text-ink'}`}>
        <div className="absolute -right-3 -top-3 h-16 w-16 rotate-12 rounded-xl border-2 border-current opacity-15" aria-hidden />
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] opacity-80">Unit {pu.index + 1} · {pu.lessonsDone}/{pu.lessonsTotal}</p>
        <h2 id={`unit-${pu.unit.id}`} className="text-xl font-bold leading-tight">{pu.unit.title}</h2>
        <p className="mt-0.5 text-sm opacity-85">{pu.unit.description}</p>
      </div>
      <div className="relative mx-auto" style={{ height, maxWidth: 360 }}>
        <svg className="pointer-events-none absolute left-1/2 top-0 overflow-visible" width="1" height={height} aria-hidden>
          {segs.map((s, i) => (
            <path key={i} d={s.d} fill="none" stroke={s.solid ? 'rgb(var(--ink))' : 'rgb(var(--line-strong))'} strokeWidth={s.solid ? 5 : 4} strokeDasharray={s.solid ? undefined : '2 9'} strokeLinecap="round" />
          ))}
        </svg>
        {pu.nodes.map((n, i) => {
          const pos = positions[i];
          const isCurrent = n.status === 'current' && (n.id === currentId || n.type !== 'lesson');
          return (
            <div
              key={n.id}
              ref={isCurrent ? currentRef : undefined}
              className="absolute flex w-[150px] -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{ left: `calc(50% + ${pos.x}px)`, top: pos.y }}
            >
              <NodeButton node={n} current={isCurrent} onClick={() => onNode(n)} />
              {n.type !== 'milestone' && <NodeLabel node={n} />}
              {isCurrent && (
                <div className={`pointer-events-none absolute top-[-6px] ${pos.x >= 0 ? 'right-[118px]' : 'left-[118px]'} anim-bob`} aria-hidden>
                  <Robot size={64} color={color} mood="idle" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function NodeLabel({ node }: { node: PathNode }) {
  const text = node.type === 'lesson' ? node.lesson.title : node.type === 'review' ? 'Unit review' : node.unit.challenge?.title ?? 'Challenge';
  return (
    <span className={`mt-2 line-clamp-2 max-w-[150px] rounded-md bg-paper px-1.5 py-0.5 text-center text-[12.5px] font-semibold leading-tight ${node.status === 'locked' ? 'text-ink-3' : 'text-ink'}`}>
      {text}
    </span>
  );
}

function NodeButton({ node, current, onClick }: { node: PathNode; current: boolean; onClick: () => void }) {
  const st = node.status;
  const label =
    node.type === 'lesson'
      ? `Lesson: ${node.lesson.title}, ${st}`
      : node.type === 'review'
        ? `Unit review: ${node.unit.title}, ${st}`
        : node.type === 'challenge'
          ? `Challenge: ${node.unit.challenge?.title}, ${st}`
          : `Milestone: ${node.unit.title} ${st === 'done' ? 'complete' : 'not yet complete'}`;

  if (node.type === 'milestone') {
    return (
      <button onClick={onClick} aria-label={label} className={`press flex min-h-[48px] items-center gap-2 rounded-xl border-2 px-3 font-mono text-[11px] font-bold uppercase tracking-wider ${st === 'done' ? 'border-ink bg-gold text-[#1C1F22] shadow-[0_3px_0_rgb(var(--ink))]' : 'border-dashed border-line-strong bg-panel text-ink-3'}`}>
        <Trophy size={18} /> {st === 'done' ? 'Unit complete' : 'Milestone'}
      </button>
    );
  }

  const base = 'press relative flex items-center justify-center border-[3px]';
  const tone =
    st === 'done'
      ? 'border-ink bg-ink text-paper shadow-[0_5px_0_rgb(var(--ink)/0.45)]'
      : st === 'current'
        ? 'border-ink bg-brand text-[#1C1F22] shadow-[0_5px_0_rgb(var(--ink))]'
        : st === 'available'
          ? 'border-ink bg-panel text-ink shadow-[0_5px_0_rgb(var(--ink))]'
          : 'border-dashed border-line-strong bg-sunken text-ink-3';

  const icon =
    st === 'locked' ? <Lock size={22} /> :
    node.type === 'review' ? <RefreshCw size={24} strokeWidth={2.6} /> :
    node.type === 'challenge' ? (node.circuitId ? <CircuitBoard size={24} strokeWidth={2.4} /> : <Star size={24} strokeWidth={2.6} />) :
    st === 'done' ? <Check size={28} strokeWidth={3.2} /> : <Play size={26} strokeWidth={2.6} className="translate-x-[2px]" />;

  const shape =
    node.type === 'review' ? 'h-[60px] w-[60px] rounded-2xl rotate-45' :
    node.type === 'challenge' ? 'h-[66px] w-[66px] rounded-[22px]' :
    'h-[70px] w-[70px] rounded-full';

  return (
    <div className="relative">
      {current && (
        <span className="anim-rise absolute -top-10 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border-2 border-ink bg-panel px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider shadow-[0_2px_0_rgb(var(--ink))]">
          {node.type === 'lesson' ? 'Start' : 'Review'}
          <span className="absolute -bottom-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-ink bg-panel" />
        </span>
      )}
      <button onClick={onClick} aria-label={label} className={`${base} ${tone} ${shape} ${current ? 'anim-pulse' : ''}`}>
        <span className={node.type === 'review' ? '-rotate-45' : ''}>{icon}</span>
      </button>
      {node.type === 'lesson' && st === 'done' && node.score !== undefined && node.score >= 1 && (
        <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink bg-gold text-[#1C1F22]" aria-label="Perfect score">
          <Star size={13} fill="currentColor" />
        </span>
      )}
    </div>
  );
}

function NodeSheet({ node, onClose, onStart }: { node: PathNode | null; onClose: () => void; onStart: (n: PathNode) => void }) {
  const lessons = useData((d) => d.lessons);
  const navigate = useNavigate();
  if (!node) return null;
  if (node.type === 'lesson') {
    const l = node.lesson;
    const rec = lessons[l.id];
    const missing = l.prerequisites.filter((p) => !lessons[p]).map((p) => getLesson(p)?.title ?? p);
    return (
      <Sheet open onClose={onClose} title={l.title}>
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="brand">{l.topic}</Chip>
          <Chip tone="gold">+{l.xp} XP</Chip>
          <Difficulty level={l.difficulty} />
        </div>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{l.summary}</p>
        <p className="mt-2 font-mono text-xs text-ink-3">{l.teach.length} concept card{l.teach.length > 1 ? 's' : ''} · {l.questions.length} questions</p>
        {rec && (
          <p className="mt-3 rounded-xl bg-ok-soft px-3 py-2 text-sm font-semibold text-ok">
            Completed · best score {Math.round(rec.bestScore * 100)}% · {rec.attempts} attempt{rec.attempts > 1 ? 's' : ''}
          </p>
        )}
        {node.status === 'locked' ? (
          <div className="mt-5">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-2">
              <Lock size={16} /> Finish {missing.join(', ')} to unlock this lesson.
            </p>
            <Button block disabled>Locked</Button>
          </div>
        ) : (
          <div className="mt-5 grid gap-2">
            <Button size="lg" block onClick={() => onStart(node)} icon={<Play size={18} />}>{rec ? 'Practice lesson again' : 'Start lesson'}</Button>
            {rec && <Button variant="secondary" block onClick={() => { onClose(); navigate(`/session/lesson?lesson=${l.id}`); }} icon={<RefreshCw size={18} />}>Quick review</Button>}
          </div>
        )}
      </Sheet>
    );
  }
  if (node.type === 'milestone') {
    return (
      <Sheet open onClose={onClose} title={`${node.unit.title} milestone`}>
        <p className="text-[15px] text-ink-2">{node.status === 'done' ? 'You completed every lesson in this unit. Keep it fresh with the unit review and challenge.' : 'Complete every lesson in this unit to reach this milestone.'}</p>
        <div className="mt-5"><Button block variant="secondary" onClick={onClose}>Close</Button></div>
      </Sheet>
    );
  }
  const isReview = node.type === 'review';
  const title = isReview ? `${node.unit.title} · Review` : node.unit.challenge?.title ?? 'Challenge';
  const desc = isReview
    ? 'A mixed review of every lesson in this unit. Score 70% or more to complete it — it also feeds your spaced-repetition schedule.'
    : node.type === 'challenge' && node.circuitId
      ? 'A hands-on circuit lab: wire the parts on the virtual breadboard and run it until it works.'
      : 'A tougher quiz across the whole unit with no hints. Score 80% or more to earn the challenge.';
  return (
    <Sheet open onClose={onClose} title={title}>
      <p className="text-[15px] leading-relaxed text-ink-2">{desc}</p>
      {node.status === 'locked' ? (
        <div className="mt-5">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-2"><Lock size={16} /> Complete all lessons in {node.unit.title} first.</p>
          <Button block disabled>Locked</Button>
        </div>
      ) : (
        <div className="mt-5">
          <Button size="lg" block onClick={() => onStart(node)}>{node.status === 'done' ? 'Do it again' : isReview ? 'Start review' : 'Start challenge'}</Button>
        </div>
      )}
    </Sheet>
  );
}
