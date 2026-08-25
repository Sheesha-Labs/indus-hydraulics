import Link from 'next/link'
import type { MarketReachBlock } from '@indus/domain'

/**
 * "Where we deliver this" — the delivery-reach section that closes an article.
 *
 * Rendered as one aside with prose and four rows of inline country links,
 * rather than as a stack of `page_link` cards. That is the whole design
 * decision: twelve cards at the foot of every article is link mass with no
 * argument carrying it, which is the shape of the competitor country pages our
 * own teardown criticises. Twelve names inside a paragraph's worth of context
 * reads as a shipping note, because that is what it is.
 *
 * `livePageLinks` is the same gate every other link block uses. A market that
 * has been renamed drops out of its row; a row that empties disappears; a
 * block whose rows all empty renders nothing. A short section, never a 404.
 */
export default function MarketReachBlockView({
  block,
  livePageLinks,
}: {
  block: MarketReachBlock
  livePageLinks: Set<string>
}) {
  const groups = block.groups
    .map((group) => ({
      region: group.region,
      markets: group.markets.filter((m) => livePageLinks.has(`market:${m.slug}`)),
    }))
    .filter((group) => group.markets.length > 0)

  if (groups.length === 0) return null

  return (
    <aside className="border-ih-border bg-ih-surface-2 my-8 rounded-lg border px-5 py-5">
      <p className="mono text-ih-muted mb-1.5 text-[10.5px] uppercase tracking-[0.12em]">
        Delivery
      </p>
      <h2 className="text-ih-ink m-0 font-sans text-[19px] font-semibold leading-[1.25] tracking-[-0.01em]">
        {block.heading}
      </h2>
      <p className="text-ih-muted mt-2.5 text-[14.5px] leading-[1.6]">{block.body}</p>

      {/*
        Label above list, not beside it. Side by side needs a fixed label
        column, and the longest region name — "Central & South-East Europe" —
        measures 272px in the mono eyebrow, nearly half the 780px article
        column. Anything narrower wraps that label to two lines and leaves the
        row ragged against its neighbours.
      */}
      <dl className="border-ih-border mt-4 grid gap-3.5 border-t pt-4 sm:grid-cols-2">
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

      <p className="text-ih-muted mt-5 text-[13.5px] leading-[1.55]">
        {block.footnote}{' '}
        <Link href="/markets" className="text-ih-accent font-medium hover:underline">
          See every export destination
          <span aria-hidden="true"> →</span>
        </Link>
      </p>
    </aside>
  )
}
