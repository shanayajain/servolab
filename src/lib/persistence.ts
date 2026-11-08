/**
 * Local persistence layer.
 *
 *  - Primary store: IndexedDB (database "servolab", object store "kv", key "progress").
 *  - Mirror: localStorage key "servolab:progress" (written synchronously on every save,
 *    so progress survives even if the tab is killed before IndexedDB finishes).
 *  - Last-known-good backup: localStorage key "servolab:progress:backup".
 *
 * Every saved value is an envelope { app, schemaVersion, savedAt, data }.
 * On launch the newest valid copy wins; data is migrated and sanitised field-by-field,
 * so a damaged field is repaired from defaults instead of resetting the whole profile.
 */
import type { ActivityDay, ConceptRecord, LessonRecord, PracticeEntry, ProgressData, ProjectRecord, Settings } from './types';
import { createInitialProgress, DEFAULT_SETTINGS, SCHEMA_VERSION } from '../store/logic';
import { deriveState } from '../features/practice/srs';
import { dayKey, isValidDayKey } from '../utils/date';
import { isTrackId } from '../data/curriculum';
import { levelFromXp } from '../features/gamification/levels';

export const APP_ID = 'servolab';
const DB_NAME = 'servolab';
const STORE = 'kv';
const KEY = 'progress';
const LS_KEY = 'servolab:progress';
const LS_BACKUP = 'servolab:progress:backup';

export interface Envelope {
  app: string;
  schemaVersion: number;
  savedAt: string;
  exportedAt?: string;
  data: unknown;
}

export interface StorageStatus {
  indexedDB: boolean;
  localStorage: boolean;
  persisted: boolean | null;
}

export interface LoadResult {
  data: ProgressData;
  isNew: boolean;
  recovered: boolean;
  source: 'indexeddb' | 'localstorage' | 'backup' | 'new';
  status: StorageStatus;
}

/* ------------------------------------------------------------------ */
/*  Sanitising                                                         */
/* ------------------------------------------------------------------ */
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const num = (v: unknown, d: number, min = -Infinity, max = Infinity): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : d;
const str = (v: unknown, d: string, maxLen = 200): string => (typeof v === 'string' ? v.slice(0, maxLen) : d);
const bool = (v: unknown, d: boolean): boolean => (typeof v === 'boolean' ? v : d);
const iso = (v: unknown, d: string): string => (typeof v === 'string' && !Number.isNaN(Date.parse(v)) ? v : d);

function record<T>(v: unknown, f: (x: unknown, key: string) => T | null): Record<string, T> {
  const out: Record<string, T> = {};
  if (!isObj(v)) return out;
  for (const [k, x] of Object.entries(v)) {
    if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
    const r = f(x, k);
    if (r !== null) out[k] = r;
  }
  return out;
}

export function sanitizeProgress(raw: unknown, now: Date = new Date()): ProgressData {
  const base = createInitialProgress(now);
  if (!isObj(raw)) return base;
  const nowIso = now.toISOString();

  const p = isObj(raw.profile) ? raw.profile : {};
  const s = isObj(raw.settings) ? raw.settings : {};
  const st = isObj(raw.streak) ? raw.streak : {};
  const stats = isObj(raw.stats) ? raw.stats : {};

  const settings: Settings = {
    dailyGoal: [10, 20, 30, 50, 80, 120].includes(num(s.dailyGoal, -1)) ? (s.dailyGoal as number) : DEFAULT_SETTINGS.dailyGoal,
    theme: s.theme === 'light' || s.theme === 'dark' || s.theme === 'system' ? s.theme : DEFAULT_SETTINGS.theme,
    motion: s.motion === 'reduced' || s.motion === 'full' || s.motion === 'system' ? s.motion : DEFAULT_SETTINGS.motion,
    highContrast: bool(s.highContrast, DEFAULT_SETTINGS.highContrast),
    showHints: bool(s.showHints, DEFAULT_SETTINGS.showHints),
    haptics: bool(s.haptics, DEFAULT_SETTINGS.haptics)
  };

  const lessons = record<LessonRecord>(raw.lessons, (x) => {
    if (!isObj(x)) return null;
    const at = iso(x.lastCompletedAt, iso(x.firstCompletedAt, nowIso));
    return {
      bestScore: num(x.bestScore, 0, 0, 1),
      lastScore: num(x.lastScore, num(x.bestScore, 0, 0, 1), 0, 1),
      attempts: Math.round(num(x.attempts, 1, 1)),
      firstCompletedAt: iso(x.firstCompletedAt, at),
      lastCompletedAt: at,
      xpEarned: num(x.xpEarned, 0, 0)
    };
  });

  const concepts = record<ConceptRecord>(raw.concepts, (x) => {
    if (!isObj(x)) return null;
    const c = {
      ease: num(x.ease, 2.3, 1.3, 2.8),
      interval: Math.round(num(x.interval, 0, 0, 3650)),
      due: isValidDayKey(x.due) ? x.due : dayKey(now),
      reps: Math.round(num(x.reps, 0, 0)),
      lapses: Math.round(num(x.lapses, 0, 0)),
      correct: Math.round(num(x.correct, 0, 0)),
      incorrect: Math.round(num(x.incorrect, 0, 0)),
      lastReviewed: isValidDayKey(x.lastReviewed) ? x.lastReviewed : null
    };
    return { ...c, state: deriveState(c) };
  });

  const activity = record<ActivityDay>(raw.activity, (x, k) => {
    if (!isObj(x) || !isValidDayKey(k)) return null;
    return {
      xp: num(x.xp, 0, 0),
      lessons: Math.round(num(x.lessons, 0, 0)),
      answered: Math.round(num(x.answered, 0, 0)),
      correct: Math.round(num(x.correct, 0, 0)),
      seconds: num(x.seconds, 0, 0)
    };
  });

  const practiceHistory: PracticeEntry[] = Array.isArray(raw.practiceHistory)
    ? raw.practiceHistory
        .filter(isObj)
        .map((x, i) => ({
          id: str(x.id, `entry-${i}`),
          at: iso(x.at, nowIso),
          mode: str(x.mode, 'practice', 40),
          title: str(x.title, 'Practice', 80),
          correct: Math.round(num(x.correct, 0, 0)),
          total: Math.round(num(x.total, 0, 0)),
          xp: num(x.xp, 0, 0)
        }))
        .slice(0, 300)
    : [];

  const projects = record<ProjectRecord>(raw.projects, (x) => {
    if (!isObj(x)) return null;
    return {
      startedAt: iso(x.startedAt, nowIso),
      stepsDone: Array.isArray(x.stepsDone) ? [...new Set(x.stepsDone.filter((n): n is number => Number.isInteger(n) && n >= 0))].sort((a, b) => a - b) : [],
      challengeDone: bool(x.challengeDone, false),
      completedAt: typeof x.completedAt === 'string' && !Number.isNaN(Date.parse(x.completedAt)) ? x.completedAt : null
    };
  });

  const isoRecord = (v: unknown) => record<string>(v, (x) => (typeof x === 'string' && !Number.isNaN(Date.parse(x)) ? x : null));

  const xp = num(raw.xp, 0, 0);
  const lastActive = isValidDayKey(st.lastActiveDate) ? st.lastActiveDate : isValidDayKey(raw.lastActiveDate) ? raw.lastActiveDate : null;
  const current = Math.round(num(st.current, 0, 0));

  return {
    profile: {
      name: str(p.name, base.profile.name, 40).trim() || base.profile.name,
      avatarColor: str(p.avatarColor, base.profile.avatarColor, 20),
      createdAt: iso(p.createdAt, base.profile.createdAt)
    },
    settings,
    xp,
    level: levelFromXp(xp),
    streak: { current, longest: Math.max(current, Math.round(num(st.longest, 0, 0))), lastActiveDate: lastActive },
    activity,
    lessons,
    nodes: record(raw.nodes, (x) => (isObj(x) ? { score: num(x.score, 1, 0, 1), completedAt: iso(x.completedAt, nowIso) } : null)),
    stats: {
      answered: Math.round(num(stats.answered, 0, 0)),
      correct: Math.round(num(stats.correct, 0, 0)),
      incorrect: Math.round(num(stats.incorrect, 0, 0)),
      seconds: num(stats.seconds, 0, 0),
      perfectLessons: Math.round(num(stats.perfectLessons, 0, 0))
    },
    concepts,
    mistakes: record(raw.mistakes, (x) =>
      isObj(x) ? { count: Math.round(num(x.count, 1, 1)), lastWrongAt: iso(x.lastWrongAt, nowIso), resolved: bool(x.resolved, false) } : null
    ),
    practiceHistory,
    projects,
    achievements: isoRecord(raw.achievements),
    circuits: isoRecord(raw.circuits),
    simsOpened: isoRecord(raw.simsOpened),
    dailyChallenges: record(raw.dailyChallenges, (x, k) => (isValidDayKey(k) ? num(x, 0, 0, 1) : null)),
    selectedTrack: isTrackId(raw.selectedTrack) ? raw.selectedTrack : base.selectedTrack,
    currentLesson: typeof raw.currentLesson === 'string' ? raw.currentLesson : base.currentLesson,
    lastActiveDate: lastActive
  };
}

/* ------------------------------------------------------------------ */
/*  Migrations: add an entry for each future schema version.          */
/* ------------------------------------------------------------------ */
type Migration = (data: Record<string, unknown>) => Record<string, unknown>;
const MIGRATIONS: Record<number, Migration> = {
  // Example for the future:
  // 2: (d) => ({ ...d, newField: defaultValue }),
};

export function migrate(data: unknown, fromVersion: number): unknown {
  if (!isObj(data)) return data;
  let d: Record<string, unknown> = data;
  for (let v = fromVersion + 1; v <= SCHEMA_VERSION; v++) {
    const m = MIGRATIONS[v];
    if (m) d = m(d);
  }
  return d;
}

export function makeEnvelope(data: ProgressData): Envelope {
  return { app: APP_ID, schemaVersion: SCHEMA_VERSION, savedAt: new Date().toISOString(), data };
}

/** Parse an envelope (or a bare progress object) into valid ProgressData. Throws if it is clearly not Servolab data. */
export function parseEnvelope(raw: unknown): { data: ProgressData; savedAt: number } {
  if (!isObj(raw)) throw new Error('Not a Servolab progress file');
  if ('data' in raw && 'schemaVersion' in raw) {
    if (raw.app !== undefined && raw.app !== APP_ID) throw new Error('This file is from a different app');
    const version = num(raw.schemaVersion, 1);
    if (version > SCHEMA_VERSION) throw new Error('This backup comes from a newer version of Servolab. Update the app first.');
    const migrated = migrate(raw.data, version);
    if (!isObj(migrated)) throw new Error('Progress data is missing');
    return { data: sanitizeProgress(migrated), savedAt: Date.parse(String(raw.savedAt)) || 0 };
  }
  // Bare object: accept only if it looks like progress data.
  if ('lessons' in raw || 'xp' in raw) return { data: sanitizeProgress(raw), savedAt: 0 };
  throw new Error('Not a Servolab progress file');
}

/* ------------------------------------------------------------------ */
/*  IndexedDB                                                          */
/* ------------------------------------------------------------------ */
let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDB(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') return resolve(null);
      const req = indexedDB.open(DB_NAME, 1);
      const timer = setTimeout(() => resolve(null), 4000);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
      };
      req.onsuccess = () => {
        clearTimeout(timer);
        const db = req.result;
        db.onversionchange = () => db.close();
        resolve(db);
      };
      req.onerror = () => {
        clearTimeout(timer);
        resolve(null);
      };
      req.onblocked = () => {
        clearTimeout(timer);
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

async function idbGet(key: string): Promise<unknown> {
  const db = await openDB();
  if (!db) return undefined;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(undefined);
    } catch {
      resolve(undefined);
    }
  });
}

async function idbSet(key: string, value: unknown): Promise<boolean> {
  const db = await openDB();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

/* ------------------------------------------------------------------ */
/*  localStorage                                                       */
/* ------------------------------------------------------------------ */
function lsAvailable(): boolean {
  try {
    const k = '__servolab_probe__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

function lsRead(key: string): unknown {
  try {
    const s = localStorage.getItem(key);
    if (s === null) return undefined;
    return JSON.parse(s);
  } catch {
    return { __corrupt: true };
  }
}

function lsWrite(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */
let status: StorageStatus = { indexedDB: false, localStorage: false, persisted: null };
export const getStorageStatus = (): StorageStatus => status;

export async function loadProgress(): Promise<LoadResult> {
  const ls = lsAvailable();
  const db = await openDB();
  status = { indexedDB: !!db, localStorage: ls, persisted: null };

  const candidates: { source: LoadResult['source']; raw: unknown }[] = [];
  if (db) candidates.push({ source: 'indexeddb', raw: await idbGet(KEY) });
  if (ls) {
    candidates.push({ source: 'localstorage', raw: lsRead(LS_KEY) });
    candidates.push({ source: 'backup', raw: lsRead(LS_BACKUP) });
  }

  let best: { data: ProgressData; savedAt: number; source: LoadResult['source'] } | null = null;
  let sawSomething = false;
  let sawCorrupt = false;
  for (const c of candidates) {
    if (c.raw === undefined || c.raw === null) continue;
    sawSomething = true;
    try {
      const parsed = parseEnvelope(c.raw);
      if (!best || parsed.savedAt > best.savedAt) best = { ...parsed, source: c.source };
    } catch {
      sawCorrupt = true;
    }
  }

  // Ask the browser to keep our storage (best-effort; Safari Home Screen apps are already persistent).
  try {
    if (navigator.storage?.persist) {
      status.persisted = (await navigator.storage.persisted?.()) || (await navigator.storage.persist());
    }
  } catch {
    status.persisted = null;
  }

  if (best) {
    // Snapshot the restored state as the last-known-good backup before anything else writes.
    if (ls) lsWrite(LS_BACKUP, makeEnvelope(best.data));
    return { data: best.data, isNew: false, recovered: sawCorrupt, source: best.source, status };
  }
  return { data: createInitialProgress(), isNew: !sawSomething, recovered: sawSomething, source: 'new', status };
}

let lastBackupAt = 0;

/** Save progress. localStorage is written synchronously; IndexedDB asynchronously. */
export function saveProgress(data: ProgressData): Promise<boolean> {
  const env = makeEnvelope(data);
  if (status.localStorage) {
    lsWrite(LS_KEY, env);
    const now = Date.now();
    if (now - lastBackupAt > 5 * 60 * 1000) {
      lastBackupAt = now;
      lsWrite(LS_BACKUP, env);
    }
  }
  if (status.indexedDB) return idbSet(KEY, env);
  return Promise.resolve(status.localStorage);
}

/** Synchronous best-effort save used when the page is being hidden or closed. */
export function saveProgressSync(data: ProgressData): void {
  if (status.localStorage) lsWrite(LS_KEY, makeEnvelope(data));
  if (status.indexedDB) void idbSet(KEY, makeEnvelope(data));
}

export function exportJson(data: ProgressData): string {
  return JSON.stringify({ ...makeEnvelope(data), exportedAt: new Date().toISOString() }, null, 2);
}

export function importJson(text: string): ProgressData {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  return parseEnvelope(raw).data;
}

/** Remove all saved progress (used by "Reset progress"). */
export async function clearProgress(): Promise<void> {
  try {
    localStorage.removeItem(LS_KEY);
    localStorage.removeItem(LS_BACKUP);
  } catch {
    /* ignore */
  }
  const db = await openDB();
  if (db) {
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).delete(KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }
}
