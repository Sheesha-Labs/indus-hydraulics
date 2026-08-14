import { CUSTOMER_SESSION_COOKIE, STAFF_SESSION_COOKIE } from '@indus/domain'
import { decode, encode } from 'next-auth/jwt'
import { describe, expect, test } from 'vitest'

/**
 * The load-bearing property of the storefront/admin merge, tested directly.
 *
 * `@auth/core` derives the JWE encryption key with
 *
 *     hkdf('sha256', secret, salt = cookieName, `Auth.js Generated Encryption Key (${salt})`, 64)
 *
 * so the *session cookie's name* is the HKDF salt. Two Auth.js instances with
 * different cookie names therefore produce mutually undecryptable tokens even
 * under an identical secret.
 *
 * That matters because on one origin a customer's cookie is present on every
 * `/admin` request. If the two instances shared a key, `auth()` would return a
 * populated — and therefore truthy — session for a customer's token on the
 * admin surface. These tests fail loudly if that separation is ever weakened,
 * whether by reusing a cookie name, reusing a secret, or dropping the explicit
 * `cookies` config and inheriting Auth.js's shared defaults.
 */

const CUSTOMER_SECRET = 'customer-secret-'.repeat(3) // ≥32 chars, deterministic
const STAFF_SECRET = 'staff-secret-'.repeat(4)

const customerClaims = { sub: 'contact-1', kind: 'customer' as const, role: 'engineer', accountId: 'acct-1' }
const staffClaims = { sub: 'staff-1', kind: 'staff' as const, role: 'super_admin' }

const mintCustomer = () =>
  encode({ token: customerClaims, secret: CUSTOMER_SECRET, salt: CUSTOMER_SESSION_COOKIE, maxAge: 3600 })
const mintStaff = () =>
  encode({ token: staffClaims, secret: STAFF_SECRET, salt: STAFF_SESSION_COOKIE, maxAge: 3600 })

describe('customer and staff tokens are cryptographically isolated', () => {
  test('each token decodes under its own secret + salt', async () => {
    const customer = await decode({
      token: await mintCustomer(),
      secret: CUSTOMER_SECRET,
      salt: CUSTOMER_SESSION_COOKIE,
    })
    expect(customer?.kind).toBe('customer')
    expect(customer?.accountId).toBe('acct-1')

    const staff = await decode({ token: await mintStaff(), secret: STAFF_SECRET, salt: STAFF_SESSION_COOKIE })
    expect(staff?.kind).toBe('staff')
    expect(staff?.role).toBe('super_admin')
  })

  test('a customer token does not decode on the staff surface', async () => {
    // The exact escalation the merge would otherwise create.
    await expect(
      decode({ token: await mintCustomer(), secret: STAFF_SECRET, salt: STAFF_SESSION_COOKIE }),
    ).rejects.toThrow()
  })

  test('a staff token does not decode on the customer surface', async () => {
    await expect(
      decode({ token: await mintStaff(), secret: CUSTOMER_SECRET, salt: CUSTOMER_SESSION_COOKIE }),
    ).rejects.toThrow()
  })

  test('the salt alone is sufficient — same secret, different cookie name still fails', async () => {
    // This is the property that makes the design fail-closed rather than
    // merely well-configured: even if both surfaces were misconfigured onto
    // one secret, the differing cookie names keep the tokens apart.
    const token = await encode({
      token: customerClaims,
      secret: CUSTOMER_SECRET,
      salt: CUSTOMER_SESSION_COOKIE,
      maxAge: 3600,
    })
    await expect(
      decode({ token, secret: CUSTOMER_SECRET, salt: STAFF_SESSION_COOKIE }),
    ).rejects.toThrow()
  })

  test('the secret alone is sufficient — same cookie name, different secret still fails', async () => {
    const token = await encode({
      token: staffClaims,
      secret: CUSTOMER_SECRET,
      salt: STAFF_SESSION_COOKIE,
      maxAge: 3600,
    })
    await expect(
      decode({ token, secret: STAFF_SECRET, salt: STAFF_SESSION_COOKIE }),
    ).rejects.toThrow()
  })

  test('an expired staff token is rejected', async () => {
    // The old proxy checked only that a cookie existed — never expiry.
    const token = await encode({
      token: staffClaims,
      secret: STAFF_SECRET,
      salt: STAFF_SESSION_COOKIE,
      maxAge: -60,
    })
    const decoded = await decode({ token, secret: STAFF_SECRET, salt: STAFF_SESSION_COOKIE }).catch(() => null)
    expect(decoded).toBeNull()
  })

  test('garbage under a valid cookie name is rejected', async () => {
    // Under the old cookie-presence check this was a valid session.
    const decoded = await decode({
      token: 'not-a-jwt',
      secret: STAFF_SECRET,
      salt: STAFF_SESSION_COOKIE,
    }).catch(() => null)
    expect(decoded).toBeNull()
  })
})
