import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@indus/db'
import { createProduct } from '../actions'
import AdminPageShell from '../../../../../components/admin/AdminPageShell'

export const metadata: Metadata = { title: 'New product — Indus Admin' }

type Props = { params: Promise<Record<string, never>> }

export default async function NewProductPage({ params }: Props) {
  await params
  const [brands, categories] = await Promise.all([
    db.brand.findMany({ orderBy: { name: 'asc' } }),
    db.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  return (
    <AdminPageShell
      title="New product"
      actions={
        <>
          {/*
            `form="new-product-form"` is what keeps this working from the bar. A
            submit button outside its <form> is inert — no compile error, no
            lint failure, no runtime error, the click simply does nothing.
          */}
          <Link
            href={`/admin/products`}
            className="flex h-9 items-center rounded-md border border-ih-border bg-ih-surface px-4 text-[13px] font-medium transition-colors hover:border-ih-accent hover:text-ih-accent"
          >
            Cancel
          </Link>
          <button
            type="submit"
            form="new-product-form"
            className="flex h-9 items-center rounded-md bg-ih-accent px-4 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
          >
            Create product
          </button>
        </>
      }
      bodyClassName="px-[26px] py-6 pb-16 max-w-3xl"
    >

        {/* createProduct returns Result<...>; the void-returning wrapper
            keeps `<form action>` happy. Errors propagate via `redirect()` /
            error.tsx — there's no client-state error UI on this thin page. */}
        <form
          id="new-product-form"
          action={async (fd: FormData) => {
            'use server'
            const r = await createProduct(fd)
            if (r && !r.success) throw new Error(r.message)
          }}
          className="flex flex-col gap-5 bg-white border border-ih-border p-6"
        >

          <Field label="SKU *" hint="Unique stock-keeping unit code (e.g. IH-PP-11KW-30-DS)">
            <input
              required
              name="sku"
              className="h-9 w-full px-3 border border-ih-border bg-white font-mono text-[13px]"
              placeholder="IH-XXXX-0000"
            />
          </Field>

          <Field label="Title *">
            <input
              required
              name="title"
              className="h-9 w-full px-3 border border-ih-border bg-white text-[13px]"
              placeholder="Standard Hydraulic Power Pack 11kW 30L/min"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Brand">
              <select
                name="brandId"
                defaultValue=""
                className="h-9 w-full px-2 border border-ih-border bg-white text-[13px]"
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
                className="h-9 w-full px-2 border border-ih-border bg-white text-[13px]"
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
              className="h-9 w-full px-2 border border-ih-border bg-white text-[13px]"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </Field>

        </form>
    </AdminPageShell>
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
      <span className="text-[12px] font-medium text-ih-ink-2">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-ih-muted-2">{hint}</span>}
    </label>
  )
}
