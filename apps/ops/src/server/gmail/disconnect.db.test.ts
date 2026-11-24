import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildQueueWorld,
  CLIENT,
  cleanQueue,
  localDatabaseUrl,
  memoryStorage,
  type QueueWorld,
} from '../mail-send/testing/fixture'

/**
 * Board 89/90 services against the local database (S04-T08): notifications (locked events, preferences,
 * resolve), losing a token, Disconnect (keep and delete), the purge in batches with its receipt, and the
 * system banners. Skips without a local DATABASE_URL.
 */
const DB_URL = localDatabaseUrl()

vi.mock('@sentry/nextjs', () => ({
  withScope: (fn: (scope: { setTag: () => void }) => void) => fn({ setTag: () => undefined }),
  captureException: () => undefined,
  captureMessage: () => undefined,
}))
// The pause row is shared (pause.db.test toggles it); this file is not about it.
vi.mock('../assistant/pause', () => ({
  isAssistantPaused: async () => false,
  assistantPauseState: async () => null,
}))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: () => undefined,
  revalidatePath: () => undefined,
}))

const TAG = 'disconnect'

describe.skipIf(!DB_URL)('disconnect, notifications and banners · local database', () => {
  process.env.APP_ENV = 'test'
  // A throwaway test key (32 zero bytes): the sealed refresh token below only has to open again here.
  process.env.OPS_TOKEN_KEYS = JSON.stringify({ t1: Buffer.alloc(32).toString('base64') })
  process.env.OPS_TOKEN_KEY_ACTIVE = 't1'
  let db: typeof import('@indus/ops-db').opsDb
  let raise: typeof import('../notify/raise')
  let notifyMailbox: typeof import('../notify/mailbox')
  let tokens: typeof import('./tokens')
  let disconnect: typeof import('./disconnect')
  let purge: typeof import('./purge')
  let banners: typeof import('../../data/banners')
  let schedule: typeof import('../mail-send/schedule')
  let crypto: typeof import('./tokens')
  let storage: typeof import('../storage/storage')
  let world: QueueWorld
  const objects = new Map<string, Uint8Array>()
  const emitted: Array<{ name: string; data: Record<string, unknown> }> = []
  let seq = 0

  const queue = async () => {
    seq += 1
    return schedule.scheduleSend(
      {
        idempotencyKey: `s04q:${TAG}:${Date.now()}:${seq}`,
        kind: 'supplier_rfq',
        mailboxId: world.purchaseId,
        to: ['rfq@supplier.example.test'],
        subject: 'RFQ',
        bodyHtml: '<p>RFQ</p>',
      },
      { emit: async () => undefined }
    )
  }

  /** A message with one attachment file and a body file in the mailbox. */
  async function message(mailboxId: string, threadId: string, i: number) {
    const file = await db.storedFile.create({
      data: {
        bucket: 'ops-mail',
        path: `s04q/${TAG}/att-${Date.now()}-${i}.pdf`,
        filename: `a${i}.pdf`,
        mimeType: 'application/pdf',
        sizeBytes: 3,
        sha256: '1'.repeat(64),
        source: 'gmail_attachment',
      },
    })
    objects.set(`ops-mail/${file.path}`, Buffer.from('pdf'))
    const m = await db.mailMessage.create({
      data: {
        mailboxId,
        threadId,
        gmailMessageId: `gm-${TAG}-${Date.now()}-${i}`,
        direction: 'inbound',
        fromAddress: CLIENT,
        toAddresses: [],
        subject: `Message ${i}`,
        sentAt: new Date(),
      },
    })
    await db.mailAttachment.create({
      data: {
        messageId: m.id,
        gmailAttachmentId: `att${i}`,
        filename: `a${i}.pdf`,
        fileId: file.id,
      },
    })
    return m.id
  }

  beforeAll(async () => {
    ;({ opsDb: db } = await import('@indus/ops-db'))
    raise = await import('../notify/raise')
    notifyMailbox = await import('../notify/mailbox')
    tokens = await import('./tokens')
    crypto = tokens
    disconnect = await import('./disconnect')
    purge = await import('./purge')
    banners = await import('../../data/banners')
    schedule = await import('../mail-send/schedule')
    storage = await import('../storage/storage')
    storage.setStorageForTests(memoryStorage(objects))
  })

  beforeEach(async () => {
    objects.clear()
    emitted.length = 0
    world = await buildQueueWorld(db, TAG)
    await db.mailboxSyncState.update({
      where: { mailboxId: world.purchaseId },
      data: { historyId: '9001' },
    })
  })

  afterAll(async () => {
    storage.setStorageForTests(null)
    await db.notificationPreference.deleteMany({ where: { userId: world.helperId } })
    await cleanQueue(db, TAG)
    await db.$disconnect()
  })

  describe('notifications', () => {
    it('an "off" preference is honoured, except for a locked event', async () => {
      await db.notificationPreference.create({
        data: { userId: world.helperId, event: 'sync_error', channel: 'off' },
      })
      const key = `s04q-${TAG}-${Date.now()}`
      await raise.raiseNotification({
        event: 'sync_error',
        title: 'Sync error',
        dedupeKey: key,
        audience: [world.helperId],
      })
      expect(await db.notification.count({ where: { dedupeKey: key } })).toBe(0)
      await raise.raiseNotification({
        event: 'mailbox_disconnected',
        title: 'Disconnected',
        dedupeKey: `${key}-locked`,
        audience: [world.helperId],
      })
      expect(await db.notification.count({ where: { dedupeKey: `${key}-locked` } })).toBe(1)
    })

    it('one open notification per key; resolve closes it and it may recur', async () => {
      const key = `s04q-${TAG}-dedupe-${Date.now()}`
      const input = {
        event: 'other' as const,
        title: 'x',
        dedupeKey: key,
        audience: [world.helperId],
      }
      await raise.raiseNotification(input)
      await raise.raiseNotification(input)
      expect(await db.notification.count({ where: { dedupeKey: key } })).toBe(1)
      const { resolveNotifications } = await import('../notify/resolve')
      expect(await resolveNotifications(key)).toBe(1)
      await raise.raiseNotification(input)
      expect(await db.notification.count({ where: { dedupeKey: key } })).toBe(2)
    })
  })

  it('a token Google refuses: token_expired, the locked notification once; reconnect resolves it', async () => {
    await db.mailbox.update({ where: { id: world.salesId }, data: { ownerUserId: world.helperId } })
    tokens.setDisconnectedHook(undefined)
    await tokens.markTokenExpired(world.salesId)
    await tokens.markTokenExpired(world.salesId)
    expect((await db.mailbox.findUniqueOrThrow({ where: { id: world.salesId } })).status).toBe(
      'token_expired'
    )
    const key = notifyMailbox.disconnectedKey(world.salesId)
    const open = await db.notification.findMany({ where: { dedupeKey: key, resolvedAt: null } })
    expect(open.length).toBeGreaterThanOrEqual(2) // the Owner and the mailbox owner
    expect(new Set(open.map((n) => n.userId)).size).toBe(open.length)
    expect(open.every((n) => n.event === 'mailbox_disconnected' && n.severity === 'critical')).toBe(
      true
    )
    await notifyMailbox.resolveMailboxDisconnected(world.salesId)
    expect(await db.notification.count({ where: { dedupeKey: key, resolvedAt: null } })).toBe(0)
  })

  it('the Gmail client turns a 401 into token_expired through the mailbox hook', async () => {
    const { createGmailClient } = await import('./client')
    const { FakeGmail } = await import('./testing/fake-gmail')
    const fake = new FakeGmail('x@example.test').failNext(
      'getProfile',
      Object.assign(new Error('401'), { status: 401 })
    )
    let called = 0
    const client = createGmailClient({
      mailboxId: world.salesId,
      budget: 'live',
      accessToken: async () => 't',
      indusLabelIds: async () => new Set(),
      transport: () => fake,
      onUnauthorized: async () => {
        called += 1
      },
    })
    await expect(client.getProfile()).rejects.toMatchObject({
      name: 'MailboxUnavailableError',
      reason: 'token_expired',
    })
    expect(called).toBe(1)
  })

  describe('disconnect', () => {
    it('refuses a typed address that does not match', async () => {
      await expect(
        disconnect.disconnectMailbox({
          mailboxId: world.purchaseId,
          mode: 'keep',
          typed: 'someone@example.test',
          user: { id: world.ownerId, initials: 'OE' },
        })
      ).rejects.toThrow('to confirm')
    })

    it('keep: token revoked and cleared, cursor kept, queued sends wait for THIS mailbox, receipt written', async () => {
      const { sealToBytes, REFRESH_AAD } = crypto
      await db.mailbox.update({
        where: { id: world.purchaseId },
        data: {
          refreshTokenEnc: sealToBytes('refresh-token', REFRESH_AAD(world.purchaseId)).bytes,
        },
      })
      const q = await queue()
      const revoked: string[] = []
      const receipt = await disconnect.disconnectMailbox({
        mailboxId: world.purchaseId,
        mode: 'keep',
        typed: ` ${(await db.mailbox.findUniqueOrThrow({ where: { id: world.purchaseId } })).address.toUpperCase()} `,
        user: { id: world.ownerId, initials: 'OE' },
        deps: {
          revoke: async ({ token }) => (revoked.push(token), true),
          stop: async () => true,
          emit: async (e) => void emitted.push(e as never),
        },
      })
      expect(revoked).toEqual(['refresh-token'])
      expect(receipt).toMatchObject({ mode: 'keep', revoked: true, sendsWaiting: 1 })
      expect(receipt.detail).toContain(
        '1 queued send returned to Review as “Waiting for a Supplier mailbox”.'
      )
      const box = await db.mailbox.findUniqueOrThrow({ where: { id: world.purchaseId } })
      expect(box).toMatchObject({
        status: 'disconnected',
        refreshTokenEnc: null,
        accessTokenEnc: null,
        canSend: false,
      })
      expect(box.disconnectedAt).not.toBeNull()
      expect(
        (await db.mailboxSyncState.findUniqueOrThrow({ where: { mailboxId: world.purchaseId } }))
          .historyId
      ).toBe('9001')
      expect(
        await db.outboundEmail.findUniqueOrThrow({ where: { id: q.outboundId } })
      ).toMatchObject({
        status: 'waiting_for_mailbox',
        mailboxId: world.purchaseId,
        holdReason: 'mailbox',
      })
      const event = await db.activityEvent.findFirst({
        where: { subjectType: 'mailbox', subjectId: world.purchaseId, field: 'connection' },
        orderBy: { at: 'desc' },
      })
      expect(event?.note).toMatch(
        /^OE disconnected s04q-disconnect-purchase@ · kept imported data\. Kept 0 email references/
      )
      expect(emitted).toEqual([])
      expect(
        await db.notification.count({
          where: { dedupeKey: notifyMailbox.disconnectedKey(world.purchaseId), resolvedAt: null },
        })
      ).toBeGreaterThan(0)
    })

    it('delete: asks for the purge; the purge removes messages, attachments, files and threads in batches', async () => {
      const thread = await db.mailThread.create({
        data: { mailboxId: world.purchaseId, gmailThreadId: `thr-${TAG}-${Date.now()}` },
      })
      for (let i = 0; i < 5; i += 1) await message(world.purchaseId, thread.id, i)
      const address = (await db.mailbox.findUniqueOrThrow({ where: { id: world.purchaseId } }))
        .address
      const counts = await disconnect.disconnectCounts(world.purchaseId)
      expect(counts).toEqual({ emails: 5, attachments: 5, supplierQuotes: 0 })
      const receipt = await disconnect.disconnectMailbox({
        mailboxId: world.purchaseId,
        mode: 'delete',
        typed: address,
        user: { id: world.ownerId, initials: 'OE' },
        deps: {
          revoke: async () => false,
          stop: async () => false,
          emit: async (e) => void emitted.push(e as never),
        },
      })
      expect(receipt.detail).toContain('5 emails and 5 attachments are being removed')
      expect(emitted).toMatchObject([
        { name: 'ops/mailbox.purge.requested', data: { mailboxId: world.purchaseId } },
      ])

      const totals = { messages: 0, attachments: 0, files: 0, threads: 0 }
      let batches = 0
      for (;;) {
        batches += 1
        const b = await purge.purgeBatch(world.purchaseId, db, 2)
        for (const k of Object.keys(totals) as Array<keyof typeof totals>) totals[k] += b.totals[k]
        if (b.done) break
      }
      expect(batches).toBeGreaterThanOrEqual(4)
      expect(totals).toEqual({ messages: 5, attachments: 5, files: 5, threads: 1 })
      expect(objects.size).toBe(0)
      expect(await db.mailMessage.count({ where: { mailboxId: world.purchaseId } })).toBe(0)
      await purge.writePurgeReceipt({
        mailboxId: world.purchaseId,
        requestedById: world.ownerId,
        totals,
      })
      const r = await db.activityEvent.findFirst({
        where: { subjectId: world.purchaseId, field: 'purge' },
        orderBy: { at: 'desc' },
      })
      expect(r?.note).toBe(
        `Removed 5 emails, 5 attachments (5 stored files) and 1 conversations imported from ${address}. Gmail was not touched.`
      )
    })
  })

  it('banners: a disconnected mailbox and a queue held for the limit', async () => {
    await db.mailbox.update({
      where: { id: world.salesId },
      data: { status: 'token_expired', disconnectedAt: new Date('2026-11-23T05:12:00Z') },
    })
    const q = await queue()
    await db.outboundEmail.update({
      where: { id: q.outboundId },
      data: { status: 'held', holdReason: 'cap' },
    })
    const list = await banners.getSystemBanners({ id: world.ownerId, initials: 'OE' })
    const mine = list.filter((b) => String(b.props.title ?? '').startsWith('s04q-disconnect-'))
    expect(mine.map((b) => b.kind).sort()).toEqual(['limit-reached', 'mailbox-disconnected'])
    expect(mine.find((b) => b.kind === 'mailbox-disconnected')?.props.title).toBe(
      's04q-disconnect-sales@ disconnected 09:12.'
    )
  })
})
