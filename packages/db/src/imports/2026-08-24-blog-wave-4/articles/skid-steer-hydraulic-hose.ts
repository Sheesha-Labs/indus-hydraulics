import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'skid-steer-hydraulic-hose',
  title: 'Skid steer and attachment circuits: the couplers are the weak point',
  excerpt:
    'A skid steer changes attachments several times a day, and every change is a chance to connect a dirty coupler. On these machines the failure is more often contamination than a burst hose.',
  categorySlug: 'machine-down',
  authorSlug: 'mehul-rana',
  seoTitle: 'Skid steer hydraulic hose and coupler problems',
  seoDescription:
    'Why skid steer hydraulic failures usually start at the attachment couplers: contamination, trapped pressure, flat-face against agricultural couplers, and how to specify replacements.',
  focusKeyword: 'skid steer hydraulic hose',
  publishedAt: '2026-08-27T10:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The auxiliary couplers are handled more than anything else on the machine, and they are handled with dirty gloves on a dusty site.',
        'Flat-face couplers exist because they trap almost no dirt on connection. Agricultural-style couplers trap more.',
        'A coupler that will not connect is usually trapped pressure, not a broken coupler.',
        'Attachment hoses live at ground level and take everything the attachment throws.',
        'Contamination from repeated connection damages pumps and valves long before it shows as a hose fault.',
      ],
    },
    {
      type: 'lead',
      html: 'Skid steers fail differently from the machines around them, and the reason is that they are the only ones being connected and disconnected all day. The hydraulic problem on a skid steer usually starts at a coupler face rather than at a hose.',
    },

    { type: 'section_head', number: '/01', title: 'Read the symptom.', anchor: 'read-the-symptom' },
    {
      type: 'comparison_table',
      caption: 'Symptom to circuit',
      columns: ['What the machine does', 'Likely circuit', 'Where to look first'],
      rows: [
        { cells: ['Attachment dead, loader arms fine', 'Auxiliary', 'The couplers first, then the lines along the arm'], highlight: true },
        { cells: ['Attachment weak or slow', 'Auxiliary flow', 'Partially connected coupler, or a restricted line'] },
        { cells: ['Arms will not lift', 'Lift', 'Lift cylinder lines'] },
        { cells: ['Bucket will not tilt', 'Tilt', 'Tilt cylinder lines, front of the machine'] },
        { cells: ['One side drives, the other does not', 'Drive', 'Drive motor lines on the affected side'] },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'A coupler that will not connect is usually pressure, not damage.',
      body: 'Trapped pressure in an attachment line stops a quick coupler engaging. Relieving it — by the machine’s own procedure, not by hitting anything — normally solves what looks like a broken coupler. Forcing a connection damages the faces and turns a two-minute problem into a replacement.',
    },

    { type: 'section_head', number: '/02', title: 'Why coupler type matters here.', anchor: 'coupler-type' },
    {
      type: 'paragraph',
      html: 'Every connection on a dusty site carries some dirt into the circuit. How much depends on the coupler face. <strong>Flat-face couplers are designed so the sealing surfaces are flush and wipeable</strong>, which is why they became the standard on machines that change attachments often. Older agricultural-style couplers have recesses that hold grit.',
    },
    {
      type: 'paragraph',
      html: 'On a machine connecting several times a day, that difference accumulates into real contamination — and contamination damages pumps and valves, which are considerably more expensive than couplers.',
    },
    {
      type: 'direct_answer',
      question: 'Why does my skid steer attachment not work?',
      answer:
        'Check the couplers before anything else. A partially engaged coupler gives weak or no flow, and trapped pressure in the line is the usual reason one will not connect fully. If the couplers are properly engaged and clean, look at the auxiliary lines along the arm, which sit at ground level and take impact from the attachment.',
    },

    { type: 'section_head', number: '/03', title: 'Habits that pay for themselves.', anchor: 'habits' },
    {
      type: 'decision_tree',
      heading: 'Four, and none of them takes a tool',
      intro: 'On a machine that connects this often, procedure is worth more than components.',
      branches: [
        { condition: 'Attachment is being changed', outcome: 'Wipe both coupler faces before connecting.', detail: 'The single highest-value habit on the machine. It takes seconds and it keeps grit out of the pump.' },
        { condition: 'Attachment is off the machine', outcome: 'Cap both halves.', detail: 'Dust caps are part of the coupler, not an accessory that got lost.' },
        { condition: 'A coupler will not engage', outcome: 'Relieve the trapped pressure by the machine’s procedure.', detail: 'Do not force it. Forcing damages sealing faces.' },
        { condition: 'Attachments are shared between machines', outcome: 'Standardise the coupler type across the yard.', detail: 'Mixed types mean adapters, and adapters mean more joints and more leak paths.' },
      ],
    },
    { type: 'category_link', slug: 'quick-couplers', label: 'Hydraulic quick couplers', blurb: 'Flat-face and agricultural types, in stock.' },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Attachment lines built to length.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can I mix flat-face and agricultural couplers?', answer: 'Not directly — they do not intermate. An adapter set exists but adds joints and leak paths. Where a yard runs both, standardising is cheaper over any real period than carrying adapters.' },
        { question: 'How do I relieve trapped pressure safely?', answer: 'By the machine’s own procedure, which normally involves cycling the auxiliary control with the engine off. Never crack a fitting to release pressure — that is how injection injuries happen.' },
        { question: 'Attachment hoses keep failing at the same point. Why?', answer: 'They sit at ground level and get dragged and crushed. Guarding helps, and so does routing the slack so it cannot be caught under the attachment when it is set down.' },
        { question: 'Do you supply attachment hose kits?', answer: 'Yes — send the coupler type, the bore and the lengths, or the old hoses, and we will build the set.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Diagnostic guidance from our own field service practice. Pressure-relief procedures are machine-specific — follow the manufacturer’s.',
    },
    { type: 'cta_block', heading: 'Attachment circuit playing up?', body: 'Tell us the coupler type and what the attachment does or does not do. Couplers, hoses and complete attachment sets, in stock in Dubai.', quoteLabel: 'Ask about couplers' },
  ],
}

export default ARTICLE
