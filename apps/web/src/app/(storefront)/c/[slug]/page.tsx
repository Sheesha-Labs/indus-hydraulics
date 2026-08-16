import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@indus/db'
import { buildBreadcrumbLd, buildCollectionLd } from '@indus/domain'
import { Breadcrumb, Button, EmptyState, JsonLd, Note } from '@indus/ui'
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
    <div className="mx-auto max-w-[1440px] px-12">
      <JsonLd data={[collectionLd, breadcrumbLd]} />
      {/* Breadcrumbs */}
      <div className="border-b border-ih-border py-4">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Categories', href: '/c' },
            { label: category.name },
          ]}
        />
      </div>

      {/* Category header */}
      <div className="border-b border-ih-border py-8">
        <p className="mb-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
          Category
        </p>
        <h1 className="mb-3 font-serif text-[clamp(30px,4vw,40px)] font-normal leading-[1.06] tracking-[-0.01em]">
          {category.name}
        </h1>
        {category.shortDescription && (
          <p className="mb-4 max-w-[620px] text-[14px] leading-[1.55] text-ih-muted">
            {category.shortDescription}
          </p>
        )}
        <div className="flex gap-6 font-mono text-[12px] text-ih-muted">
          <span><b className="font-medium text-ih-ink">{total}</b> SKUs</span>
          <span><b className="font-medium text-ih-ink">{allBrands.length}</b> brands</span>
        </div>
      </div>

      {/* Sub-categories */}
      {category.children.length > 0 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-ih-border py-4">
          {category.children.map((child) => (
            <Link
              key={child.id}
              href={`/c/${child.slug}`}
              className="inline-flex h-[30px] shrink-0 items-center whitespace-nowrap rounded-full border border-ih-border bg-ih-surface px-3 text-[12.5px] text-ih-ink-2 transition-colors hover:border-ih-accent hover:text-ih-accent"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}

      {/* Main listing */}
      <div className="grid gap-9 py-8 pb-16 lg:grid-cols-[248px_1fr]">
        {/* Filter sidebar */}
        <aside className="self-start lg:sticky lg:top-[124px] lg:max-h-[calc(100vh-150px)] lg:overflow-y-auto">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
                Refine{selectedBrands.length > 0 ? ` · ${selectedBrands.length} active` : ''}
              </span>
              {selectedBrands.length > 0 && (
                <Link
                  href={filterUrl({ brands: undefined, page: '1' })}
                  className="text-xs text-ih-accent hover:underline"
                >
                  Clear
                </Link>
              )}
            </div>

            {allBrands.length > 0 && (
              <div>
                <div className="mb-3 border-b border-ih-border pb-2.5">
                  <span className="text-[12.5px] font-medium">Brand</span>
                </div>
                {/*
                  Facets are links, not form controls: 03 §7 requires facet
                  state to live in the URL because these pages are the SEO
                  surface and sales share filtered links. The checkbox is
                  therefore presentational — the real control is the anchor,
                  and aria-pressed carries the state that the tick conveys
                  visually.
                */}
                <div className="flex flex-col gap-2.5">
                  {allBrands.map((brand) => {
                    const active = selectedBrands.includes(brand.slug)
                    return (
                      <Link
                        key={brand.id}
                        href={toggleBrand(brand.slug)}
                        aria-pressed={active}
                        className={`flex items-center gap-2.5 text-[13px] transition-colors ${
                          active ? 'text-ih-ink' : 'text-ih-ink-2 hover:text-ih-ink'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`inline-grid h-4 w-4 shrink-0 place-items-center rounded-[3px] border transition-colors ${
                            active
                              ? 'border-ih-accent bg-ih-accent text-white'
                              : 'border-ih-border-strong bg-ih-surface'
                          }`}
                        >
                          {active && (
                            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none">
                              <path
                                d="m5 12 5 5L20 7"
                                stroke="currentColor"
                                strokeWidth="2.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                        <span className="flex-1">{brand.name}</span>
                        <span className="font-mono text-[10.5px] tabular-nums text-ih-muted-2">{brand.count}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/*
              The cross-reference prompt from the artboard's facet rail. It is
              here because a filtered listing that returns nothing useful is
              exactly where someone with a dead part number gives up.
            */}
            <Note>
              <span className="block text-[13px] font-medium">Can&rsquo;t find the part?</span>
              <span className="mt-1.5 block leading-[1.5]">
                Send the number or a photo of the nameplate. We cross-reference obsolete codes daily.
              </span>
              <Button asChild kind="primary" size="sm" block className="mt-3">
                <Link href="/replacement">Cross-reference it</Link>
              </Button>
            </Note>
          </div>
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
                    className="inline-flex h-[30px] items-center gap-1.5 rounded-full border border-ih-accent bg-ih-accent px-3 text-[12.5px] text-white transition-colors hover:bg-ih-accent-hover"
                  >
                    Brand: {brand?.name ?? b}
                    <span aria-hidden="true" className="text-[14px] leading-none opacity-70">×</span>
                  </Link>
                )
              })}
              <Link href={filterUrl({ brands: undefined, page: '1' })} className="inline-flex h-[30px] items-center px-2 text-[12.5px] text-ih-accent hover:underline">
                Clear all
              </Link>
            </div>
          )}

          {/* Toolbar */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-ih-border pb-4">
            <p className="font-mono text-[12px] tabular-nums text-ih-muted">
              {total > 0 ? (
                <>Showing <b className="font-medium text-ih-ink">{from}–{to}</b> of <b className="font-medium text-ih-ink">{total}</b> SKUs</>
              ) : (
                <>No products found</>
              )}
            </p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-ih-muted">Sort</span>
              <div className="flex overflow-hidden rounded-md border border-ih-border">
                {[
                  { val: '', label: 'Latest' },
                  { val: 'az', label: 'A–Z' },
                  { val: 'za', label: 'Z–A' },
                ].map((opt) => (
                  <Link
                    key={opt.val}
                    href={filterUrl({ sort: opt.val || undefined, page: '1' })}
                    className={`px-3 py-1.5 text-[12.5px] transition-colors ${(sp.sort ?? '') === opt.val ? 'bg-ih-accent text-white' : 'text-ih-ink-2 hover:bg-ih-surface-2'}`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Product grid */}
          {products.length === 0 ? (
            <div className="rounded-lg border border-ih-border bg-ih-surface">
              {/*
                Two different empty states, because they have two different
                fixes. Filters excluding everything is recoverable in one
                click; a genuinely empty category is not, and sending someone
                to "clear filters" they never set reads as broken.
              */}
              {selectedBrands.length > 0 ? (
                <EmptyState
                  condition="No SKUs match these filters"
                  message={`Nothing in ${category.name} matches the brands you have selected.`}
                  action={
                    <Button asChild kind="outline">
                      <Link href={filterUrl({ brands: undefined, page: '1' })}>Clear filters</Link>
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  condition="Nothing listed yet"
                  message="This category has no published SKUs. Tell us what you need and an engineer will source it."
                  action={
                    <Button asChild kind="primary">
                      <Link href="/quote/submit">Request a quote</Link>
                    </Button>
                  }
                />
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-1 pt-10">
              {page > 1 && (
                <Link href={filterUrl({ page: String(page - 1) })} className="flex h-9 w-9 items-center justify-center rounded-md border border-ih-border font-mono text-[13px] text-ih-ink-2 transition-colors hover:border-ih-accent hover:text-ih-accent">
                  ‹
                </Link>
              )}
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = i + 1
                return (
                  <Link
                    key={p}
                    href={filterUrl({ page: String(p) })}
                    className={`flex h-9 w-9 items-center justify-center rounded-md border font-mono text-[13px] tabular-nums transition-colors ${p === page ? 'border-ih-accent bg-ih-accent text-white' : 'border-ih-border text-ih-ink-2 hover:border-ih-accent hover:text-ih-accent'}`}
                  >
                    {p}
                  </Link>
                )
              })}
              {page < totalPages && (
                <Link href={filterUrl({ page: String(page + 1) })} className="flex h-9 w-9 items-center justify-center rounded-md border border-ih-border font-mono text-[13px] text-ih-ink-2 transition-colors hover:border-ih-accent hover:text-ih-accent">
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
