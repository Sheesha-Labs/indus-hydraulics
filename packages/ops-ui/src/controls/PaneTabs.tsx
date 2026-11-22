'use client'

import * as Tabs from '@radix-ui/react-tabs'
import type { ReactNode } from 'react'
import { LabelWithCount } from './Count'
import type { TabItem } from './LinkTabs'
import { tabItem, tabList } from './styles'

export interface PaneTabsProps {
  items: TabItem[]
  value: string
  onValueChange: (k: string) => void
  /** The panel for the current `value`. */
  children: ReactNode
  'aria-label'?: string
  className?: string
}

/**
 * In-page tabs for panels inside cards and drawers (Reasons · Sources 3 · History). Radix Tabs: an ARIA
 * tablist with roving focus; arrow keys move and select, Home/End jump. Every tab gets its tabpanel so
 * aria-controls always resolves; only the current one holds `children`.
 */
export default function PaneTabs({
  items,
  value,
  onValueChange,
  children,
  className,
  'aria-label': ariaLabel,
}: PaneTabsProps) {
  return (
    <Tabs.Root value={value} onValueChange={onValueChange} className={className}>
      <Tabs.List
        {...(ariaLabel ? { 'aria-label': ariaLabel } : {})}
        // Radix writes outline:none as an inline style, which the Ops CSP drops from server markup; the
        // list only forwards focus to the active tab, so the class does the same job.
        className={`${tabList({ tabsStyle: 'pane' })} outline-none`}
      >
        {items.map((t) => (
          <Tabs.Trigger key={t.key} value={t.key} className={tabItem({ tabsStyle: 'pane' })}>
            <LabelWithCount
              label={t.label}
              count={t.count}
              tone={t.countTone}
              onAccent={t.key === value}
            />
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {items.map((t) => (
        <Tabs.Content key={t.key} value={t.key} className="io-focus">
          {t.key === value ? children : null}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  )
}
