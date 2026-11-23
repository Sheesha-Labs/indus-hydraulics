import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Message fetch, attachment storage and the backfill against the local database (S04-T05). Gmail is the
 * in-memory fake behind the real client; Storage is in memory. Skips without a local DATABASE_URL.
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

const ADDRESS = 's04-test-fetch@example.test'

/** A STORED (uncompressed) zip with `n` empty entries, enough to exercise the entry-count guard. */
function zipWithEntries(n: number): Buffer {
  const locals: Buffer[] = []
  const centrals: Buffer[] = []
  let offset = 0
  for (let i = 0; i < n; i += 1) {
    const name = Buffer.from(`f${i}.txt`)
    const local = Buffer.alloc(30 + name.length)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(name.length, 26)
    name.copy(local, 30)
    const central = Buffer.alloc(46 + name.length)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(20, 4)
    central.writeUInt16LE(20, 6)
    central.writeUInt16LE(name.length, 28)
    central.writeUInt32LE(offset, 42)
    name.copy(central, 46)
    locals.push(local)
    centrals.push(central)
    offset += local.length
  }
  const cd = Buffer.concat(centrals)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(n, 8)
  end.writeUInt16LE(n, 10)
  end.writeUInt32LE(cd.length, 12)
  end.writeUInt32LE(offset, 16)
  return Buffer.concat([...locals, cd, end])
}

describe.skipIf(!DB_URL)('gmail fetch and backfill · local database', () => {
  process.env.APP_ENV = 'test'
  let db: typeof import('@indus/ops-db').opsDb
  let fetch: typeof import('./fetch')
  let backfill: typeof import('./backfill')
  let client: typeof import('./client')
  let storage: typeof import('../storage/storage')
  let FakeGmail: typeof import('./testing/fake-gmail').FakeGmail
  let gmail: InstanceType<typeof FakeGmail>
  let mailboxId = ''
  const objects = new Map<string, Uint8Array>()
  const api = () =>
    client.createGmailClient({
      mailboxId,
      budget: 'backfill',
      accessToken: async () => 'test',
      indusLabelIds: async () => new Set<string>(),
      transport: () => gmail,
    })

  async function ingest(id: string, origin: 'live' | 'backfill' = 'live') {
    const parsed = await fetch.fetchParsed(mailboxId, id, origin, api())
    const stored = await fetch.storeMessage(mailboxId, parsed, origin)
    const results = []
    for (const meta of stored.attachments) {
      results.push(
        await fetch.storeAttachment(
          {
            mailboxId,
            messageId: stored.messageId,
            gmailId: id,
            internalDate: parsed.internalDate,
            meta,
          },
          api()
        )
      )
    }
    if (parsed.html) {
      await fetch.storeBodyHtml({
        mailboxId,
        messageId: stored.messageId,
        gmailId: id,
        internalDate: parsed.internalDate,
        html: parsed.html,
        cidMap: {},
      })
    }
    return { stored, results }
  }

  beforeAll(async () => {
    ;({ opsDb: db } = await import('@indus/ops-db'))
    fetch = await import('./fetch')
    backfill = await import('./backfill')
    client = await import('./client')
    storage = await import('../storage/storage')
    ;({ FakeGmail } = await import('./testing/fake-gmail'))
    storage.setStorageForTests({
      kind: 'local',
      createSignedUploadUrl: async () => ({ url: 'https://storage.test/u' }),
      createSignedUrl: async () => null,
      openRead: async () => null,
      remove: async () => undefined,
      upload: async (b, k, bytes) => {
        const key = `${b}/${k}`
        if (objects.has(key)) return { existed: true }
        objects.set(key, bytes)
        return { existed: false }
      },
    })
  })

  beforeEach(async () => {
    objects.clear()
    await db.storedFile.deleteMany({ where: { bucket: 'ops-mail', path: { contains: 's04test' } } })
    await db.mailbox.deleteMany({ where: { address: { startsWith: 's04-test-fetch' } } })
    const m = await db.mailbox.create({
      data: {
        address: ADDRESS,
        displayName: 'fetch',
        role: 'supplier',
        status: 'live',
        sendAsAliases: ['alias@example.test'],
      },
    })
    mailboxId = m.id
    await db.mailboxSyncState.create({ data: { mailboxId } })
    gmail = new FakeGmail(ADDRESS)
  })

  afterAll(async () => {
    storage.setStorageForTests(null)
    await db.mailbox.deleteMany({ where: { address: { startsWith: 's04-test-fetch' } } })
    await db.$disconnect()
  })

  it('stores a message once: re-fetching creates no second row', async () => {
    const id = gmail.deliver({
      from: 'rfq@example.test',
      to: [ADDRESS],
      subject: 'Quote',
      text: 'Price “12.50” – each',
    })
    const first = await ingest(id)
    const again = await ingest(id)
    expect(first.stored.created).toBe(true)
    expect(again.stored).toMatchObject({ created: false, messageId: first.stored.messageId })
    const row = await db.mailMessage.findUniqueOrThrow({ where: { id: first.stored.messageId } })
    expect(row.bodyText).toBe('Price "12.50" - each')
    expect(row.bodyTextHash).toMatch(/^[0-9a-f]{64}$/)
    expect([row.direction, row.origin]).toEqual(['inbound', 'live'])
    expect(await db.mailMessage.count({ where: { mailboxId } })).toBe(1)
  })

  it('outbound when SENT or from one of the mailbox addresses', async () => {
    const sent = gmail.deliver({
      from: ADDRESS,
      to: ['buyer@example.test'],
      subject: 'Reply',
      labelIds: ['SENT'],
    })
    const alias = gmail.deliver({
      from: 'alias@example.test',
      to: ['buyer@example.test'],
      subject: 'Alias',
      labelIds: ['INBOX'],
    })
    for (const id of [sent, alias]) {
      const { stored } = await ingest(id)
      expect(
        (await db.mailMessage.findUniqueOrThrow({ where: { id: stored.messageId } })).direction
      ).toBe('outbound')
    }
  })

  it('the same attachment in two messages is one stored file; HTML is stored sanitised', async () => {
    const pdf = Buffer.from('%PDF-1.4 example s04test')
    const a = gmail.deliver({
      from: 'rfq@example.test',
      to: [ADDRESS],
      subject: 'One',
      html: '<p>Hi<script>x()</script><img src="https://tracker.example.test/a.png"></p>',
      attachments: [{ filename: 'Quote s04test.pdf', mimeType: 'application/pdf', data: pdf }],
    })
    const b = gmail.deliver({
      from: 'boss@example.test',
      to: [ADDRESS],
      subject: 'Fwd: One',
      attachments: [{ filename: 'Quote s04test.pdf', mimeType: 'application/pdf', data: pdf }],
    })
    const first = await ingest(a)
    const second = await ingest(b)
    expect(first.results[0]?.reused).toBe(false)
    expect(second.results[0]).toMatchObject({ reused: true, fileId: first.results[0]?.fileId })
    const html = [...objects.entries()].find(([k]) => k.endsWith('/body.html'))?.[1]
    const text = Buffer.from(html ?? new Uint8Array()).toString('utf8')
    expect(text).not.toMatch(/script|tracker/)
    expect(text).toContain('data-blocked')
    const path = [...objects.keys()].find((k) => k.endsWith('.pdf'))!
    expect(path).toMatch(
      new RegExp(`^ops-mail/${mailboxId}/\\d{4}/\\d{2}/${a}/[0-9a-f]{16}-Quote-s04test\\.pdf$`)
    )
  })

  it('a zip with too many entries is stored but never expanded', async () => {
    const id = gmail.deliver({
      from: 'rfq@example.test',
      to: [ADDRESS],
      subject: 'Archive',
      attachments: [
        {
          filename: 'drawings-s04test.zip',
          mimeType: 'application/zip',
          data: zipWithEntries(201),
        },
      ],
    })
    const { results } = await ingest(id)
    const att = await db.mailAttachment.findUniqueOrThrow({
      where: { id: results[0]!.attachmentRowId },
    })
    expect(att.extractionStatus).toBe('unsupported')
    expect(att.extractionNote).toContain('more than 200 files')
  })

  it('backfill: counts per month, drops lists, bulk and excluded senders on metadata, queues the rest, shows an ETA', async () => {
    const now = new Date()
    const recent = new Date(now.getTime() - 2 * 86_400_000)
    gmail.deliver({
      from: 'Buyer <buyer@example.test>',
      to: [ADDRESS],
      subject: 'Order',
      internalDate: recent,
    })
    gmail.deliver({
      from: 'news@lists.example.test',
      to: [ADDRESS],
      subject: 'Newsletter',
      internalDate: recent,
      headers: { 'List-Id': '<n.example.test>' },
    })
    gmail.deliver({
      from: 'promo@example.test',
      to: [ADDRESS],
      subject: 'Promo',
      internalDate: recent,
      headers: { Precedence: 'bulk' },
    })
    gmail.deliver({
      from: 'family@private.example.test',
      to: [ADDRESS],
      subject: 'Dinner',
      internalDate: recent,
    })
    const stored = gmail.deliver({
      from: 'old@example.test',
      to: [ADDRESS],
      subject: 'Already here',
      internalDate: recent,
    })
    await ingest(stored)

    await backfill.startBackfill(mailboxId, 1, now)
    const queued: string[] = []
    const deps = {
      gmail: api(),
      emit: async (events: readonly { data: Record<string, unknown> }[]) => {
        queued.push(...events.map((e) => String(e.data.gmailId)))
        return events.length
      },
      exclusions: { addresses: [], domains: ['private.example.test'] },
    }
    let guard = 0
    let result = await backfill.backfillStep(mailboxId, deps)
    while (!result.done && guard++ < 10) result = await backfill.backfillStep(mailboxId, deps)
    expect(result.state?.phase).toBe('done')
    const m = await db.mailbox.findUniqueOrThrow({ where: { id: mailboxId } })
    expect(m.backfillTotal).toBe(5)
    expect(result.state).toMatchObject({ queued: 1, skipped: 3, alreadyStored: 1, etaMinutes: 0 })
    expect(queued).toHaveLength(1)
    // Exclusions happen on metadata: no full read of the dropped messages.
    const fullReads = gmail.calls.filter((c) => c === 'messages.get').length
    expect(fullReads).toBe(
      1 /* ingest of the stored one */ + 4 /* metadata of the four not stored */
    )
  })

  it('a paused backfill stops; resume continues from the stored position', async () => {
    gmail.deliver({
      from: 'buyer@example.test',
      to: [ADDRESS],
      subject: 'Order',
      internalDate: new Date(),
    })
    await backfill.startBackfill(mailboxId, 2, new Date())
    await backfill.backfillStep(mailboxId, {
      gmail: api(),
      emit: async () => 0,
      exclusions: { addresses: [], domains: [] },
    })
    await backfill.pauseBackfill(mailboxId)
    expect((await backfill.backfillStep(mailboxId, { gmail: api() })).done).toBe(true)
    const before = (await db.mailboxSyncState.findUniqueOrThrow({ where: { mailboxId } }))
      .backfillState as { index: number }
    expect(await backfill.resumeBackfill(mailboxId)).toBe(true)
    const after = (await db.mailboxSyncState.findUniqueOrThrow({ where: { mailboxId } }))
      .backfillState as { index: number; phase: string }
    expect([after.index, after.phase]).toEqual([before.index, 'counting'])
  })

  it('ETA: remaining messages × 80 units at 3,000 a minute', () => {
    expect(backfill.UNITS_PER_MESSAGE).toBe(80)
    expect(
      backfill.backfillEta({ listed: 1000, queued: 0, skipped: 0, alreadyStored: 0 }, 1000)
    ).toBe(27)
  })
})
