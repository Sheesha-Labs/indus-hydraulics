import type { BlogBlocksInput } from '@indus/domain'

/**
 * The anchor chain and mooring hub.
 *
 * Created 2026-11-08, the day after the Marine root went live with 136 listings: ship anchor chain in
 * grades U1–U3, offshore mooring chain in ORQ to R5, the shackles, swivels, links and anodes that make a
 * chain cable, offshore and ship anchors, chasers, deck fittings, buoys and aquaculture moorings. The
 * older marine posts (anchors, bollards, fenders, U1–U3 grades) sit in `lifting-rigging`; this hub is for
 * the chain cable and the mooring line, which are bought by shipyards, owners and offshore contractors
 * rather than by riggers.
 *
 * No market-reach profile, like `lifting-rigging` and `rigging-capacity-charts`.
 */
export const ANCHOR_CHAIN_MOORING_CATEGORY = {
  slug: 'anchor-chain-mooring',
  name: 'Anchor chain & mooring',
  description:
    'Anchor chain and offshore mooring chain — grades U1 to U3 and ORQ to R5, stud link and studless, size and weight charts, how chain is made and tested, the arrangement of a chain cable, Kenter shackles, swivels, mooring connectors, equipment numbers, wear limits and class certificates.',
  heroCopy:
    'A chain cable is bought once and trusted for decades: by length in shots, by diameter and by grade, with a class certificate for every shot and every accessory. These guides explain how it is arranged, made and tested, how it is sized to a ship or a mooring, and how to tell when it has worn out.',
  seoTitle: 'Anchor and mooring chain guides',
  seoDescription:
    'Guides to anchor and offshore mooring chain: grades U1–U3 and R3–R5, size and weight charts, manufacture, testing, Kenter shackles and wear limits.',
  focusKeyword: 'anchor chain',
  position: 23,
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'How is anchor chain specified?',
      answer:
        'By nominal diameter (the bar size of a common link, in mm or inches), by grade — U1, U2 or U3 for ship anchor chain, ORQ or R3 to R5 for offshore mooring chain — by type (stud link or studless) and by length, counted in shots of 27.5 m. Each shot is proof-load tested and certified by a classification society, and the shackles, swivels and end links are ordered to the same grade.',
    },
    {
      type: 'comparison_table',
      caption: 'The two families of chain cable',
      columns: ['Property', 'Ship anchor chain', 'Offshore mooring chain'],
      rows: [
        { cells: ['Grades', 'U1, U2, U3 (also written Grade 1, 2, 3)', 'ORQ, R3, R3S, R4, R4S, R5'] },
        { cells: ['Type', 'Mostly stud link', 'Stud link or studless'] },
        { cells: ['Sized by', 'The ship’s equipment number', 'The mooring analysis for the unit'] },
        { cells: ['Typical use', 'Anchoring and windlass work', 'Permanent and temporary moorings of rigs, FPSOs and buoys'] },
      ],
    },
    { type: 'category_link', slug: 'anchor-chain', label: 'Anchor chain', blurb: 'Stud link and studless ship anchor chain, grades U1 to U3, by the shot.' },
    { type: 'category_link', slug: 'offshore-mooring-chain', label: 'Offshore mooring chain', blurb: 'Stud link and studless chain in grades ORQ to R5, with adaptors and tails.' },
    { type: 'category_link', slug: 'anchor-chain-accessories', label: 'Anchor chain accessories', blurb: 'Kenter, D and pear shackles, swivels, forerunners, end and enlarged links, anodes.' },
    { type: 'category_link', slug: 'marine-equipment-uae', label: 'All marine equipment', blurb: 'Chain, anchors, connectors, chasers, deck fittings, buoys and aquaculture moorings.' },
    {
      type: 'cta_block',
      heading: 'Ordering anchor or mooring chain?',
      body: 'Send the diameter, grade, type and number of shots, or the ship’s equipment number, and the class society you need. We will quote the chain and its accessories with certificates, delivered across the Gulf and beyond.',
      quoteLabel: 'Ask for a quotation',
    },
  ] satisfies BlogBlocksInput,
}
