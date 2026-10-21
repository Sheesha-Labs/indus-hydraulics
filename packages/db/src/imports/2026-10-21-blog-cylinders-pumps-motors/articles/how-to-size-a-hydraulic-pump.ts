import type { BlogArticleSeed } from '../shared'

/**
 * Pump sizing from first principles. Formulas: Q = V × n ÷ 1000 × ηv (L/min), gpm = in³ × rpm ÷ 231,
 * P(kW) = bar × L/min ÷ 600, HP = psi × gpm ÷ 1714, T(Nm) = cc × bar ÷ 20π. Worked figures computed
 * 2026-10-21 and checked against our listings: A10VSO 71 = 106.5 L/min at 1500 rpm (listing: 107), PGH4
 * 20.1 cc, T6C 37.1 cc = 55.6 L/min at 1500 rpm (listing). Line velocity guidance is the band most pump and
 * hose makers publish; the maker's inlet limit overrides it.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'how-to-size-a-hydraulic-pump',
  title: 'How to size a hydraulic pump: flow, pressure, drive power and the inlet nobody checks',
  excerpt:
    'A pump is sized by the flow the actuators need and the power the drive can give it, and it fails most often on the suction side. The formulas in litres and gallons, worked examples for electric motors, engines and PTOs, line sizing, and the checks that decide whether a pump lasts five years or five weeks.',
  categorySlug: 'cylinders-pumps-motors',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'How to Size a Hydraulic Pump: Flow, Pressure & Power',
  seoDescription:
    'Hydraulic pump sizing: flow from displacement and speed, input power and torque, electric motor and engine selection, PTO ratios, suction and pressure line sizing, with worked examples in metric and imperial.',
  focusKeyword: 'how to size a hydraulic pump',
  publishedAt: '2026-10-21T06:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Flow = displacement × shaft speed: a 20 cc/rev pump at 1,500 rpm delivers 30 L/min in theory and about 28.5 L/min at 95% volumetric efficiency.',
        'Hydraulic power (kW) = pressure (bar) × flow (L/min) ÷ 600; (HP) = psi × gpm ÷ 1,714. Divide by overall efficiency for the drive power.',
        'Pumps do not make pressure. The load makes pressure; the relief valve caps it; the pump only decides how fast the actuators move.',
        'Size flow from the actuator that needs the most at once, then check the drive can supply flow × maximum working pressure, not relief pressure × no flow.',
        'Most premature pump failures start at the inlet: a suction line sized for pressure-line velocity, a clogged strainer, or a reservoir below the pump on thick oil.',
      ],
    },
    {
      type: 'lead',
      html: 'Pump selection is usually done backwards. Someone reads the old pump’s nameplate, looks for the same displacement, and orders it. That works until the machine has been modified, the engine has been changed, or the old pump was wrong all along — which is often why it failed. Sizing from the job takes ten minutes and four formulas. This guide works through them, then through the parts of the installation that decide how long the pump lives.',
    },

    { type: 'section_head', number: '/01', title: 'What a pump actually does.', anchor: 'principle' },
    {
      type: 'prose',
      html: '<p>A positive-displacement pump — gear, vane or piston — traps a fixed volume of oil on every revolution and pushes it out of the outlet. That volume is its <strong>displacement</strong>, in cm³/rev (cc) or in³/rev. Spin it faster and it moves more oil; that is all it does.</p><p>It does not make pressure. Pressure appears when that flow meets resistance: a cylinder pushing a load, a motor turning against torque, a valve throttling. A pump running into an open tank line sits at a few bar however large it is. A pump into a dead-headed line climbs until something gives — which is why every fixed pump needs a relief valve, and why the relief setting is a protection limit, not a design target.</p><p>So sizing a pump is two separate questions: <em>how much flow</em> (which sets actuator speed) and <em>how much power</em> the drive has to deliver that flow at the working pressure.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Flow from displacement and speed.', anchor: 'flow' },
    {
      type: 'prose',
      html: '<ul><li><strong>Metric:</strong> flow (L/min) = displacement (cc/rev) × speed (rpm) ÷ 1,000 × volumetric efficiency.</li><li><strong>Imperial:</strong> flow (gpm) = displacement (in³/rev) × speed (rpm) ÷ 231 × volumetric efficiency.</li></ul><p>Volumetric efficiency is the share of the theoretical flow that leaves the outlet rather than leaking back across the gears, vanes or pistons. It falls as pressure rises, as oil thins with heat and as the pump wears. A new pump at low pressure is close to its theoretical flow — Vickers’ published V20 figures work out at about 97% at 69 bar — and every pump loses some of that as pressure rises.</p><h3>Worked examples</h3><ul><li>20 cc/rev on a 4-pole electric motor at 1,500 rpm: 30 L/min theoretical, about 28.5 L/min delivered.</li><li>Our Parker T6C vane pump with the 012 cartridge is 37.1 cc/rev; at 1,500 rpm it delivers the 55.6 L/min its listing quotes at zero pressure.</li><li>A Rexroth A10VSO 71 piston pump at 1,500 rpm: 71 × 1,500 ÷ 1,000 = 106.5 L/min at full displacement.</li><li>Imperial: 1 in³/rev at 1,800 rpm is 7.8 gpm; 1.5 in³/rev is 11.7 gpm.</li></ul><h3>Working back from the job</h3><p>Start from the actuator. A cylinder needs flow = area × speed; a motor needs flow = displacement × rpm. Where several actuators move at once, add them; where they move one at a time, take the largest. Then divide by the drive speed to get the displacement, and round up to the next size made. If you need 11 gpm at 3,600 rpm, that is 11 × 231 ÷ 3,600 = 0.71 in³/rev before leakage, so a 0.75–0.8 in³/rev pump.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Theoretical flow by displacement and drive speed (L/min)',
      columns: ['Displacement', '1,000 rpm', '1,500 rpm', '1,800 rpm', '2,200 rpm', '3,000 rpm'],
      rows: [
        { cells: ['8 cc/rev', '8', '12', '14.4', '17.6', '24'] },
        { cells: ['16 cc/rev', '16', '24', '28.8', '35.2', '48'] },
        { cells: ['20 cc/rev', '20', '30', '36', '44', '60'], highlight: true },
        { cells: ['32 cc/rev', '32', '48', '57.6', '70.4', '96'] },
        { cells: ['45 cc/rev', '45', '67.5', '81', '99', '135'] },
        { cells: ['71 cc/rev', '71', '106.5', '127.8', '156.2', '213'] },
        { cells: ['100 cc/rev', '100', '150', '180', '220', '300'] },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Check the speed limits, both of them.',
      body: 'Every pump has a maximum speed, often lower for larger displacements of the same family — the A10VSO 45 is rated to 2,600 rpm at full displacement, the 100 to 2,000 rpm. Many also have a minimum speed below which they will not prime or seal properly. An engine-driven pump sees both: idle and governed maximum. Check the pump at both ends of the engine’s range, not just at the speed you expect to work at.',
    },

    { type: 'section_head', number: '/03', title: 'Power and torque.', anchor: 'power' },
    {
      type: 'prose',
      html: '<p>Hydraulic power is pressure times flow:</p><ul><li><strong>kW</strong> = pressure (bar) × flow (L/min) ÷ 600</li><li><strong>HP</strong> = pressure (psi) × flow (gpm) ÷ 1,714</li></ul><p>The drive has to supply more than that, because the pump is not perfect. Divide by the overall efficiency — volumetric times mechanical. The maker’s curve for the specific pump is the figure to use; where you do not have one, 0.85 is a reasonable planning figure for a gear pump in good condition, and piston pumps usually do better.</p><h3>Worked examples</h3><ul><li>28.5 L/min at 200 bar: 200 × 28.5 ÷ 600 = 9.5 kW hydraulic. At 85% overall, the motor must supply about 11.2 kW: an 11 kW motor is marginal, a 15 kW motor is right.</li><li>11 gpm at 3,000 psi: 11 × 3,000 ÷ 1,714 = 19.3 HP hydraulic, about 22.7 HP at the shaft at 85%.</li><li>A10VSO 71 at 1,500 rpm and 280 bar nominal: 106.5 L/min × 280 ÷ 600 = 49.7 kW hydraulic. This is why variable pumps with pressure or power controls exist — a fixed pump that size would need a 55–60 kW motor running flat out even when the machine only needed a fraction of it.</li></ul><h3>Input torque</h3><p>For a coupling, a PTO or a gearbox, the number that matters is torque: <strong>torque (Nm) = displacement (cc) × pressure (bar) ÷ 62.8</strong> (that is, ÷ 20π), divided by mechanical efficiency. A 20 cc pump at 200 bar needs 63.7 Nm in theory and about 71 Nm at 90%. Torque is what shears keys, strips splines and stalls engines at idle — check it against the shaft and the drive, not just against the power.</p>',
    },
    {
      type: 'direct_answer',
      question: 'How much horsepower does a hydraulic pump need?',
      answer:
        'Multiply the maximum working pressure in psi by the flow in gpm and divide by 1,714 for hydraulic horsepower, then divide by the pump’s overall efficiency (about 0.85 for a gear pump) for the shaft horsepower. 11 gpm at 3,000 psi needs about 19 HP hydraulic and about 23 HP at the shaft. In metric, bar × L/min ÷ 600 gives kW.',
    },

    { type: 'section_head', number: '/04', title: 'Matching the drive: electric motor, engine or PTO.', anchor: 'drive' },
    {
      type: 'prose',
      html: '<h3>Electric motor</h3><p>Fixed speed — 1,500 rpm (4-pole, 50 Hz), about 1,450 rpm loaded; 1,800/1,750 rpm on 60 Hz supplies. Size the motor for the continuous power at the highest pressure the circuit actually works at for any length of time. Electric motors tolerate short overloads well; they do not tolerate running permanently above their rating in a hot pump room, which in the Gulf is most pump rooms.</p><h3>Petrol or diesel engine</h3><p>Engines publish power at a stated speed; at lower speed they have much less. Pick the engine speed you will actually run, read the power at that speed, and size the pump so flow × pressure ÷ efficiency fits inside it. Small air-cooled engines are rated optimistically and lose power in heat and at altitude: leave a generous margin. Two-stage log-splitter pumps exist precisely to get round this limit — high flow at low pressure, low flow at high pressure, so the engine is never asked for both at once. See <a href="/blog/two-stage-hydraulic-pumps-log-splitter">two-stage pumps</a>.</p><h3>Truck PTO</h3><p>A power take-off runs at a fixed percentage of engine speed set by its gearing. Pump speed = engine speed × PTO ratio. PTO makers also derate for duty: one major maker treats use at full output for five minutes or more in every fifteen as continuous and derates the PTO to 70% of its intermittent rating. At 1,500 engine rpm and a 70% PTO, the pump turns at 1,050 rpm, so to deliver 60 L/min it needs about 60,000 ÷ 1,050 = 57 cc/rev before leakage. PTO rotation also decides the pump’s rotation — order the wrong hand and it will not prime. See <a href="/blog/dump-pumps-and-pto-pumps">dump pumps and PTO pumps</a>.</p>',
    },

    { type: 'section_head', number: '/05', title: 'Fixed or variable displacement?', anchor: 'variable' },
    {
      type: 'prose',
      html: '<p>A fixed pump delivers its full flow all the time. When the actuators do not need it, the excess goes over the relief valve or through an open-centre valve back to tank. Over the relief valve, every litre not used is turned into heat at full pressure — the 50 kW example above, dumped into a reservoir.</p><p>A variable pump — swashplate axial piston, or variable vane — changes its displacement to match demand. A <strong>pressure compensator</strong> destrokes the pump as pressure reaches its setting, so a holding circuit draws almost no power. A <strong>load-sensing</strong> control keeps the pump a fixed margin above the highest load pressure. <strong>Power limiting</strong> trades flow for pressure along a constant-power curve, so a smaller motor can drive a large pump. The Rexroth A10VSO family we stock carries these as control codes (DR pressure control, DFR pressure and flow, DFLR with power limiting).</p><p>As a rule: fixed gear and vane pumps for simple, intermittent circuits and open-centre mobile valves; variable piston pumps where the machine holds pressure for long periods, where several functions share the pump, or where the energy bill and the oil temperature both matter.</p>',
    },

    { type: 'section_head', number: '/06', title: 'The inlet decides how long the pump lives.', anchor: 'inlet' },
    {
      type: 'prose',
      html: '<p>A pump cannot pull oil. It can only make room for it; atmospheric pressure on the reservoir pushes the oil in. That leaves less than one bar to accelerate the oil up the suction line, through the strainer and into the pump — and on a hot day with thin oil, or a cold start with thick oil, it is easy to ask for more than that.</p><p>When the inlet cannot keep up, pressure in the pump’s inlet falls far enough for dissolved air to come out and for oil vapour to form. The bubbles collapse violently as they reach the pressure side. That is <strong>cavitation</strong>. Trade guidance describes it as a steady, high-pitched whine; it leaves erosion pitting on gear sides and vane rings and a pump that loses flow long before it should. Air drawn in through a loose suction fitting, a worn shaft seal or a reservoir so low that it vortexes gives <strong>aeration</strong> — a more erratic noise with a rattle like gravel in the pump, foaming in the tank and sluggish operation. Squirting oil onto a suspect suction fitting is the old test: if the noise briefly quietens, the fitting is drawing air.</p><h3>Line sizing</h3><p>Pump makers publish their inlet limit as a pressure, not a pipe size. Vickers allows no more than 5 inHg of vacuum at the V10/V20 inlet on petroleum oil (about 0.84 bar absolute); Rexroth asks for at least 0.8 bar absolute at an A10VSO inlet and 0.7 bar at its AZPB gear pumps. Translated into pipe sizes, one truck-pump maker caps suction velocity at 4 ft/s (about 1.2 m/s) with a 2" minimum inlet hose on its piston pumps. Return and pressure lines are run much faster — sizing charts in common use put return lines around 10 ft/s (3 m/s) and pressure lines around 20–25 ft/s (6–7.6 m/s) at higher pressures. For 30 L/min that means a suction line of about 23 mm bore against a pressure line of about 10 mm. Fitting a 1/2" suction hose because the pressure hose is 1/2" multiplies the inlet velocity several times over and is one of the commonest causes of a new pump failing early.</p><p>The formula, if you want to check a line: bore (mm) = 4.61 × √(flow in L/min ÷ velocity in m/s). In US units, area (in²) = gpm × 0.3208 ÷ velocity (ft/s).</p><ul><li>Keep the suction line short, straight and one size up rather than one size down.</li><li>Put the reservoir above the pump inlet wherever the layout allows.</li><li>Use a suction strainer coarse enough not to restrict, with a bypass, and clean it.</li><li>Seal every suction joint: a leak there lets air in rather than oil out, so it never drips and never gets found.</li><li>Do not feed two pumps from one Y-shaped suction line — Vickers warns that one may be starved and cavitate.</li><li>Check the maker’s inlet limit for the pump — it overrides any general rule.</li></ul>',
    },
    {
      type: 'comparison_table',
      caption: 'Minimum line bore for a target velocity (bore = 4.61 × √(L/min ÷ m/s))',
      columns: ['Flow', 'Suction at 1.2 m/s (4 ft/s)', 'Return at 3 m/s (10 ft/s)', 'Pressure at 6 m/s (20 ft/s)'],
      rows: [
        { cells: ['30 L/min (8 gpm)', '23 mm — use 1"', '15 mm — use 5/8"', '10 mm — use 1/2"'] },
        { cells: ['60 L/min (16 gpm)', '33 mm — use 1-1/2"', '21 mm — use 1"', '15 mm — use 5/8" or 3/4"'], highlight: true },
        { cells: ['100 L/min (26 gpm)', '42 mm — use 2"', '27 mm — use 1-1/4"', '19 mm — use 3/4" or 1"'] },
      ],
    },

    { type: 'section_head', number: '/07', title: 'Oil, heat and the Gulf.', anchor: 'oil' },
    {
      type: 'prose',
      html: '<p>Pump makers publish a working viscosity window and an optimum. Thin oil leaks past gears and vanes, cutting volumetric efficiency and the film that keeps parts apart; thick oil starves the inlet. Rexroth puts the optimum for the A10VSO at 16–36 mm²/s and the floor for continuous duty at 10 mm²/s — and its own data sheet notes that HLP 32 oil thins to 10 mm²/s at about 73 °C and HLP 46 at about 85 °C. Vickers wants its V-series vane pumps running at 13–54 cSt, ideally with oil around 49 °C and no hotter than 65 °C. In a Gulf summer, with tank oil commonly in the 60–80 °C range on outdoor machines, a VG 32 fill is below its window; VG 46 is at the edge; VG 68 keeps a piston pump nearer its optimum, at the cost of a thicker cold start. Whatever the grade, the reservoir and cooler have to keep the oil inside the pump’s window on the hottest afternoon — see <a href="/blog/hydraulic-pump-types-gear-vane-piston">pump types</a> for how each design tolerates contamination and heat.</p><p>Contamination tolerance differs too. Rexroth asks for at least ISO 4406 20/18/15 for its gear and A10VSO pumps; Vickers’ own table asks for 18/16/13 for fixed vane pumps above 210 bar and 16/14/12 for variable piston pumps at the same pressure. Meeting the code is cheaper than a pump.</p>',
    },
    {
      type: 'decision_tree',
      heading: 'Pump sizing, in order',
      branches: [
        { condition: 'What flow do the actuators need at once?', outcome: 'Cylinder: area × speed. Motor: displacement × rpm. Add simultaneous functions; take the largest of sequential ones.' },
        { condition: 'What speed will the pump turn at?', outcome: 'Electric 1,450–1,750 rpm; engine at working speed; PTO = engine rpm × PTO ratio.' },
        { condition: 'Displacement = flow ÷ speed, plus leakage', outcome: 'Round up to the next size made, then check the pump’s maximum and minimum speed.' },
        { condition: 'Power = working pressure × flow ÷ efficiency', outcome: 'Check the motor or engine has it at the working speed. If not, consider a two-stage or a variable pump.' },
        { condition: 'Is the shaft, flange and rotation right?', outcome: 'SAE A, B or C, or ISO 3019-2 metric; keyed or splined; rotation viewed from the shaft end.' },
        { condition: 'Is the inlet sized for no more than about 1.2 m/s, inside the maker’s vacuum limit?', outcome: 'If not, the new pump will cavitate. Fix the inlet first.' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How do I calculate hydraulic pump flow?', answer: 'Multiply displacement by shaft speed. In litres: cc/rev × rpm ÷ 1,000. In US gallons: in³/rev × rpm ÷ 231. Then multiply by volumetric efficiency, typically 0.9–0.95 for a new gear or vane pump.' },
        { question: 'How do I work out the motor size for a hydraulic pump?', answer: 'Hydraulic kW = bar × L/min ÷ 600. Divide by the pump’s overall efficiency, about 0.85, and pick the next motor size up. 28.5 L/min at 200 bar needs about 11.2 kW, so a 15 kW motor.' },
        { question: 'Does a bigger pump give more pressure?', answer: 'No. A bigger pump gives more flow, so actuators move faster. Pressure is set by the load and capped by the relief valve. A bigger pump at the same pressure needs more drive power.' },
        { question: 'Why is my new pump noisy?', answer: 'Most often cavitation or aeration at the inlet: a suction line that is too small or too long, a blocked strainer, a low reservoir, thick cold oil or an air leak at a suction fitting. Check those before blaming the pump.' },
        { question: 'What is the difference between pump rotation clockwise and anticlockwise?', answer: 'Rotation is stated viewed from the shaft end. A pump built for one direction will not prime, or will be damaged, run the other way. Some vane pumps can be converted by turning the cartridge; most gear pumps cannot.' },
        { question: 'Should I use a fixed or variable pump?', answer: 'Fixed for simple, intermittent circuits. Variable — pressure-compensated or load-sensing — where the machine holds pressure for long periods or shares one pump between several functions, because it saves the power a fixed pump would turn into heat over the relief valve.' },
        { question: 'What size suction line does a pump need?', answer: 'Large enough to keep inlet vacuum inside the pump maker’s limit — in practice oil velocity no more than about 1.2 m/s (4 ft/s): roughly a 1" bore for 30 L/min and 1-1/2" for 60 L/min. Never the same size as the pressure line.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Pumps by type',
      skus: ['IH-DFC-GP-F20', 'IH-PGH4-21-020', 'IH-T6C-012-1R00-B1', 'IH-FLD-V20-195', 'IH-AP71-D-R-V', 'IH-PMC-P5151'],
      note: 'Each listing gives displacement, pressure, speed and mounting; send us the job and we will check the size.',
    },
    { type: 'category_link', slug: 'hydraulic-gear-pumps', label: 'Gear pumps', blurb: 'Aluminium and cast-iron external gear pumps, and Rexroth internal gear.' },
    { type: 'category_link', slug: 'hydraulic-piston-pumps', label: 'Piston pumps', blurb: 'Variable axial piston pumps, including Rexroth A10VSO and OEM replacements.' },
    { type: 'category_link', slug: 'hydraulic-power-units', label: 'Power units and parts', blurb: 'DC and AC power packs and their cartridges, coils and reservoirs.' },
    {
      type: 'related_articles',
      slugs: ['hydraulic-pump-types-gear-vane-piston', 'vane-pump-guide-v10-v20-t6', 'two-stage-hydraulic-pumps-log-splitter', 'dump-pumps-and-pto-pumps', 'hydraulic-cylinder-force-and-speed', 'hydraulic-motor-torque-and-speed'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Formulas and worked figures computed 2026-10-21 and checked against the displacements and flows on our Rexroth and Parker pump listings.',
    },
    {
      type: 'cta_block',
      heading: 'Replacing or resizing a pump?',
      body: 'Send the old pump’s nameplate or the job — flow, pressure, drive and speed — with the flange, shaft and rotation. We will size it, check the drive power and quote the pump with its fittings.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
