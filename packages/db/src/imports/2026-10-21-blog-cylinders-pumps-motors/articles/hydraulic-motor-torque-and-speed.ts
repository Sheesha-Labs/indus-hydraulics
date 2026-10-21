import type { BlogArticleSeed } from '../shared'

/**
 * Motor sizing from first principles: T(Nm) = cc × Δbar ÷ 20π × ηm; T(lb-in) = in³ × Δpsi ÷ 2π; n = Q ÷ V × ηv;
 * P(kW) = T × n ÷ 9549. Worked figures computed 2026-10-21. Displacement and intermittent ratings quoted from
 * our own orbital-motor listings (BMV up to 20,179 lb-in intermittent, BMMZ 8.2–50.3 cc, BMK6 up to 981.6 cc).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-motor-torque-and-speed',
  title: 'Hydraulic motor torque and speed: how to size displacement, pressure and flow for the load',
  excerpt:
    'Torque comes from displacement and pressure drop, speed from flow and displacement, and the number that sinks most motor selections is starting torque. The formulas, a torque table by displacement, worked examples for an auger, a conveyor and a wheel drive, and how to read continuous, intermittent and peak ratings.',
  categorySlug: 'cylinders-pumps-motors',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Hydraulic Motor Torque & Speed Calculation: Sizing Guide',
  seoDescription:
    'How to calculate hydraulic motor torque (displacement × pressure drop) and speed (flow ÷ displacement), with torque tables, worked examples, starting torque, back pressure and continuous vs intermittent ratings.',
  focusKeyword: 'hydraulic motor torque calculation',
  publishedAt: '2026-10-21T06:40:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Torque (Nm) = displacement (cc/rev) × pressure drop (bar) ÷ 62.8, times mechanical efficiency. A 400 cc motor across 150 bar gives 955 Nm in theory and about 810 Nm in practice.',
        'Speed (rpm) = flow (L/min) × 1,000 ÷ displacement, times volumetric efficiency. The same 400 cc motor on 40 L/min turns at about 90–100 rpm.',
        'The pressure that counts is the drop across the motor — inlet minus outlet — so back pressure on the return line costs torque directly.',
        'Size for the hardest moment, which is usually breakaway from standstill under load, where motors deliver noticeably less than their running torque.',
        'Continuous ratings are for all-day work; intermittent ratings for a small share of each minute; peak ratings for momentary spikes only.',
      ],
    },
    {
      type: 'lead',
      html: 'A hydraulic motor is a pump run backwards: oil goes in under pressure, the shaft turns, and the oil comes out at lower pressure. Sizing one is the same two questions as sizing a pump — torque and speed — with one complication that pumps do not have: a motor has to start its load from rest, and the torque it can manage at that moment is the number most selections forget.',
    },

    { type: 'section_head', number: '/01', title: 'Torque comes from displacement and pressure drop.', anchor: 'torque' },
    {
      type: 'prose',
      html: '<ul><li><strong>Metric:</strong> torque (Nm) = displacement (cc/rev) × pressure drop (bar) ÷ 62.8 (that is, ÷ 20π), × mechanical efficiency.</li><li><strong>Imperial:</strong> torque (lb-in) = displacement (in³/rev) × pressure drop (psi) ÷ 6.28 (÷ 2π), × mechanical efficiency.</li></ul><p>A 400 cc/rev motor with 150 bar across it produces 400 × 150 ÷ 62.8 = 955 Nm of theoretical torque; at a running mechanical efficiency of around 85% that is about 810 Nm at the shaft. For reference, Danfoss’s published test point for an OMT 160 works out at about 90% mechanical and 93% volumetric efficiency — 83% overall — and a clone orbital motor’s chart at its rated point works out nearer 73% overall. Use the maker’s curves when you have them. In imperial units, a 12 in³/rev motor across 2,000 psi gives 3,820 lb-in theoretical.</p><p>The pressure in the formula is the <strong>drop across the motor</strong>, not the gauge reading at the inlet. If the inlet is at 175 bar and the return line holds 25 bar of back pressure — a long return hose, a return filter, a second motor in series downstream — the motor only works with 150 bar. Every bar of back pressure is a bar of torque lost.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Theoretical torque by displacement and pressure drop (Nm, before efficiency)',
      columns: ['Displacement', '100 bar', '140 bar', '175 bar', '205 bar'],
      rows: [
        { cells: ['50 cc/rev', '80', '111', '139', '163'] },
        { cells: ['100 cc/rev', '159', '223', '279', '326'] },
        { cells: ['160 cc/rev', '255', '357', '446', '522'] },
        { cells: ['200 cc/rev', '318', '446', '557', '653'] },
        { cells: ['315 cc/rev', '501', '702', '877', '1,028'], highlight: true },
        { cells: ['400 cc/rev', '637', '891', '1,114', '1,305'] },
        { cells: ['500 cc/rev', '796', '1,114', '1,393', '1,631'] },
        { cells: ['800 cc/rev', '1,273', '1,783', '2,228', '2,610'] },
      ],
    },

    { type: 'section_head', number: '/02', title: 'Speed comes from flow and displacement.', anchor: 'speed' },
    {
      type: 'prose',
      html: '<ul><li><strong>Metric:</strong> speed (rpm) = flow (L/min) × 1,000 ÷ displacement (cc/rev), × volumetric efficiency.</li><li><strong>Imperial:</strong> speed (rpm) = flow (gpm) × 231 ÷ displacement (in³/rev), × volumetric efficiency.</li></ul><p>On 40 L/min, a 400 cc motor turns at 100 rpm in theory; a 100 cc motor at 400 rpm; a 50 cc motor at 800 rpm. Leakage inside the motor means slightly less, and the shortfall grows with pressure and temperature: a motor that keeps its speed on cool oil at light load and slows noticeably when hot and loaded is showing its volumetric efficiency, and on an old motor, its wear.</p><p>Displacement is therefore the lever between the two outputs. For a given pump flow and pressure, a larger motor turns slower with more torque, a smaller one faster with less. Power is the same either way — torque × speed is fixed by pressure × flow.</p><ul><li><strong>Power (kW)</strong> = torque (Nm) × speed (rpm) ÷ 9,549. The 810 Nm motor at 90 rpm delivers about 7.6 kW.</li></ul>',
    },

    { type: 'section_head', number: '/03', title: 'Starting torque: the moment that decides the size.', anchor: 'starting' },
    {
      type: 'prose',
      html: '<p>A motor running steadily works on a film of oil. A motor at rest, under load, has metal parts pressed together and must overcome static friction and internal leakage at zero speed before anything moves. Makers publish this as <em>starting torque</em> or <em>breakaway torque</em>. As a rule of thumb from trade guidance, common gear, vane and piston motors deliver running torque of about 90% of theoretical but starting torque of only 70–80%. Danfoss’s own figures for an OMT 160 orbital motor at 200 bar make the point: 460 Nm running, but a guaranteed minimum of 340 Nm from standstill — 74% of the running figure. The maker’s starting-torque figure for the specific model is the one to use.</p><p>That matters most for loads that are heaviest at standstill:</p><ul><li><strong>Conveyors</strong> starting loaded, where static friction on the belt and the inertia of the material peak at the first turn.</li><li><strong>Augers and mixers</strong> restarting in settled material.</li><li><strong>Wheel drives</strong> starting uphill or out of a rut.</li><li><strong>Winches</strong> lifting a suspended load from rest.</li></ul><p>Size the motor so that its <em>starting</em> torque at the available pressure exceeds the breakaway torque of the load, with margin; then check that running torque and speed suit the work.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Worked examples.', anchor: 'examples' },
    {
      type: 'prose',
      html: '<h3>Auger drive</h3><p>The auger needs 600 Nm at 120 rpm. The circuit can give 160 bar across the motor. Displacement = 600 × 62.8 ÷ (160 × 0.85) = 277 cc/rev, so a 315 cc motor. Flow = 315 × 120 ÷ 1,000 ÷ 0.9 = 42 L/min. Check the restart: if the auger can stall in packed material, the breakaway torque — not the 600 Nm running figure — is what the 315 cc motor must beat.</p><h3>Imperial: conveyor head drive</h3><p>A conveyor needs 4,000 lb-in running at 150 rpm, from a 2,250 psi circuit. Displacement = 4,000 × 6.28 ÷ (2,250 × 0.85) = 13.1 in³/rev — a 14–15 in³/rev orbital motor. Flow = 14 × 150 ÷ 231 ÷ 0.9 = 10.1 gpm. If the belt starts loaded, check starting torque first; a gearbox or a larger motor may be the answer.</p><h3>Wheel drive</h3><p>Two wheel motors on a 1.2 tonne machine, wheel radius 0.3 m, climbing a 10% slope with 5% rolling resistance. Tractive force ≈ 1,200 × 9.81 × 0.15 = 1,766 N; wheel torque = 1,766 × 0.3 = 530 Nm, so 265 Nm per wheel. At 140 bar and 85%, each motor needs 265 × 62.8 ÷ (140 × 0.85) = 140 cc/rev — a 160 cc wheel motor. A wheel motor also carries the machine’s weight on its bearings, so check the radial load rating at the wheel offset, not only the torque.</p>',
    },

    { type: 'section_head', number: '/05', title: 'Continuous, intermittent and peak.', anchor: 'ratings' },
    {
      type: 'prose',
      html: '<p>Orbital and gear motor datasheets usually give three levels for pressure, flow, speed and torque:</p><ul><li><strong>Continuous</strong> — what the motor can do all day. Size the working point here.</li><li><strong>Intermittent</strong> — Danfoss, Char-Lynn and Parker all define it as no more than 10% of every minute (Char-Lynn: “up to six seconds every minute”). This covers acceleration, a heavier patch of material, a short climb. Danfoss adds that intermittent pressure and intermittent flow must not occur at the same time.</li><li><strong>Peak</strong> — no more than 1% of every minute: relief valves opening, directional valves switching. Set the relief and shock valves so peaks stay inside it. Never a working condition.</li></ul><p>Our orbital-motor listings show the spread: the large-frame BMV family runs to 20,179 lb-in <em>intermittent</em>, and each part number carries its continuous figure alongside. Selecting a motor on its intermittent torque and running it there all shift is the most reliable way to shorten its life: the commutation valve, the gerolor star and the drive link all wear in proportion to the load they carry continuously.</p><h3>Flow and speed limits</h3><p>Each displacement has its own maximum flow and speed. On an orbital motor, small displacements run fast and large ones slow — the same frame might allow several hundred rpm at its smallest displacement and well under a hundred at its largest. Running above the continuous flow overheats the motor and erodes the valve; check both flow and rpm against the chosen displacement, not the family headline.</p>',
    },

    { type: 'section_head', number: '/06', title: 'Back pressure, case drains and series circuits.', anchor: 'back-pressure' },
    {
      type: 'prose',
      html: '<p>Most orbital motors drain their internal leakage to the low-pressure port, which means the shaft seal sees pressure from the return line. How much depends on how the motor is built and plumbed. Danfoss sets out three cases: with internal check valves and no drain, the seal sees the return pressure; with a drain line, it sees the drain-line pressure; with neither, it sees the average of inlet and return pressure. Seal limits also fall steeply with speed — on Danfoss’s OMR high-pressure seal, from about 200 bar at 150 rpm to about 50 bar at 600 rpm. Makers publish the limit and offer a case-drain port for when it is exceeded. Two common situations exceed it:</p><ul><li><strong>Motors in series</strong> — the outlet of the first is the inlet of the second, so the first motor’s “return” is at the second motor’s working pressure.</li><li><strong>Restricted returns</strong> — long return hoses, small couplers, a return filter in poor condition, or a meter-out flow control on the motor outlet.</li></ul><p>Above the limit, the shaft seal weeps and then blows out. Danfoss also requires a drain line on every brake motor and on any short (bearingless) motor built into a gearbox. Connect the case drain straight to tank, with nothing in the line that can build pressure. In a series circuit, remember that each motor gets only its share of the total pressure drop: two identical motors in series at 200 bar inlet each work with roughly 100 bar, so each gives half the torque at full speed.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A motor is not a brake.',
      body: 'Every hydraulic motor leaks internally, so a motor with its ports blocked will creep under a suspended or uphill load. A winch, a slewing drive or a wheel drive on a slope needs a mechanical holding brake, and an overrunning load needs a counterbalance or brake valve to control it — not a closed spool.',
    },
    {
      type: 'decision_tree',
      heading: 'Motor sizing, in order',
      branches: [
        { condition: 'What is the breakaway torque of the load?', outcome: 'This, not running torque, usually sets the size. Use the maker’s starting-torque figure.' },
        { condition: 'What pressure drop is really available?', outcome: 'Inlet pressure minus return back pressure, under load, after valve losses.' },
        { condition: 'Displacement = torque × 62.8 ÷ (Δbar × efficiency)', outcome: 'Round up to the next displacement made.' },
        { condition: 'Flow = displacement × rpm ÷ 1,000 ÷ ηv', outcome: 'Check against pump flow, and against the motor’s continuous flow and speed limits.' },
        { condition: 'Is there side load on the shaft?', outcome: 'Wheels, sprockets and pulleys load the bearings. Check the radial load at the actual offset, or use a wheel or bearing-reinforced motor.' },
        { condition: 'Will return pressure exceed the shaft-seal limit?', outcome: 'Series circuits and restricted returns need an external case drain to tank.' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How do I calculate hydraulic motor torque?', answer: 'Multiply displacement by pressure drop and divide by 2π. In metric, cc/rev × bar ÷ 62.8 gives Nm; in imperial, in³/rev × psi ÷ 6.28 gives lb-in. Multiply by mechanical efficiency, about 0.85 running, for usable torque.' },
        { question: 'How do I calculate hydraulic motor speed?', answer: 'Divide flow by displacement. In metric, L/min × 1,000 ÷ cc/rev gives rpm; in imperial, gpm × 231 ÷ in³/rev. Multiply by volumetric efficiency, around 0.9.' },
        { question: 'Why does my motor slow down under load?', answer: 'Internal leakage rises with pressure, so a loaded motor turns slower than an unloaded one on the same flow. On a worn motor, or with hot thin oil, the drop becomes large.' },
        { question: 'What is starting torque?', answer: 'The torque a motor can produce from standstill under load — typically 70–80% of theoretical against about 90% when running. Size against it for conveyors, augers, winches and wheel drives.' },
        { question: 'Can I use the intermittent torque rating for sizing?', answer: 'Only for short peaks. Size the working point against the continuous rating; intermittent ratings are for no more than 10% of every minute, and running there continuously shortens the motor’s life.' },
        { question: 'When does a hydraulic motor need a case drain?', answer: 'When the return-line pressure can exceed the shaft seal’s rating — motors in series, long or restricted return lines. Run the drain straight to tank.' },
        { question: 'Can a hydraulic motor hold a load?', answer: 'No. Internal leakage lets it creep. Use a mechanical brake for holding and a counterbalance or brake valve for overrunning loads.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Orbital and gear motors',
      skus: ['IH-DFC-BMRS-4B', 'IH-DFC-BMSY-WHL', 'IH-DFC-BMT', 'IH-FLD-WF104-2BB', 'IH-CL-103', 'IH-CRS-MH'],
      note: 'Each part number is listed with displacement and its continuous and intermittent ratings.',
    },
    { type: 'category_link', slug: 'orbital-hydraulic-motors', label: 'Orbital motors', blurb: 'Low-speed, high-torque motors from 8 to 990 cc/rev, in every common mount.' },
    { type: 'category_link', slug: 'hydraulic-gear-motors', label: 'Gear motors', blurb: 'High-speed gear motors for fans, pumps and spreaders.' },
    {
      type: 'related_articles',
      slugs: ['orbital-hydraulic-motor-guide', 'gear-orbital-or-piston-hydraulic-motor', 'how-to-size-a-hydraulic-pump', 'winch-drive-vs-motor-drum-vs-complete-winch'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Formulas and worked examples computed 2026-10-21; displacement and intermittent ratings from our orbital-motor listings.',
    },
    {
      type: 'cta_block',
      heading: 'Sizing a motor for a drive?',
      body: 'Send the torque and speed the load needs, the pressure and flow you have, and the mount and shaft on the machine. We will pick a displacement and check starting torque, side load and back pressure.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
