import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@indus/db'
import AdminTopbar from '../../../../../components/AdminTopbar'
import IndustryEditorClient from './IndustryEditorClient'

export const metadata: Metadata = { title: 'Edit industry — Indus Admin' }

type Props = { params: Promise<{ id: string }> }

export default async function EditIndustryPage({ params }: Props) {
  const { id } = await params

  const industry = await db.industry.findUnique({ where: { id } })
  if (!industry) notFound()

  const [recentMedia, ogMedia] = await Promise.all([
    db.media.findMany({
      where: { kind: 'image' },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, storagePath: true, alt: true, originalFilename: true },
    }),
    industry.ogImageMediaId
      ? db.media.findUnique({
          where: { id: industry.ogImageMediaId },
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
          { label: 'Industries', href: '/industries' },
          { label: industry.name },
        ]}
      />
      <IndustryEditorClient
        industry={{
          id: industry.id,
          slug: industry.slug,
          name: industry.name,
          description: industry.description,
          isPublished: industry.isPublished,
          publicUrl: `${storefrontUrl}/industries/${industry.slug}`,
          seoTitle: industry.seoTitle,
          seoDescription: industry.seoDescription,
          canonicalUrl: industry.canonicalUrl,
          focusKeyword: industry.focusKeyword,
          robotsIndex: industry.robotsIndex,
          robotsFollow: industry.robotsFollow,
          ogImageMediaId: industry.ogImageMediaId,
          ogImageStoragePath: ogMedia?.storagePath ?? null,
          sitemapPriority:
            industry.sitemapPriority != null ? Number(industry.sitemapPriority) : null,
          sitemapChangeFreq: industry.sitemapChangeFreq,
          excludeFromSitemap: industry.excludeFromSitemap,
          jsonLdOverride: industry.jsonLdOverride
            ? JSON.stringify(industry.jsonLdOverride, null, 2)
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
