import { describe, expect, it } from 'vitest'
import {
  ACTION_CREATE_STATES,
  actionTransitions,
  canCreateAction,
  canTransitionAction,
  isTerminalAction,
} from './assistant-action-state'
import { ACTION_STATES, type ActionState } from './labels'

/** 06-map-schema §9.11, every row, plus the S05-T02 create → failed decision. */
const SPEC: Array<[ActionState, ActionState]> = [
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

describe('assistant action state machine (§9.11)', () => {
  it('allows exactly the specified transitions (100% coverage of the matrix)', () => {
    const spec = new Set(SPEC.map(([a, b]) => `${a}>${b}`))
    for (const from of ACTION_STATES) {
      for (const to of ACTION_STATES) {
        expect(canTransitionAction(from, to), `${from} → ${to}`).toBe(spec.has(`${from}>${to}`))
      }
    }
    expect(actionTransitions()).toHaveLength(SPEC.length)
  })

  it('creates rows only as proposed, running or failed', () => {
    expect([...ACTION_CREATE_STATES].sort()).toEqual(['failed', 'proposed', 'running'])
    for (const s of ACTION_STATES) {
      expect(canCreateAction(s)).toBe(['proposed', 'running', 'failed'].includes(s))
    }
  })

  it('a terminal state has no way out', () => {
    for (const s of ACTION_STATES.filter(isTerminalAction)) {
      expect(
        ACTION_STATES.some((to) => canTransitionAction(s, to)),
        s
      ).toBe(false)
    }
  })

  it('failed comes back only through running (a person clicks Retry)', () => {
    expect(ACTION_STATES.filter((to) => canTransitionAction('failed', to))).toEqual(['running'])
  })
})
