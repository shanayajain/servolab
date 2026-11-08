import { card, code, concept, D, debug, diagram, el, fill, lesson, loop, match, mc, multi, num, order, P, par, predict, review, S, scenario, tap, tf } from './builders';

export const electronicsLessons = [
  /* ---------------- Unit 1: Foundations ---------------- */
  lesson('elec-electricity', 'What is Electricity?', 'Foundations', 1, ['charge', 'circuits'],
    'Electric charge, conductors, insulators and why a circuit must be a closed loop.',
    [
      card('Charge on the move', 'Electricity is the flow of electric charge. In a wire, electrons drift along when two things are true: there is a source pushing them (like a battery) and there is a complete loop for them to travel around.', loop(el('battery', '9 V'), el('lamp', 'Lamp', true))),
      card('Conductors and insulators', 'Metals such as copper, aluminium and gold let charge move easily — they are conductors. Plastic, rubber, glass and dry air resist it — they are insulators. Wires are conductors wrapped in insulators.')
    ],
    [
      mc('What does a circuit need for current to flow?', ['A closed loop and an energy source', 'Only a battery', 'Only a wire', 'An open switch'], 0, 'Current needs a push (a source such as a battery) and a complete path back to the source. Break the loop anywhere and the flow stops.'),
      tf('Rubber is a good electrical conductor.', false, 'Rubber is an insulator — that is why it is used to coat wires and make tool handles.'),
      multi('Which of these are good conductors?', ['Copper', 'Aluminium', 'Glass', 'Rubber', 'Gold'], [0, 1, 4], 'Metals conduct well. Gold is used on connector contacts because it conducts and does not corrode. Glass and rubber are insulators.'),
      predict('The switch in this circuit is open. What does the lamp do?', ['Stays off — the loop is broken', 'Glows dimly', 'Glows at full brightness', 'Flickers'], 0, 'An open switch creates a gap in the loop. With no complete path, no current flows, so the lamp stays dark.', { visual: loop(el('battery', '9 V'), 'switch-open', el('lamp', 'Lamp')) }),
      match('Match each part to its role in a circuit.', [['Battery', 'Energy source'], ['Lamp', 'Load (uses energy)'], ['Copper wire', 'Conductor'], ['PVC sleeve', 'Insulator']], 'Every circuit has a source, a load and conductors to link them; insulation keeps the current where you want it.')
    ]),

  lesson('elec-voltage', 'Voltage', 'Foundations', 1, ['voltage'],
    'Voltage as electrical pressure, measured between two points in volts.',
    [
      card('Electrical pressure', 'Voltage is the difference in electrical potential energy between two points — the “push” that drives current. It is measured in volts (V). Think of it like water pressure: more pressure, more push.'),
      card('Always between two points', 'A voltage only makes sense between two points: “5 V at this pin” really means 5 V between that pin and ground (0 V). A multimeter measures voltage with one probe on each point.')
    ],
    [
      mc('What is the unit of voltage?', ['Volt (V)', 'Ampere (A)', 'Ohm (Ω)', 'Watt (W)'], 0, 'Voltage is measured in volts, named after Alessandro Volta, who built the first battery.'),
      fill('Voltage is always measured ___ two points.', ['between'], 'Voltage is a difference, so you always need two points — usually a node and ground.', { bank: ['between', 'inside', 'after', 'through'] }),
      num('Two 1.5 V AA cells are connected in series (+ to −). What is the total voltage?', 3, 'V', 'Cells in series add their voltages: 1.5 V + 1.5 V = 3 V.', { hint: 'In series, voltages add.' }),
      concept('A multimeter has its red probe on a battery’s + terminal and black probe on −. It reads 9.1. What is it measuring?', ['The voltage across the battery', 'The current from the battery', 'The battery’s resistance', 'The battery’s power'], 0, 'Probes placed across two points with the meter in V mode measure the voltage difference between them.'),
      tf('A 9 V battery sitting on a shelf, connected to nothing, still has about 9 V between its terminals.', true, 'The potential difference exists even with no current flowing. This is called the open-circuit voltage.')
    ]),

  lesson('elec-current', 'Current', 'Foundations', 1, ['current'],
    'Current is the rate of charge flow, measured in amps, and is the same everywhere in a series loop.',
    [
      card('Flow rate', 'Current is how much charge passes a point each second. It is measured in amperes (A). Small electronics use milliamps: 1 mA = 0.001 A. A typical LED wants about 10–20 mA.'),
      card('Measured in series', 'To measure current, the meter must become part of the loop so the current flows through it. That is why an ammeter is connected in series, not across a part.', loop(el('battery', '5 V'), el('meter-a', 'A'), el('resistor', '250 Ω')))
    ],
    [
      mc('What is the unit of current?', ['Ampere (A)', 'Volt (V)', 'Ohm (Ω)', 'Hertz (Hz)'], 0, 'Current is measured in amperes (amps). 1 A means one coulomb of charge passes per second.'),
      num('Convert 250 mA to amps.', 0.25, 'A', '1 mA = 0.001 A, so 250 mA = 0.25 A.'),
      mc('How should an ammeter be connected to measure current through a resistor?', ['In series with the resistor', 'In parallel across the resistor', 'Directly across the battery', 'It does not matter'], 0, 'Current must flow through the meter, so it goes in series. Putting an ammeter across a source can short it out and blow the meter’s fuse.'),
      tf('In a single series loop, the current is the same at every point.', true, 'Charge is not created or lost along the way, so whatever flows out of the battery flows through every part of a single loop.'),
      scenario('An LED is rated for 20 mA maximum. You measure 35 mA through it. What is happening?', ['It is overdriven and will likely fail early', 'It is underpowered and dim', 'Everything is fine', 'The meter is in the wrong units'], 0, 'Exceeding the rated current overheats the LED junction. Use a larger series resistor to bring the current down.')
    ]),

  lesson('elec-resistance', 'Resistance', 'Foundations', 1, ['resistance'],
    'How materials and resistors oppose current, measured in ohms.',
    [
      card('Opposing the flow', 'Resistance is how strongly something opposes current. It is measured in ohms (Ω). More resistance means less current for the same voltage.'),
      card('What sets resistance', 'A long, thin wire resists more than a short, thick one. Material matters too: copper is low-resistance, nichrome (used in heaters) is high. Resistors are parts made to have a precise resistance.', P('resistor'))
    ],
    [
      mc('Which symbol represents ohms?', ['Ω', 'µ', 'Σ', 'Δ'], 0, 'Ω (the Greek letter omega) is the symbol for ohms, the unit of resistance.'),
      mc('Which wire has the most resistance?', ['A long, thin wire', 'A short, thick wire', 'A short, thin wire', 'A long, thick wire'], 0, 'Resistance increases with length and decreases with cross-sectional area, so long and thin is worst.'),
      tap('Tap the resistor.', ['battery', 'resistor', 'led', 'capacitor'], 1, 'The resistor symbol is a zigzag (US style) or a rectangle (IEC style). It has no polarity — it can go either way round.'),
      tf('With the same voltage, doubling the resistance halves the current.', true, 'Current is inversely proportional to resistance (I = V/R): twice the resistance, half the current.'),
      num('How many ohms is 4.7 kΩ?', 4700, 'Ω', 'k means ×1000, so 4.7 kΩ = 4700 Ω.')
    ]),

  lesson('elec-ohms-law', "Ohm's Law", 'Foundations', 1, ['ohms-law', 'calculation'],
    'V = I × R — the equation that connects voltage, current and resistance.',
    [
      card('One equation, three forms', 'Ohm’s law says V = I × R. Rearranged: I = V ÷ R and R = V ÷ I. Know any two values and you can find the third.', D('ohm-triangle')),
      card('Units matter', 'Use volts, amps and ohms together. If you use milliamps, convert first: 20 mA = 0.02 A.')
    ],
    [
      num('A 9 V battery is connected across a 450 Ω resistor. What current flows?', 0.02, 'A', 'I = V ÷ R = 9 ÷ 450 = 0.02 A (20 mA).', { hint: 'I = V ÷ R' }),
      num('0.5 A flows through a 10 Ω resistor. What is the voltage across it?', 5, 'V', 'V = I × R = 0.5 × 10 = 5 V.'),
      num('A 12 V supply drives 40 mA through a resistor. What is its resistance?', 300, 'Ω', 'Convert 40 mA to 0.04 A. R = V ÷ I = 12 ÷ 0.04 = 300 Ω.', { hint: 'Convert mA to A first.' }),
      predict('You double the voltage across a fixed resistor. What happens to the current?', ['It doubles', 'It halves', 'It stays the same', 'It quadruples'], 0, 'With R fixed, I = V/R is proportional to V. Double V, double I.'),
      diagram('On the Ohm’s law triangle, cover I with your finger. What remains?', ['V over R  →  I = V ÷ R', 'V × R', 'R over V', 'V − R'], 0, 'Covering a quantity shows how to compute it: V sits above R, so I = V ÷ R.', { visual: D('ohm-triangle', { highlight: 'I' }) }),
      fill('V = I × ___', ['R'], 'Voltage equals current times resistance.', { bank: ['R', 'P', 'V', 't'] })
    ]),

  lesson('elec-power', 'Electrical Power', 'Foundations', 2, ['power', 'calculation'],
    'Power is the rate energy is used: P = V × I, and why resistors have wattage ratings.',
    [
      card('Energy per second', 'Electrical power is how fast energy is converted, measured in watts (W). P = V × I. Combining with Ohm’s law gives P = I²R and P = V²/R.'),
      card('Ratings keep parts cool', 'Resistors turn power into heat. A common through-hole resistor is rated ¼ W. Push more than that through it and it overheats. Always check P against the rating.')
    ],
    [
      num('A motor runs at 5 V and draws 0.2 A. How much power does it use?', 1, 'W', 'P = V × I = 5 × 0.2 = 1 W.'),
      num('0.1 A flows through a 100 Ω resistor. How much power does it dissipate?', 1, 'W', 'P = I²R = 0.1² × 100 = 0.01 × 100 = 1 W.', { hint: 'P = I² × R' }),
      scenario('A ¼ W resistor in your circuit dissipates 0.5 W. What should you do?', ['Use a resistor rated 1 W or more', 'Nothing — ratings are conservative', 'Use a ⅛ W resistor', 'Add a capacitor'], 0, 'It is dissipating double its rating and will get very hot. Choose a higher power rating (with margin) or redesign to reduce the current.'),
      mc('Which of these is NOT a valid formula for power?', ['P = V ÷ I', 'P = V × I', 'P = I² × R', 'P = V² ÷ R'], 0, 'V ÷ I is resistance, not power. The other three are equivalent forms of power.'),
      tf('A 60 W bulb on a 120 V supply draws 0.5 A.', true, 'I = P ÷ V = 60 ÷ 120 = 0.5 A.')
    ]),

  /* ---------------- Unit 2: Circuits ---------------- */
  lesson('elec-series', 'Series Circuits', 'Circuits', 1, ['series', 'circuits'],
    'One path: resistances add, current is shared, voltage divides.',
    [
      card('One path only', 'In a series circuit, parts are connected end-to-end in a single loop. The same current flows through every part.', loop(el('battery', '9 V'), el('resistor', '300 Ω'), el('resistor', '600 Ω'))),
      card('Rules of series', 'Total resistance is the sum: R = R1 + R2 + … The supply voltage is shared between the parts, in proportion to their resistance.')
    ],
    [
      num('A 100 Ω and a 220 Ω resistor are in series. What is the total resistance?', 320, 'Ω', 'Series resistances simply add: 100 + 220 = 320 Ω.'),
      num('A 9 V battery drives a 300 Ω and a 600 Ω resistor in series. What current flows?', 0.01, 'A', 'Total R = 900 Ω. I = 9 ÷ 900 = 0.01 A (10 mA).', { visual: loop(el('battery', '9 V'), el('resistor', '300 Ω'), el('resistor', '600 Ω')) }),
      predict('Three lamps are wired in series. One burns out. What happens to the other two?', ['They go out too', 'They get brighter', 'Nothing changes', 'Only the next one goes out'], 0, 'A burnt-out lamp is an open circuit. In a single loop that breaks the path for everything.'),
      mc('Two equal resistors are in series across 10 V. What is the voltage across each?', ['5 V', '10 V', '20 V', '2.5 V'], 0, 'Equal resistors share the voltage equally: 10 ÷ 2 = 5 V each.'),
      tf('In a series circuit, a different current flows through each resistor.', false, 'There is only one path, so the same current must flow through every part.')
    ]),

  lesson('elec-parallel', 'Parallel Circuits', 'Circuits', 2, ['parallel', 'circuits'],
    'Multiple paths: voltage is the same on every branch and currents add.',
    [
      card('Many paths', 'In a parallel circuit every branch connects directly across the same two nodes, so every branch sees the full supply voltage. Branch currents add to make the total.', par('9 V', [el('lamp', 'L1', true)], [el('lamp', 'L2', true)])),
      card('Less total resistance', 'Adding a branch adds another path, so total resistance goes DOWN. For two resistors: R = (R1 × R2) ÷ (R1 + R2). The total is always smaller than the smallest branch.')
    ],
    [
      num('Two 100 Ω resistors are connected in parallel. What is the total resistance?', 50, 'Ω', '(100 × 100) ÷ (100 + 100) = 50 Ω. Two equal resistors in parallel give half the value.'),
      num('Three parallel branches draw 1 A, 0.5 A and 0.25 A. What total current leaves the battery?', 1.75, 'A', 'In parallel, branch currents add: 1 + 0.5 + 0.25 = 1.75 A.'),
      predict('Two lamps are in parallel. You remove one. What happens to the other?', ['It stays lit at the same brightness', 'It goes out', 'It gets twice as bright', 'It flickers'], 0, 'Each branch has its own path across the supply. Removing one branch does not affect the voltage across the other.', { visual: par('9 V', [el('lamp', 'L1', true)], [el('break', 'removed')]) }),
      mc('A 10 Ω resistor is in parallel with a 1 MΩ resistor. The total is…', ['Just under 10 Ω', 'About 1 MΩ', 'About 500 kΩ', 'Exactly 10 Ω'], 0, 'The total is always smaller than the smallest branch. The huge resistor barely changes anything, so the result is a hair below 10 Ω.'),
      tf('Household outlets are wired in parallel so each appliance gets the full supply voltage.', true, 'Parallel wiring lets each device run independently at full voltage.')
    ]),

  lesson('elec-resistors', 'Resistors in Practice', 'Circuits', 2, ['resistors', 'divider'],
    'Colour codes, tolerance and the voltage divider.',
    [
      card('Reading colour bands', 'On a 4-band resistor: band 1 and 2 are digits, band 3 is the multiplier (number of zeros), band 4 is tolerance (gold = ±5%). Black 0, Brown 1, Red 2, Orange 3, Yellow 4, Green 5, Blue 6, Violet 7, Grey 8, White 9.'),
      card('The voltage divider', 'Two resistors in series split a voltage: Vout = Vin × R2 ÷ (R1 + R2). It is perfect for scaling sensor signals — but not for powering things, because the output sags under load.', D('divider', { vin: '9 V', r1: 'R1', r2: 'R2' }))
    ],
    [
      mc('What value is Brown–Black–Red–Gold?', ['1 kΩ ±5%', '10 Ω ±5%', '102 Ω ±10%', '100 kΩ ±5%'], 0, 'Brown = 1, Black = 0, Red = ×100 → 10 × 100 = 1000 Ω = 1 kΩ. Gold = ±5% tolerance.'),
      match('Match each colour to its digit.', [['Black', '0'], ['Brown', '1'], ['Red', '2'], ['Orange', '3']], 'The colour code starts Black 0, Brown 1, Red 2, Orange 3 and follows the rainbow from there.'),
      num('A divider uses two equal resistors on a 9 V supply. What is Vout?', 4.5, 'V', 'Vout = 9 × R ÷ (R + R) = 9 × ½ = 4.5 V.', { visual: D('divider', { vin: '9 V', r1: '10 kΩ', r2: '10 kΩ' }) }),
      num('Vin = 5 V, R1 = 10 kΩ (top), R2 = 5 kΩ (bottom). What is Vout?', 1.667, 'V', 'Vout = 5 × 5k ÷ (10k + 5k) = 5 × ⅓ ≈ 1.67 V.', { tolerance: 0.02, visual: D('divider', { vin: '5 V', r1: '10 kΩ', r2: '5 kΩ' }) }),
      tf('A voltage divider is a good way to power a motor from a higher voltage.', false, 'A motor draws significant current, which drags the divider output down and wastes power in R1. Use a regulator or driver instead.')
    ]),

  lesson('elec-switches', 'Switches', 'Circuits', 1, ['switches', 'inputs'],
    'SPST, SPDT, momentary buttons, normally-open and normally-closed contacts.',
    [
      card('Making and breaking', 'A switch opens or closes a path. SPST (single-pole, single-throw) is a simple on/off. SPDT routes one input to one of two outputs. Push buttons are momentary — they only stay closed while pressed.', P('button')),
      card('NO and NC', 'Normally-open (NO) contacts are open until actuated. Normally-closed (NC) contacts are closed until actuated. Safety circuits often use NC so that a broken wire is noticed.')
    ],
    [
      mc('A normally-open push button is not being pressed. Its contacts are…', ['Open — no current can pass', 'Closed — current passes', 'Half-closed', 'Shorted to ground'], 0, '“Normally” describes the resting state. NO contacts rest open and only close while pressed.'),
      match('Match the switch type to its behaviour.', [['SPST', 'Turns one path on or off'], ['SPDT', 'Chooses between two paths'], ['Normally open', 'Open until pressed'], ['Normally closed', 'Closed until pressed']], 'Poles are separate circuits; throws are the positions each pole can connect to.'),
      predict('The switch is closed. What does the lamp do?', ['Lights up', 'Stays off', 'Blows the battery', 'Flickers'], 0, 'A closed switch completes the loop so current flows through the lamp.', { visual: loop(el('battery', '6 V'), 'switch-closed', el('lamp', 'Lamp', true)) }),
      tap('Tap the momentary push button.', ['switch', 'button', 'potentiometer', 'diode'], 1, 'A push button symbol shows a contact bridge that is pushed down onto two terminals; it springs back when released.'),
      scenario('Why are emergency-stop buttons usually wired normally-closed?', ['A cut wire or loose contact also stops the machine', 'NC switches are cheaper', 'NC switches carry more current', 'It makes the robot faster'], 0, 'With NC wiring, the “run” signal depends on an intact circuit. Any fault that opens it — pressed button or broken wire — stops the machine. That is fail-safe design.')
    ]),

  lesson('elec-breadboards', 'Breadboards', 'Circuits', 1, ['breadboard', 'prototyping'],
    'How breadboard rows and rails are connected inside, and how to avoid common mistakes.',
    [
      card('Hidden metal strips', 'A breadboard has spring clips under the holes. Each short row of 5 holes (a–e or f–j) is connected together. The long rails along the edges carry power and ground.', D('breadboard')),
      card('Mind the gap', 'The central channel separates the two halves, so a chip can straddle it with each pin in its own row.')
    ],
    [
      diagram('On a breadboard, holes a–e in row 12 are…', ['Electrically connected to each other', 'All isolated from each other', 'Connected to the power rail', 'Connected to row 13'], 0, 'Each half-row of five holes shares one metal clip, so anything plugged into a–e of the same row is joined.', { visual: D('breadboard') }),
      tf('The centre channel lets an IC straddle the board so its opposite pins are not shorted together.', true, 'Without the gap, pins on both sides of the chip would land in the same connected row.'),
      mc('Where do you normally connect battery + and −?', ['The long power rails along the edges', 'Any single hole in the middle', 'Across the centre channel', 'Into the same row'], 0, 'Rails run the length of the board, so power and ground are available to every row nearby.'),
      debug('An LED has both legs plugged into holes a and c of row 7. It never lights. Why?', ['Both legs are in the same connected row, so the LED is shorted', 'LEDs never work on breadboards', 'The rails are reversed', 'Row 7 is broken'], 0, 'Both legs land on the same metal strip, so current bypasses the LED entirely. Put the legs in different rows.'),
      order('Put these breadboard build steps in a sensible order.', ['Sketch the schematic', 'Place the components', 'Wire the power rails', 'Wire the signal connections', 'Double-check before powering', 'Apply power and test'], 'Planning and checking before power saves parts. Always look for shorts between the rails before connecting the battery.')
    ]),

  /* ---------------- Unit 3: Components ---------------- */
  lesson('elec-capacitors', 'Capacitors', 'Components', 2, ['capacitors', 'rc'],
    'Charge storage, farads, RC time constants and decoupling.',
    [
      card('A tiny charge tank', 'A capacitor stores energy in an electric field between two plates. Capacitance is measured in farads (F); real parts are usually µF, nF or pF. Capacitors smooth supply ripples and block steady DC.', P('capacitor')),
      card('The RC time constant', 'Charging through a resistor, a capacitor reaches about 63% of the supply after one time constant τ = R × C, and is nearly full after 5τ.', D('cap-charge'))
    ],
    [
      num('A 10 kΩ resistor charges a 100 µF capacitor. What is the time constant τ in seconds?', 1, 's', 'τ = R × C = 10,000 × 0.0001 = 1 s.', { hint: '100 µF = 0.0001 F' }),
      diagram('After one time constant, a charging capacitor has reached roughly what fraction of the supply voltage?', ['About 63%', 'About 10%', 'Exactly 50%', '100%'], 0, 'The charging curve is exponential: 63% after 1τ, 86% after 2τ, ~99% after 5τ.', { visual: D('cap-charge') }),
      tf('Electrolytic capacitors can be installed either way round.', false, 'Electrolytics are polarized. Reversed, they can overheat and burst. The stripe marks the negative lead.'),
      mc('What is the main job of a small capacitor placed right next to a chip’s power pins?', ['Decoupling — supplying quick bursts of current and filtering noise', 'Limiting current like a resistor', 'Storing the program', 'Converting AC to DC'], 0, 'Chips draw sudden current spikes. A nearby capacitor supplies them locally so the supply voltage stays clean.'),
      tap('Tap the capacitor.', ['inductor', 'resistor', 'capacitor', 'diode'], 2, 'The capacitor symbol is two parallel plates separated by a gap.')
    ]),

  lesson('elec-inductors', 'Inductors', 'Components', 2, ['inductors', 'flyback'],
    'Magnetic energy storage, resisting changes in current, and flyback spikes.',
    [
      card('Coils resist change', 'An inductor is a coil of wire that stores energy in a magnetic field. It resists CHANGES in current. Motors, relays and solenoids all contain coils and behave like inductors.', P('inductor')),
      card('The flyback spike', 'If you suddenly switch off current through a coil, the collapsing field produces a large voltage spike. A diode across the coil (a flyback diode) gives that current a safe path.')
    ],
    [
      mc('An inductor opposes changes in…', ['Current', 'Voltage', 'Temperature', 'Resistance'], 0, 'Inductors store energy in a magnetic field and generate a voltage that fights any change in current through them.'),
      scenario('Every time your transistor switches off a relay coil, the transistor dies. What is the standard fix?', ['Add a flyback diode across the relay coil', 'Use a bigger battery', 'Remove the base resistor', 'Add an LED in series'], 0, 'The coil’s inductive kick can exceed the transistor’s voltage rating. A reverse-biased diode across the coil clamps the spike.'),
      tf('DC motor windings behave like inductors.', true, 'A motor is built from coils, so it produces inductive spikes when switched. Motor drivers include protection diodes for this reason.'),
      match('Match each part with how it handles energy.', [['Capacitor', 'Stores energy in an electric field'], ['Inductor', 'Stores energy in a magnetic field'], ['Resistor', 'Turns energy into heat']], 'Capacitors and inductors store and release energy; resistors only dissipate it.'),
      tap('Tap the inductor.', ['capacitor', 'inductor', 'battery', 'switch'], 1, 'The inductor symbol is a series of loops — a drawn coil.')
    ]),

  lesson('elec-diodes', 'Diodes', 'Components', 2, ['diodes', 'protection'],
    'One-way valves for current, forward voltage drop and reverse-polarity protection.',
    [
      card('A one-way valve', 'A diode lets current flow from anode to cathode, and blocks it the other way. The stripe on the body marks the cathode.', P('diode')),
      card('Forward voltage', 'A silicon diode needs about 0.6–0.7 V across it before it conducts well, and that voltage is “lost” across it while it conducts.', D('diode-curve'))
    ],
    [
      mc('What is the typical forward voltage drop of a silicon diode?', ['About 0.7 V', 'About 5 V', 'About 0.01 V', 'About 12 V'], 0, 'Silicon PN junctions conduct at roughly 0.6–0.7 V. Schottky diodes drop less, about 0.2–0.4 V.'),
      diagram('According to this curve, what happens below about 0.6 V forward bias?', ['Almost no current flows', 'Current is at maximum', 'The diode breaks down', 'Current flows backwards'], 0, 'The diode curve stays flat until the threshold, then rises steeply.', { visual: D('diode-curve') }),
      scenario('You want to protect a robot from someone connecting the battery backwards. What simple part helps?', ['A diode in series with the supply', 'A capacitor across the motor', 'A larger resistor', 'A second battery'], 0, 'A series diode only conducts with correct polarity. Reversed, it blocks — at the cost of a ~0.7 V drop.'),
      num('A 5 V supply passes through a silicon diode (0.7 V drop). What voltage reaches the circuit?', 4.3, 'V', '5 − 0.7 = 4.3 V.'),
      tf('Current flows through a diode from cathode to anode during normal forward conduction.', false, 'Conventional current flows from anode to cathode — in the direction of the arrow in the symbol.')
    ]),

  lesson('elec-leds', 'LEDs', 'Components', 1, ['leds', 'ohms-law'],
    'Light-emitting diodes, polarity, forward voltage and choosing a current-limiting resistor.',
    [
      card('Diodes that glow', 'An LED is a diode that emits light. It has a forward voltage (about 2 V for red, about 3 V for blue or white). The long leg is the anode (+).', P('led')),
      card('Always limit the current', 'An LED has almost no resistance once it conducts, so you must add a series resistor: R = (Vsupply − Vf) ÷ I.', loop(el('battery', '5 V'), el('resistor', '200 Ω'), el('led', 'Red', true)))
    ],
    [
      num('5 V supply, red LED with Vf = 2 V, target 15 mA. What resistor do you need?', 200, 'Ω', 'R = (5 − 2) ÷ 0.015 = 3 ÷ 0.015 = 200 Ω.', { hint: 'R = (Vs − Vf) ÷ I' }),
      mc('Which LED leg is the anode (+)?', ['The longer leg', 'The shorter leg', 'The leg near the flat edge', 'Either one'], 0, 'The longer leg is the anode. The cathode is shorter and sits next to the flat edge of the lens.'),
      predict('This LED is inserted backwards. What happens?', ['It stays off', 'It glows dimly', 'It glows brightly', 'It glows a different colour'], 0, 'Reversed, the LED blocks current like any diode, so it does not light (at low voltages it is not damaged).', { visual: loop(el('battery', '5 V'), el('resistor', '220 Ω'), el('led-rev', 'LED')) }),
      debug('This LED flashed brightly once and then died. What went wrong?', ['There is no current-limiting resistor', 'The battery is too weak', 'The LED is reversed', 'The wires are too short'], 0, 'With nothing to limit it, current rises until the LED burns out. Always add a series resistor.', { visual: loop(el('battery', '9 V'), el('led', 'LED')) }),
      tf('Blue LEDs usually have a higher forward voltage than red LEDs.', true, 'Shorter-wavelength (higher-energy) light needs a larger bandgap, so blue and white LEDs drop about 3 V versus about 2 V for red.')
    ]),

  lesson('elec-transistors', 'Transistors', 'Components', 2, ['transistors', 'switching'],
    'Using a small signal to switch a big load: BJTs, MOSFETs and low-side switching.',
    [
      card('Small signal, big load', 'A transistor lets a small control signal switch a much larger current. A microcontroller pin can only supply about 20 mA, but through a transistor it can switch a motor drawing an amp.', D('transistor-switch', { on: true })),
      card('BJT vs MOSFET', 'A BJT (e.g. NPN) is controlled by base current, roughly Ic = β × Ib. A MOSFET is controlled by gate voltage and draws almost no steady gate current — popular for motors.')
    ],
    [
      diagram('The microcontroller pin driving this transistor goes HIGH. What does the motor do?', ['Turns on', 'Stays off', 'Reverses', 'Burns out'], 0, 'Base current turns the NPN transistor on, so collector current flows through the motor to ground.', { visual: D('transistor-switch', { on: true }) }),
      mc('In a low-side NPN switch, where is the load connected?', ['Between the + supply and the collector', 'Between the emitter and ground', 'In series with the base resistor', 'Across the microcontroller pin'], 0, '“Low-side” means the transistor sits between the load and ground. The load connects from + to the collector.'),
      num('A transistor has gain β = 100 and base current 2 mA. What is the maximum collector current it can switch?', 200, 'mA', 'Ic = β × Ib = 100 × 2 mA = 200 mA.'),
      multi('Which are common uses of transistors in a robot?', ['Switching motors on and off', 'Amplifying weak sensor signals', 'Storing the program permanently', 'Driving high-power LEDs'], [0, 1, 3], 'Transistors switch and amplify. Program storage is done by flash memory (which is itself built from transistors, but that is a different job).'),
      tf('A MOSFET is controlled mainly by gate voltage, not by a steady gate current.', true, 'The gate is insulated, so once charged it draws almost no current. That makes MOSFETs efficient switches.')
    ]),

  lesson('elec-potentiometers', 'Potentiometers', 'Components', 1, ['potentiometer', 'divider'],
    'Variable resistors, wipers, and turning rotation into a voltage.',
    [
      card('An adjustable divider', 'A potentiometer is a resistor track with a sliding wiper. Connect the ends to 5 V and GND and the wiper gives a voltage proportional to the knob position.', P('potentiometer')),
      card('Everywhere in robotics', 'Knobs, joysticks and the position feedback inside hobby servos all use potentiometers.')
    ],
    [
      mc('Which terminal of a potentiometer moves when you turn it?', ['The wiper (usually the middle pin)', 'The left end', 'The right end', 'None — the body moves'], 0, 'The two outer pins connect to the ends of the track; the middle pin is the wiper.'),
      num('A pot is wired between 5 V and GND and turned to 30% of its travel. What voltage is on the wiper?', 1.5, 'V', 'The pot acts as a divider: 5 V × 0.30 = 1.5 V.'),
      scenario('How does a hobby servo know its output shaft angle?', ['A potentiometer is linked to the output shaft', 'It counts seconds', 'It uses GPS', 'It measures battery voltage'], 0, 'The servo’s control board compares the pot’s voltage with the commanded position and drives the motor to close the gap.'),
      tap('Tap the potentiometer.', ['resistor', 'potentiometer', 'capacitor', 'led'], 1, 'The potentiometer symbol is a resistor with an arrow (the wiper) pointing at it.'),
      tf('Using only one end and the wiper, a pot works as a variable resistor (rheostat).', true, 'With two terminals it simply changes resistance as you turn it.')
    ]),

  /* ---------------- Unit 4: Signals & Interfacing ---------------- */
  lesson('elec-analog-digital', 'Analog vs Digital', 'Signals', 1, ['analog', 'digital', 'signals'],
    'Continuous signals versus discrete logic levels, and why digital is noise-tolerant.',
    [
      card('Continuous vs discrete', 'An analog signal can take any value in a range — like the voltage from a microphone. A digital signal has only defined levels, usually LOW (0) and HIGH (1).', D('waveforms')),
      card('Thresholds', 'On 5 V logic, anything below about 1.5 V reads LOW and anything above about 3 V reads HIGH. Small noise does not change the value — that is why digital is robust.')
    ],
    [
      diagram('Which waveform is digital?', ['B — it jumps between two levels', 'A — it varies smoothly', 'Both', 'Neither'], 0, 'Signal B only takes two values, LOW and HIGH. Signal A varies continuously, so it is analog.', { visual: D('waveforms') }),
      multi('Which sensors naturally produce analog signals?', ['Microphone', 'Thermistor', 'Push button', 'Light-dependent resistor'], [0, 1, 3], 'A push button is either pressed or not — inherently digital. The others vary smoothly with sound, temperature or light.'),
      mc('On a 5 V logic input, a voltage of 0.3 V reads as…', ['LOW (0)', 'HIGH (1)', 'Undefined', '0.3'], 0, '0.3 V is well below the LOW threshold, so the pin reads 0.'),
      tf('Digital signals tolerate small amounts of noise better than analog signals.', true, 'A little noise does not cross the logic threshold, so the value is unchanged. In an analog signal, any noise changes the reading.'),
      concept('A sensor outputs any voltage between 0 and 3.3 V depending on temperature. This is…', ['An analog signal', 'A digital signal', 'A PWM signal', 'A serial signal'], 0, 'A continuous range of possible values is the definition of analog.')
    ]),

  lesson('elec-adc', 'Analog-to-Digital (ADC)', 'Signals', 2, ['adc', 'analog'],
    'How a microcontroller turns a voltage into a number: resolution, steps and scaling.',
    [
      card('Measuring with numbers', 'An ADC turns a voltage into an integer. An n-bit ADC has 2ⁿ levels. Arduino Uno: 10-bit (0–1023). Raspberry Pi Pico: 12-bit (0–4095).', D('adc', { bits: 3 })),
      card('Converting back', 'Voltage ≈ reading ÷ (2ⁿ − 1) × Vref. Inputs must stay between 0 V and Vref.')
    ],
    [
      num('How many distinct levels does a 10-bit ADC have?', 1024, 'levels', '2¹⁰ = 1024 levels, numbered 0 to 1023.'),
      num('A 10-bit ADC with a 5 V reference reads 512. Roughly what voltage is on the pin?', 2.5, 'V', '512 ÷ 1023 × 5 ≈ 2.50 V — about half of the reference.', { tolerance: 0.02 }),
      num('How many levels does the Pico’s 12-bit ADC have?', 4096, 'levels', '2¹² = 4096 levels (0–4095).'),
      mc('What does higher ADC resolution give you?', ['Smaller voltage steps (finer detail)', 'A higher maximum voltage', 'Faster motors', 'Less noise in the wires'], 0, 'More bits divide the same range into more, smaller steps. A 12-bit ADC on 3.3 V resolves about 0.8 mV.'),
      tf('You should never put a voltage higher than the ADC reference (or supply) on an analog pin.', true, 'Exceeding the reference saturates the reading at best and can damage the pin at worst. Scale it down with a divider.')
    ]),

  lesson('elec-pwm', 'PWM', 'Signals', 2, ['pwm', 'motors', 'leds'],
    'Pulse-width modulation: faking an analog level by switching fast.',
    [
      card('Fast on/off switching', 'PWM switches a pin fully on and off very quickly. The duty cycle is the fraction of time it is on. The average voltage = duty × Vhigh. LEDs look dimmer and motors run slower at lower duty.', S('pwm')),
      card('8-bit PWM on Arduino', 'analogWrite(pin, value) takes 0–255: 0 = always off, 127 ≈ 50%, 255 = always on.')
    ],
    [
      num('A 5 V PWM signal has a 25% duty cycle. What is the average voltage?', 1.25, 'V', '0.25 × 5 V = 1.25 V average.'),
      num('analogWrite(pin, 191) on an 8-bit Arduino PWM gives roughly what duty cycle, in percent?', 75, '%', '191 ÷ 255 ≈ 0.749, so about 75%.', { tolerance: 0.02 }),
      mc('PWM controls motor speed by changing…', ['The fraction of time the power is on', 'The voltage of each pulse', 'The motor’s resistance', 'The direction of rotation'], 0, 'Each pulse is full voltage. Changing how long it stays on changes the average power the motor receives.'),
      diagram('What is the duty cycle of this signal?', ['75%', '25%', '50%', '100%'], 0, 'The signal is high for three quarters of each period.', { visual: D('pwm', { duty: 75 }) }),
      tf('PWM works by lowering the voltage of the HIGH pulses.', false, 'The pulses stay at full voltage. Only their width (time) changes.')
    ]),

  lesson('elec-pull-up', 'Pull-up Resistors', 'Signals', 2, ['pull-up', 'inputs', 'buttons'],
    'Why inputs float, and how a pull-up gives them a defined HIGH level.',
    [
      card('Floating inputs', 'An input pin connected to nothing “floats” and picks up noise — it reads random HIGHs and LOWs. A button alone cannot fix this: when released, the pin is connected to nothing.'),
      card('Pull it up', 'A pull-up resistor (typically 10 kΩ) connects the pin weakly to VCC so it reads HIGH by default. The button connects the pin to GND, so pressing it reads LOW. This is called active-low.', D('pull', { mode: 'up', pressed: false }))
    ],
    [
      diagram('With this pull-up circuit and the button NOT pressed, the pin reads…', ['HIGH', 'LOW', 'Random', '2.5 V'], 0, 'The resistor pulls the pin to VCC and nothing is pulling it down, so it reads HIGH.', { visual: D('pull', { mode: 'up', pressed: false }) }),
      mc('What does a floating input pin read?', ['Unpredictable values that change with noise', 'Always LOW', 'Always HIGH', 'Exactly half of VCC'], 0, 'A floating pin has no defined voltage, so it picks up interference — even your hand nearby can change it.'),
      code('Enable the Arduino’s built-in pull-up on pin 2.', 'cpp', 'void setup() {\n  pinMode(2, ___);\n}', ['INPUT_PULLUP', 'OUTPUT', 'INPUT_PULLDOWN', 'HIGH'], 0, 'INPUT_PULLUP switches on the internal pull-up (about 20–50 kΩ), so no external resistor is needed.'),
      predict('With a pull-up, what does digitalRead return while the button is held down?', ['LOW', 'HIGH', 'It alternates', 'An error'], 0, 'Pressing connects the pin directly to GND, which overpowers the weak pull-up. The pin reads LOW.', { visual: D('pull', { mode: 'up', pressed: true }) }),
      tf('Around 10 kΩ is a typical external pull-up value.', true, 'Strong enough to beat noise, weak enough that pressing the button only wastes about 0.5 mA at 5 V.')
    ]),

  lesson('elec-pull-down', 'Pull-down Resistors', 'Signals', 2, ['pull-down', 'inputs', 'buttons'],
    'The pull-down alternative, and when to choose pull-up vs pull-down.',
    [
      card('Pull it down', 'A pull-down resistor ties the pin weakly to GND, so it reads LOW by default. The button connects the pin to VCC, so pressing reads HIGH. This is active-high.', D('pull', { mode: 'down', pressed: false })),
      card('Which one?', 'Both work. Pull-ups are more common because many microcontrollers have internal pull-ups, and I2C buses require pull-ups on SDA and SCL.')
    ],
    [
      diagram('In this pull-down circuit, the button is pressed. The pin reads…', ['HIGH', 'LOW', 'Floating', 'Negative'], 0, 'The button connects the pin directly to VCC, so it reads HIGH. When released, the pull-down returns it to LOW.', { visual: D('pull', { mode: 'down', pressed: true }) }),
      match('Match each configuration to its resting value.', [['Pull-up, released', 'HIGH (idle)'], ['Pull-up, pressed', 'LOW (active-low)'], ['Pull-down, released', 'LOW (idle)'], ['Pull-down, pressed', 'HIGH (active-high)']], 'The resistor sets the resting level; the button forces the opposite level.'),
      mc('Which bus requires pull-up resistors on its data and clock lines?', ['I2C', 'PWM', 'USB power', 'Analog input'], 0, 'I2C devices only ever pull lines LOW (open-drain). The pull-ups return the lines HIGH.'),
      review('Review: what does a pin with no pull resistor and an open button read?', ['Unpredictable (floating)', 'Always HIGH', 'Always LOW', 'The ADC value'], 0, 'Without a pull resistor the pin is undefined when the button is open. That is the whole reason pull resistors exist.'),
      tf('A pull-down resistor makes a button input active-high.', true, 'Pressing the button drives the pin HIGH, so a HIGH reading means “pressed”.')
    ]),

  /* ---------------- Unit 5: Systems ---------------- */
  lesson('elec-sensors', 'Sensors', 'Systems', 2, ['sensors', 'divider'],
    'Transducers that turn the physical world into electrical signals.',
    [
      card('From world to wire', 'A sensor converts a physical quantity — light, temperature, distance, force — into an electrical signal. Some vary their resistance, some output a voltage, some output digital data.'),
      card('Resistive sensors need a divider', 'An LDR (light-dependent resistor) or thermistor changes resistance. Put it in a voltage divider with a fixed resistor and read the middle point with the ADC.', D('divider', { vin: '5 V', r1: 'LDR', r2: '10 kΩ' }))
    ],
    [
      match('Match each sensor to what it measures.', [['LDR', 'Light'], ['Thermistor', 'Temperature'], ['Hall-effect sensor', 'Magnetic field'], ['Strain gauge', 'Force / bending']], 'Each sensor turns one physical effect into a change in an electrical property.'),
      mc('How do you usually read an LDR with a microcontroller?', ['Put it in a voltage divider and read the midpoint with the ADC', 'Connect it straight to a digital pin', 'Wire it in series with the battery', 'Use PWM'], 0, 'The ADC measures voltage, not resistance. The divider converts the changing resistance into a changing voltage.'),
      predict('An LDR is the TOP resistor of a divider. Light falling on it lowers its resistance. The midpoint voltage…', ['Rises', 'Falls', 'Stays the same', 'Goes negative'], 0, 'Less resistance on top means a larger share of the voltage appears across the bottom resistor, so the output rises.', { visual: D('divider', { vin: '5 V', r1: 'LDR', r2: '10 kΩ' }) }),
      tap('Tap the light sensor (LDR).', ['ldr', 'led', 'diode', 'ir'], 0, 'The LDR symbol is a resistor with arrows pointing IN (light arriving). An LED has arrows pointing OUT.'),
      tf('A thermistor’s resistance changes with temperature.', true, 'NTC thermistors drop in resistance as they warm up; PTC types rise.')
    ]),

  lesson('elec-actuators', 'Actuators', 'Systems', 2, ['actuators', 'motors'],
    'Parts that turn electrical energy into motion, light, sound or heat — and why they need drivers.',
    [
      card('Making things happen', 'Actuators turn electrical energy into action: motors spin, solenoids push, relays switch, buzzers beep. They usually need much more current than a logic pin can supply.'),
      card('Drivers in between', 'A transistor, MOSFET, relay or dedicated motor-driver chip sits between the microcontroller and the actuator, so the pin only provides a tiny control signal.')
    ],
    [
      mc('Which of these is an actuator?', ['Solenoid', 'Thermistor', 'Photodiode', 'Microphone'], 0, 'A solenoid converts current into linear motion. The others are sensors.'),
      multi('Select all the actuators.', ['Servo', 'Buzzer', 'Thermistor', 'Relay', 'LDR'], [0, 1, 3], 'Servos move, buzzers make sound and relays switch contacts. Thermistors and LDRs sense.'),
      tf('A microcontroller pin can drive a 12 V solenoid directly.', false, 'The pin supplies at most a few tens of mA at 3.3–5 V. A solenoid needs a driver transistor, a separate supply and a flyback diode.'),
      scenario('Each time a relay clicks on, your microcontroller resets. What is the most likely cause?', ['The supply voltage dips under the sudden load', 'The relay is too quiet', 'The code has a typo', 'The LED is reversed'], 0, 'A sudden current draw sags a shared supply below the MCU’s minimum. Separate supplies, decoupling capacitors and a flyback diode fix it.'),
      review('Review: what protects a transistor from the voltage spike when switching off an inductive load?', ['A flyback diode', 'A pull-up resistor', 'A potentiometer', 'A breadboard'], 0, 'The flyback diode gives the coil’s current a path when the switch opens.')
    ]),

  lesson('elec-regulation', 'Voltage Regulation', 'Systems', 2, ['regulators', 'power'],
    'Linear regulators, LDOs, switching converters and the heat they produce.',
    [
      card('Steady voltage', 'Batteries sag as they discharge, but chips need a stable supply. A regulator outputs a fixed voltage (e.g. 5 V or 3.3 V) from a varying input.', D('regulator', { kind: 'linear' })),
      card('Linear vs switching', 'A linear regulator burns the extra voltage as heat: P = (Vin − Vout) × I. A switching (buck) converter chops the input quickly and is often 85–95% efficient.')
    ],
    [
      num('A linear regulator drops 9 V to 5 V at 0.5 A. How much power is wasted as heat?', 2, 'W', 'P = (9 − 5) × 0.5 = 2 W — enough to need a heatsink.'),
      mc('What does a buck converter do?', ['Steps a voltage down efficiently by switching', 'Steps a voltage up', 'Converts DC to AC', 'Measures current'], 0, 'Buck = step-down switching converter. Boost = step-up.'),
      num('An LDO regulator outputs 3.3 V and needs 0.3 V of dropout. What is the minimum input voltage?', 3.6, 'V', 'Vin must be at least Vout + dropout = 3.3 + 0.3 = 3.6 V.'),
      tf('For a large voltage drop at high current, a switching regulator is usually more efficient than a linear one.', true, 'A linear regulator wastes all the excess voltage as heat; a switcher transfers energy with far less loss.'),
      scenario('A robot runs motors from a 7.4 V pack and needs 3.3 V for its microcontroller. What is a good approach?', ['Use a regulator for the 3.3 V logic and feed the motors from the pack via a driver', 'Connect the MCU straight to 7.4 V', 'Use a voltage divider for the MCU', 'Run the motors from the MCU’s 3.3 V pin'], 0, 'Logic gets a clean regulated rail; motors take raw battery power through a driver. Grounds are shared.')
    ]),

  lesson('elec-debugging', 'Circuit Debugging', 'Systems', 2, ['debugging', 'multimeter'],
    'A systematic way to find faults with a multimeter.',
    [
      card('Work methodically', 'Check power first, then measure voltages at key points, following the signal from source to load. Halve the search area each step. Compare what you measure with what you expect.'),
      card('Meter modes', 'Voltage: probes across a part, circuit powered. Continuity/resistance: circuit OFF, checks for breaks or shorts. Current: meter in series.')
    ],
    [
      order('Order these debugging steps.', ['Confirm the symptom', 'Check the power supply voltage', 'Measure voltages at key points', 'Narrow down to one section', 'Fix and re-test'], 'Start from the symptom and the supply, then follow the signal. Re-test to confirm the fix worked.'),
      debug('The lamp is off. Your meter reads 9 V across the gap marked in the loop. What does that tell you?', ['The circuit is open at that gap', 'The battery is flat', 'The lamp is shorted', 'Everything is fine'], 0, 'Measuring the full supply voltage across a point means current is not flowing and the break is right there.', { visual: loop(el('battery', '9 V'), el('break', 'gap'), el('lamp', 'Lamp')) }),
      mc('A resistor that should carry current reads 0 V across it. Most likely…', ['No current flows — there is an open circuit somewhere', 'The resistor is perfect', 'Too much current flows', 'The meter is in current mode'], 0, 'By Ohm’s law V = I × R. If V = 0 across a non-zero resistor, I must be 0.'),
      tf('You should measure resistance while the circuit is powered.', false, 'Resistance and continuity modes inject their own small current. Power must be off or readings will be wrong and the meter may be damaged.'),
      scenario('Your meter beeps in continuity mode between the + and − rails of an unpowered breadboard. What does this mean?', ['There is a short circuit between the rails', 'The rails are working correctly', 'The battery is charged', 'An LED is lit'], 0, 'Continuity between supply rails means a short. Find and fix it before applying power.')
    ])
];
