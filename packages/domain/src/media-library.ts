import type { MediaFolder, MediaState, MediaStateFilter } from './media-usage'

/**
 * Presentation rules for the media library list — searching, sorting, paging
 * and the byte formatting that goes with them.
 *
 * Separate from `media-usage.ts` on purpose: that module answers "is this file
 * safe to delete", which is a correctness question. This one answers "which
 * rows does the screen show, in what order", which is not. Keeping them apart
 * stops the delete guard from growing view concerns.
 *
 * Pure and Prisma-free — `MediaListItem` is the minimum shape the list needs,
 * not the `Media` row.
 */

export interface MediaListItem {
  id: string
  originalFilename: string
  alt: string | null
  caption: string | null
  kind: 'image' | 'document' | 'cad'
  bytes: number
  createdAt: Date
  storagePath: string
}

/** Enough rows to fill the widest grid evenly — 48 divides by 2, 3, 4 and 6. */
export const MEDIA_PAGE_SIZE = 48

// ── Sorting ─────────────────────────────────────────────────────────────────

export type MediaSort = 'newest' | 'oldest' | 'name' | 'largest' | 'smallest'

export const MEDIA_SORT_LABELS: Record<MediaSort, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  name: 'Filename A–Z',
  largest: 'Largest first',
  smallest: 'Smallest first',
}

export const DEFAULT_MEDIA_SORT: MediaSort = 'newest'

/**
 * Narrows an untrusted `?sort=` value. Anything unrecognised falls back.
 *
 * `Object.hasOwn`, not `in` — `in` walks the prototype chain, so
 * `'constructor' in MEDIA_SORT_LABELS` and `'__proto__' in …` are both true and
 * `?sort=constructor` would sail through as a valid sort. Caught by the test
 * below rather than in review.
 */
export function parseMediaSort(value: string | undefined | null): MediaSort {
  return value && Object.hasOwn(MEDIA_SORT_LABELS, value)
    ? (value as MediaSort)
    : DEFAULT_MEDIA_SORT
}

/**
 * Every comparator falls back to id, so the order is total.
 *
 * Without it, two files uploaded in the same millisecond — which a bulk import
 * does constantly — can swap places between requests, and a row silently
 * appears on two pages or on neither.
 */
export function compareMedia(sort: MediaSort): (a: MediaListItem, b: MediaListItem) => number {
  return (a, b) => {
    const primary = (() => {
      switch (sort) {
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime()
        case 'name':
          return a.originalFilename.localeCompare(b.originalFilename, undefined, {
            numeric: true,
            sensitivity: 'base',
          })
        case 'largest':
          return b.bytes - a.bytes
        case 'smallest':
          return a.bytes - b.bytes
        case 'newest':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime()
      }
    })()
    return primary !== 0 ? primary : a.id.localeCompare(b.id)
  }
}

// ── Searching ───────────────────────────────────────────────────────────────

/**
 * Matches filename, alt text and caption.
 *
 * Alt text matters as much as filename here: an import names files `HP001.png`,
 * so the only human-readable handle on most of the catalogue is the alt text.
 * Searching filename alone would make the box useless on exactly the rows it is
 * most needed for.
 */
export function matchesMediaSearch(item: MediaListItem, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    item.originalFilename.toLowerCase().includes(q) ||
    (item.alt ?? '').toLowerCase().includes(q) ||
    (item.caption ?? '').toLowerCase().includes(q)
  )
}

// ── Filtering ───────────────────────────────────────────────────────────────

export interface MediaListFilters {
  query: string
  kind: 'all' | 'image' | 'document' | 'cad'
  state: MediaStateFilter
  folder: MediaFolder | 'all'
  /** Trash is a view, not a filter — it swaps which rows are in scope at all. */
  trashed: boolean
}

export interface MediaListRow<T extends MediaListItem = MediaListItem> {
  item: T
  state: MediaState
  folder: MediaFolder
}

/**
 * Applies every filter, then sorts, then pages — in that order, because the
 * count shown to the user has to be the count of what matched, not of what fits
 * on the page.
 *
 * Runs in memory rather than in SQL, and that is forced rather than chosen:
 * state and folder are derived from the usage index, which is not a column, so
 * no `WHERE` clause can express them. Fine at the current 665 rows; if the
 * library reaches tens of thousands the fix is a materialised usage table, not
 * a smarter query here.
 */
export function selectMediaPage<R extends MediaListRow>(
  rows: ReadonlyArray<R>,
  opts: { filters: MediaListFilters; sort: MediaSort; page: number }
): {
  visible: R[]
  total: number
  totalPages: number
  page: number
  from: number
  to: number
} {
  const matched = rows.filter(
    (r) =>
      (opts.filters.kind === 'all' || r.item.kind === opts.filters.kind) &&
      (opts.filters.state === 'all' || r.state === opts.filters.state) &&
      (opts.filters.folder === 'all' || r.folder === opts.filters.folder) &&
      matchesMediaSearch(r.item, opts.filters.query)
  )

  const sorted = [...matched].sort((a, b) => compareMedia(opts.sort)(a.item, b.item))
  const totalPages = Math.max(1, Math.ceil(sorted.length / MEDIA_PAGE_SIZE))
  // Clamp rather than 404 — deleting the last row of page 9 should show page 9's
  // new contents, not an error.
  const page = Math.min(Math.max(1, opts.page), totalPages)
  const start = (page - 1) * MEDIA_PAGE_SIZE

  return {
    visible: sorted.slice(start, start + MEDIA_PAGE_SIZE),
    total: sorted.length,
    totalPages,
    page,
    from: sorted.length === 0 ? 0 : start + 1,
    to: Math.min(start + MEDIA_PAGE_SIZE, sorted.length),
  }
}

// ── Formatting ──────────────────────────────────────────────────────────────

/**
 * Human byte sizes, binary units.
 *
 * One decimal below 10 and none above, so a column of sizes stays the same
 * width and reads as a column — "9.4 MB" then "12 MB", never "12.0 MB".
 */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—'
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return `${Math.round(bytes)} B`

  const units = ['KB', 'MB', 'GB', 'TB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`
}

/**
 * Byte size for display, distinguishing "empty" from "not recorded".
 *
 * `bytes` is `Int` and not nullable, so a row whose size was never measured
 * holds 0 rather than NULL, and 0 has to be read as "unknown".
 *
 * Rendering it as "0 B" would state something false, and it would make the
 * library look broken rather than the data look incomplete. A stored file is
 * never genuinely zero bytes.
 *
 * The 322 rows that used to be in this state were backfilled on 2026-08-17
 * (`packages/db/src/scripts/backfill-media-bytes.ts`) and both producers that
 * wrote `bytes: 0` now measure the file first, so nothing should currently hit
 * this branch. It stays because the column still cannot express "unknown" any
 * other way and a measurement can still fail — a host that will not answer must
 * not block an editor attaching a datasheet.
 *
 * Note what those rows were, since the earlier note here had it wrong: they
 * were externally-hosted datasheets linked at the vendor's own URL, not
 * uploads whose size went unrecorded. Nothing had been uploaded at all, so
 * they occupied none of our storage — see the script for what that means for
 * the "reclaimable" total.
 */
export function formatBytesOrUnknown(bytes: number): string {
  return bytes > 0 ? formatBytes(bytes) : '—'
}

/**
 * The thumbnail source, or null when there is nothing renderable.
 *
 * `Media.storagePath` holds four incompatible shapes — a full public URL (663
 * of 665 rows), a bucket-prefixed key, a bare key, and the occasional pasted
 * third-party URL. Only an absolute URL can go straight into an `<img>`; a
 * bucket-prefixed key points into the PRIVATE documents bucket and would need a
 * signed URL, and a bare key has no bucket at all.
 *
 * So this returns null for anything it cannot render honestly and the caller
 * shows a type tile. That is not a limitation in practice — the non-URL rows
 * are documents, which have no thumbnail either way.
 *
 * Normalising those four shapes is deliberately out of scope: roughly 40
 * storefront call sites depend on the current arrangement working by accident
 * (`mediaUrl()` short-circuits on `startsWith('http')` while being named for
 * R2, which nothing uses any more).
 */
export function mediaThumbnailSrc(item: Pick<MediaListItem, 'kind' | 'storagePath'>): string | null {
  if (item.kind !== 'image') return null
  const path = item.storagePath.trim()
  return /^https?:\/\//.test(path) ? path : null
}
