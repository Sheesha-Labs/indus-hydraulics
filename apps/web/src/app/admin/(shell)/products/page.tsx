import type { Metadata } from 'next'
import Link from 'next/link'
import AdminPageShell from '../../../../components/admin/AdminPageShell'
import { db, Prisma } from '@indus/db'
import { Pagination } from '@indus/ui'
import ContentScoreBadge from '../../../../components/admin/ContentScoreBadge'
import { ADMIN_PREFIX } from '../../../../lib/admin-paths'

export const metadata: Metadata = { title: 'Products — Indus Admin' }

type Props = {
  params: Promise<Record<string, never>>
  searchParams: Promise<{
    status?: string
    brand?: string
    category?: string
    content?: string
    q?: string
    sort?: string
    dir?: string
    page?: string
  }>
}

const STATUS_COLORS: Record<string, string> = {
  active: 'text-[oklch(0.4_0.14_145)] bg-[oklch(0.94_0.06_145)]',
  draft: 'text-ih-muted bg-ih-surface-2',
  discontinued: 'text-[oklch(0.5_0.12_25)] bg-[oklch(0.96_0.04_25)]',
}

const PAGE_SIZE = 50

// Whitelist of sortable columns → Prisma orderBy fragments. Anything outside
// this set falls back to updatedAt to avoid arbitrary-column injection.
const SORTABLE: Record<string, keyof Prisma.ProductOrderByWithRelationInput> = {
  sku: 'sku',
  title: 'title',
  status: 'status',
  updatedAt: 'updatedAt',
  createdAt: 'createdAt',
  contentScore: 'contentScore',
}

// Content-score band filter — uses bandForScore thresholds:
//   thin   = <50, warn = 50–79, strong = ≥80.
const CONTENT_BANDS = {
  thin: { lt: 50 },
  warn: { gte: 50, lt: 80 },
  strong: { gte: 80 },
} as const

export default async function AdminProductsPage({ params, searchParams }: Props) {
  await params
  const sp = await searchParams

  const statusFilter = sp.status ?? ''
  const brandFilter = sp.brand ?? ''
  const categoryFilter = sp.category ?? ''
  const contentFilter = (sp.content ?? '') as '' | keyof typeof CONTENT_BANDS
  const query = (sp.q ?? '').trim()
  const sortKey = (sp.sort && SORTABLE[sp.sort]) || 'updatedAt'
  const sortDir: 'asc' | 'desc' = sp.dir === 'asc' ? 'asc' : 'desc'
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1)

  const where: Prisma.ProductWhereInput = {
    ...(statusFilter ? { status: statusFilter as Prisma.ProductWhereInput['status'] } : {}),
    ...(brandFilter ? { brandId: brandFilter } : {}),
    ...(categoryFilter ? { categoryId: categoryFilter } : {}),
    ...(contentFilter && contentFilter in CONTENT_BANDS
      ? { contentScore: CONTENT_BANDS[contentFilter] }
      : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { sku: { contains: query, mode: 'insensitive' } },
            { mpn: { contains: query, mode: 'insensitive' } },
          ],
        }
      : {}),
  }

  const [total, products, brands, categories, statusCounts] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      include: { brand: true, category: true },
      // contentScore is now persisted on the row (#7-3); we sort
      // directly on the column instead of recomputing per render.
      orderBy: { [sortKey]: sortDir },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.brand.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    db.category.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    db.product.groupBy({ by: ['status'], _count: { _all: true } }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const showingFrom = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const showingTo = Math.min(page * PAGE_SIZE, total)
  const statusCountMap = Object.fromEntries(statusCounts.map((s) => [s.status, s._count._all]))

  function buildUrl(overrides: Record<string, string | undefined>) {
    const base: Record<string, string | undefined> = {
      status: statusFilter || undefined,
      brand: brandFilter || undefined,
      category: categoryFilter || undefined,
      content: contentFilter || undefined,
      q: query || undefined,
      sort: sortKey === 'updatedAt' ? undefined : sortKey,
      dir: sortDir === 'desc' ? undefined : sortDir,
      page: page === 1 ? undefined : String(page),
    }
    const merged = { ...base, ...overrides }
    const qp = new URLSearchParams()
    for (const [k, v] of Object.entries(merged)) {
      if (v) qp.set(k, v)
    }
    const qs = qp.toString()
    return `${ADMIN_PREFIX}/products${qs ? `?${qs}` : ''}`
  }

  function sortUrl(col: keyof typeof SORTABLE) {
    // Toggle dir if clicking the active column; default to asc otherwise (except updatedAt which is naturally desc).
    const newDir = sortKey === col ? (sortDir === 'asc' ? 'desc' : 'asc') : col === 'updatedAt' || col === 'createdAt' ? 'desc' : 'asc'
    return buildUrl({ sort: col === 'updatedAt' ? undefined : col, dir: newDir === 'desc' ? undefined : newDir, page: undefined })
  }

  const sortIndicator = (col: keyof typeof SORTABLE) => (sortKey === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '')

  return (
    <AdminPageShell
      title="Products"
      sub={
        total === 0
          ? 'No products'
          : `Showing ${showingFrom.toLocaleString()}–${showingTo.toLocaleString()} of ${total.toLocaleString()}`
      }
      actions={
        <>
          <Link
            href={`/admin/products/import`}
            className="flex h-9 items-center rounded-md border border-ih-border bg-ih-surface px-4 text-[13px] font-medium transition-colors hover:border-ih-accent hover:text-ih-accent"
          >
            ↑ Bulk import
          </Link>
          <Link
            href={`/admin/products/new`}
            className="flex h-9 items-center rounded-md bg-ih-accent px-4 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
          >
            + Add product
          </Link>
        </>
      }
    >

        {/* Search + filter form (single submission to keep URL canonical) */}
        <form
          method="GET"
          action={`/admin/products`}
          className="flex flex-wrap items-center gap-2 mb-3"
        >
          <input
            name="q"
            defaultValue={query}
            placeholder="Search SKU, title, MPN…"
            className="w-64 h-9 px-3 border border-ih-border bg-ih-surface text-[13px] text-ih-ink placeholder:text-ih-muted-2 focus:outline-none focus:border-ih-ink"
          />
          <select
            name="brand"
            defaultValue={brandFilter}
            className="h-9 px-2 border border-ih-border bg-ih-surface text-[13px] focus:outline-none focus:border-ih-ink"
            aria-label="Filter by brand"
          >
            <option value="">All brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <select
            name="category"
            defaultValue={categoryFilter}
            className="h-9 px-2 border border-ih-border bg-ih-surface text-[13px] focus:outline-none focus:border-ih-ink"
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {/* Preserve sort/dir/status across filter changes, but reset page */}
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          {sortKey !== 'updatedAt' && <input type="hidden" name="sort" value={sortKey} />}
          {sortDir === 'asc' && <input type="hidden" name="dir" value="asc" />}
          <button
            type="submit"
            className="h-9 px-4 bg-ih-navy text-white text-[12px] font-medium hover:opacity-90"
          >
            Apply
          </button>
          {(statusFilter || brandFilter || categoryFilter || query) && (
            <Link
              href={`/admin/products`}
              className="font-mono text-[11px] text-ih-muted hover:text-ih-ink underline underline-offset-2 ml-1"
            >
              Clear all
            </Link>
          )}
        </form>

        {/* Status pills with counts */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <StatusPill href={buildUrl({ status: undefined, page: undefined })} active={!statusFilter} label="All" count={total} />
          {(['draft', 'active', 'discontinued'] as const).map((s) => (
            <StatusPill
              key={s}
              href={buildUrl({ status: s, page: undefined })}
              active={statusFilter === s}
              label={s}
              count={statusCountMap[s] ?? 0}
            />
          ))}
        </div>

        {/* Content-depth filter — backed by persisted Product.contentScore (#7-3).
            Thresholds align with bandForScore in @indus/domain. */}
        <div className="flex flex-wrap items-center gap-1.5 mb-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ih-muted pr-2">
            Content depth
          </span>
          <ContentChip
            href={buildUrl({ content: undefined, page: undefined })}
            active={!contentFilter}
            label="All"
          />
          <ContentChip
            href={buildUrl({ content: 'thin', page: undefined })}
            active={contentFilter === 'thin'}
            label="Thin (<50)"
            band="thin"
          />
          <ContentChip
            href={buildUrl({ content: 'warn', page: undefined })}
            active={contentFilter === 'warn'}
            label="Needs work (50–79)"
            band="warn"
          />
          <ContentChip
            href={buildUrl({ content: 'strong', page: undefined })}
            active={contentFilter === 'strong'}
            label="Strong (≥80)"
            band="strong"
          />
        </div>

        {products.length === 0 ? (
          <div className="py-16 border border-dashed border-ih-border text-center">
            <p className="text-ih-muted mb-3">
              {query || statusFilter || brandFilter || categoryFilter
                ? 'No products match these filters.'
                : 'No products yet.'}
            </p>
            <Link
              href={`/admin/products/new`}
              className="inline-flex h-9 px-4 items-center bg-ih-accent text-white text-[13px] font-medium hover:opacity-90"
            >
              + Add your first product
            </Link>
          </div>
        ) : (
          <>
            <div className="border border-ih-border bg-white">
              <div className="grid grid-cols-[140px_1fr_120px_120px_70px_60px_90px_80px] px-4 py-2.5 bg-ih-bg border-b border-ih-border font-mono text-[10px] tracking-[0.1em] uppercase text-ih-muted">
                <Link href={sortUrl('sku')} className="hover:text-ih-ink">
                  SKU{sortIndicator('sku')}
                </Link>
                <Link href={sortUrl('title')} className="hover:text-ih-ink">
                  Title{sortIndicator('title')}
                </Link>
                <div>Brand</div>
                <div>Category</div>
                <div className="text-right">Stock</div>
                <Link
                  href={sortUrl('contentScore')}
                  title="Content depth score (0–100)"
                  className="text-center hover:text-ih-ink"
                >
                  Content{sortIndicator('contentScore')}
                </Link>
                <Link href={sortUrl('status')} className="text-center hover:text-ih-ink">
                  Status{sortIndicator('status')}
                </Link>
                <Link href={sortUrl('updatedAt')} className="text-right hover:text-ih-ink">
                  Updated{sortIndicator('updatedAt')}
                </Link>
              </div>

              {products.map((p, i) => (
                  <Link
                    key={p.id}
                    href={`/admin/products/${p.id}/edit`}
                    className={`grid grid-cols-[140px_1fr_120px_120px_70px_60px_90px_80px] px-4 py-3.5 items-center hover:bg-ih-surface-2 transition-colors ${
                      i > 0 ? 'border-t border-ih-border' : ''
                    }`}
                  >
                    <div className="font-mono text-[12px] text-ih-muted truncate">{p.sku}</div>
                    <div className="text-[13px] font-medium text-ih-ink truncate">{p.title}</div>
                    <div className="text-[12px] text-ih-ink-2 truncate">
                      {p.brand?.name ?? <span className="text-ih-muted-2">—</span>}
                    </div>
                    <div className="text-[12px] text-ih-ink-2 truncate">
                      {p.category?.name ?? <span className="text-ih-muted-2">—</span>}
                    </div>
                    <div className={`text-right font-mono text-[12px] ${p.stockQty > 0 ? 'text-[oklch(0.45_0.12_150)] font-semibold' : 'text-ih-muted-2'}`}>
                      {p.stockQty > 0 ? p.stockQty.toLocaleString() : '—'}
                    </div>
                    <div className="flex justify-center">
                      <ContentScoreBadge score={p.contentScore} compact />
                    </div>
                    <div className="flex justify-center">
                      <span
                        className={`px-2 py-0.5 font-mono text-[10px] font-semibold capitalize ${
                          STATUS_COLORS[p.status] ?? ''
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                    <div className="text-right font-mono text-[11px] text-ih-muted">
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </div>
                  </Link>
                ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                buildUrl={(n) => buildUrl({ page: n === 1 ? undefined : String(n) })}
                linkComponent={Link}
              />
            )}
          </>
        )}
    </AdminPageShell>
  )
}

// ── Bits ────────────────────────────────────────────────────────────────────

function StatusPill({
  href,
  active,
  label,
  count,
}: {
  href: string
  active: boolean
  label: string
  count: number
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 h-7 px-3 font-mono text-[11px] border transition-colors capitalize ${
        active
          ? 'border-ih-accent bg-ih-accent text-white'
          : 'border-ih-border text-ih-ink-2 hover:border-ih-accent'
      }`}
    >
      <span>{label}</span>
      <span className={`text-[10px] ${active ? 'opacity-80' : 'text-ih-muted'}`}>{count.toLocaleString()}</span>
    </Link>
  )
}

function ContentChip({
  href,
  active,
  label,
  band,
}: {
  href: string
  active: boolean
  label: string
  band?: 'thin' | 'warn' | 'strong'
}) {
  // When inactive, leave the chip neutral; only the swatch dot picks up
  // the band colour so the row stays visually quiet.
  const dot =
    band === 'thin'
      ? 'bg-[oklch(0.55_0.16_25)]'
      : band === 'warn'
        ? 'bg-[oklch(0.6_0.15_75)]'
        : band === 'strong'
          ? 'bg-[oklch(0.55_0.15_145)]'
          : ''
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 h-7 px-3 font-mono text-[11px] border transition-colors ${
        active
          ? 'border-ih-accent bg-ih-accent text-white'
          : 'border-ih-border text-ih-ink-2 hover:border-ih-accent'
      }`}
    >
      {dot && <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
      <span>{label}</span>
    </Link>
  )
}
