import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@indus/db'
import AdminTopbar from '../../../../components/AdminTopbar'
import TemplateEditorClient from './TemplateEditorClient'

export const metadata: Metadata = { title: 'Edit spec template — Indus Admin' }

type Props = { params: Promise<{ id: string }> }

export default async function SpecTemplateEditPage({ params }: Props) {
  const { id } = await params

  const tpl = await db.specTemplate.findUnique({
    where: { id },
    include: {
      fields: { orderBy: { position: 'asc' } },
      categories: { select: { id: true, name: true, slug: true }, orderBy: { name: 'asc' } },
      products: {
        select: {
          id: true,
          sku: true,
          title: true,
          status: true,
          updatedAt: true,
          category: { select: { name: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 100,
      },
      _count: { select: { products: true } },
    },
  })

  if (!tpl) notFound()

  // Plain-data props for the client component (no Decimal/Date instances cross the boundary).
  const fields = tpl.fields.map((f) => ({
    id: f.id,
    key: f.key,
    label: f.label,
    unit: f.unit,
    dataType: f.dataType,
    options: (f.options as string[] | null) ?? null,
    helpText: f.helpText,
    isRequired: f.isRequired,
    isKeyFeature: f.isKeyFeature,
    isQuickSpec: f.isQuickSpec,
    group: f.group,
    position: f.position,
  }))

  const products = tpl.products.map((p) => ({
    id: p.id,
    sku: p.sku,
    title: p.title,
    status: p.status,
    categoryName: p.category?.name ?? null,
    updatedAt: p.updatedAt.toISOString(),
  }))

  return (
    <>
      <AdminTopbar
        crumbs={[
          { label: 'Catalogue' },
          { label: 'Spec templates', href: `/spec-templates` },
          { label: tpl.name },
        ]}
      />
      <div className="px-8 py-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight">{tpl.name}</h1>
            <p className="text-[13px] text-[var(--color-muted)] mt-1 font-mono">{tpl.slug}</p>
          </div>
          <Link
            href={`/spec-templates`}
            className="font-mono text-[11px] text-[var(--color-muted)] hover:text-[var(--color-primary)]"
          >
            ← Back to templates
          </Link>
        </div>

        {tpl.categories.length > 0 && (
          <div className="mb-6 px-4 py-3 bg-[oklch(0.97_0.03_240)] border border-[oklch(0.85_0.07_240)] text-[12px]">
            <b>Default for {tpl.categories.length} categor{tpl.categories.length === 1 ? 'y' : 'ies'}:</b>{' '}
            {tpl.categories.map((c, i) => (
              <span key={c.id}>
                {i > 0 && ', '}
                <Link
                  href={`/categories`}
                  className="underline hover:text-[var(--color-accent)]"
                >
                  {c.name}
                </Link>
              </span>
            ))}
            . New products in these categories will be pre-assigned this template.
          </div>
        )}

        <TemplateEditorClient
         
          template={{
            id: tpl.id,
            slug: tpl.slug,
            name: tpl.name,
            description: tpl.description,
          }}
          fields={fields}
          products={products}
          totalProductCount={tpl._count.products}
        />
      </div>
    </>
  )
}
