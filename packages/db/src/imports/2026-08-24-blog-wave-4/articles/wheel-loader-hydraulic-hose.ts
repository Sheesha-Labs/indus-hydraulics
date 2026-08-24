import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'wheel-loader-hydraulic-hose',
  title: 'Wheel loader hose failure: lift, tilt or steering',
  excerpt:
    'Three circuits, and the one that failed decides how urgent this is. A loader that will not lift can be parked. A loader that has lost steering cannot be driven anywhere.',
  categorySlug: 'machine-down',
  authorSlug: 'mehul-rana',
  seoTitle: 'Wheel loader hydraulic hose replacement — which circuit failed',
  seoDescription:
    'Identifying a failed wheel loader hydraulic circuit from the symptom: lift, tilt, steering or brake. Where the hoses run, which fail first, and how to specify a replacement.',
  focusKeyword: 'wheel loader hydraulic hose',
  publishedAt: '2026-08-27T09:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Lift and tilt hoses run across the articulation joint and flex every time the machine turns. They fail first.',
        'A steering failure is a safety event, not a maintenance item — the machine does not get driven back to the yard.',
        'Hoses at the articulation are the hardest routing problem on the machine and the most commonly got wrong on replacement.',
        'Loader work is dusty and abrasive, so cover damage accumulates faster than on machines that stay on hardstanding.',
        'Bore, length, both fitting ends and the angle between them fully specify the assembly. No dealer part number needed.',
      ],
    },
    {
      type: 'lead',
      html: 'A wheel loader concentrates its hydraulics in two places: the front end, where the work happens, and the articulation joint, where the whole machine bends. Almost every hose failure is in one or the other, and which one it is changes how the machine gets recovered.',
    },

    { type: 'section_head', number: '/01', title: 'Read the symptom.', anchor: 'read-the-symptom' },
    {
      type: 'comparison_table',
      caption: 'Symptom to circuit',
      columns: ['What the machine does', 'Likely circuit', 'Where to look first'],
      rows: [
        { cells: ['Bucket will not lift, or sinks under load', 'Lift', 'Lift cylinder lines along the boom arms'] },
        { cells: ['Bucket will not curl or dump, lift fine', 'Tilt', 'Tilt cylinder lines and the linkage area'] },
        { cells: ['Steering heavy, slow, or gone', 'Steering', 'Hoses crossing the articulation joint'], highlight: true },
        { cells: ['Everything slow, engine running normally', 'Pump supply or main pressure line', 'Between pump and main valve'] },
        { cells: ['Attachment dead, loader functions fine', 'Auxiliary', 'Auxiliary lines to the front couplers'] },
      ],
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'A steering failure is not a drive-it-back situation.',
      body: 'An articulated machine that has lost steering assistance is not steerable in any meaningful sense, and it is heavy. Stop it where it is, secure the articulation, and repair it there. Every year somebody decides the yard is only a hundred metres away.',
    },

    { type: 'section_head', number: '/02', title: 'The articulation joint.', anchor: 'articulation' },
    {
      type: 'paragraph',
      html: 'Every hose feeding the front of the machine has to cross the joint the machine steers on, which means it flexes through a large arc thousands of times a shift. <strong>It is the highest-cycle location on the machine and the least forgiving of a poor replacement.</strong>',
    },
    {
      type: 'paragraph',
      html: 'Two things go wrong on replacement. The assembly is made to the straight-line distance rather than to the length the joint needs at full lock, so it is pulled tight at one extreme. Or it is made long enough and then routed so the slack rubs on the frame at the other extreme. Both fail, at opposite ends of the steering range.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Measure at full lock, both ways.',
      body: 'Take the length the hose needs at the position of greatest separation, then check the slack at the opposite lock. If you only check one, the replacement is wrong at the other — and on a machine that articulates several hundred times an hour, wrong shows up quickly.',
    },

    { type: 'section_head', number: '/03', title: 'What to send us.', anchor: 'what-to-send' },
    {
      type: 'decision_tree',
      heading: 'Four things, and none of them is a part number',
      intro: 'A dealer part number is convenient when you have it and never necessary.',
      branches: [
        { condition: 'The old hose is available', outcome: 'Photograph the layline and both fitting ends, and measure face to face.', detail: 'That fully specifies the replacement, including the grade.' },
        { condition: 'The hose crosses the articulation', outcome: 'Say so, and give the length at full lock.', detail: 'We will build it to the working length rather than the parked one.' },
        { condition: 'Either end is an elbow', outcome: 'State the angle between the two ends.', detail: 'The most commonly omitted detail and the most common cause of a remake.' },
        { condition: 'This position has failed before', outcome: 'Tell us — it changes what we recommend.', detail: 'A repeat failure at the articulation is a length or routing problem, not a hose problem.' },
      ],
    },
    { type: 'product_embed', heading: 'Grades used on loader circuits', skus: ['IH-HOSE-R2-2SN', 'IH-HOSE-2SC'] },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Assemblies built same day for stocked grades.' },
    { type: 'category_link', slug: 'hose-clamps-sleeves-ferrules', label: 'Clamps, sleeves and guards', blurb: 'For the articulation, where hoses meet frame.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Which wheel loader hoses fail first?', answer: 'The ones crossing the articulation joint, because they flex through the largest arc most often. After those, the tilt circuit at the linkage, where hoses are exposed to material coming off the bucket.' },
        { question: 'Can I use a compact hose to make routing easier at the joint?', answer: 'Often yes — a compact construction bends to roughly half the radius at the same pressure class, which is exactly the constraint at an articulation. Confirm the pressure at the bore you need first.' },
        { question: 'The lift is slow but nothing is leaking. Is it a hose?', answer: 'Usually not. Slow with no external leak points at internal leakage in a cylinder or valve, or at the pump. A collapsed suction hose is the one hose fault that presents this way.' },
        { question: 'Do you come to site?', answer: 'Yes, across the UAE. For a machine stopped at the articulation that is normally faster than getting the machine anywhere.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Diagnostic guidance from our own field service practice. No model-specific part numbers or circuit pressures — those come from the machine’s own documentation.',
    },
    { type: 'cta_block', heading: 'Loader stopped?', body: 'Send a photograph of the failed hose and both ends. For stocked grades we build same day, and we come to site across the UAE.', quoteLabel: 'Get a hose made' },
  ],
}

export default ARTICLE
