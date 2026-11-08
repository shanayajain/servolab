import { card, C, code, concept, debug, fill, lesson, match, mc, multi, num, order, predict, review, scenario, tf } from './builders';

export const programmingLessons = [
  /* ---------------- Unit 1: Python Basics ---------------- */
  lesson('prog-variables', 'Variables', 'Python Basics', 1, ['variables', 'python'],
    'Naming and storing values so your program can use them.',
    [
      card('Named boxes', 'A variable is a name bound to a value. In Python you create one by assigning it: speed = 120. You can reassign it later: speed = speed + 10.', C('speed = 120\nspeed = speed + 10\nprint(speed)  # 130', 'python')),
      card('Good names', 'Use descriptive snake_case names in Python: left_motor_speed beats lms. Names cannot start with a digit or contain spaces.')
    ],
    [
      predict('What does this print?', ['15', '10', '5', 'x + 5'], 0, 'x starts at 10, then x = x + 5 makes it 15.', { visual: C('x = 10\nx = x + 5\nprint(x)', 'python') }),
      multi('Which are valid Python variable names?', ['motor_speed', '2fast', 'distanceCm', 'left motor'], [0, 2], 'Names cannot start with a digit or contain spaces.'),
      code('Store the distance reading in a variable.', 'python', 'distance_cm ___ 42', ['=', '==', ':', '->'], 0, 'A single = assigns; == compares.'),
      tf('In Python, = and == mean the same thing.', false, '= assigns a value; == tests equality and returns True or False.')
    ]),

  lesson('prog-data-types', 'Data Types', 'Python Basics', 1, ['types', 'python', 'cpp'],
    'Integers, floats, strings and booleans — in Python and C++.',
    [
      card('Kinds of values', 'int: whole numbers (3). float: decimals (3.14). str: text ("hello"). bool: True or False. Python works out types itself; C++ asks you to declare them.', C('int ticks = 0;\nfloat speed = 1.5;\nbool running = true;\nchar grade = \'A\';')),
      card('Integer division', 'Python: 7 / 2 = 3.5 but 7 // 2 = 3. C++: 7 / 2 = 3 for ints — a classic bug when computing ratios.')
    ],
    [
      match('Match each value to its type.', [['42', 'int'], ['3.3', 'float'], ['"rover"', 'str'], ['True', 'bool']], 'Each type supports different operations.'),
      predict('In C++, what is the value of result?', ['2', '2.5', '3', '0'], 0, 'Both operands are ints, so integer division discards the fraction even though result is a float.', { visual: C('int a = 5;\nint b = 2;\nfloat result = a / b;') }),
      code('Make the division keep its decimal part in C++.', 'cpp', 'float ratio = a / ___(b);', ['(float)', 'int', 'bool', 'char'], 0, 'Casting one operand to float makes the division happen in floating point.'),
      predict('What does Python print?', ['3', '3.5', '4', '3.0'], 0, '// is floor division, so 7 // 2 = 3.', { visual: C('print(7 // 2)', 'python') }),
      tf('In C++, you must declare a variable’s type before using it.', true, 'C++ is statically typed: int, float, bool and so on are declared up front (or deduced with auto).')
    ]),

  lesson('prog-conditionals', 'Conditionals', 'Python Basics', 1, ['if', 'logic'],
    'if / elif / else — making decisions in code.',
    [
      card('Branching', 'Conditionals run code only when a condition is true. Python uses if, elif and else with indentation; C++ uses if, else if, else with braces.', C('if distance < 20:\n    turn()\nelif distance < 50:\n    slow_down()\nelse:\n    drive()', 'python'))
    ],
    [
      predict('distance = 35. Which function runs?', ['slow_down()', 'turn()', 'drive()', 'None of them'], 0, '35 is not < 20, but it is < 50, so the elif branch runs.', { visual: C('if distance < 20:\n    turn()\nelif distance < 50:\n    slow_down()\nelse:\n    drive()', 'python') }),
      code('Stop when the battery is below 6.5 V.', 'python', 'if battery_v ___ 6.5:\n    stop_motors()', ['<', '>', '=', '=>'], 0, '< means “less than”. Note that = is assignment and => is not a Python operator.'),
      debug('This C++ code always prints “close”. Why?', ['= assigns 10 instead of comparing; use ==', 'cout is misspelled', 'The braces are missing', 'distance must be a float'], 0, 'if (distance = 10) assigns 10, which is non-zero → always true.', { visual: C('if (distance = 10) {\n  cout << "close";\n}') }),
      tf('In Python, the code inside an if block must be indented.', true, 'Python uses indentation to define blocks instead of braces.')
    ]),

  lesson('prog-loops', 'Loops', 'Python Basics', 1, ['loops', 'iteration'],
    'for and while loops — repeating work.',
    [
      card('Repeat', 'A for loop repeats a known number of times or over a collection. A while loop repeats as long as a condition holds.', C('for i in range(3):\n    print(i)   # 0, 1, 2\n\nwhile distance() > 20:\n    drive()', 'python')),
      card('In C++', 'for (int i = 0; i < 3; i++) { … } — start, condition, step.')
    ],
    [
      predict('How many times does this loop print?', ['5', '4', '6', '0'], 0, 'range(5) produces 0, 1, 2, 3, 4 — five values.', { visual: C('for i in range(5):\n    print("tick")', 'python') }),
      num('What is the final value of total?', 10, undefined, '0 + 1 + 2 + 3 + 4 = 10.', { visual: C('total = 0\nfor i in range(5):\n    total += i', 'python') }),
      code('Loop 8 times in C++.', 'cpp', 'for (int i = 0; i ___ 8; i++) {\n  blink();\n}', ['<', '<=', '>', '=='], 0, 'i takes 0..7 — eight iterations. <= 8 would run nine times.'),
      debug('This loop never ends. Why?', ['count is never increased', 'while needs brackets', 'print is wrong', '5 is too small'], 0, 'The condition count < 5 stays true forever because count never changes.', { visual: C('count = 0\nwhile count < 5:\n    print(count)', 'python') }),
      tf('Arduino’s loop() function is itself an infinite loop that the framework calls repeatedly.', true, 'The Arduino core calls loop() again and again after setup().')
    ]),

  lesson('prog-functions', 'Functions', 'Python Basics', 2, ['functions', 'abstraction'],
    'Packaging reusable logic with parameters and return values.',
    [
      card('Reusable blocks', 'A function takes inputs (parameters), does work and optionally returns a result. Functions make code readable and testable.', C('def ticks_to_cm(ticks, ticks_per_rev=20, wheel_cm=20.4):\n    return ticks / ticks_per_rev * wheel_cm', 'python')),
      card('In C++', 'C++ functions declare parameter and return types: float ticksToCm(long ticks) { … }. void means “returns nothing”.')
    ],
    [
      num('What does ticks_to_cm(40) return with the defaults (20 ticks/rev, 20.4 cm wheel)?', 40.8, 'cm', '40 ÷ 20 = 2 revolutions × 20.4 = 40.8 cm.'),
      code('Return the average of two readings.', 'python', 'def average(a, b):\n    ___ (a + b) / 2', ['return', 'print', 'yield', 'def'], 0, 'return sends the value back to the caller; print only displays it.'),
      mc('What does void mean as a C++ return type?', ['The function returns no value', 'The function returns 0', 'The function is empty', 'The function is private'], 0, 'void functions perform actions but return nothing.'),
      tf('A function that prints a value is the same as one that returns it.', false, 'Printed values go to the screen; returned values can be stored and used by your program.')
    ]),

  /* ---------------- Unit 2: Collections ---------------- */
  lesson('prog-lists', 'Lists', 'Collections', 1, ['lists', 'python'],
    'Python lists: ordered, indexable and growable.',
    [
      card('Ordered collections', 'A list holds items in order: readings = [12, 15, 11]. Index from 0: readings[0] is 12. Negative indices count from the end: readings[-1] is 11.', C('readings = [12, 15, 11]\nreadings.append(14)\nprint(len(readings))  # 4', 'python'))
    ],
    [
      predict('What does readings[1] give?', ['15', '12', '11', 'An error'], 0, 'Indexing starts at 0, so index 1 is the second item.', { visual: C('readings = [12, 15, 11]', 'python') }),
      code('Add a new reading to the end of the list.', 'python', 'readings.___(18)', ['append', 'add', 'push', 'insert_end'], 0, 'list.append(x) adds an item at the end.'),
      num('What does sum(readings) / len(readings) give for [10, 20, 30, 40]?', 25, undefined, '100 ÷ 4 = 25 — the average.'),
      predict('What is readings[-1] for [4, 8, 15, 16]?', ['16', '4', '15', 'An error'], 0, 'Negative indices count backwards from the end.')
    ]),

  lesson('prog-dictionaries', 'Dictionaries', 'Collections', 2, ['dictionaries', 'python'],
    'Key–value lookups for named data.',
    [
      card('Look things up by name', 'A dictionary maps keys to values: pins = {"left": 5, "right": 6}. Access with pins["left"]. Great for configuration and sensor readings by name.', C('robot = {"name": "Rover", "speed": 120}\nrobot["speed"] = 150\nprint(robot.get("battery", 0))  # 0', 'python'))
    ],
    [
      predict('What does pins["right"] return?', ['6', '5', '"right"', 'An error'], 0, 'The key "right" maps to 6.', { visual: C('pins = {"left": 5, "right": 6}', 'python') }),
      mc('What happens with robot["battery"] if the key does not exist?', ['A KeyError is raised', 'It returns 0', 'It returns None silently', 'It creates the key'], 0, 'Square-bracket lookup raises KeyError; use .get(key, default) for a safe default.'),
      code('Update the speed setting.', 'python', 'config["speed"] ___ 200', ['=', '==', '+', ':'], 0, 'Assigning to a key adds or updates it.'),
      tf('Dictionary keys must be unique.', true, 'Assigning to an existing key replaces its value.')
    ]),

  lesson('prog-arrays', 'Arrays in C++', 'Collections', 2, ['arrays', 'cpp'],
    'Fixed-size arrays in C/C++ and staying within bounds.',
    [
      card('Fixed size', 'In C/C++, int samples[5]; reserves exactly five ints in a row in memory. Indices run 0–4. The size cannot change.', C('int samples[5] = {3, 7, 2, 9, 4};\nint total = 0;\nfor (int i = 0; i < 5; i++) {\n  total += samples[i];\n}')),
      card('No bounds checking', 'C++ will happily let you read samples[5] — past the end — corrupting other memory. These bugs are notoriously hard to find on microcontrollers.')
    ],
    [
      num('What is total after the loop for {3, 7, 2, 9, 4}?', 25, undefined, '3 + 7 + 2 + 9 + 4 = 25.'),
      debug('This sometimes corrupts another variable. Why?', ['The loop writes samples[5], which is out of bounds', 'The array is too small to compile', 'int cannot hold 0', 'i++ is wrong'], 0, 'i <= 5 reaches index 5, one past the end of a 5-element array.', { visual: C('int samples[5];\nfor (int i = 0; i <= 5; i++) {\n  samples[i] = 0;\n}') }),
      mc('Compared to a Python list, a C++ built-in array…', ['Has a fixed size set at compile time', 'Grows automatically', 'Checks bounds for you', 'Can only hold strings'], 0, 'Use std::vector (or std::array) when you want size-awareness.'),
      tf('The last valid index of int a[10] is 10.', false, 'Valid indices are 0 to 9.')
    ]),

  /* ---------------- Unit 3: Objects & Memory ---------------- */
  lesson('prog-classes', 'Classes', 'Objects & Memory', 2, ['classes', 'oop', 'cpp'],
    'Bundling data and behaviour into a blueprint.',
    [
      card('Blueprints', 'A class defines data (members) and functions (methods) that belong together. A Motor class might hold its pins and offer setSpeed().', C('class Motor {\npublic:\n  Motor(int pwmPin, int dirPin);\n  void setSpeed(int speed);\nprivate:\n  int pwmPin, dirPin;\n};')),
      card('Encapsulation', 'Keep data private and expose a clean public interface. Callers use motor.setSpeed(100) without knowing which pins it toggles.')
    ],
    [
      concept('Hiding a class’s internal pins behind public methods is called…', ['Encapsulation', 'Inheritance', 'Compilation', 'Debouncing'], 0, 'Encapsulation protects internals and keeps the interface simple.'),
      match('Match the term to its meaning.', [['Class', 'A blueprint for objects'], ['Method', 'A function belonging to a class'], ['Constructor', 'Runs when an object is created'], ['private', 'Accessible only inside the class']], 'These are the core vocabulary of object-oriented code.'),
      code('Define a Python class with an initialiser.', 'python', 'class Motor:\n    def ___(self, pin):\n        self.pin = pin', ['__init__', 'init', 'constructor', 'setup'], 0, 'Python calls __init__ when a new object is created.'),
      tf('In C++, members declared private can be read directly from outside the class.', false, 'Only the class’s own methods (and friends) can access private members.')
    ]),

  lesson('prog-objects', 'Objects', 'Objects & Memory', 2, ['objects', 'oop'],
    'Creating instances and calling their methods.',
    [
      card('Instances', 'An object is one instance of a class. Two Motor objects share the same code but each keeps its own pins and speed.', C('Motor left(5, 4);\nMotor right(6, 7);\nleft.setSpeed(120);\nright.setSpeed(120);')),
      card('self / this', 'Inside a method, Python’s self (C++’s this) refers to the specific object the method was called on.')
    ],
    [
      predict('After this code, what is right.speed?', ['0', '150', '300', 'Undefined'], 0, 'Each object has its own data. Only left was changed.', { visual: C('class Motor:\n    def __init__(self):\n        self.speed = 0\n\nleft = Motor()\nright = Motor()\nleft.speed = 150', 'python') }),
      num('How many Motor objects does this code create?', 4, 'objects', 'Each call to Motor() creates one new instance.', { visual: C('wheels = [Motor() for _ in range(4)]', 'python') }),
      code('Call the method that sets the speed.', 'cpp', 'left___setSpeed(200);', ['.', '->', '::', ','], 0, 'Use . to call a method on an object; -> is used on a pointer to an object.'),
      tf('In Python, self refers to the current object inside a method.', true, 'self is passed automatically when you call obj.method().')
    ]),

  lesson('prog-pointers', 'Pointers', 'Objects & Memory', 3, ['pointers', 'cpp', 'memory'],
    'Variables that hold memory addresses.',
    [
      card('Addresses', 'A pointer stores the address of another variable. & takes an address; * dereferences (reads or writes the value at that address).', C('int speed = 100;\nint* p = &speed;   // p holds the address of speed\n*p = 150;          // speed is now 150')),
      card('Danger zone', 'An uninitialised pointer, or one that outlives its target, points at garbage. Initialise pointers (nullptr) and check before using them.')
    ],
    [
      predict('What is speed after this code?', ['150', '100', 'The address', '0'], 0, 'Writing through *p changes the variable p points to.', { visual: C('int speed = 100;\nint* p = &speed;\n*p = 150;') }),
      match('Match the symbol to its meaning.', [['&x', 'Address of x'], ['*p', 'Value at the address p holds'], ['int* p', 'Declares a pointer to int'], ['nullptr', 'A pointer to nothing']], 'Pointers are a handful of operators applied consistently.'),
      code('Call a method through a pointer to an object.', 'cpp', 'Motor* m = &left;\nm___setSpeed(80);', ['->', '.', '&', '*'], 0, 'p->method() is shorthand for (*p).method().'),
      tf('Dereferencing a null pointer is safe and returns 0.', false, 'It is undefined behaviour — usually a crash or, on small MCUs, silent corruption.')
    ]),

  lesson('prog-references', 'References', 'Objects & Memory', 3, ['references', 'cpp'],
    'Aliases for existing variables, and pass-by-reference.',
    [
      card('Another name', 'A reference is an alias: int& r = speed; makes r another name for speed. Unlike a pointer it cannot be null or re-seated.'),
      card('Pass by reference', 'Passing a large object by const reference avoids copying it; passing by non-const reference lets a function modify the caller’s variable.', C('void boost(int& s) { s += 10; }\nint speed = 100;\nboost(speed);   // speed == 110'))
    ],
    [
      predict('After boost(speed), what is speed?', ['110', '100', '10', 'Error'], 0, 'The reference parameter modifies the caller’s variable directly.', { visual: C('void boost(int& s) { s += 10; }\nint speed = 100;\nboost(speed);') }),
      predict('What if the parameter were int s (no &)?', ['speed stays 100', 'speed becomes 110', 'Compile error', 'speed becomes 10'], 0, 'Pass-by-value works on a copy, so the caller’s variable is unchanged.'),
      mc('Why pass a large sensor-data struct as const SensorData&?', ['Avoids copying it and prevents modification', 'Makes it faster to type', 'Stores it in flash', 'Required for all structs'], 0, 'const reference = no copy, read-only access.'),
      tf('A C++ reference can be null.', false, 'References must be bound to a valid object when created.')
    ]),

  lesson('prog-memory', 'Memory: Stack & Heap', 'Objects & Memory', 3, ['memory', 'stack', 'heap'],
    'Where variables live, and why embedded code avoids the heap.',
    [
      card('Stack', 'Local variables live on the stack: fast, automatic, freed when the function returns. Deep recursion or big local arrays can overflow it.'),
      card('Heap', 'new/malloc allocate on the heap; you must delete/free. On small MCUs, repeated allocations fragment the little RAM available, so firmware usually allocates once at start-up or not at all.')
    ],
    [
      match('Match where each variable lives.', [['A local int inside a function', 'Stack'], ['Memory from new or malloc', 'Heap'], ['A global variable', 'Static data area']], 'Each region has different lifetimes and costs.'),
      debug('This firmware crashes after running for a few hours. What is the likely cause?', ['Memory is allocated every loop but never freed (a leak)', 'The loop is too fast', 'delay() is missing', 'The pin is wrong'], 0, 'Every loop leaks 64 bytes until RAM is exhausted.', { visual: C('void loop() {\n  int* buffer = new int[16];\n  readSensors(buffer);\n}') }),
      tf('Python manages memory automatically with garbage collection.', true, 'Python frees objects that are no longer referenced — you never call free().'),
      scenario('You need a buffer of 256 sensor samples on an Arduino. What is the safest choice?', ['A fixed-size global or static array allocated once', 'new int[256] every loop', 'A recursive function', 'A String that grows each sample'], 0, 'Static allocation avoids fragmentation and makes RAM usage visible at compile time.')
    ]),

  /* ---------------- Unit 4: Robot Code ---------------- */
  lesson('prog-libraries', 'Libraries', 'Robot Code', 1, ['libraries', 'modules'],
    'Reusing tested code with #include and import.',
    [
      card('Stand on shoulders', 'Libraries package tested code for common jobs: Servo.h, Wire.h (I2C) and SPI.h in Arduino; math, time and machine in MicroPython.', C('#include <Servo.h>\n#include <Wire.h>')),
      card('Read the docs', 'A library’s README and examples tell you the functions, wiring and limits. Check that it supports your board.')
    ],
    [
      code('Import MicroPython’s hardware module.', 'python', 'from ___ import Pin, PWM', ['machine', 'arduino', 'hardware', 'robot'], 0, 'MicroPython exposes pins, PWM, ADC, I2C and more through the machine module.'),
      match('Match the Arduino library to its job.', [['Servo.h', 'Generate servo pulses'], ['Wire.h', 'I2C communication'], ['SPI.h', 'SPI communication']], 'Most sensors come with a library built on top of Wire or SPI.'),
      tf('Using a well-tested library is usually better than rewriting the same code yourself.', true, 'Libraries save time and avoid bugs — understand what they do, though.'),
      fill('In C++, you use a library header with #___ <Servo.h>', ['include'], 'The preprocessor pulls the header’s declarations into your file.', { bank: ['include', 'import', 'using', 'require'] })
    ]),

  lesson('prog-serial', 'Serial Communication', 'Robot Code', 1, ['serial', 'debugging'],
    'Printing data, reading commands and plotting values.',
    [
      card('Talk to your robot', 'Serial.begin(115200) starts the port. Serial.print / println send text. Serial.available() and Serial.read() receive bytes — perfect for simple commands like “F” for forward.', C('if (Serial.available()) {\n  char c = Serial.read();\n  if (c == \'F\') forward();\n}'))
    ],
    [
      code('Print the distance on its own line.', 'cpp', 'Serial.___(distanceCm);', ['println', 'begin', 'read', 'available'], 0, 'println adds a newline so each value appears on a separate line (and the Serial Plotter can graph it).'),
      predict('The PC sends the character "S". What happens?', ['stopMotors() runs', 'forward() runs', 'Nothing', 'Both run'], 0, 'The received char equals \'S\', so the second branch runs.', { visual: C("char c = Serial.read();\nif (c == 'F') forward();\nelse if (c == 'S') stopMotors();") }),
      mc('What does Serial.available() return?', ['How many received bytes are waiting to be read', 'Whether the USB cable is plugged in', 'The baud rate', 'The last character sent'], 0, 'Check it before reading so you never read from an empty buffer.'),
      review('Review: if your serial monitor shows garbage, check the…', ['Baud rate matches on both sides', 'LED polarity', 'Gear ratio', 'Ground plane'], 0, 'A baud-rate mismatch is the number-one cause of garbled serial output.')
    ]),

  lesson('prog-sensor-data', 'Working with Sensor Data', 'Robot Code', 2, ['sensors', 'filtering', 'data'],
    'Converting, validating and smoothing readings in code.',
    [
      card('Trust but verify', 'Real readings include glitches: an ultrasonic sensor may return 0 or a huge value when it misses an echo. Validate ranges before using them.', C('def valid(cm):\n    return 2 <= cm <= 400\n\nreadings = [r for r in raw if valid(r)]', 'python')),
      card('Smooth it', 'A moving average or median of the last few readings removes spikes. Medians are especially good at rejecting single wild values.')
    ],
    [
      num('What is the median of [21, 22, 400, 20, 23]?', 22, undefined, 'Sorted: 20, 21, 22, 23, 400. The middle value is 22 — the 400 spike is ignored.'),
      num('What is the mean of the same readings [21, 22, 400, 20, 23]?', 97.2, undefined, '486 ÷ 5 = 97.2 — one spike ruins the average. That is why medians help.'),
      code('Keep only readings within the sensor’s valid range.', 'python', 'clean = [r for r in raw if 2 <= r ___ 400]', ['<=', '>=', '==', '!='], 0, 'Chained comparison 2 <= r <= 400 keeps values in range.'),
      tf('A median filter is good at removing occasional large spikes.', true, 'Outliers end up at the ends of the sorted list and do not affect the middle.')
    ]),

  lesson('prog-motor-control', 'Motor Control Code', 'Robot Code', 2, ['motors', 'pwm', 'code'],
    'Writing clean functions to drive motors and differential steering.',
    [
      card('A tidy interface', 'Wrap the driver details in one function: setMotor(speed) with speed from −255 to 255. Sign gives direction; magnitude gives PWM.', C('void setMotor(int speed) {\n  digitalWrite(DIR_PIN, speed >= 0 ? HIGH : LOW);\n  analogWrite(PWM_PIN, abs(speed));\n}')),
      card('Differential steering', 'left = base + turn, right = base − turn. Positive turn steers right; equal and opposite speeds spin in place.')
    ],
    [
      code('Use the magnitude of speed for PWM.', 'cpp', 'analogWrite(PWM_PIN, ___(speed));', ['abs', 'map', 'sqrt', 'round'], 0, 'PWM needs a non-negative duty; direction is handled by DIR_PIN.'),
      num('base = 150, turn = 40. What is the left motor speed (left = base + turn)?', 190, undefined, '150 + 40 = 190.'),
      predict('setMotor(-120) is called. What happens?', ['DIR is LOW and the motor runs backwards at duty 120', 'The motor runs forward at 120', 'The motor stops', 'It does not compile'], 0, 'Negative speed selects LOW direction; abs(−120) = 120 sets the PWM.'),
      scenario('left = 100 and right = −100. What does a differential-drive robot do?', ['Spins in place', 'Drives straight', 'Stops', 'Drives in a big arc'], 0, 'Equal and opposite wheel speeds rotate the robot about its centre.')
    ]),

  lesson('prog-robotics-code', 'Structuring Robot Code', 'Robot Code', 3, ['architecture', 'state-machines', 'code'],
    'State machines and the sense–think–act loop in real firmware.',
    [
      card('State machines', 'Robots behave differently in different situations. A finite-state machine makes that explicit: each state has its own actions and rules for switching.', C('enum State { DRIVE, AVOID, STOP };\nState state = DRIVE;\n\nvoid loop() {\n  int d = readDistance();          // sense\n  switch (state) {                 // think\n    case DRIVE: if (d < 20) state = AVOID; break;\n    case AVOID: if (d > 40) state = DRIVE; break;\n    case STOP:  break;\n  }\n  applyOutputs(state);             // act\n}')),
      card('Non-blocking loop', 'Keep loop() fast: no long delays. Use millis() timers for periodic tasks so sensing and safety checks run constantly.')
    ],
    [
      predict('state = DRIVE and the distance is 15 cm. What is the next state?', ['AVOID', 'DRIVE', 'STOP', 'It crashes'], 0, '15 < 20, so DRIVE transitions to AVOID.'),
      mc('Why does AVOID switch back at 40 cm instead of 20 cm?', ['Hysteresis prevents rapid flip-flopping between states', 'It saves memory', 'Sensors only read even numbers', 'It is a typo'], 0, 'Different thresholds for entering and leaving a state (hysteresis) stop chattering at the boundary.'),
      order('Order the structure of one control loop iteration.', ['Read sensors', 'Update the state machine', 'Compute motor commands', 'Write outputs to the motors'], 'Sense → think → act, every iteration.'),
      tf('Long delay() calls inside loop() can make a robot miss obstacles.', true, 'While delayed, no sensors are read and no decisions are made.')
    ])
];
