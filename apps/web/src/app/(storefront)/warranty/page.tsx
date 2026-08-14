import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@indus/db'
import { notFound } from 'next/navigation'
import { buildBreadcrumbLd, buildFaqLd } from '@indus/domain'
import { JsonLd } from '@indus/ui'
import { urlFor } from '../../../lib/seo'

export const metadata: Metadata = {
  title: 'Warranty Policy',
  description:
    'Manufacturer warranty pass-through, claims process, and exclusions for hydraulic products supplied by Indus Hydraulics — an authorized distributor for Parker, Bosch Rexroth, Yuken, HYDAC, and other industry-leading brands.',
}

// Legal page rarely changes; cache for 1 hour.
export const revalidate = 3600

const EFFECTIVE_DATE = '2026-05-16'

const FAQS = [
  {
    q: 'How long is the warranty?',
    a: 'We pass through the original manufacturer’s warranty without modification. For most industrial hydraulic products this is 12 months from delivery, though some product families (e.g. certain Parker and Bosch Rexroth lines) carry longer coverage. The exact term for your product is stated on the Estimate or product datasheet.',
  },
  {
    q: 'Which manufacturers do you administer warranty for?',
    a: 'As an authorized distributor we administer manufacturer warranty claims for Parker Hannifin, Bosch Rexroth, Yuken, HYDAC, Stauff, Eaton Vickers, Atos, Sun Hydraulics, and the other brands listed on our brands page. We handle the claim end-to-end with the manufacturer on your behalf.',
  },
  {
    q: 'What does the warranty cover?',
    a: 'Defects in materials and workmanship under normal industrial use within the product’s rated operating conditions — pressure, temperature, fluid compatibility, and duty cycle as specified by the manufacturer.',
  },
  {
    q: 'What is excluded?',
    a: 'Misuse or operation outside rated specifications, contamination, improper installation, modification, use of non-genuine spares, normal wear-and-tear items (seals, filter elements, gaskets), damage from external causes, and consumables.',
  },
  {
    q: 'How do I file a warranty claim?',
    a: 'Email sales@indushydraulics.com within seven days of fault discovery. Include the Estimate or invoice number, product serial / batch number, photos of the failure, operating conditions at the time of failure, and installation context. We will issue an RMA and coordinate the manufacturer’s technical evaluation.',
  },
  {
    q: 'What remedies are available?',
    a: 'Repair, replacement, or credit — at the manufacturer’s discretion based on their evaluation. The remedy applied is the standard remedy under the manufacturer’s warranty terms. We do not extend cover beyond what the manufacturer offers.',
  },
]

type Props = { params: Promise<Record<string, never>> }

export default async function WarrantyPage({ params }: Props) {
  await params

  const cms = await db.cmsPage.findUnique({
    where: { slug: 'warranty' },
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

  const faqLd = buildFaqLd({ faqs: FAQS.map((f) => ({ question: f.q, answer: f.a })) })
  const breadcrumbLd = buildBreadcrumbLd({
    items: [
      { name: 'Home', url: urlFor('/') },
      { name: 'Warranty', url: urlFor('/warranty') },
    ],
  })

  return (
    <article className="max-w-[820px] mx-auto px-8 py-16 pb-24 text-[var(--color-body)]">
      <JsonLd data={[faqLd, breadcrumbLd]} />

      <header className="mb-10">
        <h1 className="text-[36px] font-semibold tracking-tight mb-3">Warranty Policy</h1>
        <p className="font-mono text-[12px] text-[var(--color-muted)] tracking-[0.06em] uppercase">
          Effective {EFFECTIVE_DATE} · Version 1.0
        </p>
      </header>

      <Section title="1. Our role as an authorized distributor">
        <p>
          Indus Hydraulic Power Trading LLC is an authorized distributor for the manufacturers
          whose products we supply. Every product is sold with the original manufacturer’s warranty
          and we administer warranty claims end-to-end with the manufacturer on your behalf. We do
          not modify, extend, or reduce the manufacturer’s warranty terms.
        </p>
        <p>
          We operate under an ISO 9001:2015 quality management system and supply only genuine,
          factory-new product unless otherwise stated explicitly on the Estimate.
        </p>
      </Section>

      <Section title="2. Manufacturers we administer warranty for">
        <p>
          As an authorized distributor we handle warranty claims for the brands listed on our{' '}
          <Link className="text-[var(--color-accent)] hover:underline" href="/brands">
            brands page
          </Link>
          , including:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Parker Hannifin</li>
          <li>Bosch Rexroth</li>
          <li>Yuken</li>
          <li>HYDAC</li>
          <li>Stauff</li>
          <li>Eaton Vickers</li>
          <li>Atos</li>
          <li>Sun Hydraulics</li>
        </ul>
        <p>
          For brands where we are not the appointed authorized distributor in your country, we will
          tell you on the Estimate and route the warranty claim through the manufacturer’s
          designated regional channel.
        </p>
      </Section>

      <Section title="3. Warranty period">
        <p>
          The warranty period is set by the manufacturer of each product. Typical periods are:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Standard industrial hydraulics:</strong> 12 months from delivery against
            defects in material and workmanship.
          </li>
          <li>
            <strong>Selected pumps, motors, and valves:</strong> 18–24 months for certain Parker
            and Bosch Rexroth product families. Check the product datasheet or Estimate.
          </li>
          <li>
            <strong>Wear items (seals, filter elements, gaskets, O-rings, hose-end fittings used
            with hose assemblies):</strong> covered against manufacturing defect only, not against
            normal service life.
          </li>
        </ul>
        <p>
          The exact warranty period and any product-specific conditions are stated on the
          manufacturer’s warranty document supplied with the product, on the Estimate, or on the
          product datasheet, and that document governs over this page in case of conflict.
        </p>
      </Section>

      <Section title="4. What is covered">
        <p>
          Defects in materials and workmanship under normal industrial use within the product’s
          rated operating conditions:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Operating pressure within the maximum rated working pressure</li>
          <li>Operating temperature within the rated range</li>
          <li>Fluid type and viscosity compatible with the product’s seal and material spec</li>
          <li>Duty cycle and installation orientation as specified</li>
          <li>Cleanliness standard (ISO 4406 / NAS 1638) maintained per manufacturer guidance</li>
        </ul>
      </Section>

      <Section title="5. What is excluded">
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Operation outside the rated pressure, temperature, fluid, or duty-cycle
            specifications
          </li>
          <li>
            Contamination of hydraulic fluid (particulate, water ingress, chemical) caused by the
            user’s system
          </li>
          <li>
            Improper installation, including incorrect alignment, undersized lines, missing or
            inadequate filtration, and start-up without prescribed flushing
          </li>
          <li>
            Modification, repair, or disassembly by anyone other than the manufacturer or a party
            authorized in writing by us or by the manufacturer
          </li>
          <li>Use of non-genuine spares, seals, or fluids</li>
          <li>
            Normal wear-and-tear items (seals, gaskets, filter elements, hose flex life, paint
            finish)
          </li>
          <li>
            Damage from external causes — collision, dropping, fire, flood, power surges, force
            majeure
          </li>
          <li>Consumables (oils, lubricants, sealants, cleaning chemicals) after opening</li>
          <li>
            Cosmetic damage that does not affect function and is not present at the point of
            delivery
          </li>
        </ul>
      </Section>

      <Section title="6. Claims process">
        <ol className="list-decimal pl-6 space-y-1">
          <li>
            <strong>Notify us within 7 days</strong> of discovering the fault. Email{' '}
            <a className="text-[var(--color-accent)] hover:underline" href="mailto:sales@indushydraulics.com">
              sales@indushydraulics.com
            </a>{' '}
            with the Estimate or invoice number, product part number and serial / batch number,
            photographs of the failure, the operating conditions at the time of failure
            (pressure, temperature, fluid, hours in service), and the installation context.
          </li>
          <li>
            <strong>Initial assessment:</strong> We respond within five (5) business days with one
            of three outcomes — request for additional information, RMA for return-for-evaluation,
            or direct authorization for field replacement on routine items.
          </li>
          <li>
            <strong>Return for technical evaluation:</strong> Where the manufacturer requires the
            failed unit for inspection, we issue an RMA and packaging instructions. The unit is
            returned to us at the buyer’s cost (we cover return freight where the failure is
            clearly within warranty on visual inspection).
          </li>
          <li>
            <strong>Manufacturer evaluation:</strong> The unit is forwarded to the manufacturer’s
            technical service centre. Evaluation typically takes 2–6 weeks depending on the brand
            and the failure mode.
          </li>
          <li>
            <strong>Resolution:</strong> If accepted under warranty, the manufacturer provides
            repair, replacement, or credit at their discretion. If rejected (e.g. found to be a
            misuse or installation issue), we share the manufacturer’s report and quote any
            chargeable repair separately.
          </li>
        </ol>
      </Section>

      <Section title="7. Remedies">
        <p>
          The remedy under a successful warranty claim is repair, replacement, or credit — at the
          manufacturer’s discretion. We will not provide consequential cover beyond what the
          manufacturer offers (such as loss of production, downtime, or third-party labour costs).
          See the Limitation of Liability section of our{' '}
          <a className="text-[var(--color-accent)] hover:underline" href="/terms">
            Terms of Service
          </a>
          .
        </p>
      </Section>

      <Section title="8. Field service and emergency support">
        <p>
          For hydraulic systems we supplied and commissioned, our technicians can attend on site to
          assess a failure under warranty. Travel, accommodation, and time are charged at standard
          rates unless covered under a separate service contract. Where the failure is found to be
          within warranty, the manufacturer typically reimburses agreed labour rates per their
          policy.
        </p>
      </Section>

      <Section title="9. Contact">
        <p>
          To start a warranty claim or ask a coverage question, contact us at{' '}
          <a className="text-[var(--color-accent)] hover:underline" href="mailto:sales@indushydraulics.com">
            sales@indushydraulics.com
          </a>{' '}
          or via the channels on our{' '}
          <a className="text-[var(--color-accent)] hover:underline" href="/contact">
            contact page
          </a>
          .
        </p>
      </Section>

      <footer className="mt-12 pt-6 border-t border-[var(--color-border)] text-[12px] text-[var(--color-caption)] leading-[1.6]">
        This policy is the customer-facing companion to section 6 (Warranty) of our{' '}
        <a className="underline" href="/terms">
          Terms of Service
        </a>{' '}
        and is administered alongside our{' '}
        <a className="underline" href="/returns">
          Returns Policy
        </a>
        . Where a manufacturer’s warranty document or your contract differs from this page, that
        document takes precedence.
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
