import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@indus/db'
import { signPreviewToken } from '@indus/domain'
import ProductEditorClient from './ProductEditorClient'

export const metadata: Metadata = { title: 'Edit product — Indus Admin' }

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params

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
      faqs: { orderBy: { position: 'asc' } },
      specTemplate: {
        include: { fields: { orderBy: { position: 'asc' } } },
      },
    },
  })

  if (!product) notFound()

  const [brands, categories, templates, recentMedia, ogMedia] = await Promise.all([
    db.brand.findMany({ orderBy: { name: 'asc' } }),
    db.category.findMany({ orderBy: { name: 'asc' } }),
    db.specTemplate.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
    db.media.findMany({
      where: { kind: 'image' },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, storagePath: true, alt: true, originalFilename: true },
    }),
    product.ogImageMediaId
      ? db.media.findUnique({
          where: { id: product.ogImageMediaId },
          select: { storagePath: true },
        })
      : Promise.resolve(null),
  ])

  const dims = (product.dimensionsMm ?? null) as { l?: number; w?: number; h?: number } | null

  const storefrontUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  let previewUrl: string | null = null
  try {
    const token = signPreviewToken(product.sku)
    previewUrl = `${storefrontUrl}/p/${encodeURIComponent(product.sku)}?preview=${encodeURIComponent(token)}`
  } catch {
    previewUrl = null
  }

  return (
    <ProductEditorClient
       
        previewUrl={previewUrl}
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
          compareAtPrice: product.compareAtPrice ? product.compareAtPrice.toString() : null,
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
          canonicalUrl: product.canonicalUrl,
          focusKeyword: product.focusKeyword,
          robotsIndex: product.robotsIndex,
          robotsFollow: product.robotsFollow,
          ogImageMediaId: product.ogImageMediaId,
          ogImageStoragePath: ogMedia?.storagePath ?? null,
          sitemapPriority:
            product.sitemapPriority != null ? Number(product.sitemapPriority) : null,
          sitemapChangeFreq: product.sitemapChangeFreq,
          excludeFromSitemap: product.excludeFromSitemap,
          jsonLdOverride: product.jsonLdOverride
            ? JSON.stringify(product.jsonLdOverride, null, 2)
            : null,
          publicUrl: `${storefrontUrl.replace(/\/$/, '')}/p/${product.slug}`,
          brandName: product.brand?.name ?? null,
          categoryName: product.category?.name ?? null,
          categorySlug: product.category?.slug ?? null,
          imageUrls: product.images.slice(0, 6).map((img) =>
            img.media.storagePath.startsWith('http')
              ? img.media.storagePath
              : `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? ''}/${img.media.storagePath}`,
          ),
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
        faqs={product.faqs.map((f) => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
          position: f.position,
        }))}
        brands={brands.map((b) => ({ id: b.id, name: b.name }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        recentImages={recentMedia.map((m) => ({
          id: m.id,
          storagePath: m.storagePath,
          alt: m.alt,
          originalFilename: m.originalFilename,
        }))}
      />
  )
}
