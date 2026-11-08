/**
 * Pure progress logic. Every function takes the current ProgressData and returns
 * a NEW object (never mutates) plus any gamification events that happened.
 * Kept free of React/DOM so it can be unit-tested in Node.
 */
import type { ActivityDay, ProgressData, Settings, TrackId } from '../lib/types';
import { addDays, dayKey, daysBetween } from '../utils/date';
import { levelFromXp } from '../features/gamification/levels';
import { achievements } from '../features/gamification/achievements';
import { reviewConcept } from '../features/practice/srs';
import { getLesson, lessonsForTrack, nextLessonInTrack } from '../data/curriculum';

export const SCHEMA_VERSION = 1;
export const XP_PER_CORRECT = 2;

export type GameEvent =
  | { kind: 'level'; level: number }
  | { kind: 'achievement'; id: string }
  | { kind: 'streak'; days: number }
  | { kind: 'goal'; xp: number };

export interface Result {
  data: ProgressData;
  events: GameEvent[];
}

export const DEFAULT_SETTINGS: Settings = {
  dailyGoal: 30,
  theme: 'system',
  motion: 'system',
  highContrast: false,
  showHints: true,
  haptics: true
};

export function createInitialProgress(now: Date = new Date()): ProgressData {
  return {
    profile: { name: 'Engineer', avatarColor: 'orange', createdAt: now.toISOString() },
    settings: { ...DEFAULT_SETTINGS },
    xp: 0,
    level: 1,
    streak: { current: 0, longest: 0, lastActiveDate: null },
    activity: {},
    lessons: {},
    nodes: {},
    stats: { answered: 0, correct: 0, incorrect: 0, seconds: 0, perfectLessons: 0 },
    concepts: {},
    mistakes: {},
    practiceHistory: [],
    projects: {},
    achievements: {},
    circuits: {},
    simsOpened: {},
    dailyChallenges: {},
    selectedTrack: 'electronics',
    currentLesson: 'elec-electricity',
    lastActiveDate: null
  };
}

const emptyDay = (): ActivityDay => ({ xp: 0, lessons: 0, answered: 0, correct: 0, seconds: 0 });

function withDay(d: ProgressData, today: string, patch: (a: ActivityDay) => ActivityDay): ProgressData {
  const prev = d.activity[today] ?? emptyDay();
  return { ...d, activity: { ...d.activity, [today]: patch(prev) } };
}

/** Streak shown to the user right now (0 if the chain is broken). */
export function liveStreak(d: ProgressData, today: string = dayKey()): number {
  const last = d.streak.lastActiveDate;
  if (!last) return 0;
  const gap = daysBetween(last, today);
  return gap <= 1 ? d.streak.current : 0;
}

/** Called once at launch: breaks a stale streak and repairs derived fields. Never wipes progress. */
export function normalizeOnLaunch(d: ProgressData, today: string = dayKey()): ProgressData {
  let next = d;
  const last = d.streak.lastActiveDate;
  if (last && daysBetween(last, today) > 1 && d.streak.current !== 0) {
    next = { ...next, streak: { ...next.streak, current: 0 } };
  }
  const level = levelFromXp(next.xp);
  if (level !== next.level) next = { ...next, level };
  if (next.currentLesson && !getLesson(next.currentLesson)) {
    next = { ...next, currentLesson: firstIncompleteLesson(next, next.selectedTrack) };
  }
  return next;
}

/** Marks today as active, extending or restarting the streak. */
function touchStreak(d: ProgressData, today: string): Result {
  const last = d.streak.lastActiveDate;
  if (last === today) return { data: d, events: [] };
  const continues = last !== null && daysBetween(last, today) === 1;
  const current = continues ? d.streak.current + 1 : 1;
  const longest = Math.max(d.streak.longest, current);
  return {
    data: { ...d, streak: { current, longest, lastActiveDate: today }, lastActiveDate: today },
    events: [{ kind: 'streak', days: current }]
  };
}

export function addXp(d: ProgressData, amount: number, today: string): Result {
  if (amount <= 0) return { data: d, events: [] };
  const events: GameEvent[] = [];
  const goal = d.settings.dailyGoal;
  const before = d.activity[today]?.xp ?? 0;
  let next = withDay(d, today, (a) => ({ ...a, xp: a.xp + amount }));
  const xp = d.xp + amount;
  const level = levelFromXp(xp);
  next = { ...next, xp, level };
  if (level > d.level) events.push({ kind: 'level', level });
  if (before < goal && before + amount >= goal) events.push({ kind: 'goal', xp: goal });
  const s = touchStreak(next, today);
  return { data: s.data, events: [...events, ...s.events] };
}

export interface AnswerInput {
  qid: string;
  lessonId: string;
  correct: boolean;
  /** Only first attempts count toward stats and XP. */
  firstAttempt: boolean;
}

export function recordAnswer(d: ProgressData, a: AnswerInput, today: string, nowIso: string): Result {
  if (!a.firstAttempt) {
    // Retries help you learn, but only first attempts count toward stats, XP and mistake resolution.
    return { data: d, events: [] };
  }
  let next: ProgressData = {
    ...d,
    stats: {
      ...d.stats,
      answered: d.stats.answered + 1,
      correct: d.stats.correct + (a.correct ? 1 : 0),
      incorrect: d.stats.incorrect + (a.correct ? 0 : 1)
    }
  };
  next = withDay(next, today, (x) => ({ ...x, answered: x.answered + 1, correct: x.correct + (a.correct ? 1 : 0) }));
  const prevMistake = d.mistakes[a.qid];
  if (!a.correct) {
    next = { ...next, mistakes: { ...next.mistakes, [a.qid]: { count: (prevMistake?.count ?? 0) + 1, lastWrongAt: nowIso, resolved: false } } };
  } else if (prevMistake && !prevMistake.resolved) {
    next = { ...next, mistakes: { ...next.mistakes, [a.qid]: { ...prevMistake, resolved: true } } };
  }
  if (a.correct) return addXp(next, XP_PER_CORRECT, today);
  return { data: next, events: [] };
}

export function firstIncompleteLesson(d: ProgressData, track: TrackId): string | null {
  const list = lessonsForTrack(track);
  const found = list.find((l) => !d.lessons[l.id] && l.prerequisites.every((p) => d.lessons[p]));
  return found?.id ?? list.find((l) => !d.lessons[l.id])?.id ?? null;
}

export interface LessonCompletion {
  lessonId: string;
  correct: number;
  total: number;
  seconds: number;
}

/** Bonus XP for finishing a lesson (on top of per-answer XP). */
export function lessonBonusXp(lessonXp: number, score: number, isReplay: boolean): number {
  const base = Math.round(lessonXp * score) + (score === 1 ? 5 : 0);
  return isReplay ? Math.round(base * 0.5) : base;
}

export function completeLesson(d: ProgressData, c: LessonCompletion, today: string, nowIso: string): Result & { bonusXp: number } {
  const lesson = getLesson(c.lessonId);
  if (!lesson) return { data: d, events: [], bonusXp: 0 };
  const score = c.total > 0 ? c.correct / c.total : 0;
  const prev = d.lessons[c.lessonId];
  const bonusXp = lessonBonusXp(lesson.xp, score, !!prev);
  let next: ProgressData = {
    ...d,
    lessons: {
      ...d.lessons,
      [c.lessonId]: {
        bestScore: Math.max(prev?.bestScore ?? 0, score),
        lastScore: score,
        attempts: (prev?.attempts ?? 0) + 1,
        firstCompletedAt: prev?.firstCompletedAt ?? nowIso,
        lastCompletedAt: nowIso,
        xpEarned: (prev?.xpEarned ?? 0) + bonusXp + c.correct * XP_PER_CORRECT
      }
    },
    concepts: {
      ...d.concepts,
      [c.lessonId]: reviewConcept(d.concepts[c.lessonId], score, c.correct, c.total - c.correct, today)
    },
    stats: {
      ...d.stats,
      seconds: d.stats.seconds + Math.max(0, Math.round(c.seconds)),
      perfectLessons: d.stats.perfectLessons + (score === 1 && !prev ? 1 : 0)
    },
    selectedTrack: lesson.track
  };
  next = withDay(next, today, (a) => ({ ...a, lessons: a.lessons + 1, seconds: a.seconds + Math.max(0, Math.round(c.seconds)) }));
  // Advance "current lesson" to the next unfinished lesson in this track.
  const following = nextLessonInTrack(c.lessonId);
  next = { ...next, currentLesson: following && !next.lessons[following.id] ? following.id : firstIncompleteLesson(next, lesson.track) };
  const x = addXp(next, bonusXp, today);
  const ach = checkAchievements(x.data, nowIso);
  return { data: ach.data, events: [...x.events, ...ach.events], bonusXp };
}

export interface SessionCompletion {
  mode: string;
  title: string;
  results: { lessonId: string; correct: boolean }[];
  seconds: number;
  nodeId?: string;
  passMark?: number;
  dailyDate?: string;
}

export function sessionBonusXp(correct: number, total: number, daily: boolean): number {
  if (total === 0) return 0;
  return Math.round(5 + 10 * (correct / total)) + (daily ? 15 : 0);
}

export function completeSession(d: ProgressData, s: SessionCompletion, today: string, nowIso: string): Result & { bonusXp: number; passed: boolean } {
  const total = s.results.length;
  const correct = s.results.filter((r) => r.correct).length;
  const score = total ? correct / total : 0;
  const passed = score >= (s.passMark ?? 0);
  const dailyFirst = !!s.dailyDate && !(s.dailyDate in d.dailyChallenges);
  const bonusXp = sessionBonusXp(correct, total, dailyFirst);

  // Aggregate per concept (lesson) and update the spaced-repetition schedule.
  const per = new Map<string, { c: number; w: number }>();
  for (const r of s.results) {
    const e = per.get(r.lessonId) ?? { c: 0, w: 0 };
    if (r.correct) e.c++;
    else e.w++;
    per.set(r.lessonId, e);
  }
  const concepts = { ...d.concepts };
  for (const [lessonId, e] of per) {
    if (!getLesson(lessonId)) continue;
    concepts[lessonId] = reviewConcept(concepts[lessonId], e.c / (e.c + e.w), e.c, e.w, today);
  }

  let next: ProgressData = {
    ...d,
    concepts,
    stats: { ...d.stats, seconds: d.stats.seconds + Math.max(0, Math.round(s.seconds)) },
    practiceHistory: [
      { id: `${Date.parse(nowIso) || Date.now()}-${s.mode}`, at: nowIso, mode: s.mode, title: s.title, correct, total, xp: bonusXp + correct * XP_PER_CORRECT },
      ...d.practiceHistory
    ].slice(0, 300)
  };
  next = withDay(next, today, (a) => ({ ...a, seconds: a.seconds + Math.max(0, Math.round(s.seconds)) }));
  if (s.nodeId && passed) {
    const prev = next.nodes[s.nodeId];
    next = { ...next, nodes: { ...next.nodes, [s.nodeId]: { score: Math.max(prev?.score ?? 0, score), completedAt: prev?.completedAt ?? nowIso } } };
  }
  if (s.dailyDate) {
    next = { ...next, dailyChallenges: { ...next.dailyChallenges, [s.dailyDate]: Math.max(next.dailyChallenges[s.dailyDate] ?? 0, score) } };
  }
  const x = addXp(next, bonusXp, today);
  const ach = checkAchievements(x.data, nowIso);
  return { data: ach.data, events: [...x.events, ...ach.events], bonusXp, passed };
}

export function checkAchievements(d: ProgressData, nowIso: string): Result {
  const unlocked: string[] = [];
  for (const a of achievements) {
    if (d.achievements[a.id]) continue;
    const p = a.progress(d);
    if (p.current >= p.target) unlocked.push(a.id);
  }
  if (!unlocked.length) return { data: d, events: [] };
  const map = { ...d.achievements };
  unlocked.forEach((id) => (map[id] = nowIso));
  return { data: { ...d, achievements: map }, events: unlocked.map((id) => ({ kind: 'achievement', id })) };
}

export function toggleProjectStep(d: ProgressData, projectId: string, step: number, nowIso: string): ProgressData {
  const prev = d.projects[projectId] ?? { startedAt: nowIso, stepsDone: [], challengeDone: false, completedAt: null };
  const has = prev.stepsDone.includes(step);
  const stepsDone = has ? prev.stepsDone.filter((s) => s !== step) : [...prev.stepsDone, step].sort((a, b) => a - b);
  return { ...d, projects: { ...d.projects, [projectId]: { ...prev, stepsDone } } };
}

export function setProjectChallenge(d: ProgressData, projectId: string, value: boolean, nowIso: string): ProgressData {
  const prev = d.projects[projectId] ?? { startedAt: nowIso, stepsDone: [], challengeDone: false, completedAt: null };
  return { ...d, projects: { ...d.projects, [projectId]: { ...prev, challengeDone: value } } };
}

export const PROJECT_XP = 50;

export function completeProject(d: ProgressData, projectId: string, today: string, nowIso: string): Result {
  const prev = d.projects[projectId] ?? { startedAt: nowIso, stepsDone: [], challengeDone: false, completedAt: null };
  if (prev.completedAt) return { data: d, events: [] };
  const next = { ...d, projects: { ...d.projects, [projectId]: { ...prev, completedAt: nowIso } } };
  const x = addXp(next, PROJECT_XP, today);
  const ach = checkAchievements(x.data, nowIso);
  return { data: ach.data, events: [...x.events, ...ach.events] };
}

export const CIRCUIT_XP = 25;

export function completeCircuit(d: ProgressData, circuitId: string, nodeIds: string[], today: string, nowIso: string): Result & { firstTime: boolean } {
  const firstTime = !d.circuits[circuitId];
  let next: ProgressData = { ...d, circuits: { ...d.circuits, [circuitId]: d.circuits[circuitId] ?? nowIso } };
  if (nodeIds.length) {
    const nodes = { ...next.nodes };
    for (const n of nodeIds) nodes[n] = nodes[n] ?? { score: 1, completedAt: nowIso };
    next = { ...next, nodes };
  }
  const x = firstTime ? addXp(next, CIRCUIT_XP, today) : { data: next, events: [] as GameEvent[] };
  const ach = checkAchievements(x.data, nowIso);
  return { data: ach.data, events: [...x.events, ...ach.events], firstTime };
}

export function openSim(d: ProgressData, simId: string, nowIso: string): Result {
  if (d.simsOpened[simId]) return { data: d, events: [] };
  return checkAchievements({ ...d, simsOpened: { ...d.simsOpened, [simId]: nowIso } }, nowIso);
}

export function accuracyOf(d: ProgressData): number {
  return d.stats.answered ? d.stats.correct / d.stats.answered : 0;
}

/** For tests: a stable "yesterday" helper. */
export const yesterdayOf = (today: string): string => addDays(today, -1);
