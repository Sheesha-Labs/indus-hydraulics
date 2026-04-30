import type { Metadata } from 'next'
import { db } from '@indus/db'
import AdminTopbar from '../../../../components/AdminTopbar'
import CategoriesClient from './CategoriesClient'

export const metadata: Metadata = { title: 'Categories — Indus Admin' }

type Props = { params: Promise<{ locale: string }> }

export default async function CategoriesPage({ params }: Props) {
  const { locale } = await params

  const categoriesRaw = await db.category.findMany({
    orderBy: [{ parentId: 'asc' }, { position: 'asc' }, { name: 'asc' }],
    include: {
      _count: { select: { products: true, children: true } },
    },
  })

  const categories = categoriesRaw.map((c) => ({
    id: c.id,
    parentId: c.parentId,
    slug: c.slug,
    name: c.name,
    position: c.position,
    isPublished: c.isPublished,
    productCount: c._count.products,
    childCount: c._count.children,
  }))

  return (
    <>
      <AdminTopbar crumbs={[{ label: 'Catalogue' }, { label: 'Categories' }]} />
      <div className="px-8 py-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight">Categories</h1>
            <p className="text-[13px] text-[var(--color-muted)] mt-1">
              {categories.length} {categories.length === 1 ? 'category' : 'categories'}
            </p>
          </div>
        </div>

        <CategoriesClient locale={locale} categories={categories} />
      </div>
    </>
  )
}
