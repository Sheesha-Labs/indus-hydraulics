'use client'

import { useEffect, useState, useTransition } from 'react'
import { searchProductsForAttach, type AttachSearchHit } from '../actions'

type Props = {
  selected: AttachSearchHit | null
  onSelect: (hit: AttachSearchHit | null) => void
  disabled?: boolean
}

export default function AttachToExistingPicker({ selected, onSelect, disabled }: Props) {
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<AttachSearchHit[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    // Short queries: we don't render the dropdown anyway (gated below),
    // so we leave any stale state alone instead of synchronously clearing
    // it (React's `set-state-in-effect` rule).
    if (query.trim().length < 2) return
    const t = setTimeout(() => {
      startTransition(async () => {
        const r = await searchProductsForAttach(query)
        if (r.success) {
          setHits(r.data)
          setError(null)
        } else {
          setError(r.message)
        }
      })
    }, 220)
    return () => clearTimeout(t)
  }, [query])

  if (selected) {
    return (
      <div className="border border-[var(--color-border-default)] bg-[var(--color-deep)] px-3 py-2.5 text-[13px]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-mono text-[12px] text-[var(--color-primary)] truncate">{selected.sku}</div>
            <div className="text-[12px] text-[var(--color-body)] truncate">{selected.title}</div>
            <div className="text-[11px] text-[var(--color-muted)] mt-0.5">
              {selected.brandName ? `${selected.brandName} · ` : ''}
              {selected.imageCount} existing image{selected.imageCount === 1 ? '' : 's'}
            </div>
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelect(null)}
            className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)] hover:text-[var(--color-primary)] disabled:opacity-50"
          >
            Change
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search existing products by SKU, title, MPN…"
        disabled={disabled}
        className="h-9 w-full px-3 border border-[var(--color-border-default)] bg-[var(--color-surface)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
      />
      {error && (
        <p className="text-[11px] text-[oklch(0.5_0.18_25)] mt-1">{error}</p>
      )}
      {query.trim().length >= 2 && (
        <div className="border border-t-0 border-[var(--color-border-default)] bg-[var(--color-surface)] max-h-[260px] overflow-y-auto">
          {pending && hits.length === 0 && (
            <p className="px-3 py-2 text-[12px] text-[var(--color-muted)]">Searching…</p>
          )}
          {!pending && hits.length === 0 && (
            <p className="px-3 py-2 text-[12px] text-[var(--color-muted)]">No matches</p>
          )}
          {hits.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => onSelect(h)}
              className="w-full text-left px-3 py-2 border-t border-[var(--color-border-default)] hover:bg-[var(--color-deep)] focus:bg-[var(--color-deep)] focus:outline-none"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[12px] text-[var(--color-primary)] flex-shrink-0">
                  {h.sku}
                </span>
                <span className="text-[12px] text-[var(--color-body)] truncate">{h.title}</span>
              </div>
              <div className="text-[10px] text-[var(--color-muted)] mt-0.5">
                {h.brandName ? `${h.brandName} · ` : ''}
                {h.imageCount} image{h.imageCount === 1 ? '' : 's'}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
