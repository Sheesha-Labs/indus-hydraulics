import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The four non-Saudi Gulf destinations, kept apart on purpose.
 *
 * "GCC requirements" is written everywhere as though there were one set. There
 * is not: Kuwait runs KUCAS through the Public Authority for Industry with
 * technical evaluation and inspection reports; Qatar operates pre-shipment
 * verification against its own regulated list; Oman and Bahrain work from
 * ministry lists with a conventional document set behind them and their own
 * thresholds for when origin documents are required.
 *
 * Every scheme-level statement here was checked in September 2026 and the
 * article carries an as-of stamp, because these regimes are revised — SABER,
 * KUCAS and the Qatari scheme have all changed inside a decade. No threshold
 * value or fee is published, because those move faster than the article will.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'gcc-import-documents-for-hose',
  title: 'GCC import documents for hose: Qatar, Oman, Kuwait and Bahrain',
  excerpt:
    'Four destinations, four different regimes, and none of them is SABER. What each one asks of a hose consignment, and which questions belong to your customs broker rather than your supplier.',
  categorySlug: 'gcc-compliance',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'GCC import documents for hose — Qatar, Oman, Kuwait, Bahrain',
  seoDescription:
    'The import documentation regimes for hose consignments into Qatar, Oman, Kuwait and Bahrain, how each differs from Saudi SABER, and what to prepare before dispatch.',
  focusKeyword: 'gcc import documents',
  publishedAt: '2026-09-01T10:40:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'There is no single GCC conformity regime. Kuwait, Qatar, Oman and Bahrain each run their own, and none is SABER.',
        'Kuwait’s scheme is administered by the Public Authority for Industry and works through technical evaluation and inspection reports issued by recognised bodies.',
        'Qatar operates pre-shipment verification against a national regulated list, through approved third-party bodies.',
        'Oman and Bahrain rely on ministry regulated lists plus the conventional commercial document set, with their own thresholds for when origin documents are required.',
        'The commercial set — invoice, packing list, certificate of origin, transport document — is required everywhere, whatever the conformity answer turns out to be.',
      ],
    },
    {
      type: 'lead',
      html: 'GCC import documents are national rather than regional, and the difference is the whole problem. Saudi Arabia dominates the conversation about Gulf import paperwork because SABER is the most visible scheme in the region, and the effect is that the other four destinations get treated as variations on it. They are not variations on anything. A consignment planned as though Doha were Riyadh will carry the wrong documents in both directions — some that are not needed, and one or two that are.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Four regimes, side by side.',
      anchor: 'four-regimes',
    },
    {
      type: 'comparison_table',
      caption: 'What governs a regulated consignment in each destination',
      columns: ['Destination', 'Scheme', 'Practical shape'],
      rows: [
        {
          cells: [
            'Kuwait',
            'KUCAS, administered by the Public Authority for Industry',
            'Regulated goods travel with technical evaluation and inspection reports from a recognised certification body',
          ],
          highlight: true,
        },
        {
          cells: [
            'Qatar',
            'Pre-shipment verification of conformity against the national list',
            'Certificate of conformity from an approved third-party body, obtained before shipment',
          ],
        },
        {
          cells: [
            'Oman',
            'Ministry regulated lists, with the standards directorate as the authority',
            'Conventional document set; conformity applies to listed products',
          ],
        },
        {
          cells: [
            'Bahrain',
            'Ministry regulated-product requirements',
            'Conventional document set; origin documents required above stated thresholds',
          ],
        },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Kuwait exempts some project supply. Ask before assuming it applies to you.',
      body: 'Goods forming part of large industrial or government projects have historically been treated differently under the Kuwaiti scheme. That is worth establishing at tender rather than at the border, because it materially changes what a supplier has to prepare — and it is the kind of provision that gets revised.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'The part that is the same everywhere.',
      anchor: 'the-common-set',
    },
    {
      type: 'paragraph',
      html: 'Whatever the conformity answer, a commercial consignment carries the same core set: <strong>commercial invoice, packing list, certificate of origin and the transport document</strong>, with the origin certificate attested rather than self-declared. Descriptions have to match across all of them, and across any conformity registration, because a mismatch between two documents is resolved by a person at a counter rather than by a rule.',
    },
    {
      type: 'paragraph',
      html: 'On top of that sits whatever the purchase order asks for — proof-test certificates, material certificates, a compound statement. Those are contractual rather than regulatory, they are the ones most often forgotten, and no customs regime will tell you they are missing. The receiving QA department will.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Which questions belong to whom.',
      anchor: 'who-answers',
    },
    {
      type: 'comparison_table',
      caption: 'The division of labour that avoids a stalled consignment',
      columns: ['Question', 'Who answers it'],
      rows: [
        { cells: ['What is the tariff classification for these items?', 'The clearing agent at the destination, on the proforma'] },
        { cells: ['Is this classification on the regulated list?', 'The clearing agent or the conformity body'] },
        { cells: ['What documents will you prepare and attest?', 'The supplier'] },
        { cells: ['Who is the importer of record?', 'The buyer — and it decides whose account everything runs on'] },
        { cells: ['What does the end user’s purchase order require?', 'The buyer, from their own contract'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Nobody at the border cares which of you was supposed to know.',
      body: 'Most stalled consignments are not the result of anyone being wrong about a rule. They are the result of two competent parties each assuming the other was covering a question. Settling this table at quotation costs one email.',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-09-01',
      note: 'Scheme names and administering authorities checked September 2026. These regimes are revised periodically — confirm current requirements with your clearing agent before shipping.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Does a consignment cleared into the UAE move freely to another GCC country?',
          answer:
            'Goods in free circulation within the customs union move between member states without duty being charged again, but national conformity requirements still belong to the destination, and goods sitting in a free zone have not entered free circulation anywhere. Treat duty and conformity as two separate questions.',
        },
        {
          question: 'Which of these is the most document-heavy destination?',
          answer:
            'For regulated goods, Saudi Arabia and Kuwait involve the most steps, because both require a body to issue something before the goods travel. Oman and Bahrain are lighter for unlisted products, and heavier than people expect once a product is listed.',
        },
        {
          question: 'Can you prepare documents for all five Gulf destinations?',
          answer:
            'The commercial and origin documents, yes, prepared in Dubai before dispatch. Conformity work depends on the destination and the products; we will tell you what applies and what is prepared on your account rather than ours.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Shipping to more than one Gulf country?',
      body: 'Tell us the destinations with the enquiry. Consolidating into one consignment per destination, with the right document set prepared before dispatch, is usually cheaper and always faster than sorting it out per shipment.',
      quoteLabel: 'Ask for a quotation',
    },
  ],
}

export default ARTICLE
