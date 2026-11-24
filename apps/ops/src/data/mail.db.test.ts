import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { buildQueueWorld, cleanQueue, localDatabaseUrl, type QueueWorld } from '../server/mail-send/testing/fixture'

/**
 * Mail page reads (S05-T05, board 91) on the local database: keyset pages of 50, folder and type filters,
 * live mail by default and past mail on request, and one conversation merged across both mailboxes with
 * sanitized bodies only.
 */
const DB_URL = localDatabaseUrl()
const TAG = 'mview'

vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: () => undefined,
  revalidatePath: () => undefined,
}))

describe.skipIf(!DB_URL)('mail data · local database', () => {
  let db: typeof import('@indus/ops-db').opsDb
  let mail: typeof import('./mail')
  let world: QueueWorld
  const subjects = `mview-${randomUUID().slice(0, 6)}`

  async function thread(mailboxId: string, i: number, over: Record<string, unknown> = {}, rfc?: string, refs: string[] = []) {
    const at = new Date(Date.now() - i * 60_000)
    const t = await db.mailThread.create({
      data: { mailboxId, gmailThreadId: `${subjects}-t${i}-${mailboxId.slice(0, 4)}`, subject: `${subjects} ${i}`, lastMessageAt: at },
      select: { id: true },
    })
    await db.mailMessage.create({
      data: {
        mailboxId,
        threadId: t.id,
        gmailMessageId: `${subjects}-m${i}-${mailboxId.slice(0, 4)}`,
        rfcMessageId: rfc ?? `${subjects}-${i}-${randomUUID()}@example.test`,
        referencesRfcIds: refs,
        direction: 'inbound',
        fromAddress: `sender${i}@example.test`,
        toAddresses: ['sales@example.test'],
        ccAddresses: [],
        subject: `${subjects} ${i}`,
        bodyText: `Body ${i} <script>alert(1)</script>`,
        sentAt: at,
        labelsApplied: [],
        origin: 'live',
        classification: 'client_enquiry',
        confidence: 'sure',
        handledState: 'not_linked',
        ...over,
      },
    })
    return t.id
  }

  beforeAll(async () => {
    ;({ opsDb: db } = await import('@indus/ops-db'))
    mail = await import('./mail')
    world = await buildQueueWorld(db, TAG)
    for (let i = 1; i <= 55; i++) await thread(world.salesId, i)
    await thread(world.purchaseId, 60, { classification: 'supplier_quote', handledState: 'handled' })
    await thread(world.salesId, 61, { origin: 'backfill' })
    await thread(world.salesId, 62, { classification: 'unclassified', confidence: 'unsure', handledState: 'unsure' })
  })

  afterAll(async () => {
    await cleanQueue(db, TAG)
    await db.$disconnect()
  })

  const mine = <R extends { subject: string }>(rows: R[]): R[] => rows.filter((r) => r.subject.startsWith(subjects))

  it('pages the sales@ folder 50 at a time, newest first, with a cursor to the rest', async () => {
    const first = await mail.listThreads('sales', { q: subjects })
    expect(mine(first.rows)).toHaveLength(50)
    expect(first.rows[0]!.subject).toBe(`${subjects} 1`)
    expect(first.nextCursor).toBeTruthy()
    const second = await mail.listThreads('sales', { q: subjects, cursor: first.nextCursor! })
    const all = [...first.rows, ...second.rows].map((r) => r.subject)
    expect(new Set(all).size).toBe(all.length)
    // 55 live + the unsure one; the backfilled one is hidden
    expect(mine(second.rows).length).toBe(6)
    expect(all).not.toContain(`${subjects} 61`)
  })

  it('past=1 shows backfilled history; folders and types filter', async () => {
    const past = await mail.listThreads('sales', { q: `${subjects} 61`, past: true })
    expect(mine(past.rows).map((r) => r.subject)).toEqual([`${subjects} 61`])
    const purchase = await mail.listThreads('purchase', { q: subjects })
    expect(mine(purchase.rows).map((r) => r.subject)).toEqual([`${subjects} 60`])
    const quotes = await mail.listThreads('all', { q: subjects, type: 'supplier-quote' })
    expect(mine(quotes.rows).map((r) => r.type)).toEqual(['Supplier quote'])
    const unsure = await mail.listThreads('unsure', { q: subjects })
    expect(mine(unsure.rows)).toMatchObject([{ subject: `${subjects} 62`, type: 'Unsure', senderRole: 'Unknown' }])
  })

  it('merges a conversation across both mailboxes and serves only sanitized bodies', async () => {
    const root = `${subjects}-root@example.test`
    const salesThread = await thread(world.salesId, 70, {}, root)
    await thread(world.purchaseId, 71, { classification: 'supplier_quote' }, undefined, [root])
    const owner = await db.user.findUniqueOrThrow({ where: { id: world.ownerId } })
    const view = await mail.getThread(salesThread, owner as never)
    expect(view).not.toBeNull()
    expect(view!.messages.map((m) => m.subject).sort()).toEqual([`${subjects} 70`, `${subjects} 71`])
    expect(new Set(view!.messages.map((m) => m.mailbox)).size).toBe(2)
    expect(view!.crossMailbox).toMatch(/This conversation is in/)
    for (const m of view!.messages) expect(m.bodyHtml).not.toContain('<script')
    expect(view!.gmailUrl).toMatch(/^https:\/\/mail\.google\.com\/mail\/u\/\?authuser=/)
    expect(await mail.getThread(randomUUID(), owner as never)).toBeNull()
  })

  it('counts today’s live mail by mailbox, type and status', async () => {
    const counts = await mail.folderCounts()
    expect(counts.mailbox.all).toBeGreaterThanOrEqual(56)
    expect(counts.type['new-enquiry']).toBeGreaterThanOrEqual(55)
    expect(counts.mailbox.all).toBe(counts.today)
  })
})
