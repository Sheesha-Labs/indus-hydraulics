import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Steam hose connections, read from the eight ground joint listings, the steam
 * hose listings (temperatures, safety factor) and the EN 14423 and
 * EN 14420-3 / DIN 2817 clamp listings.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'ground-joint-steam-couplings',
  title: 'Ground joint steam couplings: the metal seat that has no gasket to fail',
  excerpt:
    'A steam hose connection has to survive 170 °C and more without a rubber seal. How a ground joint coupling seals metal to metal, the parts that make one, and the clamps that hold it to the hose.',
  categorySlug: 'industrial-hose',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T10:10:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What is a ground joint coupling?',
      answer:
        'A ground joint coupling is a steam and air hose coupling that seals metal to metal, with no gasket. A hose stem with a ground spherical seat is drawn against a matching spud by a wing nut, so there is no rubber in the joint to harden or blow out at steam temperature. Our plated-iron ground joint couplings run from 1/2" to 4"; Sealfast publishes no pressure rating for them, so we confirm one for your steam duty.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Ground joint couplings seal on a metal seat with no gasket, which is why they suit steam.',
        'A complete set is a hose stem, a wing nut and a male or female spud; double spuds and NPT male stems complete the range.',
        'Our plated-iron ground joint parts run from 1/2" to 4"; Sealfast publishes no pressure rating, so confirm one for your steam pressure before ordering.',
        'The stem is held in the hose by a bolted clamp sized to the hose OD — never a worm-drive band on steam.',
        'European steam couplings use a different system: EN 14420-3 / DIN 2817 safety clamps and EN 14423 clamp couplings.',
      ],
    },
    {
      type: 'lead',
      html: 'Steam is the duty that finds the weakest part of a hose assembly fastest, and the weakest part is rarely the hose. Our saturated steam hoses are built for it — a 10:1 safety factor, EPDM tubes, pin-pricked covers rated to 170 °C and, on the 18 bar hose, to 210 °C. The coupling has to match that, and the reason the ground joint is the classic steam coupling is simple: <strong>it has no gasket</strong>, so there is no rubber in the joint to cook.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'How a ground joint seals.',
      anchor: 'how-it-seals',
    },
    {
      type: 'paragraph',
      html: 'The hose stem ends in a ground, spherical seat. The spud — male, female or double — carries the matching seat. A wing nut on the stem threads onto the spud and draws the two seats together, metal against metal. Because the seat is spherical, it seals even when the hose pulls slightly off line, and because there is no gasket, heat and pressure that would harden or extrude rubber have nothing to attack. The wing nut is struck with a hammer to make up and break the joint, which is why it carries lugs.',
    },
    {
      type: 'comparison_table',
      caption: 'Ground joint parts in our range (plated iron)',
      columns: ['Part', 'What it does', 'Sizes'],
      rows: [
        { cells: ['Hose stem', 'Goes into the hose; carries the ground seat', '1/2" – 4"'], highlight: true },
        { cells: ['Wing nut', 'Draws the stem onto the spud', '1/2" – 4"'] },
        { cells: ['Male spud / female spud', 'Mates with the stem; threads to pipe or valve', '1/2" – 2" / 1/2" – 4"'] },
        { cells: ['Double spud', 'Joins two stems — hose to hose', '3/4" – 2"'] },
        { cells: ['NPT male stem', 'Ground seat on a male NPT body', '1/2" – 4"'] },
        { cells: ['Complete set', 'Stem, wing nut and spud', '1/2" – 4"'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Ratings, and what limits them.',
      anchor: 'ratings',
    },
    {
      type: 'paragraph',
      html: 'Sealfast does not publish a pressure rating for its ground joint parts, so tell us the steam pressure and temperature and we will confirm one with the manufacturer. The hose sets the assembly too: our black saturated steam hose is a 10 bar hose and our high-pressure red hose 18 bar, both at a 10:1 safety factor, and the 7 bar steam and hot-water hose is rated to 170 °C on steam and 95 °C on hot water. Check a spud already plumbed on a plant against our stems before mixing makers\' parts.',
    },
    {
      type: 'comparison_table',
      caption: 'Our steam hoses',
      columns: ['Hose', 'Working pressure', 'Temperature (listing)'],
      rows: [
        { cells: ['Steam, hot water and food hose', '7 bar', '−20 to +170 °C steam; +95 °C hot water'] },
        { cells: ['Black saturated steam hose', '10 bar', '−20 to +170 °C'] },
        { cells: ['High-pressure red saturated steam hose', '18 bar', '−40 to +210 °C, intermittent 232 °C'], highlight: true },
      ],
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Holding the stem in the hose.',
      anchor: 'clamping',
    },
    {
      type: 'paragraph',
      html: 'The seat looks after the joint; the clamp looks after the hose. Steam softens rubber and the hose wall relaxes over the stem as it cycles hot and cold, so a stem held by a worm-drive band loosens with every shift. Use a bolted clamp sized to the hose outside diameter — the universal clamps on our ground joint shelf are listed by OD range, from 11/16"–7/8" up to 4-7/8"–5-5/16" — and re-tighten after the first heat cycle, when the rubber takes its set.',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Never break a steam joint under pressure.',
      body: 'Isolate, vent and let the line cool before striking the wing nut. A ground joint that is opened with steam behind it releases it at the operator\'s hands, and the stem can be driven out of a relaxed hose.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'The European alternative.',
      anchor: 'european',
    },
    {
      type: 'paragraph',
      html: 'European plant tends to use a different system: a threaded hose fitting secured in the hose by an <strong>EN 14420-3 / DIN 2817 safety clamp</strong> — a forged two-part clamp bolted around the hose over a collar on the fitting — or clamp couplings to <strong>EN 14423</strong>, the standard written for steam hose couplings. Both are on our clamps shelf, in aluminium, brass or 316 stainless for the DIN 2817 clamp and brass or 316 for the EN 14423 clamp. Pick one system per plant; mixing them means two sets of spares and two ways to get it wrong.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Does a ground joint coupling need a gasket?',
          answer:
            'No. It seals on a ground metal seat between the hose stem and the spud, which is why it suits steam.',
        },
        {
          question: 'What pressure is a ground joint coupling rated for?',
          answer:
            'Sealfast does not publish a pressure rating for its plated-iron ground joint parts; tell us the steam pressure and we will confirm one with the manufacturer. The hose and the clamp usually set a lower limit for the assembly.',
        },
        {
          question: 'Can I use a worm-drive clamp on a steam hose?',
          answer:
            'No. Use a bolted clamp sized to the hose OD and re-tighten after the first heat cycle, or a DIN 2817 safety clamp on a European fitting.',
        },
        {
          question: 'What is EN 14423?',
          answer:
            'The European standard for clamp couplings used on steam hose. Our EN 14423 clamps are listed in brass or 316 stainless.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Ground joint couplings',
      skus: [
        'IH-GJ-GROUND-JOINT-COMPLETE-SET',
        'IH-GJ-GROUND-JOINT-HOSE-STEM',
        'IH-GJ-GROUND-JOINT-WING-NUT',
        'IH-GJ-GROUND-JOINT-FEMALE-SPUD',
        'IH-GJ-GROUND-JOINT-MALE-SPUD',
        'IH-GJ-GROUND-JOINT-DOUBLE-SPUD',
        'IH-GJ-UNIVERSAL-CLAMPS',
      ],
    },
    {
      type: 'product_embed',
      heading: 'Steam hose and European steam clamps',
      skus: ['IH-IH-A230', 'IH-IH-A235BK', 'IH-CLP-EN-14423', 'IH-CLP-SAFETY-14420-3'],
    },
    {
      type: 'category_link',
      slug: 'ground-joint-couplings',
      label: 'Ground joint couplings',
      blurb: 'Plated-iron stems, wing nuts, spuds and clamps for steam and air, 1/2" to 4".',
    },
    {
      type: 'category_link',
      slug: 'industrial-steam-hoses',
      label: 'Industrial steam hose',
      blurb: '7, 10 and 18 bar saturated steam hose at a 10:1 safety factor.',
    },

    {
      type: 'cta_block',
      heading: 'Specifying a steam hose assembly?',
      body: 'Tell us the steam pressure, the bore and the connection on the plant. We will quote the hose, the couplings and the clamps as one assembly, tested and tagged.',
      quoteLabel: 'Quote a steam assembly',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Coupling parts, sizes, ratings and steam hose figures checked against our ground joint, steam hose and clamp listings.',
    },
  ],
}

export default ARTICLE
