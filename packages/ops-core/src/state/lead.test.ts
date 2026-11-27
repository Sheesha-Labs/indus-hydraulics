import { describe, expect, it } from 'vitest'
import { TransitionRefused } from './enquiry'
import {
  canTransitionLead,
  LEAD_STAGE_WORD,
  LEAD_STAGES,
  leadEdges,
  leadTrackIndex,
  transitionLead,
  type LeadStage,
  type LeadTransitionContext,
} from './lead'

const EXPECTED: Record<string, LeadTransitionContext> = {
  'new>contacted': {},
  'contacted>qualified': {},
  'new>converted': { convertedEnquiryId: 'e' },
  'contacted>converted': { convertedEnquiryId: 'e' },
  'qualified>converted': { convertedEnquiryId: 'e' },
  'new>dropped': {},
  'contacted>dropped': {},
  'qualified>dropped': {},
  'dropped>new': { actorRole: 'owner' },
}
const ALL: LeadTransitionContext = { convertedEnquiryId: 'e', actorRole: 'owner' }

describe('lead machine', () => {
  const pairs = LEAD_STAGES.flatMap((f) => LEAD_STAGES.map((t) => [f, t] as const))

  it('covers all 25 pairs: the allowed set equals the table', () => {
    expect(pairs).toHaveLength(25)
    const allowed = pairs
      .filter(([f, t]) => canTransitionLead(f, t, ALL).ok)
      .map(([f, t]) => `${f}>${t}`)
    expect(allowed.sort()).toEqual(Object.keys(EXPECTED).sort())
    expect(
      leadEdges()
        .map(([f, t]) => `${f}>${t}`)
        .sort()
    ).toEqual(Object.keys(EXPECTED).sort())
  })

  it.each(Object.entries(EXPECTED))('%s is allowed', (edge, ctx) => {
    const [f, t] = edge.split('>') as [LeadStage, LeadStage]
    expect(transitionLead(f, t, ctx)).toEqual({
      kind: 'status',
      field: 'stage',
      before: f,
      after: t,
    })
  })

  it.each(pairs.filter(([f, t]) => !EXPECTED[`${f}>${t}`]))('%s → %s is refused', (f, t) => {
    const r = canTransitionLead(f, t, ALL)
    expect(r.ok).toBe(false)
    if (r.ok) return
    if (f === 'converted') expect(r.reason).toBe('A converted lead carries on as its enquiry')
    else if (f === t) expect(r.reason).toBe(`It is already ${LEAD_STAGE_WORD[t]}`)
    else expect(r.reason).toBe(`${LEAD_STAGE_WORD[f]} cannot move to ${LEAD_STAGE_WORD[t]}`)
    expect(() => transitionLead(f, t, ALL)).toThrow(TransitionRefused)
  })

  it('guards', () => {
    const r1 = canTransitionLead('qualified', 'converted')
    expect(r1).toEqual({ ok: false, reason: 'Convert it to an enquiry' })
    expect(canTransitionLead('dropped', 'new', { actorRole: 'helper' })).toEqual({
      ok: false,
      reason: 'Only the Owner revives a dropped lead',
    })
  })

  it('track index', () => {
    expect(LEAD_STAGES.map(leadTrackIndex)).toEqual([0, 1, 2, 3, 0])
  })
})
