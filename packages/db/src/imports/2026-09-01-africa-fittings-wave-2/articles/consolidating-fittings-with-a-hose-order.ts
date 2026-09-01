import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The ordering-discipline article. Its commercial argument is honest and
 * slightly against our short-term interest: fewer, larger orders rather than a
 * stream of small ones.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'consolidating-fittings-with-a-hose-order',
  title: 'Consolidating fittings with a hose order',
  excerpt:
    'One consignment, one set of documents, one clearance. The saving is not in the parts — it is in everything that happens to a parcel between here and your gate.',
  categorySlug: 'buying-hydraulic-fittings',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Consolidating a fittings order with hose',
  seoDescription:
    'Why sending fittings and hose as one consignment costs less than two, what has to be decided earlier to do it, and when splitting is still right.',
  focusKeyword: 'consolidating fittings with a hose order',
  publishedAt: '2026-09-01T15:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The per-consignment costs — documents, clearance, handling, inland leg — are paid once whether the box is half full or full.',
        'Consolidation means deciding the whole list earlier, which is the real cost of doing it.',
        'Assemblies and their adapters arriving together is also a technical benefit: the joint can be built as designed.',
        'Split only for a genuine breakdown part, and send the rest as planned.',
        'One consignment is also one set of conformity paperwork where the destination requires it.',
      ],
    },
    {
      type: 'lead',
      html: 'Most sites order the way failures happen: one thing at a time, urgently. It is entirely understandable and it is the most expensive pattern available, because almost everything that costs money about a shipment is charged per shipment rather than per part.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'What is charged per consignment.',
      anchor: 'per-consignment',
    },
    {
      type: 'comparison_table',
      caption: 'Paid once per shipment, regardless of size',
      columns: ['Item', 'Notes'],
      rows: [
        { cells: ['Export documentation and attestation', 'Certificate of origin, invoice set'] },
        { cells: ['Conformity registration where required', 'Per consignment in several destinations'], highlight: true },
        { cells: ['Customs clearance and handling', 'The fee does not shrink with the parcel'] },
        { cells: ['Inland leg to site', 'Often the largest single line for a remote destination'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'On a pallet of hose those costs disappear into the total. On a bag of adapters they <strong>are</strong> the total. Which is why the same box of fittings can be cheap or expensive depending only on what else travelled with it.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'The technical reason, which is the better one.',
      anchor: 'technical',
    },
    {
      type: 'paragraph',
      html: 'An assembly and the adapters it needs arriving together means the joint gets built the way it was specified. When they arrive separately, the hose goes on with whatever adapter was in the drawer, the correct part arrives a fortnight later, and nobody dismantles a working joint to fit it. <strong>The temporary bridge becomes the permanent installation</strong> — quietly, and with an extra leak path in it.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Order the ends with the hose that needs them.',
      body: 'When we quote a set of assemblies, tell us which adapters go with which — or ask us to say which ones the specification implies. Shipping them as one line item is the practical way to make sure the joint you designed is the joint that exists a month later.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'What consolidation actually costs you.',
      anchor: 'the-cost',
    },
    {
      type: 'paragraph',
      html: 'Time, at the front. To ship once you have to know the whole list, which means walking the yard, checking the store, and asking the fitters what they are about to need — before placing the order rather than during it. That hour is the entire price of the saving, and it is the reason most sites do not capture it.',
    },
    {
      type: 'decision_tree',
      heading: 'Split, or wait for the consignment?',
      branches: [
        {
          condition: 'A machine is stopped and this part is what is stopping it',
          outcome: 'Split it out and send it now',
          detail: 'This is the case air freight exists for. Send only what is actually blocking work.',
        },
        {
          condition: 'It is needed within the month but nothing is standing',
          outcome: 'Hold it for the planned consignment',
          detail: 'Almost everything falls here once someone asks the question honestly.',
        },
        {
          condition: 'You are not sure what else is needed',
          outcome: 'Ask before booking',
          detail:
            'Half an hour finding out is worth more than the parcel. A second urgent shipment two days later costs the whole saving.',
        },
      ],
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Does one consignment mean one conformity registration?',
          answer:
            'Where a destination registers conformity per shipment, yes — that work is done once for the consignment rather than repeated for each parcel, which is a real saving in fee and in elapsed time.',
        },
        {
          question: 'Can you hold parts and ship them together?',
          answer:
            'Yes. Tell us what the consignment is waiting for and we will hold the finished items rather than shipping as each line completes.',
        },
        {
          question: 'What if the hose takes longer to make than the fittings?',
          answer:
            'Then the question is whether anything is standing still. If not, hold; if a machine is down, we split the breakdown part and keep the rest for the consignment.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Ordering hose and fittings separately?',
      body: 'Send both lists together next time, even if half of it is not urgent. We will quote them as one consignment, hold the finished items, and split out only what is genuinely stopping a machine.',
      quoteLabel: 'Ask for a quotation',
    },
  ],
}

export default ARTICLE
