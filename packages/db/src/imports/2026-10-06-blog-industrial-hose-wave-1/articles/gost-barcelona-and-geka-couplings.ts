import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The three regional symmetrical patterns we stock, read from four GOST and
 * five Barcelona/Geka listings. The listings carry no pressure rating or
 * standard number, so the article quotes neither.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'gost-barcelona-and-geka-couplings',
  title: 'GOST, Barcelona and Geka couplings: three regional patterns that only fit themselves',
  excerpt:
    'Russian GOST heads, Spanish Barcelona couplings and German Geka claws are all symmetrical, and none of them fits the others or Storz. What each one is for, the sizes we hold, and how to bridge them.',
  categorySlug: 'industrial-hose',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T09:40:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What are GOST, Barcelona and Geka couplings?',
      answer:
        'They are three regional symmetrical hose couplings. GOST couplings follow the Russian fire and water hose pattern and are the expected connection on equipment for Russia and the CIS. Barcelona is the Spanish symmetrical fire and water coupling. Geka is a small brass claw coupling for water and general hose up to 1". In each pattern any two heads of the same size connect, but no pattern connects to another — or to Storz or Guillemin — without an adapter.',
    },
    {
      type: 'key_takeaways',
      items: [
        'All three are symmetrical, so there is no male or female within a pattern.',
        'None connects to another pattern, or to Storz or Guillemin, without an adapter.',
        'Our GOST couplings, adapters and caps are cast aluminium with NBR gaskets, 2" to 3", and couplings to 6".',
        'Our Barcelona couplings are aluminium with a female thread, 3/4" to 4"; our Geka parts are brass, 1/4" to 1".',
        'These listings carry no pressure rating, so the hose and the clamping set the assembly rating — ask before relying on a figure.',
      ],
    },
    {
      type: 'lead',
      html: 'Most of the world\'s fire and water hose is joined by a symmetrical coupling, and most countries chose their own. Storz in Germany, Guillemin in France, Barcelona in Spain, the GOST head across Russia and the CIS. Each one solves the same problem — two identical halves, no wrong end — and each solves it in a way that <strong>fits nothing else</strong>. That matters to anyone shipping equipment between markets, which from Dubai is most of our customers.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'GOST: the Russian pattern.',
      anchor: 'gost',
    },
    {
      type: 'paragraph',
      html: 'GOST couplings follow the Russian state standard pattern for fire and water hose heads, and they are what a buyer in Russia, Kazakhstan or the wider CIS will expect on a pump, a tanker or a hydrant line. Our range lists the coupling itself (2", 2-1/2", 3" and 6"), adapters to a male or female thread, and caps (2" to 3"), all cast aluminium with an NBR gasket. A piece of plant leaving Dubai for that region is worth fitting with GOST heads before it leaves rather than adapting on arrival.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Barcelona: the Spanish pattern.',
      anchor: 'barcelona',
    },
    {
      type: 'paragraph',
      html: 'Barcelona is the symmetrical coupling of Spanish fire and water service, and it travels with Spanish specifications into Latin America and parts of North Africa. Our listing is the Barcelona coupling with a female thread, in aluminium from 3/4" to 4" with an NBR gasket — the part that puts a Barcelona face on a pump, a hydrant or a tank outlet.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Geka: the small claw coupling.',
      anchor: 'geka',
    },
    {
      type: 'paragraph',
      html: 'Geka is a brass claw coupling for small hose — water, washdown and general service up to 1". Two heads hook together by their claws and lock with a twist. Our range lists a hose-shank coupling, male and female thread couplings and a cap, all brass with NBR gaskets, from 1/4" to 1". It is the coupling to reach for where a small hose is connected and disconnected all day and a threaded union would wear out.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Bridging patterns.',
      anchor: 'bridging',
    },
    {
      type: 'comparison_table',
      caption: 'The regional patterns in our range',
      columns: ['Pattern', 'Region', 'Our sizes and material'],
      rows: [
        { cells: ['GOST', 'Russia and the CIS', '2" – 3" (couplings to 6"), cast aluminium'] },
        { cells: ['Barcelona', 'Spain and Spanish specifications', '3/4" – 4", aluminium, female thread'] },
        { cells: ['Geka', 'General small hose', '1/4" – 1", brass'] },
        { cells: ['Storz', 'Germany and much of Europe', '1" – 6", aluminium, brass, stainless'], highlight: true },
        { cells: ['Guillemin', 'France and francophone markets', '3/4" – 4", aluminium, stainless'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The practical way to cross from one pattern to another is through a thread: a pattern adapter with a male or female thread on one side, screwed to an adapter of the other pattern with the matching thread. Our GOST adapters carry male and female threads for exactly that. Keep the bridge to one joint — a stack of three adapters on a fire line is three places to leak and a lever on the outlet.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'No published rating on these listings.',
      body: 'Our GOST, Barcelona and Geka listings do not state a working pressure, so we do not quote one here. The hose and the clamping on the shank set the assembly rating; ask for the figure for the specific part before it goes into pressure service.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Does a GOST coupling fit a Storz coupling?',
          answer:
            'No. Both are symmetrical, but the faces are different patterns. Join them through a threaded adapter of each pattern.',
        },
        {
          question: 'Is a Barcelona coupling male or female?',
          answer:
            'The head is symmetrical. Our listing is a Barcelona coupling with a female thread on the back, which is what fits it to a pump or hydrant outlet.',
        },
        {
          question: 'What size range do Geka couplings cover?',
          answer:
            'Our Geka parts run from 1/4" to 1", in brass with NBR gaskets: hose shank, male thread, female thread and cap.',
        },
        {
          question: 'What pressure are these couplings rated for?',
          answer:
            'Our listings for these three patterns do not state a working pressure. Ask for the rating of the specific part, and rate the assembly at its weakest component.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'GOST, Barcelona and Geka parts',
      skus: [
        'IH-GST-COUPLING',
        'IH-GST-ADAPTER-MALE',
        'IH-GST-ADAPTER-FEMALE',
        'IH-GST-CAP',
        'IH-BGK-BARCELONA-FEMALE',
        'IH-BGK-GEKA-SHANK',
        'IH-BGK-GEKA-MALE',
        'IH-BGK-GEKA-CAP',
      ],
    },
    {
      type: 'category_link',
      slug: 'gost-couplings',
      label: 'Russian GOST couplings',
      blurb: 'Couplings, thread adapters and caps in cast aluminium.',
    },
    {
      type: 'category_link',
      slug: 'barcelona-geka-couplings',
      label: 'Barcelona and Geka couplings',
      blurb: 'Barcelona female-thread heads and brass Geka claw couplings.',
    },

    {
      type: 'cta_block',
      heading: 'Shipping plant to a market with its own coupling?',
      body: 'Tell us where the equipment is going and what the outlets carry now. We will quote the heads for that market and the adapters to bridge what you already have.',
      quoteLabel: 'Quote regional couplings',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Sizes and materials checked against our GOST, Barcelona and Geka listings.',
    },
  ],
}

export default ARTICLE
