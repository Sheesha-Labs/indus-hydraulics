import type { Route } from 'next'
import { redirect } from 'next/navigation'
import { AccessError } from './access-core'

/**
 * The page half of the access check (apps/ops/CLAUDE.md §5.3). Every console page calls
 * `await requireOpsUser().catch(signInFor(path))` itself: a signed-out visitor goes to sign-in with the
 * path to come back to, and anything else (a refused role, a database error) propagates to the segment's
 * error boundary. The proxy has already bounced a request without a session; this covers a session whose
 * user was disabled or removed since, and (S03-T02) a session signed out from Devices before the proxy's
 * cache noticed: "You were signed out from another device", or "Your session ended" for an expired row.
 */
export function signInFor(path: string) {
  return (error: unknown): never => {
    if (error instanceof AccessError) {
      if (error.code === 'unauthenticated') redirect(`/sign-in?next=${encodeURIComponent(path)}`)
      if (error.code === 'session_revoked') redirect(sessionEndedUrl(error, path))
    }
    throw error
  }
}

/** Where a refused session row sends the person (the sign-in page's notice reads `reason`). */
export function sessionEndedUrl(error: AccessError, path: string): Route {
  const next = encodeURIComponent(path)
  return (
    error.session === 'expired'
      ? `/sign-in?reason=session_ended&next=${next}`
      : `/sign-in?reason=session_revoked&next=${next}`
  ) as Route
}
