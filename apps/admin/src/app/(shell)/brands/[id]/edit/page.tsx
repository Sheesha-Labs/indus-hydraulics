import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@indus/db'
import AdminTopbar from '../../../../../components/AdminTopbar'
import BrandEditorClient from './BrandEditorClient'

export const metadata: Metadata = { title: 'Edit brand — Indus Admin' }

type Props = { params: Promise<{ id: string }> }

function resolveMediaUrl(storagePath: string | null | undefined): string | null {
  if (!storagePath) return null
  if (storagePath.startsWith('http')) return storagePath
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? ''
  return base ? `${base}/${storagePath}` : storagePath
}

export default async function EditBrandPage({ params }: Props) {
  const { id } = await params

  const brand = await db.brand.findUnique({
    where: { id },
    include: { logo: true },
  })
  if (!brand) notFound()

  const [recentMedia, ogMedia] = await Promise.all([
    db.media.findMany({
      where: { kind: 'image' },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, storagePath: true, alt: true, originalFilename: true },
    }),
    brand.ogImageMediaId
      ? db.media.findUnique({
          where: { id: brand.ogImageMediaId },
          select: { storagePath: true },
        })
      : Promise.resolve(null),
  ])

  const storefrontUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://indushydraulics.com').replace(
    /\/$/,
    '',
  )

  return (
    <>
      <AdminTopbar
        crumbs={[
          { label: 'Catalogue' },
          { label: 'Brands', href: '/brands' },
          { label: brand.name },
        ]}
      />
      <BrandEditorClient
        brand={{
          id: brand.id,
          slug: brand.slug,
          name: brand.name,
          isPublished: brand.isPublished,
          publicUrl: `${storefrontUrl}/brands/${brand.slug}`,
          logoUrl: resolveMediaUrl(brand.logo?.storagePath ?? null),
          seoTitle: brand.seoTitle,
          seoDescription: brand.seoDescription,
          canonicalUrl: brand.canonicalUrl,
          focusKeyword: brand.focusKeyword,
          robotsIndex: brand.robotsIndex,
          robotsFollow: brand.robotsFollow,
          ogImageMediaId: brand.ogImageMediaId,
          ogImageStoragePath: ogMedia?.storagePath ?? null,
          sitemapPriority:
            brand.sitemapPriority != null ? Number(brand.sitemapPriority) : null,
          sitemapChangeFreq: brand.sitemapChangeFreq,
          excludeFromSitemap: brand.excludeFromSitemap,
          jsonLdOverride: brand.jsonLdOverride
            ? JSON.stringify(brand.jsonLdOverride, null, 2)
            : null,
        }}
        recentImages={recentMedia.map((m) => ({
          id: m.id,
          storagePath: m.storagePath,
          alt: m.alt,
          originalFilename: m.originalFilename,
        }))}
      />
    </>
  )
}
