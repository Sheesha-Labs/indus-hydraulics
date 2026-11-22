import { describe, expect, it } from 'vitest'
import { isRequestId, newRequestId, requestIdTime } from './request-id'

describe('newRequestId', () => {
  it('is a UUIDv7 carrying the time it was made', () => {
    const at = Date.UTC(2026, 10, 22, 9, 30)
    const id = newRequestId(at)
    expect(isRequestId(id)).toBe(true)
    expect(requestIdTime(id)).toBe(at)
  })

  it('is unique and sorts by time', () => {
    const ids = Array.from({ length: 500 }, () => newRequestId())
    expect(new Set(ids).size).toBe(500)
    const early = newRequestId(1_700_000_000_000)
    const late = newRequestId(1_700_000_000_001)
    expect(early < late).toBe(true)
  })

  it('rejects other UUID versions', () => {
    expect(isRequestId('3b241101-e2bb-4255-8caf-4136c566a962')).toBe(false)
    expect(isRequestId('not-a-uuid')).toBe(false)
  })
})
