/**
 * The Inngest concurrency cap the Ops functions must fit inside, together.
 * Recorded in apps/ops/docs/infra-decisions.md (per function or account-wide,
 * and its value). 5 until the plan is checked; concurrency.test.ts enforces it.
 */
export const OPS_INNGEST_CONCURRENCY_CAP = 5
