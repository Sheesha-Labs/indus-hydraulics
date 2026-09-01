import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Gold processing. The distinguishing content against the copper article is the
 * chemistry: a gold plant runs aggressive process chemistry in defined areas,
 * which is a materials question rather than an abrasion one.
 *
 * Names no reagent handling practice beyond what is generic, and makes no
 * safety claim about chemical exposure — that belongs to the plant's own
 * procedures, not to a hose supplier's blog.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'gold-plant-hydraulic-fittings',
  title: 'Gold plant hydraulic fittings: where the chemistry decides the material',
  excerpt:
    'A gold circuit is abrasive in some places and chemically aggressive in others, and the two want different fittings. Getting that split right is most of the maintenance saving.',
  categorySlug: 'hydraulic-fittings-by-industry',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Gold plant hydraulic fittings — materials by circuit',
  seoDescription:
    'Hydraulic fittings in gold processing: which areas are abrasion problems and which are chemical ones, and how that changes the material and finish you specify.',
  focusKeyword: 'gold plant hydraulic fittings',
  publishedAt: '2026-09-01T15:22:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What is different about gold plant hydraulic fittings?',
      answer:
        'The plant is not one environment. Crushing and milling are abrasion and vibration problems that look like any other hard-rock circuit. The leach and elution areas are chemical ones, where the fitting is attacked from outside by process solution and washdown rather than worn by rock. Specifying one material across the whole plant means over-paying in half of it and under-specifying in the other half.',
    },
    {
      type: 'lead',
      html: 'Gold operations across West and East Africa run the same broad flowsheet, and the useful thing about that for a maintenance planner is that the hydraulic problems arrive in the same places. What changes between sites is scale and remoteness, not which joints give trouble.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Split the plant before you write a stock list.',
      anchor: 'split-the-plant',
    },
    {
      type: 'comparison_table',
      caption: 'Three zones, three sets of decisions',
      columns: ['Zone', 'Dominant problem', 'What it argues for'],
      rows: [
        { cells: ['Crushing and milling', 'Abrasion, dust, vibration, impact', 'Routing and guarding; cover choice; fewer joints'] },
        { cells: ['Leach, adsorption, elution', 'Chemical attack from outside, plus washdown', 'Material and finish; stainless where severe'], highlight: true },
        { cells: ['Tailings, water and reclaim', 'Slurry and continuous wet running', 'Corrosion-resistant finishes, and inspection access'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'This split is worth writing down as a map of the plant with a material policy per zone, because it converts an argument about cost into a per-position decision. <strong>Nobody has to justify stainless everywhere</strong> — they justify it in the two areas where a plated fitting will not last a season.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'What actually fails, and what it looks like.',
      anchor: 'what-fails',
    },
    {
      type: 'paragraph',
      html: 'In the wet, chemically active parts of the circuit, the failure sequence is consistent: the plating goes at the thread crests and the hex corners, corrosion works underneath the coating, the joint becomes impossible to undo, and the eventual repair costs a port rather than a fitting. <strong>The visible symptom arrives long after the useful moment to act</strong>, which is why area-based material policy beats reactive replacement here.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A seized joint in a wet area is a scheduled-outage problem, not a breakdown.',
      body: 'It will not stop production today. It will lengthen every future intervention on that circuit and eventually force a repair that could have been a five-minute change. Catch it at inspection and plan the change into the next shutdown rather than discovering it during one.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Mobile equipment on a gold site.',
      anchor: 'mobile',
    },
    {
      type: 'paragraph',
      html: 'Everything in the pit or on the run-of-mine pad behaves like any other hard-rock fleet: mixed origins, abrasion, and the same two or three bores failing repeatedly. The plant’s material policy does not apply out there, and applying it anyway is how a store ends up full of stainless adapters that nobody fits to a haul truck.',
    },
    {
      type: 'category_link',
      slug: 'ss316l-bsp-fittings',
      label: 'SS316L BSP fittings',
      blurb: 'For the wet and chemically active parts of a circuit.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Ordering for a site with a long inland leg.',
      anchor: 'ordering',
    },
    {
      type: 'paragraph',
      html: 'Most gold operations sit some distance from the port that serves them, so the freight and clearance costs are paid per consignment and the inland leg is often the largest line on the invoice. That argues for the same discipline as any remote site: one planned consignment carrying the season, air freight kept for parts that are genuinely stopping production, and consumables bought by the box.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Should the whole plant be stainless?',
          answer:
            'Rarely justified and often a downgrade on high-pressure lines, because stainless fittings are frequently rated below their carbon-steel equivalents. Apply it by zone, check the rating per position, and keep plated parts where the environment is dry.',
        },
        {
          question: 'What causes hoses to fail early around the mills?',
          answer:
            'Usually contact and vibration rather than pressure. Look for the rub point, the clamp that is missing, and the adapter stack at the port before considering a heavier grade.',
        },
        {
          question: 'Can you supply against a zone-based material policy?',
          answer:
            'Yes — send the position list with the zone marked against each. We will quote the material per line rather than applying one specification across the whole order.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Writing a material policy by area?',
      body: 'Send the plant zones and the positions in each. We will say where plating is enough, where stainless earns its cost, and where the pressure rating means the answer is no.',
      quoteLabel: 'Ask an engineer',
    },
  ],
}

export default ARTICLE
