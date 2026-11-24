import 'server-only'
import { budgetState, monthKey, type BudgetMode } from '@indus/ops-ai'
import { opsDb } from '@indus/ops-db'
import { releaseStaleReservations } from '../assistant/ai-ledger'
import { raiseNotification } from '../notify/raise'

/**
 * The AI budget's housekeeping (S07-T04, C14):
 *   rollover   the new month's ai_budget row from the `assistant.budget` setting (idempotent: the SQL function
 *              inserts ON CONFLICT DO NOTHING)
 *   sweep      settles, at zero, reservations a crashed call left open for 30 minutes
 *   thresholds the 80 % and 100 % notices, once each per month (notified80At / notified100At on the row and
 *              the notification dedupe keys budget80:<month> / budget100:<month>)
 */
export async function rolloverBudget(now = new Date()): Promise<{ month: string }> {
  const month = monthKey(now)
  await opsDb.$executeRaw`SELECT ops.ai_budget_ensure_month(${month}::date)`
  return { month }
}

export async function sweepReservations(): Promise<{ released: number }> {
  return { released: await releaseStaleReservations(30) }
}

export async function budgetThresholds(
  now = new Date()
): Promise<{ month: string; notified: Array<'80' | '100'> }> {
  const month = monthKey(now)
  const row = await opsDb.aiBudget.findUnique({ where: { month: new Date(`${month}T00:00:00Z`) } })
  const notified: Array<'80' | '100'> = []
  if (!row || row.limitUsd.lte(0)) return { month, notified }
  const spent = row.spentUsd.toNumber()
  const limit = row.limitUsd.toNumber()
  const state = budgetState({
    limitUsd: row.limitUsd.toFixed(4),
    spentUsd: row.spentUsd.toFixed(6),
    mode: row.mode as BudgetMode,
  })
  const label = `USD ${Math.round(spent)} of ${Math.round(limit)}`
  if (spent >= limit && !row.notified100At) {
    // Claim the notice on the row first, so two runs never notify twice.
    const { count } = await opsDb.aiBudget.updateMany({
      where: { month: row.month, notified100At: null },
      data: { notified100At: now, ...(row.notified80At ? {} : { notified80At: now }) },
    })
    if (count === 1) {
      await raiseNotification({
        event: 'budget_threshold',
        severity: 'critical',
        title:
          state === 'hard_stop'
            ? `Monthly AI budget reached: the Assistant has stopped (${label})`
            : state === 'research_paused'
              ? `Monthly AI budget reached: supplier research is paused (${label})`
              : `Monthly AI budget reached (${label})`,
        dedupeKey: `budget100:${month}`,
        audience: 'owners',
        actionUrl: '/assistant/cost',
      })
      notified.push('100')
    }
  } else if (spent >= limit * 0.8 && !row.notified80At) {
    const { count } = await opsDb.aiBudget.updateMany({
      where: { month: row.month, notified80At: null },
      data: { notified80At: now },
    })
    if (count === 1) {
      await raiseNotification({
        event: 'budget_threshold',
        severity: 'warning',
        title: `80% of the monthly AI budget used (${label})`,
        dedupeKey: `budget80:${month}`,
        audience: 'owners',
        actionUrl: '/assistant/cost',
      })
      notified.push('80')
    }
  }
  return { month, notified }
}
