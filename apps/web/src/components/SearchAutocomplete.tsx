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
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(trimmed)}`, {
          signal: ctrl.signal,
        })
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

  // ⌘K belongs to the command palette (components/CommandPalette.tsx), which
  // is mounted in the storefront shell and reachable from every route. This
  // component used to bind the same chord and pull focus into the header
  // input; with both bound, the palette opened and instantly lost focus.

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
    if (skuCandidate && firstItem && firstItem.sku.toUpperCase() === skuCandidate) {
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
      <form onSubmit={submit} role="search" className="flex items-stretch gap-2">
        {/* Bordered input group — kbd hint sits inside this box. The
            global `:focus-visible` outline (orange accent) is suppressed
            on the input itself; visual focus feedback shifts to the
            wrapper border via `focus-within`. */}
        <div className="border-ih-border bg-ih-surface focus-within:border-ih-accent relative flex flex-1 border transition-colors">
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
            className="text-ih-ink placeholder:text-ih-muted-2 flex-1 bg-transparent px-3 py-2 text-[13px] focus:outline-none focus-visible:outline-none"
          />

          {showPanel && (
            <div
              role="listbox"
              className="border-ih-border absolute top-full right-0 left-0 z-30 mt-1 border bg-white shadow-md"
            >
              {showRecents && (
                <>
                  <div className="text-ih-muted-2 border-ih-border border-b px-3 py-1.5 font-mono text-[10px] tracking-[0.1em] uppercase">
                    Recent
                  </div>
                  {recents.map((recent) => (
                    <div
                      key={recent}
                      className="hover:bg-ih-surface-2 flex items-center justify-between gap-2 px-3 py-2 text-[13px]"
                    >
                      <Link
                        href={`/search?q=${encodeURIComponent(recent)}`}
                        onClick={() => setOpen(false)}
                        className="text-ih-ink-2 flex-1 truncate"
                      >
                        <span aria-hidden="true" className="text-ih-muted-2 mr-2">
                          ↺
                        </span>
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
                        className="text-ih-muted-2 hover:text-ih-danger font-mono text-[11px]"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </>
              )}

              {showSuggestions && pending && items.length === 0 && (
                <div className="text-ih-muted px-3 py-2 font-mono text-[11px]">Searching…</div>
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
                    className={`hover:bg-ih-surface-2 block px-3 py-2 text-[13px] ${
                      highlighted === i ? 'bg-ih-surface-2' : ''
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-ih-ink truncate font-medium">{item.title}</span>
                      <span className="text-ih-muted font-mono text-[10px] whitespace-nowrap">
                        {item.sku}
                      </span>
                    </div>
                    {item.brandName && (
                      <div className="text-ih-muted-2 mt-0.5 font-mono text-[10px]">
                        {item.brandName}
                      </div>
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
                  className="text-ih-accent border-ih-border hover:bg-ih-surface-2 block border-t px-3 py-2 font-mono text-[11px]"
                >
                  See all results for &ldquo;{trimmedQuery}&rdquo; →
                </Link>
              )}
            </div>
          )}
        </div>
        <button
          type="submit"
          className="bg-ih-accent h-9 shrink-0 px-4 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
        >
          Search
        </button>
      </form>
    </div>
  )
}
