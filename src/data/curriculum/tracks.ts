import type { Track } from '../../lib/types';

/** Track → units → ordered lesson ids. Lesson content lives in src/data/lessons. */
export const tracks: Track[] = [
  {
    id: 'electronics',
    title: 'Electronics',
    short: 'ELEC',
    tagline: 'Voltage, current and the parts every robot is made of.',
    icon: 'zap',
    units: [
      { id: 'elec-u1', title: 'Foundations', description: 'Charge, voltage, current, resistance and power.', lessons: ['elec-electricity', 'elec-voltage', 'elec-current', 'elec-resistance', 'elec-ohms-law', 'elec-power'], challenge: { kind: 'quiz', title: 'Foundations Challenge' } },
      { id: 'elec-u2', title: 'Circuits', description: 'Series, parallel, resistors, switches and breadboards.', lessons: ['elec-series', 'elec-parallel', 'elec-resistors', 'elec-switches', 'elec-breadboards'], challenge: { kind: 'circuit', title: 'Build: Light an LED', circuitId: 'led-basic' } },
      { id: 'elec-u3', title: 'Components', description: 'Capacitors, inductors, diodes, LEDs, transistors and pots.', lessons: ['elec-capacitors', 'elec-inductors', 'elec-diodes', 'elec-leds', 'elec-transistors', 'elec-potentiometers'], challenge: { kind: 'circuit', title: 'Debug: The Dark LED', circuitId: 'fix-led' } },
      { id: 'elec-u4', title: 'Signals & Interfacing', description: 'Analog vs digital, ADC, PWM and pull resistors.', lessons: ['elec-analog-digital', 'elec-adc', 'elec-pwm', 'elec-pull-up', 'elec-pull-down'], challenge: { kind: 'quiz', title: 'Signals Challenge' } },
      { id: 'elec-u5', title: 'Systems', description: 'Sensors, actuators, regulation and debugging.', lessons: ['elec-sensors', 'elec-actuators', 'elec-regulation', 'elec-debugging'], challenge: { kind: 'circuit', title: 'Build: Switched LED', circuitId: 'led-switch' } }
    ]
  },
  {
    id: 'robotics',
    title: 'Robotics',
    short: 'ROBO',
    tagline: 'Motors, sensors, control and autonomy.',
    icon: 'bot',
    units: [
      { id: 'robo-u1', title: 'Robot Basics', description: 'What robots are and what they are made of.', lessons: ['robo-what-is-robot', 'robo-dof', 'robo-components'], challenge: { kind: 'quiz', title: 'Basics Challenge' } },
      { id: 'robo-u2', title: 'Motion', description: 'DC motors, gearboxes, servos, steppers and drivers.', lessons: ['robo-dc-motors', 'robo-gearboxes', 'robo-servos', 'robo-steppers', 'robo-motor-drivers'], challenge: { kind: 'circuit', title: 'Build: Drive a Motor', circuitId: 'motor-driver' } },
      { id: 'robo-u3', title: 'Sensing', description: 'Encoders, distance, IR and light sensors.', lessons: ['robo-encoders', 'robo-position-velocity', 'robo-sensors', 'robo-ultrasonic', 'robo-ir-sensors', 'robo-light-sensors'], challenge: { kind: 'circuit', title: 'Build: Distance Sensor', circuitId: 'ultrasonic' } },
      { id: 'robo-u4', title: 'Inertial & Frames', description: 'Accelerometers, gyros, IMUs, frames and odometry.', lessons: ['robo-accelerometers', 'robo-gyroscopes', 'robo-imus', 'robo-frames', 'robo-odometry'], challenge: { kind: 'quiz', title: 'Inertial Challenge' } },
      { id: 'robo-u5', title: 'Control', description: 'Feedback, open- and closed-loop control, PID.', lessons: ['robo-feedback', 'robo-open-loop', 'robo-closed-loop', 'robo-pid'], challenge: { kind: 'circuit', title: 'Build: Servo Sweep', circuitId: 'servo' } },
      { id: 'robo-u6', title: 'Autonomy', description: 'Planning, avoidance, localization, fusion, SLAM, navigation.', lessons: ['robo-path-planning', 'robo-obstacle-avoidance', 'robo-localization', 'robo-sensor-fusion', 'robo-slam', 'robo-navigation'], challenge: { kind: 'quiz', title: 'Autonomy Challenge' } }
    ]
  },
  {
    id: 'embedded',
    title: 'Embedded Systems',
    short: 'EMB',
    tagline: 'Programming microcontrollers that talk to hardware.',
    icon: 'cpu',
    units: [
      { id: 'emb-u1', title: 'MCU Basics', description: 'Microcontrollers, GPIO, digital and analog I/O.', lessons: ['emb-microcontrollers', 'emb-gpio', 'emb-digital-io', 'emb-analog-input'], challenge: { kind: 'circuit', title: 'Build: IR Line Sensor', circuitId: 'ir-sensor' } },
      { id: 'emb-u2', title: 'Timing', description: 'PWM, timers, interrupts and debouncing.', lessons: ['emb-pwm', 'emb-timers', 'emb-interrupts', 'emb-debouncing'], challenge: { kind: 'quiz', title: 'Timing Challenge' } },
      { id: 'emb-u3', title: 'Communication', description: 'UART, I2C and SPI.', lessons: ['emb-uart', 'emb-i2c', 'emb-spi'], challenge: { kind: 'quiz', title: 'Bus Challenge' } },
      { id: 'emb-u4', title: 'Systems', description: 'Memory, real-time, drivers and debugging.', lessons: ['emb-memory', 'emb-real-time', 'emb-sensors', 'emb-actuators', 'emb-debugging'], challenge: { kind: 'circuit', title: 'Debug: Motor on a Pin', circuitId: 'fix-motor' } }
    ]
  },
  {
    id: 'architecture',
    title: 'Computer Architecture',
    short: 'ARCH',
    tagline: 'From bits and gates to CPUs, memory and I/O.',
    icon: 'binary',
    units: [
      { id: 'arch-u1', title: 'Data', description: 'Bits, bytes, binary and hex.', lessons: ['arch-bits', 'arch-bytes', 'arch-binary'], challenge: { kind: 'quiz', title: 'Data Challenge' } },
      { id: 'arch-u2', title: 'Logic', description: 'Gates, Boolean logic, combinational and sequential circuits.', lessons: ['arch-logic-gates', 'arch-boolean', 'arch-combinational', 'arch-sequential'], challenge: { kind: 'quiz', title: 'Logic Challenge' } },
      { id: 'arch-u3', title: 'Processor', description: 'Registers, ALU, CPU, instruction cycle, assembly.', lessons: ['arch-registers', 'arch-alu', 'arch-cpu', 'arch-instruction-cycle', 'arch-assembly'], challenge: { kind: 'quiz', title: 'Processor Challenge' } },
      { id: 'arch-u4', title: 'Memory & I/O', description: 'Memory, caches, buses and I/O.', lessons: ['arch-memory', 'arch-caches', 'arch-buses', 'arch-io'], challenge: { kind: 'quiz', title: 'Systems Challenge' } }
    ]
  },
  {
    id: 'pcb',
    title: 'PCB Design',
    short: 'PCB',
    tagline: 'Schematics, layout and getting boards made.',
    icon: 'board',
    units: [
      { id: 'pcb-u1', title: 'Foundations', description: 'What PCBs are, schematics, symbols and footprints.', lessons: ['pcb-what-is', 'pcb-schematic', 'pcb-symbols', 'pcb-footprints'], challenge: { kind: 'quiz', title: 'Foundations Challenge' } },
      { id: 'pcb-u2', title: 'Layout', description: 'Traces, layers, vias, routing and design rules.', lessons: ['pcb-traces', 'pcb-layers', 'pcb-vias', 'pcb-routing', 'pcb-design-rules'], challenge: { kind: 'quiz', title: 'Layout Challenge' } },
      { id: 'pcb-u3', title: 'Power & Signals', description: 'Ground planes, decoupling, power distribution, noise.', lessons: ['pcb-ground-planes', 'pcb-decoupling', 'pcb-power-distribution', 'pcb-noise'], challenge: { kind: 'quiz', title: 'Signal Integrity Challenge' } },
      { id: 'pcb-u4', title: 'Fabrication', description: 'Manufacturing, Gerbers and board bring-up.', lessons: ['pcb-manufacturing', 'pcb-gerbers', 'pcb-debugging'], challenge: { kind: 'quiz', title: 'Fab Challenge' } }
    ]
  },
  {
    id: 'programming',
    title: 'Programming',
    short: 'CODE',
    tagline: 'Python, C++ and embedded code for robots.',
    icon: 'code',
    units: [
      { id: 'prog-u1', title: 'Python Basics', description: 'Variables, types, conditionals, loops and functions.', lessons: ['prog-variables', 'prog-data-types', 'prog-conditionals', 'prog-loops', 'prog-functions'], challenge: { kind: 'quiz', title: 'Basics Challenge' } },
      { id: 'prog-u2', title: 'Collections', description: 'Lists, dictionaries and C++ arrays.', lessons: ['prog-lists', 'prog-dictionaries', 'prog-arrays'], challenge: { kind: 'quiz', title: 'Collections Challenge' } },
      { id: 'prog-u3', title: 'Objects & Memory', description: 'Classes, objects, pointers, references, memory.', lessons: ['prog-classes', 'prog-objects', 'prog-pointers', 'prog-references', 'prog-memory'], challenge: { kind: 'quiz', title: 'C++ Challenge' } },
      { id: 'prog-u4', title: 'Robot Code', description: 'Libraries, serial, sensor data, motors and structure.', lessons: ['prog-libraries', 'prog-serial', 'prog-sensor-data', 'prog-motor-control', 'prog-robotics-code'], challenge: { kind: 'quiz', title: 'Robot Code Challenge' } }
    ]
  }
];
