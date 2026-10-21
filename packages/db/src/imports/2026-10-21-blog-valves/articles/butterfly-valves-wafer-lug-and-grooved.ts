import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Butterfly valves: wafer vs lug vs grooved, DEMCO series, shut-off ratings, dead-end service, handles and gears.
 * Sources read 2026-10-21: SLB DEMCO butterfly valve catalogue (2024) — series and styles, neck lengths, Class 150
 * body (285 psi nonshock), 200 psi standard shut-off (285 and 50 psi options) on 2–12″, 150/285 psi on 14–36″,
 * 10 µm vacuum, −30 to 300 °F by seat, seat codes, lug end-of-line rule (liquid, 200 psi, blind flange, weld-neck or
 * socket flanges), gear operator recommended 8–12″, worm-gear ratios, MSS SP-67 / API 607; Victaulic publications
 * 08.05 (Series 700) and 08.20 (Series 761: 300 psi, bi-directional dead-end, ISO 5211 F07/F10, throttle 30–70°).
 * NOT used: Cv values on our DEMCO pages (not in the 2024 catalogue); ISO 5211 for the DEMCO top flange (not stated).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'butterfly-valves-wafer-lug-and-grooved',
  title: 'Butterfly valves: wafer, lug or grooved, shut-off ratings and dead-end service',
  excerpt:
    'A butterfly valve is the cheapest, lightest way to isolate a large line — but the body style decides what it can do. A wafer valve is clamped between two flanges and cannot hold pressure with one side removed; a lug valve can, within limits the maker sets; a grooved valve joins grooved pipe without flanges at all. How the DEMCO NE-C, NE-I, NE-D and NF-C series and the Victaulic grooved valves differ, what their shut-off ratings mean, and how to choose the handle or gear.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Butterfly Valves: Wafer vs Lug vs Grooved Explained',
  seoDescription:
    'Wafer, lug and grooved butterfly valves compared: DEMCO NE-C, NE-I, NE-D and NF-C series, 200 and 285 psi shut-off ratings, lug end-of-line rules, seats, Victaulic Series 700 and 761, handles, gear operators and throttling limits.',
  focusKeyword: 'wafer vs lug butterfly valve',
  publishedAt: '2026-10-21T23:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Wafer bodies are clamped between two flanges; lug bodies bolt to each flange separately, so they can stay in service with the downstream pipe removed.',
        'DEMCO allows dead-end service on 2–12″ lug valves for liquid up to 200 psi, with a blind flange attached and weld-neck or socket flanges only.',
        'DEMCO’s standard shut-off rating on 2–12″ valves is 200 psi (285 and 50 psi options); the body is ASME Class 150.',
        'Grooved valves such as Victaulic’s Series 761 rate 300 psi, bi-directional and dead-end.',
        'Use a gear operator from 8″ up; throttle no closer than 30° open.',
      ],
    },
    {
      type: 'lead',
      html: 'Butterfly valves isolate water, air, fuel, chemicals and slurry lines from 2″ to 36″ and more in a body a fraction of the length and weight of a gate or ball valve. A quarter-turn of the disc opens or closes the bore. The choices that matter are the body style, the shut-off rating, the seat elastomer and the operator — and getting the body style wrong is the one that hurts, because it decides whether the valve can hold the line when the pipe beyond it is taken away.',
    },

    { type: 'section_head', number: '/01', title: 'Wafer, lug or grooved.', anchor: 'bodies' },
    {
      type: 'comparison_table',
      caption: 'Butterfly valve body styles',
      columns: ['Body', 'How it is installed', 'Dead-end service', 'Example'],
      rows: [
        { cells: ['Wafer', 'Clamped between two flanges by through-bolts', 'No — removing one flange releases the valve', 'DEMCO NE-C, NE-I, NE-D wafer'], highlight: true },
        { cells: ['Lug (tapped)', 'Each flange bolts into threaded lugs', 'Yes, within the maker’s limit', 'DEMCO NE-C lug, NF-C lug'] },
        { cells: ['Grooved', 'Grooved couplings on grooved pipe', 'Yes, at full rating (Series 761)', 'Victaulic Series 700, 761'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Dead-end limits are the maker’s, not the body’s.',
      body: 'DEMCO: lug valves may be used, with an attached blind flange, in end-of-line service with downstream piping removed; only weld-neck or socket flanges can be used, and 2–12″ lug valves are suitable for liquid service up to 200 psi. For NF-C 14–36″ an open or blind flange is required. A wafer valve cannot be used this way at all.',
    },

    { type: 'section_head', number: '/02', title: 'The DEMCO series.', anchor: 'demco' },
    {
      type: 'comparison_table',
      caption: 'DEMCO butterfly valve series (SLB catalogue, 2024)',
      columns: ['Series', 'Sizes', 'Bodies', 'Notes'],
      rows: [
        { cells: ['NE-C', '2–12″', 'Wafer or lug', 'Long neck — clears 2″ of insulation on Class 150 flanges'], highlight: true },
        { cells: ['NF-C', '14–36″', 'Wafer or lug', 'Large bore; bronze bearings on both stems'] },
        { cells: ['NE-I', '2–12″', 'Wafer (double-D stem)', 'Short neck; food, beverage, utilities, process lines'] },
        { cells: ['NE-D', '2–12″', 'Wafer (square stem)', 'Short neck with body notches'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>All are one-piece bodies rated <strong>ASME Class 150 (285 psi nonshock)</strong>, fitting between Class 125/150 flanges. The standard <strong>shut-off rating</strong> — the pressure the closed disc seals against — is 200 psi on 2–12″ valves, with 285 and 50 psi options; 14–36″ valves are offered at 150 or 285 psi drop-tight. Throttling discs do not give drop-tight closure. The valves seal against 10 µm of vacuum (29.9 in Hg); DEMCO recommends 50 psi discs for vacuum duty.</p><p><strong>Seats</strong> are a hard-backed cartridge — elastomer bonded to a rigid ring — in Buna-N or FKM as standard, EPDM or natural rubber as options, and set the temperature range within −30 to 300 °F. <strong>Bodies</strong> are ductile iron as standard, with aluminium bronze, carbon steel and stainless options; <strong>discs</strong> nickel-plated ductile iron, aluminium bronze or stainless; <strong>stems</strong> 416 stainless, with 316 and Monel options. The integral flange seal works with weld-neck, slip-on, threaded, socket and stub-end flanges. DEMCO cites MSS SP-67 (testing on request) and API 607 fire testing on selected sizes. For reading a DEMCO part number, see <a href="/blog/demco-butterfly-valve-part-numbers">DEMCO butterfly valve part numbers</a>.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Grooved butterfly valves.', anchor: 'grooved' },
    {
      type: 'prose',
      html: '<ul><li><strong>Victaulic Series 700</strong> — 1½–6″, 200 psi, a ductile iron housing with an elastomer-lined carbon steel body and aluminium bronze disc. EPDM seats run −30 to +230 °F but are not for petroleum or steam; nitrile −20 to +180 °F.</li><li><strong>Victaulic Vic-300 MasterSeal Series 761</strong> — 2–12″, full vacuum to <strong>300 psi</strong>, with full working pressure for bi-directional and dead-end service. ISO 5211 mounting flange (F07 for 2–8″, F10 for 10–12″) for actuators; seats in EPDM, nitrile (+10 to +150 °F) or fluoroelastomer (+20 to +300 °F).</li></ul>',
    },

    { type: 'section_head', number: '/04', title: 'Handles, gears and throttling.', anchor: 'operators' },
    {
      type: 'prose',
      html: '<p>DEMCO offers three handle designs — 10-position locking, 2-position locking and memory stop — with a padlock hole, and recommends a <strong>gear operator for 8–12″ in all series</strong>. Its worm gears are self-locking with open and closed stops and a position indicator; the gear ratio rises with size, from 30:1 (7½ turns per 90°) on 2–6″ to 48:1 on 8–16″ and higher on the largest valves.</p><p>For throttling, Victaulic’s rule for the Series 761 is to keep the disc no less than 30° open, ideally between 30° and 70°. DEMCO notes that dynamic torque usually peaks with the disc about 70° open.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the difference between a wafer and a lug butterfly valve?', answer: 'A wafer valve is clamped between two flanges by through-bolts; a lug valve has threaded lugs so each flange bolts to it separately, which lets it stay in service with one side removed, within the maker’s limits.' },
        { question: 'Can a butterfly valve be used at the end of a line?', answer: 'A lug valve can, within the maker’s rules — DEMCO allows 2–12″ lug valves in liquid service up to 200 psi with a blind flange attached. A wafer valve cannot.' },
        { question: 'What does a 200 psi shut-off rating mean?', answer: 'The closed valve seals against a 200 psi differential. The body itself is rated ASME Class 150 (285 psi nonshock).' },
        { question: 'When do I need a gear operator?', answer: 'DEMCO recommends one for 8–12″ valves in all series, and on larger sizes.' },
        { question: 'Can a butterfly valve throttle?', answer: 'Yes, within limits: Victaulic advises keeping the disc between 30° and 70° open. Standard discs are for on-off or coarse throttling.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>DEMCO and Victaulic butterfly valves, handles, gear operators and actuators:</p>' + stockList(['butterfly-valves']),
    },
    {
      type: 'product_embed',
      heading: 'Butterfly valves',
      skus: ['IH-VAL-BFLY-NEC-W-4', 'IH-VAL-BFLY-NEC-L-6', 'IH-VAL-BFLY-NEI-W-3', 'IH-VAL-BFLY-NFC', 'IH-VAL-BFLY-VIC-761-4', 'IH-VAL-BFLY-VIC-700-3', 'IH-VAL-BFLY-WGO', 'IH-VAL-BFLY-HDL-10P'],
    },
    { type: 'category_link', slug: 'butterfly-valves', label: 'Butterfly valves', blurb: 'DEMCO wafer and lug valves, Victaulic grooved valves, handles and gears.' },
    { type: 'page_link', kind: 'industry', slug: 'oil-gas', label: 'Oil & gas', blurb: 'Utility, water and fuel lines on plants and rigs.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'demco-catalogue', text: 'SLB. DEMCO Butterfly Valves catalogue (2024).', url: 'https://www.slb.com/-/media/files/vl/brochure/demco-butterfly-valve-catalog-br.pdf' },
        { id: 'victaulic-0805', text: 'Victaulic. Publication 08.05 — Series 700 Butterfly Valve.', url: 'https://assets.victaulic.com/assets/uploads/literature/08.05.pdf' },
        { id: 'victaulic-0820', text: 'Victaulic. Publication 08.20 — Vic-300 MasterSeal Series 761.', url: 'https://assets.victaulic.com/assets/uploads/literature/08.20.pdf' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['demco-butterfly-valve-part-numbers', 'ball-valve-pressure-ratings-cwp-wog', 'stainless-steel-flanges-asme-b16-5', 'surface-safety-valves-and-esd-systems'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Series, ratings and installation rules from the SLB DEMCO catalogue (2024) and Victaulic publications 08.05 and 08.20.',
    },
    {
      type: 'cta_block',
      heading: 'Choosing a butterfly valve?',
      body: 'Send the size, the line fluid and temperature, the flange type, the shut-off pressure, whether it must hold the line dead-end, and how it will be operated. We will quote the valve, seat and handle or gear.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
