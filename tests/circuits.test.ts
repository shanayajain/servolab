import { describe, expect, it } from 'vitest';
import { getCircuit } from '../src/data/circuits';
import { checkGoals, evaluateCircuit } from '../src/features/simulation/circuitEngine';

const SOLUTIONS: Record<string, [string, string][]> = {
  'led-basic': [['bat.+', 'r1.a'], ['r1.b', 'led1.A'], ['led1.K', 'bat.-']],
  'led-switch': [['bat.+', 'sw1.a'], ['sw1.b', 'r1.a'], ['r1.b', 'led1.A'], ['led1.K', 'bat.-']],
  'parallel-leds': [['bat.+', 'r1.a'], ['r1.b', 'led1.A'], ['led1.K', 'bat.-'], ['bat.+', 'r2.a'], ['r2.b', 'led2.A'], ['led2.K', 'bat.-']],
  'fix-led': [['bat.+', 'r1.a'], ['r1.b', 'led1.A'], ['led1.K', 'bat.-']],
  'motor-driver': [['bat.+', 'drv.VM'], ['bat.+', 'mcu.VIN'], ['bat.-', 'drv.GND'], ['bat.-', 'mcu.GND'], ['mcu.D3', 'drv.IN'], ['drv.OA', 'm1.1'], ['drv.OB', 'm1.2']],
  'fix-motor': [['bat.+', 'drv.VM'], ['bat.+', 'mcu.VIN'], ['bat.-', 'drv.GND'], ['bat.-', 'mcu.GND'], ['mcu.D3', 'drv.IN'], ['drv.OA', 'm1.1'], ['drv.OB', 'm1.2']],
  servo: [['bat.+', 'mcu.VIN'], ['bat.-', 'mcu.GND'], ['bat.+', 'srv.V+'], ['bat.-', 'srv.GND'], ['mcu.D2', 'srv.SIG']],
  ultrasonic: [['bat.+', 'mcu.VIN'], ['bat.-', 'mcu.GND'], ['mcu.5V', 'us.VCC'], ['us.GND', 'mcu.GND'], ['mcu.D2', 'us.TRIG'], ['mcu.D3', 'us.ECHO']],
  'ir-sensor': [['bat.+', 'mcu.VIN'], ['bat.-', 'mcu.GND'], ['mcu.5V', 'ir.VCC'], ['ir.GND', 'mcu.GND'], ['mcu.D4', 'ir.OUT']]
};

describe('circuit engine', () => {
  for (const [id, wires] of Object.entries(SOLUTIONS)) {
    it(`${id}: solution meets the goal`, () => {
      const c = getCircuit(id)!;
      const r = checkGoals(c.components, wires, {}, c.goals);
      expect(r.failed).toEqual([]);
    });
  }

  it('starting wiring of debug challenges fails with an explanation', () => {
    for (const id of ['fix-led', 'fix-motor']) {
      const c = getCircuit(id)!;
      const r = evaluateCircuit(c.components, c.wires!, {});
      expect(r.diagnostics.some((d) => d.level === 'error')).toBe(true);
      expect(checkGoals(c.components, c.wires!, {}, c.goals).met).toBe(false);
    }
  });

  it('LED without resistor burns, short circuit detected, motor on pin flagged', () => {
    const c = getCircuit('led-basic')!;
    const burn = evaluateCircuit(c.components, [['bat.+', 'led1.A'], ['led1.K', 'bat.-']], {});
    expect(burn.results.led1.state).toBe('burnt');
    const short = evaluateCircuit(c.components, [['bat.+', 'bat.-']], {});
    expect(short.diagnostics[0].text).toMatch(/Short/);
    const m = getCircuit('motor-driver')!;
    const onPin = evaluateCircuit(m.components, [['bat.+', 'mcu.VIN'], ['bat.-', 'mcu.GND'], ['mcu.D3', 'm1.1'], ['m1.2', 'bat.-']], {});
    expect(onPin.results.m1.state).toBe('error');
  });

  it('switch toggles the LED', () => {
    const c = getCircuit('led-switch')!;
    const w = SOLUTIONS['led-switch'];
    expect(evaluateCircuit(c.components, w, { sw1: true }).results.led1.state).toBe('lit');
    expect(evaluateCircuit(c.components, w, { sw1: false }).results.led1.state).toBe('idle');
  });

  it('missing common ground on driver is an error', () => {
    const m = getCircuit('motor-driver')!;
    const w = SOLUTIONS['motor-driver'].filter(([a, b]) => !(a === 'bat.-' && b === 'drv.GND'));
    const r = evaluateCircuit(m.components, w, {});
    expect(r.results.m1.state).not.toBe('spinning');
  });
});
