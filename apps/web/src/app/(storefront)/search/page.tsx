import { CATEGORY_WITH_IMAGE_CHAIN, nearestCategoryImage } from '../../../lib/category-fallback'
import { CategoryFallbackImage } from '../../../components/ProductCard'
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
    ReturnType<
      typeof db.product.findMany<{
        include: {
          brand: true
          category: typeof CATEGORY_WITH_IMAGE_CHAIN
          images: { include: { media: true } }
        }
      }>
    >
  > = []
  let totalProducts = 0
  let facetBrands: { id: string; name: string; slug: string; count: number }[] = []
  let facetCategories: { id: string; name: string; slug: string; count: number }[] = []
  let relatedDocs: Awaited<
    ReturnType<
      typeof db.productDocument.findMany<{
        include: { media: true; product: { select: { sku: true; title: true } } }
      }>
    >
  > = []
  let usedFallback = false
  let blogPosts: Awaited<
    ReturnType<
      typeof db.blogPost.findMany<{ include: { hero: true; author: { select: { name: true } } } }>
    >
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
          (a, b) => (blogResult.scoreById.get(b.id) ?? 0) - (blogResult.scoreById.get(a.id) ?? 0)
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
          category: CATEGORY_WITH_IMAGE_CHAIN,
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
              .sort((a, b) => (plan.scoreById.get(b.id) ?? 0) - (plan.scoreById.get(a.id) ?? 0))
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
    <div className="mx-auto max-w-[1440px] px-5 py-8 pb-16 sm:px-8 xl:px-12">
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

      <div className="mb-3 flex flex-wrap items-baseline gap-4">
        <h1 className="text-[32px] font-semibold tracking-[-0.02em]">Search results</h1>
        {query.length >= 2 && (
          <span className="text-ih-muted font-mono text-[13px]">
            for &ldquo;<b className="text-ih-ink">{query}</b>&rdquo; · {totalProducts} match
            {totalProducts !== 1 ? 'es' : ''}
            {usedFallback && (
              <span className="bg-ih-surface-2 ml-2 px-1.5 py-0.5 font-mono text-[10px] tracking-wider uppercase">
                Suggested
              </span>
            )}
          </span>
        )}
      </div>

      <form method="GET" action="/search" className="mb-4 max-w-[640px]">
        <div className="border-ih-border bg-ih-surface flex border">
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
            className="text-ih-ink placeholder:text-ih-muted-2 min-w-0 flex-1 bg-transparent px-4 py-3 text-[14px] focus:outline-none"
          />
          <button
            type="submit"
            className="bg-ih-accent h-11 shrink-0 px-5 font-mono text-[12px] text-white transition-opacity hover:opacity-90"
          >
            Search
          </button>
        </div>
      </form>

      {alternates.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <span className="text-ih-muted font-mono text-[11px] tracking-[0.1em] uppercase">
            Did you mean
          </span>
          {alternates.map((alt) => (
            <Link
              key={alt.query}
              href={`/search?q=${encodeURIComponent(alt.query)}`}
              className="border-ih-border bg-ih-surface text-ih-ink-2 hover:border-ih-accent hover:text-ih-accent border px-2.5 py-1 font-mono text-[12px] transition-colors"
            >
              {alt.query}
            </Link>
          ))}
        </div>
      )}

      {query.length < 2 ? (
        <div className="py-20 text-center">
          <p className="text-ih-muted text-sm">Try different keywords or browse our categories.</p>
          <div className="mt-6">
            <Link href="/c" className="text-ih-accent font-mono text-[12px] hover:underline">
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
              <p className="text-ih-muted mb-4 font-mono text-[11px] tracking-[0.12em] uppercase">
                Refine results
              </p>

              {/* Type filter — Products / Datasheets / Articles. Empty
                  param is treated as "all", so we show what's checked
                  rather than what's specifically present in the URL. */}
              <div className="mb-5">
                <div className="mb-2 text-[13px] font-semibold">Type</div>
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
                        className="text-ih-ink-2 hover:text-ih-ink flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className={
                              'border-ih-border flex h-3.5 w-3.5 items-center justify-center border text-[10px] ' +
                              (checked ? 'bg-ih-accent text-white' : 'bg-ih-surface')
                            }
                          >
                            {checked ? '✓' : ''}
                          </span>
                          <span className={checked ? 'text-ih-ink font-medium' : ''}>
                            {SEARCH_TYPE_LABELS[type]}
                          </span>
                        </span>
                        <span className="text-ih-muted-2 font-mono text-[11px]">{count}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {facetCategories.length > 0 && (
                <div className="mb-5">
                  <div className="mb-2 text-[13px] font-semibold">Category</div>
                  <div className="flex flex-col gap-1.5 text-[13px]">
                    {facetCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={filterUrl({
                          category: selectedCategory === cat.slug ? undefined : cat.slug,
                        })}
                        className="text-ih-ink-2 hover:text-ih-ink flex items-center justify-between"
                      >
                        <span
                          className={
                            selectedCategory === cat.slug ? 'text-ih-accent font-medium' : ''
                          }
                        >
                          {cat.name}
                        </span>
                        <span className="text-ih-muted-2 font-mono text-[11px]">{cat.count}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {facetBrands.length > 0 && (
                <div className="mb-5">
                  <div className="mb-2 text-[13px] font-semibold">Brand</div>
                  <div className="flex flex-col gap-1.5 text-[13px]">
                    {facetBrands.map((brand) => (
                      <Link
                        key={brand.id}
                        href={toggleBrand(brand.slug)}
                        className="text-ih-ink-2 hover:text-ih-ink flex items-center justify-between"
                      >
                        <span
                          className={
                            selectedBrands.includes(brand.slug) ? 'text-ih-accent font-medium' : ''
                          }
                        >
                          {brand.name}
                        </span>
                        <span className="text-ih-muted-2 font-mono text-[11px]">{brand.count}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-5">
                <div className="mb-2 text-[13px] font-semibold">Availability</div>
                <div className="flex flex-col gap-1.5 text-[13px]">
                  {offeredAvailabilityModes().map((mode) => {
                    const checked = availability === mode
                    return (
                      <Link
                        key={mode}
                        href={toggleAvailability(mode)}
                        className="text-ih-ink-2 hover:text-ih-ink flex items-center gap-2"
                      >
                        <span
                          aria-hidden="true"
                          className={
                            'border-ih-border flex h-3.5 w-3.5 items-center justify-center border text-[10px] ' +
                            (checked ? 'bg-ih-accent text-white' : 'bg-ih-surface')
                          }
                        >
                          {checked ? '✓' : ''}
                        </span>
                        <span className={checked ? 'text-ih-ink font-medium' : ''}>
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
                  className="text-ih-accent font-mono text-[12px] hover:underline"
                >
                  Clear all filters
                </Link>
              )}
            </div>
          </aside>

          <div>
            {!anyResults ? (
              <div className="border-ih-border border border-dashed py-16 text-center">
                <p className="text-ih-muted">No results</p>
                <p className="text-ih-muted mt-1 text-sm">
                  Try different keywords, broaden your Type filter, or browse our categories.
                </p>
              </div>
            ) : (
              <>
                <div className="text-ih-muted mb-4 flex items-center justify-between text-[13px]">
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
                    <label className="text-[12px] tracking-wider uppercase" htmlFor="sort-select">
                      Sort
                    </label>
                    <select
                      id="sort-select"
                      name="sort"
                      defaultValue={sortMode}
                      className="bg-ih-surface border-ih-border text-ih-ink-2 border px-2 py-1 font-mono text-[12px]"
                    >
                      {SORT_MODES.map((mode) => (
                        <option key={mode} value={mode}>
                          {SORT_LABELS[mode]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="border-ih-border hover:bg-ih-surface-2 border px-2 py-1 font-mono text-[11px]"
                    >
                      Apply
                    </button>
                  </form>
                </div>

                {showProductsSection && topMatch && (
                  <div className="mb-6">
                    <div className="text-ih-muted mb-3 font-mono text-[11px] tracking-[0.12em] uppercase">
                      Top product match
                    </div>
                    <Link
                      href={`/p/${topMatch.slug}`}
                      data-search-result-sku={topMatch.sku}
                      data-search-result-q={query}
                      className="border-ih-border bg-ih-surface border-l-ih-accent hover:border-ih-accent hover:border-l-ih-accent grid grid-cols-1 gap-6 border border-l-[3px] p-5 transition-colors sm:grid-cols-[140px_1fr]"
                    >
                      <div className="bg-ih-surface-2 border-ih-border relative aspect-square overflow-hidden border">
                        {topMatch.images[0] ? (
                          <Image
                            src={mediaUrl(topMatch.images[0]!.media.storagePath)}
                            alt={
                              topMatch.images[0]!.alt ??
                              topMatch.images[0]!.media.alt ??
                              topMatch.title
                            }
                            fill
                            className="object-contain p-3"
                            sizes="140px"
                          />
                        ) : nearestCategoryImage(topMatch.category) ? (
                          <CategoryFallbackImage
                            {...nearestCategoryImage(topMatch.category)!}
                            showTag={false}
                            sizes="140px"
                          />
                        ) : (
                          <div className="text-ih-muted absolute inset-0 grid place-items-center font-mono text-[10px]">
                            {topMatch.sku.slice(0, 8)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-ih-muted mb-1 font-mono text-[11px] tracking-[0.08em]">
                          {topMatch.sku} · {topMatch.brand?.name ?? ''}
                        </div>
                        <div className="mb-2 text-[20px] leading-[1.2] font-semibold tracking-[-0.01em]">
                          {topMatch.title}
                        </div>
                        {topMatch.descriptionShort && (
                          <p className="text-ih-muted mb-3 line-clamp-2 text-[13px] leading-[1.5]">
                            {topMatch.descriptionShort}
                          </p>
                        )}
                        <div className="text-ih-muted flex gap-4 font-mono text-[11px]">
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
                          className="border-ih-border bg-ih-surface hover:border-ih-accent grid grid-cols-[80px_1fr_auto] items-center gap-5 border p-3.5 transition-colors"
                        >
                          <div className="bg-ih-surface-2 border-ih-border relative aspect-square overflow-hidden border">
                            {img ? (
                              <Image
                                src={mediaUrl(img.media.storagePath)}
                                alt={img.alt ?? img.media.alt ?? product.title}
                                fill
                                className="object-contain p-2"
                                sizes="80px"
                              />
                            ) : nearestCategoryImage(product.category) ? (
                              <CategoryFallbackImage
                                {...nearestCategoryImage(product.category)!}
                                showTag={false}
                                sizes="80px"
                              />
                            ) : (
                              <div className="text-ih-muted absolute inset-0 grid place-items-center font-mono text-[9px]">
                                IMG
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-ih-muted mb-1 font-mono text-[11px]">
                              {product.sku}
                              {product.brand ? ` · ${product.brand.name}` : ''}
                            </div>
                            <div className="text-ih-ink text-[14px] font-medium">
                              {product.title}
                            </div>
                            {product.descriptionShort && (
                              <p className="text-ih-muted mt-0.5 line-clamp-1 text-[13px] leading-[1.5]">
                                {product.descriptionShort}
                              </p>
                            )}
                          </div>
                          <div className="text-ih-accent shrink-0 font-mono text-[12px]">
                            View →
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}

                {showProductsSection && totalPages > 1 && (
                  <nav
                    aria-label="Search results pagination"
                    className="mt-8 flex items-center justify-center gap-1"
                  >
                    {currentPage > 1 ? (
                      <Link
                        href={filterUrl({
                          page: currentPage > 2 ? String(currentPage - 1) : undefined,
                        })}
                        rel="prev"
                        aria-label="Previous page"
                        className="border-ih-border text-ih-muted hover:bg-ih-surface-2 flex h-9 w-9 items-center justify-center border font-mono text-[13px]"
                      >
                        ‹
                      </Link>
                    ) : (
                      <span
                        aria-disabled="true"
                        className="border-ih-border text-ih-muted-2 flex h-9 w-9 cursor-not-allowed items-center justify-center border font-mono text-[13px] opacity-50"
                      >
                        ‹
                      </span>
                    )}

                    {pageTokens.map((token, i) =>
                      token === 'ellipsis' ? (
                        <span
                          key={`e-${i}`}
                          aria-hidden="true"
                          className="text-ih-muted-2 flex h-9 w-9 items-center justify-center font-mono text-[13px]"
                        >
                          …
                        </span>
                      ) : token === currentPage ? (
                        <span
                          key={token}
                          aria-current="page"
                          className="border-ih-accent bg-ih-accent flex h-9 w-9 items-center justify-center border font-mono text-[13px] font-semibold text-white"
                        >
                          {token}
                        </span>
                      ) : (
                        <Link
                          key={token}
                          href={filterUrl({ page: token > 1 ? String(token) : undefined })}
                          aria-label={`Page ${token}`}
                          className="border-ih-border text-ih-muted hover:bg-ih-surface-2 flex h-9 w-9 items-center justify-center border font-mono text-[13px]"
                        >
                          {token}
                        </Link>
                      )
                    )}

                    {currentPage < totalPages ? (
                      <Link
                        href={filterUrl({ page: String(currentPage + 1) })}
                        rel="next"
                        aria-label="Next page"
                        className="border-ih-border text-ih-muted hover:bg-ih-surface-2 flex h-9 w-9 items-center justify-center border font-mono text-[13px]"
                      >
                        ›
                      </Link>
                    ) : (
                      <span
                        aria-disabled="true"
                        className="border-ih-border text-ih-muted-2 flex h-9 w-9 cursor-not-allowed items-center justify-center border font-mono text-[13px] opacity-50"
                      >
                        ›
                      </span>
                    )}
                  </nav>
                )}

                {showDatasheetsSection && (
                  <div className="border-ih-border mt-8 border-t pt-6">
                    <div className="text-ih-muted mb-4 font-mono text-[11px] tracking-[0.12em] uppercase">
                      Datasheets &amp; PDFs
                    </div>
                    <div className="flex flex-col gap-2">
                      {relatedDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="border-ih-border bg-ih-surface grid grid-cols-[36px_1fr_auto] items-center gap-4 border p-3.5"
                        >
                          <div className="bg-ih-navy grid h-9 w-8 place-items-center font-mono text-[9px] font-semibold text-white">
                            {doc.kind.toUpperCase().slice(0, 4)}
                          </div>
                          <div>
                            <div className="text-[13px] font-medium">{doc.title}</div>
                            <div className="text-ih-muted font-mono text-[11px]">
                              {doc.kind.toUpperCase()} · {doc.product.sku}
                            </div>
                          </div>
                          <a
                            href={mediaUrl(doc.media.storagePath)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border-ih-border text-ih-ink-2 hover:bg-ih-surface-2 flex h-8 shrink-0 items-center border px-3 font-mono text-[11px] transition-colors"
                          >
                            Download ↓
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showArticlesSection && (
                  <div className="border-ih-border mt-8 border-t pt-6">
                    <div className="text-ih-muted mb-4 font-mono text-[11px] tracking-[0.12em] uppercase">
                      From the blog
                    </div>
                    <div className="flex flex-col gap-3">
                      {blogPosts.map((post) => (
                        <Link
                          key={post.id}
                          href={`/blog/${post.slug}`}
                          className="border-ih-border bg-ih-surface hover:border-ih-accent grid grid-cols-[120px_1fr] gap-4 border p-3.5 transition-colors"
                        >
                          <div className="bg-ih-surface-2 border-ih-border relative aspect-[4/3] overflow-hidden border">
                            {post.hero ? (
                              <Image
                                src={mediaUrl(post.hero.storagePath)}
                                alt={post.title}
                                fill
                                className="object-cover"
                                sizes="120px"
                              />
                            ) : (
                              <div className="text-ih-muted absolute inset-0 grid place-items-center font-mono text-[9px]">
                                BLOG
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-ih-muted mb-1 font-mono text-[11px] tracking-[0.08em] uppercase">
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
                            <h3 className="mb-1.5 text-[15px] leading-snug font-semibold">
                              {post.title}
                            </h3>
                            {post.excerpt && (
                              <p className="text-ih-muted line-clamp-2 text-[12px] leading-[1.5]">
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
