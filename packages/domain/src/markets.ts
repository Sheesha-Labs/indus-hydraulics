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
