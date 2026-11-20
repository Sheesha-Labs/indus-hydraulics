import type { BlogArticleSeed } from '../shared'

/**
 * Sources for the figures in this article (Oteco export folder, 2026-11-19):
 * - _faq/facts/oteco-fluid-end.json: the four piston listings (IH-OTC-PST-DA, -SA, -RUBBERS, -PARTS),
 *   their size-table rows, the Oteco piston series table (A/K/B/L, snap ring, retainer plate bore, liner
 *   sizes listed), the premium and bonded urethane descriptions, and the note that liner sizes and hub
 *   codes are decoded from Oteco part codes (I44 = 4-1/2 in, inches plus eighths).
 * - _raw/brochure-review.md: Oteco fluid-end sheet (1997) and Products Brochure, for the bonded urethane
 *   piston text and the statement that Oteco pistons interchange with other API-design pistons.
 * No pressure, life or interval figures are used for pistons: the sources give none.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'mud-pump-pistons-explained',
  title: 'Mud pump pistons: double or single acting, series, liner size and urethane or rubber',
  excerpt:
    'A mud pump piston is chosen by liner size, hub series and rod fit, then by compound. How double-acting and single-acting pistons differ, what the series letters A, B, K and L mean, how to read an Oteco piston part number, and what to send for a quote.',
  categorySlug: 'drilling-rig-equipment',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Mud Pump Pistons: Series, Liner, Rubber',
  seoDescription:
    'Mud pump piston guide: double or single acting, series A, B, K and L, liner size, taper or straight bore, and premium rubber against bonded urethane.',
  focusKeyword: 'mud pump piston',
  publishedAt: '2026-11-19T16:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Three things identify a mud pump piston: the liner size (the piston outside diameter), the series letter (the hub size) and the rod fit, which is an API or GD1 taper on a double-acting piston and a straight bore on a single-acting one.',
        'Oteco lists four series, A, K, B and L, each with its own snap ring and retainer plate bore. The liner ranges overlap, so the liner size alone does not give the series.',
        'Oteco makes two constructions: premium pistons with a fabric-reinforced rubber, and bonded urethane pistons with a harder polyurethane bonded to the hub.',
        'Liner sizes and hub codes in the Oteco part numbers are decoded from the codes, not published by Oteco as a table. We confirm the piston against your pump and rod before shipping.',
        'If only the rubber is worn, a rubber or rubber kit may be all you need. Check the hub first.',
      ],
    },
    {
      type: 'lead',
      html: 'A mud pump piston looks simple: a steel hub carrying a rubber that seals against the liner. Ordering one is less simple, because the same liner size can take more than one hub series, and the rod end can be tapered or straight. This guide covers how a piston is built, how Oteco’s <a href="/p/oteco-double-acting-mud-pump-pistons">double-acting</a> and <a href="/p/oteco-single-acting-mud-pump-pistons">single-acting</a> ranges are organised, and how to read the part numbers. Pump makers named here are trademarks of their owners; Oteco parts are replacement parts made to fit, and Indus Hydraulics is not affiliated with those makers.',
    },

    { type: 'section_head', number: '/01', title: 'What is in a piston assembly.', anchor: 'assembly' },
    {
      type: 'paragraph',
      html: 'A piston assembly is a steel hub, a rubber, a retainer plate that holds the rubber on the hub, and a snap ring that locks the plate. Oteco lists each part separately: <a href="/p/oteco-mud-pump-piston-hubs-parts">hubs, retainer plates, snap rings and a bore insert</a> on one page, and <a href="/p/oteco-mud-pump-piston-rubbers-kits">rubbers and replacement kits</a> on another. The rubber is the wearing part; the hub carries it and connects to the piston rod.',
    },
    {
      type: 'paragraph',
      html: 'A double-acting piston works on both strokes, which is how a duplex pump moves fluid, and it is bored with a taper to match the rod end. A single-acting piston works on one stroke, which is the triplex arrangement, and it is bored straight. Oteco’s double-acting listing is for duplex pumps and its single-acting listing for triplex pumps.',
    },

    { type: 'section_head', number: '/02', title: 'Premium rubber or bonded urethane.', anchor: 'compound' },
    {
      type: 'paragraph',
      html: 'Oteco makes two piston constructions. <strong>Premium</strong> pistons use rubbers with a multi-ply, fabric-reinforced backing. Oteco describes them as giving positive, wear-resistant seals with high tensile strength and resistance to chemicals, hydrocarbons and abrasion, and states that they are fully interchangeable with other API-design pistons.',
    },
    {
      type: 'paragraph',
      html: '<strong>Bonded urethane</strong> pistons replace the fabric-backed rubber with a harder, denser polyurethane bonded to the hub. Oteco says they resist abrasive fluids, chemicals and oil-based muds of varying aniline point, and give long life in triplex pumps that have ample liner cooling water. That last condition matters: a urethane piston is not a cure for a pump that runs short of cooling water. In our listing the bonded urethane pistons are single-acting only, in series B for 4-1/2 in to 6 in liners and series L for 6-1/2 in to 9 in.',
    },

    { type: 'section_head', number: '/03', title: 'Series, liner size and rod fit.', anchor: 'series' },
    {
      type: 'paragraph',
      html: 'The series letter is the hub size. Each series has a snap ring and a retainer plate bore, and the liner sizes overlap between series, so confirm the series from the pump rather than guessing it from the liner. The first three columns below are Oteco’s own series table; the last two are what our double-acting and single-acting listings carry.',
    },
    {
      type: 'comparison_table',
      caption: 'Oteco piston series A, K, B and L',
      columns: ['Series', 'Snap ring and plate bore', 'Liners in Oteco table', 'Double-acting rod bores listed', 'Single-acting straight bores listed'],
      rows: [
        { cells: ['A', 'SR20, 2 in', '2-3/4 in to 5 in', 'API 1, 2, 3 and GD1 taper, 3 in to 5 in liners', '1 in and 1-5/8 in, 2-3/4 in to 3-1/4 in liners'] },
        { cells: ['K', 'SR24, 2-1/2 in', '3-1/2 in to 4-1/2 in', 'API 3 and 4 taper, 3-1/2 in to 4-1/2 in liners', '1 in and 1-1/2 in or 1-5/8 in, 3-1/2 in to 4-1/2 in liners'] },
        { cells: ['B', 'SR30, 3 in', '4-1/2 in to 7-3/4 in', 'API 3, 4 and 5 taper, 4-1/2 in to 7-3/4 in liners', '1 in and 1-1/2 in or 1-5/8 in, 4-1/2 in to 6 in liners'] },
        { cells: ['L', 'SR36, 3-3/4 in', '5 in to 9 in', 'API 6 taper, 5 in to 8 in liners', '1 in and 1-1/2 in or 1-5/8 in, 6-1/4 in to 9 in liners'] },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Taper or straight, not both.',
      body: 'The rod fit decides between the two listings. A tapered bore (API 1 to 6 or GD1) is a double-acting piston; a 1 in, 1-1/2 in or 1-5/8 in straight bore is a single-acting piston. A single-acting piston with a 1-5/8 in bore can be reduced to a 1-1/2 in rod with a bore insert, which Oteco lists as a separate part.',
    },

    { type: 'section_head', number: '/04', title: 'Reading an Oteco piston part number.', anchor: 'reading' },
    {
      type: 'paragraph',
      html: 'Take IH-OTC-640045. In our listing it is a premium piston assembly, double acting, series B, API 3 taper, for a 4-1/2 in liner. The Oteco size code in the underlying part code is the liner diameter in inches plus eighths, so I44 is 4 in and 4 eighths, which is 4-1/2 in. The series letter follows, then digits for the taper or bore.',
    },
    {
      type: 'paragraph',
      html: 'Be clear about what is published and what is not. Oteco’s fluid-end sheet gives the series table above; it does not give a piston part-number table. The liner sizes and hub codes in our rows are decoded from the Oteco part codes, which is why we check each one against your pump and rod before it ships. Send the pump make and model, the liner size, the rod end detail and, if you have it, the Oteco number off the old hub.',
    },

    { type: 'section_head', number: '/05', title: 'Replace the piston or just the rubber.', anchor: 'replace' },
    {
      type: 'paragraph',
      html: 'The rubber wears against the liner; the hub should outlast several rubbers. Oteco lists rubber replacement kits for single- and double-acting pistons, and individual rubbers, so a worn rubber on a sound hub can be replaced without buying a whole assembly. Inspect the hub, the retainer plate and the snap ring groove when you pull the piston. A damaged hub or a plate that no longer seats the rubber squarely is a reason to replace the assembly. Oteco publishes no service life or change-out interval for pistons, and we do not invent one: follow your pump maker’s manual and your own wear records.',
    },
    {
      type: 'paragraph',
      html: 'Pistons are one half of the fluid end. The other half is the valves and seats; see <a href="/blog/mud-pump-valves-and-dampener-diaphragms">mud pump valves, seats and dampener diaphragms</a>. The rest of the Oteco range, from gate valves to wipers, is in the <a href="/blog/oteco-drilling-equipment-guide">Oteco drilling equipment guide</a>, and our <a href="/blog/cementing-and-drilling-fluid-equipment">drilling fluid equipment overview</a> shows where the mud pump sits in the circuit.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Does the liner size tell me which series I need?', answer: 'Not by itself. Oteco’s liner ranges overlap: a 4-1/2 in liner appears in series A, K and B, and a 5 in liner in series A, B and L. Confirm the series from the pump model and the hub on the old piston.' },
        { question: 'Can I use a single-acting piston in a duplex pump?', answer: 'Our listings separate them by pump type and rod fit: double-acting pistons for duplex pumps with a tapered bore, single-acting pistons for triplex pumps with a straight bore. Send the pump model and we confirm which applies.' },
        { question: 'When is a bonded urethane piston worth considering?', answer: 'Oteco says bonded urethane resists abrasive fluids, chemicals and oil-based muds, and gives long life in triplex pumps with ample liner cooling water. It is listed for single-acting pistons in series B and L.' },
        { question: 'Are Oteco pistons interchangeable with other makes?', answer: 'Oteco states that its premium pistons are fully interchangeable with other API-design pistons. For any particular pump we confirm the series, liner and rod fit before quoting.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Oteco mud pump piston parts',
      skus: ['IH-OTC-PST-DA', 'IH-OTC-PST-SA', 'IH-OTC-PST-RUBBERS', 'IH-OTC-PST-PARTS', 'IH-OTC-VALVES-SEATS'],
    },
    { type: 'category_link', slug: 'mud-pump-fluid-end-parts', label: 'Mud pump fluid-end parts', blurb: 'Pistons, rubbers, hubs, valves, seats and dampener diaphragms.' },
    {
      type: 'related_articles',
      slugs: ['mud-pump-valves-and-dampener-diaphragms', 'swivel-washpipe-and-packing', 'oteco-drilling-equipment-guide', 'cementing-and-drilling-fluid-equipment'],
    },
    {
      type: 'cta_block',
      heading: 'Need a piston, a hub or a rubber kit?',
      body: 'Send the pump make and model, the liner size and the rod end detail. We confirm the series and taper and quote from Oteco stock at our warehouse in Dubai, UAE, and ship worldwide.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
