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
import { requireStaff } from '../../../../lib/staff-session'
import { getStoreSettings } from '../../../../lib/store-settings'

type Props = { params: Promise<{ slug: string }> }

/**
 * Draft review for an export-market page.
 *
 * WHY THIS EXISTS. Forty-four markets are written and held back because their
 * regulatory copy — conformity schemes, document owners, sequencing, transit
 * bands — has not been checked by the client's forwarder. Somebody has to read
 * each one before it goes live, and nobody is going to review 44 markets as
 * TypeScript records. This renders the real page, exactly as the public would
 * see it, with a band saying what it is.
 *
 * WHY IT IS ON /admin RATHER THAN THE STOREFRONT. The obvious version — check
 * for a staff session inside the storefront route — reads cookies, and reading
 * cookies opts the route out of static rendering. The 44 unreleased markets
 * would have lost their ISR cache to serve a page almost nobody requests. Here
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

  const [clusters, brands, settings] = await Promise.all([
    marketCatalogueClusters(),
    marketStockedBrands(),
    getStoreSettings(),
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
            {pendingMarketPageSlugs().length} markets awaiting review ·{' '}
            <Link href="/admin/markets" className="underline underline-offset-2">
              review queue
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
          showAuditStrip
        />
      </div>
    </>
  )
}
