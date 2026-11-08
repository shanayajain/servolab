import { beforeEach, describe, expect, it } from 'vitest';
import './setup-storage';
import { completeLesson, completeSession, createInitialProgress, liveStreak, normalizeOnLaunch, recordAnswer, addXp } from '../src/store/logic';
import { loadProgress, saveProgress, exportJson, importJson, sanitizeProgress } from '../src/lib/persistence';
import { levelFromXp, totalXpForLevel } from '../src/features/gamification/levels';

const T0 = '2026-11-08';
const T1 = '2026-11-09';
const T3 = '2026-11-11';
const now = '2026-11-08T10:00:00.000Z';

describe('XP, levels and streaks', () => {
  it('levels follow the XP curve', () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(99)).toBe(1);
    expect(levelFromXp(100)).toBe(2);
    expect(levelFromXp(totalXpForLevel(5))).toBe(5);
  });

  it('extends a streak on consecutive days and breaks it after a gap', () => {
    let d = createInitialProgress();
    d = addXp(d, 10, T0).data;
    expect(d.streak.current).toBe(1);
    d = addXp(d, 10, T0).data;
    expect(d.streak.current).toBe(1);
    d = addXp(d, 10, T1).data;
    expect(d.streak.current).toBe(2);
    expect(d.streak.longest).toBe(2);
    expect(liveStreak(d, T3)).toBe(0);
    d = normalizeOnLaunch(d, T3);
    expect(d.streak.current).toBe(0);
    expect(d.streak.longest).toBe(2); // longest is never lost
    d = addXp(d, 10, T3).data;
    expect(d.streak.current).toBe(1);
  });

  it('records answers, XP, mistakes and completes a lesson', () => {
    let d = createInitialProgress();
    d = recordAnswer(d, { qid: 'elec-electricity#0', lessonId: 'elec-electricity', correct: true, firstAttempt: true }, T0, now).data;
    d = recordAnswer(d, { qid: 'elec-electricity#1', lessonId: 'elec-electricity', correct: false, firstAttempt: true }, T0, now).data;
    d = recordAnswer(d, { qid: 'elec-electricity#1', lessonId: 'elec-electricity', correct: true, firstAttempt: false }, T0, now).data;
    expect(d.stats).toMatchObject({ answered: 2, correct: 1, incorrect: 1 });
    expect(d.mistakes['elec-electricity#1'].resolved).toBe(false);
    const r = completeLesson(d, { lessonId: 'elec-electricity', correct: 4, total: 5, seconds: 120 }, T0, now);
    d = r.data;
    expect(d.lessons['elec-electricity'].bestScore).toBeCloseTo(0.8);
    expect(d.currentLesson).toBe('elec-voltage');
    expect(d.concepts['elec-electricity'].state).toBe('LEARNING');
    expect(d.achievements['power-on']).toBeDefined();
    expect(d.xp).toBeGreaterThan(10);
    expect(d.activity[T0].lessons).toBe(1);
  });

  it('unknown lesson ids never crash', () => {
    const d = createInitialProgress();
    const r = completeLesson(d, { lessonId: 'does-not-exist', correct: 1, total: 1, seconds: 1 }, T0, now);
    expect(r.data).toBe(d);
    const s = completeSession(d, { mode: 'x', title: 'x', results: [{ lessonId: 'nope', correct: true }], seconds: 1 }, T0, now);
    expect(s.data.concepts['nope']).toBeUndefined();
  });
});

describe('persistence', () => {
  beforeEach(() => localStorage.clear());

  it('the core scenario: complete lesson 1, "close", reopen, continue', async () => {
    // 1. Open app (no data)
    const first = await loadProgress();
    expect(first.isNew).toBe(true);
    // 2–3. Complete lesson 1 and earn XP
    const done = completeLesson(first.data, { lessonId: 'elec-electricity', correct: 5, total: 5, seconds: 90 }, T0, now).data;
    await saveProgress(done);
    // 4–5. "Close" and reopen: load again from storage
    const again = await loadProgress();
    expect(again.isNew).toBe(false);
    // 6–8. Lesson, XP and streak remain
    expect(again.data.lessons['elec-electricity']).toBeDefined();
    expect(again.data.xp).toBe(done.xp);
    expect(again.data.streak.current).toBe(1);
    // 9. Lesson 2 is next
    expect(again.data.currentLesson).toBe('elec-voltage');
  });

  it('recovers from a corrupted localStorage copy using IndexedDB', async () => {
    const d = addXp(createInitialProgress(), 42, T0).data;
    await saveProgress(d);
    localStorage.setItem('servolab:progress', '{ this is not json');
    const r = await loadProgress();
    expect(r.data.xp).toBe(42);
  });

  it('repairs damaged fields instead of resetting', () => {
    const d = sanitizeProgress({ xp: 250, lessons: { 'elec-voltage': { bestScore: 'oops' } }, streak: 'bad', settings: { dailyGoal: 9999 } });
    expect(d.xp).toBe(250);
    expect(d.level).toBe(levelFromXp(250));
    expect(d.lessons['elec-voltage'].bestScore).toBe(0);
    expect(d.settings.dailyGoal).toBe(30);
  });

  it('exports and imports a backup', () => {
    const d = completeLesson(createInitialProgress(), { lessonId: 'elec-electricity', correct: 3, total: 5, seconds: 60 }, T0, now).data;
    const json = exportJson(d);
    const back = importJson(json);
    expect(back.lessons['elec-electricity'].bestScore).toBeCloseTo(0.6);
    expect(back.xp).toBe(d.xp);
    expect(() => importJson('nope')).toThrow();
    expect(() => importJson('{"hello":1}')).toThrow();
    expect(() => importJson(JSON.stringify({ app: 'servolab', schemaVersion: 99, data: {} }))).toThrow();
  });
});
