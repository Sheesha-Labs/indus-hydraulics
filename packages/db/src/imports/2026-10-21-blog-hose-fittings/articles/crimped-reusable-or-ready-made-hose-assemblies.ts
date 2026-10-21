import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Crimped vs reusable (field-attachable) hose ends vs ready-made assemblies, plus hose types, live swivels and
 * pressure-washer ends. Sources read 2026-10-21: Parker Catalog 4400 US (field-attachable series 20/21/22 for R5 and
 * air brake, 30 for 2SN, 42 for 1SN/R16, 82 Push-Lok; no field-attachable series for four- or six-spiral hose; 30 Series
 * assembly steps; 302 and 422 tables give one pressure per size with both crimp and field-attachable series; §3.5 do
 * not reuse crimped fittings, do not reuse a field-attachable fitting that blew or pulled off, do not fit ends to hose
 * that was in service; STAMP = Size, Temperature, Application, Media, Pressure; 4:1 design factor); Parker 4400/UK
 * (proof test to ISO 1402 at twice working pressure for 30–60 s on request; EN ISO 4413 forbids used components;
 * assembly marking: maker, date, assembly maximum working pressure; DIN 20066 length tolerances; shelf life 10 years
 * per ISO 17165-2 / SAE J1273 vs DIN 20066 4 / 6 / 2 years); Danfoss (field-attachable definition; STAMPED with Ends
 * and Delivery; length tolerance); Gates (length tolerance; storage and test scheme by age); SAE J343 / ISO 6803 /
 * ISO 6802 abstracts (impulse tests). Parflex (field-attachable not for hose previously in service). Listing copy
 * (2-wire assemblies with JIC, NPT, ORFS ends in standard lengths 12–300"; pressure washer assembly; reusable R1, R2AT,
 * R5 ends; live swivels; pressure washer fittings; hose types R1–R17, 1SC, 2SC, 4SP, 4SH, Enerpac 10,000 psi).
 * NOT used: a pressure derating for reusable ends (Parker shows none); the reason reusable ends are not made for spiral.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'crimped-reusable-or-ready-made-hose-assemblies',
  title: 'Crimped, reusable or ready-made: choosing how to get a hydraulic hose assembly',
  excerpt:
    'There are three ways to end up with a working hose: crimp it in a shop, fit reusable ends in the field with two spanners, or buy it made up. Each has rules the makers spell out — reusable ends exist for braided and R5 hose but not for spiral; nothing crimped is ever reused; a proof test is twice working pressure. How to choose, how to specify the assembly (STAMP), length tolerances, testing and shelf life, plus the hose types, live swivels and washdown ends in our range.',
  categorySlug: 'hose-assembly',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Crimped vs Reusable vs Ready-Made Hydraulic Hose Assemblies',
  seoDescription:
    'How to choose between crimped, reusable (field-attachable) and ready-made hydraulic hose assemblies: which hoses take reusable ends, STAMP specification, proof testing, length tolerance, marking and shelf life.',
  focusKeyword: 'reusable hydraulic hose fittings',
  publishedAt: '2026-10-21T22:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Crimped ends are permanent, made in a shop to the maker’s crimp specification; they are never reused.',
        'Reusable (field-attachable) ends screw onto hose with spanners. Parker offers them for 1SN, 2SN, R16, R5, air brake and push-lock hose — but lists none for four- or six-spiral hose.',
        'Parker’s tables give one pressure per size for its 1SN and 2SN hose whether the end is crimped or field-attachable; the hose rating governs, not the method.',
        'Specify an assembly with Parker’s STAMP — Size, Temperature, Application, Media, Pressure — and Danfoss adds Ends and Delivery: STAMPED.',
        'On request, Parker proof-tests assemblies to ISO 1402 at twice working pressure for 30–60 seconds; every assembly should carry its maker, date and maximum working pressure.',
      ],
    },
    {
      type: 'lead',
      html: 'A hose fails on a machine miles from a hose shop. Do you fit reusable ends from the service van, crimp a new assembly at the depot, or order it made up? The answer depends on the hose, the pressure, the time and the tools — and on rules the hose makers publish. This guide sets out the three routes and how to specify an assembly whichever you choose.',
    },

    { type: 'section_head', number: '/01', title: 'Three routes.', anchor: 'routes' },
    {
      type: 'comparison_table',
      caption: 'Crimped, reusable or ready-made',
      columns: ['Route', 'How', 'Hoses', 'Best for'],
      rows: [
        { cells: ['Crimped (permanent)', 'Stem and ferrule crimped to the maker’s chart in an approved crimper', 'All hydraulic hose, including spiral', 'Workshop production; highest pressures'], highlight: true },
        { cells: ['Reusable (field-attachable)', 'Socket screwed onto the hose, nipple screwed into the socket', 'Parker: 1SN, 2SN, R16, R5, air brake, push-lock — no spiral', 'Field repair without a crimper'] },
        { cells: ['Ready-made assembly', 'Built and tested by the supplier to length and ends', 'Any', 'Standard lengths, spares stock, certified assemblies'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Parker’s field-attachable range covers its R5 and air-brake hose (20, 21 and 22 Series), 2SN (30 Series), 1SN and R16 (42 Series) and push-lock (82 Series); it lists none for four- or six-spiral hose, which use crimped interlock or skive fittings instead. Assembly is simple — Parker’s 30 Series: put the socket in a vice, screw the hose in anticlockwise until it bottoms, back it out half a turn, then screw the nipple in until its hex shoulders against the socket. Parker’s 1SN and 2SN tables list one working pressure per size for both its crimp and field-attachable series.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'What can never be reused.',
      body: 'Parker: never reuse a crimped or swaged fitting or any part of it; never reuse a field-attachable fitting that has blown or pulled off a hose; never fit new ends to hose that has been in service. Parflex adds that field-attachable ends are not for hose previously in service, and EN ISO 4413 forbids building assemblies from used components.',
    },

    { type: 'section_head', number: '/02', title: 'Specifying the assembly.', anchor: 'specify' },
    {
      type: 'prose',
      html: '<p>Parker’s rule of thumb is "before you spec it, STAMP it": <strong>S</strong>ize, <strong>T</strong>emperature, <strong>A</strong>pplication, <strong>M</strong>edia, <strong>P</strong>ressure. Danfoss extends it to STAMPED — adding <strong>E</strong>nds (style, type, orientation, attachment) and <strong>D</strong>elivery (testing, quality, packaging). For a made-up assembly add the overall length, the end types, and the displacement angle between two elbows. See <a href="/blog/what-to-send-for-a-fittings-quote">what to send for a quote</a>.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Assembly length tolerance — makers differ',
      columns: ['Length', 'Gates (fig. "SAE J517")', 'Danfoss'],
      rows: [
        { cells: ['Up to 300 mm / 12"', '±3 mm', '±1/8"'] },
        { cells: ['300–450 mm / 12–18"', '±5 mm', '±3/16"'] },
        { cells: ['450–900 mm / 18–36"', '±7 mm', '±1/4"'] },
        { cells: ['Over 900 mm / 36"', '±1%', '±1%'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Parker Europe works to the asymmetric DIN 20066 table instead — for example +7 / −3 mm up to 630 mm on hose to 25 mm bore. If length matters to the millimetre, state the tolerance on the order.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Testing, marking and shelf life.', anchor: 'testing' },
    {
      type: 'prose',
      html: '<ul><li><strong>Proof test.</strong> Parker Europe proof-tests on request to ISO 1402: twice the assembly’s working pressure for 30 to 60 seconds, with no leakage or pressure drop.</li><li><strong>Impulse tests</strong> are qualification tests for hose and fitting designs, not for each assembly: SAE J343 for SAE 100R hose, ISO 6803 without flexing and ISO 6802 with flexing.</li><li><strong>Marking.</strong> Parker Europe: every assembly carries the manufacturer, production year and month, and the maximum working pressure of the whole assembly.</li><li><strong>Shelf life.</strong> Sources differ: ISO 17165-2 / SAE J1273, as Parker summarises them, allow 10 years from manufacture if stored to ISO 2230; DIN 20066 allows 4 years for bulk hose and 2 years for stored assemblies; Gates tests stock older than 4 years and scraps it after 8. Thermoplastic and PTFE hose are treated as unlimited.</li></ul>',
    },

    { type: 'section_head', number: '/04', title: 'Hose, live swivels and washdown ends.', anchor: 'range' },
    {
      type: 'prose',
      html: '<p>Our range includes the hose itself — SAE 100R1 to R17, EN 857 1SC and 2SC, EN 856 4SP and 4SH, PTFE and 10,000 psi jack hose — standard 2-wire assemblies with JIC, NPT and ORFS ends in lengths from 12" to 300", a pressure-washer assembly, reusable ends for R1, R2AT and R5 hose, in-line and 90° live swivels for rotating connections, and pressure-washer gun and waterjet fittings. For hose types see <a href="/blog/sae-100r-hose-types">SAE 100R types</a>.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Are reusable hydraulic fittings as good as crimped?', answer: 'For the hoses they are made for, Parker lists the same working pressure per size for crimp and field-attachable series on its 1SN and 2SN hose. They are not offered for spiral hose.' },
        { question: 'Can I reuse a reusable fitting?', answer: 'Only if it has not blown or pulled off a hose, and never on hose that has been in service, per Parker.' },
        { question: 'What does STAMP mean for hose?', answer: 'Parker’s checklist: Size, Temperature, Application, Media, Pressure. Danfoss’ STAMPED adds Ends and Delivery.' },
        { question: 'What is a hose proof test?', answer: 'Pressurising the finished assembly — Parker Europe to ISO 1402, at twice working pressure for 30–60 seconds — and checking for leaks or pressure drop.' },
        { question: 'How long can hydraulic hose be stored?', answer: 'It depends on the standard: 10 years per ISO 17165-2 / SAE J1273 if stored correctly, 4 years for bulk hose per DIN 20066. Gates tests stock over 4 years old and scraps it after 8.' },
        { question: 'What is a live swivel?', answer: 'A rotating joint fitted in a hose line so the hose does not twist where a connection turns.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Reusable hose ends, made-up assemblies, live swivels, pressure-washer fittings and hydraulic hose:</p>' + stockList(['reusable-hose-ends', 'hydraulic-hose-assemblies', 'live-swivels', 'pressure-washer-waterjet-fittings', 'hydraulic-hoses']),
    },
    {
      type: 'product_embed',
      heading: 'Assemblies, reusable ends and hose',
      skus: ['IH-HA-2W-JIC', 'IH-HA-2W-ORFS', 'IH-ST-R2-RE-FJX', 'IH-ST-R5-RE-FJX', 'IH-HOSE-R2-2SN', 'IH-HOSE-4SH', 'IH-HYD-IN-LINE-LIVE-SWIVEL', 'IH-PW-WJ-FEM'],
    },
    { type: 'category_link', slug: 'hydraulic-hose-assemblies', label: 'Hydraulic hose assemblies', blurb: 'Made-up 2-wire assemblies in standard lengths.' },
    { type: 'category_link', slug: 'reusable-hose-ends', label: 'Reusable hose ends', blurb: 'Field-attachable ends for R1, R2AT and R5 hose.' },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hoses', blurb: 'SAE 100R, EN 853, 856 and 857 hose.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'parker-4400', text: 'Parker Hannifin. Catalog 4400 — Hose Products (US).', url: 'https://www.parker.com/content/dam/Parker-com/Literature/Hose-Products-Division/Catalog-4400-PDF-Files/HPD_4400_Catalog.pdf' },
        { id: 'parker-4400-uk', text: 'Parker Hannifin. Catalogue 4400/UK — Technical Handbook.', url: 'https://www.parker.com/content/dam/Parker-com/Literature/Polymer-Hose-Division-Europe/Sales-and-Marketing-Bulletins/4400_Rubber-Hydraulic/Technical-Handbook-UK.pdf' },
        { id: 'danfoss-hose', text: 'Danfoss (Aeroquip). Rubber Hydraulic Hose & Fitting Catalog.', url: 'https://assets.danfoss.com/documents/latest/407914/AF447562429531en-010106.pdf' },
        { id: 'gates-crimp', text: 'Gates. Crimp Data and Dies manual.', url: 'https://www.gates.com/content/dam/documents-library/operating-manuals/crimp-data-and-dies-manual.pdf' },
        { id: 'iso-6803', text: 'ISO 6803:2017 — Hydraulic-pressure impulse test without flexing (abstract).', url: 'https://www.iso.org/standard/68057.html' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['braided-hose-crimp-fittings-guide', 'spiral-hose-crimp-fittings-guide', 'sae-100r-hose-types', 'consolidating-fittings-with-a-hose-order', 'what-to-send-for-a-fittings-quote', 'hose-burst-at-the-fitting'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Field-attachable ranges, reuse rules, STAMP and testing from Parker Catalog 4400 (US and UK); STAMPED and length tolerances from Danfoss and Gates; shelf-life sources quoted as they differ.',
    },
    {
      type: 'cta_block',
      heading: 'Need an assembly or reusable ends?',
      body: 'Send the hose, length, both ends, pressure and medium. We will quote the made-up assembly, tested if required, or reusable ends for field repair.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
