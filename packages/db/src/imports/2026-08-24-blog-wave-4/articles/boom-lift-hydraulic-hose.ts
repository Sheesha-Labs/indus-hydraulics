import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'boom-lift-hydraulic-hose',
  title: 'Boom lifts and scissor lifts: hoses inside a certified machine',
  excerpt:
    'Access equipment carries people. That changes what a hose replacement is — not a repair, but a modification to a machine whose certification assumes it is in the condition it was inspected in.',
  categorySlug: 'machine-down',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Boom lift and scissor lift hydraulic hose replacement',
  seoDescription:
    'Hydraulic hose on MEWPs: which circuits hold the platform, why emergency lowering matters, and what documentation a replacement on certified access equipment needs.',
  focusKeyword: 'boom lift hydraulic hose',
  publishedAt: '2026-08-24T14:32:09.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Lift, boom and levelling circuits hold a platform with people on it. Nothing about those is routine.',
        'Emergency lowering exists because hydraulic failure at height is anticipated. It must work, and it is worth testing.',
        'A hose replacement on certified access equipment is a documented change, not a quiet fix.',
        'Platform levelling failures are the dangerous ones — the platform tilts rather than stops.',
        'Specification substitution is not acceptable here, even to get a machine back on a job.',
      ],
    },
    {
      type: 'lead',
      html: 'Every other machine in this section can be recovered by parking it. Access equipment cannot, because when it fails there is somebody standing on the part that stopped working — which is why the discipline around these hoses looks more like the crane article than like the loader one.',
    },

    { type: 'section_head', number: '/01', title: 'What each circuit holds up.', anchor: 'circuits' },
    {
      type: 'comparison_table',
      caption: 'Consequence by circuit',
      columns: ['Circuit', 'What a failure means'],
      rows: [
        { cells: ['Lift / scissor pack', 'Platform descent if holding is lost'], highlight: true },
        { cells: ['Boom lift and telescope', 'Platform movement or descent at height'], highlight: true },
        { cells: ['Platform levelling', 'Platform tilts — the most dangerous single failure'], highlight: true },
        { cells: ['Slew', 'Uncontrolled rotation at height'] },
        { cells: ['Drive and steer', 'Machine immobile; occupants safe'] },
        { cells: ['Outriggers / stabilisers', 'Loss of stability while set up'], highlight: true },
      ],
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Levelling failures tilt the platform rather than stopping it.',
      body: 'Most hydraulic failures on access equipment stop a function. A levelling circuit failure changes the attitude of the platform while somebody is on it, which is a fundamentally different event. These lines are not the place to accept an approximate replacement.',
    },

    { type: 'section_head', number: '/02', title: 'Emergency lowering is a hydraulic system too.', anchor: 'emergency-lowering' },
    {
      type: 'paragraph',
      html: 'Access machines carry a manual or auxiliary means of bringing the platform down when the primary system has failed. It is there precisely because hydraulic failure at height is a foreseeable event. <strong>It is also, on many machines, the least exercised part of the hydraulics</strong> — and a system nobody has operated in two years is a system nobody knows the state of.',
    },
    {
      type: 'paragraph',
      html: 'If you are inspecting hoses on a MEWP, the emergency lowering circuit is part of the inspection, not an afterthought to it.',
    },

    { type: 'section_head', number: '/03', title: 'Replacement is a documented change.', anchor: 'documented' },
    {
      type: 'paragraph',
      html: 'Access equipment is certified on the basis of a thorough examination by a competent person. A hose replaced with an assembly of unknown specification and no test record puts an undocumented component into that machine. <strong>Whether that affects the certification is a question for your competent person</strong> — what we can do is make sure the evidence exists when they ask.',
    },
    {
      type: 'comparison_table',
      caption: 'What should exist after a MEWP hose replacement',
      columns: ['Item', 'Why'],
      rows: [
        { cells: ['Assembly built to the specified grade for that circuit', 'Substitution is not acceptable on a machine carrying people'] },
        { cells: ['Proof test record', 'Evidence rather than assumption'], highlight: true },
        { cells: ['Traceability tag with build date', 'Makes the next inspection meaningful'] },
        { cells: ['Function test including emergency lowering', 'Confirms the whole system, not just the joint'] },
      ],
    },
    { type: 'product_embed', heading: 'Grades used on access equipment', skus: ['IH-HOSE-R2-2SN', 'IH-HOSE-2SC'] },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Built, proof tested and tagged.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can we replace a MEWP hose in-house?', answer: 'That depends on your own competence arrangements and your inspection regime, not on us. What matters either way is that the assembly is to specification and that a record of it exists.' },
        { question: 'Does a hose replacement invalidate the thorough examination?', answer: 'A question for your competent person. Supplying a specified, tested and tagged assembly is what makes their answer straightforward rather than awkward.' },
        { question: 'How often should access equipment hoses be replaced?', answer: 'On age and duty rather than on failure, because failure is the event the schedule exists to prevent. Tagged assemblies with build dates are what make that possible.' },
        { question: 'The platform drifts down slowly. Is that a hose?', answer: 'Possibly, but drift with no external leak more often points at holding valves or cylinder seals. On a machine that carries people it is worth diagnosing properly rather than replacing the cheapest part.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Guidance from our own practice supplying access equipment operators. Inspection, certification and competence requirements are set by your regime, not by us.',
    },
    { type: 'cta_block', heading: 'Access machine out of service?', body: 'Assemblies to the specified grade, proof tested and tagged, so the paperwork exists when your competent person asks for it.', quoteLabel: 'Get a MEWP hose made' },
  ],
}

export default ARTICLE
