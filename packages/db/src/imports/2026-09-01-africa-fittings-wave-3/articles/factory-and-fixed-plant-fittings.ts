import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Fixed manufacturing plant — presses, injection moulding, packaging lines,
 * textile and steel. The distinguishing argument against every other article in
 * the wave: a factory's hydraulics are consistent by design, so the winning
 * strategy is standardisation rather than coverage.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'factory-and-fixed-plant-fittings',
  title: 'Fixed plant fittings: standardise, because you finally can',
  excerpt:
    'A factory is the one environment where the thread population is a choice rather than an inheritance. Most plants never make that choice, and pay for it every week.',
  categorySlug: 'hydraulic-fittings-by-industry',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Fixed plant hydraulic fittings — standardising a factory',
  seoDescription:
    'Why fixed manufacturing plant should standardise its hydraulic fitting families, how to do it without a shutdown, and what it saves in stores and downtime.',
  focusKeyword: 'fixed plant fittings',
  publishedAt: '2026-09-01T15:38:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A factory’s machines do not move, so its thread population is stable and can be deliberately narrowed over time.',
        'Standardising on fewer families cuts stores value, identification time and wrong-part errors simultaneously.',
        'You do not need a shutdown: convert at each hose change, one line at a time.',
        'Record the target families and put them on the purchase specification for new equipment.',
        'The exception is the machine you cannot touch — leave it and stock for it explicitly.',
      ],
    },
    {
      type: 'lead',
      html: 'Fixed plant fittings are the one population where the thread families are a choice rather than an inheritance. Presses, injection moulders, packaging lines, textile plant and rolling mills have one advantage over every other customer in this series: the machines stay where they are. The fleet does not change monthly, the environment is known, and the thread population is therefore a decision rather than an accident of importing — which is precisely why it is such a waste that most plants never treat it as one.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'What standardisation actually buys.',
      anchor: 'what-it-buys',
    },
    {
      type: 'comparison_table',
      caption: 'Three savings, one decision',
      columns: ['Saving', 'How it arrives'],
      rows: [
        { cells: ['Stores value', 'Fewer families means depth without breadth'], highlight: true },
        { cells: ['Identification time', 'A fitter who meets two families stops guessing'] },
        { cells: ['Wrong-part errors', 'The commonest cause is a near-miss between similar families'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The second row is worth more than it looks. In a plant where every line is one of two families, a fitter can be confident by inspection; in a plant with six, they are always half-guessing, and the guesses are made under production pressure at three in the morning.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Converting without a shutdown.',
      anchor: 'converting',
    },
    {
      type: 'paragraph',
      html: 'Nobody has to convert a plant in one go, and nobody should. The method is boring and effective: choose the target families, then <strong>convert at each hose change</strong> — when a line is replaced anyway, it comes back with the target ends, and the adapters that used to bridge it come out. Over a year most of a plant migrates without a single dedicated intervention.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Write the target into the purchase specification.',
      body: 'The other half of standardising is stopping the drift. New equipment arrives with whatever its maker used, so name the preferred port families in the purchase specification and ask the supplier to quote against it. Most will; a few will say no, and then you know before delivery rather than after.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Where the plant is hot or wet.',
      anchor: 'hot-or-wet',
    },
    {
      type: 'paragraph',
      html: 'Standardising on family is separate from specifying material. Lines near furnaces, ovens and steam ranges are a temperature question; lines in washdown areas are a corrosion one. <strong>Keep the family constant and vary the material by area</strong> — that keeps the identification benefit while putting the right steel where the environment demands it.',
    },
    {
      type: 'category_link',
      slug: 'din-2353-bite-type-adapters-uae',
      label: 'DIN 2353 adapters',
      blurb: 'A common standardisation target for fixed plant.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'The machine you cannot touch.',
      anchor: 'exceptions',
    },
    {
      type: 'paragraph',
      html: 'Most plants have one machine — old, critical, and impossible to get parts for — where conversion is not worth the risk. Leave it alone, and be explicit about it: hold its specific spares, label them as belonging to that machine, and do not let them be cannibalised for anything else. An acknowledged exception costs a shelf; an unacknowledged one costs a night.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Which family should we standardise on?',
          answer:
            'Usually whichever already dominates your plant, unless the environment argues otherwise. The gain comes from having fewer families, not from having a particular one — so the cheapest target is the one you are mostly already running.',
        },
        {
          question: 'Is it worth converting a machine that is due for replacement?',
          answer:
            'No. Convert at hose changes on equipment with years left, and leave anything on its way out alone. The point is to spend nothing extra, not to run a project.',
        },
        {
          question: 'Can you quote a standardisation kit?',
          answer:
            'Yes — send the target families and the positions. We will quote the ends and adapters needed to convert as lines come up, rather than a bulk change-out you do not need.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Narrowing your thread population?',
      body: 'Send what the plant runs now and what you would like it to run. We will quote the conversion as an ordinary replenishment, and say which machines are not worth converting.',
      quoteLabel: 'Ask for a quotation',
    },
  ],
}

export default ARTICLE
