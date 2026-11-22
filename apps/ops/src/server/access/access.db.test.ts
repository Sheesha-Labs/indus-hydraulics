import { mkdtemp, readFile, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

/**
 * The board-77 password path against the real local Postgres (role ops_app): rate limits, lockout,
 * TOTP replay, backup codes, reset links, enumeration and system email rows.
 *
 *   DATABASE_URL="postgresql://ops_app:ops_app_local@localhost:54329/<db>?schema=ops" \
 *     bun run --filter @indus/ops test -- access.db
 *
 * Skipped when DATABASE_URL is unset, and refused for any host but localhost: it writes rows. The
 * users it creates are new per run (`t01-<run>-…@example.test`) and stay, because auth_event is
 * append-only and references them.
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

vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined }))

describe.skipIf(!DB_URL)('sign-in · local database', () => {
  process.env.DATABASE_CONNECTION_LIMIT = '3'
  process.env.OPS_TOKEN_KEYS = JSON.stringify({
    t0: Buffer.alloc(32, 3).toString('base64'),
    t1: Buffer.alloc(32, 4).toString('base64'),
  })
  process.env.OPS_TOKEN_KEY_ACTIVE = 't1'
  process.env.NEXT_PUBLIC_OPS_BASE_URL = 'http://localhost:3131'
  process.env.APP_ENV = 'test'
  process.env.OPS_TEST_RECIPIENTS = ''
  delete process.env.RESEND_OPS_API_KEY

  const run = crypto.randomUUID().slice(0, 8)
  const META = { ipHash: `test-${run}`, userAgent: 'vitest' }
  const STRONG = `harbour-valve-copper-${run}`
  let sink: string

  let db: typeof import('@indus/ops-db').opsDb
  let rate: typeof import('./rate-limit')
  let lockout: typeof import('./lockout')
  let signIn: typeof import('./sign-in')
  let totp: typeof import('./totp')
  let core: typeof import('./totp-core')
  let pending: typeof import('./pending-2fa')
  let backup: typeof import('./backup-codes')
  let reset: typeof import('./reset')
  let password: typeof import('./password')
  let enrol: typeof import('./enrolment')
  let mail: typeof import('../mail/system-email')

  async function makeUser(tag: string, opts: { password?: boolean; totp?: boolean } = {}) {
    const email = `t01-${run}-${tag}@example.test`
    const user = await db.user.create({
      data: { email, name: 'Helper Example', initials: 'HE', role: 'helper', status: 'active' },
      select: { id: true, email: true },
    })
    if (opts.password) await password.setPassword(user.id, STRONG)
    let secret: string | undefined
    if (opts.totp) {
      secret = core.newTotpSecret()
      // Enabled at an old step so a current code is accepted.
      await totp.enableTotp(user.id, secret, 1)
    }
    return { ...user, secret }
  }

  const sealSignin = (uid: string, extra: Partial<import('./pending-2fa').PendingTwoFactor> = {}) =>
    pending.sealPending({ ...pending.newPending({ uid, purpose: 'signin' }), ...extra })

  const nowCode = (secret: string) => core.codeAt(secret, Math.floor(Date.now() / 1000))

  beforeAll(async () => {
    sink = await mkdtemp(join(tmpdir(), 'ops-mail-sink-'))
    process.env.OPS_E2E_MAIL_SINK = sink
    ;({ opsDb: db } = await import('@indus/ops-db'))
    rate = await import('./rate-limit')
    lockout = await import('./lockout')
    signIn = await import('./sign-in')
    totp = await import('./totp')
    core = await import('./totp-core')
    pending = await import('./pending-2fa')
    backup = await import('./backup-codes')
    reset = await import('./reset')
    password = await import('./password')
    enrol = await import('./enrolment')
    mail = await import('../mail/system-email')
  })

  afterAll(async () => {
    await db.rateLimitCounter.deleteMany({ where: { key: { contains: run } } })
    await db.$disconnect()
  })

  describe('rate limit', () => {
    it('allows max hits per window, then refuses', async () => {
      const key = `test:${run}:rl`
      const rule = { windowSeconds: 3600, max: 3 }
      const results = []
      for (let i = 0; i < 5; i++) results.push(await rate.hit(key, rule))
      expect(results).toEqual([true, true, true, false, false])
    })

    it('spendOnce is true exactly once', async () => {
      const until = new Date(Date.now() + 60_000)
      expect(await rate.spendOnce(`test:${run}:once`, until)).toBe(true)
      expect(await rate.spendOnce(`test:${run}:once`, until)).toBe(false)
    })
  })

  describe('lockout', () => {
    it('locks on the 5th failure for 15 minutes, writes auth_event locked, success resets', async () => {
      const u = await makeUser('lock')
      for (let i = 1; i <= 4; i++)
        expect((await lockout.recordFailure(u.id, META)).locked).toBe(false)
      const fifth = await lockout.recordFailure(u.id, META)
      expect(fifth.locked).toBe(true)
      if (!fifth.locked) return
      const minutes = (fifth.lockedUntil.getTime() - Date.now()) / 60_000
      expect(minutes).toBeGreaterThan(14.9)
      expect(minutes).toBeLessThanOrEqual(15)
      expect(lockout.minutesRemaining(fifth.lockedUntil)).toBe(15)
      expect(await db.authEvent.count({ where: { userId: u.id, kind: 'locked' } })).toBe(1)
      await lockout.recordSuccess(u.id)
      const row = await db.user.findUniqueOrThrow({ where: { id: u.id } })
      expect(row.failedAttempts).toBe(0)
      expect(row.lockedUntil).toBeNull()
    })
  })

  describe('password step', () => {
    it('ok only with the right password and an authenticator', async () => {
      const u = await makeUser('pw', { password: true, totp: true })
      const ok = await signIn.passwordStep({ email: u.email, password: STRONG, meta: META })
      expect(ok).toEqual({ kind: 'ok', userId: u.id })
      const wrong = await signIn.passwordStep({ email: u.email, password: 'nope', meta: META })
      expect(wrong).toEqual({ kind: 'invalid' })
    })

    it('a right password without an authenticator never opens a sign-in', async () => {
      const u = await makeUser('nototp', { password: true })
      expect(await signIn.passwordStep({ email: u.email, password: STRONG, meta: META })).toEqual({
        kind: 'no_second_factor',
      })
    })

    it('the 5th wrong password locks: "Try again in 15 minutes"', async () => {
      const u = await makeUser('pwlock', { password: true, totp: true })
      const out = []
      for (let i = 0; i < 6; i++) {
        out.push(
          await signIn.passwordStep({
            email: u.email,
            password: `wrong-${i}`,
            meta: { ...META, ipHash: `pwlock-${run}` },
          })
        )
      }
      expect(out.slice(0, 4).every((o) => o.kind === 'invalid')).toBe(true)
      expect(out[4]).toEqual({ kind: 'locked', minutes: 15 })
      expect(out[5]).toEqual({ kind: 'locked', minutes: 15 })
      // Even the right password is refused while locked.
      expect(
        (await signIn.passwordStep({ email: u.email, password: STRONG, meta: META })).kind
      ).toBe('locked')
    })

    it('unknown, Google-only and password accounts answer alike and lock alike (enumeration)', async () => {
      const google = await makeUser('google')
      const unknown = `t01-${run}-nobody@example.test`
      for (const email of [unknown, google.email]) {
        const out = []
        for (let i = 0; i < 5; i++) {
          const meta = { ...META, ipHash: `enum-${run}-${email}` }
          out.push((await signIn.passwordStep({ email, password: `x-${i}`, meta })).kind)
        }
        expect(out).toEqual(['invalid', 'invalid', 'invalid', 'invalid', 'locked'])
      }
    })

    it('runs an Argon2id verify for an unknown account (timing path)', async () => {
      const u = await makeUser('timing', { password: true, totp: true })
      const time = async (email: string) => {
        const t = performance.now()
        await signIn.passwordStep({
          email,
          password: 'not-it',
          meta: { ...META, ipHash: `t-${run}` },
        })
        return performance.now() - t
      }
      await time(u.email) // warm the dummy hash
      const known = await time(u.email)
      const unknown = await time(`t01-${run}-ghost@example.test`)
      expect(unknown).toBeGreaterThan(known * 0.4)
    })
  })

  describe('second factor', () => {
    it('accepts a valid code once; the same code again is a replay and counts as a failure', async () => {
      const u = await makeUser('replay', { password: true, totp: true })
      const code = nowCode(u.secret!)
      const first = await signIn.secondFactorStep({ pending: sealSignin(u.id), code, meta: META })
      expect(first.ok).toBe(true)
      const again = await signIn.secondFactorStep({ pending: sealSignin(u.id), code, meta: META })
      expect(again).toEqual({ ok: false, reason: 'wrong_code' })
      const row = await db.user.findUniqueOrThrow({ where: { id: u.id } })
      expect(row.failedAttempts).toBe(1)
    })

    it('verifyTotp: ±1 step accepted, older steps and replays refused', async () => {
      const u = await makeUser('window', { totp: true })
      const t = Math.floor(Date.now() / 1000)
      const load = () =>
        db.user.findUniqueOrThrow({
          where: { id: u.id },
          select: { id: true, totpSecretEnc: true, totpEnabledAt: true, totpLastStep: true },
        })
      expect(
        await totp.verifyTotp(await load(), core.codeAt(u.secret!, t - 30), { epochSeconds: t })
      ).toBe('ok')
      expect(
        await totp.verifyTotp(await load(), core.codeAt(u.secret!, t - 30), { epochSeconds: t })
      ).toBe('replayed')
      expect(
        await totp.verifyTotp(await load(), core.codeAt(u.secret!, t + 30), { epochSeconds: t })
      ).toBe('ok')
      // The current step is now below the last accepted one: refused as a replay.
      expect(
        await totp.verifyTotp(await load(), core.codeAt(u.secret!, t), { epochSeconds: t })
      ).toBe('replayed')
      expect(await totp.verifyTotp(await load(), '000000', { epochSeconds: t + 600 })).toBe('wrong')
    })

    it('five wrong codes lock the account', async () => {
      const u = await makeUser('codelock', { password: true, totp: true })
      const out = []
      for (let i = 0; i < 5; i++) {
        out.push(
          await signIn.secondFactorStep({ pending: sealSignin(u.id), code: '000000', meta: META })
        )
      }
      expect(out.slice(0, 4).every((o) => !o.ok && o.reason === 'wrong_code')).toBe(true)
      expect(out[4]).toEqual({ ok: false, reason: 'locked', minutes: 15 })
    })

    it('a backup code works once and is recorded', async () => {
      const u = await makeUser('backup', { password: true, totp: true })
      const [code] = await backup.regenerateBackupCodes(u.id)
      const first = await signIn.secondFactorStep({
        pending: sealSignin(u.id),
        backupCode: code!.toUpperCase(),
        meta: META,
      })
      expect(first).toMatchObject({ ok: true, usedBackupCode: true })
      const again = await signIn.secondFactorStep({
        pending: sealSignin(u.id),
        backupCode: code,
        meta: META,
      })
      expect(again).toEqual({ ok: false, reason: 'wrong_code' })
      expect(await backup.remainingBackupCodes(u.id)).toBe(9)
      expect(await db.authEvent.count({ where: { userId: u.id, kind: 'backup_code_used' } })).toBe(
        1
      )
    })

    it('refuses an expired, tampered or enrolment pending value', async () => {
      const u = await makeUser('pending', { totp: true })
      const code = nowCode(u.secret!)
      const expired = sealSignin(u.id, { exp: Date.now() - 1 })
      expect(await signIn.secondFactorStep({ pending: expired, code, meta: META })).toEqual({
        ok: false,
        reason: 'expired',
      })
      const sealed = sealSignin(u.id)
      const tampered = sealed.slice(0, -3) + (sealed.endsWith('AAA') ? 'BBB' : 'AAA')
      expect((await signIn.secondFactorStep({ pending: tampered, code, meta: META })).ok).toBe(
        false
      )
      const enrolValue = pending.sealPending(enrol.beginEnrolment({ userId: u.id }))
      expect(await signIn.secondFactorStep({ pending: enrolValue, code, meta: META })).toEqual({
        ok: false,
        reason: 'expired',
      })
    })

    it('an enrolment or reset proof signs in once only', async () => {
      const u = await makeUser('proof', { totp: true })
      const value = sealSignin(u.id, { proof: 'enrolment' })
      expect((await signIn.secondFactorStep({ pending: value, meta: META })).ok).toBe(true)
      expect(await signIn.secondFactorStep({ pending: value, meta: META })).toEqual({
        ok: false,
        reason: 'expired',
      })
    })
  })

  describe('enrolment', () => {
    it('stores the secret encrypted, records the step, returns ten backup codes', async () => {
      const u = await makeUser('enrol')
      const p = enrol.beginEnrolment({ userId: u.id })
      expect(await enrol.confirmEnrolment(p, '000000')).toEqual({ ok: false, reason: 'wrong_code' })
      const result = await enrol.confirmEnrolment(p, nowCode(p.pendingSecret!))
      expect(result.ok && result.backupCodes.length).toBe(10)
      const row = await db.user.findUniqueOrThrow({ where: { id: u.id } })
      expect(row.totpEnabledAt).not.toBeNull()
      expect(Buffer.from(row.totpSecretEnc!).toString('utf8')).not.toContain(p.pendingSecret!)
      expect(totp.openTotpSecret(u.id, row.totpSecretEnc!)).toBe(p.pendingSecret)
      expect(await enrol.confirmedSince(p)).toBe(true)
      expect(await db.authEvent.count({ where: { userId: u.id, kind: 'totp_enabled' } })).toBe(1)
    })
  })

  describe('forgot and reset', () => {
    it('answers the same for unknown, Google-only and password accounts; emails differ', async () => {
      const google = await makeUser('fg-google')
      const pw = await makeUser('fg-pw', { password: true, totp: true })
      const meta = { ipHash: `reset-${run}` }
      expect(await reset.requestPasswordReset(`t01-${run}-none@example.test`, meta)).toBe('none')
      expect(await reset.requestPasswordReset(google.email, meta)).toBe('google_only')
      expect(await reset.requestPasswordReset(pw.email, meta)).toBe('reset_link')
      const rows = await db.outboundEmail.findMany({
        where: { toAddresses: { hasSome: [google.email, pw.email] } },
        select: { kind: true, status: true, channel: true, toAddresses: true, bodyText: true },
      })
      expect(rows.map((r) => r.kind).sort()).toEqual([
        'auth_password_reset',
        'auth_security_notice',
      ])
      for (const r of rows) {
        expect(r.channel).toBe('system')
        expect(r.status).toBe('suppressed_preview')
      }
      const resetRow = rows.find((r) => r.kind === 'auth_password_reset')!
      expect(resetRow.bodyText).toContain('[link removed]')
      expect(resetRow.bodyText).not.toMatch(/\/sign-in\/reset\/[A-Za-z0-9_-]{20,}/)
      // The sink keeps the unredacted copy for tests.
      const files = await readdir(sink)
      const sent = await Promise.all(
        files.map(async (f) => JSON.parse(await readFile(join(sink, f), 'utf8')))
      )
      expect(
        sent.some((m: { text: string }) => /\/sign-in\/reset\/[A-Za-z0-9_-]{40,}/.test(m.text))
      ).toBe(true)
    })

    it('rate-limits reset emails to 3 per address per hour', async () => {
      const pw = await makeUser('fg-rl', { password: true, totp: true })
      const out = []
      for (let i = 0; i < 4; i++)
        out.push(await reset.requestPasswordReset(pw.email, { ipHash: `rl-${run}-${i}` }))
      expect(out).toEqual(['reset_link', 'reset_link', 'reset_link', 'rate_limited'])
    })

    async function freshLink(tag: string) {
      const u = await makeUser(tag, { password: true, totp: true })
      const token = crypto.randomUUID().replace(/-/g, '') + run
      const { sha256Hex } = await import('../../lib/crypto')
      await db.passwordResetToken.create({
        data: {
          userId: u.id,
          tokenHash: sha256Hex(token),
          expiresAt: new Date(Date.now() + 30 * 60_000),
        },
      })
      return { u, token }
    }

    it('a valid link with the code sets the password, revokes every session, and works once', async () => {
      const { u, token } = await freshLink('reset-ok')
      await db.userSession.create({
        data: {
          sessionToken: `s-${run}-a`,
          userId: u.id,
          method: 'google',
          expires: new Date(Date.now() + 3600_000),
        },
      })
      const next = `${STRONG}-new`
      const wrong = await reset.completePasswordReset({ token, password: next, code: '000000' })
      expect(wrong).toEqual({ ok: false, error: 'code' })
      const done = await reset.completePasswordReset({
        token,
        password: next,
        code: nowCode(u.secret!),
      })
      expect(done).toEqual({ ok: true, userId: u.id, secondFactorVerified: true })
      const sessions = await db.userSession.findMany({ where: { userId: u.id } })
      expect(sessions.every((s) => s.revokedAt && s.revokeReason === 'password_reset')).toBe(true)
      expect(await db.authEvent.count({ where: { userId: u.id, kind: 'password_reset' } })).toBe(1)
      const row = await db.user.findUniqueOrThrow({ where: { id: u.id } })
      expect(await password.verifySecret(row.passwordHash!, next)).toBe(true)
      expect(row.passwordHistory).toHaveLength(1)
      expect(await reset.inspectResetToken(token)).toEqual({ state: 'used' })
      expect(await reset.completePasswordReset({ token, password: `${next}2`, code: '' })).toEqual({
        ok: false,
        error: 'link',
        state: 'used',
      })
    })

    it('an expired link is refused; a reused password is refused', async () => {
      const { u, token } = await freshLink('reset-exp')
      expect(
        await reset.completePasswordReset({ token, password: STRONG, code: nowCode(u.secret!) })
      ).toEqual({ ok: false, error: 'password', problem: 'reused' })
      await db.passwordResetToken.updateMany({
        where: { userId: u.id },
        data: { expiresAt: new Date(Date.now() - 1000) },
      })
      expect(await reset.inspectResetToken(token)).toEqual({ state: 'expired' })
      expect(await reset.inspectResetToken(`nope${token}`)).toEqual({ state: 'unknown' })
    })
  })

  describe('system email', () => {
    it('sends when allowed (injected provider), records providerMessageId, and never twice per key', async () => {
      const e = {
        APP_ENV: 'production' as const,
        GOOGLE_WORKSPACE_DOMAIN: 'example.test',
        NEXT_PUBLIC_OPS_BASE_URL: 'http://localhost:3131',
      }
      const deliver = vi.fn(async () => ({ id: `re_${run}` }))
      const message = {
        kind: 'auth_security_notice' as const,
        to: `t01-${run}-mail@example.test`,
        subject: 'Test',
        html: '<p>secret-link</p>',
        text: 'secret-link',
        idempotencyKey: `test:${run}:mail`,
        redactions: ['secret-link'],
      }
      const first = await mail.sendSystemEmail(message, { env: e, deliver })
      expect(first.status).toBe('sent')
      const again = await mail.sendSystemEmail(message, { env: e, deliver })
      expect(again).toEqual({ id: first.id, status: 'duplicate' })
      expect(deliver).toHaveBeenCalledTimes(1)
      const row = await db.outboundEmail.findUniqueOrThrow({ where: { id: first.id } })
      expect(row).toMatchObject({
        status: 'sent',
        providerMessageId: `re_${run}`,
        channel: 'system',
      })
      expect(row.bodyText).toBe('[link removed]')
    })

    it('records failed with a reason when the provider refuses or no key is set', async () => {
      const e = { APP_ENV: 'production' as const, GOOGLE_WORKSPACE_DOMAIN: 'example.test' }
      const r = await mail.sendSystemEmail(
        {
          kind: 'auth_security_notice',
          to: `t01-${run}-fail@example.test`,
          subject: 'Test',
          html: '<p>x</p>',
          text: 'x',
          idempotencyKey: `test:${run}:fail`,
        },
        { env: e }
      )
      expect(r.status).toBe('failed')
      const row = await db.outboundEmail.findUniqueOrThrow({ where: { id: r.id } })
      expect(row.failureReason).toBe('not_configured')
    })
  })
})
