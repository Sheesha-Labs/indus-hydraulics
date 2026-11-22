'use client'

import { useRef, type KeyboardEvent } from 'react'
import Checkbox from '../controls/Checkbox'
import { DataTableView, type DataTableViewExtras } from './DataTable'
import type { DataTableClientProps } from './types'

/** Keys that belong to a control the user is typing in or operating, never to row movement. */
function isTyping(target: EventTarget): boolean {
  const el = target as HTMLElement
  return (
    el.isContentEditable ||
    el.tagName === 'TEXTAREA' ||
    el.tagName === 'SELECT' ||
    (el.tagName === 'INPUT' && (el as HTMLInputElement).type !== 'checkbox')
  )
}

/**
 * The client wrapper around the Table kit view: real selection checkboxes (header "select all" shows
 * mixed) and keyboard row movement. Keys are read only while focus is inside the table, so the page keeps
 * its own shortcuts: J/K or ↓/↑ move `selectedKey` and focus that row's link (or checkbox), Enter
 * activates the selected row, X toggles its check. The stretched link stays the row's one tab stop.
 *
 * With `selectable`, the gridClass's first track is the 16px check column.
 */
export default function DataTableClient<R>({
  selectable,
  onActivate,
  keyboard = false,
  onSelectedKeyChange,
  ...props
}: DataTableClientProps<R>) {
  const tableRef = useRef<HTMLDivElement>(null)
  const { rows, rowKey, rowKind, selectedKey } = props
  const items = rows.filter((r) => (rowKind?.(r) ?? 'item') === 'item')

  const toggle = (key: string) => {
    if (!selectable) return
    const next = new Set(selectable.selected)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    selectable.onChange(next)
  }

  const focusRow = (key: string) => {
    const row = tableRef.current?.querySelector<HTMLElement>(`[data-key="${CSS.escape(key)}"]`)
    const target =
      row?.querySelector<HTMLElement>('a[href]') ?? row?.querySelector<HTMLElement>('input') ?? row
    target?.focus()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!keyboard || e.altKey || e.ctrlKey || e.metaKey || isTyping(e.target)) return
    const at = items.findIndex((r) => rowKey(r) === selectedKey)
    const move = (step: number) => {
      const next = items[Math.min(items.length - 1, Math.max(0, at === -1 ? 0 : at + step))]
      if (!next) return
      e.preventDefault()
      const key = rowKey(next)
      onSelectedKeyChange?.(key)
      focusRow(key)
    }
    const current = at === -1 ? undefined : items[at]
    switch (e.key) {
      case 'j':
      case 'ArrowDown':
        move(1)
        break
      case 'k':
      case 'ArrowUp':
        move(-1)
        break
      case 'x':
        if (current && selectable) {
          e.preventDefault()
          toggle(rowKey(current))
        }
        break
      case 'Enter':
        // A focused link follows itself; Enter elsewhere in the row (its checkbox) activates the row.
        if (current && onActivate && (e.target as HTMLElement).tagName !== 'A') {
          e.preventDefault()
          onActivate(current)
        }
        break
    }
  }

  const keys = items.map(rowKey)
  const count = selectable ? keys.filter((k) => selectable.selected.has(k)).length : 0
  const all = count > 0 && count === keys.length

  const extras: DataTableViewExtras<R> = {
    tableAttrs: { ref: tableRef, onKeyDown },
    rowAttrs: (row) => ({
      ...(onActivate ? { onDoubleClick: () => onActivate(row) } : {}),
      ...(selectable?.selected.has(rowKey(row)) ? { 'data-checked': 'true' } : {}),
    }),
    ...(selectable
      ? {
          lead: {
            header: (
              <Checkbox
                className="[&>span]:mt-0"
                aria-label="Select all rows"
                checked={all ? true : count > 0 ? 'mixed' : false}
                onChange={() => selectable.onChange(all ? new Set() : new Set(keys))}
              />
            ),
            cell: (row: R) => (
              <Checkbox
                className="[&>span]:mt-0"
                aria-label={selectable.label(row)}
                checked={selectable.selected.has(rowKey(row))}
                onChange={() => toggle(rowKey(row))}
              />
            ),
          },
        }
      : {}),
  }

  return <DataTableView<R> {...props} extras={extras} />
}
