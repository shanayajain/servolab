import { useId, type ReactNode } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';

export const INK = 'rgb(var(--ink))';
export const MUTED = 'rgb(var(--ink-3))';
export const BRAND = 'rgb(var(--brand))';
export const BLUE = 'rgb(var(--blue))';
export const OK = 'rgb(var(--ok))';
export const BAD = 'rgb(var(--bad))';
export const GOLD = 'rgb(var(--gold))';
export const PANEL = 'rgb(var(--panel))';
export const SUNK = 'rgb(var(--sunken))';
export const LINE = 'rgb(var(--line))';

export interface SimProps {
  compact?: boolean;
}

export function SimCanvas({ children, label, h = 220, w = 340 }: { children: ReactNode; label: string; h?: number; w?: number }) {
  return (
    <div className="bg-blueprint overflow-hidden rounded-2xl border border-line bg-panel">
      <svg viewBox={`0 0 ${w} ${h}`} className="block h-auto w-full touch-none select-none" role="img" aria-label={label} fontFamily="var(--font-mono)">
        {children}
      </svg>
    </div>
  );
}

export function Slider({
  label, value, min, max, step = 1, onChange, unit = '', format
}: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; unit?: string; format?: (v: number) => string }) {
  const id = useId();
  return (
    <div className="py-1">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-ink-2">{label}</label>
        <span className="tabular font-mono text-sm font-semibold text-ink">{format ? format(value) : value}{unit}</span>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-valuetext={`${format ? format(value) : value}${unit}`} />
    </div>
  );
}

export function Readouts({ items }: { items: [string, string, ('ok' | 'bad' | 'brand' | 'blue')?][] }) {
  const tones = { ok: 'text-ok', bad: 'text-bad', brand: 'text-brand-deep', blue: 'text-blue' };
  return (
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {items.map(([k, v, tone]) => (
        <div key={k} className="rounded-xl border border-line bg-panel px-3 py-2">
          <dt className="font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-3">{k}</dt>
          <dd className={`tabular font-mono text-[15px] font-bold ${tone ? tones[tone] : 'text-ink'}`} aria-live="polite">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function PlayControls({ running, onToggle, onReset }: { running: boolean; onToggle: () => void; onReset: () => void }) {
  return (
    <div className="flex gap-2">
      <button onClick={onToggle} className="press flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border-2 border-ink bg-panel font-bold shadow-[0_3px_0_rgb(var(--ink))] active:shadow-[0_1px_0_rgb(var(--ink))]">
        {running ? <Pause size={18} /> : <Play size={18} />} {running ? 'Pause' : 'Run'}
      </button>
      <button onClick={onReset} className="press flex min-h-[44px] items-center justify-center gap-2 rounded-xl border-2 border-ink bg-panel px-4 font-bold shadow-[0_3px_0_rgb(var(--ink))] active:shadow-[0_1px_0_rgb(var(--ink))]" aria-label="Reset">
        <RotateCcw size={18} /> Reset
      </button>
    </div>
  );
}

export function Segmented<T extends string>({ options, value, onChange, label }: { options: [T, string][]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid gap-1 rounded-xl bg-sunken p-1" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map(([v, l]) => (
        <button
          key={v}
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={`press min-h-[40px] rounded-lg text-sm font-bold ${value === v ? 'bg-panel text-ink shadow-[0_1px_0_rgb(var(--line-strong))]' : 'text-ink-3'}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

/** Robot drawn top-down at the origin, facing +x. */
export function RobotTopGlyph({ size = 1, color = BRAND }: { size?: number; color?: string }) {
  return (
    <g transform={`scale(${size})`}>
      <rect x={-12} y={-11} width={24} height={22} rx={6} fill={PANEL} stroke={INK} strokeWidth={2} />
      <rect x={-8} y={-15} width={12} height={5} rx={1.5} fill={INK} />
      <rect x={-8} y={10} width={12} height={5} rx={1.5} fill={INK} />
      <path d="M2 -5L10 0L2 5Z" fill={color} />
    </g>
  );
}

export function Sparkline({ values, min, max, color = BRAND, target, h = 50, w = 340 }: { values: number[]; min: number; max: number; color?: string; target?: number; h?: number; w?: number }) {
  const n = values.length;
  const y = (v: number) => h - 4 - ((v - min) / (max - min || 1)) * (h - 8);
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${(i / Math.max(1, n - 1)) * w} ${y(v)}`).join('');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="block h-auto w-full" aria-hidden>
      {target !== undefined && <path d={`M0 ${y(target)}H${w}`} stroke={BLUE} strokeWidth={1.5} strokeDasharray="5 4" />}
      <path d={d} stroke={color} strokeWidth={2.5} fill="none" />
    </svg>
  );
}
