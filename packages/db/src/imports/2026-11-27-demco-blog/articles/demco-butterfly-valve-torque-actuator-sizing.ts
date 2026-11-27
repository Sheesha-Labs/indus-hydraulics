import type { BlogArticleSeed } from '../shared'

/**
 * DEMCO butterfly valve torque and actuator and gear sizing. Sources: DEMCO butterfly valve brochure
 * p.7 and p.10 (handles to 12 in, gear operator recommended for 8 to 12 in), p.9 (handles, gear
 * operators), p.22 (handle numbers and weights), p.23 (worm gear operator base numbers, weights, ratios,
 * turns, maximum input torque), p.25 (pressure ratings, 50 psi and throttling discs, vacuum) and p.26
 * (torque table in.lbf, normal wet opening, dry service, dynamic torque, 15 ft/s). Torque figures are as printed;
 * the brochure does not print gear operator output torque.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'demco-butterfly-valve-torque-actuator-sizing',
  title: 'DEMCO butterfly valve torque: sizing the actuator or gear operator',
  excerpt:
    'The torque a DEMCO butterfly valve needs depends on its size and its shut-off rating, and rises in dry service and under flow. This guide prints the in·lbf torque table for 2 to 36 in, explains dynamic torque and the 50 psi and throttling discs, and gives the handle and worm gear operator data.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'DEMCO Butterfly Valve Torque Table and Actuator Sizing',
  seoDescription:
    'DEMCO butterfly valve torque table in in·lbf by size and rating, dynamic torque near 70°, 50 psi discs, plus handle and gear operator selection.',
  focusKeyword: 'demco butterfly valve torque',
  publishedAt: '2026-11-27T17:00:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'How much torque does a DEMCO butterfly valve need?',
      answer:
        'It depends on size and shut-off rating. Normal wet opening torque for a 6 in valve is 900 in·lbf at 200 psi, 1,530 at 285 psi, 550 at 50 psi and 180 as a throttling valve. Dry service raises opening torque significantly, and dynamic torque peaks near 70° open. The actuator must meet or exceed the maximum torque.',
    },
    {
      type: 'key_takeaways',
      items: [
        'The brochure’s torque table is normal wet opening torque in in·lbf, by size, for 285, 200, 150, 50 psi and throttling discs. It excludes the NEI-T series.',
        'Dry service increases opening torque significantly. Ask the maker for dry service torque, and for dry or vacuum lines the brochure recommends 50 psi discs.',
        'Dynamic torque comes from flow over a part-open disc, is proportional to pressure drop, and typically peaks when the disc is about 70° open. Over 15 ft/s, dynamic torque on a throttling valve exceeds opening torque.',
        'The 50 psi and throttling discs allow smaller actuators, which the brochure says can significantly reduce installation cost.',
        'Handles fit 2 to 12 in valves. A gear operator is recommended for 8 to 12 in in all series, and is the choice from 14 in up.',
      ],
    },
    {
      type: 'lead',
      html: 'An undersized operator on a butterfly valve fails in one of two ways: the handle cannot be turned, or an actuator stalls part-way through its stroke. The brochure prints the numbers to avoid it, but they are on one page and need reading with the notes beside them. This article reproduces the torque table, explains the three effects that raise torque above it, and lines up the handles and worm gear operators with the valve sizes. The valve part-number background is in <a href="/blog/demco-butterfly-valve-part-numbers">DEMCO butterfly valve part numbers</a>.',
    },

    { type: 'section_head', number: '/01', title: 'The torque table.', anchor: 'torque-table' },
    {
      type: 'paragraph',
      html: 'The brochure lists torque for normal wet opening, in inch-pounds force, for every series except NEI-T. Each column is a disc type: the 285 and 200 psi shut-off discs, the 150 psi disc used on 14 to 36 in valves, the 50 psi disc, and the throttling disc. Find the valve size, then the column for the disc fitted, which is in the base number (see the base-number tables in the part-number guide).',
    },
    {
      type: 'comparison_table',
      caption: 'DEMCO butterfly valve torque, normal wet opening, in·lbf (except NEI-T)',
      columns: ['Valve size', '285 psi shut-off', '200 psi shut-off', '150 psi shut-off', '50 psi shut-off', 'Throttling'],
      rows: [
        { cells: ['2 in', '225', '132', '–', '108', '72'] },
        { cells: ['2-1/2 in', '326', '192', '–', '108', '72'] },
        { cells: ['3 in', '510', '300', '–', '192', '90'] },
        { cells: ['4 in', '765', '450', '–', '264', '108'] },
        { cells: ['5 in', '1,190', '700', '–', '450', '144'] },
        { cells: ['6 in', '1,530', '900', '–', '550', '180'] },
        { cells: ['8 in', '2,550', '1,500', '–', '1,000', '350'] },
        { cells: ['10 in', '4,125', '2,650', '–', '1,800', '700'] },
        { cells: ['12 in', '7,000', '4,500', '–', '3,000', '1,160'] },
        { cells: ['14 in', '15,000', '–', '7,740', '4,500', '1,660'] },
        { cells: ['16 in', '20,500', '–', '10,280', '6,500', '2,800'] },
        { cells: ['18 in', '38,400', '–', '12,600', '8,400', '3,400'] },
        { cells: ['20 in', '45,000', '–', '15,600', '10,800', '5,000'] },
        { cells: ['24 in', '65,000', '–', '30,000', '20,000', '8,400'] },
        { cells: ['30 in', '82,000', '–', '50,000', '30,000', '–'] },
        { cells: ['36 in', '90,000', '–', '67,500', '50,000', '–'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The step from one disc to the next is large. A 12 in valve needs 4,500 in·lbf with a 200 psi disc, 3,000 with a 50 psi disc and 1,160 as a throttling valve. If the duty is low pressure and the valve is automated, the lower-rated disc can drop an actuator size. The brochure says exactly that: the 50 psi and throttling ratings allow smaller actuators, which can significantly reduce installation cost in automated applications. A throttling disc does not provide drop-tight closure, so it only suits lines where tight shut-off is not needed.',
    },

    { type: 'section_head', number: '/02', title: 'Three things that raise torque.', anchor: 'raise-torque' },
    {
      type: 'paragraph',
      html: '<strong>Dry service.</strong> The table is for wet opening. The brochure says dry service increases opening torque significantly and refers the reader to the maker for dry service torque. A line that is drained between runs, a bulk-handling line or a vacuum line is dry service. For vacuum and other dry conditions, the brochure recommends 50 psi discs for reduced torque and longer seat life. The valve seals against 10 µm of vacuum (29.9 in Hg).',
    },
    {
      type: 'paragraph',
      html: '<strong>Dynamic torque.</strong> A part-open disc behaves like an aerofoil: the fluid passing over it creates a lift force that turns the disc. The brochure compares this to an airplane wing. The effect is proportional to the pressure drop through the valve, and it is typically greatest when the disc is about 70° open. Under high differential pressure it can exceed the design strength of stems, connections or actuators, so the stem and the actuator coupling need checking as well as the operator torque.',
    },
    {
      type: 'paragraph',
      html: '<strong>High velocity.</strong> The table’s footnote on throttling valves says that when line velocity exceeds 15 ft/s, dynamic torque exceeds opening torque. For throttling service at high velocity, the opening torque in the table is therefore not the governing figure. Size from the dynamic torque, which the brochure leaves to the maker to supply for the actual duty.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'The table is a minimum, not a margin.',
      body: 'The actuator’s torque output has to meet or exceed the maximum torque the valve will need. That maximum is the highest of the wet opening torque, the dry-service torque and the dynamic torque for the real flow. Send us the pressure, the fluid, whether the line is drained, and the velocity or flow rate and we will check the case with the maker.',
    },

    { type: 'section_head', number: '/03', title: 'Handles: 2 to 12 in.', anchor: 'handles' },
    {
      type: 'paragraph',
      html: 'Three handle designs fit any 2 to 12 in valve: ten-position locking, two-position locking and memory-stop. The memory-stop handle is the throttling handle, infinitely adjustable, set by a lock nut that acts as an adjustable open stop. Each comes in basic, corrosion-resistant and sanitary trim; the base number carries a suffix of -001 for standard and -002 for corrosion-resistant. A handle is the right operator at the small end, but the brochure notes that a gear operator is recommended for 8 to 12 in in all series.',
    },
    {
      type: 'comparison_table',
      caption: 'DEMCO handles by valve size, base numbers and weight',
      columns: ['Valve size', 'Ten-position', 'Two-position', 'Throttling', 'Weight, lbm'],
      rows: [
        { cells: ['2 to 4 in', '24227', '24232', '24252', '2.3'] },
        { cells: ['5 to 6 in', '24228', '24233', '24253', '2.9'] },
        { cells: ['8 in', '24229', '24234', '24254', '6.5'] },
        { cells: ['10 in', '24230', '24235', '24255', '6.5'] },
        { cells: ['12 in', '24231', '24236', '24256', '6.5'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Handle length (dimension M) is 9.50 in [241 mm] for 2 to 4 in, 11.00 in [279 mm] for 5 to 6 in and 15.00 in [381 mm] for 8 to 12 in. The handles are listed as <a href="/p/demco-10-position-locking-handle-for-butterfly-valves-2-12">ten-position</a>, <a href="/p/demco-2-position-locking-handle-for-butterfly-valves-2-12">two-position</a> and <a href="/p/demco-memory-stop-throttling-handle-for-butterfly-valves-2-12">memory-stop throttling</a> handles.',
    },

    { type: 'section_head', number: '/04', title: 'Worm gear operators: 2 to 36 in.', anchor: 'gears' },
    {
      type: 'paragraph',
      html: 'The worm gear operators are weatherproof, manual and self-locking in all positions. Adjustment screws stop travel at open and closed, and a position indicator is standard. Gearing is permanently lubricated. The worm gear has either self-locking set screws for open and closed positioning, or an optional adjustable memory-stop to return the valve to a preset open position after closing. They are ordered as an operator base number plus a configuration, with handwheel (03) or without actuation (09) for 14 to 36 in.',
    },
    {
      type: 'comparison_table',
      caption: 'DEMCO worm gear operators, ratio, turns, maximum input torque and weight',
      columns: ['Valve size', 'Operator base', 'Gear ratio', 'Turns per 90°', 'Max input torque, ft·lbf', 'Weight with handwheel, lbm [kg]'],
      rows: [
        { cells: ['2 to 6 in', '22622', '30:1', '7-1/2', '46', '7.8 [3.5]'] },
        { cells: ['8 to 10 in', '22623', '48:1', '12', '65', '17.2 [7.8]'] },
        { cells: ['12 in', '22623', '48:1', '12', '65', '18.6 [8.4]'] },
        { cells: ['14 in', '2060229', '48:1', '12', '65', '19.0 [8.6]'] },
        { cells: ['16 in', '2060230', '48:1', '12', '65', '22.0 [10.0]'] },
        { cells: ['18 to 20 in', '2060231', '57:1', '14-1/4', '98', '33.0 [15.0]'] },
        { cells: ['24 in', '2060232', '60:1', '15', '164', '43.0 [19.5]'] },
        { cells: ['30 in', '2060332', '316:1', '79', '104', '107.0 [48.5]'] },
        { cells: ['36 in', '2060334', '240:1', '60', '174', '137.0 [62.1]'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Read the turns column with the torque table. The 30 in operator takes 79 turns for a quarter-turn valve and the 36 in takes 60, at ratios of 316:1 and 240:1. Turns of that order are why large valves on frequent duty are usually automated; the brochure refers readers to the maker for actuator options, and our <a href="/p/demco-worm-gear-operator-for-butterfly-valves-2-36">worm gear operator</a> and <a href="/p/demco-series-dr-double-acting-pneumatic-actuator-for-butterfly-valves-2-24">pneumatic actuator</a> listings cover the two routes. The brochure does not print the operator’s output torque, so confirm that against the valve’s torque with us before ordering.',
    },
    {
      type: 'paragraph',
      html: 'The valve’s top flange is dimensionally compatible with other butterfly valves, and the optional utility-top stem lets a DEMCO valve replace another valve without new actuation hardware. That matters if you are replacing valves in an existing actuated line.',
    },

    { type: 'section_head', number: '/05', title: 'What to send us.', anchor: 'what-to-send' },
    {
      type: 'paragraph',
      html: 'Indus Hydraulics quotes DEMCO butterfly valves, handles, gear operators and actuators from Dubai, UAE. For sizing, send the valve size and series, the shut-off rating or disc, the fluid, the pressure drop, whether the line is wet or dry, and the line velocity. We check the table and the notes and propose the operator. See the <a href="/c/butterfly-valves">butterfly valves</a> and <a href="/c/valve-actuators">valve actuators</a> shelves.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'What torque does a 6 in DEMCO butterfly valve need?',
          answer:
            'Normal wet opening torque for a 6 in valve is 900 in·lbf at 200 psi shut-off, 1,530 in·lbf at 285 psi, 550 in·lbf at 50 psi, and 180 in·lbf as a throttling valve.',
        },
        {
          question: 'Why do dry valves need more torque?',
          answer:
            'The brochure says dry service increases opening torque significantly. Ask for dry service torque, and consider a 50 psi disc, which the brochure recommends for dry and vacuum service.',
        },
        {
          question: 'What is dynamic torque and when is it highest?',
          answer:
            'Flow over a part-open disc creates a lift force that turns it. It is proportional to the pressure drop and is typically highest when the disc is about 70° open, and it can exceed the design strength of stems, connections or actuators at high differential pressure.',
        },
        {
          question: 'Which operator suits which size?',
          answer:
            'Handles are available for 2 to 12 in. A gear operator is recommended for 8 to 12 in in all series, and worm gear operators are offered from 2 to 36 in.',
        },
        {
          question: 'How many turns does a worm gear operator need?',
          answer:
            '7-1/2 turns per 90° on 2 to 6 in valves, 12 on 8 to 16 in, 14-1/4 on 18 to 20 in, 15 on 24 in, 79 on 30 in and 60 on 36 in.',
        },
        {
          question: 'Do 50 psi and throttling discs really allow a smaller actuator?',
          answer:
            'Yes. The torque table shows it: a 12 in valve is 4,500 in·lbf at 200 psi, 3,000 at 50 psi and 1,160 as a throttling valve. A throttling disc does not give drop-tight closure.',
        },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Handles, gear operators and actuators',
      skus: ['IH-VAL-BFLY-HDL-10P', 'IH-VAL-BFLY-HDL-MEM', 'IH-VAL-BFLY-WGO', 'IH-VAL-BFLY-DR-DA'],
    },
    {
      type: 'category_link',
      slug: 'valve-actuators',
      label: 'Valve actuators',
      blurb: 'Actuators and operators for valves, including those that fit DEMCO butterfly valves.',
    },
    {
      type: 'category_link',
      slug: 'butterfly-valves',
      label: 'Butterfly valves',
      blurb: 'DEMCO butterfly valves with handles, gear operators and actuators.',
    },
    {
      type: 'related_articles',
      slugs: ['demco-butterfly-valve-part-numbers', 'demco-butterfly-valve-seat-replacement', 'demco-gate-valve-vs-butterfly-valve', 'butterfly-valves-wafer-lug-and-grooved'],
    },
    {
      type: 'cta_block',
      heading: 'Sizing an operator for a DEMCO butterfly valve?',
      body: 'Send the size, rating, fluid, pressure drop and whether the line is dry. We will check the torque and propose a handle, gear operator or actuator.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
