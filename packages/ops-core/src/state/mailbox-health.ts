import { canTransitionMailbox, type MailboxStatusValue } from './mailbox-state'

/**
 * Mailbox health (S04-T09, 08-map-integrations §1.13): what a five-minute look at the stored sync facts says a
 * mailbox's state should be. Pure; the health job writes the result through the state machine.
 *
 *   untouched   disconnected, token_expired, revoked (Reconnect decides), paused (the Owner decides),
 *               connecting and resyncing (their own jobs finish them)
 *   limit       sends held for the daily cap                                   → limit_reached
 *   behind      no successful sync for 30 min, or the watch errored, or it expires within 24 h (the daily
 *               renewal has been failing), or messages sit in the dead-letter queue → behind
 *   past mail   the backfill is paused or still running                       → backfill_paused / backfilling
 *   live        a successful sync within 15 min and a watch that has not expired → live
 *
 * Between 15 and 30 minutes nothing flips (no flapping). A target the state machine does not allow from here
 * leaves the state as it is.
 */
export const LIVE_WITHIN_MINUTES = 15
export const BEHIND_AFTER_MINUTES = 30
export const WATCH_RENEW_MARGIN_HOURS = 24

export type HealthFacts = {
  status: MailboxStatusValue
  lastSuccessfulSyncAt: Date | null
  watchExpiresAt: Date | null
  watchError: string | null
  dlqCount: number | null
  heldForCap: number
  backfillPhase: string | null
  now: Date
}

export type HealthVerdict = {
  /** What the facts say. */
  target: MailboxStatusValue
  /** What the job writes: the target when the state machine allows it, else the current state. */
  next: MailboxStatusValue
  lagSeconds: number
  reasons: Array<'no_sync' | 'watch_error' | 'watch_expiring' | 'dlq' | 'cap'>
}

const UNTOUCHED: ReadonlySet<MailboxStatusValue> = new Set([
  'disconnected',
  'token_expired',
  'revoked',
  'paused',
  'connecting',
  'resyncing',
])

export function evaluateMailboxHealth(f: HealthFacts): HealthVerdict {
  const lagMs = f.lastSuccessfulSyncAt
    ? Math.max(0, f.now.getTime() - f.lastSuccessfulSyncAt.getTime())
    : null
  const lagSeconds = lagMs === null ? 0 : Math.round(lagMs / 1000)
  if (UNTOUCHED.has(f.status)) return { target: f.status, next: f.status, lagSeconds, reasons: [] }

  const reasons: HealthVerdict['reasons'] = []
  const minutes = lagMs === null ? Infinity : lagMs / 60_000
  if (minutes > BEHIND_AFTER_MINUTES) reasons.push('no_sync')
  if (f.watchError) reasons.push('watch_error')
  if (
    f.watchExpiresAt &&
    f.watchExpiresAt.getTime() - f.now.getTime() < WATCH_RENEW_MARGIN_HOURS * 3_600_000
  ) {
    reasons.push('watch_expiring')
  }
  if ((f.dlqCount ?? 0) > 0) reasons.push('dlq')

  let target: MailboxStatusValue
  if (f.heldForCap > 0) {
    reasons.push('cap')
    target = 'limit_reached'
  } else if (reasons.length) {
    target = 'behind'
  } else if (f.backfillPhase === 'paused') {
    target = 'backfill_paused'
  } else if (f.backfillPhase === 'counting' || f.backfillPhase === 'fetching') {
    target = 'backfilling'
  } else if (minutes <= LIVE_WITHIN_MINUTES && (!f.watchExpiresAt || f.watchExpiresAt > f.now)) {
    target = 'live'
  } else {
    target = f.status
  }

  const next = target === f.status || canTransitionMailbox(f.status, target) ? target : f.status
  return { target, next, lagSeconds, reasons }
}

/** The pill colour for one mailbox state (S04-T09): red when it cannot work, amber when it lags. */
export function pillForMailbox(
  status: MailboxStatusValue
): 'disconnected' | 'behind' | 'paused' | null {
  if (status === 'disconnected' || status === 'token_expired' || status === 'revoked')
    return 'disconnected'
  if (status === 'behind' || status === 'limit_reached' || status === 'resyncing') return 'behind'
  if (status === 'paused') return 'paused'
  return null
}
