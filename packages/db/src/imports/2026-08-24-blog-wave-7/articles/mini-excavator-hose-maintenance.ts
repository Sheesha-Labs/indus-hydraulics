import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'mini-excavator-hose-maintenance',
  title: 'Mini excavator hose and coupler maintenance: the items nobody schedules',
  excerpt:
    'Service schedules cover oil, filters and greasing. They rarely mention the hoses, which is why a machine on a perfect service record still strands a crew on a Thursday.',
  categorySlug: 'maintenance-reliability',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Mini excavator hydraulic hose maintenance schedule',
  seoDescription:
    'A practical hose and coupler inspection routine for mini excavators in rental and contractor fleets: what to check daily, weekly and quarterly, and which positions fail first.',
  focusKeyword: 'mini excavator hose maintenance',
  publishedAt: '2026-08-24T19:44:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Mini excavators concentrate their hose failures in four places: the boom-to-arm crossing, the attachment couplers, the dozer blade circuit, and the slew centre.',
        'The attachment couplers fail more often than any hose, because they are connected and disconnected constantly and live at ground level.',
        'A daily walk-round takes ninety seconds and catches most of it — cover damage, weeping joints, and hoses that have moved out of their clips.',
        'Rental machines age differently: the hours are similar, the abuse is not, and the couplers take most of it.',
        'The failure that strands a crew is nearly always visible a week earlier as a wear patch or a weep.',
      ],
    },
    {
      type: 'lead',
      html: 'A mini excavator is the most-used machine on most sites in this region and the least likely to have anything written down about its hoses. The service book covers engine oil and filters. The hoses are inspected when one bursts.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Where they actually fail.',
      anchor: 'where-they-fail',
    },
    {
      type: 'comparison_table',
      caption: 'Four positions, in order',
      columns: ['Position', 'Why it fails', 'What to look for'],
      rows: [
        {
          cells: [
            'Attachment quick couplers',
            'Constant connection cycles, ground-level dirt, trapped pressure',
            'Weeping seals, stiff sleeves, cracked female bodies',
          ],
          highlight: true,
        },
        {
          cells: [
            'Boom to arm crossing',
            'Continuous flexing through the full working range',
            'Cover wear where hoses touch each other or structure',
          ],
          highlight: true,
        },
        {
          cells: [
            'Dozer blade circuit',
            'Low, exposed, takes impacts and debris',
            'Cover damage, crushed sections, torn clips',
          ],
        },
        {
          cells: [
            'Slew centre and swing circuit',
            'Tight routing and repeated twisting',
            'Twist in the layline, wear at the entry point',
          ],
        },
        {
          cells: [
            'Auxiliary circuit to the attachment',
            'High impulse from breakers, plus coupler cycling',
            'Fatigue at the fitting, weeping under load',
          ],
          highlight: true,
        },
      ],
    },

    { type: 'section_head', number: '/02', title: 'The routine.', anchor: 'routine' },
    {
      type: 'comparison_table',
      caption: 'What to check, and how often',
      columns: ['Interval', 'Check', 'Time'],
      rows: [
        {
          cells: [
            'Every shift',
            'Walk-round: cover damage, wet joints, hoses out of clips, coupler faces wiped before connecting',
            '90 seconds',
          ],
          highlight: true,
        },
        {
          cells: [
            'Weekly',
            'Cycle every circuit through full range and watch for hoses touching or pulling',
            '5 minutes',
          ],
        },
        {
          cells: [
            'Weekly',
            'Coupler condition: sleeve movement, seal weep, dust caps present',
            '2 minutes',
          ],
          highlight: true,
        },
        {
          cells: [
            'Monthly',
            'Clamp blocks and clips present and holding the routing',
            '10 minutes',
          ],
        },
        {
          cells: [
            'Quarterly',
            'Look at the four failure positions properly, with the machine articulated',
            '30 minutes',
          ],
        },
        {
          cells: [
            'On attachment change',
            'Wipe both coupler faces, check for trapped pressure, no hammering',
            'Seconds',
          ],
          highlight: true,
        },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'The walk-round only works if hoses are dry.',
      body: 'A machine with an old weep somewhere is a machine where nobody can see a new one. Clean the oil off when a leak is fixed rather than leaving it — a dry machine is a diagnosable machine, and it costs one rag.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Reading wear before it becomes a failure.',
      anchor: 'reading-wear',
    },
    {
      type: 'decision_tree',
      heading: 'What a mark on a hose is telling you',
      intro: 'Cover damage is a warning with a schedule attached. It is worth learning to read.',
      branches: [
        {
          condition: 'Shiny patch, cover intact',
          outcome: 'Rubbing. Find what it touches and fix the routing or fit protection.',
          detail:
            'At this stage nothing needs replacing. This is the cheapest moment in the whole cycle.',
        },
        {
          condition: 'Cover worn through, reinforcement visible but bright',
          outcome: 'Replace at the next opportunity, and fix the cause.',
          detail:
            'Exposed wire corrodes quickly in coastal air, and corroded wire fails at a fraction of its rating.',
        },
        {
          condition: 'Reinforcement visible and rust-coloured',
          outcome: 'Replace now.',
          detail:
            'The strength member is already compromised. This one bursts, and usually at the least convenient moment.',
        },
        {
          condition: 'Cracked cover across the whole exposed length',
          outcome: 'Age and sun, not mechanical damage.',
          detail:
            'Typical of machines standing outdoors in this climate. Check the rest of the set — they are all the same age.',
        },
        {
          condition: 'Blistering or bulging',
          outcome: 'Replace immediately, do not run the machine.',
          detail: 'A bulge is the reinforcement having already failed locally.',
        },
      ],
    },

    { type: 'section_head', number: '/04', title: 'Rental fleets.', anchor: 'rental' },
    {
      type: 'paragraph',
      html: 'A hired machine sees the same hours and different treatment. <strong>The couplers take the worst of it</strong>: connected by whoever is on site, forced when they will not go, left uncapped, dropped in sand. On a rental fleet the coupler pairs are effectively consumables, and inspecting them on every return is more valuable than any hose check.',
    },
    {
      type: 'comparison_table',
      caption: 'On return from hire',
      columns: ['Check', 'Action if it fails'],
      rows: [
        {
          cells: [
            'Coupler sleeves move freely, no hammer marks',
            'Replace the pair — a forced coupler is fatigued',
          ],
          highlight: true,
        },
        {
          cells: ['Dust caps present on both halves', 'Refit. They cost nothing and keep sand out'],
        },
        {
          cells: ['Auxiliary hoses free of new rub marks', 'Fix the routing before the next hire'],
        },
        {
          cells: ['No weep at any joint after a run', 'Investigate before it goes out again'],
          highlight: true,
        },
        {
          cells: [
            'Blade and boom hoses clipped correctly',
            'Refit clips; missing clips cause the next failure',
          ],
        },
      ],
    },
    {
      type: 'direct_answer',
      question: 'How often should mini excavator hydraulic hoses be checked?',
      answer:
        'A ninety-second walk-round every shift for cover damage, wet joints and hoses out of their clips; a weekly cycle of every circuit through full range while watching for hoses touching or pulling; and a quarterly proper look at the four positions that fail first — the attachment couplers, the boom-to-arm crossing, the dozer blade circuit and the slew centre. On rental machines, inspect the couplers on every return.',
    },
    {
      type: 'category_link',
      slug: 'quick-couplers',
      label: 'Hydraulic quick couplers',
      blurb: 'Matched pairs for attachment circuits.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-hoses',
      label: 'Hydraulic hose by grade',
      blurb: 'Replacement assemblies built to the machine.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Should hoses be replaced on a time interval?',
          answer:
            'Condition rather than the calendar drives most replacements, but age matters in this climate — sun and heat crack covers on machines that stand outdoors. When one hose of a set fails from age, look hard at the rest, because they are the same age.',
        },
        {
          question: 'Is it worth replacing all the hoses at once on an older machine?',
          answer:
            'Often, yes. Once a machine starts failing hoses one after another, a planned set replacement ends the pattern instead of chasing it, and it can be scheduled instead of stranding a crew.',
        },
        {
          question: 'The couplers weep a few drops on disconnect. Normal?',
          answer:
            'On poppet couplers a few drops is normal. Weeping while connected is not, and neither is a growing puddle under a parked machine.',
        },
        {
          question: 'What is the single most valuable check?',
          answer:
            'Cycling every circuit slowly through full articulation and watching the hoses. Almost every routing fault shows itself at one end of the range and is invisible with the machine parked.',
        },
        {
          question: 'How do I stop hoses being forced onto couplers?',
          answer:
            'Fix the reason they will not connect. Nearly always it is trapped pressure, and pressure-eliminator couplers remove the temptation entirely.',
        },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Intervals are our recommended practice. Follow the machine manufacturer schedule where it specifies more.',
    },
    {
      type: 'cta_block',
      heading: 'We will survey a fleet and tell you what to hold.',
      body: 'Give us the machine list and we will identify the hoses and couplers that fail first on those models, so the shelf carries the right things rather than everything.',
      quoteLabel: 'Ask about a stock list',
    },
  ],
}

export default ARTICLE
