import type { BlogArticleSeed } from '../shared'

import { SS_GRADES } from '../tables'

/**
 * Stainless exchanger tube. Sources: approved grade data (A213, A789, A268 chemistry and minimum
 * tensile, ./tables.ts) and approved data for IH-TF-SS-AUS / IH-TF-SS-FER (A249 extra tests, A1016
 * hydro, services: duplex for crude/vacuum overheads and offshore chloride service, 317L or 316L with
 * ≥2.5 % Mo for naphthenic acid, TP439 to A803 for feedwater heaters).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'stainless-heat-exchanger-tube-grades',
  title: 'Stainless heat exchanger tube: A213, A249, A268 and A789 grades',
  excerpt:
    'Seamless or welded, austenitic, ferritic or duplex: how the four main ASTM stainless tube standards divide up, what each grade is chosen for in refinery, gas-plant and power service, and the tests that come with them.',
  categorySlug: 'heat-transfer-tubes',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Stainless Heat Exchanger Tube Grades',
  seoDescription:
    'Stainless heat exchanger tube compared: A213 seamless, A249 welded, A268 ferritic and A789 duplex grades, chemistry, uses and tests.',
  focusKeyword: 'a249 vs a213',
  publishedAt: '2026-11-16T09:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A213 is seamless austenitic (and alloy) tube; A249 is welded austenitic tube; A268 is ferritic and martensitic; A789 is duplex.',
        'A249 adds reverse-bend and flange tests on the weld, and an optional weld-decay test.',
        'Low-carbon L grades (304L, 316L) resist sensitisation when the tube is welded into the tube sheet.',
        'Duplex 2205 and super duplex 2507 are used for chloride-bearing cooling and crude/vacuum overhead condensers.',
        'Ferritic TP439 (to A803) is a common feedwater-heater tube.',
      ],
    },
    {
      type: 'lead',
      html: 'Stainless tube is chosen when carbon steel would corrode or foul: chloride-bearing cooling water, sour and acidic process streams, and feedwater systems where iron pickup matters. The choice is in two steps — the family of stainless, then seamless or welded — and each step has its own ASTM standard.',
    },
    {
      type: 'direct_answer',
      question: 'What is the difference between A213 and A249 tube?',
      answer:
        'ASTM A213 covers seamless austenitic stainless (and ferritic alloy) boiler, superheater and heat-exchanger tube. ASTM A249 covers welded austenitic stainless tube for the same duties, made from strip and welded without filler, with extra tests on the weld such as reverse-bend and flange tests. Grades such as TP316L appear in both; welded tube is usually more economical in long runs.',
    },

    { type: 'section_head', number: '/01', title: 'The grades.', anchor: 'grades' },
    {
      type: 'comparison_table',
      caption: 'Common stainless exchanger tube grades (approved grade data; % by weight)',
      columns: ['Standard', 'Grade', 'UNS', 'Cr %', 'Ni %', 'Mo %', 'Min tensile'],
      rows: SS_GRADES,
    },

    { type: 'section_head', number: '/02', title: 'Austenitic: 304L, 316L, 321, 347.', anchor: 'austenitic' },
    {
      type: 'paragraph',
      html: 'TP304L and TP316L are the everyday exchanger grades; the low carbon keeps the heat-affected zone of the tube-to-tubesheet weld from sensitising. Molybdenum in 316L improves resistance to pitting; for naphthenic-acid service, 317L or 316L with at least 2.5 % Mo is specified. TP321 and TP347, stabilised with titanium or niobium, are used where the tube runs hot. All are solution-treated at 1040 °C minimum and cooled rapidly. Austenitic grades are prone to chloride stress-corrosion cracking in hot, chloride-bearing water — which is where duplex comes in.',
    },

    { type: 'section_head', number: '/03', title: 'Duplex and super duplex.', anchor: 'duplex' },
    {
      type: 'paragraph',
      html: 'Duplex 2205 (S31803 / S32205) and super duplex 2507 (S32750), made to ASTM A789, combine high strength — 655 and 800 MPa minimum tensile — with resistance to chloride stress-corrosion cracking. They are the usual choice for crude and vacuum overhead condensers and for offshore platform exchangers in chloride service. Bends in duplex U-tubes need ferrite and sigma-phase checks, covered in <a href="/blog/u-bend-tubes-bend-radius-wall-thinning">U-bend tubes</a>.',
    },

    { type: 'section_head', number: '/04', title: 'Ferritic and martensitic.', anchor: 'ferritic' },
    {
      type: 'paragraph',
      html: 'ASTM A268 covers ferritic and martensitic stainless tube: TP405, 409 and 410 at around 12 % chromium, TP430 and TP439 at 17–19 %, and super-ferritic 26-3-3 (S44660). Ferritic grades do not suffer chloride stress-corrosion cracking like the austenitics. TP439 under A803 is widely used for power-plant feedwater heaters.',
    },

    { type: 'section_head', number: '/05', title: 'Tests.', anchor: 'tests' },
    {
      type: 'paragraph',
      html: 'Flattening, flaring, hardness and tension tests come with A213 and A1016; each tube is hydrostatically tested or given an electric test (eddy current or ultrasonic). A249 adds reverse-bend and flange tests on the weld, and an optional weld-decay test (supplementary S7). State on the order if you need eddy current on every tube, intergranular corrosion testing, or positive material identification.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is welded A249 tube as good as seamless A213?', answer: 'For most exchanger duties, yes, which is why it is widely used. Some specifications call for seamless; follow the data sheet.' },
        { question: 'When should I use duplex tube?', answer: 'Where chloride stress-corrosion cracking is a risk: seawater or brackish cooling, crude and vacuum overheads, offshore chloride service.' },
        { question: 'What is TP439 used for?', answer: 'Feedwater heaters in power plants, under ASTM A803.' },
        { question: 'Why specify 316L rather than 316?', answer: 'The low carbon limits sensitisation when the tube is welded, which preserves corrosion resistance at the tube-sheet joint.' },
        { question: 'What is the minimum tensile of 2205?', answer: '655 MPa for S32205 and 620 MPa for S31803 under A789.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Stainless tube in the catalogue',
      skus: ['IH-TF-SS-AUS', 'IH-TF-SS-FER', 'IH-TF-SS-XL', 'IH-TF-US-AUS', 'IH-TF-US-FER'],
    },
    { type: 'category_link', slug: 'stainless-steel-heat-exchanger-tubes', label: 'Stainless steel tubes and pipes', blurb: 'Austenitic, duplex and ferritic exchanger tube by OD and BWG.' },
    {
      type: 'related_articles',
      slugs: ['a179-vs-a192-vs-a210-vs-a213', 'u-bend-tubes-bend-radius-wall-thinning', 'copper-nickel-vs-admiralty-brass-seawater-tubes'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-16',
      note: 'Chemistry and minimum tensile from the ASTM standards as compiled in our approved grade data.',
    },
    {
      type: 'cta_block',
      heading: 'Choosing a stainless grade?',
      body: 'Send the process and cooling-water conditions with the tube size. We quote seamless or welded tube to the grade you need.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
