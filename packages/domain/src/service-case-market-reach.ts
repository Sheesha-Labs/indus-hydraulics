/**
 * The delivery-reach section on a service case — profiles only.
 *
 * Engine, exclusions and honesty rules are in `./market-reach`.
 *
 * WHY THIS IS RENDERED FROM CODE RATHER THAN STORED AS A BLOCK
 *
 * The blog composes its section into `bodyBlocks` at import time because an
 * article is a block document with an editor behind it, and an author may want
 * to override the section on one article. A service case has an editor too,
 * but nothing here is worth overriding per case — and storing a derived value
 * means every profile edit needs a migration script re-run before it shows.
 * So `/services/[slug]` calls `serviceCaseMarketReach` at request time. Same
 * engine, same component, no stored copy to go stale.
 *
 * NOT EVERY CATEGORY GETS ONE. See `SERVICE_CASE_CATEGORIES_WITHOUT_REACH`.
 * `markets.ts` is explicit that a service area and an export market are
 * different things, precisely so the site never implies a presence abroad, and
 * on a page selling labour rather than goods a "where we deliver this" heading
 * makes that claim no matter how the paragraph underneath is worded.
 *
 * Everything that DOES get one is still checked by `market-reach.test.ts`,
 * which fails on any phrasing that has our engineers travelling or attending a
 * site — the categories below sell goods, and the copy has to keep saying so.
 */
import { buildMarketReach } from './market-reach'

import type { MarketReach, MarketReachProfile } from './market-reach'

/**
 * Categories that deliberately render NO reach section.
 *
 * `field_service` is a van, an engineer and a classroom: its two published
 * cases are a crew day rate and an IWCF/IADC well-control training course.
 * Both are labour delivered in the UAE. A heading reading "where we deliver
 * this" above a list of twelve countries says we run training in Angola and
 * send crews to Kazakhstan, and no wording of the paragraph underneath undoes
 * what the heading and the country list assert together. Nothing about the
 * export business is lost by omitting it — those pages still carry the site
 * footer and the markets hub.
 *
 * This list exists so the omission is a decision on the record rather than an
 * oversight: `market-reach-coverage.test.ts` requires every enum value to
 * appear here or in the profiles, so a new category still cannot ship without
 * someone choosing.
 */
export const SERVICE_CASE_CATEGORIES_WITHOUT_REACH: readonly string[] = ['field_service']

/**
 * Keyed by `ServiceCaseCategory`. Kept as a plain string record rather than
 * importing the Prisma enum — domain does not depend on the generated client.
 * `market-reach-coverage.test.ts` in @indus/db asserts every enum value is
 * either here or excluded above, so the two cannot drift apart unnoticed.
 */
export const SERVICE_CASE_REACH_PROFILES: Readonly<Record<string, MarketReachProfile>> = {
  cylinders: {
    heading: 'Where we send rebuilt cylinders',
    body: 'A cylinder rebuild travels well: it leaves as one crated unit with its bore, rod and seal record attached, and it arrives ready to pin back into the machine. That is why a fair share of this work comes from operators nowhere near Dubai — the alternative is a new cylinder at new-cylinder money, on a lead time set by the OEM rather than by us. Send the bore, the stroke, the mount and photographs of the ports and we will quote the rebuild against them.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'East Africa',
      'West & Central Africa',
      'Southern Africa',
      'South-East Asia',
      'CIS & Caucasus',
    ],
  },
  hoses: {
    heading: 'Where the finished assemblies go',
    body: 'Assemblies are cut to length in Dubai, crimped, tagged, pressure-tested and crated, and that is exactly what makes them practical to send somewhere with no hose shop of its own. A batch built to a measured list travels as one consignment with its test records and arrives ready to fit rather than ready to be made up. The further the site, the larger that difference gets.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'East Africa',
      'West & Central Africa',
      'Southern Africa',
      'South-East Asia',
      'North Africa',
    ],
  },
  pumps: {
    heading: 'Where we send overhauled pumps',
    body: 'A pump or motor overhaul is worth freighting because the unit is dense, valuable and slow to replace new. It goes back crated with its test sheet — flow and pressure at the settings it was run to — so the receiving workshop has evidence rather than an assurance. Exchange units work the same way across a border as they do across the yard, provided the core comes back.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'Southern Africa',
      'West & Central Africa',
      'CIS & Caucasus',
      'South-East Asia',
      'East Africa',
    ],
  },
  valves_manifolds: {
    heading: 'Where we ship valves and manifolds',
    body: 'A manifold is built to a drawing and tested to a schedule, and both travel with it. That makes it one of the more straightforward things to buy from abroad: the drawing is the specification, the test certificate is the evidence, and neither changes at a border. We quote from a sketch, a hydraulic schematic or a sample, and ship from Dubai against whichever Incoterm the buyer works to.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'West & Central Africa',
      'CIS & Caucasus',
      'Western & Northern Europe',
      'North America & Caribbean',
      'South-East Asia',
    ],
  },
  bop_pressure_control: {
    heading: 'Where this pressure-control work ships',
    body: 'API-rated pressure-control equipment is supplied against the certification the operator is audited to, with mill and test documentation travelling alongside the goods. We ship it from Dubai into the basins that buy it, and on these lanes it is the paperwork rather than the freight that usually sets the timeline — which is the part worth planning around.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'West & Central Africa',
      'CIS & Caucasus',
      'South America',
      'North America & Caribbean',
      'North Africa',
    ],
  },
  ct_wireline: {
    heading: 'Where coiled tubing and wireline kit ships',
    body: 'Coiled tubing and wireline spreads move between basins, and the equipment that supports them moves with the crew. We supply the hose, the pressure-control items and the spares against the same API references wherever the spread is working, with certification prepared before dispatch rather than chased after arrival.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'West & Central Africa',
      'CIS & Caucasus',
      'North America & Caribbean',
      'North Africa',
      'South America',
    ],
  },
  wellhead: {
    heading: 'Where wellhead equipment ships',
    body: 'Wellhead and flow-control equipment is bought against a pressure class and a material class, and those are the same two numbers in every jurisdiction that matters. We supply and refurbish against them from Dubai, with mill certificates and test records travelling with the equipment, so a receiving inspection has documents to check rather than a name to trust.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'West & Central Africa',
      'CIS & Caucasus',
      'North Africa',
      'South America',
      'North America & Caribbean',
    ],
  },
  lab_forensics: {
    heading: 'Where the samples come from, and where the replacements go',
    body: 'A failed hose or a contaminated oil sample is small, light and easy to send, which is why failure analysis is the one thing here that routinely travels towards us before anything travels back. The report goes out by email; the corrected specification goes out as parts, crated from Dubai with the evidence that informed it. Cut the failed section long, label which end was which, and send photographs of the routing before anything is disturbed.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'Western & Northern Europe',
      'North America & Caribbean',
      'South-East Asia',
      'West & Central Africa',
      'CIS & Caucasus',
    ],
  },
  custom_builds: {
    heading: 'Where custom builds ship',
    body: 'Something built to a drawing is the easiest kind of export order to get right, because the drawing settles what "correct" means before anyone quotes. Power packs, manifolds and bespoke assemblies leave Dubai tested, tagged and crated against that drawing, with the test schedule in the box. We are as happy to work from grid paper and a photograph as from a CAD file.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'West & Central Africa',
      'CIS & Caucasus',
      'South-East Asia',
      'Western & Northern Europe',
      'Southern Africa',
    ],
  },
}

/**
 * The reach section for one service case, or null when its category has no
 * profile — which should be impossible, and is a missing section rather than a
 * wrong one if it ever happens.
 */
export function serviceCaseMarketReach(slug: string, category: string): MarketReach | null {
  return buildMarketReach(slug, SERVICE_CASE_REACH_PROFILES[category])
}
