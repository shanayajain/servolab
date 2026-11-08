/**
 * Circuit lab challenges (pure data).
 * Component geometry and behaviour live in src/features/simulation/components.ts.
 * Coordinates are in the circuit canvas viewBox (360 wide × `height` tall).
 */
export type CircuitKind = 'battery' | 'resistor' | 'led' | 'switch' | 'motor' | 'driver' | 'mcu' | 'servo' | 'ultrasonic' | 'ir';

export interface CircuitPart {
  id: string;
  kind: CircuitKind;
  x: number;
  y: number;
  label?: string;
  props?: { volts?: number; ohms?: number; closed?: boolean; color?: 'red' | 'green' | 'blue' | 'amber' };
}

export type GoalCondition =
  | { comp: string; state: 'lit' | 'spinning' | 'sweeping' | 'pinging' | 'sensing' }
  | { comp: string; state: 'controlled' }
  | { comp: string; toggledBy: string };

export interface CircuitChallenge {
  id: string;
  title: string;
  difficulty: 1 | 2 | 3;
  brief: string;
  goalText: string;
  hints: string[];
  height: number;
  components: CircuitPart[];
  /** Pre-wired connections, e.g. for debugging challenges. Terminal refs are "componentId.terminal". */
  wires?: [string, string][];
  goals: GoalCondition[];
  /** Sandbox mode: no goal, just experiment. */
  sandbox?: boolean;
  lessons?: string[];
}

export const circuitChallenges: CircuitChallenge[] = [
  {
    id: 'led-basic',
    title: 'Light an LED',
    difficulty: 1,
    brief: 'Build a complete loop from the battery through a current-limiting resistor and an LED.',
    goalText: 'Make the LED glow without damaging it.',
    hints: [
      'Current must leave the battery’s + terminal and return to its − terminal.',
      'LEDs only conduct from anode (A, the long leg) to cathode (K).',
      'Put the resistor in series with the LED so it limits the current.'
    ],
    height: 400,
    components: [
      { id: 'bat', kind: 'battery', x: 22, y: 150, props: { volts: 9 } },
      { id: 'r1', kind: 'resistor', x: 136, y: 60, props: { ohms: 470 } },
      { id: 'led1', kind: 'led', x: 262, y: 200, props: { color: 'red' } }
    ],
    goals: [{ comp: 'led1', state: 'lit' }],
    lessons: ['elec-leds', 'elec-series']
  },
  {
    id: 'led-switch',
    title: 'Switched LED',
    difficulty: 1,
    brief: 'Add a switch so you can turn the LED on and off. Tap the switch while the circuit runs.',
    goalText: 'The LED must light when the switch is closed and go dark when it is open.',
    hints: [
      'The switch must be in series with the LED — in the same single loop.',
      'Do not forget the resistor.',
      'Tap the switch during the run to test both positions.'
    ],
    height: 440,
    components: [
      { id: 'bat', kind: 'battery', x: 22, y: 170, props: { volts: 9 } },
      { id: 'sw1', kind: 'switch', x: 136, y: 50, props: { closed: false } },
      { id: 'r1', kind: 'resistor', x: 248, y: 150, props: { ohms: 470 } },
      { id: 'led1', kind: 'led', x: 170, y: 320, props: { color: 'green' } }
    ],
    goals: [{ comp: 'led1', toggledBy: 'sw1' }],
    lessons: ['elec-switches', 'elec-leds']
  },
  {
    id: 'parallel-leds',
    title: 'Two LEDs in Parallel',
    difficulty: 2,
    brief: 'Light two LEDs from one battery, each with its own resistor, so one failing does not affect the other.',
    goalText: 'Light both LEDs, each on its own branch.',
    hints: [
      'Each branch goes from + through a resistor and an LED back to −.',
      'Both branches connect to the same two battery terminals.',
      'You can connect several wires to the same terminal.'
    ],
    height: 420,
    components: [
      { id: 'bat', kind: 'battery', x: 22, y: 160, props: { volts: 9 } },
      { id: 'r1', kind: 'resistor', x: 120, y: 50, props: { ohms: 470 } },
      { id: 'led1', kind: 'led', x: 262, y: 60, props: { color: 'amber' } },
      { id: 'r2', kind: 'resistor', x: 120, y: 290, props: { ohms: 470 } },
      { id: 'led2', kind: 'led', x: 262, y: 280, props: { color: 'blue' } }
    ],
    goals: [
      { comp: 'led1', state: 'lit' },
      { comp: 'led2', state: 'lit' }
    ],
    lessons: ['elec-parallel']
  },
  {
    id: 'fix-led',
    title: 'Debug: The Dark LED',
    difficulty: 2,
    brief: 'Someone built this circuit, but the LED never lights. Run it, read the diagnosis, then fix the wiring. Tap a wire to delete it.',
    goalText: 'Find the wiring mistake and make the LED light.',
    hints: ['Look at which LED terminal connects toward the battery’s + side.', 'Current flows from anode (A) to cathode (K) only.', 'Delete the two LED wires and reconnect them the other way round.'],
    height: 400,
    components: [
      { id: 'bat', kind: 'battery', x: 22, y: 150, props: { volts: 9 } },
      { id: 'r1', kind: 'resistor', x: 136, y: 60, props: { ohms: 470 } },
      { id: 'led1', kind: 'led', x: 262, y: 200, props: { color: 'red' } }
    ],
    wires: [
      ['bat.+', 'r1.a'],
      ['r1.b', 'led1.K'],
      ['led1.A', 'bat.-']
    ],
    goals: [{ comp: 'led1', state: 'lit' }],
    lessons: ['elec-leds', 'elec-diodes', 'elec-debugging']
  },
  {
    id: 'motor-driver',
    title: 'Drive a Motor',
    difficulty: 2,
    brief: 'Battery → motor driver → motor, with the microcontroller sending the control signal. Power both the driver and the MCU, share ground, and connect an MCU pin to the driver input.',
    goalText: 'Spin the motor under microcontroller control.',
    hints: [
      'Battery + goes to the driver’s VM and the MCU’s VIN.',
      'Battery − goes to the driver GND and the MCU GND (common ground).',
      'Connect an MCU pin (D2–D5) to the driver IN, and the driver outputs OA/OB to the two motor terminals.'
    ],
    height: 470,
    components: [
      { id: 'bat', kind: 'battery', x: 20, y: 30, props: { volts: 7.4 } },
      { id: 'drv', kind: 'driver', x: 140, y: 40 },
      { id: 'm1', kind: 'motor', x: 278, y: 52 },
      { id: 'mcu', kind: 'mcu', x: 40, y: 270 }
    ],
    goals: [
      { comp: 'm1', state: 'spinning' },
      { comp: 'm1', state: 'controlled' }
    ],
    lessons: ['robo-motor-drivers', 'robo-dc-motors']
  },
  {
    id: 'fix-motor',
    title: 'Debug: Motor on a Pin',
    difficulty: 3,
    brief: 'This robot’s motor is wired straight to a microcontroller pin. Run it to see what goes wrong, then rewire it through the motor driver.',
    goalText: 'Drive the motor safely through the driver, controlled by the MCU.',
    hints: ['A GPIO pin can only supply about 20 mA.', 'Remove the wires between the MCU and the motor.', 'Wire it like the “Drive a Motor” challenge: power, common ground, signal, outputs.'],
    height: 470,
    components: [
      { id: 'bat', kind: 'battery', x: 20, y: 30, props: { volts: 7.4 } },
      { id: 'drv', kind: 'driver', x: 140, y: 40 },
      { id: 'm1', kind: 'motor', x: 278, y: 52 },
      { id: 'mcu', kind: 'mcu', x: 40, y: 270 }
    ],
    wires: [
      ['bat.+', 'mcu.VIN'],
      ['bat.-', 'mcu.GND'],
      ['mcu.D3', 'm1.1'],
      ['m1.2', 'mcu.GND']
    ],
    goals: [
      { comp: 'm1', state: 'spinning' },
      { comp: 'm1', state: 'controlled' }
    ],
    lessons: ['robo-motor-drivers', 'elec-actuators']
  },
  {
    id: 'servo',
    title: 'Servo Sweep',
    difficulty: 2,
    brief: 'Power a hobby servo and give it a control signal from the microcontroller so it sweeps back and forth.',
    goalText: 'Make the servo sweep under MCU control.',
    hints: ['Servos have three wires: V+ (power), GND and SIG (signal).', 'The MCU needs power too, and all grounds must be shared.', 'Connect SIG to any MCU pin D2–D5.'],
    height: 440,
    components: [
      { id: 'bat', kind: 'battery', x: 20, y: 30, props: { volts: 6 } },
      { id: 'srv', kind: 'servo', x: 220, y: 60 },
      { id: 'mcu', kind: 'mcu', x: 40, y: 250 }
    ],
    goals: [{ comp: 'srv', state: 'sweeping' }],
    lessons: ['robo-servos']
  },
  {
    id: 'ultrasonic',
    title: 'Distance Sensor',
    difficulty: 2,
    brief: 'Connect an HC-SR04 ultrasonic sensor: power from the MCU’s 5 V pin, TRIG and ECHO to two different MCU pins.',
    goalText: 'Get the sensor pinging and reporting distance.',
    hints: ['Power the MCU from the battery first (VIN and GND).', 'The sensor’s VCC goes to the MCU 5V pin; GND to GND.', 'TRIG and ECHO must go to two DIFFERENT digital pins.'],
    height: 440,
    components: [
      { id: 'bat', kind: 'battery', x: 20, y: 30, props: { volts: 9 } },
      { id: 'us', kind: 'ultrasonic', x: 200, y: 50 },
      { id: 'mcu', kind: 'mcu', x: 40, y: 250 }
    ],
    goals: [{ comp: 'us', state: 'pinging' }],
    lessons: ['robo-ultrasonic']
  },
  {
    id: 'ir-sensor',
    title: 'IR Line Sensor',
    difficulty: 1,
    brief: 'Wire an IR reflectance sensor module to the microcontroller so it can detect a line.',
    goalText: 'Get the IR sensor reporting to the MCU.',
    hints: ['Power the MCU from the battery.', 'Sensor VCC → MCU 5V, GND → GND.', 'Sensor OUT → any MCU pin D2–D5.'],
    height: 440,
    components: [
      { id: 'bat', kind: 'battery', x: 20, y: 30, props: { volts: 9 } },
      { id: 'ir', kind: 'ir', x: 230, y: 60 },
      { id: 'mcu', kind: 'mcu', x: 40, y: 250 }
    ],
    goals: [{ comp: 'ir', state: 'sensing' }],
    lessons: ['robo-ir-sensors', 'emb-digital-io']
  },
  {
    id: 'sandbox',
    title: 'Sandbox',
    difficulty: 1,
    brief: 'Free build. Every component is available — wire anything and press Run to see what happens.',
    goalText: 'Experiment freely. There is no goal.',
    hints: ['Try an LED with and without a resistor.', 'Try a motor directly on a pin, then through the driver.', 'Tap the switch while running.'],
    height: 760,
    sandbox: true,
    components: [
      { id: 'bat', kind: 'battery', x: 20, y: 30, props: { volts: 9 } },
      { id: 'sw1', kind: 'switch', x: 120, y: 40, props: { closed: true } },
      { id: 'r1', kind: 'resistor', x: 240, y: 44, props: { ohms: 330 } },
      { id: 'led1', kind: 'led', x: 140, y: 140, props: { color: 'red' } },
      { id: 'led2', kind: 'led', x: 250, y: 140, props: { color: 'blue' } },
      { id: 'mcu', kind: 'mcu', x: 20, y: 250 },
      { id: 'drv', kind: 'driver', x: 200, y: 250 },
      { id: 'm1', kind: 'motor', x: 260, y: 400 },
      { id: 'srv', kind: 'servo', x: 140, y: 420 },
      { id: 'us', kind: 'ultrasonic', x: 20, y: 540 },
      { id: 'ir', kind: 'ir', x: 200, y: 560 },
      { id: 'r2', kind: 'resistor', x: 20, y: 660, props: { ohms: 220 } }
    ],
    goals: []
  }
];

export function getCircuit(id: string | undefined): CircuitChallenge | undefined {
  return circuitChallenges.find((c) => c.id === id);
}
