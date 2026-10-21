import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Inch-thread hose fittings: JIC 37°, ORFS, NPT/NPSM, SAE 45° and inverted flare, SAE O-ring. Sources read 2026-10-21:
 * Parker Catalog 4400 US (ISO 12151-1 ORFS e.g. 1JC43 "ISO 12151-1 - SWSA", also ISO 8434-3 and SAE J516; ISO 12151-5
 * JIC 37° with ISO 8434-2 and SAE J516, "fully compatible with Parker Triple-Lok Tube Fittings"; SAE J516 for JIC,
 * ORFS, SAE 45° flare and NPTF; assembly rated at its weakest component; displacement angle for two elbows measured
 * clockwise). Parker Catalog 4300 (JIC dash/thread; ORFS nut threads; NPSM swivel seals on the 30° seat of the male NPT,
 * not all male NPT ends have it; NPTF ratings fall with size). Parker Catalog 3501E (SAE 45° flare and inverted flare
 * nut threads; 45° and 37° noses drawn separately). Listing copy (JIC female straight, 45°, 90°, compact, long-drop,
 * slip-on nut, double hex, thrust-wire nut; JIC male; ORFS female and male; inverted flare, NPSM male swivel, NPT male,
 * SAE 45° female and male, SAE O-ring male and boss swivel).
 * NOT used: per-end hose-fitting pressure figures (fitting-series specific).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'jic-orfs-and-npt-hose-fittings',
  title: 'JIC, ORFS and NPT hose fittings: inch-thread hose ends, drop lengths and how they seal',
  excerpt:
    'Most hose assemblies on American and many Asian machines end in one of three inch-thread connections: a JIC 37° swivel, an ORFS swivel with an O-ring in the face, or a pipe thread. Each has its standard (ISO 12151-5, -1 and SAE J516), its seal and its trap — a 45° SAE flare that threads onto a JIC and leaks, an NPSM swivel on a nipple with no 30° seat. The inch hose-end range, including compact and long-drop elbows, and how to order an assembly with two elbows.',
  categorySlug: 'hose-assembly',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'JIC, ORFS & NPT Hose Fittings: Inch Hose Ends Explained',
  seoDescription:
    'A guide to inch-thread hydraulic hose fittings: JIC 37° (ISO 12151-5), ORFS (ISO 12151-1), NPT and NPSM, SAE 45° and inverted flare and SAE O-ring ends, compact and long-drop elbows, double hex, and elbow orientation.',
  focusKeyword: 'jic hose fittings',
  publishedAt: '2026-10-21T22:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'JIC 37° hose ends are ISO 12151-5 / SAE J516 and mate with JIC tube fittings; Parker calls its JIC hose ends fully compatible with its Triple-Lok tube fittings.',
        'ORFS hose ends are ISO 12151-1 and seal on an O-ring in the male face — the choice where vibration or pressure makes a metal seat weep.',
        'NPSM swivel ends seal on the 30° seat of the male NPT, and not every male NPT has one; NPT male hose ends seal on the thread with sealant.',
        'SAE 45° flare and inverted flare hose ends are for low-pressure fuel, refrigerant and brake lines — a 45° flare that threads onto a JIC will leak.',
        'Two elbows on one assembly need the angle between them stated, measured clockwise.',
      ],
    },
    {
      type: 'lead',
      html: 'Inch-thread hose ends are the default on North American equipment and common on Asian machines built for export. The family is small — JIC, ORFS, pipe thread and a few SAE flare forms — but each end has variants for clearance and orientation that decide whether an assembly can be fitted at all. This guide covers the range; for the matching adapters see <a href="/blog/jic-adapters-guide">JIC adapters</a>, <a href="/blog/orfs-and-orb-adapters-guide">ORFS and ORB adapters</a> and <a href="/blog/npt-and-npsm-adapters-guide">NPT and NPSM adapters</a>.',
    },

    { type: 'section_head', number: '/01', title: 'The end forms.', anchor: 'forms' },
    {
      type: 'comparison_table',
      caption: 'Inch-thread hose ends',
      columns: ['End', 'Standard', 'Seals on', 'Use'],
      rows: [
        { cells: ['JIC 37° female swivel / male', 'ISO 12151-5, SAE J516', 'Metal 37° cone', 'General hydraulics; most common inch hose end'], highlight: true },
        { cells: ['ORFS female swivel / male', 'ISO 12151-1, SAE J516', 'O-ring in the male face', 'Vibration, high pressure, leak-critical lines'] },
        { cells: ['NPSM male swivel', 'SAE J516', '30° seat of the mating fitting', 'Pipe-thread ports with a seat'] },
        { cells: ['NPT / NPTF male', 'SAE J516', 'The thread, with sealant', 'Pipe-thread ports, lower pressures in large sizes'] },
        { cells: ['SAE O-ring male, boss swivel', 'SAE J1926 port', 'O-ring at the port', 'Direct to an ORB port'] },
        { cells: ['SAE 45° flare, inverted flare', 'SAE J512 family', '45° cone; double flare inside the body', 'Fuel, refrigerant, brake and low-pressure lines'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>JIC and ORFS nut threads differ for the same dash size — a -8 JIC is 3/4-16, a -8 ORFS 13/16-16 — so the two cannot be mixed up on the machine. The 45° SAE flare is the dangerous one: a ¼" 45° flare nut is 7/16-20, the same as a -4 JIC, and Parker draws the 37° and 45° noses as different profiles. It threads on and does not seal. See <a href="/blog/brass-flare-and-compression-fittings">45° flare fittings</a>.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Shapes for clearance and orientation.', anchor: 'shapes' },
    {
      type: 'prose',
      html: '<ul><li><strong>Straight, 45° and 90°</strong> female swivels — the basic set.</li><li><strong>Compact 90°</strong> — a tighter bend for crowded valve banks.</li><li><strong>Long-drop 90°</strong> — a longer leg that moves the nut clear of an obstruction or keeps the hose from bending at the ferrule.</li><li><strong>Double hex</strong> — a second hex behind the nut so the fitting can be held while the nut is turned, without twisting the hose.</li><li><strong>Slip-on nut and thrust-wire nut</strong> versions — different ways the swivel nut is retained.</li></ul><p>Parker warns against sharp bending at the hose-to-fitting juncture and against installations that twist the hose; an elbow that puts the hose on its natural line is better than a straight end and a forced bend. When an assembly has two elbows, give the <strong>displacement angle</strong> between them — Parker measures it clockwise.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'The assembly is rated to its weakest end.',
      body: 'Parker: the maximum working pressure of a hose assembly is the lower of the published maximums of the hose and the fittings. A pipe-thread or 45° flare end can rate far below the hose; check every end before quoting the assembly’s pressure.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is a JIC hose fitting?', answer: 'A hose end with a 37° flare connection (ISO 12151-5, SAE J516) — usually a female swivel that seals on the 37° cone of a male JIC fitting.' },
        { question: 'JIC or ORFS hose ends?', answer: 'ORFS where vibration, pressure spikes or leak tolerance matter — it seals on an O-ring. JIC is simpler, metal to metal and remakeable many times.' },
        { question: 'Why does my NPSM swivel hose leak?', answer: 'The NPSM swivel seals on a 30° seat in the male fitting; a male NPT without that seat will not seal however tight it is.' },
        { question: 'What is a long-drop elbow?', answer: 'A 90° hose end with a longer leg, used to clear an obstruction or avoid bending the hose right at the ferrule.' },
        { question: 'How do I specify two elbows on a hose assembly?', answer: 'Give the displacement angle between them, measured clockwise, along with length and both end types.' },
        { question: 'Can a 45° flare hose end go on a JIC fitting?', answer: 'No. Some sizes share a thread but the 45° and 37° seats do not seal against each other.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>JIC 37°, ORFS, NPT, NPSM, SAE flare and SAE O-ring hose fittings:</p>' + stockList(['jic-37-hose-fittings', 'orfs-hose-fittings', 'npt-npsm-sae-hose-fittings']),
    },
    {
      type: 'product_embed',
      heading: 'Inch-thread hose fittings',
      skus: ['IH-JIC-FEM-37', 'IH-JIC-FEM-37-90', 'IH-JIC-FEM-37-90-LD', 'IH-JIC-FEM-37-DH', 'IH-ORFS-FEM', 'IH-ORFS-FEM-90', 'IH-PT-NPSM-SWV', 'IH-PT-SAE-MBS-OR'],
    },
    { type: 'category_link', slug: 'jic-37-hose-fittings', label: 'JIC 37° hose fittings', blurb: 'Straight, 45°, 90°, compact, long-drop and double-hex JIC ends.' },
    { type: 'category_link', slug: 'orfs-hose-fittings', label: 'ORFS hose fittings', blurb: 'ORFS female swivel and male hose ends.' },
    { type: 'category_link', slug: 'npt-npsm-sae-hose-fittings', label: 'NPT, NPSM and SAE hose fittings', blurb: 'Pipe-thread, SAE flare and O-ring hose ends.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'parker-4400', text: 'Parker Hannifin. Catalog 4400 — Hose Products (US).', url: 'https://www.parker.com/content/dam/Parker-com/Literature/Hose-Products-Division/Catalog-4400-PDF-Files/HPD_4400_Catalog.pdf' },
        { id: 'parker-4300', text: 'Parker Hannifin Tube Fittings Division. Catalog 4300 (2017 edition).', url: 'https://parker.com/literature/Tube%20Fittings%20Division/4300_Catalog_Cover.pdf' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['npt-npsm-and-sae-hose-fittings', 'jic-vs-orfs-vs-npt-vs-bsp', 'jic-adapters-guide', 'bsp-metric-din-and-jis-hose-fittings', 'braided-hose-crimp-fittings-guide'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'End standards, compatibility, rating and orientation rules from Parker Catalogs 4400 and 4300; flare threads from Parker Catalog 3501E; forms from our listings.',
    },
    {
      type: 'cta_block',
      heading: 'Ordering inch hose ends?',
      body: 'Send the hose, both end types and sizes, any elbow angles and the displacement angle between them. We will quote the ends or the finished assembly.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
