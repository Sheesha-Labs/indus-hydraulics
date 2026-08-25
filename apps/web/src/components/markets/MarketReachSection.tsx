import Link from 'next/link'
import type { MarketReach } from '@indus/domain'

/**
 * "Where we deliver this" — one presentational component for every surface
 * that renders a reach section.
 *
 * Three callers, two shapes:
 *
 *   `article` — a bordered aside inside a ~780px reading column. Blog articles
 *   and service cases. It has to look like a note attached to the argument it
 *   follows, which is what the border and the tinted ground do.
 *
 *   `section` — a full-width band on a marketing template. Industry pages,
 *   whose sections run to `max-w-[1440px]`; the aside treatment at that width
 *   is a very long grey box with four short lines in it. The band splits the
 *   paragraph off to the left and lets the regions run as columns.
 *
 * Rendered as prose plus inline country links rather than as a stack of link
 * cards, on every surface. That is the design decision the whole feature turns
 * on: twelve cards at the foot of a page is link mass with no argument
 * carrying it, which is the shape of the competitor country pages our own
 * teardown criticises. Twelve names inside a paragraph's worth of context
 * reads as a shipping note, because that is what it is.
 */
export default function MarketReachSection({
  reach,
  variant = 'article',
  /**
   * Markets to keep. Only the blog passes this: its section is stored in
   * `bodyBlocks`, so a market renamed after the block was written has to be
   * dropped at render. Service cases and industry pages build theirs from the
   * live market set at request time and have nothing to filter.
   */
  liveMarketSlugs,
}: {
  reach: MarketReach
  variant?: 'article' | 'section'
  liveMarketSlugs?: Set<string>
}) {
  const groups = (
    liveMarketSlugs
      ? reach.groups.map((g) => ({
          ...g,
          markets: g.markets.filter((m) => liveMarketSlugs.has(m.slug)),
        }))
      : reach.groups
  ).filter((g) => g.markets.length > 0)

  if (groups.length === 0) return null

  const regions = (
    <dl
      className={
        variant === 'section'
          ? 'grid gap-x-8 gap-y-5 sm:grid-cols-2'
          : 'border-ih-border mt-4 grid gap-3.5 border-t pt-4 sm:grid-cols-2'
      }
    >
      {groups.map((group) => (
        <div key={group.region}>
          <dt className="mono text-ih-muted text-[10.5px] uppercase tracking-[0.12em]">
            {group.region}
          </dt>
          <dd className="text-ih-ink m-0 mt-1 text-[14px] leading-[1.55]">
            {group.markets.map((market, i) => (
              <span key={market.slug}>
                {i > 0 && <span className="text-ih-muted">, </span>}
                <Link
                  href={`/markets/${market.slug}`}
                  className="text-ih-ink hover:text-ih-accent underline underline-offset-[3px] transition-colors"
                >
                  {market.name}
                </Link>
              </span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  )

  const footnote = (
    <p className="text-ih-muted text-[13.5px] leading-[1.55]">
      {reach.footnote}{' '}
      <Link href="/markets" className="text-ih-accent font-medium hover:underline">
        See every export destination
        <span aria-hidden="true"> →</span>
      </Link>
    </p>
  )

  if (variant === 'section') {
    return (
      <section className="border-ih-border border-t py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-16">
          <div>
            <p className="mono text-ih-muted mb-2 text-[10.5px] uppercase tracking-[0.12em]">
              Delivery
            </p>
            <h2 className="text-ih-ink m-0 font-sans text-[28px] font-semibold leading-[1.15] tracking-[-0.02em]">
              {reach.heading}
            </h2>
          </div>
          <div>
            {/* Capped rather than filling the column: the right-hand cell runs
                to ~860px at 1440, which is ~110 characters a line. */}
            <p className="text-ih-ink-2 mb-6 max-w-[720px] text-[15px] leading-[1.6]">
              {reach.body}
            </p>
            {regions}
            <div className="mt-6">{footnote}</div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <aside className="border-ih-border bg-ih-surface-2 my-8 rounded-lg border px-5 py-5">
      <p className="mono text-ih-muted mb-1.5 text-[10.5px] uppercase tracking-[0.12em]">
        Delivery
      </p>
      <h2 className="text-ih-ink m-0 font-sans text-[19px] font-semibold leading-[1.25] tracking-[-0.01em]">
        {reach.heading}
      </h2>
      <p className="text-ih-muted mt-2.5 text-[14.5px] leading-[1.6]">{reach.body}</p>
      {regions}
      <div className="mt-5">{footnote}</div>
    </aside>
  )
}
