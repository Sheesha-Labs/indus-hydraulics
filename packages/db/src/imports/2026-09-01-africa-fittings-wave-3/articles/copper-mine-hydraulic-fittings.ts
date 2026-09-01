import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Copper — the Zambian and Congolese belt as an industrial geography, not as a
 * customer list. No production figures, no named operations.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'copper-mine-hydraulic-fittings',
  title: 'Copper mine hydraulic fittings: what the haul fleet and the plant each need',
  excerpt:
    'Two different hydraulic worlds share a fence line. The haul fleet fails by abrasion and vibration; the concentrator fails by slurry and washdown, and they want different answers.',
  categorySlug: 'hydraulic-fittings-by-industry',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Copper mine hydraulic fittings — haul fleet and plant',
  seoDescription:
    'Hydraulic fittings for copper mining: what fails on the haul fleet versus in the concentrator, which materials the environment argues for, and how to stock a remote site.',
  focusKeyword: 'copper mine hydraulic fittings',
  publishedAt: '2026-09-01T15:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A copper operation is two hydraulic populations: mobile fleet and fixed plant. They fail differently and should be stocked separately.',
        'On the fleet, abrasion and vibration do the damage — the fix is routing, clamping and fewer joints rather than a higher grade.',
        'In the plant, slurry and washdown attack the outside of the joint, so finish and material matter more than they do underground of the fence.',
        'Mixed-origin fleets are the norm, so a mine workshop needs bridging adapters as a stocked item rather than an improvisation.',
        'Resupply distance is the variable that decides depth. The further out, the more the cheap consumables matter.',
      ],
    },
    {
      type: 'lead',
      html: 'Copper mining across the central African belt runs two hydraulic systems that share nothing but a gate: a mobile fleet of excavators, haul trucks, loaders and drills, and a fixed plant of crushers, mills, thickeners, filter presses and pumps. Treating them as one stores problem is the commonest reason a mine workshop is simultaneously overstocked and out of the part it needs.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'The fleet fails mechanically.',
      anchor: 'the-fleet',
    },
    {
      type: 'paragraph',
      html: 'On haul roads and in the pit, hoses die by <strong>abrasion at contact points and by fatigue at the joint</strong>. Dust turns every rub into a grinding operation, and vibration works on the fitting and the port behind it. Almost none of that is solved by buying a higher-pressure hose: it is solved by routing the line so it does not touch, clamping it so it cannot move, and removing adapter stacks that lever on the port.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Count the joints on a failing line before you upgrade the hose.',
      body: 'A line with three adapters at one end has three leak paths and a lever arm. Rebuilding it as a hose with the correct end at each end usually outlasts the same line rebuilt in a heavier grade with the stack intact — and costs less.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'The plant fails chemically.',
      anchor: 'the-plant',
    },
    {
      type: 'paragraph',
      html: 'Inside the concentrator the enemy is different. Slurry, process water, reagents and daily washdown work on the <strong>outside</strong> of every joint while the inside is perfectly sealed. Plating decides how long the fitting survives before the hex rounds and the thread seizes, and a joint that cannot be undone is a maintenance problem long before it is a leak.',
    },
    {
      type: 'comparison_table',
      caption: 'Two populations, two stock lists',
      columns: ['Property', 'Mobile fleet', 'Fixed plant'],
      rows: [
        { cells: ['Dominant failure', 'Abrasion, vibration, impact', 'External corrosion and seizure'], highlight: true },
        { cells: ['What to change first', 'Routing, clamping, joint count', 'Finish and material'] },
        { cells: ['Thread families', 'Whatever the imported machines carry — usually several', 'Often more consistent, set at build'] },
        { cells: ['Stock depth logic', 'The two or three bores that fail', 'The positions that stop a circuit'] },
      ],
    },
    {
      type: 'category_link',
      slug: 'stainless-steel-hydraulic-fittings',
      label: 'Stainless steel fittings',
      blurb: 'Where plating is not enough — washdown and reagent exposure.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Mixed fleets are the normal case.',
      anchor: 'mixed-fleets',
    },
    {
      type: 'paragraph',
      html: 'A working mine buys machines when it can and from where it can, so the yard holds several origins at once. That makes <strong>bridging adapters a stocked item rather than an emergency measure</strong>, and it makes a written record of what each machine carries worth more than it is anywhere else — because on a mine site the person who knew is on the other rotation.',
    },
    {
      type: 'paragraph',
      html: 'The corollary is that a shift-change handover should include hydraulic identifications, not just fault descriptions. A photograph of a fitting attached to a work order survives a rotation; a fitter’s memory does not.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Distance decides depth.',
      anchor: 'distance',
    },
    {
      type: 'paragraph',
      html: 'The Copperbelt sits a long way inland from any port, and that single fact should shape the store more than any preference about brands. Consumables that gate a repair — bonded seals, O-rings, dowty washers, plugs and caps — are the cheapest insurance available and the most common reason a repair stops half-finished. Buy them by the box, on the planned consignment, not against a failure.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Should a mine hold finished assemblies or bulk hose?',
          answer:
            'Where the site has a crimper and trained people, bulk hose plus ends covers many part numbers with one coil. Where it does not, finished assemblies for the critical circuits, tagged so the right one is findable at night, are the better answer.',
        },
        {
          question: 'Is stainless worth it across a concentrator?',
          answer:
            'Position by position rather than wholesale. Exposed and washed-down joints earn it; joints inside housings rarely do, and on high-pressure lines the rating has to be checked because stainless is often rated below the carbon-steel equivalent.',
        },
        {
          question: 'How do we stop the same hose failing every few weeks?',
          answer:
            'Treat it as a routing problem first. Photograph the failed line in place, look for the contact point and the joint count, and change those before changing the grade. If it still fails, the specification is worth revisiting.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Stocking a mine workshop?',
      body: 'Send the fleet list and a note of what the plant runs. We will split the list into fleet and plant, say which positions justify depth, and quote it as one consignment to your lane.',
      quoteLabel: 'Build a stock list',
    },
  ],
}

export default ARTICLE
