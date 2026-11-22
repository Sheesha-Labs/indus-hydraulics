'use client'

import { LinkTabs } from '@indus/ops-ui/controls'
import { useSelectedLayoutSegment } from 'next/navigation'

export interface SegmentTabsProps {
  /** One tab per child segment of the layout that renders this: `key` is the segment. */
  items: { key: string; label: string; href: string }[]
  'aria-label': string
}

/**
 * Pane-style LinkTabs whose current tab is the layout's selected child segment (a layout is not told its
 * child segment, 05 §6.2). Used by the Reports layout (Overdue · Win/loss · Pipeline).
 */
export default function SegmentTabs({ items, 'aria-label': ariaLabel }: SegmentTabsProps) {
  const segment = useSelectedLayoutSegment()
  return <LinkTabs items={items} active={segment ?? ''} tabsStyle="pane" aria-label={ariaLabel} />
}
