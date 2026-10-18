import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Molykote pastes, read from the 21 listings on the pastes shelf: solids,
 * base, listed service temperature and packs. Friction coefficients and
 * torque values are not on the listings, so none are quoted.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'anti-seize-and-assembly-pastes',
  title: 'Anti-seize and assembly pastes: what the solids do and what the temperature rating means',
  excerpt:
    'A paste is for the surfaces a grease cannot protect: threads under torque, press fits and bolts that must come apart after years at temperature. How anti-seize and assembly pastes differ, and how to read a 1,400 °C rating.',
  categorySlug: 'maintenance-reliability',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T00:10:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What is the difference between an anti-seize paste and an assembly paste?',
      answer:
        'An assembly paste lowers friction while parts are fitted and run in — press fits, splines, sliding surfaces under high load — and is usually rich in MoS2. An anti-seize paste protects a joint that must come apart later, often after heat and corrosion: its solids stay between the threads after the carrier oil has gone. On our listings, assembly pastes run to 400 °C or 450 °C; anti-seize pastes to 650 °C, 900 °C, 1,100 °C and 1,400 °C.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Pastes carry far more solid lubricant than greases: MoS2, graphite or white solids on most of our listings.',
        'Assembly pastes such as G-N (−18 °C to 400 °C) and G-Rapid Plus (−35 °C to 450 °C) are for fitting and running-in.',
        'Anti-seize pastes such as Molykote 1000 (to 650 °C) and P-37 (to 1,400 °C) keep hot bolts from seizing.',
        'The top of an anti-seize range is the solid lubricant working alone. No oil base survives 650 °C.',
        'A lubricated thread needs a different torque from a dry one. Use the value given for that lubricant, not a dry-thread table.',
      ],
    },
    {
      type: 'lead',
      html: 'Grease protects parts that move. The surfaces that cause the most trouble at a shutdown are the ones that barely move at all: flange bolts baked for two years, a bearing pressed onto a shaft, stainless threads that gall on the first turn. Those are the jobs for a paste, and <strong>the two kinds of paste solve different halves</strong> of the problem.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'What a paste does that a grease cannot.',
      anchor: 'why',
    },
    {
      type: 'paragraph',
      html: 'Under the contact pressure of a tightened thread or a press fit, the oil film of a grease is squeezed out and metal meets metal. A paste keeps a layer of solid lubricant in the gap — lamellar MoS<sub>2</sub> or graphite, a soft metal, or white solids where a dark film is not wanted — so the surfaces slide instead of welding together. That is what stops galling as a joint is made up, fretting corrosion in a press fit that sees vibration, and seizure in a bolt that has been hot and wet for a long time.',
    },
    {
      type: 'comparison_table',
      caption: 'Molykote pastes on our listings',
      columns: ['Paste', 'Solids (as listed)', 'Listed temperature', 'Main job'],
      rows: [
        { cells: ['G-N Metal Assembly Paste', 'MoS₂, white solids', '−18 °C to 400 °C', 'Assembly, press fits'], highlight: true },
        { cells: ['G-Rapid Plus', 'MoS₂, graphite, white solids', '−35 °C to 450 °C', 'Assembly and running-in'] },
        { cells: ['U-N Paste', 'MoS₂, white solids (PAG base)', '−40 °C to 400 °C', 'Assembly'] },
        { cells: ['Molykote 1000', 'Not stated', '−30 °C to 650 °C', 'Anti-seize, threads'] },
        { cells: ['CU-7439 Plus', 'Not stated (copper appearance)', '−30 °C to 650 °C', 'Anti-seize, threads'] },
        { cells: ['P-3700', 'Special solid lubricants', '−30 °C to 900 °C', 'Anti-seize'] },
        { cells: ['HSC Plus', 'Not stated', '−30 °C to 1,100 °C', 'Anti-seize'] },
        { cells: ['HTP Paste', 'White solids', '−20 °C to 1,150 °C', 'Anti-seize, white film'] },
        { cells: ['P-37', 'Not stated', '−30 °C to 1,400 °C', 'Anti-seize'] },
        { cells: ['D Paste', 'White solids', '−25 °C to 250 °C', 'Assembly, white film'] },
        { cells: ['E Paste', 'PTFE (silicone base)', '−50 °C to 150 °C', 'Plastics and rubber'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Reading the top of the temperature range.',
      anchor: 'temperature',
    },
    {
      type: 'paragraph',
      html: 'No mineral or synthetic oil survives 650 °C, let alone 1,400 °C, so the upper figure on an anti-seize paste describes what is left after the carrier has burned off or evaporated: a layer of solids that keeps the thread faces apart and lets the joint be broken out later. It is not a statement that the paste lubricates a moving part at that temperature. For a bearing or a slide in heat, a high-temperature grease is the right product — Molykote 41 is listed to 290 °C — and above that the answer is usually a dry film.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Torque changes when the thread is lubricated.',
      anchor: 'torque',
    },
    {
      type: 'paragraph',
      html: 'Most of the torque applied to a bolt is spent overcoming friction under the head and in the thread; only the remainder stretches the bolt and creates clamp load. Lower the friction with a paste and the same torque produces more clamp load. A torque value taken from a dry-thread table and applied to a pasted bolt can therefore overstretch it. Use the torque the joint designer or the paste maker gives for that lubricant, and use the same paste on every bolt in the joint so the clamp load is even.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Same torque, more load.',
      body: 'Switching a joint from dry to lubricated, or from one paste to another, changes the bolt load for a given torque. Do not reuse the old torque figure without checking it against the new lubricant.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Assembly and running-in.',
      anchor: 'assembly',
    },
    {
      type: 'paragraph',
      html: 'Assembly pastes do their work in the first minutes of a part\'s life. Pressing a bearing onto a shaft, sliding a hub along a spline or running in a new gear set loads the surfaces before any oil film exists, and an MoS<sub>2</sub> paste carries the load until it does. G-N is listed in a 500 g tub, 4.5 kg and 22 kg pails and a 400 ml spray; G-Rapid Plus in 250 g and 1 kg cans, a 25 kg pail and a spray; M-77 from 6 g pillow packs to a 300 kg drum. For anything that keeps moving afterwards, the paste is the start and a grease or oil is the service lubricant.',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'Matching the paste to the metal.',
      anchor: 'metals',
    },
    {
      type: 'paragraph',
      html: 'Stainless steel and nickel alloys are the threads most prone to galling, and the ones where the choice of solid matters most. Copper-containing pastes are widely used on carbon steel but are commonly avoided on some stainless and nickel-alloy fasteners; white-solids pastes such as HTP and D Paste leave a light film where a dark one is unwelcome. The datasheet for each Molykote paste lists the metals it suits — check it against the fastener before choosing, and for plastic or rubber parts use a silicone-based product such as E Paste.',
    },

    {
      type: 'decision_tree',
      heading: 'Which Molykote paste?',
      intro: 'Start from the job, then confirm the metal and temperature against the datasheet.',
      branches: [
        {
          condition: 'Pressing, splining or fitting parts that then keep moving?',
          outcome: 'Assembly paste — G-N or G-Rapid Plus.',
          detail: 'Follow with the service grease or oil once the part runs.',
          sku: 'IH-LUB-G-N-METAL-ASSEMBLY-PASTE',
        },
        {
          condition: 'Bolts or studs that must come apart after heat, up to 650 °C?',
          outcome: 'Anti-seize — Molykote 1000 or CU-7439 Plus.',
          sku: 'IH-LUB-1000',
        },
        {
          condition: 'Exhaust, turbine or furnace bolting hotter than that?',
          outcome: 'P-3700 (to 900 °C), HSC Plus (to 1,100 °C) or P-37 (to 1,400 °C).',
          sku: 'IH-LUB-P37',
        },
        {
          condition: 'A dark film is not acceptable?',
          outcome: 'White-solids paste — HTP Paste or D Paste.',
          sku: 'IH-LUB-HTP-PASTE',
        },
        {
          condition: 'Plastic or elastomer parts?',
          outcome: 'Silicone-based E Paste, −50 °C to 150 °C.',
          sku: 'IH-LUB-E-PASTE',
        },
      ],
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Can I use anti-seize instead of grease on a bearing?',
          answer:
            'No. Anti-seize protects static joints such as threads and press fits. A bearing needs a grease or oil that keeps a lubricating film while it runs.',
        },
        {
          question: 'Does anti-seize change bolt torque?',
          answer:
            'Yes. Lower thread friction means more clamp load for the same torque. Use the torque given for the lubricant, not a dry-thread value.',
        },
        {
          question: 'What does a 1,400 °C rating on P-37 mean?',
          answer:
            'That its solid lubricant still keeps a joint separable at that temperature after the carrier has gone. It is an anti-seize limit, not a lubrication limit for moving parts.',
        },
        {
          question: 'Is copper anti-seize suitable for stainless steel?',
          answer:
            'It is commonly avoided on some stainless and nickel-alloy fasteners. Check the paste datasheet against the fastener material before use.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Molykote pastes',
      skus: [
        'IH-LUB-G-N-METAL-ASSEMBLY-PASTE',
        'IH-LUB-G-RAPID-PLUS-PASTE-1KG',
        'IH-LUB-M-77-ASSEMBLY-PASTE',
        'IH-LUB-1000',
        'IH-LUB-7439',
        'IH-LUB-P-3700-ANTI-SEIZE-PASTE',
        'IH-LUB-HSC-PLUS-PASTE',
        'IH-LUB-P37',
      ],
    },
    {
      type: 'category_link',
      slug: 'molykote-pastes',
      label: 'Molykote pastes',
      blurb: '21 assembly and anti-seize pastes in tubs, cans, pails and sprays.',
    },
    {
      type: 'category_link',
      slug: 'molykote-anti-friction-coatings',
      label: 'Molykote anti-friction coatings',
      blurb: 'Dry films for parts a paste or grease cannot reach.',
    },

    {
      type: 'cta_block',
      heading: 'Choosing a paste for a shutdown?',
      body: 'Send the fastener or component material, the temperature it runs at, and whether it must come apart again. We will recommend the paste and quote the pack size.',
      quoteLabel: 'Quote Molykote pastes',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Solids, bases, temperature ranges and pack sizes checked against our Molykote paste listings.',
    },
  ],
}

export default ARTICLE
