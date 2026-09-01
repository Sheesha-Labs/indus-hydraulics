import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The elastomer half is the point. `hydraulic-hose-shelf-life-storage` covers
 * hose; nobody had written the equivalent for the small parts, which are the
 * ones that quietly age on a shelf in a hot store.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'storing-fittings-and-seals-on-site',
  title: 'Storing fittings and seals on a site that has no cool store',
  excerpt:
    'Steel is patient and rubber is not. What actually degrades on a shelf in a hot workshop, and how to organise a store so the oldest stock leaves first.',
  categorySlug: 'maintenance-reliability',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-09-01T16:48:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'Does storing fittings and seals badly actually matter?',
      answer:
        'For the steel parts, very little — a fitting in a dry bag is fine for years. For the elastomers it matters a great deal: O-rings, bonded seals and anything rubber age continuously with heat, sunlight and ozone, and a seal that has hardened on a shelf fails on installation rather than in service. The practical consequence is that a store should be organised around the rubber, not the metal.',
    },
    {
      type: 'lead',
      html: 'Most stores on the sites we supply are a container, a shipping office or a corner of a workshop, all of which get hot. That is survivable for steel and unkind to everything else on the shelf — and the parts that suffer are precisely the cheap ones nobody thinks of as perishable.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'What ages and what does not.',
      anchor: 'what-ages',
    },
    {
      type: 'comparison_table',
      caption: 'On a hot shelf',
      columns: ['Item', 'How it fares', 'What to do'],
      rows: [
        { cells: ['Steel fittings and adapters', 'Indefinite, if dry and bagged', 'Keep bagged; watch humidity, not time'] },
        { cells: ['O-rings and bonded seals', 'Harden and take a set with heat and light', 'Cool, dark, dated, first in first out'], highlight: true },
        { cells: ['Made-up hose assemblies', 'Age from the day they were built', 'Tag with the build date; rotate stock'] },
        { cells: ['Bulk hose', 'Ages; also takes a set if coiled tightly', 'Store flat or on large-radius coils, out of sun'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'The coil at the back is older than the one at the front.',
      body: 'Deep stock on a long lane is sensible and it creates a rotation problem. Without dating and a first-in-first-out rule, a site steadily accumulates old rubber at the back of the shelf and fits it during the emergency that empties the front.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'A store that works in a container.',
      anchor: 'a-store-that-works',
    },
    {
      type: 'paragraph',
      html: 'Four things do most of the work and none of them cost anything: <strong>date what arrives</strong>, keep elastomers in a closed box away from the hottest wall, separate clean stock from used and returned parts, and put the caps back on. Add a light and somewhere to write, and the store stops being the place parts go to deteriorate.',
    },
    {
      type: 'paragraph',
      html: 'The one thing worth spending on is a sealed box for the seals — not a cupboard, a box with a lid, kept off the floor and away from sunlight and any equipment producing ozone. It is the highest return per dirham in this article.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Deciding what to keep.',
      anchor: 'what-to-keep',
    },
    {
      type: 'paragraph',
      html: 'The consumables that gate a repair — seals, bonded washers, caps, plugs — should be held deep, because they are cheap, they stop a job dead, and they are the first thing to run out. The expensive items should be held to a list that someone can justify, and everything else ordered against a photograph. <strong>A store that holds a little of everything holds nothing usefully.</strong>',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'How long can we keep O-rings?',
          answer:
            'It depends on compound and conditions rather than a single figure, and heat shortens it sharply. Date them on arrival, keep them cool and dark, use the oldest first, and discard anything that has gone hard or shows surface crazing.',
        },
        {
          question: 'Is it worth holding made-up assemblies?',
          answer:
            'For the circuits that stop production, yes — and tag them with the build date so they are rotated rather than accumulated. An assembly that has sat for years in a hot container is not the insurance the site thinks it is.',
        },
        {
          question: 'What should be in a small site store?',
          answer:
            'Ends in the bores that actually fail, a box each of bonded seals and O-rings, caps and plugs, and one assembly per stopping circuit. That is a short list, and it covers most of what a remote site actually loses time to.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Restocking a site store?',
      body: 'Send what you hold and what you keep running out of. We will propose depth where it prevents a stoppage, say what is not worth holding, and quote it as one consignment.',
      quoteLabel: 'Build a stock list',
    },
  ],
}

export default ARTICLE
