import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import { TEMPLATE_BODY, TEMPLATE_COLUMN, TEMPLATE_ROOT, TEMPLATE_TOP } from './frame'

interface T8Base {
  /** Shell `TodayHeader` (greeting, Assistant pill, bell); a `PageHeader` on the dashboard variant. */
  header: ReactNode
  banner?: ReactNode
}

interface T8Rail {
  /** 320: Card `KPI`s (Awaiting decision, Cash in next 7 days) and the "Done for you" card. */
  rail: ReactNode
  railLabel?: string
}

/**
 * The Owner and Helper home (L2 t8a): needs you, then came in · late side by side, and the 320 rail.
 * 'first-run' (board 224) puts the setup checklist where needs-you goes. 'dashboard' (board 202) is a KPI
 * row and a two-column card grid with no rail.
 */
export type T8TodayProps = T8Base &
  (
    | (T8Rail & {
        variant?: 'owner' | 'helper'
        /** The "Needs you · n / See all n" Card, then a Card `NeedsRow` per item. */
        needsYou: ReactNode
        /** "Came in since yesterday": a Card with list rows. */
        cameIn: ReactNode
        /** "Late": a Card with list rows. */
        late: ReactNode
      })
    | (T8Rail & {
        variant: 'first-run'
        /** The setup checklist (try it now, the walk-through) in place of needs-you. */
        setup: ReactNode
        cameIn?: ReactNode
        late?: ReactNode
      })
    | {
        variant: 'dashboard'
        /** A row of Card `KPI`s. */
        kpis?: ReactNode
        /** Cards, laid out two to a row. */
        children: ReactNode
      }
  )

/**
 * Template T8 · Today (L2 t8a): `1fr · 320`, 16 apart, on the 16 / 28 body. The main column is the
 * needs-you stack (14 apart), then came in and late as two equal columns, 14 apart.
 */
export default function T8Today(props: T8TodayProps) {
  const { header, banner } = props
  const variant = props.variant ?? 'owner'
  return (
    <div data-template="T8" data-variant={variant} className={TEMPLATE_ROOT}>
      <div data-slot="header" className={TEMPLATE_TOP}>
        {header}
      </div>
      {banner ? (
        <div data-slot="banner" className="flex-none">
          {banner}
        </div>
      ) : null}
      {props.variant === 'dashboard' ? (
        <div data-slot="body" className={cn(TEMPLATE_BODY, 'grid-cols-[minmax(0,1fr)]')}>
          {props.kpis ? (
            <div data-slot="kpis" className="grid auto-cols-fr grid-flow-col gap-3.5">
              {props.kpis}
            </div>
          ) : null}
          <div data-slot="cards" className="grid grid-cols-2 items-start gap-3.5">
            {props.children}
          </div>
        </div>
      ) : (
        <div
          data-slot="body"
          className={cn(TEMPLATE_BODY, 'grid-cols-[minmax(0,1fr)_var(--io-w-today-rail)]')}
        >
          <div data-slot="main" className={TEMPLATE_COLUMN}>
            {props.variant === 'first-run' ? (
              <div data-slot="setup" className={TEMPLATE_COLUMN}>
                {props.setup}
              </div>
            ) : (
              <section data-slot="needs-you" aria-label="Needs you" className={TEMPLATE_COLUMN}>
                {props.needsYou}
              </section>
            )}
            {props.cameIn || props.late ? (
              <div className="grid grid-cols-2 items-start gap-3.5">
                {props.cameIn ? (
                  <div data-slot="came-in" className={TEMPLATE_COLUMN}>
                    {props.cameIn}
                  </div>
                ) : null}
                {props.late ? (
                  <div data-slot="late" className={TEMPLATE_COLUMN}>
                    {props.late}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          <aside
            data-slot="rail"
            aria-label={props.railLabel ?? 'At a glance'}
            className={TEMPLATE_COLUMN}
          >
            {props.rail}
          </aside>
        </div>
      )}
    </div>
  )
}
