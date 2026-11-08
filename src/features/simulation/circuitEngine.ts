/**
 * Educational circuit engine.
 *
 * Not SPICE: it finds electrical nets (union-find), walks simple conduction paths from
 * sources to ground through passive two-terminal parts (Ohm's law per path), and applies
 * rule-based checks for "smart" modules (MCU, motor driver, servo, sensors).
 *
 * To add a component: add a CompDef in COMPONENT_DEFS, then either give it a `passive`
 * model (two-terminal conduction) or add a module rule in `evaluateModules`.
 */
import type { CircuitKind, CircuitPart, GoalCondition } from '../../data/circuits';

export interface TermDef {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface CompDef {
  kind: CircuitKind;
  title: string;
  w: number;
  h: number;
  terminals: TermDef[];
}

export const COMPONENT_DEFS: Record<CircuitKind, CompDef> = {
  battery: { kind: 'battery', title: 'Battery', w: 64, h: 96, terminals: [{ id: '+', label: '+', x: 32, y: 0 }, { id: '-', label: '−', x: 32, y: 96 }] },
  resistor: { kind: 'resistor', title: 'Resistor', w: 88, h: 36, terminals: [{ id: 'a', label: '', x: 0, y: 18 }, { id: 'b', label: '', x: 88, y: 18 }] },
  led: { kind: 'led', title: 'LED', w: 60, h: 66, terminals: [{ id: 'A', label: 'A', x: 0, y: 46 }, { id: 'K', label: 'K', x: 60, y: 46 }] },
  switch: { kind: 'switch', title: 'Switch', w: 84, h: 44, terminals: [{ id: 'a', label: '', x: 0, y: 30 }, { id: 'b', label: '', x: 84, y: 30 }] },
  motor: { kind: 'motor', title: 'DC motor', w: 72, h: 72, terminals: [{ id: '1', label: '1', x: 0, y: 36 }, { id: '2', label: '2', x: 72, y: 36 }] },
  driver: {
    kind: 'driver',
    title: 'Motor driver',
    w: 108,
    h: 100,
    terminals: [
      { id: 'VM', label: 'VM', x: 54, y: 0 },
      { id: 'IN', label: 'IN', x: 0, y: 50 },
      { id: 'GND', label: 'GND', x: 54, y: 100 },
      { id: 'OA', label: 'OA', x: 108, y: 30 },
      { id: 'OB', label: 'OB', x: 108, y: 70 }
    ]
  },
  mcu: {
    kind: 'mcu',
    title: 'Microcontroller',
    w: 116,
    h: 150,
    terminals: [
      { id: 'VIN', label: 'VIN', x: 0, y: 30 },
      { id: 'GND', label: 'GND', x: 0, y: 75 },
      { id: '5V', label: '5V', x: 0, y: 120 },
      { id: 'D2', label: 'D2', x: 116, y: 24 },
      { id: 'D3', label: 'D3', x: 116, y: 58 },
      { id: 'D4', label: 'D4', x: 116, y: 92 },
      { id: 'D5', label: 'D5', x: 116, y: 126 }
    ]
  },
  servo: {
    kind: 'servo',
    title: 'Servo',
    w: 96,
    h: 70,
    terminals: [
      { id: 'V+', label: 'V+', x: 0, y: 18 },
      { id: 'GND', label: 'GND', x: 0, y: 38 },
      { id: 'SIG', label: 'SIG', x: 0, y: 58 }
    ]
  },
  ultrasonic: {
    kind: 'ultrasonic',
    title: 'Ultrasonic',
    w: 124,
    h: 64,
    terminals: [
      { id: 'VCC', label: 'VCC', x: 16, y: 64 },
      { id: 'TRIG', label: 'TRIG', x: 46, y: 64 },
      { id: 'ECHO', label: 'ECHO', x: 78, y: 64 },
      { id: 'GND', label: 'GND', x: 108, y: 64 }
    ]
  },
  ir: {
    kind: 'ir',
    title: 'IR sensor',
    w: 92,
    h: 64,
    terminals: [
      { id: 'VCC', label: 'VCC', x: 16, y: 64 },
      { id: 'GND', label: 'GND', x: 46, y: 64 },
      { id: 'OUT', label: 'OUT', x: 76, y: 64 }
    ]
  }
};

export type CompState = 'idle' | 'lit' | 'dim' | 'burnt' | 'spinning' | 'reverse' | 'sweeping' | 'holding' | 'pinging' | 'sensing' | 'powered' | 'error';

export interface CompResult {
  state: CompState;
  controlled?: boolean;
  currentMa?: number;
}

export interface Diagnostic {
  level: 'error' | 'warn' | 'info' | 'ok';
  text: string;
}

export interface EvalResult {
  results: Record<string, CompResult>;
  diagnostics: Diagnostic[];
  netOf: (ref: string) => string;
  powerNet: string | null;
  groundNet: string | null;
}

const LED_VF = { red: 2.0, amber: 2.1, green: 2.2, blue: 3.0 } as const;
const LED_MAX_MA = 30;
const PIN_MAX_MA = 40;
const MOTOR_OHMS = 6;

export const terminalRef = (compId: string, term: string) => `${compId}.${term}`;

export function terminalPos(part: CircuitPart, termId: string): { x: number; y: number; dir: [number, number] } {
  const def = COMPONENT_DEFS[part.kind];
  const t = def.terminals.find((x) => x.id === termId) ?? def.terminals[0];
  const dir: [number, number] = t.x === 0 ? [-1, 0] : t.x === def.w ? [1, 0] : t.y === 0 ? [0, -1] : [0, 1];
  return { x: part.x + t.x, y: part.y + t.y, dir };
}

/* ------------------------------------------------------------------ */
/*  Nets                                                                */
/* ------------------------------------------------------------------ */
function buildNets(parts: CircuitPart[], wires: [string, string][]) {
  const parent = new Map<string, string>();
  const find = (x: string): string => {
    if (!parent.has(x)) parent.set(x, x);
    let r = x;
    while (parent.get(r) !== r) r = parent.get(r)!;
    let c = x;
    while (parent.get(c) !== r) {
      const n = parent.get(c)!;
      parent.set(c, r);
      c = n;
    }
    return r;
  };
  for (const p of parts) for (const t of COMPONENT_DEFS[p.kind].terminals) find(terminalRef(p.id, t.id));
  for (const [a, b] of wires) {
    const ra = find(a), rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  }
  const degree = new Map<string, number>();
  for (const [a, b] of wires) {
    degree.set(a, (degree.get(a) ?? 0) + 1);
    degree.set(b, (degree.get(b) ?? 0) + 1);
  }
  return { find, wired: (ref: string) => (degree.get(ref) ?? 0) > 0 };
}

/* ------------------------------------------------------------------ */
/*  Evaluation                                                          */
/* ------------------------------------------------------------------ */
interface Edge {
  id: string; // component id
  kind: 'resistor' | 'led' | 'switch' | 'motor';
  from: string; // net
  to: string; // net
  ohms: number;
  vf: number;
  directional: boolean; // only from → to
}

export function evaluateCircuit(parts: CircuitPart[], wires: [string, string][], switches: Record<string, boolean>): EvalResult {
  const { find, wired } = buildNets(parts, wires);
  const N = (id: string, t: string) => find(terminalRef(id, t));
  const results: Record<string, CompResult> = {};
  const diagnostics: Diagnostic[] = [];
  const err = (text: string) => diagnostics.push({ level: 'error', text });
  const warn = (text: string) => diagnostics.push({ level: 'warn', text });
  const info = (text: string) => diagnostics.push({ level: 'info', text });
  parts.forEach((p) => (results[p.id] = { state: 'idle' }));

  const battery = parts.find((p) => p.kind === 'battery');
  if (!battery) return { results, diagnostics: [{ level: 'error', text: 'There is no battery in this circuit.' }], netOf: find, powerNet: null, groundNet: null };
  const V = battery.props?.volts ?? 9;
  const P = N(battery.id, '+');
  const G = N(battery.id, '-');
  if (!wires.length) {
    info('Nothing is wired yet. Tap one terminal, then another, to connect them with a wire.');
    return { results, diagnostics, netOf: find, powerNet: P, groundNet: G };
  }
  if (P === G) {
    err('Short circuit! Battery + is connected straight to −. A real battery would get very hot.');
    return { results: { ...results, [battery.id]: { state: 'error' } }, diagnostics, netOf: find, powerNet: P, groundNet: G };
  }

  /* ---------- MCU power ---------- */
  const mcu = parts.find((p) => p.kind === 'mcu');
  let mcuOn = false;
  let fiveV: string | null = null;
  const pinNets = new Map<string, string>(); // net -> pin name
  if (mcu) {
    const vin = N(mcu.id, 'VIN'), gnd = N(mcu.id, 'GND');
    if (vin === P && gnd === G) {
      mcuOn = true;
      fiveV = N(mcu.id, '5V');
      results[mcu.id] = { state: 'powered' };
      for (const pin of ['D2', 'D3', 'D4', 'D5']) {
        const n = N(mcu.id, pin);
        if (n === P || n === G) {
          err(`MCU pin ${pin} is wired straight to battery ${n === P ? '+' : '−'}. That can destroy the pin.`);
          results[mcu.id] = { state: 'error' };
        } else if (wired(terminalRef(mcu.id, pin))) pinNets.set(n, pin);
      }
      if (fiveV === P) {
        err('The MCU 5V pin is tied to the battery. 5V is a regulated OUTPUT — never feed a higher voltage into it.');
        results[mcu.id] = { state: 'error' };
        fiveV = null;
      }
    } else if (vin === P && gnd !== G) {
      warn('The microcontroller VIN is connected but its GND is not. It needs both + and − to power up.');
    } else if (gnd === G && vin !== P && wired(terminalRef(mcu.id, 'VIN'))) {
      warn('The microcontroller VIN is not connected to battery +.');
    } else if (vin === G) {
      err('MCU VIN is connected to battery −. Reverse power can destroy a board.');
    } else if (parts.some((p) => p.kind !== 'mcu' && p.kind !== 'battery') && [...['D2', 'D3', 'D4', 'D5']].some((pin) => wired(terminalRef(mcu.id, pin)))) {
      warn('The microcontroller is not powered, so its pins do nothing. Connect VIN to + and GND to −.');
    }
  }

  /* ---------- Passive network ---------- */
  const edges: Edge[] = [];
  for (const p of parts) {
    if (p.kind === 'resistor') edges.push({ id: p.id, kind: 'resistor', from: N(p.id, 'a'), to: N(p.id, 'b'), ohms: p.props?.ohms ?? 330, vf: 0, directional: false });
    if (p.kind === 'switch' && (switches[p.id] ?? p.props?.closed ?? false)) edges.push({ id: p.id, kind: 'switch', from: N(p.id, 'a'), to: N(p.id, 'b'), ohms: 0, vf: 0, directional: false });
    if (p.kind === 'led') edges.push({ id: p.id, kind: 'led', from: N(p.id, 'A'), to: N(p.id, 'K'), ohms: 0, vf: LED_VF[p.props?.color ?? 'red'], directional: true });
    if (p.kind === 'motor') edges.push({ id: p.id, kind: 'motor', from: N(p.id, '1'), to: N(p.id, '2'), ohms: MOTOR_OHMS, vf: 0, directional: false });
  }

  type Step = { e: Edge; forward: boolean };
  const findPaths = (src: string, dst: string, allowReverseLed: boolean): Step[][] => {
    const out: Step[][] = [];
    const usedE = new Set<string>();
    const usedN = new Set<string>([src]);
    const walk = (net: string, path: Step[]) => {
      if (out.length > 120) return;
      if (net === dst) {
        out.push([...path]);
        return;
      }
      for (const e of edges) {
        if (usedE.has(e.id)) continue;
        let next: string | null = null;
        let forward = true;
        if (e.from === net) next = e.to;
        else if (e.to === net && (!e.directional || allowReverseLed)) {
          next = e.from;
          forward = false;
        }
        if (next === null || usedN.has(next)) continue;
        usedE.add(e.id);
        usedN.add(next);
        path.push({ e, forward });
        walk(next, path);
        path.pop();
        usedE.delete(e.id);
        usedN.delete(next);
      }
    };
    walk(src, []);
    return out;
  };

  interface Source { net: string; volts: number; name: string; maxMa: number; isPin?: string }
  const sources: Source[] = [{ net: P, volts: V, name: 'battery', maxMa: Infinity }];
  if (mcuOn && fiveV && fiveV !== G) sources.push({ net: fiveV, volts: 5, name: 'MCU 5V pin', maxMa: 500 });
  // Pins driving passive loads (the built-in demo sketch sets output pins HIGH).
  for (const [net, pin] of pinNets) {
    if (edges.some((e) => e.from === net || e.to === net)) sources.push({ net, volts: 5, name: `pin ${pin}`, maxMa: PIN_MAX_MA, isPin: pin });
  }

  const ledCurrent = new Map<string, number>();
  const motorDirect = new Map<string, { source: Source; ma: number }>();
  let shorted = false;
  for (const s of sources) {
    const paths = findPaths(s.net, G, false);
    for (const path of paths) {
      const R = path.reduce((a, st) => a + st.e.ohms, 0);
      const Vf = path.reduce((a, st) => a + st.e.vf, 0);
      const hasLed = path.some((st) => st.e.kind === 'led');
      if (R === 0 && !hasLed) {
        if (!shorted) err(`Short circuit from ${s.name} to ground through ${path.map((st) => st.e.id).join(' → ') || 'a wire'}. Current would be enormous.`);
        shorted = true;
        continue;
      }
      if (s.volts <= Vf) {
        path.filter((st) => st.e.kind === 'led').forEach((st) => ledCurrent.set(st.e.id, Math.max(ledCurrent.get(st.e.id) ?? 0, 0)));
        continue;
      }
      const ma = R === 0 ? Infinity : ((s.volts - Vf) / R) * 1000;
      for (const st of path) {
        if (st.e.kind === 'led') ledCurrent.set(st.e.id, Math.max(ledCurrent.get(st.e.id) ?? 0, ma));
        if (st.e.kind === 'motor') motorDirect.set(st.e.id, { source: s, ma });
      }
      if (s.isPin && ma > s.maxMa) {
        if (!path.some((st) => st.e.kind === 'motor')) warn(`Pin ${s.isPin} would supply ${ma === Infinity ? 'unlimited' : Math.round(ma)} mA — over the ~${PIN_MAX_MA} mA limit. Add more resistance.`);
      }
    }
  }

  // LEDs
  for (const p of parts.filter((x) => x.kind === 'led')) {
    const ma = ledCurrent.get(p.id);
    if (ma === undefined) {
      // Would it conduct if it were the other way round?
      const reversed = sources.some((s) => findPaths(s.net, G, true).some((path) => path.some((st) => st.e.id === p.id && !st.forward)));
      if (reversed) {
        err(`${label(p)} is backwards: its cathode (K) faces the + side. LEDs only conduct from anode (A) to cathode (K).`);
        results[p.id] = { state: 'idle', currentMa: 0 };
      }
      continue;
    }
    if (ma === Infinity || ma > LED_MAX_MA) {
      results[p.id] = { state: 'burnt', currentMa: ma };
      err(`${label(p)} has ${ma === Infinity ? 'no current limit' : `${Math.round(ma)} mA`} through it — it would burn out (max ~${LED_MAX_MA} mA). Add a series resistor${ma === Infinity ? '' : ' with more resistance'}.`);
    } else if (ma < 1) {
      results[p.id] = { state: 'idle', currentMa: ma };
      if (ma === 0) warn(`${label(p)} does not get enough voltage to turn on.`);
    } else {
      results[p.id] = { state: ma < 4 ? 'dim' : 'lit', currentMa: ma };
    }
  }

  /* ---------- Modules ---------- */
  const isPinOut = (net: string) => mcuOn && pinNets.has(net);

  // Motor driver
  const motorViaDriver = new Map<string, { controlled: boolean; reverse: boolean }>();
  for (const d of parts.filter((x) => x.kind === 'driver')) {
    const vm = N(d.id, 'VM'), gnd = N(d.id, 'GND'), inN = N(d.id, 'IN'), oa = N(d.id, 'OA'), ob = N(d.id, 'OB');
    const anyWired = d && COMPONENT_DEFS.driver.terminals.some((t) => wired(terminalRef(d.id, t.id)));
    if (!anyWired) continue;
    if (vm !== P) {
      if (vm === fiveV) warn('Motor driver VM is fed from the MCU 5V pin. Motors need the battery’s power directly — connect VM to battery +.');
      else warn('Motor driver VM (motor power) is not connected to battery +.');
      continue;
    }
    if (gnd !== G) {
      err('Motor driver GND is not connected to battery −. Without ground the driver cannot work, and signals have no reference.');
      results[d.id] = { state: 'error' };
      continue;
    }
    let controlled = false;
    let on = false;
    if (isPinOut(inN)) {
      controlled = true;
      on = true;
    } else if (inN === P || inN === fiveV) {
      on = true;
      info('Driver IN is tied HIGH, so the motor always runs — fine for a test, but the MCU cannot control it.');
    } else if (inN === G) {
      info('Driver IN is tied to ground, so the driver keeps the motor off.');
    } else if (mcu && !mcuOn && wired(terminalRef(d.id, 'IN'))) {
      warn('Driver IN is wired to the MCU, but the MCU is not powered.');
    } else {
      warn('Driver IN is floating (not connected). Connect it to an MCU pin so the microcontroller can control the motor.');
    }
    results[d.id] = { state: on ? 'powered' : 'idle' };
    if (!on) continue;
    for (const m of parts.filter((x) => x.kind === 'motor')) {
      const m1 = N(m.id, '1'), m2 = N(m.id, '2');
      if ((m1 === oa && m2 === ob) || (m1 === ob && m2 === oa)) motorViaDriver.set(m.id, { controlled, reverse: m1 === ob });
      else if (m1 === oa || m1 === ob || m2 === oa || m2 === ob) warn(`${label(m)} has only one terminal on the driver outputs. Connect one side to OA and the other to OB.`);
    }
  }

  for (const m of parts.filter((x) => x.kind === 'motor')) {
    const via = motorViaDriver.get(m.id);
    const direct = motorDirect.get(m.id);
    if (direct?.source.isPin) {
      results[m.id] = { state: 'error' };
      err(`${label(m)} is powered from pin ${direct.source.isPin}. A motor needs hundreds of mA; a pin gives ~20–40 mA and the motor’s inductive kick can kill it. Use the motor driver.`);
      if (mcu) results[mcu.id] = { state: 'error' };
    } else if (via) {
      results[m.id] = { state: via.reverse ? 'reverse' : 'spinning', controlled: via.controlled };
    } else if (direct) {
      results[m.id] = { state: 'spinning', controlled: false };
      info(`${label(m)} runs straight from the ${direct.source.name}, so nothing can control its speed or direction.`);
    }
  }

  // Servo
  for (const s of parts.filter((x) => x.kind === 'servo')) {
    const vp = N(s.id, 'V+'), gnd = N(s.id, 'GND'), sig = N(s.id, 'SIG');
    if (![...['V+', 'GND', 'SIG']].some((t) => wired(terminalRef(s.id, t)))) continue;
    const powered = (vp === P || vp === fiveV) && gnd === G;
    if (!powered) {
      warn(`${label(s)} needs power: V+ to battery + (or MCU 5V) and GND to −.`);
      continue;
    }
    if (vp === P && V > 7.4) {
      err(`${label(s)} is connected to ${V} V. Most hobby servos are rated 4.8–6 V (some up to 7.4 V) — this would damage it.`);
      results[s.id] = { state: 'error' };
      continue;
    }
    if (vp === fiveV) warn('Servo powered from the MCU 5V pin: OK for a tiny servo, but bigger servos can brown out the board. A separate supply is better.');
    if (isPinOut(sig)) results[s.id] = { state: 'sweeping', controlled: true };
    else {
      results[s.id] = { state: 'holding' };
      warn(`${label(s)} has power but no control signal. Connect SIG to an MCU pin.`);
    }
  }

  // Sensors (5 V modules)
  const sensorPower = (id: string, name: string): boolean => {
    const vcc = N(id, 'VCC'), gnd = N(id, 'GND');
    if (vcc === P && V > 5.5) {
      err(`${name} VCC is on the ${V} V battery. It is a 5 V module — power it from the MCU 5V pin.`);
      results[id] = { state: 'error' };
      return false;
    }
    if (!((vcc === fiveV && fiveV !== null) || vcc === P) || gnd !== G) {
      warn(`${name} needs power: VCC to the MCU 5V pin and GND to ground.`);
      return false;
    }
    return true;
  };

  for (const u of parts.filter((x) => x.kind === 'ultrasonic')) {
    if (!COMPONENT_DEFS.ultrasonic.terminals.some((t) => wired(terminalRef(u.id, t.id)))) continue;
    if (!sensorPower(u.id, 'Ultrasonic sensor')) continue;
    const trig = N(u.id, 'TRIG'), echo = N(u.id, 'ECHO');
    if (trig === echo && wired(terminalRef(u.id, 'TRIG'))) {
      err('TRIG and ECHO share the same pin. The MCU must send on one pin (TRIG) and listen on another (ECHO).');
      results[u.id] = { state: 'error' };
      continue;
    }
    if (isPinOut(trig) && isPinOut(echo)) results[u.id] = { state: 'pinging', controlled: true };
    else {
      results[u.id] = { state: 'powered' };
      warn(`Ultrasonic sensor is powered, but ${!isPinOut(trig) ? 'TRIG' : 'ECHO'} is not connected to an MCU pin.`);
    }
  }

  for (const s of parts.filter((x) => x.kind === 'ir')) {
    if (!COMPONENT_DEFS.ir.terminals.some((t) => wired(terminalRef(s.id, t.id)))) continue;
    if (!sensorPower(s.id, 'IR sensor')) continue;
    if (isPinOut(N(s.id, 'OUT'))) results[s.id] = { state: 'sensing', controlled: true };
    else {
      results[s.id] = { state: 'powered' };
      warn('IR sensor is powered, but OUT is not connected to an MCU pin.');
    }
  }

  // Overall summary
  const active = Object.values(results).some((r) => ['lit', 'dim', 'spinning', 'reverse', 'sweeping', 'pinging', 'sensing'].includes(r.state));
  if (!diagnostics.some((d) => d.level === 'error') && !active) {
    info('No current is flowing through anything yet. Check that every loop goes from + through the parts and back to −.');
  }
  return { results, diagnostics, netOf: find, powerNet: P, groundNet: G };
}

function label(p: CircuitPart): string {
  const def = COMPONENT_DEFS[p.kind];
  return p.label ?? `${def.title} (${p.id})`;
}

/* ------------------------------------------------------------------ */
/*  Goals                                                               */
/* ------------------------------------------------------------------ */
export function checkGoals(parts: CircuitPart[], wires: [string, string][], switches: Record<string, boolean>, goals: GoalCondition[]): { met: boolean; failed: string[] } {
  const r = evaluateCircuit(parts, wires, switches);
  const failed: string[] = [];
  if (r.diagnostics.some((d) => d.level === 'error')) failed.push('Fix the errors first.');
  for (const g of goals) {
    if ('toggledBy' in g) {
      const on = evaluateCircuit(parts, wires, { ...switches, [g.toggledBy]: true });
      const off = evaluateCircuit(parts, wires, { ...switches, [g.toggledBy]: false });
      const litOn = on.results[g.comp]?.state === 'lit';
      const litOff = off.results[g.comp]?.state === 'lit' || off.results[g.comp]?.state === 'dim';
      if (!litOn || litOff || on.diagnostics.some((d) => d.level === 'error')) failed.push('The switch must turn the LED on and off.');
    } else if (g.state === 'controlled') {
      if (!r.results[g.comp]?.controlled) failed.push('The microcontroller must be in control.');
    } else {
      const st = r.results[g.comp]?.state;
      const ok = g.state === 'spinning' ? st === 'spinning' || st === 'reverse' : st === g.state;
      if (!ok) failed.push(`${g.comp} is not ${g.state} yet.`);
    }
  }
  return { met: failed.length === 0, failed };
}
