import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@indus/db'
import {
  MAX_CATEGORY_DEPTH,
  buildBreadcrumbLd,
  buildCollectionLd,
  buildSpecFacets,
  countSelected,
  parseSpecFilter,
  productIdsMatching,
  pruneSpecFilter,
  serialiseSpecFilter,
  toggleSpecValue,
} from '@indus/domain'
import { Breadcrumb, Button, EmptyState, JsonLd, Note } from '@indus/ui'
import { pageMetadata, urlFor } from '../../../../lib/seo'
import ProductCard from '../../../../components/ProductCard'

const PAGE_SIZE = 12

type SearchParams = {
  brands?: string
  page?: string
  sort?: string
  /**
   * Spec facets, as `label-key:value-key,value-key;other-label:value-key`.
   *
   * Both halves are normalised keys rather than the raw text, because real
   * values contain commas (`JIS 30° cone (60° included), BSP thread`) and real
   * labels contain slashes (`Figure / Pressure Series`). See
   * `parseSpecFilter` in @indus/domain.
   */
  spec?: string
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

/*
 * There is deliberately no `generateStaticParams` here.
 *
 * It used to pre-render every published category. The page awaits
 * `searchParams` (the brand / sort / page facets) in both `generateMetadata`
 * and the component, which is per-request, so Next marks `/c/[slug]` `ƒ`
 * (dynamic). Every pre-rendered category was therefore rendered at build,
 * bailed out at the first facet read, and discarded — the deployed route was
 * dynamic regardless. All it cost was build time against a Supabase pool
 * capped for the build (packages/db/src/datasource-url.ts).
 *
 * Same rule as /p/[slug]: put a list back only alongside the change that
 * makes this page cacheable. `revalidate` above stays for the same reason.
 */

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
  const isFacetVariant = !!(sp.brands || sp.spec || sp.sort || (sp.page && sp.page !== '1'))
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

/**
 * A category id plus every published category beneath it.
 *
 * Breadth-first and level-by-level, so it costs one query per level of depth
 * rather than one per category. `MAX_DEPTH` bounds it: the tree is three deep
 * today, and a cycle introduced by bad data must not turn this into an
 * infinite loop inside a request.
 */
const MAX_DEPTH = 6

/**
 * Root → this category, for the breadcrumb trail.
 *
 * The trail used to be a hardcoded `Home / Categories / <name>` at every depth,
 * so a category three levels down claimed to sit directly under the catalogue
 * root. That was wrong twice over: the visible trail gave no way back to the
 * parent hub, and the `BreadcrumbList` JSON-LD told Google the same flat lie,
 * which is what it renders under the result title.
 *
 * One query per level, bounded by `MAX_CATEGORY_DEPTH`, walking up rather than
 * down. Unpublished ancestors are kept in the chain — skipping one would join a
 * grandchild straight onto its grandparent and imply a parentage that does not
 * exist — but they are rendered as plain text, not links, since their own page
 * 404s.
 */
async function ancestorTrail(
  categoryId: string,
): Promise<Array<{ name: string; slug: string; isPublished: boolean }>> {
  const trail: Array<{ name: string; slug: string; isPublished: boolean }> = []
  let cursor: string | null = categoryId
  for (let depth = 0; cursor && depth <= MAX_CATEGORY_DEPTH + 1; depth++) {
    const row: { name: string; slug: string; isPublished: boolean; parentId: string | null } | null =
      await db.category.findUnique({
        where: { id: cursor },
        select: { name: true, slug: true, isPublished: true, parentId: true },
      })
    if (!row) break
    trail.unshift({ name: row.name, slug: row.slug, isPublished: row.isPublished })
    cursor = row.parentId
  }
  return trail
}

async function descendantCategoryIds(rootId: string): Promise<string[]> {
  const all = [rootId]
  let frontier = [rootId]
  for (let depth = 0; depth < MAX_DEPTH && frontier.length > 0; depth++) {
    const children = await db.category.findMany({
      where: { parentId: { in: frontier }, isPublished: true },
      select: { id: true },
    })
    frontier = children.map((c) => c.id).filter((id) => !all.includes(id))
    all.push(...frontier)
  }
  return all
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

  // Products roll up from the whole sub-tree, not just this category.
  //
  // Listings hang off leaf categories, so a hub with children of its own owned
  // nothing directly and rendered "0 SKUs · 0 brands" over the "NOTHING LISTED
  // YET" empty state — while its own sub-category chips sat directly above,
  // linking to pages full of products. Every branch category in the tree did
  // this: Ferrules, Metallic Hoses, and every root reached from /c.
  const [categoryIds, trail] = await Promise.all([
    descendantCategoryIds(category.id),
    ancestorTrail(category.id),
  ])

  /*
   * Spec facets are computed from every product the OTHER filters leave in
   * scope, and applied afterwards.
   *
   * Counts therefore reflect the brand filter but not the spec filter itself,
   * which is what keeps a facet's numbers still while you tick values inside
   * it. Recomputing per-facet — counts for facet A excluding A's own
   * selection — is the more precise convention and costs a pass per facet;
   * with at most ~70 products in the largest category it buys nothing a
   * reader would notice.
   */
  const brandScope = {
    categoryId: { in: categoryIds },
    status: 'active' as const,
    ...(selectedBrands.length > 0 ? { brand: { slug: { in: selectedBrands } } } : {}),
  }

  const facetRows = await db.productSpec.findMany({
    where: { isFilterable: true, product: brandScope },
    select: { productId: true, label: true, value: true },
  })
  const facets = buildSpecFacets(facetRows)
  // Pruned against what this category actually offers: a bookmarked URL
  // outlives the values it names, and a stale one would otherwise match
  // nothing while showing a chip the reader cannot find in the panel.
  const specFilter = pruneSpecFilter(parseSpecFilter(sp.spec), facets)
  const specMatchIds = productIdsMatching(facetRows, specFilter)

  const where = {
    ...brandScope,
    ...(specMatchIds ? { id: { in: [...specMatchIds] } } : {}),
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
      where: { categoryId: { in: categoryIds }, status: 'active' },
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
    const base = {
      brands: selectedBrands.join(',') || undefined,
      spec: serialiseSpecFilter(specFilter),
      page: page > 1 ? String(page) : undefined,
      sort: sp.sort,
    }
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

  /** Back to page 1: a filter change re-cuts the list, so page 4 of it is meaningless. */
  function toggleSpec(labelKey: string, valueKey: string) {
    return filterUrl({
      spec: serialiseSpecFilter(toggleSpecValue(specFilter, labelKey, valueKey)),
      page: '1',
    })
  }

  const selectedSpecCount = countSelected(specFilter)
  const activeFilterCount = selectedBrands.length + selectedSpecCount

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
      { name: 'Categories', url: urlFor('/c') },
      ...trail.map((step) => ({ name: step.name, url: urlFor(`/c/${step.slug}`) })),
    ],
  })

  return (
    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12">
      <JsonLd data={[collectionLd, breadcrumbLd]} />
      {/* Breadcrumbs */}
      <div className="border-b border-ih-border py-4">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Categories', href: '/c' },
            ...trail.map((step, i) => ({
              label: step.name,
              // The last step is this page — never a link to itself. An
              // unpublished ancestor is not linked either: its page 404s.
              href:
                i === trail.length - 1 || !step.isPublished ? undefined : `/c/${step.slug}`,
            })),
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
      <div className="grid grid-cols-1 gap-9 py-8 pb-16 lg:grid-cols-[248px_1fr]">
        {/* Filter sidebar */}
        <aside className="self-start lg:sticky lg:top-[124px] lg:max-h-[calc(100vh-150px)] lg:overflow-y-auto">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
                Refine{activeFilterCount > 0 ? ` · ${activeFilterCount} active` : ''}
              </span>
              {activeFilterCount > 0 && (
                <Link
                  href={filterUrl({ brands: undefined, spec: undefined, page: '1' })}
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
              Spec facets — thread form, body configuration, pressure class.
              Which specs appear is decided per category by `buildSpecFacets`:
              a spec earns a panel only when it actually partitions the
              products, so an identifier column like `Series` (29 values across
              29 couplers) and a constant like `Max Working Pressure` (one
              value across 44 adapters) never draw one.
            */}
            {facets.map((facet) => {
              const selected = specFilter.get(facet.key) ?? new Set<string>()
              return (
                <div key={facet.key}>
                  <div className="mb-3 border-b border-ih-border pb-2.5">
                    <span className="text-[12.5px] font-medium">{facet.label}</span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {facet.values.map((value) => {
                      const active = selected.has(value.key)
                      return (
                        <Link
                          key={value.key}
                          href={toggleSpec(facet.key, value.key)}
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
                          <span className="flex-1">{value.label}</span>
                          <span className="font-mono text-[10.5px] tabular-nums text-ih-muted-2">
                            {value.count}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}

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
          {activeFilterCount > 0 && (
            <div className="flex gap-2 flex-wrap mb-4">
              {[...specFilter].flatMap(([labelKey, values]) => {
                const facet = facets.find((f) => f.key === labelKey)
                if (!facet) return []
                return [...values].flatMap((valueKey) => {
                  const value = facet.values.find((v) => v.key === valueKey)
                  if (!value) return []
                  return [
                    <Link
                      key={`${labelKey}:${valueKey}`}
                      href={toggleSpec(labelKey, valueKey)}
                      className="inline-flex h-[30px] items-center gap-1.5 rounded-full border border-ih-accent bg-ih-accent px-3 text-[12.5px] text-white transition-colors hover:bg-ih-accent-hover"
                    >
                      {facet.label}: {value.label}
                      <span aria-hidden="true" className="text-[14px] leading-none opacity-70">
                        ×
                      </span>
                    </Link>,
                  ]
                })
              })}
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
