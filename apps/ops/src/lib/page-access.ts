import { redirect } from 'next/navigation'
import { AccessError } from './access-core'

/**
 * The page half of the access check (apps/ops/CLAUDE.md §5.3). Every console page calls
 * `await requireOpsUser().catch(signInFor(path))` itself: a signed-out visitor goes to sign-in with the
 * path to come back to, and anything else (a refused role, a database error) propagates to the segment's
 * error boundary. The proxy has already bounced a request without a session; this covers a session whose
 * user was disabled or removed since.
 */
export function signInFor(path: string) {
  return (error: unknown): never => {
    if (error instanceof AccessError && error.code === 'unauthenticated')
      redirect(`/sign-in?next=${encodeURIComponent(path)}`)
    throw error
  }
}
