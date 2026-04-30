import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@indus/db'
import AdminTopbar from '../../../../components/AdminTopbar'

export const metadata: Metadata = { title: 'Products — Indus Admin' }

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ status?: string; brand?: string; category?: string; q?: string }>
}

const STATUS_COLORS: Record<string, string> = {
  active: 'text-[oklch(0.4_0.14_145)] bg-[oklch(0.94_0.06_145)]',
  draft: 'text-[var(--color-muted)] bg-[var(--color-deep)]',
  discontinued: 'text-[oklch(0.5_0.12_25)] bg-[oklch(0.96_0.04_25)]',
}

export default async function AdminProductsPage({ params, searchParams }: Props) {
  const { locale } = await params
  const sp = await searchParams

  const statusFilter = sp.status ?? ''
  const brandFilter = sp.brand ?? ''
  const categoryFilter = sp.category ?? ''
  const query = (sp.q ?? '').trim()

  const products = await db.product.findMany({
    where: {
      ...(statusFilter ? { status: statusFilter as never } : {}),
      ...(brandFilter ? { brandId: brandFilter } : {}),
      ...(categoryFilter ? { categoryId: categoryFilter } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { sku: { contains: query, mode: 'insensitive' } },
              { mpn: { contains: query, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: { brand: true, category: true },
    orderBy: { updatedAt: 'desc' },
    take: 100,
  })

  function filterUrl(overrides: Record<string, string | undefined>) {
    const base: Record<string, string | undefined> = {
      status: statusFilter || undefined,
      brand: brandFilter || undefined,
      category: categoryFilter || undefined,
      q: query || undefined,
    }
    const merged = { ...base, ...overrides }
    const qp = new URLSearchParams()
    for (const [k, v] of Object.entries(merged)) {
      if (v) qp.set(k, v)
    }
    const qs = qp.toString()
    return `/${locale}/products${qs ? `?${qs}` : ''}`
  }

  return (
    <>
      <AdminTopbar
        crumbs={[{ label: 'Catalogue' }, { label: 'Products' }]}
        primaryAction={{ label: '+ Add product', href: `/${locale}/products/new` }}
      />

      <div className="px-8 py-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight">Products</h1>
            <p className="text-[13px] text-[var(--color-muted)] mt-1">
              {products.length} {products.length === 1 ? 'product' : 'products'} shown
            </p>
          </div>
          <Link
            href={`/${locale}/products/import`}
            className="h-9 px-4 flex items-center border border-[var(--color-border)] bg-white text-[13px] font-medium hover:border-[var(--color-primary)] transition-colors"
          >
            ↑ Bulk import
          </Link>
        </div>

        {/* Search + filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <form
            method="GET"
            action={`/${locale}/products`}
            className="flex border border-[var(--color-border)] bg-[var(--color-elevated)] h-9"
          >
            <input
              name="q"
              defaultValue={query}
              placeholder="Search SKU, title, or MPN…"
              className="w-64 px-3 bg-transparent text-[13px] text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none"
            />
            {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
            {brandFilter && <input type="hidden" name="brand" value={brandFilter} />}
            {categoryFilter && <input type="hidden" name="category" value={categoryFilter} />}
            <button
              type="submit"
              className="px-3 border-l border-[var(--color-border)] font-mono text-[11px] text-[var(--color-muted)] hover:text-[var(--color-primary)]"
            >
              Search
            </button>
          </form>

          <div className="flex gap-1.5">
            {['', 'draft', 'active', 'discontinued'].map((s) => (
              <Link
                key={s}
                href={filterUrl({ status: s || undefined })}
                className={`px-3 py-1.5 font-mono text-[11px] border transition-colors capitalize ${
                  statusFilter === s
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                    : 'border-[var(--color-border)] text-[var(--color-body)] hover:border-[var(--color-body)]'
                }`}
              >
                {s || 'All'}
              </Link>
            ))}
          </div>

          {(statusFilter || brandFilter || categoryFilter || query) && (
            <Link
              href={`/${locale}/products`}
              className="font-mono text-[11px] text-[var(--color-muted)] hover:text-[var(--color-primary)] underline underline-offset-2"
            >
              Clear filters
            </Link>
          )}
        </div>

        {products.length === 0 ? (
          <div className="py-16 border border-dashed border-[var(--color-border)] text-center">
            <p className="text-[var(--color-muted)] mb-3">
              {query || statusFilter || brandFilter || categoryFilter
                ? 'No products match these filters.'
                : 'No products yet.'}
            </p>
            <Link
              href={`/${locale}/products/new`}
              className="inline-flex h-9 px-4 items-center bg-[var(--color-accent)] text-white text-[13px] font-medium hover:opacity-90"
            >
              + Add your first product
            </Link>
          </div>
        ) : (
          <div className="border border-[var(--color-border)] bg-white">
            <div className="grid grid-cols-[120px_1fr_140px_140px_100px_80px] px-4 py-2.5 bg-[var(--color-surface)] border-b border-[var(--color-border)] font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--color-muted)]">
              <div>SKU</div>
              <div>Title</div>
              <div>Brand</div>
              <div>Category</div>
              <div className="text-center">Status</div>
              <div className="text-right">Updated</div>
            </div>

            {products.map((p, i) => (
              <Link
                key={p.id}
                href={`/${locale}/products/${p.id}/edit`}
                className={`grid grid-cols-[120px_1fr_140px_140px_100px_80px] px-4 py-3.5 items-center hover:bg-[var(--color-deep)] transition-colors ${
                  i > 0 ? 'border-t border-[var(--color-border)]' : ''
                }`}
              >
                <div className="font-mono text-[12px] text-[var(--color-muted)] truncate">{p.sku}</div>
                <div className="text-[13px] font-medium text-[var(--color-primary)] truncate">{p.title}</div>
                <div className="text-[12px] text-[var(--color-body)] truncate">
                  {p.brand?.name ?? <span className="text-[var(--color-caption)]">—</span>}
                </div>
                <div className="text-[12px] text-[var(--color-body)] truncate">
                  {p.category?.name ?? <span className="text-[var(--color-caption)]">—</span>}
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
                <div className="text-right font-mono text-[11px] text-[var(--color-muted)]">
                  {new Date(p.updatedAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
