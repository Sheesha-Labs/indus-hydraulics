import type { BlogArticleSeed } from '../shared'
import { EQUIPMENT_TABLE_1, EQUIPMENT_TABLE_2 } from '../reference'

/**
 * Equipment number. The table is a stockist's published equipment table (61 rows, 50 to 10,000), with
 * its LR/ABS/DNV letter columns dropped for width and its "use the lower row" note kept. No source in
 * the research gives the equipment-number formula, so the article describes what it measures in words
 * (displacement, projected area of hull and deckhouses, side area) and points to the class rules for
 * the formula — no formula is printed. The HHP column is 75% of the ordinary anchor mass throughout.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'equipment-number-anchor-chain-sizing',
  title: 'Equipment number: how a ship’s anchors and anchor chain are sized',
  excerpt:
    'Classification rules size a ship’s anchors and chain from a single figure, the equipment number. What it represents, how to read the equipment table to find anchor mass, total chain length and chain diameter in each grade, and why a high-holding-power anchor and a higher chain grade change the answer.',
  categorySlug: 'anchor-chain-mooring',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Equipment Number: Sizing Anchors & Chain',
  seoDescription:
    'How the equipment number sizes a ship’s anchors and chain: the full equipment table with anchor mass, HHP mass, chain length and diameter by grade.',
  focusKeyword: 'equipment number',
  publishedAt: '2026-11-08T10:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The equipment number is one figure, worked out under the class rules from a ship’s size and the area it shows to wind and current.',
        'The equipment table turns it into the mass of each bower anchor, the total length of chain cable and the chain diameter in grade 1, 2 or 3.',
        'Between two rows, the rules say use the lower row’s equipment.',
        'A high-holding-power anchor may be 25% lighter than an ordinary one; a higher chain grade gives a smaller diameter for the same ship.',
        'Example: an equipment number of 1,000 calls for 3,060 kg anchors, 495 m of chain, and 56, 50 or 44 mm chain in grade 1, 2 or 3.',
      ],
    },
    {
      type: 'lead',
      html: 'Nobody chooses a ship’s anchor chain by feel. The classification society works out the ship’s equipment number, and a table gives the rest: how heavy the anchors must be, how much chain to carry and how thick it must be. If you are replacing a cable, the existing certificate already tells you the answer. If you are specifying new equipment — or checking that a cable offered to you is right for the ship — the equipment table is where to start.',
    },
    {
      type: 'direct_answer',
      question: 'What is the equipment number of a ship?',
      answer:
        'A figure calculated under the classification rules from the ship’s displacement and the areas of hull, superstructure and deckhouses exposed to wind and current. The rules’ equipment table then gives, for each range of equipment number, the mass of the bower anchors, the total length of anchor chain and the chain diameter for each grade.',
    },

    { type: 'section_head', number: '/01', title: 'What the number measures.', anchor: 'what' },
    {
      type: 'paragraph',
      html: 'The anchors and cable have to hold the ship against wind and current. The pull grows with the ship’s size and with the area of hull, superstructure and deckhouses those forces act on, so the equipment number combines a displacement term with area terms. The exact formula, and the symbols in it, are in each society’s rules; your class society or naval architect will have calculated it for the ship, and it appears on the ship’s equipment documentation as a number and a letter.',
    },

    { type: 'section_head', number: '/02', title: 'The equipment table.', anchor: 'table' },
    {
      type: 'paragraph',
      html: 'The table below is as published in a chain stockist’s reference sheets. For each range: the mass of each ordinary bower anchor, the mass if a high-holding-power (HHP) anchor is used, the total chain cable length, and the minimum chain diameter in grade 1, 2 and 3 (U1, U2, U3). A dash means that grade is not used at that size. The classification societies also give each row a letter — the same table in one society’s rules runs from A to Z and on with A+ and A*, in another’s from U1 to U61.',
    },
    {
      type: 'comparison_table',
      caption: 'Equipment table, part 1 — equipment number 50 to 1,789',
      columns: ['Equipment number', 'Anchor kg', 'HHP anchor kg', 'Total chain m', 'Grade 1 mm', 'Grade 2 mm', 'Grade 3 mm'],
      rows: EQUIPMENT_TABLE_1,
    },
    {
      type: 'comparison_table',
      caption: 'Equipment table, part 2 — equipment number 1,790 to 10,000',
      columns: ['Equipment number', 'Anchor kg', 'HHP anchor kg', 'Total chain m', 'Grade 1 mm', 'Grade 2 mm', 'Grade 3 mm'],
      rows: EQUIPMENT_TABLE_2,
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Reading between rows.',
      body: 'For an equipment number between two rows, use the anchor mass, chain length and diameter of the lower row — the table already gives the range each row covers.',
    },

    { type: 'section_head', number: '/03', title: 'Using it.', anchor: 'using' },
    {
      type: 'prose',
      html: '<p>Take a ship with an equipment number of 1,000. It falls in the 980–1,059 row:</p><ul><li><strong>Anchors:</strong> 3,060 kg each, or 2,295 kg if HHP anchors are fitted — see <a href="/c/marine-anchors">marine anchors</a>.</li><li><strong>Chain length:</strong> 495 m in total — eighteen 27.5 m shots, split between the port and starboard cables.</li><li><strong>Chain size:</strong> 56 mm in grade 1, 50 mm in grade 2 or 44 mm in grade 3. Grade 2 is the usual choice; grade 3 saves weight and locker space.</li></ul><p>Then check the result against the <a href="/blog/anchor-chain-size-chart">anchor chain size chart</a> for its test loads and the <a href="/blog/anchor-chain-weight-chart">weight chart</a> for what the windlass will lift. Every length in the table is a whole number of 27.5 m shots, and every anchor is proof tested to a load set by its mass — see <a href="/blog/anchor-proof-load-testing">anchor proof load testing</a>.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is an equipment number used for?', answer: 'To size a ship’s anchoring equipment under the class rules: anchor mass, total chain length and chain diameter.' },
        { question: 'What chain size does an equipment number of 2,000 need?', answer: 'The 1,930–2,079 row gives 78 mm in grade 1, 68 mm in grade 2 or 60 mm in grade 3, with 577.5 m of chain and 6,000 kg anchors.' },
        { question: 'How much lighter can a high-holding-power anchor be?', answer: 'In this table the HHP anchor mass is 75% of the ordinary anchor mass at every row.' },
        { question: 'Does a higher chain grade change the length?', answer: 'No. The grade changes the diameter; the total length depends only on the equipment number.' },
        { question: 'Where do I find my ship’s equipment number?', answer: 'In the ship’s class documentation, usually with its equipment letter. The anchor and chain certificates should match it.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Anchors and chain to the equipment table',
      skus: ['IH-LR-AC-SLACGU1U2', 'IH-LR-AN-HALL', 'IH-LR-AN-SPEK', 'IH-MR-AN-AC14', 'IH-LR-AC-KSGU2U3', 'IH-LR-AC-SFACGU2U3'],
    },
    { type: 'category_link', slug: 'marine-anchors', label: 'Marine anchors', blurb: 'Stockless, HHP, stock and fluke anchors for ships and workboats.' },
    {
      type: 'related_articles',
      slugs: ['anchor-chain-size-chart', 'anchor-proof-load-testing', 'anchor-chain-cable-arrangement', 'chain-locker-volume', 'types-of-marine-anchors'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-08',
      note: 'Equipment table as published in a chain stockist’s reference sheets, following the class rules. The equipment number itself, and the table that applies, are set by the ship’s classification society.',
    },
    {
      type: 'cta_block',
      heading: 'Know the equipment number?',
      body: 'Send it with the chain grade you want. We will quote the anchors, chain cable, shackles and forerunners as one package, with class certificates.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
