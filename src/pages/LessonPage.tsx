import { useCallback, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Lock } from 'lucide-react';
import { getLesson, getTrack, getUnit, nextLessonInTrack, resolveQuestions } from '../data/curriculum';
import { LessonPlayer, type PlayerResult } from '../features/lessons/LessonPlayer';
import { CompletionScreen } from '../features/lessons/CompletionScreen';
import { useProgress } from '../store/useProgress';
import { liveStreak } from '../store/logic';
import { dayKey } from '../utils/date';
import { isLessonUnlocked } from '../features/learning/path';
import { Button } from '../components/ui';
import { Robot } from '../components/illustrations';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function LessonRoute() {
  const { id = '' } = useParams();
  return <LessonPage key={id} id={id} />;
}

interface Done {
  xp: number;
  result: PlayerResult;
  streak: number;
  extended: boolean;
}

function LessonPage({ id }: { id: string }) {
  const navigate = useNavigate();
  const lesson = getLesson(id);
  const data = useProgress((s) => s.data);
  const finishLesson = useProgress((s) => s.finishLesson);
  const setCurrent = useProgress((s) => s.setCurrentLesson);
  const [done, setDone] = useState<Done | null>(null);
  const [questions] = useState(() => (lesson ? resolveQuestions(lesson) : []));
  const [startDay] = useState(() => useProgress.getState().data.streak.lastActiveDate);
  useDocumentTitle(lesson?.title ?? 'Lesson');

  const onFinish = useCallback(
    (r: PlayerResult) => {
      if (!lesson) return;
      const today = dayKey();
      const res = finishLesson({ lessonId: lesson.id, correct: r.results.filter((x) => x.correct).length, total: r.results.length, seconds: r.seconds });
      const after = useProgress.getState().data;
      setDone({ xp: r.answerXp + res.bonusXp, result: r, streak: liveStreak(after, today), extended: startDay !== today });
      window.scrollTo({ top: 0 });
    },
    [lesson, finishLesson, startDay]
  );

  if (!lesson) {
    return (
      <Centered>
        <Robot size={110} mood="think" />
        <h1 className="mt-4 text-2xl font-bold">Lesson not found</h1>
        <p className="mt-1 text-ink-2">This lesson may have been renamed in an update. Your progress is safe.</p>
        <Button className="mt-6" onClick={() => navigate('/learn', { replace: true })}>Back to Learn</Button>
      </Centered>
    );
  }

  const unit = getUnit(lesson.unit);
  const track = getTrack(lesson.track);

  if (!done && !isLessonUnlocked(lesson, data)) {
    const missing = lesson.prerequisites.filter((p) => !data.lessons[p]).map((p) => getLesson(p)).filter(Boolean);
    return (
      <Centered>
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-line-strong bg-sunken text-ink-3"><Lock size={28} /></span>
        <h1 className="mt-4 text-2xl font-bold">{lesson.title} is locked</h1>
        <p className="mt-1 text-ink-2">Complete {missing.map((m) => m!.title).join(', ')} first.</p>
        <div className="mt-6 flex flex-col gap-2">
          {missing[0] && <Button onClick={() => navigate(`/lesson/${missing[0]!.id}`, { replace: true })}>Go to {missing[0]!.title}</Button>}
          <Button variant="ghost" onClick={() => navigate('/learn')}>Back to Learn</Button>
        </div>
      </Centered>
    );
  }

  if (done) {
    const next = nextLessonInTrack(lesson.id);
    const correct = done.result.results.filter((x) => x.correct).length;
    return (
      <CompletionScreen
        heading={correct === done.result.results.length ? 'Perfect lesson!' : 'Lesson complete!'}
        title={lesson.title}
        xp={done.xp}
        correct={correct}
        total={done.result.results.length}
        concepts={[lesson.title, ...lesson.tags.slice(0, 3).map((t) => t.replace(/-/g, ' '))]}
        mistakes={done.result.mistakes}
        streak={done.streak}
        streakExtended={done.extended}
        primary={
          next
            ? { label: `Next: ${next.title}`, onClick: () => { setCurrent(next.id); navigate(`/lesson/${next.id}`, { replace: true }); } }
            : { label: 'Back to Learn', onClick: () => navigate('/learn', { replace: true }) }
        }
        secondary={next ? { label: 'Back to path', onClick: () => navigate('/learn', { replace: true }) } : undefined}
      />
    );
  }

  return (
    <LessonPlayer
      title={lesson.title}
      subtitle={`${track?.short ?? ''} · Unit ${(unit?.index ?? 0) + 1} · ${lesson.topic}`}
      teach={lesson.teach}
      questions={questions}
      onExit={() => navigate('/learn')}
      onFinish={onFinish}
    />
  );
}

export function Centered({ children }: { children: ReactNode }) {
  return <div className="pt-safe mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center px-6 text-center">{children}</div>;
}
