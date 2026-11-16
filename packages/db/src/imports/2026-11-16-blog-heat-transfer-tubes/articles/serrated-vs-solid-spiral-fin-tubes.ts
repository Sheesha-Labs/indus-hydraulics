import type { BlogArticleSeed } from '../shared'

import { HFW_ROWS } from '../tables'

/**
 * Solid vs serrated HF-welded fins. Sources: approved data for IH-TF-HF-HFW, IH-TF-HF-LDP, IH-TF-ST-STD
 * and IH-TF-HR-HFN (materials, API 560 fin-tip limits for fired-heater fins, services), live rows
 * (./tables.ts), and the research note that serrations raise the gas-side coefficient with a modest rise
 * in pressure drop (general handbook fact). No coefficient numbers are given: none were sourced.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'serrated-vs-solid-spiral-fin-tubes',
  title: 'HF-welded spiral fin tubes: solid or serrated?',
  excerpt:
    'High-frequency welded spiral fins are the workhorse of fired-heater convection sections, HRSGs and economisers. When to choose solid or serrated fins, which fin material for which tip temperature, and when studs or H-fins are the better answer.',
  categorySlug: 'heat-transfer-tubes',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Serrated vs Solid Spiral Fin Tubes',
  seoDescription:
    'Solid and serrated HF-welded spiral fin tubes compared: heat transfer, fouling, fin materials and API 560 tip limits, sizes and part numbers.',
  focusKeyword: 'serrated fin tube',
  publishedAt: '2026-11-16T08:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'HF-welded spiral fins are steel strips welded continuously to the tube by high-frequency resistance welding.',
        'Serrated fins are cut into segments, which raises the gas-side heat-transfer coefficient for a modest rise in pressure drop.',
        'Solid fins shed deposits more easily and are preferred where the gas is dirty or soot-blowing is limited.',
        'The fin material is chosen for the fin-tip temperature: API 560 gives 454 °C for carbon steel, 549 °C for 2¼Cr and 5Cr, 982 °C for 25Cr-20Ni.',
        'For fuel-oil firing and heavy fouling, studded tubes or H-fins are the alternatives.',
      ],
    },
    {
      type: 'lead',
      html: 'In a fired heater’s convection section, an HRSG or a boiler economiser, the gas side controls the heat transfer, so the tubes carry steel fins to add surface. Most of those fins are spiral strips welded to the tube by high-frequency resistance welding, and the first decision is whether the strip stays solid or is cut into segments.',
    },
    {
      type: 'direct_answer',
      question: 'What is the difference between serrated and solid fin tubes?',
      answer:
        'A solid spiral fin is a continuous strip; a serrated fin is the same strip cut into segments from the tip towards the root. The segments break up the gas boundary layer, raising the gas-side heat-transfer coefficient with a modest increase in pressure drop. Solid fins are easier to keep clean in dirty gas. Both are high-frequency welded to the tube.',
    },

    { type: 'section_head', number: '/01', title: 'How the fin is made.', anchor: 'made' },
    {
      type: 'paragraph',
      html: 'The strip is wound onto the rotating tube while a high-frequency current heats the strip edge and the tube surface, and the two are forged together at the root. The weld is continuous along the helix, so the bond does not loosen with temperature the way a wound fin does. For a serrated fin the strip is slit before winding and the segments open as the strip bends round the tube.',
    },

    { type: 'section_head', number: '/02', title: 'Solid or serrated.', anchor: 'choose' },
    {
      type: 'comparison_table',
      caption: 'Solid vs serrated HF-welded fins',
      columns: ['Point', 'Solid fin', 'Serrated fin'],
      rows: [
        { cells: ['Gas-side heat transfer', 'Lower', 'Higher, for the same fin height and pitch'] },
        { cells: ['Gas-side pressure drop', 'Lower', 'Modestly higher'] },
        { cells: ['Fouling and cleaning', 'Sheds deposits more easily', 'Segments can hold deposits in dirty gas'] },
        { cells: ['Typical use', 'Dirty gas, oil firing with limited cleaning', 'Clean gas: HRSGs, gas-fired heaters, economisers'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'In gas-fired service, which covers most combined-cycle and IWPP plants in the Gulf, serrated fins give a more compact bank. Where the fuel leaves ash or soot, a solid fin — or a studded tube — is easier to keep working.',
    },

    { type: 'section_head', number: '/03', title: 'Fin material and tip temperature.', anchor: 'material' },
    {
      type: 'paragraph',
      html: 'The fin tip is the hottest metal in the bank, so its material is chosen for the tip temperature, not the tube temperature. For fired-heater fins API 560 gives tip limits of 454 °C for carbon steel, 549 °C for 2¼Cr and 5Cr, and 982 °C for 25Cr-20Ni. In between, 11–13Cr (Type 405 or 410S) and 18Cr-8Ni fins are used. The base tube follows the process side: A106 B, A192 or A210 carbon steel; A213 T5, T9, T11 and T22 or A335 P5 to P22 chrome-moly; and TP304H, 321 or 347 stainless.',
    },

    { type: 'section_head', number: '/04', title: 'Sizes.', anchor: 'sizes' },
    {
      type: 'comparison_table',
      caption: 'HF-welded spiral fin tube (live listing, mm; R rows are ranges)',
      columns: ['OD', 'Wall', 'Fin height', 'Fin thickness', 'FPI', 'Segment width', 'Part number'],
      rows: HFW_ROWS,
    },
    {
      type: 'paragraph',
      html: 'Pipe sizes from 4 to 8 NPS are listed separately as <a href="/p/large-diameter-finned-pipe">large-diameter finned pipe</a>.',
    },

    { type: 'section_head', number: '/05', title: 'Studs and H-fins.', anchor: 'alternatives' },
    {
      type: 'paragraph',
      html: '<a href="/p/studded-tubes">Studded tubes</a> carry individually welded studs and are the traditional choice for crude, vacuum and reformer heater convection sections firing fuel oil or mixed fuel, where deposits would bridge spiral fins. <a href="/p/h-fin-and-rectangular-fin-tubes">H-fin tubes</a> use flat plates welded across the tube with straight gas lanes between them; they resist fouling and suit economisers on dust-laden flue gas.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Are serrated fins more efficient than solid fins?', answer: 'Yes on the gas side: segmenting the fin raises the heat-transfer coefficient, for a modest rise in pressure drop. Whether the bank is smaller overall depends on the design.' },
        { question: 'How are spiral fins attached?', answer: 'By high-frequency resistance welding along the full root of the helix.' },
        { question: 'Which fin material for 600 °C fin tips?', answer: 'Above the 549 °C limit for 2¼Cr and 5Cr fins, stainless fins are used, with 25Cr-20Ni good to 982 °C under API 560.' },
        { question: 'When should I use studded tubes?', answer: 'In fired heaters burning fuel oil or mixed fuel, where deposits would bridge spiral fins.' },
        { question: 'What is the maximum length?', answer: 'Our listing gives 18.3 m as the maximum single length.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Welded fin tube in the catalogue',
      skus: ['IH-TF-HF-HFW', 'IH-TF-HF-LDP', 'IH-TF-ST-STD', 'IH-TF-HR-HFN'],
    },
    { type: 'category_link', slug: 'hf-welded-spiral-fin-tubes', label: 'HF-welded spiral fin tubes', blurb: 'Solid and serrated welded fins on tube and pipe.' },
    {
      type: 'related_articles',
      slugs: ['types-of-finned-tubes', 'heat-transfer-tube-buyers-guide'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-16',
      note: 'API 560 fin-tip limits apply to welded and studded fired-heater fins. Sizes from our live listing.',
    },
    {
      type: 'cta_block',
      heading: 'Retubing a convection bank?',
      body: 'Send the tube and fin specification or the heater data sheet. We quote finned tube with mill certificates.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
