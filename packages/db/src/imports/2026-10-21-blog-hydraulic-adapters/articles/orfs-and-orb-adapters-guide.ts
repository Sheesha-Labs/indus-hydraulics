import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Steel ORFS and ORB adapters and their O-rings. Sources read 2026-10-21: Parker Catalog 4300 (2017; current 9/2023):
 * Seal-Lok meets SAE J1453 / ISO 8434-3; nut + body + O-ring + sleeve; captive O-ring groove; tube flanged 90° or
 * brazed to a sleeve; "leak-free design"; F5OLO (ORFS × ORB) steel ratings -4 to -8 9,200, -10 to -20 6,000, -24
 * 5,000, -32 3,000 psi; ORFS nut threads and torque (Table S14), torque the preferred method; connection must take
 * 200 % of rated torque; ORB = SAE J1926 / ISO 11926, UN/UNF straight thread; adjustable vs non-adjustable ends;
 * straight-thread O-ring ports 6,000 psi and higher up to size 12 (M27); standard O-rings 90-durometer nitrile,
 * fluorocarbon optional, 90 durometer for 1,500 psi and above. Listing titles (incl. braze and mechanical sleeves,
 * Tompkins-made parts, NBR and FKM O-rings, 288-piece kit).
 * Parker O-ring tables (Table T24 / p.N4): ORB 3-9xx by dash; ORFS 2-011 … 2-135, 0.070" section except -32 0.103";
 * N0756 75-durometer NBR for CNG.
 * NOT used: a "zero leak" quote; kit contents.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'orfs-and-orb-adapters-guide',
  title: 'ORFS and ORB adapters: O-ring face seal and O-ring boss — ratings, torque, sleeves and O-rings',
  excerpt:
    'Most hydraulic leaks that come back after re-tightening are metal seats that never sealed. ORFS and ORB move the seal to an O-ring — and that makes the O-ring the part to stock. The steel ORFS and ORB range: unions, elbows, tees, bulkheads, swivels, adjustable elbows, braze and mechanical sleeves, plugs and O-ring kits, with Parker’s ratings (9,200 psi in the small sizes) and torque by dash size.',
  categorySlug: 'buying-hydraulic-fittings',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'ORFS & ORB Adapters: Ratings, Torque, Sleeves & O-Rings',
  seoDescription:
    'A guide to steel ORFS (SAE J1453) and ORB (SAE J1926) hydraulic adapters: unions, elbows, tees, swivels, adjustable ends, braze sleeves, pressure ratings by dash size, ORFS torque, and NBR vs FKM O-rings.',
  focusKeyword: 'orfs adapters',
  publishedAt: '2026-10-21T19:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'ORFS (SAE J1453 / ISO 8434-3) seals on an O-ring held in a groove in the male face; ORB (SAE J1926 / ISO 11926) seals on an O-ring under the adapter shoulder in a straight-thread port.',
        'Parker rates its steel ORFS × ORB connectors at 9,200 psi for -4 to -8, 6,000 psi for -10 to -20, 5,000 psi at -24 and 3,000 psi at -32.',
        'ORFS is made up by torque — Parker gives 18 ft-lb at -4, 40 at -8, 110 at -16 — and requires the joint to survive 200% of rated torque.',
        'On the tube side ORFS needs a sleeve: brazed onto the tube, or a mechanical sleeve for tube flanged to 90°.',
        'The O-ring is the wear part: standard is 90-durometer nitrile; FKM for heat and fluids nitrile dislikes. Keep a kit.',
      ],
    },
    {
      type: 'lead',
      html: 'ORFS and ORB are the two O-ring connections of inch hydraulics, and most modern North American and Asian machines use both: ORFS on hose and tube ends, ORB on valve, pump and cylinder ports. Because the seal is an elastomer, both tolerate vibration and pressure spikes that loosen a metal seat — and both fail when the O-ring is wrong, cut or missing. This guide covers the steel adapter range, how it is rated and made up, and the O-rings to stock with it.',
    },

    { type: 'section_head', number: '/01', title: 'How each seals.', anchor: 'seal' },
    {
      type: 'prose',
      html: '<p><strong>ORFS</strong> is a nut, a body, an O-ring and a sleeve. The O-ring sits in a captive groove in the flat face of the male body; the nut draws a flat sleeve face onto it. Parker describes the design as leak-free. On tube the sleeve is either brazed on, or a mechanical sleeve is used with the tube end flanged to 90°.</p><p><strong>ORB</strong> is a port, not a tube end: a UN/UNF straight thread with an O-ring that is squeezed into a chamfer at the top of the port by the adapter’s shoulder. The thread holds; the O-ring seals. Parker recommends ORB, four-bolt flanges or ISO 6149 ports over tapered pipe threads.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Parker steel ORFS × ORB connector ratings, and ORFS nut thread and torque',
      columns: ['Dash', 'Tube OD', 'Working pressure', 'ORFS nut thread', 'ORFS torque'],
      rows: [
        { cells: ['-4', '1/4"', '9,200 psi', '9/16-18', '18 ft-lb (25 N·m)'] },
        { cells: ['-6', '3/8"', '9,200 psi', '11/16-16', '30 ft-lb (40 N·m)'] },
        { cells: ['-8', '1/2"', '9,200 psi', '13/16-16', '40 ft-lb (55 N·m)'], highlight: true },
        { cells: ['-10', '5/8"', '6,000 psi', '1-14', '60 ft-lb (80 N·m)'] },
        { cells: ['-12', '3/4"', '6,000 psi', '1 3/16-12', '85 ft-lb (115 N·m)'] },
        { cells: ['-16', '1"', '6,000 psi', '1 7/16-12', '110 ft-lb (150 N·m)'], highlight: true },
        { cells: ['-20', '1 1/4"', '6,000 psi', '1 11/16-12', '150 ft-lb (205 N·m)'] },
        { cells: ['-24', '1 1/2"', '5,000 psi', '2-12', '230 ft-lb (315 N·m)'] },
        { cells: ['-32', '2"', '3,000 psi', '2 1/2-12', '375 ft-lb (510 N·m)'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>ORFS nut threads are not JIC threads of the same dash — a -8 ORFS nut is 13/16-16, a -8 JIC nut 3/4-16 — so the two families cannot be screwed together by mistake. The ORB port thread, by contrast, follows the tube dash (-4 7/16-20, -8 3/4-16, -16 1 5/16-12), the same as the JIC thread of that dash. Parker notes that straight-thread O-ring ports hold 6,000 psi and more up to size 12 (M27), and lose capability above it.</p>',
    },

    { type: 'section_head', number: '/02', title: 'The range.', anchor: 'range' },
    {
      type: 'prose',
      html: '<ul><li><strong>Straight connectors</strong>: ORFS male to ORB, NPT, BSPP, metric flat-face or JIC.</li><li><strong>Unions, elbows, tees, crosses and bulkheads</strong> with ORFS male ends, and bulkhead locknuts.</li><li><strong>Swivels</strong>: ORFS female swivel nuts on elbows and connectors, joining to an ORFS male without twisting the line.</li><li><strong>Adjustable elbows and tees</strong> with an ORB, BSP or metric stud, a locknut and back-up washer, so the fitting can be aimed before it is locked.</li><li><strong>Sleeves and nuts</strong>: braze sleeves, mechanical sleeves and tube nuts for tube work.</li><li><strong>ORB adapters</strong>: ORB × NPTF, ORB × ORB reducers and unions, ORB elbows to NPTF, JIC and NPSM swivel ends, and hex, hollow-hex and socket plugs.</li><li><strong>O-rings</strong>: NBR and FKM rings for ORB ports and ORFS faces, and an assortment kit.</li></ul>',
    },

    { type: 'section_head', number: '/03', title: 'O-rings: the part that wears.', anchor: 'orings' },
    {
      type: 'prose',
      html: '<p>An ORFS or ORB joint is only as good as its O-ring. Parker’s standard ring in SAE fittings is 90-durometer nitrile (Buna-N); it calls for 90-durometer rings at 1,500 psi and above, and offers fluorocarbon (FKM, Viton) as the option for heat and for fluids nitrile does not tolerate. Replace the O-ring every time a joint is opened, check it is the face-seal size for ORFS and the boss size for ORB — they are not the same ring — and keep it clean and lightly lubricated with system fluid on assembly. A cut or pinched O-ring is the usual cause of a new ORFS joint that leaks; see <a href="/blog/reading-a-weeping-joint">reading a weeping joint</a>.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Parker standard O-ring sizes: ORB port (SAE J1926) and ORFS face',
      columns: ['Dash', 'ORB thread', 'ORB O-ring', 'ORFS O-ring'],
      rows: [
        { cells: ['-4', '7/16-20', '3-904', '2-011'] },
        { cells: ['-6', '9/16-18', '3-906', '2-012'] },
        { cells: ['-8', '3/4-16', '3-908', '2-014'], highlight: true },
        { cells: ['-10', '7/8-14', '3-910', '2-016'] },
        { cells: ['-12', '1 1/16-12', '3-912', '2-018'] },
        { cells: ['-16', '1 5/16-12', '3-916', '2-021'], highlight: true },
        { cells: ['-20', '1 5/8-12', '3-920', '2-025'] },
        { cells: ['-24', '1 7/8-12', '3-924', '2-029'] },
        { cells: ['-32', '2 1/2-12', '3-932', '2-135'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Two patterns make these easy to remember: the ORB ring number is 3-9 followed by the dash size, and every ORFS face ring is 0.070" (1.78 mm) section except -32 at 0.10" (2.54 mm). Parker also offers a 75-durometer nitrile for CNG service.</p>',
    },
    {
      type: 'decision_tree',
      heading: 'Which O-ring?',
      branches: [
        { condition: 'Mineral hydraulic oil, normal temperature?', outcome: '90-durometer nitrile (NBR) — the standard ring.', sku: 'IH-ST-OFS1' },
        { condition: 'Hot oil, synthetic or fire-resistant fluid that attacks nitrile?', outcome: 'FKM (Viton).', sku: 'IH-ST-OFS2' },
        { condition: 'ORB port rather than an ORFS face?', outcome: 'The ORB boss ring for that dash, NBR or FKM.', sku: 'IH-ST-OB1' },
        { condition: 'Workshop or field service stock?', outcome: 'An assortment kit covering the common sizes.', sku: 'IH-ST-30002' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the difference between ORFS and ORB?', answer: 'ORFS is a tube or hose end that seals on an O-ring in a flat face (SAE J1453). ORB is a port that seals on an O-ring under the adapter shoulder (SAE J1926). Many adapters have one of each.' },
        { question: 'What pressure are ORFS adapters rated for?', answer: 'In Parker’s steel tables, ORFS × ORB connectors are 9,200 psi for -4 to -8, 6,000 psi for -10 to -20, 5,000 psi at -24 and 3,000 psi at -32.' },
        { question: 'What torque for ORFS fittings?', answer: 'Parker: -4 18 ft-lb, -6 30, -8 40, -10 60, -12 85, -16 110, -20 150, -24 230, -32 375 ft-lb. Torque is the preferred method.' },
        { question: 'Can I reuse ORFS O-rings?', answer: 'Replace the O-ring whenever the joint is opened; it is inexpensive and the usual cause of a leak on reassembly.' },
        { question: 'Do ORFS and JIC fittings screw together?', answer: 'No. The nut threads differ for the same dash size, so they do not mate. Use an ORFS × JIC adapter.' },
        { question: 'What is a braze sleeve?', answer: 'An ORFS sleeve brazed onto plain tube to give it the flat sealing face. A mechanical sleeve is the alternative for tube flanged to 90°.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Steel ORFS and ORB adapters, sleeves and nuts — including Tompkins-made parts — and O-rings:</p>' + stockList(['orfs-adapters', 'orb-adapters', 'adapter-o-rings']),
    },
    {
      type: 'product_embed',
      heading: 'ORFS and ORB adapters',
      skus: ['IH-AD-ORFS-015', 'IH-AD-ORFS-014', 'IH-AD-ORFS-024', 'IH-AD-ORFS-010', 'IH-ST-FS319W', 'IH-ST-6401', 'IH-ST-6408', 'IH-ST-30002'],
    },
    { type: 'category_link', slug: 'orfs-adapters', label: 'ORFS adapters', blurb: 'Steel O-ring face seal unions, elbows, tees, swivels and sleeves.' },
    { type: 'category_link', slug: 'orb-adapters', label: 'ORB adapters', blurb: 'Steel O-ring boss connectors, elbows, reducers and plugs.' },
    { type: 'category_link', slug: 'adapter-o-rings', label: 'Adapter O-rings', blurb: 'NBR and FKM O-rings for ORB ports and ORFS faces, and kits.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'parker-4300', text: 'Parker Hannifin Tube Fittings Division. Catalog 4300 (2017 edition; current edition 9/2023).', url: 'https://parker.com/literature/Tube%20Fittings%20Division/4300_Catalog_Cover.pdf' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['jic-vs-orfs-vs-npt-vs-bsp', 'stainless-orfs-and-orb-fittings', 'jic-adapters-guide', 'reading-a-weeping-joint', 'hydraulic-fitting-make-up-torque'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Ratings, threads, torque and O-ring defaults from Parker Catalog 4300 (2017 edition — check the current edition before quoting a figure).',
    },
    {
      type: 'cta_block',
      heading: 'Ordering ORFS or ORB adapters?',
      body: 'Send the shape, both ends and dash sizes, and the fluid. We will quote the adapters with the right O-ring compound and spare rings.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
