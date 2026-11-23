import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The mailbox connect flow against the local database (S04-T02): every callback outcome, single-use state, sealed
 * tokens, refresh under the advisory lock, invalid_grant → token_expired, and label adoption. Google's token
 * endpoint is a stub; Gmail is the in-memory fake. Skips without a local DATABASE_URL.
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

vi.mock('@sentry/nextjs', () => ({
  withScope: (fn: (scope: { setTag: () => void }) => void) => fn({ setTag: () => undefined }),
  captureException: () => undefined,
}))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: () => undefined,
}))
vi.mock('../../inngest/emit', () => ({
  emitEvent: async () => true,
  emitEventOrThrow: async () => undefined,
}))

const ADDRESS = 's04-test-connect-purchase@example.test'

function idToken(claims: Record<string, unknown>): string {
  const part = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url')
  return `${part({ alg: 'RS256' })}.${part(claims)}.sig`
}

const FULL_SCOPE =
  'openid email https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.labels https://www.googleapis.com/auth/gmail.send'

describe.skipIf(!DB_URL)('mailbox connect · local database', () => {
  process.env.DATABASE_CONNECTION_LIMIT = '3'
  process.env.OPS_TOKEN_KEYS = JSON.stringify({
    t0: Buffer.alloc(32, 5).toString('base64'),
    t1: Buffer.alloc(32, 6).toString('base64'),
  })
  process.env.OPS_TOKEN_KEY_ACTIVE = 't1'
  process.env.OPS_STATE_SECRET = 'q'.repeat(40)
  process.env.NEXT_PUBLIC_OPS_BASE_URL = 'http://localhost:3150'
  process.env.GOOGLE_OPS_CLIENT_ID = 'client-id'
  process.env.GOOGLE_OPS_CLIENT_SECRET = 'client-secret'
  process.env.GOOGLE_WORKSPACE_DOMAIN = 'example.test'
  process.env.APP_ENV = 'test'
  delete process.env.OPS_E2E_GOOGLE_ISSUER

  let db: typeof import('@indus/ops-db').opsDb
  let connect: typeof import('./connect')
  let tokens: typeof import('./tokens')
  let labels: typeof import('./labels')
  let fake: typeof import('./testing/fake-gmail')
  let mailboxClient: typeof import('./mailbox-client')
  let owner: import('../../lib/access-core').OpsUser
  let helper: import('../../lib/access-core').OpsUser

  async function cleanup() {
    await db.mailbox.deleteMany({ where: { address: { startsWith: 's04-test-connect-' } } })
    await db.oauthState.deleteMany({ where: { address: { startsWith: 's04-test-connect-' } } })
  }

  /** Start a flow and return the state Google would echo back. */
  async function begin(
    user = owner,
    address = ADDRESS,
    role: 'client' | 'supplier' | 'personal' = 'supplier'
  ) {
    const res = await connect.startConnect({ user, role, address, returnTo: 'settings' })
    if (!res.ok) throw new Error(`start refused: ${res.reason}`)
    return new URL(res.url).searchParams.get('state')!
  }

  const revoked: string[] = []
  const deps = (
    token: Partial<import('./oauth').TokenResponse> & { email?: string; hd?: string }
  ) => ({
    exchange: async () => ({
      access_token: 'access-1',
      refresh_token: 'refresh-1',
      expires_in: 3600,
      scope: FULL_SCOPE,
      id_token: idToken({
        email: token.email ?? ADDRESS,
        hd: token.hd ?? 'example.test',
        email_verified: true,
      }),
      ...token,
    }),
    revoke: async ({ token: t }: { token: string }) => {
      revoked.push(t)
      return true
    },
    emit: async () => true,
    sendAs: async () => undefined,
  })

  beforeAll(async () => {
    ;({ opsDb: db } = await import('@indus/ops-db'))
    connect = await import('./connect')
    tokens = await import('./tokens')
    labels = await import('./labels')
    fake = await import('./testing/fake-gmail')
    mailboxClient = await import('./mailbox-client')
    const row = await db.user.findFirst({ where: { role: 'owner', status: 'active' } })
    const h = await db.user.findFirst({ where: { role: 'helper', status: 'active' } })
    if (!row || !h) throw new Error('seed an owner and a helper first (SEED_DEMO=1 db:seed)')
    const asUser = (u: typeof row) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      initials: u.initials,
      role: u.role,
      canSeeMargins: u.canSeeMargins,
      canSendSupplierMail: u.canSendSupplierMail,
      canEditChaserRules: u.canEditChaserRules,
    })
    owner = asUser(row)
    helper = { ...asUser(h), canSendSupplierMail: false }
    await cleanup()
  })

  beforeEach(async () => {
    revoked.length = 0
    await cleanup()
  })

  afterAll(async () => {
    await cleanup()
    mailboxClient.useGmailTransportForTests(undefined)
    await db.$disconnect()
  })

  it('stores only the nonce hash and a sealed verifier; the URL carries a signed state', async () => {
    const state = await begin()
    const row = await db.oauthState.findFirst({ where: { address: ADDRESS } })
    expect(row?.nonceHash).toMatch(/^[0-9a-f]{64}$/)
    expect(row?.codeVerifierEnc.startsWith('v1.t1.')).toBe(true)
    expect(state).toContain('.')
  })

  it('refuses a Helper without the supplier-mail flag, and any Helper for the client mailbox', async () => {
    expect(
      await connect.startConnect({
        user: helper,
        role: 'supplier',
        address: ADDRESS,
        returnTo: 'settings',
      })
    ).toEqual({
      ok: false,
      reason: 'not_allowed',
    })
    const flagged = { ...helper, canSendSupplierMail: true }
    expect(
      await connect.startConnect({
        user: flagged,
        role: 'client',
        address: 's04-test-connect-sales@example.test',
        returnTo: 'settings',
      })
    ).toEqual({
      ok: false,
      reason: 'not_allowed',
    })
    expect(
      (
        await connect.startConnect({
          user: flagged,
          role: 'supplier',
          address: ADDRESS,
          returnTo: 'settings',
        })
      ).ok
    ).toBe(true)
  })

  it('success: sealed tokens bound to the row, connecting, scopes and capabilities stored', async () => {
    const state = await begin()
    const res = await connect.finishConnect({ code: 'c', state }, owner.id, deps({}))
    expect(res.outcome).toBe('connected')
    const m = await db.mailbox.findUniqueOrThrow({ where: { address: ADDRESS } })
    expect(m.status).toBe('connecting')
    expect(m.canSend).toBe(true)
    expect(m.tokenKeyId).toBe('t1')
    const sealed = Buffer.from(m.refreshTokenEnc!).toString('utf8')
    expect(sealed).not.toContain('refresh-1')
    expect(tokens.openFromBytes(m.refreshTokenEnc!, tokens.REFRESH_AAD(m.id))).toBe('refresh-1')
    // A ciphertext moved to another row (or read as another kind) does not open.
    expect(() =>
      tokens.openFromBytes(
        m.refreshTokenEnc!,
        tokens.REFRESH_AAD('00000000-0000-7000-8000-000000000000')
      )
    ).toThrow('sealed value could not be opened')
    expect(() => tokens.openFromBytes(m.refreshTokenEnc!, tokens.ACCESS_AAD(m.id))).toThrow(
      'sealed value could not be opened'
    )
    expect(await db.mailboxSyncState.findUnique({ where: { mailboxId: m.id } })).not.toBeNull()
    expect(connect.callbackRedirect(res)).toBe(
      `/settings/mailboxes?connect=supplier&step=4&outcome=connected&mailbox=${m.id}`
    )
  })

  it('a replayed state, an expired state, a forged state and another user all claim nothing', async () => {
    const state = await begin()
    expect((await connect.finishConnect({ code: 'c', state }, owner.id, deps({}))).outcome).toBe(
      'connected'
    )
    expect((await connect.finishConnect({ code: 'c', state }, owner.id, deps({}))).outcome).toBe(
      'expired'
    )

    const state2 = await begin()
    await db.oauthState.updateMany({
      where: { usedAt: null, address: ADDRESS },
      data: { expiresAt: new Date(Date.now() - 1000) },
    })
    expect(
      (await connect.finishConnect({ code: 'c', state: state2 }, owner.id, deps({}))).outcome
    ).toBe('expired')

    const state3 = await begin()
    expect(
      (await connect.finishConnect({ code: 'c', state: `${state3}x` }, owner.id, deps({}))).outcome
    ).toBe('expired')
    expect(
      (await connect.finishConnect({ code: 'c', state: state3 }, helper.id, deps({}))).outcome
    ).toBe('expired')
    expect(
      (await connect.finishConnect({ code: 'c', state: state3 }, null, deps({}))).outcome
    ).toBe('expired')
  })

  it('wrong account: a personal Gmail or another address stores nothing and revokes the fresh grant', async () => {
    const state = await begin()
    const res = await connect.finishConnect(
      { code: 'c', state },
      owner.id,
      deps({ email: 'someone@gmail.com', hd: '' })
    )
    expect(res.outcome).toBe('wrong_account')
    expect(revoked).toEqual(['refresh-1'])
    expect(await db.mailbox.findUnique({ where: { address: ADDRESS } })).toBeNull()

    const state2 = await begin()
    const other = await connect.finishConnect(
      { code: 'c', state: state2 },
      owner.id,
      deps({ email: 's04-test-connect-other@example.test' })
    )
    expect(other.outcome).toBe('wrong_account')
  })

  it('a Personal mailbox may be any Google account (no Workspace check)', async () => {
    const state = await begin(owner, 's04-test-connect-me@gmail.test', 'personal')
    const res = await connect.finishConnect(
      { code: 'c', state },
      owner.id,
      deps({ email: 's04-test-connect-me@gmail.test', hd: undefined as unknown as string })
    )
    expect(res.outcome).toBe('connected')
  })

  it('partial grant: no gmail.send → drafts only, stored, "Drafts only · can’t send"', async () => {
    const state = await begin()
    const res = await connect.finishConnect(
      { code: 'c', state },
      owner.id,
      deps({
        scope:
          'openid email https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.labels',
      })
    )
    expect(res.outcome).toBe('drafts_only')
    const m = await db.mailbox.findUniqueOrThrow({ where: { address: ADDRESS } })
    expect([m.canSend, m.canDraft, m.statusReason]).toEqual([
      false,
      true,
      'Drafts only · can’t send',
    ])
  })

  it('blocked by the Workspace admin, and a person who cancels, store nothing', async () => {
    const state = await begin()
    expect(
      (await connect.finishConnect({ error: 'admin_policy_enforced', state }, owner.id, deps({})))
        .outcome
    ).toBe('blocked_by_admin')
    const state2 = await begin()
    expect(
      (await connect.finishConnect({ error: 'access_denied', state: state2 }, owner.id, deps({})))
        .outcome
    ).toBe('denied')
    expect(await db.mailbox.findUnique({ where: { address: ADDRESS } })).toBeNull()
  })

  it('refreshes under the advisory lock once, and invalid_grant marks the mailbox token_expired', async () => {
    const state = await begin()
    await connect.finishConnect({ code: 'c', state }, owner.id, deps({}))
    const m = await db.mailbox.findUniqueOrThrow({ where: { address: ADDRESS } })
    await db.mailbox.update({
      where: { id: m.id },
      data: { status: 'live', accessExpiresAt: new Date(Date.now() + 60_000) },
    })
    let refreshes = 0
    const refresh = async () => {
      refreshes += 1
      await new Promise((r) => setTimeout(r, 50))
      return { access_token: 'access-2', expires_in: 3600 }
    }
    const [a, b] = await Promise.all([
      tokens.getAccessToken(m.id, { refresh }),
      tokens.getAccessToken(m.id, { refresh }),
    ])
    expect([a, b]).toEqual(['access-2', 'access-2'])
    expect(refreshes).toBe(1)

    await db.mailbox.update({
      where: { id: m.id },
      data: { accessExpiresAt: new Date(Date.now() - 1) },
    })
    const { OAuthHttpError } = await import('./oauth')
    let notified = ''
    await expect(
      tokens.getAccessToken(m.id, {
        refresh: async () => {
          throw new OAuthHttpError(400, 'invalid_grant')
        },
        onDisconnected: async (id) => {
          notified = id
        },
      })
    ).rejects.toMatchObject({ name: 'MailboxUnavailableError', reason: 'token_expired' })
    const after = await db.mailbox.findUniqueOrThrow({ where: { id: m.id } })
    expect([after.status, after.lastTokenError, after.accessTokenEnc]).toEqual([
      'token_expired',
      'invalid_grant',
      null,
    ])
    expect(notified).toBe(m.id)
  })

  it('reconnect after token_expired goes back to connecting and keeps the history position', async () => {
    const state = await begin()
    await connect.finishConnect({ code: 'c', state }, owner.id, deps({}))
    const m = await db.mailbox.findUniqueOrThrow({ where: { address: ADDRESS } })
    await db.mailbox.update({ where: { id: m.id }, data: { status: 'token_expired' } })
    await db.mailboxSyncState.update({ where: { mailboxId: m.id }, data: { historyId: '4242' } })
    const state2 = await begin()
    expect(
      (await connect.finishConnect({ code: 'c', state: state2 }, owner.id, deps({}))).outcome
    ).toBe('connected')
    expect((await db.mailbox.findUniqueOrThrow({ where: { id: m.id } })).status).toBe('connecting')
    expect(
      (await db.mailboxSyncState.findUniqueOrThrow({ where: { mailboxId: m.id } })).historyId
    ).toBe('4242')
  })

  it('creates the Indus labels and adopts one that already exists in Gmail', async () => {
    const state = await begin()
    await connect.finishConnect({ code: 'c', state }, owner.id, deps({}))
    const m = await db.mailbox.findUniqueOrThrow({ where: { address: ADDRESS } })
    const gmail = new fake.FakeGmail(ADDRESS)
    await gmail.labels.create({ name: 'Indus/PO' })
    mailboxClient.useGmailTransportForTests(() => gmail)
    const result = await labels.ensureIndusLabels(m.id, mailboxClient.gmailFor(m.id, 'send'))
    expect(result.adopted).toEqual(['Indus/PO'])
    expect(result.created).toHaveLength(7)
    const rows = await db.gmailLabel.findMany({ where: { mailboxId: m.id } })
    expect(rows).toHaveLength(8)
    // Running again creates nothing.
    expect(
      (await labels.ensureIndusLabels(m.id, mailboxClient.gmailFor(m.id, 'send'))).created
    ).toEqual([])
    mailboxClient.useGmailTransportForTests(undefined)
  })
})
