import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Sugar and agro-processing. The distinguishing feature against the other
 * fixed-plant articles is the crushing season: a plant that runs flat out for
 * months and then stops entirely, which makes the maintenance calendar, not the
 * failure rate, the thing that governs buying.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'sugar-mill-and-agro-processing-fittings',
  title: 'Sugar mill and agro-processing fittings: buying around a season',
  excerpt:
    'A mill runs flat out for months and then stops dead. Everything about stocking, inspection and replacement follows that calendar rather than the failure rate.',
  categorySlug: 'hydraulic-fittings-by-industry',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Sugar mill hydraulic fittings — buying around the season',
  seoDescription:
    'Hydraulic fittings in sugar and agro-processing plant: steam and washdown exposure, what to change in the off-season, and how to buy against a crushing calendar.',
  focusKeyword: 'sugar mill and agro-processing fittings',
  publishedAt: '2026-09-01T15:34:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The calendar governs everything: an off-season change is cheap and an in-season failure is not.',
        'Heat, steam and washdown are the exposures — this is a materials and temperature question more than an abrasion one.',
        'Age-based replacement makes more sense here than almost anywhere, because the shutdown is a known date.',
        'Order the season’s consumables as one consignment during the off-season, not during the campaign.',
        'Record what was changed and when. Next off-season is the moment that record pays.',
      ],
    },
    {
      type: 'lead',
      html: 'A sugar mill has two states and nothing in between. During the campaign it runs continuously and a stoppage is measured against cane that is already cut; out of season it stops entirely and every intervention that was deferred becomes possible. That shape makes hydraulic maintenance unusually plannable — and makes deferring a decision unusually expensive, because the next chance is months away.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'What the environment does.',
      anchor: 'environment',
    },
    {
      type: 'paragraph',
      html: 'Processing plant runs hot and wet. Steam, condensate, hot process water and daily washdown attack the outside of joints, and ambient heat around mills and boilers ages hose from the outside in. <strong>None of that is dramatic and all of it is cumulative</strong>, which is exactly the failure profile that suits age-based replacement in a shutdown rather than run-to-failure during a campaign.',
    },
    {
      type: 'comparison_table',
      caption: 'Exposure by area',
      columns: ['Area', 'Exposure', 'Consequence'],
      rows: [
        { cells: ['Mill and crusher hydraulics', 'Heat, vibration, cane dust', 'Cover ageing plus joint loosening'], highlight: true },
        { cells: ['Boiler and steam-adjacent lines', 'Radiant heat', 'Tube and cover ageing; temperature rating matters'] },
        { cells: ['Washdown areas', 'Water, cleaning agents', 'External corrosion at every joint'] },
        { cells: ['Field and transport equipment', 'Ordinary mobile-fleet exposure', 'Abrasion and impact'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A hose near a hot surface is being aged even when the machine is idle.',
      body: 'Radiant heat does not care whether the plant is running. Where a line runs close to hot pipework, either move it, shield it, or accept that its life is shorter than the catalogue suggests and put it on the shutdown replacement list.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'The off-season is the whole opportunity.',
      anchor: 'off-season',
    },
    {
      type: 'paragraph',
      html: 'Because the shutdown is a known date, a mill can do what most plants cannot: replace on age and condition rather than on failure. That requires two unglamorous things — a <strong>record of what was fitted when</strong>, which means tagged assemblies, and the parts on site before the shutdown starts, which means ordering during the campaign for use after it.',
    },
    {
      type: 'paragraph',
      html: 'The failure mode to avoid is discovering the list during the shutdown. A four-week window shrinks fast when a consignment is being air-freighted into the middle of it.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Buying against the calendar.',
      anchor: 'buying',
    },
    {
      type: 'paragraph',
      html: 'The pattern that works: survey during the campaign while everything is running and its condition is visible, order in one consolidated consignment timed to land before the shutdown, and keep a small emergency stock for the campaign itself. That is the opposite of how most plants buy, and it is the reason most plants pay air freight during their own shutdown.',
    },
    {
      type: 'category_link',
      slug: 'industrial-hose-suppliers-uae',
      label: 'Industrial hose',
      blurb: 'Steam, water, chemical and food-grade lines alongside the hydraulics.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Should assemblies be replaced on age in a mill?',
          answer:
            'Where the exposure is heat and washdown and the shutdown is a fixed date, age-based replacement of the exposed population is usually cheaper than the campaign stoppage it prevents. It only works if assemblies are tagged with a date.',
        },
        {
          question: 'What temperature rating should we be asking for?',
          answer:
            'It follows the actual position rather than the plant — a line beside hot pipework is a different question from one twenty metres away. Tell us where the line runs and what is near it and we will quote against that rather than against a general figure.',
        },
        {
          question: 'Can you deliver in time for a shutdown?',
          answer:
            'If the list exists before the shutdown starts, comfortably. Send the survey during the campaign and we will time one consolidated consignment against your date.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Planning a shutdown list?',
      body: 'Send the survey while the plant is still running. We will quote one consignment timed to land before the stop, and flag anything with a lead time that needs deciding early.',
      quoteLabel: 'Ask for a quotation',
    },
  ],
}

export default ARTICLE
