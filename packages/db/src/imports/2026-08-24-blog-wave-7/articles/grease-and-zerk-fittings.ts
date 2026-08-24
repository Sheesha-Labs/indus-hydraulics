import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'grease-and-zerk-fittings',
  title: 'Grease and zerk fittings: thread types, and the ones that seize',
  excerpt:
    'The smallest threaded part on the machine, in four thread families that all look alike, and the one that will not take grease at six in the morning is always the one you cannot reach.',
  categorySlug: 'maintenance-reliability',
  authorSlug: 'mehul-rana',
  seoTitle: 'Grease nipple thread types and removing a seized zerk',
  seoDescription:
    'Grease fitting thread families and head styles, how to tell which you have, why a zerk stops taking grease, and how to remove a seized one without damaging the housing.',
  focusKeyword: 'grease nipple thread types',
  publishedAt: '2026-08-24T19:15:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Four thread families dominate: NPT tapered, BSP, metric, and UNF. They are close enough in size to be confused and not close enough to interchange.',
        'A fitting that will not take grease is usually a blocked check ball, not a blocked bearing.',
        'Head style matters as much as thread: standard, button head and flush, each needing a different coupler.',
        'Seized grease fittings are soft, small and easy to shear. The head goes first and then you have a stub in a housing.',
        'Fit the angle that lets the gun reach. A straight nipple in an unreachable position is a lubrication point that will be skipped.',
      ],
    },
    {
      type: 'lead',
      html: 'A grease nipple costs less than almost anything else in a workshop and is responsible for a surprising amount of unplanned downtime — not because it fails, but because the wrong one gets fitted, or the right one seizes, and a lubrication point quietly stops being lubricated for a year.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Identifying what is fitted.',
      anchor: 'identifying',
    },
    {
      type: 'comparison_table',
      caption: 'The families you will actually meet',
      columns: ['Thread', 'Typically found on', 'Notes'],
      rows: [
        {
          cells: [
            'NPT tapered',
            'North American equipment, older machinery',
            'Tapered — visibly narrows along its length',
          ],
          highlight: true,
        },
        {
          cells: [
            'BSP',
            'European and Asian machinery, both parallel and tapered forms',
            'Check parallel against tapered before ordering',
          ],
          highlight: true,
        },
        {
          cells: [
            'Metric',
            'European machinery, modern equipment generally',
            'The most common on newer machines',
          ],
        },
        { cells: ['UNF', 'Automotive, some attachments', 'Fine pitch, easy to cross-thread'] },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Take the old one with you.',
      body: 'Grease fittings are the one component where matching by eye almost never works — sizes across families sit within a millimetre of each other. The old fitting, or a photograph of it against a rule with a thread gauge, settles it in seconds.',
    },
    {
      type: 'comparison_table',
      caption: 'Head styles, and why the coupler will not fit',
      columns: ['Head style', 'Use', 'Coupler'],
      rows: [
        {
          cells: [
            'Standard hydraulic (Zerk) head',
            'General purpose, most machines',
            'Standard push-on coupler',
          ],
          highlight: true,
        },
        { cells: ['Button head', 'High volume, industrial plant', 'Larger dedicated coupler'] },
        {
          cells: [
            'Flush or pin type',
            'Where a protruding head would be knocked off',
            'Needle or dedicated adapter',
          ],
        },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'When it will not take grease.',
      anchor: 'wont-take-grease',
    },
    {
      type: 'decision_tree',
      heading: 'Working out what is actually blocked',
      intro:
        'Diagnose before applying more pressure — a grease gun generates enough to damage a seal.',
      branches: [
        {
          condition: 'Remove the fitting and try grease into the open port',
          outcome: 'If it takes it, the fitting was the blockage.',
          detail:
            'This is the most common outcome by a wide margin. The check ball has corroded or is stuck with hardened grease.',
        },
        {
          condition: 'Open port also refuses',
          outcome: 'The passage or the bearing is blocked.',
          detail:
            'Now it is a mechanical problem. Forcing more grease at higher pressure risks blowing a seal.',
        },
        {
          condition: 'It takes grease but nothing appears at the joint',
          outcome: 'Grease is escaping somewhere else, or the passage is cracked.',
          detail:
            'Look for grease emerging where it should not be before assuming the point is fed.',
        },
        {
          condition: 'The fitting takes grease and pushes it back out',
          outcome: 'Check ball not seating.',
          detail: 'Replace the fitting. It will also be letting contamination in.',
        },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A grease gun can exceed the pressure a seal will hold.',
      body: 'Lever guns generate very high pressures at the nozzle. Where a point refuses grease, escalating force is how a bearing seal is blown out or a housing cracked. Diagnose the blockage instead.',
    },

    { type: 'section_head', number: '/03', title: 'Getting a seized one out.', anchor: 'seized' },
    {
      type: 'paragraph',
      html: 'Grease fittings are small, usually mild steel, and sit exposed to everything. <strong>The failure mode is shearing the head off and leaving a threaded stub in the housing</strong> — which turns a two-minute job into a drilling and extraction job on a component you probably cannot remove.',
    },
    {
      type: 'comparison_table',
      caption: 'Escalation that does not end in a sheared stub',
      columns: ['Step', 'Note'],
      rows: [
        {
          cells: [
            'Clean the head and get a proper six-point socket on it',
            'Most "seized" nipples are simply being turned by a slipping tool',
          ],
          highlight: true,
        },
        {
          cells: [
            'Penetrant and sharp taps, then wait',
            'Vibration moves penetrant along a thread; standing still does not',
          ],
        },
        {
          cells: [
            'Small, controlled heat on the housing around it',
            'Only where there is no seal, no paint and nothing flammable nearby',
          ],
        },
        {
          cells: [
            'Alternate loosen and tighten in small movements',
            'Breaks the corrosion bond without a single high load',
          ],
          highlight: true,
        },
        {
          cells: [
            'Stop if the head starts to round',
            'A rounded head can still be gripped. A sheared stub cannot',
          ],
          highlight: true,
        },
      ],
    },
    {
      type: 'direct_answer',
      question: 'Why will my grease fitting not take grease?',
      answer:
        'Nearly always the fitting itself rather than the bearing. The check ball inside corrodes or sticks with hardened grease and stops opening. Remove the fitting and try grease into the open port: if it takes it, replace the fitting. If the open port also refuses, the passage or bearing is blocked and forcing more grease risks blowing a seal or cracking the housing.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Specifying replacements sensibly.',
      anchor: 'specifying',
    },
    {
      type: 'comparison_table',
      caption: 'Small decisions that save a lot of skipped lubrication',
      columns: ['Decision', 'Guidance'],
      rows: [
        {
          cells: ['Angle', 'Fit the angle that lets a gun reach — straight, 45 or 90 degrees'],
          highlight: true,
        },
        {
          cells: ['Material', 'Stainless where washdown, salt air or corrosion is the issue'],
          highlight: true,
        },
        {
          cells: [
            'Extension or remote line',
            'Where the point is genuinely unreachable, bring it somewhere reachable',
          ],
        },
        { cells: ['Caps', 'Keep dirt off the head so it is not driven in by the coupler'] },
        {
          cells: [
            'Stock',
            'Hold the sizes your fleet uses. They are cheap and they strand a machine',
          ],
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'hydraulic-adapters',
      label: 'Hydraulic adapters',
      blurb: 'Thread conversions where the replacement family differs.',
    },
    {
      type: 'category_link',
      slug: 'seals-accessories',
      label: 'Seals and accessories',
      blurb: 'Caps and small parts for lubrication points.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'What is a zerk fitting?',
          answer:
            'The common name for a standard hydraulic grease fitting — a small threaded body with a spring-loaded check ball behind a rounded head. Zerk is the inventor’s name; the part is the same one sold as a grease nipple.',
        },
        {
          question: 'Can I fit a metric grease nipple into an NPT hole?',
          answer:
            'No. It may start and feel tight, then either leak grease around the thread or strip the housing. Match the family, and use an adapter only if the housing thread genuinely cannot be matched.',
        },
        {
          question: 'Why does grease come out around the fitting rather than into the joint?',
          answer:
            'Either the thread is not sealing — wrong family, or a tapered fitting that needs sealant — or the passage beyond it is blocked so the grease takes the easiest route out.',
        },
        {
          question: 'Should I replace a fitting that is hard to grease?',
          answer:
            'Yes. They cost very little, and a fitting that resists the gun is one that will be skipped on the next service round.',
        },
        {
          question: 'Is stainless worth it?',
          answer:
            'On coastal and washdown equipment, clearly. It is a small premium against a fitting that seizes into a housing you cannot easily repair.',
        },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Thread families as commonly encountered. Confirm against the machine parts list where one exists.',
    },
    {
      type: 'cta_block',
      heading: 'Send the old nipple or a photograph of it.',
      body: 'Grease fittings are the easiest part to get wrong by eye and the easiest to confirm from a picture against a rule. Tell us the machine too and we will suggest what to hold.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
