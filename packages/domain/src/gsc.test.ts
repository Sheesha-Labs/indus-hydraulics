import { describe, expect, it } from 'vitest'
import {
  GSC_DATA_LAG_DAYS,
  GSC_MAX_BACKFILL_DAYS,
  GSC_PAGE_TOTAL_QUERY,
  GSC_ROW_LIMIT,
  buildGscRequest,
  gscSyncWindow,
  hasMoreRows,
  parseGscRows,
  toIsoDate,
} from './gsc'

const AUG_24 = new Date('2026-08-24T00:00:00.000Z')

describe('gscSyncWindow', () => {
  it('stops short of today by the settling lag', () => {
    const w = gscSyncWindow(AUG_24, null)
    expect(w?.endDate).toBe('2026-08-21')
  })

  it('reaches back the full backfill on a first run', () => {
    const w = gscSyncWindow(AUG_24, null)
    const start = new Date(`${w!.startDate}T00:00:00.000Z`)
    const days = Math.round((AUG_24.getTime() - start.getTime()) / 86_400_000)
    expect(days).toBe(GSC_MAX_BACKFILL_DAYS)
  })

  it('re-fetches the settling window rather than only what is new', () => {
    // Figures for the last few days move after they are first published, so a
    // window starting the day after `lastSynced` would freeze stale numbers.
    const w = gscSyncWindow(AUG_24, new Date('2026-08-18T00:00:00.000Z'))
    expect(w?.startDate).toBe('2026-08-15')
    expect(w?.endDate).toBe('2026-08-21')
  })

  it('still returns a window when the last synced day is the lag boundary', () => {
    // 24th minus 3 days lag = 21st is the newest fetchable day. Having synced
    // to the 21st, the run should still fire to re-fetch it while it settles.
    const w = gscSyncWindow(AUG_24, new Date('2026-08-21T00:00:00.000Z'))
    expect(w).toEqual({ startDate: '2026-08-18', endDate: '2026-08-21' })
  })

  it('returns null once stored data runs past the fetchable window', () => {
    // Nothing left to ask for: the settling re-fetch would start after the end.
    expect(gscSyncWindow(AUG_24, new Date('2026-08-25T00:00:00.000Z'))).toBeNull()
    expect(gscSyncWindow(AUG_24, new Date('2026-09-01T00:00:00.000Z'))).toBeNull()
  })

  it('produces a window whose start is never after its end', () => {
    for (let back = 0; back < 30; back++) {
      const last = new Date(AUG_24.getTime() - back * 86_400_000)
      const w = gscSyncWindow(AUG_24, last)
      if (w) expect(w.startDate <= w.endDate).toBe(true)
    }
  })
})

describe('buildGscRequest', () => {
  const w = { startDate: '2026-08-01', endDate: '2026-08-21' }

  it('always asks for date first so rows carry their own day', () => {
    // Without the date dimension the API collapses the window into one row per
    // page, and a daily table cannot be rebuilt from that.
    expect(buildGscRequest(w, 'page', 0).dimensions).toEqual(['date', 'page'])
    expect(buildGscRequest(w, 'page_query', 0).dimensions).toEqual(['date', 'page', 'query'])
  })

  it('passes the pagination cursor through', () => {
    expect(buildGscRequest(w, 'page', 50_000).startRow).toBe(50_000)
  })

  it('requests final data only', () => {
    expect(buildGscRequest(w, 'page', 0).dataState).toBe('final')
  })
})

describe('parseGscRows', () => {
  it('maps page rows and marks them with the page-total sentinel', () => {
    const rows = parseGscRows(
      [{ keys: ['2026-08-01', 'https://x.test/a'], clicks: 3, impressions: 40, ctr: 0.075, position: 8.2 }],
      'page',
    )
    expect(rows).toEqual([
      {
        url: 'https://x.test/a',
        date: '2026-08-01',
        query: GSC_PAGE_TOTAL_QUERY,
        clicks: 3,
        impressions: 40,
        ctr: 0.075,
        position: 8.2,
      },
    ])
  })

  it('keeps the query on page+query rows', () => {
    const [row] = parseGscRows(
      [{ keys: ['2026-08-01', 'https://x.test/a', 'hose dash size'], clicks: 1, impressions: 9 }],
      'page_query',
    )
    expect(row?.query).toBe('hose dash size')
  })

  it('drops rows whose key count does not match the requested dimensions', () => {
    // A shape mismatch means request and parse have drifted. Guessing which key
    // is which would write plausible, wrong data.
    expect(parseGscRows([{ keys: ['2026-08-01'] }], 'page')).toEqual([])
    expect(parseGscRows([{ keys: ['2026-08-01', 'https://x.test/a'] }], 'page_query')).toEqual([])
  })

  it('defaults missing metrics to zero rather than undefined', () => {
    const [row] = parseGscRows([{ keys: ['2026-08-01', 'https://x.test/a'] }], 'page')
    expect(row).toMatchObject({ clicks: 0, impressions: 0, ctr: 0, position: 0 })
  })

  it('rounds click and impression counts to integers', () => {
    const [row] = parseGscRows(
      [{ keys: ['2026-08-01', 'https://x.test/a'], clicks: 2.0, impressions: 39.999 }],
      'page',
    )
    expect(Number.isInteger(row!.clicks)).toBe(true)
    expect(Number.isInteger(row!.impressions)).toBe(true)
    expect(row!.impressions).toBe(40)
  })
})

describe('hasMoreRows', () => {
  it('asks for another page only when the last one came back full', () => {
    expect(hasMoreRows(GSC_ROW_LIMIT)).toBe(true)
    expect(hasMoreRows(GSC_ROW_LIMIT - 1)).toBe(false)
    expect(hasMoreRows(0)).toBe(false)
  })
})

describe('constants', () => {
  it('leaves the settling days alone', () => {
    expect(GSC_DATA_LAG_DAYS).toBeGreaterThanOrEqual(2)
  })

  it('uses a non-null page-total sentinel', () => {
    // Postgres treats NULLs as distinct in a unique index, so a NULL here would
    // let @@unique([url, date, query]) accept duplicate page-level rows and
    // every nightly run would append another set.
    expect(GSC_PAGE_TOTAL_QUERY).not.toBeNull()
    expect(typeof GSC_PAGE_TOTAL_QUERY).toBe('string')
  })
})

describe('toIsoDate', () => {
  it('formats as YYYY-MM-DD', () => {
    expect(toIsoDate(new Date('2026-08-24T13:45:00.000Z'))).toBe('2026-08-24')
  })
})
