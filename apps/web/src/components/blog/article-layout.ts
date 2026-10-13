import type { BlogBlock } from '@indus/domain'

/**
 * Where each block of an article renders, for the article page layout.
 *
 * The body runs in source order, except for the "foot" blocks:
 *
 *   - the FIRST `key_takeaways` and the FIRST `as_of_stamp` lift to the top of
 *     the reading column, as the "At a glance" panel. Any further ones stay
 *     inline where the author put them.
 *   - EVERY `category_link`, `related_articles`, `market_reach` and
 *     `cta_block` gathers into "What next" at the foot.
 *
 * Indexes, not blocks, so the renderer can skip exactly these positions and
 * render everything else untouched. Presentation only: no block is dropped,
 * and every link these blocks carry still renders, just elsewhere.
 */
export type ArticleLayout = {
  takeaways: number | null
  stamp: number | null
  categoryLinks: number[]
  related: number[]
  markets: number[]
  ctas: number[]
  /** Every index rendered outside the body. */
  skip: ReadonlySet<number>
}

export function layoutArticle(blocks: readonly BlogBlock[]): ArticleLayout {
  let takeaways: number | null = null
  let stamp: number | null = null
  const categoryLinks: number[] = []
  const related: number[] = []
  const markets: number[] = []
  const ctas: number[] = []

  blocks.forEach((block, i) => {
    switch (block.type) {
      case 'key_takeaways':
        if (takeaways === null) takeaways = i
        break
      case 'as_of_stamp':
        if (stamp === null) stamp = i
        break
      case 'category_link':
        categoryLinks.push(i)
        break
      case 'related_articles':
        related.push(i)
        break
      case 'market_reach':
        markets.push(i)
        break
      case 'cta_block':
        ctas.push(i)
        break
    }
  })

  const skip = new Set<number>([...categoryLinks, ...related, ...markets, ...ctas])
  if (takeaways !== null) skip.add(takeaways)
  if (stamp !== null) skip.add(stamp)

  return { takeaways, stamp, categoryLinks, related, markets, ctas, skip }
}

/** Two-digit step numbers, renumbered over the steps that actually render. */
export function stepNumber(i: number): string {
  return String(i + 1).padStart(2, '0')
}
