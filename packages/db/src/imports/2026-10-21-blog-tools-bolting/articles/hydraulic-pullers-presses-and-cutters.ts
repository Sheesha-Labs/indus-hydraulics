import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Hydraulic pullers, workshop presses, cutters and cylinder-pump sets. Sources read 2026-10-21: Enerpac Industrial
 * Tools Catalog E330 (puller sizing rule "7 to 10 times the shaft diameter" with the shaft/capacity table, manual
 * centre-bolt rule; LGH 10–64 t, spread and reach; Sync-Grip jaws close together; Posi Lock 100 t; IP/IPR, A and XLP
 * press capacities at 10,000 psi; EDCH, ECCE, EWCH, EFBE cutter capabilities and limits; SC/SCL set contents and
 * ranges).
 * NOT used: swing clamp figures (Workholding catalogue not read).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-pullers-presses-and-cutters',
  title: 'Hydraulic pullers, presses and cutters: sizing a puller, choosing a press and cutting safely',
  excerpt:
    'Bearings, gears and couplings come off with a puller sized to the shaft; bushes and pins go in and out on a press; chain, cable, bar and bolts are cut cold rather than torched. Enerpac’s rule for puller capacity, the difference between Lock-Grip and Sync-Grip pullers, the press frames for a workshop, the limits on hydraulic cutters, and what comes in a ready-made cylinder and pump set.',
  categorySlug: 'hydraulic-tools-bolting',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Hydraulic Pullers, Presses & Cutters: How to Size Them',
  seoDescription:
    'How to size a hydraulic puller (7–10 tons per inch of shaft), choose between Lock-Grip and Sync-Grip pullers, pick an H-frame, arbor or workshop press, use hydraulic chain, cable and bar cutters, and what a cylinder-pump set includes.',
  focusKeyword: 'hydraulic puller',
  publishedAt: '2026-10-21T23:15:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Enerpac sizes hydraulic pullers at 7 to 10 tons of capacity per inch of shaft diameter.',
        'Check reach (how far behind the part the jaws must go) and spread (how wide they must open) as well as force.',
        'Presses are chosen by frame and tonnage: arbor 5–30 t, workshop 10–75 t, H-frame 10–200 t in Enerpac’s range.',
        'Hydraulic cutters have hardness and material limits — a cable cutter is not a decommissioning cutter.',
        'A cylinder-pump set arrives ready to use: cylinder, two-speed pump, safety hose and calibrated gauge.',
      ],
    },
    {
      type: 'lead',
      html: 'Workshop hydraulics do three things that hand tools cannot do safely: pull a part off a shaft it has rusted onto, press a part into or out of a housing, and cut steel without a flame. The tools are simple; the mistakes are in sizing — a puller too small for the shaft, jaws that cannot reach behind the part, or a cutter asked to cut something harder than it is made for.',
    },

    { type: 'section_head', number: '/01', title: 'Pullers.', anchor: 'pullers' },
    {
      type: 'comparison_table',
      caption: 'Enerpac puller sizing — hydraulic pullers',
      columns: ['Shaft diameter', 'Puller capacity'],
      rows: [
        { cells: ['Up to 1"', '14 t'] },
        { cells: ['1"–2"', '24 t'] },
        { cells: ['2"–3.5"', '36 t'], highlight: true },
        { cells: ['3.5"–5.5"', '50 t'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>The rule behind the table: capacity in tons of 7 to 10 times the shaft diameter in inches. For a mechanical puller, Enerpac’s rule is a centre bolt at least half the shaft diameter.</p><ul><li><strong>Lock-Grip</strong> pullers (hydraulic LGH 10–64 t, mechanical LGM) lock the jaws to the part so they cannot slip off under load; LGH pullers spread up to 26 in and reach up to 16 in.</li><li><strong>Sync-Grip</strong> pullers close all three jaws at the same time, so the puller self-centres on the part.</li><li><strong>Master puller sets</strong> add cross-arms, bearing pullers and attachments for parts that jaws cannot hold.</li></ul><p>Measure reach — from the jaw tips to the end of the shaft — and spread before ordering; a puller with the force but not the reach is no use.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Presses.', anchor: 'presses' },
    {
      type: 'comparison_table',
      caption: 'Enerpac press frames (10,000 psi)',
      columns: ['Frame', 'Capacity', 'Use'],
      rows: [
        { cells: ['A-Series arbor, C-clamp, bench frame', '5–30 t', 'Bench work: bushes, pins, small bearings'] },
        { cells: ['XLP bolted workshop press', '10–75 t', 'General workshop pressing'], highlight: true },
        { cells: ['IP H-frame / IPR roll-frame', '10–200 t / 50–200 t', 'Heavy pressing; roll frame moves the cylinder across the bed'] },
      ],
    },

    { type: 'section_head', number: '/03', title: 'Cutters.', anchor: 'cutters' },
    {
      type: 'prose',
      html: '<p>Hydraulic cutters cut cold, which Enerpac contrasts with torching, grinding and sawing: minimal spark risk and low vibration. Each type has a limit:</p><ul><li><strong>Chain cutters</strong> (ECCE) cut up to Grade 100 chain, 1.25 in material, behind a transparent guard.</li><li><strong>Wire and cable cutters</strong> (EWCH) cut cable of 3.54–7.09 in diameter up to 43 HRc.</li><li><strong>Bar cutters</strong> cut round bar up to about 2 in; flat-bar cutters (EFBE) take bar up to 2.75 × 0.59 in.</li><li><strong>Decommissioning cutters</strong> (EDCH) open 5.12–6.69 in and cut material up to 41 HRc — and Enerpac says not to use them on wire rope.</li></ul>',
    },

    { type: 'section_head', number: '/04', title: 'Cylinder and pump sets.', anchor: 'sets' },
    {
      type: 'prose',
      html: '<p>For general pushing, lifting and pressing jobs, a set saves matching parts: Enerpac’s SCR (5–100 t, 1.5–14.25 in stroke) and low-height SCL (5–50 t) sets each include a single-acting cylinder, a two-speed hand pump, a 6 ft safety hose and a calibrated gauge with adaptor. Maintenance sets add the spreaders, wedges and attachments for body and frame repair; pipe bender and punch sets use the same pump with different heads.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What size hydraulic puller do I need?', answer: 'Enerpac’s rule is 7 to 10 tons of capacity per inch of shaft diameter — about 36 tons for a 2–3.5 in shaft — with enough reach and spread for the part.' },
        { question: 'Lock-Grip or Sync-Grip puller?', answer: 'Lock-Grip locks the jaws so they cannot slip off; Sync-Grip closes all jaws together so the puller centres itself. Both suit bearings and gears; choose by the part and access.' },
        { question: 'Can a hydraulic cutter cut wire rope?', answer: 'A wire and cable cutter can, within its diameter and hardness limits. Enerpac’s decommissioning cutters must not be used on wire rope.' },
        { question: 'What comes in a cylinder and pump set?', answer: 'A single-acting cylinder, a two-speed pump, a 6 ft safety hose and a calibrated gauge with its adaptor.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Pullers, presses, cutters, cylinder-pump and maintenance sets, and swing clamps:</p>' + stockList(['hydraulic-pullers', 'hydraulic-presses', 'hydraulic-cutters', 'cylinder-pump-sets', 'hydraulic-swing-clamps']),
    },
    {
      type: 'product_embed',
      heading: 'Pullers, presses and cutters',
      skus: ['IH-ENE-LGH', 'IH-ENE-SG', 'IH-ENE-IP', 'IH-ENE-XLP', 'IH-ENE-ECCE', 'IH-ENE-EDCH', 'IH-ENE-SCR', 'IH-ENE-MS'],
    },
    { type: 'category_link', slug: 'hydraulic-pullers', label: 'Hydraulic pullers', blurb: 'Lock-Grip and Sync-Grip pullers and puller sets.' },
    { type: 'category_link', slug: 'cylinder-pump-sets', label: 'Cylinder and pump sets', blurb: 'Ready-to-use cylinder, pump, hose and gauge sets.' },
    { type: 'page_link', kind: 'industry', slug: 'mining', label: 'Mining', blurb: 'Workshop pulling and pressing on heavy equipment.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'enerpac-e330', text: 'Enerpac. Industrial Tools Catalog E330 (EN-US).', url: 'https://vault.enerpac.com/m/633ff0c42dd24838/original/Enerpac_Industrial_Tools_Catalog_E330_EN-US.pdf' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['hydraulic-jacks-wedges-and-skates', 'high-pressure-hydraulic-cylinders-and-pumps', 'hydraulic-torque-wrenches-guide', 'log-splitter-and-shop-press-hose'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Sizing rules, capacities and limits from Enerpac catalogue E330.',
    },
    {
      type: 'cta_block',
      heading: 'Need a puller, press or cutter?',
      body: 'Send the shaft diameter and the part’s size and position, the pressing force, or what has to be cut and how hard it is. We will quote the tool with its pump and hose.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
