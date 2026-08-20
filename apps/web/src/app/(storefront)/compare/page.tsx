import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@indus/db'
import {
  MAX_COMPARE,
  buildCompareRows,
  validateCompareSet,
  type CompareProductInput,
  type CompareRow,
  type CompareTemplate,
  type CompareValidationResult,
} from '@indus/domain'
import { mediaUrl } from '../../../lib/media'

type Props = {
  searchParams: Promise<{ skus?: string; diff?: string }>
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

  const diffOnly = sp.diff === '1'

  /*
    The point of a spec matrix is the DIFFERENCES. 02-screen-index.md §01:
    "Rows where values differ get emphasis; identical rows recede."

    Computed over the POPULATED cells only — a missing value is not a
    difference, it is a gap in the data, and counting it as one would light up
    half the table on a thin catalogue.
  */
  function rowDiffers(row: CompareRow): boolean {
    const populated = row.cells.map((c) => c.display).filter(Boolean)
    return new Set(populated).size > 1
  }

  // "Differences only" hides the identical rows outright; a section with
  // nothing left drops its heading too rather than leaving a band over empty
  // space.
  const visibleSections = diffOnly
    ? sections
        .map((section) => ({ ...section, rows: section.rows.filter(rowDiffers) }))
        .filter((section) => section.rows.length > 0)
    : sections

  function withView(base: string): string {
    if (!diffOnly) return base
    return base.includes('?') ? `${base}&diff=1` : `${base}?diff=1`
  }

  function removeUrl(sku: string): string {
    const remaining = skuList.filter((s) => s !== sku)
    return withView(remaining.length > 0 ? `/compare?skus=${remaining.join(',')}` : `/compare`)
  }

  function viewUrl(wantDiff: boolean): string {
    const base = skuList.length > 0 ? `/compare?skus=${skuList.join(',')}` : '/compare'
    if (!wantDiff) return base
    return base.includes('?') ? `${base}&diff=1` : `${base}?diff=1`
  }

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-6 pb-28 sm:px-8 xl:px-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-3.5 font-mono text-[12px] text-ih-muted mb-3.5">
        <Link href={`/`} className="hover:text-ih-ink">Home</Link>
        <span className="opacity-40">/</span>
        <span className="text-ih-ink">
          Compare · {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''}
        </span>
      </nav>

      {/* Title bar */}
      <header className="mb-0 flex flex-col justify-between gap-6 border-b border-ih-border pb-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
            SIDE-BY-SIDE
          </div>
          <h1 className="mb-1 font-serif text-[clamp(28px,4vw,36px)] font-normal tracking-[-0.01em]">
            {validation.ok && sortedProducts[0]?.category?.name
              ? sortedProducts[0].category.name
              : 'Compare Products'}
          </h1>
          {sortedProducts.length > 0 && (
            <p className="text-[14px] text-ih-muted max-w-[680px] leading-[1.5]">
              Comparing {sortedProducts.length} of up to {MAX_COMPARE} products. Specs are aligned row-for-row using the shared spec template.{' '}
              {validation.ok && (
                <b className="text-ih-ink">All matched products can be enquired in a single RFQ.</b>
              )}
            </p>
          )}
        </div>
        {sortedProducts.length > 0 && (
          <div className="flex shrink-0 flex-wrap gap-2">
            <button className="h-10 whitespace-nowrap rounded-md border border-ih-border-strong px-4 text-[13.5px] text-ih-ink transition-colors hover:border-ih-accent hover:bg-ih-surface-2 hover:text-ih-accent">
              Download spec PDF
            </button>
            <button className="h-10 whitespace-nowrap rounded-md border border-ih-border-strong px-4 text-[13.5px] text-ih-ink transition-colors hover:border-ih-accent hover:bg-ih-surface-2 hover:text-ih-accent">
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

          {/*
            These were three <button>s wired to nothing, styled exactly like
            working controls — one of them even painted as the active state.
            A control that looks operable and is not is worse than no control:
            the reader concludes the page is broken, not that the feature is
            unbuilt.

            "All specs" / "Differences only" now toggle for real, as links
            carrying a URL parameter so the page stays a server component and
            the view survives a refresh or a shared link. "Datasheet specs"
            was removed — no behaviour for it is defined anywhere in the
            handoff, so there was nothing to wire it to.
          */}
          <div className="flex justify-between items-center py-[18px] text-[12px]">
            <div className="flex gap-1.5" role="group" aria-label="Spec rows shown">
              <Link
                href={viewUrl(false)}
                aria-current={diffOnly ? undefined : 'true'}
                className={
                  diffOnly
                    ? 'h-8 grid place-items-center rounded-sm border border-ih-border px-3 text-[12.5px] text-ih-ink-2 transition-colors hover:border-ih-accent hover:text-ih-accent'
                    : 'h-8 grid place-items-center rounded-sm bg-ih-accent px-3 text-[12.5px] font-medium text-white'
                }
              >
                All specs
              </Link>
              <Link
                href={viewUrl(true)}
                aria-current={diffOnly ? 'true' : undefined}
                className={
                  diffOnly
                    ? 'h-8 grid place-items-center rounded-sm bg-ih-accent px-3 text-[12.5px] font-medium text-white'
                    : 'h-8 grid place-items-center rounded-sm border border-ih-border px-3 text-[12.5px] text-ih-ink-2 transition-colors hover:border-ih-accent hover:text-ih-accent'
                }
              >
                Differences only
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto" role="table" aria-label="Specification comparison">
            {/* Column headers */}
            <div
              role="row"
              className="grid border-t border-b border-ih-border"
              style={{ gridTemplateColumns: GRID_COLS }}
            >
              <div role="columnheader" className="p-5 flex items-end font-mono text-[11px] text-ih-muted uppercase tracking-[0.06em]">
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
                  <div role="columnheader" key={product.id} className="border-l border-ih-border bg-ih-surface p-5 relative">
                    <div className="aspect-[4/3] bg-ih-surface-2 border border-ih-border mb-3.5 relative overflow-hidden">
                      {img ? (
                        <Image src={mediaUrl(img.media.storagePath)} alt={product.title} fill className="object-contain p-4" sizes="25vw" />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center font-mono text-[11px] text-ih-muted">{product.sku}</div>
                      )}
                      {/* The dismiss lives inside the image frame and above it. It
                          used to sit on the card corner with no z-index, so the
                          frame — a later sibling with `position: relative` — painted
                          over its lower half and swallowed those clicks. The
                          pseudo-element widens the tap target to ~42px without
                          growing the 26px chip. */}
                      <Link
                        href={removeUrl(product.sku)}
                        aria-label={`Remove ${product.sku}`}
                        title={`Remove ${product.sku}`}
                        className="absolute top-1.5 right-1.5 z-10 grid h-[26px] w-[26px] place-items-center rounded-sm border border-ih-border bg-ih-bg font-mono text-[14px] leading-none text-ih-muted transition-colors before:absolute before:-inset-2 before:content-[''] hover:border-ih-danger hover:bg-ih-danger-soft hover:text-ih-danger"
                      >
                        ×
                      </Link>
                    </div>
                    {product.brand && (
                      <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-ih-muted mb-1">{product.brand.name}</div>
                    )}
                    <h3 className="mb-1.5 text-[15px] font-medium leading-snug tracking-[-0.01em]">{product.title}</h3>
                    <div className="font-mono text-[11px] text-ih-muted mb-2">{product.sku}</div>
                    <div className="text-[11px] flex items-center gap-1.5 text-ih-muted mb-3.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: stockColor }} aria-hidden="true" />
                      {stockLabel}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Link href={`/quote`} className="flex h-9 items-center justify-center rounded-sm bg-ih-accent text-[12.5px] font-medium text-ih-accent-fg transition-colors hover:bg-ih-accent-hover">
                        Request quote
                      </Link>
                      <Link href={`/p/${product.slug}`} className="flex h-9 items-center justify-center rounded-sm border border-ih-border-strong text-[12.5px] text-ih-ink transition-colors hover:border-ih-accent hover:text-ih-accent">
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
                  role="columnheader"
                  className="flex items-center justify-center border-l border-dashed border-ih-border-strong p-5"
                >
                  <Link href={`/c`} className="text-center text-ih-muted hover:text-ih-ink transition-colors">
                    <div className="text-[24px] font-light mb-1.5 opacity-50">+</div>
                    <div className="text-[12px]">Add a {ordinal(sortedProducts.length + i + 1)} product</div>
                    <div className="font-mono text-[10px] mt-0.5 opacity-60">Compare up to {MAX_COMPARE} SKUs</div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Spec sections — only when validation passes */}
            {validation.ok && visibleSections.map((section) => (
              <div role="rowgroup" key={section.group}>
                <div
                  role="row"
                  className="grid bg-ih-navy font-mono text-[10.5px] uppercase tracking-[0.12em] text-white"
                  style={{ gridTemplateColumns: GRID_COLS }}
                >
                  <div role="columnheader" className="px-4 py-2.5">{section.group}</div>
                  {/* Spacers keep the cell count consistent across rows. */}
                  {Array.from({ length: MAX_COMPARE }).map((_, i) => <div role="cell" key={i} />)}
                </div>
                {section.rows.map((row) => {
                  const differs = rowDiffers(row)
                  return (
                  <div
                    key={row.fieldId}
                    role="row"
                    className="grid border-b border-ih-border"
                    style={{ gridTemplateColumns: GRID_COLS }}
                  >
                    <div
                      role="rowheader"
                      className={`sticky left-0 z-10 px-[18px] py-3.5 font-mono text-[11px] uppercase tracking-[0.06em] ${
                        differs ? 'bg-ih-accent-soft text-ih-accent' : 'bg-ih-surface-2 text-ih-muted'
                      }`}
                    >
                      {row.label}
                    </div>
                    {row.cells.map((cell, i) => (
                      <div
                        key={`${row.fieldId}-${i}`}
                        role="cell"
                        className={`border-l border-ih-border px-[18px] py-3.5 text-[13px] leading-[1.5] ${
                          differs ? 'bg-ih-surface text-ih-ink' : 'bg-ih-surface text-ih-muted'
                        }`}
                      >
                        {cell.display
                          ? <span className={`font-mono tabular-nums ${differs ? 'font-medium' : ''}`}>{cell.display}</span>
                          : <span className="text-ih-muted-2">—</span>}
                      </div>
                    ))}
                    {Array.from({ length: emptySlots }).map((_, i) => (
                      <div role="cell" key={`empty-${i}`} className="border-l border-ih-border px-[18px] py-3.5 font-mono text-[13px] text-ih-muted-2">
                        —
                      </div>
                    ))}
                  </div>
                  )
                })}
              </div>
            ))}

            {/* Engineer's take */}
            {validation.ok && visibleSections.length > 0 && (
              <div role="rowgroup">
                <div
                  role="row"
                  className="grid bg-ih-navy font-mono text-[10.5px] uppercase tracking-[0.12em] text-white"
                  style={{ gridTemplateColumns: GRID_COLS }}
                >
                  <div role="columnheader" className="px-4 py-2.5">Engineer&apos;s take</div>
                  {Array.from({ length: MAX_COMPARE }).map((_, i) => <div role="cell" key={i} />)}
                </div>
                <div
                  role="row"
                  className="grid border-b border-ih-border"
                  style={{ gridTemplateColumns: GRID_COLS }}
                >
                  <div role="rowheader" className="px-[18px] py-3.5 font-mono text-[11px] uppercase tracking-[0.06em] text-ih-muted bg-ih-bg">
                    Best for
                  </div>
                  {sortedProducts.map((product) => (
                    <div role="cell" key={product.id} className="px-[18px] py-3.5 border-l border-ih-border bg-ih-surface text-[13px] leading-[1.5]">
                      Contact our engineers for a specific application recommendation for{' '}
                      <span className="font-mono text-[11px] text-ih-muted">{product.sku}</span>
                    </div>
                  ))}
                  {Array.from({ length: emptySlots }).map((_, i) => (
                    <div role="cell" key={`empty-${i}`} className="px-[18px] py-3.5 border-l border-ih-border text-ih-muted font-mono text-[13px]">—</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dark CTA strip — only when valid */}
          {validation.ok && (
            <div
              className="mt-8 grid items-center gap-6 rounded-lg bg-ih-navy px-6 py-5 text-white"
              style={{ gridTemplateColumns: '1fr auto' }}
            >
              <div>
                <div className="mb-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-steel">
                  NOT SURE WHICH ONE?
                </div>
                <div className="text-[18px] tracking-[-0.01em]">
                  Send all {sortedProducts.length} to an Indus engineer · we&apos;ll spec the right one for your application within 1 hour
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Link
                  href={`/quote`}
                  className="inline-flex h-10 items-center whitespace-nowrap rounded-md bg-ih-accent px-[18px] text-[13.5px] font-medium text-ih-accent-fg transition-colors hover:bg-ih-accent-hover"
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
    <div className="py-20 text-center border-t border-ih-border">
      <p className="text-[24px] font-semibold mb-3">No products to compare</p>
      <p className="text-ih-muted text-sm mb-6">
        Browse the catalogue and add up to {MAX_COMPARE} products from the same category to compare them side by side.
      </p>
      <Link href={`/c`} className="inline-flex h-10 items-center rounded-md bg-ih-accent px-6 text-[13.5px] font-medium text-ih-accent-fg transition-colors hover:bg-ih-accent-hover">
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
      <p className="text-[13px] leading-[1.55] text-ih-ink-2">
        The compare table aligns rows by spec template. These products have no template yet, so we can&apos;t align them:{' '}
        <span className="font-mono">{validation.offendingSkus.join(', ')}</span>. Remove them, or ask the team to assign a template.
      </p>
    )
  } else if (validation.reason === 'mixed_category') {
    body = (
      <div className="text-[13px] leading-[1.55] text-ih-ink-2 space-y-2">
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
                    className="text-ih-accent hover:underline mr-2"
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
      <p className="text-[13px] leading-[1.55] text-ih-ink-2">
        These products are in the same category but use different spec templates, so the rows can&apos;t be aligned 1:1. Remove products until only one template remains.
      </p>
    )
  } else if (validation.reason === 'too_many') {
    title = `Compare supports up to ${validation.max} products`
    body = (
      <p className="text-[13px] leading-[1.55] text-ih-ink-2">
        You have {validation.count} products selected. Remove at least {validation.count - validation.max} to continue.
      </p>
    )
  }

  return (
    <div className="mt-4 rounded-md border-l-2 border-ih-accent bg-ih-accent-soft p-4">
      <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-ih-accent mb-2">{title}</p>
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

