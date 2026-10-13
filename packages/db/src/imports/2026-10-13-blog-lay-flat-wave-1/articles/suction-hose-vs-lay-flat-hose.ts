import type { BlogArticleSeed } from '../shared'
import { FIG } from '../media'
import { SUCTION_LAYOUT } from '../diagrams'

/**
 * Suction hose vs lay flat hose. Vacuum and pressure figures from the live EPDM/PE suction hose
 * table (IH-LF-SEP: 0.95 bar vacuum to 2", 0.88 bar at 3"–4", 0.81 bar at 6", at 40 °C; working
 * pressure 3.0 to 1.4 bar). Suction-lift physics stated as general engineering.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'suction-hose-vs-lay-flat-hose',
  title: 'Suction hose vs lay flat hose: why a pump needs both, and which goes where',
  excerpt:
    'Lay flat hose cannot be used on a pump’s suction side: under vacuum, atmospheric pressure flattens it and seals the inlet. Every lay flat system needs a rigid-helix suction hose on the inlet and lay flat on the discharge. This guide explains why, how much suction lift is realistic, and how to lay out the two sides of a dewatering or transfer pump.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Suction Hose vs Lay Flat Hose: Why Lay Flat Collapses on Suction',
  seoDescription:
    'Why lay flat hose collapses on a pump suction, what a rigid-helix suction hose does, realistic suction lift, vacuum ratings by size, and how to lay out the suction and discharge sides of a pump.',
  focusKeyword: 'suction hose vs lay flat hose',
  publishedAt: '2026-10-13T16:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A pump’s suction side runs below atmospheric pressure. Lay flat hose has no rigid wall, so the outside air pressure flattens it shut.',
        'Use a rigid-helix suction hose on the inlet and lay flat hose on the discharge, where pressure keeps it round.',
        'Our EPDM/PE suction hose is rated for 0.95 bar vacuum up to 2", 0.88 bar at 3" and 4", and 0.81 bar at 6" (at 40 °C).',
        'Realistic suction lift for water is about 7 to 8 m at sea level, less with warm water, long suction lines or a high-altitude site.',
        'Keep the suction line short, straight, airtight and fitted with a strainer.',
      ],
    },
    {
      type: 'lead',
      html: 'It is one of the most common mistakes on a dewatering job: a pump arrives with a coil of lay flat, someone puts a length on the inlet as well as the outlet, and the pump runs dry within seconds. The hose is not faulty. It is doing exactly what lay flat hose does under vacuum — and it is the reason every lay flat system includes a second, very different kind of hose.',
    },

    { type: 'section_head', number: '/01', title: 'Why lay flat collapses on suction.', anchor: 'why' },
    {
      type: 'direct_answer',
      question: 'Can lay flat hose be used for suction?',
      answer:
        'No. On the suction side the pressure inside the hose is below atmospheric, so the surrounding air pressure — about 1 bar — pushes the walls together. Lay flat has no rigid reinforcement to resist it, so it flattens and seals the pump inlet. Use a suction hose with a rigid helix on the inlet, and lay flat on the discharge.',
    },
    {
      type: 'paragraph',
      html: 'A pump does not pull water. It lowers the pressure in its inlet, and the atmosphere pushes water up the suction line to fill the gap. That means the suction hose spends its working life with more pressure outside than inside — the opposite of a discharge hose. Lay flat hose is a woven tube that relies on internal pressure to hold its shape; with the pressure reversed, there is nothing to stop it collapsing.',
    },
    {
      type: 'figure',
      imageId: FIG['fig-suction-collapse'],
      captionPrefix: 'FIG. 01',
      caption: 'Lay flat used on a pump suction: the hose is sucked flat at the inlet and the pump runs dry.',
      aspectRatio: '16/9',
    },

    { type: 'section_head', number: '/02', title: 'What a suction hose does differently.', anchor: 'suction-hose' },
    {
      type: 'paragraph',
      html: 'A suction hose carries a rigid helix — a spiral of hard plastic or steel wire — built into its wall. The helix holds the bore open against external pressure while the wall between the turns keeps the hose flexible. Our <a href="/p/epdm-pe-suction-hose">EPDM/PE suction hose</a> uses a rigid polyethylene helix in an EPDM/PE compound and is rated for vacuum at every size:',
    },
    {
      type: 'comparison_table',
      caption: 'EPDM/PE suction hose: vacuum and pressure ratings at 40 °C',
      columns: ['Bore', 'Vacuum rating', 'Working pressure', 'Min bend radius'],
      rows: [
        { cells: ['1"', '0.95 bar', '3.0 bar', '60 mm'] },
        { cells: ['1-1/2" and 1-3/4"', '0.95 bar', '2.4 bar', '80 to 105 mm'] },
        { cells: ['2"', '0.95 bar', '2.4 bar', '125 mm'] },
        { cells: ['3"', '0.88 bar', '2.1 bar', '180 mm'] },
        { cells: ['4"', '0.88 bar', '1.7 bar', '300 mm'] },
        { cells: ['6"', '0.81 bar', '1.4 bar', '510 mm'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Notice the trade: the suction hose carries little positive pressure. It is built to resist collapse, not to carry a pumped main — which is exactly why the discharge side should be lay flat or another pressure hose.',
    },
    {
      type: 'comparison_table',
      caption: 'Suction hose vs lay flat hose',
      columns: ['Property', 'Rigid-helix suction hose', 'Lay flat hose'],
      rows: [
        { cells: ['Holds vacuum', 'Yes', 'No — collapses'], highlight: true },
        { cells: ['Positive pressure', 'Low (1.4 to 3 bar in our suction hose)', 'High (10 to 40 bar transfer and riser hose)'] },
        { cells: ['Shape when empty', 'Round', 'Flat'] },
        { cells: ['Typical length', 'Short — up to about 30 m', 'Long — up to 400 m per length'] },
        { cells: ['Where it goes', 'Pump inlet', 'Pump outlet and onward line'] },
      ],
    },

    { type: 'section_head', number: '/03', title: 'How much suction lift you can expect.', anchor: 'suction-lift' },
    {
      type: 'paragraph',
      html: 'Atmospheric pressure at sea level can support a column of about 10.3 m of water in a perfect vacuum. No pump gets close to that: friction in the suction line, the pump’s own inlet requirement (its NPSH) and the vapour pressure of the water all eat into it. For practical planning, allow <strong>about 7 to 8 m of suction lift for cold water at sea level</strong>, and less when:',
    },
    {
      type: 'prose',
      html: '<ul><li><strong>The water is warm.</strong> Warmer water boils at a lower vacuum — relevant on Gulf sites, where sump water can be well above 30 °C.</li><li><strong>The site is high.</strong> Atmospheric pressure falls with altitude, and so does the possible lift.</li><li><strong>The suction line is long or narrow.</strong> Every metre of hose and every bend adds friction on the side where you can least afford it.</li><li><strong>The water carries solids.</strong> Slurry and sludge need more margin.</li></ul>',
    },
    {
      type: 'paragraph',
      html: 'If the water level is deeper than the pump can lift, move the pump down, use a submersible pump, or use a borehole pump with a <a href="/p/tpu-lay-flat-well-riser-hose">lay flat riser</a> — which works on the pressure side and is not limited by suction lift.',
    },

    { type: 'section_head', number: '/04', title: 'Laying out a pump.', anchor: 'layout' },
    {
      type: 'diagram',
      svg: SUCTION_LAYOUT,
      captionPrefix: 'FIG. 02',
      caption: 'The standard layout: a short rigid-helix suction hose with a strainer on the inlet, lay flat hose on the discharge.',
      alt: 'Diagram of a pump beside a sump. On the suction side, a short rigid-helix suction hose with a strainer at its end runs from the pump down into the water; this side is below atmospheric pressure, where lay flat would collapse, and practical lift for water is about 7 to 8 metres. On the discharge side, lay flat hose leaves the pump outlet and can run hundreds of metres, kept round by pressure.',
    },
    {
      type: 'prose',
      html: '<ol><li><strong>Place the pump as close to the water and as low as practical.</strong> Every metre saved on the suction side is worth several on the discharge side.</li><li><strong>Keep the suction hose short and straight,</strong> rising steadily to the pump with no high points where air can collect, and never bent tighter than its minimum bend radius.</li><li><strong>Fit a strainer</strong> or foot valve sized to the pump’s solids handling.</li><li><strong>Make every suction joint airtight.</strong> An air leak on the suction side starves the pump and can make it lose prime.</li><li><strong>Run lay flat on the discharge</strong>, sized for the flow and line length — see our <a href="/blog/lay-flat-hose-flow-and-friction-loss">friction loss guide</a> — with <a href="/c/lay-flat-hose-couplings">couplings</a> matched to the pump outlet.</li></ol>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Why does my lay flat hose go flat when the pump starts?', answer: 'It is on the suction side. The pump lowers the pressure inside the hose and the atmosphere flattens it. Replace that section with a rigid-helix suction hose.' },
        { question: 'Can I use suction hose for the discharge as well?', answer: 'Yes, within its working pressure — our EPDM/PE suction hose is rated 1.4 to 3 bar depending on size at 40 °C. For long or higher-pressure discharge lines, lay flat hose carries far more pressure and is easier to handle in long lengths.' },
        { question: 'How long can a suction hose be?', answer: 'As short as possible. Our suction hose is supplied in lengths up to 30 m, but every extra metre adds friction where the pump can least afford it. Move the pump closer to the water rather than lengthening the suction.' },
        { question: 'What is the maximum suction lift for a dewatering pump?', answer: 'Plan on about 7 to 8 m for cold water at sea level; less for warm water, high sites, long suction lines or slurry. Beyond that, use a submersible pump.' },
        { question: 'Is a suction hose the same as a discharge hose with a helix?', answer: 'A suction hose is built to resist collapse under vacuum. Many are also rated for modest positive pressure and can serve both sides, but a pressure-only hose such as lay flat cannot be used for suction.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Both sides of the pump',
      skus: ['IH-LF-SEP', 'IH-LF-TDW', 'IH-LF-NBR', 'IH-LF-CVG'],
    },
    {
      type: 'category_link',
      slug: 'suction-hoses',
      label: 'Suction hoses',
      blurb: 'Rigid-helix EPDM/PE suction hose for the inlet side of pumps feeding lay flat lines.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'bahrain',
      label: 'Pump hose supply to Bahrain',
      blurb: 'Suction and lay flat discharge hose for Bahrain construction dewatering.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'ireland',
      label: 'Pump hose supply to Ireland',
      blurb: 'Suction hose and lay flat for Irish contractors, farms and water utilities.',
    },
    {
      type: 'related_articles',
      slugs: ['water-suction-and-dewatering-hose', 'pvc-or-rubber-suction-hose', 'lay-flat-hose-guide', 'lay-flat-hose-flow-and-friction-loss'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-13',
      note: 'Suction hose vacuum, pressure and bend-radius figures from the Indus EPDM/PE suction hose size table (ratings at 40 °C) as published on 13 October 2026. Suction lift figures are general engineering guidance for water.',
    },
    {
      type: 'cta_block',
      heading: 'Setting up a pump?',
      body: 'Tell us the pump, water depth, flow and discharge distance. We will supply the suction hose, the lay flat line and the couplings to suit the pump’s connections.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
