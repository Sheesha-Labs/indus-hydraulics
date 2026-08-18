import * as React from 'react'
import { cn } from './lib/utils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './Table'

/**
 * A list rendered from a column definition rather than by hand.
 *
 * Thirty-two admin files draw their own table today, most of them as a CSS
 * grid with a hard-coded `grid-cols-[...]` template repeated once for the
 * header and once for each row. That shape has three failure modes this
 * removes: the two templates drift apart (the product editor's sub-tables
 * declare five columns for the display row and seven for that row's own edit
 * row, so the layout jumps the instant you click Edit); fixed pixel widths
 * leave a gulf on a wide screen because only the first column flexes; and each
 * copy invents its own padding, so no two lists in the console line up.
 *
 * Column widths are a PERCENTAGE on the primary column and automatic
 * everywhere else — the browser is better at distributing the remainder than a
 * pixel guess is, and it stays right at every viewport width.
 *
 * This is a Server Component. It takes data and renders markup; nothing here
 * needs a handler. Keep it that way — a `'use client'` here would make every
 * caller's cell renderer cross the RSC boundary.
 */

export interface DataTableColumn<Row> {
  /** Stable key. Also the React key for the cell. */
  key: string
  header: React.ReactNode
  /** Cell renderer. Gets the row and its index. */
  cell: (row: Row, index: number) => React.ReactNode
  /**
   * Width for THIS column only, from a fixed scale. Set it on the ONE primary
   * column and leave the rest undefined; the browser distributes the remainder
   * better than a pixel guess, and it stays right at every viewport width.
   *
   * A scale rather than a free string for two reasons. Tailwind compiles class
   * names by scanning source text, so `w-[${value}]` built at runtime emits no
   * CSS at all and silently does nothing. And the alternative — an inline
   * `style` — is banned by CLAUDE.md §2.1.
   */
  width?: ColumnWidth
  align?: 'left' | 'right' | 'center'
  /** Mono + tabular figures. Use for quantities, prices, dates, durations. */
  numeric?: boolean
  /** Hide below `md`. For columns that are context rather than identity. */
  secondary?: boolean
}

export interface DataTableProps<Row> {
  columns: Array<DataTableColumn<Row>>
  rows: Row[]
  /** Stable identity per row. Index is a last resort, not a default. */
  rowKey: (row: Row, index: number) => string
  /** Shown in place of the body when `rows` is empty. */
  emptyState?: React.ReactNode
  /**
   * Below this the container scrolls horizontally rather than crushing the
   * columns. Every admin table wants one; `md` suits five or six columns of
   * prose and identifiers. Same fixed-scale reasoning as `width`.
   */
  minWidth?: keyof typeof MIN_WIDTH
  className?: string
}

const ALIGN: Record<NonNullable<DataTableColumn<unknown>['align']>, string> = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
}

/** Percentages, because the primary column should scale with the viewport. */
const COLUMN_WIDTH = {
  '25%': 'w-[25%]',
  '30%': 'w-[30%]',
  '35%': 'w-[35%]',
  '40%': 'w-[40%]',
  '44%': 'w-[44%]',
  '50%': 'w-[50%]',
  '60%': 'w-[60%]',
} as const
export type ColumnWidth = keyof typeof COLUMN_WIDTH

const MIN_WIDTH = {
  none: '',
  sm: 'min-w-[560px]',
  md: 'min-w-[720px]',
  lg: 'min-w-[960px]',
  xl: 'min-w-[1120px]',
} as const

export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  emptyState,
  minWidth = 'md',
  className,
}: DataTableProps<Row>) {
  return (
    <Table className={cn(MIN_WIDTH[minWidth], className)}>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead
              key={column.key}
              {...(column.numeric ? { numeric: true } : {})}
              className={cn(
                column.width && COLUMN_WIDTH[column.width],
                column.align && ALIGN[column.align],
                column.secondary && 'hidden md:table-cell'
              )}
            >
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            {/*
              The empty state lives INSIDE the table, spanning every column, so
              the header stays put and the container keeps its shape. Swapping
              the whole card for a dashed box — which thirty admin pages do
              today — makes the page jump between "has rows" and "has none".
            */}
            <TableCell colSpan={columns.length} className="py-14 text-center text-ih-muted">
              {emptyState ?? 'Nothing here yet.'}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row, index) => (
            <TableRow key={rowKey(row, index)}>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  {...(column.numeric ? { numeric: true } : {})}
                  className={cn(
                    /*
                      Cells do not wrap. A SKU or a category name breaking onto
                      a second line makes that ONE row taller than its
                      neighbours, and a list whose rows are three different
                      heights reads as broken even when every row is correct.
                      The container scrolls instead — that is what `minWidth`
                      is for. A column that genuinely holds prose truncates in
                      its own `cell`.
                    */
                    'whitespace-nowrap',
                    column.align && ALIGN[column.align],
                    column.secondary && 'hidden md:table-cell'
                  )}
                >
                  {column.cell(row, index)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
