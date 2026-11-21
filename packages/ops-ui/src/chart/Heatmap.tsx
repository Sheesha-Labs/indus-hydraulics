import { cn } from '../lib/cn'
import ChartFigure, { type ChartFrame } from './ChartFigure'

export interface HeatmapRow {
  key: string
  label: string
  values: readonly number[]
}

export interface HeatmapProps extends ChartFrame {
  /** 1–8 columns. */
  columns: readonly string[]
  rows: readonly HeatmapRow[]
}

export type HeatLevel = 'high' | 'mid' | 'low' | 'none'

/** Kit scale: ≥4 high, ≥2 mid, ≥1 low, otherwise none. */
export function heatLevel(v: number): HeatLevel {
  return v >= 4 ? 'high' : v >= 2 ? 'mid' : v >= 1 ? 'low' : 'none'
}

export const HEAT_CLASS: Record<HeatLevel, string> = {
  high: 'bg-io-bad-solid text-white',
  mid: 'bg-io-bad-tint text-io-bad',
  low: 'bg-io-warn-tint text-io-warn',
  none: 'bg-io-paper text-io-ink-4',
}

/** Label column 140 + N equal columns; static strings so Tailwind builds them. */
const COLS = [
  'grid-cols-[140px_repeat(1,minmax(0,1fr))]',
  'grid-cols-[140px_repeat(2,minmax(0,1fr))]',
  'grid-cols-[140px_repeat(3,minmax(0,1fr))]',
  'grid-cols-[140px_repeat(4,minmax(0,1fr))]',
  'grid-cols-[140px_repeat(5,minmax(0,1fr))]',
  'grid-cols-[140px_repeat(6,minmax(0,1fr))]',
  'grid-cols-[140px_repeat(7,minmax(0,1fr))]',
  'grid-cols-[140px_repeat(8,minmax(0,1fr))]',
] as const

/** Counts by row and column (kit K-12 Heatmap). Every cell prints its number; zero prints "—". */
export default function Heatmap({ columns, rows, ...frame }: HeatmapProps) {
  const n = Math.max(1, Math.min(columns.length, COLS.length))
  const cols = columns.slice(0, n)
  return (
    <ChartFigure
      {...frame}
      table={{
        head: ['', ...cols],
        rows: rows.map((r) => ({
          key: r.key,
          cells: [r.label, ...cols.map((_, i) => String(r.values[i] ?? 0))],
        })),
      }}
    >
      <div aria-hidden="true" className={cn('grid gap-0.5 text-[12px]', COLS[n - 1])}>
        <span />
        {cols.map((c) => (
          <span
            key={c}
            className="text-io-ink-3 grid [place-items:end_center] py-1 text-center text-[11px] leading-[1.2]"
          >
            {c}
          </span>
        ))}
        {rows.map((r) => [
          <span
            key={`${r.key}-l`}
            className="grid h-[34px] [place-items:center_start] pl-0.5 text-[12.5px]"
          >
            {r.label}
          </span>,
          ...cols.map((c, i) => {
            const v = r.values[i] ?? 0
            const level = heatLevel(v)
            return (
              <span
                key={`${r.key}-${c}`}
                data-level={level}
                className={cn(
                  'rounded-io-3 grid h-[34px] place-items-center text-[11.5px]',
                  HEAT_CLASS[level]
                )}
              >
                {level === 'none' ? '—' : v}
              </span>
            )
          }),
        ])}
      </div>
    </ChartFigure>
  )
}
