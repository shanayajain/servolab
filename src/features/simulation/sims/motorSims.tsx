import { useMemo, useRef, useState } from 'react';
import { useAnimationFrame } from '../../../hooks/useAnimationFrame';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { BLUE, BRAND, GOLD, INK, MUTED, PANEL, Readouts, SimCanvas, Slider, SUNK, Segmented, type SimProps } from './common';

/* ------------------------------------------------------------------ */
/*  PWM                                                                 */
/* ------------------------------------------------------------------ */
export function PwmSim({ compact }: SimProps) {
  const [duty, setDuty] = useState(40);
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState(0);
  const [angle, setAngle] = useState(0);
  useAnimationFrame((dt) => {
    setPhase((p) => (p + dt * 40) % 80);
    setAngle((a) => (a + dt * duty * 7) % 360);
  }, !reduced);
  const period = 80;
  let d = '';
  for (let i = -1; i < 4; i++) {
    const x0 = 20 + i * period - phase;
    const on = (period * duty) / 100;
    d += `${i === -1 ? 'M' : 'L'}${x0} 100 L${x0} ${duty > 0 ? 30 : 100} L${x0 + on} ${duty > 0 ? 30 : 100} L${x0 + on} 100 L${x0 + period} 100 `;
  }
  const avg = (5 * duty) / 100;
  return (
    <div className="space-y-3">
      <SimCanvas label={`PWM at ${duty} percent duty: average ${avg.toFixed(2)} volts`} h={200}>
        <clipPath id="pwmclip"><rect x={20} y={20} width={210} height={100} /></clipPath>
        <path d="M20 108H230" stroke={MUTED} strokeWidth={1} />
        <g clipPath="url(#pwmclip)"><path d={d} stroke={BRAND} strokeWidth={3} fill="none" strokeLinejoin="round" /></g>
        <path d={`M20 ${100 - (70 * duty) / 100}H230`} stroke={BLUE} strokeWidth={2} strokeDasharray="6 4" />
        <text x={22} y={132} fontSize={11} fill={BLUE}>average = {avg.toFixed(2)} V</text>
        {/* LED */}
        <circle cx={285} cy={52} r={26} fill={BRAND} opacity={(duty / 100) * 0.5} />
        <circle cx={285} cy={52} r={13} fill={duty > 0 ? BRAND : SUNK} opacity={0.25 + (duty / 100) * 0.75} stroke={INK} strokeWidth={2} />
        <text x={285} y={92} fontSize={10} textAnchor="middle" fill={MUTED}>LED</text>
        {/* Fan / motor */}
        <g transform={`translate(285 150) rotate(${angle})`}>
          {[0, 120, 240].map((a) => <path key={a} d="M0 0C6 -10 18 -18 26 -14C20 -6 8 0 0 0Z" fill={GOLD} stroke={INK} strokeWidth={1.5} transform={`rotate(${a})`} />)}
          <circle r={5} fill={INK} />
        </g>
        <text x={285} y={192} fontSize={10} textAnchor="middle" fill={MUTED}>motor</text>
      </SimCanvas>
      <Slider label="Duty cycle" value={duty} min={0} max={100} onChange={setDuty} unit="%" />
      {!compact && <Readouts items={[['Duty', `${duty}%`, 'brand'], ['Average V', `${avg.toFixed(2)} V`, 'blue'], ['analogWrite', `${Math.round((duty / 100) * 255)}`]]} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DC motor                                                            */
/* ------------------------------------------------------------------ */
export function DcMotorSim({ compact }: SimProps) {
  const [volts, setVolts] = useState(6);
  const [load, setLoad] = useState(10);
  const reduced = useReducedMotion();
  const noLoadRpm = Math.abs(volts) * 500; // rpm per volt
  const rpm = Math.max(0, noLoadRpm * (1 - load / 100));
  const stalled = volts !== 0 && rpm < 1;
  const current = volts === 0 ? 0 : 0.08 + (load / 100) * (Math.abs(volts) / 12) * 1.6;
  const dir = Math.sign(volts);
  const [angle, setAngle] = useState(0);
  useAnimationFrame((dt) => setAngle((a) => (a + dir * rpm * dt * 0.6) % 360), !reduced && rpm > 0);
  return (
    <div className="space-y-3">
      <SimCanvas label={`DC motor at ${volts} volts, ${Math.round(rpm)} RPM`} h={190}>
        <rect x={60} y={50} width={130} height={90} rx={14} fill={PANEL} stroke={INK} strokeWidth={3} />
        <rect x={60} y={60} width={14} height={70} fill={BLUE} opacity={0.3} />
        <rect x={176} y={60} width={14} height={70} fill={BRAND} opacity={0.3} />
        <text x={67} y={100} fontSize={12} fill={BLUE} textAnchor="middle" fontWeight={700}>N</text>
        <text x={183} y={100} fontSize={12} fill={BRAND} textAnchor="middle" fontWeight={700}>S</text>
        <g transform={`translate(125 95) rotate(${angle})`}>
          <rect x={-30} y={-6} width={60} height={12} rx={4} fill={GOLD} stroke={INK} strokeWidth={2} />
          <circle r={8} fill={INK} />
        </g>
        <path d="M190 95H250" stroke={INK} strokeWidth={6} />
        <g transform={`translate(270 95) rotate(${angle})`}>
          <circle r={22} fill={SUNK} stroke={INK} strokeWidth={3} />
          <path d="M0 -22V22M-22 0H22" stroke={INK} strokeWidth={2} />
        </g>
        <text x={125} y={30} fontSize={12} textAnchor="middle" fill={stalled ? 'rgb(var(--bad))' : INK} fontWeight={700}>
          {volts === 0 ? 'stopped' : stalled ? 'STALLED — max current!' : dir > 0 ? '↻ forward' : '↺ reverse'}
        </text>
        <text x={20} y={180} fontSize={10} fill={MUTED}>+</text>
        <text x={230} y={180} fontSize={10} fill={MUTED}>{volts.toFixed(1)} V across terminals</text>
      </SimCanvas>
      <Slider label="Applied voltage" value={volts} min={-12} max={12} step={0.5} onChange={setVolts} unit=" V" />
      <Slider label="Mechanical load" value={load} min={0} max={100} onChange={setLoad} unit="%" />
      {!compact && <Readouts items={[['Speed', `${Math.round(rpm)} RPM`, 'brand'], ['Current', `${current.toFixed(2)} A`, current > 1.2 ? 'bad' : 'blue'], ['Direction', volts === 0 ? '—' : dir > 0 ? 'Forward' : 'Reverse']]} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Encoder                                                             */
/* ------------------------------------------------------------------ */
export function EncoderSim({ compact }: SimProps) {
  const SLOTS = 20;
  const WHEEL_CM = 20.4;
  const [speed, setSpeed] = useState(30); // deg/s * 10
  const [angle, setAngle] = useState(0);
  const total = useRef(0);
  const [ticks, setTicks] = useState(0);
  const [hist, setHist] = useState<number[]>([]);
  const reduced = useReducedMotion();
  useAnimationFrame((dt) => {
    const dA = speed * 6 * dt * (reduced ? 0.3 : 1);
    total.current += dA;
    setAngle((a) => (a + dA) % 360);
    const t = Math.trunc((total.current / 360) * SLOTS);
    setTicks(t);
    const chA = Math.floor((total.current / 360) * SLOTS * 2) % 2;
    setHist((h) => [...h.slice(-90), chA]);
  }, true);
  const reset = () => {
    total.current = 0;
    setTicks(0);
    setAngle(0);
  };
  const dist = (ticks / SLOTS) * WHEEL_CM;
  const sigA = hist.map((v, i) => `${i ? 'L' : 'M'}${150 + i * 2} ${v ? 160 : 180}`).join('');
  const sigB = hist.map((_, i) => {
    const v = hist[Math.max(0, i - 3)] ?? 0;
    return `${i ? 'L' : 'M'}${150 + i * 2} ${v ? 190 : 210}`;
  }).join('');
  return (
    <div className="space-y-3">
      <SimCanvas label={`Encoder: ${ticks} ticks, ${dist.toFixed(1)} centimetres`} h={220}>
        <g transform={`translate(80 110) rotate(${angle})`}>
          <circle r={64} fill={PANEL} stroke={INK} strokeWidth={3} />
          {Array.from({ length: SLOTS }, (_, i) => (
            <rect key={i} x={-4} y={-58} width={8} height={14} rx={2} fill={SUNK} stroke={INK} strokeWidth={1.2} transform={`rotate(${(i * 360) / SLOTS})`} />
          ))}
          <circle r={9} fill={INK} />
        </g>
        <rect x={64} y={20} width={32} height={18} rx={3} fill="rgb(var(--blue-soft))" stroke={BLUE} strokeWidth={2} />
        <text x={150} y={40} fontSize={11} fill={INK}>ticks</text>
        <text x={150} y={72} fontSize={30} fill={BRAND} fontWeight={700}>{ticks}</text>
        <text x={150} y={102} fontSize={11} fill={MUTED}>{SLOTS} slots · wheel {WHEEL_CM} cm</text>
        <text x={150} y={150} fontSize={10} fill={MUTED}>channel A / B (quadrature)</text>
        <path d={sigA} stroke={BRAND} strokeWidth={2} fill="none" />
        <path d={sigB} stroke={BLUE} strokeWidth={2} fill="none" />
      </SimCanvas>
      <Slider label="Wheel speed" value={speed} min={-60} max={60} onChange={setSpeed} format={(v) => `${v > 0 ? '+' : ''}${v}`} />
      <div className="flex gap-2">
        <button onClick={reset} className="press min-h-[44px] flex-1 rounded-xl border-2 border-ink bg-panel font-bold shadow-[0_3px_0_rgb(var(--ink))]">Reset count</button>
      </div>
      {!compact && <Readouts items={[['Ticks', String(ticks), 'brand'], ['Revolutions', (ticks / SLOTS).toFixed(2)], ['Distance', `${dist.toFixed(1)} cm`, 'blue']]} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PID                                                                 */
/* ------------------------------------------------------------------ */
function simulatePid(kp: number, ki: number, kd: number, setpoint: number, disturbance: boolean) {
  const dt = 0.01, T = 6;
  let x = 0, v = 0, integ = 0, prevErr = setpoint;
  const out: number[] = [];
  const m = 1, c = 1.2, d = disturbance ? 1.2 : 0;
  for (let t = 0; t <= T; t += dt) {
    const err = setpoint - x;
    integ = Math.max(-20, Math.min(20, integ + err * dt));
    const der = (err - prevErr) / dt;
    prevErr = err;
    const u = Math.max(-12, Math.min(12, kp * err + ki * integ + kd * der));
    const a = (u - c * v - d * Math.sign(v || 1)) / m;
    v += a * dt;
    x += v * dt;
    out.push(x);
  }
  return out;
}

export function PidSim({ compact }: SimProps) {
  const [kp, setKp] = useState(4);
  const [ki, setKi] = useState(0);
  const [kd, setKd] = useState(0.4);
  const [load, setLoad] = useState<'none' | 'friction'>('friction');
  const setpoint = 1;
  const data = useMemo(() => simulatePid(kp, ki, kd, setpoint, load === 'friction'), [kp, ki, kd, load]);
  const sampled = data.filter((_, i) => i % 5 === 0);
  const peak = Math.max(...data);
  const overshoot = Math.max(0, (peak - setpoint) / setpoint) * 100;
  const final = data[data.length - 1];
  const sse = Math.abs(setpoint - final);
  let settle = -1;
  for (let i = data.length - 1; i >= 0; i--) {
    if (Math.abs(data[i] - setpoint) > 0.05) {
      settle = i === data.length - 1 ? -1 : (i + 1) * 0.01;
      break;
    }
    if (i === 0) settle = 0;
  }
  const verdict = sse > 0.05 ? 'Steady-state error — try adding Ki' : overshoot > 25 ? 'Big overshoot — add Kd or lower Kp' : settle < 0 ? 'Not settled — still oscillating' : settle > 3 ? 'Sluggish — raise Kp' : 'Nicely tuned!';
  const good = verdict === 'Nicely tuned!';
  const preset = (p: [number, number, number]) => {
    setKp(p[0]);
    setKi(p[1]);
    setKd(p[2]);
  };
  return (
    <div className="space-y-3">
      <SimCanvas label={`PID step response: overshoot ${overshoot.toFixed(0)} percent`} h={190}>
        <path d="M30 20V170H330" stroke={MUTED} strokeWidth={1.2} fill="none" />
        {[0.5, 1, 1.5].map((g) => (
          <g key={g}>
            <path d={`M30 ${170 - g * 90}H330`} stroke={g === 1 ? BLUE : 'rgb(var(--line))'} strokeWidth={g === 1 ? 2 : 1} strokeDasharray={g === 1 ? '6 4' : '2 4'} />
            <text x={26} y={174 - g * 90} fontSize={9} fill={MUTED} textAnchor="end">{g}</text>
          </g>
        ))}
        <path
          d={sampled.map((y, i) => `${i ? 'L' : 'M'}${30 + (i / (sampled.length - 1)) * 300} ${Math.max(4, Math.min(186, 170 - y * 90))}`).join('')}
          stroke={BRAND}
          strokeWidth={3}
          fill="none"
          strokeLinejoin="round"
        />
        <text x={330} y={14} fontSize={10} textAnchor="end" fill={BLUE}>setpoint</text>
        <text x={180} y={186} fontSize={10} textAnchor="middle" fill={MUTED}>time (6 s)</text>
      </SimCanvas>
      <p className={`rounded-xl px-3 py-2 text-sm font-semibold ${good ? 'bg-ok-soft text-ok' : 'bg-gold-soft text-ink'}`} role="status">{verdict}</p>
      <Slider label="Kp (proportional)" value={kp} min={0} max={20} step={0.1} onChange={setKp} format={(v) => v.toFixed(1)} />
      <Slider label="Ki (integral)" value={ki} min={0} max={10} step={0.1} onChange={setKi} format={(v) => v.toFixed(1)} />
      <Slider label="Kd (derivative)" value={kd} min={0} max={3} step={0.05} onChange={setKd} format={(v) => v.toFixed(2)} />
      <Segmented label="Load" value={load} onChange={setLoad} options={[['friction', 'With friction load'], ['none', 'No load']]} />
      {!compact && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {([['P only', [6, 0, 0]], ['PD', [6, 0, 1.2]], ['PID', [8, 6, 1.6]]] as [string, [number, number, number]][]).map(([n, p]) => (
              <button key={n} onClick={() => preset(p)} className="press min-h-[40px] rounded-xl border-2 border-ink bg-panel text-sm font-bold shadow-[0_2px_0_rgb(var(--ink))]">{n}</button>
            ))}
          </div>
          <Readouts items={[['Overshoot', `${overshoot.toFixed(0)}%`, overshoot > 25 ? 'bad' : 'ok'], ['Settling', settle < 0 ? '> 6 s' : `${settle.toFixed(2)} s`], ['SS error', sse.toFixed(3), sse > 0.05 ? 'bad' : 'ok']]} />
        </>
      )}
    </div>
  );
}
