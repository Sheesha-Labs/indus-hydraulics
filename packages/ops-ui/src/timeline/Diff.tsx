import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

export interface DiffRow {
  field: string
  was: ReactNode
  now: ReactNode
  /** Unchanged: both sides render in ink-4, with no <del>/<ins>. */
  same?: boolean
}

export interface DiffProps {
  wasLabel: string
  nowLabel: string
  /** Header of the first column. Default "Field". */
  fieldLabel?: string
  rows: readonly DiffRow[]
  className?: string
}

const ROW =
  'border-io-line-2 grid grid-cols-[140px_minmax(0,1fr)_minmax(0,1fr)] items-baseline gap-3 border-b px-3.5 py-[9px] last:border-b-0'

/** Before/after (kit K-08 Diff): old struck on bad-tint, new on ok-tint, unchanged in ink-4. */
export default function Diff({
  wasLabel,
  nowLabel,
  fieldLabel = 'Field',
  rows,
  className,
}: DiffProps) {
  return (
    <div
      role="table"
      aria-label={`${wasLabel} compared with ${nowLabel}`}
      className={cn(
        'rounded-io-card border-io-line bg-io-card flex w-full flex-col overflow-hidden border text-[12.5px]',
        className
      )}
    >
      <div role="row" className={cn(ROW, 'io-eyebrow bg-io-paper')}>
        <span role="columnheader">{fieldLabel}</span>
        <span role="columnheader">{wasLabel}</span>
        <span role="columnheader">{nowLabel}</span>
      </div>
      {rows.map((r) => (
        <div role="row" key={r.field} className={ROW}>
          <span role="rowheader" className="text-io-ink-3">
            {r.field}
          </span>
          {r.same ? (
            <>
              <span role="cell" className="text-io-ink-4">
                {r.was}
              </span>
              <span role="cell" className="text-io-ink-4">
                {r.now}
              </span>
            </>
          ) : (
            <>
              <span role="cell" className="grid">
                <del className="rounded-io-3 bg-io-bad-tint text-io-bad px-[3px]">{r.was}</del>
              </span>
              <span role="cell" className="grid">
                <ins className="rounded-io-3 bg-io-ok-tint text-io-ok px-[3px] no-underline">
                  {r.now}
                </ins>
              </span>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
