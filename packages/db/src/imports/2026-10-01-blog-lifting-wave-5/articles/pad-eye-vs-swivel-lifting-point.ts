import type { BlogArticleSeed } from '../shared'

/**
 * Lifting points compared — weld-on, bolt-on, swivel, eye bolt.
 *
 * Sources checked 2026-10-01: Crosby S-265 weld-on pivoting link instructions
 * (qualified welder and procedure, two passes, no rapid cooling, MPI/dye
 * penetrant if in doubt, load within 90° of in-line); RUD VLBS / W-ABA user
 * instructions (authorised welder, inspect after welding, WLL differs by load
 * direction, temperature derating); Crosby HR-125M (360° swivel / 180° pivot,
 * torque wrench, no spacers, tap depth, proof 2.5 × WLL); RUD VRS (thread
 * engagement 1.5/2/2.5 × M, torque table, not for rotation under load);
 * LEEA COPSULE 1.A4.3 (other lifting points need a check by a suitably
 * qualified person, recorded). ASME BTH-1 scope only.
 * Product figures: our Grade 80 swivel lifting screw point (M12: 1 t at 0°,
 * 0.5 t at 90°) and Grade 80 weld-on pivoting D link.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'pad-eye-vs-swivel-lifting-point',
  title: 'Lifting points compared: weld-on pad eyes, bolt-on and swivel lifting points, and eye bolts',
  excerpt:
    'A weld-on lifting point is only as good as its weld. A bolt-on point is only as good as its thread engagement and torque. A swivel point turns to face the sling, but not every one keeps its full rating sideways. Here is how the four kinds of lifting point compare, and what each needs to be fitted properly.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Pad eye vs swivel lifting point vs eye bolt: lifting points compared',
  seoDescription:
    'Weld-on pad eyes and D rings, bolt-on and swivel lifting points, and eye bolts compared: ratings by direction, welding and torque rules, and when each is the right choice.',
  focusKeyword: 'pad eye vs swivel lifting point',
  publishedAt: '2026-10-01T12:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Weld-on lifting points must be welded by a qualified welder to a qualified procedure, on a weldable steel, and inspected after welding. The rating depends on it.',
        'Bolt-on and swivel lifting points depend on thread engagement and torque: at least 1.5 × the thread diameter in steel, 2 × in aluminium, tightened with a torque wrench.',
        'Swivel lifting points turn to face the sling, but check the rating by direction: our Grade 80 swivel lifting screw point at M12 is 1 t in line and 0.5 t at 90°.',
        'Eye bolts are the simplest point and the most sensitive to angle; plain eye bolts are for straight pulls only.',
        'Custom-made pad eyes need a design check by a suitably qualified person, recorded in writing.',
      ],
    },
    {
      type: 'lead',
      html: 'Every lift starts at a lifting point, and it is the one component in the rig that is often fitted by someone other than the rigger — welded on in a fabrication shop or screwed in by a fitter. That is why lifting point failures tend to be fitting failures. The point itself was rated; the way it was attached was not.',
    },

    { type: 'section_head', number: '/01', title: 'The four kinds at a glance.', anchor: 'at-a-glance' },
    {
      type: 'comparison_table',
      caption: 'Lifting points compared',
      columns: ['Type', 'Strengths', 'Depends on'],
      rows: [
        { cells: ['Weld-on pad eye or D ring', 'Permanent; no hole needed; low profile', 'Weld procedure, welder, base steel and inspection'] },
        { cells: ['Bolt-on lifting point', 'Removable; rated by load direction', 'Thread engagement and tightening torque'] },
        { cells: ['Swivel lifting point', 'Turns and pivots to face the sling', 'Torque, tap depth and its directional rating'], highlight: true },
        { cells: ['Eye bolt', 'Simple and cheap', 'Seating, and the angle of pull — see our eye bolt guide'] },
      ],
    },

    { type: 'section_head', number: '/02', title: 'Weld-on pad eyes and D rings.', anchor: 'weld-on' },
    {
      type: 'paragraph',
      html: 'A weld-on lifting point is rated as a component; the finished lifting point is only as strong as the weld that holds it. Makers of weld-on points set conditions for the rating to apply:',
    },
    {
      type: 'prose',
      html: '<ul><li>Weld only by a qualified welder, to a qualified welding procedure — AWS, ISO 9606-1 or the equivalent local standard.</li><li>Weld only to a weldable steel; for other grades, a procedure has to be developed for that steel.</li><li>Preheat where the procedure requires it, weld in at least two passes, and do not cool the weld rapidly.</li><li>Never weld on the load-bearing ring or bail itself.</li><li>Inspect the finished weld. No cracks, pitting or undercut; if there is any doubt, check by magnetic particle or dye penetrant testing.</li><li>Place the point so it lines up with the direction of pull. Weld-on points are rated differently in different directions — check the maker’s table.</li></ul>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A pad eye plate is not always a lifting point.',
      body: 'Many stainless pad eyes, eye plates and D rings on plates are deck and marine hardware for lashing and rigging, sold with no lifting rating. Use a weld-on point as a lifting point only if it carries a published WLL and is made for lifting.',
    },

    { type: 'section_head', number: '/03', title: 'Bolt-on and swivel lifting points.', anchor: 'bolt-on-swivel' },
    {
      type: 'paragraph',
      html: 'A bolt-on or swivel lifting point screws into a tapped hole or bolts through the load. A swivel lifting point turns through 360° and its ring or bail pivots, so it lines itself up with the sling leg instead of being bent across.',
    },
    {
      type: 'prose',
      html: '<ul><li><strong>Engage enough thread:</strong> at least 1.5 × the thread diameter in steel and cast iron, 2 × in aluminium, and 2.5 × in aluminium-magnesium alloys.</li><li><strong>Tighten to the rated torque with a torque wrench,</strong> and never fit spacers or washers under the bushing.</li><li><strong>Tap deep enough:</strong> for swivel hoist rings, at least the shank length plus half the shank diameter.</li><li><strong>Swivel is for alignment,</strong> not for spinning the load: some swivel points are made to turn to face the sling but not to rotate under load.</li></ul>',
    },
    {
      type: 'paragraph',
      html: '<strong>Check the rating by direction.</strong> Swivel points are better than eye bolts at an angle, but they are not all rated the same in every direction. Our Grade 80 swivel lifting screw point is rated 1 t in line at M12 and 0.5 t at 90°. Read the table for the point you are fitting.',
    },
    {
      type: 'direct_answer',
      question: 'What is the difference between a pad eye and a swivel lifting point?',
      answer:
        'A pad eye is a plate or ring welded to the load: permanent and low-profile, but only as strong as its weld and rated differently by direction. A swivel lifting point screws or bolts on, turns and pivots to face the sling, and depends on thread engagement and torque. Choose a swivel point where the pull direction changes.',
    },

    { type: 'section_head', number: '/04', title: 'Custom pad eyes.', anchor: 'custom' },
    {
      type: 'paragraph',
      html: 'Pad eyes cut and welded from plate to suit a particular module, skid or container are designed, not bought. They need a design check by a suitably qualified person, recorded in writing, and are typically designed to a recognised standard such as ASME BTH-1 or the offshore container rules that apply to the job. Do not treat a fabricated pad eye as rated until its calculation and any required test are on file.',
    },
    {
      type: 'decision_tree',
      heading: 'Choosing a lifting point',
      intro: 'Start from whether the point stays on the load.',
      branches: [
        { condition: 'Permanent point on a steel structure or skid', outcome: 'Rated weld-on lifting point, welded to a qualified procedure and inspected.' },
        { condition: 'Removable point on machinery with tapped holes', outcome: 'Bolt-on or swivel lifting point, torqued to the maker’s figure.' },
        { condition: 'Sling angle will change, or the load is turned over', outcome: 'Swivel lifting point, checked for its rating in that direction.' },
        { condition: 'Straight vertical lift from a tapped hole', outcome: 'An eye bolt is acceptable — see our eye bolt guide.' },
        { condition: 'Purpose-made pad eye on a fabricated module', outcome: 'Engineered design check, recorded in writing.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Lifting points in this guide',
      skus: ['IH-LR-LP-80WPDL', 'IH-LR-LP-SLP80', 'IH-LR-LP-80SLSP', 'IH-LR-LP-BLP80', 'IH-LR-LP-80FDR', 'IH-LR-LP-DSS80'],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Who can weld a lifting point?',
          answer:
            'A qualified welder working to a qualified welding procedure for that steel. The weld should then be inspected, by magnetic particle or dye penetrant testing if there is any doubt.',
        },
        {
          question: 'Are swivel lifting points rated the same in every direction?',
          answer:
            'Not all of them. Some carry less at 90° than in line — our Grade 80 swivel lifting screw point at M12 is 1 t in line and 0.5 t at 90°. Read the maker’s table for each direction.',
        },
        {
          question: 'How tight should a swivel hoist ring be?',
          answer:
            'To the maker’s rated torque, applied with a torque wrench, with no spacers under the bushing.',
        },
        {
          question: 'Can I use a stainless pad eye plate for lifting?',
          answer:
            'Only if it carries a published WLL and is made for lifting. Many pad eye plates are marine and lashing hardware with no lifting rating.',
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'lifting-points-pad-eyes',
      label: 'Lifting points and pad eyes',
      blurb: 'Weld-on, bolt-on and swivel lifting points with ratings by direction.',
    },
    {
      type: 'category_link',
      slug: 'eye-bolts-eye-nuts',
      label: 'Eye bolts and eye nuts',
      blurb: 'DIN 580, shoulder and machinery eye bolts.',
    },
    {
      type: 'related_articles',
      slugs: ['eye-bolt-types-and-angled-loads', 'sling-angle-chart', 'master-links-explained', 'lifting-equipment-inspection-uae'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-01',
      note: 'Fitting rules from published Crosby and RUD lifting point instructions and the LEEA Code of Practice. Product figures from the linked size tables.',
    },
    {
      type: 'cta_block',
      heading: 'Specifying lifting points for a skid or machine?',
      body: 'Tell us the load, the number of points, the sling angle and the base material. We will quote weld-on or swivel lifting points rated for the directions you need, with the manufacturer’s certificate.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
