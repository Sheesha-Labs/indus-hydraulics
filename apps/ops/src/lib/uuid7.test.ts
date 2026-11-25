import { describe, expect, it } from 'vitest'
import { uuid7 } from './uuid7'

describe('uuid7', () => {
  it('is a version-7 RFC UUID whose first 48 bits are the time', () => {
    const id = uuid7(Date.UTC(2026, 10, 25))
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    expect(Number.parseInt(id.replace(/-/g, '').slice(0, 12), 16)).toBe(Date.UTC(2026, 10, 25))
  })
  it('sorts by time', () => {
    expect(uuid7(1000) < uuid7(2000)).toBe(true)
  })
})
