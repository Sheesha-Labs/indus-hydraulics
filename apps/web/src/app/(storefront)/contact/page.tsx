import type { Metadata } from 'next'
import { Fragment, type ReactNode } from 'react'
import Link from 'next/link'
import { db } from '@indus/db'
import {
  buildBreadcrumbLd,
  buildFaqLd,
  buildLocalBusinessLd,
  interpolate,
  list,
  str,
  visibleList,
} from '@indus/domain'
import { JsonLd } from '@indus/ui'
import ContactFormClient from './ContactFormClient'
import ContactChannels, { type Channel } from './_components/ContactChannels'
import HelpGrid, { type HelpTile } from './_components/HelpGrid'
import HqMap from './_components/HqMap'
import { parseOpeningHours } from './_components/hours'
import { getMasterPageContent } from '../../../lib/page-content'
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
 * The response promises repeated in the channel notes.
 *
 * The hero tiles state the same three promises and are edited under Pages &
 * Blocks; these are the prose forms that appear inside a sentence, and they
 * stay in code because a channel with no value set is dropped entirely rather
 * than shown blank — the note and the channel are one unit.
 */
const RESPONSE = {
  whatsapp: 'typically under 15 minutes',
  email: 'within 4 business hours',
  plantDown: 'within 30 minutes, 24/7',
} as const

export default async function ContactPage({ params }: Props) {
  await params
  const [settings, content] = await Promise.all([
    getStoreSettings(),
    // Section order, visibility and copy, edited under Pages & Blocks.
    getMasterPageContent('contact'),
  ])
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

  const hero = content.values('hero')
  const channelsCopy = content.values('channels')
  const office = content.values('office')
  const help = content.values('help')
  const faq = content.values('faq')

  const heroStats = list<{ value?: string; label?: string }>(hero, 'stats')
  const faqs = list<{ q?: string; a?: string }>(faq, 'items')
  const helpTiles: HelpTile[] = visibleList<{
    name?: string
    desc?: string
    href?: string
    icon?: string
  }>(help, 'items')
    // A tile with no link is a dead card, so it is dropped rather than
    // rendered as an unclickable box.
    .filter((tile) => typeof tile.href === 'string' && tile.href !== '')
    .map((tile) => ({
      label: tile.name ?? '',
      sub: tile.desc ?? null,
      href: tile.href as string,
      icon: tile.icon ?? null,
    }))

  // The counter hours are a live value from settings, so the note under the
  // map interpolates rather than repeating them.
  const officeNote = interpolate(str(office, 'note'), { hours: counterHours ?? '' })

  // JSON-LD entity graph: a LocalBusiness per office (each linked back to the
  // root Organization), plus FAQPage from the FAQ section and a breadcrumb. The
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
  /*
    FAQPage schema is emitted only when the FAQ section is actually on the
    page. Google requires the answers in the markup to match visible text; an
    editor hiding the section while the schema kept claiming five questions
    would be a structured-data violation, not merely stale.
  */
  const faqLd =
    faqs.length > 0 && content.isOn('faq')
      ? buildFaqLd({ faqs: faqs.map((f) => ({ question: f.q ?? '', answer: f.a ?? '' })) })
      : null
  const breadcrumbLd = buildBreadcrumbLd({
    items: [
      { name: 'Home', url: urlFor('/') },
      { name: 'Contact', url: urlFor('/contact') },
    ],
  })

  const sections: Record<string, ReactNode> = {
    hero: (
      /* ── Hero ──────────────────────────────────────────────── */
      <section className={`${CONTAINER} border-b border-ih-border py-14`}>
        <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
          <div>
            <span className="eyebrow">{str(hero, 'eyebrow')}</span>
            {/* The v2 display pattern: a declarative sentence ending in a
                period, closing clause in italic serif. 01-design-language.md §3. */}
            <h1 className="my-4 max-w-[22ch] text-balance font-serif text-[clamp(38px,5.5vw,60px)] font-normal leading-[1.04] tracking-[-0.01em]">
              {str(hero, 'heading')}{' '}
              {str(hero, 'heading_emphasis') ? (
                <em className="italic">{str(hero, 'heading_emphasis')}</em>
              ) : null}
            </h1>
            <p className="max-w-xl text-[17px] leading-[1.55] text-ih-muted">{str(hero, 'body')}</p>
          </div>

          {/* The response promises as figures. This column is where an office
              photograph would sit; the promises are the honest stand-in, and
              they are the reason a visitor picks a channel. */}
          {heroStats.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {heroStats.map((stat, i) => (
                <div
                  key={`${stat.label ?? ''}-${i}`}
                  className="rounded-sm border border-ih-border bg-ih-surface px-4 pb-4 pt-3.5"
                >
                  <div className="whitespace-nowrap text-[clamp(17px,4.4vw,28px)] font-semibold leading-none tracking-[-0.02em]">
                    {stat.value}
                  </div>
                  <div className="mono mt-2 text-[10.5px] uppercase leading-[1.35] tracking-[0.1em] text-ih-muted">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    ),

    channels: (
      /* ── Channels + form ───────────────────────────────────── */
      <section className={`${CONTAINER} py-12 lg:py-16`}>
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="min-w-0">
            <ContactChannels
              channels={channels}
              hoursRows={hoursRows}
              hoursLabel={str(channelsCopy, 'hours_label') ?? 'Opening hours'}
            />
            {/* RFQ CTA — the one thing a contact form is worse at than a
                purpose-built page, so it is offered rather than buried. */}
            {str(channelsCopy, 'rfq_heading') ? (
              <div className="mt-8 rounded-lg border border-ih-border bg-ih-surface p-5">
                <b className="text-[14px]">{str(channelsCopy, 'rfq_heading')}</b>
                <p className="mb-3 mt-1 text-[13px] leading-[1.55] text-ih-muted">
                  {str(channelsCopy, 'rfq_body')}
                </p>
                {str(channelsCopy, 'rfq_cta_label') ? (
                  <Link
                    href={str(channelsCopy, 'rfq_cta_href') ?? '/quote'}
                    className="mono inline-flex h-9 items-center rounded-sm border border-ih-border px-4 text-[12px] text-ih-ink-2 transition-colors hover:border-ih-accent hover:text-ih-ink"
                  >
                    {str(channelsCopy, 'rfq_cta_label')}
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>

          <ContactFormClient />
        </div>
      </section>
    ),

    office: hq ? (
      /* ── Head office ───────────────────────────────────────── */
      <HqMap
        city={hq.city}
        addressLines={formatOfficeAddress(hq).split('\n')}
        mapQuery={officeMapQuery(hq)}
        note={counterHours ? officeNote : null}
        photo={hq.photo ?? null}
      />
    ) : null,

    help: (
      /* ── How can we help? ──────────────────────────────────── */
      <HelpGrid
        eyebrow={str(help, 'eyebrow')}
        heading={str(help, 'heading')}
        headingEmphasis={str(help, 'heading_emphasis')}
        body={str(help, 'body')}
        tiles={helpTiles}
      />
    ),

    faq:
      faqs.length > 0 ? (
        /* ── FAQ ───────────────────────────────────────────────── */
        <section className="border-t border-ih-border py-16">
          <div className={`${CONTAINER} grid grid-cols-1 gap-10 lg:grid-cols-[1fr_2fr] lg:gap-14`}>
            <div>
              <span className="eyebrow">{str(faq, 'eyebrow')}</span>
              <h2 className="mt-2 font-serif text-[clamp(26px,3vw,36px)] font-normal leading-[1.1] tracking-[-0.01em]">
                {str(faq, 'heading')}
              </h2>
              <p className="mt-3 text-[14px] leading-[1.6] text-ih-muted">{str(faq, 'body')}</p>
            </div>
            <div className="flex flex-col">
              {faqs.map((item, i) => (
                <details
                  key={`${item.q ?? ''}-${i}`}
                  className="group border-b border-ih-border py-[18px] first:pt-0"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                    <h3 className="flex-1 text-[16px] font-medium">{item.q}</h3>
                    <span className="mono shrink-0 text-[18px] text-ih-muted transition-colors group-open:text-ih-accent">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-[14px] leading-[1.6] text-ih-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      ) : null,
  }

  return (
    <div>
      <JsonLd
        data={[...localBusinessLds, faqLd, breadcrumbLd].filter(
          (node): node is NonNullable<typeof node> => node !== null,
        )}
      />
      {content.order.map((key) =>
        sections[key] ? <Fragment key={key}>{sections[key]}</Fragment> : null,
      )}
    </div>
  )
}
