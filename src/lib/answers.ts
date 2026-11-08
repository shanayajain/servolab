import type { Question } from './types';

/** User answer value, by question type. */
export type AnswerValue = number | boolean | number[] | string | string[] | null;

const CHOICE = new Set(['mc', 'predict', 'debug', 'concept', 'diagram', 'scenario', 'review', 'code', 'tap']);

export function normalizeText(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[“”"']/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([()=;,])\s*/g, '$1');
}

/** Parses things like "4.5", "4,5", "0.25 A", "1e3", "1k", "4.7k", "220Ω", "2.2 m". */
export function parseNumber(input: string): number | null {
  const raw = input.trim().replace(/,/g, '.').replace(/\s+/g, '');
  const m = raw.match(/^([-+]?\d*\.?\d+(?:e[-+]?\d+)?)([a-zµΩ%]*)$/i);
  if (!m) return null;
  let v = parseFloat(m[1]);
  if (Number.isNaN(v)) return null;
  const suffix = m[2];
  // Engineering prefixes only when immediately followed by unit text or alone.
  const prefix = suffix.charAt(0);
  if (suffix.length > 0) {
    if (prefix === 'k' || prefix === 'K') v *= 1e3;
    else if (prefix === 'M' && suffix.length === 1) v *= 1e6;
  }
  return v;
}

export function isAnswered(q: Question, a: AnswerValue): boolean {
  if (a === null || a === undefined) return false;
  switch (q.type) {
    case 'multi':
      return Array.isArray(a) && a.length > 0;
    case 'fill':
    case 'numeric':
      return typeof a === 'string' && a.trim().length > 0;
    case 'match':
      return Array.isArray(a) && a.length === q.pairs.length && (a as number[]).every((v) => typeof v === 'number' && v >= 0);
    case 'order':
      return Array.isArray(a) && a.length === q.items.length;
    case 'tf':
      return typeof a === 'boolean';
    default:
      return typeof a === 'number' && a >= 0;
  }
}

export function checkAnswer(q: Question, a: AnswerValue): boolean {
  if (!isAnswered(q, a)) return false;
  if (CHOICE.has(q.type)) {
    return a === (q as { answer: number }).answer;
  }
  switch (q.type) {
    case 'tf':
      return a === q.answer;
    case 'multi': {
      const got = [...(a as number[])].sort((x, y) => x - y);
      const want = [...q.answers].sort((x, y) => x - y);
      return got.length === want.length && got.every((v, i) => v === want[i]);
    }
    case 'fill': {
      const got = normalizeText(a as string);
      return q.answers.some((ans) => normalizeText(ans) === got);
    }
    case 'match':
      return (a as number[]).every((v, i) => v === i);
    case 'order':
      return (a as string[]).every((v, i) => v === q.items[i]);
    case 'numeric': {
      const v = parseNumber(a as string);
      if (v === null) return false;
      const tol = q.tolerance ?? 0.02;
      const allowed = Math.max(Math.abs(q.answer) * tol, 1e-9);
      return Math.abs(v - q.answer) <= allowed;
    }
    default:
      return false;
  }
}

/** Human-readable correct answer, used in feedback. */
export function correctAnswerText(q: Question): string {
  switch (q.type) {
    case 'tf':
      return q.answer ? 'True' : 'False';
    case 'multi':
      return q.answers.map((i) => q.options[i]).join(' · ');
    case 'fill':
      return q.answers[0];
    case 'match':
      return q.pairs.map(([l, r]) => `${l} → ${r}`).join('\n');
    case 'order':
      return q.items.map((s, i) => `${i + 1}. ${s}`).join('\n');
    case 'numeric':
      return `${formatNum(q.answer)}${q.unit ? ' ' + q.unit : ''}`;
    case 'tap':
      return componentLabel(q.targets[q.answer]);
    default:
      return (q as { options: string[]; answer: number }).options[(q as { answer: number }).answer];
  }
}

/** The correct answer as an AnswerValue (used by the QA auto-solver and tests). */
export function solutionFor(q: Question): AnswerValue {
  switch (q.type) {
    case 'tf':
      return q.answer;
    case 'multi':
      return [...q.answers];
    case 'fill':
      return q.answers[0];
    case 'match':
      return q.pairs.map((_, i) => i);
    case 'order':
      return [...q.items];
    case 'numeric':
      return String(q.answer);
    default:
      return (q as { answer: number }).answer;
  }
}

export function formatNum(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return String(Number(n.toPrecision(4)));
}

const LABELS: Record<string, string> = {
  battery: 'Battery',
  resistor: 'Resistor',
  led: 'LED',
  capacitor: 'Capacitor',
  diode: 'Diode',
  transistor: 'Transistor',
  switch: 'Switch',
  button: 'Push button',
  potentiometer: 'Potentiometer',
  inductor: 'Inductor',
  motor: 'DC motor',
  servo: 'Servo',
  stepper: 'Stepper motor',
  ultrasonic: 'Ultrasonic sensor',
  ir: 'IR sensor',
  ldr: 'Light sensor (LDR)',
  mcu: 'Microcontroller',
  driver: 'Motor driver',
  regulator: 'Voltage regulator',
  ground: 'Ground',
  imu: 'IMU',
  encoder: 'Encoder'
};
export function componentLabel(kind: string): string {
  return LABELS[kind] ?? kind;
}
