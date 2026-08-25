import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { db } from '@indus/db'
import {
  buildBreadcrumbLd,
  buildServiceLd,
  designedIndustryPage,
  designedIndustrySlugs,
  industryMarketReach,
  type DesignedIndustryPage,
} from '@indus/domain'
import { Breadcrumb, JsonLd, LeadCapturePanel, buildWhatsappHref, buildMailtoHref } from '@indus/ui'
import DesignedIndustryLanding from '../../../../components/industries/DesignedIndustryLanding'
import MarketReachSection from '../../../../components/markets/MarketReachSection'
import { mediaUrl } from '../../../../lib/media'
import { ORG_ID, SITE_NAME, pageMetadata, urlFor } from '../../../../lib/seo'
import { getIndustryBySlug } from '../../../../lib/industry-content'
import { getStoreSettings } from '../../../../lib/store-settings'

/**
 * TWO LAYOUTS, ONE ROUTE — the same split `/markets/[slug]` uses.
 *
 * A slug with a record in `DESIGNED_INDUSTRY_PAGES` renders the designed page:
 * its own sections, its own photography and its own enquiry form, all held in
 * code. Every other slug renders the DB-backed template below, driven by
 * editable columns on the `industries` row.
 *
 * The designed page is checked FIRST and never touches the table, so it does
 * not need a row to exist and cannot be unpublished into a 404 from the admin
 * while its nav entry and index card — which come from the same record — stay
 * up. Route, card, nav entry and sitemap URL ship and revert together.
 *
 * Structured data is emitted here rather than inside either layout so the two
 * cannot drift apart on schema.
 */

/** Founding year, matching the industries index. Feeds the `{years}` token. */
const FOUNDING_YEAR = 2003

// The per-industry hero gradient and its chip tint are gone with the dark
// hero band — see the note on the hero section below. `Industry.gradient`
// remains in the schema; retiring the column is a data change of its own.

type Props = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  /*
    Present so the designed pages are built ahead and served from the
    incremental cache. `dynamicParams` stays on, so the six DB-backed
    industries still render on first hit and cache from there.
  */
  return designedIndustrySlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  const designed = designedIndustryPage(slug)
  if (designed) {
    return pageMetadata({
      title: designed.seo.title,
      description: designed.seo.description,
      path: `/industries/${slug}`,
    })
  }

  const ind = await getIndustryBySlug(slug)
  if (!ind) return {}
  return pageMetadata({
    title: ind.seoTitle ?? ind.name,
    description: ind.seoDescription ?? ind.description ?? null,
    path: `/industries/${slug}`,
    canonicalUrl: ind.canonicalUrl,
    robots: { index: ind.robotsIndex, follow: ind.robotsFollow },
    ogImagePath: ind.ogImageStoragePath,
  })
}

export default async function IndustryPage({ params }: Props) {
  const { slug } = await params

  const designed = designedIndustryPage(slug)
  if (designed) return renderDesigned(designed)

  const [ind, settings] = await Promise.all([getIndustryBySlug(slug), getStoreSettings()])
  if (!ind) notFound()

  // Featured products come from two signals on the Industry row:
  //   1. featuredProductSkus — explicit editor-curated SKUs (preferred).
  //   2. featuredCategorySlugs — fallback when SKUs aren't curated yet.
  // Once the editor curates SKUs the explicit list wins so the page
  // doesn't bounce between curated + auto-pulled products.
  const featuredProducts = await (async () => {
    if (ind.featuredProductSkus.length > 0) {
      const rows = await db.product.findMany({
        where: { sku: { in: ind.featuredProductSkus }, status: 'active' },
        include: {
          brand: { select: { name: true, slug: true } },
          images: { orderBy: { position: 'asc' }, take: 1, include: { media: true } },
        },
        take: 8,
      })
      // Preserve admin ordering by sku.
      const bySku = new Map(rows.map((r) => [r.sku, r]))
      return ind.featuredProductSkus.flatMap((sku) => {
        const row = bySku.get(sku)
        return row ? [row] : []
      })
    }
    if (ind.featuredCategorySlugs.length > 0) {
      return db.product.findMany({
        where: {
          status: 'active',
          category: { slug: { in: ind.featuredCategorySlugs } },
        },
        include: {
          brand: { select: { name: true, slug: true } },
          images: { orderBy: { position: 'asc' }, take: 1, include: { media: true } },
        },
        take: 8,
        orderBy: { updatedAt: 'desc' },
      })
    }
    return []
  })()

  const heroUrl = ind.ogImageStoragePath ? mediaUrl(ind.ogImageStoragePath) : null
  const breadcrumb = ind.breadcrumb ?? ind.name.toUpperCase()
  const reach = industryMarketReach(ind.slug)

  return (
    <div>
      {/*
        Hero — restructured, not restyled.

        This was a full-bleed dark band tinted by a per-industry `gradient`
        column, which is a v1 device: it made every vertical a different
        colour and put warm brown behind a blue language. 02-screen-index.md
        §04 specifies the opposite — a LIGHT split on the page ground, with
        the single dark panel saved for the support band at the foot. That
        ordering is what makes the navy band read as an emphasis rather than
        as more chrome.

        `Industry.gradient` is left in the schema and simply no longer drives
        the hero; retiring the column is a data change for its own PR.
      */}
      <section className="border-ih-border bg-ih-surface border-b">
        <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 xl:px-12">
          <div className="mb-6">
            <Breadcrumb
              items={[
                { label: 'Industries', href: '/industries' },
                { label: breadcrumb ?? ind.name },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.25fr_1fr]">
            <div>
              {ind.headline && (
                <h1 className="mb-4 max-w-[16ch] text-balance font-serif text-[clamp(34px,4.5vw,50px)] font-normal leading-[1.05] tracking-[-0.01em]">
                  {ind.headline}
                </h1>
              )}
              {ind.description && (
                <p className="text-ih-ink-2 mb-7 max-w-[620px] text-[16px] leading-[1.6]">
                  {ind.description}
                </p>
              )}
              {ind.chips.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {ind.chips.map((chip) => (
                    <span
                      key={chip}
                      className="border-ih-border bg-ih-surface-2 text-ih-ink-2 inline-flex h-[26px] items-center rounded-full border px-3 font-mono text-[10.5px] uppercase tracking-[0.08em]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 4:3 per the artboard. Real photography replaces this. */}
            <div className="border-ih-border bg-ih-surface-2 relative aspect-[4/3] overflow-hidden rounded-xl border">
              {heroUrl ? (
                <Image
                  src={heroUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              ) : (
                <span className="text-ih-muted-2 absolute inset-0 grid place-items-center px-6 text-center font-mono text-[10.5px] uppercase tracking-[0.1em]">
                  {ind.name}
                </span>
              )}
            </div>
          </div>

          {/* Stat row — the rule-topped device, 4 up. */}
          {ind.stats.length > 0 && (
            <div className="mt-12 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
              {ind.stats.map((stat) => (
                <div key={stat.label} className="border-ih-accent border-t-2 pt-3.5">
                  <div className="font-mono text-[30px] tabular-nums leading-none tracking-[-0.03em]">
                    {stat.value}
                  </div>
                  <div className="text-ih-muted mt-2.5 font-mono text-[10.5px] uppercase leading-normal tracking-[0.1em]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Where we deliver ──────────────────────────────────── */}
      {ind.deliveryAreas.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 xl:px-12">
          <h2 className="mb-6 text-[28px] font-semibold tracking-[-0.02em]">Where we deliver</h2>
          {/* Four stat cards leave each cell 66px wide at 360px, holding content
              that needs 105px — the text spilled out of the cells and the page
              scrolled. Two up on a phone. */}
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
            {ind.deliveryAreas.map((area) => (
              <div key={area.category} className="border-ih-border bg-ih-surface border p-5">
                <div className="text-ih-accent mb-2 font-mono text-[11px] uppercase tracking-[0.1em]">
                  {area.category}
                </div>
                <h3 className="mb-1.5 text-[17px] font-semibold leading-snug">{area.title}</h3>
                <p className="text-ih-muted mb-2.5 text-[13px] leading-[1.5]">{area.description}</p>
                <div className="text-ih-muted font-mono text-[11px]">{area.skuCount} →</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured SKUs ─────────────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-5 pb-10 sm:px-8 xl:px-12">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-[28px] font-semibold tracking-[-0.02em]">{ind.name}-rated SKUs</h2>
            <Link href={`/c`} className="text-ih-accent text-[13px] hover:underline">
              All {ind.name} SKUs →
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {featuredProducts.map((product) => {
              const img = product.images[0]
              return (
                <Link
                  key={product.id}
                  href={`/p/${product.slug}`}
                  className="border-ih-border bg-ih-surface hover:border-ih-accent flex flex-col overflow-hidden border transition-colors"
                >
                  <div className="bg-ih-surface-2 border-ih-border relative aspect-square overflow-hidden border-b">
                    {img ? (
                      <Image
                        src={mediaUrl(img.media.storagePath)}
                        alt={product.title}
                        fill
                        className="object-contain p-3"
                        sizes="(max-width: 1360px) 25vw, 320px"
                      />
                    ) : (
                      <div className="text-ih-muted absolute inset-0 grid place-items-center font-mono text-[10px]">
                        IMG
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="text-ih-muted font-mono text-[10px]">{product.sku}</div>
                    <div className="mb-1 mt-0.5 line-clamp-2 text-[13px] font-medium leading-snug">
                      {product.title}
                    </div>
                    {product.brand && (
                      <div className="text-ih-muted font-mono text-[10px]">
                        {product.brand.name}
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Reference installs (case studies) ─────────────────── */}
      {ind.caseStudies.length > 0 && (
        <section className="bg-ih-surface border-ih-border mt-8 border-b border-t py-14">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12">
            <div className="text-ih-muted mb-2 font-mono text-[11px] uppercase tracking-[0.14em]">
              Reference installs
            </div>
            <h2 className="mb-6 text-[32px] font-semibold tracking-[-0.02em]">
              A few of the projects we serve
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {ind.caseStudies.map((cs) => (
                <article key={cs.id} className="bg-ih-bg border-ih-border overflow-hidden border">
                  <div className="bg-ih-surface-2 border-ih-border relative grid aspect-[16/10] place-items-center overflow-hidden border-b">
                    {cs.imageUrl ? (
                      <Image
                        src={mediaUrl(cs.imageUrl)}
                        alt={cs.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1360px) 33vw, 420px"
                      />
                    ) : (
                      <span className="text-ih-muted font-mono text-[10px]">CASE</span>
                    )}
                  </div>
                  <div className="p-[18px]">
                    <div className="text-ih-muted font-mono text-[11px] uppercase tracking-[0.08em]">
                      {cs.tag}
                    </div>
                    <h3 className="mb-2 mt-1.5 text-[18px] font-semibold leading-snug">
                      {cs.title}
                    </h3>
                    <p className="text-ih-ink-2 text-[13px] leading-[1.5]">{cs.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Lead capture ──────────────────────────────────────────
          The historic gap on this template: high-intent organic
          traffic ("oil & gas hydraulics UAE") with no conversion
          path. CTAs are pre-baked with industry context so the
          email subject + WhatsApp text land already framed. */}
      <LeadCapturePanel
        heading={`Quoting a project in ${ind.name}?`}
        body={`Tell our applications team what you're specifying. We reply within one business day with availability, lead time and a fixed-price quote — no obligation.`}
        whatsappUrl={buildWhatsappHref(settings.contactPhone, `Enquiry: ${ind.name} project`)}
        emailUrl={buildMailtoHref(settings.contactEmail, `${ind.name} project enquiry`)}
        phone={settings.contactPhone}
      />

      {/* ── Support section ───────────────────────────────────── */}
      {ind.supportBlock && (
        <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 xl:px-12">
          <div className="grid grid-cols-2 items-center gap-12">
            <div>
              <div className="text-ih-muted mb-2 font-mono text-[11px] uppercase tracking-[0.14em]">
                {ind.supportBlock.eyebrow}
              </div>
              <h2 className="mb-3.5 text-[32px] font-semibold leading-snug tracking-[-0.02em]">
                {ind.supportBlock.headline}
              </h2>
              <p className="text-ih-ink-2 mb-4 text-[15px] leading-[1.6]">
                {ind.supportBlock.description}
              </p>
              <ul className="mb-6 flex flex-col gap-2 text-[14px]">
                {ind.supportBlock.bullets.map((b) => (
                  <li key={b}>✓ {b}</li>
                ))}
              </ul>
              <Link
                href={`/contact`}
                className="bg-ih-accent inline-flex h-11 items-center px-6 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
              >
                {ind.supportBlock.cta}
              </Link>
            </div>
            <div className="bg-ih-surface-2 border-ih-border grid aspect-[4/3] place-items-center border">
              <span className="text-ih-muted font-mono text-[11px]">
                {ind.name.toUpperCase()} SERVICE TEAM
              </span>
            </div>
          </div>
        </section>
      )}
      {/*
        Last band before the page ends. An industry page argues "we understand
        this sector"; the honest close to that is where we actually supply it.
        Full-width `section` variant, not the article aside — at 1440px the
        aside is a very long grey box with four short lines in it.
      */}
      {reach && (
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12">
          <MarketReachSection reach={reach} variant="section" />
        </div>
      )}
    </div>
  )
}

/**
 * The designed layout, plus the structured data that goes with it.
 *
 * `Service` and not `Product`: the four families are a supply capability
 * described by connection method, not four SKUs with a price, an availability
 * and an identifier. Emitting `Product` without `offers` for something that
 * cannot be added to a basket is the kind of markup that gets a site's rich
 * results turned off. `areaServed` is the UAE as a `Country`, matching the
 * market pages — we ship from Dubai and hold no premises anywhere else.
 */
async function renderDesigned(page: DesignedIndustryPage) {
  const settings = await getStoreSettings()
  const yearsInBusiness = new Date().getFullYear() - FOUNDING_YEAR
  const pageUrl = urlFor(`/industries/${page.slug}`)
  const designedReach = industryMarketReach(page.slug)

  return (
    <>
      <JsonLd
        data={buildBreadcrumbLd({
          items: [
            { name: 'Home', url: urlFor('/') },
            { name: 'Industries', url: urlFor('/industries') },
            { name: page.card.name, url: pageUrl },
          ],
        })}
      />
      {page.families.items.map((family) => (
        <JsonLd
          key={family.title}
          data={buildServiceLd({
            name: `${family.title} for data centre liquid cooling`,
            description: family.includes,
            url: `${pageUrl}#product-families`,
            areaServed: [{ name: 'United Arab Emirates', type: 'Country' }],
            providerId: ORG_ID,
            providerName: SITE_NAME,
            serviceType: 'Stainless steel component supply',
          })}
        />
      ))}

      <DesignedIndustryLanding
        page={page}
        yearsInBusiness={yearsInBusiness}
        contactPhone={settings.contactPhone}
        contactEmail={settings.contactEmail}
        whatsappHref={buildWhatsappHref(settings.contactPhone, `Enquiry: ${page.card.name}`)}
        mailtoHref={buildMailtoHref(settings.contactEmail, `${page.card.name} project enquiry`)}
      />

      {/* Same container the designed page's own bands use — see SECTION in
          DesignedIndustryLanding. Rendered here rather than inside it so the
          two industry layouts close on the same section from one call site. */}
      {designedReach && (
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12">
          <MarketReachSection reach={designedReach} variant="section" />
        </div>
      )}
    </>
  )
}
