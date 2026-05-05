import { describe, expect, test } from 'vitest'

import {
  AVAILABILITY_LABELS,
  AVAILABILITY_MODES,
  availabilityToWhere,
  parseAvailabilityParam,
} from './availability'

describe('parseAvailabilityParam', () => {
  test('null/undefined/empty → null', () => {
    expect(parseAvailabilityParam(null)).toBeNull()
    expect(parseAvailabilityParam(undefined)).toBeNull()
    expect(parseAvailabilityParam('')).toBeNull()
  })

  test('valid modes round-trip', () => {
    for (const m of AVAILABILITY_MODES) {
      expect(parseAvailabilityParam(m)).toBe(m)
    }
  })

  test('garbage → null', () => {
    expect(parseAvailabilityParam('drop_table')).toBeNull()
    expect(parseAvailabilityParam('IN_STOCK')).toBeNull() // case-sensitive
  })
})

describe('availabilityToWhere — in_stock', () => {
  test('produces stockQty > 0 filter', () => {
    expect(availabilityToWhere('in_stock')).toEqual({ stockQty: { gt: 0 } })
  })
})

describe('availabilityToWhere — ships_24h', () => {
  test('combines in-stock with lead-time ≤ 1 OR null', () => {
    const where = availabilityToWhere('ships_24h')
    expect(where).toEqual({
      stockQty: { gt: 0 },
      OR: [{ leadTimeDays: null }, { leadTimeDays: { lte: 1 } }],
    })
  })

  test('treats missing leadTimeDays as eligible (ships from stock)', () => {
    const where = availabilityToWhere('ships_24h') as { OR: Array<Record<string, unknown>> }
    expect(where.OR.some((b) => 'leadTimeDays' in b && b.leadTimeDays === null)).toBe(true)
  })
})

describe('availabilityToWhere — null mode', () => {
  test('returns null (no filter applied)', () => {
    expect(availabilityToWhere(null)).toBeNull()
  })
})

describe('AVAILABILITY_LABELS', () => {
  test('every mode has a label', () => {
    for (const m of AVAILABILITY_MODES) {
      expect(AVAILABILITY_LABELS[m]).toBeTruthy()
    }
  })
})
