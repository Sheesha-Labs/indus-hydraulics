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

export const HELPER_FLAGS: readonly HelperFlag[] = [
  'canSeeMargins',
  'canSendSupplierMail',
  'canEditChaserRules',
]

/**
 * Board 84's capability map ("What each role can do"), the single source actions, pages and menus
 * read (S03-T03). The Owner holds every capability. A Helper's answer is one of:
 *   always    — "Yes"
 *   flag      — "Only if you allow it": the Helper's toggle decides
 *   never     — "Never"
 *   read_only — "No · read only" (they may look, never change)
 */
export type Capability =
  | 'see_costs'
  | 'see_margins'
  | 'send_supplier_mail'
  | 'edit_chaser_rules'
  | 'send_client_quotation'
  | 'approve_below_floor'
  | 'approve_supplier_payments'
  | 'change_settings'
  | 'manage_team'

export type HelperRule =
  | { kind: 'always' }
  | { kind: 'flag'; flag: HelperFlag }
  | { kind: 'never' }
  | { kind: 'read_only' }

export type CapabilityDef = {
  /** The row's words in "What each role can do". `{floor}` is filled by the page (pricing.defaults). */
  label: string
  /** The Permissions toggle's sub-text (flag capabilities only). */
  sub?: string
  helper: HelperRule
  /** Drawn as a row of the board-84 table (the board shows seven; the other two are enforced only). */
  inTable: boolean
}

/** In board order: the seven table rows first. */
export const CAPABILITIES: Readonly<Record<Capability, CapabilityDef>> = {
  see_costs: {
    label: 'See enquiries, supplier quotes and costs',
    helper: { kind: 'always' },
    inTable: true,
  },
  see_margins: {
    label: 'See margins and profit',
    sub: 'Margins, floors and profit on quotations, orders and reports.',
    helper: { kind: 'flag', flag: 'canSeeMargins' },
    inTable: true,
  },
  send_supplier_mail: {
    label: 'Send supplier RFQs and chasers',
    sub: 'From purchase@, after the usual checks. Client mail stays with the Owner.',
    helper: { kind: 'flag', flag: 'canSendSupplierMail' },
    inTable: true,
  },
  send_client_quotation: {
    label: 'Send client quotations',
    helper: { kind: 'never' },
    inTable: true,
  },
  approve_below_floor: {
    label: 'Approve below the {floor} floor',
    helper: { kind: 'never' },
    inTable: true,
  },
  approve_supplier_payments: {
    label: 'Approve supplier payments',
    helper: { kind: 'never' },
    inTable: true,
  },
  change_settings: {
    label: 'Change Autopilot and settings',
    helper: { kind: 'read_only' },
    inTable: true,
  },
  edit_chaser_rules: {
    label: 'Edit chaser rules',
    sub: 'When and how often supplier chasers go out.',
    helper: { kind: 'flag', flag: 'canEditChaserRules' },
    inTable: false,
  },
  manage_team: {
    label: 'Invite, remove and set permissions',
    helper: { kind: 'never' },
    inTable: false,
  },
}

export const CAPABILITY_KEYS = Object.keys(CAPABILITIES) as Capability[]

/** The capability each Helper toggle grants (defineAction's `flags` go through it). */
export const FLAG_CAPABILITY: Readonly<Record<HelperFlag, Capability>> = {
  canSeeMargins: 'see_margins',
  canSendSupplierMail: 'send_supplier_mail',
  canEditChaserRules: 'edit_chaser_rules',
}

/** Capabilities only the Owner holds, whatever the Helper's toggles ("Never", "No · read only"). */
export type OwnerCapability =
  | 'send_client_quotation'
  | 'approve_below_floor'
  | 'approve_supplier_payments'
  | 'change_settings'
  | 'manage_team'

export function isOwnerOnly(capability: Capability): capability is OwnerCapability {
  const kind = CAPABILITIES[capability].helper.kind
  return kind === 'never' || kind === 'read_only'
}

export const OWNER_CAPABILITIES: readonly OwnerCapability[] = CAPABILITY_KEYS.filter(isOwnerOnly)

function isFlag(value: Capability | HelperFlag): value is HelperFlag {
  return Object.hasOwn(FLAG_CAPABILITY, value)
}

/**
 * May this person do what a capability guards? The Owner always may; a Helper by the capability's
 * rule: yes, their toggle, or never. A Helper flag name is accepted as its capability.
 * `defineAction({ flags, capability })` calls it; data mappers use it for masking; pages use it to
 * draw or lock a control, never as the only check.
 */
export function can(
  user: Pick<OpsUser, 'role' | HelperFlag>,
  capability: Capability | HelperFlag
): boolean {
  if (user.role === 'owner') return true
  if (user.role !== 'helper') return false
  const rule = CAPABILITIES[isFlag(capability) ? FLAG_CAPABILITY[capability] : capability].helper
  switch (rule.kind) {
    case 'always':
      return true
    case 'flag':
      return user[rule.flag] === true
    case 'never':
    case 'read_only':
      return false
  }
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
