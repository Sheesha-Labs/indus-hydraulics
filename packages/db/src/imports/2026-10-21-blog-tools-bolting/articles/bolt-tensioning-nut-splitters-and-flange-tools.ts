import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Bolt tensioning vs torque, nut splitters and cutters, flange spreaders, alignment, facing and isolation-test tools.
 * Sources read 2026-10-21: Enerpac Bolting Tools Catalog E415 ("Bolting Yellow Pages": two techniques; dry-bolt
 * friction split 50/40/10; lubrication rules; 1/3–2/3–full–check pass sequence; load scatter; tensioning steps;
 * extra stud length 1 × D; load loss; 100% vs 50% tensioning; HM/GT/EAJ pressures and loads; NC and NS nut splitter
 * tables, HRc-44 limit, no square nuts; ATM alignment; FSH wedge spreaders; Equalizer SWi/MG/SG; "minimum of two
 * flange spreading tools"; FF-120 facing) and Enerpac Industrial Tools Catalog E330 (MITT, Mirage facing machines).
 * NOT used: ASME PCC-1 pass percentages (not in the maker source).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'bolt-tensioning-nut-splitters-and-flange-tools',
  title: 'Bolt tensioning, nut splitters and flange tools: opening, aligning and closing a bolted joint',
  excerpt:
    'A flange joint is opened with a spreader, aligned with an alignment tool, faced if the seat is damaged, and closed by torque or by tension — and a seized nut on the way is split rather than burned. How hydraulic bolt tensioning differs from torque tightening, why tensioning needs longer studs, how nut splitters are sized and where they must not be used, and the rule about spreading flanges in pairs.',
  categorySlug: 'hydraulic-tools-bolting',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Bolt Tensioning vs Torque, Nut Splitters & Flange Spreaders',
  seoDescription:
    'Hydraulic bolt tensioning vs torque tightening, load loss and 100% vs 50% tensioning, subsea tensioners, nut splitters and their limits, flange spreaders, alignment tools, flange facing and pipe isolation-test tools.',
  focusKeyword: 'hydraulic bolt tensioning',
  publishedAt: '2026-10-21T23:05:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Torque tightening loads a bolt through the nut and loses most of the effort to friction; tensioning stretches the stud directly, so friction drops out.',
        'Tensioning needs extra stud length — Enerpac draws at least one bolt diameter above the nut — and room for the tool around the nut.',
        'Some stretch is lost when the tool lets go (load loss), so the applied load is set above the target bolt load.',
        'Nut splitters are limited to nuts up to HRc 44 and must not be used on square nuts.',
        'Open a flange with at least two spreaders, never one.',
      ],
    },
    {
      type: 'lead',
      html: 'Most maintenance on a bolted joint follows the same order: break the nuts loose, open the flange, deal with whatever is wrong with the faces or the gasket, line it back up and close it to a controlled bolt load. Each step has a hydraulic tool. This guide covers the ones after the torque wrench — for the wrench itself see <a href="/blog/hydraulic-torque-wrenches-guide">hydraulic torque wrenches</a>.',
    },

    { type: 'section_head', number: '/01', title: 'Torque or tension.', anchor: 'torque-tension' },
    {
      type: 'comparison_table',
      caption: 'The two controlled bolting methods (Enerpac)',
      columns: ['Aspect', 'Torque tightening', 'Bolt tensioning'],
      rows: [
        { cells: ['How the load goes in', 'Turning the nut', 'Stretching the stud axially, then running the nut down'], highlight: true },
        { cells: ['Friction', 'Decides the result — on a dry bolt only ~10% of torque becomes preload', 'Eliminated from the load'] },
        { cells: ['Stud length', 'Standard', 'Longer — about 1 × D above the nut'] },
        { cells: ['Bolts at once', 'One per tool, in a cross pattern', 'Several, or all, at the same time'] },
        { cells: ['Losses to allow for', 'Load scatter as later bolts compress the joint', 'Load loss when the tool releases'] },
      ],
    },
    {
      type: 'prose',
      html: '<p><strong>Torque tightening.</strong> Enerpac’s figures for a dry steel bolt: 50% of the torque is lost under the nut face, 40% in the threads, 10% becomes bolt load. Lubricate the nut face and the male threads with a lubricant whose friction coefficient is known. Tighten in a cross pattern in passes — Enerpac’s sequence is hand-tight with two to three threads showing, one-third of final torque, two-thirds, full torque, then a final pass at full torque working clockwise from bolt 1 — because tightening one bolt at a time causes point loading and load scatter.</p><p><strong>Tensioning.</strong> The tensioner fits over the stud, hydraulic pressure stretches it, the nut is wound down against the joint face and the pressure is released. Some of the stretch is lost as the threads deflect and the nut beds in — Enerpac calls it load loss, calculated from the bolt’s length-to-diameter ratio — so the applied load is set above the target. With a tool on every bolt (100% tensioning) the joint is loaded evenly in one pass; with tools on half the bolts (50%) the first set is over-loaded so it relaxes back to the target when the second set is tensioned.</p>',
    },
    {
      type: 'prose',
      html: '<p>Enerpac tensioner ranges, for scale: HM HydraMax tools run at 1,500 bar (21,750 psi) on 3/4"–4" (M20–M100) bolts for 15 to 522 tons; EAJ Aquajack subsea tensioners also run at 21,750 psi, on 3/4"–3-1/2" (M20–M90) bolts for 17 to 260 US tons, with quick-fastening split nuts for long or damaged threads and hose reels up to 885 ft for diver work.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Seized nuts: split, do not burn.', anchor: 'nuts' },
    {
      type: 'comparison_table',
      caption: 'Enerpac nut splitters (10,000 psi)',
      columns: ['Series', 'Use', 'Nut range (A/F)', 'Force'],
      rows: [
        { cells: ['NC (single and double blade)', 'General nuts, angled head', '1/2"–2-7/8"', '5–90 t'] },
        { cells: ['NS (tri-blade)', 'Flange nuts on ASME B16.5 / BS 1560 flanges', '2-3/4"–5-3/8"', '103–193 t'], highlight: true },
      ],
    },
    {
      type: 'prose',
      html: '<p>A nut splitter drives a chisel blade into one flat of the nut until it cracks, leaving the stud reusable. The NS range has a preset scale that limits blade travel so the threads are not cut. Both series are limited to nuts up to <strong>HRc 44</strong>, and Enerpac says they are not to be used on square nuts. Size by the nut across flats, not the bolt diameter.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Opening, aligning and facing the flange.', anchor: 'flange' },
    {
      type: 'prose',
      html: '<ul><li><strong>Spreaders</strong> open the joint to change a gasket or fit a spade. Enerpac’s Equalizer SWi needs an access gap of only 0.16 in and spreads to 4.1 in with 8.7–27 tons of force; the mechanical MG works from a 0.08 in gap; the SG Secure-Grip locks into the bolt holes where there is no gap at all. <strong>Use at least two spreaders</strong> — Enerpac’s rule — so the flange opens parallel.</li><li><strong>Alignment tools</strong> correct twist and rotational misalignment between two flanges without slings or lifting gear: the ATM range lifts 1 to 10 tons on flange walls from 0.55 to 9 in.</li><li><strong>Facing machines</strong> recut a damaged face. The hand-powered FF-120 faces 1–12 in flanges (not ring-type-joint grooves); Mirage machines mount inside or outside the pipe and cut the spiral “gramophone” finish, 30–55 grooves per inch.</li><li><strong>Isolation and test tools (MITT)</strong> isolate the line for hot work and pressure-test a weld up to 4,500 psi, using under a quarter-gallon of water for a 24-inch test.</li></ul>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Never stand in line with the bolt.',
      body: 'Enerpac’s bolting safety rule: keep out of line with the bolt axis while tensioning, splitting or loosening — a stud or nut that fails under hydraulic load leaves fast.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is bolt tensioning better than torque tightening?', answer: 'It is more even and removes friction from the result, but it needs longer studs and space for the tool. Torque tightening works on standard studs and tighter access.' },
        { question: 'Why is the tensioner pressure higher than the target load?', answer: 'Some stretch is lost when the tool releases (load loss), so the applied load is set above the final bolt load.' },
        { question: 'What is 50% tensioning?', answer: 'Tools on every other bolt: the first set is tensioned higher so it relaxes to the target when the second set is loaded.' },
        { question: 'Can a nut splitter damage the stud?', answer: 'It is designed not to; the NS range has a preset blade stop. Do not use it on nuts harder than HRc 44 or on square nuts.' },
        { question: 'How many flange spreaders do I need?', answer: 'At least two, placed opposite each other, so the flange opens evenly.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Bolt tensioners, nut splitters and cutters, flange spreaders, alignment, facing and isolation-test tools:</p>' + stockList(['hydraulic-bolt-tensioners', 'nut-splitters-nut-cutters', 'flange-spreaders-alignment-tools']),
    },
    {
      type: 'product_embed',
      heading: 'Bolting and flange tools',
      skus: ['IH-ENE-EAJ', 'IH-ENE-EAJ-QFN', 'IH-ENE-NS', 'IH-ENE-NC', 'IH-ENE-SWI', 'IH-ENE-FA', 'IH-ENE-MM', 'IH-ENE-MITT'],
    },
    { type: 'category_link', slug: 'flange-spreaders-alignment-tools', label: 'Flange spreaders and alignment tools', blurb: 'Spreaders, alignment, facing and isolation-test tools.' },
    { type: 'category_link', slug: 'nut-splitters-nut-cutters', label: 'Nut splitters', blurb: 'NC and NS hydraulic nut splitters.' },
    { type: 'page_link', kind: 'industry', slug: 'oil-gas', label: 'Oil & gas', blurb: 'Subsea and topside flange bolting.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'enerpac-e415', text: 'Enerpac. Bolting Tools Catalog E415 (EN-US), including the Bolting Yellow Pages.', url: 'https://vault.enerpac.com/m/70e0e0d9d5787fed/original/Enerpac_Bolting_Tools_Catalog_E415_EN-US.pdf' },
        { id: 'enerpac-e330', text: 'Enerpac. Industrial Tools Catalog E330 (EN-US).', url: 'https://vault.enerpac.com/m/633ff0c42dd24838/original/Enerpac_Industrial_Tools_Catalog_E330_EN-US.pdf' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['hydraulic-torque-wrenches-guide', 'ring-joint-gaskets-r-rx-bx', 'stainless-steel-flanges-asme-b16-5', 'anti-seize-and-assembly-pastes'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Methods, sequences, tool ranges and limits from Enerpac catalogues E415 and E330.',
    },
    {
      type: 'cta_block',
      heading: 'Planning a flange job?',
      body: 'Send the flange size and class, stud size and length, target bolt load or torque, and whether the work is topside or subsea. We will quote tensioners or wrenches, spreaders and splitters as one kit.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
