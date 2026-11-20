/**
 * 2026-11-20: article links for Marine products that no published article linked to.
 *
 * Marine products linked from an article had a 33% impression rate over 90 days;
 * unlinked ones had 8%. A live survey (prose `href="/p/…"` plus `product_embed`
 * SKUs across every published article) found 73 of 213 active Marine products
 * with no article link.
 *
 * Three kinds of change, all approved before writing:
 *   - `links`: an in-text link on a phrase the article already uses (at most 5
 *     per article, one link per product page per article);
 *   - `embedAdd`: SKUs added to the article's existing `product_embed` block,
 *     never past 6;
 *   - `stockLists`: a "What we list" block (the fill-in:stock-list pattern the
 *     marine articles already carry) for the named shelves, built from the live
 *     catalogue at run time. Products already linked in that article's prose are
 *     left out so no page is linked twice. Appended to an existing stock-list
 *     block when the article has one, else inserted before its product_embed.
 *
 * No new copy or specs: every anchor is an existing phrase, every list item is
 * the product's own title.
 */
export type MarinePlan = {
  links?: Array<{ phrase: string; href: string }>
  embedAdd?: string[]
  stockLists?: string[]
}

export const MAX_EMBED = 6

export const MARINE_LINK_PLANS: Record<string, MarinePlan> = {
  'offshore-mooring-components': {
    links: [
      { phrase: 'wire rope socket', href: '/p/closed-spelter-socket-for-mooring-wire' },
      { phrase: 'mooring buoy', href: '/p/foam-filled-surface-mooring-buoy' },
      { phrase: 'pick-up', href: '/p/pick-up-chain-26-mm' },
      { phrase: 'D-type end shackle', href: '/p/ltm-anchor-shackle-d-type-bolt-and-nut' },
    ],
    stockLists: ['mooring-buoys', 'mooring-connectors', 'offshore-mooring-chain', 'anchor-handling-chasers', 'aquaculture-mooring'],
  },
  'anchor-chain-cable-arrangement': {
    links: [
      { phrase: 'swivel near the anchor', href: '/p/anchor-chain-swivel-grades-u2-and-u3' },
      { phrase: 'end shackle', href: '/p/d-shackle-bolt-type-2-to-1-500-t' },
    ],
    stockLists: ['anchor-chain-accessories'],
  },
  'types-of-mooring-bollards': { stockLists: ['towing-mooring-fittings'] },
  'types-of-marine-anchors': {
    links: [
      { phrase: 'swivels', href: '/p/ball-joint-anchor-swivel' },
      { phrase: 'retrieving lines', href: '/p/four-prong-grapnel' },
      { phrase: 'shackles', href: '/p/mooring-shackle-28-to-150-t-mbl' },
    ],
  },
  'offshore-mooring-chain-grades-r3-r4-r5': {
    links: [{ phrase: 'R3 and R4', href: '/p/ocimf-chafe-chain-type-a-b-76-mm-grade-r3-r4' }],
  },
  'anchor-chain-testing-proof-break-ndt': {
    links: [{ phrase: 'swivel shackle', href: '/p/swivel-shackle-type-k' }],
  },
  'stud-link-vs-studless-chain': { embedAdd: ['IH-MR-MC-5LA'] },
  'anchor-chain-size-chart': { embedAdd: ['IH-MR-DF-CHF54', 'IH-MR-DF-CHF76'] },
  'anchor-chain-weight-chart': { embedAdd: ['IH-MR-MC-TAIL'] },
}
