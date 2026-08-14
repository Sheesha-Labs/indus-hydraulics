import type { Session } from 'next-auth'
import { redirect } from 'next/navigation'
import { auth } from './auth'

/**
 * Customer session guards.
 *
 * The storefront has no RBAC — authorization is ownership-based, enforced by
 * scoping every query on `accountId`. That makes a *non-empty* `accountId` the
 * real signal, not the mere existence of a session. These helpers check it
 * once, in one place, so a call site cannot accidentally settle for `!!session`.
 *
 * `kind === 'customer'` is required for the same reason it is on the staff
 * side: once the two surfaces share an origin, "a session exists" stops being
 * evidence of *which* surface minted it.
 */

export type CustomerSession = Session & {
  user: { id: string; accountId: string; kind: 'customer' }
}

export function isCustomerSession(session: Session | null | undefined): session is CustomerSession {
  const user = session?.user
  return (
    !!user &&
    typeof user.id === 'string' &&
    user.id.length > 0 &&
    user.kind === 'customer' &&
    typeof user.accountId === 'string' &&
    user.accountId.length > 0
  )
}

/** Redirecting variant — for pages and layouts. Preserves the deep link via ?next=. */
export async function requireCustomer(nextPath?: string): Promise<CustomerSession> {
  const session = await auth()
  if (!isCustomerSession(session)) {
    redirect(nextPath ? `/sign-in?next=${encodeURIComponent(nextPath)}` : '/sign-in')
  }
  return session
}

/**
 * Replaces the old `safeAuth()`. Swallows JWT-decryption errors from a stale or
 * malformed cookie *and* enforces the session shape, so public surfaces get a
 * clean `null` instead of a half-valid session object.
 */
export async function customerSessionOrNull(): Promise<CustomerSession | null> {
  try {
    const session = await auth()
    return isCustomerSession(session) ? session : null
  } catch {
    return null
  }
}
