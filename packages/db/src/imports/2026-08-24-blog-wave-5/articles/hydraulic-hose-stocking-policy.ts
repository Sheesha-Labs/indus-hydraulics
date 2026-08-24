import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-hose-stocking-policy',
  title: 'Which hoses to hold on the shelf, and which not to',
  excerpt:
    'Stocking everything is expensive and stocking nothing is worse. The useful question is not what fails most often — it is what stops the most valuable thing for the longest.',
  categorySlug: 'procurement-export',
  authorSlug: 'sunil-patel',
  seoTitle: 'Hydraulic hose stock list — what a workshop should hold',
  seoDescription:
    'How to decide which hydraulic hose assemblies and fittings to hold as spares: downtime cost, lead time, commonality, and why bulk hose ages better than finished assemblies.',
  focusKeyword: 'hydraulic hose stock list',
  publishedAt: '2026-08-28T10:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Stock against downtime cost, not against failure frequency. The cheap hose that stops an expensive machine is the one to hold.',
        'Bulk hose plus fittings covers many more part numbers per unit of stock than finished assemblies.',
        'Finished assemblies are for the positions where minutes matter and nobody has time to crimp.',
        'Everything on the shelf is ageing. Date-mark it and rotate, or the stock becomes a liability.',
        'Commonality across a fleet is worth engineering deliberately — it multiplies the value of every item held.',
      ],
    },
    {
      type: 'lead',
      html: 'Most stocking decisions get made by accident: somebody was caught out once, so that part is now held forever, and nothing is ever reviewed. It is worth doing deliberately, because the answer is usually to hold less of more useful things.',
    },

    { type: 'section_head', number: '/01', title: 'Rank by consequence, not frequency.', anchor: 'consequence' },
    {
      type: 'paragraph',
      html: 'The instinct is to stock what fails most. The better question is <strong>what does this failure stop, and for how long.</strong> A hose that fails twice a year on a machine that can be worked around is a poor stocking candidate. One that fails every two years on the only crane on site is an excellent one.',
    },
    {
      type: 'comparison_table',
      caption: 'A rough ranking',
      columns: ['Hold as a finished assembly', 'Hold as bulk + fittings', 'Do not hold'],
      rows: [
        { cells: ['Single-point-of-failure machines', 'Common bores and grades across the fleet', 'Long-lead specials used once'] },
        { cells: ['Positions needing awkward access', 'Standard end types you fit repeatedly', 'Assemblies for machines being retired'] },
        { cells: ['High-cycle circuits — packer, spreader, lifter', 'Anything you can crimp in an hour', 'Grades used on one machine only'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'What hydraulic hose should a workshop keep in stock?',
      answer:
        'Finished assemblies for the positions where downtime is most expensive or access is worst, and bulk hose plus fittings for everything else. Bulk covers far more part numbers per unit of stock, ages better on the shelf, and can be crimped to any length — so it is the better default unless minutes matter.',
    },

    { type: 'section_head', number: '/02', title: 'Bulk hose is the efficient form.', anchor: 'bulk' },
    {
      type: 'paragraph',
      html: 'A reel of hose and a box of fittings covers every length and every combination those fittings allow. A finished assembly covers exactly one. <strong>For the same money on the shelf, bulk covers a far wider range of failures</strong> — at the cost of needing someone with a crimper when a machine stops.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Bulk also ages better.',
      body: 'Hose on a reel sits under gentler strain than an assembly coiled to fit a shelf, and it has no fittings to corrode. Where you are holding cover against a long lead time rather than against an immediate stop, bulk is the more durable way to hold it.',
    },

    { type: 'section_head', number: '/03', title: 'Commonality is worth engineering.', anchor: 'commonality' },
    {
      type: 'paragraph',
      html: 'Every distinct grade, bore and end type in a fleet multiplies the stock needed to cover it. Some of that variety is real — different machines have different circuits. A surprising amount is accidental, inherited from whatever the last supplier had in the van.',
    },
    {
      type: 'paragraph',
      html: 'Standardising end types across a yard, or settling on one coupler standard for attachments, reduces the stock needed without changing what any machine can do. <strong>It is one of the few procurement decisions that reduces both cost and risk at the same time.</strong>',
    },

    { type: 'section_head', number: '/04', title: 'Stock ages.', anchor: 'stock-ages' },
    {
      type: 'callout',
      tone: 'warning',
      title: 'An undated shelf is not a stock policy.',
      body: 'Rubber ages whether or not it is fitted, and a hot UAE store accelerates it. Assemblies held without a date cannot be rotated, so the oldest one sits at the back and gets fitted last — the exact opposite of what should happen. Date-mark at build or receipt, store cool, dark and loosely coiled, and fit oldest first.',
    },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Bulk by the metre, or assemblies built and dated.' },
    { type: 'category_link', slug: 'hydraulic-fittings', label: 'Hose fittings by thread type', blurb: 'The other half of a bulk stocking policy.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How much should we hold?', answer: 'Enough to cover the failures that stop something expensive, for as long as it takes to get a replacement. That is a different number for a fleet in Dubai than for a site four hours away, which is the real input.' },
        { question: 'Can you hold stock for us instead?', answer: 'Yes, and for many customers that is the better arrangement — we date-mark and rotate it, and you carry the cover without carrying the shelf.' },
        { question: 'Is it worth stocking fittings without hose?', answer: 'Very much. Fittings do not age the way rubber does, they cover many combinations, and they are usually the longer-lead half of an assembly.' },
        { question: 'How do we review a stock list that grew by accident?', answer: 'Start from failures over the last year, rank by what each one stopped, and check the list against that. Most lists have items nobody can explain and gaps nobody noticed.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Guidance from our own practice supplying UAE fleets. No stock quantities are published — the right number depends on your downtime cost and distance from us.',
    },
    { type: 'cta_block', heading: 'Reviewing a stock list?', body: 'Send us your fleet and your failure history and we will suggest what to hold, what to drop, and what we should hold for you instead.', quoteLabel: 'Ask about stocking' },
  ],
}

export default ARTICLE
