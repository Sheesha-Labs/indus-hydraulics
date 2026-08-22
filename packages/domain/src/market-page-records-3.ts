import type { MarketPage } from './market-pages'

/**
 * Wave 3 — Europe, North America and the Caribbean.
 *
 * THESE WERE PARKED, AND THEN COMMISSIONED. The project record had all 48
 * index-only on commercial grounds: a Dubai warehouse supplying Luxembourg or
 * Ohio is a hard story, and those keywords are expensive. The design handoff
 * recommended against building them on the full template and proposed a
 * lighter variant instead. The founder decided otherwise on 2026-08-22 and
 * asked for the full template. That decision is recorded here rather than
 * argued again in every review.
 *
 * WHAT MAKES THESE PAGES DIFFERENT TO WRITE. On the African and Asian lanes
 * the argument is the lane itself — a named crossing, a conformity scheme, a
 * transit measured in weeks. Here the lane is short, the customs union does
 * most of the work and any local distributor is closer than we are. Pretending
 * otherwise would produce forty-eight interchangeable pages.
 *
 * So the argument moves, and it moves to something that is actually true:
 *
 *   - SPECIFICATION, not proximity. A buyer here can get a hose locally
 *     tomorrow. What they often cannot get is the pattern — a GOST coupling, a
 *     JIS cone, an SS316L thread form, an API-monogrammed assembly — without a
 *     six-week factory order. That is the sentence these pages are built on.
 *   - The CONFORMITY hook is real and specific: PED 2014/68/EU over assemblies
 *     above the pressure-volume threshold, the Machinery Regulation, REACH on
 *     the elastomer compounds, and UKCA where the UK has diverged. Those apply
 *     to hydraulic hose assemblies and are worth explaining properly.
 *   - The ENTRY POINT does real work. One customs union means Rotterdam,
 *     Antwerp or Hamburg clears goods for a hinterland of twenty countries,
 *     and which one a consignment routes through is a genuine decision.
 *
 * CURRENCY IS CONSTRAINED, NOT CHOSEN. `Currency` in the Prisma schema is
 * USD | EUR | AED | SAR — there is no GBP, NOK, CHF, PLN or TRY. Every
 * European market therefore quotes EUR and every American one USD. That is
 * defensible for export trade out of Dubai, but it is a schema limit rather
 * than a commercial judgement, and if a buyer ever needs a sterling or krone
 * quotation the enum has to grow first.
 *
 * All records land `released: false` / `regulatoryCopy: 'unverified'`, like
 * every other authored market.
 */

/** Spread a shared leg into a route, then append the market's own waypoints. */
function leg(shared: readonly (readonly [number, number])[], ...rest: [number, number][]): [number, number][] {
  return [...shared.map(([lon, lat]) => [lon, lat] as [number, number]), ...rest]
}

/** Jebel Ali through Hormuz, the Red Sea and Suez into the eastern Mediterranean. */
const SUEZ_TO_MED = [
  [55.03, 25.01],
  [56.6, 26.55],
  [59.9, 22.3],
  [57.0, 15.5],
  [52.0, 12.5],
  [45.0, 12.3],
  [43.4, 12.6],
  [38.0, 20.0],
  [35.0, 27.0],
  [32.6, 29.9],
  [32.3, 31.3],
] as const

/** On west through the Mediterranean and out past Gibraltar into the Atlantic. */
const MED_TO_ATLANTIC = [
  ...SUEZ_TO_MED,
  [28.0, 33.5],
  [20.0, 34.5],
  [11.0, 37.2],
  [3.0, 37.0],
  [-5.6, 35.95],
] as const

/**
 * On past Iberia and up the Atlantic into the North Sea.
 *
 * Rotterdam, Antwerp and Hamburg are one decision, not three: goods clear once
 * into the EU customs union and move inland under it. Which gate a consignment
 * uses is a routing choice about the inland leg, not a customs one — that is
 * the framing every North Sea page here shares.
 */
const ATLANTIC_TO_NORTH_SEA = [
  [-9.5, 38.7],
  [-9.5, 44.0],
  [-6.0, 48.0],
  [-1.5, 50.0],
  [2.0, 51.2],
] as const

/** DXB north-west over Arabia and Türkiye — the shared air leg into Europe. */
const EUROPE_AIR = [
  [55.36, 25.25],
  [45.0, 30.0],
  [35.0, 37.0],
  [25.0, 42.0],
] as const

const TURKEY: MarketPage = {
  slug: 'turkey',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → TR',
  dialCode: '+90',
  currency: 'EUR',
  localName: 'Türkiye',
  lede: 'Türkiye is the shortest lane in this half of the network and the one where the argument is least about freight. Mersin is ten to fourteen days from Jebel Ali and the industrial belt behind it makes most of what we sell. What a buyer here comes to us for is the pattern a local supplier does not hold — a GOST coupling for a Central Asian contract, an SS316L thread form, an API-monogrammed assembly — and the conformity file that has to travel with it.',
  facts: [
    { label: 'Typical transit', value: 'Typically 10–14 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali through Suez to Mersin for the southern belt · Ambarlı and Gemlik for Marmara · Izmir for the Aegean · Air freight into Istanbul where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'CIF Mersin · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'CE marking and the PED declaration where the assembly is above threshold · TSE conformity where the line is regulated · Certificate of Origin, Dubai Chamber attested · Customs declaration raised by the importer',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via Suez' },
    { label: 'Port of entry', value: 'Mersin' },
    { label: 'Transit', value: '10–14 days' },
    { label: 'Quoted in', value: 'EUR' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Turkey'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'MERSIN · PORT', coords: [34.64, 36.8], legend: 'Port of entry', dx: 11, dy: 10, anchor: 'start' },
    routes: [
      { mode: 'SEA · SUEZ', primary: true, points: leg(SUEZ_TO_MED, [33.0, 33.0], [34.64, 36.8]) },
      { mode: 'AIR', points: leg(EUROPE_AIR, [28.81, 40.98]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '10–14 days', route: 'Jebel Ali to Mersin, via Suez', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '2–4 days', route: 'DXB to IST', useCase: 'When the line is down' },
    { name: 'Sea, LCL', transit: '16–22 days', route: 'Consolidated, with transhipment', useCase: 'Small mixed orders' },
  ],
  orderSteps: {
    third:
      'Where the assembly falls above the PED threshold the CE declaration travels with it, and any TSE requirement is settled before the container is loaded.',
    fourth: 'Goods sail from Jebel Ali through Suez to Mersin, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Istanbul', coords: [28.98, 41.01], region: 'Marmara', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Ambarlı', coords: [28.69, 40.97], region: 'Marmara' },
    { name: 'Gemlik', coords: [29.16, 40.43], region: 'Marmara' },
    { name: 'Bursa', coords: [29.06, 40.19], region: 'Marmara', plot: true, dx: 9, dy: 6 },
    { name: 'Kocaeli', coords: [29.92, 40.77], region: 'Marmara' },
    { name: 'Izmir', coords: [27.14, 38.42], region: 'Aegean', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Manisa', coords: [27.43, 38.61], region: 'Aegean' },
    { name: 'Ankara', coords: [32.86, 39.93], region: 'Central Anatolia', plot: true, dx: 9, dy: -5 },
    { name: 'Konya', coords: [32.48, 37.87], region: 'Central Anatolia' },
    { name: 'Kayseri', coords: [35.49, 38.73], region: 'Central Anatolia', plot: true, dx: 9, dy: -4 },
    { name: 'Mersin', coords: [34.64, 36.8], region: 'Mediterranean' },
    { name: 'Adana', coords: [35.33, 37.0], region: 'Mediterranean', plot: true, dx: 9, dy: 6 },
    { name: 'Iskenderun', coords: [36.17, 36.58], region: 'Mediterranean', plot: true, dx: 9, dy: 8 },
    { name: 'Gaziantep', coords: [37.38, 37.07], region: 'South-eastern Anatolia', plot: true, dx: 9, dy: 4 },
    { name: 'Samsun', coords: [36.33, 41.29], region: 'Black Sea', plot: true, dx: 9, dy: -4 },
    { name: 'Trabzon', coords: [39.72, 41.0], region: 'Black Sea' },
  ],
  sectors: [
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for the Iskenderun and Karabük rolling and forming lines.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and batching-plant hydraulics — and the machinery builders who export them.' },
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Refinery, terminal and pipeline support at Ceyhan, Izmit and Aliağa.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for hydro, gas and geothermal plant.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery and vessel hydraulics for the Tuzla and Yalova yards.' },
    { slug: 'mining', name: 'Mining', description: 'Dust-rated, high-cycle components for lignite, chrome and cement plant.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Türkiye?', answer: 'No. Türkiye is supplied from our Dubai warehouse, by sea through Suez into Mersin, Ambarlı or Izmir.' },
    {
      question: 'Why buy from Dubai when Türkiye makes this equipment?',
      answer:
        'For standard hose and fittings, you should not — the domestic industry is excellent and closer. What we are asked for is the pattern that is not held locally: GOST couplings for a Central Asian contract, SS316L thread forms, API-monogrammed assemblies. That is a six-week factory order locally and stock for us.',
    },
    {
      question: 'Do we need CE marking?',
      answer:
        'For a hose assembly above the pressure-volume threshold in PED 2014/68/EU, yes, and the declaration travels with the goods. Below it the assembly falls under sound engineering practice and needs no CE mark. We state which side of the line each item sits on at quotation.',
    },
    { question: 'What is the TSE requirement?', answer: 'The Turkish Standards Institution operates conformity requirements over a defined list. Much industrial hose and fittings sits outside it; where a line is inside, the assessment is arranged before shipment.' },
    { question: 'Mersin, Ambarlı or Izmir?', answer: 'Mersin for the southern and south-eastern belt, Ambarlı or Gemlik for Marmara, Izmir for the Aegean. The road leg across Anatolia is long enough that the choice is worth making rather than defaulting.' },
    { question: 'What currency do you quote in?', answer: 'EUR. Most import contracts here are euro-denominated, and it is the currency our export desk settles European trade in.' },
    { question: 'Can you supply API-monogrammed equipment?', answer: 'Yes. API 6A wellhead, API 16A BOP, API 16C choke and kill and API 7K drilling hose, with NACE MR0175 material documentation where the contract requires it.' },
    { question: 'Can you supply GOST-pattern couplings?', answer: 'Yes, and it is one of the commoner reasons buyers here call us. We hold GOST-pattern couplings and adapters alongside the DIN, BSP, JIC and ORFS ranges, so a mixed contract ships from one order.' },
  ],
  compliance: {
    heading: 'CE where it applies, and the pattern nobody local holds',
    body:
      'Two things are worth being precise about on this lane, and neither is freight. The first is CE marking. A hydraulic hose assembly is a pressure accessory, and PED 2014/68/EU applies above a pressure-volume threshold; above it the assembly needs a declaration of conformity travelling with it, and below it the directive requires sound engineering practice and no mark at all. Suppliers who CE-mark everything and suppliers who mark nothing are both wrong, and we state which side each item falls on at quotation. The second is why a Turkish buyer would import a component their own industry makes well. The honest answer is that they usually would not — unless the specification calls for a pattern that is not stocked locally, which is where a GOST coupling, an SS316L thread form or an API-monogrammed assembly turns a six-week factory order into stock.',
    documents: [
      { ref: 'PED', name: 'Declaration of conformity, assemblies above threshold', issuer: 'Us, as the assembler', when: 'Before dispatch' },
      { ref: 'TSE', name: 'TSE conformity, where the line is regulated', issuer: 'Turkish Standards Institution', when: 'At quotation, per product' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'DECL', name: 'Customs import declaration', issuer: 'The importer, through Turkish Customs', when: 'Before arrival' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the order calls for them' },
    ],
  },
}

const NORWAY: MarketPage = {
  slug: 'norway',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → NO',
  dialCode: '+47',
  currency: 'EUR',
  localName: 'Norge',
  lede: 'Norway is the market on this list where "we carry the pattern your local supply does not" is most plainly true. Offshore work here is specification-driven to a degree almost nowhere else matches — NORSOK material requirements, sour-service documentation, traceability to heat number — and a component that meets the description but not the specification is scrap at the quayside. The lane itself is unremarkable: through Suez, up the Atlantic, into Stavanger or Bergen in about three weeks.',
  facts: [
    { label: 'Typical transit', value: 'Typically 24–30 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali through Suez and up the Atlantic to Stavanger for the offshore supply base · Oslo and Bergen for general cargo · Air freight into Stavanger or Oslo where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'CIF Stavanger · DAP to the buyer’s site or supply base · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'CE marking and the PED declaration where the assembly is above threshold · NORSOK material documentation where the contract calls for it · Certificate of Origin, Dubai Chamber attested · Customs declaration raised by the importer',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via Suez' },
    { label: 'Port of entry', value: 'Stavanger' },
    { label: 'Transit', value: '24–30 days' },
    { label: 'Quoted in', value: 'EUR' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Norway'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'STAVANGER · PORT', coords: [5.73, 58.97], legend: 'Port of entry', dx: -11, dy: 8, anchor: 'end' },
    routes: [
      { mode: 'SEA · SUEZ', primary: true, points: leg(MED_TO_ATLANTIC, [-9.5, 38.7], [-9.0, 45.0], [-4.0, 50.0], [2.0, 54.0], [5.73, 58.97]) },
      { mode: 'AIR', points: leg(EUROPE_AIR, [15.0, 50.0], [5.63, 58.88]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '24–30 days', route: 'Jebel Ali to Stavanger, via Suez', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '2–4 days', route: 'DXB to SVG or OSL, with a connection', useCase: 'When the line is down' },
    { name: 'Sea, LCL', transit: '30–40 days', route: 'Consolidated, via a North Sea hub', useCase: 'Small mixed orders' },
  ],
  orderSteps: {
    third:
      'The specification is confirmed line by line — NORSOK material grade, sour-service documentation, traceability — and the CE declaration is prepared where the assembly is above threshold.',
    fourth: 'Goods sail from Jebel Ali through Suez and up the Atlantic, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Stavanger', coords: [5.73, 58.97], region: 'Rogaland' },
    { name: 'Sandnes', coords: [5.73, 58.85], region: 'Rogaland', plot: true, dx: -9, dy: 8, anchor: 'end' },
    { name: 'Bergen', coords: [5.32, 60.39], region: 'Vestland', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Ågotnes', coords: [5.02, 60.4], region: 'Vestland' },
    { name: 'Mongstad', coords: [5.03, 60.81], region: 'Vestland' },
    { name: 'Haugesund', coords: [5.27, 59.41], region: 'Rogaland' },
    { name: 'Kårstø', coords: [5.5, 59.28], region: 'Rogaland' },
    { name: 'Oslo', coords: [10.75, 59.91], region: 'Oslo', plot: true, dx: 9, dy: 6 },
    { name: 'Drammen', coords: [10.2, 59.74], region: 'Buskerud' },
    { name: 'Kristiansand', coords: [7.99, 58.15], region: 'Agder', plot: true, dx: 9, dy: 8 },
    { name: 'Trondheim', coords: [10.4, 63.43], region: 'Trøndelag', plot: true, dx: 9, dy: -4 },
    { name: 'Kristiansund', coords: [7.73, 63.11], region: 'Møre og Romsdal', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Ålesund', coords: [6.15, 62.47], region: 'Møre og Romsdal' },
    { name: 'Bodø', coords: [14.4, 67.28], region: 'Nordland', plot: true, dx: 9, dy: 4 },
    { name: 'Hammerfest', coords: [23.68, 70.66], region: 'Finnmark', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Harstad', coords: [16.54, 68.8], region: 'Troms' },
  ],
  sectors: [
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'North Sea and Barents support out of Stavanger, Ågotnes and Hammerfest — NORSOK-specified material.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery, winch and mooring hydraulics for the offshore support and subsea fleet.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for the hydro cascade and offshore wind.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for smelter and forming lines.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and tunnelling hydraulics for road and rail works.' },
    { slug: 'mining', name: 'Mining', description: 'Dust-rated, high-cycle components for aggregate and mineral processing.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Norway?', answer: 'No. Norway is supplied from our Dubai warehouse, by sea through Suez and up the Atlantic into Stavanger, Bergen or Oslo.' },
    {
      question: 'Why buy from Dubai rather than a Norwegian distributor?',
      answer:
        'For a standard item on a short lead time, you would not. What brings buyers here to us is the specification: an SS316L thread form, an API-monogrammed assembly, a sour-service material grade with traceable documentation. Those are held here and are a factory order locally.',
    },
    {
      question: 'Can you supply to NORSOK requirements?',
      answer:
        'Where the contract names a NORSOK material standard, tell us the revision at quotation and we will say plainly whether the item carries it and what documentation comes with it. We will not ship against a specification we cannot evidence and let inspection find out at the base.',
    },
    { question: 'Do we need CE marking?', answer: 'For an assembly above the PED 2014/68/EU pressure-volume threshold, yes, and the declaration travels with the goods. Below it, sound engineering practice applies and there is no mark. We state which at quotation.' },
    { question: 'Can you deliver to the supply base?', answer: 'Yes, on DAP terms to the base gate at Stavanger, Ågotnes or Hammerfest. The leg from the port is short and it is priced, not estimated.' },
    { question: 'How far ahead should we order?', answer: 'Three to four weeks for the sea lane. This is a planned-consumables lane rather than a breakdown one — for a line that is down, air freight or a local distributor is the right answer and we will say so.' },
    { question: 'What currency do you quote in?', answer: 'EUR. Our export desk settles European trade in euros; we do not quote in kroner.' },
    { question: 'Can you supply sour-service material documentation?', answer: 'Yes. NACE MR0175 / ISO 15156 documentation with traceability to heat number where the contract requires it, confirmed at quotation rather than produced afterwards.' },
  ],
  compliance: {
    heading: 'Specification, evidenced — not described',
    body:
      'Norway is where this network’s usual argument inverts most completely. There is no conformity scheme to navigate that a European supplier does not also face, the lane is unremarkable, and any Norwegian distributor is closer than Dubai. What Norway has instead is the strictest specification culture on the list. Offshore contracts name NORSOK material standards, sour-service requirements under NACE MR0175, and traceability to heat number, and the failure mode is not a late delivery — it is a part that matches the description, fails the specification, and is rejected at the supply base. So the work on this lane happens at quotation: we confirm the standard and its revision, say what documentation travels with the item, and decline plainly where we cannot evidence a requirement rather than shipping and hoping the paperwork is not read.',
    documents: [
      { ref: 'PED', name: 'Declaration of conformity, assemblies above threshold', issuer: 'Us, as the assembler', when: 'Before dispatch' },
      { ref: 'NORSOK', name: 'Material documentation to the named standard and revision', issuer: 'Mill, traceable to heat number', when: 'At quotation, per product' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Before dispatch' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'DECL', name: 'Customs import declaration', issuer: 'The importer, through Norwegian Customs', when: 'Before arrival' },
    ],
  },
}

const TRINIDAD_AND_TOBAGO: MarketPage = {
  slug: 'trinidad-and-tobago',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → TT',
  dialCode: '+1 868',
  currency: 'USD',
  lede: 'Trinidad is the Caribbean market that reads like a West African one, and it is the same buyer profile: offshore gas, a petrochemical estate at Point Lisas, and a supply chain that runs on API monograms and sour-service documentation. Containers come through Suez and across the Atlantic in about five weeks. Trinidad is also the regional staging point — a good deal of what lands here goes on to Guyana and Suriname, which is worth saying at quotation because it changes the customs file.',
  facts: [
    { label: 'Typical transit', value: 'Typically 30–38 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali through Suez and across the Atlantic to Point Lisas for the industrial estate · Port of Spain for general cargo · Air freight into Piarco where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'CIF Point Lisas · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'Customs declaration raised by the importer · TTBS conformity where the line is regulated · Certificate of Origin, Dubai Chamber attested · Material and test certificates where the operator’s specification calls for them',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via Suez' },
    { label: 'Port of entry', value: 'Point Lisas' },
    { label: 'Transit', value: '30–38 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Trinidad and Tobago'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'POINT LISAS', coords: [-61.47, 10.4], legend: 'Port of entry', dx: -11, dy: 8, anchor: 'end' },
    routes: [
      { mode: 'SEA · SUEZ', primary: true, points: leg(MED_TO_ATLANTIC, [-14.0, 32.0], [-30.0, 22.0], [-50.0, 14.0], [-59.0, 11.0], [-61.47, 10.4]) },
      { mode: 'AIR', points: leg(EUROPE_AIR, [0.0, 45.0], [-40.0, 25.0], [-61.34, 10.6]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '30–38 days', route: 'Jebel Ali to Point Lisas, via Suez', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '4–7 days', route: 'DXB to POS, with connections', useCase: 'When the line is down' },
    { name: 'Sea, LCL', transit: '38–48 days', route: 'Consolidated, with transhipment', useCase: 'Small mixed orders' },
  ],
  orderSteps: {
    third:
      'The operator specification is confirmed line by line, and whether the consignment stays in Trinidad or stages onward is settled before the container is loaded, because the two are different customs files.',
    fourth: 'Goods sail from Jebel Ali through Suez and across the Atlantic, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Port of Spain', coords: [-61.52, 10.65], region: 'Trinidad', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Point Lisas', coords: [-61.47, 10.4], region: 'Trinidad' },
    { name: 'Couva', coords: [-61.46, 10.42], region: 'Trinidad' },
    { name: 'San Fernando', coords: [-61.47, 10.28], region: 'Trinidad', plot: true, dx: -9, dy: 8, anchor: 'end' },
    { name: 'Point Fortin', coords: [-61.68, 10.17], region: 'Trinidad', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'La Brea', coords: [-61.63, 10.24], region: 'Trinidad' },
    { name: 'Galeota Point', coords: [-60.98, 10.14], region: 'Trinidad', plot: true, dx: 9, dy: 8 },
    { name: 'Chaguaramas', coords: [-61.64, 10.68], region: 'Trinidad' },
    { name: 'Arima', coords: [-61.28, 10.64], region: 'Trinidad', plot: true, dx: 9, dy: -4 },
    { name: 'Chaguanas', coords: [-61.41, 10.52], region: 'Trinidad' },
    { name: 'Sangre Grande', coords: [-61.13, 10.59], region: 'Trinidad' },
    { name: 'Scarborough', coords: [-60.74, 11.18], region: 'Tobago', plot: true, dx: 9, dy: -4 },
  ],
  sectors: [
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Offshore gas and the Point Lisas petrochemical estate — wellhead, flow iron and choke-and-kill support.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery and vessel hydraulics for the offshore support fleet at Chaguaramas and Galeota.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for gas turbine generation.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for the Point Lisas iron and steel plant.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and batching-plant hydraulics for infrastructure and plant turnaround.' },
    { slug: 'mining', name: 'Mining', description: 'Dust-rated, high-cycle components for aggregate and asphalt plant.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Trinidad and Tobago?', answer: 'No. Trinidad is supplied from our Dubai warehouse, through Suez and across the Atlantic into Point Lisas or Port of Spain.' },
    {
      question: 'Why buy from Dubai rather than the US Gulf?',
      answer:
        'For anything urgent, Houston is closer and that is the honest answer. What we compete on is the planned order against a specification — API-monogrammed assemblies, sour-service material with traceable documentation, spiral hose and crimp fittings held as real stock rather than ordered against a turnaround date.',
    },
    { question: 'Point Lisas or Port of Spain?', answer: 'Point Lisas for the industrial estate and anything heading to the plants; Port of Spain for general cargo and the city. It is worth naming the delivery point rather than the island.' },
    { question: 'Can you stage cargo here for Guyana or Suriname?', answer: 'Yes, and a good deal of what lands here does exactly that. Say so at quotation, because a consignment declared for import and then re-exported is a more expensive route to the same place than one documented for onward movement from the start.' },
    { question: 'What certification do we need?', answer: 'TTBS operates conformity requirements over a defined list; much industrial hose and fittings falls outside it. What matters more here is the operator’s own specification, which we confirm at quotation.' },
    { question: 'Can you deliver to the Galeota base?', answer: 'Yes, on DAP terms to the base gate. The road leg down the east coast is priced, not estimated.' },
    { question: 'What currency do you quote in?', answer: 'USD. It is what the offshore and petrochemical supply contracts here are written in.' },
    { question: 'Can you supply API-monogrammed equipment?', answer: 'Yes. API 6A wellhead, API 16A BOP, API 16C choke and kill and API 7K drilling hose, with NACE MR0175 material documentation where the contract requires it.' },
  ],
  compliance: {
    heading: 'The same buyer as West Africa, on a different ocean',
    body:
      'Trinidad’s import file is short — a customs declaration against the invoice and packing list, TTBS conformity only where a line falls inside a defined regulated list, and an attested certificate of origin. What shapes a consignment here is the same thing that shapes one into Nigeria or Gabon: an offshore and petrochemical buyer working to API monograms, sour-service material requirements and traceable mill certificates, where a part that meets the description and misses the specification is rejected rather than merely late. The second thing worth settling early is destination. Trinidad is the regional staging point for Guyana and Suriname, and cargo intended to move on should be documented for that from the outset — importing it and then re-exporting is a materially more expensive way to reach the same base.',
    documents: [
      { ref: 'DECL', name: 'Customs import declaration', issuer: 'The importer, through the Customs and Excise Division', when: 'Before arrival' },
      { ref: 'TTBS', name: 'Conformity assessment, where the line is regulated', issuer: 'Trinidad and Tobago Bureau of Standards', when: 'At quotation, per product' },
      { ref: 'API', name: 'Monogram and licence documentation', issuer: 'The manufacturer', when: 'At quotation, per product' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the specification calls for them' },
    ],
  },
}

const PANAMA: MarketPage = {
  slug: 'panama',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → PA',
  dialCode: '+507',
  currency: 'USD',
  lede: 'Panama is a market and a mechanism, and the mechanism is the more useful half. The Colón Free Zone lets goods be landed, held and re-dispatched without entering Panamanian customs territory, which is why a great deal of Central American and northern South American stock is staged here rather than shipped piecemeal. For a buyer working on the canal, the terminals or the bunkering fleet, it is also a straightforward market with a light import file.',
  facts: [
    { label: 'Typical transit', value: 'Typically 32–40 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali through Suez and across the Atlantic to Colón · Balboa for the Pacific side · Air freight into Panama City where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'CIF Colón · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'Customs declaration raised by the importer · Free Zone documentation where the cargo is staging onward · Certificate of Origin, Dubai Chamber attested · Documents in Spanish',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via Suez' },
    { label: 'Port of entry', value: 'Colón' },
    { label: 'Transit', value: '32–40 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Panama'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'COLÓN · PORT', coords: [-79.9, 9.36], legend: 'Port of entry', dx: 11, dy: -8, anchor: 'start' },
    routes: [
      { mode: 'SEA · SUEZ', primary: true, points: leg(MED_TO_ATLANTIC, [-14.0, 32.0], [-35.0, 22.0], [-60.0, 14.0], [-72.0, 11.0], [-79.9, 9.36]) },
      { mode: 'AIR', points: leg(EUROPE_AIR, [0.0, 45.0], [-45.0, 22.0], [-79.38, 9.07]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '32–40 days', route: 'Jebel Ali to Colón, via Suez', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '4–7 days', route: 'DXB to PTY, with connections', useCase: 'When the line is down' },
    { name: 'Sea, LCL', transit: '40–50 days', route: 'Consolidated, with transhipment', useCase: 'Small mixed orders' },
  ],
  orderSteps: {
    third:
      'Whether the consignment is entering Panama or staging in the Free Zone is settled before it ships, because the two are different files and converting one into the other afterwards is expensive.',
    fourth: 'Goods sail from Jebel Ali through Suez and across the Atlantic, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Colón', coords: [-79.9, 9.36], region: 'Colón' },
    { name: 'Panama City', coords: [-79.52, 8.98], region: 'Panamá', plot: true, dx: 9, dy: 6 },
    { name: 'Balboa', coords: [-79.56, 8.95], region: 'Panamá' },
    { name: 'Cristóbal', coords: [-79.92, 9.35], region: 'Colón' },
    { name: 'Manzanillo', coords: [-79.83, 9.37], region: 'Colón', plot: true, dx: 9, dy: -4 },
    { name: 'Arraiján', coords: [-79.68, 8.95], region: 'Panamá Oeste' },
    { name: 'La Chorrera', coords: [-79.78, 8.88], region: 'Panamá Oeste', plot: true, dx: -9, dy: 8, anchor: 'end' },
    { name: 'Penonomé', coords: [-80.36, 8.52], region: 'Coclé', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Aguadulce', coords: [-80.55, 8.24], region: 'Coclé' },
    { name: 'Santiago', coords: [-80.98, 8.1], region: 'Veraguas', plot: true, dx: -9, dy: 4, anchor: 'end' },
    { name: 'David', coords: [-82.43, 8.43], region: 'Chiriquí', plot: true, dx: 9, dy: 4 },
    { name: 'Almirante', coords: [-82.4, 9.3], region: 'Bocas del Toro', plot: true, dx: 9, dy: -4 },
  ],
  sectors: [
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery, winch and terminal hydraulics for the canal, the container terminals and the bunkering fleet.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and batching-plant hydraulics for port, canal and infrastructure works.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for hydro and thermal generation.' },
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Terminal, bunkering and pipeline support on both coasts.' },
    { slug: 'mining', name: 'Mining', description: 'Copper and aggregate plant — dust-rated, high-cycle components.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'Cylinders and valves for fabrication and workshop equipment.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Panama?', answer: 'No. Panama is supplied from our Dubai warehouse, through Suez and across the Atlantic into Colón.' },
    {
      question: 'What is the Colón Free Zone and does it help us?',
      answer:
        'It lets goods be landed, stored and re-dispatched without entering Panamanian customs territory. If your cargo is staying in Panama it makes no difference. If you are staging stock for Central America or the northern South American coast, it is the reason to route through here at all.',
    },
    { question: 'Can you consolidate here for onward shipment?', answer: 'Yes, and for regional buyers it is often the right structure. Tell us at quotation, because the documentation differs from the outset — importing and then re-exporting is a materially more expensive way to reach the same place.' },
    { question: 'Colón or Balboa?', answer: 'Colón for Atlantic-side cargo and the Free Zone, Balboa for the Pacific side and the city. Both are a short move from the other, but the file is raised against one of them.' },
    { question: 'What certification do we need?', answer: 'There is no general pre-shipment conformity scheme for industrial hose and fittings. The file is the declaration, the invoice and packing list, the origin certificate, and Free Zone documentation where it applies.' },
    { question: 'Can you supply to the canal and terminal operators?', answer: 'Yes. Deck, winch and terminal hydraulics are a large part of what moves on this lane. Send the specification and the duty cycle and we will quote against it rather than against the part number alone.' },
    { question: 'What currency do you quote in?', answer: 'USD, which is also the currency in circulation in Panama.' },
    { question: 'What language do the documents need to be in?', answer: 'Spanish, with the description agreeing across the invoice, the packing list and the declaration.' },
  ],
  compliance: {
    heading: 'Decide entry or Free Zone before the vessel sails',
    body:
      'Panama’s own import regime is light: a customs declaration against the invoice and packing list in Spanish, an attested certificate of origin, and no general conformity scheme for industrial hose and fittings. The decision that actually matters is made before anything ships, and it is whether the consignment is entering Panama or staging in the Colón Free Zone. Goods held in the Zone have not entered customs territory and can be re-dispatched onward to Central America or the northern South American coast on their own documentation; goods imported and later re-exported have paid for a round trip through the customs system that they did not need. Converting one into the other after arrival is possible and expensive. We ask which at quotation and raise the file accordingly.',
    documents: [
      { ref: 'DECL', name: 'Customs import declaration', issuer: 'The importer, through Aduanas', when: 'Before arrival' },
      { ref: 'CFZ', name: 'Colón Free Zone documentation, where staging onward', issuer: 'The Zone operator', when: 'On arrival' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'PL', name: 'Packing list in Spanish, matching the declaration', issuer: 'Us, at dispatch', when: 'Before the vessel sails' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the order calls for them' },
    ],
  },
}


// ─────────────────────────────────────────────────────────────────────────────
// THE NORTH SEA GATEWAY — Netherlands, Belgium, Germany, Luxembourg
//
// One customs union, one clearance. A container discharged at Rotterdam is in
// free circulation across twenty-seven member states, so the port is a routing
// decision about the inland leg rather than a customs one. That is the shared
// framing; what differs market to market is the industry behind the gate and
// how far inland the goods actually go.
// ─────────────────────────────────────────────────────────────────────────────

const NETHERLANDS: MarketPage = {
  slug: 'netherlands',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → NL',
  dialCode: '+31',
  currency: 'EUR',
  localName: 'Nederland',
  lede: 'The Netherlands is the gate rather than the destination for a great deal of what we ship here. Rotterdam clears goods into free circulation across the whole customs union, and a consignment for a German or Austrian buyer very often lands here first. For Dutch industry itself the draw is narrower and worth stating: offshore and dredging work run on specifications — sour-service material, API monograms, SS316L thread forms — that a general distributor stocks slowly and we hold.',
  facts: [
    { label: 'Typical transit', value: 'Typically 22–28 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali through Suez and up the Atlantic to Rotterdam · Amsterdam and Vlissingen where the berth suits · Air freight into Schiphol where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'CIF Rotterdam · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'CE marking and the PED declaration where the assembly is above threshold · REACH position on the elastomer compounds · Certificate of Origin, Dubai Chamber attested · EU customs entry raised by the importer',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via Suez' },
    { label: 'Port of entry', value: 'Rotterdam' },
    { label: 'Transit', value: '22–28 days' },
    { label: 'Quoted in', value: 'EUR' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Netherlands'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'ROTTERDAM · PORT', coords: [4.13, 51.95], legend: 'Port of entry', dx: -11, dy: 10, anchor: 'end' },
    routes: [
      { mode: 'SEA · SUEZ', primary: true, points: leg(MED_TO_ATLANTIC, ...ATLANTIC_TO_NORTH_SEA.map((p) => [p[0], p[1]] as [number, number]), [4.13, 51.95]) },
      { mode: 'AIR', points: leg(EUROPE_AIR, [15.0, 48.0], [4.76, 52.31]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '22–28 days', route: 'Jebel Ali to Rotterdam, via Suez', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '2–4 days', route: 'DXB to AMS', useCase: 'When the line is down' },
    { name: 'Sea, LCL', transit: '28–36 days', route: 'Consolidated, via a European hub', useCase: 'Small mixed orders' },
  ],
  orderSteps: {
    third: 'The CE declaration is prepared where the assembly is above the PED threshold, and the REACH position on the compounds is stated rather than left to be asked for.',
    fourth: 'Goods sail from Jebel Ali through Suez to Rotterdam, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Rotterdam', coords: [4.48, 51.92], region: 'South Holland' },
    { name: 'Amsterdam', coords: [4.9, 52.37], region: 'North Holland', plot: true, dx: 9, dy: -4 },
    { name: 'Vlissingen', coords: [3.57, 51.44], region: 'Zeeland', plot: true, dx: -9, dy: 8, anchor: 'end' },
    { name: 'Terneuzen', coords: [3.83, 51.33], region: 'Zeeland' },
    { name: 'Moerdijk', coords: [4.61, 51.7], region: 'North Brabant' },
    { name: 'Dordrecht', coords: [4.68, 51.81], region: 'South Holland' },
    { name: 'Eindhoven', coords: [5.47, 51.44], region: 'North Brabant', plot: true, dx: 9, dy: 8 },
    { name: 'Utrecht', coords: [5.12, 52.09], region: 'Utrecht' },
    { name: 'Arnhem', coords: [5.9, 51.99], region: 'Gelderland', plot: true, dx: 9, dy: 4 },
    { name: 'Enschede', coords: [6.9, 52.22], region: 'Overijssel', plot: true, dx: 9, dy: -4 },
    { name: 'Groningen', coords: [6.57, 53.22], region: 'Groningen', plot: true, dx: 9, dy: -4 },
    { name: 'Delfzijl', coords: [6.92, 53.33], region: 'Groningen' },
    { name: 'Den Helder', coords: [4.76, 52.96], region: 'North Holland', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'IJmuiden', coords: [4.61, 52.46], region: 'North Holland' },
    { name: 'Velsen', coords: [4.66, 52.46], region: 'North Holland' },
    { name: 'Geleen', coords: [5.83, 50.97], region: 'Limburg', plot: true, dx: 9, dy: 8 },
  ],
  sectors: [
    { slug: 'marine', name: 'Marine & Offshore', description: 'Dredging, heavy-lift and offshore support — deck machinery, winch and cutter hydraulics.' },
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'North Sea support out of Den Helder, and the Rotterdam and Geleen petrochemical estates.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for the IJmuiden and Velsen lines.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and piling-rig hydraulics for civil and reclamation works.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for thermal plant and offshore wind maintenance.' },
    { slug: 'mining', name: 'Mining', description: 'Dust-rated, high-cycle components for aggregate, cement and bulk-terminal plant.' },
  ],
  faqs: [
    { question: 'Do you have a branch in the Netherlands?', answer: 'No. The Netherlands is supplied from our Dubai warehouse, by sea through Suez into Rotterdam.' },
    {
      question: 'Why buy from Dubai when Dutch distribution is excellent?',
      answer:
        'For a standard item on a short lead time you should not, and we will say so. What brings buyers here to us is the pattern that is not stocked locally — SS316L thread forms, GOST couplings, API-monogrammed assemblies, sour-service material with traceable documentation — which is a factory order locally and stock for us.',
    },
    {
      question: 'Do we need CE marking?',
      answer:
        'For a hose assembly above the pressure-volume threshold in PED 2014/68/EU, yes, and the declaration travels with the goods. Below it the directive requires sound engineering practice and no mark. We state which side each item falls on at quotation rather than marking everything to be safe.',
    },
    { question: 'What is your REACH position?', answer: 'We state the position on the elastomer compounds in the quotation rather than waiting to be asked. Where a compound carries a restriction relevant to your application we say so and offer the alternative.' },
    { question: 'Can you clear into the Netherlands for onward EU delivery?', answer: 'Yes — that is what a great deal of this lane is. Goods clear once at Rotterdam into free circulation and move inland under the union. Tell us the final destination and we will quote the inland leg rather than stopping at the quay.' },
    { question: 'Can you deliver to Den Helder?', answer: 'Yes, on DAP terms to the offshore supply base. The road leg from Rotterdam is short and it is priced, not estimated.' },
    { question: 'What currency do you quote in?', answer: 'EUR. Our export desk settles European trade in euros, and the Estimate, the invoice and the customs value all carry the same figure so there is no conversion to reconcile at your end.' },
    { question: 'Can you supply sour-service material documentation?', answer: 'Yes. NACE MR0175 / ISO 15156 documentation with traceability where the contract requires it, confirmed at quotation rather than produced afterwards.' },
  ],
  compliance: {
    heading: 'One clearance, then twenty-seven countries',
    body:
      'The single most useful fact about this lane is that clearance happens once. A container discharged at Rotterdam and entered into free circulation is in free circulation everywhere in the customs union, so a consignment for a buyer in Germany, Austria or Czechia does not clear again at a second border — the inland leg is domestic movement. That is why so much of what we ship into the Netherlands is not for the Netherlands, and why the useful question at quotation is the final delivery address rather than the port. On the product side two things travel with the goods: a declaration of conformity where the assembly sits above the PED 2014/68/EU pressure-volume threshold, and our position on the elastomer compounds under REACH. We state both rather than waiting to be asked, because a buyer who has to ask has already lost a week.',
    documents: [
      { ref: 'PED', name: 'Declaration of conformity, assemblies above threshold', issuer: 'Us, as the assembler', when: 'Before dispatch' },
      { ref: 'REACH', name: 'Compound position on the elastomers supplied', issuer: 'Us, at quotation', when: 'At quotation' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'EU-ENTRY', name: 'Customs entry into free circulation', issuer: 'The importer, through Dutch Customs', when: 'On arrival' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the order calls for them' },
    ],
  },
}

const GERMANY: MarketPage = {
  slug: 'germany',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → DE',
  dialCode: '+49',
  currency: 'EUR',
  localName: 'Deutschland',
  lede: 'Germany makes more hydraulic equipment than it imports, and any page pretending otherwise is not worth reading. What we are asked for here is narrow and consistent: the pattern a German plant needs for machinery it is exporting — GOST couplings for a Central Asian contract, API-monogrammed assemblies for an oilfield package, SS316L thread forms — held as stock rather than ordered from a factory queue. Hamburg or Rotterdam clears it, and the inland leg is domestic movement under the customs union.',
  facts: [
    { label: 'Typical transit', value: 'Typically 24–30 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali through Suez to Hamburg or Bremerhaven · Rotterdam and Antwerp where the inland leg is shorter · Air freight into Frankfurt where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'CIF Hamburg · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'CE marking and the PED declaration where the assembly is above threshold · REACH position on the elastomer compounds · Certificate of Origin, Dubai Chamber attested · EU customs entry raised by the importer',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via Suez' },
    { label: 'Port of entry', value: 'Hamburg' },
    { label: 'Transit', value: '24–30 days' },
    { label: 'Quoted in', value: 'EUR' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Germany'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'HAMBURG · PORT', coords: [9.97, 53.54], legend: 'Port of entry', dx: -11, dy: -8, anchor: 'end' },
    routes: [
      { mode: 'SEA · SUEZ', primary: true, points: leg(MED_TO_ATLANTIC, ...ATLANTIC_TO_NORTH_SEA.map((p) => [p[0], p[1]] as [number, number]), [4.5, 53.5], [8.2, 54.0], [9.97, 53.54]) },
      { mode: 'AIR', points: leg(EUROPE_AIR, [15.0, 47.0], [8.57, 50.05]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '24–30 days', route: 'Jebel Ali to Hamburg, via Suez', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '2–4 days', route: 'DXB to FRA', useCase: 'When the line is down' },
    { name: 'Sea via Rotterdam', transit: '22–28 days', route: 'Rotterdam, then road for the west and south', useCase: 'When the inland leg is shorter' },
  ],
  orderSteps: {
    third: 'The CE declaration is prepared where the assembly is above the PED threshold, and the pattern and thread form are confirmed against the drawing rather than the part description.',
    fourth: 'Goods sail from Jebel Ali through Suez, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Hamburg', coords: [9.99, 53.55], region: 'Hamburg' },
    { name: 'Bremerhaven', coords: [8.58, 53.54], region: 'Bremen', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Duisburg', coords: [6.76, 51.43], region: 'North Rhine-Westphalia', plot: true, dx: -9, dy: 4, anchor: 'end' },
    { name: 'Essen', coords: [7.01, 51.46], region: 'North Rhine-Westphalia' },
    { name: 'Cologne', coords: [6.96, 50.94], region: 'North Rhine-Westphalia' },
    { name: 'Frankfurt', coords: [8.68, 50.11], region: 'Hesse', plot: true, dx: 9, dy: 4 },
    { name: 'Mannheim', coords: [8.47, 49.49], region: 'Baden-Württemberg' },
    { name: 'Stuttgart', coords: [9.18, 48.78], region: 'Baden-Württemberg', plot: true, dx: -9, dy: 8, anchor: 'end' },
    { name: 'Munich', coords: [11.58, 48.14], region: 'Bavaria', plot: true, dx: 9, dy: 8 },
    { name: 'Nuremberg', coords: [11.08, 49.45], region: 'Bavaria' },
    { name: 'Leipzig', coords: [12.37, 51.34], region: 'Saxony', plot: true, dx: 9, dy: 4 },
    { name: 'Dresden', coords: [13.74, 51.05], region: 'Saxony' },
    { name: 'Berlin', coords: [13.4, 52.52], region: 'Berlin', plot: true, dx: 9, dy: -4 },
    { name: 'Hanover', coords: [9.73, 52.37], region: 'Lower Saxony' },
    { name: 'Wilhelmshaven', coords: [8.11, 53.53], region: 'Lower Saxony' },
    { name: 'Rostock', coords: [12.13, 54.09], region: 'Mecklenburg-Vorpommern', plot: true, dx: 9, dy: -4 },
  ],
  sectors: [
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for the Ruhr and Saxony rolling and forming lines.' },
    { slug: 'construction', name: 'Construction', description: 'Machinery builders exporting plant — the pattern the destination market requires, held as stock.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for thermal, hydro and wind plant.' },
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Refinery and terminal support, and oilfield packages built here for export.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery and vessel hydraulics for the Hamburg, Bremerhaven and Rostock yards.' },
    { slug: 'mining', name: 'Mining', description: 'Dust-rated, high-cycle components for lignite, aggregate and cement plant.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Germany?', answer: 'No. Germany is supplied from our Dubai warehouse, through Suez into Hamburg, Bremerhaven or Rotterdam.' },
    {
      question: 'Why would a German plant buy hydraulics from Dubai?',
      answer:
        'Usually it would not, and we would rather say that than pretend. The exception is consistent: a machine being built here for export to a market with a different standard — GOST couplings for Central Asia, API monograms for an oilfield package, SS316L thread forms — where the pattern is a factory order locally and stock for us.',
    },
    { question: 'Do we need CE marking?', answer: 'For a hose assembly above the pressure-volume threshold in PED 2014/68/EU, yes, and the declaration travels with the goods. Below it, sound engineering practice applies and there is no mark. We state which at quotation.' },
    { question: 'Hamburg or Rotterdam?', answer: 'Whichever gives the shorter inland leg. Clearance is the same either way — the goods enter free circulation once and move on domestically — so the port is chosen on the road distance to your plant, not on customs.' },
    { question: 'What is your REACH position?', answer: 'We state it on the elastomer compounds at quotation. Where a compound carries a restriction relevant to your application we say so and offer the alternative rather than shipping and leaving you to discover it.' },
    { question: 'Can you supply GOST-pattern couplings?', answer: 'Yes, alongside the DIN, BSP, JIC and ORFS ranges, so a machine destined for a GOST market can be plumbed from one order rather than two suppliers.' },
    { question: 'What currency do you quote in?', answer: 'EUR. Our export desk settles European trade in euros, and the Estimate, the invoice and the customs value all carry the same figure so there is no conversion to reconcile at your end.' },
    { question: 'Can you supply API-monogrammed equipment?', answer: 'Yes. API 6A wellhead, API 16A BOP, API 16C choke and kill and API 7K drilling hose, with NACE MR0175 material documentation where the contract requires it.' },
  ],
  compliance: {
    heading: 'The pattern for somewhere else',
    body:
      'It is worth being blunt about why this page exists. Germany manufactures hydraulic components to a standard nobody needs to import against, and for a plant that wants a DIN fitting tomorrow we are the wrong supplier by a wide margin. What we are actually asked for here is the pattern a German machine needs when it is being built for somewhere else: GOST couplings for a Central Asian contract, an API-monogrammed assembly for an oilfield package, SS316L thread forms for a chemical duty. Locally those are a factory order with a lead time measured in weeks; here they are stock. That is the whole proposition, and it is why the useful thing to send us is the drawing and the destination standard rather than a part number. On documentation, a declaration of conformity travels with any assembly above the PED 2014/68/EU threshold, and we state the REACH position on the compounds at quotation rather than waiting to be asked.',
    documents: [
      { ref: 'PED', name: 'Declaration of conformity, assemblies above threshold', issuer: 'Us, as the assembler', when: 'Before dispatch' },
      { ref: 'REACH', name: 'Compound position on the elastomers supplied', issuer: 'Us, at quotation', when: 'At quotation' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'EU-ENTRY', name: 'Customs entry into free circulation', issuer: 'The importer, at the port of entry', when: 'On arrival' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the order calls for them' },
    ],
  },
}


const BELGIUM: MarketPage = {
  slug: 'belgium',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → BE',
  dialCode: '+32',
  currency: 'EUR',
  localName: 'België · Belgique',
  lede: 'Antwerp is the second gate into the customs union and the one that suits the chemical belt behind it. For Belgian buyers the specification that comes up most often is material rather than pattern: PTFE and composite hose for aggressive duty, SS316L fittings, and compound documentation that has to satisfy a plant safety case rather than a purchasing form. The lane itself is three to four weeks and unremarkable, which is the point — the work is in the specification.',
  facts: [
    { label: 'Typical transit', value: 'Typically 22–28 days by sea from dispatch' },
    {
      label: 'Freight',
      value: 'Sea freight from Jebel Ali through Suez to Antwerp · Zeebrugge and Ghent where the berth suits · Air freight into Brussels where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'CIF Antwerp · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'CE marking and the PED declaration where the assembly is above threshold · REACH position on the elastomer and PTFE compounds · Certificate of Origin, Dubai Chamber attested · EU customs entry raised by the importer',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via Suez' },
    { label: 'Port of entry', value: 'Antwerp' },
    { label: 'Transit', value: '22–28 days' },
    { label: 'Quoted in', value: 'EUR' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Belgium'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'ANTWERP · PORT', coords: [4.34, 51.29], legend: 'Port of entry', dx: 11, dy: -8, anchor: 'start' },
    routes: [
      { mode: 'SEA · SUEZ', primary: true, points: leg(MED_TO_ATLANTIC, ...ATLANTIC_TO_NORTH_SEA.map((p) => [p[0], p[1]] as [number, number]), [3.2, 51.35], [4.34, 51.29]) },
      { mode: 'AIR', points: leg(EUROPE_AIR, [15.0, 48.0], [4.48, 50.9]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '22–28 days', route: 'Jebel Ali to Antwerp, via Suez', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '2–4 days', route: 'DXB to BRU', useCase: 'When the line is down' },
    { name: 'Sea, LCL', transit: '28–36 days', route: 'Consolidated, via a European hub', useCase: 'Small mixed orders' },
  ],
  orderSteps: {
    third: 'The compound documentation is assembled to the level a plant safety case needs, not a purchasing form, and the CE declaration is prepared where the assembly is above threshold.',
    fourth: 'Goods sail from Jebel Ali through Suez to Antwerp, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Antwerp', coords: [4.4, 51.22], region: 'Flanders' },
    { name: 'Brussels', coords: [4.35, 50.85], region: 'Brussels-Capital', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Ghent', coords: [3.72, 51.05], region: 'Flanders', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Zeebrugge', coords: [3.2, 51.33], region: 'Flanders', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Geel', coords: [4.99, 51.16], region: 'Flanders' },
    { name: 'Tessenderlo', coords: [5.08, 51.07], region: 'Flanders', plot: true, dx: 9, dy: -4 },
    { name: 'Genk', coords: [5.5, 50.97], region: 'Flanders' },
    { name: 'Liège', coords: [5.57, 50.63], region: 'Wallonia', plot: true, dx: 9, dy: 4 },
    { name: 'Charleroi', coords: [4.44, 50.41], region: 'Wallonia', plot: true, dx: 9, dy: 8 },
    { name: 'Mons', coords: [3.95, 50.45], region: 'Wallonia' },
    { name: 'Feluy', coords: [4.28, 50.53], region: 'Wallonia' },
    { name: 'Kallo', coords: [4.27, 51.25], region: 'Flanders' },
  ],
  sectors: [
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'The Antwerp chemical cluster — aggressive-duty hose, PTFE and composite assemblies with compound documentation.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery, winch and terminal hydraulics for the Antwerp, Ghent and Zeebrugge port fleet.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for the Liège and Genk lines.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and piling-rig hydraulics for civil and lock works.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for thermal and combined-cycle plant.' },
    { slug: 'mining', name: 'Mining', description: 'Dust-rated, high-cycle components for aggregate, cement and bulk-terminal plant.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Belgium?', answer: 'No. Belgium is supplied from our Dubai warehouse, by sea through Suez into Antwerp, Ghent or Zeebrugge.' },
    {
      question: 'Why buy from Dubai rather than locally?',
      answer:
        'For a standard fitting, you should not. What we are asked for is the aggressive-duty specification — PTFE and composite hose, SS316L fittings, compound documentation for a plant safety case — where the local answer is often a factory build and ours is stock.',
    },
    { question: 'Do we need CE marking?', answer: 'For a hose assembly above the pressure-volume threshold in PED 2014/68/EU, yes, and the declaration travels with the goods. Below it, sound engineering practice applies and there is no mark.' },
    {
      question: 'Can you supply compound documentation for a safety case?',
      answer:
        'Yes, and it is the commonest reason a Belgian chemical plant calls us. Tell us the medium, the temperature and the concentration at quotation and we will state the compound, its position under REACH, and where it is unsuitable — rather than supplying to the bore and pressure alone.',
    },
    { question: 'Antwerp, Ghent or Zeebrugge?', answer: 'Antwerp for almost everything, and it is the shortest inland leg for the chemical belt. The other two where a berth or a sailing suits better; clearance is identical either way.' },
    { question: 'Can you clear here for onward EU delivery?', answer: 'Yes. Goods enter free circulation once at Antwerp and move inland under the union, so a consignment for a French or German site does not clear twice. Give us the final address and we will quote the inland leg.' },
    { question: 'What currency do you quote in?', answer: 'EUR. Our export desk settles European trade in euros, and the Estimate, the invoice and the customs value all carry the same figure so there is no conversion to reconcile at your end.' },
    { question: 'Can you supply PTFE and composite hose?', answer: 'Yes, including flanged composite assemblies for chemical transfer and PTFE-lined hose for high-temperature aggressive duty, built and pressure-tested in Dubai.' },
  ],
  compliance: {
    heading: 'Compound documentation, not just bore and pressure',
    body:
      'Belgium’s customs position is the same as every other member state: goods clear once into free circulation at Antwerp and move inland domestically, so the port is an inland-leg decision rather than a customs one. What is specific here is the chemical cluster behind the port and what it asks of a hose supplier. A plant safety case does not accept a hose specified on bore, pressure and temperature — it wants the compound named, its resistance to the actual medium at the actual concentration stated, and its position under REACH documented. That is a different quotation from a normal one and it is the one worth asking us for: tell us the medium rather than the part number, and we will say where a compound is unsuitable rather than supplying to the dimensions and letting the plant find out. A declaration of conformity travels with any assembly above the PED threshold.',
    documents: [
      { ref: 'PED', name: 'Declaration of conformity, assemblies above threshold', issuer: 'Us, as the assembler', when: 'Before dispatch' },
      { ref: 'REACH', name: 'Compound position on the elastomers and PTFE supplied', issuer: 'Us, at quotation', when: 'At quotation' },
      { ref: 'COMPAT', name: 'Chemical compatibility statement for the named medium', issuer: 'Us, at quotation', when: 'At quotation, per duty' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'EU-ENTRY', name: 'Customs entry into free circulation', issuer: 'The importer, through Belgian Customs', when: 'On arrival' },
    ],
  },
}

const LUXEMBOURG: MarketPage = {
  slug: 'luxembourg',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → LU',
  dialCode: '+352',
  currency: 'EUR',
  localName: 'Lëtzebuerg',
  lede: 'Luxembourg is the smallest market on this network and the one where the page has least to claim. There is no port, no border formality worth describing — goods clear at Antwerp or Rotterdam and arrive by road as domestic movement — and the industrial base is narrow: steel, logistics equipment and a handful of specialist manufacturers. What brings a buyer here to Dubai is the same thing as in Germany, and no more: a pattern held as stock that would otherwise be a factory order.',
  facts: [
    { label: 'Typical transit', value: 'Typically 24–30 days from dispatch, sea and road combined' },
    {
      label: 'Freight',
      value: 'Sea freight from Jebel Ali through Suez to Antwerp or Rotterdam, then road · Air freight into Luxembourg or Frankfurt where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'DAP to the buyer’s site · CIF Antwerp · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'CE marking and the PED declaration where the assembly is above threshold · REACH position on the elastomer compounds · Certificate of Origin, Dubai Chamber attested · EU customs entry raised at the port',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea + road' },
    { label: 'Port of entry', value: 'Antwerp, then road' },
    { label: 'Transit', value: '24–30 days' },
    { label: 'Quoted in', value: 'EUR' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Luxembourg'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'ANTWERP · PORT', coords: [4.34, 51.29], legend: 'Port of entry', dx: -11, dy: -8, anchor: 'end' },
    routes: [
      { mode: 'SEA + ROAD', primary: true, points: leg(MED_TO_ATLANTIC, ...ATLANTIC_TO_NORTH_SEA.map((p) => [p[0], p[1]] as [number, number]), [3.2, 51.35], [4.34, 51.29], [5.0, 50.5], [6.13, 49.61]) },
      { mode: 'AIR', points: leg(EUROPE_AIR, [15.0, 48.0], [6.21, 49.63]) },
    ],
  },
  freight: [
    { name: 'Sea + road', transit: '24–30 days', route: 'Antwerp or Rotterdam, then road', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '2–4 days', route: 'DXB to LUX or FRA, then road', useCase: 'When the line is down' },
    { name: 'Sea, LCL', transit: '30–38 days', route: 'Consolidated, via a European hub', useCase: 'Small mixed orders' },
  ],
  orderSteps: {
    third: 'Clearance happens at the port rather than at a Luxembourg border, so the file is the EU entry and the road leg is domestic movement — priced with the order rather than added afterwards.',
    fourth: 'Goods sail to Antwerp or Rotterdam and come on by road, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Luxembourg City', coords: [6.13, 49.61], region: 'Luxembourg', plot: true, dx: 9, dy: -5 },
    { name: 'Esch-sur-Alzette', coords: [5.98, 49.5], region: 'Esch-sur-Alzette', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Differdange', coords: [5.89, 49.52], region: 'Esch-sur-Alzette' },
    { name: 'Dudelange', coords: [6.09, 49.48], region: 'Esch-sur-Alzette' },
    { name: 'Bettembourg', coords: [6.1, 49.52], region: 'Esch-sur-Alzette', plot: true, dx: 9, dy: 8 },
    { name: 'Rodange', coords: [5.84, 49.55], region: 'Esch-sur-Alzette' },
    { name: 'Belval', coords: [5.94, 49.5], region: 'Esch-sur-Alzette' },
    { name: 'Contern', coords: [6.23, 49.57], region: 'Luxembourg' },
    { name: 'Grevenmacher', coords: [6.44, 49.68], region: 'Grevenmacher', plot: true, dx: 9, dy: 4 },
    { name: 'Ettelbruck', coords: [6.1, 49.85], region: 'Diekirch', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Diekirch', coords: [6.16, 49.87], region: 'Diekirch' },
    { name: 'Wiltz', coords: [5.93, 49.97], region: 'Diekirch', plot: true, dx: -9, dy: -4, anchor: 'end' },
  ],
  sectors: [
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for the Belval and Differdange rolling lines.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and materials-handling hydraulics, including equipment built here for export.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for generation and grid plant.' },
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Terminal and fuel-handling support, and packages assembled here for export.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Winch and deck hydraulics for Moselle river and lifting equipment.' },
    { slug: 'mining', name: 'Mining', description: 'Dust-rated, high-cycle components for quarry and aggregate plant.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Luxembourg?', answer: 'No. Luxembourg is supplied from our Dubai warehouse, by sea to Antwerp or Rotterdam and then by road.' },
    {
      question: 'Is there any reason to buy from Dubai here?',
      answer:
        'Only one, and it is narrow: a pattern that is not stocked in the region — GOST couplings, SS316L thread forms, API-monogrammed assemblies — usually for equipment being built here for export. For anything standard, a Belgian or German distributor is closer, faster and the right answer.',
    },
    { question: 'Is there a border formality?', answer: 'No. Goods clear once at Antwerp or Rotterdam into free circulation and reach Luxembourg as domestic movement. There is no second clearance and nothing to arrange at the border.' },
    { question: 'Do we need CE marking?', answer: 'For a hose assembly above the pressure-volume threshold in PED 2014/68/EU, yes, and the declaration travels with the goods. Below it, sound engineering practice applies and there is no mark.' },
    { question: 'How is the road leg priced?', answer: 'With the order rather than after it. Antwerp to Luxembourg is a short domestic run and we quote it as part of a DAP price rather than stopping at the quay and leaving you to arrange it.' },
    { question: 'Can you supply GOST-pattern couplings?', answer: 'Yes, alongside the DIN, BSP, JIC and ORFS ranges, so a machine destined for a GOST market can be plumbed from one order.' },
    { question: 'What currency do you quote in?', answer: 'EUR. Our export desk settles European trade in euros, and the Estimate, the invoice and the customs value all carry the same figure so there is no conversion to reconcile at your end.' },
    { question: 'Is there a minimum order?', answer: 'No, but on a lane where the freight is a road leg from a port three weeks away, consolidating is usually worth more than speed. We will say when an item is better added to the next consignment.' },
  ],
  compliance: {
    heading: 'No port, no border, and a narrow reason to be here',
    body:
      'This is the shortest compliance story on the network because there is almost nothing to tell. Luxembourg is inside the customs union and landlocked within it, so goods clear once at Antwerp or Rotterdam and arrive as domestic movement — no second entry, no border formality, no transit document. The product documentation is the European set: a declaration of conformity for assemblies above the PED 2014/68/EU threshold, and our REACH position on the compounds. What is worth saying plainly instead is why a Luxembourg buyer would import from Dubai at all, and the honest answer is that mostly they would not. The exception is narrow and real: a pattern not stocked in the region, usually for equipment being built here for export to a market with a different standard. Outside that, a Belgian or German distributor is closer, faster and correct.',
    documents: [
      { ref: 'PED', name: 'Declaration of conformity, assemblies above threshold', issuer: 'Us, as the assembler', when: 'Before dispatch' },
      { ref: 'REACH', name: 'Compound position on the elastomers supplied', issuer: 'Us, at quotation', when: 'At quotation' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'EU-ENTRY', name: 'Customs entry into free circulation', issuer: 'The importer, at Antwerp or Rotterdam', when: 'On arrival' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the order calls for them' },
    ],
  },
}

export const MARKET_PAGE_RECORDS_3: readonly MarketPage[] = [
  TURKEY,
  NORWAY,
  TRINIDAD_AND_TOBAGO,
  PANAMA,
  NETHERLANDS,
  GERMANY,
  BELGIUM,
  LUXEMBOURG,
]
