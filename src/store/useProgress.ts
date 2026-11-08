import { create } from 'zustand';
import type { ProgressData, Settings, TrackId } from '../lib/types';
import type { LoadResult } from '../lib/persistence';
import { dayKey } from '../utils/date';
import {
  completeCircuit,
  completeLesson,
  completeProject,
  completeSession,
  createInitialProgress,
  normalizeOnLaunch,
  openSim,
  recordAnswer,
  setProjectChallenge,
  toggleProjectStep,
  checkAchievements,
  type AnswerInput,
  type GameEvent,
  type LessonCompletion,
  type Result,
  type SessionCompletion
} from './logic';
import { useUi } from './useUi';

export interface BootInfo {
  isNew: boolean;
  recovered: boolean;
  source: LoadResult['source'];
  storageOk: boolean;
}

interface ProgressStore {
  data: ProgressData;
  hydrated: boolean;
  boot: BootInfo | null;
  hydrate: (data: ProgressData, boot: BootInfo) => void;
  replaceAll: (data: ProgressData) => void;
  answer: (a: AnswerInput) => GameEvent[];
  finishLesson: (c: LessonCompletion) => { bonusXp: number; events: GameEvent[] };
  finishSession: (s: SessionCompletion) => { bonusXp: number; passed: boolean; events: GameEvent[] };
  finishCircuit: (circuitId: string, nodeIds: string[]) => { firstTime: boolean };
  markSimOpened: (simId: string) => void;
  toggleStep: (projectId: string, step: number) => void;
  setChallengeDone: (projectId: string, value: boolean) => void;
  finishProject: (projectId: string) => void;
  selectTrack: (track: TrackId) => void;
  setCurrentLesson: (lessonId: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  setName: (name: string) => void;
  setAvatarColor: (color: string) => void;
}

const nowIso = () => new Date().toISOString();

export const useProgress = create<ProgressStore>()((set, get) => {
  /** Apply a pure logic function, store the result and raise celebration events. */
  const apply = <R extends Result>(fn: (d: ProgressData, today: string, now: string) => R): R => {
    const r = fn(get().data, dayKey(), nowIso());
    if (r.data !== get().data) set({ data: r.data });
    if (r.events.length) useUi.getState().push(r.events);
    return r;
  };
  const patch = (fn: (d: ProgressData) => ProgressData) => set({ data: fn(get().data) });

  return {
    // Placeholder until boot finishes. The app does not render (or save) before hydrate().
    data: createInitialProgress(),
    hydrated: false,
    boot: null,
    hydrate: (data, boot) => set({ data: normalizeOnLaunch(data, dayKey()), hydrated: true, boot }),
    replaceAll: (data) => {
      const normalized = normalizeOnLaunch(data, dayKey());
      set({ data: checkAchievements(normalized, nowIso()).data });
    },
    answer: (a) => apply((d, today, now) => recordAnswer(d, a, today, now)).events,
    finishLesson: (c) => {
      const r = apply((d, today, now) => completeLesson(d, c, today, now));
      return { bonusXp: r.bonusXp, events: r.events };
    },
    finishSession: (s) => {
      const r = apply((d, today, now) => completeSession(d, s, today, now));
      return { bonusXp: r.bonusXp, passed: r.passed, events: r.events };
    },
    finishCircuit: (circuitId, nodeIds) => apply((d, today, now) => completeCircuit(d, circuitId, nodeIds, today, now)),
    markSimOpened: (simId) => {
      apply((d, _t, now) => openSim(d, simId, now));
    },
    toggleStep: (projectId, step) => patch((d) => toggleProjectStep(d, projectId, step, nowIso())),
    setChallengeDone: (projectId, value) => patch((d) => setProjectChallenge(d, projectId, value, nowIso())),
    finishProject: (projectId) => {
      apply((d, today, now) => completeProject(d, projectId, today, now));
    },
    selectTrack: (track) => patch((d) => ({ ...d, selectedTrack: track })),
    setCurrentLesson: (lessonId) => patch((d) => ({ ...d, currentLesson: lessonId })),
    updateSettings: (p) => patch((d) => ({ ...d, settings: { ...d.settings, ...p } })),
    setName: (name) => patch((d) => ({ ...d, profile: { ...d.profile, name: name.trim().slice(0, 40) || d.profile.name } })),
    setAvatarColor: (color) => patch((d) => ({ ...d, profile: { ...d.profile, avatarColor: color } }))
  };
});

/** Convenience selector hook for the progress data. */
export function useData<T>(selector: (d: ProgressData) => T): T {
  return useProgress((s) => selector(s.data));
}
