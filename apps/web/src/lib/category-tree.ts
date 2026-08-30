import { unstable_cache } from 'next/cache'
import { db } from '@indus/db'
import { STOREFRONT_TAGS } from './cache-tags'

/** The columns the walks need. Nothing else is fetched. */
export type CategoryNode = {
  id: string
  slug: string
  name: string
  parentId: string | null
  isPublished: boolean
}

/**
 * Walking the category tree without a query per level.
 *
 * The shelf page used to climb to the root with one `findUnique` per ancestor,
 * and descend with one `findMany` per level — six or seven sequential round
 * trips before the first product query. Beside the database that cost ~25 ms
 * and nobody noticed. From a European host it is most of a second, every time,
 * on a table of 195 rows that changes when someone edits a category.
 *
 * So the tree is fetched once and walked in memory. These functions are pure so
 * the walking can be tested without a database — the loops they replace had the
 * cycle and depth handling that is easiest to get wrong.
 */

/** Depth ceiling. Not a fact about the data — a guard against a cycle. */
const MAX_WALK = 8

/**
 * Root-first path to `id`, inclusive.
 *
 * Includes unpublished ancestors on purpose: the breadcrumb reflects where a
 * category sits, and hiding a rung would silently reparent it in the reader's
 * eyes. Whether each is published travels with it so the caller can decide.
 */
export function ancestorTrail(
  byId: ReadonlyMap<string, CategoryNode>,
  id: string,
): Array<{ name: string; slug: string; isPublished: boolean }> {
  const trail: Array<{ name: string; slug: string; isPublished: boolean }> = []
  const seen = new Set<string>()
  let cursor: string | null = id

  for (let depth = 0; cursor && depth < MAX_WALK; depth++) {
    // A cycle is not hypothetical: parentId is editable from the admin tree,
    // and a self-parent or a loop would spin the old version until the depth
    // cap saved it. Stopping on a repeat is cheaper and states the intent.
    if (seen.has(cursor)) break
    seen.add(cursor)

    const node = byId.get(cursor)
    if (!node) break
    trail.unshift({ name: node.name, slug: node.slug, isPublished: node.isPublished })
    cursor = node.parentId
  }
  return trail
}

/**
 * `rootId` plus every published category beneath it.
 *
 * Unpublished branches are cut entirely — their children do not come back
 * through another route — which matches the query this replaces, where each
 * level's `findMany` filtered on `isPublished`.
 *
 * The root itself is always included even when unpublished, because the caller
 * has already decided the page is worth rendering.
 */
export function descendantIds(
  children: ReadonlyMap<string, readonly CategoryNode[]>,
  rootId: string,
): string[] {
  const out: string[] = [rootId]
  const seen = new Set<string>([rootId])
  let frontier: string[] = [rootId]

  for (let depth = 0; depth < MAX_WALK && frontier.length > 0; depth++) {
    const next: string[] = []
    for (const parent of frontier) {
      for (const child of children.get(parent) ?? []) {
        if (!child.isPublished || seen.has(child.id)) continue
        seen.add(child.id)
        out.push(child.id)
        next.push(child.id)
      }
    }
    frontier = next
  }
  return out
}

/** Index a flat list into the two shapes the walks need. */
export function indexTree(nodes: readonly CategoryNode[]): {
  byId: Map<string, CategoryNode>
  children: Map<string, CategoryNode[]>
} {
  const byId = new Map<string, CategoryNode>()
  const children = new Map<string, CategoryNode[]>()
  for (const node of nodes) {
    byId.set(node.id, node)
    if (node.parentId) {
      const siblings = children.get(node.parentId)
      if (siblings) siblings.push(node)
      else children.set(node.parentId, [node])
    }
  }
  return { byId, children }
}

/**
 * The whole category tree, once per request and shared across requests.
 *
 * 195 rows of five columns. Fetching it entire costs one round trip, against
 * the six or seven the per-level walks used, and the tag is already purged by
 * `invalidateCategories()` on every category edit — so this is no staler than
 * the queries it replaces.
 */
export const getCategoryTree = unstable_cache(
  async () => {
    const rows = await db.category.findMany({
      select: { id: true, slug: true, name: true, parentId: true, isPublished: true },
    })
    return rows
  },
  ['category-tree'],
  { revalidate: 3600, tags: [STOREFRONT_TAGS.categories] },
)
