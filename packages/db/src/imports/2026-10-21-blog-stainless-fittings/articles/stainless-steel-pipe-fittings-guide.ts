import type { BlogArticleSeed } from '../shared'

/**
 * Overview of stainless steel pipe fittings — the pillar for the process-fitting half of the wave. Every fact here
 * is restated from, and sourced in, the detailed articles: B16.9 / SP-43 / A403 / B36.19M (butt-weld), B16.11 and
 * MSS SP-114 (forged and cast threaded, socket weld), MSS SP-97 (outlets), B16.5 (flanges, Fike-reproduced ratings),
 * Alfa Laval / Dixon / Steel & O'Brien (sanitary), Outokumpu / Alleima / SSINA (grades), Swagelok MS-13-77 (NPT).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'stainless-steel-pipe-fittings-guide',
  title: 'Stainless steel pipe fittings: the families, the standards, and how to specify one',
  excerpt:
    'Butt-weld, socket-weld, threaded, flanged or sanitary — five ways to join stainless pipe and tube, each with its own standard, its own way of being rated and its own trap. A map of the families, what each standard covers, how pressure ratings work for each, and the six things an order for a stainless fitting has to state.',
  categorySlug: 'stainless-steel-fittings',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Stainless Steel Pipe Fittings Guide: Types, Standards & Ratings',
  seoDescription:
    'A guide to stainless steel pipe fittings: butt-weld (ASME B16.9), forged socket-weld and threaded (B16.11), cast 150# (MSS SP-114), flanges (B16.5), weld outlets (SP-97) and sanitary tri-clamp, with ratings and how to order.',
  focusKeyword: 'stainless steel pipe fittings',
  publishedAt: '2026-10-21T17:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Five families: butt-weld (ASME B16.9 / MSS SP-43), forged socket-weld and threaded (ASME B16.11), cast threaded (MSS SP-114), flanges (ASME B16.5) and sanitary clamp fittings (3-A, ASME BPE).',
        'Each is rated differently: butt-weld to its pipe schedule, forged fittings to a matching schedule by class, cast 150# and flanges to pressure–temperature tables, clamps by size and clamp type.',
        'Pipe fittings are sized by nominal pipe size and schedule; sanitary fittings by tube outside diameter. A 2" pipe fitting and a 2" sanitary fitting do not fit each other.',
        '304 for fresh water and indoor service, 316 wherever chlorides appear, and an L grade for anything welded.',
        'An order states six things: family and standard, size, schedule or class, grade, end connection and quantity — plus certificates if the project needs them.',
      ],
    },
    {
      type: 'lead',
      html: 'Stainless pipework is chosen to last, and it usually does — until one fitting in it was the wrong kind. A cast fitting where the line needed forged, a Sch 10S elbow in a Sch 40S line, a 304 tee on a coastal plant, a pipe-size clamp ferrule on sanitary tube. This guide maps the families of stainless fittings, so the right one gets ordered the first time; each section links to the detailed article.',
    },

    { type: 'section_head', number: '/01', title: 'The five families.', anchor: 'families' },
    {
      type: 'comparison_table',
      caption: 'Stainless pipe fitting families at a glance',
      columns: ['Family', 'Standard', 'Sizes', 'Rated by', 'Use'],
      rows: [
        { cells: ['Butt-weld', 'ASME B16.9; MSS SP-43 (5S/10S)', 'NPS ½–48', 'The matching pipe schedule', 'Process piping above small bore'], highlight: true },
        { cells: ['Forged threaded / socket weld', 'ASME B16.11', 'To NPS 4 (most to 2)', 'Class → matching schedule', 'Small-bore high-pressure lines'] },
        { cells: ['Cast threaded', 'MSS SP-114 Class 150', '1/8"–4"', 'P–T table (300 psi ambient)', 'Water, air, utilities'] },
        { cells: ['Flanges', 'ASME B16.5', 'NPS ½–24', 'P–T table by class and group', 'Joints that must come apart'] },
        { cells: ['Sanitary clamp', '3-A 63, ASME BPE, DIN 32676', 'By tube OD', 'Clamp maker’s table', 'Food, dairy, beverage, pharma'] },
      ],
    },
    {
      type: 'prose',
      html: '<ul><li><strong>Butt-weld fittings</strong> become part of the pipe — full-penetration welds, a smooth bore, rated to the pipe of the same schedule. <a href="/blog/stainless-steel-butt-weld-fittings">Butt-weld fittings, schedules and A403 grades</a>.</li><li><strong>Threaded and socket-weld fittings</strong> serve small bore: cast Class 150 for moderate pressure, forged Class 3000 to B16.11 where pressure or vibration demand it. <a href="/blog/stainless-threaded-pipe-fittings-150-vs-3000">Cast 150# vs forged 3000#</a>.</li><li><strong>Weld outlets</strong> take a small branch off a large run without a tee. <a href="/blog/stainless-steel-weld-outlets">Weldolets, sockolets and threadolets</a>.</li><li><strong>Flanges</strong> make a joint that can be unbolted, rated by class and temperature. <a href="/blog/stainless-steel-flanges-asme-b16-5">B16.5 flanges and ratings</a>.</li><li><strong>Sanitary fittings</strong> join polished tube by clamp and gasket for hygienic plant. <a href="/blog/sanitary-tri-clamp-fittings-guide">Tri-clamp fittings</a>.</li></ul>',
    },

    { type: 'section_head', number: '/02', title: 'How each one is rated.', anchor: 'ratings' },
    {
      type: 'prose',
      html: '<p>The families do not share a rating method, and confusing them is the most common specification error:</p><ul><li>A <strong>butt-weld</strong> fitting has no rating of its own: ASME B16.9 rates it to straight pipe of the same material and wall.</li><li>A <strong>forged</strong> B16.11 fitting is rated to the pipe schedule its class matches — Sch 160 for Class 3000 threaded, Sch 80 for Class 3000 socket weld.</li><li>A <strong>cast Class 150</strong> fitting follows a pressure–temperature table: a maker table reproducing MSS SP-114 gives 300 psi up to 150 °F, falling to 150 psi at 350 °F.</li><li>A <strong>flange</strong> follows the B16.5 table for its class and material group: a 316 Class 150 flange is 19.0 bar at ambient, 13.7 bar at 200 °C.</li><li>A <strong>clamp joint</strong> is rated by the clamp maker by size and temperature: a standard 1–1½" clamp around 500 psi at 70 °F.</li></ul>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A class is not a pressure.',
      body: '"150#" on a cast fitting, on a flange and on a valve are three different ratings, and none of them means 150 psi at every temperature. Take the design pressure and temperature to the right table for each part.',
    },

    { type: 'section_head', number: '/03', title: 'Sizes: pipe or tube.', anchor: 'sizes' },
    {
      type: 'prose',
      html: '<p>Pipe fittings are sized by <strong>nominal pipe size (NPS)</strong> and wall schedule, to ASME B36.19M for stainless: every schedule of 2" pipe is 2.375" OD, and the schedule sets the wall — 0.109" for 10S, 0.154" for 40S. Sanitary fittings are sized by the <strong>actual tube OD</strong>: 2" sanitary tube is 2.000" OD. Instrument and hydraulic tube is also sized by OD. Mixing the two systems is a classic error; a "2-inch" sanitary ferrule will not go on 2-inch pipe.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Grade.', anchor: 'grade' },
    {
      type: 'prose',
      html: '<p>Almost every fitting is offered in 304 and 316. 316 adds 2–3% molybdenum and resists pitting and crevice corrosion in chlorides; 304 suits fresh water, food and indoor service. Specify an L grade (0.03% carbon max) for anything welded so the heat-affected zone does not sensitise. Both 304L and 316L can stress-corrosion crack in chlorides above about 60 °C. Full detail: <a href="/blog/304-vs-316-stainless-steel-fittings">304 vs 316</a>.</p>',
    },

    { type: 'section_head', number: '/05', title: 'What an order must say.', anchor: 'order' },
    {
      type: 'comparison_table',
      caption: 'The six lines of a stainless fitting specification',
      columns: ['Item', 'Example'],
      rows: [
        { cells: ['Family and standard', 'Butt-weld to ASME B16.9 / ASTM A403'] },
        { cells: ['Size', '2" NPS (or 2" OD tube for sanitary)'] },
        { cells: ['Schedule or class', 'Sch 40S; or Class 3000; or Class 150 flange'], highlight: true },
        { cells: ['Grade', '316L (dual 316/316L)'] },
        { cells: ['End or face', 'Bevelled; NPT female; RF 125–250 AARH; clamp'] },
        { cells: ['Documents', 'EN 10204 3.1 mill certificate, if the project requires'] },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What are the main types of stainless steel pipe fittings?', answer: 'Butt-weld (ASME B16.9), forged socket-weld and threaded (ASME B16.11), cast threaded (MSS SP-114), flanges (ASME B16.5), weld outlets (MSS SP-97) and sanitary clamp fittings.' },
        { question: 'Which stainless fitting is strongest?', answer: 'A butt-weld fitting in the same schedule as the pipe, which is rated the same as the pipe. Among threaded fittings, forged Class 3000 or 6000 is far stronger than cast Class 150.' },
        { question: 'Are stainless pipe fittings sized by OD or ID?', answer: 'Pipe fittings by nominal pipe size and schedule (OD fixed per size); sanitary and tube fittings by actual tube OD.' },
        { question: 'Should I use 304 or 316 fittings?', answer: '316 wherever chlorides are present — coastal air, brine, chlorinated water, salty product; 304 for fresh water and indoor service. Use L grades for welding.' },
        { question: 'What certificates come with stainless fittings?', answer: 'Usually a mill test certificate to EN 10204 3.1 tracing the material heat; ask for it when you order if the project requires one.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Across the families',
      skus: ['IH-PF-W490LES6', 'IH-PF-W4TS6', 'IH-PF-F90-J6', 'IH-PF-C90-B6', 'IH-PF-TWO-J6', 'IH-PF-WNRF-316', 'IH-PF-SF16CT', 'IH-PF-N6S8'],
    },
    { type: 'category_link', slug: 'stainless-steel-pipe-fittings', label: 'Stainless steel pipe fittings', blurb: 'Butt-weld, threaded, socket-weld and sanitary fittings, flanges, outlets and nipples.' },
    { type: 'page_link', kind: 'industry', slug: 'oil-gas', label: 'Oil & gas', blurb: 'Process, utility and chemical-injection piping.' },
    {
      type: 'related_articles',
      slugs: ['stainless-steel-butt-weld-fittings', 'stainless-threaded-pipe-fittings-150-vs-3000', 'stainless-steel-flanges-asme-b16-5', 'sanitary-tri-clamp-fittings-guide', '304-vs-316-stainless-steel-fittings', 'stainless-steel-weld-outlets'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Summary of the detailed articles in this hub; each figure is sourced there.',
    },
    {
      type: 'cta_block',
      heading: 'Quoting a stainless package?',
      body: 'Send the line list or BOM — sizes, schedules or classes, grade and ends. We will quote fittings, flanges and outlets in one grade with mill certificates.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
