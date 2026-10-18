import Link from 'next/link'
import type { MarketReachBlock } from '@indus/domain'

/**
 * The blog's stored reach section — "where we deliver this".
 *
 * Its own view rather than `MarketReachSection`, which service cases and
 * industry pages share: the article redesign sets this as a step in "What
 * next", with region columns and inline country links, and those surfaces keep
 * their aside and band treatments.
 *
 * Still prose plus inline country links, never a stack of link cards — twelve
 * names inside a paragraph of context reads as a shipping note, which is what
 * it is. Same live-link gate as before: the section is composed into
 * `bodyBlocks` at import, so a market renamed afterwards is dropped here. A
 * market that no longer resolves leaves a shorter row, a row that empties
 * disappears, and a section whose rows all empty renders nothing.
 */
export function liveMarketGroups(block: MarketReachBlock, livePageLinks: Set<string>) {
  return block.groups
    .map((g) => ({ ...g, markets: g.markets.filter((m) => livePageLinks.has(`market:${m.slug}`)) }))
    .filter((g) => g.markets.length > 0)
}

export default function MarketReachBlockView({
  block,
  livePageLinks,
  variant = 'inline',
}: {
  block: MarketReachBlock
  livePageLinks: Set<string>
  /** `step`: inside "What next", where the heading is the step title. */
  variant?: 'inline' | 'step'
}) {
  const groups = liveMarketGroups(block, livePageLinks)
  if (groups.length === 0) return null

  const step = variant === 'step'

  return (
    <section aria-label={block.heading} className="min-w-0">
      {step ? (
        <h3 className="text-[15px] font-semibold text-ih-ink">{block.heading}</h3>
      ) : (
        <>
          <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">Delivery</p>
          <h2 className="mt-2 font-serif text-[28px] font-normal leading-[1.12] tracking-[-0.01em] text-ih-ink">
            {block.heading}
          </h2>
        </>
      )}
      <p className={`max-w-[720px] text-[14.5px] leading-[1.65] text-ih-ink-2 ${step ? 'mt-3' : 'mt-2.5'}`}>
        {block.body}
      </p>
      <div
        className={`mt-5 grid grid-cols-1 gap-x-6 gap-y-[18px] ${
          step ? 'min-[761px]:grid-cols-4' : 'min-[761px]:grid-cols-2'
        }`}
      >
        {groups.map((group) => (
          <div key={group.region} className="min-w-0">
            <h3 className="font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-ih-muted">
              {group.region}
            </h3>
            <ul className="m-0 mt-1 flex list-none flex-wrap gap-x-3.5 p-0">
              {group.markets.map((market) => (
                <li key={market.slug}>
                  <Link
                    href={`/markets/${market.slug}`}
                    className="inline-flex min-h-9 items-center text-[14px] text-ih-accent hover:underline hover:underline-offset-[3px]"
                  >
                    {market.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[13px] leading-[1.6] text-ih-muted">
        {block.footnote ? `${block.footnote} ` : ''}
        <Link href="/markets" className="font-medium text-ih-accent hover:underline">
          See every export destination
          <span aria-hidden="true"> →</span>
        </Link>
      </p>
    </section>
  )
}
