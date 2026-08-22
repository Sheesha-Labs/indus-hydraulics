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
    slug: 'nigeria',
    name: 'Nigeria',
    countryCode: 'NG',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Nigeria from our Dubai warehouse, with SONCAP documentation prepared before dispatch.',
    intro:
      'Nigeria is the largest industrial market in West Africa and the one on this list with a conformity regime that has to be satisfied before goods travel rather than after they arrive. Oil and gas accounts for most of what we are asked for, with materials handling and construction behind it.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'SONCAP certification',
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'SONCAP has to be settled before the goods move',
      body: 'Regulated products entering Nigeria need SONCAP certification, and the sequence matters: certification is obtained against the specific consignment before shipment, not retrospectively once it has arrived. A consignment that turns up without it is not a paperwork inconvenience, it is a consignment that cannot clear. So for this destination we would rather see the full line list at the quotation stage than at the order stage, because it determines which items are in scope and how long the certification leg adds. Where an item sits outside the regulated categories we will say so instead of building cost around paperwork that is not required.',
    },
    position: 17,
  },
  {
    slug: 'senegal',
    name: 'Senegal',
    countryCode: 'SN',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Senegal from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Senegal has moved from a largely agricultural and port economy toward offshore energy, and the enquiries reaching us reflect that shift — increasingly project procurement against a written specification rather than replacement parts for plant already running.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Specification-led buying needs the certificate, not just the part',
      body: 'Project procurement is a different exercise from maintenance buying. When an item is bought against a written specification, the thing that has to arrive is not only the correct part but the evidence that it is the correct part — a manufacturer certificate of conformity, the standard it was built to, and a document trail that still holds up when someone audits the package a year later. That is worth establishing at the enquiry rather than discovering at handover, because retrofitting documentation to goods already delivered is far harder than requesting it up front. We supply it on request; we will also tell you where a certificate you have been asked for does not exist for that class of product.',
    },
    position: 18,
  },
  {
    slug: 'mauritania',
    name: 'Mauritania',
    countryCode: 'MR',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Mauritania from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Mauritania runs on iron ore and, more recently, offshore gas. Both are heavy, dusty, hard-duty environments, and the hydraulics that serve them — materials handling, rail loading, extraction plant — wear in fairly predictable ways.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Predictable wear is worth stocking against',
      body: 'Bulk materials handling wears components on a schedule rather than at random, which makes it one of the few duties where holding spares is straightforwardly economic. If a loading system goes through the same hose assemblies every eight or ten months, the useful conversation is not about the next replacement but about how many to hold and where. We will quote a standing set on that basis, tagged and identified so the right assembly can be found by whoever is on shift rather than by whoever placed the order. On a lane priced per consignment, one planned shipment a year beats four unplanned ones.',
    },
    position: 19,
  },
  {
    slug: 'algeria',
    name: 'Algeria',
    countryCode: 'DZ',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Algeria from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Algeria is a gas economy with most of its production well inland, which puts equipment into sustained high ambient temperature for much of the year. That is the single most useful thing to know when specifying hose for this market.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Temperature range decides the compound, not the pressure',
      body: 'Every hose carries two temperature figures — the fluid it conveys and the air around it — and sustained heat degrades a cover and an inner tube long before the reinforcement is anywhere near its limit. In a hot, dry, inland environment a hose selected purely on working pressure will meet its rating and still fail early, because the elastomer aged rather than the braid gave way. Tell us the ambient as well as the medium and we will specify the compound against both. The same applies to seals and to any lubricant travelling with the order, where a grease chosen for a temperate climate simply will not stay where it was put.',
    },
    position: 20,
  },
  {
    slug: 'libya',
    name: 'Libya',
    countryCode: 'LY',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Libya from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'A great deal of the plant in Libya has been through periods of idleness and partial restart, which changes the nature of the enquiry. What arrives is rarely a clean part number — it is more often a photograph of a fitting with no legible markings on equipment nobody has a manual for.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Bringing idle plant back is an identification problem',
      body: 'Restarting equipment that has stood still is mostly a matter of working out what is actually fitted. Markings corrode away, original suppliers have moved on, and documentation went missing long before the machine stopped. What we can do from a photograph and a couple of measurements is narrow a fitting to its thread form and sealing method, which is usually enough to specify a current equivalent. Our thread identifier tool covers the common families, and where it does not settle it our engineering desk will. Neither requires an order first, and both are faster than ordering three candidates to see which fits.',
    },
    position: 21,
  },
  {
    slug: 'sudan',
    name: 'Sudan',
    countryCode: 'SD',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Sudan from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Sudan is quoted per consignment, with the routing and the documentation set established when the enquiry arrives rather than assumed from a standing lane. Agriculture, extraction and general industry account for most of what is asked for.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'We confirm we can ship before we quote',
      body: 'For some destinations the first question is not price or availability but whether a compliant route exists for that consignment at that time, and we would rather establish it before quoting than raise it afterwards. Where we can ship, the Estimate carries the routing and the documentation set with the goods. Where we cannot, we will say so plainly and promptly instead of leaving an enquiry unanswered, which is more useful to a buyer who then needs to look elsewhere. Nothing about that is unusual for the region; it is simply a step that comes earlier here than it does on the Gulf lanes.',
    },
    position: 22,
  },
  {
    slug: 'south-sudan',
    name: 'South Sudan',
    countryCode: 'SS',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to South Sudan from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'South Sudan is landlocked and sits a long way inland from any port, so consignments arrive infrequently and the interval between them is measured in weeks rather than days. Oil production and the plant supporting it account for most enquiries.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight to a regional port, then overland', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF to the port of entry', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Quote the consumables with the capital item',
      body: 'When a delivery interval is long, the components that get forgotten are the cheap ones. A pump or a cylinder gets ordered carefully; the seals, the filter elements and the hose that will need replacing before the next consignment arrives do not, and the expensive item then sits waiting on a part worth a fraction of it. We would rather put those on the same Estimate as a separate, clearly-priced block you can decline than leave them off and have them become an emergency later. Tell us the duty cycle and we will say what ordinarily needs changing inside that window.',
    },
    position: 23,
  },
  {
    slug: 'eritrea',
    name: 'Eritrea',
    countryCode: 'ER',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Eritrea from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Eritrea sits on the Red Sea, which makes it geographically one of the closer African destinations to Jebel Ali even though the lane is not a scheduled one. Mining and port activity generate most of the hydraulics enquiries that reach us.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Short by sea, but not a scheduled lane',
      body: 'Distance and transit time are not the same thing. The Red Sea route from Jebel Ali is short in nautical terms, but a destination without regular scheduled sailings still depends on what is running that week, which is why the lane is priced per consignment rather than against a published figure. The practical consequence for a buyer is that the sailing usually matters more than the picking: goods sitting ready in Dubai wait for a vessel, not for us. Where a schedule will not fit the requirement, air is available and we will price both rather than assume.',
    },
    position: 24,
  },
  {
    slug: 'uganda',
    name: 'Uganda',
    countryCode: 'UG',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Uganda from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Uganda is landlocked and served through the East African corridor, so a consignment lands at a coastal port and completes its journey by road. Construction plant, agriculture processing and a developing energy sector generate most of the demand.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight to a regional port, then overland', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF to the port of entry', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'The corridor is two journeys, priced as one',
      body: 'A shipment on this route has a sea leg and a road leg, and they behave nothing alike. The sea leg is the predictable part; the corridor inland is where the variability and most of the cost per kilometre sit. Buyers who already clear their own goods at the coast are usually better served by us quoting to the port and letting their agent run the corridor, because that agent knows the route and the charges better than a supplier in Dubai will. Buyers without that arrangement are better served by a delivered price. Either is fine — what is not fine is leaving it ambiguous, so the Estimate names the point where our responsibility ends.',
    },
    position: 25,
  },
  {
    slug: 'dr-congo',
    name: 'DR Congo',
    countryCode: 'CD',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to the Democratic Republic of the Congo from our Dubai warehouse, quoted per consignment.',
    intro:
      'Copper and cobalt extraction dominates industrial demand in DR Congo, and most of it sits deep inland, a long way from any port. That distance shapes both the freight and what is worth putting on an order.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight to a regional port, then overland', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF to the port of entry', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Slurry and process duty is chemistry, not just pressure',
      body: 'Mineral processing puts hose in contact with things that attack it chemically as well as mechanically — acidic leach solutions, reagents, abrasive slurries at concentrations that vary across a plant. A hose that survives one circuit can fail quickly in the next, and a pressure rating tells you nothing about which. What matters is the tube material and its compatibility with the actual medium at the actual concentration and temperature. Send us that and we will specify against it. Where the medium is genuinely aggressive the answer is often a chemical or composite hose rather than a rubber one, and we would rather say so than sell the cheaper option twice.',
    },
    position: 26,
  },
  {
    slug: 'zambia',
    name: 'Zambia',
    countryCode: 'ZM',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Zambia from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Zambia is landlocked, and copper mining on the Copperbelt drives most industrial demand. Plant there runs to planned shutdown cycles, which makes procurement here more schedulable than in most of the markets we ship to.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight to a regional port, then overland', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF to the port of entry', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Buy against the shutdown, not against the breakdown',
      body: 'Where maintenance is planned around scheduled outages, the whole procurement problem becomes tractable: the work is known weeks ahead, the parts list can be assembled in advance, and freight can go by the cheapest route because nothing is urgent. That is the opposite of how most of our export orders arrive. If you send us the scope ahead of an outage we will quote it as one package with a delivery date set against the outage rather than against dispatch, which is the number that actually matters to you. Anything genuinely urgent can then go by air separately, priced honestly as the exception it is.',
    },
    position: 27,
  },
  {
    slug: 'zimbabwe',
    name: 'Zimbabwe',
    countryCode: 'ZW',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Zimbabwe from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Industrial plant in Zimbabwe tends to be long-lived and mixed in origin, assembled over decades from British, South African, Chinese and Eastern European equipment. The practical result is a workshop dealing with several thread standards at once.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight to a regional port, then overland', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF to the port of entry', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Four thread standards on one site is normal here',
      body: 'BSP, metric, JIC and NPT all appear on the same plant when equipment has arrived from different places over thirty years, and they are close enough dimensionally to be mistaken for one another. A BSP male will start into an NPT female and feel right for two turns before it destroys the seat. Identifying what is actually fitted, rather than what someone assumed, is the single most valuable thing to get right before ordering. Our thread identifier tool walks through the measurements that separate them, and we carry adapters across all four families so a mixed site can standardise gradually rather than all at once.',
    },
    position: 28,
  },
  {
    slug: 'mozambique',
    name: 'Mozambique',
    countryCode: 'MZ',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Mozambique from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Mozambique combines a long coastline with major gas and coal developments inland, so demand splits between marine and port handling on one side and heavy extraction plant on the other. The two want quite different hose.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Marine duty is a corrosion problem before it is a pressure one',
      body: 'Salt air and salt water end fittings long before they end hose. Carbon steel that performs perfectly inland will bloom with rust on a quayside within a season, and the failure when it comes is at the crimp or the coupling rather than in the hose body. Stainless and appropriately plated fittings cost more per unit and less per year in that environment, which is the comparison worth making. We stock both and will quote both side by side rather than defaulting to the cheaper line, because on a port or a vessel the labour to change a fitting usually exceeds the fitting.',
    },
    position: 29,
  },
  {
    slug: 'angola',
    name: 'Angola',
    countryCode: 'AO',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Angola from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Angola is an offshore oil economy, and offshore work carries requirements that onshore work does not. Enquiries here are frequently written against a standard rather than a part number, and the standard is usually API.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'API-specified means the certificate ships with the goods',
      body: 'When a line item is specified to API 7K, 16C or 16D, the certification is not an optional extra on the order — it is part of what was bought, and an assembly arriving without it cannot be put into service whatever its physical condition. We hold rotary, vibrator, choke and kill assemblies against those standards and issue the documentation with the consignment rather than following it separately. Where an enquiry names a standard the product does not actually carry, we will flag the mismatch at quotation. Discovering it offshore, with a vessel on day rate, is the expensive way to find out.',
    },
    position: 30,
  },
  {
    slug: 'gabon',
    name: 'Gabon',
    countryCode: 'GA',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Gabon from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Gabon pairs oil production with manganese extraction and timber, in a climate that is hot and humid year round. Humidity is the thing that quietly shortens component life here, and it acts on the parts of an assembly people inspect least.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Store it dry, or it ages on the shelf',
      body: 'Constant humidity degrades rubber and corrodes unprotected steel whether or not anything is running, which means a spare assembly bought sensibly in advance can be unserviceable by the time it is needed. Hose has a shelf life, and it is shorter in a warm damp store than the figure on the datasheet assumes. Two things help: keeping spares sealed and out of direct light rather than hung on a rack, and rotating stock so the oldest assembly is fitted first. Where a customer holds spares against a long lane we will date-mark assemblies on request, which makes that rotation possible rather than theoretical.',
    },
    position: 31,
  },
  {
    slug: 'republic-of-congo',
    name: 'Republic of the Congo',
    countryCode: 'CG',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to the Republic of the Congo from our Dubai warehouse, quoted per consignment.',
    intro:
      'The Republic of the Congo is an offshore-led oil economy served through Pointe-Noire, with the supply base and vessel activity that implies. Much of what we are asked for supports marine and offshore operations rather than fixed onshore plant.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'A vessel alongside is a different clock entirely',
      body: 'Supporting marine operations means the deadline is not a delivery date, it is a departure. A part that arrives after a vessel has sailed has not arrived late, it has missed entirely, and the next opportunity may be weeks away. That changes what we ask at the enquiry: not when you would like it, but what the vessel schedule is, because those are different questions with different answers. If the window is genuinely tight we will say whether it can be met before taking an order rather than after. An honest no is worth more than an optimistic yes when the alternative is planning around a part that will not be there.',
    },
    position: 32,
  },
  {
    slug: 'equatorial-guinea',
    name: 'Equatorial Guinea',
    countryCode: 'GQ',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Equatorial Guinea from our Dubai warehouse, quoted per consignment.',
    intro:
      'Equatorial Guinea runs on hydrocarbons, with gas processing and liquefaction alongside oil production. Gas handling is where the specification questions get most particular, because compatibility rather than pressure decides what can be used.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Gas service asks questions rubber hose cannot answer',
      body: 'Hydrocarbon gas at pressure does not behave like oil. It permeates elastomers, and when pressure drops quickly the gas that has worked its way into the tube wall expands and tears it from the inside — explosive decompression, a failure mode with no equivalent in hydraulic service. Hose intended for that duty is built for it; hose that merely meets the pressure figure is not. Composite and PTFE constructions solve different parts of the problem. Tell us the medium, the pressure and how fast the system depressurises, and we will specify against all three rather than against the first alone.',
    },
    position: 33,
  },
  {
    slug: 'namibia',
    name: 'Namibia',
    countryCode: 'NA',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Namibia from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Namibia combines uranium and diamond extraction with a deep-water port at Walvis Bay that serves inland neighbours as well as its own economy. Enquiries here often cover more than one country because of it.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'One landing point, several destinations',
      body: 'Where a buyer distributes onward across a region, the consignment that arrives is not the consignment that leaves — it gets broken down and forwarded. That is worth telling us, because it changes how an order should be packed and marked. Items grouped and labelled by final destination at our end save a great deal of sorting at yours, and cost nothing extra to do at the point of picking. Ask for it at the order rather than after, and specify how you want the split; we would rather build the packing list around how the goods will actually be used than around how they happened to be picked.',
    },
    position: 34,
  },
  {
    slug: 'botswana',
    name: 'Botswana',
    countryCode: 'BW',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Botswana from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Botswana is landlocked and its industrial base is concentrated in mining and mineral processing. Water is scarce and heavily recycled through those plants, which puts more demand on transfer and slurry lines than a first look at the sector would suggest.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight to a regional port, then overland', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF to the port of entry', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Suction lines fail differently from pressure lines',
      body: 'A hose that only ever sees positive pressure can be built lightly. One that has to pull — dewatering, recirculation, tanker discharge — must resist collapse, and that requires a helix or a rigid reinforcement rather than braid alone. Fitting a pressure hose to a suction duty produces a line that looks perfectly serviceable, works briefly, then flattens under vacuum and starves the pump. It is among the most common specification errors we see, and it is entirely avoidable: say whether the line pulls as well as pushes, and we will specify a hose rated for both.',
    },
    position: 35,
  },
  {
    slug: 'tunisia',
    name: 'Tunisia',
    countryCode: 'TN',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Tunisia from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Tunisia has a manufacturing base oriented toward European supply chains, which shows up in the equipment: metric threads, DIN and EN references, and specifications written the way a European engineer would write them rather than an American one.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Specified in EN and DIN, quoted the same way',
      body: 'Equipment built for European supply chains is described in European terms, and a quotation that answers in a different vocabulary creates work for whoever has to check it. When an enquiry cites EN 853, EN 856 or a DIN standpipe reference, we quote against that reference rather than translating it into an SAE equivalent and leaving you to verify the two match. Where a product genuinely carries both designations we will show both. Where a European standard has no exact counterpart in what we hold, we will say what differs instead of presenting an approximate substitute as though it were the same part.',
    },
    position: 36,
  },
  {
    slug: 'mali',
    name: 'Mali',
    countryCode: 'ML',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Mali from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Gold mining drives industrial demand in Mali, on sites that are landlocked, remote and dusty. Those three conditions together make fluid cleanliness a bigger determinant of component life than almost anything else in the specification.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight to a regional port, then overland', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF to the port of entry', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Most component failures here start as contamination',
      body: 'Pumps and valves rarely fail because they were the wrong pump or valve. They fail because particulate got into the fluid and wore clearances that were never meant to move. On a dusty site, every hose change, every coupling break and every top-up is an opportunity for that to happen, and the damage accumulates invisibly until something seizes. The countermeasures are unglamorous and cheap relative to what they prevent: caps on stored assemblies, clean decanting, filtration matched to the duty, and knowing the actual cleanliness code the system needs rather than guessing. We supply against ISO 4406 targets and will advise on them.',
    },
    position: 37,
  },
  {
    slug: 'burkina-faso',
    name: 'Burkina Faso',
    countryCode: 'BF',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Burkina Faso from our Dubai warehouse, quoted per consignment.',
    intro:
      'Burkina Faso is landlocked, and inland freight reaches it over routes that behave differently at different times of year. Gold extraction accounts for most of the hydraulics demand, on sites well away from the capital.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight to a regional port, then overland', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF to the port of entry', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Plan the order around the season, not the month',
      body: 'Overland routes into and across the interior are not equally passable all year, and a consignment that would move comfortably in one season can sit waiting in another. That is not a freight detail to discover after ordering — it is a reason to bring forward the maintenance buying that would otherwise happen later. If you know the work is coming, ordering ahead of the difficult months costs nothing extra and removes the variable entirely. Tell us the window you are working to and we will say whether the timing is comfortable or tight rather than quoting as though every month were the same.',
    },
    position: 38,
  },
  {
    slug: 'niger',
    name: 'Niger',
    countryCode: 'NE',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Niger from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Niger is landlocked, largely desert, and its industrial activity is concentrated in extraction. Airborne dust is constant rather than occasional, and it finds its way into the places an assembly is most vulnerable.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight to a regional port, then overland', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF to the port of entry', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Quick-release couplings are where the dust gets in',
      body: 'A permanently made-up connection is reasonably well sealed against its environment. A coupling that gets broken and remade every shift is not — each disconnection exposes the sealing faces, and in fine airborne dust that means grit is introduced directly into the circuit on reconnection. The fix is trivial and routinely skipped: dust caps and plugs that are actually fitted, and couplings with a flat-face design that wipes clean rather than a poppet valve that traps particulate in its recess. We stock both patterns and will point out where the flat-face version is worth the difference.',
    },
    position: 39,
  },
  {
    slug: 'liberia',
    name: 'Liberia',
    countryCode: 'LR',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Liberia from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Iron ore extraction and its associated rail and port loading account for most industrial hydraulics in Liberia, alongside plantation agriculture. Bulk loading equipment concentrates a lot of duty into rotating and slewing connections.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Rotating joints fail on cycles, not on pressure',
      body: 'Stackers, reclaimers and ship loaders slew continuously, and the connections that have to rotate with them wear out on a duty cycle rather than under load. A swivel or rotary union rated well above the working pressure will still reach the end of its life on turns, and the symptom is a slow weep that gets attributed to the hose it feeds. Replacing the hose changes nothing. Where a machine keeps losing fluid at the same point, the joint is worth examining before the line is, and it is worth holding as a spare because its lead time is longer than a hose assembly.',
    },
    position: 40,
  },
  {
    slug: 'sierra-leone',
    name: 'Sierra Leone',
    countryCode: 'SL',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Sierra Leone from our Dubai warehouse, quoted per consignment.',
    intro:
      'Mining and mineral processing drive most demand in Sierra Leone, often on sites some distance from any workshop that could make up a hose assembly to a reliable standard. That changes what is worth shipping.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Buy the assembly finished, not the parts to make one',
      body: 'Bulk hose and loose fittings look cheaper per metre and frequently are not, because a crimped assembly is only as good as the die, the crimp diameter and the calibration of whoever made it. Get any of those wrong and the joint either leaks or lets go under pressure, and neither failure announces itself in advance. Where there is no crimping capability you can rely on, finished assemblies built and pressure-tested in our own bay are the safer purchase. Send lengths and end configurations, or the old assembly, and they arrive ready to fit and tagged so the next replacement can be ordered by reference.',
    },
    position: 41,
  },
  {
    slug: 'cameroon',
    name: 'Cameroon',
    countryCode: 'CM',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Cameroon from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Cameroon combines oil production with substantial agro-processing — cocoa, palm, rubber, brewing — and the second of those brings requirements that industrial hose specifications usually do not cover.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Food contact is a documentation requirement, not a preference',
      body: 'Hose carrying anything destined for consumption has to be certified for it, and the certification is the point rather than the construction. A tube that happens to be food-safe in composition but carries no evidence of compliance will fail an audit exactly as a wrong hose would. So for potable water, edible oils, brewing or dairy duty the useful question is which standard the plant is audited against, and we supply against that with the documentation travelling alongside. It also has to be cleanable in the way the plant actually cleans, which rules out some constructions that would otherwise be perfectly suitable.',
    },
    position: 42,
  },
  {
    slug: 'chad',
    name: 'Chad',
    countryCode: 'TD',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Chad from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Chad is landlocked and sits further from a seaport than almost anywhere else we ship to, with oil production as the main industrial driver. A consignment spends far longer on a truck than on a ship.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight to a regional port, then overland', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF to the port of entry', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Pack it for the road, because that is the hard part',
      body: 'Sea freight is gentle compared with a thousand kilometres of road. Vibration works threads loose, unsupported weight in a carton shifts and crushes what is beneath it, and a bend radius that was fine on a pallet becomes a permanent kink after a week of movement. For destinations reached largely overland we crate rather than carton, coil assemblies to their minimum bend radius rather than however they fit, and protect threads and sealing faces individually. It costs a little more at dispatch and considerably less than a consignment that arrives technically complete and practically unusable.',
    },
    position: 43,
  },
  {
    slug: 'ethiopia',
    name: 'Ethiopia',
    countryCode: 'ET',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Ethiopia from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Ethiopia is landlocked with a large and rapidly expanding manufacturing and construction base. A great deal of the plant is new, and new plant arrives from a wide range of origins with whatever fittings its manufacturer happened to use.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight to a regional port, then overland', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF to the port of entry', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Standardise at commissioning, while it is still cheap',
      body: 'A new facility is the one moment when the fitting standard across a site is a decision rather than an inheritance. Left alone, a plant assembled from several manufacturers ends up carrying four thread families and a spares holding four times larger than it needs to be, and by then converting is a shutdown job nobody will authorise. Converting at commissioning is a handful of adapters. It is worth asking, before a line is signed off, what it would take to bring everything onto one standard — and we will quote that conversion honestly, including the cases where a machine should be left exactly as its manufacturer supplied it.',
    },
    position: 44,
  },
  {
    slug: 'djibouti',
    name: 'Djibouti',
    countryCode: 'DJ',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Djibouti from our Dubai warehouse, typically 10–20 working days by sea.',
    intro:
      'Djibouti is a transhipment economy: its industrial hydraulics are concentrated in port handling rather than in extraction or manufacturing. Container cranes, reach stackers, straddle carriers and terminal tractors work continuously, and their duty cycles are relentless.',
    leadTime: 'Typically 10–20 working days by sea, faster by air',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'DAP', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Terminal equipment is measured in moves, not hours',
      body: 'A crane out of service does not cost a repair bill, it costs the moves it would have made, and on a busy terminal that number is large enough that the economics of spares holding look nothing like they do in general industry. The assemblies that stop a machine are usually few and known — the hoist and boom circuits, the spreader lines, the steering rams on the yard equipment. Holding those specific items is almost always cheaper than the downtime they prevent, and identifying which they are is a half-hour conversation. We will have it whether or not the order follows.',
    },
    position: 45,
  },
  {
    slug: 'madagascar',
    name: 'Madagascar',
    countryCode: 'MG',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Madagascar from our Dubai warehouse, quoted per consignment.',
    intro:
      'Madagascar is an island with significant mineral extraction — nickel, cobalt, ilmenite — and that island status is the fact that shapes procurement more than any other. There is no overland alternative to anywhere.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'No road fallback means the sailing is the deadline',
      body: 'On a mainland destination a missed vessel is an inconvenience, because freight can go by truck instead and arrive late rather than not at all. On an island there is no such fallback: the alternative to sea is air, at several times the cost, and the alternative to air is waiting for the next sailing. That asymmetry is worth building into how orders are placed. Ordering slightly more than the immediate need, slightly earlier than strictly required, is cheap insurance against a gap that cannot be bridged any other way once it opens.',
    },
    position: 46,
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
    position: 47,
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
    position: 48,
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
    position: 49,
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
    position: 50,
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
    position: 51,
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
    position: 52,
  },
  {
    slug: 'chile',
    name: 'Chile',
    countryCode: 'CL',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Chile from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Chile is the largest copper producer in the world and has a mature industrial supply base to match, so the enquiries that travel this far are specific ones. It is also among the most seismically active countries anywhere, which affects how installations behave.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Rigid plumbing is what breaks when the ground moves',
      body: 'Hard pipework transmits ground movement straight into whatever it is bolted to, and in seismic country that is how a fracture appears at a flange rather than in the middle of a run. Flexible sections are what absorb it, and they only work if they were installed with slack and a bend radius that lets them move — a hose pulled tight between two fixed points is structurally a rigid member with a weaker wall. Where a line has to cross between independently mounted equipment, that is the place to specify flexibility deliberately. Metallic hose with braid does the same job where temperature or media rule out rubber.',
    },
    position: 53,
  },
  {
    slug: 'peru',
    name: 'Peru',
    countryCode: 'PE',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Peru from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Copper, gold and zinc extraction dominate Peruvian industry, and much of it involves moving processed material in volume rather than under high pressure. That shifts the specification question away from pressure ratings and toward bore and wall.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Large bore is a different product, not a bigger one',
      body: 'Above a certain diameter a hose stops being a scaled-up version of a small one. Wall construction changes, the reinforcement does different work, handling and support become design considerations rather than afterthoughts, and the end connections are usually flanged rather than threaded. A specification written for a half-inch hydraulic line does not extend upward by arithmetic. For thickener underflow, tailings transfer or any duty carrying processed material in bulk, tell us the bore, the medium and the solids content, and expect a different family of product than the one that serves the machines around it.',
    },
    position: 54,
  },
  {
    slug: 'bolivia',
    name: 'Bolivia',
    countryCode: 'BO',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Bolivia from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Bolivia is landlocked and much of its mining sits at extreme altitude — several thousand metres above sea level, where the air is thin enough to change how a hydraulic system behaves. That is a real engineering consideration, not a curiosity.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight to a regional port, then overland', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF to the port of entry', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Thin air changes what a pump can pull',
      body: 'Atmospheric pressure is what pushes fluid into a pump inlet, and at high altitude there is measurably less of it. A suction line that works at sea level can cavitate on the same machine at four thousand metres, and the damage shows up as pitting and noise rather than as an obvious leak. The countermeasures are on the inlet side: a larger bore than the calculation suggests, the shortest practical run, minimal fittings and a hose that will not collapse under the greater vacuum it now sees. If a machine has been relocated to altitude and started misbehaving, the inlet is the first place to look.',
    },
    position: 55,
  },
  {
    slug: 'argentina',
    name: 'Argentina',
    countryCode: 'AR',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Argentina from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Argentine industrial demand splits between agriculture, conventional mining and the unconventional oil and gas development in the Neuquén basin. The last of those puts equipment through pressure cycling of a kind most hydraulics never see.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Cycle life matters more than burst pressure',
      body: 'A burst rating tells you what a hose survives once. Stimulation work asks a different question entirely: how many pressure cycles it survives before the reinforcement fatigues, which is a property the headline figure says nothing about. Two hoses with the same rating can differ several-fold in impulse life depending on construction and how the ends were attached. For any duty that pressurises and depressurises repeatedly, impulse performance is the number worth comparing, and it is worth asking for explicitly. We will quote against it where a manufacturer publishes it and say so where none does.',
    },
    position: 56,
  },
  {
    slug: 'colombia',
    name: 'Colombia',
    countryCode: 'CO',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Colombia from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Oil, coal and increasingly diversified manufacturing drive Colombian demand. A great deal of the plant is North American in origin, which means enquiries usually arrive as an original-equipment part number rather than as a specification.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Send the number you have, whoever printed it',
      body: 'An original-equipment part number is a supplier catalogue reference, not a description of the part, and it usually maps to something we hold under an entirely different code. Working out which is ordinary work rather than a favour: our replacement cross-reference covers a large set of manufacturer numbers and will take you straight to what matches. Where a number resolves to more than one candidate the difference is normally seal material or seat angle, and we would rather ask which applies than guess. There is no need to translate anything into our numbering before enquiring.',
    },
    position: 57,
  },
  {
    slug: 'ecuador',
    name: 'Ecuador',
    countryCode: 'EC',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Ecuador from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Much of Ecuador\'s oil production sits in the Amazon basin, on sites that are genuinely difficult to reach and sometimes served by air rather than road. Access constraints shape what is practical to order as much as the specification does.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Weight and package size decide the last leg',
      body: 'Where the final delivery is by light aircraft or river craft, the binding constraint stops being cost and becomes dimensions and mass. A coiled assembly that travels perfectly well in a container may simply not fit, and an item split into two lighter packages often moves when one heavy one will not. That is worth telling us at the order rather than discovering at the airstrip. We can coil to a specified diameter, split a consignment into stated maximum weights, and mark each package with its own contents so a partial delivery is still usable rather than a puzzle.',
    },
    position: 58,
  },
  {
    slug: 'guyana',
    name: 'Guyana',
    countryCode: 'GY',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Guyana from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Guyana has gone from almost no oil industry to a significant offshore producer in a very short time, and the onshore supply base has not caught up. Nearly everything an operation needs still arrives from somewhere else.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'In a boom the constraint is availability, not price',
      body: 'When an industry scales faster than the supply chain serving it, the scarce thing is not budget but the item itself and the slot to move it. Ordinary catalogue stock stays ordinary; the long-lead items are what bite, and they bite everyone at once because every operator hit the same growth curve in the same quarter. The useful discipline is separating the two early — identify what is genuinely long-lead for your equipment and order it against a forecast rather than a requisition, and leave the commodity items to be bought when needed. We will say plainly which of a line list falls into which category.',
    },
    position: 59,
  },
  {
    slug: 'suriname',
    name: 'Suriname',
    countryCode: 'SR',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Suriname from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Suriname sits alongside the same offshore geology as its neighbour and is earlier in the same development cycle, so much of the activity is exploration and appraisal carried out on contracted equipment rather than owned assets.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Supplying kit you do not own changes the question',
      body: 'On contracted or rented equipment the person who needs the part frequently has no drawings, no history and no authority to modify anything. What they have is the machine in front of them and a contract that says it goes back as it came. That rules out improvised adapters and anything that alters a fitting permanently, and it makes exact identification more important than it would be on owned plant. Send photographs and measurements and we will match rather than approximate — and where the only correct answer is a part from the original manufacturer, we will tell you that instead of selling you a near-miss.',
    },
    position: 60,
  },
  {
    slug: 'brazil',
    name: 'Brazil',
    countryCode: 'BR',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Brazil from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Brazil manufactures a great deal of what we sell and has deep domestic distribution, so importing a routine item here rarely makes sense. Where enquiries do reach us they are almost always driven by a specification naming something that is not made locally.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Import the exception, buy the rest at home',
      body: 'A country with its own hose manufacturers and a dense distributor network does not need a supplier eight thousand kilometres away for standard product, and we would be wasting your time to suggest otherwise. The exceptions are narrow and real: an authorised brand a project specification names and will not accept an equivalent for, an alloy or construction outside what local production runs to, or a documented item where the certification is the deliverable. Send us those. For anything a domestic distributor carries, the freight and the wait are costs with nothing on the other side of them.',
    },
    position: 61,
  },
  {
    slug: 'venezuela',
    name: 'Venezuela',
    countryCode: 'VE',
    summary:
      'Hydraulic hose, fittings, adapters and industrial hose supplied to Venezuela from our Dubai warehouse, subject to counterparty and end-use screening before quotation.',
    intro:
      'Venezuela has substantial industrial infrastructure and a correspondingly complex trade environment. We screen the counterparty and the intended end use before quoting anything for this destination, and we would rather set that expectation here than raise it after an enquiry has been sent.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Counterparty and end-use screening prior to quotation',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Screening comes before pricing, not after',
      body: 'International restrictions apply to certain entities, sectors and end uses connected with this market, and they bind the supplier rather than the buyer. So for enquiries here the first step is establishing who the ultimate recipient is and what the goods are for — not as a formality, but because the answer determines whether a quotation can be issued at all. Providing the end user, the site and the application up front is the fastest route to an answer either way. Where we are able to supply we will proceed normally; where we are not, we will say so directly rather than letting an enquiry go quiet.',
    },
    position: 62,
  },
  {
    slug: 'paraguay',
    name: 'Paraguay',
    countryCode: 'PY',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Paraguay from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Paraguay is landlocked, and unusually among the markets we ship to, a large share of its freight arrives by river rather than by road. Agricultural processing and materials handling account for most of the hydraulics demand.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight to a regional port, then river barge or road', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF to the port of entry', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'River freight runs to water levels, not timetables',
      body: 'Barge transport up an inland waterway is economical and slow, and its capacity varies with the season in a way road freight does not — low water reduces what a convoy can carry and lengthens the journey. None of that is a problem for planned maintenance stock, and all of it is a problem for something needed next week. The practical answer is to route deliberately by urgency rather than treating freight as one decision: routine replenishment on the water, anything time-critical by air. We will price both against the same line list rather than assuming which you want.',
    },
    position: 63,
  },
  {
    slug: 'uruguay',
    name: 'Uruguay',
    countryCode: 'UY',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Uruguay from our Dubai warehouse, quoted per consignment with full export documentation.',
    intro:
      'Uruguay has a modest domestic industrial base but a well-established free-zone and transit regime, and a fair amount of what enters the country is destined onward. That makes the customs treatment of a consignment as relevant as its contents.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Tell us if the goods are staying or passing through',
      body: 'Whether a consignment clears for domestic use or enters a free zone for onward movement changes the documentation it needs, and the two are not interchangeable after the fact. Goods held in bond for regional distribution want paperwork that supports a later re-export; goods being imported outright do not. Getting that wrong is recoverable but tedious, and it is entirely avoidable by saying at the order which applies. It also affects how the shipment should be split and labelled, because a bonded consignment broken down later is easier to handle if it was packed with that in mind.',
    },
    position: 64,
  },
  {
    slug: 'singapore',
    name: 'Singapore',
    countryCode: 'SG',
    summary:
      'Hydraulic hose, fittings, adapters, valves and marine transfer hose supplied to Singapore from our Dubai warehouse, quoted per consignment.',
    intro:
      'Singapore is the busiest bunkering port in the world and has a dense, competitive supply base of its own. What travels this far is usually marine transfer product where the certification regime, rather than the hose, is the difficult part.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Transfer hose is certified, then re-certified',
      body: 'A hose used to move fuel or cargo between a vessel and a shore installation is not simply bought and fitted. It carries a test certificate from new, and it has to be pressure tested again at defined intervals for the rest of its working life, with the records kept and available. That obligation sits with the operator, but it starts with what was supplied: an assembly delivered without its original certification cannot be brought into a compliant regime afterwards. So for transfer duty the documentation is part of the specification, and we issue it with the goods rather than as a later request.',
    },
    position: 65,
  },
  {
    slug: 'malaysia',
    name: 'Malaysia',
    countryCode: 'MY',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Malaysia from our Dubai warehouse, quoted per consignment.',
    intro:
      'Malaysian demand divides between offshore oil and gas and one of the largest palm oil processing sectors anywhere. The second of those moves a medium that behaves differently from mineral oil, and the difference is not obvious from a pressure rating.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Vegetable oil is not mineral oil to a seal',
      body: 'Elastomers are chosen against the fluid they will meet, and a compound perfectly stable in mineral hydraulic oil can swell or harden in vegetable esters. It matters wherever plant handles palm or other biologically derived oils, and it matters again where a machine has been converted to a biodegradable hydraulic fluid without anyone revisiting the seals and hoses that were specified for the old one. Conversions are where this usually bites, because nothing is replaced and the failure arrives months later looking like ordinary wear. Tell us the actual fluid, not the category, and we will specify the compound against it.',
    },
    position: 66,
  },
  {
    slug: 'indonesia',
    name: 'Indonesia',
    countryCode: 'ID',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Indonesia from our Dubai warehouse, quoted per consignment.',
    intro:
      'Indonesia is an archipelago of thousands of islands with coal and nickel extraction spread widely across them. Where a consignment lands is a bigger decision here than in almost any other market we ship to.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF to the nominated port', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Nominate the port, not just the country',
      body: 'Landing goods at the main gateway and moving them onward by domestic vessel is sometimes right and sometimes adds a week and a second handling for no benefit. It depends entirely on which island the site is on and what feeder services run there. That is a decision worth making before the booking rather than after, because reconsigning a container once it has arrived is expensive and slow. Tell us the actual destination rather than the head office address and we will quote against a port that makes sense for it, including the case where the obvious gateway is the wrong answer.',
    },
    position: 67,
  },
  {
    slug: 'thailand',
    name: 'Thailand',
    countryCode: 'TH',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Thailand from our Dubai warehouse, quoted per consignment.',
    intro:
      'Thailand has a substantial manufacturing base, particularly in automotive and electronics, where hydraulics serve production equipment running to fixed cycle times. That is a different buying pattern from maintenance-driven markets.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'On a production line, consistency beats specification',
      body: 'Equipment that runs a fixed cycle thousands of times a day is validated as a whole, and a replacement part that performs slightly differently is a problem even when it is nominally better. A hose with a different wall stiffness changes a response time; a fitting with a marginally different bore changes a flow. Neither is a defect and both can put a line out of tolerance. For that reason we would rather supply the same construction from the same source every time than optimise each order, and where a product changes we will say so before shipping rather than let a line find out.',
    },
    position: 68,
  },
  {
    slug: 'vietnam',
    name: 'Vietnam',
    countryCode: 'VN',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Vietnam from our Dubai warehouse, quoted per consignment.',
    intro:
      'Vietnam has been building industrial capacity quickly, which means a great deal of the plant in service is new and has no maintenance history behind it. Deciding what to hold as spares is harder without one.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Build the first spares list from the machine',
      body: 'Everyone eventually knows which three assemblies fail on a given machine, but that knowledge takes a couple of years to accumulate and a new plant does not have it. In the meantime the list can be derived rather than guessed: the assemblies that move with the machine, the ones routed near heat, the ones with the shortest radius, and anything whose failure stops production rather than degrading it. That is a reading exercise on the hydraulic schematic, not experience, and we will do it from a drawing or a set of photographs. It produces a far shorter list than buying one of everything.',
    },
    position: 69,
  },
  {
    slug: 'philippines',
    name: 'Philippines',
    countryCode: 'PH',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to the Philippines from our Dubai warehouse, quoted per consignment.',
    intro:
      'The Philippines is one of the largest geothermal producers in the world alongside its mining and shipping sectors. Geothermal service is unlike anything else in this catalogue, because the medium arrives hot, wet and chemically unhelpful all at once.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Steam and sulphide rule out most of the catalogue',
      body: 'Geothermal fluid combines high temperature, wet steam and hydrogen sulphide, and that combination narrows the options sharply. Ordinary rubber constructions are out on temperature before chemistry is even considered, and several stainless grades that behave well elsewhere are vulnerable to sulphide attack under stress. What tends to survive is PTFE-lined or specific alloy metallic assemblies, chosen against the actual analysis rather than against the word geothermal. If you have a fluid composition, send it — the specification follows from it, and guessing at this duty is expensive in a way that ordinary hydraulic work is not.',
    },
    position: 70,
  },
  {
    slug: 'myanmar',
    name: 'Myanmar',
    countryCode: 'MM',
    summary:
      'Hydraulic hose, fittings, adapters and industrial hose supplied to Myanmar from our Dubai warehouse, subject to counterparty and end-use screening before quotation.',
    intro:
      'Myanmar has mining, agriculture and general industry, and it also sits under international measures that reach particular organisations and activities. We establish who the goods are for before we price them, and we would rather say that on this page than after an enquiry arrives.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Counterparty and end-use screening prior to quotation',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Who receives it decides whether we can quote',
      body: 'Restrictions attached to this market are drawn around particular organisations and particular activities rather than around the country as a whole, so the determining fact is the identity of the ultimate recipient and what the equipment will be used for. An enquiry that includes the end user, the site and the application can be assessed quickly. One that does not cannot be assessed at all, and chasing it afterwards wastes time on both sides. Where an enquiry falls outside what we are able to supply we will tell you at that point, clearly, rather than allowing it to lapse into silence.',
    },
    position: 71,
  },
  {
    slug: 'cambodia',
    name: 'Cambodia',
    countryCode: 'KH',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Cambodia from our Dubai warehouse, quoted per consignment.',
    intro:
      'Construction, agriculture and light manufacturing account for most Cambodian demand, and a large share of the plant doing that work arrived second-hand from elsewhere in the region. Machines like that have usually been repaired before you owned them.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'The parts book may not describe what is fitted',
      body: 'On a machine that has passed through several owners, a previous repair may have substituted a fitting, changed a hose route or adapted a port to whatever was available at the time. The manufacturer documentation then describes a machine that no longer exists, and ordering from it produces a part that will not go on. Measuring what is actually there beats trusting the parts book, every time. Send dimensions or photographs of the component you are replacing rather than the reference from the manual, and if the two disagree we will say so — that disagreement is itself useful information about the machine.',
    },
    position: 72,
  },
  {
    slug: 'laos',
    name: 'Laos',
    countryCode: 'LA',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Laos from our Dubai warehouse, quoted per consignment.',
    intro:
      'Laos is landlocked and its largest industrial installations are hydroelectric. Dam hydraulics look nothing like mobile plant: very large actuators, very long strokes, and duty cycles measured in operations per week rather than per minute.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight to a regional port, then overland', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF to the port of entry', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Equipment that sits still needs different seals',
      body: 'A gate actuator that operates a handful of times a month spends almost all of its life stationary, and stationary is where seals take a set, where fluid separates and where corrosion starts on a rod that is not being wiped. Wear is barely the issue. What matters is the condition of a system between operations: rod protection, fluid that has not degraded sitting in a reservoir for months, and seals chosen for long static periods rather than for high cycle counts. It is the opposite of the specification logic that serves mobile plant, and applying mobile-plant thinking to it produces components that fail early.',
    },
    position: 73,
  },
  {
    slug: 'brunei',
    name: 'Brunei',
    countryCode: 'BN',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Brunei from our Dubai warehouse, quoted per consignment.',
    intro:
      'Brunei is small and its industrial activity is concentrated almost entirely in oil and gas under a small number of operators. That concentration means procurement runs through formal approval processes more often than it does in a fragmented market.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Approved-brand lists are a hard constraint, not a preference',
      body: 'Where an operator maintains a list of accepted manufacturers, an equivalent product is not an equivalent answer however well it performs. It will be rejected at goods inward, and the rejection costs the lead time twice over. So the useful thing to establish before quoting is whether a named brand is mandated or merely referenced, because those look identical in an enquiry and lead to completely different quotations. We hold authorised lines across the major manufacturers and will quote the named brand where one is required, saying plainly what the alternative would have cost if that is useful to know.',
    },
    position: 74,
  },
  {
    slug: 'timor-leste',
    name: 'Timor-Leste',
    countryCode: 'TL',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Timor-Leste from our Dubai warehouse, quoted per consignment.',
    intro:
      'Timor-Leste is a small market with offshore hydrocarbon activity and limited onshore industrial infrastructure. Consignments are correspondingly infrequent, and the customs and logistics chain is younger than in the larger economies around it.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'A simple consignment clears more easily than a clever one',
      body: 'Where a clearance chain handles lower volumes, the shipments that move smoothly are the ones that are easy to reconcile: a packing list that matches the invoice line for line, descriptions that say what something is rather than quoting an internal code, and no partial deliveries splitting one order across two arrivals. None of that is a requirement anyone publishes; it is simply what causes fewer questions. We would rather build a consignment that way from the outset than optimise it for our own picking convenience and leave the difficulty at the other end.',
    },
    position: 75,
  },
  {
    slug: 'united-states',
    name: 'the United States',
    countryCode: 'US',
    summary:
      'Metric, DIN and GOST-pattern hydraulic fittings, adapters and hose supplied to the United States from our Dubai warehouse, quoted per consignment.',
    intro:
      'The United States manufactures hydraulics at scale and stocks them densely, so we are no use at all for ordinary domestic product. Where we are useful is the reverse of the usual case: the metric and Eastern-standard fittings that are commonplace in the Gulf and awkward to source in an SAE market.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'The awkward standard here is the ordinary one there',
      body: 'An SAE-based supply chain handles JIC, NPT and code-61 flanges without thinking and then stalls on a DIN 2353 bite-type in an unusual tube size, a BSP taper in a large diameter, or a GOST coupling on an imported machine. Those are catalogue items for us because the markets we serve run on them daily. If a piece of imported equipment has arrived with connections nobody locally can match, that is the enquiry worth sending — and a photograph with a caliper reading is usually enough to identify it. For anything a domestic distributor stocks, buy it there.',
    },
    position: 76,
  },
  {
    slug: 'canada',
    name: 'Canada',
    countryCode: 'CA',
    summary:
      'Hydraulic hose, fittings, adapters and industrial hose supplied to Canada from our Dubai warehouse, quoted per consignment, including low-temperature constructions.',
    intro:
      'Canada is well supplied domestically, and the enquiries that travel are usually specification-driven. The one condition worth talking about is cold, because sustained low temperature changes what a hose can physically do rather than merely shortening its life.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Cold takes the flex out before it takes the life out',
      body: 'Every elastomer has a point below which it stops behaving like rubber and starts behaving like plastic. Above it a hose flexes and recovers; below it the same hose is stiff, and bending one that has been sitting outside overnight can crack the tube without leaving a mark on the cover. The failure then appears hours later when the machine warms up and pressurises. Standard compounds are not rated for it and low-temperature ones are, which is a specification choice rather than a quality one. If equipment works through a winter outdoors, the minimum ambient is the number we need, not the working pressure.',
    },
    position: 77,
  },
  {
    slug: 'mexico',
    name: 'Mexico',
    countryCode: 'MX',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Mexico from our Dubai warehouse, quoted per consignment.',
    intro:
      'Mexico has a large and repetitive manufacturing base, which produces a buying pattern seen in few of the markets we serve: the same items, in the same quantities, on a predictable cycle, rather than one-off replacement orders.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Repeat consumption is worth pricing as a whole',
      body: 'Quoting the same line list every quarter serves nobody well. Where consumption is genuinely predictable, agreeing quantities and prices once and drawing against them removes the quotation cycle entirely and lets us hold the right stock rather than reacting to each order. It also makes the freight decision sensible, because a scheduled call-off can go by sea while an unplanned one cannot. Send twelve months of what you actually consumed rather than a forecast — historical usage is a far better basis for an agreement than an estimate, and we would rather price against the real number.',
    },
    position: 78,
  },
  {
    slug: 'panama',
    name: 'Panama',
    countryCode: 'PA',
    summary:
      'Hydraulic hose, fittings, adapters, deck machinery hose and industrial hose supplied to Panama from our Dubai warehouse, quoted per consignment.',
    intro:
      'Panama\'s industrial hydraulics sit around the canal and the ports serving it — tugs, line handling, deck machinery and terminal equipment. Towing and mooring work loads a hydraulic circuit in a way most industrial duty never does.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Shock loading is not the same as high pressure',
      body: 'A towing winch does not see a steady working pressure, it sees surges as a line comes taut and a vessel takes the weight. Those spikes are brief, far above the nominal figure, and repeated thousands of times over a season. A hose selected on steady-state pressure is comfortably rated for the average and progressively destroyed by the peaks, which is why deck machinery lines fail at the fitting rather than in the middle. Impulse-rated construction and correct crimp retention are what survive it. If a line is on a winch, a crane or anything that snatches, tell us — the specification changes.',
    },
    position: 79,
  },
  {
    slug: 'trinidad-and-tobago',
    name: 'Trinidad and Tobago',
    countryCode: 'TT',
    summary:
      'Hydraulic hose, fittings, adapters and chemical transfer hose supplied to Trinidad and Tobago from our Dubai warehouse, quoted per consignment.',
    intro:
      'Trinidad runs one of the larger petrochemical clusters in the region — ammonia and methanol production alongside offshore gas. Ammonia in particular rules out materials that are otherwise unremarkable choices.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Ammonia and brass do not coexist',
      body: 'Copper alloys are attacked by ammonia, and brass fittings in ammonia service crack rather than corrode gracefully — stress corrosion cracking, which gives very little warning and fails suddenly. Brass is the default material for a great many couplings and adapters, so this is an easy specification to get wrong by simply not thinking about it. Steel and stainless are the answer, and the same care applies to any seal or gasket in the circuit. Where a line list mixes ammonia service with ordinary duty, say which items go where and we will separate them rather than quoting one material across the whole order.',
    },
    position: 80,
  },
  {
    slug: 'jamaica',
    name: 'Jamaica',
    countryCode: 'JM',
    summary:
      'Hydraulic hose, fittings, adapters and chemical transfer hose supplied to Jamaica from our Dubai warehouse, quoted per consignment.',
    intro:
      'Bauxite mining and alumina refining dominate Jamaican heavy industry. Refining runs on hot caustic soda at concentration, which is an aggressive medium in a way that is easy to underestimate because it is so ordinary a chemical.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Hot caustic is worse than cold caustic by a long way',
      body: 'A material rated for sodium hydroxide at ambient may have no useful life at all in the same solution at process temperature, and compatibility tables that give a single answer per chemical hide exactly that. Concentration and temperature together determine what survives, and aluminium is attacked by caustic outright, which matters because aluminium turns up in fittings and quick-couplings where nobody expected chemistry to be relevant. Give us the concentration and the operating temperature rather than the chemical name alone, and we will specify tube, cover and end fittings against all three.',
    },
    position: 81,
  },
  {
    slug: 'dominican-republic',
    name: 'the Dominican Republic',
    countryCode: 'DO',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to the Dominican Republic from our Dubai warehouse, quoted per consignment.',
    intro:
      'Gold mining, construction and food processing all contribute to Dominican demand, and all three sit in a hurricane belt. Resupply is reliable for most of the year and can be interrupted precisely when demand for repairs spikes.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'The repairs and the disruption arrive together',
      body: 'A storm season creates its damage and closes the resupply route in the same week, which is an unusually unhelpful combination. Holding a modest buffer of the assemblies that fail most often is cheap insurance against it, and the time to establish that buffer is well before the season rather than during it. The items worth holding are rarely exotic: the standard lengths on the machines that matter, a spread of the common adapters, and the couplings that get damaged when equipment is moved in a hurry. We will help put that list together from what you have been buying.',
    },
    position: 82,
  },
  {
    slug: 'costa-rica',
    name: 'Costa Rica',
    countryCode: 'CR',
    summary:
      'Hydraulic hose, fittings, adapters and clean-service industrial hose supplied to Costa Rica from our Dubai warehouse, quoted per consignment.',
    intro:
      'Costa Rica has built an unusual industrial profile for the region, with medical-device and precision manufacturing alongside agriculture. Production environments of that kind impose requirements on hydraulics that ordinary factories do not.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'In a controlled environment the cover matters as much as the tube',
      body: 'Equipment operating in or beside a cleanroom is judged on what it sheds and what it can be wiped down with, not only on what it contains. A textile-braided cover holds particulate and cannot be properly cleaned; a smooth cover can. Fluids and greases have to be compatible with the cleaning regime, and anything that migrates or outgasses is a problem regardless of how well it lubricates. These are rarely the constraints written into a hydraulic specification, so they tend to surface at validation. Tell us the environment and they can be designed in instead.',
    },
    position: 83,
  },
  {
    slug: 'guatemala',
    name: 'Guatemala',
    countryCode: 'GT',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Guatemala from our Dubai warehouse, quoted per consignment.',
    intro:
      'Sugar is among the largest industrial employers in Guatemala, and sugar mills run to a campaign: months of continuous crushing followed by a complete stop. Every mill in the country follows roughly the same calendar.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'When a whole industry stops at once, so does its supply',
      body: 'Maintenance concentrated into an off-season is efficient for a mill and difficult for everyone supplying it, because demand for the same components arrives from every mill in the same few weeks. Whoever ordered first is served first, and that is the entire mechanism. Ordering against the previous campaign rather than the coming one is the way out of it: what wore this year is a reliable guide to what to hold for next, and placing that order early costs nothing beyond storing it. Leaving it until the crush ends puts you in a queue with the whole industry.',
    },
    position: 84,
  },
  {
    slug: 'honduras',
    name: 'Honduras',
    countryCode: 'HN',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Honduras from our Dubai warehouse, quoted per consignment.',
    intro:
      'Agriculture, food processing and port activity account for most Honduran demand, often through businesses buying directly from outside the region for the first time. Comparing an imported price with a local one is less straightforward than it looks.',
    leadTime: 'Quoted per consignment',
    routes: ['Sea freight', 'Air freight where the schedule is tighter'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Compare landed against landed, not goods against landed',
      body: 'A local supplier quotes a price with everything already inside it — freight, duty, clearance, delivery. An export quotation may not, and depending on the Incoterm it may cover only the goods sitting on a pallet in Dubai. Comparing those two figures directly makes the import look cheaper than it is and produces an unpleasant surprise at clearance. We would rather set that out plainly than win an order on a misunderstanding, so ask us for the delivered figure if that is what you are comparing against, and we will say what is included and what is not.',
    },
    position: 85,
  },
  {
    slug: 'united-kingdom',
    name: 'the United Kingdom',
    countryCode: 'GB',
    summary:
      'Hydraulic hose, fittings, adapters and offshore-specification assemblies supplied to the United Kingdom from our Dubai warehouse, quoted per consignment.',
    intro:
      'The United Kingdom is well supplied domestically for general hydraulics. Where enquiries reach us they tend to come from the North Sea, and increasingly from decommissioning work rather than from production.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Decommissioning is not maintenance run backwards',
      body: 'Taking a structure apart puts loads through equipment that installation never did, and it does so on plant that has already served its design life. Cutting, lifting and recovery tooling gets used hard for a short campaign and then not at all, which makes rental and short-life consumables the sensible pattern rather than a spares holding nobody will ever draw down. It also means the hydraulics have to be right first time on equipment that may be unfamiliar to the crew operating it. Tell us the tool rather than the vessel, and the specification follows from what it actually does.',
    },
    position: 86,
  },
  {
    slug: 'norway',
    name: 'Norway',
    countryCode: 'NO',
    summary:
      'Hydraulic hose, fittings, adapters and offshore-specification assemblies supplied to Norway from our Dubai warehouse, quoted per consignment.',
    intro:
      'Norwegian offshore work runs to its own material and documentation standards, developed for the North Sea and applied rigorously. Those standards, rather than the hardware, are what usually decide whether a product is acceptable.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
      'Material certification to EN 10204 3.1 where specified',
    ],
    context: {
      heading: 'Material certification is the deliverable',
      body: 'On a project working to Norwegian offshore practice, a component without the correct material documentation is not a component — it is an item that cannot be installed, however well it performs. The distinction that catches people is between a general certificate of conformity and a certificate tied to the actual heat of material, inspected independently. The second is what tends to be required and it has to be requested before manufacture, not after delivery. Say which level applies at the enquiry and we will confirm what is obtainable for each line before you commit to it.',
    },
    position: 87,
  },
  {
    slug: 'netherlands',
    name: 'the Netherlands',
    countryCode: 'NL',
    summary:
      'Hydraulic hose, fittings, adapters and large-bore transfer hose supplied to the Netherlands from our Dubai warehouse, quoted per consignment.',
    intro:
      'Dutch dredging and marine contractors work all over the world, and a good deal of the equipment registered here spends its life somewhere else entirely. That changes where goods should actually be sent.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'DAP to a project site', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Buy in Rotterdam, deliver to the project',
      body: 'Where procurement sits in one country and the equipment is working in another, shipping to head office and forwarding on is usually the expensive way round — particularly when the project happens to be somewhere we already ship to weekly. We are frequently closer to a dredger working in the Gulf or East Africa than the buyer ordering for it is. So the useful question at the enquiry is not where to invoice but where the equipment actually is, and those two answers can differ without any difficulty at all: one Estimate, delivery wherever the work is.',
    },
    position: 88,
  },
  {
    slug: 'germany',
    name: 'Germany',
    countryCode: 'DE',
    summary:
      'Hydraulic hose, fittings, adapters and DIN-standard assemblies supplied to Germany from our Dubai warehouse, quoted per consignment.',
    intro:
      'Germany manufactures a large share of the hydraulics in this catalogue, so importing standard product here makes no sense at all. What does make sense involves German equipment that has left Germany.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'DAP to a project site', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Support the installed base where it is working',
      body: 'German machine builders sell heavily into the Gulf, Africa and Central Asia, and every one of those machines eventually needs a hose. Supporting them from Europe means air freight and a week; supporting them from Dubai often means the same day. For a manufacturer with an installed base in our region, holding a small stock of the DIN fittings and hose specifications those machines use, here rather than there, turns a warranty problem into a routine one. That is worth a conversation whether or not anything is ordered from us today.',
    },
    position: 89,
  },
  {
    slug: 'france',
    name: 'France',
    countryCode: 'FR',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to France from our Dubai warehouse, quoted per consignment.',
    intro:
      'French engineering and construction groups operate extensively across West and North Africa, in several of the markets we already ship to. Procurement for those sites is frequently run from France even though nothing is destined for it.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'DAP to a project site', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'One supplier, sites in several countries',
      body: 'A group running projects across a region ends up with a different local supplier at each one, and therefore different hose, different fittings and no common spares holding. Consolidating that on a single source has an obvious advantage in price and a much larger one in interchangeability: an assembly built for a site in one country fits the identical machine in another. We already ship to most of the African markets French contractors work in, so the practical arrangement is usually one agreement centrally and delivery direct to each site.',
    },
    position: 90,
  },
  {
    slug: 'italy',
    name: 'Italy',
    countryCode: 'IT',
    summary:
      'Hydraulic hose, fittings, adapters and marine-specification assemblies supplied to Italy from our Dubai warehouse, quoted per consignment.',
    intro:
      'Italy is a major hose manufacturing country in its own right, and it is also the centre of the world\'s yacht building industry. The second of those has requirements that industrial hydraulics rarely encounters.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'On a yacht the hose has to look right as well as work',
      body: 'Stabiliser, passerelle, hatch and steering circuits on a large yacht run through spaces that people see, and an assembly that would be entirely acceptable in a plant room is not acceptable there. Cover finish, sleeving, consistent cut lengths and clean identification all matter, alongside fire performance where a line passes through a machinery space. None of that appears on a standard hydraulic specification, and all of it gets noticed at survey. Tell us the assembly is for a visible run and we will build and finish it accordingly.',
    },
    position: 91,
  },
  {
    slug: 'spain',
    name: 'Spain',
    countryCode: 'ES',
    summary:
      'Hydraulic hose, fittings, adapters and high-temperature transfer hose supplied to Spain from our Dubai warehouse, quoted per consignment.',
    intro:
      'Spain built much of the world\'s early concentrated solar capacity and continues to engineer it for export, including into the Gulf. Those plants circulate heat transfer fluid at temperatures that rule out ordinary hose entirely.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'DAP to a project site', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Thermal fluid is a temperature problem and a leak problem',
      body: 'Synthetic heat transfer fluids run far above what any rubber construction tolerates, and they are searching liquids that will find a joint a hydraulic oil would never trouble. That combination points to metallic hose with the appropriate braid and to end connections that seal by metal-to-metal contact rather than by an elastomer. Flexibility still matters, because a collector field moves as it tracks and expands as it heats. If you are engineering a plant for a hot climate, the ambient at the site belongs in the specification alongside the fluid temperature.',
    },
    position: 92,
  },
  {
    slug: 'portugal',
    name: 'Portugal',
    countryCode: 'PT',
    summary:
      'Hydraulic hose, fittings, adapters and process transfer hose supplied to Portugal from our Dubai warehouse, quoted per consignment.',
    intro:
      'Pulp and paper is among Portugal\'s larger heavy industries, and a pulp mill is an unusually demanding hydraulic environment — hot, wet, chemically active and running continuously for months between shutdowns.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Steam does the damage from the outside in',
      body: 'Most hose specification concentrates on what is inside the tube, and in a mill the harder problem is often what is outside the cover. A line running near a steam leak or through a humid, hot section ages from the outside, and by the time the cover is cracking the reinforcement beneath it has already been exposed to moisture for months. Corrosion of the wire then finishes it. Where a run cannot be moved away from heat, sleeving and a cover compound chosen for external conditions is what extends its life, and both are cheaper than the unplanned stop.',
    },
    position: 93,
  },
  {
    slug: 'ireland',
    name: 'Ireland',
    countryCode: 'IE',
    summary:
      'Hydraulic hose, fittings, adapters and sanitary transfer hose supplied to Ireland from our Dubai warehouse, quoted per consignment.',
    intro:
      'Pharmaceutical manufacturing and dairy processing account for a large share of Irish industry, and both are audited environments where what can be evidenced matters as much as what was installed.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
      'Material certification to EN 10204 3.1 where specified',
    ],
    context: {
      heading: 'If it is not documented it did not happen',
      body: 'In a validated facility a component carries a paper trail from the material it was made of through to the person who installed it, and a substitution made sensibly on the floor becomes a deviation that has to be written up. That is why an equivalent part is rarely welcome even when it is technically better. What helps is knowing before the order which certification level applies to each line, because obtaining it retrospectively ranges from expensive to impossible. Ask us for the documentation at quotation and it travels with the goods.',
    },
    position: 94,
  },
  {
    slug: 'belgium',
    name: 'Belgium',
    countryCode: 'BE',
    summary:
      'Hydraulic hose, fittings, adapters and chemical transfer hose supplied to Belgium from our Dubai warehouse, quoted per consignment.',
    intro:
      'Antwerp hosts one of the largest chemical clusters anywhere, and the range of media handled across a single site there is wider than almost any other industrial environment we supply.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'One site, twenty media, twenty different answers',
      body: 'Where a plant handles many chemicals, the temptation is to standardise on one hose that is compatible with most of them and accept a shorter life on the rest. That works until the day an assembly is moved from one duty to another because it was on the shelf and physically fitted. Colour coding and permanent tagging by service are worth more here than anywhere else, and we will tag assemblies to a customer scheme rather than to ours. It costs nothing at build and removes an entire category of mistake later on.',
    },
    position: 95,
  },
  {
    slug: 'luxembourg',
    name: 'Luxembourg',
    countryCode: 'LU',
    summary:
      'Hydraulic hose, fittings, adapters and high-temperature assemblies supplied to Luxembourg from our Dubai warehouse, quoted per consignment.',
    intro:
      'Steel production and the engineering around it remain central to Luxembourg industry. A rolling mill exposes hydraulics to radiant heat and to the risk of ignition, which is a combination with very few acceptable answers.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Near hot metal, a pinhole is an ignition source',
      body: 'Mineral oil released as a fine spray onto hot steel ignites, and the failure that causes it need not be dramatic — a pinhole in a cover is enough. That is why mill hydraulics move to fire-resistant fluids, and why the hose has to be compatible with whichever type was chosen, since water-glycol and phosphate ester attack quite different things. Protective sleeving matters too, both to keep radiant heat off the cover and to contain a spray if one occurs. Tell us the fluid designation rather than the phrase fire-resistant; the four families are not interchangeable.',
    },
    position: 96,
  },
  {
    slug: 'denmark',
    name: 'Denmark',
    countryCode: 'DK',
    summary:
      'Hydraulic hose, fittings, adapters and offshore-specification assemblies supplied to Denmark from our Dubai warehouse, quoted per consignment.',
    intro:
      'Danish industry is closely tied to offshore wind, both in manufacturing and in the service operations that keep installed turbines running. Turbine hydraulics are a peculiar duty: small in volume, awkward to reach and expensive to attend.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'DAP to a project site', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'The part is cheap and reaching it is not',
      body: 'A pitch or brake assembly costs very little against the vessel, the weather window and the technician time required to change it offshore. That inverts the usual economics completely: it is worth paying considerably more for a longer-lived component, and worth changing anything marginal while somebody is already up there rather than scheduling a second visit. It also means every assembly on the trip should be correct and identified before departure, because there is no second chance that day. We build and tag to a turbine-specific list for exactly that reason.',
    },
    position: 97,
  },
  {
    slug: 'sweden',
    name: 'Sweden',
    countryCode: 'SE',
    summary:
      'Hydraulic hose, fittings, adapters and fire-resistant fluid compatible assemblies supplied to Sweden from our Dubai warehouse, quoted per consignment.',
    intro:
      'Swedish underground mining operates at depth and at scale, and underground is where a hydraulic fire stops being a machine problem and becomes an evacuation. Fluid choice follows from that, and hose choice follows from fluid.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Underground, the fluid dictates everything downstream',
      body: 'Once a fleet moves to a fire-resistant fluid, seals, hose linings and even permissible operating pressures change with it, because these fluids carry less load and are harder on components than mineral oil. Retrofitting one into a machine specified for the other, without revisiting what it touches, produces failures that look random and are not. The conversion is straightforward when planned and troublesome when discovered. If a machine is being converted, send the fluid designation and the existing hose specifications together and we will identify what has to change.',
    },
    position: 98,
  },
  {
    slug: 'finland',
    name: 'Finland',
    countryCode: 'FI',
    summary:
      'Hydraulic hose, fittings, adapters and high-flex assemblies supplied to Finland from our Dubai warehouse, quoted per consignment.',
    intro:
      'Finnish forestry machinery is exported worldwide and works its hydraulics unusually hard. A harvester crane articulates constantly, and the hose running along it flexes on every movement rather than sitting still under pressure.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Routing decides the life of a hose that never stops moving',
      body: 'On articulating equipment the hose fails where it is constrained, not where it is loaded. A clamp positioned so that bending happens at the fitting rather than along the free length will destroy assemblies indefinitely, and replacing them with a better hose changes nothing at all. The fix is geometric: enough free length, the bend taken in the middle of the run, and clamps that locate rather than pinch. If a particular assembly on a machine keeps failing and its neighbours do not, that is a routing problem and we would rather help solve it than keep supplying the replacement.',
    },
    position: 99,
  },
  {
    slug: 'iceland',
    name: 'Iceland',
    countryCode: 'IS',
    summary:
      'Hydraulic hose, fittings, adapters and marine deck assemblies supplied to Iceland from our Dubai warehouse, quoted per consignment.',
    intro:
      'Fishing and onboard processing dominate Icelandic industry, which puts hydraulics into permanent contact with salt water and, on the processing side, into direct proximity with food.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Deck and factory are two different specifications',
      body: 'On the same vessel, a trawl winch line and a line inside the processing deck face opposite problems. The first needs salt resistance and mechanical toughness; the second needs to be cleanable, to tolerate wash-down chemicals and hot water, and to be acceptable near product. A single hose specified for the whole boat does one of those jobs adequately and the other badly. Splitting the list by where each assembly actually runs takes a few minutes at the enquiry and produces a materially better answer than treating the vessel as one environment.',
    },
    position: 100,
  },
  {
    slug: 'austria',
    name: 'Austria',
    countryCode: 'AT',
    summary:
      'Hydraulic hose, fittings, adapters and safety-critical assemblies supplied to Austria from our Dubai warehouse, quoted per consignment.',
    intro:
      'Austrian engineering has a strong position in ropeways and Alpine infrastructure, exported to mountain and desert resorts alike. Passenger-carrying equipment is governed differently from industrial plant, and that governs the hydraulics too.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'DAP to a project site', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
      'Material certification to EN 10204 3.1 where specified',
    ],
    context: {
      heading: 'Where people are carried, substitution is not a decision you make',
      body: 'On equipment that carries passengers, components are approved as part of a certified system and an inspector will ask what was fitted and on whose authority. An equivalent hose is not equivalent in that context, whatever its rating, because the approval attaches to the specific item rather than to the specification. So the correct answer here is almost always the originally specified part with its documentation, and where we cannot obtain that we will say so rather than propose something that would put a certificate at risk.',
    },
    position: 101,
  },
  {
    slug: 'switzerland',
    name: 'Switzerland',
    countryCode: 'CH',
    summary:
      'Hydraulic hose, fittings, adapters and heavy-duty assemblies supplied to Switzerland from our Dubai warehouse, quoted per consignment.',
    intro:
      'Swiss engineering has an outsized position in tunnelling, and tunnel boring machines are among the most hydraulically intensive pieces of equipment built. They also work in a place nothing can easily be brought to.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'DAP to a project site', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Kilometres underground, everything is a planned change',
      body: 'A boring machine cannot be pulled out for a repair, so maintenance happens in the tunnel, in confined space, during whatever window the excavation cycle allows. Under those conditions a failed assembly is not a component problem but a schedule problem, and the response is to change things before they fail rather than after. That requires knowing what is fitted, in what length, at what point in the machine — which is a labelling and records exercise as much as an engineering one. We tag and document assemblies against a machine list for exactly this kind of work.',
    },
    position: 102,
  },
  {
    slug: 'poland',
    name: 'Poland',
    countryCode: 'PL',
    summary:
      'Hydraulic hose, fittings, adapters and water-hydraulic assemblies supplied to Poland from our Dubai warehouse, quoted per consignment.',
    intro:
      'Polish coal mining still runs powered roof supports at scale, and longwall hydraulics work on water-based emulsion rather than oil. That single difference changes almost every component decision downstream of the pump.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Water emulsion corrodes what oil protected',
      body: 'Mineral oil leaves a film that quietly protects steel from the inside. A high-water-content emulsion does not, so every internal surface it touches has to resist corrosion on its own account, and any component specified for oil service will begin rusting where nobody can see it. Fitting materials, plating and seal compounds all have to suit the fluid rather than merely the pressure, and pressures on roof supports are high enough that a corroded fitting fails suddenly. If a circuit runs on emulsion, say so at the enquiry — it is the first fact we need, not a detail.',
    },
    position: 103,
  },
  {
    slug: 'czechia',
    name: 'Czechia',
    countryCode: 'CZ',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Czechia from our Dubai warehouse, quoted per consignment.',
    intro:
      'Czech machine-building has a long history and a strong export position, particularly in machine tools and heavy equipment. A good deal of that output ends up in markets we already supply.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'DAP to a project site', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Commissioning spares belong in the crate',
      body: 'When a machine is exported, the hoses most likely to be needed in its first year are the ones nobody thinks about while it is being built. Sending a small commissioning set with the machine costs very little at that point and saves an air freight and a customs entry later, at a moment when a new installation is under scrutiny. Deciding what goes in that set is a fifteen-minute exercise on the schematic. For builders shipping into the Gulf or Africa, we can also hold that set here instead, which removes the freight entirely.',
    },
    position: 104,
  },
  {
    slug: 'slovakia',
    name: 'Slovakia',
    countryCode: 'SK',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Slovakia from our Dubai warehouse, quoted per consignment.',
    intro:
      'Slovakia builds more cars per head than almost anywhere, and automotive production hydraulics are governed by takt time. A stoppage is measured in vehicles not built, which sets the whole maintenance posture.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Change it on schedule or it will choose its own moment',
      body: 'On a line running to takt, the cheapest hose is the one replaced during a planned window rather than the one that lasted longest. Time-based replacement looks wasteful on a spreadsheet and is not, because the alternative is an unplanned stop costing several orders of magnitude more than the assembly. Making that work needs assemblies that are identified, interchangeable and available in matched sets so a station can be done in one intervention. We build and label to a station list rather than to individual part numbers where that helps.',
    },
    position: 105,
  },
  {
    slug: 'hungary',
    name: 'Hungary',
    countryCode: 'HU',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Hungary from our Dubai warehouse, quoted per consignment.',
    intro:
      'Hungarian industry combines automotive assembly with a substantial pharmaceutical sector, and increasingly with battery manufacturing. The last of those is a genuinely new duty with requirements the others do not share.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Dry rooms are unforgiving about moisture and about solvents',
      body: 'Battery manufacturing happens in atmospheres controlled to very low humidity, alongside solvents that attack materials which are perfectly stable elsewhere. A hose assembly introduced into that environment has to be compatible with the solvent, must not carry moisture in with it, and must not shed anything. Those constraints rarely appear on a hydraulic specification and are absolute once you are inside the room. If a line serves a dry room or a coating process, tell us which solvent is present and we will specify against it rather than against pressure alone.',
    },
    position: 106,
  },
  {
    slug: 'romania',
    name: 'Romania',
    countryCode: 'RO',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Romania from our Dubai warehouse, quoted per consignment.',
    intro:
      'Romania has one of the oldest oil industries in the world and a good deal of plant that reflects it. Equipment of that vintage was built to standards that have since been superseded, which makes matching a part harder than it looks.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'A superseded standard is not the same as no standard',
      body: 'Old equipment was built correctly to a specification that has since been replaced, and the modern equivalent frequently differs in a dimension that matters. A thread that is nominally the same size may have a different pitch or a different seat angle than it did decades ago, and the current part will engage and then leak. The way through is measurement rather than cross-reference: pitch, seat and sealing method taken from the component in hand. Send those and we will identify what actually mates with it, including where the honest answer is an adapter rather than a match.',
    },
    position: 107,
  },
  {
    slug: 'bulgaria',
    name: 'Bulgaria',
    countryCode: 'BG',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Bulgaria from our Dubai warehouse, quoted per consignment.',
    intro:
      'Copper and lead-zinc mining, metals processing and a Black Sea port sector account for most Bulgarian heavy industry. Smelting in particular puts hydraulics next to molten metal and moving vessels.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Splash protection is a specification, not an accessory',
      body: 'Around tilting furnaces and casting equipment the hazard is not steady radiant heat but occasional contact with something molten, and a standard cover offers no protection against it at all. Silicone-coated fire sleeve does, and it is chosen by the temperature and duration it must withstand rather than bought as a generic wrap. It is also worth fitting before an incident rather than after, which sounds obvious and is routinely deferred because the hose underneath is perfectly serviceable. Tell us where an assembly runs and we will supply it already sleeved.',
    },
    position: 108,
  },
  {
    slug: 'greece',
    name: 'Greece',
    countryCode: 'GR',
    summary:
      'Hydraulic hose, fittings, adapters and marine deck assemblies supplied to Greece from our Dubai warehouse, quoted per consignment.',
    intro:
      'Greek owners control one of the largest merchant fleets in the world, and almost none of it is in Greece at any given moment. Procurement happens in Piraeus; the ship needing the part is somewhere else entirely.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'DAP to an agent at a port of call', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Deliver to the port of call, not to the office',
      body: 'A vessel spares order has a delivery window defined by a berthing schedule, and the destination is wherever the ship will next be alongside long enough to receive goods. For anything transiting the Gulf, Suez or the Indian Ocean, we are frequently the closest source of supply and can deliver to an agent at the port rather than shipping to head office for onward forwarding. What we need is the port, the agent and the window. Send those with the part list and the whole exercise becomes one delivery instead of two.',
    },
    position: 109,
  },
  {
    slug: 'cyprus',
    name: 'Cyprus',
    countryCode: 'CY',
    summary:
      'Hydraulic hose, fittings, adapters and offshore assemblies supplied to Cyprus from our Dubai warehouse, quoted per consignment.',
    intro:
      'Cyprus combines a large ship-management sector with East Mediterranean gas exploration. Exploration work is campaign-based, which produces a very different procurement rhythm from steady production.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'A campaign is a fixed window with no resupply inside it',
      body: 'Exploration drilling runs for a defined period and then stops, and everything needed has to be aboard before it starts because mid-campaign resupply is expensive and sometimes impossible. That makes the spares list a one-shot decision rather than a rolling one, and the usual instinct — order what is certain and deal with the rest later — is exactly wrong. Build the list against what the equipment could need rather than what it probably will, and return the unused portion afterwards. We will quote a campaign set on that basis and take back what was not opened.',
    },
    position: 110,
  },
  {
    slug: 'malta',
    name: 'Malta',
    countryCode: 'MT',
    summary:
      'Hydraulic hose, fittings, adapters and marine assemblies supplied to Malta from our Dubai warehouse, quoted per consignment.',
    intro:
      'Malta operates one of the largest ship registries in the world alongside a working ship repair sector. Both mean the governing requirement is usually a class society rather than an engineering preference.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
      'Class-society type approval where specified',
    ],
    context: {
      heading: 'Class approval is not the same as a test certificate',
      body: 'A hose can be pressure tested, documented and entirely fit for purpose and still be refused by a surveyor because the type is not approved by the class society that vessel is registered with. Type approval attaches to the product and is granted by the society; a test certificate attaches to the individual assembly. Both may be needed and they are not substitutes. Where a line is in a certified system, tell us which society applies before we quote, because it narrows what is acceptable in a way that no amount of testing after the fact can widen.',
    },
    position: 111,
  },
  {
    slug: 'turkey',
    name: 'Turkey',
    countryCode: 'TR',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Turkey from our Dubai warehouse, quoted per consignment.',
    intro:
      'Turkey manufactures hydraulics competitively and its contractors build across Central Asia, the Caucasus and North Africa. Both facts point the same way: the useful conversation is rarely about supplying Turkey itself.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows', 'Overland where the routing suits'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'DAP to a project site', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Supply the project, wherever the project is',
      body: 'A Turkish contractor building in Kazakhstan, Iraq or Libya is working in markets we ship to as a matter of routine, and supplying those sites from Dubai is usually shorter and simpler than supplying them from Istanbul. The commercial relationship can still sit in Turkey — one agreement, one set of terms, deliveries wherever the work is. That also solves the interchangeability problem a contractor accumulates when each site buys locally, because the same specification arrives everywhere rather than five near-equivalents.',
    },
    position: 112,
  },
  {
    slug: 'croatia',
    name: 'Croatia',
    countryCode: 'HR',
    summary:
      'Hydraulic hose, fittings, adapters and marine assemblies supplied to Croatia from our Dubai warehouse, quoted per consignment.',
    intro:
      'Croatian industry pairs a long shipbuilding tradition with a very large seasonal marina and charter sector. Seasonal operation concentrates all maintenance into a narrow window before the season opens.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Everything gets done in the weeks before the season',
      body: 'A fleet that works six months a year does its maintenance in the two months before it starts, and so does every other operator on the coast. The result is a short, crowded period where availability rather than price decides what gets fixed properly and what gets deferred. Ordering during the season for the following one is unglamorous and entirely effective: the parts sit on a shelf over the winter rather than being chased in spring. We will quote a lay-up list at any time of year, and the quiet months are when it is worth doing.',
    },
    position: 113,
  },
  {
    slug: 'slovenia',
    name: 'Slovenia',
    countryCode: 'SI',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Slovenia from our Dubai warehouse, quoted per consignment.',
    intro:
      'Slovenia has a concentrated manufacturing base with a strong position in components and appliances, much of it supplying larger assemblers elsewhere in Europe. Component makers live or die on consistency.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'A change you were not told about is the expensive kind',
      body: 'Supplying a tier-one assembler means any variation in your own output has to be explained, which means variation in what you buy has to be known about first. A hose whose construction has quietly changed between orders is a problem not because it performs worse but because nobody expected it to perform differently. We would rather flag a specification change before shipping and let you decide than substitute silently, and where a manufacturer discontinues a construction we will say what replaces it and how the two differ.',
    },
    position: 114,
  },
  {
    slug: 'serbia',
    name: 'Serbia',
    countryCode: 'RS',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Serbia from our Dubai warehouse, quoted per consignment.',
    intro:
      'Serbia is landlocked, with mining, metals and agriculture forming the core of its heavy industry. Copper extraction in the east is the largest single consumer of hydraulics in the country.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight to a regional port, then overland'],
    incoterms: ['CIF to the port of entry', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Air freight is worth it less often than people think',
      body: 'For a landlocked destination the reflex is to move everything by air because the surface alternative involves a port and a border. That is right for the assembly holding up production and wrong for the other forty lines on the same order, where it can multiply the cost of a routine replenishment for no operational benefit at all. Splitting an order by urgency rather than shipping it all one way is nearly always cheaper. We will price a split against the same line list so the comparison is in front of you rather than assumed.',
    },
    position: 115,
  },
  {
    slug: 'bosnia-and-herzegovina',
    name: 'Bosnia and Herzegovina',
    countryCode: 'BA',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Bosnia and Herzegovina from our Dubai warehouse, quoted per consignment.',
    intro:
      'Bosnian industry centres on metals, mining and hydroelectric generation, much of it operating plant installed a long time ago and maintained rather than replaced. Keeping older equipment running is the normal condition here.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight to a regional port, then overland'],
    incoterms: ['CIF to the port of entry', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Rebuild the assembly, not just the hose',
      body: 'When a hose fails on plant that has been in service for decades, the fitting it was crimped to has usually seen the same decades. Reusing it because it looks sound is how a repair fails again in a month, and the saving is trivial against the second intervention. A replacement assembly should be exactly that — new hose, new ferrules, new fittings, crimped and tested as a unit. Where an original fitting genuinely cannot be replaced because nothing current matches the port, that is worth knowing in advance, and it is usually solvable with an adapter.',
    },
    position: 116,
  },
  {
    slug: 'north-macedonia',
    name: 'North Macedonia',
    countryCode: 'MK',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to North Macedonia from our Dubai warehouse, quoted per consignment.',
    intro:
      'North Macedonia is landlocked with a manufacturing base concentrated in free-economic zones supplying automotive and electrical assemblers. Those operations run to their parent group\'s standards rather than to local ones.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight to a regional port, then overland'],
    incoterms: ['CIF to the port of entry', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'The specification comes from head office, not the plant',
      body: 'A subsidiary plant frequently has no authority to choose a component, only to source the one already specified by a group engineering function in another country. That is worth establishing before quoting, because the useful answer is then a named product rather than a technically equivalent one, and an alternative — however good — simply cannot be accepted locally. Send the group specification if you have it. Where we cannot supply a mandated brand we will say so at once rather than proposing something that would have to be escalated and refused.',
    },
    position: 117,
  },
  {
    slug: 'montenegro',
    name: 'Montenegro',
    countryCode: 'ME',
    summary:
      'Hydraulic hose, fittings, adapters and marine assemblies supplied to Montenegro from our Dubai warehouse, quoted per consignment.',
    intro:
      'Montenegro is small, with a working cargo port at Bar and a superyacht marina sector that has grown quickly. Those two produce quite different requirements from the same short coastline.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Small market, so ask before you assume it is unavailable',
      body: 'In a market this size a local distributor cannot economically hold much beyond the fastest-moving lines, and the working assumption becomes that anything unusual is a long wait. Frequently it is not. A single adapter, a short run of an uncommon bore, a coupling in a pattern nobody stocks locally — those are ordinary catalogue items here and they move by air in days. It is worth asking rather than designing around the constraint, particularly when the alternative is modifying equipment to suit what happens to be available.',
    },
    position: 118,
  },
  {
    slug: 'albania',
    name: 'Albania',
    countryCode: 'AL',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Albania from our Dubai warehouse, quoted per consignment.',
    intro:
      'Albania has chromium and copper extraction, hydroelectric generation and a growing construction sector. Much of the plant doing that work has been imported second-hand from across Europe over the last two decades.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'Machine documentation rarely crosses the border with the machine',
      body: 'Equipment bought used tends to arrive without its manual, its parts list or any record of what has been changed. Identifying a component then means working from the component itself, and the most useful thing anyone can do is measure before ordering rather than describe. Across the flats of a hex, the outside diameter of a thread, whether the seat is cone or flat, and the overall length between end faces will identify most fittings unambiguously. Send those four numbers and a photograph and the guessing stops.',
    },
    position: 119,
  },
  {
    slug: 'kosovo',
    name: 'Kosovo',
    countryCode: 'XK',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Kosovo from our Dubai warehouse, quoted per consignment.',
    intro:
      'Kosovo is landlocked, with lignite mining and power generation forming the backbone of its heavy industry alongside construction. Surface mining on that scale runs large, continuously-operating equipment.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight to a regional port, then overland'],
    incoterms: ['CIF to the port of entry', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'On continuous plant, the spare is the machine',
      body: 'Where excavation and conveying run without interruption, a single assembly can hold up an entire production chain rather than one machine, because everything downstream of it stops too. That makes the value of a spare completely different from its price, and it justifies holding duplicates of a small number of critical items that would never be economic on intermittent plant. Identifying which they are means following the process rather than the equipment list. We will work through that with you and it usually produces a shorter list than expected.',
    },
    position: 120,
  },
  {
    slug: 'moldova',
    name: 'Moldova',
    countryCode: 'MD',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Moldova from our Dubai warehouse, quoted per consignment.',
    intro:
      'Moldova is landlocked and agricultural, with food and wine processing alongside farming as the main industrial activity. Agricultural hydraulics are seasonal in a way factory hydraulics never are.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight to a regional port, then overland'],
    incoterms: ['CIF to the port of entry', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Pre-shipment inspection where the destination requires it',
    ],
    context: {
      heading: 'A harvester that stops in September cannot wait for anything',
      body: 'Agricultural machinery sits idle for most of the year and then becomes absolutely time-critical for a few weeks. A hose that fails during harvest cannot wait for a sensible freight decision, and the value of the standing crop makes almost any expedited cost rational. The answer is to spend the idle months preparing: inspect the assemblies that flex and chafe, replace anything doubtful before the season rather than during it, and hold the two or three that would stop a machine. All of that is cheap in June and priceless in September.',
    },
    position: 121,
  },
  {
    slug: 'georgia',
    name: 'Georgia',
    countryCode: 'GE',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Georgia from our Dubai warehouse, quoted per consignment.',
    intro:
      'Georgia sits on the transit corridor between the Caspian and the Black Sea, and its ports and pipeline infrastructure handle volumes far beyond what its own economy generates. Transit is the industry.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows', 'Overland where the routing suits'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Terminal loading arms and the hose that serves them',
      body: 'Product transfer at a terminal happens through equipment that is inspected and certified as a system, and the flexible sections within it are part of that certification rather than consumables bought on price. They also carry hydrocarbons at volume, where a failure is an environmental event rather than a maintenance one. Composite construction is common for exactly that reason: it fails progressively rather than catastrophically. If you are specifying for loading or offloading duty, tell us the product and the certification regime and we will work within both.',
    },
    position: 122,
  },
  {
    slug: 'azerbaijan',
    name: 'Azerbaijan',
    countryCode: 'AZ',
    summary:
      'Hydraulic hose, fittings, adapters and offshore assemblies supplied to Azerbaijan from our Dubai warehouse, quoted per consignment.',
    intro:
      'Caspian oil and gas dominates Azerbaijani industry, operated offshore from a landlocked sea. That combination produces a supply position with no real parallel elsewhere in our markets.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Overland where the routing suits'],
    incoterms: ['CIF to the port of entry', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Offshore, but nothing arrives by sea',
      body: 'The Caspian is enclosed, so equipment for an offshore field there reaches it by road, rail or air rather than by ship, and the marine leg everyone assumes exists simply does not. Sea freight is not a cheaper slower option here; for practical purposes it is not an option at all. That removes the usual sea-versus-air trade-off and replaces it with a routing question, which is worth settling at the enquiry rather than at booking. Dimensions and weight matter more than they would elsewhere, because everything travels overland to the shore base.',
    },
    position: 123,
  },
  {
    slug: 'estonia',
    name: 'Estonia',
    countryCode: 'EE',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Estonia from our Dubai warehouse, quoted per consignment.',
    intro:
      'Estonian industry includes oil shale extraction and processing, which is unusual enough that equipment serving it has few direct parallels. It is mined, crushed and retorted, all of it abrasive and hot by turns.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'One process, two opposite environments',
      body: 'A plant that both extracts and processes puts hydraulics through mining duty at one end and thermal duty at the other, and the specification that suits one is wrong for the other. Standardising across the site on a single hose to simplify stores is a false economy: the mining end wears out a hose built for heat and the process end cooks a hose built for abrasion. Two specifications and clear identification is the better answer, and it need not mean two suppliers or two stock accounts. Tell us where each assembly lives.',
    },
    position: 124,
  },
  {
    slug: 'latvia',
    name: 'Latvia',
    countryCode: 'LV',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Latvia from our Dubai warehouse, quoted per consignment.',
    intro:
      'Latvian industry is anchored by its ports and by timber processing, both of which run materials handling equipment continuously through winters cold enough to change how machinery behaves.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Cold start is where the damage happens',
      body: 'Hydraulic fluid thickens as it cools, and a machine started and worked hard before it has warmed through will cavitate its pump and stress every line in the circuit. The damage is cumulative and invisible until something fails in a way that looks unrelated. Warming through before load is the operational answer; on the component side it means fluid with the right viscosity index for the actual winter minimum and hose that stays flexible at it. A machine that lives outdoors year-round needs to be specified for the worst month, not the average.',
    },
    position: 125,
  },
  {
    slug: 'lithuania',
    name: 'Lithuania',
    countryCode: 'LT',
    summary:
      'Hydraulic hose, fittings, adapters, valves and industrial hose supplied to Lithuania from our Dubai warehouse, quoted per consignment.',
    intro:
      'Lithuania combines a refinery and fertiliser production with a substantial port at Klaipėda. Fertiliser handling brings chemistry that is unforgiving of the wrong material choice.',
    leadTime: 'Quoted per consignment',
    routes: ['Air freight', 'Sea freight where the schedule allows'],
    incoterms: ['CIF', 'FOB Jebel Ali', 'EXW Dubai for a nominated forwarder'],
    conformity: [
      'Certificate of Origin, Dubai Chamber attested',
      'Manufacturer certificate of conformity on request',
    ],
    context: {
      heading: 'Fertiliser is corrosive long before it is anything else',
      body: 'Ammonium nitrate and urea solutions attack carbon steel steadily and are hard on several stainless grades too, and the damage tends to appear at the fitting rather than in the hose because that is where the metal is. Bulk handling adds abrasion from prilled product on top of it. What survives is a combination decided by the specific compound and its concentration rather than by the word fertiliser, and the end fittings deserve as much attention as the tube. Send the product and the strength and we will specify the whole assembly against them.',
    },
    position: 126,
  },
]

export function marketBySlug(slug: string): Market | undefined {
  return MARKETS.find((m) => m.slug === slug)
}

export function marketsOrdered(): Market[] {
  return [...MARKETS].sort((a, b) => a.position - b.position)
}

/**
 * Country name with any leading article removed.
 *
 * `name` carries the article because the page templates read "supplier in
 * {name}", and "supplier in United States" is wrong. A schema.org Country
 * node wants the bare name, so anything feeding JSON-LD goes through this.
 */
export function marketCountryName(market: Market): string {
  return market.name.replace(/^the /, '')
}

/** Country names for `areaServed` on the Service JSON-LD. */
export function marketNames(): string[] {
  return marketsOrdered().map(marketCountryName)
}

/** ISO codes, for the Organization `areaServed`. */
export function marketCountryCodes(): string[] {
  return marketsOrdered().map((m) => m.countryCode)
}
