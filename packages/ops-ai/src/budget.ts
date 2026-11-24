/**
 * The monthly AI budget (C14) as pure rules. The month is the Asia/Dubai calendar month, keyed by its first
 * day, the same key `ops.ai_budget.month` uses. The reservation itself is atomic SQL
 * (`ops.ai_budget_reserve`); this file only names the month and reads a row's state for banners and notices.
 */

export type BudgetMode = 'warn_pause_research' | 'hard_stop' | 'warn_only'
export type BudgetState = 'ok' | 'warn80' | 'research_paused' | 'hard_stop'

const fmt = new Map<string, Intl.DateTimeFormat>()

/** "2026-11-01" for any instant in November 2026, Dubai time. */
export function monthKey(now: Date, timeZone = 'Asia/Dubai'): string {
  let f = fmt.get(timeZone)
  if (!f) {
    f = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit' })
    fmt.set(timeZone, f)
  }
  const parts = f.formatToParts(now)
  const year = parts.find((p) => p.type === 'year')?.value
  const month = parts.find((p) => p.type === 'month')?.value
  if (!year || !month) throw new RangeError('could not format the month')
  return `${year}-${month}-01`
}

export interface BudgetRow {
  limitUsd: string
  spentUsd: string
  mode: BudgetMode
}

/** Micro-dollars from a numeric(12,4|6) string, for comparisons only. */
function micro(v: string): bigint {
  const m = /^(\d+)(?:\.(\d+))?$/.exec(v.trim())
  if (!m) throw new RangeError(`not an amount: "${v}"`)
  return BigInt(m[1] ?? '0') * 1_000_000n + BigInt((m[2] ?? '').slice(0, 6).padEnd(6, '0'))
}

/**
 * Spend against the limit: below 80 % is ok; at 80 % a warning; at 100 % research pauses
 * (`warn_pause_research`), everything stops (`hard_stop`), or the warning stays (`warn_only`).
 */
export function budgetState(row: BudgetRow): BudgetState {
  const limit = micro(row.limitUsd)
  const spent = micro(row.spentUsd)
  if (limit > 0n && spent >= limit) {
    if (row.mode === 'hard_stop') return 'hard_stop'
    if (row.mode === 'warn_pause_research') return 'research_paused'
    return 'warn80'
  }
  if (limit === 0n)
    return row.mode === 'warn_only'
      ? 'warn80'
      : row.mode === 'hard_stop'
        ? 'hard_stop'
        : 'research_paused'
  return spent * 10n >= limit * 8n ? 'warn80' : 'ok'
}
