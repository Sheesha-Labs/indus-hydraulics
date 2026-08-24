import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-hose-cover-cracking',
  title: 'Cracked cover: heat ageing against ozone attack',
  excerpt:
    'A cover covered in fine cracks has been cooked, or has been sitting in sunlight and still air. The crack pattern separates them, and only one of the two is fixed by moving the hose.',
  categorySlug: 'failure-analysis',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Hydraulic hose cover cracking — heat, ozone and UV',
  seoDescription:
    'Why hydraulic hose covers crack: heat ageing, ozone and UV attack, and cold flexing. How the crack pattern tells them apart and what each one needs.',
  focusKeyword: 'hydraulic hose cracking',
  publishedAt: '2026-08-24T13:42:14.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Fine cracks across the whole cover mean the rubber has aged. Cracks only where the hose bends mean ozone attacking stretched rubber.',
        'Heat ageing is cumulative and irreversible — a hose that has been hot for a year does not recover in a cool month.',
        'A cracked cover is not cosmetic on a wire hose. It is a corrosion entry point, which is a separate and more dangerous failure.',
        'Most of our range is rated to 100 °C, with the spiral grades and R5 to 121 °C and PTFE to 204 °C. Those are fluid temperatures, and radiated heat adds to them.',
        'Some covers are specified weather-resistant and some abrasion-resistant. Which one you have matters for where the hose can be routed.',
      ],
    },
    {
      type: 'lead',
      html: 'A cover that has gone hard and crazed with fine cracks looks like an old hose, and people treat it as cosmetic ageing. On a wire-reinforced hose it is not cosmetic at all — it is the protective layer failing, and what it was protecting is steel.',
    },

    { type: 'section_head', number: '/01', title: 'Reading the crack pattern.', anchor: 'crack-pattern' },
    {
      type: 'comparison_table',
      caption: 'Where the cracks are is the diagnosis',
      columns: ['Pattern', 'Cause', 'What fixes it'],
      rows: [
        { cells: ['Fine crazing over the whole cover, hose hard', 'Heat ageing', 'Route away from the heat, or shield it'], highlight: true },
        { cells: ['Cracks only on the outside of bends', 'Ozone attacking rubber held in tension', 'Reduce the bend, improve air movement, weather-resistant cover'] },
        { cells: ['Cracks on the sun-facing side only', 'UV exposure', 'Shade, sleeve, or a cover specified for weather'] },
        { cells: ['Deep splits after cold starts', 'Flexing below the hose’s minimum temperature', 'Warm-up before load; check the rated minimum'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'On a wire hose this is a corrosion problem, not an appearance problem.',
      body: 'Every crack in the cover is a path to the reinforcement. In humid, salt-carrying coastal air that path starts working immediately, and the resulting corrosion is invisible under an otherwise intact-looking cover. A crazed cover near the sea is a replacement, not an observation.',
    },

    { type: 'section_head', number: '/02', title: 'Heat is cumulative.', anchor: 'heat-cumulative' },
    {
      type: 'paragraph',
      html: 'Rubber ageing is a one-way process. Time spent hot is spent; a hose that has run at high temperature for a year has used up part of its life permanently and does not get it back when conditions improve. <strong>That is why heat-related failures cluster — hoses in the same hot location all age at the same rate and start failing at around the same time.</strong>',
    },
    {
      type: 'paragraph',
      html: 'The rated maximum on most of what we stock is 100 °C, rising to 121 °C on the spiral constructions and R5, and 204 °C on PTFE. Those are fluid temperatures. A hose running cool fluid past a hot manifold is being heated from outside, and nothing in the rating accounts for that.',
    },
    {
      type: 'direct_answer',
      question: 'Why is my hydraulic hose cover cracking?',
      answer:
        'Either heat ageing or ozone attack. Fine cracks over the whole cover with the hose gone hard is heat — the rubber has aged and will not recover. Cracks only on the outside of bends is ozone attacking rubber held in tension. On a wire-reinforced hose both matter beyond appearance, because every crack is a route for water to reach the reinforcement.',
    },

    { type: 'section_head', number: '/03', title: 'Ozone: the one that surprises people.', anchor: 'ozone' },
    {
      type: 'paragraph',
      html: 'Ozone attacks rubber that is stretched, which is why the cracks appear on the outside of bends and nowhere else. A hose lying straight in the same air is unaffected. It needs no heat and no sunlight, and it works on hoses that are sitting still — a spare coiled tight on a rack is a textbook case.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Store spares loose, not coiled tight.',
      body: 'A hose coiled to a small radius for storage is holding its outer surface in tension for the whole time it sits there. Store assemblies laid out or coiled generously, out of direct light, and rotate stock so the oldest is fitted first.',
    },

    { type: 'section_head', number: '/04', title: 'Cover specification matters.', anchor: 'cover-spec' },
    {
      type: 'paragraph',
      html: 'Covers are not interchangeable. Across the grades we stock some are specified <em>abrasion-resistant</em>, some <em>weather-resistant</em>, and some both. Where a hose is exposed to sun and still air rather than to rubbing, the weather-resistant specification is the one that matters — and choosing on abrasion alone puts the wrong hose in an exposed run.',
    },
    { type: 'product_embed', heading: 'Where heat is the constraint', skus: ['IH-HOSE-R14', 'IH-HOSE-R13'] },
    { type: 'category_link', slug: 'hose-clamps-sleeves-ferrules', label: 'Sleeves and guards', blurb: 'Shade an exposed run as well as protecting it.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is a cracked cover a reason to replace the hose?', answer: 'On a wire-reinforced hose, yes — the cracks expose the reinforcement to moisture and the resulting corrosion is not inspectable. On a textile hose it is less urgent but still means the rubber has aged.' },
        { question: 'Does a cracked cover mean the hose is out of date?', answer: 'It means it has aged, which is not quite the same thing. A hose in a hot exposed position ages faster than the calendar suggests, which is exactly why age-based replacement needs the environment factored in.' },
        { question: 'Can I use a heat sleeve instead of re-routing?', answer: 'Yes where re-routing is impossible, and it is genuinely effective against radiated heat. It is second best: the hose is still in a hot place and the sleeve has to stay in good order for the protection to persist.' },
        { question: 'Our spares are cracking on the shelf. Why?', answer: 'Ozone, and almost certainly tight coiling. Rubber held in tension cracks whether or not it is in service. Store them loose, out of direct light, and rotate the stock.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Temperature ranges and cover specifications from the product specifications for the grades we stock.',
    },
    { type: 'cta_block', heading: 'Hoses ageing faster than they should?', body: 'Heat and exposure are usually the reason, and both are addressable by routing before they are addressable by hose choice. We can review a machine and say which.', quoteLabel: 'Ask for a review' },
  ],
}

export default ARTICLE
