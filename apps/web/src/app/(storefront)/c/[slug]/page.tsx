import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@indus/db'
import { buildBreadcrumbLd, buildCollectionLd } from '@indus/domain'
import { JsonLd } from '@indus/ui'
import { pageMetadata, urlFor } from '../../../../lib/seo'
import ProductCard from '../../../../components/ProductCard'

const PAGE_SIZE = 12

type SearchParams = {
  brands?: string
  page?: string
  sort?: string
}

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<SearchParams>
}

/**
 * Refresh interval for category pages. Catalogue counts and brand facets
 * change as products are added; one hour keeps the cached HTML fresh
 * without hammering Postgres. Admin can punch through with
 * `revalidatePath('/c/<slug>')` after a category edit.
 */
export const revalidate = 3600

/** Allow on-demand ISR for categories created after deploy. */
export const dynamicParams = true

/**
 * Pre-render every published category at build. The total count is small
 * (well under 100 even with sub-categories) so we don't bother with a
 * top-N cap — the build cost is negligible and the snappy first-paint on
 * every category beats lazy hydration.
 */
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const rows = await db.category.findMany({
    where: { isPublished: true },
    select: { slug: true },
  })
  return rows.map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, sp] = await Promise.all([params, searchParams])
  const [category, seoSetting] = await Promise.all([
    db.category.findUnique({ where: { slug } }),
    db.seoSetting.findFirst({
      select: { defaultMetaTitleTemplate: true, defaultMetaDescription: true },
    }),
  ])
  if (!category) return {}

  const ogPath = category.ogImageMediaId
    ? (await db.media.findUnique({
        where: { id: category.ogImageMediaId },
        select: { storagePath: true },
      }))?.storagePath ?? null
    : null

  // Filtered / sorted / paginated variants of a category page are
  // duplicate-content slices of the base. We let Google FOLLOW the
  // links (so it discovers products and sub-categories) but tell it
  // NOT to index the URL, so PageRank concentrates on the canonical
  // /c/<slug>. Page 1 (no params) keeps the admin-controlled flags.
  const isFacetVariant = !!(sp.brands || sp.sort || (sp.page && sp.page !== '1'))
  const robots = isFacetVariant
    ? { index: false, follow: true }
    : { index: category.robotsIndex, follow: category.robotsFollow }

  return pageMetadata({
    title: category.seoTitle ?? category.name,
    description: category.seoDescription ?? category.shortDescription ?? null,
    path: `/c/${category.slug}`,
    canonicalUrl: category.canonicalUrl,
    robots,
    ogImagePath: ogPath,
    titleTemplate: seoSetting?.defaultMetaTitleTemplate ?? null,
    defaultDescription: seoSetting?.defaultMetaDescription ?? null,
  })
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams

  const category = await db.category.findUnique({
    where: { slug },
    include: { children: { where: { isPublished: true }, orderBy: { position: 'asc' } } },
  })

  if (!category || !category.isPublished) notFound()

  const page = Math.max(1, parseInt(sp.page ?? '1', 10))
  const selectedBrands = sp.brands ? sp.brands.split(',').filter(Boolean) : []

  const where = {
    categoryId: category.id,
    status: 'active' as const,
    ...(selectedBrands.length > 0 ? {
      brand: { slug: { in: selectedBrands } },
    } : {}),
  }

  const [products, total, allBrands] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        brand: { select: { name: true, slug: true } },
        images: { orderBy: { position: 'asc' }, take: 1, include: { media: true } },
        specs: { where: { isFilterable: true }, take: 3 },
      },
      orderBy: sp.sort === 'az' ? { title: 'asc' } : sp.sort === 'za' ? { title: 'desc' } : { updatedAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.product.count({ where }),
    db.product.groupBy({
      by: ['brandId'],
      where: { categoryId: category.id, status: 'active' },
      _count: { _all: true },
    }).then(async (groups) => {
      const ids = groups.map((g) => g.brandId).filter(Boolean) as string[]
      const brands = await db.brand.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, slug: true } })
      return brands.map((b) => ({ ...b, count: groups.find((g) => g.brandId === b.id)?._count._all ?? 0 }))
    }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  // Build filter URL helper
  function filterUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams()
    const base = { brands: selectedBrands.join(',') || undefined, page: page > 1 ? String(page) : undefined, sort: sp.sort }
    const merged = { ...base, ...overrides }
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v)
    }
    const qs = params.toString()
    return `/c/${slug}${qs ? `?${qs}` : ''}`
  }

  function toggleBrand(brandSlug: string) {
    const next = selectedBrands.includes(brandSlug)
      ? selectedBrands.filter((b) => b !== brandSlug)
      : [...selectedBrands, brandSlug]
    return filterUrl({ brands: next.join(',') || undefined, page: '1' })
  }

  const from = (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, total)

  const collectionUrl = urlFor(`/c/${category.slug}`)
  const collectionLd = buildCollectionLd({
    name: category.name,
    description: category.seoDescription ?? category.shortDescription ?? null,
    url: collectionUrl,
    override: category.jsonLdOverride ?? undefined,
  })
  const breadcrumbLd = buildBreadcrumbLd({
    items: [
      { name: 'Home', url: urlFor('/') },
      { name: category.name, url: collectionUrl },
    ],
  })

  return (
    <div className="max-w-[1360px] mx-auto px-8">
      <JsonLd data={[collectionLd, breadcrumbLd]} />
      {/* Breadcrumbs */}
      <nav className="py-4 border-b border-[var(--color-border-2)] font-mono text-[12px] text-[var(--color-muted)] flex gap-2 items-center">
        <Link href={`/`} className="hover:text-[var(--color-primary)]">Home</Link>
        <span className="opacity-40">/</span>
        <Link href={`/c`} className="hover:text-[var(--color-primary)]">Categories</Link>
        <span className="opacity-40">/</span>
        <span className="text-[var(--color-primary)]">{category.name}</span>
      </nav>

      {/* Category header */}
      <div className="py-8 border-b border-[var(--color-border)]">
        <p className="font-mono text-[11px] tracking-[0.14em] text-[var(--color-muted)] uppercase mb-2">
          Category
        </p>
        <h1 className="text-[clamp(32px,4vw,48px)] font-semibold tracking-[-0.025em] leading-[1.05] mb-3">
          {category.name}
        </h1>
        {category.shortDescription && (
          <p className="text-[var(--color-muted)] max-w-[620px] leading-[1.55] mb-4">
            {category.shortDescription}
          </p>
        )}
        <div className="flex gap-6 font-mono text-[12px] text-[var(--color-muted)]">
          <span><b className="text-[var(--color-primary)] font-medium">{total}</b> SKUs</span>
          <span><b className="text-[var(--color-primary)] font-medium">{allBrands.length}</b> brands</span>
        </div>
      </div>

      {/* Sub-categories */}
      {category.children.length > 0 && (
        <div className="flex gap-2 overflow-x-auto py-4 border-b border-[var(--color-border)] no-scrollbar">
          {category.children.map((child) => (
            <Link
              key={child.id}
              href={`/c/${child.slug}`}
              className="shrink-0 px-4 py-2.5 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] font-medium text-[var(--color-body)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors whitespace-nowrap"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}

      {/* Main listing */}
      <div className="grid grid-cols-[260px_1fr] gap-8 py-8 pb-16">
        {/* Filter sidebar */}
        <aside className="sticky top-[88px] self-start max-h-[calc(100vh-110px)] overflow-y-auto">
          {/* Brand filter */}
          {allBrands.length > 0 && (
            <div className="pb-5 border-b border-[var(--color-border-2)]">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--color-muted)]">
                  Brands
                </h3>
                {selectedBrands.length > 0 && (
                  <Link href={filterUrl({ brands: undefined, page: '1' })} className="font-mono text-[10px] text-[var(--color-accent)] hover:underline">
                    Clear
                  </Link>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {allBrands.map((brand) => {
                  const active = selectedBrands.includes(brand.slug)
                  return (
                    <Link key={brand.id} href={toggleBrand(brand.slug)} className="flex items-center gap-2.5 text-[13px] text-[var(--color-body)] hover:text-[var(--color-primary)] cursor-pointer">
                      <div className={`w-3.5 h-3.5 border shrink-0 flex items-center justify-center ${active ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'border-[var(--color-border)]'}`}>
                        {active && <svg width="8" height="6" viewBox="0 0 8 6" fill="white"><path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>}
                      </div>
                      <span className="flex-1">{brand.name}</span>
                      <span className="font-mono text-[11px] text-[var(--color-muted)]">{brand.count}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {selectedBrands.length > 0 && (
            <div className="pt-5">
              <Link
                href={filterUrl({ brands: undefined, page: '1' })}
                className="block w-full h-9 border border-[var(--color-border)] text-[13px] text-center leading-9 text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors"
              >
                Clear filters
              </Link>
            </div>
          )}
        </aside>

        {/* Results */}
        <section>
          {/* Applied filter chips */}
          {selectedBrands.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-4">
              {selectedBrands.map((b) => {
                const brand = allBrands.find((br) => br.slug === b)
                return (
                  <Link
                    key={b}
                    href={toggleBrand(b)}
                    className="inline-flex gap-2 items-center px-3 py-1 border border-[var(--color-border)] bg-[var(--color-elevated)] font-mono text-[12px] text-[var(--color-body)] hover:border-[var(--color-primary)]"
                  >
                    Brand: {brand?.name ?? b}
                    <span className="text-[var(--color-muted)] text-[14px] leading-none">×</span>
                  </Link>
                )
              })}
              <Link href={filterUrl({ brands: undefined, page: '1' })} className="px-3 py-1 font-mono text-[12px] text-[var(--color-accent)] hover:underline">
                Clear all
              </Link>
            </div>
          )}

          {/* Toolbar */}
          <div className="flex justify-between items-center pb-4 border-b border-[var(--color-border-2)] mb-4">
            <p className="font-mono text-[12px] text-[var(--color-muted)]">
              {total > 0 ? (
                <>Showing <b className="text-[var(--color-primary)]">{from}–{to}</b> of <b className="text-[var(--color-primary)]">{total}</b> SKUs</>
              ) : (
                <>No products found</>
              )}
            </p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[var(--color-muted)]">Sort by:</span>
              <div className="flex border border-[var(--color-border)]">
                {[
                  { val: '', label: 'Latest' },
                  { val: 'az', label: 'A–Z' },
                  { val: 'za', label: 'Z–A' },
                ].map((opt) => (
                  <Link
                    key={opt.val}
                    href={filterUrl({ sort: opt.val || undefined, page: '1' })}
                    className={`px-3 py-1.5 font-mono text-[11px] ${(sp.sort ?? '') === opt.val ? 'bg-[var(--color-primary)] text-[var(--color-elevated)]' : 'text-[var(--color-muted)] hover:bg-[var(--color-deep)]'}`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Product grid */}
          {products.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-[var(--color-border)]">
              <p className="text-[var(--color-muted)] text-sm">No products found</p>
              <p className="text-[var(--color-muted)] text-xs mt-1">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-1 pt-10">
              {page > 1 && (
                <Link href={filterUrl({ page: String(page - 1) })} className="w-9 h-9 border border-[var(--color-border)] flex items-center justify-center font-mono text-[13px] text-[var(--color-muted)] hover:bg-[var(--color-deep)]">
                  ‹
                </Link>
              )}
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = i + 1
                return (
                  <Link
                    key={p}
                    href={filterUrl({ page: String(p) })}
                    className={`w-9 h-9 border flex items-center justify-center font-mono text-[13px] ${p === page ? 'bg-[var(--color-primary)] text-[var(--color-elevated)] border-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-deep)]'}`}
                  >
                    {p}
                  </Link>
                )
              })}
              {page < totalPages && (
                <Link href={filterUrl({ page: String(page + 1) })} className="w-9 h-9 border border-[var(--color-border)] flex items-center justify-center font-mono text-[13px] text-[var(--color-muted)] hover:bg-[var(--color-deep)]">
                  ›
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
