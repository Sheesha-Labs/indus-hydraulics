import { describe, expect, it } from 'vitest'
import { budgetState, monthKey } from './budget'

describe('budget', () => {
  it('keys the month by Dubai time', () => {
    expect(monthKey(new Date('2026-11-24T09:00:00Z'))).toBe('2026-11-01')
    // 31 Oct 21:00 UTC is already 1 Nov in Dubai (UTC+4)
    expect(monthKey(new Date('2026-10-31T21:00:00Z'))).toBe('2026-11-01')
    expect(monthKey(new Date('2026-10-31T19:59:00Z'))).toBe('2026-10-01')
    expect(monthKey(new Date('2026-12-31T20:00:00Z'))).toBe('2027-01-01')
  })

  it.each([
    ['0', 'warn_pause_research', 'ok'],
    ['119.99', 'warn_pause_research', 'ok'],
    ['120', 'warn_pause_research', 'warn80'],
    ['150', 'warn_pause_research', 'research_paused'],
    ['150', 'hard_stop', 'hard_stop'],
    ['151', 'warn_only', 'warn80'],
  ] as const)('spent %s of 150 in %s → %s', (spent, mode, state) => {
    expect(budgetState({ limitUsd: '150.0000', spentUsd: spent, mode })).toBe(state)
  })

  it('treats a zero limit as already reached', () => {
    expect(budgetState({ limitUsd: '0', spentUsd: '0', mode: 'hard_stop' })).toBe('hard_stop')
    expect(budgetState({ limitUsd: '0', spentUsd: '0', mode: 'warn_only' })).toBe('warn80')
  })
})
