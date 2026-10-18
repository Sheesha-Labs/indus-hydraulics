import type { BlogArticleSeed } from '../shared'

/**
 * Steel erection rigging. Checked 2026-10-14: OSHA 29 CFR 1926.753(e) multiple lifts (≤5 members,
 * ≥7 ft apart, trained, rigging assembly designed with rated capacity), 1926.251(a)(2)/(a)(4)
 * (marking; custom clamps proof-tested to 125%), 1926.1408 (non-conductive tag lines near power
 * lines). US rules quoted as examples of good practice; UAE rules from earlier verified memory.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'steel-erection-rigging-equipment',
  title: 'Steel erection rigging equipment: slings, shackles, clamps and tag lines for steelwork',
  excerpt:
    'Erecting structural steel means hundreds of lifts of awkward, heavy, edge-sharp members, often at height and in wind. The rigging kit a steel erection crew needs — chain slings, shackles, beam and plate clamps, lifting points, tag lines — how to choose each, and the rules that apply to multiple lifts, clamps and tag lines.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Steel Erection Rigging Equipment: What Crews Need',
  seoDescription:
    'Rigging equipment for structural steel erection: chain and wire rope slings, shackles, beam and plate lifting clamps, lifting points and tag lines — plus multiple-lift rules, clamp marking and edge protection.',
  focusKeyword: 'steel erection rigging equipment',
  publishedAt: '2026-10-14T10:05:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Chain slings are the steel erector’s workhorse: tough, easy to shorten, and unharmed by edges that would cut a synthetic sling.',
        'Beam and plate clamps must be rated and marked, used only within their jaw range and in the direction they are designed for.',
        'Use bolt-type shackles where rigging stays on a member; screw pins where it is made and broken often.',
        'Tag lines control rotation from a safe distance — non-conductive near power lines, and never wrapped round a hand.',
        'Multiple lifts ("Christmas-treeing") need an engineered rigging assembly and trained crews; US rules cap them at five members.',
      ],
    },
    {
      type: 'lead',
      html: 'Steelwork is the most rigging-intensive phase of most buildings. Columns, beams, bracing, trusses and plate arrive by truck and go up member by member, often several dozen lifts a day per crane. The members are heavy for their size, have sharp flange edges, and must be landed precisely at height. The kit has to be quick to attach, tough enough for edges, and able to hold a member level and controlled. This guide sets out what a steel erection crew uses. For the overall loft, see the <a href="/blog/site-mobilisation-rigging-kit">site mobilisation rigging kit</a>.',
    },

    { type: 'section_head', number: '/01', title: 'Slings for steel.', anchor: 'slings' },
    {
      type: 'comparison_table',
      caption: 'Slings on a steel erection job',
      columns: ['Sling', 'Best for', 'Watch for'],
      rows: [
        { cells: ['Chain sling, 2-leg (Grade 80/100)', 'Beams, columns, bundles; shortening clutches level the load', 'Weight; check hooks and links for stretch'], highlight: true },
        { cells: ['Wire rope sling', 'Long members, heavy trusses', 'Kinks and broken wires on sharp edges'] },
        { cells: ['Round and webbing slings', 'Painted, galvanised or finished steel', 'Must be protected from flange edges'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Two-leg chain slings with shortening hooks or clutches let the rigger level a beam with uneven legs — the most common steel lift. Synthetic slings are fine on painted or galvanised members if every edge is padded; an unprotected flange edge can cut a round sling in one lift. See <a href="/blog/types-of-lifting-slings">types of lifting slings</a> and the <a href="/blog/chain-sling-capacity-chart">chain sling capacity chart</a>, and remember that capacity falls as the sling angle opens — <a href="/blog/sling-angle-chart">sling angle chart</a>.',
    },

    { type: 'section_head', number: '/02', title: 'Beam and plate clamps.', anchor: 'clamps' },
    {
      type: 'paragraph',
      html: 'Clamps grip a member directly, saving a choker and keeping the member clean. Use them only within their rated load and jaw range, in the direction they are made for: vertical plate clamps for plates lifted on edge, horizontal plate clamps (in pairs) for plates lifted flat, and beam clamps on flanges of the right width. In the US, OSHA requires rigging to carry its safe working load marking, and custom lifting clamps to be marked and proof-tested to 125% of their rating before use. Our guide to <a href="/blog/vertical-vs-horizontal-plate-lifting-clamps">vertical vs horizontal plate lifting clamps</a> covers the choice.',
    },
    {
      type: 'direct_answer',
      question: 'What rigging equipment is used for steel erection?',
      answer:
        'Two-leg chain slings with shortening hooks, wire rope and padded synthetic slings, screw-pin and bolt-type shackles, beam and plate lifting clamps rated for the member, lifting points or lugs on heavy fabrications, and tag lines to control rotation — all marked, certified and inspected before use.',
    },

    { type: 'section_head', number: '/03', title: 'Shackles, lugs and lifting points.', anchor: 'connections' },
    {
      type: 'paragraph',
      html: 'Heavy fabrications — trusses, transfer beams, modules — are usually lifted from welded lugs designed by the fabricator’s engineer. Connect to them with anchor shackles, pin through the lug and slings in the bow, sized to the lug’s design load; use <a href="/p/bolt-type-anchor-shackle-g-2130-pattern">bolt-type shackles</a> when the rigging stays on the member. For bolted connections, <a href="/p/grade-80-swivel-lifting-point">swivel lifting points</a> rated for angled pulls beat plain eye bolts. See <a href="/blog/how-to-rig-a-shackle-correctly">how to rig a shackle correctly</a> and <a href="/blog/pad-eye-vs-swivel-lifting-point">pad eye vs swivel lifting point</a>.',
    },

    { type: 'section_head', number: '/04', title: 'Tag lines.', anchor: 'tag-lines' },
    {
      type: 'paragraph',
      html: 'A tag line — a fibre rope tied to the member — lets a worker on the ground or the deck control rotation without standing under the load. Use non-conductive fibre rope (the US crane rules require non-conductive tag lines near power lines), long enough to keep the handler clear, and never wrap it round a hand or body: offshore regulators have recorded workers lifted off their feet by entangled tag lines. Where possible, use push poles or hands-free tools to guide the final landing.',
    },

    { type: 'section_head', number: '/05', title: 'Multiple lifts.', anchor: 'multiple-lifts' },
    {
      type: 'paragraph',
      html: 'Hoisting several members at once on one hook — “Christmas-treeing” — saves crane time but multiplies the consequences of a failure. The US steel erection rules allow it only with a specifically designed rigging assembly of known capacity, crews trained in the procedure, no more than five members per lift, and members rigged at least 7 ft (2.1 m) apart. Wherever you work, treat a multiple lift as an engineered lift: plan it, rate every attachment point and brief the crew.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Are chain slings or synthetic slings better for steel?', answer: 'Chain slings for raw and heavy steel because they resist edges and can be shortened; padded synthetic slings for painted or finished steel.' },
        { question: 'Do beam clamps need to be rated?', answer: 'Yes. Use clamps marked with their rated load and jaw range, within both, in the direction they are designed for.' },
        { question: 'What is a Christmas tree lift?', answer: 'A multiple lift of several members on one hook. US rules cap it at five members, at least 7 ft apart, with an engineered rigging assembly and trained crews.' },
        { question: 'What rope is used for tag lines?', answer: 'Non-conductive fibre rope, long enough to keep the handler out of the load path.' },
        { question: 'Should shackles on steel members be bolt type?', answer: 'For rigging left in place or where the pin could turn, yes; screw pins suit rigging made and broken often.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'For steel erection',
      skus: ['IH-LR-CS-G80DOS', 'IH-LR-CS-G100DOS', 'IH-LR-LC-BEAM', 'IH-LR-LC-CDH', 'IH-LR-LC-PPD', 'IH-LR-SH-G2130', 'IH-LR-LP-SLP80', 'IH-LR-FR-PPMR'],
    },
    {
      type: 'category_link',
      slug: 'lifting-beam-clamps',
      label: 'Lifting and beam clamps',
      blurb: 'Vertical, horizontal and beam lifting clamps, rated and certified.',
    },
    {
      type: 'page_link',
      kind: 'industry',
      slug: 'steel',
      label: 'Steel and metals',
      blurb: 'Rigging and hoisting for steel plants and fabrication.',
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
      slugs: ['site-mobilisation-rigging-kit', 'vertical-vs-horizontal-plate-lifting-clamps', 'chain-sling-capacity-chart', 'how-to-rig-a-shackle-correctly', 'sling-angle-chart', 'pad-eye-vs-swivel-lifting-point'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'US OSHA 29 CFR 1926.753, 1926.251 and 1926.1408 quoted as published; offshore regulator safety alert on tag lines. Local rules govern your site.',
    },
    {
      type: 'cta_block',
      heading: 'Kitting out a steel erection crew?',
      body: 'Send the member weights, crane hooks and number of crews. We will quote slings, clamps, shackles and tag lines with certificates.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
