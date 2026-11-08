import type { BlogArticleSeed } from '../shared'

/**
 * Anchor chain testing. Sources: a chain maker's two 2025 articles "Tests required for finished anchor
 * chain" (proof per 27.5 m, permanent elongation ≤ 5%, one length in four sampled, ≥ 3 links, break load
 * held ≥ 30 s, surveyor present, no paint) and "Tests required for anchor chain accessories" (proof at
 * the chain's proof load; one break sample per batch of ≤ 25 shackles/swivels/links or ≤ 50 connecting
 * links; three-condition exemption; 1.4× re-use rule); a second maker's process page (six-section proof
 * pull, 600/1600/4000 t machines, U3 Charpy ≥ 60 J link / ≥ 50 J weld). Live listing loads for 76 mm.
 * No source gives sampling frequencies for tensile/Charpy tests on finished chain — not stated.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'anchor-chain-testing-proof-break-ndt',
  title: 'Anchor chain testing: proof load, breaking load, mechanical tests and NDT',
  excerpt:
    'Before a length of anchor chain is certified it is proof loaded end to end, sampled for a break test, tested for strength and toughness, and — for offshore chain — examined link by link. What each test is, how samples are chosen, what counts as a pass, and the separate rules for shackles, swivels and links.',
  categorySlug: 'anchor-chain-mooring',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Anchor Chain Testing — Proof Load, Break Test, NDT',
  seoDescription:
    'How anchor and mooring chain is tested before certification: proof load on every 27.5 m length, 5% elongation limit, break test sampling, accessory batch tests, Charpy impact tests and NDT.',
  focusKeyword: 'anchor chain testing',
  publishedAt: '2026-11-08T10:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Every 27.5 m length is proof loaded in front of the class surveyor, then checked: no defects, and no more than 5% permanent stretch.',
        'For the break test the surveyor picks one length in every four or fewer and cuts a sample of at least three links, which must hold the breaking load for 30 seconds.',
        'Shackles, swivels and special links are proof loaded to the chain’s proof load; one in every 25 (one in 50 for connecting links) is broken.',
        'Test links are made, welded and heat treated with the chain they represent, and chain is tested bare — no paint or coating.',
        'Offshore mooring chain is also examined link by link by NDT and measured, because it stays under load for decades.',
      ],
    },
    {
      type: 'lead',
      html: 'A chain certificate is a record of tests. Knowing what they are tells you what the certificate proves — and what it does not. The rules come from the classification societies, built on the IACS requirements; the summary below follows how one chain maker sets out the tests required for finished chain and for accessories.',
    },
    {
      type: 'figure',
      imageId: '67fc3ab3-677f-4d74-abc6-5eeae2901e26',
      caption: 'Mooring chain on the test floor: each 27.5 m length is proof loaded and inspected before it is marked and certified.',
      aspectRatio: '4/3',
    },
    {
      type: 'direct_answer',
      question: 'How is anchor chain tested?',
      answer:
        'Each 27.5 m length is proof loaded to its grade’s proof load in the presence of a class surveyor and must show no defects and no more than 5% permanent elongation. A sample of at least three links, from one length in every four, must hold the breaking load for 30 seconds. Mechanical and impact tests are made on test pieces, and offshore chain is examined by NDT.',
    },

    { type: 'section_head', number: '/01', title: 'The proof load test.', anchor: 'proof' },
    {
      type: 'paragraph',
      html: 'Every length of finished chain is pulled on an approved test machine to the proof load for its size and grade — 2,150 kN for a 76 mm U2 chain, 4,731 kN for 76 mm R4 stud link (all sizes in the <a href="/blog/anchor-chain-size-chart">size chart</a>). After unloading, every link is examined and the length and dimensions checked. The length passes if there are no visible defects and its permanent elongation does not exceed 5% of the original length. The test is made on bare steel: paint or anti-corrosion coating must not be applied first, because it could hide a crack.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'What the proof test proves.',
      body: 'That every link in that length carried the proof load without cracking or stretching too far. It does not raise the chain’s rating, and it is a factory test: the 5% elongation limit is not an in-service wear limit.',
    },

    { type: 'section_head', number: '/02', title: 'The breaking load test.', anchor: 'break' },
    {
      type: 'comparison_table',
      caption: 'Break test on finished chain',
      columns: ['Item', 'Requirement'],
      rows: [
        { cells: ['Sampling', 'One length chosen by the surveyor from each batch of four lengths or fewer'] },
        { cells: ['Sample', 'At least three links, made, welded and heat treated with the chain'] },
        { cells: ['Load', 'The grade’s breaking load, held for at least 30 seconds'] },
        { cells: ['Pass', 'The sample does not break'] },
        { cells: ['Very large chain', 'If no machine can reach the load, an equivalent method agreed with the class society'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The sample links are cut out in the surveyor’s presence. For the largest offshore sizes the breaking loads run past 30,000 kN, which is why makers invest in test machines of 1,600 and 4,000 tonnes.',
    },

    { type: 'section_head', number: '/03', title: 'Accessories.', anchor: 'accessories' },
    {
      type: 'prose',
      html: '<ul><li><strong>Proof test:</strong> every shackle, swivel, swivel shackle, enlarged link and end link is proof loaded to the proof load of the chain it is made for.</li><li><strong>Break test:</strong> one piece per batch — same heat, same chain size, same heat treatment — of 25 or fewer shackles, swivels and links, or 50 or fewer connecting links such as <a href="/p/kenter-shackle-grades-u2-and-u3">Kenter shackles</a>.</li><li><strong>After a break test</strong> the piece is scrapped — unless its steel is stronger than the grade requires or its size can withstand 1.4 times the breaking load.</li><li><strong>Exemption:</strong> the break test can be waived if the design’s breaking load was proven at approval, each batch’s mechanical properties and impact energy are verified, and the pieces are examined by suitable NDT.</li></ul>',
    },

    { type: 'section_head', number: '/04', title: 'Mechanical tests and NDT.', anchor: 'ndt' },
    {
      type: 'paragraph',
      html: 'Test pieces cut from the chain are tested for tensile strength, yield, elongation and reduction of area, and Charpy impact specimens are taken from the link and across the weld. For U3 ship chain one maker cites at least 60 J in the link and 50 J at the weld; the offshore grade minimums are in <a href="/blog/offshore-mooring-chain-grades-r3-r4-r5">mooring chain grades</a>. Offshore chain is additionally examined by non-destructive testing — one maker now uses phased-array ultrasonic inspection — and measured link by link, then marked. See <a href="/blog/how-anchor-chain-is-made">how anchor chain is made</a> for where these steps fall in production.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is every length of anchor chain proof tested?', answer: 'Yes. Every 27.5 m length is proof loaded and inspected before it is certified.' },
        { question: 'What is the elongation limit in a chain proof test?', answer: 'Permanent elongation must not exceed 5% of the original length after the proof load is removed.' },
        { question: 'How many breaking tests are made?', answer: 'One sample of at least three links from every four lengths or fewer.' },
        { question: 'Can a break-tested shackle be used?', answer: 'Normally no — it is scrapped. It may be reused only if its steel exceeds the grade requirement or its size can take 1.4 times the breaking load.' },
        { question: 'Is chain tested painted?', answer: 'No. Proof and break tests are made on bare chain so that coating cannot hide defects.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Certified chain and accessories',
      skus: ['IH-LR-AC-SLACGU1U2', 'IH-MR-MC-SL', 'IH-LR-AC-KSGU2U3', 'IH-LR-AC-SFACGU2U3', 'IH-MR-AC-END', 'IH-MR-AC-ENL'],
    },
    { type: 'category_link', slug: 'anchor-chain-accessories', label: 'Anchor chain accessories', blurb: 'Shackles, swivels, forerunners, end and enlarged links, each with its certificate.' },
    {
      type: 'related_articles',
      slugs: ['anchor-chain-marking-and-certificates', 'how-anchor-chain-is-made', 'anchor-proof-load-testing', 'anchor-chain-size-chart', 'proof-load-testing-lifting-gear'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-08',
      note: 'Test requirements as set out by a chain maker from the classification rules; loads from our live listings. The classification society’s rules govern.',
    },
    {
      type: 'cta_block',
      heading: 'Need the test records?',
      body: 'Every length and accessory we supply comes with its class certificate. Tell us the class society and we will quote to it.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
