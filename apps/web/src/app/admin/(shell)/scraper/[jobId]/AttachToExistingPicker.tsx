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
      <div className="border-ih-border bg-ih-surface-2 rounded-lg border px-3 py-2.5 text-[13px]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-ih-ink truncate text-[12px] tabular-nums">{selected.sku}</div>
            <div className="text-ih-ink-2 truncate text-[12px]">{selected.title}</div>
            <div className="text-ih-muted mt-0.5 text-[11px]">
              {selected.brandName ? `${selected.brandName} · ` : ''}
              {selected.imageCount} existing image{selected.imageCount === 1 ? '' : 's'}
            </div>
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelect(null)}
            className="text-ih-muted hover:text-ih-ink text-[11px] tracking-wider uppercase tabular-nums disabled:opacity-50"
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
        className="border-ih-border bg-ih-bg focus:ring-ih-accent h-9 w-full rounded-md border px-3 text-[13px] focus:ring-2 focus:outline-none disabled:opacity-50"
      />
      {error && <p className="text-ih-danger-ink mt-1 text-[11px]">{error}</p>}
      {query.trim().length >= 2 && (
        <div className="border-ih-border bg-ih-bg max-h-[260px] overflow-y-auto rounded-b-md border border-t-0">
          {pending && hits.length === 0 && (
            <p className="text-ih-muted px-3 py-2 text-[12px]">Searching…</p>
          )}
          {!pending && hits.length === 0 && (
            <p className="text-ih-muted px-3 py-2 text-[12px]">No matches</p>
          )}
          {hits.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => onSelect(h)}
              className="border-ih-border hover:bg-ih-surface-2 focus:bg-ih-surface-2 w-full border-t px-3 py-2 text-left focus:outline-none"
            >
              <div className="flex items-baseline gap-3">
                <span className="text-ih-ink flex-shrink-0 text-[12px] tabular-nums">{h.sku}</span>
                <span className="text-ih-ink-2 truncate text-[12px]">{h.title}</span>
              </div>
              <div className="text-ih-muted mt-0.5 text-[11px]">
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
