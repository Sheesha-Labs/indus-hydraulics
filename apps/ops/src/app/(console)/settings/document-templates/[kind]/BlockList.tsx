'use client'

import {
  BLOCK_LABEL,
  FIXED_BLOCKS,
  REQUIRED_BLOCKS,
  blockHint,
  type DocKind,
  type TemplateBlock,
} from '@indus/ops-core'
import { Button, Checkbox, Toggle } from '@indus/ops-ui/controls'
import { cn } from '@indus/ops-ui'
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react'
import { useState } from 'react'

interface BlockListProps {
  kind: DocKind
  blocks: TemplateBlock[]
  readOnly: boolean
  onChange: (blocks: TemplateBlock[]) => void
}

/**
 * Board 57's block list: one row per block with its hint and a Toggle. Body blocks reorder by drag, or with
 * the Move up / Move down buttons (the keyboard path); the letterhead, header, parties, subject and footer are
 * drawn in a fixed place by the layout, so they do not move. Required blocks are locked on.
 */
export default function BlockList({ kind, blocks, readOnly, onChange }: BlockListProps) {
  const [dragging, setDragging] = useState<string | null>(null)
  const movable = blocks.filter((b) => !FIXED_BLOCKS.has(b.key)).map((b) => b.key)

  function move(key: string, to: number) {
    const from = blocks.findIndex((b) => b.key === key)
    const target = blocks.findIndex((b) => b.key === movable[to])
    if (from < 0 || target < 0 || from === target) return
    const next = [...blocks]
    const [b] = next.splice(from, 1)
    next.splice(target, 0, b!)
    onChange(next)
  }
  const set = (key: string, patch: Partial<TemplateBlock>) =>
    onChange(blocks.map((b) => (b.key === key ? { ...b, ...patch } : b)))

  return (
    <ol aria-label="Blocks" className="m-0 flex list-none flex-col gap-1.5 p-0">
      {blocks.map((b) => {
        const fixed = FIXED_BLOCKS.has(b.key)
        const i = movable.indexOf(b.key)
        const label = BLOCK_LABEL[b.key]
        return (
          <li
            key={b.key}
            data-block={b.key}
            data-state={b.on ? 'on' : 'off'}
            draggable={!fixed && !readOnly}
            onDragStart={() => setDragging(b.key)}
            onDragEnd={() => setDragging(null)}
            onDragOver={(e) => {
              if (dragging && !fixed && dragging !== b.key) e.preventDefault()
            }}
            onDrop={(e) => {
              e.preventDefault()
              if (dragging && !fixed) move(dragging, i)
              setDragging(null)
            }}
            className={cn(
              'rounded-io-ctl border-io-line bg-io-card flex flex-col gap-1.5 border px-3 py-2',
              dragging === b.key && 'border-io-accent bg-io-accent-wash'
            )}
          >
            <div className="flex min-h-[26px] items-center gap-3 text-[13px]">
              <GripVertical
                aria-hidden
                strokeWidth={1.75}
                className={cn('size-3.5 flex-none', fixed ? 'text-io-line' : 'text-io-ink-3')}
              />
              <span className="w-[150px] flex-none font-medium">{label}</span>
              <span className="text-io-ink-3 min-w-0 flex-1 truncate text-[12px]">
                {blockHint(kind, b.key)}
              </span>
              {fixed || readOnly ? null : (
                <span className="flex flex-none gap-0.5">
                  <Button
                    size="xs"
                    variant="ghost"
                    icon={ArrowUp}
                    aria-label={`Move ${label} up`}
                    disabled={i <= 0}
                    onClick={() => move(b.key, i - 1)}
                  />
                  <Button
                    size="xs"
                    variant="ghost"
                    icon={ArrowDown}
                    aria-label={`Move ${label} down`}
                    disabled={i >= movable.length - 1}
                    onClick={() => move(b.key, i + 1)}
                  />
                </span>
              )}
              <Toggle
                checked={b.on}
                aria-label={label}
                disabled={readOnly && !REQUIRED_BLOCKS.has(b.key)}
                {...(REQUIRED_BLOCKS.has(b.key)
                  ? { locked: { reason: 'Every document has one' } }
                  : { onCheckedChange: (on: boolean) => set(b.key, { on }) })}
              />
            </div>
            {b.key === 'subject' && b.on ? (
              <div className="pl-[26px]">
                <Checkbox
                  label="Upper case"
                  checked={!!b.settings?.upperCase}
                  disabled={readOnly}
                  onChange={(e) => set(b.key, { settings: { upperCase: e.currentTarget.checked } })}
                />
              </div>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
