import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@indus/db'
import CmsPageEditorClient from './CmsPageEditorClient'

export const metadata: Metadata = { title: 'Edit Page — Indus Admin' }

type Props = { params: Promise<{ id: string }> }

export default async function CmsPageEditorPage({ params }: Props) {
  const { id } = await params
  const isNew = id === 'new'

  const page = isNew ? null : await db.cmsPage.findUnique({ where: { id } })
  if (!isNew && !page) notFound()

  const [recentMedia, ogMedia] = isNew
    ? [[] as Array<{ id: string; storagePath: string; alt: string | null; originalFilename: string }>, null as { storagePath: string } | null]
    : await Promise.all([
        db.media.findMany({
          where: { kind: 'image' },
          orderBy: { createdAt: 'desc' },
          take: 50,
          select: { id: true, storagePath: true, alt: true, originalFilename: true },
        }),
        page?.ogImageMediaId
          ? db.media.findUnique({
              where: { id: page.ogImageMediaId },
              select: { storagePath: true },
            })
          : Promise.resolve(null),
      ])

  const storefrontUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://indushydraulics.com').replace(
    /\/$/,
    '',
  )

  return (
    <CmsPageEditorClient
      isNew={isNew}
      page={
        page
          ? {
              id: page.id,
              slug: page.slug,
              title: page.title,
              body: page.body,
              isPublished: page.isPublished,
              publicUrl: `${storefrontUrl}/${page.slug}`,
              seoTitle: page.seoTitle,
              seoDescription: page.seoDescription,
              canonicalUrl: page.canonicalUrl,
              focusKeyword: page.focusKeyword,
              robotsIndex: page.robotsIndex,
              robotsFollow: page.robotsFollow,
              ogImageMediaId: page.ogImageMediaId,
              ogImageStoragePath: ogMedia?.storagePath ?? null,
              sitemapPriority:
                page.sitemapPriority != null ? Number(page.sitemapPriority) : null,
              sitemapChangeFreq: page.sitemapChangeFreq,
              excludeFromSitemap: page.excludeFromSitemap,
              jsonLdOverride: page.jsonLdOverride
                ? JSON.stringify(page.jsonLdOverride, null, 2)
                : null,
            }
          : null
      }
      recentImages={recentMedia.map((m) => ({
        id: m.id,
        storagePath: m.storagePath,
        alt: m.alt,
        originalFilename: m.originalFilename,
      }))}
    />
  )
}
