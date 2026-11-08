import { useMemo, useRef, useState, type PointerEvent } from 'react';
import { useAnimationFrame } from '../../../hooks/useAnimationFrame';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { BAD, BLUE, BRAND, INK, LINE, MUTED, OK, PANEL, PlayControls, Readouts, RobotTopGlyph, Segmented, SimCanvas, Slider, Sparkline, SUNK, type SimProps } from './common';

type Pose = { x: number; y: number; th: number };
type Seg = [number, number, number, number];

/** Ray from (x,y) heading `a`; returns distance to the nearest segment (or max). */
function raycast(x: number, y: number, a: number, segs: Seg[], max = 400): number {
  const dx = Math.cos(a), dy = Math.sin(a);
  let best = max;
  for (const [x1, y1, x2, y2] of segs) {
    const ex = x2 - x1, ey = y2 - y1;
    const den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-9) continue;
    const t = ((x1 - x) * ey - (y1 - y) * ex) / den;
    const u = ((x1 - x) * dy - (y1 - y) * dx) / den;
    if (t > 0 && u >= 0 && u <= 1 && t < best) best = t;
  }
  return best;
}

/* ------------------------------------------------------------------ */
/*  Ultrasonic                                                          */
/* ------------------------------------------------------------------ */
export function UltrasonicSim({ compact }: SimProps) {
  const [cm, setCm] = useState(80);
  const reduced = useReducedMotion();
  const [t, setT] = useState(0);
  useAnimationFrame((dt) => setT((x) => (x + dt * 0.9) % 1), !reduced);
  const wallX = 70 + cm * 0.85;
  const travel = wallX - 66;
  const out = t < 0.5;
  const px = out ? 66 + travel * (t * 2) : wallX - travel * ((t - 0.5) * 2);
  const us = cm * 58;
  return (
    <div className="space-y-3">
      <SimCanvas label={`Ultrasonic sensor: object at ${cm} centimetres, echo ${us} microseconds`} h={170}>
        <rect x={10} y={60} width={54} height={50} rx={6} fill={PANEL} stroke={INK} strokeWidth={2.5} />
        <circle cx={26} cy={85} r={9} fill={SUNK} stroke={INK} strokeWidth={2} />
        <circle cx={48} cy={85} r={9} fill={SUNK} stroke={INK} strokeWidth={2} />
        <rect x={wallX} y={30} width={18} height={110} rx={3} fill="rgb(var(--blue-soft))" stroke={BLUE} strokeWidth={2.5} />
        {!reduced && (
          <g opacity={0.9}>
            {[0, 8, 16].map((o) => (
              <path key={o} d={`M${px - o * (out ? 1 : -1)} 68q${out ? 10 : -10} 17 0 34`} stroke={out ? BRAND : 'rgb(var(--ok))'} strokeWidth={2.5} fill="none" opacity={1 - o / 24} />
            ))}
          </g>
        )}
        <path d={`M66 130H${wallX - 2}`} stroke={MUTED} strokeWidth={1.5} strokeDasharray="4 3" />
        <text x={(66 + wallX) / 2} y={152} fontSize={11} textAnchor="middle" fill={INK} fontWeight={700}>{cm} cm</text>
        <text x={14} y={24} fontSize={10} fill={MUTED}>{out ? 'ping →' : '← echo'}</text>
      </SimCanvas>
      <Slider label="Object distance" value={cm} min={5} max={300} onChange={setCm} unit=" cm" />
      {!compact && <Readouts items={[['Echo time', `${us.toLocaleString()} µs`, 'brand'], ['Round trip', `${(cm * 2).toLocaleString()} cm`], ['Distance', `${cm} cm`, 'blue']]} />}
      {!compact && <p className="text-sm text-ink-2">distance (cm) = echo time (µs) ÷ 58 — sound covers about 0.0343 cm per µs and goes there <em>and back</em>.</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Differential drive arena                                            */
/* ------------------------------------------------------------------ */
const ARENA_W = 340, ARENA_H = 260;
const ARENA_WALLS: Seg[] = [
  [6, 6, ARENA_W - 6, 6], [ARENA_W - 6, 6, ARENA_W - 6, ARENA_H - 6], [ARENA_W - 6, ARENA_H - 6, 6, ARENA_H - 6], [6, ARENA_H - 6, 6, 6],
  [110, 6, 110, 150], [220, 110, 220, ARENA_H - 6]
];
const WAYPOINTS = [[60, 210], [165, 40], [290, 210]] as const;

function distToSeg(px: number, py: number, [x1, y1, x2, y2]: Seg): number {
  const dx = x2 - x1, dy = y2 - y1;
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

export function DiffDriveSim({ compact }: SimProps) {
  const start: Pose = { x: 50, y: 60, th: Math.PI / 2 };
  const [left, setLeft] = useState(40);
  const [right, setRight] = useState(40);
  const [running, setRunning] = useState(false);
  const [pose, setPose] = useState<Pose>(start);
  const [trail, setTrail] = useState<[number, number][]>([]);
  const [hit, setHit] = useState<boolean[]>([false, false, false]);
  const [crashed, setCrashed] = useState(false);
  const B = 26;
  useAnimationFrame((dt) => {
    setPose((p) => {
      const vl = left * 0.9, vr = right * 0.9;
      const v = (vl + vr) / 2;
      const w = (vr - vl) / B;
      const n: Pose = { x: p.x + v * Math.cos(p.th) * dt, y: p.y + v * Math.sin(p.th) * dt, th: p.th + w * dt };
      if (ARENA_WALLS.some((s) => distToSeg(n.x, n.y, s) < 13)) {
        setCrashed(true);
        setRunning(false);
        return p;
      }
      setTrail((t) => [...t.slice(-400), [n.x, n.y]]);
      setHit((h) => h.map((was, i) => was || Math.hypot(n.x - WAYPOINTS[i][0], n.y - WAYPOINTS[i][1]) < 18));
      return n;
    });
  }, running);
  const reset = () => {
    setPose(start);
    setTrail([]);
    setHit([false, false, false]);
    setCrashed(false);
    setRunning(false);
  };
  const done = hit.every(Boolean);
  const steer = (l: number, r: number) => {
    setLeft(l);
    setRight(r);
  };
  return (
    <div className="space-y-3">
      <SimCanvas label="Differential drive arena with three waypoints" h={ARENA_H} w={ARENA_W}>
        {ARENA_WALLS.map((s, i) => <line key={i} x1={s[0]} y1={s[1]} x2={s[2]} y2={s[3]} stroke={INK} strokeWidth={i < 4 ? 4 : 6} strokeLinecap="round" />)}
        {WAYPOINTS.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={14} fill={hit[i] ? 'rgb(var(--ok-soft))' : PANEL} stroke={hit[i] ? OK : BLUE} strokeWidth={2.5} strokeDasharray={hit[i] ? undefined : '4 3'} />
            <text x={x} y={y + 4} fontSize={11} textAnchor="middle" fill={hit[i] ? OK : BLUE} fontWeight={700}>{hit[i] ? '✓' : i + 1}</text>
          </g>
        ))}
        <path d={trail.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join('')} stroke={BRAND} strokeWidth={2} fill="none" opacity={0.6} />
        <g transform={`translate(${pose.x} ${pose.y}) rotate(${(pose.th * 180) / Math.PI})`}>
          <RobotTopGlyph color={crashed ? BAD : BRAND} />
        </g>
      </SimCanvas>
      {(crashed || done) && (
        <p role="status" className={`rounded-xl px-3 py-2 text-sm font-semibold ${done ? 'bg-ok-soft text-ok' : 'bg-bad-soft text-bad'}`}>
          {done ? 'All waypoints reached — nice driving!' : 'Bumped a wall. Reset and try a gentler turn.'}
        </p>
      )}
      <Slider label="Left wheel" value={left} min={-60} max={60} onChange={setLeft} />
      <Slider label="Right wheel" value={right} min={-60} max={60} onChange={setRight} />
      <div className="grid grid-cols-4 gap-2">
        {([['Straight', 40, 40], ['Left', 15, 45], ['Right', 45, 15], ['Spin', -30, 30]] as [string, number, number][]).map(([n, l, r]) => (
          <button key={n} onClick={() => steer(l, r)} className="press min-h-[40px] rounded-xl border-2 border-ink bg-panel text-sm font-bold shadow-[0_2px_0_rgb(var(--ink))]">{n}</button>
        ))}
      </div>
      <PlayControls running={running} onToggle={() => { if (crashed) return; setRunning((r) => !r); }} onReset={reset} />
      {!compact && <Readouts items={[['Linear v', `${(((left + right) / 2) * 0.9).toFixed(0)} px/s`], ['Turn rate', `${((((right - left) * 0.9) / B) * 57.3).toFixed(0)} °/s`, 'blue'], ['Waypoints', `${hit.filter(Boolean).length} / 3`, done ? 'ok' : 'brand']]} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Line following                                                      */
/* ------------------------------------------------------------------ */
function trackPoint(t: number): [number, number] {
  return [170 + 125 * Math.cos(t), 115 + 72 * Math.sin(t) + 16 * Math.sin(3 * t)];
}
const TRACK = Array.from({ length: 240 }, (_, i) => trackPoint((i / 240) * Math.PI * 2));
function distToTrack(x: number, y: number): number {
  let best = Infinity;
  for (let i = 0; i < TRACK.length; i++) {
    const a = TRACK[i], b = TRACK[(i + 1) % TRACK.length];
    best = Math.min(best, distToSeg(x, y, [a[0], a[1], b[0], b[1]]));
  }
  return best;
}

export function LineFollowSim({ compact }: SimProps) {
  const p0 = trackPoint(0);
  const start: Pose = { x: p0[0], y: p0[1] - 4, th: Math.PI / 2 };
  const [mode, setMode] = useState<'bang' | 'p'>('p');
  const [kp, setKp] = useState(3);
  const [speed, setSpeed] = useState(55);
  const [running, setRunning] = useState(false);
  const [pose, setPose] = useState<Pose>(start);
  const [errors, setErrors] = useState<number[]>([]);
  const [lost, setLost] = useState(false);
  const sense = (p: Pose) => {
    const off = 7, ahead = 14;
    const sx = p.x + ahead * Math.cos(p.th), sy = p.y + ahead * Math.sin(p.th);
    const lx = sx + off * Math.cos(p.th - Math.PI / 2), ly = sy + off * Math.sin(p.th - Math.PI / 2);
    const rx = sx + off * Math.cos(p.th + Math.PI / 2), ry = sy + off * Math.sin(p.th + Math.PI / 2);
    const val = (d: number) => Math.exp(-((d / 6) ** 2));
    return { l: val(distToTrack(lx, ly)), r: val(distToTrack(rx, ry)), lp: [lx, ly], rp: [rx, ry] };
  };
  useAnimationFrame((dt) => {
    setPose((p) => {
      const s = sense(p);
      let w: number;
      if (mode === 'bang') {
        const lOn = s.l > 0.5, rOn = s.r > 0.5;
        w = lOn && !rOn ? -2.6 : rOn && !lOn ? 2.6 : 0;
      } else {
        w = -kp * (s.l - s.r);
      }
      const n = { x: p.x + speed * Math.cos(p.th) * dt, y: p.y + speed * Math.sin(p.th) * dt, th: p.th + w * dt };
      const d = distToTrack(n.x, n.y);
      setErrors((e) => [...e.slice(-150), d]);
      if (d > 30) {
        setLost(true);
        setRunning(false);
        return p;
      }
      return n;
    });
  }, running);
  const s = sense(pose);
  const reset = () => {
    setPose(start);
    setErrors([]);
    setLost(false);
    setRunning(false);
  };
  const recent = errors.slice(-120);
  const meanErr = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : 0;
  const trackPath = TRACK.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join('') + 'Z';
  return (
    <div className="space-y-3">
      <SimCanvas label="Line-following robot on a closed track" h={230}>
        <rect x={0} y={0} width={340} height={230} fill={PANEL} opacity={0.6} />
        <path d={trackPath} stroke={INK} strokeWidth={12} fill="none" strokeLinejoin="round" />
        <g transform={`translate(${pose.x} ${pose.y}) rotate(${(pose.th * 180) / Math.PI})`}>
          <RobotTopGlyph color={lost ? BAD : BRAND} />
        </g>
        <circle cx={s.lp[0]} cy={s.lp[1]} r={3.5} fill={s.l > 0.5 ? BRAND : PANEL} stroke={BLUE} strokeWidth={1.5} />
        <circle cx={s.rp[0]} cy={s.rp[1]} r={3.5} fill={s.r > 0.5 ? BRAND : PANEL} stroke={BLUE} strokeWidth={1.5} />
      </SimCanvas>
      {lost && <p role="status" className="rounded-xl bg-bad-soft px-3 py-2 text-sm font-semibold text-bad">Lost the line! Lower the speed or adjust the gain, then reset.</p>}
      <Segmented label="Controller" value={mode} onChange={setMode} options={[['bang', 'Bang-bang'], ['p', 'Proportional']]} />
      {mode === 'p' && <Slider label="Gain Kp" value={kp} min={0.5} max={12} step={0.5} onChange={setKp} format={(v) => v.toFixed(1)} />}
      <Slider label="Speed" value={speed} min={20} max={110} onChange={setSpeed} unit=" px/s" />
      <PlayControls running={running} onToggle={() => { if (lost) reset(); setRunning((r) => !r); }} onReset={reset} />
      {!compact && (
        <>
          <div className="rounded-xl border border-line bg-panel px-3 py-2">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-3">Distance from line (lower is better)</p>
            <Sparkline values={recent.length ? recent : [0]} min={0} max={20} />
          </div>
          <Readouts items={[['Left sensor', s.l.toFixed(2), s.l > 0.5 ? 'brand' : undefined], ['Right sensor', s.r.toFixed(2), s.r > 0.5 ? 'brand' : undefined], ['Avg error', `${meanErr.toFixed(1)} px`, meanErr < 4 ? 'ok' : 'bad']]} />
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Wall following                                                      */
/* ------------------------------------------------------------------ */
const WALL: Seg[] = (() => {
  const pts: [number, number][] = [[-40, 190], [60, 190], [90, 170], [150, 170], [175, 200], [240, 200], [270, 180], [380, 180]];
  return pts.slice(0, -1).map((p, i) => [p[0], p[1], pts[i + 1][0], pts[i + 1][1]] as Seg);
})();

export function WallFollowSim({ compact }: SimProps) {
  const start: Pose = { x: 10, y: 120, th: 0 };
  const [kp, setKp] = useState(0.06);
  const [target, setTarget] = useState(50);
  const [running, setRunning] = useState(false);
  const [pose, setPose] = useState<Pose>(start);
  const [hist, setHist] = useState<number[]>([]);
  const [crashed, setCrashed] = useState(false);
  useAnimationFrame((dt) => {
    setPose((p) => {
      const d = raycast(p.x, p.y, p.th + Math.PI / 2, WALL, 200);
      const err = d - target; // positive = too far → steer toward wall (clockwise, +θ)
      const w = Math.max(-2.5, Math.min(2.5, kp * err * 10)) - 1.2 * Math.sin(p.th);
      let n: Pose = { x: p.x + 60 * Math.cos(p.th) * dt, y: p.y + 60 * Math.sin(p.th) * dt, th: p.th + w * dt };
      if (n.x > 350) n = { ...n, x: -10 };
      if (WALL.some((s) => distToSeg(n.x, n.y, s) < 10) || n.y < 8) {
        setCrashed(true);
        setRunning(false);
        return p;
      }
      setHist((h) => [...h.slice(-160), d]);
      return n;
    });
  }, running);
  const dNow = raycast(pose.x, pose.y, pose.th + Math.PI / 2, WALL, 200);
  const reset = () => {
    setPose(start);
    setHist([]);
    setCrashed(false);
    setRunning(false);
  };
  const hx = pose.x + dNow * Math.cos(pose.th + Math.PI / 2), hy = pose.y + dNow * Math.sin(pose.th + Math.PI / 2);
  return (
    <div className="space-y-3">
      <SimCanvas label={`Wall following: ${Math.round(dNow)} pixels from wall, target ${target}`} h={230}>
        {WALL.map((s, i) => <line key={i} x1={s[0]} y1={s[1]} x2={s[2]} y2={s[3]} stroke={INK} strokeWidth={6} strokeLinecap="round" />)}
        <path d={WALL.map((s, i) => `${i ? 'L' : 'M'}${s[0]} ${s[1] + 6}`).join('') + `L380 186L380 230L-40 230Z`} fill={LINE} opacity={0.6} />
        <line x1={pose.x} y1={pose.y} x2={hx} y2={hy} stroke={BLUE} strokeWidth={2} strokeDasharray="4 3" />
        <circle cx={hx} cy={hy} r={3} fill={BLUE} />
        <g transform={`translate(${pose.x} ${pose.y}) rotate(${(pose.th * 180) / Math.PI})`}>
          <RobotTopGlyph color={crashed ? BAD : BRAND} />
        </g>
        <text x={8} y={18} fontSize={10} fill={MUTED}>side distance sensor ↓</text>
      </SimCanvas>
      {crashed && <p role="status" className="rounded-xl bg-bad-soft px-3 py-2 text-sm font-semibold text-bad">Collision! The gain may be too high or the target too close. Reset to try again.</p>}
      <Slider label="Target distance" value={target} min={25} max={90} onChange={setTarget} unit=" px" />
      <Slider label="Gain Kp" value={kp} min={0.01} max={0.3} step={0.01} onChange={setKp} format={(v) => v.toFixed(2)} />
      <PlayControls running={running} onToggle={() => { if (crashed) reset(); setRunning((r) => !r); }} onReset={reset} />
      {!compact && (
        <div className="rounded-xl border border-line bg-panel px-3 py-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-3">Measured distance vs target</p>
          <Sparkline values={hist.length ? hist : [target]} min={0} max={120} target={target} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Coordinate frames                                                   */
/* ------------------------------------------------------------------ */
export function FramesSim({ compact }: SimProps) {
  const [rx, setRx] = useState(2);
  const [ry, setRy] = useState(1.5);
  const [deg, setDeg] = useState(30);
  const [pt, setPt] = useState<[number, number]>([4, 3]);
  const th = (deg * Math.PI) / 180;
  const dx = pt[0] - rx, dy = pt[1] - ry;
  const lx = Math.cos(th) * dx + Math.sin(th) * dy;
  const ly = -Math.sin(th) * dx + Math.cos(th) * dy;
  const S = 50, OX = 30, OY = 200; // metres → px, y up
  const X = (m: number) => OX + m * S;
  const Y = (m: number) => OY - m * S;
  const svgRef = useRef<SVGSVGElement>(null);
  const onTap = (e: PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const sx = ((e.clientX - r.left) / r.width) * 340;
    const sy = ((e.clientY - r.top) / r.height) * 220;
    setPt([Math.round(((sx - OX) / S) * 10) / 10, Math.round(((OY - sy) / S) * 10) / 10]);
  };
  return (
    <div className="space-y-3">
      <div className="bg-blueprint overflow-hidden rounded-2xl border border-line bg-panel">
        <svg ref={svgRef} viewBox="0 0 340 220" className="block h-auto w-full touch-none" role="img" aria-label="World frame, robot frame and a target point. Tap to move the point." onPointerDown={onTap} fontFamily="var(--font-mono)">
          {Array.from({ length: 7 }, (_, i) => <line key={`v${i}`} x1={X(i)} y1={Y(0)} x2={X(i)} y2={Y(3.8)} stroke={LINE} />)}
          {Array.from({ length: 4 }, (_, i) => <line key={`h${i}`} x1={X(0)} y1={Y(i)} x2={X(6.2)} y2={Y(i)} stroke={LINE} />)}
          <path d={`M${X(0)} ${Y(0)}H${X(6.2)}M${X(0)} ${Y(0)}V${Y(3.9)}`} stroke={INK} strokeWidth={2.5} />
          <text x={X(6.2)} y={Y(0) - 6} fontSize={11} fill={INK}>x</text>
          <text x={X(0) + 6} y={Y(3.8)} fontSize={11} fill={INK}>y</text>
          <g transform={`translate(${X(rx)} ${Y(ry)}) rotate(${-deg})`}>
            <line x1={0} y1={0} x2={44} y2={0} stroke={BRAND} strokeWidth={3} />
            <line x1={0} y1={0} x2={0} y2={-44} stroke={BLUE} strokeWidth={3} />
            <RobotTopGlyph />
          </g>
          <line x1={X(rx)} y1={Y(ry)} x2={X(pt[0])} y2={Y(pt[1])} stroke={MUTED} strokeDasharray="4 3" />
          <circle cx={X(pt[0])} cy={Y(pt[1])} r={7} fill={OK} stroke={INK} strokeWidth={2} />
          <text x={X(pt[0]) + 10} y={Y(pt[1]) - 8} fontSize={10} fill={INK}>P</text>
        </svg>
      </div>
      <p className="text-sm text-ink-2">Tap the grid to move point P. Orange = robot x (forward), blue = robot y (left).</p>
      <Slider label="Robot x" value={rx} min={0} max={6} step={0.1} onChange={setRx} unit=" m" format={(v) => v.toFixed(1)} />
      <Slider label="Robot y" value={ry} min={0} max={3.5} step={0.1} onChange={setRy} unit=" m" format={(v) => v.toFixed(1)} />
      <Slider label="Robot heading θ" value={deg} min={-180} max={180} onChange={setDeg} unit="°" />
      <Readouts items={[['P in world', `(${pt[0].toFixed(1)}, ${pt[1].toFixed(1)})`, 'blue'], ['P in robot', `(${lx.toFixed(2)}, ${ly.toFixed(2)})`, 'brand'], ['Bearing', `${((Math.atan2(ly, lx) * 180) / Math.PI).toFixed(0)}°`]]} />
      {!compact && <p className="text-sm text-ink-2">Robot frame: x_r = cosθ·Δx + sinθ·Δy, y_r = −sinθ·Δx + cosθ·Δy, where Δ = P − robot position.</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Odometry                                                            */
/* ------------------------------------------------------------------ */
export function OdometrySim({ compact }: SimProps) {
  const [slip, setSlip] = useState(4);
  const [wheelErr, setWheelErr] = useState(2);
  const [running, setRunning] = useState(false);
  const [seed, setSeed] = useState(1);
  const st = useRef({ truth: { x: 70, y: 195, th: 0 } as Pose, est: { x: 70, y: 195, th: 0 } as Pose, phase: 0, prog: 0, rand: 1 });
  const [frame, setFrame] = useState({ truth: [] as [number, number][], est: [] as [number, number][] });
  const rand = () => {
    const s = st.current;
    s.rand = (s.rand * 16807) % 2147483647;
    return (s.rand / 2147483647) * 2 - 1;
  };
  useAnimationFrame((dt) => {
    const s = st.current;
    // Square path: drive 180px, turn 90° left, repeat.
    const straight = s.phase % 2 === 0;
    const v = straight ? 70 : 0;
    const w = straight ? 0 : -1.4;
    const dTrue = v * dt, aTrue = w * dt;
    s.prog += straight ? dTrue : Math.abs(aTrue);
    if ((straight && s.prog >= 180) || (!straight && s.prog >= Math.PI / 2)) {
      s.phase++;
      s.prog = 0;
    }
    s.truth = { x: s.truth.x + dTrue * Math.cos(s.truth.th), y: s.truth.y + dTrue * Math.sin(s.truth.th), th: s.truth.th + aTrue };
    // Encoders "think" this happened: scale error + random slip
    const dEst = dTrue * (1 + wheelErr / 100) + dTrue * (slip / 100) * rand();
    const aEst = aTrue * (1 + wheelErr / 200) + Math.abs(aTrue) * (slip / 60) * rand();
    s.est = { x: s.est.x + dEst * Math.cos(s.est.th), y: s.est.y + dEst * Math.sin(s.est.th), th: s.est.th + aEst };
    setFrame((f) => ({ truth: [...f.truth.slice(-900), [s.truth.x, s.truth.y]], est: [...f.est.slice(-900), [s.est.x, s.est.y]] }));
  }, running);
  const reset = () => {
    st.current = { truth: { x: 70, y: 195, th: 0 }, est: { x: 70, y: 195, th: 0 }, phase: 0, prog: 0, rand: seed * 7919 + 1 };
    setSeed((x) => x + 1);
    setFrame({ truth: [], est: [] });
    setRunning(false);
  };
  const s = st.current;
  const err = Math.hypot(s.truth.x - s.est.x, s.truth.y - s.est.y);
  const path = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');
  const laps = useMemo(() => Math.floor(s.phase / 8), [s.phase]);
  return (
    <div className="space-y-3">
      <SimCanvas label={`Odometry: estimated pose is ${err.toFixed(0)} pixels from the true pose`} h={230}>
        <rect x={70} y={15} width={180} height={180} fill="none" stroke={LINE} strokeWidth={1.5} strokeDasharray="5 4" />
        <path d={path(frame.truth)} stroke={INK} strokeWidth={2.5} fill="none" />
        <path d={path(frame.est)} stroke={BRAND} strokeWidth={2.5} fill="none" strokeDasharray="6 3" />
        <g transform={`translate(${s.truth.x} ${s.truth.y}) rotate(${(s.truth.th * 180) / Math.PI})`}><RobotTopGlyph color={INK} /></g>
        <g transform={`translate(${s.est.x} ${s.est.y}) rotate(${(s.est.th * 180) / Math.PI})`} opacity={0.75}><RobotTopGlyph color={BRAND} /></g>
        <text x={8} y={224} fontSize={10} fill={INK}>— true path</text>
        <text x={100} y={224} fontSize={10} fill={BRAND}>- - odometry estimate</text>
      </SimCanvas>
      <Slider label="Wheel slip (random)" value={slip} min={0} max={20} onChange={setSlip} unit="%" />
      <Slider label="Wheel size error" value={wheelErr} min={-8} max={8} onChange={setWheelErr} unit="%" />
      <PlayControls running={running} onToggle={() => setRunning((r) => !r)} onReset={reset} />
      {!compact && <Readouts items={[['Position error', `${err.toFixed(0)} px`, err > 30 ? 'bad' : 'ok'], ['Heading error', `${(((s.est.th - s.truth.th) * 180) / Math.PI).toFixed(1)}°`, 'blue'], ['Laps', String(laps)]]} />}
    </div>
  );
}
