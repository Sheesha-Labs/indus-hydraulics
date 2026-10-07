import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * API 6A nameplate markings, illustrated from the gate valve, SSV and check
 * valve listings: sizes, pressures, ring numbers, material class markings
 * (with H2S suffixes), temperature markings, PSL and PR. The class
 * definitions are API 6A's own; the article points to the standard for the
 * detail rather than restating it.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'api-6a-nameplate-markings',
  title: 'Reading an API 6A nameplate: pressure, material class, temperature class, PSL and PR',
  excerpt:
    'An API 6A valve or wellhead nameplate packs a specification into a line of codes: EE-1.5, P+U, PSL 3G, PR2. What each one means, how they show up on the valves we list, and what to send when replacing one.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T01:10:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What do the markings on an API 6A nameplate mean?',
      answer:
        'They give the size and rated working pressure, the material class (AA to HH, with sour classes carrying a maximum H2S partial pressure such as EE-1.5 or NL for no limit), the temperature class (letters such as P, U or X, often combined like P+U for −29 °C to 121 °C), the product specification level (PSL 1 to 4, with G for gas testing) and the performance requirement level (PR1 or PR2). Together they define what the equipment was built and tested for.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Rated working pressures run 2,000 to 20,000 psi. Small 2K, 3K and 5K flanges are API 6B (R or RX rings); 10K and above are 6BX (BX rings).',
        'Material classes AA, BB and CC are general service; DD, EE, FF and HH are sour service to NACE MR0175 / ISO 15156.',
        'The number after a sour class is the maximum H2S partial pressure in psia: EE-1.5, DD-0.5. NL means no limit.',
        'Temperature letters combine: P+U is −29 °C to 121 °C, P+X is −29 °C to about 177 °C.',
        'PSL sets the quality-control and testing level; PR sets the design validation level. A G after the PSL means gas testing.',
      ],
    },
    {
      type: 'lead',
      html: 'Two gate valves can share a size and a pressure and still be built for entirely different wells. The difference is on the nameplate, in a row of short codes that most purchase requisitions copy without reading. <strong>Each code answers a separate question</strong> — what pressure, what fluid, what temperature, how thoroughly tested — and a replacement has to match all of them.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'The codes on a nameplate.',
      anchor: 'codes',
    },
    {
      type: 'comparison_table',
      caption: 'API 6A markings, with examples from our valve listings',
      columns: ['Marking', 'What it tells you', 'Example on our listings'],
      rows: [
        { cells: ['Size and pressure', 'Nominal bore and rated working pressure', '2-1/16" 10,000 psi; 3-1/8" 5,000 psi'], highlight: true },
        { cells: ['End connection', 'Flange type and ring number', '6BX with BX-152; 6B with R-35 or RX-35'] },
        { cells: ['Material class', 'Materials of the body and the pressure-controlling parts, and sour rating', 'DD, DD-0.5, DD-NL, EE-1.5, HH'] },
        { cells: ['Temperature class', 'Minimum and maximum operating temperature', 'P+U (−29 °C to 121 °C); P+X'] },
        { cells: ['PSL', 'Product specification level — quality control and testing', 'PSL 1, PSL 2, PSL 3, PSL 3G'] },
        { cells: ['PR', 'Performance requirement level — design validation', 'PR1, PR2 (some nameplates print PR2F)'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Material class: what the valve can touch.',
      anchor: 'material',
    },
    {
      type: 'comparison_table',
      caption: 'API 6A material classes (summary — the standard governs the detail)',
      columns: ['Class', 'Service', 'Body, bonnet, ends', 'Pressure-controlling parts'],
      rows: [
        { cells: ['AA', 'General', 'Carbon or low-alloy steel', 'Carbon or low-alloy steel'] },
        { cells: ['BB', 'General', 'Carbon or low-alloy steel', 'Stainless steel'] },
        { cells: ['CC', 'General', 'Stainless steel', 'Stainless steel'] },
        { cells: ['DD', 'Sour', 'Carbon or low-alloy steel', 'Carbon or low-alloy steel'] },
        { cells: ['EE', 'Sour', 'Carbon or low-alloy steel', 'Stainless steel'], highlight: true },
        { cells: ['FF', 'Sour', 'Stainless steel', 'Stainless steel'] },
        { cells: ['HH', 'Sour', 'Corrosion-resistant alloy', 'Corrosion-resistant alloy'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The sour classes must meet NACE MR0175 / ISO 15156, and their marking carries the maximum partial pressure of H<sub>2</sub>S the equipment is rated for, in psia: EE-0.5, EE-1.5, DD-0.5, or NL for no limit. Our gate valve listings show how varied stock can be — units on the 4-1/16" 10,000 psi listing carry DD, DD-0.5 and DD-NL markings, and the 2-1/16" 10,000 psi listing DD and EE-1.5 — with other classes from AA to HH to order. Our 3-1/16" 15,000 psi slab gate valve is class HH: a 4130 body with Inconel 625 internal cladding, an Inconel 625 clad gate and overlaid seats.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Temperature class: the operating window.',
      anchor: 'temperature',
    },
    {
      type: 'paragraph',
      html: 'Each temperature class is a letter for a window of operating temperature. The letters on our listings are P (−29 °C to 82 °C, or −20 °F to 180 °F), U (−18 °C to 121 °C, or 0 °F to 250 °F), X (−18 °C to 180 °C) and L (−46 °C to 82 °C). Combined markings take the lower limit of one and the upper limit of the other: P+U is −29 °C to 121 °C (−20 °F to 250 °F), which is how most of our gate valves are marked, and P+X runs from −20 °F to about 350 °F. Sour-service flow iron on our listings is rated to 82 °C, which is the top of class P.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'PSL and PR: how thoroughly it was built and proven.',
      anchor: 'psl-pr',
    },
    {
      type: 'paragraph',
      html: 'The product specification level, PSL 1 to PSL 4, sets the quality control applied in manufacture — material testing, non-destructive examination, traceability and pressure testing all step up with the level. A G after PSL 3 (PSL 3G) adds gas testing. The performance requirement level, PR1 or PR2, describes how the design was validated; PR2 is the more demanding. Operators specify both for their wells, and a replacement should match or exceed the PSL and PR of the equipment it replaces.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Match every code, not just the pressure.',
      body: 'A 10,000 psi valve marked AA is not a substitute for a 10,000 psi valve marked EE-1.5 on a sour well, and a P+U valve is not rated for a well that runs hotter than 121 °C. Copy the full nameplate onto the requisition, and if it is unreadable, get the operator\'s specification before buying.',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'The flange tells you the ring.',
      anchor: 'flange',
    },
    {
      type: 'paragraph',
      html: 'End connections follow the pressure. Our 3-1/8" and 4-1/16" 5,000 psi gate valves are API 6B flanged for R-35 / RX-35 and R-39 / RX-39 rings; the 2-1/16" to 5-1/8" valves at 10,000 and 15,000 psi are 6BX, for BX-152 to BX-155 and BX-169. For operating the valves, our accessory listings include an 8:1 worm-gear operator for 3" API 6A valves, a double-acting hydraulic actuator with limit switches, ISO 5211 mounting kits and a position indicator. A flanged valve is ordered with its rings and studs, and the rings are explained in <a href="/blog/ring-joint-gaskets-r-rx-bx">R, RX and BX ring joint gaskets</a>. The same markings appear on wellhead equipment, covered in <a href="/blog/wellhead-components-explained">wellhead components explained</a>.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What does EE-1.5 mean on a valve?',
          answer:
            'Material class EE, a sour-service class, rated for a maximum H2S partial pressure of 1.5 psia. EE uses carbon or low-alloy steel for the body and stainless steel for the pressure-controlling parts.',
        },
        {
          question: 'What temperature is P+U?',
          answer:
            '−29 °C to 121 °C (−20 °F to 250 °F): the lower limit of class P and the upper limit of class U.',
        },
        {
          question: 'What is the difference between PSL and PR?',
          answer:
            'PSL is the level of quality control and testing in manufacture; PR is the level of design validation. They are specified separately.',
        },
        {
          question: 'What does NL mean after a material class?',
          answer:
            'No limit on H2S partial pressure for that sour-service class, for example DD-NL.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'API 6A gate valves',
      skus: [
        'IH-OFV-GATE-2116-10K',
        'IH-OFV-GATE-3116-10K',
        'IH-OFV-GATE-3116-15K',
        'IH-OFV-GATE-4116-10K',
        'IH-OFV-GATE-318-5K',
        'IH-OFV-GATE-4116-5K',
        'IH-OFV-GATE-3116-15K-SLAB-FMC',
        'IH-OFV-SSV-3116-10K-1502-CAMERON',
      ],
    },
    {
      type: 'category_link',
      slug: 'oilfield-gate-valves',
      label: 'Oilfield gate valves',
      blurb: 'API 6A gate valves from 1-13/16" to 5-1/8", and mud gate valves.',
    },
    {
      type: 'category_link',
      slug: 'oilfield-ssv-esd-valves',
      label: 'SSV and ESD valves',
      blurb: 'Hydraulic surface safety valves.',
    },
    {
      type: 'category_link',
      slug: 'wellhead',
      label: 'Wellhead equipment',
      blurb: 'Casing heads, spools, tubing heads and trees.',
    },

    {
      type: 'cta_block',
      heading: 'Replacing an API 6A valve?',
      body: 'Send a photograph of the nameplate or the size, pressure, material class, temperature class, PSL, PR and end connections. We will quote a match and its documentation.',
      quoteLabel: 'Quote API 6A valves',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Sizes, pressures, ring numbers, material and temperature markings, PSL and PR checked against our gate valve, SSV and check valve listings.',
    },
  ],
}

export default ARTICLE
