import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Sessions and devices (S03-T02) against the real local Postgres (role ops_app): what a sign-in writes,
 * the new-device notice, the one-query access check refusing a revoked session at once (pages and server
 * actions, through the REAL requireOpsUser with only `auth()` stubbed), Sign out / Sign out everywhere,
 * who may end whose session, the lastSeenAt stamp, and the proxy cache's query.
 *
 *   DATABASE_URL="postgresql://ops_app:ops_app_local@localhost:54329/<db>?schema=ops" \
 *     bun run --filter @indus/ops test -- sessions.db
 *
 * Skipped when DATABASE_URL is unset, and refused for any host but localhost: it writes rows. Users are
 * new per run (`t02-<run>-…@example.test`) and stay, because auth_event is append-only.
 */
function localDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL
  if (!raw) return undefined
  try {
    const host = new URL(raw).hostname
    return ['localhost', '127.0.0.1', '[::1]'].includes(host) ? raw : undefined
  } catch {
    return undefined
  }
}

const DB_URL = localDatabaseUrl()

const h = vi.hoisted(() => ({
  session: null as null | { user: { id: string }; sid: string },
}))

vi.mock('@sentry/nextjs', () => ({
  withScope: (fn: (scope: { setTag: () => void }) => void) => fn({ setTag: () => undefined }),
  captureException: () => undefined,
}))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: () => undefined,
  revalidatePath: () => undefined,
}))
vi.mock('../../lib/env', () => ({
  env: () => ({
    APP_ENV: 'test',
    OPS_READ_ONLY: undefined,
    NEXT_PUBLIC_OPS_BASE_URL: 'http://localhost:3132',
    OPS_TEST_RECIPIENTS: '',
    OPS_SESSION_REVOCATION_TTL_MS: 100,
  }),
}))
// Only the JWT read is stubbed: requireOpsUser, its loader and defineAction are the real ones.
vi.mock('../../lib/auth', () => ({ auth: async () => h.session }))

const UA_MAC =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
const UA_IPAD =
  'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'

describe.skipIf(!DB_URL)('sessions and devices · local database', () => {
  process.env.DATABASE_CONNECTION_LIMIT = '3'
  const run = crypto.randomUUID().slice(0, 8)

  let db: typeof import('@indus/ops-db').opsDb
  let store: typeof import('../auth/session-store')
  let devices: typeof import('./devices')
  let sessions: typeof import('./sessions')
  let access: typeof import('../../lib/access')
  let revocation: typeof import('../../lib/session-revocation')
  let actions: typeof import('../../app/(console)/settings/team/actions/sessions')
  let ownerId: string

  async function makeUser(tag: string) {
    return db.user.create({
      data: {
        email: `t02-${run}-${tag}@example.test`,
        name: 'Helper Example',
        initials: 'HE',
        role: 'helper',
        status: 'active',
      },
      select: { id: true, email: true },
    })
  }

  async function signIn(userId: string, ua = UA_MAC, city: string | null = 'Dubai') {
    return store.recordSignIn({
      userId,
      method: 'google',
      userAgent: ua,
      ip: '127.0.0.1',
      location: { city, country: city ? 'AE' : null },
    })
  }

  const as = (userId: string, sid: string) => {
    h.session = { user: { id: userId }, sid }
  }

  beforeAll(async () => {
    ;({ opsDb: db } = await import('@indus/ops-db'))
    store = await import('../auth/session-store')
    devices = await import('./devices')
    sessions = await import('./sessions')
    access = await import('../../lib/access')
    revocation = await import('../../lib/session-revocation')
    actions = await import('../../app/(console)/settings/team/actions/sessions')
    const owner = await db.user.findFirst({
      where: { role: 'owner', status: 'active' },
      select: { id: true },
    })
    if (!owner) throw new Error('seed an active owner first (SEED_DEMO=1 db:seed)')
    ownerId = owner.id
  })

  beforeEach(() => {
    h.session = null
  })

  it('a sign-in records the device label, keyed hash, city and country, and its auth_event', async () => {
    const user = await makeUser('record')
    const rec = await signIn(user.id, UA_IPAD, 'Sharjah')
    const row = await db.userSession.findUniqueOrThrow({ where: { id: rec.sid } })
    expect(row.deviceLabel).toBe('Safari on iPad')
    expect(row.deviceHash).toMatch(/^[0-9a-f]{64}$/)
    expect(row).toMatchObject({ city: 'Sharjah', country: 'AE', userAgent: UA_IPAD })
    const event = await db.authEvent.findFirstOrThrow({
      where: { userId: user.id, kind: 'sign_in' },
      orderBy: { at: 'desc' },
    })
    expect(event).toMatchObject({ city: 'Sharjah', country: 'AE', method: 'google' })
  })

  it('sends the new-device notice only for a device hash not seen in 90 days', async () => {
    const user = await makeUser('notice')
    const notice = (rec: Awaited<ReturnType<typeof signIn>>) =>
      devices.noticeIfNewDevice({
        userId: user.id,
        sessionId: rec.sid,
        deviceHash: rec.deviceHash,
        deviceLabel: rec.deviceLabel,
        city: rec.city,
        at: rec.at,
      })
    const first = await signIn(user.id, UA_MAC)
    expect(await notice(first)).toBe('sent')
    const again = await signIn(user.id, UA_MAC)
    expect(await notice(again)).toBe('known')
    const ipad = await signIn(user.id, UA_IPAD)
    expect(await notice(ipad)).toBe('sent')
    // A session older than 90 days does not make a device known.
    const old = await signIn(user.id, UA_MAC)
    await db.userSession.update({
      where: { id: old.sid },
      data: { createdAt: new Date(Date.now() - 91 * 86_400_000) },
    })
    await db.userSession.updateMany({
      where: { id: { in: [first.sid, again.sid] } },
      data: { createdAt: new Date(Date.now() - 91 * 86_400_000) },
    })
    const back = await signIn(user.id, UA_MAC)
    expect(await notice(back)).toBe('sent')

    const mails = await db.outboundEmail.findMany({
      where: { toAddresses: { has: user.email }, kind: 'auth_security_notice' },
      select: { subject: true, bodyText: true, status: true },
    })
    expect(mails).toHaveLength(3)
    expect(mails.every((m) => m.status === 'suppressed_preview')).toBe(true)
    expect(mails[0]!.bodyText).toContain('New sign-in to Indus Operations: Chrome on macOS, Dubai,')
  })

  it('signing in again in the same browser ends the session that browser held', async () => {
    const user = await makeUser('again')
    const first = await signIn(user.id)
    const second = await store.recordSignIn({
      userId: user.id,
      method: 'password',
      userAgent: UA_MAC,
      ip: '127.0.0.1',
      previousSid: first.sid,
    })
    const old = await db.userSession.findUniqueOrThrow({ where: { id: first.sid } })
    expect(old.revokedAt).not.toBeNull()
    expect(old.revokeReason).toBe('signed_in_again')
    const live = await sessions.listSessions(user.id, second.sid)
    expect(live.map((s) => s.id)).toEqual([second.sid])
  })

  it('requireOpsUser refuses a revoked session at once, and so does a server action', async () => {
    const user = await makeUser('revoked')
    const mine = await signIn(user.id)
    const other = await signIn(user.id, UA_IPAD)
    as(user.id, other.sid)
    expect((await access.requireOpsUser()).id).toBe(user.id)

    // From the first device: Devices › Sign out the iPad.
    as(user.id, mine.sid)
    const out = await actions.signOutDeviceAction({ sessionId: other.sid })
    expect(out).toEqual({ success: true, data: { outcome: 'revoked' } })

    // The iPad's very next request is refused, with no cache in between.
    as(user.id, other.sid)
    const refused = await access.requireOpsUser().catch((e: unknown) => e)
    expect(refused).toMatchObject({ code: 'session_revoked', session: 'revoked' })
    const action = await actions.signOutEverywhereAction({})
    expect(action).toEqual({
      success: false,
      error: 'You were signed out from another device. Sign in again.',
    })
    const row = await db.userSession.findUniqueOrThrow({ where: { id: other.sid } })
    expect(row).toMatchObject({ revokedById: user.id, revokeReason: 'signed_out_from_devices' })
  })

  it('refuses an expired session row and one that belongs to someone else', async () => {
    const a = await makeUser('expired-a')
    const b = await makeUser('expired-b')
    const recA = await signIn(a.id)
    await db.userSession.update({ where: { id: recA.sid }, data: { expires: new Date() } })
    as(a.id, recA.sid)
    expect(await access.requireOpsUser().catch((e: unknown) => e)).toMatchObject({
      code: 'session_revoked',
      session: 'expired',
    })
    const recB = await signIn(b.id)
    as(a.id, recB.sid)
    expect(await access.requireOpsUser().catch((e: unknown) => e)).toMatchObject({
      code: 'session_revoked',
      session: 'missing',
    })
  })

  it('Sign out everywhere ends every other session and keeps the current one', async () => {
    const user = await makeUser('everywhere')
    const here = await signIn(user.id)
    await signIn(user.id, UA_IPAD)
    await signIn(user.id, UA_IPAD, null)
    as(user.id, here.sid)
    expect(await actions.signOutEverywhereAction({})).toEqual({
      success: true,
      data: { ended: 2 },
    })
    const live = await sessions.listSessions(user.id, here.sid)
    expect(live).toHaveLength(1)
    expect(live[0]).toMatchObject({ id: here.sid, current: true })
    expect((await access.requireOpsUser()).id).toBe(user.id)
    const events = await db.authEvent.count({ where: { userId: user.id, kind: 'session_revoked' } })
    expect(events).toBe(2)
  })

  it('refuses to sign out the current device from Devices', async () => {
    const user = await makeUser('self')
    const here = await signIn(user.id)
    as(user.id, here.sid)
    const result = await actions.signOutDeviceAction({ sessionId: here.sid })
    expect(result.success).toBe(false)
    expect((await access.requireOpsUser()).id).toBe(user.id)
  })

  it('a Helper may end only their own sessions; the Owner anyone’s', async () => {
    const helper = await makeUser('helper')
    const otherHelper = await makeUser('other')
    const target = await signIn(otherHelper.id)
    const helperSession = await signIn(helper.id)
    as(helper.id, helperSession.sid)
    const refused = await actions.signOutDeviceAction({ sessionId: target.sid })
    expect(refused).toEqual({ success: false, error: "You don't have access to do that." })
    expect(
      (await db.userSession.findUniqueOrThrow({ where: { id: target.sid } })).revokedAt
    ).toBeNull()

    const outcome = await db.$transaction((tx) =>
      sessions.revokeSession(tx, { sessionId: target.sid, actor: { id: ownerId, role: 'owner' } })
    )
    expect(outcome).toBe('revoked')
    const row = await db.userSession.findUniqueOrThrow({ where: { id: target.sid } })
    expect(row).toMatchObject({ revokedById: ownerId, revokeReason: 'signed_out_by_owner' })
  })

  it('stamps lastSeenAt at most once per 5 minutes', async () => {
    const user = await makeUser('touch')
    const rec = await signIn(user.id)
    const stale = new Date(Date.now() - 6 * 60_000)
    await db.userSession.update({ where: { id: rec.sid }, data: { lastSeenAt: stale } })
    await store.touchSession(rec.sid)
    const first = (await db.userSession.findUniqueOrThrow({ where: { id: rec.sid } })).lastSeenAt
    expect(first.getTime()).toBeGreaterThan(stale.getTime())
    await store.touchSession(rec.sid)
    const second = (await db.userSession.findUniqueOrThrow({ where: { id: rec.sid } })).lastSeenAt
    expect(second.getTime()).toBe(first.getTime())
  })

  it('the proxy cache sees a revoked, unexpired session after its TTL', async () => {
    revocation.resetRevocationCacheForTests()
    const user = await makeUser('proxy')
    const rec = await signIn(user.id)
    expect(await revocation.isSessionRevoked(rec.sid)).toBe(false)
    await db.$transaction((tx) =>
      sessions.revokeAllSessions(tx, user.id, {
        actorId: user.id,
        reason: 'signed_out_everywhere',
      })
    )
    await new Promise((r) => setTimeout(r, 150))
    expect(await revocation.isSessionRevoked(rec.sid)).toBe(true)
  })

  it('sign-out ends the session and writes sign_out', async () => {
    const user = await makeUser('signout')
    const rec = await signIn(user.id)
    await sessions.endSession(rec.sid)
    const row = await db.userSession.findUniqueOrThrow({ where: { id: rec.sid } })
    expect(row.revokeReason).toBe('signed_out')
    expect(await db.authEvent.count({ where: { userId: user.id, kind: 'sign_out' } })).toBe(1)
  })
})
