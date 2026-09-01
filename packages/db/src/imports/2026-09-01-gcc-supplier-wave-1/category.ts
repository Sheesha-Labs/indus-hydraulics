import type { BlogBlocksInput } from '@indus/domain'

/**
 * The GCC conformity hub.
 *
 * Created rather than folded into `procurement-export`, which is about how an
 * order is bought and moved. This is about what has to be true on paper before
 * it can move at all, and the two questions are asked by different people —
 * procurement asks the first, QA and the customs broker ask the second.
 *
 * The hub carries a body and a focus keyword from creation. Eleven hubs shipped
 * empty in August 2026 and needed a whole retrofit wave to fix it; that is not
 * repeated here.
 *
 * Its head term was checked against the focus keywords on all 93 published
 * articles and the eleven existing hubs. Nothing in the corpus targets
 * conformity or import documentation.
 */
export const GCC_COMPLIANCE_CATEGORY = {
  slug: 'gcc-compliance',
  name: 'GCC conformity & documentation',
  description:
    'What has to travel with a hose consignment into Saudi Arabia, Qatar, Kuwait, Oman and Bahrain: conformity registration, certificates of origin, test and material certificates, and the documents an operator asks for on top of the ones customs asks for.',
  heroCopy:
    'Across the Gulf, a hose order is rarely held up by the hose. It is held up by a certificate that was ordered late, issued against the wrong part number, or never needed in the first place.',
  seoTitle: 'GCC conformity and import documents for hose and fittings',
  seoDescription:
    'SABER, certificates of origin, test and material certificates, and the per-country import documents for hose consignments into Saudi Arabia, Qatar, Kuwait, Oman and Bahrain.',
  focusKeyword: 'gcc conformity',
  position: 12,
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'Is there one set of GCC conformity rules?',
      answer:
        'No. The Gulf states share a customs union and a common external tariff, so duty is normally paid once at the first point of entry — but conformity is national. Saudi Arabia runs SABER, Kuwait runs KUCAS, Qatar operates a pre-shipment verification scheme against its own regulated list, and Oman and Bahrain work from their own ministry lists with a conventional document set behind them. A supplier who says "we handle GCC certification" as one thing has not met all five.',
    },
    {
      type: 'paragraph',
      html: 'The Gulf conformity mark is the exception people expect to be the rule. <strong>G-Mark is scoped to low-voltage electrical equipment and toys</strong> — it is not a general Gulf product passport, and hydraulic hose does not carry it. Most of what actually governs a hose consignment is either a national registration scheme or the ordinary commercial document set: invoice, packing list, certificate of origin, and whatever the end user has written into the purchase order.',
    },
    {
      type: 'comparison_table',
      caption: 'Five destinations, four different regimes',
      columns: ['Destination', 'What governs a regulated consignment', 'Who issues it'],
      rows: [
        {
          cells: [
            'Saudi Arabia',
            'SABER — product registration, then a shipment certificate per consignment',
            'Notified conformity body, through the importer’s SABER account',
          ],
          highlight: true,
        },
        {
          cells: [
            'Kuwait',
            'KUCAS — technical evaluation and inspection reports',
            'A certification body recognised by the Public Authority for Industry',
          ],
        },
        {
          cells: [
            'Qatar',
            'Pre-shipment verification against the national regulated list',
            'An approved third-party body',
          ],
        },
        {
          cells: [
            'Oman and Bahrain',
            'Ministry regulated lists; otherwise the standard commercial document set',
            'Chamber-attested origin, supplier certificates',
          ],
        },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Scope is settled by tariff line, not by product family.',
      body: 'Whether a specific hose or fitting falls inside a regulated list is decided against its HS code and its declared description, not against the phrase "hydraulic hose". That is why the part numbers matter at quotation rather than at order — and why a supplier who answers the question in general terms, in either direction, is guessing.',
    },
    {
      type: 'paragraph',
      html: 'The second half of this topic has nothing to do with customs. An operator’s purchase order routinely asks for documents no government requires — a proof-test certificate against the assembly, material certificates to EN 10204 3.1 on the fittings, a sour-service statement, a batch and cure date. Those are contractual, they are asked for late, and they are the most common reason a consignment sits finished in Dubai instead of moving.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-hoses',
      label: 'Hydraulic hose by grade',
      blurb: 'Stocked in Dubai, assembled and tested before dispatch.',
    },
    {
      type: 'cta_block',
      heading: 'Sending a consignment into the Gulf?',
      body: 'Give us the part numbers and the destination at quotation rather than at order, and the conformity work runs in parallel with picking. Where a product falls outside a regulated scope we will say so rather than charge for paperwork nobody needs.',
      quoteLabel: 'Ask about documentation',
    },
  ] satisfies BlogBlocksInput,
}
