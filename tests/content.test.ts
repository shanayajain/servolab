import { describe, expect, it } from 'vitest';
import { validateContent } from '../src/data/validate';
import { allLessons } from '../src/data/curriculum';
import { checkAnswer, solutionFor, parseNumber } from '../src/lib/answers';
import type { Question } from '../src/lib/types';

function wrongAnswer(q: Question) {
  switch (q.type) {
    case 'tf': return !q.answer;
    case 'multi': return q.answers.length === q.options.length ? [] : [q.options.findIndex((_, i) => !q.answers.includes(i))];
    case 'fill': return '__definitely wrong__';
    case 'match': return q.pairs.map((_, i) => (i + 1) % q.pairs.length);
    case 'order': return [...q.items].reverse();
    case 'numeric': return String(q.answer * 3 + 7);
    default: return ((q as { answer: number }).answer + 1) % ((q as { options?: string[]; targets?: string[] }).options ?? (q as { targets: string[] }).targets).length;
  }
}

describe('curriculum content', () => {
  it('passes validation', () => {
    const r = validateContent();
    expect(r.errors).toEqual([]);
    expect(r.stats.lessons).toBeGreaterThanOrEqual(60);
    expect(Object.keys(r.stats.types).length).toBe(15);
  });

  it('every question accepts its correct answer and rejects a wrong one', () => {
    for (const l of allLessons) {
      l.questions.forEach((q, i) => {
        expect(checkAnswer(q, solutionFor(q)), `${l.id}#${i} correct`).toBe(true);
        expect(checkAnswer(q, wrongAnswer(q) as never), `${l.id}#${i} wrong`).toBe(false);
      });
    }
  });

  it('parses engineering numbers', () => {
    expect(parseNumber('4.7k')).toBe(4700);
    expect(parseNumber('0,25')).toBe(0.25);
    expect(parseNumber('220 Ω')).toBe(220);
    expect(parseNumber('abc')).toBeNull();
  });
});
