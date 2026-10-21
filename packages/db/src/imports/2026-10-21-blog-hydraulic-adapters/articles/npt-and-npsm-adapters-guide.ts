import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Steel NPT / NPTF / NPSM adapters and steel weld-on adapters. Sources read 2026-10-21: Parker Catalog 4300 (2017;
 * current 9/2023): NPTF = SAE J476 / ANSI B1.20.3, NPT = ANSI B1.20.1 (Table F1; the pipe-swivel page prints them
 * swapped); Dryseal controlled truncation for crest-root contact, sealant still necessary; steel pipe products mostly
 * NPTF, zinc plated; FF male hex nipple steel ratings 1/8–2"; G6X female NPTF ratings (about 1,000 psi below male
 * from 3/8"); straight connectors ≤ 3/4" NPT/NPTF hold very high pressure in static, non-make-and-break service,
 * shaped connectors and larger sizes "low reliability for leak free operation in dynamic applications"; taper-thread
 * limitations (port expansion and cracking, galling, limited remakeability); NPSM swivels seal nose to the 30° seat of
 * the male NPT, 125 Ra, SAE J516, "Not all male NPT ends have the 30° seat", steel FF fittings have the 30° chamfer;
 * 0507 ORB × NPSM ratings; design factor 4 (static 1.33 × dynamic). Weld parts not plated; "Standard steel parts are
 * not recommended for welding"; safety guide 2.18 (plated parts above 450 °F emit toxic fumes; remove elastomer
 * seals; filler compatible).
 * NOT used: SAE J514 pipe-thread derating text (not seen).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'npt-and-npsm-adapters-guide',
  title: 'NPT and NPSM hydraulic adapters: NPTF Dryseal, the 30° swivel seat, ratings — and weld-on adapters',
  excerpt:
    'NPT is the one hydraulic thread that seals on the thread, and Parker lists its limits plainly: poor dynamic sealing, ports that can crack, limited remakeability. Yet every pump, filter and gauge on an American machine has one. The steel NPT and NPSM range — nipples, elbows, tees, swivels, plugs and caps — with ratings by size (male and female differ), why an NPSM swivel needs a 30° seat, and the weld-on adapters that put a port on plate.',
  categorySlug: 'buying-hydraulic-fittings',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'NPT & NPSM Hydraulic Adapters: NPTF Ratings, 30° Seat, Weld-On',
  seoDescription:
    'A guide to steel NPT, NPTF and NPSM hydraulic adapters: Dryseal threads, pressure ratings by size for male and female ends, NPSM swivels and the 30° seat, sealing, and steel weld-on adapters.',
  focusKeyword: 'npt hydraulic adapters',
  publishedAt: '2026-10-21T20:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Hydraulic pipe-thread adapters are mostly NPTF (Dryseal, SAE J476 / ASME B1.20.3), cut so crests and roots close up — yet Parker still says a sealant is necessary even on NPTF.',
        'Ratings fall with size and female ends rate lower: Parker’s steel NPTF male nipple is 6,000 psi to ½", 5,500 at ¾" and 2,000 at 2"; a female NPTF end is about 1,000 psi lower from ⅜" up.',
        'Parker trusts NPT/NPTF ≤ ¾" straights in static service, but calls pipe threads low-reliability for leak-free dynamic service above that and in shaped fittings.',
        'An NPSM female swivel does not seal on its thread: its nose seals on the 30° seat of the male NPT — and not every male NPT end has that seat.',
        'Weld-on adapters must be unplated weldable steel; never weld plated parts, and remove O-rings first.',
      ],
    },
    {
      type: 'lead',
      html: 'Look at a pump, a filter head, a gauge port or an older valve on an American machine and you will find a pipe thread. NPT is everywhere in hydraulics even though it is the weakest seal in the system, because it is cheap, universal and needs no machined spot face. This guide covers the steel NPT and NPSM adapter range, how it is rated, and how to stop it leaking. For sealant and leak repair specifically, see <a href="/blog/stopping-an-npt-thread-leak">stopping an NPT leak</a>.',
    },

    { type: 'section_head', number: '/01', title: 'NPT, NPTF and NPSM.', anchor: 'threads' },
    {
      type: 'comparison_table',
      caption: 'The three American pipe threads on hydraulic adapters',
      columns: ['Thread', 'Standard', 'Form', 'Seals on'],
      rows: [
        { cells: ['NPT', 'ASME B1.20.1', 'Tapered, 60°', 'The thread, with sealant'] },
        { cells: ['NPTF (Dryseal)', 'SAE J476 / ASME B1.20.3', 'Tapered, controlled crest and root truncation', 'The thread — sealant still advised'], highlight: true },
        { cells: ['NPSM', '—', 'Straight (parallel) pipe thread', 'Never the thread: a 30° seat on the mating male'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Parker says most of its steel and brass connector products have NPTF threads, and explains Dryseal: controlled truncation at crest and root gives metal-to-metal crest-root contact. Even so, it states that a sealant or lubricant is necessary for a leak-free joint, even with NPTF threads. NPT and NPTF mate with each other. They do not mate with BSPT, though ½" and ¾" share 14 TPI and will start — see <a href="/blog/bsp-hydraulic-adapters-guide">BSP adapters</a>.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Ratings: size, and male against female.', anchor: 'ratings' },
    {
      type: 'comparison_table',
      caption: 'Parker steel NPTF ratings by size, psi (dynamic, design factor 4)',
      columns: ['Size', 'Male hex nipple', 'Female end (37° × NPTF female)'],
      rows: [
        { cells: ['1/8"', '6,000', '6,000'] },
        { cells: ['1/4"', '6,000', '6,000'] },
        { cells: ['3/8"', '6,000', '5,000'] },
        { cells: ['1/2"', '6,000', '5,000'], highlight: true },
        { cells: ['3/4"', '5,500', '4,000'] },
        { cells: ['1"', '4,500', '3,000'], highlight: true },
        { cells: ['1-1/4"', '3,000', '2,500'] },
        { cells: ['1-1/2"', '3,000', '2,000'] },
        { cells: ['2"', '2,000', '1,500'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Parker’s ratings are dynamic, with a design factor of 4; it gives static ratings as 1.33 × dynamic. Parker’s application guidance is the useful part — straight connectors of ¾" NPT/NPTF and smaller hold very high pressure in service that is not repeatedly made and broken, while larger sizes and shaped connectors have low reliability for leak-free operation in dynamic service. On a pulsing line or a port that is opened often, use ORB, ORFS or a flange instead (see <a href="/blog/orfs-and-orb-adapters-guide">ORFS and ORB</a>).</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A taper can split the port.',
      body: 'Parker lists possible expansion and even cracking of the port among the limits of tapered threads. Do not chase a leak by tightening an NPT fitting further into a cast or aluminium body; take it out, clean it, reseal it and make it up again — or change the port.',
    },

    { type: 'section_head', number: '/03', title: 'NPSM swivels and the 30° seat.', anchor: 'npsm' },
    {
      type: 'prose',
      html: '<p>An NPSM female swivel spins freely, which is why it is used on hose ends and swivel adapters — but it does not seal on its thread. Parker explains that the seal is between the nose of the swivel and a <strong>30° seat</strong> machined in the mouth of the male NPT fitting, with a surface finish of 125 Ra or better, to SAE J516. Its warning matters: not all male NPT ends have the 30° seat. Parker’s steel FF pipe fittings carry the 30° chamfer for this reason. A swivel screwed onto a plain male NPT nipple will leak however hard it is tightened. Parker rates its steel ORB × NPSM swivel adapters at 6,000 psi to ⅜", 5,000 at ½", 4,000 at ¾", 3,000 at 1" and 1,500 at 2".</p><p>For the hose side of this — NPSM swivel hose ends — see <a href="/blog/npt-npsm-and-sae-hose-fittings">NPT, NPSM and SAE hose fittings</a>.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Weld-on adapters.', anchor: 'weld-on' },
    {
      type: 'prose',
      html: '<p>Weld-on adapters put a hydraulic connection on a tank, a manifold block or a pipe: a plain weldable end on one side and NPT male or female, or 37° JIC male or female swivel, on the other. Parker’s rules for welded parts are clear — its brazing and welding products are not plated, its standard plated steel parts are not recommended for welding, and its safety guide warns that heating plated parts above 450 °F (232 °C) can give off deadly fumes. Remove any elastomer seal before welding, use filler compatible with both parts, and shield nearby lines from the arc.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the difference between NPT and NPTF?', answer: 'Both are tapered 60° pipe threads that mate. NPTF (Dryseal, SAE J476) controls crest and root truncation for metal-to-metal contact; Parker still recommends sealant on it.' },
        { question: 'What pressure is an NPT hydraulic adapter rated for?', answer: 'In Parker’s steel tables, a male NPTF nipple is 6,000 psi up to ½", 4,500 at 1" and 2,000 at 2"; female NPTF ends are about 1,000 psi lower from ⅜" up.' },
        { question: 'Why does my NPSM swivel leak?', answer: 'An NPSM swivel seals on a 30° seat in the male fitting, not on the thread. If the male NPT has no 30° seat, or it is damaged, the swivel cannot seal.' },
        { question: 'Do I need sealant on NPTF threads?', answer: 'Parker says yes — a sealant or lubricant is necessary for a leak-free joint even with NPTF. Never put sealant on JIC, ORFS or other face- or cone-sealed ends.' },
        { question: 'Can I weld a zinc-plated adapter?', answer: 'No. Use an unplated weld-on adapter. Heating plated parts gives off toxic fumes, and plated free-machining steel is not meant for welding.' },
        { question: 'Is NPT suitable for high-pressure hydraulics?', answer: 'In small straight fittings in static service, yes. For larger sizes, shaped fittings and dynamic or pulsing service, Parker rates pipe threads as low-reliability for leak-free operation.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Steel NPT, NPTF and NPSM adapters — including Tompkins-made parts — and steel weld-on adapters:</p>' + stockList(['npt-adapters', 'steel-weld-on-adapters']),
    },
    {
      type: 'product_embed',
      heading: 'NPT, NPSM and weld-on adapters',
      skus: ['IH-AD-NPT-019', 'IH-AD-NPT-018', 'IH-AD-NPT-006', 'IH-ST-1406', 'IH-ST-5605', 'IH-TK-5406-HHP', 'IH-ST-WO-MP', 'IH-ST-WO-FJX'],
    },
    { type: 'category_link', slug: 'npt-adapters', label: 'NPT adapters', blurb: 'Steel NPT, NPTF and NPSM swivel adapters, elbows, tees, plugs and caps.' },
    { type: 'category_link', slug: 'steel-weld-on-adapters', label: 'Steel weld-on adapters', blurb: 'Weld-on NPT and JIC adapters for tanks, blocks and pipe.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'parker-4300', text: 'Parker Hannifin Tube Fittings Division. Catalog 4300 — sections B, F, G, T and Safety Guide (2017 edition; current edition 9/2023).', url: 'https://parker.com/literature/Tube%20Fittings%20Division/4300_Catalog_Cover.pdf' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['stopping-an-npt-thread-leak', 'npt-npsm-and-sae-hose-fittings', 'sealant-on-hydraulic-threads', 'jic-adapters-guide', 'orfs-and-orb-adapters-guide', 'stacking-hydraulic-adapters'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Thread standards, ratings, NPSM seat and welding rules from Parker Catalog 4300 (2017 edition — check the current edition before quoting a figure).',
    },
    {
      type: 'cta_block',
      heading: 'Ordering NPT adapters?',
      body: 'Send the thread sizes, male or female, swivel or fixed, and the other end. If the line pulses, tell us — we may suggest an O-ring port instead.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
