import Link from 'next/link'
import { MARKET_SECTOR_SHOTS, type MarketSector } from '@indus/domain'
import MarketFigure from './MarketFigure'

export type MarketBrand = { slug: string; name: string }

/** A sector card's photograph — the linked industry page's hero. */
export type MarketSectorImage = { url: string; alt: string }

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
  sectorImages = {},
}: {
  sectors: readonly MarketSector[]
  brands: MarketBrand[]
  marketName: string
  /** Industry hero photographs keyed by sector slug; a missing key keeps the placeholder. */
  sectorImages?: Record<string, MarketSectorImage>
}) {
  return (
    <section className="border-ih-border bg-ih-surface border-t px-5 py-14 sm:px-8 lg:px-12 lg:py-16">
      <div className="mx-auto max-w-[1440px]">
        <p className="mono text-ih-muted text-[10px] tracking-[0.14em] uppercase">Industries</p>
        <h2 className="mt-3 mb-6 font-serif text-[26px] leading-[1.12] sm:text-[32px]">
          Who we supply in {marketName}
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sectors.map((sector) => (
            <Link
              key={sector.slug}
              href={`/industries/${sector.slug}`}
              className="group border-ih-border bg-ih-surface hover:border-ih-accent flex flex-col overflow-hidden rounded-lg border transition-colors"
            >
              <MarketFigure
                src={sectorImages[sector.slug]?.url ?? null}
                // The industry hero's own alt — it describes the photograph, and
                // never names this market: one picture serves all 126 pages.
                alt={sectorImages[sector.slug]?.alt}
                label={MARKET_SECTOR_SHOTS[sector.slug]}
                ratio="aspect-[16/9]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 437px"
                className="border-ih-border border-b"
              />
              <div className="flex flex-1 flex-col gap-2.5 px-5 pt-5 pb-5 sm:px-6">
                {/* `oil-gas` reads as "OIL · GAS" — the hyphen is a slug
                    artefact, and a middot is how the rest of the page separates
                    paired terms. */}
                <span className="mono text-ih-muted-2 text-[9.5px] tracking-[0.12em] uppercase">
                  {sector.slug.replace(/-/g, ' · ')}
                </span>
                <h3 className="group-hover:text-ih-accent text-[19px] leading-[1.25] font-medium tracking-[-0.01em]">
                  {sector.name} in {marketName}
                </h3>
                <p className="text-ih-muted text-[13px] leading-[1.6]">{sector.description}</p>
                <span className="text-ih-accent mt-1 flex items-center gap-1.5 text-[13px]">
                  Industry page <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>

        {brands.length > 0 && (
          <div className="border-ih-border mt-9 border-t pt-6">
            <p className="mono text-ih-muted mb-3.5 text-[10px] tracking-[0.14em] uppercase">
              Brands stocked for {marketName}
            </p>
            <ul className="flex list-none flex-wrap gap-2 p-0">
              {brands.map((brand) => (
                <li key={brand.slug}>
                  <Link
                    href={`/brands/${brand.slug}`}
                    className="mono border-ih-border bg-ih-surface text-ih-ink-2 hover:border-ih-accent hover:text-ih-accent inline-flex h-8 items-center rounded-sm border px-3 text-[11.5px] transition-colors"
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
