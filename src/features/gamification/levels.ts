/** XP needed to go from level L to L+1. */
export function xpForNext(level: number): number {
  return 100 + (level - 1) * 50;
}

/** Total XP required to reach a level (level 1 = 0). */
export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l++) total += xpForNext(l);
  return total;
}

export function levelFromXp(xp: number): number {
  let level = 1;
  let remaining = Math.max(0, Math.floor(xp));
  while (remaining >= xpForNext(level) && level < 999) {
    remaining -= xpForNext(level);
    level++;
  }
  return level;
}

export function levelProgress(xp: number): { level: number; into: number; needed: number; fraction: number } {
  const level = levelFromXp(xp);
  const into = Math.max(0, xp - totalXpForLevel(level));
  const needed = xpForNext(level);
  return { level, into, needed, fraction: Math.min(1, into / needed) };
}

const TITLES: [number, string][] = [
  [1, 'Tinkerer'],
  [3, 'Apprentice'],
  [5, 'Builder'],
  [8, 'Technician'],
  [11, 'Integrator'],
  [15, 'Engineer'],
  [20, 'Systems Engineer'],
  [26, 'Roboticist'],
  [33, 'Lead Roboticist'],
  [40, 'Chief Roboticist']
];

export function levelTitle(level: number): string {
  let title = TITLES[0][1];
  for (const [min, t] of TITLES) if (level >= min) title = t;
  return title;
}
