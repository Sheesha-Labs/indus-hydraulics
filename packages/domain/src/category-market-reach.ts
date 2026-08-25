/**
 * The delivery-reach section on a catalogue category page — profiles only.
 *
 * Engine, exclusions and honesty rules are in `./market-reach`.
 *
 * KEYED BY ROOT CATEGORY, SEEDED BY THE PAGE'S OWN SLUG. There are 194
 * published categories under 17 roots, and writing 194 paragraphs would mean
 * 194 chances to say something untrue about freight. A root's paragraph is
 * true of everything beneath it — "ferrules" and "banjo bolts" ship the same
 * way — while the seed is the category's own slug, so two sub-categories under
 * one root still name different destinations and the section is not 46
 * identical blocks under Hoses & Fittings.
 *
 * WHY CATEGORIES GET THE FULL SECTION AND PRODUCTS GET ONE LINE
 *
 * 194 categories x 12 links is ~2,300, the same order as the blog, spread over
 * genuine topical hubs that buyers actually land on from search. 1,487 product
 * pages x 12 would be ~17,800 links of identical shape across the thinnest and
 * most template-similar pages on the site, which is the doorway-page pattern
 * the Al Feel teardown identifies at a scale where it would be the site's
 * dominant link signal. Product pages carry `ProductExportNote` instead: one
 * sentence, one link to the hub. See that component for the rest of it.
 */
import { buildMarketReach } from './market-reach'

import type { MarketReach, MarketReachProfile } from './market-reach'

/**
 * One profile per ROOT category slug. Sub-categories inherit their root's.
 *
 * `category-market-reach.test.ts` in @indus/db checks these against the
 * published root categories, so a new root cannot ship without a paragraph and
 * a stale one cannot linger after a rename.
 */
export const CATEGORY_REACH_PROFILES: Readonly<Record<string, MarketReachProfile>> = {
  'hydraulic-hose-fittings-suppliers-uae': {
    heading: 'Where we ship hose and fittings',
    body: 'Hose and fittings are the bulk of what leaves this warehouse, and they travel well: a crated batch of assemblies with its crimp records, or a box of adapters on an airway bill. Buyers outside the UAE usually order to a measured list rather than to a part number, because a hose is defined by its ends, its length and its route rather than by a code. Send those and we will quote against them.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'East Africa',
      'West & Central Africa',
      'Southern Africa',
      'South-East Asia',
      'North Africa',
    ],
  },
  'industrial-hose-suppliers-uae': {
    heading: 'Where we supply industrial hose',
    body: 'Industrial hose and the couplings that go on it are usually bought together, and both ship the same way: bulk lengths on the reel, made-up suction and delivery assemblies crated with their couplings already fitted, and loose couplings boxed. Where the duty is food-grade, chemical or steam the certificate is a large part of what is being purchased, so that documentation is prepared before dispatch rather than chased afterwards.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'North Africa',
      'East Africa',
      'Western & Northern Europe',
      'South-East Asia',
      'Southern Africa',
    ],
  },
  'oil-gas-hoses': {
    heading: 'Where we ship oilfield hose',
    body: 'Rotary, vibrator, choke and kill hose is bought against an API reference and a pressure class, and those mean the same thing in every basin that buys them. Assemblies leave Dubai with their test records and their certification travelling alongside, because a receiving inspection on this class of hose checks documents rather than appearance. On most of these lanes the paperwork sets the timeline rather than the freight.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'West & Central Africa',
      'CIS & Caucasus',
      'North Africa',
      'South America',
      'North America & Caribbean',
    ],
  },
  'oilfield-valve-suppliers-uae': {
    heading: 'Where we ship oilfield valves',
    body: 'A valve is bought on two numbers — pressure class and material class — and neither changes at a border, which makes this one of the more straightforward things to source from abroad. We supply against them from Dubai with mill certificates and test records in the crate, so the receiving inspection has documents to check rather than a name to trust.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'West & Central Africa',
      'CIS & Caucasus',
      'North Africa',
      'South America',
      'North America & Caribbean',
    ],
  },
  'flow-iron-wellhead-equipment-uae': {
    heading: 'Where flow iron and wellhead equipment ships',
    body: 'Flow iron is heavy, standardised and slow to source locally, which is exactly the combination that makes it worth freighting. Unions, pups, swivels and wellhead components ship from Dubai against their figure number and pressure rating, crated with mill and test documentation. Sea freight is normally the right answer here — the weight punishes air and the work is usually planned.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'West & Central Africa',
      'CIS & Caucasus',
      'South America',
      'North Africa',
      'North America & Caribbean',
    ],
  },
  'blowout-preventers': {
    heading: 'Where BOP equipment and spares ship',
    body: 'Pressure-control equipment is supplied against the certification the operator is audited to, and the documentation is the deliverable as much as the hardware is. Stacks, spares and elastomer kits ship from Dubai with their records; on these lanes the certification and the customs classification set the timeline more reliably than the freight does, which is the part worth planning around.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'West & Central Africa',
      'CIS & Caucasus',
      'South America',
      'North Africa',
      'North America & Caribbean',
    ],
  },
  'drilling-workover-systems': {
    heading: 'Where drilling and workover equipment ships',
    body: 'Rig equipment moves between contracts, and the spares that support it move with the rig rather than with the country. We supply against the same API references wherever the rig is working and ship from Dubai, which is a short lane to most of the Gulf and a well-served one to the basins beyond it. Send the rig make and the assembly rather than a part number if that is what you have.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'West & Central Africa',
      'CIS & Caucasus',
      'North Africa',
      'South-East Asia',
      'South America',
    ],
  },
  'well-testing-equipment': {
    heading: 'Where well testing equipment ships',
    body: 'Well testing spreads are mobilised for a campaign and demobilised after it, so the equipment behind them is bought against a schedule rather than held as stock. That suits an export lane: the scope is known ahead, the certification can be prepared in advance, and freight can take the economical route because the date that matters is the campaign date rather than the dispatch date. Send us the scope and we will quote to the former.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'West & Central Africa',
      'CIS & Caucasus',
      'South America',
      'North Africa',
      'South-East Asia',
    ],
  },
  'fracturing-equipment': {
    heading: 'Where fracturing equipment ships',
    body: 'Fracturing service lines are consumable in a way most oilfield equipment is not — the duty is abrasive and the replacement interval is short, so what gets ordered is a schedule of wear parts rather than a one-off. Ordering that schedule as a single consignment from Dubai is usually cheaper than replacing items singly, and it keeps the certification consistent across the spread.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'North America & Caribbean',
      'CIS & Caucasus',
      'South America',
      'West & Central Africa',
      'North Africa',
    ],
  },
  'stimulation-equipment': {
    heading: 'Where stimulation equipment ships',
    body: 'Acid and stimulation service carries a materials problem before it carries a pressure problem: the wetted parts have to survive what is being pumped, and the specification follows the fluid rather than the rating. We quote against the fluid and the concentration you are actually running and ship from Dubai with the material records attached, which is what a receiving inspection on corrosion-resistant alloy asks for.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'West & Central Africa',
      'CIS & Caucasus',
      'South America',
      'North Africa',
      'North America & Caribbean',
    ],
  },
  'cementing-equipment': {
    heading: 'Where cementing equipment ships',
    body: 'Cementing equipment is abrasive-service hardware bought against a pressure rating and a wear expectation, and the useful order is usually a set rather than a single item. It ships from Dubai crated with its test records; where a job is scheduled the whole set can travel by sea, and only the item that failed unexpectedly needs to go by air.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'West & Central Africa',
      'CIS & Caucasus',
      'North Africa',
      'South America',
      'South-East Asia',
    ],
  },
  'valves-manifolds': {
    heading: 'Where valves and manifolds ship',
    body: 'A manifold is built to a drawing and tested to a schedule, and both travel with it — which makes it one of the easier things to buy across a border, because the drawing settles what correct means before anyone quotes. We work from a schematic, a sketch or a sample, and ship from Dubai against whichever Incoterm the buyer works to.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'West & Central Africa',
      'CIS & Caucasus',
      'Western & Northern Europe',
      'North America & Caribbean',
      'South-East Asia',
    ],
  },
  'hydraulic-pumps': {
    heading: 'Where we ship pumps and motors',
    body: 'Pumps and motors are dense, valuable and slow to replace new, which is the combination that makes freight worth it. New units ship crated from Dubai; exchange units work the same way across a border as across the yard, provided the core comes back. Send the nameplate — displacement, shaft, ports and mount — rather than the machine model, and the identification is usually settled in one exchange.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'Southern Africa',
      'West & Central Africa',
      'CIS & Caucasus',
      'South-East Asia',
      'East Africa',
    ],
  },
  cylinders: {
    heading: 'Where we ship cylinders',
    body: 'A cylinder is defined by its bore, stroke, rod and mounting, and those four numbers travel better than any part number does. New and rebuilt units leave Dubai as single crated items with their seal and test records attached, ready to pin back into the machine. Photographs of the ports and the mount will usually settle the specification faster than a catalogue reference will.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'East Africa',
      'West & Central Africa',
      'Southern Africa',
      'South-East Asia',
      'CIS & Caucasus',
    ],
  },
  'instrumentation-controls': {
    heading: 'Where instrumentation ships',
    body: 'Gauges, transmitters and control items are small, light and calibration-dependent, which makes them the easiest thing here to send by courier and the most important to order against the right range. We ship from Dubai with calibration documentation where the item carries it, and quote against the range and connection you specify rather than the nearest catalogue equivalent.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'Western & Northern Europe',
      'North America & Caribbean',
      'South-East Asia',
      'East Africa',
      'West & Central Africa',
    ],
  },
  'industrial-lubricant-suppliers-uae': {
    heading: 'Where we ship lubricants',
    body: 'Lubricants are the one part of this catalogue where the packaging decides the route: some greases and compounds carry a transport classification that rules out ordinary air freight, and pack size changes the answer as much as chemistry does. We will tell you which applies before you commit to a mode. Batch numbers and technical data sheets travel with the consignment from Dubai, which is what a plant lubrication schedule needs on file.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'East Africa',
      'Southern Africa',
      'South-East Asia',
      'West & Central Africa',
      'North Africa',
    ],
  },
  'seals-accessories': {
    heading: 'Where we ship seals and accessories',
    body: 'Seals, filters and the small hardware around a hydraulic system are light enough that freight rarely decides the order — what decides it is having the right sizes on the shelf when something is opened up. Buyers on longer lanes tend to order these as a kit against a machine rather than singly, which is also how we prefer to quote them. Bring the dimensions or the failed part and we will match it.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'East Africa',
      'West & Central Africa',
      'Southern Africa',
      'South-East Asia',
      'CIS & Caucasus',
    ],
  },
}

/**
 * The reach section for one category page.
 *
 * `rootSlug` is the top of the category's ancestor trail; pass the category's
 * own slug when it IS a root. The seed is always the page's own slug, so
 * sub-categories under one root each name different destinations.
 */
export function categoryMarketReach(slug: string, rootSlug: string): MarketReach | null {
  return buildMarketReach(slug, CATEGORY_REACH_PROFILES[rootSlug])
}

/**
 * The same thing with the home region dropped, for `CategoryDeliveryBand`.
 *
 * That band already exists and already links the five other GCC states, with a
 * transit band on each chip — it shipped in #402 and it is better than a
 * generic row would be, because a chip reading "Saudi Arabia · 3–5 working
 * days" says more than a link does. Repeating those five underneath as plain
 * text would be the same links twice on one page.
 *
 * So the band keeps its chips for the Gulf and gains these three regions for
 * everywhere else, which is the gap it left: a section headed "across the
 * Gulf" that stops at the Gulf, on a catalogue that ships to 126 countries.
 *
 * The dropped region is read off the profile rather than compared against a
 * hardcoded 'GCC & Middle East', so a profile that ever pins a different home
 * region still drops the right one.
 */
export function categoryExportRegions(
  slug: string,
  rootSlug: string
): { body: string; groups: MarketReach['groups'] } | null {
  const profile = CATEGORY_REACH_PROFILES[rootSlug]
  const reach = buildMarketReach(slug, profile)
  if (!reach || !profile) return null
  const groups = reach.groups.filter((g) => g.region !== profile.primaryRegion)
  if (groups.length === 0) return null
  return { body: reach.body, groups }
}
