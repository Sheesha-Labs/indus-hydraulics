import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Anchor chain grades, read from the stud link and studless chain variant
 * rows (proof and breaking load by grade and size) and the Kenter, joining
 * and end shackle listings. Weights are not quoted because the length they
 * refer to is not stated on the rows.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'anchor-chain-grades-u1-u2-u3',
  title: 'Anchor chain grades U1, U2 and U3: stud link, studless, and the shackles that join them',
  excerpt:
    'Anchor chain is graded U1, U2 and U3, and each grade\'s proof load is the breaking load of the grade below. What the grades mean, how stud link and studless chain differ, and where Kenter and D shackles fit.',
  categorySlug: 'lifting-rigging',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T03:00:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What are anchor chain grades U1, U2 and U3?',
      answer:
        'They are the three strength grades of ship anchor chain: U1 is mild steel, U2 special quality and U3 extra special quality steel. For the same size, each grade is stronger than the last. On our 22 mm stud link chain, U1 is proof tested to 140 kN and breaks at 200 kN, U2 at 200 kN and 280 kN, and U3 at 280 kN and 401 kN — so each grade\'s proof load equals the breaking load of the grade below.',
    },
    {
      type: 'key_takeaways',
      items: [
        'U1 is mild steel, U2 special quality, U3 extra special quality. Same size, rising strength.',
        'On our stud link rows, each grade\'s proof load equals the breaking load of the grade below — 22 mm U2 is proof tested to 200 kN, U1\'s breaking load.',
        'Stud link chain has a bar across each link that keeps its shape and stops kinking; studless chain is lighter and plainer.',
        'Kenter shackles join lengths of chain and pass over the windlass like a link; D-type joining and end shackles connect chain to the anchor and fittings.',
        'Anchor chain is rated by proof and breaking load. It is not lifting chain and has no working load limit for lifting.',
      ],
    },
    {
      type: 'lead',
      html: 'An anchor holds a ship only as well as the chain between them, and anchor chain is graded on a different system from the lifting chain most riggers know. There are three grades, U1, U2 and U3, and <strong>they step up in a pattern worth knowing</strong>: test a higher grade to its proof load and you have loaded it to the point where the grade below would break.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'The three grades.',
      anchor: 'grades',
    },
    {
      type: 'comparison_table',
      caption: '22 mm stud link anchor chain, as listed',
      columns: ['Grade', 'Proof load', 'Minimum breaking load'],
      rows: [
        { cells: ['U1 — mild steel', '140 kN', '200 kN'] },
        { cells: ['U2 — special quality', '200 kN', '280 kN'], highlight: true },
        { cells: ['U3 — extra special quality', '280 kN', '401 kN'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Every link of a new chain is proof tested, and samples are broken to show the chain reaches its minimum breaking load. The grade sets both numbers. Because a U2 chain is proof tested to the breaking load of U1, and U3 to the breaking load of U2, a higher grade lets a ship carry a smaller, lighter chain for the same duty — which is why the grade a vessel needs is set by its class rules together with the chain size, never chosen on size alone.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Grade U2 across the sizes.',
      anchor: 'sizes',
    },
    {
      type: 'comparison_table',
      caption: 'Stud link anchor chain, grade U2, as listed',
      columns: ['Size', 'Proof load', 'Minimum breaking load'],
      rows: [
        { cells: ['12.5 mm (1/2")', '66 kN', '92 kN'] },
        { cells: ['16 mm (5/8")', '107 kN', '150 kN'] },
        { cells: ['22 mm (7/8")', '200 kN', '280 kN'], highlight: true },
        { cells: ['26 mm (1-1/16")', '278 kN', '389 kN'] },
        { cells: ['32 mm (1-1/4")', '417 kN', '583 kN'] },
        { cells: ['40 mm (1-9/16")', '640 kN', '896 kN'] },
      ],
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Stud link or studless.',
      anchor: 'stud',
    },
    {
      type: 'paragraph',
      html: 'Stud link chain has a bar welded or pressed across the middle of each link. The stud keeps the link from closing up under load, stops the chain kinking and tangling as it runs out, and helps it lie well in the locker. Studless chain leaves the links open, which makes it lighter and cheaper for its size. Both are listed from 12.5 mm to 40 mm in grades U1, U2 and U3, hot-dip galvanised or bitumen coated. Our studless rows give lower figures than the stud link rows at the same size and grade — 22 mm U2 studless breaks at 250.9 kN against 280 kN — so compare the rows, not the size.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Kenter, joining and end shackles.',
      anchor: 'shackles',
    },
    {
      type: 'paragraph',
      html: 'Anchor chain is supplied in lengths, usually called shots, joined by shackles. A Kenter shackle is a joining link made in parts and locked with a tapered pin; it is shaped like a chain link so it passes over the windlass gypsy with the chain. D-type joining shackles and end shackles connect the chain to the anchor, to a swivel or to fittings that will not run over the gypsy. Ours are to ISO 1704 in grades U2 and U3, from 11 mm to 162 mm, in CM490 or CM690 steel, galvanised or black painted. Match the shackle grade and size to the chain.',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Anchor chain is not lifting chain.',
      body: 'Anchor chain is graded and tested for anchoring and mooring. Its proof load is a test load and its breaking load is a failure load — neither is a working load limit, and anchor chain must never be used as a lifting sling. For lifting, use alloy lifting chain rated with a WLL, which is itself far below its breaking load.',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'Ordering anchor chain.',
      anchor: 'ordering',
    },
    {
      type: 'paragraph',
      html: 'Give the size, the grade, stud link or studless, the length or number of shots, the finish, and the certification the vessel requires, along with the joining and end shackles and any swivel. The anchor the chain serves is covered in <a href="/blog/types-of-marine-anchors">types of marine anchors</a>; lifting chain grades, which are a different system, are in <a href="/blog/chain-grades-explained">chain grades explained</a>.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What is the difference between U2 and U3 anchor chain?',
          answer:
            'Strength. U3 is extra special quality steel and is proof tested to U2\'s breaking load. On our 22 mm stud link chain, U2 breaks at 280 kN and U3 at 401 kN.',
        },
        {
          question: 'Why does anchor chain have studs?',
          answer:
            'The stud keeps each link from deforming under load and stops the chain kinking and tangling as it runs. Studless chain is lighter but lacks that stiffness.',
        },
        {
          question: 'What is a Kenter shackle?',
          answer:
            'A joining shackle shaped like a chain link, assembled from parts and locked with a tapered pin, so it passes over the windlass gypsy with the chain. Ours are to ISO 1704 in grades U2 and U3.',
        },
        {
          question: 'Can anchor chain be used for lifting?',
          answer:
            'No. Anchor chain has proof and breaking loads but no working load limit for lifting. Use rated alloy lifting chain.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Anchor chain and shackles',
      skus: ['IH-LR-AC-SLACGU1U2', 'IH-LR-AC-SACGU1U2U', 'IH-LR-AC-KSGU2U3', 'IH-LR-AC-JSDGU2U3', 'IH-LR-AC-ESDGU2U3'],
    },
    {
      type: 'category_link',
      slug: 'anchor-chain-accessories',
      label: 'Anchor chain and accessories',
      blurb: 'Stud link and studless chain in U1, U2 and U3, Kenter and D shackles.',
    },
    {
      type: 'category_link',
      slug: 'marine-anchors',
      label: 'Marine anchors',
      blurb: 'Stockless, HHP, Admiralty and small-craft anchors.',
    },

    {
      type: 'cta_block',
      heading: 'Re-chaining a vessel?',
      body: 'Send the chain size, grade, type, length and certification, with the shackles and swivel. We will quote chain and fittings as one consignment.',
      quoteLabel: 'Quote anchor chain',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Proof and breaking loads by grade and size, finishes, shackle standard, grades and materials checked against our anchor chain listings.',
    },
  ],
}

export default ARTICLE
