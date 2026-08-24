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
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
      include: {
        /*
         * `navMenuItems` is the megamenu linkage, and it is the reason this
         * screen can talk about the storefront at all.
         *
         * The megamenu is a SEPARATE curated tree (`NavMenuItem`) that points
         * at categories by foreign key. Re-parenting a category here does not
         * move anything in it — by design, the 6-section IA was a deliberate
         * product decision — so the only honest thing this page can do is show
         * which categories the menu never reaches. A published category with
         * zero nav items is live, indexable, and unreachable by clicking.
         */
        _count: { select: { products: true, children: true, navMenuItems: true } },
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
    navItemCount: c._count.navMenuItems,
    defaultSpecTemplateId: c.defaultSpecTemplateId,
    defaultSpecTemplateName: c.defaultSpecTemplate?.name ?? null,
  }))

  return (
    <AdminPageShell
      title={'Categories'}
      sub={
        <>
          {categories.length} {categories.length === 1 ? 'category' : 'categories'} · drag to
          reorder or re-nest
        </>
      }
    >
      <CategoriesClient categories={categories} templates={templates} />
    </AdminPageShell>
  )
}
