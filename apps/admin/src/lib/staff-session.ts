import type { Session } from 'next-auth'
import { redirect } from 'next/navigation'
import { auth } from './auth'
import { AuthorizationError, isStaffRole, type StaffRole } from './rbac'

/**
 * Staff session guards.
 *
 * Before this module every call site did its own `if (!session) redirect(...)`,
 * which checks only that *a* session exists. Once the storefront and admin
 * share an origin, "a session exists" is satisfied by any signed-in customer,
 * so existence is no longer an authorization signal. These helpers check what
 * actually matters: that the session was minted by the staff Auth.js instance
 * and carries a role that exists in the staff enum.
 *
 * A missing `kind` is rejected, never defaulted. Every token the current code
 * can decrypt was minted after the cookie rename, so `kind` is always present
 * on a legitimate session — treating its absence as "probably fine" would
 * re-admit exactly the token shape this design exists to exclude.
 */

export type StaffSession = Session & {
  user: { id: string; role: StaffRole; kind: 'staff' }
}

/** The single place `kind === 'staff'` is decided. Everything else calls this. */
export function isStaffSession(session: Session | null | undefined): session is StaffSession {
  const user = session?.user
  return (
    !!user &&
    typeof user.id === 'string' &&
    user.id.length > 0 &&
    user.kind === 'staff' &&
    isStaffRole(user.role)
  )
}

/** Throwing variant — for server actions and route handlers, which return typed errors. */
export function assertStaffSession(session: Session | null | undefined): StaffSession {
  if (!isStaffSession(session)) throw new AuthorizationError('Staff session required')
  return session
}

/** Redirecting variant — for pages and layouts. */
export async function requireStaff(): Promise<StaffSession> {
  const session = await auth()
  if (!isStaffSession(session)) redirect('/admin/sign-in')
  return session
}

/**
 * Redirect + role gate. Drop-in replacement for the `if (!session) redirect()`
 * pattern on pages that render privileged data.
 *
 * Sends an authenticated-but-unauthorized staff member to the dashboard rather
 * than to sign-in — they are signed in, so a sign-in prompt would be a dead end.
 */
export async function requireStaffRole(allowed: readonly StaffRole[]): Promise<StaffSession> {
  const session = await requireStaff()
  if (!allowed.includes(session.user.role)) redirect('/admin')
  return session
}
