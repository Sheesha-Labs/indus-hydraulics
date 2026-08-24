import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  marketBySlug,
  marketPageBySlug,
  pendingMarketPageSlugs,
  releasedMarketPage,
} from '@indus/domain'
import { buildWhatsappHref } from '@indus/ui'
import MarketLanding from '../../../../components/markets/MarketLanding'
import { marketCatalogueClusters, marketStockedBrands } from '../../../../lib/market-catalogue'
import { buildMarketMapModel } from '../../../../lib/market-geometry'
import { getSubPageContentFresh } from '../../../../lib/page-content'
import { requireStaff } from '../../../../lib/staff-session'
import { getStoreSettings } from '../../../../lib/store-settings'

type Props = { params: Promise<{ slug: string }> }

/**
 * Draft review for an export-market page.
 *
 * WHY THIS EXISTS. A market that is written but not `released` renders the
 * plain layout on the storefront, so there is nowhere public to read the
 * designed page before it goes live — and nobody is going to review a market
 * as a TypeScript record. This renders the real page, exactly as the public
 * would see it, with a band saying what it is.
 *
 * All 126 markets are released as of 2026-08-24, so today every preview here
 * says "Live". The route stays because the next market written lands held, and
 * because it is the only surface that shows a market's bands as arranged
 * rather than as a form. It is reached from the market's editor under
 * Content · Pages & Blocks · Export markets; there is no separate admin
 * section for markets any more.
 *
 * WHY IT IS ON /admin RATHER THAN THE STOREFRONT. The obvious version — check
 * for a staff session inside the storefront route — reads cookies, and reading
 * cookies opts the route out of static rendering. Every unreleased market
 * would have lost its ISR cache to serve a page almost nobody requests. Here
 * the access control is `proxy.ts`'s default-deny on `/admin`, the route is
 * dynamic anyway, and the storefront stays entirely static.
 *
 * Deliberately OUTSIDE `(shell)`: the sidebar chrome would frame a storefront
 * page in admin furniture, and the reviewer needs to see what the buyer sees.
 */
export default async function MarketDraftPreviewPage({ params }: Props) {
  await requireStaff()

  const { slug } = await params
  const market = marketBySlug(slug)
  const page = marketPageBySlug(slug)
  if (!market || !page) notFound()

  const isReleased = releasedMarketPage(slug) !== undefined
  const pending = pendingMarketPageSlugs().length

  const [clusters, brands, settings, content] = await Promise.all([
    marketCatalogueClusters(),
    marketStockedBrands(),
    getStoreSettings(),
    // The uncached read, deliberately: this IS the review surface, so it has
    // to show the arrangement as it stands right now rather than whatever the
    // storefront cache is still serving.
    getSubPageContentFresh('market', { name: market.name, slug: market.slug }),
  ])

  return (
    <>
      <div className="sticky top-0 z-20 border-b border-ih-warning bg-ih-warning-soft px-5 py-3 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <p className="mono text-[11px] uppercase tracking-[0.1em] text-ih-warning-ink">
            {isReleased ? 'Live' : 'Draft · not public'} · {market.name} · regulatory copy{' '}
            {page.regulatoryCopy === 'verified' ? 'verified' : 'NOT verified by the forwarder'}
          </p>
          <span className="mono text-[11px] uppercase tracking-[0.1em] text-ih-warning-ink">
            {/* The count is only news while something is held; at zero it is
                noise on every preview. The edit link is always useful. */}
            {pending > 0 ? `${pending} markets awaiting review · ` : ''}
            <Link
              href={`/admin/pages/sub/market/${slug}`}
              className="underline underline-offset-2"
            >
              edit bands
            </Link>
          </span>
        </div>
      </div>

      {/*
        `data-surface="admin"` on the layout above sets a 13px root for the
        dense admin scale. A storefront page previewed inside it would render
        a size smaller than the buyer sees, which is precisely the thing a
        review is supposed to catch. Reset to the storefront's own root here.
      */}
      <div className="text-[15px] leading-[1.5]" data-surface="storefront">
        <MarketLanding
          market={market}
          page={page}
          mapModel={buildMarketMapModel(page, market.name)}
          clusters={clusters}
          brands={brands}
          contact={{
            phone: settings.contactPhone,
            email: settings.contactEmail,
            hours: settings.contactHours,
            whatsappUrl: buildWhatsappHref(settings.contactPhone, `Export enquiry — ${market.name}`),
          }}
          content={content}
          showAuditStrip
        />
      </div>
    </>
  )
}
