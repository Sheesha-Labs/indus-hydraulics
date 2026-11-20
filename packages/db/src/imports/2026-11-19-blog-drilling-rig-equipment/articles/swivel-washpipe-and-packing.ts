import type { BlogArticleSeed } from '../shared'

/**
 * Sources for the figures in this article (Oteco export folder, 2026-11-19):
 * - _faq/facts/oteco-swivel-washpipe.json: the nine washpipe listings (Skytop Brewster, Emsco, Gray,
 *   National, Ideco, Oilwell, King, Gardner-Denver, other), their part counts (169 in all: 84 washpipes,
 *   78 packing sets or rings, 7 snap rings), the swivel models each lists, and the number of rows per make
 *   whose make is inferred from the Oteco code group (66 on the eight make pages).
 * - _raw/brochure-review.md: Rig Hardware brochure (washpipe and packing shown in the range, no table).
 * Make-inferred rows are stated as inferred; we confirm the swivel model before shipping.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'swivel-washpipe-and-packing',
  title: 'Swivel washpipe and packing: what wears, and how to order it by swivel model',
  excerpt:
    'The washpipe carries drilling fluid from the swivel gooseneck into the rotating stem, and its packing seals it. What wears, how Oteco lists washpipe and packing by swivel make and model, why many rows say model to confirm, and what to send to order the right set.',
  categorySlug: 'drilling-rig-equipment',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Swivel Washpipe and Packing by Model',
  seoDescription:
    'Swivel washpipe and packing: what wears, how Oteco lists sets by swivel make, why some rows say model to confirm, and what to send to order.',
  focusKeyword: 'swivel washpipe',
  publishedAt: '2026-11-19T18:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The washpipe is the hardened, ground tube that carries drilling fluid from the swivel gooseneck into the rotating stem. The packing is the stack of rings that seals it. Both wear with every hour of circulation.',
        'Oteco lists 169 part numbers across nine pages: 84 washpipes, 78 packing sets or rings and 7 snap rings, organised by swivel make.',
        'Washpipe and packing are separate parts with separate numbers. The two numbers for one swivel do not always match, so look each up by swivel model.',
        'On the eight make pages, 66 part numbers name no swivel model in Oteco’s source data. Their make is inferred from Oteco’s code group, and the listing says so. We confirm the swivel model before shipping.',
        'To order, send the swivel make, model and serial number, or the Oteco part number from your bill of materials.',
      ],
    },
    {
      type: 'lead',
      html: 'Every drilling fluid pump stroke ends up passing through a washpipe. The fluid enters the swivel at the gooseneck, travels down the washpipe and into the rotating stem, and the packing around the washpipe holds the pressure while the stem turns. That is a lot of duty for a tube and a stack of rings, which is why a swivel crew replaces the packing routinely and the washpipe at intervals. Swivel makers named here are trademarks of their owners; Oteco parts are replacement parts made to fit that equipment, and Indus Hydraulics is not affiliated with those makers.',
    },

    { type: 'section_head', number: '/01', title: 'What wears, and what to replace together.', anchor: 'wear' },
    {
      type: 'paragraph',
      html: 'Oteco describes the washpipe as hardened steel and the packing as elastomer rings. Oteco makes washpipe and packing sets for the main land-rig swivels, including split upper and lower packing rings, with or without metal rings, where the swivel needs them. Oteco gives no fixed change interval, and we do not invent one: both parts wear with circulation, so use your swivel maker’s manual and your own records.',
    },
    {
      type: 'paragraph',
      html: 'Because the packing seals against the tube, inspect the washpipe for scoring whenever you change the packing. A scored tube cuts through new rings quickly, so the two are normally replaced together. Order the packing alone when circulation leaks past the stem and the tube is sound; order the washpipe as well when the tube is scored or worn.',
    },

    { type: 'section_head', number: '/02', title: 'How Oteco lists washpipe: by swivel make.', anchor: 'listing' },
    {
      type: 'paragraph',
      html: 'Oteco’s washpipe parts are listed on one page per swivel make: <a href="/p/oteco-skytop-brewster-swivel-washpipe-packing">Skytop Brewster</a>, <a href="/p/oteco-emsco-swivel-washpipe-packing">Emsco</a>, <a href="/p/oteco-gray-swivel-washpipe-packing">Gray</a>, <a href="/p/oteco-national-swivel-washpipe-packing">National</a>, <a href="/p/oteco-ideco-swivel-washpipe-packing">Ideco</a>, <a href="/p/oteco-oilwell-swivel-washpipe-packing">Oilwell</a>, <a href="/p/oteco-king-swivel-washpipe-packing">King</a> and <a href="/p/oteco-gardner-denver-swivel-washpipe-packing">Gardner-Denver</a>, plus an <a href="/p/oteco-swivel-washpipe-packing-other">other swivels page</a> for parts the source data does not tie to a model. Packing numbers read WP followed by five digits, for example WP10210; washpipe numbers start 0670, for example 067010210.',
    },
    {
      type: 'comparison_table',
      caption: 'Oteco washpipe and packing pages by swivel make',
      columns: ['Make', 'Part numbers', 'Rows with model to confirm', 'Models listed (examples)'],
      rows: [
        { cells: ['Skytop Brewster', '13', '6', '3-S, 6-HD, 6-SX, 6-BX, 9-SX'] },
        { cells: ['Emsco', '33', '22', 'AE-4 (New Style), L-200, LA-300, LB-400, LB-650'] },
        { cells: ['Gray', '10', '4', 'A, B-44, C, F, FM, B-44-M Quick Change'] },
        { cells: ['National', '21', '12', 'D, E-3, MUB, N-815, P-200 to P-650'] },
        { cells: ['Ideco', '17', '10', 'SS-150, TL-200, TL-300 to TL-650, TSS-250'] },
        { cells: ['Oilwell', '14', '6', '60-A, 150-B, PC-100, PC-650, S-425'] },
        { cells: ['King', '9', '5', '20-GW, 32-GA, 53-GA'] },
        { cells: ['Gardner-Denver', '7', '1', 'SW-75 to SW-550'] },
      ],
    },

    { type: 'section_head', number: '/03', title: 'Inferred makes: model to confirm.', anchor: 'inferred' },
    {
      type: 'paragraph',
      html: 'Many rows in the tables above do not name a swivel model. Across the eight make pages that is 66 of 124 part numbers. For those, we place the part on the make page from Oteco’s own code numbering, and the Fits column reads “model to confirm (make inferred from the Oteco code group)”. This is our reading of the code group, not something Oteco has published, so we treat it as unconfirmed until the swivel model is checked. In the rows listed, the packing numbers cluster by make, for instance WP102xx for Skytop Brewster, WP103xx for Emsco and WP106xx for National. That helps us place a part; it does not prove a fit.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Do not assume the numbers pair.',
      body: 'For the Skytop Brewster 6-HD and 6-S the packing is WP10210 and the washpipe is 067010210. For the Oilwell 100-C group, though, the packing is WP10910 and the washpipe is 067010906. Look up the packing and the washpipe separately by swivel model.',
    },

    { type: 'section_head', number: '/04', title: 'How to order the right set.', anchor: 'order' },
    {
      type: 'prose',
      html: '<ul><li><strong>Send the swivel make, model and serial number.</strong> The model is on the swivel nameplate. If you only have the make, the number on the old packing set or tube is the next best thing.</li><li><strong>Or send the Oteco part number</strong> from your bill of materials. The <a href="/p/oteco-swivel-washpipe-packing-other">other swivels page</a> exists for numbers that are not tied to a model; we identify the washpipe and packing with Oteco from the number, or from the swivel details.</li><li><strong>Say what you need:</strong> a complete set, upper or lower packing only (the Ideco TL series, for example, lists upper and lower packing separately, with and without a metal ring), washpipe, or snap rings.</li><li><strong>Expect a confirmation.</strong> Because so many rows are inferred, we confirm the swivel model before shipping.</li></ul>',
    },
    {
      type: 'paragraph',
      html: 'The swivel is one part of the circulating system. For the pump end, see <a href="/blog/mud-pump-valves-and-dampener-diaphragms">valves and dampener diaphragms</a> and <a href="/blog/mud-pump-pistons-explained">pistons</a>; for the line between them, see <a href="/blog/hammer-union-figure-numbers">hammer union figure numbers</a>. The whole Oteco range is in the <a href="/blog/oteco-drilling-equipment-guide">Oteco drilling equipment guide</a>.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Do I replace the washpipe every time I replace the packing?', answer: 'Not necessarily. Inspect the tube for scoring whenever the packing is changed. A sound tube can stay; a scored one will cut new rings and should be replaced with them.' },
        { question: 'What does model to confirm mean in the listing?', answer: 'The part number is placed under that swivel make from Oteco’s code group, but Oteco’s source data names no swivel model for it. We check the swivel model before shipping.' },
        { question: 'Is there a fixed change interval?', answer: 'Oteco states none. Both parts wear with circulation, so the packing is replaced routinely and the washpipe at intervals set by your swivel maker’s manual and your own wear records.' },
        { question: 'Do you have washpipe for a swivel that is not on the make pages?', answer: 'Possibly. The other swivels page includes washpipe for the Walker Neer water-well swivel and packing sets not tied to a model. Send the swivel make, model and serial number and we identify the part with Oteco.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Oteco washpipe and packing by swivel make',
      skus: ['IH-OTC-WP-EMSCO', 'IH-OTC-WP-NATIONAL', 'IH-OTC-WP-IDECO', 'IH-OTC-WP-OILWELL', 'IH-OTC-WP-SKYTOP', 'IH-OTC-WP-OTHER'],
    },
    { type: 'category_link', slug: 'swivel-washpipe-packing', label: 'Swivel washpipe and packing', blurb: 'Washpipe, packing sets and snap rings by swivel make.' },
    {
      type: 'related_articles',
      slugs: ['mud-pump-pistons-explained', 'mud-pump-valves-and-dampener-diaphragms', 'oteco-drilling-equipment-guide', 'hammer-union-figure-numbers'],
    },
    {
      type: 'cta_block',
      heading: 'Need washpipe or packing for a swivel?',
      body: 'Send the swivel make, model and serial number, or the Oteco part number. We confirm the set and quote from Oteco stock at our warehouse in Dubai, UAE, and ship worldwide.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
