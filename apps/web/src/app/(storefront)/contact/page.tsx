import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@indus/db'
import { buildBreadcrumbLd, buildFaqLd, buildLocalBusinessLd } from '@indus/domain'
import { JsonLd } from '@indus/ui'
import ContactFormClient from './ContactFormClient'
import ContactChannels, { type Channel } from './_components/ContactChannels'
import HelpGrid from './_components/HelpGrid'
import HqMap from './_components/HqMap'
import { parseOpeningHours } from './_components/hours'
import { BASE_URL, ORG_ID, urlFor, SITE_NAME } from '../../../lib/seo'
import { OFFICES, formatOfficeAddress, officeMapQuery } from '../../../lib/site-locations'
import { getStoreSettings } from '../../../lib/store-settings'

// Static-ish marketing page; cache for 1 hour.
export const revalidate = 3600

/** Shared page gutter. Responsive rather than the flat 48px token — this page
 *  reads on a phone in a workshop as often as on a desk. */
const CONTAINER = 'mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12'

export async function generateMetadata(): Promise<Metadata> {
  const page = await db.cmsPage.findUnique({ where: { slug: 'contact' } })
  return {
    title: page?.seoTitle ?? 'Contact',
    description: page?.seoDescription ?? 'Talk to a real applications engineer. Send us a part number, circuit diagram, or photo of the failure.',
  }
}

type Props = { params: Promise<Record<string, never>> }

/**
 * The response promises made here are also made by the channel notes and the
 * hero tiles. They are stated once, in this array, so the three cannot drift.
 */
const RESPONSE = {
  whatsapp: 'typically under 15 minutes',
  email: 'within 4 business hours',
  plantDown: 'within 30 minutes, 24/7',
} as const

const HERO_STATS = [
  { value: '< 15 min', label: 'WhatsApp reply' },
  { value: '4 hrs', label: 'Email response' },
  { value: '30 min', label: 'Plant-down callback' },
]

const FAQS = [
  { q: 'How fast do you respond to RFQs?', a: 'Routine RFQs within 1 business day. Priority within 4 working hours. Plant-down within 30 minutes, 24/7.' },
  { q: 'Do you supply to customers outside the UAE?', a: 'Yes — we ship across the GCC, wider MENA and beyond. Contact us for freight terms and lead times to your country.' },
  { q: 'Can I get a sample or trial unit?', a: 'For qualified projects above a threshold value, we can arrange trial units with a deposit. Speak to your sales engineer.' },
  { q: 'Do you offer on-site commissioning?', a: 'Yes, for hydraulic systems we supply. Our certified technicians cover major industrial sites across the UAE and partner regions.' },
  { q: 'What brands do you stock?', a: 'Bosch Rexroth, Parker Hannifin, Atos, Hydac, Stauff, Eaton Vickers, Sun Hydraulics, and more. Full brand list on our brands page.' },
]

export default async function ContactPage({ params }: Props) {
  await params
  const settings = await getStoreSettings()
  const hq = OFFICES.find((o) => o.kind === 'hq') ?? OFFICES[0]

  // Channels read live values from StoreSettings (admin-editable). When a
  // value is unset we drop the channel entirely rather than ship a
  // placeholder. WhatsApp uses the same digit-stripping pattern as the PDP CTA
  // so wa.me accepts the number.
  const phoneE164 = hq?.telephone ?? settings.contactPhone
  const phoneDigits = phoneE164 ? phoneE164.replace(/\D/g, '') : null
  const email = hq?.email ?? settings.contactEmail
  const counterHours = hq?.hoursLabel ?? settings.contactHours

  const channels: Channel[] = []
  if (phoneDigits && phoneE164) {
    channels.push({
      kind: 'whatsapp',
      label: 'WhatsApp — fastest',
      value: phoneE164,
      href: `https://wa.me/${phoneDigits}`,
      external: true,
      note: `Send a photo of the failed part or a circuit diagram. Replies ${RESPONSE.whatsapp} in working hours.`,
    })
    channels.push({
      kind: 'phone',
      label: 'Call us',
      value: phoneE164,
      href: `tel:${phoneE164.replace(/\s/g, '')}`,
      note: `Plant down? Say so on the call — we come back ${RESPONSE.plantDown}.`,
    })
  }
  if (email) {
    channels.push({
      kind: 'email',
      label: 'Email us',
      value: email,
      href: `mailto:${email}`,
      note: `Answered ${RESPONSE.email}. Attach the drawing or the part list.`,
    })
  }
  if (hq) {
    channels.push({
      kind: 'office',
      label: 'Visit the office',
      value: formatOfficeAddress(hq),
      lines: formatOfficeAddress(hq).split('\n'),
      href: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(officeMapQuery(hq))}`,
      external: true,
      note: null,
    })
  }

  // The week the hours card reads is the same array the LocalBusiness JSON-LD
  // publishes, so what a visitor is told and what Google is told cannot drift.
  const hoursRows = parseOpeningHours(hq?.openingHours ?? [])

  // JSON-LD entity graph: a LocalBusiness per office (each linked back to the
  // root Organization), plus FAQPage from the FAQS array and a breadcrumb. The
  // contact page is the canonical "where are you located" signal for Google +
  // AI search engines.
  const localBusinessLds = OFFICES.map((office) =>
    buildLocalBusinessLd({
      id: `${BASE_URL}#location-${office.slug}`,
      name: office.kind === 'hq' ? `${SITE_NAME} — ${office.city} (HQ)` : `${SITE_NAME} — ${office.city}`,
      url: urlFor('/contact'),
      telephone: office.telephone,
      email: office.email,
      address: office.address,
      openingHours: office.openingHours,
      parentOrganization: { id: ORG_ID, name: SITE_NAME },
    }),
  )
  const faqLd = buildFaqLd({ faqs: FAQS.map((f) => ({ question: f.q, answer: f.a })) })
  const breadcrumbLd = buildBreadcrumbLd({
    items: [
      { name: 'Home', url: urlFor('/') },
      { name: 'Contact', url: urlFor('/contact') },
    ],
  })

  return (
    <div>
      <JsonLd data={[...localBusinessLds, faqLd, breadcrumbLd]} />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className={`${CONTAINER} border-b border-ih-border py-14`}>
        <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
          <div>
            <span className="eyebrow">Contact · we pick up the phone</span>
            {/* The v2 display pattern: a declarative sentence ending in a
                period, closing clause in italic serif. 01-design-language.md §3. */}
            <h1 className="my-4 max-w-[22ch] text-balance font-serif text-[clamp(38px,5.5vw,60px)] font-normal leading-[1.04] tracking-[-0.01em]">
              Talk to a real <em className="italic">applications engineer.</em>
            </h1>
            <p className="max-w-xl text-[17px] leading-[1.55] text-ih-muted">
              Send us a circuit diagram, a part number, or a photo of the failure. We&apos;ll respond{' '}
              {RESPONSE.email} — often within minutes on WhatsApp.
            </p>
          </div>

          {/* The response promises as figures. This column is where an office
              photograph would sit; the promises are the honest stand-in, and
              they are the reason a visitor picks a channel. */}
          <div className="grid grid-cols-3 gap-3">
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="rounded-sm border border-ih-border bg-ih-surface px-4 pb-4 pt-3.5">
                <div className="whitespace-nowrap text-[clamp(17px,4.4vw,28px)] font-semibold leading-none tracking-[-0.02em]">
                  {stat.value}
                </div>
                <div className="mono mt-2 text-[10.5px] uppercase leading-[1.35] tracking-[0.1em] text-ih-muted">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Channels + form ───────────────────────────────────── */}
      <section className={`${CONTAINER} py-12 lg:py-16`}>
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="min-w-0">
            <ContactChannels channels={channels} hoursRows={hoursRows} hoursLabel="Opening hours" />
            {/* RFQ CTA — the one thing a contact form is worse at than a
                purpose-built page, so it is offered rather than buried. */}
            <div className="mt-8 rounded-lg border border-ih-border bg-ih-surface p-5">
              <b className="text-[14px]">Prefer to submit a formal RFQ?</b>
              <p className="mb-3 mt-1 text-[13px] leading-[1.55] text-ih-muted">
                Use the quote builder to add specific SKUs with quantities and we&apos;ll respond with
                pricing {RESPONSE.email}.
              </p>
              <Link
                href="/quote"
                className="mono inline-flex h-9 items-center rounded-sm border border-ih-border px-4 text-[12px] text-ih-ink-2 transition-colors hover:border-ih-accent hover:text-ih-ink"
              >
                Submit an RFQ →
              </Link>
            </div>
          </div>

          <ContactFormClient />
        </div>
      </section>

      {/* ── Head office ───────────────────────────────────────── */}
      {hq ? (
        <HqMap
          city={hq.city}
          addressLines={formatOfficeAddress(hq).split('\n')}
          mapQuery={officeMapQuery(hq)}
          note={counterHours ? `Counter and warehouse: ${counterHours}. Outside those hours, WhatsApp reaches the on-call engineer.` : null}
          photo={hq.photo ?? null}
        />
      ) : null}

      {/* ── How can we help? ──────────────────────────────────── */}
      <HelpGrid />

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="border-t border-ih-border py-16">
        <div className={`${CONTAINER} grid grid-cols-1 gap-10 lg:grid-cols-[1fr_2fr] lg:gap-14`}>
          <div>
            <span className="eyebrow">Before you ask</span>
            <h2 className="mt-2 font-serif text-[clamp(26px,3vw,36px)] font-normal leading-[1.1] tracking-[-0.01em]">
              Frequently asked questions
            </h2>
            <p className="mt-3 text-[14px] leading-[1.6] text-ih-muted">
              Can&apos;t find your answer? Call us or use WhatsApp — those are the fastest channels.
            </p>
          </div>
          <div className="flex flex-col">
            {FAQS.map((faq) => (
              <details key={faq.q} className="group border-b border-ih-border py-[18px] first:pt-0">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <h3 className="flex-1 text-[16px] font-medium">{faq.q}</h3>
                  <span className="mono shrink-0 text-[18px] text-ih-muted transition-colors group-open:text-ih-accent">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[14px] leading-[1.6] text-ih-muted">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
