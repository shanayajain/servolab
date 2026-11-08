import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { BookOpen, CircleCheck, Target } from 'lucide-react';
import { SubHeader } from '../components/AppShell';
import { Button, Card, Chip, Difficulty } from '../components/ui';
import { Robot } from '../components/illustrations';
import { getSim, SimView } from '../features/simulation/simRegistry';
import { CircuitBoard } from '../features/simulation/CircuitBoard';
import { getCircuit } from '../data/circuits';
import { getLesson, tracks } from '../data/curriculum';
import { useData, useProgress } from '../store/useProgress';
import { CIRCUIT_XP } from '../store/logic';
import { challengeNodeId } from '../features/learning/path';
import { Centered } from './LessonPage';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function SimPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const sim = getSim(id);
  const markSimOpened = useProgress((s) => s.markSimOpened);
  useDocumentTitle(sim?.title ?? 'Simulation');
  useEffect(() => {
    if (sim) markSimOpened(sim.id);
  }, [sim, markSimOpened]);
  const back = () => (window.history.length > 1 ? navigate(-1) : navigate('/practice'));
  if (!sim) {
    return (
      <Centered>
        <Robot size={100} mood="think" />
        <h1 className="mt-4 text-2xl font-bold">Simulation not found</h1>
        <Button className="mt-6" onClick={() => navigate('/practice', { replace: true })}>Back to Practice</Button>
      </Centered>
    );
  }
  return (
    <div className="min-h-[100dvh] pb-safe">
      <SubHeader title={sim.title} eyebrow="Simulation" onBack={back} />
      <main className="mx-auto max-w-2xl space-y-4 px-4 pb-10 pt-4">
        <p className="text-[15px] leading-relaxed text-ink-2">{sim.blurb}</p>
        <SimView id={sim.id} />
        {sim.lessons.length > 0 && (
          <Card className="p-4">
            <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-ink-3">Related lessons</p>
            <div className="flex flex-col gap-1">
              {sim.lessons.map((lid) => {
                const l = getLesson(lid);
                return l ? (
                  <Link key={lid} to={`/lesson/${lid}`} className="press flex min-h-[44px] items-center gap-2 rounded-lg px-1 font-semibold text-blue">
                    <BookOpen size={18} /> {l.title}
                  </Link>
                ) : null;
              })}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}

export function CircuitPage() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const challenge = getCircuit(id);
  const finishCircuit = useProgress((s) => s.finishCircuit);
  const solvedBefore = useData((d) => !!d.circuits[id]);
  const [justSolved, setJustSolved] = useState<null | { firstTime: boolean }>(null);
  const unitParam = params.get('unit');
  useDocumentTitle(challenge?.title ?? 'Circuit lab');
  const back = () => navigate(unitParam ? '/learn' : '/practice');

  const onSolved = useCallback(() => {
    if (!challenge) return;
    // Mark every unit challenge node that uses this circuit.
    const nodeIds = tracks.flatMap((t) => t.units.filter((u) => u.challenge?.circuitId === challenge.id).map((u) => challengeNodeId(u.id)));
    const r = finishCircuit(challenge.id, nodeIds);
    setJustSolved({ firstTime: r.firstTime });
  }, [challenge, finishCircuit]);

  if (!challenge) {
    return (
      <Centered>
        <Robot size={100} mood="think" />
        <h1 className="mt-4 text-2xl font-bold">Circuit not found</h1>
        <Button className="mt-6" onClick={() => navigate('/practice', { replace: true })}>Back to Practice</Button>
      </Centered>
    );
  }

  return (
    <div className="min-h-[100dvh] pb-safe">
      <SubHeader title={challenge.title} eyebrow={challenge.sandbox ? 'Circuit lab · sandbox' : 'Circuit lab'} onBack={back} right={solvedBefore ? <Chip tone="ok">Solved</Chip> : undefined} />
      <main className="mx-auto max-w-2xl space-y-4 px-4 pb-10 pt-4">
        <Card className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <Difficulty level={challenge.difficulty} />
            {!challenge.sandbox && <Chip tone="gold">+{CIRCUIT_XP} XP</Chip>}
          </div>
          <p className="text-[15px] leading-relaxed text-ink-2">{challenge.brief}</p>
          {!challenge.sandbox && (
            <p className="mt-2 flex items-start gap-2 text-[15px] font-semibold">
              <Target size={18} className="mt-0.5 shrink-0 text-brand" /> {challenge.goalText}
            </p>
          )}
        </Card>
        {justSolved && (
          <div className="anim-pop flex items-center gap-3 rounded-2xl border-2 border-ink bg-ok-soft p-4" role="status">
            <CircleCheck className="shrink-0 text-ok" size={30} />
            <div className="min-w-0 flex-1">
              <p className="font-bold">Circuit works!</p>
              <p className="text-sm text-ink-2">{justSolved.firstTime ? `+${CIRCUIT_XP} XP earned.` : 'Solved again — nice.'}</p>
            </div>
            <Button size="sm" onClick={back}>Done</Button>
          </div>
        )}
        <CircuitBoard challenge={challenge} onSolved={onSolved} />
        {challenge.lessons && (
          <Card className="p-4">
            <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-ink-3">Learn the theory</p>
            {challenge.lessons.map((lid) => {
              const l = getLesson(lid);
              return l ? (
                <Link key={lid} to={`/lesson/${lid}`} className="press flex min-h-[44px] items-center gap-2 rounded-lg px-1 font-semibold text-blue">
                  <BookOpen size={18} /> {l.title}
                </Link>
              ) : null;
            })}
          </Card>
        )}
      </main>
    </div>
  );
}
