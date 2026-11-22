'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type { Route } from 'next'
import Link from 'next/link'
import { useId, type ReactNode } from 'react'
import { cn } from '../lib/cn'
import {
  LAYER,
  menuGroup,
  menuItem,
  menuPanel,
  menuSeparator,
  menuShortcut,
  type MenuWidth,
} from './styles'

export type MenuEntry =
  | {
      type: 'item'
      label: string
      /** Display only ("⌘↵"); the shortcut itself is registered in the hotkeys registry. */
      shortcut?: string
      onSelect?: () => void
      /** Renders the item as a link (opens in a new tab, shows its URL). */
      href?: string
      danger?: boolean
      disabled?: boolean
    }
  | { type: 'separator' }
  /** A heading; the items after it (up to the next separator or heading) form a labelled group. */
  | { type: 'group'; label: string }

export interface MenuProps {
  /** The button that opens it (DropdownMenu.Trigger asChild). It must have a name of its own. */
  trigger: ReactNode
  items: readonly MenuEntry[]
  /** Default 240. */
  width?: MenuWidth
  align?: 'start' | 'end'
  className?: string
}

type Item = Extract<MenuEntry, { type: 'item' }>
type Block =
  | { kind: 'items'; items: Item[] }
  | { kind: 'group'; label: string; items: Item[] }
  | { kind: 'separator' }

/** Flat entries → runs of items, labelled groups and separators. */
export function blocksOf(entries: readonly MenuEntry[]): Block[] {
  const out: Block[] = []
  let current: Extract<Block, { items: Item[] }> | null = null
  for (const e of entries) {
    if (e.type === 'separator') {
      out.push({ kind: 'separator' })
      current = null
    } else if (e.type === 'group') {
      current = { kind: 'group', label: e.label, items: [] }
      out.push(current)
    } else {
      if (!current) {
        current = { kind: 'items', items: [] }
        out.push(current)
      }
      current.items.push(e)
    }
  }
  return out
}

/**
 * Overlay kit `Menu` on Radix DropdownMenu: roving focus with arrow keys (wrapping), typeahead on the
 * label, Escape closes and returns focus to the trigger. Items: shortcut text, danger, disabled, links.
 */
export default function Menu({
  trigger,
  items,
  width = 240,
  align = 'start',
  className,
}: MenuProps) {
  const id = useId()
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          sideOffset={4}
          loop
          className={cn(menuPanel({ width }), LAYER.float, className)}
        >
          {blocksOf(items).map((b, i) => {
            if (b.kind === 'separator')
              return <DropdownMenu.Separator key={`s${i}`} className={menuSeparator} />
            const rows = b.items.map((it) => <MenuRow key={it.label} item={it} />)
            if (b.kind === 'items') return rows
            const labelId = `${id}-g${i}`
            return (
              <DropdownMenu.Group key={`g${i}`} aria-labelledby={labelId}>
                <DropdownMenu.Label id={labelId} className={menuGroup}>
                  {b.label}
                </DropdownMenu.Label>
                {rows}
              </DropdownMenu.Group>
            )
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

function MenuRow({ item }: { item: Item }) {
  const inner = (
    <>
      <span>{item.label}</span>
      {item.shortcut ? <span className={menuShortcut}>{item.shortcut}</span> : null}
    </>
  )
  const className = menuItem({ danger: item.danger ?? false })
  const common = {
    textValue: item.label,
    className,
    ...(item.disabled ? { disabled: true } : {}),
    ...(item.danger ? { 'data-danger': '' } : {}),
    ...(item.onSelect ? { onSelect: item.onSelect } : {}),
  }
  if (item.href)
    return (
      <DropdownMenu.Item asChild {...common}>
        <Link href={item.href as Route}>{inner}</Link>
      </DropdownMenu.Item>
    )
  return <DropdownMenu.Item {...common}>{inner}</DropdownMenu.Item>
}
