/**
 * The delivery-reach section on every blog article — the blog's profiles only.
 *
 * The engine lives in `./market-reach`: exclusions, rotation, the pinned lead
 * market and the honesty rules are shared with service cases and industry
 * pages. This file is the eleven paragraphs and the block wrapper.
 *
 * WHAT PROBLEM THIS SOLVES
 *
 * The catalogue ships from one Dubai warehouse to 126 countries and the blog
 * is read from most of them, but an article said nothing about that. A reader
 * in Accra, Almaty or Aberdeen reached the end of a piece on hose failure with
 * no signal that the parts described in it are something we send to them. The
 * markets section carries that message on 126 pages nobody arrives at first.
 *
 * WHY THIS IS GENERATED RATHER THAN WRITTEN PER ARTICLE
 *
 * Ninety-three hand-written delivery paragraphs would drift: one would promise
 * a transit time, one would imply a branch abroad, and both would be wrong in
 * the way `markets.ts` spends its header warning about. Generating the section
 * from a per-category profile means the honesty rules are enforced in one
 * place and tested once — see `market-reach.test.ts`.
 *
 * WHY IT IS NOT THE SAME EIGHT LINKS ON ALL 93 ARTICLES
 *
 * That shape is the doorway-page pattern the Al Feel teardown identifies as
 * the reason a competitor's country pages do not rank, and the blog's own
 * `page_link` budget was capped at twelve articles to avoid it. Three things
 * keep this from being that: the prose is per category and about the *work*;
 * the regions rotate per article; and the countries rotate inside the region.
 * All three live in `./market-reach`.
 *
 * WHY THE BLOG STORES ITS SECTION AND THE OTHER SURFACES DO NOT
 *
 * An article is a block document with an admin editor behind it, so the
 * section is a `market_reach` block composed in at import and overridable per
 * article. Service cases and industry pages render theirs from code at request
 * time — see `service-case-market-reach.ts`. Same engine, same component, and
 * the difference is inherent rather than an inconsistency: only one of the
 * three surfaces has an editor that could hold the block.
 */
import { buildMarketReach } from './market-reach'

import type { MarketReachBlock } from './blog-blocks'
import type { MarketReachProfile } from './market-reach'

/**
 * One profile per blog category.
 *
 * The body is the part that has to be *true of every article in the category*,
 * which is why it talks about how that class of work ships rather than about
 * the article's specific subject. A paragraph that tried to be specific would
 * either be wrong on some of its seventeen articles or say nothing.
 */
export const MARKET_REACH_PROFILES: Readonly<Record<string, MarketReachProfile>> = {
  'buying-hydraulic-fittings': {
    heading: 'Where these orders go',
    body: 'Fittings and adapters are the smallest thing we ship and the one that decides whether a machine works, so they travel the way the destination allows: consolidated into a planned consignment where a site is on a long lane, and on their own airway bill when something is standing still. Orders of this kind are quoted from a photograph and a measurement rather than a part number, which is what makes them practical to place from somewhere with no counter nearby.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'East Africa',
      'West & Central Africa',
      'Southern Africa',
      'North Africa',
      'South-East Asia',
      'CIS & Caucasus',
    ],
  },
  'failure-analysis': {
    heading: 'Where we send the replacement',
    body: 'A failure correctly diagnosed is only worth something if the replacement can reach the machine. Assemblies built to the specification described here are made up and pressure-tested at our Dubai workshop and dispatched with the crimp record and test certificate travelling with them, which counts for more the further the machine sits from a hose shop. Most orders of this kind start as a photograph and a measurement rather than a part number, and that is enough for us to quote from.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'East Africa',
      'West & Central Africa',
      'Southern Africa',
      'South-East Asia',
      'CIS & Caucasus',
      'Western & Northern Europe',
    ],
  },
  'fitting-identification': {
    heading: 'Where we send the adapter',
    body: 'An identified thread usually becomes a small parcel rather than a pallet, and small parcels are the least complicated thing we ship. Adapters, bonded seals and test-point fittings leave Dubai by courier on their own airway bill, so the destination changes the paperwork and the transit rather than the decision to order at all. Send the photograph and the measurements this article describes and we will name the part before we quote it.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'Western & Northern Europe',
      'North America & Caribbean',
      'East Africa',
      'West & Central Africa',
      'South-East Asia',
      'Central & South-East Europe',
    ],
  },
  'gcc-compliance': {
    heading: 'Where these documents have to travel',
    body: 'Conformity registration, attested origin documents and test records are prepared in Dubai before a consignment leaves, which is the whole reason this class of work is run from here rather than at a border. The regimes differ by destination and several of the markets we ship to run their own pre-shipment verification schemes, so the document set is built against where the goods are going rather than assembled once and reused. Tell us the destination with the enquiry and the paperwork is quoted alongside the parts.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'North Africa',
      'East Africa',
      'West & Central Africa',
      'CIS & Caucasus',
      'South-East Asia',
    ],
  },
  'gulf-conditions': {
    heading: 'Where these conditions apply, and where we ship',
    body: 'Heat, salt and airborne sand are not a UAE problem. They set hose life across the whole arc from the Atlantic coast of Africa to the Arabian Sea and on into monsoon Asia, and the cover and fitting arguments in this article travel with them. We supply into those markets from Dubai by road, sea and air, and quote the construction against the conditions at the destination rather than against ours.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'North Africa',
      'East Africa',
      'West & Central Africa',
      'South-East Asia',
      'Southern Africa',
    ],
  },
  'hose-assembly': {
    heading: 'Where the finished assemblies go',
    body: 'Assemblies are cut to length in Dubai, crimped, tagged, pressure-tested and crated, and that is exactly what makes them practical to send somewhere with no hose shop of its own. A batch built to a measured list travels as one consignment with its test records and arrives ready to fit rather than ready to be made up. The further the site, the larger that difference gets.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'East Africa',
      'West & Central Africa',
      'Southern Africa',
      'CIS & Caucasus',
      'South-East Asia',
      'North Africa',
    ],
  },
  'industrial-hose': {
    heading: 'Where we supply this hose',
    body: 'For chemical, food-grade, steam and water hose the certificate is most of what the buyer is actually purchasing, so it is prepared before dispatch rather than chased afterwards. We ship this class of hose from Dubai into plants audited against the same standards we quote to, with the documentation attached to the consignment and referenced on the invoice.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'North Africa',
      'East Africa',
      'Western & Northern Europe',
      'North America & Caribbean',
      'South-East Asia',
    ],
  },
  'machine-down': {
    heading: 'Where we send parts for this machine',
    body: 'A stopped machine in a yard with no hose shop nearby is the situation this catalogue is stocked for. We build the assemblies to the measurements described here and dispatch them from Dubai — by air where the machine is down, by sea where the change is planned. Fleet operators usually send us the machine and the hose position rather than a part number, which is enough to work from.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'East Africa',
      'West & Central Africa',
      'Southern Africa',
      'South-East Asia',
      'North Africa',
      'CIS & Caucasus',
    ],
  },
  'maintenance-reliability': {
    heading: 'Where we support programmes like this',
    body: 'A hose register or a planned replacement programme is easier to run against one supplier than against whatever happens to be available near the site that month, and that is most of why operators outside the UAE set one up with us. The parts list is held against your machines, quoted as a single package, and shipped from Dubai to a date you set rather than to a dispatch date.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'Southern Africa',
      'East Africa',
      'CIS & Caucasus',
      'Western & Northern Europe',
      'West & Central Africa',
      'South-East Asia',
    ],
  },
  'oilfield-pressure-control': {
    heading: 'Where this equipment ships',
    body: 'API-rated hose and pressure-control equipment is supplied against the certification the operator is audited to, with mill and test documentation travelling alongside the goods. We ship it from Dubai into the basins that buy it, and on these lanes it is the paperwork rather than the freight that usually sets the timeline — which is the part worth planning around.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'West & Central Africa',
      'CIS & Caucasus',
      'South America',
      'North America & Caribbean',
      'North Africa',
    ],
  },
  'procurement-export': {
    heading: 'Where we quote and ship',
    body: 'This is an export business run out of one warehouse rather than a network of branches, so the answer to "do you supply my country" is nearly always yes and the real questions are Incoterm, transit and documentation. We quote in AED or USD, ship EXW, FOB, CIF or DAP as the buyer prefers, and prepare certificates of origin and conformity before the consignment leaves. The lanes below are the ones that move most often.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'East Africa',
      'West & Central Africa',
      'Western & Northern Europe',
      'North America & Caribbean',
      'South-East Asia',
      'Southern Africa',
    ],
  },
  safety: {
    heading: 'Where we supply the safety-critical parts',
    body: 'Whip restraints, guarding and correctly rated assemblies are the items an audit asks about, and they are also the hardest things to find in a hurry away from a major supply centre. We ship them from Dubai with the rating documentation attached, so a corrective action closes against evidence rather than against a purchase order.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'Southern Africa',
      'Western & Northern Europe',
      'North America & Caribbean',
      'East Africa',
      'South-East Asia',
    ],
  },
  'specification-standards': {
    heading: 'Where we supply to this standard',
    body: 'SAE, EN, DIN and ISO specifications are the common language of this trade precisely because they do not change at a border — 2SC means the same construction in Rotterdam as it does in Ras Al Khaimah. We supply against the standard quoted rather than against a brand, with the layline and the test certificate as the evidence, and ship from Dubai to wherever the drawing was written.',
    primaryRegion: 'GCC & Middle East',
    // Four, not six. A rotating list is drawn three at a time, so every extra
    // candidate dilutes the two that matter here: standards content is what
    // pulls a European or North American engineer to a Dubai supplier in the
    // first place, and burying it behind East Africa and the Caucasus for
    // breadth's sake spends the slot on a reader who was never going to click.
    rotatingRegions: [
      'Western & Northern Europe',
      'North America & Caribbean',
      'Central & South-East Europe',
      'South-East Asia',
    ],
  },
}

/**
 * The block for one article, or null when its category has no profile.
 *
 * Returning null rather than falling back to a default is deliberate: a new
 * blog category should reach a human who decides what is true of it, not
 * inherit the procurement paragraph by accident.
 */
export function buildMarketReachBlock(
  articleSlug: string,
  categorySlug: string
): MarketReachBlock | null {
  const reach = buildMarketReach(articleSlug, MARKET_REACH_PROFILES[categorySlug])
  if (!reach) return null
  return { type: 'market_reach', ...reach }
}
