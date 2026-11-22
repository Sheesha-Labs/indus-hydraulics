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
 * Capabilities only the Owner holds, whatever the Helper's toggles (board 84). S03-T04 adds the
 * one the settings service needs; S03-T03 brings the full board-84 table.
 */
export type OwnerCapability = 'change_settings'

export type Capability = HelperFlag | OwnerCapability

const OWNER_CAPABILITIES: ReadonlySet<Capability> = new Set<OwnerCapability>(['change_settings'])

/**
 * May this person do what a capability guards? The Owner always may; a Helper only with the
 * flag on, and never an Owner-only capability. `defineAction({ flags })` calls it; data mappers
 * use it for masking.
 */
export function can(user: Pick<OpsUser, 'role' | HelperFlag>, capability: Capability): boolean {
  if (user.role === 'owner') return true
  if (OWNER_CAPABILITIES.has(capability)) return false
  return user[capability as HelperFlag] === true
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
