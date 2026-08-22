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


export const MARKET_PAGE_RECORDS_2: readonly MarketPage[] = [
  SINGAPORE,
  MALAYSIA,
  INDONESIA,
  VIETNAM,
]
