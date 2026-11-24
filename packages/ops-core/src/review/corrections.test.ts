import { describe, expect, it } from 'vitest'
import { AUTOPILOT_LEVELS } from '../state/labels'
import { MAX_LEVELS } from '../autopilot/levels'
import { resolveLevelInterim } from '../autopilot/resolve-interim'
import { CORRECTION_REASON_LABEL, CORRECTION_REASONS } from './corrections'

describe('corrections (S06-T07)', () => {
  it('every reason chip has a label', () => {
    expect(CORRECTION_REASONS.map((r) => CORRECTION_REASON_LABEL[r])).toEqual([
      'Wrong price',
      'Wrong quantity',
      'Wrong attachment',
      'Sent to wrong person',
      'Other',
    ])
  })

  it('correction_email never resolves above Draft and ask, whatever the Owner sets', () => {
    expect(MAX_LEVELS.correction_email).toBe('draft_and_ask')
    const def = {
      key: 'correction_email',
      lockedLevel: null,
      maxLevel: 'draft_and_ask',
      defaultCareful: 'draft_and_ask',
      defaultBalanced: 'draft_and_ask',
      defaultHandsOff: 'draft_and_ask',
    } as const
    for (const level of AUTOPILOT_LEVELS) {
      const r = resolveLevelInterim({
        def,
        setting: { level },
        origin: 'live',
        paused: false,
        budget: 'ok',
        mailboxLive: true,
        external: true,
      })
      expect(['off', 'suggest', 'draft_and_ask', 'never']).toContain(r.level)
    }
  })
})
