import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'field-re-hosing-kit',
  title: 'Re-hosing a machine in the field: the kit to stage before you start',
  excerpt:
    'Bringing the machine to a workshop is the easy version. This is the other one — what to stage, what to label, and the order of work when the machine cannot move.',
  categorySlug: 'hose-assembly',
  authorSlug: 'mehul-rana',
  seoTitle: 'Field hose replacement kit — what to prepare',
  seoDescription:
    'Replacing multiple hydraulic hoses on a machine that cannot come to a workshop: what to stage, how to tag hoses before removal, and the order of work that avoids a stranded machine.',
  focusKeyword: 'field hydraulic hose replacement',
  publishedAt: '2026-08-24T19:23:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Tag every hose before removing any of them. Two hoses that look identical rarely are.',
        'Work one hose at a time where you can. A machine with eight hoses off and no labels is a machine you have lost.',
        'Stage the whole job before breaking the first joint: assemblies, caps, seals, tools, drain trays, waste containers.',
        'Photograph routing before removal, including the clips and guards. The photographs are the reassembly instructions.',
        'Plan for the ones that will not come off. Every field job has at least one, and it is the reason to carry spare adapters.',
      ],
    },
    {
      type: 'lead',
      html: 'Replacing hoses as they fail keeps a machine limping for years. Replacing a whole set at once ends that, and it is the right call more often than people think — but doing it on a site road rather than a workshop floor is a different job, and the difference is almost entirely preparation.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Before the van leaves.',
      anchor: 'before-you-leave',
    },
    {
      type: 'comparison_table',
      caption: 'Staged and checked, not hoped for',
      columns: ['Item', 'Note'],
      rows: [
        {
          cells: [
            'The assemblies, tagged to match the survey',
            'Built to measured lengths, labelled with the position they go to',
          ],
          highlight: true,
        },
        {
          cells: [
            'Spare adapters in the families on the machine',
            'For the port fitting that comes out with the hose',
          ],
          highlight: true,
        },
        {
          cells: [
            'Bonded seals and O-rings for every joint being opened',
            'Single use. Assume every one needs replacing',
          ],
        },
        {
          cells: [
            'Caps and plugs, every size',
            'Contamination control, and enough of them for every open port at once',
          ],
        },
        {
          cells: [
            'Drain trays and sealed waste containers',
            'A field job produces more waste oil than expected',
          ],
        },
        {
          cells: [
            'Backing wrenches in the right sizes',
            'Not optional — this is what saves the ports',
          ],
          highlight: true,
        },
        {
          cells: [
            'Return filter for the machine',
            'Fit it at the end of the job, not next service',
          ],
        },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Survey first, build second.',
      body: 'A re-hosing job done properly has two visits: one to measure, photograph and identify every assembly, and one to fit. Trying to compress them into a single visit is what produces a machine in pieces waiting on a hose that has to be built and driven out.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Tagging, before anything moves.',
      anchor: 'tagging',
    },
    {
      type: 'decision_tree',
      heading: 'Labelling that survives the job',
      intro: 'Do all of this before the first joint is broken.',
      branches: [
        {
          condition: 'Tag both ends of every hose',
          outcome: 'Position and orientation, on a tag that will not wipe off in oil.',
          detail:
            'Two hoses of the same length with the same ends can still be different assemblies if the elbows are clocked differently.',
        },
        {
          condition: 'Photograph the routing before removal',
          outcome: 'Whole run, then close-ups of every clip, guard and crossing point.',
          detail:
            'Routing is what determines whether the new set lasts. Rebuilding from memory is how a hose ends up rubbing on structure.',
        },
        {
          condition: 'Mark the clocking of every elbow',
          outcome: 'A line across the fitting and the adapter with a marker.',
          detail:
            'The angle between two ends is the detail that most often sends an assembly back.',
        },
        {
          condition: 'Record which fittings came out with which hose',
          outcome: 'Port adapters that came out are part of the rebuild.',
          detail:
            'This is what tells you whether the adapter in the van is the right one before you find out at reassembly.',
        },
      ],
    },

    { type: 'section_head', number: '/03', title: 'Order of work.', anchor: 'order-of-work' },
    {
      type: 'comparison_table',
      caption: 'One at a time, unless there is a reason not to',
      columns: ['Approach', 'When', 'Risk'],
      rows: [
        {
          cells: [
            'One hose off, one hose on',
            'Default, and always where labelling is thin',
            'Slowest, and safest',
          ],
          highlight: true,
        },
        {
          cells: [
            'A circuit at a time',
            'When a whole circuit is being replaced and is well documented',
            'Manageable',
          ],
        },
        {
          cells: [
            'Everything off, then everything on',
            'Workshop with a full survey and tagged assemblies',
            'On site, this is how machines get stranded',
          ],
          highlight: true,
        },
      ],
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Stored energy before the first joint.',
      body: 'Lower every implement or fit the mechanical supports, stop the engine, cycle the controls to relieve pressure, and discharge any accumulator by its own procedure. On a field job with several people around a machine, say it out loud rather than assuming it was done.',
    },
    {
      type: 'direct_answer',
      question: 'What do I need to prepare before re-hosing a machine in the field?',
      answer:
        'Survey and photograph the machine first and build the assemblies to measured lengths, tagged to their positions. Then stage: spare port adapters in the machine’s thread families, new bonded seals and O-rings for every joint, caps and plugs for every port at once, backing wrenches, drain trays and sealed waste containers, and a return filter to fit at the end. Tag both ends of every hose and mark elbow clocking before removing anything.',
    },

    { type: 'section_head', number: '/04', title: 'Finishing properly.', anchor: 'finishing' },
    {
      type: 'comparison_table',
      caption: 'The last twenty minutes that decide whether it holds',
      columns: ['Step', 'Why'],
      rows: [
        {
          cells: [
            'Check every hose is free at full articulation',
            'Cycle every circuit slowly through its full range before releasing the machine',
          ],
          highlight: true,
        },
        {
          cells: [
            'Confirm no hose is in tension or twisted',
            'Look at the layline. A spiral means it will fail early',
          ],
          highlight: true,
        },
        {
          cells: [
            'Refit every clip and guard',
            'The clips are why the routing survives, not decoration',
          ],
        },
        {
          cells: [
            'Run, then re-check every joint dry',
            'Wipe dry, run, then look. Weeps are visible in minutes',
          ],
        },
        {
          cells: ['Change the return filter', 'Whatever entered during the job is now circulating'],
          highlight: true,
        },
        {
          cells: [
            'Leave the survey and the tags with the customer',
            'Next time this is a parts list rather than a survey',
          ],
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'hydraulic-hoses',
      label: 'Hydraulic hose by grade',
      blurb: 'Assemblies built to a survey and tagged by position.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-adapters',
      label: 'Hydraulic adapters',
      blurb: 'The spares that stop a field job stalling.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Is it better to replace hoses as they fail?',
          answer:
            'Only where failures are rare and the machine is easy to get to. On an ageing machine where hoses of the same age are failing one after another, replacing the set ends the pattern instead of chasing it.',
        },
        {
          question: 'How long does a field re-hose take?',
          answer:
            'It depends far more on access and on how many fittings resist removal than on the number of hoses. Budget for the ones that will not come off, because there are always some.',
        },
        {
          question: 'Can you build the assemblies from photographs?',
          answer:
            'Often yes, if the photographs include a rule and both ends, and the length is measured face to face. For a whole machine, a survey visit is usually worth it.',
        },
        {
          question: 'What if a port adapter is damaged when it comes out?',
          answer:
            'That is why the spare adapters are on the list. Where the port itself is damaged, stop and assess — a damaged pressure port is not a field repair.',
        },
        {
          question: 'Should the customer keep the old hoses?',
          answer:
            'Keep them until the machine has run for a shift, so anything mislabelled can be checked against the original. Then dispose of them so they cannot be refitted by mistake.',
        },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Field practice from our own mobile service teams.',
    },
    {
      type: 'cta_block',
      heading: 'We will do the survey.',
      body: 'Tell us the machine and the location and we will measure, photograph and tag every assembly, then come back and fit the set. You get the survey afterwards as a parts list.',
      quoteLabel: 'Request on-site service',
    },
  ],
}

export default ARTICLE
