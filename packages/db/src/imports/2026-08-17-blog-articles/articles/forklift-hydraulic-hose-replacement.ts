import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'forklift-hydraulic-hose-replacement',
  title: 'Forklift hose failure: mast, tilt or attachment',
  excerpt:
    'Three circuits, three very different failure patterns. Which one went, where the hose actually wears, and the safety step that gets skipped on every second job.',
  categorySlug: 'machine-down',
  authorSlug: 'mehul-rana',
  seoTitle: 'Forklift hydraulic hose replacement — mast, tilt and attachment',
  seoDescription:
    'Diagnosing forklift hydraulic hose failure across lift, tilt and attachment circuits. Where mast hoses wear, and how to work on a mast safely.',
  focusKeyword: 'forklift hydraulic hose replacement',
  publishedAt: '2026-08-17T14:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Which function is affected tells you the circuit: lift, tilt or attachment. They fail for different reasons.',
        'Mast hoses wear where they run in the channel and over the sheave, not along the free length.',
        'Attachment hoses at the carriage take the most physical abuse on the machine.',
        'A mast that lowers slowly under load with no external leak is usually not a hose.',
        'Block the mast before working on it. A raised carriage is stored energy and it does not need a hydraulic fault to come down.',
      ],
    },
    {
      type: 'lead',
      html: 'Forklift hydraulics are simpler than an excavator’s and fail in more predictable places. The circuits are few enough that the symptom usually identifies the fault before anything is dismantled — and the real risk on the job is not diagnostic, it is the mast itself.',
    },

    { type: 'section_head', number: '/01', title: 'Block the mast first.', anchor: 'block-the-mast' },
    {
      type: 'callout',
      tone: 'danger',
      title: 'A raised carriage is stored energy.',
      body: 'Lower the forks fully before working, or block the mast mechanically if it must stay raised. Relying on the hydraulics to hold a load while you disconnect the hydraulics is the mechanism behind a large share of serious forklift maintenance injuries.',
    },

    { type: 'section_head', number: '/02', title: 'Which circuit.', anchor: 'which-circuit' },
    {
      type: 'comparison_table',
      caption: 'Symptom to circuit',
      columns: ['Symptom', 'Circuit', 'Where it usually fails'],
      rows: [
        { cells: ['Will not lift, or lifts then sinks', 'Lift', 'Mast hoses in the channel and over the sheave'], highlight: true },
        { cells: ['Mast will not tilt forward or back', 'Tilt', 'Tilt cylinder hoses at the mast pivot'] },
        { cells: ['Side-shift, clamp or rotator dead', 'Attachment / auxiliary', 'Carriage hoses — the most exposed on the machine'] },
        { cells: ['Everything slow, engine fine', 'Supply', 'Pump suction line, filter, or fluid level'] },
        { cells: ['Sinks under load, nothing wet', 'Not a hose', 'Cylinder seals or a valve passing internally'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'Why do forklift mast hoses fail where they do?',
      answer:
        'Because they do not simply flex — they travel. Mast hoses run through the mast channel and around a sheave as the carriage rises, so the same short section of hose is repeatedly bent around a fixed radius and dragged against the channel. Wear concentrates there rather than along the free length.',
    },
    {
      type: 'paragraph',
      html: 'That is also why a mast hose can look perfect for most of its length and be nearly through at one point. Inspect at the sheave and in the channel with the mast in more than one position — a fault hidden inside the channel at rest may be exposed at full lift.',
    },

    { type: 'section_head', number: '/03', title: 'Attachment hoses.', anchor: 'attachment' },
    {
      type: 'paragraph',
      html: 'Anything on the carriage — side-shift, clamps, rotators, fork positioners — lives in the worst environment on the truck. The hoses are close to the load, close to the racking and close to whatever the driver reverses into. Where a fleet is going through attachment hoses quickly, the answer is usually <strong>guarding and routing</strong> rather than a heavier hose, because the failures are impact and abrasion rather than pressure.',
    },
    { type: 'product_embed', heading: 'Common grades and ends', skus: ['IH-HOSE-R1-1SC', 'IH-HOSE-2SC', 'IH-JIC-FEM-37-45'] },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'The forks drift down overnight. Is that a hose?', answer: 'Rarely. Slow drift with no external leak is almost always internal — cylinder seals or a valve passing. A hose leak that could drop a load would normally show on the floor.' },
        { question: 'Can I fit a higher-rated hose to make mast hoses last longer?', answer: 'Usually not the right fix. Mast hoses fail from bending and abrasion, not pressure, and a stiffer hose bends worse around the sheave. Match the original construction and address the wear point.' },
        { question: 'Do I need to replace both lift hoses together?', answer: 'On a mast, generally yes. They have seen the same travel and the same number of cycles, and the labour is largely shared.' },
        { question: 'Can you make forklift hoses to sample?', answer: 'Yes — bring the failed assembly, or send photographs of both ends and the layline with the overall length.' },
      ],
    },
    { type: 'category_link', slug: 'hoses-fittings', label: 'Hose and fittings', blurb: 'Grades, fittings and ferrules for materials-handling equipment.' },
    { type: 'as_of_stamp', verifiedOn: '2026-08-17', note: 'Diagnostic guidance only. No model-specific part numbers — the truck parts book is authoritative.' },
    { type: 'cta_block', heading: 'Truck down?', body: 'Photographs of both ends and the layline are enough for us to identify the assembly and tell you what we hold.', quoteLabel: 'Get it identified' },
  ],
}

export default ARTICLE
