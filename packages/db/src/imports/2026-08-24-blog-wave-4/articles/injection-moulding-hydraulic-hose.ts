import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'injection-moulding-hydraulic-hose',
  title: 'Injection moulding machines: heat kills these, not movement',
  excerpt:
    'A moulding machine sits still in a clean factory and eats hoses anyway. The hoses are not being flexed or abraded — they are being cooked, next to a barrel that runs hot all day.',
  categorySlug: 'machine-down',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Injection moulding machine hydraulic hose — heat and cycle life',
  seoDescription:
    'Why injection moulding machine hydraulic hoses fail: radiated barrel heat, high cycle counts, and cleanliness. Which grades suit the duty and what to change first.',
  focusKeyword: 'injection moulding hydraulic hose',
  publishedAt: '2026-08-24T14:32:13.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Radiated heat from the barrel and heater bands is the dominant ageing factor, not movement.',
        'Cycle counts are enormous — a machine on a short cycle can exceed a construction machine’s annual cycles in a week.',
        'Most of our range is rated to 100 °C; the spiral grades and R5 to 121 °C; PTFE to 204 °C.',
        'Distance and shielding are worth more than a higher-rated hose, and cost less.',
        'Clean-factory duty makes contamination from a hose change more consequential, not less.',
      ],
    },
    {
      type: 'lead',
      html: 'Every other machine in this section fails its hoses through movement, abrasion or weather. A moulding machine does none of those. It stands in a clean, air-conditioned hall and ages its hoses anyway, because a few centimetres away there is a barrel running at plastic-processing temperature all day.',
    },

    { type: 'section_head', number: '/01', title: 'Heat from outside.', anchor: 'heat-outside' },
    {
      type: 'paragraph',
      html: 'A hose temperature rating describes the fluid inside it. On a moulding machine the fluid may be well controlled while the hose itself sits in radiated heat from the barrel, the heater bands and the nozzle area. <strong>The two add, and only one of them appears in any specification.</strong>',
    },
    {
      type: 'comparison_table',
      caption: 'Rated maximum by construction, across the grades we stock',
      columns: ['Construction', 'Max fluid temperature'],
      rows: [
        { cells: ['R7, R8 thermoplastic', '93 °C'] },
        { cells: ['1SN, 2SN, 1SC, 2SC, 4SP, 4SH', '100 °C'] },
        { cells: ['R5, R12, R13, R15', '121 °C'], highlight: true },
        { cells: ['R14 PTFE', '204 °C'], highlight: true },
      ],
    },
    {
      type: 'paragraph',
      html: 'Ageing is cumulative and irreversible, so a hose that spends its life warm is spending its life. That is why moulding machine hoses tend to fail in groups — they were fitted together, they aged together, and they arrive at the end together.',
    },

    { type: 'section_head', number: '/02', title: 'The cycle count nobody counts.', anchor: 'cycles' },
    {
      type: 'callout',
      tone: 'note',
      title: 'A short-cycle machine outpaces construction plant by orders of magnitude.',
      body: 'Clamp, inject, hold, eject — repeated continuously, every cycle a pressure event. A machine running a short cycle around the clock accumulates more pressure cycles in a week than an excavator does in a year. Calendar-based replacement intervals borrowed from mobile plant do not transfer.',
    },
    {
      type: 'direct_answer',
      question: 'Why do injection moulding machine hydraulic hoses fail?',
      answer:
        'Heat and cycles rather than movement. Radiated heat from the barrel and heater bands ages the hose from outside while the fluid ages it from inside, and the pressure cycle repeats with every shot — so a short-cycle machine accumulates cycles far faster than mobile plant of the same age.',
    },

    { type: 'section_head', number: '/03', title: 'What to change, in order.', anchor: 'what-to-change' },
    {
      type: 'decision_tree',
      heading: 'Cheapest first',
      intro: 'The higher-rated hose is a real answer and it is rarely the first one.',
      branches: [
        { condition: 'A hose runs close to the barrel or heater bands', outcome: 'Move it, or put a shield between the two.', detail: 'Radiated heat falls off quickly with distance. Centimetres matter.' },
        { condition: 'The hall is hot as well', outcome: 'Look at ventilation around the machine before changing hose.', detail: 'A machine in still, hot air has no way to lose the heat it radiates.' },
        { condition: 'The oil runs hot', outcome: 'Check the cooler before specifying anything.', detail: 'A silted cooler raises every hose temperature in the machine simultaneously.' },
        { condition: 'Heat is genuinely unavoidable', outcome: 'Move to a 121 °C construction, or PTFE where it is severe.', detail: 'The right answer where the heat cannot be designed out, and over-specified where it can.', sku: 'IH-HOSE-R14' },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Cleanliness matters more here, not less.',
      body: 'A moulding machine has tight clearances and expensive proportional valves, and a factory floor is not a clean room. Debris introduced during a hose change goes straight into that. Assemblies should be built and capped clean, and the circuit protected while it is open.',
    },
    { type: 'product_embed', heading: 'Where heat is the constraint', skus: ['IH-HOSE-R13', 'IH-HOSE-R14', 'IH-HOSE-R5'] },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Rated to 100 °C, 121 °C and 204 °C.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Should we just fit PTFE hose everywhere on the machine?', answer: 'No. It is the right answer next to the barrel and over-specified on circuits that never see that heat. It is also stiffer and needs different fittings, so blanket substitution creates routing problems it did not have.' },
        { question: 'The hoses fail in the same area every time. Is that a bad batch?', answer: 'Almost never. Failures clustered in one area point at a heat source in that area, and the fix is distance or shielding rather than a different supplier.' },
        { question: 'How do we set a replacement interval?', answer: 'From your own failure history and cycle count rather than a calendar figure borrowed from mobile plant. Tagging assemblies with build dates is what makes that possible.' },
        { question: 'Can you build assemblies to a cleanliness standard?', answer: 'Yes — tell us what the machine requires and we will build and cap to it rather than assuming a general-purpose clean is adequate.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Temperature ratings from the product specifications for the grades we stock. No machine-specific circuit pressures or cycle figures.',
    },
    { type: 'cta_block', heading: 'Machine consuming hoses?', body: 'Tell us where they run and what the fluid temperature is. Usually the answer is shielding and routing — and when it is a 121 °C construction, we stock those.', quoteLabel: 'Ask about a hot machine' },
  ],
}

export default ARTICLE
