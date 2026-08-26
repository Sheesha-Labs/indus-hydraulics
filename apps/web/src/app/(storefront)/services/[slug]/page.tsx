import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { unstable_cache } from 'next/cache'
import { buildArticleLd, GalleryImageIdsSchema, serviceCaseMarketReach } from '@indus/domain'
import { JsonLd } from '@indus/ui'
import {
  getGalleryMedia,
  getServiceCaseBySlug,
  listServiceCases,
} from '../../../../lib/service-cases'
import { db } from '@indus/db'
import { mediaUrl } from '../../../../lib/media'
import { BASE_URL, ORG_ID, SITE_NAME, pageMetadata } from '../../../../lib/seo'
import { getStoreSettings } from '../../../../lib/store-settings'
import CaseBreadcrumbs from '../../../../components/services/CaseBreadcrumbs'
import CaseHero from '../../../../components/services/CaseHero'
import CaseMetaStrip from '../../../../components/services/CaseMetaStrip'
import CaseToc from '../../../../components/services/CaseToc'
import CaseRail from '../../../../components/services/CaseRail'
import RelatedCases from '../../../../components/services/RelatedCases'
import ArticleRenderer from '../../../../components/services/blocks/ArticleRenderer'
import MarketReachSection from '../../../../components/markets/MarketReachSection'
import ServicesCta from '../../../../components/services/ServicesCta'
import { buildWhatsappHref, buildMailtoHref } from '@indus/ui'

type Props = {
  params: Promise<{ slug: string }>
}

const getStoreSettingsCached = unstable_cache(getStoreSettings, ['store-settings-services'], {
  revalidate: 300,
  tags: ['store-settings'],
})

/**
 * A deliberately tiny prerender list — the most recent cases.
 *
 * The size is not the point; the function EXISTING is. A dynamic route with no
 * `generateStaticParams` is served fully dynamically and `no-store` however
 * statically renderable its code is, which is what this route was doing on
 * every request. With a list, the route switches to the incremental cache and
 * `dynamicParams` renders every unlisted entry on first request and caches it
 * from then on. See the long note on `/p/[slug]`.
 *
 * Length is paid in build minutes, so it stays small — see PR #412, where
 * oversized lists took the production build from 5 minutes to 16.
 */
const STATIC_CASE_LIMIT = 5

export async function generateStaticParams() {
  const rows = await db.serviceCase.findMany({
    where: { status: 'published' },
    select: { slug: true },
    orderBy: { publishedAt: 'desc' },
    take: STATIC_CASE_LIMIT,
  })
  return rows.map(({ slug }) => ({ slug }))
}

export const dynamicParams = true

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
  const reach = serviceCaseMarketReach(c.slug, c.category)

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
    // Already an absolute URL — `getStoreSettings` resolves it now.
    publisherLogoUrl: settings.logoUrl,
    override: c.jsonLdOverride ?? undefined,
  })

  return (
    <main>
      <div className="mx-auto max-w-[var(--spacing-max-w)] px-[var(--spacing-page-gutter)]">
        <CaseBreadcrumbs caseNumber={c.caseNumber} title={c.title} category={c.category} />
        <CaseHero case={c} />
        <CaseMetaStrip metaCellsRaw={c.metaCells} />

        {/*
          grid-cols-1 is load-bearing, not decoration. A `grid` with no
          grid-template-columns creates ONE IMPLICIT COLUMN sized `auto`,
          i.e. max-content — so at mobile this column grew to fit the
          longest TOC link (458px) instead of the 382px viewport, and the
          whole page scrolled sideways. Tailwind's grid-cols-1 is
          repeat(1, minmax(0,1fr)), which constrains to the container.
        */}
        <div className="grid grid-cols-1 items-start gap-12 py-14 pb-20 lg:grid-cols-[220px_minmax(0,1fr)_300px]">
          <aside className="min-w-0 lg:sticky lg:top-24">
            <CaseToc bodyBlocksRaw={c.bodyBlocks} />
          </aside>

          {/*
            The reach section sits in the article column rather than at page
            level, so it inherits the same measure as the prose it follows and
            reads as the last step of the argument before the quote card.
            min-w-0 for the same reason ArticleRenderer carries it: as a grid
            item this would otherwise size to its widest child.
          */}
          <div className="min-w-0">
            <ArticleRenderer blocksRaw={c.bodyBlocks} />
            {reach && <MarketReachSection reach={reach} variant="article" />}
          </div>

          <aside className="min-w-0 lg:sticky lg:top-24">
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

      {/*
        RelatedCases is full-bleed via `-mx-[var(--spacing-page-gutter)]`, which
        only cancels out inside a parent that HAS that padding. Rendered bare at
        page level it had nothing to cancel and pushed 48px past the viewport on
        both sides — 3,086-word case-study pages scrolled sideways. ApproachSteps
        uses the same trick correctly, from inside this container.
      */}
      <div className="mx-auto max-w-[var(--spacing-max-w)] px-[var(--spacing-page-gutter)]">
        <RelatedCases cases={related} />
      </div>

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
