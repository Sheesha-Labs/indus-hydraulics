import type { BlogBlocksInput } from '@indus/domain'

/**
 * The by-industry hub.
 *
 * Wave 3 was planned to spread across existing categories. It got its own hub
 * instead, for one reason: ten sector articles filed under `maintenance-
 * reliability` and `machine-down` would have diluted two clusters that each
 * mean something specific, and would have left the sector cluster with no page
 * of its own to rank. A hub is one more indexable node and it makes the cluster
 * legible to a reader who arrives on any one article.
 *
 * Body and focus keyword from creation, as with every hub since August 2026.
 */
export const FITTINGS_BY_INDUSTRY_CATEGORY = {
  slug: 'hydraulic-fittings-by-industry',
  name: 'Fittings by industry',
  description:
    'What each industry actually runs, which positions fail on that equipment, and the thread families, materials and stock decisions that follow — mining, oilfield, ports, agriculture, quarrying and fixed plant.',
  heroCopy:
    'The machine decides the thread and the environment decides the material. Both are properties of the work being done, which is why a hose shop that knows an industry is worth more than one that knows a catalogue.',
  seoTitle: 'Hydraulic fittings by industry — mining, oilfield, ports, plant',
  seoDescription:
    'Hydraulic fittings and adapters by industry: what mining, oilfield, port, quarry, agricultural and fixed-plant equipment runs, and which positions fail on each.',
  focusKeyword: 'hydraulic fittings by industry',
  position: 14,
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'Why does the industry change which fittings you need?',
      answer:
        'Because it decides two things independently. The equipment decides the thread families — a fleet of imported machines carries whatever its factories used. The environment decides the material and the finish — slurry, salt air, washdown and dust each attack a joint differently. A workshop that stocks for the equipment and ignores the environment replaces the same corroded fittings every season; one that does the reverse has the right steel in the wrong thread.',
    },
    {
      type: 'paragraph',
      html: 'These articles are written from the equipment rather than from a country. A copper concentrator asks the same questions of a hose in Zambia and in Chile; what changes with the country is the lane, the resupply distance and the mix of machines that got imported. So each piece covers the work, and the geography sits in one paragraph with a link to the lane it travels.',
    },
    {
      type: 'comparison_table',
      caption: 'What each environment does to a joint',
      columns: ['Environment', 'What it attacks', 'What it changes in the specification'],
      rows: [
        { cells: ['Slurry and abrasive dust', 'Hose cover, then reinforcement at every contact point', 'Routing, guarding and cover choice before grade'] },
        { cells: ['Coastal and washdown', 'Plating on the fitting, from the thread crests inward', 'Finish, and stainless where it is severe'], highlight: true },
        { cells: ['Heat and continuous duty', 'Tube compound, cumulatively', 'Temperature rating, and shorter intervals'] },
        { cells: ['Vibration and impact', 'The joint itself, and the port behind it', 'Fewer joints, correct clamping, no adapter stacks'] },
      ],
    },
    {
      type: 'category_link',
      slug: 'hydraulic-adapters',
      label: 'Hydraulic adapters',
      blurb: 'BSP, metric, JIC, ORFS and NPT, stocked in Dubai.',
    },
    {
      type: 'cta_block',
      heading: 'Tell us what the site runs.',
      body: 'Equipment, environment and how far you are from resupply. We will say which positions are worth stocking, which material the environment argues for, and quote it as one consignment.',
      quoteLabel: 'Ask for a quotation',
    },
  ] satisfies BlogBlocksInput,
}
