import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

export interface StatRow {
  label: string
  value: ReactNode
  /** The total row: a line above, 12.5, label in ink 500. */
  total?: boolean
}

export interface StatProps {
  rows: StatRow[]
  className?: string
}

/** Card kit stat box (`kr-st`): a small totals <dl> on paper, line, radius 6, p 10×12, 11.5. */
export default function Stat({ rows, className }: StatProps) {
  return (
    <dl
      data-part="stat"
      className={cn(
        'rounded-io-ctl border-io-line bg-io-paper m-0 flex min-w-0 flex-col gap-1.5 border px-3 py-2.5 text-[11.5px] leading-[1.45]',
        className
      )}
    >
      {rows.map((r) => (
        <div
          key={r.label}
          className={cn(
            'flex items-center justify-between gap-2.5',
            r.total && 'border-io-line border-t pt-1.5 text-[12.5px]'
          )}
        >
          <dt className={r.total ? 'text-io-ink font-medium' : 'text-io-ink-3'}>{r.label}</dt>
          <dd className="m-0 font-medium">{r.value}</dd>
        </div>
      ))}
    </dl>
  )
}
