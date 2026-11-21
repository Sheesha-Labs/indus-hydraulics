import { describe, expect, it } from 'vitest'
import { checkGoogleProfile } from './google-profile'

const DOMAIN = 'example.test'

describe('checkGoogleProfile', () => {
  it.each([
    [{ email: 'owner@example.test', email_verified: true, hd: 'example.test' }, { ok: true }],
    [{ email: 'Owner@Example.test', email_verified: true, hd: 'EXAMPLE.TEST' }, { ok: true }],
    [
      { email: 'someone@gmail.com', email_verified: true },
      { ok: false, reason: 'personal_account' },
    ],
    [
      { email: 'someone@gmail.com', email_verified: true, hd: null },
      { ok: false, reason: 'personal_account' },
    ],
    [
      { email: 'a@example.test.evil', email_verified: true, hd: 'example.test.evil' },
      { ok: false, reason: 'wrong_domain' },
    ],
    [
      { email: 'a@examp1e.test', email_verified: true, hd: 'examp1e.test' },
      { ok: false, reason: 'wrong_domain' },
    ],
    [
      { email: 'a@other.test', email_verified: true, hd: 'example.test' },
      { ok: false, reason: 'wrong_domain' },
    ],
    [
      { email: 'owner@example.test', email_verified: false, hd: 'example.test' },
      { ok: false, reason: 'email_unverified' },
    ],
    [
      { email: 'owner@example.test', hd: 'example.test' },
      { ok: false, reason: 'email_unverified' },
    ],
  ])('%o → %o', (profile, expected) => {
    expect(checkGoogleProfile(profile, DOMAIN)).toMatchObject(expected)
  })

  it('returns the email lower-cased', () => {
    expect(
      checkGoogleProfile(
        { email: 'Owner@Example.test', email_verified: true, hd: 'example.test' },
        DOMAIN
      )
    ).toEqual({
      ok: true,
      email: 'owner@example.test',
    })
  })
})
