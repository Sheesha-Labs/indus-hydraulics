import type { BlogArticleSeed } from '../shared'
import { CABLE_ARRANGEMENT } from '../diagrams'

/**
 * Arrangement of an anchor chain cable. Sources (research folder, not named here): one maker's
 * arrangement sheet of 21 coded lengths and its link-proportion drawings; a second maker's swivel-set,
 * Kenter-shackle and mooring-system pages; a stockist's swivel forerunner sheets (26.45 D and 17.95 D),
 * links-per-27.5 m table, DIN 81860 end fastening sheet and weak-link sheet citing IACS Rec. No. 10
 * §1.3.2(a) (15–30% of chain MBS, releasable from outside the locker). Links-per-length figures are
 * the live listing values.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'anchor-chain-cable-arrangement',
  title: 'Arrangement of an anchor chain cable: lengths, links, Kenter shackles and the swivel forerunner',
  excerpt:
    'An anchor cable is not one chain but a string of 27.5 m lengths, joined by Kenter or D-type shackles, with a swivel forerunner at the anchor end and an end fastening in the chain locker. What each part is, how the common, enlarged and end links differ, and how the pieces are combined.',
  categorySlug: 'anchor-chain-mooring',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Anchor Chain Cable Arrangement — Shots, Links, Kenter, Swivel',
  seoDescription:
    'How an anchor chain cable is arranged: 27.5 m (15 fathom) lengths, common, enlarged and end links, Kenter and D joining shackles, the swivel forerunner, anchor shackle and the end fastening in the chain locker.',
  focusKeyword: 'anchor chain arrangement',
  publishedAt: '2026-11-08T09:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'An anchor cable is made of standard lengths of 27.5 m — 15 fathoms or 90 feet — usually called shots.',
        'Lengths are joined either by Kenter shackles, which are the size of a common link, or by D-type joining shackles, which need an enlarged link and an end link either side.',
        'At the anchor end a swivel forerunner — end link, enlarged link, swivel, enlarged link — stops the cable twisting, and an anchor shackle connects it to the anchor.',
        'The inboard end is shackled to an end fastening in the chain locker that holds 15 to 30% of the chain’s breaking load and can be released from outside the locker.',
        'Every link and fitting is proportioned to the chain diameter D: a common link is 6D long and 3.6D wide, an end link 6.75D by 4D.',
      ],
    },
    {
      type: 'lead',
      html: 'A ship’s anchor cable looks like one long chain, but it is built from parts: standard lengths, the shackles that join them, special links where the joins are made, a swivel near the anchor and a fastening at the far end in the chain locker. Knowing the parts matters when you order a replacement length, re-arrange a cable after an inspection, or specify a new one — because each part has to match the chain’s diameter and grade.',
    },
    {
      type: 'diagram',
      svg: CABLE_ARRANGEMENT,
      captionPrefix: 'FIG. 01',
      caption: 'A stud link anchor cable from the anchor to the chain locker. The parts are drawn schematically, not to scale.',
      alt: 'Schematic of an anchor chain cable, outboard to inboard: the anchor; an anchor shackle; a swivel forerunner made of an end link, enlarged link, swivel, enlarged link and end link; a Kenter shackle; shot 1, a 27.5 m length of stud link common links; another Kenter shackle; shot 2 and further shots; a final Kenter shackle; an end shackle; and the chain locker.',
    },
    {
      type: 'direct_answer',
      question: 'How is an anchor chain cable arranged?',
      answer:
        'From the anchor inward: an anchor shackle, a swivel forerunner (end link, enlarged link, swivel, enlarged link and a common link), then a series of 27.5 m lengths of common links joined by Kenter shackles or by D-type joining shackles with end and enlarged links, and finally an end shackle on the end fastening in the chain locker.',
    },

    { type: 'section_head', number: '/01', title: 'The length, or shot.', anchor: 'shot' },
    {
      type: 'paragraph',
      html: 'Chain cable is made, proof tested and certified in standard lengths of <strong>27.5 m</strong> — 15 fathoms, or 90 feet. Seafarers call a length a shot; makers’ sheets call it a length or a section. A shot of 76 mm stud link chain has 89 links and a 50 mm shot 135 — the number falls as the diameter rises because each link is longer. The total length a ship carries, and so the number of shots, comes from its equipment number: see <a href="/blog/equipment-number-anchor-chain-sizing">how the equipment number sizes anchors and chain</a>.',
    },

    { type: 'section_head', number: '/02', title: 'Common, enlarged and end links.', anchor: 'links' },
    {
      type: 'comparison_table',
      caption: 'Link proportions, in multiples of the chain diameter D (makers’ drawings)',
      columns: ['Link', 'Length', 'Width', 'Bar'],
      rows: [
        { cells: ['Common link (stud link)', '6D', '3.6D', '1.0D'] },
        { cells: ['Enlarged link', '6.6D', '3.95D', '1.1D'] },
        { cells: ['End link (no stud)', '6.75D', '4D', '1.2D'] },
        { cells: ['Kenter shackle', '6D', '4.2D', '1.0D'] },
        { cells: ['D-type joining shackle', '7.1D', '4D', '1.3D'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The common link is the body of the chain. The <a href="/p/end-link-stud-link-anchor-chain-grades-u2-and-u3">end link</a> is a heavier, studless link with a larger opening, made to take the bolt or pin of a D-type shackle. Because an end link is too big to sit next to a common link neatly, an <a href="/p/enlarged-link-stud-link-anchor-chain-grades-u2-and-u3">enlarged link</a> steps between them. The proportions in the table are why a 76 mm end link weighs about 59 kg against 39 kg for a common link of the same chain.',
    },

    { type: 'section_head', number: '/03', title: 'Joining the lengths.', anchor: 'joining' },
    {
      type: 'prose',
      html: '<p>Two ways, and a cable usually uses one throughout:</p><ul><li><strong><a href="/p/kenter-shackle-grades-u2-and-u3">Kenter shackle</a></strong>. Two interlocking halves and a centre stud, held by a taper pin sealed with a lead plug. It has the length and stud of a common link, so it runs over the windlass cable lifter like any other link and needs no special links either side. How to take one apart and put it back is in <a href="/blog/how-to-assemble-a-kenter-shackle">our Kenter shackle guide</a>.</li><li><strong><a href="/p/joining-shackle-d-type-grades-u2-and-u3">D-type joining shackle</a></strong>. A forged D with a bolt. It is bigger than a common link, so each length ends in an enlarged link and an end link — the arrangement one maker codes “length with EL and E both ends”.</li></ul><p>Studless chain is joined with D-type joining shackles straight onto the studless links.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Common lengths from one maker’s arrangement sheet (C common, EL enlarged, E end, KS Kenter, JS joining shackle, SW swivel)',
      columns: ['Arrangement', 'Make-up', 'Use'],
      rows: [
        { cells: ['All common links', 'C … KS … C', 'Lengths joined by Kenter shackles'] },
        { cells: ['EL and E both ends', 'E – EL – C … C – EL – E', 'Lengths joined by D-type shackles'] },
        { cells: ['EL and E one end', 'E – EL – C … C – KS', 'Changing from D-type to Kenter joins'] },
        { cells: ['Swivel length', 'E – EL – SW – EL – C … KS', 'The anchor-end length, swivel built in'] },
        { cells: ['All studless', 'SL … JS … SL', 'Studless cable'] },
      ],
    },

    { type: 'section_head', number: '/04', title: 'The anchor end: swivel forerunner and anchor shackle.', anchor: 'anchor-end' },
    {
      type: 'paragraph',
      html: 'An anchor turns as it is weighed and let go, and without a swivel the cable takes on twist. The <a href="/p/swivel-forerunner-anchor-chain-grades-u2-and-u3">swivel forerunner</a> is a short assembly — end link, enlarged link, swivel, enlarged link and a common link, about 26.45D long — fitted between the first length and the anchor. A <a href="/p/short-swivel-forerunner">short swivel forerunner</a> of end link, swivel and common link (17.95D) saves length where the hawse is short. The forerunner is shackled to the anchor with an <a href="/p/anchor-shackle-d-type-grades-u2-and-u3">anchor shackle</a> — a larger D, 8.7D long, whose bolt passes through the anchor’s shank — or a <a href="/p/anchor-kenter-shackle-grades-r3-and-r4">Kenter-pattern anchor shackle</a>. A <a href="/p/swivel-shackle-type-a">swivel shackle</a> combines the two.',
    },

    { type: 'section_head', number: '/05', title: 'The inboard end.', anchor: 'inboard' },
    {
      type: 'paragraph',
      html: 'The last length ends in an end shackle on an <a href="/p/end-fastening-for-anchor-chain-cable-din-81860">end fastening</a> — the bitter end — in the chain locker. Class rules, following IACS Recommendation No. 10, want that attachment to hold at least 15% but no more than 30% of the chain’s minimum breaking load, and to be releasable in an emergency from a position outside the locker: if the anchor fouls and must be slipped, the crew can let the cable go rather than have it tear out the ship’s structure. A <a href="/p/chain-locker-securing-device">chain locker securing device</a> or a <a href="/p/weak-link">weak link</a> provides that.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Grade follows the chain.',
      body: 'Every shackle, swivel and special link in the cable is ordered to the chain’s diameter and grade and proof tested to the chain’s proof load. A U3 cable with U2 joining shackles is a U2 cable.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How long is a shot of anchor chain?', answer: '27.5 m — 15 fathoms or 90 feet. Chain is made, tested and certified in these lengths.' },
        { question: 'What is the difference between an end link and an enlarged link?', answer: 'The end link is the larger, studless link that takes a D-type shackle. The enlarged link sits between it and the common links, stepping the size up.' },
        { question: 'Why use a Kenter shackle instead of a D-type joining shackle?', answer: 'A Kenter shackle has the same length and stud as a common link, so it passes over the windlass and needs no end or enlarged links either side.' },
        { question: 'What is a swivel forerunner?', answer: 'A short assembly of end link, enlarged links, swivel and a common link, fitted between the anchor shackle and the first length so the cable does not twist.' },
        { question: 'How strong must the bitter end be?', answer: 'Between 15% and 30% of the chain’s minimum breaking load, and releasable from outside the chain locker.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'The parts of a chain cable',
      skus: ['IH-LR-AC-SLACGU1U2', 'IH-LR-AC-KSGU2U3', 'IH-LR-AC-JSDGU2U3', 'IH-MR-AC-END', 'IH-MR-AC-ENL', 'IH-LR-AC-SFACGU2U3', 'IH-MR-AC-ASD', 'IH-MR-DF-EFC'],
    },
    { type: 'category_link', slug: 'anchor-chain-accessories', label: 'Anchor chain accessories', blurb: 'Kenter, D and pear shackles, swivels, forerunners, end and enlarged links, anodes.' },
    {
      type: 'related_articles',
      slugs: ['how-to-assemble-a-kenter-shackle', 'anchor-chain-size-chart', 'stud-link-vs-studless-chain', 'equipment-number-anchor-chain-sizing', 'anchor-chain-grades-u1-u2-u3'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-08',
      note: 'Arrangements and proportions from makers’ arrangement sheets and drawings; bitter-end requirement as cited from IACS Recommendation No. 10 on a maker’s data sheet. The classification society’s rules govern.',
    },
    {
      type: 'cta_block',
      heading: 'Re-arranging or replacing a cable?',
      body: 'Send the chain diameter, grade and the arrangement you have — or a photo of the joins. We will quote the lengths, shackles, links and forerunner to match, with certificates.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
