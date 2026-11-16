import type { BlogArticleSeed } from '../shared'

import { ALLOY_GRADES, CS_GRADES } from '../tables'

/**
 * Carbon and alloy boiler/exchanger tube grades. Sources: approved grade data (ASTM A179, A192, A210,
 * A213 chemistry and minimum mechanicals, ./tables.ts), rule D7 (no mandatory tensile for A179/A192;
 * no T91 hardness band), and the approved data for IH-TF-CB-CS / IH-TF-AB-AL (tests, services).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'a179-vs-a192-vs-a210-vs-a213',
  title: 'A179 vs A192 vs A210 vs A213: choosing boiler and exchanger tube',
  excerpt:
    'Four ASTM standards cover most carbon and alloy steel tube in exchangers, boilers and superheaters. What each is for, how they differ in chemistry and strength, which tests they carry, and how to choose — with the grade tables.',
  categorySlug: 'heat-transfer-tubes',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'A179 vs A192 vs A210 vs A213 Tube',
  seoDescription:
    'ASTM A179, A192, A210 and A213 boiler and heat exchanger tube compared: chemistry, strength, tests, T11, T22 and T91, and which to specify.',
  focusKeyword: 'a179 vs a192',
  publishedAt: '2026-11-16T09:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A179 is cold-drawn low-carbon tube for exchangers and condensers; A192 is the same chemistry made for high-pressure boiler service.',
        'Neither A179 nor A192 has a mandatory minimum tensile: hardness controls them.',
        'A210 is medium-carbon boiler and superheater tube, in Grades A-1 and C, with minimum tensile and yield.',
        'A213 covers ferritic alloy (T11, T22, T91…) and austenitic stainless boiler, superheater and exchanger tube.',
        'Pick by service: the design code, pressure and metal temperature on the data sheet decide.',
      ],
    },
    {
      type: 'lead',
      html: 'Most steel tube in a refinery exchanger, a boiler or an HRSG is ordered to one of four ASTM standards. They look interchangeable on a quick read — same sizes, similar names — but they are written for different duties, and swapping one for another changes what the mill must test and guarantee.',
    },
    {
      type: 'direct_answer',
      question: 'What is the difference between A179 and A192 tube?',
      answer:
        'Both are seamless low-carbon steel tube with almost the same chemistry. ASTM A179 is cold-drawn tube for tubular heat exchangers and condensers; ASTM A192 is boiler and superheater tube for high-pressure service. Neither has a mandatory minimum tensile strength — hardness controls them. Specify A179 for exchanger bundles and A192 where the boiler code calls for it.',
    },

    { type: 'section_head', number: '/01', title: 'The carbon steels.', anchor: 'carbon' },
    {
      type: 'comparison_table',
      caption: 'Carbon steel tube grades (approved grade data; % by weight)',
      columns: ['Grade', 'C %', 'Mn %', 'Min tensile', 'Min yield', 'Max hardness'],
      rows: CS_GRADES,
    },
    {
      type: 'paragraph',
      html: '<strong>A179</strong> is the default exchanger and condenser tube and the usual base tube for finned air-cooler bundles. It is cold drawn and heat treated after the final draw so it can be expanded into a tube sheet, and it is tested by flattening, flaring, flange, hardness and hydrostatic tests. <strong>A192</strong> has the same carbon and manganese range and adds a silicon limit; it is made for boiler and superheater tubes at high pressure. <strong>A210</strong> is medium-carbon tube with real strength minimums: Grade A-1 at 415 MPa tensile and Grade C at 485 MPa, used for boiler, economiser and water-wall tube.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'No tensile minimum is not a weakness.',
      body: 'A179 and A192 are controlled by hardness, not tensile. Design codes give them allowable stresses all the same. Do not write a tensile minimum on the order unless your design asks for one.',
    },

    { type: 'section_head', number: '/02', title: 'The alloy steels under A213.', anchor: 'alloy' },
    {
      type: 'comparison_table',
      caption: 'A213 ferritic alloy grades (approved grade data)',
      columns: ['Grade', 'UNS', 'Cr %', 'Mo %', 'Min tensile', 'Min yield'],
      rows: ALLOY_GRADES,
    },
    {
      type: 'paragraph',
      html: 'Chrome-moly grades raise creep strength and oxidation resistance as the metal temperature rises: T11 and T12 for moderate superheater temperatures, T22 above them, T5 and T9 where sulphidation matters in fired heaters, and T91 for the hottest superheater and reheater sections. T91 is supplied normalised and tempered — never annealed — and its tempering must be controlled in fabrication. A213 also covers austenitic stainless tube, compared in <a href="/blog/stainless-heat-exchanger-tube-grades">stainless exchanger tube grades</a>.',
    },

    { type: 'section_head', number: '/03', title: 'Testing.', anchor: 'testing' },
    {
      type: 'paragraph',
      html: 'Under the general requirements (ASTM A450 for carbon tube, A1016 for alloy and stainless), each tube is hydrostatically tested or given an electric non-destructive test at the mill’s option unless the order says which. Some mills recommend combining ultrasonic and eddy-current testing for A209 and A213. If the project wants both, or 100 % eddy current, write it on the order.',
    },

    { type: 'section_head', number: '/04', title: 'Choosing.', anchor: 'choosing' },
    {
      type: 'prose',
      html: '<ul><li>Shell-and-tube exchanger or condenser, carbon steel: <strong>A179</strong>.</li><li>Boiler tube at high pressure, low carbon: <strong>A192</strong>.</li><li>Boiler, economiser or water wall needing a strength minimum: <strong>A210 A-1 or C</strong>.</li><li>Superheater, reheater or fired-heater coil at high metal temperature: <strong>A213 T11, T22, T5, T9 or T91</strong>, per the design.</li></ul><p>European equivalents (P235GH, P265GH, 16Mo3, 13CrMo4-5, 10CrMo9-10) are in <a href="/blog/din-17175-din-1629-en-10216-equivalents">DIN to EN 10216</a>. Cross-references are indicative; we check each against the tender.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can A192 replace A179?', answer: 'The chemistry is almost the same, but the standards differ in purpose and tests. Substitute only with the purchaser’s or designer’s approval.' },
        { question: 'What is the minimum tensile strength of A179?', answer: 'A179 has no mandatory minimum tensile strength; hardness (72 HRB maximum) controls it.' },
        { question: 'What is the difference between A210 A-1 and C?', answer: 'Grade C has more carbon and manganese allowed and higher minimums: 485 MPa tensile and 275 MPa yield, against 415 and 255 MPa for A-1.' },
        { question: 'Is T91 annealed?', answer: 'No. T91 is normalised and tempered; annealing is not permitted.' },
        { question: 'Which standard covers alloy boiler tube?', answer: 'ASTM A213 for ferritic alloy grades such as T11, T22 and T91, with A209 for carbon-molybdenum T1 grades.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Boiler and exchanger tube in the catalogue',
      skus: ['IH-TF-CB-CS', 'IH-TF-AB-AL', 'IH-TF-UC-CS', 'IH-TF-UA-AL'],
    },
    { type: 'category_link', slug: 'carbon-steel-boiler-heat-exchanger-tubes', label: 'Carbon steel boiler and exchanger tubes', blurb: 'A179, A192 and A210 tube by OD and BWG.' },
    { type: 'category_link', slug: 'alloy-steel-boiler-superheater-tubes', label: 'Alloy steel boiler and superheater tubes', blurb: 'A213 and A209 chrome-moly tube.' },
    {
      type: 'related_articles',
      slugs: ['heat-transfer-tube-buyers-guide', 'stainless-heat-exchanger-tube-grades', 'din-17175-din-1629-en-10216-equivalents'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-16',
      note: 'Chemistry and minimum mechanicals from the ASTM standards as compiled in our approved grade data. Check the current edition for a contract.',
    },
    {
      type: 'cta_block',
      heading: 'Tube list ready?',
      body: 'Send the standard and grade, OD, wall (min or average), length and quantity. We quote with mill certificates.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
