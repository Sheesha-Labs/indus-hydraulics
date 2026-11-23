import 'server-only'
import { after } from 'next/server'
import { cache } from 'react'
import { loadOpsAccessRow, touchSession } from '../server/auth/session-store'
import { makeRequireOpsUser, type OpsRole } from './access-core'
import { auth } from './auth'

export {
  AccessError,
  can,
  type Capability,
  type HelperFlag,
  type OpsRole,
  type OpsUser,
  type OwnerCapability,
} from './access-core'

/** One query (user + session) per request, however many components ask. */
const loadAccessRow = cache(loadOpsAccessRow)

function stampLastSeen(sid: string): void {
  const run = () =>
    touchSession(sid).catch((error: unknown) => {
      // A missed "last active" stamp is cosmetic; never fail the request over it.
      console.error('lastSeenAt update failed', error instanceof Error ? error.name : 'unknown')
    })
  try {
    // After the response: the page or action does not wait for the write.
    after(run)
  } catch {
    // Outside a request scope (scripts, tests).
    void run()
  }
}

/** Once per request, so a page with several guarded components stamps at most once. */
const stampOnce = cache(stampLastSeen)

export const requireOpsUser = makeRequireOpsUser({
  getSession: () => auth(),
  loadUser: (id, sid) => loadAccessRow(id, sid),
  touch: (sid) => stampOnce(sid),
})

/**
 * The session id of this request's sign-in (the JWT's `sid`), for "This device" and Sign out
 * everywhere. Call after requireOpsUser(), which has already checked the row.
 */
export async function currentSessionId(): Promise<string | null> {
  const session = await auth()
  return session?.sid || null
}

export const requireOwner = () => requireOpsUser(['owner'] satisfies OpsRole[])
