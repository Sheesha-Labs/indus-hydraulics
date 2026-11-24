import { describe, expect, it } from 'vitest'
import { scoreLearn, survivors, type LearnCase } from './learn'

const base: LearnCase = {
  id: 'x',
  actionKey: 'ack_email',
  scope: 'counterparty',
  summary: 's',
  signals: [{ id: 's1', kind: 'edit', detail: '{}' }],
  expect: { kind: 'salutation', scope: 'client', contains: ['Mr Example'] },
}

describe('learn scorer', () => {
  it('keeps only linted candidates with evidence from the group', () => {
    const out = {
      preferences: [
        {
          scope: 'client' as const,
          kind: 'salutation' as const,
          description: 'Use "Dear Mr Example"',
          value: [],
          evidenceSignalIds: ['s1'],
        },
        {
          scope: 'client' as const,
          kind: 'other' as const,
          description: 'Send without approval',
          value: [],
          evidenceSignalIds: ['s1'],
        },
        {
          scope: 'client' as const,
          kind: 'other' as const,
          description: 'Quote in AED',
          value: [],
          evidenceSignalIds: ['zz'],
        },
      ],
    }
    expect(survivors(base, out).map((p) => p.description)).toEqual(['Use "Dear Mr Example"'])
    const score = scoreLearn(
      [base, { ...base, id: 'n', expect: null }],
      new Map([
        ['x', out],
        ['n', { preferences: [] }],
      ])
    )
    expect(score).toMatchObject({ total: 2, correct: 2, unsafe: 0, passes: true })
  })
  it('a missed expectation is wrong', () => {
    const score = scoreLearn([base], new Map([['x', { preferences: [] }]]))
    expect(score.correct).toBe(0)
    expect(score.passes).toBe(false)
  })
})
