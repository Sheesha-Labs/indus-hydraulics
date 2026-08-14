import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { unstable_cache } from 'next/cache'
import {
  buildArticleLd,
  GalleryImageIdsSchema,
} from '@indus/domain'
import { JsonLd } from '@indus/ui'
import {
  getGalleryMedia,
  getServiceCaseBySlug,
  listServiceCases,
} from '../../../lib/service-cases'
import { mediaUrl } from '../../../lib/media'
import { BASE_URL, ORG_ID, SITE_NAME, pageMetadata } from '../../../lib/seo'
import { getStoreSettings } from '../../../lib/store-settings'
import CaseBreadcrumbs from '../../../components/services/CaseBreadcrumbs'
import CaseHero from '../../../components/services/CaseHero'
import CaseMetaStrip from '../../../components/services/CaseMetaStrip'
import CaseToc from '../../../components/services/CaseToc'
import CaseRail from '../../../components/services/CaseRail'
import RelatedCases from '../../../components/services/RelatedCases'
import ArticleRenderer from '../../../components/services/blocks/ArticleRenderer'
import ServicesCta from '../../../components/services/ServicesCta'
import { buildWhatsappHref, buildMailtoHref } from '@indus/ui'

type Props = {
  params: Promise<{ slug: string }>
}

const getStoreSettingsCached = unstable_cache(getStoreSettings, ['store-settings-services'], {
  revalidate: 300,
  tags: ['store-settings'],
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const c = await getServiceCaseBySlug(slug)
  if (!c) return {}
  return pageMetadata({
    title: c.seoTitle ?? c.title,
    description: c.seoDescription ?? c.deck,
    path: `/services/${c.slug}`,
    canonicalUrl: c.canonicalUrl,
    robots: { index: c.robotsIndex, follow: c.robotsFollow },
    ogImagePath: c.ogImage?.storagePath ?? c.heroImage?.storagePath ?? null,
  })
}

export default async function ServiceCasePage({ params }: Props) {
  const { slug } = await params
  const c = await getServiceCaseBySlug(slug)
  if (!c) notFound()

  const galleryIds = GalleryImageIdsSchema.safeParse(c.galleryImageIds).data ?? []

  // Fan out reads in parallel — case is the dependency for category lookup,
  // but related + gallery + settings can run concurrently from there.
  const [related, galleryThumbs, settings] = await Promise.all([
    listServiceCases({ category: c.category, excludeSlugs: [c.slug], limit: 3 }),
    getGalleryMedia(galleryIds),
    getStoreSettingsCached(),
  ])

  const articleLd = buildArticleLd({
    headline: c.title,
    description: c.deck,
    url: `${BASE_URL}/services/${c.slug}`,
    imageUrl: c.heroImage ? mediaUrl(c.heroImage.storagePath) : null,
    authorName: c.pullQuoteAuthor ?? null,
    publishedAt: c.publishedAt ?? null,
    modifiedAt: c.seoUpdatedAt ?? c.updatedAt ?? null,
    publisherId: ORG_ID,
    publisherName: SITE_NAME,
    publisherLogoUrl: settings.logoUrl ? mediaUrl(settings.logoUrl) : null,
    override: c.jsonLdOverride ?? undefined,
  })

  return (
    <main>
      <div className="mx-auto max-w-[var(--spacing-max-w)] px-[var(--spacing-page-gutter)]">
        <CaseBreadcrumbs caseNumber={c.caseNumber} title={c.title} category={c.category} />
        <CaseHero case={c} />
        <CaseMetaStrip metaCellsRaw={c.metaCells} />

        <div className="grid items-start gap-12 py-14 pb-20 lg:grid-cols-[220px_minmax(0,1fr)_300px]">
          <aside className="lg:sticky lg:top-24">
            <CaseToc bodyBlocksRaw={c.bodyBlocks} />
          </aside>

          <ArticleRenderer blocksRaw={c.bodyBlocks} />

          <aside className="lg:sticky lg:top-24">
            <CaseRail
              ctaCardTitle={c.ctaCardTitle}
              ctaCardBody={c.ctaCardBody}
              ctaCardPhone={c.ctaCardPhone}
              pullQuoteText={c.pullQuoteText}
              pullQuoteAuthor={c.pullQuoteAuthor}
              pullQuoteRole={c.pullQuoteRole}
              pullQuoteLocation={c.pullQuoteLocation}
              specsAtGlanceRaw={c.specsAtGlance}
              galleryImageIdsRaw={c.galleryImageIds}
              galleryTotalCount={c.galleryTotalCount}
              downloadsRaw={c.downloads}
              galleryThumbs={galleryThumbs}
            />
          </aside>
        </div>
      </div>

      <RelatedCases cases={related} />

      <div className="mx-auto max-w-[var(--spacing-max-w)] px-[var(--spacing-page-gutter)]">
        <ServicesCta
          whatsappUrl={buildWhatsappHref(settings.contactPhone, `Enquiry: ${c.title}`)}
          emailUrl={buildMailtoHref(settings.contactEmail, `${c.title} — service enquiry`)}
        />
      </div>

      <JsonLd data={articleLd} />
    </main>
  )
}
