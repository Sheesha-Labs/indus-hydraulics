import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  buildBreadcrumbLd,
  buildFaqLd,
  buildServiceLd,
  marketBySlug,
  marketCountryName,
  marketPageBySlug,
  marketPageSlugs,
  marketsOrdered,
} from '@indus/domain'
import { JsonLd, buildWhatsappHref } from '@indus/ui'
import MarketLanding from '../../../../components/markets/MarketLanding'
import MarketLandingLegacy from '../../../../components/markets/MarketLandingLegacy'
import { buildMarketMapModel } from '../../../../lib/market-geometry'
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
export function generateStaticParams() {
  /*
    Present so the route uses the incremental cache at all — without a
    `generateStaticParams` a dynamic route is served `no-store`. Only a few are
    built ahead; `dynamicParams` lets the rest render on first hit and cache
    from there. See /p/[slug] for the full reasoning and the build-time cost.

    The designed markets are always in the pre-built set. They are the
    expensive ones — each projects Natural Earth geometry through d3-geo — and
    they are the ones with paid traffic pointed at them, so paying for them
    once at build beats paying on a visitor's first request.
  */
  const designed = marketPageSlugs()
  const rest = marketsOrdered()
    .map((m) => m.slug)
    .filter((slug) => !designed.includes(slug))
    .slice(0, 2)
  return [...designed, ...rest].map((slug) => ({ slug }))
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

  const page = marketPageBySlug(slug)

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
    // Built from the same array the page renders, so the schema answers and
    // the visible answers are the same strings by construction.
    ...(page ? [buildFaqLd({ faqs: page.faqs.map((f) => ({ question: f.question, answer: f.answer })) })] : []),
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
      />
    </>
  )
}
