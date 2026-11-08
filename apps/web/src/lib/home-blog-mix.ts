/**
 * Which articles the home page's blog mosaic shows.
 *
 * The newest article from each topic, newest first — not simply the newest
 * N. Articles land in waves (fourteen anchor-chain posts were published on a
 * single day), so "latest nine" would routinely be nine variations on one
 * subject; one per topic shows how wide the writing is. When there are fewer
 * topics than tiles, the remaining slots fall back to the next-newest
 * articles regardless of topic, so the grid is never short.
 *
 * Input is expected newest first. Pure, so the rule is testable.
 */
export type BlogMixCandidate = { id: string; categoryId: string | null }

export function pickBlogMix<T extends BlogMixCandidate>(newestFirst: readonly T[], count: number): T[] {
  const picked: T[] = []
  const seenTopics = new Set<string>()
  const pickedIds = new Set<string>()

  for (const post of newestFirst) {
    if (picked.length >= count) break
    const topic = post.categoryId ?? `__none:${post.id}`
    if (seenTopics.has(topic)) continue
    seenTopics.add(topic)
    picked.push(post)
    pickedIds.add(post.id)
  }

  for (const post of newestFirst) {
    if (picked.length >= count) break
    if (pickedIds.has(post.id)) continue
    picked.push(post)
    pickedIds.add(post.id)
  }

  // Keep the newest-first order across both passes, so the lead tile is
  // always the most recent article on the grid.
  const rank = new Map(newestFirst.map((post, index) => [post.id, index]))
  return picked.sort((a, b) => rank.get(a.id)! - rank.get(b.id)!)
}
