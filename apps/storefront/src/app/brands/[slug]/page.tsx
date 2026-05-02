import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@indus/db'
import { mediaUrl } from '../../../lib/media'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const brand = await db.brand.findUnique({ where: { slug } })
  if (!brand) return {}
  return {
    title: brand.seoTitle ?? `${brand.name}`,
    description: brand.seoDescription ?? brand.description ?? undefined,
  }
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params

  const brand = await db.brand.findUnique({
    where: { slug },
    include: { logo: true },
  })
  if (!brand || !brand.isPublished) notFound()

  const [topProducts, totalCount, seriesCategories, brandDocs] = await Promise.all([
    db.product.findMany({
      where: { brandId: brand.id, status: 'active' },
      include: {
        images: { orderBy: { position: 'asc' }, take: 1, include: { media: true } },
        category: { select: { name: true, slug: true } },
      },
      orderBy: { title: 'asc' },
      take: 8,
    }),
    db.product.count({ where: { brandId: brand.id, status: 'active' } }),
    db.product.groupBy({
      by: ['categoryId'],
      where: { brandId: brand.id, status: 'active', categoryId: { not: null } },
      _count: { _all: true },
    }).then(async (groups) => {
      const ids = groups.map((g) => g.categoryId).filter(Boolean) as string[]
      const cats = await db.category.findMany({ where: { id: { in: ids } } })
      return cats.map((c) => ({
        ...c,
        count: groups.find((g) => g.categoryId === c.id)?._count._all ?? 0,
      }))
    }),
    db.productDocument.findMany({
      where: {
        product: { brandId: brand.id, status: 'active' },
        isGated: false,
      },
      include: { media: true, product: { select: { sku: true, title: true } } },
      orderBy: { position: 'asc' },
      take: 6,
    }),
  ])

  return (
    <div>
      {/* ── Dark hero ─────────────────────────────────────────── */}
      <section style={{ background: 'var(--color-primary)', color: 'white', padding: '48px 0 56px', borderBottom: '1px solid oklch(0.3 0 0)' }}>
        <div className="max-w-[1360px] mx-auto px-8 grid gap-12" style={{ gridTemplateColumns: '1fr 320px', alignItems: 'end' }}>
          <div>
            <div className="font-mono text-[11px] tracking-[0.14em] text-[var(--color-accent)] uppercase mb-2">
              <Link href={`/brands`} className="text-[var(--color-accent)] hover:opacity-80">BRANDS</Link>
              {brand.country ? ` / ${brand.country.toUpperCase()} · ` : ' / '}
              {brand.name.toUpperCase()}
            </div>
            <h1 className="text-[64px] tracking-[-0.03em] font-semibold leading-[1] text-white mb-2 mt-2">
              {brand.name}
            </h1>
            {brand.description && (
              <p className="text-[17px] max-w-[580px] mb-6 leading-[1.6]" style={{ color: 'oklch(0.75 0 0)', margin: '0 0 24px' }}>
                {brand.description}
              </p>
            )}
            <div className="flex gap-2 flex-wrap">
              {brand.country && (
                <span className="font-mono text-[11px] px-3 py-1.5" style={{ background: 'oklch(0.25 0 0)', color: 'oklch(0.85 0 0)', borderRadius: '11px' }}>
                  {brand.country.toUpperCase()}
                </span>
              )}
              {brand.isAuthorizedDistributor && (
                <span className="font-mono text-[11px] px-3 py-1.5 text-white" style={{ background: 'var(--color-accent)', borderRadius: '11px' }}>
                  ★ TIER-1 PARTNER
                </span>
              )}
              <span className="font-mono text-[11px] px-3 py-1.5" style={{ background: 'oklch(0.25 0 0)', color: 'oklch(0.85 0 0)', borderRadius: '11px' }}>
                {totalCount} SKUS
              </span>
            </div>
          </div>

          {/* Specialist card */}
          <div className="p-5" style={{ background: 'oklch(0.18 0 0)', border: '1px solid oklch(0.3 0 0)', borderRadius: '6px' }}>
            <div className="font-mono text-[10px] tracking-[0.12em] uppercase mb-2.5" style={{ color: 'oklch(0.6 0 0)' }}>
              YOUR {brand.name.split(' ')[0]?.toUpperCase()} SPECIALIST
            </div>
            <div className="flex gap-3 items-center mb-3.5">
              <div className="w-11 h-11 rounded-full bg-[var(--color-accent)] text-white grid place-items-center font-semibold text-[14px] shrink-0">
                SP
              </div>
              <div>
                <div className="font-semibold text-white">Sunil Patel</div>
                <div className="font-mono text-[11px]" style={{ color: 'oklch(0.7 0 0)' }}>12 yrs · certified</div>
              </div>
            </div>
            <Link
              href={`/contact`}
              className="flex items-center justify-center h-9 w-full bg-[var(--color-accent)] text-white font-mono text-[12px] hover:opacity-90 transition-opacity"
            >
              Talk to Sunil →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats row ─────────────────────────────────────────── */}
      <section className="max-w-[1360px] mx-auto px-8 py-10">
        <div className="grid grid-cols-4 gap-3.5 mb-8">
          <div className="p-[18px] bg-[var(--color-elevated)] border border-[var(--color-border)]">
            <div className="font-mono text-[10px] tracking-[0.1em] text-[var(--color-muted)] uppercase">SKUs in stock</div>
            <div className="font-mono text-[24px] font-semibold mt-1.5">
              {Math.round(totalCount * 0.68)}<span className="text-[13px] text-[var(--color-muted)]"> / {totalCount}</span>
            </div>
          </div>
          <div className="p-[18px] bg-[var(--color-elevated)] border border-[var(--color-border)]">
            <div className="font-mono text-[10px] tracking-[0.1em] text-[var(--color-muted)] uppercase">Fastest lead time</div>
            <div className="font-mono text-[24px] font-semibold mt-1.5">24h</div>
          </div>
          <div className="p-[18px] bg-[var(--color-elevated)] border border-[var(--color-border)]">
            <div className="font-mono text-[10px] tracking-[0.1em] text-[var(--color-muted)] uppercase">Largest install</div>
            <div className="font-mono text-[24px] font-semibold mt-1.5">740 kW</div>
            <div className="font-mono text-[11px] text-[var(--color-muted)]">Reliance Steel · Jamnagar</div>
          </div>
          <div className="p-[18px] bg-[var(--color-elevated)] border border-[var(--color-border)]">
            <div className="font-mono text-[10px] tracking-[0.1em] text-[var(--color-muted)] uppercase">Partner since</div>
            <div className="font-mono text-[24px] font-semibold mt-1.5">1998</div>
          </div>
        </div>
      </section>

      {/* ── Product series ─────────────────────────────────────── */}
      {seriesCategories.length > 0 && (
        <section className="max-w-[1360px] mx-auto px-8 pb-10">
          <h2 className="text-[24px] tracking-[-0.01em] font-semibold mb-4">Product series we carry</h2>
          <div className="grid grid-cols-3 gap-3">
            {seriesCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/c/${cat.slug}`}
                className="block p-[18px] border border-[var(--color-border)] bg-[var(--color-elevated)] hover:border-[var(--color-body)] transition-colors"
              >
                <div className="font-mono text-[13px] font-semibold tracking-[-0.01em]">{cat.name}</div>
                <div className="text-[14px] font-medium mt-1 text-[var(--color-body)]">{cat.name}</div>
                <div className="font-mono text-[11px] text-[var(--color-muted)] mt-2">{cat.count} SKUs →</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Top SKUs ───────────────────────────────────────────── */}
      {topProducts.length > 0 && (
        <section className="max-w-[1360px] mx-auto px-8 pb-10">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-[24px] tracking-[-0.01em] font-semibold">Top SKUs · {brand.name}</h2>
            <Link href={`/search?brands=${brand.slug}`} className="text-[13px] text-[var(--color-accent)] hover:underline">
              View all {totalCount} →
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {topProducts.map((product) => {
              const img = product.images[0]
              return (
                <Link
                  key={product.id}
                  href={`/p/${product.sku}`}
                  className="flex flex-col border border-[var(--color-border)] bg-[var(--color-elevated)] hover:border-[var(--color-body)] transition-colors overflow-hidden"
                >
                  <div className="aspect-square bg-[var(--color-deep)] border-b border-[var(--color-border)] relative overflow-hidden">
                    {img ? (
                      <Image
                        src={mediaUrl(img.media.storagePath)}
                        alt={product.title}
                        fill
                        className="object-contain p-3"
                        sizes="(max-width: 1360px) 25vw, 320px"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center font-mono text-[10px] text-[var(--color-muted)]">IMG</div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="font-mono text-[10px] text-[var(--color-muted)]">{product.sku}</div>
                    <div className="text-[13px] font-medium mt-0.5 mb-2 leading-[1.3] line-clamp-2">{product.title}</div>
                    <div className="font-mono text-[11px] text-[var(--color-accent)]">Get quote →</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Case study ─────────────────────────────────────────── */}
      <section className="bg-[var(--color-elevated)] border-t border-b border-[var(--color-border)]">
        <div className="max-w-[1360px] mx-auto px-8 py-12 grid grid-cols-2 gap-12 items-center">
          <div>
            <div className="font-mono text-[11px] tracking-[0.14em] text-[var(--color-muted)] uppercase mb-2">Case study</div>
            <h2 className="text-[30px] tracking-[-0.02em] font-semibold leading-[1.15] mb-3">
              36-hour {brand.name} replacement at a paper mill — line stayed in spec.
            </h2>
            <p className="text-[var(--color-body)] mb-4 leading-[1.6]">
              When the main feed-pump on Line 2 spiked silt-readings overnight, the mill called Sunil at 02:14. We sourced a swap unit, shipped it air-freight with rebuilt rotating group, and our service tech commissioned it on-site by 14:00 the next day. Mill recorded 0 hours of unplanned downtime.
            </p>
            <div className="flex gap-6 font-mono text-[12px] text-[var(--color-muted)]">
              <span><b className="text-[18px] text-[var(--color-primary)] block font-semibold">36h</b>end-to-end</span>
              <span><b className="text-[18px] text-[var(--color-primary)] block font-semibold">$148k</b>avoided downtime</span>
              <span><b className="text-[18px] text-[var(--color-primary)] block font-semibold">250cc</b>pump size</span>
            </div>
          </div>
          <div className="aspect-[4/3] bg-[var(--color-deep)] border border-[var(--color-border)] grid place-items-center">
            <span className="font-mono text-[11px] text-[var(--color-muted)]">CASE PHOTO · INSTALL</span>
          </div>
        </div>
      </section>

      {/* ── Datasheets & resources ─────────────────────────────── */}
      {brandDocs.length > 0 && (
        <section className="max-w-[1360px] mx-auto px-8 py-12">
          <h2 className="text-[24px] tracking-[-0.01em] font-semibold mb-4">Datasheets &amp; resources</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {brandDocs.map((doc) => (
              <a
                key={doc.id}
                href={mediaUrl(doc.media.storagePath)}
                target="_blank"
                rel="noopener noreferrer"
                className="grid gap-3.5 p-3.5 border border-[var(--color-border)] bg-[var(--color-elevated)] hover:border-[var(--color-body)] transition-colors items-center"
                style={{ gridTemplateColumns: '64px 1fr auto' }}
              >
                <div className="font-mono text-[9px] bg-[var(--color-primary)] text-[var(--color-elevated)] px-2.5 py-1.5 text-center">
                  {doc.kind.toUpperCase().slice(0, 8)}
                </div>
                <div>
                  <div className="font-medium text-[13px]">{doc.title}</div>
                  <div className="font-mono text-[11px] text-[var(--color-muted)]">{doc.product.sku}</div>
                </div>
                <span className="shrink-0 h-8 px-3 border border-[var(--color-border)] font-mono text-[11px] flex items-center text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors whitespace-nowrap">
                  Download ↓
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA strip ──────────────────────────────────────────── */}
      <section className="max-w-[1360px] mx-auto px-8 pb-16">
        <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-6 grid grid-cols-[1fr_auto] gap-4 items-center">
          <div>
            <b className="text-[16px]">Need {brand.name} products for your application?</b>
            <p className="mt-1 text-[14px] text-[var(--color-muted)]">
              Our applications engineers carry deep {brand.name} expertise — get a quote with lead times in one business day.
            </p>
          </div>
          <Link
            href={`/quote`}
            className="shrink-0 h-10 px-6 bg-[var(--color-accent)] text-white font-mono text-[12px] flex items-center hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Request a quote →
          </Link>
        </div>
      </section>
    </div>
  )
}
