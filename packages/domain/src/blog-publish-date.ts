/**
 * Blog publication-date resolution.
 *
 * `BlogPost.publishedAt` is the canonical first-publication date and feeds
 * Article JSON-LD `datePublished`. Three rules the previous inline logic broke:
 *
 *  1. Re-publishing an edit must not reset the date to now. The old action ran
 *     `publishedAt: publish ? new Date() : undefined`, so every save of a live
 *     post re-dated it — which tells Google the piece is brand new each time.
 *  2. Un-publishing must not erase the date. A post taken down and put back up
 *     should return with its original date, not a blank one.
 *  3. An explicit date always wins, so authors can back-date an import or
 *     schedule a piece ahead of time.
 */

export interface ResolvePublishedAtInput {
  /** Author-supplied date, if any. Wins outright when present. */
  explicit: Date | null
  /** The row's current `publishedAt`, or null for a post never published. */
  existing: Date | null
  /** Whether this save publishes the post. */
  publish: boolean
  /** Injected so the caller controls the clock; tests pass a fixed instant. */
  now: Date
}

export function resolvePublishedAt({
  explicit,
  existing,
  publish,
  now,
}: ResolvePublishedAtInput): Date | null {
  if (explicit) return explicit
  if (publish && !existing) return now
  return existing
}

/**
 * Parse a `datetime-local` value ("2026-08-17T09:30") into a Date.
 * Returns null for empty or unparseable input so callers fall through to their
 * own default rather than writing an Invalid Date to the column.
 */
export function parseLocalDateTime(raw: string): Date | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const parsed = new Date(trimmed)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}
