import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Steel metric adapters: ISO 6149 and ISO 9974 / DIN 3852 ports, metric 74° / 24° / JIS 60° cones, Komatsu 30°.
 * Sources read 2026-10-21: Parker Catalog 4300 (2017; current 9/2023): ISO 6149 uses metric parallel threads with an
 * O-ring seal "similar to the proven SAE Straight Thread O-ring port", male stud identification groove, optional
 * port identification ridge, port sizes M8×1 … M60×2 (M20×1.5 cartridge cavities only); ISO 9974-1 / DIN 3852-1 seals
 * on the spot face (ED type E or O-ring + retaining ring); ED seal sizes; EO GEO (24° × ISO 6149) steel ratings by
 * series; 37° × ISO 6149 (F87OMX) and 37° × metric ED vs ORR ratings; ports to size 12 (M27) 6,000 psi+; ISO TC131
 * new-design statement; Komatsu style "KA": 30° flare, metric 1.5 mm pitch threads, hose adapter only, heavy crimp
 * nut, 4,000 psi generally, size table 02–14 (M14×1.5 … M42×1.5). EVS listing of ISO 6149-3 (L series 400 bar fixed,
 * 315 bar adjustable); ISO 6149-2 S series 630 / 400 bar (search summary only — stated as such).
 * NOT used: DIN 3852 form letters other than B and E.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'metric-hydraulic-adapters-guide',
  title: 'Metric hydraulic adapters: ISO 6149 and DIN 3852 ports, ED seals, metric cones and Komatsu fittings',
  excerpt:
    'An M22×1.5 port can seal on an O-ring in its chamfer (ISO 6149), on a soft seal under the hex (DIN 3852 / ISO 9974 form E) or on a metal edge — and the adapter has to match. Then there are the metric tube ends: 24° cone, 74° cone and the Komatsu 30° flare, whose M33×1.5 thread will not enter an M33×2 port. The steel metric range, the port forms and ratings, and how to order.',
  categorySlug: 'buying-hydraulic-fittings',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Metric Hydraulic Adapters: ISO 6149, DIN 3852, ED Seal, Komatsu',
  seoDescription:
    'A guide to steel metric hydraulic adapters: ISO 6149 O-ring ports, ISO 9974 / DIN 3852 ED-seal ports, metric thread sizes, pressure ratings by size and series, metric 74° and 24° cones, Komatsu 30° flare fittings and ordering.',
  focusKeyword: 'metric hydraulic adapters',
  publishedAt: '2026-10-21T19:50:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Two metric port families: ISO 6149 (O-ring in the port chamfer, identified by a groove on the stud) and ISO 9974 / DIN 3852 (seal on the port face — an ED soft seal or a metal edge).',
        'ISO says only ISO 6149 ports should be used in new designs; ISO 9974 ports remain everywhere in service.',
        'Ratings depend on series and whether the stud is adjustable: ISO 6149-3 allows 400 bar for fixed and 315 bar for adjustable light-series studs.',
        'Parker’s steel 24° × ISO 6149 connectors run from 500 bar (L) and 800 bar (S) at small sizes down to 250 and 420 bar at large ones.',
        'Komatsu-style 30° flare fittings use metric threads of 1.5 mm pitch throughout — M33×1.5, M42×1.5 — so they do not fit M33×2 or M42×2 ports.',
      ],
    },
    {
      type: 'lead',
      html: 'Metric threads are the default on European machines and common on Asian ones, and the metric part of an adapter drawer is where most mistakes happen — because a metric thread tells you only its diameter and pitch, not how it seals. This guide covers the metric ports, the metric tube ends, the ratings, and the Komatsu fittings that share sizes with neither. For choosing between BSP and metric on a machine, see <a href="/blog/bsp-or-metric-fittings">BSP or metric fittings</a>.',
    },

    { type: 'section_head', number: '/01', title: 'The metric port forms.', anchor: 'ports' },
    {
      type: 'comparison_table',
      caption: 'Metric parallel port forms',
      columns: ['Form', 'Standard', 'Seals on', 'Identify by'],
      rows: [
        { cells: ['O-ring port', 'ISO 6149-1 (studs ISO 6149-2 / -3)', 'O-ring in the port chamfer under the stud shoulder', 'Groove on the stud hex; optional ridge or "metric" marking on the port'], highlight: true },
        { cells: ['Flat-face port, type E', 'ISO 9974-1 / DIN 3852-1', 'ED elastomer seal under the hex on the spot face', 'Flat spot face, no chamfer O-ring'] },
        { cells: ['Flat-face port, O-ring + retaining ring', 'ISO 9974-1 / DIN 3852-1', 'O-ring held by a ring on the spot face', 'Wide spot face'] },
        { cells: ['Metal edge, form B', 'DIN 3852', 'Machined edge cut into the face', 'Sharp edge on the stud'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Parker describes ISO 6149 as a metric parallel thread with a sealing method similar to the SAE straight-thread O-ring port, and lists ISO 6149-1 port sizes from M8×1 to M60×2 (M20×1.5 only for cartridge valve cavities). A port without its identification ridge is meant to be marked "metric" or "ISO 6149-1" on the component. ISO 9974-1 ports seal on the spot face instead; the ED seal sizes follow the thread (M14×1.5 ED14X1.5X, M22×1.5 ED22X1.5X, M27×2 ED26X1.5X, M33×2 ED33X2X).</p>',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'New designs: ISO 6149.',
      body: 'Parker quotes ISO TC131: for new hydraulic designs only ISO 6149 ports and stud ends should be used; ISO 1179 (BSPP), ISO 9974 (metric flat-face) and ISO 11926 (SAE ORB) should not. Existing machines keep their ports — match the adapter to the port that is there.',
    },

    { type: 'section_head', number: '/02', title: 'Ratings by size and series.', anchor: 'ratings' },
    {
      type: 'comparison_table',
      caption: 'Parker steel 24° cone × ISO 6149 male connector, bar',
      columns: ['L series', 'Thread', 'Rating', 'S series', 'Thread', 'Rating'],
      rows: [
        { cells: ['6L', 'M10×1', '500', '6S', 'M12×1.5', '800'] },
        { cells: ['10L', 'M14×1.5', '500', '10S', 'M16×1.5', '800'] },
        { cells: ['12L', 'M16×1.5', '400', '12S', 'M18×1.5', '630'], highlight: true },
        { cells: ['18L', 'M22×1.5', '400', '16S', 'M22×1.5', '630'] },
        { cells: ['22L', 'M27×2', '250', '20S', 'M27×2', '420'] },
        { cells: ['28L', 'M33×2', '250', '25S', 'M33×2', '420'] },
        { cells: ['42L', 'M48×2', '250', '38S', 'M48×2', '420'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>The standard sets ceilings by stud type: ISO 6149-3 (light series) allows up to 400 bar for non-adjustable stud ends and 315 bar for adjustable ones; the heavy-series ISO 6149-2 is generally given as 630 bar fixed and 400 bar adjustable. So "ISO 6149 = 630 bar" is only true of a fixed heavy-series stud. On the inch side, Parker’s steel 37° JIC × ISO 6149 connectors are rated 7,200 psi at M10, 6,000 psi at M12–M16, 5,000 psi at M18–M27 and 4,000 psi at M33–M42.</p><p>The seal form matters too. Parker’s 37° × metric flat-face connectors with an ED seal are rated 5,000 psi at M18–M27, against 3,600 psi at M18–M22 and 3,000 psi at M27 with an O-ring and retaining ring.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Metric tube ends: 24°, 74° and 60° cones.', anchor: 'cones' },
    {
      type: 'prose',
      html: '<ul><li><strong>24° cone</strong> — the DIN 2353 / ISO 8434-1 cutting-ring connection, in L and S series. Our dedicated range is in <a href="/blog/din-2353-adapters-guide">DIN 2353 adapters</a>; the metric shelf carries 24° female swivel adapters and dual-purpose studs that fit either a port or a 24° tube nut.</li><li><strong>Metric 74° cone</strong> — a 37° flare form on metric threads, used on some Asian and European machines; our range covers straights, elbows, tees, bulkheads and plugs to BSPT, NPT, ORB and metric studs.</li><li><strong>JIS metric 60° cone</strong> — the Japanese 60° cone on metric threads, with adapters to BSPT, BSP and metric studs.</li></ul>',
    },

    { type: 'section_head', number: '/04', title: 'Komatsu-style 30° flare.', anchor: 'komatsu' },
    {
      type: 'prose',
      html: '<p>Parker describes the Komatsu style as a 30° flare with metric threads, used only as a hose adapter, with a heavy crimp nut for higher assembly torque, generally rated 4,000 psi with full rating in sizes 4 to 16. Every Komatsu thread is 1.5 mm pitch:</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Komatsu-style 30° flare sizes (Parker)',
      columns: ['Komatsu size', 'Dash equivalent', 'Thread'],
      rows: [
        { cells: ['02', '-4', 'M14×1.5'] },
        { cells: ['03', '-6', 'M18×1.5'] },
        { cells: ['04', '-8', 'M22×1.5'] },
        { cells: ['05', '-10', 'M24×1.5'] },
        { cells: ['06', '-12', 'M30×1.5'] },
        { cells: ['10', '-16', 'M33×1.5'], highlight: true },
        { cells: ['12', '-20', 'M36×1.5'] },
        { cells: ['14', '-24', 'M42×1.5'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Metric ports use M27×2, M33×2 and M42×2 at those sizes, so a Komatsu M33×1.5 nut will not thread onto an M33×2 port — check the pitch with a gauge before you assume. Our range includes Komatsu male connectors to metric, metric flat, NPT and SAE ends.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is an ISO 6149 port?', answer: 'A metric parallel-thread port that seals on an O-ring in its chamfer, like an SAE ORB port. The stud has an identification groove on its hex, and ISO recommends it for all new designs.' },
        { question: 'What is the difference between ISO 6149 and DIN 3852?', answer: 'Where the seal is. ISO 6149 seals on an O-ring in the port chamfer; DIN 3852 / ISO 9974 seals on the flat spot face with an ED soft seal, an O-ring and retaining ring, or a metal edge.' },
        { question: 'What pressure is an ISO 6149 adapter rated for?', answer: 'It depends on series, size and whether it is adjustable: ISO 6149-3 allows 400 bar fixed and 315 bar adjustable for light series; Parker’s steel heavy-series connectors reach 800 bar at M12×1.5.' },
        { question: 'What thread is a Komatsu fitting?', answer: 'Metric, 1.5 mm pitch at every size (M14×1.5 to M42×1.5), with a 30° flare. It does not fit 2 mm pitch metric ports of the same diameter.' },
        { question: 'What is a metric 74° cone fitting?', answer: 'A 37° flare (74° included) connection on metric threads rather than UN/UNF — found on some imported machines.' },
        { question: 'How do I tell M22×1.5 from M22×2?', answer: 'With a pitch gauge: 1.5 mm and 2 mm pitch look alike by eye and will not mate.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Steel metric adapters — ISO 6149 and flat-face studs, metric 74° and JIS 60° cones, 24° swivels and Komatsu fittings:</p>' + stockList(['metric-adapters']),
    },
    {
      type: 'product_embed',
      heading: 'Metric adapters',
      skus: ['IH-AD-MET-022', 'IH-AD-MET-024', 'IH-AD-MET-025', 'IH-AD-MET-001', 'IH-AD-MET-030', 'IH-AD-MET-011', 'IH-ST-9022', 'IH-ST-9635S'],
    },
    { type: 'category_link', slug: 'metric-adapters', label: 'Metric adapters', blurb: 'Steel ISO 6149, flat-face, metric cone and Komatsu adapters.' },
    { type: 'page_link', kind: 'industry', slug: 'construction', label: 'Construction', blurb: 'European and Japanese site machines.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'parker-4300', text: 'Parker Hannifin Tube Fittings Division. Catalog 4300 — sections B, E, F, J and T (2017 edition; current edition 9/2023).', url: 'https://parker.com/literature/Tube%20Fittings%20Division/4300_Catalog_Cover.pdf' },
        { id: 'iso-6149-3', text: 'EVS-EN ISO 6149-3:2007 — light-duty (L series) stud ends, scope.', url: 'https://www.evs.ee/en/evs-en-iso-6149-3-2007' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['bsp-or-metric-fittings', 'din-2353-adapters-guide', 'bsp-hydraulic-adapters-guide', 'fittings-on-a-chinese-excavator', 'korean-excavator-hydraulic-fittings', 'hydraulic-thread-size-and-pitch-reference'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Port forms, sizes, ratings and Komatsu data from Parker Catalog 4300 (2017 edition — check the current edition); ISO 6149-3 limits from the standard’s scope listing.',
    },
    {
      type: 'cta_block',
      heading: 'Matching a metric port?',
      body: 'Send the thread with its pitch, how the port seals (O-ring chamfer, flat face, edge) and the other end. We will match the adapter and its seal.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
