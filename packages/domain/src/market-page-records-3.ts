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

/**
 * On round the Skaw into the Kattegat and the western Baltic.
 *
 * Everything north and east of here is seasonal to some degree, and Finland is
 * seasonal in a way that changes the quotation rather than the schedule — see
 * that record.
 */
const NORTH_SEA_TO_BALTIC = [
  ...ATLANTIC_TO_NORTH_SEA,
  [4.5, 53.8],
  [7.5, 55.6],
  [9.0, 57.7],
  [11.0, 57.5],
  [12.0, 56.2],
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
    // Mainland Norway only — the feature also carries Svalbard and Jan Mayen,
    // which sit far enough north to swallow the frame.
    mainland: [4.0, 57.5, 31.5, 71.5],
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
    // European Netherlands only — the feature also carries the Caribbean
    // municipalities of Bonaire, Sint Eustatius and Saba.
    mainland: [3.0, 50.5, 7.5, 53.8],
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


// ─────────────────────────────────────────────────────────────────────────────
// BRITISH ISLES — the one European market that diverged
//
// The UK left the customs union, so a consignment clears at Felixstowe or
// Southampton on its own entry and UKCA sits alongside CE. Ireland stayed in,
// which makes the pair genuinely different pages rather than two spellings of
// the same one — and makes the Irish Sea a customs border it was not before.
// ─────────────────────────────────────────────────────────────────────────────

const UNITED_KINGDOM: MarketPage = {
  slug: 'united-kingdom',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → GB',
  dialCode: '+44',
  currency: 'EUR',
  lede: 'The United Kingdom is the one European market that clears on its own entry rather than the union’s, and the conformity picture has two marks rather than one. Goods arrive at Felixstowe or Southampton in three to four weeks and enter on a UK declaration; a hose assembly above the pressure threshold needs a UKCA declaration for Great Britain, while CE still governs what moves into Northern Ireland. Aberdeen is the reason most of our cargo comes here at all — North Sea specification work, where the material documentation matters more than the lead time.',
  facts: [
    { label: 'Typical transit', value: 'Typically 24–30 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali through Suez to Felixstowe or Southampton · London Gateway where the inland leg is shorter · Aberdeen by road for the offshore supply base · Air freight into London where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'CIF Felixstowe · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'UKCA declaration for Great Britain, CE where the goods move into Northern Ireland · UK customs declaration raised by the importer · UK REACH position on the compounds · Certificate of Origin, Dubai Chamber attested',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via Suez' },
    { label: 'Port of entry', value: 'Felixstowe' },
    { label: 'Transit', value: '24–30 days' },
    { label: 'Quoted in', value: 'EUR' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['United Kingdom'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'FELIXSTOWE · PORT', coords: [1.32, 51.95], legend: 'Port of entry', dx: 11, dy: 10, anchor: 'start' },
    routes: [
      { mode: 'SEA · SUEZ', primary: true, points: leg(MED_TO_ATLANTIC, [-9.5, 38.7], [-9.5, 45.0], [-6.0, 49.0], [-1.0, 50.3], [1.32, 51.95]) },
      { mode: 'AIR', points: leg(EUROPE_AIR, [10.0, 48.0], [-0.46, 51.47]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '24–30 days', route: 'Jebel Ali to Felixstowe, via Suez', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '2–4 days', route: 'DXB to LHR', useCase: 'When the line is down' },
    { name: 'Sea, LCL', transit: '30–38 days', route: 'Consolidated, via a European hub', useCase: 'Small mixed orders' },
  ],
  orderSteps: {
    third:
      'The right mark is settled before anything ships — UKCA for Great Britain, CE where the goods are going to Northern Ireland — and the UK REACH position on the compounds is stated with it.',
    fourth: 'Goods sail from Jebel Ali through Suez, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Felixstowe', coords: [1.35, 51.96], region: 'England' },
    { name: 'London', coords: [-0.13, 51.51], region: 'England', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Southampton', coords: [-1.4, 50.9], region: 'England', plot: true, dx: -9, dy: 8, anchor: 'end' },
    { name: 'Birmingham', coords: [-1.9, 52.48], region: 'England', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Manchester', coords: [-2.24, 53.48], region: 'England' },
    { name: 'Sheffield', coords: [-1.47, 53.38], region: 'England' },
    { name: 'Leeds', coords: [-1.55, 53.8], region: 'England', plot: true, dx: 9, dy: -4 },
    { name: 'Hull', coords: [-0.34, 53.74], region: 'England' },
    { name: 'Teesside', coords: [-1.23, 54.58], region: 'England', plot: true, dx: 9, dy: 4 },
    { name: 'Newcastle', coords: [-1.61, 54.98], region: 'England' },
    { name: 'Aberdeen', coords: [-2.1, 57.15], region: 'Scotland', plot: true, dx: 9, dy: -4 },
    { name: 'Peterhead', coords: [-1.78, 57.51], region: 'Scotland' },
    { name: 'Glasgow', coords: [-4.25, 55.86], region: 'Scotland', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Grangemouth', coords: [-3.72, 56.02], region: 'Scotland' },
    { name: 'Cardiff', coords: [-3.18, 51.48], region: 'Wales', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Belfast', coords: [-5.93, 54.6], region: 'Northern Ireland', plot: true, dx: -9, dy: -4, anchor: 'end' },
  ],
  sectors: [
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'North Sea support out of Aberdeen and Peterhead, and the Grangemouth and Teesside process estates.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery, winch and subsea hydraulics for the offshore support fleet.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for thermal plant and offshore wind maintenance.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for rolling and forming lines.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and tunnelling hydraulics for civil works.' },
    { slug: 'mining', name: 'Mining', description: 'Dust-rated, high-cycle components for aggregate and cement plant.' },
  ],
  faqs: [
    { question: 'Do you have a branch in the United Kingdom?', answer: 'No. The UK is supplied from our Dubai warehouse, by sea through Suez into Felixstowe or Southampton.' },
    {
      question: 'Is it UKCA or CE that we need?',
      answer:
        'UKCA for goods placed on the market in Great Britain; CE for goods moving into Northern Ireland. A hose assembly above the pressure threshold needs the relevant declaration travelling with it, and we settle which before shipping rather than after — they are not interchangeable and a wrong mark is a rejected consignment.',
    },
    {
      question: 'Why buy from Dubai rather than a UK distributor?',
      answer:
        'For a standard item on a short lead time you should not. The reason our cargo comes here is Aberdeen: North Sea work specified to a material grade with traceable documentation, where the specification decides the order rather than the delivery date.',
    },
    { question: 'Does the UK clear separately from the EU now?', answer: 'Yes. A UK entry is its own declaration — goods do not arrive in free circulation from a European port. If a consignment is destined for both the UK and an EU site it is two files, and we say so at quotation rather than discovering it at the quay.' },
    { question: 'What is your UK REACH position?', answer: 'We state it on the elastomer compounds at quotation. UK REACH and EU REACH have diverged in places, so we give the UK position for UK-bound goods rather than assuming the European one carries across.' },
    { question: 'Can you deliver to Aberdeen?', answer: 'Yes, on DAP terms to the supply base. It is a long domestic road leg from Felixstowe and it is priced with the order, not estimated.' },
    { question: 'What currency do you quote in?', answer: 'EUR. Our export desk settles European trade in euros; we do not quote in sterling, and the Estimate, invoice and customs value all carry the same figure.' },
    { question: 'Can you supply sour-service material documentation?', answer: 'Yes. NACE MR0175 / ISO 15156 documentation with traceability where the contract requires it, confirmed at quotation rather than produced afterwards.' },
  ],
  compliance: {
    heading: 'Two marks, and they are not interchangeable',
    body:
      'The UK is the one European market on this network that clears on its own entry rather than the union’s, and that has two consequences worth stating precisely. The first is customs: goods arriving from a European port are not in free circulation here, so a UK declaration is made in its own right, and a consignment split between a British and a continental site is two files rather than one. The second is conformity. A hose assembly above the pressure threshold needs a UKCA declaration to be placed on the market in Great Britain, and a CE declaration where the goods are moving into Northern Ireland. They are not interchangeable, a wrong mark is a rejected consignment, and the answer depends on where the goods are going rather than who is buying them. We settle both before the vessel sails. UK REACH has also diverged from the EU regime in places, so we give the UK position on the compounds rather than assuming the European one carries across.',
    documents: [
      { ref: 'UKCA', name: 'Declaration of conformity for Great Britain', issuer: 'Us, as the assembler', when: 'Before dispatch' },
      { ref: 'CE', name: 'Declaration of conformity, Northern Ireland movements', issuer: 'Us, as the assembler', when: 'Before dispatch' },
      { ref: 'UK-REACH', name: 'Compound position under the UK regime', issuer: 'Us, at quotation', when: 'At quotation' },
      { ref: 'DECL', name: 'UK customs import declaration', issuer: 'The importer, through HMRC', when: 'Before arrival' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the order calls for them' },
    ],
  },
}

const IRELAND: MarketPage = {
  slug: 'ireland',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → IE',
  dialCode: '+353',
  currency: 'EUR',
  localName: 'Éire',
  lede: 'Ireland stayed in the customs union when its nearest neighbour left, and that single fact reorganised how goods reach it. The land bridge through Britain became a customs movement, so direct sailings to Dublin and Cork carry far more than they used to. For us the practical effect is simple: we route direct rather than through a British port, and a consignment clears once into free circulation on arrival. Pharmaceutical and medical-device plant is what most of the specification work here is for.',
  facts: [
    { label: 'Typical transit', value: 'Typically 26–32 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali through Suez direct to Dublin or Cork · Rotterdam and a direct feeder where the sailing suits · Air freight into Dublin where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'CIF Dublin · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'CE marking and the PED declaration where the assembly is above threshold · REACH position on the elastomer compounds · Certificate of Origin, Dubai Chamber attested · EU customs entry raised by the importer',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via Suez' },
    { label: 'Port of entry', value: 'Dublin' },
    { label: 'Transit', value: '26–32 days' },
    { label: 'Quoted in', value: 'EUR' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Ireland'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'DUBLIN · PORT', coords: [-6.21, 53.35], legend: 'Port of entry', dx: 11, dy: 8, anchor: 'start' },
    routes: [
      { mode: 'SEA · SUEZ', primary: true, points: leg(MED_TO_ATLANTIC, [-9.5, 38.7], [-9.5, 45.0], [-9.0, 50.0], [-7.5, 52.0], [-6.21, 53.35]) },
      { mode: 'AIR', points: leg(EUROPE_AIR, [10.0, 48.0], [-6.27, 53.43]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '26–32 days', route: 'Jebel Ali direct to Dublin or Cork', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '2–4 days', route: 'DXB to DUB', useCase: 'When the line is down' },
    { name: 'Sea, LCL', transit: '32–42 days', route: 'Consolidated via Rotterdam, then feeder', useCase: 'Small mixed orders' },
  ],
  orderSteps: {
    third: 'The routing is direct rather than through a British port, so the file is one EU entry rather than a transit through a third country and back.',
    fourth: 'Goods sail from Jebel Ali through Suez to Dublin or Cork, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Dublin', coords: [-6.26, 53.35], region: 'Leinster', plot: true, dx: 9, dy: -5 },
    { name: 'Cork', coords: [-8.47, 51.9], region: 'Munster', plot: true, dx: -9, dy: 8, anchor: 'end' },
    { name: 'Ringaskiddy', coords: [-8.31, 51.83], region: 'Munster' },
    { name: 'Limerick', coords: [-8.62, 52.66], region: 'Munster', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Shannon', coords: [-8.87, 52.71], region: 'Munster' },
    { name: 'Waterford', coords: [-7.11, 52.26], region: 'Munster', plot: true, dx: 9, dy: 8 },
    { name: 'Galway', coords: [-9.05, 53.27], region: 'Connacht', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Athlone', coords: [-7.94, 53.42], region: 'Leinster' },
    { name: 'Dundalk', coords: [-6.4, 54.0], region: 'Leinster', plot: true, dx: 9, dy: -4 },
    { name: 'Drogheda', coords: [-6.35, 53.72], region: 'Leinster' },
    { name: 'Sligo', coords: [-8.48, 54.27], region: 'Connacht', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Carlow', coords: [-6.93, 52.84], region: 'Leinster' },
  ],
  sectors: [
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for thermal, hydro and wind generation.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and batching-plant hydraulics for civil and data-centre works.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery and vessel hydraulics for the Dublin, Cork and fishing fleets.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'Cylinders and valves for fabrication and forming lines.' },
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Terminal, tank-farm and process support at Whitegate and the Shannon estuary.' },
    { slug: 'mining', name: 'Mining', description: 'Zinc, lead and aggregate plant — dust-rated, high-cycle components.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Ireland?', answer: 'No. Ireland is supplied from our Dubai warehouse, on a direct sailing through Suez into Dublin or Cork.' },
    {
      question: 'Do you route through Britain?',
      answer:
        'No, and that is deliberate. The land bridge became a customs movement through a third country when the UK left the union; a direct sailing keeps the consignment inside the union and clears once on arrival. It is a few days longer and materially simpler.',
    },
    { question: 'Do we need CE marking?', answer: 'For a hose assembly above the pressure-volume threshold in PED 2014/68/EU, yes, and the declaration travels with the goods. Below it, sound engineering practice applies and there is no mark.' },
    {
      question: 'Can you supply to pharmaceutical plant requirements?',
      answer:
        'Where the specification names a surface finish, a material grade or a compound, tell us at quotation and we will state what the item carries. We supply industrial hose and fittings; we do not certify a hose as suitable for a validated process, and we say so rather than implying otherwise.',
    },
    { question: 'Dublin or Cork?', answer: 'Dublin for the eastern half and the midlands, Cork for Munster and the Ringaskiddy plants. The inland leg is short either way but the port is chosen against the delivery town.' },
    { question: 'What is your REACH position?', answer: 'We state it on the elastomer compounds at quotation. Ireland follows EU REACH, so the European position applies here rather than the divergent UK one.' },
    { question: 'What currency do you quote in?', answer: 'EUR. Our export desk settles European trade in euros, and the Estimate, the invoice and the customs value all carry the same figure so there is no conversion to reconcile at your end.' },
    { question: 'Is there a minimum order?', answer: 'No, but the direct sailings are less frequent than the North Sea ones, so consolidating usually lands sooner than shipping each line as it is raised. We will say when that applies.' },
  ],
  compliance: {
    heading: 'Direct, because the land bridge became a border',
    body:
      'Ireland is inside the customs union and its nearest neighbour is not, which changed the logistics more than the paperwork. Cargo that used to cross Britain by road now makes a customs movement through a third country in each direction, so we route direct to Dublin or Cork instead: a few days longer, one entry into free circulation on arrival, and no transit file. The conformity set is the ordinary European one — a declaration of conformity for assemblies above the PED 2014/68/EU threshold, and our REACH position on the compounds under the EU regime rather than the divergent UK one. The other thing worth stating plainly is a limit: a good deal of Irish specification work sits in pharmaceutical and medical-device plant, and while we will state exactly what a material or compound carries, we do not certify a hose as suitable for a validated process. Being clear about that at quotation is more useful than a claim that has to be walked back.',
    documents: [
      { ref: 'PED', name: 'Declaration of conformity, assemblies above threshold', issuer: 'Us, as the assembler', when: 'Before dispatch' },
      { ref: 'REACH', name: 'Compound position under the EU regime', issuer: 'Us, at quotation', when: 'At quotation' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'EU-ENTRY', name: 'Customs entry into free circulation', issuer: 'The importer, through Irish Revenue', when: 'On arrival' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the order calls for them' },
    ],
  },
}


// ─────────────────────────────────────────────────────────────────────────────
// THE NORDICS — the Baltic gate, and the one market where winter is a term
//
// Denmark and Sweden are ordinary customs-union lanes reached round the Skaw.
// Finland is not: its ports ice over, winter navigation carries an ice class
// and a surcharge, and a January delivery is a different quotation from a June
// one. Iceland is outside the union entirely and reached by feeder.
// ─────────────────────────────────────────────────────────────────────────────

const DENMARK: MarketPage = {
  slug: 'denmark',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → DK',
  dialCode: '+45',
  currency: 'EUR',
  localName: 'Danmark',
  lede: 'Denmark is the gate to the Baltic and the centre of the wind supply chain, and the second of those is why most of our cargo comes here. Nacelle and pitch systems are built to a specification and a duty cycle rather than a catalogue number, and a hose that meets the bore and pressure but not the flex life fails in a place nobody wants to reach. Aarhus and Copenhagen are three to four weeks from Jebel Ali, and the goods clear once into the customs union on arrival.',
  facts: [
    { label: 'Typical transit', value: 'Typically 26–32 days by sea from dispatch' },
    {
      label: 'Freight',
      value: 'Sea freight from Jebel Ali through Suez and round the Skaw to Aarhus or Copenhagen · Esbjerg for the offshore and wind base · Air freight into Copenhagen where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'CIF Aarhus · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value: 'CE marking and the PED declaration where the assembly is above threshold · REACH position on the elastomer compounds · Certificate of Origin, Dubai Chamber attested · EU customs entry raised by the importer',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via Suez' },
    { label: 'Port of entry', value: 'Aarhus' },
    { label: 'Transit', value: '26–32 days' },
    { label: 'Quoted in', value: 'EUR' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Denmark'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'AARHUS · PORT', coords: [10.22, 56.15], legend: 'Port of entry', dx: 11, dy: -8, anchor: 'start' },
    routes: [
      { mode: 'SEA · SUEZ', primary: true, points: leg(NORTH_SEA_TO_BALTIC, [10.8, 56.6], [10.22, 56.15]) },
      { mode: 'AIR', points: leg(EUROPE_AIR, [15.0, 50.0], [12.65, 55.62]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '26–32 days', route: 'Jebel Ali to Aarhus, via Suez', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '2–4 days', route: 'DXB to CPH', useCase: 'When the line is down' },
    { name: 'Sea, LCL', transit: '32–40 days', route: 'Consolidated via Rotterdam, then feeder', useCase: 'Small mixed orders' },
  ],
  orderSteps: {
    third: 'The duty cycle is confirmed alongside the dimensions — flex life, bend radius, temperature range — and the CE declaration is prepared where the assembly is above threshold.',
    fourth: 'Goods sail from Jebel Ali through Suez and round the Skaw, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Aarhus', coords: [10.2, 56.16], region: 'Central Jutland' },
    { name: 'Copenhagen', coords: [12.57, 55.68], region: 'Capital Region', plot: true, dx: 9, dy: 6 },
    { name: 'Esbjerg', coords: [8.45, 55.47], region: 'Southern Denmark', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Fredericia', coords: [9.75, 55.56], region: 'Southern Denmark' },
    { name: 'Kolding', coords: [9.48, 55.49], region: 'Southern Denmark' },
    { name: 'Odense', coords: [10.39, 55.4], region: 'Southern Denmark', plot: true, dx: 9, dy: 8 },
    { name: 'Aalborg', coords: [9.92, 57.05], region: 'North Jutland', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Hirtshals', coords: [9.96, 57.59], region: 'North Jutland' },
    { name: 'Randers', coords: [10.04, 56.46], region: 'Central Jutland' },
    { name: 'Herning', coords: [8.98, 56.14], region: 'Central Jutland', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Ringkøbing', coords: [8.24, 56.09], region: 'Central Jutland' },
    { name: 'Kalundborg', coords: [11.09, 55.68], region: 'Zealand', plot: true, dx: 9, dy: -4 },
  ],
  sectors: [
    { slug: 'power', name: 'Power & Energy', description: 'Wind nacelle, pitch and yaw hydraulics — specified on duty cycle and flex life rather than a catalogue number.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery, winch and installation-vessel hydraulics out of Esbjerg and the Baltic yards.' },
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'North Sea support out of Esbjerg, and the Kalundborg and Fredericia process estates.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and piling-rig hydraulics for civil and foundation works.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'Cylinders and valves for forming and fabrication lines.' },
    { slug: 'mining', name: 'Mining', description: 'Dust-rated, high-cycle components for aggregate and cement plant.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Denmark?', answer: 'No. Denmark is supplied from our Dubai warehouse, by sea through Suez and round the Skaw into Aarhus or Copenhagen.' },
    {
      question: 'Why buy from Dubai rather than locally?',
      answer:
        'For a standard fitting, you should not. What we are asked for is the pattern or the material a local distributor holds slowly — SS316L thread forms, API-monogrammed assemblies, sour-service documentation — usually for equipment being built here for export.',
    },
    {
      question: 'Can you specify for wind duty?',
      answer:
        'Tell us the duty cycle rather than the part number — flex life, minimum bend radius, temperature range, whether it sits in a nacelle or a tower. A hose that meets the bore and pressure and fails the flex life is a service visit a hundred metres up, and that is the specification worth getting right at quotation.',
    },
    { question: 'Do we need CE marking?', answer: 'For a hose assembly above the pressure-volume threshold in PED 2014/68/EU, yes, and the declaration travels with the goods. Below it, sound engineering practice applies and there is no mark.' },
    { question: 'Can you deliver to Esbjerg?', answer: 'Yes, on DAP terms to the offshore or wind base. The road leg from Aarhus is short and it is priced with the order, not estimated.' },
    { question: 'Aarhus or Copenhagen?', answer: 'Aarhus for Jutland and most industry, Copenhagen for Zealand and the east. Clearance is identical, so the port is chosen on the inland leg.' },
    { question: 'What currency do you quote in?', answer: 'EUR. Our export desk settles European trade in euros; we do not quote in kroner, and the Estimate, invoice and customs value all carry the same figure.' },
    { question: 'What is your REACH position?', answer: 'We state it on the elastomer compounds at quotation, including where a compound carries a restriction relevant to your application.' },
  ],
  compliance: {
    heading: 'Duty cycle, not catalogue number',
    body:
      'Denmark’s customs position is the ordinary European one — clearance once into free circulation at Aarhus or Copenhagen, a declaration of conformity for assemblies above the PED 2014/68/EU threshold, and our REACH position on the compounds. What is specific here is what the wind supply chain asks of a hose. A nacelle assembly is specified on flex life, minimum bend radius and temperature range as much as on bore and pressure, and the failure mode is not a leak on a workshop floor — it is a service visit a hundred metres above the ground, or offshore. So the useful thing to send us is the duty rather than the part number, and the useful thing for us to say back is where a standard compound will not survive the cycle. That is a slower quotation and a much better one.',
    documents: [
      { ref: 'PED', name: 'Declaration of conformity, assemblies above threshold', issuer: 'Us, as the assembler', when: 'Before dispatch' },
      { ref: 'REACH', name: 'Compound position on the elastomers supplied', issuer: 'Us, at quotation', when: 'At quotation' },
      { ref: 'DUTY', name: 'Flex life and bend radius statement, where specified', issuer: 'Us, at quotation', when: 'At quotation, per duty' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'EU-ENTRY', name: 'Customs entry into free circulation', issuer: 'The importer, through Danish Customs', when: 'On arrival' },
    ],
  },
}

const SWEDEN: MarketPage = {
  slug: 'sweden',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → SE',
  dialCode: '+46',
  currency: 'EUR',
  localName: 'Sverige',
  lede: 'Sweden is a long country and the inland leg is the part worth planning. Gothenburg takes the sailing and serves the south comfortably; Kiruna and the northern mines are another fourteen hundred kilometres beyond Stockholm, in a climate where a standard elastomer stiffens badly. The mining specification is the reason to call us — low-temperature compounds, abrasion-resistant covers, and material documentation that survives an audit rather than merely accompanying the box.',
  facts: [
    { label: 'Typical transit', value: 'Typically 28–34 days by sea from dispatch' },
    {
      label: 'Freight',
      value: 'Sea freight from Jebel Ali through Suez and round the Skaw to Gothenburg · Stockholm and Gävle for the east coast · Luleå for the northern mining belt in season · Air freight into Stockholm where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'CIF Gothenburg · DAP to the buyer’s site or mine gate · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value: 'CE marking and the PED declaration where the assembly is above threshold · REACH position on the elastomer compounds · Certificate of Origin, Dubai Chamber attested · EU customs entry raised by the importer',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via Suez' },
    { label: 'Port of entry', value: 'Gothenburg' },
    { label: 'Transit', value: '28–34 days' },
    { label: 'Quoted in', value: 'EUR' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Sweden'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'GOTHENBURG · PORT', coords: [11.91, 57.71], legend: 'Port of entry', dx: -11, dy: 8, anchor: 'end' },
    routes: [
      { mode: 'SEA · SUEZ', primary: true, points: leg(NORTH_SEA_TO_BALTIC, [11.4, 57.4], [11.91, 57.71]) },
      { mode: 'AIR', points: leg(EUROPE_AIR, [16.0, 50.0], [17.92, 59.65]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '28–34 days', route: 'Jebel Ali to Gothenburg, via Suez', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '2–4 days', route: 'DXB to ARN', useCase: 'When the line is down' },
    { name: 'Sea + road, northern', transit: '34–42 days', route: 'Gothenburg, then road to the mining belt', useCase: 'Kiruna and Gällivare' },
  ],
  orderSteps: {
    third: 'The low-temperature specification is confirmed where the goods are going north, and the CE declaration is prepared where the assembly is above threshold.',
    fourth: 'Goods sail from Jebel Ali through Suez to Gothenburg, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Gothenburg', coords: [11.97, 57.71], region: 'Västra Götaland' },
    { name: 'Stockholm', coords: [18.07, 59.33], region: 'Stockholm', plot: true, dx: 9, dy: 6 },
    { name: 'Malmö', coords: [13.0, 55.6], region: 'Skåne', plot: true, dx: 9, dy: 8 },
    { name: 'Helsingborg', coords: [12.69, 56.05], region: 'Skåne' },
    { name: 'Norrköping', coords: [16.19, 58.59], region: 'Östergötland' },
    { name: 'Linköping', coords: [15.62, 58.41], region: 'Östergötland', plot: true, dx: 9, dy: 8 },
    { name: 'Västerås', coords: [16.55, 59.61], region: 'Västmanland' },
    { name: 'Gävle', coords: [17.15, 60.67], region: 'Gävleborg', plot: true, dx: 9, dy: -4 },
    { name: 'Sandviken', coords: [16.78, 60.62], region: 'Gävleborg' },
    { name: 'Borlänge', coords: [15.44, 60.48], region: 'Dalarna' },
    { name: 'Sundsvall', coords: [17.31, 62.39], region: 'Västernorrland', plot: true, dx: 9, dy: 4 },
    { name: 'Umeå', coords: [20.26, 63.83], region: 'Västerbotten' },
    { name: 'Luleå', coords: [22.15, 65.58], region: 'Norrbotten', plot: true, dx: 9, dy: 4 },
    { name: 'Kiruna', coords: [20.22, 67.86], region: 'Norrbotten', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Gällivare', coords: [20.66, 67.14], region: 'Norrbotten' },
    { name: 'Oxelösund', coords: [17.1, 58.67], region: 'Södermanland' },
  ],
  sectors: [
    { slug: 'mining', name: 'Mining', description: 'Iron ore at Kiruna and Gällivare — low-temperature compounds, abrasion covers and auditable material documentation.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for the Oxelösund, Borlänge and Sandviken lines.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and tunnelling hydraulics — and the machinery builders who export them.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for hydro and thermal plant.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery and vessel hydraulics for the Baltic and west-coast fleets.' },
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Refinery and terminal support on the west coast.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Sweden?', answer: 'No. Sweden is supplied from our Dubai warehouse, by sea through Suez and round the Skaw into Gothenburg.' },
    {
      question: 'Does the cold change what you supply?',
      answer:
        'Yes, and it is worth saying at quotation rather than after the first winter. A standard nitrile stiffens well before the temperatures the northern mining belt sees, so we specify a low-temperature compound for anything going north and say plainly when a catalogue item is the wrong choice.',
    },
    { question: 'Can you deliver to Kiruna?', answer: 'Yes, on DAP terms to the mine gate. It is a long domestic road leg from Gothenburg and it is priced with the order rather than estimated.' },
    { question: 'Why buy from Dubai rather than locally?', answer: 'For a standard item you should not. What brings buyers here is the pattern or the material grade held as stock — SS316L thread forms, abrasion-resistant covers, sour-service documentation — that is otherwise a factory order.' },
    { question: 'Do we need CE marking?', answer: 'For a hose assembly above the pressure-volume threshold in PED 2014/68/EU, yes, and the declaration travels with the goods. Below it, sound engineering practice applies and there is no mark.' },
    { question: 'Gothenburg or Stockholm?', answer: 'Gothenburg for almost everything — it takes the direct sailing and serves the west and south. Stockholm or Gävle where the delivery sits on the east coast and the road leg would otherwise cross the country.' },
    { question: 'What currency do you quote in?', answer: 'EUR. Our export desk settles European trade in euros; we do not quote in kronor, and the Estimate, invoice and customs value all carry the same figure.' },
    { question: 'Can you supply auditable material documentation?', answer: 'Yes. Mill certificates traceable to heat number where the contract requires it, confirmed at quotation rather than produced after an audit asks for them.' },
  ],
  compliance: {
    heading: 'The cold is a specification, and the north is a road leg',
    body:
      'Two things separate a Swedish consignment from any other European one, and neither is customs — clearance is the ordinary single entry into free circulation at Gothenburg. The first is temperature. A standard nitrile compound stiffens well above the temperatures the northern mining belt works in, and a hose chosen on bore and pressure alone will be the wrong hose by December. We specify a low-temperature compound for anything going north and say plainly when a catalogue item is unsuitable, which is a more useful answer than supplying what was asked for. The second is distance. Kiruna is most of a country beyond the port, so the inland leg is a real cost and it is priced with the order rather than left to be arranged. A declaration of conformity travels with any assembly above the PED threshold, and mill certificates are traceable to heat number where the contract calls for it.',
    documents: [
      { ref: 'PED', name: 'Declaration of conformity, assemblies above threshold', issuer: 'Us, as the assembler', when: 'Before dispatch' },
      { ref: 'TEMP', name: 'Low-temperature compound statement, for northern delivery', issuer: 'Us, at quotation', when: 'At quotation, per duty' },
      { ref: 'REACH', name: 'Compound position on the elastomers supplied', issuer: 'Us, at quotation', when: 'At quotation' },
      { ref: 'MTC', name: 'Mill certificates traceable to heat number', issuer: 'Mill, or our test bench', when: 'Where the contract requires them' },
      { ref: 'EU-ENTRY', name: 'Customs entry into free circulation', issuer: 'The importer, through Swedish Customs', when: 'On arrival' },
    ],
  },
}


const FINLAND: MarketPage = {
  slug: 'finland',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → FI',
  dialCode: '+358',
  currency: 'EUR',
  localName: 'Suomi',
  lede: 'Finland is the one market on this network where the season is part of the quotation rather than a caveat under it. The Gulf of Bothnia ices over, winter navigation requires an ice-classed vessel and carries a surcharge, and a January arrival at Oulu is a different price and a different schedule from a June one at Helsinki. We say which season a quotation assumes. The other half of the page is temperature at the other end: a compound chosen for a Gulf summer is the wrong compound at minus thirty.',
  facts: [
    { label: 'Typical transit', value: 'Typically 30–38 days by sea from dispatch, longer in the ice season' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali through Suez and the Baltic to Helsinki or Kotka · Rauma and Oulu for the west and north, subject to ice class in winter · Air freight into Helsinki where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'CIF Helsinki · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'CE marking and the PED declaration where the assembly is above threshold · REACH position on the elastomer compounds · Certificate of Origin, Dubai Chamber attested · EU customs entry raised by the importer',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via Suez' },
    { label: 'Port of entry', value: 'Helsinki' },
    { label: 'Transit', value: '30–38 days' },
    { label: 'Quoted in', value: 'EUR' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Finland'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'HELSINKI · PORT', coords: [24.96, 60.16], legend: 'Port of entry', dx: -11, dy: 10, anchor: 'end' },
    routes: [
      { mode: 'SEA · SUEZ', primary: true, points: leg(NORTH_SEA_TO_BALTIC, [12.7, 55.7], [14.5, 55.3], [19.0, 57.0], [22.0, 59.4], [24.96, 60.16]) },
      { mode: 'AIR', points: leg(EUROPE_AIR, [20.0, 52.0], [24.97, 60.32]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '30–38 days', route: 'Jebel Ali to Helsinki, via Suez and the Baltic', useCase: 'Default outside the ice season' },
    { name: 'Air freight', transit: '2–4 days', route: 'DXB to HEL', useCase: 'When the line is down' },
    { name: 'Sea, ice season', transit: '36–48 days', route: 'Ice-classed vessel, northern ports', useCase: 'December to April' },
  ],
  orderSteps: {
    third:
      'The season is stated on the quotation — whether it assumes open water or ice-classed navigation — and the compound is specified for the working temperature rather than the catalogue default.',
    fourth: 'Goods sail from Jebel Ali through Suez and the Baltic, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Helsinki', coords: [24.94, 60.17], region: 'Uusimaa' },
    { name: 'Espoo', coords: [24.66, 60.21], region: 'Uusimaa', plot: true, dx: -9, dy: 8, anchor: 'end' },
    { name: 'Kotka', coords: [26.95, 60.47], region: 'Kymenlaakso', plot: true, dx: 9, dy: 8 },
    { name: 'Hamina', coords: [27.2, 60.57], region: 'Kymenlaakso' },
    { name: 'Turku', coords: [22.27, 60.45], region: 'Southwest Finland', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Rauma', coords: [21.51, 61.13], region: 'Satakunta', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Pori', coords: [21.79, 61.49], region: 'Satakunta' },
    { name: 'Tampere', coords: [23.76, 61.5], region: 'Pirkanmaa', plot: true, dx: 9, dy: 4 },
    { name: 'Lahti', coords: [25.66, 60.98], region: 'Päijät-Häme' },
    { name: 'Jyväskylä', coords: [25.75, 62.24], region: 'Central Finland', plot: true, dx: 9, dy: -4 },
    { name: 'Kuopio', coords: [27.68, 62.89], region: 'North Savo' },
    { name: 'Vaasa', coords: [21.62, 63.1], region: 'Ostrobothnia', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Kokkola', coords: [23.13, 63.84], region: 'Central Ostrobothnia' },
    { name: 'Oulu', coords: [25.47, 65.01], region: 'North Ostrobothnia', plot: true, dx: 9, dy: 4 },
    { name: 'Kemi', coords: [24.56, 65.74], region: 'Lapland' },
    { name: 'Kittilä', coords: [24.9, 67.65], region: 'Lapland', plot: true, dx: 9, dy: -4 },
  ],
  sectors: [
    { slug: 'mining', name: 'Mining', description: 'Nickel, gold and chromium in Lapland — low-temperature compounds and abrasion covers, specified for winter working.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for the Tornio and Raahe lines.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and tunnelling hydraulics — and the forestry and mining machinery built here for export.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for hydro, thermal and nuclear plant.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery and icebreaker hydraulics for the Baltic fleet and the Turku and Rauma yards.' },
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Refinery and terminal support at Porvoo and Naantali.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Finland?', answer: 'No. Finland is supplied from our Dubai warehouse, by sea through Suez and the Baltic into Helsinki or Kotka.' },
    {
      question: 'Does winter really change the shipment?',
      answer:
        'Yes, and it is the reason this page is written differently from the others. Between roughly December and April the northern ports need ice-classed navigation, which adds cost and time. A quotation states which season it assumes; one raised in October for a February delivery is not the same quotation.',
    },
    {
      question: 'Does the cold change what you supply?',
      answer:
        'It should. A compound chosen for a Gulf summer stiffens badly at minus thirty and a hose specified on bore and pressure alone will be wrong by January. Tell us the working temperature and we will specify for it, or say plainly that the catalogue item is unsuitable.',
    },
    { question: 'Can you deliver to Lapland?', answer: 'Yes, on DAP terms to the mine or site gate. The road leg north of Oulu is long and seasonal, and it is quoted rather than estimated.' },
    { question: 'Helsinki, Kotka or Rauma?', answer: 'Helsinki or Kotka for most cargo and the southern industry, Rauma or Oulu where the delivery sits on the west coast or the north. In winter the choice narrows, which is another reason to name the delivery town early.' },
    { question: 'Do we need CE marking?', answer: 'For a hose assembly above the pressure-volume threshold in PED 2014/68/EU, yes, and the declaration travels with the goods. Below it, sound engineering practice applies and there is no mark.' },
    { question: 'What currency do you quote in?', answer: 'EUR. Finland is in the eurozone, so the Estimate, the invoice and the customs value all carry the same figure with nothing to convert.' },
    { question: 'Is air freight worth it here?', answer: 'For a line that is down in the ice season, more often than elsewhere — the gap between two to four days and six weeks is at its widest here. For planned work, ordering against the season is the cheaper answer.' },
  ],
  compliance: {
    heading: 'The season is part of the price',
    body:
      'Every other page on this network treats freight as a band and paperwork as the variable. Finland reverses it twice over. Between roughly December and April the Gulf of Bothnia ices over, the northern ports need ice-classed navigation, and a winter arrival costs more and takes longer than a summer one on the same route — so a quotation here states which season it assumes rather than quoting a single band that is wrong for half the year. The second reversal is at the other end of the lane. A compound specified for a Gulf summer is the wrong compound at minus thirty; it stiffens, the bend radius effectively grows, and a hose that passed inspection in September fails in January. We specify to the working temperature and say plainly where a catalogue item is unsuitable. Customs, by comparison, is unremarkable: one entry into free circulation, a PED declaration above threshold, and the REACH position on the compounds.',
    documents: [
      { ref: 'SEASON', name: 'Season assumed by the quotation — open water or ice class', issuer: 'Us, at quotation', when: 'At quotation' },
      { ref: 'TEMP', name: 'Low-temperature compound statement for the working range', issuer: 'Us, at quotation', when: 'At quotation, per duty' },
      { ref: 'PED', name: 'Declaration of conformity, assemblies above threshold', issuer: 'Us, as the assembler', when: 'Before dispatch' },
      { ref: 'REACH', name: 'Compound position on the elastomers supplied', issuer: 'Us, at quotation', when: 'At quotation' },
      { ref: 'EU-ENTRY', name: 'Customs entry into free circulation', issuer: 'The importer, through Finnish Customs', when: 'On arrival' },
    ],
  },
}

const ICELAND: MarketPage = {
  slug: 'iceland',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → IS',
  dialCode: '+354',
  currency: 'EUR',
  localName: 'Ísland',
  lede: 'Iceland is the most isolated market on this network and the smallest in the North Atlantic. Nothing sails here directly from the Gulf; cargo transhipes at Rotterdam or Hamburg onto a weekly feeder, so the schedule rather than the distance sets the date and a missed connection costs a week rather than a day. What the island actually runs on is geothermal plant and a fishing fleet, and both specify for temperature and salt rather than for pressure alone.',
  facts: [
    { label: 'Typical transit', value: 'Typically 32–42 days by sea from dispatch, feeder-dependent' },
    {
      label: 'Freight',
      value: 'Sea freight from Jebel Ali through Suez to Rotterdam or Hamburg, then a weekly feeder to Reykjavík · Air freight into Keflavík where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'CIF Reykjavík · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'CE marking and the PED declaration where the assembly is above threshold · REACH position on the elastomer compounds · Certificate of Origin, Dubai Chamber attested · Customs declaration raised by the importer',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, transhipped' },
    { label: 'Port of entry', value: 'Reykjavík' },
    { label: 'Transit', value: '32–42 days' },
    { label: 'Quoted in', value: 'EUR' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Iceland'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'REYKJAVÍK · PORT', coords: [-21.94, 64.15], legend: 'Port of entry', dx: 11, dy: 10, anchor: 'start' },
    routes: [
      { mode: 'SEA · TRANSHIP', primary: true, points: leg(MED_TO_ATLANTIC, [-9.5, 38.7], [-9.5, 45.0], [-6.0, 50.0], [-8.0, 56.0], [-14.0, 62.0], [-21.94, 64.15]) },
      { mode: 'AIR', points: leg(EUROPE_AIR, [10.0, 50.0], [-10.0, 58.0], [-22.6, 63.99]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '32–42 days', route: 'Transhipped at Rotterdam, then weekly feeder', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '3–5 days', route: 'DXB to KEF, with a connection', useCase: 'When the line is down' },
    { name: 'Sea, LCL', transit: '38–50 days', route: 'Consolidated, two transhipments', useCase: 'Small mixed orders' },
  ],
  orderSteps: {
    third: 'The consignment is built to catch a named feeder rather than an average schedule, and the compound is specified for geothermal or marine service where that is the duty.',
    fourth: 'Goods sail to Rotterdam and tranship for Reykjavík, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Reykjavík', coords: [-21.94, 64.15], region: 'Capital Region' },
    { name: 'Hafnarfjörður', coords: [-21.94, 64.07], region: 'Capital Region', plot: true, dx: 11, dy: 8, anchor: 'start' },
    { name: 'Grundartangi', coords: [-21.77, 64.34], region: 'West', plot: true, dx: 9, dy: -4 },
    { name: 'Akranes', coords: [-22.09, 64.32], region: 'West' },
    { name: 'Keflavík', coords: [-22.56, 64.0], region: 'Southern Peninsula', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Grindavík', coords: [-22.43, 63.84], region: 'Southern Peninsula' },
    { name: 'Selfoss', coords: [-20.99, 63.93], region: 'South', plot: true, dx: 9, dy: 8 },
    { name: 'Hellisheiði', coords: [-21.4, 64.03], region: 'South' },
    { name: 'Akureyri', coords: [-18.09, 65.68], region: 'Northeast', plot: true, dx: 9, dy: -4 },
    { name: 'Húsavík', coords: [-17.34, 66.04], region: 'Northeast' },
    { name: 'Reyðarfjörður', coords: [-14.22, 65.03], region: 'East', plot: true, dx: 9, dy: 4 },
    { name: 'Vestmannaeyjar', coords: [-20.27, 63.44], region: 'South', plot: true, dx: 9, dy: 8 },
  ],
  sectors: [
    { slug: 'power', name: 'Power & Energy', description: 'Geothermal and hydro plant — high-temperature compounds, steam-service hose and turbine governor hydraulics.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery, winch and trawl hydraulics for the fishing fleet, specified for salt and cold.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for the Grundartangi and Reyðarfjörður smelters.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and tunnelling hydraulics for civil and geothermal works.' },
    { slug: 'mining', name: 'Mining', description: 'Dust-rated, high-cycle components for aggregate and quarry plant.' },
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Fuel terminal and bunkering support at Reykjavík and Reyðarfjörður.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Iceland?', answer: 'No. Iceland is supplied from our Dubai warehouse, transhipped at Rotterdam or Hamburg onto a weekly feeder to Reykjavík.' },
    {
      question: 'Why does it take so long for such a small distance from Europe?',
      answer:
        'Because nothing sails here directly from the Gulf and the feeder is weekly. Missing a connection costs a week rather than a day, so we build a consignment to catch a named sailing rather than quoting against an average schedule.',
    },
    {
      question: 'Can you supply for geothermal service?',
      answer:
        'Where the duty is steam or high-temperature water, tell us the temperature, the pressure and whether the medium carries dissolved solids. A standard compound is the wrong answer for geothermal service and we will say so rather than supplying to the bore.',
    },
    { question: 'Can you supply for the fishing fleet?', answer: 'Yes — deck, winch and trawl hydraulics specified for salt and cold rather than a workshop environment. Cover material matters as much as the reinforcement here.' },
    { question: 'Do we need CE marking?', answer: 'For a hose assembly above the pressure-volume threshold in PED 2014/68/EU, yes. Iceland applies the European framework through the EEA, so the declaration is the same one a member state would expect.' },
    { question: 'Is Iceland in the EU customs union?', answer: 'No. Iceland is in the EEA rather than the customs union, so goods are declared on arrival rather than arriving in free circulation. It is a straightforward entry, but it is its own file.' },
    { question: 'What currency do you quote in?', answer: 'EUR. Our export desk settles European trade in euros; we do not quote in krónur, and the Estimate, invoice and customs value all carry the same figure.' },
    { question: 'Is it worth batching orders?', answer: 'Strongly, on a weekly feeder. A consolidated consignment catching one sailing lands sooner and cheaper than three small ones spread across three weeks, and we will say when that applies.' },
  ],
  compliance: {
    heading: 'EEA, not the customs union — and a weekly boat',
    body:
      'Two facts shape an Icelandic consignment. The first is that Iceland is in the European Economic Area but not the customs union, so goods do not arrive in free circulation from a European port — a declaration is made on arrival. It is a straightforward entry, but it is its own file, and the CE framework applies through the EEA so a PED declaration above threshold is expected exactly as a member state would expect it. The second is the feeder. Nothing sails from the Gulf to Reykjavík directly; cargo transhipes at Rotterdam or Hamburg onto a weekly service, and a missed connection costs a week. That makes this a lane where the useful discipline is consolidation — one consignment catching a named sailing rather than three chasing an average schedule. The specification work here is temperature at both extremes: geothermal steam service at one end and salt-water deck duty at the other, neither of which a catalogue default covers.',
    documents: [
      { ref: 'DECL', name: 'Customs import declaration', issuer: 'The importer, through Iceland Revenue and Customs', when: 'Before arrival' },
      { ref: 'PED', name: 'Declaration of conformity, assemblies above threshold', issuer: 'Us, as the assembler', when: 'Before dispatch' },
      { ref: 'REACH', name: 'Compound position on the elastomers supplied', issuer: 'Us, at quotation', when: 'At quotation' },
      { ref: 'DUTY', name: 'Temperature and medium statement for geothermal or marine service', issuer: 'Us, at quotation', when: 'At quotation, per duty' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
    ],
  },
}


// ─────────────────────────────────────────────────────────────────────────────
// THE ALPINE PAIR — landlocked, and only one of them inside the union
//
// Austria and Switzerland share a border, a language and a mountain range, and
// their consignments behave completely differently. Austria is inside the
// customs union, so goods clear once at a port and arrive as domestic movement.
// Switzerland is not, so the same container transits the EU under bond and
// makes a Swiss entry at the border — two files, in the middle of Europe.
// ─────────────────────────────────────────────────────────────────────────────

const AUSTRIA: MarketPage = {
  slug: 'austria',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → AT',
  dialCode: '+43',
  currency: 'EUR',
  localName: 'Österreich',
  lede: 'Austria is landlocked inside the customs union, which makes the only real decision the gate: Hamburg and the Rhine corridor from the north, or Koper and Trieste from the Adriatic. The Adriatic is materially shorter out of Suez and most of our cargo goes that way. Behind the gate the demand is machinery — cable cars, tunnelling, forming lines — and the pattern that a machine built here for export needs but a local distributor does not stock.',
  facts: [
    { label: 'Typical transit', value: 'Typically 20–26 days from dispatch via the Adriatic, sea and road combined' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali through Suez to Koper or Trieste, then road · Hamburg and the Rhine corridor where the northern gate suits · Air freight into Vienna where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'DAP to the buyer’s site · CIF Koper · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'CE marking and the PED declaration where the assembly is above threshold · REACH position on the elastomer compounds · Certificate of Origin, Dubai Chamber attested · EU customs entry raised at the port',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea + road' },
    { label: 'Port of entry', value: 'Koper, then road' },
    { label: 'Transit', value: '20–26 days' },
    { label: 'Quoted in', value: 'EUR' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Austria'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'KOPER · PORT', coords: [13.73, 45.55], legend: 'Port of entry', dx: -11, dy: 10, anchor: 'end' },
    routes: [
      { mode: 'SEA + ROAD', primary: true, points: leg(SUEZ_TO_MED, [26.0, 33.5], [20.0, 36.0], [16.0, 39.0], [15.5, 42.5], [13.73, 45.55], [14.5, 46.6], [15.44, 47.07]) },
      { mode: 'AIR', points: leg(EUROPE_AIR, [16.57, 48.12]) },
    ],
  },
  freight: [
    { name: 'Sea + road, Adriatic', transit: '20–26 days', route: 'Koper or Trieste, then road', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '2–4 days', route: 'DXB to VIE', useCase: 'When the line is down' },
    { name: 'Sea + road, northern', transit: '26–34 days', route: 'Hamburg and the Rhine corridor', useCase: 'When the northern gate suits' },
  ],
  orderSteps: {
    third: 'The gate is chosen against the delivery town rather than defaulted, and the CE declaration is prepared where the assembly is above threshold.',
    fourth: 'Goods sail from Jebel Ali through Suez to the Adriatic and come on by road, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Vienna', coords: [16.37, 48.21], region: 'Vienna', plot: true, dx: 9, dy: -5 },
    { name: 'Graz', coords: [15.44, 47.07], region: 'Styria', plot: true, dx: 9, dy: 8 },
    { name: 'Linz', coords: [14.29, 48.31], region: 'Upper Austria', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Wels', coords: [14.02, 48.16], region: 'Upper Austria' },
    { name: 'Steyr', coords: [14.42, 48.04], region: 'Upper Austria' },
    { name: 'Salzburg', coords: [13.06, 47.81], region: 'Salzburg', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Innsbruck', coords: [11.4, 47.27], region: 'Tyrol', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Kufstein', coords: [12.17, 47.58], region: 'Tyrol' },
    { name: 'Bregenz', coords: [9.75, 47.5], region: 'Vorarlberg', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Klagenfurt', coords: [14.31, 46.62], region: 'Carinthia', plot: true, dx: 9, dy: 8 },
    { name: 'Villach', coords: [13.85, 46.61], region: 'Carinthia' },
    { name: 'Leoben', coords: [15.09, 47.38], region: 'Styria' },
    { name: 'Kapfenberg', coords: [15.29, 47.44], region: 'Styria' },
    { name: 'St. Pölten', coords: [15.62, 48.2], region: 'Lower Austria' },
    { name: 'Wiener Neustadt', coords: [16.24, 47.81], region: 'Lower Austria' },
    { name: 'Ranshofen', coords: [13.04, 48.24], region: 'Upper Austria' },
  ],
  sectors: [
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for the Linz, Leoben and Kapfenberg lines.' },
    { slug: 'construction', name: 'Construction', description: 'Tunnelling, cable-car and crane hydraulics — and the machinery builders exporting them.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for the Alpine hydro cascade.' },
    { slug: 'mining', name: 'Mining', description: 'Dust-rated, high-cycle components for magnesite, aggregate and cement plant.' },
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Refinery and terminal support at Schwechat, and oilfield packages built here for export.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Winch and deck hydraulics for Danube river and lifting equipment.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Austria?', answer: 'No. Austria is supplied from our Dubai warehouse, by sea through Suez to Koper or Trieste and then by road.' },
    {
      question: 'Why the Adriatic rather than a northern port?',
      answer:
        'Because it is materially shorter out of Suez. A container discharged at Koper is a few hours from Graz and most of a week closer than the same box routed via Hamburg. We use the northern gate where the delivery sits in Upper Austria or Vorarlberg and the road leg reverses the advantage.',
    },
    { question: 'Is there a border formality?', answer: 'No. Austria is inside the customs union, so goods clear once at Koper or Hamburg into free circulation and arrive as domestic movement. There is no second entry and no transit document.' },
    { question: 'Do we need CE marking?', answer: 'For a hose assembly above the pressure-volume threshold in PED 2014/68/EU, yes, and the declaration travels with the goods. Below it, sound engineering practice applies and there is no mark.' },
    {
      question: 'Why buy from Dubai rather than locally?',
      answer:
        'For a standard fitting, you should not. The consistent reason is a machine being built here for export — a GOST coupling for a Central Asian contract, an API-monogrammed assembly, an SS316L thread form — where the pattern is stock for us and a factory order locally.',
    },
    { question: 'Can you deliver to a site in the mountains?', answer: 'Yes, on DAP terms. The road leg is domestic movement and it is priced with the order; we will say where a delivery point needs a smaller vehicle than a standard trailer.' },
    { question: 'What currency do you quote in?', answer: 'EUR. Austria is in the eurozone, so the Estimate, the invoice and the customs value all carry the same figure with nothing to convert.' },
    { question: 'Can you supply GOST-pattern couplings?', answer: 'Yes, alongside the DIN, BSP, JIC and ORFS ranges, so a machine destined for a GOST market can be plumbed from one order.' },
  ],
  compliance: {
    heading: 'Two gates, one clearance',
    body:
      'Austria is landlocked and inside the customs union, which reduces the whole customs question to a routing one. Goods clear once — at Koper, Trieste or Hamburg — enter free circulation, and reach the delivery address as domestic movement with no second entry and no transit document. The decision that remains is which gate, and it is a real one rather than a formality: the Adriatic ports are materially shorter out of Suez, and a container discharged at Koper is a few hours from Graz where the same box routed via Hamburg is most of a week further away. We choose against the delivery town rather than defaulting to whichever port a forwarder prefers. On product documentation the European set applies unchanged — a declaration of conformity above the PED 2014/68/EU threshold, and our position on the compounds under REACH.',
    documents: [
      { ref: 'PED', name: 'Declaration of conformity, assemblies above threshold', issuer: 'Us, as the assembler', when: 'Before dispatch' },
      { ref: 'REACH', name: 'Compound position on the elastomers supplied', issuer: 'Us, at quotation', when: 'At quotation' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'EU-ENTRY', name: 'Customs entry into free circulation', issuer: 'The importer, at Koper or Hamburg', when: 'On arrival' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the order calls for them' },
    ],
  },
}

const SWITZERLAND: MarketPage = {
  slug: 'switzerland',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → CH',
  dialCode: '+41',
  currency: 'EUR',
  localName: 'Schweiz · Suisse',
  lede: 'Switzerland is surrounded by the customs union and outside it, which makes this the only European lane on the network that carries two customs files. A container discharged at Genoa or Rotterdam transits the union under bond and makes a Swiss entry at the border; the two declarations describe the same goods and have to agree line for line. The demand behind it is precision machinery and pharmaceutical plant, where the specification is tighter than the tolerance most catalogues quote.',
  facts: [
    { label: 'Typical transit', value: 'Typically 24–32 days from dispatch, sea and road combined' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali through Suez to Genoa, then bonded road over the Alps · Rotterdam and the Rhine corridor where the northern gate suits · Air freight into Zürich where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'DAP to the buyer’s site · CIF Genoa · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'EU transit declaration for the bonded move · Swiss customs entry raised by the importer · CE marking and the PED declaration where the assembly is above threshold · Certificate of Origin, Dubai Chamber attested',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea + road' },
    { label: 'Border crossing', value: 'Chiasso · Basel' },
    { label: 'Transit', value: '24–32 days' },
    { label: 'Quoted in', value: 'EUR' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Switzerland'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'CHIASSO · BORDER', coords: [9.03, 45.83], dx: 11, dy: 10, anchor: 'start' },
    routes: [
      { mode: 'SEA + ROAD', primary: true, points: leg(SUEZ_TO_MED, [26.0, 33.5], [18.0, 35.5], [12.0, 38.0], [9.5, 43.0], [8.92, 44.4], [9.03, 45.83], [8.54, 47.38]) },
      { mode: 'AIR', points: leg(EUROPE_AIR, [15.0, 47.0], [8.56, 47.45]) },
    ],
  },
  freight: [
    { name: 'Sea + road', transit: '24–32 days', route: 'Genoa, then bonded over the Alps', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '2–4 days', route: 'DXB to ZRH', useCase: 'When the line is down' },
    { name: 'Sea + road, northern', transit: '28–36 days', route: 'Rotterdam and the Rhine corridor to Basel', useCase: 'When the northern gate suits' },
  ],
  orderSteps: {
    third:
      'The EU transit declaration and the Swiss entry are raised against the same invoice and packing list, so the two agree line for line before the goods reach the border.',
    fourth: 'Goods sail to Genoa and cross the Alps under bond, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Zürich', coords: [8.54, 47.38], region: 'Zürich', plot: true, dx: 9, dy: -5 },
    { name: 'Basel', coords: [7.59, 47.56], region: 'Basel-Stadt', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Chiasso', coords: [9.03, 45.83], region: 'Ticino' },
    { name: 'Lugano', coords: [8.95, 46.0], region: 'Ticino', plot: true, dx: 9, dy: 8 },
    { name: 'Bern', coords: [7.45, 46.95], region: 'Bern', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Geneva', coords: [6.14, 46.2], region: 'Geneva', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Lausanne', coords: [6.63, 46.52], region: 'Vaud' },
    { name: 'Winterthur', coords: [8.73, 47.5], region: 'Zürich' },
    { name: 'St. Gallen', coords: [9.38, 47.42], region: 'St. Gallen', plot: true, dx: 9, dy: -4 },
    { name: 'Schaffhausen', coords: [8.63, 47.7], region: 'Schaffhausen' },
    { name: 'Lucerne', coords: [8.31, 47.05], region: 'Lucerne' },
    { name: 'Visp', coords: [7.88, 46.29], region: 'Valais', plot: true, dx: 9, dy: 8 },
    { name: 'Sion', coords: [7.36, 46.23], region: 'Valais' },
    { name: 'Biel', coords: [7.25, 47.14], region: 'Bern' },
    { name: 'Aarau', coords: [8.04, 47.39], region: 'Aargau' },
    { name: 'Neuchâtel', coords: [6.93, 46.99], region: 'Neuchâtel' },
  ],
  sectors: [
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and precision servo valves for forming and machining lines.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for the Alpine hydro cascade and pumped storage.' },
    { slug: 'construction', name: 'Construction', description: 'Tunnelling, cable-car and crane hydraulics for Alpine civil works.' },
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Process and terminal support, and packages built here for export.' },
    { slug: 'mining', name: 'Mining', description: 'Dust-rated, high-cycle components for aggregate, salt and cement plant.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Winch and deck hydraulics for Rhine barge and lake fleet equipment.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Switzerland?', answer: 'No. Switzerland is supplied from our Dubai warehouse, by sea to Genoa and then across the Alps under bond.' },
    {
      question: 'Is Switzerland in the EU customs union?',
      answer:
        'No, and it is the only European market on this network where that matters to a shipment. Goods transit the union under bond and make a Swiss entry at the border, so there are two declarations describing the same cargo. They have to agree line for line, or the truck waits at Chiasso rather than at either customs office.',
    },
    { question: 'Genoa or Rotterdam?', answer: 'Genoa for most cargo — it is much shorter out of Suez and the Alpine crossing is straightforward. Rotterdam and the Rhine corridor where the delivery sits in Basel or the north-west and the road leg is shorter that way.' },
    { question: 'Do we need CE marking?', answer: 'For a hose assembly above the pressure-volume threshold in PED 2014/68/EU, yes. Switzerland recognises the European conformity framework for this equipment, so the declaration is the one a member state would expect.' },
    {
      question: 'Why buy from Dubai rather than locally?',
      answer:
        'For a standard item you should not; Swiss and German distribution is excellent and closer. What we are asked for is the pattern held as stock — SS316L thread forms, GOST couplings, API-monogrammed assemblies — usually for machinery being built here for export.',
    },
    { question: 'What is the real variable on this lane?', answer: 'The border, not the sailing. The sea leg to Genoa is predictable; what causes delay is a transit declaration and a Swiss entry that disagree on a description or a quantity, which is why we raise both from the same invoice and packing list.' },
    { question: 'What currency do you quote in?', answer: 'EUR. Our export desk settles European trade in euros; we do not quote in francs, and the Estimate, invoice and customs value all carry the same figure.' },
    { question: 'Can you supply to a tighter tolerance specification?', answer: 'Tell us the tolerance and the standard it is written against at quotation. We will say plainly whether the item holds it and what documentation comes with it, rather than shipping to a nominal dimension.' },
  ],
  compliance: {
    heading: 'The only two-file lane in western Europe',
    body:
      'Every other European market on this network clears once and moves domestically. Switzerland does not: it is surrounded by the customs union and outside it, so a container discharged at Genoa or Rotterdam travels under EU transit bond and makes a separate Swiss entry at the border. Those two declarations describe the same goods and must agree line for line — a description or a quantity that differs between them stops the truck at Chiasso or Basel rather than at either customs office, and a border is a far more expensive place to resolve a discrepancy than an office is. We raise both from the same invoice and packing list before the vessel sails. On conformity Switzerland recognises the European framework for this equipment, so a PED declaration above threshold is expected exactly as a member state would expect it, and there is no separate national mark to obtain.',
    documents: [
      { ref: 'T1', name: 'EU transit declaration for the bonded move', issuer: 'The forwarder, at the port of discharge', when: 'Before the road leg' },
      { ref: 'DECL', name: 'Swiss customs import declaration', issuer: 'The importer, through the Federal Office for Customs', when: 'At the border' },
      { ref: 'PED', name: 'Declaration of conformity, assemblies above threshold', issuer: 'Us, as the assembler', when: 'Before dispatch' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the order calls for them' },
    ],
  },
}


// ─────────────────────────────────────────────────────────────────────────────
// THE WESTERN MEDITERRANEAN — the shortest European lanes
//
// Everything here is reached without leaving the Mediterranean after Suez,
// which makes these the quickest European transits on the network. It also
// makes the ports genuine hubs: Algeciras, Genoa, Marseille-Fos and Sines all
// tranship for somewhere else, and a consignment routed through one of them is
// often not for that country at all.
// ─────────────────────────────────────────────────────────────────────────────

const ITALY: MarketPage = {
  slug: 'italy',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → IT',
  dialCode: '+39',
  currency: 'EUR',
  localName: 'Italia',
  lede: 'Italy builds oilfield and process packages for export on a scale that makes it a customer for patterns rather than parts. A skid assembled in Lombardy for a Gulf or West African contract has to be plumbed to the destination’s standard, not Italy’s, and that is where a GOST coupling or an API-monogrammed assembly stops being a factory order and starts being stock. Genoa and Trieste are two weeks from Jebel Ali — the shortest European lane we run after Türkiye.',
  facts: [
    { label: 'Typical transit', value: 'Typically 16–22 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali through Suez to Genoa for the north-west · Trieste for the north-east and the Alpine corridor · Gioia Tauro and Taranto for the south · Air freight into Milan where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'CIF Genoa · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'CE marking and the PED declaration where the assembly is above threshold · REACH position on the elastomer compounds · Certificate of Origin, Dubai Chamber attested · EU customs entry raised by the importer',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via Suez' },
    { label: 'Port of entry', value: 'Genoa' },
    { label: 'Transit', value: '16–22 days' },
    { label: 'Quoted in', value: 'EUR' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Italy'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'GENOA · PORT', coords: [8.92, 44.4], legend: 'Port of entry', dx: -11, dy: 8, anchor: 'end' },
    routes: [
      { mode: 'SEA · SUEZ', primary: true, points: leg(SUEZ_TO_MED, [26.0, 33.5], [18.0, 35.5], [12.0, 38.0], [9.5, 43.0], [8.92, 44.4]) },
      { mode: 'AIR', points: leg(EUROPE_AIR, [15.0, 45.0], [8.72, 45.63]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '16–22 days', route: 'Jebel Ali to Genoa, via Suez', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '2–4 days', route: 'DXB to MXP', useCase: 'When the line is down' },
    { name: 'Sea, LCL', transit: '22–30 days', route: 'Consolidated, with transhipment', useCase: 'Small mixed orders' },
  ],
  orderSteps: {
    third:
      'Where the goods are being built into a package for export, the destination standard is confirmed rather than the Italian one, and the CE declaration is prepared where the assembly is above threshold.',
    fourth: 'Goods sail from Jebel Ali through Suez to Genoa or Trieste, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Genoa', coords: [8.93, 44.41], region: 'Liguria' },
    { name: 'Milan', coords: [9.19, 45.46], region: 'Lombardy', plot: true, dx: 9, dy: -5 },
    { name: 'Bergamo', coords: [9.67, 45.7], region: 'Lombardy' },
    { name: 'Brescia', coords: [10.22, 45.54], region: 'Lombardy' },
    { name: 'Turin', coords: [7.69, 45.07], region: 'Piedmont', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Trieste', coords: [13.77, 45.65], region: 'Friuli Venezia Giulia', plot: true, dx: 9, dy: -4 },
    { name: 'Venice', coords: [12.34, 45.44], region: 'Veneto' },
    { name: 'Ravenna', coords: [12.2, 44.42], region: 'Emilia-Romagna', plot: true, dx: 9, dy: 4 },
    { name: 'Bologna', coords: [11.34, 44.49], region: 'Emilia-Romagna' },
    { name: 'Florence', coords: [11.26, 43.77], region: 'Tuscany' },
    { name: 'Livorno', coords: [10.31, 43.55], region: 'Tuscany', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Rome', coords: [12.5, 41.9], region: 'Lazio', plot: true, dx: 9, dy: 4 },
    { name: 'Naples', coords: [14.27, 40.85], region: 'Campania', plot: true, dx: 9, dy: 4 },
    { name: 'Taranto', coords: [17.24, 40.46], region: 'Apulia', plot: true, dx: 9, dy: 4 },
    { name: 'Gioia Tauro', coords: [15.9, 38.43], region: 'Calabria', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Augusta', coords: [15.22, 37.23], region: 'Sicily' },
  ],
  sectors: [
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Skid and package builders assembling for Gulf, African and Caspian contracts — plumbed to the destination standard.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for the Taranto and Brescia rolling lines.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and tunnelling hydraulics — and the machinery builders who export them.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery and vessel hydraulics for the Genoa, Trieste and Naples yards.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for thermal, hydro and geothermal plant.' },
    { slug: 'mining', name: 'Mining', description: 'Dust-rated, high-cycle components for marble, aggregate and cement plant.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Italy?', answer: 'No. Italy is supplied from our Dubai warehouse, by sea through Suez into Genoa, Trieste or the southern ports.' },
    {
      question: 'Why would an Italian builder import hydraulics?',
      answer:
        'Because the package is not for Italy. A skid built in Lombardy for a Gulf, West African or Caspian contract has to be plumbed to the destination’s standard — GOST couplings, API monograms, SS316L thread forms — and those are stock for us and a factory order locally.',
    },
    { question: 'Do we need CE marking?', answer: 'For a hose assembly above the pressure-volume threshold in PED 2014/68/EU, yes, and the declaration travels with the goods. Below it, sound engineering practice applies and there is no mark.' },
    { question: 'Genoa or Trieste?', answer: 'Genoa for the north-west and the Turin–Milan belt; Trieste for the north-east and anything continuing into Austria or Hungary. The southern ports where the delivery is south of Rome.' },
    { question: 'Can you supply to the destination standard rather than ours?', answer: 'That is usually the point of the order. Send the destination specification and we will quote against it, including the material documentation the receiving country will ask for.' },
    { question: 'What currency do you quote in?', answer: 'EUR. Italy is in the eurozone, so the Estimate, the invoice and the customs value all carry the same figure with nothing to convert.' },
    { question: 'Can you supply API-monogrammed equipment?', answer: 'Yes. API 6A wellhead, API 16A BOP, API 16C choke and kill and API 7K drilling hose, with NACE MR0175 material documentation where the contract requires it.' },
    { question: 'How quickly can you get here?', answer: 'Two to three weeks by sea, which is the shortest European lane we run after Türkiye. For a line that is down a local distributor is still faster and we will say so.' },
  ],
  compliance: {
    heading: 'Plumbed for somewhere else',
    body:
      'The useful thing to understand about this lane is that a large share of what we ship into Italy is not staying. Italian builders assemble oilfield skids, process packages and machinery for Gulf, African and Caspian contracts, and a package has to be plumbed to the destination’s standard rather than the one next door to the workshop. A GOST coupling for a Kazakh contract, an API-monogrammed assembly for a West African wellhead, an SS316L thread form for a chemical duty — locally each is a factory order with weeks of lead time; here each is stock. That changes what a useful quotation looks like: send the destination specification rather than an Italian part number, and we will quote against it including the material documentation the receiving country will ask for. Customs itself is unremarkable — one entry into free circulation at Genoa or Trieste, a PED declaration above threshold, and the REACH position on the compounds.',
    documents: [
      { ref: 'PED', name: 'Declaration of conformity, assemblies above threshold', issuer: 'Us, as the assembler', when: 'Before dispatch' },
      { ref: 'DEST', name: 'Destination-standard confirmation for export packages', issuer: 'Us, at quotation', when: 'At quotation, per package' },
      { ref: 'REACH', name: 'Compound position on the elastomers supplied', issuer: 'Us, at quotation', when: 'At quotation' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'EU-ENTRY', name: 'Customs entry into free circulation', issuer: 'The importer, through Italian Customs', when: 'On arrival' },
    ],
  },
}

const FRANCE: MarketPage = {
  slug: 'france',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → FR',
  dialCode: '+33',
  currency: 'EUR',
  lede: 'France has two coasts and the difference between them is a week. Marseille-Fos is a fortnight from Jebel Ali through Suez; Le Havre means carrying on past Gibraltar and up the Atlantic. Most of our cargo takes the Mediterranean gate. What the market itself asks for is documentation discipline — nuclear and defence supply chains want traceability written down before the goods move, not assembled afterwards when an auditor asks.',
  facts: [
    { label: 'Typical transit', value: 'Typically 18–24 days by sea from dispatch to Fos' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali through Suez to Marseille-Fos for the south and the Rhône corridor · Le Havre for the north and Paris · Dunkirk where the berth suits · Air freight into Paris where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'CIF Marseille-Fos · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'CE marking and the PED declaration where the assembly is above threshold · REACH position on the elastomer compounds · Material traceability where the supply chain requires it · Certificate of Origin, Dubai Chamber attested',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via Suez' },
    { label: 'Port of entry', value: 'Marseille-Fos' },
    { label: 'Transit', value: '18–24 days' },
    { label: 'Quoted in', value: 'EUR' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['France'],
    // Metropolitan France only — the feature also carries French Guiana,
    // Réunion, Mayotte and the Antilles.
    mainland: [-5.5, 41.0, 10.0, 51.5],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'MARSEILLE-FOS', coords: [4.87, 43.4], legend: 'Port of entry', dx: 11, dy: 10, anchor: 'start' },
    routes: [
      { mode: 'SEA · SUEZ', primary: true, points: leg(SUEZ_TO_MED, [26.0, 33.5], [16.0, 36.0], [8.0, 39.0], [5.5, 42.5], [4.87, 43.4]) },
      { mode: 'AIR', points: leg(EUROPE_AIR, [12.0, 46.0], [2.55, 49.01]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '18–24 days', route: 'Jebel Ali to Marseille-Fos, via Suez', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '2–4 days', route: 'DXB to CDG', useCase: 'When the line is down' },
    { name: 'Sea via Le Havre', transit: '25–32 days', route: 'On past Gibraltar and up the Atlantic', useCase: 'The north and Paris' },
  ],
  orderSteps: {
    third:
      'Traceability is assembled before dispatch rather than after an audit asks — mill certificates to heat number where the supply chain requires it, and the CE declaration where the assembly is above threshold.',
    fourth: 'Goods sail from Jebel Ali through Suez to Fos, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Marseille', coords: [5.37, 43.3], region: "Provence-Alpes-Côte d'Azur", plot: true, dx: 9, dy: 8 },
    { name: 'Fos-sur-Mer', coords: [4.94, 43.44], region: "Provence-Alpes-Côte d'Azur" },
    { name: 'Lyon', coords: [4.84, 45.76], region: 'Auvergne-Rhône-Alpes', plot: true, dx: 9, dy: 4 },
    { name: 'Grenoble', coords: [5.72, 45.19], region: 'Auvergne-Rhône-Alpes' },
    { name: 'Saint-Étienne', coords: [4.39, 45.44], region: 'Auvergne-Rhône-Alpes' },
    { name: 'Paris', coords: [2.35, 48.86], region: 'Île-de-France', plot: true, dx: 9, dy: -5 },
    { name: 'Le Havre', coords: [0.11, 49.49], region: 'Normandy', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Rouen', coords: [1.1, 49.44], region: 'Normandy' },
    { name: 'Dunkirk', coords: [2.38, 51.03], region: 'Hauts-de-France', plot: true, dx: 9, dy: -4 },
    { name: 'Lille', coords: [3.06, 50.63], region: 'Hauts-de-France' },
    { name: 'Strasbourg', coords: [7.75, 48.57], region: 'Grand Est', plot: true, dx: 9, dy: -4 },
    { name: 'Nancy', coords: [6.18, 48.69], region: 'Grand Est' },
    { name: 'Toulouse', coords: [1.44, 43.6], region: 'Occitanie', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Bordeaux', coords: [-0.58, 44.84], region: 'Nouvelle-Aquitaine', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Nantes', coords: [-1.55, 47.22], region: 'Pays de la Loire' },
    { name: 'Saint-Nazaire', coords: [-2.21, 47.28], region: 'Pays de la Loire' },
  ],
  sectors: [
    { slug: 'power', name: 'Power & Energy', description: 'Nuclear and hydro plant — actuator and governor hydraulics with traceability written down before dispatch.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery and vessel hydraulics for the Saint-Nazaire and Marseille yards.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for the Dunkirk and Fos rolling lines.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and tunnelling hydraulics for civil and rail works.' },
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Refinery and terminal support at Fos, Lavéra and Donges.' },
    { slug: 'mining', name: 'Mining', description: 'Dust-rated, high-cycle components for aggregate, salt and cement plant.' },
  ],
  faqs: [
    { question: 'Do you have a branch in France?', answer: 'No. France is supplied from our Dubai warehouse, by sea through Suez into Marseille-Fos, or on past Gibraltar to Le Havre.' },
    {
      question: 'Fos or Le Havre?',
      answer:
        'Fos unless the delivery is in the north. The Mediterranean gate is a week shorter out of Suez, so a container for Lyon or Toulouse should not be going round Iberia. Le Havre or Dunkirk where the road leg from the south would give the week back.',
    },
    {
      question: 'Can you supply traceable material documentation?',
      answer:
        'Yes, and in these supply chains it is worth asking for at quotation rather than at audit. Mill certificates to heat number, the material standard named, and the documentation issued with the goods rather than reconstructed later when someone asks for it.',
    },
    { question: 'Do we need CE marking?', answer: 'For a hose assembly above the pressure-volume threshold in PED 2014/68/EU, yes, and the declaration travels with the goods. Below it, sound engineering practice applies and there is no mark.' },
    { question: 'Why buy from Dubai rather than locally?', answer: 'For a standard item you should not. What we hold is the pattern a French plant needs for equipment destined elsewhere, or a material grade a local distributor orders in rather than stocks.' },
    { question: 'What is your REACH position?', answer: 'We state it on the elastomer compounds at quotation, including where a compound carries a restriction relevant to your application.' },
    { question: 'What currency do you quote in?', answer: 'EUR. France is in the eurozone, so the Estimate, the invoice and the customs value all carry the same figure with nothing to convert.' },
    { question: 'Can you deliver to a site rather than the port?', answer: 'Yes, on DAP terms. The inland leg from Fos is domestic movement and it is priced with the order rather than left to be arranged.' },
  ],
  compliance: {
    heading: 'A week between two coasts, and paperwork before the audit',
    body:
      'Two things are worth being precise about here. The first is geography: Marseille-Fos is roughly a week closer to Jebel Ali than Le Havre, because the Mediterranean gate does not require carrying on past Gibraltar and up the Atlantic. A container for Lyon, Toulouse or Grenoble that routes via the Channel has given a week away for nothing, so we choose against the delivery town rather than a forwarder’s habit. The second is documentation culture. French nuclear, defence and rail supply chains expect traceability to exist before the goods move — the material standard named, mill certificates to heat number, the file issued with the consignment rather than reconstructed months later when an auditor asks. That is a different discipline from a commercial delivery and it is far cheaper to do at quotation than retrospectively, so we ask which regime an order sits under rather than assuming the commercial one.',
    documents: [
      { ref: 'PED', name: 'Declaration of conformity, assemblies above threshold', issuer: 'Us, as the assembler', when: 'Before dispatch' },
      { ref: 'MTC', name: 'Mill certificates traceable to heat number', issuer: 'Mill, or our test bench', when: 'Before dispatch' },
      { ref: 'REACH', name: 'Compound position on the elastomers supplied', issuer: 'Us, at quotation', when: 'At quotation' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'EU-ENTRY', name: 'Customs entry into free circulation', issuer: 'The importer, through French Customs', when: 'On arrival' },
    ],
  },
}


const SPAIN: MarketPage = {
  slug: 'spain',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → ES',
  dialCode: '+34',
  currency: 'EUR',
  localName: 'España',
  lede: 'Spain has the busiest transhipment port in the Mediterranean and it is worth knowing whether your consignment is using it as a gate or a hub. Algeciras handles a great deal of cargo that never enters Spain; Valencia and Barcelona are where goods for Spanish industry actually land. Behind them the demand is shipyards, mining in Andalusia and a machinery sector that exports — which is the familiar pattern of needing the destination’s standard rather than the local one.',
  facts: [
    { label: 'Typical transit', value: 'Typically 18–24 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali through Suez to Valencia for the east and Madrid · Barcelona for Catalonia · Algeciras and Bilbao where the berth or the onward leg suits · Air freight into Madrid where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'CIF Valencia · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'CE marking and the PED declaration where the assembly is above threshold · REACH position on the elastomer compounds · Certificate of Origin, Dubai Chamber attested · EU customs entry raised by the importer',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via Suez' },
    { label: 'Port of entry', value: 'Valencia' },
    { label: 'Transit', value: '18–24 days' },
    { label: 'Quoted in', value: 'EUR' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Spain'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'VALENCIA · PORT', coords: [-0.32, 39.44], legend: 'Port of entry', dx: 11, dy: 10, anchor: 'start' },
    routes: [
      { mode: 'SEA · SUEZ', primary: true, points: leg(SUEZ_TO_MED, [26.0, 33.5], [16.0, 35.5], [8.0, 37.5], [2.0, 38.5], [-0.32, 39.44]) },
      { mode: 'AIR', points: leg(EUROPE_AIR, [10.0, 44.0], [-3.57, 40.49]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '18–24 days', route: 'Jebel Ali to Valencia, via Suez', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '2–4 days', route: 'DXB to MAD', useCase: 'When the line is down' },
    { name: 'Sea, LCL', transit: '24–32 days', route: 'Consolidated, transhipped at Algeciras', useCase: 'Small mixed orders' },
  ],
  orderSteps: {
    third: 'Whether the consignment is entering Spain or transhipping onward is settled first, because Algeciras handles a great deal of cargo that never clears here.',
    fourth: 'Goods sail from Jebel Ali through Suez to Valencia or Barcelona, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Valencia', coords: [-0.38, 39.47], region: 'Valencian Community' },
    { name: 'Barcelona', coords: [2.17, 41.39], region: 'Catalonia', plot: true, dx: 9, dy: -4 },
    { name: 'Tarragona', coords: [1.25, 41.12], region: 'Catalonia' },
    { name: 'Madrid', coords: [-3.7, 40.42], region: 'Madrid', plot: true, dx: 9, dy: -5 },
    { name: 'Zaragoza', coords: [-0.88, 41.65], region: 'Aragon', plot: true, dx: 9, dy: -4 },
    { name: 'Bilbao', coords: [-2.93, 43.26], region: 'Basque Country', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Santander', coords: [-3.8, 43.46], region: 'Cantabria' },
    { name: 'Gijón', coords: [-5.66, 43.54], region: 'Asturias' },
    { name: 'Avilés', coords: [-5.92, 43.56], region: 'Asturias' },
    { name: 'Vigo', coords: [-8.72, 42.24], region: 'Galicia', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Ferrol', coords: [-8.24, 43.48], region: 'Galicia' },
    { name: 'Algeciras', coords: [-5.45, 36.13], region: 'Andalusia', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Huelva', coords: [-6.94, 37.26], region: 'Andalusia', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Seville', coords: [-5.98, 37.39], region: 'Andalusia' },
    { name: 'Cartagena', coords: [-0.99, 37.6], region: 'Murcia', plot: true, dx: 9, dy: 8 },
    { name: 'Cádiz', coords: [-6.29, 36.53], region: 'Andalusia' },
  ],
  sectors: [
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery and vessel hydraulics for the Ferrol, Cádiz and Vigo yards.' },
    { slug: 'mining', name: 'Mining', description: 'Copper and pyrite in Andalusia — dust-rated, high-cycle components for shovel and mill.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for the Avilés, Gijón and Bilbao lines.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and tunnelling hydraulics — and the machinery builders who export them.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for thermal, hydro and solar-thermal plant.' },
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Refinery and terminal support at Cartagena, Huelva and Bilbao.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Spain?', answer: 'No. Spain is supplied from our Dubai warehouse, by sea through Suez into Valencia, Barcelona or Algeciras.' },
    {
      question: 'Is Algeciras a gate or a hub for us?',
      answer:
        'Both, and it matters which. Algeciras transhipes an enormous volume that never enters Spain. If your goods are for Spanish delivery we usually route Valencia or Barcelona instead; if they are staging onward we say so on the file rather than importing and re-exporting.',
    },
    { question: 'Do we need CE marking?', answer: 'For a hose assembly above the pressure-volume threshold in PED 2014/68/EU, yes, and the declaration travels with the goods. Below it, sound engineering practice applies and there is no mark.' },
    { question: 'Valencia or Barcelona?', answer: 'Valencia for Madrid, the east and the centre; Barcelona for Catalonia and anything continuing into southern France. Bilbao where the delivery is on the north coast.' },
    { question: 'Can you deliver to the Andalusian mines?', answer: 'Yes, on DAP terms to the mine gate. The road leg from Huelva or Algeciras is priced with the order rather than estimated.' },
    { question: 'Why buy from Dubai rather than locally?', answer: 'For a standard item you should not. What we hold is the pattern for equipment being built here for export, or a material grade a local distributor orders in rather than stocks.' },
    { question: 'What currency do you quote in?', answer: 'EUR. Spain is in the eurozone, so the Estimate, the invoice and the customs value all carry the same figure with nothing to convert.' },
    { question: 'What language do the documents need to be in?', answer: 'Spanish, with the description agreeing across the invoice, the packing list and the declaration. We fix the wording at quotation.' },
  ],
  compliance: {
    heading: 'Gate or hub — decide before it sails',
    body:
      'Spain hosts the busiest transhipment port in the Mediterranean, and the single most useful question on this lane is whether your consignment is using it. Algeciras moves an enormous volume of cargo that never enters Spain at all, and a box routed there for a Spanish delivery is often further from the customer than one discharged at Valencia. Conversely, goods staging onward should be documented as staging rather than imported and re-exported, which pays for a customs round trip nobody needed. We settle that at quotation and pick the port against the delivery town rather than the sailing schedule alone. The product documentation is the ordinary European set — a declaration of conformity above the PED 2014/68/EU threshold, and our position on the compounds under REACH — with the description agreed in Spanish across the invoice, the packing list and the entry.',
    documents: [
      { ref: 'PED', name: 'Declaration of conformity, assemblies above threshold', issuer: 'Us, as the assembler', when: 'Before dispatch' },
      { ref: 'REACH', name: 'Compound position on the elastomers supplied', issuer: 'Us, at quotation', when: 'At quotation' },
      { ref: 'ROUTE', name: 'Gate or transhipment decision for the consignment', issuer: 'Agreed at quotation', when: 'Before the vessel sails' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'EU-ENTRY', name: 'Customs entry into free circulation', issuer: 'The importer, through Spanish Customs', when: 'On arrival' },
    ],
  },
}

const PORTUGAL: MarketPage = {
  slug: 'portugal',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → PT',
  dialCode: '+351',
  currency: 'EUR',
  lede: 'Portugal is the far end of the Mediterranean lane and the only western European market that is not on the way to anywhere else on this network. Sines is a deep-water port that takes the largest vessels and is a fortnight and a half from Jebel Ali; Leixões serves the industrial north. The market is compact — moulds and tooling, shipyards, pulp and paper plant — and the reason to import is the same narrow one as the rest of Europe: the pattern rather than the part.',
  facts: [
    { label: 'Typical transit', value: 'Typically 22–28 days by sea from dispatch' },
    {
      label: 'Freight',
      value: 'Sea freight from Jebel Ali through Suez and past Gibraltar to Sines or Lisbon · Leixões for the industrial north · Air freight into Lisbon where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'CIF Sines · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'CE marking and the PED declaration where the assembly is above threshold · REACH position on the elastomer compounds · Certificate of Origin, Dubai Chamber attested · EU customs entry raised by the importer',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via Suez' },
    { label: 'Port of entry', value: 'Sines' },
    { label: 'Transit', value: '22–28 days' },
    { label: 'Quoted in', value: 'EUR' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Portugal'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'SINES · PORT', coords: [-8.87, 37.95], legend: 'Port of entry', dx: 11, dy: 10, anchor: 'start' },
    routes: [
      { mode: 'SEA · SUEZ', primary: true, points: leg(MED_TO_ATLANTIC, [-7.0, 36.5], [-8.87, 37.95]) },
      { mode: 'AIR', points: leg(EUROPE_AIR, [8.0, 44.0], [-9.14, 38.77]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '22–28 days', route: 'Jebel Ali to Sines, via Suez', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '2–5 days', route: 'DXB to LIS, with a connection', useCase: 'When the line is down' },
    { name: 'Sea, LCL', transit: '28–36 days', route: 'Consolidated, transhipped at Algeciras', useCase: 'Small mixed orders' },
  ],
  orderSteps: {
    third: 'The port is chosen against the delivery region — Sines or Lisbon for the south, Leixões for the north — and the CE declaration is prepared where the assembly is above threshold.',
    fourth: 'Goods sail from Jebel Ali through Suez and past Gibraltar, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Sines', coords: [-8.87, 37.95], region: 'Alentejo' },
    { name: 'Lisbon', coords: [-9.14, 38.72], region: 'Lisbon', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Setúbal', coords: [-8.89, 38.52], region: 'Setúbal', plot: true, dx: 9, dy: 8 },
    { name: 'Porto', coords: [-8.61, 41.15], region: 'Porto', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Leixões', coords: [-8.7, 41.19], region: 'Porto' },
    { name: 'Matosinhos', coords: [-8.69, 41.18], region: 'Porto' },
    { name: 'Braga', coords: [-8.43, 41.55], region: 'Braga', plot: true, dx: 9, dy: -4 },
    { name: 'Aveiro', coords: [-8.65, 40.64], region: 'Aveiro', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Marinha Grande', coords: [-8.93, 39.75], region: 'Leiria', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Coimbra', coords: [-8.43, 40.21], region: 'Coimbra' },
    { name: 'Figueira da Foz', coords: [-8.86, 40.15], region: 'Coimbra' },
    { name: 'Faro', coords: [-7.93, 37.02], region: 'Algarve', plot: true, dx: 9, dy: 8 },
  ],
  sectors: [
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery and vessel hydraulics for the Setúbal, Viana and Lisbon yards.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and batching-plant hydraulics — and the mould and tooling sector around Marinha Grande.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and precision valves for forming, moulding and machining lines.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for hydro, thermal and wind plant.' },
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Refinery and terminal support at Sines and the Lisbon estuary.' },
    { slug: 'mining', name: 'Mining', description: 'Copper and tin in the Alentejo — dust-rated, high-cycle components.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Portugal?', answer: 'No. Portugal is supplied from our Dubai warehouse, by sea through Suez and past Gibraltar into Sines, Lisbon or Leixões.' },
    {
      question: 'Why is Portugal further than Spain?',
      answer:
        'Because it is past Gibraltar rather than inside the Mediterranean. Valencia is roughly a Suez-to-Med run; Sines carries on into the Atlantic. It is only a few days, but it is the reason a Spanish port is sometimes the better gate for a northern Portuguese delivery.',
    },
    { question: 'Sines, Lisbon or Leixões?', answer: 'Sines takes the largest vessels and suits the south and the Alentejo; Lisbon for the estuary; Leixões for Porto and the industrial north, where the road leg from Sines is most of a day.' },
    { question: 'Do we need CE marking?', answer: 'For a hose assembly above the pressure-volume threshold in PED 2014/68/EU, yes, and the declaration travels with the goods. Below it, sound engineering practice applies and there is no mark.' },
    { question: 'Can you supply for mould and tooling machinery?', answer: 'Yes — precision valves and high-force cylinders for injection and forming plant. Tell us the cycle time and the duty rather than the part number, because that is what decides the seal choice.' },
    { question: 'Why buy from Dubai rather than locally?', answer: 'For a standard item you should not, and Iberian distribution is good. The narrow reason is the pattern held as stock — SS316L thread forms, API-monogrammed assemblies — usually for equipment being built here for export.' },
    { question: 'What currency do you quote in?', answer: 'EUR. Portugal is in the eurozone, so the Estimate, the invoice and the customs value all carry the same figure with nothing to convert.' },
    { question: 'What language do the documents need to be in?', answer: 'Portuguese, with the description agreeing across the invoice, the packing list and the declaration.' },
  ],
  compliance: {
    heading: 'Past Gibraltar, and the end of the line',
    body:
      'Portugal is the only western European market on this network that is not on the way to anywhere else, and that shapes the lane in one practical way: cargo carries on past Gibraltar into the Atlantic rather than stopping in the Mediterranean, which adds a few days over Valencia and occasionally makes a Spanish port the better gate for a northern Portuguese delivery. Sines itself is a serious deep-water port and takes the largest vessels; Leixões is the answer for Porto and the industrial north. Customs is the ordinary single entry into free circulation, with a declaration of conformity above the PED 2014/68/EU threshold and the REACH position on the compounds. The market behind it is compact and specific — moulds and tooling around Marinha Grande, shipyards, pulp and paper — where the useful question is cycle time and duty rather than a catalogue number.',
    documents: [
      { ref: 'PED', name: 'Declaration of conformity, assemblies above threshold', issuer: 'Us, as the assembler', when: 'Before dispatch' },
      { ref: 'REACH', name: 'Compound position on the elastomers supplied', issuer: 'Us, at quotation', when: 'At quotation' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'PL', name: 'Packing list in Portuguese, matching the declaration', issuer: 'Us, at dispatch', when: 'Before the vessel sails' },
      { ref: 'EU-ENTRY', name: 'Customs entry into free circulation', issuer: 'The importer, through Portuguese Customs', when: 'On arrival' },
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
  UNITED_KINGDOM,
  IRELAND,
  DENMARK,
  SWEDEN,
  FINLAND,
  ICELAND,
  AUSTRIA,
  SWITZERLAND,
  ITALY,
  FRANCE,
  SPAIN,
  PORTUGAL,
]
