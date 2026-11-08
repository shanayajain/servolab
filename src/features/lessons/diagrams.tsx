/**
 * Data-driven technical diagrams. One visual language:
 * graphite strokes, blueprint blue for annotations, industrial orange for "active".
 */
import type { ReactNode } from 'react';
import type { DiagramId, LoopElement } from '../../lib/types';

const INK = 'rgb(var(--ink))';
const MUTED = 'rgb(var(--ink-3))';
const BRAND = 'rgb(var(--brand))';
const BLUE = 'rgb(var(--blue))';
const OK = 'rgb(var(--ok))';
const BAD = 'rgb(var(--bad))';
const GOLD = 'rgb(var(--gold))';
const PANEL = 'rgb(var(--panel))';
const SUNK = 'rgb(var(--sunken))';

type P = Record<string, string | number | boolean>;

function Svg({ w = 320, h = 180, label, children }: { w?: number; h?: number; label: string; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mx-auto block h-auto w-full max-w-[420px]" role="img" aria-label={label} fontFamily="var(--font-mono)">
      {children}
    </svg>
  );
}

function T({ x, y, children, size = 11, color = MUTED, anchor = 'middle', weight = 600 }: { x: number; y: number; children: ReactNode; size?: number; color?: string; anchor?: 'start' | 'middle' | 'end'; weight?: number }) {
  return (
    <text x={x} y={y} fontSize={size} fill={color} textAnchor={anchor} fontWeight={weight}>
      {children}
    </text>
  );
}

/* ------------------------------------------------------------------ */
/*  Series loop + parallel ladder (used by many electronics lessons)    */
/* ------------------------------------------------------------------ */
function Element({ el }: { el: LoopElement }) {
  const s = { stroke: INK, strokeWidth: 2.5, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const gap = <rect x={-30} y={-16} width={60} height={32} fill={PANEL} stroke="none" />;
  switch (el.kind) {
    case 'wire':
      return null;
    case 'battery':
      return (
        <g>
          {gap}
          <path d="M-30 0H-6M6 0H30" {...s} />
          <path d="M-6 -16V16" {...s} strokeWidth={3} />
          <path d="M6 -9V9" {...s} strokeWidth={5} />
          <T x={-14} y={-8} size={12} color={INK}>+</T>
        </g>
      );
    case 'resistor':
      return (
        <g>
          {gap}
          <path d="M-30 0H-20l4-9 7 18 7-18 7 18 7-18 4 9H30" {...s} />
        </g>
      );
    case 'led':
    case 'led-rev': {
      const lit = !!el.lit;
      return (
        <g transform={el.kind === 'led-rev' ? 'scale(-1 1)' : undefined}>
          {gap}
          {lit && <circle r={22} fill={BRAND} opacity={0.22} className="anim-glow" />}
          <path d="M-30 0H-10M10 0H30" {...s} />
          <path d="M-10 -11V11L10 0Z" {...s} fill={lit ? BRAND : PANEL} />
          <path d="M10 -11V11" {...s} />
          <path d="M2 -16l7-7M12 -14l7-7" {...s} strokeWidth={1.8} stroke={lit ? BRAND : INK} />
        </g>
      );
    }
    case 'diode':
      return (
        <g>
          {gap}
          <path d="M-30 0H-10M10 0H30" {...s} />
          <path d="M-10 -11V11L10 0Z" {...s} fill={PANEL} />
          <path d="M10 -11V11" {...s} strokeWidth={3.5} />
        </g>
      );
    case 'switch-open':
    case 'switch-closed':
      return (
        <g>
          {gap}
          <path d="M-30 0H-14M14 0H30" {...s} />
          <circle cx={-12} r={3} fill={INK} />
          <circle cx={12} r={3} fill={INK} />
          <path d={el.kind === 'switch-open' ? 'M-12 0L10 -14' : 'M-12 0L12 0'} {...s} />
        </g>
      );
    case 'motor':
      return (
        <g>
          {gap}
          <path d="M-30 0H-14M14 0H30" {...s} />
          <circle r={14} {...s} fill={PANEL} />
          <T x={0} y={4.5} size={13} color={INK} weight={700}>M</T>
        </g>
      );
    case 'lamp': {
      const lit = !!el.lit;
      return (
        <g>
          {gap}
          {lit && <circle r={22} fill={GOLD} opacity={0.28} className="anim-glow" />}
          <path d="M-30 0H-13M13 0H30" {...s} />
          <circle r={13} {...s} fill={lit ? 'rgb(var(--gold-soft))' : PANEL} />
          <path d="M-9 -9L9 9M-9 9L9 -9" {...s} strokeWidth={2} />
        </g>
      );
    }
    case 'capacitor':
      return (
        <g>
          {gap}
          <path d="M-30 0H-5M5 0H30" {...s} />
          <path d="M-5 -13V13M5 -13V13" {...s} strokeWidth={3.5} />
        </g>
      );
    case 'break':
      return (
        <g>
          {gap}
          <path d="M-30 0H-10M10 0H30" {...s} />
          <path d="M-5 -6L5 6M-5 6L5 -6" stroke={BAD} strokeWidth={3} strokeLinecap="round" />
        </g>
      );
    case 'meter-a':
    case 'meter-v':
      return (
        <g>
          {gap}
          <path d="M-30 0H-13M13 0H30" {...s} />
          <circle r={13} {...s} fill={PANEL} stroke={BLUE} />
          <T x={0} y={4.5} size={13} color={BLUE} weight={700}>{el.kind === 'meter-a' ? 'A' : 'V'}</T>
        </g>
      );
    default:
      return null;
  }
}

function Placed({ el, x, y, vertical, labelSide = 'out' }: { el: LoopElement; x: number; y: number; vertical?: boolean; labelSide?: 'out' | 'in' }) {
  return (
    <g>
      <g transform={`translate(${x} ${y}) rotate(${vertical ? 90 : 0})`}>
        <Element el={el} />
      </g>
      {el.label && (
        vertical ? (
          <T x={x + (labelSide === 'out' ? 24 : -24)} y={y + 4} anchor={labelSide === 'out' ? 'start' : 'end'} color={INK}>
            {el.label}
          </T>
        ) : (
          <T x={x} y={y + (labelSide === 'out' ? -22 : 30)} color={INK}>
            {el.label}
          </T>
        )
      )}
    </g>
  );
}

export function LoopDiagram({ elements, caption }: { elements: LoopElement[]; caption?: string }) {
  const battery = elements.find((e) => e.kind === 'battery');
  const rest = elements.filter((e) => e !== battery);
  const L = 50, R = 280, TOP = 36, BOT = 150;
  const slots: { x: number; y: number; vertical?: boolean; side?: 'out' | 'in' }[] = [];
  const top = rest.length <= 2 ? rest.length : 2;
  for (let i = 0; i < top; i++) slots.push({ x: L + ((R - L) * (i + 1)) / (top + 1), y: TOP });
  if (rest.length >= 3) slots.push({ x: R, y: (TOP + BOT) / 2, vertical: true });
  if (rest.length >= 4) slots.push({ x: (L + R) / 2, y: BOT, side: 'in' });
  return (
    <Svg label={caption ?? 'Circuit diagram'}>
      <rect x={L} y={TOP} width={R - L} height={BOT - TOP} fill="none" stroke={INK} strokeWidth={2.5} rx={4} />
      {battery && <Placed el={battery} x={L} y={(TOP + BOT) / 2} vertical labelSide="in" />}
      {rest.slice(0, 4).map((el, i) => (
        <Placed key={i} el={el} x={slots[i].x} y={slots[i].y} vertical={slots[i].vertical} labelSide={slots[i].side} />
      ))}
      {caption && <T x={160} y={174}>{caption}</T>}
    </Svg>
  );
}

export function ParallelDiagram({ source, branches, caption }: { source: string; branches: LoopElement[][]; caption?: string }) {
  const L = 50, TOP = 30, BOT = 150;
  const xs = branches.map((_, i) => 140 + i * (150 / Math.max(1, branches.length - 1 || 1)));
  const R = xs[xs.length - 1] ?? 200;
  return (
    <Svg label={caption ?? 'Parallel circuit'}>
      <path d={`M${L} ${TOP}H${R}M${L} ${BOT}H${R}M${L} ${TOP}V${BOT}`} stroke={INK} strokeWidth={2.5} fill="none" />
      {xs.map((x) => (
        <path key={x} d={`M${x} ${TOP}V${BOT}`} stroke={INK} strokeWidth={2.5} />
      ))}
      <Placed el={{ kind: 'battery', label: source }} x={L} y={(TOP + BOT) / 2} vertical labelSide="in" />
      {branches.map((b, i) => {
        const items = b.slice(0, 2);
        return items.map((el, j) => (
          <Placed key={`${i}-${j}`} el={el} x={xs[i]} y={items.length === 1 ? (TOP + BOT) / 2 : TOP + ((BOT - TOP) * (j + 1)) / 3} vertical />
        ));
      })}
      {xs.map((x) => (
        <g key={`d${x}`}>
          <circle cx={x} cy={TOP} r={3.5} fill={INK} />
          <circle cx={x} cy={BOT} r={3.5} fill={INK} />
        </g>
      ))}
      {caption && <T x={160} y={174}>{caption}</T>}
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Named diagrams                                                      */
/* ------------------------------------------------------------------ */
function OhmTriangle({ p }: { p: P }) {
  const hl = String(p.highlight ?? '');
  const cell = (k: string, x: number, y: number) => (
    <g>
      {hl === k && <circle cx={x} cy={y - 8} r={24} fill={BRAND} opacity={0.25} />}
      <T x={x} y={y} size={30} color={hl === k ? BRAND : INK} weight={700}>{k}</T>
    </g>
  );
  return (
    <Svg label="Ohm's law triangle: V on top, I and R below">
      <path d="M160 14L270 166H50Z" fill={PANEL} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <path d="M92 108H228M160 108V166" stroke={INK} strokeWidth={2.5} />
      {cell('V', 160, 90)}
      {cell('I', 120, 152)}
      {cell('R', 200, 152)}
      <T x={160} y={128} size={14} color={MUTED}>×</T>
      <T x={290} y={60} anchor="end" color={BLUE}>V = I × R</T>
      <T x={290} y={76} anchor="end" color={BLUE}>I = V ÷ R</T>
      <T x={290} y={92} anchor="end" color={BLUE}>R = V ÷ I</T>
    </Svg>
  );
}

function Divider({ p }: { p: P }) {
  const r = (y: number) => <path d={`M160 ${y}l9 5-18 8 18 8-18 8 18 8-18 8 9 5`} stroke={INK} strokeWidth={2.5} fill="none" strokeLinejoin="round" />;
  return (
    <Svg label="Voltage divider">
      <path d="M160 14V30M160 80V100M160 150V166" stroke={INK} strokeWidth={2.5} />
      <rect x={146} y={30} width={28} height={50} fill={PANEL} />
      {r(30)}
      <rect x={146} y={100} width={28} height={50} fill={PANEL} />
      {r(100)}
      <circle cx={160} cy={90} r={4} fill={BRAND} />
      <path d="M160 90H240" stroke={BRAND} strokeWidth={2.5} />
      <T x={246} y={94} anchor="start" color={BRAND} size={12}>Vout</T>
      <T x={174} y={18} anchor="start" color={INK}>Vin {String(p.vin ?? '')}</T>
      <T x={140} y={60} anchor="end" color={INK}>{String(p.r1 ?? 'R1')}</T>
      <T x={140} y={130} anchor="end" color={INK}>{String(p.r2 ?? 'R2')}</T>
      <path d="M146 166h28M152 172h16" stroke={INK} strokeWidth={2.5} />
      <T x={40} y={176} anchor="start" color={BLUE}>Vout = Vin × R2 ÷ (R1 + R2)</T>
    </Svg>
  );
}

function Pull({ p }: { p: P }) {
  const up = p.mode !== 'down';
  const pressed = !!p.pressed;
  const level = up ? (pressed ? 'LOW' : 'HIGH') : pressed ? 'HIGH' : 'LOW';
  // resistor goes to rail of its mode; button goes to the opposite rail
  const resTop = up;
  return (
    <Svg label={`${up ? 'Pull-up' : 'Pull-down'} resistor with button ${pressed ? 'pressed' : 'released'}`}>
      <path d="M40 20H280" stroke={INK} strokeWidth={2.5} />
      <T x={286} y={24} anchor="start" color={INK}>VCC</T>
      <path d="M40 160H280" stroke={INK} strokeWidth={2.5} />
      <T x={286} y={164} anchor="start" color={INK}>GND</T>
      <circle cx={120} cy={90} r={5} fill={BRAND} />
      <path d="M120 90H230" stroke={BRAND} strokeWidth={2.5} />
      <rect x={230} y={74} width={60} height={32} rx={6} fill={PANEL} stroke={INK} strokeWidth={2.5} />
      <T x={260} y={94} color={INK}>PIN</T>
      {/* resistor branch */}
      <g transform={`translate(120 ${resTop ? 20 : 90})`}>
        <path d="M0 0V12l8 4-16 8 16 8-16 8 16 8-8 4V70" stroke={INK} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
      </g>
      <T x={104} y={resTop ? 58 : 128} anchor="end" color={INK}>10 kΩ</T>
      {/* button branch on the other side */}
      <g transform={`translate(70 ${resTop ? 90 : 20})`}>
        <path d="M50 0H0V22" stroke={INK} strokeWidth={2.5} fill="none" />
        <circle cx={0} cy={26} r={3.5} fill={INK} />
        <circle cx={0} cy={48} r={3.5} fill={INK} />
        <path d={pressed ? 'M-10 27V47' : 'M-12 26V48'} stroke={pressed ? BRAND : INK} strokeWidth={3} transform={pressed ? undefined : 'rotate(-25 0 26)'} />
        <path d="M0 52V70" stroke={INK} strokeWidth={2.5} />
      </g>
      <T x={48} y={resTop ? 128 : 58} anchor="middle" color={MUTED}>{pressed ? 'pressed' : 'released'}</T>
      <rect x={176} y={116} width={110} height={30} rx={6} fill={level === 'HIGH' ? 'rgb(var(--ok-soft))' : SUNK} />
      <T x={231} y={136} color={level === 'HIGH' ? OK : INK} size={12}>pin = {level}</T>
    </Svg>
  );
}

function PwmWave({ p }: { p: P }) {
  const duty = Math.max(0, Math.min(100, Number(p.duty ?? 50))) / 100;
  const period = 80;
  let d = 'M20 140';
  for (let i = 0; i < 3; i++) {
    const x0 = 20 + i * period;
    const on = period * duty;
    d += ` L${x0} 40 L${x0 + on} 40 L${x0 + on} 140 L${x0 + period} 140`;
  }
  return (
    <Svg label={`PWM waveform with ${Math.round(duty * 100)} percent duty cycle`}>
      <path d="M20 150H300M20 30V150" stroke={MUTED} strokeWidth={1.5} />
      <path d={d} stroke={BRAND} strokeWidth={3} fill="none" strokeLinejoin="round" />
      <path d={`M20 ${140 - 100 * duty}H260`} stroke={BLUE} strokeWidth={2} strokeDasharray="6 5" />
      <T x={264} y={144 - 100 * duty} anchor="start" color={BLUE}>avg</T>
      <path d={`M20 24H${20 + period}`} stroke={INK} strokeWidth={1.5} />
      <T x={20 + period / 2} y={18} color={INK}>one period</T>
      <T x={14} y={44} anchor="end">5V</T>
      <T x={14} y={144} anchor="end">0</T>
    </Svg>
  );
}

function Waveforms() {
  let a = 'M20 60';
  for (let x = 20; x <= 300; x += 4) a += ` L${x} ${60 - 26 * Math.sin((x - 20) / 22) - 8 * Math.sin((x - 20) / 7)}`;
  return (
    <Svg label="Signal A is a smooth analog wave; signal B is a square digital wave">
      <T x={10} y={64} anchor="start" color={INK} size={14}>A</T>
      <path d={a} stroke={BLUE} strokeWidth={3} fill="none" />
      <T x={10} y={146} anchor="start" color={INK} size={14}>B</T>
      <path d="M24 160H60V118H110V160H140V118H200V160H230V118H300" stroke={BRAND} strokeWidth={3} fill="none" strokeLinejoin="round" />
    </Svg>
  );
}

const GATE_FN: Record<string, (a: number, b: number) => number> = {
  AND: (a, b) => a & b,
  OR: (a, b) => a | b,
  NOT: (a) => (a ? 0 : 1),
  NAND: (a, b) => (a & b ? 0 : 1),
  NOR: (a, b) => (a | b ? 0 : 1),
  XOR: (a, b) => a ^ b
};

function Gate({ p }: { p: P }) {
  const g = String(p.gate ?? 'AND').toUpperCase();
  const a = Number(p.a ?? 0), b = Number(p.b ?? 0);
  const one = g === 'NOT';
  const shape =
    g === 'AND' || g === 'NAND'
      ? 'M110 50H160A40 40 0 0 1 160 130H110Z'
      : g === 'NOT'
        ? 'M115 55L185 90L115 125Z'
        : 'M106 50Q150 50 196 90Q150 130 106 130Q128 90 106 50Z';
  const bubble = g === 'NAND' || g === 'NOR' || g === 'NOT';
  const outX = g === 'AND' || g === 'NAND' ? 200 : g === 'NOT' ? 185 : 196;
  const bit = (v: number, x: number, y: number) => (
    <g>
      <rect x={x - 14} y={y - 14} width={28} height={28} rx={6} fill={v ? 'rgb(var(--brand-soft))' : SUNK} stroke={INK} strokeWidth={2} />
      <T x={x} y={y + 5} size={14} color={INK} weight={700}>{v}</T>
    </g>
  );
  return (
    <Svg label={`${g} gate with inputs ${one ? a : `${a} and ${b}`}; output hidden`}>
      {one ? <path d="M54 90H115" stroke={INK} strokeWidth={2.5} /> : <path d="M54 70H116M54 110H116" stroke={INK} strokeWidth={2.5} />}
      {g === 'XOR' && <path d="M96 50Q118 90 96 130" stroke={INK} strokeWidth={2.5} fill="none" />}
      <path d={shape} fill={PANEL} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      {bubble && <circle cx={outX + 7} cy={90} r={6} fill={PANEL} stroke={INK} strokeWidth={2.5} />}
      <path d={`M${outX + (bubble ? 13 : 0)} 90H262`} stroke={INK} strokeWidth={2.5} />
      {one ? bit(a, 40, 90) : (<>{bit(a, 40, 70)}{bit(b, 40, 110)}</>)}
      <rect x={262} y={76} width={28} height={28} rx={6} fill={SUNK} stroke={INK} strokeWidth={2} strokeDasharray="4 3" />
      <T x={276} y={95} size={14} color={INK}>?</T>
      <T x={150} y={160} color={INK} size={13}>{g}</T>
    </Svg>
  );
}
export const gateOutput = (g: string, a: number, b: number) => (GATE_FN[g] ?? GATE_FN.AND)(a, b);

function BinaryDiagram({ p }: { p: P }) {
  const bits = Number(p.bits ?? 4);
  const value = Number(p.value ?? 0);
  const w = Math.min(64, 260 / bits);
  const x0 = 160 - (bits * w) / 2;
  return (
    <Svg label={`${bits}-bit binary number`} h={140}>
      {Array.from({ length: bits }, (_, i) => {
        const pos = bits - 1 - i;
        const on = (value >> pos) & 1;
        const x = x0 + i * w;
        return (
          <g key={i}>
            <T x={x + w / 2} y={28} color={BLUE}>{2 ** pos}</T>
            <rect x={x + 4} y={40} width={w - 8} height={w - 8} rx={8} fill={on ? BRAND : PANEL} stroke={INK} strokeWidth={2.5} />
            <T x={x + w / 2} y={40 + (w - 8) / 2 + 7} size={20} color={on ? '#1C1F22' : INK} weight={700}>{on}</T>
          </g>
        );
      })}
      <T x={160} y={130} color={MUTED}>place values →  add the lit ones</T>
    </Svg>
  );
}

function HBridge({ p }: { p: P }) {
  const st = String(p.state ?? 'forward');
  const closed = {
    forward: ['tl', 'br'],
    reverse: ['tr', 'bl'],
    off: [],
    short: ['tl', 'bl']
  }[st] ?? [];
  const sw = (id: string, x: number, y: number) => {
    const on = closed.includes(id);
    return (
      <g key={id}>
        <rect x={x - 18} y={y - 18} width={36} height={36} rx={8} fill={on ? (st === 'short' ? 'rgb(var(--bad-soft))' : 'rgb(var(--brand-soft))') : PANEL} stroke={INK} strokeWidth={2.5} />
        <path d={on ? `M${x} ${y - 10}V${y + 10}` : `M${x} ${y - 10}L${x + 9} ${y + 6}`} stroke={on ? (st === 'short' ? BAD : BRAND) : INK} strokeWidth={3} strokeLinecap="round" />
      </g>
    );
  };
  const flowColor = st === 'short' ? BAD : BRAND;
  return (
    <Svg label={`H-bridge in ${st} state`}>
      <path d="M60 18H260M60 162H260M80 18V162M240 18V162M80 90H125M195 90H240" stroke={INK} strokeWidth={2.5} fill="none" />
      <T x={40} y={22} color={INK}>+V</T>
      <T x={40} y={166} color={INK}>GND</T>
      <circle cx={160} cy={90} r={30} fill={PANEL} stroke={INK} strokeWidth={2.5} className={st === 'forward' || st === 'reverse' ? '' : ''} />
      <T x={160} y={96} size={18} color={INK} weight={700}>M</T>
      {sw('tl', 80, 52)}
      {sw('tr', 240, 52)}
      {sw('bl', 80, 128)}
      {sw('br', 240, 128)}
      {st === 'forward' && <path d="M96 64Q120 90 128 90M192 90Q210 90 226 116" stroke={flowColor} strokeWidth={2.5} fill="none" strokeDasharray="5 4" markerEnd="url(#arr)" />}
      {st === 'reverse' && <path d="M224 64Q200 90 192 90M128 90Q110 90 94 116" stroke={flowColor} strokeWidth={2.5} fill="none" strokeDasharray="5 4" markerEnd="url(#arr)" />}
      {st === 'short' && <path d="M66 40V140" stroke={BAD} strokeWidth={3} strokeDasharray="5 4" markerEnd="url(#arr)" />}
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10Z" fill={flowColor} />
        </marker>
      </defs>
    </Svg>
  );
}

function TransistorSwitch({ p }: { p: P }) {
  const on = !!p.on;
  return (
    <Svg label={`NPN low-side switch, transistor ${on ? 'on' : 'off'}`}>
      <path d="M210 14V40M210 96V120M210 150V166M196 166h28" stroke={INK} strokeWidth={2.5} fill="none" />
      <T x={226} y={20} anchor="start" color={INK}>+12 V</T>
      <circle cx={210} cy={68} r={22} fill={PANEL} stroke={INK} strokeWidth={2.5} />
      <T x={210} y={74} size={16} color={INK} weight={700}>M</T>
      <path d="M210 40V46M210 90V96" stroke={INK} strokeWidth={2.5} />
      {on && <circle cx={210} cy={68} r={28} fill="none" stroke={BRAND} strokeWidth={2} strokeDasharray="4 6" className="anim-spin-slow" style={{ transformOrigin: '210px 68px' }} />}
      <circle cx={210} cy={135} r={22} fill={PANEL} stroke={INK} strokeWidth={2.5} />
      <path d="M200 124V146M200 130L210 118V96M200 140L210 150" stroke={INK} strokeWidth={2.5} fill="none" />
      <path d="M150 135H200" stroke={on ? BRAND : INK} strokeWidth={2.5} />
      <path d="M110 135h10l4-7 6 14 6-14 6 14 4-7h4" stroke={INK} strokeWidth={2.5} fill="none" />
      <rect x={30} y={118} width={70} height={34} rx={6} fill={on ? 'rgb(var(--brand-soft))' : SUNK} stroke={INK} strokeWidth={2} />
      <T x={65} y={139} color={INK}>MCU {on ? 'HIGH' : 'LOW'}</T>
      <path d="M100 135H110" stroke={INK} strokeWidth={2.5} />
      <T x={250} y={140} anchor="start">NPN</T>
    </Svg>
  );
}

function DofArm({ p }: { p: P }) {
  const n = Number(p.joints ?? 3);
  const pts: [number, number][] = [[70, 160]];
  const lens = [60, 55, 45, 35];
  const angs = [-70, -20, 25, 60];
  let x = 70, y = 160, a = 0;
  for (let i = 0; i < n; i++) {
    a += angs[i];
    x += lens[i] * Math.cos((a * Math.PI) / 180);
    y += lens[i] * Math.sin((a * Math.PI) / 180);
    pts.push([x, y]);
  }
  return (
    <Svg label={`Robot arm with ${n} rotating joints`}>
      <rect x={40} y={160} width={60} height={12} rx={3} fill={SUNK} stroke={INK} strokeWidth={2.5} />
      {pts.slice(0, -1).map(([x1, y1], i) => (
        <line key={i} x1={x1} y1={y1} x2={pts[i + 1][0]} y2={pts[i + 1][1]} stroke={INK} strokeWidth={10} strokeLinecap="round" />
      ))}
      {pts.slice(0, -1).map(([jx, jy], i) => (
        <g key={`j${i}`}>
          <circle cx={jx} cy={jy} r={9} fill={BRAND} stroke={INK} strokeWidth={2.5} />
          <path d={`M${jx + 14} ${jy - 6}a15 15 0 0 1 -4 18`} stroke={BLUE} strokeWidth={2} fill="none" />
        </g>
      ))}
      <path d={`M${pts[n][0]} ${pts[n][1]}l10 -8M${pts[n][0]} ${pts[n][1]}l12 4`} stroke={INK} strokeWidth={4} strokeLinecap="round" />
    </Svg>
  );
}

function RobotTop({ p }: { p: P }) {
  const sensors = String(p.sensors ?? 'ultrasonic');
  return (
    <Svg label="Top view of a two-wheeled robot">
      <rect x={110} y={40} width={100} height={110} rx={18} fill={PANEL} stroke={INK} strokeWidth={3} />
      <rect x={92} y={70} width={18} height={50} rx={4} fill={INK} />
      <rect x={210} y={70} width={18} height={50} rx={4} fill={INK} />
      <circle cx={160} cy={140} r={6} fill={SUNK} stroke={INK} strokeWidth={2} />
      <rect x={130} y={80} width={60} height={34} rx={4} fill="rgb(var(--blue-soft))" stroke={BLUE} strokeWidth={2} />
      <T x={160} y={101} color={BLUE} size={10}>MCU</T>
      {sensors === 'ultrasonic' && (
        <g>
          <rect x={128} y={30} width={64} height={18} rx={4} fill={SUNK} stroke={INK} strokeWidth={2} />
          <circle cx={144} cy={39} r={6} fill={PANEL} stroke={INK} strokeWidth={2} />
          <circle cx={176} cy={39} r={6} fill={PANEL} stroke={INK} strokeWidth={2} />
          <path d="M136 22a30 30 0 0 1 48 0M128 12a44 44 0 0 1 64 0" stroke={BRAND} strokeWidth={2} fill="none" />
        </g>
      )}
      <T x={60} y={98} color={MUTED}>wheel</T>
      <T x={262} y={98} color={MUTED}>wheel</T>
      <path d="M160 170V158" stroke={MUTED} strokeWidth={1.5} />
      <T x={160} y={178} color={MUTED} size={10}>caster</T>
    </Svg>
  );
}

function UltrasonicDiagram({ p }: { p: P }) {
  const d = Number(p.distance ?? 30);
  const wallX = 90 + Math.min(200, d * 3);
  return (
    <Svg label={`Ultrasonic sensor ${d} centimetres from a wall`}>
      <rect x={20} y={70} width={60} height={40} rx={6} fill={PANEL} stroke={INK} strokeWidth={2.5} />
      <circle cx={38} cy={90} r={9} fill={SUNK} stroke={INK} strokeWidth={2} />
      <circle cx={62} cy={90} r={9} fill={SUNK} stroke={INK} strokeWidth={2} />
      <rect x={wallX} y={30} width={14} height={120} fill={SUNK} stroke={INK} strokeWidth={2.5} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${90 + i * 22} 74q8 16 0 32`} stroke={BRAND} strokeWidth={2} fill="none" opacity={1 - i * 0.25} />
      ))}
      <path d={`M84 128H${wallX - 4}`} stroke={BLUE} strokeWidth={2} markerEnd="url(#u)" markerStart="url(#u)" />
      <T x={(84 + wallX) / 2} y={146} color={BLUE}>{d} cm</T>
      <defs>
        <marker id="u" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10Z" fill={BLUE} />
        </marker>
      </defs>
    </Svg>
  );
}

function EncoderDiagram({ p }: { p: P }) {
  const n = Number(p.slots ?? 12);
  return (
    <Svg label={`Optical encoder disk with ${n} slots`}>
      <circle cx={130} cy={90} r={70} fill={PANEL} stroke={INK} strokeWidth={3} />
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        return <rect key={i} x={-5} y={-62} width={10} height={16} rx={2} fill={SUNK} stroke={INK} strokeWidth={1.5} transform={`translate(130 90) rotate(${(a * 180) / Math.PI})`} />;
      })}
      <circle cx={130} cy={90} r={10} fill={INK} />
      <rect x={200} y={12} width={60} height={30} rx={4} fill="rgb(var(--blue-soft))" stroke={BLUE} strokeWidth={2} />
      <T x={230} y={32} color={BLUE} size={10}>sensor</T>
      <path d="M210 42L138 30" stroke={BRAND} strokeWidth={2} strokeDasharray="4 3" />
      <path d="M220 120h10v-14h10v14h10v-14h10v14h10" stroke={BRAND} strokeWidth={2.5} fill="none" />
      <T x={250} y={140} color={MUTED}>pulses</T>
    </Svg>
  );
}

function StepResponse({ p }: { p: P }) {
  const kind = String(p.kind ?? 'good');
  let d = 'M30 150';
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    let y: number;
    if (kind === 'over') y = 1 - Math.exp(-5 * t) * Math.cos(18 * t);
    else if (kind === 'oscillate') y = 1 - Math.cos(16 * t) * Math.exp(-0.4 * t);
    else if (kind === 'offset') y = 0.78 * (1 - Math.exp(-7 * t));
    else if (kind === 'slow') y = 1 - Math.exp(-2 * t);
    else y = 1 - Math.exp(-6 * t) * (1 + 6 * t);
    d += ` L${30 + t * 270} ${150 - y * 100}`;
  }
  return (
    <Svg label={`Step response: ${kind}`}>
      <path d="M30 20V150H300" stroke={MUTED} strokeWidth={1.5} fill="none" />
      <path d="M30 50H300" stroke={BLUE} strokeWidth={2} strokeDasharray="6 5" />
      <T x={298} y={44} anchor="end" color={BLUE}>setpoint</T>
      <path d={d} stroke={BRAND} strokeWidth={3} fill="none" />
      <T x={165} y={170}>time →</T>
    </Svg>
  );
}

function Frames() {
  return (
    <Svg label="World frame and robot frame">
      <path d="M30 160H120M30 160V70" stroke={INK} strokeWidth={2.5} markerEnd="url(#fa)" />
      <T x={124} y={164} anchor="start" color={INK}>x</T>
      <T x={30} y={62} color={INK}>y</T>
      <T x={56} y={176} color={MUTED}>world</T>
      <g transform="translate(200 90) rotate(-30)">
        <rect x={-26} y={-20} width={52} height={40} rx={10} fill={PANEL} stroke={INK} strokeWidth={2.5} />
        <path d="M0 0H62" stroke={BRAND} strokeWidth={3} markerEnd="url(#fb)" />
        <path d="M0 0V-50" stroke={BLUE} strokeWidth={3} markerEnd="url(#fc)" />
      </g>
      <T x={262} y={56} color={BRAND}>x_r (forward)</T>
      <T x={172} y={30} color={BLUE}>y_r (left)</T>
      <path d="M30 160L200 90" stroke={MUTED} strokeWidth={1.5} strokeDasharray="4 4" />
      <T x={110} y={112} color={MUTED}>(x, y, θ)</T>
      <defs>
        {[['fa', INK], ['fb', BRAND], ['fc', BLUE]].map(([id, c]) => (
          <marker key={id} id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10Z" fill={c} />
          </marker>
        ))}
      </defs>
    </Svg>
  );
}

function PcbStack({ p }: { p: P }) {
  const four = Number(p.layers ?? 2) === 4;
  const layers = four
    ? [['Silkscreen', SUNK, 6], ['Solder mask', 'rgb(var(--ok-soft))', 8], ['Top copper — signals', GOLD, 10], ['Prepreg', PANEL, 12], ['Inner 1 — GND plane', BRAND, 10], ['Core (FR-4)', PANEL, 18], ['Inner 2 — power', BLUE, 10], ['Prepreg', PANEL, 12], ['Bottom copper — signals', GOLD, 10], ['Solder mask', 'rgb(var(--ok-soft))', 8]]
    : [['Silkscreen', SUNK, 8], ['Solder mask', 'rgb(var(--ok-soft))', 10], ['Top copper', GOLD, 14], ['FR-4 core', PANEL, 40], ['Bottom copper', GOLD, 14], ['Solder mask', 'rgb(var(--ok-soft))', 10]];
  let y = 18;
  return (
    <Svg label={`${four ? 'Four' : 'Two'}-layer PCB stack-up`}>
      {layers.map(([name, fill, h], i) => {
        const el = (
          <g key={i}>
            <rect x={30} y={y} width={140} height={Number(h)} fill={String(fill)} stroke={INK} strokeWidth={1.5} />
            <T x={180} y={y + Number(h) / 2 + 4} anchor="start" color={INK} size={10}>{String(name)}</T>
          </g>
        );
        y += Number(h) + 2;
        return el;
      })}
    </Svg>
  );
}

function PcbTrace() {
  return (
    <Svg label="PCB traces on two layers joined by a via">
      <rect x={20} y={20} width={280} height={140} rx={10} fill="rgb(var(--ok-soft))" stroke={INK} strokeWidth={2} />
      <path d="M50 60H150L170 80V120" stroke={GOLD} strokeWidth={8} fill="none" strokeLinejoin="round" />
      <rect x={36} y={50} width={20} height={20} rx={3} fill={GOLD} stroke={INK} strokeWidth={1.5} />
      <circle cx={170} cy={120} r={10} fill={GOLD} stroke={INK} strokeWidth={1.5} />
      <circle cx={170} cy={120} r={4} fill={INK} />
      <path d="M170 120H270" stroke={BLUE} strokeWidth={8} strokeDasharray="1 0" opacity={0.7} />
      <rect x={262} y={110} width={20} height={20} rx={3} fill={GOLD} stroke={INK} strokeWidth={1.5} />
      <T x={100} y={48} color={INK}>top trace</T>
      <T x={220} y={148} color={BLUE}>bottom trace</T>
      <T x={170} y={100} color={INK}>via</T>
    </Svg>
  );
}

function Decoupling() {
  return (
    <Svg label="Decoupling capacitor placed right next to an IC's power pin">
      <rect x={110} y={50} width={100} height={80} rx={6} fill={PANEL} stroke={INK} strokeWidth={2.5} />
      <T x={160} y={94} color={INK} size={13}>IC</T>
      {[60, 80, 100, 120].map((y) => (
        <path key={y} d={`M100 ${y}H110M210 ${y}H220`} stroke={INK} strokeWidth={2.5} />
      ))}
      <path d="M220 60H250V40" stroke={BRAND} strokeWidth={2.5} fill="none" />
      <path d="M240 40h20M240 34h20" stroke={INK} strokeWidth={3} />
      <path d="M250 34V22" stroke={INK} strokeWidth={2.5} />
      <T x={262} y={40} anchor="start" color={BRAND}>100 nF</T>
      <T x={238} y={74} anchor="start" color={MUTED}>VCC pin</T>
      <path d="M40 22H250" stroke={INK} strokeWidth={2.5} />
      <T x={40} y={16} anchor="start">from regulator →</T>
      <circle cx={250} cy={22} r={3} fill={INK} />
      <T x={160} y={160} color={BLUE}>shortest possible loop</T>
    </Svg>
  );
}

function UartFrame({ p }: { p: P }) {
  const byte = Number(p.byte ?? 65);
  const bits = [0, ...Array.from({ length: 8 }, (_, i) => (byte >> i) & 1), 1];
  let d = 'M20 40H40';
  let x = 40;
  let prev = 1;
  bits.forEach((b) => {
    if (b !== prev) d += `V${b ? 40 : 120}`;
    x += 26;
    d += `H${x}`;
    prev = b;
  });
  d += `V40H310`;
  return (
    <Svg label={`UART frame sending byte ${byte}`}>
      <path d={d} stroke={BRAND} strokeWidth={3} fill="none" strokeLinejoin="round" />
      {bits.map((b, i) => (
        <g key={i}>
          <T x={53 + i * 26} y={146} color={i === 0 || i === 9 ? BLUE : INK} size={10}>{i === 0 ? 'S' : i === 9 ? 'P' : `D${i - 1}`}</T>
          <T x={53 + i * 26} y={162} color={MUTED} size={11}>{b}</T>
        </g>
      ))}
      <T x={160} y={22} color={INK}>idle HIGH · start · 8 data bits (LSB first) · stop</T>
    </Svg>
  );
}

function I2cBus() {
  return (
    <Svg label="I2C bus with controller and three devices sharing SDA and SCL">
      <path d="M30 60H300M30 100H300" stroke={INK} strokeWidth={2.5} />
      <T x={300} y={54} anchor="end" color={BLUE}>SDA</T>
      <T x={300} y={94} anchor="end" color={BLUE}>SCL</T>
      <path d="M60 20V60M80 20V100" stroke={INK} strokeWidth={2} />
      <rect x={52} y={18} width={36} height={10} fill={PANEL} stroke={INK} strokeWidth={1.5} />
      <T x={70} y={14} size={9}>4.7k pull-ups → VCC</T>
      {[['MCU', 40], ['IMU 0x68', 120], ['OLED 0x3C', 190], ['TOF 0x29', 260]].map(([n, x]) => (
        <g key={String(n)}>
          <path d={`M${Number(x) + 12} 60V130M${Number(x) + 24} 100V130`} stroke={INK} strokeWidth={2} />
          <rect x={Number(x) - 4} y={130} width={56} height={34} rx={6} fill={n === 'MCU' ? 'rgb(var(--brand-soft))' : PANEL} stroke={INK} strokeWidth={2} />
          <T x={Number(x) + 24} y={151} size={9} color={INK}>{String(n)}</T>
        </g>
      ))}
    </Svg>
  );
}

function SpiBus() {
  return (
    <Svg label="SPI bus: shared clock and data lines, one chip-select per device">
      <rect x={20} y={50} width={70} height={90} rx={8} fill="rgb(var(--brand-soft))" stroke={INK} strokeWidth={2.5} />
      <T x={55} y={100} color={INK}>MCU</T>
      {['SCLK', 'MOSI', 'MISO'].map((n, i) => (
        <g key={n}>
          <path d={`M90 ${62 + i * 18}H300`} stroke={INK} strokeWidth={2} />
          <T x={100} y={58 + i * 18} anchor="start" size={9} color={BLUE}>{n}</T>
        </g>
      ))}
      <path d="M90 124H170V150M90 134H250V150" stroke={BRAND} strokeWidth={2} fill="none" />
      <T x={130} y={120} size={9} color={BRAND}>CS1</T>
      <T x={210} y={130} size={9} color={BRAND}>CS2</T>
      {[150, 230].map((x, i) => (
        <g key={x}>
          {[0, 1, 2].map((j) => <path key={j} d={`M${x + 8 + j * 10} ${62 + j * 18}V150`} stroke={INK} strokeWidth={1.5} />)}
          <rect x={x} y={150} width={50} height={24} rx={5} fill={PANEL} stroke={INK} strokeWidth={2} />
          <T x={x + 25} y={166} size={9} color={INK}>{i ? 'SD' : 'TFT'}</T>
        </g>
      ))}
    </Svg>
  );
}

function CpuDiagram() {
  const box = (x: number, y: number, w: number, h: number, t: string, fill = PANEL) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={fill} stroke={INK} strokeWidth={2.5} />
      <T x={x + w / 2} y={y + h / 2 + 4} color={INK}>{t}</T>
    </g>
  );
  return (
    <Svg label="CPU block diagram: control unit, ALU and registers connected to memory over buses">
      <rect x={14} y={14} width={190} height={152} rx={12} fill="none" stroke={BRAND} strokeWidth={2} strokeDasharray="6 4" />
      <T x={24} y={30} anchor="start" color={BRAND}>CPU</T>
      {box(30, 40, 160, 34, 'Control unit', 'rgb(var(--brand-soft))')}
      {box(30, 86, 72, 66, 'ALU')}
      {box(114, 86, 76, 66, 'Registers')}
      {box(240, 50, 66, 100, 'Memory', 'rgb(var(--blue-soft))')}
      <path d="M204 80H240M204 120H240" stroke={BLUE} strokeWidth={3} />
      <T x={222} y={74} size={9} color={BLUE}>addr</T>
      <T x={222} y={136} size={9} color={BLUE}>data</T>
    </Svg>
  );
}

function MemHierarchy() {
  const rows = [['Registers', '<1 ns', 70], ['L1 cache', '~1 ns', 120], ['L2 / L3 cache', '~5–20 ns', 170], ['Main RAM', '~80 ns', 220], ['SSD storage', '~50 µs', 270]];
  return (
    <Svg label="Memory hierarchy from fast small registers to large slow storage">
      {rows.map(([n, t, w], i) => (
        <g key={String(n)}>
          <rect x={160 - Number(w) / 2} y={14 + i * 32} width={Number(w)} height={26} rx={5} fill={i === 0 ? 'rgb(var(--brand-soft))' : i === 4 ? 'rgb(var(--blue-soft))' : PANEL} stroke={INK} strokeWidth={2} />
          <T x={160} y={31 + i * 32} color={INK} size={10}>{`${n} · ${t}`}</T>
        </g>
      ))}
      <T x={8} y={24} anchor="start" color={BRAND} size={9}>faster</T>
      <T x={8} y={170} anchor="start" color={BLUE} size={9}>bigger</T>
    </Svg>
  );
}

function Breadboard() {
  const holes: ReactNode[] = [];
  for (let c = 0; c < 14; c++) {
    for (let r = 0; r < 5; r++) {
      const hl = c === 6;
      holes.push(<rect key={`a${c}-${r}`} x={34 + c * 19} y={46 + r * 12} width={6} height={6} rx={1} fill={hl ? BRAND : INK} opacity={hl ? 1 : 0.55} />);
      holes.push(<rect key={`b${c}-${r}`} x={34 + c * 19} y={116 + r * 12} width={6} height={6} rx={1} fill={INK} opacity={0.55} />);
    }
  }
  return (
    <Svg label="Breadboard: each column of five holes is connected; rails run along the edges">
      <rect x={16} y={10} width={288} height={170} rx={10} fill={PANEL} stroke={INK} strokeWidth={2.5} />
      {[18, 28, 160, 170].map((y, i) => (
        <g key={y}>
          <path d={`M30 ${y}H292`} stroke={i % 2 ? BAD : BLUE} strokeWidth={1.5} opacity={0.7} />
        </g>
      ))}
      <rect x={20} y={104} width={280} height={6} fill={SUNK} />
      {holes}
      <rect x={146} y={40} width={18} height={66} rx={4} fill="none" stroke={BRAND} strokeWidth={2} />
      <T x={155} y={36} color={BRAND} size={9}>row 12: a–e joined</T>
    </Svg>
  );
}

function CapCharge() {
  let d = 'M30 150';
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    d += ` L${30 + t * 270} ${150 - (1 - Math.exp(-5 * t)) * 110}`;
  }
  const x1 = 30 + 270 / 5;
  return (
    <Svg label="Capacitor charging curve; 63 percent after one time constant">
      <path d="M30 30V150H300" stroke={MUTED} strokeWidth={1.5} fill="none" />
      <path d="M30 40H300" stroke={BLUE} strokeWidth={1.5} strokeDasharray="5 4" />
      <path d={d} stroke={BRAND} strokeWidth={3} fill="none" />
      <path d={`M${x1} 150V${150 - 0.632 * 110}H30`} stroke={INK} strokeWidth={1.5} strokeDasharray="3 3" fill="none" />
      <T x={x1} y={166} color={INK}>1τ</T>
      <T x={26} y={150 - 0.632 * 110 + 4} anchor="end" color={INK}>63%</T>
      <T x={300} y={34} anchor="end" color={BLUE}>supply</T>
      {[2, 3, 5].map((k) => <T key={k} x={30 + (270 * k) / 5} y={166}>{k}τ</T>)}
    </Svg>
  );
}

function Gears({ p }: { p: P }) {
  const ratio = Number(p.ratio ?? 3);
  const r1 = 24, r2 = r1 * ratio;
  const gear = (cx: number, r: number, teeth: number, fill: string, cls: string) => (
    <g className={cls} style={{ transformOrigin: `${cx}px 95px` }}>
      {Array.from({ length: teeth }, (_, i) => (
        <rect key={i} x={cx - 4} y={95 - r - 7} width={8} height={10} rx={2} fill={fill} stroke={INK} strokeWidth={1.5} transform={`rotate(${(i * 360) / teeth} ${cx} 95)`} />
      ))}
      <circle cx={cx} cy={95} r={r} fill={fill} stroke={INK} strokeWidth={2.5} />
      <circle cx={cx} cy={95} r={5} fill={INK} />
      <path d={`M${cx} 95V${95 - r + 6}`} stroke={INK} strokeWidth={2} />
    </g>
  );
  const cx2 = 70 + r1 + r2 + 6;
  return (
    <Svg label={`Gear pair with a ${ratio} to 1 ratio`}>
      {gear(70, r1, 10, 'rgb(var(--brand-soft))', 'anim-spin')}
      {gear(cx2, r2, 10 * ratio, PANEL, '')}
      <T x={70} y={170} color={INK}>motor · 10T</T>
      <T x={cx2} y={175} color={INK}>output · {10 * ratio}T</T>
    </Svg>
  );
}

function ServoPulse({ p }: { p: P }) {
  const ms = Number(p.ms ?? 1.5);
  const w = ms * 40;
  return (
    <Svg label={`Servo control pulse of ${ms} milliseconds every 20 milliseconds`}>
      <path d={`M20 120H40V50H${40 + w}V120H220V50H${220 + w}V120H310`} stroke={BRAND} strokeWidth={3} fill="none" strokeLinejoin="round" />
      <path d={`M40 40H${40 + w}`} stroke={BLUE} strokeWidth={2} />
      <T x={40 + w / 2} y={34} color={BLUE}>{ms} ms</T>
      <path d="M40 140H220" stroke={INK} strokeWidth={1.5} />
      <T x={130} y={156} color={INK}>20 ms period</T>
      <g transform="translate(270 80)">
        <circle r={18} fill={PANEL} stroke={INK} strokeWidth={2.5} />
        <path d={`M0 0L${-Math.cos(((ms - 1) * Math.PI))* 24} ${-Math.sin(((ms - 1) * Math.PI)) * 24}`} stroke={INK} strokeWidth={5} strokeLinecap="round" />
      </g>
    </Svg>
  );
}

function GridPath() {
  const N = 8, s = 18, ox = 88, oy = 14;
  const walls = new Set(['3,1', '3,2', '3,3', '3,4', '3,5', '5,3', '5,4', '5,5', '5,6', '5,7']);
  const path = [[1, 6], [1, 5], [1, 4], [1, 3], [1, 2], [1, 1], [1, 0], [2, 0], [3, 0], [4, 0], [4, 1], [4, 2], [5, 2], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6]];
  const cells: ReactNode[] = [];
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const wall = walls.has(`${x},${y}`);
      cells.push(<rect key={`${x}-${y}`} x={ox + x * s} y={oy + y * s} width={s} height={s} fill={wall ? INK : PANEL} stroke="rgb(var(--line))" strokeWidth={1} />);
    }
  const d = path.map(([x, y], i) => `${i ? 'L' : 'M'}${ox + x * s + s / 2} ${oy + y * s + s / 2}`).join('');
  return (
    <Svg label="Grid map with obstacles and a planned path from S to G">
      {cells}
      <path d={d} stroke={BRAND} strokeWidth={4} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <T x={ox + 1 * s + s / 2} y={oy + 6 * s + s / 2 + 4} color={INK} size={11}>S</T>
      <rect x={ox + 6 * s + 2} y={oy + 6 * s + 2} width={s - 4} height={s - 4} rx={3} fill={OK} />
      <T x={ox + 6 * s + s / 2} y={oy + 6 * s + s / 2 + 4} color="#fff" size={11}>G</T>
    </Svg>
  );
}

function FlipFlop() {
  return (
    <Svg label="D flip-flop with data, clock and output Q">
      <rect x={110} y={30} width={100} height={110} rx={8} fill={PANEL} stroke={INK} strokeWidth={2.5} />
      <path d="M60 60H110M60 110H110M210 60H260" stroke={INK} strokeWidth={2.5} />
      <path d="M110 100L122 110L110 120" stroke={INK} strokeWidth={2} fill="none" />
      <T x={52} y={64} anchor="end" color={INK}>D</T>
      <T x={52} y={114} anchor="end" color={INK}>CLK</T>
      <T x={268} y={64} anchor="start" color={INK}>Q</T>
      <T x={160} y={90} color={MUTED}>D flip-flop</T>
      <path d="M40 166H70V146H100V166H130V146H160V166H190V146H220V166" stroke={BRAND} strokeWidth={2.5} fill="none" />
      <path d="M70 140V170M130 140V170M190 140V170" stroke={BLUE} strokeWidth={1.5} strokeDasharray="3 3" />
      <T x={250} y={160} anchor="start" color={BLUE} size={9}>↑ edges</T>
    </Svg>
  );
}

function FeedbackLoop({ p }: { p: P }) {
  const closed = p.closed !== false;
  const box = (x: number, t: string, fill = PANEL) => (
    <g>
      <rect x={x} y={60} width={70} height={40} rx={8} fill={fill} stroke={INK} strokeWidth={2.5} />
      <T x={x + 35} y={84} color={INK} size={10}>{t}</T>
    </g>
  );
  return (
    <Svg label={closed ? 'Closed-loop feedback diagram' : 'Open-loop diagram with no feedback'}>
      <T x={22} y={74} color={BLUE} size={10}>target</T>
      <path d="M14 80H40" stroke={INK} strokeWidth={2.5} markerEnd="url(#fl)" />
      <circle cx={52} cy={80} r={12} fill={PANEL} stroke={INK} strokeWidth={2.5} />
      <T x={52} y={84} color={INK}>{closed ? 'Σ' : ''}</T>
      <path d="M64 80H88" stroke={INK} strokeWidth={2.5} markerEnd="url(#fl)" />
      {box(90, 'controller', 'rgb(var(--brand-soft))')}
      <path d="M160 80H180" stroke={INK} strokeWidth={2.5} markerEnd="url(#fl)" />
      {box(182, 'motor/plant')}
      <path d="M252 80H306" stroke={INK} strokeWidth={2.5} markerEnd="url(#fl)" />
      <T x={290} y={72} color={INK} size={10}>output</T>
      {closed ? (
        <>
          <path d="M280 80V140H52V92" stroke={BLUE} strokeWidth={2.5} fill="none" markerEnd="url(#fb2)" />
          <rect x={136} y={126} width={70} height={28} rx={6} fill="rgb(var(--blue-soft))" stroke={BLUE} strokeWidth={2} />
          <T x={171} y={144} color={BLUE} size={10}>sensor</T>
          <T x={60} y={112} anchor="start" color={BLUE} size={10}>− measured</T>
        </>
      ) : (
        <T x={160} y={150} color={MUTED}>no measurement fed back</T>
      )}
      <defs>
        <marker id="fl" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill={INK} /></marker>
        <marker id="fb2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill={BLUE} /></marker>
      </defs>
    </Svg>
  );
}

function AdcDiagram({ p }: { p: P }) {
  const bits = Number(p.bits ?? 3);
  const levels = 2 ** bits;
  let stair = 'M30 150';
  let ramp = 'M30 150';
  for (let i = 0; i <= 100; i++) {
    const v = i / 100;
    ramp += ` L${30 + v * 260} ${150 - v * 120}`;
    const q = Math.min(levels - 1, Math.floor(v * levels)) / (levels - 1);
    stair += ` L${30 + v * 260} ${150 - q * 120}`;
  }
  return (
    <Svg label={`${bits}-bit ADC quantising a ramp into ${levels} levels`}>
      <path d="M30 20V150H300" stroke={MUTED} strokeWidth={1.5} fill="none" />
      <path d={ramp} stroke={BLUE} strokeWidth={2} strokeDasharray="5 4" fill="none" />
      <path d={stair} stroke={BRAND} strokeWidth={3} fill="none" />
      <T x={160} y={170}>input voltage →</T>
      <T x={36} y={22} anchor="start" color={BRAND}>{levels} steps ({bits}-bit)</T>
    </Svg>
  );
}

function RegulatorDiagram({ p }: { p: P }) {
  const buck = p.kind === 'buck';
  return (
    <Svg label={buck ? 'Buck converter' : 'Linear regulator'}>
      <rect x={120} y={60} width={80} height={56} rx={8} fill={PANEL} stroke={INK} strokeWidth={2.5} />
      <T x={160} y={92} color={INK}>{buck ? 'BUCK' : 'LDO / 7805'}</T>
      <path d="M40 80H120M200 80H280M160 116V150M146 150H174" stroke={INK} strokeWidth={2.5} />
      <T x={40} y={70} anchor="start" color={INK}>IN 9 V</T>
      <T x={280} y={70} anchor="end" color={OK}>OUT 5 V</T>
      {!buck && (
        <g>
          {[0, 1, 2].map((i) => <path key={i} d={`M${140 + i * 20} 54q-6 -10 0 -20q6 -10 0 -18`} stroke={BAD} strokeWidth={2} fill="none" />)}
          <T x={160} y={14} color={BAD}>heat = (Vin − Vout) × I</T>
        </g>
      )}
    </Svg>
  );
}

function Bounce() {
  return (
    <Svg label="Button press signal with contact bounce">
      <path d="M20 130H90V40H96V130H102V40H110V120H114V40H122V130H126V40H300" stroke={BRAND} strokeWidth={3} fill="none" strokeLinejoin="round" />
      <rect x={88} y={26} width={42} height={116} fill="rgb(var(--bad-soft))" opacity={0.6} />
      <T x={109} y={160} color={BAD}>bounce ~2 ms</T>
      <T x={40} y={150} color={MUTED}>released</T>
      <T x={230} y={30} color={MUTED}>pressed</T>
    </Svg>
  );
}

function StackHeap() {
  return (
    <Svg label="Memory layout with stack growing down and heap growing up">
      <rect x={90} y={10} width={140} height={160} rx={6} fill={PANEL} stroke={INK} strokeWidth={2.5} />
      <rect x={90} y={10} width={140} height={40} fill="rgb(var(--brand-soft))" stroke={INK} strokeWidth={2} />
      <T x={160} y={34} color={INK}>stack ↓</T>
      <rect x={90} y={110} width={140} height={30} fill="rgb(var(--blue-soft))" stroke={INK} strokeWidth={2} />
      <T x={160} y={130} color={INK}>heap ↑</T>
      <rect x={90} y={140} width={140} height={30} fill={SUNK} stroke={INK} strokeWidth={2} />
      <T x={160} y={160} color={INK}>globals</T>
      <T x={160} y={84} color={MUTED}>free RAM</T>
    </Svg>
  );
}

function PointerDiagram() {
  return (
    <Svg label="Pointer p holds the address of variable speed">
      <rect x={30} y={60} width={100} height={50} rx={6} fill={PANEL} stroke={INK} strokeWidth={2.5} />
      <T x={80} y={52} color={INK}>p</T>
      <T x={80} y={90} color={BLUE}>0x2000</T>
      <rect x={190} y={60} width={100} height={50} rx={6} fill="rgb(var(--brand-soft))" stroke={INK} strokeWidth={2.5} />
      <T x={240} y={52} color={INK}>speed @ 0x2000</T>
      <T x={240} y={92} color={INK} size={16}>150</T>
      <path d="M130 85H186" stroke={BRAND} strokeWidth={3} markerEnd="url(#pp)" />
      <defs><marker id="pp" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill={BRAND} /></marker></defs>
    </Svg>
  );
}

function DiodeCurve() {
  let d = 'M40 150';
  for (let i = 0; i <= 100; i++) {
    const v = i / 100;
    const iC = v < 0.6 ? 0 : Math.min(1, ((v - 0.6) / 0.25) ** 2);
    d += ` L${40 + v * 250} ${150 - iC * 120}`;
  }
  return (
    <Svg label="Diode current versus voltage: almost no current until about 0.6 volts">
      <path d="M40 20V150H300" stroke={MUTED} strokeWidth={1.5} fill="none" />
      <path d={d} stroke={BRAND} strokeWidth={3} fill="none" />
      <path d={`M${40 + 0.65 * 250} 150V40`} stroke={BLUE} strokeWidth={1.5} strokeDasharray="4 4" />
      <T x={40 + 0.65 * 250} y={168} color={BLUE}>~0.6–0.7 V</T>
      <T x={30} y={30} anchor="end">I</T>
      <T x={300} y={168} anchor="end">V</T>
    </Svg>
  );
}

function SensorFusionDiagram() {
  const src = (y: number, t: string) => (
    <g>
      <rect x={20} y={y} width={90} height={30} rx={6} fill={PANEL} stroke={INK} strokeWidth={2} />
      <T x={65} y={y + 19} color={INK} size={10}>{t}</T>
      <path d={`M110 ${y + 15}L170 90`} stroke={BLUE} strokeWidth={2} />
    </g>
  );
  return (
    <Svg label="Encoders, IMU and GPS combined into one estimate by a filter">
      {src(20, 'encoders')}
      {src(75, 'IMU')}
      {src(130, 'GPS')}
      <rect x={170} y={66} width={70} height={48} rx={8} fill="rgb(var(--brand-soft))" stroke={INK} strokeWidth={2.5} />
      <T x={205} y={94} color={INK} size={10}>filter</T>
      <path d="M240 90H300" stroke={INK} strokeWidth={2.5} />
      <T x={270} y={82} color={INK} size={10}>pose</T>
    </Svg>
  );
}

function PinHeader() {
  return (
    <Svg label="Microcontroller board with pin headers">
      <rect x={60} y={20} width={200} height={140} rx={10} fill="rgb(var(--ok-soft))" stroke={INK} strokeWidth={2.5} />
      <rect x={130} y={64} width={60} height={52} rx={4} fill={INK} />
      <T x={160} y={94} color="#fff" size={10}>MCU</T>
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i}>
          <rect x={74 + i * 18} y={28} width={10} height={10} rx={2} fill={GOLD} stroke={INK} strokeWidth={1} />
          <rect x={74 + i * 18} y={142} width={10} height={10} rx={2} fill={GOLD} stroke={INK} strokeWidth={1} />
        </g>
      ))}
      <rect x={62} y={70} width={22} height={30} rx={3} fill={SUNK} stroke={INK} strokeWidth={1.5} />
      <T x={40} y={88} color={MUTED} size={9}>USB</T>
      <T x={160} y={16} color={MUTED} size={9}>GPIO · ADC · PWM · UART · I2C · SPI</T>
    </Svg>
  );
}

const MAP: Record<DiagramId, (props: { p: P }) => ReactNode> = {
  'ohm-triangle': OhmTriangle,
  divider: Divider,
  pull: Pull,
  pwm: PwmWave,
  waveforms: Waveforms,
  gate: Gate,
  binary: BinaryDiagram,
  'h-bridge': HBridge,
  'transistor-switch': TransistorSwitch,
  'dof-arm': DofArm,
  'robot-top': RobotTop,
  ultrasonic: UltrasonicDiagram,
  encoder: EncoderDiagram,
  'step-response': StepResponse,
  frames: Frames,
  'pcb-stack': PcbStack,
  'pcb-trace': PcbTrace,
  decoupling: Decoupling,
  'uart-frame': UartFrame,
  'i2c-bus': I2cBus,
  'spi-bus': SpiBus,
  cpu: CpuDiagram,
  'mem-hierarchy': MemHierarchy,
  breadboard: Breadboard,
  'cap-charge': CapCharge,
  gears: Gears,
  'servo-pulse': ServoPulse,
  'grid-path': GridPath,
  flipflop: FlipFlop,
  'feedback-loop': FeedbackLoop,
  adc: AdcDiagram,
  regulator: RegulatorDiagram,
  bounce: Bounce,
  'stack-heap': StackHeap,
  pointer: PointerDiagram,
  'diode-curve': DiodeCurve,
  'sensor-fusion': SensorFusionDiagram,
  'pin-header': PinHeader
};

export function Diagram({ id, props = {} }: { id: DiagramId; props?: P }) {
  const C = MAP[id];
  if (!C) return null;
  return <C p={props} />;
}
