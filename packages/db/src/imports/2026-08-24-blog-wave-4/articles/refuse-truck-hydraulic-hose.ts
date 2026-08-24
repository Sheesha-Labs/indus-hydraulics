import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'refuse-truck-hydraulic-hose',
  title: 'Refuse compactors: the duty cycle nobody plans for',
  excerpt:
    'A collection vehicle compacts a few hundred times a shift, in traffic, all year. Its hydraulics work harder than most construction plant and get maintained like a truck rather than like a machine.',
  categorySlug: 'machine-down',
  authorSlug: 'mehul-rana',
  seoTitle: 'Refuse truck hydraulic hose — compactor and lifter circuits',
  seoDescription:
    'Hydraulic hose on refuse collection vehicles: packer and ejector circuits, bin lifter duty, tailgate safety, and why the cycle count is higher than it looks.',
  focusKeyword: 'refuse truck hydraulic hose',
  publishedAt: '2026-08-27T14:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Packer and bin-lifter circuits cycle hundreds of times a shift, every shift, year round.',
        'A raised tailgate held on hydraulics is a crush hazard. Props are not optional.',
        'Ejector circuits are high force at low speed and are the ones that reveal a marginal specification.',
        'These vehicles are maintained on a truck schedule, which is not built around hydraulic cycle counts.',
        'Hose failures happen in traffic, in public, which changes what an unplanned failure costs.',
      ],
    },
    {
      type: 'lead',
      html: 'A refuse collection vehicle looks like a truck and is serviced like one, but the body on the back is a piece of hydraulic plant working a duty cycle that few excavators would match. The mismatch between how it is worked and how it is maintained is where the hose failures come from.',
    },

    { type: 'section_head', number: '/01', title: 'Which circuit.', anchor: 'which-circuit' },
    {
      type: 'comparison_table',
      caption: 'Symptom to circuit',
      columns: ['What stopped', 'Circuit', 'Notes'],
      rows: [
        { cells: ['Packer blade will not cycle', 'Packer / compaction', 'Highest cycle count on the vehicle'], highlight: true },
        { cells: ['Bin lifter will not raise or grip', 'Lifter', 'Second highest, and the most exposed'] },
        { cells: ['Body will not eject at the tip', 'Ejector', 'High force, low speed — reveals marginal specification'] },
        { cells: ['Tailgate will not raise or lower', 'Tailgate', 'Crush hazard — prop before working under it'], highlight: true },
        { cells: ['Nothing works, engine running', 'PTO or pump supply', 'Check the PTO is engaged before anything else'] },
      ],
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Never work under a tailgate held up by hydraulics.',
      body: 'A raised tailgate is a heavy structure held by a cylinder and whatever holding arrangement the body maker fitted. A hose or valve failure while somebody is underneath is fatal. Use the mechanical props the body was supplied with, every time, including for a two-minute look.',
    },

    { type: 'section_head', number: '/02', title: 'The cycle count is the whole story.', anchor: 'cycles' },
    {
      type: 'paragraph',
      html: 'A packer cycling every collection, a lifter cycling for every bin, hundreds of times a shift, five or six days a week, all year. <strong>That is an impulse duty, and impulse duty is what consumes hose assemblies</strong> — not peak pressure, which the specification handles comfortably.',
    },
    {
      type: 'paragraph',
      html: 'The consequence is that calendar-based intervals borrowed from the truck side of the vehicle do not reflect what the body has done. A three-year-old body on a busy urban round has been worked considerably harder than a five-year-old one on a rural route, and treating them the same is how failures arrive unplanned.',
    },
    {
      type: 'direct_answer',
      question: 'Why do refuse truck hydraulic hoses fail so often?',
      answer:
        'Cycle count. Packer and bin-lifter circuits cycle hundreds of times per shift, year round, which is impulse duty — the thing that actually consumes hose assemblies. The vehicles are usually maintained on a truck schedule built around mileage and engine hours, neither of which reflects what the body has done.',
    },

    { type: 'section_head', number: '/03', title: 'Failing in public.', anchor: 'in-public' },
    {
      type: 'paragraph',
      html: 'A hose failure on this vehicle happens on a residential street with traffic around it and oil on the road. That makes the cost of an unplanned failure quite different from the same failure in a yard — recovery, cleanup, a blocked road and a missed round.',
    },
    {
      type: 'paragraph',
      html: '<strong>Which is the argument for planned replacement on these circuits specifically.</strong> The packer and lifter hoses are known, countable and replaceable in a workshop in an hour. Replacing them on a schedule is cheap next to the alternative.',
    },
    { type: 'product_embed', heading: 'Grades used on body circuits', skus: ['IH-HOSE-R2-2SN', 'IH-HOSE-4SP'] },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Assemblies built, tested and tagged.' },
    { type: 'category_link', slug: 'hose-clamps-sleeves-ferrules', label: 'Clamps, sleeves and guards', blurb: 'For lifter and tailgate runs.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Which refuse vehicle hoses should we hold as spares?', answer: 'The packer and lifter sets, because they are the highest-cycle and the most likely to stop a round. Hold them tagged and dated so they can be rotated rather than aged out on a shelf.' },
        { question: 'Should we replace body hoses on a schedule?', answer: 'On these circuits it usually pays. They are countable, accessible and predictable, and the alternative is a failure on a street rather than in a workshop.' },
        { question: 'The lifter is slow but working. Hose?', answer: 'Slow with no leak usually points past the hose to a valve, a cylinder or flow. A collapsed suction line is the one hose fault that presents this way.' },
        { question: 'Do you fit at a depot overnight?', answer: 'Yes. For a fleet that has to be out at six, that is normally the only window that works, and we would rather use it than the roadside.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Diagnostic guidance from our own practice. Body circuit pressures and prop arrangements are specific to the body manufacturer — follow their documentation.',
    },
    { type: 'cta_block', heading: 'Fleet of collection vehicles?', body: 'Packer and lifter sets, built, tagged and held as spares, replaced on a schedule at your depot. Cheaper than a failure on a round.', quoteLabel: 'Ask about fleet supply' },
  ],
}

export default ARTICLE
