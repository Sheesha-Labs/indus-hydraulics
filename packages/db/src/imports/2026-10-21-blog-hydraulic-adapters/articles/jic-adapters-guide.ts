import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Steel 37° JIC adapter range. Sources read 2026-10-21: Parker Catalog 4300 (2017 edition; current 9/2023): Triple-Lok
 * meets SAE J514 and ISO 8434-2, 37° flare / 74° included, metal-to-metal seal nose-to-flare; dash/thread table;
 * F5OX (37° × ORB) steel column -4 7,500 … -32 2,000 psi; C5OX elbow steel -8 6,000, -16 4,000; GTX (37° × NPTF)
 * -4 6,000, -16 3,000; torque Table S19 and FFWR; steel tube C-1010 HRB 72 / C-1021 HRB 75; Triple-Lok steel
 * "substantially exceeded the SAE requirement of 96 hours to red rust" (ASTM B117); adjustable vs non-adjustable
 * port ends. Listing copy (zinc-plated carbon steel, Cr3+ passivated; Tompkins-branded parts).
 * NOT used: the template "up to 350 bar" line on some listings as a rating.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'jic-adapters-guide',
  title: 'JIC 37° adapters: the shapes, sizes, ratings and how to order the right one',
  excerpt:
    'A JIC adapter is defined by three things: its shape, its two ends and its dash size. Get all three in the order and the right part arrives; miss one and you get a JIC × NPT elbow when the port was ORB. The steel 37° range — straights, elbows, tees, crosses, bulkheads, swivels, adjustable port ends, caps and plugs — with Parker’s published ratings by dash size, torque and flats, and a checklist for ordering.',
  categorySlug: 'buying-hydraulic-fittings',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'JIC 37° Adapters: Shapes, Sizes, Ratings & How to Order',
  seoDescription:
    'A guide to steel JIC 37° hydraulic adapters: unions, elbows, tees, bulkheads, swivels and adjustable ends, dash sizes and threads, pressure ratings by size and shape, assembly torque, and how to specify an adapter.',
  focusKeyword: 'jic adapters',
  publishedAt: '2026-10-21T19:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        '37° JIC (SAE J514 / ISO 8434-2) seals metal to metal: the 37° flare or male nose seats on a 37° cone, 74° included. No O-ring, so it can be remade many times.',
        'Order by shape, both ends and dash size: "-8 JIC male × -8 ORB male, adjustable 90° elbow" is a complete description; "1/2 inch JIC elbow" is not.',
        'Ratings fall with size and depend on the shape and the other end: Parker’s steel 37° × ORB straight is 7,500 psi at -4 and 2,000 psi at -32; its -16 elbow is 4,000 psi; with an NPTF end, -16 drops to 3,000.',
        'Torque rises steeply with size — Parker gives 13 ft-lb at -4, 42 at -8 and 118 at -16 — and flats from wrench resistance is the cross-check.',
        'Adjustable ORB ends go on shaped fittings so they can be aimed; straight fittings use fixed ends.',
      ],
    },
    {
      type: 'lead',
      html: 'The 37° flare is the most widely used hydraulic connection on inch-thread machines — American and much Asian equipment, and almost every hose assembly sold with a JIC end. Most of the adapters in a workshop drawer are JIC on at least one end. This guide is about choosing and ordering them: the shapes in the range, how they are rated, and how to describe one so the right part comes back. For how JIC compares with ORFS, NPT and BSP, see <a href="/blog/jic-vs-orfs-vs-npt-vs-bsp">the four connector families</a>.',
    },

    { type: 'section_head', number: '/01', title: 'The shapes.', anchor: 'shapes' },
    {
      type: 'comparison_table',
      caption: 'JIC adapter shapes and what each is for',
      columns: ['Shape', 'What it does', 'Watch for'],
      rows: [
        { cells: ['Straight connector', 'JIC male to a port thread (ORB, NPT, BSPP, BSPT, metric)', 'The port end decides the seal'], highlight: true },
        { cells: ['Union', 'JIC male both ends — joins two JIC female hoses or nuts', 'Same dash both ends unless a reducer'] },
        { cells: ['90° / 45° elbow', 'Turns the line at the port', 'Adjustable or fixed port end'] },
        { cells: ['Tee (run / branch) and cross', 'Splits a line; run tee has the port in line, branch tee at 90°', 'Which leg is the port'] },
        { cells: ['Bulkhead union / elbow', 'Passes through a panel, held by a lock nut', 'Panel thickness and hole size'] },
        { cells: ['Female swivel connector', 'JIC female nut on one end — connects to a male JIC without twisting', 'Nut seats on the mating cone'] },
        { cells: ['Reducer / expander', 'Changes dash size within JIC', 'One step at a time; avoid stacking'] },
        { cells: ['Cap and plug', 'Close a male or female JIC end', 'Cap fits a male, plug a female'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Two terms cause most ordering errors. A <strong>run tee</strong> has the port end in line with one run of the tee; a <strong>branch tee</strong> has it on the side branch. And on shaped fittings with an O-ring boss port, the port end is either <strong>adjustable</strong> — with a locknut and back-up washer, so the elbow can be turned to face the line before it is locked — or <strong>fixed</strong>. Parker puts adjustable ends on shaped fittings for orientation and fixed ends on straights.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Sizes and threads.', anchor: 'sizes' },
    {
      type: 'comparison_table',
      caption: '37° JIC dash size, tube OD and male thread',
      columns: ['Dash', 'Tube / hose', 'Thread', 'Dash', 'Tube / hose', 'Thread'],
      rows: [
        { cells: ['-2', '1/8"', '5/16-24', '-12', '3/4"', '1 1/16-12'] },
        { cells: ['-3', '3/16"', '3/8-24', '-14', '7/8"', '1 3/16-12'] },
        { cells: ['-4', '1/4"', '7/16-20', '-16', '1"', '1 5/16-12'], highlight: true },
        { cells: ['-5', '5/16"', '1/2-20', '-20', '1 1/4"', '1 5/8-12'] },
        { cells: ['-6', '3/8"', '9/16-18', '-24', '1 1/2"', '1 7/8-12'] },
        { cells: ['-8', '1/2"', '3/4-16', '-32', '2"', '2 1/2-12'] },
        { cells: ['-10', '5/8"', '7/8-14', '-40', '2 1/2"', '3-12'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>The dash number is the tube OD in sixteenths of an inch. The JIC thread is a UN/UNF straight thread that only holds the nut; it does not seal. Note that an ORB port of the same dash shares the same thread size — a -8 ORB port is also 3/4-16 — which is why a JIC × ORB adapter is often the same thread on both ends with different seals. Need the full reference? See <a href="/blog/hydraulic-thread-size-and-pitch-reference">thread size and pitch by family</a>.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Ratings: size, shape and the other end.', anchor: 'ratings' },
    {
      type: 'comparison_table',
      caption: 'Parker steel 37° flare ratings, psi (Catalog 4300, 2017)',
      columns: ['Dash', '37° × ORB straight', '37° elbow', '37° × NPTF straight'],
      rows: [
        { cells: ['-4', '7,500', '—', '6,000'], highlight: true },
        { cells: ['-6', '6,000', '—', '—'] },
        { cells: ['-8', '6,000', '6,000', '—'] },
        { cells: ['-10', '5,000', '—', '—'] },
        { cells: ['-12', '5,000', '—', '—'] },
        { cells: ['-16', '4,500', '4,000', '3,000'], highlight: true },
        { cells: ['-20', '4,000', '—', '—'] },
        { cells: ['-24', '3,000', '—', '—'] },
        { cells: ['-32', '2,000', '—', '—'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Three rules come out of that table. The rating falls as the size rises. Shaped fittings rate at or below straights. And the weaker end wins — a pipe-thread end caps the adapter below what the 37° end could take (see <a href="/blog/npt-and-npsm-adapters-guide">NPT and NPSM adapters</a>). These are one maker’s figures; our listings quote the rating published for each family, and a hose or tube assembly is rated to its weakest part. In salt-laden air, Parker reports its zinc-plated steel 37° fittings well past the SAE requirement of 96 hours to red rust in ASTM B117 — useful, but not a substitute for <a href="/blog/stainless-jic-fittings">stainless JIC</a> on deck or splash zones.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Making them up.', anchor: 'assembly' },
    {
      type: 'comparison_table',
      caption: 'Parker 37° flare assembly torque (+10 % −0) and flats from wrench resistance',
      columns: ['Dash', 'Torque', 'FFWR, tube', 'FFWR, swivel/hose'],
      rows: [
        { cells: ['-4', '13 ft-lb', '2½', '2'] },
        { cells: ['-6', '22 ft-lb', '2', '1½'] },
        { cells: ['-8', '42 ft-lb', '2', '1½'], highlight: true },
        { cells: ['-10', '60 ft-lb', '1½', '1½'] },
        { cells: ['-12', '84 ft-lb', '1½', '1¼'] },
        { cells: ['-16', '118 ft-lb', '1½', '1'] },
        { cells: ['-20', '168 ft-lb', '1', '1'] },
        { cells: ['-32', '265 ft-lb', '1', '1'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Torque values are for unlubricated steel. Flats from wrench resistance — snug the nut, then turn it a counted number of hex flats — is the check when a torque wrench will not fit. Over-tightening a 37° joint cracks flares and coins the cone; see <a href="/blog/hydraulic-fitting-make-up-torque">make-up torque and turns</a> and <a href="/blog/over-tightened-fitting-diagnosis">reading an over-tightened joint</a>. For tube to be flared, Parker specifies fully annealed C-1010 steel tube to HRB 72 (or C-1021 to HRB 75).</p>',
    },

    { type: 'section_head', number: '/05', title: 'How to order.', anchor: 'order' },
    {
      type: 'comparison_table',
      caption: 'Describing a JIC adapter',
      columns: ['Item', 'Example'],
      rows: [
        { cells: ['Shape', '90° elbow, adjustable'] },
        { cells: ['End 1 — type, gender, dash', 'JIC 37° male, -8'] },
        { cells: ['End 2 — type, gender, size', 'ORB male, -8 (3/4-16)'], highlight: true },
        { cells: ['End 3 (tees)', 'and which leg is the port: run or branch'] },
        { cells: ['Material', 'Zinc-plated steel, or 316 stainless'] },
        { cells: ['Quantity', 'And whether caps or plugs are needed for shipping'] },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is a JIC adapter?', answer: 'An adapter with at least one 37° flare (JIC, SAE J514) end, joining a JIC hose or tube to a port or another fitting. It seals metal to metal on the 37° cone.' },
        { question: 'What does -8 mean on a JIC fitting?', answer: 'Dash 8 — 8/16 = 1/2" tube or hose — with a 3/4-16 UNF thread.' },
        { question: 'What is the difference between a run tee and a branch tee?', answer: 'Where the odd end is. On a run tee the port or swivel end is in line with the run; on a branch tee it is on the side branch.' },
        { question: 'What pressure is a JIC adapter rated for?', answer: 'It depends on size, shape and the other end. Parker’s steel 37° × ORB straights run from 7,500 psi at -4 to 2,000 psi at -32; elbows and pipe-thread ends rate lower.' },
        { question: 'Can I mix JIC with 45° SAE flare fittings?', answer: 'No. 45° flare fittings (SAE J512, refrigeration and fuel) share some thread sizes with JIC but the seat angles differ and the joint will leak.' },
        { question: 'Should I order adjustable or fixed elbows?', answer: 'Adjustable where the elbow must be aimed at a line — it has a locknut and washer on the ORB end. Fixed for straights or where orientation does not matter.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Every steel JIC 37° adapter in the range, including the Tompkins-made parts:</p>' + stockList(['jic-adapters']),
    },
    {
      type: 'product_embed',
      heading: 'JIC adapters',
      skus: ['IH-AD-JIC-026', 'IH-AD-JIC-032', 'IH-AD-JIC-013', 'IH-AD-JIC-023', 'IH-AD-JIC-005', 'IH-ST-6505', 'IH-TK-6801-L', 'IH-ST-319'],
    },
    { type: 'category_link', slug: 'jic-adapters', label: 'JIC adapters', blurb: 'Steel 37° flare straights, elbows, tees, bulkheads, swivels, caps and plugs.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'parker-4300', text: 'Parker Hannifin Tube Fittings Division. Catalog 4300 (2017 edition; current edition 9/2023).', url: 'https://parker.com/literature/Tube%20Fittings%20Division/4300_Catalog_Cover.pdf' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['jic-vs-orfs-vs-npt-vs-bsp', 'where-jic-is-the-wrong-choice', 'stainless-jic-fittings', 'orfs-and-orb-adapters-guide', 'hydraulic-fitting-make-up-torque', 'stacking-hydraulic-adapters'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Threads, ratings, torque and tube limits from Parker Catalog 4300 (2017 edition — check the current edition before quoting a figure).',
    },
    {
      type: 'cta_block',
      heading: 'Ordering JIC adapters?',
      body: 'Send the shape, both ends and the dash sizes — or a photo with a ruler. We will match the part and quote it in steel or stainless.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
