import { describe, expect, it } from 'vitest'
import {
  encodeEvidenceId,
  evidenceIdSchema,
  parseEvidenceId,
  type EvidenceRef,
} from './evidence-id'

const CASES: EvidenceRef[] = [
  { kind: 'action', ref: 'A-26-11-24-0007' },
  { kind: 'reason', ref: 'A-26-11-24-0007', index: 0 },
  { kind: 'reason', ref: 'A-26-11-24-0007', index: 5 },
  { kind: 'field', ref: 'A-26-11-24-0007', field: 'classification' },
  { kind: 'field', ref: 'A-26-11-24-0007', field: 'line.7.partNo' },
  { kind: 'event', eventId: '0190f3a2-7b1c-7000-8000-000000000001' },
  { kind: 'fixture', id: '00000000-0000-7000-8000-00000000e001' },
]

describe('evidence ids', () => {
  it.each(CASES)('round-trips %o', (e) => {
    expect(parseEvidenceId(encodeEvidenceId(e))).toEqual(e)
  })

  it('accepts the URL-encoded form a router hands back', () => {
    expect(parseEvidenceId('A-26-11-24-0007%7Er1')).toEqual({
      kind: 'reason',
      ref: 'A-26-11-24-0007',
      index: 1,
    })
  })

  it.each([
    '',
    'not-a-ref',
    'A-',
    'A-1~',
    'A-1~x',
    'A-1~r',
    'A-1~r01',
    'A-1~r100',
    'A-1~f',
    'A-1~f9x',
    'A-1~r1~r2',
    'ae_nope',
    '../etc/passwd',
    '%E0%A4%A',
    `A-${'1'.repeat(200)}`,
  ])('rejects %j', (s) => {
    expect(parseEvidenceId(s)).toBeNull()
    expect(evidenceIdSchema.safeParse(s).success).toBe(false)
  })
})
