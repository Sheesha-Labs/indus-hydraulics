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
  /** Catalogue category slugs to funnel into. */
  relatedCategories: string[]
  position: number
}

export const SERVICE_AREAS: ServiceArea[] = [
  {
    slug: 'dubai',
    name: 'Dubai',
    region: 'United Arab Emirates',
    summary:
      'On-site hydraulic hose assembly and replacement across Al Quoz, Ras Al Khor, Jebel Ali and Dubai Investment Park, from our Dubai base.',
    intro:
      'Dubai is where our hose bay is, which makes it the one area where bringing an assembly in and having one built at the machine are genuinely close calls. Both are available; which is faster depends on whether the machine can move and what the traffic is doing.',
    zones: ['Al Quoz', 'Ras Al Khor', 'Jebel Ali and JAFZA', 'Dubai Investment Park', 'Al Qusais', 'Al Aweer'],
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
    relatedArticles: ['on-site-hydraulic-hose-service-uae', 'getting-a-hydraulic-hose-made', 'bulk-hose-refit-and-tagging'],
    relatedCategories: ['hoses-fittings', 'hydraulic-hoses'],
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
    zones: ['Mussafah M9, M11, M16', 'ICAD I, II and III', 'KIZAD and Khalifa Port', 'Abu Dhabi city and the islands'],
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
    relatedArticles: ['on-site-hydraulic-hose-service-uae', 'rig-site-hose-replacement-abu-dhabi', 'excavator-hydraulic-hose-replacement'],
    relatedCategories: ['hoses-fittings', 'hydraulic-hoses'],
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
    zones: ['Habshan', 'Al Dhafra region', 'Ruwais industrial area', 'Western Region drilling and plant sites'],
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
    relatedArticles: ['rig-site-hose-replacement-abu-dhabi', 'api-7k-16c-16d-which-standard', 'api-7k-rotary-vibrator-hose'],
    relatedCategories: ['oil-gas-hoses', 'drilling-hoses'],
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
    zones: ['Sajja', 'Industrial Areas 10, 11, 13 and 15', 'Hamriyah Free Zone', 'Sharjah Airport Free Zone'],
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
    relatedArticles: ['hose-service-northern-emirates', 'on-site-hydraulic-hose-service-uae', 'tipper-and-transit-mixer-hose'],
    relatedCategories: ['hoses-fittings', 'hydraulic-hoses'],
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
    relatedArticles: ['hose-service-northern-emirates', 'getting-a-hydraulic-hose-made', 'forklift-hydraulic-hose-replacement'],
    relatedCategories: ['hoses-fittings', 'crimp-ferrules'],
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
    relatedArticles: ['hose-service-northern-emirates', 'why-hydraulic-hoses-fail', 'hose-routing-bend-radius-twist'],
    relatedCategories: ['hydraulic-hoses', 'hoses-fittings'],
    position: 6,
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
    relatedArticles: ['hose-service-northern-emirates', 'industrial-hose-is-not-hydraulic-hose', 'chemical-transfer-hose-selection'],
    relatedCategories: ['industrial-hoses', 'composite-hoses'],
    position: 7,
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
