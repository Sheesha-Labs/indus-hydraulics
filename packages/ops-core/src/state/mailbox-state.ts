import { MAILBOX_STATUSES, type MailboxStatus } from './labels'

/**
 * Mailbox connection states (06-map-schema §9.12, extended by S04-T02 / ADR-06). Pure: the server checks
 * `canTransitionMailbox(from, to)` before every status write.
 *
 *   connecting → backfilling | live
 *   backfilling ↔ backfill_paused,  backfilling → live
 *   live ↔ behind,  live ↔ limit_reached,  live ↔ resyncing,  behind → resyncing,  resyncing → behind
 *   any working state → paused (Owner) → back to any working state
 *   any state → disconnected | token_expired | revoked
 *   disconnected | token_expired | revoked → connecting (reconnect, board 86)
 *
 * A mailbox that cannot send (disconnected, token_expired, revoked, paused) holds its sends and never switches
 * mailbox (board 87).
 */

export type MailboxStatusValue = MailboxStatus

/** States a mailbox works in: it reads, and (capability allowing) sends. */
export const WORKING_STATES: readonly MailboxStatusValue[] = [
  'backfilling',
  'live',
  'behind',
  'limit_reached',
  'backfill_paused',
  'resyncing',
]

/** States in which the mailbox has no usable token: everything waits for Reconnect. */
export const BROKEN_STATES: readonly MailboxStatusValue[] = [
  'disconnected',
  'token_expired',
  'revoked',
]

const EDGES: ReadonlyArray<readonly [MailboxStatusValue, MailboxStatusValue]> = [
  ['connecting', 'backfilling'],
  ['connecting', 'live'],
  ['backfilling', 'live'],
  ['backfilling', 'backfill_paused'],
  ['backfill_paused', 'backfilling'],
  ['live', 'behind'],
  ['behind', 'live'],
  ['live', 'limit_reached'],
  ['limit_reached', 'live'],
  ['live', 'resyncing'],
  ['resyncing', 'live'],
  ['behind', 'resyncing'],
  ['resyncing', 'behind'],
  ...WORKING_STATES.map((s) => [s, 'paused'] as const),
  ['connecting', 'paused'],
  ...WORKING_STATES.map((s) => ['paused', s] as const),
  ...MAILBOX_STATUSES.flatMap((from) =>
    BROKEN_STATES.filter((to) => to !== from).map((to) => [from, to] as const)
  ),
  ...BROKEN_STATES.map((s) => [s, 'connecting'] as const),
]

const ALLOWED = new Set(EDGES.map(([from, to]) => `${from}>${to}`))

export function canTransitionMailbox(from: MailboxStatusValue, to: MailboxStatusValue): boolean {
  return ALLOWED.has(`${from}>${to}`)
}

/** Every allowed transition, for tests and documentation. */
export function mailboxTransitions(): Array<[MailboxStatusValue, MailboxStatusValue]> {
  return [...ALLOWED].map((e) => e.split('>') as [MailboxStatusValue, MailboxStatusValue])
}

/** Whether the mailbox may send right now (status only; capability and caps are checked separately). */
export function mailboxCanSend(status: MailboxStatusValue): boolean {
  return (
    status === 'live' ||
    status === 'behind' ||
    status === 'backfilling' ||
    status === 'backfill_paused' ||
    status === 'resyncing'
  )
}

/** Whether the sync may read the mailbox. */
export function mailboxCanRead(status: MailboxStatusValue): boolean {
  return status !== 'paused' && !BROKEN_STATES.includes(status) && status !== 'connecting'
}
