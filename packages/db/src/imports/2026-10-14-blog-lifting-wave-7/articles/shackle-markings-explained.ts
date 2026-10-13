import type { BlogArticleSeed } from '../shared'

/**
 * Shackle markings and the receiving check. Checked 2026-10-14: RR-C-271F §3.4.3.1.6 (bow: maker,
 * size, WLL; pins: maker mark, "HS" on Grade B), ASME B30.26 marking as summarised by a rigging
 * distributor (stated as a summary), AS 2741 marking (maker, grade, WLL, certificate identifier),
 * Abu Dhabi CoP 34 (unmarked accessory out of service — memory: uae-lifting-inspection-rules).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'shackle-markings-explained',
  title: 'Shackle markings explained: what the stamps mean and what to check on delivery',
  excerpt:
    'A rated shackle carries its identity on its body: maker, working load limit, size, and often a grade and a traceability code. Those marks are what an inspector reads, what the certificate refers to, and what decides whether the shackle stays in service. What the standards require to be marked, how to read it, and a five-minute receiving check for a site store.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Shackle Markings Explained: WLL, Size, Grade and Traceability',
  seoDescription:
    'What the markings on a shackle mean — maker, WLL, size, grade and traceability code — what RR-C-271, ASME B30.26 and AS 2741 require, why unmarked shackles come out of service, and a receiving check for site stores.',
  focusKeyword: 'shackle markings',
  publishedAt: '2026-10-14T08:15:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A rated shackle body is marked with the maker’s name or mark, its working load limit and its size.',
        'The pin is marked too — the maker’s mark, and on high-strength pins a grade mark (RR-C-271 uses "HS" for Grade B).',
        'Many makers add a traceability code that links the shackle to its test certificate.',
        'Missing or illegible markings are a removal criterion: an unmarked shackle comes out of service.',
        'Check marks against the certificate when the consignment arrives, before anything enters the lifting register.',
      ],
    },
    {
      type: 'lead',
      html: 'The marks on a shackle are not decoration. They are how the person using it knows what it will carry, how the inspector knows what it is, and how a test certificate is tied to the steel in your hand. Abu Dhabi’s lifting code of practice puts it plainly: every lifting accessory must show its safe working load, and one that does not comes out of service. So the time to check markings is at the store door, not at the six-monthly examination.',
    },

    { type: 'section_head', number: '/01', title: 'What the standards require.', anchor: 'requirements' },
    {
      type: 'comparison_table',
      caption: 'Shackle marking requirements (as published or summarised)',
      columns: ['Source', 'Body', 'Pin'],
      rows: [
        { cells: ['US Federal Spec RR-C-271 (pattern shackles)', 'Maker’s name or trademark, size and WLL on the bow', 'Maker’s mark; Grade B (high strength) pins also marked "HS"'] },
        { cells: ['ASME B30.26 (rigging hardware, as summarised by industry)', 'Maker’s name or trademark, rated load and size', 'Maker’s name or trademark, plus grade, material or rating'], highlight: true },
        { cells: ['AS 2741 (Australian shackles)', 'Maker’s name or mark, grade, WLL, and an identifier linked to the test certificate', '—'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'What markings should a shackle have?',
      answer:
        'At minimum the maker’s name or trademark, the working load limit and the size, forged or stamped on the body, with the maker’s mark on the pin. Many shackles also carry a grade mark and a traceability code that links them to the test certificate. A shackle with missing or illegible markings should be taken out of service.',
    },

    { type: 'section_head', number: '/02', title: 'Reading the marks.', anchor: 'reading' },
    {
      type: 'prose',
      html: '<ul><li><strong>Maker’s name or mark</strong> — who made it and whose rating applies. Side-load tables and warnings apply to that maker’s shackles.</li><li><strong>WLL</strong> — usually in tonnes (e.g. “WLL 8.5 T” or “8 1/2 T”). This is the in-line rating; see <a href="/blog/working-load-limit-vs-breaking-strength">WLL vs breaking strength</a>.</li><li><strong>Size</strong> — the nominal bow diameter, e.g. 1" or 25 mm. It is not a rating.</li><li><strong>Grade or material</strong> — for alloy and high-strength shackles, and stainless.</li><li><strong>Traceability code</strong> — a batch or heat code that ties the shackle to its test certificate.</li><li><strong>Pin marks</strong> — the maker’s mark, and a grade mark on high-strength pins. A pin without them may not be the shackle’s own pin.</li></ul>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Never swap pins.',
      body: 'A shackle’s rating depends on its own pin. Pins from another shackle, maker or pattern can look the same and differ in steel, heat treatment and thread. If a pin is lost, replace it with the maker’s pin for that size and grade — never an ordinary bolt.',
    },

    { type: 'section_head', number: '/03', title: 'The five-minute receiving check.', anchor: 'receiving' },
    {
      type: 'prose',
      html: '<ol><li><strong>Count and match</strong> the delivery to the purchase order: pattern, body, pin type, size.</li><li><strong>Read the marks</strong> on every shackle: maker, WLL, size, and code if present. Reject any that are unmarked or illegible.</li><li><strong>Match to the certificate</strong>: the certificate should cover the type, size, WLL and batch or traceability code you have received.</li><li><strong>Look for damage</strong>: bent or distorted bodies, damaged threads, pins that do not seat fully, cracks, heat discolouration.</li><li><strong>Register and tag</strong> each shackle into the site lifting register before issue — see <a href="/blog/lifting-equipment-inspection-uae">lifting equipment inspection in the UAE</a>.</li></ol>',
    },
    {
      type: 'paragraph',
      html: 'Markings also matter at every later examination. ASME B30.26, as summarised by industry, lists missing or illegible markings first among the removal criteria for shackles, alongside heat damage, excessive wear (10% of the original dimension), bent or distorted parts, cracks and incomplete pin engagement. Our <a href="/blog/lifting-gear-rejection-criteria">lifting gear rejection criteria</a> covers the full list, and <a href="/blog/lifting-gear-test-certificate">what a test certificate should show</a> explains the paperwork side.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What does WLL mean on a shackle?', answer: 'Working load limit — the most the maker rates the shackle to carry in service, in line. It is usually stamped in tonnes.' },
        { question: 'Is the size on a shackle its capacity?', answer: 'No. The size is the nominal bow diameter. The WLL stamp is the rating, and it differs between patterns and grades of the same size.' },
        { question: 'Can I use a shackle with worn-off markings?', answer: 'No. Missing or illegible markings are a removal criterion; the shackle comes out of service until a qualified person decides otherwise.' },
        { question: 'What does HS on a shackle pin mean?', answer: 'In US Federal Specification RR-C-271, Grade B (high strength) pins and bolts are marked "HS".' },
        { question: 'Should the certificate match the shackle?', answer: 'Yes. Check the type, size, WLL and traceability code on the certificate against the marks on the shackles received.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Marked, certified shackles',
      skus: ['IH-LR-SH-G209', 'IH-LR-SH-G2130', 'IH-LR-SH-SSA2741SP', 'IH-LR-SH-8ASPAS', 'IH-LR-SH-B3032SSCP'],
    },
    {
      type: 'category_link',
      slug: 'shackles',
      label: 'Shackles',
      blurb: 'Rated shackles shipped with the manufacturer’s test certificate.',
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
      slugs: ['shackle-buying-guide-uae', 'lifting-gear-test-certificate', 'lifting-gear-rejection-criteria', 'lifting-equipment-inspection-uae', 'commercial-grade-vs-lifting-grade-shackles'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'RR-C-271F marking clauses; ASME B30.26 marking and removal criteria as summarised by a rigging distributor; AS 2741 marking; Abu Dhabi lifting code of practice.',
    },
    {
      type: 'cta_block',
      heading: 'Need certified shackles?',
      body: 'Send the patterns, sizes and quantities. Rated shackles ship with the manufacturer’s test certificate.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
