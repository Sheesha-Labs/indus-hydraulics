'use client'

import { useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const STATUS_OPTIONS: Array<{
  value: '' | 'pending' | 'selected' | 'skipped' | 'ingested' | 'ingest_failed'
  label: string
}> = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'selected', label: 'Selected' },
  { value: 'skipped', label: 'Skipped' },
  { value: 'ingested', label: 'Ingested' },
  { value: 'ingest_failed', label: 'Failed' },
]

export default function JobFilters({
  counts,
  q,
  status,
}: {
  counts: Record<string, number>
  q: string
  status: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()

  function pushParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === '') next.delete(k)
      else next.set(k, v)
    }
    // Reset pagination when filters change.
    next.delete('page')
    const qs = next.toString()
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname))
  }

  function onSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const next = String(fd.get('q') ?? '').trim()
    pushParams({ q: next || null })
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div
        className="flex flex-wrap items-center gap-1"
        role="tablist"
        aria-label="Filter by selection status"
      >
        {STATUS_OPTIONS.map((opt) => {
          const active = opt.value === (status as typeof opt.value)
          const count =
            opt.value === '' ? Object.values(counts).reduce((a, b) => a + b, 0) : counts[opt.value]
          return (
            <button
              key={opt.value || 'all'}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={pending}
              onClick={() => pushParams({ status: opt.value || null })}
              className={`h-8 rounded-md border px-3 text-[11px] tracking-wider uppercase tabular-nums ${
                active
                  ? 'bg-ih-navy text-ih-bg border-ih-ink'
                  : 'bg-ih-bg text-ih-ink-2 border-ih-border hover:bg-ih-surface-2'
              } disabled:opacity-50`}
            >
              {opt.label} {typeof count === 'number' ? `(${count})` : ''}
            </button>
          )
        })}
      </div>

      <form onSubmit={onSearchSubmit} className="ml-auto flex items-center gap-2">
        <input
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Search by title or SKU…"
          className="border-ih-border bg-ih-bg h-8 w-64 rounded-md border px-2 text-[12px]"
        />
        <button
          type="submit"
          disabled={pending}
          className="border-ih-border text-ih-ink-2 hover:bg-ih-surface-2 h-8 rounded-md border px-3 text-[11px] tracking-wider uppercase tabular-nums disabled:opacity-50"
        >
          Search
        </button>
        {(q || status) && (
          <button
            type="button"
            onClick={() => pushParams({ q: null, status: null })}
            className="text-ih-muted hover:text-ih-ink h-8 px-2 text-[11px]"
          >
            Clear
          </button>
        )}
      </form>
    </div>
  )
}
