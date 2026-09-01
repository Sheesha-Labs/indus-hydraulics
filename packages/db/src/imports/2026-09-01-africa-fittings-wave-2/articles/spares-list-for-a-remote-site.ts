import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Written for the site where resupply is measured in weeks: mine camps, remote
 * quarries, drilling programmes, agricultural estates. The argument is about
 * consequence-weighted stocking rather than about part numbers.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'spares-list-for-a-remote-site',
  title: 'A hydraulic spares list for a site weeks from resupply',
  excerpt:
    'When the next delivery is a month away, stocking decisions are risk decisions. What to hold, what to skip, and the two categories people always get backwards.',
  categorySlug: 'buying-hydraulic-fittings',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Hydraulic spares list for a remote site',
  seoDescription:
    'How to choose hydraulic fittings, seals and hose spares for a site far from resupply, weighted by what stops production rather than by unit cost.',
  focusKeyword: 'spares list for a remote site',
  publishedAt: '2026-09-01T14:45:00.000Z',
  bodyBlocks: [
    {
      type: 'lead',
      html: 'On a site with a hydraulics counter down the road, stocking is a convenience question. On a mine camp, a remote quarry or a drilling programme where the next consignment is weeks out, it is a risk question — and the two produce very different lists from the same catalogue.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Rank items by what production loses while you wait, not by what the item costs.',
        'Cheap consumables that gate a repair — seals, washers, O-rings — are the highest-return thing on the list.',
        'Hold hose by the metre plus ends, rather than finished assemblies, where you have the means to make up.',
        'Capping and plugging kit lets a machine work at reduced capability instead of standing.',
        'Write the list down and re-order against consumption, not against memory.',
      ],
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Rank by consequence, not by cost.',
      anchor: 'consequence',
    },
    {
      type: 'paragraph',
      html: 'The instinct is to stock cheap things deeply and expensive things thinly. Reverse the question: <strong>what does the site lose per day while this item is absent?</strong> A fitting worth very little that stops a haul truck outranks an expensive item that stops a compressor nobody is waiting on. Once the list is sorted that way, most of it turns out to be small parts.',
    },
    {
      type: 'comparison_table',
      caption: 'Sorting a spares list by what it protects',
      columns: ['Tier', 'What belongs in it', 'Depth'],
      rows: [
        {
          cells: ['Stops production', 'Ends and seals for primary machines’ working circuits',
            'Two of each, minimum'],
          highlight: true,
        },
        { cells: ['Degrades production', 'Secondary circuits, ancillary plant', 'One'] },
        { cells: ['Annoying only', 'Everything else', 'Order when needed'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Bulk hose and ends, rather than finished assemblies.',
      anchor: 'bulk-or-finished',
    },
    {
      type: 'paragraph',
      html: 'A site with a crimper and someone trained to use it should hold hose by the metre with ends and ferrules, because one coil covers many part numbers and a finished assembly covers exactly one. A site without that capability should hold finished assemblies for its critical circuits — tagged, so the right one is findable in a crate at night.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Rubber ages on the shelf as well as on the machine.',
      body: 'Deep hose stock has a limit: the coil at the back is older than the one in front. Rotate by date, store out of sunlight and away from heat, and treat the storage question as part of the stocking decision rather than an afterthought.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'The two categories people get backwards.',
      anchor: 'backwards',
    },
    {
      type: 'paragraph',
      html: 'The first is <strong>seals</strong>. They are treated as consumables to be bought with the repair, and they are the item most likely to leave a machine dismantled while a parcel crosses a border. Hold them by the box.',
    },
    {
      type: 'paragraph',
      html: 'The second is <strong>the expensive assembly nobody wants to buy twice</strong>. It gets left off the list precisely because it is expensive — and it is the one item whose absence costs more than its price in a single week. If a site has one machine it cannot work without, the critical line on that machine belongs in the store, however uncomfortable the invoice.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-hoses',
      label: 'Hydraulic hose by grade',
      blurb: 'Bulk hose and finished assemblies, stocked in Dubai.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Ordering against a long lane.',
      anchor: 'long-lane',
    },
    {
      type: 'paragraph',
      html: 'Where resupply is measured in weeks, consolidation matters more than speed. One planned consignment carrying the season’s consumables costs less in freight and in paperwork than four urgent parcels, and it is easier to clear. Plan the replenishment against the season rather than against the last failure, and keep one small air-freight budget for the genuine emergency.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'How much should a remote site hold?',
          answer:
            'Enough to cover the failures that stop production for one resupply cycle. That is a smaller list than a full inventory and a longer one than most sites carry — and it is derived from the machines, not from a standard list.',
        },
        {
          question: 'Is it worth holding a crimper on site?',
          answer:
            'Where the site is genuinely remote and the fleet is large enough to justify the training, yes — one coil replaces many part numbers. Treat it as a capability decision with training attached, not as a purchase.',
        },
        {
          question: 'Can you quote a season’s consumables in one go?',
          answer:
            'Yes, and it is the cheaper way to buy for a long lane. Send the machine list and the consumption you have recorded; we will build it as one consignment.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Stocking a site weeks from resupply?',
      body: 'Send the fleet list and what you replaced last season. We will build a consequence-ranked list, say what we would not bother holding, and quote it as one consignment.',
      quoteLabel: 'Build a spares list',
    },
  ],
}

export default ARTICLE
