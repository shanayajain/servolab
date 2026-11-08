import type { Lesson, LessonDraft, ResolvedQuestion, Track, TrackId, Unit } from '../../lib/types';
import { tracks } from './tracks';
import { electronicsLessons } from '../lessons/electronics';
import { roboticsLessons } from '../lessons/robotics';
import { embeddedLessons } from '../lessons/embedded';
import { architectureLessons } from '../lessons/architecture';
import { pcbLessons } from '../lessons/pcb';
import { programmingLessons } from '../lessons/programming';

export { tracks };

const drafts: Record<TrackId, LessonDraft[]> = {
  electronics: electronicsLessons,
  robotics: roboticsLessons,
  embedded: embeddedLessons,
  architecture: architectureLessons,
  pcb: pcbLessons,
  programming: programmingLessons
};

const XP_BY_DIFFICULTY = { 1: 15, 2: 20, 3: 25 } as const;

/** Build final lessons: attach track/unit, default XP, default prerequisite = previous lesson in the track. */
function build(): { lessons: Lesson[]; byId: Map<string, Lesson>; orphanDrafts: string[] } {
  const lessons: Lesson[] = [];
  const byId = new Map<string, Lesson>();
  const orphanDrafts: string[] = [];
  for (const track of tracks) {
    const draftMap = new Map(drafts[track.id].map((d) => [d.id, d]));
    let prev: string | null = null;
    for (const unit of track.units) {
      for (const id of unit.lessons) {
        const d = draftMap.get(id);
        if (!d) continue; // reported by validation
        draftMap.delete(id);
        const lesson: Lesson = {
          ...d,
          track: track.id,
          unit: unit.id,
          xp: d.xp ?? XP_BY_DIFFICULTY[d.difficulty],
          prerequisites: d.prerequisites ?? (prev ? [prev] : [])
        };
        lessons.push(lesson);
        byId.set(id, lesson);
        prev = id;
      }
    }
    orphanDrafts.push(...draftMap.keys());
  }
  return { lessons, byId, orphanDrafts };
}

const built = build();
export const allLessons: Lesson[] = built.lessons;
export const orphanLessonDrafts: string[] = built.orphanDrafts;
export const allDrafts = drafts;

export function getLesson(id: string | null | undefined): Lesson | undefined {
  return id ? built.byId.get(id) : undefined;
}

export function getTrack(id: string | null | undefined): Track | undefined {
  return tracks.find((t) => t.id === id);
}

export function isTrackId(v: unknown): v is TrackId {
  return typeof v === 'string' && tracks.some((t) => t.id === v);
}

export function getUnit(unitId: string): { track: Track; unit: Unit; index: number } | undefined {
  for (const track of tracks) {
    const index = track.units.findIndex((u) => u.id === unitId);
    if (index >= 0) return { track, unit: track.units[index], index };
  }
  return undefined;
}

export function lessonsForTrack(trackId: TrackId): Lesson[] {
  return allLessons.filter((l) => l.track === trackId);
}

export function lessonsForUnit(unitId: string): Lesson[] {
  return allLessons.filter((l) => l.unit === unitId);
}

export function resolveQuestions(lesson: Lesson): ResolvedQuestion[] {
  return lesson.questions.map((q, i) => ({ qid: `${lesson.id}#${i}`, lessonId: lesson.id, q }));
}

export function getQuestion(qid: string): ResolvedQuestion | undefined {
  const [lessonId, idx] = qid.split('#');
  const lesson = getLesson(lessonId);
  const i = Number(idx);
  if (!lesson || !Number.isInteger(i) || !lesson.questions[i]) return undefined;
  return { qid, lessonId, q: lesson.questions[i] };
}

export function nextLessonInTrack(lessonId: string): Lesson | undefined {
  const l = getLesson(lessonId);
  if (!l) return undefined;
  const list = lessonsForTrack(l.track);
  const i = list.findIndex((x) => x.id === lessonId);
  return i >= 0 ? list[i + 1] : undefined;
}

export const totalLessonCount = allLessons.length;
export const totalQuestionCount = allLessons.reduce((n, l) => n + l.questions.length, 0);
