import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Incremental sync against the local database and the in-memory Gmail (S04-T04): fan-out in order, the cursor
 * written once and only forward, Indus-only label changes ignored, the bounded resync after a 404 skipping known
 * ids, the pause short-circuit, and the safety poll picking only stale mailboxes.
 */
function localDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL
  if (!raw) return undefined
  try {
    return ['localhost', '127.0.0.1', '[::1]'].includes(new URL(raw).hostname) ? raw : undefined
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
vi.mock('../../inngest/emit-batch', () => ({ emitEvents: async () => 0 }))

const ADDRESS = 's04-test-sync@example.test'

describe.skipIf(!DB_URL)('gmail sync · local database', () => {
  process.env.APP_ENV = 'test'
  let db: typeof import('@indus/ops-db').opsDb
  let sync: typeof import('./sync')
  let labels: typeof import('./labels')
  let poll: typeof import('../../inngest/gmail/poll')
  let client: typeof import('./client')
  let FakeGmail: typeof import('./testing/fake-gmail').FakeGmail
  let mailboxId = ''
  let gmail: InstanceType<typeof FakeGmail>
  const emitted: Array<{ name: string; id?: string; data: Record<string, unknown> }> = []
  // The real client around the fake: the 404 → HistoryTooOldError mapping and label policy run as in production.
  const deps = () => ({
    gmail: client.createGmailClient({
      mailboxId,
      budget: 'live',
      accessToken: async () => 'test',
      indusLabelIds: async () => new Set<string>(),
      transport: () => gmail,
    }),
    emit: async (
      events: readonly { name: string; id?: string; data: Record<string, unknown> }[]
    ) => {
      emitted.push(...events)
      return events.length
    },
    paused: async () => false,
  })

  beforeAll(async () => {
    ;({ opsDb: db } = await import('@indus/ops-db'))
    sync = await import('./sync')
    labels = await import('./labels')
    poll = await import('../../inngest/gmail/poll')
    client = await import('./client')
    ;({ FakeGmail } = await import('./testing/fake-gmail'))
  })

  beforeEach(async () => {
    emitted.length = 0
    await db.mailbox.deleteMany({ where: { address: { startsWith: 's04-test-' } } })
    const m = await db.mailbox.create({
      data: {
        address: ADDRESS,
        displayName: 'sync',
        role: 'supplier',
        status: 'live',
        canRead: true,
      },
    })
    mailboxId = m.id
    gmail = new FakeGmail(ADDRESS)
    await labels.ensureIndusLabels(mailboxId, gmail)
    await db.mailboxSyncState.create({ data: { mailboxId, historyId: gmail.currentHistoryId } })
  })

  afterAll(async () => {
    await db.mailbox.deleteMany({ where: { address: { startsWith: 's04-test-' } } })
    await db.$disconnect()
  })

  const fetchIds = () =>
    emitted.filter((e) => e.name === 'ops/gmail.message.fetch').map((e) => e.data.gmailId)
  const cursor = async () =>
    (await db.mailboxSyncState.findUniqueOrThrow({ where: { mailboxId } })).historyId

  it('fans out one fetch per new message in order, keyed mailbox:gmailId, then moves the cursor', async () => {
    const a = gmail.deliver({
      from: 'Example Valve Co <rfq@example.test>',
      to: [ADDRESS],
      subject: 'Quote A',
    })
    const b = gmail.deliver({
      from: 'Sample Client LLC <buyer@example.test>',
      to: [ADDRESS],
      subject: 'Order B',
    })
    gmail.deliver({ from: ADDRESS, to: ['x@example.test'], subject: 'draft', labelIds: ['DRAFT'] })
    const res = await sync.syncMailbox({ mailboxId, reason: 'push' }, deps())
    expect(res).toMatchObject({ kind: 'synced', fetched: 2 })
    expect(fetchIds()).toEqual([a, b])
    expect(emitted[0]?.id).toBe(`${mailboxId}:${a}`)
    expect(await cursor()).toBe(gmail.currentHistoryId)
    const state = await db.mailboxSyncState.findUniqueOrThrow({ where: { mailboxId } })
    expect(state.lastSuccessfulSyncAt).not.toBeNull()
  })

  it('ignores label changes made only to Indus labels, reports others (moved to spam)', async () => {
    const id = gmail.deliver({ from: 'a@example.test', to: [ADDRESS], subject: 'Hi' })
    await sync.syncMailbox({ mailboxId, reason: 'push' }, deps())
    emitted.length = 0
    const indus = (await db.gmailLabel.findFirstOrThrow({ where: { mailboxId, name: 'Indus/PO' } }))
      .gmailLabelId
    gmail.relabel(id, [indus])
    await sync.syncMailbox({ mailboxId, reason: 'push' }, deps())
    expect(emitted).toEqual([])
    gmail.relabel(id, ['SPAM'], ['INBOX'])
    await sync.syncMailbox({ mailboxId, reason: 'push' }, deps())
    expect(emitted.map((e) => [e.name, e.data.added, e.data.removed])).toEqual([
      ['ops/mail.labels.changed', ['SPAM'], ['INBOX']],
    ])
  })

  it('never moves the cursor backwards', async () => {
    gmail.deliver({ from: 'a@example.test', to: [ADDRESS], subject: 'Hi' })
    await sync.syncMailbox({ mailboxId, reason: 'push' }, deps())
    const at = await cursor()
    expect(sync.isNewer('5', at)).toBe(false)
    await db.mailboxSyncState.update({
      where: { mailboxId },
      data: { historyId: String(BigInt(at!) + 50n) },
    })
    // Gmail answers with an older historyId than the one stored (a replayed notification after a later sync).
    await sync.syncMailbox({ mailboxId, reason: 'push', notifiedHistoryId: '1' }, deps())
    expect(await cursor()).toBe(String(BigInt(at!) + 50n))
  })

  it('a 404 runs the bounded resync: only ids not already stored, cursor from the profile', async () => {
    const known = gmail.deliver({
      from: 'a@example.test',
      to: [ADDRESS],
      subject: 'Known',
      internalDate: new Date(),
    })
    const fresh = gmail.deliver({
      from: 'b@example.test',
      to: [ADDRESS],
      subject: 'Fresh',
      internalDate: new Date(),
    })
    const thread = await db.mailThread.create({
      data: { mailboxId, gmailThreadId: 'thr-known', subject: 'Known', lastMessageAt: new Date() },
    })
    await db.mailMessage.create({
      data: {
        mailboxId,
        threadId: thread.id,
        gmailMessageId: known,
        direction: 'inbound',
        fromAddress: 'a@example.test',
        sentAt: new Date(),
      },
    })
    await db.mailboxSyncState.update({
      where: { mailboxId },
      data: { lastSuccessfulSyncAt: new Date(Date.now() - 3600_000) },
    })
    gmail.historyFloor = Number(gmail.currentHistoryId) + 1
    const res = await sync.syncMailbox({ mailboxId, reason: 'poll' }, deps())
    expect(res).toMatchObject({ kind: 'resynced', fetched: 1, skippedKnown: 1 })
    expect(fetchIds()).toEqual([fresh])
    expect(await cursor()).toBe(gmail.currentHistoryId)
    expect((await db.mailbox.findUniqueOrThrow({ where: { id: mailboxId } })).status).toBe('live')
  })

  it('while paused, records the notification and reads nothing', async () => {
    gmail.deliver({ from: 'a@example.test', to: [ADDRESS], subject: 'Hi' })
    const before = await cursor()
    const res = await sync.syncMailbox(
      { mailboxId, reason: 'push' },
      { ...deps(), paused: async () => true }
    )
    expect(res.kind).toBe('paused')
    expect(gmail.calls).not.toContain('history.list')
    expect(await cursor()).toBe(before)
    expect(
      (await db.mailboxSyncState.findUniqueOrThrow({ where: { mailboxId } })).lastPushAt
    ).not.toBeNull()
  })

  it('the safety poll picks only mailboxes with no successful sync in 10 minutes', async () => {
    await db.mailboxSyncState.update({
      where: { mailboxId },
      data: { lastSuccessfulSyncAt: new Date() },
    })
    expect(await poll.staleMailboxAddresses()).not.toContain(ADDRESS)
    await db.mailboxSyncState.update({
      where: { mailboxId },
      data: { lastSuccessfulSyncAt: new Date(Date.now() - 11 * 60_000) },
    })
    expect(await poll.staleMailboxAddresses()).toContain(ADDRESS)
    await db.mailbox.update({ where: { id: mailboxId }, data: { status: 'token_expired' } })
    expect(await poll.staleMailboxAddresses()).not.toContain(ADDRESS)
  })
})
