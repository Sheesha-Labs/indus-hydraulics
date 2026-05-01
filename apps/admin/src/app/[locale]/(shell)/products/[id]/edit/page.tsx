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
      images: {
        orderBy: { position: 'asc' },
        include: { media: true },
      },
      documents: {
        orderBy: { position: 'asc' },
        include: { media: true },
      },
      questions: { orderBy: { createdAt: 'desc' } },
      specTemplate: {
        include: { fields: { orderBy: { position: 'asc' } } },
      },
    },
  })

  if (!product) notFound()

  const [brands, categories, templates] = await Promise.all([
    db.brand.findMany({ orderBy: { name: 'asc' } }),
    db.category.findMany({ orderBy: { name: 'asc' } }),
    db.specTemplate.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
  ])

  const dims = (product.dimensionsMm ?? null) as { l?: number; w?: number; h?: number } | null

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
          listPrice: product.listPrice ? product.listPrice.toString() : null,
          listPriceCurrency: product.listPriceCurrency,
          unitOfMeasure: product.unitOfMeasure,
          weightKg: product.weightKg ? product.weightKg.toString() : null,
          dimensionLengthMm: dims?.l ?? null,
          dimensionWidthMm: dims?.w ?? null,
          dimensionHeightMm: dims?.h ?? null,
          leadTimeDays: product.leadTimeDays,
          warrantyMonths: product.warrantyMonths,
          stockQty: product.stockQty,
          stockWarehouse: product.stockWarehouse,
          countryOfOrigin: product.countryOfOrigin,
          hsCode: product.hsCode,
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
          templateFieldId: s.templateFieldId,
        }))}
        specTemplate={
          product.specTemplate
            ? {
                id: product.specTemplate.id,
                name: product.specTemplate.name,
                slug: product.specTemplate.slug,
                fields: product.specTemplate.fields.map((f) => ({
                  id: f.id,
                  key: f.key,
                  label: f.label,
                  unit: f.unit,
                  dataType: f.dataType,
                  options: (f.options as string[] | null) ?? null,
                  helpText: f.helpText,
                  isRequired: f.isRequired,
                  isKeyFeature: f.isKeyFeature,
                  isQuickSpec: f.isQuickSpec,
                  group: f.group,
                  position: f.position,
                })),
              }
            : null
        }
        availableTemplates={templates.map((t) => ({ id: t.id, name: t.name, slug: t.slug }))}
        crossRefs={product.crossReferences.map((c) => ({
          id: c.id,
          competitorBrand: c.competitorBrand,
          competitorMpn: c.competitorMpn,
          compatibility: c.compatibility,
        }))}
        images={product.images.map((i) => ({
          id: i.id,
          url: i.media.storagePath,
          alt: i.alt ?? i.media.alt,
        }))}
        documents={product.documents.map((d) => ({
          id: d.id,
          kind: d.kind,
          title: d.title,
          language: d.language,
          isGated: d.isGated,
          url: d.media.storagePath,
        }))}
        questions={product.questions.map((q) => ({
          id: q.id,
          askerName: q.askerName,
          askerEmail: q.askerEmail,
          question: q.question,
          answer: q.answer,
          answeredAt: q.answeredAt?.toISOString() ?? null,
          isPublished: q.isPublished,
          createdAt: q.createdAt.toISOString(),
        }))}
        brands={brands.map((b) => ({ id: b.id, name: b.name }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </>
  )
}
