import { mediaUrl } from '../../../lib/media'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@indus/db'
import { getTranslations } from 'next-intl/server'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string; brands?: string; category?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams
  return { title: sp.q ? `Search: ${sp.q}` : 'Search' }
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params
  const sp = await searchParams
  const t = await getTranslations({ locale, namespace: 'search' })
  const query = (sp.q ?? '').trim()

  const selectedBrands = sp.brands ? sp.brands.split(',').filter(Boolean) : []
  const selectedCategory = sp.category ?? ''

  let products: Awaited<ReturnType<typeof db.product.findMany<{ include: { brand: true; category: true; images: { include: { media: true } } } }>>> = []
  let facetBrands: { id: string; name: string; slug: string; count: number }[] = []
  let facetCategories: { id: string; name: string; slug: string; count: number }[] = []
  let relatedDocs: Awaited<ReturnType<typeof db.productDocument.findMany<{ include: { media: true; product: { select: { sku: true; title: true } } } }>>> = []

  if (query.length >= 2) {
    const baseWhere = {
      status: 'active' as const,
      OR: [
        { title: { contains: query, mode: 'insensitive' as const } },
        { sku: { contains: query, mode: 'insensitive' as const } },
        { mpn: { contains: query, mode: 'insensitive' as const } },
        { descriptionShort: { contains: query, mode: 'insensitive' as const } },
      ],
    }

    const filteredWhere = {
      ...baseWhere,
      ...(selectedBrands.length > 0 ? { brand: { slug: { in: selectedBrands } } } : {}),
      ...(selectedCategory ? { category: { slug: selectedCategory } } : {}),
    }

    ;[products, facetBrands, facetCategories, relatedDocs] = await Promise.all([
      db.product.findMany({
        where: filteredWhere,
        include: {
          brand: true,
          category: true,
          images: { orderBy: { position: 'asc' }, take: 1, include: { media: true } },
        },
        take: 24,
        orderBy: { title: 'asc' },
      }),
      db.product.groupBy({
        by: ['brandId'],
        where: baseWhere,
        _count: { _all: true },
      }).then(async (groups) => {
        const ids = groups.map((g) => g.brandId).filter(Boolean) as string[]
        const brands = await db.brand.findMany({ where: { id: { in: ids } } })
        return brands.map((b) => ({ ...b, count: groups.find((g) => g.brandId === b.id)?._count._all ?? 0 }))
      }),
      db.product.groupBy({
        by: ['categoryId'],
        where: baseWhere,
        _count: { _all: true },
      }).then(async (groups) => {
        const ids = groups.map((g) => g.categoryId).filter(Boolean) as string[]
        const cats = await db.category.findMany({ where: { id: { in: ids } } })
        return cats.map((c) => ({ ...c, count: groups.find((g) => g.categoryId === c.id)?._count._all ?? 0 }))
      }),
      db.productDocument.findMany({
        where: {
          isGated: false,
          product: {
            status: 'active',
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { sku: { contains: query, mode: 'insensitive' } },
            ],
          },
        },
        include: { media: true, product: { select: { sku: true, title: true } } },
        take: 4,
      }),
    ])
  }

  function filterUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams()
    const base = { q: query, brands: selectedBrands.join(',') || undefined, category: selectedCategory || undefined }
    const merged = { ...base, ...overrides }
    for (const [k, v] of Object.entries(merged)) {
      if (v) p.set(k, v)
    }
    return `/${locale}/search?${p.toString()}`
  }

  function toggleBrand(slug: string) {
    const next = selectedBrands.includes(slug) ? selectedBrands.filter((b) => b !== slug) : [...selectedBrands, slug]
    return filterUrl({ brands: next.join(',') || undefined })
  }

  const topMatch = products[0]
  const restProducts = products.slice(1)

  return (
    <div className="max-w-[1360px] mx-auto px-8 py-8 pb-16">
      {/* Search header */}
      <div className="flex items-baseline gap-4 flex-wrap mb-3">
        <h1 className="text-[32px] font-semibold tracking-[-0.02em]">Search results</h1>
        {query.length >= 2 && (
          <span className="font-mono text-[13px] text-[var(--color-muted)]">
            for &ldquo;<b className="text-[var(--color-primary)]">{query}</b>&rdquo; · {products.length} match{products.length !== 1 ? 'es' : ''}
          </span>
        )}
      </div>

      {/* Search input row */}
      <form method="GET" action={`/${locale}/search`} className="mb-8 max-w-[640px]">
        <div className="flex border border-[var(--color-border)] bg-[var(--color-elevated)]">
          <input
            name="q"
            defaultValue={query}
            autoFocus
            placeholder={t('placeholder')}
            className="flex-1 px-4 py-3 bg-transparent text-[14px] text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none"
          />
          <button type="submit" className="h-11 px-5 bg-[var(--color-accent)] text-white font-mono text-[12px] hover:opacity-90 transition-opacity shrink-0">
            Search
          </button>
        </div>
      </form>

      {query.length < 2 ? (
        <div className="py-20 text-center">
          <p className="text-[var(--color-muted)] text-sm">{t('noResultsDescription')}</p>
          <div className="mt-6">
            <Link href={`/${locale}/c`} className="font-mono text-[12px] text-[var(--color-accent)] hover:underline">
              {t('browseCategories')} →
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-[240px_1fr] gap-8">
          {/* ── Filter sidebar ────────────────────────────────── */}
          <aside>
            <div className="sticky top-[88px]">
              <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--color-muted)] mb-4">Refine results</p>

              {facetCategories.length > 0 && (
                <div className="mb-5">
                  <div className="font-semibold text-[13px] mb-2">Category</div>
                  <div className="flex flex-col gap-1.5 text-[13px]">
                    {facetCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={filterUrl({ category: selectedCategory === cat.slug ? undefined : cat.slug })}
                        className="flex justify-between items-center text-[var(--color-body)] hover:text-[var(--color-primary)]"
                      >
                        <span className={selectedCategory === cat.slug ? 'font-medium text-[var(--color-accent)]' : ''}>{cat.name}</span>
                        <span className="font-mono text-[11px] text-[var(--color-caption)]">{cat.count}</span>
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
                        className="flex justify-between items-center text-[var(--color-body)] hover:text-[var(--color-primary)]"
                      >
                        <span className={selectedBrands.includes(brand.slug) ? 'font-medium text-[var(--color-accent)]' : ''}>{brand.name}</span>
                        <span className="font-mono text-[11px] text-[var(--color-caption)]">{brand.count}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {(selectedBrands.length > 0 || selectedCategory) && (
                <Link href={filterUrl({ brands: undefined, category: undefined })} className="font-mono text-[12px] text-[var(--color-accent)] hover:underline">
                  Clear all filters
                </Link>
              )}
            </div>
          </aside>

          {/* ── Results ──────────────────────────────────────── */}
          <div>
            {products.length === 0 ? (
              <div className="py-16 border border-dashed border-[var(--color-border)] text-center">
                <p className="text-[var(--color-muted)]">{t('noResults')}</p>
                <p className="text-[var(--color-muted)] text-sm mt-1">{t('noResultsDescription')}</p>
              </div>
            ) : (
              <>
                {/* Sort row */}
                <div className="flex justify-between items-center mb-4 text-[13px] text-[var(--color-muted)]">
                  <span>{products.length} product{products.length !== 1 ? 's' : ''}</span>
                  <div className="flex items-center gap-2.5">
                    <span>Sort</span>
                    <span className="font-mono text-[12px] text-[var(--color-body)]">Best match</span>
                  </div>
                </div>

                {/* Top match — highlighted */}
                {topMatch && (
                  <div className="mb-6">
                    <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--color-muted)] mb-3">Top product match</div>
                    <Link
                      href={`/${locale}/p/${topMatch.sku}`}
                      className="grid grid-cols-[140px_1fr] gap-6 p-5 border border-[var(--color-border)] bg-[var(--color-elevated)] border-l-[3px] border-l-[var(--color-accent)] hover:border-[var(--color-body)] hover:border-l-[var(--color-accent)] transition-colors"
                    >
                      <div className="aspect-square bg-[var(--color-deep)] border border-[var(--color-border)] relative overflow-hidden">
                        {topMatch.images[0] ? (
                          <Image src={mediaUrl(topMatch.images[0]!.media.storagePath)} alt={topMatch.title} fill className="object-contain p-3" sizes="140px" />
                        ) : (
                          <div className="absolute inset-0 grid place-items-center font-mono text-[10px] text-[var(--color-muted)]">{topMatch.sku.slice(0, 8)}</div>
                        )}
                      </div>
                      <div>
                        <div className="font-mono text-[11px] text-[var(--color-muted)] tracking-[0.08em] mb-1">
                          {topMatch.sku} · {topMatch.brand?.name ?? ''}
                        </div>
                        <div className="text-[20px] font-semibold tracking-[-0.01em] mb-2 leading-[1.2]">{topMatch.title}</div>
                        {topMatch.descriptionShort && (
                          <p className="text-[13px] text-[var(--color-muted)] leading-[1.5] mb-3 line-clamp-2">{topMatch.descriptionShort}</p>
                        )}
                        <div className="flex gap-4 font-mono text-[11px] text-[var(--color-muted)]">
                          {topMatch.category && <span>● {topMatch.category.name}</span>}
                          {topMatch.brand && <span>● {topMatch.brand.name}</span>}
                        </div>
                      </div>
                    </Link>
                  </div>
                )}

                {/* Remaining products */}
                {restProducts.length > 0 && (
                  <div className="flex flex-col gap-3">
                    {restProducts.map((product) => {
                      const img = product.images[0]
                      return (
                        <Link
                          key={product.id}
                          href={`/${locale}/p/${product.sku}`}
                          className="grid grid-cols-[80px_1fr_auto] gap-5 p-3.5 border border-[var(--color-border)] bg-[var(--color-elevated)] hover:border-[var(--color-body)] transition-colors items-center"
                        >
                          <div className="aspect-square bg-[var(--color-deep)] border border-[var(--color-border)] relative overflow-hidden">
                            {img ? (
                              <Image src={mediaUrl(img.media.storagePath)} alt={product.title} fill className="object-contain p-2" sizes="80px" />
                            ) : (
                              <div className="absolute inset-0 grid place-items-center font-mono text-[9px] text-[var(--color-muted)]">IMG</div>
                            )}
                          </div>
                          <div>
                            <div className="font-mono text-[11px] text-[var(--color-muted)] mb-1">
                              {product.sku}{product.brand ? ` · ${product.brand.name}` : ''}
                            </div>
                            <div className="font-medium text-[14px] text-[var(--color-primary)]">{product.title}</div>
                            {product.descriptionShort && (
                              <p className="text-[13px] text-[var(--color-muted)] mt-0.5 leading-[1.5] line-clamp-1">{product.descriptionShort}</p>
                            )}
                          </div>
                          <div className="font-mono text-[12px] text-[var(--color-accent)] shrink-0">View →</div>
                        </Link>
                      )
                    })}
                  </div>
                )}

                {/* Datasheets section */}
                {relatedDocs.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
                    <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--color-muted)] mb-4">Datasheets &amp; PDFs</div>
                    <div className="flex flex-col gap-2">
                      {relatedDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="grid grid-cols-[36px_1fr_auto] gap-4 p-3.5 border border-[var(--color-border)] bg-[var(--color-elevated)] items-center"
                        >
                          <div className="w-8 h-9 bg-[var(--color-primary)] text-[var(--color-elevated)] grid place-items-center font-mono text-[9px] font-semibold">
                            {doc.kind.toUpperCase().slice(0, 4)}
                          </div>
                          <div>
                            <div className="font-medium text-[13px]">{doc.title}</div>
                            <div className="font-mono text-[11px] text-[var(--color-muted)]">
                              {doc.kind.toUpperCase()} · {doc.product.sku}
                            </div>
                          </div>
                          <a
                            href={mediaUrl(doc.media.storagePath)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 h-8 px-3 border border-[var(--color-border)] font-mono text-[11px] flex items-center text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors"
                          >
                            Download ↓
                          </a>
                        </div>
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
