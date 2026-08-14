'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export type RequestAgainItem = {
  sku: string
  title: string
  brand?: string
  imageUrl?: string
  qty: number
  targetPrice?: string
}

type Props = {
  items: RequestAgainItem[]
  /** Shown briefly to confirm what's being copied. */
  rfqCode: string
}

/**
 * Copy the RFQ's lines into the quote-builder localStorage cart, then
 * redirect to /quote so the customer can adjust quantities and submit a
 * fresh RFQ. Uses the same `quote_items` key the catalogue's "Add to quote"
 * buttons write to, so existing items get replaced.
 */
export default function RequestAgainButton({ items, rfqCode }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (typeof window === 'undefined') return

    try {
      window.localStorage.setItem('quote_items', JSON.stringify(items))
    } catch {
      // localStorage can fail in private mode etc. — fall through to navigate anyway.
    }

    startTransition(() => {
      router.push(`/quote?from=${encodeURIComponent(rfqCode)}`)
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending || items.length === 0}
      title={items.length === 0 ? 'No lines on this RFQ' : `Copy ${items.length} line${items.length === 1 ? '' : 's'} into a new quote`}
      className="inline-flex items-center justify-center h-7 px-2.5 border border-[var(--color-border)] font-mono text-[10px] text-[var(--color-body)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      ↻ {isPending ? 'Copying…' : 'Re-quote'}
    </button>
  )
}
