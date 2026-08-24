import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'port-equipment-hydraulic-hose',
  title: 'Reach stackers and RTGs: salt air, continuous duty and no downtime window',
  excerpt:
    'Port equipment combines the two hardest things: coastal corrosion and a duty cycle that never stops. Neither is an argument for a different hose. Both are arguments for a different regime.',
  categorySlug: 'machine-down',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Port equipment hydraulic hose — reach stackers, RTGs, terminal tractors',
  seoDescription:
    'Hydraulic hose on container handling equipment: spreader circuits, telescoping booms, salt air corrosion and planning replacement around a terminal that does not stop.',
  focusKeyword: 'port equipment hydraulic hose',
  publishedAt: '2026-08-27T12:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Spreader circuits are the busiest hydraulics in the terminal — twistlocks and sideshift cycle on every container.',
        'Salt air corrodes reinforcement through any breach in the cover, invisibly, and Jebel Ali is salt air.',
        'Continuous duty means age accumulates fast in calendar terms as well as cycle terms.',
        'There is rarely a natural downtime window, so replacement has to be planned rather than reactive.',
        'The specification usually does not change. The inspection interval and the tagging do.',
      ],
    },
    {
      type: 'lead',
      html: 'Container handling equipment gets the worst of both worlds in this region — a corrosive atmosphere and a duty cycle with no natural pause. The interesting part is that neither problem is solved by buying a different hose.',
    },

    { type: 'section_head', number: '/01', title: 'Where the cycles are.', anchor: 'the-cycles' },
    {
      type: 'comparison_table',
      caption: 'Circuit against duty',
      columns: ['Circuit', 'Cycles', 'Notes'],
      rows: [
        { cells: ['Spreader twistlocks', 'Every container, both ends', 'Highest cycle count on the machine'], highlight: true },
        { cells: ['Spreader sideshift and telescope', 'Most containers', 'Hoses that must extend and retract'] },
        { cells: ['Boom lift and telescope', 'Every lift', 'Long runs, high exposure'] },
        { cells: ['Stabilisers / suspension', 'Continuous', 'Low on the machine, salt spray'] },
        { cells: ['Drive and steer', 'Continuous', 'Machine immobile if lost'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The spreader is where the hydraulic work is concentrated, and it is at the end of a long boom in the weather. <strong>Spreader hoses accumulate cycles faster than anything else in the terminal</strong>, and they are the least convenient to reach.',
    },

    { type: 'section_head', number: '/02', title: 'Salt is the invisible half.', anchor: 'salt' },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Corrosion under an intact cover gives no warning at all.',
      body: 'Salt-laden humid air corrodes the steel reinforcement wherever the cover has been breached — a cut, an abrasion scar, a crack. The cover stays smooth and the hose looks healthy right up to the burst. In a terminal, that is a hose failing over a container or a road.',
    },
    {
      type: 'paragraph',
      html: 'The practical response is not a corrosion-resistant hose, because hydraulic hose reinforcement is carbon steel in essentially every common construction. It is to treat any cover damage as a replacement trigger, and to replace on age where inspection access is poor.',
    },
    {
      type: 'direct_answer',
      question: 'How should port equipment hydraulic hoses be managed?',
      answer:
        'On age and condition rather than on failure. Salt air corrodes reinforcement invisibly through any breach in the cover, so inspection catches only part of the risk; and continuous duty means assemblies reach the end of their life quickly in calendar terms. That requires tagged assemblies with known build dates and a planned replacement window.',
    },

    { type: 'section_head', number: '/03', title: 'Planning around a terminal that does not stop.', anchor: 'planning' },
    {
      type: 'decision_tree',
      heading: 'What makes planned replacement workable',
      intro: 'The constraint is the window, so everything below is about shortening it.',
      branches: [
        { condition: 'Assemblies are not tagged', outcome: 'Tag them at the next opportunity — nothing else works without this.', detail: 'Age-based replacement needs a build date, and the layline does not survive this environment.' },
        { condition: 'Spreader hoses are replaced individually as they fail', outcome: 'Move to replacing the set.', detail: 'They accumulate cycles together, so they reach the end together. One window instead of five interruptions.' },
        { condition: 'Assemblies are made to order when a machine stops', outcome: 'Hold the common sets pre-built and dated.', detail: 'Storage ages them, so date-mark and rotate — but a shelf assembly beats a stopped machine.' },
        { condition: 'Access to the spreader is the bottleneck', outcome: 'Bundle the hose work with whatever else needs that access.', detail: 'The cost here is the window, not the hose.' },
      ],
    },
    { type: 'product_embed', heading: 'Grades used on container handling equipment', skus: ['IH-HOSE-R2-2SN', 'IH-HOSE-4SH', 'IH-HOSE-R13'] },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Assemblies built, tested and date-tagged.' },
    { type: 'category_link', slug: 'stainless-steel-hydraulic-fittings', label: 'SS316L fittings', blurb: 'Where salt seizes carbon steel.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is there a corrosion-resistant hydraulic hose for port use?', answer: 'Not as a variant of standard hose — the reinforcement is carbon steel in essentially all common constructions. Protecting the cover and replacing on age is the available control. Stainless fittings are worth specifying separately.' },
        { question: 'How much does salt shorten hose life here?', answer: 'We do not publish a multiplier because it depends almost entirely on whether the cover has been breached. An intact cover in salt air is doing its job; a scarred one is on a much faster clock.' },
        { question: 'Can you hold stock for our fleet?', answer: 'Yes, and we date-mark it so rotation is possible. For a terminal, having the set on a shelf is usually worth more than the shelf-life cost.' },
        { question: 'Do you work to a terminal’s shift pattern?', answer: 'Yes. Planned hose work is easier to schedule than an unplanned stop, which is most of the argument for doing it this way.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Guidance from our own practice supplying coastal and terminal operations. No corrosion-rate multiplier is published because we have not measured one.',
    },
    { type: 'cta_block', heading: 'Terminal fleet to plan around?', body: 'Tagging, pre-built sets and a planned window beat reacting to failures over a container. Tell us the fleet and we will work out the sets.', quoteLabel: 'Ask about fleet supply' },
  ],
}

export default ARTICLE
