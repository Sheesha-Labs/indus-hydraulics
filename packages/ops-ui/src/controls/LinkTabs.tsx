import type { Route } from 'next'
import Link from 'next/link'
import { cn } from '../lib/cn'
import { LabelWithCount, type CountTone } from './Count'
import { tabItem, tabList } from './styles'

export interface TabItem<K extends string = string> {
  key: K
  label: string
  count?: number
  countTone?: CountTone
  href?: string
}

export type TabsStyle = 'pane' | 'record'

export interface LinkTabsProps {
  items: (TabItem & { href: string })[]
  /** Key of the current tab. */
  active: string
  /** The kit prop name. (`style` is React's inline-style prop, which Ops bans.) */
  tabsStyle: TabsStyle
  orientation?: 'horizontal' | 'vertical'
  'aria-label': string
  className?: string
}

/**
 * Tabs that navigate: record header tabs and the settings sub-nav. Shared. They are links in a <nav>, the
 * current one aria-current="page" — not an ARIA tablist, which is reserved for in-page panels (PaneTabs).
 */
export default function LinkTabs({
  items,
  active,
  tabsStyle,
  orientation = 'horizontal',
  className,
  'aria-label': ariaLabel,
}: LinkTabsProps) {
  return (
    <nav aria-label={ariaLabel} className={cn(tabList({ tabsStyle, orientation }), className)}>
      {items.map((t) => {
        const on = t.key === active
        return (
          <Link
            key={t.key}
            href={t.href as Route}
            aria-current={on ? 'page' : undefined}
            data-state={on ? 'active' : 'inactive'}
            className={tabItem({ tabsStyle, orientation })}
          >
            <LabelWithCount label={t.label} count={t.count} tone={t.countTone} onAccent={on} />
          </Link>
        )
      })}
    </nav>
  )
}
