/**
 * Small helpers that keep lesson content readable and compact.
 * Every helper returns a plain, fully-typed data object — lessons stay data-driven.
 */
import type {
  ChoiceQuestion,
  CodeQuestion,
  ComponentKind,
  DiagramId,
  FillQuestion,
  LessonDraft,
  LoopElement,
  MatchQuestion,
  MultiQuestion,
  NumericQuestion,
  OrderQuestion,
  Question,
  SimId,
  TapQuestion,
  TeachCard,
  TrueFalseQuestion,
  Visual,
  Difficulty
} from '../../lib/types';

export interface Extra {
  hint?: string;
  visual?: Visual;
}

type ChoiceType = ChoiceQuestion['type'];
const choice =
  (type: ChoiceType) =>
  (prompt: string, options: string[], answer: number, explanation: string, x: Extra = {}): ChoiceQuestion => ({
    type,
    prompt,
    options,
    answer,
    explanation,
    ...x
  });

/** Multiple choice */
export const mc = choice('mc');
/** Predict the result */
export const predict = choice('predict');
/** Debug a circuit / program */
export const debug = choice('debug');
/** Concept identification */
export const concept = choice('concept');
/** Diagram interpretation */
export const diagram = choice('diagram');
/** Scenario question */
export const scenario = choice('scenario');
/** Review question (recalls earlier material) */
export const review = choice('review');

export const tf = (prompt: string, answer: boolean, explanation: string, x: Extra = {}): TrueFalseQuestion => ({
  type: 'tf',
  prompt,
  answer,
  explanation,
  ...x
});

export const multi = (prompt: string, options: string[], answers: number[], explanation: string, x: Extra = {}): MultiQuestion => ({
  type: 'multi',
  prompt,
  options,
  answers,
  explanation,
  ...x
});

export const fill = (
  text: string,
  answers: string[],
  explanation: string,
  x: Extra & { bank?: string[]; prompt?: string } = {}
): FillQuestion => {
  const { prompt, bank, ...rest } = x;
  return { type: 'fill', prompt: prompt ?? 'Complete the sentence', text, answers, explanation, ...(bank ? { bank } : {}), ...rest };
};

export const match = (prompt: string, pairs: [string, string][], explanation: string, x: Extra = {}): MatchQuestion => ({
  type: 'match',
  prompt,
  pairs,
  explanation,
  ...x
});

export const order = (prompt: string, items: string[], explanation: string, x: Extra = {}): OrderQuestion => ({
  type: 'order',
  prompt,
  items,
  explanation,
  ...x
});

export const tap = (prompt: string, targets: ComponentKind[], answer: number, explanation: string, x: Extra = {}): TapQuestion => ({
  type: 'tap',
  prompt,
  targets,
  answer,
  explanation,
  ...x
});

export const code = (
  prompt: string,
  lang: CodeQuestion['lang'],
  source: string,
  options: string[],
  answer: number,
  explanation: string,
  x: Extra = {}
): CodeQuestion => ({ type: 'code', prompt, lang, code: source, options, answer, explanation, ...x });

export const num = (
  prompt: string,
  answer: number,
  unit: string | undefined,
  explanation: string,
  x: Extra & { tolerance?: number } = {}
): NumericQuestion => ({ type: 'numeric', prompt, answer, unit, explanation, ...x });

/* Visual helpers */
export const D = (id: DiagramId, props?: Record<string, string | number | boolean>): Visual => ({ kind: 'diagram', id, props });
export const loop = (...elements: (LoopElement | LoopElement['kind'])[]): Visual => ({
  kind: 'loop',
  elements: elements.map((e) => (typeof e === 'string' ? { kind: e } : e))
});
export const par = (source: string, ...branches: (LoopElement | LoopElement['kind'])[][]): Visual => ({
  kind: 'parallel',
  source,
  branches: branches.map((b) => b.map((e) => (typeof e === 'string' ? { kind: e } : e)))
});
export const el = (kind: LoopElement['kind'], label?: string, lit?: boolean): LoopElement => ({ kind, label, lit });
export const C = (src: string, lang = 'cpp'): Visual => ({ kind: 'code', code: src, lang });
export const S = (id: SimId): Visual => ({ kind: 'sim', id });
export const P = (component: ComponentKind): Visual => ({ kind: 'component', component });

export const card = (title: string, body: string, visual?: Visual): TeachCard => ({ title, body, ...(visual ? { visual } : {}) });

export function lesson(
  id: string,
  title: string,
  topic: string,
  difficulty: Difficulty,
  tags: string[],
  summary: string,
  teach: TeachCard[],
  questions: Question[],
  extra: { prerequisites?: string[]; xp?: number } = {}
): LessonDraft {
  return { id, title, topic, difficulty, tags, summary, teach, questions, ...extra };
}
