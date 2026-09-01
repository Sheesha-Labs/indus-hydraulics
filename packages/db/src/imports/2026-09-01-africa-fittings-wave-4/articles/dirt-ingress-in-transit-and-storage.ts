import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Distinct from `contamination-during-a-hose-change`, which is about the
 * workshop moment. This is the weeks before it: a consignment crossing an ocean
 * and then sitting in a store.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'dirt-ingress-in-transit-and-storage',
  title: 'Dirt ingress in transit and storage: what arrives inside a new part',
  excerpt:
    'A fitting can be contaminated before anyone opens the bag. What happens to parts over a long sea leg and a longer shelf, and the two minutes that prevent it.',
  categorySlug: 'failure-analysis',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-09-01T16:44:00.000Z',
  bodyBlocks: [
    {
      type: 'lead',
      html: 'Dirt ingress is usually discussed as something that happens during a repair. On a long lane it happens well before that: a consignment spends weeks in a container, is handled several times, and then sits in a store where the bags get opened for stock checks. By the time a part reaches a machine it may have been exposed for months.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Contamination is cumulative across transit, storage and installation — the repair is only the last stage.',
        'Temperature cycling in a container drives moist air in and out of anything not sealed.',
        'Open bags in a store are the largest single source, and the easiest to fix.',
        'Capped and bagged assemblies arrive clean; uncapped ones arrive as a cleaning job.',
        'Flushing after installation does not undo what went into a closed circuit.',
      ],
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'What a container does to a part.',
      anchor: 'the-container',
    },
    {
      type: 'paragraph',
      html: 'A container crossing to West or East Africa heats and cools daily. Air moves in and out of every unsealed volume with it, and that air carries moisture and dust. Anything with an open bore — an assembly without caps, a fitting in a torn bag — is breathing for the whole voyage. <strong>The result is not visible dirt so much as a fine film</strong>, which is exactly the contamination that survives a casual wipe.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'This is why assemblies are capped rather than just bagged.',
      body: 'A cap on each end of a made-up assembly keeps the bore closed through handling, transit and storage. It costs almost nothing, and it is the difference between a part that can be fitted directly and one that should be flushed first.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'The store is worse than the ship.',
      anchor: 'the-store',
    },
    {
      type: 'paragraph',
      html: 'Parts arrive sealed and then somebody counts them. Bags are opened, contents tipped onto a bench, put back loosely, and left on a shelf in a workshop where grinding and sweeping happen. On most sites we deal with, <strong>more contamination is picked up in the store than anywhere in transit</strong>, and it is the cheapest thing to fix in this entire article.',
    },
    {
      type: 'comparison_table',
      caption: 'Storage practices that cost nothing',
      columns: ['Practice', 'What it prevents'],
      rows: [
        { cells: ['Reseal or re-bag after a stock check', 'The main source of workshop-acquired dirt'], highlight: true },
        { cells: ['Keep caps on assemblies until the moment of fitting', 'Bore contamination during handling'] },
        { cells: ['Store elastomers away from heat and sunlight', 'Ageing rather than dirt, but the same shelf'] },
        { cells: ['Separate clean stock from returns and used parts', 'A used fitting being issued as new'] },
      ],
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'What it costs downstream.',
      anchor: 'downstream',
    },
    {
      type: 'paragraph',
      html: 'Particles from a fitting go into a circuit that runs pumps, valves and cylinders with clearances measured in microns. The failure that results — a sticking spool, a scored bore, a pump that loses efficiency — arrives weeks later and is almost never traced back to a bag that was opened in a store. <strong>Flushing after the fact does not recover the situation</strong> on a closed circuit; it dilutes it.',
    },
    {
      type: 'paragraph',
      html: 'The proportionate response is not a cleanroom. It is caps, closed bags, and a rule that a part is opened at the machine rather than at the shelf.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Should we flush a new assembly before fitting?',
          answer:
            'If it arrived capped and the caps are intact, no. If it arrived open, or has been sitting uncapped in a store, then yes — and consider that a signal about how the store is run rather than about the supplier.',
        },
        {
          question: 'Do fittings need the same care as hose?',
          answer:
            'The bore of a fitting is small and easy to overlook, and a particle from it reaches the same valve. Cap or bag them; the cost is trivial next to the failure it prevents.',
        },
        {
          question: 'Can you ship assemblies capped and tagged?',
          answer:
            'Yes — capped, tagged with the hose, the fitting and the test date, and crated. Say so on the order and it is how the consignment leaves.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Long lane, and parts arriving dirty?',
      body: 'Ask for capped and tagged assemblies on the quotation. It costs nothing and it removes an entire class of failure that is otherwise blamed on the parts.',
      quoteLabel: 'Ask for a quotation',
    },
  ],
}

export default ARTICLE
