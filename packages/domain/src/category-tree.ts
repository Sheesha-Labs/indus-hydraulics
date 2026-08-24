/**
 * Category-tree maths, shared by the admin drag editor and the server action
 * that persists what it produces.
 *
 * ─── Why this lives in @indus/domain rather than beside the component ───
 *
 * The drag editor computes a drop target on the client and the action
 * re-derives the same thing on the server before writing. If those two
 * disagree the symptom is a row that snaps back to where it came from — or
 * worse, one that lands somewhere the client never showed. Both sides import
 * the same functions here so there is exactly one definition of "where does
 * this land".
 *
 * Everything in this file is pure: no React, no Prisma, no `server-only`. It
 * is unit-tested directly in `category-tree.test.ts`, which is the only place
 * the projection maths is checked — dragging is not reachable from jsdom and
 * Playwright's synthetic drag does not clear @dnd-kit's activation distance
 * (see the navigation-CMS notes), so a test at the component level would
 * assert nothing about depth.
 */

/**
 * Deepest nesting level a category may sit at. Zero-based, so 3 means four
 * visible levels: root › child › grandchild › great-grandchild.
 *
 * The live tree is three levels today. The cap is one deeper than that, which
 * is enough headroom for a real re-organisation and still inside what the
 * surfaces downstream can render: the admin indent ladder has four rungs, and
 * the storefront sub-category chip row on `/c/[slug]` shows one level at a
 * time so it does not care. The storefront's own `descendantCategoryIds` walks
 * to 6, so a mistake here degrades to a missing rollup rather than a wrong
 * page — but do not raise this without widening the indent ladder in
 * `CategoryTree.tsx`, or the two deepest levels render flush with each other.
 */
export const MAX_CATEGORY_DEPTH = 3

/** The minimum a node needs for tree maths. Callers pass richer rows through. */
export interface CategoryTreeNode {
  id: string
  parentId: string | null
  position: number
  name: string
}

/** A node placed in the visible, ordered, flattened list. */
export interface FlatCategory<T extends CategoryTreeNode = CategoryTreeNode> {
  node: T
  depth: number
  parentId: string | null
  /** Index among its own siblings, not in the flat list. */
  index: number
  /** True when this node has children, whether or not they are shown. */
  hasChildren: boolean
  /** True when this node has children and they are hidden. */
  isCollapsed: boolean
}

/** Where a drag would land. */
export interface Projection {
  parentId: string | null
  depth: number
}

function sortSiblings<T extends CategoryTreeNode>(rows: T[]): T[] {
  // `position` is the contract; `name` only breaks ties, which the live data
  // does not currently have (every sibling set is densely and uniquely
  // numbered) but seeded or hand-inserted rows can.
  return [...rows].sort((a, b) => a.position - b.position || a.name.localeCompare(b.name))
}

/** parentId → its children, each set sorted into display order. */
export function groupByParent<T extends CategoryTreeNode>(nodes: T[]): Map<string | null, T[]> {
  const byParent = new Map<string | null, T[]>()
  const ids = new Set(nodes.map((n) => n.id))
  for (const node of nodes) {
    // A row whose parent is missing from the set is an orphan. Bucketing it
    // under `null` puts it on screen as a root instead of dropping it, which
    // is what the old table did via a separate orphan pass. A category the
    // editor cannot see is a category nobody can fix.
    const key = node.parentId && ids.has(node.parentId) ? node.parentId : null
    const bucket = byParent.get(key)
    if (bucket) bucket.push(node)
    else byParent.set(key, [node])
  }
  for (const [key, bucket] of byParent) byParent.set(key, sortSiblings(bucket))
  return byParent
}

/**
 * Depth-first walk into the flat, ordered list the editor renders and drags
 * against.
 *
 * `collapsed` hides descendants but never hides a node whose ancestor chain is
 * open, so the list is always a valid prefix-ordered tree — which is what the
 * projection below assumes when it reads `items[overIndex - 1]`.
 */
export function flattenTree<T extends CategoryTreeNode>(
  nodes: T[],
  collapsed: ReadonlySet<string> = new Set(),
): FlatCategory<T>[] {
  const byParent = groupByParent(nodes)
  const out: FlatCategory<T>[] = []

  function walk(parentId: string | null, depth: number, seen: Set<string>): void {
    const rows = byParent.get(parentId) ?? []
    rows.forEach((node, index) => {
      // A cycle in the data would otherwise recurse forever inside a render.
      // The server rejects cycles, but this runs against whatever the DB holds.
      if (seen.has(node.id)) return
      const children = byParent.get(node.id) ?? []
      const isCollapsed = collapsed.has(node.id) && children.length > 0
      out.push({
        node,
        depth,
        parentId,
        index,
        hasChildren: children.length > 0,
        isCollapsed,
      })
      if (!isCollapsed) walk(node.id, depth + 1, new Set([...seen, node.id]))
    })
  }

  walk(null, 0, new Set())
  return out
}

/** Every descendant id of `id`, excluding `id` itself. */
export function descendantIds<T extends CategoryTreeNode>(nodes: T[], id: string): string[] {
  const byParent = groupByParent(nodes)
  const out: string[] = []
  const queue = [id]
  const seen = new Set<string>([id])
  while (queue.length > 0) {
    const current = queue.shift()!
    for (const child of byParent.get(current) ?? []) {
      if (seen.has(child.id)) continue
      seen.add(child.id)
      out.push(child.id)
      queue.push(child.id)
    }
  }
  return out
}

/** How many levels sit below `id`. A leaf is 0. */
export function subtreeHeight<T extends CategoryTreeNode>(nodes: T[], id: string): number {
  const byParent = groupByParent(nodes)
  function height(current: string, seen: Set<string>): number {
    let tallest = 0
    for (const child of byParent.get(current) ?? []) {
      if (seen.has(child.id)) continue
      tallest = Math.max(tallest, 1 + height(child.id, new Set([...seen, child.id])))
    }
    return tallest
  }
  return height(id, new Set([id]))
}

/** Root → node, inclusive. Used for the "Hoses & Fittings › Ferrules" label. */
export function ancestorPath<T extends CategoryTreeNode>(nodes: T[], id: string): T[] {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const chain: T[] = []
  let cursor: string | null = id
  // Bounded by the node count so bad data cannot hang a render.
  for (let hops = 0; cursor && hops <= nodes.length; hops++) {
    const node: T | undefined = byId.get(cursor)
    if (!node) break
    chain.unshift(node)
    cursor = node.parentId
  }
  return chain
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * The visible list as it looks mid-drag: the dragged branch's descendants are
 * gone, because they travel with it.
 *
 * Both `projectDrop` and `siblingIndexForDrop` run this first, and they must
 * run the SAME one. They answer two halves of one question — which parent, and
 * where among its children — and if they disagree about which rows are on
 * screen the row lands at an index computed against a list the user never saw.
 *
 * Leaving the descendants in is not a cosmetic bug. Drag a root down over its
 * own grandchild and the row above the drop point IS that grandchild, so the
 * projection happily reports it as the new parent — a category that is its own
 * ancestor. The server's cycle check would reject the write, but only after the
 * editor had already drawn the move as legal.
 */
function withoutSubtree<T extends CategoryTreeNode>(
  items: FlatCategory<T>[],
  activeId: string,
): FlatCategory<T>[] {
  const excluded = new Set(descendantIds(items.map((i) => i.node), activeId))
  return items.filter((i) => !excluded.has(i.node.id))
}

/**
 * Where a drag lands, given the row it is hovering and how far sideways it has
 * been dragged.
 *
 * This is the standard @dnd-kit sortable-tree projection with two additions
 * this catalogue needs:
 *
 *   - `MAX_CATEGORY_DEPTH` is enforced against the dragged node's own SUBTREE,
 *     not just the node. Dropping a two-level branch at depth 3 would push its
 *     grandchildren to depth 5 — legal for the node, illegal for the tree, and
 *     invisible until someone opened the branch afterwards.
 *   - the dragged node's own descendants are excluded from the list before
 *     projecting, so a branch cannot be dropped inside itself. Without this the
 *     server's cycle check is the only thing standing between a drag and a
 *     category that is its own grandparent.
 *
 * `offsetX` is the horizontal drag delta in pixels; `indentWidth` is one
 * indent step. Depth changes one rung per step, so the gesture is "drag right
 * to nest, drag left to promote".
 */
export function projectDrop<T extends CategoryTreeNode>({
  items: allItems,
  nodes,
  activeId,
  overId,
  offsetX,
  indentWidth,
}: {
  items: FlatCategory<T>[]
  /**
   * Every category, not just the visible rows.
   *
   * The subtree-height check below has to see children that are hidden. Drag a
   * COLLAPSED parent and its children are absent from `items` entirely, so a
   * height read from the visible list is 0 and the depth cap waves through a
   * drop that buries the hidden branch past `MAX_CATEGORY_DEPTH`. Nothing shows
   * it until someone expands that branch, days later.
   */
  nodes: T[]
  activeId: string
  overId: string
  offsetX: number
  indentWidth: number
}): Projection | null {
  const items = withoutSubtree(allItems, activeId)
  const activeIndex = items.findIndex((i) => i.node.id === activeId)
  const overIndex = items.findIndex((i) => i.node.id === overId)
  // `overId` inside the dragged branch means the pointer is over a row that is
  // travelling with the drag. There is no landing to report.
  if (activeIndex < 0 || overIndex < 0) return null

  const active = items[activeIndex]!
  const reordered = arrayMove(items, activeIndex, overIndex)
  const previous = reordered[overIndex - 1]
  const next = reordered[overIndex + 1]

  const dragDepth = Math.round(offsetX / indentWidth)
  const projected = active.depth + dragDepth

  // You may nest one level below the row above, and no deeper — the row above
  // is the only thing that can be your new parent.
  const maxByNeighbour = previous ? previous.depth + 1 : 0
  // You may not sit shallower than the row below, or it would be orphaned out
  // of the branch it is currently in.
  const minByNeighbour = next ? next.depth : 0

  // The subtree's own height eats into the remaining allowance. Measured
  // against `nodes`, so a collapsed branch still counts (see the prop doc).
  const maxByCap = MAX_CATEGORY_DEPTH - subtreeHeight(nodes, activeId)

  const ceiling = Math.min(maxByNeighbour, maxByCap)
  if (ceiling < 0) return null
  const depth = clamp(projected, Math.min(minByNeighbour, ceiling), ceiling)

  function parentAt(): string | null {
    if (depth === 0 || !previous) return null
    if (depth === previous.depth) return previous.parentId
    if (depth > previous.depth) return previous.node.id
    // Shallower than the row above: walk back for the last row at this depth
    // and take its parent — that is the branch we are rejoining.
    const rejoin = reordered
      .slice(0, overIndex)
      .reverse()
      .find((i) => i.depth === depth)
    return rejoin?.parentId ?? null
  }

  return { parentId: parentAt(), depth }
}

/**
 * The rows that must be written for a move, as a dense 0..n-1 renumbering of
 * every sibling set the move touches.
 *
 * Dense rather than sparse deliberately. Positions drifting into gaps is how
 * the old integer box produced ties, and a tie makes display order depend on
 * the name tiebreak rather than on what the editor dragged. Rewriting both
 * affected sibling sets in full costs at most a few dozen rows and leaves the
 * table in a state the next drag can reason about.
 *
 * Returns only rows whose `parentId` or `position` actually changes, so a drag
 * that lands where it started writes nothing.
 */
export function buildMoveOrdering<T extends CategoryTreeNode>({
  nodes,
  activeId,
  newParentId,
  newIndex,
}: {
  nodes: T[]
  activeId: string
  newParentId: string | null
  newIndex: number
}): Array<{ id: string; parentId: string | null; position: number }> {
  const active = nodes.find((n) => n.id === activeId)
  if (!active) return []

  const byParent = groupByParent(nodes)
  const oldParentId = active.parentId && nodes.some((n) => n.id === active.parentId) ? active.parentId : null

  const source = (byParent.get(oldParentId) ?? []).filter((n) => n.id !== activeId)
  const target =
    oldParentId === newParentId ? source : (byParent.get(newParentId) ?? []).filter((n) => n.id !== activeId)

  const placed = [...target]
  placed.splice(clamp(newIndex, 0, placed.length), 0, active)

  const writes = new Map<string, { id: string; parentId: string | null; position: number }>()
  if (oldParentId !== newParentId) {
    source.forEach((node, position) => {
      writes.set(node.id, { id: node.id, parentId: oldParentId, position })
    })
  }
  placed.forEach((node, position) => {
    writes.set(node.id, { id: node.id, parentId: newParentId, position })
  })

  const byId = new Map(nodes.map((n) => [n.id, n]))
  return [...writes.values()].filter((row) => {
    const before = byId.get(row.id)
    if (!before) return false
    const beforeParent = before.parentId && byId.has(before.parentId) ? before.parentId : null
    return beforeParent !== row.parentId || before.position !== row.position
  })
}

/**
 * Sibling index a projected drop corresponds to.
 *
 * The projection says "which parent, at what depth"; the flat list says where
 * in the rendered order the row now sits. Counting the rows already under that
 * parent above the drop point converts one into the other.
 */
export function siblingIndexForDrop<T extends CategoryTreeNode>({
  items: allItems,
  activeId,
  overId,
  parentId,
}: {
  items: FlatCategory<T>[]
  activeId: string
  overId: string
  parentId: string | null
}): number {
  const items = withoutSubtree(allItems, activeId)
  const activeIndex = items.findIndex((i) => i.node.id === activeId)
  const overIndex = items.findIndex((i) => i.node.id === overId)
  if (activeIndex < 0 || overIndex < 0) return 0
  const reordered = arrayMove(items, activeIndex, overIndex)
  let index = 0
  for (let i = 0; i < overIndex; i++) {
    const row = reordered[i]!
    if (row.node.id === activeId) continue
    if (row.parentId === parentId) index++
  }
  return index
}

/** Local `arrayMove`, so this module stays free of a @dnd-kit dependency. */
export function arrayMove<T>(list: readonly T[], from: number, to: number): T[] {
  const out = [...list]
  const [moved] = out.splice(from, 1)
  if (moved !== undefined) out.splice(to, 0, moved)
  return out
}

/**
 * Ids matching a free-text query, plus every ancestor of each match.
 *
 * The ancestors are the point: filtering a tree to just the matching rows
 * produces a list whose depths no longer describe a tree, and the editor
 * renders depth as indentation. Keeping the chain means a search result still
 * reads as "this thing, inside that thing".
 */
export function matchingWithAncestors<T extends CategoryTreeNode & { slug?: string }>(
  nodes: T[],
  query: string,
): Set<string> {
  const needle = query.trim().toLowerCase()
  if (!needle) return new Set(nodes.map((n) => n.id))
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const keep = new Set<string>()
  for (const node of nodes) {
    const haystack = `${node.name} ${node.slug ?? ''}`.toLowerCase()
    if (!haystack.includes(needle)) continue
    let cursor: string | null = node.id
    for (let hops = 0; cursor && hops <= nodes.length; hops++) {
      if (keep.has(cursor)) break
      keep.add(cursor)
      cursor = byId.get(cursor)?.parentId ?? null
    }
  }
  return keep
}
