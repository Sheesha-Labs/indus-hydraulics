import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@indus/db'
import type { ReactNode } from 'react'
import {
  buildBreadcrumbLd,
  buildCollectionLd,
  buildFaqLd,
  buildItemListLd,
  buildSpecFacets,
  categoryExportRegions,
  countSelected,
  parseSpecFilter,
  productIdsMatching,
  pruneSpecFilter,
  serialiseSpecFilter,
  str,
  toggleSpecValue,
  type SectionValues,
} from '@indus/domain'
import { Breadcrumb, Button, EmptyState, JsonLd, Note } from '@indus/ui'
import { pageMetadata, urlFor } from '../../../lib/seo'
import ProductCard from '../../../components/ProductCard'
import RelatedReading from '../../../components/blog/RelatedReading'
import {
  CategoryDeliveryBand,
  CategoryFaqBand,
  CategoryProseBand,
  CategorySizeBand,
  categoryFaqs,
} from '../../../components/category/CategoryBands'
import { categorySizeSummary, gccMarketLinks, getShelfSpecRows } from '../../../lib/category-bands'
import { getSubPageContent } from '../../../lib/page-content'
import { getArticlesForCategory } from '../../../lib/related-reading'
import {
  ancestorTrail,
  descendantIds,
  getCategoryTree,
  indexTree,
} from '../../../lib/category-tree'

/**
 * Products per category page.
 *
 * Was 12, which put 513 of the 1,480 active products behind pagination — and
 * the paginated pages are `noindex`, so those products' only route in was a
 * link from a page Google is told not to keep. On a site where 72 of 2,040
 * URLs are indexed, that is the wrong place to be economical.
 *
 * Measured across the live catalogue before choosing 48:
 *
 *   page size   products behind pagination   categories paginated
 *          12                          513                     39
 *          24                          222                      —
 *          48                           44                      4
 *          96                            0                      —
 *
 * 48 leaves 167 of 171 categories with no pagination at all. 96 would reach
 * zero, but the largest category holds 67 products and rendering 96 cards
 * would roughly double the weight of every large category page — which works
 * against the crawl budget this change exists to protect.
 *
 * Average category holds 8.7 products, so for most of the site this changes
 * nothing about what renders.
 */
const PAGE_SIZE = 48

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

/**
 * The shelf page, shared by the cached `/c/[slug]` and the dynamic
 * `/c-filter/[slug]` it is rewritten to when a filter is applied.
 *
 * Takes the slug and the facet selection as plain values rather than reading
 * `searchParams` itself. That is the whole point: reading them made the route
 * dynamic, so all 194 shelf pages rendered per request and the CDN never held
 * one — at ~39 KB of origin transfer per visitor and per crawler.
 */
export type CategoryViewProps = {
  slug: string
  sp: SearchParams
}

/**
 * Refresh interval for category pages. Catalogue counts and brand facets
 * change as products are added; one hour keeps the cached HTML fresh
 * without hammering Postgres. Admin can punch through with
 * `revalidatePath('/c/<slug>')` after a category edit.
 */

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

export async function categoryMetadata({ slug, sp }: CategoryViewProps): Promise<Metadata> {
  const [category, seoSetting] = await Promise.all([
    db.category.findUnique({ where: { slug } }),
    db.seoSetting.findFirst({
      select: { defaultMetaTitleTemplate: true, defaultMetaDescription: true },
    }),
  ])
  if (!category) return {}

  const ogPath = category.ogImageMediaId
    ? ((
        await db.media.findUnique({
          where: { id: category.ogImageMediaId },
          select: { storagePath: true },
        })
      )?.storagePath ?? null)
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

export default async function CategoryView({ slug, sp }: CategoryViewProps) {
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
  // One fetch of the whole tree, then walked in memory. This used to be six or
  // seven sequential round trips — one per level climbing to the root, one per
  // level descending — which cost ~25 ms beside the database and most of a
  // second from anywhere else.
  const tree = await getCategoryTree()
  const { byId, children } = indexTree(tree)
  const categoryIds = descendantIds(children, category.id)
  const trail = ancestorTrail(byId, category.id)

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

  /*
   * The largest remaining source of Supabase egress on the site: 2,795 rows on
   * the biggest shelf, 5.3 BILLION returned over 78 days.
   *
   * Cached on the subtree and the brand selection, which is exactly what the
   * query scopes on — the spec filter narrows products AFTER these rows are
   * read, never the read itself. So every `?spec=` permutation of a shelf
   * shares one entry with the clean shelf above it. Measured on production
   * before this: unfiltered pages cost nothing and filtered pages cost a full
   * table read EACH, at ~173 of them a minute.
   *
   * The rows rather than the finished chips, because the page needs both — the
   * chips are counted from them, and `productIdsMatching` reads them to decide
   * which products a spec filter admits, which a count cannot answer.
   *
   * Grouping deliberately stays in JavaScript. `normaliseFacetValue` merges
   * spellings, and a second implementation of it in SQL would be free to drift
   * from the one the filter links are built with.
   */
  const facetRows = await getShelfSpecRows(categoryIds, selectedBrands)
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
      orderBy:
        sp.sort === 'az'
          ? { title: 'asc' }
          : sp.sort === 'za'
            ? { title: 'desc' }
            : { updatedAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.product.count({ where }),
    db.product
      .groupBy({
        by: ['brandId'],
        where: { categoryId: { in: categoryIds }, status: 'active' },
        _count: { _all: true },
      })
      .then(async (groups) => {
        const ids = groups.map((g) => g.brandId).filter(Boolean) as string[]
        const brands = await db.brand.findMany({
          where: { id: { in: ids } },
          select: { id: true, name: true, slug: true },
        })
        return brands.map((b) => ({
          ...b,
          count: groups.find((g) => g.brandId === b.id)?._count._all ?? 0,
        }))
      }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  /**
   * Build a URL for a filter or page change.
   *
   * Unfiltered pagination gets a PATH — `/c/<slug>/page/2` — because that form
   * can be prerendered and cached, while `?page=2` cannot: the clean shelf is
   * static precisely because it reads no query string, so any query form has to
   * go to the dynamic twin. Deep pages were the last crawlable URLs on this
   * route still rendering per request.
   *
   * Filtered pagination keeps the query form. Those URLs are `noindex` with a
   * canonical back to the clean shelf and robots.txt disallows the `brands=`
   * and `sort=` shapes, so they are visitors only and the dynamic twin is the
   * right place for them.
   */
  function filterUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams()
    const base = {
      brands: selectedBrands.join(',') || undefined,
      spec: serialiseSpecFilter(specFilter),
      page: page > 1 ? String(page) : undefined,
      sort: sp.sort,
    }
    const merged = { ...base, ...overrides }

    const pageValue = merged.page
    const hasFilters = Boolean(merged.brands || merged.spec || merged.sort)
    if (!hasFilters) {
      return pageValue && pageValue !== '1' ? `/c/${slug}/page/${pageValue}` : `/c/${slug}`
    }

    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v)
    }
    const qs = params.toString()
    return `/c/${slug}${qs ? `?${qs}` : ''}`
  }

  /*
   * `nofollow` for the filtered URL space, nothing for the clean one.
   *
   * Derived from the href rather than hardcoded per link, because `filterUrl`
   * already draws exactly the right line: it returns a clean path (`/c/<slug>`
   * or `/c/<slug>/page/N`) when no filter is active and the query form only
   * when one is. So a query string here means the URL is `noindex`, canonical
   * back to the clean shelf, and disallowed in robots.txt — and unfiltered
   * pagination, which 513 of 1,480 products depend on, stays followable
   * without a special case.
   *
   * This is what actually removes the facet trap from the crawl GRAPH. Each
   * facet link ADDS to whatever is already active, so one shelf emitted 165
   * of them, depth two is ~27,000 URLs and depth three ~4.4 million. Three
   * crawlers walked it at ~1,500 req/min. robots.txt asks; only the compliant
   * listen, and it does not remove the links from the page.
   */
  const relFor = (href: string) => (href.includes('?') ? 'nofollow' : undefined)

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
  /*
    ItemList is what tells a crawler this is an index of products rather than a
    page with links on it. The page's own grid is the source, so the order in
    the markup is the order on screen and the two cannot drift.
  */
  const itemListLd = buildItemListLd({
    name: category.name,
    items: products.map((product) => ({
      name: product.title,
      url: urlFor(`/p/${product.slug}`),
    })),
  })
  // Everywhere the delivery band does NOT already cover. The profile is the
  // ROOT's — "ferrules" and "banjo bolts" ship the same way — while the seed is
  // this page's own slug, so 46 sub-categories under Hoses & Fittings do not
  // carry 46 identical blocks.
  const exportRegions = categoryExportRegions(category.slug, trail[0]?.slug ?? category.slug)

  const breadcrumbLd = buildBreadcrumbLd({
    items: [
      { name: 'Home', url: urlFor('/') },
      { name: 'Categories', url: urlFor('/c') },
      ...trail.map((step) => ({ name: step.name, url: urlFor(`/c/${step.slug}`) })),
    ],
  })

  // The return leg of the internal-link loop. Articles have pointed into this
  // page through `category_link` blocks since the first wave; until now nothing
  // pointed back, so the equity and the reader both went one way only.
  const relatedArticles = await getArticlesForCategory(category.id)

  // The shelf's own section document: order, visibility and copy overrides.
  const content = await getSubPageContent('category', {
    name: category.name,
    slug: category.slug,
  })
  const heroCopy = content.values('hero')
  /** An override, or the wording the shelf already had. */
  const over = (values: SectionValues, key: string, built: string): string =>
    str(values, key) ?? built
  const heroIntro = str(heroCopy, 'intro') ?? category.shortDescription

  // Read live rather than authored: the bore range a shelf covers changes when
  // a size table lands, and a typed figure would be wrong the same week.
  const sizeSummary = await categorySizeSummary(categoryIds)
  const gccMarkets = gccMarketLinks()

  /*
    FAQ markup follows the BAND, not the data. Questions a reader cannot see
    are a Google violation rather than merely stale, so hiding the section has
    to take the structured data with it.
  */
  const faqLd = content.isOn('faq')
    ? buildFaqLd({ faqs: categoryFaqs(content.values('faq')) })
    : null

  /*
    Every band, keyed, rendered in the order the editor holds for THIS shelf.

    The shipped order puts the words a buyer needs BEFORE the grid and the
    questions after it, which is also the order a crawler wants. Reordering is
    now a content decision rather than a code change — with two exceptions the
    template marks `locked`: the header and the listing. A shelf page with its
    products switched off is a heading and a 404.

    Bands whose copy nobody has written return null and disappear. 195
    categories inherit this template and 86 of them hold four products or
    fewer; a band that rendered an empty heading on those would be padding.
  */
  const bands: Record<string, ReactNode> = {
    hero: (
      <div key="hero">
        {/* Category header */}
        <div className="border-ih-border border-b py-8">
          <p className="text-ih-muted mb-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.13em]">
            {over(heroCopy, 'eyebrow', 'Category')}
          </p>
          <h1 className="mb-3 font-serif text-[clamp(30px,4vw,40px)] font-normal leading-[1.06] tracking-[-0.01em]">
            {over(heroCopy, 'heading', category.name)}
          </h1>
          {heroIntro && (
            <p className="text-ih-muted mb-4 max-w-[620px] text-[14px] leading-[1.55]">
              {heroIntro}
            </p>
          )}
          <div className="text-ih-muted flex gap-6 font-mono text-[12px]">
            <span>
              <b className="text-ih-ink font-medium">{total}</b> SKUs
            </span>
            <span>
              <b className="text-ih-ink font-medium">{allBrands.length}</b> brands
            </span>
          </div>
        </div>
      </div>
    ),
    children: (
      <div key="children">
        {/* Sub-categories */}
        {category.children.length > 0 && (
          <div className="no-scrollbar border-ih-border flex gap-2 overflow-x-auto border-b py-4">
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={`/c/${child.slug}`}
                className="border-ih-border bg-ih-surface text-ih-ink-2 hover:border-ih-accent hover:text-ih-accent inline-flex h-[30px] shrink-0 items-center whitespace-nowrap rounded-full border px-3 text-[12.5px] transition-colors"
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    ),
    guidance: <CategoryProseBand key="guidance" values={content.values('guidance')} />,
    standards: <CategoryProseBand key="standards" values={content.values('standards')} />,
    sizes: <CategorySizeBand key="sizes" summary={sizeSummary} />,
    service: <CategoryProseBand key="service" values={content.values('service')} />,
    delivery: (
      <CategoryDeliveryBand
        key="delivery"
        values={content.values('delivery')}
        markets={gccMarkets}
        categoryName={category.name}
        exportRegions={exportRegions}
      />
    ),
    listing: (
      <div key="listing">
        {/* Main listing */}
        <div className="grid grid-cols-1 gap-9 py-8 pb-16 lg:grid-cols-[248px_1fr]">
          {/* Filter sidebar */}
          <aside className="self-start lg:sticky lg:top-[124px] lg:max-h-[calc(100vh-150px)] lg:overflow-y-auto">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="text-ih-muted font-mono text-[10.5px] font-medium uppercase tracking-[0.13em]">
                  Refine{activeFilterCount > 0 ? ` · ${activeFilterCount} active` : ''}
                </span>
                {activeFilterCount > 0 && (
                  <Link
                    href={filterUrl({ brands: undefined, spec: undefined, page: '1' })}
                    className="text-ih-accent text-xs hover:underline"
                  >
                    Clear
                  </Link>
                )}
              </div>

              {allBrands.length > 0 && (
                <div>
                  <div className="border-ih-border mb-3 border-b pb-2.5">
                    <span className="text-[12.5px] font-medium">Brand</span>
                  </div>
                  {/*
                    Facets are links, not form controls: 03 §7 requires facet
                    state to live in the URL because these pages are the SEO
                    surface and sales share filtered links. The checkbox is
                    therefore presentational — the real control is the anchor,
                    and aria-pressed carries the state that the tick conveys
                    visually.

                    They go through `relFor`, which marks the filtered URL space
                    `nofollow` — see the note on it. Nothing is lost: those
                    pages are `noindex`, canonical back to the clean shelf, and
                    disallowed in robots.txt, so they were never going to rank
                    and have no link equity to pass.
                  */}
                  <div className="flex flex-col gap-2.5">
                    {allBrands.map((brand) => {
                      const active = selectedBrands.includes(brand.slug)
                      return (
                        <Link
                          key={brand.id}
                          href={toggleBrand(brand.slug)}
                          rel={relFor(toggleBrand(brand.slug))}
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
                          <span className="text-ih-muted-2 font-mono text-[10.5px] tabular-nums">
                            {brand.count}
                          </span>
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
                    <div className="border-ih-border mb-3 border-b pb-2.5">
                      <span className="text-[12.5px] font-medium">{facet.label}</span>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {facet.values.map((value) => {
                        const active = selected.has(value.key)
                        return (
                          <Link
                            key={value.key}
                            href={toggleSpec(facet.key, value.key)}
                            rel={relFor(toggleSpec(facet.key, value.key))}
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
                            <span className="text-ih-muted-2 font-mono text-[10.5px] tabular-nums">
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
                  Send the number or a photo of the nameplate. We cross-reference obsolete codes
                  daily.
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
              <div className="mb-4 flex flex-wrap gap-2">
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
                        className="border-ih-accent bg-ih-accent hover:bg-ih-accent-hover inline-flex h-[30px] items-center gap-1.5 rounded-full border px-3 text-[12.5px] text-white transition-colors"
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
                      className="border-ih-accent bg-ih-accent hover:bg-ih-accent-hover inline-flex h-[30px] items-center gap-1.5 rounded-full border px-3 text-[12.5px] text-white transition-colors"
                    >
                      Brand: {brand?.name ?? b}
                      <span aria-hidden="true" className="text-[14px] leading-none opacity-70">
                        ×
                      </span>
                    </Link>
                  )
                })}
                <Link
                  href={filterUrl({ brands: undefined, page: '1' })}
                  className="text-ih-accent inline-flex h-[30px] items-center px-2 text-[12.5px] hover:underline"
                >
                  Clear all
                </Link>
              </div>
            )}

            {/* Toolbar */}
            <div className="border-ih-border mb-5 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
              <p className="text-ih-muted font-mono text-[12px] tabular-nums">
                {total > 0 ? (
                  <>
                    Showing{' '}
                    <b className="text-ih-ink font-medium">
                      {from}–{to}
                    </b>{' '}
                    of <b className="text-ih-ink font-medium">{total}</b> SKUs
                  </>
                ) : (
                  <>No products found</>
                )}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-ih-muted font-mono text-[10.5px] uppercase tracking-[0.08em]">
                  Sort
                </span>
                <div className="border-ih-border flex overflow-hidden rounded-md border">
                  {[
                    { val: '', label: 'Latest' },
                    { val: 'az', label: 'A–Z' },
                    { val: 'za', label: 'Z–A' },
                  ].map((opt) => (
                    <Link
                      key={opt.val}
                      href={filterUrl({ sort: opt.val || undefined, page: '1' })}
                      rel={relFor(filterUrl({ sort: opt.val || undefined, page: '1' }))}
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
              <div className="border-ih-border bg-ih-surface rounded-lg border">
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
                        <Link href={filterUrl({ brands: undefined, page: '1' })}>
                          Clear filters
                        </Link>
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
                  <Link
                    href={filterUrl({ page: String(page - 1) })}
                    rel={relFor(filterUrl({ page: String(page - 1) }))}
                    className="border-ih-border text-ih-ink-2 hover:border-ih-accent hover:text-ih-accent flex h-9 w-9 items-center justify-center rounded-md border font-mono text-[13px] transition-colors"
                  >
                    ‹
                  </Link>
                )}
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = i + 1
                  return (
                    <Link
                      key={p}
                      href={filterUrl({ page: String(p) })}
                      rel={relFor(filterUrl({ page: String(p) }))}
                      className={`flex h-9 w-9 items-center justify-center rounded-md border font-mono text-[13px] tabular-nums transition-colors ${p === page ? 'border-ih-accent bg-ih-accent text-white' : 'border-ih-border text-ih-ink-2 hover:border-ih-accent hover:text-ih-accent'}`}
                    >
                      {p}
                    </Link>
                  )
                })}
                {page < totalPages && (
                  <Link
                    href={filterUrl({ page: String(page + 1) })}
                    rel={relFor(filterUrl({ page: String(page + 1) }))}
                    className="border-ih-border text-ih-ink-2 hover:border-ih-accent hover:text-ih-accent flex h-9 w-9 items-center justify-center rounded-md border font-mono text-[13px] transition-colors"
                  >
                    ›
                  </Link>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    ),
    faq: <CategoryFaqBand key="faq" values={content.values('faq')} />,
    reading: (
      <div key="reading" className="pb-16">
        <RelatedReading
          articles={relatedArticles}
          heading="Written about this range"
          eyebrow="From the blog"
        />
      </div>
    ),
  }

  return (
    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12">
      <JsonLd data={[collectionLd, itemListLd, breadcrumbLd, faqLd]} />
      {/* Breadcrumbs */}
      <div className="border-ih-border border-b py-4">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Categories', href: '/c' },
            ...trail.map((step, i) => ({
              label: step.name,
              // The last step is this page — never a link to itself. An
              // unpublished ancestor is not linked either: its page 404s.
              href: i === trail.length - 1 || !step.isPublished ? undefined : `/c/${step.slug}`,
            })),
          ]}
        />
      </div>

      {content.order.map((key) => bands[key] ?? null)}
    </div>
  )
}
