import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'compact-hose-1sc-2sc',
  title: 'Compact hose: half the bend radius, and nobody orders it',
  excerpt:
    'EN 857 1SC and 2SC bend to half the radius of standard braid at the same bore, in a smaller outside diameter, at the same or higher pressure. They remain the least-specified hose we stock.',
  categorySlug: 'specification-standards',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'EN 857 1SC and 2SC compact hydraulic hose explained',
  seoDescription:
    'Compact hydraulic hose to EN 857 1SC and 2SC: half the bend radius of EN 853 braid at the same bore, smaller OD, equal or higher pressure. When to specify it.',
  focusKeyword: 'en 857 2sc compact hose',
  publishedAt: '2026-08-18T12:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Compact hose to EN 857 bends to roughly half the radius of EN 853 standard braid at the same bore.',
        'At −12, 2SC needs 120 mm against 2SN’s 240 mm — and carries 250 bar against 215.',
        'It is also smaller on the outside, which matters when a bundle has to pass through a fixed aperture.',
        'The trade is range: 1SC and 2SC stop at −12 and −16 respectively, where 2SN runs to −32.',
        'For mobile equipment and confined routing at moderate pressure, it is frequently the right answer and rarely the one requested.',
      ],
    },
    {
      type: 'lead',
      html: 'Most hose gets ordered by habit. Someone asks for two-wire, gets 2SN, and it works — so the next one is 2SN too. Compact hose exists for the case where the route is tight rather than the pressure being high, and that case is far more common than the order book suggests.',
    },

    { type: 'section_head', number: '/01', title: 'The comparison that matters.', anchor: 'the-comparison' },
    {
      type: 'comparison_table',
      caption: '2SC compact against 2SN standard braid, same bore',
      columns: ['Bore', '2SN pressure', '2SC pressure', '2SN bend', '2SC bend', '2SC OD saving'],
      rows: [
        { cells: ['−04', '400 bar', '400 bar', '100 mm', '50 mm', '1.2 mm'] },
        { cells: ['−06', '330 bar', '350 bar', '125 mm', '65 mm', '1.5 mm'] },
        { cells: ['−08', '275 bar', '280 bar', '180 mm', '90 mm', '1.4 mm'] },
        { cells: ['−10', '250 bar', '250 bar', '200 mm', '100 mm', '0.5 mm'] },
        { cells: ['−12', '215 bar', '250 bar', '240 mm', '120 mm', '0.7 mm'], highlight: true },
        { cells: ['−16', '165 bar', '165 bar', '300 mm', '150 mm', '0.6 mm'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Read the two bend columns. <strong>Compact halves the minimum radius at every size</strong>, and at −12 it also carries 16% more pressure. There is no size in the overlap where standard braid is the better hose on either measure — the only thing 2SN has is reach beyond −16.',
    },
    {
      type: 'direct_answer',
      question: 'What is the difference between EN 853 2SN and EN 857 2SC?',
      answer:
        'Both are two-wire braid. 2SC is built to a compact specification: roughly half the minimum bend radius at the same bore, a smaller outside diameter, and equal or slightly higher working pressure up to −12. The trade is range — 2SC is made to −16 while 2SN runs to −32.',
    },

    { type: 'section_head', number: '/02', title: 'Where it changes the job.', anchor: 'where-it-matters' },
    {
      type: 'decision_tree',
      heading: 'When compact is the better specification',
      branches: [
        { condition: 'The route has a tight turn and an elbow will not fit', outcome: 'Compact.', detail: 'Halving the bend radius often removes the need to redesign the route entirely.', sku: 'IH-HOSE-2SC' },
        { condition: 'Hoses run as a bundle through a fixed aperture', outcome: 'Compact.', detail: 'A smaller OD per hose compounds across a bundle — the saving is per hose, and there are usually several.' },
        { condition: 'Mobile equipment where the hose flexes through a small arc', outcome: 'Compact.', detail: 'Repeated flexing near the minimum radius is a failure mode; more margin means longer life.' },
        { condition: 'Bore above −16', outcome: 'Standard braid or spiral.', detail: 'Compact is not made above −16. Above that the question becomes braid against spiral.', sku: 'IH-HOSE-4SP' },
        { condition: 'Pressure above what braid delivers at that bore', outcome: 'Spiral.', detail: 'Compact is still braid. It does not change the pressure ceiling, only the geometry.', sku: 'IH-HOSE-4SH' },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'The single-wire case is starker.',
      body: '1SC bends to 90 mm at −08 where 1SN needs 180 mm — and carries 210 bar against 160. On low and moderate pressure circuits with awkward routing, single-wire compact is a genuinely underused option.',
    },

    { type: 'section_head', number: '/03', title: 'Why it is rarely asked for.', anchor: 'why-rarely' },
    {
      type: 'paragraph',
      html: 'Two reasons, both practical rather than technical. Standard braid is what most fitters learned on and what most machines were built with, so replacement defaults to like-for-like. And bend radius is not usually the number anyone checks — pressure and bore get specified, the hose gets fitted, and if it goes round the corner the job is done.',
    },
    {
      type: 'paragraph',
      html: 'The cost of that shows up later, as a hose that failed early near a fitting. If a run keeps failing in the same tight bend, compact is worth considering before re-routing the machine.',
    },
    { type: 'product_embed', heading: 'Compact constructions', skus: ['IH-HOSE-R1-1SC', 'IH-HOSE-2SC', 'IH-HOSE-R2-2SN'] },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Does compact hose use different fittings?', answer: 'It uses fittings and ferrules specified for that hose, as any construction does. The crimp specification belongs to the hose-and-fitting combination — do not assume a 2SN ferrule suits 2SC because both are two-wire.' },
        { question: 'Is compact hose more expensive?', answer: 'Usually somewhat, per metre. Against the cost of re-routing a machine or replacing an assembly that keeps failing in a tight bend, it is rarely the expensive option overall.' },
        { question: 'Can I use compact hose everywhere instead of standard?', answer: 'Up to −16, generally yes on the numbers. Above that it is not manufactured, so standard braid or spiral takes over.' },
        { question: 'Why is 2SC higher pressure than 2SN at −12?', answer: 'Different construction to a different standard — EN 857 rather than EN 853 — optimised for compactness rather than being a reduced version of standard braid. The pressure advantage at that size is a consequence of the design, not a rounding difference.' },
      ],
    },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Compact, standard braid and spiral, in stock in Dubai.' },
    { type: 'as_of_stamp', verifiedOn: '2026-08-18', note: 'Figures from the Intertraco (Italia) S.p.A. catalogue for the constructions we stock. Confirm against the datasheet for the assembly supplied.' },
    { type: 'cta_block', heading: 'Fighting a tight route?', body: 'Send the bore, the pressure and the tightest radius available. If compact solves it we will say so, and if it does not we will tell you what does.', quoteLabel: 'Talk to an engineer' },
  ],
}

export default ARTICLE
