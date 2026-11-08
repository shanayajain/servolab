import type { Project } from '../../lib/types';

export const projects: Project[] = [
  {
    id: 'led-button',
    title: 'LED + Button',
    difficulty: 1,
    minutes: 20,
    summary: 'Your first interactive circuit: press a button, light an LED. Learn digital input, output and pull-ups.',
    concepts: ['elec-leds', 'elec-pull-up', 'emb-digital-io'],
    components: ['Arduino Uno or Raspberry Pi Pico', 'Breadboard', 'LED', '220 Ω resistor', 'Push button', 'Jumper wires'],
    goals: ['Wire an LED safely with a current-limiting resistor', 'Read a button using INPUT_PULLUP', 'Understand active-low logic'],
    steps: [
      { title: 'Place the LED', detail: 'Put the LED across two breadboard rows. Long leg (anode) toward the Arduino pin side.' },
      { title: 'Add the resistor', detail: 'Connect pin 13 → 220 Ω resistor → LED anode. LED cathode → GND rail.' },
      { title: 'Wire the button', detail: 'Straddle the centre gap. One side to pin 2, the diagonal side to GND. No external resistor needed.' },
      { title: 'Upload the sketch', detail: 'Use pinMode(2, INPUT_PULLUP) and light the LED when digitalRead(2) == LOW.' },
      { title: 'Test it', detail: 'Press the button: LED on. Release: LED off. If it is inverted, check your comparison.' }
    ],
    challenge: 'Make the button TOGGLE the LED (press once on, press again off). You will need to detect the press edge and debounce it.',
    circuit: 'led-basic',
    code: {
      lang: 'cpp',
      source: `const int LED = 13;
const int BUTTON = 2;

void setup() {
  pinMode(LED, OUTPUT);
  pinMode(BUTTON, INPUT_PULLUP);   // pressed = LOW
}

void loop() {
  bool pressed = digitalRead(BUTTON) == LOW;
  digitalWrite(LED, pressed ? HIGH : LOW);
}`
    }
  },
  {
    id: 'night-light',
    title: 'Automatic Night Light',
    difficulty: 1,
    minutes: 30,
    summary: 'An LED that turns on when it gets dark, using a light sensor, a voltage divider and the ADC.',
    concepts: ['elec-sensors', 'elec-resistors', 'emb-analog-input', 'elec-pwm'],
    components: ['Microcontroller', 'LDR (light-dependent resistor)', '10 kΩ resistor', 'LED + 220 Ω resistor', 'Breadboard and wires'],
    goals: ['Build a voltage divider around an LDR', 'Read it with analogRead', 'Use a threshold with hysteresis', 'Fade the LED with PWM'],
    steps: [
      { title: 'Build the divider', detail: '5 V → LDR → A0 → 10 kΩ → GND. A0 now reads higher in bright light.' },
      { title: 'Print the readings', detail: 'Serial.println(analogRead(A0)) and note values in light and with your hand covering the LDR.' },
      { title: 'Pick thresholds', detail: 'Turn ON below the dark value, OFF above a slightly higher value — hysteresis prevents flicker at dusk.' },
      { title: 'Drive the LED', detail: 'Connect the LED to a PWM pin and analogWrite a brightness that rises as it gets darker.' },
      { title: 'Test in the dark', detail: 'Cover the sensor slowly and confirm a smooth, flicker-free transition.' }
    ],
    challenge: 'Map the darkness to brightness smoothly with map() and constrain(), so the light fades in gradually as the room darkens.',
    code: {
      lang: 'cpp',
      source: `const int LDR = A0;
const int LED = 9;        // PWM pin
bool on = false;

void loop() {
  int light = analogRead(LDR);           // 0 (dark) .. 1023 (bright)
  if (!on && light < 300) on = true;     // hysteresis:
  if (on && light > 380) on = false;     // different on/off thresholds
  analogWrite(LED, on ? 200 : 0);
  delay(50);
}`
    }
  },
  {
    id: 'ultrasonic-sensor',
    title: 'Ultrasonic Distance Sensor',
    difficulty: 1,
    minutes: 30,
    summary: 'Measure distance with an HC-SR04 by timing sound echoes, and print it in centimetres.',
    concepts: ['robo-ultrasonic', 'emb-timers', 'prog-serial'],
    components: ['Microcontroller', 'HC-SR04 ultrasonic sensor', 'Jumper wires', '(Pico: divider for the 5 V echo pin)'],
    goals: ['Trigger a 10 µs pulse', 'Measure echo time with pulseIn', 'Convert time to distance', 'Reject invalid readings'],
    steps: [
      { title: 'Wire power', detail: 'VCC → 5 V, GND → GND. On a 3.3 V board, divide ECHO down to 3.3 V.' },
      { title: 'Wire signals', detail: 'TRIG → pin 7, ECHO → pin 8.' },
      { title: 'Send a trigger', detail: 'Pull TRIG HIGH for 10 µs, then LOW.' },
      { title: 'Time the echo', detail: 'pulseIn(ECHO, HIGH, 30000) returns microseconds (0 on timeout).' },
      { title: 'Convert and print', detail: 'cm = us / 58. Print to serial and compare with a ruler.' }
    ],
    challenge: 'Add a 5-sample median filter so occasional wild readings disappear.',
    sim: 'ultrasonic',
    circuit: 'ultrasonic',
    code: {
      lang: 'cpp',
      source: `const int TRIG = 7, ECHO = 8;

float readCm() {
  digitalWrite(TRIG, LOW);  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long us = pulseIn(ECHO, HIGH, 30000);  // 0 if no echo
  return us == 0 ? -1 : us / 58.0;
}

void setup() {
  Serial.begin(115200);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
}

void loop() {
  Serial.println(readCm());
  delay(60);
}`
    }
  },
  {
    id: 'obstacle-detector',
    title: 'Obstacle Detector',
    difficulty: 2,
    minutes: 40,
    summary: 'Combine distance sensing with a buzzer and LED that warn faster as objects get closer.',
    concepts: ['robo-ultrasonic', 'robo-obstacle-avoidance', 'emb-timers', 'prog-conditionals'],
    components: ['Microcontroller', 'HC-SR04', 'Piezo buzzer', 'LED + resistor', 'Wires'],
    goals: ['Use distance zones', 'Blink without delay() using millis()', 'Scale warning rate with distance'],
    steps: [
      { title: 'Reuse the distance code', detail: 'Start from the ultrasonic project’s readCm().' },
      { title: 'Define zones', detail: 'SAFE > 60 cm, NEAR 20–60 cm, DANGER < 20 cm.' },
      { title: 'Non-blocking blink', detail: 'Toggle the LED/buzzer when millis() - last >= interval.' },
      { title: 'Scale the interval', detail: 'interval = map(cm, 5, 60, 50, 600): closer → faster beeps.' },
      { title: 'Test the zones', detail: 'Move your hand toward the sensor and listen to the warning speed up.' }
    ],
    challenge: 'Add a third behaviour: in DANGER the buzzer stays on continuously and the LED goes solid.',
    sim: 'ultrasonic',
    code: {
      lang: 'cpp',
      source: `unsigned long last = 0;
bool state = false;

void loop() {
  float cm = readCm();
  if (cm < 0 || cm > 60) { digitalWrite(BUZZER, LOW); return; }
  unsigned long interval = map((long)cm, 5, 60, 50, 600);
  if (millis() - last >= interval) {
    last = millis();
    state = !state;
    digitalWrite(BUZZER, state);
    digitalWrite(LED, state);
  }
}`
    }
  },
  {
    id: 'line-follower',
    title: 'Line Following Robot',
    difficulty: 2,
    minutes: 90,
    summary: 'A two-wheeled robot that follows a black line using two IR sensors and proportional steering.',
    concepts: ['robo-ir-sensors', 'robo-motor-drivers', 'robo-closed-loop', 'prog-motor-control'],
    components: ['2WD chassis with geared DC motors', 'Motor driver (TB6612 / L298N / DRV8833)', '2× IR reflectance sensors', 'Microcontroller', 'Battery pack', 'Black electrical tape track'],
    goals: ['Drive two motors through a driver', 'Calibrate IR thresholds', 'Compare bang-bang and proportional steering'],
    steps: [
      { title: 'Build the chassis', detail: 'Mount motors, wheels, caster, battery and driver. Keep wires tidy.' },
      { title: 'Wire the driver', detail: 'Battery → driver VM; driver outputs → motors; PWM and DIR pins → MCU; common GND everywhere.' },
      { title: 'Mount the sensors', detail: 'Two IR sensors ~5 mm above the floor, either side of the line, slightly ahead of the wheels.' },
      { title: 'Calibrate', detail: 'Print raw values over white and black; set a threshold halfway.' },
      { title: 'Bang-bang first', detail: 'Left sees line → turn left; right sees line → turn right; else forward.' },
      { title: 'Go proportional', detail: 'error = left − right; turn = Kp × error; left = base − turn; right = base + turn.' }
    ],
    challenge: 'Tune Kp in the line-following simulation until the robot stays smooth on curves without oscillating, then apply the same gain idea to your real robot.',
    sim: 'line-follow',
    code: {
      lang: 'cpp',
      source: `const int BASE = 140;
const float KP = 0.25;

void loop() {
  int left = analogRead(IR_LEFT);    // higher = darker
  int right = analogRead(IR_RIGHT);
  int error = left - right;          // + means line is to the left
  int turn = KP * error;
  setMotors(BASE - turn, BASE + turn);
}`
    }
  },
  {
    id: 'wall-follower',
    title: 'Wall Following Robot',
    difficulty: 2,
    minutes: 90,
    summary: 'Keep a constant distance from a wall with a side-facing distance sensor and P control.',
    concepts: ['robo-ultrasonic', 'robo-closed-loop', 'robo-feedback', 'robo-obstacle-avoidance'],
    components: ['2WD robot from the line follower project', 'Side-mounted HC-SR04 (or ToF sensor)', 'Optional front sensor'],
    goals: ['Use a distance setpoint', 'Steer proportionally to distance error', 'Handle corners with a front sensor'],
    steps: [
      { title: 'Mount the sensor', detail: 'Point it at the wall, perpendicular to the direction of travel.' },
      { title: 'Choose a setpoint', detail: 'For example 20 cm from the wall.' },
      { title: 'Compute the error', detail: 'error = setpoint − measured. Positive means too close.' },
      { title: 'Steer', detail: 'turn = Kp × error; steer away when too close, toward when too far.' },
      { title: 'Add a corner rule', detail: 'If the front sensor sees < 15 cm, rotate away from the wall in place.' }
    ],
    challenge: 'In the wall-following simulation, find the highest Kp that still settles without weaving.',
    sim: 'wall-follow'
  },
  {
    id: 'pid-motor',
    title: 'PID Motor Control',
    difficulty: 3,
    minutes: 120,
    summary: 'Hold a motor at an exact speed under changing load using encoder feedback and PID.',
    concepts: ['robo-encoders', 'robo-pid', 'emb-interrupts', 'emb-timers'],
    components: ['DC motor with encoder', 'Motor driver', 'Microcontroller', 'Battery'],
    goals: ['Count encoder ticks with interrupts', 'Measure speed every fixed interval', 'Implement and tune PID', 'Add anti-windup'],
    steps: [
      { title: 'Count ticks', detail: 'attachInterrupt on encoder channel A; increment a volatile counter.' },
      { title: 'Measure speed', detail: 'Every 20 ms, speed = (ticks − lastTicks) / 0.02.' },
      { title: 'P only', detail: 'output = Kp × error. Raise Kp until it responds briskly but starts to oscillate, then back off.' },
      { title: 'Add I', detail: 'integral += error × dt. Clamp it (anti-windup) so it cannot grow forever.' },
      { title: 'Add D if needed', detail: 'derivative = (error − lastError) / dt to damp overshoot.' },
      { title: 'Test with load', detail: 'Pinch the wheel lightly — the controller should push harder to hold speed.' }
    ],
    challenge: 'Use the PID simulation to get a response with less than 10% overshoot that settles within 1 second.',
    sim: 'pid',
    code: {
      lang: 'cpp',
      source: `float kp = 1.2, ki = 2.0, kd = 0.02;
float integral = 0, lastError = 0;

int pidStep(float target, float measured, float dt) {
  float error = target - measured;
  integral += error * dt;
  integral = constrain(integral, -100, 100);      // anti-windup
  float derivative = (error - lastError) / dt;
  lastError = error;
  float out = kp * error + ki * integral + kd * derivative;
  return constrain((int)out, -255, 255);
}`
    }
  },
  {
    id: 'imu-orientation',
    title: 'IMU Orientation',
    difficulty: 3,
    minutes: 60,
    summary: 'Read an MPU-6050 over I2C and estimate tilt with a complementary filter.',
    concepts: ['robo-accelerometers', 'robo-gyroscopes', 'robo-imus', 'emb-i2c'],
    components: ['Microcontroller', 'MPU-6050 (or similar 6-DoF IMU) breakout', 'Jumper wires'],
    goals: ['Talk to a sensor over I2C', 'Compute tilt from the accelerometer', 'Integrate the gyro', 'Fuse them with a complementary filter'],
    steps: [
      { title: 'Wire I2C', detail: 'VCC, GND, SDA → SDA, SCL → SCL. Run an I2C scanner: expect address 0x68.' },
      { title: 'Read raw data', detail: 'Use a library (e.g. Adafruit_MPU6050) and print acceleration and gyro rates.' },
      { title: 'Accelerometer tilt', detail: 'pitch = atan2(ax, sqrt(ay² + az²)) × 180/π. Noisy when moving.' },
      { title: 'Gyro integration', detail: 'angle += rate × dt. Smooth, but watch it drift.' },
      { title: 'Fuse', detail: 'angle = 0.98 × (angle + rate × dt) + 0.02 × accelAngle.' }
    ],
    challenge: 'Plot raw accel angle, gyro angle and fused angle in the Serial Plotter and explain the difference you see.',
    code: {
      lang: 'cpp',
      source: `float angle = 0;
unsigned long last = micros();

void loop() {
  float dt = (micros() - last) / 1e6; last = micros();
  float accelAngle = atan2(ax, sqrt(ay*ay + az*az)) * 57.2958;
  angle = 0.98 * (angle + gyroY * dt) + 0.02 * accelAngle;
  Serial.println(angle);
}`
    }
  },
  {
    id: 'encoder-movement',
    title: 'Encoder-Based Movement',
    difficulty: 3,
    minutes: 90,
    summary: 'Drive an exact distance and turn an exact angle using wheel encoders and odometry.',
    concepts: ['robo-encoders', 'robo-odometry', 'robo-position-velocity', 'emb-interrupts'],
    components: ['2WD robot with encoder motors', 'Motor driver', 'Microcontroller'],
    goals: ['Convert ticks to distance', 'Drive straight using both encoders', 'Turn in place by a target angle'],
    steps: [
      { title: 'Measure your wheel', detail: 'Circumference = π × diameter. Count ticks per wheel revolution.' },
      { title: 'Drive a distance', detail: 'targetTicks = distance / circumference × ticksPerRev. Stop when reached.' },
      { title: 'Keep it straight', detail: 'Correct speeds with Kp × (leftTicks − rightTicks).' },
      { title: 'Turn an angle', detail: 'Arc per wheel = (wheelbase / 2) × angle (radians), wheels in opposite directions.' },
      { title: 'Draw a square', detail: 'Repeat 4× (drive 50 cm, turn 90°) and see how close you end to the start.' }
    ],
    challenge: 'In the odometry simulation, raise the slip noise and observe how quickly the estimated pose drifts from the true pose.',
    sim: 'odometry'
  },
  {
    id: 'robot-navigation',
    title: 'Basic Robot Navigation',
    difficulty: 3,
    minutes: 150,
    summary: 'Combine odometry, a simple grid map and reactive avoidance to reach waypoints autonomously.',
    concepts: ['robo-navigation', 'robo-path-planning', 'robo-obstacle-avoidance', 'prog-robotics-code'],
    components: ['Encoder robot from previous projects', 'Front distance sensor', 'Optional IMU for heading'],
    goals: ['Structure code as a state machine', 'Go to a waypoint using heading control', 'Avoid unexpected obstacles', 'Sequence multiple waypoints'],
    steps: [
      { title: 'Define states', detail: 'TURN_TO_GOAL, DRIVE, AVOID, ARRIVED.' },
      { title: 'Heading to goal', detail: 'θgoal = atan2(gy − y, gx − x). Turn until the heading error is small.' },
      { title: 'Drive with correction', detail: 'Forward speed plus a P-term on heading error.' },
      { title: 'Avoid', detail: 'If an obstacle is under 20 cm, switch to AVOID, sidestep, then return to TURN_TO_GOAL.' },
      { title: 'Waypoints', detail: 'Store a list of (x, y) goals and advance when within 5 cm.' }
    ],
    challenge: 'Drive the differential-drive simulation through the arena to reach all marked waypoints without touching a wall.',
    sim: 'diff-drive'
  }
];

export function getProject(id: string | undefined): Project | undefined {
  return projects.find((p) => p.id === id);
}
