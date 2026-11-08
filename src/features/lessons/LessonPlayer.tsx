import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CircleCheck, CircleX, Lightbulb, X } from 'lucide-react';
import type { ResolvedQuestion, TeachCard } from '../../lib/types';
import { checkAnswer, correctAnswerText, isAnswered, solutionFor, type AnswerValue } from '../../lib/answers';
import { useData, useProgress } from '../../store/useProgress';
import { XP_PER_CORRECT } from '../../store/logic';
import { Button, ConfirmSheet } from '../../components/ui';
import { getLesson } from '../../data/curriculum';
import { QuestionView, TYPE_LABEL, type CheckState } from './QuestionView';
import { Visual } from './Visual';

export interface PlayerResult {
  results: { qid: string; lessonId: string; correct: boolean }[];
  mistakes: ResolvedQuestion[];
  seconds: number;
  answerXp: number;
}

type Step = { kind: 'teach'; card: TeachCard } | { kind: 'q'; rq: ResolvedQuestion; retry?: boolean };

interface Props {
  title: string;
  subtitle: string;
  teach?: TeachCard[];
  questions: ResolvedQuestion[];
  allowHints?: boolean;
  onExit: () => void;
  onFinish: (r: PlayerResult) => void;
}

/**
 * The reusable, data-driven lesson engine. Used for lessons, reviews, challenges and practice.
 * Flow per question: answer → Check → feedback (correct: explanation + XP; wrong: try again or show answer)
 * → Continue. Missed questions come back once at the end.
 */
export function LessonPlayer({ title, subtitle, teach = [], questions, allowHints = true, onExit, onFinish }: Props) {
  const answer = useProgress((s) => s.answer);
  const showHintsSetting = useData((d) => d.settings.showHints);
  const haptics = useData((d) => d.settings.haptics);
  const [steps, setSteps] = useState<Step[]>(() => [...teach.map((card) => ({ kind: 'teach' as const, card })), ...questions.map((rq) => ({ kind: 'q' as const, rq }))]);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState<AnswerValue>(null);
  const [checked, setChecked] = useState<CheckState>(null);
  const [attempt, setAttempt] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [xpPop, setXpPop] = useState(0);
  const [shake, setShake] = useState(0);
  const first = useRef(new Map<string, { correct: boolean; rq: ResolvedQuestion }>());
  const answerXp = useRef(0);
  const started = useRef(Date.now());
  const mainRef = useRef<HTMLDivElement>(null);

  const step = steps[index];
  const total = steps.length;
  const isQ = step?.kind === 'q';

  const reset = () => {
    setValue(null);
    setChecked(null);
    setAttempt(0);
    setReveal(false);
    setHintOpen(false);
  };

  const finish = useCallback(() => {
    const entries = [...first.current.entries()];
    onFinish({
      results: entries.map(([qid, v]) => ({ qid, lessonId: v.rq.lessonId, correct: v.correct })),
      mistakes: entries.filter(([, v]) => !v.correct).map(([, v]) => v.rq),
      seconds: (Date.now() - started.current) / 1000,
      answerXp: answerXp.current
    });
  }, [onFinish]);

  const next = useCallback(() => {
    if (step?.kind === 'q' && checked !== 'correct' && !step.retry) {
      // Missed: bring it back once at the end.
      setSteps((s) => [...s, { kind: 'q', rq: step.rq, retry: true }]);
    }
    if (index + 1 >= steps.length + (step?.kind === 'q' && checked !== 'correct' && !step.retry ? 1 : 0)) {
      finish();
      return;
    }
    setIndex((i) => i + 1);
    reset();
    mainRef.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }, [step, checked, index, steps.length, finish]);

  const check = useCallback(() => {
    if (!step || step.kind !== 'q' || checked) return;
    const q = step.rq.q;
    if (!isAnswered(q, value)) return;
    const ok = checkAnswer(q, value);
    const isFirst = !first.current.has(step.rq.qid);
    if (isFirst) {
      first.current.set(step.rq.qid, { correct: ok, rq: step.rq });
      if (ok) answerXp.current += XP_PER_CORRECT;
    }
    answer({ qid: step.rq.qid, lessonId: step.rq.lessonId, correct: ok, firstAttempt: isFirst && attempt === 0 });
    setChecked(ok ? 'correct' : 'wrong');
    if (ok && isFirst) setXpPop((n) => n + 1);
    if (!ok) {
      setShake((n) => n + 1);
      if (attempt >= 1 || step.retry) setReveal(true);
    }
    try {
      if (haptics && navigator.vibrate) navigator.vibrate(ok ? 12 : [20, 40, 20]);
    } catch {
      /* not supported */
    }
  }, [step, checked, value, attempt, answer, haptics]);

  const tryAgain = () => {
    setAttempt((a) => a + 1);
    setValue(null);
    setChecked(null);
  };

  // Keyboard: Enter to check / continue.
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || confirmExit) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON') return;
      e.preventDefault();
      if (!isQ || checked === 'correct' || reveal) next();
      else if (!checked) check();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isQ, checked, reveal, next, check, confirmExit]);

  // QA hook for automated end-to-end tests (enabled only with ?qa=1 / localStorage flag).
  useEffect(() => {
    const qa = (() => {
      try {
        return localStorage.getItem('servolab:qa') === '1' || location.hash.includes('qa=1');
      } catch {
        return false;
      }
    })();
    if (!qa) return;
    const w = window as unknown as Record<string, unknown>;
    w.__servolabQA = {
      solve: () => step?.kind === 'q' && setValue(solutionFor(step.rq.q)),
      kind: () => step?.kind,
      type: () => (step?.kind === 'q' ? step.rq.q.type : 'teach')
    };
    return () => {
      delete w.__servolabQA;
    };
  }, [step]);

  const progress = total ? (index + (checked === 'correct' || reveal || !isQ ? 0.5 : 0)) / total : 0;
  const lessonOf = step?.kind === 'q' ? getLesson(step.rq.lessonId) : undefined;
  const eyebrow = step?.kind === 'q' ? (step.retry ? 'Second chance' : step.rq.label ?? TYPE_LABEL[step.rq.q.type]) : 'Concept';
  const canHint = allowHints && showHintsSetting && step?.kind === 'q' && !!step.rq.q.hint && !checked;

  const feedback = useMemo(() => {
    if (!step || step.kind !== 'q' || !checked) return null;
    return { ok: checked === 'correct', q: step.rq.q };
  }, [step, checked]);

  if (!step) return null;

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col bg-paper">
      {/* Header: back · topic · progress */}
      <header className="pt-safe sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-3 py-2">
          <button onClick={() => (index > 0 || first.current.size ? setConfirmExit(true) : onExit())} className="press flex h-11 w-11 shrink-0 items-center justify-center rounded-xl hover:bg-sunken" aria-label="Leave lesson">
            <X size={24} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">{subtitle}</p>
            <p className="truncate text-[15px] font-bold leading-tight">{title}</p>
          </div>
          <span className="tabular shrink-0 font-mono text-sm font-bold text-ink-2" aria-label={`Step ${index + 1} of ${total}`}>
            {index + 1} / {total}
          </span>
        </div>
        <div className="px-3 pb-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-sunken" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Lesson progress">
            <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${Math.max(3, progress * 100)}%` }} />
          </div>
        </div>
      </header>

      {/* Main */}
      <main ref={mainRef} className="flex-1 px-4 pb-48 pt-5" key={index}>
        <div className="anim-rise">
          <div className="mb-3 flex items-center gap-2">
            <span className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider ${step.kind === 'teach' ? 'bg-blue-soft text-blue' : step.kind === 'q' && step.retry ? 'bg-gold-soft text-ink' : 'bg-brand-soft text-brand-deep'}`}>{eyebrow}</span>
            {lessonOf && step.kind === 'q' && step.rq.label && <span className="truncate text-xs text-ink-3">{lessonOf.title}</span>}
          </div>
          {step.kind === 'teach' ? (
            <article className="space-y-4">
              <h2 className="text-2xl font-bold leading-tight">{step.card.title}</h2>
              <p className="text-[17px] leading-relaxed text-ink-2">{step.card.body}</p>
              {step.card.visual && <Visual visual={step.card.visual} compactSim={false} />}
            </article>
          ) : (
            <div key={`${step.rq.qid}-${shake}`} className={checked === 'wrong' ? 'anim-shake' : ''}>
              <QuestionView q={step.rq.q} qid={step.rq.qid} value={value} onChange={setValue} checked={checked} reveal={reveal} />
            </div>
          )}
          {canHint && (
            <div className="mt-5">
              {hintOpen ? (
                <p className="anim-fade flex gap-2 rounded-xl bg-gold-soft px-3 py-2.5 text-sm font-medium text-ink">
                  <Lightbulb size={18} className="mt-0.5 shrink-0 text-gold" /> {step.kind === 'q' && step.rq.q.hint}
                </p>
              ) : (
                <button onClick={() => setHintOpen(true)} className="press flex min-h-[44px] items-center gap-2 text-sm font-bold text-blue">
                  <Lightbulb size={18} /> Show hint
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Bottom: feedback + CONTINUE */}
      <footer className="pb-safe fixed inset-x-0 bottom-0 z-30">
        <div className="mx-auto max-w-2xl">
          {feedback && (
            <div
              className={`anim-sheet border-t-2 px-4 pb-2 pt-4 ${feedback.ok ? 'border-ok bg-ok-soft' : 'border-bad bg-bad-soft'}`}
              role="status"
              aria-live="assertive"
            >
              <div className="flex items-center gap-2">
                {feedback.ok ? <CircleCheck className="text-ok anim-pop" size={28} /> : <CircleX className="text-bad anim-pop" size={28} />}
                <p className={`text-xl font-bold ${feedback.ok ? 'text-ok' : 'text-bad'}`}>{feedback.ok ? pickPraise(index) : reveal ? 'Here’s the answer' : 'Not quite'}</p>
                {feedback.ok && attempt === 0 && !(step.kind === 'q' && step.retry) && (
                  <span key={xpPop} className="anim-pop ml-auto rounded-md bg-gold px-2 py-0.5 font-mono text-sm font-bold text-[#1C1F22]">+{XP_PER_CORRECT} XP</span>
                )}
              </div>
              <div className="mt-2 max-h-[34dvh] overflow-y-auto text-[15px] leading-relaxed text-ink">
                {!feedback.ok && reveal && (
                  <p className="mb-1.5 whitespace-pre-line font-semibold">
                    Correct answer: <span className="font-mono">{correctAnswerText(feedback.q)}</span>
                  </p>
                )}
                {feedback.ok || reveal ? (
                  <p>{feedback.q.explanation}</p>
                ) : (
                  <p>{feedback.q.hint ? `Hint: ${feedback.q.hint}` : 'Take another look — think it through and try again, or reveal the answer with an explanation.'}</p>
                )}
              </div>
            </div>
          )}
          <div className={`flex gap-3 px-4 pb-3 pt-3 ${feedback ? (feedback.ok ? 'bg-ok-soft' : 'bg-bad-soft') : 'border-t border-line bg-paper'}`}>
            {step.kind === 'teach' ? (
              <Button size="lg" block onClick={next}>Continue</Button>
            ) : !checked ? (
              <Button size="lg" block onClick={check} disabled={!isAnswered(step.rq.q, value)}>Check</Button>
            ) : checked === 'wrong' && !reveal ? (
              <>
                <Button size="lg" variant="secondary" className="flex-1" onClick={() => setReveal(true)}>Show answer</Button>
                <Button size="lg" className="flex-1" onClick={tryAgain}>Try again</Button>
              </>
            ) : (
              <Button size="lg" block variant={checked === 'correct' ? 'ok' : 'primary'} onClick={next}>Continue</Button>
            )}
          </div>
        </div>
      </footer>

      <ConfirmSheet
        open={confirmExit}
        title="Leave this lesson?"
        message="Your answers so far won’t complete the lesson. XP you already earned is kept."
        confirmLabel="Leave"
        danger
        onConfirm={onExit}
        onCancel={() => setConfirmExit(false)}
      />
    </div>
  );
}

const PRAISE = ['Correct!', 'Nice work!', 'Exactly right.', 'Spot on!', 'Well reasoned.', 'Nailed it!'];
function pickPraise(i: number): string {
  return PRAISE[i % PRAISE.length];
}
