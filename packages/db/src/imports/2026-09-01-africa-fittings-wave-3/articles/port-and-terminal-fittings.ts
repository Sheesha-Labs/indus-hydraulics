import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Ports: salt air plus continuous operation, which is the combination that
 * makes corrosion a scheduling problem rather than a cosmetic one.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'port-and-terminal-fittings',
  title: 'Port and terminal fittings: salt air on equipment that never stops',
  excerpt:
    'Container handling runs around the clock in the most corrosive air on the continent. That combination decides the material, and it decides when you are allowed to change anything.',
  categorySlug: 'hydraulic-fittings-by-industry',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Port and terminal hydraulic fittings — corrosion and uptime',
  seoDescription:
    'Hydraulic fittings for port equipment: why salt air decides the finish, what fails on reach stackers and cranes, and how to plan changes around continuous operation.',
  focusKeyword: 'port and terminal fittings',
  publishedAt: '2026-09-01T15:32:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What makes port equipment different from other heavy plant?',
      answer:
        'Two things at once. The air is salt-laden, so external corrosion runs continuously on every exposed joint. And the equipment works around the clock, so there is no natural window in which to change anything — maintenance competes with vessel operations. The result is that corrosion has to be designed out at specification rather than managed by inspection, because the inspection finding cannot always be acted on when it is made.',
    },
    {
      type: 'lead',
      html: 'Reach stackers, empty handlers, terminal tractors, ship-to-shore and mobile harbour cranes are all ordinary hydraulic machines in an extraordinary atmosphere. Nothing about their circuits is unusual. What is unusual is that a plated fitting exposed on the outside of one of them is being attacked every hour it sits there, working or not.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Corrosion is the scheduling problem.',
      anchor: 'corrosion',
    },
    {
      type: 'paragraph',
      html: 'A corroded joint does not stop a machine. It makes every future intervention on that machine longer — the hex rounds, the thread seizes, and a five-minute hose change becomes a cutting job on a quay where the machine is wanted back. In an operation with no maintenance window to spare, <strong>that lengthening is the real cost of the wrong finish</strong>, and it arrives quietly.',
    },
    {
      type: 'comparison_table',
      caption: 'Where to spend on material at a terminal',
      columns: ['Position', 'Exposure', 'What it argues for'],
      rows: [
        { cells: ['Exposed joints on booms and masts', 'Full salt air, wind-driven spray', 'Better plating as standard; stainless where severe'], highlight: true },
        { cells: ['Inside covers and housings', 'Sheltered, still humid', 'Standard plating'] },
        { cells: ['Quayside and splash-affected equipment', 'Direct salt water contact', 'Stainless, with the rating checked'] },
        { cells: ['Workshop and yard plant', 'Ordinary', 'Standard'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Continuous operation changes the maintenance shape.',
      anchor: 'continuous',
    },
    {
      type: 'paragraph',
      html: 'Where equipment runs three shifts, the practical response is to <strong>move work into the changes that are already happening</strong>: when a machine comes in for anything, the exposed joints on that circuit get looked at and the ones that are going get changed then, rather than waiting for their own failure. That requires the parts to be on the shelf at the moment the opportunity appears, which is a stocking decision rather than a planning one.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Stock for opportunity, not only for failure.',
      body: 'A terminal store that can supply the fitting during an unrelated intervention converts a future breakdown into a five-minute addition. That is a different stocking logic from "hold what fails", and it is the one that suits an operation with no windows.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Mixed fleets, again — and worse.',
      anchor: 'mixed-fleets',
    },
    {
      type: 'paragraph',
      html: 'Terminals accumulate equipment from many makers across long service lives, so the thread population is wide and the machines that are hardest to source for are usually the oldest and the most needed. The response is the same as everywhere else in this series — record what each machine carries, stock depth in what repeats, keep bridging adapters for the pairs you actually run — but the payoff is larger because the cost of a stopped machine is measured against a vessel’s schedule.',
    },
    {
      type: 'category_link',
      slug: 'stainless-steel-hydraulic-fittings',
      label: 'Stainless steel fittings',
      blurb: 'SS316L for quayside and splash-zone positions.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Is stainless justified across a whole terminal fleet?',
          answer:
            'No — by position. Exposed and splash-affected joints earn it; sheltered ones do not, and on high-pressure lines the rating must be checked because stainless is frequently rated below the carbon-steel equivalent.',
        },
        {
          question: 'How often should exposed joints be inspected in salt air?',
          answer:
            'More often than inland, and the finding matters more than the interval: what you are looking for is plating loss at thread crests and hex corners, because that is the point at which a future intervention starts getting expensive.',
        },
        {
          question: 'Can you supply to a terminal with no downtime for a survey?',
          answer:
            'Yes — work from photographs taken during ordinary interventions rather than from a scheduled survey. Send them as they accumulate and we will build the list against them.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Specifying for salt air?',
      body: 'Send the positions and their exposure. We will say where better plating is enough, where stainless earns its cost, and where the pressure rating rules it out.',
      quoteLabel: 'Ask an engineer',
    },
  ],
}

export default ARTICLE
