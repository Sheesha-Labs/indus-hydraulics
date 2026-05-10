import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@indus/db'
import { buildBreadcrumbLd, buildOrgLd } from '@indus/domain'
import { JsonLd } from '@indus/ui'
import { mediaUrl } from '../../../lib/media'
import { pageMetadata, urlFor } from '../../../lib/seo'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [brand, seoSetting] = await Promise.all([
    db.brand.findUnique({ where: { slug } }),
    db.seoSetting.findFirst({
      select: { defaultMetaTitleTemplate: true, defaultMetaDescription: true },
    }),
  ])
  if (!brand) return {}

  const ogPath = brand.ogImageMediaId
    ? (await db.media.findUnique({
        where: { id: brand.ogImageMediaId },
        select: { storagePath: true },
      }))?.storagePath ?? null
    : null

  return pageMetadata({
    title: brand.seoTitle ?? brand.name,
    description: brand.seoDescription ?? brand.description ?? null,
    path: `/brands/${brand.slug}`,
    canonicalUrl: brand.canonicalUrl,
    robots: { index: brand.robotsIndex, follow: brand.robotsFollow },
    ogImagePath: ogPath,
    titleTemplate: seoSetting?.defaultMetaTitleTemplate ?? null,
    defaultDescription: seoSetting?.defaultMetaDescription ?? null,
  })
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params

  const brand = await db.brand.findUnique({
    where: { slug },
    include: {
      logo: true,
      caseStudies: {
        where: { isPublished: true },
        orderBy: { position: 'asc' },
        include: { image: { select: { storagePath: true } } },
      },
    },
  })
  if (!brand || !brand.isPublished) notFound()

  const [topProducts, totalCount, inStockCount, seriesCategories, brandDocs] = await Promise.all([
    db.product.findMany({
      where: { brandId: brand.id, status: 'active' },
      include: {
        images: { orderBy: { position: 'asc' }, take: 1, include: { media: true } },
        category: { select: { name: true, slug: true } },
      },
      orderBy: { title: 'asc' },
      take: 8,
    }),
    db.product.count({ where: { brandId: brand.id, status: 'active' } }),
    // Real "in stock" count — replaces the previous fake 0.68× multiplier.
    db.product.count({
      where: { brandId: brand.id, status: 'active', stockQty: { gt: 0 } },
    }),
    db.product.groupBy({
      by: ['categoryId'],
      where: { brandId: brand.id, status: 'active', categoryId: { not: null } },
      _count: { _all: true },
    }).then(async (groups) => {
      const ids = groups.map((g) => g.categoryId).filter(Boolean) as string[]
      const cats = await db.category.findMany({ where: { id: { in: ids } } })
      return cats.map((c) => ({
        ...c,
        count: groups.find((g) => g.categoryId === c.id)?._count._all ?? 0,
      }))
    }),
    db.productDocument.findMany({
      where: {
        product: { brandId: brand.id, status: 'active' },
        isGated: false,
      },
      include: { media: true, product: { select: { sku: true, title: true } } },
      orderBy: { position: 'asc' },
      take: 6,
    }),
  ])

  // Stats-row cells render only when admin has populated the value, so
  // a partially-filled brand still looks intentional rather than empty.
  type StatCell = { label: string; value: string; context?: string | null }
  const statCells: StatCell[] = [
    { label: 'SKUs in stock', value: `${inStockCount} / ${totalCount}` },
    ...(brand.fastestLeadTime ? [{ label: 'Fastest lead time', value: brand.fastestLeadTime }] : []),
    ...(brand.largestInstallValue
      ? [
          {
            label: 'Largest install',
            value: brand.largestInstallValue,
            context: brand.largestInstallContext,
          },
        ]
      : []),
    ...(brand.partnerSince
      ? [{ label: 'Partner since', value: String(brand.partnerSince) }]
      : []),
  ]
  const statCols = Math.max(2, Math.min(4, statCells.length))

  const brandUrl = urlFor(`/brands/${brand.slug}`)
  const brandLd = buildOrgLd({
    name: brand.name,
    url: brandUrl,
    logoUrl: brand.logo ? mediaUrl(brand.logo.storagePath) : null,
    override: brand.jsonLdOverride ?? undefined,
  })
  const breadcrumbLd = buildBreadcrumbLd({
    items: [
      { name: 'Home', url: urlFor('/') },
      { name: 'Brands', url: urlFor('/brands') },
      { name: brand.name, url: brandUrl },
    ],
  })

  return (
    <div>
      <JsonLd data={[brandLd, breadcrumbLd]} />
      {/* ── Dark hero ─────────────────────────────────────────── */}
      <section style={{ background: 'var(--color-primary)', color: 'white', padding: '48px 0 56px', borderBottom: '1px solid oklch(0.3 0 0)' }}>
        <div className="max-w-[1360px] mx-auto px-8 grid gap-12" style={{ gridTemplateColumns: '1fr 320px', alignItems: 'end' }}>
          <div>
            <div className="font-mono text-[11px] tracking-[0.14em] text-[var(--color-accent)] uppercase mb-2">
              <Link href={`/brands`} className="text-[var(--color-accent)] hover:opacity-80">BRANDS</Link>
              {brand.country ? ` / ${brand.country.toUpperCase()} · ` : ' / '}
              {brand.name.toUpperCase()}
            </div>
            <h1 className="text-[64px] tracking-[-0.03em] font-semibold leading-[1] text-white mb-2 mt-2">
              {brand.name}
            </h1>
            {brand.description && (
              <p className="text-[17px] max-w-[580px] mb-6 leading-[1.6]" style={{ color: 'oklch(0.75 0 0)', margin: '0 0 24px' }}>
                {brand.description}
              </p>
            )}
            <div className="flex gap-2 flex-wrap">
              {brand.country && (
                <span className="font-mono text-[11px] px-3 py-1.5" style={{ background: 'oklch(0.25 0 0)', color: 'oklch(0.85 0 0)', borderRadius: '11px' }}>
                  {brand.country.toUpperCase()}
                </span>
              )}
              {brand.isAuthorizedDistributor && (
                <span className="font-mono text-[11px] px-3 py-1.5 text-white" style={{ background: 'var(--color-accent)', borderRadius: '11px' }}>
                  ★ TIER-1 PARTNER
                </span>
              )}
              <span className="font-mono text-[11px] px-3 py-1.5" style={{ background: 'oklch(0.25 0 0)', color: 'oklch(0.85 0 0)', borderRadius: '11px' }}>
                {totalCount} SKUS
              </span>
            </div>
          </div>

          {/* Specialist card — DB-driven; the whole card hides when no
              account manager is assigned, so brands without a named
              specialist don't ship a generic-feeling placeholder. */}
          {brand.accountManagerName && (
            <div className="p-5" style={{ background: 'oklch(0.18 0 0)', border: '1px solid oklch(0.3 0 0)', borderRadius: '6px' }}>
              <div className="font-mono text-[10px] tracking-[0.12em] uppercase mb-2.5" style={{ color: 'oklch(0.6 0 0)' }}>
                YOUR {brand.name.split(' ')[0]?.toUpperCase()} SPECIALIST
              </div>
              <div className="flex gap-3 items-center mb-3.5">
                <div className="w-11 h-11 rounded-full bg-[var(--color-accent)] text-white grid place-items-center font-semibold text-[14px] shrink-0">
                  {brand.accountManagerInitials ?? brand.accountManagerName.split(' ').map((w) => w[0] ?? '').join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-white">{brand.accountManagerName}</div>
                  {(brand.accountManagerTitle || brand.accountManagerYearsExp) && (
                    <div className="font-mono text-[11px]" style={{ color: 'oklch(0.7 0 0)' }}>
                      {[brand.accountManagerTitle, brand.accountManagerYearsExp].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
              </div>
              <Link
                href={`/contact`}
                className="flex items-center justify-center h-9 w-full bg-[var(--color-accent)] text-white font-mono text-[12px] hover:opacity-90 transition-opacity"
              >
                Talk to {brand.accountManagerName.split(' ')[0]} →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Stats row — cells render only when admin populates them. ── */}
      {statCells.length > 0 && (
        <section className="max-w-[1360px] mx-auto px-8 py-10">
          <div className="grid gap-3.5 mb-8" style={{ gridTemplateColumns: `repeat(${statCols}, minmax(0, 1fr))` }}>
            {statCells.map((cell) => (
              <div key={cell.label} className="p-[18px] bg-[var(--color-elevated)] border border-[var(--color-border)]">
                <div className="font-mono text-[10px] tracking-[0.1em] text-[var(--color-muted)] uppercase">
                  {cell.label}
                </div>
                <div className="font-mono text-[24px] font-semibold mt-1.5">{cell.value}</div>
                {cell.context && (
                  <div className="font-mono text-[11px] text-[var(--color-muted)]">{cell.context}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Product series ─────────────────────────────────────── */}
      {seriesCategories.length > 0 && (
        <section className="max-w-[1360px] mx-auto px-8 pb-10">
          <h2 className="text-[24px] tracking-[-0.01em] font-semibold mb-4">Product series we carry</h2>
          <div className="grid grid-cols-3 gap-3">
            {seriesCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/c/${cat.slug}`}
                className="block p-[18px] border border-[var(--color-border)] bg-[var(--color-elevated)] hover:border-[var(--color-body)] transition-colors"
              >
                <div className="font-mono text-[13px] font-semibold tracking-[-0.01em]">{cat.name}</div>
                <div className="text-[14px] font-medium mt-1 text-[var(--color-body)]">{cat.name}</div>
                <div className="font-mono text-[11px] text-[var(--color-muted)] mt-2">{cat.count} SKUs →</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Top SKUs ───────────────────────────────────────────── */}
      {topProducts.length > 0 && (
        <section className="max-w-[1360px] mx-auto px-8 pb-10">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-[24px] tracking-[-0.01em] font-semibold">Top SKUs · {brand.name}</h2>
            <Link href={`/search?brands=${brand.slug}`} className="text-[13px] text-[var(--color-accent)] hover:underline">
              View all {totalCount} →
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {topProducts.map((product) => {
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
                    <div className="text-[13px] font-medium mt-0.5 mb-2 leading-[1.3] line-clamp-2">{product.title}</div>
                    <div className="font-mono text-[11px] text-[var(--color-accent)]">Get quote →</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Case study ─────────────────────────────────────────── */}
      {/* ── Case studies — DB-driven; the whole section hides when no
          published case studies exist for the brand, so brands without
          curated installs don't render a stale templated story. */}
      {brand.caseStudies.length > 0 && (
        <section className="bg-[var(--color-elevated)] border-t border-b border-[var(--color-border)]">
          <div className="max-w-[1360px] mx-auto px-8 py-12 flex flex-col gap-10">
            {brand.caseStudies.map((cs, idx) => {
              const csStats = Array.isArray(cs.stats)
                ? (cs.stats as unknown[])
                    .filter((x): x is Record<string, unknown> => typeof x === 'object' && x !== null)
                    .map((x) => ({
                      value: typeof x.value === 'string' ? x.value : '',
                      label: typeof x.label === 'string' ? x.label : '',
                    }))
                    .filter((s) => s.value || s.label)
                : []
              return (
                <article
                  key={cs.id}
                  className={`grid grid-cols-2 gap-12 items-center ${
                    idx > 0 ? 'border-t border-[var(--color-border)] pt-10' : ''
                  }`}
                >
                  <div>
                    <div className="font-mono text-[11px] tracking-[0.14em] text-[var(--color-muted)] uppercase mb-2">
                      {cs.tag}
                    </div>
                    <h2 className="text-[30px] tracking-[-0.02em] font-semibold leading-[1.15] mb-3">
                      {cs.title}
                    </h2>
                    <p className="text-[var(--color-body)] mb-4 leading-[1.6]">{cs.description}</p>
                    {csStats.length > 0 && (
                      <div className="flex gap-6 font-mono text-[12px] text-[var(--color-muted)]">
                        {csStats.map((s) => (
                          <span key={`${s.value}-${s.label}`}>
                            <b className="text-[18px] text-[var(--color-primary)] block font-semibold">{s.value}</b>
                            {s.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="aspect-[4/3] bg-[var(--color-deep)] border border-[var(--color-border)] grid place-items-center relative overflow-hidden">
                    {cs.image ? (
                      <Image
                        src={mediaUrl(cs.image.storagePath)}
                        alt={cs.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1360px) 50vw, 660px"
                      />
                    ) : (
                      <span className="font-mono text-[11px] text-[var(--color-muted)]">CASE PHOTO · INSTALL</span>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Datasheets & resources ─────────────────────────────── */}
      {brandDocs.length > 0 && (
        <section className="max-w-[1360px] mx-auto px-8 py-12">
          <h2 className="text-[24px] tracking-[-0.01em] font-semibold mb-4">Datasheets &amp; resources</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {brandDocs.map((doc) => (
              <a
                key={doc.id}
                href={mediaUrl(doc.media.storagePath)}
                target="_blank"
                rel="noopener noreferrer"
                className="grid gap-3.5 p-3.5 border border-[var(--color-border)] bg-[var(--color-elevated)] hover:border-[var(--color-body)] transition-colors items-center"
                style={{ gridTemplateColumns: '64px 1fr auto' }}
              >
                <div className="font-mono text-[9px] bg-[var(--color-primary)] text-[var(--color-elevated)] px-2.5 py-1.5 text-center">
                  {doc.kind.toUpperCase().slice(0, 8)}
                </div>
                <div>
                  <div className="font-medium text-[13px]">{doc.title}</div>
                  <div className="font-mono text-[11px] text-[var(--color-muted)]">{doc.product.sku}</div>
                </div>
                <span className="shrink-0 h-8 px-3 border border-[var(--color-border)] font-mono text-[11px] flex items-center text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors whitespace-nowrap">
                  Download ↓
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA strip ──────────────────────────────────────────── */}
      <section className="max-w-[1360px] mx-auto px-8 pb-16">
        <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-6 grid grid-cols-[1fr_auto] gap-4 items-center">
          <div>
            <b className="text-[16px]">Need {brand.name} products for your application?</b>
            <p className="mt-1 text-[14px] text-[var(--color-muted)]">
              Our applications engineers carry deep {brand.name} expertise — get a quote with lead times in one business day.
            </p>
          </div>
          <Link
            href={`/quote`}
            className="shrink-0 h-10 px-6 bg-[var(--color-accent)] text-white font-mono text-[12px] flex items-center hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Request a quote →
          </Link>
        </div>
      </section>
    </div>
  )
}
