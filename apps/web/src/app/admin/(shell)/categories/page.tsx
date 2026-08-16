import type { Metadata } from 'next'
import { db } from '@indus/db'
import CategoriesClient from './CategoriesClient'

export const metadata: Metadata = { title: 'Categories — Indus Admin' }

type Props = { params: Promise<Record<string, never>> }

export default async function CategoriesPage({ params }: Props) {
  await params

  const [categoriesRaw, templates] = await Promise.all([
    db.category.findMany({
      orderBy: [{ parentId: 'asc' }, { position: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { products: true, children: true } },
        defaultSpecTemplate: { select: { id: true, name: true, slug: true } },
      },
    }),
    db.specTemplate.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
  ])

  const categories = categoriesRaw.map((c) => ({
    id: c.id,
    parentId: c.parentId,
    slug: c.slug,
    name: c.name,
    position: c.position,
    isPublished: c.isPublished,
    productCount: c._count.products,
    childCount: c._count.children,
    defaultSpecTemplateId: c.defaultSpecTemplateId,
    defaultSpecTemplateName: c.defaultSpecTemplate?.name ?? null,
  }))

  return (
    <div className="px-8 py-6 pb-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">Categories</h1>
          <p className="text-[13px] text-ih-muted mt-1">
            {categories.length} {categories.length === 1 ? 'category' : 'categories'}
          </p>
        </div>
      </div>

      <CategoriesClient categories={categories} templates={templates} />
    </div>
  )
}
