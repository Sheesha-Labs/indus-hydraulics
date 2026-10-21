import type { BlogBlocksInput } from '@indus/domain'

/**
 * The hydraulic tools and bolting hub.
 *
 * Created 2026-10-21 from the blog-linkage audit: thirteen tool shelves — torque wrenches and their sockets and
 * reaction arms, bolt tensioners, nut splitters, flange tools, jacks and skates, pullers, presses, cutters,
 * cylinder-pump sets, swing clamps, Stanley hydraulic power tools and Pierce winches — sixty-odd listings with no
 * article pointing at them. They share a buyer (the shutdown, maintenance or construction crew planning a job
 * around a tool and its pump) rather than a component family, so they get a hub of their own instead of being
 * folded into cylinders and pumps.
 */
export const TOOLS_BOLTING_CATEGORY = {
  slug: 'hydraulic-tools-bolting',
  name: 'Hydraulic tools & bolting',
  description:
    'Guides to hydraulic torque wrenches, bolt tensioners, nut splitters, flange tools, jacks, skates, pullers, presses, cutters and hydraulic power tools: how each works, how to size it and what to send for a quote.',
  heroCopy:
    'Industrial tools are chosen in a hurry and used under load: a torque wrench that will not fit the flange, a jack set on soft ground, a puller with the wrong reach, a breaker on a power unit that cannot supply its flow. These guides cover how each tool works, the figures that decide its size, and the accessories that have to arrive with it.',
  seoTitle: 'Hydraulic tools & bolting — torque wrenches, jacks, pullers guides',
  seoDescription:
    'Guides to industrial hydraulic tools: square-drive and low-profile torque wrenches, bolt tensioning, nut splitters, flange spreaders, jacks and skates, pullers, presses, cutters and open-centre hydraulic power tools.',
  focusKeyword: 'hydraulic bolting tools',
  position: 21,
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What are hydraulic bolting and maintenance tools?',
      answer:
        'Tools driven by a hydraulic pump — usually at 700 bar (10,000 psi) — that tighten, loosen, lift, push, pull or cut where hand tools cannot: torque wrenches and tensioners for large bolts, nut splitters for seized nuts, flange spreaders and alignment tools, jacks, wedges and skates for heavy loads, pullers and presses for bearings and gears, and cutters. Open-centre hydraulic power tools such as breakers, saws and submersible pumps run from a power unit or a machine’s auxiliary circuit at lower pressure.',
    },
    {
      type: 'comparison_table',
      caption: 'Which tool for which job',
      columns: ['Job', 'Tool', 'What decides the size'],
      rows: [
        { cells: ['Tighten or break out large bolts', 'Hydraulic torque wrench', 'Torque, nut size, access around the nut'], highlight: true },
        { cells: ['Load studs evenly by stretching', 'Bolt tensioner', 'Bolt diameter, thread, target load'] },
        { cells: ['Remove a seized nut', 'Nut splitter', 'Nut size across flats, bolt grade'] },
        { cells: ['Open or align a flange', 'Flange spreader, alignment tool', 'Gap, force, flange class'] },
        { cells: ['Lift or move heavy loads', 'Jacks, wedges, skates', 'Load, closed height, stroke'] },
        { cells: ['Remove bearings, gears, bushes', 'Puller or press', 'Force, reach, spread'] },
        { cells: ['Break, cut, drill, pump on site', 'Hydraulic power tools', 'Flow and pressure class of the power source'] },
      ],
    },
    {
      type: 'category_link',
      slug: 'hydraulic-torque-wrenches',
      label: 'Hydraulic torque wrenches',
      blurb: 'Square-drive and low-profile hexagon wrenches, sockets, reaction arms and twin hoses.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-jacks-skates',
      label: 'Jacks and skates',
      blurb: 'Bottle jacks, aluminium jacks, lifting wedges, machine lifts and load skates.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-power-tools',
      label: 'Hydraulic power tools',
      blurb: 'Breakers, saws, grinders, drills, submersible pumps and power units.',
    },
    {
      type: 'cta_block',
      heading: 'Planning a bolting or lifting job?',
      body: 'Send the bolt size and grade, the torque or load, the access around the joint and the shutdown date. We will quote the tool, pump, hoses and accessories as one kit.',
      quoteLabel: 'Ask for a quotation',
    },
  ] satisfies BlogBlocksInput,
}
