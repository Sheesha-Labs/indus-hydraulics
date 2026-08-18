'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Search } from 'lucide-react'
import type { MediaSort } from '@indus/domain'
import { cn } from '@indus/ui'

/**
 * Search box and sort control.
 *
 * The only client components on this screen. Everything else — rail, tabs,
 * chips, view toggle, paging — is a link, so the page works with JavaScript
 * off and every view is a shareable URL.
 *
 * Search is a real `<form method="GET">`, so Enter submits without JS and the
 * hidden inputs carry the other filters through. Sort needs `useRouter` only
 * because a `<select>` cannot navigate on change by itself; changing it resets
 * to page 1, since staying on page 7 of a re-sorted list shows a different set
 * of rows for no reason the user asked for.
 */

export function MediaSearchBox({
  action,
  defaultValue,
  hidden,
}: {
  action: string
  defaultValue: string
  /** Other active filters, preserved across the submit. */
  hidden: Record<string, string>
}) {
  return (
    <form method="GET" action={action} className="relative w-[260px]">
      <label htmlFor="media-search" className="sr-only">
        Search media by filename, alt text or caption
      </label>
      <Search
        size={13}
        strokeWidth={1.8}
        aria-hidden="true"
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ih-muted"
      />
      <input
        id="media-search"
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="Filename or alt text…"
        className={cn(
          'h-8 w-full rounded-md border border-ih-border bg-ih-surface pl-7 pr-2.5 text-[12.5px] text-ih-ink',
          'placeholder:text-ih-muted-2',
          'outline-none transition-colors focus-visible:border-ih-accent focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft'
        )}
      />
      {Object.entries(hidden).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
    </form>
  )
}

/**
 * Options are passed as DATA, not as a `buildUrl` function.
 *
 * This is a Client Component and the page rendering it is a Server Component,
 * so a function prop cannot cross the boundary — it is not serializable, and
 * the page throws at request time even though the build and the tests pass.
 * The server precomputes one href per option instead.
 */
export function MediaSortSelect({
  value,
  options,
}: {
  value: MediaSort
  options: ReadonlyArray<{ value: MediaSort; label: string; href: string }>
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex items-center gap-1.5">
      <label htmlFor="media-sort" className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted">
        Sort
      </label>
      <select
        id="media-sort"
        value={value}
        disabled={pending}
        onChange={(e) => {
          const next = options.find((o) => o.value === e.target.value)
          if (next) startTransition(() => router.push(next.href))
        }}
        className={cn(
          'h-8 rounded-md border border-ih-border bg-ih-surface px-2 text-[12.5px] text-ih-ink-2',
          'outline-none transition-colors focus-visible:border-ih-accent focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft',
          pending && 'opacity-60'
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
