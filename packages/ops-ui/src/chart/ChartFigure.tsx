import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

export interface ChartFrame {
  /** Eyebrow title; also the figure caption and the hidden table's caption. */
  title?: string
  /** Right-aligned note in the head, e.g. "Guardrail 12%". */
  foot?: ReactNode
  /** No card: no border, padding or ground. */
  bare?: boolean
  className?: string
}

export interface ChartDataTable {
  head: readonly string[]
  rows: readonly { key: string; cells: readonly string[] }[]
}

interface ChartFigureProps extends ChartFrame {
  /** The same data as the picture, rendered as a visually hidden table. */
  table: ChartDataTable
  children: ReactNode
}

/**
 * Every chart is a <figure> with a <figcaption> (the eyebrow title) and a visually hidden data <table>;
 * the drawing itself is aria-hidden by each part (05 §3.9 accessibility).
 */
export default function ChartFigure({
  title,
  foot,
  bare,
  className,
  table,
  children,
}: ChartFigureProps) {
  return (
    <figure
      className={cn(
        'flex w-full min-w-0 flex-col gap-3',
        !bare && 'rounded-io-card border-io-line bg-io-card border px-[18px] py-4',
        className
      )}
    >
      {title ? (
        <figcaption className="flex items-baseline justify-between gap-2.5">
          <span className="io-eyebrow">{title}</span>
          {foot ? <span className="text-io-ink-3 text-[11.5px]">{foot}</span> : null}
        </figcaption>
      ) : null}
      {children}
      <table className="sr-only">
        {title ? <caption>{title}</caption> : null}
        <thead>
          <tr>
            {table.head.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((r) => (
            <tr key={r.key}>
              {r.cells.map((c, i) =>
                i === 0 ? (
                  <th key={i} scope="row">
                    {c}
                  </th>
                ) : (
                  <td key={i}>{c}</td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
