/**
 * The delivery-reach section on the designed capability pages — profiles only.
 *
 * Engine, exclusions and honesty rules are in `./market-reach`.
 *
 * Two pages: `/manufacturing` and `/quality-control`. The third member of that
 * family, `/industries/data-center-liquid-cooling`, is keyed as an industry
 * instead because it dispatches through `industries/[slug]` — see
 * `industry-market-reach.ts` and the note in `industry-pages.ts` about the two
 * routing shapes.
 *
 * WHAT THESE TWO PAGES ARGUE, AND WHY A DELIVERY SECTION BELONGS ON THEM
 *
 * Both are capability pages rather than product pages: one says we can make a
 * part to your drawing, the other says we can prove what we made. Neither said
 * anything about where the result goes, which on a capability page is the
 * obvious next question a buyer abroad has. That is the gap this closes.
 *
 * COPY CONSTRAINT SPECIFIC TO `/quality-control`
 *
 * That page's commercial framing is STILL UNAPPROVED by the founder, and it
 * carries two claims flagged as needing confirmation rather than review: that a
 * certificate can be reissued against a heat number years after delivery, and
 * that third-party inspection by named agencies can be arranged and scheduled
 * against the production date. The paragraph below deliberately restates
 * NEITHER. A generated section is the wrong place to give an unapproved promise
 * a second home — if the founder strikes the claim on the page, it should not
 * survive underneath it.
 */
import { buildMarketReach } from './market-reach'

import type { MarketReach, MarketReachProfile } from './market-reach'

/** Keyed by route path without the leading slash. */
export const DESIGNED_PAGE_REACH_PROFILES: Readonly<Record<string, MarketReachProfile>> = {
  manufacturing: {
    heading: 'Where what we make gets shipped',
    body: 'A part made to a drawing is the least ambiguous thing to buy across a border: the drawing settles what correct means before anyone quotes, and the dimensional report settles whether it was met before anything is crated. That is most of why this work is ordered from outside the UAE at all — the buyer sends a drawing and a quantity, and what comes back is a measured report against it rather than an assurance. Where a line is waiting on a first article, it can travel ahead of the balance.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'West & Central Africa',
      'CIS & Caucasus',
      'South-East Asia',
      'Western & Northern Europe',
      'North America & Caribbean',
    ],
  },
  'quality-control': {
    heading: 'Where the documentation travels',
    body: 'Documentation is the part of quality control that has to cross a border intact. Material certificates, dimensional reports and pressure-test records travel with the consignment rather than following it, because a receiving inspection abroad reads the paperwork — very little is re-measured on arrival, and a crate that turns up without its records is a crate that waits. Tell us at order what your inspection scope requires and it is built into the production record rather than reconstructed from it afterwards.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'Western & Northern Europe',
      'North America & Caribbean',
      'CIS & Caucasus',
      'South-East Asia',
      'Central & South-East Europe',
    ],
  },
}

/** The reach section for one designed capability page, or null if it has none. */
export function designedPageMarketReach(pageKey: string): MarketReach | null {
  return buildMarketReach(pageKey, DESIGNED_PAGE_REACH_PROFILES[pageKey])
}
