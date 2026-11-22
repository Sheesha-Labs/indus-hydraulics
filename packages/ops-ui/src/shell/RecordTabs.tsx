'use client'

import { useSelectedLayoutSegments } from 'next/navigation'
import LinkTabs from '../controls/LinkTabs'
import { activeTabKey, adjacentTabHref, type RecordTab } from './record-tabs'

export interface RecordTabsProps {
  tabs: readonly RecordTab[]
  /**
   * Fixes the active tab (specimens, tests). Otherwise it follows the selected layout segments: a Next.js
   * layout does not receive its child segment as a prop (05 §6.2), so this tiny client part reads it.
   */
  active?: string
  'aria-label': string
}

/**
 * The record header's tabs: links (LinkTabs record style, aria-current="page"), never an ARIA tablist.
 *
 * `[` and `]` move to the previous and next tab. The keys belong to the console's one hotkey registry
 * (S02-T03), so this part only publishes its neighbours: `data-record-tabs` with `data-prev-href` and
 * `data-next-href` on the nav, which the registry's `[` / `]` handlers read and navigate to. Using
 * adjacentTabHref keeps both ends from wrapping.
 */
export default function RecordTabs({ tabs, active, 'aria-label': ariaLabel }: RecordTabsProps) {
  const segments = useSelectedLayoutSegments()
  const current = active ?? activeTabKey(tabs, segments) ?? ''
  const prev = adjacentTabHref(tabs, current, -1)
  const next = adjacentTabHref(tabs, current, 1)
  return (
    <div
      data-record-tabs=""
      {...(prev ? { 'data-prev-href': prev } : {})}
      {...(next ? { 'data-next-href': next } : {})}
    >
      <LinkTabs
        items={tabs.map((t) => ({
          key: t.key,
          label: t.label,
          href: t.href,
          ...(t.count === undefined ? {} : { count: t.count }),
        }))}
        active={current}
        tabsStyle="record"
        aria-label={ariaLabel}
      />
    </div>
  )
}
