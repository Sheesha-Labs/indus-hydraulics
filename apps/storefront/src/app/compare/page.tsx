import { mediaUrl } from '../../lib/media'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@indus/db'

type Props = {
  searchParams: Promise<{ skus?: string }>
}

export const metadata: Metadata = { title: 'Compare Products' }

export default async function ComparePage({ searchParams }: Props) {
  const sp = await searchParams

  const skuList = (sp.skus ?? '').split(',').filter(Boolean).slice(0, 4)

  const products = skuList.length > 0
    ? await db.product.findMany({
        where: { sku: { in: skuList } },
        include: {
          brand: true,
          category: true,
          images: { orderBy: { position: 'asc' }, take: 1, include: { media: true } },
          specs: { orderBy: [{ group: 'asc' }, { position: 'asc' }] },
        },
      })
    : []

  const sortedProducts = skuList.map((sku) => products.find((p) => p.sku === sku)).filter(Boolean)

  const allSpecKeys = new Map<string, Set<string>>()
  for (const product of sortedProducts) {
    for (const spec of product!.specs) {
      const g = spec.group ?? 'General'
      if (!allSpecKeys.has(g)) allSpecKeys.set(g, new Set())
      allSpecKeys.get(g)!.add(spec.label)
    }
  }

  const MAX = 4
  const emptySlots = MAX - sortedProducts.length

  function removeUrl(sku: string) {
    const remaining = skuList.filter((s) => s !== sku)
    return remaining.length > 0 ? `/compare?skus=${remaining.join(',')}` : `/compare`
  }

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-6 pb-20">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-3.5 font-mono text-[12px] text-[var(--color-muted)] mb-3.5">
        <Link href={`/`} className="hover:text-[var(--color-primary)]">Home</Link>
        <span className="opacity-40">/</span>
        <span className="text-[var(--color-primary)]">Compare · {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''}</span>
      </nav>

      {/* Title bar */}
      <header className="flex justify-between items-end gap-6 pb-5 border-b border-[var(--color-border)] mb-0">
        <div>
          <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--color-muted)] mb-1.5">SIDE-BY-SIDE</div>
          <h1 className="text-[36px] font-semibold tracking-[-0.02em] mb-1">
            {sortedProducts.length > 0
              ? (sortedProducts[0]?.category?.name ?? 'Products')
              : 'Compare Products'}
          </h1>
          {sortedProducts.length > 0 && (
            <p className="text-[14px] text-[var(--color-muted)] max-w-[680px] leading-[1.5]">
              Comparing {sortedProducts.length} of up to {MAX} products. Specs are aligned row-for-row.{' '}
              <b className="text-[var(--color-primary)]">All matched products can be enquired in a single RFQ.</b>
            </p>
          )}
        </div>
        {sortedProducts.length > 0 && (
          <div className="flex gap-2 shrink-0">
            <button className="h-9 px-4 border border-[var(--color-border)] font-mono text-[11px] text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors whitespace-nowrap">
              Download spec PDF
            </button>
            <button className="h-9 px-4 border border-[var(--color-border)] font-mono text-[11px] text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors whitespace-nowrap">
              Email to engineer
            </button>
          </div>
        )}
      </header>

      {sortedProducts.length === 0 ? (
        <div className="py-20 text-center border-t border-[var(--color-border)]">
          <p className="text-[24px] font-semibold mb-3">No products to compare</p>
          <p className="text-[var(--color-muted)] text-sm mb-6">Add products from the catalogue to compare them side by side.</p>
          <Link href={`/c`} className="inline-flex h-10 px-6 items-center bg-[var(--color-accent)] text-white text-sm font-medium hover:opacity-90">
            Browse Products
          </Link>
        </div>
      ) : (
        <div>
          {/* Filter controls row */}
          <div className="flex justify-between items-center py-[18px] text-[12px]">
            <div className="flex gap-1.5">
              <button className="h-7 px-3 bg-[var(--color-primary)] text-[var(--color-elevated)] font-mono text-[11px]">All specs</button>
              <button className="h-7 px-3 border border-[var(--color-border)] font-mono text-[11px] text-[var(--color-muted)] hover:bg-[var(--color-deep)] transition-colors">Differences only</button>
              <button className="h-7 px-3 border border-[var(--color-border)] font-mono text-[11px] text-[var(--color-muted)] hover:bg-[var(--color-deep)] transition-colors">Datasheet specs</button>
            </div>
            <div className="flex gap-[18px] text-[var(--color-muted)] font-mono tracking-[0.04em] text-[11px]">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-[var(--color-accent)]" />
                SHOW BEST-IN-ROW
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-[var(--color-accent)]" />
                HIGHLIGHT DIFFERENCES
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            {/* Column headers */}
            <div
              className="grid border-t border-b border-[var(--color-border)]"
              style={{ gridTemplateColumns: `220px repeat(${MAX}, 1fr)` }}
            >
              <div className="p-5 flex items-end font-mono text-[11px] text-[var(--color-muted)] uppercase tracking-[0.06em]">
                {sortedProducts.length} products · compare up to {MAX}
              </div>
              {sortedProducts.map((product) => {
                const img = product!.images[0]
                return (
                  <div key={product!.id} className="border-l border-[var(--color-border)] bg-[var(--color-elevated)] p-5 relative">
                    <Link
                      href={removeUrl(product!.sku)}
                      aria-label={`Remove ${product!.sku}`}
                      className="absolute top-2.5 right-2.5 w-[22px] h-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] grid place-items-center font-mono text-[14px] text-[var(--color-muted)] hover:text-[var(--color-danger)] transition-colors"
                    >
                      ×
                    </Link>
                    <div className="aspect-[4/3] bg-[var(--color-deep)] border border-[var(--color-border)] mb-3.5 relative overflow-hidden">
                      {img ? (
                        <Image src={mediaUrl(img.media.storagePath)} alt={product!.title} fill className="object-contain p-4" sizes="25vw" />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center font-mono text-[11px] text-[var(--color-muted)]">{product!.sku}</div>
                      )}
                    </div>
                    {product!.brand && (
                      <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--color-muted)] mb-1">{product!.brand.name}</div>
                    )}
                    <h3 className="text-[15px] font-semibold leading-snug mb-1.5 tracking-[-0.01em]">{product!.title}</h3>
                    <div className="font-mono text-[11px] text-[var(--color-muted)] mb-3.5">{product!.sku}</div>
                    <div className="flex flex-col gap-1.5">
                      <Link href={`/quote`} className="h-8 flex items-center justify-center bg-[var(--color-accent)] text-white text-[12px] font-medium hover:opacity-90 transition-opacity">
                        Request quote
                      </Link>
                      <Link href={`/p/${product!.sku}`} className="h-8 flex items-center justify-center border border-[var(--color-border)] text-[12px] text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors">
                        View details →
                      </Link>
                    </div>
                  </div>
                )
              })}
              {/* Empty slots */}
              {Array.from({ length: emptySlots }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="border-l border-[var(--color-border)] flex items-center justify-center p-5"
                  style={{ background: 'repeating-linear-gradient(135deg,var(--color-surface) 0 8px,var(--color-deep) 8px 16px)' }}
                >
                  <div className="text-center text-[var(--color-muted)]">
                    <div className="text-[24px] font-light mb-1.5 opacity-50">+</div>
                    <div className="text-[12px]">Add a 4th product</div>
                    <div className="font-mono text-[10px] mt-0.5 opacity-60">Compare up to 4 SKUs</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Spec sections */}
            {Array.from(allSpecKeys.entries()).map(([group, labels]) => (
              <div key={group}>
                {/* Section bar */}
                <div
                  className="grid bg-[var(--color-primary)] text-[var(--color-elevated)] font-mono text-[11px] tracking-[0.14em] uppercase"
                  style={{ gridTemplateColumns: `220px repeat(${MAX}, 1fr)` }}
                >
                  <div className="px-4 py-2.5">{group}</div>
                  {Array.from({ length: MAX }).map((_, i) => <div key={i} />)}
                </div>
                {Array.from(labels).map((label) => (
                  <div
                    key={label}
                    className="grid border-b border-[var(--color-border)]"
                    style={{ gridTemplateColumns: `220px repeat(${MAX}, 1fr)` }}
                  >
                    <div className="px-[18px] py-3.5 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--color-muted)] bg-[var(--color-surface)]">
                      {label}
                    </div>
                    {sortedProducts.map((product) => {
                      const spec = product!.specs.find((s) => s.label === label && (s.group ?? 'General') === group)
                      return (
                        <div
                          key={product!.id}
                          className="px-[18px] py-3.5 border-l border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] leading-[1.5]"
                        >
                          {spec
                            ? <span className="font-mono">{spec.value}{spec.unit ? ` ${spec.unit}` : ''}</span>
                            : <span className="text-[var(--color-muted)]">—</span>}
                        </div>
                      )
                    })}
                    {Array.from({ length: emptySlots }).map((_, i) => (
                      <div key={`empty-${i}`} className="px-[18px] py-3.5 border-l border-[var(--color-border)] text-[var(--color-muted)] font-mono text-[13px]">
                        —
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}

            {/* Engineer's take section (when specs exist) */}
            {allSpecKeys.size > 0 && (
              <div>
                <div
                  className="grid bg-[var(--color-primary)] text-[var(--color-elevated)] font-mono text-[11px] tracking-[0.14em] uppercase"
                  style={{ gridTemplateColumns: `220px repeat(${MAX}, 1fr)` }}
                >
                  <div className="px-4 py-2.5">Engineer's take</div>
                  {Array.from({ length: MAX }).map((_, i) => <div key={i} />)}
                </div>
                <div
                  className="grid border-b border-[var(--color-border)]"
                  style={{ gridTemplateColumns: `220px repeat(${MAX}, 1fr)` }}
                >
                  <div className="px-[18px] py-3.5 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--color-muted)] bg-[var(--color-surface)]">
                    Best for
                  </div>
                  {sortedProducts.map((product) => (
                    <div key={product!.id} className="px-[18px] py-3.5 border-l border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] leading-[1.5]">
                      Contact our engineers for a specific application recommendation for{' '}
                      <span className="font-mono text-[11px] text-[var(--color-muted)]">{product!.sku}</span>
                    </div>
                  ))}
                  {Array.from({ length: emptySlots }).map((_, i) => (
                    <div key={`empty-${i}`} className="px-[18px] py-3.5 border-l border-[var(--color-border)] text-[var(--color-muted)] font-mono text-[13px]">—</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dark CTA strip */}
          <div
            className="grid gap-6 mt-8 px-6 py-5 items-center"
            style={{ background: 'var(--color-primary)', color: 'white', gridTemplateColumns: '1fr auto' }}
          >
            <div>
              <div className="font-mono text-[11px] tracking-[0.14em] text-[var(--color-accent)] uppercase mb-1.5">NOT SURE WHICH ONE?</div>
              <div className="text-[18px] tracking-[-0.01em]">
                Send all {sortedProducts.length} to an Indus engineer · we'll spec the right one for your application within 1 hour
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link
                href={`/quote`}
                className="h-9 px-4 flex items-center bg-[var(--color-accent)] text-white font-mono text-[12px] hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                RFQ all {sortedProducts.length} →
              </Link>
              <Link
                href={`/contact`}
                className="h-9 px-4 flex items-center border font-mono text-[12px] text-white hover:bg-[oklch(1_0_0_/_0.05)] transition-colors whitespace-nowrap"
                style={{ borderColor: 'oklch(0.4 0 0)' }}
              >
                Talk to engineer
              </Link>
            </div>
          </div>

          {/* Related comparisons */}
          <div className="mt-12">
            <div className="font-mono text-[10px] tracking-[0.14em] text-[var(--color-muted)] uppercase mb-3.5">Related comparisons</div>
            <div className="grid grid-cols-3 gap-3.5">
              {[
                { title: 'Fixed displacement pumps · 71cc', desc: '3 brands · Bosch, Parker, Yuken' },
                { title: 'CETOP-3 directional valves', desc: '4 brands · solenoid & pilot' },
                { title: '10L bladder accumulators', desc: '3 brands · Hydac, Parker, EPE' },
              ].map((rel) => (
                <Link
                  key={rel.title}
                  href={`/compare`}
                  className="border border-[var(--color-border)] p-[18px] bg-[var(--color-elevated)] hover:border-[var(--color-body)] transition-colors"
                >
                  <div className="text-[14px] font-medium">{rel.title}</div>
                  <div className="text-[12px] text-[var(--color-muted)] mt-1">{rel.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
