/**
 * The access check every page and action runs (ADR-05). Authorization never
 * lives in a layout: a layout does not re-run on every request.
 */
export type OpsRole = 'owner' | 'helper'

export type OpsUser = {
  id: string
  email: string
  name: string
  initials: string
  role: OpsRole
  canSeeMargins: boolean
  canSendSupplierMail: boolean
  canEditChaserRules: boolean
}

/** Helper toggles (P01 84). Read from the session's user row on the server, never from input. */
export type HelperFlag = 'canSeeMargins' | 'canSendSupplierMail' | 'canEditChaserRules'

/**
 * May this person do what a Helper flag guards? The Owner always may; a Helper only with the
 * flag on. `defineAction({ flags })` calls it; data mappers use it for masking.
 */
export function can(user: Pick<OpsUser, 'role' | HelperFlag>, flag: HelperFlag): boolean {
  return user.role === 'owner' || user[flag] === true
}

export class AccessError extends Error {
  constructor(readonly code: 'unauthenticated' | 'forbidden') {
    super(code === 'unauthenticated' ? 'Sign in required' : 'Not allowed')
    this.name = 'AccessError'
  }
}

type SessionLike = { user?: { id?: string } | undefined; sid?: string } | null
type UserRow = OpsUser & { status: string }

export function makeRequireOpsUser(deps: {
  getSession: () => Promise<SessionLike>
  loadUser: (id: string) => Promise<UserRow | null>
}) {
  return async function requireOpsUser(roles?: OpsRole[]): Promise<OpsUser> {
    const session = await deps.getSession()
    // The session callback only fills `user` for tokens of kind 'ops'.
    const id = session?.user?.id
    if (!id || !session?.sid) throw new AccessError('unauthenticated')
    const row = await deps.loadUser(id)
    if (!row || row.status !== 'active') throw new AccessError('unauthenticated')
    if (roles && !roles.includes(row.role)) throw new AccessError('forbidden')
    const { status: _status, ...user } = row
    return user
  }
}
