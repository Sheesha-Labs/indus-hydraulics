import type { BlogArticleSeed } from '../shared'

/**
 * Stud link vs studless chain. Loads and weights are live listing values (IH-LR-AC-SLACGU1U2,
 * IH-LR-AC-SACGU1U2U, IH-MR-MC-SL, IH-MR-MC-SS) as generated into ../charts.ts on 2026-11-08; the
 * proof-constant split (stud link higher from R3S) is IACS UR W22. Weight ratio from the 76 mm rows.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'stud-link-vs-studless-chain',
  title: 'Stud link vs studless chain: strength, weight, and why ships and offshore moorings choose differently',
  excerpt:
    'A stud link chain has a bar across every link; a studless chain does not. The stud keeps the link from closing up and the chain from kinking in the locker, at the cost of weight and a joint that can work loose. How the two compare on proof load, breaking load and weight, and where each one belongs.',
  categorySlug: 'anchor-chain-mooring',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Stud Link vs Studless Chain — Strength, Weight and Use',
  seoDescription:
    'Stud link vs studless anchor and mooring chain: what the stud does, proof and breaking loads compared grade for grade, weight per metre, and why ships use stud link and permanent offshore moorings use studless.',
  focusKeyword: 'stud link vs studless chain',
  publishedAt: '2026-11-08T09:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A stud is a bar pressed or welded across the middle of each link. It holds the link open under load and stops the chain kinking and fouling when it piles up in the locker.',
        'Offshore chain of the same grade and size has the same minimum breaking load with or without studs. From R3S up, studless chain is proof tested to a lower load.',
        'Studless chain is lighter: at 76 mm, 116 kg/m against 126 kg/m for stud link offshore chain.',
        'Ships use stud link anchor chain because it handles well over the windlass and stows without tangling.',
        'Permanent offshore moorings mostly use studless chain: lower weight per unit of strength and a longer fatigue life. Stud link stays common for drilling units and moorings in shallower water.',
      ],
    },
    {
      type: 'lead',
      html: 'Lay two lengths of chain side by side and the difference is obvious: one has a bar across every link, the other is plain oval links. The bar is the stud, and it changes how the chain behaves — under load, in the chain locker, over the windlass and over decades on the seabed. Neither type is simply better. A ship’s anchor cable and a floating platform’s mooring line ask different things of the chain, and that is why they usually end up with different types.',
    },
    {
      type: 'figure',
      imageId: 'e1b152f1-2ff1-4283-b088-e67f4813038a',
      caption: 'Stud link chain: the bar across each link holds it open and keeps the cable from kinking in the locker.',
      aspectRatio: '16/9',
    },
    {
      type: 'direct_answer',
      question: 'What is the difference between stud link and studless chain?',
      answer:
        'Stud link chain has a stud — a bar across the middle of each link — which keeps the link from deforming under load and stops the chain kinking when stowed. Studless chain has plain links. For offshore grades the minimum breaking load is the same; studless is lighter and has no stud to work loose, with a longer fatigue life, so it is preferred for permanent moorings, while stud link remains standard for ship anchor cables.',
    },

    { type: 'section_head', number: '/01', title: 'What the stud does.', anchor: 'stud' },
    {
      type: 'prose',
      html: '<p>Three things:</p><ul><li><strong>It holds the link open.</strong> Under tension a plain oval link tends to narrow at the sides and lengthen. The stud props the sides apart, so the link keeps its shape and spreads the load more evenly.</li><li><strong>It stops kinking.</strong> When chain is paid out and hauled in, it piles into the locker. Studs keep each link from turning into its neighbour, so the cable runs out clean when the anchor is let go.</li><li><strong>It fits the windlass.</strong> The pockets of a cable lifter are shaped for stud link chain of a given size — see the <a href="/p/cable-lifter-chain-wheel">cable lifter (chain wheel)</a>.</li></ul><p>The cost is weight, and a joint. A stud that loosens over years of cyclic load can wear the link and start a fatigue crack, which matters most where the chain cannot easily be inspected.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Strength compared.', anchor: 'strength' },
    {
      type: 'comparison_table',
      caption: '76 mm offshore mooring chain — test loads (kN), from our listings',
      columns: ['Grade', 'Break (both types)', 'Proof, stud link', 'Proof, studless'],
      rows: [
        { cells: ['ORQ', '4,621', '3,066', '3,066'] },
        { cells: ['R3', '4,884', '3,417', '3,417'] },
        { cells: ['R3S', '5,454', '3,942', '3,811'] },
        { cells: ['R4', '6,001', '4,731', '4,205'] },
        { cells: ['R4S', '6,658', '5,257', '4,665'] },
        { cells: ['R5', '7,009', '5,498', '4,884'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The breaking load is set by the grade’s constant and the diameter, and IACS uses one constant for both types. The proof load is not: from R3S upward the rules prove studless chain at a lower load, because a link without a stud deforms more along its length under tension. In the ship grades the difference shows in both loads — our <a href="/p/studless-anchor-chain-grades-u1-u2-and-u3">studless anchor chain</a> is listed with lower proof and breaking loads than <a href="/p/stud-link-anchor-chain-grades-u1-u2-and-u3">stud link anchor chain</a> of the same size and grade. Every load, size by size, is in the <a href="/blog/anchor-chain-size-chart">anchor chain size chart</a>.',
    },

    { type: 'section_head', number: '/03', title: 'Weight compared.', anchor: 'weight' },
    {
      type: 'comparison_table',
      caption: 'Offshore mooring chain — weight per metre (kg), from our listings',
      columns: ['Size', 'Stud link', 'Studless'],
      rows: [
        { cells: ['50 mm', '55', '50'] },
        { cells: ['64 mm', '90', '82'] },
        { cells: ['76 mm', '126', '116'] },
        { cells: ['102 mm', '228', '208'] },
        { cells: ['137 mm', '411', '375'] },
        { cells: ['162 mm', '575', '525'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Studless chain is about 8 to 9% lighter for the same diameter. In a ship’s cable that matters little; in a deep-water mooring line, where the unit carries the weight of hundreds of metres of chain on every leg, it matters a great deal. More in <a href="/blog/anchor-chain-weight-chart">anchor chain weight per metre and per shot</a>.',
    },

    { type: 'section_head', number: '/04', title: 'Where each is used.', anchor: 'use' },
    {
      type: 'comparison_table',
      caption: 'Choosing between the two',
      columns: ['Use', 'Usual choice', 'Why'],
      rows: [
        { cells: ['Ship anchor cable', 'Stud link, U2 or U3', 'Handles over the windlass, stows without kinking'] },
        { cells: ['Drilling unit and FPSO moorings in shallower water', 'Stud link, R3–R4', 'Stable link-to-link connection, easier to hoist'] },
        { cells: ['Permanent mooring', 'Studless, R3–R5', 'Lower weight per unit of strength, longer fatigue life'] },
        { cells: ['Small craft, anchor chain to 17 mm', 'Studless allowed', 'Rules permit studless chain of equal test load'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'When the two types meet in one line — studless chain on the seabed and stud link through the fairlead, say — the join is made with a purpose-built adaptor rather than a shackle straight onto a studless link: see the <a href="/p/three-link-adaptor-studless-to-stud-link-mooring-chain">three-link studless-to-stud-link adaptor</a>. The other connectors offshore lines use are covered in <a href="/blog/offshore-mooring-components">offshore mooring components</a>.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is stud link chain stronger than studless?', answer: 'For offshore grades the minimum breaking load is the same. Stud link chain is proof tested higher from R3S up. In the ship grades studless chain is listed with lower loads.' },
        { question: 'Why do ships use stud link anchor chain?', answer: 'It runs well over the windlass cable lifter and stows in the locker without kinking, so the anchor can be let go cleanly.' },
        { question: 'Why are permanent moorings studless?', answer: 'Studless chain carries the same breaking load for less weight, and has a longer fatigue life — there is no stud to loosen over decades of cyclic loading. The trade-off is that it is less convenient to handle when hoisting.' },
        { question: 'Can a ship use studless anchor chain?', answer: 'Where the rules require a chain diameter of 17 mm or less, studless chain with the same test load — or wire or fibre rope of the same breaking load — may be used instead. Larger ships use stud link.' },
        { question: 'How much lighter is studless chain?', answer: 'About 8 to 9% at the same diameter — 116 kg/m against 126 kg/m at 76 mm in our offshore listings.' },
        { question: 'Can I join studless chain to stud link chain?', answer: 'Yes, with a purpose-built adaptor of common, enlarged and end links, rather than a shackle straight onto a studless link.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Stud link and studless chain',
      skus: ['IH-LR-AC-SLACGU1U2', 'IH-LR-AC-SACGU1U2U', 'IH-MR-MC-SL', 'IH-MR-MC-SS', 'IH-MR-MC-3LA'],
    },
    { type: 'category_link', slug: 'offshore-mooring-chain', label: 'Offshore mooring chain', blurb: 'Stud link and studless chain in grades ORQ to R5, with adaptors and tails.' },
    {
      type: 'related_articles',
      slugs: ['anchor-chain-size-chart', 'anchor-chain-weight-chart', 'offshore-mooring-chain-grades-r3-r4-r5', 'anchor-chain-grades-u1-u2-u3'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-08',
      note: 'Loads and weights from our live listings; the proof-load split between types follows IACS UR W22. The classification society’s rules govern.',
    },
    {
      type: 'cta_block',
      heading: 'Stud link or studless?',
      body: 'Tell us the application, diameter and grade. We will quote either type, with the adaptors to join them and a certificate for every shot.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
