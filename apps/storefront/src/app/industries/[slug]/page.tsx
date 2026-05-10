import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { db } from '@indus/db'
import { mediaUrl } from '../../../lib/media'
import { pageMetadata } from '../../../lib/seo'
import { getIndustryBySlug } from '../../../lib/industry-content'

// Default gradient used when an industry row has no per-row gradient.
const DEFAULT_GRADIENT = 'linear-gradient(160deg,oklch(0.2 0.02 240),oklch(0.16 0.015 245))'

// Lightened-band colour used behind chip badges in the hero.
// Centralised here so it always sits a couple of steps off the hero
// gradient regardless of which industry is rendering.
const CHIP_TINT = 'oklch(0.32 0.02 240)'

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
  const ind = await getIndustryBySlug(slug)
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

  const gradient = ind.gradient ?? DEFAULT_GRADIENT
  const breadcrumb = ind.breadcrumb ?? ind.name.toUpperCase()

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section
        style={{
          background: gradient,
          color: 'white',
          padding: '64px 0 80px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'repeating-linear-gradient(0deg,transparent,transparent 38px,oklch(1 0 0 / 0.04) 38px,oklch(1 0 0 / 0.04) 39px)',
            pointerEvents: 'none',
          }}
        />
        <div className="max-w-[1360px] mx-auto px-8" style={{ position: 'relative' }}>
          <div className="font-mono text-[11px] tracking-[0.16em] text-[var(--color-accent)] uppercase mb-2">
            <Link href={`/industries`} className="text-[var(--color-accent)] hover:opacity-80">
              INDUSTRIES
            </Link>
            {' / '}
            {breadcrumb}
          </div>
          {ind.headline && (
            <h1 className="text-[72px] tracking-[-0.03em] leading-[1] text-white font-semibold max-w-[900px] mt-2 mb-3.5">
              {ind.headline}
            </h1>
          )}
          {ind.description && (
            <p className="text-[18px] max-w-[680px] mb-7 leading-[1.55]" style={{ color: 'oklch(0.78 0 0)' }}>
              {ind.description}
            </p>
          )}
          {ind.chips.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-8">
              {ind.chips.map((chip) => (
                <span
                  key={chip}
                  className="font-mono text-[12px] px-3 py-1.5"
                  style={{ background: CHIP_TINT, color: 'oklch(0.9 0 0)', borderRadius: '14px' }}
                >
                  {chip}
                </span>
              ))}
            </div>
          )}
          {ind.stats.length > 0 && (
            <div className="grid gap-12 font-mono" style={{ gridTemplateColumns: `repeat(${ind.stats.length},auto)` }}>
              {ind.stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-[36px] font-semibold text-white">{stat.value}</div>
                  <div className="text-[11px] tracking-[0.08em] uppercase mt-0.5" style={{ color: 'oklch(0.7 0 0)' }}>
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
        <section className="max-w-[1360px] mx-auto px-8 py-12">
          <h2 className="text-[28px] tracking-[-0.02em] font-semibold mb-6">Where we deliver</h2>
          <div className="grid grid-cols-4 gap-3.5">
            {ind.deliveryAreas.map((area) => (
              <div key={area.category} className="p-5 border border-[var(--color-border)] bg-[var(--color-elevated)]">
                <div className="font-mono text-[11px] tracking-[0.1em] text-[var(--color-accent)] uppercase mb-2">
                  {area.category}
                </div>
                <h3 className="text-[17px] font-semibold mb-1.5 leading-snug">{area.title}</h3>
                <p className="text-[13px] text-[var(--color-muted)] leading-[1.5] mb-2.5">{area.description}</p>
                <div className="font-mono text-[11px] text-[var(--color-muted)]">{area.skuCount} →</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured SKUs ─────────────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section className="max-w-[1360px] mx-auto px-8 pb-10">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-[28px] tracking-[-0.02em] font-semibold">{ind.name}-rated SKUs</h2>
            <Link href={`/c`} className="text-[13px] text-[var(--color-accent)] hover:underline">
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
                  className="flex flex-col border border-[var(--color-border)] bg-[var(--color-elevated)] hover:border-[var(--color-body)] transition-colors overflow-hidden"
                >
                  <div className="aspect-square bg-[var(--color-deep)] border-b border-[var(--color-border)] relative overflow-hidden">
                    {img ? (
                      <Image
                        src={mediaUrl(img.media.storagePath)}
                        alt={product.title}
                        fill
                        className="object-contain p-3"
                        sizes="(max-width: 1360px) 25vw, 320px"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center font-mono text-[10px] text-[var(--color-muted)]">IMG</div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="font-mono text-[10px] text-[var(--color-muted)]">{product.sku}</div>
                    <div className="text-[13px] font-medium mt-0.5 mb-1 leading-snug line-clamp-2">{product.title}</div>
                    {product.brand && <div className="font-mono text-[10px] text-[var(--color-muted)]">{product.brand.name}</div>}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Reference installs (case studies) ─────────────────── */}
      {ind.caseStudies.length > 0 && (
        <section className="bg-[var(--color-elevated)] border-t border-b border-[var(--color-border)] py-14 mt-8">
          <div className="max-w-[1360px] mx-auto px-8">
            <div className="font-mono text-[11px] tracking-[0.14em] text-[var(--color-muted)] uppercase mb-2">
              Reference installs
            </div>
            <h2 className="text-[32px] tracking-[-0.02em] font-semibold mb-6">A few of the projects we serve</h2>
            <div className="grid grid-cols-3 gap-4">
              {ind.caseStudies.map((cs) => (
                <article key={cs.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
                  <div className="aspect-[16/10] bg-[var(--color-deep)] border-b border-[var(--color-border)] grid place-items-center relative overflow-hidden">
                    {cs.imageUrl ? (
                      <Image src={mediaUrl(cs.imageUrl)} alt={cs.title} fill className="object-cover" sizes="(max-width: 1360px) 33vw, 420px" />
                    ) : (
                      <span className="font-mono text-[10px] text-[var(--color-muted)]">CASE</span>
                    )}
                  </div>
                  <div className="p-[18px]">
                    <div className="font-mono text-[11px] text-[var(--color-muted)] tracking-[0.08em] uppercase">{cs.tag}</div>
                    <h3 className="text-[18px] font-semibold mt-1.5 mb-2 leading-snug">{cs.title}</h3>
                    <p className="text-[13px] text-[var(--color-body)] leading-[1.5]">{cs.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Support section ───────────────────────────────────── */}
      {ind.supportBlock && (
        <section className="max-w-[1360px] mx-auto px-8 py-14">
          <div className="grid grid-cols-2 gap-12 items-center">
            <div>
              <div className="font-mono text-[11px] tracking-[0.14em] text-[var(--color-muted)] uppercase mb-2">
                {ind.supportBlock.eyebrow}
              </div>
              <h2 className="text-[32px] tracking-[-0.02em] font-semibold mb-3.5 leading-snug">{ind.supportBlock.headline}</h2>
              <p className="text-[var(--color-body)] mb-4 leading-[1.6] text-[15px]">{ind.supportBlock.description}</p>
              <ul className="flex flex-col gap-2 text-[14px] mb-6">
                {ind.supportBlock.bullets.map((b) => (
                  <li key={b}>✓ {b}</li>
                ))}
              </ul>
              <Link
                href={`/contact`}
                className="inline-flex items-center h-11 px-6 bg-[var(--color-accent)] text-white text-[14px] font-medium hover:opacity-90 transition-opacity"
              >
                {ind.supportBlock.cta}
              </Link>
            </div>
            <div className="aspect-[4/3] bg-[var(--color-deep)] border border-[var(--color-border)] grid place-items-center">
              <span className="font-mono text-[11px] text-[var(--color-muted)]">{ind.name.toUpperCase()} SERVICE TEAM</span>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
