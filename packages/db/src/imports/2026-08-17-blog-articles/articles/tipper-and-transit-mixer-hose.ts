import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'tipper-and-transit-mixer-hose',
  title: 'Tipper and transit mixer hydraulics: the three hoses that strand a truck',
  excerpt:
    'Body-flex, PTO and drum-drive hoses fail in ways that are specific to vehicles that flex and vibrate all day. What goes, why, and the safety step nobody should skip.',
  categorySlug: 'machine-down',
  authorSlug: 'mehul-rana',
  seoTitle: 'Tipper and transit mixer hydraulic hose failure',
  seoDescription:
    'Why tipper and mixer hydraulic hoses fail: chassis-to-body flex, PTO vibration and drum drive duty. Diagnosis, and why a body prop is not optional.',
  focusKeyword: 'tipper hydraulic hose',
  publishedAt: '2026-08-17T14:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The chassis-to-body crossing is where most tipper hose failures happen. It is the one point that moves through the full range every cycle.',
        'PTO-driven pumps put vibration into the hose ends continuously, which loosens joints that would stay tight on a static machine.',
        'On a mixer, the drum drive runs whenever the engine does — the duty cycle is far higher than the truck around it suggests.',
        'A body prop is not a formality. Hydraulics that failed once can fail again while someone is under the body.',
        'These are road vehicles. A hose that sheds fluid on a highway is a hazard well beyond the truck.',
      ],
    },
    {
      type: 'lead',
      html: 'Tippers and mixers are the vehicles most likely to strand themselves somewhere inconvenient, and the reason is structural: they carry hydraulics across a joint that moves, on a chassis that flexes, driven by a pump bolted to a vibrating gearbox.',
    },

    { type: 'section_head', number: '/01', title: 'Prop the body.', anchor: 'prop-the-body' },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Never work under a raised body without a prop.',
      body: 'The hydraulics that raised the body are the thing you have come to repair. A tipper body descending under its own weight is not survivable, and it does not need a dramatic failure to start moving — a weeping hose or a valve creeping is enough.',
    },

    { type: 'section_head', number: '/02', title: 'Where they fail.', anchor: 'where-they-fail' },
    {
      type: 'comparison_table',
      caption: 'The three problem areas',
      columns: ['Location', 'Why it fails', 'What to do'],
      rows: [
        { cells: ['Chassis to body crossing', 'Moves through full travel every tip cycle; often routed without enough slack', 'Route with slack at full lift, clamp both sides, check at the extremes'], highlight: true },
        { cells: ['Pump and PTO connections', 'Continuous vibration works joints loose and fatigues hose ends', 'Support the hose near the pump; re-check torque as a service item'] },
        { cells: ['Drum drive (mixer)', 'Runs whenever the engine runs; high duty cycle, hot fluid', 'Expect shorter service life than the vehicle hours suggest'] },
        { cells: ['Along the chassis rail', 'Road debris, kerb strikes, and abrasion at every clamp', 'Guard and clamp; inspect at each service'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'Why do tipper hoses fail at the body crossing?',
      answer:
        'Because that hose has to accommodate the full travel of the body every cycle, and it is frequently installed with just enough length to reach at rest rather than enough to follow the movement at full lift. Measured at the extreme of travel instead, the same run stops being loaded in tension and lasts far longer.',
    },
    {
      type: 'paragraph',
      html: 'The related error is over-correcting. A crossing hose with far too much slack whips, snags on the chassis and abrades in new places. The target is enough length to follow the movement without tension, then clamped so it follows a controlled path rather than finding its own.',
    },

    { type: 'section_head', number: '/03', title: 'Fleet patterns.', anchor: 'fleet' },
    {
      type: 'paragraph',
      html: 'On a mixed fleet the failures cluster by <em>route and duty</em> rather than by vehicle age. Trucks on long highway runs in Gulf summer see sustained fluid temperature; site-based trucks see impact and dust. It is worth splitting the fleet that way when setting inspection intervals, because a single interval across both will be wrong for one of them.',
    },
    { type: 'product_embed', heading: 'Grades that suit vehicle hydraulics', skus: ['IH-HOSE-2SC', 'IH-HOSE-R1-1SC', 'IH-HOSE-4SP'] },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'The body raises slowly but will hold. Hose or pump?', answer: 'Slow raise that still holds points at flow rather than containment — pump, PTO engagement or a restriction. A failing hose usually shows as a leak or a sudden loss, not a gradual slowdown.' },
        { question: 'How much slack should a crossing hose have?', answer: 'Enough that it is not in tension at full lift, and no more. Measure with the body raised, not lowered, and clamp so the extra length follows a path instead of flapping.' },
        { question: 'Are mixer drum hoses different from tipper hoses?', answer: 'The duty is. A drum drive runs continuously with hot fluid, so it accumulates hours far faster than the tipping circuit on a comparable truck. Plan replacement on drum hours rather than vehicle age.' },
        { question: 'Can we standardise hose across a mixed fleet?', answer: 'Often partly — ends and grades can usually be consolidated even where lengths differ. Send the fleet list and what is currently fitted and we will show you where it collapses.' },
      ],
    },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Braid and spiral constructions for vehicle and mobile hydraulics.' },
    { type: 'as_of_stamp', verifiedOn: '2026-08-17', note: 'Diagnostic and routing guidance only. No replacement intervals — duty and route differ too much between fleets.' },
    { type: 'cta_block', heading: 'Running a tipper or mixer fleet?', body: 'Send the fleet list and what keeps failing. We will look at whether it is a hose problem or a routing one, and where the range can be consolidated.', quoteLabel: 'Talk to an engineer' },
  ],
}

export default ARTICLE
