import Link from 'next/link'
import { MARKETS, buildBreadcrumbLd, buildServiceLd, marketCountryName, marketsOrdered } from '@indus/domain'
import { JsonLd } from '@indus/ui'
import { ORG_ID, SITE_NAME, pageMetadata, urlFor } from '../../../lib/seo'

/*
  This used to name five markets — "Saudi Arabia, Oman, Qatar, Bahrain and
  Kuwait" — and the closing paragraph then said anything outside "these five"
  was quoted case by case, while the body linked 126 destinations. The index
  contradicted every market page it links to, which is the sort of thing a
  buyer notices on the page that is supposed to establish that we do this
  routinely. The count is derived so it can never fall out of date again.
*/
const DESCRIPTION =
  'We export hydraulic hose, fittings, adapters, valves and industrial hose from our Dubai warehouse to ' +
  `${MARKETS.length} destinations, with the transit band and the conformity documents stated per market rather than quoted case by case.`

export const metadata = pageMetadata({
  title: 'Export Markets — Hydraulic & Industrial Hose Supplied from Dubai',
  description: DESCRIPTION,
  path: '/markets',
})

/**
 * Export-market index.
 *
 * Kept separate from /locations on purpose. A service area is somewhere a van
 * goes; a market is somewhere a crate goes. Merging them would imply premises
 * abroad that do not exist.
 */
export default function MarketsPage() {
  const markets = marketsOrdered()

  return (
    <div className="mx-auto w-full max-w-[1180px] px-6">
      <JsonLd
        data={[
          buildServiceLd({
            name: 'Export supply of hydraulic and industrial hose from Dubai',
            description: DESCRIPTION,
            url: urlFor('/markets'),
            areaServed: markets.map((m) => ({ name: marketCountryName(m), type: 'Country' as const })),
            providerId: ORG_ID,
            providerName: SITE_NAME,
            serviceType: 'Export supply of hydraulic and industrial hose, fittings and adapters',
          }),
          buildBreadcrumbLd({
            items: [
              { name: 'Home', url: urlFor('/') },
              { name: 'Export markets', url: urlFor('/markets') },
            ],
          }),
        ]}
      />

      <nav className="mono flex items-center gap-2 pt-8 text-[12px] text-ih-muted">
        <Link href="/" className="hover:text-ih-ink">Home</Link>
        <span className="opacity-40">/</span>
        <span className="text-ih-ink">Export markets</span>
      </nav>

      <header className="max-w-[760px] py-8">
        <p className="mono mb-3 text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
          Export from Dubai
        </p>
        <h1 className="mb-4 font-serif text-[clamp(30px,4.5vw,46px)] font-normal leading-[1.1] tracking-[-0.02em]">
          Export markets
        </h1>
        <p className="text-[17px] leading-[1.6] text-ih-muted">{DESCRIPTION}</p>
      </header>

      <div className="grid grid-cols-1 gap-3 pb-10 sm:grid-cols-2 lg:grid-cols-3">
        {markets.map((m) => (
          <Link
            key={m.slug}
            href={`/markets/${m.slug}`}
            className="group flex flex-col rounded-lg border border-ih-border bg-ih-surface p-5 transition-colors hover:border-ih-accent"
          >
            <p className="mono mb-2 text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
              {m.leadTime}
            </p>
            <p className="mb-2 text-[18px] font-semibold tracking-[-0.01em] group-hover:text-ih-accent">
              {m.name}
            </p>
            <p className="text-[14px] leading-[1.55] text-ih-muted">{m.summary}</p>
          </Link>
        ))}
      </div>

      <section className="border-t border-ih-border py-8">
        <p className="max-w-[720px] text-[14.5px] leading-[1.6] text-ih-muted">
          Everything ships from the same Dubai warehouse, so a mixed order travels as one
          consignment under one set of documents — see{' '}
          <Link href="/shipping" className="underline hover:text-ih-ink">
            shipping and lead times
          </Link>
          . For on-site hose service inside the UAE, see{' '}
          <Link href="/locations" className="underline hover:text-ih-ink">
            our service areas
          </Link>
          .
        </p>
      </section>
    </div>
  )
}
