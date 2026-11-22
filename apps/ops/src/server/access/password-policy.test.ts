import { describe, expect, it } from 'vitest'
import {
  ARGON2_OPTIONS,
  dummyVerify,
  hashSecret,
  validateNewPassword,
  verifySecret,
} from './password-policy'

const STRONG = 'harbour-valve-copper-lantern-91'

describe('password hashing', () => {
  it('is Argon2id at 19 MiB, 2 passes, 1 lane', async () => {
    expect(ARGON2_OPTIONS).toMatchObject({ memoryCost: 19456, timeCost: 2, parallelism: 1 })
    const h = await hashSecret(STRONG)
    expect(h.startsWith('$argon2id$v=19$m=19456,t=2,p=1$')).toBe(true)
    expect(await verifySecret(h, STRONG)).toBe(true)
    expect(await verifySecret(h, `${STRONG}x`)).toBe(false)
  })

  it('treats a malformed stored hash as a mismatch, never a throw', async () => {
    expect(await verifySecret('not-a-hash', STRONG)).toBe(false)
  })

  it('runs a real verify for accounts that do not exist (timing path)', async () => {
    const started = performance.now()
    await dummyVerify('anything')
    await dummyVerify('anything else')
    // Two Argon2id verifies at 19 MiB take measurable time; a shortcut would take ~0 ms.
    expect(performance.now() - started).toBeGreaterThan(5)
  })
})

describe('validateNewPassword', () => {
  it('needs 12 or more characters', async () => {
    expect(await validateNewPassword('Short-1aB!', [])).toEqual({ ok: false, problem: 'too_short' })
  })

  it('needs a zxcvbn score of at least 3', async () => {
    expect(await validateNewPassword('password1234', [])).toEqual({
      ok: false,
      problem: 'too_weak',
    })
    expect(await validateNewPassword('aaaaaaaaaaaaaaaa', [])).toEqual({
      ok: false,
      problem: 'too_weak',
    })
  })

  it('counts the person’s own email and name as guessable', async () => {
    // Strong enough for a stranger (score 3), guessable for someone who knows the account.
    expect(await validateNewPassword('ownerexample', [])).toEqual({ ok: true })
    const result = await validateNewPassword(
      'ownerexample',
      [],
      ['owner.example@example.test', 'Owner Example']
    )
    expect(result).toEqual({ ok: false, problem: 'too_weak' })
  })

  it('refuses any of the last five passwords and accepts a sixth-oldest', async () => {
    const old = await Promise.all(
      ['one', 'two', 'three', 'four', 'five', 'six'].map((w) => hashSecret(`${STRONG}-${w}`))
    )
    expect(await validateNewPassword(`${STRONG}-one`, old)).toEqual({
      ok: false,
      problem: 'reused',
    })
    expect(await validateNewPassword(`${STRONG}-five`, old)).toEqual({
      ok: false,
      problem: 'reused',
    })
    expect(await validateNewPassword(`${STRONG}-six`, old)).toEqual({ ok: true })
    expect(await validateNewPassword(STRONG, old)).toEqual({ ok: true })
  })
})
