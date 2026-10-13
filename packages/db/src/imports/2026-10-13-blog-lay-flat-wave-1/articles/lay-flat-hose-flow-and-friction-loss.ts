import type { BlogArticleSeed } from '../shared'
import { FRICTION_BY_FLOW } from '../diagrams'

/**
 * Lay flat hose flow and friction loss. All loss figures are our own estimates by Hazen–Williams
 * (C = 140, clean water, 20 °C) on the published inside diameters of the TPU dewatering hose
 * (39, 51, 76, 104, 155, 205, 254, 305, 355, 405 mm). Stated as estimates throughout.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'lay-flat-hose-flow-and-friction-loss',
  title: 'Lay flat hose flow and friction loss: how far can you pump, and which bore do you need?',
  excerpt:
    'Pick a lay flat bore from the flow and the line length, not from the pump outlet. This guide gives friction loss per kilometre for every bore from 1-1/2" to 16", the flow each size handles comfortably, and a five-step method to check a line — with worked examples for dewatering, frac water and a borehole riser.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Lay Flat Hose Friction Loss Chart: Flow by Size & How Far You Can Pump',
  seoDescription:
    'Friction loss per km for lay flat hose from 1-1/2" to 16", recommended flow per bore, and a step-by-step method to size a dewatering, frac or transfer line — with worked examples.',
  focusKeyword: 'lay flat hose friction loss',
  publishedAt: '2026-10-13T15:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Friction loss rises roughly with the square of the flow and falls very steeply with bore: doubling the bore cuts loss at the same flow by about 30 times.',
        'Keep water speed between about 1.5 and 3 m/s. Below that you are paying for hose you do not need; above it, friction and wear climb fast.',
        'At 200 m³/h, 6" lay flat loses about 4.6 bar per km; 8" about 1.2 bar per km; 4" over 30 bar per km.',
        'Pressure at the pump = friction loss + lift (about 1 bar per 10 m) + delivery pressure. It must stay inside the hose and coupling ratings.',
        'Long lay flat lengths help twice: fewer couplings mean fewer leak points and less extra loss at joints.',
      ],
    },
    {
      type: 'lead',
      html: 'The most common sizing mistake with lay flat hose is to match the pump outlet. A 6" pump on a 1-kilometre run may need an 8" line to deliver its flow; a 4" pump moving water 50 m to a drain may be perfectly served by 4". What decides the bore is how much pressure the line loses to friction at the flow you need — and that figure changes enormously from one size to the next.',
    },

    { type: 'section_head', number: '/01', title: 'How far can you pump through lay flat hose?', anchor: 'how-far' },
    {
      type: 'direct_answer',
      question: 'How far can you pump water through lay flat hose?',
      answer:
        'As far as the pump’s pressure, minus lift, can overcome friction — within the hose rating. As an estimate for clean water, a 6" line at 200 m³/h loses about 4.6 bar per km, so a pump with 10 bar spare can push that flow about 2 km on level ground. An 8" line at the same flow loses about 1.2 bar per km and reaches about four times as far.',
    },
    {
      type: 'paragraph',
      html: 'Friction loss is the pressure a fluid spends overcoming drag along the wall. It grows with the length of the line, roughly with the square of the flow, and falls with about the fifth power of the bore. That last relation is why bore choice dominates: at the same flow, an 8" line loses about a quarter of what a 6" line does, and a 6" line about a seventh of what a 4" line does.',
    },
    {
      type: 'diagram',
      svg: FRICTION_BY_FLOW,
      captionPrefix: 'FIG. 01',
      caption: 'Estimated friction loss per kilometre of lay flat hose for clean water, by flow and bore. Each step up in bore moves the curve down by a factor of three to four.',
      alt: 'Log-log chart of friction loss in bar per kilometre against flow in cubic metres per hour, from 50 to 1,000 m3/h, for lay flat hose bores of 4, 6, 8, 10 and 12 inches. At 200 m3/h the estimated loss is about 32 bar per km in 4 inch, 4.6 in 6 inch, 1.2 in 8 inch, 0.4 in 10 inch and 0.2 in 12 inch. At 600 m3/h it is about 35 bar per km in 6 inch, 9 in 8 inch, 3.2 in 10 inch and 1.3 in 12 inch.',
    },

    { type: 'section_head', number: '/02', title: 'Flow and friction loss by bore.', anchor: 'table' },
    {
      type: 'paragraph',
      html: 'The table below uses the actual inside diameters of our <a href="/p/tpu-lay-flat-dewatering-hose">TPU dewatering hose</a>. The comfortable flow range is the band between 1.5 and 3 m/s; the loss column is at 2.5 m/s, a typical design speed for transfer lines.',
    },
    {
      type: 'comparison_table',
      caption: 'Lay flat hose: comfortable flow range and friction loss (estimates, clean water)',
      columns: ['Bore (ID)', 'Flow at 1.5 m/s', 'Flow at 3 m/s', 'Loss per km at 2.5 m/s'],
      rows: [
        { cells: ['1-1/2" (39 mm)', '6 m³/h', '13 m³/h', '17 bar'] },
        { cells: ['2" (51 mm)', '11 m³/h', '22 m³/h', '12 bar'] },
        { cells: ['3" (76 mm)', '24 m³/h', '49 m³/h', '7.8 bar'] },
        { cells: ['4" (104 mm)', '46 m³/h', '92 m³/h', '5.4 bar'] },
        { cells: ['6" (155 mm)', '102 m³/h', '204 m³/h', '3.4 bar'], highlight: true },
        { cells: ['8" (205 mm)', '178 m³/h', '356 m³/h', '2.5 bar'] },
        { cells: ['10" (254 mm)', '274 m³/h', '547 m³/h', '1.9 bar'] },
        { cells: ['12" (305 mm)', '395 m³/h', '789 m³/h', '1.5 bar'] },
        { cells: ['14" (355 mm)', '534 m³/h', '1,069 m³/h', '1.3 bar'] },
        { cells: ['16" (405 mm)', '696 m³/h', '1,391 m³/h', '1.1 bar'] },
      ],
    },
    {
      type: 'comparison_table',
      caption: 'Friction loss per km at fixed flows (bar, estimates)',
      columns: ['Flow', '6"', '8"', '10"', '12"', '14"', '16"'],
      rows: [
        { cells: ['100 m³/h', '1.3', '0.3', '0.1', '<0.1', '<0.1', '<0.1'] },
        { cells: ['200 m³/h', '4.6', '1.2', '0.4', '0.2', '0.1', '<0.1'] },
        { cells: ['400 m³/h', '16.6', '4.3', '1.5', '0.6', '0.3', '0.2'] },
        { cells: ['600 m³/h', '35.2', '9.0', '3.2', '1.3', '0.6', '0.3'] },
        { cells: ['1,000 m³/h', '90.8', '23.3', '8.2', '3.4', '1.6', '0.8'] },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'These are estimates.',
      body: 'Figures use the Hazen–Williams equation with C = 140 for a smooth polymer bore and clean water. Real lines add loss at couplings, bends and kinks; dirty water and slurry lose more. Lay flat hose also swells slightly under pressure, which helps a little. Add a margin of 10 to 20% and confirm critical lines with us.',
    },

    { type: 'section_head', number: '/03', title: 'Sizing a line in five steps.', anchor: 'method' },
    {
      type: 'prose',
      html: '<ol><li><strong>Set the flow.</strong> Pump duty, inflow to the excavation, frac blender demand or irrigation requirement, in m³/h.</li><li><strong>Pick a bore that keeps velocity near 1.5 to 3 m/s</strong> using the first table.</li><li><strong>Work out friction:</strong> loss per km for that flow and bore × line length in km, plus 10 to 20% for couplings and bends.</li><li><strong>Add lift and delivery:</strong> 0.098 bar per metre the discharge sits above the pump, plus any pressure needed at the far end.</li><li><strong>Check the total</strong> against the pump curve and against the working pressure of the hose at that bore and every coupling. If it is too high, go up a bore — it is usually cheaper than a bigger pump.</li></ol>',
    },

    { type: 'section_head', number: '/04', title: 'Three worked examples.', anchor: 'examples' },
    {
      type: 'paragraph',
      html: '<strong>Construction dewatering.</strong> 150 m³/h from a sump to a discharge point 600 m away and 8 m higher. In 6" hose friction is about 2.7 bar per km, so 1.6 bar over the run, plus 20% for fittings (1.9 bar) and 0.8 bar of lift: about 2.7 bar at the pump. Easily inside the 14-bar rating, and a 6" hose of 2.3 kg/m is light enough to handle by hand. A <a href="/p/nbr-lay-flat-discharge-hose">6" NBR discharge hose</a> at 10 bar would carry it just as well where oily water is expected.',
    },
    {
      type: 'paragraph',
      html: '<strong>Frac water transfer.</strong> Large frac jobs move water at hundreds of cubic metres an hour. Take 600 m³/h over 3 km of level ground: in 10" hose about 3.2 bar per km — 9.6 bar plus fittings, roughly 11.5 bar, inside the 14-bar rating of 10" <a href="/p/tpu-lay-flat-dewatering-hose">TPU dewatering hose</a> but with little headroom. In 12" it is about 1.3 bar per km, under 5 bar for the whole run, which leaves room for a booster-free line and for surge. On long transfer lines the larger bore usually pays for itself in pump fuel.',
    },
    {
      type: 'paragraph',
      html: '<strong>Borehole riser.</strong> A submersible pump set 120 m deep delivering 40 m³/h through 3" riser hose. Lift alone is about 11.8 bar; friction over 120 m of 3" at that flow is under 1 bar. The pump sees about 13 bar at the bottom of the riser — inside the 27-bar rating of 3" <a href="/p/tpu-lay-flat-well-riser-hose">TPU well riser hose</a>, which also carries the weight of pump and water column on its tensile strength of 9,800 kg.',
    },

    { type: 'section_head', number: '/05', title: 'Getting more out of a line.', anchor: 'tips' },
    {
      type: 'prose',
      html: '<ul><li><strong>Use long lengths.</strong> Our TPU hose comes in single lengths up to 400 m; every coupling removed is one less leak point and one less pressure drop.</li><li><strong>Lay it straight.</strong> Tight bends and twists add loss and concentrate wear; a kink can block a line completely.</li><li><strong>Bleed the air.</strong> Trapped air at high points reduces the effective bore. Fill slowly and vent.</li><li><strong>Size couplings to the hose.</strong> A reducer at each end of an 8" line throws away much of the benefit of the bigger bore. Use full-bore <a href="/c/lay-flat-hose-couplings">lay flat couplings</a>.</li><li><strong>Recheck when the duty changes.</strong> Doubling the flow roughly quadruples the friction.</li></ul>',
    },
    {
      type: 'paragraph',
      html: 'For the largest flows — 40 to 120 barrels a minute over several kilometres — see the worked cases in our guide to <a href="/blog/frac-water-transfer-lay-flat-hose">frac water transfer with lay flat hose</a>.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What size lay flat hose do I need for 100 m³/h?', answer: 'About 6" for runs over a few hundred metres (roughly 1.3 bar loss per km). 4" will carry 100 m³/h but loses about 9 bar per km, so it suits only short runs.' },
        { question: 'Does lay flat hose have more friction than pipe?', answer: 'A smooth TPU or rubber bore performs close to smooth plastic pipe of the same inside diameter. Losses rise if the hose is kinked, twisted or not fully open, so lay it straight and keep it full.' },
        { question: 'How much pressure do I lose per metre of lift?', answer: 'About 0.098 bar per metre of vertical rise for water — roughly 1 bar per 10 m.' },
        { question: 'Can I use this table for slurry or sludge?', answer: 'No. Solids-laden fluids lose more pressure and need a minimum velocity to keep solids moving. Send us the solids content and particle size.' },
        { question: 'Is it better to use a bigger hose or a bigger pump?', answer: 'Usually a bigger hose. Friction falls so fast with bore that one size up often removes the need for a booster pump and cuts fuel use for the life of the job.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Hose and couplings for transfer lines',
      skus: ['IH-LF-TDW', 'IH-LF-NBR', 'IH-LF-TWR', 'IH-LF-CVG', 'IH-LF-CHP', 'IH-LF-EPW'],
    },
    {
      type: 'category_link',
      slug: 'tpu-lay-flat-hoses',
      label: 'TPU lay flat hoses',
      blurb: 'Dewatering, frac and transfer hose from 1-1/2" to 16" with full size tables.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'kuwait',
      label: 'Lay flat hose supply to Kuwait',
      blurb: 'Transfer and dewatering lines sized for Kuwait oilfield and construction work.',
    },
    {
      type: 'related_articles',
      slugs: ['frac-water-transfer-lay-flat-hose', 'lay-flat-hose-guide', 'lay-flat-hose-pressure-ratings', 'lay-flat-hose-vs-hdpe-pipe', 'water-suction-and-dewatering-hose'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-13',
      note: 'Friction losses are Indus estimates by the Hazen–Williams method (C = 140, clean water) on the published inside diameters of our TPU lay flat hose. Hose ratings from the size tables as published on 13 October 2026.',
    },
    {
      type: 'cta_block',
      heading: 'Send us your line',
      body: 'Flow, length, lift and pump model are enough. We will size the bore, check the pressure along the line and quote the hose, couplings and handling equipment.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
