import { describe, expect, it } from 'vitest'
import {
  AccessError,
  CAPABILITIES,
  CAPABILITY_KEYS,
  FLAG_CAPABILITY,
  HELPER_FLAGS,
  OWNER_CAPABILITIES,
  TOUCH_EVERY_MS,
  can,
  isOwnerOnly,
  makeRequireOpsUser,
  sessionRefusal,
  type AccessRow,
  type Capability,
  type HelperFlag,
} from './access-core'

const NOW = new Date('2026-11-23T08:00:00Z')
const LIVE = {
  revokedAt: null,
  expires: new Date(NOW.getTime() + 3600_000),
  lastSeenAt: new Date(NOW.getTime() - 60_000),
}

const OWNER: AccessRow = {
  id: 'u1',
  email: 'owner@example.test',
  name: 'Owner',
  initials: 'OW',
  role: 'owner',
  status: 'active',
  canSeeMargins: true,
  canSendSupplierMail: true,
  canEditChaserRules: true,
  session: LIVE,
}

type Spy = { loads: Array<[string, string]>; touched: string[] }

function guard(session: unknown, row: AccessRow | null, spy?: Spy) {
  const seen: Spy = spy ?? { loads: [], touched: [] }
  return makeRequireOpsUser({
    getSession: async () => session as never,
    loadUser: async (id, sid) => {
      seen.loads.push([id, sid])
      return row
    },
    touch: (sid) => seen.touched.push(sid),
    now: () => NOW,
  })
}

async function code(p: Promise<unknown>) {
  try {
    await p
    return 'ok'
  } catch (e) {
    expect(e).toBeInstanceOf(AccessError)
    const err = e as AccessError
    return err.session ? `${err.code}:${err.session}` : err.code
  }
}

describe('requireOpsUser', () => {
  it('returns the user for an active session, without the status or session columns', async () => {
    const user = await guard({ user: { id: 'u1' }, sid: 's1' }, OWNER)()
    expect(user.id).toBe('u1')
    expect(user).not.toHaveProperty('status')
    expect(user).not.toHaveProperty('session')
  })

  it('loads the user and the session together: one loader call, keyed by user id and sid', async () => {
    const spy: Spy = { loads: [], touched: [] }
    await guard({ user: { id: 'u1' }, sid: 's1' }, OWNER, spy)()
    expect(spy.loads).toEqual([['u1', 's1']])
  })

  it('rejects no session, a session without user (non-ops token) or without sid', async () => {
    expect(await code(guard(null, OWNER)())).toBe('unauthenticated')
    expect(await code(guard({ sid: 's1' }, OWNER)())).toBe('unauthenticated')
    expect(await code(guard({ user: { id: 'u1' } }, OWNER)())).toBe('unauthenticated')
  })

  it('rejects a user who is missing or no longer active', async () => {
    expect(await code(guard({ user: { id: 'u1' }, sid: 's' }, null)())).toBe('unauthenticated')
    expect(
      await code(guard({ user: { id: 'u1' }, sid: 's' }, { ...OWNER, status: 'suspended' })())
    ).toBe('unauthenticated')
  })

  it('refuses at once a session row that is revoked, expired or missing', async () => {
    const s = { user: { id: 'u1' }, sid: 's1' }
    expect(await code(guard(s, { ...OWNER, session: { ...LIVE, revokedAt: NOW } })())).toBe(
      'session_revoked:revoked'
    )
    expect(await code(guard(s, { ...OWNER, session: { ...LIVE, expires: NOW } })())).toBe(
      'session_revoked:expired'
    )
    expect(await code(guard(s, { ...OWNER, session: null })())).toBe('session_revoked:missing')
  })

  it('stamps lastSeenAt only when it is at least 5 minutes old', async () => {
    const s = { user: { id: 'u1' }, sid: 's1' }
    const fresh: Spy = { loads: [], touched: [] }
    await guard(s, OWNER, fresh)()
    expect(fresh.touched).toEqual([])
    const stale: Spy = { loads: [], touched: [] }
    const old = new Date(NOW.getTime() - TOUCH_EVERY_MS)
    await guard(s, { ...OWNER, session: { ...LIVE, lastSeenAt: old } }, stale)()
    expect(stale.touched).toEqual(['s1'])
  })

  it('checks roles server-side', async () => {
    const helper = { ...OWNER, role: 'helper' as const }
    expect(await code(guard({ user: { id: 'u1' }, sid: 's' }, helper)(['owner']))).toBe('forbidden')
    expect(await code(guard({ user: { id: 'u1' }, sid: 's' }, helper)(['owner', 'helper']))).toBe(
      'ok'
    )
  })

  it('sessionRefusal reads the row as the guard does', () => {
    expect(sessionRefusal(LIVE, NOW)).toBeNull()
    expect(sessionRefusal(null, NOW)).toBe('missing')
  })
})

describe('can', () => {
  const helper = {
    ...OWNER,
    role: 'helper' as const,
    canSeeMargins: false,
    canEditChaserRules: false,
  }

  it('lets the Owner do everything a flag guards, whatever the flag columns say', () => {
    expect(
      can({ ...helper, role: 'owner', canSendSupplierMail: false }, 'canSendSupplierMail')
    ).toBe(true)
  })

  it('lets a Helper do only what their flags allow', () => {
    expect(can(helper, 'canSendSupplierMail')).toBe(true)
    expect(can(helper, 'canSeeMargins')).toBe(false)
    expect(can(helper, 'canEditChaserRules')).toBe(false)
  })

  it('keeps change_settings for the Owner, even for a Helper with every flag on', () => {
    expect(can(OWNER, 'change_settings')).toBe(true)
    const allFlags = { ...OWNER, role: 'helper' as const }
    expect(can(allFlags, 'change_settings')).toBe(false)
  })
})

describe('can · the board-84 capability table, every (role, flags, capability)', () => {
  /** Board 84's "What each role can do", as expected answers: owner, then helper by flag state. */
  const EXPECTED: Record<Capability, 'yes' | HelperFlag | 'never'> = {
    see_costs: 'yes',
    see_margins: 'canSeeMargins',
    send_supplier_mail: 'canSendSupplierMail',
    edit_chaser_rules: 'canEditChaserRules',
    send_client_quotation: 'never',
    approve_below_floor: 'never',
    approve_supplier_payments: 'never',
    change_settings: 'never',
    manage_team: 'never',
  }

  // All 8 combinations of the three Helper flags.
  const FLAG_SETS = Array.from({ length: 8 }, (_, n) => ({
    canSeeMargins: (n & 1) === 1,
    canSendSupplierMail: (n & 2) === 2,
    canEditChaserRules: (n & 4) === 4,
  }))

  it('covers exactly the nine capabilities of the map', () => {
    expect(new Set(CAPABILITY_KEYS)).toEqual(new Set(Object.keys(EXPECTED)))
    expect(OWNER_CAPABILITIES).toEqual([
      'send_client_quotation',
      'approve_below_floor',
      'approve_supplier_payments',
      'change_settings',
      'manage_team',
    ])
  })

  const cases = CAPABILITY_KEYS.flatMap((capability) =>
    FLAG_SETS.flatMap((flags) =>
      (['owner', 'helper'] as const).map((role) => ({ capability, flags, role }))
    )
  )

  it.each(cases)('$role $flags → $capability', ({ capability, flags, role }) => {
    const rule = EXPECTED[capability]
    const want =
      role === 'owner' || rule === 'yes' ? true : rule === 'never' ? false : flags[rule] === true
    expect(can({ role, ...flags }, capability)).toBe(want)
  })

  it('accepts a Helper flag name as its capability', () => {
    for (const flags of FLAG_SETS) {
      for (const flag of HELPER_FLAGS) {
        expect(can({ role: 'helper', ...flags }, flag)).toBe(
          can({ role: 'helper', ...flags }, FLAG_CAPABILITY[flag])
        )
      }
    }
  })

  it('refuses an unknown role, whatever the flags', () => {
    const odd = { role: 'auditor' as unknown as 'helper', ...FLAG_SETS[7]! }
    for (const capability of CAPABILITY_KEYS) expect(can(odd, capability)).toBe(false)
  })

  it('draws the seven board rows in order', () => {
    expect(CAPABILITY_KEYS.filter((c) => CAPABILITIES[c].inTable)).toEqual([
      'see_costs',
      'see_margins',
      'send_supplier_mail',
      'send_client_quotation',
      'approve_below_floor',
      'approve_supplier_payments',
      'change_settings',
    ])
    for (const c of CAPABILITY_KEYS) expect(isOwnerOnly(c)).toBe(EXPECTED[c] === 'never')
  })
})
