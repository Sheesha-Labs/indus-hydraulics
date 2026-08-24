import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'backhoe-hydraulic-hose',
  title: 'Backhoe loader: two machines, two entirely different hose problems',
  excerpt:
    'The front end is a loader and the back end is an excavator, and they fail in different ways for different reasons. Which end stopped tells you most of what you need before you look at anything.',
  categorySlug: 'machine-down',
  authorSlug: 'mehul-rana',
  seoTitle: 'Backhoe loader hydraulic hose replacement — front and rear',
  seoDescription:
    'Diagnosing backhoe loader hose failures: loader end against excavator end, stabiliser and swing circuits, and how to specify a replacement without a dealer part number.',
  focusKeyword: 'backhoe hydraulic hose',
  publishedAt: '2026-08-24T14:32:06.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Front and rear are separate hydraulic problems sharing one pump. Which end failed narrows it immediately.',
        'Rear hoses take the harder life — dipper and bucket lines are in the trench with the material.',
        'Stabiliser circuits are exposed, low on the machine and frequently the ones nobody inspects.',
        'The swing circuit on the backhoe end flexes through a wide arc and is a common repeat-failure position.',
        'Backhoes work in and out of trenches, so abrasion against the edge is a leading cause rather than an occasional one.',
      ],
    },
    {
      type: 'lead',
      html: 'A backhoe loader is two machines bolted together, and treating a hose failure as one diagnosis is what makes it take longer than it should. The first question is not which hose — it is which end.',
    },

    { type: 'section_head', number: '/01', title: 'Which end stopped.', anchor: 'which-end' },
    {
      type: 'comparison_table',
      caption: 'Symptom to circuit',
      columns: ['What the machine does', 'Likely circuit', 'Where to look first'],
      rows: [
        { cells: ['Front bucket will not lift or curl', 'Loader lift or tilt', 'Loader arm lines, front of the machine'] },
        { cells: ['Boom, dipper or bucket dead at the rear', 'Backhoe working circuit', 'Lines along the boom and dipper — the exposed ones'], highlight: true },
        { cells: ['Backhoe will not slew left or right', 'Swing', 'Swing cylinder lines, high-flex position'] },
        { cells: ['A stabiliser will not lower or holds unevenly', 'Stabiliser', 'Low on the machine, behind the rear axle'] },
        { cells: ['Both ends slow, engine fine', 'Pump supply or main pressure', 'Shared circuit — not an end-specific fault'] },
        { cells: ['Breaker or auxiliary tool dead', 'Auxiliary', 'Lines along the dipper and the couplers at the end'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A stabiliser that creeps down is not only a hose question.',
      body: 'Creep can be a hose, a cylinder seal or a valve passing. On a machine whose stability while digging depends on those stabilisers holding, it is worth diagnosing properly rather than replacing the cheapest component and seeing whether it recurs.',
    },

    { type: 'section_head', number: '/02', title: 'Why the rear end eats hoses.', anchor: 'rear-end' },
    {
      type: 'paragraph',
      html: 'The backhoe end works below ground level, and the hoses go down with it. They drag against the trench edge, take impact from material coming out of the bucket, and sit in whatever is at the bottom of the excavation. <strong>Abrasion is the dominant failure mode at this end</strong>, and it is the one most improved by guarding.',
    },
    {
      type: 'paragraph',
      html: 'The swing circuit is the other repeat offender. It flexes through a wide arc every cycle, and a replacement made to the parked geometry is short at one extreme of that arc. Measure it at the position of greatest separation.',
    },

    { type: 'section_head', number: '/03', title: 'Specifying without the parts book.', anchor: 'specifying' },
    {
      type: 'paragraph',
      html: 'Bore, overall length face to face, both fitting types and the angle between them fully specify the assembly. <strong>A dealer part number is convenient when you have it and never necessary.</strong> Where the layline is still readable, a photograph of it gives us the grade as well.',
    },
    { type: 'product_embed', heading: 'Grades used on backhoe circuits', skus: ['IH-HOSE-R2-2SN', 'IH-HOSE-2SC'] },
    { type: 'category_link', slug: 'hose-clamps-sleeves-ferrules', label: 'Sleeves and guards', blurb: 'For the rear end, where the trench does the damage.' },
    { type: 'category_link', slug: 'quick-couplers', label: 'Quick couplers', blurb: 'Breaker and auxiliary tool connections.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'The front works and the back does not. Is that one hose?', answer: 'Frequently, yes — the two ends have separate working circuits fed from a shared supply, so a total loss at one end only is usually local to that end rather than a pump problem.' },
        { question: 'Which backhoe hoses fail most?', answer: 'Dipper and bucket lines at the rear, from abrasion against the trench edge and impact from material. Swing lines come next, from the flex cycle.' },
        { question: 'Is guarding worth it on a backhoe?', answer: 'On the rear working lines, yes — that is the highest-abrasion position on the machine and the guard is cheap relative to the hose plus the downtime.' },
        { question: 'Can you match a hose from a photograph?', answer: 'Usually. A clear shot of the layline and of both fitting ends, plus the length face to face, is enough to build an exact replacement.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Diagnostic guidance from our own field service practice. No model-specific part numbers or dimensions.',
    },
    { type: 'cta_block', heading: 'Backhoe stopped?', body: 'Tell us which end and send photographs of the failed hose and both ends. Same-day builds for stocked grades, and we come to site.', quoteLabel: 'Get a hose made' },
  ],
}

export default ARTICLE
