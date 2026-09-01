import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * West African oilfield supply, written around the two things that actually
 * govern it: the documentation regime and the split between rig-side flow
 * equipment and ordinary plant hydraulics.
 *
 * Claims no approvals, names no operators as customers, and publishes no
 * pressure ratings — the API standards article and the oilfield document pack
 * already carry that ground and are linked instead.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'oilfield-fittings-in-west-africa',
  title: 'Oilfield fittings in West Africa: two supply chains, not one',
  excerpt:
    'Rig-side flow equipment and ordinary plant hydraulics look like one order and behave like two. The paperwork, the lead time and the acceptance criteria all differ.',
  categorySlug: 'hydraulic-fittings-by-industry',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Oilfield fittings in West Africa — supply and documentation',
  seoDescription:
    'How oilfield fitting supply into West Africa splits between rig-side flow equipment and general plant hydraulics, and what documentation each one attracts.',
  focusKeyword: 'oilfield fittings in west africa',
  publishedAt: '2026-09-01T15:24:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Rig-side flow equipment carries a documentation regime; general plant hydraulics on the same site usually does not.',
        'Mixing both into one order means the whole consignment waits for the slowest document.',
        'Import documentation in the region is per country and often per consignment — it is planned before the goods move, not after.',
        'Acceptance on a contractor site is set by the operator’s specification, which is a contractual document rather than a standard.',
        'Split the order by regime, not by supplier convenience.',
      ],
    },
    {
      type: 'lead',
      html: 'Oilfield fittings and ordinary plant hydraulics arrive on the same site and behave like two different supply chains. A West African oilfield contractor buys two very different things that arrive in the same box: flow-iron and pressure-control ancillaries that carry standards and paperwork, and the ordinary hydraulic hose and adapters that keep cranes, workshops and utility plant running. They have different lead times, different acceptance criteria and different documentation, and the single most common cause of a delayed consignment is that they were ordered as one line.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Two regimes on one site.',
      anchor: 'two-regimes',
    },
    {
      type: 'comparison_table',
      caption: 'What each half of the order attracts',
      columns: ['Property', 'Rig-side flow equipment', 'General plant hydraulics'],
      rows: [
        { cells: ['Governing standard', 'API series, per service', 'Construction standards — EN, SAE'] },
        { cells: ['Documentation', 'Material certificates, test records, conformity statements', 'Usually the commercial set'], highlight: true },
        { cells: ['Lead time driver', 'The document pack as often as the part', 'Stock'] },
        { cells: ['Acceptance', 'Operator specification, contractually enforced', 'Fit and function'] },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Split the order by regime.',
      body: 'A consignment moves at the speed of its slowest document. Putting a documented pressure-control item and a box of workshop adapters on one invoice means the adapters wait for the certificate. Two orders, two consignments, and the second one leaves first.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'The paperwork moves before the goods.',
      anchor: 'paperwork',
    },
    {
      type: 'paragraph',
      html: 'Import regimes across the region are national rather than regional and several of them require registration or verification <strong>at origin, before shipment</strong>. None of that can be done retrospectively, which is why the part list matters at quotation rather than at order: the certification runs in parallel with picking, or it runs after it and adds its whole duration to the delivery.',
    },
    {
      type: 'paragraph',
      html: 'Where a destination requires it, the sequence is fixed and the buyer holds one end of it — the importing entity, the bank instrument where one is required, and the customs classification their agent will declare. A supplier can prepare and attest documents; it cannot open the buyer’s side of the process.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Acceptance is contractual, not technical.',
      anchor: 'acceptance',
    },
    {
      type: 'paragraph',
      html: 'On a contractor site, whether an item may be fitted is decided by the operator’s specification. That document names standards, sometimes names manufacturers, and frequently asks for evidence that no standard requires. <strong>Read it before pricing rather than before delivering</strong> — the clause that adds cost is nearly always deliverable, and nearly always expensive to discover late.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Do not treat a brand clause as a specification clause.',
      body: 'A clause naming a brand and a clause naming a standard are different obligations. Where a specification is named, an equivalent with evidence is usually acceptable; where a brand is named, substituting is the client’s decision to make in writing. Ask which one you are holding before you quote against it.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'What a workshop on such a site should hold.',
      anchor: 'what-to-hold',
    },
    {
      type: 'paragraph',
      html: 'The undocumented half — hose, adapters, seals for cranes, compressors, workshop presses and utility plant — is exactly the population that benefits from ordinary stocking discipline: two or three bores, the families the equipment actually carries, consumables by the box. Keeping that half stocked is also what stops it being appended to a documented order and slowing it down.',
    },
    {
      type: 'category_link',
      slug: 'oil-gas-hoses',
      label: 'Oil & gas hose',
      blurb: 'Rotary, vibrator, choke and kill, and control-line hose.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Can you supply documented and undocumented items on one order?',
          answer:
            'We can, and we will usually advise against shipping them as one consignment. Splitting the dispatch means the undocumented half arrives while the certificates for the other half are still being issued.',
        },
        {
          question: 'Who arranges the import documentation?',
          answer:
            'It is per destination and it is a shared job: the buyer holds the importing entity and, where required, the bank instrument; we prepare and attest what is raised at origin. Tell us the destination at enquiry and we will say which side owns what.',
        },
        {
          question: 'Do you hold operator vendor approvals?',
          answer:
            'No, and we do not claim any. We supply against the operator’s specification with the documentation the contract requires, which is what most contractor purchasing actually needs.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Splitting a documented order from a stock one?',
      body: 'Send both lists and the specification clause. We will separate them, quote each against its own regime, and dispatch the stock half without waiting for the certificates on the other.',
      quoteLabel: 'Ask for a quotation',
    },
  ],
}

export default ARTICLE
