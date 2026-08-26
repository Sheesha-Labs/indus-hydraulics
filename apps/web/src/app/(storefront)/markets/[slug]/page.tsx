import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  buildBreadcrumbLd,
  buildFaqLd,
  buildServiceLd,
  marketBySlug,
  marketCountryName,
  releasedMarketPage,
  releasedMarketPageSlugs,
} from '@indus/domain'
import { JsonLd, buildWhatsappHref } from '@indus/ui'
import MarketLanding from '../../../../components/markets/MarketLanding'
import MarketLandingLegacy from '../../../../components/markets/MarketLandingLegacy'
import { buildMarketMapModel } from '../../../../lib/market-geometry'
import { getSubPageContent } from '../../../../lib/page-content'
import { marketCatalogueClusters, marketStockedBrands } from '../../../../lib/market-catalogue'
import { ORG_ID, SITE_NAME, pageMetadata, urlFor } from '../../../../lib/seo'
import { getStoreSettings } from '../../../../lib/store-settings'

type Props = { params: Promise<{ slug: string }> }

export const revalidate = 3600

/**
 * Export-market page.
 *
 * TWO LAYOUTS, ONE ROUTE. A market with a record in `MARKET_PAGES` renders the
 * designed template — hero map, catalogue index, two lead forms, gazetteer,
 * FAQ, market sitemap. Every other market renders the older, plainer layout.
 * The split is the point: the designed page has sixteen sections that each
 * need real, market-specific copy, and a half-written market rendering it
 * would ship a page of empty frames. Adding a market to the template is
 * therefore a content change, not a code change.
 *
 * Structured data is emitted HERE rather than inside either layout, so the two
 * cannot drift apart on schema. `Service` carries `areaServed` typed as
 * `Country`, never `LocalBusiness` — we ship to these markets from Dubai and
 * hold no premises in any of them (see the warning in lib/site-locations.ts).
 * `AdministrativeArea`, which the service-area pages use, is a subdivision
 * type and would be wrong here. `FAQPage` is emitted only for markets that
 * have FAQs, because the answers must match visible text exactly.
 */
/**
 * The market pages warmed at build. Everything else caches on first request.
 *
 * This list used to be `releasedMarketPageSlugs()`, on the reasoning that the
 * designed markets are the expensive ones — each projects Natural Earth
 * geometry through d3-geo — so paying once at build beat paying on a visitor's
 * first request.
 *
 * That reasoning was written when "released" meant 46 of 126. All 126 were
 * released on 2026-08-24 (#364), so the pre-built set silently became the whole
 * list and nothing said so. The result, measured 2026-08-26: **126 prerendered
 * market pages, ~1 MB of HTML each, 123 MB of the build's 144 MB of prerendered
 * output** — re-generated and re-uploaded on every deployment, and the site was
 * deploying about 25 times a day.
 *
 * The economics inverted with the deploy rate. "Pay once at build" is only
 * cheaper than "pay on first request" when a build is rarer than a cache miss;
 * here it was the other way round by an order of magnitude.
 *
 * So: the home market and the largest export lanes, and the rest on demand.
 * Raising this number is the lever that trades deploy time back for fewer cold
 * first-hits — see docs/deployment-budget.md before doing it.
 */
const WARM_MARKET_SLUGS = [
  'saudi-arabia',
  'oman',
  'qatar',
  'kuwait',
  'bahrain',
  'india',
  'united-states',
  'united-kingdom',
] as const

export function generateStaticParams() {
  // Present so the route uses the incremental cache at all — without a
  // `generateStaticParams` a dynamic route is served `no-store`. See
  // /p/[slug] for the full reasoning.
  const released = new Set(releasedMarketPageSlugs())
  return WARM_MARKET_SLUGS.filter((slug) => released.has(slug)).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const market = marketBySlug(slug)
  if (!market) return {}
  return pageMetadata({
    title: `Hydraulic & Industrial Hose Supplier in ${market.name}`,
    description: market.summary,
    path: `/markets/${market.slug}`,
  })
}

export default async function MarketPage({ params }: Props) {
  const { slug } = await params
  const market = marketBySlug(slug)
  if (!market) notFound()

  const page = releasedMarketPage(slug)

  // Read before the schema is built: whether the FAQ band is on decides
  // whether FAQPage may be emitted at all.
  const content = await getSubPageContent('market', { name: market.name, slug: market.slug })

  const structuredData = [
    buildServiceLd({
      name: `Hydraulic and industrial hose supply to ${marketCountryName(market)}`,
      description: market.summary,
      url: urlFor(`/markets/${market.slug}`),
      areaServed: [{ name: marketCountryName(market), type: 'Country' }],
      providerId: ORG_ID,
      providerName: SITE_NAME,
      serviceType: 'Export supply of hydraulic and industrial hose, fittings and adapters',
    }),
    buildBreadcrumbLd({
      items: [
        { name: 'Home', url: urlFor('/') },
        { name: 'Export markets', url: urlFor('/markets') },
        { name: market.name, url: urlFor(`/markets/${market.slug}`) },
      ],
    }),
    /*
      Built from the same array the page renders, so the schema answers and the
      visible answers are the same strings by construction — and emitted only
      when the FAQ band is actually ON. Google requires the answers in the
      markup to match visible text, so a hidden band with live FAQPage markup
      is a structured-data violation rather than merely stale.
    */
    ...(page && content.isOn('faq')
      ? [buildFaqLd({ faqs: page.faqs.map((f) => ({ question: f.question, answer: f.answer })) })]
      : []),
  ].filter((node): node is NonNullable<typeof node> => node !== null)

  if (!page) {
    return (
      <>
        <JsonLd data={structuredData} />
        <MarketLandingLegacy market={market} />
      </>
    )
  }

  const [clusters, brands, settings] = await Promise.all([
    marketCatalogueClusters(),
    marketStockedBrands(),
    getStoreSettings(),
  ])

  // Projected on the server. The topology never reaches the browser — see the
  // docblock on lib/market-geometry.ts.
  const mapModel = buildMarketMapModel(page, market.name)

  return (
    <>
      <JsonLd data={structuredData} />
      <MarketLanding
        market={market}
        page={page}
        mapModel={mapModel}
        clusters={clusters}
        brands={brands}
        contact={{
          phone: settings.contactPhone,
          email: settings.contactEmail,
          hours: settings.contactHours,
          whatsappUrl: buildWhatsappHref(settings.contactPhone, `Export enquiry — ${market.name}`),
        }}
        /*
          The audit strip is a reviewer's aid, not customer furniture: it
          reports the schema emitted, the link counts and the gazetteer size so
          a new market can be checked at a glance.

          Gated on VERCEL_ENV rather than NODE_ENV on purpose. A Vercel preview
          build runs with NODE_ENV=production, so a NODE_ENV check would hide
          the strip on exactly the deployment where someone is reviewing a new
          market. VERCEL_ENV is 'preview' there, and unset locally.
        */
        showAuditStrip={process.env.VERCEL_ENV !== 'production'}
        content={content}
      />
    </>
  )
}
