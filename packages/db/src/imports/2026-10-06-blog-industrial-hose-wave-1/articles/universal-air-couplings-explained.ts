import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Universal (Chicago / claw) and crowfoot couplings, read from 17 universal and
 * 7 crowfoot listings: lug counts by size, the three regional types, threads,
 * ratings, washers, safety clips and whip checks.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'universal-air-couplings-explained',
  title: 'Universal air couplings explained: Chicago, claw and crowfoot, and the clip that holds them',
  excerpt:
    'The two-lug claw coupling on every compressor hose is called universal, Chicago and crowfoot, and it comes in American, European and Australian types. How they fit together, and what keeps one from letting go.',
  categorySlug: 'industrial-hose',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T09:50:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What is a universal air coupling?',
      answer:
        'A universal air coupling — also called a Chicago, claw or crowfoot coupling — is a symmetrical claw coupling for compressed air and water hose. Heads of a type share the same lugs and a washer, so they lock together with a quarter turn; the two-lug heads from 1/4" to 1" lock to one another whatever the hose size behind them. Larger sizes use four lugs. Because a hose that separates under air pressure whips violently, the joint should carry a safety clip and the hose a whip check.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Universal, Chicago, claw and crowfoot are names for the same symmetrical claw coupling family.',
        'Two lugs on the small sizes, four lugs on the large: our American and Australian types use two lugs to 1" and four from 1-1/4" to 2".',
        'American, European and Australian types are separate patterns; match the type before relying on a connection.',
        'Sealfast rates its four-lug hose end and stainless blank and triple ends at 150 psi at 70 °F and publishes no rating for the other crowfoot parts — check the part.',
        'Fit a safety clip across every claw joint and a whip check across the hose; air stores energy that oil does not.',
      ],
    },
    {
      type: 'lead',
      html: 'Walk any site in the region and the compressor hoses end in the same four-pointed claw: the universal coupling, called Chicago in the US and crowfoot by half the fitters who use it. Its appeal is that one head fits every other head of its type, whatever hose sits behind it, so a breaker, a drill and a blowgun all plug into the same line. Its risk is that a compressed-air hose that parts under pressure <strong>whips with enough energy to injure</strong> — which is what the clip and the cable are for.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'One head fits every head.',
      anchor: 'symmetrical',
    },
    {
      type: 'paragraph',
      html: 'Each universal head carries lugs and a ramp, and an NBR washer in its face. Offered face to face and turned, two heads lock as the lugs ride the ramps and compress the washers. Because the two-lug claw is the same from 1/4" to 1" within a type, a 3/4" hose end will lock to a 1/2" hose end — useful on a mixed site, and a reason to check that a small hose is not being run at the flow or pressure of the large line it was clipped to.',
    },
    {
      type: 'comparison_table',
      caption: 'Lug counts by size in our range',
      columns: ['Type', 'Two lugs', 'Four lugs'],
      rows: [
        { cells: ['American', '1/4" – 1"', '1-1/4" – 2" (hose, male and female ends)'], highlight: true },
        { cells: ['Australian', '1/4" – 1-1/4" (by part)', '1-1/4" – 2" (hose, male and female ends)'] },
        { cells: ['European', '1/4" – 2"', '—'] },
        { cells: ['Crowfoot (zinc-plated iron)', '—', '1-1/4" – 2"'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Three types, and the ends each one comes in.',
      anchor: 'types',
    },
    {
      type: 'paragraph',
      html: 'Our listings carry American, European and Australian universal couplings, each as a hose end, a male-thread end, a female-thread end, a blank end and, for the American and Australian types, a 3-way. The threads follow the type: the American male and female ends are NPT or BSPT, the European female end BSPP and the European male end BSPT. Materials are carbon steel, brass and stainless across the types, with malleable iron on the American and European parts. Treat the three as separate patterns and keep one on a site where you can.',
    },
    {
      type: 'paragraph',
      html: 'Our crowfoot range covers zinc-plated iron four-lug hose ends and female NPT ends from 1-1/4" to 2", and 316 stainless hose, male NPT, female NPT, blank and triple-connection ends from 1/2".',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Ratings, and why air is the dangerous one.',
      anchor: 'ratings',
    },
    {
      type: 'paragraph',
      html: 'Sealfast rates the four-lug hose end and the stainless blank and triple ends at 150 psi at 70 °F, and publishes no rating for the other hose and NPT ends. Read the rating of the part in your hand, not the family. Then remember why the rating is not the whole story on air: compressed air is a stored spring. When a claw joint or a hose end lets go, the hose is driven by the expanding air behind it, and a whipping hose end causes injuries that a hydraulic leak, for all its own dangers, does not.',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Clip every joint, restrain every hose.',
      body: 'Our crowfoot listings say it directly: use safety clips with all universal crowfoot couplings. A clip through the lug holes stops a joint twisting apart; a whip check cable across the joint or from hose to tool limits how far a separated end can travel. Neither replaces turning the air off before disconnecting.',
    },
    {
      type: 'paragraph',
      html: 'Our safety whip checks come in hose-to-hose and hose-to-tool versions, in carbon steel or 304 stainless, from a 1/8" cable 12" long up to a 3/8" cable 44" long. Choose the cable by the hose size and the length by the joint it spans.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Is a Chicago coupling the same as a universal coupling?',
          answer:
            'Yes. Chicago, universal, claw and crowfoot are names for the same symmetrical claw coupling family. Our crowfoot listings are made to interchange with Chicago and universal couplings.',
        },
        {
          question: 'Will a European universal coupling connect to an American one?',
          answer:
            'Treat them as separate patterns. Our listings carry American, European and Australian types with different threads and lug arrangements; match the type before relying on a connection.',
        },
        {
          question: 'What pressure is a crowfoot coupling rated for?',
          answer:
            'Sealfast rates the four-lug hose end and the stainless blank and triple ends at 150 psi at 70 °F and publishes no rating for the other crowfoot parts. Use the rating of the specific part, and ask us where none is published.',
        },
        {
          question: 'Do I need a safety clip and a whip check?',
          answer:
            'On compressed air, yes. The clip stops the joint twisting apart; the whip check limits a separated hose. Our listings carry both.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Universal couplings and crowfoot ends',
      skus: [
        'IH-UAC-US-HOSE',
        'IH-UAC-US-MALE',
        'IH-UAC-US-FEMALE',
        'IH-UAC-EU-HOSE',
        'IH-UAC-AU-HOSE',
        'IH-CRW-HOSE-END-CROWFOOT',
        'IH-CRW-FOUR-LUG-HOSE-END-CROWFOOT',
        'IH-UAC-WASHER',
      ],
    },
    {
      type: 'product_embed',
      heading: 'Restraint',
      skus: ['IH-UAC-WHIP-HOSE-HOSE', 'IH-UAC-WHIP-HOSE-TOOL'],
    },
    {
      type: 'category_link',
      slug: 'universal-air-couplings',
      label: 'Universal air hose couplings',
      blurb: 'American, European and Australian types, washers and whip checks.',
    },
    {
      type: 'category_link',
      slug: 'crowfoot-couplings',
      label: 'Crowfoot couplings',
      blurb: 'Zinc-plated iron and 316 stainless crowfoot ends, 1/2" to 2".',
    },
    {
      type: 'category_link',
      slug: 'air-water-hoses',
      label: 'Air and water hose',
      blurb: '20 bar air and water hose, and 40 bar high-temperature air hose.',
    },

    {
      type: 'cta_block',
      heading: 'Standardising the air couplings on a site?',
      body: 'Send a photograph of the coupling your compressors and tools already use, with the hose sizes. We will match the type and quote heads, washers, clips and whip checks to suit.',
      quoteLabel: 'Quote air couplings',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Types, lug counts, threads, ratings and whip-check sizes checked against our universal and crowfoot listings.',
    },
  ],
}

export default ARTICLE
