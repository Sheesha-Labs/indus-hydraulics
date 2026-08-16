import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@indus/db'
import IndustryEditorClient from './IndustryEditorClient'
import IndustryContentEditor from './IndustryContentEditor'

export const metadata: Metadata = { title: 'Edit industry — Indus Admin' }

type Props = { params: Promise<{ id: string }> }

export default async function EditIndustryPage({ params }: Props) {
  const { id } = await params

  const industry = await db.industry.findUnique({
    where: { id },
    include: {
      caseStudies: { orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] },
    },
  })
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

  // JSON columns come back as `Prisma.JsonValue`; serialise to a string
  // for the textarea-based editors. `null` for `supportBlock` → empty
  // string so the editor can leave the field blank.
  const stringifyJson = (v: unknown): string =>
    v == null ? '' : JSON.stringify(v, null, 2)

  return (

    <IndustryEditorClient
      contentEditor={
      <IndustryContentEditor
        industry={{
          id: industry.id,
          tagline: industry.tagline,
          headline: industry.headline,
          breadcrumb: industry.breadcrumb,
          gradient: industry.gradient,
          position: industry.position,
          heroId: industry.heroId,
          chips: stringifyJson(industry.chips),
          stats: stringifyJson(industry.stats),
          deliveryAreas: stringifyJson(industry.deliveryAreas),
          supportBlock: stringifyJson(industry.supportBlock),
          featuredProductSkus: Array.isArray(industry.featuredProductSkus)
            ? (industry.featuredProductSkus as unknown[])
                .filter((x): x is string => typeof x === 'string')
                .join(', ')
            : '',
          featuredCategorySlugs: Array.isArray(industry.featuredCategorySlugs)
            ? (industry.featuredCategorySlugs as unknown[])
                .filter((x): x is string => typeof x === 'string')
                .join(', ')
            : '',
        }}
        caseStudies={industry.caseStudies.map((c) => ({
          id: c.id,
          tag: c.tag,
          title: c.title,
          description: c.description,
          year: c.year,
          imageId: c.imageId,
          position: c.position,
          isPublished: c.isPublished,
        }))}
        recentImages={recentMedia.map((m) => ({
          id: m.id,
          storagePath: m.storagePath,
          alt: m.alt,
          originalFilename: m.originalFilename,
        }))}
        publicUrlBase={(process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? '').replace(/\/$/, '')}
      />
      }
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
  )
}
