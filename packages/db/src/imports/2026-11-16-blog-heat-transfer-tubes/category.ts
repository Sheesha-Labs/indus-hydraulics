import type { BlogBlocksInput } from '@indus/domain'

import { HUB_GROUPS } from './tables'

/**
 * The heat-transfer tube hub, created 2026-11-16, the day after the Seamless Finned Tubes root went live
 * (finned, seamless, U-bend and copper-alloy tube, tube sheets, exchangers and boiler pressure parts).
 * Listing counts come from ./tables.ts, generated from the catalogue payload. Unbranded: no maker or
 * trade name anywhere. No market-reach profile, like `anchor-chain-mooring`.
 */
export const HEAT_TRANSFER_TUBES_CATEGORY = {
  slug: 'heat-transfer-tubes',
  name: 'Heat-transfer tubes',
  description:
    'Guides to finned, seamless, U-bend and copper-alloy heat-transfer tube: fin types and temperature limits, boiler and exchanger tube grades, bend rules, seawater alloys, air-cooler bundles, tube sheets and mill certificates.',
  heroCopy:
    'Heat-transfer tube is bought by specification: standard, grade, outside diameter, wall, length and, for finned tube, the fin type, material and density. These guides explain how to choose each of them for air coolers, condensers, boilers and fired heaters, and what to send with an enquiry.',
  seoTitle: 'Finned and heat exchanger tube guides',
  seoDescription:
    'Guides to finned tubes, boiler and heat exchanger tube grades, U-bends, copper-nickel tube, air-cooler bundles and tube sheets, from Indus in Dubai.',
  focusKeyword: 'finned tubes',
  position: 24,
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'How is heat-transfer tube specified?',
      answer:
        'By the tube standard and grade (for example ASTM A179, A213 TP316L or B111 C70600), the outside diameter and the wall — minimum or average, in millimetres or BWG — the length, and the quantity. Finned tube adds the fin type, material, height, thickness and fins per inch, and U-tubes add the bend schedule. A mill test certificate to EN 10204 3.1 records what was supplied.',
    },
    {
      type: 'comparison_table',
      caption: 'The Seamless Finned Tubes catalogue, by group',
      columns: ['Group', 'Listings'],
      rows: HUB_GROUPS.map((r) => ({ cells: r.cells.slice(0, 2) })),
    },
    { type: 'category_link', slug: 'finned-tubes', label: 'Finned tubes', blurb: 'Wound, embedded, extruded, HF-welded, studded, low-fin, H-fin and longitudinal fin tube.' },
    { type: 'category_link', slug: 'seamless-steel-tubes-pipes', label: 'Seamless steel tubes and pipes', blurb: 'Boiler, superheater, exchanger, stainless and precision tube, carbon steel pipe, line pipe and OCTG.' },
    { type: 'category_link', slug: 'u-bend-tubes', label: 'U-bend tubes', blurb: 'Carbon, alloy, stainless, nickel-alloy, copper-alloy and finned U-tubes, feedwater heater tubes and return bends.' },
    { type: 'category_link', slug: 'copper-alloy-tubes', label: 'Copper and copper-alloy tubes', blurb: 'Copper, brass, copper-nickel and enhanced copper tube and coils.' },
    { type: 'category_link', slug: 'seamless-finned-tubes-uae', label: 'All heat-transfer tube', blurb: 'The full catalogue, including exchangers, boiler pressure parts and tube sheets.' },
    {
      type: 'cta_block',
      heading: 'Buying tube for a bundle, a heater or a retube?',
      body: 'Send the standard and grade, the OD and wall, the length and quantity — and the fin or bend details. We quote with mill certificates, delivered across the Gulf and beyond.',
      quoteLabel: 'Ask for a quotation',
    },
  ] satisfies BlogBlocksInput,
}
