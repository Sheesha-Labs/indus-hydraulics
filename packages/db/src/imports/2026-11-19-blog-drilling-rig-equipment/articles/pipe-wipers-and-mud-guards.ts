import type { BlogArticleSeed } from '../shared'

/**
 * Sources for the figures in this article (Oteco export folder, 2026-11-19):
 * - _faq/facts/oteco-rig-floor.json: the pipe wiper listings (double solid, double split, double split
 *   rap-a-round, single, oval and handle-bar), the square and hexagonal kelly wipers (8-3/8 in and 10 in,
 *   1/2 in interference), and MG-500, MG-600 and MG-800 with the mud and oil guard table (width, length,
 *   weight, outlet) and the seals and spares listing.
 * - _raw/brochure-review.md: Rig Hardware brochure pipe wiper size and weight tables, kelly wipers and
 *   mud and oil guards (pp. 6, 7, 10, 11).
 * Where the brochure and our listing differ on upper pipe sizes, the article does not quote the upper size.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'pipe-wipers-and-mud-guards',
  title: 'Pipe wipers, kelly wipers and mud guards: keeping mud in the system',
  excerpt:
    'How pipe wipers, kelly wipers and mud guards save drilling fluid and keep the rig floor safer. Solid, split and rap-a-round wipers, natural rubber against nitrile, the MG-500, MG-600 and MG-800 guards, and how to order by pipe size.',
  categorySlug: 'drilling-rig-equipment',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Pipe Wipers, Kelly Wipers, Mud Guards',
  seoDescription:
    'Pipe wipers, kelly wipers and mud guards: solid, split and rap-a-round types, natural rubber or nitrile, MG-500, MG-600 and MG-800 guards, and sizing.',
  focusKeyword: 'pipe wiper',
  publishedAt: '2026-11-19T19:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A pipe wiper strips drilling fluid off the pipe as it is pulled. A mud guard catches the fluid that comes out of a wet string at the rotary table. Both save mud and keep the floor cleaner and safer underfoot.',
        'Choose black natural rubber for water-based mud and red nitrile (NBR) for oil-based mud. Neoprene is listed for some sizes.',
        'Solid wipers must go on over the pipe end; split and rap-a-round wipers fit round the pipe without pulling the string.',
        'Oteco kelly wipers come in 8-3/8 in and 10 in outside diameters for square and hexagonal kellys. Each interferes 1/2 in with the kelly.',
        'The MG-500 oil guard, MG-600 mud guard and MG-800 mud guard differ in width, length, weight and outlet size. End seals are moulded to the pipe outside diameter, in neoprene as standard or nitrile.',
      ],
    },
    {
      type: 'lead',
      html: 'Mud that leaves the system ends up on the rig floor, in the cellar, or down the hole as debris carried back in. Wipers and guards are low-cost rubber and steel parts that stop most of it. They are also consumables, so they are ordered often and by size. This guide covers how the types differ, how to choose a compound, and how to order from Oteco’s <a href="/p/oteco-single-pipe-wipers">pipe wiper</a> and <a href="/p/oteco-mg-600-mud-guard">mud guard</a> ranges. Oteco pipe wipers are moulded in Houston from Oteco’s own compounds, with an insert moulded into the rubber for tear resistance.',
    },

    { type: 'section_head', number: '/01', title: 'The pipe wiper types.', anchor: 'types' },
    {
      type: 'paragraph',
      html: 'A <strong>solid</strong> wiper is a closed ring: it is slipped over the pipe end and cannot be fitted without breaking the string. A <strong>split</strong> wiper is cut so it can be placed round the pipe in place. A <strong>rap-a-round</strong> wiper wraps round the pipe and closes. Oteco lists double-thickness <a href="/p/oteco-double-solid-pipe-wipers">solid</a>, <a href="/p/oteco-double-split-pipe-wipers">split</a> and <a href="/p/oteco-double-split-rap-a-round-pipe-wipers">split rap-a-round</a> wipers, <a href="/p/oteco-single-pipe-wipers">single wipers</a> (most hard core, some sizes soft core, including blind wipers with no bore) and <a href="/p/oteco-oval-handle-bar-pipe-wipers">oval and handle-bar wipers</a>.',
    },
    {
      type: 'comparison_table',
      caption: 'Oteco pipe wiper range (Rig Hardware brochure)',
      columns: ['Wiper', 'Diameters', 'Pipe sizes', 'Weight'],
      rows: [
        { cells: ['Double: solid, split, rap-a-round', '14 in, 17 in, 19 in (22 in rap-a-round only)', '2-3/8 in to 6-5/8 in (17 in to 7 in)', '14 in 15 lb, 17 in 22 lb, 19 in 23 lb, 22 in 30 lb'] },
        { cells: ['Single, hard core', '9, 12, 14, 17, 19 and 24 in', 'Blind (9 in and 17 in) and 2-3/8 in to 6-5/8 in', '9 in 3 lb up to 24 in 22 lb'] },
        { cells: ['Handle bar, steel reinforced', '10 in', '2-3/8 in to 4-1/2 in', '9 lb'] },
        { cells: ['Oval', '17 in × 14 in', '2-3/8 in to 6-5/8 in', 'Not stated'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Beyond the core range in that table, our listings carry larger pipe sizes on the 22 in rap-a-round wiper and 17 in × 14 in oval wipers by part number. We confirm every wiper against the pipe OD you run before it ships.',
    },

    { type: 'section_head', number: '/02', title: 'Natural rubber, nitrile or neoprene.', anchor: 'compound' },
    {
      type: 'paragraph',
      html: 'Choose black natural rubber (NR) for water-based mud and red nitrile (NBR) for oil-based mud. Neoprene (CR) is listed for some sizes. Oil attacks natural rubber, so a wiper in the wrong compound will not last in oil-based mud. If you drill with both mud types on one rig, stock both colours: red for oil-based is a helpful cue on the floor.',
    },

    { type: 'section_head', number: '/03', title: 'Kelly wipers.', anchor: 'kelly' },
    {
      type: 'paragraph',
      html: 'Kelly wipers are moulded from the same rubber and reinforced with a bonded metal ring. They wipe mud off the kelly as it is pulled, which keeps fluid off the floor and extends the life of the kelly drive bushing. Oteco lists <a href="/p/oteco-square-kelly-wipers">square</a> kelly wipers for kellys from 2-1/2 in to 6 in and <a href="/p/oteco-hexagonal-kelly-wipers">hexagonal</a> kelly wipers from 3 in to 6 in, each in 8-3/8 in and 10 in outside diameters. Each wiper interferes 1/2 in with the kelly. Black natural rubber suits water-based mud, red nitrile oil-based mud. Order by drive shape (square or hexagonal), size and outside diameter.',
    },

    { type: 'section_head', number: '/04', title: 'Mud guards and the oil guard.', anchor: 'guards' },
    {
      type: 'paragraph',
      html: 'A mud guard is a hinged steel bucket that clamps round the pipe at the rotary table when a wet string is pulled. It catches the fluid inside the pipe and in the joint as it breaks out, and returns it through a discharge hose to the mud system. Oteco makes three: the <a href="/p/oteco-mg-500-oil-guard">MG-500 oil guard</a>, the <a href="/p/oteco-mg-600-mud-guard">MG-600</a> and the <a href="/p/oteco-mg-800-mud-guard">MG-800</a>.',
    },
    {
      type: 'comparison_table',
      caption: 'Oteco mud and oil guards',
      columns: ['Model', 'Width', 'Length', 'Weight', 'Outlet', 'Used on'],
      rows: [
        { cells: ['MG-500 oil guard', '6-1/4 in', '48 in', '85 lb (39 kg)', '3 in', '1 in to 3-1/2 in tubing'] },
        { cells: ['MG-600 mud guard', '10-3/4 in', '72-1/4 in', '330 lb (150 kg)', '4 in or 5 in', '2-3/8 in to 5-1/2 in drill pipe'] },
        { cells: ['MG-800 mud guard', '16 in', '72-1/4 in', '529 lb (240 kg)', '6 in', 'Drill pipe from 2-3/8 in; larger volumes'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Each assembly is listed by the pipe outside diameter its end seals fit, with neoprene (standard) or nitrile end and side seals. The seals wear, so the <a href="/p/oteco-mud-guard-seals-spare-parts">spares listing</a> carries end seals as sets or right-hand and left-hand halves, side seals, metal seal brackets, nut-and-bolt kits, discharge hoses in standard and long lengths, and outlet elbows with or without chain. Choose nitrile seals for oil-based mud. For the MG-800, including the shorty versions with a larger bottom seal, we confirm the end seals against the pipe OD you run.',
    },
    {
      type: 'paragraph',
      html: 'Wipers and guards work with the rest of the floor equipment: see the <a href="/blog/oteco-drilling-equipment-guide">Oteco drilling equipment guide</a>, <a href="/blog/mud-pump-pistons-explained">mud pump pistons</a> for the pump end, and <a href="/blog/cementing-and-drilling-fluid-equipment">drilling fluid equipment</a> for where the recovered mud goes.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Which wiper can I fit without pulling the string?', answer: 'Split and rap-a-round wipers fit round the pipe in place. A solid wiper must be slipped over the pipe end.' },
        { question: 'How do I choose between NR and NBR?', answer: 'Black natural rubber suits water-based mud; red nitrile suits oil-based mud. Neoprene is listed for some sizes.' },
        { question: 'What is a blind wiper?', answer: 'A single wiper listed as blind, meaning with no bore, in 9 in and 17 in diameters. The other single wipers are listed by pipe size.' },
        { question: 'What do I send to order a mud guard seal set?', answer: 'The guard model (MG-500, MG-600 or MG-800), the pipe outside diameter and the mud type, so we choose neoprene or nitrile.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Wipers, kelly wipers and mud guards',
      skus: ['IH-OTC-PW-DSP', 'IH-OTC-PW-DSRA', 'IH-OTC-PW-S', 'IH-OTC-KW-SQ', 'IH-OTC-KW-HEX', 'IH-OTC-MG-600', 'IH-OTC-MG-800', 'IH-OTC-MG-SPARES'],
    },
    { type: 'category_link', slug: 'rig-floor-consumables', label: 'Rig floor consumables', blurb: 'Pipe wipers, kelly wipers, mud guards, seals and straps.' },
    {
      type: 'related_articles',
      slugs: ['oteco-drilling-equipment-guide', 'mud-pump-pistons-explained', 'swivel-washpipe-and-packing', 'cementing-and-drilling-fluid-equipment'],
    },
    {
      type: 'cta_block',
      heading: 'Wipers or mud guard parts to order?',
      body: 'Send the pipe or kelly size, the wiper type and the mud type. We confirm the compound and quote from Oteco stock at our warehouse in Dubai, UAE, and ship worldwide.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
