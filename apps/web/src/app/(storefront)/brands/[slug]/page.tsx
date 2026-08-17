import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@indus/db'
import { buildBreadcrumbLd, buildOrgLd } from '@indus/domain'
import { JsonLd, LeadCapturePanel, buildWhatsappHref, buildMailtoHref } from '@indus/ui'
import { mediaUrl } from '../../../../lib/media'
import { pageMetadata, urlFor } from '../../../../lib/seo'
import { getStoreSettings } from '../../../../lib/store-settings'

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

  const [brand, settings] = await Promise.all([
    db.brand.findUnique({
      where: { slug },
      include: {
        logo: true,
        caseStudies: {
          where: { isPublished: true },
          orderBy: { position: 'asc' },
          include: { image: { select: { storagePath: true } } },
        },
      },
    }),
    getStoreSettings(),
  ])
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
      <section className="border-b border-ih-navy-2 bg-ih-navy py-12 text-white">
        <div className="mx-auto grid grid-cols-1 max-w-[1440px] items-end gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_320px] xl:px-12">
          <div>
            <div className="mb-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-steel">
              <Link href={`/brands`} className="text-ih-steel hover:text-white">BRANDS</Link>
              {brand.country ? ` / ${brand.country.toUpperCase()} · ` : ' / '}
              {brand.name.toUpperCase()}
            </div>
            <h1 className="mb-2 mt-2 font-serif text-[clamp(34px,5vw,52px)] font-normal leading-[1.04] tracking-[-0.01em] text-white">
              {brand.name}
            </h1>
            {brand.description && (
              <p className="mb-6 max-w-[580px] text-[16px] leading-[1.6] text-[oklch(0.82_0.02_250)]">
                {brand.description}
              </p>
            )}
            <div className="flex gap-2 flex-wrap">
              {brand.country && (
                <span className="inline-flex h-[22px] items-center rounded-full bg-ih-navy-2 px-2.5 text-[11px] font-medium text-[oklch(0.86_0.02_250)]">
                  {brand.country.toUpperCase()}
                </span>
              )}
              {brand.isAuthorizedDistributor && (
                <span className="inline-flex h-[22px] items-center rounded-full bg-ih-accent px-2.5 text-[11px] font-medium text-white">
                  ★ TIER-1 PARTNER
                </span>
              )}
              <span className="inline-flex h-[22px] items-center rounded-full bg-ih-navy-2 px-2.5 text-[11px] font-medium text-[oklch(0.86_0.02_250)]">
                {totalCount} SKUS
              </span>
            </div>
          </div>

          {/* Specialist card — DB-driven; the whole card hides when no
              account manager is assigned, so brands without a named
              specialist don't ship a generic-feeling placeholder. */}
          {brand.accountManagerName && (
            <div className="rounded-lg border border-ih-navy-2 bg-ih-navy-2/40 p-5">
              <div className="mb-2.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-[oklch(0.68_0.03_250)]">
                YOUR {brand.name.split(' ')[0]?.toUpperCase()} SPECIALIST
              </div>
              <div className="flex gap-3 items-center mb-3.5">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ih-accent text-[14px] font-medium text-white">
                  {brand.accountManagerInitials ?? brand.accountManagerName.split(' ').map((w) => w[0] ?? '').join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-white">{brand.accountManagerName}</div>
                  {(brand.accountManagerTitle || brand.accountManagerYearsExp) && (
                    <div className="font-mono text-[11px] text-[oklch(0.75_0.02_250)]">
                      {[brand.accountManagerTitle, brand.accountManagerYearsExp].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
              </div>
              <Link
                href={`/contact`}
                className="flex h-10 w-full items-center justify-center rounded-md bg-ih-accent text-[13.5px] font-medium text-ih-accent-fg transition-colors hover:bg-ih-accent-hover"
              >
                Talk to {brand.accountManagerName.split(' ')[0]} →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Stats row — cells render only when admin populates them. ── */}
      {statCells.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 xl:px-12">
          <div className="mb-8 grid gap-7" style={{ gridTemplateColumns: `repeat(${statCols}, minmax(0, 1fr))` }}>
            {statCells.map((cell) => (
              <div key={cell.label} className="flex flex-col border-t-2 border-ih-accent pt-3.5">
                <div className="order-2 mt-2.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted">
                  {cell.label}
                </div>
                <div className="order-1 font-mono text-[26px] leading-none tracking-[-0.03em] tabular-nums">{cell.value}</div>
                {cell.context && (
                  <div className="order-3 mt-1 font-mono text-[11px] text-ih-muted-2">{cell.context}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Product series ─────────────────────────────────────── */}
      {seriesCategories.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-5 pb-10 sm:px-8 xl:px-12">
          <h2 className="mb-5 font-serif text-[30px] font-normal tracking-[-0.01em]">Product series we carry</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {seriesCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/c/${cat.slug}`}
                className="block rounded-lg border border-ih-border bg-ih-surface p-[18px] transition-colors hover:border-ih-accent"
              >
                {/* The category name was rendered twice here — once in mono
                    and once in sans — which read as a duplication bug rather
                    than a hierarchy. One title, one count. */}
                <div className="text-[15px] font-medium tracking-[-0.01em]">{cat.name}</div>
                <div className="mt-2 font-mono text-[11px] text-ih-muted">
                  {cat.count} SKU{cat.count === 1 ? '' : 's'} <span aria-hidden="true">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Top SKUs ───────────────────────────────────────────── */}
      {topProducts.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-5 pb-10 sm:px-8 xl:px-12">
          <div className="flex justify-between items-end mb-4">
            <h2 className="font-serif text-[30px] font-normal tracking-[-0.01em]">Top SKUs · {brand.name}</h2>
            <Link href={`/search?brands=${brand.slug}`} className="text-[13px] text-ih-accent hover:underline">
              View all {totalCount} →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {topProducts.map((product) => {
              const img = product.images[0]
              return (
                <Link
                  key={product.id}
                  href={`/p/${product.slug}`}
                  className="flex flex-col overflow-hidden rounded-lg border border-ih-border bg-ih-surface transition-colors hover:border-ih-accent"
                >
                  <div className="relative aspect-square overflow-hidden border-b border-ih-border bg-ih-surface-2">
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
                    <div className="text-[13px] font-medium mt-0.5 mb-2 leading-[1.3] line-clamp-2">{product.title}</div>
                    <div className="font-mono text-[11px] text-ih-accent">Get quote →</div>
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
        <section className="bg-ih-surface border-t border-b border-ih-border">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12 py-12 flex flex-col gap-10">
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
                    idx > 0 ? 'border-t border-ih-border pt-10' : ''
                  }`}
                >
                  <div>
                    <div className="font-mono text-[11px] tracking-[0.14em] text-ih-muted uppercase mb-2">
                      {cs.tag}
                    </div>
                    <h2 className="text-[30px] tracking-[-0.02em] font-semibold leading-[1.15] mb-3">
                      {cs.title}
                    </h2>
                    <p className="text-ih-ink-2 mb-4 leading-[1.6]">{cs.description}</p>
                    {csStats.length > 0 && (
                      <div className="flex gap-6 font-mono text-[12px] text-ih-muted">
                        {csStats.map((s) => (
                          <span key={`${s.value}-${s.label}`}>
                            <b className="text-[18px] text-ih-ink block font-semibold">{s.value}</b>
                            {s.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="aspect-[4/3] bg-ih-surface-2 border border-ih-border grid place-items-center relative overflow-hidden">
                    {cs.image ? (
                      <Image
                        src={mediaUrl(cs.image.storagePath)}
                        alt={cs.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1360px) 50vw, 660px"
                      />
                    ) : (
                      <span className="font-mono text-[11px] text-ih-muted">CASE PHOTO · INSTALL</span>
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
        <section className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12 py-12">
          <h2 className="text-[24px] tracking-[-0.01em] font-semibold mb-4">Datasheets &amp; resources</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {brandDocs.map((doc) => (
              <a
                key={doc.id}
                href={mediaUrl(doc.media.storagePath)}
                target="_blank"
                rel="noopener noreferrer"
                className="grid grid-cols-[64px_1fr_auto] items-center gap-3.5 rounded-lg border border-ih-border bg-ih-surface p-3.5 transition-colors hover:border-ih-accent"
              >
                <div className="rounded-[3px] bg-ih-navy px-2.5 py-1.5 text-center font-mono text-[9px] tracking-[0.06em] text-white">
                  {doc.kind.toUpperCase().slice(0, 8)}
                </div>
                <div>
                  <div className="font-medium text-[13px]">{doc.title}</div>
                  <div className="font-mono text-[11px] text-ih-muted">{doc.product.sku}</div>
                </div>
                <span className="shrink-0 h-8 px-3 border border-ih-border font-mono text-[11px] flex items-center text-ih-ink-2 hover:bg-ih-surface-2 transition-colors whitespace-nowrap">
                  Download ↓
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── Lead capture ──────────────────────────────────────────
          Replaces the previous quote-only strip — the wide LeadCapturePanel
          surfaces WhatsApp + Email alongside the primary quote CTA, with
          context pre-baked into the openers so the lead lands already
          framed (e.g. WhatsApp text reads "Enquiry: <Brand> products"). */}
      <section className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12 pb-16">
        <LeadCapturePanel
          variant="compact"
          heading={`Need ${brand.name} products for your application?`}
          body={`Our applications engineers carry deep ${brand.name} expertise. Send us the part number, a photo of the unit on the bench, or a use-case description — we reply within one business day with availability, lead time and a fixed-price quote.`}
          whatsappUrl={buildWhatsappHref(settings.contactPhone, `Enquiry: ${brand.name} products`)}
          emailUrl={buildMailtoHref(settings.contactEmail, `${brand.name} enquiry`)}
          phone={settings.contactPhone}
        />
      </section>
    </div>
  )
}
