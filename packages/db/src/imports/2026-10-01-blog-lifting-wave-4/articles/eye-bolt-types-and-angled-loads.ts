import type { BlogArticleSeed } from '../shared'

/**
 * Eye bolts — the three types and what an angled pull does to each.
 *
 * Sources, checked 2026-09-29 to 2026-10-01:
 *   - DIN 580:2018-04 per-bolt WLL table (vertical / ≤45° in the eye plane /
 *     ≤45° sideways), M8–M42, as published in the standard's user information
 *     and in Ganter's operating instruction. Vertical values match our own
 *     DIN 580 table exactly. M48 has only a vertical value in our table.
 *   - Kito Crosby "Warnings & Application Instructions — Lifting Points"
 *     (2025): angle reduction for shoulder and machinery eye bolts, the
 *     regular-nut prohibition, eye-plane rule, tapped-hole and two-nut rules.
 *   - Thread-engagement depths: Ganter / BG recommendations.
 * Our regular-nut, shoulder-nut and machinery eye bolts carry no Crosby
 * cross-reference, so the reduction table is attributed to the US patterns.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'eye-bolt-types-and-angled-loads',
  title: 'Eye bolt types and angled loads: plain, shoulder and DIN 580 collar eye bolts',
  excerpt:
    'A plain eye bolt is rated for a straight pull only. A shoulder eye bolt pulled at 45° keeps 30% of its rating. A DIN 580 collar eye bolt has its own table for angled loads and none at all for a pull across the eye. Here is how each type is rated, fitted and derated.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Eye bolt angle load chart: plain, shoulder and DIN 580 eye bolts',
  seoDescription:
    'How eye bolt ratings fall with angle: plain eye bolts for vertical lifts only, shoulder eye bolt reduction chart, the DIN 580 per-bolt table, thread engagement and correct fitting.',
  focusKeyword: 'eye bolt angle load chart',
  publishedAt: '2026-10-01T09:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Plain (regular nut) eye bolts are for straight, in-line pulls only. Never use them for an angled lift.',
        'Shoulder and machinery eye bolts can take an angled pull, at a reduced rating: 65% of the WLL at 30° from the bolt’s axis, 30% at 45° and 25% at 90°.',
        'DIN 580 collar eye bolts are rated per bolt: an M20 is 1,200 kg vertical, 860 kg at up to 45° in the plane of the eye, and 600 kg at up to 45° sideways. A pull across the eye is not permitted.',
        'Every rating assumes the collar or shoulder sits flat and fully home, with enough thread engaged: at least 1.5 × the thread diameter in steel and 2 × in aluminium.',
        'Where the pull is angled or changes direction, a swivel lifting point is the better part.',
      ],
    },
    {
      type: 'lead',
      html: 'An eye bolt looks like the simplest lifting point there is, and it is the one most often loaded in a way it was never rated for. The rating stamped on it is for a pull straight along the bolt. Pull it sideways and some types lose three-quarters of their capacity; others are not rated for that at all.',
    },

    { type: 'section_head', number: '/01', title: 'Three kinds of eye bolt.', anchor: 'three-types' },
    {
      type: 'comparison_table',
      caption: 'The three families, and what they may be loaded with',
      columns: ['Type', 'How to recognise it', 'Angled pull'],
      rows: [
        { cells: ['Plain (regular nut) eye bolt', 'Eye on a plain shank, no shoulder under the eye', 'Never — straight, in-line pulls only'] },
        { cells: ['Shoulder or machinery eye bolt', 'Forged shoulder under the eye that seats against the load', 'Yes, at a reduced rating, in the plane of the eye'], highlight: true },
        { cells: ['Collar eye bolt — DIN 580, BS 4278, JIS B 1168', 'Metric thread, wide collar under the eye', 'Up to 45°, from the bolt’s own angled-load table'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The eye nut is the same idea turned round: DIN 582 and JIS B 1169 eye nuts go onto a stud or bolt, and DIN 582 nuts are rated in the same way as DIN 580 bolts.',
    },

    { type: 'section_head', number: '/02', title: 'Shoulder eye bolts at an angle.', anchor: 'shoulder-eye-bolts' },
    {
      type: 'paragraph',
      html: 'A shoulder seated flat against the load is what lets an eye bolt resist bending. Even so, the rating falls quickly as the pull leans away from the bolt’s axis. The reduction published for US-pattern shoulder and machinery eye bolts is below, worked on our 3/4″ shoulder nut eye bolt, rated 7,200 lb in line.',
    },
    {
      type: 'comparison_table',
      caption: 'Shoulder and machinery eye bolts: rating against angle from the bolt’s axis',
      columns: ['Angle from in-line', 'Share of WLL', 'On a 7,200 lb eye bolt'],
      rows: [
        { cells: ['0° to 5°', '100%', '7,200 lb'] },
        { cells: ['15°', '80%', '5,760 lb'] },
        { cells: ['30°', '65%', '4,680 lb'] },
        { cells: ['45°', '30%', '2,160 lb'], highlight: true },
        { cells: ['90°', '25%', '1,800 lb'] },
      ],
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Never use a plain eye bolt for an angled lift.',
      body: 'Without a shoulder, a side load bends the shank where it leaves the load. Plain (regular nut) eye bolts are rated for a straight pull only. If a sling leg will lean, fit a shoulder eye bolt, a collar eye bolt rated for the angle, or a swivel lifting point.',
    },
    {
      type: 'paragraph',
      html: 'Two more rules come with the table. Load the eye <strong>in its own plane</strong>, never across it — turn the eye to face the pull, using a shim under the shoulder if needed. And do not reeve one sling through two eye bolts: the sling slides, and both the load on each bolt and its angle change.',
    },

    { type: 'section_head', number: '/03', title: 'DIN 580 collar eye bolts.', anchor: 'din-580' },
    {
      type: 'paragraph',
      html: 'DIN 580 rates each eye bolt for three directions: a vertical pull, a pull at up to 45° in the plane of the eye, and a pull at up to 45° sideways. The vertical column is the WLL stamped on the bolt and in our DIN 580 table.',
    },
    {
      type: 'comparison_table',
      caption: 'DIN 580 eye bolt, WLL per bolt (kg) — DIN 580:2018',
      columns: ['Thread', 'Vertical', '≤45° in the eye plane', '≤45° sideways'],
      rows: [
        { cells: ['M8', '140', '100', '70'] },
        { cells: ['M10', '230', '170', '115'] },
        { cells: ['M12', '340', '240', '170'] },
        { cells: ['M16', '700', '500', '350'] },
        { cells: ['M20', '1,200', '860', '600'], highlight: true },
        { cells: ['M24', '1,800', '1,290', '900'] },
        { cells: ['M30', '3,200', '2,300', '1,600'] },
        { cells: ['M36', '4,600', '3,300', '2,300'] },
        { cells: ['M42', '6,300', '4,500', '3,150'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'There is no figure for a pull at 90° to the bolt, and the standard says such a side pull must not be applied. The ratings hold from −20 °C to 200 °C. DIN 582 eye nuts follow the same pattern.',
    },
    {
      type: 'paragraph',
      html: 'Do not compare a DIN 580 bolt with a US machinery eye bolt of the same thread and assume the higher figure. They are different designs, made from different steels, and rated to different tables — the metric collar bolt is rated well below a US machinery eye bolt of the same thread size. Read the rating for the bolt in your hand.',
    },
    {
      type: 'direct_answer',
      question: 'Can a DIN 580 eye bolt be loaded at an angle?',
      answer:
        'Yes, up to 45°, at a reduced rating from its own table: an M20 carries 1,200 kg vertically, 860 kg at up to 45° in the plane of the eye, and 600 kg at up to 45° sideways. A pull across the eye at 90° is not rated and must not be applied. The collar must sit flat and fully home.',
    },

    { type: 'section_head', number: '/04', title: 'Fitting it properly.', anchor: 'fitting' },
    {
      type: 'prose',
      html: '<ul><li><strong>Seat it fully.</strong> Every rating assumes the collar or shoulder is screwed fully home and sits flat across its whole face. Never undercut the bolt to make it seat; countersink the hole instead, no wider than the thread diameter for DIN 580.</li><li><strong>Engage enough thread.</strong> In a tapped hole, at least 1.5 × the thread diameter in steel or grey cast iron, 2 × in aluminium alloys and 2.5 × in low-strength light metals. For US machinery eye bolts, tap to the shank length plus half the diameter.</li><li><strong>Through holes.</strong> Put a nut on the far side — at least 0.8 × the thread diameter thick for DIN 580. On a nut eye bolt, use two nuts if one diameter or less of thread protrudes.</li><li><strong>Align the eye with the pull.</strong> Use a shim under the shoulder to turn the eye into the plane of the load, rather than leaving it partly unscrewed.</li><li><strong>Leave it unpainted.</strong> The DIN 580 user information warns against painting eye bolts, so they are not mistaken for high-strength fittings.</li><li><strong>Size up for repeated use.</strong> Where the same bolt is screwed into different loads again and again, use the next larger thread.</li></ul>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A half-seated eye bolt is not rated at all.',
      body: 'An eye bolt left proud of the surface to line up the eye has no shoulder support and bends at the thread under any side load. Seat it fully and shim it to align, or use a swivel lifting point that turns to face the load by itself.',
    },

    { type: 'section_head', number: '/05', title: 'When to use a swivel lifting point instead.', anchor: 'swivel-lifting-points' },
    {
      type: 'paragraph',
      html: 'A swivel lifting point — a swivel hoist ring, or a Grade 80 swivel lifting point — has a ring that turns through 360° and pivots, so it lines itself up with the sling leg. That removes the two weaknesses of an eye bolt: the reduction for angle and the need to align the eye by hand. Where a load will be lifted on angled legs, turned over or pulled in changing directions, it is the better part. Its own table and fitting rules, including tap depth and tightening torque, apply in place of the eye bolt’s.',
    },
    {
      type: 'decision_tree',
      heading: 'Choosing a lifting point',
      intro: 'Start from the direction of the pull.',
      branches: [
        { condition: 'Straight, vertical pull only', outcome: 'Any rated eye bolt, including a plain one, sized on its vertical WLL.' },
        { condition: 'Angled pull in one plane, eye can face it', outcome: 'Shoulder, machinery or collar eye bolt, derated for the angle from its table.' },
        { condition: 'Pull beyond the bolt’s table — over 45° on a DIN 580, or across the eye on any type', outcome: 'Not an eye bolt. Use a swivel lifting point.' },
        { condition: 'Load turned over or pulled in changing directions', outcome: 'Swivel lifting point.' },
        { condition: 'Metric tapped hole on a European machine', outcome: 'DIN 580 or a metric swivel lifting point, with thread engagement to suit the material.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Eye bolts and lifting points in this guide',
      skus: ['IH-LR-EB-D580', 'IH-LR-EB-D582', 'IH-LR-EB-SHN', 'IH-LR-EB-MACH', 'IH-LR-EB-REG', 'IH-LR-LP-SLP80', 'IH-LR-LP-80SLSP', 'IH-LR-LP-BLP80'],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Can I lift at an angle with a plain eye bolt?',
          answer:
            'No. Plain (regular nut) eye bolts have no shoulder to resist bending and are rated for a straight, in-line pull only. Use a shoulder or collar eye bolt derated for the angle, or a swivel lifting point.',
        },
        {
          question: 'How much does an eye bolt lose at 45°?',
          answer:
            'A US-pattern shoulder or machinery eye bolt keeps 30% of its rating at 45° from its axis. A DIN 580 collar eye bolt has its own table: an M20 drops from 1,200 kg vertical to 860 kg at 45° in the plane of the eye, and 600 kg at 45° sideways.',
        },
        {
          question: 'How deep should an eye bolt be screwed in?',
          answer:
            'Fully, until the collar or shoulder sits flat. The tapped hole needs enough thread: at least 1.5 times the thread diameter in steel, 2 times in aluminium alloys and 2.5 times in low-strength light metals.',
        },
        {
          question: 'What is the difference between a DIN 580 eye bolt and a DIN 582 eye nut?',
          answer:
            'A DIN 580 eye bolt has its own threaded shank and screws into a tapped hole. A DIN 582 eye nut screws onto a stud or bolt. Both are rated per piece, for vertical and angled pulls, in the same way.',
        },
        {
          question: 'Can I put a washer under an eye bolt?',
          answer:
            'A shim under the shoulder is the accepted way to turn the eye into line with the pull. What you must not do is leave the bolt partly unscrewed to align the eye — the rating assumes the shoulder is seated.',
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'eye-bolts-eye-nuts',
      label: 'Eye bolts and eye nuts',
      blurb: 'DIN 580, DIN 582, shoulder, machinery and stainless eye bolts with full rating tables.',
    },
    {
      type: 'category_link',
      slug: 'lifting-points-pad-eyes',
      label: 'Lifting points and pad eyes',
      blurb: 'Swivel and bolt-on lifting points for angled and changing loads.',
    },
    {
      type: 'related_articles',
      slugs: ['pad-eye-vs-swivel-lifting-point', 'sling-angle-chart', 'types-of-shackles', 'working-load-limit-vs-breaking-strength', 'lifting-equipment-inspection-uae'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-01',
      note: 'DIN 580 figures from DIN 580:2018-04 as published in its user information; shoulder eye bolt reductions from Kito Crosby’s published application instructions (2025). The rating table for the specific bolt governs.',
    },
    {
      type: 'cta_block',
      heading: 'Need lifting points for a machine or a module?',
      body: 'Send the thread size, the base material and the sling angle. We will quote eye bolts rated for the angle, or swivel lifting points where an eye bolt will not do, with the manufacturer’s test certificate.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
