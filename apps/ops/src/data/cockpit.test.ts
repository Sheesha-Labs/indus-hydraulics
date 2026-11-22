import { describe, expect, it } from 'vitest'
import { recordHeaderFixture } from './cockpit'

describe('getRecordHeaderState stub (S02)', () => {
  it('returns null in production for every kind', () => {
    expect(recordHeaderFixture('enquiry', 'ENQ-2026-0001', 'production')).toBeNull()
    expect(recordHeaderFixture('tender', 'ENQ-2026-0001', 'production')).toBeNull()
    expect(recordHeaderFixture('order', 'SO-0001', 'production')).toBeNull()
  })

  it('returns the neutral fixtures elsewhere', () => {
    const e = recordHeaderFixture('enquiry', 'ENQ-2026-0001', 'local')
    expect(e?.kind).toBe('enquiry')
    expect(e?.stage).toEqual({ flow: 'enquiry', current: 'Quotes in' })
    expect(e?.need).toEqual({ count: 1, href: '/review?record=ENQ-2026-0001' })

    const t = recordHeaderFixture('tender', 'ENQ-2026-0001', 'preview')
    expect(t?.kind).toBe('tender')
    expect(t?.chip?.tone).toBe('warn')

    const o = recordHeaderFixture('order', 'SO-0001', 'ci')
    expect(o?.enquiryRef).toBe('ENQ-2026-0001')
    expect(o?.stage).toEqual({ flow: 'order', current: 'Freight' })
  })

  it('returns null for any other reference', () => {
    expect(recordHeaderFixture('enquiry', 'ENQ-2026-0002', 'local')).toBeNull()
    expect(recordHeaderFixture('order', 'ENQ-2026-0001', 'local')).toBeNull()
    expect(recordHeaderFixture('enquiry', 'SO-0001', 'local')).toBeNull()
  })
})
