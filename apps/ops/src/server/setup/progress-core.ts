import { SETUP_STEPS, type SetupStep } from '../../lib/route-params'
import { SETUP_TOTAL } from '../../lib/setup-steps'

/**
 * The setup checklist's arithmetic (P01, board 78 "Finish setup · n of 6. Next: …"). Pure.
 *
 * A step counts towards n when it is `done` or `skipped` (steps 2 and 3 are skipped until S04 and S20
 * build them; board 78 counts them: "3 of 6. Next: Money defaults"). `next` is the first step, in rail
 * order, that is neither; null when setup is complete. A step missing from the rows counts as to do.
 */
export type StepStatus = 'todo' | 'in_progress' | 'done' | 'skipped' | 'rolled_back'

export type SetupProgress = {
  steps: { key: SetupStep; status: StepStatus }[]
  done: number
  total: number
  next: SetupStep | null
  complete: boolean
}

export function isSettled(status: StepStatus): boolean {
  return status === 'done' || status === 'skipped'
}

export function computeProgress(
  rows: readonly { key: string; status: StepStatus }[]
): SetupProgress {
  const byKey = new Map(rows.map((r) => [r.key, r.status]))
  const steps = SETUP_STEPS.map((key) => ({ key, status: byKey.get(key) ?? ('todo' as const) }))
  const done = steps.filter((s) => isSettled(s.status)).length
  const next = steps.find((s) => !isSettled(s.status))?.key ?? null
  return { steps, done, total: SETUP_TOTAL, next, complete: next === null }
}
