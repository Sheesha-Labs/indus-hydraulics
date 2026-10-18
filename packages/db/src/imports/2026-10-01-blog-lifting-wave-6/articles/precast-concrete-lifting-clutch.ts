import type { BlogArticleSeed } from '../shared'

/**
 * Precast concrete lifting clutches — spherical-head anchor systems.
 *
 * Sources checked 2026-10-01: Halfen DEHA KKT technical product information
 * (v.2026-03) — engaging/releasing, anchor load classes, capacity tables at
 * 15/25/35 N/mm² cube strength, axial/diagonal/tilting limits, safety factors
 * (anchor steel 3.0, concrete 2.5, link 4.0), dynamic factors, inspection and
 * discard, single use of anchors, EN 13155 / 2006/42/EC compliance;
 * Philipp spherical head lifting clutch application instruction (VB3-T-037)
 * — coupling, cannot couple to the wrong load class, cannot uncouple
 * unintentionally, clutch classes and the anchors each fits, annual expert
 * inspection, no welding or heat, check gauge; VDI/BV-BS 6205:2021 preview
 * (Machinery Directive treats lifting insert systems as loose load handling
 * devices, EN 13155); NSW Government rigging guide (hand pressure only, same
 * load-class marking — Australian guidance).
 * Product: our precast lifting clutch, 1.3–32 t, MBL = 4 × WLL.
 * "Minimum 15 N/mm² at first lift" is phrased as the lowest strength the
 * maker's tables cover, not as a stated rule.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'precast-concrete-lifting-clutch',
  title: 'Precast concrete lifting clutches: how spherical-head anchor systems work, and how to use them safely',
  excerpt:
    'A lifting clutch hooks onto the spherical head of an anchor cast into a precast unit, and is released by hand once the unit is set down. The system is only as safe as its weakest decision: the anchor’s load class, the concrete’s strength at lifting, and the angle of pull. Here is how the system works and the rules makers set.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Precast concrete lifting clutch: spherical-head anchor systems explained',
  seoDescription:
    'How precast concrete lifting clutches and spherical-head lifting anchors work: load classes, matching clutch to anchor, concrete strength at lifting, pull angles, inspection and standards.',
  focusKeyword: 'precast concrete lifting clutch',
  publishedAt: '2026-10-01T15:15:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A spherical-head anchor is cast into the precast unit; the lifting clutch engages its head and is released by hand once the load is down.',
        'Clutches and anchors come in load classes — typically 1.3 t to 32 t and above. Use a clutch made for the anchor’s load class and system.',
        'The anchor’s capacity depends on the concrete’s strength at the time of lifting. Makers’ tables start at a cube strength of 15 N/mm².',
        'Pull axially where possible. One maker allows diagonal pulls up to 60° (with reinforcement beyond 30°) and does not recommend more than 45°; tilting a unit needs specific anchors or reinforcement.',
        'Inspect the clutch before each use and have it examined at least once a year; discard it if it is deformed, cracked, or worn beyond the maker’s gauge.',
      ],
    },
    {
      type: 'lead',
      html: 'Precast walls, beams, stairs and box culverts are lifted from anchors cast into them at the factory. The clutch is the reusable half of the system — the part that connects the crane to the anchor, hundreds of times over. It is simple to use and easy to misuse, because most of the safety decisions were made when the unit was cast.',
    },

    { type: 'section_head', number: '/01', title: 'How the system works.', anchor: 'how-it-works' },
    {
      type: 'paragraph',
      html: 'A <strong>spherical-head lifting anchor</strong> is cast into the concrete inside a recess former, which leaves a pocket around its head. The <strong>lifting clutch</strong> — also called a ring clutch or lifting link — has a ball-shaped body with a slot. It is placed over the anchor head with the slot facing down, then turned towards the concrete so that it locks around the head. After the unit is set down, the clutch is unloaded and swung back to release it, by hand.',
    },
    {
      type: 'paragraph',
      html: 'Makers design the coupling so it cannot be fitted to an anchor of the wrong load class, and cannot come off unintentionally while there is no load on it. Australian rigging guidance adds that a clutch should engage with hand pressure only — never with a hammer — and that the clutch and the anchor should carry the same load-class marking.',
    },

    { type: 'section_head', number: '/02', title: 'Load classes.', anchor: 'load-classes' },
    {
      type: 'paragraph',
      html: 'Anchors are made in load classes. One major system offers 1.3, 2.5, 5.0, 7.5, 10, 15, 20, 32 and 45 t. A clutch class can cover more than one anchor class — in one maker’s range, the 5 t clutch fits 4 t and 5 t anchors, the 10 t clutch fits 7.5 t and 10 t, and the 20 t clutch fits 15 t and 20 t. Use the clutch the anchor system specifies.',
    },
    {
      type: 'comparison_table',
      caption: 'Our precast lifting clutch, by load class',
      columns: ['Load class (WLL)', 'Minimum breaking load', 'Weight'],
      rows: [
        { cells: ['1.3 t', '5.2 t', '0.89 kg'] },
        { cells: ['2.5 t', '10 t', '1.3 kg'] },
        { cells: ['5 t', '20 t', '3.24 kg'] },
        { cells: ['10 t', '40 t', '10 kg'], highlight: true },
        { cells: ['20 t', '80 t', '20.4 kg'] },
        { cells: ['32 t', '128 t', '46.5 kg'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Our clutches are rated at a 4:1 design factor, the same factor one major anchor-system maker applies to its lifting links. The anchors themselves are designed separately, against steel failure and against the concrete breaking out — which is why the concrete’s strength matters as much as the clutch’s.',
    },
    {
      type: 'direct_answer',
      question: 'How do you choose a lifting clutch for precast concrete?',
      answer:
        'Match it to the anchor: the same anchor system and the load class marked on the anchor. The anchor’s own capacity depends on the concrete strength at lifting, the anchor length and edge distances, and the angle of pull, all set out in the anchor maker’s tables.',
    },

    { type: 'section_head', number: '/03', title: 'Concrete strength and pull angle.', anchor: 'strength-and-angle' },
    {
      type: 'paragraph',
      html: '<strong>Concrete strength.</strong> The anchor’s capacity depends on how strong the concrete is when it is lifted, not its final strength. One maker publishes capacities at cube strengths of 15, 25 and 35 N/mm² at the time of lifting, and nothing below 15. Lift a unit before it reaches the strength the lift was designed for, and the anchor has less capacity than planned.',
    },
    {
      type: 'comparison_table',
      caption: 'Direction of pull (one anchor-system maker’s rules)',
      columns: ['Pull', 'Angle from the anchor axis', 'Rule'],
      rows: [
        { cells: ['Axial', '0° to 10°', 'The anchor’s full table value'] },
        { cells: ['Diagonal', '10° to 30°', 'Permitted at the diagonal table value'] },
        { cells: ['Diagonal', '30° to 60°', 'Needs diagonal-pull reinforcement, except in specific stronger, thicker sections; above 45° not recommended'], highlight: true },
        { cells: ['Spread above 60°', '—', 'Not permitted'] },
        { cells: ['Tilting or transverse', '—', 'Needs tilt-up anchors or extra reinforcement; a tilting table is recommended'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Allow for dynamic load.',
      body: 'The load on an anchor is not just the unit’s weight. One maker applies a dynamic factor of 1.3 for a stationary crane, 2.5 for moving the unit over level ground, and 4 or more on uneven ground. Lifting and moving precast units on rough site ground puts far more on the anchors than the weight alone.',
    },

    { type: 'section_head', number: '/04', title: 'Inspection and discard.', anchor: 'inspection' },
    {
      type: 'prose',
      html: '<ul><li>Check the clutch visually before every use.</li><li>Have it examined by a competent person or expert at least once a year, more often under heavy use, wear or corrosion, and record it.</li><li>Measure wear with the maker’s check gauge — makers publish minimum and maximum dimensions for each load class, and they differ slightly between systems.</li><li>Discard a clutch that is plastically deformed, has any crack in the ball or link, or is worn beyond the gauge. Never re-bend it, weld it or heat it.</li><li>Never lift from an anchor that is badly placed, damaged, corroded or visibly deformed. Lifting anchors are single-use and must not be welded or modified.</li></ul>',
    },

    { type: 'section_head', number: '/05', title: 'Standards.', anchor: 'standards' },
    {
      type: 'paragraph',
      html: 'Under the EU Machinery Directive, lifting insert systems are treated as loose load-handling devices, and conformity is shown through <strong>EN 13155</strong> — the standard for non-fixed load lifting attachments, whose scope includes lifting insert systems for normal-weight concrete. In Germany, the guideline <strong>VDI/BV-BS 6205</strong> (2021 edition) covers lifting inserts and lifting systems for precast elements, and system makers cite it alongside the Directive. A clutch is a lifting accessory and falls under the same inspection rules as other lifting gear — see our <a href="/blog/lifting-equipment-inspection-uae">guide to lifting inspection in the UAE</a>.',
    },
    {
      type: 'product_embed',
      heading: 'In this guide',
      skus: ['IH-LR-LP-PCLC'],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Can a 10 t clutch be used on a 7.5 t anchor?',
          answer:
            'In some systems, yes — one maker’s 10 t clutch is made for both 7.5 t and 10 t anchors. Use the clutch that the anchor system’s maker specifies for that load class, and never a clutch from a lower class.',
        },
        {
          question: 'How strong must the concrete be before lifting?',
          answer:
            'Strong enough for the anchor’s rated capacity at that strength. Makers’ tables give capacities at cube strengths from 15 N/mm² upward, so a unit should not be lifted before it reaches the strength used in the lift design.',
        },
        {
          question: 'Can precast units be lifted at an angle from spherical-head anchors?',
          answer:
            'Within limits. One maker allows diagonal pulls up to 60°, with reinforcement beyond 30°, and does not recommend more than 45°. Tilting a unit needs specific anchors or reinforcement.',
        },
        {
          question: 'How often should lifting clutches be inspected?',
          answer:
            'Visually before every use, and by a competent person at least once a year — more often with heavy use, wear or corrosion — using the maker’s wear gauge.',
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'lifting-points-pad-eyes',
      label: 'Lifting points and pad eyes',
      blurb: 'Precast lifting clutches, swivel lifting points and weld-on points.',
    },
    {
      type: 'related_articles',
      slugs: ['lifting-gear-rejection-criteria', 'pad-eye-vs-swivel-lifting-point', 'sling-angle-chart', 'lifting-equipment-inspection-uae'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-01',
      note: 'System rules from published Halfen and Philipp anchor-system instructions and the VDI/BV-BS 6205 preview; product figures from the linked size table. The anchor system maker’s instructions govern.',
    },
    {
      type: 'cta_block',
      heading: 'Lifting precast units on site?',
      body: 'Tell us the anchor system and load classes on your units. We will quote matching lifting clutches, with the manufacturer’s test certificate.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
