import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@indus/db'
import AdminTopbar from '../../../../../components/AdminTopbar'
import { createProduct } from '../actions'

export const metadata: Metadata = { title: 'New product — Indus Admin' }

type Props = { params: Promise<{ locale: string }> }

export default async function NewProductPage({ params }: Props) {
  const { locale } = await params
  const [brands, categories] = await Promise.all([
    db.brand.findMany({ orderBy: { name: 'asc' } }),
    db.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  return (
    <>
      <AdminTopbar
        crumbs={[
          { label: 'Catalogue' },
          { label: 'Products', href: `/${locale}/products` },
          { label: 'New' },
        ]}
      />
      <div className="px-8 py-6 pb-16 max-w-3xl">
        <h1 className="text-[24px] font-semibold tracking-tight mb-6">New product</h1>

        {/* createProduct returns Result<...>; the void-returning wrapper
            keeps `<form action>` happy. Errors propagate via `redirect()` /
            error.tsx — there's no client-state error UI on this thin page. */}
        <form
          action={async (fd: FormData) => {
            'use server'
            const r = await createProduct(fd)
            if (r && !r.success) throw new Error(r.message)
          }}
          className="flex flex-col gap-5 bg-white border border-[var(--color-border)] p-6"
        >
          <input type="hidden" name="locale" value={locale} />

          <Field label="SKU *" hint="Unique stock-keeping unit code (e.g. IH-PP-11KW-30-DS)">
            <input
              required
              name="sku"
              className="h-9 w-full px-3 border border-[var(--color-border)] bg-white font-mono text-[13px]"
              placeholder="IH-XXXX-0000"
            />
          </Field>

          <Field label="Title *">
            <input
              required
              name="title"
              className="h-9 w-full px-3 border border-[var(--color-border)] bg-white text-[13px]"
              placeholder="Standard Hydraulic Power Pack 11kW 30L/min"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Brand">
              <select
                name="brandId"
                defaultValue=""
                className="h-9 w-full px-2 border border-[var(--color-border)] bg-white text-[13px]"
              >
                <option value="">— None —</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Category">
              <select
                name="categoryId"
                defaultValue=""
                className="h-9 w-full px-2 border border-[var(--color-border)] bg-white text-[13px]"
              >
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Status">
            <select
              name="status"
              defaultValue="draft"
              className="h-9 w-full px-2 border border-[var(--color-border)] bg-white text-[13px]"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </Field>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="h-10 px-5 bg-[var(--color-accent)] text-white text-[13px] font-medium hover:opacity-90"
            >
              Create product
            </button>
            <Link
              href={`/${locale}/products`}
              className="h-10 px-5 flex items-center text-[13px] text-[var(--color-muted)] hover:text-[var(--color-primary)]"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium text-[var(--color-body)]">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-[var(--color-caption)]">{hint}</span>}
    </label>
  )
}
