import type { BlogArticleSeed } from '../shared'
import { GAUGE_ACCURACY } from '../diagrams'

/**
 * Pillar: pressure gauges. Bourdon principle and EN 837 parts (SAMSON AB 09, citing EN 837-1/-2/-3); C vs helical
 * tube (WIKA, excerpt); diaphragm gauges (Ashcroft); ASME B40.100 grades 4A–B (Ashcroft — A = 2-1-2 %, B = 3-2-3 %;
 * C and D NOT given); EN 837-1 class meaning (Ashcroft) and classes seen in maker data; safety patterns S1–S3 (SAMSON);
 * installation and zero check (SAMSON, WIKA, Enerpac); calibration 12 months baseline (Ashcroft). Our gauges from the
 * DFC, generic GA and Enerpac listings. Accuracy arithmetic computed.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'pressure-gauge-guide',
  title: 'Pressure gauges: how they work, accuracy grades and classes, safety patterns and how to choose one',
  excerpt:
    'A pressure gauge is a curved tube that tries to straighten, a few gears, and a pointer — and choosing the right one means getting range, accuracy, fill, connection, wetted material and case pattern all right at once. How Bourdon and diaphragm gauges work, what ASME grades and EN 837 classes actually promise, safety-pattern cases, installation and calibration.',
  categorySlug: 'instrumentation-gauges',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Pressure Gauge Guide: Types, Accuracy Grades, EN 837 & Selection',
  seoDescription:
    'How Bourdon tube and diaphragm pressure gauges work, ASME B40.100 accuracy grades and EN 837-1 classes explained with examples, safety pattern S1–S3 cases, dial sizes, connections, installation and calibration intervals.',
  focusKeyword: 'pressure gauge guide',
  publishedAt: '2026-10-21T14:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Most dial gauges use a Bourdon tube: a curved, closed tube that straightens as pressure rises and drives the pointer through a small movement.',
        'ASME B40.100 grades 1A to 4A are one tolerance across the scale (±1%, ±0.5%, ±0.25%, ±0.1% of span); Grade A is ±2/1/2% and Grade B ±3/2/3% across the lower quarter, middle half and upper quarter.',
        'An EN 837-1 class is ± percent of span over the whole scale: Class 1.6 on 0–400 bar allows ±6.4 bar anywhere.',
        'For gas or steam above 25 bar, EN 837-2 calls for a safety-pattern case: S3 (solid front, blow-out back) on 100–250 mm gauges, S2 on 40–80 mm.',
        'Choose a range so normal working pressure sits in the middle third of the dial — roughly half of full scale.',
        'Calibration interval is set by the user; 12 months is the common baseline for stable service, shorter where there is vibration or pulsation.',
      ],
    },
    {
      type: 'lead',
      html: 'Every hydraulic power unit, test bench, wellhead and compressor has a pressure gauge on it, and most of them were chosen by picking whatever dial size and range was in the drawer. A gauge that lives at the top of its scale, flutters on a pump, or carries brass internals into sour gas does its job badly and then fails. This guide covers how gauges work and what each line of a gauge specification means.',
    },

    { type: 'section_head', number: '/01', title: 'How a gauge works.', anchor: 'principle' },
    {
      type: 'prose',
      html: '<h3>Bourdon tube</h3><p>Inside most dial gauges is a <strong>Bourdon tube</strong>: a flattened tube bent into a curve, closed at its tip, with its open end fixed in the process connection. Pressure inside it tries to straighten the curve, and the tip moves. A linkage converts that small movement into rotation of a segment and pinion — the movement — which turns the pointer shaft. A fine hairspring takes up backlash, and a zero stop holds the pointer at rest.</p><p>For lower ranges the tube is a simple C-shape (WIKA uses C-tubes formed through about 250° up to about 60 bar); higher ranges use helical tubes with several windings to get enough tip travel from a stiffer tube. The European standard EN 837-1 covers Bourdon gauges in nominal sizes 40 to 250 mm and ranges up to 1,600 bar.</p><h3>Diaphragm and capsule</h3><p>At very low pressure, vacuum and compound ranges — a few inches of water or a few psi — a Bourdon tube is not sensitive enough. A diaphragm or capsule element gives more movement per unit of pressure. These are covered by EN 837-3.</p><h3>Digital</h3><p>A digital gauge replaces the tube and movement with a pressure sensor and a display. Enerpac’s DGR2, for example, reads to 20,000 psi with ±0.25% of full-scale accuracy, against ±1.5% for its standard analogue gauges.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Accuracy: grades and classes.', anchor: 'accuracy' },
    {
      type: 'diagram',
      captionPrefix: 'FIG. 01',
      caption: 'How ASME B40.100 Grade A distributes its tolerance across the scale, against a single-figure EN 837-1 class. Grade A is tightest in the middle half — one more reason to choose a range that puts working pressure in the middle of the dial.',
      alt: 'Diagram of a gauge scale from 0 to 100 percent of span divided into a lower quarter, middle half and upper quarter. ASME Grade A tolerance: plus or minus 2 percent of span in the lower quarter, 1 percent in the middle half and 2 percent in the upper quarter. ASME Grade B: 3, 2 and 3 percent. EN 837-1 Class 1.6: a single plus or minus 1.6 percent across the whole scale. The middle third of the scale is marked as the recommended working zone.',
      svg: GAUGE_ACCURACY,
    },
    {
      type: 'comparison_table',
      caption: 'ASME B40.100 accuracy grades (± % of span)',
      columns: ['Grade', 'Lower quarter', 'Middle half', 'Upper quarter', 'Typical use'],
      rows: [
        { cells: ['4A', '0.1', '0.1', '0.1', 'Test and calibration gauges'] },
        { cells: ['3A', '0.25', '0.25', '0.25', 'Test gauges'] },
        { cells: ['2A', '0.5', '0.5', '0.5', 'Process'] },
        { cells: ['1A', '1', '1', '1', 'Process and industrial'], highlight: true },
        { cells: ['A', '2', '1', '2', 'General industrial'] },
        { cells: ['B', '3', '2', '3', 'Commercial, utility'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Grades 1A to 4A apply one tolerance across the whole span; Grades A and B are tighter in the middle half than at the ends. (Grades C and D also exist for the least demanding commercial gauges.) The European system works differently: an <strong>EN 837-1 class</strong> is the permitted error as a single ± percentage of span over the whole scale. Class 1.0 allows ±1% of span; Class 1.6 on a 0–400 bar gauge allows ±6.4 bar anywhere on the dial, or on 0–10,000 psi, ±160 psi. Manufacturer data commonly offers classes 0.6, 1.0, 1.6 and 2.5.</p><p>“1.6% FSD” on our CF and CDS gauges means 1.6% of full-scale deflection — on a gauge whose scale starts at zero, the same as 1.6% of span. On a 0–3,000 psi gauge that is ±48 psi. Our CFC and PDSS 4" gauges are 1% FSD; Enerpac’s G-series quote 1.5% of full scale, which matches neither an EN class nor an ASME grade exactly — read the number, not the label.</p><p>Temperature adds to the class error. WIKA gives an extra 0.4% of span for every 10 K away from the 20 °C reference; Ashcroft gives about 0.4% per 25 °F. On a gauge sitting in the sun on a Gulf skid, that error is not small.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Range.', anchor: 'range' },
    {
      type: 'prose',
      html: '<p>EN 837-2 puts it simply: the operating pressure should fall in the <strong>middle third</strong> of the scale. Ashcroft’s rule of thumb — a range about twice the maximum operating pressure — lands in the same place. Too low a range wears the element out through fatigue and leaves it exposed to transients; too high a range gives poor resolution. The full reasoning, including how much of the scale small and large gauges may use under steady and pulsating pressure, is in <a href="/blog/how-to-choose-a-pressure-gauge-range">how to choose a gauge range</a>.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Safety-pattern cases.', anchor: 'safety' },
    {
      type: 'prose',
      html: '<p>If a Bourdon tube ruptures, the pressure inside the case has to go somewhere. EN 837-1 codes the protection:</p><ul><li><strong>0</strong> — no blow-out device.</li><li><strong>S1</strong> — a blow-out device in the case.</li><li><strong>S2</strong> — safety pattern without a baffle wall.</li><li><strong>S3</strong> — safety pattern with a solid baffle wall between the movement and the window and a blow-out back, so a failure vents away from the person reading it.</li></ul><p>EN 837-2 sets the minimum: dry gauges on liquids need only code 0; liquid-filled gauges need at least S1 (filled gauges must have a blow-out device); on gas or steam above 25 bar, S2 for 40–80 mm gauges and <strong>S3 for 100–250 mm gauges</strong>. Oxygen and acetylene always need safety-pattern gauges with oil- and grease-free wetted parts. WIKA’s instructions also ask for at least 20 mm of clearance behind the blow-out device.</p>',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Never stand in front of a gauge on gas at high pressure.',
      body: 'A dry gauge without a blow-out device on compressed gas can blow its window out if the element fails. On gas and steam above 25 bar, fit the safety pattern EN 837-2 requires, and on any test or charging rig read the gauge from the side.',
    },

    { type: 'section_head', number: '/05', title: 'Size, connection and materials.', anchor: 'construction' },
    {
      type: 'prose',
      html: '<ul><li><strong>Dial size</strong> — 1.5", 2", 2.5" (63 mm), 4" (100 mm) and 6" are all on our shelf. Bigger dials are easier to read at a distance and resolve smaller divisions; EN 837 also lets gauges of 100 mm and over use more of their scale.</li><li><strong>Connection</strong> — 1/8", 1/4" and 1/2" NPT are the common US threads; 7/16-20 SAE straight thread appears on mobile hydraulics; G 1/4 and G 1/2 BSP on European equipment. Bottom (lower) mount for stem mounting on a line; back (rear) mount and front-flange panel versions for panels.</li><li><strong>Wetted parts</strong> — brass or phosphor bronze Bourdon tubes and sockets suit oil, water and air. For corrosive media, sour service or seawater, use all-stainless wetted parts; for cryogenic service, stainless (bronze or Monel acceptable), never steel, which loses ductility in the cold.</li><li><strong>Case</strong> — stainless cases resist corrosion; most of our gauges have 304 stainless cases and bezels and polycarbonate lenses.</li><li><strong>Fill</strong> — dry, or filled with glycerine or silicone to damp vibration and pulsation. See <a href="/blog/glycerine-filled-vs-dry-pressure-gauges">glycerine-filled vs dry gauges</a>.</li></ul>',
    },

    { type: 'section_head', number: '/06', title: 'Installing and checking a gauge.', anchor: 'install' },
    {
      type: 'prose',
      html: '<ol><li><strong>Tighten on the flats.</strong> Use a spanner on the connection’s wrench flats, never on the case — force through the case distorts the movement.</li><li><strong>Sealant on the male thread only</strong>, sparingly, kept off the first thread (Enerpac). Parallel-thread gauges seal on a gasket, not on sealant.</li><li><strong>Isolate it.</strong> A needle valve or gauge isolation valve lets the gauge be vented, checked and replaced without shutting the system down.</li><li><strong>Open slowly.</strong> Bring pressure on gradually to avoid a surge slamming the pointer.</li><li><strong>Check zero in service.</strong> Close the isolation valve and vent the gauge: the pointer must sit inside the zero mark. If it does not, the element may be permanently distorted and the gauge should be replaced.</li><li><strong>Calibrate on a schedule you set.</strong> Ashcroft gives once every 12 months as the typical baseline for stable industrial service, shorter for vibration, pulsation or rapid cycling, and notes no organisation mandates an interval — it is the user’s call.</li></ol>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How does a Bourdon tube pressure gauge work?', answer: 'Pressure inside a curved, closed tube makes it try to straighten. The tip movement drives a linkage and gear movement that turns the pointer.' },
        { question: 'What does ASME Grade A accuracy mean?', answer: '±2% of span in the lower and upper quarters of the scale and ±1% in the middle half. Grade 1A is ±1% across the whole scale.' },
        { question: 'What does 1.6% FSD accuracy mean?', answer: 'The reading may be off by up to 1.6% of the full-scale value anywhere on the dial — ±48 psi on a 0–3,000 psi gauge, ±6.4 bar on 0–400 bar.' },
        { question: 'What is an S3 safety pattern gauge?', answer: 'A gauge with a solid baffle wall between the movement and the window and a blow-out back, so a ruptured element vents away from the reader. EN 837-2 requires it for gas or steam above 25 bar on 100–250 mm gauges.' },
        { question: 'How often should pressure gauges be calibrated?', answer: 'The user sets the interval. Twelve months is a common baseline for stable service; shorten it where there is vibration, pulsation or rapid cycling.' },
        { question: 'When should a pressure gauge be replaced?', answer: 'When the pointer does not return inside the zero mark with the gauge vented — the element may be permanently distorted — or after overpressure, or if it has been damaged.' },
        { question: 'What is the difference between EN 837 and ASME B40.100?', answer: 'Both cover pressure gauges. EN 837-1 classes give a single ± percentage of span across the scale; ASME grades A and B give different tolerances for the middle and the ends of the scale.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Gauges on our shelf',
      skus: ['IH-DFC-CF-25-14NPT', 'IH-DFC-CDS-2-14NPT', 'IH-DFC-CFC-4-14NPT', 'IH-DFC-PDSS-4-14NPT', 'IH-GA-201L', 'IH-GA-204L', 'IH-PG-12NPT-BM-6IN-10K', 'IH-ENE-GAUGE-DGR'],
    },
    { type: 'category_link', slug: 'ic-pressure-gauges', label: 'Pressure gauges', blurb: 'Dry, glycerine-filled and all-stainless gauges, 1.5" to 6" dials.' },
    {
      type: 'related_articles',
      slugs: ['how-to-choose-a-pressure-gauge-range', 'glycerine-filled-vs-dry-pressure-gauges', 'high-pressure-hydraulic-gauges', 'oilfield-pressure-and-flow-instrumentation', 'tube-fitting-end-connections'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Principles and EN 837 requirements from SAMSON’s EN 837 application note; ASME grades and calibration from Ashcroft; Enerpac figures from Enerpac pages; our gauges from our listings.',
    },
    {
      type: 'cta_block',
      heading: 'Choosing a gauge?',
      body: 'Send the working and maximum pressure, the medium, whether it pulses or vibrates, the connection and the dial size you want. We will propose range, accuracy, fill and case pattern.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
