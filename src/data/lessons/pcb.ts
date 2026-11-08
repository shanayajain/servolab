import { card, concept, D, debug, diagram, fill, lesson, match, mc, multi, num, order, predict, review, scenario, tap, tf } from './builders';

export const pcbLessons = [
  /* ---------------- Unit 1: Foundations ---------------- */
  lesson('pcb-what-is', 'What is a PCB?', 'Foundations', 1, ['pcb', 'basics'],
    'Printed circuit boards: copper wiring on an insulating board.',
    [
      card('Wires you print', 'A printed circuit board replaces loose wires with copper tracks bonded to an insulating board (usually FR-4 fibreglass). Components solder onto pads, and tracks connect them.', D('pcb-stack', { layers: 2 })),
      card('Layers of a board', 'Copper carries signals, solder mask (often green) insulates and protects the copper, and silkscreen prints labels and outlines.')
    ],
    [
      match('Match each PCB layer to its job.', [['Copper', 'Conducts signals and power'], ['Solder mask', 'Insulates copper and stops solder bridges'], ['Silkscreen', 'Labels and component outlines'], ['FR-4 core', 'Rigid insulating base']], 'Each layer of the stack-up has one job.'),
      mc('Why use a PCB instead of a breadboard for a finished robot?', ['Reliable, compact, vibration-resistant connections', 'PCBs are always cheaper for one board', 'Breadboards cannot carry current', 'PCBs need no soldering'], 0, 'Soldered copper connections do not shake loose and pack far more densely.'),
      tf('The green colour of most PCBs comes from the solder mask.', true, 'Solder mask can be green, black, blue, red, white… green is just traditional.'),
      concept('The white text “R3” printed next to a resistor footprint is on the…', ['Silkscreen layer', 'Copper layer', 'Solder mask', 'Inner core'], 0, 'Silkscreen carries reference designators and outlines.')
    ]),

  lesson('pcb-schematic', 'Schematics', 'Foundations', 1, ['schematic', 'netlist'],
    'The schematic captures what connects to what — not where it sits.',
    [
      card('The logical design', 'A schematic shows components as symbols and connections as wires. It defines the netlist — every electrical connection — but says nothing about physical placement.'),
      card('Nets and labels', 'A net is one electrical node. Net labels like GND or 3V3 connect points without drawing a wire across the page. Same label = same net.')
    ],
    [
      mc('What does a schematic primarily define?', ['Electrical connections (the netlist)', 'Exact physical positions of parts', 'Board thickness', 'Copper colour'], 0, 'Placement happens later in the PCB layout; the schematic captures connectivity.'),
      tf('Two wires ending at net labels with the same name (e.g. “VBAT”) are electrically connected.', true, 'Net labels are a tidy way to connect points without drawing long wires.'),
      order('Order a typical PCB design flow.', ['Draw the schematic', 'Assign footprints', 'Place components on the board', 'Route the traces', 'Run design-rule checks', 'Export manufacturing files'], 'Logic first, then physical design, then checks and outputs.'),
      fill('A single electrically connected node in a design is called a ___.', ['net'], 'Everything on one net is at the same potential (ignoring resistance).', { bank: ['net', 'pad', 'via', 'layer'] })
    ]),

  lesson('pcb-symbols', 'Symbols', 'Foundations', 1, ['symbols', 'schematic'],
    'Reading the schematic symbols for common parts.',
    [
      card('A visual language', 'Each component has a standard symbol: zigzag or box for a resistor, two plates for a capacitor, a triangle with a bar for a diode, a circle with M for a motor.'),
      card('Reference designators', 'Parts are labelled by type and number: R for resistors, C for capacitors, D for diodes, Q for transistors, U for ICs, J for connectors.')
    ],
    [
      tap('Tap the diode symbol.', ['resistor', 'capacitor', 'diode', 'inductor'], 2, 'The triangle points in the direction of conventional current; the bar is the cathode.'),
      match('Match the reference designator to the part type.', [['R', 'Resistor'], ['C', 'Capacitor'], ['U', 'Integrated circuit'], ['J', 'Connector']], 'Designators make it easy to find parts on the board and in the BOM.'),
      tap('Tap the transistor symbol.', ['transistor', 'diode', 'led', 'switch'], 0, 'A BJT symbol shows base, collector and an emitter with an arrow.'),
      mc('What does the designator Q4 usually refer to?', ['A transistor', 'A capacitor', 'A crystal', 'A fuse'], 0, 'Q is the conventional prefix for transistors.')
    ]),

  lesson('pcb-footprints', 'Footprints', 'Foundations', 2, ['footprints', 'packages'],
    'The copper pattern a part solders onto — it must match the real component.',
    [
      card('Physical land pattern', 'A footprint is the set of pads (and holes) on the board for one component, plus its outline. The same 10 kΩ resistor can come in a 0805 surface-mount or an axial through-hole package — different footprints.'),
      card('THT vs SMD', 'Through-hole (THT) parts have leads through drilled holes. Surface-mount (SMD) parts sit on pads on the surface — smaller and suited to machine assembly.')
    ],
    [
      mc('A footprint describes…', ['The pad layout a component solders onto', 'The component’s electrical value', 'The schematic symbol', 'The board colour'], 0, 'Value and symbol are logical; the footprint is physical.'),
      debug('Your boards arrive and the regulator’s pins do not line up with the pads. What went wrong?', ['The wrong footprint (package) was assigned', 'The schematic symbol was blue', 'The solder mask is too thick', 'The silkscreen is missing'], 0, 'Always check the footprint against the exact package in the part’s datasheet.'),
      concept('An “0805” label refers to…', ['A surface-mount package size (0.08 × 0.05 in)', 'A resistor value of 805 Ω', 'A layer count', 'A drill size'], 0, 'Imperial SMD codes give length × width in hundredths of an inch.'),
      tf('Surface-mount parts need holes drilled through the board for every pin.', false, 'SMD parts sit on surface pads. Through-hole parts need holes.')
    ]),

  /* ---------------- Unit 2: Layout ---------------- */
  lesson('pcb-traces', 'Traces', 'Layout', 2, ['traces', 'current'],
    'Copper tracks: width, current and resistance.',
    [
      card('Copper wires', 'Traces are the copper paths between pads. Wider traces carry more current with less heating and less voltage drop.', D('pcb-trace')),
      card('Rules of thumb', 'Signal traces can be thin (e.g. 0.2–0.25 mm). Power traces for motors need to be much wider — use a trace-width calculator with your current and copper weight (often 1 oz).')
    ],
    [
      mc('Why make motor power traces wider than signal traces?', ['They carry more current and must not overheat', 'Wide traces look nicer', 'To slow the signal down', 'Thin traces cannot be soldered'], 0, 'Current heats copper; more copper cross-section means less resistance and heating.'),
      predict('You halve a trace’s width (same length and copper). Its resistance…', ['Doubles', 'Halves', 'Stays the same', 'Becomes zero'], 0, 'Resistance is inversely proportional to cross-sectional area.'),
      tf('Long, thin power traces can cause a voltage drop that resets a microcontroller under load.', true, 'V = I × R: high current through a resistive trace loses voltage before it reaches the load.'),
      num('A trace has 0.05 Ω resistance and carries 2 A. What voltage is lost along it?', 0.1, 'V', 'V = I × R = 2 × 0.05 = 0.1 V.')
    ]),

  lesson('pcb-layers', 'Layers', 'Layout', 2, ['layers', 'stackup'],
    'Single, double and multilayer boards and the stack-up.',
    [
      card('More layers, more room', 'Single-sided boards have copper on one side; double-sided on both; multilayer boards (4, 6, 8…) have internal copper layers too.', D('pcb-stack', { layers: 4 })),
      card('A classic 4-layer stack-up', 'Top: signals. Inner 1: solid ground plane. Inner 2: power. Bottom: signals. Every signal then sits right next to a ground reference.')
    ],
    [
      diagram('In this 4-layer stack-up, what is the inner layer right under the top signal layer usually used for?', ['A solid ground plane', 'Silkscreen', 'Components', 'Nothing'], 0, 'A ground plane next to signals gives a short return path and reduces noise.', { visual: D('pcb-stack', { layers: 4 }) }),
      mc('What is a key benefit of a 4-layer board over a 2-layer board?', ['Dedicated ground and power planes improve noise performance', 'It is always cheaper', 'It needs no vias', 'It has no solder mask'], 0, 'Planes give low-impedance power and clean return paths; routing also gets easier.'),
      tf('On a 2-layer board, both outer layers can carry traces.', true, 'Double-sided boards route on top and bottom, connected by vias.'),
      review('Review: what connects a top-layer trace to a bottom-layer trace?', ['A via', 'Silkscreen', 'A footprint label', 'A fuse'], 0, 'Vias are plated holes that join layers — the next lesson covers them.')
    ]),

  lesson('pcb-vias', 'Vias', 'Layout', 2, ['vias', 'layers'],
    'Plated holes that connect copper layers.',
    [
      card('Elevators between layers', 'A via is a small plated hole that electrically connects traces on different layers. Through-hole vias go all the way through; blind and buried vias (pricier) connect only some layers.', D('pcb-trace')),
      card('Costs of a via', 'Each via adds a little resistance and inductance. For high currents use several vias in parallel; for sensitive signals minimise layer changes.')
    ],
    [
      mc('What is a via?', ['A plated hole connecting copper layers', 'A type of resistor', 'A label on the silkscreen', 'A component footprint'], 0, 'Vias carry signals and power between layers.'),
      scenario('A 3 A motor trace must change layers. One small via is rated about 1 A. What should you do?', ['Use several vias in parallel', 'Use one via anyway', 'Route through the silkscreen', 'Add a capacitor instead'], 0, 'Parallel vias share the current and lower resistance and heating.'),
      tf('A buried via connects only inner layers and is not visible from the outside.', true, 'Buried vias sit entirely inside a multilayer board.'),
      concept('A ring of many vias stitching the top ground pour to the inner ground plane is called…', ['Via stitching', 'Debouncing', 'Panelisation', 'Tenting'], 0, 'Stitching ties ground copper together for low impedance and shielding.')
    ]),

  lesson('pcb-routing', 'Routing', 'Layout', 2, ['routing', 'layout'],
    'Placing parts well and routing traces cleanly.',
    [
      card('Placement first', 'Good routing starts with good placement: put connectors at edges, keep decoupling capacitors next to IC power pins, group related parts, and separate noisy motor circuitry from sensitive analog.'),
      card('Routing habits', 'Route power and critical signals first. Use 45° corners, keep high-current loops small, and avoid running sensitive traces alongside noisy ones.')
    ],
    [
      order('Order a good layout process.', ['Place connectors and mechanical constraints', 'Place ICs and their decoupling capacitors', 'Route power and ground', 'Route critical signals', 'Route the remaining signals'], 'Constraints and the most important nets first; the rest fills in.'),
      multi('Which are good routing practices?', ['Keep decoupling caps close to IC power pins', 'Keep motor current loops small', 'Run a sensitive analog trace beside a PWM motor trace', 'Use 45° bends instead of sharp 90° corners'], [0, 1, 3], 'Parallel runs couple noise between traces; keep sensitive analog away from switching signals.'),
      tf('Component placement has little effect on how easy a board is to route.', false, 'Placement determines trace lengths and crossings — it is most of the work.'),
      scenario('Your ultrasonic readings are noisy whenever the motors run. On the PCB, the echo trace runs parallel to the motor PWM trace for 5 cm. Best fix?', ['Re-route to separate them and add ground between', 'Increase PWM duty', 'Make the echo trace longer', 'Remove the ground plane'], 0, 'Separation and grounding reduce crosstalk from the switching motor signal.')
    ]),

  lesson('pcb-design-rules', 'Design Rules', 'Layout', 2, ['drc', 'manufacturing'],
    'Clearances, widths and drill sizes your manufacturer can actually build.',
    [
      card('Manufacturing limits', 'Fabs have minimums: trace width, spacing (clearance), drill size and annular ring (copper around a hole). A common budget process: 0.15 mm (6 mil) trace/space, 0.3 mm drills.'),
      card('Run DRC', 'The design-rule check (DRC) flags anything that breaks the rules — overlapping copper, unconnected nets, too-thin traces — before you pay for boards.')
    ],
    [
      mc('What does DRC stand for?', ['Design Rule Check', 'Digital Routing Circuit', 'Drill Ratio Calculation', 'Direct Return Current'], 0, 'DRC verifies the layout against manufacturing and electrical rules.'),
      num('1 mil is 0.0254 mm. How many mm is a 6 mil trace?', 0.1524, 'mm', '6 × 0.0254 = 0.1524 mm.', { tolerance: 0.02 }),
      debug('DRC reports “clearance violation” between a 12 V pad and a signal trace. What does it mean?', ['The copper is closer together than the minimum spacing', 'The trace is too wide', 'The board is too thick', 'The silkscreen overlaps'], 0, 'Too little spacing risks shorts in manufacturing and arcing at higher voltages.'),
      tf('Higher voltages need larger clearances between conductors.', true, 'Higher voltage can arc across or track over small gaps.')
    ]),

  /* ---------------- Unit 3: Power & Signal Integrity ---------------- */
  lesson('pcb-ground-planes', 'Ground Planes', 'Power & Signals', 2, ['ground', 'planes'],
    'Large copper areas for low-impedance ground and clean return paths.',
    [
      card('A sea of ground', 'A ground plane is a large, continuous area of copper connected to GND. It gives every part a short, low-impedance path to ground and shields signals.'),
      card('Return currents', 'Every signal current returns to its source. At high frequency the return flows in the plane directly under the trace. Cutting slots in the plane forces long detours — a classic source of noise.')
    ],
    [
      mc('What is a major benefit of a solid ground plane?', ['Low-impedance return paths that reduce noise', 'It makes the board lighter', 'It removes the need for decoupling capacitors', 'It replaces the power supply'], 0, 'Short, wide return paths keep ground voltages stable and reduce emissions.'),
      predict('A signal trace crosses over a long slot cut into the ground plane below. What happens to its return current?', ['It detours around the slot, forming a larger loop that radiates and picks up noise', 'It flows through the air', 'Nothing changes', 'The signal speeds up'], 0, 'Large current loops act like antennas. Keep the plane under signals continuous.'),
      tf('All grounds on a robot (MCU, sensors, motor driver) should ultimately connect together.', true, 'A common reference is required, though motor ground currents should be routed so they do not flow through sensitive signal areas.'),
      review('Review: on a 4-layer board, where is the ground plane usually placed?', ['Inner layer right below the top signals', 'On the silkscreen', 'Only around connectors', 'Nowhere'], 0, 'Placing ground next to the signal layer gives the best return path.')
    ]),

  lesson('pcb-decoupling', 'Decoupling Capacitors', 'Power & Signals', 2, ['decoupling', 'capacitors', 'power'],
    'Local energy reservoirs that keep IC supplies steady.',
    [
      card('Instant current', 'Digital chips draw sharp current pulses on every clock edge. The supply and its traces have inductance and cannot respond instantly, so a capacitor right at the pin supplies the burst.', D('decoupling')),
      card('Placement is everything', 'Typical: 100 nF ceramic per power pin, as close as possible, with a short path to ground. Add a bulk 10 µF nearby for slower changes.')
    ],
    [
      diagram('Where should the 100 nF decoupling capacitor be placed?', ['As close as possible to the IC power pin', 'At the far edge of the board', 'Next to the battery connector only', 'Anywhere — distance does not matter'], 0, 'Trace inductance between capacitor and pin defeats its purpose, so keep it short.', { visual: D('decoupling') }),
      mc('What is the most common decoupling capacitor value next to each digital IC power pin?', ['100 nF', '1000 µF', '1 pF', '10 F'], 0, '100 nF (0.1 µF) ceramic is the classic per-pin value.'),
      debug('A board resets randomly when the MCU starts Wi-Fi transmission. No caps are near the MCU. Likely fix?', ['Add decoupling and bulk capacitors close to the MCU', 'Add a longer antenna', 'Remove the ground plane', 'Raise the clock speed'], 0, 'Transmit bursts draw high peak current; local capacitance holds the voltage up.'),
      tf('Ceramic capacitors are usually used for high-frequency decoupling.', true, 'Ceramics have low ESR and inductance, so they respond quickly.')
    ]),

  lesson('pcb-power-distribution', 'Power Distribution', 'Power & Signals', 3, ['power', 'distribution'],
    'Getting clean power to every part of the board.',
    [
      card('Plan the power tree', 'List every rail (battery, 5 V, 3.3 V), what draws from each, and the peak currents. Use wide traces or planes for high current and keep motor and logic power paths separate.'),
      card('Star and separate', 'Bring heavy motor currents straight from the battery to the driver. Join motor and logic grounds at one point near the supply so motor currents do not flow under sensitive circuits.')
    ],
    [
      num('A board has an MCU (80 mA), sensors (40 mA) and an LED strip (300 mA) on the 5 V rail. What is the total current?', 420, 'mA', '80 + 40 + 300 = 420 mA — choose a regulator with margin.'),
      scenario('Motor current flows through the same thin ground trace as your ADC reference. Readings jump when motors run. Why?', ['Motor current creates a voltage drop on the shared ground', 'The ADC is broken', 'The motors produce light', 'The code is too slow'], 0, 'Shared ground impedance turns motor current into noise on the analog signal. Separate the return paths.'),
      mc('Why is it good practice to add a fuse or polyfuse at the battery input?', ['To protect against short circuits and overcurrent', 'To increase voltage', 'To filter noise', 'To store energy'], 0, 'A fuse limits damage (and fire risk) if something shorts.'),
      tf('Batteries for robots should always be connected without any reverse-polarity protection.', false, 'A reversed battery can destroy everything. A diode, P-MOSFET or keyed connector prevents it.')
    ]),

  lesson('pcb-noise', 'Noise', 'Power & Signals', 3, ['noise', 'emi', 'signal-integrity'],
    'Where noise comes from on a robot board and how to reduce it.',
    [
      card('Noise sources', 'Motors and PWM switching are the loudest sources on a robot: fast current edges couple into nearby traces through shared ground, capacitance and magnetic loops.'),
      card('Defences', 'Small current loops, solid ground planes, filtering (RC, ferrite beads), physical separation, twisted motor wires and capacitors across motor terminals all help.')
    ],
    [
      multi('Which reduce motor noise reaching sensors?', ['A small ceramic capacitor across the motor terminals', 'Twisting the motor wires together', 'Running sensor wires alongside motor wires', 'A ferrite bead or LC filter on the supply'], [0, 1, 3], 'Running sensor and motor wires together increases coupling.'),
      concept('A large loop of current acts like an antenna, radiating and receiving noise. This is called…', ['Electromagnetic interference (EMI)', 'Debouncing', 'Odometry drift', 'Pipelining'], 0, 'EMI scales with loop area and edge speed.'),
      tf('Making current loops smaller reduces both emitted and picked-up noise.', true, 'Loop area determines how strongly a circuit couples to magnetic fields.'),
      review('Review: what is the main purpose of a decoupling capacitor?', ['Supply fast current bursts locally to keep the IC rail stable', 'Limit LED current', 'Measure distance', 'Count encoder ticks'], 0, 'Decoupling is one of the cheapest and most effective noise defences.')
    ]),

  /* ---------------- Unit 4: Fabrication ---------------- */
  lesson('pcb-manufacturing', 'PCB Manufacturing', 'Fabrication', 2, ['manufacturing', 'assembly'],
    'How boards are made and assembled.',
    [
      card('From panel to board', 'Fabricators image copper patterns onto laminate, etch away unwanted copper, drill and plate holes, laminate layers, then apply solder mask, surface finish and silkscreen, and finally route the outline.'),
      card('Assembly', 'Solder paste is stencilled onto pads, pick-and-place machines position SMD parts, and a reflow oven melts the paste. Through-hole parts are wave- or hand-soldered.')
    ],
    [
      order('Order the main assembly steps for an SMD board.', ['Apply solder paste through a stencil', 'Place components with pick-and-place', 'Reflow in an oven', 'Inspect and test'], 'Paste, place, reflow, inspect — the standard SMT flow.'),
      mc('What is a BOM?', ['Bill of materials — the list of parts', 'Board orientation marker', 'Basic oscillator module', 'Bottom outer mask'], 0, 'The BOM lists every part with value, footprint and quantity for purchasing and assembly.'),
      tf('ENIG and HASL are types of surface finish on exposed copper pads.', true, 'Finishes protect pads from oxidation and help soldering. ENIG is flat and gold-coloured; HASL is solder-coated.'),
      concept('Several small boards are joined on one larger sheet to manufacture them efficiently. This is called…', ['Panelisation', 'Via stitching', 'Debouncing', 'Decoupling'], 0, 'Panels are separated after assembly with V-scores or mouse-bites.')
    ]),

  lesson('pcb-gerbers', 'Gerber Files', 'Fabrication', 2, ['gerber', 'files'],
    'The file set a manufacturer needs to make your board.',
    [
      card('The fab’s blueprint', 'Gerber files describe each layer as 2D artwork: top/bottom copper, solder mask, silkscreen, paste and board outline. An Excellon drill file lists the holes.'),
      card('Check before ordering', 'Open your Gerbers in a viewer before uploading. What you see is what will be built — not what your design tool shows.')
    ],
    [
      multi('Which files are usually sent for a 2-layer board?', ['Top and bottom copper', 'Solder mask and silkscreen layers', 'Board outline and drill file', 'The firmware .hex file'], [0, 1, 2], 'Firmware is not needed to make the bare board.'),
      mc('What does the Excellon file describe?', ['Drill hole positions and sizes', 'Copper traces', 'Component values', 'Silkscreen text'], 0, 'Excellon is the standard drill format alongside the Gerbers.'),
      debug('Boards arrive with no outline cut — just a big rectangle. Which Gerber was missing or wrong?', ['The board outline (edge cuts) layer', 'The bottom silkscreen', 'The paste layer', 'The BOM'], 0, 'The fab routes the board shape from the outline layer.'),
      tf('You should inspect your Gerbers in a viewer before ordering.', true, 'Viewers catch missing layers, mirrored text and outline problems before they cost money.')
    ]),

  lesson('pcb-debugging', 'PCB Debugging', 'Fabrication', 3, ['debugging', 'bring-up'],
    'Bringing up a new board safely and finding faults.',
    [
      card('Bring-up', 'Inspect visually first. Check for shorts between power rails with the board unpowered. Power up with a current-limited supply, check every rail, then bring up the MCU, then peripherals.'),
      card('Design for debug', 'Add test points on important nets, LEDs on power rails, a debug header (SWD/UART) and zero-ohm links to isolate sections.')
    ],
    [
      order('Order the first power-up of a new robot board.', ['Inspect for solder bridges and part orientation', 'Check for shorts between rails (unpowered)', 'Power with a current-limited supply', 'Measure each voltage rail', 'Program the MCU and test peripherals'], 'Each step catches faults before they can destroy parts.'),
      scenario('On first power-up, the bench supply hits its current limit and the 3.3 V rail reads 0.4 V. What is likely?', ['A short or reversed part on the 3.3 V rail', 'The firmware has a bug', 'The silkscreen is wrong', 'The board needs a higher voltage'], 0, 'A rail pulled low at high current points to a short — often a solder bridge or a backwards IC/capacitor.'),
      multi('Which features make a board easier to debug?', ['Test points on key nets', 'A power-good LED', 'An SWD/UART header', 'Removing all labels from the silkscreen'], [0, 1, 2], 'Clear labels help too — removing them makes debugging harder.'),
      tf('A current-limited bench supply can save parts if there is a short on first power-up.', true, 'Limiting current stops a short from heating and destroying parts while you investigate.')
    ])
];
