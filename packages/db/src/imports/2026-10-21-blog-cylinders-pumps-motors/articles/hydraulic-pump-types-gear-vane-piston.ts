import type { BlogArticleSeed } from '../shared'
import { PUMP_PRESSURE_RANGES } from '../diagrams'
import { stockList } from '../products'

/**
 * Pillar: pump types. Pressure and speed figures are taken from the pumps on our own catalogue so every number
 * is one we can stand behind: DFC GP-F20 aluminium gear up to 3,650 psi; Rexroth PGH4 internal gear 315 bar
 * (350 peak), 3,000 rpm; Fluidyne/Vickers V20 2,500 psi; Parker T6C 240/275 bar, T7B 290/320 bar; Rexroth A10VSO
 * 280/350 bar; OEM-replacement axial piston up to 4,600 psi. Qualitative comparisons (noise, contamination
 * tolerance, cost) are the consensus of maker literature summarised in the research notes of 2026-10-21.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-pump-types-gear-vane-piston',
  title: 'Hydraulic pump types: gear, vane and piston pumps compared, and how to choose',
  excerpt:
    'External gear, internal gear, vane, axial piston and radial piston pumps all move oil by trapping it and pushing it out, and they differ in pressure, noise, efficiency, dirt tolerance and price. How each one works, real ratings from pumps on the shelf, fixed versus variable displacement, and a selection guide.',
  categorySlug: 'cylinders-pumps-motors',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Hydraulic Pump Types: Gear vs Vane vs Piston Pumps',
  seoDescription:
    'Gear, vane and piston hydraulic pumps compared: how each works, pressure and speed ratings, efficiency, noise, contamination tolerance, fixed vs variable displacement and which to choose for mobile or industrial use.',
  focusKeyword: 'types of hydraulic pumps',
  publishedAt: '2026-10-21T08:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Every common hydraulic pump is positive-displacement: it traps a fixed volume per revolution and pushes it out, so flow follows speed and pressure follows load.',
        'External gear pumps are the simplest and cheapest; aluminium gear pumps on our shelf are rated to about 3,650 psi (around 250 bar).',
        'Internal gear and vane pumps are quieter; the Parker T7B vane pump runs 290 bar continuous, the Rexroth PGH4 internal gear pump 315 bar.',
        'Axial piston pumps reach the highest pressures and efficiencies and are the usual choice for variable displacement — the Rexroth A10VSO runs 280 bar nominal, 350 bar peak.',
        'The trade-off is cleanliness and price: variable piston pumps need oil two ISO 4406 code steps cleaner than fixed vane pumps at the same pressure, and cost the most.',
      ],
    },
    {
      type: 'lead',
      html: 'Hydraulic pumps all do the same job, and on a parts counter they are often treated as interchangeable boxes with a shaft and two ports. They are not. A gear pump fitted where a piston pump was will run, but louder, hotter and without the controls the circuit was designed around; a piston pump fitted to a dirty, simple open-centre circuit will be expensive and short-lived. This guide explains how each type works and where each one belongs.',
    },

    { type: 'section_head', number: '/01', title: 'What every pump has in common.', anchor: 'principle' },
    {
      type: 'prose',
      html: '<p>Hydraulic pumps used for power are <strong>positive-displacement</strong> pumps. Each revolution traps a fixed volume of oil between moving parts — gear teeth, vanes or pistons — carries it from the inlet to the outlet, and pushes it out. That fixed volume is the pump’s displacement, and flow is displacement times speed (the arithmetic is in <a href="/blog/how-to-size-a-hydraulic-pump">how to size a hydraulic pump</a>).</p><p>Three consequences follow for every type:</p><ul><li>A pump makes flow, not pressure. Pressure is the circuit’s resistance to that flow.</li><li>A pump must never be dead-headed without a relief valve: it will keep pushing until something breaks.</li><li>Internal leakage — the oil that slips back from outlet to inlet — is what separates a good pump from a worn one, and rises with pressure, heat and wear.</li></ul>',
    },

    { type: 'section_head', number: '/02', title: 'External gear pumps.', anchor: 'gear' },
    {
      type: 'prose',
      html: '<p>Two meshing spur gears turn inside a close-fitting housing. Oil is carried round the outside of each gear in the spaces between the teeth, from the inlet side to the outlet side, and is squeezed out as the teeth mesh again in the middle. Pressure-loaded side plates (wear plates) are pushed against the gear faces by outlet pressure, which is how modern gear pumps keep side leakage low as pressure rises.</p><ul><li><strong>Strengths:</strong> simple, compact, cheap, tolerant of dirt and of poor inlet conditions, good at high speed. The workhorse of mobile hydraulics, tractors, trucks, log splitters and power packs.</li><li><strong>Limits:</strong> fixed displacement only; noisier than vane or internal gear pumps; efficiency falls off as they wear and as pressure rises.</li><li><strong>Ratings:</strong> on our shelf, the DFC GP-F10, F20 and F25 aluminium gear pumps are rated to about 3,625–3,650 psi; Rexroth’s small AZPB platform, for comparison, is rated 220 bar continuous, 250 bar intermittent (for up to 20 seconds) and 270 bar peak; cast-iron PTO gear pumps such as the DFC GP-PTO to 2,500 psi with much larger displacements (56–160 cc/rev) for truck work.</li></ul><p>Aluminium-bodied gear pumps are light and suit most mobile duties; cast-iron bodies take more abuse, higher continuous pressure in some families and direct PTO mounting.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Internal gear pumps.', anchor: 'internal-gear' },
    {
      type: 'prose',
      html: '<p>A small externally toothed gear turns inside a larger internally toothed ring, offset from it; a crescent-shaped filler piece separates inlet from outlet. The teeth mesh more gently and over a longer arc than in an external gear pump, so pressure pulsation and noise are much lower. Gap-compensated designs such as the Rexroth PGH4 we stock seal their running clearances hydraulically as pressure rises: the PGH4 size 20 is rated 315 bar continuous with 350 bar peaks at up to 3,000 rpm.</p><ul><li><strong>Strengths:</strong> quiet, low pulsation, high pressure for a fixed pump, good efficiency.</li><li><strong>Where:</strong> machine tools, presses, injection moulding, indoor power units where noise matters.</li><li><strong>Limits:</strong> fixed displacement; more expensive than external gear pumps.</li></ul>',
    },

    { type: 'section_head', number: '/04', title: 'Vane pumps.', anchor: 'vane' },
    {
      type: 'prose',
      html: '<p>A slotted rotor turns inside an elliptical cam ring. Flat vanes sit in the slots and are thrown outward — by centrifugal force and by pressure fed under them — to seal against the ring. As the rotor turns, the spaces between vanes grow over the inlet and shrink over the outlet. In a <strong>balanced</strong> vane pump the ring has two inlet and two outlet zones opposite each other, so the pressure loads on the shaft cancel out and the bearings last.</p><p>Most industrial and mobile vane pumps carry their rotor, vanes, ring and side plates as a replaceable <strong>cartridge</strong>: when the pump wears, a new cartridge restores it without removing the body from the machine. Displacement is changed the same way.</p><ul><li><strong>Strengths:</strong> quiet, smooth, good efficiency, easy to rebuild, compact for their flow.</li><li><strong>Ratings:</strong> Vickers V10 and V20 vane pumps (and their Fluidyne interchanges) are rated 2,500 psi (172 bar) on petroleum oil, falling to 2,200 psi on the largest rings; the Parker T6C to 240 bar continuous and 275 bar intermittent; the T7B to 290 bar continuous and 320 bar intermittent at up to 3,600 rpm.</li><li><strong>Limits:</strong> less tolerant of dirt than gear pumps — vane tips and ring wear — and sensitive to oil viscosity and inlet conditions.</li></ul><p>The details, the model codes and the cartridge conversion are in <a href="/blog/vane-pump-guide-v10-v20-t6">the vane pump guide</a>.</p>',
    },

    { type: 'section_head', number: '/05', title: 'Piston pumps.', anchor: 'piston' },
    {
      type: 'prose',
      html: '<h3>Axial piston, swashplate</h3><p>A ring of pistons sits in a rotating cylinder block, parallel to the shaft. The piston feet slide on an angled plate — the swashplate — so each piston strokes in and out once per revolution. Tilt the swashplate further and the stroke, and so the displacement, increases; set it flat and displacement falls to zero. That makes the swashplate pump the natural <strong>variable-displacement</strong> pump: the Rexroth A10VSO we stock is one, rated 280 bar nominal and 350 bar peak, in 45, 71 and 100 cc/rev sizes, with pressure, flow and power controls.</p><h3>Axial piston, bent-axis</h3><p>The cylinder block is set at an angle to the shaft rather than the plate. Bent-axis units are very efficient and robust, common as fixed pumps and as motors on mobile equipment.</p><h3>Radial piston</h3><p>Pistons arranged radially around an eccentric or cam. Capable of very high pressures — Rexroth lists fixed radial piston pumps for 700 bar — and used where small flows at high pressure are needed.</p><p>Bent-axis fixed pumps reach the highest continuous ratings of the common types: Rexroth’s A2FO is rated 400 bar nominal and 450 bar peak in its mid sizes.</p><ul><li><strong>Strengths:</strong> the highest pressures and efficiencies; variable displacement with sophisticated controls; long life on clean oil.</li><li><strong>Limits:</strong> the most expensive; the least tolerant of contamination; need a case drain to tank with low back pressure; more demanding of inlet conditions.</li></ul>',
    },
    {
      type: 'diagram',
      captionPrefix: 'FIG. 01',
      caption: 'Continuous and peak pressure ratings of the pumps on our own catalogue, by type. The bars show what each design is built for: gear pumps for moderate pressure at low cost, vane and internal gear for quiet mid-to-high pressure, piston pumps for the top of the range.',
      alt: 'Bar chart of pump pressure ratings from our catalogue. DFC GP-F20 aluminium gear pump: about 250 bar maximum. Vickers-pattern V20 vane pump: about 172 bar. Parker T6C vane pump: 240 bar continuous, 275 bar intermittent. Parker T7B vane pump: 290 bar continuous, 320 bar intermittent. Rexroth PGH4 internal gear pump: 315 bar continuous, 350 bar peak. Rexroth A10VSO axial piston pump: 280 bar nominal, 350 bar peak.',
      svg: PUMP_PRESSURE_RANGES,
    },
    {
      type: 'comparison_table',
      caption: 'Pump types compared',
      columns: ['Type', 'Pressure (maker ratings)', 'Noise', 'Cleanliness asked (ISO 4406)', 'Displacement', 'Relative cost'],
      rows: [
        { cells: ['External gear', 'To about 250 bar (3,650 psi) aluminium', 'Highest', '20/18/15 (Rexroth AZPB)', 'Fixed', 'Lowest'] },
        { cells: ['Internal gear', '315 bar, 350 peak (PGH4)', 'Low', '20/18/15 (Rexroth PGH)', 'Fixed', 'Medium'] },
        { cells: ['Vane', '172 bar (V20) to 290 bar continuous (T7B)', 'Low', '19/17/14 to 18/16/13 above 70 bar', 'Fixed (variable types exist)', 'Medium'], highlight: true },
        { cells: ['Axial piston', '280 bar, 350 peak (A10VSO); 400/450 bent-axis (A2FO)', 'Medium', '17/15/13 to 16/14/12 above 210 bar', 'Fixed or variable', 'Highest'] },
        { cells: ['Radial piston', 'Up to 700 bar', 'Medium', 'Per maker', 'Fixed (some variable)', 'High'] },
      ],
    },

    { type: 'section_head', number: '/06', title: 'Fixed or variable displacement.', anchor: 'variable' },
    {
      type: 'prose',
      html: '<p>A fixed pump always delivers its full flow; whatever the circuit does not use goes back to tank — through an open-centre valve at low pressure, or over the relief valve at full pressure as heat. A variable pump adjusts its displacement to what the circuit needs. The common controls, as Rexroth codes them on the A10VSO:</p><ul><li><strong>DR — pressure control (compensator):</strong> full flow until pressure reaches the setting, then the pump destrokes to hold that pressure with only the flow needed. Holding a clamp or a press costs almost nothing.</li><li><strong>DFR — pressure and flow control:</strong> adds a load-sensing flow control so the pump delivers only the flow the actuator demands, at just above the load pressure.</li><li><strong>DFLR — with power control:</strong> limits pressure × flow to a set power, so a smaller electric motor can drive the pump without stalling.</li></ul><p>For a single function that runs and stops, a fixed gear or vane pump is simpler and cheaper. For several functions sharing a pump, long holding periods, or anywhere the oil runs hot, a variable piston pump usually pays for itself in energy and cooling.</p>',
    },

    { type: 'section_head', number: '/07', title: 'Cleanliness, heat and the inlet.', anchor: 'care' },
    {
      type: 'prose',
      html: '<p>Each pump type tolerates contamination differently, and makers publish the cleanliness they assume as an ISO 4406 code. Rexroth asks for at least 20/18/15 for its gear and A10VSO pumps. Vickers publishes a table by pump type and system pressure, reproduced below; the pattern is that variable piston pumps want oil two code steps cleaner than fixed vane pumps at the same pressure, because the piston bores, slipper pads and valve plate run with clearances a few microns of hard dirt will score.</p><p>All types are harmed by thin, overheated oil and by starved inlets. In Gulf conditions that means: a viscosity grade chosen for the hottest working day (commonly ISO VG 46 or 68), a reservoir and cooler that keep the oil inside the pump’s viscosity window, a suction line large enough to keep inlet velocity low, and on piston pumps, a case-drain line straight to tank with nothing in it to build pressure.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Recommended oil cleanliness (ISO 4406) by component and system pressure — Vickers',
      columns: ['Component', 'Below 70 bar (1,000 psi)', '70–210 bar (1,000–3,000 psi)', 'Above 210 bar (3,000 psi)'],
      rows: [
        { cells: ['Fixed vane pump', '20/18/15', '19/17/14', '18/16/13'] },
        { cells: ['Variable vane pump', '18/16/14', '17/15/13', '—'] },
        { cells: ['Fixed piston pump', '19/17/15', '18/16/14', '17/15/13'] },
        { cells: ['Variable piston pump', '18/16/14', '17/15/13', '16/14/12'], highlight: true },
        { cells: ['Cylinders', '20/18/15', '20/18/15', '20/18/15'] },
      ],
    },
    {
      type: 'decision_tree',
      heading: 'Which pump type?',
      branches: [
        { condition: 'Simple mobile circuit, open-centre valve, cost matters, dust likely?', outcome: 'External gear pump.' },
        { condition: 'Truck with a PTO, large flow at moderate pressure?', outcome: 'Cast-iron PTO gear pump or a dump pump.' },
        { condition: 'Indoor machine where noise matters, fixed flow, high pressure?', outcome: 'Internal gear or vane pump.' },
        { condition: 'Replacing a Vickers V10/V20 or Denison T6 on an existing machine?', outcome: 'The same vane family or a published interchange — and consider a cartridge before a whole pump.' },
        { condition: 'Several functions, long holding periods, energy or heat a concern?', outcome: 'Variable axial piston pump with pressure or load-sensing control.' },
        { condition: 'Small flow at 700 bar for jacking or bolting?', outcome: 'A 10,000 psi hand, air or electric pump.' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What are the main types of hydraulic pump?', answer: 'Gear pumps (external and internal), vane pumps and piston pumps (axial swashplate, bent-axis and radial). All are positive-displacement: they move a fixed volume per revolution.' },
        { question: 'Which hydraulic pump is the most efficient?', answer: 'Piston pumps generally have the highest efficiency, especially at high pressure, and variable piston pumps save most energy because they only deliver the flow the circuit uses. Compare the maker’s efficiency curves at your working pressure rather than relying on a type label.' },
        { question: 'Which pump is the quietest?', answer: 'Internal gear and vane pumps, because their pumping elements mesh and sweep smoothly with little pressure pulsation. External gear pumps are the noisiest.' },
        { question: 'Can I replace a piston pump with a gear pump?', answer: 'Only if the circuit does not depend on the piston pump’s variable displacement or controls, and the pressure and flow are within the gear pump’s rating. On load-sensing or pressure-compensated circuits, no.' },
        { question: 'Why do piston pumps need a case drain?', answer: 'Internal leakage lubricates the pistons and collects in the pump case. It must return to tank at low pressure; a blocked or restricted drain pressurises the case and blows the shaft seal.' },
        { question: 'What is a variable displacement pump?', answer: 'A pump, usually axial piston, whose displacement per revolution can change while running, so it delivers only the flow the circuit needs — controlled by pressure, load-sensing or power-limiting controls.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Every gear pump, piston pump and power unit in the range:</p>' + stockList(['hydraulic-gear-pumps', 'hydraulic-piston-pumps', 'hydraulic-power-units']),
    },
    {
      type: 'product_embed',
      heading: 'One of each type',
      skus: ['IH-DFC-GP-F20', 'IH-DFC-GP-PTO', 'IH-PGH4-21-020', 'IH-FLD-V20-195', 'IH-T7B-B09-2R00-A100', 'IH-AP45-D-R-V', 'IH-RX-AXP-CAT', 'IH-WLM-DM'],
    },
    { type: 'category_link', slug: 'hydraulic-gear-pumps', label: 'Gear pumps', blurb: 'Aluminium and cast-iron external gear pumps and Rexroth internal gear.' },
    { type: 'category_link', slug: 'hydraulic-vane-pumps', label: 'Vane pumps', blurb: 'Vickers-pattern V10, V20 and doubles, Parker T6 and T7.' },
    { type: 'category_link', slug: 'hydraulic-piston-pumps', label: 'Piston pumps', blurb: 'Rexroth A10VSO and OEM-replacement axial piston pumps.' },
    {
      type: 'related_articles',
      slugs: ['how-to-size-a-hydraulic-pump', 'vane-pump-guide-v10-v20-t6', 'two-stage-hydraulic-pumps-log-splitter', 'dump-pumps-and-pto-pumps', 'high-pressure-hydraulic-cylinders-and-pumps'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Pressure, speed and control figures from the pumps on our catalogue; qualitative comparisons summarise maker literature.',
    },
    {
      type: 'cta_block',
      heading: 'Not sure which pump you need?',
      body: 'Send the old pump’s nameplate, or the flow, pressure, drive and circuit type. We will tell you which type and size fits, and quote it with the flange, shaft and rotation right.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
