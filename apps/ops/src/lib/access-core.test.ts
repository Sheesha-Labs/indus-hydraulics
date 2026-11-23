import { describe, expect, it } from 'vitest'
import {
  AccessError,
  TOUCH_EVERY_MS,
  can,
  makeRequireOpsUser,
  sessionRefusal,
  type AccessRow,
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
