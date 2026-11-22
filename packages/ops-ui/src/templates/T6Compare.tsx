import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import { TEMPLATE_COLUMN } from './frame'

export interface T6CompareProps {
  /** Controls `Segmented` (Landed cost · Supplier price · Lead time · Coverage). */
  toolbar?: ReactNode
  /** Lines × suppliers: the Table kit compare grid card. */
  grid: ReactNode
  /** Under the grid: the Chart `FX` tag with the locked rate. */
  foot?: ReactNode
  /** 380: Assistant `Option` scenarios and the Card `Stat` totals. */
  aside?: ReactNode
  asideLabel?: string
}

/**
 * Template T6 · Compare grid (L2 t6a): the grid card full width, or `1fr · 380` with the scenarios aside,
 * 16 apart. It sits in a tab body that already has the page gutter (T2Record), so it adds no padding.
 */
export default function T6Compare({
  toolbar,
  grid,
  foot,
  aside,
  asideLabel = 'Scenarios',
}: T6CompareProps) {
  return (
    <div
      data-template="T6"
      className={cn(
        'grid min-w-0 items-start gap-4',
        aside ? 'grid-cols-[minmax(0,1fr)_var(--io-w-scenarios)]' : 'grid-cols-[minmax(0,1fr)]'
      )}
    >
      <div data-slot="main" className={TEMPLATE_COLUMN}>
        {toolbar ? (
          <div data-slot="toolbar" className="flex flex-wrap items-center gap-2">
            {toolbar}
          </div>
        ) : null}
        <div data-slot="grid" className="min-w-0">
          {grid}
        </div>
        {foot ? (
          <div data-slot="foot" className="flex flex-wrap items-center gap-2">
            {foot}
          </div>
        ) : null}
      </div>
      {aside ? (
        <aside data-slot="aside" aria-label={asideLabel} className={TEMPLATE_COLUMN}>
          {aside}
        </aside>
      ) : null}
    </div>
  )
}
