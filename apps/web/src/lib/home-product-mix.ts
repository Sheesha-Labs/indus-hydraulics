/**
 * The home page's product sample: one product from each of several
 * different top-level categories, chosen at random.
 *
 * It replaced "the four newest products", which in practice meant four rows
 * from whichever import ran last — usually four near-identical sizes of one
 * range — and said nothing about how wide the catalogue is. A spread across
 * categories does, and labelling each tile with its category makes the
 * spread legible at a glance.
 *
 * Random, but not per request. The caller runs this inside an hourly
 * `unstable_cache`, so the home page stays a static, cached page and the mix
 * changes each time that cache refreshes. A per-request shuffle would make
 * the page dynamic, which is exactly what the rest of the home page has been
 * engineered to avoid.
 *
 * Kept pure (random source injected) so the rules are testable:
 *   - only products whose category rolls up to a PUBLISHED root;
 *   - at most one product per root, so no category appears twice;
 *   - roots are drawn at random, then a product at random within each.
 */

export type MixCategory = { id: string; parentId: string | null; isPublished: boolean }
export type MixCandidate = { id: string; categoryId: string | null }
export type MixPick = { productId: string; rootId: string }

/** Walk up to the top-level ancestor. Bounded against a malformed cycle. */
function rootOf(byId: ReadonlyMap<string, MixCategory>, categoryId: string): MixCategory | null {
  let node = byId.get(categoryId) ?? null
  for (let depth = 0; node && node.parentId && depth < 16; depth++) {
    node = byId.get(node.parentId) ?? null
  }
  return node
}

/** Fisher–Yates on a copy, driven by the supplied random source. */
function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

export function pickProductMix(
  candidates: readonly MixCandidate[],
  categories: readonly MixCategory[],
  count: number,
  random: () => number = Math.random,
): MixPick[] {
  const byId = new Map(categories.map((c) => [c.id, c]))
  const byRoot = new Map<string, string[]>()

  for (const candidate of candidates) {
    if (!candidate.categoryId) continue
    const root = rootOf(byId, candidate.categoryId)
    if (!root || !root.isPublished) continue
    const list = byRoot.get(root.id)
    if (list) list.push(candidate.id)
    else byRoot.set(root.id, [candidate.id])
  }

  return shuffled([...byRoot.keys()], random)
    .slice(0, count)
    .map((rootId) => {
      const ids = byRoot.get(rootId)!
      return { rootId, productId: ids[Math.floor(random() * ids.length)]! }
    })
}
