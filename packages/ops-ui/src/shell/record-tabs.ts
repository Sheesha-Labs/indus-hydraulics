// Pure helpers for the record header's tabs (shared by RecordTabs, its tests and the S02-T03 hotkeys).
// No React: safe on the server and in tests.

export interface RecordTab {
  key: string
  label: string
  href: string
  /** Path below the record layout ('' for the record's own page, 'tender/timeline' for a tender section). */
  segment: string
  count?: number
}

/**
 * The active tab for the segments selected below the record layout (`useSelectedLayoutSegments()`). Route
 * groups (`(…)`) are not path segments and are skipped. The longest matching segment wins, so
 * `tender/timeline` beats a hypothetical `tender`, and '' (Overview) matches only the record's own page.
 */
export function activeTabKey(
  tabs: readonly RecordTab[],
  segments: readonly string[] | null
): string | undefined {
  if (!segments) return undefined
  const path = segments.filter((s) => !s.startsWith('(')).join('/')
  let best: RecordTab | undefined
  for (const t of tabs) {
    const hit = t.segment === '' ? path === '' : path === t.segment || path.startsWith(`${t.segment}/`)
    if (hit && (!best || t.segment.length > best.segment.length)) best = t
  }
  return best?.key
}

/**
 * The href `delta` tabs away from the active one (`]` = +1, `[` = -1), or undefined at either end or when no
 * tab is active. Ends do not wrap: `]` on the last tab stays put.
 */
export function adjacentTabHref(
  tabs: readonly RecordTab[],
  active: string | undefined,
  delta: 1 | -1
): string | undefined {
  const i = tabs.findIndex((t) => t.key === active)
  if (i < 0) return undefined
  return tabs[i + delta]?.href
}
