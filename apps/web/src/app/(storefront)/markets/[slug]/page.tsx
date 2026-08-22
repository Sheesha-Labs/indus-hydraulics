import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@indus/db'
import { buildBreadcrumbLd, buildServiceLd, marketBySlug, marketCountryName, marketsOrdered } from '@indus/domain'
import { JsonLd, LeadCapturePanel, buildMailtoHref, buildWhatsappHref } from '@indus/ui'
import { ORG_ID, SITE_NAME, pageMetadata, urlFor } from '../../../../lib/seo'
import { getStoreSettings } from '../../../../lib/store-settings'

type Props = { params: Promise<{ slug: string }> }

export const revalidate = 3600

/**
 * Present so the route uses the incremental cache at all — without a
 * `generateStaticParams` a dynamic route is served `no-store`. Only a couple
 * are built ahead; `dynamicParams` lets the rest render on first hit and cache
 * from there. See /p/[slug] for the full reasoning and the build-time cost.
 */
export function generateStaticParams() {
  return marketsOrdered().slice(0, 2).map((m) => ({ slug: m.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const market = marketBySlug(slug)
  if (!market) return {}
  return pageMetadata({
    title: `Hydraulic & Industrial Hose Supplier in ${market.name}`,
    description: market.summary,
    path: `/markets/${market.slug}`,
  })
}

/**
 * Export-market page.
 *
 * Emits `Service` with `areaServed` typed as `Country`, never `LocalBusiness`.
 * We ship to these markets from Dubai and hold no premises in any of them —
 * see the warning in lib/site-locations.ts. `AdministrativeArea`, which the
 * service-area pages use, is a subdivision type and would be wrong here.
 *
 * The bulk of the page is the catalogue section list, built from the live
 * category tree rather than written by hand. That is deliberate: it means the
 * headings a buyer searches for ("industrial hose supplier in Oman") sit above
 * a real, current list of what we actually stock, and the page cannot drift
 * out of date as the catalogue changes.
 */
export default async function MarketPage({ params }: Props) {
  const { slug } = await params
  const market = marketBySlug(slug)
  if (!market) notFound()

  const [topLevel, settings] = await Promise.all([
    db.category.findMany({
      where: { isPublished: true, parentId: null },
      orderBy: { position: 'asc' },
      select: {
        slug: true,
        name: true,
        shortDescription: true,
        children: {
          where: { isPublished: true },
          orderBy: { position: 'asc' },
          select: { slug: true, name: true },
        },
      },
    }),
    getStoreSettings(),
  ])

  // A top-level category with neither children nor a description has nothing
  // to say on this page, and an empty heading is worse than no heading.
  const sections = topLevel.filter((c) => c.children.length > 0 || c.shortDescription)

  const others = marketsOrdered().filter((m) => m.slug !== market.slug)
  const enquiry = `Export enquiry — ${market.name}`

  return (
    <div className="mx-auto w-full max-w-[1180px] px-6">
      <JsonLd
        data={[
          buildServiceLd({
            name: `Hydraulic and industrial hose supply to ${market.name}`,
            description: market.summary,
            url: urlFor(`/markets/${market.slug}`),
            areaServed: [{ name: marketCountryName(market), type: 'Country' }],
            providerId: ORG_ID,
            providerName: SITE_NAME,
            serviceType: 'Export supply of hydraulic and industrial hose, fittings and adapters',
          }),
          buildBreadcrumbLd({
            items: [
              { name: 'Home', url: urlFor('/') },
              { name: 'Export markets', url: urlFor('/markets') },
              { name: market.name, url: urlFor(`/markets/${market.slug}`) },
            ],
          }),
        ]}
      />

      <nav className="mono flex items-center gap-2 pt-8 text-[12px] text-ih-muted">
        <Link href="/" className="hover:text-ih-ink">Home</Link>
        <span className="opacity-40">/</span>
        <Link href="/markets" className="hover:text-ih-ink">Export markets</Link>
        <span className="opacity-40">/</span>
        <span className="text-ih-ink">{market.name}</span>
      </nav>

      <header className="max-w-[760px] py-8">
        <p className="mono mb-3 text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
          Export from Dubai
        </p>
        <h1 className="mb-4 font-serif text-[clamp(30px,4.5vw,46px)] font-normal leading-[1.1] tracking-[-0.02em]">
          Hydraulic &amp; industrial hose supplier in {market.name}
        </h1>
        <p className="text-[17px] leading-[1.6] text-ih-muted">{market.intro}</p>
      </header>

      <section className="mb-12 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-ih-border bg-ih-border sm:grid-cols-2 lg:grid-cols-4">
        <Fact label="Typical transit" value={market.leadTime} />
        <Fact label="Freight" value={market.routes.join(' · ')} />
        <Fact label="Incoterms 2020" value={market.incoterms.join(' · ')} />
        <Fact label="Documentation" value={market.conformity.join(' · ')} />
      </section>

      <section className="mb-12 max-w-[760px] rounded-lg border-l-4 border-ih-accent bg-ih-surface-2 p-6">
        <h2 className="mb-2.5 text-[20px] font-semibold tracking-[-0.01em]">
          {market.context.heading}
        </h2>
        <p className="text-[15px] leading-[1.65] text-ih-ink-2">{market.context.body}</p>
      </section>

      <section className="mb-12">
        <h2 className="mb-3 text-[26px] font-semibold tracking-[-0.015em]">
          What we supply to {market.name}
        </h2>
        <p className="mb-8 max-w-[720px] text-[15px] leading-[1.6] text-ih-muted">
          Everything below ships from the same Dubai warehouse, so a mixed order travels as one
          consignment under one set of documents. Follow any heading through to the full range,
          specifications and an RFQ.
        </p>

        <div className="flex flex-col gap-8">
          {sections.map((section) => (
            <div key={section.slug} className="border-t border-ih-border pt-5">
              <h3 className="mb-1.5 text-[19px] font-semibold tracking-[-0.01em]">
                <Link href={`/c/${section.slug}`} className="hover:text-ih-accent">
                  {section.name} supplier in {market.name}
                </Link>
              </h3>
              {section.shortDescription && (
                <p className="mb-3.5 max-w-[720px] text-[14.5px] leading-[1.55] text-ih-muted">
                  {section.shortDescription}
                </p>
              )}
              {section.children.length > 0 && (
                <ul className="flex list-none flex-wrap gap-x-2 gap-y-2 p-0">
                  {section.children.map((child) => (
                    <li key={child.slug}>
                      <Link
                        href={`/c/${child.slug}`}
                        className="mono inline-block rounded-md border border-ih-border bg-ih-surface px-3 py-1.5 text-[12px] text-ih-ink-2 transition-colors hover:border-ih-accent hover:text-ih-ink"
                      >
                        {child.name} in {market.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12 max-w-[760px]">
        <h2 className="mb-3 text-[22px] font-semibold tracking-[-0.01em]">
          How an order to {market.name} works
        </h2>
        <ol className="flex list-none flex-col gap-3 p-0">
          {[
            'Send the part numbers, or the bore, thread and pressure if you do not have them. A photo of the failed part is usually enough.',
            'We quote in AED against real stock, with the Incoterm stated on the Estimate rather than assumed.',
            `Once accepted, documents are prepared for ${market.name} before the consignment leaves Dubai.`,
            'Goods dispatch by road or air, and you get the paperwork and tracking together.',
          ].map((step, i) => (
            <li key={step} className="flex gap-3.5 text-[14.5px] leading-[1.55] text-ih-ink-2">
              <span className="mono shrink-0 text-[12px] font-medium text-ih-accent">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="pb-16">
        <LeadCapturePanel
          heading={`Shipping to ${market.name}?`}
          body="Send the part numbers, or the bore, thread and pressure if you do not have them. We quote from real stock, in AED, with the Incoterm stated rather than assumed."
          whatsappUrl={buildWhatsappHref(settings.contactPhone, enquiry)}
          emailUrl={buildMailtoHref(settings.contactEmail, `${enquiry} enquiry`)}
          phone={settings.contactPhone}
          quoteLabel="Request an export quote"
        />
      </div>

      <section className="border-t border-ih-border py-8">
        <p className="mono mb-3 text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
          Other export markets
        </p>
        <ul className="flex list-none flex-wrap gap-2 p-0">
          {others.map((m) => (
            <li key={m.slug}>
              <Link
                href={`/markets/${m.slug}`}
                className="mono inline-block rounded-md border border-ih-border bg-ih-surface px-3 py-1.5 text-[12px] text-ih-ink-2 transition-colors hover:border-ih-accent hover:text-ih-ink"
              >
                {m.name}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/locations"
              className="mono inline-block rounded-md border border-ih-border bg-ih-surface px-3 py-1.5 text-[12px] text-ih-ink-2 transition-colors hover:border-ih-accent hover:text-ih-ink"
            >
              On-site service in the UAE
            </Link>
          </li>
        </ul>
      </section>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ih-surface p-4">
      <p className="mono mb-1.5 text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
        {label}
      </p>
      <p className="text-[13.5px] leading-[1.5] text-ih-ink-2">{value}</p>
    </div>
  )
}
