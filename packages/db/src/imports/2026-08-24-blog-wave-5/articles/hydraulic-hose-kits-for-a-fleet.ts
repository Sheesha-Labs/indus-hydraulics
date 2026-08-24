import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-hose-kits-for-a-fleet',
  title: 'Hose kits: turning a fleet’s failures into a planned list',
  excerpt:
    'A kit is not a box of spare hoses. It is a decision about which failures you are prepared to have unplanned — written down, priced, and put on a shelf before it is needed.',
  categorySlug: 'procurement-export',
  authorSlug: 'sunil-patel',
  seoTitle: 'Hydraulic hose kits for a machine fleet — what to include',
  seoDescription:
    'How to build hydraulic hose kits for a fleet: per-machine sets, high-cycle circuit sets, tagging and rotation, and how a kit differs from a shelf of spares.',
  focusKeyword: 'hydraulic hose kit',
  publishedAt: '2026-08-28T12:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A kit is a defined list for a defined machine or circuit, not an accumulation of leftovers.',
        'Sets beat singles on high-cycle circuits — assemblies fitted together reach the end together.',
        'Every item needs a date and a position label, or the kit becomes a shelf nobody trusts.',
        'The kit is worth reviewing against actual failures once a year; most lists have gaps and ballast.',
        'Kits work best where downtime is expensive, access is awkward, or the site is far from a workshop.',
      ],
    },
    {
      type: 'lead',
      html: 'Most yards already hold hose spares. Very few can say what they hold, for which machine, or how old it is — which is the difference between a kit and a shelf, and the difference decides whether any of it gets used when something stops.',
    },

    { type: 'section_head', number: '/01', title: 'What makes a kit a kit.', anchor: 'what-makes-a-kit' },
    {
      type: 'comparison_table',
      caption: 'The difference in practice',
      columns: ['Property', 'A shelf of spares', 'A kit'],
      rows: [
        { cells: ['Contents', 'Whatever was left over', 'A defined list'], highlight: true },
        { cells: ['Labelling', 'Sometimes a size', 'Machine and position'] },
        { cells: ['Dating', 'None', 'Build date on every assembly'], highlight: true },
        { cells: ['Rotation', 'Oldest at the back, fitted last', 'Oldest fitted first'] },
        { cells: ['Review', 'Never', 'Against failures, annually'] },
        { cells: ['Use when a machine stops', 'Someone searches', 'Someone collects the kit'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'What should a hydraulic hose kit contain?',
      answer:
        'The assemblies for one machine or one high-cycle circuit, defined as a list, each labelled with its position and its build date. Sets rather than singles on circuits like packers, spreaders and lifters, because assemblies fitted together accumulate cycles together and reach the end of their life together.',
    },

    { type: 'section_head', number: '/02', title: 'Two kinds worth building.', anchor: 'two-kinds' },
    {
      type: 'paragraph',
      html: '<strong>Per-machine kits</strong> cover the assemblies most likely to stop a specific machine. They suit single-point-of-failure equipment — the only crane, the only pump — where the question is how fast that particular machine can be back.',
    },
    {
      type: 'paragraph',
      html: '<strong>Circuit sets</strong> cover one high-cycle circuit across a fleet: every packer hose, every spreader set, every bin lifter. They suit fleets of similar machines, and they convert a stream of individual interruptions into one planned replacement window.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Circuit sets are the better value where they apply.',
      body: 'Assemblies on a high-cycle circuit are fitted together, work together and age together, so replacing them one at a time as each fails means the same machine comes out of service repeatedly over a few months. Replacing the set in one window costs less in total downtime even though it costs more in hose.',
    },

    { type: 'section_head', number: '/03', title: 'The parts people forget.', anchor: 'forgotten' },
    {
      type: 'comparison_table',
      caption: 'Worth including',
      columns: ['Item', 'Why'],
      rows: [
        { cells: ['Bonded washers and O-rings for the ends used', 'A perfect assembly still leaks on a reused seal'], highlight: true },
        { cells: ['Dust caps for couplers', 'Especially on attachment circuits'] },
        { cells: ['Clamps or sleeves for the positions that need them', 'The kit should let the routing be restored properly'] },
        { cells: ['The position list itself, laminated', 'So the kit is usable by whoever is on shift'], highlight: true },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A kit ages on the shelf.',
      body: 'Everything in it is rubber, and rubber ages whether or not it is fitted — faster in a hot store. Date every item, store the kit cool, dark and loosely coiled, and rotate through it rather than letting it sit until needed. An undated kit is a shelf with better packaging.',
    },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Assemblies built, tested and date-tagged.' },
    { type: 'category_link', slug: 'quick-couplers', label: 'Quick couplers', blurb: 'Attachment circuits and their dust caps.' },
    { type: 'category_link', slug: 'seals-accessories', label: 'Seals and accessories', blurb: 'The parts a kit is usually missing.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How do we work out what goes in the kit?', answer: 'From your own failure history if you have one, and from the machine’s high-cycle and hard-to-reach positions if you do not. A year of records makes the list obvious; without them it is an educated first version to be revised.' },
        { question: 'Will you build and hold kits for us?', answer: 'Yes, including date-marking and rotation. For fleets working far from Dubai that is usually the arrangement that makes the difference.' },
        { question: 'Is it worth kitting a machine that rarely fails?', answer: 'Only if a failure would be expensive or slow to fix. Rarity is not the test — consequence is.' },
        { question: 'What happens to kit items that age out?', answer: 'Fit them on scheduled work rather than scrapping them. That is what rotation is for, and it is why dating every item matters.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Guidance from our own practice supplying UAE fleets. Kit contents depend on your machines and your failure history.',
    },
    { type: 'cta_block', heading: 'Building kits for a fleet?', body: 'Send us the machines and any failure history. We will propose the lists, build them, date-tag them, and hold them if that suits you better than a shelf.', quoteLabel: 'Ask about fleet kits' },
  ],
}

export default ARTICLE
