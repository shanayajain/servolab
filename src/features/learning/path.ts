import type { Lesson, ProgressData, TrackId, Unit } from '../../lib/types';
import { getTrack, lessonsForUnit } from '../../data/curriculum';

export type NodeStatus = 'done' | 'current' | 'available' | 'locked';

export type PathNode =
  | { type: 'lesson'; id: string; lesson: Lesson; status: NodeStatus; score?: number }
  | { type: 'review'; id: string; unit: Unit; status: NodeStatus }
  | { type: 'challenge'; id: string; unit: Unit; status: NodeStatus; circuitId?: string }
  | { type: 'milestone'; id: string; unit: Unit; status: NodeStatus };

export interface PathUnit {
  unit: Unit;
  index: number;
  nodes: PathNode[];
  lessonsDone: number;
  lessonsTotal: number;
}

export const reviewNodeId = (unitId: string) => `${unitId}:review`;
export const challengeNodeId = (unitId: string) => `${unitId}:challenge`;

export function isLessonUnlocked(lesson: Lesson, d: ProgressData): boolean {
  return lesson.prerequisites.every((p) => !!d.lessons[p]);
}

/** Builds the visual learning path for one track, with statuses for every node. */
export function buildPath(trackId: TrackId, d: ProgressData): { units: PathUnit[]; currentId: string | null; done: number; total: number } {
  const track = getTrack(trackId);
  if (!track) return { units: [], currentId: null, done: 0, total: 0 };
  let currentAssigned = false;
  const preferred = d.currentLesson;
  let done = 0;
  let total = 0;

  // Determine which lesson is "current": the stored current lesson if it is in this track
  // and unlocked but unfinished; otherwise the first unlocked unfinished lesson.
  const all = track.units.flatMap((u) => lessonsForUnit(u.id));
  const candidates = all.filter((l) => !d.lessons[l.id] && isLessonUnlocked(l, d));
  const currentLessonId = candidates.find((l) => l.id === preferred)?.id ?? candidates[0]?.id ?? null;

  const units: PathUnit[] = track.units.map((unit, index) => {
    const lessons = lessonsForUnit(unit.id);
    const nodes: PathNode[] = [];
    let lessonsDone = 0;
    for (const lesson of lessons) {
      total++;
      const rec = d.lessons[lesson.id];
      let status: NodeStatus;
      if (rec) {
        status = 'done';
        done++;
        lessonsDone++;
      } else if (lesson.id === currentLessonId) {
        status = 'current';
        currentAssigned = true;
      } else if (isLessonUnlocked(lesson, d)) status = 'available';
      else status = 'locked';
      nodes.push({ type: 'lesson', id: lesson.id, lesson, status, score: rec?.bestScore });
    }
    const unitDone = lessonsDone === lessons.length && lessons.length > 0;
    const rId = reviewNodeId(unit.id);
    const reviewStatus: NodeStatus = d.nodes[rId] ? 'done' : unitDone ? (currentAssigned ? 'available' : 'current') : 'locked';
    if (reviewStatus === 'current') currentAssigned = true;
    nodes.push({ type: 'review', id: rId, unit, status: reviewStatus });
    if (unit.challenge) {
      const cId = challengeNodeId(unit.id);
      const cs: NodeStatus = d.nodes[cId] ? 'done' : unitDone ? 'available' : 'locked';
      nodes.push({ type: 'challenge', id: cId, unit, status: cs, circuitId: unit.challenge.circuitId });
    }
    nodes.push({ type: 'milestone', id: `${unit.id}:milestone`, unit, status: unitDone ? 'done' : 'locked' });
    return { unit, index, nodes, lessonsDone, lessonsTotal: lessons.length };
  });

  const currentId = currentLessonId ?? units.flatMap((u) => u.nodes).find((n) => n.status === 'current')?.id ?? null;
  return { units, currentId, done, total };
}

export function trackProgress(trackId: TrackId, d: ProgressData): { done: number; total: number } {
  const track = getTrack(trackId);
  if (!track) return { done: 0, total: 0 };
  const ids = track.units.flatMap((u) => u.lessons);
  return { done: ids.filter((id) => d.lessons[id]).length, total: ids.length };
}
