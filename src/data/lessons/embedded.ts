import { card, C, code, concept, D, debug, diagram, fill, lesson, match, mc, multi, num, order, predict, review, scenario, tf } from './builders';

export const embeddedLessons = [
  /* ---------------- Unit 1: MCU Basics ---------------- */
  lesson('emb-microcontrollers', 'Microcontrollers', 'MCU Basics', 1, ['mcu', 'hardware'],
    'A whole computer on one chip: CPU, memory and I/O built for control.',
    [
      card('A computer on a chip', 'A microcontroller (MCU) combines a CPU, flash memory for the program, RAM for variables, and peripherals — GPIO, ADC, timers, UART, I2C, SPI — in one chip. Arduino boards use AVR or ARM MCUs; the Raspberry Pi Pico uses the RP2040.', D('pin-header')),
      card('setup() and loop()', 'An Arduino-style program runs setup() once at power-up, then loop() forever. There is no operating system — your code owns the chip.', C('void setup() {\n  pinMode(LED_BUILTIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_BUILTIN, HIGH);\n  delay(500);\n  digitalWrite(LED_BUILTIN, LOW);\n  delay(500);\n}'))
    ],
    [
      multi('What is typically built into a microcontroller?', ['CPU core', 'Flash memory', 'GPIO pins and peripherals', 'A desktop operating system'], [0, 1, 2], 'MCUs integrate CPU, memory and I/O. Most run bare-metal code or a tiny RTOS rather than a full OS.'),
      mc('In an Arduino sketch, how often does loop() run?', ['Repeatedly, forever', 'Once at start-up', 'Once per second', 'Only when a button is pressed'], 0, 'setup() runs once; loop() is called again as soon as it returns.'),
      concept('A Raspberry Pi 4 runs Linux; a Raspberry Pi Pico runs your C code directly. The Pico is a…', ['Microcontroller', 'Single-board computer', 'FPGA', 'GPU'], 0, 'The Pico (RP2040) is an MCU with no OS by default. The Pi 4 is a full computer with a microprocessor.'),
      tf('Microcontrollers are well-suited to real-time control of motors and sensors.', true, 'Without an OS scheduling other tasks, timing is predictable — exactly what control loops need.'),
      match('Match the memory to what it stores.', [['Flash', 'The program (kept when power is off)'], ['RAM', 'Variables while running'], ['EEPROM', 'Small settings that survive power-off']], 'Flash and EEPROM are non-volatile; RAM is lost when power goes off.')
    ]),

  lesson('emb-gpio', 'GPIO', 'MCU Basics', 1, ['gpio', 'pins'],
    'General-purpose input/output pins: configuring direction and logic levels.',
    [
      card('Pins you control', 'GPIO pins can be configured as inputs (read a level) or outputs (drive a level). Each has limits: about 20 mA on an Arduino Uno pin; only 3.3 V logic on a Pico — 5 V can damage it.'),
      card('Configure first', 'Always set the mode before using a pin: pinMode(pin, OUTPUT) or pinMode(pin, INPUT / INPUT_PULLUP).')
    ],
    [
      code('Configure pin 13 to drive an LED.', 'cpp', 'void setup() {\n  pinMode(13, ___);\n}', ['OUTPUT', 'INPUT', 'INPUT_PULLUP', 'ANALOG'], 0, 'An LED needs the pin to drive a voltage, so the pin must be an OUTPUT.'),
      tf('The Raspberry Pi Pico’s GPIO pins are 5 V tolerant.', false, 'RP2040 GPIO is 3.3 V. Use a level shifter or divider for 5 V signals.'),
      mc('Roughly how much current should you draw from a single Arduino Uno GPIO pin?', ['About 20 mA (40 mA absolute max)', 'About 2 A', 'About 500 mA', 'Unlimited'], 0, 'Keep pin currents modest. Anything bigger needs a transistor or driver.'),
      scenario('You connect a 5 V sensor output to a Pico input. What should you add?', ['A level shifter or resistor divider to 3.3 V', 'A bigger LED', 'A pull-down to 5 V', 'Nothing'], 0, 'Scaling 5 V down to 3.3 V protects the 3.3 V-only pin.')
    ]),

  lesson('emb-digital-io', 'Digital Input & Output', 'MCU Basics', 1, ['digital', 'gpio', 'buttons'],
    'digitalWrite, digitalRead and active-low buttons in code.',
    [
      card('Writing levels', 'digitalWrite(pin, HIGH) drives the pin to VCC; LOW drives it to 0 V. Use it for LEDs, relays (through a transistor) and driver direction pins.'),
      card('Reading levels', 'digitalRead(pin) returns HIGH or LOW. With INPUT_PULLUP and a button to GND, a pressed button reads LOW.', C('pinMode(2, INPUT_PULLUP);\nif (digitalRead(2) == LOW) {\n  // button pressed\n}'))
    ],
    [
      code('Turn the LED on pin 13 on.', 'cpp', 'digitalWrite(13, ___);', ['HIGH', 'LOW', 'OUTPUT', '255'], 0, 'HIGH drives the pin to the supply voltage, lighting an LED wired to ground through a resistor.'),
      predict('With INPUT_PULLUP and a button to GND, the button is pressed. What does this code do?', ['Lights the LED', 'Turns the LED off', 'Nothing', 'Crashes'], 0, 'Pressed → digitalRead returns LOW → the condition is true → LED on.', { visual: C('pinMode(2, INPUT_PULLUP);\npinMode(13, OUTPUT);\nif (digitalRead(2) == LOW) {\n  digitalWrite(13, HIGH);\n} else {\n  digitalWrite(13, LOW);\n}') }),
      debug('A button wired from pin 2 to GND randomly reads HIGH and LOW when not pressed. What is missing?', ['pinMode(2, INPUT_PULLUP)', 'A longer delay()', 'digitalWrite(2, HIGH) in loop', 'An LED'], 0, 'Without a pull-up, the pin floats when the button is open.', { visual: C('void setup() {\n  pinMode(2, INPUT);\n}\nvoid loop() {\n  int b = digitalRead(2);\n}') }),
      review('Review: a button with a pull-up resistor is called…', ['Active-low', 'Active-high', 'Analog', 'Open-loop'], 0, 'Pressed reads LOW, so “active” is the LOW level.'),
      tf('digitalRead can tell the difference between 2.0 V and 2.5 V.', false, 'Digital reads only report HIGH or LOW. Use analogRead to measure voltages.')
    ]),

  lesson('emb-analog-input', 'Analog Input', 'MCU Basics', 2, ['adc', 'analog'],
    'analogRead, scaling readings and the map() function.',
    [
      card('Reading voltages', 'analogRead(A0) returns 0–1023 on an Uno (10-bit, 5 V). On a Pico with MicroPython, ADC.read_u16() returns 0–65535 (scaled from a 12-bit ADC).'),
      card('Scaling with map()', 'map(value, fromLow, fromHigh, toLow, toHigh) rescales a range, e.g. a 0–1023 pot reading to a 0–180° servo angle.', C('int raw = analogRead(A0);\nint angle = map(raw, 0, 1023, 0, 180);'))
    ],
    [
      num('An Uno reads 307 from analogRead with a 5 V reference. Roughly what voltage is that?', 1.5, 'V', '307 ÷ 1023 × 5 ≈ 1.50 V.', { tolerance: 0.02 }),
      code('Scale a 0–1023 reading to a 0–255 PWM value.', 'cpp', 'int raw = analogRead(A0);\nint pwm = ___(raw, 0, 1023, 0, 255);\nanalogWrite(9, pwm);', ['map', 'constrain', 'abs', 'round'], 0, 'map() linearly rescales from one range to another.'),
      num('map(512, 0, 1023, 0, 180) returns approximately which angle?', 90, '°', '512 is about half of 1023, so the result is about half of 180.', { tolerance: 0.02 }),
      tf('Averaging several analogRead samples reduces noise.', true, 'Random noise partly cancels out when averaged, giving steadier readings.')
    ]),

  /* ---------------- Unit 2: Timing ---------------- */
  lesson('emb-pwm', 'PWM in Firmware', 'Timing', 2, ['pwm', 'motors'],
    'analogWrite, PWM-capable pins and choosing PWM frequency.',
    [
      card('Hardware PWM', 'On an Uno, analogWrite(pin, 0–255) only works on PWM pins (3, 5, 6, 9, 10, 11 — marked ~). A hardware timer generates the waveform so your code can do other things.'),
      card('Frequency matters', 'LEDs are happy at ~500 Hz. Motors often run better at 15–25 kHz, above human hearing, to avoid whine.')
    ],
    [
      code('Run a motor driver at about 50% speed.', 'cpp', 'analogWrite(ENA_PIN, ___);', ['127', '50', '1023', '0.5'], 0, '8-bit PWM uses 0–255, so ~127 is half duty.'),
      mc('On an Arduino Uno, which pin can produce hardware PWM?', ['Pin 9', 'Pin 2', 'Pin 4', 'Pin 7'], 0, 'Pins marked ~ (3, 5, 6, 9, 10, 11) support analogWrite PWM.'),
      scenario('Your motors whine loudly at low speed. What PWM change helps?', ['Raise the PWM frequency above ~20 kHz', 'Lower it to 50 Hz', 'Use digitalWrite instead', 'Use a pull-up'], 0, 'Moving the switching frequency above human hearing removes the audible whine.'),
      review('Review: average voltage from 5 V PWM at 40% duty is…', ['2 V', '4 V', '0.4 V', '5 V'], 0, '0.4 × 5 = 2 V.')
    ]),

  lesson('emb-timers', 'Timers', 'Timing', 2, ['timers', 'millis', 'scheduling'],
    'Hardware timers, millis(), and why delay() blocks everything.',
    [
      card('delay() blocks', 'delay(1000) freezes the CPU for a second — no sensor reads, no button checks. In a robot that is dangerous.'),
      card('Non-blocking timing', 'Compare millis() (time since boot) with a saved timestamp and act only when enough time has passed. Your loop keeps running fast.', C('unsigned long last = 0;\nvoid loop() {\n  if (millis() - last >= 500) {\n    last = millis();\n    toggleLed();\n  }\n  readSensors(); // still runs every loop\n}'))
    ],
    [
      code('Blink every 250 ms without blocking.', 'cpp', 'if (millis() - last >= ___) {\n  last = millis();\n  toggleLed();\n}', ['250', 'delay(250)', '0', 'HIGH'], 0, 'The comparison checks whether 250 ms have elapsed since the last toggle.'),
      tf('While delay(2000) runs, loop() cannot react to a bumper switch.', true, 'delay() busy-waits; nothing else in loop() executes until it returns.'),
      mc('Why use millis() - last >= interval instead of millis() >= last + interval?', ['It still works when millis() overflows', 'It is faster to type', 'It uses less flash', 'There is no difference'], 0, 'Unsigned subtraction handles the ~49-day rollover of millis() correctly.'),
      concept('A hardware timer fires a function exactly every 1 ms, regardless of what loop() is doing. This uses a…', ['Timer interrupt', 'Pull-up', 'Busy-wait delay', 'Voltage divider'], 0, 'Timers can trigger interrupts at precise intervals — ideal for control loops.')
    ]),

  lesson('emb-interrupts', 'Interrupts', 'Timing', 3, ['interrupts', 'isr'],
    'Reacting instantly to events with interrupt service routines.',
    [
      card('Drop everything', 'An interrupt pauses the main program the instant an event happens (a pin changes, a timer fires), runs a short function — the ISR — then resumes. Perfect for counting encoder ticks.'),
      card('ISR rules', 'Keep ISRs tiny. Do not use delay() or Serial inside them. Mark shared variables volatile so the compiler always re-reads them.', C('volatile long ticks = 0;\nvoid onTick() { ticks++; }\nvoid setup() {\n  attachInterrupt(digitalPinToInterrupt(2), onTick, RISING);\n}'))
    ],
    [
      code('Declare a counter shared with an ISR.', 'cpp', '___ long ticks = 0;', ['volatile', 'const', 'static', 'unsigned'], 0, 'volatile tells the compiler the value can change at any time, outside normal program flow.'),
      mc('Why are encoder ticks often counted with interrupts?', ['So no tick is missed while loop() is busy', 'Because interrupts use less power', 'Because encoders need analog input', 'It is required by law'], 0, 'Polling in loop() can miss fast pulses. An interrupt catches every edge.'),
      tf('It is fine to call delay(100) inside an ISR.', false, 'ISRs must be short. delay() relies on interrupts itself and would block everything.'),
      order('Order what happens when an interrupt fires.', ['The pin changes state', 'The CPU pauses the main program', 'The ISR runs', 'The main program resumes where it left off'], 'Interrupts preempt normal code briefly and then return.'),
      fill('attachInterrupt(digitalPinToInterrupt(2), onTick, ___); // trigger on LOW→HIGH', ['RISING'], 'RISING triggers on a LOW→HIGH transition; FALLING on HIGH→LOW; CHANGE on both.', { bank: ['RISING', 'FALLING', 'HIGH', 'OUTPUT'] })
    ]),

  lesson('emb-debouncing', 'Debouncing', 'Timing', 2, ['debounce', 'buttons'],
    'Mechanical contacts bounce — filter them in hardware or software.',
    [
      card('Contacts bounce', 'When a button closes, its metal contacts physically bounce for a few milliseconds, producing a burst of HIGH/LOW transitions. One press can register as several.', D('bounce')),
      card('Software fix', 'Only accept a new state if it has been stable for ~20–50 ms. Hardware fix: an RC filter (and optionally a Schmitt trigger).')
    ],
    [
      diagram('This scope trace shows one button press. Why might a counter increase by 4?', ['Contact bounce creates several edges', 'The button was pressed four times', 'The ADC is noisy', 'The pull-up is too strong'], 0, 'Each bounce looks like a fresh press to an edge-triggered counter.', { visual: D('bounce') }),
      mc('A typical software debounce window is around…', ['20–50 ms', '1 µs', '5 seconds', '1 minute'], 0, 'Bounce usually settles within a few ms; 20–50 ms is safe and still feels instant.'),
      code('Only accept the reading after it has been stable long enough.', 'cpp', 'if (reading != lastReading) lastChange = millis();\nif (millis() - lastChange > ___) {\n  state = reading;\n}\nlastReading = reading;', ['30', '0', '30000', 'HIGH'], 0, 'A ~30 ms stability window filters bounce without adding noticeable lag.'),
      tf('An RC low-pass filter plus a Schmitt trigger can debounce a button in hardware.', true, 'The RC smooths the bounces and the Schmitt trigger gives a clean single edge.')
    ]),

  /* ---------------- Unit 3: Communication ---------------- */
  lesson('emb-uart', 'UART Serial', 'Communication', 2, ['uart', 'serial'],
    'Asynchronous serial: TX, RX, baud rate and frames.',
    [
      card('Two wires, no clock', 'UART sends bytes one bit at a time over TX, received on the other device’s RX. There is no shared clock, so both sides must agree on the baud rate (e.g. 9600 or 115200).', D('uart-frame', { byte: 65 })),
      card('Frames', 'Each byte is framed: a start bit (LOW), 8 data bits (least-significant first), and a stop bit (HIGH). That is 10 bits per byte.')
    ],
    [
      mc('How should TX and RX be connected between two devices?', ['TX → RX and RX → TX (crossed)', 'TX → TX and RX → RX', 'Both to GND', 'Only TX is needed'], 0, 'One device’s transmit line feeds the other’s receive line. Also share GND.'),
      num('At 9600 baud with 10 bits per byte, about how many bytes per second can be sent?', 960, 'bytes/s', '9600 ÷ 10 = 960 bytes per second.'),
      debug('Your serial monitor shows garbage like “ÿ¿Ã”. What is the most likely cause?', ['Mismatched baud rates', 'A missing pull-up', 'The LED is reversed', 'Too much PWM'], 0, 'If the receiver samples at the wrong rate, bits are misread and you get nonsense characters.'),
      code('Start serial communication at 115200 baud.', 'cpp', 'void setup() {\n  Serial.___(115200);\n}', ['begin', 'start', 'open', 'print'], 0, 'Serial.begin(baud) configures the UART.'),
      tf('UART requires a shared clock wire.', false, 'UART is asynchronous; timing comes from the agreed baud rate. I2C and SPI use clock lines.')
    ]),

  lesson('emb-i2c', 'I2C', 'Communication', 2, ['i2c', 'bus'],
    'A two-wire bus with addresses, shared by many sensors.',
    [
      card('Two wires, many devices', 'I2C uses SDA (data) and SCL (clock). Many devices share the same two wires; each has a 7-bit address. The controller (master) starts every transfer.', D('i2c-bus')),
      card('Pull-ups required', 'Devices only pull lines LOW; pull-up resistors (often 4.7 kΩ) bring them HIGH. Many breakout boards include them.')
    ],
    [
      match('Match each I2C line to its purpose.', [['SDA', 'Data'], ['SCL', 'Clock'], ['GND', 'Common reference']], 'Two signal lines plus a shared ground and power.'),
      num('How many unique addresses does a 7-bit address space allow?', 128, 'addresses', '2⁷ = 128 (some are reserved).'),
      scenario('Two identical IMUs on one I2C bus both use address 0x68. What can you do?', ['Change one’s address with its address-select pin (e.g. to 0x69)', 'Connect them to the same address anyway', 'Remove the pull-ups', 'Swap SDA and SCL on one'], 0, 'Many chips offer an address pin. Otherwise use a second bus or an I2C multiplexer.'),
      tf('I2C lines need pull-up resistors to work.', true, 'The open-drain design means nothing actively drives the lines HIGH except the pull-ups.'),
      review('Review: which part of an IMU communicates over I2C?', ['The whole chip — accel, gyro and magnetometer data', 'Only the power pins', 'Only the PWM output', 'None'], 0, 'The MCU reads all sensor registers through the same I2C interface.')
    ]),

  lesson('emb-spi', 'SPI', 'Communication', 2, ['spi', 'bus'],
    'A fast four-wire bus with chip-select lines.',
    [
      card('Fast and simple', 'SPI uses SCLK (clock), MOSI (controller → peripheral), MISO (peripheral → controller) and CS (chip select, active LOW). It is full-duplex and much faster than I2C — used for displays, SD cards and fast sensors.', D('spi-bus')),
      card('One CS per device', 'Instead of addresses, each peripheral has its own chip-select line. Pull a CS LOW to talk to that device.')
    ],
    [
      match('Match the SPI signal to its role.', [['SCLK', 'Clock from the controller'], ['MOSI', 'Data to the peripheral'], ['MISO', 'Data back to the controller'], ['CS', 'Selects which device listens']], 'Newer naming uses COPI/CIPO, but the roles are the same.'),
      mc('How does SPI select which device to talk to?', ['A separate chip-select line per device', 'A 7-bit address', 'The baud rate', 'The order of wires'], 0, 'Each device has its own CS. Only the selected one drives MISO.'),
      multi('Compared with I2C, SPI is generally…', ['Faster', 'Full-duplex', 'Fewer wires for many devices', 'Free of pull-up requirements on data lines'], [0, 1, 3], 'SPI needs more wires as devices grow (one CS each), but it is faster and full-duplex.'),
      tf('Chip select on most SPI devices is active-low.', true, 'Pulling CS LOW enables the device; HIGH tells it to ignore the bus.')
    ]),

  /* ---------------- Unit 4: Systems ---------------- */
  lesson('emb-memory', 'Embedded Memory', 'Systems', 2, ['memory', 'flash', 'ram'],
    'Flash, SRAM and EEPROM — and living within tiny budgets.',
    [
      card('Tiny budgets', 'An Arduino Uno (ATmega328P) has 32 KB flash and just 2 KB of SRAM. A Pico has 2 MB flash and 264 KB SRAM. Every array and string counts.'),
      card('Saving RAM', 'Keep constant strings in flash with F("…") on AVR, avoid large global arrays, and avoid repeated dynamic allocation (fragmentation).', C('Serial.println(F("Robot ready"));'))
    ],
    [
      num('An Arduino Uno has 2 KB of SRAM. How many bytes is that?', 2048, 'bytes', '2 KB = 2 × 1024 = 2048 bytes.'),
      num('How many bytes does int16_t samples[500] use?', 1000, 'bytes', 'Each int16_t is 2 bytes: 500 × 2 = 1000 bytes — half an Uno’s RAM.'),
      mc('What does F("text") do on AVR Arduinos?', ['Keeps the string in flash instead of copying it to RAM', 'Makes the text bold', 'Formats a float', 'Sends it faster'], 0, 'String literals are otherwise copied into scarce SRAM at start-up.'),
      tf('Data in SRAM is kept when the power is turned off.', false, 'SRAM is volatile. Use EEPROM or flash for data that must survive a reset.')
    ]),

  lesson('emb-real-time', 'Real-Time Systems', 'Systems', 3, ['rtos', 'timing'],
    'Deadlines, determinism and RTOS tasks.',
    [
      card('Correct AND on time', 'In a real-time system, a late answer is a wrong answer. A balancing robot must update its motors every few milliseconds — every time.'),
      card('Hard vs soft', 'Hard real-time: missing a deadline is a failure (airbag, motor commutation). Soft real-time: occasional lateness only degrades quality (video). An RTOS such as FreeRTOS runs prioritised tasks with predictable timing.')
    ],
    [
      concept('A missed deadline in an airbag controller would be catastrophic. This is…', ['Hard real-time', 'Soft real-time', 'Not real-time', 'Batch processing'], 0, 'If a missed deadline is unacceptable, the system is hard real-time.'),
      mc('What does an RTOS mainly provide?', ['Prioritised tasks with predictable scheduling', 'A graphical desktop', 'Internet access', 'More flash memory'], 0, 'RTOS schedulers ensure high-priority tasks run on time.'),
      scenario('Your 1 kHz motor-control loop sometimes stalls because a slow SD-card write blocks it. Best fix?', ['Run control in a high-priority task or timer interrupt; do logging at low priority', 'Write to the SD card more often', 'Remove the motor', 'Increase delay() calls'], 0, 'Separate time-critical work from slow background work and give it priority.'),
      tf('Jitter means variation in the timing of a periodic task.', true, 'Low jitter is important for control loops and audio.')
    ]),

  lesson('emb-sensors', 'Sensor Drivers', 'Systems', 2, ['sensors', 'drivers'],
    'Reading real sensors in firmware: sampling, scaling, filtering.',
    [
      card('Raw to real units', 'Firmware converts raw readings into physical units: ADC counts → volts → °C, or ticks → cm. Keep conversions in one well-named function.'),
      card('Filter wisely', 'A moving average or exponential filter (filtered = α·new + (1−α)·filtered) smooths noise. Smaller α → smoother but slower.', C('filtered = 0.2 * raw + 0.8 * filtered;'))
    ],
    [
      num('An exponential filter has α = 0.2. Previous filtered = 50, new raw = 100. What is the new filtered value?', 60, undefined, '0.2 × 100 + 0.8 × 50 = 20 + 40 = 60.'),
      predict('You lower α from 0.5 to 0.05. The filtered signal becomes…', ['Smoother but slower to respond', 'Noisier and faster', 'Unchanged', 'Always zero'], 0, 'A small α trusts history more, smoothing noise but lagging behind real changes.'),
      tf('Sampling a sensor faster than it updates internally gives you new information each time.', false, 'You will read the same value repeatedly. Match the sample rate to the sensor’s update rate.'),
      review('Review: an analog temperature sensor is read using…', ['The ADC', 'The UART', 'An H-bridge', 'A flyback diode'], 0, 'The ADC converts its voltage into a number you can scale to degrees.')
    ]),

  lesson('emb-actuators', 'Driving Actuators', 'Systems', 2, ['actuators', 'motors', 'safety'],
    'Firmware patterns for motors and servos: ramps, limits and fail-safes.',
    [
      card('Ramp, don’t slam', 'Jumping from 0 to full power causes current spikes and wheel slip. Ramp the PWM gradually toward the target.'),
      card('Fail safe', 'Clamp commands to safe limits and stop motors if communication or sensor data is lost (a watchdog timeout).', C('int cmd = constrain(target, -255, 255);\nif (millis() - lastCommand > 500) cmd = 0; // fail-safe'))
    ],
    [
      code('Keep the motor command within ±255.', 'cpp', 'int cmd = ___(target, -255, 255);', ['constrain', 'map', 'abs', 'min'], 0, 'constrain(x, lo, hi) clips a value into a range.'),
      scenario('A wheeled robot keeps driving after its Bluetooth link drops. What should the firmware do?', ['Stop motors when no command arrives within a timeout', 'Keep the last command forever', 'Speed up', 'Reboot the phone'], 0, 'A command timeout is a classic fail-safe that prevents runaway robots.'),
      mc('Why ramp motor PWM rather than switching straight to 100%?', ['To limit current spikes and wheel slip', 'To save flash memory', 'Because PWM cannot reach 100%', 'To make the code longer'], 0, 'Gradual acceleration is kinder to batteries, drivers, gears and traction.'),
      tf('A watchdog timer can reset an MCU whose code has frozen.', true, 'If the program stops “feeding” the watchdog, it resets the chip — recovering from hangs.')
    ]),

  lesson('emb-debugging', 'Embedded Debugging', 'Systems', 2, ['debugging', 'tools'],
    'Serial prints, LEDs, logic analysers and debuggers.',
    [
      card('Make the invisible visible', 'Print key values over serial, blink an LED at checkpoints, use a logic analyser to see bus traffic, or a hardware debugger (SWD/JTAG) to pause and step through code.'),
      card('Divide and conquer', 'Test each part alone: blink first, then read one sensor, then drive one motor. Integrate step by step.')
    ],
    [
      match('Match each tool to what it reveals.', [['Serial print', 'Variable values over time'], ['Logic analyser', 'Digital bus timing (I2C, SPI, UART)'], ['Multimeter', 'Static voltages and continuity'], ['SWD debugger', 'Breakpoints and stepping through code']], 'Pick the tool that shows the layer where the fault lives.'),
      debug('Your I2C sensor always returns 0. A scan finds no devices. What should you check first?', ['Wiring, power, pull-ups and the address', 'The PWM frequency', 'The motor gearbox', 'The servo angle'], 0, 'An empty scan points at the physical layer: power, SDA/SCL wiring, pull-ups or the wrong bus.'),
      order('Order a sensible bring-up of a new robot board.', ['Blink an LED', 'Print to serial', 'Read one sensor', 'Drive one motor', 'Run the full program'], 'Each step proves one more piece works before you add the next.'),
      tf('Adding many Serial.print calls inside a fast control loop can change its timing.', true, 'Printing takes time. Debug output can itself create timing bugs — print less often.')
    ])
];
