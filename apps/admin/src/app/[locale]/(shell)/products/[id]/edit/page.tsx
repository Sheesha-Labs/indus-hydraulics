import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@indus/db'
import AdminTopbar from '../../../../../../components/AdminTopbar'
import ProductEditorClient from './ProductEditorClient'

export const metadata: Metadata = { title: 'Edit product — Indus Admin' }

type Props = {
  params: Promise<{ locale: string; id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { locale, id } = await params

  const product = await db.product.findUnique({
    where: { id },
    include: {
      brand: true,
      category: true,
      specs: { orderBy: { position: 'asc' } },
      crossReferences: true,
    },
  })

  if (!product) notFound()

  const [brands, categories] = await Promise.all([
    db.brand.findMany({ orderBy: { name: 'asc' } }),
    db.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  return (
    <>
      <AdminTopbar
        crumbs={[
          { label: 'Catalogue' },
          { label: 'Products', href: `/${locale}/products` },
          { label: product.title },
        ]}
      />
      <ProductEditorClient
        locale={locale}
        product={{
          id: product.id,
          sku: product.sku,
          mpn: product.mpn,
          slug: product.slug,
          title: product.title,
          descriptionShort: product.descriptionShort,
          descriptionLong: product.descriptionLong,
          status: product.status,
          brandId: product.brandId,
          categoryId: product.categoryId,
          seoTitle: product.seoTitle,
          seoDescription: product.seoDescription,
          updatedAt: product.updatedAt.toISOString(),
        }}
        specs={product.specs.map((s) => ({
          id: s.id,
          group: s.group,
          label: s.label,
          value: s.value,
          unit: s.unit,
          isFilterable: s.isFilterable,
        }))}
        crossRefs={product.crossReferences.map((c) => ({
          id: c.id,
          competitorBrand: c.competitorBrand,
          competitorMpn: c.competitorMpn,
          compatibility: c.compatibility,
        }))}
        brands={brands.map((b) => ({ id: b.id, name: b.name }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </>
  )
}
