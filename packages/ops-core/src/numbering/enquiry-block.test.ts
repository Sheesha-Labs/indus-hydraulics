import { describe, expect, it } from 'vitest'
import { enquiryContinuity, enquiryRefOf, enquirySeedNext } from './enquiry-block'

describe('ENQ block while the website admin runs (C5)', () => {
  it('seeds 1000 above the legacy max, never below what Ops issued', () => {
    expect(enquirySeedNext(433)).toBe(1433)
    expect(enquirySeedNext(0)).toBe(1000)
    expect(enquirySeedNext(433, 2000)).toBe(2001)
  })

  it('warns within 200 of the block and flags once the admin reaches it', () => {
    expect(enquiryContinuity(433, 1433)).toBe('ok')
    expect(enquiryContinuity(1232, 1433)).toBe('ok')
    expect(enquiryContinuity(1233, 1433)).toBe('approaching')
    expect(enquiryContinuity(1432, 1433)).toBe('approaching')
    expect(enquiryContinuity(1433, 1433)).toBe('out_of_step')
  })

  it('formats a ref', () => {
    expect(enquiryRefOf(2026, 433)).toBe('ENQ-2026-0433')
    expect(enquiryRefOf(2027, 12345)).toBe('ENQ-2027-12345')
  })
})
