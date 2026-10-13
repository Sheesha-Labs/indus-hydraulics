import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * UHMWPE chemical hose, read from A410 and A416, set against the chemical and
 * PTFE chemical composite hoses. No compatibility verdicts: the listings say
 * "subject to chemical compatibility" and so does the article.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'uhmwpe-chemical-hose',
  title: 'UHMWPE chemical hose: what the lining resists, and what it does not',
  excerpt:
    'Ultra-high molecular weight polyethylene is the lining on most rubber chemical hose. What it gives you, the temperature and pressure limits on our two grades, and when composite or PTFE is the better answer.',
  categorySlug: 'industrial-hose',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T11:20:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What is UHMWPE chemical hose?',
      answer:
        'It is a rubber suction and delivery hose lined with ultra-high molecular weight polyethylene, a smooth, dense plastic that resists a very wide range of acids, alkalis and solvents. The rubber body and steel helices carry the pressure and vacuum; the lining keeps the chemical away from the rubber. Our UHMWPE hoses are rated 10 or 16 bar, 3/4" to 4", −30 to +100 °C subject to chemical compatibility.',
    },
    {
      type: 'key_takeaways',
      items: [
        'The UHMWPE lining is the chemical barrier; the rubber body, textile plies and twin steel helices carry pressure and vacuum.',
        'A410 is rated 10 bar at a 4:1 safety factor; A416 is rated 16 bar at 3:1 and has an FDA-specification conductive lining.',
        'Both run from 3/4" to 4" and from −30 to +100 °C, with +130 °C for intermittent sterilisation — always subject to compatibility.',
        'A copper braided anti-static wire is built in; bond it to the couplings.',
        'For the most aggressive media, or temperatures above the rubber body\'s limit, look at PTFE composite or PTFE-lined hose.',
      ],
    },
    {
      type: 'lead',
      html: 'Most rubber chemical hose sold today is not really a rubber hose on the inside. It is lined with UHMWPE — ultra-high molecular weight polyethylene — and the rubber is there to carry pressure, hold the helix and survive being dragged. That division of labour is why it handles such a broad range of chemicals, and it is also why <strong>the lining\'s limits are the hose\'s limits</strong>.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'What the lining does.',
      anchor: 'lining',
    },
    {
      type: 'paragraph',
      html: 'UHMWPE is dense, smooth and chemically inert to a very wide range of acids, alkalis and many solvents, which is why it is the standard lining for multipurpose chemical transfer. A smooth bore also drains and cleans well. Behind it, our A410 and A416 carry high-tensile textile plies, twin carbon steel wire helices for suction, and a copper braided anti-static wire, under a blue EPDM cover resistant to ozone and weather.',
    },
    {
      type: 'comparison_table',
      caption: 'Our UHMWPE chemical hoses',
      columns: ['Property', 'A410', 'A416'],
      rows: [
        { cells: ['Working / burst pressure', '10 / 40 bar', '16 / 48 bar'] },
        { cells: ['Safety factor (listing)', '4:1', '3:1'] },
        { cells: ['Sizes', '3/4" – 4"', '3/4" – 4"'] },
        { cells: ['Temperature', '−30 to +100 °C; +130 °C intermittent sterilisation', '−30 to +100 °C; +130 °C intermittent sterilisation'] },
        { cells: ['Lining', 'UHMWPE', 'Conductive UHMWPE, FDA specification'], highlight: true },
        { cells: ['Static', 'Copper braided anti-static wire', 'Copper braided anti-static wire'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Compatibility is the whole decision.',
      anchor: 'compatibility',
    },
    {
      type: 'paragraph',
      html: 'Both listings carry the same qualifier: the temperature range applies <strong>subject to chemical compatibility</strong>. A compatibility rating is a statement about a material, a chemical, a concentration and a temperature together; change one and the rating can change. Check the chemical at its actual concentration and temperature against the UHMWPE lining, then against the coupling gasket — because a compatible hose with an incompatible gasket still leaks at the coupling.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Strong oxidisers and hot aromatics deserve a second look.',
      body: 'Polyethylene linings have known weak spots with some strong oxidising acids and with aromatic and chlorinated solvents at temperature. Where the medium is one of those, send us the chemical, concentration and temperature before ordering, and consider PTFE.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Against composite and PTFE.',
      anchor: 'alternatives',
    },
    {
      type: 'paragraph',
      html: 'UHMWPE rubber hose is heavier than composite but tougher: it tolerates being dragged across a yard and crushed under a wheel far better. Our <strong>chemical composite hose (A906PG)</strong> is 20 bar, 1" to DN100, −30 to +80 °C, built from polypropylene and polyethylene films and fabrics, and lighter to handle; the <strong>PTFE chemical composite hose (A911SG)</strong> adds a PTFE lining and runs to +120 °C for the more aggressive media. For small bores and the widest chemical range, PTFE-lined metal or smoothbore PTFE hose is the next step.',
    },
    {
      type: 'comparison_table',
      caption: 'Chemical hose options in our range',
      columns: ['Hose', 'Rating', 'Temperature'],
      rows: [
        { cells: ['A410 UHMWPE rubber', '10 bar, 3/4" – 4"', '−30 to +100 °C'] },
        { cells: ['A416 UHMWPE rubber', '16 bar, 3/4" – 4"', '−30 to +100 °C'], highlight: true },
        { cells: ['A906PG chemical composite', '20 bar, 1" – DN100', '−30 to +80 °C'] },
        { cells: ['A911SG PTFE chemical composite', '20 bar, 1" – DN100', '−30 to +120 °C'] },
      ],
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Ends and static.',
      anchor: 'ends',
    },
    {
      type: 'paragraph',
      html: 'Chemical hose usually ends in stainless cam and groove halves or EN 14420-5 fittings under a DIN 2817 safety clamp, with the gasket chosen for the chemical — PTFE or Viton where nitrile will not do. The copper anti-static wire must be bonded to both couplings and the couplings earthed; check continuity when the assembly is built and at every inspection.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What does UHMWPE stand for?',
          answer:
            'Ultra-high molecular weight polyethylene — a dense, smooth plastic used as the chemical-resistant lining inside rubber chemical hose.',
        },
        {
          question: 'What temperature can UHMWPE chemical hose handle?',
          answer:
            'Our A410 and A416 are listed from −30 to +100 °C, with +130 °C for intermittent sterilisation, subject to chemical compatibility.',
        },
        {
          question: 'What is the difference between A410 and A416?',
          answer:
            'A410 is rated 10 bar at a 4:1 safety factor; A416 is rated 16 bar at 3:1 with a conductive, FDA-specification UHMWPE lining. Both run 3/4" to 4".',
        },
        {
          question: 'Is UHMWPE hose compatible with every chemical?',
          answer:
            'No. It resists a very wide range, but compatibility depends on the chemical, concentration and temperature. Check the lining and the gasket, and ask us where the medium is a strong oxidiser or a hot aromatic solvent.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Chemical transfer hose',
      skus: ['IH-IH-A410', 'IH-IH-A416', 'IH-IH-A906PG', 'IH-IH-A911SG'],
    },
    {
      type: 'product_embed',
      heading: 'Ends for chemical hose',
      skus: ['IH-CGC-STD-C', 'IH-EN5-SS-GI-SERRATED', 'IH-CLP-SAFETY-14420-3'],
    },
    {
      type: 'category_link',
      slug: 'oil-chemical-purpose-hoses',
      label: 'Oil and chemical hose',
      blurb: 'UHMWPE chemical, oil suction and delivery and multipurpose hose.',
    },
    {
      type: 'category_link',
      slug: 'composite-hoses',
      label: 'Composite hose',
      blurb: 'Chemical, PTFE chemical, oil and vapour recovery composite hose.',
    },

    {
      type: 'cta_block',
      heading: 'Transferring a chemical we have not covered?',
      body: 'Send the chemical, its concentration and temperature, the bore and the coupling. We will tell you which lining and gasket suit it — and say so if none of ours does.',
      quoteLabel: 'Quote chemical hose',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Pressures, temperatures, linings and sizes checked against our UHMWPE and composite hose listings.',
    },
  ],
}

export default ARTICLE
