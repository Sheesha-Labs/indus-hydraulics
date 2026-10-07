import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Tensioner and compensator hose, read from the three listings. The listings
 * give API Spec 7K as a cross-reference; the article says cross-reference and
 * does not claim certification. They also cited API 17J — unbonded flexible
 * pipe, not a bonded tensioner hose — until the 2026-10-06 listing fixes.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'riser-tensioner-and-compensator-hose',
  title: 'Riser tensioner and compensator hose: the hose that cycles with the sea',
  excerpt:
    'On a floating rig, tensioner and compensator hoses flex with every wave. What they are built from, the 5,000 psi rating on our listings, and why cycle count, not pressure, decides their life.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T15:20:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What is a riser tensioner hose?',
      answer:
        'It is the high-pressure hydraulic hose between a floating rig\'s riser tensioner cylinders and their accumulators, which flexes as the tensioners stroke with the vessel\'s motion. Drill string compensator hose does the same job for the compensator. Ours are rated 5,000 psi working with a 12,500 psi minimum burst, built with multiple heavy-cycle steel cable plies, flanged, from 2" to 4".',
    },
    {
      type: 'key_takeaways',
      items: [
        'Tensioner and compensator hoses flex continuously with vessel motion, so cycle life is the governing property.',
        'Our three listings are 5,000 psi WP and 12,500 psi minimum burst, −30 to +82 °C.',
        'Riser tensioner and drill string compensator hoses run 2" to 4"; the general tensioner and compensator assemblies 1" to 4".',
        'Liners are hydraulic-fluid-compatible synthetic rubber; reinforcement is multiple high-tensile steel cable plies, heavy-cycle rated.',
        'Inspect for cover damage and end movement at every opportunity, and replace on age and cycle count, not only on condition.',
      ],
    },
    {
      type: 'lead',
      html: 'On a floating drilling rig the riser has to stay in tension while the vessel heaves, and the drill string has to stay steady on bottom while the derrick rises and falls. Hydraulic tensioners and compensators do that, stroking with every wave, and the hoses that feed them <strong>flex with every stroke</strong>. Few hoses anywhere see as many working cycles, which is what this family is built for.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'What the hose does.',
      anchor: 'duty',
    },
    {
      type: 'paragraph',
      html: 'Tensioner and compensator systems store energy in high-pressure gas-over-oil accumulators and move hydraulic fluid in and out of cylinders as the vessel moves. The hoses that link them carry that fluid at pressure while bending and straightening thousands of times a day. Pressure is steady and moderate by oilfield standards; the cycle count is enormous, and it is fatigue at the reinforcement and the end fittings that ends a hose\'s life.',
    },
    {
      type: 'comparison_table',
      caption: 'Our tensioner and compensator hoses',
      columns: ['Hose', 'Rating', 'Bore', 'Temperature'],
      rows: [
        { cells: ['Riser tensioner hose', '5,000 psi WP, 12,500 psi MBP', '2" – 4"', '−30 to +82 °C'], highlight: true },
        { cells: ['Drill string compensator hose', '5,000 psi WP, 12,500 psi MBP', '2" – 4"', '−30 to +82 °C'] },
        { cells: ['Hydraulic tensioner and compensator assemblies', '5,000 psi WP, 12,500 psi MBP', '1" – 4"', '−30 to +82 °C'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'How it is built.',
      anchor: 'construction',
    },
    {
      type: 'paragraph',
      html: 'All three are built with a hydraulic-fluid-compatible synthetic rubber liner and multiple plies of high-tensile steel cable, listed as heavy-cycle rated on the riser tensioner and drill string compensator hoses, with flanged couplings. The 2.5:1 ratio between working pressure and minimum burst on our listings is the same as on API 7K rotary hose, and our listings give API Spec 7K as a cross-reference for the family.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Cycle count decides the life.',
      anchor: 'life',
    },
    {
      type: 'paragraph',
      html: 'Because the hose never stops moving, a replacement interval set by calendar alone can be wrong in either direction. A rig in a sheltered location and one in heavy seas put very different cycle counts on the same hose in the same year. Track the hose\'s service — time and conditions — and replace on age and duty, using any failures and inspection findings to refine the interval. Inspect for cover damage, chafe at clamps and guides, movement at the end fittings and weeping at the flanges whenever access allows.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Replace in sets where the duty is shared.',
      body: 'Hoses on the same tensioner system have usually seen the same cycles. When one fails from fatigue, the others are not far behind — and replacing them together during a planned window is cheaper than one at a time between wells.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Ordering a replacement.',
      anchor: 'ordering',
    },
    {
      type: 'paragraph',
      html: 'Send the system (tensioner or compensator), the bore, the length, the flange type and rating at each end, the fluid and the documentation the rig requires. These are certified assemblies built and tested as complete units, not field builds. The wider picture of rig hose standards is in the <a href="/blog/oilfield-hose-guide">oilfield hose guide</a>.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What pressure is riser tensioner hose rated for?',
          answer:
            'Ours is rated 5,000 psi working with a 12,500 psi minimum burst, from 2" to 4".',
        },
        {
          question: 'What is the difference between tensioner and compensator hose?',
          answer:
            'They serve different systems — the riser tensioners and the drill string compensator — but share the construction and rating on our listings: 5,000 psi, steel cable plies, flanged.',
        },
        {
          question: 'Why do tensioner hoses fail?',
          answer:
            'Mostly fatigue from continuous flexing, at the reinforcement and the end fittings, plus external damage at clamps and guides. Cycle count matters more than pressure.',
        },
        {
          question: 'Which standards apply?',
          answer:
            'Our listings give API Spec 7K as a cross-reference for this family. Specify the standard and documents your rig requires with the order.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Tensioner and compensator hose',
      skus: ['IH-OG-TC-001', 'IH-OG-TC-002', 'IH-OG-TC-003'],
    },
    {
      type: 'category_link',
      slug: 'tensioner-compensator-hoses',
      label: 'Tensioner and compensator hose',
      blurb: 'Riser tensioner, drill string compensator and tensioner assemblies.',
    },
    {
      type: 'category_link',
      slug: 'drilling-hoses',
      label: 'Drilling hose',
      blurb: 'API 7K rotary, vibrator and mud booster hose.',
    },

    {
      type: 'cta_block',
      heading: 'Replacing tensioner or compensator hoses?',
      body: 'Send the system, bore, length, flanges, fluid and the document clause. We will quote the certified assemblies.',
      quoteLabel: 'Quote tensioner hose',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Ratings, bores, temperatures and construction checked against our tensioner and compensator hose listings.',
    },
  ],
}

export default ARTICLE
