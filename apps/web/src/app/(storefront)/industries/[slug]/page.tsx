import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { db } from '@indus/db'
import { Breadcrumb, LeadCapturePanel, buildWhatsappHref, buildMailtoHref } from '@indus/ui'
import { mediaUrl } from '../../../../lib/media'
import { pageMetadata } from '../../../../lib/seo'
import { getIndustryBySlug } from '../../../../lib/industry-content'
import { getStoreSettings } from '../../../../lib/store-settings'

// The per-industry hero gradient and its chip tint are gone with the dark
// hero band — see the note on the hero section below. `Industry.gradient`
// remains in the schema; retiring the column is a data change of its own.

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
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
      <section className="border-b border-ih-border bg-ih-surface">
        <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 xl:px-12">
          <div className="mb-6">
            <Breadcrumb
              items={[
                { label: 'Industries', href: '/industries' },
                { label: breadcrumb ?? ind.name },
              ]}
            />
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-[1.25fr_1fr]">
            <div>
              {ind.headline && (
                <h1 className="mb-4 max-w-[16ch] text-balance font-serif text-[clamp(34px,4.5vw,50px)] font-normal leading-[1.05] tracking-[-0.01em]">
                  {ind.headline}
                </h1>
              )}
              {ind.description && (
                <p className="mb-7 max-w-[620px] text-[16px] leading-[1.6] text-ih-ink-2">{ind.description}</p>
              )}
              {ind.chips.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {ind.chips.map((chip) => (
                    <span
                      key={chip}
                      className="inline-flex h-[26px] items-center rounded-full border border-ih-border bg-ih-surface-2 px-3 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ih-ink-2"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 4:3 per the artboard. Real photography replaces this. */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-ih-border bg-ih-surface-2">
              {heroUrl ? (
                <Image src={heroUrl} alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 40vw" />
              ) : (
                <span className="absolute inset-0 grid place-items-center px-6 text-center font-mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted-2">
                  {ind.name}
                </span>
              )}
            </div>
          </div>

          {/* Stat row — the rule-topped device, 4 up. */}
          {ind.stats.length > 0 && (
            <div
              className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-4"
            >
              {ind.stats.map((stat) => (
                <div key={stat.label} className="border-t-2 border-ih-accent pt-3.5">
                  <div className="font-mono text-[30px] leading-none tracking-[-0.03em] tabular-nums">{stat.value}</div>
                  <div className="mt-2.5 font-mono text-[10.5px] uppercase leading-normal tracking-[0.1em] text-ih-muted">
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
        <section className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12 py-12">
          <h2 className="text-[28px] tracking-[-0.02em] font-semibold mb-6">Where we deliver</h2>
          <div className="grid grid-cols-4 gap-3.5">
            {ind.deliveryAreas.map((area) => (
              <div key={area.category} className="p-5 border border-ih-border bg-ih-surface">
                <div className="font-mono text-[11px] tracking-[0.1em] text-ih-accent uppercase mb-2">
                  {area.category}
                </div>
                <h3 className="text-[17px] font-semibold mb-1.5 leading-snug">{area.title}</h3>
                <p className="text-[13px] text-ih-muted leading-[1.5] mb-2.5">{area.description}</p>
                <div className="font-mono text-[11px] text-ih-muted">{area.skuCount} →</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured SKUs ─────────────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12 pb-10">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-[28px] tracking-[-0.02em] font-semibold">{ind.name}-rated SKUs</h2>
            <Link href={`/c`} className="text-[13px] text-ih-accent hover:underline">
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
                  className="flex flex-col border border-ih-border bg-ih-surface hover:border-ih-accent transition-colors overflow-hidden"
                >
                  <div className="aspect-square bg-ih-surface-2 border-b border-ih-border relative overflow-hidden">
                    {img ? (
                      <Image
                        src={mediaUrl(img.media.storagePath)}
                        alt={product.title}
                        fill
                        className="object-contain p-3"
                        sizes="(max-width: 1360px) 25vw, 320px"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center font-mono text-[10px] text-ih-muted">IMG</div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="font-mono text-[10px] text-ih-muted">{product.sku}</div>
                    <div className="text-[13px] font-medium mt-0.5 mb-1 leading-snug line-clamp-2">{product.title}</div>
                    {product.brand && <div className="font-mono text-[10px] text-ih-muted">{product.brand.name}</div>}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Reference installs (case studies) ─────────────────── */}
      {ind.caseStudies.length > 0 && (
        <section className="bg-ih-surface border-t border-b border-ih-border py-14 mt-8">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12">
            <div className="font-mono text-[11px] tracking-[0.14em] text-ih-muted uppercase mb-2">
              Reference installs
            </div>
            <h2 className="text-[32px] tracking-[-0.02em] font-semibold mb-6">A few of the projects we serve</h2>
            <div className="grid grid-cols-3 gap-4">
              {ind.caseStudies.map((cs) => (
                <article key={cs.id} className="bg-ih-bg border border-ih-border overflow-hidden">
                  <div className="aspect-[16/10] bg-ih-surface-2 border-b border-ih-border grid place-items-center relative overflow-hidden">
                    {cs.imageUrl ? (
                      <Image src={mediaUrl(cs.imageUrl)} alt={cs.title} fill className="object-cover" sizes="(max-width: 1360px) 33vw, 420px" />
                    ) : (
                      <span className="font-mono text-[10px] text-ih-muted">CASE</span>
                    )}
                  </div>
                  <div className="p-[18px]">
                    <div className="font-mono text-[11px] text-ih-muted tracking-[0.08em] uppercase">{cs.tag}</div>
                    <h3 className="text-[18px] font-semibold mt-1.5 mb-2 leading-snug">{cs.title}</h3>
                    <p className="text-[13px] text-ih-ink-2 leading-[1.5]">{cs.description}</p>
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
        <section className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12 py-14">
          <div className="grid grid-cols-2 gap-12 items-center">
            <div>
              <div className="font-mono text-[11px] tracking-[0.14em] text-ih-muted uppercase mb-2">
                {ind.supportBlock.eyebrow}
              </div>
              <h2 className="text-[32px] tracking-[-0.02em] font-semibold mb-3.5 leading-snug">{ind.supportBlock.headline}</h2>
              <p className="text-ih-ink-2 mb-4 leading-[1.6] text-[15px]">{ind.supportBlock.description}</p>
              <ul className="flex flex-col gap-2 text-[14px] mb-6">
                {ind.supportBlock.bullets.map((b) => (
                  <li key={b}>✓ {b}</li>
                ))}
              </ul>
              <Link
                href={`/contact`}
                className="inline-flex items-center h-11 px-6 bg-ih-accent text-white text-[14px] font-medium hover:opacity-90 transition-opacity"
              >
                {ind.supportBlock.cta}
              </Link>
            </div>
            <div className="aspect-[4/3] bg-ih-surface-2 border border-ih-border grid place-items-center">
              <span className="font-mono text-[11px] text-ih-muted">{ind.name.toUpperCase()} SERVICE TEAM</span>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
