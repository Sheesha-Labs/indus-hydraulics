'use client'

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
import { Badge, Checkbox, cn } from '@indus/ui'

import { MediaRowActions } from './row-actions'
import type { MediaDetail } from './types'

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
 *
 * ⚠ Layout constraint: the card's click target is a <button>, so the checkbox
 * and the action cluster must be its SIBLINGS, not its children. A button
 * inside a button is invalid HTML and browsers recover from it unpredictably —
 * usually by dropping the inner control, which would make the delete button
 * silently unclickable.
 */

/** Kept as an alias so existing imports of the old name keep resolving. */
export type MediaRowView = MediaDetail

interface RowProps {
  rows: MediaRowView[]
  onOpen: (id: string) => void
  indexPartial: boolean
  canWrite: boolean
  canDestroy: boolean
  trashed: boolean
  selected: ReadonlySet<string>
  onToggleSelect: (id: string) => void
  onChanged: () => void
}

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
  usages,
  className,
}: {
  item: MediaListItem
  usages: MediaUsage[]
  className?: string
}) {
  const src = mediaThumbnailSrc(item)
  return (
    <div className={cn('relative overflow-hidden bg-ih-surface-2', className)}>
      {/* A plain <img>, not next/image: storagePath holds four different shapes
          and only some are absolute URLs, so next/image would need a loader per
          shape for no benefit at 4:3 thumbnail size — and its remote patterns
          would have to allow every third-party host an admin has ever pasted. */}
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

      {usages.length > 0 ? (
        <span
          className="absolute bottom-1.5 left-1.5 inline-flex h-5 items-center gap-1 rounded-sm bg-ih-ink/80 px-1.5 text-[10px] font-medium text-white backdrop-blur-[2px]"
          title={summariseUsage(usages)}
        >
          <Link2 size={9} strokeWidth={2} aria-hidden="true" />
          <span className="tabular-nums">{usages.length}</span>
          <span className="sr-only">
            {usages.length === 1 ? 'used in 1 place' : `used in ${usages.length} places`}
          </span>
        </span>
      ) : null}
    </div>
  )
}

/** `HP001.png` -> `PNG`. Falls back to the media kind. */
function subtype(item: MediaListItem): string {
  const tail = item.originalFilename.split('.').pop()
  if (tail && tail.length <= 5 && tail !== item.originalFilename) return tail
  return item.kind
}

// ── Selection checkbox ──────────────────────────────────────────────────────

function SelectBox({
  checked,
  onToggle,
  filename,
  className,
}: {
  checked: boolean
  onToggle: () => void
  filename: string
  className?: string
}) {
  return (
    // A <span>, not a <label>: the Checkbox primitive renders its own label
    // around its input, and nesting labels is invalid — the browser then
    // associates the inner control with whichever label it resolves first.
    // stopPropagation keeps a click on the box from also opening the card.
    <span
      className={cn('inline-flex items-center justify-center rounded-sm p-1', className)}
      onClick={(e) => e.stopPropagation()}
    >
      <Checkbox checked={checked} onChange={onToggle} aria-label={`Select ${filename}`} />
    </span>
  )
}

// ── Grid ────────────────────────────────────────────────────────────────────

export function MediaGrid(props: RowProps) {
  const { rows, onOpen, selected, onToggleSelect } = props
  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {rows.map((row) => (
        <li
          key={row.id}
          className={cn(
            'relative flex flex-col overflow-hidden rounded-lg border bg-ih-surface transition-colors',
            selected.has(row.id) ? 'border-ih-accent' : 'border-ih-border'
          )}
        >
          <SelectBox
            checked={selected.has(row.id)}
            onToggle={() => onToggleSelect(row.id)}
            filename={row.originalFilename}
            className="absolute left-1.5 top-1.5 z-10 bg-ih-surface/85 backdrop-blur-[2px]"
          />

          <button
            type="button"
            onClick={() => onOpen(row.id)}
            aria-label={`Details for ${row.originalFilename}`}
            className="flex flex-1 flex-col text-left outline-none transition-colors hover:bg-ih-surface-2 focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ih-accent-soft"
          >
            <Thumb item={row} usages={row.usages} className="aspect-[4/3]" />
            <div className="flex flex-1 flex-col gap-1.5 px-3 pt-2.5">
              <div className="flex items-start justify-between gap-2">
                <span className="truncate text-[13px] font-medium" title={row.originalFilename}>
                  {row.originalFilename}
                </span>
                <MediaStatePill state={row.state} />
              </div>
              <UsageLine usages={row.usages} />
            </div>
          </button>

          {/* Sibling of the button, not a child — see the warning above. */}
          <div className="flex items-center gap-2 px-3 pb-2 pt-1.5 font-mono text-[11px] text-ih-muted">
            <span
              className="tabular-nums"
              title={row.bytes > 0 ? undefined : 'File size was not recorded at upload'}
            >
              {formatBytesOrUnknown(row.bytes)}
            </span>
            <span aria-hidden="true">·</span>
            <span className="truncate uppercase tracking-[0.06em]">{row.kind}</span>
            <span className="ml-auto">
              <MediaRowActions
                detail={row}
                indexPartial={props.indexPartial}
                canWrite={props.canWrite}
                canDestroy={props.canDestroy}
                trashed={props.trashed}
                onOpenDetail={() => onOpen(row.id)}
                onChanged={props.onChanged}
              />
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}

// ── List ────────────────────────────────────────────────────────────────────

export function MediaList(props: RowProps) {
  const { rows, onOpen, selected, onToggleSelect } = props
  return (
    <div className="overflow-hidden rounded-lg border border-ih-border bg-ih-surface">
      <ul className="divide-y divide-ih-border">
        {rows.map((row) => (
          <li
            key={row.id}
            className={cn(
              'flex items-center gap-2 pr-3 transition-colors',
              selected.has(row.id) && 'bg-ih-accent-soft/40'
            )}
          >
            <SelectBox
              checked={selected.has(row.id)}
              onToggle={() => onToggleSelect(row.id)}
              filename={row.originalFilename}
              className="ml-2 flex-shrink-0"
            />

            <button
              type="button"
              onClick={() => onOpen(row.id)}
              aria-label={`Details for ${row.originalFilename}`}
              className="flex min-w-0 flex-1 items-center gap-4 py-2.5 text-left text-[13px] outline-none transition-colors hover:bg-ih-surface-2 focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ih-accent-soft"
            >
              <Thumb
                item={row}
                usages={row.usages}
                className="h-11 w-14 flex-shrink-0 rounded-sm"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium" title={row.originalFilename}>
                  {row.originalFilename}
                </div>
                <UsageLine usages={row.usages} />
              </div>
              <MediaStatePill state={row.state} />
              {/* Fixed widths so the columns line up without a table element. */}
              <span
                className="w-16 text-right font-mono text-[11px] tabular-nums text-ih-muted"
                title={row.bytes > 0 ? undefined : 'File size was not recorded at upload'}
              >
                {formatBytesOrUnknown(row.bytes)}
              </span>
              <span className="hidden w-16 font-mono text-[11px] uppercase tracking-[0.06em] text-ih-muted sm:block">
                {row.kind}
              </span>
            </button>

            <MediaRowActions
              detail={row}
              indexPartial={props.indexPartial}
              canWrite={props.canWrite}
              canDestroy={props.canDestroy}
              trashed={props.trashed}
              onOpenDetail={() => onOpen(row.id)}
              onChanged={props.onChanged}
            />
          </li>
        ))}
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
