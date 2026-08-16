import type { Metadata } from 'next'
import { db } from '@indus/db'
import SpecTemplatesClient from './SpecTemplatesClient'

export const metadata: Metadata = { title: 'Spec templates — Indus Admin' }

type Props = { params: Promise<Record<string, never>> }

export default async function SpecTemplatesPage({ params }: Props) {
  await params

  const templatesRaw = await db.specTemplate.findMany({
    orderBy: [{ position: 'asc' }, { name: 'asc' }],
    include: {
      _count: { select: { fields: true, products: true, categories: true } },
    },
  })

  const templates = templatesRaw.map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    description: t.description,
    fieldCount: t._count.fields,
    productCount: t._count.products,
    categoryCount: t._count.categories,
  }))

  return (
    <div className="px-8 py-6 pb-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">Spec templates</h1>
          <p className="text-[13px] text-ih-muted mt-1">
            {templates.length} {templates.length === 1 ? 'template' : 'templates'} — reusable typed
            schemas for product specs &amp; key features.
          </p>
        </div>
      </div>

      <SpecTemplatesClient templates={templates} />
    </div>
  )
}
