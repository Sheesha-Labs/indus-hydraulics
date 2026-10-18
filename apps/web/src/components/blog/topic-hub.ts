import type { BlogBlock } from '@indus/domain'

/**
 * Where the pieces of a topic hub go.
 *
 * Body blocks: the FIRST `direct_answer` moves into the header as the quick
 * answer; every `category_link` moves to Parts; every `cta_block` moves to the
 * end. Everything else is the topic guide, in source order. Indexes, not
 * blocks, so the renderer skips exactly those positions.
 *
 * Articles: the OLDEST post (the last of the newest-first list) is "Start
 * here" — there is no pinned-article field, so age stands in for "the
 * foundation article". It appears only in that card, not again in the list.
 */
export type HubBlockPlan = {
  quickAnswer: number | null
  categoryLinks: number[]
  ctas: number[]
  /** Indexes the guide must not render. */
  guideSkip: ReadonlySet<number>
  /** True when at least one block is left for the guide. */
  hasGuide: boolean
}

export function planHubBlocks(blocks: readonly BlogBlock[]): HubBlockPlan {
  let quickAnswer: number | null = null
  const categoryLinks: number[] = []
  const ctas: number[] = []
  blocks.forEach((block, i) => {
    if (block.type === 'direct_answer' && quickAnswer === null) quickAnswer = i
    else if (block.type === 'category_link') categoryLinks.push(i)
    else if (block.type === 'cta_block') ctas.push(i)
  })
  const guideSkip = new Set<number>([...categoryLinks, ...ctas])
  if (quickAnswer !== null) guideSkip.add(quickAnswer)
  return { quickAnswer, categoryLinks, ctas, guideSkip, hasGuide: blocks.length > guideSkip.size }
}

export function splitStartHere<T>(newestFirst: readonly T[]): { start: T | null; rest: T[] } {
  if (newestFirst.length === 0) return { start: null, rest: [] }
  return { start: newestFirst[newestFirst.length - 1] ?? null, rest: newestFirst.slice(0, -1) }
}

/** One row of the hub's article list, pre-formatted on the server. */
export type HubListItem = {
  slug: string
  title: string
  /** ISO timestamp for `<time dateTime>`, or null when unpublished-dated. */
  dateTime: string | null
  dateLabel: string | null
  monthKey: string | null
  monthLabel: string | null
  minutes: number | null
}

export type HubMonthGroup = { key: string; label: string; items: HubListItem[] }

/** Newest-first rows grouped by month, keeping their order. Undated rows fall in a trailing group. */
export function groupByMonth(items: readonly HubListItem[]): HubMonthGroup[] {
  const groups = new Map<string, HubMonthGroup>()
  for (const item of items) {
    const key = item.monthKey ?? 'undated'
    let group = groups.get(key)
    if (!group) {
      group = { key, label: item.monthLabel ?? 'Undated', items: [] }
      groups.set(key, group)
    }
    group.items.push(item)
  }
  return [...groups.values()]
}

/** Shortest read first; ties keep their newest-first order; unknown lengths last. */
export function byQuickest(items: readonly HubListItem[]): HubListItem[] {
  return items
    .map((item, i) => ({ item, i }))
    .sort((a, b) => {
      const am = a.item.minutes ?? Number.POSITIVE_INFINITY
      const bm = b.item.minutes ?? Number.POSITIVE_INFINITY
      return am - bm || a.i - b.i
    })
    .map(({ item }) => item)
}
