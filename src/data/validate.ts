import type { ComponentKind, Question, SimId } from '../lib/types';
import { checkAnswer, solutionFor } from '../lib/answers';
import { allDrafts, allLessons, orphanLessonDrafts, tracks } from './curriculum';
import { projects } from './projects/projects';
import { circuitChallenges } from './circuits';

export const SIM_IDS: SimId[] = ['pwm', 'dc-motor', 'ultrasonic', 'encoder', 'pid', 'diff-drive', 'line-follow', 'wall-follow', 'frames', 'odometry'];
const COMPONENTS: ComponentKind[] = ['battery', 'resistor', 'led', 'capacitor', 'diode', 'transistor', 'switch', 'button', 'potentiometer', 'inductor', 'motor', 'servo', 'stepper', 'ultrasonic', 'ir', 'ldr', 'mcu', 'driver', 'regulator', 'ground', 'imu', 'encoder'];

function count(s: string, sub: string): number {
  return s.split(sub).length - 1;
}

function validateQuestion(q: Question, where: string, errors: string[]): void {
  if (!q.prompt?.trim()) errors.push(`${where}: missing prompt`);
  if (!q.explanation?.trim()) errors.push(`${where}: missing explanation`);
  const opts = (q as { options?: string[] }).options;
  switch (q.type) {
    case 'tf':
      if (typeof q.answer !== 'boolean') errors.push(`${where}: tf answer must be boolean`);
      break;
    case 'multi':
      if (!opts || opts.length < 3) errors.push(`${where}: multi needs ≥3 options`);
      if (!q.answers.length) errors.push(`${where}: multi needs ≥1 answer`);
      if (q.answers.some((a) => a < 0 || a >= q.options.length)) errors.push(`${where}: multi answer out of range`);
      if (new Set(q.answers).size !== q.answers.length) errors.push(`${where}: duplicate multi answers`);
      break;
    case 'fill':
      if (count(q.text, '___') !== 1) errors.push(`${where}: fill text needs exactly one ___`);
      if (!q.answers.length) errors.push(`${where}: fill needs answers`);
      if (q.bank && !q.bank.includes(q.answers[0])) errors.push(`${where}: fill bank must include the canonical answer`);
      break;
    case 'match': {
      if (q.pairs.length < 2) errors.push(`${where}: match needs ≥2 pairs`);
      const lefts = new Set(q.pairs.map((p) => p[0]));
      const rights = new Set(q.pairs.map((p) => p[1]));
      if (lefts.size !== q.pairs.length || rights.size !== q.pairs.length) errors.push(`${where}: match items must be unique`);
      break;
    }
    case 'order':
      if (q.items.length < 3) errors.push(`${where}: order needs ≥3 items`);
      if (new Set(q.items).size !== q.items.length) errors.push(`${where}: order items must be unique`);
      break;
    case 'tap':
      if (q.targets.length < 2) errors.push(`${where}: tap needs ≥2 targets`);
      if (q.answer < 0 || q.answer >= q.targets.length) errors.push(`${where}: tap answer out of range`);
      if (q.targets.some((t) => !COMPONENTS.includes(t))) errors.push(`${where}: unknown tap component`);
      if (new Set(q.targets).size !== q.targets.length) errors.push(`${where}: tap targets must be unique`);
      break;
    case 'numeric':
      if (!Number.isFinite(q.answer)) errors.push(`${where}: numeric answer must be finite`);
      break;
    case 'code':
      if (count(q.code, '___') !== 1) errors.push(`${where}: code needs exactly one ___`);
      break;
    default:
      break;
  }
  if (opts) {
    const answer = (q as { answer?: unknown }).answer;
    if (opts.length < 2) errors.push(`${where}: needs ≥2 options`);
    if (new Set(opts).size !== opts.length) errors.push(`${where}: duplicate options`);
    if (typeof answer === 'number' && (answer < 0 || answer >= opts.length)) errors.push(`${where}: answer index out of range`);
  }
  if (q.visual?.kind === 'sim' && !SIM_IDS.includes(q.visual.id)) errors.push(`${where}: unknown sim ${q.visual.id}`);
  if (!checkAnswer(q, solutionFor(q))) errors.push(`${where}: canonical answer does not pass checkAnswer`);
}

export interface ValidationReport {
  errors: string[];
  stats: { tracks: number; units: number; lessons: number; questions: number; projects: number; types: Record<string, number> };
}

export function validateContent(): ValidationReport {
  const errors: string[] = [];
  const types: Record<string, number> = {};

  // Tracks & units
  const trackIds = new Set<string>();
  const unitIds = new Set<string>();
  const placed = new Set<string>();
  for (const t of tracks) {
    if (trackIds.has(t.id)) errors.push(`duplicate track ${t.id}`);
    trackIds.add(t.id);
    if (!t.units.length) errors.push(`track ${t.id} has no units`);
    for (const u of t.units) {
      if (unitIds.has(u.id)) errors.push(`duplicate unit ${u.id}`);
      unitIds.add(u.id);
      if (!u.lessons.length) errors.push(`unit ${u.id} has no lessons`);
      for (const id of u.lessons) {
        if (placed.has(id)) errors.push(`lesson ${id} placed in more than one unit`);
        placed.add(id);
      }
      if (u.challenge?.kind === 'circuit' && !circuitChallenges.some((c) => c.id === u.challenge?.circuitId)) {
        errors.push(`unit ${u.id} references unknown circuit ${u.challenge.circuitId}`);
      }
    }
  }

  // Draft ids unique & all placed
  const draftIds = new Set<string>();
  for (const [track, list] of Object.entries(allDrafts)) {
    for (const d of list) {
      if (draftIds.has(d.id)) errors.push(`duplicate lesson id ${d.id}`);
      draftIds.add(d.id);
      if (!placed.has(d.id)) errors.push(`lesson ${d.id} (${track}) is not placed in any unit`);
    }
  }
  for (const id of placed) if (!draftIds.has(id)) errors.push(`unit references missing lesson ${id}`);
  for (const id of orphanLessonDrafts) errors.push(`orphan lesson draft ${id}`);

  // Lessons
  const lessonIds = new Set(allLessons.map((l) => l.id));
  for (const l of allLessons) {
    const w = `lesson ${l.id}`;
    if (!l.title.trim() || !l.topic.trim() || !l.summary.trim()) errors.push(`${w}: missing metadata`);
    if (![1, 2, 3].includes(l.difficulty)) errors.push(`${w}: bad difficulty`);
    if (!(l.xp > 0)) errors.push(`${w}: bad xp`);
    if (!l.tags.length) errors.push(`${w}: needs tags`);
    if (!l.teach.length) errors.push(`${w}: needs at least one teaching card`);
    if (l.questions.length < 4) errors.push(`${w}: needs at least 4 questions (has ${l.questions.length})`);
    for (const p of l.prerequisites) if (!lessonIds.has(p)) errors.push(`${w}: unknown prerequisite ${p}`);
    if (l.prerequisites.includes(l.id)) errors.push(`${w}: cannot require itself`);
    l.teach.forEach((c, i) => {
      if (!c.title.trim() || !c.body.trim()) errors.push(`${w} teach ${i}: empty`);
      if (c.visual?.kind === 'sim' && !SIM_IDS.includes(c.visual.id)) errors.push(`${w} teach ${i}: unknown sim`);
    });
    l.questions.forEach((q, i) => {
      types[q.type] = (types[q.type] ?? 0) + 1;
      validateQuestion(q, `${w} q${i}`, errors);
    });
  }

  // Prerequisite cycles
  const visiting = new Set<string>();
  const done = new Set<string>();
  const byId = new Map(allLessons.map((l) => [l.id, l]));
  const visit = (id: string): void => {
    if (done.has(id)) return;
    if (visiting.has(id)) {
      errors.push(`prerequisite cycle at ${id}`);
      return;
    }
    visiting.add(id);
    for (const p of byId.get(id)?.prerequisites ?? []) visit(p);
    visiting.delete(id);
    done.add(id);
  };
  allLessons.forEach((l) => visit(l.id));

  // Projects
  const pids = new Set<string>();
  for (const p of projects) {
    const w = `project ${p.id}`;
    if (pids.has(p.id)) errors.push(`duplicate ${w}`);
    pids.add(p.id);
    if (!p.title || !p.summary || !p.challenge) errors.push(`${w}: missing text`);
    if (p.steps.length < 3) errors.push(`${w}: needs ≥3 steps`);
    if (!p.goals.length || !p.components.length) errors.push(`${w}: needs goals and components`);
    if (!(p.minutes > 0)) errors.push(`${w}: bad estimated time`);
    for (const c of p.concepts) if (!lessonIds.has(c)) errors.push(`${w}: unknown concept lesson ${c}`);
    if (p.sim && !SIM_IDS.includes(p.sim)) errors.push(`${w}: unknown sim ${p.sim}`);
    if (p.circuit && !circuitChallenges.some((c) => c.id === p.circuit)) errors.push(`${w}: unknown circuit ${p.circuit}`);
  }

  // Circuits
  const cids = new Set<string>();
  for (const c of circuitChallenges) {
    if (cids.has(c.id)) errors.push(`duplicate circuit ${c.id}`);
    cids.add(c.id);
    const compIds = new Set(c.components.map((x) => x.id));
    if (compIds.size !== c.components.length) errors.push(`circuit ${c.id}: duplicate component ids`);
    for (const w of c.wires ?? []) {
      const [a, b] = [w[0].split('.')[0], w[1].split('.')[0]];
      if (!compIds.has(a) || !compIds.has(b)) errors.push(`circuit ${c.id}: wire references unknown component`);
    }
  }

  return {
    errors,
    stats: {
      tracks: tracks.length,
      units: unitIds.size,
      lessons: allLessons.length,
      questions: allLessons.reduce((n, l) => n + l.questions.length, 0),
      projects: projects.length,
      types
    }
  };
}
