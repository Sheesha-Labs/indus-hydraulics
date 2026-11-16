import type { BlogArticleSeed } from '../shared'

import { UBEND_RANGE } from '../tables'

/**
 * U-bend tubes. Sources: approved rule D6 (1.5×OD bendable, tolerances from 2×OD, wall thinning per the
 * governing spec never a single %, bend heat treatment to order, legs ~12 m), and approved data for the
 * U-bend listings (A688/A556/B395 tests, duplex ferrite 40–60 % and A923 on smallest radius, A262 on the
 * smallest heat-treated bend, B395 hydro/pneumatic, mercurous nitrate/ammonia vapour for brasses).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'u-bend-tubes-bend-radius-wall-thinning',
  title: 'U-bend tubes: bend radius, wall thinning and heat treatment',
  excerpt:
    'U-tubes are ordered as a bend schedule, not a size. What the minimum bend radius is, how wall thinning and ovality are controlled, when bends are heat treated and tested, and what to put on the order — for carbon, alloy, stainless, nickel-alloy and copper-alloy U-tubes.',
  categorySlug: 'heat-transfer-tubes',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'U-Bend Tubes: Radius and Wall Thinning',
  seoDescription:
    'How U-bend heat exchanger tubes are specified: minimum bend radius, wall thinning, heat treatment of bends, tests and the bend schedule to order.',
  focusKeyword: 'u bend tubes',
  publishedAt: '2026-11-16T08:50:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A U-tube order is a bend schedule: centreline radius and leg length for every row of the bundle.',
        'A 1.5 × OD centreline radius can be bent; dimensional tolerances are guaranteed from 2 × OD.',
        'The wall thins on the outside of the bend. The allowance is the one in the specification on the order — ASTM A688, A556, B395 or TEMA — not a single percentage.',
        'Stainless, duplex and some alloy bends are heat treated to order, and the smallest bend is used to qualify it.',
        'Each U-tube is pressure tested after bending where the specification requires it.',
      ],
    },
    {
      type: 'lead',
      html: 'In a U-tube bundle each tube is bent back on itself, so the bundle has one tube sheet and expands freely. The price of that convenience is the bend: the tightest rows in the middle of the bundle are bent to a small radius, the wall thins and the tube ovalises there, and the bend region is where cracking and corrosion start if the bend is not made and treated properly.',
    },
    {
      type: 'direct_answer',
      question: 'What is the minimum bend radius for U-bend tubes?',
      answer:
        'A centreline radius of 1.5 times the outside diameter can be bent, but dimensional tolerances — wall thinning and ovality — are guaranteed from 2 × OD. Tighter inner rows therefore need agreement on tolerances. The allowed wall thinning is set by the specification on the order, such as ASTM A688, A556 or B395, or TEMA.',
    },

    { type: 'section_head', number: '/01', title: 'The bend schedule.', anchor: 'schedule' },
    {
      type: 'paragraph',
      html: 'A bundle drawing gives, for each row, the centreline bend radius and the leg length. The order lists those rows with quantities. Legs of about 12 m are usual, and straight tubes are available to 30 m. Rows are packed nested by radius, so they can be pulled out in order at the bundle shop.',
    },

    { type: 'section_head', number: '/02', title: 'Thinning and ovality.', anchor: 'thinning' },
    {
      type: 'paragraph',
      html: 'Bending stretches the outside of the bend and compresses the inside: the outer wall thins and the section goes oval. Both are worst at the smallest radius. The limits are those of the governing specification on the order — ASTM A688 for welded austenitic feedwater-heater tube, A556 for carbon steel feedwater-heater tube, B395 for copper alloys, or TEMA — so we never quote a single thinning percentage. To keep the minimum wall at the bend, order the straight tube to a minimum wall, or a heavier gauge for the tight rows.',
    },

    { type: 'section_head', number: '/03', title: 'Heat treatment of the bend.', anchor: 'heat-treatment' },
    {
      type: 'paragraph',
      html: 'Cold bending leaves residual stress and, in stainless and duplex, can change the structure. Austenitic stainless bends are solution-annealed to order, usually the bend plus part of each leg, to restore corrosion resistance where stress-corrosion cracking is a risk. For duplex bends the qualification tube at the smallest radius is checked for ferrite (40–60 %) and for freedom from sigma phase by ASTM A923 Method A. Where ASTM A688 applies, intergranular corrosion testing by A262 is done on the smallest heat-treated bend. Treatment of chrome-moly bends is agreed with the order.',
    },

    { type: 'section_head', number: '/04', title: 'Testing after bending.', anchor: 'testing' },
    {
      type: 'paragraph',
      html: 'Straight tubes are tested to their base specification before bending. After bending and any heat treatment, each U-tube is pressure tested where the specification calls for it — under A688 and A556 every U-tube; under B395 hydrostatically or pneumatically. Brass U-tubes are also checked for residual stress by mercurous nitrate or ammonia vapour tests on the bend and leg. Say on the order if every tube must be hydrotested after bending, as some mills only do it on request.',
    },

    { type: 'section_head', number: '/05', title: 'Materials we bend.', anchor: 'range' },
    {
      type: 'comparison_table',
      caption: 'U-bend tube in the catalogue (live listings)',
      columns: ['Listing', 'Grades', 'Standards', 'OD'],
      rows: UBEND_RANGE.map((r) => ({ cells: r.cells.slice(0, 4) })),
    },
    {
      type: 'paragraph',
      html: 'For low-fin U-tubes, see <a href="/blog/integral-low-fin-tubes-condenser-retubing">integral low-fin tube</a>. Pipe-size return bends to ASME B16.9 and MSS SP-43 are listed as <a href="/p/return-bends-short-and-long-radius">return bends</a>.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the minimum bend radius of a U-tube?', answer: '1.5 × OD can be bent; tolerances are guaranteed from 2 × OD.' },
        { question: 'How much does the wall thin at a U-bend?', answer: 'It depends on the radius and the tube. The allowance is the one in the governing specification on the order (A688, A556, B395 or TEMA).' },
        { question: 'Are stainless U-bends heat treated?', answer: 'To order. Solution annealing of the bend and part of the legs is common where stress-corrosion cracking is a concern.' },
        { question: 'Is every U-tube hydrotested?', answer: 'Where the specification requires it, such as A688 and A556. Otherwise state it on the order.' },
        { question: 'How long can the legs be?', answer: 'Legs of about 12 m are usual; straight tubes are available to 30 m.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'U-tubes in the catalogue',
      skus: ['IH-TF-UC-CS', 'IH-TF-UA-AL', 'IH-TF-US-AUS', 'IH-TF-UN-NI', 'IH-TF-UK-CUA', 'IH-TF-FW-FWH'],
    },
    { type: 'category_link', slug: 'u-bend-tubes', label: 'U-bend tubes', blurb: 'Carbon, alloy, stainless, nickel-alloy, copper-alloy and finned U-tubes.' },
    {
      type: 'related_articles',
      slugs: ['heat-transfer-tube-buyers-guide', 'integral-low-fin-tubes-condenser-retubing'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-16',
      note: 'Bend rules from our approved data; tests from ASTM A688, A556, B395 and A923 scope as listed.',
    },
    {
      type: 'cta_block',
      heading: 'Send the bend schedule',
      body: 'Rows, radii, leg lengths, grade, OD and wall. We quote U-tubes with mill certificates and the tests you need.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
