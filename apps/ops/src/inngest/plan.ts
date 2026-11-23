/**
 * The Inngest concurrency budget (ADR-04; decision 2026-11-23, docs/infra-decisions.md §1).
 *
 * The plan is the FREE plan: 5 concurrent steps, ACCOUNT-WIDE, shared with the website's own Inngest jobs.
 * Ops does not give each function its own slots (11+ functions can never fit 5 that way). Every Ops function
 * runs in one of three shared lanes: an environment-scoped concurrency key that all functions of the lane queue
 * on together, so Ops as a whole never runs more than the lanes' sum at once.
 *
 *   live   2   reading new mail, the send queue, connect / reconnect: what a person waits for
 *   bulk   1   the 12/24-month past-mail import and the delete-everything purge: never blocks live mail
 *   house  1   crons: heartbeat, safety poll, watch renewal, health, send reconcile
 *
 * 4 for Ops leaves 1 for the website. When all are busy, work waits in Inngest's queue; nothing fails.
 * `concurrency.test.ts` checks every function sits in exactly one lane and that the lanes plus the website's
 * reserve fit the cap.
 */
export const OPS_INNGEST_CONCURRENCY_CAP = 5

/** Slots left for the website's jobs on the shared account. */
export const WEBSITE_RESERVE = 1

export const OPS_LANES = { live: 2, bulk: 1, house: 1 } as const

export type OpsLane = keyof typeof OPS_LANES

/** The CEL key of a lane: a constant string, so every function in the lane shares one queue. */
export function laneKey(lane: OpsLane): string {
  return `"ops-${lane}"`
}

/** The lane's concurrency constraint, scoped to the Inngest environment (a preview never takes production's). */
export function laneConcurrency(lane: OpsLane): { scope: 'env'; key: string; limit: number } {
  return { scope: 'env', key: laneKey(lane), limit: OPS_LANES[lane] }
}
