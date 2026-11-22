import { describe, expect, it } from 'vitest'
import { evidenceFixture, evidenceIdSchema, FIXTURE_EVIDENCE_ID } from './evidence'

describe('getEvidence stub (S02; S06 fills it)', () => {
  it('outside production the fixture id resolves to the neutral sample', () => {
    const e = evidenceFixture(FIXTURE_EVIDENCE_ID, 'local')!
    expect(e.id).toBe(FIXTURE_EVIDENCE_ID)
    expect(e.reasons.length).toBeGreaterThan(0)
    expect(e.source?.text).toContain(e.source?.mark)
    expect(e.sources).toHaveLength(2)
  })

  it('in production, and for any other id, there is nothing (the not-found state)', () => {
    expect(evidenceFixture(FIXTURE_EVIDENCE_ID, 'production')).toBeNull()
    expect(evidenceFixture('00000000-0000-7000-8000-00000000ffff', 'local')).toBeNull()
  })

  it('evidence ids are UUIDs', () => {
    expect(evidenceIdSchema.safeParse(FIXTURE_EVIDENCE_ID).success).toBe(true)
    expect(evidenceIdSchema.safeParse('not-a-uuid').success).toBe(false)
    expect(evidenceIdSchema.safeParse('../etc').success).toBe(false)
  })
})
