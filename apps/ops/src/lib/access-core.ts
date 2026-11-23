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

export type AccessErrorCode = 'unauthenticated' | 'forbidden' | 'session_revoked'

/** Why a session row was refused: signed out elsewhere, past its 8 hours, or not there at all. */
export type SessionRefusal = 'revoked' | 'expired' | 'missing'

export class AccessError extends Error {
  constructor(
    readonly code: AccessErrorCode,
    /** Set with code 'session_revoked'. */
    readonly session?: SessionRefusal
  ) {
    super(
      code === 'forbidden'
        ? 'Not allowed'
        : code === 'session_revoked'
          ? 'Session ended'
          : 'Sign in required'
    )
    this.name = 'AccessError'
  }
}

type SessionLike = { user?: { id?: string } | undefined; sid?: string } | null

/** The session columns the guard reads (ops.user_session, C42). */
export type SessionRow = { revokedAt: Date | null; expires: Date; lastSeenAt: Date }

/** The user row and the token's session row, loaded together (one query, session-store.ts). */
export type AccessRow = OpsUser & { status: string; session: SessionRow | null }

/** "Last active" is written at most this often (the Devices list reads it). */
export const TOUCH_EVERY_MS = 5 * 60_000

/** Is this session row usable now? Null when it is; otherwise why not. */
export function sessionRefusal(session: SessionRow | null, now: Date): SessionRefusal | null {
  if (!session) return 'missing'
  if (session.revokedAt) return 'revoked'
  if (session.expires.getTime() <= now.getTime()) return 'expired'
  return null
}

/**
 * requireOpsUser's factory. Every call loads the user AND the session row named by the token's `sid` in
 * one query, and refuses at once (AccessError 'session_revoked') a session that is missing, revoked or
 * expired: the proxy's 60 s cache is for page loads, this is the check that counts (C42). `touch` stamps
 * lastSeenAt when the row is more than 5 minutes stale; it must not throw (the caller schedules it).
 */
export function makeRequireOpsUser(deps: {
  getSession: () => Promise<SessionLike>
  loadUser: (id: string, sid: string) => Promise<AccessRow | null>
  touch?: (sid: string) => void
  now?: () => Date
}) {
  return async function requireOpsUser(roles?: OpsRole[]): Promise<OpsUser> {
    const session = await deps.getSession()
    // The session callback only fills `user` for tokens of kind 'ops'.
    const id = session?.user?.id
    const sid = session?.sid
    if (!id || !sid) throw new AccessError('unauthenticated')
    const row = await deps.loadUser(id, sid)
    if (!row || row.status !== 'active') throw new AccessError('unauthenticated')
    const now = deps.now?.() ?? new Date()
    const refusal = sessionRefusal(row.session, now)
    if (refusal) throw new AccessError('session_revoked', refusal)
    if (deps.touch && now.getTime() - row.session!.lastSeenAt.getTime() >= TOUCH_EVERY_MS) {
      deps.touch(sid)
    }
    if (roles && !roles.includes(row.role)) throw new AccessError('forbidden')
    const { status: _status, session: _session, ...user } = row
    return user
  }
}
