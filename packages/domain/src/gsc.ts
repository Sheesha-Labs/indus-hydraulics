/**
 * Search Console sync — the pure half.
 *
 * Everything here is arithmetic and shape-mapping so it can be tested without
 * a network or a Google account. The client and the cron live in apps/web.
 *
 * TWO PROPERTIES OF THE SEARCH CONSOLE API THAT DRIVE THIS DESIGN
 *
 * 1. Data lags. A day's figures are not final when the day ends; they settle
 *    over roughly the following two to three days. Syncing right up to today
 *    therefore stores numbers that will change, so the window stops short and
 *    the last few days are re-fetched on each run rather than trusted once.
 *
 * 2. Query rows do not sum to page totals. Search Console omits queries below
 *    a privacy threshold, so adding up the per-query rows for a page gives a
 *    number lower than that page's real total — sometimes much lower. Page
 *    totals therefore have to be fetched as their own dimension set and stored
 *    as their own rows. Deriving them would silently under-report every page.
 */

/** Days of settling to leave alone at the recent end of the window. */
export const GSC_DATA_LAG_DAYS = 3

/**
 * Days of history to reach for on a first run. Search Console retains about
 * sixteen months; this stops a little short of that so a first sync does not
 * spend its whole budget on rows the API is about to drop anyway.
 */
export const GSC_MAX_BACKFILL_DAYS = 450

/** Rows per API page. 25,000 is the documented maximum. */
export const GSC_ROW_LIMIT = 25_000

/**
 * Page-level rows carry this in the `query` column rather than NULL.
 *
 * `GscMetricDaily` has `@@unique([url, date, query])`, and Postgres treats
 * NULLs as distinct from each other in a unique index — so two page-level rows
 * for the same URL and date would BOTH be accepted, and an upsert keyed on the
 * triple could never find the existing one. Every nightly run would append a
 * fresh duplicate. A sentinel value keeps the constraint doing its job.
 */
export const GSC_PAGE_TOTAL_QUERY = ''

export type GscSyncWindow = {
  /** Inclusive, YYYY-MM-DD. */
  startDate: string
  /** Inclusive, YYYY-MM-DD. */
  endDate: string
}

export type GscApiRow = {
  keys?: string[]
  clicks?: number
  impressions?: number
  ctr?: number
  position?: number
}

export type GscDailyRow = {
  url: string
  /** YYYY-MM-DD. */
  date: string
  query: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export type GscDimensionMode = 'page' | 'page_query'

export function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d.getTime())
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

/**
 * Work out what to ask for.
 *
 * `lastSynced` is the newest date already stored. The window always reaches
 * back a few days beyond it, because those days were still settling when they
 * were first fetched and their figures will have moved since.
 *
 * Returns null when there is nothing new worth asking for, which is the normal
 * outcome of a second run on the same day.
 */
export function gscSyncWindow(today: Date, lastSynced: Date | null): GscSyncWindow | null {
  const end = addDays(today, -GSC_DATA_LAG_DAYS)

  const start = lastSynced
    ? // Re-fetch the settling window as well as anything genuinely new.
      addDays(lastSynced, -GSC_DATA_LAG_DAYS)
    : addDays(today, -GSC_MAX_BACKFILL_DAYS)

  if (start.getTime() > end.getTime()) return null

  return { startDate: toIsoDate(start), endDate: toIsoDate(end) }
}

/** Request body for `searchanalytics.query`. */
export function buildGscRequest(
  window: GscSyncWindow,
  mode: GscDimensionMode,
  startRow: number,
): Record<string, unknown> {
  return {
    startDate: window.startDate,
    endDate: window.endDate,
    // `date` first so every row carries its own day — without it the API
    // aggregates the whole window into one row per page and the daily series
    // this table exists to hold cannot be reconstructed.
    dimensions: mode === 'page' ? ['date', 'page'] : ['date', 'page', 'query'],
    rowLimit: GSC_ROW_LIMIT,
    startRow,
    // Discard is the default and is stated explicitly: including anonymised
    // rows would inflate impressions with entries carrying no usable query.
    dataState: 'final',
  }
}

/**
 * Map API rows into storage shape.
 *
 * Rows whose keys do not match the requested dimensions are dropped rather
 * than coerced — a shape mismatch means the request and the parse have drifted
 * apart, and guessing which key is which would write plausible wrong data.
 */
export function parseGscRows(rows: GscApiRow[], mode: GscDimensionMode): GscDailyRow[] {
  const expected = mode === 'page' ? 2 : 3
  const out: GscDailyRow[] = []

  for (const row of rows) {
    const keys = row.keys
    if (!keys || keys.length !== expected) continue

    const [date, url, query] = keys
    if (!date || !url) continue

    out.push({
      url,
      date,
      query: mode === 'page' ? GSC_PAGE_TOTAL_QUERY : (query ?? GSC_PAGE_TOTAL_QUERY),
      clicks: Math.round(row.clicks ?? 0),
      impressions: Math.round(row.impressions ?? 0),
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    })
  }

  return out
}

/** True when the API has more rows beyond this page. */
export function hasMoreRows(returned: number): boolean {
  return returned >= GSC_ROW_LIMIT
}
