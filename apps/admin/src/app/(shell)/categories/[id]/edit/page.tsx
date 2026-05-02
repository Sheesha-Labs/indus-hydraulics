import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@indus/db'
import AdminTopbar from '../../../../../components/AdminTopbar'
import CategoryEditorClient from './CategoryEditorClient'

export const metadata: Metadata = { title: 'Edit category — Indus Admin' }

type Props = { params: Promise<{ id: string }> }

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params

  const category = await db.category.findUnique({ where: { id } })
  if (!category) notFound()

  const [recentMedia, ogMedia] = await Promise.all([
    db.media.findMany({
      where: { kind: 'image' },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, storagePath: true, alt: true, originalFilename: true },
    }),
    category.ogImageMediaId
      ? db.media.findUnique({
          where: { id: category.ogImageMediaId },
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
          { label: 'Categories', href: '/categories' },
          { label: category.name },
        ]}
      />
      <CategoryEditorClient
        category={{
          id: category.id,
          slug: category.slug,
          name: category.name,
          shortDescription: category.shortDescription,
          isPublished: category.isPublished,
          publicUrl: `${storefrontUrl}/c/${category.slug}`,
          seoTitle: category.seoTitle,
          seoDescription: category.seoDescription,
          canonicalUrl: category.canonicalUrl,
          focusKeyword: category.focusKeyword,
          robotsIndex: category.robotsIndex,
          robotsFollow: category.robotsFollow,
          ogImageMediaId: category.ogImageMediaId,
          ogImageStoragePath: ogMedia?.storagePath ?? null,
          sitemapPriority:
            category.sitemapPriority != null ? Number(category.sitemapPriority) : null,
          sitemapChangeFreq: category.sitemapChangeFreq,
          excludeFromSitemap: category.excludeFromSitemap,
          jsonLdOverride: category.jsonLdOverride
            ? JSON.stringify(category.jsonLdOverride, null, 2)
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
