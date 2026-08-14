import type { Metadata } from 'next'
import { db } from '@indus/db'
import { notFound } from 'next/navigation'
import { buildBreadcrumbLd, buildFaqLd } from '@indus/domain'
import { JsonLd } from '@indus/ui'
import { urlFor } from '../../../lib/seo'

export const metadata: Metadata = {
  title: 'Shipping Policy',
  description:
    'Lead times, Incoterms, documentation, and freight handling for orders shipped from our Dubai warehouse across the UAE, GCC, wider Middle East, and Africa.',
}

// Legal page rarely changes; cache for 1 hour.
export const revalidate = 3600

const EFFECTIVE_DATE = '2026-05-16'

const FAQS = [
  {
    q: 'How long does shipping take inside the UAE?',
    a: 'For items in stock at our Dubai warehouse, UAE deliveries typically arrive within 1–3 working days from dispatch. Same-day courier is available in Dubai and Sharjah for plant-down emergencies — talk to your sales engineer.',
  },
  {
    q: 'Do you ship outside the UAE?',
    a: 'Yes. We export across the GCC, wider Middle East, and Africa daily. Typical GCC delivery is 3–10 working days from dispatch. African destinations vary by lane and customs clearance. Every export ships with full documentation (commercial invoice, packing list, certificate of origin, and attestation where required).',
  },
  {
    q: 'Which Incoterms do you use?',
    a: 'We quote on Incoterms 2020. Default for UAE delivery is DAP (Delivered At Place). For exports we commonly use FOB Jebel Ali, CIF, or DAP depending on the buyer’s preference and freight forwarder. The Incoterm is stated explicitly on every Estimate.',
  },
  {
    q: 'Can I use my own freight forwarder?',
    a: 'Yes. If you have a nominated forwarder, we will hand over collection-ready packages and the full document set. Ex Works (EXW) terms are available on request.',
  },
  {
    q: 'What about hazmat or oversized items?',
    a: 'Hydraulic oils, sealants, lubricants classified as dangerous goods, and oversized assemblies (large cylinders, power packs) ship under IATA/IMDG rules where applicable and may require longer lead times. We will flag this on the Estimate before you accept.',
  },
  {
    q: 'How do I track my shipment?',
    a: 'Once dispatched, we share the carrier reference and tracking link via email and WhatsApp. For freight-forwarded shipments we coordinate handover and provide the airway bill or bill of lading.',
  },
]

type Props = { params: Promise<Record<string, never>> }

export default async function ShippingPage({ params }: Props) {
  await params

  const cms = await db.cmsPage.findUnique({
    where: { slug: 'shipping' },
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
      { name: 'Shipping', url: urlFor('/shipping') },
    ],
  })

  return (
    <article className="max-w-[820px] mx-auto px-8 py-16 pb-24 text-[var(--color-body)]">
      <JsonLd data={[faqLd, breadcrumbLd]} />

      <header className="mb-10">
        <h1 className="text-[36px] font-semibold tracking-tight mb-3">Shipping Policy</h1>
        <p className="font-mono text-[12px] text-[var(--color-muted)] tracking-[0.06em] uppercase">
          Effective {EFFECTIVE_DATE} · Version 1.0
        </p>
      </header>

      <Section title="1. Where we ship from">
        <p>
          All orders are dispatched from our headquarters and warehouse in Al Quasis, Dubai, UAE,
          operated by Indus Hydraulic Power Trading LLC. Direct factory drop-shipments from
          authorized manufacturers may also be arranged where it shortens the lead time.
        </p>
      </Section>

      <Section title="2. Lead times">
        <p>
          Lead times depend on whether the item is stock, regional, special-order, or drop-ship:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>In stock (Dubai warehouse):</strong> typically dispatched within 24 working hours
            of order confirmation. UAE delivery in 1–3 working days; same-day courier available in
            Dubai and Sharjah on request.
          </li>
          <li>
            <strong>Regional stock (authorized supplier in MENA):</strong> 3–7 working days to
            dispatch.
          </li>
          <li>
            <strong>Special-order or made-to-spec:</strong> lead times vary by manufacturer and are
            quoted on the Estimate. Hose assemblies, cylinder rebuilds, and power-pack builds
            commonly run 2–6 weeks.
          </li>
          <li>
            <strong>Drop-ship from manufacturer:</strong> follows the manufacturer’s published
            lead time plus international freight. We will flag this option on the Estimate when it
            beats our warehouse lead time.
          </li>
        </ul>
        <p>
          All lead times are good-faith estimates based on supplier confirmations at the time of
          quotation. We are not liable for delays caused by suppliers, carriers, customs, or events
          outside our reasonable control.
        </p>
      </Section>

      <Section title="3. Destinations and typical transit times">
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>UAE:</strong> 1–3 working days from dispatch.
          </li>
          <li>
            <strong>GCC (Saudi Arabia, Oman, Bahrain, Qatar, Kuwait):</strong> typically 3–10
            working days from dispatch, subject to land or air freight choice and border clearance.
          </li>
          <li>
            <strong>Wider Middle East (e.g. Jordan, Iraq, Yemen, Egypt):</strong> 5–15 working days
            depending on the lane.
          </li>
          <li>
            <strong>Africa:</strong> variable. East African ports (Mombasa, Dar es Salaam,
            Djibouti) are typically 10–20 working days by sea, faster by air. West Africa, North
            Africa, and landlocked destinations are quoted on a case-by-case basis.
          </li>
        </ul>
        <p>
          For all destinations, customs clearance, port-handling charges, and inland delivery beyond
          the Incoterm-defined point are the responsibility of the buyer unless specifically
          included on the Estimate.
        </p>
      </Section>

      <Section title="4. Incoterms 2020">
        <p>
          We quote on Incoterms 2020. The applicable Incoterm is stated explicitly on every
          Estimate; common defaults are:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>UAE deliveries:</strong> DAP (Delivered At Place) to the buyer’s site.
          </li>
          <li>
            <strong>GCC and regional exports:</strong> DAP, CIF, or FOB Jebel Ali, depending on
            buyer preference and freight forwarder.
          </li>
          <li>
            <strong>Ex Works (EXW) Dubai:</strong> available for buyers using a nominated freight
            forwarder.
          </li>
        </ul>
        <p>
          Title and risk transfer in accordance with the agreed Incoterm. See the Terms of Service
          (section on Delivery and risk) for full legal effect.
        </p>
      </Section>

      <Section title="5. Freight, insurance, and packaging">
        <p>
          Standard packaging is industrial-grade for export. For sea freight and long-haul road
          freight we use marine-grade cartons, shrink-wrapped pallets, and moisture barriers for
          ferrous items. Heat-treated pallets (ISPM 15) are used where the destination country
          requires them.
        </p>
        <p>
          Where Incoterms place insurance with us (CIF, CIP), we insure at 110% of invoice value
          against standard marine and transit risks. Where the buyer arranges freight, the buyer is
          responsible for insurance.
        </p>
      </Section>

      <Section title="6. Export documentation">
        <p>Every export shipment includes:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Commercial invoice and packing list</li>
          <li>Certificate of Origin (Dubai Chamber attested where applicable)</li>
          <li>MSDS / Safety Data Sheets for fluids, lubricants, and sealants</li>
          <li>Manufacturer Certificate of Conformity on request</li>
          <li>
            Embassy or destination-country attestation, free-sale certificates, or pre-shipment
            inspection (PSI / SONCAP / SASO / SABS) handled on request — additional lead time and
            charges apply
          </li>
        </ul>
      </Section>

      <Section title="7. Hazardous and oversized items">
        <p>
          Hydraulic oils, greases, sealants, cleaning chemicals, and certain accumulators are
          classified as dangerous goods. They ship under IATA, IMDG, or ADR rules depending on the
          mode of transport. Some lanes (notably air) restrict or prohibit certain classes — we
          will flag this on the Estimate and propose an alternative routing where possible.
        </p>
        <p>
          Oversized items such as large hydraulic cylinders, power packs, and skid-mounted systems
          may require open-top container, flat-rack, or breakbulk freight. We will quote freight
          separately for these.
        </p>
      </Section>

      <Section title="8. Tracking and delivery confirmation">
        <p>
          Once dispatched, we share the carrier reference and tracking link by email and WhatsApp.
          For freight-forwarded shipments we coordinate handover and provide the airway bill (AWB)
          or bill of lading (BL). Proof of delivery is provided on request after the shipment is
          marked delivered by the carrier.
        </p>
      </Section>

      <Section title="9. Damaged, short, or wrong-item shipments">
        <p>
          You must inspect goods on delivery and notify us in writing of any visible damage,
          shortage, or non-conformity within seven (7) days. Take photos of damaged packaging and
          contents before unpacking further, and retain all packaging until we confirm next steps.
          Concealed defects must be reported promptly upon discovery. See the{' '}
          <a className="text-[var(--color-accent)] hover:underline" href="/returns">
            Returns Policy
          </a>{' '}
          for the RMA process.
        </p>
      </Section>

      <Section title="10. Contact">
        <p>
          For shipping or freight queries, contact our logistics desk at{' '}
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
        This policy is the customer-facing companion to section 4 (Delivery and risk) of our{' '}
        <a className="underline" href="/terms">
          Terms of Service
        </a>
        . Where the Estimate or contract document differs, those take precedence.
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
