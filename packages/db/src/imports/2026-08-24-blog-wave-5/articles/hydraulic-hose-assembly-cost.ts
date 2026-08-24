import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-hose-assembly-cost',
  title: 'What actually drives the cost of a hose assembly',
  excerpt:
    'Two assemblies of the same length can differ several-fold in price, and the reason is almost never the rubber. Here is what moves the number, so a quote can be read rather than just accepted.',
  categorySlug: 'procurement-export',
  authorSlug: 'sunil-patel',
  seoTitle: 'Hydraulic hose assembly cost — what drives the price',
  seoDescription:
    'The factors that determine what a hydraulic hose assembly costs: construction, bore, fitting count and type, material, certification and quantity. Where to save and where not to.',
  focusKeyword: 'hydraulic hose price uae',
  publishedAt: '2026-08-24T15:18:42.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Construction is the biggest single lever. Spiral hose costs substantially more than braid because there is far more steel in it.',
        'Fittings are frequently more than half the cost of a short assembly.',
        'Stainless fittings cost multiples of carbon steel and are worth it only where the environment demands them.',
        'Certification and testing are real costs and are not the place to economise on lifting or access equipment.',
        'Quantity matters more than length — batching a build spreads the setup across the batch.',
      ],
    },
    {
      type: 'lead',
      html: 'A hose assembly is a manufactured item, not a length of something cut to size, and its cost is dominated by things that are invisible in the finished part. Understanding which ones lets you argue with a quote productively instead of just comparing totals.',
    },

    { type: 'section_head', number: '/01', title: 'What moves the number.', anchor: 'what-moves-it' },
    {
      type: 'comparison_table',
      caption: 'In rough order of impact',
      columns: ['Factor', 'Effect', 'Worth economising on?'],
      rows: [
        { cells: ['Construction — braid, compact or spiral', 'Large. Spiral carries far more steel', 'No — it is set by pressure at bore'], highlight: true },
        { cells: ['Bore', 'Large. Everything scales with it', 'No — set by the circuit'] },
        { cells: ['Number and type of fittings', 'Large on short assemblies', 'Sometimes — an elbow may replace two fittings'] },
        { cells: ['Fitting material', 'Stainless is a multiple of carbon steel', 'Only where the environment allows it'] },
        { cells: ['Length', 'Modest — hose is the cheap part', 'Rarely worth it'] },
        { cells: ['Certification and testing', 'Modest', 'Not on lifting or access equipment'], highlight: true },
        { cells: ['Quantity', 'Batching spreads setup', 'Yes — the honest saving'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The row people find surprising is length. <strong>On a short assembly the hose itself can be a minor component</strong> — two fittings, two ferrules, a crimp setup and a test, with a few hundred millimetres of rubber between them. Asking for a shorter hose to save money usually saves very little.',
    },
    {
      type: 'direct_answer',
      question: 'Why do hydraulic hose assemblies vary so much in price?',
      answer:
        'Because the hose is often the cheapest part. Construction and bore set the base — spiral carries far more steel than braid — and on short assemblies the fittings, ferrules and the crimp and test operation can exceed the cost of the hose itself. Fitting material and certification move it further.',
    },

    { type: 'section_head', number: '/02', title: 'Where saving is real.', anchor: 'real-savings' },
    {
      type: 'decision_tree',
      heading: 'Four that work',
      intro: 'All of these reduce cost without reducing what the assembly can do.',
      branches: [
        { condition: 'You need several assemblies', outcome: 'Order them together.', detail: 'Setup, dies and test time spread across the batch. The most reliable saving available.' },
        { condition: 'The routing forces an expensive fitting arrangement', outcome: 'Ask whether an elbow replaces two parts.', detail: 'Turning the line at the fitting is often cheaper than adapting to it.' },
        { condition: 'You hold spares for a fleet', outcome: 'Consider bulk hose plus fittings rather than finished assemblies.', detail: 'Ages better on the shelf and covers more part numbers per unit of stock.' },
        { condition: 'The specification was inherited rather than checked', outcome: 'Have it reviewed.', detail: 'Over-specification is a real cost too. Spiral where braid suffices is money spent on steel you do not need.' },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Where saving is not real.',
      body: 'A grade below what the circuit needs, a fitting that seals but is not the specified type, an assembly with no test record on a lifting machine, or an unbranded fitting with no traceability. Each of those reduces a quote and moves the cost somewhere it is harder to see.',
    },

    { type: 'section_head', number: '/03', title: 'Why we do not publish prices.', anchor: 'no-prices' },
    {
      type: 'paragraph',
      html: 'There is no price list on this page and none anywhere else on this site, for a straightforward reason: <strong>a published figure goes stale and a stale figure is worse than none.</strong> Steel moves, freight moves, and an assembly price depends on a combination of construction, fittings and quantity that a list cannot represent honestly.',
    },
    {
      type: 'paragraph',
      html: 'What we can do is quote quickly against a specification, and explain which factor is driving the number if it is higher than you expected. That conversation is usually more useful than a list would have been.',
    },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Braid, compact and spiral constructions.' },
    { type: 'category_link', slug: 'crimp-ferrules', label: 'Crimp ferrules', blurb: 'Matched to construction, skive and no-skive.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is a longer hose much more expensive?', answer: 'Usually not, on a short assembly — the fittings and the build dominate. On long runs at large bore the hose does become the main cost, and then length matters.' },
        { question: 'Can I supply my own fittings?', answer: 'Ask us first. The crimp specification is per hose-and-ferrule combination, so we need to be able to state the correct crimp diameter for what is being assembled. Where we can, we will.' },
        { question: 'Why is a stainless assembly so much more?', answer: 'The material, and the machining. It is the right answer in coastal and offshore duty where carbon steel seizes, and over-specified in a dry workshop.' },
        { question: 'Do you discount for volume?', answer: 'Batching genuinely reduces the cost of a build, so tell us the quantity up front rather than ordering singly and asking afterwards.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'No prices are published on this page. Cost drivers described from our own build practice.',
    },
    { type: 'cta_block', heading: 'Quote higher than you expected?', body: 'Ask us which factor is driving it. Usually it is construction or fitting material, and sometimes the specification is worth revisiting.', quoteLabel: 'Request a quote' },
  ],
}

export default ARTICLE
