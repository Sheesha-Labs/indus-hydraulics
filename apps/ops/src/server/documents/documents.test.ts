import { describe, expect, it } from 'vitest'
import { mayOpenFile } from './access'
import { signFileToken, verifyFileToken } from './file-token'
import { documentKey, downloadName, numberSlug } from './keys'

/** Keys, the file access rule and token rotation (S11-T04). */
const SHA = 'ab'.repeat(32)
const FID = '01920000-0000-7000-8000-000000000001'
const ring = (keys: Record<string, number>, active: string) => ({
  keys: Object.fromEntries(
    Object.entries(keys).map(([k, v]) => [k, Buffer.alloc(32, v).toString('base64')])
  ),
  active,
})

describe('document keys', () => {
  it('kind / year / number slug - revision - sha8, with no names', () => {
    expect(
      documentKey({
        kind: 'order_acknowledgement',
        issuedAt: new Date('2026-11-28T10:00:00Z'),
        number: 'INDUS/OA1001',
        revision: 2,
        sha256: SHA,
      })
    ).toBe('order_acknowledgement/2026/indus-oa1001-r2-abababab.pdf')
    expect(numberSlug('INDUS/Q10001-R2')).toBe('indus-q10001-r2')
    expect(() => numberSlug('///')).toThrow()
    expect(() =>
      documentKey({
        kind: 'tax_invoice',
        issuedAt: new Date(),
        number: 'X',
        revision: 1,
        sha256: 'nope',
      })
    ).toThrow()
    expect(downloadName('INDUS/Q10001', 2)).toBe('INDUS-Q10001-R2.pdf')
    expect(downloadName('INDUS/INV10001', 1)).toBe('INDUS-INV10001.pdf')
  })
})

describe('file access', () => {
  const costing = new Set(['costing_sheet'])
  it('a Helper without margins cannot open an internal cost document; the Owner and margin-seers can', () => {
    expect(mayOpenFile({ role: 'helper', canSeeMargins: false }, ['costing_sheet'], costing)).toBe(
      false
    )
    expect(mayOpenFile({ role: 'helper', canSeeMargins: false }, ['quotation'], costing)).toBe(true)
    expect(mayOpenFile({ role: 'helper', canSeeMargins: true }, ['costing_sheet'], costing)).toBe(
      true
    )
    expect(mayOpenFile({ role: 'owner', canSeeMargins: false }, ['costing_sheet'], costing)).toBe(
      true
    )
  })
})

describe('file tokens on the key ring', () => {
  it('a token signed before a rotation verifies while its key is in the ring; never after it leaves', () => {
    const old = ring({ k1: 1 }, 'k1')
    const t = signFileToken(FID, 300, Date.now(), old)
    expect(verifyFileToken(t, Date.now(), ring({ k1: 1, k2: 2 }, 'k2'))).toEqual({
      ok: true,
      fileId: FID,
    })
    expect(verifyFileToken(t, Date.now(), ring({ k2: 2 }, 'k2'))).toEqual({
      ok: false,
      reason: 'signature',
    })
  })
  it('a changed claim breaks the signature; expiry is enforced', () => {
    const r = ring({ k1: 1 }, 'k1')
    const t = signFileToken(FID, 60, 0, r)
    expect(verifyFileToken(t, 120_000, r)).toEqual({ ok: false, reason: 'expired' })
    const [body, sig] = t.split('.')
    const forged = Buffer.from(
      JSON.stringify({ ...JSON.parse(Buffer.from(body!, 'base64url').toString()), exp: 9e9 })
    ).toString('base64url')
    expect(verifyFileToken(`${forged}.${sig}`, 0, r)).toEqual({ ok: false, reason: 'signature' })
    expect(verifyFileToken('garbage', 0, r)).toEqual({ ok: false, reason: 'malformed' })
  })
})
