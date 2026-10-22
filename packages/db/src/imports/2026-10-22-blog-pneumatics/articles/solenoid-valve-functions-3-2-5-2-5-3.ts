import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Solenoid valve functions: 3/2, 5/2 and 5/3. Ports/positions notation and symbol conventions (Hafner-Pneumatik
 * training course, ch. 5, citing DIN ISO 1219: one square per position, arrows for flow, T for a closed port, port
 * numbers drawn only in the basic-position square). Port numbering 1/2/4/3/5 and pilot ports 12/14 (Festo training
 * table citing DIN ISO 5599-3; Emerson/Numatics ISO 5599-2 catalogue port marks "4 2 / 5 1 3 / 14 12"; ISO 11727
 * scope for port and control-mechanism identification). Pilot pressure, external pilot, coil voltages, response time,
 * manual-override styles, 3-position closed/exhaust/pressure centre codes, 50 °C ambient limit (SMC SY5000 product
 * page, smc.eu). Air leakage — valves cannot hold pressure; closed-centre stops drift (SMC common solenoid-valve
 * precautions). Two-hand/safety framing kept out (see manual-valves article). Left out as unsourced: coil wattages,
 * per-type minimum pressures for single vs double vs 3-position (distributor listings disagree with SMC's page),
 * Cv figures for any of our listings.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'solenoid-valve-functions-3-2-5-2-5-3',
  title: 'Solenoid valve functions explained: 3/2, 5/2 and 5/3 valves, centre conditions and port numbers',
  excerpt:
    'What “5/2” and “5/3 closed centre” actually mean, how to read the ISO symbol in words, normally closed vs normally open 3/2 valves, single vs double solenoid 5/2 valves, the three 5/3 centre conditions and when each one is right, direct-acting vs pilot-operated valves and the pilot pressure they need, and the port numbers 1, 2, 3, 4, 5, 12 and 14.',
  categorySlug: 'pneumatics',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Solenoid Valve Functions: 3/2, 5/2 and 5/3 Explained',
  seoDescription:
    '3/2, 5/2 and 5/3 solenoid valves explained: ISO symbols, NC vs NO, single vs double solenoid, closed, exhaust and pressure centres, pilot pressure and ports.',
  focusKeyword: '5/2 solenoid valve',
  publishedAt: '2026-10-22T12:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The two numbers are ports / positions: a 5/2 valve has five working ports and two switching positions. Pilot ports are not counted.',
        'A 3/2 valve drives a single-acting cylinder or pilots another valve; a 5/2 or 5/3 valve drives a double-acting cylinder. Normally closed and normally open describe the 3/2 valve at rest.',
        'A single-solenoid 5/2 springs back when the coil drops out; a double-solenoid 5/2 stays where it was last sent. Choose by what the machine should do on power loss.',
        'A 5/3 valve’s centre is closed, exhaust or pressure. None of them is a positive lock: SMC warns valves leak and a closed-centre stop drifts.',
        'Most solenoid valves are pilot-operated and need a minimum supply pressure to shift — SMC gives 0.1 MPa for the internally piloted SY5000. Below that, use an external pilot or a direct-acting valve.',
        'Port 1 is supply, 2 and 4 are outlets, 3 and 5 are exhausts; pilot 14 connects 1 to 4 and pilot 12 connects 1 to 2.',
      ],
    },
    {
      type: 'lead',
      html: 'A valve enquiry that reads “5/2 solenoid, 1/4, 24 V” is three-quarters of a specification. The missing quarter — single or double solenoid, internal or external pilot, and on a 5/3 which centre — is what decides how the machine behaves when the power fails, the air drops or the operator hits stop. This guide reads the function codes in plain words so you can specify the whole valve the first time.',
    },

    { type: 'section_head', number: '/01', title: 'Ports, positions and the symbol in words.', anchor: 'ports-positions' },
    {
      type: 'prose',
      html: '<p>Directional valves are described by two numbers: the number of working ports on the main valve, then the number of switching positions. Pilot ports are not counted. A <strong>3/2</strong> valve has three ports and two positions; a <strong>5/2</strong> has five ports and two positions; a <strong>5/3</strong> has five ports and three positions. Some catalogues, particularly North American ones, say <strong>“4-way”</strong> for a valve that switches two outlets — a 5-port 4-way valve is the same job as a 5/2 with separate exhausts, which is why our listings carry titles such as “4-Way, 2-Position, 5-Port”.</p><p>The symbol is standardised under ISO 1219. Read it like this:</p><ul><li><strong>One square per position.</strong> A 5/2 symbol is two squares side by side; a 5/3 is three.</li><li><strong>Arrows inside a square</strong> show where air flows in that position; a double arrow means flow either way.</li><li><strong>A “T”</strong> means a closed port — air goes nowhere.</li><li><strong>Port numbers</strong> are written only on the square that shows the valve’s basic (rest) position.</li><li><strong>The boxes at each end</strong> show how the valve is moved: a solenoid, a pilot, a lever, a spring. A spring on one end means that end is the rest position; a solenoid on both ends means a double-solenoid valve.</li></ul><p>To read it, imagine the actuator at one end pushing its neighbouring square into the basic position: the arrows in that square are the connections you get when it is energised.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Port and pilot numbers used on pneumatic valves (numbering per ISO 5599-3 as cited in Festo training material; identification scope in ISO 11727)',
      columns: ['Port', 'Function', 'Notes'],
      rows: [
        { cells: ['1', 'Supply (pressure inlet)', 'Connect to the regulated air supply.'] },
        { cells: ['2', 'Outlet (working port)', 'Even numbers are outlets.'] },
        { cells: ['4', 'Outlet (working port)', 'The second outlet on a 5-port valve.'] },
        { cells: ['3', 'Exhaust', 'Odd numbers after 1 are exhausts. On a 5-port valve, 2 exhausts through 3.'] },
        { cells: ['5', 'Exhaust', 'On a 5-port valve, 4 exhausts through 5. Fit silencers or exhaust flow controls in 3 and 5.'] },
        { cells: ['14', 'Pilot or actuator that connects 1 to 4', 'Named for the connection it makes.'] },
        { cells: ['12', 'Pilot or actuator that connects 1 to 2', 'The spring end on a single-solenoid valve; the second solenoid on a double.'] },
        { cells: ['10', 'Pilot signal that leaves port 1 connected to nothing (no output)', 'Listed among pilot designations in Festo’s ISO 5599-3 table.'] },
        { cells: ['82, 84', 'Pilot exhaust (venting) ports', 'Seen on valves with external pilot supply.'] },
      ],
    },

    { type: 'section_head', number: '/02', title: 'The 3/2 valve: normally closed or normally open.', anchor: '3-2-valves' },
    {
      type: 'prose',
      html: '<p>A 3/2 valve has supply (1), outlet (2) and exhaust (3). In one position it connects 1 to 2 and blocks 3; in the other it connects 2 to 3 and blocks 1. Which of those is the rest position is the whole of the “normally” question:</p><ul><li><strong>Normally closed (NC):</strong> at rest, supply is blocked and the outlet is vented. Energise the coil and the outlet is pressurised. This is the usual choice for a single-acting cylinder that should retract (or a clamp that should open) when the signal is removed, and for a valve that pilots another valve.</li><li><strong>Normally open (NO):</strong> at rest, the outlet is pressurised; energise the coil to vent it. Use it where air must be present without a signal — a single-acting brake held off by air, or a clamp that must stay applied when the control power is removed.</li></ul><p>A pair of 3/2 valves can also run a double-acting cylinder, one per port. That gives a fourth, “both vented” or “both pressurised” state a 5/2 cannot, and is the basis of some “dual 3/2” valve bodies. On a <strong>2/2 valve</strong> — such as the Parker 2-way normally-closed solenoid valves and SMC VX2 2-way media valves we list — there is no exhaust: the valve simply opens or closes a line, which suits blow-off, air knives and process media rather than cylinder control.</p>',
    },

    { type: 'section_head', number: '/03', title: '5/2 valves: single solenoid or double solenoid.', anchor: '5-2-valves' },
    {
      type: 'prose',
      html: '<p>A 5/2 valve drives a double-acting cylinder: in one position 1 feeds 4 while 2 exhausts through 3; in the other 1 feeds 2 while 4 exhausts through 5. Both outlets are always either pressurised or exhausting, so the cylinder is always being driven one way or the other.</p><h3>Single solenoid, spring return (monostable)</h3><p>One coil and a return spring (or an air spring fed from the supply). Energise the coil and the valve shifts; drop the signal and it returns. The cylinder therefore has a defined position whenever the coil is off — including on an emergency stop or a power failure. The PLC must hold the output on for as long as the cylinder should stay shifted.</p><h3>Double solenoid, detented or bistable</h3><p>Two coils, no spring. A short pulse to one coil shifts the valve, and it stays there after the pulse ends — the spool is held by friction or a detent until the opposite coil is pulsed. Numatics sells this as a “detented” 5/2, a title you will see in our list. The valve has memory: when power fails it stays where it was, so a cylinder keeps doing what it was last told. That is useful where losing a signal must not drop a part or open a clamp, and dangerous where losing power should take the machine to a safe position. If both coils are energised together, which wins depends on the design — Festo, for example, offers ISO 5599-1 double-solenoid valves with a dominant signal at 14 — so do not rely on it; interlock the outputs.</p><p>Choose by asking one question: <em>on loss of power, should the cylinder go to a defined position or stay where it is?</em> Defined position: single solenoid. Stay: double solenoid. Neither choice makes the valve a safety device — that is a function of the whole control system, assessed against the machine’s risk.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A valve is not a lock.',
      body: 'SMC’s general solenoid-valve precautions state that valves are subject to air leakage and cannot be used to hold pressure, and that a cylinder stopped with a closed-centre valve cannot be stopped accurately or held for long because air is compressible. Where a stopped cylinder must not move — vertical loads, maintenance access — use a rod lock or brake and the machine’s lockout procedure, not a valve position.',
    },

    { type: 'section_head', number: '/04', title: 'The three 5/3 centre conditions.', anchor: '5-3-centres' },
    {
      type: 'prose',
      html: '<p>A 5/3 valve has the same two outer positions as a 5/2, plus a spring-centred middle position the valve returns to when neither coil is energised. SMC’s SY5000 code list names the three standard centres: <strong>closed centre</strong>, <strong>exhaust centre</strong> and <strong>pressure centre</strong>. Parker sells the closed-centre version as “3 Position, All Ports Blocked”.</p>',
    },
    {
      type: 'comparison_table',
      caption: '5/3 centre conditions: what each does with the coils off',
      columns: ['Centre', 'Ports in the middle position', 'Cylinder behaviour', 'Typical use', 'Watch out for'],
      rows: [
        { cells: ['Closed (all ports blocked)', '1, 2, 3, 4 and 5 all blocked', 'Air is trapped on both sides; the piston stops roughly where it was', 'Stopping a horizontal cylinder mid-stroke; holding while a sensor reads', 'Drifts with seal and spool leakage; overshoots because air is compressible'] },
        { cells: ['Exhaust (open, APB to exhaust)', '1 blocked; 2 and 4 open to exhaust', 'Both sides vented; the rod is free to be moved by hand or by gravity', 'Releasing a cylinder so it can be positioned manually; feeding pilot-operated check valves so they close', 'A vertical load will fall unless held by a check valve or brake'] },
        { cells: ['Pressure (APB to supply)', '1 connected to both 2 and 4; exhausts blocked', 'Both sides pressurised; a single-rod cylinder extends slowly on the area difference', 'Balancing with a double-rod cylinder; stopping with pilot-check valves on both ports', 'Not a stop on a single-rod cylinder — it creeps out'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>On a single-rod cylinder the cap end has more area than the rod end, so in a pressure centre the larger force wins and the rod extends. That is why a pressure-centre valve is usually paired with a double-rod cylinder (equal areas) or with pilot-operated check valves in the cylinder lines. The exhaust centre is the usual partner for pilot-operated check valves: it vents both pilot lines so the checks snap shut and trap the air in the cylinder. If the job is to stop a cylinder in mid-stroke and keep it there, read our guide to <a href="/blog/cylinder-speed-control-and-quick-exhaust-valves">cylinder speed control and holding</a> before choosing a centre.</p>',
    },

    { type: 'section_head', number: '/05', title: 'Direct-acting vs pilot-operated, and pilot pressure.', anchor: 'pilot' },
    {
      type: 'prose',
      html: '<p>In a <strong>direct-acting</strong> valve the solenoid armature moves the sealing element itself. It works from zero pressure, but because the coil must overcome the full force of the air on the seat, direct-acting valves stay small in flow or large in coil power. They suit small 2/2 and 3/2 valves and pilot duty.</p><p>In a <strong>pilot-operated</strong> (solenoid-piloted) valve, the coil only switches a tiny pilot valve; the supply air then pushes the main spool. Small coil, large flow — which is why almost every 5/2 and 5/3 cylinder valve is pilot-operated. The catch is a <strong>minimum operating pressure</strong>: below it, the pilot air cannot shift the spool. SMC publishes these figures for the SY5000:</p><ul><li><strong>Internal pilot:</strong> 0.1 to 0.7 MPa (the main supply also feeds the pilot).</li><li><strong>External pilot:</strong> main valve from −100 kPa (vacuum) to 0.7 MPa, with a separate pilot supply of 0.25 to 0.7 MPa.</li></ul><p>So if a valve must switch vacuum, very low pressure, or a supply that falls away during a cycle, specify the external-pilot version and give it its own steady pilot supply. Check the minimum pressure on each series you buy; it differs between makers and between single, double and three-position versions.</p>',
    },

    { type: 'section_head', number: '/06', title: 'Voltage, coil, connector and manual override.', anchor: 'coil' },
    {
      type: 'prose',
      html: '<p>Coil voltage is part of the part number, not a setting. SMC’s SY5000 page lists 3, 5, 6, 12 and 24 V DC and 100, 110, 200 and 220 V AC, plus a power-saving circuit option on 12 and 24 V DC, surge-voltage suppressors and indicator lights. It quotes a response time of 32 ms or less at 0.5 MPa without light and suppressor. Specify:</p><ul><li><strong>Voltage and AC/DC</strong> — 24 V DC is the common automation choice; match the PLC output card.</li><li><strong>Electrical entry</strong> — flying leads (grommet), plug connector, or DIN 43650 terminal; on manifolds, a plug-in or multi-pin/fieldbus connection.</li><li><strong>Light and suppressor</strong> — a suppressor protects the PLC output from the coil’s turn-off spike.</li><li><strong>Manual override</strong> — a small button or slot on the pilot that shifts the valve without power, for commissioning and fault-finding. SMC offers a non-locking push type and push-turn locking types (slotted or lever). A locking override left on will hold the valve shifted regardless of the PLC — check every override is released before handing a machine over.</li></ul><p>Temperature belongs on the list too. SMC gives 50 °C as the SY5000’s maximum ambient and fluid temperature. In a control cabinet or on machinery in direct sun, check the enclosure temperature against that figure rather than the outdoor air temperature.</p>',
    },
    {
      type: 'decision_tree',
      heading: 'Which valve function?',
      branches: [
        { condition: 'Single-acting cylinder, or piloting another valve?', outcome: '3/2 — normally closed if the outlet should be vented with no signal, normally open if it should be pressurised.' },
        { condition: 'Just open or close a line (blow-off, media)?', outcome: '2/2 valve.' },
        { condition: 'Double-acting cylinder, must go to a known position on power loss?', outcome: '5/2 single solenoid, spring return.' },
        { condition: 'Double-acting cylinder, must stay where it is on signal loss?', outcome: '5/2 double solenoid (detented / bistable).' },
        { condition: 'Need to stop mid-stroke briefly?', outcome: '5/3 closed centre — accepting drift and overshoot.' },
        { condition: 'Need the cylinder free to move by hand, or using pilot-operated checks?', outcome: '5/3 exhaust centre.' },
        { condition: 'Supply may be below the valve’s minimum pressure, or switching vacuum?', outcome: 'External-pilot version or a direct-acting valve.' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the difference between a 5/2 and a 5/3 solenoid valve?', answer: 'A 5/2 has two positions and always drives the cylinder one way or the other. A 5/3 adds a spring-centred middle position — closed, exhaust or pressure centre — that the valve returns to when neither coil is energised.' },
        { question: 'What does 5/2 mean on a pneumatic valve?', answer: 'Five working ports (supply 1, outlets 2 and 4, exhausts 3 and 5) and two switching positions. Pilot ports are not counted.' },
        { question: 'What is the difference between a single and double solenoid valve?', answer: 'A single-solenoid valve springs back to its rest position when the coil is de-energised. A double-solenoid valve has no spring and stays in the last position it was switched to until the other coil is energised.' },
        { question: 'What do ports 12 and 14 mean on a solenoid valve?', answer: 'They are the pilot or actuator ports, numbered for the connection they make: 14 connects supply 1 to outlet 4, and 12 connects supply 1 to outlet 2.' },
        { question: 'Can a 5/3 closed centre valve hold a cylinder in position?', answer: 'Only briefly and approximately. SMC warns that valves leak and air is compressible, so a closed-centre stop overshoots and drifts. Use a rod lock or brake where position must be held.' },
        { question: 'Why does my solenoid valve click but the cylinder does not move?', answer: 'On a pilot-operated valve the coil can switch while the supply is below the valve’s minimum operating pressure, so the main spool does not shift. Check the supply pressure, or use an external-pilot or direct-acting valve.' },
      ],
    },

    { type: 'section_head', number: '/07', title: 'What we list.', anchor: 'what-we-list' },
    {
      type: 'prose',
      html: '<p>Every listing on our solenoid valves shelf — 3/2, 5/2 and 5/3 valves, valve series and manifolds from SMC, Parker, ARO and Numatics — sold by maker part number.</p>' + stockList(['pneumatic-solenoid-valves']),
    },
    {
      type: 'product_embed',
      heading: 'Solenoid valves by function',
      skus: [
        'IH-PAR-SOLENOID-AIR-CONTROL-VALVE-3-WAY-2-POSITION',
        'IH-PAR-SOLENOID-AIR-CONTROL-VALVE-2-WAY-NORMALLY-CLOSED',
        'IH-SMC-SY5000-SERIES-VALVE',
        'IH-SMC-SY3000-SERIES-VALVE',
        'IH-NUM-SOLENOID-AIR-CONTROL-VALVE-4-WAY-2-POSITION-5-2',
        'IH-NUM-SOLENOID-AIR-CONTROL-VALVE-4-WAY-3-POSITION-5-POR',
        'IH-PAR-SOLENOID-AIR-CONTROL-VALVE-3-POSITION-ALL-PORTS-B',
        'IH-SMC-SOLENOID-AIR-CONTROL-VALVE-5-WAY-3-POSITION',
      ],
    },
    { type: 'category_link', slug: 'pneumatic-solenoid-valves', label: 'Pneumatic solenoid valves', blurb: '3/2, 5/2 and 5/3 valves and valve manifolds from SMC, Parker, ARO and Numatics.' },
    { type: 'category_link', slug: 'pneumatic-control-valves', label: 'Manual and air-pilot valves', blurb: 'Hand-lever, foot, mechanical and air-piloted valves for circuits without solenoids.' },
    {
      type: 'related_articles',
      slugs: [
        'sizing-pneumatic-valves-flow-cv',
        'cylinder-speed-control-and-quick-exhaust-valves',
        'manual-and-pilot-operated-air-valves',
        'pneumatic-cylinder-types-guide',
        'air-safety-relief-soft-start-and-lockout-valves',
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-22',
      note: 'Symbol and port conventions from ISO 1219 / ISO 5599-3 training material; pilot pressure, voltages, overrides and centre codes from SMC’s SY5000 product page; holding limits from SMC’s solenoid valve precautions.',
    },
    {
      type: 'cta_block',
      heading: 'Matching or replacing a solenoid valve?',
      body: 'Send us the maker part number from the valve or manifold label, or the function (3/2, 5/2, 5/3 and centre), port size, voltage and pilot type. We will quote the maker’s valve or its current replacement.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
