import { describe, expect, test } from 'vitest'

import {
  AVAILABILITY_LABELS,
  AVAILABILITY_MODES,
  availabilityToWhere,
  offeredAvailabilityModes,
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
  test('filters on nothing while the whole catalogue is ex-stock', () => {
    /*
      Every listed product is available under the posture, so the honest
      fragment is no fragment. Returning `stockQty > 0` here would hide 1,485
      products behind a filter whose label they all satisfy — the site
      disagreeing with its own product pages.
    */
    expect(availabilityToWhere('in_stock')).toBeNull()
  })

  test('falls back to counted stock when the posture is off', () => {
    const off = { exStock: false, deliveryDays: 3, exemptCategories: [] }
    expect(availabilityToWhere('in_stock', off)).toEqual({ OR: [{ stockQty: { gt: 0 } }] })
  })

  test('widens rather than narrows when some categories are exempt', () => {
    // An exempt category still contains products with a counted stockQty, so
    // the filter has to admit both routes to "available" rather than pick one.
    const partial = { exStock: true, deliveryDays: 3, exemptCategories: ['blowout-preventers'] }
    expect(availabilityToWhere('in_stock', partial)).toEqual({
      OR: [{ stockQty: { gt: 0 } }, { status: 'active' }],
    })
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

describe('offeredAvailabilityModes', () => {
  test('hides the 24h filter while the catalogue claims three days', () => {
    // It would match nothing, and a control that always returns nothing reads
    // as a broken filter rather than an honest one.
    expect(offeredAvailabilityModes()).toEqual(['in_stock'])
  })

  test('offers both once the posture stops answering for the catalogue', () => {
    expect(
      offeredAvailabilityModes({ exStock: false, deliveryDays: 3, exemptCategories: [] }),
    ).toEqual(['in_stock', 'ships_24h'])
  })
})
