import type { MarketPage } from './market-pages'

/**
 * Wave 2 — the export markets that had no page.
 *
 * Same template, same schema, same everything as `market-page-records.ts`.
 * What is different is where the content came from: the first 46 were written
 * against a design bundle that shipped them as data. These were authored here,
 * to the procedure in `design_handoff_market_pages_wave2/record-authoring.md`.
 *
 * EVERY RECORD LANDS `released: false` AND `regulatoryCopy: 'unverified'`.
 * That is not caution for its own sake — it is what the brief requires:
 * "Anything authored here inherits that status and must be flagged the same
 * way." A page stating a conformity scheme, a transit band and a port of entry
 * is making commercial promises, and none of these have been past a forwarder.
 * They render the plain layout until someone signs each one off in
 * /admin/markets.
 *
 * WHAT IS RESEARCHED FACT AND WHAT IS AN ESTIMATE, because the two are mixed
 * and a reviewer needs to know which is which:
 *
 *   Ports, border crossings, cities, administrative regions, coordinates,
 *   route geometry, dial codes, currencies, Natural Earth spellings
 *     — checkable public geography. Wrong here is a bug, not a judgement.
 *
 *   Conformity schemes and the bodies that run them — SIRIM, SNI, TISI,
 *   INMETRO, INEN, PS/ICC, EAC and the rest
 *     — real, named, current schemes. Their SCOPE over hydraulic hose and
 *       fittings specifically is the part a forwarder must confirm.
 *
 *   Transit bands and freight ladders
 *     — estimates from sailing distance and typical service patterns. The
 *       brief says as much about the first 46: "estimates a forwarder will
 *       want to correct". Treat every number in `freight` and every
 *       "Typical transit" as a starting position.
 *
 * BUILT IN CORRIDOR CLUSTERS, NOT ALPHABETICALLY. A cluster shares a lane, so
 * the route geometry, the conformity framing and the freight ladder are
 * researched once and the pages cross-link naturally. The section comments
 * below are those clusters; keep new markets grouped the same way.
 */

// ─────────────────────────────────────────────────────────────────────────────
// SOUTH-EAST ASIA — the Malacca lane
//
// Sea out of Jebel Ali, down the Gulf, across the Arabian Sea south of India
// and Sri Lanka, then through the Strait of Malacca. Singapore is the hub and
// the shortest lane in the cluster; everything else is either a direct call or
// a transhipment off it.
//
// The waypoints matter here more than usual: a straight line from Dubai to
// Jakarta crosses India. The shared legs below trace the real passage.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Spread a shared leg into a route, then append the market's own waypoints.
 *
 * The Arabian Sea passage is identical for every market in a cluster, and
 * retyping it ten times is how one of them ends up with a waypoint on land.
 */
function leg(shared: readonly (readonly [number, number])[], ...rest: [number, number][]): [number, number][] {
  return [...shared.map(([lon, lat]) => [lon, lat] as [number, number]), ...rest]
}

/** Jebel Ali out through Hormuz and across the Arabian Sea to the Malacca approach. */
const MALACCA_APPROACH = [
  [55.03, 25.01],
  [56.6, 26.55],
  [58.5, 24.0],
  [61.0, 21.5],
  [68.0, 17.0],
  [75.0, 8.5],
  [80.5, 5.5],
  [88.0, 4.5],
  [95.0, 5.0],
  [98.5, 3.5],
] as const

/** DXB out over the Arabian Sea to the Bay of Bengal — the shared air leg. */
const SEA_ASIA_AIR = [
  [55.36, 25.25],
  [65.0, 20.0],
  [78.0, 12.0],
  [92.0, 8.0],
] as const

const SINGAPORE: MarketPage = {
  slug: 'singapore',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → SG',
  dialCode: '+65',
  currency: 'USD',
  lede: 'Singapore is the shortest sea lane we run east of the Gulf and the one with the least paperwork in front of it. There is no general conformity scheme to satisfy for industrial hose and fittings, so the timeline is freight and nothing else — which makes it the lane where a stock order behaves most like a domestic one. It is also the market where a good part of what we ship does not stay: buyers here consolidate for rigs and yards across the region, and the packing list matters more than the customs file.',
  facts: [
    { label: 'Typical transit', value: 'Typically 12–16 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali to the Port of Singapore on a mainline service · Air freight into Changi where the schedule is tighter · Onward consolidation to the region handled by the buyer’s forwarder',
    },
    {
      label: 'Incoterms 2020',
      value: 'CIF Singapore · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder',
    },
    {
      label: 'Documentation',
      value:
        'Commercial invoice and packing list · Certificate of Origin, Dubai Chamber attested · TradeNet permit raised by the importer · No general product certification for hydraulic hose and fittings',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via Malacca' },
    { label: 'Port of entry', value: 'Port of Singapore' },
    { label: 'Transit', value: '12–16 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Singapore'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'PORT OF SINGAPORE', coords: [103.75, 1.26], legend: 'Port of entry', dx: 10, dy: 12, anchor: 'start' },
    routes: [
      {
        mode: 'SEA · MALACCA',
        primary: true,
        points: leg(MALACCA_APPROACH, [101.0, 2.2], [103.0, 1.3], [103.75, 1.26]),
      },
      {
        mode: 'AIR',
        points: leg(SEA_ASIA_AIR, [103.99, 1.35]),
      },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '12–16 days', route: 'Jebel Ali to Singapore, mainline', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '2–4 days', route: 'DXB to SIN', useCase: 'When the line is down' },
    { name: 'Sea, LCL', transit: '16–22 days', route: 'Consolidated out of Jebel Ali', useCase: 'Small mixed orders' },
  ],
  orderSteps: {
    third:
      'There is no certification step to wait on, so the documents are the invoice, the packing list and the Certificate of Origin, prepared while the order is picked.',
    fourth: 'Goods sail from Jebel Ali on a mainline service, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Jurong Island', coords: [103.68, 1.26], region: 'West Region', plot: true, dx: -9, dy: 8, anchor: 'end' },
    { name: 'Tuas', coords: [103.63, 1.32], region: 'West Region' },
    { name: 'Benoi', coords: [103.68, 1.32], region: 'West Region' },
    { name: 'Gul Circle', coords: [103.66, 1.3], region: 'West Region' },
    { name: 'Boon Lay', coords: [103.71, 1.34], region: 'West Region' },
    { name: 'Pasir Panjang', coords: [103.77, 1.28], region: 'Central Region', plot: true, dx: 9, dy: 10 },
    { name: 'Tanjong Pagar', coords: [103.84, 1.27], region: 'Central Region' },
    { name: 'Kallang', coords: [103.87, 1.31], region: 'Central Region', plot: true, dx: 9, dy: -4 },
    { name: 'Sungei Kadut', coords: [103.75, 1.41], region: 'North Region', plot: true, dx: -9, dy: -3, anchor: 'end' },
    { name: 'Woodlands', coords: [103.79, 1.44], region: 'North Region', plot: true, dx: 9, dy: -4 },
    { name: 'Senoko', coords: [103.79, 1.46], region: 'North Region' },
    { name: 'Seletar', coords: [103.87, 1.42], region: 'North-East Region' },
    { name: 'Ang Mo Kio', coords: [103.85, 1.37], region: 'North-East Region' },
    { name: 'Changi', coords: [103.99, 1.35], region: 'East Region', plot: true, dx: 9, dy: 4 },
    { name: 'Loyang', coords: [103.97, 1.37], region: 'East Region' },
    { name: 'Pioneer', coords: [103.7, 1.31], region: 'West Region' },
  ],
  sectors: [
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery, mooring and vessel hydraulics for the yards and the offshore support fleet.' },
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Rig refit and offshore fabrication work staged out of Jurong and Tuas.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and piling-rig hydraulics for reclamation and tunnelling contracts.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for gas turbine plant on Jurong Island.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for forming and fabrication lines.' },
    { slug: 'mining', name: 'Mining', description: 'Dust-rated, high-cycle components for aggregate and processing plant.' },
  ],
  faqs: [
    {
      question: 'Do you have a branch in Singapore?',
      answer:
        'No. Singapore is supplied from our Dubai warehouse. It is the shortest lane we run east of the Gulf, so a stock order behaves much like a local one, but the stock is in Dubai.',
    },
    {
      question: 'Is there a certification scheme we need to satisfy?',
      answer:
        'Not for hydraulic hose, fittings and adapters. Singapore regulates a defined list of controlled goods, and general industrial components are not on it. The importer raises a TradeNet permit; there is no product certificate to obtain first.',
    },
    {
      question: 'Why is this lane faster than the African ones?',
      answer:
        'Because it is a mainline service. Jebel Ali to Singapore is one of the busiest routings in the network, so sailings are frequent and there is no transhipment. Nothing about the paperwork is holding it up either.',
    },
    {
      question: 'Can you ship on to our yards in the region?',
      answer:
        'We quote to Singapore. Most buyers here consolidate and forward onward themselves, and their forwarder does it better than we would from Dubai. If you want us to quote a leg beyond Singapore we will, per consignment.',
    },
    {
      question: 'What currency do you quote in?',
      answer: 'USD. It is what the regional trade runs on and what most buyers here hold contracts in.',
    },
    {
      question: 'Can you supply to marine class requirements?',
      answer:
        'Yes, where the specification names one. Tell us the class society and the approval you need at quotation and we will say plainly whether the item carries it, rather than shipping and letting survey find out.',
    },
    {
      question: 'Do you crimp assemblies to length?',
      answer:
        'Yes, in Dubai, pressure-tested and tagged before packing. Send the bore, the thread and the pressure, or a photo of the failed assembly, and the length between fitting faces.',
    },
    {
      question: 'Is air freight worth it on this lane?',
      answer:
        'Rarely. Two to four days by air against twelve to sixteen by sea, on a lane where sailings are frequent, means air is for a line that is down rather than for a schedule that is tight.',
    },
  ],
  compliance: {
    heading: 'The lightest regime on the network',
    body:
      'Singapore does not operate a general conformity assessment scheme for industrial goods. Hydraulic hose, fittings, adapters and valves are not controlled goods, so there is no product certificate to obtain before shipment and no inspection to book. The importer raises a permit through TradeNet against the invoice and packing list, and customs clears against that. What this changes in practice is where the risk sits: on most of our lanes the paperwork is the variable and the freight is predictable, and here it is the other way round. Get the part list right and the lane does the rest.',
    documents: [
      { ref: 'INV', name: 'Commercial invoice and packing list', issuer: 'Us, at dispatch', when: 'Before the vessel sails' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'PERMIT', name: 'TradeNet import permit', issuer: 'The importer, through Singapore Customs', when: 'Before arrival' },
      { ref: 'BL', name: 'Bill of lading or air waybill', issuer: 'The carrier', when: 'On dispatch' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the order calls for them' },
    ],
  },
}

const MALAYSIA: MarketPage = {
  slug: 'malaysia',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → MY',
  dialCode: '+60',
  currency: 'USD',
  lede: 'Malaysia is two markets sharing one flag, and the thing to settle before we quote is which half you are in. Port Klang serves the peninsula and takes the mainline sailing out of Jebel Ali; Bintulu, Miri and Labuan serve the Borneo oil and gas belt and are a separate leg with its own schedule. Certification is the other variable: SIRIM covers a defined list of regulated products, and whether your line sits inside it decides if there is a certificate to obtain before the goods move.',
  facts: [
    { label: 'Typical transit', value: 'Typically 14–18 days by sea from dispatch to Port Klang' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali to Port Klang for the peninsula · Pasir Gudang for the Johor industrial belt · Bintulu, Miri or Labuan for Borneo, on a separate leg · Air freight into Kuala Lumpur where the schedule is tighter',
    },
    {
      label: 'Incoterms 2020',
      value: 'CIF Port Klang · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder',
    },
    {
      label: 'Documentation',
      value:
        'SIRIM certification where the product falls inside a regulated category · Certificate of Origin, Dubai Chamber attested · Customs declaration raised by the importer',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via Malacca' },
    { label: 'Port of entry', value: 'Port Klang' },
    { label: 'Transit', value: '14–18 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Malaysia'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'PORT KLANG', coords: [101.37, 3.0], legend: 'Port of entry', dx: -10, dy: 6, anchor: 'end' },
    routes: [
      { mode: 'SEA · MALACCA', primary: true, points: leg(MALACCA_APPROACH, [100.2, 4.2], [101.37, 3.0]) },
      { mode: 'AIR', points: leg(SEA_ASIA_AIR, [101.71, 2.75]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '14–18 days', route: 'Jebel Ali to Port Klang, mainline', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '2–4 days', route: 'DXB to KUL', useCase: 'When the line is down' },
    { name: 'Sea, to Borneo', transit: '22–30 days', route: 'Transhipped for Bintulu, Miri or Labuan', useCase: 'East Malaysia' },
  ],
  orderSteps: {
    third:
      'Where the line falls inside a SIRIM-regulated category the certification is arranged before the container is loaded; where it does not, we say so rather than charging for paperwork nobody needs.',
    fourth: 'Goods sail from Jebel Ali to Port Klang, or transhipped onward for Borneo, with the paperwork and tracking together.',
  },
  cities: [
    { name: 'Port Klang', coords: [101.37, 3.0], region: 'Selangor' },
    { name: 'Kuala Lumpur', coords: [101.69, 3.14], region: 'Federal Territory', plot: true, dx: 9, dy: -5 },
    { name: 'Shah Alam', coords: [101.53, 3.07], region: 'Selangor', plot: true, dx: -9, dy: 5, anchor: 'end' },
    { name: 'Pasir Gudang', coords: [103.88, 1.47], region: 'Johor', plot: true, dx: 9, dy: 8 },
    { name: 'Johor Bahru', coords: [103.76, 1.49], region: 'Johor' },
    { name: 'Prai', coords: [100.39, 5.35], region: 'Penang', plot: true, dx: -9, dy: -3, anchor: 'end' },
    { name: 'Ipoh', coords: [101.08, 4.6], region: 'Perak' },
    { name: 'Kuantan', coords: [103.33, 3.81], region: 'Pahang', plot: true, dx: 9, dy: 4 },
    { name: 'Kerteh', coords: [103.44, 4.53], region: 'Terengganu' },
    { name: 'Melaka', coords: [102.25, 2.19], region: 'Melaka' },
    { name: 'Seremban', coords: [101.94, 2.72], region: 'Negeri Sembilan' },
    { name: 'Miri', coords: [113.99, 4.4], region: 'Sarawak', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Bintulu', coords: [113.03, 3.17], region: 'Sarawak', plot: true, dx: 9, dy: 8 },
    { name: 'Labuan', coords: [115.24, 5.28], region: 'Federal Territory' },
    { name: 'Kota Kinabalu', coords: [116.07, 5.98], region: 'Sabah', plot: true, dx: 9, dy: -4 },
    { name: 'Lumut', coords: [100.63, 4.23], region: 'Perak' },
  ],
  sectors: [
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Offshore and onshore support for the Sarawak and Sabah fields and the Kerteh petrochemical belt.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery and vessel hydraulics for the Labuan and Pasir Gudang yards.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and piling-rig hydraulics for infrastructure work on the peninsula.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for gas turbine and hydro plant.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for rolling and forming lines.' },
    { slug: 'mining', name: 'Mining', description: 'Dust-rated, high-cycle components for quarry, cement and palm-processing plant.' },
  ],
  faqs: [
    {
      question: 'Do you have a branch in Malaysia?',
      answer: 'No. Malaysia is supplied from our Dubai warehouse, into Port Klang for the peninsula and on a separate leg for Borneo.',
    },
    {
      question: 'What is SIRIM and does it apply to us?',
      answer:
        'SIRIM is the certification body for products inside Malaysia’s regulated categories. Much of what we ship falls outside it. Send the part list at quotation and we will tell you which lines need a certificate and which do not, rather than certifying everything to be safe.',
    },
    {
      question: 'Port Klang or Pasir Gudang?',
      answer:
        'Port Klang for the Klang Valley and the west coast; Pasir Gudang if you sit in the Johor industrial belt, because the road leg from Klang is most of a day. It is worth naming the delivery town at quotation.',
    },
    {
      question: 'Can you deliver to Sarawak and Sabah?',
      answer:
        'Yes, to Bintulu, Miri, Labuan or Kota Kinabalu. It is a transhipped leg rather than the mainline sailing, so it runs a week or more longer than the peninsula and is quoted separately.',
    },
    {
      question: 'Why is Borneo slower than the peninsula?',
      answer:
        'Because there is no direct mainline call. Cargo for East Malaysia transhipes, usually at Singapore or Port Klang, and waits for a feeder. Planning around that is worth more than paying for air.',
    },
    {
      question: 'What currency do you quote in?',
      answer: 'USD. It is what the regional trade runs on and what most Malaysian importers hold supply contracts in.',
    },
    {
      question: 'Can you supply API-monogrammed equipment?',
      answer:
        'Yes. API 6A wellhead, API 16A BOP, API 16C choke and kill and API 7K drilling hose, with NACE MR0175 material documentation where the contract requires it.',
    },
    {
      question: 'Do you crimp assemblies to length?',
      answer:
        'Yes, in Dubai, pressure-tested and tagged before packing. Send bore, thread and pressure, or a photo of the failed assembly, plus the length between fitting faces.',
    },
  ],
  compliance: {
    heading: 'Which half of the country, and whether SIRIM applies',
    body:
      'Two things decide how a Malaysian consignment behaves, and neither is freight. The first is geography: Port Klang and Pasir Gudang take the mainline sailing, and East Malaysia does not — Bintulu, Miri, Labuan and Kota Kinabalu are fed by transhipment and run materially longer. The second is scope. Malaysia regulates a defined list of products through SIRIM; a great deal of industrial hose, fittings and adapters sits outside that list, and where it does there is no certificate to obtain and nothing to wait for. Where a line is inside scope the certification is arranged at origin before loading. Both questions are answered from the part list and the delivery town, which is why we ask for them at quotation rather than at order.',
    documents: [
      { ref: 'SIRIM', name: 'Certificate of approval, where in scope', issuer: 'SIRIM QAS International', when: 'At quotation, per product' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'K1', name: 'Customs import declaration', issuer: 'The importer, through Royal Malaysian Customs', when: 'Before arrival' },
      { ref: 'BL', name: 'Bill of lading or air waybill', issuer: 'The carrier', when: 'On dispatch' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the order calls for them' },
    ],
  },
}

const INDONESIA: MarketPage = {
  slug: 'indonesia',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → ID',
  dialCode: '+62',
  currency: 'USD',
  localName: 'Republik Indonesia',
  lede: 'Indonesia is the lane where the last hundred kilometres cost more planning than the first eight thousand. Containers reach Tanjung Priok in about three weeks, and then the question is which island the goods are actually for — Balikpapan, Dumai and Sorong are each another sailing beyond Jakarta. Ahead of all of it sits the importer licence and, for regulated lines, an SNI mark that has to exist before the goods arrive rather than after.',
  facts: [
    { label: 'Typical transit', value: 'Typically 18–24 days by sea from dispatch to Jakarta' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali to Tanjung Priok for Java · Belawan for Sumatra · Balikpapan and Sorong for the eastern fields, on a further leg · Air freight into Jakarta where the schedule is tighter',
    },
    {
      label: 'Incoterms 2020',
      value: 'CIF Tanjung Priok · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder',
    },
    {
      label: 'Documentation',
      value:
        'Importer identification number and the matching licence category · SNI marking where the product is regulated · Certificate of Origin, Dubai Chamber attested · Customs declaration raised by the importer',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via Malacca' },
    { label: 'Port of entry', value: 'Tanjung Priok · Jakarta' },
    { label: 'Transit', value: '18–24 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Indonesia'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'TANJUNG PRIOK', coords: [106.88, -6.1], legend: 'Port of entry', dx: 10, dy: 12, anchor: 'start' },
    routes: [
      {
        mode: 'SEA · MALACCA',
        primary: true,
        points: leg(MALACCA_APPROACH, [101.0, 2.2], [103.5, 0.2], [105.0, -2.6], [106.3, -5.2], [106.88, -6.1]),
      },
      { mode: 'AIR', points: leg(SEA_ASIA_AIR, [100.0, 2.0], [106.66, -6.13]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '18–24 days', route: 'Jebel Ali to Tanjung Priok', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '3–5 days', route: 'DXB to CGK', useCase: 'When the line is down' },
    { name: 'Sea, outer islands', transit: '26–36 days', route: 'Transhipped for Balikpapan, Dumai or Sorong', useCase: 'Beyond Java' },
  ],
  orderSteps: {
    third:
      'The importer licence category has to cover the goods, and where a line carries an SNI requirement the marking is arranged before the container is loaded.',
    fourth: 'Goods sail from Jebel Ali to Tanjung Priok, or transhipped onward for the outer islands, with the paperwork and tracking together.',
  },
  cities: [
    { name: 'Jakarta', coords: [106.85, -6.21], region: 'DKI Jakarta', plot: true, dx: -9, dy: 10, anchor: 'end' },
    { name: 'Cilegon', coords: [106.05, -6.02], region: 'Banten' },
    { name: 'Bandung', coords: [107.62, -6.92], region: 'West Java' },
    { name: 'Semarang', coords: [110.42, -6.97], region: 'Central Java' },
    { name: 'Surabaya', coords: [112.75, -7.25], region: 'East Java', plot: true, dx: 9, dy: 8 },
    { name: 'Cilacap', coords: [109.01, -7.72], region: 'Central Java' },
    { name: 'Medan', coords: [98.67, 3.59], region: 'North Sumatra', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Dumai', coords: [101.45, 1.67], region: 'Riau', plot: true, dx: 9, dy: -4 },
    { name: 'Duri', coords: [101.2, 1.28], region: 'Riau' },
    { name: 'Palembang', coords: [104.75, -2.99], region: 'South Sumatra' },
    { name: 'Batam', coords: [104.03, 1.13], region: 'Riau Islands' },
    { name: 'Balikpapan', coords: [116.83, -1.24], region: 'East Kalimantan', plot: true, dx: 9, dy: 4 },
    { name: 'Bontang', coords: [117.5, 0.13], region: 'East Kalimantan' },
    { name: 'Banjarmasin', coords: [114.59, -3.32], region: 'South Kalimantan' },
    { name: 'Makassar', coords: [119.42, -5.15], region: 'South Sulawesi', plot: true, dx: 9, dy: 8 },
    { name: 'Sorong', coords: [131.26, -0.88], region: 'Southwest Papua', plot: true, dx: -9, dy: -4, anchor: 'end' },
  ],
  sectors: [
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Upstream support for the Kalimantan, Riau and Papua fields, and the Cilacap and Dumai refineries.' },
    { slug: 'mining', name: 'Mining', description: 'Coal and nickel plant across Kalimantan and Sulawesi — dust-rated, high-cycle components.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery and vessel hydraulics for the offshore support fleet and the Batam yards.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for coal-fired and gas turbine plant.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and batching-plant hydraulics for infrastructure contracts.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for the Cilegon rolling and forming lines.' },
  ],
  faqs: [
    {
      question: 'Do you have a branch in Indonesia?',
      answer: 'No. Indonesia is supplied from our Dubai warehouse, into Tanjung Priok, with the outer islands reached on a further leg.',
    },
    {
      question: 'What is SNI and who arranges it?',
      answer:
        'SNI is the Indonesian national standard. It is mandatory for a defined list of products and voluntary elsewhere. Where a line is inside the mandatory list, the marking is obtained at origin before shipment; where it is not, there is nothing to obtain. The part list decides which, so send it at quotation.',
    },
    {
      question: 'What do you need from us before shipping?',
      answer:
        'Your importer identification number and the licence category it carries. If the category does not cover the goods, the consignment cannot clear no matter how the rest of the file looks.',
    },
    {
      question: 'Why does the delivery island matter so much?',
      answer:
        'Because only Java and Sumatra are on the direct sailing. Balikpapan, Makassar and Sorong are reached by transhipment onto a domestic feeder, which adds a week or more and is quoted separately. Name the town, not the country.',
    },
    {
      question: 'Can you deliver to the Kalimantan mine sites?',
      answer:
        'Yes, on DAP terms to the base or the site gate. The leg beyond Balikpapan or Banjarmasin is quoted rather than estimated, because road conditions and the wet season move it materially.',
    },
    {
      question: 'What currency do you quote in?',
      answer: 'USD. Import contracts here are almost always in dollars, and quoting in anything else creates work at your bank.',
    },
    {
      question: 'Can you supply API-monogrammed equipment?',
      answer:
        'Yes. API 6A wellhead, API 16A BOP, API 16C choke and kill and API 7K drilling hose, with NACE MR0175 material documentation where the contract requires it.',
    },
    {
      question: 'Is air freight worth it on this lane?',
      answer:
        'For a line that is down, yes — three to five days against three weeks. For a scheduled shutdown it rarely is, because the certification and licence steps do not move any faster for arriving by air.',
    },
  ],
  compliance: {
    heading: 'The licence first, then the standard, then the island',
    body:
      'An Indonesian consignment has three gates and they are not in the order people expect. The importer identification number and its licence category come first: if the category does not cover the goods, nothing else in the file matters. Second is SNI — mandatory for a defined list of products, voluntary elsewhere, and obtained at origin before shipment where it applies. Third, and the one that most often surprises a first-time shipper, is the destination island. Tanjung Priok and Belawan sit on the direct sailing; Balikpapan, Makassar, Banjarmasin and Sorong are reached by transhipment onto a domestic feeder, which adds a week or more that no amount of paperwork speed recovers. All three are answered from the part list, the licence and the delivery town.',
    documents: [
      { ref: 'API-U', name: 'Importer identification number and licence category', issuer: 'The importer', when: 'Before anything else' },
      { ref: 'SNI', name: 'SNI marking, where the product is regulated', issuer: 'Accredited certification body', when: 'At quotation, per product' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'PIB', name: 'Customs import declaration', issuer: 'The importer, through Bea Cukai', when: 'Before arrival' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the order calls for them' },
    ],
  },
}

const VIETNAM: MarketPage = {
  slug: 'vietnam',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → VN',
  dialCode: '+84',
  currency: 'USD',
  localName: 'Việt Nam',
  lede: 'Vietnam is a long country with two industrial ends and one decision to make before anything ships: north or south. Cai Mep serves Ho Chi Minh City and the southern belt; Hai Phong serves Hanoi and the northern parks, and the road between them is seventeen hundred kilometres. Landing a consignment at the wrong end is not a delay, it is a second freight bill. The conformity file itself is light by regional standards — the customs declaration and a conformity statement where the line is regulated.',
  facts: [
    { label: 'Typical transit', value: 'Typically 18–24 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali to Cai Mep for the south · Hai Phong for the north · Da Nang for the centre · Air freight into Ho Chi Minh City or Hanoi where the schedule is tighter',
    },
    {
      label: 'Incoterms 2020',
      value: 'CIF Cai Mep or Hai Phong · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder',
    },
    {
      label: 'Documentation',
      value:
        'Customs declaration raised by the importer · Declaration of conformity where the line is regulated · Certificate of Origin, Dubai Chamber attested · Import tax and VAT settled at clearance',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via Malacca' },
    { label: 'Port of entry', value: 'Cai Mep · Ho Chi Minh City' },
    { label: 'Transit', value: '18–24 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Vietnam'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'CAI MEP · PORT', coords: [107.03, 10.53], legend: 'Port of entry', dx: 11, dy: 10, anchor: 'start' },
    routes: [
      {
        mode: 'SEA · MALACCA',
        primary: true,
        points: leg(MALACCA_APPROACH, [101.0, 2.2], [103.6, 1.2], [105.0, 4.0], [106.2, 8.0], [107.03, 10.53]),
      },
      { mode: 'AIR', points: leg(SEA_ASIA_AIR, [100.0, 10.0], [106.66, 10.82]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '18–24 days', route: 'Jebel Ali to Cai Mep or Hai Phong', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '3–5 days', route: 'DXB to SGN or HAN', useCase: 'When the line is down' },
    { name: 'Sea, LCL', transit: '24–32 days', route: 'Consolidated, with transhipment', useCase: 'Small mixed orders' },
  ],
  orderSteps: {
    third:
      'The port is fixed against the delivery town rather than assumed, and the conformity declaration is prepared where the line is regulated, before the container is loaded.',
    fourth: 'Goods sail from Jebel Ali to the port that serves your end of the country, with the paperwork and tracking together.',
  },
  cities: [
    { name: 'Ho Chi Minh City', coords: [106.63, 10.82], region: 'Southern region', plot: true, dx: -9, dy: 8, anchor: 'end' },
    { name: 'Vung Tau', coords: [107.08, 10.35], region: 'Ba Ria–Vung Tau' },
    { name: 'Bien Hoa', coords: [106.82, 10.95], region: 'Dong Nai' },
    { name: 'Thu Dau Mot', coords: [106.65, 11.0], region: 'Binh Duong' },
    { name: 'Long An', coords: [106.41, 10.54], region: 'Long An' },
    { name: 'Can Tho', coords: [105.78, 10.03], region: 'Mekong Delta', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Da Nang', coords: [108.22, 16.05], region: 'Central region', plot: true, dx: 9, dy: 4 },
    { name: 'Dung Quat', coords: [108.77, 15.39], region: 'Quang Ngai' },
    { name: 'Quy Nhon', coords: [109.22, 13.78], region: 'Binh Dinh' },
    { name: 'Nghi Son', coords: [105.78, 19.35], region: 'Thanh Hoa' },
    { name: 'Vinh', coords: [105.68, 18.68], region: 'Nghe An' },
    { name: 'Hanoi', coords: [105.83, 21.03], region: 'Northern region', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Hai Phong', coords: [106.68, 20.86], region: 'Hai Phong', plot: true, dx: 9, dy: 6 },
    { name: 'Ha Long', coords: [107.08, 20.95], region: 'Quang Ninh' },
    { name: 'Bac Ninh', coords: [106.08, 21.19], region: 'Bac Ninh' },
    { name: 'Thai Nguyen', coords: [105.85, 21.59], region: 'Thai Nguyen' },
  ],
  sectors: [
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Offshore support out of Vung Tau and the Dung Quat and Nghi Son refineries.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery and vessel hydraulics for the Hai Phong and Vung Tau yards.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for the Nghi Son and Thai Nguyen rolling lines.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and piling-rig hydraulics for the industrial parks and metro works.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for coal-fired, gas and hydro plant.' },
    { slug: 'mining', name: 'Mining', description: 'Dust-rated, high-cycle components for the Quang Ninh coal belt and cement plant.' },
  ],
  faqs: [
    {
      question: 'Do you have a branch in Vietnam?',
      answer: 'No. Vietnam is supplied from our Dubai warehouse, into Cai Mep for the south or Hai Phong for the north.',
    },
    {
      question: 'North or south — which port should we use?',
      answer:
        'Whichever end you are actually at. Cai Mep serves Ho Chi Minh City, Binh Duong and the delta; Hai Phong serves Hanoi and the northern parks. The two are seventeen hundred kilometres apart by road, so landing at the wrong one is a second freight bill, not a delay.',
    },
    {
      question: 'What certification do we need?',
      answer:
        'Less than most of the region. There is no blanket pre-shipment scheme for industrial hose and fittings. Where a line falls under a technical regulation a declaration of conformity is required, and we prepare it at origin. Otherwise the file is the invoice, the packing list and the origin certificate.',
    },
    {
      question: 'Can you deliver to Da Nang and the centre?',
      answer:
        'Yes. Da Nang takes a direct call on some services and a transhipment on others, so we quote it against the actual sailing rather than assuming. For Dung Quat and Quy Nhon the road leg from Da Nang is usually the better answer.',
    },
    {
      question: 'How long does customs take?',
      answer:
        'The declaration itself is quick where the classification is clean. What causes delay is a description that does not match the invoice, or an HS code the importer and the declaration disagree on — which is why we state the classification line by line at quotation.',
    },
    {
      question: 'What currency do you quote in?',
      answer: 'USD. It is what import contracts here are written in and what the bank will settle against.',
    },
    {
      question: 'Do you crimp assemblies to length?',
      answer:
        'Yes, in Dubai, pressure-tested and tagged before packing. Send bore, thread and pressure, or a photo of the failed assembly, plus the length between fitting faces.',
    },
    {
      question: 'Can you supply API-monogrammed equipment?',
      answer:
        'Yes. API 6A wellhead, API 16A BOP, API 16C choke and kill and API 7K drilling hose, with NACE MR0175 material documentation where the contract requires it.',
    },
  ],
  compliance: {
    heading: 'The port choice is the decision, not the paperwork',
    body:
      'Vietnam is unusual on this network in that the conformity file is the easy part. There is no blanket pre-shipment certification scheme covering industrial hose, fittings and adapters; where a specific line falls under a technical regulation a declaration of conformity is prepared at origin, and otherwise the file is the invoice, the packing list, the origin certificate and a clean customs declaration. What actually decides whether a consignment behaves is geography. Cai Mep serves the southern industrial belt and Hai Phong the northern one, and the two are most of two days apart by road. We fix the port against the delivery town at quotation rather than defaulting to the south, because correcting it after the vessel sails costs a second freight bill.',
    documents: [
      { ref: 'DECL', name: 'Customs import declaration', issuer: 'The importer, through Vietnam Customs', when: 'Before arrival' },
      { ref: 'DOC', name: 'Declaration of conformity, where the line is regulated', issuer: 'Prepared at origin', when: 'Before the vessel sails' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'BL', name: 'Bill of lading or air waybill', issuer: 'The carrier', when: 'On dispatch' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the order calls for them' },
    ],
  },
}


const THAILAND: MarketPage = {
  slug: 'thailand',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → TH',
  dialCode: '+66',
  currency: 'USD',
  localName: 'ประเทศไทย',
  lede: 'Thailand is the most predictable lane in the region and the one where the customs classification does the most work. Containers sail from Jebel Ali round the peninsula into Laem Chabang, and the eastern seaboard — Rayong, Map Ta Phut, Chonburi — is an hour beyond the gate. TISI regulates a defined list of products, and most industrial hose and fittings sit outside it, so the question worth settling early is the tariff line rather than the certificate.',
  facts: [
    { label: 'Typical transit', value: 'Typically 18–24 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali to Laem Chabang for the eastern seaboard · Bangkok Port for the city and the central plain · Songkhla for the south · Air freight into Bangkok where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'CIF Laem Chabang · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'Customs declaration raised by the importer · TISI certification where the product is on the regulated list · Certificate of Origin, Dubai Chamber attested',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via Malacca' },
    { label: 'Port of entry', value: 'Laem Chabang' },
    { label: 'Transit', value: '18–24 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Thailand'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'LAEM CHABANG', coords: [100.88, 13.08], legend: 'Port of entry', dx: 11, dy: 10, anchor: 'start' },
    routes: [
      {
        mode: 'SEA · MALACCA',
        primary: true,
        points: leg(MALACCA_APPROACH, [101.0, 2.2], [104.2, 2.0], [104.6, 5.5], [102.5, 9.0], [100.9, 12.0], [100.88, 13.08]),
      },
      { mode: 'AIR', points: leg(SEA_ASIA_AIR, [98.0, 12.0], [100.75, 13.69]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '18–24 days', route: 'Jebel Ali to Laem Chabang', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '3–5 days', route: 'DXB to BKK', useCase: 'When the line is down' },
    { name: 'Sea, LCL', transit: '24–32 days', route: 'Consolidated, with transhipment', useCase: 'Small mixed orders' },
  ],
  orderSteps: {
    third:
      'The tariff classification is fixed line by line and, where a product falls on the TISI regulated list, the certification is arranged before the container is loaded.',
    fourth: 'Goods sail from Jebel Ali to Laem Chabang, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Bangkok', coords: [100.5, 13.75], region: 'Bangkok', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Laem Chabang', coords: [100.88, 13.08], region: 'Chonburi' },
    { name: 'Chonburi', coords: [100.98, 13.36], region: 'Chonburi' },
    { name: 'Rayong', coords: [101.28, 12.68], region: 'Rayong', plot: true, dx: 9, dy: 8 },
    { name: 'Map Ta Phut', coords: [101.15, 12.68], region: 'Rayong' },
    { name: 'Samut Prakan', coords: [100.6, 13.6], region: 'Samut Prakan' },
    { name: 'Chachoengsao', coords: [101.07, 13.69], region: 'Chachoengsao' },
    { name: 'Prachinburi', coords: [101.37, 14.05], region: 'Prachinburi' },
    { name: 'Ayutthaya', coords: [100.59, 14.35], region: 'Ayutthaya', plot: true, dx: 9, dy: -4 },
    { name: 'Saraburi', coords: [100.91, 14.53], region: 'Saraburi' },
    { name: 'Nakhon Ratchasima', coords: [102.1, 14.97], region: 'Nakhon Ratchasima', plot: true, dx: 9, dy: 4 },
    { name: 'Khon Kaen', coords: [102.83, 16.44], region: 'Khon Kaen', plot: true, dx: 9, dy: 4 },
    { name: 'Chiang Mai', coords: [98.99, 18.79], region: 'Chiang Mai', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Songkhla', coords: [100.6, 7.19], region: 'Songkhla', plot: true, dx: 9, dy: 4 },
    { name: 'Hat Yai', coords: [100.47, 7.01], region: 'Songkhla' },
    { name: 'Surat Thani', coords: [99.33, 9.14], region: 'Surat Thani' },
  ],
  sectors: [
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Refinery and petrochemical support across the Map Ta Phut and Rayong estates.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for rolling and forming lines on the eastern seaboard.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and batching-plant hydraulics for the corridor infrastructure programme.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for gas turbine and combined-cycle plant.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery and vessel hydraulics for the Gulf of Thailand support fleet.' },
    { slug: 'mining', name: 'Mining', description: 'Dust-rated, high-cycle components for cement, gypsum and quarry plant.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Thailand?', answer: 'No. Thailand is supplied from our Dubai warehouse, into Laem Chabang for the eastern seaboard or Bangkok Port for the central plain.' },
    {
      question: 'What is TISI and does it apply to us?',
      answer:
        'TISI is the Thai Industrial Standards Institute. It regulates a defined list of products, and most hydraulic hose, fittings and adapters are not on it. Send the part list at quotation and we will say which lines are in scope rather than certifying everything.',
    },
    {
      question: 'Laem Chabang or Bangkok Port?',
      answer:
        'Laem Chabang if you are on the eastern seaboard, which most industrial buyers are — it is deeper, busier and closer to Rayong and Map Ta Phut. Bangkok Port only if the delivery sits in the city or the central plain.',
    },
    {
      question: 'What causes delays at clearance here?',
      answer:
        'Almost always the tariff classification. A description that does not match the declared code holds a consignment while it is queried, so we state the classification line by line at quotation rather than leaving it to the broker.',
    },
    { question: 'Can you deliver to the eastern seaboard estates?', answer: 'Yes, on DAP terms to the plant gate at Map Ta Phut, Rayong or Chonburi. It is a short road leg from the port and it is priced, not estimated.' },
    { question: 'What currency do you quote in?', answer: 'USD. It is what import contracts here are written in, and quoting in anything else creates work at your bank.' },
    {
      question: 'Can you supply sour-service material documentation?',
      answer: 'Yes. NACE MR0175 / ISO 15156 documentation where the contract requires it, stated at quotation rather than produced after the fact.',
    },
    { question: 'Do you crimp assemblies to length?', answer: 'Yes, in Dubai, pressure-tested and tagged before packing. Send bore, thread and pressure, or a photo of the failed assembly, plus the length between fitting faces.' },
  ],
  compliance: {
    heading: 'The tariff line matters more than the certificate',
    body:
      'Thailand regulates a defined list of products through TISI, and the great majority of hydraulic hose, fittings, adapters and valves sits outside it — so on most consignments there is no certificate to obtain and nothing to wait for. What does hold cargo is classification. Thai customs query a description that does not sit comfortably with the declared tariff code, and a queried consignment waits at the port while it is resolved. That is a paperwork problem with a paperwork answer: we fix the classification line by line at quotation, state it on the invoice, and the broker declares what we shipped rather than what he guesses we shipped. Where a line genuinely falls inside the TISI list, the certification is arranged at origin before loading.',
    documents: [
      { ref: 'DECL', name: 'Customs import declaration', issuer: 'The importer, through Thai Customs', when: 'Before arrival' },
      { ref: 'TISI', name: 'TISI certification, where the product is listed', issuer: 'Thai Industrial Standards Institute', when: 'At quotation, per product' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'BL', name: 'Bill of lading or air waybill', issuer: 'The carrier', when: 'On dispatch' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the order calls for them' },
    ],
  },
}

const PHILIPPINES: MarketPage = {
  slug: 'philippines',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → PH',
  dialCode: '+63',
  currency: 'USD',
  localName: 'Pilipinas',
  lede: 'The Philippines is an archipelago served by one main gate, and the honest version of this lane says so early. Containers reach Manila or Batangas in about three weeks, and anything for Cebu, Davao or Cagayan de Oro is another domestic sailing after that. The regulated-product scheme — the PS licence and the ICC mark — covers a defined list, and whether your line sits inside it is worth settling at quotation rather than at the pier.',
  facts: [
    { label: 'Typical transit', value: 'Typically 19–25 days by sea from dispatch to Manila' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali to Manila for Luzon · Batangas where the northern port is congested · Cebu, Davao and Cagayan de Oro on a further domestic leg · Air freight into Manila where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'CIF Manila · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'PS licence or ICC clearance where the product is on the regulated list · Certificate of Origin, Dubai Chamber attested · Import entry raised by the importer through the Bureau of Customs',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via Malacca' },
    { label: 'Port of entry', value: 'Manila · Luzon' },
    { label: 'Transit', value: '19–25 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Philippines'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'MANILA · PORT', coords: [120.96, 14.6], legend: 'Port of entry', dx: -11, dy: 8, anchor: 'end' },
    routes: [
      {
        mode: 'SEA · MALACCA',
        primary: true,
        points: leg(MALACCA_APPROACH, [101.0, 2.2], [104.5, 2.5], [109.0, 7.0], [114.0, 11.0], [119.0, 14.0], [120.96, 14.6]),
      },
      { mode: 'AIR', points: leg(SEA_ASIA_AIR, [105.0, 14.0], [121.02, 14.51]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '19–25 days', route: 'Jebel Ali to Manila or Batangas', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '3–5 days', route: 'DXB to MNL', useCase: 'When the line is down' },
    { name: 'Sea, outer islands', transit: '26–35 days', route: 'Transhipped for Cebu, Davao or Cagayan de Oro', useCase: 'Beyond Luzon' },
  ],
  orderSteps: {
    third: 'Where a line falls under the PS or ICC scheme the clearance is arranged before the container is loaded; where it does not, we say so rather than building cost around it.',
    fourth: 'Goods sail from Jebel Ali to Manila, or transhipped onward for the Visayas and Mindanao, with the paperwork and tracking together.',
  },
  cities: [
    { name: 'Manila', coords: [120.98, 14.6], region: 'Metro Manila' },
    { name: 'Quezon City', coords: [121.04, 14.68], region: 'Metro Manila', plot: true, dx: 9, dy: -5 },
    { name: 'Cavite', coords: [120.9, 14.48], region: 'Calabarzon' },
    { name: 'Laguna', coords: [121.33, 14.28], region: 'Calabarzon', plot: true, dx: 9, dy: 6 },
    { name: 'Batangas', coords: [121.05, 13.76], region: 'Calabarzon', plot: true, dx: -9, dy: 8, anchor: 'end' },
    { name: 'Bataan', coords: [120.47, 14.68], region: 'Central Luzon' },
    { name: 'Subic', coords: [120.28, 14.79], region: 'Central Luzon' },
    { name: 'Clark', coords: [120.56, 15.19], region: 'Central Luzon', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Cebu', coords: [123.89, 10.32], region: 'Central Visayas', plot: true, dx: 9, dy: 4 },
    { name: 'Mactan', coords: [123.98, 10.31], region: 'Central Visayas' },
    { name: 'Iloilo', coords: [122.57, 10.72], region: 'Western Visayas' },
    { name: 'Bacolod', coords: [122.95, 10.68], region: 'Western Visayas' },
    { name: 'Davao', coords: [125.61, 7.07], region: 'Davao Region', plot: true, dx: 9, dy: 4 },
    { name: 'General Santos', coords: [125.17, 6.11], region: 'Soccsksargen' },
    { name: 'Cagayan de Oro', coords: [124.65, 8.48], region: 'Northern Mindanao', plot: true, dx: 9, dy: -4 },
    { name: 'Zamboanga', coords: [122.08, 6.91], region: 'Zamboanga Peninsula' },
  ],
  sectors: [
    { slug: 'mining', name: 'Mining', description: 'Nickel and copper plant across Mindanao and the Caraga region — dust-rated, high-cycle components.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for coal-fired, geothermal and diesel plant.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery and vessel hydraulics for the Subic and Cebu yards and the inter-island fleet.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and batching-plant hydraulics for the infrastructure programme.' },
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Refinery and terminal support at Batangas and Limay.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for forming and fabrication lines.' },
  ],
  faqs: [
    { question: 'Do you have a branch in the Philippines?', answer: 'No. The Philippines is supplied from our Dubai warehouse, into Manila or Batangas, with the outer islands reached on a further domestic leg.' },
    {
      question: 'What is the PS licence and the ICC mark?',
      answer:
        'They are the two routes through the Philippine regulated-product scheme — a licence held by the manufacturer, or a per-shipment clearance. They apply to a defined list of products, and much of what we ship is outside it. The part list decides which, so send it at quotation.',
    },
    { question: 'Manila or Batangas?', answer: 'Manila for most of Luzon. Batangas is the better answer when Manila is congested or the delivery sits south of the capital, and it is worth naming the town so we can choose rather than default.' },
    {
      question: 'Can you deliver to Cebu, Davao and the mine sites?',
      answer: 'Yes. Beyond Luzon is a transhipment onto a domestic feeder, which adds a week or more and is quoted separately. The leg from the regional port to a mine site is quoted rather than estimated.',
    },
    { question: 'Why does the delivery island matter?', answer: 'Because only Luzon is on the international sailing. Cargo for the Visayas and Mindanao waits for a domestic vessel, and that wait is longer than anything the paperwork adds.' },
    { question: 'What currency do you quote in?', answer: 'USD. Import contracts here are written in dollars and the bank will settle against them.' },
    { question: 'Can you supply API-monogrammed equipment?', answer: 'Yes. API 6A wellhead, API 16A BOP, API 16C choke and kill and API 7K drilling hose, with NACE MR0175 material documentation where the contract requires it.' },
    { question: 'Is air freight worth it on this lane?', answer: 'For a line that is down, yes. For a planned shutdown rarely, because the domestic leg to an outer island does not move any faster for having arrived by air.' },
  ],
  compliance: {
    heading: 'One gate, then a domestic sailing',
    body:
      'Two things shape a Philippine consignment. The first is the regulated-product scheme: a defined list requires either a PS licence held by the manufacturer or an ICC clearance issued per shipment, and a great deal of industrial hose and fittings falls outside it entirely. We settle which at quotation from the part list rather than certifying broadly to be safe. The second, and the one that actually decides the arrival date, is that the international sailing reaches Luzon and nowhere else. Cebu, Davao, Iloilo and Cagayan de Oro are served by a domestic feeder, and that leg adds a week or more regardless of how clean the file is. Naming the delivery city rather than the country is what lets us quote the real date.',
    documents: [
      { ref: 'PS/ICC', name: 'PS licence or ICC clearance, where the product is listed', issuer: 'Bureau of Philippine Standards', when: 'At quotation, per product' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'SAD', name: 'Import entry and internal revenue declaration', issuer: 'The importer, through the Bureau of Customs', when: 'Before arrival' },
      { ref: 'BL', name: 'Bill of lading or air waybill', issuer: 'The carrier', when: 'On dispatch' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the order calls for them' },
    ],
  },
}

const CAMBODIA: MarketPage = {
  slug: 'cambodia',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → KH',
  dialCode: '+855',
  currency: 'USD',
  localName: 'កម្ពុជា',
  lede: 'Cambodia has its own deep-water port at Sihanoukville, and for a lot of consignments it is still not the right answer. Direct calls from the Gulf are infrequent, so a container often waits for a feeder longer than it would spend on the road from Ho Chi Minh City. We quote both and say which is faster for the actual order rather than defaulting to the national port because it is the national port. The paperwork itself is light; the routing is the decision.',
  facts: [
    { label: 'Typical transit', value: 'Typically 24–32 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali to Sihanoukville, transhipped · Or to Ho Chi Minh City and overland through Bavet, often faster · Air freight into Phnom Penh where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'CIF Sihanoukville · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'Customs declaration raised by the importer · Vietnamese transit documents where the routing is overland · Certificate of Origin, Dubai Chamber attested',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, transhipped' },
    { label: 'Port of entry', value: 'Sihanoukville' },
    { label: 'Transit', value: '24–32 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Cambodia'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'SIHANOUKVILLE', coords: [103.52, 10.63], legend: 'Port of entry', dx: -11, dy: 10, anchor: 'end' },
    routes: [
      {
        mode: 'SEA · TRANSHIP',
        primary: true,
        points: leg(MALACCA_APPROACH, [101.0, 2.2], [104.2, 2.0], [104.6, 5.5], [104.0, 8.5], [103.52, 10.63]),
      },
      { mode: 'ROAD VIA VN', points: [[107.03, 10.53], [106.63, 10.82], [106.15, 11.09], [104.92, 11.55]] },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '24–32 days', route: 'Jebel Ali to Sihanoukville, transhipped', useCase: 'Default for full loads' },
    { name: 'Air freight', transit: '4–6 days', route: 'DXB to PNH', useCase: 'When the line is down' },
    { name: 'Sea + road via Vietnam', transit: '22–28 days', route: 'Cai Mep, then overland through Bavet', useCase: 'Often the faster route' },
  ],
  orderSteps: {
    third: 'The routing is fixed against the actual sailing schedule — Sihanoukville direct or Ho Chi Minh City and overland — and the transit documents follow whichever we choose.',
    fourth: 'Goods sail from Jebel Ali, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Phnom Penh', coords: [104.92, 11.55], region: 'Phnom Penh', plot: true, dx: 9, dy: -4 },
    { name: 'Sihanoukville', coords: [103.52, 10.63], region: 'Preah Sihanouk' },
    { name: 'Kandal', coords: [104.95, 11.22], region: 'Kandal' },
    { name: 'Takeo', coords: [104.79, 10.99], region: 'Takeo' },
    { name: 'Kampot', coords: [104.18, 10.61], region: 'Kampot', plot: true, dx: 9, dy: 8 },
    { name: 'Koh Kong', coords: [103.0, 11.62], region: 'Koh Kong', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Bavet', coords: [106.13, 11.09], region: 'Svay Rieng', plot: true, dx: 9, dy: 6 },
    { name: 'Svay Rieng', coords: [105.8, 11.09], region: 'Svay Rieng' },
    { name: 'Kampong Cham', coords: [105.45, 11.99], region: 'Kampong Cham', plot: true, dx: 9, dy: -4 },
    { name: 'Battambang', coords: [103.19, 13.1], region: 'Battambang', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Siem Reap', coords: [103.86, 13.36], region: 'Siem Reap', plot: true, dx: 9, dy: -4 },
    { name: 'Poipet', coords: [102.56, 13.66], region: 'Banteay Meanchey' },
  ],
  sectors: [
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and batching-plant hydraulics for the Phnom Penh and special economic zone build-out.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for hydro and diesel generation.' },
    { slug: 'mining', name: 'Mining', description: 'Dust-rated, high-cycle components for cement and quarry plant.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery and vessel hydraulics for the Sihanoukville and river fleet.' },
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Terminal and bulk-handling support at Sihanoukville.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'Cylinders and valves for fabrication and forming lines.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Cambodia?', answer: 'No. Cambodia is supplied from our Dubai warehouse, either into Sihanoukville or overland from Ho Chi Minh City.' },
    {
      question: 'Sihanoukville or overland from Vietnam?',
      answer:
        'Whichever is actually faster for the order in front of us. Direct calls at Sihanoukville are infrequent, so a container can wait for a feeder longer than the road leg from Cai Mep takes. We price both rather than assuming the national port.',
    },
    { question: 'What certification do we need?', answer: 'There is no general pre-shipment conformity scheme for industrial hose and fittings. The file is the invoice, the packing list, the origin certificate and a clean customs declaration.' },
    { question: 'What do you need from us before shipping?', answer: 'The delivery town and whether you can clear at Bavet. If the overland routing is the faster one, the Vietnamese transit documents have to be arranged before the container leaves Cai Mep.' },
    { question: 'How long does the overland leg take?', answer: 'Ho Chi Minh City to Phnom Penh is a day on the road once cleared. The variable is the border, not the distance, which is why we quote the leg rather than estimating it.' },
    { question: 'What currency do you quote in?', answer: 'USD, which is also what a great deal of Cambodian commerce is transacted in.' },
    { question: 'Is there a minimum order?', answer: 'No, but on a lane with infrequent sailings a small consignment can wait a long time for a feeder. It is often worth batching, and we will say so rather than shipping something that will sit.' },
    { question: 'Do you crimp assemblies to length?', answer: 'Yes, in Dubai, pressure-tested and tagged before packing. Send bore, thread and pressure, or a photo of the failed assembly, plus the length between fitting faces.' },
  ],
  compliance: {
    heading: 'The routing is the decision, not the paperwork',
    body:
      'Cambodia has a light import regime for industrial goods — no general pre-shipment conformity scheme, no product certificate to obtain, a customs declaration against the invoice and packing list. What decides whether a consignment behaves is the route. Sihanoukville is the national deep-water port and the obvious answer, but direct calls from the Gulf are infrequent and a container routed there can spend longer waiting for a feeder than the whole overland leg from Ho Chi Minh City would take. The alternative carries its own cost: Vietnamese transit documents, a border crossing at Bavet, and a road leg to price. Neither is right in general. We quote both against the actual sailing schedule for the order in hand.',
    documents: [
      { ref: 'DECL', name: 'Customs import declaration', issuer: 'The importer, through the General Department of Customs', when: 'Before arrival' },
      { ref: 'TRANSIT', name: 'Vietnamese transit documents, on the overland routing', issuer: 'The forwarder, at Cai Mep', when: 'Before the road leg' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'BL', name: 'Bill of lading or air waybill', issuer: 'The carrier', when: 'On dispatch' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the order calls for them' },
    ],
  },
}

const LAOS: MarketPage = {
  slug: 'laos',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → LA',
  dialCode: '+856',
  currency: 'USD',
  localName: 'ລາວ',
  lede: 'Laos is landlocked and the sea leg is the predictable half. Containers discharge at Laem Chabang in Thailand and cross at Thanaleng into Vientiane, and it is that second leg — Thai transit formalities, a bonded move, a border that keeps its own hours — that sets the arrival date. Nothing about the routing is unusual; what it needs is naming honestly, because a page that quotes only the sea time is quoting half the journey.',
  facts: [
    { label: 'Typical transit', value: 'Typically 28–36 days from dispatch, sea and road combined' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali to Laem Chabang, then bonded road through Thanaleng · Da Nang and the east–west corridor for Savannakhet · Air freight into Vientiane where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'DAP to the buyer’s site · CIF Laem Chabang · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'Thai transit documents for the bonded move · Lao customs declaration raised by the importer · Certificate of Origin, Dubai Chamber attested',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea + road' },
    { label: 'Border crossing', value: 'Thanaleng · Nong Khai' },
    { label: 'Transit', value: '28–36 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Laos'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'THANALENG · NONG KHAI', coords: [102.7, 17.9], dx: -11, dy: 10, anchor: 'end' },
    routes: [
      {
        mode: 'SEA + ROAD',
        primary: true,
        points: leg(MALACCA_APPROACH, [101.0, 2.2], [104.2, 2.0], [104.6, 5.5], [102.5, 9.0], [100.9, 12.0], [100.88, 13.08], [100.9, 14.2], [101.6, 15.6], [102.7, 17.9]),
      },
      { mode: 'AIR', points: leg(SEA_ASIA_AIR, [98.0, 14.0], [102.56, 17.99]) },
    ],
  },
  freight: [
    { name: 'Sea + road', transit: '28–36 days', route: 'Laem Chabang, then bonded through Thanaleng', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '4–7 days', route: 'DXB to VTE, usually via Bangkok', useCase: 'When the line is down' },
    { name: 'Sea + road, southern', transit: '30–40 days', route: 'Da Nang and the east–west corridor for Savannakhet', useCase: 'Southern provinces' },
  ],
  orderSteps: {
    third: 'The Thai transit documents for the bonded move are arranged alongside the Lao declaration before the container is loaded, because the border will not improvise either of them.',
    fourth: 'Goods sail to Laem Chabang and move north under bond, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Vientiane', coords: [102.6, 17.97], region: 'Vientiane Prefecture', plot: true, dx: 9, dy: -5 },
    { name: 'Thanaleng', coords: [102.7, 17.9], region: 'Vientiane Province' },
    { name: 'Vang Vieng', coords: [102.45, 18.92], region: 'Vientiane Province' },
    { name: 'Luang Prabang', coords: [102.14, 19.89], region: 'Luang Prabang', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Boten', coords: [101.68, 21.18], region: 'Luang Namtha', plot: true, dx: 9, dy: -4 },
    { name: 'Muang Xay', coords: [101.99, 20.69], region: 'Oudomxay' },
    { name: 'Thakhek', coords: [104.82, 17.41], region: 'Khammouane', plot: true, dx: 9, dy: 4 },
    { name: 'Savannakhet', coords: [104.75, 16.56], region: 'Savannakhet', plot: true, dx: 9, dy: 6 },
    { name: 'Xepon', coords: [106.24, 16.68], region: 'Savannakhet' },
    { name: 'Pakse', coords: [105.78, 15.12], region: 'Champasak', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Champasak', coords: [105.87, 14.9], region: 'Champasak' },
    { name: 'Attapeu', coords: [106.83, 14.81], region: 'Attapeu' },
  ],
  sectors: [
    { slug: 'mining', name: 'Mining', description: 'Copper and gold plant in Savannakhet and the southern provinces — dust-rated, high-cycle components.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for the hydro programme on the Mekong and its tributaries.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and batching-plant hydraulics for road, rail and dam works.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'Cylinders and valves for fabrication and forming lines.' },
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Fuel terminal and bulk-handling support at Vientiane and Savannakhet.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery and winch hydraulics for the Mekong river fleet.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Laos?', answer: 'No. Laos is supplied from our Dubai warehouse, by sea to Laem Chabang in Thailand and then under bond across the border at Thanaleng.' },
    {
      question: 'Why is the transit so much longer than Thailand’s?',
      answer:
        'Because the road leg is a second journey with its own formalities. The sea time to Laem Chabang is the same eighteen to twenty-four days; the extra week or more is Thai transit clearance, the bonded move north and the border itself.',
    },
    { question: 'What certification do we need?', answer: 'There is no general pre-shipment conformity scheme for industrial hose and fittings. What has to be right is the transit file — the Thai documents for the bonded move and the Lao declaration.' },
    { question: 'Can you deliver to the southern provinces?', answer: 'Yes. For Savannakhet and Pakse the east–west corridor from Da Nang is sometimes the better routing than coming south from Vientiane. We compare both rather than defaulting.' },
    { question: 'What is the real variable on this lane?', answer: 'The border, not the distance. Thanaleng keeps its own hours and a file that is short one document waits for the next working day. That is why the transit documents are prepared before the vessel sails, not on arrival.' },
    { question: 'Can you deliver to the mine sites?', answer: 'Yes, on DAP terms to the site gate. The leg beyond Savannakhet or Pakse is quoted rather than estimated, because road conditions in the wet season move it materially.' },
    { question: 'What currency do you quote in?', answer: 'USD. It is what import contracts here are written in and it avoids a second conversion at the Thai transit stage.' },
    { question: 'Is air freight worth it?', answer: 'For a line that is down, yes — four to seven days against five weeks. It is the largest gap between air and surface on the network, which is exactly why the surface route needs planning rather than rescue.' },
  ],
  compliance: {
    heading: 'The border sets the date, not the sailing',
    body:
      'Laos has no general pre-shipment conformity scheme, so nothing about the product needs certifying before it moves. The file that matters is the transit file. A container discharges at Laem Chabang and travels north to Thanaleng under Thai bond, which means Thai transit documents raised against the same invoice and packing list the Lao declaration will be made on. Those two have to agree line for line; where they do not, the consignment stops at the border rather than at either customs office, and the border keeps its own hours. Everything about this lane that can be planned is on the paperwork side, and it is all preparable before the vessel sails — which is why we do it then rather than on arrival.',
    documents: [
      { ref: 'TRANSIT', name: 'Thai transit declaration for the bonded move', issuer: 'The forwarder, at Laem Chabang', when: 'Before the road leg' },
      { ref: 'DECL', name: 'Lao customs import declaration', issuer: 'The importer, through Lao Customs', when: 'Before arrival at the border' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'BL', name: 'Bill of lading', issuer: 'The carrier', when: 'On dispatch' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the order calls for them' },
    ],
  },
}

const BRUNEI: MarketPage = {
  slug: 'brunei',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → BN',
  dialCode: '+673',
  currency: 'USD',
  localName: 'Brunei Darussalam',
  lede: 'Brunei is a small market with a specific one: almost everything that matters here is oil and gas, onshore at Seria and offshore beyond it. Muara takes a transhipped call rather than a mainline sailing, so the schedule is the constraint and batching an order is usually worth more than paying for air. The import file is straightforward; what the buyer here is actually buying is the specification, and that is where the page earns its place.',
  facts: [
    { label: 'Typical transit', value: 'Typically 24–32 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali to Muara, transhipped through Singapore or Port Klang · Air freight into Bandar Seri Begawan where the schedule is tighter · Kota Kinabalu and road where the feeder schedule is poor',
    },
    { label: 'Incoterms 2020', value: 'CIF Muara · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value: 'Customs declaration raised by the importer · Certificate of Origin, Dubai Chamber attested · Material and test certificates where the specification calls for them',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, transhipped' },
    { label: 'Port of entry', value: 'Muara' },
    { label: 'Transit', value: '24–32 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Brunei'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'MUARA · PORT', coords: [115.07, 5.02], legend: 'Port of entry', dx: 11, dy: 10, anchor: 'start' },
    routes: [
      {
        mode: 'SEA · TRANSHIP',
        primary: true,
        points: leg(MALACCA_APPROACH, [101.0, 2.2], [104.5, 2.0], [108.0, 3.0], [112.0, 4.0], [115.07, 5.02]),
      },
      { mode: 'AIR', points: leg(SEA_ASIA_AIR, [105.0, 6.0], [114.93, 4.94]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '24–32 days', route: 'Jebel Ali to Muara, transhipped', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '4–6 days', route: 'DXB to BWN, usually via Singapore', useCase: 'When the line is down' },
    { name: 'Sea + road via Sabah', transit: '26–34 days', route: 'Kota Kinabalu, then road', useCase: 'When the feeder schedule is poor' },
  ],
  orderSteps: {
    third: 'The specification is confirmed line by line — class, material grade and monogram where the contract names one — and the documents are prepared before the container is loaded.',
    fourth: 'Goods sail from Jebel Ali and tranship for Muara, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Bandar Seri Begawan', coords: [114.94, 4.9], region: 'Brunei-Muara', plot: true, dx: -9, dy: 8, anchor: 'end' },
    { name: 'Muara', coords: [115.07, 5.02], region: 'Brunei-Muara' },
    { name: 'Jerudong', coords: [114.8, 4.94], region: 'Brunei-Muara' },
    { name: 'Seria', coords: [114.33, 4.61], region: 'Belait', plot: true, dx: -9, dy: 4, anchor: 'end' },
    { name: 'Kuala Belait', coords: [114.19, 4.58], region: 'Belait', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Panaga', coords: [114.31, 4.6], region: 'Belait' },
    { name: 'Anduki', coords: [114.36, 4.62], region: 'Belait' },
    { name: 'Sungai Liang', coords: [114.51, 4.68], region: 'Belait', plot: true, dx: 9, dy: 8 },
    { name: 'Lumut', coords: [114.45, 4.66], region: 'Belait' },
    { name: 'Tutong', coords: [114.66, 4.8], region: 'Tutong', plot: true, dx: 9, dy: -4 },
    { name: 'Bangar', coords: [115.07, 4.71], region: 'Temburong', plot: true, dx: 9, dy: 6 },
    { name: 'Temburong', coords: [115.14, 4.6], region: 'Temburong' },
  ],
  sectors: [
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Onshore and offshore support for the Seria field and the Lumut liquefaction plant.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery and vessel hydraulics for the offshore support fleet out of Muara.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for gas turbine generation.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and piling-rig hydraulics for infrastructure contracts.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'Cylinders and valves for fabrication and pipe-handling equipment.' },
    { slug: 'mining', name: 'Mining', description: 'Dust-rated, high-cycle components for aggregate and cement plant.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Brunei?', answer: 'No. Brunei is supplied from our Dubai warehouse, transhipped into Muara.' },
    { question: 'Why does it take longer than Malaysia?', answer: 'Because Muara does not take a mainline call. Cargo transhipes at Singapore or Port Klang and waits for a feeder, and that wait is most of the difference.' },
    { question: 'What certification do we need?', answer: 'There is no general pre-shipment conformity scheme for industrial hose and fittings. The file is the invoice, the packing list, the origin certificate and the customs declaration.' },
    {
      question: 'Can you supply to the field specification?',
      answer:
        'That is usually the real question here. Tell us the specification the contract names — API monogram, NACE MR0175 material, a class approval — and we will say plainly whether the item carries it rather than shipping and letting inspection find out.',
    },
    { question: 'Can you deliver to Seria and Kuala Belait?', answer: 'Yes, on DAP terms to the base or the plant gate. It is a short road leg from Muara and it is priced, not estimated.' },
    { question: 'Is it worth batching orders?', answer: 'Usually, yes. On a lane fed by transhipment a small consignment waits as long as a large one, so consolidating a month of requirements often lands sooner than shipping each item as it is raised.' },
    { question: 'What currency do you quote in?', answer: 'USD. It is what the oil and gas supply contracts here are written in.' },
    { question: 'Can you supply API-monogrammed equipment?', answer: 'Yes. API 6A wellhead, API 16A BOP, API 16C choke and kill and API 7K drilling hose, with NACE MR0175 material documentation where the contract requires it.' },
  ],
  compliance: {
    heading: 'The specification is the hard part, not the customs file',
    body:
      'Brunei imports industrial goods on a straightforward file: a customs declaration against the invoice and packing list, an attested certificate of origin, and no general pre-shipment conformity scheme to satisfy. That makes it unusual on this network, and it moves the difficulty somewhere else. Almost every buyer here is buying against an oil and gas specification — an API monogram, a NACE MR0175 material requirement, a class approval — and the consignment that causes trouble is the one where the part meets the description but not the specification. We confirm that line by line at quotation and say plainly where an item does not carry an approval, because inspection at the Seria gate is an expensive place to discover it. The other planning item is the schedule: Muara is fed by transhipment, so batching is usually worth more than speed.',
    documents: [
      { ref: 'DECL', name: 'Customs import declaration', issuer: 'The importer, through Royal Customs and Excise', when: 'Before arrival' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the specification calls for them' },
      { ref: 'API', name: 'Monogram and licence documentation', issuer: 'The manufacturer', when: 'At quotation, per product' },
      { ref: 'BL', name: 'Bill of lading or air waybill', issuer: 'The carrier', when: 'On dispatch' },
    ],
  },
}

const TIMOR_LESTE: MarketPage = {
  slug: 'timor-leste',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → TL',
  dialCode: '+670',
  currency: 'USD',
  localName: 'Timór Lorosa’e',
  lede: 'Timor-Leste is the smallest market on this network and the one where a simple consignment clears far more easily than a clever one. Dili is reached by feeder out of Singapore or Surabaya, so sailings are infrequent and the schedule, not the paperwork, sets the date. What moves smoothly here is a packing list that matches the invoice line for line and descriptions that say what something is rather than quoting an internal code — none of which anybody publishes as a requirement.',
  facts: [
    { label: 'Typical transit', value: 'Typically 28–38 days by sea from dispatch' },
    {
      label: 'Freight',
      value: 'Sea freight from Jebel Ali to Dili, transhipped through Singapore or Surabaya · Air freight into Dili where the schedule is tighter, usually via Singapore or Darwin',
    },
    { label: 'Incoterms 2020', value: 'CIF Dili · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value: 'Customs declaration raised by the importer · Certificate of Origin, Dubai Chamber attested · Documents in Portuguese or English · Pre-shipment inspection where the destination requires it',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, transhipped' },
    { label: 'Port of entry', value: 'Dili' },
    { label: 'Transit', value: '28–38 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Timor-Leste'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'DILI · PORT', coords: [125.57, -8.55], legend: 'Port of entry', dx: 11, dy: -8, anchor: 'start' },
    routes: [
      {
        mode: 'SEA · TRANSHIP',
        primary: true,
        points: leg(MALACCA_APPROACH, [101.0, 2.2], [103.5, 0.2], [106.0, -4.0], [112.0, -7.0], [119.0, -8.6], [125.57, -8.55]),
      },
      { mode: 'AIR', points: leg(SEA_ASIA_AIR, [103.99, 1.35], [125.53, -8.55]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '28–38 days', route: 'Jebel Ali to Dili, transhipped', useCase: 'Default for full loads' },
    { name: 'Air freight', transit: '5–8 days', route: 'DXB to DIL via Singapore or Darwin', useCase: 'When the line is down' },
    { name: 'Sea, LCL', transit: '34–45 days', route: 'Consolidated, with two transhipments', useCase: 'Small mixed orders' },
  ],
  orderSteps: {
    third: 'The consignment is built to be easy to reconcile — packing list matching the invoice line for line, plain descriptions, no partial deliveries splitting one order across two arrivals.',
    fourth: 'Goods sail from Jebel Ali and tranship for Dili, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Dili', coords: [125.57, -8.56], region: 'Dili', plot: true, dx: 9, dy: -5 },
    { name: 'Tibar', coords: [125.44, -8.55], region: 'Liquiçá', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Liquiçá', coords: [125.34, -8.59], region: 'Liquiçá' },
    { name: 'Manatuto', coords: [126.01, -8.51], region: 'Manatuto', plot: true, dx: 9, dy: 6 },
    { name: 'Baucau', coords: [126.46, -8.47], region: 'Baucau', plot: true, dx: 9, dy: -4 },
    { name: 'Lospalos', coords: [127.0, -8.52], region: 'Lautém' },
    { name: 'Viqueque', coords: [126.36, -8.86], region: 'Viqueque' },
    { name: 'Same', coords: [125.65, -9.0], region: 'Manufahi', plot: true, dx: 9, dy: 8 },
    { name: 'Suai', coords: [125.26, -9.31], region: 'Cova Lima', plot: true, dx: -9, dy: 8, anchor: 'end' },
    { name: 'Ainaro', coords: [125.51, -9.0], region: 'Ainaro' },
    { name: 'Maliana', coords: [125.22, -8.99], region: 'Bobonaro' },
    { name: 'Oecusse', coords: [124.35, -9.2], region: 'Oecusse' },
  ],
  sectors: [
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Offshore hydrocarbon support and the onshore supply base programme at Suai.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery and vessel hydraulics for the Dili and Tibar port fleet.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and batching-plant hydraulics for road and port infrastructure.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for the Hera and Betano generating plant.' },
    { slug: 'mining', name: 'Mining', description: 'Dust-rated, high-cycle components for aggregate and cement plant.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'Cylinders and valves for fabrication and workshop equipment.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Timor-Leste?', answer: 'No. Timor-Leste is supplied from our Dubai warehouse, transhipped into Dili.' },
    { question: 'Why is this the longest lane in the region?', answer: 'Because Dili is fed by a feeder rather than a mainline call, often after a second transhipment. The sea distance is not the problem; the sailing frequency is.' },
    {
      question: 'What certification do we need?',
      answer:
        'There is no general pre-shipment conformity scheme for industrial hose and fittings. Where a specific contract or a lender requires pre-shipment inspection we arrange it, but it is not a standing requirement.',
    },
    {
      question: 'What actually causes problems at clearance?',
      answer:
        'Reconciliation, not regulation. A packing list that does not match the invoice line for line, or a description quoting an internal part code rather than saying what the item is, causes questions in a chain that handles low volumes. We build the consignment to avoid that.',
    },
    { question: 'Can you split an order across two shipments?', answer: 'We would rather not. A partial delivery splits one order across two arrivals and two declarations, which is the single most common cause of delay here. If the order has to be split we will say so and price both legs.' },
    { question: 'What language do the documents need to be in?', answer: 'Portuguese or English are both accepted. We issue in English and match the description wording exactly across the invoice, the packing list and the declaration.' },
    { question: 'What currency do you quote in?', answer: 'USD, which is also the currency in circulation in Timor-Leste.' },
    { question: 'Is there a minimum order?', answer: 'No, but on a lane with this sailing frequency batching is worth real time. We will tell you when an item is better added to next month’s consignment than shipped on its own.' },
  ],
  compliance: {
    heading: 'A simple consignment clears more easily than a clever one',
    body:
      'Timor-Leste has no general pre-shipment conformity scheme for industrial goods, so there is nothing to certify before shipment and the file is short. What makes a consignment move is different, and none of it is published as a requirement: a packing list that reconciles to the invoice line for line, descriptions that say what an item is rather than quoting an internal code, and one order arriving as one consignment rather than split across two vessels and two declarations. Where a clearance chain handles low volumes, the shipments that move are the ones that are easy to check. We would rather build the consignment that way from the outset than optimise it for our own picking convenience and leave the difficulty at the other end. The other honest thing to say is the schedule: Dili is fed by feeder, and batching often lands sooner than shipping each line as it is raised.',
    documents: [
      { ref: 'DECL', name: 'Customs import declaration', issuer: 'The importer, through Timor-Leste Customs', when: 'Before arrival' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'PSI', name: 'Pre-shipment inspection, where required by contract', issuer: 'The appointed inspection agency', when: 'Before the vessel sails' },
      { ref: 'BL', name: 'Bill of lading or air waybill', issuer: 'The carrier', when: 'On dispatch' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the order calls for them' },
    ],
  },
}


export const MARKET_PAGE_RECORDS_2: readonly MarketPage[] = [
  SINGAPORE,
  MALAYSIA,
  INDONESIA,
  VIETNAM,
  THAILAND,
  PHILIPPINES,
  CAMBODIA,
  LAOS,
  BRUNEI,
  TIMOR_LESTE,
]

