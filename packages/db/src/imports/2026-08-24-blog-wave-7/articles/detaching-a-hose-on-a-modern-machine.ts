import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'detaching-a-hose-on-a-modern-machine',
  title: 'Detaching a hose on a modern machine: guards, clips and the ones that fight back',
  excerpt:
    'On a machine built in the last fifteen years, getting to the hose takes longer than changing it. Most of that time is spent undoing things nobody photographed.',
  categorySlug: 'machine-down',
  authorSlug: 'mehul-rana',
  seoTitle: 'How to remove a hydraulic hose on a modern machine',
  seoDescription:
    'Access, guards, clamp blocks and routing on modern hydraulic machines: how to get a hose out without breaking trim, and what to record so it goes back the way it came.',
  focusKeyword: 'remove hydraulic hose machine',
  publishedAt: '2026-08-24T19:39:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Photograph before you undo anything. Routing on a modern machine is designed, and it is not obvious in reverse.',
        'Clamp blocks are the part people break. They are moulded pairs and they are rarely on the van.',
        'Hoses run in bundles that cross each other in a specific order. Getting the order wrong causes rubbing that fails the new hose early.',
        'Depressurise, including accumulators and any suspension or brake circuits that store pressure.',
        'The hose usually has to come out the way it went in, which means removing what was fitted after it.',
      ],
    },
    {
      type: 'lead',
      html: 'Older machines put their hoses on the outside. Modern ones route them through structure, behind trim, inside booms, past coolers and wiring looms, held in moulded clamp blocks that were fitted on a production line with the boom in a different position. The hose change is still ten minutes. Everything around it is the job.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Record before you dismantle.',
      anchor: 'record',
    },
    {
      type: 'comparison_table',
      caption: 'Five minutes of photographs that save an hour',
      columns: ['Photograph', 'What it saves you'],
      rows: [
        {
          cells: [
            'Whole run, both ends visible',
            'The overall path and which side of structure it passes',
          ],
          highlight: true,
        },
        {
          cells: [
            'Every clamp block, before opening',
            'Which hose sits in which position in the block',
          ],
          highlight: true,
        },
        { cells: ['Crossings and bundles', 'The order hoses cross each other in'] },
        {
          cells: [
            'Elbow clocking at both ends',
            'The angle that decides whether the new one routes',
          ],
        },
        { cells: ['Guards and trim, with fasteners visible', 'What came off, and in what order'] },
        {
          cells: [
            'Any rub marks on the old hose',
            'Evidence of why it failed, which changes the rebuild',
          ],
          highlight: true,
        },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Rub marks are the most valuable thing on the failed hose.',
      body: 'A wear patch tells you the routing was wrong, a clip was missing, or the hose was too long. Replacing it identically reproduces the failure on the same schedule. Photograph the marks and find what they were touching before the new one goes on.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Access, in the order that usually works.',
      anchor: 'access',
    },
    {
      type: 'decision_tree',
      heading: 'Getting to the hose',
      intro:
        'Modern machines reward patience and punish force, mostly in the form of broken plastic.',
      branches: [
        {
          condition: 'Position the machine first',
          outcome:
            'Boom, arm and attachment where the hose is accessible and the machine is stable.',
          detail:
            'Then lower onto the ground or fit supports and depressurise. Positioning after depressurising is not possible, so think about it first.',
        },
        {
          condition: 'Remove guards and trim rather than working around them',
          outcome: 'Bag and label the fasteners as you go.',
          detail:
            'Guards on modern machines are often structural to the routing — they hold the hose position as much as they protect it.',
        },
        {
          condition: 'Open clamp blocks carefully',
          outcome: 'They are moulded pairs, and the tabs snap cold.',
          detail:
            'A broken clamp block frequently has a long lead time. Warm them slightly if it is cold, and never lever them apart with a screwdriver.',
        },
        {
          condition: 'Free the hose along its whole length before undoing the ends',
          outcome: 'So it can be withdrawn rather than pulled.',
          detail:
            'Pulling a hose through structure with the ends still attached is how looms and coolers get damaged.',
        },
        {
          condition: 'Then break the joints, backing up the port',
          outcome: 'Two wrenches, always.',
          detail: 'Confined access is exactly where people use one wrench and damage the port.',
        },
      ],
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'The things that go wrong.',
      anchor: 'what-goes-wrong',
    },
    {
      type: 'comparison_table',
      caption: 'Common outcomes, and what caused them',
      columns: ['Outcome', 'Cause'],
      rows: [
        {
          cells: [
            'Broken clamp block, machine waits for a part',
            'Levering a cold moulded clamp apart',
          ],
          highlight: true,
        },
        {
          cells: [
            'New hose rubs through in months',
            'Rebuilt in the wrong order within the bundle',
          ],
          highlight: true,
        },
        {
          cells: [
            'Damaged wiring loom',
            'Hose pulled through structure rather than freed and withdrawn',
          ],
        },
        {
          cells: ['Cracked port on a valve block', 'One wrench in a confined space'],
          highlight: true,
        },
        { cells: ['Guard will not refit', 'Hose routed on the wrong side of a bracket'] },
        { cells: ['Contamination fault weeks later', 'Ports left open in a dusty environment'] },
      ],
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Modern machines store pressure in more places.',
      body: 'Accumulators for pilot circuits, suspension, brakes and attachment damping can hold pressure long after the engine is off, and some retain it for days. Follow the manufacturer discharge procedure for every accumulator on the machine, not just the one nearest the hose you want.',
    },
    {
      type: 'direct_answer',
      question: 'How do I remove a hydraulic hose on a modern machine?',
      answer:
        'Position the machine so the hose is accessible, then lower the implement, stop the engine, relieve pressure and discharge any accumulators. Photograph the whole run, every clamp block and the elbow clocking before undoing anything. Remove guards rather than working around them, open clamp blocks gently because they snap, free the hose along its entire length so it can be withdrawn rather than pulled, and only then break the joints — always with a second wrench backing up the port.',
    },

    { type: 'section_head', number: '/04', title: 'Putting it back.', anchor: 'refit' },
    {
      type: 'comparison_table',
      caption: 'Reassembly checks that matter more than they look',
      columns: ['Check', 'Why'],
      rows: [
        {
          cells: [
            'Same position within every clamp block',
            'The block sets the spacing that stops hoses rubbing',
          ],
          highlight: true,
        },
        {
          cells: [
            'Same crossing order in the bundle',
            'A hose on the wrong side of another wears through it',
          ],
          highlight: true,
        },
        {
          cells: [
            'No twist — check the layline',
            'A twisted hose loses a large fraction of its life',
          ],
        },
        {
          cells: [
            'Full articulation test before releasing the machine',
            'Cycle everything slowly through the full range and watch the hose',
          ],
          highlight: true,
        },
        {
          cells: [
            'Every guard and clip refitted',
            'They are part of the routing, not just protection',
          ],
        },
        { cells: ['Return filter changed', 'Ports were open in a dusty environment'] },
      ],
    },
    {
      type: 'category_link',
      slug: 'hydraulic-hoses',
      label: 'Hydraulic hose by grade',
      blurb: 'Built to the measured length, with the elbow clocking you specify.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-adapters',
      label: 'Hydraulic adapters',
      blurb: 'For the port fitting that comes out with the hose.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'The hose will not come out even with both ends free. What now?',
          answer:
            'Something fitted after it is in the way — usually a guard, a bracket or another hose in the bundle. Trace the path with a light rather than pulling; on many machines the hose was fitted before the structure around it.',
        },
        {
          question: 'Can I cut the old hose to get it out?',
          answer:
            'Yes, once both ends are off and it is being replaced, and it is often the sensible option in a confined route. Cap the ports first and catch the oil.',
        },
        {
          question: 'A clamp block broke. Can I leave it out?',
          answer:
            'No. Clamp blocks set the spacing that stops hoses rubbing on each other and on structure. Leaving one out is how the new hose fails early. Order the replacement.',
        },
        {
          question: 'Does the new hose need to be exactly the same length?',
          answer:
            'Yes, within a small tolerance. Too short puts the ends in tension; too long lets it move and rub. Measure the old one face to face lying straight.',
        },
        {
          question: 'Should I test at full pressure before refitting the guards?',
          answer:
            'Run and check for weeps with the guards off so you can see the joints, then refit them and cycle the machine through full articulation. Both steps, in that order.',
        },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'General method. Always follow the machine manufacturer procedure for accumulator discharge and for guard removal.',
    },
    {
      type: 'cta_block',
      heading: 'Send the photographs and we will build the replacement.',
      body: 'Both ends, the layline, the measured length and the elbow clocking. If you tell us the machine and position we can usually check the specification rather than just copying what was there.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
