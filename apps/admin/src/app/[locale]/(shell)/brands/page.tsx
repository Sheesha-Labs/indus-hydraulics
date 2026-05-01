import type { Metadata } from 'next'
import { db } from '@indus/db'
import AdminTopbar from '../../../../components/AdminTopbar'
import BrandsClient from './BrandsClient'

export const metadata: Metadata = { title: 'Brands — Indus Admin' }

type Props = { params: Promise<{ locale: string }> }

export default async function BrandsPage({ params }: Props) {
  const { locale } = await params

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
    <>
      <AdminTopbar crumbs={[{ label: 'Catalogue' }, { label: 'Brands' }]} />
      <div className="px-8 py-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight">Brands</h1>
            <p className="text-[13px] text-[var(--color-muted)] mt-1">
              {brands.length} {brands.length === 1 ? 'brand' : 'brands'}
            </p>
          </div>
        </div>

        <BrandsClient locale={locale} brands={brands} />
      </div>
    </>
  )
}
