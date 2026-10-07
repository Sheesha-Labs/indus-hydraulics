import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Composite hose and its fittings, read from the four composite hose listings
 * and the six composite fittings (EN 13765:2015).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'composite-hose-explained',
  title: 'Composite hose explained: films, wires and the fittings that thread into them',
  excerpt:
    'Composite hose has no bonded rubber at all — just layers of film and fabric between two wires. How it is built, why it is lighter and warns before it fails, and why it needs its own fittings.',
  categorySlug: 'industrial-hose',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T11:30:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What is composite hose?',
      answer:
        'Composite hose is built from many layers of polymer film and fabric clamped between an internal and an external wire helix, with no bonded rubber. The films are chosen for the product, the wires give strength and shape, and the hose is lighter than rubber of the same bore. Our composite hoses are made to EN 13765 and rated 14 or 20 bar from 1" to DN100, for oil, chemicals and vapour recovery.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Composite hose is unbonded: films and fabrics held between an inner and an outer wire, not a vulcanised rubber wall.',
        'It is lighter than rubber of the same bore and tends to weep before it fails outright.',
        'Our range: oil (A901GG) and chemical (A906PG) composite at 20 bar, PTFE chemical (A911SG) at 20 bar to +120 °C, vapour recovery (A901AG) at 14 bar to EN 13765:2015 Type 3.',
        'Composite hose needs composite fittings: spiral tails that thread into the internal wire, held by a ferrule or lug nut.',
        'It is less tolerant of crushing and dragging than rubber, and rewards proper handling and storage.',
      ],
    },
    {
      type: 'lead',
      html: 'Composite hose is the one industrial hose that is not a rubber hose with something added. It has <strong>no bonded wall at all</strong> — just layers of film and fabric wrapped between two steel or aluminium wires and sealed into the fittings at each end. That construction is why it is light, why its liner can be matched to the product, and why its fittings are a different part from everything else on the shelf.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'How it is built.',
      anchor: 'construction',
    },
    {
      type: 'paragraph',
      html: 'An internal wire helix sits in the bore and gives the hose its shape and suction strength. Over it go layers of polymer film — polypropylene, polyethylene, polyester and, in the PTFE grade, a PTFE lining — and layers of fabric for strength. An external wire helix wound between the internal turns clamps the whole stack together, and a weatherproof PVC cover finishes it. Because nothing is vulcanised, the films can be selected for the product being carried.',
    },
    {
      type: 'comparison_table',
      caption: 'Our composite hoses',
      columns: ['Hose', 'Rating', 'Sizes', 'Temperature'],
      rows: [
        { cells: ['A901GG oil composite', '20 bar, 80 bar burst, SF 4:1', '1" – DN100', '−30 to +80 °C'] },
        { cells: ['A906PG chemical composite', '20 bar, 80 bar burst, SF 4:1', '1" – DN100', '−30 to +80 °C'] },
        { cells: ['A911SG PTFE chemical composite', '20 bar, 80 bar burst, SF 4:1', '1" – DN100', '−30 to +120 °C'], highlight: true },
        { cells: ['A901AG vapour recovery', '14 bar, 56 bar burst, EN 13765:2015 Type 3', 'DN75, DN100', '−30 to +80 °C'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Why it is used.',
      anchor: 'why',
    },
    {
      type: 'paragraph',
      html: 'Two properties matter on a transfer job. It is <strong>lighter</strong> than a rubber hose of the same bore, which counts on hoses handled by people at a tanker, a rail car or a ship\'s manifold rather than by a crane. And it tends to <strong>weep before it fails</strong>: a damaged layer leaks slowly instead of letting go suddenly, which on flammable or aggressive transfer is worth a great deal. The vapour recovery grade adds an internal aluminium wire and polypropylene layers for returning fuel vapour to a tank.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Fittings that thread into the wire.',
      anchor: 'fittings',
    },
    {
      type: 'paragraph',
      html: 'A rubber hose is gripped by squeezing its wall onto a barb. Composite hose has no wall to squeeze, so its fittings engage the wire instead: a <strong>spiral tail</strong> is threaded into the hose along the internal helix, and a ferrule or a lug nut on a female liner clamps the films and the outer wire down onto it. Our composite fittings — cam lock C and E with spiral tails, SS female liners with lug nuts, hex male tails with BSP or BSPT threads and a flanged tail to ASME B16.5 — are listed to EN 13765:2015 Type 3; Sunpool publishes no working pressure for the fittings themselves, so the assembly is rated with the hose. Stainless versions are supplied with 3.1 certificates and leak-tested.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A rubber-hose shank will not hold composite.',
      body: 'A barbed shank and a band clamp cannot grip an unbonded film stack, and the hose can pull off under pressure. Use fittings made for composite hose, assembled to the maker\'s procedure.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Handling and storage.',
      anchor: 'handling',
    },
    {
      type: 'paragraph',
      html: 'The trade-off is toughness. Composite is less tolerant of being crushed, dragged over a quay edge or driven over than a rubber hose of the same bore. Support it on saddles where it crosses an edge, keep it off sharp ground, store it straight or on a reel rather than kinked, and inspect the outer wire and cover for crushing after every job. A kink or a crushed section is a reason to retire the length.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Which standard covers composite hose?',
          answer:
            'EN 13765. Our vapour recovery composite hose is printed EN 13765:2015 Type 3, and our composite fittings are listed to the same standard.',
        },
        {
          question: 'Is composite hose stronger than rubber hose?',
          answer:
            'Not in toughness. It is lighter and tends to weep before failing, but it tolerates crushing, dragging and kinking less well than rubber.',
        },
        {
          question: 'Can I fit a standard cam lock to composite hose?',
          answer:
            'Only one made for composite hose, with a spiral tail that engages the internal wire. Our cam lock C and E spiral-tail fittings are made for exactly that.',
        },
        {
          question: 'What temperature can composite hose take?',
          answer:
            'Our oil, chemical and vapour recovery composites are rated −30 to +80 °C; the PTFE chemical composite is rated to +120 °C.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Composite hose',
      skus: ['IH-IH-A901GG', 'IH-IH-A906PG', 'IH-IH-A911SG', 'IH-IH-A901AG'],
    },
    {
      type: 'product_embed',
      heading: 'Composite hose fittings',
      skus: [
        'IH-COMP-CAMLOCK-TYPE-C-X-SPIRAL-TAIL-FOR-COMPOST',
        'IH-COMP-CAMLOCK-TYPE-E-X-SPIRAL-TAIL-FOR-COMPOSI',
        'IH-COMP-COMPOSITE-HOSE-FEMALE-LINER',
        'IH-COMP-LUG-NUT-FOR-FEMALE-LINER',
        'IH-COMP-HEX-MALE-COMPOSITE-HOSE-FITTING',
        'IH-COMP-SPIRAL-HOSE-TAIL-X-FLANGE',
      ],
    },
    {
      type: 'category_link',
      slug: 'composite-hoses',
      label: 'Composite hose',
      blurb: 'Oil, chemical, PTFE chemical and vapour recovery composite hose.',
    },
    {
      type: 'category_link',
      slug: 'composite-hose-fittings',
      label: 'Composite hose fittings',
      blurb: 'Spiral-tail cam locks, liners, lug nuts and flanged tails to EN 13765.',
    },

    {
      type: 'cta_block',
      heading: 'Need a composite assembly built?',
      body: 'Tell us the product, the bore, the length and the coupling. We will quote the hose and fittings as a tested assembly.',
      quoteLabel: 'Quote composite hose',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Ratings, sizes, constructions and fitting details checked against our composite hose and fittings listings.',
    },
  ],
}

export default ARTICLE
