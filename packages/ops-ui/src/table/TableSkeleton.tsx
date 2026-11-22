import Spinner from '../controls/Spinner'
import { cn } from '../lib/cn'

export interface TableSkeletonProps {
  /** Body rows, default 5. */
  rows?: number
  /** Columns 2–8, default 5. The first is 1.6fr, the rest 1fr. */
  cols?: number
  /** Optional visible line under the rows with a spinner, e.g. "Loading lines…". */
  label?: string
  className?: string
}

// Static class literals: Tailwind cannot see a template built at runtime, and inline style is banned.
const GRID: Record<number, string> = {
  2: 'grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]',
  3: 'grid-cols-[minmax(0,1.6fr)_repeat(2,minmax(0,1fr))]',
  4: 'grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]',
  5: 'grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))]',
  6: 'grid-cols-[minmax(0,1.6fr)_repeat(5,minmax(0,1fr))]',
  7: 'grid-cols-[minmax(0,1.6fr)_repeat(6,minmax(0,1fr))]',
  8: 'grid-cols-[minmax(0,1.6fr)_repeat(7,minmax(0,1fr))]',
}
/** The kit's bar widths, cycled by row + column so the rows do not line up. */
const WIDTH = ['w-[60%]', 'w-[90%]', 'w-[45%]', 'w-[70%]', 'w-[55%]', 'w-[80%]', 'w-[40%]']

const ROW = 'border-io-line-2 grid items-center gap-3.5 border-b px-3.5 py-[13px] last:border-b-0'
const BAR = 'io-shimmer rounded-io-3 block h-2.5'

/**
 * States kit Loading (`ke-sk`): the body of every loading.tsx. The region is aria-busy with an sr-only
 * "Loading"; the bars are decorative. The shimmer stops under reduced motion (base.css). Re-exported by
 * the States kit.
 */
export default function TableSkeleton({
  rows = 5,
  cols = 5,
  label,
  className,
}: TableSkeletonProps) {
  const n = Math.min(8, Math.max(2, Math.round(cols)))
  const grid = GRID[n]
  return (
    <div
      role="status"
      aria-busy="true"
      data-part="table-skeleton"
      className={cn(
        'rounded-io-card border-io-line bg-io-card flex w-full flex-col overflow-hidden border',
        className
      )}
    >
      <span className="sr-only">{label ?? 'Loading'}</span>
      <div aria-hidden="true" className={cn(ROW, grid, 'bg-io-paper')}>
        {Array.from({ length: n }, (_, c) => (
          <i key={c} className={cn(BAR, 'h-2 opacity-70', c ? 'w-[50%]' : 'w-[40%]')} />
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} aria-hidden="true" className={cn(ROW, grid)}>
          {Array.from({ length: n }, (_, c) => (
            <i key={c} className={cn(BAR, WIDTH[(r + c) % WIDTH.length])} />
          ))}
        </div>
      ))}
      {label ? (
        <div
          aria-hidden="true"
          className="text-io-ink-3 flex items-center gap-2 px-3.5 py-3 text-[12px]"
        >
          <Spinner className="text-io-accent" />
          {label}
        </div>
      ) : null}
    </div>
  )
}
