import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Brass NPTF pipe fittings and brass BSP / metric adapters. Sources read 2026-10-21: Parker Catalog 3501E (rev 05/22):
 * brass pipe fittings meet SAE J530 and J531, Dryseal threads, up to 1,000 psi (68.9 bar), −65 to +250 °F, no
 * derating table; Dryseal NPTF to ANSI B1.20.3, sealant recommended; assembly turns (straights hand-tight + 2 turns to
 * ½" MPT, 1½–2½ above; elbows and tees 1–1½ turns, align clockwise only, never back off); brass metric / BSP adapters
 * 2,900 psi (200 bar) ⅛–½", 2,175 psi (150 bar) ¾–1", −76 to +302 °F without washer, nickel-plated 870 psi;
 * BS 21 / ISO 7-1 pressure-tight taper, BS 2779 G threads not pressure-tight on the thread and need a peripheral seal,
 * BS 21 and BS 2779 do not necessarily mate at tolerance limits. CDA alloy pages (C36000 Cu 60–63 % Pb 2.5–3.0 %;
 * C27450 Pb 0.25 % max; C69300 lead-free silicon brass). US EPA lead-free definition (0.25 % weighted average on
 * wetted surfaces; certification from 1 Sep 2023). NSF/ANSI/CAN 372. Diehl CW602N DZR datasheet (dezincification
 * resistant to EN ISO 6509; for aggressive tap water); Diehl drinking-water alloys (CW614N CuZn39Pb3, not DZR).
 * NOT used: CZ132 naming; CW617N composition; gauge / lubrication uses as maker claims.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'brass-pipe-fittings-nptf-and-bsp',
  title: 'Brass pipe fittings and adapters: NPTF and BSP threads, 1,000 psi ratings, lead-free and DZR brass',
  excerpt:
    'Brass pipe fittings are rated for air, water, fuel and gauges — Parker gives its NPTF brass fittings 1,000 psi flat, a sixth of a steel hydraulic nipple. The brass NPTF and BSP range — nipples, elbows, tees, plugs, bushings, unions and BSP-to-NPT adapters — with ratings, how to make up a tapered brass joint without cracking it, and which brass belongs on drinking water: lead-free C69300, DZR CW602N, or neither.',
  categorySlug: 'buying-hydraulic-fittings',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Brass Pipe Fittings: NPTF & BSP Adapters, Ratings, Lead-Free',
  seoDescription:
    'A guide to brass NPTF pipe fittings and brass BSP and metric adapters: 1,000 psi pipe fitting ratings, 2,900 psi metric adapters, Dryseal and BSP threads, make-up turns, C36000, lead-free C69300 and DZR CW602N brass.',
  focusKeyword: 'brass pipe fittings',
  publishedAt: '2026-10-21T20:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Parker’s brass NPTF pipe fittings meet SAE J530 and J531 and are rated up to 1,000 psi (68.9 bar) across −65 to +250 °F — for air, water, fuel and gauges, not hydraulic pressure lines.',
        'Brass BSP and metric adapters rate higher at small sizes: Parker gives 2,900 psi (200 bar) to ½" and 2,175 psi (150 bar) at ¾–1".',
        'Brass tapered threads still need sealant; make straights up hand-tight plus about 2 turns, and never back an elbow off to align it.',
        'BSP parallel (G) threads do not seal on the thread — they need a peripheral seal such as an aluminium or bonded washer.',
        'Ordinary free-machining brass (C36000, 2.5–3% lead) is not "lead free" under US rules; potable water needs lead-free brass (≤ 0.25% weighted lead), and aggressive water a dezincification-resistant grade.',
      ],
    },
    {
      type: 'lead',
      html: 'Every compressor, receiver, gauge, lubricator and water line on a site has brass pipe fittings on it, and most hydraulic workshops keep a drawer of them. They are easy to machine, do not rust, and seal well with sealant on a tapered thread. They are also much weaker than steel, and the wrong brass on a drinking-water line can break a regulation. This guide covers the brass NPTF and BSP range, its ratings and how to use it.',
    },

    { type: 'section_head', number: '/01', title: 'Ratings.', anchor: 'ratings' },
    {
      type: 'comparison_table',
      caption: 'Parker brass fitting ratings (Catalog 3501E)',
      columns: ['Fitting', 'Rating', 'Temperature'],
      rows: [
        { cells: ['Brass NPTF pipe fittings (SAE J530 / J531)', 'Up to 1,000 psi (68.9 bar)', '−65 to +250 °F'], highlight: true },
        { cells: ['Brass metric and BSP adapters, ⅛"–½"', '2,900 psi (200 bar)', '−76 to +302 °F (without sealing washer)'] },
        { cells: ['Brass metric and BSP adapters, ¾"–1"', '2,175 psi (150 bar)', '−76 to +302 °F (without sealing washer)'] },
        { cells: ['Nickel-plated brass adapters', '870 psi (60 bar)', '+14 to +176 °F'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Parker publishes no temperature derating for its brass pipe fittings — 1,000 psi holds across the range. For comparison, its steel NPTF hex nipple is rated 6,000 psi up to ½" (see <a href="/blog/npt-and-npsm-adapters-guide">steel NPT adapters</a>). Brass belongs on compressed air, water, fuel, coolant and instrument lines, not on a hydraulic pressure circuit.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Threads and how to make them up.', anchor: 'threads' },
    {
      type: 'prose',
      html: '<p>Parker’s brass products use Dryseal NPTF threads to ANSI B1.20.3, and it still recommends a thread sealant. Its make-up guidance avoids over-driving soft brass: straight fittings hand-tight plus 2 wrench turns up to ½" male pipe thread, and 1½ to 2½ turns above ½"; elbows and tees hand-tight plus 1 to 1½ turns, aligned clockwise only — never counter-clockwise — and neither end backed out once made.</p><p>On the British side, Parker notes that BS 21 / ISO 7-1 taper threads are pressure-tight on the thread, while BS 2779 (G) parallel threads are not and need an elastomeric peripheral seal. In general BS 21 and BS 2779 threads do not necessarily mate at the limits of tolerance. Our BSP range includes BSPP, BSPT, BSP female, NPT and metric adapters, and aluminium sealing washers for the parallel threads.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Never back a brass elbow off to line it up.',
      body: 'Parker’s rule for brass elbows and tees: make up hand-tight plus 1 to 1½ turns and align clockwise only, never counter-clockwise, and do not back either end out once made. If it will not line up within those turns, take it apart and start again with fresh sealant.',
    },

    { type: 'section_head', number: '/03', title: 'Which brass: lead and dezincification.', anchor: 'alloys' },
    {
      type: 'comparison_table',
      caption: 'Common fitting brasses',
      columns: ['Alloy', 'Lead', 'Use'],
      rows: [
        { cells: ['C36000 free-cutting brass (CA360)', '2.5–3.0%', 'The machining reference alloy; general fittings — not lead-free'] },
        { cells: ['CW614N (CuZn39Pb3)', '2.5–3.5%', 'European machining brass; not dezincification resistant'] },
        { cells: ['C27450 yellow brass', '0.25% max', 'Low-lead fittings'] },
        { cells: ['C69300 silicon brass ("ECO brass", CW724R)', '0.09% max', 'Lead-free plumbing and pneumatic fittings, water valves'], highlight: true },
        { cells: ['CW602N DZR brass (CuZn36Pb2As)', 'about 2%', 'Dezincification resistant to EN ISO 6509 — for aggressive water'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>In the US, "lead free" for pipes and fittings in drinking-water service means a weighted average of no more than 0.25% lead across the wetted surfaces; the EPA has required manufacturers and importers to certify compliance since 1 September 2023, and NSF/ANSI/CAN 372 is the lead-content standard used to certify it. Standard leaded brass does not meet it. In some water, ordinary brass also <em>dezincifies</em> — loses its zinc and turns porous; Diehl describes its CW602N as particularly suitable for aggressive tap water and dezincification resistant to EN ISO 6509. If a fitting will carry drinking water, say so when you order, and ask for the alloy and its certificate.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What pressure are brass pipe fittings rated for?', answer: 'Parker rates its brass NPTF pipe fittings up to 1,000 psi (68.9 bar) from −65 to +250 °F. Its brass metric and BSP adapters are 2,900 psi to ½" and 2,175 psi at ¾–1".' },
        { question: 'Can brass fittings be used for hydraulics?', answer: 'Brass pipe fittings are for air, water, fuel and gauges at their rated pressure — far below steel hydraulic adapters. Use steel or stainless on hydraulic pressure lines.' },
        { question: 'Do brass NPT fittings need thread sealant?', answer: 'Yes. Parker recommends sealant on its Dryseal NPTF brass threads.' },
        { question: 'Are brass fittings lead free?', answer: 'Standard free-machining brass such as C36000 contains 2.5–3% lead and is not lead-free under US rules (0.25% weighted average). Lead-free alloys such as C69300 are used for drinking water.' },
        { question: 'What is DZR brass?', answer: 'Dezincification-resistant brass, such as CW602N, which resists losing its zinc in aggressive water (tested to EN ISO 6509).' },
        { question: 'How do I seal a brass BSP parallel thread?', answer: 'With a peripheral seal — an aluminium or bonded washer, or an O-ring — because BS 2779 (G) threads do not seal on the thread.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Brass NPTF pipe fittings, and brass BSP and metric adapters:</p>' + stockList(['brass-nptf-pipe-fittings', 'brass-bsp-metric-adapters']),
    },
    {
      type: 'product_embed',
      heading: 'Brass pipe fittings and adapters',
      skus: ['IH-BR-3325', 'IH-BR-3400', 'IH-BR-3700', 'IH-BR-3220', 'IH-BR-3250', 'IH-BR-8007', 'IH-BR-8037', 'IH-BR-8400'],
    },
    { type: 'category_link', slug: 'brass-nptf-pipe-fittings', label: 'Brass NPTF pipe fittings', blurb: 'Nipples, elbows, tees, plugs, bushings, unions and caps.' },
    { type: 'category_link', slug: 'brass-bsp-metric-adapters', label: 'Brass BSP & metric adapters', blurb: 'BSPP, BSPT, metric and NPT adapters and sealing washers.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'parker-3501e', text: 'Parker Hannifin. Catalog 3501E — Brass, Composite and Thermoplastic Fittings and Valves (rev. 05/22).', url: 'https://www.parker.com/content/dam/parker/lam/catalogs/pdf/4---conectores---mangueiras---v%C3%A1lvulas---instrumentos-para-flu%C3%ADdos/1---baixa-press%C3%A3o/Brass,%20Composite%20and.pdf' },
        { id: 'epa-lead-free', text: 'US EPA. Use of lead free pipes, fittings, fixtures, solder and flux for drinking water.', url: 'https://www.epa.gov/sdwa/use-lead-free-pipes-fittings-fixtures-solder-and-flux-drinking-water' },
        { id: 'nsf-372', text: 'NSF. NSF/ANSI/CAN 372 technical requirements.', url: 'https://www.nsf.org/knowledge-library/nsf-ansi-can-372-technical-requirements' },
        { id: 'cda-c69300', text: 'Copper Development Association. Alloy C69300.', url: 'https://alloys.copper.org/alloy/C69300' },
        { id: 'diehl-410', text: 'Diehl Brass Solutions. Material datasheet 410 (CW602N).', url: 'https://www.diehl.com/cms/files/Diehl_Brass_Solutions_Material_Datasheet_410.pdf' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['brass-flare-and-compression-fittings', 'brass-air-brake-fittings-guide', 'push-to-connect-air-fittings', 'bspp-vs-bspt', 'galvanic-corrosion-in-fittings'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Ratings and assembly from Parker Catalog 3501E; alloy compositions from the CDA and Diehl; lead-free rules from the US EPA and NSF.',
    },
    {
      type: 'cta_block',
      heading: 'Ordering brass fittings?',
      body: 'Send the threads, sizes and the medium — and tell us if it is drinking water. We will quote the fittings in the right brass.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
