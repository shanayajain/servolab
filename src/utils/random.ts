/** Deterministic PRNG (mulberry32) so daily challenges are stable for a given date. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function shuffle<T>(arr: readonly T[], rand: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Shuffle that guarantees the result differs from the input order when possible. */
export function shuffleDifferent<T>(arr: readonly T[], rand: () => number = Math.random): T[] {
  if (arr.length < 2) return arr.slice();
  for (let tries = 0; tries < 8; tries++) {
    const s = shuffle(arr, rand);
    if (s.some((v, i) => v !== arr[i])) return s;
  }
  const s = arr.slice();
  [s[0], s[1]] = [s[1], s[0]];
  return s;
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}
