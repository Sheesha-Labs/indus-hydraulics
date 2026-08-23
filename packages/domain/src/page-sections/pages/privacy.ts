import { richText, text } from '../fields'
import type { MasterPageDef, SimpleFieldDef } from '../types'

/**
 * The privacy policy, clause by clause.
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

export const PRIVACY_PAGE: MasterPageDef = {
  key: 'privacy',
  label: 'Privacy policy',
  path: '/privacy',
  description: 'The privacy policy, clause by clause.',
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
        title: 'Privacy Policy',
        effective_line: 'Effective 2026-05-04 · Version 1.0',
      },
    },
    {
      key: 'who-we-are',
      label: 'Who we are',
      description: 'Clause of the policy.',
      fields: [clauseHeading(), clauseBody()],
      defaults: {
        heading: 'Who we are',
        body: '<p>This Privacy Policy explains how Indus Hydraulic Power Trading LLC (“Indus Hydraulics”, “we”, “us”) collects, uses, and protects personal information through indushydraulics.com and our customer portal. We are the data controller for the personal data described below.</p>',
      },
    },
    {
      key: 'information-we-collect',
      label: 'Information we collect',
      description: 'Clause of the policy.',
      fields: [clauseHeading(), clauseBody()],
      defaults: {
        heading: 'Information we collect',
        body: '<p>We collect personal information in the following situations:</p><ul><li><b>Account creation:</b> name, business email, phone number, company name, role, and shipping/billing addresses you provide.</li><li><b>Quotation requests:</b> the part numbers, quantities, application context, and any attachments you submit through the RFQ flow or contact form.</li><li><b>Contact form submissions:</b> the fields you submit on the contact page, including inquiry type, company, industry, and message.</li><li><b>Operational records:</b> emails we exchange with you about quotes, deliveries, invoices, and warranty claims.</li><li><b>Site usage:</b> server logs (IP address, user agent, request timestamps), session cookies required for authentication, and basic analytics about which pages are viewed.</li></ul><p>We do not knowingly collect personal data from individuals under 18 years of age.</p>',
      },
    },
    {
      key: 'why-we-use-your-information',
      label: 'Why we use your information',
      description: 'Clause of the policy.',
      fields: [clauseHeading(), clauseBody()],
      defaults: {
        heading: 'Why we use your information',
        body: '<p>We use personal information to:</p><ul><li>respond to RFQs and prepare Estimates;</li><li>process orders, arrange delivery, and handle warranty claims;</li><li>operate your customer portal account and remember preferences;</li><li>send transactional emails (quote confirmations, status updates, invoices);</li><li>send service-related notices about changes to our terms or platform;</li><li>maintain financial and accounting records as required by UAE law;</li><li>investigate and prevent fraud, abuse, or security incidents;</li><li>improve the catalogue, search, and overall site experience.</li></ul>',
      },
    },
    {
      key: 'lawful-basis',
      label: 'Lawful basis',
      description: 'Clause of the policy.',
      fields: [clauseHeading(), clauseBody()],
      defaults: {
        heading: 'Lawful basis',
        body: '<p>We process personal data on the basis of (a) your explicit consent where applicable, (b) performance of the contract for goods or services you have requested, (c) compliance with legal and regulatory obligations under UAE law, and (d) our legitimate interests in operating and improving the business.</p>',
      },
    },
    {
      key: 'how-we-store-and-protect-data',
      label: 'How we store and protect data',
      description: 'Clause of the policy.',
      fields: [clauseHeading(), clauseBody()],
      defaults: {
        heading: 'How we store and protect data',
        body: '<p>Personal data is stored in a Postgres database hosted on Supabase, with encryption at rest and in transit. Access is restricted to authorised staff using individual credentials, and is audit-logged where appropriate. Authentication is handled by Auth.js using secure, HTTP-only session cookies.</p>',
      },
    },
    {
      key: 'sharing-with-third-parties',
      label: 'Sharing with third parties',
      description: 'Clause of the policy.',
      fields: [clauseHeading(), clauseBody()],
      defaults: {
        heading: 'Sharing with third parties',
        body: '<p>We do not sell personal data. We share information only as necessary with:</p><ul><li><b>Email service:</b> Resend, for delivery of transactional emails (quote confirmations, password resets, contact-form alerts).</li><li><b>Hosting and database:</b> Vercel (web hosting) and Supabase (database, file storage), both bound by their respective data-processing agreements.</li><li><b>Manufacturers and suppliers:</b> when needed to fulfil an order, raise a warranty claim, or arrange technical support, we may share the minimum information required.</li><li><b>Logistics partners:</b> shipping and customs information when arranging delivery.</li><li><b>Professional advisers and authorities:</b> auditors, lawyers, banks, and government authorities where required by law or to protect our legal rights.</li></ul>',
      },
    },
    {
      key: 'international-transfers',
      label: 'International transfers',
      description: 'Clause of the policy.',
      fields: [clauseHeading(), clauseBody()],
      defaults: {
        heading: 'International transfers',
        body: '<p>Some of our service providers (including Vercel, Supabase, and Resend) operate from data centres outside the United Arab Emirates. Where this is the case, transfers are governed by the providers\' standard contractual safeguards.</p>',
      },
    },
    {
      key: 'cookies',
      label: 'Cookies',
      description: 'Clause of the policy.',
      fields: [clauseHeading(), clauseBody()],
      defaults: {
        heading: 'Cookies',
        body: '<p>We use a small number of strictly-necessary cookies, primarily for authentication and basic load balancing. We do not use third-party advertising or behavioural tracking cookies. You can disable cookies in your browser settings, but doing so will prevent sign-in to the customer portal.</p>',
      },
    },
    {
      key: 'data-retention',
      label: 'Data retention',
      description: 'Clause of the policy.',
      fields: [clauseHeading(), clauseBody()],
      defaults: {
        heading: 'Data retention',
        body: '<p>We keep personal data for as long as your account is active and for a further period required to comply with UAE accounting and tax record-keeping obligations (currently five years from the relevant transaction). RFQ and quote records may be kept for longer where needed to honour ongoing warranty obligations. Server logs are retained for shorter operational windows (typically 30–90 days).</p>',
      },
    },
    {
      key: 'your-rights',
      label: 'Your rights',
      description: 'Clause of the policy.',
      fields: [clauseHeading(), clauseBody()],
      defaults: {
        heading: 'Your rights',
        body: '<p>You have the right, subject to UAE law, to:</p><ul><li>access the personal data we hold about you;</li><li>request correction of inaccurate or incomplete data;</li><li>request deletion of personal data, subject to legal retention requirements;</li><li>object to or restrict certain processing;</li><li>withdraw consent where processing is based on consent;</li><li>complain to the relevant supervisory authority.</li></ul><p>To exercise any of these rights, contact us at the address below. We may need to verify your identity before responding and will reply within 30 days.</p>',
      },
    },
    {
      key: 'security-incidents',
      label: 'Security incidents',
      description: 'Clause of the policy.',
      fields: [clauseHeading(), clauseBody()],
      defaults: {
        heading: 'Security incidents',
        body: '<p>In the unlikely event of a personal-data breach that is likely to affect you, we will notify the affected account holders without undue delay and outline the steps we are taking and any actions we recommend you take.</p>',
      },
    },
    {
      key: 'changes-to-this-policy',
      label: 'Changes to this policy',
      description: 'Clause of the policy.',
      fields: [clauseHeading(), clauseBody()],
      defaults: {
        heading: 'Changes to this policy',
        body: '<p>We may update this Privacy Policy as our practices evolve or as legal requirements change. The current version is always the one published at this URL with the effective date shown above. Material changes will be notified to active account holders by email.</p>',
      },
    },
    {
      key: 'contact',
      label: 'Contact',
      description: 'Clause of the policy.',
      fields: [clauseHeading(), clauseBody()],
      defaults: {
        heading: 'Contact',
        body: '<p>For privacy questions, requests, or complaints, contact us at <a href="mailto:privacy@indushydraulics.me">privacy@indushydraulics.me</a>. For general enquiries, see the channels on our <a href="/contact">contact page</a>.</p>',
      },
    },
  ],
}
