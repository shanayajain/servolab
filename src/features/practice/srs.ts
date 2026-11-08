import type { ConceptRecord, ConceptState } from '../../lib/types';
import { addDays, daysBetween } from '../../utils/date';

/**
 * A small SM-2-inspired spaced repetition scheduler.
 * Each concept (one per lesson) moves NEW → LEARNING → REVIEW → MASTERED
 * based on how well it is answered, and comes back for review when due.
 */
export function newConcept(today: string): ConceptRecord {
  return { state: 'NEW', ease: 2.3, interval: 0, due: today, reps: 0, lapses: 0, correct: 0, incorrect: 0, lastReviewed: null };
}

export function deriveState(c: Pick<ConceptRecord, 'reps' | 'interval' | 'correct' | 'incorrect'>): ConceptState {
  const total = c.correct + c.incorrect;
  if (total === 0) return 'NEW';
  const acc = c.correct / total;
  if (c.reps >= 3 && c.interval >= 7 && acc >= 0.8) return 'MASTERED';
  if (c.reps >= 2 && c.interval >= 3) return 'REVIEW';
  return 'LEARNING';
}

/**
 * Update a concept after it was practised.
 * @param score fraction correct (0..1) in this session for this concept
 */
export function reviewConcept(prev: ConceptRecord | undefined, score: number, correct: number, incorrect: number, today: string): ConceptRecord {
  const c: ConceptRecord = { ...(prev ?? newConcept(today)) };
  c.correct += correct;
  c.incorrect += incorrect;
  if (score >= 0.8) {
    c.reps += 1;
    c.interval = c.reps === 1 ? 1 : c.reps === 2 ? 3 : Math.max(c.interval + 1, Math.round(c.interval * c.ease));
    c.ease = Math.min(2.8, c.ease + 0.08);
  } else if (score >= 0.6) {
    c.interval = Math.max(1, Math.round(c.interval * 1.2));
    c.ease = Math.max(1.3, c.ease - 0.1);
  } else {
    c.lapses += 1;
    c.reps = 0;
    c.interval = 0;
    c.ease = Math.max(1.3, c.ease - 0.2);
  }
  c.due = addDays(today, c.interval);
  c.lastReviewed = today;
  c.state = deriveState(c);
  return c;
}

export function isDue(c: ConceptRecord, today: string): boolean {
  return c.state !== 'NEW' && daysBetween(c.due, today) >= 0;
}

export function accuracy(c: ConceptRecord): number {
  const t = c.correct + c.incorrect;
  return t === 0 ? 1 : c.correct / t;
}

/** Higher = weaker. Used to prioritise practice. */
export function weakness(c: ConceptRecord, today: string): number {
  const acc = accuracy(c);
  const overdue = Math.max(0, daysBetween(c.due, today));
  return (1 - acc) * 3 + c.lapses * 0.6 + Math.min(overdue, 14) * 0.08 + (c.state === 'LEARNING' ? 0.4 : 0);
}

export function isWeak(c: ConceptRecord): boolean {
  const total = c.correct + c.incorrect;
  return total >= 2 && (accuracy(c) < 0.75 || (c.lapses > 0 && c.state === 'LEARNING'));
}
