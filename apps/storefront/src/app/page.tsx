import type { Metadata } from 'next'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import { db } from '@indus/db'
import HomeNewsletterForm from '../components/HomeNewsletterForm'
import HomeHeroCarousel, { type HomeHeroSlide } from '../components/HomeHeroCarousel'

export const metadata: Metadata = {
  title: 'Indus Hydraulics — Industrial Components for Hydraulic Systems',
  description:
    '1,800+ SKUs across pumps, cylinders, valves and consumables — from 14 specialist brands. ISO-certified, datasheet-backed, ready to ship to 47 countries.',
}

// Re-render the static HTML at most once a minute. Combined with the
// per-query unstable_cache wrappers below, the cold path stays fast and
// most visitors hit the CDN-cached HTML.
export const revalidate = 60

const getHomeCategories = unstable_cache(
  () =>
    db.category.findMany({
      where: { isPublished: true, parentId: null },
      orderBy: { position: 'asc' },
      include: { _count: { select: { products: true } } },
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
      select: { id: true, name: true, slug: true, country: true, description: true, isAuthorizedDistributor: true },
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
      include: { hero: { select: { storagePath: true, alt: true } }, author: { select: { name: true } } },
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

export default async function HomePage() {
  const [categories, brands, featuredProducts, blogPosts, activeSkuCount, publishedBrandCount, heroSlides] = await Promise.all([
    getHomeCategories(),
    getHomeBrands(),
    getHomeFeaturedProducts(),
    getHomeBlogPosts(),
    getActiveSkuCount(),
    getPublishedBrandCount(),
    getHomeHeroSlides(),
  ])

  const yearsInBusiness = new Date().getFullYear() - 2003

  const industries = [
    { slug: 'oil-gas', code: 'IND.01', name: 'Oil & Gas', desc: 'Wellhead, drilling and offshore — high-pressure, sour-service grades.' },
    { slug: 'marine', code: 'IND.02', name: 'Marine', desc: 'Deck machinery, steering and stabilisers. Salt-water rated finishes.' },
    { slug: 'mining', code: 'IND.03', name: 'Mining', desc: 'Underground & surface — fire-resistant fluid compatible kit.' },
    { slug: 'steel', code: 'IND.04', name: 'Steel & Metal', desc: 'Rolling mills, presses, continuous casters. Mill-type cylinders.' },
    { slug: 'construction', code: 'IND.05', name: 'Construction', desc: 'Mobile equipment, lifts, cranes & tippers.' },
    { slug: 'agriculture', code: 'IND.06', name: 'Agriculture', desc: 'Tractors, implements, irrigation. Hardy and serviceable.' },
  ]

  const whyItems = [
    { n: '/01', title: 'Specialists, not generalists', body: 'We carry only hydraulic components — no PPE, no fasteners. Depth over breadth.' },
    { n: '/02', title: 'Genuine parts, traceable', body: 'Every SKU comes with origin certificate and batch traceability. No counterfeits.' },
    { n: '/03', title: 'Stock you can count on', body: 'Live inventory on the site is real. If it says "in stock", it ships today.' },
    { n: '/04', title: 'Application help, free', body: 'Send us a circuit, a failure photo or a bare SKU — our engineers respond same business day.' },
  ]

  const uspItems = [
    { n: '01', title: 'Same-day dispatch', body: 'Stock orders before 14:00 IST ship same day from Mumbai & Houston.' },
    { n: '02', title: 'Engineering support', body: 'Speak to a real applications engineer — not a call centre.' },
    { n: '03', title: 'Datasheets & CAD', body: 'Every SKU ships with a PDF datasheet and downloadable 3D model.' },
    { n: '04', title: 'Backed by warranty', body: '24-month manufacturer warranty across the entire catalogue.' },
  ]

  const [featuredCat, ...restCats] = categories

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="bg-[var(--color-elevated)] border-b border-[var(--color-border)] overflow-hidden">
        <div className="max-w-[1360px] mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-16 items-center">

          {/* Left copy */}
          <div>
            <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--color-muted)]">
              EST. 2003 — MUMBAI · HOUSTON · DUBAI
            </span>
            <h1 className="text-[clamp(40px,5vw,64px)] font-semibold leading-[1.02] tracking-[-0.035em] mt-4 mb-5 text-balance">
              Niche hydraulic components, sourced for engineers who{' '}
              <em className="not-italic text-[var(--color-accent)]">can&apos;t afford downtime</em>.
            </h1>
            <p className="text-[17px] text-[var(--color-muted)] max-w-[520px] leading-[1.55]">
              1,800+ SKUs across pumps, cylinders, valves and consumables — from 14 specialist brands.
              ISO-certified, datasheet-backed, ready to ship to 47 countries.
            </p>

            {/* Hero search */}
            <form action={`/search`} method="GET" className="mt-8 flex bg-[var(--color-surface)] border border-[var(--color-border)] max-w-[540px] gap-1.5 p-1.5">
              <select
                name="category"
                className="w-[180px] border-0 bg-transparent px-3 text-[13px] text-[var(--color-body)] focus:outline-none"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
              <input
                name="q"
                type="search"
                placeholder="Search by SKU, spec or part number…"
                className="flex-1 border-0 bg-transparent px-3 py-2 text-[13px] text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none"
              />
              <button
                type="submit"
                className="h-9 px-4 bg-[var(--color-accent)] text-white font-mono text-[12px] hover:opacity-90 transition-opacity shrink-0"
              >
                Search
              </button>
            </form>

            {/* Stats */}
            <div className="flex gap-8 mt-9 pt-7 border-t border-[var(--color-border-2)]">
              {[
                { num: activeSkuCount.toLocaleString(), label: 'SKUs IN STOCK' },
                { num: String(publishedBrandCount), label: 'PARTNER BRANDS' },
                { num: '47', label: 'COUNTRIES SERVED' },
                { num: `${yearsInBusiness} yrs`, label: 'IN BUSINESS' },
              ].map((s) => (
                <div key={s.label} className="flex flex-col gap-0.5">
                  <span className="font-mono text-[22px] tracking-[-0.02em] font-semibold">{s.num}</span>
                  <span className="font-mono text-[12px] text-[var(--color-muted)] tracking-[0.04em]">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right visual — carousel if hero slides exist, otherwise the
              static "exploded view" placeholder. The placeholder is kept as
              the empty-state so /admin can land before any slide is uploaded
              without breaking the homepage. */}
          <div className="hidden lg:block">
            {heroSlides.length > 0 ? (
              <HomeHeroCarousel slides={heroSlides} />
            ) : (
              <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden" style={{ aspectRatio: '1.05 / 1' }}>
                {/* Grid overlay */}
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                  }}
                />
                {/* Floating callouts */}
                <div className="absolute top-8 left-8 bg-[var(--color-primary)] text-[var(--color-surface)] font-mono text-[11px] tracking-[0.06em] px-3 py-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0" />
                  EXPLODED VIEW · 01
                </div>
                <div className="absolute top-1/2 right-6 -translate-y-1/2 bg-[var(--color-primary)] text-[var(--color-surface)] font-mono text-[11px] tracking-[0.06em] px-3 py-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0" />
                  P-MAX 350 BAR
                </div>
                <div className="absolute bottom-20 right-8 bg-[var(--color-primary)] text-[var(--color-surface)] font-mono text-[11px] tracking-[0.06em] px-3 py-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0" />
                  CETOP-3 · NG6
                </div>
                {/* Placeholder image area */}
                <div className="absolute inset-6 border border-dashed border-[var(--color-muted)] flex items-center justify-center">
                  <div className="text-center">
                    <p className="font-mono text-[11px] text-[var(--color-caption)] leading-[1.7]">
                      Hero render<br />
                      &ldquo;Cutaway of axial piston pump&rdquo;<br />
                      1200×1100 · transparent PNG
                    </p>
                  </div>
                </div>
                {/* Spec bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-[var(--color-elevated)] border-t border-[var(--color-border)] px-4 py-3 flex justify-between font-mono text-[12px] text-[var(--color-muted)]">
                  <span>FILE: <strong className="text-[var(--color-primary)] font-medium">HERO_PUMP_CUTAWAY.PNG</strong></span>
                  <span>REV: <strong className="text-[var(--color-primary)] font-medium">04 · 2026-04</strong></span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── USP STRIP ────────────────────────────────────────────────────── */}
      <section className="bg-[var(--color-primary)] text-[var(--color-surface)] py-[18px]">
        <div className="max-w-[1360px] mx-auto px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {uspItems.map((u) => (
            <div key={u.n} className="flex gap-3.5 items-start">
              <span className="font-mono text-[12px] text-[var(--color-caption)] mt-1 shrink-0">{u.n}</span>
              <div>
                <h4 className="text-[14px] font-semibold mb-1">{u.title}</h4>
                <p className="text-[13px] text-[#b6bac1] leading-[1.45]">{u.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-[1360px] mx-auto px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--color-muted)]">
                SHOP BY CATEGORY · {String(categories.length).padStart(2, '0')} GROUPS
              </span>
              <h2 className="text-[clamp(24px,3vw,36px)] font-semibold tracking-tight mt-1 leading-[1.05]">
                The full catalogue, organised the way engineers think.
              </h2>
            </div>
            <Link
              href={`/c`}
              className="hidden sm:flex h-10 px-4 items-center border border-[var(--color-border)] font-mono text-[12px] text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors shrink-0"
            >
              Browse all categories →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Featured (span 2) */}
            {featuredCat && (
              <Link
                href={`/c/${featuredCat.slug}`}
                className="group bg-[var(--color-elevated)] border border-[var(--color-border)] overflow-hidden flex flex-col lg:flex-row lg:col-span-2 hover:border-[var(--color-muted)] transition-colors"
              >
                <div className="lg:flex-1 min-h-[220px] lg:min-h-[320px] bg-[var(--color-deep)] border-b lg:border-b-0 lg:border-r border-[var(--color-border)] flex items-center justify-center">
                  <p className="font-mono text-[11px] text-[var(--color-caption)] text-center px-6">
                    Hero category visual<br />
                    &ldquo;{featuredCat.name} line-up&rdquo;<br />
                    1100×800
                  </p>
                </div>
                <div className="lg:flex-1 p-8 flex flex-col justify-center gap-2.5">
                  <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--color-muted)]">FEATURED CATEGORY</span>
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[22px] font-semibold tracking-[-0.015em]">{featuredCat.name}</h3>
                    <span className="font-mono text-[12px] text-[var(--color-muted)] shrink-0">{featuredCat._count.products} SKUs</span>
                  </div>
                  {featuredCat.shortDescription && (
                    <p className="text-[14px] text-[var(--color-muted)] leading-[1.5]">{featuredCat.shortDescription}</p>
                  )}
                  <div className="mt-2 pt-3 border-t border-[var(--color-border-2)] flex justify-between items-center">
                    <span className="text-[var(--color-accent)] font-medium text-[13px] group-hover:underline">Explore {featuredCat.name} →</span>
                    <span className="font-mono text-[11px] text-[var(--color-caption)]">CAT.01</span>
                  </div>
                </div>
              </Link>
            )}

            {/* Regular tiles */}
            {restCats.map((cat, i) => (
              <Link
                key={cat.id}
                href={`/c/${cat.slug}`}
                className="group bg-[var(--color-elevated)] border border-[var(--color-border)] overflow-hidden flex flex-col hover:border-[var(--color-muted)] transition-colors"
              >
                <div className="aspect-[16/10] bg-[var(--color-deep)] border-b border-[var(--color-border)] flex items-center justify-center">
                  <p className="font-mono text-[11px] text-[var(--color-caption)] text-center px-4">
                    &ldquo;{cat.name}&rdquo;<br />720×450
                  </p>
                </div>
                <div className="p-5 flex flex-col gap-2.5 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-[18px] font-semibold tracking-[-0.015em]">{cat.name}</h3>
                    <span className="font-mono text-[12px] text-[var(--color-muted)] shrink-0">{cat._count.products} SKUs</span>
                  </div>
                  {cat.shortDescription && (
                    <p className="text-[14px] text-[var(--color-muted)] leading-[1.5] line-clamp-2">{cat.shortDescription}</p>
                  )}
                  <div className="mt-auto pt-3 border-t border-[var(--color-border-2)] flex justify-between items-center">
                    <span className="text-[var(--color-accent)] font-medium text-[13px] group-hover:underline">Explore →</span>
                    <span className="font-mono text-[11px] text-[var(--color-caption)]">CAT.0{i + 2}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRANDS RAIL ──────────────────────────────────────────────────── */}
      <section className="py-0 pb-16">
        <div className="max-w-[1360px] mx-auto px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--color-muted)]">
                PARTNER BRANDS · {String(brands.length).padStart(2, '0')}
              </span>
              <h2 className="text-[clamp(22px,2.5vw,32px)] font-semibold tracking-tight mt-1">
                Authorised distributor for the names engineers trust.
              </h2>
            </div>
            <Link
              href={`/brands`}
              className="hidden sm:flex h-10 px-4 items-center border border-[var(--color-border)] font-mono text-[12px] text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors shrink-0"
            >
              View brand index →
            </Link>
          </div>

          <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] overflow-hidden grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {brands.map((brand, i) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                className={`flex flex-col items-center justify-center text-center p-6 hover:bg-[var(--color-deep)] transition-colors cursor-pointer border-r border-b border-[var(--color-border-2)] ${
                  (i + 1) % 6 === 0 ? 'border-r-0' : ''
                } ${i >= brands.length - (brands.length % 6 || 6) ? 'border-b-0' : ''}`}
                style={{ aspectRatio: '3/2' }}
              >
                <div className="font-mono text-[13px] tracking-[0.02em] text-[var(--color-body)] uppercase font-medium">
                  <b className="block text-[18px] font-bold tracking-[-0.01em] text-[var(--color-primary)] normal-case font-sans mb-1">{brand.name}</b>
                  {brand.country?.toUpperCase()}
                </div>
                {brand.description && (
                  <div className="font-mono text-[11px] text-[var(--color-caption)] mt-2 line-clamp-1">
                    {brand.description}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section className="py-16 border-t border-[var(--color-border)]">
          <div className="max-w-[1360px] mx-auto px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--color-muted)]">FEATURED · UPDATED WEEKLY</span>
                <h2 className="text-[clamp(22px,2.5vw,32px)] font-semibold tracking-tight mt-1">New &amp; in-stock this week.</h2>
              </div>
              <Link
                href={`/c`}
                className="hidden sm:flex h-10 px-4 items-center border border-[var(--color-border)] font-mono text-[12px] text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors shrink-0"
              >
                View all products →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/p/${product.slug}`}
                  className="group bg-[var(--color-elevated)] border border-[var(--color-border)] overflow-hidden flex flex-col hover:border-[var(--color-muted)] transition-colors"
                >
                  <div className="aspect-square bg-[var(--color-deep)] border-b border-[var(--color-border-2)] relative flex items-center justify-center">
                    <span className="absolute top-3 left-3 bg-[var(--color-primary)] text-[var(--color-surface)] font-mono text-[10px] tracking-[0.08em] px-2 py-1">
                      NEW
                    </span>
                    <p className="font-mono text-[11px] text-[var(--color-caption)] text-center px-4">
                      Product image<br />520×520
                    </p>
                  </div>
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <span className="font-mono text-[11px] text-[var(--color-caption)] tracking-[0.04em]">SKU · {product.sku}</span>
                    <h4 className="text-[15px] font-medium leading-[1.3] tracking-[-0.01em]">{product.title}</h4>
                    <div className="mt-auto pt-3 border-t border-[var(--color-border-2)] flex gap-3 flex-wrap text-[12px] text-[var(--color-muted)]">
                      {product.brand && <strong className="text-[var(--color-body)] font-medium">{product.brand.name}</strong>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── INDUSTRIES ───────────────────────────────────────────────────── */}
      <section className="border-t border-[var(--color-border)]">
        <div className="max-w-[1360px] mx-auto px-8 py-10">
          <div className="mb-6">
            <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--color-muted)]">INDUSTRIES SERVED</span>
            <h2 className="text-[clamp(22px,2.5vw,32px)] font-semibold tracking-tight mt-1 leading-[1.05]">
              Built for the world&apos;s most demanding workshops.
            </h2>
          </div>
        </div>
        <div className="border-t border-[var(--color-border)] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {industries.map((ind, i) => (
            <Link
              key={ind.slug}
              href={`/industries/${ind.slug}`}
              className={`flex flex-col gap-3 px-6 py-8 border-r border-[var(--color-border-2)] hover:bg-[var(--color-elevated)] transition-colors cursor-pointer ${
                i === industries.length - 1 ? 'border-r-0' : ''
              }`}
            >
              <span className="font-mono text-[11px] text-[var(--color-caption)] tracking-[0.06em]">{ind.code}</span>
              <h4 className="text-[17px] font-semibold tracking-[-0.01em]">{ind.name}</h4>
              <p className="text-[12px] text-[var(--color-muted)] leading-[1.45]">{ind.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── WHY INDUS ────────────────────────────────────────────────────── */}
      <section className="py-16 border-t border-[var(--color-border)]">
        <div className="max-w-[1360px] mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 border border-[var(--color-border)] bg-[var(--color-elevated)] overflow-hidden">
            {/* Left */}
            <div className="p-12 flex flex-col gap-7">
              <div>
                <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--color-muted)]">WHY INDUS · A FEW REASONS</span>
                <h2 className="text-[clamp(24px,3vw,36px)] font-semibold tracking-[-0.02em] leading-[1.05] mt-2 max-w-[420px]">
                  We&apos;re a parts supplier that thinks like an engineering desk.
                </h2>
              </div>
              <div className="flex flex-col">
                {whyItems.map((item, i) => (
                  <div
                    key={item.n}
                    className={`grid grid-cols-[32px_1fr] gap-4 py-[18px] ${i > 0 ? 'border-t border-[var(--color-border-2)]' : ''}`}
                  >
                    <span className="font-mono text-[13px] text-[var(--color-accent)] pt-0.5">{item.n}</span>
                    <div>
                      <h4 className="text-[16px] font-semibold mb-1.5">{item.title}</h4>
                      <p className="text-[14px] text-[var(--color-muted)] leading-[1.5]">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — dark panel with quote */}
            <div className="bg-[var(--color-primary)] text-[var(--color-surface)] p-12 flex flex-col justify-between relative min-h-[420px]">
              {/* Subtle overlay */}
              <div className="absolute inset-0 opacity-[0.15] flex items-center justify-center">
                <p className="font-mono text-[11px] text-[var(--color-muted)] text-center">
                  &ldquo;Engineer at workbench&rdquo;<br />720×800
                </p>
              </div>
              <div className="relative">
                <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--color-accent)]">CUSTOMER · MARINE</span>
                <p className="text-[22px] leading-[1.4] tracking-[-0.01em] max-w-[380px] mt-3">
                  &ldquo;Indus delivered a 6-week-lead Atos servo valve in 4 days. We didn&apos;t lose a single shift.&rdquo;
                </p>
              </div>
              <div className="relative flex items-center gap-3 mt-8 pt-8 border-t border-[oklch(1_0_0_/_0.1)]">
                <div className="w-10 h-10 rounded-full bg-[#2a2e35] shrink-0" />
                <div>
                  <div className="text-[14px] font-medium">Captain V. Subramaniam</div>
                  <div className="font-mono text-[12px] text-[#8a8f97]">CHIEF ENGINEER · MARITIME OPS</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BLOG TEASER ──────────────────────────────────────────────────── */}
      <section className="py-0 pb-16">
        <div className="max-w-[1360px] mx-auto px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--color-muted)]">FROM THE WORKSHOP · BLOG</span>
              <h2 className="text-[clamp(22px,2.5vw,32px)] font-semibold tracking-tight mt-1">
                Field notes, sizing guides and component teardowns.
              </h2>
            </div>
            <Link
              href={`/blog`}
              className="hidden sm:flex h-10 px-4 items-center border border-[var(--color-border)] font-mono text-[12px] text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors shrink-0"
            >
              Read the blog →
            </Link>
          </div>

          {blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-4">
              {blogPosts.map((post, i) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-[var(--color-elevated)] border border-[var(--color-border)] overflow-hidden flex flex-col hover:border-[var(--color-muted)] transition-colors"
                >
                  <div className={`bg-[var(--color-deep)] border-b border-[var(--color-border)] flex items-center justify-center ${i === 0 ? 'aspect-[4/3]' : 'aspect-[16/9]'}`}>
                    <p className="font-mono text-[11px] text-[var(--color-caption)] text-center px-4">
                      Blog image<br />{i === 0 ? '900×680' : '520×290'}
                    </p>
                  </div>
                  <div className="p-5 flex flex-col gap-2.5 flex-1">
                    <div className="flex gap-3 font-mono text-[11px] text-[var(--color-muted)] tracking-[0.04em] uppercase">
                      {(post.tags as string[]).slice(0, 1).map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                      {post.publishedAt && (
                        <>
                          <span>·</span>
                          <span>{new Date(post.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </>
                      )}
                    </div>
                    <h3 className={`font-semibold tracking-[-0.01em] leading-[1.3] group-hover:text-[var(--color-accent)] transition-colors ${i === 0 ? 'text-[22px]' : 'text-[17px]'}`}>
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-[13px] text-[var(--color-muted)] leading-[1.5] line-clamp-3">{post.excerpt}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* Static placeholder when no posts yet */
            <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-4">
              {[
                {
                  tag: 'SIZING GUIDE', time: '12 MIN READ', date: '2026-04-18',
                  title: 'How to size a hydraulic cylinder without overspending: a working engineer\'s checklist.',
                  body: 'Bore, rod, stroke, mounting and cushioning — get these five right and you\'ve solved 90% of the application problem.',
                  lead: true,
                },
                {
                  tag: 'TEARDOWN', time: '8 MIN', date: '',
                  title: 'Inside an A10VSO: what fails first, and why.',
                  body: 'Swashplate wear, port plate scoring, bias spring fatigue — a teardown of three returned units.',
                  lead: false,
                },
                {
                  tag: 'SPECIFICATION', time: '5 MIN', date: '',
                  title: 'NBR vs FKM: choosing rod seals for high-temp service.',
                  body: 'A short, opinionated guide to picking the right elastomer for fluid & ambient.',
                  lead: false,
                },
              ].map((post, i) => (
                <Link
                  key={post.tag + i}
                  href={`/blog`}
                  className="group bg-[var(--color-elevated)] border border-[var(--color-border)] overflow-hidden flex flex-col hover:border-[var(--color-muted)] transition-colors"
                >
                  <div className={`bg-[var(--color-deep)] border-b border-[var(--color-border)] flex items-center justify-center ${post.lead ? 'aspect-[4/3]' : 'aspect-[16/9]'}`}>
                    <p className="font-mono text-[11px] text-[var(--color-caption)] text-center px-4">
                      Blog illustration<br />{post.lead ? '900×680' : '520×290'}
                    </p>
                  </div>
                  <div className="p-5 flex flex-col gap-2.5 flex-1">
                    <div className="flex gap-2 font-mono text-[11px] text-[var(--color-muted)] tracking-[0.04em]">
                      <span>{post.tag}</span>
                      <span>·</span>
                      <span>{post.time}</span>
                      {post.date && <><span>·</span><span>{post.date}</span></>}
                    </div>
                    <h3 className={`font-semibold tracking-[-0.01em] leading-[1.3] group-hover:text-[var(--color-accent)] transition-colors ${post.lead ? 'text-[22px]' : 'text-[17px]'}`}>
                      {post.title}
                    </h3>
                    <p className="text-[13px] text-[var(--color-muted)] leading-[1.5]">{post.body}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── NEWSLETTER CTA ───────────────────────────────────────────────── */}
      <section className="pb-16 border-t border-[var(--color-border)]">
        <div className="max-w-[1360px] mx-auto px-8 pt-16">
          <div className="bg-[var(--color-primary)] text-[var(--color-surface)] grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-center p-14">
            <div>
              <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--color-accent)]">
                NEWSLETTER · 2× A MONTH
              </span>
              <h2 className="text-[clamp(24px,3vw,36px)] font-semibold tracking-[-0.02em] leading-[1.05] mt-2 mb-3">
                Catalog drops, sizing notes, and stock alerts — straight to your inbox.
              </h2>
              <p className="text-[#b6bac1] max-w-[460px] leading-[1.55] text-[15px]">
                4,200+ engineers, plant managers and procurement leads read it. No marketing fluff, no spam.
              </p>
            </div>
            <HomeNewsletterForm />
          </div>
        </div>
      </section>
    </div>
  )
}
