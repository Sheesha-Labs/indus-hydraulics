import { describe, expect, it } from 'vitest'
import {
  CATALOGUE_STOCK_POSTURE,
  productAvailability,
  type CatalogueStockPosture,
} from './stock-posture'

const posture = (over: Partial<CatalogueStockPosture> = {}): CatalogueStockPosture => ({
  exStock: true,
  deliveryDays: 3,
  exemptCategories: [],
  ...over,
})

describe('the shipped posture', () => {
  it('claims ex-stock in three days, catalogue-wide', () => {
    // Pinned deliberately: this is a commercial promise on 1,486 pages, so a
    // change to it should be a change to this test as well.
    expect(CATALOGUE_STOCK_POSTURE.exStock).toBe(true)
    expect(CATALOGUE_STOCK_POSTURE.deliveryDays).toBe(3)
    expect(CATALOGUE_STOCK_POSTURE.exemptCategories).toEqual([])
  })
})

describe('productAvailability', () => {
  it('puts every listed product ex-stock, whatever its recorded lead time', () => {
    const bop = productAvailability({ status: 'active', leadTimeDays: 240 }, posture())
    expect(bop.kind).toBe('ex_stock')
    expect(bop.label).toBe('Ex-stock · delivery in 3 days')
    expect(bop.schema).toBe('in_stock')
  })

  it('says the same thing in the pill and in the delivery row', () => {
    /*
      These two used to be derived separately, which is how a page came to show
      an ex-stock pill above a row reading "dispatched within 14 working days".
    */
    const state = productAvailability({ status: 'active', leadTimeDays: 14 }, posture())
    expect(state.label).toContain('3 days')
    expect(state.deliveryNote).toContain('3 working days')
    expect(state.deliveryNote).not.toContain('14')
  })

  it('prefers a counted stock figure over the blanket claim', () => {
    const state = productAvailability(
      { status: 'active', stockQty: 12, stockWarehouse: 'Jebel Ali' },
      posture(),
    )
    expect(state.kind).toBe('counted_stock')
    expect(state.label).toBe('In stock · 12 units · Jebel Ali')
  })

  it('keeps a discontinued product unavailable', () => {
    // The posture is a claim about supply, not about whether we still list it.
    const state = productAvailability({ status: 'discontinued', leadTimeDays: 7 }, posture())
    expect(state.kind).toBe('unavailable')
    expect(state.schema).toBe('out_of_stock')
  })

  it('falls back to the recorded lead time for an exempt category', () => {
    const state = productAvailability(
      { status: 'active', leadTimeDays: 240, categorySlugs: ['bop-ram', 'blowout-preventers'] },
      posture({ exemptCategories: ['blowout-preventers'] }),
    )
    expect(state.kind).toBe('lead_time')
    expect(state.label).toBe('Lead time · 240 days')
    expect(state.schema).toBe('lead_time')
  })

  it('matches an exemption anywhere in the chain, not just the leaf', () => {
    /*
      The exemption list names roots. If it only matched the product's own
      category, adding a root would look like it worked and change nothing —
      the silent no-op this codebase keeps finding.
    */
    const leafOnly = productAvailability(
      { status: 'active', leadTimeDays: 84, categorySlugs: ['oilfield-gate-valves'] },
      posture({ exemptCategories: ['oilfield-valve-suppliers-uae'] }),
    )
    expect(leafOnly.kind).toBe('ex_stock')

    const withChain = productAvailability(
      {
        status: 'active',
        leadTimeDays: 84,
        categorySlugs: ['oilfield-gate-valves', 'oilfield-valve-suppliers-uae'],
      },
      posture({ exemptCategories: ['oilfield-valve-suppliers-uae'] }),
    )
    expect(withChain.kind).toBe('lead_time')
  })

  it('falls back cleanly when the posture is switched off entirely', () => {
    const withLead = productAvailability(
      { status: 'active', leadTimeDays: 7 },
      posture({ exStock: false }),
    )
    expect(withLead.kind).toBe('lead_time')

    const withNothing = productAvailability({ status: 'active' }, posture({ exStock: false }))
    expect(withNothing.kind).toBe('unavailable')
    expect(withNothing.label).toBe('Contact for availability')
  })
})
