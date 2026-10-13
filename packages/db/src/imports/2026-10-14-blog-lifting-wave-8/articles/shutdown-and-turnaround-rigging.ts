import type { BlogArticleSeed } from '../shared'

/**
 * Rigging for plant shutdowns and turnarounds. Checked 2026-10-14: OSHA 1926.251(a)(2)/(a)(4)
 * (marking; custom clamps/lifting accessories proof-tested 125%); ASME P30.1 standard vs critical
 * lift plans (secondary); Abu Dhabi CoP 34 registers and intervals (memory). No ADNOC standard
 * number cited (unverified).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'shutdown-and-turnaround-rigging',
  title: 'Rigging for plant shutdowns and turnarounds: lifting points, chain blocks and certified kit',
  excerpt:
    'A shutdown compresses months of maintenance into weeks, and much of it is lifting: pump motors out, exchanger bundles pulled, valves swapped, in congested units with no room for a crane. The rigging that makes it possible — lifting points, chain blocks, lever hoists, beam clamps and trolleys — how to plan and certify it before the unit comes down, and how to keep the register straight when hundreds of items come and go.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Shutdown and Turnaround Rigging: Planning and Kit',
  seoDescription:
    'Rigging for refinery and gas plant shutdowns and turnarounds: lifting points, chain blocks, lever hoists, beam clamps and trolleys, certified and registered kit, lift plans and critical lifts, and managing rigging in and out of the unit.',
  focusKeyword: 'shutdown rigging equipment',
  publishedAt: '2026-10-14T10:25:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Plan the lifts in the pre-shutdown scope: every motor, bundle and valve that comes out needs a lifting point, a lifting device and a route.',
        'Inside units, chain blocks and lever hoists on beam clamps and trolleys do most of the work; check that the steel they hang from is rated for lifting.',
        'Every item arrives marked, certified and registered before the unit comes down — not during the shutdown.',
        'Heavy or awkward lifts in congested plant are often critical lifts: plan them in writing.',
        'Control rigging in and out of the unit with the register, so nothing is left in the plant and nothing uncertified goes in.',
      ],
    },
    {
      type: 'lead',
      html: 'Gas plants and refineries in the Gulf run for years between turnarounds, then stop for a few intense weeks of maintenance. A large part of that work is lifting in tight spaces: pump motors and couplings out of pump houses, exchanger bundles pulled, control valves and relief valves swapped, compressor parts lifted from casings — usually under pipe racks and between vessels where no crane can reach. Contractors who get the rigging planned, certified and staged before the unit comes down keep to the schedule. Those who source it during the shutdown do not.',
    },

    { type: 'section_head', number: '/01', title: 'Plan lifts in the scope.', anchor: 'planning' },
    {
      type: 'prose',
      html: '<ul><li>List every item that will be lifted, with weight, lifting points and route out.</li><li>Identify fixed lifting points — runway beams, pad eyes, monorails — and confirm they are rated and in date.</li><li>Where there is no fixed point, design one: a beam clamp on a rated beam, or a temporary frame, approved by an engineer.</li><li>Classify the lifts: routine, or critical — near capacity, over live plant, in congested areas, or with multiple hoists. Lift-planning practice such as ASME P30.1 calls for a more detailed written plan for critical lifts.</li><li>From the list, build the rigging schedule: hoists, clamps, trolleys, slings, shackles, quantities and capacities.</li></ul>',
    },
    {
      type: 'direct_answer',
      question: 'What rigging is used during a plant shutdown?',
      answer:
        'Mostly hand-operated hoisting gear in congested units: manual chain blocks and lever hoists hung from rated runway beams, beam clamps or beam trolleys, with slings, shackles and rated lifting points, plus cranes where access allows. Everything is planned in the shutdown scope, certified and registered before the unit comes down.',
    },

    { type: 'section_head', number: '/02', title: 'The in-unit kit.', anchor: 'kit' },
    {
      type: 'comparison_table',
      caption: 'Shutdown hoisting kit',
      columns: ['Item', 'Role'],
      rows: [
        { cells: ['Manual chain blocks', 'Vertical lifting from a fixed point; fine control'] },
        { cells: ['Lever hoists', 'Pulling, tensioning and positioning at any angle'], highlight: true },
        { cells: ['Beam clamps', 'Temporary hanging point on a rated beam flange'] },
        { cells: ['Push and geared beam trolleys', 'Travel along a runway beam with the load'] },
        { cells: ['Lifting points and swivels', 'Rated attachment to equipment'] },
        { cells: ['Slings and shackles', 'Connecting hoist to load'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Our range covers <a href="/p/manual-chain-block-type-a">chain blocks</a> from 0.5 t to 30 t and more, <a href="/p/lever-hoist-type-va">lever hoists</a>, <a href="/p/lifting-beam-clamp">beam clamps</a>, <a href="/p/geared-beam-trolley-type-b">geared</a> and <a href="/p/push-beam-trolley-type-b">push</a> beam trolleys and <a href="/p/close-headroom-trolley-chain-hoist">close-headroom trolley hoists</a> for low beams. Match trolley to beam flange width and hoist capacity. See <a href="/blog/chain-block-vs-lever-hoist-vs-electric-hoist">chain block vs lever hoist vs electric hoist</a>.',
    },

    { type: 'section_head', number: '/03', title: 'Certified before the unit comes down.', anchor: 'certification' },
    {
      type: 'paragraph',
      html: 'Every item that goes into the unit should arrive marked with its rated load, with its certificate, and be entered in the shutdown lifting register before day one. In the US, OSHA requires rigging to carry its safe working load marking, and custom lifting accessories such as clamps to be marked and proof-tested to 125% of rated load before use. In Abu Dhabi, lifting accessories are examined every 6 months by approved third parties; a shutdown is a bad moment to discover an item’s certificate has lapsed. See <a href="/blog/lifting-gear-test-certificate">what a lifting gear test certificate should show</a>.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Control what goes in and out.',
      body: 'Issue rigging into the unit against the register and check it back out. Hundreds of items move during a turnaround; the register is how you know nothing was left behind, nothing uncertified went in, and nothing damaged goes back into stock.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Chain block or lever hoist for shutdown work?', answer: 'Chain blocks for vertical lifts from a fixed point; lever hoists for pulling, tensioning and positioning at any angle. Most shutdowns need both.' },
        { question: 'Can I hang a chain block from any beam?', answer: 'Only from a beam rated and approved for lifting. Use a beam clamp or trolley matched to its flange.' },
        { question: 'What is a critical lift in a shutdown?', answer: 'A lift near capacity, over live plant, in congested areas or with multiple hoists. Plan it in writing.' },
        { question: 'When should shutdown rigging be certified?', answer: 'Before the shutdown starts — marked, certified and registered before it goes into the unit.' },
        { question: 'Can you supply a shutdown rigging package?', answer: 'Yes. Send the rigging schedule and dates and we will quote certified chain blocks, hoists, clamps, trolleys, slings and shackles.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Shutdown hoisting kit',
      skus: ['IH-LR-CB-A', 'IH-LR-CB-VL', 'IH-LR-CB-LVA', 'IH-LR-CB-CHT', 'IH-LR-LC-BEAM', 'IH-LR-BT-GB', 'IH-LR-BT-PB', 'IH-LR-LP-SLP80'],
    },
    {
      type: 'category_link',
      slug: 'chain-blocks-manual-hoists',
      label: 'Chain blocks and manual hoists',
      blurb: 'Chain blocks, lever hoists and trolley hoists.',
    },
    {
      type: 'page_link',
      kind: 'industry',
      slug: 'oil-gas',
      label: 'Oil and gas',
      blurb: 'Certified rigging for plant and shutdown work.',
    },
    {
      type: 'related_articles',
      slugs: ['chain-block-vs-lever-hoist-vs-electric-hoist', 'lifting-gear-test-certificate', 'lifting-equipment-inspection-uae', 'pad-eye-vs-swivel-lifting-point', 'site-mobilisation-rigging-kit'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'OSHA 29 CFR 1926.251 marking and proof-test rules; lift planning per ASME P30.1 as described in industry sources; Abu Dhabi lifting code intervals. Your operator’s procedures govern.',
    },
    {
      type: 'cta_block',
      heading: 'Planning a turnaround?',
      body: 'Send the rigging schedule and shutdown dates. We will quote certified hoisting kit, delivered and documented before the unit comes down.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
