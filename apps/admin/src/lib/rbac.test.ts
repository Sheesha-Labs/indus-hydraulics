import type { Session } from 'next-auth'
import { describe, expect, test } from 'vitest'
import { AuthorizationError, ForbiddenError, ROLES, hasRole, isStaffRole, requireRole } from './rbac'

function session(user: Record<string, unknown>): Session {
  return { user, expires: '2099-01-01T00:00:00.000Z' } as unknown as Session
}

const staff = (role: string) => session({ id: 's1', kind: 'staff', role, accountId: '' })
const customer = (role: string) => session({ id: 'c1', kind: 'customer', role, accountId: 'a1' })

describe('requireRole / hasRole reject non-staff principals', () => {
  test('a staff session with the right role passes', () => {
    expect(() => requireRole(staff('super_admin'), ROLES.USERS_WRITE)).not.toThrow()
    expect(hasRole(staff('manager'), ROLES.CATALOGUE_WRITE)).toBe(true)
  })

  test('a staff session with the wrong role is Forbidden, not Unauthorized', () => {
    // The distinction matters: result.ts maps these to different client codes.
    expect(() => requireRole(staff('warehouse'), ROLES.USERS_WRITE)).toThrow(ForbiddenError)
    expect(hasRole(staff('warehouse'), ROLES.USERS_WRITE)).toBe(false)
  })

  test('a customer whose ContactRole collides with a StaffRole is rejected', () => {
    // `engineer` is the one literal shared by ContactRole and StaffRole, and it
    // appears in RFQ_REVIEW, SEO_READ and ANY_STAFF. Before the `kind` check a
    // customer contact with this role satisfied all three.
    expect(() => requireRole(customer('engineer'), ROLES.RFQ_REVIEW)).toThrow(AuthorizationError)
    expect(hasRole(customer('engineer'), ROLES.SEO_READ)).toBe(false)
    expect(hasRole(customer('engineer'), ROLES.ANY_STAFF)).toBe(false)
  })

  test("a customer with ContactRole 'admin' is rejected", () => {
    // `admin` exists in ContactRole but not StaffRole, so isStaffRole also catches it.
    expect(() => requireRole(customer('admin'), ROLES.ANY_STAFF)).toThrow(AuthorizationError)
    expect(hasRole(customer('admin'), ROLES.ANY_STAFF)).toBe(false)
  })

  test('a token with no kind claim is rejected, not defaulted', () => {
    const legacy = session({ id: 's1', role: 'super_admin' })
    expect(() => requireRole(legacy, ROLES.ANY_STAFF)).toThrow(AuthorizationError)
    expect(hasRole(legacy, ROLES.ANY_STAFF)).toBe(false)
  })

  test('null and empty sessions are rejected', () => {
    expect(() => requireRole(null, ROLES.ANY_STAFF)).toThrow(AuthorizationError)
    expect(hasRole(null, ROLES.ANY_STAFF)).toBe(false)
    expect(() => requireRole(session({}), ROLES.ANY_STAFF)).toThrow(AuthorizationError)
  })

  test('a staff session with an unknown role string is rejected', () => {
    expect(() => requireRole(staff('root'), ROLES.ANY_STAFF)).toThrow(AuthorizationError)
    expect(hasRole(staff(''), ROLES.ANY_STAFF)).toBe(false)
  })
})

describe('isStaffRole', () => {
  test('accepts every role in ANY_STAFF', () => {
    for (const role of ROLES.ANY_STAFF) expect(isStaffRole(role)).toBe(true)
  })

  test('rejects ContactRole-only values and non-strings', () => {
    for (const role of ['procurement', 'ap', 'approver', 'admin']) expect(isStaffRole(role)).toBe(false)
    for (const value of [null, undefined, 42, {}, []]) expect(isStaffRole(value)).toBe(false)
  })
})

describe('ROLES groups stay within the staff enum', () => {
  test('every listed role is a real StaffRole', () => {
    for (const [group, roles] of Object.entries(ROLES)) {
      for (const role of roles) {
        expect(isStaffRole(role), `${group} contains "${role}"`).toBe(true)
      }
    }
  })
})
