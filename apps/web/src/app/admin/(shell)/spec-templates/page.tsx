import type { Metadata } from 'next'
import { db } from '@indus/db'
import SpecTemplatesClient from './SpecTemplatesClient'
import AdminPageShell from '../../../../components/admin/AdminPageShell'

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
    <AdminPageShell
      title={'Spec templates'}
      sub={
        <>
        {templates.length} {templates.length === 1 ? 'template' : 'templates'} — reusable typed
        schemas for product specs &amp; key features.
        </>
      }
    >
      <SpecTemplatesClient templates={templates} />
    
    </AdminPageShell>
  )
}
