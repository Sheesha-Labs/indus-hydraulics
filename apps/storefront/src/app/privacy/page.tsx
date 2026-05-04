import type { Metadata } from 'next'
import { db } from '@indus/db'
import { notFound } from 'next/navigation'

export const metadata: Metadata = { title: 'Privacy Policy' }

// Legal page rarely changes; cache for 1 hour.
export const revalidate = 3600

const EFFECTIVE_DATE = '2026-05-04'

type Props = { params: Promise<Record<string, never>> }

export default async function PrivacyPage({ params }: Props) {
  await params

  const cms = await db.cmsPage.findUnique({
    where: { slug: 'privacy' },
  })

  if (cms?.isPublished) {
    return (
      <article className="max-w-[820px] mx-auto px-8 py-16 pb-24 prose prose-sm">
        <h1 className="text-[36px] font-semibold tracking-tight mb-2">{cms.title}</h1>
        <div
          className="text-[15px] leading-[1.7] text-[var(--color-body)]"
          dangerouslySetInnerHTML={{ __html: cms.body }}
        />
      </article>
    )
  }

  if (cms) {
    notFound()
  }

  return (
    <article className="max-w-[820px] mx-auto px-8 py-16 pb-24 text-[var(--color-body)]">
      <header className="mb-10">
        <h1 className="text-[36px] font-semibold tracking-tight mb-3">Privacy Policy</h1>
        <p className="font-mono text-[12px] text-[var(--color-muted)] tracking-[0.06em] uppercase">
          Effective {EFFECTIVE_DATE} · Version 1.0
        </p>
      </header>

      <Section title="1. Who we are">
        <p>
          This Privacy Policy explains how Indus Hydraulic Power Trading LLC
          (&ldquo;Indus Hydraulics&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) collects, uses, and
          protects personal information through indushydraulics.com and our customer portal. We are
          the data controller for the personal data described below.
        </p>
      </Section>

      <Section title="2. Information we collect">
        <p>We collect personal information in the following situations:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <b>Account creation:</b> name, business email, phone number, company name, role, and
            shipping/billing addresses you provide.
          </li>
          <li>
            <b>Quotation requests:</b> the part numbers, quantities, application context, and any
            attachments you submit through the RFQ flow or contact form.
          </li>
          <li>
            <b>Contact form submissions:</b> the fields you submit on the contact page, including
            inquiry type, company, industry, and message.
          </li>
          <li>
            <b>Operational records:</b> emails we exchange with you about quotes, deliveries,
            invoices, and warranty claims.
          </li>
          <li>
            <b>Site usage:</b> server logs (IP address, user agent, request timestamps), session
            cookies required for authentication, and basic analytics about which pages are viewed.
          </li>
        </ul>
        <p>We do not knowingly collect personal data from individuals under 18 years of age.</p>
      </Section>

      <Section title="3. Why we use your information">
        <p>We use personal information to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>respond to RFQs and prepare Estimates;</li>
          <li>process orders, arrange delivery, and handle warranty claims;</li>
          <li>operate your customer portal account and remember preferences;</li>
          <li>send transactional emails (quote confirmations, status updates, invoices);</li>
          <li>send service-related notices about changes to our terms or platform;</li>
          <li>maintain financial and accounting records as required by UAE law;</li>
          <li>investigate and prevent fraud, abuse, or security incidents;</li>
          <li>improve the catalogue, search, and overall site experience.</li>
        </ul>
      </Section>

      <Section title="4. Lawful basis">
        <p>
          We process personal data on the basis of (a) your explicit consent where applicable, (b)
          performance of the contract for goods or services you have requested, (c) compliance with
          legal and regulatory obligations under UAE law, and (d) our legitimate interests in
          operating and improving the business.
        </p>
      </Section>

      <Section title="5. How we store and protect data">
        <p>
          Personal data is stored in a Postgres database hosted on Supabase, with encryption at rest
          and in transit. Access is restricted to authorised staff using individual credentials, and
          is audit-logged where appropriate. Authentication is handled by Auth.js using secure,
          HTTP-only session cookies.
        </p>
      </Section>

      <Section title="6. Sharing with third parties">
        <p>We do not sell personal data. We share information only as necessary with:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <b>Email service:</b> Resend, for delivery of transactional emails (quote confirmations,
            password resets, contact-form alerts).
          </li>
          <li>
            <b>Hosting and database:</b> Vercel (web hosting) and Supabase (database, file storage),
            both bound by their respective data-processing agreements.
          </li>
          <li>
            <b>Manufacturers and suppliers:</b> when needed to fulfil an order, raise a warranty
            claim, or arrange technical support, we may share the minimum information required.
          </li>
          <li>
            <b>Logistics partners:</b> shipping and customs information when arranging delivery.
          </li>
          <li>
            <b>Professional advisers and authorities:</b> auditors, lawyers, banks, and government
            authorities where required by law or to protect our legal rights.
          </li>
        </ul>
      </Section>

      <Section title="7. International transfers">
        <p>
          Some of our service providers (including Vercel, Supabase, and Resend) operate from data
          centres outside the United Arab Emirates. Where this is the case, transfers are governed by
          the providers&apos; standard contractual safeguards.
        </p>
      </Section>

      <Section title="8. Cookies">
        <p>
          We use a small number of strictly-necessary cookies, primarily for authentication and basic
          load balancing. We do not use third-party advertising or behavioural tracking cookies. You
          can disable cookies in your browser settings, but doing so will prevent sign-in to the
          customer portal.
        </p>
      </Section>

      <Section title="9. Data retention">
        <p>
          We keep personal data for as long as your account is active and for a further period
          required to comply with UAE accounting and tax record-keeping obligations (currently five
          years from the relevant transaction). RFQ and quote records may be kept for longer where
          needed to honour ongoing warranty obligations. Server logs are retained for shorter
          operational windows (typically 30–90 days).
        </p>
      </Section>

      <Section title="10. Your rights">
        <p>You have the right, subject to UAE law, to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>access the personal data we hold about you;</li>
          <li>request correction of inaccurate or incomplete data;</li>
          <li>request deletion of personal data, subject to legal retention requirements;</li>
          <li>object to or restrict certain processing;</li>
          <li>withdraw consent where processing is based on consent;</li>
          <li>complain to the relevant supervisory authority.</li>
        </ul>
        <p>
          To exercise any of these rights, contact us at the address below. We may need to verify
          your identity before responding and will reply within 30 days.
        </p>
      </Section>

      <Section title="11. Security incidents">
        <p>
          In the unlikely event of a personal-data breach that is likely to affect you, we will
          notify the affected account holders without undue delay and outline the steps we are taking
          and any actions we recommend you take.
        </p>
      </Section>

      <Section title="12. Changes to this policy">
        <p>
          We may update this Privacy Policy as our practices evolve or as legal requirements change.
          The current version is always the one published at this URL with the effective date shown
          above. Material changes will be notified to active account holders by email.
        </p>
      </Section>

      <Section title="13. Contact">
        <p>
          For privacy questions, requests, or complaints, contact us at{' '}
          <a className="text-[var(--color-accent)] hover:underline" href="mailto:privacy@indushydraulics.com">
            privacy@indushydraulics.com
          </a>
          . For general enquiries, see the channels on our{' '}
          <a className="text-[var(--color-accent)] hover:underline" href="/contact">
            contact page
          </a>
          .
        </p>
      </Section>

      <footer className="mt-12 pt-6 border-t border-[var(--color-border)] text-[12px] text-[var(--color-caption)] leading-[1.6]">
        This Privacy Policy is written in plain English as a v1 reference. It is not a substitute
        for independent legal advice. If your data-protection requirements are governed by a regime
        outside the UAE (for example, EU GDPR or UK GDPR), please contact us so we can address
        any additional obligations.
      </footer>
    </article>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-[18px] font-semibold tracking-[-0.01em] mb-3 text-[var(--color-primary)]">
        {title}
      </h2>
      <div className="text-[15px] leading-[1.7] space-y-3">{children}</div>
    </section>
  )
}
