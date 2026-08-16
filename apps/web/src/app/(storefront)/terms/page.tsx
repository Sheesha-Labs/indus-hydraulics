import type { Metadata } from 'next'
import { db } from '@indus/db'
import { notFound } from 'next/navigation'
import PolicyLayout, { PolicySectionBody } from '../../../components/PolicyLayout'

export const metadata: Metadata = { title: 'Terms of Service' }

// Legal page rarely changes; cache for 1 hour.
export const revalidate = 3600

const EFFECTIVE_DATE = '2026-05-04'

const SECTIONS = [
  { id: 'about-these-terms', title: '1. About these terms' },
  { id: 'quotations-and-orders', title: '2. Quotations and orders' },
  { id: 'pricing-currency-and-payment', title: '3. Pricing, currency, and payment' },
  { id: 'delivery-and-risk', title: '4. Delivery and risk' },
  { id: 'acceptance-and-inspection', title: '5. Acceptance and inspection' },
  { id: 'warranty', title: '6. Warranty' },
  { id: 'returns', title: '7. Returns' },
  { id: 'limitation-of-liability', title: '8. Limitation of liability' },
  { id: 'intellectual-property', title: '9. Intellectual property' },
  { id: 'force-majeure', title: '10. Force majeure' },
  { id: 'governing-law-and-jurisdiction', title: '11. Governing law and jurisdiction' },
  { id: 'changes-to-these-terms', title: '12. Changes to these terms' },
  { id: 'contact', title: '13. Contact' },
] as const

type Props = { params: Promise<Record<string, never>> }

export default async function TermsPage({ params }: Props) {
  await params

  const cms = await db.cmsPage.findUnique({
    where: { slug: 'terms' },
  })

  if (cms?.isPublished) {
    return (
      <article className="max-w-[820px] mx-auto px-8 py-16 pb-24 prose prose-sm">
        <h1 className="text-[36px] font-semibold tracking-tight mb-2">{cms.title}</h1>
        <div
          className="text-[15px] leading-[1.7] text-ih-ink-2"
          dangerouslySetInnerHTML={{ __html: cms.body }}
        />
      </article>
    )
  }

  if (cms) {
    notFound()
  }

  return (
    <PolicyLayout slug="terms" title="Terms of Service" effectiveLine={`Effective ${EFFECTIVE_DATE} · Version 1.0`} sections={SECTIONS}>

      <PolicySectionBody id="about-these-terms" title="1. About these terms">
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the website at
          indushydraulics.com (the &ldquo;Site&rdquo;) and any goods or services supplied by Indus
          Hydraulic Power Trading LLC (&ldquo;Indus Hydraulics&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;).
          By using the Site or transacting with us, you agree to these Terms.
        </p>
      </PolicySectionBody>

      <PolicySectionBody id="quotations-and-orders" title="2. Quotations and orders">
        <p>
          We operate on a Request-for-Quotation (RFQ) basis. When you submit an RFQ through the Site or
          by email, we respond with a written Estimate that lists the line items, unit prices, lead
          times, applicable taxes, and validity period.
        </p>
        <p>
          An Estimate is an offer open for acceptance during its stated validity period and may be
          withdrawn or amended by us before acceptance. A binding contract is formed only when you
          accept an Estimate in writing (including via the email-acceptance link we provide).
        </p>
      </PolicySectionBody>

      <PolicySectionBody id="pricing-currency-and-payment" title="3. Pricing, currency, and payment">
        <p>
          All prices are quoted in UAE Dirhams (AED) unless explicitly stated otherwise on the Estimate.
          Prices are inclusive of UAE Value Added Tax where the supplier is VAT-registered; the VAT
          treatment will be itemised on the Estimate.
        </p>
        <p>
          Payment terms are stated on each Estimate. Standard terms are payment in advance for new
          accounts and net-30 days from invoice for accounts on credit terms. Late payments may attract
          interest at the rate permitted under UAE law.
        </p>
      </PolicySectionBody>

      <PolicySectionBody id="delivery-and-risk" title="4. Delivery and risk">
        <p>
          Delivery terms (Incoterms 2020) are stated on each Estimate. Title and risk transfer in
          accordance with the agreed Incoterm. Lead times are estimates given in good faith based on
          stock and supplier information at the time of quotation; we are not liable for delays caused
          by suppliers, carriers, customs, or events outside our reasonable control.
        </p>
      </PolicySectionBody>

      <PolicySectionBody id="acceptance-and-inspection" title="5. Acceptance and inspection">
        <p>
          You must inspect goods on delivery and notify us in writing of any visible damage, shortage,
          or non-conformity within seven (7) days. Concealed defects must be reported promptly upon
          discovery. After this period, goods are deemed accepted.
        </p>
      </PolicySectionBody>

      <PolicySectionBody id="warranty" title="6. Warranty">
        <p>
          We supply goods covered by the original manufacturer&apos;s warranty. Warranty terms (duration,
          coverage, and remedies) are those provided by the manufacturer and are passed through to you
          without modification. We will assist with warranty claims but do not extend cover beyond the
          manufacturer&apos;s terms.
        </p>
        <p>
          Goods supplied are intended for industrial use by qualified personnel. You are responsible
          for verifying the suitability of any product for your specific application.
        </p>
      </PolicySectionBody>

      <PolicySectionBody id="returns" title="7. Returns">
        <p>
          Goods may only be returned for valid warranty claims or where we have agreed in writing in
          advance. Special-order or non-stock items are non-returnable. Approved returns must be
          unused, in original packaging, and accompanied by the original Estimate or invoice reference.
        </p>
      </PolicySectionBody>

      <PolicySectionBody id="limitation-of-liability" title="8. Limitation of liability">
        <p>
          To the maximum extent permitted by UAE law, our total liability arising out of or in
          connection with any Estimate, order, or use of the Site shall not exceed the amount paid by
          you under the relevant Estimate. We shall not be liable for indirect, consequential, or
          economic loss including loss of production, profit, or goodwill.
        </p>
        <p>
          Nothing in these Terms limits liability for death or personal injury caused by negligence,
          for fraud, or for any other liability that cannot be excluded by law.
        </p>
      </PolicySectionBody>

      <PolicySectionBody id="intellectual-property" title="9. Intellectual property">
        <p>
          All content on the Site — including the catalogue structure, product descriptions authored by
          us, photographs, and trade dress — is owned by us or our licensors. Manufacturer datasheets,
          drawings, and brand marks remain the property of the respective manufacturers. You may
          download and print materials for legitimate evaluation, procurement, and operational use, but
          may not republish, resell, or redistribute them.
        </p>
      </PolicySectionBody>

      <PolicySectionBody id="force-majeure" title="10. Force majeure">
        <p>
          Neither party is liable for failure or delay in performance caused by events beyond
          reasonable control, including acts of government, war, civil unrest, fire, flood, pandemic,
          industrial action, transport disruption, or supplier failure. The affected party must notify
          the other promptly and resume performance as soon as practicable.
        </p>
      </PolicySectionBody>

      <PolicySectionBody id="governing-law-and-jurisdiction" title="11. Governing law and jurisdiction">
        <p>
          These Terms and any contract formed under them are governed by the laws of the United Arab
          Emirates as applied in the Emirate of Dubai. Any dispute arising shall be subject to the
          exclusive jurisdiction of the courts of Dubai, without prejudice to any mandatory consumer
          rights you may have.
        </p>
      </PolicySectionBody>

      <PolicySectionBody id="changes-to-these-terms" title="12. Changes to these terms">
        <p>
          We may update these Terms from time to time. The current version is always the version
          published at this URL with the effective date shown above. Material changes will be notified
          to active account holders by email. Continued use of the Site after changes take effect
          constitutes acceptance of the updated Terms.
        </p>
      </PolicySectionBody>

      <PolicySectionBody id="contact" title="13. Contact">
        <p>
          For questions about these Terms or any commercial matter, contact us at{' '}
          <a className="text-ih-accent hover:underline" href="mailto:sales@indushydraulics.me">
            sales@indushydraulics.me
          </a>{' '}
          or via the channels listed on our{' '}
          <a className="text-ih-accent hover:underline" href="/contact">
            contact page
          </a>
          .
        </p>
      </PolicySectionBody>

      <footer className="mt-12 pt-6 border-t border-ih-border text-[12px] text-ih-muted-2 leading-[1.6]">
        These Terms are written in plain English as a v1 reference. They are not a substitute for
        independent legal advice. For high-value or unusual engagements, the contract document supplied
        with your Estimate takes precedence over these Terms.
      </footer>
    </PolicyLayout>
  )
}

