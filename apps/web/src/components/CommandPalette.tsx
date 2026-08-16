'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * The ⌘K command palette.
 *
 * 02-screen-index.md §06: a 660px card 96px from the top over a dimmed,
 * blurred page, grouped results with the first row pre-selected, and a
 * keyboard legend footer carrying the indexed-SKU count.
 *
 * ⌘K previously just focused the header's search input. That is an
 * autocomplete, not a palette: it cannot reach categories, services or
 * pages, and it does not exist on a page where the header search is
 * scrolled away.
 *
 * Accessibility is the substance here, not decoration (03 §8):
 *  - role="dialog" aria-modal, focus trapped, focus returned to whatever had
 *    it before opening, Esc closes.
 *  - The results are an aria-activedescendant listbox and the INPUT keeps
 *    focus throughout, so arrow keys move the selection without moving focus
 *    — a roving-tabindex listbox would steal focus out of the text field on
 *    every keystroke.
 */

type Row = { title: string; url: string; hint?: string; sku?: string }
type Groups = { products: Row[]; categories: Row[]; services: Row[]; pages: Row[]; skuCount: number }

const EMPTY: Groups = { products: [], categories: [], services: [], pages: [], skuCount: 0 }

export default function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [groups, setGroups] = useState<Groups>(EMPTY)
  const [active, setActive] = useState(0)
  const [loading, setLoading] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const restoreFocusTo = useRef<HTMLElement | null>(null)

  const flat = useMemo(() => {
    const out: Array<Row & { group: string }> = []
    for (const [group, rows] of [
      ['Products', groups.products],
      ['Categories', groups.categories],
      ['Services', groups.services],
      ['Pages', groups.pages],
    ] as const) {
      for (const row of rows) out.push({ ...row, group })
    }
    return out
  }, [groups])

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setGroups(EMPTY)
    setActive(0)
    restoreFocusTo.current?.focus()
  }, [])

  // ⌘K / Ctrl+K toggles from anywhere.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((prev) => {
          if (!prev) restoreFocusTo.current = document.activeElement as HTMLElement
          return !prev
        })
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // Fetch on a short debounce. The empty query still fetches — it returns the
  // indexed-SKU count the footer shows before anything is typed.
  useEffect(() => {
    if (!open) return
    let cancelled = false
    const id = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search/palette?q=${encodeURIComponent(query.trim())}`)
        const data = (await res.json()) as Groups
        if (!cancelled) {
          setGroups(data)
          setActive(0)
        }
      } catch {
        if (!cancelled) setGroups(EMPTY)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, query.trim() ? 130 : 0)
    return () => {
      cancelled = true
      clearTimeout(id)
    }
  }, [open, query])

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
      return
    }
    if (e.key === 'Tab') {
      // Nothing else in the dialog is tabbable, so the trap is simply
      // refusing to let Tab leave it.
      e.preventDefault()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (flat.length ? (i + 1) % flat.length : 0))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (flat.length ? (i - 1 + flat.length) % flat.length : 0))
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const row = flat[active]
      if (row) {
        close()
        router.push(row.url)
      } else if (query.trim()) {
        close()
        router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      }
    }
  }

  if (!open) return null

  let index = -1

  return (
    <div
      className="fixed inset-0 z-[100] bg-[oklch(0.2_0.02_255_/_0.42)] backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search everything"
        onKeyDown={onKeyDown}
        className="mx-auto mt-[96px] w-[min(660px,calc(100vw-32px))] overflow-hidden rounded-lg border border-ih-border bg-ih-surface shadow-[0_4px_12px_rgba(20,28,45,.07),0_18px_48px_rgba(20,28,45,.09)]"
      >
        <div className="flex items-center gap-3 border-b border-ih-border px-4">
          <span aria-hidden="true" className="text-ih-muted">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, categories, services…"
            aria-label="Search everything"
            role="combobox"
            aria-expanded="true"
            aria-controls="ih-palette-list"
            aria-activedescendant={flat[active] ? `ih-palette-row-${active}` : undefined}
            className="h-14 flex-1 bg-transparent text-[15px] text-ih-ink outline-none placeholder:text-ih-muted"
          />
          {loading && <span className="font-mono text-[10.5px] text-ih-muted-2">…</span>}
        </div>

        <ul id="ih-palette-list" role="listbox" aria-label="Results" className="max-h-[52vh] overflow-y-auto py-2">
          {flat.length === 0 && (
            <li className="px-4 py-8 text-center">
              <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
                {query.trim() ? 'Nothing matched that query' : 'Type to search'}
              </p>
              {query.trim() && (
                <p className="mt-2 text-[13px] text-ih-ink-2">
                  Press Enter to run a full search, or try a part number.
                </p>
              )}
            </li>
          )}

          {(['Products', 'Categories', 'Services', 'Pages'] as const).map((group) => {
            const rows = flat.filter((r) => r.group === group)
            if (rows.length === 0) return null
            return (
              <li key={group}>
                <p className="px-4 pb-1.5 pt-3 font-mono text-[10px] font-medium uppercase tracking-[0.13em] text-ih-muted-2">
                  {group}
                </p>
                <ul>
                  {rows.map((row) => {
                    index += 1
                    const i = index
                    const isActive = i === active
                    return (
                      <li
                        key={`${group}-${row.url}`}
                        id={`ih-palette-row-${i}`}
                        role="option"
                        aria-selected={isActive}
                        onMouseEnter={() => setActive(i)}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          close()
                          router.push(row.url)
                        }}
                        className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 ${
                          isActive ? 'bg-ih-accent-soft' : ''
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-sm border border-ih-border bg-ih-surface-2 font-mono text-[9px] text-ih-muted"
                        >
                          {group.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block truncate text-[13.5px] ${isActive ? 'text-ih-accent' : 'text-ih-ink'}`}>
                            {row.title}
                          </span>
                          {(row.sku || row.hint) && (
                            <span className="mt-0.5 block truncate font-mono text-[10.5px] text-ih-muted">
                              {[row.sku, row.hint].filter(Boolean).join(' · ')}
                            </span>
                          )}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </li>
            )
          })}
        </ul>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-ih-border bg-ih-surface-2 px-4 py-2.5">
          <Legend keys={['↑', '↓']} label="navigate" />
          <Legend keys={['↵']} label="open" />
          <Legend keys={['esc']} label="close" />
          <span className="ml-auto font-mono text-[10.5px] tabular-nums text-ih-muted-2">
            {groups.skuCount.toLocaleString()} SKUs indexed
          </span>
        </div>
      </div>
    </div>
  )
}

function Legend({ keys, label }: { keys: string[]; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      {keys.map((k) => (
        <kbd
          key={k}
          className="grid h-[18px] min-w-[18px] place-items-center rounded-[3px] border border-ih-border bg-ih-surface px-1 font-mono text-[10px] text-ih-ink-2"
        >
          {k}
        </kbd>
      ))}
      <span className="font-mono text-[10.5px] text-ih-muted-2">{label}</span>
    </span>
  )
}
