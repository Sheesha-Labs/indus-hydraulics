import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  LOCATION_INDUSTRY_OPTIONS,
  buildBreadcrumbLd,
  buildFaqLd,
  buildServiceLd,
  enquiryMailto,
  img,
  list,
  serviceAreaBySlug,
  serviceAreasOrdered,
  str,
} from '@indus/domain'
import { JsonLd, buildWhatsappHref } from '@indus/ui'
import LocationLanding, {
  type LocationIndustryCard,
} from '../../../../components/locations/LocationLanding'
import { categoryFaqs } from '../../../../components/category/CategoryBands'
import { buildLocationMapModel } from '../../../../lib/location-geometry'
import {
  getLocationArticles,
  getLocationRangeCards,
  mediaStoragePath,
} from '../../../../lib/location-data'
import { marketSectorImages } from '../../../../lib/market-catalogue'
import { getSubPageContent } from '../../../../lib/page-content'
import { ORG_ID, SITE_NAME, crawlableImageUrl, pageMetadata, urlFor } from '../../../../lib/seo'
import { getStoreSettings } from '../../../../lib/store-settings'

type Props = { params: Promise<{ slug: string }> }

/**
 * Every area is built ahead. There are nine, each is a handful of cached
 * reads, and an area page that renders on first hit is one a crawler may find
 * slow — `/locations/abu-dhabi` was never crawled at all before this.
 */
export function generateStaticParams() {
  return serviceAreasOrdered().map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const area = serviceAreaBySlug(slug)
  if (!area) return {}
  const content = await getSubPageContent('location', { name: area.name, slug: area.slug })
  const hero = content.values('hero')
  const image = img(hero, 'image')
  return pageMetadata({
    title: str(hero, 'meta_title') ?? area.metaTitle ?? `Hydraulic Hose Repair in ${area.name}`,
    description: str(hero, 'meta_description') ?? area.metaDescription ?? area.summary,
    path: `/locations/${area.slug}`,
    ogImagePath: await mediaStoragePath(image?.mediaId ?? null),
    ogImageAlt: image?.alt ?? undefined,
  })
}

/**
 * Service-area page.
 *
 * Emits `Service` with `areaServed`, never `LocalBusiness` — a coverage area
 * is not premises, and site-locations.ts warns that asserting an unverified
 * location risks a false-business-presence penalty. There is one verified
 * premises and it is in Dubai.
 *
 * No response-time commitment appears anywhere. A published arrival time is an
 * operational promise, and assistants repeat it back to customers.
 */
export default async function ServiceAreaPage({ params }: Props) {
  const { slug } = await params
  const area = serviceAreaBySlug(slug)
  if (!area) notFound()

  const content = await getSubPageContent('location', { name: area.name, slug: area.slug })

  // An editor's pick of ranges replaces the record's; a blank list keeps it.
  const pickedRanges = list<{ category?: string | null }>(content.values('ranges'), 'items')
    .map((row) => row.category)
    .filter((s): s is string => typeof s === 'string' && s !== '')
  const rangeSlugs = pickedRanges.length > 0 ? pickedRanges : area.relatedCategories

  const [ranges, articles, sectorImages, settings] = await Promise.all([
    getLocationRangeCards(rangeSlugs),
    getLocationArticles(area.relatedArticles),
    marketSectorImages(),
    getStoreSettings(),
  ])

  const industryCards: Record<string, LocationIndustryCard> = {}
  for (const option of LOCATION_INDUSTRY_OPTIONS) {
    const image = sectorImages[option.value]
    industryCards[option.value] = {
      slug: option.value,
      name: option.label,
      url: image?.url ?? null,
      alt: image?.alt ?? null,
    }
  }

  const pageUrl = urlFor(`/locations/${area.slug}`)
  const hero = content.values('hero')
  const heroImage = img(hero, 'image')
  const heroImageUrl = crawlableImageUrl(await mediaStoragePath(heroImage?.mediaId ?? null))

  // FAQ markup only for questions a reader can see: the band on, and written.
  const faqs = content.isOn('faq') ? categoryFaqs(content.values('faq')) : []
  const faqLd = faqs.length > 0 ? buildFaqLd({ faqs }) : null

  const serviceLd = buildServiceLd({
    name: `Hydraulic hose repair and on-site service in ${area.name}`,
    description: str(hero, 'meta_description') ?? area.metaDescription ?? area.summary,
    url: pageUrl,
    areaServed: [{ name: area.name, type: 'AdministrativeArea', sameAs: area.wikipedia }],
    providerId: ORG_ID,
    providerName: SITE_NAME,
    serviceType: 'Hydraulic hose assembly and repair',
    images: heroImageUrl ? [{ url: heroImageUrl, caption: str(hero, 'image_caption') }] : null,
    // The ranges on the page, as what the service draws on. Each entry is a
    // real, published shelf the page links to.
    override:
      ranges.length > 0
        ? {
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: `Hose and fittings stocked for ${area.name}`,
              itemListElement: ranges.map((r) => ({
                '@type': 'OfferCatalog',
                name: r.name,
                url: urlFor(`/c/${r.slug}`),
              })),
            },
          }
        : undefined,
  })

  const breadcrumbLd = buildBreadcrumbLd({
    items: [
      { name: 'Home', url: urlFor('/') },
      { name: 'Service areas', url: urlFor('/locations') },
      { name: area.name, url: pageUrl },
    ],
  })

  return (
    <>
      <JsonLd data={faqLd ? [serviceLd, breadcrumbLd, faqLd] : [serviceLd, breadcrumbLd]} />
      <LocationLanding
        area={area}
        content={content}
        mapModel={buildLocationMapModel(area.slug)}
        ranges={ranges}
        articles={articles}
        industryCards={industryCards}
        contact={{
          phone: settings.contactPhone ?? null,
          whatsappUrl: buildWhatsappHref(
            settings.contactPhone,
            `On-site hose service — ${area.name}`
          ),
          emailUrl: enquiryMailto({ subject: `On-site hose service enquiry — ${area.name}` }),
        }}
      />
    </>
  )
}
