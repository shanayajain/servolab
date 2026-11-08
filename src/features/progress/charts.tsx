import type { ActivityDay } from '../../lib/types';
import { addDays, dayKey, lastNDays, parseDay, shortDate, shortDay } from '../../utils/date';

const INK = 'rgb(var(--ink))';
const MUTED = 'rgb(var(--ink-3))';
const BRAND = 'rgb(var(--brand))';
const BLUE = 'rgb(var(--blue))';
const GOLD = 'rgb(var(--gold))';
const LINE = 'rgb(var(--line))';

/** Daily XP for the last N days, with the daily goal as a dashed rule. */
export function XpBars({ activity, goal, days = 14 }: { activity: Record<string, ActivityDay>; goal: number; days?: number }) {
  const keys = lastNDays(days);
  const vals = keys.map((k) => activity[k]?.xp ?? 0);
  const max = Math.max(goal * 1.25, ...vals, 10);
  const W = 340, H = 150, top = 14, bottom = 26, left = 4;
  const bw = (W - left) / days;
  const y = (v: number) => top + (H - top - bottom) * (1 - v / max);
  const today = dayKey();
  const total = vals.reduce((a, b) => a + b, 0);
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`XP per day for the last ${days} days. Total ${total} XP.`} fontFamily="var(--font-mono)">
        <line x1={0} x2={W} y1={y(0)} y2={y(0)} stroke={LINE} strokeWidth={1.5} />
        <line x1={0} x2={W} y1={y(goal)} y2={y(goal)} stroke={GOLD} strokeWidth={1.5} strokeDasharray="5 4" />
        <text x={4} y={y(goal) - 4} fontSize={9} textAnchor="start" fill={GOLD} fontWeight={700}>goal {goal}</text>
        {vals.map((v, i) => {
          const x = left + i * bw + bw * 0.18;
          const w = bw * 0.64;
          const isToday = keys[i] === today;
          const met = v >= goal;
          return (
            <g key={keys[i]}>
              <rect x={x} y={y(v)} width={w} height={Math.max(0, y(0) - y(v))} rx={3} fill={met ? BRAND : isToday ? BLUE : INK} opacity={v ? 1 : 0} />
              {v === 0 && <rect x={x} y={y(0) - 2} width={w} height={2} fill={LINE} />}
              {(i % 2 === days % 2 || isToday) && (
                <text x={x + w / 2} y={H - 8} fontSize={9} textAnchor="middle" fill={isToday ? INK : MUTED} fontWeight={isToday ? 800 : 500}>
                  {isToday ? 'today' : shortDay(keys[i]).slice(0, 2)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-1 flex justify-between font-mono text-[11px] text-ink-3">
        <span>{shortDate(keys[0])} – today</span>
        <span>{total} XP · orange = goal met</span>
      </figcaption>
    </figure>
  );
}

/** GitHub-style activity grid: weeks × weekdays. */
export function ActivityHeatmap({ activity, weeks = 16 }: { activity: Record<string, ActivityDay>; weeks?: number }) {
  const today = parseDay(dayKey());
  const end = addDays(dayKey(), 6 - today.getDay()); // end of this week (Sat)
  const start = addDays(end, -(weeks * 7 - 1));
  const cell = 16, gap = 3;
  const W = weeks * (cell + gap) + 18, H = 7 * (cell + gap) + 16;
  const max = Math.max(1, ...Object.values(activity).map((a) => a.xp));
  const todayKey = dayKey();
  const cells = [];
  let active = 0;
  for (let i = 0; i < weeks * 7; i++) {
    const k = addDays(start, i);
    const xp = activity[k]?.xp ?? 0;
    if (xp > 0) active++;
    const future = k > todayKey;
    const lvl = xp === 0 ? 0 : Math.min(4, 1 + Math.floor((xp / max) * 3.999));
    const fills = ['rgb(var(--sunken))', 'rgb(var(--brand) / 0.3)', 'rgb(var(--brand) / 0.55)', 'rgb(var(--brand) / 0.8)', BRAND];
    cells.push(
      <rect
        key={k}
        x={18 + Math.floor(i / 7) * (cell + gap)}
        y={(i % 7) * (cell + gap)}
        width={cell}
        height={cell}
        rx={3}
        fill={future ? 'transparent' : fills[lvl]}
        stroke={k === todayKey ? INK : future ? LINE : 'none'}
        strokeWidth={k === todayKey ? 2 : 1}
        strokeDasharray={future ? '2 2' : undefined}
      >
        <title>{`${shortDate(k)}: ${xp} XP`}</title>
      </rect>
    );
  }
  return (
    <figure>
      <div className="no-scrollbar overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full min-w-[300px]" role="img" aria-label={`Learning activity: ${active} active days in the last ${weeks} weeks`} fontFamily="var(--font-mono)">
          {['M', 'W', 'F'].map((d, i) => (
            <text key={d} x={0} y={(1 + i * 2) * (cell + gap) + 12} fontSize={9} fill={MUTED}>{d}</text>
          ))}
          {cells}
        </svg>
      </div>
      <figcaption className="mt-1 flex items-center justify-between font-mono text-[11px] text-ink-3">
        <span>{active} active days</span>
        <span className="flex items-center gap-1">
          less
          {[0.3, 0.55, 0.8, 1].map((o) => <span key={o} className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: `rgb(var(--brand) / ${o})` }} />)}
          more
        </span>
      </figcaption>
    </figure>
  );
}

/** First-try accuracy per day (only days with answers are plotted). */
export function AccuracyLine({ activity, days = 14 }: { activity: Record<string, ActivityDay>; days?: number }) {
  const keys = lastNDays(days);
  const W = 340, H = 130, top = 12, bottom = 22;
  const pts = keys
    .map((k, i) => ({ i, k, a: activity[k] }))
    .filter((p) => p.a && p.a.answered > 0)
    .map((p) => ({ x: 12 + (p.i / (days - 1)) * (W - 24), y: top + (H - top - bottom) * (1 - p.a!.correct / p.a!.answered), v: p.a!.correct / p.a!.answered, k: p.k }));
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join('');
  const avg = pts.length ? pts.reduce((s, p) => s + p.v, 0) / pts.length : 0;
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={pts.length ? `Average accuracy ${Math.round(avg * 100)} percent over active days` : 'No answers yet'} fontFamily="var(--font-mono)">
        {[0, 0.5, 1].map((g) => (
          <g key={g}>
            <line x1={0} x2={W} y1={top + (H - top - bottom) * (1 - g)} y2={top + (H - top - bottom) * (1 - g)} stroke={LINE} strokeDasharray={g === 0 ? undefined : '3 4'} />
            <text x={W - 2} y={top + (H - top - bottom) * (1 - g) - 3} fontSize={9} textAnchor="end" fill={MUTED}>{g * 100}%</text>
          </g>
        ))}
        {pts.length > 1 && <path d={d} stroke={BLUE} strokeWidth={2.5} fill="none" strokeLinejoin="round" />}
        {pts.map((p) => <circle key={p.k} cx={p.x} cy={p.y} r={4} fill={BLUE} stroke="rgb(var(--panel))" strokeWidth={2} />)}
        {!pts.length && <text x={W / 2} y={H / 2} textAnchor="middle" fontSize={11} fill={MUTED}>Answer some questions to see your accuracy</text>}
        <text x={12} y={H - 6} fontSize={9} fill={MUTED}>{shortDate(keys[0])}</text>
        <text x={W - 12} y={H - 6} fontSize={9} textAnchor="end" fill={MUTED}>today</text>
      </svg>
    </figure>
  );
}
