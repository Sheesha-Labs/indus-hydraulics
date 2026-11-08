import type { BlogArticleSeed } from '../shared'
import { ANCHOR_PROOF_LOADS } from '../reference'

/**
 * Anchor proof load testing. The table is a selection of 45 rows from a stockist's "proof load tests for
 * anchors" sheet (156 entries, 50 to 48,000 kg, with the HHP-anchor mass column). The HHP column is ≈ 75%
 * of the ordinary mass, i.e. an HHP anchor is proved at the load for an ordinary anchor about 1.33 times
 * its mass — stated as read from the table. No source gives the test procedure (load points, hold time,
 * inspection), so the article names the class society's rules for it rather than describing it.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'anchor-proof-load-testing',
  title: 'Anchor proof load testing: test loads by anchor mass, and why HHP anchors are tested harder',
  excerpt:
    'Every ship’s anchor is proof loaded before it is certified, to a load set by its mass. The proof test load for anchors from 50 kg to 48 tonnes, how high-holding-power anchors are treated, what the test proves, and what to check on the certificate.',
  categorySlug: 'anchor-chain-mooring',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Anchor Proof Load Test — Test Loads from 50 kg to 48 t',
  seoDescription:
    'Anchor proof load testing explained: proof test loads by anchor mass from 50 kg to 48,000 kg, high-holding-power (HHP) anchor masses, what the test proves and what the certificate should show.',
  focusKeyword: 'anchor proof load test',
  publishedAt: '2026-11-08T10:50:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Ship anchors are proof loaded in front of the class surveyor on an approved test machine, to a load fixed by the anchor’s mass.',
        'The load rises less than in proportion to mass: a 1,000 kg anchor is proved at 199 kN, a 10,000 kg anchor at 1,010 kN.',
        'A high-holding-power anchor is proved at the load for an ordinary anchor about one third heavier — a 7,519 kg HHP anchor takes the 10,000 kg load.',
        'The proof test shows the anchor carries the load without cracks or permanent deformation. It is not a holding-power test.',
        'The anchor’s certificate should give its mass, type, proof load and the class society, and match the ship’s equipment requirement.',
      ],
    },
    {
      type: 'lead',
      html: 'An anchor is a casting or fabrication that takes enormous loads at a single point — the shank, the crown and the flukes — and a hidden flaw in any of them would show up at the worst possible moment. So every anchor for a classed ship is proof tested before it leaves the works, and the load comes from a table keyed to the anchor’s mass.',
    },
    {
      type: 'direct_answer',
      question: 'What is the proof load for a ship’s anchor?',
      answer:
        'It depends on the anchor’s mass: about 39 kN for a 100 kg anchor, 199 kN for 1,000 kg, 661 kN for 5,000 kg, 1,010 kN for 10,000 kg and 1,520 kN for 20,000 kg. High-holding-power anchors are proved at the load for an ordinary anchor about 1.33 times their mass.',
    },

    { type: 'section_head', number: '/01', title: 'Proof test loads.', anchor: 'table' },
    {
      type: 'paragraph',
      html: 'Selected rows from a published proof-load table that follows the class rules. Read across from the anchor’s mass, or from the HHP column if it is a high-holding-power anchor. For a mass between rows, the classification society’s rules give the method.',
    },
    {
      type: 'comparison_table',
      caption: 'Proof test load by anchor mass',
      columns: ['Ordinary anchor kg', 'HHP anchor kg', 'Proof test load kN'],
      rows: ANCHOR_PROOF_LOADS,
    },

    { type: 'section_head', number: '/02', title: 'HHP anchors are tested harder.', anchor: 'hhp' },
    {
      type: 'paragraph',
      html: 'A high-holding-power anchor holds more per kilogram than an ordinary stockless anchor, which is why the rules let a ship carry an HHP anchor of 75% of the ordinary mass — see the <a href="/blog/equipment-number-anchor-chain-sizing">equipment table</a>. The proof test keeps pace: the HHP anchor is proved at the load of the heavier ordinary anchor it replaces. A 2,256 kg HHP anchor, for example, is proved at 474 kN — the load for a 3,000 kg ordinary anchor. Our <a href="/p/ac-14-high-holding-power-anchor">AC-14</a>, <a href="/p/hhp-stockless-anchor-type-hy-14">HY-14</a> and <a href="/p/super-high-holding-power-pool-anchor-type-tw">TW pool</a> anchors are HHP types.',
    },

    { type: 'section_head', number: '/03', title: 'What the test proves.', anchor: 'proves' },
    {
      type: 'prose',
      html: '<p>The proof test is made in the presence of the class surveyor. The classification rules set where the load is applied and how the anchor is examined afterwards. A pass shows:</p><ul><li>the anchor carried its proof load without breaking;</li><li>it shows no cracks and no permanent deformation beyond the rules’ limits afterwards.</li></ul><p>It does <strong>not</strong> measure holding power in the seabed — that depends on the anchor’s design and the soil — and it does not rate the chain or shackle attached to it. The anchor shackle is tested with the chain it belongs to: see <a href="/blog/anchor-chain-testing-proof-break-ndt">anchor chain testing</a>. The same idea for lifting gear is in <a href="/blog/proof-load-testing-lifting-gear">proof load testing of lifting gear</a>.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Checking the certificate.', anchor: 'certificate' },
    {
      type: 'prose',
      html: '<p>When an anchor arrives, check that its certificate shows:</p><ul><li>the anchor type and whether it is approved as HHP;</li><li>its mass, matching the mass cast or stamped on the anchor;</li><li>the proof load applied, matching the table for that mass;</li><li>the classification society and surveyor, and the identification marks on the anchor.</li></ul><p>More on class documents in <a href="/blog/anchor-chain-marking-and-certificates">chain marks and class certificates</a>.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is every ship anchor proof tested?', answer: 'Anchors for classed ships are proof tested before certification, in the presence of the class surveyor.' },
        { question: 'What is the proof load for a 3,000 kg anchor?', answer: '474 kN.' },
        { question: 'Why does an HHP anchor have a higher proof load for its mass?', answer: 'Because the rules let it replace an ordinary anchor a third heavier, it is proved at that heavier anchor’s load.' },
        { question: 'Does the proof test measure holding power?', answer: 'No. It proves the anchor’s strength. Holding power depends on its design and the seabed.' },
        { question: 'What about offshore drag anchors?', answer: 'Offshore drag embedment anchors are sized by mooring analysis and certified to their own class requirements; this table is for ships’ anchors.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Ship anchors',
      skus: ['IH-MR-AN-AC14', 'IH-LR-AN-HHP14', 'IH-MR-AN-SPTW', 'IH-LR-AN-HALL', 'IH-LR-AN-SPEK', 'IH-MR-AN-USN'],
    },
    { type: 'category_link', slug: 'marine-anchors', label: 'Marine anchors', blurb: 'Stockless, HHP, stock and fluke anchors for ships and workboats.' },
    {
      type: 'related_articles',
      slugs: ['equipment-number-anchor-chain-sizing', 'types-of-marine-anchors', 'anchor-chain-testing-proof-break-ndt', 'proof-load-testing-lifting-gear'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-08',
      note: 'Proof loads from a chain stockist’s published table following the class rules (selected rows). The test procedure is set by the classification society, whose rules govern.',
    },
    {
      type: 'cta_block',
      heading: 'Replacing an anchor?',
      body: 'Send the anchor type and mass, or the ship’s equipment number. We will quote a class-certified anchor with its proof test certificate.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
