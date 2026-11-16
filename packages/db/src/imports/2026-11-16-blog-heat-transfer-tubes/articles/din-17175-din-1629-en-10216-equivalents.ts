import type { BlogArticleSeed } from '../shared'

import { DIN_EN } from '../tables'

/**
 * DIN to EN. Sources: approved grade data (DIN 17175 grades and their EN 10216-2 successors with
 * yield and tensile, ./tables.ts), rule D7 (DIN 17175 and DIN 1629 marked superseded; cross-references
 * indicative), standards lists on the seamless listings (DIN 1629 → EN 10216-1, DIN 2391 → EN 10305-1).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'din-17175-din-1629-en-10216-equivalents',
  title: 'From DIN 17175 and DIN 1629 to EN 10216: what replaced what',
  excerpt:
    'Old drawings still call up St35.8, St45.8, 15Mo3 and 13CrMo44 to DIN 17175, and St37.0 or St52.0 to DIN 1629. Those standards are withdrawn. Which EN 10216 grades replaced them, how close the match is, and how to order tube for an old drawing.',
  categorySlug: 'heat-transfer-tubes',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'DIN 17175 and DIN 1629 to EN 10216',
  seoDescription:
    'DIN 17175 and DIN 1629 tube grades and their EN 10216 replacements: St35.8 to P235GH, St45.8 to P265GH, 15Mo3 to 16Mo3, 13CrMo44 to 13CrMo4-5.',
  focusKeyword: 'din 17175 equivalent',
  publishedAt: '2026-11-16T09:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'DIN 17175 (seamless tube for elevated temperatures) is superseded by EN 10216-2.',
        'DIN 1629 (seamless tube for general pressure purposes) is superseded by EN 10216-1.',
        'St35.8 maps to P235GH, St45.8 to P265GH, 15Mo3 to 16Mo3, 13CrMo44 to 13CrMo4-5 and 10CrMo910 to 10CrMo9-10.',
        'The successors are close but not identical: limits and test requirements changed.',
        'Cross-references are indicative. For pressure equipment, order to the current standard and confirm the substitution with the designer.',
      ],
    },
    {
      type: 'lead',
      html: 'Plant built in the 1980s and 1990s, especially boilers and HRSGs of German design, still comes with drawings and spare-part lists in DIN grades. Mills now make tube to the European standards that replaced them, so a spare order has to translate the old grade into the new one — and the translation is close, not exact.',
    },
    {
      type: 'direct_answer',
      question: 'What is the EN equivalent of DIN 17175 St35.8?',
      answer:
        'P235GH to EN 10216-2. DIN 17175 was superseded by EN 10216-2, and its grades map as St35.8 → P235GH, St45.8 → P265GH, 15Mo3 → 16Mo3, 13CrMo44 → 13CrMo4-5 and 10CrMo910 → 10CrMo9-10. The successors are close but not identical, so treat them as indicative and confirm substitutions for pressure equipment.',
    },

    { type: 'section_head', number: '/01', title: 'DIN 17175 to EN 10216-2.', anchor: 'din17175' },
    {
      type: 'comparison_table',
      caption: 'DIN 17175 grades and their EN 10216-2 successors (yield and tensile, MPa: DIN / EN)',
      columns: ['DIN 17175', 'EN 10216-2', 'Min yield', 'Tensile range'],
      rows: DIN_EN,
    },
    {
      type: 'paragraph',
      html: 'The pairs share their material numbers, and their strengths line up closely. The EN standard tightened some chemistry limits — sulphur and phosphorus, for example — and set its own testing scheme, with test categories (TC1, TC2) that decide the extent of non-destructive testing. When ordering to EN 10216-2, say which test category you need.',
    },

    { type: 'section_head', number: '/02', title: 'DIN 1629 to EN 10216-1.', anchor: 'din1629' },
    {
      type: 'paragraph',
      html: 'DIN 1629 covered seamless circular tube of non-alloy steel for general pressure purposes, in grades such as St37.0, St44.0 and St52.0. It has been superseded by EN 10216-1, whose grades are named P195TR, P235TR and P265TR (with TR1 and TR2 qualities). Because the grade structure changed more than for DIN 17175, check the substitution on each drawing rather than relying on a single table.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Other withdrawn DIN tube standards.',
      body: 'Precision tube to DIN 2391 is now EN 10305-1. Stainless tube to DIN 17456 and 17458 is covered by EN 10216-5. The same rule applies: order to the current standard and check the grade.',
    },

    { type: 'section_head', number: '/03', title: 'Ordering for an old drawing.', anchor: 'ordering' },
    {
      type: 'prose',
      html: '<ol><li>Write the original DIN grade and the proposed EN grade side by side on the enquiry.</li><li>Ask the plant owner or designer to accept the substitution — for pressure equipment under PED or a boiler code it is their decision.</li><li>Give OD and wall as on the drawing, and the EN test category.</li><li>Ask for a 3.1 certificate to the EN standard, which will name the EN grade.</li></ol><p>American equivalents (A179, A192, A210, A213) are indicative too; see <a href="/blog/a179-vs-a192-vs-a210-vs-a213">A179 vs A192 vs A210 vs A213</a>.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is DIN 17175 still valid?', answer: 'No. It has been withdrawn and superseded by EN 10216-2.' },
        { question: 'What replaced DIN 1629?', answer: 'EN 10216-1, seamless steel tubes for pressure purposes — non-alloy steels with specified room-temperature properties.' },
        { question: 'What is 15Mo3 in EN?', answer: '16Mo3 to EN 10216-2, material number 1.5415.' },
        { question: 'Is P235GH the same as St35.8?', answer: 'It is the direct successor with the same material number lineage and similar strength, but the standards differ in detail. Treat it as an equivalent to be confirmed.' },
        { question: 'Can you supply tube to an old DIN drawing?', answer: 'Yes: we quote the current EN grade, list the original, and supply with a 3.1 certificate.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Seamless tube in the catalogue',
      skus: ['IH-TF-CB-CS', 'IH-TF-AB-AL', 'IH-TF-PM-PCD'],
    },
    { type: 'category_link', slug: 'seamless-steel-tubes-pipes', label: 'Seamless steel tubes and pipes', blurb: 'Boiler, superheater, exchanger, stainless and precision tube.' },
    {
      type: 'related_articles',
      slugs: ['a179-vs-a192-vs-a210-vs-a213', 'heat-transfer-tube-buyers-guide'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-16',
      note: 'Equivalents are indicative; check each against the tender and the current standard edition.',
    },
    {
      type: 'cta_block',
      heading: 'Old drawing, new tube?',
      body: 'Send the DIN grade, OD, wall and quantity. We quote the current EN grade with a 3.1 certificate.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
