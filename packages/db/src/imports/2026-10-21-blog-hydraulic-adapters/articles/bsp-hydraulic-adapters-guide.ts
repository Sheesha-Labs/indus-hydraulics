import type { BlogArticleSeed } from '../shared'
import { PORT_SEALS } from '../diagrams'
import { stockList } from '../products'

/**
 * Steel BSP adapters and JIS (Japanese) 30° / 60° adapters. Sources read 2026-10-21: Parker Catalog 4300 (2017; current
 * 9/2023): BSPP = BS 2779 / ISO 228-1, BSPT = BS 21 / ISO 7-1, 55° flank; BSPP major diameters (Tables I2/I3); BSPP
 * seals on the spot face; port seal options (type E elastomer ED seal, type G/H O-ring + retaining ring, bonded
 * washer; narrow spot face B/E, wide G/H; ED and O-ring sizes, Table T26); EO male connector ratings, form E ED vs
 * form B cutting face, steel and 316Ti; 37° × BSPP ratings (F42EDMX, F4OMX, G4MX) and BSPT F3MX; K4 BS 5200 60° cone
 * (single line contact, also usable as an ISO 1179-1 port adapter with a bonded seal), HMK4 ratings; JIS: introduced
 * early 1990s for Japanese and Korean equipment, 30° flare (T4) and 60° cone (P4) interfaces with BSP threads, JIS
 * B2351 type O port O-rings, stamped "JIS", T4 ratings, P4 vs K4 not interchangeable (thread length, cone diameter,
 * K4 locating pilot); ISO TC131 statement that ISO 1179 / 9974 / 11926 ports are not for new designs. ISO 1179-2:2022
 * abstract (type E: S series to 63 MPa, L series to 25 MPa).
 * NOT used: "30° flare = 60° included" (Parker treats 30° flare and 60° cone as separate interfaces); JIS B 8363 scope.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'bsp-hydraulic-adapters-guide',
  title: 'BSP hydraulic adapters: BSPP and BSPT, bonded seals, ED seals, 60° cones and JIS fittings',
  excerpt:
    'A BSP adapter is decided by how it seals, not by its thread. On the same tube size Parker rates a BSPP stud with an ED soft seal at 500 bar and one with a metal cutting edge at 315 — and a BSPT taper lower still above ½". The steel BSP and JIS range — male studs, swivels, 60° cones, tees, plugs and converters — with the port forms, ratings by size, the JIS adapters that look like BSP and are not, and how to order.',
  categorySlug: 'buying-hydraulic-fittings',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'BSP Hydraulic Adapters: BSPP vs BSPT, ED & Bonded Seals, JIS',
  seoDescription:
    'A guide to steel BSP hydraulic adapters: BSPP and BSPT threads and sizes, ED seal, bonded seal, O-ring and cutting-edge port forms, BS 5200 60° cones, JIS 30° and 60° fittings, pressure ratings and ordering.',
  focusKeyword: 'bsp hydraulic adapters',
  publishedAt: '2026-10-21T19:40:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'BSPP (ISO 228-1) is parallel and seals on the port spot face — with an ED soft seal, an O-ring and retaining ring, a bonded washer or a metal edge. BSPT (ISO 7-1) is tapered and seals on the thread.',
        'The seal form changes the rating: Parker’s steel BSPP stud for 6–8 mm L-series tube is 500 bar with an ED seal and 315 bar with a metal cutting face; heavy series 800 against 400 bar.',
        'BSP female swivels seal on a 60° cone (BS 5200) — one line of contact between the cone and the swivel nose.',
        'JIS fittings use BSP threads but their own 30° flare and 60° cone seats; Parker warns its JIS 60° cone and BS 5200 60° cone do not interchange.',
        'ISO says BSPP ports should not be used in new designs (ISO 6149 instead) — but most machines in service still have them.',
      ],
    },
    {
      type: 'lead',
      html: 'BSP is the thread of British, European, Indian, Australian and much Asian equipment, and in the Gulf it is often the first thread a workshop meets. The thread itself is simple — a 55° Whitworth form, parallel or tapered. What makes BSP adapters confusing is that the same G ½ thread can seal four different ways, each with its own rating. For BSPP against BSPT in general see <a href="/blog/bspp-vs-bspt">BSPP vs BSPT</a>; this guide is about choosing and ordering the adapters.',
    },

    { type: 'section_head', number: '/01', title: 'Threads and sizes.', anchor: 'threads' },
    {
      type: 'comparison_table',
      caption: 'BSPP (ISO 228-1) sizes, threads per inch and major diameter',
      columns: ['Dash', 'BSPP', 'TPI', 'Major diameter'],
      rows: [
        { cells: ['-2', 'G 1/8', '28', '0.38" (9.73 mm)'] },
        { cells: ['-4', 'G 1/4', '19', '0.51" (13.16 mm)'] },
        { cells: ['-6', 'G 3/8', '19', '0.65" (16.66 mm)'] },
        { cells: ['-8', 'G 1/2', '14', '0.82" (20.96 mm)'], highlight: true },
        { cells: ['-10', 'G 5/8', '14', '0.90" (22.91 mm)'] },
        { cells: ['-12', 'G 3/4', '14', '1.04" (26.44 mm)'] },
        { cells: ['-16', 'G 1', '11', '1.30" (33.25 mm)'], highlight: true },
        { cells: ['-20', 'G 1-1/4', '11', '1.64" (41.91 mm)'] },
        { cells: ['-24', 'G 1-1/2', '11', '1.87" (47.80 mm)'] },
        { cells: ['-32', 'G 2', '11', '2.34" (59.61 mm)'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>BSPT uses the same pitches on a taper. Beware ½" and ¾": NPT and BSP share 14 threads per inch there and nearly the same diameter, so an NPT male will start in a BSP port — and leak, because the 55° and 60° flanks do not match. Parker’s rule is that the tapered families differ in dimensions, pitch and flank angle and do not interchange. A gauge settles it; see <a href="/blog/measuring-a-fitting-without-gauges">measuring a fitting without gauges</a> if you have none.</p>',
    },

    { type: 'section_head', number: '/02', title: 'How a BSP end seals.', anchor: 'seals' },
    {
      type: 'diagram',
      captionPrefix: 'FIG. 01',
      caption: 'Four common ways BSP, metric and NPT ends seal. A BSPP stud seals on the port face with a washer or soft seal; a BSP swivel seals on a 60° cone; a metric ISO 6149 stud seals on an O-ring in the port chamfer; a tapered thread seals on the thread itself, with sealant.',
      alt: 'Four simplified sections. One: a BSPP stud end with a bonded seal washer between the port face and the hex, sealing on the spot face, not the thread. Two: a male 60 degree cone inside a female swivel nut, sealing on the 60 degree seat. Three: a metric stud with an O-ring in the port chamfer under the hex. Four: a tapered male thread in a tapered port, sealing on the thread with sealant.',
      svg: PORT_SEALS,
    },
    {
      type: 'comparison_table',
      caption: 'BSPP male port forms (ISO 1179 family)',
      columns: ['Form', 'Seal', 'Note'],
      rows: [
        { cells: ['Type E — "ED" soft seal', 'Elastomer ring held under the hex, on the port face', 'ISO 1179-2: S series to 630 bar, L series to 250 bar'], highlight: true },
        { cells: ['Types G / H — O-ring + retaining ring', 'O-ring on the stud, held by a ring, on a wide spot face', 'H is the adjustable version'] },
        { cells: ['Bonded seal (Dowty)', 'Steel washer with a bonded rubber lip', 'Also lets a 60° cone male work as a port stud'] },
        { cells: ['Type B — metal cutting edge', 'A machined edge cut into the port face', 'Metal to metal; rated lowest'] },
      ],
    },
    {
      type: 'comparison_table',
      caption: 'Parker steel 24° × BSPP male connector: ED seal (form E) vs cutting face (form B), bar',
      columns: ['Tube / series', 'BSPP', 'ED seal', 'Cutting face'],
      rows: [
        { cells: ['6L, 8L', 'G 1/8, G 1/4', '500', '315'], highlight: true },
        { cells: ['12L', 'G 3/8', '420', '315'] },
        { cells: ['15L', 'G 1/2', '400', '250'] },
        { cells: ['22L–42L', 'G 3/4–G 1-1/2', '250', '160'] },
        { cells: ['6S, 10S', 'G 1/4, G 3/8', '800', '400'], highlight: true },
      ],
    },
    {
      type: 'prose',
      html: '<p>On the inch side, Parker’s steel 37° JIC × BSPP connectors show the same effect: -4 × G 1/8 is 7,200 psi with an ED seal and 5,000 psi with an O-ring and retaining ring; from -16 × G 1 both are 4,000 psi. Its 37° × BSPT male connector is 4,500 psi up to ½" and 2,300 psi from ¾" — the taper caps the adapter. Bonded seals must match the thread size and the spot face; see <a href="/blog/bspp-bonded-seal-sizing">bonded seal sizing</a>.</p>',
    },

    { type: 'section_head', number: '/03', title: '60° cones and swivels.', anchor: 'cones' },
    {
      type: 'prose',
      html: '<p>The BSP hose and swivel connection is the <strong>60° cone</strong> to BS 5200. Parker describes the seal as a single line of contact between the 60° cone seat and the ballnose or cone of the swivel — the BSP equivalent of an NPSM swivel. A male 60° cone can also serve as a port stud in an ISO 1179-1 port if a bonded seal is added, which is why many of our BSP adapters are described as "60° seat or bonded seal". Parker’s steel BSP 60° unions are rated 5,100 psi at ⅛"–¼", 2,900 psi from ⅜" to ¾", 1,700 psi at 1", 1,500 psi at 1¼"–1½" and 1,000 psi at 2" — well below a JIC or ORFS union of the same size.</p>',
    },

    { type: 'section_head', number: '/04', title: 'JIS fittings: BSP threads, different seats.', anchor: 'jis' },
    {
      type: 'prose',
      html: '<p>Japanese and Korean machines use JIS fittings, which Parker introduced in the early 1990s for equipment from those countries. They use BSP threads but their own seats: a <strong>30° flare</strong> interface and a <strong>60° cone</strong> interface, and the JIS B2351 type "O" port with its own O-rings (P8 for 1/8, P11 for ¼, P14 for ⅜, P18 for ½, P24 for ¾, P29 for 1"). Parker stamps its JIS fittings "JIS".</p><p>The trap is the 60° cone. Parker states that JIS and BS 5200 60° cones use the same BSPP thread and seat angle, but not all dimensions match — thread length, cone diameter and the BS 5200 bonded-seal locating pilot differ — and that they cannot be interchanged because the differences cause leaks. Parker rates its steel JIS 30° flare adapters at 5,000 psi from ¼" to ½", 4,000 psi at ¾" and 3,000 psi at 1". Our JIS range includes JIS × JIC and JIS × ORFS adapters, JIS × ORB and BSPP elbows, swivel tees and a BSPP-to-JIS 30° converter seat. For the field problem, see <a href="/blog/fittings-on-a-used-japanese-machine">the 30° seat problem</a>.</p>',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'ISO does not recommend BSPP for new designs.',
      body: 'Parker quotes ISO TC131: for new designs only ISO 6149 ports should be used, and ISO 1179 (BSPP), ISO 9974 (metric flat-face) and ISO 11926 (SAE ORB) ports should not. That is design guidance, not a reason to replace working ports — but on a new manifold, specify ISO 6149.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the difference between BSPP and BSPT adapters?', answer: 'BSPP is parallel and seals on the port face with a soft seal, O-ring, bonded washer or metal edge. BSPT is tapered and seals on the thread with sealant. Both use the 55° Whitworth form.' },
        { question: 'What is an ED seal?', answer: 'An elastomer seal held in a groove under the hex of a BSPP or metric stud, sealing on the port face (ISO 1179-2 type E). Parker rates ED-sealed studs well above metal-edge studs.' },
        { question: 'Can I use a bonded seal instead of an ED seal?', answer: 'On a plain BSPP stud with a flat face, yes — size the bonded seal to the thread and the port spot face. An ED stud already carries its own seal.' },
        { question: 'Are JIS and BSP fittings interchangeable?', answer: 'They share BSP threads, but JIS 30° flare and 60° cone seats are not BS 5200 60° cones. Parker says JIS and BS 5200 60° cone parts cannot be interchanged.' },
        { question: 'Why does my NPT fitting fit a BSP port?', answer: 'At ½" and ¾" both have 14 TPI and nearly the same diameter, so an NPT male starts in a BSP port. The flank angles differ (60° vs 55°) and it will leak.' },
        { question: 'What pressure is a BSP swivel rated for?', answer: 'Lower than JIC or ORFS: Parker’s steel BS 5200 60° unions are 5,100 psi at ⅛–¼", 2,900 psi from ⅜–¾" and 1,000 psi at 2".' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Steel BSP adapters, 60° cone and swivel fittings, and JIS 30° adapters:</p>' + stockList(['bsp-hydraulic-adapters-uae', 'jis-30-adapters']),
    },
    {
      type: 'product_embed',
      heading: 'BSP and JIS adapters',
      skus: ['IH-AD-BSP-040', 'IH-AD-BSP-020', 'IH-AD-BSP-054', 'IH-AD-BSP-025', 'IH-ST-9240', 'IH-ST-9061', 'IH-ST-9220', 'IH-ST-9999'],
    },
    { type: 'category_link', slug: 'bsp-hydraulic-adapters-uae', label: 'BSP hydraulic adapters', blurb: 'Steel BSPP and BSPT studs, swivels, 60° cones, tees and plugs.' },
    { type: 'category_link', slug: 'jis-30-adapters', label: 'JIS 30° adapters', blurb: 'JIS 30° adapters for Japanese and Korean machines.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'parker-4300', text: 'Parker Hannifin Tube Fittings Division. Catalog 4300 — sections B, E, F, H, I and T (2017 edition; current edition 9/2023).', url: 'https://parker.com/literature/Tube%20Fittings%20Division/4300_Catalog_Cover.pdf' },
        { id: 'iso-1179-2', text: 'ISO 1179-2:2022 — Connections with ISO 228-1 threads, stud ends with type E sealing (abstract).', url: 'https://committee.iso.org/standard/79702.html?browse=ics' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['bspp-vs-bspt', 'bspp-bonded-seal-sizing', 'bsp-or-metric-fittings', 'fittings-on-a-used-japanese-machine', 'metric-hydraulic-adapters-guide', 'jic-adapters-guide'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Threads, port forms, seal sizes and ratings from Parker Catalog 4300 (2017 edition — check the current edition before quoting a figure); type E pressure classes from the ISO 1179-2 abstract.',
    },
    {
      type: 'cta_block',
      heading: 'Matching a BSP port?',
      body: 'Send the thread size, whether the port is parallel or tapered, how it seals (washer, soft seal, cone) and the other end. We will match the adapter and the seal.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
