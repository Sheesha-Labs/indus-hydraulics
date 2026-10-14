import type { BlogArticleSeed } from '../shared'

/**
 * Proof load testing of lifting gear. Checked: RR-C-271F Table VIII (proof 2.2 × WLL, break 5 ×
 * WLL — read in the PDF, 2026-10-14 earlier agent, high); EN 13889 shackles proof 2 × WLL,
 * safety factor 6 (maker datasheet, high); forged turnbuckle maker proof 2.5 × WLL, design factor 5
 * (maker catalogue, high); HSE INDG422 on LOLER thorough examination and testing at the competent
 * person's discretion (high). Chain ratios taken from OUR live tables (G100 6 mm: WLL 1.4 t, proof
 * 35 kN, MBL 57 kN), not from EN text (not verified this session).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'proof-load-testing-lifting-gear',
  title: 'Proof load testing of lifting gear: what it proves, what the factors are, and when it is needed',
  excerpt:
    'Every rated shackle, chain and turnbuckle has three numbers behind it: the working load limit, the proof load it was tested to, and the breaking load it is designed to exceed. What a proof test is, how the factors differ between product standards, what the certificate should show, and when a used item needs testing again rather than just examining.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Proof Load Testing of Lifting Gear: Factors and When Needed',
  seoDescription:
    'What proof load testing of lifting gear proves: proof load vs WLL vs breaking load, factors in RR-C-271, EN 13889 and maker standards, our chain tables, what the certificate should show, and when used gear needs re-testing.',
  focusKeyword: 'proof load test',
  publishedAt: '2026-10-14T10:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A proof test loads an item to a set multiple of its WLL without permanent deformation — it proves this item was made right, not how strong it is.',
        'Factors differ by product standard: 2.2 × WLL for RR-C-271 shackles, 2 × for EN 13889 shackles, 2.5 × for one maker’s turnbuckles.',
        'The breaking load is a design figure several times the WLL — it is never a working figure.',
        'The manufacturer’s certificate should state the proof load applied, or the standard that sets it.',
        'In service, thorough examination is the routine; testing is at the competent person’s discretion — typically after repair or modification.',
      ],
    },
    {
      type: 'lead',
      html: 'A certificate that says “proof tested” is reassuring, but it is easy to read more into it than it says. A proof test shows that a particular item survived a load well above its working load limit without stretching — that it was made from the right steel, heat-treated properly and assembled correctly. It does not show how much the item could carry, and it is no substitute for using it correctly. This guide explains the numbers. For the three numbers in general, see <a href="/blog/working-load-limit-vs-breaking-strength">working load limit vs breaking strength</a>.',
    },

    { type: 'section_head', number: '/01', title: 'Three numbers.', anchor: 'numbers' },
    {
      type: 'comparison_table',
      caption: 'WLL, proof load and breaking load',
      columns: ['Figure', 'What it is', 'Used for'],
      rows: [
        { cells: ['Working load limit (WLL)', 'The most the maker rates the item to carry in service', 'Every lift — the only working figure'], highlight: true },
        { cells: ['Proof load', 'A test load, a multiple of WLL, applied without permanent deformation', 'Proving each item (or a sample) at manufacture or after repair'] },
        { cells: ['Breaking load', 'The minimum load at which the design fails', 'Design and type testing — never a working figure'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'What is a proof load test?',
      answer:
        'A test in which a lifting item is loaded to a set multiple of its working load limit — typically about 2 to 2.5 times, depending on the product standard — and checked for permanent deformation or cracks. It proves the individual item was made correctly; it does not set its working load, which stays the WLL.',
    },

    { type: 'section_head', number: '/02', title: 'The factors differ.', anchor: 'factors' },
    {
      type: 'comparison_table',
      caption: 'Proof and breaking factors (as published by the standard or maker named)',
      columns: ['Product and source', 'Proof load', 'Breaking load'],
      rows: [
        { cells: ['Shackles to US Federal Spec RR-C-271', '2.2 × WLL', '5 × WLL minimum'] },
        { cells: ['Grade 6 shackles to EN 13889 (maker’s data)', '2 × WLL', 'Safety factor 6'] },
        { cells: ['One maker’s forged turnbuckles', '2.5 × WLL', 'Design factor 5'] },
        { cells: ['Our Grade 100 chain, 6 mm (live table)', '35 kN (WLL 1.4 t)', '57 kN'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Because the factors differ, a proof load figure only means something alongside the standard it was tested to. Our size tables publish WLL and, where the maker supplies them, proof and breaking loads — the <a href="/p/grade-100-alloy-lifting-chain">Grade 100 chain</a> table, for example, gives all three for each size. See <a href="/blog/chain-grades-explained">chain grades explained</a>.',
    },

    { type: 'section_head', number: '/03', title: 'What the certificate should show.', anchor: 'certificate' },
    {
      type: 'prose',
      html: '<ul><li>The item, its size and WLL, and its traceability code or batch.</li><li>The proof load applied — or the standard that sets it — and the result.</li><li>The maker’s identity and the date.</li></ul><p>See <a href="/blog/lifting-gear-test-certificate">lifting gear test certificates</a> for the difference between a manufacturer’s certificate, a declaration of conformity and a report of thorough examination.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Re-testing used gear.', anchor: 'retesting' },
    {
      type: 'paragraph',
      html: 'In service, the routine is <strong>thorough examination</strong>, not proof testing. Under the UK’s LOLER regime — widely used as a Gulf baseline — accessories are examined at least every 6 months, and an examination scheme may include tests at the competent person’s discretion. In practice, testing is called for after an item has been repaired or modified (a chain sling with replaced components, for example), when its history is unknown, or when the examiner cannot otherwise satisfy themselves it is safe. In the UAE, local codes set the examination regime — see <a href="/blog/lifting-equipment-inspection-uae">lifting equipment inspection in the UAE</a>.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Never test to breaking load.',
      body: 'A proof test is a controlled load below the breaking load, done by a competent test house with the right equipment and exclusion zone. Never “test” gear by overloading it on a lift, and never treat a breaking load as a working figure.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the proof load of a shackle?', answer: 'It depends on the standard: 2.2 × WLL for RR-C-271 pattern shackles, 2 × WLL for EN 13889 Grade 6 shackles (per maker data). Check the certificate.' },
        { question: 'Is proof load the same as safe working load?', answer: 'No. Proof load is a test figure well above the WLL; the WLL is the only working figure.' },
        { question: 'Does every item get proof tested?', answer: 'It depends on the product standard and maker — some test every item, others test samples. The certificate states what was done.' },
        { question: 'When does used lifting gear need re-testing?', answer: 'Typically after repair or modification, or when its history is unknown — at the competent person’s discretion. Routine checks are thorough examinations.' },
        { question: 'Do your size tables show proof loads?', answer: 'Where the maker supplies them, yes — for example our Grade 100 chain table gives WLL, proof and breaking load for each size.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Rated items with published tables',
      skus: ['IH-LR-CH-G100', 'IH-LR-CH-G80', 'IH-LR-SH-G2130', 'IH-LR-SH-G209', 'IH-LR-TB-US', 'IH-LR-SH-SSA2741SP2'],
    },
    {
      type: 'category_link',
      slug: 'lifting-chain-fittings',
      label: 'Chain and chain fittings',
      blurb: 'Grade 80 and Grade 100 chain and fittings with published ratings.',
    },
    {
      type: 'page_link',
      kind: 'industry',
      slug: 'construction',
      label: 'Construction',
      blurb: 'Lifting, rigging and plant supply for contractors.',
    },
    {
      type: 'related_articles',
      slugs: ['working-load-limit-vs-breaking-strength', 'lifting-gear-test-certificate', 'chain-grades-explained', 'lifting-equipment-rules-gcc', 'asme-b30-26-rigging-hardware-explained'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'Factors from US Federal Specification RR-C-271F, a shackle maker’s EN 13889 datasheet and a turnbuckle maker’s catalogue; chain figures from the live Indus table; LOLER from UK HSE guidance.',
    },
    {
      type: 'cta_block',
      heading: 'Need certified, tested gear?',
      body: 'Send the items and the standard your site requires. Rated items ship with the manufacturer’s test certificate.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
