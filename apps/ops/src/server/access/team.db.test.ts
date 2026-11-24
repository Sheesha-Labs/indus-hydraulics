import { mkdtemp, readFile, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

/**
 * Settings › Team (S03-T03) against the real local Postgres (role ops_app): the invite lifecycle
 * (create, 7-day expiry, resend revokes the old link, revoke, accept with a matching and a mismatching
 * Google address, the password path's activation), the domain rule and its override in auth_event,
 * the one-Helper rule, Helper permissions (version-checked), the last-Owner guard, removing a Helper,
 * and ownership transfer ordering under the REAL partial unique index `user_one_active_owner`.
 *
 *   DATABASE_URL="postgresql://ops_app:ops_app_local@localhost:54329/<db>?schema=ops" \
 *     bun run --filter @indus/ops test -- team.db
 *
 * Skipped when DATABASE_URL is unset, and refused for any host but localhost. Every case runs inside
 * a transaction that is ROLLED BACK at the end (`scenario`), so the seeded Owner and Helper and other
 * test files' rows are left as they were. The transaction first takes a SHARE ROW EXCLUSIVE lock on
 * ops.user (other writers to that table wait the second it lasts; readers do not), then sets aside
 * every active Helper and open invitation, so each case starts from "one Owner, nobody else".
 * Only the email case commits: an outbound_email row, as the real send would write.
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

const h = vi.hoisted(() => ({ sink: '' }))

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
    NEXT_PUBLIC_OPS_BASE_URL: 'http://localhost:3133',
    OPS_TEST_RECIPIENTS: '',
    OPS_E2E_MAIL_SINK: h.sink,
    GOOGLE_WORKSPACE_DOMAIN: 'example.test',
  }),
}))

type Tx = import('@indus/ops-db').Prisma.TransactionClient

class Rollback extends Error {}

const byText = (a: string | null, b: string | null) => String(a).localeCompare(String(b))

const DOMAIN = { workspaceDomain: 'example.test', inviteDays: 7 }
const DAY = 24 * 60 * 60 * 1000

describe.skipIf(!DB_URL)('team, invites and ownership · local database', () => {
  process.env.DATABASE_CONNECTION_LIMIT = '3'
  const run = crypto.randomUUID().slice(0, 8)

  let db: typeof import('@indus/ops-db').opsDb
  let invites: typeof import('./invites')
  let team: typeof import('./team')
  let crypto_: typeof import('../../lib/crypto')
  let owner: { id: string; role: 'owner'; name: string }

  beforeAll(async () => {
    h.sink = await mkdtemp(join(tmpdir(), 'ops-t03-sink-'))
    ;({ opsDb: db } = await import('@indus/ops-db'))
    invites = await import('./invites')
    team = await import('./team')
    crypto_ = await import('../../lib/crypto')
    const row = await db.user.findFirstOrThrow({
      where: { role: 'owner', status: 'active' },
      select: { id: true, name: true },
    })
    owner = { id: row.id, role: 'owner', name: row.name }
  })

  /** Run `fn` in a transaction that is always rolled back, from a clean "one Owner" team. */
  async function scenario(fn: (tx: Tx) => Promise<void>): Promise<void> {
    try {
      await db.$transaction(
        async (tx) => {
          await tx.$executeRawUnsafe('LOCK TABLE ops."user" IN SHARE ROW EXCLUSIVE MODE')
          await tx.user.updateMany({
            where: { role: 'helper', status: { in: ['active', 'invited'] } },
            data: { status: 'removed' },
          })
          await tx.userInvite.updateMany({
            where: { acceptedAt: null, revokedAt: null },
            data: { revokedAt: new Date() },
          })
          await fn(tx)
          throw new Rollback()
        },
        { maxWait: 20_000, timeout: 20_000 }
      )
    } catch (error) {
      if (!(error instanceof Rollback)) throw error
    }
  }

  const email = (tag: string) => `t03-${run}-${tag}@example.test`

  async function makeHelper(tx: Tx, tag: string) {
    return tx.user.create({
      data: {
        email: email(tag),
        name: 'Helper Example',
        initials: 'HE',
        role: 'helper',
        status: 'active',
      },
      select: { id: true, name: true },
    })
  }

  async function liveSession(tx: Tx, userId: string) {
    const id = crypto.randomUUID()
    await tx.userSession.create({
      data: {
        id,
        sessionToken: id,
        userId,
        method: 'google',
        expires: new Date(Date.now() + 3600_000),
      },
    })
    return id
  }

  // ── Invites ────────────────────────────────────────────────────────────────────────────────

  // The users stay (auth_event is append-only) but leave the active set, so no later test's "everyone"
  // notification fans out to every run's leftovers.
  afterAll(async () => {
    await db.user.updateMany({
      where: { email: { startsWith: `t03-${run}-` }, status: { in: ['active', 'invited'] } },
      data: { status: 'removed' },
    })
  })

  it('creates an invite: hashed token, 7-day expiry, invited row, invite_sent, setup step 6 done', async () => {
    await scenario(async (tx) => {
      const now = new Date()
      const created = await invites.createInvite(
        tx,
        owner,
        { email: email('new').toUpperCase(), overrideDomain: false },
        { ...DOMAIN, now }
      )
      expect(created.email).toBe(email('new'))
      expect(created.token).toMatch(/^[A-Za-z0-9_-]{43}$/)
      expect(created.expiresAt.getTime() - now.getTime()).toBe(7 * DAY)
      const row = await tx.userInvite.findUniqueOrThrow({ where: { id: created.inviteId } })
      expect(row.tokenHash).toBe(crypto_.sha256Hex(created.token))
      expect(row.tokenHash).not.toContain(created.token)
      const user = await tx.user.findUniqueOrThrow({ where: { email: email('new') } })
      expect(user).toMatchObject({ status: 'invited', role: 'helper' })
      const events = await tx.authEvent.findMany({ where: { email: email('new') } })
      expect(events.map((e) => e.kind)).toEqual(['invite_sent'])
      const step = await tx.checklistItem.findUniqueOrThrow({
        where: { checklist_key: { checklist: 'setup', key: 'invite' } },
      })
      expect(step.status).toBe('done')
    })
  })

  it('refuses another domain, and records the Owner’s override in auth_event', async () => {
    await scenario(async (tx) => {
      const other = `t03-${run}-x@elsewhere.test`
      await expect(
        invites.createInvite(tx, owner, { email: other, overrideDomain: false }, DOMAIN)
      ).rejects.toThrow('Invites must be @example.test')
      const created = await invites.createInvite(
        tx,
        owner,
        { email: other, overrideDomain: true },
        DOMAIN
      )
      expect(created.verdict).toBe('override')
      const kinds = (await tx.authEvent.findMany({ where: { email: other } })).map((e) => e.kind)
      expect(kinds.sort(byText)).toEqual(['invite_domain_override', 'invite_sent'])
    })
  })

  it('keeps to one Helper: refuses while one is active, or while another invite is open', async () => {
    await scenario(async (tx) => {
      await invites.createInvite(tx, owner, { email: email('a'), overrideDomain: false }, DOMAIN)
      await expect(
        invites.createInvite(tx, owner, { email: email('b'), overrideDomain: false }, DOMAIN)
      ).rejects.toThrow(`An invitation to ${email('a')} is still open`)
      await expect(
        invites.createInvite(tx, owner, { email: email('a'), overrideDomain: false }, DOMAIN)
      ).rejects.toThrow('already open')
    })
    await scenario(async (tx) => {
      await makeHelper(tx, 'active')
      await expect(
        invites.createInvite(tx, owner, { email: email('c'), overrideDomain: false }, DOMAIN)
      ).rejects.toThrow('There is already a Helper')
    })
  })

  it('refuses a Helper as the inviter', async () => {
    await scenario(async (tx) => {
      const helper = await makeHelper(tx, 'inviter')
      await expect(
        invites.createInvite(
          tx,
          { id: helper.id, role: 'helper', name: helper.name },
          { email: email('d'), overrideDomain: false },
          DOMAIN
        )
      ).rejects.toMatchObject({ name: 'AccessError', code: 'forbidden' })
    })
  })

  it('expires at 7 days: the link reads expired and cannot be accepted', async () => {
    await scenario(async (tx) => {
      const now = new Date()
      const created = await invites.createInvite(
        tx,
        owner,
        { email: email('exp'), overrideDomain: false },
        { ...DOMAIN, now }
      )
      const almost = new Date(now.getTime() + 7 * DAY - 1000)
      const after = new Date(now.getTime() + 7 * DAY)
      expect((await invites.inspectInvite(created.token, almost, tx)).state).toBe('valid')
      expect((await invites.inspectInvite(created.token, after, tx)).state).toBe('expired')
      expect(
        await invites.acceptInviteWithGoogle(tx, {
          token: created.token,
          email: email('exp'),
          now: after,
        })
      ).toEqual({ ok: false, reason: 'expired' })
    })
  })

  it('resend revokes the old link and issues a new one with a new expiry', async () => {
    await scenario(async (tx) => {
      const first = await invites.createInvite(
        tx,
        owner,
        { email: email('re'), overrideDomain: false },
        DOMAIN
      )
      const later = new Date(Date.now() + 2 * DAY)
      const second = await invites.resendInvite(tx, owner, first.inviteId, {
        inviteDays: 7,
        now: later,
      })
      expect(second.token).not.toBe(first.token)
      expect(second.expiresAt.getTime()).toBe(later.getTime() + 7 * DAY)
      expect((await invites.inspectInvite(first.token, later, tx)).state).toBe('revoked')
      expect((await invites.inspectInvite(second.token, later, tx)).state).toBe('valid')
      expect(
        await invites.acceptInviteWithGoogle(tx, { token: first.token, email: email('re') })
      ).toEqual({ ok: false, reason: 'revoked' })
    })
  })

  it('revoke ends the link and sets the invited row aside', async () => {
    await scenario(async (tx) => {
      const created = await invites.createInvite(
        tx,
        owner,
        { email: email('rv'), overrideDomain: false },
        DOMAIN
      )
      expect(await invites.revokeInvite(tx, owner, created.inviteId)).toBe('revoked')
      expect(await invites.revokeInvite(tx, owner, created.inviteId)).toBe('already_revoked')
      expect((await invites.inspectInvite(created.token, new Date(), tx)).state).toBe('revoked')
      const user = await tx.user.findUniqueOrThrow({ where: { email: email('rv') } })
      expect(user.status).toBe('removed')
      const kinds = (await tx.authEvent.findMany({ where: { email: email('rv') } })).map(
        (e) => e.kind
      )
      expect(kinds).toContain('invite_revoked')
    })
  })

  it('accepts with Google only for the invited address, in one transaction', async () => {
    await scenario(async (tx) => {
      const created = await invites.createInvite(
        tx,
        owner,
        { email: email('g'), overrideDomain: false },
        DOMAIN
      )
      // A different Google account: refused, nothing changes.
      expect(
        await invites.acceptInviteWithGoogle(tx, { token: created.token, email: email('other') })
      ).toEqual({ ok: false, reason: 'email_mismatch' })
      expect((await tx.user.findUniqueOrThrow({ where: { email: email('g') } })).status).toBe(
        'invited'
      )
      expect((await invites.inspectInvite(created.token, new Date(), tx)).state).toBe('valid')

      // The invited address (Google's casing): active Helper, invite used, auth_event.
      const ok = await invites.acceptInviteWithGoogle(tx, {
        token: created.token,
        email: email('g').toUpperCase(),
        name: 'Helper Example',
      })
      expect(ok.ok).toBe(true)
      const user = await tx.user.findUniqueOrThrow({ where: { email: email('g') } })
      expect(user).toMatchObject({
        status: 'active',
        role: 'helper',
        name: 'Helper Example',
        initials: 'HE',
        canSeeMargins: false,
        canSendSupplierMail: false,
        canEditChaserRules: false,
      })
      expect((await invites.inspectInvite(created.token, new Date(), tx)).state).toBe('used')
      const accepted = await tx.authEvent.findMany({
        where: { userId: user.id, kind: 'invite_accepted' },
      })
      expect(accepted).toHaveLength(1)
      expect(accepted[0]?.method).toBe('google')
      // The same link again: used.
      expect(
        await invites.acceptInviteWithGoogle(tx, { token: created.token, email: email('g') })
      ).toEqual({ ok: false, reason: 'used' })
    })
  })

  it('password path: the row turns active only at activation, and not after a revoke', async () => {
    await scenario(async (tx) => {
      const created = await invites.createInvite(
        tx,
        owner,
        { email: email('pw'), overrideDomain: false },
        DOMAIN
      )
      const row = await tx.user.findUniqueOrThrow({ where: { email: email('pw') } })
      expect(row.status).toBe('invited')
      expect(await invites.activateInvitedUser(tx, row.id)).toEqual({ ok: true, userId: row.id })
      expect((await tx.user.findUniqueOrThrow({ where: { id: row.id } })).status).toBe('active')
      expect((await invites.inspectInvite(created.token, new Date(), tx)).state).toBe('used')
    })
    await scenario(async (tx) => {
      const created = await invites.createInvite(
        tx,
        owner,
        { email: email('pw2'), overrideDomain: false },
        DOMAIN
      )
      const row = await tx.user.findUniqueOrThrow({ where: { email: email('pw2') } })
      await invites.revokeInvite(tx, owner, created.inviteId)
      const outcome = await invites.activateInvitedUser(tx, row.id)
      expect(outcome.ok).toBe(false)
      expect((await tx.user.findUniqueOrThrow({ where: { id: row.id } })).status).toBe('removed')
    })
  })

  it('emails the link from NEXT_PUBLIC_OPS_BASE_URL and stores it redacted', async () => {
    const token = crypto_.randomToken(32)
    const inviteId = crypto.randomUUID()
    const result = await invites.sendInviteEmail(
      { inviteId, email: email('mail'), token, expiresAt: new Date(Date.now() + 7 * DAY) },
      'Owner Example'
    )
    expect(result.status).toBe('suppressed_preview')
    const row = await db.outboundEmail.findUniqueOrThrow({ where: { id: result.id } })
    expect(row).toMatchObject({ channel: 'system', kind: 'auth_invite' })
    expect(row.bodyText).not.toContain(token)
    expect(row.bodyHtml).not.toContain(token)
    expect(row.bodyText).toContain('[link removed]')
    const files = await readdir(h.sink)
    const sent = await Promise.all(files.map((f) => readFile(join(h.sink, f), 'utf8')))
    const mine = sent.find((s) => s.includes(token))
    expect(mine).toContain(`http://localhost:3133/sign-in/invite/${token}`)
  })

  // ── Permissions, removal, the last Owner ──────────────────────────────────────────────────

  it('sets the Helper’s toggles, version-checked on what the page showed', async () => {
    await scenario(async (tx) => {
      const helper = await makeHelper(tx, 'perm')
      const off = { canSeeMargins: false, canSendSupplierMail: false, canEditChaserRules: false }
      const next = { ...off, canSendSupplierMail: true }
      await team.updateHelperPermissions(tx, owner, { userId: helper.id, next, expected: off })
      const row = await tx.user.findUniqueOrThrow({ where: { id: helper.id } })
      expect(row.canSendSupplierMail).toBe(true)
      // A second tab still showing "all off": refused.
      await expect(
        team.updateHelperPermissions(tx, owner, {
          userId: helper.id,
          next: { ...off, canSeeMargins: true },
          expected: off,
        })
      ).rejects.toThrow('Someone changed this a moment ago')
      const events = await tx.authEvent.findMany({
        where: { userId: helper.id, kind: 'permissions_changed' },
      })
      expect(events).toHaveLength(1)
    })
  })

  it('never leaves zero Owners: the only Owner cannot be removed or demoted', async () => {
    await scenario(async (tx) => {
      const message = `${owner.name} is the only Owner. Transfer ownership first.`
      await expect(team.removeUser(tx, owner, owner.id)).rejects.toThrow(message)
      await expect(team.changeRole(tx, owner, owner.id, 'helper')).rejects.toThrow(message)
      const row = await tx.user.findUniqueOrThrow({ where: { id: owner.id } })
      expect(row).toMatchObject({ role: 'owner', status: 'active' })
    })
  })

  it('removes a Helper: status removed, sessions revoked, user_removed, sign-in refused', async () => {
    await scenario(async (tx) => {
      const helper = await makeHelper(tx, 'rm')
      const sid = await liveSession(tx, helper.id)
      const removed = await team.removeUser(tx, owner, helper.id)
      expect(removed).toEqual({ work: { supplierRfqs: 0, draftChasers: 0 }, sessionsEnded: 1 })
      const row = await tx.user.findUniqueOrThrow({ where: { id: helper.id } })
      expect(row.status).toBe('removed')
      expect(row.removedAt).not.toBeNull()
      const session = await tx.userSession.findUniqueOrThrow({ where: { id: sid } })
      expect(session.revokedAt).not.toBeNull()
      expect(session.revokeReason).toBe('removed_by_owner')
      const kinds = (await tx.authEvent.findMany({ where: { userId: helper.id } })).map(
        (e) => e.kind
      )
      expect(kinds.sort(byText)).toEqual(['session_revoked', 'user_removed'])
      const { signInRefusal } = await import('./team-core')
      expect(signInRefusal({ status: row.status }, 'google')).toBe('deactivated')
    })
  })

  // ── Ownership transfer under the partial unique index ─────────────────────────────────────

  it('the index is real: promoting a second Owner while one is active fails', async () => {
    await scenario(async (tx) => {
      const helper = await makeHelper(tx, 'idx')
      await expect(
        tx.user.update({ where: { id: helper.id }, data: { role: 'owner' } })
      ).rejects.toMatchObject({ code: 'P2002' })
    })
  })

  it('transfers ownership: demote first, then promote; both sessions revoked; audit for both', async () => {
    await scenario(async (tx) => {
      const helper = await makeHelper(tx, 'xfer')
      const ownerSid = await liveSession(tx, owner.id)
      const helperSid = await liveSession(tx, helper.id)
      const done = await team.transferOwnership(tx, owner, {
        toUserId: helper.id,
        signedInAt: new Date(Date.now() - 60_000),
      })
      expect(done.fromUserId).toBe(owner.id)
      expect(done.sessionsEnded).toBeGreaterThanOrEqual(2)
      const [was, now] = await Promise.all([
        tx.user.findUniqueOrThrow({ where: { id: owner.id } }),
        tx.user.findUniqueOrThrow({ where: { id: helper.id } }),
      ])
      expect(was.role).toBe('helper')
      expect(now.role).toBe('owner')
      expect(await tx.user.count({ where: { role: 'owner', status: 'active' } })).toBe(1)
      for (const sid of [ownerSid, helperSid]) {
        const s = await tx.userSession.findUniqueOrThrow({ where: { id: sid } })
        expect(s.revokeReason).toBe('ownership_transferred')
      }
      const audit = await tx.authEvent.findMany({
        where: { kind: 'ownership_transferred', userId: { in: [owner.id, helper.id] } },
        orderBy: { at: 'desc' },
        take: 2,
      })
      expect(audit.map((a) => a.userId).sort(byText)).toEqual([owner.id, helper.id].sort(byText))
    })
  })

  it('refuses a transfer without a sign-in in the last 10 minutes', async () => {
    await scenario(async (tx) => {
      const helper = await makeHelper(tx, 'stale')
      await expect(
        team.transferOwnership(tx, owner, {
          toUserId: helper.id,
          signedInAt: new Date(Date.now() - 11 * 60_000),
        })
      ).rejects.toThrow('sign in again before transferring ownership')
      await expect(
        team.transferOwnership(tx, owner, { toUserId: helper.id, signedInAt: null })
      ).rejects.toThrow('sign in again')
      expect((await tx.user.findUniqueOrThrow({ where: { id: owner.id } })).role).toBe('owner')
    })
  })
})
