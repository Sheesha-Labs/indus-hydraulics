import type { MarketPage } from './market-pages'

/**
 * Wave 5 — ten destinations that had no page at all.
 *
 * JORDAN · LEBANON · INDIA · PAKISTAN · BANGLADESH · SRI LANKA ·
 * TURKMENISTAN · BENIN · TOGO · PAPUA NEW GUINEA
 *
 * Picked 2026-10-20 from a diff of the 126-market registry against the UN
 * member list: the gaps that are either close to Dubai (the Levant, South
 * Asia), on a corridor an existing page already depends on (Cotonou and Lomé
 * for Niger and the Sahel), or that complete a region (Turkmenistan beside
 * Kazakhstan and Uzbekistan, Papua New Guinea at the far end of the Malacca
 * lane).
 *
 * ALL TEN ARE RELEASED, ON THE FOUNDER'S CALL, 2026-10-20 — WITHOUT A
 * FORWARDER REVIEW. They were authored `unverified` / `released: false`
 * because their conformity and document claims — Pakistan's Electronic Import
 * Form and the Indian-origin rule, India's BIS Quality Control Orders, Benin's
 * BESC, Jordan's JSMO and Aqaba zone, Turkmenistan's exchange registration,
 * PNG's NAQIA timber check — were written from general knowledge. The founder
 * was shown that list and asked for all ten to go live the same day, as with
 * the 80 released on 2026-08-24. `verified` here records that release
 * decision, not a forwarder sign-off; if a forwarder later corrects a claim,
 * set the record back to `unverified` / `released: false` while it is fixed.
 *
 * TWO ROUTING DECISIONS, RECORDED HERE RATHER THAN DISCOVERED IN THE MAP.
 *
 *   Turkmenistan's direct air line from Dubai overflies Iran, and
 *   market-geometry.test.ts pins the three Caspian air legs that do so as a
 *   founder decision about THOSE THREE. Rather than make a fourth on our own,
 *   the air leg is drawn west through Baku — a routing that exists, through a
 *   cargo hub — and the surface leg takes the Middle Corridor to
 *   Turkmenbashi. If the desk actually books direct, the line moves and the
 *   pin gains a fourth entry, on the founder's say-so.
 *
 *   Lebanon has no road lane. The overland route from the Gulf runs through
 *   Syria, so the page says so and quotes sea through Suez.
 *
 * The Benin record says the Niger border has been closed or restricted since
 * 2023. That contradicts the Niger page's "Cotonou for most orders" — which is
 * the corridor the Niger localisation is already held on. Resolve the two
 * together.
 */

/** Spread a shared leg into a route, then append the market's own waypoints. */
function leg(
  shared: readonly (readonly [number, number])[],
  ...rest: [number, number][]
): [number, number][] {
  return [...shared.map(([lon, lat]) => [lon, lat] as [number, number]), ...rest]
}

/** Jebel Ali out through Hormuz and into the open Arabian Sea. */
const OUT_OF_HORMUZ = [
  [55.03, 25.01],
  [56.6, 26.55],
  [58.5, 24.0],
] as const

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

/** Down the Gulf and into the Red Sea, stopping short of Suez. */
const TO_RED_SEA = [
  [55.03, 25.01],
  [56.6, 26.55],
  [59.9, 22.3],
  [57.0, 15.5],
  [52.0, 12.5],
  [45.0, 12.3],
  [43.4, 12.6],
  [38.0, 20.0],
] as const

/** Round the Cape of Good Hope and up the West African coast to the Gulf of Guinea. */
const CAPE_TO_GUINEA = [
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
  [12.0, -30.0],
  [10.0, -20.0],
  [8.0, -8.0],
  [4.0, 0.0],
] as const

/** Across the Arabian Sea, round Sri Lanka and into the Strait of Malacca. */
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

/** Suez, the Black Sea, rail across Georgia to the Caspian at Alat. */
const MIDDLE_CORRIDOR_TO_ALAT = [
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
  [41.7, 42.2],
  [45.0, 41.6],
  [49.42, 39.94],
] as const

// ─────────────────────────────────────────────────────────────────────────────
// GCC & Middle East
// ─────────────────────────────────────────────────────────────────────────────

const JORDAN: MarketPage = {
  slug: 'jordan',
  regulatoryCopy: 'verified',
  released: true,
  lane: 'DXB → JO',
  dialCode: '+962',
  currency: 'USD',
  localName: 'المملكة الأردنية الهاشمية',
  lede: 'Jordan is the one market beyond the GCC that a truck reaches from Dubai: across Saudi Arabia to the Al-Omari crossing and on to Amman. The alternative is sea into Aqaba, which needs no canal transit at all. Aqaba is a Special Economic Zone with its own customs treatment, so whether goods are delivered into the zone or onward into the rest of the country changes the paperwork — and that is settled before the consignee is named, not at the gate.',
  facts: [
    { label: 'Typical transit', value: 'Typically 5–15 working days from dispatch' },
    {
      label: 'Freight',
      value:
        'Road freight across Saudi Arabia to Al-Omari · Sea freight into Aqaba with no canal transit · Air freight into Amman where the schedule is tighter',
    },
    {
      label: 'Incoterms 2020',
      value:
        'DAP to the buyer’s site · CIF Aqaba · FOB Jebel Ali · EXW Dubai for a nominated forwarder',
    },
    {
      label: 'Documentation',
      value:
        'Saudi transit documents for the road leg · JSMO conformity where a line is a regulated product · Customs declaration in Jordan or in the Aqaba zone · Certificate of Origin, Dubai Chamber attested',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Road, via Saudi Arabia' },
    { label: 'Border crossing', value: 'Al-Omari' },
    { label: 'Transit', value: '5–15 working days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before dispatch, in Dubai' },
  ],
  map: {
    geoNames: ['Jordan'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'AL-OMARI', coords: [37.14, 31.55], dx: 11, dy: 10, anchor: 'start' },
    routes: [
      {
        mode: 'ROAD · VIA SAUDI',
        primary: true,
        points: [
          [55.03, 25.01],
          [51.57, 24.05],
          [46.72, 24.71],
          [43.97, 26.33],
          [40.2, 29.97],
          [37.14, 31.55],
        ],
      },
      {
        mode: 'SEA · AQABA',
        points: leg(TO_RED_SEA, [35.6, 26.5], [34.55, 27.9], [34.75, 28.6], [35.0, 29.5]),
      },
    ],
  },
  freight: [
    {
      name: 'Road freight',
      transit: '5–15 working days',
      route: 'Dubai to Amman, across Saudi Arabia',
      useCase: 'Default for most orders',
    },
    {
      name: 'Air freight',
      transit: '1–3 days',
      route: 'DXB to AMM',
      useCase: 'When the line is down',
    },
    {
      name: 'Sea, FCL',
      transit: '12–18 days',
      route: 'Jebel Ali to Aqaba, via the Red Sea',
      useCase: 'Heavy and project cargo',
    },
  ],
  orderSteps: {
    third:
      'Once accepted, we confirm whether the consignee is inside the Aqaba zone or beyond it, check each line against the JSMO technical regulations, and raise the Saudi transit set for the road leg.',
    fourth:
      'Goods leave Dubai by road, or sail for Aqaba, and you get the paperwork and tracking together.',
  },
  cities: [
    {
      name: 'Amman',
      coords: [35.93, 31.95],
      region: 'Amman',
      plot: true,
      dx: -9,
      dy: 4,
      anchor: 'end',
    },
    { name: 'Zarqa', coords: [36.09, 32.07], region: 'Zarqa' },
    { name: 'Sahab', coords: [36.0, 31.87], region: 'Amman' },
    {
      name: 'Irbid',
      coords: [35.85, 32.56],
      region: 'Irbid',
      plot: true,
      dx: -9,
      dy: -4,
      anchor: 'end',
    },
    { name: 'Mafraq', coords: [36.21, 32.34], region: 'Mafraq', plot: true, dx: 9, dy: -4 },
    { name: 'Salt', coords: [35.73, 32.04], region: 'Balqa' },
    { name: 'Madaba', coords: [35.79, 31.72], region: 'Madaba' },
    { name: 'Azraq', coords: [36.82, 31.83], region: 'Zarqa', plot: true, dx: 9, dy: -4 },
    { name: 'Karak', coords: [35.7, 31.18], region: 'Karak', plot: true, dx: 9, dy: 4 },
    { name: 'Ghor Al Safi', coords: [35.47, 31.04], region: 'Karak' },
    { name: 'Al-Hasa', coords: [35.98, 30.85], region: 'Tafilah' },
    { name: 'Ma’an', coords: [35.73, 30.2], region: 'Ma’an', plot: true, dx: 9, dy: 4 },
    { name: 'Eshidiya', coords: [36.15, 29.95], region: 'Ma’an' },
    { name: 'Aqaba', coords: [35.01, 29.53], region: 'Aqaba', plot: true, dx: 9, dy: 4 },
    {
      name: 'Ruwaished',
      coords: [38.2, 32.5],
      region: 'Mafraq',
      plot: true,
      dx: -9,
      dy: -6,
      anchor: 'end',
    },
  ],
  sectors: [
    {
      slug: 'mining',
      name: 'Mining',
      description:
        'Phosphate at Eshidiya and Al-Hasa and potash at Ghor Al Safi — dust-rated, high-cycle components for dragline, conveyor and processing plant.',
    },
    {
      slug: 'construction',
      name: 'Construction',
      description:
        'Excavator, crane and batching-plant hydraulics for road, housing and industrial-estate contracts.',
    },
    {
      slug: 'power',
      name: 'Power & Energy',
      description:
        'Actuator and governor hydraulics for thermal and oil-shale generation, and solar-tracker drives.',
    },
    {
      slug: 'oil-gas',
      name: 'Oil & Gas',
      description: 'Refinery support at Zarqa and fuel-terminal transfer hose at Aqaba.',
    },
    {
      slug: 'marine',
      name: 'Marine & Offshore',
      description: 'Port crane, ship-to-shore and terminal hydraulics at Aqaba.',
    },
    {
      slug: 'steel',
      name: 'Steel & Metals',
      description:
        'High-force cylinders and servo valves for the rolling and fabrication lines around Zarqa and Sahab.',
    },
  ],
  faqs: [
    {
      question: 'Do you have a branch in Jordan?',
      answer:
        'No. Jordan is supplied from our Dubai warehouse, by road across Saudi Arabia or by sea into Aqaba, with the documents prepared before dispatch.',
    },
    {
      question: 'How do goods reach Jordan by road?',
      answer:
        'Out of Dubai into Saudi Arabia at Al Batha, across the Kingdom under transit documents, and into Jordan at Al-Omari. The Saudi leg is in transit rather than imported, so nothing is cleared there — but the transit set has to be right or the truck waits at the first border.',
    },
    {
      question: 'Does the Aqaba Special Economic Zone change anything?',
      answer:
        'Yes. Goods delivered to a consignee inside the zone are treated differently from goods entering the rest of Jordan, and moving them out of the zone later is a customs event of its own. Tell us where the goods will be used and we name the consignee and the declaration to match.',
    },
    {
      question: 'Do JSMO regulations apply to hydraulic equipment?',
      answer:
        'Some lines may be covered by a technical regulation of the Jordan Standards and Metrology Organization and most will not. We check each line at quotation and say which, rather than charging for conformity work nobody needs.',
    },
    {
      question: 'Road or sea?',
      answer:
        'Road for most orders, because it is door to door. Sea into Aqaba for heavy or oversize cargo, and for sites near the port — Aqaba is on the Red Sea, so the vessel does not transit Suez.',
    },
    {
      question: 'Can you supply the phosphate and potash operations?',
      answer:
        'Yes. Abrasion-resistant hose, high-cycle cylinders and dust-rated fittings for the mines at Eshidiya and Al-Hasa and the Dead Sea potash works, delivered DAP to the site gate.',
    },
    {
      question: 'How long does delivery take?',
      answer:
        'Typically five to fifteen working days from dispatch, which is the band our shipping policy publishes for the wider Middle East. The spread is mostly the Saudi transit; air freight into Amman is one to three days.',
    },
    {
      question: 'Can you deliver to the industrial estates in Irbid and Sahab?',
      answer:
        'Yes, on DAP terms to the gate. The road leg ends in Amman for most consignments and the final run north or south is part of the same quotation.',
    },
  ],
  compliance: {
    heading: 'A Saudi transit, then a Jordanian entry — or an Aqaba one',
    body: 'A road consignment to Jordan crosses two customs territories and is imported into one of them. Through Saudi Arabia it moves in transit, on documents raised before the truck leaves Dubai; at Al-Omari it is declared into Jordan. Sea cargo into Aqaba raises a different question first: whether the consignee sits inside the Aqaba Special Economic Zone, which has its own customs treatment, or beyond it, where the goods enter Jordan proper. Products covered by a Jordan Standards and Metrology Organization technical regulation need their conformity shown on entry. We settle the route, the consignee and the regulated lines at quotation so the documents are raised once.',
    documents: [
      {
        ref: 'TRANSIT',
        name: 'Saudi transit documents for the road leg',
        issuer: 'Our forwarder, in Dubai',
        when: 'Before dispatch',
      },
      {
        ref: 'JSMO',
        name: 'Conformity for regulated lines',
        issuer: 'Jordan Standards and Metrology Organization',
        when: 'At quotation, per product',
      },
      {
        ref: 'DECL',
        name: 'Customs declaration, Jordan or Aqaba zone',
        issuer: 'Consignee or clearing agent',
        when: 'On arrival',
      },
      {
        ref: 'COO',
        name: 'Certificate of Origin',
        issuer: 'Dubai Chamber attested',
        when: 'Before dispatch',
      },
      {
        ref: 'MTC',
        name: 'Material & test certificates',
        issuer: 'Mill, or our test bench',
        when: 'Where the order calls for them',
      },
    ],
  },
}

const LEBANON: MarketPage = {
  slug: 'lebanon',
  regulatoryCopy: 'verified',
  released: true,
  lane: 'DXB → LB',
  dialCode: '+961',
  currency: 'USD',
  localName: 'الجمهورية اللبنانية',
  lede: 'Lebanon is a sea lane through Suez into Beirut or Tripoli, two to three weeks from Jebel Ali, with no practical road alternative — the overland route from the Gulf runs through Syria. The commercial terms carry as much weight as the freight. The banking system has been under strain since 2019, so the payment route is agreed before we quote, and counterparty screening runs at the same point because designated-party lists include Lebanese entities.',
  facts: [
    { label: 'Typical transit', value: 'Typically 14–20 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali to Beirut through Suez · Tripoli where the site is in the north · Air freight into Beirut where the schedule is tighter',
    },
    {
      label: 'Incoterms 2020',
      value:
        'CIF Beirut · FOB Jebel Ali · EXW Dubai for a nominated forwarder · DAP only where the route can be committed',
    },
    {
      label: 'Documentation',
      value:
        'Counterparty screening and payment route agreed before quotation · Customs declaration filed by the importer · Certificate of Origin, Dubai Chamber attested · Legalisation where the consignee’s bank or customs asks for it',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via Suez' },
    { label: 'Port of entry', value: 'Beirut · Tripoli' },
    { label: 'Transit', value: '14–20 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'After screening clears' },
  ],
  map: {
    geoNames: ['Lebanon'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: {
      name: 'BEIRUT · PORT',
      coords: [35.52, 33.9],
      legend: 'Port of entry',
      dx: -12,
      dy: 10,
      anchor: 'end',
    },
    routes: [
      {
        mode: 'SEA · SUEZ',
        primary: true,
        points: leg(SUEZ_TO_MED, [34.0, 32.6], [35.0, 33.6], [35.52, 33.9]),
      },
      {
        mode: 'AIR',
        points: [
          [55.36, 25.25],
          [48.0, 29.0],
          [38.5, 30.0],
          [35.49, 33.82],
        ],
      },
    ],
  },
  freight: [
    {
      name: 'Sea, FCL',
      transit: '14–20 days',
      route: 'Jebel Ali to Beirut, via Suez',
      useCase: 'Default for most orders',
    },
    {
      name: 'Air freight',
      transit: '1–3 days',
      route: 'DXB to BEY',
      useCase: 'When the line is down',
    },
    {
      name: 'Sea, LCL',
      transit: '18–26 days',
      route: 'Consolidated, with transshipment',
      useCase: 'Small mixed orders',
    },
  ],
  orderSteps: {
    third:
      'Counterparty screening is completed and the payment route agreed before a quotation is issued, so the Estimate you accept is one we can actually ship against.',
    fourth:
      'Goods sail from Jebel Ali through Suez, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Beirut', coords: [35.5, 33.89], region: 'Beirut' },
    { name: 'Zouk Mikael', coords: [35.61, 33.97], region: 'Keserwan-Jbeil' },
    { name: 'Jounieh', coords: [35.62, 33.98], region: 'Keserwan-Jbeil' },
    {
      name: 'Byblos',
      coords: [35.65, 34.12],
      region: 'Keserwan-Jbeil',
      plot: true,
      dx: -9,
      dy: -4,
      anchor: 'end',
    },
    { name: 'Chekka', coords: [35.73, 34.32], region: 'North' },
    { name: 'Selaata', coords: [35.69, 34.28], region: 'North' },
    {
      name: 'Tripoli',
      coords: [35.84, 34.44],
      region: 'North',
      plot: true,
      dx: -9,
      dy: -4,
      anchor: 'end',
    },
    { name: 'Deir Ammar', coords: [35.9, 34.45], region: 'North' },
    { name: 'Halba', coords: [36.08, 34.55], region: 'Akkar', plot: true, dx: 9, dy: -4 },
    { name: 'Zahle', coords: [35.9, 33.85], region: 'Beqaa', plot: true, dx: 9, dy: 4 },
    { name: 'Chtaura', coords: [35.85, 33.82], region: 'Beqaa' },
    {
      name: 'Baalbek',
      coords: [36.21, 34.01],
      region: 'Baalbek-Hermel',
      plot: true,
      dx: 9,
      dy: -4,
    },
    {
      name: 'Sidon',
      coords: [35.37, 33.56],
      region: 'South',
      plot: true,
      dx: -9,
      dy: 4,
      anchor: 'end',
    },
    { name: 'Nabatieh', coords: [35.48, 33.38], region: 'Nabatieh' },
    {
      name: 'Tyre',
      coords: [35.2, 33.27],
      region: 'South',
      plot: true,
      dx: -9,
      dy: 4,
      anchor: 'end',
    },
  ],
  sectors: [
    {
      slug: 'power',
      name: 'Power & Energy',
      description:
        'Governor and actuator hydraulics for the Zouk and Deir Ammar thermal plants, and fuel hose for the private generation that fills the gaps in grid supply.',
    },
    {
      slug: 'construction',
      name: 'Construction',
      description:
        'Excavator, crane and batching-plant hydraulics for reconstruction and civil works.',
    },
    {
      slug: 'mining',
      name: 'Mining',
      description:
        'Dust-rated, high-cycle components for the cement and quarry plant around Chekka.',
    },
    {
      slug: 'marine',
      name: 'Marine & Offshore',
      description: 'Port crane and terminal hydraulics at Beirut and Tripoli.',
    },
    {
      slug: 'oil-gas',
      name: 'Oil & Gas',
      description:
        'Transfer hose and valves for the fuel import terminals and tank farms on the coast.',
    },
    {
      slug: 'steel',
      name: 'Steel & Metals',
      description: 'Cylinders and valves for fabrication and workshop equipment.',
    },
  ],
  faqs: [
    {
      question: 'Do you have a branch in Lebanon?',
      answer:
        'No. Lebanon is supplied from our Dubai warehouse by sea through Suez into Beirut or Tripoli, once screening and the payment route are settled.',
    },
    {
      question: 'Why not by road from the Gulf?',
      answer:
        'Because the overland route to Lebanon runs through Syria, and we do not route goods through it. Sea through Suez is the lane, and air into Beirut where the schedule cannot wait for a vessel.',
    },
    {
      question: 'How is payment handled?',
      answer:
        'It is agreed before we quote — usually payment in advance, or a letter of credit confirmed by a bank we can work with. The Lebanese banking system has been under strain since 2019, and a consignment that cannot be paid for cleanly is not one we load.',
    },
    {
      question: 'What screening do you carry out?',
      answer:
        'Counterparty screening before we quote rather than after an order. Designated-party lists include Lebanese entities, so we check who the buyer is and where the goods will be used, and we decline plainly where we cannot satisfy ourselves.',
    },
    {
      question: 'Beirut or Tripoli?',
      answer:
        'Beirut for most orders. Tripoli where the site is in the north — Chekka, Selaata, Deir Ammar — and the road leg from Beirut would cost more than the difference in freight.',
    },
    {
      question: 'Do our documents need to be legalised?',
      answer:
        'The Certificate of Origin is attested by the Dubai Chamber as standard. Where the consignee’s bank or customs broker asks for further legalisation we arrange it, but tell us at quotation — it adds days to the document set.',
    },
    {
      question: 'Can you supply power-plant and generator hydraulics?',
      answer:
        'Yes. Governor actuators and servo valves for thermal plant, and fuel and lubricant transfer hose for the diesel generation many sites run alongside the grid.',
    },
    {
      question: 'Is it worth consolidating orders?',
      answer:
        'Yes. With screening and payment settled once per consignment rather than per item, one consolidated shipment is less work at both ends than several small ones arriving separately.',
    },
  ],
  compliance: {
    heading: 'Screening and payment first, then the freight',
    body: 'Lebanon has no road lane from the Gulf that we use — the overland route runs through Syria — so the freight question has one answer: sea through Suez into Beirut or Tripoli. The harder questions come before it. Designated-party lists include Lebanese entities, so counterparty screening runs before a quotation is issued. The banking system has been under strain since 2019, so the payment route is agreed at the same point rather than after the goods are packed. Beyond that the file is ordinary: a customs declaration filed by the importer against the invoice and packing list, and a Dubai Chamber attested origin certificate, legalised further where the consignee’s bank asks.',
    documents: [
      {
        ref: 'SCREEN',
        name: 'Counterparty screening',
        issuer: 'Us, before quotation',
        when: 'Before anything else',
      },
      {
        ref: 'PAY',
        name: 'Payment route agreed',
        issuer: 'Agreed at quotation',
        when: 'Before the Estimate',
      },
      {
        ref: 'DECL',
        name: 'Customs declaration',
        issuer: 'Consignee or clearing agent',
        when: 'On arrival',
      },
      {
        ref: 'COO',
        name: 'Certificate of Origin',
        issuer: 'Dubai Chamber attested',
        when: 'Before dispatch',
      },
      {
        ref: 'LEG',
        name: 'Further legalisation, where asked for',
        issuer: 'Arranged per consignment',
        when: 'Before dispatch',
      },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// South Asia
// ─────────────────────────────────────────────────────────────────────────────

const INDIA: MarketPage = {
  slug: 'india',
  regulatoryCopy: 'verified',
  released: true,
  lane: 'DXB → IN',
  dialCode: '+91',
  currency: 'USD',
  localName: 'भारत',
  lede: 'India makes hydraulic hose and fittings at scale, and for a standard item a domestic distributor will beat a Dubai warehouse on price and lead time. Where this lane earns its place is the short sea leg — five to eight days from Jebel Ali to Nhava Sheva or Mundra — carrying what domestic stock does not cover quickly: API-monogrammed wellhead and drilling items, sour-service assemblies with their material documentation, and the metric and GOST patterns on imported plant. Each line is checked against the BIS Quality Control Orders before it is quoted.',
  facts: [
    { label: 'Typical transit', value: 'Typically 5–8 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali to Nhava Sheva for the west and south · Mundra for Gujarat and the north-west · Chennai or Visakhapatnam where the site is on the east coast · Air freight into Mumbai, Delhi or Chennai where the schedule is tighter',
    },
    {
      label: 'Incoterms 2020',
      value:
        'CIF Nhava Sheva or Mundra · FOB Jebel Ali · EXW Dubai for a nominated forwarder · DAP where the importer appoints the broker',
    },
    {
      label: 'Documentation',
      value:
        'Bill of Entry filed by the importer against its Importer-Exporter Code · BIS licence where a line falls under a Quality Control Order · Certificate of Origin, Dubai Chamber attested · Material and test certificates where the contract calls for them',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, across the Arabian Sea' },
    { label: 'Port of entry', value: 'Nhava Sheva · Mundra' },
    { label: 'Transit', value: '5–8 days by sea' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['India'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: {
      name: 'NHAVA SHEVA · JNPT',
      coords: [72.95, 18.95],
      legend: 'Port of entry',
      dx: -12,
      dy: 10,
      anchor: 'end',
    },
    routes: [
      {
        mode: 'SEA · ARABIAN SEA',
        primary: true,
        points: leg(OUT_OF_HORMUZ, [62.0, 22.0], [68.0, 19.5], [72.6, 18.9], [72.95, 18.95]),
      },
      {
        mode: 'AIR',
        points: [
          [55.36, 25.25],
          [62.0, 23.0],
          [72.87, 19.09],
        ],
      },
    ],
  },
  freight: [
    {
      name: 'Sea, FCL',
      transit: '5–8 days',
      route: 'Jebel Ali to Nhava Sheva or Mundra',
      useCase: 'Default for most orders',
    },
    {
      name: 'Air freight',
      transit: '1–3 days',
      route: 'DXB to BOM, DEL or MAA',
      useCase: 'When the line is down',
    },
    {
      name: 'Sea, LCL',
      transit: '8–14 days',
      route: 'Consolidated, Jebel Ali to Nhava Sheva',
      useCase: 'Small mixed orders',
    },
  ],
  orderSteps: {
    third:
      'Once accepted, each line is checked against the BIS Quality Control Orders and the importer gets the descriptions and HS codes its Bill of Entry will be filed against.',
    fourth:
      'Goods sail from Jebel Ali, and the document set and tracking reach you before the vessel does.',
  },
  cities: [
    { name: 'Mumbai', coords: [72.88, 19.08], region: 'Maharashtra' },
    { name: 'Pune', coords: [73.86, 18.52], region: 'Maharashtra' },
    { name: 'Mundra', coords: [69.72, 22.84], region: 'Gujarat' },
    {
      name: 'Jamnagar',
      coords: [70.07, 22.47],
      region: 'Gujarat',
      plot: true,
      dx: -9,
      dy: 4,
      anchor: 'end',
    },
    { name: 'Ahmedabad', coords: [72.57, 23.02], region: 'Gujarat', plot: true, dx: 9, dy: -4 },
    { name: 'Vadodara', coords: [73.18, 22.31], region: 'Gujarat' },
    { name: 'Delhi', coords: [77.21, 28.61], region: 'Delhi', plot: true, dx: 9, dy: -4 },
    { name: 'Jamshedpur', coords: [86.2, 22.8], region: 'Jharkhand' },
    { name: 'Kolkata', coords: [88.36, 22.57], region: 'West Bengal', plot: true, dx: 9, dy: 4 },
    { name: 'Paradip', coords: [86.61, 20.32], region: 'Odisha' },
    {
      name: 'Visakhapatnam',
      coords: [83.22, 17.69],
      region: 'Andhra Pradesh',
      plot: true,
      dx: 9,
      dy: 4,
    },
    { name: 'Hyderabad', coords: [78.49, 17.39], region: 'Telangana' },
    { name: 'Chennai', coords: [80.27, 13.08], region: 'Tamil Nadu', plot: true, dx: 9, dy: 4 },
    {
      name: 'Bengaluru',
      coords: [77.59, 12.97],
      region: 'Karnataka',
      plot: true,
      dx: -9,
      dy: 4,
      anchor: 'end',
    },
    {
      name: 'Kochi',
      coords: [76.27, 9.93],
      region: 'Kerala',
      plot: true,
      dx: -9,
      dy: 4,
      anchor: 'end',
    },
  ],
  sectors: [
    {
      slug: 'oil-gas',
      name: 'Oil & Gas',
      description:
        'Offshore Mumbai High, the Rajasthan and Cambay fields and the Jamnagar refining complex — API-monogrammed and NACE-documented items domestic stock does not hold.',
    },
    {
      slug: 'steel',
      name: 'Steel & Metals',
      description:
        'High-force cylinders and servo valves for the integrated plants of Odisha, Jharkhand and Karnataka.',
    },
    {
      slug: 'marine',
      name: 'Marine & Offshore',
      description:
        'Deck machinery, offshore-vessel and port-crane hydraulics at Nhava Sheva, Mundra and the east-coast ports.',
    },
    {
      slug: 'power',
      name: 'Power & Energy',
      description: 'Governor and actuator hydraulics for thermal and hydro plant.',
    },
    {
      slug: 'mining',
      name: 'Mining',
      description:
        'Coal and iron ore — dust-rated, high-cycle components for haul-truck and shovel fleets.',
    },
    {
      slug: 'construction',
      name: 'Construction',
      description: 'Tunnelling, crane and excavator hydraulics for metro and highway contracts.',
    },
  ],
  faqs: [
    {
      question: 'Do you have a branch in India?',
      answer:
        'No. India is supplied from our Dubai warehouse by sea into Nhava Sheva or Mundra, and the importer clears the goods against its own Importer-Exporter Code.',
    },
    {
      question: 'Should we buy standard hose from you?',
      answer:
        'Usually not. India has a deep domestic hose and fittings industry, and for a standard SAE or EN item a local distributor will be quicker and cheaper. Send us the items local stock does not cover quickly — API-monogrammed equipment, documented sour-service assemblies, unusual metric or GOST patterns.',
    },
    {
      question: 'Do BIS Quality Control Orders apply to what you ship?',
      answer:
        'Some may. A Quality Control Order makes BIS certification compulsory for the products it lists, and an uncertified product under one cannot be imported. Coverage changes as orders are issued, so we check each line at quotation and say plainly if one is caught.',
    },
    {
      question: 'Who files the Bill of Entry?',
      answer:
        'The importer or its customs broker, against the importer’s own Importer-Exporter Code. We supply the invoice, packing list, origin certificate and the line-by-line descriptions it is filed from.',
    },
    {
      question: 'Nhava Sheva or Mundra?',
      answer:
        'Nhava Sheva for Maharashtra and the south-west, Mundra for Gujarat and the north-west. On the east coast, Chennai or Visakhapatnam is quoted where the road leg from the west would cost more than the freight.',
    },
    {
      question: 'Can you supply API-monogrammed equipment for Indian operators?',
      answer:
        'Yes. API 6A wellhead, API 16C choke and kill and API 7K drilling hose, with NACE MR0175 material documentation where the contract requires it.',
    },
    {
      question: 'Can you ship to an overseas site for an Indian contractor?',
      answer:
        'Yes, and it is often the better lane. Indian EPC contractors build across the Gulf, Africa and Central Asia, and a package for one of those sites can go from Dubai directly rather than into India and out again.',
    },
    {
      question: 'How long does sea freight take?',
      answer:
        'Five to eight days from dispatch to the quay at Nhava Sheva on a direct sailing. Clearance time sits on the importer’s side and varies with the lines on the Bill of Entry.',
    },
  ],
  compliance: {
    heading: 'The importer’s code, and the order that might catch a line',
    body: 'An import into India is filed by the importer, on a Bill of Entry, against its own Importer-Exporter Code issued by the Directorate General of Foreign Trade. Our side is the document set it is filed from. The question worth asking at quotation rather than at the port is whether any line falls under a Bureau of Indian Standards Quality Control Order: where one applies, the product needs a BIS licence held by its manufacturer, and without it the line cannot be cleared at all. The orders are issued product by product and the list moves, so each line is checked when it is quoted rather than assumed from last year.',
    documents: [
      {
        ref: 'IEC',
        name: 'Importer-Exporter Code',
        issuer: 'Directorate General of Foreign Trade, held by the importer',
        when: 'Before the order',
      },
      {
        ref: 'BIS',
        name: 'BIS licence, where a Quality Control Order applies',
        issuer: 'Bureau of Indian Standards, to the manufacturer',
        when: 'Before the vessel sails',
      },
      {
        ref: 'BE',
        name: 'Bill of Entry',
        issuer: 'Importer or customs broker',
        when: 'On arrival',
      },
      {
        ref: 'COO',
        name: 'Certificate of Origin',
        issuer: 'Dubai Chamber attested',
        when: 'Before dispatch',
      },
      {
        ref: 'MTC',
        name: 'Material & test certificates',
        issuer: 'Mill, or our test bench',
        when: 'Where the order calls for them',
      },
    ],
  },
}

const PAKISTAN: MarketPage = {
  slug: 'pakistan',
  regulatoryCopy: 'verified',
  released: true,
  lane: 'DXB → PK',
  dialCode: '+92',
  currency: 'USD',
  localName: 'پاکستان',
  lede: 'Pakistan is one of the shortest sea legs on the network — four to seven days from Jebel Ali to Port Qasim or Karachi — and one of the most document-led. The importer’s bank registers the deal on the Pakistan Single Window before the goods ship, and every line has to be of a permitted origin: Pakistan does not admit goods of Indian origin, including when they arrive through a third country. We confirm the origin of each line at quotation, so the declaration is right before it is filed.',
  facts: [
    { label: 'Typical transit', value: 'Typically 4–7 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali to Port Qasim or Karachi · Gwadar on request for Balochistan sites · Air freight into Karachi, Lahore or Islamabad where the schedule is tighter',
    },
    {
      label: 'Incoterms 2020',
      value: 'CFR or CIF Karachi · FOB Jebel Ali · EXW Dubai for a nominated forwarder',
    },
    {
      label: 'Documentation',
      value:
        'Electronic Import Form registered through the importer’s bank on the Pakistan Single Window · Goods Declaration filed by the importer · Origin of every line confirmed at quotation · Certificate of Origin, Dubai Chamber attested',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, along the Makran coast' },
    { label: 'Port of entry', value: 'Port Qasim · Karachi' },
    { label: 'Transit', value: '4–7 days by sea' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Pakistan'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: {
      name: 'PORT QASIM · KARACHI',
      coords: [67.35, 24.78],
      legend: 'Port of entry',
      dx: 11,
      dy: 10,
      anchor: 'start',
    },
    routes: [
      {
        mode: 'SEA · ARABIAN SEA',
        primary: true,
        points: [
          [55.03, 25.01],
          [56.6, 26.55],
          [58.5, 25.0],
          [61.5, 24.6],
          [64.5, 24.5],
          [66.8, 24.5],
          [67.35, 24.78],
        ],
      },
      {
        mode: 'AIR',
        points: [
          [55.36, 25.25],
          [60.0, 24.6],
          [67.16, 24.9],
        ],
      },
    ],
  },
  freight: [
    {
      name: 'Sea, FCL',
      transit: '4–7 days',
      route: 'Jebel Ali to Port Qasim or Karachi',
      useCase: 'Default for most orders',
    },
    {
      name: 'Air freight',
      transit: '1–3 days',
      route: 'DXB to KHI, LHE or ISB',
      useCase: 'When the line is down',
    },
    {
      name: 'Sea, LCL',
      transit: '7–12 days',
      route: 'Consolidated, Jebel Ali to Karachi',
      useCase: 'Small mixed orders',
    },
  ],
  orderSteps: {
    third:
      'Once accepted, the origin of each line is confirmed and your bank registers the Electronic Import Form on the Pakistan Single Window against our invoice.',
    fourth:
      'Goods sail from Jebel Ali once the form is in place, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Karachi', coords: [67.01, 24.86], region: 'Sindh' },
    { name: 'Hub', coords: [66.82, 25.05], region: 'Balochistan' },
    { name: 'Hyderabad', coords: [68.37, 25.4], region: 'Sindh' },
    { name: 'Islamkot', coords: [70.17, 24.7], region: 'Sindh' },
    { name: 'Sukkur', coords: [68.86, 27.7], region: 'Sindh', plot: true, dx: 9, dy: 4 },
    { name: 'Gwadar', coords: [62.33, 25.13], region: 'Balochistan', plot: true, dx: 9, dy: -4 },
    {
      name: 'Quetta',
      coords: [67.0, 30.18],
      region: 'Balochistan',
      plot: true,
      dx: -9,
      dy: 4,
      anchor: 'end',
    },
    { name: 'Multan', coords: [71.47, 30.2], region: 'Punjab', plot: true, dx: 9, dy: 4 },
    { name: 'Faisalabad', coords: [73.08, 31.42], region: 'Punjab' },
    { name: 'Lahore', coords: [74.36, 31.52], region: 'Punjab', plot: true, dx: 9, dy: 4 },
    { name: 'Gujranwala', coords: [74.19, 32.16], region: 'Punjab' },
    { name: 'Sialkot', coords: [74.53, 32.49], region: 'Punjab' },
    {
      name: 'Islamabad',
      coords: [73.05, 33.68],
      region: 'Islamabad Capital Territory',
      plot: true,
      dx: 9,
      dy: -4,
    },
    { name: 'Rawalpindi', coords: [73.07, 33.6], region: 'Punjab' },
    {
      name: 'Peshawar',
      coords: [71.58, 34.01],
      region: 'Khyber Pakhtunkhwa',
      plot: true,
      dx: -9,
      dy: -4,
      anchor: 'end',
    },
  ],
  sectors: [
    {
      slug: 'power',
      name: 'Power & Energy',
      description:
        'Governor and actuator hydraulics for the Thar coal plants, the Indus hydro stations and gas-fired generation.',
    },
    {
      slug: 'oil-gas',
      name: 'Oil & Gas',
      description:
        'Upstream support in Sindh and Khyber Pakhtunkhwa, and refinery and terminal work around Karachi.',
    },
    {
      slug: 'construction',
      name: 'Construction',
      description:
        'Excavator, crane and batching-plant hydraulics for dam, road and port construction.',
    },
    {
      slug: 'steel',
      name: 'Steel & Metals',
      description:
        'High-force cylinders and servo valves for the rolling and re-rolling mills of Karachi and Lahore.',
    },
    {
      slug: 'mining',
      name: 'Mining',
      description: 'Dust-rated, high-cycle components for the Thar coalfield and the cement belt.',
    },
    {
      slug: 'marine',
      name: 'Marine & Offshore',
      description: 'Port crane and terminal hydraulics at Karachi, Port Qasim and Gwadar.',
    },
  ],
  faqs: [
    {
      question: 'Do you have a branch in Pakistan?',
      answer:
        'No. Pakistan is supplied from our Dubai warehouse by sea into Port Qasim or Karachi, once the importer’s bank has the Electronic Import Form in place.',
    },
    {
      question: 'Can you ship goods made in India?',
      answer:
        'No. Pakistan does not admit goods of Indian origin, and routing them through Dubai does not change their origin. We confirm the origin of every line at quotation and offer an alternative make where one exists.',
    },
    {
      question: 'What is the Electronic Import Form?',
      answer:
        'The registration of the import that the importer’s bank makes on the Pakistan Single Window before the goods ship. Payment and the Goods Declaration both refer back to it, so it comes first — send it with the order.',
    },
    {
      question: 'Port Qasim or Karachi?',
      answer:
        'Whichever the sailing calls at — both serve the same city and the road leg differs little. Gwadar is quoted on request for sites in Balochistan, where the road from Karachi is long.',
    },
    {
      question: 'How long does sea freight take?',
      answer:
        'Four to seven days from dispatch to the quay. It is one of the shortest lanes we run, so the document sequence, not the vessel, usually sets the date.',
    },
    {
      question: 'Can you supply the Thar coalfield and its power plants?',
      answer:
        'Yes. Abrasion-rated hose, high-cycle cylinders and dust-rated fittings for mining fleets, and governor hydraulics for the plants, delivered DAP where the inland leg is quoted with the order.',
    },
    {
      question: 'Can you supply API-monogrammed equipment?',
      answer:
        'Yes. API 6A wellhead, API 16C choke and kill and API 7K drilling hose, with NACE MR0175 material documentation where the contract requires it.',
    },
    {
      question: 'Do you crimp hose assemblies before dispatch?',
      answer:
        'Yes. Assemblies are crimped and pressure-tested in Dubai and shipped as finished items, tagged with the hose, the fitting and the test date.',
    },
  ],
  compliance: {
    heading: 'The bank registers it, the origin decides it',
    body: 'An import into Pakistan starts at the importer’s bank, which registers an Electronic Import Form on the Pakistan Single Window against our invoice before the goods ship; payment and the Goods Declaration both refer back to it. Origin is the second gate and the stricter one. Pakistan does not admit goods of Indian origin, and the rule follows the goods rather than the route, so a line made in India and shipped from Dubai is still refused. On a mixed order that is a real risk, because the same part number can come from several factories. We confirm the origin of every line at quotation and say which ones have an alternative.',
    documents: [
      {
        ref: 'EIF',
        name: 'Electronic Import Form, Pakistan Single Window',
        issuer: 'Importer’s bank',
        when: 'Before the vessel sails',
      },
      {
        ref: 'ORIGIN',
        name: 'Origin of every line confirmed',
        issuer: 'Us, at quotation',
        when: 'Before the Estimate',
      },
      {
        ref: 'GD',
        name: 'Goods Declaration',
        issuer: 'Importer or clearing agent',
        when: 'On arrival',
      },
      {
        ref: 'COO',
        name: 'Certificate of Origin',
        issuer: 'Dubai Chamber attested',
        when: 'Before dispatch',
      },
      {
        ref: 'MTC',
        name: 'Material & test certificates',
        issuer: 'Mill, or our test bench',
        when: 'Where the order calls for them',
      },
    ],
  },
}

const BANGLADESH: MarketPage = {
  slug: 'bangladesh',
  regulatoryCopy: 'verified',
  released: true,
  lane: 'DXB → BD',
  dialCode: '+880',
  currency: 'USD',
  localName: 'বাংলাদেশ',
  lede: 'Bangladesh is reached through a transshipment hub rather than directly. Chattogram’s channel limits the size of vessel that can berth, so containers from Jebel Ali usually change ship at Colombo or Singapore, which turns a short distance into a lane of two to three weeks. The paperwork is bank-led: the importer opens a letter of credit against our proforma before anything sails, so the proforma has to be final before it is issued — an amendment later costs the importer time and bank charges.',
  facts: [
    { label: 'Typical transit', value: 'Typically 14–21 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali to Chattogram, transhipped at Colombo or Singapore · Mongla for Khulna and the south-west · Air freight into Dhaka where the schedule is tighter',
    },
    {
      label: 'Incoterms 2020',
      value: 'CFR or CIF Chattogram · FOB Jebel Ali · EXW Dubai for a nominated forwarder',
    },
    {
      label: 'Documentation',
      value:
        'Letter of credit opened by the importer’s bank against our proforma · Import Registration Certificate held by the importer · Bill of Entry filed by the importer · Certificate of Origin, Dubai Chamber attested',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, transhipped' },
    { label: 'Port of entry', value: 'Chattogram' },
    { label: 'Transit', value: '14–21 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Proforma before the LC' },
  ],
  map: {
    geoNames: ['Bangladesh'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: {
      name: 'CHATTOGRAM · PORT',
      coords: [91.8, 22.31],
      legend: 'Port of entry',
      dx: 11,
      dy: 10,
      anchor: 'start',
    },
    routes: [
      {
        mode: 'SEA · VIA COLOMBO',
        primary: true,
        points: leg(
          OUT_OF_HORMUZ,
          [61.0, 21.5],
          [68.0, 15.0],
          [75.0, 8.5],
          [79.6, 6.7],
          [82.5, 6.5],
          [86.0, 12.0],
          [89.5, 19.5],
          [91.6, 21.9],
          [91.8, 22.31]
        ),
      },
      {
        mode: 'AIR',
        points: [
          [55.36, 25.25],
          [65.0, 21.0],
          [78.0, 20.0],
          [90.4, 23.84],
        ],
      },
    ],
  },
  freight: [
    {
      name: 'Sea, FCL',
      transit: '14–21 days',
      route: 'Jebel Ali to Chattogram, via Colombo',
      useCase: 'Default for most orders',
    },
    {
      name: 'Air freight',
      transit: '2–4 days',
      route: 'DXB to DAC',
      useCase: 'When the line is down',
    },
    {
      name: 'Sea, LCL',
      transit: '18–28 days',
      route: 'Consolidated, with transshipment',
      useCase: 'Small mixed orders',
    },
  ],
  orderSteps: {
    third:
      'Once the proforma is final, your bank opens the letter of credit against it, and we prepare the shipping documents to match its terms line for line.',
    fourth:
      'Goods sail from Jebel Ali and change ship at Colombo or Singapore, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Chattogram', coords: [91.83, 22.36], region: 'Chattogram' },
    { name: 'Cumilla', coords: [91.18, 23.46], region: 'Chattogram' },
    { name: 'Cox’s Bazar', coords: [91.98, 21.43], region: 'Chattogram', plot: true, dx: 9, dy: 4 },
    { name: 'Matarbari', coords: [91.89, 21.71], region: 'Chattogram' },
    {
      name: 'Dhaka',
      coords: [90.41, 23.81],
      region: 'Dhaka',
      plot: true,
      dx: -9,
      dy: -4,
      anchor: 'end',
    },
    { name: 'Narayanganj', coords: [90.5, 23.62], region: 'Dhaka' },
    { name: 'Gazipur', coords: [90.42, 24.0], region: 'Dhaka' },
    { name: 'Mymensingh', coords: [90.41, 24.75], region: 'Mymensingh', plot: true, dx: 9, dy: -4 },
    { name: 'Sylhet', coords: [91.87, 24.9], region: 'Sylhet', plot: true, dx: 9, dy: 4 },
    {
      name: 'Khulna',
      coords: [89.56, 22.82],
      region: 'Khulna',
      plot: true,
      dx: -9,
      dy: 4,
      anchor: 'end',
    },
    { name: 'Mongla', coords: [89.6, 22.49], region: 'Khulna' },
    { name: 'Bhola', coords: [90.65, 22.69], region: 'Barishal' },
    {
      name: 'Rajshahi',
      coords: [88.6, 24.37],
      region: 'Rajshahi',
      plot: true,
      dx: -9,
      dy: 4,
      anchor: 'end',
    },
    { name: 'Bogura', coords: [89.37, 24.85], region: 'Rajshahi' },
    { name: 'Rangpur', coords: [89.25, 25.74], region: 'Rangpur', plot: true, dx: 9, dy: -4 },
  ],
  sectors: [
    {
      slug: 'power',
      name: 'Power & Energy',
      description:
        'Governor and actuator hydraulics for the gas and coal plants, Matarbari among them.',
    },
    {
      slug: 'construction',
      name: 'Construction',
      description:
        'Piling, crane and excavator hydraulics for bridge, metro and river-training works.',
    },
    {
      slug: 'marine',
      name: 'Marine & Offshore',
      description:
        'Port crane and deck machinery hydraulics at Chattogram and Mongla, and for the ship-recycling yards up the coast.',
    },
    {
      slug: 'steel',
      name: 'Steel & Metals',
      description:
        'High-force cylinders and servo valves for the re-rolling mills around Chattogram.',
    },
    {
      slug: 'oil-gas',
      name: 'Oil & Gas',
      description:
        'Wellhead and process support for the onshore gas fields and the import terminals.',
    },
    {
      slug: 'mining',
      name: 'Mining',
      description: 'Dust-rated, high-cycle components for cement, clinker and coal handling.',
    },
  ],
  faqs: [
    {
      question: 'Do you have a branch in Bangladesh?',
      answer:
        'No. Bangladesh is supplied from our Dubai warehouse by sea into Chattogram, transhipped at Colombo or Singapore, against the importer’s letter of credit.',
    },
    {
      question: 'Why does a short distance take two to three weeks?',
      answer:
        'Because Chattogram’s channel limits the size of ship that can berth, so mainline vessels from the Gulf do not call there. Containers change ship at Colombo or Singapore onto a feeder, and the connection, not the distance, sets the date.',
    },
    {
      question: 'What has to be in place before shipment?',
      answer:
        'A letter of credit opened by your bank against our proforma, and the Import Registration Certificate it depends on. We ship against the credit, so its terms and our documents have to agree exactly.',
    },
    {
      question: 'Why does the proforma need to be final?',
      answer:
        'Because the letter of credit is opened against it, and changing a line afterwards means an amendment at your bank, with its own charges and delay. We confirm part numbers, quantities and Incoterm before we issue it.',
    },
    {
      question: 'Chattogram or Mongla?',
      answer:
        'Chattogram for most orders. Mongla where the site is in Khulna or the south-west, and the road leg from Chattogram would cost more than the difference in freight.',
    },
    {
      question: 'Can you deliver to Dhaka?',
      answer:
        'Yes, on DAP terms to the site gate or through the inland container depot, with the leg from Chattogram quoted rather than estimated.',
    },
    {
      question: 'Can you supply the power plants?',
      answer:
        'Yes. Governor actuators, servo valves and high-pressure hose for gas and coal-fired plant, with material certificates where the contract requires them.',
    },
    {
      question: 'Do you crimp hose assemblies before dispatch?',
      answer:
        'Yes. Assemblies are crimped and pressure-tested in Dubai and shipped as finished items, tagged with the hose, the fitting and the test date.',
    },
  ],
  compliance: {
    heading: 'The letter of credit sets the terms',
    body: 'Imports into Bangladesh are financed and controlled through the importer’s bank. The importer holds an Import Registration Certificate; the bank opens a letter of credit against our proforma; we ship against the credit and present documents that have to match its terms exactly; and the importer files the Bill of Entry on arrival. The practical consequence is that the proforma is the document everything else is copied from, so it has to be right the first time — a corrected line after the credit is opened is an amendment, with its own cost and delay. We confirm the part list and the Incoterm before we issue it.',
    documents: [
      {
        ref: 'IRC',
        name: 'Import Registration Certificate',
        issuer: 'Held by the importer',
        when: 'Before the order',
      },
      {
        ref: 'PI',
        name: 'Proforma invoice, final',
        issuer: 'Indus Hydraulics',
        when: 'Before the credit is opened',
      },
      {
        ref: 'LC',
        name: 'Letter of credit',
        issuer: 'Importer’s bank',
        when: 'Before the vessel sails',
      },
      {
        ref: 'BE',
        name: 'Bill of Entry',
        issuer: 'Importer or clearing agent',
        when: 'On arrival',
      },
      {
        ref: 'COO',
        name: 'Certificate of Origin',
        issuer: 'Dubai Chamber attested',
        when: 'Before dispatch',
      },
    ],
  },
}

const SRI_LANKA: MarketPage = {
  slug: 'sri-lanka',
  regulatoryCopy: 'verified',
  released: true,
  lane: 'DXB → LK',
  dialCode: '+94',
  currency: 'USD',
  localName: 'ශ්‍රී ලංකාව',
  lede: 'Colombo is one of the busiest transshipment ports in the Indian Ocean, so Sri Lanka is reached on direct mainline sailings from Jebel Ali rather than on a feeder — about a week to the quay. Most of what arrives is for the island itself, but the same position makes Colombo a place to meet a ship: spares for a vessel calling there can be consolidated and delivered to its agent. Some industrial goods are on the Sri Lanka Standards Institution’s import inspection list, so each line is checked against it at quotation.',
  facts: [
    { label: 'Typical transit', value: 'Typically 7–10 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali to Colombo · Hambantota for project cargo in the south · Air freight into Colombo where the schedule is tighter',
    },
    {
      label: 'Incoterms 2020',
      value:
        'CIF Colombo · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder',
    },
    {
      label: 'Documentation',
      value:
        'Customs declaration filed by the importer · SLSI import inspection where a line is on the scheme · Certificate of Origin, Dubai Chamber attested',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, direct' },
    { label: 'Port of entry', value: 'Colombo' },
    { label: 'Transit', value: '7–10 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Sri Lanka'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: {
      name: 'COLOMBO · PORT',
      coords: [79.84, 6.95],
      legend: 'Port of entry',
      dx: -12,
      dy: 10,
      anchor: 'end',
    },
    routes: [
      {
        mode: 'SEA · ARABIAN SEA',
        primary: true,
        points: leg(
          OUT_OF_HORMUZ,
          [61.0, 21.5],
          [68.0, 15.0],
          [75.0, 8.0],
          [79.5, 6.9],
          [79.84, 6.95]
        ),
      },
      {
        mode: 'AIR',
        points: [
          [55.36, 25.25],
          [65.0, 18.0],
          [79.88, 7.18],
        ],
      },
    ],
  },
  freight: [
    {
      name: 'Sea, FCL',
      transit: '7–10 days',
      route: 'Jebel Ali to Colombo, direct',
      useCase: 'Default for most orders',
    },
    {
      name: 'Air freight',
      transit: '1–3 days',
      route: 'DXB to CMB',
      useCase: 'When the line is down',
    },
    {
      name: 'Sea, LCL',
      transit: '10–16 days',
      route: 'Consolidated, Jebel Ali to Colombo',
      useCase: 'Small mixed orders',
    },
  ],
  orderSteps: {
    third:
      'Once accepted, each line is checked against the SLSI import inspection list, and the importer gets the descriptions its declaration will be filed against.',
    fourth:
      'Goods sail direct from Jebel Ali to Colombo, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Colombo', coords: [79.86, 6.93], region: 'Western' },
    { name: 'Sapugaskanda', coords: [79.96, 6.96], region: 'Western' },
    { name: 'Katunayake', coords: [79.88, 7.17], region: 'Western' },
    { name: 'Negombo', coords: [79.84, 7.21], region: 'Western' },
    { name: 'Kandy', coords: [80.64, 7.29], region: 'Central', plot: true, dx: 9, dy: -4 },
    { name: 'Ratnapura', coords: [80.4, 6.68], region: 'Sabaragamuwa' },
    {
      name: 'Galle',
      coords: [80.22, 6.03],
      region: 'Southern',
      plot: true,
      dx: -9,
      dy: 4,
      anchor: 'end',
    },
    { name: 'Hambantota', coords: [81.11, 6.12], region: 'Southern', plot: true, dx: 9, dy: 6 },
    { name: 'Batticaloa', coords: [81.69, 7.73], region: 'Eastern', plot: true, dx: 9, dy: 4 },
    { name: 'Trincomalee', coords: [81.23, 8.57], region: 'Eastern', plot: true, dx: 9, dy: -4 },
    {
      name: 'Anuradhapura',
      coords: [80.4, 8.31],
      region: 'North Central',
      plot: true,
      dx: 9,
      dy: 4,
    },
    { name: 'Kurunegala', coords: [80.36, 7.49], region: 'North Western' },
    { name: 'Puttalam', coords: [79.84, 8.04], region: 'North Western' },
    {
      name: 'Norochcholai',
      coords: [79.79, 8.03],
      region: 'North Western',
      plot: true,
      dx: -9,
      dy: 4,
      anchor: 'end',
    },
    { name: 'Jaffna', coords: [80.01, 9.66], region: 'Northern', plot: true, dx: 9, dy: -4 },
  ],
  sectors: [
    {
      slug: 'marine',
      name: 'Marine & Offshore',
      description:
        'Ship-repair, deck machinery and port-crane hydraulics at Colombo, Trincomalee and Hambantota.',
    },
    {
      slug: 'power',
      name: 'Power & Energy',
      description:
        'Governor and actuator hydraulics for the Norochcholai coal plant and the hill-country hydro stations.',
    },
    {
      slug: 'construction',
      name: 'Construction',
      description:
        'Excavator, crane and batching-plant hydraulics for port, highway and reclamation works.',
    },
    {
      slug: 'oil-gas',
      name: 'Oil & Gas',
      description:
        'Refinery support at Sapugaskanda and transfer hose for the Trincomalee and Colombo terminals.',
    },
    {
      slug: 'mining',
      name: 'Mining',
      description:
        'Dust-rated, high-cycle components for graphite, mineral sands and quarry plant.',
    },
    {
      slug: 'steel',
      name: 'Steel & Metals',
      description:
        'Cylinders and valves for rolling mills, fabrication and the export-zone factories.',
    },
  ],
  faqs: [
    {
      question: 'Do you have a branch in Sri Lanka?',
      answer:
        'No. Sri Lanka is supplied from our Dubai warehouse on direct sailings into Colombo, with the documents prepared before the vessel sails.',
    },
    {
      question: 'What is the SLSI import inspection scheme?',
      answer:
        'A Sri Lanka Standards Institution scheme under which listed products are checked against a standard before customs releases them. Most hydraulic items are not on it; we check each line at quotation and tell you which, if any, are.',
    },
    {
      question: 'Colombo or Hambantota?',
      answer:
        'Colombo for almost everything, because that is where the direct sailings call. Hambantota for project cargo bound for the south, where it saves the road leg.',
    },
    {
      question: 'Can you deliver spares to a ship calling at Colombo?',
      answer:
        'Yes. We consolidate the order in Dubai and deliver to the ship’s agent for the call, with the documents the agent needs to bring it alongside. Tell us the vessel and the expected arrival with the order.',
    },
    {
      question: 'How long does sea freight take?',
      answer:
        'Seven to ten days from dispatch to the quay on a direct sailing. Air freight into Colombo is one to three days.',
    },
    {
      question: 'Can you supply food-grade hose for tea, coconut and dairy processing?',
      answer:
        'Yes, with the compound’s food-contact documentation. We state what the hose carries and decline to certify a finished installation as compliant on our own authority.',
    },
    {
      question: 'Can you deliver beyond Colombo?',
      answer:
        'Yes, on DAP terms to Kandy, Trincomalee, Hambantota and the export processing zones, with the road leg quoted rather than estimated.',
    },
    {
      question: 'Can you supply petroleum transfer hose for the terminals?',
      answer:
        'Yes. Composite and rubber transfer hose with the pressure and product rating stated, and marine breakaway and dry-disconnect couplings where the duty calls for them.',
    },
  ],
  compliance: {
    heading: 'A direct lane, and one list to check',
    body: 'Sri Lanka is one of the simplest lanes east of the Gulf to document. Colombo is a mainline transshipment port, so goods arrive on direct sailings rather than through a feeder connection, and the importer files the customs declaration against our invoice and packing list. The one check that has to happen earlier is the Sri Lanka Standards Institution import inspection scheme, under which listed products are inspected against a standard before release. Most of what we ship is not on it, but the list is product-specific, so each line is checked at quotation rather than assumed.',
    documents: [
      {
        ref: 'SLSI',
        name: 'Import inspection, where a line is listed',
        issuer: 'Sri Lanka Standards Institution',
        when: 'At quotation, per product',
      },
      {
        ref: 'DECL',
        name: 'Customs declaration',
        issuer: 'Importer or clearing agent',
        when: 'On arrival',
      },
      {
        ref: 'INV / PL',
        name: 'Commercial invoice & packing list',
        issuer: 'Indus Hydraulics',
        when: 'With the consignment',
      },
      {
        ref: 'COO',
        name: 'Certificate of Origin',
        issuer: 'Dubai Chamber attested',
        when: 'Before dispatch',
      },
      {
        ref: 'MTC',
        name: 'Material & test certificates',
        issuer: 'Mill, or our test bench',
        when: 'Where the order calls for them',
      },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// CIS & Caucasus
// ─────────────────────────────────────────────────────────────────────────────

const TURKMENISTAN: MarketPage = {
  slug: 'turkmenistan',
  regulatoryCopy: 'verified',
  released: true,
  lane: 'DXB → TM',
  dialCode: '+993',
  currency: 'USD',
  localName: 'Türkmenistan',
  lede: 'Turkmenistan is reached without routing goods through Iran, which shapes everything else on this page. Air freight goes west through Baku and across the Caspian rather than on the direct line, and surface cargo takes the Middle Corridor — Suez, the Black Sea, rail across Georgia and Azerbaijan — then the ferry to Turkmenbashi. Ahead of the freight, foreign-trade contracts are registered with the State Commodity and Raw Materials Exchange, so the contract is settled in its final form before anything is booked.',
  facts: [
    { label: 'Typical transit', value: 'Typically 4–7 days by air from dispatch' },
    {
      label: 'Freight',
      value:
        'Air freight via Baku · Middle Corridor by sea, rail and Caspian ferry to Turkmenbashi for volume · No routing through Iran',
    },
    {
      label: 'Incoterms 2020',
      value:
        'CIP Ashgabat · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder',
    },
    {
      label: 'Documentation',
      value:
        'Contract registered with the State Commodity and Raw Materials Exchange · Customs declaration filed by the importer · Certificate of Origin, Dubai Chamber attested · Material and test certificates where the contract calls for them',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Dubai · DXB' },
    { label: 'Primary mode', value: 'Air, via Baku' },
    { label: 'Port of entry', value: 'Turkmenbashi' },
    { label: 'Transit', value: '4–7 days by air' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Once the contract is registered' },
  ],
  map: {
    geoNames: ['Turkmenistan'],
    fit: 'crossing',
    origin: [55.36, 25.25],
    originLabel: 'DUBAI · DXB',
    crossing: {
      name: 'TURKMENBASHI · PORT',
      coords: [52.98, 40.01],
      legend: 'Port of entry',
      dx: 11,
      dy: -8,
      anchor: 'start',
    },
    routes: [
      {
        mode: 'AIR · VIA BAKU',
        primary: true,
        points: [
          [55.36, 25.25],
          [50.5, 27.5],
          [47.8, 29.6],
          [44.5, 33.3],
          [42.5, 37.2],
          [43.0, 41.0],
          [44.8, 41.7],
          [49.87, 40.41],
          [52.98, 40.01],
          [58.33, 37.99],
        ],
      },
      {
        mode: 'SEA + RAIL + FERRY',
        points: leg(MIDDLE_CORRIDOR_TO_ALAT, [51.0, 40.0], [52.98, 40.01]),
      },
    ],
  },
  freight: [
    {
      name: 'Air freight',
      transit: '4–7 days',
      route: 'DXB to ASB, via GYD',
      useCase: 'Default for most orders',
    },
    {
      name: 'Middle Corridor',
      transit: '35–45 days',
      route: 'Poti, rail to Alat, ferry to Turkmenbashi',
      useCase: 'Volume and palletised orders',
    },
    {
      name: 'Caspian project cargo',
      transit: '40–55 days',
      route: 'Through Baku by ro-ro ferry',
      useCase: 'Oversize and project cargo',
    },
  ],
  orderSteps: {
    third:
      'Once the contract is in its final form, the importer registers it with the State Commodity and Raw Materials Exchange, and we prepare the document set against the registered terms.',
    fourth:
      'Goods fly via Baku or take the Middle Corridor, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Ashgabat', coords: [58.38, 37.95], region: 'Ahal', plot: true, dx: 9, dy: -4 },
    { name: 'Tejen', coords: [60.5, 37.38], region: 'Ahal' },
    { name: 'Turkmenbashi', coords: [52.97, 40.02], region: 'Balkan' },
    { name: 'Hazar', coords: [53.13, 39.43], region: 'Balkan' },
    { name: 'Balkanabat', coords: [54.37, 39.51], region: 'Balkan', plot: true, dx: 9, dy: 4 },
    { name: 'Garabogaz', coords: [53.04, 41.55], region: 'Balkan', plot: true, dx: 9, dy: -4 },
    { name: 'Serdar', coords: [56.27, 38.98], region: 'Balkan' },
    { name: 'Mary', coords: [61.83, 37.6], region: 'Mary', plot: true, dx: 9, dy: 4 },
    { name: 'Bayramaly', coords: [62.17, 37.62], region: 'Mary' },
    { name: 'Yoloten', coords: [62.36, 37.3], region: 'Mary' },
    { name: 'Turkmenabat', coords: [63.58, 39.07], region: 'Lebap', plot: true, dx: 9, dy: -4 },
    {
      name: 'Kerki',
      coords: [65.22, 37.83],
      region: 'Lebap',
      plot: true,
      dx: -9,
      dy: 6,
      anchor: 'end',
    },
    { name: 'Gazojak', coords: [61.4, 41.19], region: 'Lebap' },
    { name: 'Dashoguz', coords: [59.97, 41.84], region: 'Dashoguz', plot: true, dx: 9, dy: -4 },
  ],
  sectors: [
    {
      slug: 'oil-gas',
      name: 'Oil & Gas',
      description:
        'Galkynysh and the Amu Darya gas fields, the western Caspian oilfields and the processing plant that serves them.',
    },
    {
      slug: 'power',
      name: 'Power & Energy',
      description:
        'Governor and actuator hydraulics for the gas-fired stations across the five provinces.',
    },
    {
      slug: 'construction',
      name: 'Construction',
      description:
        'Excavator, crane and batching-plant hydraulics for civil works in Ashgabat and Avaza.',
    },
    {
      slug: 'marine',
      name: 'Marine & Offshore',
      description:
        'Port crane and ferry-ramp hydraulics at Turkmenbashi, and deck machinery for the Caspian fleet.',
    },
    {
      slug: 'mining',
      name: 'Mining',
      description: 'Dust-rated, high-cycle components for potash at Garlyk and the cement plants.',
    },
    {
      slug: 'steel',
      name: 'Steel & Metals',
      description: 'Cylinders and valves for the Ovadandepe steel works and fabrication shops.',
    },
  ],
  faqs: [
    {
      question: 'Do you have a branch in Turkmenistan?',
      answer:
        'No. Turkmenistan is supplied from our Dubai warehouse, by air via Baku for most orders or by the Middle Corridor to Turkmenbashi for volume.',
    },
    {
      question: 'Why not route through Iran?',
      answer:
        'Because we do not move goods through Iran, by road or by sea. That rules out the shortest surface route, so volume cargo goes the long way round — through Suez, the Black Sea and Georgia to the Caspian — and air freight routes through Baku.',
    },
    {
      question: 'What is contract registration?',
      answer:
        'Foreign-trade contracts are registered with the State Commodity and Raw Materials Exchange before they are performed. Registration fixes the terms, so the part list, prices and Incoterm need to be final before the contract goes in rather than corrected after.',
    },
    {
      question: 'Does an EAC certificate work in Turkmenistan?',
      answer:
        'No. Turkmenistan is not a member of the Eurasian Economic Union, so a certificate issued for a Kazakh or Russian consignee does not carry across. Where a line needs national conformity documents we say so at quotation.',
    },
    {
      question: 'How long does delivery to Ashgabat take?',
      answer:
        'Four to seven days by air from dispatch, via Baku. The Middle Corridor to Turkmenbashi runs five to seven weeks and is quoted per shipment.',
    },
    {
      question: 'Can you supply the gas fields?',
      answer:
        'Yes. API 6A wellhead, API 16C choke and kill and NACE MR0175 rated equipment for sour gas, with material certificates where the contract requires them.',
    },
    {
      question: 'Can you deliver to the port at Turkmenbashi?',
      answer:
        'Yes. Volume and oversize cargo arrives there off the Caspian ferry, and we quote DAP to the port or onward to the site with the inland leg stated.',
    },
    {
      question: 'Do you crimp hose assemblies before dispatch?',
      answer:
        'Yes. Assemblies are crimped and pressure-tested in Dubai and shipped as finished items, tagged with the hose, the fitting and the test date.',
    },
  ],
  compliance: {
    heading: 'The contract is registered before it is performed',
    body: 'Two things set the Turkmen timeline before freight does. First, foreign-trade contracts are registered with the State Commodity and Raw Materials Exchange, and the registered terms are what payment and customs are checked against, so a contract corrected after registration is a second registration. Second, the routing: we do not move goods through Iran, which rules out the shortest surface lane and sends volume cargo round through Suez, the Black Sea and rail across Georgia and Azerbaijan to the Caspian ferry, and air freight through Baku. Turkmenistan is outside the Eurasian Economic Union, so EAC documents do not apply; where a line needs national conformity documents it is identified at quotation.',
    documents: [
      {
        ref: 'EXCH',
        name: 'Contract registration',
        issuer: 'State Commodity and Raw Materials Exchange',
        when: 'Before anything else',
      },
      {
        ref: 'DECL',
        name: 'Customs declaration',
        issuer: 'Importer or clearing agent',
        when: 'On arrival',
      },
      {
        ref: 'COO',
        name: 'Certificate of Origin',
        issuer: 'Dubai Chamber attested',
        when: 'Before dispatch',
      },
      {
        ref: 'INV / PL',
        name: 'Commercial invoice & packing list',
        issuer: 'Indus Hydraulics',
        when: 'With the consignment',
      },
      {
        ref: 'MTC',
        name: 'Material & test certificates',
        issuer: 'Mill, or our test bench',
        when: 'Where the order calls for them',
      },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// West & Central Africa
// ─────────────────────────────────────────────────────────────────────────────

const BENIN: MarketPage = {
  slug: 'benin',
  regulatoryCopy: 'verified',
  released: true,
  lane: 'DXB → BJ',
  dialCode: '+229',
  currency: 'USD',
  localName: 'République du Bénin',
  lede: 'Benin is a Cape-routed sea lane into Cotonou, four to five weeks from Jebel Ali, with the documents in French and an electronic cargo tracking note — the BESC — raised before the vessel arrives. Cotonou has long served Niger and the inland Sahel as well as Benin itself, but the border with Niger has been closed or restricted since 2023, so a transit consignment is confirmed against what is actually crossing rather than assumed from the map.',
  facts: [
    { label: 'Typical transit', value: 'Typically 28–34 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali to Cotonou, via the Cape · Air freight into Cotonou where the schedule is tighter',
    },
    {
      label: 'Incoterms 2020',
      value:
        'CIF Cotonou · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder',
    },
    {
      label: 'Documentation',
      value:
        'BESC cargo tracking note before arrival · Commercial documents in French · Customs declaration through the single window · Certificate of Origin, Dubai Chamber attested',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via the Cape' },
    { label: 'Port of entry', value: 'Cotonou' },
    { label: 'Transit', value: '28–34 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Benin'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: {
      name: 'COTONOU · PORT',
      coords: [2.43, 6.35],
      legend: 'Port of entry',
      dx: 11,
      dy: 10,
      anchor: 'start',
    },
    routes: [
      { mode: 'SEA VIA THE CAPE', primary: true, points: leg(CAPE_TO_GUINEA, [2.43, 6.35]) },
      {
        mode: 'AIR',
        points: [
          [55.36, 25.25],
          [38.0, 15.0],
          [15.0, 9.0],
          [2.38, 6.36],
        ],
      },
    ],
  },
  freight: [
    {
      name: 'Sea, FCL',
      transit: '28–34 days',
      route: 'Jebel Ali to Cotonou, via the Cape',
      useCase: 'Default for most orders',
    },
    {
      name: 'Air freight',
      transit: '4–6 days',
      route: 'DXB to COO',
      useCase: 'When the line is down',
    },
    {
      name: 'Sea, LCL',
      transit: '32–40 days',
      route: 'Consolidated, with transshipment',
      useCase: 'Small mixed orders',
    },
  ],
  orderSteps: {
    third:
      'Once accepted, the BESC is raised against the booking and the French document set prepared before the container is loaded.',
    fourth: 'Goods sail from Jebel Ali, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Cotonou', coords: [2.42, 6.37], region: 'Littoral' },
    { name: 'Porto-Novo', coords: [2.63, 6.5], region: 'Ouémé' },
    { name: 'Sèmè-Kpodji', coords: [2.62, 6.38], region: 'Ouémé' },
    { name: 'Abomey-Calavi', coords: [2.35, 6.45], region: 'Atlantique' },
    { name: 'Glo-Djigbé', coords: [2.27, 6.58], region: 'Atlantique' },
    { name: 'Ouidah', coords: [2.09, 6.36], region: 'Atlantique' },
    {
      name: 'Lokossa',
      coords: [1.72, 6.64],
      region: 'Mono',
      plot: true,
      dx: -9,
      dy: 4,
      anchor: 'end',
    },
    {
      name: 'Abomey',
      coords: [1.99, 7.18],
      region: 'Zou',
      plot: true,
      dx: -9,
      dy: 4,
      anchor: 'end',
    },
    { name: 'Bohicon', coords: [2.07, 7.18], region: 'Zou' },
    { name: 'Savè', coords: [2.49, 8.03], region: 'Collines', plot: true, dx: 9, dy: 4 },
    { name: 'Parakou', coords: [2.63, 9.34], region: 'Borgou', plot: true, dx: 9, dy: 4 },
    {
      name: 'Djougou',
      coords: [1.66, 9.71],
      region: 'Donga',
      plot: true,
      dx: -9,
      dy: 4,
      anchor: 'end',
    },
    {
      name: 'Natitingou',
      coords: [1.38, 10.3],
      region: 'Atacora',
      plot: true,
      dx: -9,
      dy: 4,
      anchor: 'end',
    },
    { name: 'Kandi', coords: [2.94, 11.13], region: 'Alibori', plot: true, dx: 9, dy: 4 },
    { name: 'Malanville', coords: [3.39, 11.86], region: 'Alibori', plot: true, dx: 9, dy: -4 },
  ],
  sectors: [
    {
      slug: 'construction',
      name: 'Construction',
      description:
        'Excavator, crane and batching-plant hydraulics for the Glo-Djigbé industrial zone, port and road contracts.',
    },
    {
      slug: 'marine',
      name: 'Marine & Offshore',
      description: 'Port crane and terminal hydraulics at Cotonou.',
    },
    {
      slug: 'power',
      name: 'Power & Energy',
      description:
        'Governor and actuator hydraulics for the thermal plant at Maria-Gléta and distributed generation.',
    },
    {
      slug: 'oil-gas',
      name: 'Oil & Gas',
      description:
        'Terminal and offshore support at Sèmè, where the export pipeline from Niger reaches the coast.',
    },
    {
      slug: 'mining',
      name: 'Mining',
      description: 'Dust-rated, high-cycle components for cement, clinker and quarry plant.',
    },
    {
      slug: 'steel',
      name: 'Steel & Metals',
      description: 'Cylinders and valves for rebar, fabrication and cotton-ginning workshops.',
    },
  ],
  faqs: [
    {
      question: 'Do you have a branch in Benin?',
      answer:
        'No. Benin is supplied from our Dubai warehouse by sea into Cotonou, with the BESC and the French documents prepared before the container is loaded.',
    },
    {
      question: 'What is the BESC?',
      answer:
        'The electronic cargo tracking note — Bordereau Électronique de Suivi des Cargaisons — required for cargo into Cotonou. It is raised against the booking before the vessel arrives, and a container without one is held until it exists.',
    },
    {
      question: 'Do the documents have to be in French?',
      answer:
        'Yes, and they have to agree with each other. A description that differs between the invoice, the packing list and the declaration is the commonest cause of delay at the port.',
    },
    {
      question: 'Can you ship to Niger through Cotonou?',
      answer:
        'Only where the crossing is actually open to the goods. The border with Niger has been closed or restricted since 2023, so we confirm the routing per consignment and quote Lomé and the northern corridor where Cotonou cannot carry it.',
    },
    {
      question: 'Why does sea freight take a month?',
      answer:
        'Because the routing is around the Cape of Good Hope rather than through the Red Sea. Air freight into Cotonou runs four to six days and is quoted per shipment.',
    },
    {
      question: 'Can you deliver to Parakou and the north?',
      answer:
        'Yes, on DAP terms to the site gate, with the road leg north from Cotonou quoted rather than estimated.',
    },
    {
      question: 'Do you supply cotton gin and bale press hydraulics?',
      answer:
        'Yes. Press cylinders, high-pressure hose and the valves that control them, specified for a seasonal duty that runs flat out for months and then stands.',
    },
    {
      question: 'Can you supply the Glo-Djigbé industrial zone?',
      answer:
        'Yes. Plant and construction hydraulics for the factories and the contractors building them, delivered DAP to the zone.',
    },
  ],
  compliance: {
    heading: 'Tracked before arrival, declared in French',
    body: 'Cargo into Cotonou needs an electronic cargo tracking note — the BESC — raised against the booking before the vessel arrives; a container without one waits at the port until it exists. The commercial documents are in French and have to agree line for line with the declaration lodged through the single window. The one thing this page will not publish as settled is transit onward to Niger. The border has been closed or restricted since 2023, and a route that worked last year is not a route that works now, so a transit consignment is confirmed against what is crossing before it is quoted.',
    documents: [
      {
        ref: 'BESC',
        name: 'Electronic cargo tracking note',
        issuer: 'Raised against the booking',
        when: 'Before arrival',
      },
      {
        ref: 'DOCS-FR',
        name: 'Invoice and packing list in French',
        issuer: 'Indus Hydraulics',
        when: 'Before dispatch',
      },
      {
        ref: 'DECL',
        name: 'Customs declaration, single window',
        issuer: 'Consignee or clearing agent',
        when: 'On arrival',
      },
      {
        ref: 'COO',
        name: 'Certificate of Origin',
        issuer: 'Dubai Chamber attested',
        when: 'Before dispatch',
      },
      {
        ref: 'MTC',
        name: 'Material & test certificates',
        issuer: 'Mill, or our test bench',
        when: 'Where the order calls for them',
      },
    ],
  },
}

const TOGO: MarketPage = {
  slug: 'togo',
  regulatoryCopy: 'verified',
  released: true,
  lane: 'DXB → TG',
  dialCode: '+228',
  currency: 'USD',
  localName: 'République togolaise',
  lede: 'Lomé is one of the few deep-water ports on this stretch of the West African coast and a transshipment hub in its own right, so Togo is reached on mainline sailings round the Cape — four to five weeks from Jebel Ali. The same port is the head of the corridor north into Burkina Faso, Niger and Mali, which means much of what lands in Lomé is not for Togo at all. Whether a consignment is entered for Togo or declared in transit is decided before it sails, because converting one into the other afterwards costs a trip through customs.',
  facts: [
    { label: 'Typical transit', value: 'Typically 26–32 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali to Lomé, via the Cape · Road onward from Lomé on the northern corridor · Air freight into Lomé where the schedule is tighter',
    },
    {
      label: 'Incoterms 2020',
      value:
        'CIF Lomé · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder',
    },
    {
      label: 'Documentation',
      value:
        'Customs declaration through the single window, for import or for transit · Commercial documents in French · Cargo tracking note where the booking requires one · Certificate of Origin, Dubai Chamber attested',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via the Cape' },
    { label: 'Port of entry', value: 'Lomé' },
    { label: 'Transit', value: '26–32 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Togo'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: {
      name: 'LOMÉ · PORT',
      coords: [1.28, 6.13],
      legend: 'Port of entry',
      dx: 11,
      dy: 10,
      anchor: 'start',
    },
    routes: [
      { mode: 'SEA VIA THE CAPE', primary: true, points: leg(CAPE_TO_GUINEA, [1.28, 6.13]) },
      {
        mode: 'AIR',
        points: [
          [55.36, 25.25],
          [38.0, 15.0],
          [15.0, 9.0],
          [1.25, 6.17],
        ],
      },
    ],
  },
  freight: [
    {
      name: 'Sea, FCL',
      transit: '26–32 days',
      route: 'Jebel Ali to Lomé, via the Cape',
      useCase: 'Default for most orders',
    },
    {
      name: 'Air freight',
      transit: '4–6 days',
      route: 'DXB to LFW',
      useCase: 'When the line is down',
    },
    {
      name: 'Sea, LCL',
      transit: '30–38 days',
      route: 'Consolidated, with transshipment',
      useCase: 'Small mixed orders',
    },
  ],
  orderSteps: {
    third:
      'Once accepted, we agree whether the consignment is entered for Togo or declared in transit, and prepare the French document set to match before the container is loaded.',
    fourth: 'Goods sail from Jebel Ali, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Lomé', coords: [1.22, 6.13], region: 'Maritime' },
    { name: 'Aného', coords: [1.6, 6.23], region: 'Maritime' },
    { name: 'Kpémé', coords: [1.52, 6.22], region: 'Maritime' },
    { name: 'Hahotoé', coords: [1.43, 6.33], region: 'Maritime' },
    { name: 'Tsévié', coords: [1.21, 6.43], region: 'Maritime' },
    { name: 'Tabligbo', coords: [1.5, 6.58], region: 'Maritime' },
    {
      name: 'Kpalimé',
      coords: [0.63, 6.9],
      region: 'Plateaux',
      plot: true,
      dx: -9,
      dy: 4,
      anchor: 'end',
    },
    { name: 'Notsé', coords: [1.17, 6.95], region: 'Plateaux' },
    { name: 'Atakpamé', coords: [1.13, 7.53], region: 'Plateaux', plot: true, dx: 9, dy: 4 },
    { name: 'Sotouboua', coords: [0.98, 8.57], region: 'Centrale' },
    { name: 'Sokodé', coords: [1.13, 8.98], region: 'Centrale', plot: true, dx: 9, dy: 4 },
    { name: 'Bassar', coords: [0.79, 9.25], region: 'Kara' },
    { name: 'Kara', coords: [1.19, 9.55], region: 'Kara', plot: true, dx: 9, dy: 4 },
    { name: 'Mango', coords: [0.47, 10.36], region: 'Savanes', plot: true, dx: 9, dy: 4 },
    { name: 'Dapaong', coords: [0.21, 10.86], region: 'Savanes', plot: true, dx: 9, dy: -4 },
  ],
  sectors: [
    {
      slug: 'mining',
      name: 'Mining',
      description:
        'Phosphate at Hahotoé and Kpémé and clinker at Tabligbo — dust-rated, high-cycle components for dragline, conveyor and kiln plant.',
    },
    {
      slug: 'marine',
      name: 'Marine & Offshore',
      description:
        'Ship-to-shore crane, straddle-carrier and terminal hydraulics at the Lomé container terminals.',
    },
    {
      slug: 'construction',
      name: 'Construction',
      description:
        'Excavator, crane and batching-plant hydraulics for road, port and industrial-platform works.',
    },
    {
      slug: 'power',
      name: 'Power & Energy',
      description: 'Governor and actuator hydraulics for thermal and solar generation.',
    },
    {
      slug: 'oil-gas',
      name: 'Oil & Gas',
      description:
        'Transfer hose and valves for the fuel import and distribution terminals at Lomé.',
    },
    {
      slug: 'steel',
      name: 'Steel & Metals',
      description: 'Cylinders and valves for rebar, fabrication and workshop equipment.',
    },
  ],
  faqs: [
    {
      question: 'Do you have a branch in Togo?',
      answer:
        'No. Togo is supplied from our Dubai warehouse by sea into Lomé, with the French documents prepared before the container is loaded.',
    },
    {
      question: 'Import or transit — what is the difference?',
      answer:
        'An import is entered and cleared in Togo. A transit consignment is declared through Togo to a country beyond it and cleared there. The declaration is chosen before the goods sail, because converting one into the other at the port costs a trip through customs.',
    },
    {
      question: 'Can you ship to Burkina Faso, Niger or Mali through Lomé?',
      answer:
        'Yes, where the corridor is operating for the goods. Lomé is the head of the road north to the Sahel; we quote the inland leg per consignment and confirm the routing against what is actually crossing.',
    },
    {
      question: 'Do the documents have to be in French?',
      answer:
        'Yes, and they have to agree with each other. A description that differs between the invoice and the declaration is the commonest cause of delay at Lomé.',
    },
    {
      question: 'Can you supply the phosphate operations?',
      answer:
        'Yes. Abrasion-resistant hose, high-cycle cylinders and dust-rated fittings for the mine at Hahotoé and the processing plant at Kpémé, delivered DAP to the site.',
    },
    {
      question: 'Why does sea freight take a month?',
      answer:
        'Because the routing is around the Cape of Good Hope. Lomé’s mainline calls keep it at the short end for the region; air freight runs four to six days.',
    },
    {
      question: 'Can you deliver to Kara and the north?',
      answer:
        'Yes, on DAP terms to the site gate, with the road leg on the northern corridor quoted rather than estimated.',
    },
    {
      question: 'Do you crimp hose assemblies before dispatch?',
      answer:
        'Yes. Assemblies are crimped and pressure-tested in Dubai and shipped as finished items, tagged with the hose, the fitting and the test date.',
    },
  ],
  compliance: {
    heading: 'Entered for Togo, or declared through it',
    body: 'A large share of the cargo landed at Lomé is bound for Burkina Faso, Niger or Mali, and the declaration it moves under is a decision rather than a default. An import is entered and cleared in Togo; a transit consignment is declared through Togo under transit documents and cleared at its destination. The declaration goes through the single window, the commercial documents are in French and have to agree with it line for line, and a cargo tracking note is raised where the booking requires one. We agree which declaration applies at quotation, before the container is loaded.',
    documents: [
      {
        ref: 'DECL',
        name: 'Customs declaration, import or transit',
        issuer: 'Consignee or clearing agent',
        when: 'Decided at quotation',
      },
      {
        ref: 'DOCS-FR',
        name: 'Invoice and packing list in French',
        issuer: 'Indus Hydraulics',
        when: 'Before dispatch',
      },
      {
        ref: 'CTN',
        name: 'Cargo tracking note, where required',
        issuer: 'Raised against the booking',
        when: 'Before arrival',
      },
      {
        ref: 'COO',
        name: 'Certificate of Origin',
        issuer: 'Dubai Chamber attested',
        when: 'Before dispatch',
      },
      {
        ref: 'MTC',
        name: 'Material & test certificates',
        issuer: 'Mill, or our test bench',
        when: 'Where the order calls for them',
      },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// South-East Asia
// ─────────────────────────────────────────────────────────────────────────────

const PAPUA_NEW_GUINEA: MarketPage = {
  slug: 'papua-new-guinea',
  regulatoryCopy: 'verified',
  released: true,
  lane: 'DXB → PG',
  dialCode: '+675',
  currency: 'USD',
  lede: 'Papua New Guinea is the far end of the network: sea out of Jebel Ali through the Strait of Malacca, transhipped at Singapore onto a feeder for Lae or Port Moresby, four to six weeks to the quay. Most of the country’s mines and its LNG upstream sit inland or on islands with no road to either port, so the leg after the quay is planned with the order, and a consolidated consignment is worth more here than almost anywhere else we ship.',
  facts: [
    { label: 'Typical transit', value: 'Typically 28–38 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali to Lae or Port Moresby, transhipped at Singapore · Air freight into Port Moresby where the schedule is tighter, via Singapore or Brisbane',
    },
    {
      label: 'Incoterms 2020',
      value:
        'CIF Lae or Port Moresby · FOB Jebel Ali · EXW Dubai for a nominated forwarder · DAP where the inland leg can be committed',
    },
    {
      label: 'Documentation',
      value:
        'Customs entry filed by the importer · ISPM 15 treated timber packing, checked by NAQIA on arrival · Certificate of Origin, Dubai Chamber attested · Material and test certificates where the contract calls for them',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, transhipped' },
    { label: 'Port of entry', value: 'Lae · Port Moresby' },
    { label: 'Transit', value: '28–38 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Papua New Guinea'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: {
      name: 'LAE · PORT',
      coords: [146.99, -6.74],
      legend: 'Port of entry',
      dx: 11,
      dy: 10,
      anchor: 'start',
    },
    routes: [
      {
        mode: 'SEA · TRANSHIP',
        primary: true,
        points: leg(
          MALACCA_APPROACH,
          [101.0, 2.2],
          [103.8, 1.2],
          [107.5, -2.5],
          [112.0, -5.5],
          [118.0, -7.5],
          [125.0, -6.0],
          [129.0, -5.5],
          [134.5, -9.5],
          [142.2, -10.3],
          [147.0, -10.0],
          [151.0, -10.9],
          [150.5, -9.0],
          [148.3, -7.2],
          [146.99, -6.74]
        ),
      },
      {
        mode: 'AIR',
        points: [
          [55.36, 25.25],
          [65.0, 20.0],
          [78.0, 12.0],
          [92.0, 8.0],
          [103.99, 1.35],
          [147.22, -9.44],
        ],
      },
    ],
  },
  freight: [
    {
      name: 'Sea, FCL',
      transit: '28–38 days',
      route: 'Jebel Ali to Lae, via Singapore',
      useCase: 'Default for most orders',
    },
    {
      name: 'Air freight',
      transit: '4–7 days',
      route: 'DXB to POM, via SIN or BNE',
      useCase: 'When the line is down',
    },
    {
      name: 'Sea, LCL',
      transit: '32–45 days',
      route: 'Consolidated, with transshipment',
      useCase: 'Small mixed orders',
    },
  ],
  orderSteps: {
    third:
      'Once accepted, the order is packed on ISPM 15 treated timber and the onward leg beyond Lae or Port Moresby is agreed against how the site is actually supplied.',
    fourth:
      'Goods sail from Jebel Ali and change ship at Singapore, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Lae', coords: [147.0, -6.72], region: 'Morobe' },
    {
      name: 'Port Moresby',
      coords: [147.18, -9.44],
      region: 'National Capital District',
      plot: true,
      dx: -9,
      dy: 4,
      anchor: 'end',
    },
    { name: 'Madang', coords: [145.79, -5.22], region: 'Madang', plot: true, dx: 9, dy: -4 },
    { name: 'Goroka', coords: [145.39, -6.08], region: 'Eastern Highlands' },
    { name: 'Kainantu', coords: [145.87, -6.29], region: 'Eastern Highlands' },
    {
      name: 'Mount Hagen',
      coords: [144.23, -5.86],
      region: 'Western Highlands',
      plot: true,
      dx: -9,
      dy: 4,
      anchor: 'end',
    },
    { name: 'Tari', coords: [142.95, -5.85], region: 'Hela' },
    { name: 'Porgera', coords: [143.12, -5.47], region: 'Enga' },
    { name: 'Tabubil', coords: [141.23, -5.27], region: 'Western', plot: true, dx: 9, dy: -4 },
    { name: 'Kiunga', coords: [141.3, -6.12], region: 'Western' },
    { name: 'Wewak', coords: [143.63, -3.55], region: 'East Sepik', plot: true, dx: 9, dy: -4 },
    { name: 'Popondetta', coords: [148.24, -8.77], region: 'Oro' },
    { name: 'Alotau', coords: [150.45, -10.31], region: 'Milne Bay', plot: true, dx: 9, dy: 4 },
    { name: 'Kimbe', coords: [150.14, -5.55], region: 'West New Britain' },
    {
      name: 'Kokopo',
      coords: [152.27, -4.35],
      region: 'East New Britain',
      plot: true,
      dx: 9,
      dy: 4,
    },
    { name: 'Lihir', coords: [152.64, -3.12], region: 'New Ireland', plot: true, dx: 9, dy: -4 },
  ],
  sectors: [
    {
      slug: 'mining',
      name: 'Mining',
      description:
        'Copper and gold at Ok Tedi, Porgera and Lihir — abrasion-rated hose, high-cycle cylinders and dust-rated components for remote fleets.',
    },
    {
      slug: 'oil-gas',
      name: 'Oil & Gas',
      description:
        'The LNG upstream in the Southern Highlands and Hela, and the oilfield at Kutubu — wellhead, flow iron and process support.',
    },
    {
      slug: 'marine',
      name: 'Marine & Offshore',
      description:
        'Deck machinery and port-crane hydraulics at Lae and Port Moresby, and for the coastal and island fleet.',
    },
    {
      slug: 'power',
      name: 'Power & Energy',
      description: 'Governor and actuator hydraulics for hydro and diesel generation.',
    },
    {
      slug: 'construction',
      name: 'Construction',
      description:
        'Excavator, crane and batching-plant hydraulics for highland road and bridge works.',
    },
    {
      slug: 'steel',
      name: 'Steel & Metals',
      description:
        'Cylinders and valves for fabrication and the workshops that maintain mine and plantation fleets.',
    },
  ],
  faqs: [
    {
      question: 'Do you have a branch in Papua New Guinea?',
      answer:
        'No. Papua New Guinea is supplied from our Dubai warehouse by sea into Lae or Port Moresby, transhipped at Singapore, with the documents prepared before the vessel sails.',
    },
    {
      question: 'Lae or Port Moresby?',
      answer:
        'Lae for the Highlands and most mining and LNG supply, because the Highlands Highway starts there. Port Moresby for the capital and the south coast, which has no road link to Lae.',
    },
    {
      question: 'Why transship at Singapore?',
      answer:
        'Because no mainline service runs from the Gulf to Papua New Guinea. Containers change ship at Singapore onto a feeder, and the feeder schedule, not the distance, sets the arrival date.',
    },
    {
      question: 'Can you deliver to the mine?',
      answer:
        'Where the inland leg can be committed, yes, on DAP terms. Many sites are supplied through their own logistics base or by air or barge, so we often quote to that base rather than implying a door delivery we cannot stand behind.',
    },
    {
      question: 'What does NAQIA check?',
      answer:
        'The National Agriculture Quarantine and Inspection Authority checks timber packing and dunnage on arrival. Everything we ship goes on ISPM 15 treated, stamped timber, so the crate is not what holds the container.',
    },
    {
      question: 'Can you supply the LNG and upstream operators?',
      answer:
        'Yes, as a supplier to the operator or its contractors. API 6A wellhead, API 16C choke and kill and NACE MR0175 rated equipment, with material certificates where the contract requires them.',
    },
    {
      question: 'Is it worth consolidating orders?',
      answer:
        'More than almost anywhere. One consolidated container through Singapore and up to the site is far less freight, handling and waiting than several small consignments chasing each other along the same lane.',
    },
    {
      question: 'How long does air freight take?',
      answer:
        'Four to seven days into Port Moresby, routed through Singapore or Brisbane. Onward to Lae or a Highlands airstrip is quoted with the shipment.',
    },
  ],
  compliance: {
    heading: 'Clean packing, and a plan for the leg after the quay',
    body: 'Papua New Guinea’s import file is not complicated; its logistics are. The importer files the customs entry against our invoice and packing list, and the National Agriculture Quarantine and Inspection Authority inspects timber packing and dunnage on arrival, so everything goes on ISPM 15 treated and stamped timber. What decides whether an order arrives usefully is the leg after the quay: Lae and Port Moresby are not connected by road, and most mines and the LNG upstream are reached by highway, barge or air from a logistics base. We agree that leg at quotation and quote DAP only where it can be committed.',
    documents: [
      {
        ref: 'ENTRY',
        name: 'Customs entry',
        issuer: 'Importer or customs broker',
        when: 'On arrival',
      },
      {
        ref: 'ISPM 15',
        name: 'Treated and stamped timber packing',
        issuer: 'Packed in Dubai',
        when: 'Before dispatch',
      },
      {
        ref: 'NAQIA',
        name: 'Quarantine inspection of packing',
        issuer: 'National Agriculture Quarantine and Inspection Authority',
        when: 'On arrival',
      },
      {
        ref: 'COO',
        name: 'Certificate of Origin',
        issuer: 'Dubai Chamber attested',
        when: 'Before dispatch',
      },
      {
        ref: 'MTC',
        name: 'Material & test certificates',
        issuer: 'Mill, or our test bench',
        when: 'Where the order calls for them',
      },
    ],
  },
}

export const MARKET_PAGE_RECORDS_5: readonly MarketPage[] = [
  JORDAN,
  LEBANON,
  INDIA,
  PAKISTAN,
  BANGLADESH,
  SRI_LANKA,
  TURKMENISTAN,
  BENIN,
  TOGO,
  PAPUA_NEW_GUINEA,
]
