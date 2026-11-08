import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Check, ChevronDown, ChevronRight, CircuitBoard, Clock, Code, FlaskConical, Lock, Trophy } from 'lucide-react';
import { Page, SubHeader } from '../components/AppShell';
import { Button, Card, Chip, Difficulty, ProgressBar, SectionTitle } from '../components/ui';
import { projects, getProject } from '../data/projects/projects';
import { getLesson } from '../data/curriculum';
import { useData, useProgress } from '../store/useProgress';
import { PROJECT_XP } from '../store/logic';
import { ComponentSymbol } from '../features/simulation/ComponentSymbol';
import { CodeBlock } from '../features/lessons/Visual';
import { getSim } from '../features/simulation/simRegistry';
import { Centered } from './LessonPage';
import { Robot } from '../components/illustrations';
import type { ComponentKind } from '../lib/types';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const ART: Record<string, ComponentKind> = {
  'led-button': 'button',
  'night-light': 'ldr',
  'ultrasonic-sensor': 'ultrasonic',
  'obstacle-detector': 'ultrasonic',
  'line-follower': 'ir',
  'wall-follower': 'ultrasonic',
  'pid-motor': 'motor',
  'imu-orientation': 'imu',
  'encoder-movement': 'encoder',
  'robot-navigation': 'mcu'
};

export function ProjectsPage() {
  const records = useData((d) => d.projects);
  useDocumentTitle('Projects');
  const completed = projects.filter((p) => records[p.id]?.completedAt).length;
  return (
    <Page title="Projects" eyebrow={`${completed} of ${projects.length} built`}>
      <p className="mb-3 text-[15px] text-ink-2">Real robotics builds that tie lessons together. Each one works as a guided checklist — with simulations where hardware isn’t handy.</p>
      <ul className="space-y-3">
        {projects.map((p, i) => {
          const rec = records[p.id];
          const done = rec?.stepsDone.length ?? 0;
          const status = rec?.completedAt ? 'Completed' : done > 0 ? 'In progress' : 'Not started';
          return (
            <li key={p.id}>
              <Link to={`/projects/${p.id}`} className="press flex gap-3 rounded-2xl border-2 border-ink bg-panel p-3 shadow-[0_3px_0_rgb(var(--ink))]">
                <span className={`bg-blueprint flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-xl border border-line ${rec?.completedAt ? 'text-ok' : 'text-ink'}`}>
                  <ComponentSymbol kind={ART[p.id] ?? 'mcu'} size={64} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-ink-3">
                    Project {String(i + 1).padStart(2, '0')}
                    {rec?.completedAt && <Chip tone="ok"><Check size={11} /> Done</Chip>}
                  </span>
                  <span className="block text-[17px] font-bold leading-tight">{p.title}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Difficulty level={p.difficulty} />
                    <span className="flex items-center gap-1 font-mono text-[11px] font-semibold text-ink-3"><Clock size={12} /> {p.minutes} min</span>
                  </span>
                  <span className="mt-2 flex items-center gap-2">
                    <ProgressBar value={rec?.completedAt ? 1 : done / p.steps.length} tone={rec?.completedAt ? 'ok' : 'brand'} label={`${p.title}: ${status}`} />
                    <span className="shrink-0 font-mono text-[10px] font-bold uppercase text-ink-3">{status}</span>
                  </span>
                </span>
                <ChevronRight size={20} className="mt-6 shrink-0 text-ink-3" />
              </Link>
            </li>
          );
        })}
      </ul>
    </Page>
  );
}

export function ProjectPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const p = getProject(id);
  const rec = useData((d) => d.projects[id]);
  const lessons = useData((d) => d.lessons);
  const toggleStep = useProgress((s) => s.toggleStep);
  const setChallengeDone = useProgress((s) => s.setChallengeDone);
  const finishProject = useProgress((s) => s.finishProject);
  const [showCode, setShowCode] = useState(false);
  useDocumentTitle(p?.title ?? 'Project');
  if (!p) {
    return (
      <Centered>
        <Robot size={100} mood="think" />
        <h1 className="mt-4 text-2xl font-bold">Project not found</h1>
        <Button className="mt-6" onClick={() => navigate('/projects', { replace: true })}>All projects</Button>
      </Centered>
    );
  }
  const stepsDone = rec?.stepsDone ?? [];
  const allSteps = stepsDone.length === p.steps.length;
  const completed = !!rec?.completedAt;
  const sim = p.sim ? getSim(p.sim) : undefined;
  return (
    <div className="min-h-[100dvh] pb-safe">
      <SubHeader title={p.title} eyebrow="Project" onBack={() => navigate('/projects')} right={completed ? <Chip tone="ok">Completed</Chip> : undefined} />
      <main className="mx-auto max-w-2xl px-4 pb-12 pt-4">
        <div className="bg-blueprint flex items-center gap-4 rounded-2xl border-2 border-ink bg-panel p-4">
          <span className="shrink-0 text-ink"><ComponentSymbol kind={ART[p.id] ?? 'mcu'} size={84} /></span>
          <div className="min-w-0">
            <Difficulty level={p.difficulty} />
            <p className="mt-1 flex items-center gap-1 font-mono text-xs font-semibold text-ink-2"><Clock size={13} /> about {p.minutes} minutes · +{PROJECT_XP} XP</p>
          </div>
        </div>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{p.summary}</p>

        <SectionTitle>Required concepts</SectionTitle>
        <Card className="divide-y divide-line">
          {p.concepts.map((cid) => {
            const l = getLesson(cid);
            if (!l) return null;
            const ok = !!lessons[cid];
            return (
              <Link key={cid} to={`/lesson/${cid}`} className="press flex min-h-[52px] items-center gap-3 px-4">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 ${ok ? 'border-ok bg-ok text-white' : 'border-line text-ink-3'}`}>{ok ? <Check size={15} strokeWidth={3} /> : <Lock size={13} />}</span>
                <span className="min-w-0 flex-1 truncate font-semibold">{l.title}</span>
                <span className="font-mono text-[11px] text-ink-3">{ok ? 'learned' : 'learn'}</span>
              </Link>
            );
          })}
        </Card>

        <SectionTitle>Components</SectionTitle>
        <Card className="p-4">
          <ul className="space-y-1.5">
            {p.components.map((c) => (
              <li key={c} className="flex gap-2 text-[15px]"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-sm bg-brand" />{c}</li>
            ))}
          </ul>
        </Card>

        <SectionTitle>Learning goals</SectionTitle>
        <Card className="p-4">
          <ul className="space-y-1.5">
            {p.goals.map((g) => (
              <li key={g} className="flex gap-2 text-[15px]"><Check size={16} className="mt-0.5 shrink-0 text-blue" />{g}</li>
            ))}
          </ul>
        </Card>

        <SectionTitle action={<span className="font-mono text-[11px] font-bold text-ink-3">{stepsDone.length}/{p.steps.length}</span>}>Steps</SectionTitle>
        <ol className="space-y-2">
          {p.steps.map((s, i) => {
            const done = stepsDone.includes(i);
            return (
              <li key={s.title}>
                <button
                  role="checkbox"
                  aria-checked={done}
                  onClick={() => toggleStep(p.id, i)}
                  className={`press flex w-full gap-3 rounded-2xl border-2 p-3 text-left ${done ? 'border-ok bg-ok-soft' : 'border-line bg-panel'}`}
                >
                  <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 font-mono text-xs font-bold ${done ? 'border-ok bg-ok text-white' : 'border-ink'}`}>{done ? <Check size={16} strokeWidth={3} /> : i + 1}</span>
                  <span>
                    <span className="block font-bold">{s.title}</span>
                    <span className="block text-sm leading-relaxed text-ink-2">{s.detail}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {p.code && (
          <div className="mt-4">
            <button onClick={() => setShowCode((s) => !s)} aria-expanded={showCode} className="press flex min-h-[48px] w-full items-center justify-between rounded-2xl border-2 border-ink bg-panel px-4 font-bold">
              <span className="flex items-center gap-2"><Code size={18} /> Starter code</span>
              <ChevronDown size={20} className={`transition-transform ${showCode ? 'rotate-180' : ''}`} />
            </button>
            {showCode && <div className="mt-2"><CodeBlock code={p.code.source} lang={p.code.lang} /></div>}
          </div>
        )}

        {(sim || p.circuit) && (
          <div className="mt-4 grid gap-2">
            {sim && <Button variant="secondary" block onClick={() => navigate(`/lab/sim/${sim.id}`)} icon={<FlaskConical size={18} />}>Open simulation: {sim.title}</Button>}
            {p.circuit && <Button variant="secondary" block onClick={() => navigate(`/lab/circuit/${p.circuit}`)} icon={<CircuitBoard size={18} />}>Wire it in the circuit lab</Button>}
          </div>
        )}

        <SectionTitle>Challenge</SectionTitle>
        <Card className="p-4">
          <p className="text-[15px] leading-relaxed">{p.challenge}</p>
          <button role="checkbox" aria-checked={!!rec?.challengeDone} onClick={() => setChallengeDone(p.id, !rec?.challengeDone)} className="press mt-3 flex min-h-[44px] items-center gap-2 font-semibold">
            <span className={`flex h-6 w-6 items-center justify-center rounded-md border-2 ${rec?.challengeDone ? 'border-ok bg-ok text-white' : 'border-ink'}`}>{rec?.challengeDone && <Check size={14} strokeWidth={3} />}</span>
            I completed the challenge
          </button>
        </Card>

        <div className="mt-6">
          {completed ? (
            <div className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-gold-soft p-4">
              <Trophy className="shrink-0 text-gold" size={28} />
              <p className="font-bold">Project completed on {new Date(rec!.completedAt!).toLocaleDateString()}</p>
            </div>
          ) : (
            <>
              <Button size="lg" block disabled={!allSteps} onClick={() => finishProject(p.id)} icon={<Trophy size={18} />}>Mark project complete · +{PROJECT_XP} XP</Button>
              {!allSteps && <p className="mt-2 text-center text-sm text-ink-3">Tick off every step to complete the project.</p>}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
