import type { BlogArticleSeed } from '../shared'

/**
 * Eye bolt capacity chart.
 *
 * Vertical / in-line ratings generated from the live eye bolt listings. The
 * generator asserts DIN 580 = DIN 582 per size, and that the SHN, MACH and
 * REG US eye bolts share one in-line rating per nominal size. DIN 580 angled
 * columns (M8–M42 only) and the US 80/65/30/25% reductions are the figures
 * verified for eye-bolt-types-and-angled-loads (2026-10-01). Stainless DIN
 * 580 is left out: its table duplicates the carbon one and awaits the
 * supplier.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'eye-bolt-capacity-chart',
  title: 'Eye bolt capacity chart: DIN 580, BS 4278, JIS and US eye bolts by thread size',
  excerpt: 'Eye bolt working load limits by thread: DIN 580 and DIN 582 from M8 to M100 with angled ratings, BS 4278 and JIS B 1168 collar eye bolts, US shoulder and machinery eye bolts at 0°, 15°, 30°, 45° and 90°, and eye nuts — with the fitting rules every rating assumes.',
  categorySlug: 'rigging-capacity-charts',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Eye bolt capacity chart — DIN 580, BS 4278, JIS and US sizes',
  seoDescription: 'Eye bolt WLL chart by thread size: DIN 580/582 M8–M100 with 45° ratings, BS 4278, JIS B 1168, and US shoulder eye bolts at 15°, 30°, 45° and 90°.',
  focusKeyword: 'eye bolt capacity chart',
  publishedAt: '2026-10-13T12:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A DIN 580 M20 eye bolt is rated 1,200 kg vertical, 860 kg at up to 45° in the plane of the eye and 600 kg at up to 45° sideways. A pull across the eye is not rated.',
        'The same M20 thread is rated 630 kg as a JIS B 1168 bolt and 1,600 kg as a BS 4278 collared eyebolt. Read the rating for the standard on the bolt.',
        'US shoulder and machinery eye bolts keep 80% of their rating at 15° from in-line, 65% at 30°, 30% at 45° and 25% at 90°.',
        'Plain (regular nut) eye bolts are rated for a straight, in-line pull only, whatever their size.',
        'Every rating assumes the collar or shoulder sits flat and fully home, with enough thread engaged.',
      ],
    },
    {
      type: 'lead',
      html: 'Eye bolt ratings are the least portable numbers in rigging. The same thread size is rated very differently under DIN, British, Japanese and US standards, and every one of those ratings falls — or disappears — when the pull leans away from the bolt’s axis. The charts below are grouped by standard, so the figure you read is the one for the bolt in your hand.',
    },
    {
      type: 'direct_answer',
      question: 'How much can an eye bolt lift?',
      answer: 'It depends on the standard, the thread and the direction of pull. A DIN 580 eye bolt is rated 340 kg at M12, 700 kg at M16, 1,200 kg at M20 and 1,800 kg at M24 for a vertical pull, and about 70% of that at up to 45° in the plane of the eye. A pull across the eye is not permitted.',
    },
    { type: 'section_head', number: '/01', title: 'DIN 580 eye bolts and DIN 582 eye nuts.', anchor: 'din-580' },
    {
      type: 'paragraph',
      html: 'DIN 580 eye bolts and DIN 582 eye nuts share one rating per thread size. Each bolt is rated for three directions: a vertical pull, a pull at up to 45° in the plane of the eye, and a pull at up to 45° across it (sideways). Ratings are per bolt, in kilograms.',
    },
    {
      type: 'comparison_table',
      caption: 'DIN 580 / DIN 582 — WLL per piece (kg) and weight (kg)',
      columns: ['Thread', 'Eye ID (mm)', 'Vertical', '≤45° in eye plane', '≤45° sideways', 'DIN 580 weight', 'DIN 582 weight'],
      rows: [
        { cells: ['M8', '20', '140', '100', '70', '0.06', '0.05'] },
        { cells: ['M10', '25', '230', '170', '115', '0.11', '0.09'] },
        { cells: ['M12', '30', '340', '240', '170', '0.18', '0.15'] },
        { cells: ['M16', '35', '700', '500', '350', '0.28', '0.24'] },
        { cells: ['M20', '40', '1,200', '860', '600', '0.45', '0.36'] },
        { cells: ['M24', '50', '1,800', '1,290', '900', '0.74', '0.72'] },
        { cells: ['M30', '65', '3,200', '2,300', '1,600', '1.66', '1.32'] },
        { cells: ['M36', '75', '4,600', '3,300', '2,300', '2.65', '2.08'] },
        { cells: ['M42', '85', '6,300', '4,500', '3,150', '4.03', '3.11'] },
        { cells: ['M48', '100', '8,600', '—', '—', '6.38', '5.02'] },
        { cells: ['M56', '110', '11,500', '—', '—', '8.8', '6.69'] },
        { cells: ['M64', '120', '16,000', '—', '—', '12.4', '9.3'] },
        { cells: ['M72×6', '150', '20,000', '—', '—', '23.3', '—'] },
        { cells: ['M80×6', '170', '28,000', '—', '—', '34.2', '—'] },
        { cells: ['M100×6', '190', '40,000', '—', '—', '49.1', '—'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The angled columns are given here for M8 to M42, where we have checked them against the DIN 580:2018 user information. Above M42 the angled ratings are in the maker’s instructions supplied with the bolt. There is no rating for a pull at 90° to the eye: the standard says such a pull must not be applied. The ratings hold from −20 °C to 200 °C.',
    },
    { type: 'section_head', number: '/02', title: 'Same thread, different standard.', anchor: 'same-thread' },
    {
      type: 'comparison_table',
      caption: 'Vertical WLL (kg) at the same thread size, by standard, from our tables',
      columns: ['Thread', 'DIN 580', 'JIS B 1168', 'BS 4278 collared'],
      rows: [
        { cells: ['M8', '140', '80', '150'] },
        { cells: ['M10', '230', '150', '250'] },
        { cells: ['M12', '340', '220', '400'] },
        { cells: ['M16', '700', '450', '800'] },
        { cells: ['M20', '1,200', '630', '1,600'] },
        { cells: ['M24', '1,800', '950', '2,500'] },
        { cells: ['M30', '3,200', '1,500', '4,000'] },
        { cells: ['M36', '4,600', '2,300', '6,300'] },
        { cells: ['M42', '6,300', '3,400', '8,000'] },
        { cells: ['M48', '8,600', '4,500', '10,000'] },
        { cells: ['M64', '16,000', '9,000', '20,000'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'At M20 the three standards give 630, 1,200 and 1,600 kg. All three are correct; they are different designs, steels and rating rules. A bolt marked with one standard is never lifted on another standard’s table — and a metric collar eye bolt is never assumed to match a US machinery eye bolt of a similar thread.',
    },
    {
      type: 'comparison_table',
      caption: 'BS 4278 collared eyebolt, standard shank (Table 1) — from our table',
      columns: ['Thread', 'WLL (t)', 'Eye ID (mm)', 'Thread length (mm)', 'Weight (kg)'],
      rows: [
        { cells: ['M6', '0.1', '15', '18', '0.06'] },
        { cells: ['M8', '0.15', '15', '18', '0.06'] },
        { cells: ['M10', '0.25', '15', '18', '0.06'] },
        { cells: ['M12', '0.4', '15', '18', '0.06'] },
        { cells: ['M14', '0.5', '20', '23', '0.15'] },
        { cells: ['M16', '0.8', '20', '23', '0.15'] },
        { cells: ['M18', '1', '24', '28', '0.27'] },
        { cells: ['M20', '1.6', '27', '32', '0.38'] },
        { cells: ['M22', '1.6', '30', '35', '0.54'] },
        { cells: ['M24', '2.5', '35', '40', '0.85'] },
        { cells: ['M27', '2.5', '39', '46', '1.13'] },
        { cells: ['M30', '4', '44', '51', '1.62'] },
        { cells: ['M33', '4', '48', '56', '2.37'] },
        { cells: ['M36', '6.3', '54', '63', '3.12'] },
        { cells: ['M39', '6.3', '57', '67', '3.81'] },
        { cells: ['M42', '8', '68', '79', '6.27'] },
        { cells: ['M45', '8', '68', '79', '6.45'] },
        { cells: ['M48', '10', '68', '79', '6.51'] },
        { cells: ['M52', '12.5', '76', '89', '9.58'] },
        { cells: ['M56', '16', '86', '100', '12.99'] },
        { cells: ['M64', '20', '96', '112', '18.2'] },
      ],
    },
    { type: 'section_head', number: '/03', title: 'US shoulder and machinery eye bolts, by angle.', anchor: 'us-shoulder' },
    {
      type: 'paragraph',
      html: 'US-pattern shoulder nut and machinery eye bolts are rated in pounds for an in-line pull, then reduced as the pull leans away from the bolt’s axis. The reduction is 80% at 15°, 65% at 30°, 30% at 45° and 25% at 90°, applied in the plane of the eye. Our shoulder nut, machinery and regular nut eye bolts carry the same in-line rating at each nominal size:',
    },
    {
      type: 'comparison_table',
      caption: 'US shoulder and machinery eye bolt WLL by angle from in-line (lb), with in-line kg',
      columns: ['Size', 'In line (lb)', 'In line (kg)', '15° (lb)', '30° (lb)', '45° (lb)', '90° (lb)'],
      rows: [
        { cells: ['1/4″', '650', '294', '520', '422.5', '195', '162.5'] },
        { cells: ['5/16″', '1,200', '540', '960', '780', '360', '300'] },
        { cells: ['3/8″', '1,550', '700', '1,240', '1,007.5', '465', '387.5'] },
        { cells: ['1/2″', '2,600', '1,175', '2,080', '1,690', '780', '650'] },
        { cells: ['5/8″', '5,200', '2,355', '4,160', '3,380', '1,560', '1,300'] },
        { cells: ['3/4″', '7,200', '3,265', '5,760', '4,680', '2,160', '1,800'] },
        { cells: ['7/8″', '10,600', '4,805', '8,480', '6,890', '3,180', '2,650'] },
        { cells: ['1″', '13,300', '6,030', '10,640', '8,645', '3,990', '3,325'] },
        { cells: ['1-1/4″', '21,000', '9,525', '16,800', '13,650', '6,300', '5,250'] },
        { cells: ['1-1/2″', '24,000', '10,885', '19,200', '15,600', '7,200', '6,000'] },
      ],
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'The angle columns are for shoulder eye bolts only.',
      body: 'A regular nut (plain) eye bolt has the same in-line rating at each size but no shoulder to resist bending, so it is rated for a straight, in-line pull only. Never use it at any of the angles in this chart.',
    },
    {
      type: 'paragraph',
      html: 'The kilogram figures are our conversion of the pound ratings, rounded down. Load the eye in its own plane — turn it to face the pull, with a shim under the shoulder if needed — and never reeve one sling through two eye bolts.',
    },
    { type: 'section_head', number: '/04', title: 'US eye nuts.', anchor: 'eye-nuts' },
    {
      type: 'comparison_table',
      caption: 'US-type eye nut WLL, from our table',
      columns: ['Size', 'WLL (lb)', 'WLL (kg)', 'Max. tap'],
      rows: [
        { cells: ['1/4″', '520', '235', '3/8″'] },
        { cells: ['5/16″', '850', '385', '3/8″'] },
        { cells: ['3/8″', '1,250', '565', '7/16″'] },
        { cells: ['7/16″', '1,700', '770', '1/2″'] },
        { cells: ['1/2″', '2,250', '1,020', '—'] },
        { cells: ['5/8″', '3,600', '1,630', '3/4″'] },
        { cells: ['3/4″', '5,200', '2,355', '7/8″'] },
        { cells: ['7/8″', '7,200', '3,265', '1″'] },
        { cells: ['1″', '10,000', '4,535', '1-1/4″'] },
        { cells: ['1-1/8″', '12,300', '5,575', '1-1/4″'] },
        { cells: ['1-1/4″', '15,500', '7,030', '1-1/2″'] },
        { cells: ['1-3/8″', '18,500', '8,390', '1-1/2″'] },
        { cells: ['1-1/2″', '22,500', '10,205', '1-3/4″'] },
        { cells: ['2″', '40,000', '18,140', '2-3/4″'] },
      ],
    },
    { type: 'section_head', number: '/05', title: 'What every rating assumes.', anchor: 'fitting' },
    {
      type: 'prose',
      html: '<ul><li><strong>Fully seated.</strong> The collar or shoulder is screwed fully home and sits flat across its whole face. A bolt left proud to line up the eye has no rating at all.</li><li><strong>Thread engagement.</strong> In a tapped hole, at least 1.5 × the thread diameter in steel or grey cast iron, 2 × in aluminium alloys and 2.5 × in low-strength light metals.</li><li><strong>Through holes.</strong> A nut on the far side, at least 0.8 × the thread diameter thick for DIN 580.</li><li><strong>Repeated use.</strong> Where the same bolt is screwed into different loads again and again, use the next size up.</li><li><strong>Stainless.</strong> Stainless eye bolts are rated on their own maker’s certificate. Never assume a stainless bolt matches the carbon table for its thread.</li></ul>',
    },
    {
      type: 'paragraph',
      html: 'Worked example: a 1.6 t gearbox has two DIN 580 tapped holes, and a two-leg sling will hang at about 40° from vertical in the plane of the eyes. Each bolt takes half the weight, pulled at an angle, so each must be rated at least 800 kg in the ≤45° in-plane column. M20 gives 860 kg — enough. M16 gives 500 kg — not enough, though its 700 kg vertical rating might suggest otherwise.',
    },
    {
      type: 'decision_tree',
      heading: 'Choosing from the chart',
      intro: 'Start from the direction of the pull.',
      branches: [
        { condition: 'Straight, vertical pull', outcome: 'Any rated eye bolt, sized on its vertical or in-line WLL.' },
        {
          condition: 'Angled pull in the plane of the eye',
          outcome: 'DIN 580 up to 45° from its angled column, or a US shoulder eye bolt from the angle table.',
        },
        { condition: 'Pull across the eye, or beyond 45° on a DIN 580', outcome: 'Not an eye bolt. Use a swivel lifting point.' },
        { condition: 'Load turned over or pulled in changing directions', outcome: 'Swivel lifting point, rated for the full angle range.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Eye bolts in these charts',
      skus: ['IH-LR-EB-D580', 'IH-LR-EB-D582', 'IH-LR-EB-CEB4278T1', 'IH-LR-EB-JIS68', 'IH-LR-EB-SHN', 'IH-LR-EB-MACH', 'IH-LR-EB-REG', 'IH-LR-EB-NUT'],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'What is the WLL of an M12 eye bolt?',
          answer: '340 kg vertical for a DIN 580 eye bolt, 240 kg at up to 45° in the plane of the eye and 170 kg at up to 45° sideways. A JIS B 1168 M12 is rated 220 kg and a BS 4278 M12 400 kg.',
        },
        {
          question: 'What is the WLL of an M20 eye bolt?',
          answer: '1,200 kg vertical for DIN 580, 860 kg at ≤45° in the eye plane and 600 kg at ≤45° sideways. JIS B 1168 M20 is 630 kg; BS 4278 M20 is 1,600 kg.',
        },
        {
          question: 'How much does an eye bolt lose at 45°?',
          answer: 'A US shoulder or machinery eye bolt keeps 30% of its in-line rating at 45°. A DIN 580 bolt keeps about 70% at up to 45° in the plane of the eye and about 50% at up to 45° sideways, from its own table.',
        },
        {
          question: 'Can a DIN 580 eye bolt be loaded at 90°?',
          answer: 'No. DIN 580 gives no rating for a pull at 90° to the bolt and says it must not be applied. Use a swivel lifting point.',
        },
        {
          question: 'Do DIN 580 eye bolts and DIN 582 eye nuts have the same rating?',
          answer: 'Yes, size for size. The bolt screws into a tapped hole; the nut screws onto a stud or bolt.',
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'eye-bolts-eye-nuts',
      label: 'Eye bolts and eye nuts',
      blurb: 'DIN 580, DIN 582, BS 4278, JIS and US eye bolts with full rating tables.',
    },
    {
      type: 'category_link',
      slug: 'lifting-points-pad-eyes',
      label: 'Lifting points and pad eyes',
      blurb: 'Swivel lifting points for angled and changing pulls.',
    },
    {
      type: 'related_articles',
      slugs: [
        'eye-bolt-types-and-angled-loads',
        'pad-eye-vs-swivel-lifting-point',
        'shackle-size-and-capacity-chart',
        'sling-angle-chart',
        'working-load-limit-vs-breaking-strength',
        'lifting-equipment-inspection-uae',
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-13',
      note: 'Vertical and in-line ratings from our eye bolt listings. DIN 580 angled ratings from DIN 580:2018 user information; US angle reductions from published Crosby-pattern application instructions. The bolt’s marking and certificate govern.',
    },
    {
      type: 'cta_block',
      heading: 'Need lifting points for a machine?',
      body: 'Send the thread size, the base material and the sling angle. We will quote eye bolts rated for the angle, or swivel lifting points where an eye bolt will not do.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
