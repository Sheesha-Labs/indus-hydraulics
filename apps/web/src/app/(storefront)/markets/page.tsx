import {
  buildBreadcrumbLd,
  buildItemListLd,
  buildServiceLd,
  marketBySlug,
  marketDatalistNames,
  marketIndexRegions,
  marketIndexTotals,
} from '@indus/domain'
import { JsonLd, buildWhatsappHref } from '@indus/ui'
import MarketsIndex from '../../../components/markets/MarketsIndex'
import { buildMarketThumbnail, type MarketThumbnail } from '../../../lib/market-thumbnails'
import { ORG_ID, SITE_NAME, pageMetadata, urlFor } from '../../../lib/seo'
import { getStoreSettings } from '../../../lib/store-settings'

/**
 * Export-market index — the hub for all 126 `/markets/{slug}` pages.
 *
 * Kept separate from /locations on purpose. A service area is somewhere a van
 * goes; a market is somewhere a crate goes. Merging them would imply premises
 * abroad that do not exist.
 *
 * THE COUNT IN THE COPY IS DERIVED, ALWAYS. The page this replaced named
 * "Saudi Arabia, Oman, Qatar, Bahrain and Kuwait" in its meta description and
 * then said anything outside "these five" was quoted case by case — while the
 * body linked 126 destinations. The contradiction survived every market added
 * after the fifth because the sentence was typed rather than computed. Nothing
 * here writes a number down that can be counted instead.
 *
 * Structured data is emitted HERE rather than inside the layout component, the
 * same way `/markets/{slug}` does it, so the two cannot drift apart on schema.
 * Three blocks: BreadcrumbList, ItemList (the thing that tells a crawler this
 * is a genuine index rather than a link dump), and Service with all 126
 * countries as `areaServed`. Never LocalBusiness — there is no branch in any
 * of these markets and every market page says so in its first FAQ.
 */

const totals = marketIndexTotals()

const DESCRIPTION =
  'Hydraulic hose, fittings, adapters, valves and industrial hose shipped from our Dubai warehouse to ' +
  `${totals.destinations} destinations. Transit times, ports of entry and conformity documents for each market.`

export const metadata = pageMetadata({
  title: `Export Markets — ${totals.destinations} Destinations from Dubai`,
  description: DESCRIPTION,
  path: '/markets',
})

/*
  Hourly, matching `/markets/{slug}`. The page's only dynamic input is the
  store's contact block; the 126 silhouettes and every count are build-time
  constants. Projecting them is the expensive part and it happens once per
  revalidation, not once per visitor.
*/
export const revalidate = 3600

export default async function MarketsPage() {
  const regions = marketIndexRegions()
  const settings = await getStoreSettings()

  /*
    126 projections, all on the server. `buildMarketThumbnail` memoises per
    slug, so a re-render inside one build reuses them; the ~700 KB of Natural
    Earth topology never reaches the browser at all. See the docblock on
    lib/market-thumbnails.ts for why that matters more here than anywhere else
    on the site.
  */
  const thumbnails = new Map<string, MarketThumbnail | null>()
  for (const region of regions) {
    for (const card of region.cards) {
      const market = marketBySlug(card.slug)
      thumbnails.set(card.slug, market ? buildMarketThumbnail(market) : null)
    }
  }

  const cards = regions.flatMap((region) => region.cards)

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbLd({
            items: [
              { name: 'Home', url: urlFor('/') },
              { name: 'Export markets', url: urlFor('/markets') },
            ],
          }),
          // In page order, so the schema sequence and the visible sequence are
          // the same list.
          buildItemListLd({
            name: 'Export markets served from Dubai',
            items: cards.map((card) => ({
              name: card.label,
              url: urlFor(`/markets/${card.slug}`),
            })),
          }),
          buildServiceLd({
            name: 'Export supply of hydraulic and industrial hose from Dubai',
            description: DESCRIPTION,
            url: urlFor('/markets'),
            areaServed: cards.map((card) => ({ name: card.label, type: 'Country' as const })),
            providerId: ORG_ID,
            providerName: SITE_NAME,
            serviceType: 'Hydraulic and industrial hose supply',
          }),
        ]}
      />

      <MarketsIndex
        regions={regions}
        thumbnails={thumbnails}
        totals={totals}
        destinationNames={marketDatalistNames()}
        contact={{
          phone: settings.contactPhone,
          email: settings.contactEmail,
          hours: settings.contactHours,
          whatsappUrl: buildWhatsappHref(settings.contactPhone, 'Export enquiry'),
        }}
        showAuditStrip={process.env.VERCEL_ENV !== 'production'}
      />
    </>
  )
}
