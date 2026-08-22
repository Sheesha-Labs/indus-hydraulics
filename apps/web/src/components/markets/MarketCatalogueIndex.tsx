import Link from 'next/link'
import { Badge, Button } from '@indus/ui'
import MarketFigure from './MarketFigure'

export type CatalogueSubRange = { slug: string; name: string }

/**
 * Sub-range count at which a cluster card spans both columns.
 *
 * Exported because `lib/market-catalogue.ts` sorts wide clusters to the front
 * and has to agree with the card about which ones those are — two independent
 * copies of "20" is exactly the pair that drifts.
 */
export const WIDE_CARD_THRESHOLD = 20

export type CatalogueCluster = {
  slug: string
  name: string
  description: string | null
  /** Resolved from `Category.image`; null renders the labelled placeholder. */
  imageUrl: string | null
  imageAlt: string
  subRanges: CatalogueSubRange[]
}

/**
 * The catalogue index — the section that earns the ranking.
 *
 * Every cluster heading and every sub-range link carries "in {Country}", which
 * is where this page's second query shape ("SS316L JIC 37° fittings in
 * Nigeria") is served. It sits above the mid-page form rather than below the
 * FAQ so the crawler meets the link mass early and the reader hits the form at
 * peak intent.
 *
 * BUILT FROM THE LIVE CATEGORY TREE, NOT FROM A LIST. The design handoff ships
 * a frozen snapshot of 14 clusters and 157 sub-ranges; the tree in the
 * database is already at 168 and moves every time the catalogue does. A page
 * that promises ranges we have retired, or omits ones we have added, is worse
 * than one that recounts itself on every build — so the counts in the kicker
 * and the badges are computed, never written.
 *
 * URL CONTRACT: sub-ranges point at the global `/c/{slug}` pages. The
 * alternative — market-scoped `/markets/nigeria/{slug}` — multiplies the page
 * count fourteenfold per market (over 1,700 pages across the built markets)
 * and every one of them needs enough unique content not to be thin. The anchor
 * text still carries the country, which is where most of the value is. Moving
 * to market-scoped URLs is a content-plan decision, not a routing change.
 */
export default function MarketCatalogueIndex({
  clusters,
  marketName,
}: {
  clusters: CatalogueCluster[]
  marketName: string
}) {
  const subRangeTotal = clusters.reduce((sum, c) => sum + c.subRanges.length, 0)

  return (
    <section className="border-b border-ih-border bg-ih-bg px-5 py-14 sm:px-8 lg:px-12 lg:py-16">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
          <div>
            <p className="mono text-[10px] uppercase tracking-[0.14em] text-ih-muted">
              Catalogue · {clusters.length} clusters · {subRangeTotal} ranges
            </p>
            <h2 className="mt-3.5 font-serif text-[30px] leading-[1.08] sm:text-[40px]">
              What we supply to {marketName}
            </h2>
          </div>
          <Button asChild kind="outline">
            <Link href="/c">
              Browse the full catalogue <span aria-hidden="true">→</span>
            </Link>
          </Button>
        </div>

        <p className="mb-8 mt-3 max-w-[780px] text-[15px] leading-[1.6] text-ih-muted">
          Everything below ships from the same Dubai warehouse, so a mixed order travels as one
          consignment under one set of documents. Follow any heading through to the full range,
          specifications and an RFQ.
        </p>

        {/*
          `grid-flow-dense` is load-bearing. The two largest clusters span both
          columns, and without dense packing the single-column cards after them
          leave holes rather than back-filling.
        */}
        <div className="grid grid-flow-dense grid-cols-1 gap-4 lg:grid-cols-2">
          {clusters.map((cluster, index) => (
            <ClusterCard
              key={cluster.slug}
              cluster={cluster}
              index={index}
              marketName={marketName}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * Span and link-column count are computed from the child count, not authored:
 *
 *   ≥ 20 children → full width, four link columns
 *   8–19          → one column, two link columns
 *   < 8           → one column, one link column
 *
 * Which means a cluster that grows past twenty ranges widens itself, and the
 * layout cannot fall out of step with the catalogue.
 */
function ClusterCard({
  cluster,
  index,
  marketName,
}: {
  cluster: CatalogueCluster
  index: number
  marketName: string
}) {
  const count = cluster.subRanges.length
  const wide = count >= WIDE_CARD_THRESHOLD

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-lg border border-ih-border bg-ih-surface transition-colors hover:border-ih-accent ${
        wide ? 'lg:col-span-2' : ''
      }`}
    >
      <MarketFigure
        src={cluster.imageUrl}
        alt={cluster.imageUrl ? cluster.imageAlt : undefined}
        label={cluster.name}
        // A letterbox strip flush to the card top. Frame shots so the subject
        // survives a 152px band — a hose coil reads well, a tall valve does not.
        ratio="h-[152px]"
        sizes={wide ? '(max-width: 1024px) 100vw, 1344px' : '(max-width: 1024px) 100vw, 664px'}
        className="shrink-0 border-b border-ih-border"
      />

      <div className="flex flex-1 flex-col px-5 pb-3 pt-5 sm:px-6">
        <div className="flex items-baseline gap-2.5">
          <span className="mono text-[10.5px] tracking-[0.06em] text-ih-muted-2">
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3 className="flex-1 text-[17.5px] font-medium leading-[1.25] tracking-[-0.01em]">
            <Link href={`/c/${cluster.slug}`} className="hover:text-ih-accent">
              {cluster.name} supplier in {marketName}
            </Link>
          </h3>
          {count > 0 && (
            <Badge kind="steel" square>
              {count}
            </Badge>
          )}
        </div>

        {cluster.description && (
          <p className="mt-2 max-w-[760px] text-[12.5px] leading-[1.55] text-ih-muted">
            {cluster.description}
          </p>
        )}

        {count > 0 && (
          <div
            className={`mt-4 border-t border-ih-border pt-2 ${
              wide
                ? 'columns-1 gap-x-[26px] sm:columns-2 lg:columns-4'
                : count >= 8
                  ? 'columns-1 gap-x-[26px] sm:columns-2'
                  : 'columns-1'
            }`}
          >
            {cluster.subRanges.map((range) => (
              <Link
                key={range.slug}
                href={`/c/${range.slug}`}
                className="block break-inside-avoid border-b border-dotted border-ih-border py-[5px] text-[12.5px] text-ih-ink-2 transition-colors hover:text-ih-accent"
              >
                {range.name} in {marketName}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
