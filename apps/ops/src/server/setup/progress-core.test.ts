import { describe, expect, it } from 'vitest'
import { stepTitle } from '../../lib/setup-steps'
import { computeProgress, type StepStatus } from './progress-core'

const rows = (statuses: Partial<Record<string, StepStatus>>) =>
  Object.entries(statuses).map(([key, status]) => ({ key, status: status! }))

describe('computeProgress (Finish setup · n of 6. Next: …)', () => {
  it('nothing done: 0 of 6, next is step 1', () => {
    const p = computeProgress(rows({ company: 'todo', mailboxes: 'todo' }))
    expect([p.done, p.total, p.next, p.complete]).toEqual([0, 6, 'company', false])
  })

  it('step 1 done: 1 of 6, next Connect mailboxes (the demo script)', () => {
    const p = computeProgress(rows({ company: 'done' }))
    expect([p.done, p.next]).toEqual([1, 'mailboxes'])
    expect(stepTitle(p.next!)).toBe('Connect mailboxes')
  })

  it('skipped steps count, like board 78’s "3 of 6. Next: Money defaults"', () => {
    const p = computeProgress(rows({ company: 'done', mailboxes: 'skipped', history: 'skipped' }))
    expect([p.done, p.next]).toEqual([3, 'money'])
    expect(stepTitle(p.next!)).toBe('Money defaults')
  })

  it('next is the FIRST unsettled step, even before a later done one', () => {
    const p = computeProgress(rows({ company: 'in_progress', money: 'done', assistant: 'done' }))
    expect([p.done, p.next]).toEqual([2, 'company'])
  })

  it('a rolled-back step is not settled', () => {
    const p = computeProgress(rows({ company: 'rolled_back' }))
    expect([p.done, p.next]).toEqual([0, 'company'])
  })

  it('all six settled: complete, no next', () => {
    const all = computeProgress(
      rows({
        company: 'done',
        mailboxes: 'skipped',
        history: 'skipped',
        money: 'done',
        assistant: 'done',
        invite: 'done',
      })
    )
    expect([all.done, all.next, all.complete]).toEqual([6, null, true])
  })

  it('keeps rail order whatever order the rows come in, and ignores unknown keys', () => {
    const p = computeProgress([
      { key: 'invite', status: 'done' },
      { key: 'zzz', status: 'done' },
      { key: 'company', status: 'done' },
    ])
    expect(p.steps.map((s) => s.key)).toEqual([
      'company',
      'mailboxes',
      'history',
      'money',
      'assistant',
      'invite',
    ])
    expect(p.done).toBe(2)
  })

  it('step 6 says the Helper’s name once known', () => {
    expect(stepTitle('invite')).toBe('Invite your helper')
    expect(stepTitle('invite', 'Helper')).toBe('Invite Helper')
  })
})
