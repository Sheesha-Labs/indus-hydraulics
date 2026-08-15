import { describe, expect, test } from 'vitest'
import {
  INVITE_TTL_MS,
  MIN_STAFF_PASSWORD_LENGTH,
  RESET_TTL_MS,
  activationCopy,
  linkState,
  linkStateMessage,
  ttlFor,
  validateStaffPassword,
  validityWindowFor,
  type LinkRow,
} from './staff-invitations'

const NOW = Date.UTC(2026, 7, 15, 12, 0, 0)
const row = (over: Partial<LinkRow> = {}): LinkRow => ({
  purpose: 'invite',
  expiresAt: new Date(NOW + 60_000),
  activatedAt: null,
  ...over,
})

describe('linkState', () => {
  test('a fresh, unused link is usable', () => {
    expect(linkState(row(), NOW)).toEqual({ usable: true })
  })

  test('a missing link is unknown, not a crash', () => {
    expect(linkState(null, NOW)).toEqual({ usable: false, reason: 'unknown' })
    expect(linkState(undefined, NOW)).toEqual({ usable: false, reason: 'unknown' })
  })

  test('an activated link is single-use — this is the whole point', () => {
    expect(linkState(row({ activatedAt: new Date(NOW - 1000) }), NOW)).toEqual({
      usable: false,
      reason: 'used',
    })
  })

  test('an expired link is rejected', () => {
    expect(linkState(row({ expiresAt: new Date(NOW - 1) }), NOW)).toEqual({
      usable: false,
      reason: 'expired',
    })
  })

  test('expiry is exclusive at the boundary', () => {
    // expiresAt === now must be dead, not alive: a link that expires "now"
    // has expired.
    expect(linkState(row({ expiresAt: new Date(NOW) }), NOW).usable).toBe(false)
    expect(linkState(row({ expiresAt: new Date(NOW + 1) }), NOW).usable).toBe(true)
  })

  test('used beats expired when a link is both', () => {
    // More actionable: an expired link can be reissued, a used one usually
    // means the person already got what they needed.
    expect(linkState(row({ activatedAt: new Date(NOW - 1), expiresAt: new Date(NOW - 1) }), NOW)).toEqual(
      { usable: false, reason: 'used' },
    )
  })
})

describe('linkStateMessage', () => {
  test('names the right thing for each purpose', () => {
    expect(linkStateMessage('expired', 'invite')).toContain('invitation')
    expect(linkStateMessage('expired', 'reset')).toContain('password reset link')
  })

  test('an expired reset is never called an expired invitation', () => {
    // The bug in the implementation this was ported from: the purpose was not
    // threaded into the message, so every dead link claimed to be an invite.
    expect(linkStateMessage('expired', 'reset')).not.toContain('invitation')
    expect(linkStateMessage('used', 'reset')).not.toContain('invitation')
  })

  test('every reason produces non-empty guidance', () => {
    for (const reason of ['unknown', 'used', 'expired'] as const) {
      for (const purpose of ['invite', 'reset'] as const) {
        expect(linkStateMessage(reason, purpose).length).toBeGreaterThan(20)
      }
    }
  })
})

describe('lifetimes', () => {
  test('invites outlive resets by a wide margin', () => {
    expect(INVITE_TTL_MS).toBeGreaterThan(RESET_TTL_MS)
    expect(ttlFor('invite')).toBe(INVITE_TTL_MS)
    expect(ttlFor('reset')).toBe(RESET_TTL_MS)
  })

  test('a reset link lives one hour — matching the customer-side reset', () => {
    expect(RESET_TTL_MS).toBe(60 * 60 * 1000)
  })

  test('the stated validity window matches the real TTL', () => {
    // Guards the copy drifting away from the behaviour.
    expect(validityWindowFor('invite')).toBe('14 days')
    expect(INVITE_TTL_MS).toBe(14 * 24 * 60 * 60 * 1000)
    expect(validityWindowFor('reset')).toBe('60 minutes')
    expect(RESET_TTL_MS).toBe(60 * 60 * 1000)
  })
})

describe('activationCopy', () => {
  test('greets by first name only', () => {
    expect(activationCopy('invite', 'Krishan Bhatia').heading).toBe('Welcome, Krishan.')
    expect(activationCopy('reset', 'Krishan Bhatia').heading).toBe('Set a new password, Krishan.')
  })

  test('survives a blank or single-word name', () => {
    expect(activationCopy('invite', '').heading).toBe('Welcome, there.')
    expect(activationCopy('invite', '   ').heading).toBe('Welcome, there.')
    expect(activationCopy('reset', 'Ayush').heading).toBe('Set a new password, Ayush.')
  })

  test('an invite creates, a reset updates', () => {
    expect(activationCopy('invite', 'A B').submitLabel).toBe('Create account')
    expect(activationCopy('reset', 'A B').submitLabel).toBe('Update password')
  })
})

describe('validateStaffPassword', () => {
  const ok = 'correct-horse-battery'

  test('accepts a long matching pair', () => {
    expect(validateStaffPassword(ok, ok)).toBeNull()
  })

  test('rejects anything under the minimum', () => {
    const short = 'a'.repeat(MIN_STAFF_PASSWORD_LENGTH - 1)
    expect(validateStaffPassword(short, short)).toContain(String(MIN_STAFF_PASSWORD_LENGTH))
  })

  test('accepts exactly the minimum', () => {
    const exact = 'a'.repeat(MIN_STAFF_PASSWORD_LENGTH)
    expect(validateStaffPassword(exact, exact)).toBeNull()
  })

  test('rejects a mismatch', () => {
    expect(validateStaffPassword(ok, ok + 'x')).toMatch(/match/i)
  })

  test('length is checked before matching, so a short pair says so', () => {
    // Otherwise two short-but-equal passwords would pass the match check and
    // report nothing useful.
    expect(validateStaffPassword('abc', 'abc')).toContain(String(MIN_STAFF_PASSWORD_LENGTH))
  })

  test('staff minimum is stricter than the customer side', () => {
    // Staff accounts can price and email quotes; customers cannot.
    expect(MIN_STAFF_PASSWORD_LENGTH).toBeGreaterThan(10)
  })
})
