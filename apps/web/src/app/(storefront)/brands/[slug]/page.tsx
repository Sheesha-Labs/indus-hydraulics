import type { Metadata } from 'next'
import { Fragment, type ReactNode } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@indus/db'
import { buildBreadcrumbLd, buildOrgLd, str } from '@indus/domain'
import { JsonLd, LeadCapturePanel, buildWhatsappHref, buildMailtoHref } from '@indus/ui'
import { mediaUrl } from '../../../../lib/media'
import { getSubPageContent } from '../../../../lib/page-content'
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
    ? ((
        await db.media.findUnique({
          where: { id: brand.ogImageMediaId },
          select: { storagePath: true },
        })
      )?.storagePath ?? null)
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

  const [topProducts, totalCount, inStockCount, seriesCategories, brandDocs, content] =
    await Promise.all([
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
      db.product
        .groupBy({
          by: ['categoryId'],
          where: { brandId: brand.id, status: 'active', categoryId: { not: null } },
          _count: { _all: true },
        })
        .then(async (groups) => {
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
      // Band order, visibility and heading overrides for this brand, edited
      // under Pages & Blocks · Brands.
      getSubPageContent('brand', { name: brand.name, slug: brand.slug }),
    ])

  // Stats-row cells render only when admin has populated the value, so
  // a partially-filled brand still looks intentional rather than empty.
  type StatCell = { label: string; value: string; context?: string | null }
  const statCells: StatCell[] = [
    { label: 'SKUs in stock', value: `${inStockCount} / ${totalCount}` },
    ...(brand.fastestLeadTime
      ? [{ label: 'Fastest lead time', value: brand.fastestLeadTime }]
      : []),
    ...(brand.largestInstallValue
      ? [
          {
            label: 'Largest install',
            value: brand.largestInstallValue,
            context: brand.largestInstallContext,
          },
        ]
      : []),
    ...(brand.partnerSince ? [{ label: 'Partner since', value: String(brand.partnerSince) }] : []),
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

  const heroCopy = content.values('hero')
  const seriesCopy = content.values('series')
  const topSkusCopy = content.values('top_skus')
  const resourcesCopy = content.values('resources')
  const leadCopy = content.values('lead')

  /** An override with `{brand}` resolved, or the template's own wording. */
  const over = (values: Parameters<typeof str>[0], key: string, built: string): string =>
    (str(values, key) ?? built).replace(/\{brand\}/g, brand.name)

  /*
    Every band, keyed. The page renders `content.order` — the editor's
    arrangement for THIS brand, with hidden bands already dropped. Several
    bands additionally hide themselves when the brand record has nothing to
    fill them, which is why a brand with no case studies has never rendered an
    empty frame and still doesn't.
  */
  const bands: Record<string, ReactNode> = {
    // Dark hero
    hero: (
      <section className="border-ih-navy-2 bg-ih-navy border-b py-12 text-white">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-end gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_320px] xl:px-12">
          <div>
            <div className="text-ih-steel mb-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.13em]">
              <Link href={`/brands`} className="text-ih-steel hover:text-white">
                BRANDS
              </Link>
              {brand.country ? ` / ${brand.country.toUpperCase()} · ` : ' / '}
              {brand.name.toUpperCase()}
            </div>
            <h1 className="mb-2 mt-2 font-serif text-[clamp(34px,5vw,52px)] font-normal leading-[1.04] tracking-[-0.01em] text-white">
              {over(heroCopy, 'heading', brand.name)}
            </h1>
            {(str(heroCopy, 'description') ?? brand.description) ? (
              <p className="mb-6 max-w-[580px] text-[16px] leading-[1.6] text-[oklch(0.82_0.02_250)]">
                {str(heroCopy, 'description') ?? brand.description}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {brand.country && (
                <span className="bg-ih-navy-2 inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-medium text-[oklch(0.86_0.02_250)]">
                  {brand.country.toUpperCase()}
                </span>
              )}
              {brand.isAuthorizedDistributor && (
                <span className="bg-ih-accent inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-medium text-white">
                  ★ TIER-1 PARTNER
                </span>
              )}
              <span className="bg-ih-navy-2 inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-medium text-[oklch(0.86_0.02_250)]">
                {totalCount} SKUS
              </span>
            </div>
          </div>

          {/* Specialist card — DB-driven; the whole card hides when no
              account manager is assigned, so brands without a named
              specialist don't ship a generic-feeling placeholder. */}
          {brand.accountManagerName && (
            <div className="border-ih-navy-2 bg-ih-navy-2/40 rounded-lg border p-5">
              <div className="mb-2.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-[oklch(0.68_0.03_250)]">
                {over(
                  heroCopy,
                  'specialist_label',
                  `YOUR ${brand.name.split(' ')[0]?.toUpperCase() ?? ''} SPECIALIST`
                )}
              </div>
              <div className="mb-3.5 flex items-center gap-3">
                <div className="bg-ih-accent grid h-11 w-11 shrink-0 place-items-center rounded-full text-[14px] font-medium text-white">
                  {brand.accountManagerInitials ??
                    brand.accountManagerName
                      .split(' ')
                      .map((w) => w[0] ?? '')
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-white">{brand.accountManagerName}</div>
                  {(brand.accountManagerTitle || brand.accountManagerYearsExp) && (
                    <div className="font-mono text-[11px] text-[oklch(0.75_0.02_250)]">
                      {[brand.accountManagerTitle, brand.accountManagerYearsExp]
                        .filter(Boolean)
                        .join(' · ')}
                    </div>
                  )}
                </div>
              </div>
              <Link
                href={`/contact`}
                className="bg-ih-accent text-ih-accent-fg hover:bg-ih-accent-hover flex h-10 w-full items-center justify-center rounded-md text-[13.5px] font-medium transition-colors"
              >
                {over(
                  heroCopy,
                  'specialist_cta_label',
                  `Talk to ${brand.accountManagerName.split(' ')[0]} →`
                )}
              </Link>
            </div>
          )}
        </div>
      </section>
    ),

    // Stats row — cells render only when the brand record carries the figure
    stats:
      statCells.length > 0 ? (
        <section className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 xl:px-12">
          <div
            className="mb-8 grid gap-7"
            style={{ gridTemplateColumns: `repeat(${statCols}, minmax(0, 1fr))` }}
          >
            {statCells.map((cell) => (
              <div key={cell.label} className="border-ih-accent flex flex-col border-t-2 pt-3.5">
                <div className="text-ih-muted order-2 mt-2.5 font-mono text-[10.5px] uppercase tracking-[0.1em]">
                  {cell.label}
                </div>
                <div className="order-1 font-mono text-[26px] tabular-nums leading-none tracking-[-0.03em]">
                  {cell.value}
                </div>
                {cell.context && (
                  <div className="text-ih-muted-2 order-3 mt-1 font-mono text-[11px]">
                    {cell.context}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null,

    // Product series
    series:
      seriesCategories.length > 0 ? (
        <section className="mx-auto max-w-[1440px] px-5 pb-10 sm:px-8 xl:px-12">
          <h2 className="mb-5 font-serif text-[30px] font-normal tracking-[-0.01em]">
            {over(seriesCopy, 'heading', 'Product series we carry')}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {seriesCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/c/${cat.slug}`}
                className="border-ih-border bg-ih-surface hover:border-ih-accent block rounded-lg border p-[18px] transition-colors"
              >
                {/* The category name was rendered twice here — once in mono
                  and once in sans — which read as a duplication bug rather
                  than a hierarchy. One title, one count. */}
                <div className="text-[15px] font-medium tracking-[-0.01em]">{cat.name}</div>
                <div className="text-ih-muted mt-2 font-mono text-[11px]">
                  {cat.count} SKU{cat.count === 1 ? '' : 's'} <span aria-hidden="true">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null,

    // Top SKUs
    top_skus:
      topProducts.length > 0 ? (
        <section className="mx-auto max-w-[1440px] px-5 pb-10 sm:px-8 xl:px-12">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-serif text-[30px] font-normal tracking-[-0.01em]">
              {over(topSkusCopy, 'heading', `Top SKUs · ${brand.name}`)}
            </h2>
            <Link
              href={`/search?brands=${brand.slug}`}
              className="text-ih-accent text-[13px] hover:underline"
            >
              {over(topSkusCopy, 'cta_label', `View all ${totalCount} →`)}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {topProducts.map((product) => {
              const img = product.images[0]
              return (
                <Link
                  key={product.id}
                  href={`/p/${product.slug}`}
                  className="border-ih-border bg-ih-surface hover:border-ih-accent flex flex-col overflow-hidden rounded-lg border transition-colors"
                >
                  <div className="border-ih-border bg-ih-surface-2 relative aspect-square overflow-hidden border-b">
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
                    <div className="mb-2 mt-0.5 line-clamp-2 text-[13px] font-medium leading-[1.3]">
                      {product.title}
                    </div>
                    <div className="text-ih-accent font-mono text-[11px]">Get quote →</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      ) : null,

    // Case studies. DB-driven; the band hides itself when a brand has no
    // published cases, so brands without curated installs never render a
    // stale templated story — that predates the editor and still holds.
    case_studies:
      brand.caseStudies.length > 0 ? (
        <section className="bg-ih-surface border-ih-border border-b border-t">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-5 py-12 sm:px-8 xl:px-12">
            {brand.caseStudies.map((cs, idx) => {
              const csStats = Array.isArray(cs.stats)
                ? (cs.stats as unknown[])
                    .filter(
                      (x): x is Record<string, unknown> => typeof x === 'object' && x !== null
                    )
                    .map((x) => ({
                      value: typeof x.value === 'string' ? x.value : '',
                      label: typeof x.label === 'string' ? x.label : '',
                    }))
                    .filter((s) => s.value || s.label)
                : []
              return (
                <article
                  key={cs.id}
                  className={`grid grid-cols-2 items-center gap-12 ${
                    idx > 0 ? 'border-ih-border border-t pt-10' : ''
                  }`}
                >
                  <div>
                    <div className="text-ih-muted mb-2 font-mono text-[11px] uppercase tracking-[0.14em]">
                      {cs.tag}
                    </div>
                    <h2 className="mb-3 text-[30px] font-semibold leading-[1.15] tracking-[-0.02em]">
                      {cs.title}
                    </h2>
                    <p className="text-ih-ink-2 mb-4 leading-[1.6]">{cs.description}</p>
                    {csStats.length > 0 && (
                      <div className="text-ih-muted flex gap-6 font-mono text-[12px]">
                        {csStats.map((s) => (
                          <span key={`${s.value}-${s.label}`}>
                            <b className="text-ih-ink block text-[18px] font-semibold">{s.value}</b>
                            {s.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="bg-ih-surface-2 border-ih-border relative grid aspect-[4/3] place-items-center overflow-hidden border">
                    {cs.image ? (
                      <Image
                        src={mediaUrl(cs.image.storagePath)}
                        alt={cs.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1360px) 50vw, 660px"
                      />
                    ) : (
                      <span className="text-ih-muted font-mono text-[11px]">
                        CASE PHOTO · INSTALL
                      </span>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      ) : null,

    // Datasheets & resources
    resources:
      brandDocs.length > 0 ? (
        <section className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 xl:px-12">
          <h2 className="mb-4 text-[24px] font-semibold tracking-[-0.01em]">
            {over(resourcesCopy, 'heading', 'Datasheets & resources')}
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {brandDocs.map((doc) => (
              <a
                key={doc.id}
                href={mediaUrl(doc.media.storagePath)}
                target="_blank"
                rel="noopener noreferrer"
                className="border-ih-border bg-ih-surface hover:border-ih-accent grid grid-cols-[64px_1fr_auto] items-center gap-3.5 rounded-lg border p-3.5 transition-colors"
              >
                <div className="bg-ih-navy rounded-[3px] px-2.5 py-1.5 text-center font-mono text-[9px] tracking-[0.06em] text-white">
                  {doc.kind.toUpperCase().slice(0, 8)}
                </div>
                <div>
                  <div className="text-[13px] font-medium">{doc.title}</div>
                  <div className="text-ih-muted font-mono text-[11px]">{doc.product.sku}</div>
                </div>
                <span className="border-ih-border text-ih-ink-2 hover:bg-ih-surface-2 flex h-8 shrink-0 items-center whitespace-nowrap border px-3 font-mono text-[11px] transition-colors">
                  Download ↓
                </span>
              </a>
            ))}
          </div>
        </section>
      ) : null,

    // Lead capture
    lead: (
      <section className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8 xl:px-12">
        <LeadCapturePanel
          variant="compact"
          heading={over(leadCopy, 'heading', `Need ${brand.name} products for your application?`)}
          body={over(
            leadCopy,
            'body',
            `Our applications engineers carry deep ${brand.name} expertise. Send us the part number, a photo of the unit on the bench, or a use-case description — we reply within one business day with availability, lead time and a fixed-price quote.`
          )}
          whatsappUrl={buildWhatsappHref(settings.contactPhone, `Enquiry: ${brand.name} products`)}
          emailUrl={buildMailtoHref(settings.contactEmail, `${brand.name} enquiry`)}
          phone={settings.contactPhone}
        />
      </section>
    ),
  }

  return (
    <div>
      <JsonLd data={[brandLd, breadcrumbLd]} />
      {content.order.map((key) =>
        bands[key] ? <Fragment key={key}>{bands[key]}</Fragment> : null
      )}
    </div>
  )
}
