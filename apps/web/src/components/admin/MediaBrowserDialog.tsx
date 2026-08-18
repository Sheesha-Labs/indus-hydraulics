'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Search } from 'lucide-react'
import { formatBytesOrUnknown, mediaThumbnailSrc } from '@indus/domain'
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  cn,
} from '@indus/ui'

import { searchMediaForPicker, type PickerResult } from '../../app/admin/(shell)/media/actions'

/**
 * Browse the media library and pick a file.
 *
 * This replaces the mechanism every content editor used before: a grid of the
 * 50 most recent files, and a text box for pasting a UUID by hand for anything
 * older. With 665 files that made most of the library reachable only by
 * copying an id out of the database.
 *
 * Deliberately a search, not a paginated grid. Someone opening this already
 * knows roughly what they want — they are attaching a picture of a specific
 * product — so the useful interaction is typing "hose" rather than paging
 * through 14 screens of thumbnails.
 */

const KINDS = [
  { value: 'image', label: 'Images' },
  { value: 'document', label: 'Documents' },
  { value: 'cad', label: 'CAD' },
  { value: 'all', label: 'All' },
] as const

export function MediaBrowserDialog(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (media: PickerResult) => void
  /** Restricts the picker to one kind; the filter is hidden when set. */
  fixedKind?: 'image' | 'document' | 'cad'
  title?: string
  selectedId?: string | null
}) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      {/* Mounted only while open, so reopening starts clean. Resetting the
          search in an effect instead would be a synchronous setState inside an
          effect — cascading renders, and the previous field's query briefly
          visible in the next one. */}
      {props.open ? <BrowserBody {...props} /> : null}
    </Dialog>
  )
}

function BrowserBody({
  onOpenChange,
  onSelect,
  fixedKind,
  title = 'Choose a file',
  selectedId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (media: PickerResult) => void
  fixedKind?: 'image' | 'document' | 'cad'
  title?: string
  selectedId?: string | null
}) {
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState<(typeof KINDS)[number]['value']>(fixedKind ?? 'image')
  const [results, setResults] = useState<PickerResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [highlighted, setHighlighted] = useState<string | null>(selectedId ?? null)

  // Guards against an earlier, slower search overwriting a later one — the
  // classic race that makes a search box show results for a prefix of what is
  // actually typed.
  const requestId = useRef(0)

  const run = useCallback(async (q: string, k: typeof kind) => {
    const mine = ++requestId.current
    setLoading(true)
    setError(null)
    const res = await searchMediaForPicker({ query: q, kind: k, limit: 40 })
    if (mine !== requestId.current) return
    setLoading(false)
    if (!res.success) {
      setError(res.message)
      setResults([])
      return
    }
    setResults(res.data)
  }, [])

  // Debounced so typing does not fire a query per keystroke.
  useEffect(() => {
    const t = setTimeout(() => void run(query, kind), 220)
    return () => clearTimeout(t)
  }, [query, kind, run])

  const chosen = results.find((r) => r.id === highlighted) ?? null

  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>

      <DialogBody className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[240px] flex-1">
            <label htmlFor="media-browser-search" className="sr-only">
              Search the media library
            </label>
            <Search
              size={13}
              strokeWidth={1.8}
              aria-hidden="true"
              className="text-ih-muted pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2"
            />
            <input
              id="media-browser-search"
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search filename, alt text or caption…"
              className="border-ih-border bg-ih-surface focus-visible:border-ih-accent focus-visible:ring-ih-accent-soft h-8 w-full rounded-md border pl-7 pr-2.5 text-[12.5px] outline-none focus-visible:ring-[3px]"
            />
          </div>
          {fixedKind ? null : (
            <div className="border-ih-border bg-ih-bg inline-flex rounded-md border p-0.5">
              {KINDS.map((k) => (
                <button
                  key={k.value}
                  type="button"
                  onClick={() => setKind(k.value)}
                  aria-pressed={kind === k.value}
                  className={cn(
                    'h-7 rounded-sm px-2.5 text-[12px] transition-colors',
                    kind === k.value
                      ? 'bg-ih-navy font-medium text-ih-bg'
                      : 'text-ih-ink-2 hover:text-ih-ink'
                  )}
                >
                  {k.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="min-h-[280px]">
          {error ? (
            <p role="alert" className="text-ih-danger py-10 text-center text-[13px]">
              {error}
            </p>
          ) : loading && results.length === 0 ? (
            <p className="text-ih-muted py-10 text-center text-[13px]">Searching…</p>
          ) : results.length === 0 ? (
            <p className="text-ih-muted py-10 text-center text-[13px]">
              {query ? `Nothing matches “${query}”.` : 'No files of this type in the library yet.'}
            </p>
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {results.map((m) => {
                const src = mediaThumbnailSrc(m)
                const isChosen = highlighted === m.id
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => setHighlighted(m.id)}
                      onDoubleClick={() => onSelect(m)}
                      aria-pressed={isChosen}
                      className={cn(
                        'flex w-full flex-col overflow-hidden rounded-md border text-left outline-none transition-colors',
                        isChosen
                          ? 'border-ih-accent ring-ih-accent-soft ring-[3px]'
                          : 'border-ih-border hover:border-ih-border-strong'
                      )}
                    >
                      <span className="bg-ih-surface-2 relative block aspect-[4/3]">
                        {src ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={src}
                            alt={m.alt ?? ''}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-ih-muted-2 grid h-full w-full place-items-center font-mono text-[10.5px] uppercase tracking-[0.1em]">
                            {m.kind}
                          </span>
                        )}
                        {isChosen ? (
                          <span className="bg-ih-accent absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-ih-accent-fg">
                            <Check size={11} strokeWidth={2.4} aria-hidden="true" />
                          </span>
                        ) : null}
                      </span>
                      <span className="flex flex-col gap-0.5 px-2 py-1.5">
                        <span
                          className="truncate text-[11.5px] font-medium"
                          title={m.originalFilename}
                        >
                          {m.originalFilename}
                        </span>
                        {/* Alt text is shown because for most of this
                                catalogue it is the only human-readable label —
                                the filenames are import codes like HP001.png. */}
                        <span className="text-ih-muted truncate text-[11px]" title={m.alt ?? ''}>
                          {m.alt || 'No alt text'}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </DialogBody>

      <DialogFooter>
        <span className="text-ih-muted mr-auto self-center truncate text-[12px]">
          {chosen
            ? `${chosen.originalFilename} · ${formatBytesOrUnknown(chosen.bytes)}`
            : 'Click to select, double-click to choose'}
        </span>
        <Button kind="ghost" size="sm" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          kind="primary"
          size="sm"
          disabled={!chosen}
          onClick={() => chosen && onSelect(chosen)}
        >
          Use this file
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
