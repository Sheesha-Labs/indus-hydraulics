import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@indus/db'
import {
  buildBreadcrumbLd,
  buildServiceLd,
  serviceAreaBySlug,
  serviceAreasOrdered,
} from '@indus/domain'
import { JsonLd, LeadCapturePanel, buildMailtoHref, buildWhatsappHref } from '@indus/ui'
import { ORG_ID, SITE_NAME, pageMetadata, urlFor } from '../../../../lib/seo'
import { getStoreSettings } from '../../../../lib/store-settings'

type Props = { params: Promise<{ slug: string }> }

/*
 * No `generateStaticParams` on purpose — see /p/[slug] for the full note.
 * Short version: every route under (storefront) currently builds as `ƒ`
 * (dynamic), so listing params here rendered 9 service-area pages at build time and
 * threw every one away. Re-add the list together with the change that makes
 * the storefront layout statically renderable; `revalidate` above stays put
 * for the same reason.
 */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const area = serviceAreaBySlug(slug)
  if (!area) return {}
  return pageMetadata({
    title: `Hydraulic hose service in ${area.name}`,
    description: area.summary,
    path: `/locations/${area.slug}`,
  })
}

/**
 * Service-area page.
 *
 * Emits `Service` with `areaServed`, never `LocalBusiness` — a coverage area
 * is not premises, and site-locations.ts warns that asserting an unverified
 * location risks a false-business-presence penalty. There is one verified
 * office and it is in Dubai.
 *
 * No response-time commitment appears anywhere. A published arrival time is an
 * operational promise, and assistants repeat it back to customers.
 */
export default async function ServiceAreaPage({ params }: Props) {
  const { slug } = await params
  const area = serviceAreaBySlug(slug)
  if (!area) notFound()

  const [articles, categories, settings] = await Promise.all([
    db.blogPost.findMany({
      where: { slug: { in: area.relatedArticles }, isPublished: true },
      select: { slug: true, title: true, excerpt: true, readingMinutes: true },
    }),
    db.category.findMany({
      where: { slug: { in: area.relatedCategories }, isPublished: true },
      select: { slug: true, name: true, shortDescription: true },
    }),
    getStoreSettings(),
  ])

  // Preserve the curated order rather than whatever the database returned.
  const orderedArticles = area.relatedArticles
    .map((s) => articles.find((a) => a.slug === s))
    .filter((a): a is NonNullable<typeof a> => Boolean(a))

  const pageUrl = urlFor(`/locations/${area.slug}`)

  return (
    <main className="mx-auto max-w-[var(--spacing-max-w)] px-[var(--spacing-page-gutter)]">
      <JsonLd
        data={[
          buildServiceLd({
            name: `Hydraulic hose service in ${area.name}`,
            description: area.summary,
            url: pageUrl,
            areaServed: [area.name],
            providerId: ORG_ID,
            providerName: SITE_NAME,
            serviceType: 'Hydraulic hose assembly and repair',
          }),
          buildBreadcrumbLd({
            items: [
              { name: 'Home', url: urlFor('/') },
              { name: 'Service areas', url: urlFor('/locations') },
              { name: area.name, url: pageUrl },
            ],
          }),
        ]}
      />

      <nav className="mono flex items-center gap-2 pt-8 text-[12px] text-ih-muted">
        <Link href="/" className="hover:text-ih-ink">Home</Link>
        <span className="opacity-40">/</span>
        <Link href="/locations" className="hover:text-ih-ink">Service areas</Link>
        <span className="opacity-40">/</span>
        <span className="text-ih-ink">{area.name}</span>
      </nav>

      <header className="max-w-[760px] py-8">
        <p className="mono mb-3 text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
          {area.region}
        </p>
        <h1 className="mb-4 font-serif text-[clamp(30px,4.5vw,46px)] font-normal leading-[1.1] tracking-[-0.02em]">
          Hydraulic hose service in {area.name}
        </h1>
        <p className="text-[17px] leading-[1.6] text-ih-muted">{area.intro}</p>
      </header>

      <div className="grid grid-cols-1 items-start gap-10 pb-12 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <section className="mb-10">
            <h2 className="mb-4 text-[22px] font-semibold tracking-[-0.01em]">
              Where we work in {area.name}
            </h2>
            <ul className="mb-6 flex list-none flex-wrap gap-2 p-0">
              {area.zones.map((zone) => (
                <li
                  key={zone}
                  className="mono rounded-md border border-ih-border bg-ih-surface px-3 py-1.5 text-[12px] text-ih-ink-2"
                >
                  {zone}
                </li>
              ))}
            </ul>
            <h3 className="mb-2.5 text-[16px] font-semibold">What we mostly see here</h3>
            <ul className="flex list-none flex-col gap-2 p-0">
              {area.demand.map((item) => (
                <li key={item} className="flex gap-3 text-[14.5px] leading-[1.55] text-ih-ink-2">
                  <span aria-hidden="true" className="mono shrink-0 text-ih-accent">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-10 rounded-lg border-l-4 border-ih-accent bg-ih-surface-2 p-5">
            <p className="mono mb-1.5 text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
              What sets the timeline here
            </p>
            <p className="mb-1.5 text-[15px] font-semibold text-ih-ink">{area.constraint.label}</p>
            <p className="text-[14px] leading-[1.6] text-ih-ink-2">{area.constraint.detail}</p>
          </section>

          {orderedArticles.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-4 text-[22px] font-semibold tracking-[-0.01em]">
                Worth reading before you call
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {orderedArticles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/blog/${article.slug}`}
                    className="group flex min-w-0 flex-col rounded-lg border border-ih-border bg-ih-surface p-4 transition-colors hover:border-ih-accent"
                  >
                    <h3 className="mb-1.5 text-[15px] font-semibold leading-[1.3] text-ih-ink group-hover:text-ih-accent">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="line-clamp-2 text-[13px] leading-[1.5] text-ih-muted">
                        {article.excerpt}
                      </p>
                    )}
                    {article.readingMinutes && (
                      <p className="mono mt-auto pt-2 text-[11px] text-ih-muted-2">
                        {article.readingMinutes} min read
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-24">
          <div className="rounded-lg border border-ih-border bg-ih-surface p-5">
            <p className="mono mb-2.5 text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
              What to have ready
            </p>
            <ul className="flex list-none flex-col gap-1.5 p-0 text-[13.5px] leading-[1.5] text-ih-ink-2">
              <li>Bore, and the hose grade if the layline is legible</li>
              <li>Both fitting types, and the angle between them</li>
              <li>Overall length</li>
              <li>Whether the site needs a permit or induction</li>
            </ul>
            <p className="mt-3 text-[12.5px] leading-[1.5] text-ih-muted-2">
              That determines whether the parts are already on the van — which is the difference
              between one visit and two.
            </p>
          </div>

          {categories.length > 0 && (
            <div className="rounded-lg border border-ih-border bg-ih-surface p-5">
              <p className="mono mb-2.5 text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
                Stocked ranges
              </p>
              <ul className="flex list-none flex-col gap-2 p-0">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/c/${c.slug}`}
                      className="text-[14px] font-medium text-ih-ink hover:text-ih-accent"
                    >
                      {c.name} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      <div className="pb-16">
        <LeadCapturePanel
          heading={`Machine down in ${area.name}?`}
          body="Tell us where it is, what failed and whether the site needs a permit. We will tell you plainly whether it is an on-site job or a bay job before anyone travels."
          whatsappUrl={buildWhatsappHref(settings.contactPhone, `On-site hose service — ${area.name}`)}
          emailUrl={buildMailtoHref(settings.contactEmail, `On-site hose service enquiry — ${area.name}`)}
          phone={settings.contactPhone}
          quoteLabel="Request on-site service"
        />
      </div>

      <nav className="border-t border-ih-border py-8" aria-label="Other service areas">
        <p className="mono mb-3 text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
          Other areas we service
        </p>
        <div className="flex flex-wrap gap-2">
          {serviceAreasOrdered()
            .filter((a) => a.slug !== area.slug)
            .map((a) => (
              <Link
                key={a.slug}
                href={`/locations/${a.slug}`}
                className="rounded-md border border-ih-border bg-ih-surface px-3.5 py-2 text-[13px] text-ih-ink-2 transition-colors hover:border-ih-accent hover:text-ih-accent"
              >
                {a.name}
              </Link>
            ))}
        </div>
      </nav>
    </main>
  )
}
