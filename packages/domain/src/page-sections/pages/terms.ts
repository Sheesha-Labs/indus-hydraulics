import { richText, text } from '../fields'
import type { MasterPageDef, SimpleFieldDef } from '../types'

/**
 * The terms of sale, clause by clause.
 *
 * Every clause is a section: it can be re-worded, hidden, or dragged into a
 * different position, and the NUMBER is derived from where it sits rather than
 * typed into the title. That is the whole reason the numbers left the copy —
 * "7. International transfers" moved to fifth place would otherwise still read
 * as seven, and nothing would catch it.
 *
 * The bodies are HTML because these clauses carry lists and bold runs a plain
 * textarea would flatten. They are sanitised against an allow-list on save.
 */
const clauseHeading = (): SimpleFieldDef =>
  text('heading', 'Clause title', { max: 120, help: 'The number is added automatically.' })

const clauseBody = (): SimpleFieldDef => richText('body', 'Clause text', { optional: false })

export const TERMS_PAGE: MasterPageDef = {
  key: 'terms',
  label: 'Terms',
  path: '/terms',
  description: 'The terms of sale, clause by clause.',
  sections: [
    {
      key: 'intro',
      label: 'Title and effective date',
      description: 'The page title and the line under it.',
      locked: true,
      fields: [
        text('title', 'Page title', { max: 120 }),
        text('effective_line', 'Effective-date line', { max: 120, optional: true }),
      ],
      defaults: {
        title: 'Terms & Conditions',
        effective_line: 'Effective 2026-05-04 · Version 1.0',
      },
    },
    {
      key: 'about-these-terms',
      label: 'About these terms',
      description: 'Clause of the policy.',
      fields: [clauseHeading(), clauseBody()],
      defaults: {
        heading: 'About these terms',
        body: '<p>These Terms of Service (“Terms”) govern your access to and use of the website at indushydraulics.com (the “Site”) and any goods or services supplied by Indus Hydraulic Power Trading LLC (“Indus Hydraulics”, “we”, “us”). By using the Site or transacting with us, you agree to these Terms.</p>',
      },
    },
    {
      key: 'quotations-and-orders',
      label: 'Quotations and orders',
      description: 'Clause of the policy.',
      fields: [clauseHeading(), clauseBody()],
      defaults: {
        heading: 'Quotations and orders',
        body: '<p>We operate on a Request-for-Quotation (RFQ) basis. When you submit an RFQ through the Site or by email, we respond with a written Estimate that lists the line items, unit prices, lead times, applicable taxes, and validity period.</p><p>An Estimate is an offer open for acceptance during its stated validity period and may be withdrawn or amended by us before acceptance. A binding contract is formed only when you accept an Estimate in writing (including via the email-acceptance link we provide).</p>',
      },
    },
    {
      key: 'pricing-currency-and-payment',
      label: 'Pricing, currency, and payment',
      description: 'Clause of the policy.',
      fields: [clauseHeading(), clauseBody()],
      defaults: {
        heading: 'Pricing, currency, and payment',
        body: '<p>All prices are quoted in UAE Dirhams (AED) unless explicitly stated otherwise on the Estimate. Prices are inclusive of UAE Value Added Tax where the supplier is VAT-registered; the VAT treatment will be itemised on the Estimate.</p><p>Payment terms are stated on each Estimate. Standard terms are payment in advance for new accounts and net-30 days from invoice for accounts on credit terms. Late payments may attract interest at the rate permitted under UAE law.</p>',
      },
    },
    {
      key: 'delivery-and-risk',
      label: 'Delivery and risk',
      description: 'Clause of the policy.',
      fields: [clauseHeading(), clauseBody()],
      defaults: {
        heading: 'Delivery and risk',
        body: '<p>Delivery terms (Incoterms 2020) are stated on each Estimate. Title and risk transfer in accordance with the agreed Incoterm. Lead times are estimates given in good faith based on stock and supplier information at the time of quotation; we are not liable for delays caused by suppliers, carriers, customs, or events outside our reasonable control.</p>',
      },
    },
    {
      key: 'acceptance-and-inspection',
      label: 'Acceptance and inspection',
      description: 'Clause of the policy.',
      fields: [clauseHeading(), clauseBody()],
      defaults: {
        heading: 'Acceptance and inspection',
        body: '<p>You must inspect goods on delivery and notify us in writing of any visible damage, shortage, or non-conformity within seven (7) days. Concealed defects must be reported promptly upon discovery. After this period, goods are deemed accepted.</p>',
      },
    },
    {
      key: 'warranty',
      label: 'Warranty',
      description: 'Clause of the policy.',
      fields: [clauseHeading(), clauseBody()],
      defaults: {
        heading: 'Warranty',
        body: '<p>We supply goods covered by the original manufacturer\'s warranty. Warranty terms (duration, coverage, and remedies) are those provided by the manufacturer and are passed through to you without modification. We will assist with warranty claims but do not extend cover beyond the manufacturer\'s terms.</p><p>Goods supplied are intended for industrial use by qualified personnel. You are responsible for verifying the suitability of any product for your specific application.</p>',
      },
    },
    {
      key: 'returns',
      label: 'Returns',
      description: 'Clause of the policy.',
      fields: [clauseHeading(), clauseBody()],
      defaults: {
        heading: 'Returns',
        body: '<p>Goods may only be returned for valid warranty claims or where we have agreed in writing in advance. Special-order or non-stock items are non-returnable. Approved returns must be unused, in original packaging, and accompanied by the original Estimate or invoice reference.</p>',
      },
    },
    {
      key: 'limitation-of-liability',
      label: 'Limitation of liability',
      description: 'Clause of the policy.',
      fields: [clauseHeading(), clauseBody()],
      defaults: {
        heading: 'Limitation of liability',
        body: '<p>To the maximum extent permitted by UAE law, our total liability arising out of or in connection with any Estimate, order, or use of the Site shall not exceed the amount paid by you under the relevant Estimate. We shall not be liable for indirect, consequential, or economic loss including loss of production, profit, or goodwill.</p><p>Nothing in these Terms limits liability for death or personal injury caused by negligence, for fraud, or for any other liability that cannot be excluded by law.</p>',
      },
    },
    {
      key: 'intellectual-property',
      label: 'Intellectual property',
      description: 'Clause of the policy.',
      fields: [clauseHeading(), clauseBody()],
      defaults: {
        heading: 'Intellectual property',
        body: '<p>All content on the Site — including the catalogue structure, product descriptions authored by us, photographs, and trade dress — is owned by us or our licensors. Manufacturer datasheets, drawings, and brand marks remain the property of the respective manufacturers. You may download and print materials for legitimate evaluation, procurement, and operational use, but may not republish, resell, or redistribute them.</p>',
      },
    },
    {
      key: 'force-majeure',
      label: 'Force majeure',
      description: 'Clause of the policy.',
      fields: [clauseHeading(), clauseBody()],
      defaults: {
        heading: 'Force majeure',
        body: '<p>Neither party is liable for failure or delay in performance caused by events beyond reasonable control, including acts of government, war, civil unrest, fire, flood, pandemic, industrial action, transport disruption, or supplier failure. The affected party must notify the other promptly and resume performance as soon as practicable.</p>',
      },
    },
    {
      key: 'governing-law-and-jurisdiction',
      label: 'Governing law and jurisdiction',
      description: 'Clause of the policy.',
      fields: [clauseHeading(), clauseBody()],
      defaults: {
        heading: 'Governing law and jurisdiction',
        body: '<p>These Terms and any contract formed under them are governed by the laws of the United Arab Emirates as applied in the Emirate of Dubai. Any dispute arising shall be subject to the exclusive jurisdiction of the courts of Dubai, without prejudice to any mandatory consumer rights you may have.</p>',
      },
    },
    {
      key: 'changes-to-these-terms',
      label: 'Changes to these terms',
      description: 'Clause of the policy.',
      fields: [clauseHeading(), clauseBody()],
      defaults: {
        heading: 'Changes to these terms',
        body: '<p>We may update these Terms from time to time. The current version is always the version published at this URL with the effective date shown above. Material changes will be notified to active account holders by email. Continued use of the Site after changes take effect constitutes acceptance of the updated Terms.</p>',
      },
    },
    {
      key: 'contact',
      label: 'Contact',
      description: 'Clause of the policy.',
      fields: [clauseHeading(), clauseBody()],
      defaults: {
        heading: 'Contact',
        body: '<p>For questions about these Terms or any commercial matter, contact us at <a href="mailto:sales@indushydraulics.me">sales@indushydraulics.me</a> or via the channels listed on our <a href="/contact">contact page</a>.</p>',
      },
    },
  ],
}
