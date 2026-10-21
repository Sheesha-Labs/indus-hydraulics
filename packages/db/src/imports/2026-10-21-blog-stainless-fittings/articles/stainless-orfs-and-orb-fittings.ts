import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Stainless ORFS and ORB fittings. Sources read 2026-10-21: Parker Catalog 4300 (2017 edition; current 9/2023):
 * Seal-Lok meets SAE J1453 and ISO 8434-3, nut + body + O-ring + sleeve, captive O-ring groove, tube flanged 90° or
 * brazed to a sleeve, "leak-free design"; F5OLO / HLO / C5OLO steel and 316 ratings identical (-4 to -8 9,200 psi …);
 * Seal-Lok torque Table S14 and "torque method … preferred"; must withstand 200 % of rated torque; ORB = SAE J1926 /
 * ISO 11926, UN/UNF "SAE straight thread"; adjustable vs non-adjustable port ends (locknut and back-up washer);
 * straight-thread O-ring ports 6,000 psi and higher up to size 12 (M27), falling beyond; standard O-rings 90-durometer
 * nitrile, fluorocarbon optional, 90 durometer for 1,500 psi and above. VOSS/DNV: FKM standard on metric stainless.
 * NOT used: a "zero leak" quote (Parker says "leak-free"); any ORB torque table.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'stainless-orfs-and-orb-fittings',
  title: 'Stainless ORFS and ORB fittings: O-ring face seal and O-ring boss in 316',
  excerpt:
    'Where a stainless 37° flare weeps, an O-ring face seal usually does not — and Parker rates its stainless ORFS fittings exactly as high as steel, to 9,200 psi in the small sizes. How ORFS and ORB seal, ratings and torque, adjustable and non-adjustable port ends, why the O-ring material has to be specified in stainless, and where the straight-thread port starts to lose pressure.',
  categorySlug: 'stainless-steel-fittings',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Stainless ORFS & ORB Fittings: Ratings, Torque & O-Rings',
  seoDescription:
    'Stainless steel ORFS (SAE J1453) and ORB (SAE J1926) fittings: how O-ring face seal and O-ring boss ports seal, 316 vs steel pressure ratings, ORFS torque by dash size, adjustable port ends, and nitrile vs FKM O-rings.',
  focusKeyword: 'stainless orfs fittings',
  publishedAt: '2026-10-21T17:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'ORFS (SAE J1453 / ISO 8434-3) seals on an O-ring held in a groove in the male face, pressed flat against a sleeve brazed or flanged onto the tube.',
        'Parker rates its stainless ORFS connectors the same as steel: 9,200 psi for -4 to -8, 6,000 psi for -10 to -20, 5,000 at -24 and 3,000 at -32.',
        'ORB is the SAE J1926 / ISO 11926 straight-thread port with an O-ring under the fitting shoulder — Parker’s recommended port over pipe threads.',
        'Adjustable ORB ends (with locknut and back-up washer) go on shaped fittings so they can be oriented; straight fittings use non-adjustable ends.',
        'Specify the O-ring: Parker’s SAE fittings come with 90-durometer nitrile even in stainless; FKM is an option and is standard on many metric stainless fittings.',
      ],
    },
    {
      type: 'lead',
      html: 'Metal-to-metal seats are unforgiving in stainless: a slightly harder tube, a scratched cone or a little vibration, and a 37° flare starts to weep. The two O-ring connections — ORFS on the tube side and ORB at the port — take that job away from the metal. This guide covers how both seal, how they are rated in 316, and the assembly details that keep them dry.',
    },

    { type: 'section_head', number: '/01', title: 'O-ring face seal.', anchor: 'orfs' },
    {
      type: 'prose',
      html: '<p>An ORFS connection is a nut, a body, an O-ring and a sleeve. The O-ring sits in a captive groove in the flat face of the male body; the tube end is either flanged to 90° or brazed to a sleeve, and the nut draws that flat sleeve face onto the O-ring. The seal is the O-ring, not the metal, which is why Parker describes the design as leak-free and why ORFS is the usual choice where vibration or high pressure defeats a flare. Parker requires a Seal-Lok connection to withstand 200% of its rated torque, so it tolerates over-tightening better than most.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Parker ORFS × ORB connector working pressure, psi (Catalog 4300, 2017): steel and 316 identical',
      columns: ['Dash', 'Tube OD', 'Steel', '316 stainless'],
      rows: [
        { cells: ['-4, -6, -8', '1/4"–1/2"', '9,200', '9,200'], highlight: true },
        { cells: ['-10 to -20', '5/8"–1 1/4"', '6,000', '6,000'] },
        { cells: ['-24', '1 1/2"', '5,000', '5,000'] },
        { cells: ['-32', '2"', '3,000', '3,000'] },
      ],
    },
    {
      type: 'comparison_table',
      caption: 'Parker ORFS assembly torque (torque is the preferred method)',
      columns: ['Dash', 'Tube OD', 'Nut thread', 'Torque'],
      rows: [
        { cells: ['-4', '1/4"', '9/16-18', '18 ft-lb (25 N·m)'] },
        { cells: ['-6', '3/8"', '11/16-16', '30 ft-lb (40 N·m)'] },
        { cells: ['-8', '1/2"', '13/16-16', '40 ft-lb (55 N·m)'], highlight: true },
        { cells: ['-10', '5/8"', '1-14', '60 ft-lb (80 N·m)'] },
        { cells: ['-12', '3/4"', '1 3/16-12', '85 ft-lb (115 N·m)'] },
        { cells: ['-16', '1"', '1 7/16-12', '110 ft-lb (150 N·m)'] },
        { cells: ['-20', '1 1/4"', '1 11/16-12', '150 ft-lb (205 N·m)'] },
        { cells: ['-24', '1 1/2"', '2-12', '230 ft-lb (315 N·m)'] },
        { cells: ['-32', '2"', '2 1/2-12', '375 ft-lb (510 N·m)'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Note that ORFS nut threads are not the 37° JIC threads for the same dash size — a -8 ORFS nut is 13/16-16, a -8 JIC nut 3/4-16 — so the two families cannot be mixed by mistake.</p>',
    },

    { type: 'section_head', number: '/02', title: 'O-ring boss ports.', anchor: 'orb' },
    {
      type: 'prose',
      html: '<p>ORB is the SAE J1926 / ISO 11926 port: a UN/UNF straight thread with an O-ring that seals in a chamfer at the top of the port, under the fitting shoulder. Its thread follows the tube dash size (-4 7/16-20, -8 3/4-16, -16 1 5/16-12). Parker recommends ORB, four-bolt flanges or ISO 6149 over pipe threads, and notes that straight-thread O-ring ports give 6,000 psi and higher up to size 12 (M27), above which the rating falls and the assembly torque climbs quickly.</p><ul><li><strong>Non-adjustable ends</strong> — on straight fittings; screw in to the shoulder and torque.</li><li><strong>Adjustable ends</strong> — on elbows and tees, with a locknut and back-up washer, so the fitting can be turned to face the line before the locknut is tightened onto the O-ring.</li></ul>',
    },

    { type: 'section_head', number: '/03', title: 'O-ring material in stainless.', anchor: 'orings' },
    {
      type: 'prose',
      html: '<p>A stainless fitting is usually specified for a harsher environment or fluid — and its O-ring has to match. Makers do not agree on the default: Parker’s standard O-ring in its SAE fittings and adapters is 90-durometer nitrile (Buna-N), with fluorocarbon as an option, and it calls for 90-durometer O-rings at 1,500 psi and above; metric makers commonly fit FKM to their stainless fittings as standard. If the system runs hot, uses phosphate-ester or other fluids nitrile dislikes, or sits in sun and ozone, order FKM explicitly.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What pressure are stainless ORFS fittings rated for?', answer: 'Parker rates stainless the same as steel: 9,200 psi for -4 to -8, 6,000 psi for -10 to -20, 5,000 psi at -24 and 3,000 psi at -32.' },
        { question: 'What is the difference between ORFS and ORB?', answer: 'ORFS is a tube or hose end that seals on an O-ring in a flat face (SAE J1453). ORB is a port thread that seals on an O-ring under the fitting shoulder (SAE J1926). An adapter can have one of each.' },
        { question: 'Are ORFS and JIC threads the same?', answer: 'No. For the same dash size the threads differ — -8 ORFS is 13/16-16, -8 JIC is 3/4-16 — so they do not mate.' },
        { question: 'What O-ring comes in a stainless ORFS fitting?', answer: 'Often 90-durometer nitrile (Parker’s SAE default); FKM is available and is standard from many metric makers. Specify it for heat or aggressive fluids.' },
        { question: 'What torque for a -8 ORFS fitting?', answer: 'Parker gives 40 ft-lb (55 N·m) for -8; torque is its preferred assembly method for ORFS.' },
        { question: 'What is an adjustable ORB fitting?', answer: 'A shaped fitting with a locknut and back-up washer on its ORB end, so it can be turned to face the line before the locknut is tightened onto the O-ring.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Stainless ORFS and ORB fittings and adapters:</p>' + stockList(['stainless-steel-orfs-adapters', 'stainless-steel-orb-adapters']),
    },
    {
      type: 'product_embed',
      heading: 'Stainless ORFS and ORB fittings',
      skus: ['IH-SS-FS2403', 'IH-SS-FS2500', 'IH-SS-FS6801', 'IH-SS-FS6403', 'IH-SS-6400', 'IH-SS-6801', 'IH-SS-6402', 'IH-SS-6408'],
    },
    { type: 'category_link', slug: 'stainless-steel-orfs-adapters', label: 'Stainless ORFS adapters', blurb: 'O-ring face seal unions, elbows, tees, bulkheads, nuts and braze sleeves.' },
    { type: 'category_link', slug: 'stainless-steel-orb-adapters', label: 'Stainless ORB adapters', blurb: 'O-ring boss connectors, adjustable elbows and tees, plugs and reducers.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'parker-4300', text: 'Parker Hannifin Tube Fittings Division. Catalog 4300 (2017 edition; current edition 9/2023).', url: 'https://parker.com/literature/Tube%20Fittings%20Division/4300_Catalog_Cover.pdf' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['stainless-hydraulic-adapters-guide', 'stainless-jic-fittings', 'stainless-din-2353-and-flareless-bite-fittings'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Ratings, torque, port limits and O-ring defaults from Parker Catalog 4300 (2017 edition — check the current edition before quoting a figure).',
    },
    {
      type: 'cta_block',
      heading: 'Moving to O-ring seals?',
      body: 'Send the ports, tube sizes, pressure and fluid. We will quote stainless ORFS and ORB fittings with the O-ring material the service needs.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
