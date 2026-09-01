import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The article that corrects the most expensive assumption in Gulf procurement:
 * that buying from Dubai makes goods UAE-origin and therefore duty-free within
 * the GCC.
 *
 * It does not. Origin follows manufacture, not the address on the invoice, and
 * a re-export from a Dubai warehouse carries the origin of the factory that
 * made the item. Saying this plainly costs us nothing — the Dubai case is
 * strong on stock, lead time and consolidated documentation, and does not need
 * a duty argument that is not true.
 *
 * Duty rates and the mechanics of the customs union are stated at the level
 * they are stable at, and the article tells the reader to confirm the tariff
 * line with their own broker rather than publishing a rate per product.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'certificate-of-origin-gcc-duty',
  title: 'Certificate of origin and GCC duty on a hose consignment',
  excerpt:
    'Buying from a Dubai stockist does not make goods UAE-origin. What the certificate of origin actually states, why it is not a formality, and where duty is genuinely paid once.',
  categorySlug: 'gcc-compliance',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Certificate of origin and GCC duty on hose imports',
  seoDescription:
    'What a certificate of origin states on a hose consignment, why re-export from Dubai does not confer UAE origin, and how duty works inside the GCC customs union.',
  focusKeyword: 'certificate of origin',
  publishedAt: '2026-09-01T08:05:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Origin follows manufacture, not the invoice address. Goods re-exported from Dubai carry the origin of the factory that made them.',
        'GCC preferential treatment is for goods of GCC origin, which has a substantial-transformation test behind it — warehousing and re-invoicing do not meet it.',
        'The certificate of origin is chamber-attested in Dubai before dispatch, and it is needed whether or not any conformity registration applies.',
        'Inside the customs union, duty is normally paid once at the first point of entry — but goods sitting in a free zone have not entered anything yet.',
        'Get the tariff classification confirmed by the broker who will actually clear the goods. It decides both the duty and the conformity scope.',
      ],
    },
    {
      type: 'lead',
      html: 'The certificate of origin is the least discussed document on a Gulf consignment and the one most often assumed to be a formality. It is a statement about where goods were manufactured, it is attested rather than self-declared, and it drives duty treatment. When it is wrong, it is wrong in a way that surfaces at the border rather than in the office.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'What the document actually asserts.',
      anchor: 'what-it-asserts',
    },
    {
      type: 'paragraph',
      html: 'A certificate of origin states the country in which the goods were <strong>produced or substantially transformed</strong>, and it is attested by a chamber of commerce that is putting its name to that statement. It is not a statement about where the goods were bought, where they were stored, or who shipped them. Those are answered by the invoice and the transport documents, which are different pieces of paper doing different jobs.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A Dubai supplier does not make the goods Emirati.',
      body: 'This is the assumption that costs money. Hose manufactured in Italy, China, India or Türkiye and held in a Dubai warehouse is Italian, Chinese, Indian or Turkish on arrival in Riyadh or Doha — buying it from a UAE company changes the invoice, not the origin. Anyone quoting a duty saving on the basis that they are a Gulf supplier is either mistaken or describing something else.',
    },
    {
      type: 'paragraph',
      html: 'Preferential treatment between GCC states exists, but it is written for goods of GCC origin, and the tests behind that status are about manufacturing substance — local value added and the status of the producing factory — rather than about the location of a warehouse. Storage, repacking, re-invoicing and consolidation are explicitly the kinds of operation that do not confer origin anywhere in the world.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Where duty is genuinely paid once.',
      anchor: 'paid-once',
    },
    {
      type: 'paragraph',
      html: 'The GCC operates as a customs union with a common external tariff, so goods that have been cleared into free circulation in one member state move to another without duty being charged a second time. That is the real and useful version of "pay duty once" — and it is a statement about goods that have already been imported and cleared, not about goods sitting in a warehouse waiting to be exported.',
    },
    {
      type: 'comparison_table',
      caption: 'Three states a consignment can be in before it moves to another Gulf country',
      columns: ['Situation', 'What has happened to duty', 'What travels with it'],
      rows: [
        {
          cells: [
            'Held in a UAE free zone',
            'Nothing yet — the goods have not entered the local market',
            'Export documents raised at dispatch',
          ],
          highlight: true,
        },
        {
          cells: [
            'Duty-paid in the UAE, then re-exported',
            'Paid on UAE entry; treatment on the next leg follows the customs union rules',
            'Proof of the original entry, alongside the usual set',
          ],
        },
        {
          cells: [
            'Shipped direct from origin to the destination state',
            'Payable on entry to the destination',
            'Origin, invoice, packing list, plus any national registration',
          ],
        },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'This is a question for the broker who will clear it.',
      body: 'Duty treatment turns on the tariff line, the route and the customs status of the goods at each step. Those are facts about a specific consignment, and the person who can state them is the clearing agent at the destination. A supplier can tell you the origin, the classification they have declared and the documents they are preparing — that is the input the broker needs.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'What to check before it leaves.',
      anchor: 'before-dispatch',
    },
    {
      type: 'paragraph',
      html: 'Three mismatches account for most origin-related delays, and all three are visible on the documents before the truck moves.',
    },
    {
      type: 'comparison_table',
      caption: 'The three checks worth doing on the draft documents',
      columns: ['Check', 'What to compare', 'Why it matters'],
      rows: [
        {
          cells: [
            'Description consistency',
            'Invoice, packing list, certificate of origin, any registration',
            'A reworded description on one document breaks the set',
          ],
        },
        {
          cells: [
            'Origin per line, not per consignment',
            'Each line item against its actual manufacturer',
            'Mixed consignments routinely carry two or three origins',
          ],
          highlight: true,
        },
        {
          cells: [
            'Tariff classification',
            'What the supplier declared against what the broker expects',
            'It decides duty and, in Saudi Arabia, conformity scope',
          ],
        },
      ],
    },
    {
      type: 'paragraph',
      html: 'The second one is the one people miss. A hose order that includes assemblies, adapters and clamps can easily involve three factories in three countries, and a certificate naming a single origin for the whole consignment is not a shortcut — it is an inaccurate document.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Do you issue the certificate of origin?',
          answer:
            'It is prepared in Dubai and attested by the Dubai Chamber before the consignment leaves, alongside the rest of the export set. It states the manufacturing origin of each line, which for most of the catalogue is not the UAE.',
        },
        {
          question: 'Is there any duty advantage to buying from a UAE supplier?',
          answer:
            'Not by virtue of the supplier being in the UAE. The advantages of the Dubai lane are stock on the shelf, one consolidated consignment, documents prepared before dispatch and a short road transit — not preferential origin.',
        },
        {
          question: 'What is the duty rate on hydraulic hose in the GCC?',
          answer:
            'It follows the tariff line and the destination’s own schedule, so we do not publish a rate. Ask your clearing agent to confirm against the classification on the proforma before the order is placed.',
        },
        {
          question: 'Can one certificate cover a part-shipped order?',
          answer:
            'No. Origin documents are raised against what actually ships, so a part shipment needs its own set. Decide whether to split the order before the documents are raised.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Want the documents checked before dispatch?',
      body: 'We prepare the origin, invoice and packing documents in Dubai and can send drafts for your broker to review before anything moves. Mismatches are cheap to fix on a draft and expensive to fix at a border.',
      quoteLabel: 'Ask for a quotation',
    },
  ],
}

export default ARTICLE
