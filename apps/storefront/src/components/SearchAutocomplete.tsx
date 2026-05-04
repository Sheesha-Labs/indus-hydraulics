'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Suggestion = {
  sku: string
  title: string
  url: string
  brandName: string | null
}

interface Props {
  /** Optional initial query (e.g. when mounted on the /search page). */
  initialQuery?: string
  /** Tailwind classes for the wrapping <div>. */
  className?: string
}

/**
 * Debounced search input with prefix-tsquery autocomplete. Hits
 * `/api/search/suggest?q=...` 150ms after the user stops typing and
 * shows up to 8 results. Enter submits to the full /search page so
 * shared/printed/copied URLs always render server-side.
 *
 * Keyboard: ↑/↓ navigate, Enter open, Esc close.
 */
export default function SearchAutocomplete({ initialQuery = '', className }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [items, setItems] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const [pending, setPending] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  // Debounced fetch.
  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 1) {
      // No fetch; stale items/pending don't render because `showPanel`
      // already gates visibility on `query.trim().length >= 1`.
      return
    }
    const handle = window.setTimeout(async () => {
      abortRef.current?.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl
      setPending(true)
      try {
        const res = await fetch(
          `/api/search/suggest?q=${encodeURIComponent(trimmed)}`,
          { signal: ctrl.signal },
        )
        if (!res.ok) return
        const data = (await res.json()) as { items: Suggestion[] }
        setItems(data.items ?? [])
        setHighlighted(-1)
      } catch {
        // aborted or network — ignore
      } finally {
        setPending(false)
      }
    }, 150)
    return () => {
      window.clearTimeout(handle)
      abortRef.current?.abort()
    }
  }, [query])

  // Click outside closes the panel.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    if (highlighted >= 0 && items[highlighted]) {
      router.push(items[highlighted].url)
    } else {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`)
    }
    setOpen(false)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setHighlighted((h) => Math.min(items.length - 1, h + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((h) => Math.max(-1, h - 1))
    } else if (e.key === 'Escape') {
      setOpen(false)
      setHighlighted(-1)
    }
  }

  const showPanel = open && query.trim().length >= 1 && (items.length > 0 || pending)

  return (
    <div ref={wrapRef} className={className ?? 'relative w-full max-w-[420px]'}>
      <form onSubmit={submit} role="search" className="flex border border-[var(--color-border)] bg-[var(--color-elevated)]">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search products, SKUs, MPNs…"
          aria-label="Search"
          aria-autocomplete="list"
          className="flex-1 px-3 py-2 bg-transparent text-[13px] text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none"
        />
        <button
          type="submit"
          className="h-9 px-3 bg-[var(--color-accent)] text-white font-mono text-[11px] hover:opacity-90 transition-opacity shrink-0"
        >
          Search
        </button>
      </form>

      {showPanel && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1 border border-[var(--color-border)] bg-white shadow-md z-30"
        >
          {pending && items.length === 0 && (
            <div className="px-3 py-2 font-mono text-[11px] text-[var(--color-muted)]">Searching…</div>
          )}
          {items.map((item, i) => (
            <Link
              key={item.sku}
              href={item.url}
              role="option"
              aria-selected={highlighted === i}
              onMouseEnter={() => setHighlighted(i)}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2 text-[13px] hover:bg-[var(--color-deep)] ${
                highlighted === i ? 'bg-[var(--color-deep)]' : ''
              }`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-medium text-[var(--color-primary)] truncate">{item.title}</span>
                <span className="font-mono text-[10px] text-[var(--color-muted)] whitespace-nowrap">
                  {item.sku}
                </span>
              </div>
              {item.brandName && (
                <div className="font-mono text-[10px] text-[var(--color-caption)] mt-0.5">{item.brandName}</div>
              )}
            </Link>
          ))}
          {items.length > 0 && (
            <Link
              href={`/search?q=${encodeURIComponent(query.trim())}`}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 font-mono text-[11px] text-[var(--color-accent)] border-t border-[var(--color-border)] hover:bg-[var(--color-deep)]"
            >
              See all results for &ldquo;{query.trim()}&rdquo; →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
