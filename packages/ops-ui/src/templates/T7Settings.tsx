import type { ReactNode } from 'react'
import { TEMPLATE_ROOT, TEMPLATE_TOP } from './frame'

export interface T7SettingsProps {
  /** Shell `PageHeader` with Cancel and the one primary, Save changes, in its actions. */
  header: ReactNode
  banner?: ReactNode
  /** 220: the settings sub-nav (group eyebrows and items, the current one navy). In a `nav` landmark. */
  subnav: ReactNode
  subnavLabel?: string
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
  children,
}: T7SettingsProps) {
  return (
    <div data-template="T7" className={TEMPLATE_ROOT}>
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
        className="grid min-h-0 flex-1 grid-cols-[var(--io-w-subnav)_minmax(0,1fr)]"
      >
        <nav
          data-slot="subnav"
          aria-label={subnavLabel}
          className="bg-io-card border-io-line flex min-h-0 flex-col gap-0.5 overflow-y-auto border-r px-2.5 py-3.5"
        >
          {subnav}
        </nav>
        <div
          data-slot="sections"
          className="flex min-h-0 min-w-0 flex-col overflow-y-auto px-8 py-2"
        >
          {children}
        </div>
      </div>
    </div>
  )
}
