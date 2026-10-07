import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Guillemin, read from the nine Guillemin listings: the Guillemin system (NF E 29-572 in France), symmetrical
 * heads, the lock ring, 3/4" to 4", aluminium and stainless.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'guillemin-couplings-explained',
  title: 'Guillemin couplings explained: the French symmetrical coupling and its lock ring',
  excerpt:
    'Guillemin is the symmetrical half-turn coupling of French fire and industrial water service. How it connects, what the lock ring is for, and how to order the right tail.',
  categorySlug: 'industrial-hose',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T09:30:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What is a Guillemin coupling?',
      answer:
        'A Guillemin coupling is a symmetrical quick coupling, standardised in France as NF E 29-572 and used for fire, water and industrial transfer hose. Both heads are identical, so there is no male or female: two heads of the same size face each other and lock with a short turn. A lock ring on many versions stops the joint turning apart. Our Guillemin range runs from 3/4" to 4" in aluminium or stainless; Sunpool publishes no working pressure for it.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Guillemin is symmetrical: identical heads lock together, so any two heads of one size connect.',
        'Our Guillemin couplings are Sunpool\'s, from 3/4" to 4", in aluminium or stainless steel. Sunpool does not state which standard they are made to or publish a working pressure, so we confirm it for your duty.',
        'The lock ring stops a connected pair rotating apart; versions with and without it are listed.',
        'Tails: long or short hose shank, spiral hose tail, male thread or female thread (BSP or NPT), plus reducers and dust caps.',
        'It does not connect to a Storz or Barcelona head without an adapter, although all three are symmetrical.',
      ],
    },
    {
      type: 'lead',
      html: 'Guillemin is to French industry what Storz is to German: a symmetrical coupling that removes the male-female problem by making both halves the same. It is the standard head on fire and water hose across France and the francophone markets we ship to, and it turns up on European tankers and plant hose wherever a French specification was written. The things worth knowing before ordering are the <strong>lock ring</strong> and the <strong>tail</strong> — the face looks after itself.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Two identical heads.',
      anchor: 'symmetrical',
    },
    {
      type: 'paragraph',
      html: 'Each Guillemin head carries a gasket and a set of ramps and claws on its face. Two heads of the same size are offered face to face and turned against each other; the claws ride up the ramps and pull the gaskets together. Because every head is identical, a reel of hose can be joined in any order and a spare head fits either end. That symmetry is the reason symmetrical couplings dominate fire service — at a hydrant nobody wants to be holding the wrong half.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Guillemin, Storz and Barcelona do not mix.',
      body: 'All three are symmetrical, and none connects to the others. A site or fleet that crosses a border with its hose should carry adapters for the pattern on the other side, not assume a symmetrical head is a universal one.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'The lock ring.',
      anchor: 'lock-ring',
    },
    {
      type: 'paragraph',
      html: 'A connected Guillemin pair is held by friction and the cam of its claws. On a hose that is dragged, twisted or vibrated, that can unwind. The <strong>lock ring</strong> is a rotating collar that, once set, stops the heads turning back. Our listings carry heads with a lock ring on the hose-shank, spiral-tail and male-thread versions and the dust cap, and adapters without one; on any hose that moves in service, the ring is worth specifying.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Choosing the tail.',
      anchor: 'tails',
    },
    {
      type: 'comparison_table',
      caption: 'Guillemin parts in our range (3/4" – 4")',
      columns: ['Part', 'Back end', 'Lock ring'],
      rows: [
        { cells: ['Coupling, long hose shank', 'Barbed shank for bands', 'Yes'], highlight: true },
        { cells: ['Coupling, short shank', 'Short barbed shank', 'Yes'] },
        { cells: ['Coupling, spiral hose tail', 'Tail for spiral suction hose', 'Yes'] },
        { cells: ['Coupling, male thread × spiral tail', 'Male thread', 'As listed'] },
        { cells: ['Adapter, male thread', 'Male BSP or NPT', 'With or without'] },
        { cells: ['Adapter / coupling, female thread', 'Female BSP or NPT', 'Adapter: without'] },
        { cells: ['Reducing adapter', 'Guillemin face, two sizes', '—'] },
        { cells: ['Dust cap', 'Solid', 'Yes'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The spiral hose tail is made for suction hose with a rigid helix, where a plain barb would not seat. Reducers join two Guillemin sizes directly — our listing runs from 1-1/4" × 1" to 6" × 4". Sunpool publishes no working pressure for the range, and the gasket sits in the face of each head.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'The tail sets the assembly rating.',
      body: 'A Guillemin head on a shank held by a single band is only as strong as that band. Clamp the tail for the pressure the hose will see and mark the assembly at its weakest part.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Is a Guillemin coupling male or female?',
          answer:
            'Neither. Guillemin is symmetrical: every head is identical, so any two heads of the same size lock together.',
        },
        {
          question: 'Which standard covers Guillemin couplings?',
          answer:
            'NF E 29-572 is the French standard for the Guillemin system. Sunpool does not state which standard its parts are made to, so tell us if your specification names one.',
        },
        {
          question: 'Does a Guillemin coupling connect to a Storz coupling?',
          answer:
            'No. Both are symmetrical, but the faces are different patterns. Joining them needs an adapter with one face of each.',
        },
        {
          question: 'What sizes and materials are available?',
          answer:
            'Our listings run from 3/4" to 4" in aluminium or stainless steel, with reducing adapters up to 6" × 4". Sunpool publishes no working pressure for them, so we confirm it for your duty.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Guillemin couplings and adapters',
      skus: [
        'IH-GUI-GUILLEMIN-COUPLING-LONG-HOSE-SHANK',
        'IH-GUI-GUILLEMIN-COUPLING-SHORT-SHANK',
        'IH-GUI-GUILLEMIN-COUPLING-SPIRAL-HOSE-TAIL',
        'IH-GUI-GUILLEMIN-ADAPTER-MALE-THREAD',
        'IH-GUI-GUILLEMIN-ADAPTER-FEMALE-THREAD',
        'IH-GUI-GUILLEMIN-ADAPTER-REDUCING-TYPE',
        'IH-GUI-GUILLEMIN-DUST-CAP',
      ],
    },
    {
      type: 'category_link',
      slug: 'guillemin-couplings',
      label: 'Guillemin couplings',
      blurb: 'Guillemin heads, adapters, reducers and caps, 3/4" to 4".',
    },
    {
      type: 'category_link',
      slug: 'storz-couplings',
      label: 'Storz couplings',
      blurb: 'The German symmetrical coupling, sized by lug distance.',
    },

    {
      type: 'cta_block',
      heading: 'Supplying a French specification?',
      body: 'Tell us the hose bore, the tail you need and whether the joint must lock. We will quote the heads, adapters and caps, and an adapter to whatever the other end runs.',
      quoteLabel: 'Quote Guillemin couplings',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Sizes, materials, rating, lock-ring options and standard checked against our Guillemin listings.',
    },
  ],
}

export default ARTICLE
