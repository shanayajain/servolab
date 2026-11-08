import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { CircleAlert, CircleCheck, Info, Lightbulb, Play, RotateCcw, Square, TriangleAlert, Undo2 } from 'lucide-react';
import type { CircuitChallenge, CircuitPart } from '../../data/circuits';
import { checkGoals, COMPONENT_DEFS, evaluateCircuit, terminalPos, terminalRef, type CompResult } from './circuitEngine';
import { Button } from '../../components/ui';

const INK = 'rgb(var(--ink))';
const MUTED = 'rgb(var(--ink-3))';
const PANEL = 'rgb(var(--panel))';
const SUNK = 'rgb(var(--sunken))';
const BRAND = 'rgb(var(--brand))';
const BLUE = 'rgb(var(--blue))';
const OK = 'rgb(var(--ok))';
const BAD = 'rgb(var(--bad))';
const LED_COLORS = { red: '#E5383B', green: '#2BB673', amber: '#F2A900', blue: '#3A86FF' } as const;

type Wire = [string, string];

export function CircuitBoard({ challenge, onSolved }: { challenge: CircuitChallenge; onSolved?: () => void }) {
  const initialSwitches = useMemo(
    () => Object.fromEntries(challenge.components.filter((c) => c.kind === 'switch').map((c) => [c.id, !!c.props?.closed])),
    [challenge]
  );
  const [wires, setWires] = useState<Wire[]>(() => challenge.wires?.map((w) => [...w] as Wire) ?? []);
  const [history, setHistory] = useState<Wire[][]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [switches, setSwitches] = useState<Record<string, boolean>>(initialSwitches);
  const [hints, setHints] = useState(0);
  const [solved, setSolved] = useState(false);
  const solvedRef = useRef(false);

  const evalResult = useMemo(() => evaluateCircuit(challenge.components, wires, switches), [challenge, wires, switches]);
  const goal = useMemo(
    () => (challenge.sandbox ? { met: false, failed: [] } : checkGoals(challenge.components, wires, switches, challenge.goals)),
    [challenge, wires, switches]
  );

  useEffect(() => {
    if (running && goal.met && !solvedRef.current) {
      solvedRef.current = true;
      setSolved(true);
      onSolved?.();
    }
  }, [running, goal.met, onSolved]);

  const commit = (next: Wire[]) => {
    setHistory((h) => [...h.slice(-30), wires]);
    setWires(next);
  };

  const tapTerminal = (ref: string) => {
    if (!selected) return setSelected(ref);
    if (selected === ref) return setSelected(null);
    const exists = wires.some(([a, b]) => (a === selected && b === ref) || (a === ref && b === selected));
    if (!exists) commit([...wires, [selected, ref]]);
    setSelected(null);
  };

  const removeWire = (i: number) => commit(wires.filter((_, j) => j !== i));
  const undo = () => {
    const prev = history[history.length - 1];
    if (!prev) return;
    setHistory((h) => h.slice(0, -1));
    setWires(prev);
  };
  const reset = () => {
    commit(challenge.wires?.map((w) => [...w] as Wire) ?? []);
    setSwitches(initialSwitches);
    setSelected(null);
    setRunning(false);
  };

  const partById = (id: string) => challenge.components.find((c) => c.id === id);
  const posOf = (ref: string) => {
    const [cid, t] = splitRef(ref);
    const p = partById(cid);
    return p ? terminalPos(p, t) : { x: 0, y: 0, dir: [0, 0] as [number, number] };
  };
  const wireColor = (ref: string) => {
    const n = evalResult.netOf(ref);
    if (n === evalResult.powerNet) return '#D9412B';
    if (n === evalResult.groundNet) return INK;
    return BLUE;
  };
  const results = running ? evalResult.results : {};
  const diagnostics = running ? evalResult.diagnostics : [];
  const hasErrors = diagnostics.some((d) => d.level === 'error');

  return (
    <div className="space-y-3">
      <div className="bg-dotgrid overflow-hidden rounded-2xl border-2 border-ink bg-panel">
        <svg viewBox={`0 0 360 ${challenge.height}`} className="block h-auto w-full touch-manipulation select-none" role="group" aria-label={`Circuit board: ${challenge.title}`} fontFamily="var(--font-mono)">
          {/* Wires */}
          {wires.map(([a, b], i) => {
            const A = posOf(a), B = posOf(b);
            const k = 36;
            const d = `M${A.x} ${A.y} C${A.x + A.dir[0] * k} ${A.y + A.dir[1] * k} ${B.x + B.dir[0] * k} ${B.y + B.dir[1] * k} ${B.x} ${B.y}`;
            return (
              <g key={`${a}-${b}-${i}`}>
                <path d={d} stroke="rgb(var(--panel))" strokeWidth={7} fill="none" strokeLinecap="round" />
                <path d={d} stroke={wireColor(a)} strokeWidth={3.5} fill="none" strokeLinecap="round" />
                <path
                  d={d}
                  stroke="transparent"
                  strokeWidth={16}
                  fill="none"
                  role="button"
                  tabIndex={0}
                  aria-label={`Wire from ${describeRef(a, partById)} to ${describeRef(b, partById)}. Activate to delete.`}
                  onClick={() => removeWire(i)}
                  onKeyDown={(e) => activateKey(e, () => removeWire(i))}
                  className="cursor-pointer"
                />
              </g>
            );
          })}
          {/* Components */}
          {challenge.components.map((p) => (
            <g key={p.id} transform={`translate(${p.x} ${p.y})`}>
              <PartArt part={p} result={results[p.id]} running={running} closed={switches[p.id]} onToggle={() => setSwitches((s) => ({ ...s, [p.id]: !s[p.id] }))} />
            </g>
          ))}
          {/* Terminals (on top) */}
          {challenge.components.map((p) =>
            COMPONENT_DEFS[p.kind].terminals.map((t) => {
              const ref = terminalRef(p.id, t.id);
              const pos = terminalPos(p, t.id);
              const sel = selected === ref;
              const connected = wires.some(([a, b]) => a === ref || b === ref);
              return (
                <g key={ref}>
                  {sel && <circle cx={pos.x} cy={pos.y} r={13} fill={BRAND} opacity={0.3} className="anim-glow" />}
                  <circle cx={pos.x} cy={pos.y} r={6.5} fill={sel ? BRAND : connected ? wireColor(ref) : PANEL} stroke={INK} strokeWidth={2.2} />
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={17}
                    fill="transparent"
                    role="button"
                    tabIndex={0}
                    aria-pressed={sel}
                    aria-label={`${describeRef(ref, partById)}${sel ? ', selected' : ''}`}
                    onClick={() => tapTerminal(ref)}
                    onKeyDown={(e) => activateKey(e, () => tapTerminal(ref))}
                    className="cursor-pointer outline-none"
                  />
                </g>
              );
            })
          )}
        </svg>
      </div>

      <p className="min-h-[20px] text-center text-sm text-ink-3" aria-live="polite">
        {selected ? `Selected ${describeRef(selected, partById)} — now tap another terminal.` : 'Tap a terminal, then another to wire them. Tap a wire to remove it.'}
      </p>

      <div className="grid grid-cols-[1fr_auto_auto] gap-2">
        <Button variant={running ? 'secondary' : 'primary'} onClick={() => setRunning((r) => !r)} icon={running ? <Square size={18} /> : <Play size={18} />}>
          {running ? 'Stop' : 'Run circuit'}
        </Button>
        <Button variant="secondary" onClick={undo} disabled={!history.length} aria-label="Undo" icon={<Undo2 size={18} />} />
        <Button variant="secondary" onClick={reset} aria-label="Reset wiring" icon={<RotateCcw size={18} />} />
      </div>

      {running && (
        <div className="anim-rise space-y-2" role="status" aria-live="polite">
          {solved && (
            <Diag tone="ok" icon={<CircleCheck size={18} />}>
              Goal complete! {challenge.goalText}
            </Diag>
          )}
          {diagnostics.map((d, i) => (
            <Diag key={i} tone={d.level} icon={d.level === 'error' ? <CircleAlert size={18} /> : d.level === 'warn' ? <TriangleAlert size={18} /> : <Info size={18} />}>
              {d.text}
            </Diag>
          ))}
          {!solved && !challenge.sandbox && !hasErrors && goal.failed.length > 0 && diagnostics.length === 0 && (
            <Diag tone="info" icon={<Info size={18} />}>Running — but the goal isn’t met yet. {challenge.goalText}</Diag>
          )}
          {!solved && !challenge.sandbox && !hasErrors && diagnostics.length > 0 && goal.failed.length > 0 && (
            <Diag tone="info" icon={<Info size={18} />}>Goal not met yet: {challenge.goalText}</Diag>
          )}
        </div>
      )}

      {challenge.hints.length > 0 && (
        <div className="rounded-2xl border border-line bg-panel p-3">
          {hints > 0 && (
            <ol className="mb-2 list-decimal space-y-1 pl-5 text-sm text-ink-2">
              {challenge.hints.slice(0, hints).map((h) => <li key={h}>{h}</li>)}
            </ol>
          )}
          {hints < challenge.hints.length && (
            <button onClick={() => setHints((h) => h + 1)} className="press flex min-h-[40px] items-center gap-2 text-sm font-bold text-blue">
              <Lightbulb size={18} /> {hints === 0 ? 'Show a hint' : 'Another hint'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Diag({ tone, icon, children }: { tone: 'ok' | 'error' | 'warn' | 'info'; icon: ReactNode; children: ReactNode }) {
  const cls = { ok: 'bg-ok-soft text-ok', error: 'bg-bad-soft text-bad', warn: 'bg-gold-soft text-ink', info: 'bg-blue-soft text-ink' }[tone];
  const label = { ok: 'Success', error: 'Error', warn: 'Warning', info: 'Note' }[tone];
  return (
    <div className={`flex gap-2 rounded-xl px-3 py-2.5 text-sm font-medium leading-snug ${cls}`}>
      <span className="mt-0.5 shrink-0" aria-hidden>{icon}</span>
      <span><span className="sr-only">{label}: </span>{children}</span>
    </div>
  );
}

function splitRef(ref: string): [string, string] {
  const i = ref.indexOf('.');
  return [ref.slice(0, i), ref.slice(i + 1)];
}

function describeRef(ref: string, get: (id: string) => CircuitPart | undefined): string {
  const [cid, t] = splitRef(ref);
  const p = get(cid);
  if (!p) return ref;
  const def = COMPONENT_DEFS[p.kind];
  const term = def.terminals.find((x) => x.id === t);
  const names: Record<string, string> = { '+': 'plus', '-': 'minus', A: 'anode', K: 'cathode', a: 'end A', b: 'end B' };
  return `${def.title} ${p.id} ${names[t] ?? term?.label ?? t}`;
}

function activateKey(e: KeyboardEvent, fn: () => void) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fn();
  }
}

/* ------------------------------------------------------------------ */
/*  Component artwork                                                   */
/* ------------------------------------------------------------------ */
function PartArt({ part, result, running, closed, onToggle }: { part: CircuitPart; result?: CompResult; running: boolean; closed?: boolean; onToggle: () => void }) {
  const def = COMPONENT_DEFS[part.kind];
  const st = result?.state ?? 'idle';
  const err = st === 'error' || st === 'burnt';
  const frame = (fill = PANEL) => <rect x={0} y={0} width={def.w} height={def.h} rx={10} fill={fill} stroke={err ? BAD : INK} strokeWidth={2.5} />;
  const label = (text: string, y = def.h + 14) => <text x={def.w / 2} y={y} fontSize={10} textAnchor="middle" fill={MUTED} fontWeight={600}>{text}</text>;
  const tlabel = (id: string, dx: number, dy: number) => {
    const t = def.terminals.find((x) => x.id === id)!;
    return <text x={t.x + dx} y={t.y + dy} fontSize={9} textAnchor="middle" fill={INK} fontWeight={700}>{t.label}</text>;
  };

  switch (part.kind) {
    case 'battery': {
      const v = part.props?.volts ?? 9;
      return (
        <g>
          <rect x={10} y={6} width={44} height={84} rx={7} fill="#2B2F33" stroke={INK} strokeWidth={2.5} />
          <rect x={10} y={6} width={44} height={22} rx={7} fill={BRAND} />
          <rect x={10} y={20} width={44} height={8} fill={BRAND} />
          <text x={32} y={22} fontSize={14} textAnchor="middle" fill="#1C1F22" fontWeight={800}>+</text>
          <text x={32} y={62} fontSize={13} textAnchor="middle" fill="#F6F2EA" fontWeight={700}>{v} V</text>
          <text x={32} y={84} fontSize={14} textAnchor="middle" fill="#F6F2EA" fontWeight={800}>−</text>
        </g>
      );
    }
    case 'resistor': {
      const ohms = part.props?.ohms ?? 330;
      return (
        <g>
          <path d="M0 18H18M70 18H88" stroke={INK} strokeWidth={2.5} />
          <rect x={16} y={8} width={56} height={20} rx={9} fill="#E9D8B4" stroke={INK} strokeWidth={2.2} />
          {bandColors(ohms).map((c, i) => <rect key={i} x={26 + i * 10} y={8} width={5} height={20} fill={c} />)}
          <rect x={60} y={8} width={4} height={20} fill="#C9A227" />
          {label(ohms >= 1000 ? `${ohms / 1000} kΩ` : `${ohms} Ω`, 44)}
        </g>
      );
    }
    case 'led': {
      const color = LED_COLORS[part.props?.color ?? 'red'];
      const lit = st === 'lit' || st === 'dim';
      return (
        <g>
          {lit && <circle cx={30} cy={20} r={st === 'dim' ? 18 : 28} fill={color} opacity={0.35} className="anim-glow" />}
          <path d="M14 40V24a16 16 0 0 1 32 0V40Z" fill={st === 'burnt' ? '#6B6B6B' : lit ? color : `${color}55`} stroke={st === 'burnt' ? BAD : INK} strokeWidth={2.5} />
          <rect x={10} y={38} width={40} height={6} rx={2} fill={SUNK} stroke={INK} strokeWidth={2} />
          <path d="M0 46H22V44M60 46H38V44" stroke={INK} strokeWidth={2.5} fill="none" />
          {st === 'burnt' && <path d="M22 12l16 16M38 12L22 28" stroke={BAD} strokeWidth={3} />}
          {tlabel('A', 0, -10)}
          {tlabel('K', 0, -10)}
          {label(st === 'burnt' ? 'BURNT' : 'LED', 62)}
        </g>
      );
    }
    case 'switch': {
      const on = !!closed;
      return (
        <g role="button" tabIndex={0} aria-label={`Switch ${part.id}, ${on ? 'closed' : 'open'}. Activate to toggle.`} aria-pressed={on} onClick={onToggle} onKeyDown={(e) => activateKey(e, onToggle)} className="cursor-pointer">
          <rect x={0} y={0} width={def.w} height={def.h} rx={10} fill={PANEL} stroke={INK} strokeWidth={2.5} />
          <circle cx={20} cy={30} r={4} fill={INK} />
          <circle cx={64} cy={30} r={4} fill={INK} />
          <path d={on ? 'M20 30L64 30' : 'M20 30L58 10'} stroke={on ? BRAND : INK} strokeWidth={4} strokeLinecap="round" />
          <path d="M0 30H16M68 30H84" stroke={INK} strokeWidth={2.5} />
          <text x={42} y={def.h + 14} fontSize={10} textAnchor="middle" fill={on ? BRAND : MUTED} fontWeight={700}>{on ? 'CLOSED' : 'OPEN'} · tap</text>
        </g>
      );
    }
    case 'motor': {
      const spin = st === 'spinning' || st === 'reverse';
      return (
        <g>
          {frame()}
          <circle cx={36} cy={36} r={24} fill={SUNK} stroke={INK} strokeWidth={2.5} />
          <g className={`svg-center ${spin ? (st === 'reverse' ? 'anim-spin-rev' : 'anim-spin') : ''}`}>
            <path d="M36 16V56M16 36H56" stroke={st === 'error' ? BAD : BRAND} strokeWidth={5} strokeLinecap="round" />
            <circle cx={36} cy={36} r={6} fill={INK} />
          </g>
          {tlabel('1', 10, -12)}
          {tlabel('2', -10, -12)}
          {label(spin ? (st === 'reverse' ? 'MOTOR ↺' : 'MOTOR ↻') : 'MOTOR')}
        </g>
      );
    }
    case 'driver':
      return (
        <g>
          {frame('#2B2F33')}
          <rect x={30} y={30} width={48} height={40} rx={4} fill="#1C1F22" stroke="#555" />
          <text x={54} y={54} fontSize={9} textAnchor="middle" fill="#F6F2EA" fontWeight={700}>DRIVER</text>
          {st === 'powered' && <circle cx={92} cy={12} r={4} fill="#2BB673" />}
          {(['VM', 'IN', 'GND', 'OA', 'OB'] as const).map((id) => {
            const t = def.terminals.find((x) => x.id === id)!;
            const dx = t.x === 0 ? 16 : t.x === def.w ? -16 : 0;
            const dy = t.y === 0 ? 18 : t.y === def.h ? -10 : 4;
            return <text key={id} x={t.x + dx} y={t.y + dy} fontSize={9} textAnchor="middle" fill="#F6F2EA" fontWeight={700}>{t.label}</text>;
          })}
        </g>
      );
    case 'mcu':
      return (
        <g>
          {frame('#1F6F52')}
          <rect x={34} y={44} width={48} height={48} rx={4} fill="#1C1F22" />
          <text x={58} y={72} fontSize={9} textAnchor="middle" fill="#F6F2EA" fontWeight={700}>MCU</text>
          <circle cx={58} cy={118} r={5} fill={st === 'powered' ? '#2BB673' : st === 'error' ? '#E5383B' : '#0B3B2B'} stroke="#0B3B2B" />
          <text x={58} y={138} fontSize={8} textAnchor="middle" fill="#CDEBDD">{st === 'powered' ? 'POWER ON' : st === 'error' ? 'FAULT' : 'OFF'}</text>
          {def.terminals.map((t) => (
            <text key={t.id} x={t.x === 0 ? 16 : t.x - 16} y={t.y + 4} fontSize={9} textAnchor="middle" fill="#F6F2EA" fontWeight={700}>{t.label}</text>
          ))}
        </g>
      );
    case 'servo':
      return (
        <g>
          {frame('#2C5D9E')}
          <circle cx={66} cy={22} r={10} fill={PANEL} stroke={INK} strokeWidth={2} />
          <g className={`svg-center ${st === 'sweeping' ? 'anim-sweep' : ''}`} style={{ transformOrigin: '50% 93%' }}>
            <rect x={62} y={-6} width={8} height={30} rx={4} fill="#F6F2EA" stroke={INK} strokeWidth={2} />
          </g>
          <text x={58} y={56} fontSize={9} textAnchor="middle" fill="#F6F2EA" fontWeight={700}>SERVO</text>
          {def.terminals.map((t) => <text key={t.id} x={t.x + 16} y={t.y + 3} fontSize={8} textAnchor="middle" fill="#F6F2EA" fontWeight={700}>{t.label}</text>)}
          {label(st === 'sweeping' ? 'sweeping' : st === 'holding' ? 'holding' : '')}
        </g>
      );
    case 'ultrasonic':
      return (
        <g>
          {frame('#2C5D9E')}
          {[34, 90].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy={28} r={18} fill="#C9CED6" stroke={INK} strokeWidth={2} />
              <circle cx={cx} cy={28} r={8} fill="#5C6670" />
            </g>
          ))}
          {st === 'pinging' && (
            <g>
              <path d="M34 -4a26 20 0 0 1 56 0" stroke={BRAND} strokeWidth={2.5} fill="none" className="svg-center anim-ping" />
              <path d="M34 -4a26 20 0 0 1 56 0" stroke={BRAND} strokeWidth={2.5} fill="none" className="svg-center anim-ping-d" />
            </g>
          )}
          {def.terminals.map((t) => <text key={t.id} x={t.x} y={t.y - 8} fontSize={8} textAnchor="middle" fill="#F6F2EA" fontWeight={700}>{t.label}</text>)}
          {st === 'pinging' && label('42 cm · pinging', -8)}
        </g>
      );
    case 'ir':
      return (
        <g>
          {frame('#2B2F33')}
          <circle cx={30} cy={22} r={9} fill={st === 'sensing' ? '#B15DFF' : '#3a3a3a'} stroke="#999" strokeWidth={1.5} className={st === 'sensing' ? 'anim-glow' : ''} />
          <circle cx={60} cy={22} r={9} fill="#111" stroke="#999" strokeWidth={1.5} />
          {st === 'sensing' && <circle cx={78} cy={12} r={4} fill="#2BB673" />}
          {def.terminals.map((t) => <text key={t.id} x={t.x} y={t.y - 8} fontSize={8} textAnchor="middle" fill="#F6F2EA" fontWeight={700}>{t.label}</text>)}
          {st === 'sensing' && label('line detected', -8)}
        </g>
      );
    default:
      return (
        <g>
          {frame()}
          {running && <text x={def.w / 2} y={def.h / 2} fill={OK}>•</text>}
        </g>
      );
  }
}

function bandColors(ohms: number): string[] {
  const C = ['#111', '#7B4B2A', '#D62828', '#F77F00', '#FCBF49', '#2A9D8F', '#1D4ED8', '#7C3AED', '#8D99AE', '#F8F9FA'];
  const s = String(Math.round(ohms));
  const d1 = Number(s[0] ?? 0), d2 = Number(s[1] ?? 0);
  const mult = Math.max(0, s.length - 2);
  return [C[d1], C[d2], C[mult] ?? C[0]];
}
