import type { Lesson, ProgressData, ResolvedQuestion, TrackId } from '../../lib/types';
import { allLessons, getLesson, getQuestion, getTrack, getUnit, lessonsForTrack, lessonsForUnit, resolveQuestions } from '../../data/curriculum';
import { hashString, seeded, shuffle } from '../../utils/random';
import { isDue, isWeak, weakness } from './srs';
import { challengeNodeId, reviewNodeId } from '../learning/path';

export type SessionMode = 'review' | 'challenge' | 'daily' | 'smart' | 'weak' | 'mistakes' | 'today' | 'track' | 'lesson';

export interface SessionPlan {
  mode: SessionMode;
  title: string;
  subtitle: string;
  questions: ResolvedQuestion[];
  nodeId?: string;
  passMark?: number;
  dailyDate?: string;
  allowHints: boolean;
}

export type SessionResult = { ok: true; plan: SessionPlan } | { ok: false; title: string; reason: string };

const label = (rq: ResolvedQuestion): ResolvedQuestion => ({ ...rq, label: 'Review' });
const uniq = (qs: ResolvedQuestion[]): ResolvedQuestion[] => [...new Map(qs.map((q) => [q.qid, q])).values()];

/** Pick up to `perLesson` questions from each lesson, preferring ones the user missed. */
function sample(lessons: Lesson[], d: ProgressData, perLesson: number, limit: number, rand: () => number): ResolvedQuestion[] {
  const out: ResolvedQuestion[] = [];
  for (const l of lessons) {
    const qs = resolveQuestions(l);
    const missed = qs.filter((q) => d.mistakes[q.qid] && !d.mistakes[q.qid].resolved);
    const rest = shuffle(qs.filter((q) => !missed.includes(q)), rand);
    out.push(...[...shuffle(missed, rand), ...rest].slice(0, perLesson));
  }
  return shuffle(out, rand).slice(0, limit);
}

export function completedToday(d: ProgressData, today: string): Lesson[] {
  return allLessons.filter((l) => {
    const r = d.lessons[l.id];
    if (!r) return false;
    const dt = new Date(r.lastCompletedAt);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    return key === today;
  });
}

export function dueConcepts(d: ProgressData, today: string): Lesson[] {
  return Object.entries(d.concepts)
    .filter(([id, c]) => getLesson(id) && isDue(c, today))
    .sort((a, b) => weakness(b[1], today) - weakness(a[1], today))
    .map(([id]) => getLesson(id)!);
}

export function weakConcepts(d: ProgressData, today: string): Lesson[] {
  return Object.entries(d.concepts)
    .filter(([id, c]) => getLesson(id) && isWeak(c))
    .sort((a, b) => weakness(b[1], today) - weakness(a[1], today))
    .map(([id]) => getLesson(id)!);
}

export function openMistakes(d: ProgressData): ResolvedQuestion[] {
  return Object.entries(d.mistakes)
    .filter(([, m]) => !m.resolved)
    .sort((a, b) => b[1].lastWrongAt.localeCompare(a[1].lastWrongAt))
    .map(([qid]) => getQuestion(qid))
    .filter((x): x is ResolvedQuestion => !!x);
}

export function buildSession(mode: SessionMode, params: URLSearchParams, d: ProgressData, today: string): SessionResult {
  const rand = seeded(hashString(`${mode}:${today}:${Date.now() >> 12}`));
  switch (mode) {
    case 'review': {
      const u = getUnit(params.get('unit') ?? '');
      if (!u) return { ok: false, title: 'Unit review', reason: 'That unit could not be found.' };
      const lessons = lessonsForUnit(u.unit.id);
      if (!lessons.every((l) => d.lessons[l.id])) return { ok: false, title: `${u.unit.title} review`, reason: 'Finish every lesson in this unit to unlock its review.' };
      return {
        ok: true,
        plan: { mode, title: `${u.unit.title} review`, subtitle: `${u.track.title} · Unit ${u.index + 1}`, questions: sample(lessons, d, 2, 10, rand).map(label), nodeId: reviewNodeId(u.unit.id), passMark: 0.7, allowHints: true }
      };
    }
    case 'challenge': {
      const u = getUnit(params.get('unit') ?? '');
      if (!u) return { ok: false, title: 'Challenge', reason: 'That unit could not be found.' };
      const lessons = lessonsForUnit(u.unit.id);
      if (!lessons.every((l) => d.lessons[l.id])) return { ok: false, title: u.unit.challenge?.title ?? 'Challenge', reason: 'Finish every lesson in this unit to unlock its challenge.' };
      const pool = lessons.flatMap(resolveQuestions);
      const hard = shuffle(pool.filter((rq) => ['numeric', 'scenario', 'debug', 'predict', 'code', 'diagram', 'order', 'match'].includes(rq.q.type)), rand);
      const rest = shuffle(pool.filter((rq) => !hard.includes(rq)), rand);
      return {
        ok: true,
        plan: { mode, title: u.unit.challenge?.title ?? `${u.unit.title} challenge`, subtitle: `${u.track.title} · Unit ${u.index + 1} · no hints`, questions: [...hard, ...rest].slice(0, 10), nodeId: challengeNodeId(u.unit.id), passMark: 0.8, allowHints: false }
      };
    }
    case 'daily': {
      const r = seeded(hashString(`daily:${today}`));
      let pool = allLessons.filter((l) => d.lessons[l.id]);
      if (pool.length < 2) pool = lessonsForTrack(d.selectedTrack).slice(0, 3);
      return {
        ok: true,
        plan: { mode, title: 'Daily challenge', subtitle: `Today · ${pool.length} concept${pool.length > 1 ? 's' : ''} in the mix`, questions: uniq([...sample(shuffle(pool, r).slice(0, 8), d, 1, 8, r), ...sample(pool, d, 3, 16, r)]).slice(0, 8), dailyDate: today, allowHints: true }
      };
    }
    case 'smart': {
      const due = dueConcepts(d, today);
      const weak = weakConcepts(d, today).filter((l) => !due.includes(l));
      const focus = [...due, ...weak].slice(0, 6);
      if (!focus.length) return { ok: false, title: 'Smart review', reason: 'Nothing is due right now. Complete lessons and they will come back here on a spaced schedule.' };
      return { ok: true, plan: { mode, title: 'Smart review', subtitle: `${focus.length} concept${focus.length > 1 ? 's' : ''} due or weak`, questions: sample(focus, d, 2, 10, rand).map(label), allowHints: true } };
    }
    case 'weak': {
      const weak = weakConcepts(d, today).slice(0, 5);
      if (!weak.length) return { ok: false, title: 'Weak concepts', reason: 'No weak concepts yet — great accuracy! They appear here when a concept’s accuracy drops below 75%.' };
      return { ok: true, plan: { mode, title: 'Weak concepts', subtitle: `${weak.length} concept${weak.length > 1 ? 's' : ''} to strengthen`, questions: sample(weak, d, 3, 10, rand).map(label), allowHints: true } };
    }
    case 'mistakes': {
      const qs = openMistakes(d).slice(0, 10);
      if (!qs.length) return { ok: false, title: 'Mistakes', reason: 'No unresolved mistakes. Questions you miss are collected here so you can fix them.' };
      return { ok: true, plan: { mode, title: 'Fix your mistakes', subtitle: `${qs.length} question${qs.length > 1 ? 's' : ''} you missed`, questions: shuffle(qs, rand).map(label), allowHints: true } };
    }
    case 'today': {
      const ls = completedToday(d, today);
      if (!ls.length) return { ok: false, title: 'Today’s lessons', reason: 'You have not completed a lesson today yet. Finish one on the Learn tab, then review it here.' };
      return { ok: true, plan: { mode, title: 'Review today’s lessons', subtitle: `${ls.length} lesson${ls.length > 1 ? 's' : ''} from today`, questions: sample(ls, d, 3, 10, rand).map(label), allowHints: true } };
    }
    case 'track': {
      const t = getTrack(params.get('track') ?? '');
      if (!t) return { ok: false, title: 'Practice', reason: 'That track could not be found.' };
      const done = lessonsForTrack(t.id as TrackId).filter((l) => d.lessons[l.id]);
      if (!done.length) return { ok: false, title: `Practice ${t.title}`, reason: `Complete at least one ${t.title} lesson first.` };
      const ordered = [...done].sort((a, b) => weakness(d.concepts[b.id] ?? fallbackConcept, today) - weakness(d.concepts[a.id] ?? fallbackConcept, today));
      return { ok: true, plan: { mode, title: `Practice ${t.title}`, subtitle: `${done.length} completed lesson${done.length > 1 ? 's' : ''}, weakest first`, questions: sample(ordered.slice(0, 6), d, 2, 10, rand).map(label), allowHints: true } };
    }
    case 'lesson': {
      const l = getLesson(params.get('lesson') ?? '');
      if (!l) return { ok: false, title: 'Review', reason: 'That lesson could not be found.' };
      return { ok: true, plan: { mode, title: `Review: ${l.title}`, subtitle: l.topic, questions: shuffle(resolveQuestions(l), rand).map(label), allowHints: true } };
    }
    default:
      return { ok: false, title: 'Practice', reason: 'Unknown practice mode.' };
  }
}

const fallbackConcept = { state: 'NEW' as const, ease: 2.3, interval: 0, due: '2000-01-01', reps: 0, lapses: 0, correct: 0, incorrect: 0, lastReviewed: null };
