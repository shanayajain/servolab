import { useCallback, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { buildSession, type SessionMode } from '../features/practice/sessions';
import { LessonPlayer, type PlayerResult } from '../features/lessons/LessonPlayer';
import { CompletionScreen } from '../features/lessons/CompletionScreen';
import { useProgress } from '../store/useProgress';
import { liveStreak } from '../store/logic';
import { dayKey } from '../utils/date';
import { getLesson } from '../data/curriculum';
import { Button } from '../components/ui';
import { Robot } from '../components/illustrations';
import { Centered } from './LessonPage';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function SessionRoute() {
  const { mode = '' } = useParams();
  const [params] = useSearchParams();
  return <SessionPage key={`${mode}?${params.toString()}`} mode={mode as SessionMode} params={params} />;
}

function SessionPage({ mode, params }: { mode: SessionMode; params: URLSearchParams }) {
  const navigate = useNavigate();
  const finishSession = useProgress((s) => s.finishSession);
  const [built] = useState(() => buildSession(mode, params, useProgress.getState().data, dayKey()));
  const [startDay] = useState(() => useProgress.getState().data.streak.lastActiveDate);
  const [done, setDone] = useState<null | { r: PlayerResult; xp: number; passed: boolean; streak: number; extended: boolean }>(null);
  const fromPath = mode === 'review' || mode === 'challenge';
  const back = () => navigate(fromPath ? '/learn' : '/practice', { replace: true });
  useDocumentTitle(built.ok ? built.plan.title : built.title);

  const onFinish = useCallback(
    (r: PlayerResult) => {
      if (!built.ok) return;
      const today = dayKey();
      const res = finishSession({
        mode: built.plan.mode,
        title: built.plan.title,
        results: r.results.map((x) => ({ lessonId: x.lessonId, correct: x.correct })),
        seconds: r.seconds,
        nodeId: built.plan.nodeId,
        passMark: built.plan.passMark,
        dailyDate: built.plan.dailyDate
      });
      const after = useProgress.getState().data;
      setDone({ r, xp: r.answerXp + res.bonusXp, passed: res.passed, streak: liveStreak(after, today), extended: startDay !== today });
    },
    [built, finishSession, startDay]
  );

  if (!built.ok) {
    return (
      <Centered>
        <Robot size={110} mood="think" />
        <h1 className="mt-4 text-2xl font-bold">{built.title}</h1>
        <p className="mt-2 text-ink-2">{built.reason}</p>
        <Button className="mt-6" onClick={back}>Back</Button>
      </Centered>
    );
  }
  const plan = built.plan;
  if (!plan.questions.length) {
    return (
      <Centered>
        <Robot size={110} mood="think" />
        <h1 className="mt-4 text-2xl font-bold">{plan.title}</h1>
        <p className="mt-2 text-ink-2">There are no questions to practise here yet.</p>
        <Button className="mt-6" onClick={back}>Back</Button>
      </Centered>
    );
  }

  if (done) {
    const correct = done.r.results.filter((x) => x.correct).length;
    const concepts = [...new Set(done.r.results.map((x) => getLesson(x.lessonId)?.title).filter(Boolean) as string[])];
    const hasPass = plan.passMark !== undefined;
    return (
      <CompletionScreen
        heading={hasPass ? (done.passed ? (plan.mode === 'challenge' ? 'Challenge complete!' : 'Review complete!') : 'Almost there') : plan.mode === 'daily' ? 'Daily challenge done!' : 'Practice complete!'}
        title={plan.title}
        xp={done.xp}
        correct={correct}
        total={done.r.results.length}
        concepts={concepts.slice(0, 8)}
        mistakes={done.r.mistakes}
        streak={done.streak}
        streakExtended={done.extended}
        passed={hasPass ? done.passed : null}
        passMark={plan.passMark}
        primary={{ label: fromPath ? 'Back to path' : 'Back to Practice', onClick: back }}
        secondary={hasPass && !done.passed ? { label: 'Try again', onClick: () => navigate(`/session/${mode}?${retryParams(params)}`, { replace: true }) } : undefined}
      />
    );
  }

  return <LessonPlayer title={plan.title} subtitle={plan.subtitle} questions={plan.questions} allowHints={plan.allowHints} onExit={back} onFinish={onFinish} />;
}

function retryParams(p: URLSearchParams): string {
  const q = new URLSearchParams(p);
  q.set('n', String(Date.now()));
  return q.toString();
}
