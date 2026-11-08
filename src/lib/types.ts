/* ------------------------------------------------------------------ */
/*  Content model                                                      */
/* ------------------------------------------------------------------ */

export type TrackId = 'electronics' | 'robotics' | 'embedded' | 'architecture' | 'pcb' | 'programming';
export type Difficulty = 1 | 2 | 3;

export type QuestionType =
  | 'mc' // multiple choice
  | 'tf' // true / false
  | 'multi' // multiple select
  | 'fill' // fill in the blank
  | 'match' // matching pairs
  | 'order' // put steps in order
  | 'tap' // tap a component
  | 'predict' // predict the result
  | 'debug' // debug a circuit
  | 'code' // code completion
  | 'numeric' // numerical calculation
  | 'concept' // concept identification
  | 'diagram' // diagram interpretation
  | 'scenario' // scenario question
  | 'review'; // review question (recalls an earlier lesson)

export type ComponentKind =
  | 'battery'
  | 'resistor'
  | 'led'
  | 'capacitor'
  | 'diode'
  | 'transistor'
  | 'switch'
  | 'button'
  | 'potentiometer'
  | 'inductor'
  | 'motor'
  | 'servo'
  | 'stepper'
  | 'ultrasonic'
  | 'ir'
  | 'ldr'
  | 'mcu'
  | 'driver'
  | 'regulator'
  | 'ground'
  | 'imu'
  | 'encoder';

/** Small schematic element used by data-driven diagrams. */
export interface LoopElement {
  kind: 'battery' | 'resistor' | 'led' | 'led-rev' | 'switch-open' | 'switch-closed' | 'motor' | 'lamp' | 'capacitor' | 'diode' | 'wire' | 'break' | 'meter-a' | 'meter-v';
  label?: string;
  lit?: boolean;
}

export type Visual =
  | { kind: 'diagram'; id: DiagramId; props?: Record<string, string | number | boolean> }
  | { kind: 'loop'; elements: LoopElement[]; caption?: string }
  | { kind: 'parallel'; source: string; branches: LoopElement[][]; caption?: string }
  | { kind: 'code'; code: string; lang?: string }
  | { kind: 'sim'; id: SimId }
  | { kind: 'component'; component: ComponentKind };

export type DiagramId =
  | 'ohm-triangle'
  | 'divider'
  | 'pull'
  | 'pwm'
  | 'waveforms'
  | 'gate'
  | 'binary'
  | 'h-bridge'
  | 'transistor-switch'
  | 'dof-arm'
  | 'robot-top'
  | 'ultrasonic'
  | 'encoder'
  | 'step-response'
  | 'frames'
  | 'pcb-stack'
  | 'pcb-trace'
  | 'decoupling'
  | 'uart-frame'
  | 'i2c-bus'
  | 'spi-bus'
  | 'cpu'
  | 'mem-hierarchy'
  | 'breadboard'
  | 'cap-charge'
  | 'gears'
  | 'servo-pulse'
  | 'grid-path'
  | 'flipflop'
  | 'feedback-loop'
  | 'adc'
  | 'regulator'
  | 'bounce'
  | 'stack-heap'
  | 'pointer'
  | 'diode-curve'
  | 'sensor-fusion'
  | 'pin-header';

export type SimId =
  | 'pwm'
  | 'dc-motor'
  | 'ultrasonic'
  | 'encoder'
  | 'pid'
  | 'diff-drive'
  | 'line-follow'
  | 'wall-follow'
  | 'frames'
  | 'odometry';

interface QuestionBase {
  prompt: string;
  explanation: string;
  hint?: string;
  visual?: Visual;
}

export interface ChoiceQuestion extends QuestionBase {
  type: 'mc' | 'predict' | 'debug' | 'concept' | 'diagram' | 'scenario' | 'review';
  options: string[];
  answer: number;
}
export interface TrueFalseQuestion extends QuestionBase {
  type: 'tf';
  answer: boolean;
}
export interface MultiQuestion extends QuestionBase {
  type: 'multi';
  options: string[];
  answers: number[];
}
export interface FillQuestion extends QuestionBase {
  type: 'fill';
  /** Sentence containing exactly one "___" placeholder. */
  text: string;
  /** Accepted answers (case-insensitive, whitespace-trimmed). First one is canonical. */
  answers: string[];
  /** Optional word bank. When present the user taps a word instead of typing. */
  bank?: string[];
}
export interface MatchQuestion extends QuestionBase {
  type: 'match';
  pairs: [string, string][];
}
export interface OrderQuestion extends QuestionBase {
  type: 'order';
  /** Items listed in the CORRECT order; shuffled when displayed. */
  items: string[];
}
export interface TapQuestion extends QuestionBase {
  type: 'tap';
  targets: ComponentKind[];
  answer: number;
}
export interface CodeQuestion extends QuestionBase {
  type: 'code';
  lang: 'python' | 'cpp' | 'c' | 'asm';
  /** Code with exactly one "___" placeholder. */
  code: string;
  options: string[];
  answer: number;
}
export interface NumericQuestion extends QuestionBase {
  type: 'numeric';
  answer: number;
  unit?: string;
  /** Relative tolerance, default 0.02 (2%). */
  tolerance?: number;
}

export type Question =
  | ChoiceQuestion
  | TrueFalseQuestion
  | MultiQuestion
  | FillQuestion
  | MatchQuestion
  | OrderQuestion
  | TapQuestion
  | CodeQuestion
  | NumericQuestion;

export interface TeachCard {
  title: string;
  body: string;
  visual?: Visual;
}

export interface Lesson {
  id: string;
  track: TrackId;
  unit: string;
  title: string;
  topic: string;
  difficulty: Difficulty;
  xp: number;
  tags: string[];
  prerequisites: string[];
  summary: string;
  teach: TeachCard[];
  questions: Question[];
}

/** Lesson as authored (prerequisites optional — defaults to the previous lesson in the track). */
export type LessonDraft = Omit<Lesson, 'track' | 'unit' | 'prerequisites' | 'xp'> & {
  prerequisites?: string[];
  xp?: number;
};

export interface UnitChallenge {
  kind: 'quiz' | 'circuit';
  title: string;
  circuitId?: string;
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  lessons: string[];
  challenge?: UnitChallenge;
}

export interface Track {
  id: TrackId;
  title: string;
  short: string;
  tagline: string;
  icon: string;
  units: Unit[];
}

export interface Project {
  id: string;
  title: string;
  difficulty: Difficulty;
  minutes: number;
  summary: string;
  concepts: string[]; // lesson ids
  components: string[];
  goals: string[];
  steps: { title: string; detail: string }[];
  challenge: string;
  sim?: SimId;
  circuit?: string;
  code?: { lang: 'cpp' | 'python'; source: string };
}

/* ------------------------------------------------------------------ */
/*  Runtime question (resolved with ids)                               */
/* ------------------------------------------------------------------ */
export interface ResolvedQuestion {
  qid: string; // `${lessonId}#${index}`
  lessonId: string;
  q: Question;
  isRetry?: boolean;
  label?: string;
}

/* ------------------------------------------------------------------ */
/*  Persisted user progress                                            */
/* ------------------------------------------------------------------ */
export type ConceptState = 'NEW' | 'LEARNING' | 'REVIEW' | 'MASTERED';

export interface ConceptRecord {
  state: ConceptState;
  ease: number;
  interval: number; // days
  due: string; // YYYY-MM-DD
  reps: number;
  lapses: number;
  correct: number;
  incorrect: number;
  lastReviewed: string | null;
}

export interface LessonRecord {
  bestScore: number; // 0..1
  lastScore: number;
  attempts: number;
  firstCompletedAt: string;
  lastCompletedAt: string;
  xpEarned: number;
}

export interface ActivityDay {
  xp: number;
  lessons: number;
  answered: number;
  correct: number;
  seconds: number;
}

export interface PracticeEntry {
  id: string;
  at: string; // ISO
  mode: string;
  title: string;
  correct: number;
  total: number;
  xp: number;
}

export interface ProjectRecord {
  startedAt: string;
  stepsDone: number[];
  challengeDone: boolean;
  completedAt: string | null;
}

export interface Settings {
  dailyGoal: number;
  theme: 'system' | 'light' | 'dark';
  motion: 'system' | 'reduced' | 'full';
  highContrast: boolean;
  showHints: boolean;
  haptics: boolean;
}

export interface Profile {
  name: string;
  avatarColor: string;
  createdAt: string;
}

export interface ProgressData {
  profile: Profile;
  settings: Settings;
  xp: number;
  level: number;
  streak: { current: number; longest: number; lastActiveDate: string | null };
  activity: Record<string, ActivityDay>;
  lessons: Record<string, LessonRecord>;
  nodes: Record<string, { score: number; completedAt: string }>;
  stats: { answered: number; correct: number; incorrect: number; seconds: number; perfectLessons: number };
  concepts: Record<string, ConceptRecord>;
  mistakes: Record<string, { count: number; lastWrongAt: string; resolved: boolean }>;
  practiceHistory: PracticeEntry[];
  projects: Record<string, ProjectRecord>;
  achievements: Record<string, string>;
  circuits: Record<string, string>;
  simsOpened: Record<string, string>;
  dailyChallenges: Record<string, number>;
  selectedTrack: TrackId;
  currentLesson: string | null;
  lastActiveDate: string | null;
}
