import type { Route } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import Chip, { type ChipProps } from '../status/Chip'
import type { Column, ColumnType, RowKind, RowTone, SortDir } from './types'

/** Every cell: clipped to its track with an ellipsis (kit `.tr>span`). */
const CELL = 'min-w-0 overflow-hidden text-ellipsis'

const isRight = (type: ColumnType) => type === 'num' || type === 'money'
const ALIGN_END = 'justify-self-end text-right'

const ARIA_SORT: Record<SortDir, 'ascending' | 'descending'> = {
  asc: 'ascending',
  desc: 'descending',
}

export interface HeaderCellProps<R> {
  column: Column<R>
  sort?: { key: string; dir: SortDir } | undefined
  sortHref?: ((key: string, dir: SortDir) => string) | undefined
}

/**
 * A column header (role columnheader). A sortable one is a link to the next sort (asc first, then the
 * other way), so sorting works without JS and survives a reload; the sorted header carries aria-sort.
 */
export function HeaderCell<R>({ column, sort, sortHref }: HeaderCellProps<R>) {
  const sorted = column.sort && sort?.key === column.sort.key ? sort.dir : undefined
  const label = column.label ? (
    column.label
  ) : (
    <span className="sr-only">{column.srLabel ?? column.key}</span>
  )
  const content =
    column.sort && sortHref ? (
      <Link
        href={sortHref(column.sort.key, sorted === 'asc' ? 'desc' : 'asc') as Route}
        className="io-focus rounded-io-tag hover:text-io-ink inline-flex items-center gap-1"
      >
        {label}
        {sorted ? <span aria-hidden="true">{sorted === 'asc' ? '↑' : '↓'}</span> : null}
      </Link>
    ) : (
      label
    )
  return (
    <span
      role="columnheader"
      {...(sorted ? { 'aria-sort': ARIA_SORT[sorted] } : {})}
      className={cn(CELL, isRight(column.type) && ALIGN_END)}
    >
      {content}
    </span>
  )
}

export interface BodyCellProps<R> {
  column: Column<R>
  row: R
  kind: RowKind
  tone: RowTone | undefined
}

/** Classes a plain value earns by its shape: "(…)" is a negative, "—" is empty, a word in a price column is muted. */
function valueTone(type: ColumnType, v: ReactNode): string | false {
  if (typeof v !== 'string') return false
  if (v.startsWith('(')) return 'text-io-bad'
  if (v === '—') return 'text-io-ink-4'
  if (isRight(type) && !/\d/.test(v)) return 'text-io-ink-3'
  return false
}

/** One body cell (role cell) of an item, total or grand row. */
export function BodyCell<R>({ column, row, kind, tone }: BodyCellProps<R>) {
  const item = kind === 'item'
  const struck = tone === 'strike'

  if (column.type === 'chip' && item && column.chip) {
    const word = column.chip.word(row)
    if (word !== undefined) {
      // The column's family and word were checked together by ChipColumn<R>; the union loses that link.
      const chip = { family: column.chip.family, status: word } as ChipProps
      return (
        <span role="cell" className={CELL}>
          <Chip {...chip} className="h-io-tag px-[7px]" />
        </span>
      )
    }
  }

  const value = column.value(row)
  const href = column.href?.(row)
  const brand = column.brand?.(row)
  const sub = column.sub?.(row)
  const stretched = column.type === 'ref' && item
  const main = href ? (
    <Link
      href={href as Route}
      className={cn(
        'outline-none',
        stretched
          ? "after:absolute after:inset-0 after:content-[''] focus-visible:after:shadow-[inset_0_0_0_2px_var(--io-accent)]"
          : 'io-focus rounded-io-tag text-io-accent hover:underline'
      )}
    >
      {value}
    </Link>
  ) : (
    value
  )
  return (
    <span
      role="cell"
      className={cn(
        CELL,
        isRight(column.type) && ALIGN_END,
        column.type === 'check' && 'grid place-items-center',
        stretched && 'text-io-accent font-medium whitespace-nowrap',
        column.type === 'muted' && 'text-io-ink-3',
        valueTone(column.type, value),
        struck && 'text-io-ink-3 line-through'
      )}
    >
      {main}
      {brand ? (
        <span className="rounded-io-3 bg-io-fill text-io-ink-2 ml-1.5 inline-block px-[5px] text-[10.5px] font-normal">
          {brand}
        </span>
      ) : null}
      {sub ? (
        <small className="text-io-ink-3 mt-px block overflow-hidden text-[11.5px] text-ellipsis whitespace-nowrap">
          {sub}
        </small>
      ) : null}
    </span>
  )
}
