import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The honest article in the wave.
 *
 * South Africa has a genuine domestic hydraulics supply chain, which most of
 * the markets in this series do not. Pretending otherwise would be obvious to
 * any reader there. So the article says plainly that local supply is usually
 * the right answer, and describes the specific cases where importing is not —
 * volume, long-lead items and mixed consignments — which are the cases we can
 * actually serve well.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'buying-fittings-in-south-africa',
  title: 'Buying fittings in South Africa: when importing is worth it, and when it is not',
  excerpt:
    'There is a real domestic supply chain here, which changes the question. Local is usually right — these are the specific cases where it is not.',
  categorySlug: 'hydraulic-fittings-by-industry',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Buying hydraulic fittings in South Africa — local or import',
  seoDescription:
    'When to buy hydraulic fittings locally in South Africa and when importing makes sense: volume, long-lead items, mixed consignments and specification-driven orders.',
  focusKeyword: 'buying fittings in south africa',
  publishedAt: '2026-09-01T15:36:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'Should a buyer import, or is buying fittings in South Africa locally the better answer?',
      answer:
        'Locally, in most cases. South Africa has a developed hydraulics supply chain with real stock, and for a single fitting or a routine replenishment nothing an importer can do beats a branch down the road. Importing earns its place in four specific situations: volume large enough for the freight to disappear into the unit cost, items nobody locally stocks, a consignment that combines hose assemblies with fittings and other lines, and orders driven by a specification where the documentation matters as much as the part.',
    },
    {
      type: 'lead',
      html: 'Every other article in this series is written for a buyer whose nearest hydraulics counter is a long way off. This one is not, and it would be dishonest to write it as though it were. The useful question in South Africa is not where to buy — it is which orders belong in which channel.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'What local supply does well.',
      anchor: 'local',
    },
    {
      type: 'paragraph',
      html: 'Speed, on ordinary parts, with no paperwork. A branch with the common families on the shelf answers a breakdown in an afternoon, and no import can compete with that on a single adapter. It also carries the thing that is genuinely hard to import: <strong>the ability to have an assembly made while you wait</strong>.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Do not import a breakdown part.',
      body: 'Where a machine is standing and the part exists locally, buy it locally, even at a higher unit price. The freight and clearance on a single urgent item will exceed whatever the difference was, and the machine will be running two days sooner.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'The four cases where importing wins.',
      anchor: 'four-cases',
    },
    {
      type: 'comparison_table',
      caption: 'When the fixed costs of an import stop mattering',
      columns: ['Case', 'Why importing works'],
      rows: [
        { cells: ['Volume replenishment', 'Freight and clearance disappear into the unit cost'], highlight: true },
        { cells: ['Items nobody locally stocks', 'A wait is a wait either way — the question is who can get it'] },
        { cells: ['Mixed consignments', 'Hose, assemblies, adapters and consumables under one set of documents'] },
        { cells: ['Specification-driven orders', 'Where material certificates and evidence travel with the goods'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The third row is the one most often missed. An operation that buys hose assemblies, fittings, couplers and consumables separately, locally, is paying full retail on each and coordinating four suppliers. <strong>The same list as one consignment is a different price and one delivery</strong> — and that is a planning decision rather than an emergency one.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'The mixed-fleet problem is the same here.',
      anchor: 'mixed-fleet',
    },
    {
      type: 'paragraph',
      html: 'Domestic supply does not change what is on the machines. A yard holding equipment from several origins still needs its thread population recorded, still benefits from bridging adapters as stock, and still loses days to identification done from memory. Everything in the earlier articles in this series applies — what changes is only how fast the missing part can be obtained once it has been named.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-adapters',
      label: 'Hydraulic adapters',
      blurb: 'BSP, metric, JIC, ORFS and NPT — quoted per line, from Dubai.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Is it cheaper to import fittings into South Africa?',
          answer:
            'On a single part, almost never. On a planned consolidated order of reasonable size, frequently. The variable that decides it is how much of the consignment’s fixed cost each line has to carry.',
        },
        {
          question: 'What about items with a long local lead time?',
          answer:
            'That is one of the cases where importing is straightforwardly competitive — if the wait is comparable, the question becomes price and documentation rather than speed.',
        },
        {
          question: 'Can you quote against a local price to compare?',
          answer:
            'Yes, and we will tell you when we do not think the comparison favours us. Sending business to a local branch when that is the right answer is a cheaper way to keep a customer than winning an order that should not have travelled.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Comparing a planned order against local supply?',
      body: 'Send the list. We will quote it as one consignment and say plainly which lines you should buy locally instead — the comparison is more useful than the quotation.',
      quoteLabel: 'Ask for a quotation',
    },
  ],
}

export default ARTICLE
