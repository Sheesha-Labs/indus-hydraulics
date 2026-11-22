import 'server-only'
import { cache } from 'react'
import { loadOpsUserRow } from '../server/auth/session-store'
import { makeRequireOpsUser, type OpsRole } from './access-core'
import { auth } from './auth'

export { AccessError, can, type HelperFlag, type OpsRole, type OpsUser } from './access-core'

/** One user query per request, however many components ask. */
const loadUser = cache(loadOpsUserRow)

export const requireOpsUser = makeRequireOpsUser({
  getSession: () => auth(),
  loadUser: (id) => loadUser(id),
})

export const requireOwner = () => requireOpsUser(['owner'] satisfies OpsRole[])
