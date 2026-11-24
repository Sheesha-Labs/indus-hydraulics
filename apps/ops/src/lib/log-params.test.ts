import { describe, expect, it } from 'vitest'
import { dayRange, logQuery, parseLogSearch } from './log-params'

describe('log params', () => {
  it('parses and falls back', () => {
    expect(
      parseLogSearch({ day: 'yesterday', actor: 'KB', outcome: 'failed', action: 'classify_mail' })
    ).toMatchObject({
      day: 'yesterday',
      actor: 'KB',
      outcome: 'failed',
      action: 'classify_mail',
    })
    expect(
      parseLogSearch({ day: 'nope', actor: 'kb!', outcome: 'x', action: 'DROP TABLE' })
    ).toMatchObject({
      day: 'today',
      actor: undefined,
      outcome: undefined,
      action: undefined,
    })
    expect(logQuery({ day: 'today', actor: 'assistant' })).toBe('?actor=assistant')
  })
  it('a day is midnight to midnight in Dubai', () => {
    const now = new Date('2026-09-23T06:00:00Z')
    expect(dayRange('today', now)).toMatchObject({
      from: new Date('2026-09-22T20:00:00Z'),
      to: new Date('2026-09-23T20:00:00Z'),
      label: 'Today · Wed 23 Sep',
    })
    expect(dayRange('2026-09-20', now).from).toEqual(new Date('2026-09-19T20:00:00Z'))
  })
})
