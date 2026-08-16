import type { Metadata } from 'next'
import { db } from '@indus/db'
import BrandsClient from './BrandsClient'

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
    <div className="px-8 py-6 pb-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">Brands</h1>
          <p className="text-[13px] text-ih-muted mt-1">
            {brands.length} {brands.length === 1 ? 'brand' : 'brands'}
          </p>
        </div>
      </div>

      <BrandsClient brands={brands} />
    </div>
  )
}
