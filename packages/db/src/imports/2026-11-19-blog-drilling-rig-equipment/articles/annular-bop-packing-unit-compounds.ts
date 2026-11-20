import type { BlogArticleSeed } from '../shared'

/**
 * Sources for every figure: facts family oteco-bop-rubber (listings IH-OTC-BOP-HYDRIL, -BOP-SHAFFER-REGAN,
 * -BOP-SEALS, -RSR-SHAFFER, -RSR-GRANT: compound guidance, size and pressure table, packing unit and seal
 * kit part numbers, stripper rubber table) and _raw/brochure-review.md section 10 (Oteco rig hardware
 * brochure, BOP and rotating head pages). Fit statements only; no equivalence is claimed with any BOP
 * maker, and no service life or temperature figure is given because Oteco publishes none for these parts.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'annular-bop-packing-unit-compounds',
  title: 'Annular BOP packing units and stripper rubbers: natural rubber, nitrile or neoprene',
  excerpt:
    'A packing unit is chosen by bore, working pressure, head type and the fluid it will see. How Oteco’s natural rubber, nitrile and neoprene units differ, how to read the part numbers, why a seal kit goes in with every change, and where stripper rubbers fit in.',
  categorySlug: 'drilling-rig-equipment',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Annular BOP Packing Unit Compounds',
  seoDescription:
    'Choosing an annular BOP packing unit: natural rubber, nitrile or neoprene, bore and pressure, Oteco part numbers, seal kits and stripper rubbers.',
  focusKeyword: 'annular bop packing unit',
  publishedAt: '2026-11-19T15:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Three things identify the unit you need: the bore, the working pressure and the head type (screw, latch or helicopter lift) on the BOP nameplate. Compound is the fourth choice.',
        'Oteco moulds packing units in its own rubber plant in Houston in natural rubber (NR), nitrile (NBR) and neoprene (CR). NR suits water-based mud, NBR oil-based and synthetic-based mud and hydrocarbons, and CR mixed or low-aniline-point fluids where natural rubber swells.',
        'On Oteco’s Hydril units the last digit of the part number is the compound: 1 for NR, 2 for NBR, 3 for CR. Shaffer spherical units are offered in NR and NBR only, and the Regan Type K units in NBR.',
        'Order the seal kit with each packing unit change. Oteco lists seal kits and single U-seals and head gaskets for Hydril GK and MSP preventers.',
        'Stripper rubbers for rotating heads are a different part with a different job: they seal on the pipe while it rotates and strips.',
      ],
    },
    {
      type: 'lead',
      html: 'The packing unit is the one part of an annular preventer that is meant to wear out. It is a moulded rubber and steel element that squeezes round whatever is in the hole, including drill pipe, a tool joint or nothing at all. Changing it is a planned job, but ordering it is where mistakes happen, because the same bore comes in several pressures and head types, and the compound has to suit the mud. This article sets out how to choose. For how annulars compare with rams, read <a href="/blog/ram-vs-annular-bop">ram versus annular BOP</a>.',
    },
    { type: 'section_head', number: '/01', title: 'Which unit: bore, pressure and head.', anchor: 'identify' },
    {
      type: 'paragraph',
      html: 'Start from the preventer nameplate. Oteco’s tables name the bore, working pressure and head type for each part, covering screw-head, latch-head and helicopter-lift-head preventers from 7-1/16 in to 21-1/4 in. One bore often appears twice: the 11 in Hydril, for example, is listed at 3,000 psi in the MSP and GK screw-head versions and at 5,000 psi in the GK screw or latch head. A unit for the wrong pressure class is the wrong unit, so use the pressure stamped on the preventer, not just the bore.',
    },
    {
      type: 'comparison_table',
      caption: 'Oteco packing units for Hydril annular BOPs: part numbers by compound (NR / NBR / CR)',
      columns: ['Bore', 'Working pressure', 'Packing unit NR / NBR / CR', 'Seal kit'],
      rows: [
        { cells: ['7-1/16 in', '3,000 psi', '210731 / 210732 / 210733', '220730'] },
        { cells: ['7-1/16 in', '5,000 psi', '210751 / 210752 / 210753', '220750'] },
        { cells: ['9 in', '3,000 psi', '210931 / 210932 / 210933', '220930'] },
        { cells: ['11 in', '3,000 psi', '211131 / 211132 / 211133', '221130'] },
        { cells: ['11 in', '5,000 psi', '211151 / 211152 / 211153', '221150'] },
        { cells: ['13-5/8 in', '3,000 psi', '211331 / 211332 / 211333', '221330'] },
        { cells: ['13-5/8 in', '5,000 psi', '211351 / 211352 / 211353', '221350'] },
        { cells: ['21-1/4 in', '2,000 psi', '212121 / 212122 / 212123', '222120'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'These are listed on the <a href="/p/oteco-hydril-annular-bop-packing-units">Hydril packing unit listing</a> and are made to fit Hydril GK, GKM and MSP preventers. That is a fit statement, not a claim of equivalence. The <a href="/p/oteco-shaffer-regan-annular-bop-packing-units">Shaffer and Regan listing</a> covers Shaffer spherical preventers in 11 in and 13-5/8 in at 5,000 psi (231151 and 231152 for the 11 in, 231351 and 231352 for the 13-5/8 in, in NR and NBR) and Regan Type K preventers in 8-5/8 in and 10-3/4 in at 3,000 psi (242508 and 242510, both nitrile). Hydril, Shaffer, Regan and Grant are trademarks of their owners, and Indus Hydraulics is not affiliated with those makers.',
    },
    { type: 'section_head', number: '/02', title: 'Which compound: match the mud.', anchor: 'compound' },
    {
      type: 'paragraph',
      html: 'Rubber swells, softens or hardens in the wrong fluid, and a packing unit that has swollen may stick or fail to seal. Oteco’s guidance for choosing is straightforward.',
    },
    {
      type: 'comparison_table',
      caption: 'Compound selection, as Oteco states it',
      columns: ['Compound', 'Code', 'Suits'],
      rows: [
        { cells: ['Natural rubber', 'NR', 'Water-based mud. Best low-temperature flexibility and the longest life where oil content is low.'] },
        { cells: ['Nitrile', 'NBR', 'Oil-based and synthetic-based mud and hydrocarbons.'] },
        { cells: ['Neoprene', 'CR', 'Mixed and low-aniline-point fluids where natural rubber swells.'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Two practical notes. First, a low aniline point means a fluid that attacks rubber more aggressively, which is why the compound matters in some base oils. If you do not know the mud system for the next well, ask the mud engineer before ordering. Second, the compound range depends on the preventer: the Shaffer spherical units are offered in NR and NBR only, the Regan Type K units only in nitrile, and Oteco lists no neoprene unit for either.',
    },
    { type: 'section_head', number: '/03', title: 'The seal kit goes in with it.', anchor: 'seals' },
    {
      type: 'paragraph',
      html: 'Oteco recommends ordering the seal kit with each packing unit change. The <a href="/p/oteco-hydril-annular-bop-seal-kits">seal kits and seals listing</a> covers Hydril GK and MSP preventers, moulded in nitrile, with a kit that contains the head gasket and the upper, middle, lower and, where fitted, inner U-seals. Individual seals are also listed, and several fit more than one preventer size, so the Fits column names each preventer the seal is listed for. A latch-head seal kit is listed for the 13-5/8 in 5,000 psi preventer. Check the list for your bore and head type before ordering single seals.',
    },
    { type: 'section_head', number: '/04', title: 'Stripper rubbers are a different part.', anchor: 'stripper' },
    {
      type: 'paragraph',
      html: 'A rotating head holds a stripper rubber that seals around the drill pipe while the pipe rotates and while it is being stripped through. Oteco has moulded combination rotating BOP and stripper rubbers in Houston since 1968. The <a href="/p/oteco-shaffer-rotating-head-stripper-rubbers">Shaffer listing</a> covers Type 50, 74 and 79 heads (rubbers SHR-469 to SHR-11113) and Type 51 heads (SHR-15506, 15600 and 15700), in NR for water-based fluids and NBR for oil-based fluids. Each is sized to the pipe and stretches to pass a tool joint up to its listed OD, for example 6-1/2 in for the SHR-469 and 8 in for the SHR-9013. The X and B suffixes mark construction variants of the base rubber.',
    },
    {
      type: 'paragraph',
      html: 'The <a href="/p/oteco-grant-rotating-head-stripper-rubbers">Grant listing</a> covers Model 7068 and 8068 heads by drill pipe size from 2-3/8 in to 5-1/2 in, in NR and NBR, with a butyl rubber on the 5-1/2 in size. Oteco also makes tubing stripper rubbers for a list of named stripper heads; tell us the head and the tubing size.',
    },
    { type: 'section_head', number: '/05', title: 'What to send us.', anchor: 'order' },
    {
      type: 'prose',
      html: '<ul><li>The BOP make, model, bore and working pressure from the nameplate.</li><li>The head type: screw, latch or helicopter lift.</li><li>The mud system, so we can match the compound.</li><li>For a stripper rubber, the rotating head model and the pipe size.</li><li>The Oteco part number, if you have it.</li></ul>',
    },
    {
      type: 'paragraph',
      html: 'We confirm the part and the delivery against Oteco’s tables. More on the range is in <a href="/blog/oteco-drilling-equipment-guide">the Oteco drilling equipment guide</a> and on the <a href="/c/bop-spare-parts">BOP spare parts shelf</a>.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'How do I read an Oteco packing unit part number?',
          answer: 'On the Hydril units the first digits give the bore and pressure class, and the last digit gives the compound: 1 is natural rubber, 2 is nitrile and 3 is neoprene. So 211351, 211352 and 211353 are the 13-5/8 in 5,000 psi unit in the three compounds. Send the number and we confirm it against your nameplate.',
        },
        {
          question: 'Can I use a nitrile unit in water-based mud?',
          answer: 'Oteco recommends natural rubber for water-based mud, where it gives the best low-temperature flexibility and the longest life when oil content is low. Nitrile is for oil-based and synthetic-based mud and hydrocarbons. Choose by the fluid.',
        },
        {
          question: 'Why is there no neoprene unit for my Shaffer spherical?',
          answer: 'Oteco lists the Shaffer spherical units in natural rubber and nitrile only. If you need another compound, send the details and we ask Oteco.',
        },
        {
          question: 'Do I need a seal kit as well as the packing unit?',
          answer: 'Oteco says to order the seal kit with each packing unit change. For Hydril GK and MSP preventers the kit holds the head gasket and U-seals, in nitrile.',
        },
        {
          question: 'Is a stripper rubber the same as a packing unit?',
          answer: 'No. A packing unit goes in an annular preventer. A stripper rubber goes in a rotating head and seals around rotating, moving pipe. They are separate parts and part numbers.',
        },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Oteco packing units, seal kits and stripper rubbers',
      skus: ['IH-OTC-BOP-HYDRIL', 'IH-OTC-BOP-SHAFFER-REGAN', 'IH-OTC-BOP-SEALS', 'IH-OTC-RSR-SHAFFER', 'IH-OTC-RSR-GRANT'],
    },
    { type: 'category_link', slug: 'bop-spare-parts', label: 'BOP spare parts', blurb: 'Annular packing units, seal kits and rotating head stripper rubbers.' },
    {
      type: 'related_articles',
      slugs: ['ram-vs-annular-bop', 'oteco-drilling-equipment-guide', 'cementing-and-drilling-fluid-equipment', 'oilfield-pressure-relief-valves'],
    },
    {
      type: 'cta_block',
      heading: 'Planning a packing unit change?',
      body: 'Send the preventer nameplate details, head type and mud system. We are an authorised Oteco distributor for the Middle East, keep Oteco stock at our warehouse in Dubai, UAE, and ship worldwide.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
