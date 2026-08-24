import type { BlogBlocksInput } from '@indus/domain'

/**
 * Republishes `procurement-export`.
 *
 * Wave 2 unpublished it: it was live, in the sitemap, and had zero articles,
 * so anyone landing on it read "No articles in this topic yet." The commitment
 * at the time was that it comes back when it has content. It has eight.
 *
 * The hub carries a body from republication rather than shipping empty, and
 * its head term was checked against the focus keywords on all 65 published
 * articles, the ten existing hubs, and both /tools pages.
 */
export const PROCUREMENT_CATEGORY = {
  slug: 'procurement-export',
  isPublished: true,
  seoTitle: 'Buying hydraulic hose in the UAE — quotes, stock and lead times',
  seoDescription:
    'How hydraulic hose is actually bought: what to send for a quote, what drives the cost, what to hold as stock, what sets lead times, and how to cross-reference a part number.',
  focusKeyword: 'buying hydraulic hose uae',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What do I need to send to get a hose quoted?',
      answer:
        'Bore and grade, overall length from sealing face to sealing face, the fitting type at each end, the angle between them if either is an elbow, and the quantity. If you have the old hose, photographs of the layline and both fitting ends plus the measured length replace nearly all of it.',
    },
    {
      type: 'paragraph',
      html: 'This section is about the commercial half of hose — quoting, costing, stocking and sourcing. It is deliberately specific about what we will and will not publish.',
    },
    {
      type: 'comparison_table',
      caption: 'What is on this site, and what is not',
      columns: ['Item', 'Published', 'Why'],
      rows: [
        { cells: ['Cost drivers', 'Yes', 'They do not change, and they let you read a quote'] },
        { cells: ['Prices', 'No', 'A stale price is worse than none'], highlight: true },
        { cells: ['Lead time categories', 'Yes', 'The structure is stable'] },
        { cells: ['Lead times in days', 'No', 'Stock and shipping move'], highlight: true },
        { cells: ['How to cross-reference', 'Yes', 'The method is what transfers'] },
        { cells: ['Brand equivalence tables', 'No', 'We do not hold verified interchange data'], highlight: true },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'On the missing cross-reference table.',
      body: 'The obvious page here would be a Parker / Gates / Manuli interchange table, and it would be the highest-traffic page in this section. We do not hold verified equivalence data for those ranges, and "our part replaces theirs" is a specification claim about something that ends up carrying pressure on a machine. So the article teaches the check instead. Send us a part number and we will do it properly.',
    },
    {
      type: 'paragraph',
      html: 'The through-line across these articles: <strong>the hose is usually the cheap part and rarely the constraint.</strong> Fittings drive cost and lead time, traceability decides whether an assembly has a stated rating at all, and stock held without a date is a shelf rather than cover.',
    },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'By the metre, or built, tested and tagged.' },
    { type: 'category_link', slug: 'hydraulic-fittings', label: 'Hose fittings by thread type', blurb: 'Traceable, with published crimp specifications.' },
    {
      type: 'cta_block',
      heading: 'Send the specification, or the old hose.',
      body: 'Either works. If something is missing we will tell you exactly what — and if we are not the right supplier for a job, we will say that too.',
      quoteLabel: 'Request a quote',
    },
  ] satisfies BlogBlocksInput,
}
