import type { MarketReachBlock } from '@indus/domain'
import MarketReachSection from '../../markets/MarketReachSection'

/**
 * The blog's stored reach section.
 *
 * Thin on purpose: the drawing lives in `MarketReachSection`, shared with
 * service cases and industry pages. All this adds is the live-link gate, which
 * only the blog needs — its section is composed into `bodyBlocks` at import,
 * so a market renamed afterwards is still named in the stored block and has to
 * be dropped here. The other two surfaces build theirs from the live market
 * set at request time.
 *
 * Same rule as every other link block: a market that no longer resolves leaves
 * a shorter row, a row that empties disappears, and a section whose rows all
 * empty renders nothing. A gap, never a 404.
 */
export default function MarketReachBlockView({
  block,
  livePageLinks,
}: {
  block: MarketReachBlock
  livePageLinks: Set<string>
}) {
  const liveMarketSlugs = new Set(
    block.groups
      .flatMap((g) => g.markets.map((m) => m.slug))
      .filter((slug) => livePageLinks.has(`market:${slug}`))
  )

  return (
    <MarketReachSection
      reach={{
        heading: block.heading,
        body: block.body,
        groups: block.groups,
        footnote: block.footnote ?? '',
      }}
      variant="article"
      liveMarketSlugs={liveMarketSlugs}
    />
  )
}
