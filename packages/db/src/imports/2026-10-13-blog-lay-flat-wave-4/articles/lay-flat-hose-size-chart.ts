import type { BlogArticleSeed } from '../shared'
import { FIG } from '../media'

/**
 * Lay flat hose size chart, built from the published size tables of our IH-LF listings (TDW/TPW,
 * NBR, TWR, TSD, TSS, TCP). Flat width is our approximation, π × (ID + wall) / 2, labelled as such.
 * Weights and pressures are as published on the listings.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'lay-flat-hose-size-chart',
  title: 'Lay flat hose size chart: inch, DN, inside diameter, flat width, weight and pressure',
  excerpt:
    'Lay flat hose is sold by nominal inch size, specified by DN, measured by inside diameter and recognised on the shelf by its flat width — and none of those numbers is quite the same. A single chart that lines them up for 1-1/2" to 16" hose, with weight per metre and working pressure, and how to measure a hose you already have.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Lay Flat Hose Size Chart: Inch, DN, ID, Flat Width, Weight',
  seoDescription:
    'Lay flat hose sizes from 1-1/2" to 16": nominal inch, DN, inside diameter, approximate flat width, weight per metre and working pressure for TPU, NBR, riser and slurry hose — and how to measure a lay flat hose.',
  focusKeyword: 'lay flat hose sizes',
  publishedAt: '2026-10-14T07:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Lay flat hose is named by its nominal inside diameter in inches (or DN in millimetres); the actual bore is usually within a few millimetres of it.',
        'Flat width — the width of the hose lying flat — is roughly half the circumference: about 1.6 times the bore. It is how you identify a hose without cutting it.',
        'Working pressure falls as bore rises: 21 bar at 2" to 10 bar at 16" for our TPU transfer hose.',
        'Weight is light for the size: about 1.5 kg/m at 4" and 4.6 kg/m at 12" for TPU.',
        'Couplings are matched to bore and wall thickness, so give both when ordering.',
      ],
    },
    {
      type: 'lead',
      html: 'A customer asks for “6-inch layflat”. The pump outlet is DN150, the spec sheet says 155 mm ID, the coupling catalogue lists 152.4 mm, and the hose on the ground measures about 25 cm across. All of these describe the same hose. This chart lines the numbers up so buyers, engineers and stores can talk about the same thing — taken from the published size tables of our <a href="/c/lay-flat-hoses">lay flat hose</a> range.',
    },

    { type: 'section_head', number: '/01', title: 'The master chart.', anchor: 'chart' },
    {
      type: 'comparison_table',
      caption: 'TPU lay flat transfer and drinking-water hose: sizes, weights and working pressure (flat width approximate)',
      columns: ['Size', 'DN', 'Inside diameter', 'Wall', 'Flat width (approx.)', 'Weight', 'Working pressure'],
      rows: [
        { cells: ['1-1/2"', 'DN40', '39 mm', '2.6 mm', '≈ 65 mm', '0.45 kg/m', '21 bar'] },
        { cells: ['2"', 'DN50', '51 mm', '3.0 mm', '≈ 85 mm', '0.70 kg/m', '21 bar'] },
        { cells: ['2-1/2"', 'DN65', '64.5 mm', '3.0 mm', '≈ 106 mm', '0.75 kg/m', '21 bar'] },
        { cells: ['3"', 'DN80', '76 mm', '3.0 mm', '≈ 124 mm', '1.07 kg/m', '17 bar'] },
        { cells: ['4"', 'DN100', '104 mm', '3.5 mm', '≈ 169 mm', '1.45 kg/m', '17 bar'] },
        { cells: ['6"', 'DN150', '155 mm', '4.0 mm', '≈ 250 mm', '2.3 kg/m', '14 bar'], highlight: true },
        { cells: ['8"', 'DN200', '205 mm', '4.5 mm', '≈ 329 mm', '3.5 kg/m', '15 bar'] },
        { cells: ['10"', 'DN250', '254 mm', '4.2 mm', '≈ 406 mm', '3.8 kg/m', '14 bar'] },
        { cells: ['12"', 'DN300', '305 mm', '4.3 mm', '≈ 486 mm', '4.6 kg/m', '14 bar'] },
        { cells: ['14"', 'DN350', '355 mm', '4.3 mm', '≈ 564 mm', '5.25 kg/m', '14 bar'] },
        { cells: ['16"', 'DN400', '405 mm', '4.3 mm', '≈ 643 mm', '6.2 kg/m', '10 bar'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The chart is for our <a href="/p/tpu-lay-flat-dewatering-hose">TPU dewatering and transfer hose</a> and <a href="/p/tpu-lay-flat-drinking-water-hose">TPU drinking-water hose</a>, which share sizes and ratings; burst pressure is three times working. Bores up to 24" are made to order. Flat width is our approximation from the published bore and wall — measure a sample if it matters.',
    },
    {
      type: 'direct_answer',
      question: 'What is the flat width of a 6 inch lay flat hose?',
      answer:
        'About 25 cm. Flat width is roughly half the hose circumference — about 1.6 times the bore — so a 6" (155 mm bore) lay flat hose lies about 250 mm wide, a 4" about 170 mm and a 12" about 490 mm.',
    },

    { type: 'section_head', number: '/02', title: 'Other lay flat families.', anchor: 'families' },
    {
      type: 'comparison_table',
      caption: 'Working pressure by size across our lay flat families (as published)',
      columns: ['Size', 'NBR discharge', 'TPU well riser', 'TPU slurry drag', 'TPU slurry supply'],
      rows: [
        { cells: ['1-1/2"', '10 bar', '30 bar', '—', '—'] },
        { cells: ['2"', '10 bar', '30 bar', '—', '—'] },
        { cells: ['3"', '10 bar', '27 bar', '17 bar', '—'] },
        { cells: ['4"', '10 bar', '26 bar', '12 bar', '—'] },
        { cells: ['5"', '10 bar', '25 bar', '10 bar', '14 bar'] },
        { cells: ['6"', '10 bar', '25 bar', '10 bar', '14 bar'], highlight: true },
        { cells: ['8"', '10 bar', '20 bar', '10 bar', '15 bar'] },
        { cells: ['10"', '10 bar', '18 bar', '—', '14 bar'] },
        { cells: ['12"', '10 bar', '—', '—', '14 bar'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The <a href="/p/nbr-lay-flat-discharge-hose">NBR discharge hose</a> is 10 bar working, 30 bar burst in every size; the <a href="/p/tpu-lay-flat-well-riser-hose">TPU well riser hose</a> also starts at 40 bar at 1-1/4"; the <a href="/p/tpu-lay-flat-slurry-drag-hose">slurry drag hose</a> is 21 bar at 2-1/2" and comes in 5-1/2" and 7-1/2" too; and the <a href="/p/tpu-lay-flat-slurry-supply-hose">slurry supply hose</a> runs to 16" (10 bar). The <a href="/p/tpu-lay-flat-concrete-placement-hose">concrete placement hose</a> is a heavier-walled family: 3" to 5", with a high-pressure class at 75–85 bar.',
    },

    { type: 'section_head', number: '/03', title: 'Measuring a hose you already have.', anchor: 'measuring' },
    {
      type: 'figure',
      imageId: FIG['fig-size-flat-width'],
      captionPrefix: 'FIG. 01',
      caption: 'Flat width, measured edge to edge across the flattened hose, identifies the size without cutting it.',
      aspectRatio: '16/9',
    },
    {
      type: 'prose',
      html: '<ol><li><strong>Flat width</strong>: lay the hose flat and measure edge to edge. Divide by about 1.6 for the approximate bore, then pick the nearest nominal size.</li><li><strong>Inside diameter</strong>: at a cut end, round the hose out and measure across the bore with a caliper or rule.</li><li><strong>Wall thickness</strong>: measure at a cut end with a caliper — couplings are matched to it.</li><li><strong>Coupling</strong>: identify the type (Storz, camlock, Bauer, grooved, flanged) and size at the end, and note any thread.</li><li><strong>Markings</strong>: many hoses carry a printed or embossed line with size and pressure; photograph it.</li></ol>',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Inch, DN and the shank.',
      body: 'Nominal inch sizes and DN map one to one in the chart, but the actual bore can differ by a few millimetres between makers and classes — 6" can be 152.4 mm or 155 mm. A coupling shank must suit the actual bore and wall of the hose it goes into, which is why we ask for both.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What sizes does lay flat hose come in?', answer: 'Commonly from 1-1/2" (DN40) to 16" (DN400), with 1", 1-1/4" and up to 24" made for particular uses.' },
        { question: 'How heavy is 12 inch lay flat hose?', answer: 'About 4.6 kg per metre empty for our TPU transfer hose — under five tonnes per kilometre.' },
        { question: 'Is DN the same as inside diameter?', answer: 'DN is a nominal size. The actual inside diameter is close to it but can differ by a few millimetres; check the listing.' },
        { question: 'How do I find the size of a lay flat hose without cutting it?', answer: 'Measure the flat width and divide by about 1.6 to estimate the bore, then pick the nearest nominal size.' },
        { question: 'Why does pressure rating fall as size increases?', answer: 'For the same reinforcement, a larger bore puts more load on each yarn at the same pressure. See our guide to lay flat hose pressure ratings.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Lay flat hoses with published size tables',
      skus: ['IH-LF-TDW', 'IH-LF-TPW', 'IH-LF-NBR', 'IH-LF-TWR', 'IH-LF-TSD', 'IH-LF-TSS', 'IH-LF-TCP', 'IH-LF-SEP'],
    },
    {
      type: 'category_link',
      slug: 'lay-flat-hoses',
      label: 'Lay flat hoses',
      blurb: 'Every lay flat family, with full size and part number tables on each listing.',
    },
    {
      type: 'related_articles',
      slugs: ['lay-flat-hose-pressure-ratings', 'lay-flat-hose-flow-and-friction-loss', 'lay-flat-hose-couplings-guide', 'lay-flat-hose-rfq-checklist', 'lay-flat-hose-guide'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'Sizes, walls, weights and pressures from the published size tables of the Indus lay flat listings. Flat widths are approximate.',
    },
    {
      type: 'cta_block',
      heading: 'Not sure which size you have?',
      body: 'Send the flat width, a photo of the coupling and any marking. We will identify the size and quote a match.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
