import type { Metadata } from 'next'
import { Fragment, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import { db } from '@indus/db'
import { HERO_TERMS, heroLeadFor, img, interpolate, list, str, visibleList } from '@indus/domain'
import HomeNewsletterForm from '../../components/HomeNewsletterForm'
import HomeBlogMosaic, { type HomeBlogTile } from '../../components/HomeBlogMosaic'
import { pickBlogMix } from '../../lib/home-blog-mix'
import HomeHeroCarousel, { type HomeHeroSlide } from '../../components/HomeHeroCarousel'
import HeroTermRotator from '../../components/HeroTermRotator'
import HomeIndustryTiles from '../../components/HomeIndustryTiles'
import HomeCategoryIndex, { type HomeCategory } from '../../components/HomeCategoryIndex'
import HomeProductMix, { type HomeMixProduct } from '../../components/HomeProductMix'
import { pickProductMix } from '../../lib/home-product-mix'
import BrandMarquee from '../../components/BrandMarquee'
import { selectMarqueeBrands } from '../../lib/brand-marquee'
import { rollUpCounts } from '../../lib/category-tree'
import { getIndustryList } from '../../lib/industry-content'
import { getMasterPageContent } from '../../lib/page-content'
import { BASE_URL } from '../../lib/seo'

/**
 * Metadata for the homepage, shared by `/` and every `/h/[cc]` variant.
 *
 * The variants must carry the SAME metadata as `/`, canonical included. They
 * are served through an internal rewrite, so whatever they declare is what a
 * visitor — and a crawler — reads at `/`. A `noindex` here would take the
 * homepage out of the index.
 */
export async function homeMetadata(): Promise<Metadata> {
  // Pull live counts so the meta description matches the catalogue we
  // actually have, not an aspirational number. Rounded down to the
  // nearest 100 so the claim stays defensible as new SKUs are added.
  const [skuCount, brandCount] = await Promise.all([
    getActiveSkuCount(),
    getPublishedBrandCount(),
  ])
  const skuFloor = Math.max(100, Math.floor(skuCount / 100) * 100)
  return {
    // `absolute`, because the brand is already in it. `/` sits in the same
    // segment as the storefront layout and escapes its `%s | Indus Hydraulics`
    // template, but the `/h/<cc>` variants every non-default country is
    // rewritten to are a child segment and do not — so the homepage served to
    // most of the world read "Indus Hydraulics — … | Indus Hydraulics".
    //
    // Hose-led, to match the H1 and the catalogue's weight. It used to lead
    // with pumps, cylinders and valves, which are three of the thinnest
    // shelves on the site.
    title: { absolute: 'Indus Hydraulics | Hydraulic & Industrial Hose Supplier, UAE' },
    description: `${skuFloor.toLocaleString()}+ SKUs — hydraulic and industrial hoses, fittings and couplings, lifting gear and oilfield spares from ${brandCount} brands, shipped from Dubai across the GCC.`,
    // Every other indexable route declares one through `pageMetadata`; the
    // home page built its metadata by hand and so shipped none. It is the one
    // URL where that matters most — Google resolves a site's favicon and its
    // Organization entity against the home page, and an unresolved canonical
    // is a weaker anchor for both. No trailing slash, so it matches the
    // sitemap's `loc` and the `og:url` byte for byte.
    alternates: { canonical: BASE_URL },
  }
}

// Every published top-level category with its published sub-categories —
// the whole first two levels of the tree, for the catalogue index. Projected
// to exactly what the cards render, because this result is cached and also
// feeds the hero search's category <select>.
const getHomeCategories = unstable_cache(
  async (): Promise<HomeCategory[]> => {
    const [allCategories, grouped] = await Promise.all([
      db.category.findMany({
        orderBy: { position: 'asc' },
        select: {
          id: true,
          parentId: true,
          slug: true,
          name: true,
          isPublished: true,
          image: { select: { storagePath: true, alt: true } },
        },
      }),
      db.product.groupBy({
        by: ['categoryId'],
        where: { status: 'active', categoryId: { not: null } },
        _count: { _all: true },
      }),
    ])
    // Rolled up the tree, as on /c: products live on leaves, so a parent's
    // own count is zero and every card would read "0 SKUs".
    const rollup = rollUpCounts(
      new Map(allCategories.map((c) => [c.id, c.parentId])),
      new Map(grouped.map((g) => [g.categoryId as string, g._count._all])),
    )
    const published = allCategories.filter((c) => c.isPublished)
    return published
      .filter((c) => c.parentId === null)
      .map((root) => ({
        slug: root.slug,
        name: root.name,
        skuCount: rollup.get(root.id) ?? 0,
        image: root.image,
        // An empty range is not linked: a home-page link to a page with no
        // products spends the strongest page on the site on a dead end.
        subcategories: published
          .filter((c) => c.parentId === root.id && (rollup.get(c.id) ?? 0) > 0)
          .map((c) => ({ slug: c.slug, name: c.name })),
      }))
  },
  ['home-category-index'],
  { revalidate: 3600, tags: ['categories', 'product-count'] },
)

// Every published brand with a logo — the same set /brands shows as logo
// cards — narrowed and ordered by `selectMarqueeBrands` (one tile per picture,
// no house brand, best-stocked first). Only the projected fields leave the
// cache, so the payload is a slug, a name and a URL per tile.
const getHomeBrands = unstable_cache(
  async () => {
    const rows = await db.brand.findMany({
      where: { isPublished: true, logoId: { not: null } },
      select: {
        slug: true,
        name: true,
        logo: { select: { id: true, storagePath: true, alt: true, width: true, height: true, bytes: true } },
        _count: { select: { products: { where: { status: 'active' } } } },
      },
    })
    return selectMarqueeBrands(
      rows.map((b) => ({ slug: b.slug, name: b.name, logo: b.logo, skuCount: b._count.products })),
    )
  },
  ['home-brands-marquee'],
  { revalidate: 3600, tags: ['brands'] },
)

/** Tiles in the product sample — eight across, three rows, on a wide screen. */
const HOME_MIX_SIZE = 24

/*
  A random product from each of 24 different top-level categories, every one
  with a photograph. Chosen inside the hourly cache, so the page stays static
  and the mix changes each time the cache refreshes — see lib/home-product-mix.

  The candidate read is ids and category ids only (~7k narrow rows an hour);
  the full rows are fetched for the 24 picked.
*/
const getHomeFeaturedProducts = unstable_cache(
  async (): Promise<HomeMixProduct[]> => {
    const [candidates, categories] = await Promise.all([
      db.product.findMany({
        where: { status: 'active', images: { some: {} } },
        select: { id: true, categoryId: true },
      }),
      db.category.findMany({
        select: { id: true, parentId: true, isPublished: true, slug: true, name: true },
      }),
    ])
    const picks = pickProductMix(candidates, categories, HOME_MIX_SIZE)
    if (picks.length === 0) return []

    const rows = await db.product.findMany({
      where: { id: { in: picks.map((p) => p.productId) } },
      select: {
        id: true,
        slug: true,
        title: true,
        images: {
          orderBy: { position: 'asc' },
          take: 1,
          select: { alt: true, media: { select: { storagePath: true, alt: true } } },
        },
      },
    })
    const rowById = new Map(rows.map((r) => [r.id, r]))
    const categoryById = new Map(categories.map((c) => [c.id, c]))

    return picks.flatMap(({ productId, rootId }) => {
      const row = rowById.get(productId)
      const image = row?.images[0]
      const root = categoryById.get(rootId)
      if (!row || !image || !root) return []
      return [
        {
          id: row.id,
          slug: row.slug,
          title: row.title,
          // §13: the listing's own alt, then the media's, then the title.
          image: { storagePath: image.media.storagePath, alt: image.alt ?? image.media.alt ?? null },
          category: { slug: root.slug, name: root.name },
        },
      ]
    })
  },
  ['home-product-mix'],
  { revalidate: 3600, tags: ['products'] },
)

/** Articles in the home page's blog mosaic: a 2×2 lead and eight tiles. */
const HOME_BLOG_TILES = 9

/*
  The newest article from each topic, newest first (see lib/home-blog-mix),
  drawn from the most recent 80 so a topic that published a month ago still
  gets its tile. Only articles with a hero: the mosaic is images and titles,
  and every live post has one (432/432 on 2026-11-08), so this is a guard,
  not a filter.
*/
const getHomeBlogPosts = unstable_cache(
  async (): Promise<HomeBlogTile[]> => {
    const recent = await db.blogPost.findMany({
      where: { isPublished: true, heroId: { not: null } },
      orderBy: { publishedAt: 'desc' },
      take: 80,
      select: {
        id: true,
        slug: true,
        title: true,
        categoryId: true,
        hero: { select: { storagePath: true, alt: true } },
      },
    })
    return pickBlogMix(recent, HOME_BLOG_TILES).map(({ id, slug, title, hero }) => ({
      id,
      slug,
      title,
      hero,
    }))
  },
  ['home-blog-mosaic'],
  { revalidate: 3600, tags: ['blog-posts'] },
)

const getActiveSkuCount = unstable_cache(
  () => db.product.count({ where: { status: 'active' } }),
  ['home-active-sku-count'],
  { revalidate: 3600, tags: ['product-count'] },
)

const getPublishedBrandCount = unstable_cache(
  () => db.brand.count({ where: { isPublished: true } }),
  ['home-published-brand-count'],
  { revalidate: 3600, tags: ['brands'] },
)

// Hero carousel slides (right-side visual). Cached longer than products
// because slides change infrequently; admin mutations bust the tag.
const getHomeHeroSlides = unstable_cache(
  async (): Promise<HomeHeroSlide[]> => {
    const rows = await db.homepageHeroSlide.findMany({
      where: { isPublished: true },
      orderBy: { position: 'asc' },
      include: {
        media: {
          select: {
            storagePath: true,
            width: true,
            height: true,
            alt: true,
            originalFilename: true,
            createdAt: true,
          },
        },
      },
    })
    return rows.map((r) => ({
      id: r.id,
      src: r.media.storagePath,
      // Fall back to 1200x1100 (the placeholder reference dims) if Media row
      // didn't capture intrinsic size — next/image still works without CLS as
      // long as the ratio is roughly correct.
      width: r.media.width ?? 1200,
      height: r.media.height ?? 1100,
      alt: r.alt ?? r.media.alt ?? '',
      originalFilename: r.media.originalFilename,
      createdAtIso: r.media.createdAt.toISOString(),
    }))
  },
  ['home-hero-slides'],
  { revalidate: 3600, tags: ['homepage-hero'] },
)

/**
 * The homepage body, shared by `/` and the per-country variants under
 * `/h/[cc]`.
 *
 * It takes the country as a prop rather than reading it from the request.
 * That is the whole point: a component that reads `headers()` or
 * `searchParams` makes its route dynamic, and `/` was rendering per request
 * for every visitor and every crawler as a result. Resolving the country in
 * the proxy and passing it down keeps the wording per-country while letting
 * each variant be cached on its own path.
 */
export default async function HomeView({ geoCode }: { geoCode?: string | null }) {
  const [categories, brands, featuredProducts, blogPosts, activeSkuCount, publishedBrandCount, heroSlides, content] = await Promise.all([
    getHomeCategories(),
    getHomeBrands(),
    getHomeFeaturedProducts(),
    getHomeBlogPosts(),
    getActiveSkuCount(),
    getPublishedBrandCount(),
    getHomeHeroSlides(),
    // Section order, visibility and copy, edited under Pages & Blocks. Falls
    // back to the wording declared in `@indus/domain/page-sections` whenever
    // nothing has been saved — which is what the defaults in that registry
    // are: this page's own copy, moved but not changed.
    getMasterPageContent('home'),
  ])

  // First line of the headline, chosen from the visitor's country.
  //
  // The code is resolved in the proxy — from `x-vercel-ip-country`, or from
  // `?geo=XX` when someone is reviewing the wording without leaving the
  // country — and arrives here as a prop. An unknown or absent code resolves
  // to the Dubai fallback, so there is no path that renders a headline with a
  // hole in it.
  const heroLead = heroLeadFor(geoCode ?? null)

  const yearsInBusiness = new Date().getFullYear() - 2003
  // Match the hero claim to the catalogue we actually have. Rounded
  // down to the nearest 100 so the number can never overstate reality.
  const heroSkuFloor = Math.max(100, Math.floor(activeSkuCount / 100) * 100)

  // Industries are admin-managed in the DB (Tier C migration). Code
  // tokens (IND.01…) are derived from the per-row `position` so the
  // visual numbering stays in sync with admin reordering.
  const industriesRows = await getIndustryList()
  const industries = industriesRows.map((row, i) => ({
    slug: row.slug,
    code: `IND.${String(i + 1).padStart(2, '0')}`,
    name: row.name,
    tagline: row.tagline,
    heroImage: row.heroImage,
    heroImageAlt: row.heroImageAlt,
  }))

  /*
    The live figures editable copy may quote.

    Freezing these into the strings would be a slow-motion lie — the moment an
    editor touched the sentence the number would stop tracking the catalogue.
    So the stored copy carries `{skus}`, `{brands}` and friends, and `t()`
    substitutes. See `@indus/domain/page-sections/tokens.ts`.
  */
  const tokens = {
    skus: activeSkuCount,
    skusFloor: heroSkuFloor,
    brands: publishedBrandCount,
    categories: String(categories.length).padStart(2, '0'),
    industries: industries.length,
    years: yearsInBusiness,
  }
  const t = (value: string | null): string | null => interpolate(value, tokens)

  const hero = content.values('hero')
  const usp = content.values('usp')
  const categoriesCopy = content.values('categories')
  const brandsCopy = content.values('brands')
  const featuredCopy = content.values('featured_products')
  const industriesCopy = content.values('industries')
  const why = content.values('why')
  const blog = content.values('blog')
  const newsletter = content.values('newsletter')

  const uspItems = visibleList<{ name?: string; desc?: string }>(usp, 'items')
  const whyItems = visibleList<{ name?: string; desc?: string }>(why, 'items')
  const heroStats = list<{ value?: string; label?: string }>(hero, 'stats')
  const quoteImage = img(why, 'quote_image')
  const quoteAvatar = img(why, 'quote_avatar')

  /*
    Every section, keyed. The page renders `content.order`, which is the
    editor's arrangement with hidden sections already dropped — so moving a
    band in the admin moves it here, and hiding one removes it, without this
    file knowing which arrangement it is rendering.
  */
  const sections: Record<string, ReactNode> = {
    hero: (
      /* ── HERO ─────────────────────────────────────────────────────────── */
      <section className="overflow-hidden border-b border-ih-border bg-ih-surface">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12 py-16 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-16 items-center">

          {/* Left copy */}
          <div>
            <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
              {t(str(hero, 'eyebrow'))}
            </span>
            {/* The rotating term sits on its own line deliberately. The six
                terms differ in length; inline, every swap reflows the whole
                headline, which reads as cheap. On its own line the reflow is
                invisible and the term carries the emphasis anyway. */}
            <h1 className="mb-5 mt-5 text-balance font-serif text-[clamp(38px,5vw,56px)] font-normal leading-[1.04] tracking-[-0.01em]">
              {/* An override replaces the country-aware line entirely — an
                  editor who types one has decided the geo wording is wrong for
                  everyone, not for one country. */}
              <span className="block">{t(str(hero, 'lead_override')) ?? heroLead}</span>
              <HeroTermRotator terms={HERO_TERMS} className="block" />
            </h1>
            <p className="max-w-[540px] text-[16px] leading-[1.6] text-ih-ink-2">
              {t(str(hero, 'body'))}
            </p>

            {/* Static mirror of the rotating terms. Two jobs: a moving word is
                a poor click target, and these are the only crawlable links the
                hero contributes — without them the homepage passes its ranking
                strength to no category page at all. */}
            <ul className="mt-6 flex max-w-[540px] flex-wrap gap-2">
              {HERO_TERMS.map((term) => (
                <li key={term.href}>
                  <Link
                    href={term.href}
                    className="inline-flex min-h-10 items-center rounded-md border border-ih-border px-3 text-[13px] text-ih-ink-2 transition-colors hover:border-ih-accent hover:text-ih-accent focus-visible:border-ih-accent focus-visible:shadow-[0_0_0_3px_var(--color-ih-accent-soft)] focus-visible:outline-none"
                  >
                    {term.word}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Hero search */}
            <form action={`/search`} method="GET" className="mt-8 flex max-w-[540px] flex-col gap-1.5 rounded-md border border-ih-border bg-ih-surface p-1.5 sm:flex-row">
              <select
                name="category"
                aria-label="Category"
                className="w-full rounded-sm border-0 bg-transparent sm:w-[170px] px-3 text-[13.5px] text-ih-ink-2 outline-none focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
              <input
                name="q"
                type="search"
                aria-label="Search the catalogue"
                placeholder={str(hero, 'search_placeholder') ?? 'Search by SKU, spec or part number…'}
                className="w-full min-w-0 flex-1 rounded-sm border-0 bg-transparent px-3 py-2 text-[13.5px] text-ih-ink outline-none placeholder:text-ih-muted focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft"
              />
              <button
                type="submit"
                className="h-10 shrink-0 rounded-md bg-ih-accent px-[18px] text-[13.5px] font-medium text-ih-accent-fg transition-colors hover:bg-ih-accent-hover"
              >
                {str(hero, 'search_button') ?? 'Search'}
              </button>
            </form>

            {/* Stats */}
            {heroStats.length > 0 ? (
              <div className="mt-10 grid grid-cols-2 gap-7 sm:grid-cols-4">
                {heroStats.map((stat, i) => (
                  <div key={`${stat.label ?? ''}-${i}`} className="border-t-2 border-ih-accent pt-3.5">
                    <span className="block font-mono text-[26px] leading-none tracking-[-0.03em] tabular-nums">{t(stat.value ?? '')}</span>
                    <span className="mt-2.5 block font-mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted">{stat.label}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Right visual — carousel if hero slides exist, otherwise the
              static "exploded view" placeholder. The placeholder is kept as
              the empty-state so /admin can land before any slide is uploaded
              without breaking the homepage. */}
          <div className="hidden lg:block">
            {heroSlides.length > 0 ? (
              <HomeHeroCarousel slides={heroSlides} />
            ) : (
              <div className="relative aspect-[1.05/1] overflow-hidden border border-ih-border bg-ih-bg">
                {/* Grid overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-[length:40px_40px] opacity-[0.04]" />
                {/* Floating callouts */}
                <div className="absolute top-8 left-8 bg-ih-navy text-white font-mono text-[11px] tracking-[0.06em] px-3 py-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-ih-accent shrink-0" />
                  EXPLODED VIEW · 01
                </div>
                <div className="absolute top-1/2 right-6 -translate-y-1/2 bg-ih-navy text-white font-mono text-[11px] tracking-[0.06em] px-3 py-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-ih-accent shrink-0" />
                  P-MAX 350 BAR
                </div>
                <div className="absolute bottom-20 right-8 bg-ih-navy text-white font-mono text-[11px] tracking-[0.06em] px-3 py-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-ih-accent shrink-0" />
                  CETOP-3 · NG6
                </div>
                {/* Placeholder image area */}
                <div className="absolute inset-6 border border-dashed border-ih-border-strong flex items-center justify-center">
                  <div className="text-center">
                    <p className="font-mono text-[11px] text-ih-muted-2 leading-[1.7]">
                      Hero render<br />
                      &ldquo;Cutaway of axial piston pump&rdquo;<br />
                      1200×1100 · transparent PNG
                    </p>
                  </div>
                </div>
                {/* Spec bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-ih-surface border-t border-ih-border px-4 py-3 flex justify-between font-mono text-[12px] text-ih-muted">
                  <span>FILE: <strong className="text-ih-ink font-medium">HERO_PUMP_CUTAWAY.PNG</strong></span>
                  <span>REV: <strong className="text-ih-ink font-medium">04 · 2026-04</strong></span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    ),

    usp: uspItems.length > 0 ? (
      /* ── USP STRIP ────────────────────────────────────────────────────── */
      <section className="bg-ih-navy py-[34px] text-[oklch(0.75_0.02_250)]">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {uspItems.map((item, i) => (
            <div key={`${item.name ?? ''}-${i}`} className="flex gap-3.5 items-start">
              <span className="mt-0.5 shrink-0 font-mono text-[11px] text-ih-steel">/{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h4 className="text-[14px] font-medium text-white">{item.name}</h4>
                <p className="mt-1.5 text-[12.5px] leading-[1.55]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    ) : null,

    categories: (
      /* ── CATEGORIES ───────────────────────────────────────────────────── */
      <section className="py-[72px]">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
                {t(str(categoriesCopy, 'eyebrow'))}
              </span>
              <h2 className="mt-2 font-serif text-[clamp(26px,3vw,34px)] font-normal leading-[1.12] tracking-[-0.01em]">
                {t(str(categoriesCopy, 'heading'))}
              </h2>
            </div>
            {str(categoriesCopy, 'cta_label') && str(categoriesCopy, 'cta_href') ? (
              <Link
                href={str(categoriesCopy, 'cta_href') ?? '/c'}
                className="hidden sm:flex h-10 px-4 items-center border border-ih-border font-mono text-[12px] text-ih-ink-2 hover:bg-ih-surface-2 transition-colors shrink-0"
              >
                {str(categoriesCopy, 'cta_label')}
              </Link>
            ) : null}
          </div>

          <HomeCategoryIndex categories={categories} skuCount={activeSkuCount} />

          {/* The header's link is hidden below sm; the section still needs a
              way through to the full tree there. */}
          {str(categoriesCopy, 'cta_label') && str(categoriesCopy, 'cta_href') ? (
            <Link
              href={str(categoriesCopy, 'cta_href') ?? '/c'}
              className="mt-6 flex h-10 items-center justify-center rounded-md border border-ih-border font-mono text-[12px] text-ih-ink-2 transition-colors hover:bg-ih-surface-2 sm:hidden"
            >
              {str(categoriesCopy, 'cta_label')}
            </Link>
          ) : null}
        </div>
      </section>
    ),

    brands: (
      /* ── BRANDS RAIL ──────────────────────────────────────────────────── */
      <section className="pb-[72px]">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
                {t(str(brandsCopy, 'eyebrow'))}
              </span>
              <h2 className="mt-2 font-serif text-[clamp(24px,2.5vw,34px)] font-normal leading-[1.12] tracking-[-0.01em]">
                {t(str(brandsCopy, 'heading'))}
              </h2>
            </div>
            {str(brandsCopy, 'cta_label') && str(brandsCopy, 'cta_href') ? (
              <Link
                href={str(brandsCopy, 'cta_href') ?? '/brands'}
                className="hidden sm:flex h-10 px-4 items-center border border-ih-border font-mono text-[12px] text-ih-ink-2 hover:bg-ih-surface-2 transition-colors shrink-0"
              >
                {str(brandsCopy, 'cta_label')}
              </Link>
            ) : null}
          </div>

          <BrandMarquee brands={brands} label="Brands we distribute" />
        </div>
      </section>
    ),

    featured_products: featuredProducts.length > 0 ? (
      /* ── FEATURED PRODUCTS ────────────────────────────────────────────── */
      <section className="border-t border-ih-border py-[72px]">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">{t(str(featuredCopy, 'eyebrow'))}</span>
              <h2 className="mt-2 font-serif text-[clamp(24px,2.5vw,34px)] font-normal leading-[1.12] tracking-[-0.01em]">{t(str(featuredCopy, 'heading'))}</h2>
            </div>
            {str(featuredCopy, 'cta_label') && str(featuredCopy, 'cta_href') ? (
              <Link
                href={str(featuredCopy, 'cta_href') ?? '/c'}
                className="hidden sm:flex h-10 px-4 items-center border border-ih-border font-mono text-[12px] text-ih-ink-2 hover:bg-ih-surface-2 transition-colors shrink-0"
              >
                {str(featuredCopy, 'cta_label')}
              </Link>
            ) : null}
          </div>

          <HomeProductMix products={featuredProducts} />

          {/* The header's link is hidden below sm. */}
          {str(featuredCopy, 'cta_label') && str(featuredCopy, 'cta_href') ? (
            <Link
              href={str(featuredCopy, 'cta_href') ?? '/c'}
              className="mt-6 flex h-10 items-center justify-center rounded-md border border-ih-border font-mono text-[12px] text-ih-ink-2 transition-colors hover:bg-ih-surface-2 sm:hidden"
            >
              {str(featuredCopy, 'cta_label')}
            </Link>
          ) : null}
        </div>
      </section>
    ) : null,

    industries: (
      /* ── INDUSTRIES ───────────────────────────────────────────────────── */
      <section className="border-t border-ih-border py-[72px]">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">{t(str(industriesCopy, 'eyebrow'))}</span>
              <h2 className="mt-2 font-serif text-[clamp(24px,2.5vw,34px)] font-normal leading-[1.12] tracking-[-0.01em]">
                {t(str(industriesCopy, 'heading'))}
              </h2>
            </div>
            <Link
              href="/industries"
              className="hidden h-10 shrink-0 items-center border border-ih-border px-4 font-mono text-[12px] text-ih-ink-2 transition-colors hover:bg-ih-surface-2 sm:flex"
            >
              All industries →
            </Link>
          </div>
          <HomeIndustryTiles industries={industries} />
          <Link
            href="/industries"
            className="mt-5 flex h-10 items-center justify-center rounded-md border border-ih-border font-mono text-[12px] text-ih-ink-2 transition-colors hover:bg-ih-surface-2 sm:hidden"
          >
            All industries →
          </Link>
        </div>
      </section>
    ),

    why: (
      /* ── WHY INDUS ────────────────────────────────────────────────────── */
      <section className="border-t border-ih-border py-[72px]">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 border border-ih-border bg-ih-surface overflow-hidden">
            {/* Left */}
            <div className="p-12 flex flex-col gap-7">
              <div>
                <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">{t(str(why, 'eyebrow'))}</span>
                <h2 className="mt-4 max-w-[480px] font-serif text-[clamp(26px,3vw,36px)] font-normal leading-[1.15] tracking-[-0.01em]">
                  {t(str(why, 'heading'))}
                </h2>
              </div>
              <div className="flex flex-col">
                {whyItems.map((item, i) => (
                  <div
                    key={`${item.name ?? ''}-${i}`}
                    className={`grid grid-cols-[32px_1fr] gap-4 py-[18px] ${i > 0 ? 'border-t border-ih-border' : ''}`}
                  >
                    <span className="font-mono text-[13px] text-ih-accent pt-0.5">/{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <h4 className="text-[16px] font-semibold mb-1.5">{item.name}</h4>
                      <p className="text-[14px] text-ih-muted leading-[1.5]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — dark panel with quote */}
            <div className="relative flex min-h-[420px] flex-col justify-between overflow-hidden rounded-lg bg-ih-navy p-12 text-white">
              {/* The photograph, when one is picked: shown at full strength
                  under a black scrim — 70% at the top where the quote sits,
                  easing to 55% so the scene still reads — rather than faded
                  into the navy, which turned a photo into a smudge. White
                  text over the darkest stop of the scrim stays above AA. */}
              {quoteImage?.url ? (
                <>
                  <Image
                    src={quoteImage.url}
                    alt={quoteImage.alt ?? ''}
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-b from-[oklch(0_0_0/0.72)] via-[oklch(0_0_0/0.6)] to-[oklch(0_0_0/0.78)]"
                  />
                </>
              ) : (
                <div className="absolute inset-0 opacity-[0.15] flex items-center justify-center">
                  <p className="font-mono text-[11px] text-ih-muted text-center">
                    &ldquo;Engineer at workbench&rdquo;<br />720×800
                  </p>
                </div>
              )}
              <div className="relative">
                {/* Steel, not accent: the accent blue drops under 3:1 on the dark
                    scrim; steel is the tone the navy USP strip uses for the
                    same job. */}
                <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-steel">{str(why, 'quote_eyebrow')}</span>
                <p className="text-[22px] leading-[1.4] tracking-[-0.01em] max-w-[380px] mt-3">
                  &ldquo;{str(why, 'quote')}&rdquo;
                </p>
              </div>
              {str(why, 'quote_name') ? (
                <div className="relative flex items-center gap-3 mt-8 pt-8 border-t border-[oklch(1_0_0_/_0.1)]">
                  {quoteAvatar?.url ? (
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-[oklch(1_0_0/0.18)]">
                      <Image
                        src={quoteAvatar.url}
                        alt={quoteAvatar.alt ?? str(why, 'quote_name') ?? ''}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </span>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#2a2e35] shrink-0" />
                  )}
                  <div>
                    <div className="text-[14px] font-medium">{str(why, 'quote_name')}</div>
                    <div className="font-mono text-[12px] text-[#8a8f97]">{str(why, 'quote_title')}</div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    ),

    blog: (
      /* ── BLOG TEASER ──────────────────────────────────────────────────── */
      <section className="pb-[72px]">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">{t(str(blog, 'eyebrow'))}</span>
              <h2 className="mt-2 font-serif text-[clamp(24px,2.5vw,34px)] font-normal leading-[1.12] tracking-[-0.01em]">
                {t(str(blog, 'heading'))}
              </h2>
            </div>
            {str(blog, 'cta_label') && str(blog, 'cta_href') ? (
              <Link
                href={str(blog, 'cta_href') ?? '/blog'}
                className="hidden sm:flex h-10 px-4 items-center border border-ih-border font-mono text-[12px] text-ih-ink-2 hover:bg-ih-surface-2 transition-colors shrink-0"
              >
                {str(blog, 'cta_label')}
              </Link>
            ) : null}
          </div>

          {blogPosts.length > 0 ? (
            <>
              <HomeBlogMosaic posts={blogPosts} />
              {/* The header's link is hidden below sm. */}
              {str(blog, 'cta_label') && str(blog, 'cta_href') ? (
                <Link
                  href={str(blog, 'cta_href') ?? '/blog'}
                  className="mt-5 flex h-10 items-center justify-center rounded-md border border-ih-border font-mono text-[12px] text-ih-ink-2 transition-colors hover:bg-ih-surface-2 sm:hidden"
                >
                  {str(blog, 'cta_label')}
                </Link>
              ) : null}
            </>
          ) : (
            /* Nothing published yet. This branch used to render three
               hardcoded articles — invented titles, an invented date, and
               links that all went to /blog — which reads as real editorial to
               a visitor and to a crawler. An empty rail is honest; a fake one
               is a credibility problem the moment it renders. */
            <div className="rounded-lg border border-ih-border bg-ih-surface px-6 py-10 text-center">
              <p className="text-[15px] text-ih-muted">
                {str(blog, 'empty_message')}
              </p>
              {str(blog, 'empty_cta_label') ? (
                <Link
                  href={str(blog, 'cta_href') ?? '/blog'}
                  className="mt-4 inline-flex h-10 items-center border border-ih-border px-4 font-mono text-[12px] text-ih-ink-2 transition-colors hover:bg-ih-surface-2"
                >
                  {str(blog, 'empty_cta_label')}
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </section>
    ),

    newsletter: (
      /* ── NEWSLETTER CTA ───────────────────────────────────────────────── */
      <section className="pb-16 border-t border-ih-border">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12 pt-16">
          <div className="grid grid-cols-1 items-center gap-12 rounded-[14px] bg-ih-accent p-12 text-white lg:grid-cols-[1.2fr_1fr] lg:p-14">
            <div>
              {/* On the accent band the eyebrow inverts — accent-on-accent
                  was invisible. */}
              <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-white/75">
                {t(str(newsletter, 'eyebrow'))}
              </span>
              <h2 className="mb-3 mt-3.5 font-serif text-[clamp(24px,3vw,32px)] font-normal leading-[1.15] tracking-[-0.01em]">
                {t(str(newsletter, 'heading'))}
              </h2>
              <p className="text-[#b6bac1] max-w-[460px] leading-[1.55] text-[15px]">
                {t(str(newsletter, 'body'))}
              </p>
            </div>
            <HomeNewsletterForm />
          </div>
        </div>
      </section>
    ),
  }

  return (
    <div>
      {content.order.map((key) =>
        sections[key] ? <Fragment key={key}>{sections[key]}</Fragment> : null,
      )}
    </div>
  )
}
