/**
 * Export markets — countries we ship to from the Dubai warehouse.
 *
 * Deliberately separate from `service-areas.ts`. A service area is somewhere a
 * van goes: those pages are built around site access, industrial zones and
 * induction. A market is somewhere a crate goes, and the things that matter
 * are lead time, route, Incoterm and conformity. Merging them would put "we
 * come to your site" and "we export to you" under one URL and imply a presence
 * abroad that does not exist.
 *
 * The same honesty rules as service areas apply, and the tests enforce them:
 *
 *   - No premises. There is one verified office and it is in Dubai. Saying
 *     "our branch in Riyadh" would be a false-business-presence claim; see the
 *     warning in apps/web/src/lib/site-locations.ts.
 *   - No response-time promises. A published arrival time is an operational
 *     commitment, and assistants repeat it back to customers.
 *   - No local-stock claims. Stock is in Dubai.
 *
 * Every market here must clear the bar already written into
 * `EXPORT_SERVICE_COUNTRIES`: shipping is steady-state, not case-by-case.
 * That constant is now derived from this file so the Organization JSON-LD
 * `areaServed` and the published pages can never drift apart.
 */

export type Market = {
  slug: string
  /** Country name as it should read in prose and in the Country JSON-LD. */
  name: string
  /** ISO 3166-1 alpha-2. Drives EXPORT_SERVICE_COUNTRIES. */
  countryCode: string
  /** One sentence; also the meta description base. */
  summary: string
  /** Opening paragraph. */
  intro: string
  /** Typical transit from dispatch. Not a commitment — see `intro` wording. */
  leadTime: string
  /** How goods reach this market. */
  routes: string[]
  /** Incoterms commonly used for this destination. */
  incoterms: string[]
  /**
   * Destination-country conformity, where a specific scheme applies. Left
   * empty rather than guessed — an invented certification is worse than an
   * omitted one, and buyers check.
   */
  conformity: string[]
  /**
   * The one thing that is actually different about buying into this market.
   *
   * This field exists because of a measurement, not a hunch. With only the
   * shared logistics facts, the five pages measured 96.4% identical to each
   * other — the catalogue section list is the same everywhere, so the intro
   * was carrying all the difference. That is the shape of the competitor's
   * country pages that the teardown criticised, and Google would index one
   * and filter the rest.
   *
   * Each entry must be about *this* market specifically, and must stay
   * truthful: it describes our offer and the buyer's situation, never local
   * facts we have not verified.
   */
  context: { heading: string; body: string }
  position: number
}

export const MARKETS: Market[] = [
  {
    slug: 'saudi-arabia',
    name: 'Saudi Arabia',
    countryCode: 'SA',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Saudi Arabia from our Dubai warehouse, with SASO/SABER documentation prepared before dispatch.',
    intro:
      'Saudi Arabia is the largest of the export lanes we run from Dubai, and the one where paperwork governs the timeline more than freight does. Goods move by road or by air, and the part worth planning around is SABER registration: a shipment with its conformity documents already in order clears; one without them waits, however fast it travelled.',
    leadTime: 'Typically 3 working days from dispatch',
    routes: ['Road freight from Dubai', 'Air freight where the schedule is tighter'],
    incoterms: ['DAP to the buyer’s site', 'CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'SASO Certificate of Conformity',
      'SABER product and shipment registration',
      'Certificate of Origin, Dubai Chamber attested',
    ],
    context: {
      heading: 'SABER is the thing to plan around',
      body: 'Saudi Arabia is the one market on this list where the documents, not the distance, decide when goods arrive. Every regulated product needs a SASO Certificate of Conformity and a SABER shipment registration, and both are tied to the specific product and the specific consignment — they are not a certificate you obtain once and reuse. In practice that means the part numbers matter earlier than they would elsewhere: give us the full list at quotation rather than at order, and the conformity work runs in parallel with picking instead of after it. Where a product falls outside the regulated scope we will say so rather than charge for paperwork nobody needs.',
    },
    position: 1,
  },
  {
    slug: 'oman',
    name: 'Oman',
    countryCode: 'OM',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Oman from our Dubai warehouse, by road or air with full export documentation.',
    intro:
      'Oman is a short lane from Dubai and most consignments go by road. The catalogue that moves here is broad rather than specialised — hydraulic hose and fittings for plant and workshops, industrial hose for water, air and chemical service, and the adapters and couplings that go with both.',
    leadTime: 'Typically 3 working days from dispatch',
    routes: ['Road freight from Dubai', 'Air freight where the schedule is tighter'],
    incoterms: ['DAP to the buyer’s site', 'CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: ['Certificate of Origin, Dubai Chamber attested'],
    context: {
      heading: 'Close enough that road freight usually wins',
      body: 'Oman is the shortest of the export lanes we run, which changes what is worth ordering. On a longer lane it makes sense to batch a shipment and wait; here the freight cost of a small consignment is low enough that ordering what you need when you need it is usually the cheaper answer overall, once you count the stock you would otherwise be sitting on. It also means a repeat order behaves predictably — the same hose, the same fittings, the same crimp spec, from the same Dubai stock rather than whatever a local reseller happens to have that month.',
    },
    position: 2,
  },
  {
    slug: 'qatar',
    name: 'Qatar',
    countryCode: 'QA',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Qatar from our Dubai warehouse, by road or air with full export documentation.',
    intro:
      'Qatar is served from the same Dubai stock as the rest of the Gulf, by road or by air depending on how the schedule sits. Because everything ships from one warehouse, a mixed order — hose, fittings, adapters, valves, lubricants — travels as one consignment with one set of documents rather than several.',
    leadTime: 'Typically 3 working days from dispatch',
    routes: ['Road freight from Dubai', 'Air freight where the schedule is tighter'],
    incoterms: ['DAP to the buyer’s site', 'CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: ['Certificate of Origin, Dubai Chamber attested'],
    context: {
      heading: 'One consignment instead of five',
      body: 'The argument for buying into Qatar from a single Dubai warehouse is consolidation. A hydraulic rebuild rarely needs one thing — it needs hose, the fittings to terminate it, adapters to mate the ports, seals, and often a lubricant that has to travel with its safety data sheet. Sourced separately those become several shipments, several sets of documents and several arrival dates, and the job waits for the slowest. Picked from one warehouse they become one consignment under one Certificate of Origin, and the Estimate shows the whole thing priced together rather than as parts you have to reconcile yourself.',
    },
    position: 3,
  },
  {
    slug: 'bahrain',
    name: 'Bahrain',
    countryCode: 'BH',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Bahrain from our Dubai warehouse, by road or air with full export documentation.',
    intro:
      'Bahrain runs on the same three-day lane as the rest of the Gulf, by road or by air. The practical advantage of buying from Dubai rather than locally is range: the whole catalogue is one order away, so a fitting that would otherwise be a special import is stock.',
    leadTime: 'Typically 3 working days from dispatch',
    routes: ['Road freight from Dubai', 'Air freight where the schedule is tighter'],
    incoterms: ['DAP to the buyer’s site', 'CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: ['Certificate of Origin, Dubai Chamber attested'],
    context: {
      heading: 'Range, rather than proximity',
      body: 'Bahrain is a small market with a heavy industrial base, and the practical constraint on maintenance there is usually not price but availability — the ordinary items are easy to find locally, and the one odd fitting is not. Buying from Dubai inverts that. A GOST coupling, an exotic-alloy metallic hose, a food-grade lubricant, an ORFS adapter in a size nobody stocks: on this catalogue those are ordinary line items rather than special imports, and they travel on the same consignment as the everyday parts instead of being chased separately weeks later.',
    },
    position: 4,
  },
  {
    slug: 'kuwait',
    name: 'Kuwait',
    countryCode: 'KW',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Kuwait from our Dubai warehouse, by road or air with full export documentation.',
    intro:
      'Kuwait is the longest of the road lanes we run and the one where air freight is chosen most often when a machine is down. Either way the order is picked from the same Dubai stock, so what is listed on the catalogue is what ships.',
    leadTime: 'Typically 3 working days from dispatch',
    routes: ['Road freight from Dubai', 'Air freight where the schedule is tighter'],
    incoterms: ['DAP to the buyer’s site', 'CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: ['Certificate of Origin, Dubai Chamber attested'],
    context: {
      heading: 'When the machine is already down',
      body: 'Kuwait sits at the far end of the road lanes we run, and that is precisely when the choice between road and air stops being about freight cost. A hose assembly that is holding up a rig or a press is not really a freight decision at all — the comparison is against a day of lost production, and air freight wins that comparison easily. So the useful thing to tell us early is not the budget but the urgency, because it changes what we quote. Where the part is not urgent, road on the standard lane is the cheaper answer and we will say so.',
    },
    position: 5,
  },
]

export function marketBySlug(slug: string): Market | undefined {
  return MARKETS.find((m) => m.slug === slug)
}

export function marketsOrdered(): Market[] {
  return [...MARKETS].sort((a, b) => a.position - b.position)
}

/** Country names for `areaServed` on the Service JSON-LD. */
export function marketNames(): string[] {
  return marketsOrdered().map((m) => m.name)
}

/** ISO codes, for the Organization `areaServed`. */
export function marketCountryCodes(): string[] {
  return marketsOrdered().map((m) => m.countryCode)
}
