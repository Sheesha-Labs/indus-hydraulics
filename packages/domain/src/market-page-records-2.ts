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


// ─────────────────────────────────────────────────────────────────────────────
// SOUTH AMERICA — the Cape and the canal
//
// The network's only westward sea routes, and there is no single one. Atlantic-
// coast markets round the Cape of Good Hope and cross the South Atlantic.
// Pacific-coast markets carry on to a Caribbean or Brazilian hub, tranship, and
// transit the Panama Canal — which is why these are the longest lanes on the
// network and why the air leg, long-haul with at least one connection, is less
// competitive here than on any African route.
//
// Documents are in Spanish across the continent and Portuguese in Brazil. That
// is the same requirement that shapes the Angola and Mozambique pages, and it
// shapes these the same way: a description that reads correctly in translation,
// agreed before the vessel sails rather than argued at the pier.
// ─────────────────────────────────────────────────────────────────────────────

/** Jebel Ali round the Cape of Good Hope and across the South Atlantic. */
const CAPE_TO_SOUTH_ATLANTIC = [
  [55.03, 25.01],
  [56.6, 26.55],
  [59.9, 22.3],
  [57.0, 15.5],
  [52.0, 8.0],
  [45.0, -2.0],
  [42.0, -10.0],
  [37.0, -22.0],
  [30.0, -33.0],
  [20.0, -35.5],
  [8.0, -34.0],
  [-5.0, -30.0],
  [-20.0, -26.0],
] as const

/** DXB west-about over Africa and the Atlantic — the shared long-haul air leg. */
const SOUTH_AMERICA_AIR = [
  [55.36, 25.25],
  [40.0, 15.0],
  [20.0, 5.0],
  [0.0, -2.0],
  [-25.0, -10.0],
] as const

const BRAZIL: MarketPage = {
  slug: 'brazil',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → BR',
  dialCode: '+55',
  currency: 'USD',
  localName: 'Brasil',
  lede: 'Brazil is the largest market on this side of the network and the one where the customs file does the most work. Containers round the Cape of Good Hope and cross the South Atlantic to Santos, or to Rio and Macaé when the cargo is for the offshore basins. Ahead of the freight sits the importer’s registration and, where a line is regulated, INMETRO certification — which is obtained against the product rather than the shipment, so it is worth knowing early whether your parts are inside its scope.',
  facts: [
    { label: 'Typical transit', value: 'Typically 32–42 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali round the Cape to Santos for general cargo · Rio de Janeiro and Macaé for the offshore basins · Suape and Salvador for the north-east · Air freight into São Paulo where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'CIF Santos · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'Importer registration and licence where the line requires one · INMETRO certification where the product is regulated · Certificate of Origin, Dubai Chamber attested · Documents in Portuguese',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via the Cape' },
    { label: 'Port of entry', value: 'Santos · São Paulo' },
    { label: 'Transit', value: '32–42 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Brazil'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'SANTOS · PORT', coords: [-46.31, -23.96], legend: 'Port of entry', dx: 11, dy: 10, anchor: 'start' },
    routes: [
      { mode: 'SEA · CAPE', primary: true, points: leg(CAPE_TO_SOUTH_ATLANTIC, [-35.0, -24.0], [-42.0, -24.0], [-46.31, -23.96]) },
      { mode: 'AIR', points: leg(SOUTH_AMERICA_AIR, [-46.47, -23.43]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '32–42 days', route: 'Jebel Ali to Santos, via the Cape', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '5–8 days', route: 'DXB to GRU, with a connection', useCase: 'When the line is down' },
    { name: 'Sea, LCL', transit: '40–52 days', route: 'Consolidated, with transhipment', useCase: 'Small mixed orders' },
  ],
  orderSteps: {
    third:
      'The importer’s registration is confirmed to cover the goods and, where a line falls inside INMETRO scope, the certification is arranged before the container is loaded.',
    fourth: 'Goods sail from Jebel Ali round the Cape, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Santos', coords: [-46.33, -23.96], region: 'São Paulo' },
    { name: 'São Paulo', coords: [-46.63, -23.55], region: 'São Paulo', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Campinas', coords: [-47.06, -22.91], region: 'São Paulo' },
    { name: 'Rio de Janeiro', coords: [-43.17, -22.91], region: 'Rio de Janeiro', plot: true, dx: 9, dy: 6 },
    { name: 'Macaé', coords: [-41.79, -22.37], region: 'Rio de Janeiro', plot: true, dx: 9, dy: -4 },
    { name: 'Belo Horizonte', coords: [-43.94, -19.92], region: 'Minas Gerais', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Vitória', coords: [-40.34, -20.32], region: 'Espírito Santo' },
    { name: 'Salvador', coords: [-38.5, -12.97], region: 'Bahia', plot: true, dx: 9, dy: 4 },
    { name: 'Suape', coords: [-34.95, -8.39], region: 'Pernambuco', plot: true, dx: 9, dy: 4 },
    { name: 'Fortaleza', coords: [-38.54, -3.73], region: 'Ceará' },
    { name: 'São Luís', coords: [-44.31, -2.53], region: 'Maranhão' },
    { name: 'Belém', coords: [-48.5, -1.46], region: 'Pará', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Manaus', coords: [-60.02, -3.12], region: 'Amazonas', plot: true, dx: 9, dy: 4 },
    { name: 'Curitiba', coords: [-49.27, -25.43], region: 'Paraná' },
    { name: 'Paranaguá', coords: [-48.51, -25.52], region: 'Paraná' },
    { name: 'Porto Alegre', coords: [-51.23, -30.03], region: 'Rio Grande do Sul', plot: true, dx: -9, dy: 6, anchor: 'end' },
  ],
  sectors: [
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Pre-salt offshore support out of Macaé and Rio, and the refinery estates at Suape and Duque de Caxias.' },
    { slug: 'mining', name: 'Mining', description: 'Iron ore and bauxite plant across Minas Gerais and Pará — dust-rated, high-cycle components.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery and vessel hydraulics for the offshore support fleet and the southern yards.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for the Minas and Espírito Santo rolling lines.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for hydro and thermal generation.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and batching-plant hydraulics for infrastructure contracts.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Brazil?', answer: 'No. Brazil is supplied from our Dubai warehouse, round the Cape of Good Hope into Santos, Rio or Suape depending on where the goods are for.' },
    {
      question: 'What is INMETRO and does it apply to us?',
      answer:
        'INMETRO runs Brazil’s conformity assessment programmes. They cover a defined list of products, and much industrial hose and fittings sits outside it. Certification attaches to the product rather than the shipment, so it is worth settling at quotation — the answer holds for every future order of the same line.',
    },
    {
      question: 'Why does it take six weeks?',
      answer:
        'Because the routing is round the Cape of Good Hope and then across the South Atlantic. There is no short way from the Gulf to Brazil. That is why the certification and registration work costs nothing in time if it is done while the order is picked.',
    },
    { question: 'Santos, Rio or Suape?', answer: 'Santos for general cargo and the São Paulo industrial belt; Rio or Macaé when the goods are for the offshore basins; Suape or Salvador for the north-east. Naming the delivery city lets us pick rather than default to Santos.' },
    { question: 'What do you need from us before shipping?', answer: 'Your importer registration and whether it covers the tariff lines on the order. If it does not, the consignment cannot clear however clean the rest of the file is.' },
    { question: 'What language do the documents need to be in?', answer: 'Portuguese. The description has to agree across the invoice, the packing list and the declaration, and we fix the wording at quotation rather than letting a translation drift at the pier.' },
    { question: 'Can you supply API-monogrammed equipment?', answer: 'Yes. API 6A wellhead, API 16A BOP, API 16C choke and kill and API 7K drilling hose, with NACE MR0175 material documentation where the contract requires it.' },
    { question: 'What currency do you quote in?', answer: 'USD. It is what the import licence and the exchange contract are raised in, so quoting in anything else creates work at your bank.' },
  ],
  compliance: {
    heading: 'The registration first, then the standard, then the translation',
    body:
      'Brazil checks who is importing before it checks what is being imported. The importer’s registration and its licence coverage come first: if the tariff lines on the order sit outside what the registration allows, nothing else in the file matters. Second is INMETRO, which runs conformity programmes over a defined list of products — much industrial hose and fittings is outside it, and where a line is inside, the certification attaches to the product rather than the consignment, so it is obtained once and holds for every future order. Third is language. The documents are in Portuguese and the description has to agree across the invoice, the packing list and the declaration; a translation that drifts between them is queried, and a queried consignment waits at a port six weeks from Dubai. All three are settled at quotation.',
    documents: [
      { ref: 'RADAR', name: 'Importer registration and licence coverage', issuer: 'The importer, through Receita Federal', when: 'Before anything else' },
      { ref: 'INMETRO', name: 'Conformity certification, where the product is regulated', issuer: 'Accredited certification body', when: 'At quotation, per product' },
      { ref: 'LI', name: 'Import licence, where the tariff line requires one', issuer: 'The importer, through Siscomex', when: 'Before the vessel sails' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the order calls for them' },
    ],
  },
}

const GUYANA: MarketPage = {
  slug: 'guyana',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → GY',
  dialCode: '+592',
  currency: 'USD',
  lede: 'Guyana is the newest offshore province on this network and the worst served. The Stabroek developments have pulled in a supply chain faster than the local one has grown, so a great deal arrives from Trinidad or Houston at short notice and a premium. Georgetown takes a feeder rather than a mainline call, which makes planning worth more here than anywhere else on the continent — an order batched a month ahead lands for a fraction of what the same parts cost flown in against a rig date.',
  facts: [
    { label: 'Typical transit', value: 'Typically 35–45 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali round the Cape, transhipped through Trinidad or a Caribbean hub, to Georgetown · Air freight into Georgetown where the schedule is tighter, with at least one connection',
    },
    { label: 'Incoterms 2020', value: 'CIF Georgetown · DAP to the buyer’s site or shore base · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'Customs declaration raised by the importer · Certificate of Origin, Dubai Chamber attested · Material and test certificates where the operator’s specification calls for them',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, transhipped' },
    { label: 'Port of entry', value: 'Georgetown' },
    { label: 'Transit', value: '35–45 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Guyana'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'GEORGETOWN · PORT', coords: [-58.17, 6.82], legend: 'Port of entry', dx: 11, dy: -8, anchor: 'start' },
    routes: [
      {
        mode: 'SEA · TRANSHIP',
        primary: true,
        points: leg(CAPE_TO_SOUTH_ATLANTIC, [-32.0, -12.0], [-38.0, -2.0], [-48.0, 4.0], [-55.0, 7.5], [-58.17, 6.82]),
      },
      { mode: 'AIR', points: leg(SOUTH_AMERICA_AIR, [-45.0, 0.0], [-58.25, 6.5]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '35–45 days', route: 'Jebel Ali to Georgetown, transhipped', useCase: 'Default when planned ahead' },
    { name: 'Air freight', transit: '5–9 days', route: 'DXB to GEO, with at least one connection', useCase: 'When the line is down' },
    { name: 'Sea, LCL', transit: '42–55 days', route: 'Consolidated, with two transhipments', useCase: 'Small mixed orders' },
  ],
  orderSteps: {
    third: 'The operator’s specification is confirmed line by line — monogram, material grade, certification — and the documents are prepared before the container is loaded.',
    fourth: 'Goods sail from Jebel Ali and tranship for Georgetown, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Georgetown', coords: [-58.16, 6.8], region: 'Demerara-Mahaica', plot: true, dx: 9, dy: -5 },
    { name: 'Vreed-en-Hoop', coords: [-58.21, 6.81], region: 'Essequibo Islands-West Demerara' },
    { name: 'Houston', coords: [-58.16, 6.83], region: 'Demerara-Mahaica' },
    { name: 'New Amsterdam', coords: [-57.52, 6.25], region: 'East Berbice-Corentyne', plot: true, dx: 9, dy: 6 },
    { name: 'Linden', coords: [-58.3, 6.0], region: 'Upper Demerara-Berbice', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Anna Regina', coords: [-58.5, 7.26], region: 'Pomeroon-Supenaam', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Bartica', coords: [-58.62, 6.4], region: 'Cuyuni-Mazaruni' },
    { name: 'Parika', coords: [-58.42, 6.83], region: 'Essequibo Islands-West Demerara' },
    { name: 'Rosignol', coords: [-57.55, 6.27], region: 'Mahaica-Berbice' },
    { name: 'Skeldon', coords: [-57.14, 5.88], region: 'East Berbice-Corentyne' },
    { name: 'Mahdia', coords: [-59.13, 5.27], region: 'Potaro-Siparuni', plot: true, dx: 9, dy: 4 },
    { name: 'Lethem', coords: [-59.8, 3.38], region: 'Upper Takutu-Upper Essequibo', plot: true, dx: 9, dy: 4 },
  ],
  sectors: [
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Stabroek block support — shore base, flow iron, choke-and-kill and wellhead consumables.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery and vessel hydraulics for the offshore support fleet working out of Georgetown.' },
    { slug: 'mining', name: 'Mining', description: 'Gold and bauxite plant at Linden and the interior — dust-rated, high-cycle components.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and batching-plant hydraulics for the shore base and road programme.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for diesel and the incoming gas-to-shore generation.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'Cylinders and valves for fabrication and pipe-handling equipment.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Guyana?', answer: 'No. Guyana is supplied from our Dubai warehouse, transhipped into Georgetown. We are not pretending to a shore-base presence we do not have.' },
    {
      question: 'Why would we buy from Dubai rather than Trinidad or Houston?',
      answer:
        'For anything urgent, you should not — they are closer and that is the honest answer. What we are competitive on is the planned order: spiral hose, crimp fittings, flow iron and valve consumables held as real stock, quoted against a specification, batched and shipped once rather than flown in twice.',
    },
    { question: 'What certification do we need?', answer: 'There is no general pre-shipment conformity scheme. What matters is the operator’s specification — API monogram, NACE MR0175 material documentation, mill certificates — and we confirm those at quotation rather than after inspection.' },
    { question: 'How far ahead do we need to order?', answer: 'Five to seven weeks for the sea lane. That is the whole argument for this route: it is not fast, and it is a fraction of the cost of the same parts arriving against a rig date.' },
    { question: 'Can you deliver to the shore base?', answer: 'Yes, on DAP terms to the base gate at Georgetown or Houston. The leg beyond the port is short and it is priced, not estimated.' },
    { question: 'Can you supply API-monogrammed equipment?', answer: 'Yes. API 6A wellhead, API 16A BOP, API 16C choke and kill and API 7K drilling hose, with NACE MR0175 material documentation where the contract requires it.' },
    { question: 'What currency do you quote in?', answer: 'USD, which is what the offshore supply contracts here are written in.' },
    { question: 'Is air freight worth it?', answer: 'For a line that is down, yes. For anything else it undoes the reason to buy from Dubai at all — the saving is in the sea lane, and air freight spends it.' },
  ],
  compliance: {
    heading: 'A young supply chain, and what that changes',
    body:
      'Guyana has no general pre-shipment conformity scheme for industrial goods, and the customs file is short: a declaration against the invoice and packing list, and an attested certificate of origin. The difficulty is not regulatory. It is that a very large offshore development has arrived faster than the supply chain around it, so a great deal reaches Georgetown from Trinidad or Houston at short notice and a premium, and the operator specifications are strict — API monograms, NACE MR0175 material documentation, mill certificates traceable to heat number. Those are the things a consignment fails on here, and they are all settled at quotation rather than at inspection. The lane itself rewards planning more than any other on the network: transhipped, five to seven weeks, and a fraction of the cost of the same parts flown against a rig date.',
    documents: [
      { ref: 'DECL', name: 'Customs import declaration', issuer: 'The importer, through the Guyana Revenue Authority', when: 'Before arrival' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the specification calls for them' },
      { ref: 'API', name: 'Monogram and licence documentation', issuer: 'The manufacturer', when: 'At quotation, per product' },
      { ref: 'BL', name: 'Bill of lading or air waybill', issuer: 'The carrier', when: 'On dispatch' },
    ],
  },
}

const CHILE: MarketPage = {
  slug: 'chile',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → CL',
  dialCode: '+56',
  currency: 'USD',
  lede: 'Chile is the longest lane we run and copper is the reason anyone runs it. Containers round the Cape of Good Hope, cross the South Atlantic, tranship and transit the Panama Canal into San Antonio or Valparaíso — seven weeks, and then a climb to mine sites three thousand metres up in the Atacama. The import regime is one of the lightest on the continent, so nothing about the paperwork explains the transit. It is distance, and the answer to it is planning rather than air freight.',
  facts: [
    { label: 'Typical transit', value: 'Typically 40–52 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali round the Cape and through the Panama Canal to San Antonio or Valparaíso · Antofagasta and Mejillones for the northern mining region · Air freight into Santiago where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'CIF San Antonio · DAP to the buyer’s site or mine gate · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'Customs declaration raised by the importer · Certificate of Origin, Dubai Chamber attested · Documents in Spanish · Material and test certificates where the mine specification calls for them',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via the Canal' },
    { label: 'Port of entry', value: 'San Antonio' },
    { label: 'Transit', value: '40–52 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Chile'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'SAN ANTONIO · PORT', coords: [-71.61, -33.59], legend: 'Port of entry', dx: -11, dy: 8, anchor: 'end' },
    routes: [
      {
        mode: 'SEA · CANAL',
        primary: true,
        points: leg(CAPE_TO_SOUTH_ATLANTIC, [-32.0, -12.0], [-42.0, 0.0], [-62.0, 10.0], [-77.0, 9.5], [-79.5, 8.0], [-82.0, 0.0], [-78.0, -15.0], [-73.0, -28.0], [-71.61, -33.59]),
      },
      { mode: 'AIR', points: leg(SOUTH_AMERICA_AIR, [-45.0, -20.0], [-70.79, -33.39]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '40–52 days', route: 'Jebel Ali to San Antonio, via the Canal', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '6–9 days', route: 'DXB to SCL, with a connection', useCase: 'When the line is down' },
    { name: 'Sea, northern ports', transit: '44–56 days', route: 'Transhipped for Antofagasta or Mejillones', useCase: 'The mining region' },
  ],
  orderSteps: {
    third: 'The description is agreed in Spanish across the invoice, the packing list and the declaration, and the mine specification is confirmed line by line before the container is loaded.',
    fourth: 'Goods sail from Jebel Ali round the Cape and through the Canal, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Santiago', coords: [-70.65, -33.46], region: 'Región Metropolitana', plot: true, dx: 9, dy: -5 },
    { name: 'San Antonio', coords: [-71.61, -33.59], region: 'Valparaíso' },
    { name: 'Valparaíso', coords: [-71.63, -33.05], region: 'Valparaíso' },
    { name: 'Antofagasta', coords: [-70.4, -23.65], region: 'Antofagasta', plot: true, dx: 9, dy: 4 },
    { name: 'Mejillones', coords: [-70.45, -23.1], region: 'Antofagasta' },
    { name: 'Calama', coords: [-68.93, -22.46], region: 'Antofagasta', plot: true, dx: 9, dy: -4 },
    { name: 'Iquique', coords: [-70.14, -20.21], region: 'Tarapacá', plot: true, dx: 9, dy: 4 },
    { name: 'Arica', coords: [-70.31, -18.48], region: 'Arica y Parinacota', plot: true, dx: 9, dy: -4 },
    { name: 'Copiapó', coords: [-70.33, -27.37], region: 'Atacama', plot: true, dx: 9, dy: 4 },
    { name: 'La Serena', coords: [-71.25, -29.9], region: 'Coquimbo' },
    { name: 'Rancagua', coords: [-70.74, -34.17], region: "O'Higgins" },
    { name: 'Concepción', coords: [-73.05, -36.83], region: 'Biobío', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Talcahuano', coords: [-73.12, -36.72], region: 'Biobío' },
    { name: 'Puerto Montt', coords: [-72.94, -41.47], region: 'Los Lagos', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Chuquicamata', coords: [-68.9, -22.31], region: 'Antofagasta' },
    { name: 'Los Andes', coords: [-70.6, -32.83], region: 'Valparaíso' },
  ],
  sectors: [
    { slug: 'mining', name: 'Mining', description: 'Copper across the Atacama — haul truck, shovel and processing-plant hydraulics rated for dust and altitude.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for thermal, hydro and the desalination plant feeding the mines.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery and vessel hydraulics for the fishing and aquaculture fleet in the south.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and batching-plant hydraulics for mine development and infrastructure.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for smelter and forming lines.' },
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Terminal and refinery support at Concepción and the Magallanes fields.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Chile?', answer: 'No. Chile is supplied from our Dubai warehouse, round the Cape and through the Panama Canal. It is the longest lane we run.' },
    {
      question: 'Why does it take seven weeks?',
      answer:
        'Because there is no short route from the Gulf to the Pacific coast of South America. The vessel rounds the Cape of Good Hope, crosses the South Atlantic, transhipes and transits the Panama Canal. Nothing in the paperwork adds to that; it is distance.',
    },
    { question: 'Then why buy from Dubai at all?', answer: 'For planned consumables, not for breakdowns. Spiral hose, crimp fittings and valve spares held as real stock, quoted against a specification and shipped once, land well below the cost of the same parts sourced against a shutdown date. For anything urgent we are the wrong supplier and will say so.' },
    { question: 'What certification do we need?', answer: 'Chile has one of the lighter import regimes on the continent. There is no general pre-shipment conformity scheme for industrial hose and fittings — the file is the declaration, the invoice, the packing list and the origin certificate.' },
    { question: 'Can you deliver to the mine sites?', answer: 'Yes, on DAP terms to the mine gate. The leg from Antofagasta or Calama up to a site at three thousand metres is quoted rather than estimated, because it is a real climb on a real road.' },
    { question: 'Does altitude change what you supply?', answer: 'It changes what we recommend. Seal compounds, cooling and cycle life behave differently at three thousand metres, and it is worth telling us the site altitude at quotation rather than after the first failure.' },
    { question: 'What language do the documents need to be in?', answer: 'Spanish. The description has to agree across the invoice, the packing list and the declaration, and we fix that wording at quotation.' },
    { question: 'What currency do you quote in?', answer: 'USD. It is what mining supply contracts here are written in.' },
  ],
  compliance: {
    heading: 'Nothing in the file explains the transit',
    body:
      'Chile is worth stating plainly because the usual shape of these pages does not apply. There is no conformity scheme to satisfy, no pre-shipment inspection, no registration to obtain — the import regime is among the lightest on the continent, and the file is a declaration against the invoice and packing list with an attested certificate of origin. So none of the forty to fifty days is paperwork. It is the route: round the Cape of Good Hope, across the South Atlantic, transhipment, and the Panama Canal. That makes this the one lane on the network where the honest advice is about ordering behaviour rather than documentation. Batch the planned consumables, order against the shutdown calendar rather than the failure, and tell us the site altitude — because at three thousand metres in the Atacama the specification matters more than the schedule.',
    documents: [
      { ref: 'DIN', name: 'Customs import declaration', issuer: 'The importer, through Aduanas', when: 'Before arrival' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the mine specification calls for them' },
      { ref: 'BL', name: 'Bill of lading or air waybill', issuer: 'The carrier', when: 'On dispatch' },
      { ref: 'PL', name: 'Packing list in Spanish, matching the declaration', issuer: 'Us, at dispatch', when: 'Before the vessel sails' },
    ],
  },
}

const PERU: MarketPage = {
  slug: 'peru',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → PE',
  dialCode: '+51',
  currency: 'USD',
  localName: 'Perú',
  lede: 'Peru runs on the same seven-week Pacific lane as Chile and asks a harder question at the other end. Callao is the gate for almost everything, and the mines that consume it sit in the Andes — Cerro Verde, Las Bambas, Antamina — reached by roads that climb past four thousand metres. The customs file is light and the technical regulations cover a defined list that most industrial hose sits outside. What decides whether the parts work is the specification against altitude and dust, not the declaration.',
  facts: [
    { label: 'Typical transit', value: 'Typically 40–50 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali round the Cape and through the Panama Canal to Callao · Matarani for the southern mining region · Air freight into Lima where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'CIF Callao · DAP to the buyer’s site or mine gate · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'Customs declaration raised by the importer · Technical regulation conformity where the line is listed · Certificate of Origin, Dubai Chamber attested · Documents in Spanish',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via the Canal' },
    { label: 'Port of entry', value: 'Callao · Lima' },
    { label: 'Transit', value: '40–50 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Peru'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'CALLAO · PORT', coords: [-77.13, -12.05], legend: 'Port of entry', dx: -11, dy: 8, anchor: 'end' },
    routes: [
      {
        mode: 'SEA · CANAL',
        primary: true,
        points: leg(CAPE_TO_SOUTH_ATLANTIC, [-32.0, -12.0], [-42.0, 0.0], [-62.0, 10.0], [-77.0, 9.5], [-79.5, 8.0], [-81.0, 2.0], [-79.0, -6.0], [-77.13, -12.05]),
      },
      { mode: 'AIR', points: leg(SOUTH_AMERICA_AIR, [-50.0, -8.0], [-77.11, -12.02]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '40–50 days', route: 'Jebel Ali to Callao, via the Canal', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '6–9 days', route: 'DXB to LIM, with a connection', useCase: 'When the line is down' },
    { name: 'Sea, southern ports', transit: '44–54 days', route: 'Transhipped for Matarani', useCase: 'The Arequipa mining region' },
  ],
  orderSteps: {
    third: 'The description is agreed in Spanish across the file, and where a line falls under a technical regulation the conformity documentation is arranged before the container is loaded.',
    fourth: 'Goods sail from Jebel Ali round the Cape and through the Canal, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Lima', coords: [-77.04, -12.05], region: 'Lima', plot: true, dx: -9, dy: -5, anchor: 'end' },
    { name: 'Callao', coords: [-77.13, -12.05], region: 'Callao' },
    { name: 'Arequipa', coords: [-71.54, -16.4], region: 'Arequipa', plot: true, dx: 9, dy: 4 },
    { name: 'Matarani', coords: [-72.11, -17.0], region: 'Arequipa', plot: true, dx: 9, dy: 8 },
    { name: 'Cerro Verde', coords: [-71.59, -16.53], region: 'Arequipa' },
    { name: 'Cusco', coords: [-71.97, -13.53], region: 'Cusco', plot: true, dx: 9, dy: -4 },
    { name: 'Las Bambas', coords: [-72.31, -14.07], region: 'Apurímac' },
    { name: 'Trujillo', coords: [-79.03, -8.11], region: 'La Libertad', plot: true, dx: 9, dy: -4 },
    { name: 'Chimbote', coords: [-78.59, -9.08], region: 'Áncash' },
    { name: 'Antamina', coords: [-77.06, -9.53], region: 'Áncash' },
    { name: 'Piura', coords: [-80.63, -5.19], region: 'Piura', plot: true, dx: 9, dy: -4 },
    { name: 'Talara', coords: [-81.27, -4.58], region: 'Piura' },
    { name: 'Chiclayo', coords: [-79.84, -6.77], region: 'Lambayeque' },
    { name: 'Ilo', coords: [-71.34, -17.64], region: 'Moquegua', plot: true, dx: 9, dy: 4 },
    { name: 'Cajamarca', coords: [-78.51, -7.16], region: 'Cajamarca' },
    { name: 'Pisco', coords: [-76.2, -13.71], region: 'Ica' },
  ],
  sectors: [
    { slug: 'mining', name: 'Mining', description: 'Copper, gold and zinc in the Andes — haul truck, shovel and concentrator hydraulics rated for altitude and dust.' },
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Refinery and terminal support at Talara and the Camisea gas infrastructure.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for hydro and thermal generation.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery and vessel hydraulics for the fishmeal and port fleet at Callao and Chimbote.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and batching-plant hydraulics for mine development and road works.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for smelter and rolling lines.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Peru?', answer: 'No. Peru is supplied from our Dubai warehouse, round the Cape and through the Panama Canal into Callao.' },
    { question: 'Why does it take seven weeks?', answer: 'Because the Pacific coast of South America is the furthest point on this network from Jebel Ali. The routing rounds the Cape of Good Hope, crosses the South Atlantic, transhipes and transits the Canal. None of it is paperwork.' },
    {
      question: 'What certification do we need?',
      answer:
        'Peru applies technical regulations to a defined list of products, and most industrial hose, fittings and adapters sit outside it. Where a line is listed we arrange the conformity documentation at origin. The part list settles which at quotation.',
    },
    { question: 'Can you deliver to the mine sites?', answer: 'Yes, on DAP terms to the mine gate. The leg from Callao or Matarani up to Las Bambas or Antamina is a serious climb and it is quoted rather than estimated.' },
    {
      question: 'Does altitude change what you supply?',
      answer:
        'Yes, and it is worth saying at quotation rather than after a failure. Above three thousand metres seal compounds, cooling and cycle life all behave differently. Tell us the site and we will flag where a standard specification is the wrong choice.',
    },
    { question: 'Callao or Matarani?', answer: 'Callao for most of the country. Matarani when the delivery is in the Arequipa or Moquegua mining belt, because the road leg from Lima is more than a thousand kilometres.' },
    { question: 'What language do the documents need to be in?', answer: 'Spanish. The description has to agree across the invoice, the packing list and the declaration, and we fix that at quotation rather than at the pier.' },
    { question: 'What currency do you quote in?', answer: 'USD. It is what mining supply contracts here are written in.' },
  ],
  compliance: {
    heading: 'The altitude is the specification question',
    body:
      'Peru applies technical regulations to a defined list of products; most hydraulic hose, fittings and adapters fall outside it, and where a line is listed the conformity documentation is arranged at origin. The customs file beyond that is short — a declaration against the invoice and packing list, in Spanish, with an attested certificate of origin. So the paperwork is not what makes this lane demanding. Two other things are. The first is distance: forty to fifty days by sea, which is a planning problem rather than a documentation one. The second is where the goods end up. The mines that consume most of what we ship sit between three and four and a half thousand metres, and seal compounds, cooling capacity and cycle life all behave differently up there. We would rather be told the site at quotation and flag where a standard specification is the wrong choice than supply to the letter of the part number and be right on paper.',
    documents: [
      { ref: 'DAM', name: 'Customs import declaration', issuer: 'The importer, through SUNAT', when: 'Before arrival' },
      { ref: 'RT', name: 'Technical regulation conformity, where the line is listed', issuer: 'Accredited certification body', when: 'At quotation, per product' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the mine specification calls for them' },
      { ref: 'PL', name: 'Packing list in Spanish, matching the declaration', issuer: 'Us, at dispatch', when: 'Before the vessel sails' },
    ],
  },
}


// ─────────────────────────────────────────────────────────────────────────────
// CAUCASUS AND WESTERN CIS — the Middle Corridor
//
// Extends the built Caspian cluster. Read Kazakhstan, Azerbaijan and Uzbekistan
// first: the corridor is already traced there and the conformity framing — the
// EAEU split — is already established.
//
// STANDING PROJECT RULE: NOTHING ROUTES THROUGH RUSSIA. That is why the built
// corridor takes the long way round, down the Gulf, round Arabia, up the Red
// Sea, through Suez and across the Black Sea to Poti. It applies to all four
// markets here. `apps/web/src/lib/market-geometry.test.ts` asserts it against
// real polygons.
// ─────────────────────────────────────────────────────────────────────────────

/** Jebel Ali to Poti — the Middle Corridor's sea leg, avoiding Iran and Russia. */
const BLACK_SEA_CORRIDOR = [
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
  [28.0, 33.5],
  [26.0, 36.5],
  [29.0, 41.0],
  [35.0, 42.5],
] as const

/** DXB north-west over Arabia and Türkiye — the shared air leg for the cluster. */
const CAUCASUS_AIR = [
  [55.36, 25.25],
  [48.0, 30.0],
  [42.0, 36.0],
] as const

const GEORGIA: MarketPage = {
  slug: 'georgia',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → GE',
  dialCode: '+995',
  currency: 'USD',
  localName: 'საქართველო',
  lede: 'Georgia is the easiest market in this cluster because it sits on a corridor we already run. Poti and Batumi are where the Middle Corridor reaches the Black Sea, so the sea leg is the same one that serves Baku and Aktau and the goods simply stop earlier. Georgia is outside the Eurasian Economic Union, so there is no EAC certificate to obtain — a national conformity declaration where the line is regulated, and otherwise a clean customs file.',
  facts: [
    { label: 'Typical transit', value: 'Typically 22–28 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali through Suez and the Black Sea to Poti · Batumi where the berth suits the cargo · Air freight into Tbilisi where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'CIF Poti · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'Customs declaration raised by the importer · National conformity declaration where the line is regulated · Certificate of Origin, Dubai Chamber attested · No EAC certificate — Georgia is outside the union',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via Suez' },
    { label: 'Port of entry', value: 'Poti' },
    { label: 'Transit', value: '22–28 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Georgia'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'POTI · PORT', coords: [41.67, 42.15], legend: 'Port of entry', dx: -11, dy: 8, anchor: 'end' },
    routes: [
      { mode: 'SEA · SUEZ', primary: true, points: leg(BLACK_SEA_CORRIDOR, [38.0, 42.6], [41.67, 42.15]) },
      { mode: 'AIR', points: leg(CAUCASUS_AIR, [44.95, 41.67]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '22–28 days', route: 'Jebel Ali to Poti, via Suez', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '3–5 days', route: 'DXB to TBS', useCase: 'When the line is down' },
    { name: 'Sea, LCL', transit: '28–36 days', route: 'Consolidated, with transhipment', useCase: 'Small mixed orders' },
  ],
  orderSteps: {
    third: 'Where a line is regulated the national conformity declaration is prepared before the container is loaded; there is no union certificate to obtain here.',
    fourth: 'Goods sail from Jebel Ali through Suez to Poti, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Tbilisi', coords: [44.8, 41.72], region: 'Tbilisi', plot: true, dx: 9, dy: -5 },
    { name: 'Poti', coords: [41.67, 42.15], region: 'Samegrelo-Zemo Svaneti' },
    { name: 'Batumi', coords: [41.64, 41.64], region: 'Adjara', plot: true, dx: -9, dy: 8, anchor: 'end' },
    { name: 'Kutaisi', coords: [42.7, 42.27], region: 'Imereti', plot: true, dx: 9, dy: -4 },
    { name: 'Zestaponi', coords: [43.05, 42.11], region: 'Imereti' },
    { name: 'Rustavi', coords: [45.0, 41.55], region: 'Kvemo Kartli', plot: true, dx: 9, dy: 8 },
    { name: 'Gori', coords: [44.11, 41.98], region: 'Shida Kartli' },
    { name: 'Zugdidi', coords: [41.87, 42.51], region: 'Samegrelo-Zemo Svaneti', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Telavi', coords: [45.47, 41.92], region: 'Kakheti' },
    { name: 'Marneuli', coords: [44.81, 41.48], region: 'Kvemo Kartli' },
    { name: 'Sadakhlo', coords: [44.6, 41.21], region: 'Kvemo Kartli', plot: true, dx: -9, dy: 8, anchor: 'end' },
    { name: 'Akhaltsikhe', coords: [42.98, 41.64], region: 'Samtskhe-Javakheti' },
  ],
  sectors: [
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and batching-plant hydraulics for the corridor road, rail and port programme.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for the hydro cascade and thermal plant.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery and terminal hydraulics for the Poti and Batumi port fleet.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for the Zestaponi and Rustavi lines.' },
    { slug: 'mining', name: 'Mining', description: 'Manganese and aggregate plant — dust-rated, high-cycle components.' },
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Terminal and pipeline support at Batumi and Supsa.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Georgia?', answer: 'No. Georgia is supplied from our Dubai warehouse, by sea through Suez into Poti or Batumi.' },
    {
      question: 'Do we need EAC certification?',
      answer:
        'No. Georgia is outside the Eurasian Economic Union, so the EAC documents that Kazakhstan requires do not apply here. Where a line falls under a national technical regulation a conformity declaration is prepared at origin; otherwise there is nothing to obtain.',
    },
    { question: 'Poti or Batumi?', answer: 'Poti for containerised cargo, which is most of what we ship. Batumi where the berth or the onward road leg suits it better. It is worth naming the delivery town so we can choose.' },
    { question: 'Why does it go through Suez rather than overland?', answer: 'Because the overland routes from the Gulf cross jurisdictions we will not route through without an export-compliance ruling. The sea corridor through Suez and the Black Sea is longer and it is the one we run.' },
    { question: 'Can you deliver on to Armenia from here?', answer: 'Yes. Poti is also the entry for a great deal of Armenian cargo, and the road leg through Sadakhlo is quoted rather than estimated. It is a different customs file, so tell us at quotation.' },
    { question: 'What currency do you quote in?', answer: 'USD. It is what import contracts here are written in.' },
    { question: 'Do you crimp assemblies to length?', answer: 'Yes, in Dubai, pressure-tested and tagged before packing. Send bore, thread and pressure, or a photo of the failed assembly, plus the length between fitting faces.' },
    { question: 'Is air freight worth it on this lane?', answer: 'For a line that is down, yes — three to five days against three to four weeks. For planned work the sea lane is predictable enough to order against.' },
  ],
  compliance: {
    heading: 'Outside the union, and that simplifies it',
    body:
      'The conformity question in this region is whether a market is inside the Eurasian Economic Union. Kazakhstan is, and needs EAC documents raised in the importer’s name. Georgia is not, so none of that applies: where a line falls under a national technical regulation a conformity declaration is prepared at origin, and where it does not there is nothing to obtain at all. That leaves a short file — the declaration, the invoice and packing list, and an attested certificate of origin. The other thing worth knowing is that Poti is not only Georgia’s gate. It is where the Middle Corridor reaches the Black Sea, and a good deal of what lands there travels on to Armenia or by rail and ferry to Baku and Aktau. If your consignment is doing that, say so at quotation, because it is a different customs file from the outset rather than a variation applied later.',
    documents: [
      { ref: 'DECL', name: 'Customs import declaration', issuer: 'The importer, through the Revenue Service', when: 'Before arrival' },
      { ref: 'DOC', name: 'Conformity declaration, where the line is regulated', issuer: 'Prepared at origin', when: 'Before the vessel sails' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'BL', name: 'Bill of lading or air waybill', issuer: 'The carrier', when: 'On dispatch' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the order calls for them' },
    ],
  },
}

const ARMENIA: MarketPage = {
  slug: 'armenia',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → AM',
  dialCode: '+374',
  currency: 'USD',
  localName: 'Հայաստան',
  lede: 'Armenia is landlocked with two of its four borders closed, so the routing is decided before anything else. Cargo lands at Poti in Georgia and comes south by road through Sadakhlo — there is no alternative worth quoting. Armenia is also inside the Eurasian Economic Union, which means EAC documents raised in the importer’s name, the same framework Kazakhstan works under and the opposite of neighbouring Georgia. Those two facts together are the whole page.',
  facts: [
    { label: 'Typical transit', value: 'Typically 26–34 days from dispatch, sea and road combined' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali through Suez to Poti, then road through Sadakhlo · Air freight into Yerevan where the schedule is tighter · No routing through closed borders',
    },
    { label: 'Incoterms 2020', value: 'DAP to the buyer’s site · CIF Poti · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'EAC declaration or certificate of conformity in the importer’s name · Georgian transit documents for the road leg · Certificate of Origin, Dubai Chamber attested',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea + road' },
    { label: 'Border crossing', value: 'Sadakhlo · Bagratashen' },
    { label: 'Transit', value: '26–34 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Armenia'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'BAGRATASHEN · SADAKHLO', coords: [44.81, 41.25], dx: 11, dy: -8, anchor: 'start' },
    routes: [
      { mode: 'SEA + ROAD', primary: true, points: leg(BLACK_SEA_CORRIDOR, [38.0, 42.6], [41.67, 42.15], [43.0, 41.9], [44.81, 41.25]) },
      { mode: 'AIR', points: leg(CAUCASUS_AIR, [44.4, 40.15]) },
    ],
  },
  freight: [
    { name: 'Sea + road', transit: '26–34 days', route: 'Poti, then road through Sadakhlo', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '3–5 days', route: 'DXB to EVN', useCase: 'When the line is down' },
    { name: 'Sea + road, LCL', transit: '32–42 days', route: 'Consolidated to Poti, then road', useCase: 'Small mixed orders' },
  ],
  orderSteps: {
    third: 'The EAC declaration is raised in your name before the goods move, and the Georgian transit documents for the road leg are prepared alongside it.',
    fourth: 'Goods sail to Poti and come south by road, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Yerevan', coords: [44.51, 40.18], region: 'Yerevan', plot: true, dx: 9, dy: 4 },
    { name: 'Bagratashen', coords: [44.82, 41.25], region: 'Tavush' },
    { name: 'Vanadzor', coords: [44.49, 40.81], region: 'Lori', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Alaverdi', coords: [44.66, 41.1], region: 'Lori' },
    { name: 'Gyumri', coords: [43.85, 40.79], region: 'Shirak', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Hrazdan', coords: [44.77, 40.5], region: 'Kotayk', plot: true, dx: 9, dy: -4 },
    { name: 'Abovyan', coords: [44.63, 40.27], region: 'Kotayk' },
    { name: 'Charentsavan', coords: [44.64, 40.41], region: 'Kotayk' },
    { name: 'Armavir', coords: [44.03, 40.15], region: 'Armavir' },
    { name: 'Ararat', coords: [44.7, 39.83], region: 'Ararat', plot: true, dx: 9, dy: 8 },
    { name: 'Kajaran', coords: [46.15, 39.15], region: 'Syunik', plot: true, dx: 9, dy: 4 },
    { name: 'Kapan', coords: [46.41, 39.2], region: 'Syunik' },
  ],
  sectors: [
    { slug: 'mining', name: 'Mining', description: 'Copper and molybdenum at Kajaran and Kapan — dust-rated, high-cycle components for shovel and mill.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for the hydro cascade and thermal plant.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for smelter and forming lines.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and batching-plant hydraulics for road and infrastructure contracts.' },
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Terminal, pipeline and compressor-station support.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Winch and deck hydraulics for inland water and lifting equipment.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Armenia?', answer: 'No. Armenia is supplied from our Dubai warehouse, by sea to Poti in Georgia and then by road through Sadakhlo.' },
    {
      question: 'Do we need EAC certification?',
      answer:
        'Yes. Armenia is a member of the Eurasian Economic Union, so the EAC declaration or certificate applies and it is raised in the importer’s name. It is the same framework as Kazakhstan and the opposite of neighbouring Georgia, which is outside the union.',
    },
    { question: 'Is there another way in?', answer: 'Not one we would quote. Two of the four land borders are closed, and the routes that remain either cross jurisdictions we will not route through without an export-compliance ruling or are not commercially served. Poti and the road south is the lane.' },
    { question: 'Why is it longer than Georgia?', answer: 'Because it is Georgia plus a road leg and a second customs file. The sea time to Poti is identical; the difference is Georgian transit clearance, the drive south and the border at Bagratashen.' },
    { question: 'Can you deliver to the Syunik mines?', answer: 'Yes, on DAP terms to the mine gate at Kajaran or Kapan. It is a long road leg from the border and it is quoted rather than estimated.' },
    { question: 'What do you need from us before shipping?', answer: 'Confirmation that the EAC documentation is in place in your name and covers the goods. It is not something that can be arranged after arrival.' },
    { question: 'What currency do you quote in?', answer: 'USD. It is what import contracts here are written in.' },
    { question: 'Can you supply sour-service material documentation?', answer: 'Yes. NACE MR0175 / ISO 15156 documentation where the contract requires it, confirmed at quotation rather than produced afterwards.' },
  ],
  compliance: {
    heading: 'Inside the union, and only one way in',
    body:
      'Two facts decide everything about an Armenian consignment, and neither is negotiable. The first is that Armenia is inside the Eurasian Economic Union, so goods need EAC conformity documentation raised in the importer’s name before they move — the same framework Kazakhstan works under, and the exact opposite of Georgia next door, which is outside the union and needs none of it. Getting that backwards is the commonest error on this lane, because the two countries sit on the same corridor and share the same port. The second is that there is one usable route. Two of Armenia’s four land borders are closed, and the alternatives either cross jurisdictions we will not route through without an export-compliance ruling or are not commercially served. Poti, then road south through Sadakhlo. We quote that and nothing else, because quoting an option we would not actually use is worse than admitting there is one road.',
    documents: [
      { ref: 'EAC', name: 'EAC declaration or certificate of conformity', issuer: 'Accredited body, in the importer’s name', when: 'Before anything else' },
      { ref: 'TRANSIT', name: 'Georgian transit documents for the road leg', issuer: 'The forwarder, at Poti', when: 'Before the road leg' },
      { ref: 'DECL', name: 'Customs import declaration', issuer: 'The importer, through State Revenue Committee', when: 'Before arrival at the border' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the order calls for them' },
    ],
  },
}

const MOLDOVA: MarketPage = {
  slug: 'moldova',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → MD',
  dialCode: '+373',
  currency: 'EUR',
  localName: 'Republica Moldova',
  lede: 'Moldova is landlocked and served through Romania, which shapes both halves of the file. Containers discharge at Constanța and come north by road to Leușeni; the transit runs under EU customs procedure, and the technical documentation Moldova asks for is aligned to the European framework its trade agreement follows. That is why we quote here in euros rather than dollars — it is the currency the contracts and the Romanian leg are actually settled in.',
  facts: [
    { label: 'Typical transit', value: 'Typically 24–32 days from dispatch, sea and road combined' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali through Suez to Constanța, then road through Leușeni · Air freight into Chișinău where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'DAP to the buyer’s site · CIF Constanța · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'EU transit declaration for the Romanian leg · Moldovan customs declaration raised by the importer · Declaration of conformity where the line is regulated · Certificate of Origin, Dubai Chamber attested',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea + road' },
    { label: 'Border crossing', value: 'Leușeni · Albița' },
    { label: 'Transit', value: '24–32 days' },
    { label: 'Quoted in', value: 'EUR' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Moldova'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'LEUȘENI · ALBIȚA', coords: [28.14, 46.79], dx: -11, dy: 8, anchor: 'end' },
    routes: [
      { mode: 'SEA + ROAD', primary: true, points: leg(BLACK_SEA_CORRIDOR, [30.0, 42.5], [28.65, 44.17], [27.6, 45.4], [28.14, 46.79]) },
      { mode: 'AIR', points: leg(CAUCASUS_AIR, [35.0, 42.0], [28.93, 46.93]) },
    ],
  },
  freight: [
    { name: 'Sea + road', transit: '24–32 days', route: 'Constanța, then road through Leușeni', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '3–5 days', route: 'DXB to KIV, usually with a connection', useCase: 'When the line is down' },
    { name: 'Sea + road, LCL', transit: '30–40 days', route: 'Consolidated to Constanța, then road', useCase: 'Small mixed orders' },
  ],
  orderSteps: {
    third: 'The EU transit declaration for the Romanian leg is raised alongside the Moldovan file, and where a line is regulated the conformity declaration is prepared before the container is loaded.',
    fourth: 'Goods sail to Constanța and come north by road, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Chișinău', coords: [28.86, 47.01], region: 'Chișinău', plot: true, dx: 9, dy: -5 },
    { name: 'Leușeni', coords: [28.14, 46.79], region: 'Hîncești' },
    { name: 'Bălți', coords: [27.93, 47.76], region: 'Bălți', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Ungheni', coords: [27.8, 47.2], region: 'Ungheni', plot: true, dx: -9, dy: 4, anchor: 'end' },
    { name: 'Cahul', coords: [28.19, 45.9], region: 'Cahul', plot: true, dx: 9, dy: 6 },
    { name: 'Giurgiulești', coords: [28.2, 45.47], region: 'Cahul', plot: true, dx: 9, dy: 8 },
    { name: 'Orhei', coords: [28.82, 47.38], region: 'Orhei' },
    { name: 'Soroca', coords: [28.3, 48.16], region: 'Soroca', plot: true, dx: 9, dy: -4 },
    { name: 'Comrat', coords: [28.66, 46.3], region: 'Gagauzia' },
    { name: 'Rezina', coords: [28.96, 47.75], region: 'Rezina' },
    { name: 'Strășeni', coords: [28.61, 47.14], region: 'Strășeni' },
    { name: 'Anenii Noi', coords: [29.23, 46.88], region: 'Anenii Noi' },
  ],
  sectors: [
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and batching-plant hydraulics for road and infrastructure contracts.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for thermal and hydro generation.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for the Rezina and Bălți industrial plant.' },
    { slug: 'mining', name: 'Mining', description: 'Dust-rated, high-cycle components for cement, gypsum and quarry plant.' },
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Terminal and bulk-handling support at Giurgiulești on the Danube.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Winch and deck hydraulics for the Danube river and port fleet.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Moldova?', answer: 'No. Moldova is supplied from our Dubai warehouse, by sea to Constanța in Romania and then by road through Leușeni.' },
    {
      question: 'Why do you quote in euros here?',
      answer:
        'Because that is what the contracts and the Romanian transit leg are settled in. Quoting dollars would put a conversion in the middle of a file that is otherwise entirely euro-denominated, and the buyer would carry it.',
    },
    { question: 'What certification do we need?', answer: 'Moldova’s technical documentation is aligned to the European framework. Where a line falls under a regulation a declaration of conformity is prepared at origin; otherwise the file is the transit declaration, the customs entry and the origin certificate.' },
    { question: 'Can you route through Giurgiulești instead?', answer: 'Sometimes. Moldova has its own Danube port and for bulk or project cargo it can be the better answer. For containerised stock Constanța and the road is faster, and we will say which suits the actual order.' },
    { question: 'What is the real variable on this lane?', answer: 'The Romanian transit leg, not the sea time. The EU transit declaration has to agree with the Moldovan entry line for line; where they do not, the consignment waits at Leușeni rather than at either customs office.' },
    { question: 'How long does the road leg take?', answer: 'Constanța to Chișinău is a day once cleared. What varies is clearance, which is why the transit file is prepared before the vessel sails rather than on arrival.' },
    { question: 'Do you crimp assemblies to length?', answer: 'Yes, in Dubai, pressure-tested and tagged before packing. Send bore, thread and pressure, or a photo of the failed assembly, plus the length between fitting faces.' },
    { question: 'Is there a minimum order?', answer: 'No. On a lane with a road leg it is usually worth consolidating so one transit declaration covers the lot, and we will say when an item is better added to the next consignment.' },
  ],
  compliance: {
    heading: 'A Romanian transit file, then a Moldovan entry',
    body:
      'Moldova is landlocked and served through Romania, so every consignment carries two customs files rather than one. The goods discharge at Constanța and move north under EU transit procedure to Leușeni, where the Moldovan entry is made. Those two documents describe the same cargo and have to agree line for line; where they do not, the consignment stops at the border rather than at either office, and the border is the expensive place to discover a discrepancy. The technical side is comparatively simple — Moldova’s documentation is aligned to the European framework, so a declaration of conformity where a line is regulated and nothing where it is not. We prepare both files before the vessel sails, and we quote in euros because that is the currency the Romanian leg and the buyer’s own contracts settle in.',
    documents: [
      { ref: 'T1', name: 'EU transit declaration for the Romanian leg', issuer: 'The forwarder, at Constanța', when: 'Before the road leg' },
      { ref: 'DECL', name: 'Moldovan customs import declaration', issuer: 'The importer, through the Customs Service', when: 'Before arrival at the border' },
      { ref: 'DOC', name: 'Declaration of conformity, where the line is regulated', issuer: 'Prepared at origin', when: 'Before the vessel sails' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the order calls for them' },
    ],
  },
}

const UKRAINE: MarketPage = {
  slug: 'ukraine',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → UA',
  dialCode: '+380',
  currency: 'USD',
  localName: 'Україна',
  lede: 'Ukraine is supplied under wartime conditions and this page will not pretend otherwise. Routing and timings are confirmed per consignment rather than published: the Danube ports at Izmail and Reni, the Black Sea corridor, and the road approach through Romania and Poland each open and close on circumstances no supplier controls. What we can state is the rest of it — what we hold, what the conformity file looks like, and that we quote the route that is actually running on the day rather than the one that reads best.',
  facts: [
    { label: 'Typical transit', value: 'Confirmed per consignment — routing depends on which corridor is operating' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali through Suez to the Danube ports at Izmail or Reni · Constanța and road through Romania where that is the running route · Onward road from Poland for the western oblasts',
    },
    { label: 'Incoterms 2020', value: 'DAP to the buyer’s site where the route allows · CIF the nominated port · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'Ukrainian customs declaration raised by the importer · Declaration of conformity where the line is regulated · Transit documents for the Romanian or Polish leg · Certificate of Origin, Dubai Chamber attested',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea + road' },
    { label: 'Port of entry', value: 'Izmail · Danube' },
    { label: 'Transit', value: 'Quoted per consignment' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Ukraine'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'IZMAIL · DANUBE', coords: [28.84, 45.35], legend: 'Port of entry', dx: -11, dy: 10, anchor: 'end' },
    routes: [
      { mode: 'SEA + ROAD', primary: true, points: leg(BLACK_SEA_CORRIDOR, [30.0, 42.5], [29.5, 44.0], [29.6, 45.2], [28.84, 45.35]) },
      { mode: 'ROAD VIA PL', points: [[21.0, 52.2], [22.7, 50.6], [24.02, 49.84], [26.0, 49.55]] },
    ],
  },
  freight: [
    { name: 'Sea + road', transit: 'Quoted per consignment', route: 'Danube ports, or Constanța and road', useCase: 'Route confirmed at order' },
    { name: 'Road via Poland', transit: 'Quoted per consignment', route: 'Overland for the western oblasts', useCase: 'When the southern corridor is closed' },
    { name: 'Air freight', transit: 'Quoted per consignment', route: 'To the nearest operating airport, then road', useCase: 'Where the schedule allows it' },
  ],
  orderSteps: {
    third: 'The route is confirmed against what is actually operating on the day, and the transit and conformity documents are prepared for that route rather than a default one.',
    fourth: 'Goods move on the confirmed routing, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Kyiv', coords: [30.52, 50.45], region: 'Kyiv', plot: true, dx: 9, dy: -5 },
    { name: 'Lviv', coords: [24.03, 49.84], region: 'Lviv Oblast', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Izmail', coords: [28.84, 45.35], region: 'Odesa Oblast' },
    { name: 'Reni', coords: [28.28, 45.46], region: 'Odesa Oblast' },
    { name: 'Odesa', coords: [30.73, 46.48], region: 'Odesa Oblast', plot: true, dx: 9, dy: 8 },
    { name: 'Vinnytsia', coords: [28.47, 49.23], region: 'Vinnytsia Oblast', plot: true, dx: -9, dy: 4, anchor: 'end' },
    { name: 'Ternopil', coords: [25.59, 49.55], region: 'Ternopil Oblast' },
    { name: 'Ivano-Frankivsk', coords: [24.71, 48.92], region: 'Ivano-Frankivsk Oblast' },
    { name: 'Uzhhorod', coords: [22.29, 48.62], region: 'Zakarpattia Oblast', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Chernivtsi', coords: [25.94, 48.29], region: 'Chernivtsi Oblast' },
    { name: 'Zhytomyr', coords: [28.66, 50.25], region: 'Zhytomyr Oblast' },
    { name: 'Rivne', coords: [26.25, 50.62], region: 'Rivne Oblast', plot: true, dx: 9, dy: -4 },
    { name: 'Khmelnytskyi', coords: [26.99, 49.42], region: 'Khmelnytskyi Oblast' },
    { name: 'Cherkasy', coords: [32.06, 49.44], region: 'Cherkasy Oblast' },
    { name: 'Kropyvnytskyi', coords: [32.26, 48.51], region: 'Kirovohrad Oblast' },
    { name: 'Poltava', coords: [34.55, 49.59], region: 'Poltava Oblast', plot: true, dx: 9, dy: 4 },
  ],
  sectors: [
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for thermal, hydro and substation plant under repair and reconstruction.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and batching-plant hydraulics for reconstruction and infrastructure work.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for rolling and forming lines.' },
    { slug: 'mining', name: 'Mining', description: 'Dust-rated, high-cycle components for iron ore, cement and quarry plant.' },
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Pipeline, compressor-station and storage support.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Winch and deck hydraulics for the Danube river and port fleet.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Ukraine?', answer: 'No. Ukraine is supplied from our Dubai warehouse, on whichever corridor is operating when the order is placed.' },
    {
      question: 'Why does the page not state a transit time?',
      answer:
        'Because we would be inventing it. The Danube ports, the Black Sea corridor and the road approaches through Romania and Poland each open and close on circumstances no supplier controls. We confirm the route and the timing per consignment, against what is actually running, rather than publishing a number that reads well and holds for nobody.',
    },
    { question: 'Which route will our order take?', answer: 'Whichever is running and suits the delivery oblast. Izmail or Reni on the Danube for the south, Constanța and road through Romania, or overland from Poland for the west. We say which at quotation rather than after the goods have moved.' },
    { question: 'What certification do we need?', answer: 'A declaration of conformity where the line falls under a technical regulation, prepared at origin. Beyond that the file is the customs declaration, the transit documents for the road leg and an attested certificate of origin.' },
    { question: 'Can you deliver to the site, or only to the border?', answer: 'DAP to the site where the route allows it, and we will say plainly when it does not. Where the final leg cannot be committed we quote to a nominated point and your forwarder takes it from there.' },
    { question: 'Do you carry insurance on this lane?', answer: 'Cargo cover is arranged per consignment and its scope varies with the routing. It is priced into the quotation rather than assumed, and we state what is and is not covered before you accept.' },
    { question: 'What currency do you quote in?', answer: 'USD. It is what import contracts here are written in and what the bank will settle against.' },
    { question: 'Can you supply against a reconstruction tender?', answer: 'Yes. Send the specification and the schedule; we will quote from stock and say plainly where a lead time depends on a route we cannot commit to at the time of quoting.' },
  ],
  compliance: {
    heading: 'The route is confirmed per consignment, and that is the honest version',
    body:
      'Every other market page on this site states a transit band because a lane runs the same way most weeks. Ukraine does not, and a page that published one would be making a promise about circumstances no supplier controls. The Danube ports at Izmail and Reni, the Black Sea corridor out of Odesa, and the overland approaches through Romania and Poland each operate or do not, and which is available shapes the cost, the timing and the transit documents. So the routing is confirmed per consignment against what is actually running, and it is quoted that way rather than defaulted. The rest of the file is ordinary: a Ukrainian customs declaration, a declaration of conformity where the line falls under a technical regulation, transit documents for whichever road leg applies, and an attested certificate of origin. Cargo cover is arranged per consignment and its scope is stated before acceptance rather than assumed.',
    documents: [
      { ref: 'ROUTE', name: 'Confirmed routing for the consignment', issuer: 'Agreed at quotation', when: 'Before anything else' },
      { ref: 'DECL', name: 'Ukrainian customs import declaration', issuer: 'The importer, through the State Customs Service', when: 'Before arrival' },
      { ref: 'TRANSIT', name: 'Transit documents for the Romanian or Polish leg', issuer: 'The forwarder', when: 'Before the road leg' },
      { ref: 'DOC', name: 'Declaration of conformity, where the line is regulated', issuer: 'Prepared at origin', when: 'Before dispatch' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
    ],
  },
}



const COLOMBIA: MarketPage = {
  slug: 'colombia',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → CO',
  dialCode: '+57',
  currency: 'USD',
  lede: 'Colombia has two coasts and the choice between them is the whole planning question. Cartagena on the Caribbean is the shorter lane and serves the north and the interior; Buenaventura on the Pacific serves the Cauca valley and the south-west, and reaching it means the Panama Canal and another fortnight. Above that sits the import registry and, where a line is regulated, an ICONTEC conformity certificate obtained against the product rather than the shipment.',
  facts: [
    { label: 'Typical transit', value: 'Typically 32–40 days by sea from dispatch to Cartagena' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali round the Cape to Cartagena or Barranquilla for the Caribbean coast · Buenaventura via the Panama Canal for the Pacific side · Air freight into Bogotá where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'CIF Cartagena · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'Import registry entry raised by the importer · ICONTEC conformity certificate where the line is regulated · Certificate of Origin, Dubai Chamber attested · Documents in Spanish',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via the Cape' },
    { label: 'Port of entry', value: 'Cartagena' },
    { label: 'Transit', value: '32–40 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Colombia'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'CARTAGENA · PORT', coords: [-75.51, 10.4], legend: 'Port of entry', dx: -11, dy: 8, anchor: 'end' },
    routes: [
      { mode: 'SEA · CAPE', primary: true, points: leg(CAPE_TO_SOUTH_ATLANTIC, [-32.0, -12.0], [-42.0, 0.0], [-58.0, 9.0], [-70.0, 11.5], [-75.51, 10.4]) },
      { mode: 'AIR', points: leg(SOUTH_AMERICA_AIR, [-50.0, 0.0], [-74.15, 4.7]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '32–40 days', route: 'Jebel Ali to Cartagena, via the Cape', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '5–8 days', route: 'DXB to BOG, with a connection', useCase: 'When the line is down' },
    { name: 'Sea, Pacific coast', transit: '44–56 days', route: 'Buenaventura, via the Panama Canal', useCase: 'The Cauca valley and south-west' },
  ],
  orderSteps: {
    third: 'The coast is fixed against the delivery city rather than assumed, and where a line is regulated the ICONTEC certification is arranged before the container is loaded.',
    fourth: 'Goods sail from Jebel Ali round the Cape, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Bogotá', coords: [-74.07, 4.71], region: 'Cundinamarca', plot: true, dx: 9, dy: 4 },
    { name: 'Cartagena', coords: [-75.51, 10.4], region: 'Bolívar' },
    { name: 'Barranquilla', coords: [-74.8, 10.96], region: 'Atlántico', plot: true, dx: 9, dy: -4 },
    { name: 'Santa Marta', coords: [-74.2, 11.24], region: 'Magdalena' },
    { name: 'Medellín', coords: [-75.56, 6.25], region: 'Antioquia', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Cali', coords: [-76.53, 3.45], region: 'Valle del Cauca', plot: true, dx: -9, dy: 4, anchor: 'end' },
    { name: 'Buenaventura', coords: [-77.03, 3.88], region: 'Valle del Cauca', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Barrancabermeja', coords: [-73.85, 7.06], region: 'Santander', plot: true, dx: 9, dy: 4 },
    { name: 'Bucaramanga', coords: [-73.12, 7.13], region: 'Santander' },
    { name: 'Yopal', coords: [-72.4, 5.34], region: 'Casanare', plot: true, dx: 9, dy: 6 },
    { name: 'Villavicencio', coords: [-73.63, 4.14], region: 'Meta' },
    { name: 'Pereira', coords: [-75.69, 4.81], region: 'Risaralda' },
    { name: 'Manizales', coords: [-75.51, 5.07], region: 'Caldas' },
    { name: 'Cúcuta', coords: [-72.51, 7.89], region: 'Norte de Santander' },
    { name: 'La Guajira', coords: [-72.9, 11.54], region: 'La Guajira' },
    { name: 'Ibagué', coords: [-75.21, 4.44], region: 'Tolima' },
  ],
  sectors: [
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Llanos and Magdalena basin support, and the Barrancabermeja and Cartagena refineries.' },
    { slug: 'mining', name: 'Mining', description: 'Coal in La Guajira and Cesar, and gold in Antioquia — dust-rated, high-cycle components.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for hydro and thermal generation.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and batching-plant hydraulics for the road concession programme.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery and terminal hydraulics for the Caribbean and Pacific port fleets.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for rolling and forming lines.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Colombia?', answer: 'No. Colombia is supplied from our Dubai warehouse, round the Cape into Cartagena, or through the Panama Canal to Buenaventura for the Pacific side.' },
    { question: 'Cartagena or Buenaventura?', answer: 'Cartagena for the coast, Bogotá and the interior — it is nearly a fortnight shorter. Buenaventura only when the delivery is in the Cauca valley or the south-west, where the road leg from the Caribbean would undo the saving.' },
    {
      question: 'What is ICONTEC and does it apply to us?',
      answer:
        'ICONTEC is the certification body for Colombia’s regulated products. The list is defined and much industrial hose and fittings falls outside it. Where a line is inside, the certificate attaches to the product rather than the shipment, so it is obtained once and holds for future orders.',
    },
    { question: 'What do you need from us before shipping?', answer: 'Your import registry entry and confirmation that it covers the tariff lines on the order. It is checked before the goods are, not after.' },
    { question: 'Can you deliver to the Llanos fields?', answer: 'Yes, on DAP terms to the base or the site gate at Yopal or Villavicencio. The leg beyond Bogotá is quoted rather than estimated, because the road over the cordillera is a real climb.' },
    { question: 'What language do the documents need to be in?', answer: 'Spanish, with the description agreeing across the invoice, the packing list and the declaration. We fix the wording at quotation.' },
    { question: 'What currency do you quote in?', answer: 'USD. It is what the import registry and the supply contracts are denominated in.' },
    { question: 'Can you supply API-monogrammed equipment?', answer: 'Yes. API 6A wellhead, API 16A BOP, API 16C choke and kill and API 7K drilling hose, with NACE MR0175 material documentation where the contract requires it.' },
  ],
  compliance: {
    heading: 'Which coast, and whether ICONTEC applies',
    body:
      'Colombia is the one South American market where the port choice changes the transit by weeks rather than days. Cartagena and Barranquilla sit on the Caribbean and are reached round the Cape; Buenaventura sits on the Pacific and needs the Panama Canal on top of it. For a delivery in Bogotá or Medellín the Caribbean is obviously right; for Cali it is genuinely arguable, and we settle it against the delivery city at quotation rather than defaulting. The regulatory side is more familiar: the importer’s registry entry has to cover the tariff lines before anything else matters, and ICONTEC certification applies to a defined list of products — much of what we ship sits outside it, and where a line is inside, the certificate attaches to the product and holds for future orders rather than being repeated per shipment.',
    documents: [
      { ref: 'REG', name: 'Import registry entry and tariff coverage', issuer: 'The importer, through VUCE', when: 'Before anything else' },
      { ref: 'ICONTEC', name: 'Conformity certificate, where the product is regulated', issuer: 'ICONTEC or an accredited body', when: 'At quotation, per product' },
      { ref: 'DECL', name: 'Customs import declaration', issuer: 'The importer, through DIAN', when: 'Before arrival' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the order calls for them' },
    ],
  },
}

const ECUADOR: MarketPage = {
  slug: 'ecuador',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → EC',
  dialCode: '+593',
  currency: 'USD',
  lede: 'Ecuador runs on the Pacific lane through the Panama Canal into Guayaquil, and the thing worth settling before the goods move is the INEN technical regulation. Ecuador applies conformity requirements more broadly than its neighbours, and a line that would clear Chile or Peru without a certificate can need one here. The currency question, unusually, does not arise: the country is dollarised, so the quote and the settlement are in the same money.',
  facts: [
    { label: 'Typical transit', value: 'Typically 38–48 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali round the Cape and through the Panama Canal to Guayaquil · Posorja for the deep-water berth · Manta for the northern coast · Air freight into Quito or Guayaquil where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'CIF Guayaquil · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'INEN certificate of conformity where the line is regulated · Customs declaration raised by the importer · Certificate of Origin, Dubai Chamber attested · Documents in Spanish',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via the Canal' },
    { label: 'Port of entry', value: 'Guayaquil' },
    { label: 'Transit', value: '38–48 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Ecuador'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'GUAYAQUIL · PORT', coords: [-79.9, -2.19], legend: 'Port of entry', dx: -11, dy: 8, anchor: 'end' },
    routes: [
      {
        mode: 'SEA · CANAL',
        primary: true,
        points: leg(CAPE_TO_SOUTH_ATLANTIC, [-32.0, -12.0], [-42.0, 0.0], [-62.0, 10.0], [-77.0, 9.5], [-79.5, 8.0], [-81.0, 2.0], [-79.9, -2.19]),
      },
      { mode: 'AIR', points: leg(SOUTH_AMERICA_AIR, [-50.0, -2.0], [-78.36, -0.13]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '38–48 days', route: 'Jebel Ali to Guayaquil, via the Canal', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '6–9 days', route: 'DXB to UIO or GYE, with a connection', useCase: 'When the line is down' },
    { name: 'Sea, LCL', transit: '46–58 days', route: 'Consolidated, with transhipment', useCase: 'Small mixed orders' },
  ],
  orderSteps: {
    third: 'The INEN position is settled line by line — which parts need a certificate of conformity and which do not — and the certification is arranged before the container is loaded.',
    fourth: 'Goods sail from Jebel Ali round the Cape and through the Canal, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Guayaquil', coords: [-79.9, -2.19], region: 'Guayas' },
    { name: 'Posorja', coords: [-80.25, -2.71], region: 'Guayas' },
    { name: 'Quito', coords: [-78.47, -0.18], region: 'Pichincha', plot: true, dx: 9, dy: -5 },
    { name: 'Manta', coords: [-80.73, -0.95], region: 'Manabí', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Esmeraldas', coords: [-79.66, 0.97], region: 'Esmeraldas', plot: true, dx: 9, dy: -4 },
    { name: 'Cuenca', coords: [-79.0, -2.9], region: 'Azuay', plot: true, dx: 9, dy: 6 },
    { name: 'Machala', coords: [-79.96, -3.26], region: 'El Oro', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Ambato', coords: [-78.62, -1.24], region: 'Tungurahua' },
    { name: 'Riobamba', coords: [-78.65, -1.67], region: 'Chimborazo' },
    { name: 'Santo Domingo', coords: [-79.17, -0.25], region: 'Santo Domingo' },
    { name: 'Lago Agrio', coords: [-76.88, 0.09], region: 'Sucumbíos', plot: true, dx: 9, dy: 4 },
    { name: 'Coca', coords: [-76.99, -0.46], region: 'Orellana' },
    { name: 'Shushufindi', coords: [-76.65, -0.19], region: 'Sucumbíos' },
    { name: 'Loja', coords: [-79.2, -3.99], region: 'Loja' },
    { name: 'Ibarra', coords: [-78.12, 0.35], region: 'Imbabura' },
    { name: 'La Libertad', coords: [-80.9, -2.23], region: 'Santa Elena' },
  ],
  sectors: [
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Oriente basin support at Lago Agrio and Coca, and the Esmeraldas refinery.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery and vessel hydraulics for the fishing and shrimp fleet at Manta and Posorja.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for the hydro cascade and thermal plant.' },
    { slug: 'mining', name: 'Mining', description: 'Copper and gold development in the south — dust-rated, high-cycle components.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and batching-plant hydraulics for road and port works.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'Cylinders and valves for forming and fabrication lines.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Ecuador?', answer: 'No. Ecuador is supplied from our Dubai warehouse, round the Cape and through the Panama Canal into Guayaquil.' },
    {
      question: 'What is INEN and why does it matter more here?',
      answer:
        'INEN is Ecuador’s standards body, and the country applies conformity requirements across a broader list than Chile or Peru. A line that clears those markets without a certificate can need one here, so the part list has to be assessed against the Ecuadorian list specifically rather than assumed from a neighbour.',
    },
    { question: 'Why does it take six or seven weeks?', answer: 'Because the Pacific coast is reached round the Cape of Good Hope and then through the Panama Canal. It is distance, not documentation, and the certification work costs nothing in time if it runs while the order is picked.' },
    { question: 'What currency do you quote in?', answer: 'USD — which is also Ecuador’s own currency, so there is no conversion anywhere in the transaction.' },
    { question: 'Can you deliver to the Oriente fields?', answer: 'Yes, on DAP terms to the base at Lago Agrio, Coca or Shushufindi. The leg over the cordillera and into the Oriente is quoted rather than estimated.' },
    { question: 'Guayaquil or Posorja?', answer: 'Guayaquil for most cargo. Posorja where the deep-water berth suits the vessel or the sailing schedule is better; it is a short road leg from there.' },
    { question: 'What language do the documents need to be in?', answer: 'Spanish, with the description agreeing across the invoice, the packing list and the declaration.' },
    { question: 'Can you supply API-monogrammed equipment?', answer: 'Yes. API 6A wellhead, API 16A BOP, API 16C choke and kill and API 7K drilling hose, with NACE MR0175 material documentation where the contract requires it.' },
  ],
  compliance: {
    heading: 'A broader conformity list than its neighbours',
    body:
      'The mistake to avoid on this lane is assuming Ecuador behaves like Chile or Peru because it sits on the same coast and the same sailing. It does not. Ecuador applies INEN technical regulations across a broader list of products, and a line that clears Callao or San Antonio on a plain declaration can require a certificate of conformity here. That certificate is obtained at origin before shipment, so discovering the requirement at the pier means the goods sit while it is arranged six weeks from home. We assess the part list against the Ecuadorian list specifically at quotation, and say which lines are affected. Everything else is straightforward: a customs declaration in Spanish, an attested certificate of origin, and no currency question at all — the country is dollarised, so the quote and the settlement are the same money.',
    documents: [
      { ref: 'INEN', name: 'Certificate of conformity, where the line is regulated', issuer: 'INEN or an accredited body', when: 'At quotation, per product' },
      { ref: 'DAI', name: 'Customs import declaration', issuer: 'The importer, through SENAE', when: 'Before arrival' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'PL', name: 'Packing list in Spanish, matching the declaration', issuer: 'Us, at dispatch', when: 'Before the vessel sails' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the order calls for them' },
    ],
  },
}

const ARGENTINA: MarketPage = {
  slug: 'argentina',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → AR',
  dialCode: '+54',
  currency: 'USD',
  lede: 'Argentina is the market on this network where the licensing regime moves faster than the freight. Containers round the Cape and cross the South Atlantic to Buenos Aires in about six weeks; what has to be confirmed before any of that is the current state of the import authorisation and the foreign-exchange approval, because both have changed more than once inside a single shipping cycle. We check where they stand at quotation rather than quoting against how they worked last year.',
  facts: [
    { label: 'Typical transit', value: 'Typically 35–45 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali round the Cape to Buenos Aires · Bahía Blanca and Rosario for bulk and the river ports · Air freight into Buenos Aires where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'CIF Buenos Aires · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'Import authorisation, current regime confirmed at quotation · Foreign-exchange approval for the payment · Certificate of Origin, Dubai Chamber attested · Documents in Spanish',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via the Cape' },
    { label: 'Port of entry', value: 'Buenos Aires' },
    { label: 'Transit', value: '35–45 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Argentina'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'BUENOS AIRES · PORT', coords: [-58.37, -34.6], legend: 'Port of entry', dx: -11, dy: 8, anchor: 'end' },
    routes: [
      { mode: 'SEA · CAPE', primary: true, points: leg(CAPE_TO_SOUTH_ATLANTIC, [-30.0, -30.0], [-45.0, -34.0], [-55.0, -35.0], [-58.37, -34.6]) },
      { mode: 'AIR', points: leg(SOUTH_AMERICA_AIR, [-45.0, -25.0], [-58.54, -34.82]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '35–45 days', route: 'Jebel Ali to Buenos Aires, via the Cape', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '5–8 days', route: 'DXB to EZE, with a connection', useCase: 'When the line is down' },
    { name: 'Sea, LCL', transit: '42–55 days', route: 'Consolidated, with transhipment', useCase: 'Small mixed orders' },
  ],
  orderSteps: {
    third: 'The current state of the import authorisation and the foreign-exchange approval is confirmed — not assumed from the last shipment — and the file is built to whatever regime is actually in force.',
    fourth: 'Goods sail from Jebel Ali round the Cape, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Buenos Aires', coords: [-58.38, -34.6], region: 'Buenos Aires', plot: true, dx: 9, dy: 6 },
    { name: 'La Plata', coords: [-57.95, -34.92], region: 'Buenos Aires' },
    { name: 'Campana', coords: [-58.96, -34.16], region: 'Buenos Aires' },
    { name: 'Rosario', coords: [-60.64, -32.94], region: 'Santa Fe', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Bahía Blanca', coords: [-62.27, -38.72], region: 'Buenos Aires', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Córdoba', coords: [-64.18, -31.42], region: 'Córdoba', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Mendoza', coords: [-68.84, -32.89], region: 'Mendoza', plot: true, dx: 9, dy: -4 },
    { name: 'Neuquén', coords: [-68.06, -38.95], region: 'Neuquén', plot: true, dx: 9, dy: -4 },
    { name: 'Añelo', coords: [-68.79, -38.35], region: 'Neuquén' },
    { name: 'Comodoro Rivadavia', coords: [-67.5, -45.86], region: 'Chubut', plot: true, dx: 9, dy: 4 },
    { name: 'Río Gallegos', coords: [-69.22, -51.62], region: 'Santa Cruz' },
    { name: 'San Juan', coords: [-68.54, -31.54], region: 'San Juan' },
    { name: 'Salta', coords: [-65.41, -24.79], region: 'Salta', plot: true, dx: 9, dy: 4 },
    { name: 'Tucumán', coords: [-65.22, -26.83], region: 'Tucumán' },
    { name: 'Zárate', coords: [-59.03, -34.1], region: 'Buenos Aires' },
    { name: 'Ushuaia', coords: [-68.3, -54.8], region: 'Tierra del Fuego' },
  ],
  sectors: [
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Vaca Muerta support at Añelo and Neuquén, and the Comodoro Rivadavia and Campana operations.' },
    { slug: 'mining', name: 'Mining', description: 'Lithium and copper in the north-west — dust-rated, high-cycle components rated for altitude.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and batching-plant hydraulics for infrastructure and well-pad development.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for hydro, thermal and wind plant.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for the Campana and Rosario rolling lines.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery and vessel hydraulics for the Atlantic fishing and port fleet.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Argentina?', answer: 'No. Argentina is supplied from our Dubai warehouse, round the Cape of Good Hope into Buenos Aires.' },
    {
      question: 'What is the position on import licensing?',
      answer:
        'It changes, and we will not publish a description that ages badly. The authorisation regime and the foreign-exchange approval that pays for the goods have both been revised more than once inside a single shipping cycle. We confirm where both stand at quotation and build the file to the regime actually in force.',
    },
    { question: 'Can you quote before the authorisation is in place?', answer: 'Yes, and we will say plainly that the quotation is subject to it. What we will not do is ship against an authorisation nobody has checked and leave the consignment sitting at Buenos Aires.' },
    { question: 'How long does the sea leg take?', answer: 'Five to six weeks round the Cape. That part is predictable; the licensing is the variable, which is the reverse of most markets on this network.' },
    { question: 'Can you deliver to Vaca Muerta?', answer: 'Yes, on DAP terms to the pad or the base at Añelo or Neuquén. The road leg from Buenos Aires is long and it is quoted rather than estimated.' },
    { question: 'What currency do you quote in?', answer: 'USD. The foreign-exchange approval is raised against the dollar value, so quoting in anything else adds a step at your bank.' },
    { question: 'What language do the documents need to be in?', answer: 'Spanish, with the description agreeing across the invoice, the packing list and the declaration.' },
    { question: 'Can you supply API-monogrammed equipment?', answer: 'Yes. API 6A wellhead, API 16A BOP, API 16C choke and kill and API 7K drilling hose, with NACE MR0175 material documentation where the contract requires it.' },
  ],
  compliance: {
    heading: 'The regime is the variable, not the freight',
    body:
      'Almost every market page on this site treats the paperwork as the predictable half and the freight as the estimate. Argentina inverts that. Five to six weeks round the Cape is reliable; what is not is the state of the import authorisation regime and the foreign-exchange approval that pays for the goods, both of which have been revised more than once inside a single shipping cycle. Publishing a description of how they work would produce a page that is confidently wrong within months, so this one does not. What we do instead is check where both stand at the point of quotation, tell you plainly, and build the file to whatever is actually in force. A quotation may be issued subject to an authorisation not yet granted — we will say so — but we will not load a container against a regime nobody has confirmed and leave it sitting at Buenos Aires while it is sorted out.',
    documents: [
      { ref: 'AUTH', name: 'Import authorisation under the current regime', issuer: 'The importer, confirmed at quotation', when: 'Before anything else' },
      { ref: 'FX', name: 'Foreign-exchange approval for the payment', issuer: 'The importer, through their bank', when: 'Before the vessel sails' },
      { ref: 'DECL', name: 'Customs import declaration', issuer: 'The importer, through Aduana', when: 'Before arrival' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the order calls for them' },
    ],
  },
}

const SURINAME: MarketPage = {
  slug: 'suriname',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → SR',
  dialCode: '+597',
  lede: 'Suriname is the quieter half of the Guyana Basin story and it is at an earlier stage. Offshore appraisal work is pulling in a supply chain that barely existed, and Paramaribo is reached by the same transhipped Caribbean feeder that serves Georgetown. The import regime is light and Dutch is the language of the file, which is unusual on this network and worth getting right rather than translating late.',
  currency: 'USD',
  facts: [
    { label: 'Typical transit', value: 'Typically 35–45 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali round the Cape, transhipped through Trinidad or a Caribbean hub, to Paramaribo · Air freight into Paramaribo where the schedule is tighter, with at least one connection',
    },
    { label: 'Incoterms 2020', value: 'CIF Paramaribo · DAP to the buyer’s site or shore base · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value: 'Customs declaration raised by the importer · Documents in Dutch or English · Certificate of Origin, Dubai Chamber attested · Material and test certificates where the operator’s specification calls for them',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, transhipped' },
    { label: 'Port of entry', value: 'Paramaribo' },
    { label: 'Transit', value: '35–45 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Suriname'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'PARAMARIBO · PORT', coords: [-55.17, 5.85], legend: 'Port of entry', dx: 11, dy: -8, anchor: 'start' },
    routes: [
      { mode: 'SEA · TRANSHIP', primary: true, points: leg(CAPE_TO_SOUTH_ATLANTIC, [-32.0, -12.0], [-38.0, -2.0], [-48.0, 4.0], [-53.0, 6.5], [-55.17, 5.85]) },
      { mode: 'AIR', points: leg(SOUTH_AMERICA_AIR, [-45.0, 0.0], [-55.19, 5.45]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '35–45 days', route: 'Jebel Ali to Paramaribo, transhipped', useCase: 'Default when planned ahead' },
    { name: 'Air freight', transit: '5–9 days', route: 'DXB to PBM, with at least one connection', useCase: 'When the line is down' },
    { name: 'Sea, LCL', transit: '42–55 days', route: 'Consolidated, with two transhipments', useCase: 'Small mixed orders' },
  ],
  orderSteps: {
    third: 'The specification is confirmed line by line against the operator’s requirement, and the documents are prepared in the language the file will actually be read in.',
    fourth: 'Goods sail from Jebel Ali and tranship for Paramaribo, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Paramaribo', coords: [-55.17, 5.85], region: 'Paramaribo' },
    { name: 'Nieuw Nickerie', coords: [-56.97, 5.94], region: 'Nickerie', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Wanica', coords: [-55.24, 5.73], region: 'Wanica' },
    { name: 'Lelydorp', coords: [-55.23, 5.7], region: 'Wanica', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Moengo', coords: [-54.4, 5.61], region: 'Marowijne', plot: true, dx: 9, dy: 6 },
    { name: 'Albina', coords: [-54.05, 5.5], region: 'Marowijne', plot: true, dx: 9, dy: -4 },
    { name: 'Nieuw Amsterdam', coords: [-55.09, 5.88], region: 'Commewijne' },
    { name: 'Groningen', coords: [-55.47, 5.8], region: 'Saramacca' },
    { name: 'Onverwacht', coords: [-55.19, 5.59], region: 'Para', plot: true, dx: 9, dy: 8 },
    { name: 'Zanderij', coords: [-55.19, 5.45], region: 'Para' },
    { name: 'Brokopondo', coords: [-54.97, 5.06], region: 'Brokopondo', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Apoera', coords: [-57.19, 5.16], region: 'Sipaliwini', plot: true, dx: -9, dy: 4, anchor: 'end' },
  ],
  sectors: [
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Offshore appraisal and development support, and the Paramaribo shore-base build-out.' },
    { slug: 'mining', name: 'Mining', description: 'Gold and bauxite in the interior — dust-rated, high-cycle components.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery and vessel hydraulics for the offshore support and river fleet.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for the Brokopondo hydro and diesel generation.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and batching-plant hydraulics for shore base and road works.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'Cylinders and valves for fabrication and workshop equipment.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Suriname?', answer: 'No. Suriname is supplied from our Dubai warehouse, transhipped into Paramaribo.' },
    { question: 'Why would we buy from Dubai rather than Trinidad?', answer: 'For anything urgent, you should not — Trinidad is closer and that is the honest answer. What we compete on is the planned order: hose, fittings and valve consumables held as real stock, quoted against a specification and shipped once.' },
    { question: 'What certification do we need?', answer: 'There is no general pre-shipment conformity scheme. What matters is the operator’s specification — API monogram, NACE MR0175 material documentation, mill certificates — confirmed at quotation.' },
    { question: 'What language do the documents need to be in?', answer: 'Dutch or English are both workable. We issue in English and make sure the description is one a Dutch-language declaration can carry without a translator inventing a term.' },
    { question: 'How far ahead do we need to order?', answer: 'Five to seven weeks for the sea lane. That is the whole reason to use it — planned consumables at a fraction of what the same parts cost arriving against a rig date.' },
    { question: 'Can you deliver to the shore base?', answer: 'Yes, on DAP terms to the base gate at Paramaribo. The leg beyond the port is short and it is priced, not estimated.' },
    { question: 'What currency do you quote in?', answer: 'USD, which is what the offshore supply contracts here are written in.' },
    { question: 'Can you supply API-monogrammed equipment?', answer: 'Yes. API 6A wellhead, API 16A BOP, API 16C choke and kill and API 7K drilling hose, with NACE MR0175 material documentation where the contract requires it.' },
  ],
  compliance: {
    heading: 'An earlier stage of the same story',
    body:
      'Suriname sits in the same offshore basin as Guyana and is a few years behind it. The supply chain is correspondingly thinner, the operator specifications are just as strict, and the import regime is light — a customs declaration against the invoice and packing list, an attested certificate of origin, and no general pre-shipment conformity scheme. Two things are worth planning around. The first is the language: the file is read in Dutch, and a description that has to be translated at the pier by someone guessing at a technical term is a description that gets queried. We write one that carries. The second is the schedule: Paramaribo is fed by the same transhipped Caribbean feeder that serves Georgetown, so this is a lane that rewards ordering against the drilling programme rather than against a failure.',
    documents: [
      { ref: 'DECL', name: 'Customs import declaration', issuer: 'The importer, through Douane Suriname', when: 'Before arrival' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the specification calls for them' },
      { ref: 'API', name: 'Monogram and licence documentation', issuer: 'The manufacturer', when: 'At quotation, per product' },
      { ref: 'BL', name: 'Bill of lading or air waybill', issuer: 'The carrier', when: 'On dispatch' },
    ],
  },
}

const BOLIVIA: MarketPage = {
  slug: 'bolivia',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → BO',
  dialCode: '+591',
  currency: 'USD',
  lede: 'Bolivia is landlocked, mining-anchored and reached through Chile, which makes the Chilean transit file half the job. Containers discharge at Arica or Iquique and climb to Tambo Quemado at four thousand five hundred metres before they are anywhere near a Bolivian customs office. Altitude is not a detail here — it is where the goods work, and seal compounds and cooling behave differently at that height whatever the part number says.',
  facts: [
    { label: 'Typical transit', value: 'Typically 45–58 days from dispatch, sea and road combined' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali round the Cape and through the Panama Canal to Arica or Iquique, then bonded road over Tambo Quemado · Air freight into Santa Cruz or La Paz where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'DAP to the buyer’s site · CIF Arica · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'Chilean transit documents for the bonded move · Bolivian customs declaration raised by the importer · Certificate of Origin, Dubai Chamber attested · Documents in Spanish',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea + road' },
    { label: 'Border crossing', value: 'Tambo Quemado · Chungará' },
    { label: 'Transit', value: '45–58 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Bolivia'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'TAMBO QUEMADO', coords: [-69.03, -18.27], dx: -11, dy: 8, anchor: 'end' },
    routes: [
      {
        mode: 'SEA + ROAD',
        primary: true,
        points: leg(CAPE_TO_SOUTH_ATLANTIC, [-32.0, -12.0], [-42.0, 0.0], [-62.0, 10.0], [-77.0, 9.5], [-79.5, 8.0], [-82.0, 0.0], [-78.0, -12.0], [-70.31, -18.48], [-69.03, -18.27]),
      },
      { mode: 'AIR', points: leg(SOUTH_AMERICA_AIR, [-45.0, -14.0], [-63.14, -17.65]) },
    ],
  },
  freight: [
    { name: 'Sea + road', transit: '45–58 days', route: 'Arica or Iquique, then bonded over Tambo Quemado', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '6–10 days', route: 'DXB to VVI or LPB, with connections', useCase: 'When the line is down' },
    { name: 'Sea + road, LCL', transit: '52–68 days', route: 'Consolidated to Arica, then road', useCase: 'Small mixed orders' },
  ],
  orderSteps: {
    third: 'The Chilean transit documents for the bonded move are raised alongside the Bolivian declaration, and the site altitude is confirmed so the specification is checked against it.',
    fourth: 'Goods sail to Arica and climb over Tambo Quemado, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Santa Cruz', coords: [-63.18, -17.78], region: 'Santa Cruz', plot: true, dx: 9, dy: 4 },
    { name: 'La Paz', coords: [-68.15, -16.5], region: 'La Paz', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'El Alto', coords: [-68.19, -16.5], region: 'La Paz' },
    { name: 'Oruro', coords: [-67.11, -17.98], region: 'Oruro', plot: true, dx: 9, dy: -4 },
    { name: 'Cochabamba', coords: [-66.16, -17.39], region: 'Cochabamba', plot: true, dx: 9, dy: -5 },
    { name: 'Potosí', coords: [-65.75, -19.59], region: 'Potosí', plot: true, dx: 9, dy: 4 },
    { name: 'Sucre', coords: [-65.26, -19.03], region: 'Chuquisaca' },
    { name: 'Tarija', coords: [-64.73, -21.53], region: 'Tarija', plot: true, dx: 9, dy: 4 },
    { name: 'Uyuni', coords: [-66.83, -20.46], region: 'Potosí', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'San Cristóbal', coords: [-67.18, -21.12], region: 'Potosí' },
    { name: 'Montero', coords: [-63.25, -17.34], region: 'Santa Cruz' },
    { name: 'Yacuiba', coords: [-63.64, -22.02], region: 'Tarija' },
  ],
  sectors: [
    { slug: 'mining', name: 'Mining', description: 'Silver, zinc, tin and lithium across the altiplano — dust-rated, high-cycle components rated for altitude.' },
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Gas field and compressor-station support in Tarija and the southern basin.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for hydro, gas and thermal generation.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and batching-plant hydraulics for road and mine development.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'Cylinders and valves for smelter, concentrator and forming lines.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Winch and deck hydraulics for river barge and lifting equipment.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Bolivia?', answer: 'No. Bolivia is supplied from our Dubai warehouse, by sea to Arica or Iquique in Chile and then under bond over Tambo Quemado.' },
    { question: 'Why is this the longest lane you run?', answer: 'Because it is the Pacific lane plus a mountain. Six weeks by sea round the Cape and through the Panama Canal, then a bonded road leg that climbs to four and a half thousand metres before it reaches a Bolivian customs office.' },
    { question: 'What certification do we need?', answer: 'There is no general pre-shipment conformity scheme for industrial hose and fittings. The file that matters is the transit file — the Chilean documents for the bonded move and the Bolivian declaration, which have to agree line for line.' },
    {
      question: 'Does altitude change what you supply?',
      answer:
        'It changes what we recommend, and it should. Most Bolivian industrial sites sit between three and four and a half thousand metres. Seal compounds, cooling capacity and cycle life all behave differently up there. Tell us the site at quotation and we will flag where a standard specification is the wrong choice.',
    },
    { question: 'Arica or Iquique?', answer: 'Whichever has the better sailing for the order. Both feed the same road over Tambo Quemado, so the choice is schedule rather than geography.' },
    { question: 'Can you deliver to the mine sites?', answer: 'Yes, on DAP terms to the mine gate. The leg beyond Oruro or Potosí is quoted rather than estimated — these are real roads at real altitude.' },
    { question: 'What currency do you quote in?', answer: 'USD. It is what mining supply contracts here are written in and it avoids a second conversion at the Chilean transit stage.' },
    { question: 'Is it worth batching orders?', answer: 'Strongly. On a lane this long a single consolidated consignment under one transit declaration lands far better than several small ones each carrying their own border risk.' },
  ],
  compliance: {
    heading: 'A Chilean transit file, then four and a half thousand metres',
    body:
      'Bolivia is landlocked and served through Chile, so every consignment carries two customs files. The goods discharge at Arica or Iquique and travel under Chilean bond to Tambo Quemado, where the Bolivian entry is made; the two documents describe the same cargo and must agree line for line, because a discrepancy stops the truck at a border post at four and a half thousand metres rather than at either customs office. Neither country applies a general pre-shipment conformity scheme to industrial hose and fittings, so there is nothing to certify before the goods move. The other half of this page is the altitude itself, and it is a specification question rather than a logistics one: most Bolivian industrial sites sit above three thousand metres, where seal compounds, cooling capacity and cycle life all behave differently from the datasheet. We would rather be told the site and flag it than supply exactly to the part number and be right on paper.',
    documents: [
      { ref: 'TRANSIT', name: 'Chilean transit declaration for the bonded move', issuer: 'The forwarder, at Arica or Iquique', when: 'Before the road leg' },
      { ref: 'DUI', name: 'Bolivian customs import declaration', issuer: 'The importer, through Aduana Nacional', when: 'Before arrival at the border' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'PL', name: 'Packing list in Spanish, matching both declarations', issuer: 'Us, at dispatch', when: 'Before the vessel sails' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the mine specification calls for them' },
    ],
  },
}

const PARAGUAY: MarketPage = {
  slug: 'paraguay',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → PY',
  dialCode: '+595',
  currency: 'USD',
  lede: 'Paraguay is landlocked and reached up a river. Containers discharge at Montevideo or Buenos Aires and travel fifteen hundred kilometres north by barge on the Paraná to Asunción, which is slow, cheap and entirely dependent on the water level. In a dry season the barge convoys lighten their loads and the schedule stretches; that is the single most useful thing to know about this lane and it is why we quote the river leg rather than estimating it.',
  facts: [
    { label: 'Typical transit', value: 'Typically 45–60 days from dispatch, sea and river combined' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali round the Cape to Montevideo, then barge up the Paraná to Asunción · Buenos Aires where the sailing suits · Road from Montevideo where the river is low · Air freight into Asunción where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'DAP to the buyer’s site · CIF Montevideo · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'Uruguayan or Argentine transit documents for the river leg · Paraguayan customs declaration raised by the importer · Certificate of Origin, Dubai Chamber attested · Documents in Spanish',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea + river' },
    { label: 'Port of entry', value: 'Asunción · river port' },
    { label: 'Transit', value: '45–60 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Paraguay'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'ASUNCIÓN · RIVER PORT', coords: [-57.63, -25.27], legend: 'Port of entry', dx: -11, dy: 10, anchor: 'end' },
    routes: [
      {
        mode: 'SEA + RIVER',
        primary: true,
        points: leg(CAPE_TO_SOUTH_ATLANTIC, [-30.0, -30.0], [-45.0, -34.0], [-56.2, -34.9], [-58.3, -34.5], [-58.5, -32.5], [-58.2, -29.0], [-57.9, -27.3], [-57.63, -25.27]),
      },
      { mode: 'AIR', points: leg(SOUTH_AMERICA_AIR, [-45.0, -22.0], [-57.52, -25.24]) },
    ],
  },
  freight: [
    { name: 'Sea + river', transit: '45–60 days', route: 'Montevideo, then barge up the Paraná', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '6–9 days', route: 'DXB to ASU, with connections', useCase: 'When the line is down' },
    { name: 'Sea + road', transit: '42–52 days', route: 'Montevideo, then road', useCase: 'When the river is low' },
  ],
  orderSteps: {
    third: 'The river leg is quoted against the current water level rather than a seasonal average, and the transit documents are raised for whichever routing that produces.',
    fourth: 'Goods sail to Montevideo and travel north by barge or road, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Asunción', coords: [-57.58, -25.28], region: 'Asunción', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Villeta', coords: [-57.55, -25.51], region: 'Central' },
    { name: 'San Lorenzo', coords: [-57.51, -25.34], region: 'Central' },
    { name: 'Ciudad del Este', coords: [-54.61, -25.51], region: 'Alto Paraná', plot: true, dx: 9, dy: 4 },
    { name: 'Hernandarias', coords: [-54.64, -25.4], region: 'Alto Paraná' },
    { name: 'Encarnación', coords: [-55.87, -27.33], region: 'Itapúa', plot: true, dx: 9, dy: 6 },
    { name: 'Concepción', coords: [-57.43, -23.4], region: 'Concepción', plot: true, dx: 9, dy: -4 },
    { name: 'Pedro Juan Caballero', coords: [-55.73, -22.55], region: 'Amambay', plot: true, dx: 9, dy: -4 },
    { name: 'Villarrica', coords: [-56.44, -25.75], region: 'Guairá' },
    { name: 'Coronel Oviedo', coords: [-56.44, -25.44], region: 'Caaguazú' },
    { name: 'Filadelfia', coords: [-60.55, -22.35], region: 'Boquerón', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Mariscal Estigarribia', coords: [-60.62, -22.03], region: 'Boquerón' },
  ],
  sectors: [
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and batching-plant hydraulics for road, dam and silo works.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for the Itaipú and Yacyretá hydro plant and their maintenance programmes.' },
    { slug: 'mining', name: 'Mining', description: 'Dust-rated, high-cycle components for cement, aggregate and lime plant.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Winch, deck and hatch hydraulics for the Paraná barge fleet — the country’s main freight artery.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'Cylinders and valves for forming, fabrication and processing lines.' },
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Fuel terminal and bulk-handling support on the river.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Paraguay?', answer: 'No. Paraguay is supplied from our Dubai warehouse, by sea to Montevideo and then north by barge on the Paraná.' },
    {
      question: 'Why does the transit vary so much?',
      answer:
        'The river. Barge convoys on the Paraná lighten their loads when the water is low, which stretches the schedule and sometimes moves cargo onto the road instead. We quote the leg against the level at the time rather than a seasonal average that would be wrong half the year.',
    },
    { question: 'What certification do we need?', answer: 'There is no general pre-shipment conformity scheme for industrial hose and fittings. The file is the transit documents for the river leg, the Paraguayan declaration and the origin certificate.' },
    { question: 'Montevideo or Buenos Aires?', answer: 'Whichever has the better sailing and the better barge connection for the week in question. Both feed the same river, so it is a schedule decision rather than a geographic one.' },
    { question: 'Can you deliver to Ciudad del Este?', answer: 'Yes, on DAP terms. For the eastern border region the road leg from Asunción is straightforward and it is priced, not estimated.' },
    { question: 'Can you deliver to the Chaco?', answer: 'Yes, to Filadelfia and Mariscal Estigarribia. It is a long road leg across the Chaco and it is quoted rather than estimated, because the surface changes materially with the rain.' },
    { question: 'What currency do you quote in?', answer: 'USD. It is what import contracts here are written in.' },
    { question: 'Is it worth batching orders?', answer: 'Yes. On a river lane a single consignment under one transit declaration is far better than several small ones, each of which carries its own barge schedule and its own border risk.' },
  ],
  compliance: {
    heading: 'The river level is the schedule',
    body:
      'Paraguay is landlocked and reached up the Paraná, so its lane has a variable no other market on this network has: the water. Containers discharge at Montevideo or Buenos Aires and travel roughly fifteen hundred kilometres north by barge, which is slow and cheap and entirely dependent on the level. In a dry season convoys lighten their loads, the schedule stretches, and cargo sometimes moves to the road instead at a different price. That is not a risk to hide in a transit band — it is the most useful thing a buyer here can be told, so we quote the river leg against the actual level rather than a seasonal average. The paperwork is ordinary by comparison: transit documents for the Uruguayan or Argentine leg, a Paraguayan declaration that has to agree with them line for line, an attested certificate of origin, and no product conformity scheme to satisfy.',
    documents: [
      { ref: 'TRANSIT', name: 'Uruguayan or Argentine transit documents for the river leg', issuer: 'The forwarder, at the discharge port', when: 'Before the river leg' },
      { ref: 'DECL', name: 'Paraguayan customs import declaration', issuer: 'The importer, through Aduanas', when: 'Before arrival' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'PL', name: 'Packing list in Spanish, matching both declarations', issuer: 'Us, at dispatch', when: 'Before the vessel sails' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the order calls for them' },
    ],
  },
}

const URUGUAY: MarketPage = {
  slug: 'uruguay',
  regulatoryCopy: 'unverified',
  released: false,
  lane: 'DXB → UY',
  dialCode: '+598',
  currency: 'USD',
  lede: 'Uruguay is a small market with a disproportionately useful port. Montevideo is the entry for its own industry and the transhipment point for a great deal of Paraguayan and Bolivian cargo, and the free-port regime is why: goods can sit, be consolidated and be re-dispatched without entering the country’s customs territory. For a buyer here that means a light import file. For a buyer further up the river it means Montevideo is where a consignment is put together.',
  facts: [
    { label: 'Typical transit', value: 'Typically 33–42 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali round the Cape to Montevideo · Nueva Palmira for river-bound cargo · Air freight into Montevideo where the schedule is tighter',
    },
    { label: 'Incoterms 2020', value: 'CIF Montevideo · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'Customs declaration raised by the importer · Free-port storage documentation where the cargo is transhipping · Certificate of Origin, Dubai Chamber attested · Documents in Spanish',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via the Cape' },
    { label: 'Port of entry', value: 'Montevideo' },
    { label: 'Transit', value: '33–42 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Uruguay'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'MONTEVIDEO · PORT', coords: [-56.21, -34.9], legend: 'Port of entry', dx: 11, dy: 10, anchor: 'start' },
    routes: [
      { mode: 'SEA · CAPE', primary: true, points: leg(CAPE_TO_SOUTH_ATLANTIC, [-30.0, -30.0], [-45.0, -34.0], [-53.0, -35.5], [-56.21, -34.9]) },
      { mode: 'AIR', points: leg(SOUTH_AMERICA_AIR, [-45.0, -28.0], [-56.03, -34.84]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '33–42 days', route: 'Jebel Ali to Montevideo, via the Cape', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '5–8 days', route: 'DXB to MVD, with a connection', useCase: 'When the line is down' },
    { name: 'Sea, LCL', transit: '40–52 days', route: 'Consolidated, with transhipment', useCase: 'Small mixed orders' },
  ],
  orderSteps: {
    third: 'Where the cargo is transhipping onward the free-port documentation is arranged so it never enters customs territory; where it is staying, the ordinary declaration is prepared.',
    fourth: 'Goods sail from Jebel Ali round the Cape, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Montevideo', coords: [-56.19, -34.9], region: 'Montevideo', plot: true, dx: 9, dy: 6 },
    { name: 'Nueva Palmira', coords: [-58.41, -33.88], region: 'Colonia', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Colonia del Sacramento', coords: [-57.84, -34.47], region: 'Colonia' },
    { name: 'Fray Bentos', coords: [-58.3, -33.13], region: 'Río Negro', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Paysandú', coords: [-58.08, -32.32], region: 'Paysandú', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Salto', coords: [-57.96, -31.39], region: 'Salto', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Rivera', coords: [-55.55, -30.9], region: 'Rivera', plot: true, dx: 9, dy: -4 },
    { name: 'Canelones', coords: [-56.28, -34.52], region: 'Canelones' },
    { name: 'La Paz', coords: [-56.22, -34.76], region: 'Canelones' },
    { name: 'Punta del Este', coords: [-54.95, -34.95], region: 'Maldonado', plot: true, dx: 9, dy: 8 },
    { name: 'Durazno', coords: [-56.52, -33.38], region: 'Durazno' },
    { name: 'Tacuarembó', coords: [-55.98, -31.71], region: 'Tacuarembó' },
  ],
  sectors: [
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery, winch and terminal hydraulics for the Montevideo port and the river fleet.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for hydro, thermal and wind generation.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and batching-plant hydraulics for infrastructure and mill projects.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'Cylinders and valves for forming and fabrication lines.' },
    { slug: 'mining', name: 'Mining', description: 'Dust-rated, high-cycle components for cement, aggregate and quarry plant.' },
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Refinery and terminal support at La Teja and the coastal storage.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Uruguay?', answer: 'No. Uruguay is supplied from our Dubai warehouse, round the Cape of Good Hope into Montevideo.' },
    {
      question: 'What is the free-port regime and does it help us?',
      answer:
        'It lets goods be stored, consolidated and re-dispatched at Montevideo without entering Uruguayan customs territory. If your cargo is staying it makes no difference. If it is going on to Paraguay or Bolivia it is the reason Montevideo is worth using at all.',
    },
    { question: 'What certification do we need?', answer: 'There is no general pre-shipment conformity scheme for industrial hose and fittings. The file is the declaration, the invoice and packing list, and the origin certificate.' },
    { question: 'Can you consolidate here for onward shipment?', answer: 'Yes, and it is often the right answer for the river markets. A consignment assembled under free-port storage and dispatched once travels better than several small ones arriving separately.' },
    { question: 'Montevideo or Nueva Palmira?', answer: 'Montevideo for almost everything. Nueva Palmira where the cargo is river-bound and the barge connection there is better than trucking from the capital.' },
    { question: 'What language do the documents need to be in?', answer: 'Spanish, with the description agreeing across the invoice, the packing list and the declaration.' },
    { question: 'What currency do you quote in?', answer: 'USD. It is what import and transhipment contracts here are written in.' },
    { question: 'Do you crimp assemblies to length?', answer: 'Yes, in Dubai, pressure-tested and tagged before packing. Send bore, thread and pressure, or a photo of the failed assembly, plus the length between fitting faces.' },
  ],
  compliance: {
    heading: 'A light file, and a port that works for other people’s cargo',
    body:
      'Uruguay applies no general pre-shipment conformity scheme to industrial hose and fittings, so a consignment staying here clears on a short file: a declaration against the invoice and packing list, in Spanish, with an attested certificate of origin. What makes Montevideo worth more than its own market size is the free-port regime. Goods can be landed, stored, consolidated and re-dispatched without entering Uruguayan customs territory at all, which is why a great deal of Paraguayan and Bolivian cargo is assembled here rather than shipped piecemeal up the river. If your consignment is transhipping, say so at quotation: the documentation is different from the outset, and a consignment declared for import and then re-exported is a far more expensive way to reach the same place.',
    documents: [
      { ref: 'DUA', name: 'Customs import declaration', issuer: 'The importer, through Aduanas', when: 'Before arrival' },
      { ref: 'FREE', name: 'Free-port storage documentation, where transhipping', issuer: 'The port operator', when: 'On arrival' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'PL', name: 'Packing list in Spanish, matching the declaration', issuer: 'Us, at dispatch', when: 'Before the vessel sails' },
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
  BRAZIL,
  GUYANA,
  CHILE,
  PERU,
  COLOMBIA,
  ECUADOR,
  ARGENTINA,
  SURINAME,
  BOLIVIA,
  PARAGUAY,
  URUGUAY,
  GEORGIA,
  ARMENIA,
  MOLDOVA,
  UKRAINE,
]
