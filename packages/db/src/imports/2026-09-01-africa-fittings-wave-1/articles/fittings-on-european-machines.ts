import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The DIN 2353 world, and the light/heavy series distinction that catches
 * people who have only met one of them.
 *
 * The genuinely useful content here is that two series share nominal tube
 * sizes with different thread sizes, so "22 millimetre" is not an answer on
 * its own. That is a fact about the standard family rather than about any
 * manufacturer, so it is safe to state plainly.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'fittings-on-european-machines',
  title: 'Fittings on European machines: DIN 2353, and light series versus heavy',
  excerpt:
    'Metric 24° cone covers most of it, but the same tube size exists in two series with different threads. Knowing which one you are holding is the whole job.',
  categorySlug: 'fitting-identification',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Fittings on European machines — DIN 2353 light and heavy series',
  seoDescription:
    'The metric 24° cone family on European-built machines, the light and heavy series distinction, and what else you will meet at ports and pumps.',
  focusKeyword: 'fittings on european machines',
  publishedAt: '2026-09-01T13:00:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What thread is on a European machine?',
      answer:
        'Most commonly a metric 24° cone from the DIN 2353 family, with BSP parallel at many ports and four-bolt flanges on the largest lines. The catch is that DIN 2353 exists in a light series and a heavy series, and a given tube size appears in both with different thread sizes — so identifying the tube diameter alone does not identify the fitting.',
    },
    {
      type: 'lead',
      html: 'European machines are the most internally consistent of the origins in this series, which makes them easy to stock for and easy to get subtly wrong. Nearly everything is one family. The mistake is not confusing that family with another; it is confusing two members of it.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'One family, two series.',
      anchor: 'two-series',
    },
    {
      type: 'paragraph',
      html: 'DIN 2353 tube couplings are specified by tube outside diameter and by <strong>series</strong> — a lighter series for lower pressures and a heavier one for higher. The same nominal tube diameter can appear in both, carrying a different thread. So a fitter who measures the tube, orders "22 millimetre", and receives the other series has a part that will not thread into the port at all — which is at least a fast failure, and better than a part that threads in and does not seal.',
    },
    {
      type: 'comparison_table',
      caption: 'What identifies a DIN 2353 fitting',
      columns: ['Property', 'Why it is needed'],
      rows: [
        { cells: ['Tube outside diameter', 'The nominal size everyone quotes first'] },
        { cells: ['Series — light or heavy', 'Decides the thread for that tube size'], highlight: true },
        { cells: ['Thread, measured', 'The unambiguous answer, and the one to send us'] },
        { cells: ['End form — cone, cone with O-ring, or bite ring', 'Decides what actually seals'] },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Measure the thread and the series stops mattering.',
      body: 'The light and heavy question is a way of getting to the thread. If you can measure the thread across the crests and take the pitch, send that instead — it is one number pair and it cannot be ambiguous, whereas "22 mm heavy" depends on both of you meaning the same thing by it.',
    },
    {
      type: 'category_link',
      slug: 'din-2353-bite-type-adapters-uae',
      label: 'DIN 2353 bite-type adapters',
      blurb: 'Light and heavy series, studs, elbows, unions and bulkheads.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'What else is on the machine.',
      anchor: 'what-else',
    },
    {
      type: 'paragraph',
      html: 'Ports are commonly <strong>BSP parallel with a bonded seal</strong> or a metric port with an elastomeric seal under the shoulder. Larger pump and motor connections are flanged. On newer machines, and on anything specified for a market where it is the norm, expect <strong>ORFS</strong> on lines where leak-tightness matters most — it is not exclusively an American family and turns up wherever a designer wanted a flat-face seal.',
    },
    {
      type: 'paragraph',
      html: 'The bite ring is the other thing worth understanding on this family: on tube work the seal is made by a ring that cuts into the tube as the nut is tightened, and <strong>a bite ring that has been made up once belongs to that tube</strong>. Reusing tube ends and rings across repairs is a common cause of a joint that will not stop weeping.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Stocking for a European fleet.',
      anchor: 'stocking',
    },
    {
      type: 'paragraph',
      html: 'Because the family is consistent, depth pays: the two or three tube sizes your machines actually use, in the correct series, plus bonded seals, plus flange halves for the pump sizes. The adapters worth holding are the ones that bridge to whatever else is on your site — which for most fleets we supply means BSP, and increasingly means the inch families as imported machines arrive.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'How do I tell light series from heavy series?',
          answer:
            'By the thread for a given tube size — the heavier series carries a larger thread. In practice, measure the thread across the crests and take the pitch, and you have identified the part without needing to name the series at all.',
        },
        {
          question: 'Can I reuse a bite ring?',
          answer:
            'It has already deformed onto one tube. Re-using it on a fresh cut or a different tube is the usual reason a re-made joint weeps; fit a new ring and make it up properly.',
        },
        {
          question: 'Is metric 24° cone the same as JIS 30°?',
          answer:
            'No — different seat angle and different thread. They are two of the families that a mixed fleet will hold side by side, and a seat gauge separates them immediately.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Ordering DIN 2353 parts without the series to hand?',
      body: 'Send the thread measured across the crests and the pitch, with a photograph of the end. We will name the part and the series, and quote from stock in Dubai.',
      quoteLabel: 'Identify a fitting',
    },
  ],
}

export default ARTICLE
