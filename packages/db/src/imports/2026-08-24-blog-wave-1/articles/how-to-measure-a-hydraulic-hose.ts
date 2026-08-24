import type { BlogArticleSeed } from '../shared'

/**
 * Procedural, so there are no catalogue figures to source — and deliberately
 * no worked cut-length arithmetic, because insertion depth is per fitting and
 * publishing a specimen subtraction would invite someone to reuse the number.
 * The article sends the reader to the per-variant dimension tables on the
 * fitting pages instead, which is where the real figures live.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'how-to-measure-a-hydraulic-hose',
  title: 'Measuring a hose for replacement: overall length is not cut length',
  excerpt:
    'Measure the hose, hand over the number, and the assembly comes back too long. The figure a workshop needs is the distance between sealing faces — and the difference between that and what most people measure is the whole problem.',
  categorySlug: 'hose-assembly',
  authorSlug: 'mehul-rana',
  seoTitle: 'How to measure a hydraulic hose for replacement — the right way',
  seoDescription:
    'Overall length against cut length, where to measure from on each fitting type, how to handle elbows and orientation, and what to send so the assembly is right first time.',
  focusKeyword: 'how to measure hydraulic hose',
  publishedAt: '2026-08-24T11:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Quote overall length — sealing face to sealing face — not the length of rubber. The workshop works out the cut length from it.',
        'Where the sealing face sits depends on the fitting type, and it is not always the visible end of the fitting.',
        'Measure the old hose lying straight and relaxed, not as it sat on the machine. A hose that has been routed round a bend holds that shape.',
        'If either end is an elbow, the angle between the two ends matters as much as the length. State it, or expect a remake.',
        'A hose fitted with a twist has already lost length. Measuring it as-installed reproduces the fault in the replacement.',
      ],
    },
    {
      type: 'lead',
      html: 'It is the most ordinary job in the workshop and it comes back wrong more often than anything else — not because measuring is hard, but because the number the customer measured and the number the machine needs are two different quantities, and nobody says which one is being handed over.',
    },

    { type: 'section_head', number: '/01', title: 'The two lengths.', anchor: 'two-lengths' },
    {
      type: 'paragraph',
      html: '<strong>Overall length</strong> is the finished assembly: sealing face to sealing face, fittings included. It is the number that has to be right, because it is the number the machine imposes.',
    },
    {
      type: 'paragraph',
      html: '<strong>Cut length</strong> is the piece of hose before the fittings go on. It is shorter than the overall length, by however far the hose stem pushes into each fitting. That insertion depth is a property of the specific fitting — it varies between fitting types, between sizes, and between one-piece and two-piece designs.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Which number to give a workshop.',
      body: 'Always the overall length, and say so explicitly: "overall length, face to face". A workshop can derive cut length from it once the fittings are chosen. Going the other way is impossible without knowing which fittings you had in mind, which is exactly the information a customer does not usually have.',
    },
    {
      type: 'direct_answer',
      question: 'How do you measure a hydraulic hose for replacement?',
      answer:
        'Lay the old hose out straight and relaxed, then measure from the sealing face of one fitting to the sealing face of the other. That is the overall length. Do not measure only the rubber, and do not measure it in the shape it held on the machine. If either end is an elbow, also state the angle between the two ends.',
    },

    { type: 'section_head', number: '/02', title: 'Where the sealing face is.', anchor: 'sealing-face' },
    {
      type: 'paragraph',
      html: 'The sealing face is where the connection actually seals — the surface the mating half presses against. On some fitting types it is the visible end of the fitting; on others it is set back, and measuring to the tip of the nut adds length that is not there.',
    },
    {
      type: 'comparison_table',
      caption: 'Where to measure to, by end type',
      columns: ['End type', 'Measure to'],
      rows: [
        { cells: ['Female swivel with a cone seat (JIC, BSP, metric)', 'The seat inside the nut, not the end of the nut'] },
        { cells: ['ORFS female', 'The flat face where the O-ring sits'] },
        { cells: ['Male thread', 'The end of the thread'] },
        { cells: ['SAE flange head', 'The flange face'] },
        { cells: ['Tapered thread (NPT, BSPT)', 'The end of the thread — noting it will thread in further under torque'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The per-fitting dimensions are published on each fitting’s product page in our catalogue, size by size, so the exact geometry for the fitting you are actually using is available rather than assumed. <strong>If you are ordering rather than measuring, you do not need any of this</strong> — give us the overall length and the ends, and the workshop does the arithmetic.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Tapered ends move.',
      body: 'An NPT or BSPT male pulls further into its port as it is torqued, so the effective length of that end changes on assembly. On a short hose in a tight space that movement is enough to matter. Say when an end is tapered rather than parallel; it changes how much slack the assembly needs.',
    },

    { type: 'section_head', number: '/03', title: 'Measuring the old hose properly.', anchor: 'measuring' },
    {
      type: 'decision_tree',
      heading: 'The sequence',
      intro: 'In this order. Steps two and three are the ones usually skipped.',
      branches: [
        { condition: 'The hose is off the machine', outcome: 'Lay it out straight on the floor and let it relax before measuring.', detail: 'A hose that has spent years around a bend keeps the curve. Measured curled, it reads short — and the replacement then pulls tight in service.' },
        { condition: 'Either end is an elbow', outcome: 'Note the angle between the two ends, looking down the length of the hose.', detail: 'Two 90° ends can be aligned, opposed, or anywhere between. Length alone does not describe the part.' },
        { condition: 'The hose was fitted with a twist', outcome: 'Measure it, then fix the routing — do not reproduce the twist.', detail: 'A twisted hose is already shortened and already failing early. Rebuilding it identically buys the same failure again.' },
        { condition: 'The hose is destroyed or missing', outcome: 'Measure the machine instead: port to port, following the intended route.', detail: 'Add slack for movement, and tell us the route rather than only the straight-line distance.' },
      ],
    },
    {
      type: 'paragraph',
      html: 'On a hose that has to move — a boom, a tilt cylinder, an attachment — measure at the position that needs the <strong>most</strong> length, then check the shortest position for slack. A hose sized at mid-stroke can be pulled tight at full extension and rubbing at full retraction, and both are failures.',
    },

    { type: 'section_head', number: '/04', title: 'What to send us.', anchor: 'what-to-send' },
    {
      type: 'comparison_table',
      caption: 'A complete replacement request',
      columns: ['Item', 'Why it matters'],
      rows: [
        { cells: ['Overall length, face to face', 'The one dimension the machine imposes'], highlight: true },
        { cells: ['Hose size and grade', 'From the layline if it is readable; otherwise a photo and the outside diameter'] },
        { cells: ['Both ends: thread and seat type', 'Even when they are the same — write it twice'] },
        { cells: ['Elbow angles and orientation', 'The most commonly omitted detail, and the most common cause of a remake'] },
        { cells: ['Working pressure', 'Confirms the grade is right rather than merely matching what was there'] },
        { cells: ['Photographs of both ends and the routing', 'Resolves anything the description missed'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The last line does most of the work. <strong>A photograph of each end and one of the hose lying straight next to a tape measure will settle almost every question</strong> a workshop would otherwise have to ring you back about.',
    },
    { type: 'category_link', slug: 'hydraulic-fittings', label: 'Hose fittings by thread type', blurb: 'Per-size dimension tables on every fitting page.' },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Cut, crimped and tested to your length in Dubai.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Should I measure the rubber or the whole assembly?', answer: 'The whole assembly, sealing face to sealing face. The length of rubber alone is the cut length, which depends on which fittings go on it — so it is not a number anyone can use without also knowing the fittings.' },
        { question: 'How much extra length should I allow?', answer: 'Enough that the hose is never in tension at any point in the machine’s travel, and never so much that it can rub or snag. On a moving circuit, measure at the position of greatest separation and then check the slack at the shortest.' },
        { question: 'Can you make a hose from the old one if I send it in?', answer: 'Yes, and it is the most reliable way to get it right. We measure it, identify the ends and match the grade. Send it lying straight rather than coiled tight if you can.' },
        { question: 'Does it matter which way round the elbows point?', answer: 'Very much. Two identical 90° ends can be clocked at any angle relative to each other, and an assembly built at the wrong clocking will not route. State the angle, or send a photograph of the old hose lying flat.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Procedure as practised in our Dubai workshop. Per-fitting insertion depths and dimensions are published on the individual fitting product pages.',
    },
    { type: 'cta_block', heading: 'Send the measurement and the photographs.', body: 'Overall length, both ends, and a photo of the old hose lying straight. We will build it, test it and tag it — usually same day for stocked grades.', quoteLabel: 'Order an assembly' },
  ],
}

export default ARTICLE
