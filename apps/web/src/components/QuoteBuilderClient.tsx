'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export type QuoteItem = {
  sku: string
  title: string
  brand?: string
  imageUrl?: string
  qty: number
  targetPrice?: string
}

type Props = {
  isSignedIn: boolean
}

export default function QuoteBuilderClient({ isSignedIn }: Props) {
  const [items, setItems] = useState<QuoteItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // SSR-safe hydration: localStorage is only available client-side.
    // Read once on mount and flip the gate.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    try {
      const raw = localStorage.getItem('quote_items')
      if (raw) setItems(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [])

  function save(next: QuoteItem[]) {
    setItems(next)
    localStorage.setItem('quote_items', JSON.stringify(next))
  }

  function updateQty(sku: string, qty: number) {
    if (qty < 1) return
    save(items.map((i) => (i.sku === sku ? { ...i, qty } : i)))
  }

  function remove(sku: string) {
    save(items.filter((i) => i.sku !== sku))
  }

  if (!mounted) {
    return (
      <div className="py-20 text-center">
        <div className="font-mono text-[12px] text-[var(--color-muted)] animate-pulse">Loading quote…</div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center border border-dashed border-[var(--color-border)]">
        <div className="text-[40px] mb-4 opacity-20">📋</div>
        <p className="text-[18px] font-semibold mb-2">Your quote is empty</p>
        <p className="text-[14px] text-[var(--color-muted)] mb-6">
          Browse the catalogue and add products to build your RFQ.
        </p>
        <Link
          href={`/c`}
          className="inline-flex h-10 px-6 items-center bg-[var(--color-accent)] text-white text-[13px] font-medium hover:opacity-90"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  const submitUrl = isSignedIn
    ? `/quote/submit`
    : `/sign-in?next=/quote/submit`

  return (
    <div className="grid gap-8" style={{ gridTemplateColumns: '1fr 360px', alignItems: 'start' }}>
      {/* ── Main: line items ──────────────────────────────────── */}
      <div>
        <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] overflow-hidden">
          {/* Table header */}
          <div
            className="grid gap-4 px-4 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)] font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)]"
            style={{ gridTemplateColumns: '60px 1fr 110px 36px' }}
          >
            <span />
            <span>Product</span>
            <span className="text-center">Qty</span>
            <span />
          </div>

          {/* Rows */}
          {items.map((item) => (
            <div
              key={item.sku}
              className="grid gap-4 px-4 py-[18px] border-b border-[var(--color-border-2)] last:border-0 items-center"
              style={{ gridTemplateColumns: '60px 1fr 110px 36px' }}
            >
              {/* Image */}
              <div className="aspect-square bg-[var(--color-deep)] border border-[var(--color-border)] relative overflow-hidden">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.title} fill className="object-contain p-1" sizes="60px" />
                ) : (
                  <div className="absolute inset-0 grid place-items-center font-mono text-[9px] text-[var(--color-muted)]">IMG</div>
                )}
              </div>

              {/* Product info */}
              <div>
                <div className="font-mono text-[11px] text-[var(--color-muted)]">{item.sku}</div>
                <div className="font-medium text-[14px] mt-0.5 leading-snug">
                  <Link href={`/p/${item.sku}`} className="hover:text-[var(--color-accent)] transition-colors">
                    {item.title}
                  </Link>
                </div>
                {item.brand && <div className="font-mono text-[11px] text-[var(--color-muted)] mt-0.5">{item.brand}</div>}
              </div>

              {/* Qty stepper */}
              <div className="flex border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden w-fit">
                <button
                  onClick={() => updateQty(item.sku, item.qty - 1)}
                  className="w-8 h-8 font-mono text-[14px] text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  value={item.qty}
                  onChange={(e) => updateQty(item.sku, parseInt(e.target.value) || 1)}
                  className="w-10 h-8 border-l border-r border-[var(--color-border)] bg-transparent text-center font-mono text-[13px] text-[var(--color-primary)] focus:outline-none"
                />
                <button
                  onClick={() => updateQty(item.sku, item.qty + 1)}
                  className="w-8 h-8 font-mono text-[14px] text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors"
                >
                  +
                </button>
              </div>

              {/* Remove */}
              <button
                onClick={() => remove(item.sku)}
                className="w-8 h-8 grid place-items-center text-[var(--color-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-surface)] transition-colors font-mono text-[16px]"
                aria-label={`Remove ${item.sku}`}
              >
                ✕
              </button>
            </div>
          ))}

          {/* Footer row */}
          <div className="px-4 py-3.5 bg-[var(--color-surface)] border-t border-[var(--color-border)] flex justify-between items-center">
            <Link href={`/c`} className="text-[13px] text-[var(--color-accent)] hover:underline">
              + Add another SKU
            </Link>
            <button
              onClick={() => save([])}
              className="font-mono text-[11px] text-[var(--color-muted)] hover:text-[var(--color-danger)] transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>

        {/* Volume notice */}
        {items.length >= 2 && (
          <div
            className="mt-6 px-5 py-4 grid gap-3.5"
            style={{ background: 'oklch(0.98 0.04 60)', border: '1px solid oklch(0.85 0.08 60)', gridTemplateColumns: '24px 1fr' }}
          >
            <span className="font-mono text-[14px]">ⓘ</span>
            <div>
              <b className="text-[14px]">Volume break available</b>
              <p className="mt-1 text-[13px] text-[var(--color-body)]">
                Order 4+ units of any single SKU to qualify for tier-2 pricing. Add notes below to let our engineer know your target quantity.
              </p>
            </div>
          </div>
        )}

        {/* Guest sign-in nudge */}
        {!isSignedIn && (
          <p className="mt-4 text-[12px] text-[var(--color-muted)] text-center">
            Sign in to submit your RFQ —{' '}
            <Link href={`/sign-in?next=/quote/submit`} className="text-[var(--color-accent)] hover:underline">
              Sign in
            </Link>
          </p>
        )}
      </div>

      {/* ── Sticky sidebar ────────────────────────────────────── */}
      <aside className="sticky top-[88px]">
        <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-[var(--color-border)]">
            <h3 className="text-[16px] font-semibold">Your RFQ</h3>
            <p className="text-[12px] text-[var(--color-muted)] mt-0.5">Final pricing on quote response</p>
          </div>

          {/* Line summary */}
          <div className="px-5 py-4 flex flex-col gap-2.5 text-[13px] border-b border-[var(--color-border)]">
            <div className="flex justify-between">
              <span className="text-[var(--color-muted)]">{items.length} line{items.length !== 1 ? 's' : ''}</span>
              <span className="font-mono text-[var(--color-muted)]">—</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-muted)]">Tax (calc at quote)</span>
              <span className="font-mono text-[var(--color-muted)]">—</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-muted)]">Shipping (calc at quote)</span>
              <span className="font-mono text-[var(--color-muted)]">—</span>
            </div>
            <hr className="border-[var(--color-border-2)] my-1" />
            <div className="flex justify-between text-[15px] font-semibold">
              <span>Engineer&apos;s quote</span>
              <span className="font-mono">within 4h</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="px-5 py-4 flex flex-col gap-2.5 border-b border-[var(--color-border)]">
            <Link
              href={submitUrl}
              className="h-11 flex items-center justify-center bg-[var(--color-accent)] text-white font-medium text-[14px] hover:opacity-90 transition-opacity"
            >
              Request quote →
            </Link>
            <button className="h-10 flex items-center justify-center border border-[var(--color-border)] text-[var(--color-body)] font-mono text-[12px] hover:bg-[var(--color-deep)] transition-colors">
              Chat on WhatsApp
            </button>
            <p className="font-mono text-[11px] text-[var(--color-muted)] text-center">
              Avg response · 47 min · Mon–Sat
            </p>
          </div>

          {/* Why a quote */}
          <div className="px-5 py-4 bg-[var(--color-surface)] text-[12px] text-[var(--color-muted)] leading-[1.6]">
            <b className="text-[var(--color-primary)]">Why a quote, not a cart?</b><br />
            Industrial pricing depends on lead time, freight, customs, and which warehouse stocks the SKU. We&apos;d rather give you a real number than a guess.
          </div>
        </div>
      </aside>
    </div>
  )
}
