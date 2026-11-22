import { useId, type HTMLAttributes, type ReactNode, type Ref } from 'react'
import { cn } from '../lib/cn'
import { BodyCell, HeaderCell } from './cells'
import type { DataTableProps, RowKind, RowTone } from './types'

/**
 * Table kit `kt-tb`. Rows are ARIA-role divs on a CSS grid, not <tr>: grid tracks with fr units cannot be
 * a <colgroup>, and display:grid on a <tr> strips its table semantics in WebKit. The grid template is the
 * caller's static `gridClass` (see types.ts). Shared: renders on the server; DataTableClient wraps the same
 * view with selection and keyboard row movement.
 */
export default function DataTable<R>(props: DataTableProps<R>) {
  return <DataTableView {...props} />
}

type RowAttrs = HTMLAttributes<HTMLDivElement> & Partial<Record<`data-${string}`, string>>

/** What DataTableClient adds to the shared view. Not part of the public API. */
export interface DataTableViewExtras<R> {
  /** A leading column (the selection checkboxes): its header and one cell per item row. */
  lead?: { header: ReactNode; cell: (row: R) => ReactNode }
  rowAttrs?: (row: R, index: number) => RowAttrs
  tableAttrs?: HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> }
}

const ROW = 'relative grid items-center gap-2.5 border-b border-io-line-2'
const ROW_SIZE = {
  regular: 'min-h-io-row px-3.5 py-[9px] text-io-cell',
  dense: 'min-h-io-row-dense px-3 py-1.5 text-[12px] leading-[1.45]',
}
const KIND: Record<RowKind, string> = {
  item: '',
  group: 'io-eyebrow bg-io-paper min-h-io-row-group text-[10.5px]',
  total: 'border-t-io-ink border-t font-medium',
  grand: 'border-t-io-ink bg-io-paper border-t text-[13px] font-medium',
}
const TONE: Record<RowTone, string> = {
  // ink-3 on accent-wash is 4.39:1; muted text in a selected row takes ink-3-sel (4.77:1).
  sel: 'bg-io-accent-wash shadow-[inset_3px_0_0_var(--io-accent)] [&_.text-io-ink-3]:text-io-ink-3-sel',
  flag: 'bg-io-flag-row',
  bad: 'bg-io-bad-hover-tint',
  // The kit mutes and strikes in ink-4, which is 2.8:1 on white (axe serious); ink-3 is the readable grey.
  mute: 'text-io-ink-3',
  // The cells strike themselves (BodyCell), so a chip in the row is not struck.
  strike: '',
}

/** The shared table view: DataTable renders it as is; DataTableClient passes `extras`. */
export function DataTableView<R>({
  caption,
  columns: allColumns,
  rows,
  rowKey,
  gridClass,
  rowKind,
  groupLabel,
  rowTone,
  selectedKey,
  dense = false,
  bare = false,
  hover = true,
  hide,
  foot,
  footRight,
  sort,
  sortHref,
  empty,
  rowCount,
  firstRowIndex = 1,
  stickyHeader = false,
  className,
  extras = {},
}: DataTableProps<R> & { extras?: DataTableViewExtras<R> }) {
  const captionId = useId()
  const columns = hide?.length ? allColumns.filter((c) => !hide.includes(c.key)) : allColumns
  const span = columns.length + (extras.lead ? 1 : 0)
  const paginated = rowCount !== undefined
  const hasFoot = foot !== undefined || footRight !== undefined
  const size = dense ? ROW_SIZE.dense : ROW_SIZE.regular
  const { ref: tableRef, ...tableAttrs } = extras.tableAttrs ?? {}

  return (
    <div
      data-part="table"
      className={cn(
        'bg-io-card flex min-w-0 flex-col overflow-clip',
        bare ? 'rounded-none border-0' : 'rounded-io-card border-io-line border',
        className
      )}
    >
      <span id={captionId} className="sr-only">
        {caption}
      </span>
      <div
        {...tableAttrs}
        ref={tableRef}
        role="table"
        aria-labelledby={captionId}
        {...(paginated ? { 'aria-rowcount': rowCount + 1 } : {})}
        className="flex flex-col"
      >
        <div role="rowgroup" className={cn(stickyHeader && 'z-io-sticky sticky top-0')}>
          <div
            role="row"
            {...(paginated ? { 'aria-rowindex': 1 } : {})}
            className={cn(
              ROW,
              size,
              gridClass,
              'io-eyebrow bg-io-paper min-h-io-row-head border-io-line text-[10.5px]'
            )}
          >
            {extras.lead ? (
              <span role="columnheader" className="grid place-items-center">
                {extras.lead.header}
              </span>
            ) : null}
            {columns.map((c) => (
              <HeaderCell key={c.key} column={c} sort={sort} sortHref={sortHref} />
            ))}
          </div>
        </div>
        {rows.length > 0 ? (
          <div role="rowgroup">
            {rows.map((row, i) => {
              const key = rowKey(row)
              const kind = rowKind?.(row) ?? 'item'
              const selected = selectedKey !== undefined && key === selectedKey
              const tone: RowTone | undefined = selected ? 'sel' : rowTone?.(row)
              const index = paginated ? { 'aria-rowindex': firstRowIndex + i + 1 } : {}
              const rowClass = cn(
                ROW,
                size,
                !hasFoot && 'last:border-b-0',
                KIND[kind],
                tone && TONE[tone],
                hover && kind !== 'group' && 'hover:bg-io-row-hover'
              )
              if (kind === 'group')
                return (
                  <div key={key} role="row" {...index} data-kind="group" className={rowClass}>
                    <span role="cell" aria-colspan={span} className="min-w-0">
                      {groupLabel?.(row)}
                    </span>
                  </div>
                )
              return (
                <div
                  key={key}
                  role="row"
                  {...index}
                  {...extras.rowAttrs?.(row, i)}
                  data-key={key}
                  data-kind={kind}
                  {...(tone ? { 'data-tone': tone } : {})}
                  {...(selected ? { 'aria-current': true } : {})}
                  className={cn(rowClass, gridClass)}
                >
                  {extras.lead ? (
                    <span role="cell" className="z-io-raised relative grid place-items-center">
                      {kind === 'item' ? extras.lead.cell(row) : null}
                    </span>
                  ) : null}
                  {columns.map((c) => (
                    <BodyCell key={c.key} column={c} row={row} kind={kind} tone={tone} />
                  ))}
                </div>
              )
            })}
          </div>
        ) : null}
      </div>
      {rows.length === 0 && empty ? empty : null}
      {hasFoot ? (
        <div className="border-io-line bg-io-card text-io-ink-3 flex items-center justify-between border-t px-3.5 py-3 text-[12px]">
          <span>{foot}</span>
          <span>{footRight}</span>
        </div>
      ) : null}
    </div>
  )
}
