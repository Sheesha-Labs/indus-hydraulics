import type { BlogArticleSeed } from '../shared'

import { CU_GRADES } from '../tables'

/**
 * Copper-alloy condenser tube. Sources: approved grade data (ASTM B111 alloys, tempers, minimum tensile,
 * ./tables.ts), rule D5 (velocities: admiralty ≈1.8 m/s; 90/10 2.4–2.5 m/s in tube; 70/30 higher than
 * 90/10; aluminium brass higher than admiralty, no number), approved data for IH-TF-CN-CUN, IH-TF-BR-ADM,
 * IH-TF-BR-ALB (tests incl. mandatory residual-stress test on brasses; services).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'copper-nickel-vs-admiralty-brass-seawater-tubes',
  title: 'Copper-nickel 90/10 vs 70/30 vs admiralty brass in seawater cooling',
  excerpt:
    'Condenser and cooler tube for seawater, brackish and cooling-tower water: how admiralty brass, aluminium brass and 90/10, 70/30 and 66-30-2-2 copper-nickel differ, the water velocities each tolerates, and how to order them to ASTM B111.',
  categorySlug: 'heat-transfer-tubes',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'CuNi 90/10 vs 70/30 vs Admiralty Brass',
  seoDescription:
    'Copper-nickel 90/10 and 70/30, aluminium brass and admiralty brass condenser tubes compared: seawater velocity, tempers, tests and uses.',
  focusKeyword: 'cuni 90/10 vs 70/30',
  publishedAt: '2026-11-16T09:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Admiralty brass suits fresh and cooling-tower water at about 1.8 m/s; it is not the first choice for open Gulf seawater.',
        'Aluminium brass tolerates higher velocity than admiralty and is used for seawater and brackish condensers.',
        '90/10 copper-nickel is the standard seawater tube, at 2.4–2.5 m/s in condenser tube.',
        '70/30 copper-nickel tolerates higher velocity than 90/10; 66-30-2-2 is used where impingement is severe, such as MSF heat-rejection sections.',
        'All are ordered to ASTM B111; brasses must pass a residual-stress test.',
      ],
    },
    {
      type: 'lead',
      html: 'Seawater-cooled condensers and coolers are everywhere along the Gulf: in power and desalination plants, refineries, LNG trains and on ships and platforms. Copper alloys remain a standard tube for them because they resist seawater corrosion and biofouling. The choice between them is mainly a choice of how fast the water can run before it erodes the tube.',
    },
    {
      type: 'direct_answer',
      question: 'What is the difference between 90/10 and 70/30 copper-nickel tube?',
      answer:
        '90/10 copper-nickel (C70600) has about 10 % nickel and is the standard tube for seawater condensers, good to about 2.4–2.5 m/s in condenser tube. 70/30 (C71500) has about 30 % nickel, is stronger and tolerates higher water velocity and more aggressive water. Both are ordered to ASTM B111 in O61 or drawn tempers.',
    },

    { type: 'section_head', number: '/01', title: 'The alloys.', anchor: 'alloys' },
    {
      type: 'comparison_table',
      caption: 'ASTM B111 condenser tube alloys (approved grade data)',
      columns: ['Alloy', 'UNS', 'Min tensile', 'Tempers'],
      rows: CU_GRADES,
    },

    { type: 'section_head', number: '/02', title: 'Water velocity.', anchor: 'velocity' },
    {
      type: 'comparison_table',
      caption: 'Velocity guidance in condenser tube',
      columns: ['Alloy', 'Water', 'In-tube velocity'],
      rows: [
        { cells: ['Admiralty brass', 'Fresh, brackish, cooling-tower water', 'About 1.8 m/s'] },
        { cells: ['Aluminium brass', 'Seawater and brackish water', 'Higher than admiralty; figure on request'] },
        { cells: ['90/10 copper-nickel', 'Seawater', '2.4–2.5 m/s'] },
        { cells: ['70/30 copper-nickel', 'Seawater, more aggressive duty', 'Higher than 90/10'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Above its velocity, an alloy’s protective film is stripped and the tube erodes, usually at the inlet ends. The 3.5 m/s figure sometimes quoted for 90/10 applies to large-bore pipe, not to condenser tube. Low velocity has its own risk: silt and fouling settle and pit the tube.',
    },

    { type: 'section_head', number: '/03', title: 'Where each is used.', anchor: 'uses' },
    {
      type: 'paragraph',
      html: '<a href="/p/admiralty-brass-condenser-tubes">Admiralty brass</a> (C44300, C44400, C44500, inhibited with arsenic, antimony or phosphorus) serves fresh-water and cooling-tower condensers and lube-oil coolers. <a href="/p/aluminium-brass-condenser-tubes">Aluminium brass</a> (C68700) serves seawater and brackish condensers where copper-nickel is not specified. <a href="/p/copper-nickel-condenser-tubes-90-10-and-70-30">90/10 and 70/30 copper-nickel</a> serve seawater-cooled condensers in power, refinery and LNG plants, shipboard and offshore coolers, and MSF desalination heat-recovery and heat-rejection tubing, with 66-30-2-2 (C71640) in heat-rejection sections where impingement is severe.',
    },

    { type: 'section_head', number: '/04', title: 'Tests and ordering.', anchor: 'ordering' },
    {
      type: 'paragraph',
      html: 'B111 tube is eddy-current tested (each tube) or given a hydrostatic or pneumatic test, expansion-tested — 30 % for annealed O61, 20 % for drawn tempers — and flattening-tested. Brasses must pass a mercurous nitrate or ammonia vapour residual-stress test. Order by alloy and UNS number, temper, OD and wall (BWG or mm, minimum or average), length and quantity. Low-fin copper-alloy tube is made to B359 — see <a href="/blog/integral-low-fin-tubes-condenser-retubing">integral low-fin tube</a>.',
    },
    {
      type: 'paragraph',
      html: 'Plain copper (C12200, Cu-DHP) is not a seawater alloy, but it is the tube for HVAC, refrigeration, medical gas and water services: see <a href="/p/copper-tubes">copper tubes</a>, <a href="/p/copper-coils-pancake-and-level-wound">copper coils</a>, <a href="/p/plastic-coated-copper-tubes">plastic-coated copper tubes</a> for buried and in-screed lines, and <a href="/p/inner-grooved-copper-tubes">inner-grooved copper tubes</a> for fin-and-tube evaporators and condensers.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Which is better for seawater, 90/10 or 70/30?', answer: '90/10 is the standard and more economical; 70/30 is chosen for higher velocities and more aggressive water.' },
        { question: 'Can admiralty brass be used with seawater?', answer: 'It is better suited to fresh and brackish water. For open Gulf seawater, aluminium brass or copper-nickel is the usual choice.' },
        { question: 'What velocity can 90/10 copper-nickel take?', answer: '2.4–2.5 m/s in condenser tube.' },
        { question: 'Which standard covers copper-alloy condenser tube?', answer: 'ASTM B111 for straight tube, B395 for U-bends and B359 for low-fin tube.' },
        { question: 'What is C71640 used for?', answer: 'MSF desalination heat-rejection sections and other duties where impingement is severe.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Copper-alloy tube in the catalogue',
      skus: ['IH-TF-CN-CUN', 'IH-TF-BR-ALB', 'IH-TF-BR-ADM', 'IH-TF-EC-LOF', 'IH-TF-UK-CUA'],
    },
    { type: 'category_link', slug: 'copper-alloy-tubes', label: 'Copper and copper-alloy tubes', blurb: 'Copper, brass and copper-nickel tube and coils.' },
    {
      type: 'related_articles',
      slugs: ['stainless-heat-exchanger-tube-grades', 'integral-low-fin-tubes-condenser-retubing', 'heat-transfer-tube-buyers-guide'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-16',
      note: 'Velocities are design guidance from published data, not guarantees; confirm for your water and tube size.',
    },
    {
      type: 'cta_block',
      heading: 'Retubing a seawater condenser?',
      body: 'Send the alloy, OD, BWG, length and tube count. We quote B111 tube with mill certificates.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
