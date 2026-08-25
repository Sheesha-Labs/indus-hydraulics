import { describe, it, expect } from 'vitest'
import { STAINLESS_ON_REQUEST_TEMPLATES, offersStainlessOnRequest } from './spec-templates'

describe('offersStainlessOnRequest', () => {
  it('is true for the hydraulic fitting and adapter templates the offer came from', () => {
    expect(offersStainlessOnRequest('hydraulic-adapter-spec')).toBe(true)
    expect(offersStainlessOnRequest('threaded-fitting-spec')).toBe(true)
  })

  it('is false for a pressure part with no 316 equivalent to order', () => {
    // A 20,000 psi hammer union is forged alloy steel. The size table used to
    // print the offer unconditionally, which put the claim on every page that
    // had a size table at all.
    expect(offersStainlessOnRequest('hammer-union-spec')).toBe(false)
    expect(offersStainlessOnRequest('flow-iron-spec')).toBe(false)
  })

  it('is false for a product with no template, rather than throwing', () => {
    expect(offersStainlessOnRequest(null)).toBe(false)
    expect(offersStainlessOnRequest(undefined)).toBe(false)
  })

  it('is an allowlist, so a template added later starts silent', () => {
    expect(STAINLESS_ON_REQUEST_TEMPLATES).not.toContain('hammer-union-spec')
  })
})
