// Table kit types (05 §3.3), with one change (decision, S01-T05): Column has NO `width`.
//
// The kit lays a row out from a CSS grid template built from its columns' widths. Ops bans inline
// `style`, and Tailwind only generates classes it can read as literals in source, so a template string
// assembled from column data at runtime would compile to nothing. Instead DataTableProps carries a
// required `gridClass`: one static class literal, written at the call site, holding every track in
// column order, applied to the header and to every row. Example call site:
//
//   <DataTable
//     caption="Enquiry lines"
//     gridClass="grid-cols-[28px_150px_minmax(0,1.6fr)_50px_100px_130px]"
//     columns={linesColumns}
//     rows={lines}
//     rowKey={(l) => l.id}
//   />
//
// With `selectable` (DataTableClient) the first track is the 16px check column:
// gridClass="grid-cols-[16px_minmax(0,1.4fr)_150px_110px]".
import type { ReactNode } from 'react'
import type { StatusFamily, StatusWord } from '../status'

/**
 * text: ink. ref: accent 500, nowrap, carries the row link. num / money: right-aligned (a "(…)" value is
 * bad, "—" is ink-4, a word such as "No reply" is muted). chip: a Status chip from the column's family.
 * muted: ink-3. check: a 16px column for a mark (selection checkboxes come from DataTableClient).
 */
export type ColumnType = 'text' | 'ref' | 'num' | 'money' | 'chip' | 'muted' | 'check'

/**
 * A chip column declares its status family, and the word is type-checked against it (the kit's private
 * word → tone map is not ported). `word` may return undefined for a row with no status; the cell then
 * shows `value` as plain text.
 */
export type ChipColumn<R> = {
  [F in StatusFamily]: { family: F; word: (row: R) => StatusWord<F> | undefined }
}[StatusFamily]

export interface Column<R> {
  key: string
  /** Header text; '' only for a 'check' column or with srLabel. */
  label: string
  type: ColumnType
  /** Main cell content: text, a formatted amount ("12,400.00", "(1,283.00)", "—"), or a node. */
  value: (row: R) => ReactNode
  /** Second line, 11.5 ink-3 (kit `key_sub`). */
  sub?: (row: R) => ReactNode
  /** Small tag after the value (kit `key_br`), e.g. a maker's name. */
  brand?: (row: R) => string | undefined
  /** Required when type is 'chip'. */
  chip?: ChipColumn<R>
  /** The record link. On a 'ref' column it is stretched over the row: one tab stop, middle-click works. */
  href?: (row: R) => string | undefined
  /** Sortable: the header becomes a link built by DataTableProps.sortHref, with aria-sort. */
  sort?: { key: string }
  /** Accessible header text for a blank or icon-only header. */
  srLabel?: string
}

export type RowKind = 'item' | 'group' | 'total' | 'grand'
export type RowTone = 'sel' | 'flag' | 'bad' | 'mute' | 'strike'
export type SortDir = 'asc' | 'desc'

export interface DataTableProps<R> {
  /** Read by screen readers only, and required: "Enquiry lines". */
  caption: string
  columns: readonly Column<R>[]
  rows: readonly R[]
  rowKey: (row: R) => string
  /**
   * A static grid-template class literal, one track per visible column in order, e.g.
   * "grid-cols-[150px_minmax(0,1.6fr)_90px]". Never built at runtime (see the file header).
   */
  gridClass: string
  /** Default 'item'. */
  rowKind?: (row: R) => RowKind
  /** Label of a 'group' row. */
  groupLabel?: (row: R) => ReactNode
  rowTone?: (row: R) => RowTone | undefined
  /** Forces the 'sel' tone on that row (index preview, Compare focus) and marks it aria-current. */
  selectedKey?: string
  dense?: boolean
  bare?: boolean
  /** Row hover ground. Default true. */
  hover?: boolean
  /** Column keys to drop (kit `hide`). The gridClass must then list the remaining tracks only. */
  hide?: readonly string[]
  foot?: ReactNode
  footRight?: ReactNode
  sort?: { key: string; dir: SortDir }
  /** The URL for sorting by a column; sorting is a link so table state lives in the URL (05 §7.4). */
  sortHref?: (key: string, dir: SortDir) => string
  /** Shown in place of the body when there are no rows (States EmptyState or InlineState). */
  empty?: ReactNode
  /** Total row count when paginated: sets aria-rowcount and aria-rowindex. */
  rowCount?: number
  /** 1-based position of the first row of this page in the full list (default 1). */
  firstRowIndex?: number
  /** Header sticks to the top of the scroll container. */
  stickyHeader?: boolean
  className?: string
}

export interface DataTableClientProps<R> extends DataTableProps<R> {
  /** A real checkbox per row (named by `label`) and a header "select all" that shows mixed. */
  selectable?: {
    selected: ReadonlySet<string>
    onChange: (next: Set<string>) => void
    label: (row: R) => string
  }
  /** Enter or double-click on a row. */
  onActivate?: (row: R) => void
  /** J/K or ↑/↓ move selectedKey, Enter activates, X toggles the row's check. Needs onSelectedKeyChange. */
  keyboard?: boolean
  onSelectedKeyChange?: (key: string) => void
}
