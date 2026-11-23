import { describe, expect, it } from 'vitest'
import type { KeyRing } from '../../lib/crypto'
import {
  PENDING_TTL_MS,
  newPending,
  openPending,
  pendingCookieName,
  pendingCookieOptions,
  sealPending,
} from './pending-2fa'

const RING: KeyRing = {
  keys: { k0: Buffer.alloc(32, 9).toString('base64'), k1: Buffer.alloc(32, 8).toString('base64') },
  active: 'k1',
}
const UID = '00000000-0000-7000-8000-000000000042'
const NOW = 1_790_000_000_000

describe('pending two-factor cookie', () => {
  it('round-trips and carries a nonce and a 5-minute expiry', () => {
    const p = newPending({ uid: UID, purpose: 'signin', next: '/review' }, NOW)
    expect(p.exp).toBe(NOW + PENDING_TTL_MS)
    expect(p.nonce.length).toBeGreaterThan(10)
    expect(openPending(sealPending(p, RING), { ring: RING, now: NOW + 1000 })).toEqual(p)
  })

  it('expires after 5 minutes', () => {
    const sealed = sealPending(newPending({ uid: UID, purpose: 'signin' }, NOW), RING)
    expect(openPending(sealed, { ring: RING, now: NOW + PENDING_TTL_MS - 1 })).not.toBeNull()
    expect(openPending(sealed, { ring: RING, now: NOW + PENDING_TTL_MS })).toBeNull()
  })

  it('refuses a tampered or foreign value', () => {
    const sealed = sealPending(newPending({ uid: UID, purpose: 'signin' }, NOW), RING)
    const parts = sealed.split('.')
    const body = Buffer.from(parts[3]!, 'base64url')
    body[2] = body[2]! ^ 0xff
    parts[3] = body.toString('base64url')
    expect(openPending(parts.join('.'), { ring: RING, now: NOW })).toBeNull()
    expect(openPending('v1.k1.AAAA.BBBB', { ring: RING, now: NOW })).toBeNull()
    expect(openPending('', { ring: RING, now: NOW })).toBeNull()
    expect(openPending(undefined, { ring: RING, now: NOW })).toBeNull()
  })

  it('checks the purpose: a sign-in value is not an enrolment and the reverse', () => {
    const signin = sealPending(newPending({ uid: UID, purpose: 'signin' }, NOW), RING)
    const enrol = sealPending(
      newPending({ uid: UID, purpose: 'enrol', pendingSecret: 'JBSWY3DPEHPK3PXP' }, NOW),
      RING
    )
    expect(openPending(signin, { ring: RING, now: NOW, purpose: 'enrol' })).toBeNull()
    expect(openPending(enrol, { ring: RING, now: NOW, purpose: 'signin' })).toBeNull()
    expect(openPending(enrol, { ring: RING, now: NOW, purpose: 'enrol' })?.pendingSecret).toBe(
      'JBSWY3DPEHPK3PXP'
    )
  })

  it('accepts a proof only on a sign-in value, and an enrolment only with its secret', () => {
    const badProof = sealPending(
      { ...newPending({ uid: UID, purpose: 'enrol', pendingSecret: 'X' }, NOW), proof: 'reset' },
      RING
    )
    expect(openPending(badProof, { ring: RING, now: NOW })).toBeNull()
    const noSecret = sealPending(newPending({ uid: UID, purpose: 'enrol' }, NOW), RING)
    expect(openPending(noSecret, { ring: RING, now: NOW })).toBeNull()
    const proof = sealPending(
      newPending({ uid: UID, purpose: 'signin', proof: 'reset' }, NOW),
      RING
    )
    expect(openPending(proof, { ring: RING, now: NOW })?.proof).toBe('reset')
  })

  it('is __Host- on HTTPS, httpOnly, lax, path /, 5 minutes', () => {
    expect(pendingCookieName(true)).toBe('__Host-indus.ops-2fa')
    expect(pendingCookieName(false)).toBe('indus.ops-2fa')
    expect(pendingCookieOptions(true)).toEqual({
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: true,
      maxAge: 300,
    })
  })
})
