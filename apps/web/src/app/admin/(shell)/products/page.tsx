import type { Metadata } from 'next'
import Link from 'next/link'
import AdminPageShell from '../../../../components/admin/AdminPageShell'
import { db, Prisma } from '@indus/db'
import { Pagination } from '@indus/ui'
import ContentScoreBadge from '../../../../components/admin/ContentScoreBadge'
import { DataTable, NavTabs, StatusPill, productStatusTone } from '@indus/ui'
import { relativeTime } from '@indus/domain'
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

  // Defined here rather than hoisted out: it closes over the current sort.
  const sortHeader = (col: keyof typeof SORTABLE, label: string) => (
    <Link href={sortUrl(col)} className="hover:text-ih-ink">
      {label}
      {sortIndicator(col)}
    </Link>
  )

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
            className="flex h-8 items-center rounded-lg border border-ih-border-strong bg-ih-surface px-2.5 text-[14px] font-medium text-ih-ink transition-colors hover:bg-ih-surface-2"
          >
            ↑ Bulk import
          </Link>
          <Link
            href={`/admin/products/new`}
            className="flex h-8 items-center rounded-lg bg-ih-accent px-2.5 text-[14px] font-medium text-ih-accent-fg transition-colors hover:bg-ih-accent-hover"
          >
            + Add product
          </Link>
        </>
      }
    >
      {/* One stack owns the page's vertical rhythm. This was four sections
          each carrying its own mb-3 / mb-6, which is why no two admin lists
          had the same spacing. */}
      <div className="flex flex-col gap-6">
        {/* Search + filter form (single submission to keep URL canonical) */}
        <form
          method="GET"
          action={`/admin/products`}
          className="flex flex-wrap items-center gap-2"
        >
          <input
            name="q"
            defaultValue={query}
            placeholder="Search SKU, title, MPN…"
            className="h-9 w-64 rounded-lg border border-ih-border bg-ih-surface px-2.5 text-[14px] text-ih-ink outline-none placeholder:text-ih-muted-2 focus-visible:border-ih-accent focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft"
          />
          <select
            name="brand"
            defaultValue={brandFilter}
            className="h-9 rounded-lg border border-ih-border bg-ih-surface px-2.5 text-[14px] outline-none focus-visible:border-ih-accent focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft"
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
            className="h-9 rounded-lg border border-ih-border bg-ih-surface px-2.5 text-[14px] outline-none focus-visible:border-ih-accent focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft"
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
            className="h-9 rounded-lg bg-ih-navy px-4 text-[14px] font-medium text-ih-bg hover:bg-ih-ink"
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

        {/* One partition, one refinement — both as chip rows rather than
            two locally-invented chip languages. */}
        <NavTabs
          variant="chip"
          label="Filter by status"
          items={[
            { href: buildUrl({ status: undefined, page: undefined }), active: !statusFilter, label: 'All', count: total },
            ...(['draft', 'active', 'discontinued'] as const).map((s) => ({
              href: buildUrl({ status: s, page: undefined }),
              active: statusFilter === s,
              label: s[0]!.toUpperCase() + s.slice(1),
              count: statusCountMap[s] ?? 0,
            })),
          ]}
        />

        {/* Content-depth filter — backed by persisted Product.contentScore.
            Thresholds align with bandForScore in @indus/domain. */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted">
            Content depth
          </span>
          <NavTabs
            variant="chip"
            label="Filter by content depth"
            items={[
              { href: buildUrl({ content: undefined, page: undefined }), active: !contentFilter, label: 'All' },
              { href: buildUrl({ content: 'thin', page: undefined }), active: contentFilter === 'thin', label: 'Thin (<50)' },
              { href: buildUrl({ content: 'warn', page: undefined }), active: contentFilter === 'warn', label: 'Needs work (50–79)' },
              { href: buildUrl({ content: 'strong', page: undefined }), active: contentFilter === 'strong', label: 'Strong (≥80)' },
            ]}
          />
        </div>

        <DataTable
          minWidth="lg"
          rows={products}
          rowKey={(p) => p.id}
          emptyState={
            <>
              <p className="mb-3">
                {query || statusFilter || brandFilter || categoryFilter
                  ? 'No products match these filters.'
                  : 'No products yet.'}
              </p>
              <Link
                href={`/admin/products/new`}
                className="inline-flex h-8 items-center rounded-lg bg-ih-accent px-2.5 text-[14px] font-medium text-ih-accent-fg hover:bg-ih-accent-hover"
              >
                + Add your first product
              </Link>
            </>
          }
          columns={[
            {
              key: 'sku',
              header: sortHeader('sku', 'SKU'),
              cell: (p) => <span className="font-mono text-[12px] text-ih-muted">{p.sku}</span>,
            },
            {
              key: 'title',
              header: sortHeader('title', 'Title'),
              width: '35%',
              /*
                The LINK is the title cell, not the row.

                The row used to be one big <Link> wrapping an eight-column
                grid, which puts a brand name, a stock figure and a status
                pill inside an anchor's activation region and gives a screen
                reader one link whose name is the whole row read out.
              */
              cell: (p) => (
                <Link
                  href={`/admin/products/${p.id}/edit`}
                  className="block truncate font-medium text-ih-ink hover:text-ih-accent"
                >
                  {p.title}
                </Link>
              ),
            },
            {
              key: 'brand',
              header: 'Brand',
              secondary: true,
              cell: (p) => p.brand?.name ?? <span className="text-ih-muted-2">—</span>,
            },
            {
              key: 'category',
              header: 'Category',
              secondary: true,
              cell: (p) => p.category?.name ?? <span className="text-ih-muted-2">—</span>,
            },
            {
              key: 'stock',
              header: 'Stock',
              numeric: true,
              cell: (p) =>
                p.stockQty > 0 ? (
                  <span className="font-medium text-ih-success-ink">{p.stockQty.toLocaleString()}</span>
                ) : (
                  <span className="text-ih-muted-2">—</span>
                ),
            },
            {
              key: 'content',
              header: sortHeader('contentScore', 'Content'),
              align: 'center',
              cell: (p) => <ContentScoreBadge score={p.contentScore} compact />,
            },
            {
              key: 'status',
              header: sortHeader('status', 'Status'),
              align: 'center',
              cell: (p) => <StatusPill tone={productStatusTone(p.status)} className="capitalize">{p.status}</StatusPill>,
            },
            {
              key: 'updated',
              header: sortHeader('updatedAt', 'Updated'),
              align: 'right',
              cell: (p) => <span className="text-ih-muted">{relativeTime(p.updatedAt)}</span>,
            },
          ]}
        />

        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            buildUrl={(n) => buildUrl({ page: n === 1 ? undefined : String(n) })}
            linkComponent={Link}
          />
        )}
      </div>
    </AdminPageShell>
  )
}
