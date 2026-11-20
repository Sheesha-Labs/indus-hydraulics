import type { BlogBlocksInput } from '@indus/domain'

/**
 * The drilling rig equipment hub.
 *
 * Created 2026-11-19 for the Oteco range: mud gate valves and their kits, relief valves, drilling gauges,
 * float valves, manifold fittings, rig floor rubber, mud pump fluid-end parts and swivel washpipe. The
 * pressure-control posts on BOPs, chokes, flow iron and frac equipment stay in `oilfield-pressure-control`;
 * this hub is for the parts a drilling contractor's rig floor and mud system use up and reorder.
 *
 * No market-reach profile, like `anchor-chain-mooring`.
 */
export const DRILLING_RIG_EQUIPMENT_CATEGORY = {
  slug: 'drilling-rig-equipment',
  name: 'Drilling rig equipment',
  description:
    'Mud gate valves and repair kits, shear-pin and reset relief valves, drilling pressure gauges, drill pipe float valves, long-sweep manifold fittings, annular BOP and stripper rubber, pipe wipers and mud guards, mud pump pistons, valves and dampener diaphragms, and swivel washpipe and packing.',
  heroCopy:
    'A drilling rig wears through valves, rubber and fluid-end parts every week it turns. These guides explain how each part is chosen — by model, size, pressure and service — how it is rebuilt, and what to send so the right part ships first time.',
  seoTitle: 'Drilling rig equipment guides',
  seoDescription:
    'Guides to drilling rig equipment: mud gate valves, relief valves, drilling gauges, float valves, mud pump pistons, washpipe, rig floor rubber and manifold fittings.',
  focusKeyword: 'drilling rig equipment',
  position: 25,
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'How are drilling rig spares ordered?',
      answer:
        'By the maker’s part number where you have it. Otherwise by the equipment and its model — a Model 72 gate valve, a Model 6 gauge, the mud pump and its liner size, the swivel make and model — then the size, the working pressure and the service: standard, sour gas (H2S) or another trim. A nameplate photo settles most of the rest.',
    },
    {
      type: 'comparison_table',
      caption: 'Where each part sits on the rig',
      columns: ['Area', 'Parts', 'Chosen by'],
      rows: [
        { cells: ['Mud system and standpipe', 'Gate valves, relief valves, gauges, manifold fittings', 'Size, working pressure, end connection, trim'] },
        { cells: ['Mud pump fluid end', 'Pistons, valves and seats, dampener diaphragms', 'Pump model, liner size, valve series, dampener model'] },
        { cells: ['Swivel', 'Washpipe and packing', 'Swivel make and model'] },
        { cells: ['Drill string', 'Float valves and repair kits', 'Float valve model and size, bit sub bore'] },
        { cells: ['Rig floor and BOP', 'Pipe and kelly wipers, mud guards, annular and stripper rubber', 'Pipe OD, BOP model and bore, compound'] },
      ],
    },
    { type: 'category_link', slug: 'oilfield-gate-valves', label: 'Oilfield gate valves', blurb: 'Oteco Model 72 and DM mud gate valves in standard, stainless and sour gas trims.' },
    { type: 'category_link', slug: 'mud-pump-fluid-end-parts', label: 'Mud pump fluid end parts', blurb: 'Pistons, valves and seats, and pulsation dampener diaphragms.' },
    { type: 'category_link', slug: 'rig-floor-consumables', label: 'Rig floor consumables', blurb: 'Pipe wipers, kelly wipers, mud and oil guards.' },
    { type: 'category_link', slug: 'swivel-washpipe-packing', label: 'Swivel washpipe and packing', blurb: 'Washpipe and packing sets by swivel make and model.' },
    {
      type: 'cta_block',
      heading: 'Ordering rig spares?',
      body: 'Send the part number, or the equipment, model, size, pressure and service. We are Oteco’s authorised Middle East distributor, with stock in Dubai.',
      quoteLabel: 'Ask for a quotation',
    },
  ] satisfies BlogBlocksInput,
}
