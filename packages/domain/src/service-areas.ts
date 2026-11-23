/**
 * On-site service coverage areas.
 *
 * These are areas we SERVICE, not places we have premises. That distinction
 * is load-bearing and it drives the schema: the pages built from this data
 * emit `Service` with `areaServed`, never a per-area `LocalBusiness`.
 * `apps/web/src/lib/site-locations.ts` carries the warning in full — emitting
 * LocalBusiness for an address that does not exist risks the site being
 * penalised for false business presence, and there is exactly one verified
 * office (Dubai HQ).
 *
 * Copy here therefore says "we service on site in X" and never "our X branch".
 *
 * No response times. Zone arrival commitments are operational promises, and an
 * unmet one is worse than none published — assistants will quote it back.
 */

export type ServiceArea = {
  slug: string
  /** Display name, used in headings and the WhatsApp prefill. */
  name: string
  /** Emirate or region line shown above the heading. */
  region: string
  /** One-sentence summary — also the meta description base. */
  summary: string
  /**
   * Optional search title and meta description. Without them the page uses
   * "Hydraulic hose service in <name>" and `summary`.
   */
  metaTitle?: string
  metaDescription?: string
  /** Opening paragraph on the page. */
  intro: string
  /** Industrial zones and sub-areas, for on-page specificity and long-tail. */
  zones: string[]
  /** Common spellings people actually search. Rendered once, low-key. */
  alternateNames: string[]
  /** What the hydraulics on the ground here actually are. */
  demand: string[]
  /** What governs a visit here — the honest constraint, per area. */
  constraint: { label: string; detail: string }
  /** Blog article slugs most relevant to this area. */
  relatedArticles: string[]
  /**
   * Catalogue category slugs to funnel into, most relevant first. Six to
   * eight: the stocked-ranges band is where a location page hands a reader to
   * the catalogue, and two cards (the old count) left most of the page's
   * buyers with nothing to click.
   */
  relatedCategories: string[]
  /**
   * Industry slugs (`Industry.slug`) whose work dominates here. Drives the
   * industry cards, which carry the industry's own hero photograph.
   */
  industries: string[]
  /**
   * Where the area's marker sits on the UAE map, `[longitude, latitude]`,
   * WGS 84 — the centre of its industrial zones, not of the city. Also the
   * point the straight-line distance from the hose bay is measured to.
   */
  coords: readonly [number, number]
  /**
   * Which side of the marker its map label sits. The northern emirates sit
   * within 40 km of each other, so labels alternate sides to stay legible.
   */
  labelSide: 'left' | 'right'
  /**
   * The English Wikipedia article for the emirate or region — `sameAs` on the
   * `AdministrativeArea` the Service JSON-LD names, which is what lets a
   * search engine resolve "Habshan and Al Dhafra" to a known place.
   */
  wikipedia: string
  position: number
}

/**
 * The Dubai hose bay, `[longitude, latitude]` — Al Qusais Industrial Area, the
 * one verified premises (see `OFFICES` in apps/web/src/lib/site-locations.ts).
 * Every distance on the location pages is measured from here.
 */
export const HOSE_BAY_COORDS: readonly [number, number] = [55.383, 25.28]

export const SERVICE_AREAS: ServiceArea[] = [
  {
    slug: 'dubai',
    name: 'Dubai',
    region: 'United Arab Emirates',
    summary:
      'On-site hydraulic hose assembly and replacement across Al Quoz, Ras Al Khor, Jebel Ali and Dubai Investment Park, from our Dubai base.',
    // Owns local repair / service intent. The hose roots own "hydraulic hose
    // suppliers" (hydraulic-hose-fittings-suppliers-uae) and "industrial hose"
    // (industrial-hose-suppliers-uae) — GSC 2026-11-20 had all three at 70–77.
    metaTitle: 'Hydraulic Hose Repair & Assembly in Dubai',
    metaDescription:
      'Hydraulic hose repair in Dubai: bring a failed assembly to our Dubai hose bay, or have one made at the machine in Al Quoz, Ras Al Khor, Jebel Ali or DIP.',
    intro:
      'Dubai is where our hose bay is, which makes it the one area where bringing an assembly in and having one built at the machine are genuinely close calls. Both are available; which is faster depends on whether the machine can move and what the traffic is doing.',
    zones: [
      'Al Quoz',
      'Ras Al Khor',
      'Jebel Ali and JAFZA',
      'Dubai Investment Park',
      'Al Qusais',
      'Al Aweer',
    ],
    alternateNames: ['Al Qouz', 'Jabal Ali', 'DIP'],
    demand: [
      'Workshops and fabricators across Al Quoz and Ras Al Khor',
      'Port and terminal handling equipment at Jebel Ali',
      'Construction plant — excavators, cranes, concrete pumps',
      'Transport fleets, tippers and transit mixers',
    ],
    constraint: {
      label: 'Traffic windows and site induction',
      detail:
        'Distance is rarely the issue in Dubai; the working day is. Where a site needs induction before a contractor can work, arranging it ahead of a failure is worth more than any amount of speed afterwards.',
    },
    relatedArticles: [
      'on-site-hydraulic-hose-service-uae',
      'getting-a-hydraulic-hose-made',
      'bulk-hose-refit-and-tagging',
      'port-equipment-hydraulic-hose',
      'concrete-pump-hydraulic-hose',
      'how-to-read-a-hose-layline',
    ],
    relatedCategories: [
      'hydraulic-hose-fittings-suppliers-uae',
      'hydraulic-hoses',
      'hydraulic-hose-assemblies',
      'crimp-ferrules',
      'hydraulic-adapters',
      'quick-couplers',
      'industrial-hose-suppliers-uae',
      'lifting-rigging-equipment-uae',
    ],
    industries: ['construction', 'marine', 'steel'],
    coords: [55.23, 25.13],
    labelSide: 'left',
    wikipedia: 'https://en.wikipedia.org/wiki/Dubai',
    position: 1,
  },
  {
    slug: 'abu-dhabi',
    name: 'Abu Dhabi',
    region: 'United Arab Emirates',
    summary:
      'On-site hydraulic hose service across Mussafah, ICAD and the Abu Dhabi industrial belt, plus certified assemblies for plant and rig work.',
    intro:
      'Mussafah and ICAD hold the densest concentration of heavy-fleet workshops and fabricators in Abu Dhabi. The hydraulics are varied and the work is largely conventional — the planning item is site access rather than the hose.',
    zones: [
      'Mussafah M9, M11, M16',
      'ICAD I, II and III',
      'KIZAD and Khalifa Port',
      'Abu Dhabi city and the islands',
    ],
    alternateNames: ['Musaffah', 'Musafah', 'Abu Dhabi'],
    demand: [
      'Heavy fleet and plant workshops across the Mussafah M-blocks',
      'Fabrication and steel, marine and offshore support',
      'Port and terminal equipment at Khalifa Port and KIZAD',
      'Construction plant on the Abu Dhabi programme',
    ],
    constraint: {
      label: 'Gate passes and site access',
      detail:
        'Most Mussafah and ICAD work can be dispatched and inducted the same day. Restricted and industrial-estate sites need passes arranged in advance — tell us the access regime when you call, not at the gate.',
    },
    relatedArticles: [
      'on-site-hydraulic-hose-service-uae',
      'rig-site-hose-replacement-abu-dhabi',
      'excavator-hydraulic-hose-replacement',
      'port-equipment-hydraulic-hose',
      'mobile-crane-hydraulic-hose',
      'hose-register-and-replacement-programme',
    ],
    relatedCategories: [
      'hydraulic-hose-fittings-suppliers-uae',
      'hydraulic-hoses',
      'hydraulic-hose-assemblies',
      'hydraulic-adapters',
      'oil-gas-hoses',
      'hammer-union-suppliers-uae',
      'lifting-rigging-equipment-uae',
      'marine-equipment-uae',
    ],
    industries: ['oil-gas', 'construction', 'marine', 'steel'],
    coords: [54.5, 24.355],
    labelSide: 'left',
    wikipedia: 'https://en.wikipedia.org/wiki/Abu_Dhabi',
    position: 2,
  },
  {
    slug: 'habshan',
    name: 'Habshan and Al Dhafra',
    region: 'Abu Dhabi · Western Region',
    summary:
      'Hydraulic hose service and certified assemblies for drilling, gas processing and plant hydraulics across Habshan and the Al Dhafra region.',
    intro:
      'Habshan and the wider Al Dhafra region are gas and processing country, and the access regime reflects it. The hose work itself is often straightforward; the permit, the escort and the training verification are what set the timeline.',
    zones: [
      'Habshan',
      'Al Dhafra region',
      'Ruwais industrial area',
      'Western Region drilling and plant sites',
    ],
    alternateNames: ['Habshan', 'Al Dhafrah', 'Western Region'],
    demand: [
      'Drilling and workover rig hydraulics — HPUs, tongs, catwalks and auxiliaries',
      'Gas processing plant hydraulics and valve actuation',
      'Certified oilfield assemblies to API 7K, 16C and 16D',
      'Planned shutdown and turnaround hose scopes',
    ],
    constraint: {
      label: 'Permit to work and verified training',
      detail:
        'Access is the binding constraint, not availability. Permit to work, escorted movement and verified safety training including H₂S awareness are entry conditions that cannot be resolved on the day — which is why pre-staging the critical assemblies pays for itself here more than anywhere.',
    },
    relatedArticles: [
      'rig-site-hose-replacement-abu-dhabi',
      'api-7k-16c-16d-which-standard',
      'api-7k-rotary-vibrator-hose',
      'cementing-and-drilling-fluid-equipment',
      'hose-register-and-replacement-programme',
    ],
    relatedCategories: [
      'oil-gas-hoses',
      'drilling-hoses',
      'well-control-hoses',
      'hydraulic-hose-assemblies',
      'hammer-union-suppliers-uae',
      'flow-iron-wellhead-equipment-uae',
      'oilfield-valve-suppliers-uae',
      'rig-hardware',
    ],
    industries: ['oil-gas', 'power'],
    coords: [53.63, 23.84],
    labelSide: 'right',
    wikipedia: 'https://en.wikipedia.org/wiki/Al_Dhafra_Region',
    position: 3,
  },
  {
    slug: 'sharjah',
    name: 'Sharjah',
    region: 'United Arab Emirates',
    summary:
      'On-site hydraulic hose assembly across Sajja and the Sharjah industrial areas, where several jobs usually fit into one visit.',
    intro:
      'Sajja and the Sharjah industrial areas hold one of the densest concentrations of workshops, fabricators and transport fleets in the country. The practical consequence is that a single mobilisation frequently covers several machines within a few streets.',
    zones: [
      'Sajja',
      'Industrial Areas 10, 11, 13 and 15',
      'Hamriyah Free Zone',
      'Sharjah Airport Free Zone',
    ],
    alternateNames: ['Al Sajaa', 'Saja’a', 'Sharjah Industrial Area'],
    demand: [
      'Manufacturing and assembly workshops',
      'Transport and haulage fleets, tippers and mixers',
      'Presses, lifts and workshop equipment',
      'Small plant and materials handling',
    ],
    constraint: {
      label: 'Batching, not distance',
      detail:
        'Nothing is far away here, so the lever is how many machines you can put in front of one visit. Tell us everything that is waiting when you call rather than one machine at a time — the mobilisation is the cost, not the extra assembly.',
    },
    relatedArticles: [
      'hose-service-northern-emirates',
      'on-site-hydraulic-hose-service-uae',
      'tipper-and-transit-mixer-hose',
      'forklift-hydraulic-hose-replacement',
      'truck-crane-hydraulic-hose',
    ],
    relatedCategories: [
      'hydraulic-hose-fittings-suppliers-uae',
      'hydraulic-hoses',
      'hydraulic-adapters',
      'hydraulic-fittings',
      'quick-couplers',
      'industrial-hose-suppliers-uae',
      'cylinders',
      'pneumatics',
    ],
    industries: ['construction', 'steel'],
    coords: [55.45, 25.31],
    labelSide: 'right',
    wikipedia: 'https://en.wikipedia.org/wiki/Sharjah',
    position: 4,
  },
  {
    slug: 'ajman',
    name: 'Ajman',
    region: 'United Arab Emirates',
    summary:
      'On-site hydraulic hose service across the Ajman industrial areas, where turnaround is usually decided by parts availability rather than access.',
    intro:
      'Ajman is generally the least encumbered of the Northern Emirates on site access, and that has a clear effect: turnaround here is decided almost entirely by whether the hose and fittings are already on the van.',
    zones: ['Ajman Industrial Area 1 and 2', 'Al Jurf', 'Ajman Free Zone'],
    alternateNames: ['Ajman Industrial', 'Al Jurf'],
    demand: [
      'Industrial units and light manufacturing',
      'Transport fleets and small plant',
      'Workshop and materials handling equipment',
    ],
    constraint: {
      label: 'Parts on the van',
      detail:
        'Access is rarely the problem, so the difference between one visit and two is whether we knew the bore, construction and fitting type before setting off. Have those ready when you call.',
    },
    relatedArticles: [
      'hose-service-northern-emirates',
      'getting-a-hydraulic-hose-made',
      'forklift-hydraulic-hose-replacement',
      'how-to-read-a-hose-layline',
    ],
    relatedCategories: [
      'hydraulic-hose-fittings-suppliers-uae',
      'crimp-ferrules',
      'hydraulic-hoses',
      'hydraulic-adapters',
      'quick-couplers',
      'pneumatics',
    ],
    industries: ['construction', 'marine'],
    coords: [55.5, 25.395],
    labelSide: 'left',
    wikipedia: 'https://en.wikipedia.org/wiki/Ajman',
    position: 5,
  },
  {
    slug: 'ras-al-khaimah',
    name: 'Ras Al Khaimah',
    region: 'United Arab Emirates',
    summary:
      'On-site hydraulic hose service for quarrying, crushing and cement plant across Ras Al Khaimah and Khor Khwair.',
    intro:
      'Ras Al Khaimah is quarry country, and quarry hydraulics fail from the outside in. Airborne dust turns every contact point abrasive, so the same run tends to fail repeatedly on the same machine until the routing changes rather than the grade.',
    zones: ['Khor Khwair', 'RAK Industrial Area', 'RAK Maritime City', 'Al Ghail'],
    alternateNames: ['RAK', 'Khor Khuwair', 'Ras al Khaima'],
    demand: [
      'Quarrying, crushing and screening plant',
      'Cement and aggregate handling',
      'Heavy haulage and tipper fleets',
      'Port and bulk handling equipment',
    ],
    constraint: {
      label: 'Abrasion, and plant that cannot stop mid-shift',
      detail:
        'The useful visit here is the one where somebody looks at why a run keeps failing — a clamp that has gone, a guard never fitted, a route that should have changed when the attachment did. A heavier hose in the same bad position fails the same way, slightly later.',
    },
    relatedArticles: [
      'hose-service-northern-emirates',
      'why-hydraulic-hoses-fail',
      'hose-routing-bend-radius-twist',
      'quarry-and-crusher-fittings',
      'excavator-hydraulic-hose-replacement',
    ],
    relatedCategories: [
      'hydraulic-hoses',
      'hydraulic-hose-fittings-suppliers-uae',
      'hydraulic-hose-assemblies',
      'abrasive-hoses',
      'industrial-hose-suppliers-uae',
      'lifting-rigging-equipment-uae',
      'industrial-lubricant-suppliers-uae',
    ],
    industries: ['mining', 'construction', 'marine'],
    coords: [55.99, 25.8],
    labelSide: 'right',
    wikipedia: 'https://en.wikipedia.org/wiki/Ras_Al_Khaimah',
    position: 7,
  },
  {
    slug: 'fujairah',
    name: 'Fujairah',
    region: 'United Arab Emirates · East Coast',
    summary:
      'On-site hydraulic and industrial hose service for port, bunkering and quarry equipment across Fujairah and the east coast.',
    intro:
      'Fujairah pairs one of the world’s largest bunkering ports with the east-coast quarry belt. On the port side a hose failure is measured against a berth window rather than machine-hours, which changes the economics of a callout entirely.',
    zones: ['Port of Fujairah', 'Fujairah Free Zone and FOIZ', 'Dibba and Masafi quarry belt'],
    alternateNames: ['Fujeirah', 'Fujayrah', 'Port of Fujairah'],
    demand: [
      'Bunkering and fuel transfer equipment',
      'Port and terminal handling plant',
      'Quarrying and crushing along the east coast',
      'Marine and offshore support vessels',
    ],
    constraint: {
      label: 'Port access and the berth window',
      detail:
        'Gate passes and site induction are not arranged at short notice. Customers who work to vessel schedules benefit disproportionately from having the paperwork in place before it is needed rather than starting it during a failure.',
    },
    relatedArticles: [
      'hose-service-northern-emirates',
      'industrial-hose-is-not-hydraulic-hose',
      'chemical-transfer-hose-selection',
      'marine-hose-fuel-exhaust-and-bilge',
      'port-and-terminal-fittings',
      'quarry-and-crusher-fittings',
    ],
    relatedCategories: [
      'industrial-hose-suppliers-uae',
      'composite-hoses',
      'marine-hoses',
      'dry-disconnect-couplings',
      'breakaway-couplings',
      'hydraulic-hoses',
      'marine-equipment-uae',
      'abrasive-hoses',
    ],
    industries: ['marine', 'oil-gas', 'mining'],
    coords: [56.36, 25.17],
    labelSide: 'right',
    wikipedia: 'https://en.wikipedia.org/wiki/Fujairah',
    position: 8,
  },
  {
    slug: 'umm-al-quwain',
    name: 'Umm Al Quwain',
    region: 'United Arab Emirates',
    summary:
      'On-site hydraulic hose service across Umm Al Thuoob, the UAQ Free Trade Zone and the marine works along the Umm Al Quwain coast.',
    intro:
      'Umm Al Quwain sits on the northern run between Ajman and Ras Al Khaimah. Its industrial work is concentrated in a small number of zones, which makes it straightforward to cover well when a visit is planned as part of that run rather than as a trip of its own.',
    zones: [
      'Umm Al Thuoob industrial area',
      'UAQ Free Trade Zone',
      'Ahmed Bin Rashid Port and Free Zone',
      'Umm Al Quwain old industrial area',
    ],
    alternateNames: ['UAQ', 'Umm al-Quwain', 'Umm Al Thuob'],
    demand: [
      'Light manufacturing and fabrication units',
      'Marine, boatyard and coastal works equipment',
      'Transport fleets and construction plant on the northern corridor',
      'Workshop presses, lifts and materials handling',
    ],
    constraint: {
      label: 'Planning it into the northern run',
      detail:
        'Distance is modest, but a visit for a single assembly is the expensive way to do it. Tell us what else is waiting in Ajman, Umm Al Quwain or Ras Al Khaimah when you call, and the visit can cover all of it.',
    },
    relatedArticles: [
      'hose-service-northern-emirates',
      'getting-a-hydraulic-hose-made',
      'why-hydraulic-hoses-fail',
      'marine-hose-fuel-exhaust-and-bilge',
    ],
    relatedCategories: [
      'hydraulic-hoses',
      'hydraulic-hose-fittings-suppliers-uae',
      'hydraulic-adapters',
      'industrial-hose-suppliers-uae',
      'marine-equipment-uae',
      'lifting-rigging-equipment-uae',
    ],
    industries: ['marine', 'construction'],
    coords: [55.69, 25.58],
    labelSide: 'left',
    wikipedia: 'https://en.wikipedia.org/wiki/Umm_Al_Quwain',
    position: 6,
  },
  {
    slug: 'al-ain',
    name: 'Al Ain',
    region: 'Abu Dhabi · Al Ain Region',
    summary:
      'On-site hydraulic hose service for quarry, cement, construction and farm machinery across the Al Ain industrial areas and the wider Al Ain region.',
    intro:
      'Al Ain is the furthest inland area we cover from the Dubai hose bay, and the work reflects the region: quarrying and aggregate plant, cement and block making, construction fleets and a large amount of agricultural machinery. Because the trip is planned rather than improvised, what is known before we set off decides how much gets done in one visit.',
    zones: [
      'Al Ain Industrial Area (Sanaiya)',
      'Al Ain Industrial City',
      'Quarry and crusher sites across the Al Ain region',
      'Farms and agricultural estates',
    ],
    alternateNames: ['Al-Ain', 'Sanaiya Al Ain', 'Al Ain Industrial'],
    demand: [
      'Quarrying, crushing and aggregate plant',
      'Cement, block and precast manufacturing',
      'Construction plant and municipal fleets',
      'Tractors, loaders and agricultural machinery',
    ],
    constraint: {
      label: 'Inland distance and dust',
      detail:
        'The bore, the hose construction and both fitting types decide whether the right parts go out on the first trip, so have them ready when you call. Inland dust wears unguarded hose at every contact point, and a visit is a good moment to look at why a run keeps failing as well as replacing it.',
    },
    relatedArticles: [
      'on-site-hydraulic-hose-service-uae',
      'why-hydraulic-hoses-fail',
      'excavator-hydraulic-hose-replacement',
      'quarry-and-crusher-fittings',
      'hose-routing-bend-radius-twist',
    ],
    relatedCategories: [
      'hydraulic-hoses',
      'hydraulic-hose-fittings-suppliers-uae',
      'hydraulic-hose-assemblies',
      'hydraulic-adapters',
      'abrasive-hoses',
      'cylinders',
      'hydraulic-pumps',
      'lifting-rigging-equipment-uae',
    ],
    industries: ['mining', 'construction'],
    coords: [55.75, 24.2],
    labelSide: 'right',
    wikipedia: 'https://en.wikipedia.org/wiki/Al_Ain',
    position: 9,
  },
]
export function serviceAreaBySlug(slug: string): ServiceArea | undefined {
  return SERVICE_AREAS.find((a) => a.slug === slug)
}

export function serviceAreasOrdered(): ServiceArea[] {
  return [...SERVICE_AREAS].sort((a, b) => a.position - b.position)
}

/** Names for `areaServed` on the Service JSON-LD. */
export function serviceAreaNames(): string[] {
  return serviceAreasOrdered().map((a) => a.name)
}

/** Great-circle distance in km between two `[longitude, latitude]` points. */
export function kmBetween(a: readonly [number, number], b: readonly [number, number]): number {
  const rad = Math.PI / 180
  const dLat = (b[1] - a[1]) * rad
  const dLon = (b[0] - a[0]) * rad
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLon / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}

/**
 * Straight-line distance from the Dubai hose bay to an area, rounded to the
 * nearest 5 km. Straight line, not road: the page says so beside the figure,
 * because a road distance would be a routing claim nobody here maintains.
 */
export function hoseBayDistanceKm(area: Pick<ServiceArea, 'coords'>): number {
  return Math.max(5, Math.round(kmBetween(HOSE_BAY_COORDS, area.coords) / 5) * 5)
}

/** The areas nearest to this one, nearest first. */
export function nearestServiceAreas(area: ServiceArea, count = 3): ServiceArea[] {
  return serviceAreasOrdered()
    .filter((other) => other.slug !== area.slug)
    .map((other) => ({ other, km: kmBetween(area.coords, other.coords) }))
    .sort((x, y) => x.km - y.km)
    .slice(0, count)
    .map((entry) => entry.other)
}
