import type { Metadata } from 'next'
import { db } from '@indus/db'
import BrandsClient from './BrandsClient'
import AdminPageShell from '../../../../components/admin/AdminPageShell'

export const metadata: Metadata = { title: 'Brands — Indus Admin' }

type Props = { params: Promise<Record<string, never>> }

export default async function BrandsPage({ params }: Props) {
  await params

  const brandsRaw = await db.brand.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { products: true } },
    },
  })

  const brands = brandsRaw.map((b) => ({
    id: b.id,
    slug: b.slug,
    name: b.name,
    country: b.country,
    description: b.description,
    isAuthorizedDistributor: b.isAuthorizedDistributor,
    seoTitle: b.seoTitle,
    seoDescription: b.seoDescription,
    isPublished: b.isPublished,
    productCount: b._count.products,
  }))

  return (
    <AdminPageShell
      title={'Brands'}
      sub={<>{brands.length} {brands.length === 1 ? 'brand' : 'brands'}</>}
    >
      <BrandsClient brands={brands} />
    
    </AdminPageShell>
  )
}
