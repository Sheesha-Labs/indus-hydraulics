import type { MarketPage } from './market-pages'

/**
 * Wave 4 — the seven markets that were held for an export-compliance ruling.
 *
 * RUSSIA · BELARUS · LIBYA · SUDAN · SOUTH SUDAN · VENEZUELA · MYANMAR
 *
 * WHY THESE WERE HELD, AND WHY THEY ARE HERE NOW. Every one sits under an
 * active sanctions regime — EU, US and UK measures on Russia and Belarus, UN
 * measures touching Libya, Sudan and South Sudan, US oil-sector sanctions on
 * Venezuela, EU and US measures on Myanmar — and hydraulic and oilfield
 * equipment is the category most likely to engage dual-use and end-use
 * controls. The UAE operates its own re-export regime on top of all of it.
 *
 * The design handoff asked for a written compliance ruling before any of these
 * pages solicited an order. The founder was shown that requirement, the
 * specific regimes, and three options — a screening notice in place of the
 * forms, the full template, or holding until a ruling was on file — and chose
 * the full template on 2026-08-23. That is a business decision the founder is
 * entitled to make and it is recorded here rather than re-argued in review.
 *
 * NO WRITTEN RULING WAS ON FILE WHEN THESE WERE WRITTEN.
 *
 * WHAT THAT MEANS FOR THE COPY. Every record's compliance block states that
 * counterparty and end-use screening happens before a quotation rather than
 * after — which is both true of how the desk should work and the honest thing
 * to publish. That is not a substitute for a ruling and does not pretend to be.
 *
 * Four of these are conflict-affected — Libya, Sudan, South Sudan and Myanmar
 * — and follow the Ukraine pattern: routing and timings confirmed per
 * consignment rather than published, because the corridors open and close on
 * circumstances no supplier controls.
 *
 * ALL SEVEN ARE RELEASED as of 2026-08-24. They were authored
 * `released: false` like every other market; the founder was shown this
 * file's sanctions list again on release day, asked specifically whether the
 * seven should go live with the other 73, and said yes. Still no written
 * compliance ruling on file — the screening-before-quotation copy is what
 * stands in for one.
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

/** Down the Gulf and into the Red Sea — the short leg, for Port Sudan. */
const TO_RED_SEA = [
  [55.03, 25.01],
  [56.6, 26.55],
  [59.9, 22.3],
  [57.0, 15.5],
  [52.0, 12.5],
  [45.0, 12.3],
  [43.4, 12.6],
] as const

/** DXB north-west over Arabia — the shared air leg for this cluster. */
const NORTHWEST_AIR = [
  [55.36, 25.25],
  [48.0, 30.0],
  [40.0, 35.0],
] as const

const RUSSIA: MarketPage = {
  slug: 'russia',
  regulatoryCopy: 'verified',
  released: true,
  lane: 'DXB → RU',
  dialCode: '+7',
  currency: 'USD',
  localName: 'Россия',
  lede: 'Russia is the one market on this network where GOST is the native standard rather than an export requirement — everywhere else we hold GOST couplings so a machine built in Italy or Türkiye can be plumbed for a Russian contract, and here they are simply the fitting. Novorossiysk on the Black Sea is the natural gate from Suez. Every consignment is screened for counterparty and end use before we quote, not after.',
  facts: [
    { label: 'Typical transit', value: 'Typically 20–28 days by sea from dispatch, subject to screening' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali through Suez and the Bosphorus to Novorossiysk · St Petersburg for the north-west where the routing permits · Air freight where the schedule is tighter · Routing confirmed per consignment',
    },
    { label: 'Incoterms 2020', value: 'CIF Novorossiysk · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'Counterparty and end-use screening before quotation · EAC declaration or certificate in the importer’s name · GOST conformity where the line is regulated · Certificate of Origin, Dubai Chamber attested',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via Suez' },
    { label: 'Port of entry', value: 'Novorossiysk' },
    { label: 'Transit', value: '20–28 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'After screening clears' },
  ],
  map: {
    geoNames: ['Russia'],
    // European Russia only. The Natural Earth feature spans eleven time zones
    // to Kamchatka, which would put the frame across half the planet.
    mainland: [19.0, 41.0, 70.0, 70.0],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'NOVOROSSIYSK · PORT', coords: [37.77, 44.72], legend: 'Port of entry', dx: -11, dy: 10, anchor: 'end' },
    routes: [
      { mode: 'SEA · SUEZ', primary: true, points: leg(SUEZ_TO_MED, [30.0, 33.0], [26.0, 36.0], [26.2, 40.0], [29.1, 41.2], [33.0, 43.0], [37.77, 44.72]) },
      { mode: 'AIR', points: leg(NORTHWEST_AIR, [37.41, 55.97]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '20–28 days', route: 'Jebel Ali to Novorossiysk, via Suez', useCase: 'Default, subject to screening' },
    { name: 'Air freight', transit: '3–6 days', route: 'Where the routing permits', useCase: 'When the line is down' },
    { name: 'Sea + rail', transit: '28–40 days', route: 'Novorossiysk, then rail inland', useCase: 'Beyond the southern regions' },
  ],
  orderSteps: {
    third:
      'Counterparty and end-use screening is completed before a quotation is issued, and the EAC documentation is raised in the importer’s name before the goods move.',
    fourth: 'Where screening clears, goods sail from Jebel Ali on the confirmed routing with the paperwork and tracking together.',
  },
  cities: [
    { name: 'Novorossiysk', coords: [37.77, 44.72], region: 'Krasnodar Krai' },
    { name: 'Moscow', coords: [37.62, 55.75], region: 'Moscow', plot: true, dx: 9, dy: -5 },
    { name: 'St Petersburg', coords: [30.34, 59.93], region: 'North-West', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Rostov-on-Don', coords: [39.72, 47.24], region: 'Rostov Oblast', plot: true, dx: 9, dy: -4 },
    { name: 'Krasnodar', coords: [38.98, 45.04], region: 'Krasnodar Krai' },
    { name: 'Volgograd', coords: [44.52, 48.71], region: 'Volgograd Oblast', plot: true, dx: 9, dy: 4 },
    { name: 'Samara', coords: [50.15, 53.2], region: 'Samara Oblast', plot: true, dx: 9, dy: -4 },
    { name: 'Kazan', coords: [49.11, 55.79], region: 'Tatarstan' },
    { name: 'Ufa', coords: [55.97, 54.74], region: 'Bashkortostan', plot: true, dx: 9, dy: 4 },
    { name: 'Perm', coords: [56.23, 58.01], region: 'Perm Krai' },
    { name: 'Yekaterinburg', coords: [60.6, 56.84], region: 'Sverdlovsk Oblast', plot: true, dx: 9, dy: -4 },
    { name: 'Chelyabinsk', coords: [61.4, 55.16], region: 'Chelyabinsk Oblast' },
    { name: 'Nizhny Novgorod', coords: [44.0, 56.33], region: 'Nizhny Novgorod Oblast' },
    { name: 'Voronezh', coords: [39.2, 51.67], region: 'Voronezh Oblast' },
    { name: 'Murmansk', coords: [33.08, 68.97], region: 'Murmansk Oblast', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Astrakhan', coords: [48.03, 46.35], region: 'Astrakhan Oblast' },
  ],
  sectors: [
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Upstream, refinery and pipeline support — GOST-pattern couplings as the native standard rather than an export fitting.' },
    { slug: 'mining', name: 'Mining', description: 'Coal, potash and metals — dust-rated, high-cycle components rated for extreme low temperature.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for the Urals and Volga rolling lines.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for thermal, hydro and combined-heat plant.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery and vessel hydraulics for the Black Sea, Baltic and Arctic fleets.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and tunnelling hydraulics for infrastructure works.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Russia?', answer: 'No. Russia is supplied from our Dubai warehouse, by sea through Suez and the Bosphorus into Novorossiysk where routing and screening permit.' },
    {
      question: 'What screening do you carry out?',
      answer:
        'Counterparty and end-use screening before we quote rather than after. That means we check who the buyer is, what the equipment is for and where it will be installed, and we will decline plainly where we cannot satisfy ourselves rather than accepting an order and withdrawing later.',
    },
    {
      question: 'Do you hold GOST-pattern couplings?',
      answer:
        'Yes, and this is the market where they are the native fitting rather than an export requirement. We stock GOST alongside DIN, BSP, JIC and ORFS, which is also why a machine built in Italy or Türkiye for a Russian contract can be plumbed from one order.',
    },
    { question: 'Do we need EAC certification?', answer: 'Yes for goods inside the Eurasian Economic Union technical regulations, raised in the importer’s name. The scope over hose assemblies and accumulators is worth confirming per product rather than assuming.' },
    { question: 'Does the cold change what you supply?', answer: 'For anything working outdoors east of the Volga or in the north, yes. A standard compound stiffens well above the temperatures those sites see, so we specify low-temperature material and say plainly when a catalogue item is unsuitable.' },
    { question: 'Can you commit to a transit time?', answer: 'To the port, within the band shown, once screening has cleared. Beyond that the inland leg is quoted per consignment rather than published, because rail and road availability varies more than a page can usefully state.' },
    { question: 'What currency do you quote in?', answer: 'USD. It is what the supply contracts are written in and what the customs value will be declared against.' },
    { question: 'Can you supply API-monogrammed equipment?', answer: 'Yes. API 6A wellhead, API 16A BOP, API 16C choke and kill and API 7K drilling hose, with NACE MR0175 material documentation where the contract requires it.' },
  ],
  compliance: {
    heading: 'Screened before quotation, not after',
    body:
      'Russia sits under extensive European, American and British sanctions measures, and hydraulic and oilfield equipment is among the categories most likely to engage dual-use and end-use controls. The United Arab Emirates operates its own re-export regime on top of that. So the first step on this lane is not freight and not certification: it is counterparty and end-use screening, carried out before a quotation is issued rather than after an order is accepted. We check who the buyer is, what the equipment is for and where it will be installed, and we decline plainly where we cannot satisfy ourselves — which is a better outcome for both sides than a withdrawal after commitment. Where screening clears, the ordinary requirements follow: EAC documentation raised in the importer’s name, GOST conformity where a line is regulated, and low-temperature compounds specified for sites that need them.',
    documents: [
      { ref: 'SCREEN', name: 'Counterparty and end-use screening', issuer: 'Us, before quotation', when: 'Before anything else' },
      { ref: 'EAC', name: 'EAC declaration or certificate of conformity', issuer: 'Accredited body, in the importer’s name', when: 'Before the goods move' },
      { ref: 'GOST', name: 'GOST conformity, where the line is regulated', issuer: 'Accredited body', when: 'At quotation, per product' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'MTC', name: 'Material and test certificates', issuer: 'Mill, or our test bench', when: 'Where the order calls for them' },
    ],
  },
}

const BELARUS: MarketPage = {
  slug: 'belarus',
  regulatoryCopy: 'verified',
  released: true,
  lane: 'DXB → BY',
  dialCode: '+375',
  currency: 'USD',
  localName: 'Беларусь',
  lede: 'Belarus is landlocked and its industry is unusually concentrated: potash at Salihorsk, refineries at Mazyr and Navapolatsk, and the Zhodzina works that builds some of the largest haul trucks on earth. Those trucks run hydraulics at a scale most catalogues do not reach. Klaipėda in Lithuania is the practical gate, followed by a bonded road move. Every consignment is screened for counterparty and end use before we quote.',
  facts: [
    { label: 'Typical transit', value: 'Typically 30–40 days from dispatch, subject to screening and routing' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali through Suez and the Baltic to Klaipėda, then bonded road through Kamenny Log · Routing confirmed per consignment · Air freight where the schedule is tighter and the routing permits',
    },
    { label: 'Incoterms 2020', value: 'DAP to the buyer’s site · CIF Klaipėda · FOB Jebel Ali · EXW Dubai for a nominated forwarder' },
    {
      label: 'Documentation',
      value:
        'Counterparty and end-use screening before quotation · EAC declaration or certificate in the importer’s name · EU transit documents for the road leg · Certificate of Origin, Dubai Chamber attested',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea + road' },
    { label: 'Border crossing', value: 'Kamenny Log · Medininkai' },
    { label: 'Transit', value: 'Quoted per consignment' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'After screening clears' },
  ],
  map: {
    geoNames: ['Belarus'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'KAMENNY LOG', coords: [25.68, 54.35], dx: -11, dy: 10, anchor: 'end' },
    routes: [
      {
        mode: 'SEA + ROAD',
        primary: true,
        points: [[55.03, 25.01], [56.6, 26.55], [59.9, 22.3], [57.0, 15.5], [52.0, 12.5], [45.0, 12.3], [43.4, 12.6], [38.0, 20.0], [32.6, 29.9], [28.0, 33.5], [11.0, 37.2], [-5.6, 35.95], [-9.5, 43.0], [-1.5, 50.0], [4.0, 53.5], [10.0, 57.0], [13.0, 55.5], [19.0, 55.5], [21.13, 55.7], [25.68, 54.35], [27.56, 53.9]],
      },
      { mode: 'AIR', points: leg(NORTHWEST_AIR, [27.55, 53.88]) },
    ],
  },
  freight: [
    { name: 'Sea + road', transit: '30–40 days', route: 'Klaipėda, then bonded through Kamenny Log', useCase: 'Default, subject to screening' },
    { name: 'Air freight', transit: 'Quoted per consignment', route: 'Where the routing permits', useCase: 'When the line is down' },
    { name: 'Sea + rail', transit: 'Quoted per consignment', route: 'Where a rail routing is available', useCase: 'Heavy and project cargo' },
  ],
  orderSteps: {
    third:
      'Counterparty and end-use screening is completed before a quotation is issued, and the transit documents for the road leg follow the routing that is actually available.',
    fourth: 'Where screening clears, goods sail to Klaipėda and cross under bond, with the paperwork and tracking together.',
  },
  cities: [
    { name: 'Minsk', coords: [27.57, 53.9], region: 'Minsk', plot: true, dx: 9, dy: -5 },
    { name: 'Salihorsk', coords: [27.54, 52.79], region: 'Minsk Region', plot: true, dx: 9, dy: 8 },
    { name: 'Zhodzina', coords: [28.34, 54.1], region: 'Minsk Region', plot: true, dx: 9, dy: -4 },
    { name: 'Barysaw', coords: [28.51, 54.23], region: 'Minsk Region' },
    { name: 'Mazyr', coords: [29.24, 52.05], region: 'Homel Region', plot: true, dx: 9, dy: 6 },
    { name: 'Homel', coords: [30.98, 52.43], region: 'Homel Region', plot: true, dx: 9, dy: 4 },
    { name: 'Navapolatsk', coords: [28.63, 55.53], region: 'Vitebsk Region', plot: true, dx: 9, dy: -4 },
    { name: 'Polatsk', coords: [28.79, 55.49], region: 'Vitebsk Region' },
    { name: 'Vitebsk', coords: [30.2, 55.19], region: 'Vitebsk Region' },
    { name: 'Hrodna', coords: [23.83, 53.68], region: 'Hrodna Region', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Brest', coords: [23.7, 52.1], region: 'Brest Region', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Babruysk', coords: [29.22, 53.15], region: 'Mahilyow Region' },
  ],
  sectors: [
    { slug: 'mining', name: 'Mining', description: 'Potash at Salihorsk — dust-rated, high-cycle components for hoist, conveyor and processing plant.' },
    { slug: 'construction', name: 'Construction', description: 'Haul truck and heavy machinery builders at Zhodzina, running hydraulics at a scale most catalogues do not reach.' },
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Refinery and pipeline support at Mazyr and Navapolatsk.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for forming and rolling lines.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for thermal and combined-heat plant.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Winch and lifting hydraulics for inland handling equipment.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Belarus?', answer: 'No. Belarus is supplied from our Dubai warehouse, by sea to Klaipėda and then by bonded road where routing and screening permit.' },
    {
      question: 'What screening do you carry out?',
      answer:
        'Counterparty and end-use screening before we quote rather than after. We check who the buyer is, what the equipment is for and where it will be installed, and we decline plainly where we cannot satisfy ourselves rather than withdrawing after commitment.',
    },
    {
      question: 'Can you supply for the large haul trucks?',
      answer:
        'Where the specification is within what we hold, yes — and it is worth sending the drawing rather than a part number, because equipment at that scale runs bore sizes and working pressures above most catalogue ranges. We will say plainly where an assembly is outside what we can supply.',
    },
    { question: 'Why does the page not state a firm transit time?', answer: 'Because the routing is confirmed per consignment. Corridors into Belarus have changed more than once and publishing a band that assumes one would be a promise we cannot keep. The sea leg is predictable; the road leg is quoted at the time.' },
    { question: 'Do we need EAC certification?', answer: 'Yes for goods inside the Eurasian Economic Union technical regulations, raised in the importer’s name. Belarus is a union member, so the framework is the same as Kazakhstan and Armenia.' },
    { question: 'Can you supply for potash handling?', answer: 'Yes — abrasion covers and corrosion-resistant assemblies for hoist, conveyor and processing duty. Potash is harder on a cover than its appearance suggests, so tell us the position in the circuit.' },
    { question: 'What currency do you quote in?', answer: 'USD. It is what import contracts here are written in and what the customs value will be declared against.' },
    { question: 'Does the cold change what you supply?', answer: 'For outdoor duty, yes. A standard compound stiffens well above Belarusian winter temperatures, so we specify low-temperature material where the assembly is exposed.' },
  ],
  compliance: {
    heading: 'Screening first, then a routing that is confirmed rather than assumed',
    body:
      'Belarus sits under European, American and British sanctions measures, and hydraulic and oilfield equipment is among the categories most likely to engage dual-use and end-use controls — with the United Arab Emirates operating its own re-export regime as well. Counterparty and end-use screening therefore happens before a quotation is issued, not after an order is taken: we establish who the buyer is, what the equipment is for and where it will be installed, and decline plainly where we cannot satisfy ourselves. The second thing this page does not do is publish a transit band it cannot keep. Corridors into Belarus have changed more than once and a landlocked market reached through a neighbour depends entirely on which road is open, so the routing and the timing are confirmed per consignment. Where screening clears and a routing exists, the ordinary requirements follow: EAC documentation in the importer’s name and transit documents for the bonded leg.',
    documents: [
      { ref: 'SCREEN', name: 'Counterparty and end-use screening', issuer: 'Us, before quotation', when: 'Before anything else' },
      { ref: 'ROUTE', name: 'Confirmed routing for the consignment', issuer: 'Agreed at quotation', when: 'Before dispatch' },
      { ref: 'EAC', name: 'EAC declaration or certificate of conformity', issuer: 'Accredited body, in the importer’s name', when: 'Before the goods move' },
      { ref: 'T1', name: 'Transit documents for the bonded road leg', issuer: 'The forwarder, at Klaipėda', when: 'Before the road leg' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
    ],
  },
}

const SUDAN: MarketPage = {
  slug: 'sudan',
  regulatoryCopy: 'verified',
  released: true,
  lane: 'DXB → SD',
  dialCode: '+249',
  currency: 'USD',
  localName: 'السودان',
  lede: 'Port Sudan is one of the closest ports to Jebel Ali on this entire network — five to eight days down the Gulf and up the Red Sea, shorter than most of the GCC road lanes. It is also among the hardest to execute. The country has been in armed conflict since 2023, so routing beyond the quay, timings and even which corridors are operating are confirmed per consignment rather than published, and every consignment is screened for counterparty and end use before we quote.',
  facts: [
    { label: 'Typical transit', value: 'Sea leg 5–8 days; onward routing confirmed per consignment' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali down the Gulf and up the Red Sea to Port Sudan · Onward movement confirmed against what is actually operating · Air freight where the schedule and the routing permit',
    },
    { label: 'Incoterms 2020', value: 'CIF Port Sudan · FOB Jebel Ali · EXW Dubai for a nominated forwarder · DAP only where the route can be committed' },
    {
      label: 'Documentation',
      value:
        'Counterparty and end-use screening before quotation · Sudanese customs declaration raised by the importer · Certificate of Origin, Dubai Chamber attested · Documents in Arabic or English',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, Red Sea' },
    { label: 'Port of entry', value: 'Port Sudan' },
    { label: 'Transit', value: 'Quoted per consignment' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'After screening clears' },
  ],
  map: {
    geoNames: ['Sudan'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'PORT SUDAN', coords: [37.22, 19.62], legend: 'Port of entry', dx: 11, dy: 10, anchor: 'start' },
    routes: [
      { mode: 'SEA · RED SEA', primary: true, points: leg(TO_RED_SEA, [41.0, 15.0], [38.5, 18.0], [37.22, 19.62]) },
      { mode: 'AIR', points: [[55.36, 25.25], [48.0, 24.0], [40.0, 20.0], [32.55, 15.59]] },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '5–8 days to the quay', route: 'Jebel Ali to Port Sudan', useCase: 'Default, subject to screening' },
    { name: 'Air freight', transit: 'Quoted per consignment', route: 'Where the routing permits', useCase: 'When the schedule allows it' },
    { name: 'Onward inland', transit: 'Quoted per consignment', route: 'Confirmed against operating corridors', useCase: 'Beyond the port' },
  ],
  orderSteps: {
    third:
      'Counterparty and end-use screening is completed before a quotation, and the onward routing is confirmed against what is actually operating rather than a published corridor.',
    fourth: 'Where screening clears, goods sail from Jebel Ali on the short Red Sea leg with the paperwork and tracking together.',
  },
  cities: [
    { name: 'Port Sudan', coords: [37.22, 19.62], region: 'Red Sea' },
    { name: 'Suakin', coords: [37.33, 19.11], region: 'Red Sea', plot: true, dx: 9, dy: 8 },
    { name: 'Khartoum', coords: [32.53, 15.5], region: 'Khartoum', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Omdurman', coords: [32.48, 15.64], region: 'Khartoum' },
    { name: 'Wad Madani', coords: [33.52, 14.4], region: 'Al Jazirah' },
    { name: 'Atbara', coords: [33.99, 17.7], region: 'River Nile', plot: true, dx: 9, dy: -4 },
    { name: 'Shendi', coords: [33.43, 16.69], region: 'River Nile' },
    { name: 'Kosti', coords: [32.66, 13.17], region: 'White Nile', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'El Obeid', coords: [30.22, 13.18], region: 'North Kordofan', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Nyala', coords: [24.88, 12.05], region: 'South Darfur', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Dongola', coords: [30.48, 19.17], region: 'Northern', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Kassala', coords: [36.4, 15.45], region: 'Kassala' },
  ],
  sectors: [
    { slug: 'mining', name: 'Mining', description: 'Gold and industrial minerals — dust-rated, high-cycle components for crusher and mill.' },
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Pipeline, pumping and terminal support on the Red Sea coast.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for hydro and thermal generation.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and batching-plant hydraulics for civil and port works.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery, crane and terminal hydraulics for the Port Sudan estate.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'Cylinders and valves for fabrication and workshop equipment.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Sudan?', answer: 'No. Sudan is supplied from our Dubai warehouse, by sea down the Gulf and up the Red Sea to Port Sudan where routing and screening permit.' },
    {
      question: 'Why is the sea leg so short but the transit not stated?',
      answer:
        'Because they are different questions. Jebel Ali to Port Sudan is five to eight days and among the shortest lanes we run. What we will not publish is a door-to-door time, because the country has been in armed conflict since 2023 and which corridors operate beyond the quay changes.',
    },
    { question: 'What screening do you carry out?', answer: 'Counterparty and end-use screening before we quote rather than after. We check who the buyer is, what the equipment is for and where it will be installed, and we decline plainly where we cannot satisfy ourselves.' },
    { question: 'Can you deliver beyond the port?', answer: 'Only where the route can actually be committed. We quote DAP where that is true and to the quay where it is not, and we say which rather than implying a door delivery we cannot stand behind.' },
    { question: 'What certification do we need?', answer: 'There is no blanket pre-shipment conformity scheme for industrial hose and fittings. The file is the declaration, the invoice and packing list, and an attested certificate of origin.' },
    { question: 'Do you carry cargo insurance on this lane?', answer: 'Cover is arranged per consignment and its scope varies with the routing. It is priced into the quotation rather than assumed, and we state what is and is not covered before you accept.' },
    { question: 'What currency do you quote in?', answer: 'USD. It is what import contracts here are written in and what the customs value will be declared against.' },
    { question: 'What language do the documents need to be in?', answer: 'Arabic or English are both workable. We issue in English and make sure the description carries into an Arabic declaration without a translator inventing a term.' },
  ],
  compliance: {
    heading: 'The shortest lane we run, and the hardest to execute',
    body:
      'Port Sudan is closer to Jebel Ali than most of the GCC by sea — five to eight days down the Gulf and up the Red Sea — and this page still refuses to publish a transit time, because the two facts are not in tension. The sea leg is short and predictable. What happens beyond the quay is not: the country has been in armed conflict since 2023, corridors operate or do not, and a door-to-door band would be a promise about circumstances no supplier controls. So the routing is confirmed per consignment, DAP is offered only where a route can genuinely be committed, and cargo cover is priced and its scope stated rather than assumed. Ahead of all of that sits counterparty and end-use screening, carried out before a quotation is issued rather than after an order is accepted, because Sudan is subject to measures that make who the buyer is and what the equipment is for the first question rather than a formality.',
    documents: [
      { ref: 'SCREEN', name: 'Counterparty and end-use screening', issuer: 'Us, before quotation', when: 'Before anything else' },
      { ref: 'ROUTE', name: 'Onward routing confirmed against operating corridors', issuer: 'Agreed at quotation', when: 'Before dispatch' },
      { ref: 'DECL', name: 'Sudanese customs import declaration', issuer: 'The importer', when: 'Before arrival' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'INS', name: 'Cargo cover, scope stated before acceptance', issuer: 'Arranged per consignment', when: 'At quotation' },
    ],
  },
}

const LIBYA: MarketPage = {
  slug: 'libya',
  regulatoryCopy: 'verified',
  released: true,
  lane: 'DXB → LY',
  dialCode: '+218',
  currency: 'USD',
  localName: 'ليبيا',
  lede: 'Libya is an oil economy with a divided administration, and the second fact shapes a consignment more than the first. Which port a shipment should use, whose clearance applies and what documentation is accepted depend on where the goods are going — Misrata and Tripoli in the west, Benghazi and the eastern terminals beyond. We confirm that per consignment rather than publishing one routing, and screening for counterparty and end use happens before we quote.',
  facts: [
    { label: 'Typical transit', value: 'Sea leg 12–18 days; routing and clearance confirmed per consignment' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali through Suez to Misrata for the west · Benghazi for the east · Onward movement confirmed against what is actually operating · Air freight where the routing permits',
    },
    { label: 'Incoterms 2020', value: 'CIF Misrata · FOB Jebel Ali · EXW Dubai for a nominated forwarder · DAP only where the route can be committed' },
    {
      label: 'Documentation',
      value:
        'Counterparty and end-use screening before quotation · Customs declaration raised by the importer under the applicable administration · Certificate of Origin, Dubai Chamber attested · Documents in Arabic or English',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via Suez' },
    { label: 'Port of entry', value: 'Misrata' },
    { label: 'Transit', value: 'Quoted per consignment' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'After screening clears' },
  ],
  map: {
    geoNames: ['Libya'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'MISRATA · PORT', coords: [15.22, 32.38], legend: 'Port of entry', dx: -11, dy: 10, anchor: 'end' },
    routes: [
      { mode: 'SEA · SUEZ', primary: true, points: leg(SUEZ_TO_MED, [28.0, 33.0], [22.0, 33.5], [15.22, 32.38]) },
      { mode: 'AIR', points: leg(NORTHWEST_AIR, [24.0, 32.0], [13.14, 32.66]) },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '12–18 days to the quay', route: 'Jebel Ali to Misrata, via Suez', useCase: 'Default, subject to screening' },
    { name: 'Air freight', transit: 'Quoted per consignment', route: 'Where the routing permits', useCase: 'When the schedule allows it' },
    { name: 'Sea, eastern ports', transit: 'Quoted per consignment', route: 'Benghazi and the eastern terminals', useCase: 'Eastern deliveries' },
  ],
  orderSteps: {
    third:
      'The applicable port and clearance are confirmed against where the goods are actually going, because the answer differs between the west and the east and a wrong assumption strands a container.',
    fourth: 'Where screening clears, goods sail from Jebel Ali through Suez with the paperwork and tracking together.',
  },
  cities: [
    { name: 'Misrata', coords: [15.09, 32.38], region: 'Tripolitania' },
    { name: 'Tripoli', coords: [13.19, 32.89], region: 'Tripolitania', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Al Khums', coords: [14.26, 32.65], region: 'Tripolitania' },
    { name: 'Zawiya', coords: [12.73, 32.76], region: 'Tripolitania', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Zliten', coords: [14.57, 32.47], region: 'Tripolitania' },
    { name: 'Benghazi', coords: [20.07, 32.12], region: 'Cyrenaica', plot: true, dx: 9, dy: -4 },
    { name: 'Tobruk', coords: [23.99, 32.08], region: 'Cyrenaica', plot: true, dx: 9, dy: -4 },
    { name: 'Marsa el Brega', coords: [19.57, 30.41], region: 'Cyrenaica', plot: true, dx: 9, dy: 8 },
    { name: 'Ras Lanuf', coords: [18.55, 30.5], region: 'Cyrenaica' },
    { name: 'Sirte', coords: [16.59, 31.2], region: 'Tripolitania', plot: true, dx: 9, dy: 6 },
    { name: 'Sabha', coords: [14.43, 27.04], region: 'Fezzan', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Ubari', coords: [12.78, 26.59], region: 'Fezzan' },
  ],
  sectors: [
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Upstream, terminal and refinery support at Marsa el Brega, Ras Lanuf and Zawiya.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for thermal generation and desalination plant.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and batching-plant hydraulics for reconstruction and civil works.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery, crane and terminal hydraulics for the Misrata and Benghazi port estates.' },
    { slug: 'mining', name: 'Mining', description: 'Dust-rated, high-cycle components for cement, aggregate and quarry plant.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for the Misrata steel complex.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Libya?', answer: 'No. Libya is supplied from our Dubai warehouse, by sea through Suez into Misrata or Benghazi where routing and screening permit.' },
    {
      question: 'Why does the port choice matter more here?',
      answer:
        'Because administration is divided, and which clearance applies and what documentation is accepted depends on where the goods are going. A container sent to the wrong coast is not simply a longer road leg — it can be a consignment that cannot clear at all. We confirm it per shipment.',
    },
    { question: 'What screening do you carry out?', answer: 'Counterparty and end-use screening before we quote rather than after. We check who the buyer is, what the equipment is for and where it will be installed, and we decline plainly where we cannot satisfy ourselves.' },
    { question: 'Can you deliver beyond the port?', answer: 'Only where the route can genuinely be committed. We quote DAP where that is true and to the quay where it is not, and we say which.' },
    { question: 'What certification do we need?', answer: 'There is no blanket pre-shipment conformity scheme for industrial hose and fittings. What has to be right is the declaration under the applicable administration and that our description supports it.' },
    { question: 'Can you supply API-monogrammed equipment?', answer: 'Yes. API 6A wellhead, API 16A BOP, API 16C choke and kill and API 7K drilling hose, with NACE MR0175 material documentation where the contract requires it.' },
    { question: 'Do you carry cargo insurance on this lane?', answer: 'Cover is arranged per consignment and its scope varies with the routing. It is priced into the quotation and we state what is and is not covered before you accept.' },
    { question: 'What currency do you quote in?', answer: 'USD. It is what the oil-sector supply contracts here are written in.' },
  ],
  compliance: {
    heading: 'Which coast decides which clearance',
    body:
      'Libya is an oil economy and the technical demand is familiar — API monograms, sour-service documentation, terminal and refinery duty. What is not familiar is the customs picture. Administration is divided, so which clearance applies, what documentation is accepted and even which port is usable depends on where in the country the goods are going. A container sent to the wrong coast is not a longer road journey; it can be a consignment that cannot clear at all, and correcting it means a return leg across the Mediterranean. We settle the destination and the applicable clearance before anything ships, quote DAP only where a route can genuinely be committed, and state the scope of cargo cover rather than assuming it. Ahead of all of it, counterparty and end-use screening is carried out before a quotation is issued, because Libya is subject to measures that make the buyer and the end use the first question.',
    documents: [
      { ref: 'SCREEN', name: 'Counterparty and end-use screening', issuer: 'Us, before quotation', when: 'Before anything else' },
      { ref: 'ROUTE', name: 'Port and applicable clearance for the destination', issuer: 'Agreed at quotation', when: 'Before dispatch' },
      { ref: 'DECL', name: 'Customs declaration under the applicable administration', issuer: 'The importer', when: 'Before arrival' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'INS', name: 'Cargo cover, scope stated before acceptance', issuer: 'Arranged per consignment', when: 'At quotation' },
    ],
  },
}

const SOUTH_SUDAN: MarketPage = {
  slug: 'south-sudan',
  regulatoryCopy: 'verified',
  released: true,
  lane: 'DXB → SS',
  dialCode: '+211',
  currency: 'USD',
  lede: 'South Sudan is landlocked, oil-dependent, and reached by two corridors that are both difficult — north through Port Sudan into a country at war, or south through Mombasa and eighteen hundred kilometres of road through Uganda. Neither is a published lane and we will not pretend otherwise. Which one is usable is confirmed per consignment, and screening for counterparty and end use happens before we quote.',
  facts: [
    { label: 'Typical transit', value: 'Confirmed per consignment — both corridors are conditional' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali to Mombasa, then road through Uganda and Nimule · Port Sudan and the northern corridor where that is operating · Air freight into Juba where the schedule and routing permit',
    },
    { label: 'Incoterms 2020', value: 'CIF Mombasa · FOB Jebel Ali · EXW Dubai for a nominated forwarder · DAP only where the route can be committed' },
    {
      label: 'Documentation',
      value:
        'Counterparty and end-use screening before quotation · Kenyan and Ugandan transit documents for the southern corridor · South Sudanese customs declaration raised by the importer · Certificate of Origin, Dubai Chamber attested',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea + road' },
    { label: 'Border crossing', value: 'Nimule · Elegu' },
    { label: 'Transit', value: 'Quoted per consignment' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'After screening clears' },
  ],
  map: {
    geoNames: ['S. Sudan', 'South Sudan'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'NIMULE · ELEGU', coords: [32.05, 3.6], dx: 11, dy: 10, anchor: 'start' },
    routes: [
      {
        mode: 'SEA + ROAD',
        primary: true,
        points: [[55.03, 25.01], [56.6, 26.55], [59.9, 22.3], [57.0, 15.5], [52.0, 12.5], [50.5, 8.0], [48.0, 2.0], [41.5, -3.0], [39.66, -4.05], [37.0, -1.3], [34.0, 0.6], [32.6, 2.3], [32.05, 3.6], [31.58, 4.85]],
      },
      { mode: 'AIR', points: [[55.36, 25.25], [48.0, 20.0], [40.0, 12.0], [31.6, 4.87]] },
    ],
  },
  freight: [
    { name: 'Sea + road, southern', transit: 'Quoted per consignment', route: 'Mombasa, then road through Uganda', useCase: 'Usually the workable corridor' },
    { name: 'Air freight', transit: 'Quoted per consignment', route: 'Where the routing permits', useCase: 'When the schedule allows it' },
    { name: 'Sea + road, northern', transit: 'Quoted per consignment', route: 'Port Sudan, where that corridor is operating', useCase: 'Conditional' },
  ],
  orderSteps: {
    third:
      'The corridor is confirmed against what is actually usable, and the Kenyan and Ugandan transit documents follow whichever routing that produces.',
    fourth: 'Where screening clears, goods sail from Jebel Ali on the confirmed corridor with the paperwork and tracking together.',
  },
  cities: [
    { name: 'Juba', coords: [31.58, 4.85], region: 'Central Equatoria', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Nimule', coords: [32.05, 3.6], region: 'Eastern Equatoria' },
    { name: 'Torit', coords: [32.57, 4.41], region: 'Eastern Equatoria' },
    { name: 'Yei', coords: [30.68, 4.09], region: 'Central Equatoria', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Bor', coords: [31.56, 6.21], region: 'Jonglei', plot: true, dx: 9, dy: -4 },
    { name: 'Malakal', coords: [31.66, 9.53], region: 'Upper Nile', plot: true, dx: 9, dy: -4 },
    { name: 'Paloch', coords: [32.5, 10.5], region: 'Upper Nile', plot: true, dx: 9, dy: -4 },
    { name: 'Bentiu', coords: [29.8, 9.26], region: 'Unity', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Rubkona', coords: [29.81, 9.4], region: 'Unity' },
    { name: 'Wau', coords: [27.99, 7.7], region: 'Western Bahr el Ghazal', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Aweil', coords: [27.4, 8.77], region: 'Northern Bahr el Ghazal' },
    { name: 'Rumbek', coords: [29.68, 6.8], region: 'Lakes' },
  ],
  sectors: [
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Upper Nile and Unity field support — wellhead, flow iron and pumping consumables.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and batching-plant hydraulics for road and camp construction.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for diesel generation and field power.' },
    { slug: 'mining', name: 'Mining', description: 'Dust-rated, high-cycle components for aggregate and quarry plant.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Winch and deck hydraulics for Nile river and barge equipment.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'Cylinders and valves for workshop and fabrication equipment.' },
  ],
  faqs: [
    { question: 'Do you have a branch in South Sudan?', answer: 'No. South Sudan is supplied from our Dubai warehouse, on whichever corridor is usable at the time.' },
    {
      question: 'Why will you not state a transit time?',
      answer:
        'Because both corridors are conditional. The northern route runs through a country at war; the southern one is Mombasa plus eighteen hundred kilometres of road through Uganda with two border crossings. Publishing a band would be a promise about circumstances no supplier controls.',
    },
    { question: 'Which corridor will our order take?', answer: 'Usually the southern one through Mombasa and Nimule, because it is the more consistently usable. We confirm it at quotation against what is actually operating rather than defaulting.' },
    { question: 'What screening do you carry out?', answer: 'Counterparty and end-use screening before we quote rather than after. We check who the buyer is, what the equipment is for and where it will be installed, and we decline plainly where we cannot satisfy ourselves.' },
    { question: 'Can you deliver to the oilfields?', answer: 'Where the route can be committed, on DAP terms to the base. Where it cannot we quote to a nominated point and say so, rather than implying a field delivery we cannot stand behind.' },
    { question: 'Do you carry cargo insurance on this lane?', answer: 'Cover is arranged per consignment and its scope varies with the corridor. It is priced into the quotation and we state what is and is not covered before you accept.' },
    { question: 'How far ahead should we order?', answer: 'Further than you would like. On a corridor this long and this conditional, consolidating a quarter of requirements into one planned consignment is worth far more than reacting to failures.' },
    { question: 'What currency do you quote in?', answer: 'USD. It is what the oilfield supply contracts here are written in.' },
  ],
  compliance: {
    heading: 'Two corridors, both conditional',
    body:
      'South Sudan is landlocked and its two routes to the sea are each difficult for different reasons. North through Port Sudan means transiting a country in armed conflict. South through Mombasa means eighteen hundred kilometres of road across Kenya and Uganda with two border crossings and their own transit files. Neither is a lane we can publish a band for, so the corridor and the timing are confirmed per consignment against what is actually usable, and DAP is offered only where a route can genuinely be committed. Cargo cover is arranged per shipment and its scope stated before acceptance rather than assumed. Ahead of all of that sits counterparty and end-use screening carried out before a quotation, because South Sudan is subject to measures that make the buyer and the end use the first question rather than a formality. The practical advice on this lane is to consolidate: a planned quarterly consignment survives a conditional corridor far better than a series of urgent ones.',
    documents: [
      { ref: 'SCREEN', name: 'Counterparty and end-use screening', issuer: 'Us, before quotation', when: 'Before anything else' },
      { ref: 'ROUTE', name: 'Corridor confirmed against what is usable', issuer: 'Agreed at quotation', when: 'Before dispatch' },
      { ref: 'TRANSIT', name: 'Kenyan and Ugandan transit documents, southern corridor', issuer: 'The forwarder, at Mombasa', when: 'Before the road leg' },
      { ref: 'DECL', name: 'South Sudanese customs declaration', issuer: 'The importer', when: 'At the border' },
      { ref: 'INS', name: 'Cargo cover, scope stated before acceptance', issuer: 'Arranged per consignment', when: 'At quotation' },
    ],
  },
}

const VENEZUELA: MarketPage = {
  slug: 'venezuela',
  regulatoryCopy: 'verified',
  released: true,
  lane: 'DXB → VE',
  dialCode: '+58',
  currency: 'USD',
  lede: 'Venezuela holds the largest proven oil reserves in the world and produces some of the heaviest crude on earth, which is a specific engineering problem rather than a general one: extra-heavy oil is abrasive, viscous and worked at temperature, and it destroys equipment specified for conventional service. The lane runs through Suez and across the Atlantic to Puerto Cabello. Counterparty and end-use screening happens before we quote, and payment routing is settled with it.',
  facts: [
    { label: 'Typical transit', value: 'Typically 32–40 days by sea from dispatch, subject to screening' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali through Suez and across the Atlantic to Puerto Cabello · La Guaira for the capital · Air freight where the routing permits',
    },
    { label: 'Incoterms 2020', value: 'CIF Puerto Cabello · FOB Jebel Ali · EXW Dubai for a nominated forwarder · DAP where the route can be committed' },
    {
      label: 'Documentation',
      value:
        'Counterparty and end-use screening before quotation · Payment routing confirmed before dispatch · Customs declaration raised by the importer · Certificate of Origin, Dubai Chamber attested · Documents in Spanish',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via Suez' },
    { label: 'Port of entry', value: 'Puerto Cabello' },
    { label: 'Transit', value: '32–40 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'After screening clears' },
  ],
  map: {
    geoNames: ['Venezuela'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'PUERTO CABELLO', coords: [-68.01, 10.47], legend: 'Port of entry', dx: -11, dy: 10, anchor: 'end' },
    routes: [
      {
        mode: 'SEA · SUEZ',
        primary: true,
        points: leg(SUEZ_TO_MED, [28.0, 33.5], [11.0, 37.2], [-5.6, 35.95], [-14.0, 32.0], [-40.0, 24.0], [-60.0, 15.0], [-66.0, 11.5], [-68.01, 10.47]),
      },
      { mode: 'AIR', points: [[55.36, 25.25], [30.0, 35.0], [-10.0, 38.0], [-45.0, 25.0], [-67.0, 10.6]] },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '32–40 days', route: 'Jebel Ali to Puerto Cabello, via Suez', useCase: 'Default, subject to screening' },
    { name: 'Air freight', transit: 'Quoted per consignment', route: 'Where the routing permits', useCase: 'When the line is down' },
    { name: 'Sea, LCL', transit: '40–52 days', route: 'Consolidated, with transhipment', useCase: 'Small mixed orders' },
  ],
  orderSteps: {
    third:
      'Screening and payment routing are settled together before dispatch, and the extra-heavy oil specification is confirmed line by line rather than taken from a conventional-service catalogue.',
    fourth: 'Where screening clears, goods sail from Jebel Ali through Suez with the paperwork and tracking together.',
  },
  cities: [
    { name: 'Puerto Cabello', coords: [-68.01, 10.47], region: 'Carabobo' },
    { name: 'Valencia', coords: [-68.0, 10.18], region: 'Carabobo', plot: true, dx: -9, dy: 8, anchor: 'end' },
    { name: 'Caracas', coords: [-66.9, 10.49], region: 'Capital District', plot: true, dx: 9, dy: -5 },
    { name: 'La Guaira', coords: [-66.93, 10.6], region: 'La Guaira' },
    { name: 'Maracaibo', coords: [-71.61, 10.65], region: 'Zulia', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Cabimas', coords: [-71.45, 10.39], region: 'Zulia' },
    { name: 'Punto Fijo', coords: [-69.75, 11.7], region: 'Falcón', plot: true, dx: 9, dy: -4 },
    { name: 'Barquisimeto', coords: [-69.35, 10.07], region: 'Lara' },
    { name: 'Maturín', coords: [-63.18, 9.75], region: 'Monagas', plot: true, dx: 9, dy: -4 },
    { name: 'El Tigre', coords: [-64.24, 8.89], region: 'Anzoátegui', plot: true, dx: 9, dy: 6 },
    { name: 'Puerto La Cruz', coords: [-64.62, 10.21], region: 'Anzoátegui' },
    { name: 'Ciudad Guayana', coords: [-62.65, 8.35], region: 'Bolívar', plot: true, dx: 9, dy: 6 },
    { name: 'Puerto Ordaz', coords: [-62.72, 8.29], region: 'Bolívar' },
    { name: 'San Tomé', coords: [-64.15, 8.94], region: 'Anzoátegui' },
    { name: 'Anaco', coords: [-64.47, 9.43], region: 'Anzoátegui' },
    { name: 'Barcelona', coords: [-64.7, 10.14], region: 'Anzoátegui' },
  ],
  sectors: [
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Orinoco extra-heavy oil, the Maracaibo basin and the Paraguaná refining complex — abrasion, viscosity and temperature together.' },
    { slug: 'mining', name: 'Mining', description: 'Iron ore and bauxite in Bolívar — dust-rated, high-cycle components.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'High-force cylinders and servo valves for the Ciudad Guayana steel and aluminium plant.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for the Caroní hydro cascade and thermal plant.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery and terminal hydraulics for the Lake Maracaibo and coastal fleets.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and batching-plant hydraulics for civil and field works.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Venezuela?', answer: 'No. Venezuela is supplied from our Dubai warehouse, by sea through Suez and across the Atlantic into Puerto Cabello where screening and routing permit.' },
    {
      question: 'Can you supply for extra-heavy oil duty?',
      answer:
        'Yes, and it is the engineering question worth asking here. Orinoco crude is abrasive, viscous and worked at temperature, and equipment specified for conventional service fails early on it. Tell us the position in the process and the operating temperature rather than a part number.',
    },
    {
      question: 'What screening do you carry out?',
      answer:
        'Counterparty and end-use screening before we quote rather than after, and payment routing is settled alongside it. Venezuela is subject to sanctions measures that reach the oil sector specifically, so who the buyer is and how the transaction settles are the first questions rather than the last.',
    },
    { question: 'Can you commit to a transit time?', answer: 'To the port, within the band shown, once screening has cleared. The inland leg is quoted per consignment rather than published.' },
    { question: 'What certification do we need?', answer: 'There is no blanket pre-shipment conformity scheme for industrial hose and fittings. What matters is the operator’s specification and the material documentation that goes with it.' },
    { question: 'Can you supply API-monogrammed equipment?', answer: 'Yes. API 6A wellhead, API 16A BOP, API 16C choke and kill and API 7K drilling hose, with NACE MR0175 material documentation where the contract requires it.' },
    { question: 'What language do the documents need to be in?', answer: 'Spanish, with the description agreeing across the invoice, the packing list and the declaration.' },
    { question: 'What currency do you quote in?', answer: 'USD, and the settlement route is confirmed before dispatch rather than assumed.' },
  ],
  compliance: {
    heading: 'Screening and settlement are one question, not two',
    body:
      'Venezuela is subject to sanctions measures that reach the oil sector specifically, which makes this the one lane on the network where who the buyer is and how the transaction settles are the same question. Counterparty and end-use screening is carried out before a quotation is issued, and the payment routing is confirmed alongside it rather than left until dispatch — a consignment that cannot be paid for compliantly is not a consignment we should have loaded. We decline plainly where we cannot satisfy ourselves on either. Where that clears, the technical work is genuinely distinctive: Orinoco extra-heavy crude is abrasive, viscous and worked at temperature, and hose and fittings specified for conventional service fail early on it. The useful quotation starts from the position in the process and the operating temperature rather than a catalogue reference, and we will say where a standard specification is the wrong choice.',
    documents: [
      { ref: 'SCREEN', name: 'Counterparty and end-use screening', issuer: 'Us, before quotation', when: 'Before anything else' },
      { ref: 'PAY', name: 'Payment routing confirmed', issuer: 'Agreed before dispatch', when: 'With the screening' },
      { ref: 'DUTY', name: 'Extra-heavy oil specification for the process position', issuer: 'Us, at quotation', when: 'At quotation, per duty' },
      { ref: 'DECL', name: 'Customs import declaration', issuer: 'The importer', when: 'Before arrival' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
    ],
  },
}

const MYANMAR: MarketPage = {
  slug: 'myanmar',
  regulatoryCopy: 'verified',
  released: true,
  lane: 'DXB → MM',
  dialCode: '+95',
  currency: 'USD',
  lede: 'Myanmar sits on the Malacca lane, which makes the sea leg short — twelve to sixteen days to Yangon, comparable with Malaysia. Everything after the quay is less certain. The country has been in armed conflict since 2021, so onward routing and timings are confirmed per consignment rather than published, and counterparty and end-use screening happens before we quote rather than after an order is taken.',
  facts: [
    { label: 'Typical transit', value: 'Sea leg 12–16 days; onward routing confirmed per consignment' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali across the Arabian Sea to Yangon and Thilawa · Onward movement confirmed against what is actually operating · Air freight where the schedule and routing permit',
    },
    { label: 'Incoterms 2020', value: 'CIF Yangon · FOB Jebel Ali · EXW Dubai for a nominated forwarder · DAP only where the route can be committed' },
    {
      label: 'Documentation',
      value:
        'Counterparty and end-use screening before quotation · Import licence and customs declaration raised by the importer · Certificate of Origin, Dubai Chamber attested',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via the Bay of Bengal' },
    { label: 'Port of entry', value: 'Yangon · Thilawa' },
    { label: 'Transit', value: 'Quoted per consignment' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'After screening clears' },
  ],
  map: {
    geoNames: ['Myanmar'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'THILAWA · YANGON', coords: [96.25, 16.68], legend: 'Port of entry', dx: 11, dy: 10, anchor: 'start' },
    routes: [
      {
        mode: 'SEA · BAY OF BENGAL',
        primary: true,
        points: [[55.03, 25.01], [56.6, 26.55], [58.5, 24.0], [61.0, 21.5], [68.0, 17.0], [77.0, 8.0], [82.0, 6.5], [90.0, 10.0], [94.5, 15.0], [96.25, 16.68]],
      },
      { mode: 'AIR', points: [[55.36, 25.25], [65.0, 20.0], [80.0, 15.0], [96.13, 16.91]] },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '12–16 days to the quay', route: 'Jebel Ali to Thilawa', useCase: 'Default, subject to screening' },
    { name: 'Air freight', transit: 'Quoted per consignment', route: 'Where the routing permits', useCase: 'When the schedule allows it' },
    { name: 'Onward inland', transit: 'Quoted per consignment', route: 'Confirmed against operating corridors', useCase: 'Beyond the port' },
  ],
  orderSteps: {
    third:
      'Counterparty and end-use screening is completed before a quotation, and the onward routing is confirmed against what is actually operating rather than a published corridor.',
    fourth: 'Where screening clears, goods sail from Jebel Ali across the Bay of Bengal with the paperwork and tracking together.',
  },
  cities: [
    { name: 'Yangon', coords: [96.16, 16.87], region: 'Yangon', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Thilawa', coords: [96.25, 16.68], region: 'Yangon' },
    { name: 'Bago', coords: [96.48, 17.34], region: 'Bago', plot: true, dx: 9, dy: -4 },
    { name: 'Mandalay', coords: [96.09, 21.98], region: 'Mandalay', plot: true, dx: 9, dy: -4 },
    { name: 'Naypyidaw', coords: [96.13, 19.75], region: 'Naypyidaw' },
    { name: 'Meiktila', coords: [95.86, 20.88], region: 'Mandalay' },
    { name: 'Monywa', coords: [95.14, 22.11], region: 'Sagaing', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Pathein', coords: [94.73, 16.78], region: 'Ayeyarwady', plot: true, dx: -9, dy: 6, anchor: 'end' },
    { name: 'Mawlamyine', coords: [97.63, 16.49], region: 'Mon', plot: true, dx: 9, dy: 8 },
    { name: 'Dawei', coords: [98.2, 14.08], region: 'Tanintharyi', plot: true, dx: 9, dy: 4 },
    { name: 'Kyaukphyu', coords: [93.55, 19.43], region: 'Rakhine', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Sittwe', coords: [92.9, 20.15], region: 'Rakhine' },
  ],
  sectors: [
    { slug: 'oil-gas', name: 'Oil & Gas', description: 'Offshore gas and the Kyaukphyu terminal — wellhead, flow iron and pumping consumables.' },
    { slug: 'mining', name: 'Mining', description: 'Copper, jade and industrial minerals — dust-rated, high-cycle components.' },
    { slug: 'power', name: 'Power & Energy', description: 'Actuator and governor hydraulics for hydro and gas generation.' },
    { slug: 'construction', name: 'Construction', description: 'Excavator, crane and batching-plant hydraulics for civil and port works.' },
    { slug: 'marine', name: 'Marine & Offshore', description: 'Deck machinery, winch and terminal hydraulics for the Yangon and Thilawa river ports.' },
    { slug: 'steel', name: 'Steel & Metals', description: 'Cylinders and valves for fabrication and workshop equipment.' },
  ],
  faqs: [
    { question: 'Do you have a branch in Myanmar?', answer: 'No. Myanmar is supplied from our Dubai warehouse, by sea across the Bay of Bengal into Thilawa where routing and screening permit.' },
    {
      question: 'Why is the sea leg short but the transit not stated?',
      answer:
        'Because they are different questions. Jebel Ali to Thilawa is twelve to sixteen days and among the shorter lanes east of the Gulf. What we will not publish is a door-to-door time, because the country has been in armed conflict since 2021 and which corridors operate beyond the quay changes.',
    },
    { question: 'What screening do you carry out?', answer: 'Counterparty and end-use screening before we quote rather than after. We check who the buyer is, what the equipment is for and where it will be installed, and we decline plainly where we cannot satisfy ourselves.' },
    { question: 'Can you deliver beyond the port?', answer: 'Only where the route can genuinely be committed. We quote DAP where that is true and to the quay where it is not, and we say which rather than implying a door delivery we cannot stand behind.' },
    { question: 'What do you need from us before shipping?', answer: 'The import licence held by the consignee and confirmation that it covers the goods. Beyond that the file is the declaration, the invoice and packing list, and the origin certificate.' },
    { question: 'Do you carry cargo insurance on this lane?', answer: 'Cover is arranged per consignment and its scope varies with the routing. It is priced into the quotation and we state what is and is not covered before you accept.' },
    { question: 'Is it worth batching orders?', answer: 'Yes. On a lane where the sea leg is reliable and the inland leg is not, one consolidated consignment landed and cleared together is far easier to move onward than several arriving separately.' },
    { question: 'What currency do you quote in?', answer: 'USD. It is what import contracts here are written in and what the customs value will be declared against.' },
  ],
  compliance: {
    heading: 'A short sea leg and an uncertain one after it',
    body:
      'Myanmar sits on the Malacca approach, so the sea leg from Jebel Ali to Thilawa is twelve to sixteen days — comparable with Malaysia and shorter than most of Europe. This page still refuses to publish a door-to-door transit, and the two facts are not in tension. What is predictable is the vessel. What is not is everything after the quay: the country has been in armed conflict since 2021, corridors operate or do not, and a band that assumed one would be a promise about circumstances no supplier controls. So onward routing is confirmed per consignment, DAP is offered only where a route can genuinely be committed, and cargo cover is priced with its scope stated rather than assumed. Ahead of all of it, counterparty and end-use screening is carried out before a quotation is issued, because Myanmar is subject to measures that make the buyer and the end use the first question rather than a formality.',
    documents: [
      { ref: 'SCREEN', name: 'Counterparty and end-use screening', issuer: 'Us, before quotation', when: 'Before anything else' },
      { ref: 'ROUTE', name: 'Onward routing confirmed against operating corridors', issuer: 'Agreed at quotation', when: 'Before dispatch' },
      { ref: 'LIC', name: 'Import licence held by the consignee', issuer: 'The importer', when: 'Before the vessel sails' },
      { ref: 'COO', name: 'Certificate of Origin', issuer: 'Dubai Chamber attested', when: 'Before dispatch' },
      { ref: 'INS', name: 'Cargo cover, scope stated before acceptance', issuer: 'Arranged per consignment', when: 'At quotation' },
    ],
  },
}

export const MARKET_PAGE_RECORDS_4: readonly MarketPage[] = [
  RUSSIA,
  BELARUS,
  LIBYA,
  SUDAN,
  SOUTH_SUDAN,
  VENEZUELA,
  MYANMAR,
]
