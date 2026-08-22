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
  {
    slug: 'iraq',
    name: 'Iraq',
    countryCode: 'IQ',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Iraq from our Dubai warehouse, by road or air with full export documentation.',
    intro:
      'Iraq runs on the same lane as the Gulf markets, by road or by air. Most of what moves here is replacement rather than project stock — the hose, fittings and adapters that keep drilling, power and construction plant running, ordered against a part number when something has already failed.',
    leadTime: 'Typically 3 working days from dispatch',
    routes: ['Road freight from Dubai', 'Air freight where the schedule is tighter'],
    incoterms: ['DAP to the buyer’s site', 'CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: ['Certificate of Origin, Dubai Chamber attested'],
    context: {
      heading: 'Ordered against a failure, not a forecast',
      body: 'Almost everything we send to Iraq is a replacement part, which changes what is useful to send us. A forecast is not much help; a part number, or failing that the bore, the thread form and the working pressure, is. Photographs of the failed assembly are usually enough for us to identify a hose and its end fittings without anything being measured, and that matters when the person standing next to the machine is not the person raising the order. Where the original was a brand we no longer carry, we will say what the equivalent is and what differs about it rather than substituting quietly.',
    },
    position: 6,
  },
  {
    slug: 'egypt',
    name: 'Egypt',
    countryCode: 'EG',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Egypt from our Dubai warehouse, with export documentation prepared before dispatch.',
    intro:
      'Egypt sits on the wider Middle East lane rather than the Gulf one, so the transit is longer and the sensible order is a larger, less frequent one. The range that moves here spans hydraulic hose and fittings for plant through to industrial hose for water, air and chemical transfer.',
    leadTime: 'Typically 5–15 working days from dispatch',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'DAP', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Longer lane, so order in fewer, larger consignments',
      body: 'The economics on this lane are the opposite of the Gulf ones. Freight is a real proportion of a small order, so the sensible pattern is to consolidate — batch the hose, the fittings, the adapters and the consumables into one shipment rather than ordering as each need arises. That is worth planning around at the quotation stage rather than after, because it changes what we suggest: for a longer lane we will usually flag where carrying a spare assembly is cheaper than expediting one later, and where it is not.',
    },
    position: 7,
  },
  {
    slug: 'morocco',
    name: 'Morocco',
    countryCode: 'MA',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Morocco from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Morocco is a North African destination, which on our shipping policy means the lane is quoted per consignment rather than run to a standing schedule. That is a function of routing and volume rather than of what we can supply — the catalogue available is the same one the Gulf buys from.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Quoted per consignment, and why that is not a hedge',
      body: 'Publishing a transit time we cannot hold to would be worse than publishing none, so for this destination we quote the lane with the goods rather than in advance. In practice that means the Estimate carries a routing and a transit estimate specific to that consignment and that week, instead of a number from a table that may not apply. It also means the Incoterm matters more than usual: on a lane without a standing schedule, whether we are arranging freight or your forwarder is changes the timeline materially, and we would rather establish that before quoting than after.',
    },
    position: 8,
  },
  {
    slug: 'kenya',
    name: 'Kenya',
    countryCode: 'KE',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Kenya from our Dubai warehouse via Mombasa, typically 10–20 working days by sea.',
    intro:
      'Kenya is served by sea into Mombasa, which our shipping policy puts at roughly ten to twenty working days, or faster by air when something is holding up production. The mix that moves on this lane leans towards industrial and construction plant rather than oilfield equipment.',
    leadTime: 'Typically 10–20 working days by sea, faster by air',
    routes: ['Sea freight via Mombasa', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF Mombasa', 'FOB Jebel Ali', 'DAP', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Sea or air is the whole decision here',
      body: 'On a lane this length the choice of freight mode dominates everything else about the order. Sea is materially cheaper and lands in weeks; air costs more and lands in days. Neither is the right default — it depends entirely on whether the part is going onto a shelf or onto a machine that is currently stopped. What is worth doing is deciding deliberately rather than by habit, and the practical way to do that is to split the order: the predictable consumables by sea, the one assembly that is holding up production by air. We will price both against the same Estimate so the comparison is visible rather than assumed.',
    },
    position: 9,
  },
  {
    slug: 'tanzania',
    name: 'Tanzania',
    countryCode: 'TZ',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Tanzania from our Dubai warehouse via Dar es Salaam, typically 10–20 working days by sea.',
    intro:
      'Tanzania is served by sea into Dar es Salaam, on the same broad timescale as the other East African ports, with air freight available where the schedule will not tolerate it. Mining and construction plant account for most of what moves on this lane.',
    leadTime: 'Typically 10–20 working days by sea, faster by air',
    routes: ['Sea freight via Dar es Salaam', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF Dar es Salaam', 'FOB Jebel Ali', 'DAP', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Abrasion is what actually ends a hose here',
      body: 'Mining and quarrying duty does not usually destroy a hose through pressure — it destroys the cover through rubbing, and the assembly fails long before the reinforcement was ever the limiting factor. That makes cover specification and routing worth more attention than the pressure rating on this kind of work. We stock abrasion-resistant covers and the sleeving and spring guards that protect a run where it cannot be routed clear, and on a lane measured in weeks the difference between a hose that lasts one season and one that lasts three is the difference between one order and several.',
    },
    position: 10,
  },
  {
    slug: 'rwanda',
    name: 'Rwanda',
    countryCode: 'RW',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Rwanda from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Rwanda is landlocked, so a consignment arrives through a neighbouring port and completes its journey overland. Our shipping policy quotes landlocked destinations per consignment for that reason — the sea leg is predictable, the inland leg is what varies.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight to a regional port, then overland', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF to the port of entry', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'The inland leg is the part to agree in writing',
      body: 'For a landlocked destination the Incoterm is not administrative detail, it is the single most consequential line on the Estimate. It decides where our responsibility ends and yours begins, and on a route with a sea leg followed by a road leg through a third country, that boundary is where most disputes about cost and delay originate. We state it explicitly rather than leaving it to be inferred, and we will say plainly which portion of the journey is covered by the price quoted and which is not. Where a buyer already has a clearing agent they trust at the port of entry, quoting to that point is usually the cleaner arrangement.',
    },
    position: 11,
  },
  {
    slug: 'burundi',
    name: 'Burundi',
    countryCode: 'BI',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Burundi from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Burundi is landlocked and sits at the far end of the regional corridor, so consignments route through a coastal port and travel a long way overland afterwards. That is why the lane is quoted per consignment rather than against a published transit time.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight to a regional port, then overland', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF to the port of entry', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Order the whole assembly, not the part that failed',
      body: 'When resupply takes weeks, the expensive mistake is ordering the single component that broke and discovering on arrival that its mating half, its seal or its clamp also needed replacing. On a long lane the marginal cost of including those items is small and the cost of a second round trip is not. So when you send us a part number, tell us what it fits: we will list what ordinarily wears alongside it and let you decide what to include, rather than shipping exactly what was asked for and leaving the rest to a follow-up order six weeks later.',
    },
    position: 12,
  },
  {
    slug: 'south-africa',
    name: 'South Africa',
    countryCode: 'ZA',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to South Africa from our Dubai warehouse, with SABS attestation available where required.',
    intro:
      'South Africa has a deep domestic industrial supply base, so buyers here are rarely looking for the ordinary items. What tends to move on this lane is the specific thing that is hard to source locally — an exotic-alloy metallic hose, a GOST coupling, a particular standard of adapter.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'DAP', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'SABS attestation on request',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Worth importing only when it is genuinely hard to source',
      body: 'We are not the obvious answer for a standard two-wire hose in a market with its own manufacturers and distributors, and pretending otherwise would waste everyone\'s time. Where importing does make sense is the long tail: metallic assemblies in Hastelloy, Inconel or Monel, couplings to standards that are common in the Gulf and CIS but not here, food-grade and chemical-transfer hose in specifications that local stock does not run to. Send the specification rather than the part number for those, because the equivalent we hold may carry a different designation entirely.',
    },
    position: 13,
  },
  {
    slug: 'ghana',
    name: 'Ghana',
    countryCode: 'GH',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Ghana from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Ghana is a West African destination, which our shipping policy quotes per consignment rather than against a standing lane. Mining, construction and marine work account for most of the enquiries that reach us from here.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Say what the machine is, not just what the part is',
      body: 'The most useful thing on a West African enquiry is context about the application rather than a bare part number, because the part that was originally fitted is often not the part that should be fitted. A hose that keeps failing every few months is usually telling you something about routing, bend radius or cover specification rather than about the hose itself, and that is a diagnosable problem if we know what the machine is and where the assembly runs. Our engineering desk answers that kind of question for anyone who asks, whether or not an order follows.',
    },
    position: 14,
  },
  {
    slug: 'guinea',
    name: 'Guinea',
    countryCode: 'GN',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Guinea from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Guinea is a West African destination quoted per consignment. Bauxite and mineral extraction dominate the industrial base, and the hydraulics that go with that work — heavy plant, materials handling, crushing and conveying — are the bulk of what we are asked for.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Extraction duty is hard on covers and harder on fittings',
      body: 'Heavy extraction work punishes an assembly at both ends. The cover takes abrasion from rock, grit and constant contact, and the fittings take vibration that steadily works a connection loose long before anything is worn out. Those are different problems with different answers — a tougher cover and better routing for the first, correct crimp specification and the right retention for the second. Getting the crimp right matters more than the brand on the hose, and it is the thing most commonly got wrong when assemblies are made up locally to whatever die happens to be available.',
    },
    position: 15,
  },
  {
    slug: 'ivory-coast',
    name: 'Ivory Coast',
    countryCode: 'CI',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Ivory Coast from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Port handling, agriculture processing and construction generate most of the hydraulics work reaching us from Ivory Coast, which puts the emphasis on industrial transfer hose and couplings as much as on hydraulic assemblies. Like the rest of West Africa the lane is priced against the individual shipment.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Industrial hose is not hydraulic hose',
      body: 'A good deal of what gets asked for on this lane is transfer hose rather than hydraulic hose, and the two are not interchangeable even where the pressure ratings appear to overlap. Transfer hose is selected on what is going through it — chemical compatibility, temperature, whether it has to handle suction as well as delivery, whether it is food contact — and the coupling system matters as much as the hose. Cam and groove, Storz, Bauer and dry-disconnect all solve different problems. Tell us the medium and the duty and we will specify against that rather than against a pressure figure alone.',
    },
    position: 16,
  },
  {
    slug: 'russia',
    name: 'Russia',
    countryCode: 'RU',
    summary:
      'Hydraulic hose, fittings, adapters, GOST couplings and industrial hose supplied to Russia from our Dubai warehouse, quoted per consignment.',
    intro:
      'Russia is a GOST market, and that is the practical reason buyers here deal with us rather than with a Western European supplier: we carry GOST-pattern couplings and adapters alongside the DIN, BSP, JIC and ORFS ranges, so a mixed fleet can be supplied from one order.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: ['Certificate of Origin, Dubai Chamber attested'],
    context: {
      heading: 'GOST alongside DIN, in one order',
      body: 'Equipment fleets in this region are rarely all one standard. Older plant runs GOST, newer imported machines run DIN or JIC, and a workshop maintaining both ends up sourcing from two supply chains that do not talk to each other. We stock GOST couplings, adapters and caps as a catalogue range rather than as a special order, which means a single Estimate can cover both sides of that fleet. Where an interface has to bridge the two standards we would rather specify the adapter than leave it to be improvised at the machine, so tell us what is on each end.',
    },
    position: 17,
  },
  {
    slug: 'kazakhstan',
    name: 'Kazakhstan',
    countryCode: 'KZ',
    summary:
      'Hydraulic hose, fittings, adapters, GOST couplings and industrial hose supplied to Kazakhstan from our Dubai warehouse, quoted per consignment.',
    intro:
      'Kazakhstan is landlocked, GOST-standard, and dominated by oil, gas and mining. That combination is unusually well matched to what we hold: oilfield hose and flow-iron alongside GOST couplings, in a market where a consignment has to arrive overland and therefore arrives infrequently.',
    leadTime: 'Quoted per consignment',
    routes: ['Overland freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF to the port of entry', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: ['Certificate of Origin, Dubai Chamber attested'],
    context: {
      heading: 'Wellsite standards and GOST on the same order',
      body: 'Oilfield work here runs to API specifications while the general plant around it runs to GOST, and those are usually two separate procurement exercises. They do not have to be. Rotary and vibrator hose, choke and kill assemblies, flow iron and wellhead fittings sit in the same catalogue as the GOST couplings and adapters that serve the workshop and the yard, so a site can order both against one Estimate and receive both in one consignment. On a landlocked lane where each delivery is an event rather than a routine, that consolidation is worth more than it would be closer to home.',
    },
    position: 18,
  },
  {
    slug: 'uzbekistan',
    name: 'Uzbekistan',
    countryCode: 'UZ',
    summary:
      'Hydraulic hose, fittings, adapters, GOST couplings and industrial hose supplied to Uzbekistan from our Dubai warehouse, quoted per consignment.',
    intro:
      'Uzbekistan is doubly landlocked, so every consignment crosses at least two borders before it arrives. The lane is quoted per consignment for that reason, and the catalogue that moves on it spans GOST-pattern couplings, hydraulic hose and general industrial transfer hose.',
    leadTime: 'Quoted per consignment',
    routes: ['Overland freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF to the port of entry', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: ['Certificate of Origin, Dubai Chamber attested'],
    context: {
      heading: 'Every border is a place documents get checked',
      body: 'A route that crosses more than one frontier is checked more than once, and the paperwork therefore has to be right for each crossing rather than merely right at the destination. That is a documentation problem more than a freight problem, and it is the part we would rather sort out before goods move: commercial invoice and packing list that match the consignment exactly, Certificate of Origin attested, safety data sheets travelling with anything that needs them. A discrepancy between what the paperwork says and what is in the crate is the most common cause of a consignment sitting still on a route like this.',
    },
    position: 19,
  },
  {
    slug: 'ukraine',
    name: 'Ukraine',
    countryCode: 'UA',
    summary:
      'Hydraulic hose, fittings, adapters, GOST couplings and industrial hose supplied to Ukraine from our Dubai warehouse, quoted per consignment.',
    intro:
      'Ukraine is quoted per consignment, with routing established at the time of enquiry rather than assumed from a schedule. The catalogue that applies is the same one the rest of the region buys from, GOST-pattern couplings included alongside the metric and imperial ranges.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Overland freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: ['Certificate of Origin, Dubai Chamber attested'],
    context: {
      heading: 'Routing confirmed at enquiry, not assumed',
      body: 'We do not publish a transit time for this destination because a published figure would imply a standing arrangement we would then be held to. What we do instead is establish the routing when the enquiry arrives and put it on the Estimate alongside the goods, so the timeline you are quoted is the timeline for that consignment rather than an average. Where a buyer already works with a forwarder they trust, quoting Ex Works Dubai and letting them run the lane is frequently the cleaner and faster arrangement, and we will suggest it rather than insisting on arranging freight ourselves.',
    },
    position: 20,
  },
  {
    slug: 'armenia',
    name: 'Armenia',
    countryCode: 'AM',
    summary:
      'Hydraulic hose, fittings, adapters, GOST couplings and industrial hose supplied to Armenia from our Dubai warehouse, quoted per consignment.',
    intro:
      'Armenia is landlocked and comparatively small, which means local distributors carry the fast-moving items and little else. The enquiries that reach us tend to be for the things that fall outside that — a size, a standard or a specification that is not worth a local supplier holding.',
    leadTime: 'Quoted per consignment',
    routes: ['Overland freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF to the port of entry', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: ['Certificate of Origin, Dubai Chamber attested'],
    context: {
      heading: 'Small orders are worth quoting properly',
      body: 'A market this size generates enquiries for two or three line items rather than for pallets, and suppliers geared to volume tend to treat those as a nuisance. We would rather quote them properly. The catalogue is 1,200-odd active SKUs and the same engineering desk answers a two-item enquiry as a two-hundred-item one, so if what you need is a pair of adapters in a thread form nobody stocks locally, that is a perfectly reasonable thing to ask us for. The freight economics on a small consignment are what they are, and we will show them rather than bury them.',
    },
    position: 21,
  },
  {
    slug: 'belarus',
    name: 'Belarus',
    countryCode: 'BY',
    summary:
      'Hydraulic hose, fittings, adapters, GOST couplings and industrial hose supplied to Belarus from our Dubai warehouse, quoted per consignment.',
    intro:
      'Belarus is landlocked and GOST-standard, with a heavy-machinery manufacturing base of its own. What moves on this lane is generally maintenance supply — hose, couplings and adapters for plant already in service rather than components going into new build.',
    leadTime: 'Quoted per consignment',
    routes: ['Overland freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF to the port of entry', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: ['Certificate of Origin, Dubai Chamber attested'],
    context: {
      heading: 'Maintenance supply, so interchangeability decides everything',
      body: 'Supplying plant that is already running is a different exercise from supplying a build. The question is never simply what a part is, it is what will interchange with what is fitted — and an assembly that is dimensionally close but wrong on seat angle or thread form will fit, will appear to work, and will weep within weeks. Seat angle, thread form and sealing method are the three things worth confirming before an order rather than after, and photographs of the existing fitting are usually enough for us to confirm all three without anything being dismantled.',
    },
    position: 22,
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
