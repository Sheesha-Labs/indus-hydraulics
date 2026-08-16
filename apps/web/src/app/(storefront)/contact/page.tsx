import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@indus/db'
import { buildBreadcrumbLd, buildFaqLd, buildLocalBusinessLd } from '@indus/domain'
import { JsonLd } from '@indus/ui'
import ContactFormClient from './ContactFormClient'
import { BASE_URL, ORG_ID, urlFor, SITE_NAME } from '../../../lib/seo'
import { OFFICES, formatOfficeAddress } from '../../../lib/site-locations'
import { getStoreSettings } from '../../../lib/store-settings'

// Static-ish marketing page; cache for 1 hour.
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const page = await db.cmsPage.findUnique({ where: { slug: 'contact' } })
  return {
    title: page?.seoTitle ?? 'Contact',
    description: page?.seoDescription ?? 'Talk to a real applications engineer. Send us a part number, circuit diagram, or photo of the failure.',
  }
}

type Props = { params: Promise<Record<string, never>> }

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

  // Channels read live values from StoreSettings (admin-editable). When
  // a value is unset we drop the channel entirely rather than ship a
  // placeholder. WhatsApp uses the same digit-stripping pattern as the
  // PDP CTA so wa.me accepts the number.
  const phoneE164 = hq?.telephone ?? settings.contactPhone
  const phoneDigits = phoneE164 ? phoneE164.replace(/\D/g, '') : null
  const email = hq?.email ?? settings.contactEmail
  const hours = hq?.hoursLabel ?? settings.contactHours
  type Channel = {
    title: string
    sub: string
    value: string
    href: string
    iconBg: string
    icon: string
    badge: string | null
    badgeColor: string
    badgeBg: string
  }
  const channels: Channel[] = []
  if (phoneDigits && phoneE164) {
    channels.push({
      title: 'WhatsApp',
      sub: 'Fastest response · typically < 15 min',
      value: phoneE164,
      href: `https://wa.me/${phoneDigits}`,
      iconBg: '#16a34a',
      icon: '💬',
      badge: 'Online now',
      badgeColor: 'oklch(0.4 0.12 150)',
      badgeBg: 'oklch(0.95 0.05 150)',
    })
  }
  if (email) {
    channels.push({
      title: 'Email',
      sub: 'Response within 4 business hours',
      value: email,
      href: `mailto:${email}`,
      iconBg: 'var(--color-ih-navy)',
      icon: '✉',
      badge: null,
      badgeColor: '',
      badgeBg: '',
    })
  }
  if (phoneE164) {
    channels.push({
      title: 'Phone',
      sub: hours ?? 'Mon–Fri · 09:00–18:00 GST',
      value: phoneE164,
      href: `tel:${phoneE164.replace(/\s/g, '')}`,
      iconBg: 'var(--color-ih-accent)',
      icon: '📞',
      badge: null,
      badgeColor: '',
      badgeBg: '',
    })
  }

  // JSON-LD entity graph: a LocalBusiness per office (each linked back to
  // the root Organization), plus FAQPage from the FAQS array and a
  // breadcrumb. The contact page is the canonical "where are you located"
  // signal for Google + AI search engines.
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
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12 pt-14 pb-6">
        <div className="font-mono text-[11px] tracking-[0.16em] text-ih-muted uppercase mb-3">CONTACT · WE PICK UP THE PHONE</div>
        <h1 className="text-[clamp(40px,5vw,60px)] tracking-[-0.03em] leading-[1.05] max-w-[780px] mb-4 font-semibold">
          Talk to a real applications engineer.
        </h1>
        <p className="text-[17px] text-ih-muted max-w-[580px] leading-[1.55]">
          Send us a circuit diagram, a part number, or a photo of the failure. We&apos;ll respond within 4 business hours — often within minutes via WhatsApp.
        </p>
      </div>

      {/* ── Main grid ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12 py-8 pb-16 grid gap-14" style={{ gridTemplateColumns: '1.1fr 1fr' }}>

        {/* ── Form card ─────────────────────────────────────── */}
        <ContactFormClient />

        {/* ── Right column: channels + offices ──────────────── */}
        <div>
          {/* Channels */}
          <div className="flex flex-col gap-3 mb-8">
            {channels.map((ch) => (
              <a
                key={ch.title}
                href={ch.href}
                className="grid gap-4 items-center p-5 border border-ih-border bg-ih-surface hover:border-ih-accent transition-colors"
                style={{ gridTemplateColumns: '44px 1fr auto' }}
              >
                <div
                  className="w-11 h-11 border grid place-items-center text-[18px]"
                  style={{ background: ch.iconBg, borderColor: ch.iconBg, color: 'white' }}
                >
                  {ch.icon}
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold">{ch.title}</h3>
                  <p className="text-[12px] text-ih-muted mt-0.5">{ch.sub}</p>
                  <div className="font-mono text-[13px] text-ih-ink mt-1">{ch.value}</div>
                </div>
                {ch.badge && (
                  <span className="font-mono text-[10px] px-1.5 py-0.5 shrink-0" style={{ background: ch.badgeBg, color: ch.badgeColor }}>
                    {ch.badge}
                  </span>
                )}
              </a>
            ))}
          </div>

          {/* Offices — single column when only one verified location, two columns otherwise. */}
          <div className="font-mono text-[10px] tracking-[0.14em] text-ih-muted uppercase mb-3">
            {OFFICES.length === 1 ? 'Our office' : 'Our offices'}
          </div>
          <div className={`grid gap-3 mb-8 ${OFFICES.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {OFFICES.map((office) => (
              <div key={office.slug} className="relative border border-ih-border bg-ih-surface p-5 flex flex-col gap-2">
                {office.kind === 'hq' && (
                  <span className="absolute top-4 right-4 font-mono text-[10px] bg-ih-navy text-white px-1.5 py-0.5 tracking-[0.06em]">HQ</span>
                )}
                <div className="font-mono text-[11px] text-ih-accent tracking-[0.06em]">{office.flag}</div>
                <h4 className="text-[16px] font-semibold tracking-[-0.01em]">{office.city}</h4>
                <address className="not-italic text-[13px] text-ih-muted leading-[1.5] whitespace-pre-line">{formatOfficeAddress(office)}</address>
                <div className="font-mono text-[11px] text-ih-muted mt-auto pt-2 border-t border-ih-border">
                  {office.hoursLabel}
                </div>
              </div>
            ))}
          </div>

          {/* RFQ CTA */}
          <div className="border border-ih-border bg-ih-surface p-5">
            <b className="text-[14px]">Prefer to submit a formal RFQ?</b>
            <p className="mt-1 text-[13px] text-ih-muted mb-3">Use our quote builder to add specific SKUs with quantities and we&apos;ll respond with pricing within 4 hours.</p>
            <Link
              href={`/quote`}
              className="inline-flex h-9 px-4 items-center border border-ih-border font-mono text-[12px] text-ih-ink-2 hover:bg-ih-surface-2 transition-colors"
            >
              Submit an RFQ →
            </Link>
          </div>
        </div>
      </div>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <div className="border-t border-ih-border py-16">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12 grid gap-14" style={{ gridTemplateColumns: '1fr 2fr' }}>
          <div>
            <h2 className="text-[32px] font-semibold tracking-[-0.02em] leading-snug">Frequently asked questions</h2>
            <p className="mt-3 text-[14px] text-ih-muted leading-[1.6]">
              Can&apos;t find your answer? Call us or use WhatsApp — we&apos;re the fastest channel.
            </p>
          </div>
          <div className="flex flex-col">
            {FAQS.map((faq) => (
              <details key={faq.q} className="border-b border-ih-border py-[18px] first:pt-0 group">
                <summary className="list-none flex justify-between items-center gap-4 cursor-pointer">
                  <h4 className="text-[16px] font-medium flex-1">{faq.q}</h4>
                  <span className="font-mono text-[18px] text-ih-muted group-open:text-ih-accent transition-colors shrink-0">+</span>
                </summary>
                <p className="mt-3 text-[14px] text-ih-muted leading-[1.6]">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
