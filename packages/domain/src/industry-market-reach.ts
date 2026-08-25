/**
 * The delivery-reach section on an industry page — profiles only.
 *
 * Engine, exclusions and honesty rules are in `./market-reach`.
 *
 * Keyed by industry slug rather than by a category, because there are only
 * seven industry pages and each one already IS a category. Six are rows in the
 * `industries` table; `data-center-liquid-cooling` is a designed page whose
 * record lives in `industry-pages.ts`. Both render from the same map, and
 * `industry-market-reach.test.ts` in @indus/db checks the map against the
 * published rows plus `designedIndustrySlugs()` so a new industry cannot ship
 * without someone deciding what is true of it.
 *
 * WHY THE REGIONS ARE NOT THE SAME FOUR EVERYWHERE. An industry page is the
 * one surface where the sector genuinely determines the geography — mining
 * money is in Southern Africa and the Andes, marine money is on the Singapore
 * and Suez lanes, steel is where the mills are. Copying the blog's region set
 * across all seven would have been the doorway-page shape with extra steps.
 * The GCC still leads every one of them: it is the home lane and where the
 * warehouse is, whatever the sector.
 */
import { buildMarketReach } from './market-reach'

import type { MarketReach, MarketReachProfile } from './market-reach'

export const INDUSTRY_REACH_PROFILES: Readonly<Record<string, MarketReachProfile>> = {
  'oil-gas': {
    heading: 'Where we supply oil and gas operations',
    body: 'Oilfield buying is governed by certification more than by geography: an API pressure class and a material class mean the same thing in Basra as in Port Harcourt, and the mill and test records travel with the goods either way. We supply hose, pressure-control equipment and flow-iron spares from Dubai into the basins that buy them, and on most of these lanes it is the documentation rather than the freight that sets the timeline.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'West & Central Africa',
      'CIS & Caucasus',
      'North Africa',
      'South America',
      'North America & Caribbean',
    ],
  },
  marine: {
    heading: 'Where we supply vessels and offshore operators',
    body: 'A vessel buys where it calls, so marine supply is a question of ports rather than of countries. Deck equipment hose, splash-zone assemblies and stainless fittings ship from Dubai to the agent or the yard against a vessel name and a call date, with the corrosion specification quoted for the water the ship actually works in rather than for a catalogue average.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'South-East Asia',
      'East Africa',
      'Western & Northern Europe',
      'North Africa',
      'West & Central Africa',
    ],
  },
  mining: {
    heading: 'Where we supply mining operations',
    body: 'Mines are the furthest thing we ship to from a workshop, and that distance is the whole procurement problem: a hose that fails on a haul road is a shift lost, not an hour. So mining orders tend to be kits rather than singles — the assemblies for a machine, held against its hose register and shipped as one consignment. We quote that way from Dubai, and the further the pit, the more the arithmetic favours it.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'Southern Africa',
      'West & Central Africa',
      'South America',
      'East Africa',
      'CIS & Caucasus',
    ],
  },
  construction: {
    heading: 'Where we supply construction fleets',
    body: 'Earthmoving, lifting and concrete plant is the same machinery everywhere, which makes it the easiest fleet to supply across a border: a boom hose for a given model is that hose whoever owns the machine. We build to the measurements or to the OEM reference and ship from Dubai, and fleet operators generally send us the machine and the hose position rather than a part number, which is enough to work from.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'East Africa',
      'West & Central Africa',
      'Southern Africa',
      'North Africa',
      'South-East Asia',
    ],
  },
  power: {
    heading: 'Where we supply generation and water plant',
    body: 'Power and water plant is maintained around scheduled outages, and that changes what is worth doing: the work is known weeks ahead, the parts list can be assembled in advance, and freight can take the cheap route because nothing is urgent. Send us the outage scope and we will quote it as one package from Dubai against the outage date rather than against dispatch, with anything genuinely urgent priced separately as the exception it is.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'North Africa',
      'East Africa',
      'South-East Asia',
      'Southern Africa',
      'CIS & Caucasus',
    ],
  },
  steel: {
    heading: 'Where we supply mills and metals plant',
    body: 'In a mill it is radiant heat that sets hose life, not pressure, so the specification argument is about cover, sleeving and routing rather than about grade alone. That argument holds wherever the mill is. We supply the high-temperature constructions and the protection to go with them from Dubai, quoted against the hot-side conditions the plant actually runs rather than against an ambient rating.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'South-East Asia',
      'CIS & Caucasus',
      'North Africa',
      'Southern Africa',
      'Central & South-East Europe',
    ],
  },
  'data-center-liquid-cooling': {
    heading: 'Where we supply liquid-cooling components',
    body: 'Liquid-cooling components are bought to a drawing and a material specification, and both are portable — 316L to a dimensioned drawing is the same part for a facility water loop in any jurisdiction. We supply standard and drawing-based stainless valves, fittings and flanges from Dubai with material records and project-defined inspection documentation, which is what a data centre commissioning pack asks for wherever the hall is being built.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'Western & Northern Europe',
      'North America & Caribbean',
      'South-East Asia',
      'Central & South-East Europe',
    ],
  },
}

/** The reach section for one industry page, or null when it has no profile. */
export function industryMarketReach(slug: string): MarketReach | null {
  return buildMarketReach(slug, INDUSTRY_REACH_PROFILES[slug])
}
