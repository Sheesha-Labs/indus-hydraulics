'use client'

import { useState, useTransition, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { updateItemQty, removeItem } from '../app/(storefront)/account/lists/[id]/actions'

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
      <div className="py-12 border border-dashed border-ih-border text-center mb-4">
        <p className="text-ih-muted text-[13px]">No items in this list.</p>
        <Link href={`/c`} className="mt-3 inline-block font-mono text-[12px] text-ih-accent hover:underline">
          Browse products →
        </Link>
      </div>
    )
  }

  return (
    <div className="border border-ih-border bg-ih-surface overflow-hidden">
      {/* Column header */}
      <div
        className="grid grid-cols-[48px_1fr_auto_28px] gap-2.5 px-4 py-2.5 bg-ih-surface-2 border-b border-ih-border font-mono text-[10px] tracking-[0.12em] uppercase text-ih-muted sm:grid-cols-[64px_1fr_130px_32px] sm:gap-3.5 sm:px-[18px]"
      >
        <div />
        <div>Product · SKU</div>
        <div className="text-center">Qty</div>
        <div />
      </div>

      {items.map((item) => (
        <div
          key={item.id}
          className="grid grid-cols-[48px_1fr_auto_28px] items-center gap-2.5 px-4 py-3.5 border-b border-ih-border last:border-0 sm:grid-cols-[64px_1fr_130px_32px] sm:gap-3.5 sm:px-[18px]"
        >
          {/* Image */}
          <div className="relative h-12 w-12 shrink-0 overflow-hidden border border-ih-border bg-ih-surface-2 sm:h-16 sm:w-16">
            {item.imageUrl ? (
              <Image src={item.imageUrl} alt={item.title} fill className="object-contain p-1.5" sizes="64px" />
            ) : (
              <div className="absolute inset-0 grid place-items-center font-mono text-[9px] text-ih-muted">IMG</div>
            )}
          </div>

          {/* Product info */}
          <div>
            <Link
              href={`/p/${item.sku}`}
              className="font-medium text-[13px] hover:text-ih-accent transition-colors leading-snug"
            >
              {item.title}
            </Link>
            <div className="font-mono text-[11px] text-ih-muted mt-0.5">
              {item.sku}{item.brand ? ` · ${item.brand}` : ''}
            </div>
            {item.note && (
              <div className="text-[11px] text-ih-muted-2 mt-1 italic">{item.note}</div>
            )}
          </div>

          {/* Qty stepper */}
          <div className="flex items-center border border-ih-border bg-ih-bg overflow-hidden w-fit">
            <button
              onClick={() => handleQtyChange(item.id, item.qty - 1)}
              disabled={item.qty <= 1 || isPending}
              className="w-[26px] h-7 font-mono text-[14px] text-ih-muted hover:bg-ih-surface-2 disabled:opacity-30 transition-colors"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              value={item.qty}
              onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value) || 1)}
              className="w-10 h-7 border-l border-r border-ih-border bg-transparent text-center font-mono text-[12px] text-ih-ink focus:outline-none"
            />
            <button
              onClick={() => handleQtyChange(item.id, item.qty + 1)}
              disabled={isPending}
              className="w-[26px] h-7 font-mono text-[14px] text-ih-muted hover:bg-ih-surface-2 disabled:opacity-30 transition-colors"
            >
              +
            </button>
          </div>

          {/* Remove */}
          <button
            onClick={() => handleRemove(item.id)}
            disabled={isPending}
            className="w-8 h-8 grid place-items-center text-ih-muted hover:text-ih-danger hover:bg-ih-bg transition-colors font-mono text-[14px] disabled:opacity-30"
            aria-label={`Remove ${item.sku}`}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
