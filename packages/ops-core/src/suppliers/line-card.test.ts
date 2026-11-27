import { describe, expect, it } from 'vitest'
import { lapsedCategories, lineCardCovers, reinstatedCategories, reinstateTo } from './line-card'

const today = new Date(Date.UTC(2026, 10, 27))
const past = new Date(Date.UTC(2026, 9, 1))
const future = new Date(Date.UTC(2027, 9, 1))
const card = (
  id: string,
  p: Partial<{
    tradeId: string
    brand: string | null
    status: string
    coveredByDocumentIds: string[]
  }> = {}
) => ({
  id,
  tradeId: 't1',
  brand: null,
  status: 'active',
  coveredByDocumentIds: [] as string[],
  ...p,
})

describe('lineCardCovers', () => {
  it('active or trial covers; other states do not; brand narrows', () => {
    expect(lineCardCovers([card('a')], { tradeId: 't1' })).toEqual({
      covers: true,
      status: 'active',
      trial: false,
    })
    expect(lineCardCovers([card('a', { status: 'trial' })], { tradeId: 't1' })).toEqual({
      covers: true,
      status: 'trial',
      trial: true,
    })
    expect(lineCardCovers([card('a', { status: 'suspended' })], { tradeId: 't1' }).covers).toBe(
      false
    )
    expect(lineCardCovers([card('a', { status: 'not_carried' })], { tradeId: 't1' }).covers).toBe(
      false
    )
    expect(lineCardCovers([card('a')], { tradeId: 't2' })).toEqual({
      covers: false,
      status: null,
      trial: false,
    })
    expect(
      lineCardCovers([card('a', { brand: 'HART' })], { tradeId: 't1', brand: 'hart' }).covers
    ).toBe(true)
    expect(
      lineCardCovers([card('a', { brand: 'HART' })], { tradeId: 't1', brand: 'Other' }).covers
    ).toBe(false)
    expect(
      lineCardCovers([card('a', { status: 'trial' }), card('b')], { tradeId: 't1' }).status
    ).toBe('active')
  })
})

describe('lapse and reinstatement', () => {
  const docs = [
    { id: 'd-old', expiresAt: past },
    { id: 'd-new', expiresAt: future },
    { id: 'd-none', expiresAt: null },
    { id: 'd-gone', expiresAt: future, archivedAt: past },
  ]
  it('suspends exactly the usable cards whose covering documents all expired', () => {
    const cards = [
      card('a', { coveredByDocumentIds: ['d-old'] }),
      card('b', { coveredByDocumentIds: ['d-old', 'd-new'] }),
      card('c', { coveredByDocumentIds: [] }),
      card('d', { coveredByDocumentIds: ['d-old'], status: 'suspended' }),
      card('e', { coveredByDocumentIds: ['d-gone'], status: 'trial' }),
      card('f', { coveredByDocumentIds: ['missing'] }),
      card('g', { coveredByDocumentIds: ['d-none'] }),
    ]
    expect(lapsedCategories(cards, docs, today).map((c) => c.id)).toEqual(['a', 'e'])
  })
  it('reinstates a suspended card once a valid document covers it', () => {
    const cards = [
      card('a', { status: 'suspended', coveredByDocumentIds: ['d-old', 'd-new'] }),
      card('b', { status: 'suspended', coveredByDocumentIds: ['d-old'] }),
      card('c', { status: 'active', coveredByDocumentIds: ['d-new'] }),
    ]
    expect(reinstatedCategories(cards, docs, today).map((c) => c.id)).toEqual(['a'])
    expect(reinstateTo('trial')).toBe('trial')
    expect(reinstateTo('approved')).toBe('active')
  })
})
