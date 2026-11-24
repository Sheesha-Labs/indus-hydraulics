import type { ActionState } from './labels'

/**
 * Assistant action states (06-map-schema §9.11, ADR-09). Pure: the runner and every Review decision check
 * `canTransitionAction(from, to)` before a state write; the database trigger appends one
 * `assistant_action_event` per change and keeps the proposal columns immutable.
 *
 *   (create) → proposed | running | failed
 *   proposed → later | approved | edited_approved | rejected | cancelled,   later → proposed
 *   approved | edited_approved → queued (external send) | running (internal effect)
 *   queued → undone | cancelled | running
 *   running → done | failed,   failed → running (a person clicks Retry; never silent)
 *   done → undone (internal, inside undoUntil) | reverted | corrected
 *
 * (decision, S05-T02) `(create) → failed` is added to §9.11: an action whose proposal step fails (the budget
 * refuses the model call, the model refuses, or its output stays invalid) is recorded as a failed row with a
 * reason, so the log shows the attempt instead of nothing.
 */

/** The state a new row may be created in. */
export const ACTION_CREATE_STATES = [
  'proposed',
  'running',
  'failed',
] as const satisfies readonly ActionState[]
export type ActionCreateState = (typeof ACTION_CREATE_STATES)[number]

const EDGES: ReadonlyArray<readonly [ActionState, ActionState]> = [
  ['proposed', 'later'],
  ['later', 'proposed'],
  ['proposed', 'approved'],
  ['proposed', 'edited_approved'],
  ['proposed', 'rejected'],
  ['proposed', 'cancelled'],
  ['approved', 'queued'],
  ['edited_approved', 'queued'],
  ['approved', 'running'],
  ['edited_approved', 'running'],
  ['queued', 'undone'],
  ['queued', 'cancelled'],
  ['queued', 'running'],
  ['running', 'done'],
  ['running', 'failed'],
  ['failed', 'running'],
  ['done', 'undone'],
  ['done', 'reverted'],
  ['done', 'corrected'],
]

const ALLOWED = new Set(EDGES.map(([from, to]) => `${from}>${to}`))

export function canTransitionAction(from: ActionState, to: ActionState): boolean {
  return ALLOWED.has(`${from}>${to}`)
}

export function canCreateAction(state: ActionState): state is ActionCreateState {
  return (ACTION_CREATE_STATES as readonly ActionState[]).includes(state)
}

/** Every allowed transition, for tests and documentation. */
export function actionTransitions(): Array<[ActionState, ActionState]> {
  return EDGES.map(([from, to]) => [from, to])
}

/** States that end an action: nothing follows them except a revert or correction of a `done`. */
export const ACTION_TERMINAL_STATES = [
  'rejected',
  'cancelled',
  'undone',
  'reverted',
  'corrected',
] as const satisfies readonly ActionState[]

export function isTerminalAction(state: ActionState): boolean {
  return (ACTION_TERMINAL_STATES as readonly ActionState[]).includes(state)
}
