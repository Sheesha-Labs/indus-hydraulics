import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The head article of the wave.
 *
 * Deliberately does NOT assert whether hydraulic hose is a regulated product
 * under a Saudi technical regulation. Scope is decided against the HS code and
 * the declared description, and a general answer would be wrong in one
 * direction or the other for some part of the catalogue. The article teaches
 * the mechanism and says who settles the scope, which is the honest version
 * and also the more useful one.
 *
 * The two claims about our own process — that we prepare the registration
 * against the part numbers on the order, and that we say so when a product
 * falls outside scope — are lifted from `/markets/saudi-arabia`, where they
 * are already published and approved.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'saber-certificate-for-hydraulic-hose',
  title: 'The SABER certificate for hydraulic hose going into Saudi Arabia',
  excerpt:
    'SABER is two registrations, not one, and the second is per consignment. What that means for a hose order, when the part numbers have to exist, and why a shipment that travelled in three days can still sit at the border.',
  categorySlug: 'gcc-compliance',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'SABER certificate for hydraulic hose — Saudi Arabia imports',
  seoDescription:
    'How SABER product and shipment registration works for a hydraulic hose consignment into Saudi Arabia, who issues what, and the sequence that keeps a load moving.',
  focusKeyword: 'saber certificate for hydraulic hose',
  publishedAt: '2026-09-01T07:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'SABER is two separate registrations: the product, once, and then the shipment, every single time.',
        'The shipment certificate is issued against a specific consignment. It cannot be obtained in advance and reused.',
        'Whether a given hose or fitting is a regulated product is settled against its HS code and declared description — not against the words "hydraulic hose".',
        'The registration is done on the importer’s SABER account. The supplier prepares it; the account belongs to the buyer.',
        'The part numbers decide the paperwork, so a full list at quotation is worth more than a fast quote against a vague one.',
      ],
    },
    {
      type: 'lead',
      html: 'Saudi Arabia is the largest export lane out of Dubai and the one where the documents, not the distance, decide the arrival date. Road transit to Riyadh is around three working days. A consignment whose conformity registration was started when the truck was loaded takes considerably longer than that, and none of the extra time is spent moving.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Two registrations, not one.',
      anchor: 'two-registrations',
    },
    {
      type: 'paragraph',
      html: 'People say "the SABER certificate" as though it were a single document. It is a platform, and a regulated consignment passes through it twice. The <strong>product certificate of conformity</strong> is obtained once per product, through a notified conformity body, and establishes that the item meets the applicable Saudi technical regulation. The <strong>shipment certificate of conformity</strong> is then issued against a particular consignment — this invoice, these quantities, this container — and it is what customs looks for.',
    },
    {
      type: 'comparison_table',
      caption: 'What each registration covers',
      columns: ['Registration', 'Scope', 'When it is obtained'],
      rows: [
        {
          cells: [
            'Product certificate',
            'One product, described by model and tariff line',
            'Once, then valid for its stated term',
          ],
        },
        {
          cells: [
            'Shipment certificate',
            'One consignment, tied to the invoice',
            'Before dispatch, every time',
          ],
          highlight: true,
        },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'The shipment half is the one that catches people.',
      body: 'A buyer who imported the same hose last quarter has a product registration and reasonably assumes the work is done. It is not — the next consignment needs its own shipment certificate, raised against its own invoice. This is the single most common reason a repeat order arrives slower than the first one, because nobody expected to do anything.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Whose account is it?',
      anchor: 'whose-account',
    },
    {
      type: 'paragraph',
      html: 'The SABER account belongs to the <strong>importer of record in Saudi Arabia</strong>, not to the supplier in Dubai. A supplier prepares the registration, supplies the technical file, deals with the conformity body and pays the fees — but it happens on the buyer’s account, and the buyer’s commercial registration is what the platform is keyed to. If your supplier has never asked who the importer of record is, they have not done this before.',
    },
    {
      type: 'paragraph',
      html: 'That ownership has a practical consequence worth planning for: the account carries the buyer’s registration history. Products already registered under it do not need registering twice, and a buyer who imports regularly is often further ahead than they think. Sending the supplier a list of what is already on the account is five minutes that can remove a step.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'What decides whether any of this applies.',
      anchor: 'scope',
    },
    {
      type: 'paragraph',
      html: 'Scope is set by technical regulation, and a technical regulation names the products it covers by <strong>HS code and description</strong>. It does not name them by the phrase a catalogue uses. So the question "does hydraulic hose need SABER?" has no general answer — a hose assembly, a bulk hose, a steel adapter and a quick coupler are four different tariff lines, and they can land differently.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Be suspicious of a confident general answer.',
      body: 'A supplier who says "hose never needs SABER" and one who says "everything needs SABER" are making the same mistake in opposite directions. The correct answer is that scope is checked per part number against the tariff line, and that the check is cheap and quick when the list exists early.',
    },
    {
      type: 'paragraph',
      html: 'Where a product falls outside a regulated scope, we say so rather than charging for paperwork nobody needs. Where it falls inside, the conformity work runs in parallel with picking rather than after it — which is the entire reason the part numbers are asked for at quotation rather than at order.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'The sequence that keeps a load moving.',
      anchor: 'sequence',
    },
    {
      type: 'decision_tree',
      heading: 'Where a Saudi consignment actually stalls',
      intro:
        'Each of these is a real stall with a different fix. Working out which one you are in is most of the work.',
      branches: [
        {
          condition: 'The part list arrived with the purchase order, not the enquiry',
          outcome: 'Scope checking starts after the goods are picked',
          detail:
            'Nothing is wrong, but the conformity work is now in series with the packing instead of parallel to it. Send the list at enquiry stage next time; it costs nothing.',
        },
        {
          condition: 'The invoice description does not match the registered product',
          outcome: 'The shipment certificate cannot be raised against it',
          detail:
            'Descriptions have to be consistent across the registration, the invoice and the packing list. A helpful rewording on the invoice is a re-do.',
        },
        {
          condition: 'The consignment was split after the certificate was raised',
          outcome: 'The certificate no longer matches the shipment',
          detail:
            'A part-shipped order needs its documentation re-cut to match what actually left. Decide whether to part-ship before the paperwork is raised, not after.',
        },
        {
          condition: 'The importer of record changed between quotation and order',
          outcome: 'The registration is on the wrong account',
          detail:
            'This happens when a project buys through a contractor rather than directly. Tell the supplier as soon as it is known.',
        },
      ],
    },

    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Who arranges SABER registration for a hose order from Dubai?',
          answer:
            'We do, against the part numbers on the order. Both registrations are product- and consignment-specific, so the earlier the full list reaches us, the more of that work runs in parallel with picking rather than after it.',
        },
        {
          question: 'Can a SABER certificate be reused for the next order?',
          answer:
            'The product registration carries forward for its stated term. The shipment certificate cannot — it is raised against one consignment and one invoice, so every dispatch needs its own.',
        },
        {
          question: 'Does a hose assembly need a different registration from bulk hose?',
          answer:
            'Potentially, because they can fall under different tariff lines. This is settled per part number against the HS code rather than assumed from the product family.',
        },
        {
          question: 'What happens if goods arrive without the shipment certificate?',
          answer:
            'They wait at customs while it is obtained, and the consignment accrues storage in the meantime. Nothing about the goods themselves is wrong, which is what makes it a frustrating way to lose a week.',
        },
        {
          question: 'Do you also prepare the certificate of origin?',
          answer:
            'Yes, Dubai Chamber attested, prepared in Dubai before the consignment leaves. It is a separate document from anything in SABER and it is needed regardless of conformity scope.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Shipping hose into Saudi Arabia?',
      body: 'Send the part numbers and the importer of record with the enquiry. We check the scope against the tariff lines, tell you which items need registration and which do not, and prepare the documents in Dubai before anything is loaded.',
      quoteLabel: 'Ask for a quotation',
    },
  ],
}

export default ARTICLE
