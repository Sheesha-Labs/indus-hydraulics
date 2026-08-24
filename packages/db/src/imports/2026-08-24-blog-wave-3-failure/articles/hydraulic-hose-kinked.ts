import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-hose-kinked',
  title: 'Kinked at the fitting: bend radius against elbow choice',
  excerpt:
    'A hose bent tighter than its rated radius is damaged whether or not it looks it. The fix is almost never a more flexible hose — it is turning the line at the fitting instead of at the hose.',
  categorySlug: 'failure-analysis',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Kinked hydraulic hose — bend radius, elbows and compact grades',
  seoDescription:
    'Why hydraulic hoses kink at the fitting, what minimum bend radius actually means, and the two fixes that work: an elbow fitting or a compact construction.',
  focusKeyword: 'hydraulic hose kink',
  publishedAt: '2026-08-24T13:42:12.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Minimum bend radius is a rated limit, not a guideline. Inside it the reinforcement is already distorted.',
        'A bend must not start at the ferrule. The hose needs a straight run out of the fitting before it turns.',
        'Bend radius rises with bore and is much larger on spiral construction than on braid.',
        'Compact grades bend far tighter at the same pressure — at −08, EN 857 2SC bends to 90 mm where EN 853 2SN needs 180 mm.',
        'An elbow fitting turns the line at the fitting so the hose can leave it straight. That is what elbows are for.',
      ],
    },
    {
      type: 'lead',
      html: 'Bend radius is the specification most often treated as advisory. It is not — it is the radius below which the manufacturer no longer stands behind the hose, and a hose bent tighter has already lost capability whether or not anything looks wrong from outside.',
    },

    { type: 'section_head', number: '/01', title: 'What happens inside a tight bend.', anchor: 'inside-the-bend' },
    {
      type: 'paragraph',
      html: 'Bend a reinforced hose and the wire on the outside of the curve stretches while the wire on the inside bunches. Within the rated radius both stay within what the construction tolerates. <strong>Below it, the outer wires carry more than their share and the inner ones can buckle</strong> — and a buckled wire does not recover when the hose straightens.',
    },
    {
      type: 'paragraph',
      html: 'A visible kink is the extreme case, where the tube itself has collapsed and flow is restricted as well. The more common case is a bend a little tighter than rated, no visible deformity, and a hose that fails in that spot a year earlier than it should have.',
    },
    {
      type: 'direct_answer',
      question: 'What happens if a hydraulic hose is bent too tight?',
      answer:
        'The reinforcement distorts — outer wires overload and inner wires can buckle — which permanently reduces what the hose can hold, whether or not a kink is visible. Below the rated bend radius the hose is outside its specification, and the failure normally appears at the tightest point of the bend rather than at the fittings.',
    },

    { type: 'section_head', number: '/02', title: 'The radius depends on grade and size.', anchor: 'radius-varies' },
    {
      type: 'paragraph',
      html: 'There is no single figure. Bend radius rises steeply with bore, and differs substantially between constructions at the same bore — which is exactly the trade a compact grade exists to make.',
    },
    {
      type: 'comparison_table',
      caption: 'Minimum bend radius in mm, by construction and dash size',
      columns: ['Construction', '−04', '−08', '−12', '−16', '−24'],
      rows: [
        { cells: ['EN 853 2SN', '100', '180', '240', '300', '500'] },
        { cells: ['EN 857 2SC compact', '50', '90', '120', '150', '—'], highlight: true },
        { cells: ['EN 856 4SP spiral', '150', '230', '300', '340', '500'] },
        { cells: ['EN 856 4SH spiral', '—', '—', '280', '340', '560'] },
        { cells: ['SAE 100R14 PTFE', '45', '70', '190', '270', '—'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Read the compact row against the standard braid row. <strong>At −08 the compact hose turns in half the space at the same pressure class</strong>, and at −04 in half again. Where routing is the constraint rather than pressure, that is usually the answer.',
    },

    { type: 'section_head', number: '/03', title: 'The bend must not start at the ferrule.', anchor: 'not-at-the-ferrule' },
    {
      type: 'paragraph',
      html: 'A hose needs a straight length coming out of the fitting before it begins to turn. Start the bend at the ferrule and two things happen at once: the bend is tighter than it appears because the stiff ferrule is taking up part of the arc, and the hose is being levered against the fitting every time pressure rises.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'This is the fault that gets mistaken for a bad crimp.',
      body: 'A hose bending straight out of the ferrule fails at the ferrule, which looks like a build problem and is not. Before blaming a crimp, look at whether the hose leaves the fitting straight or immediately turns.',
    },

    { type: 'section_head', number: '/04', title: 'Two fixes that work.', anchor: 'the-fixes' },
    {
      type: 'decision_tree',
      heading: 'Choose by what is actually constraining you',
      intro: 'A more flexible hose is the third option and usually the worst of the three.',
      branches: [
        { condition: 'The line has to change direction near the port', outcome: 'Use a 45° or 90° elbow fitting.', detail: 'The fitting turns the line and the hose leaves it straight. This removes the bend rather than accommodating it.' },
        { condition: 'The run is genuinely tight along its whole length', outcome: 'Move to a compact construction.', detail: 'EN 857 1SC and 2SC bend to roughly half the radius of the equivalent standard braid grade at the same pressure.', sku: 'IH-HOSE-2SC' },
        { condition: 'The hose is too short and is being forced round', outcome: 'Make it longer, then check the extra length does not create a rub point.', detail: 'A short hose forced into a bend is under tension and torsion as well as over-bent.' },
        { condition: 'Nothing above is available', outcome: 'Rigid tube for the constrained section, hose for the parts that move.', detail: 'Hose is not obliged to do the whole run. A tube run with short hose tails at each end solves routing problems hose alone cannot.' },
      ],
    },
    { type: 'product_embed', heading: 'Compact constructions', skus: ['IH-HOSE-2SC', 'IH-HOSE-R1-1SC'] },
    { type: 'category_link', slug: 'hydraulic-fittings', label: 'Hose fittings by thread type', blurb: 'Straight, 45° and 90° in every family.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is bend radius measured to the inside or the centreline of the bend?', answer: 'To the inside of the curve on the published figures we work from. Where a datasheet does not say, ask before designing to it — the difference is significant at large bore.' },
        { question: 'Does bend radius change with pressure?', answer: 'The rated figure assumes the hose is at working pressure. A hose bent to its limit unpressurised and then pressurised will try to straighten, which loads the fittings, so allow for movement rather than assuming the routing is static.' },
        { question: 'The hose kinked once and then straightened out. Is it damaged?', answer: 'Assume yes. Reinforcement that has buckled does not un-buckle. A hose that has been kinked in handling or installation should not be fitted, even when it looks recovered.' },
        { question: 'Why is spiral hose so much stiffer?', answer: 'Because there is more steel in it, wound as continuous helical layers rather than braided. That construction is what gives spiral its near-flat pressure rating across the bore range, and the stiffness is the price.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Bend radius figures from the Intertraco (Italia) S.p.A. hydraulic hose catalogue for the constructions we stock. Confirm against the datasheet for the assembly supplied.',
    },
    { type: 'cta_block', heading: 'Routing tighter than the hose allows?', body: 'Send the route and the pressure. Usually the answer is an elbow or a compact grade rather than a compromise, and we stock both.', quoteLabel: 'Solve a routing problem' },
  ],
}

export default ARTICLE
