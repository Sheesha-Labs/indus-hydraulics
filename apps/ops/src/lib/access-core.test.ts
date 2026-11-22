import { describe, expect, it } from 'vitest'
import { AccessError, can, makeRequireOpsUser, type OpsUser } from './access-core'

const OWNER: OpsUser & { status: string } = {
  id: 'u1',
  email: 'owner@example.test',
  name: 'Owner',
  initials: 'OW',
  role: 'owner',
  status: 'active',
  canSeeMargins: true,
  canSendSupplierMail: true,
  canEditChaserRules: true,
}

function guard(session: unknown, row: (OpsUser & { status: string }) | null) {
  return makeRequireOpsUser({
    getSession: async () => session as never,
    loadUser: async () => row,
  })
}

async function code(p: Promise<unknown>) {
  try {
    await p
    return 'ok'
  } catch (e) {
    expect(e).toBeInstanceOf(AccessError)
    return (e as AccessError).code
  }
}

describe('requireOpsUser', () => {
  it('returns the user for an active session, without the status column', async () => {
    const user = await guard({ user: { id: 'u1' }, sid: 's1' }, OWNER)()
    expect(user.id).toBe('u1')
    expect(user).not.toHaveProperty('status')
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

  it('checks roles server-side', async () => {
    const helper = { ...OWNER, role: 'helper' as const }
    expect(await code(guard({ user: { id: 'u1' }, sid: 's' }, helper)(['owner']))).toBe('forbidden')
    expect(await code(guard({ user: { id: 'u1' }, sid: 's' }, helper)(['owner', 'helper']))).toBe(
      'ok'
    )
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
