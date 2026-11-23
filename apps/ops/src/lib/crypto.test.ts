import { describe, expect, it } from 'vitest'
import {
  CryptoError,
  additionalData,
  open,
  openText,
  randomToken,
  safeEqual,
  seal,
  sha256Hex,
  type KeyRing,
} from './crypto'

const K0 = Buffer.alloc(32, 1).toString('base64')
const K1 = Buffer.alloc(32, 2).toString('base64')
const OLD: KeyRing = { keys: { k0: K0 }, active: 'k0' }
const ROTATED: KeyRing = { keys: { k0: K0, k1: K1 }, active: 'k1' }
const AAD = additionalData('totp', '00000000-0000-7000-8000-000000000001')

describe('seal / open', () => {
  it('round-trips text and bytes under the active key', () => {
    const sealed = seal('JBSWY3DPEHPK3PXP', AAD, ROTATED)
    expect(sealed.startsWith('v1.k1.')).toBe(true)
    expect(openText(sealed, AAD, ROTATED)).toBe('JBSWY3DPEHPK3PXP')
    const bytes = new Uint8Array([0, 1, 2, 255])
    expect([...open(seal(bytes, AAD, ROTATED), AAD, ROTATED)]).toEqual([0, 1, 2, 255])
  })

  it('never produces the same ciphertext twice', () => {
    expect(seal('x', AAD, ROTATED)).not.toBe(seal('x', AAD, ROTATED))
  })

  it('opens a value sealed under an older key id after rotation', () => {
    const sealed = seal('secret', AAD, OLD)
    expect(openText(sealed, AAD, ROTATED)).toBe('secret')
  })

  it('refuses a value whose key id is no longer in the ring', () => {
    const sealed = seal('secret', AAD, ROTATED)
    expect(() => open(sealed, AAD, OLD)).toThrow(CryptoError)
  })

  it('detects tampering with the ciphertext, the iv or the key id', () => {
    const sealed = seal('secret', AAD, ROTATED)
    const [v, kid, iv, body] = sealed.split('.') as [string, string, string, string]
    const flip = (s: string) => {
      const b = Buffer.from(s, 'base64url')
      b[0] = b[0]! ^ 1
      return b.toString('base64url')
    }
    expect(() => open([v, kid, iv, flip(body)].join('.'), AAD, ROTATED)).toThrow(CryptoError)
    expect(() => open([v, kid, flip(iv), body].join('.'), AAD, ROTATED)).toThrow(CryptoError)
    expect(() => open([v, 'k0', iv, body].join('.'), AAD, ROTATED)).toThrow(CryptoError)
    expect(() => open('garbage', AAD, ROTATED)).toThrow(CryptoError)
  })

  it('binds the value to its purpose and row (additional data)', () => {
    const sealed = seal('secret', AAD, ROTATED)
    expect(() => open(sealed, additionalData('totp', 'another-row'), ROTATED)).toThrow(CryptoError)
    expect(() => open(sealed, additionalData('pending-2fa', 'row'), ROTATED)).toThrow(CryptoError)
    expect(() => additionalData('', 'row')).toThrow(CryptoError)
  })
})

describe('helpers', () => {
  it('sha256Hex is the hex digest', () => {
    expect(sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    )
  })

  it('randomToken is base64url of the requested length', () => {
    const t = randomToken(32)
    expect(t).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(randomToken(32)).not.toBe(t)
  })

  it('safeEqual compares whole strings', () => {
    expect(safeEqual('abc', 'abc')).toBe(true)
    expect(safeEqual('abc', 'abd')).toBe(false)
    expect(safeEqual('abc', 'abcd')).toBe(false)
  })
})
