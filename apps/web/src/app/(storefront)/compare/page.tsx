import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@indus/db'
import {
  MAX_COMPARE,
  buildCompareRows,
  validateCompareSet,
  type CompareProductInput,
  type CompareTemplate,
  type CompareValidationResult,
  type CurrencyCode,
} from '@indus/domain'
import { ProductPrice } from '@indus/ui'
import { mediaUrl } from '../../../lib/media'

type Props = {
  searchParams: Promise<{ skus?: string }>
}

export const metadata: Metadata = { title: 'Compare Products' }

const GRID_COLS = `220px repeat(${MAX_COMPARE}, minmax(0, 1fr))`

export default async function ComparePage({ searchParams }: Props) {
  const sp = await searchParams
  const skuList = (sp.skus ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_COMPARE)

  const products = skuList.length > 0
    ? await db.product.findMany({
        where: { sku: { in: skuList } },
        include: {
          brand: true,
          category: true,
          images: { orderBy: { position: 'asc' }, take: 1, include: { media: true } },
          specs: { orderBy: [{ position: 'asc' }] },
          specTemplate: {
            include: { fields: { orderBy: [{ group: 'asc' }, { position: 'asc' }] } },
          },
        },
      })
    : []

  const sortedProducts = skuList
    .map((sku) => products.find((p) => p.sku === sku))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))

  const validationInput: CompareProductInput[] = sortedProducts.map((p) => ({
    id: p.id,
    sku: p.sku,
    title: p.title,
    categoryId: p.categoryId,
    specTemplateId: p.specTemplateId,
    specs: p.specs.map((s) => ({
      templateFieldId: s.templateFieldId,
      value: s.value,
      unit: s.unit,
    })),
  }))

  const validation = validateCompareSet(validationInput)

  // Pick the template for row rendering. If validation passes, all products
  // share one — use the first product's. If it fails, sections stay hidden.
  const renderTemplate: CompareTemplate | null =
    validation.ok && sortedProducts[0]?.specTemplate
      ? {
          id: sortedProducts[0].specTemplate.id,
          name: sortedProducts[0].specTemplate.name,
          fields: sortedProducts[0].specTemplate.fields.map((f) => ({
            id: f.id,
            key: f.key,
            label: f.label,
            unit: f.unit,
            group: f.group,
            position: f.position,
          })),
        }
      : null

  const sections = renderTemplate ? buildCompareRows(validationInput, renderTemplate) : []

  const emptySlots = MAX_COMPARE - sortedProducts.length

  function removeUrl(sku: string): string {
    const remaining = skuList.filter((s) => s !== sku)
    return remaining.length > 0 ? `/compare?skus=${remaining.join(',')}` : `/compare`
  }

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-6 pb-20">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-3.5 font-mono text-[12px] text-[var(--color-muted)] mb-3.5">
        <Link href={`/`} className="hover:text-[var(--color-primary)]">Home</Link>
        <span className="opacity-40">/</span>
        <span className="text-[var(--color-primary)]">
          Compare · {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''}
        </span>
      </nav>

      {/* Title bar */}
      <header className="flex justify-between items-end gap-6 pb-5 border-b border-[var(--color-border)] mb-0">
        <div>
          <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--color-muted)] mb-1.5">
            SIDE-BY-SIDE
          </div>
          <h1 className="text-[36px] font-semibold tracking-[-0.02em] mb-1">
            {validation.ok && sortedProducts[0]?.category?.name
              ? sortedProducts[0].category.name
              : 'Compare Products'}
          </h1>
          {sortedProducts.length > 0 && (
            <p className="text-[14px] text-[var(--color-muted)] max-w-[680px] leading-[1.5]">
              Comparing {sortedProducts.length} of up to {MAX_COMPARE} products. Specs are aligned row-for-row using the shared spec template.{' '}
              {validation.ok && (
                <b className="text-[var(--color-primary)]">All matched products can be enquired in a single RFQ.</b>
              )}
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
        <EmptyState />
      ) : (
        <div>
          {!validation.ok && <ValidationBanner validation={validation} sortedProducts={sortedProducts} removeUrl={removeUrl} />}

          {/* Filter controls row (decorative — TODO wire up) */}
          <div className="flex justify-between items-center py-[18px] text-[12px]">
            <div className="flex gap-1.5">
              <button className="h-7 px-3 bg-[var(--color-primary)] text-[var(--color-elevated)] font-mono text-[11px]">All specs</button>
              <button className="h-7 px-3 border border-[var(--color-border)] font-mono text-[11px] text-[var(--color-muted)] hover:bg-[var(--color-deep)] transition-colors">Differences only</button>
              <button className="h-7 px-3 border border-[var(--color-border)] font-mono text-[11px] text-[var(--color-muted)] hover:bg-[var(--color-deep)] transition-colors">Datasheet specs</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {/* Column headers */}
            <div
              className="grid border-t border-b border-[var(--color-border)]"
              style={{ gridTemplateColumns: GRID_COLS }}
            >
              <div className="p-5 flex items-end font-mono text-[11px] text-[var(--color-muted)] uppercase tracking-[0.06em]">
                {sortedProducts.length} products · compare up to {MAX_COMPARE}
              </div>
              {sortedProducts.map((product) => {
                const img = product.images[0]
                const stockState = product.stockQty > 5 ? 'in' : product.stockQty > 0 ? 'low' : 'out'
                const stockColor = stockState === 'in' ? 'oklch(0.6 0.16 150)' : stockState === 'low' ? 'oklch(0.65 0.16 60)' : 'oklch(0.6 0.16 30)'
                const stockLabel = stockState === 'in'
                  ? `In stock${product.stockWarehouse ? ` · ${product.stockWarehouse}` : ''}`
                  : stockState === 'low'
                    ? `Low · ${product.stockQty} units${product.stockWarehouse ? ` · ${product.stockWarehouse}` : ''}`
                    : 'Lead time only'
                return (
                  <div key={product.id} className="border-l border-[var(--color-border)] bg-[var(--color-elevated)] p-5 relative">
                    <Link
                      href={removeUrl(product.sku)}
                      aria-label={`Remove ${product.sku}`}
                      className="absolute top-2.5 right-2.5 w-[22px] h-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] grid place-items-center font-mono text-[14px] text-[var(--color-muted)] hover:text-[var(--color-danger)] transition-colors"
                    >
                      ×
                    </Link>
                    <div className="aspect-[4/3] bg-[var(--color-deep)] border border-[var(--color-border)] mb-3.5 relative overflow-hidden">
                      {img ? (
                        <Image src={mediaUrl(img.media.storagePath)} alt={product.title} fill className="object-contain p-4" sizes="25vw" />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center font-mono text-[11px] text-[var(--color-muted)]">{product.sku}</div>
                      )}
                    </div>
                    {product.brand && (
                      <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--color-muted)] mb-1">{product.brand.name}</div>
                    )}
                    <h3 className="text-[15px] font-semibold leading-snug mb-1.5 tracking-[-0.01em]">{product.title}</h3>
                    <div className="font-mono text-[11px] text-[var(--color-muted)] mb-2">{product.sku}</div>
                    <div className="mb-1.5">
                      <ProductPrice
                        listPrice={product.listPrice == null ? null : Number(product.listPrice)}
                        currency={product.listPriceCurrency as CurrencyCode}
                        compareAtPrice={product.compareAtPrice == null ? null : Number(product.compareAtPrice)}
                        layout="inline"
                        size="lg"
                        quoteCta="Quote on request"
                      />
                    </div>
                    <div className="text-[11px] flex items-center gap-1.5 text-[var(--color-muted)] mb-3.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: stockColor }} aria-hidden="true" />
                      {stockLabel}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Link href={`/quote`} className="h-8 flex items-center justify-center bg-[var(--color-accent)] text-white text-[12px] font-medium hover:opacity-90 transition-opacity">
                        Request quote
                      </Link>
                      <Link href={`/p/${product.slug}`} className="h-8 flex items-center justify-center border border-[var(--color-border)] text-[12px] text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors">
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
                  <Link href={`/c`} className="text-center text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors">
                    <div className="text-[24px] font-light mb-1.5 opacity-50">+</div>
                    <div className="text-[12px]">Add a {ordinal(sortedProducts.length + i + 1)} product</div>
                    <div className="font-mono text-[10px] mt-0.5 opacity-60">Compare up to {MAX_COMPARE} SKUs</div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Spec sections — only when validation passes */}
            {validation.ok && sections.map((section) => (
              <div key={section.group}>
                <div
                  className="grid bg-[var(--color-primary)] text-[var(--color-elevated)] font-mono text-[11px] tracking-[0.14em] uppercase"
                  style={{ gridTemplateColumns: GRID_COLS }}
                >
                  <div className="px-4 py-2.5">{section.group}</div>
                  {Array.from({ length: MAX_COMPARE }).map((_, i) => <div key={i} />)}
                </div>
                {section.rows.map((row) => (
                  <div
                    key={row.fieldId}
                    className="grid border-b border-[var(--color-border)]"
                    style={{ gridTemplateColumns: GRID_COLS }}
                  >
                    <div className="px-[18px] py-3.5 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--color-muted)] bg-[var(--color-surface)]">
                      {row.label}
                    </div>
                    {row.cells.map((cell, i) => (
                      <div
                        key={`${row.fieldId}-${i}`}
                        className="px-[18px] py-3.5 border-l border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] leading-[1.5]"
                      >
                        {cell.display
                          ? <span className="font-mono">{cell.display}</span>
                          : <span className="text-[var(--color-muted)]">—</span>}
                      </div>
                    ))}
                    {Array.from({ length: emptySlots }).map((_, i) => (
                      <div key={`empty-${i}`} className="px-[18px] py-3.5 border-l border-[var(--color-border)] text-[var(--color-muted)] font-mono text-[13px]">
                        —
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}

            {/* Engineer's take */}
            {validation.ok && sections.length > 0 && (
              <div>
                <div
                  className="grid bg-[var(--color-primary)] text-[var(--color-elevated)] font-mono text-[11px] tracking-[0.14em] uppercase"
                  style={{ gridTemplateColumns: GRID_COLS }}
                >
                  <div className="px-4 py-2.5">Engineer&apos;s take</div>
                  {Array.from({ length: MAX_COMPARE }).map((_, i) => <div key={i} />)}
                </div>
                <div
                  className="grid border-b border-[var(--color-border)]"
                  style={{ gridTemplateColumns: GRID_COLS }}
                >
                  <div className="px-[18px] py-3.5 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--color-muted)] bg-[var(--color-surface)]">
                    Best for
                  </div>
                  {sortedProducts.map((product) => (
                    <div key={product.id} className="px-[18px] py-3.5 border-l border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] leading-[1.5]">
                      Contact our engineers for a specific application recommendation for{' '}
                      <span className="font-mono text-[11px] text-[var(--color-muted)]">{product.sku}</span>
                    </div>
                  ))}
                  {Array.from({ length: emptySlots }).map((_, i) => (
                    <div key={`empty-${i}`} className="px-[18px] py-3.5 border-l border-[var(--color-border)] text-[var(--color-muted)] font-mono text-[13px]">—</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dark CTA strip — only when valid */}
          {validation.ok && (
            <div
              className="grid gap-6 mt-8 px-6 py-5 items-center"
              style={{ background: 'var(--color-primary)', color: 'white', gridTemplateColumns: '1fr auto' }}
            >
              <div>
                <div className="font-mono text-[11px] tracking-[0.14em] text-[var(--color-accent)] uppercase mb-1.5">
                  NOT SURE WHICH ONE?
                </div>
                <div className="text-[18px] tracking-[-0.01em]">
                  Send all {sortedProducts.length} to an Indus engineer · we&apos;ll spec the right one for your application within 1 hour
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
          )}
        </div>
      )}
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="py-20 text-center border-t border-[var(--color-border)]">
      <p className="text-[24px] font-semibold mb-3">No products to compare</p>
      <p className="text-[var(--color-muted)] text-sm mb-6">
        Browse the catalogue and add up to {MAX_COMPARE} products from the same category to compare them side by side.
      </p>
      <Link href={`/c`} className="inline-flex h-10 px-6 items-center bg-[var(--color-accent)] text-white text-sm font-medium hover:opacity-90">
        Browse Products
      </Link>
    </div>
  )
}

type ValidationBannerProps = {
  validation: Exclude<CompareValidationResult, { ok: true }>
  sortedProducts: Array<{ sku: string; title: string; category: { name: string } | null }>
  removeUrl: (sku: string) => string
}

function ValidationBanner({ validation, sortedProducts, removeUrl }: ValidationBannerProps) {
  let title = 'These products can’t be compared'
  let body: React.ReactNode = null

  if (validation.reason === 'missing_template') {
    title = 'Some products have no spec template assigned'
    body = (
      <p className="text-[13px] leading-[1.55] text-[var(--color-body)]">
        The compare table aligns rows by spec template. These products have no template yet, so we can&apos;t align them:{' '}
        <span className="font-mono">{validation.offendingSkus.join(', ')}</span>. Remove them, or ask the team to assign a template.
      </p>
    )
  } else if (validation.reason === 'mixed_category') {
    body = (
      <div className="text-[13px] leading-[1.55] text-[var(--color-body)] space-y-2">
        <p>Compare only works across products in the <b>same category</b>. The current selection spans:</p>
        <ul className="space-y-1">
          {validation.categoryIds.map((g, idx) => {
            const sample = sortedProducts.find((p) => g.skus.includes(p.sku))
            const catName = sample?.category?.name ?? 'Uncategorised'
            return (
              <li key={`${g.categoryId ?? 'null'}-${idx}`} className="font-mono text-[12px]">
                <b>{catName}</b> — {g.skus.join(', ')}
                {' · '}
                {g.skus.map((sku) => (
                  <Link
                    key={sku}
                    href={removeUrl(sku)}
                    className="text-[var(--color-accent)] hover:underline mr-2"
                  >
                    remove {sku}
                  </Link>
                ))}
              </li>
            )
          })}
        </ul>
      </div>
    )
  } else if (validation.reason === 'mixed_template') {
    body = (
      <p className="text-[13px] leading-[1.55] text-[var(--color-body)]">
        These products are in the same category but use different spec templates, so the rows can&apos;t be aligned 1:1. Remove products until only one template remains.
      </p>
    )
  } else if (validation.reason === 'too_many') {
    title = `Compare supports up to ${validation.max} products`
    body = (
      <p className="text-[13px] leading-[1.55] text-[var(--color-body)]">
        You have {validation.count} products selected. Remove at least {validation.count - validation.max} to continue.
      </p>
    )
  }

  return (
    <div className="mt-4 border-l-2 border-[var(--color-accent)] bg-[var(--color-elevated)] p-4">
      <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--color-accent)] mb-2">{title}</p>
      {body}
    </div>
  )
}

// ── Format helpers ─────────────────────────────────────────────────────────

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`
}

