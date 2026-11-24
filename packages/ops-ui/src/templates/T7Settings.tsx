import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import { TEMPLATE_ROOT, TEMPLATE_TOP } from './frame'

export interface T7SettingsProps {
  /** Shell `PageHeader` with Cancel and the one primary, Save changes, in its actions. */
  header: ReactNode
  banner?: ReactNode
  /**
   * 220: the settings sub-nav (group eyebrows and items, the current one navy). In a `nav` landmark. Absent:
   * the Assistant pages (boards 98–101, 115) draw the sections full width on paper, 20 / 28 padding.
   */
  subnav?: ReactNode
  subnavLabel?: string
  /** A white 300 pane on the right with its own scroll (board 100 "How guardrails work"). */
  aside?: ReactNode
  asideLabel?: string
  /** Form `FormSection`s: each a 260 label column beside a 2-column field grid. */
  children: ReactNode
}

/**
 * Template T7 · Settings form (L2 t7a): the page header, then a white 220 sub-nav pane (14 / 10 padding,
 * 2 between items) beside the sections on paper (8 / 32 padding). Each column scrolls on its own.
 */
export default function T7Settings({
  header,
  banner,
  subnav,
  subnavLabel = 'Settings sections',
  aside,
  asideLabel = 'About this page',
  children,
}: T7SettingsProps) {
  return (
    <div data-template="T7" data-variant={subnav ? 'subnav' : 'full'} className={TEMPLATE_ROOT}>
      <div data-slot="header" className={TEMPLATE_TOP}>
        {header}
      </div>
      {banner ? (
        <div data-slot="banner" className="flex-none">
          {banner}
        </div>
      ) : null}
      <div
        data-slot="body"
        className={cn(
          'grid min-h-0 flex-1',
          subnav && aside && 'grid-cols-[var(--io-w-subnav)_minmax(0,1fr)_300px]',
          subnav && !aside && 'grid-cols-[var(--io-w-subnav)_minmax(0,1fr)]',
          !subnav && aside && 'grid-cols-[minmax(0,1fr)_300px]',
          !subnav && !aside && 'grid-cols-[minmax(0,1fr)]'
        )}
      >
        {subnav ? (
          <nav
            data-slot="subnav"
            aria-label={subnavLabel}
            className="bg-io-card border-io-line flex min-h-0 flex-col gap-0.5 overflow-y-auto border-r px-2.5 py-3.5"
          >
            {subnav}
          </nav>
        ) : null}
        <div
          data-slot="sections"
          className={cn(
            'flex min-h-0 min-w-0 flex-col overflow-y-auto',
            subnav ? 'px-8 py-2' : 'px-7 py-5'
          )}
        >
          {children}
        </div>
        {aside ? (
          <aside
            data-slot="aside"
            aria-label={asideLabel}
            className="bg-io-card border-io-line flex min-h-0 flex-col gap-4 overflow-y-auto border-l px-5 py-6"
          >
            {aside}
          </aside>
        ) : null}
      </div>
    </div>
  )
}
