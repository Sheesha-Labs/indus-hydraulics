import type { BlogArticleSeed } from '../shared'

/**
 * The flagship spec article. Every figure comes from the Intertraco catalogue
 * via HOSE_SIZE_TABLES, filtered to the bore range each product actually
 * claims. Attribution is stated in the article body and in the as-of stamp.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-hose-pressure-by-size',
  title: 'Hydraulic hose pressure by size: why one number per grade misleads you',
  excerpt:
    'A grade is not a pressure. 2SN runs 400 bar at −04 and 80 bar at −32 — the same hose, an eightfold difference. Here is the full picture, size by size.',
  categorySlug: 'specification-standards',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Hydraulic hose pressure rating by size — 1SN, 2SN, 4SP, 4SH',
  seoDescription:
    'Working pressure by bore for 1SN, 2SN, 1SC, 2SC, 4SP, 4SH, R13 and R15. Why quoting one figure per grade misleads, and how to compare grades honestly.',
  focusKeyword: 'hydraulic hose pressure rating chart',
  publishedAt: '2026-08-18T11:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A hose grade does not have a working pressure. It has a working pressure per bore, and the spread is large — 2SN runs 400 bar at −04 and 80 bar at −32.',
        'Catalogue headline figures are almost always the value at the smallest bore. Comparing two grades on their headline numbers compares them at different sizes.',
        'Braided hose loses pressure steeply as bore rises. Spiral hose barely does — R13 holds 350 bar across its whole range.',
        'That single fact is why large-bore high-pressure work is spiral and small-bore work usually is not.',
        'Compare at the bore you are actually specifying. Anything else is a category error.',
      ],
    },
    {
      type: 'lead',
      html: 'Ask what pressure a two-wire hose is good for and you will get a number. The number is real, and it is almost certainly the figure for the smallest size that hose is made in — which is not the size you are fitting.',
    },

    { type: 'section_head', number: '/01', title: 'The trap, in one comparison.', anchor: 'the-trap' },
    {
      type: 'paragraph',
      html: 'Take two grades from our own catalogue. <strong>2SC is listed at 400 bar. 4SH is listed at 420 bar.</strong> Close enough that you might reasonably treat them as comparable, and might well pick the cheaper one. Now look at where those numbers come from: 2SC’s 400 bar is at −04, a quarter-inch bore. 4SH’s 420 bar is at −12, three-quarters of an inch. They are not comparable figures at all.',
    },
    {
      type: 'comparison_table',
      caption: 'The same two grades, at the one bore they share (−12)',
      columns: ['Grade', 'Headline figure', 'At −12', 'Bore range'],
      rows: [
        { cells: ['2SC', '400 bar (at −04)', '250 bar', '−04 to −16'] },
        { cells: ['4SH', '420 bar (at −12)', '420 bar', '−12 to −32'], highlight: true },
      ],
    },
    {
      type: 'paragraph',
      html: 'At the bore they share, 4SH is <strong>68% stronger</strong>, not 5% stronger. The headline comparison was not slightly wrong; it was measuring two different things.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Every catalogue does this, including ours until recently.',
      body: 'It is not deception, it is compression — a product listing has one field for pressure and a grade has a dozen values. The fix is not to distrust catalogues but to check which bore a figure belongs to before comparing anything.',
    },

    { type: 'section_head', number: '/02', title: 'Working pressure, size by size.', anchor: 'the-tables' },
    {
      type: 'paragraph',
      html: 'Figures below are from the Intertraco catalogue for the constructions we stock, filtered to the bore range each product is offered in. Working pressure in bar; every grade here is built to a 4:1 design factor, so minimum burst is four times the figure shown.',
    },
    {
      type: 'comparison_table',
      caption: 'Working pressure (bar) — small and mid bore',
      columns: ['Grade', '−04', '−06', '−08', '−10', '−12', '−16'],
      rows: [
        { cells: ['1SN / R1AT', '225', '180', '160', '130', '105', '88'] },
        { cells: ['2SN / R2AT', '400', '330', '275', '250', '215', '165'] },
        { cells: ['1SC compact', '225', '210', '210', '130', '105', '—'] },
        { cells: ['2SC compact', '400', '350', '280', '250', '250', '165'] },
        { cells: ['4SP spiral', '—', '450', '420', '350', '350', '320'], highlight: true },
        { cells: ['4SH spiral', '—', '—', '—', '—', '420', '380'] },
        { cells: ['R13 spiral', '—', '—', '—', '—', '350', '350'] },
        { cells: ['R15 spiral', '—', '—', '—', '—', '420', '420'] },
      ],
    },
    {
      type: 'comparison_table',
      caption: 'Working pressure (bar) — large bore',
      columns: ['Grade', '−12', '−16', '−20', '−24', '−32'],
      rows: [
        { cells: ['1SN / R1AT', '105', '88', '63', '50', '40'] },
        { cells: ['2SN / R2AT', '215', '165', '125', '90', '80'] },
        { cells: ['4SP spiral', '350', '320', '210', '210', '210'] },
        { cells: ['4SH spiral', '420', '380', '350', '300', '250'], highlight: true },
        { cells: ['R13 spiral', '350', '350', '350', '350', '350'] },
        { cells: ['R15 spiral', '420', '420', '420', '420', '—'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'What pressure is a 2-inch two-wire hydraulic hose rated for?',
      answer:
        'On the 2SN construction we stock, 80 bar at −32 — against 400 bar for the same grade at −04. If you need meaningful pressure at 2 inch, two-wire braid is not the answer: 4SH is 250 bar and R13 is 350 bar at that bore.',
    },

    { type: 'section_head', number: '/03', title: 'What the columns show.', anchor: 'what-it-shows' },
    {
      type: 'paragraph',
      html: 'Read the tables across rather than down and the structural difference appears. <strong>Braided hose falls away steeply</strong> — 2SN loses four fifths of its rating between −04 and −32. <strong>Spiral hose barely moves</strong>: R13 holds 350 bar at every size it is made in, and R15 holds 420. That is not a manufacturing quirk, it is the geometry of how spiralled wire carries hoop stress compared with braid.',
    },
    {
      type: 'paragraph',
      html: 'The practical consequence is the whole selection rule in one line: <strong>at small bore, braid is usually enough; at large bore with real pressure, only spiral will do.</strong> It also explains why a −32 four-spiral hose costs what it does, and why substituting braid to save money at that size is not a trade-off but a mistake.',
    },
    { type: 'product_embed', heading: 'The grades in these tables', skus: ['IH-HOSE-R2-2SN', 'IH-HOSE-2SC', 'IH-HOSE-4SP', 'IH-HOSE-4SH'] },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Why does working pressure fall as the hose gets bigger?', answer: 'Hoop stress in a pressurised cylinder rises with diameter for a given wall, so a larger bore needs proportionally more reinforcement to hold the same pressure. Braid adds that slowly; spiral construction adds it far more effectively, which is why spiral holds a near-flat rating across its range.' },
        { question: 'Is the 4:1 factor the same on all of these?', answer: 'On every grade in these tables, yes — minimum burst is four times working pressure at each size. That is not universal across all hose: oilfield constructions to API 7K run 2.5:1 and API 16C choke and kill runs 1.5:1.' },
        { question: 'Can I use these figures for another manufacturer’s hose?', answer: 'Treat them as indicative, not authoritative. These are the published figures for the constructions we stock. Another maker’s 2SN will be close but not necessarily identical, and the datasheet for the hose actually being fitted is what governs.' },
        { question: 'What about temperature?', answer: 'Every figure here assumes the hose is within its rated temperature range. Sustained heat reduces what an assembly will tolerate, which matters in Gulf ambient conditions and is a separate question from bore.' },
      ],
    },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Braid, compact and spiral constructions, in stock in Dubai.' },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-18',
      note: 'Figures from the Intertraco (Italia) S.p.A. hydraulic hose catalogue for the constructions we stock, filtered to the bore range each is offered in. Confirm against the datasheet for the assembly supplied.',
    },
    { type: 'cta_block', heading: 'Specifying at a particular bore?', body: 'Tell us the bore, the working pressure and the bend radius the installation needs. We will tell you which construction actually meets all three.', quoteLabel: 'Specify a hose' },
  ],
}

export default ARTICLE
