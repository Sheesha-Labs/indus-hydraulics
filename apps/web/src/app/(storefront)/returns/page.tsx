import type { Metadata } from 'next'
import { db } from '@indus/db'
import { notFound } from 'next/navigation'
import { buildBreadcrumbLd, buildFaqLd } from '@indus/domain'
import { JsonLd } from '@indus/ui'
import { urlFor } from '../../../lib/seo'

export const metadata: Metadata = {
  title: 'Returns & RMA Policy',
  description:
    'Inspection windows, RMA process, restocking fees, and non-returnable items for industrial hydraulic products supplied by Indus Hydraulics.',
}

// Legal page rarely changes; cache for 1 hour.
export const revalidate = 3600

const EFFECTIVE_DATE = '2026-05-16'

const FAQS = [
  {
    q: 'What is your return window?',
    a: 'You have 7 calendar days from delivery to report visible damage, shortage, or non-conformity. For change-of-mind returns of stock items in original packaging, the window is 30 days from delivery with a Return Material Authorization (RMA) from our team.',
  },
  {
    q: 'What is non-returnable?',
    a: 'Special-order items, cut-to-length hose assemblies, custom-built power packs, supplier-locked SKUs, items that have been installed or commissioned, and opened lubricants, oils, or sealants. These can still be replaced under warranty if they prove defective.',
  },
  {
    q: 'Is there a restocking fee?',
    a: 'A 15% restocking fee applies to change-of-mind returns of stock items in original packaging. The fee is waived if the return is due to our error (wrong item shipped, mis-packed, or short-shipped).',
  },
  {
    q: 'Who pays the return freight?',
    a: 'For change-of-mind returns the buyer pays return freight to our Dubai warehouse. For wrong-item, damaged, or short shipments we arrange and pay collection.',
  },
  {
    q: 'How fast is the credit or replacement?',
    a: 'We decide on every RMA request within 5 business days. After we receive and inspect the returned goods at our Dubai warehouse, credit or replacement is issued within 10 business days.',
  },
  {
    q: 'How do I start a return?',
    a: 'Email sales@indushydraulics.me with the Estimate number, the items concerned, and photos where applicable. We will issue a written RMA with return instructions before you ship anything back. Unauthorized returns are not accepted.',
  },
]

type Props = { params: Promise<Record<string, never>> }

export default async function ReturnsPage({ params }: Props) {
  await params

  const cms = await db.cmsPage.findUnique({
    where: { slug: 'returns' },
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
      { name: 'Returns', url: urlFor('/returns') },
    ],
  })

  return (
    <article className="max-w-[820px] mx-auto px-8 py-16 pb-24 text-[var(--color-body)]">
      <JsonLd data={[faqLd, breadcrumbLd]} />

      <header className="mb-10">
        <h1 className="text-[36px] font-semibold tracking-tight mb-3">Returns &amp; RMA Policy</h1>
        <p className="font-mono text-[12px] text-[var(--color-muted)] tracking-[0.06em] uppercase">
          Effective {EFFECTIVE_DATE} · Version 1.0
        </p>
      </header>

      <Section title="1. How returns work in our business">
        <p>
          We supply industrial hydraulic equipment to operators, OEMs, and service contractors. Our
          returns policy reflects that — it is more permissive than a typical consumer policy when
          we have made an error, and more restrictive than a typical consumer policy for change of
          mind on items that have been removed from inventory specifically for your order.
        </p>
        <p>
          All returns require a written Return Material Authorization (RMA) from us before goods
          are shipped back. Returns without an RMA are refused at our dock and the buyer remains
          responsible for the goods and any freight incurred.
        </p>
      </Section>

      <Section title="2. Inspection window — damage, shortage, wrong item">
        <p>
          You must inspect goods on delivery and notify us in writing of any visible damage,
          shortage, or non-conformity within <strong>seven (7) calendar days</strong> of delivery.
          Please retain all packaging and take photographs of any damage before unpacking further.
          Concealed defects must be reported promptly upon discovery. After this window, goods are
          deemed accepted.
        </p>
      </Section>

      <Section title="3. Returnable items">
        <p>Stock items may be returned within thirty (30) calendar days of delivery if they are:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Unused and uninstalled</li>
          <li>In their original packaging, with seals and labels intact</li>
          <li>Accompanied by the original Estimate or invoice reference and a written RMA from us</li>
          <li>In resaleable condition on inspection at our Dubai warehouse</li>
        </ul>
      </Section>

      <Section title="4. Non-returnable items">
        <p>
          The following items cannot be returned for credit. They may still be replaced under
          warranty if they prove defective — see our{' '}
          <a className="text-[var(--color-accent)] hover:underline" href="/warranty">
            Warranty Policy
          </a>
          .
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Special-order, made-to-spec, or drop-ship items.</strong> Anything ordered
            specifically against your RFQ from a manufacturer or supplier, including non-stock
            seal kits and configured valves.
          </li>
          <li>
            <strong>Cut-to-length hose assemblies and crimped fittings.</strong> Once cut or
            crimped to your specification, these cannot be returned to stock.
          </li>
          <li>
            <strong>Custom-built power packs, manifolds, and skid-mounted systems.</strong>
          </li>
          <li>
            <strong>Opened lubricants, oils, greases, and sealants.</strong> Unopened, factory-
            sealed containers may be returnable subject to inspection.
          </li>
          <li>
            <strong>Installed or commissioned items.</strong> Goods that have been fitted, put into
            service, or had their protective covers removed in an installation context.
          </li>
          <li>
            <strong>Supplier-locked SKUs.</strong> Items the manufacturer will not accept back from
            us as a distributor.
          </li>
        </ul>
      </Section>

      <Section title="5. Restocking fee">
        <p>
          A <strong>15% restocking fee</strong> applies to change-of-mind returns of stock items.
          The fee is calculated on the unit price of the returned items and is deducted from the
          credit issued.
        </p>
        <p>The restocking fee is waived where the return is caused by:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Our error in picking, packing, or labelling</li>
          <li>A short shipment or missing item</li>
          <li>Transit damage where we arranged the freight (CIF / DAP / CIP terms)</li>
          <li>A warranted defect within the manufacturer’s warranty period</li>
        </ul>
      </Section>

      <Section title="6. Return freight">
        <p>
          For change-of-mind returns and for warranty claims, the buyer arranges and pays return
          freight to our Dubai warehouse unless we agree otherwise in writing. For wrong-item,
          short, or damaged shipments where Indus is at fault, we arrange and pay collection.
        </p>
        <p>
          Returns must be packaged to the same standard they were shipped in. We are not liable for
          further damage caused by inadequate return packaging.
        </p>
      </Section>

      <Section title="7. RMA process and timelines">
        <ol className="list-decimal pl-6 space-y-1">
          <li>
            <strong>Request:</strong> Email{' '}
            <a className="text-[var(--color-accent)] hover:underline" href="mailto:sales@indushydraulics.me">
              sales@indushydraulics.me
            </a>{' '}
            with the Estimate or invoice number, the items concerned, quantities, and reason for
            return. Include photographs for damage or wrong-item claims.
          </li>
          <li>
            <strong>Decision:</strong> We respond with an RMA decision within five (5) business
            days. Approved RMAs include the return address, packaging instructions, and any
            applicable restocking-fee notice.
          </li>
          <li>
            <strong>Return shipment:</strong> Ship the goods back per the RMA instructions, with
            the RMA number on the outside of the package.
          </li>
          <li>
            <strong>Inspection and resolution:</strong> On receipt at our Dubai warehouse we
            inspect within five (5) business days. Credit, refund to the original payment method,
            or replacement is issued within ten (10) business days of inspection.
          </li>
        </ol>
      </Section>

      <Section title="8. Refunds and credits">
        <p>
          For accounts on credit terms, approved returns are issued as a credit note against the
          original invoice. For prepaid orders, the refund is issued to the original payment
          method, net of any restocking fee. Bank charges or currency-conversion losses on
          international refunds are at the buyer’s cost.
        </p>
      </Section>

      <Section title="9. Contact">
        <p>
          For all return and RMA queries, contact our customer service team at{' '}
          <a className="text-[var(--color-accent)] hover:underline" href="mailto:sales@indushydraulics.me">
            sales@indushydraulics.me
          </a>{' '}
          or via the channels on our{' '}
          <a className="text-[var(--color-accent)] hover:underline" href="/contact">
            contact page
          </a>
          .
        </p>
      </Section>

      <footer className="mt-12 pt-6 border-t border-[var(--color-border)] text-[12px] text-[var(--color-caption)] leading-[1.6]">
        This policy is the customer-facing companion to section 7 (Returns) of our{' '}
        <a className="underline" href="/terms">
          Terms of Service
        </a>
        . Where the Estimate or contract document differs, those take precedence. Manufacturer
        defect claims are handled under our{' '}
        <a className="underline" href="/warranty">
          Warranty Policy
        </a>
        .
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
