import { mediaUrl } from '../../../lib/media'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { db } from '@indus/db'
import {
  AVAILABILITY_LABELS,
  offeredAvailabilityModes,
  PAGE_SIZE,
  SEARCH_TYPES,
  SEARCH_TYPE_LABELS,
  SORT_LABELS,
  SORT_MODES,
  availabilityToWhere,
  buildPageNumbers,
  parseAvailabilityParam,
  parsePageParam,
  parseSortParam,
  parseTypesParam,
  proposeAlternates,
  serializeTypesParam,
  sortToOrderBy,
  toggleType,
  totalPageCount,
  type AlternateSuggestion,
  type AvailabilityMode,
  type SearchType,
  type SortMode,
} from '@indus/domain'
import { runSearch } from '../../../lib/search'
import { runBlogSearch } from '../../../lib/search-blog'
import SearchLogger from './SearchLogger'
import AnalyticsEvent from '../../../components/AnalyticsEvent'

type Props = {
  searchParams: Promise<{
    q?: string
    brands?: string
    category?: string
    page?: string
    sort?: string
    types?: string
    avail?: string
  }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams
  return { title: sp.q ? `Search: ${sp.q}` : 'Search' }
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams
  const query = (sp.q ?? '').trim()
  const selectedBrands = sp.brands ? sp.brands.split(',').filter(Boolean) : []
  const selectedCategory = sp.category ?? ''
  const sortMode: SortMode = parseSortParam(sp.sort)
  const currentPage = parsePageParam(sp.page)
  const selectedTypes: SearchType[] = parseTypesParam(sp.types)
  const availability: AvailabilityMode | null = parseAvailabilityParam(sp.avail)

  let products: Awaited<
    ReturnType<typeof db.product.findMany<{ include: { brand: true; category: true; images: { include: { media: true } } } }>>
  > = []
  let totalProducts = 0
  let facetBrands: { id: string; name: string; slug: string; count: number }[] = []
  let facetCategories: { id: string; name: string; slug: string; count: number }[] = []
  let relatedDocs: Awaited<
    ReturnType<typeof db.productDocument.findMany<{ include: { media: true; product: { select: { sku: true; title: true } } } }>>
  > = []
  let usedFallback = false
  let blogPosts: Awaited<
    ReturnType<typeof db.blogPost.findMany<{ include: { hero: true; author: { select: { name: true } } } }>>
  > = []
  let totalBlog = 0

  let alternates: AlternateSuggestion[] = []

  if (query.length >= 2) {
    // Always run the product FTS — the redirect short-circuit (exact SKU
    // match) lives there and shouldn't be skipped just because the user
    // unchecked the Products type. We also fetch synonym + redirect
    // rules in the same Promise.all so the page can offer "did you mean"
    // alternates when results are thin.
    const [plan, blogResult, synRows, redirRows] = await Promise.all([
      runSearch(query),
      selectedTypes.includes('articles')
        ? runBlogSearch(query)
        : Promise.resolve({ postIds: [], scoreById: new Map<string, number>() }),
      db.searchSynonym.findMany({
        where: { isActive: true },
        select: { group: true, term: true },
      }),
      db.searchRedirect.findMany({
        where: { isActive: true },
        select: { query: true, targetUrl: true },
      }),
    ])
    if (plan.kind === 'redirect') {
      redirect(plan.targetUrl)
    }
    usedFallback = plan.usedFallback

    // Group synonym rows into the SynonymGroup shape proposeAlternates
    // expects.
    const synonymsByGroup = new Map<string, string[]>()
    for (const row of synRows) {
      const list = synonymsByGroup.get(row.group)
      if (list) list.push(row.term)
      else synonymsByGroup.set(row.group, [row.term])
    }
    const synonymGroups = Array.from(synonymsByGroup.entries()).map(([group, terms]) => ({
      group,
      terms,
    }))

    // Compute alternates against the *product* result count — that's the
    // primary signal a customer cares about. Using the union with blog/
    // datasheets would suppress alternates too aggressively.
    const productResultCount = plan.productIds.length
    alternates = proposeAlternates({
      query,
      synonyms: synonymGroups,
      redirects: redirRows.map((r) => ({ query: r.query, targetUrl: r.targetUrl })),
      resultCount: productResultCount,
    })

    if (selectedTypes.includes('articles') && blogResult.postIds.length > 0) {
      const blogRows = await db.blogPost.findMany({
        where: { id: { in: blogResult.postIds }, isPublished: true },
        include: {
          hero: true,
          author: { select: { name: true } },
        },
        take: 8,
      })
      // Re-order to FTS rank.
      blogPosts = blogRows
        .slice()
        .sort(
          (a, b) =>
            (blogResult.scoreById.get(b.id) ?? 0) - (blogResult.scoreById.get(a.id) ?? 0),
        )
      totalBlog = blogPosts.length
    }

    if (plan.productIds.length > 0) {
      // Apply facet filters at app level — keeps the FTS SQL simple and
      // avoids array-binding gymnastics. The FTS pass already capped
      // results at FTS_FETCH_LIMIT (600), so we have headroom to filter
      // and paginate without re-running the FTS query.
      const orderBy = sortToOrderBy(sortMode)
      const availabilityFilter = availabilityToWhere(availability)
      const filteredById = await db.product.findMany({
        where: {
          id: { in: plan.productIds },
          status: 'active',
          ...(selectedBrands.length > 0 ? { brand: { slug: { in: selectedBrands } } } : {}),
          ...(selectedCategory ? { category: { slug: selectedCategory } } : {}),
          ...(availabilityFilter ?? {}),
        },
        include: {
          brand: true,
          category: true,
          images: { orderBy: { position: 'asc' }, take: 1, include: { media: true } },
        },
        // For non-relevance sorts, push the order down to Postgres so
        // pagination is correct across pages. Relevance keeps Postgres-
        // arbitrary order then re-sorts in JS by FTS score below.
        ...(orderBy ? { orderBy } : {}),
      })

      totalProducts = filteredById.length
      const ordered =
        sortMode === 'relevance'
          ? filteredById
              .slice()
              .sort(
                (a, b) => (plan.scoreById.get(b.id) ?? 0) - (plan.scoreById.get(a.id) ?? 0),
              )
          : filteredById

      const start = (currentPage - 1) * PAGE_SIZE
      products = ordered.slice(start, start + PAGE_SIZE)

      // Facets are computed across ALL FTS hits (pre-filter) so a clicked
      // filter doesn't make the alternative facets vanish.
      const allBrandIds = await db.product.findMany({
        where: { id: { in: plan.productIds } },
        select: { brandId: true },
      })
      const allCategoryIds = await db.product.findMany({
        where: { id: { in: plan.productIds } },
        select: { categoryId: true },
      })

      const brandCounts = countNonNull(allBrandIds.map((p) => p.brandId))
      const categoryCounts = countNonNull(allCategoryIds.map((p) => p.categoryId))

      const [brandRows, catRows, docs] = await Promise.all([
        brandCounts.size > 0
          ? db.brand.findMany({ where: { id: { in: Array.from(brandCounts.keys()) } } })
          : Promise.resolve([]),
        categoryCounts.size > 0
          ? db.category.findMany({ where: { id: { in: Array.from(categoryCounts.keys()) } } })
          : Promise.resolve([]),
        db.productDocument.findMany({
          where: {
            isGated: false,
            product: { id: { in: plan.productIds }, status: 'active' },
          },
          include: { media: true, product: { select: { sku: true, title: true } } },
          take: 4,
        }),
      ])

      facetBrands = brandRows.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        count: brandCounts.get(b.id) ?? 0,
      }))
      facetCategories = catRows.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        count: categoryCounts.get(c.id) ?? 0,
      }))
      relatedDocs = docs
    }
  }

  function filterUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams()
    const base = {
      q: query,
      brands: selectedBrands.join(',') || undefined,
      category: selectedCategory || undefined,
      page: currentPage > 1 ? String(currentPage) : undefined,
      sort: sortMode === 'relevance' ? undefined : sortMode,
      types: serializeTypesParam(selectedTypes) ?? undefined,
      avail: availability ?? undefined,
    }
    const merged = { ...base, ...overrides }
    for (const [k, v] of Object.entries(merged)) {
      if (v) p.set(k, v)
    }
    return `/search?${p.toString()}`
  }

  function toggleAvailability(mode: AvailabilityMode) {
    const next = availability === mode ? undefined : mode
    return filterUrl({ avail: next, page: undefined })
  }

  function toggleBrand(slug: string) {
    const next = selectedBrands.includes(slug)
      ? selectedBrands.filter((b) => b !== slug)
      : [...selectedBrands, slug]
    // Toggling a facet always sends the user back to page 1 — otherwise
    // they could land on an empty page when the result set shrinks.
    return filterUrl({ brands: next.join(',') || undefined, page: undefined })
  }

  function toggleTypeUrl(type: SearchType) {
    const next = toggleType(selectedTypes, type)
    return filterUrl({ types: serializeTypesParam(next) ?? undefined, page: undefined })
  }

  // Per-type total counts shown in the Type filter and the result-count
  // line ("14 products · 3 datasheets · 1 article").
  const totalDatasheets = relatedDocs.length
  const showProductsSection = selectedTypes.includes('products') && products.length > 0
  const showDatasheetsSection = selectedTypes.includes('datasheets') && totalDatasheets > 0
  const showArticlesSection = selectedTypes.includes('articles') && blogPosts.length > 0
  const anyResults = showProductsSection || showDatasheetsSection || showArticlesSection

  const totalPages = totalPageCount(totalProducts)
  const pageTokens = buildPageNumbers(currentPage, totalPages)

  const topMatch = products[0]
  const restProducts = products.slice(1)

  return (
    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12 py-8 pb-16">
      {/* Fire-and-forget query log + click-through tracker. */}
      {query.length >= 2 && (
        <SearchLogger query={query} resultsCount={products.length} usedFallback={usedFallback} />
      )}

      {/* Funnel analytics: every search emits `search_performed`; the
          zero-results variant fires only when the query actually returned
          nothing, so we can build a "queries we can't answer" report. */}
      {query.length >= 2 && (
        <>
          <AnalyticsEvent
            name="search_performed"
            props={{
              query,
              resultCount: products.length,
              usedFallback,
            }}
          />
          {products.length === 0 && (
            <AnalyticsEvent name="search_zero_results" props={{ query, usedFallback }} />
          )}
        </>
      )}

      <div className="flex items-baseline gap-4 flex-wrap mb-3">
        <h1 className="text-[32px] font-semibold tracking-[-0.02em]">Search results</h1>
        {query.length >= 2 && (
          <span className="font-mono text-[13px] text-ih-muted">
            for &ldquo;<b className="text-ih-ink">{query}</b>&rdquo; · {totalProducts} match
            {totalProducts !== 1 ? 'es' : ''}
            {usedFallback && (
              <span className="ml-2 px-1.5 py-0.5 bg-ih-surface-2 text-[10px] font-mono uppercase tracking-wider">
                Suggested
              </span>
            )}
          </span>
        )}
      </div>

      <form method="GET" action="/search" className="mb-4 max-w-[640px]">
        <div className="flex border border-ih-border bg-ih-surface">
          {/* `min-w-0` is load-bearing. A flex item defaults to
              `min-width: auto`, and on an input that resolves to its
              intrinsic width — about 20 characters, per the default `size`.
              At 320px the row could not shrink past that, and because the
              button is `shrink-0` the excess was pushed off the right edge
              rather than absorbed. See cause 3 in
              tests/e2e/no-horizontal-overflow.spec.ts. */}
          <input
            name="q"
            defaultValue={query}
            autoFocus
            placeholder="Search products, SKUs, MPNs…"
            className="min-w-0 flex-1 px-4 py-3 bg-transparent text-[14px] text-ih-ink placeholder:text-ih-muted-2 focus:outline-none"
          />
          <button
            type="submit"
            className="h-11 px-5 bg-ih-accent text-white font-mono text-[12px] hover:opacity-90 transition-opacity shrink-0"
          >
            Search
          </button>
        </div>
      </form>

      {alternates.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-8">
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ih-muted">
            Did you mean
          </span>
          {alternates.map((alt) => (
            <Link
              key={alt.query}
              href={`/search?q=${encodeURIComponent(alt.query)}`}
              className="px-2.5 py-1 border border-ih-border bg-ih-surface font-mono text-[12px] text-ih-ink-2 hover:border-ih-accent hover:text-ih-accent transition-colors"
            >
              {alt.query}
            </Link>
          ))}
        </div>
      )}

      {query.length < 2 ? (
        <div className="py-20 text-center">
          <p className="text-ih-muted text-sm">
            Try different keywords or browse our categories.
          </p>
          <div className="mt-6">
            <Link href="/c" className="font-mono text-[12px] text-ih-accent hover:underline">
              Browse Categories →
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          {/* min-w-0: as a grid item this defaults to min-width:auto and
              refused to shrink below its longest filter label. */}
          <aside className="min-w-0">
            <div className="sticky top-[88px] min-w-0">
              <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-ih-muted mb-4">
                Refine results
              </p>

              {/* Type filter — Products / Datasheets / Articles. Empty
                  param is treated as "all", so we show what's checked
                  rather than what's specifically present in the URL. */}
              <div className="mb-5">
                <div className="font-semibold text-[13px] mb-2">Type</div>
                <div className="flex flex-col gap-1.5 text-[13px]">
                  {SEARCH_TYPES.map((type) => {
                    const count =
                      type === 'products'
                        ? totalProducts
                        : type === 'datasheets'
                          ? totalDatasheets
                          : totalBlog
                    const checked = selectedTypes.includes(type)
                    return (
                      <Link
                        key={type}
                        href={toggleTypeUrl(type)}
                        className="flex justify-between items-center text-ih-ink-2 hover:text-ih-ink"
                      >
                        <span className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className={
                              'w-3.5 h-3.5 border border-ih-border flex items-center justify-center text-[10px] ' +
                              (checked ? 'bg-ih-accent text-white' : 'bg-ih-surface')
                            }
                          >
                            {checked ? '✓' : ''}
                          </span>
                          <span className={checked ? 'font-medium text-ih-ink' : ''}>
                            {SEARCH_TYPE_LABELS[type]}
                          </span>
                        </span>
                        <span className="font-mono text-[11px] text-ih-muted-2">{count}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {facetCategories.length > 0 && (
                <div className="mb-5">
                  <div className="font-semibold text-[13px] mb-2">Category</div>
                  <div className="flex flex-col gap-1.5 text-[13px]">
                    {facetCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={filterUrl({ category: selectedCategory === cat.slug ? undefined : cat.slug })}
                        className="flex justify-between items-center text-ih-ink-2 hover:text-ih-ink"
                      >
                        <span className={selectedCategory === cat.slug ? 'font-medium text-ih-accent' : ''}>
                          {cat.name}
                        </span>
                        <span className="font-mono text-[11px] text-ih-muted-2">{cat.count}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {facetBrands.length > 0 && (
                <div className="mb-5">
                  <div className="font-semibold text-[13px] mb-2">Brand</div>
                  <div className="flex flex-col gap-1.5 text-[13px]">
                    {facetBrands.map((brand) => (
                      <Link
                        key={brand.id}
                        href={toggleBrand(brand.slug)}
                        className="flex justify-between items-center text-ih-ink-2 hover:text-ih-ink"
                      >
                        <span className={selectedBrands.includes(brand.slug) ? 'font-medium text-ih-accent' : ''}>
                          {brand.name}
                        </span>
                        <span className="font-mono text-[11px] text-ih-muted-2">{brand.count}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-5">
                <div className="font-semibold text-[13px] mb-2">Availability</div>
                <div className="flex flex-col gap-1.5 text-[13px]">
                  {offeredAvailabilityModes().map((mode) => {
                    const checked = availability === mode
                    return (
                      <Link
                        key={mode}
                        href={toggleAvailability(mode)}
                        className="flex items-center gap-2 text-ih-ink-2 hover:text-ih-ink"
                      >
                        <span
                          aria-hidden="true"
                          className={
                            'w-3.5 h-3.5 border border-ih-border flex items-center justify-center text-[10px] ' +
                            (checked ? 'bg-ih-accent text-white' : 'bg-ih-surface')
                          }
                        >
                          {checked ? '✓' : ''}
                        </span>
                        <span className={checked ? 'font-medium text-ih-ink' : ''}>
                          {AVAILABILITY_LABELS[mode]}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {(selectedBrands.length > 0 || selectedCategory || availability !== null) && (
                <Link
                  href={filterUrl({
                    brands: undefined,
                    category: undefined,
                    avail: undefined,
                    page: undefined,
                  })}
                  className="font-mono text-[12px] text-ih-accent hover:underline"
                >
                  Clear all filters
                </Link>
              )}
            </div>
          </aside>

          <div>
            {!anyResults ? (
              <div className="py-16 border border-dashed border-ih-border text-center">
                <p className="text-ih-muted">No results</p>
                <p className="text-ih-muted text-sm mt-1">
                  Try different keywords, broaden your Type filter, or browse our categories.
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4 text-[13px] text-ih-muted">
                  <span>
                    {[
                      selectedTypes.includes('products')
                        ? `${totalProducts} product${totalProducts !== 1 ? 's' : ''}`
                        : null,
                      selectedTypes.includes('datasheets') && totalDatasheets > 0
                        ? `${totalDatasheets} datasheet${totalDatasheets !== 1 ? 's' : ''}`
                        : null,
                      selectedTypes.includes('articles') && totalBlog > 0
                        ? `${totalBlog} article${totalBlog !== 1 ? 's' : ''}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                    {showProductsSection && totalPages > 1 && (
                      <>
                        {' · page '}
                        <span className="font-mono">{currentPage}</span>
                        {' of '}
                        <span className="font-mono">{totalPages}</span>
                      </>
                    )}
                  </span>
                  <form method="GET" action="/search" className="flex items-center gap-2.5">
                    {/* Preserve the rest of the URL state when the sort
                        changes. Hidden inputs replicate `filterUrl()` minus
                        the sort/page params (changing sort always resets to
                        page 1). */}
                    <input type="hidden" name="q" value={query} />
                    {selectedBrands.length > 0 && (
                      <input type="hidden" name="brands" value={selectedBrands.join(',')} />
                    )}
                    {selectedCategory && (
                      <input type="hidden" name="category" value={selectedCategory} />
                    )}
                    <label className="text-[12px] uppercase tracking-wider" htmlFor="sort-select">
                      Sort
                    </label>
                    <select
                      id="sort-select"
                      name="sort"
                      defaultValue={sortMode}
                      className="font-mono text-[12px] bg-ih-surface border border-ih-border px-2 py-1 text-ih-ink-2"
                    >
                      {SORT_MODES.map((mode) => (
                        <option key={mode} value={mode}>
                          {SORT_LABELS[mode]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="font-mono text-[11px] px-2 py-1 border border-ih-border hover:bg-ih-surface-2"
                    >
                      Apply
                    </button>
                  </form>
                </div>

                {showProductsSection && topMatch && (
                  <div className="mb-6">
                    <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-ih-muted mb-3">
                      Top product match
                    </div>
                    <Link
                      href={`/p/${topMatch.slug}`}
                      data-search-result-sku={topMatch.sku}
                      data-search-result-q={query}
                      className="grid grid-cols-1 gap-6 p-5 border border-ih-border bg-ih-surface border-l-[3px] border-l-ih-accent hover:border-ih-accent hover:border-l-ih-accent transition-colors sm:grid-cols-[140px_1fr]"
                    >
                      <div className="aspect-square bg-ih-surface-2 border border-ih-border relative overflow-hidden">
                        {topMatch.images[0] ? (
                          <Image
                            src={mediaUrl(topMatch.images[0]!.media.storagePath)}
                            alt={topMatch.title}
                            fill
                            className="object-contain p-3"
                            sizes="140px"
                          />
                        ) : (
                          <div className="absolute inset-0 grid place-items-center font-mono text-[10px] text-ih-muted">
                            {topMatch.sku.slice(0, 8)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-mono text-[11px] text-ih-muted tracking-[0.08em] mb-1">
                          {topMatch.sku} · {topMatch.brand?.name ?? ''}
                        </div>
                        <div className="text-[20px] font-semibold tracking-[-0.01em] mb-2 leading-[1.2]">
                          {topMatch.title}
                        </div>
                        {topMatch.descriptionShort && (
                          <p className="text-[13px] text-ih-muted leading-[1.5] mb-3 line-clamp-2">
                            {topMatch.descriptionShort}
                          </p>
                        )}
                        <div className="flex gap-4 font-mono text-[11px] text-ih-muted">
                          {topMatch.category && <span>● {topMatch.category.name}</span>}
                          {topMatch.brand && <span>● {topMatch.brand.name}</span>}
                        </div>
                      </div>
                    </Link>
                  </div>
                )}

                {showProductsSection && restProducts.length > 0 && (
                  <div className="flex flex-col gap-3" data-search-results-list>
                    {restProducts.map((product) => {
                      const img = product.images[0]
                      return (
                        <Link
                          key={product.id}
                          href={`/p/${product.slug}`}
                          data-search-result-sku={product.sku}
                          data-search-result-q={query}
                          className="grid grid-cols-[80px_1fr_auto] gap-5 p-3.5 border border-ih-border bg-ih-surface hover:border-ih-accent transition-colors items-center"
                        >
                          <div className="aspect-square bg-ih-surface-2 border border-ih-border relative overflow-hidden">
                            {img ? (
                              <Image
                                src={mediaUrl(img.media.storagePath)}
                                alt={product.title}
                                fill
                                className="object-contain p-2"
                                sizes="80px"
                              />
                            ) : (
                              <div className="absolute inset-0 grid place-items-center font-mono text-[9px] text-ih-muted">
                                IMG
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-mono text-[11px] text-ih-muted mb-1">
                              {product.sku}
                              {product.brand ? ` · ${product.brand.name}` : ''}
                            </div>
                            <div className="font-medium text-[14px] text-ih-ink">{product.title}</div>
                            {product.descriptionShort && (
                              <p className="text-[13px] text-ih-muted mt-0.5 leading-[1.5] line-clamp-1">
                                {product.descriptionShort}
                              </p>
                            )}
                          </div>
                          <div className="font-mono text-[12px] text-ih-accent shrink-0">View →</div>
                        </Link>
                      )
                    })}
                  </div>
                )}

                {showProductsSection && totalPages > 1 && (
                  <nav
                    aria-label="Search results pagination"
                    className="mt-8 flex justify-center items-center gap-1"
                  >
                    {currentPage > 1 ? (
                      <Link
                        href={filterUrl({ page: currentPage > 2 ? String(currentPage - 1) : undefined })}
                        rel="prev"
                        aria-label="Previous page"
                        className="w-9 h-9 border border-ih-border flex items-center justify-center font-mono text-[13px] text-ih-muted hover:bg-ih-surface-2"
                      >
                        ‹
                      </Link>
                    ) : (
                      <span
                        aria-disabled="true"
                        className="w-9 h-9 border border-ih-border flex items-center justify-center font-mono text-[13px] text-ih-muted-2 opacity-50 cursor-not-allowed"
                      >
                        ‹
                      </span>
                    )}

                    {pageTokens.map((token, i) =>
                      token === 'ellipsis' ? (
                        <span
                          key={`e-${i}`}
                          aria-hidden="true"
                          className="w-9 h-9 flex items-center justify-center font-mono text-[13px] text-ih-muted-2"
                        >
                          …
                        </span>
                      ) : token === currentPage ? (
                        <span
                          key={token}
                          aria-current="page"
                          className="w-9 h-9 border border-ih-accent bg-ih-accent text-white flex items-center justify-center font-mono text-[13px] font-semibold"
                        >
                          {token}
                        </span>
                      ) : (
                        <Link
                          key={token}
                          href={filterUrl({ page: token > 1 ? String(token) : undefined })}
                          aria-label={`Page ${token}`}
                          className="w-9 h-9 border border-ih-border flex items-center justify-center font-mono text-[13px] text-ih-muted hover:bg-ih-surface-2"
                        >
                          {token}
                        </Link>
                      ),
                    )}

                    {currentPage < totalPages ? (
                      <Link
                        href={filterUrl({ page: String(currentPage + 1) })}
                        rel="next"
                        aria-label="Next page"
                        className="w-9 h-9 border border-ih-border flex items-center justify-center font-mono text-[13px] text-ih-muted hover:bg-ih-surface-2"
                      >
                        ›
                      </Link>
                    ) : (
                      <span
                        aria-disabled="true"
                        className="w-9 h-9 border border-ih-border flex items-center justify-center font-mono text-[13px] text-ih-muted-2 opacity-50 cursor-not-allowed"
                      >
                        ›
                      </span>
                    )}
                  </nav>
                )}

                {showDatasheetsSection && (
                  <div className="mt-8 pt-6 border-t border-ih-border">
                    <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-ih-muted mb-4">
                      Datasheets &amp; PDFs
                    </div>
                    <div className="flex flex-col gap-2">
                      {relatedDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="grid grid-cols-[36px_1fr_auto] gap-4 p-3.5 border border-ih-border bg-ih-surface items-center"
                        >
                          <div className="w-8 h-9 bg-ih-navy text-white grid place-items-center font-mono text-[9px] font-semibold">
                            {doc.kind.toUpperCase().slice(0, 4)}
                          </div>
                          <div>
                            <div className="font-medium text-[13px]">{doc.title}</div>
                            <div className="font-mono text-[11px] text-ih-muted">
                              {doc.kind.toUpperCase()} · {doc.product.sku}
                            </div>
                          </div>
                          <a
                            href={mediaUrl(doc.media.storagePath)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 h-8 px-3 border border-ih-border font-mono text-[11px] flex items-center text-ih-ink-2 hover:bg-ih-surface-2 transition-colors"
                          >
                            Download ↓
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showArticlesSection && (
                  <div className="mt-8 pt-6 border-t border-ih-border">
                    <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-ih-muted mb-4">
                      From the blog
                    </div>
                    <div className="flex flex-col gap-3">
                      {blogPosts.map((post) => (
                        <Link
                          key={post.id}
                          href={`/blog/${post.slug}`}
                          className="grid grid-cols-[120px_1fr] gap-4 p-3.5 border border-ih-border bg-ih-surface hover:border-ih-accent transition-colors"
                        >
                          <div className="aspect-[4/3] bg-ih-surface-2 border border-ih-border relative overflow-hidden">
                            {post.hero ? (
                              <Image
                                src={mediaUrl(post.hero.storagePath)}
                                alt={post.title}
                                fill
                                className="object-cover"
                                sizes="120px"
                              />
                            ) : (
                              <div className="absolute inset-0 grid place-items-center font-mono text-[9px] text-ih-muted">
                                BLOG
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-mono text-[11px] tracking-[0.08em] uppercase text-ih-muted mb-1">
                              Article
                              {post.publishedAt && (
                                <>
                                  {' · '}
                                  {new Date(post.publishedAt).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </>
                              )}
                            </div>
                            <h3 className="font-semibold text-[15px] mb-1.5 leading-snug">{post.title}</h3>
                            {post.excerpt && (
                              <p className="text-[12px] text-ih-muted leading-[1.5] line-clamp-2">
                                {post.excerpt}
                              </p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function countNonNull<T extends string>(values: (T | null)[]): Map<T, number> {
  const counts = new Map<T, number>()
  for (const v of values) {
    if (v == null) continue
    counts.set(v, (counts.get(v) ?? 0) + 1)
  }
  return counts
}
