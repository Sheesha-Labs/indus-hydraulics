import type { MenuLinkType } from './navigation'

/**
 * The editable shape of one navigation item, and how a screenful of edits
 * becomes the smallest set of writes that expresses them.
 *
 * ── Why a diff and not replace-then-insert ──
 *
 * The footer editor that this generalises saves by deleting every row of its
 * menu and re-inserting from local state. That is fine for fifteen rows whose
 * ids nothing references. It is wrong here for three reasons, all of which the
 * megamenu's 323 rows make real:
 *
 *   · Ids churn. `promoImageId` and the five link FKs survive a re-insert, but
 *     any future reference to a menu item by id would not — and re-creating
 *     323 rows to move one of them is a lot of write amplification for an edit
 *     that changed a label.
 *
 *   · Two editors destroy each other completely rather than partially. With
 *     replace-all, whoever saves second erases every change the first made,
 *     including the 300 rows they never looked at. With a diff, the damage is
 *     bounded to rows both people actually touched.
 *
 *   · A failed insert mid-way through 323 rows is a menu that no longer
 *     exists. The transaction protects against that, but the smaller write is
 *     the better answer to it.
 *
 * So the editor holds a draft, and this computes what changed.
 */

export interface NavDraftItem {
  /**
   * The database id, or null for a row added in this editing session.
   *
   * Nullable rather than a generated placeholder id, because "has no id yet"
   * is exactly the distinction the diff needs and a placeholder makes it
   * guessable rather than certain.
   */
  id: string | null
  /** Stable across a save, unlike `id`. Keys React rows and parent pointers. */
  uid: string
  parentUid: string | null
  label: string
  linkType: MenuLinkType
  customUrl: string | null
  categoryId: string | null
  brandId: string | null
  industryId: string | null
  cmsPageId: string | null
  productId: string | null
  iconName: string | null
  badge: string | null
  description: string | null
  openInNewTab: boolean
  isVisible: boolean
  promoImageId: string | null
  promoHeading: string | null
  promoBody: string | null
  promoLinkUrl: string | null
}

/** One item's worth of writes, in the order the server must apply them. */
export type NavDiff = {
  /** Rows with no id yet. `parentUid` may point at another created row. */
  created: NavDraftItem[]
  /** Rows whose fields, parent or position changed. */
  updated: (NavDraftItem & { id: string; position: number })[]
  /** Ids present in the original tree and absent from the draft. */
  deletedIds: string[]
  /** Every surviving row's final parent and position, keyed by uid. */
  ordering: { uid: string; parentUid: string | null; position: number }[]
}

const COMPARED_FIELDS = [
  'label',
  'linkType',
  'customUrl',
  'categoryId',
  'brandId',
  'industryId',
  'cmsPageId',
  'productId',
  'iconName',
  'badge',
  'description',
  'openInNewTab',
  'isVisible',
  'promoImageId',
  'promoHeading',
  'promoBody',
  'promoLinkUrl',
] as const satisfies readonly (keyof NavDraftItem)[]

/**
 * Flatten a draft into (uid, parentUid, position) in tree order.
 *
 * Position is per-parent and renumbered from array order, so the draft's array
 * IS the ordering — a row's stored `position` is never trusted. That is what
 * lets a drag reorder be expressed by moving an array element and nothing
 * else.
 */
export function flattenDraft(
  items: NavDraftItem[],
): { uid: string; parentUid: string | null; position: number }[] {
  const perParent = new Map<string | null, number>()
  return items.map((item) => {
    const next = perParent.get(item.parentUid) ?? 0
    perParent.set(item.parentUid, next + 1)
    return { uid: item.uid, parentUid: item.parentUid, position: next }
  })
}

function changed(a: NavDraftItem, b: NavDraftItem): boolean {
  return COMPARED_FIELDS.some((field) => a[field] !== b[field])
}

/**
 * What has to be written to turn `original` into `draft`.
 *
 * Both arrays are in tree order — a parent always precedes its children — which
 * is the order the server needs for `created`, since a created row's parent may
 * itself be created in the same save.
 */
export function diffNavDraft(original: NavDraftItem[], draft: NavDraftItem[]): NavDiff {
  const originalByUid = new Map(original.map((item) => [item.uid, item]))
  const originalPlacement = new Map(
    flattenDraft(original).map((row) => [row.uid, row]),
  )
  const draftPlacement = new Map(flattenDraft(draft).map((row) => [row.uid, row]))

  const created: NavDraftItem[] = []
  const updated: (NavDraftItem & { id: string; position: number })[] = []

  for (const item of draft) {
    if (item.id === null) {
      created.push(item)
      continue
    }
    const before = originalByUid.get(item.uid)
    // An id the original tree never had. Treat as created rather than trusting
    // it: a stale id would otherwise become an `update` against a row this
    // menu may not even own.
    if (!before) {
      created.push({ ...item, id: null })
      continue
    }
    const placement = draftPlacement.get(item.uid)!
    const wasPlacement = originalPlacement.get(item.uid)!
    const moved =
      placement.parentUid !== wasPlacement.parentUid ||
      placement.position !== wasPlacement.position
    if (moved || changed(before, item)) {
      updated.push({ ...item, id: item.id, position: placement.position })
    }
  }

  const draftUids = new Set(draft.map((item) => item.uid))
  const deletedIds = original
    .filter((item) => item.id !== null && !draftUids.has(item.uid))
    .map((item) => item.id as string)

  return { created, updated, deletedIds, ordering: flattenDraft(draft) }
}

export function isEmptyDiff(diff: NavDiff): boolean {
  return (
    diff.created.length === 0 && diff.updated.length === 0 && diff.deletedIds.length === 0
  )
}

/**
 * Every uid beneath `uid`, deepest first, plus `uid` itself.
 *
 * Used when removing a row: the database cascades a delete to its children,
 * but the draft has to drop them too or they linger as orphans pointing at a
 * parentUid that no longer exists — which `flattenDraft` would then place at a
 * phantom parent and the save would try to write.
 */
export function collectSubtree(items: NavDraftItem[], uid: string): string[] {
  const childrenOf = new Map<string | null, string[]>()
  for (const item of items) {
    const list = childrenOf.get(item.parentUid) ?? []
    list.push(item.uid)
    childrenOf.set(item.parentUid, list)
  }
  const out: string[] = []
  const walk = (current: string) => {
    for (const child of childrenOf.get(current) ?? []) walk(child)
    out.push(current)
  }
  walk(uid)
  return out
}

/** The depth of every row, keyed by uid. Roots are 0. */
export function draftDepths(items: NavDraftItem[]): Map<string, number> {
  const byUid = new Map(items.map((item) => [item.uid, item]))
  const depths = new Map<string, number>()
  const depthOf = (uid: string, guard = 0): number => {
    const cached = depths.get(uid)
    if (cached !== undefined) return cached
    const item = byUid.get(uid)
    // The guard is not paranoia: `parentUid` is client state, and a cycle here
    // would hang the render rather than fail a save.
    if (!item || !item.parentUid || guard > 64) return 0
    const value = depthOf(item.parentUid, guard + 1) + 1
    depths.set(uid, value)
    return value
  }
  for (const item of items) depths.set(item.uid, depthOf(item.uid))
  return depths
}

/**
 * True when a stored row already matches what the draft wants it to be.
 *
 * The server uses this to skip the write. Without it a save issues one UPDATE
 * per row regardless of whether anything changed — which is correct but takes
 * over five seconds on the megamenu's 323 rows against a remote database, so
 * every no-op save would block the editor for longer than the edit took.
 *
 * Compares the placement as well as the columns: a row whose fields are
 * identical but whose position moved still has to be written.
 */
export function navRowUnchanged(
  before: Record<string, unknown> & { parentId: string | null; position: number },
  next: { parentId: string | null; position: number; columns: Record<string, unknown> },
): boolean {
  if (before.parentId !== next.parentId) return false
  if (before.position !== next.position) return false
  return Object.keys(next.columns).every((key) => before[key] === next.columns[key])
}
