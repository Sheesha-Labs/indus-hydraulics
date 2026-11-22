import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import { TEMPLATE_BODY, TEMPLATE_COLUMN, TEMPLATE_ROOT, TEMPLATE_TOP } from './frame'

export interface T10GanttProps {
  /** Shell `PageHeader` with its filter row (All orders · At risk · This month) and Export. */
  header: ReactNode
  banner?: ReactNode
  /** A toolbar above the chart (week stepper, scale), when the header's filters are not enough. */
  controls?: ReactNode
  /**
   * The Timeline `Gantt` (label column 250) or a week calendar, full width, and the Status `Banner` for a
   * slip under it.
   */
  children: ReactNode
}

/**
 * Template T10 · Calendar / Gantt (L2 t10a): the page header, then one full-width column on the 16 / 28
 * body, 14 between the chart card and what follows it.
 */
export default function T10Gantt({ header, banner, controls, children }: T10GanttProps) {
  return (
    <div data-template="T10" className={TEMPLATE_ROOT}>
      <div data-slot="header" className={TEMPLATE_TOP}>
        {header}
      </div>
      {banner ? (
        <div data-slot="banner" className="flex-none">
          {banner}
        </div>
      ) : null}
      <div data-slot="body" className={cn(TEMPLATE_BODY, 'grid-cols-[minmax(0,1fr)]')}>
        <div data-slot="plan" className={TEMPLATE_COLUMN}>
          {controls ? (
            <div data-slot="controls" className="flex flex-wrap items-center gap-2">
              {controls}
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  )
}
