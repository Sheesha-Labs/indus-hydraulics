import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'braid-vs-spiral-hydraulic-hose',
  title: 'Braid or spiral: the choice bore makes for you',
  excerpt:
    'Braided hose loses four fifths of its rating between quarter-inch and two-inch. Spiral hose holds flat. Past a certain bore the decision has already been made.',
  categorySlug: 'specification-standards',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Braided vs spiral hydraulic hose — when to use which',
  seoDescription:
    'Why braided hydraulic hose loses pressure as bore rises while spiral hose holds flat, and the bore at which the choice stops being a choice.',
  focusKeyword: 'spiral vs braided hydraulic hose',
  publishedAt: '2026-08-18T11:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Braid and spiral are not two grades of the same thing. They carry pressure differently and behave differently as bore rises.',
        '2SN braid runs 400 bar at −04 and 80 bar at −32. R13 spiral holds 350 bar at every size it is made in.',
        'Below about −12 braid is usually the right answer: cheaper, more flexible, tighter bend radius.',
        'At −16 and above with real pressure, spiral is not a preference — it is the only construction that reaches.',
        'Spiral pays for that with stiffness. A 4SH at −32 needs a 700 mm bend radius; plan the route before ordering the hose.',
      ],
    },
    {
      type: 'lead',
      html: 'People treat spiral hose as the premium option and braid as the standard one, and then choose on budget. The data says something more useful: the two constructions diverge as bore rises, and past a certain size the choice has already been made for you.',
    },

    { type: 'section_head', number: '/01', title: 'What the reinforcement is doing.', anchor: 'reinforcement' },
    {
      type: 'paragraph',
      html: 'Braided reinforcement is woven — wires cross over and under each other in interlacing layers. Spiralled reinforcement is laid in helical layers running in alternating directions, with no interlacing. Woven wire has to accommodate the crossings, and as diameter grows the geometry works against it. Spiral layers simply carry hoop load along their length.',
    },
    {
      type: 'paragraph',
      html: 'That is why the two behave so differently with scale. Look at what happens across the range on the constructions we stock:',
    },
    {
      type: 'comparison_table',
      caption: 'Working pressure across the range (bar)',
      columns: ['Construction', 'Smallest bore', 'Largest bore', 'Loss'],
      rows: [
        { cells: ['1SN — one wire braid', '225 (−04)', '40 (−32)', '82%'] },
        { cells: ['2SN — two wire braid', '400 (−04)', '80 (−32)', '80%'] },
        { cells: ['4SP — four spiral', '450 (−06)', '210 (−32)', '53%'] },
        { cells: ['4SH — four spiral heavy', '420 (−12)', '250 (−32)', '40%'] },
        { cells: ['R13 — multi spiral', '350 (−12)', '350 (−32)', '0%'], highlight: true },
      ],
    },
    {
      type: 'direct_answer',
      question: 'At what size should you switch from braided to spiral hose?',
      answer:
        'It depends on pressure, but the crossover is usually around −12 to −16. Below that, two-wire braid still carries useful pressure and is cheaper and more flexible. At −20 and above, 2SN is down to 125 bar and falling, while 4SH is still at 350 — if the circuit needs more than about 150 bar at that bore, braid has run out.',
    },

    { type: 'section_head', number: '/02', title: 'What spiral costs you.', anchor: 'the-cost' },
    {
      type: 'paragraph',
      html: 'Stiffness, mostly. More reinforcement in more layers means a hose that resists bending, and the bend radius figures show it plainly — at −32, 2SN needs 630 mm and 4SH needs 700 mm. It also means more weight, a larger outside diameter for the same bore, and a higher price.',
    },
    {
      type: 'comparison_table',
      caption: 'Minimum bend radius (mm), where the constructions overlap',
      columns: ['Construction', '−12', '−16', '−20', '−24', '−32'],
      rows: [
        { cells: ['2SN braid', '240', '300', '420', '500', '630'] },
        { cells: ['4SP spiral', '300', '340', '420', '500', '630'] },
        { cells: ['4SH spiral', '280', '340', '460', '560', '700'], highlight: true },
        { cells: ['R13 spiral', '240', '300', '420', '500', '600'] },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Check the bend radius against the installation before you order.',
      body: 'A 700 mm minimum radius is a large arc in a machine bay. If the route cannot accommodate it the answer is usually an elbow fitting or a different route, not forcing the hose — bending below the minimum is a documented route to early failure.',
    },

    { type: 'section_head', number: '/03', title: 'Where compact fits.', anchor: 'compact' },
    {
      type: 'paragraph',
      html: 'There is a third option that gets overlooked. Compact constructions — 1SC and 2SC — are braided but built to a smaller outside diameter and a much tighter bend radius than standard braid at the same bore. At −12, 2SC bends to 120 mm where 2SN needs 240 mm, and it carries slightly <em>more</em> pressure at that size, not less.',
    },
    {
      type: 'paragraph',
      html: 'Where a machine has tight routing and moderate pressure — mobile equipment, confined bays, anything that flexes through a small arc — compact is frequently the correct answer and is not considered simply because it is less familiar than 2SN.',
    },
    { type: 'product_embed', heading: 'One from each construction', skus: ['IH-HOSE-R2-2SN', 'IH-HOSE-2SC', 'IH-HOSE-4SP', 'IH-HOSE-4SH'] },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is four-spiral always stronger than two-wire braid?', answer: 'At any bore they share, yes — substantially. But 4SP is not made below −06 and 4SH not below −12, so at small bores the comparison does not arise and braid is the sensible choice.' },
        { question: 'Why is R13 flat across its whole range?', answer: 'Because the reinforcement is scaled with the bore rather than the construction being held constant. It is designed to deliver one pressure class across sizes, which is exactly what large-bore high-pressure circuits need.' },
        { question: 'Can I use spiral hose in a tight-routing application?', answer: 'Only if the route accommodates its bend radius. Where it does not, look at compact braid first — it exists for this problem — and at elbow fittings to take the turn in the fitting rather than the hose.' },
        { question: 'Does spiral hose last longer?', answer: 'Not inherently. Service life is dominated by routing, abrasion and temperature rather than construction. A spiral hose in a bad route fails like anything else in a bad route.' },
      ],
    },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Braid, compact and spiral', blurb: 'The full range, in stock in Dubai.' },
    { type: 'as_of_stamp', verifiedOn: '2026-08-18', note: 'Figures from the Intertraco (Italia) S.p.A. catalogue for the constructions we stock. Confirm against the datasheet for the assembly supplied.' },
    { type: 'cta_block', heading: 'Not sure which construction the job needs?', body: 'Send the bore, the working pressure and the tightest bend in the route. Those three together decide it, and we will tell you which constructions actually satisfy all of them.', quoteLabel: 'Talk to an engineer' },
  ],
}

export default ARTICLE
