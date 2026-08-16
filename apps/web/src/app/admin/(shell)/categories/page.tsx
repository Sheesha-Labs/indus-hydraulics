import type { Metadata } from 'next'
import { db } from '@indus/db'
import CategoriesClient from './CategoriesClient'
import AdminPageShell from '../../../../components/admin/AdminPageShell'

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
    <AdminPageShell
      title={'Categories'}
      sub={<>{categories.length} {categories.length === 1 ? 'category' : 'categories'}</>}
    >
      <CategoriesClient categories={categories} templates={templates} />
    
    </AdminPageShell>
  )
}
