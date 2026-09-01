import type { BlogBlocksInput } from '@indus/domain'

/**
 * The buying hub for fittings and adapters.
 *
 * Created rather than folded into `procurement-export`, which is nine articles
 * about hose orders — assembly cost, crimpers, bulk versus finished, hose lead
 * times. A reader looking for how to kit a workshop or judge what arrived in a
 * box of adapters would not open it, and the articles would sit under a
 * heading that describes a different product.
 *
 * Body and focus keyword from creation, per the August 2026 lesson.
 */
export const BUYING_FITTINGS_CATEGORY = {
  slug: 'buying-hydraulic-fittings',
  name: 'Buying fittings & adapters',
  description:
    'How to order fittings when the nearest counter is a long way off: what to send, what to keep on the shelf, how to judge what arrives, and when a substitution is safe.',
  heroCopy:
    'A fitting is a cheap part that stops an expensive machine. Most of the cost is not in the part — it is in the waiting, and nearly all of that is decided before the failure happens.',
  seoTitle: 'Buying hydraulic fittings — sourcing, kitting and inspection',
  seoDescription:
    'Ordering hydraulic fittings and adapters without a local stockist: what to send with an enquiry, what to hold on the shelf, how to inspect on arrival and when to substitute.',
  focusKeyword: 'buying hydraulic fittings',
  position: 13,
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What makes buying fittings different from buying a hose?',
      answer:
        'A hose is made to your measurements, so the order starts with a specification you provide. A fitting already exists and the whole problem is naming which one — the wrong name and the wrong part arrive together, and on a remote site that costs a week rather than an afternoon. So the work moves earlier: identify properly, order in sets rather than singly, and hold the few items that strand a machine.',
    },
    {
      type: 'paragraph',
      html: 'Almost every expensive fittings order we see went wrong at one of three points. The <strong>identification</strong> was a conclusion rather than a measurement. The <strong>quantity</strong> was one, so the same trip happened again a month later. Or the <strong>consolidation</strong> never happened, and four parcels crossed a border where one consignment would have done.',
    },
    {
      type: 'comparison_table',
      caption: 'Where the cost of a fitting actually sits',
      columns: ['Element', 'Share of the real cost', 'Who controls it'],
      rows: [
        { cells: ['The part itself', 'Small', 'The supplier'] },
        { cells: ['Freight and clearance', 'Moderate, and mostly per consignment', 'Whoever decides how many consignments there are'], highlight: true },
        { cells: ['The machine standing still', 'Everything else', 'Decided before the failure, by what is on the shelf'] },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'The cheapest order is the one placed before the failure.',
      body: 'Two or three bores account for nearly every fitting a workshop replaces. Holding those, in the families the fleet actually runs, converts most breakdowns from a supply problem into a fitting job — and it is a smaller purchase than most people expect.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-adapters',
      label: 'Hydraulic adapters',
      blurb: 'BSP, metric, JIC, ORFS, NPT and the bridging parts between them.',
    },
    {
      type: 'cta_block',
      heading: 'Building a stock list, or ordering against a photograph?',
      body: 'Send what you have — a yard-walk note, a photograph of a failed end, a list with gaps in it. We will name the parts, say which lines are worth doubling, and quote it as one consignment.',
      quoteLabel: 'Ask for a quotation',
    },
  ] satisfies BlogBlocksInput,
}
