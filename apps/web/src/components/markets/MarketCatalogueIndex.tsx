import Link from 'next/link'
import { Button } from '@indus/ui'
import MarketFigure from './MarketFigure'

export type CatalogueSubRange = { slug: string; name: string }

/**
 * How many sub-range links a card shows before "Show all".
 *
 * The rest are NOT fetched on demand or rendered by script: they sit in the
 * server-rendered HTML inside a native `<details>`, so every link and every
 * string is in the document a crawler reads. Google indexes content in a
 * collapsed disclosure; hiding it from the HTML would not be the same thing.
 */
export const CATALOGUE_VISIBLE_RANGES = 6

/**
 * A card with only one or two more ranges than the visible count shows them
 * all. "Show 1 more" costs a click to reveal less than the button itself.
 */
const COLLAPSE_SLACK = 2

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
 * ALL OF IT IS IN THE HTML; ONLY SOME OF IT IS OPEN. Each card shows its first
 * few sub-ranges and keeps the rest in a `<details>` the reader opens. Until
 * 2026-10 every link was always open and the section ran to ~5,500px — 40% of
 * the page — with category photographs cropped into 9:1 letterbox strips to
 * keep the cards short. Collapsing the long tail is what lets the photograph
 * be a photograph.
 *
 * BUILT FROM THE LIVE CATEGORY TREE, NOT FROM A LIST. The counts in the kicker
 * and the badges are computed, never written, so the page cannot promise
 * ranges we have retired or omit ones we have added.
 *
 * URL CONTRACT: sub-ranges point at the global `/c/{slug}` pages. The
 * alternative — market-scoped `/markets/nigeria/{slug}` — multiplies the page
 * count by the number of ranges per market and every one of them needs enough
 * unique content not to be thin. The anchor text still carries the country,
 * which is where most of the value is.
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
          consignment under one set of documents. Open any card for its full list of ranges, or
          follow a heading through to specifications and an RFQ.
        </p>

        {/*
          `items-start` is load-bearing: opening one card must not stretch the
          other cards in its row to match.
        */}
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
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
  const collapses = count > CATALOGUE_VISIBLE_RANGES + COLLAPSE_SLACK
  const shown = collapses ? cluster.subRanges.slice(0, CATALOGUE_VISIBLE_RANGES) : cluster.subRanges
  const rest = collapses ? cluster.subRanges.slice(CATALOGUE_VISIBLE_RANGES) : []

  return (
    <article className="group/card @container flex flex-col rounded-lg border border-ih-border bg-ih-surface transition-colors hover:border-ih-accent">
      <div className="flex gap-4 px-5 pt-5 sm:px-6">
        {/*
          A 4:3 thumbnail beside the heading, not a strip across the card. The
          category photographs are 3:2 studio shots of a group of parts; 4:3
          keeps nearly all of the frame, where the old 152px letterbox kept a
          ninth of it.
        */}
        <MarketFigure
          src={cluster.imageUrl}
          alt={cluster.imageUrl ? cluster.imageAlt : undefined}
          label={cluster.name}
          ratio="aspect-[4/3]"
          sizes="(max-width: 640px) 112px, 136px"
          className="w-[112px] shrink-0 rounded-md border border-ih-border sm:w-[136px]"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <span className="mono pt-[3px] text-[10.5px] tracking-[0.06em] text-ih-muted-2">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="flex-1 text-[16.5px] font-medium leading-[1.25] tracking-[-0.01em]">
              <Link href={`/c/${cluster.slug}`} className="hover:text-ih-accent">
                {cluster.name} supplier in {marketName}
              </Link>
            </h3>
          </div>
          {count > 0 && (
            <p className="mono mt-2 text-[10.5px] uppercase tracking-[0.1em] text-ih-muted-2">
              {count} {count === 1 ? 'range' : 'ranges'}
            </p>
          )}
        </div>
      </div>

      {cluster.description && (
        // Clamped to three lines until the card is opened. The full text is in
        // the HTML either way — the clamp is paint, not omission.
        <p className="mt-3 line-clamp-3 px-5 text-[12.5px] leading-[1.55] text-ih-muted group-has-[details[open]]/card:line-clamp-none sm:px-6">
          {cluster.description}
        </p>
      )}

      {count > 0 && (
        <div className="mt-4 flex-1 border-t border-ih-border px-5 pb-1 sm:px-6">
          <RangeList ranges={shown} marketName={marketName} />

          {rest.length > 0 && (
            <details className="group/more">
              <summary
                className="flex cursor-pointer list-none items-center justify-between gap-3 border-t border-ih-border py-3 text-[12.5px] font-medium text-ih-accent marker:content-none hover:text-ih-ink [&::-webkit-details-marker]:hidden"
              >
                <span>
                  <span className="group-open/more:hidden">
                    Show all {count} {cluster.name} ranges
                  </span>
                  <span className="hidden group-open/more:inline">Show fewer</span>
                </span>
                <span
                  aria-hidden="true"
                  className="mono text-[14px] leading-none transition-transform group-open/more:rotate-45"
                >
                  +
                </span>
              </summary>
              <RangeList ranges={rest} marketName={marketName} />
            </details>
          )}
        </div>
      )}
    </article>
  )
}

/**
 * One column in a narrow card, two once the card is wide enough to hold them
 * — measured on the card (`@container`), not the viewport, because the grid
 * puts the same card in one, two or three columns.
 */
function RangeList({ ranges, marketName }: { ranges: CatalogueSubRange[]; marketName: string }) {
  return (
    <ul className="list-none columns-1 gap-x-6 p-0 @[34rem]:columns-2">
      {ranges.map((range) => (
        <li key={range.slug} className="break-inside-avoid">
          <Link
            href={`/c/${range.slug}`}
            className="block border-b border-dotted border-ih-border py-[6px] text-[12.5px] text-ih-ink-2 transition-colors hover:text-ih-accent"
          >
            {range.name} in {marketName}
          </Link>
        </li>
      ))}
    </ul>
  )
}
