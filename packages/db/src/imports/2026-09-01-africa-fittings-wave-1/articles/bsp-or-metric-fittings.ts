import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The article that corrects a belief we meet constantly: that a country has a
 * thread standard.
 *
 * It does not. A country has an import history, and the fleet reflects it. That
 * distinction matters commercially, because a workshop that stocks "the local
 * standard" is stocking for a fleet it no longer has once machines start
 * arriving from a different origin.
 *
 * No claim is made about the composition of any national fleet — we have not
 * measured one. The argument is structural.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'bsp-or-metric-fittings',
  title: 'BSP or metric fittings: the answer follows the machine, not the country',
  excerpt:
    'Workshops ask which standard "we use here". Countries do not have thread standards — they have import histories, and the drawer should be stocked for the fleet rather than the flag.',
  categorySlug: 'fitting-identification',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'BSP or metric fittings — which standard does your fleet use?',
  seoDescription:
    'Why thread convention follows the origin of the machine rather than the country it works in, and how to stock a workshop for a mixed-import fleet.',
  focusKeyword: 'bsp or metric fittings',
  publishedAt: '2026-09-01T13:30:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'Does my country use BSP or metric hydraulic fittings?',
      answer:
        'Neither, as a country. Thread convention is a property of the machine, which follows where the machine was built and for which market. A workshop in one town can hold machines from four origins with three conventions between them. Plumbing and pipework inherit national habits; hydraulic connections on mobile plant inherit the factory.',
    },
    {
      type: 'lead',
      html: 'This question arrives in some form every week, and the premise is the interesting part. It is not a foolish question — it is what people say when the real question is "what should I keep on the shelf", and that question has a good answer. It just is not a national one.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Where the national intuition comes from.',
      anchor: 'the-intuition',
    },
    {
      type: 'paragraph',
      html: 'It comes from pipework, and there it is broadly right. Water, air and gas plumbing follow conventions that spread with engineering practice, so a region’s buildings and workshops genuinely do share a threading culture. <strong>Mobile hydraulics is a different population</strong>: the machine was designed elsewhere, assembled from components made in several countries, and imported. Nothing about the destination influenced its ports.',
    },
    {
      type: 'comparison_table',
      caption: 'Two different populations, two different rules',
      columns: ['Property', 'Workshop pipework', 'Mobile machine hydraulics'],
      rows: [
        { cells: ['What sets the convention', 'Local engineering practice', 'The factory, and the market it built for'] },
        { cells: ['How uniform is it', 'Fairly uniform in one place', 'Mixed, sometimes on one machine'], highlight: true },
        { cells: ['How to stock', 'For the local convention', 'For your actual fleet'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'What to do instead of asking the country.',
      anchor: 'instead',
    },
    {
      type: 'paragraph',
      html: 'Audit the fleet once. Walk the yard with a caliper, a pitch gauge and a notebook, and write down what each machine actually carries at the positions that fail — boom cylinders, travel motors, loader circuits, the implement couplers. It is an afternoon, it does not need to be repeated, and it converts every future order from a diagnosis into a line item.',
    },
    {
      type: 'decision_tree',
      heading: 'Turning that audit into a stock list',
      branches: [
        {
          condition: 'One family covers most of your positions',
          outcome: 'Stock depth in it, and adapters for the rest',
          detail: 'Depth in the family you actually use beats a shallow spread across five.',
        },
        {
          condition: 'Two families are roughly equal',
          outcome: 'Stock both, and the bridging adapters between them',
          detail:
            'This is the common outcome for a mixed-import fleet, and it is cheaper than it sounds because the bores that fail are few.',
        },
        {
          condition: 'Every machine is different',
          outcome: 'Stock consumables, not fittings',
          detail:
            'Seals, bonded washers, O-rings, dust caps and one or two hoses. Order the fittings against a photograph when the failure happens, and consolidate.',
        },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'The bores that fail are fewer than the bores that exist.',
      body: 'Most workshops discover that two or three sizes account for nearly every hose and adapter they replace. Stocking those properly, in the families you actually run, costs a fraction of trying to cover the catalogue and removes most of the waiting.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Why this matters more the further you are from a counter.',
      anchor: 'distance',
    },
    {
      type: 'paragraph',
      html: 'Where a hydraulics counter is twenty minutes away, a wrong guess costs twenty minutes. Where the nearest one is a day away or in another country, the same wrong guess costs a week and a machine. That asymmetry is why an afternoon spent auditing a fleet returns more on a remote site than anywhere else, and why the sites we ship to furthest from Dubai are usually the ones with the best-organised drawers.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-adapters',
      label: 'Hydraulic adapters',
      blurb: 'BSP, metric, JIC, ORFS, NPT and the bridging parts between them.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'So there is no point asking which standard is common locally?',
          answer:
            'It tells you what the shops near you are likely to hold, which is useful for an emergency. It does not tell you what your machines use, and stocking to it rather than to your fleet is how a drawer ends up full of parts that fit nothing you own.',
        },
        {
          question: 'Is BSP being replaced by metric?',
          answer:
            'Both remain in wide production and both keep arriving on new machines. Rather than betting on a trend, stock what your fleet carries and keep bridging adapters for the overlap.',
        },
        {
          question: 'Can you help build the stock list?',
          answer:
            'Yes — send the audit notes or photographs, position by position, and we will turn them into a list with quantities, and say which lines are worth doubling because they are the ones that strand a machine.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Stocking for a mixed fleet?',
      body: 'Send the notes from a yard walk — machines, positions, threads where you have them. We will build the list, quote it as one consignment, and flag which items are worth holding two of.',
      quoteLabel: 'Build a stock list',
    },
  ],
}

export default ARTICLE
