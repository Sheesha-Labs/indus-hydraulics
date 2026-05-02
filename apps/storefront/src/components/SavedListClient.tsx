'use client'

import { useState, useTransition, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { updateItemQty, removeItem } from '../app/account/lists/[id]/actions'

type Item = {
  id: string
  sku: string
  title: string
  brand?: string
  qty: number
  note?: string
  imageUrl?: string
}

type Props = {
  listId: string
  items: Item[]
}

export default function SavedListClient({ listId, items: initialItems }: Props) {
  const [items, setItems] = useState(initialItems)
  const [isPending, startTransition] = useTransition()
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const handleQtyChange = useCallback(
    (itemId: string, newQty: number) => {
      if (newQty < 1) return
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, qty: newQty } : i)))
      clearTimeout(debounceTimers.current[itemId])
      debounceTimers.current[itemId] = setTimeout(() => {
        startTransition(() => updateItemQty(itemId, newQty, listId))
      }, 500)
    },
    [listId]
  )

  function handleRemove(itemId: string) {
    setItems((prev) => prev.filter((i) => i.id !== itemId))
    startTransition(() => removeItem(itemId, listId))
  }

  if (items.length === 0) {
    return (
      <div className="py-12 border border-dashed border-[var(--color-border)] text-center mb-4">
        <p className="text-[var(--color-muted)] text-[13px]">No items in this list.</p>
        <Link href={`/c`} className="mt-3 inline-block font-mono text-[12px] text-[var(--color-accent)] hover:underline">
          Browse products →
        </Link>
      </div>
    )
  }

  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] overflow-hidden">
      {/* Column header */}
      <div
        className="grid gap-3.5 px-[18px] py-2.5 bg-[var(--color-deep)] border-b border-[var(--color-border)] font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--color-muted)]"
        style={{ gridTemplateColumns: '64px 1fr 130px 32px' }}
      >
        <div />
        <div>Product · SKU</div>
        <div className="text-center">Qty</div>
        <div />
      </div>

      {items.map((item) => (
        <div
          key={item.id}
          className="grid gap-3.5 items-center px-[18px] py-3.5 border-b border-[var(--color-border-2)] last:border-0"
          style={{ gridTemplateColumns: '64px 1fr 130px 32px' }}
        >
          {/* Image */}
          <div className="w-16 h-16 bg-[var(--color-deep)] border border-[var(--color-border)] relative overflow-hidden shrink-0">
            {item.imageUrl ? (
              <Image src={item.imageUrl} alt={item.title} fill className="object-contain p-1.5" sizes="64px" />
            ) : (
              <div className="absolute inset-0 grid place-items-center font-mono text-[9px] text-[var(--color-muted)]">IMG</div>
            )}
          </div>

          {/* Product info */}
          <div>
            <Link
              href={`/p/${item.sku}`}
              className="font-medium text-[13px] hover:text-[var(--color-accent)] transition-colors leading-snug"
            >
              {item.title}
            </Link>
            <div className="font-mono text-[11px] text-[var(--color-muted)] mt-0.5">
              {item.sku}{item.brand ? ` · ${item.brand}` : ''}
            </div>
            {item.note && (
              <div className="text-[11px] text-[var(--color-caption)] mt-1 italic">{item.note}</div>
            )}
          </div>

          {/* Qty stepper */}
          <div className="flex items-center border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden w-fit">
            <button
              onClick={() => handleQtyChange(item.id, item.qty - 1)}
              disabled={item.qty <= 1 || isPending}
              className="w-[26px] h-7 font-mono text-[14px] text-[var(--color-muted)] hover:bg-[var(--color-deep)] disabled:opacity-30 transition-colors"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              value={item.qty}
              onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value) || 1)}
              className="w-10 h-7 border-l border-r border-[var(--color-border)] bg-transparent text-center font-mono text-[12px] text-[var(--color-primary)] focus:outline-none"
            />
            <button
              onClick={() => handleQtyChange(item.id, item.qty + 1)}
              disabled={isPending}
              className="w-[26px] h-7 font-mono text-[14px] text-[var(--color-muted)] hover:bg-[var(--color-deep)] disabled:opacity-30 transition-colors"
            >
              +
            </button>
          </div>

          {/* Remove */}
          <button
            onClick={() => handleRemove(item.id)}
            disabled={isPending}
            className="w-8 h-8 grid place-items-center text-[var(--color-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-surface)] transition-colors font-mono text-[14px] disabled:opacity-30"
            aria-label={`Remove ${item.sku}`}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
