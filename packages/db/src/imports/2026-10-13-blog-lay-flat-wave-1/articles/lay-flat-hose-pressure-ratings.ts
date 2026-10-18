import type { BlogArticleSeed } from '../shared'
import { PRESSURE_BY_BORE } from '../diagrams'

/**
 * Lay flat hose pressure ratings. Every rating quoted is from the live size tables: TPU dewatering
 * (IH-LF-TDW), TPU well riser (IH-LF-TWR), NBR discharge (IH-LF-NBR), TPU slurry drag (IH-LF-TSD),
 * TPU concrete (IH-LF-TCP / TCPH). The Barlow relation is used only to explain the trend, not to rate.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'lay-flat-hose-pressure-ratings',
  title: 'Lay flat hose pressure ratings explained: working, burst and why bigger bores rate lower',
  excerpt:
    'A lay flat hose has a working pressure and a burst pressure, and only one of them is a limit. The working pressure also falls as the bore grows — our TPU dewatering hose is 21 bar at 1-1/2" and 10 bar at 16". Here is what the numbers mean, why they change with size, and how to check a line against them, including surge and couplings.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Lay Flat Hose Pressure Rating: Working vs Burst Pressure by Size',
  seoDescription:
    'What a lay flat hose pressure rating means: working vs burst pressure, safety factor, why ratings fall as the bore grows, and how to allow for lift, surge and couplings. With real ratings by size.',
  focusKeyword: 'lay flat hose pressure rating',
  publishedAt: '2026-10-13T15:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Working pressure is the limit in service. Burst pressure is a test result — two to three times higher — and never a number to operate near.',
        'Ratings fall as the bore grows because the same jacket must hold a larger ring of pressure: our TPU dewatering hose is 21 bar at 1-1/2" and 10 bar at 16".',
        'A line’s limit is the lowest-rated part on it — hose, coupling, valve or pump connection.',
        'The pressure at the pump is friction loss plus lift plus delivery pressure. Check it against the rating of the bore you are buying, not the range headline.',
        'Allow for surge: a valve closed quickly on a long, full line can briefly push pressure well above the running value.',
      ],
    },
    {
      type: 'lead',
      html: 'Lay flat hose is sold on a pressure rating, and that one figure is the most misread number on the datasheet. It changes with the bore, it means something different from the burst figure beside it, and on a real line it is often not the hose that sets the limit at all. Getting it right is the difference between a dewatering line that runs for a season and one that splits on the first morning.',
    },

    { type: 'section_head', number: '/01', title: 'Working pressure and burst pressure.', anchor: 'working-vs-burst' },
    {
      type: 'direct_answer',
      question: 'What is the difference between working pressure and burst pressure on lay flat hose?',
      answer:
        'Working pressure is the maximum pressure the hose may carry in service. Burst pressure is the pressure at which a test sample fails, and it is set two to three times higher to give a safety margin. Only the working pressure is an operating limit; the burst figure tells you how much margin is built in.',
    },
    {
      type: 'paragraph',
      html: 'The ratio between the two is the <strong>safety factor</strong>. Our <a href="/p/tpu-lay-flat-dewatering-hose">TPU dewatering hose</a> and <a href="/p/nbr-lay-flat-discharge-hose">NBR discharge hose</a> are rated at 3:1 — 21 bar working against 63 bar burst, and 10 bar against 30 bar. The <a href="/p/tpu-lay-flat-well-riser-hose">TPU well riser hose</a> works at 2.1 to 2.5:1, reflecting a steady, continuous duty. When comparing hoses from different sources, compare working pressures at the same bore; a higher burst figure with a lower safety factor is not a stronger hose.',
    },

    { type: 'section_head', number: '/02', title: 'Why bigger bores rate lower.', anchor: 'bore' },
    {
      type: 'paragraph',
      html: 'Pressure inside a hose tries to split it along its length. The force on the wall grows with the diameter, so for the same jacket a larger bore can hold less pressure — the relation engineers know from Barlow’s formula, where allowable pressure is proportional to wall strength divided by diameter. Makers offset this with heavier jackets and thicker walls in the larger sizes, which is why the rating steps down unevenly rather than in a straight line.',
    },
    {
      type: 'diagram',
      svg: PRESSURE_BY_BORE,
      captionPrefix: 'FIG. 01',
      caption: 'Two TPU hoses built for different duties. The riser hose carries more pressure at every size; both step down as the bore grows.',
      alt: 'Bar chart of working pressure in bar by nominal bore for two TPU lay flat hoses. TPU well riser hose: 40 bar at 1-1/4 inch, 30 bar at 1-1/2 to 2-1/2 inch, 27 at 3 inch, 26 at 4 inch, 25 at 5 and 6 inch, 20 at 8 inch, 18 at 10 inch. TPU dewatering hose: 21 bar at 1-1/2 to 2-1/2 inch, 17 at 3 and 4 inch, 14 at 6 inch, 15 at 8 inch, 14 at 10 to 14 inch, 10 at 16 inch.',
    },
    {
      type: 'comparison_table',
      caption: 'Working pressure by bore across our lay flat range (bar)',
      columns: ['Bore', 'TPU dewatering', 'TPU well riser', 'TPU slurry drag', 'NBR discharge'],
      rows: [
        { cells: ['1-1/2"', '21', '30', '—', '10'] },
        { cells: ['2-1/2"', '21', '30', '21', '10'] },
        { cells: ['3"', '17', '27', '17', '10'] },
        { cells: ['4"', '17', '26', '12', '10'] },
        { cells: ['6"', '14', '25', '10', '10'] },
        { cells: ['8"', '15', '20', '10', '10'] },
        { cells: ['10"', '14', '18', '—', '10'] },
        { cells: ['12"', '14', '—', '—', '10'] },
        { cells: ['16"', '10', '—', '—', '—'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'At the top of the range sits concrete placement: the high-pressure class of our <a href="/p/tpu-lay-flat-concrete-placement-hose">TPU concrete hose</a> is rated 85 bar at 3" to 4" and 75 bar at 5", with burst at 150 to 170 bar. That is a different product built for a different job, not a stronger version of a dewatering hose.',
    },

    { type: 'section_head', number: '/03', title: 'What pressure your line actually sees.', anchor: 'line-pressure' },
    {
      type: 'paragraph',
      html: 'The hose has to carry the highest pressure anywhere on the line, and that is almost always at the pump discharge. It is the sum of three parts:',
    },
    {
      type: 'prose',
      html: '<ul><li><strong>Friction loss</strong> along the whole line, including couplings and bends. It depends on flow, bore and length — see our <a href="/blog/lay-flat-hose-flow-and-friction-loss">friction loss guide</a>.</li><li><strong>Static lift</strong>: about 1 bar for every 10 m the discharge end is above the pump. A borehole riser carries the full depth of the well on top of the surface pressure.</li><li><strong>Delivery pressure</strong>: anything needed at the far end — a sprinkler, a tank inlet, a frac blender.</li></ul>',
    },
    {
      type: 'paragraph',
      html: 'Worked example: 200 m³/h through 1 km of 6" TPU hose, discharging 20 m above the pump into an open tank. Friction is about 4.6 bar, lift about 2 bar, delivery nil — roughly 6.6 bar at the pump, comfortably inside the 14-bar rating of the 6" dewatering hose. The same flow through 4" hose would need over 30 bar for friction alone — above the 17-bar rating — so the bore, not the pump, is the problem.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Check the pump’s maximum, not its duty point.',
      body: 'A centrifugal pump makes its highest pressure at shut-off, when the far end is closed. If anyone can close a valve downstream, the hose must be rated for the pump’s shut-off pressure, not the pressure it runs at.',
    },

    { type: 'section_head', number: '/04', title: 'Surge, heat and couplings.', anchor: 'surge-heat-couplings' },
    {
      type: 'paragraph',
      html: '<strong>Surge.</strong> When moving water is stopped suddenly — a valve snapped shut, a pump tripping — its momentum turns into a pressure spike that travels along the line. A flexible hose absorbs some of it, but on a long, full line the spike can still exceed the running pressure by a wide margin. Open and close valves slowly, start and stop pumps against a partly closed valve where possible, and leave headroom between the running pressure and the rating.',
    },
    {
      type: 'paragraph',
      html: '<strong>Heat.</strong> Ratings are given for normal ambient service. Our TPU hoses are rated for use from -50 °C to +80 °C and NBR from -20 °C to +80 °C; in the Gulf, a black hose lying empty in the sun gets far hotter than the air. Keep hoses full or shaded where you can, and ask for confirmation of the rating if the fluid itself is hot.',
    },
    {
      type: 'paragraph',
      html: '<strong>Couplings.</strong> A line is only as strong as its weakest joint. Banded small-bore couplings, large-bore <a href="/c/lay-flat-hose-couplings">lay flat couplings</a> and pump or valve connections all have their own limits, and the lowest of them is the line’s limit. For high-pressure transfer lines use a coupling built for the duty — such as our <a href="/p/high-pressure-lay-flat-hose-coupling">high-pressure male and female coupling</a>, each one leak-tested.',
    },

    { type: 'section_head', number: '/05', title: 'Testing a line before use.', anchor: 'testing' },
    {
      type: 'paragraph',
      html: 'Before a new line goes into service, fill it slowly, bleed the air out at the high points, and bring it up to pressure in steps while walking the line for leaks at couplings. Never test with air — compressed air stores energy that water does not, and a failure under air is violent. Test against the maker’s test pressure for the assembly, never towards the burst figure.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Why is my 16-inch hose rated lower than my 4-inch hose?', answer: 'Because the force trying to split the hose grows with its diameter. For the same family of hose, larger bores carry less pressure: our TPU dewatering hose is 17 bar at 4" and 10 bar at 16".' },
        { question: 'What safety factor should lay flat hose have?', answer: 'Transfer and dewatering hoses are commonly rated at 3:1 burst to working, as ours are. Some products built for steady duty, such as our well riser hose, are rated at a lower factor; always operate at or below the published working pressure.' },
        { question: 'Can I run a hose at its burst pressure for a short time?', answer: 'No. The burst pressure is where test samples fail. Operating anywhere near it removes the safety margin entirely.' },
        { question: 'Does the coupling have its own pressure rating?', answer: 'Yes, and it may be lower than the hose. The line’s limit is the lowest rating of any hose, coupling or fitting on it.' },
        { question: 'How much pressure does lifting water take?', answer: 'About 1 bar for every 10 m of height (0.098 bar per metre of water). A 100 m borehole adds about 10 bar at the pump before any friction.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Hoses quoted in this guide',
      skus: ['IH-LF-TDW', 'IH-LF-TWR', 'IH-LF-NBR', 'IH-LF-TCP', 'IH-LF-CHP'],
    },
    {
      type: 'category_link',
      slug: 'lay-flat-hoses',
      label: 'Lay flat hoses',
      blurb: 'Every lay flat hose with its per-size pressure table.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'qatar',
      label: 'Lay flat hose supply to Qatar',
      blurb: 'Dewatering and transfer hose specified for Qatar projects, with size tables and certificates.',
    },
    {
      type: 'related_articles',
      slugs: ['lay-flat-hose-size-chart', 'lay-flat-hose-guide', 'lay-flat-hose-flow-and-friction-loss', 'tpu-vs-nbr-vs-pvc-lay-flat-hose', 'why-lay-flat-hose-fails'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-13',
      note: 'Working and burst pressures from the Indus lay flat hose size tables as published on 13 October 2026. Worked example friction by the Hazen–Williams method, C = 140, water.',
    },
    {
      type: 'cta_block',
      heading: 'Want a line checked?',
      body: 'Send the flow, line length, lift and pump model. We will check the pressure along the line and recommend the hose class, bore and couplings.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
