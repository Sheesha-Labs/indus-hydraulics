import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Mode choice for small, dense, high-value-per-kilo parts.
 *
 * Publishes no transit times and no rates. The market pages carry per-lane
 * transit figures and keep them current; repeating them here would create a
 * second copy to go stale. The argument is structural — what each mode costs
 * you in fixed versus variable terms, and which failures justify which.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'air-or-sea-for-a-fittings-order',
  title: 'Air or sea for a fittings order',
  excerpt:
    'Fittings are small, dense and cheap to fly relative to what they unlock. That makes the mode question different from the one you answer for hose or plant.',
  categorySlug: 'buying-hydraulic-fittings',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Air or sea for a hydraulic fittings order',
  seoDescription:
    'How to choose between air and sea freight for hydraulic fittings, why the per-consignment costs dominate, and when a split shipment is the cheaper answer.',
  focusKeyword: 'air or sea for a fittings order',
  publishedAt: '2026-09-01T15:05:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'Air or sea for a fittings order — which is actually cheaper?',
      answer:
        'It depends far less on the parts than on what is waiting for them. Fittings are dense and low-volume, so air freight on a small consignment is often a smaller number than people assume — and the fixed costs of clearing any consignment, by either mode, usually dominate the freight itself. The practical answer for most sites: plan replenishment by sea, and keep air for the specific parts that are holding a machine.',
    },
    {
      type: 'lead',
      html: 'The instinct is to treat mode as a cost decision and to default to the cheaper one. For fittings that is usually the wrong frame, because the largest number in the whole calculation is not on the freight invoice — it is the machine, and the question is which parts are standing between you and using it.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Fixed costs dominate small consignments.',
      anchor: 'fixed-costs',
    },
    {
      type: 'paragraph',
      html: 'Every consignment carries costs that do not shrink with the parcel: documentation, clearance, handling, the inland leg. On a pallet of hose those are a small fraction. On a bag of adapters they can be most of the landed cost, which produces the counterintuitive result that <strong>two small consignments cost far more than one consignment twice the size</strong>, whichever mode they travel by.',
    },
    {
      type: 'comparison_table',
      caption: 'What actually changes between modes',
      columns: ['Property', 'Air', 'Sea'],
      rows: [
        { cells: ['Freight cost sensitivity', 'By weight — favourable for dense, small items', 'By volume — favourable for bulk'] },
        { cells: ['Fixed per-consignment costs', 'Present', 'Present, and usually higher'], highlight: true },
        { cells: ['Best used for', 'The specific parts holding a machine', 'Planned replenishment and anything bulky'] },
        { cells: ['What it punishes', 'Sending everything, including the coil of hose', 'Sending the one part somebody is waiting for'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'The split that usually wins.',
      anchor: 'the-split',
    },
    {
      type: 'paragraph',
      html: 'For a site on a long lane, the pattern that costs least over a year is neither mode exclusively. It is <strong>a planned sea consignment carrying the season’s consumables</strong>, plus the discipline to air only what is genuinely stopping production — and to air it as one parcel rather than three, by deciding the whole list before anything is booked.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Decide the whole list before booking anything.',
      body: 'The expensive pattern is emergent: one part is urgent, so it flies; two days later a second part is discovered and also flies; a week later, a third. Three air consignments have now cost more than the pallet that would have prevented all of them. Pause long enough to establish the full list, then ship once.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'What changes at the border.',
      anchor: 'the-border',
    },
    {
      type: 'paragraph',
      html: 'Mode does not change the documentation requirements — conformity registration where a destination has one, certificate of origin, invoice and packing list travel with the goods either way. What it changes is <strong>how much time you have to get them right</strong>. A sea consignment is weeks in transit and the paperwork can be finished behind it; an air consignment can arrive before an unprepared document does, and then sits.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Is air freight worth it for a single adapter?',
          answer:
            'If it is the part standing between a machine and its work, almost always. If it is one of five parts you will need this month, no — establish the list and send it once.',
        },
        {
          question: 'Can fittings and hose travel together?',
          answer:
            'Yes, and consolidating them is usually cheaper than shipping either alone, because the fixed costs are paid once. The exception is a genuine breakdown part that cannot wait for the hose to be made up.',
        },
        {
          question: 'What transit should I plan on?',
          answer:
            'It is per lane and we publish it per destination on the market pages rather than as a general figure here, because it moves. Tell us the destination and we will quote the mode against your actual deadline.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Deciding what flies and what sails?',
      body: 'Send the whole list, including the parts you think can wait. We will split it — what should fly today, what belongs in the next planned consignment — and quote both.',
      quoteLabel: 'Ask for a quotation',
    },
  ],
}

export default ARTICLE
