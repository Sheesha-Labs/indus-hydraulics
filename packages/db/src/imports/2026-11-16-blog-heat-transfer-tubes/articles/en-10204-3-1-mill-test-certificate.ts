import type { BlogArticleSeed } from '../shared'

/**
 * EN 10204 inspection documents. Sources: EN 10204 document types (2.1, 2.2, 3.1, 3.2) as generally
 * defined; the catalogue's certification line (3.1 on request, third-party inspection by arrangement);
 * test lists from the tube standards on our listings. General guidance; no project-specific claims.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'en-10204-3-1-mill-test-certificate',
  title: 'Reading a mill test certificate to EN 10204 3.1',
  excerpt:
    'Every length of pressure tube should be traceable to a certificate. What EN 10204 types 2.1, 2.2, 3.1 and 3.2 mean, what a 3.1 certificate for tube should contain, and the checks to make before the tube goes into a bundle.',
  categorySlug: 'heat-transfer-tubes',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'EN 10204 3.1 Certificate for Tube',
  seoDescription:
    'What an EN 10204 3.1 mill test certificate shows for boiler and exchanger tube, how 3.1 differs from 2.2 and 3.2, and what to check on delivery.',
  focusKeyword: 'en 10204 3.1 certificate',
  publishedAt: '2026-11-16T10:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'EN 10204 defines four inspection documents: 2.1, 2.2, 3.1 and 3.2.',
        'A 3.1 certificate reports specific test results on the delivered product and is validated by the mill’s inspection department, independent of production.',
        'A 3.2 certificate adds validation by the purchaser’s or a third-party inspector.',
        'For tube it should show the standard and grade, heat number, sizes, chemistry, mechanical results and the pressure or NDT test.',
        'Match heat numbers on the tube to the certificate on delivery.',
      ],
    },
    {
      type: 'lead',
      html: 'A tube’s grade cannot be seen. Its chemistry, strength and test history live on paper — the mill certificate — and the link between paper and tube is the heat number stencilled or stamped on each length. For pressure equipment, the type of certificate matters as much as what is written on it.',
    },
    {
      type: 'direct_answer',
      question: 'What is an EN 10204 3.1 certificate?',
      answer:
        'An inspection certificate issued by the manufacturer stating that the delivered product complies with the order, with the results of specific tests on that product. It is validated by the manufacturer’s authorised inspection representative, who is independent of the manufacturing department. A 3.2 certificate is the same document validated also by the purchaser’s or a third-party inspector.',
    },

    { type: 'section_head', number: '/01', title: 'The four document types.', anchor: 'types' },
    {
      type: 'comparison_table',
      caption: 'EN 10204 inspection documents',
      columns: ['Type', 'Document', 'Test results', 'Validated by'],
      rows: [
        { cells: ['2.1', 'Declaration of compliance with the order', 'None', 'Manufacturer'] },
        { cells: ['2.2', 'Test report', 'Non-specific (typical production)', 'Manufacturer'] },
        { cells: ['3.1', 'Inspection certificate 3.1', 'Specific, on the delivered product', 'Manufacturer’s independent inspection'] },
        { cells: ['3.2', 'Inspection certificate 3.2', 'Specific, on the delivered product', 'Manufacturer and purchaser’s or third-party inspector'] },
      ],
      },
    {
      type: 'paragraph',
      html: 'For boiler, exchanger and pressure-piping tube, 3.1 is the normal minimum. Projects under third-party inspection, or some PED and class requirements, call for 3.2.',
    },

    { type: 'section_head', number: '/02', title: 'What a tube certificate shows.', anchor: 'contents' },
    {
      type: 'prose',
      html: '<ul><li>Mill, certificate number and date; purchase order reference.</li><li>Standard and grade — for example ASTM A179, A213 TP316L or EN 10216-2 P265GH — and the delivery condition or heat treatment.</li><li>OD, wall (minimum or average), length and quantity.</li><li>Heat number (and lot), tying the certificate to the tube.</li><li>Chemical analysis: heat and, where required, product analysis.</li><li>Mechanical results: tensile, yield, elongation, hardness — as the standard requires.</li><li>Technological tests: flattening, flaring, flange, expansion.</li><li>Hydrostatic test pressure, or the NDT method (eddy current, ultrasonic).</li><li>Any supplementary tests on the order: intergranular corrosion, impact, PMI.</li><li>The inspection representative’s stamp and signature.</li></ul>',
    },

    { type: 'section_head', number: '/03', title: 'Checks on delivery.', anchor: 'checks' },
    {
      type: 'prose',
      html: '<ol><li>Read the heat numbers on the tubes and find each on a certificate.</li><li>Compare standard, grade, size and wall with the order.</li><li>Check the results against the standard’s limits — some grades, like A179 and A192, are controlled by hardness rather than tensile.</li><li>Confirm the pressure or NDT test was done, and any supplementary tests you ordered.</li><li>Keep the certificates with the equipment file.</li></ol>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the difference between 3.1 and 3.2?', answer: 'A 3.2 certificate is also validated by the purchaser’s or a third-party inspector; 3.1 is validated by the manufacturer’s independent inspection department.' },
        { question: 'Is a 2.2 test report enough for pressure tube?', answer: 'Usually not: 2.2 gives typical, not specific, results. Pressure equipment normally needs 3.1 or 3.2.' },
        { question: 'How is a certificate linked to the tube?', answer: 'Through the heat number marked on each tube, which appears on the certificate.' },
        { question: 'Do you supply 3.1 certificates?', answer: 'Yes, on request with every order; third-party inspection and 3.2 can be arranged.' },
        { question: 'Can a stockist issue a 3.1?', answer: 'A stockist passes on the mill’s certificate and keeps traceability; the 3.1 itself comes from the manufacturer.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Certified tube in the catalogue',
      skus: ['IH-TF-CB-CS', 'IH-TF-AB-AL', 'IH-TF-SS-AUS', 'IH-TF-CN-CUN'],
    },
    { type: 'category_link', slug: 'seamless-finned-tubes-uae', label: 'Seamless Finned Tubes', blurb: 'All heat-transfer tube, with mill certificates on request.' },
    {
      type: 'related_articles',
      slugs: ['heat-transfer-tube-buyers-guide', 'a179-vs-a192-vs-a210-vs-a213'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-16',
      note: 'Summary of EN 10204 document types; the standard and your project specification govern.',
    },
    {
      type: 'cta_block',
      heading: 'Need 3.2 or third-party inspection?',
      body: 'Say so with the enquiry. We arrange inspection and the certificates your project needs.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
