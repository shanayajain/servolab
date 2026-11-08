import { card, code, concept, D, debug, diagram, fill, lesson, match, mc, multi, num, order, P, predict, review, S, scenario, tap, tf } from './builders';

export const roboticsLessons = [
  /* ---------------- Unit 1: Robot Basics ---------------- */
  lesson('robo-what-is-robot', 'What is a Robot?', 'Robot Basics', 1, ['robots', 'sense-think-act'],
    'Robots sense, think and act — a loop that runs continuously.',
    [
      card('Sense → Think → Act', 'A robot is a machine that senses its environment, decides what to do, and acts on the world — over and over in a loop. Remove any one of these and you have a gadget, not a robot.', D('feedback-loop', { closed: true })),
      card('Many shapes', 'Robot arms in factories, vacuum robots, warehouse carts, drones and Mars rovers all run the same loop with different sensors, brains and actuators.')
    ],
    [
      order('Put the robot loop in order.', ['Sense the environment', 'Think — decide what to do', 'Act — move or change something'], 'Robots repeat sense–think–act many times per second.'),
      concept('A robot vacuum notices a wall with its bump sensor and turns away. Detecting the wall is the… step.', ['Sense', 'Think', 'Act', 'Charge'], 0, 'The bump sensor gathers information about the world — that is sensing. Turning is acting.'),
      multi('Which of these are robots?', ['A Mars rover choosing its own path', 'A remote-control car with no sensors', 'A warehouse cart that follows floor markers', 'A desk lamp'], [0, 2], 'Robots sense and decide for themselves. A plain RC car is driven entirely by a human; a lamp has no sensing or decisions.'),
      tf('A robot must look like a human.', false, 'Most robots look nothing like people — arms, wheeled bases, drones and underwater vehicles are all robots.'),
      match('Match each robot to its main job.', [['Industrial arm', 'Welding and assembly'], ['Robot vacuum', 'Cleaning floors'], ['Planetary rover', 'Exploring terrain'], ['Quadcopter drone', 'Flying inspection']], 'The same sense–think–act ideas apply across very different machines.')
    ]),

  lesson('robo-dof', 'Degrees of Freedom', 'Robot Basics', 2, ['dof', 'kinematics'],
    'Counting independent motions — the robot’s ability to move.',
    [
      card('Independent motions', 'Degrees of freedom (DoF) count how many independent ways something can move. A free object in 3D space has 6: three translations (x, y, z) and three rotations (roll, pitch, yaw).'),
      card('Joints add DoF', 'For a robot arm, each powered joint usually adds one DoF. A typical industrial arm has 6, enough to put its gripper at any position AND orientation within reach.', D('dof-arm', { joints: 3 }))
    ],
    [
      num('How many degrees of freedom does a rigid body moving freely in 3D space have?', 6, 'DoF', 'Three translations (x, y, z) plus three rotations (roll, pitch, yaw).'),
      diagram('How many degrees of freedom does this arm have (one per rotating joint)?', ['3', '2', '6', '1'], 0, 'Each of the three revolute joints adds one degree of freedom.', { visual: D('dof-arm', { joints: 3 }) }),
      mc('Why do many industrial arms have 6 joints?', ['To reach any position and orientation in their workspace', 'Because six motors are cheaper', 'To lift more weight', 'For decoration'], 0, 'Six independent joints match the six DoF of a rigid object, so the gripper can be placed and pointed freely.'),
      tf('A car driving on a flat floor can move sideways directly, so it has full 3 DoF control.', false, 'A car can reach any (x, y, heading) eventually, but it cannot slide sideways directly. That is why parallel parking takes manoeuvres.'),
      match('Match the motion to its type.', [['Up/down', 'Translation (z)'], ['Turning left/right', 'Rotation (yaw)'], ['Nose up/down', 'Rotation (pitch)'], ['Forward/back', 'Translation (x)']], 'Translations slide along axes; rotations spin about them.')
    ]),

  lesson('robo-components', 'Robot Components', 'Robot Basics', 1, ['components', 'systems'],
    'Chassis, power, controller, sensors, actuators and drivers — how they fit together.',
    [
      card('The building blocks', 'Most mobile robots share the same parts: a chassis (body), a power source (battery), a controller (microcontroller or computer), sensors, actuators (motors), and drivers between controller and motors.', D('robot-top', { sensors: 'ultrasonic' })),
      card('Power flows, signals flow', 'Big currents go battery → driver → motor. Tiny control signals go controller → driver. Sensor data comes back to the controller. Keep these paths separate in your head.')
    ],
    [
      match('Match the component to its role.', [['Microcontroller', 'Runs the program and makes decisions'], ['Motor driver', 'Switches motor current'], ['Battery', 'Stores energy'], ['Ultrasonic sensor', 'Measures distance']], 'Every part plays one role in the sense–think–act loop.'),
      tap('Tap the part that acts as the robot’s brain.', ['battery', 'mcu', 'motor', 'ultrasonic'], 1, 'The microcontroller reads sensors and decides what the actuators should do.'),
      mc('Why is a motor driver placed between the microcontroller and the motors?', ['The MCU pins cannot supply the current motors need', 'To make the motors quieter', 'To store the program', 'To measure distance'], 0, 'A logic pin can source about 20 mA. Motors need hundreds of mA or more, so a driver switches the heavy current.'),
      tf('Sensors and the microcontroller must share a common ground with the motor driver.', true, 'Signals are voltages relative to ground. Without a shared ground the driver cannot interpret the MCU’s signals.'),
      review('Review: which electronic part lets a small signal switch a large current?', ['Transistor', 'Capacitor', 'Potentiometer', 'LDR'], 0, 'Transistors (and the motor drivers built from them) are the bridge between logic and power.')
    ]),

  /* ---------------- Unit 2: Motion ---------------- */
  lesson('robo-dc-motors', 'DC Motors', 'Motion', 1, ['motors', 'dc-motor'],
    'How brushed DC motors turn current into rotation, and how voltage sets speed.',
    [
      card('Spinning with magnets', 'A brushed DC motor has a coil that sits in a magnetic field. Current through the coil creates a force that turns it; brushes swap the current direction every half turn to keep it spinning.', S('dc-motor')),
      card('Speed and direction', 'Higher voltage → faster. Reverse the polarity → reverse direction. Load slows the motor and makes it draw more current; a stalled motor draws the most.')
    ],
    [
      predict('You swap the two wires on a DC motor. What happens?', ['It spins the other way', 'It stops', 'It spins faster', 'It burns out'], 0, 'Reversing polarity reverses the current through the coil, which reverses the torque.'),
      mc('What mainly sets the speed of an unloaded DC motor?', ['The applied voltage', 'The wire colour', 'The motor’s weight', 'The current direction'], 0, 'Speed is roughly proportional to voltage (minus losses). PWM controls speed by changing the average voltage.'),
      tf('A stalled (blocked) DC motor draws its maximum current.', true, 'With no rotation there is no back-EMF opposing the supply, so current is limited only by the winding resistance. This is why stalls overheat drivers.'),
      scenario('Your robot slows dramatically when climbing a ramp. Why?', ['Higher load torque slows the motor', 'The battery voltage increased', 'The motor reversed', 'Encoders stop working uphill'], 0, 'More torque demand → lower speed and higher current. Gearboxes help motors handle higher loads.'),
      tap('Tap the DC motor.', ['servo', 'motor', 'stepper', 'driver'], 1, 'The DC motor symbol is a circle with an M inside.')
    ]),

  lesson('robo-gearboxes', 'Gearboxes', 'Motion', 2, ['gears', 'torque'],
    'Trading speed for torque with gear ratios.',
    [
      card('Speed for torque', 'Small DC motors spin fast (thousands of RPM) but have little torque. A gearbox reduces speed and multiplies torque by the gear ratio (minus some friction).', D('gears', { ratio: 3 })),
      card('Computing the ratio', 'Gear ratio = teeth on output gear ÷ teeth on input gear. A 10-tooth gear driving a 30-tooth gear gives 3:1 — one third the speed, three times the torque.')
    ],
    [
      num('A 12-tooth motor gear drives a 48-tooth wheel gear. What is the gear ratio (output:input)?', 4, ': 1', '48 ÷ 12 = 4, so 4:1 reduction.'),
      num('A 6000 RPM motor drives a 50:1 gearbox. What is the output speed in RPM?', 120, 'RPM', '6000 ÷ 50 = 120 RPM.'),
      diagram('In this gear pair, the small gear drives the large one. The large gear turns…', ['Slower, with more torque', 'Faster, with more torque', 'Faster, with less torque', 'At the same speed'], 0, 'A larger driven gear reduces speed and multiplies torque by the ratio.', { visual: D('gears', { ratio: 3 }) }),
      tf('Two meshing spur gears rotate in opposite directions.', true, 'Each meshing pair flips direction. Add an idler gear to keep the direction the same.'),
      mc('Why do most robot wheels use a geared motor?', ['To get usable torque at a sensible wheel speed', 'To make the motor faster', 'To remove the need for a battery', 'To reduce weight'], 0, 'Bare motors are too fast and too weak for wheels. A reduction gearbox matches them to the job.')
    ]),

  lesson('robo-servos', 'Servo Motors', 'Motion', 1, ['servos', 'pwm'],
    'Hobby servos: position control in a box, commanded by pulse width.',
    [
      card('Position on command', 'A hobby servo contains a DC motor, gearbox, potentiometer and control circuit. You send it a target angle; it drives the motor until the pot says it is there.', P('servo')),
      card('Pulse width = angle', 'Servos expect a pulse every 20 ms. About 1 ms → 0°, 1.5 ms → 90°, 2 ms → 180° (exact values vary by model).', D('servo-pulse', { ms: 1.5 }))
    ],
    [
      diagram('This servo receives 1.5 ms pulses. Roughly which angle does it hold?', ['90° (centre)', '0°', '180°', 'It spins continuously'], 0, '1.5 ms is the neutral (centre) pulse for most hobby servos.', { visual: D('servo-pulse', { ms: 1.5 }) }),
      mc('What inside a hobby servo tells it the current shaft angle?', ['A potentiometer', 'A thermistor', 'A camera', 'An ultrasonic sensor'], 0, 'The pot is geared to the output shaft. Its voltage is compared with the commanded position.'),
      code('Move a servo to 90° with the Arduino Servo library.', 'cpp', '#include <Servo.h>\nServo arm;\nvoid setup() {\n  arm.attach(9);\n  arm.___(90);\n}', ['write', 'read', 'speed', 'analogWrite'], 0, 'Servo.write(angle) sets the target angle in degrees; the library generates the correct pulses.'),
      tf('A standard hobby servo can rotate continuously like a wheel motor.', false, 'Standard servos have a limited range (often ~180°). “Continuous rotation” servos are a modified variant where the pulse sets speed instead.'),
      scenario('Your servo jitters and the microcontroller resets when it moves. What helps most?', ['Power the servo from a separate supply with a shared ground', 'Use a longer signal wire', 'Lower the pulse width', 'Remove the ground wire'], 0, 'Servos draw current spikes that sag a weak supply. A separate supply (plus a capacitor) keeps the logic stable.')
    ]),

  lesson('robo-steppers', 'Stepper Motors', 'Motion', 2, ['steppers', 'open-loop'],
    'Moving in precise steps without feedback — and when that fails.',
    [
      card('Moving in steps', 'A stepper motor moves a fixed angle per step by energising coils in sequence. A common motor has 200 steps per revolution (1.8° per step). 3D printers use them everywhere.', P('stepper')),
      card('Open-loop precision', 'Because each pulse means one step, you know the position just by counting — no sensor needed. But if the load is too big, the motor “skips” steps and the count becomes wrong.')
    ],
    [
      num('A stepper has 200 steps per revolution. How many degrees is one step?', 1.8, '°', '360° ÷ 200 = 1.8° per step.'),
      num('How many steps turn a 200-step motor through 90°?', 50, 'steps', '90° ÷ 1.8° = 50 steps.'),
      mc('Why are steppers popular in 3D printers?', ['Precise positioning by counting steps', 'They are the fastest motors', 'They need no driver', 'They are silent'], 0, 'Counting pulses gives repeatable positioning with no encoder, which keeps printers simple and cheap.'),
      scenario('A printer nozzle suddenly prints shifted layers after hitting a blob. What happened?', ['The stepper skipped steps under load and lost position', 'The heater got too hot', 'The filament changed colour', 'The servo pulse changed'], 0, 'Steppers are open-loop: a skipped step is never detected, so all later positions are offset.'),
      tf('Microstepping lets a stepper move in fractions of a full step for smoother motion.', true, 'Drivers proportion the current between coils to hold intermediate positions, e.g. 1/16 step.')
    ]),

  lesson('robo-motor-drivers', 'Motor Drivers', 'Motion', 2, ['drivers', 'h-bridge'],
    'H-bridges let a microcontroller control motor speed and direction safely.',
    [
      card('The H-bridge', 'An H-bridge uses four switches around the motor. Closing opposite corners sends current one way or the other, so the motor runs forwards or backwards.', D('h-bridge', { state: 'forward' })),
      card('Driver chips', 'Modules such as the L298N, TB6612 or DRV8833 contain H-bridges. The MCU sends direction and PWM speed signals; the driver switches the battery current.')
    ],
    [
      diagram('Which way does current flow through the motor in this H-bridge state?', ['Left to right — the motor runs forward', 'Right to left — reverse', 'No current', 'Straight to ground — short circuit'], 0, 'The top-left and bottom-right switches are closed, so current crosses the motor from left to right.', { visual: D('h-bridge', { state: 'forward' }) }),
      debug('Both switches on the LEFT side of the H-bridge are closed. What happens?', ['A short circuit from supply to ground (shoot-through)', 'The motor brakes gently', 'The motor runs forward', 'Nothing'], 0, 'Closing both switches on one side connects + directly to ground. Drivers include logic to prevent this “shoot-through”.', { visual: D('h-bridge', { state: 'short' }) }),
      mc('What do you send to a typical motor driver to control speed?', ['A PWM signal', 'A DC voltage from a divider', 'A serial string', 'Nothing — speed is fixed'], 0, 'PWM on the enable or input pin controls the average power delivered to the motor.'),
      tf('The motor driver, the microcontroller and the battery must share a common ground.', true, 'Logic signals are referenced to ground. Without a common ground the driver may ignore or misread them.'),
      review('Review: connecting a motor straight to an MCU pin is a bad idea because…', ['The pin cannot supply enough current and inductive spikes can damage it', 'Motors need AC', 'Pins only output analog', 'It would run too fast'], 0, 'Pins provide ~20 mA; motors need far more and produce spikes. That is the driver’s job.')
    ]),

  /* ---------------- Unit 3: Sensing ---------------- */
  lesson('robo-encoders', 'Encoders', 'Sensing', 2, ['encoders', 'odometry'],
    'Counting ticks to measure rotation, distance and speed.',
    [
      card('Counting rotation', 'An encoder produces a pulse (tick) for each small amount of rotation. Optical encoders use a slotted disk and a light beam; magnetic encoders use a Hall sensor and a magnet.', S('encoder')),
      card('Ticks to distance', 'Distance = (ticks ÷ ticks per revolution) × wheel circumference. Two channels 90° apart (quadrature) also give direction.')
    ],
    [
      num('An encoder gives 20 ticks per wheel revolution. The wheel circumference is 20 cm. How far has the wheel rolled after 50 ticks?', 50, 'cm', '50 ÷ 20 = 2.5 revolutions × 20 cm = 50 cm.'),
      diagram('This encoder disk has 12 slots. How many ticks per revolution does one sensor see?', ['12', '6', '24', '360'], 0, 'Each slot passing the light beam produces one pulse.', { visual: D('encoder', { slots: 12 }) }),
      mc('What does a quadrature encoder’s second channel add?', ['Direction of rotation', 'Battery voltage', 'Temperature', 'Colour'], 0, 'Two channels offset by 90° show which one leads, revealing the direction.'),
      num('A wheel has diameter 6.5 cm. What is its circumference (π × d) in cm?', 20.42, 'cm', 'C = π × 6.5 ≈ 20.42 cm.', { tolerance: 0.01 }),
      tf('Encoders let a robot measure how far its wheels have turned.', true, 'Counting ticks tells you rotation; with the wheel size you get distance — the basis of odometry.')
    ]),

  lesson('robo-position-velocity', 'Position vs Velocity', 'Sensing', 2, ['kinematics', 'encoders'],
    'Position, velocity and acceleration — and how one comes from another.',
    [
      card('Rates of change', 'Position is where you are. Velocity is how fast position changes (e.g. cm/s). Acceleration is how fast velocity changes. Each is the rate of change of the one before.'),
      card('From encoders', 'Velocity ≈ change in position ÷ change in time. If the encoder count rises by 40 ticks in 0.1 s, the speed is 400 ticks/s.')
    ],
    [
      num('A robot moves from 10 cm to 70 cm in 2 seconds. What is its average velocity?', 30, 'cm/s', '(70 − 10) ÷ 2 = 30 cm/s.'),
      num('An encoder count rises by 40 ticks in 0.1 s. What is the speed in ticks per second?', 400, 'ticks/s', '40 ÷ 0.1 = 400 ticks/s.'),
      match('Match each quantity to its unit.', [['Position', 'cm'], ['Velocity', 'cm/s'], ['Acceleration', 'cm/s²']], 'Each derivative adds one “per second”.'),
      concept('A robot’s speed stays constant at 20 cm/s. What is its acceleration?', ['Zero', '20 cm/s²', '20 cm/s', 'It cannot be known'], 0, 'Acceleration is the change in velocity. Constant velocity means zero acceleration.'),
      tf('Computing velocity by differencing positions amplifies measurement noise.', true, 'Small position errors divided by a small time step become large velocity errors, so velocity estimates are usually filtered.')
    ]),

  lesson('robo-sensors', 'Robot Sensors', 'Sensing', 1, ['sensors', 'perception'],
    'Proprioceptive vs exteroceptive sensors and choosing the right one.',
    [
      card('Inside and outside', 'Proprioceptive sensors measure the robot itself — encoders, battery voltage, IMUs. Exteroceptive sensors measure the world — distance sensors, cameras, bump switches.'),
      card('Every sensor lies a little', 'Real sensors have noise, limited range, blind spots and delays. Good robots combine several and never trust one reading completely.')
    ],
    [
      match('Match the sensor to what it observes.', [['Wheel encoder', 'Wheel rotation'], ['Ultrasonic', 'Distance to objects'], ['Bump switch', 'Physical contact'], ['Camera', 'Images of the scene']], 'Each sensor answers a different question about the robot or its surroundings.'),
      multi('Which are proprioceptive (measure the robot itself)?', ['Wheel encoder', 'Battery voltage monitor', 'Lidar', 'Gyroscope'], [0, 1, 3], 'Lidar measures the environment, so it is exteroceptive.'),
      scenario('Your robot must stop before touching a glass door. Which sensor alone is LEAST reliable?', ['An IR reflectance sensor (light passes through glass)', 'An ultrasonic sensor', 'A bump switch as last resort', 'A lidar with glass filtering'], 0, 'Clear glass reflects little IR back, so IR sensors can miss it. Ultrasound reflects off glass well.'),
      tf('A sensor reading should always be treated as exact.', false, 'All sensors have noise and error. Robots filter, average and fuse readings to get reliable estimates.')
    ]),

  lesson('robo-ultrasonic', 'Ultrasonic Sensors', 'Sensing', 2, ['ultrasonic', 'distance'],
    'Measuring distance with sound echoes, like a bat.',
    [
      card('Echo timing', 'An ultrasonic sensor (such as the HC-SR04) sends a 40 kHz chirp and times how long the echo takes to return. Sound travels about 343 m/s (0.0343 cm/µs).', S('ultrasonic')),
      card('There and back', 'The echo travels to the object AND back, so distance = (time × speed of sound) ÷ 2. With time in µs: distance in cm ≈ time ÷ 58.')
    ],
    [
      num('An echo returns after 1160 µs. Using distance (cm) ≈ time ÷ 58, how far away is the object?', 20, 'cm', '1160 ÷ 58 = 20 cm.'),
      mc('Why do we divide the echo time by 2?', ['The sound travels to the object and back', 'The sensor has two transducers', 'Sound slows down by half', 'To convert to inches'], 0, 'The measured time covers the round trip. Half of it is the one-way trip.'),
      diagram('Here the object is 30 cm away. If it moves to 60 cm, the echo time…', ['Doubles', 'Halves', 'Stays the same', 'Quadruples'], 0, 'Echo time is proportional to distance.', { visual: D('ultrasonic', { distance: 30 }) }),
      multi('Which surfaces can confuse an ultrasonic sensor?', ['Soft fabric that absorbs sound', 'Surfaces at a steep angle that deflect the echo', 'A flat wall facing the sensor', 'Very small, thin objects'], [0, 1, 3], 'Flat walls give strong echoes. Soft, angled or tiny objects return weak or deflected echoes.'),
      code('Compute distance in cm from the echo time in microseconds.', 'cpp', 'long us = pulseIn(ECHO_PIN, HIGH);\nfloat cm = us ___ 58.0;', ['/', '*', '+', '%'], 0, 'Dividing microseconds by ~58 converts round-trip time to one-way centimetres.')
    ]),

  lesson('robo-ir-sensors', 'IR Sensors', 'Sensing', 1, ['ir', 'line-following'],
    'Infrared reflectance sensors for detecting lines and nearby objects.',
    [
      card('Reflected infrared', 'An IR sensor pairs an IR LED with a photodetector. Light surfaces reflect a lot of IR; dark surfaces absorb it. That makes them perfect for following a black line on a white floor.', S('line-follow')),
      card('Digital or analog', 'Many modules have a comparator and output HIGH/LOW. Raw sensors give an analog value you can threshold yourself.')
    ],
    [
      predict('An IR reflectance sensor is over a black line. Compared with white floor, the reflected IR is…', ['Lower', 'Higher', 'The same', 'Zero for both'], 0, 'Black absorbs infrared, so less reflects back to the detector.'),
      mc('Why do line-following robots usually use two or more IR sensors?', ['To tell which side of the line the robot has drifted to', 'For more brightness', 'To measure speed', 'Because one would overheat'], 0, 'If the left sensor sees the line, steer left; if the right sees it, steer right.'),
      tf('Bright sunlight can interfere with IR sensors.', true, 'Sunlight contains lots of infrared that can swamp the reflected signal. Shielding and modulated IR help.'),
      tap('Tap the IR sensor module.', ['ultrasonic', 'ir', 'imu', 'encoder'], 1, 'IR modules have an emitter LED and a detector side by side.'),
      scenario('Your line follower works on paper but fails on a glossy floor. Why?', ['Glare reflects IR strongly even from the dark line', 'The battery is too strong', 'The wheels are too small', 'The line is too straight'], 0, 'Glossy surfaces create specular reflections. Adjust the sensor height/angle or re-calibrate the threshold.')
    ]),

  lesson('robo-light-sensors', 'Light Sensors', 'Sensing', 1, ['light', 'ldr'],
    'LDRs, photodiodes and phototransistors for measuring ambient light.',
    [
      card('Measuring brightness', 'LDRs change resistance with light; photodiodes and phototransistors produce a current. Light sensors let robots seek light, detect day/night or read simple markers.'),
      card('Light-seeking', 'With one light sensor on each side, a robot can steer toward whichever side is brighter — a classic Braitenberg behaviour.')
    ],
    [
      mc('An LDR in bright light has…', ['Low resistance', 'High resistance', 'No resistance change', 'Negative resistance'], 0, 'More light frees more charge carriers in the LDR material, lowering its resistance.'),
      scenario('Left light sensor reads 800, right reads 300 (higher = brighter). To seek light, the robot should…', ['Turn left', 'Turn right', 'Stop', 'Reverse'], 0, 'The left side is brighter, so steer toward it.'),
      tf('An LDR responds instantly to changes in light.', false, 'LDRs are slow — tens of milliseconds or more. Photodiodes are much faster.'),
      review('Review: an LDR is read most easily by placing it in a…', ['Voltage divider read by the ADC', 'H-bridge', 'Series loop with a motor', 'Flyback circuit'], 0, 'The divider turns resistance into voltage the ADC can measure.')
    ]),

  /* ---------------- Unit 4: Inertial & Frames ---------------- */
  lesson('robo-accelerometers', 'Accelerometers', 'Inertial Sensing', 2, ['imu', 'accelerometer'],
    'Measuring acceleration — and gravity — on three axes.',
    [
      card('Feeling forces', 'An accelerometer measures acceleration along x, y and z, usually in g (1 g ≈ 9.81 m/s²). Sitting still, it still reads 1 g upward because it feels gravity.'),
      card('Tilt from gravity', 'When the robot is still, the gravity vector tells you which way is down, so you can compute tilt (pitch and roll). During motion, acceleration and vibration corrupt that estimate.')
    ],
    [
      predict('An accelerometer lies flat and still on a table. What does its z-axis read?', ['About 1 g', 'Exactly 0 g', 'About 9.81 g', 'It is random'], 0, 'At rest it measures the reaction to gravity: about 1 g on the vertical axis.'),
      mc('Accelerometers are good at estimating tilt when…', ['The robot is still or moving steadily', 'The robot is vibrating heavily', 'The robot is accelerating hard', 'Never'], 0, 'Only when other accelerations are small does gravity dominate the reading.'),
      num('A robot accelerates from 0 to 2 m/s in 0.5 s. What is the acceleration in m/s²?', 4, 'm/s²', 'a = Δv ÷ Δt = 2 ÷ 0.5 = 4 m/s².'),
      tf('An accelerometer alone can measure the robot’s heading (yaw) on flat ground.', false, 'Rotating around the vertical axis does not change the gravity vector, so heading is invisible to an accelerometer.')
    ]),

  lesson('robo-gyroscopes', 'Gyroscopes', 'Inertial Sensing', 2, ['imu', 'gyroscope'],
    'Measuring rotation rate and why integrated angles drift.',
    [
      card('Rotation rate', 'A MEMS gyroscope measures angular velocity — how fast the robot rotates, in degrees per second — around each axis.'),
      card('Integration drifts', 'Angle = sum of (rate × Δt). Any tiny bias adds up over time, so a gyro-only heading slowly drifts.')
    ],
    [
      num('A gyro reads a steady 30 °/s for 3 s. How far has the robot turned?', 90, '°', 'Angle = rate × time = 30 × 3 = 90°.'),
      num('A gyro has a bias of 0.5 °/s. After 1 minute, how much heading error builds up?', 30, '°', '0.5 °/s × 60 s = 30° of drift.'),
      mc('What does a gyroscope directly measure?', ['Angular velocity', 'Absolute angle', 'Linear acceleration', 'Magnetic north'], 0, 'Gyros report rotation rate; angles come from integrating it.'),
      tf('Gyroscope heading estimates drift over time.', true, 'Integrating a slightly biased rate accumulates error without limit. Other sensors are needed to correct it.')
    ]),

  lesson('robo-imus', 'IMUs', 'Inertial Sensing', 2, ['imu', 'fusion'],
    'Combining accelerometers, gyroscopes and magnetometers into one orientation estimate.',
    [
      card('Inertial Measurement Unit', 'An IMU packages a 3-axis accelerometer and 3-axis gyroscope (6-DoF), often with a magnetometer (9-DoF). Popular chips include the MPU-6050 and BNO055, usually read over I2C.', P('imu')),
      card('Complementary strengths', 'The gyro is smooth short-term but drifts. The accelerometer is noisy short-term but does not drift. A complementary filter blends them: angle = 0.98 × (angle + gyro × Δt) + 0.02 × accelAngle.')
    ],
    [
      match('Match each IMU sensor to its weakness.', [['Gyroscope', 'Drifts over time'], ['Accelerometer', 'Noisy during motion'], ['Magnetometer', 'Disturbed by nearby metal and motors']], 'Fusion works because their weaknesses are different.'),
      mc('In a complementary filter, which sensor dominates the short-term angle estimate?', ['Gyroscope', 'Accelerometer', 'Magnetometer', 'Encoder'], 0, 'The high weight (e.g. 0.98) on the integrated gyro keeps the estimate smooth; the small accelerometer term slowly corrects drift.'),
      tf('A 9-DoF IMU includes a magnetometer for estimating heading.', true, 'The magnetometer senses Earth’s magnetic field, giving an absolute heading reference.'),
      code('Complete the complementary filter.', 'cpp', 'angle = 0.98 * (angle + gyroRate * dt)\n      + 0.02 * ___;', ['accelAngle', 'gyroRate', 'dt', 'angle'], 0, 'The small accelerometer term pulls the estimate toward the drift-free gravity reference.'),
      review('Review: on what bus are most hobby IMUs read?', ['I2C', 'PWM', 'Analog only', 'Power rails'], 0, 'Most IMU breakout boards use I2C (some also support SPI).')
    ]),

  lesson('robo-frames', 'Coordinate Frames', 'Inertial Sensing', 3, ['frames', 'transforms'],
    'World frame vs robot frame, and transforming points between them.',
    [
      card('Whose point of view?', 'The world frame is fixed to the room. The robot frame moves with the robot: x points forward, y to the left. A sensor reports obstacles in the robot frame; maps need them in the world frame.', S('frames')),
      card('Pose', 'A 2D robot pose is (x, y, θ). To move a point from robot to world: rotate it by θ, then add the robot’s (x, y).')
    ],
    [
      concept('A distance sensor reports “obstacle 50 cm straight ahead”. This position is expressed in the…', ['Robot frame', 'World frame', 'Camera’s pixel frame', 'Map frame'], 0, '“Straight ahead” is relative to the robot, so it is in the robot frame.'),
      num('A robot at world (2, 3) facing along the world +x axis (θ = 0) sees a point 1 m straight ahead. What is the point’s world x?', 3, 'm', 'With θ = 0 the frames align: world x = 2 + 1 = 3 m (y stays 3).'),
      predict('The same robot at (2, 3) now faces +y (θ = 90°). A point 1 m straight ahead is at world…', ['(2, 4)', '(3, 3)', '(1, 3)', '(2, 2)'], 0, 'Facing +y, “ahead” is +y: (2, 3 + 1) = (2, 4).'),
      tf('In the common robot convention, the robot frame’s x-axis points forward.', true, 'ROS (REP-103) uses x forward, y left, z up for the body frame.'),
      fill('A 2D pose has three numbers: x, y and ___.', ['θ', 'theta', 'heading', 'yaw'], 'The third number is the heading angle θ (yaw).', { bank: ['θ', 'z', 'speed', 'mass'] })
    ]),

  lesson('robo-odometry', 'Odometry', 'Inertial Sensing', 3, ['odometry', 'encoders', 'diff-drive'],
    'Estimating position from wheel motion — and why errors grow.',
    [
      card('Dead reckoning', 'Odometry estimates the pose by integrating wheel motion. For a differential-drive robot: distance = (dL + dR) ÷ 2, rotation = (dR − dL) ÷ wheelbase.', S('odometry')),
      card('Errors accumulate', 'Wheel slip, uneven floors and small wheel-size errors add up. Without correction, the estimate wanders further from the truth the longer you drive.')
    ],
    [
      num('Left wheel moved 10 cm, right wheel 14 cm. How far did the robot’s centre travel?', 12, 'cm', '(10 + 14) ÷ 2 = 12 cm.'),
      num('Left = 10 cm, right = 14 cm, wheelbase = 20 cm. What is the rotation in radians?', 0.2, 'rad', '(14 − 10) ÷ 20 = 0.2 rad (≈ 11.5°), turning left.'),
      predict('Both wheels report exactly the same distance. The robot…', ['Drives straight', 'Turns left', 'Turns right', 'Spins in place'], 0, 'Equal wheel distances give zero rotation — a straight line.'),
      tf('Odometry error stays constant no matter how far the robot drives.', false, 'Odometry errors accumulate. Long drives need correction from other sensors (that is localization).'),
      mc('Which is a common cause of odometry error?', ['Wheel slip on smooth floors', 'Too many encoder ticks', 'Using a gyroscope', 'A fully charged battery'], 0, 'If a wheel slips, the encoder counts motion that did not happen.')
    ]),

  /* ---------------- Unit 5: Control ---------------- */
  lesson('robo-feedback', 'Feedback', 'Control', 1, ['feedback', 'control'],
    'Measuring the result and using it to correct the action.',
    [
      card('Closing the loop', 'Feedback means measuring what actually happened and using the difference from what you wanted — the error — to adjust. You do it every time you steer a bike.', D('feedback-loop', { closed: true })),
      card('Error = target − measured', 'The setpoint is the target. The measurement is what the sensor says. Their difference drives the controller.')
    ],
    [
      num('Target speed is 100 RPM; the encoder measures 85 RPM. What is the error?', 15, 'RPM', 'Error = setpoint − measurement = 100 − 85 = 15 RPM.'),
      order('Put one cycle of a feedback loop in order.', ['Read the sensor', 'Compute error = target − measured', 'Compute the correction', 'Apply it to the actuator'], 'This cycle repeats many times per second.'),
      concept('A thermostat switches the heater on when the room is below 20 °C. The 20 °C is the…', ['Setpoint', 'Error', 'Disturbance', 'Actuator'], 0, 'The setpoint is the desired value the system tries to reach.'),
      tf('Negative feedback reduces the error over time.', true, 'Corrections push against the error, so a well-tuned loop converges on the target.')
    ]),

  lesson('robo-open-loop', 'Open-Loop Control', 'Control', 1, ['open-loop', 'control'],
    'Acting without measuring — simple, but blind to disturbances.',
    [
      card('No feedback', 'Open-loop control sends a command and assumes it worked: “run the motor at 60% for 2 seconds and we should have moved 50 cm.” No sensor checks the result.', D('feedback-loop', { closed: false })),
      card('When it works', 'Open-loop is fine when the system is predictable and disturbances are small — like a toaster timer or a lightly loaded stepper.')
    ],
    [
      scenario('A robot drives forward “for 2 seconds” to travel 1 m. On carpet it only travels 70 cm. Why?', ['Open-loop control cannot detect the extra friction', 'The timer ran fast', 'Carpet makes motors spin faster', 'The encoders were too accurate'], 0, 'Without measuring distance, the robot cannot notice or correct the slowdown.'),
      multi('Which are examples of open-loop control?', ['A microwave running for 90 s', 'Cruise control holding 60 km/h', 'A stepper moving 200 steps with no encoder', 'A thermostat'], [0, 2], 'Cruise control and thermostats measure and correct — they are closed-loop.'),
      tf('Open-loop control is always worse than closed-loop.', false, 'Open-loop is simpler, cheaper and cannot become unstable. It is the right choice when the system is predictable.'),
      review('Review: why can a stepper motor often run open-loop?', ['Each step pulse moves a known angle', 'It has a built-in camera', 'It never draws current', 'It always has an encoder'], 0, 'Counting steps gives position — as long as no steps are skipped.')
    ]),

  lesson('robo-closed-loop', 'Closed-Loop Control', 'Control', 2, ['closed-loop', 'control'],
    'Bang-bang and proportional control: correcting based on measurements.',
    [
      card('Bang-bang', 'The simplest closed-loop controller: if below target → full on; if above → off. It works, but it oscillates around the target.'),
      card('Proportional', 'A proportional (P) controller makes the correction proportional to the error: output = Kp × error. Big error, big correction; small error, gentle correction.', S('line-follow'))
    ],
    [
      num('A P-controller has Kp = 2 and the error is 15. What is the output?', 30, undefined, 'Output = Kp × error = 2 × 15 = 30.'),
      mc('What is the typical drawback of bang-bang control?', ['It oscillates around the target', 'It never moves', 'It requires a GPS', 'It is very complex'], 0, 'Full-on/full-off overshoots in both directions, causing a constant wobble.'),
      predict('You increase Kp a lot in a line follower. What usually happens?', ['It reacts harder and starts to wobble or oscillate', 'It becomes perfectly smooth', 'It stops following', 'Nothing changes'], 0, 'Too much gain over-corrects, swinging back and forth across the line.'),
      tf('Cruise control in a car is an example of closed-loop control.', true, 'It measures actual speed and adjusts the throttle to hold the setpoint.'),
      code('Complete a proportional controller.', 'cpp', 'float error = target - measured;\nfloat output = ___ * error;', ['Kp', 'Ki', 'target', 'dt'], 0, 'The proportional gain Kp scales the error into an actuator command.')
    ]),

  lesson('robo-pid', 'PID Control', 'Control', 3, ['pid', 'control'],
    'Proportional, Integral and Derivative terms — and how to tune them.',
    [
      card('Three terms', 'PID output = Kp·error + Ki·∑error·Δt + Kd·Δerror/Δt. P reacts to the present error, I to the accumulated past error, D to the predicted future (rate of change).', S('pid')),
      card('Tuning intuition', 'Raise Kp for faster response (too much → oscillation). Add Ki to remove steady-state offset (too much → overshoot). Add Kd to damp overshoot (too much → jitter from noise).')
    ],
    [
      match('Match each PID term to its job.', [['P', 'Reacts to the current error'], ['I', 'Removes steady-state error'], ['D', 'Damps overshoot by reacting to the rate of change']], 'Each term looks at a different moment in time: present, past, future.'),
      diagram('This response settles BELOW the setpoint and stays there. Which term helps most?', ['Increase Ki (integral)', 'Increase Kd only', 'Remove Kp', 'Lower the setpoint'], 0, 'A persistent offset is exactly what the integral term accumulates and removes.', { visual: D('step-response', { kind: 'offset' }) }),
      diagram('This response overshoots and rings before settling. What usually helps?', ['Add or increase Kd', 'Increase Kp a lot', 'Increase Ki a lot', 'Remove the sensor'], 0, 'The derivative term opposes rapid changes, damping the oscillation.', { visual: D('step-response', { kind: 'over' }) }),
      scenario('Your robot’s heading PID jitters violently once you add Kd. What is the likely cause?', ['D amplifies sensor noise', 'Ki is too small', 'The battery is full', 'The setpoint is zero'], 0, 'Noise produces fast changes in error; D multiplies them. Filter the measurement or lower Kd.'),
      fill('The integral term can “wind up” when the actuator is saturated, so we add anti-___.', ['windup', 'wind-up'], 'Anti-windup limits or freezes the integral while the output is maxed out.', { bank: ['windup', 'noise', 'drift', 'gain'] })
    ]),

  /* ---------------- Unit 6: Autonomy ---------------- */
  lesson('robo-path-planning', 'Path Planning', 'Autonomy', 3, ['planning', 'algorithms'],
    'Finding a route through a map: grids, BFS, Dijkstra and A*.',
    [
      card('Maps as grids', 'A simple map is an occupancy grid: each cell is free or blocked. Path planning finds a sequence of free cells from start to goal.', D('grid-path')),
      card('A* search', 'A* explores cells in order of f = g + h: g is the cost so far, h is a heuristic estimate of the remaining distance (e.g. Manhattan distance). A good heuristic means fewer cells explored.')
    ],
    [
      num('On a 4-connected grid, what is the Manhattan distance from (1, 1) to (4, 5)?', 7, 'cells', '|4 − 1| + |5 − 1| = 3 + 4 = 7.'),
      mc('What does the heuristic h in A* estimate?', ['Cost remaining to reach the goal', 'Cost already travelled', 'Battery level', 'Number of obstacles'], 0, 'h guides the search toward the goal. g tracks the cost so far.'),
      tf('Breadth-first search finds the shortest path on a grid where every move costs the same.', true, 'BFS expands in rings of equal distance, so the first time it reaches the goal is via a shortest path.'),
      diagram('In this grid the robot (S) must reach the goal (G). Why does the path bend?', ['It routes around blocked cells', 'Diagonal moves are forbidden by gravity', 'The goal moves', 'The robot prefers turning'], 0, 'Planners only use free cells, so the route detours around the obstacle wall.', { visual: D('grid-path') }),
      review('Review: once a path is planned, which control idea keeps the robot on it?', ['Feedback control on the path error', 'Open-loop timing only', 'Turning off the sensors', 'A voltage divider'], 0, 'Following a path is a control problem: measure deviation, correct it.')
    ]),

  lesson('robo-obstacle-avoidance', 'Obstacle Avoidance', 'Autonomy', 2, ['obstacles', 'reactive'],
    'Reactive behaviours that keep a robot from crashing.',
    [
      card('React fast', 'Reactive avoidance maps sensor readings straight to actions: if something is closer than a threshold, slow down and turn away. No map needed.', S('wall-follow')),
      card('Tune the thresholds', 'Stopping distance depends on speed. A faster robot needs a larger safety margin and earlier braking.')
    ],
    [
      code('Complete the reactive rule.', 'cpp', 'if (distanceCm ___ 20) {\n  turnRight();\n} else {\n  driveForward();\n}', ['<', '>', '==', '!='], 0, 'Turn when the obstacle is CLOSER than 20 cm, otherwise keep driving.'),
      scenario('A fast robot keeps hitting walls even though it “sees” them. What should you change first?', ['Increase the stopping distance or reduce speed', 'Lower the sensor update rate', 'Remove the sensor', 'Paint the walls'], 0, 'At higher speed the robot needs more distance to react and brake.'),
      mc('A robot stuck forever between two walls, turning left then right, is showing…', ['Oscillation between competing reactions', 'Perfect behaviour', 'Odometry drift', 'A short circuit'], 0, 'Pure reactive rules can get trapped. Adding randomness, memory or planning helps escape.'),
      tf('Reactive obstacle avoidance requires a full map of the environment.', false, 'Reactive behaviours use only the current sensor readings.')
    ]),

  lesson('robo-localization', 'Localization', 'Autonomy', 3, ['localization', 'probability'],
    'Answering “where am I?” using a map and sensors.',
    [
      card('Where am I?', 'Localization estimates the robot’s pose within a known map. Odometry predicts motion; sensor readings compared against the map correct the prediction.'),
      card('Particles', 'A particle filter tracks many guesses (particles). Each moves with odometry; guesses that agree with sensor readings get more weight, the rest die out.')
    ],
    [
      order('Order one cycle of a particle filter.', ['Move each particle using odometry', 'Compare each particle’s expected reading with the real sensor', 'Weight particles by how well they match', 'Resample: keep likely particles, drop unlikely ones'], 'Predict, update, resample — repeated every step.'),
      mc('What does localization need that pure odometry does not?', ['A map and external sensor readings', 'More wheels', 'A faster motor', 'A brighter LED'], 0, 'Comparing observations with a map gives absolute corrections that stop drift.'),
      tf('Localization can correct accumulated odometry drift.', true, 'Matching the map resets the error instead of letting it grow forever.'),
      scenario('A robot sees a door 2 m to its left. There are two such doors in the map. What should a good localizer do?', ['Keep both hypotheses until more evidence arrives', 'Pick one at random and forget the other', 'Shut down', 'Ignore the sensor'], 0, 'Multimodal beliefs are exactly what particle filters handle well — the next distinctive landmark resolves it.')
    ]),

  lesson('robo-sensor-fusion', 'Sensor Fusion', 'Autonomy', 3, ['fusion', 'kalman'],
    'Combining imperfect sensors into a better estimate.',
    [
      card('Better together', 'Sensor fusion combines measurements so the result is more accurate than any single sensor. Wheel odometry + IMU + GPS is a classic example.', D('sensor-fusion')),
      card('Weighting by trust', 'A Kalman filter weights each source by its uncertainty: trust precise sensors more, noisy ones less. A complementary filter is a simpler cousin.')
    ],
    [
      mc('In fusion, a sensor with lower noise should get…', ['More weight', 'Less weight', 'Zero weight', 'Equal weight always'], 0, 'Lower uncertainty means the reading is more trustworthy.'),
      num('Two equally trustworthy sensors read 10.0 m and 10.4 m. With equal weights, what is the fused estimate?', 10.2, 'm', 'An equal-weight average: (10.0 + 10.4) ÷ 2 = 10.2 m.'),
      match('Match the sensor to its role in a typical outdoor robot.', [['Wheel encoders', 'Smooth short-term motion'], ['IMU', 'Fast orientation changes'], ['GPS', 'Absolute position, slow and noisy']], 'Each sensor covers another’s weakness.'),
      tf('The Kalman filter keeps track of both the estimate and its uncertainty.', true, 'It maintains a mean and covariance, updating both as predictions and measurements arrive.'),
      review('Review: which simple filter blends gyro and accelerometer angles?', ['Complementary filter', 'Voltage divider', 'Low-side switch', 'A* search'], 0, 'The complementary filter weights the gyro short-term and the accelerometer long-term.')
    ]),

  lesson('robo-slam', 'SLAM', 'Autonomy', 3, ['slam', 'mapping'],
    'Simultaneous Localization and Mapping — building the map while using it.',
    [
      card('The chicken-and-egg problem', 'To localize you need a map; to build a map you need to know where you are. SLAM solves both at once, estimating the map and the robot pose together.'),
      card('Loop closure', 'When a robot recognises a place it has visited before, it can “close the loop” and correct the drift accumulated along the way — the map snaps into shape.')
    ],
    [
      mc('What does SLAM stand for?', ['Simultaneous Localization and Mapping', 'Sensor Logic and Motion', 'Serial Link Access Module', 'Smart Lidar Auto Mapping'], 0, 'SLAM builds the map and localizes within it at the same time.'),
      concept('A robot returns to its charging dock, recognises it, and corrects its whole trajectory. This is called…', ['Loop closure', 'Dead reckoning', 'Bang-bang control', 'Debouncing'], 0, 'Recognising a revisited place lets SLAM distribute the accumulated error back along the path.'),
      multi('Which sensors are commonly used for SLAM?', ['Lidar', 'Cameras', 'Depth cameras', 'A single push button'], [0, 1, 2], 'Lidar, monocular/stereo and depth cameras all give rich observations of the environment.'),
      tf('Robot vacuums that build a floor plan of your home use a form of SLAM.', true, 'Many use lidar or camera-based SLAM to map rooms and plan cleaning routes.')
    ]),

  lesson('robo-navigation', 'Robot Navigation', 'Autonomy', 3, ['navigation', 'planning', 'systems'],
    'Putting it all together: localize, plan, follow, avoid.',
    [
      card('The navigation stack', 'Autonomous navigation layers the skills you have learned: localization says where you are, a global planner finds a route on the map, a local planner/controller follows it, and reactive avoidance handles surprises.', S('diff-drive')),
      card('Replanning', 'When the world changes — a person steps in front — the local planner reacts immediately, and the global planner may compute a new route.')
    ],
    [
      order('Order the navigation pipeline.', ['Localize on the map', 'Plan a global path to the goal', 'Follow the path with a controller', 'Avoid unexpected obstacles locally'], 'Each layer runs at its own rate; the controller and avoidance run fastest.'),
      match('Match the layer to the skill.', [['Localization', 'Particle filter'], ['Global planning', 'A* on an occupancy grid'], ['Path following', 'PID on heading error'], ['Avoidance', 'Stop if an obstacle is too close']], 'Navigation is the integration of everything in this track.'),
      scenario('A box is dropped onto the robot’s planned path. What should happen first?', ['The local layer slows/steers to avoid it, then the global path is updated', 'The robot drives through it', 'The robot reboots', 'The map is deleted'], 0, 'Fast local reactions keep it safe; replanning finds a new route around the change.'),
      tf('A differential-drive robot turns by running its wheels at different speeds.', true, 'Unequal wheel speeds create rotation; opposite speeds spin it in place.'),
      debug('A robot reaches the goal in simulation but drifts off the path in the real world. What is the most likely missing piece?', ['Localization corrections — it relies on odometry alone', 'A bigger map', 'More PWM frequency', 'A brighter LED'], 0, 'In simulation odometry is perfect. In reality it drifts, so the robot needs localization to stay on the path.')
    ])
];
