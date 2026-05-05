'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import {
  extractExactSkuQuery,
  pushRecentQuery,
  removeRecentQuery,
  sanitiseRecents,
} from '@indus/domain'

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

const RECENTS_KEY = 'indus.recent-searches'

/**
 * Debounced search input with prefix-tsquery autocomplete. Hits
 * `/api/search/suggest?q=...` 150ms after the user stops typing and
 * shows up to 8 results. Enter submits to the full /search page so
 * shared/printed/copied URLs always render server-side.
 *
 * Polish layer (PR 5):
 *   - ⌘K (or Ctrl+K) from anywhere on the storefront focuses + selects
 *     the search input.
 *   - Recent queries — last 5, sessionStorage-scoped — render above
 *     suggestions when the input is empty.
 *   - "I'm feeling lucky" Enter — when the trimmed query exactly matches
 *     the FIRST suggestion's SKU, Enter navigates straight to the PDP
 *     instead of the /search page. Cheap latency win for procurement
 *     engineers who type SKUs.
 *
 * Keyboard: ↑/↓ navigate, Enter open/lucky-jump, Esc close.
 */
export default function SearchAutocomplete({ initialQuery = '', className }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [items, setItems] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const [pending, setPending] = useState(false)
  const [recents, setRecents] = useState<string[]>([])
  const abortRef = useRef<AbortController | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Restore recents on mount. sessionStorage isn't available during SSR
  // so this can't be a useState lazy initializer; we sync the client-only
  // value on first render. (The setState-in-effect lint rule is muted
  // here because the canonical alternative — useSyncExternalStore — adds
  // a subscription we don't need for a one-time read.)
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(RECENTS_KEY)
      const parsed = raw ? (JSON.parse(raw) as unknown) : null
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRecents(sanitiseRecents(parsed))
    } catch {
      // Storage disabled / private mode / corrupted JSON — silently fall
      // back to empty recents.
    }
  }, [])

  function persistRecents(next: string[]) {
    setRecents(next)
    try {
      window.sessionStorage.setItem(RECENTS_KEY, JSON.stringify(next))
    } catch {
      // Storage disabled — keep in-memory state, drop persistence.
    }
  }

  // Debounced fetch.
  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 1) {
      // No fetch; the panel will show recents instead of suggestions.
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

  // ⌘K / Ctrl+K from anywhere → focus + select input.
  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      const isShortcut = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'
      if (!isShortcut) return
      e.preventDefault()
      inputRef.current?.focus()
      inputRef.current?.select()
      setOpen(true)
    }
    document.addEventListener('keydown', onKeydown)
    return () => document.removeEventListener('keydown', onKeydown)
  }, [])

  function recordSubmit(trimmed: string) {
    const next = pushRecentQuery(recents, trimmed)
    if (next) persistRecents(next)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    // 1. Highlighted suggestion → navigate to its URL.
    if (highlighted >= 0 && items[highlighted]) {
      recordSubmit(trimmed)
      router.push(items[highlighted].url)
      setOpen(false)
      return
    }

    // 2. "I'm feeling lucky" — if the typed query is an exact SKU match
    //    on the FIRST suggestion (the highest-ranked one), jump straight
    //    to that PDP instead of the search page.
    const skuCandidate = extractExactSkuQuery(trimmed)
    const firstItem = items[0]
    if (
      skuCandidate &&
      firstItem &&
      firstItem.sku.toUpperCase() === skuCandidate
    ) {
      recordSubmit(trimmed)
      router.push(firstItem.url)
      setOpen(false)
      return
    }

    // 3. Default — go to /search.
    recordSubmit(trimmed)
    router.push(`/search?q=${encodeURIComponent(trimmed)}`)
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

  function clearRecent(value: string) {
    persistRecents(removeRecentQuery(recents, value))
  }

  const trimmedQuery = query.trim()
  const showSuggestions = open && trimmedQuery.length >= 1 && (items.length > 0 || pending)
  const showRecents = open && trimmedQuery.length === 0 && recents.length > 0
  const showPanel = showSuggestions || showRecents

  return (
    <div ref={wrapRef} className={className ?? 'relative w-full max-w-[420px]'}>
      <form onSubmit={submit} role="search" className="flex border border-[var(--color-border)] bg-[var(--color-elevated)]">
        <input
          ref={inputRef}
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
          aria-keyshortcuts="Meta+K Control+K"
          className="flex-1 px-3 py-2 bg-transparent text-[13px] text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none"
        />
        <kbd
          aria-hidden="true"
          className="hidden md:flex items-center px-2 py-1 m-1 self-center font-mono text-[10px] tracking-wider text-[var(--color-caption)] border border-[var(--color-border)] bg-[var(--color-deep)]"
        >
          ⌘K
        </kbd>
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
          {showRecents && (
            <>
              <div className="px-3 py-1.5 font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--color-caption)] border-b border-[var(--color-border)]">
                Recent
              </div>
              {recents.map((recent) => (
                <div
                  key={recent}
                  className="flex items-center justify-between gap-2 px-3 py-2 text-[13px] hover:bg-[var(--color-deep)]"
                >
                  <Link
                    href={`/search?q=${encodeURIComponent(recent)}`}
                    onClick={() => setOpen(false)}
                    className="flex-1 truncate text-[var(--color-body)]"
                  >
                    <span aria-hidden="true" className="mr-2 text-[var(--color-caption)]">↺</span>
                    {recent}
                  </Link>
                  <button
                    type="button"
                    aria-label={`Remove ${recent} from recent searches`}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      clearRecent(recent)
                    }}
                    className="font-mono text-[11px] text-[var(--color-caption)] hover:text-[var(--color-danger)]"
                  >
                    ×
                  </button>
                </div>
              ))}
            </>
          )}

          {showSuggestions && pending && items.length === 0 && (
            <div className="px-3 py-2 font-mono text-[11px] text-[var(--color-muted)]">Searching…</div>
          )}
          {showSuggestions &&
            items.map((item, i) => (
              <Link
                key={item.sku}
                href={item.url}
                role="option"
                aria-selected={highlighted === i}
                onMouseEnter={() => setHighlighted(i)}
                onClick={() => {
                  recordSubmit(trimmedQuery)
                  setOpen(false)
                }}
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
          {showSuggestions && items.length > 0 && (
            <Link
              href={`/search?q=${encodeURIComponent(trimmedQuery)}`}
              onClick={() => {
                recordSubmit(trimmedQuery)
                setOpen(false)
              }}
              className="block px-3 py-2 font-mono text-[11px] text-[var(--color-accent)] border-t border-[var(--color-border)] hover:bg-[var(--color-deep)]"
            >
              See all results for &ldquo;{trimmedQuery}&rdquo; →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
