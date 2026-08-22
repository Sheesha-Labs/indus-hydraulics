import Link from 'next/link'
import { MARKET_SECTOR_SHOTS, type MarketSector } from '@indus/domain'
import MarketFigure from './MarketFigure'

export type MarketBrand = { slug: string; name: string }

/**
 * Sector cards and the brand strip.
 *
 * SECTOR ORDER IS PER-MARKET AND MEANS SOMETHING. Nigeria leads with Oil & Gas
 * and Marine because that is what buyers there ask for; a mining market leads
 * with Mining. The order comes from the record and is never sorted here — but
 * every one of the six has to work in any grid position, because the same six
 * photographs serve all 126 markets.
 *
 * BRANDS COME FROM THE CATALOGUE, NOT FROM A LIST. The design handoff names 22
 * brands, eight of which we hold no stock of at all. "Brands stocked for
 * Nigeria" is a claim, and the only defensible source for it is the set of
 * brands that actually have published products — which is also why each chip
 * links to its brand page rather than sitting inert.
 */
export default function MarketIndustries({
  sectors,
  brands,
  marketName,
}: {
  sectors: readonly MarketSector[]
  brands: MarketBrand[]
  marketName: string
}) {
  return (
    <section className="border-t border-ih-border bg-ih-surface px-5 py-14 sm:px-8 lg:px-12 lg:py-16">
      <div className="mx-auto max-w-[1440px]">
        <p className="mono text-[10px] uppercase tracking-[0.14em] text-ih-muted">Industries</p>
        <h2 className="mb-6 mt-3 font-serif text-[26px] leading-[1.12] sm:text-[32px]">
          Who we supply in {marketName}
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sectors.map((sector) => (
            <Link
              key={sector.slug}
              href={`/industries/${sector.slug}`}
              className="group flex flex-col overflow-hidden rounded-lg border border-ih-border bg-ih-surface transition-colors hover:border-ih-accent"
            >
              <MarketFigure
                src={null}
                label={MARKET_SECTOR_SHOTS[sector.slug]}
                ratio="aspect-[16/9]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 437px"
                className="border-b border-ih-border"
              />
              <div className="flex flex-1 flex-col gap-2.5 px-5 pb-5 pt-5 sm:px-6">
                {/* `oil-gas` reads as "OIL · GAS" — the hyphen is a slug
                    artefact, and a middot is how the rest of the page separates
                    paired terms. */}
                <span className="mono text-[9.5px] uppercase tracking-[0.12em] text-ih-muted-2">
                  {sector.slug.replace(/-/g, ' · ')}
                </span>
                <h3 className="text-[19px] font-medium leading-[1.25] tracking-[-0.01em] group-hover:text-ih-accent">
                  {sector.name} in {marketName}
                </h3>
                <p className="text-[13px] leading-[1.6] text-ih-muted">{sector.description}</p>
                <span className="mt-1 flex items-center gap-1.5 text-[13px] text-ih-accent">
                  Industry page <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>

        {brands.length > 0 && (
          <div className="mt-9 border-t border-ih-border pt-6">
            <p className="mono mb-3.5 text-[10px] uppercase tracking-[0.14em] text-ih-muted">
              Brands stocked for {marketName}
            </p>
            <ul className="flex list-none flex-wrap gap-2 p-0">
              {brands.map((brand) => (
                <li key={brand.slug}>
                  <Link
                    href={`/brands/${brand.slug}`}
                    className="mono inline-flex h-8 items-center rounded-sm border border-ih-border bg-ih-surface px-3 text-[11.5px] text-ih-ink-2 transition-colors hover:border-ih-accent hover:text-ih-accent"
                  >
                    {brand.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
