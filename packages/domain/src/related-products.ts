/**
 * Which siblings a product page links to.
 *
 * THE PROBLEM THIS SOLVES
 *
 * The product page used to select related products with
 * `findMany({ where: { categoryId }, take: 4 })` and no `orderBy`. Postgres is
 * free to return rows in any order, and in practice returns them in a stable
 * one — so every product in a category linked to the SAME four siblings.
 *
 * That makes the internal link graph a hub and spoke rather than a mesh. Four
 * arbitrary products in each category collect every internal link the category
 * has to give, and the rest collect none. On a site whose problem is that
 * Google will not crawl deep enough to find its products, that is the opposite
 * of what the module should do.
 *
 * THE FIX
 *
 * Order the category deterministically and give each product the siblings that
 * follow it, wrapping at the end. Every product then links forward to the next
 * N and is linked back to by the previous N — a ring in which no product is
 * ever orphaned, and link equity spreads instead of pooling.
 *
 * Deterministic ordering matters for its own sake too: the same page served
 * twice should carry the same links, or every crawl looks like a content
 * change.
 */

/** Products per related block. */
export const RELATED_PRODUCT_COUNT = 8

/**
 * Slugs (or ids — any stable key) of the siblings to link from `current`.
 *
 * `ordered` must already be in a deterministic order and include `current`.
 * Returns at most `count` keys, never includes `current`, and never repeats.
 */
export function relatedProductWindow(
  ordered: readonly string[],
  current: string,
  count: number = RELATED_PRODUCT_COUNT,
): string[] {
  const index = ordered.indexOf(current)

  // A product missing from its own category listing means the two queries
  // disagreed — a draft flipped between them, most likely. Falling back to the
  // head of the list keeps the block populated rather than rendering nothing.
  if (index === -1) return ordered.slice(0, count).filter((s) => s !== current)

  const others = ordered.length - 1
  if (others <= 0) return []

  const take = Math.min(count, others)
  const out: string[] = []
  for (let step = 1; out.length < take; step++) {
    const candidate = ordered[(index + step) % ordered.length]
    if (candidate !== undefined && candidate !== current) out.push(candidate)
  }
  return out
}
