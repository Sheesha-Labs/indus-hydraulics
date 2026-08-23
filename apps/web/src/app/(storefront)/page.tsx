import type { Metadata } from 'next'
import { Fragment, type ReactNode } from 'react'
import { headers } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import { db } from '@indus/db'
import { HERO_TERMS, heroLeadFor, img, interpolate, list, str, visibleList } from '@indus/domain'
import HomeNewsletterForm from '../../components/HomeNewsletterForm'
import HomeHeroCarousel, { type HomeHeroSlide } from '../../components/HomeHeroCarousel'
import HeroTermRotator from '../../components/HeroTermRotator'
import { getIndustryList } from '../../lib/industry-content'
import { mediaUrl } from '../../lib/media'
import { getMasterPageContent } from '../../lib/page-content'
import { BASE_URL } from '../../lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  // Pull live counts so the meta description matches the catalogue we
  // actually have, not an aspirational number. Rounded down to the
  // nearest 100 so the claim stays defensible as new SKUs are added.
  const [skuCount, brandCount] = await Promise.all([
    getActiveSkuCount(),
    getPublishedBrandCount(),
  ])
  const skuFloor = Math.max(100, Math.floor(skuCount / 100) * 100)
  return {
    title: 'Indus Hydraulics — Industrial Components for Hydraulic Systems',
    description: `${skuFloor.toLocaleString()}+ SKUs across pumps, cylinders, valves and consumables — from ${brandCount} specialist brands. ISO-certified, datasheet-backed, shipped from our Dubai HQ across the GCC.`,
    // Every other indexable route declares one through `pageMetadata`; the
    // home page built its metadata by hand and so shipped none. It is the one
    // URL where that matters most — Google resolves a site's favicon and its
    // Organization entity against the home page, and an unresolved canonical
    // is a weaker anchor for both. No trailing slash, so it matches the
    // sitemap's `loc` and the `og:url` byte for byte.
    alternates: { canonical: BASE_URL },
  }
}

// Nominal ISR window. In practice this route renders per request — production
// serves `/` with `cache-control: private, no-cache, no-store`, so the CDN
// never holds a copy. Reading the geo header below depends on that and would
// break silently if the page ever became static, which is what the
// `hero-geo` e2e spec is there to catch. Left as-is rather than removed: it is
// pre-existing, and the right fix is to make this page cacheable again, not to
// delete the intent.
export const revalidate = 60

const getHomeCategories = unstable_cache(
  () =>
    db.category.findMany({
      where: { isPublished: true, parentId: null },
      orderBy: { position: 'asc' },
      include: {
        _count: { select: { products: true } },
        // Kept on the query so a category visual can be dropped back into the
        // card panel below without touching the data layer.
        image: { select: { storagePath: true, alt: true, width: true, height: true } },
      },
      take: 6,
    }),
  ['home-categories'],
  { revalidate: 300, tags: ['categories'] },
)

const getHomeBrands = unstable_cache(
  () =>
    db.brand.findMany({
      where: { isPublished: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, country: true, isAuthorizedDistributor: true },
      take: 12,
    }),
  ['home-brands'],
  { revalidate: 300, tags: ['brands'] },
)

const getHomeFeaturedProducts = unstable_cache(
  () =>
    db.product.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: { brand: { select: { name: true } } },
    }),
  ['home-featured-products'],
  { revalidate: 60, tags: ['products'] },
)

const getHomeBlogPosts = unstable_cache(
  () =>
    db.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      include: {
        hero: { select: { storagePath: true, alt: true } },
        // Category, not `tags`. The teaser used to label each card from
        // `tags`, which nothing populates — all 30 published articles carry an
        // empty array — so the eyebrow rendered as a bare separator and a
        // date. The rest of the blog (index, category hubs, author pages) has
        // always labelled cards by category; this matches it.
        category: { select: { name: true, isPublished: true } },
        author: { select: { name: true } },
      },
    }),
  ['home-blog-posts'],
  { revalidate: 300, tags: ['blog-posts'] },
)

const getActiveSkuCount = unstable_cache(
  () => db.product.count({ where: { status: 'active' } }),
  ['home-active-sku-count'],
  { revalidate: 60, tags: ['product-count'] },
)

const getPublishedBrandCount = unstable_cache(
  () => db.brand.count({ where: { isPublished: true } }),
  ['home-published-brand-count'],
  { revalidate: 300, tags: ['brands'] },
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
  { revalidate: 600, tags: ['homepage-hero'] },
)

export default async function HomePage({
  searchParams,
}: {
  // Next's own contract: a repeated param arrives as an array, which is why
  // this is not narrowed to `string`. heroLeadFor handles both.
  searchParams: Promise<{ geo?: string | string[] }>
}) {
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
  // `x-vercel-ip-country` is set by Vercel's edge on every request: no service
  // to call, no cookie, nothing to consent to. It is absent locally and on any
  // other host, and it is absent for search crawlers in every country we have
  // no wording for — all of which resolve to the Dubai fallback, so there is no
  // path that renders a headline with a hole in it.
  //
  // `?geo=XX` overrides it. Left enabled in production deliberately: it is how
  // the wording gets reviewed without leaving the country, and it exposes
  // nothing a visitor could not already see by travelling.
  const [{ geo }, requestHeaders] = await Promise.all([searchParams, headers()])
  const heroLead = heroLeadFor(geo ?? requestHeaders.get('x-vercel-ip-country'))

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
    desc: row.description ?? row.tagline ?? '',
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

  const [featuredCat, ...restCats] = categories

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
                  <option key={c.id} value={c.slug}>{c.name}</option>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Featured (span 2) */}
            {featuredCat && (
              <Link
                href={`/c/${featuredCat.slug}`}
                className="group flex flex-col overflow-hidden rounded-lg border border-ih-border bg-ih-surface transition-colors hover:border-ih-accent lg:col-span-2 lg:flex-row"
              >
                {/* The category feature image — a studio group shot of the real
                    products in that category. This panel crops much squarer
                    than the tiles below (near 4:3 on desktop, a 220px band on
                    mobile), which is what the artwork is composed for. */}
                <div className="lg:flex-1 min-h-[220px] lg:min-h-[320px] bg-ih-surface-2 border-b lg:border-b-0 lg:border-r border-ih-border relative overflow-hidden">
                  {featuredCat.image && (
                    <Image
                      src={mediaUrl(featuredCat.image.storagePath)}
                      alt={featuredCat.image.alt ?? featuredCat.name}
                      fill
                      // Half of a two-column span on desktop, full-bleed once
                      // the card stacks at lg.
                      sizes="(max-width: 1024px) 100vw, 30vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  )}
                </div>
                <div className="lg:flex-1 p-8 flex flex-col justify-center gap-2.5">
                  <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">{str(categoriesCopy, 'featured_label')}</span>
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[22px] font-semibold tracking-[-0.015em]">{featuredCat.name}</h3>
                    <span className="font-mono text-[12px] text-ih-muted shrink-0">{featuredCat._count.products} SKUs</span>
                  </div>
                  {featuredCat.shortDescription && (
                    <p className="text-[14px] text-ih-muted leading-[1.5]">{featuredCat.shortDescription}</p>
                  )}
                  <div className="mt-2 pt-3 border-t border-ih-border flex justify-between items-center">
                    <span className="text-ih-accent font-medium text-[13px] group-hover:underline">Explore {featuredCat.name} →</span>
                    <span className="font-mono text-[11px] text-ih-muted-2">CAT.01</span>
                  </div>
                </div>
              </Link>
            )}

            {/* Regular tiles */}
            {restCats.map((cat, i) => (
              <Link
                key={cat.id}
                href={`/c/${cat.slug}`}
                className="group flex flex-col overflow-hidden rounded-lg border border-ih-border bg-ih-surface transition-colors hover:border-ih-accent"
              >
                {/* The category feature image, cropped 16:10. */}
                <div className="aspect-[16/10] bg-ih-surface-2 border-b border-ih-border relative overflow-hidden">
                  {cat.image && (
                    <Image
                      src={mediaUrl(cat.image.storagePath)}
                      alt={cat.image.alt ?? cat.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 30vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  )}
                </div>
                <div className="p-5 flex flex-col gap-2.5 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-[18px] font-semibold tracking-[-0.015em]">{cat.name}</h3>
                    <span className="font-mono text-[12px] text-ih-muted shrink-0">{cat._count.products} SKUs</span>
                  </div>
                  {cat.shortDescription && (
                    <p className="text-[14px] text-ih-muted leading-[1.5] line-clamp-2">{cat.shortDescription}</p>
                  )}
                  <div className="mt-auto pt-3 border-t border-ih-border flex justify-between items-center">
                    <span className="text-ih-accent font-medium text-[13px] group-hover:underline">Explore →</span>
                    <span className="font-mono text-[11px] text-ih-muted-2">CAT.0{i + 2}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
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

          <div className="border border-ih-border bg-ih-surface overflow-hidden grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {brands.map((brand, i) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                className={`flex aspect-[3/2] flex-col items-center justify-center text-center p-6 hover:bg-ih-surface-2 transition-colors cursor-pointer border-r border-b border-ih-border ${
                  (i + 1) % 6 === 0 ? 'border-r-0' : ''
                } ${i >= brands.length - (brands.length % 6 || 6) ? 'border-b-0' : ''}`}
              >
                <div className="font-mono text-[13px] tracking-[0.02em] text-ih-ink-2 uppercase font-medium">
                  <b className="block text-[18px] font-bold tracking-[-0.01em] text-ih-ink normal-case font-sans mb-1">{brand.name}</b>
                  {brand.country?.toUpperCase()}
                </div>
              </Link>
            ))}
          </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/p/${product.slug}`}
                className="group flex flex-col overflow-hidden rounded-lg border border-ih-border bg-ih-surface transition-colors hover:border-ih-accent"
              >
                <div className="aspect-square bg-ih-surface-2 border-b border-ih-border relative flex items-center justify-center">
                  <span className="absolute top-3 left-3 bg-ih-navy text-white font-mono text-[10px] tracking-[0.08em] px-2 py-1">
                    NEW
                  </span>
                  <p className="font-mono text-[11px] text-ih-muted-2 text-center px-4">
                    Product image<br />520×520
                  </p>
                </div>
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <span className="font-mono text-[11px] text-ih-muted-2 tracking-[0.04em]">SKU · {product.sku}</span>
                  <h4 className="text-[15px] font-medium leading-[1.3] tracking-[-0.01em]">{product.title}</h4>
                  <div className="mt-auto pt-3 border-t border-ih-border flex gap-3 flex-wrap text-[12px] text-ih-muted">
                    {product.brand && <strong className="text-ih-ink-2 font-medium">{product.brand.name}</strong>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    ) : null,

    industries: (
      /* ── INDUSTRIES ───────────────────────────────────────────────────── */
      <section className="border-t border-ih-border">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12 py-10">
          <div className="mb-6">
            <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">{t(str(industriesCopy, 'eyebrow'))}</span>
            <h2 className="mt-2 font-serif text-[clamp(24px,2.5vw,34px)] font-normal leading-[1.12] tracking-[-0.01em]">
              {t(str(industriesCopy, 'heading'))}
            </h2>
          </div>
        </div>
        <div className="border-t border-ih-border grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {industries.map((ind, i) => (
            <Link
              key={ind.slug}
              href={`/industries/${ind.slug}`}
              className={`flex flex-col gap-3 px-6 py-8 border-r border-ih-border hover:bg-ih-surface transition-colors cursor-pointer ${
                i === industries.length - 1 ? 'border-r-0' : ''
              }`}
            >
              <span className="font-mono text-[11px] text-ih-muted-2 tracking-[0.06em]">{ind.code}</span>
              <h4 className="text-[17px] font-semibold tracking-[-0.01em]">{ind.name}</h4>
              <p className="text-[12px] text-ih-muted leading-[1.45]">{ind.desc}</p>
            </Link>
          ))}
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
              {/* The photograph, when one is picked. Held at 15% so the quote
                  stays the readable thing on the panel — the same weight the
                  placeholder caption sat at before there was an image. */}
              {quoteImage?.url ? (
                <Image
                  src={quoteImage.url}
                  alt={quoteImage.alt ?? ''}
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover opacity-[0.28]"
                />
              ) : (
                <div className="absolute inset-0 opacity-[0.15] flex items-center justify-center">
                  <p className="font-mono text-[11px] text-ih-muted text-center">
                    &ldquo;Engineer at workbench&rdquo;<br />720×800
                  </p>
                </div>
              )}
              <div className="relative">
                <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-accent">{str(why, 'quote_eyebrow')}</span>
                <p className="text-[22px] leading-[1.4] tracking-[-0.01em] max-w-[380px] mt-3">
                  &ldquo;{str(why, 'quote')}&rdquo;
                </p>
              </div>
              {str(why, 'quote_name') ? (
                <div className="relative flex items-center gap-3 mt-8 pt-8 border-t border-[oklch(1_0_0_/_0.1)]">
                  <div className="w-10 h-10 rounded-full bg-[#2a2e35] shrink-0" />
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
            <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-4">
              {blogPosts.map((post, i) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-lg border border-ih-border bg-ih-surface transition-colors hover:border-ih-accent"
                >
                  {/* The hero photograph, same Media row the article page and
                      the blog index render. The card used to draw a grey
                      "900×680" spec box here — the query has always fetched
                      the hero, the markup simply never used it. */}
                  <div className={`relative overflow-hidden bg-ih-surface-2 border-b border-ih-border ${i === 0 ? 'aspect-[4/3]' : 'aspect-[16/9]'}`}>
                    {post.hero ? (
                      <Image
                        src={mediaUrl(post.hero.storagePath)}
                        alt={post.hero.alt ?? post.title}
                        fill
                        // The lead card is ~45vw of the three-column grid, the
                        // two followers ~28vw each; both go full-bleed once the
                        // grid stacks at md.
                        sizes={i === 0 ? '(max-width: 768px) 100vw, 45vw' : '(max-width: 768px) 100vw, 30vw'}
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <span className="font-mono absolute inset-0 grid place-items-center text-[11px] text-ih-muted-2">
                        Indus Hydraulics
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex flex-col gap-2.5 flex-1">
                    {/* Built by joining the parts that exist, so a missing
                        category or date never leaves a dangling separator. */}
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[11px] text-ih-muted tracking-[0.04em] uppercase">
                      {[
                        post.category?.isPublished ? post.category.name : null,
                        post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                          : null,
                        post.readingMinutes ? `${post.readingMinutes} min` : null,
                      ]
                        .filter((part): part is string => part !== null)
                        .map((part, index) => (
                          <span key={index} className="flex items-center gap-2.5">
                            {index > 0 && <span className="opacity-40">·</span>}
                            {part}
                          </span>
                        ))}
                    </div>
                    <h3 className={`font-semibold tracking-[-0.01em] leading-[1.3] group-hover:text-ih-accent transition-colors ${i === 0 ? 'text-[22px]' : 'text-[17px]'}`}>
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-[13px] text-ih-muted leading-[1.5] line-clamp-3">{post.excerpt}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
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
