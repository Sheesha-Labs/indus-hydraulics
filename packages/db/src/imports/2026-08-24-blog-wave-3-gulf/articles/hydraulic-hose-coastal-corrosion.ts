import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-hose-coastal-corrosion',
  title: 'Salt air at Jebel Ali and Mussafah: the clock runs faster on the coast',
  excerpt:
    'The corrosion mechanism is the same everywhere. What changes near the sea is the speed — and because the reinforcement corrodes invisibly, speed is the whole problem.',
  categorySlug: 'gulf-conditions',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Hydraulic hose corrosion in coastal UAE — salt, humidity and wire',
  seoDescription:
    'Why hydraulic hose reinforcement corrodes faster in coastal UAE conditions, how overnight condensation contributes, and what changes in inspection and replacement practice.',
  focusKeyword: 'hydraulic hose corrosion coastal',
  publishedAt: '2026-08-26T10:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Salt in the air accelerates corrosion of the steel reinforcement once moisture can reach it.',
        'Overnight condensation matters as much as humidity — equipment cools, moisture forms, and it does so every night.',
        'The mechanism needs a breach in the cover. Any cut, abrasion scar or crack is the entry point.',
        'This failure gives no warning, so the response has to be preventive: protect the cover, then replace on age.',
        'SAE 100R5 is the one common construction whose wire braid is visible for inspection.',
      ],
    },
    {
      type: 'lead',
      html: 'Nothing about coastal corrosion is different in kind from corrosion anywhere else. What is different is that a scar you would have got away with for two years inland is working against you in months here — and because the damage happens under an intact-looking cover, you will not be told.',
    },

    { type: 'section_head', number: '/01', title: 'Three things happening at once.', anchor: 'three-things' },
    {
      type: 'comparison_table',
      caption: 'What coastal Gulf conditions add',
      columns: ['Factor', 'Effect on reinforcement'],
      rows: [
        { cells: ['Airborne salt', 'Accelerates corrosion once moisture is present'], highlight: true },
        { cells: ['High humidity', 'Keeps moisture available essentially all the time'] },
        { cells: ['Overnight condensation', 'Delivers liquid water onto and into equipment nightly'] },
        { cells: ['Daytime heat', 'Speeds the reaction and ages the cover that was keeping water out'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The last row is the one that compounds. Heat degrades the cover, the degraded cover admits moisture, and the salt-laden moisture attacks the wire. <strong>The heat problem and the corrosion problem are the same problem in this climate</strong>, which is why they are worth addressing together.',
    },
    {
      type: 'direct_answer',
      question: 'Do hydraulic hoses fail faster near the sea?',
      answer:
        'Yes, where the cover has been breached. Salt-laden humid air and nightly condensation accelerate corrosion of the steel reinforcement once moisture can reach it through a cut, abrasion scar or crack. The hose gives no external sign, so coastal operations need shorter inspection intervals and age-based replacement rather than waiting for evidence.',
    },

    { type: 'section_head', number: '/02', title: 'What actually changes in practice.', anchor: 'what-changes' },
    {
      type: 'decision_tree',
      heading: 'Four adjustments, none of them exotic',
      intro: 'The hose specification usually does not change. The regime around it does.',
      branches: [
        { condition: 'Any cover damage found on inspection', outcome: 'Treat it as a replacement trigger, not an observation.', detail: 'Inland a scarred cover is a watch item. On the coast it is the start of an invisible clock.' },
        { condition: 'Machines are washed down', outcome: 'Rinse salt off, but keep the lance away from hose and fittings.', detail: 'Washing is genuinely protective against salt and genuinely destructive at close range. Distance and angle decide which.' },
        { condition: 'Assemblies have no fitted date', outcome: 'Tag them, because age-based replacement is the only workable control.', detail: 'You cannot inspect for this failure mode, so the register is the control.' },
        { condition: 'Equipment sits idle for long periods', outcome: 'Do not assume idle time is free.', detail: 'Corrosion continues on a parked machine. Condensation happens whether or not anything is running.' },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'One construction you can actually inspect.',
      body: 'SAE 100R5 carries a textile braid cover that leaves the wire braid visible underneath. It is the only common hydraulic construction where reinforcement corrosion can be seen rather than inferred. Where you have R5 in coastal service, that visibility is worth using.',
    },

    { type: 'section_head', number: '/03', title: 'Where stainless is the right answer.', anchor: 'stainless' },
    {
      type: 'paragraph',
      html: 'Hydraulic hose reinforcement is carbon steel in essentially every common construction, so "corrosion-resistant hydraulic hose" is not a variant you can order. Where corrosion resistance is the governing requirement rather than one factor among several, the answer is a different family — PTFE hose with stainless braid, or a metallic hose — and stainless fittings to go with them.',
    },
    { type: 'product_embed', heading: 'Where the environment governs', skus: ['IH-HOSE-R14', 'IH-HOSE-R5'] },
    { type: 'category_link', slug: 'stainless-steel-hydraulic-fittings', label: 'Stainless steel fittings', blurb: 'SS316L, for coastal and offshore service.' },
    { type: 'category_link', slug: 'metallic-hose-suppliers-uae', label: 'Metallic hose', blurb: 'Stainless corrugated and PTFE constructions.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How much shorter is hose life on the coast?', answer: 'We do not publish a multiplier, because it depends almost entirely on whether the cover has been breached. An undamaged cover in coastal air is doing its job; a scarred one is on a much faster clock than the same scar inland.' },
        { question: 'Would galvanised or coated wire help?', answer: 'It is not something you can specify on standard hydraulic hose — the reinforcement is what the construction says it is. Protecting the cover is the available control.' },
        { question: 'Does washing machines down help or hurt?', answer: 'Both, and the difference is technique. Rinsing salt off is protective. A lance held close enough to drive water through the cover or strip it at a scar is the opposite.' },
        { question: 'We are 20 km inland. Does this apply?', answer: 'Less, but humidity and overnight condensation still do. The salt component drops off with distance from the coast; the moisture component is a Gulf-wide condition.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Guidance from our own field service practice in coastal UAE. No corrosion-rate multiplier is published here because we have not measured one.',
    },
    { type: 'cta_block', heading: 'Coastal or offshore fleet?', body: 'The specification usually stays the same and the regime around it changes. We can review inspection intervals and tagging for equipment working near salt water.', quoteLabel: 'Ask about coastal service' },
  ],
}

export default ARTICLE
