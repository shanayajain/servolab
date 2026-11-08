import { card, C, code, concept, D, diagram, fill, lesson, match, mc, multi, num, order, predict, review, scenario, tf } from './builders';

export const architectureLessons = [
  /* ---------------- Unit 1: Data ---------------- */
  lesson('arch-bits', 'Bits', 'Data', 1, ['bits', 'binary'],
    'The bit: one binary digit, the smallest unit of information.',
    [
      card('On or off', 'A bit is a single binary digit: 0 or 1. In hardware it is a voltage — LOW or HIGH. Every number, letter, image and instruction is stored as patterns of bits.'),
      card('Counting possibilities', 'n bits can represent 2ⁿ different patterns. 1 bit → 2, 2 bits → 4, 3 bits → 8, 8 bits → 256.')
    ],
    [
      num('How many different values can 4 bits represent?', 16, 'values', '2⁴ = 16 patterns (0000 to 1111).'),
      tf('A single bit can store the value 2.', false, 'A bit only has two states, 0 and 1.'),
      num('What is the minimum number of bits needed to represent 100 distinct values?', 7, 'bits', '2⁶ = 64 is too few; 2⁷ = 128 is enough.'),
      mc('In a 5 V digital circuit, a logic 1 is usually represented by…', ['A HIGH voltage near 5 V', 'A LOW voltage near 0 V', 'Exactly 2.5 V', 'A negative voltage'], 0, 'HIGH ≈ VCC represents 1; LOW ≈ 0 V represents 0 (in positive logic).')
    ]),

  lesson('arch-bytes', 'Bytes', 'Data', 1, ['bytes', 'units'],
    'Grouping bits: bytes, nibbles and memory sizes.',
    [
      card('Eight bits', 'A byte is 8 bits and can hold 0–255 (unsigned). Half a byte is a nibble (4 bits). Memory is addressed in bytes.'),
      card('Bigger units', 'In memory sizes, 1 KB = 1024 bytes (a kibibyte, KiB). Data sizes such as 16-bit or 32-bit integers take 2 or 4 bytes.')
    ],
    [
      num('What is the largest unsigned value one byte can hold?', 255, undefined, '8 bits → 2⁸ = 256 values, from 0 to 255.'),
      match('Match each type to its size.', [['bit', '1 binary digit'], ['nibble', '4 bits'], ['byte', '8 bits'], ['uint32_t', '4 bytes']], 'Sizes double: 4, 8, 16, 32 bits…'),
      num('How many bytes are in 4 KiB?', 4096, 'bytes', '4 × 1024 = 4096 bytes.'),
      tf('An ASCII character such as "A" fits in one byte.', true, 'ASCII uses 7 bits per character; "A" is 65 (0x41).')
    ]),

  lesson('arch-binary', 'Binary & Hex', 'Data', 2, ['binary', 'hex', 'number-systems'],
    'Converting between decimal, binary and hexadecimal.',
    [
      card('Place values', 'Binary is base 2: each position is a power of two (… 8 4 2 1). 1011₂ = 8 + 0 + 2 + 1 = 11.', D('binary', { value: 11, bits: 4 })),
      card('Hexadecimal', 'Hex is base 16 (0–9, A–F). Each hex digit is exactly 4 bits, so a byte is two hex digits: 0xFF = 255, 0x41 = 65.')
    ],
    [
      num('What is binary 1011 in decimal?', 11, undefined, '8 + 0 + 2 + 1 = 11.', { visual: D('binary', { value: 11, bits: 4 }) }),
      num('What is binary 11111111 in decimal?', 255, undefined, 'All eight bits set: 128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = 255.'),
      num('What is 0x1F in decimal?', 31, undefined, '1 × 16 + 15 = 31.'),
      fill('Decimal 10 in binary is ___', ['1010', '0b1010', '00001010'], '8 + 2 = 10, so the bits are 1010.', { prompt: 'Convert to binary' }),
      diagram('Which decimal value is shown?', ['6', '3', '5', '12'], 0, 'Bits for 4 and 2 are set: 4 + 2 = 6.', { visual: D('binary', { value: 6, bits: 4 }) }),
      mc('Why do programmers like hex for byte values?', ['Each hex digit maps exactly to 4 bits', 'Hex numbers are smaller in memory', 'CPUs compute in base 16', 'It avoids negative numbers'], 0, 'Two hex digits show a byte compactly and map cleanly to its bits.')
    ]),

  /* ---------------- Unit 2: Logic ---------------- */
  lesson('arch-logic-gates', 'Logic Gates', 'Logic', 1, ['gates', 'logic'],
    'AND, OR, NOT, NAND, NOR and XOR — the building blocks of digital circuits.',
    [
      card('Simple rules', 'AND outputs 1 only if all inputs are 1. OR outputs 1 if any input is 1. NOT inverts. XOR outputs 1 if the inputs differ.', D('gate', { gate: 'AND', a: 1, b: 1 })),
      card('Universal gates', 'NAND (NOT-AND) and NOR are universal: any logic circuit can be built from only NAND gates, or only NOR gates.')
    ],
    [
      diagram('What is the output of this AND gate with inputs 1 and 0?', ['0', '1', 'Undefined', '2'], 0, 'AND only outputs 1 when every input is 1.', { visual: D('gate', { gate: 'AND', a: 1, b: 0 }) }),
      diagram('What is the output of this XOR gate with inputs 1 and 1?', ['0', '1', 'Undefined', '2'], 0, 'XOR outputs 1 only when the inputs are different.', { visual: D('gate', { gate: 'XOR', a: 1, b: 1 }) }),
      match('Match each gate to its rule.', [['AND', '1 only if all inputs are 1'], ['OR', '1 if any input is 1'], ['NOT', 'Inverts the input'], ['XOR', '1 if inputs differ']], 'These rules are summarised in truth tables.'),
      tf('NAND gates alone can build any digital logic circuit.', true, 'NAND is functionally complete — you can make NOT, AND and OR out of it.'),
      scenario('A robot should move only if the battery is OK AND no bumper is pressed. Which gate combines the two conditions?', ['AND', 'OR', 'XOR', 'NOR'], 0, 'Both conditions must be true at once, which is exactly AND.')
    ]),

  lesson('arch-boolean', 'Boolean Logic', 'Logic', 2, ['boolean', 'logic'],
    'Expressions, truth tables and De Morgan’s laws.',
    [
      card('Algebra of true/false', 'Boolean expressions combine variables with AND (·), OR (+) and NOT (¬ or ‾). In code: &&, || and !.'),
      card('De Morgan', 'NOT(A AND B) = (NOT A) OR (NOT B). NOT(A OR B) = (NOT A) AND (NOT B). Handy for simplifying conditions.')
    ],
    [
      predict('A = true, B = false. What is (A && !B)?', ['true', 'false', 'error', 'undefined'], 0, '!B is true, and A is true, so true && true = true.'),
      mc('By De Morgan’s law, !(A && B) equals…', ['!A || !B', '!A && !B', 'A || B', 'A && B'], 0, 'Negating an AND turns it into an OR of the negations.'),
      num('How many rows does a truth table with 3 inputs have?', 8, 'rows', '2³ = 8 input combinations.'),
      code('Stop if either bumper is pressed.', 'cpp', 'if (leftBump ___ rightBump) {\n  stopMotors();\n}', ['||', '&&', '!', '^'], 0, '|| (OR) is true if at least one bumper is pressed.'),
      tf('A AND (NOT A) is always false.', true, 'A value cannot be both true and false, so the expression is always 0.')
    ]),

  lesson('arch-combinational', 'Combinational Logic', 'Logic', 2, ['combinational', 'adders', 'mux'],
    'Circuits whose output depends only on current inputs: adders and multiplexers.',
    [
      card('No memory', 'Combinational circuits compute outputs purely from their present inputs — no stored state. Examples: adders, multiplexers, decoders, comparators.'),
      card('The half adder', 'Adding two bits: Sum = A XOR B, Carry = A AND B. Chain full adders to add whole numbers.')
    ],
    [
      match('For a half adder with A = 1, B = 1, match the outputs.', [['Sum', '0'], ['Carry', '1']], '1 + 1 = 10 in binary: sum bit 0, carry 1.'),
      mc('Which gate produces the SUM bit of a half adder?', ['XOR', 'AND', 'OR', 'NOT'], 0, 'The sum is 1 when exactly one input is 1 — that is XOR.'),
      concept('A circuit uses a 2-bit select input to choose one of four data inputs to pass to its output. It is a…', ['Multiplexer', 'Flip-flop', 'Register', 'Clock'], 0, 'A multiplexer (mux) selects one of many inputs.'),
      tf('A combinational circuit’s output depends on what its inputs were a second ago.', false, 'That would require memory — which makes it sequential, not combinational.')
    ]),

  lesson('arch-sequential', 'Sequential Logic', 'Logic', 2, ['sequential', 'flip-flops', 'clock'],
    'Flip-flops, clocks and circuits that remember.',
    [
      card('Circuits with memory', 'Sequential circuits have state: their output depends on inputs AND what happened before. The basic element is the flip-flop, which stores one bit.', D('flipflop')),
      card('The clock', 'A D flip-flop copies D to its output Q on the rising edge of the clock and holds it until the next edge. Clocks keep millions of flip-flops in step.')
    ],
    [
      predict('A D flip-flop has D = 1. The clock rises. What is Q right after?', ['1', '0', 'It toggles randomly', 'It equals the clock'], 0, 'On the rising edge, Q takes the value of D.'),
      predict('After that, D changes to 0 but the clock stays HIGH. What is Q?', ['Still 1', '0', 'Undefined', 'It oscillates'], 0, 'An edge-triggered flip-flop only updates on the next rising edge.'),
      mc('How many bits does a single flip-flop store?', ['1', '8', '2', '0'], 0, 'One flip-flop = one bit. Eight together form a byte register.'),
      concept('A circuit counts button presses and shows the count. This needs…', ['Sequential logic', 'Only combinational logic', 'Only a resistor', 'An ADC'], 0, 'Counting requires remembering the previous count — state.')
    ]),

  /* ---------------- Unit 3: Processor ---------------- */
  lesson('arch-registers', 'Registers', 'Processor', 2, ['registers', 'cpu'],
    'The CPU’s fastest storage, built from flip-flops.',
    [
      card('Tiny and fast', 'A register is a small group of flip-flops holding one word (e.g. 8, 32 or 64 bits). Registers sit inside the CPU and are the fastest storage in the system.'),
      card('Special registers', 'Program Counter (PC): address of the next instruction. Instruction Register (IR): the current instruction. Status/flags register: results such as zero or carry.')
    ],
    [
      match('Match the register to its job.', [['Program counter', 'Address of the next instruction'], ['Instruction register', 'The instruction being executed'], ['Status register', 'Flags such as zero and carry'], ['General-purpose register', 'Working data for calculations']], 'CPUs have a few special registers and a bank of general-purpose ones.'),
      tf('Registers are faster to access than main RAM.', true, 'They are inside the CPU core and accessed in a single cycle.'),
      num('A 32-bit register holds how many bytes?', 4, 'bytes', '32 ÷ 8 = 4 bytes.'),
      review('Review: what is a register built from?', ['Flip-flops', 'Resistors only', 'Capacitors in series', 'Diodes'], 0, 'Each flip-flop stores one bit of the register.')
    ]),

  lesson('arch-alu', 'The ALU', 'Processor', 2, ['alu', 'cpu'],
    'The Arithmetic Logic Unit does the math and logic.',
    [
      card('The calculator inside', 'The ALU performs arithmetic (add, subtract) and logic (AND, OR, XOR, shifts) on values from registers, and sets status flags such as Zero, Carry, Negative and Overflow.'),
      card('Flags drive decisions', 'A compare is really a subtraction that only updates flags. Branch instructions then check those flags.')
    ],
    [
      multi('Which operations does a typical ALU perform?', ['Addition', 'Bitwise AND', 'Shift left', 'Reading a file from disk'], [0, 1, 2], 'File access is handled by I/O and the OS, not the ALU.'),
      predict('The ALU computes 5 − 5. Which flag is set?', ['Zero', 'Carry only', 'None', 'Overflow'], 0, 'The result is 0, so the Zero flag is set — that is how “if (a == b)” works.'),
      num('Shifting binary 0011 left by 1 gives which decimal value?', 6, undefined, '0011 << 1 = 0110 = 6. Each left shift doubles the value.'),
      num('8-bit unsigned: 200 + 100 overflows. What value is stored (mod 256)?', 44, undefined, '300 − 256 = 44, and the Carry flag is set.')
    ]),

  lesson('arch-cpu', 'The CPU', 'Processor', 2, ['cpu', 'architecture'],
    'Control unit, ALU, registers and how they work together.',
    [
      card('Three parts', 'The control unit decodes instructions and directs the others; the ALU computes; registers hold data. Buses connect the CPU to memory and I/O.', D('cpu')),
      card('Clock speed', 'Each clock tick advances the CPU one step. A 133 MHz RP2040 core ticks 133 million times per second.')
    ],
    [
      diagram('In this block diagram, which unit decodes instructions and coordinates the others?', ['Control unit', 'ALU', 'Registers', 'Memory'], 0, 'The control unit is the conductor; the ALU and registers are the orchestra.', { visual: D('cpu') }),
      num('A CPU runs at 16 MHz (like an Arduino Uno). How long is one clock cycle in nanoseconds?', 62.5, 'ns', '1 ÷ 16,000,000 s = 62.5 ns.'),
      tf('A higher clock speed always means a faster processor, regardless of architecture.', false, 'Instructions per cycle, caches and memory speed matter as much as raw clock frequency.'),
      mc('What carries data between the CPU and memory?', ['Buses', 'The ALU', 'The flags register', 'The power supply'], 0, 'Address, data and control buses link the CPU to memory and I/O.')
    ]),

  lesson('arch-instruction-cycle', 'Instruction Cycle', 'Processor', 2, ['fetch-decode-execute', 'cpu'],
    'Fetch, decode, execute — repeated billions of times.',
    [
      card('Fetch–decode–execute', 'The CPU fetches the instruction at the address in the PC, decodes it to work out what to do, executes it (often in the ALU), writes back results, and advances the PC.'),
      card('Pipelining', 'Modern CPUs overlap these stages: while one instruction executes, the next is decoded and another fetched — like an assembly line.')
    ],
    [
      order('Put the instruction cycle in order.', ['Fetch the instruction from memory', 'Decode it', 'Execute it', 'Write back the result'], 'Then the PC moves on and the cycle repeats.'),
      mc('Which register tells the CPU where to fetch the next instruction?', ['Program counter', 'Accumulator', 'Status register', 'Stack pointer'], 0, 'The PC holds the address of the next instruction.'),
      concept('While instruction 3 executes, instruction 4 is being decoded and instruction 5 fetched. This is…', ['Pipelining', 'Caching', 'Interrupting', 'Debouncing'], 0, 'Overlapping stages raises throughput.'),
      predict('A branch instruction jumps to address 0x200. What changes?', ['The program counter is set to 0x200', 'The ALU resets', 'Memory is cleared', 'Nothing'], 0, 'Branches work by loading a new value into the PC.')
    ]),

  lesson('arch-assembly', 'Assembly Concepts', 'Processor', 3, ['assembly', 'instructions'],
    'Human-readable machine instructions: loads, stores, arithmetic and branches.',
    [
      card('One step at a time', 'Assembly language is a readable form of machine code. Each line is usually one instruction: load a value, add registers, store to memory, branch.', C('LDR  R0, =10     ; R0 = 10\nLDR  R1, =32     ; R1 = 32\nADD  R2, R0, R1  ; R2 = R0 + R1\nCMP  R2, #42\nBEQ  done        ; branch if equal', 'asm')),
      card('Load/store', 'In ARM-style (load/store) architectures, arithmetic happens only on registers. LDR brings data in from memory; STR writes it back.')
    ],
    [
      predict('After this code runs, what is in R2?', ['42', '10', '32', '22'], 0, 'ADD R2, R0, R1 puts 10 + 32 = 42 into R2.', { visual: C('MOV R0, #10\nMOV R1, #32\nADD R2, R0, R1', 'asm') }),
      code('Store R2 to the memory address held in R3.', 'asm', '___ R2, [R3]', ['STR', 'LDR', 'ADD', 'BEQ'], 0, 'STR (store register) writes a register to memory; LDR loads.'),
      match('Match the instruction to its action.', [['LDR', 'Load from memory into a register'], ['STR', 'Store a register into memory'], ['CMP', 'Compare and set flags'], ['B', 'Branch (jump) to a label']], 'These few patterns cover most of what compiled C code does.'),
      tf('One line of C, like x = a + b * c, can compile into several assembly instructions.', true, 'Loads, a multiply, an add and a store may all be needed.')
    ]),

  /* ---------------- Unit 4: Memory & I/O ---------------- */
  lesson('arch-memory', 'Memory', 'Memory & I/O', 2, ['memory', 'addressing'],
    'Addresses, RAM vs ROM/flash, and the memory map.',
    [
      card('Numbered boxes', 'Memory is a long array of bytes, each with an address. The CPU reads or writes by putting an address on the address bus.'),
      card('Volatile vs non-volatile', 'RAM is fast but forgets when power is lost. ROM/flash keeps data without power and stores the program. Microcontrollers map flash, RAM and peripherals into one address space.')
    ],
    [
      num('With a 16-bit address bus, how many bytes can be addressed?', 65536, 'bytes', '2¹⁶ = 65,536 addresses (64 KiB).'),
      match('Match the memory to its property.', [['SRAM', 'Fast, volatile'], ['Flash', 'Non-volatile, stores programs'], ['EEPROM', 'Non-volatile, byte-rewritable settings'], ['DRAM', 'Dense, volatile, needs refreshing']], 'Each memory type trades speed, density and persistence.'),
      tf('In many microcontrollers, peripheral registers appear at memory addresses (memory-mapped I/O).', true, 'Writing to a specific address can turn a GPIO pin on — that is memory-mapped I/O.'),
      mc('Where is the program stored in an Arduino so it survives power-off?', ['Flash memory', 'SRAM', 'CPU registers', 'The USB cable'], 0, 'The sketch is written into non-volatile flash.')
    ]),

  lesson('arch-caches', 'Caches', 'Memory & I/O', 3, ['cache', 'performance'],
    'Small fast memories that hide slow main memory.',
    [
      card('The memory hierarchy', 'Registers are fastest and tiny; caches (L1, L2, L3) are fast and small; main RAM is larger but slower; storage is huge but slowest.', D('mem-hierarchy')),
      card('Locality', 'Programs reuse recent data (temporal locality) and nearby data (spatial locality). Caches keep recently used blocks close to the CPU, so most accesses are “hits”.')
    ],
    [
      diagram('Which level of this hierarchy is fastest?', ['Registers', 'L3 cache', 'Main RAM', 'SSD storage'], 0, 'The closer to the core, the faster and smaller.', { visual: D('mem-hierarchy') }),
      concept('Looping through an array element by element is fast partly because neighbouring elements are fetched together. This is…', ['Spatial locality', 'Temporal locality', 'Pipelining', 'Debouncing'], 0, 'Cache lines bring in nearby bytes, so the next element is already cached.'),
      num('A program makes 1000 memory accesses with a 95% hit rate. How many are misses?', 50, 'misses', '5% of 1000 = 50 misses.'),
      tf('Small microcontrollers like the ATmega328P usually have no data cache.', true, 'Their SRAM is already single-cycle, so a cache adds little.')
    ]),

  lesson('arch-buses', 'Buses', 'Memory & I/O', 2, ['buses', 'architecture'],
    'Address, data and control buses connecting the system.',
    [
      card('Shared highways', 'A bus is a set of shared wires. The address bus says WHERE, the data bus carries WHAT, and the control bus says HOW (read or write, timing).'),
      card('Width matters', 'A wider data bus moves more bits per transfer. A wider address bus can reach more memory.')
    ],
    [
      match('Match the bus to what it carries.', [['Address bus', 'Which location to access'], ['Data bus', 'The value being transferred'], ['Control bus', 'Read/write and timing signals']], 'Together they implement every memory or I/O access.'),
      mc('A CPU with a 32-bit data bus can move how much data per transfer?', ['4 bytes', '1 byte', '32 bytes', '2 bytes'], 0, '32 bits ÷ 8 = 4 bytes per transfer.'),
      tf('Only one device can safely drive a shared bus line at a time.', true, 'Two drivers fighting cause contention; arbitration or tri-state outputs prevent it.'),
      review('Review: I2C is a bus. How are devices on it distinguished?', ['Addresses', 'Chip-select lines', 'Colours', 'Baud rates'], 0, 'Each I2C device has an address; SPI uses chip-selects instead.')
    ]),

  lesson('arch-io', 'Input / Output', 'Memory & I/O', 2, ['io', 'interrupts', 'dma'],
    'Polling, interrupts and DMA for talking to the outside world.',
    [
      card('Three ways to do I/O', 'Polling: the CPU repeatedly checks a device. Interrupts: the device signals the CPU when it needs attention. DMA: a controller moves data between memory and peripherals without the CPU.'),
      card('Choosing', 'Polling is simple; interrupts save CPU time for rare events; DMA is best for streams of data like audio, ADC samples or SPI displays.')
    ],
    [
      match('Match the I/O method to its description.', [['Polling', 'CPU repeatedly checks the device'], ['Interrupt', 'Device notifies the CPU'], ['DMA', 'Data moves without the CPU']], 'Each frees the CPU to a different degree.'),
      scenario('You stream 50,000 ADC samples per second into a buffer. Which method is best?', ['DMA', 'Polling in loop()', 'A delay() between reads', 'Serial.print each sample'], 0, 'DMA moves the samples in hardware, leaving the CPU free to process them.'),
      tf('Polling wastes CPU time when the event is rare.', true, 'The CPU keeps checking even though almost nothing happens.'),
      review('Review: which I/O method does attachInterrupt() use?', ['Interrupts', 'DMA', 'Polling', 'Caching'], 0, 'It registers an ISR that runs when the pin changes.')
    ])
];
