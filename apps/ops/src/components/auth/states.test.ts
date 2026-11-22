import { describe, expect, it } from 'vitest'
import { roughStrength } from './strength'
import { TEXT, isGoogleRefusal, passwordNotice, signInNotice } from './states'

const CTX = { domain: 'example.test', pageLabel: 'Review' }

/** Board 77's states: what /sign-in shows for each query and each password-step result. */
describe('sign-in decision table', () => {
  const rows: [Record<string, string>, { tone: string; text: string } | null][] = [
    [{}, null],
    [{ error: 'personal_account' }, { tone: 'warn', text: TEXT.personalAccount }],
    [{ error: 'wrong_domain' }, { tone: 'warn', text: TEXT.wrongDomain('example.test') }],
    [{ error: 'not_invited' }, { tone: 'warn', text: TEXT.notInvited }],
    [{ error: 'email_unverified' }, { tone: 'warn', text: TEXT.emailUnverified }],
    [{ error: 'deactivated' }, { tone: 'warn', text: TEXT.deactivated }],
    [{ reason: 'deactivated' }, { tone: 'warn', text: TEXT.deactivated }],
    [
      { error: 'locked', minutes: '14' },
      { tone: 'bad', text: TEXT.locked(14) },
    ],
    [
      { error: 'locked', minutes: 'junk' },
      { tone: 'bad', text: TEXT.locked(15) },
    ],
    [{ reason: 'session_ended' }, { tone: 'info', text: TEXT.sessionEnded('Review') }],
    [{ reason: 'session_revoked' }, { tone: 'info', text: TEXT.sessionRevoked }],
    [{ reason: 'password_saved' }, { tone: 'ok', text: TEXT.passwordSaved }],
    [{ error: 'expired' }, { tone: 'info', text: TEXT.expired }],
    [{ error: 'Configuration' }, { tone: 'bad', text: TEXT.generic }],
    [{ error: 'CredentialsSignin' }, { tone: 'bad', text: TEXT.generic }],
  ]
  for (const [query, expected] of rows) {
    it(`${JSON.stringify(query)} → ${expected ? expected.tone : 'no banner'}`, () => {
      const notice = signInNotice(query, CTX)
      if (!expected) expect(notice).toBeNull()
      else expect(notice).toMatchObject(expected)
    })
  }

  it('words the lock as the board does, with a reset link', () => {
    expect(TEXT.locked(14)).toBe(
      'Too many attempts. Try again in 14 minutes, or reset your password.'
    )
    expect(TEXT.locked(1)).toBe('Too many attempts. Try again in 1 minute, or reset your password.')
    expect(signInNotice({ error: 'locked', minutes: '3' }, CTX)?.resetLink).toBe(true)
  })

  it('says where the session was going', () => {
    expect(TEXT.sessionEnded('Review')).toBe(
      'Your session ended after 8 hours. Sign in again to return to Review.'
    )
  })

  it('offers "Use another account" after every Google refusal and nothing else', () => {
    for (const e of ['personal_account', 'wrong_domain', 'not_invited', 'email_unverified']) {
      expect(isGoogleRefusal(e)).toBe(true)
    }
    for (const e of [undefined, 'locked', 'expired', 'Configuration']) {
      expect(isGoogleRefusal(e)).toBe(false)
    }
  })

  it('maps every password-step result; all failures but the lock read the same', () => {
    expect(passwordNotice(null)).toBeNull()
    expect(passwordNotice({ status: 'invalid' })).toEqual({ tone: 'bad', text: TEXT.invalid })
    expect(TEXT.invalid).toBe("That email and password don't match.")
    expect(passwordNotice({ status: 'locked', minutes: 15 })).toEqual({
      tone: 'bad',
      text: TEXT.locked(15),
      resetLink: true,
    })
    expect(passwordNotice({ status: 'rate_limited' })?.text).toBe(TEXT.rateLimited)
    expect(passwordNotice({ status: 'no_second_factor' })?.tone).toBe('warn')
  })

  it('forgot password always answers with the board sentence', () => {
    expect(TEXT.forgotSent).toBe(
      'If that account exists, a link is on its way. It works for 30 minutes.'
    )
  })

  it('never names a person or an address in a refusal', () => {
    for (const text of [TEXT.notInvited, TEXT.personalAccount, TEXT.deactivated]) {
      expect(text).not.toMatch(/@\w/)
    }
  })
})

describe('reset meter (guide only)', () => {
  it('fills more segments for longer, more varied passwords', () => {
    expect(roughStrength('')).toBe(0)
    expect(roughStrength('short')).toBe(1)
    expect(roughStrength('aaaaaaaaaaaaaaaa')).toBe(1)
    expect(roughStrength('twelve-chars')).toBe(2)
    expect(roughStrength('Harbour-Valve-91')).toBe(4)
  })
})
