import Link from 'next/link'
import { Link2 } from 'lucide-react'
import {
  formatBytesOrUnknown,
  MEDIA_STATE_LABELS,
  mediaThumbnailSrc,
  summariseUsage,
  type MediaListItem,
  type MediaState,
  type MediaUsage,
} from '@indus/domain'
import { Badge, cn } from '@indus/ui'

/**
 * How a media file renders in the grid and the list.
 *
 * Three signals carry usage, deliberately overlapping — a file's status should
 * be readable at a glance, on hover, and in detail:
 *
 *   1. A state pill: Live / Not live / Internal / Unused.
 *   2. A count badge over the thumbnail, hidden at zero.
 *   3. A usage line naming the first record that holds it.
 *
 * Colour is only spent where it means *published*. Live is green and Not live
 * is amber; Internal and Unused are both neutral, because neither is a problem
 * and tinting them would make a tidy library look alarming. Per CLAUDE.md §10.2
 * every one of them is also a word, never colour alone.
 */

import type { MediaDetail } from './types'

/** Kept as an alias so existing imports of the old name keep resolving. */
export type MediaRowView = MediaDetail

// ── State pill ──────────────────────────────────────────────────────────────

export function MediaStatePill({ state }: { state: MediaState }) {
  const label = MEDIA_STATE_LABELS[state]
  switch (state) {
    case 'live':
      return <Badge kind="success">{label}</Badge>
    case 'attached':
      return <Badge kind="warn">{label}</Badge>
    case 'internal':
      // Neutral, but a step darker than Unused so the two stay distinguishable
      // without either implying a fault.
      return (
        <Badge kind="default" className="bg-ih-surface-3">
          {label}
        </Badge>
      )
    default:
      return <Badge kind="default">{label}</Badge>
  }
}

// ── Usage line ──────────────────────────────────────────────────────────────

function UsageLine({ usages, className }: { usages: MediaUsage[]; className?: string }) {
  const first = usages[0]
  return (
    <span
      className={cn('block truncate text-[11.5px] text-ih-muted', className)}
      // The native tooltip carries the full list, so hovering answers "where
      // else?" without opening anything.
      title={
        usages.length > 0
          ? usages.map((u) => `${u.label} — ${u.role}`).join('\n')
          : 'Not used anywhere'
      }
    >
      {first ? (
        <>
          <span className="text-ih-ink-2">{first.label}</span>
          <span> · {first.role}</span>
          {usages.length > 1 ? <span> · +{usages.length - 1} more</span> : null}
        </>
      ) : (
        'Not used anywhere'
      )}
    </span>
  )
}

// ── Thumbnail ───────────────────────────────────────────────────────────────

function Thumb({
  item,
  usageCount,
  usages,
  className,
}: {
  item: MediaListItem
  usageCount: number
  usages: MediaUsage[]
  className?: string
}) {
  const src = mediaThumbnailSrc(item)
  return (
    <div className={cn('relative overflow-hidden bg-ih-surface-2', className)}>
      {/* A plain <img>, not next/image: storagePath holds four different shapes
          and only some are absolute URLs, so next/image would need a loader per
          shape for no benefit at 4:3 thumbnail size — and its remote patterns
          would have to allow every third-party host an admin has ever pasted.
          The disable must sit directly above the element or it silently applies
          to the wrong line and lint reports it as unused. */}
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={item.alt ?? ''}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="grid h-full w-full place-items-center font-mono text-[10px] uppercase tracking-[0.1em] text-ih-muted-2">
          {subtype(item)}
        </span>
      )}

      {usageCount > 0 ? (
        <span
          className="absolute bottom-1.5 left-1.5 inline-flex h-5 items-center gap-1 rounded-sm bg-ih-ink/80 px-1.5 text-[10px] font-medium text-white backdrop-blur-[2px]"
          title={summariseUsage(usages)}
        >
          <Link2 size={9} strokeWidth={2} aria-hidden="true" />
          <span className="tabular-nums">{usageCount}</span>
          <span className="sr-only">
            {usageCount === 1 ? 'used in 1 place' : `used in ${usageCount} places`}
          </span>
        </span>
      ) : null}
    </div>
  )
}

/** `image/svg+xml` -> `SVG`. Falls back to the media kind. */
function subtype(item: MediaListItem): string {
  const tail = item.originalFilename.split('.').pop()
  if (tail && tail.length <= 5 && tail !== item.originalFilename) return tail
  return item.kind
}

// ── Grid ────────────────────────────────────────────────────────────────────

export function MediaGrid({
  rows,
  onOpen,
}: {
  rows: MediaRowView[]
  onOpen: (id: string) => void
}) {
  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {rows.map((row) => {
        const { state, usages } = row
        const item = row
        return (
        <li
          key={item.id}
          className="flex flex-col overflow-hidden rounded-lg border border-ih-border bg-ih-surface"
        >
          {/* The whole card is the trigger. A separate info button would be a
              28px target on a 200px card that does nothing else when clicked. */}
          <button
            type="button"
            onClick={() => onOpen(item.id)}
            aria-label={`Details for ${item.originalFilename}`}
            className="flex flex-1 flex-col text-left outline-none transition-colors hover:bg-ih-surface-2 focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft"
          >
          <Thumb item={item} usageCount={usages.length} usages={usages} className="aspect-[4/3]" />
          <div className="flex flex-1 flex-col gap-1.5 px-3 py-2.5">
            <div className="flex items-start justify-between gap-2">
              <span className="truncate text-[13px] font-medium" title={item.originalFilename}>
                {item.originalFilename}
              </span>
              <MediaStatePill state={state} />
            </div>
            <UsageLine usages={usages} />
            {/* mt-auto pins the meta row to the bottom so ragged filename
                lengths still leave the grid with a flush baseline. */}
            <div className="mt-auto flex items-center gap-2 pt-1.5 font-mono text-[11px] text-ih-muted">
              <span className="tabular-nums" title={item.bytes > 0 ? undefined : 'File size was not recorded at upload'}>
                {formatBytesOrUnknown(item.bytes)}
              </span>
              <span aria-hidden="true">·</span>
              <span className="truncate uppercase tracking-[0.06em]">{item.kind}</span>
            </div>
          </div>
          </button>
        </li>
        )
      })}
    </ul>
  )
}

// ── List ────────────────────────────────────────────────────────────────────

export function MediaList({
  rows,
  onOpen,
}: {
  rows: MediaRowView[]
  onOpen: (id: string) => void
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-ih-border bg-ih-surface">
      <ul className="divide-y divide-ih-border">
        {rows.map((row) => {
          const { state, usages } = row
          const item = row
          return (
          <li key={item.id}>
          <button
            type="button"
            onClick={() => onOpen(item.id)}
            aria-label={`Details for ${item.originalFilename}`}
            className="flex w-full items-center gap-4 px-4 py-2.5 text-left text-[13px] outline-none transition-colors hover:bg-ih-surface-2 focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ih-accent-soft"
          >
            <Thumb
              item={item}
              usageCount={usages.length}
              usages={usages}
              className="h-11 w-14 flex-shrink-0 rounded-sm"
            />
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium" title={item.originalFilename}>
                {item.originalFilename}
              </div>
              <UsageLine usages={usages} />
            </div>
            <MediaStatePill state={state} />
            {/* Fixed widths so the columns line up without a table element. */}
            <span
              className="w-16 text-right font-mono text-[11px] tabular-nums text-ih-muted"
              title={item.bytes > 0 ? undefined : 'File size was not recorded at upload'}
            >
              {formatBytesOrUnknown(item.bytes)}
            </span>
            <span className="hidden w-20 font-mono text-[11px] uppercase tracking-[0.06em] text-ih-muted sm:block">
              {item.kind}
            </span>
          </button>
          </li>
          )
        })}
      </ul>
    </div>
  )
}

// ── Empty state ─────────────────────────────────────────────────────────────

export function MediaEmptyState({
  trashed,
  filtered,
  resetHref,
}: {
  trashed: boolean
  filtered: boolean
  resetHref: string
}) {
  return (
    <div className="rounded-lg border border-dashed border-ih-border py-16 text-center">
      {trashed ? (
        <>
          <p className="text-[13.5px] text-ih-ink-2">Trash is empty.</p>
          <p className="mt-1 text-[12px] text-ih-muted">
            Unused files you delete land here first, and stay for 30 days.
          </p>
        </>
      ) : filtered ? (
        <>
          <p className="text-[13.5px] text-ih-ink-2">Nothing matches these filters.</p>
          <Link
            href={resetHref}
            className="mt-2 inline-block text-[12px] text-ih-accent underline underline-offset-2"
          >
            Clear filters
          </Link>
        </>
      ) : (
        <>
          <p className="text-[13.5px] text-ih-ink-2">No media yet.</p>
          <p className="mt-1 text-[12px] text-ih-muted">
            Images and documents uploaded from a product, brand or blog post appear here.
          </p>
        </>
      )}
    </div>
  )
}
