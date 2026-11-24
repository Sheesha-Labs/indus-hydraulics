import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildQueueWorld,
  CLIENT,
  cleanQueue,
  localDatabaseUrl,
  memoryStorage,
  type QueueWorld,
  allowTestRecipient,
  disallowTestRecipient,
} from './testing/fixture'

/**
 * Boards 85 and 87 services against the local database (S04-T07): mailbox role, permissions and pause; the
 * send envelope for every seeded kind; saving a rules row; signatures; the test email. Skips without a DB.
 */
const DB_URL = localDatabaseUrl()

vi.mock('@sentry/nextjs', () => ({
  withScope: (fn: (scope: { setTag: () => void }) => void) => fn({ setTag: () => undefined }),
  captureException: () => undefined,
}))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: () => undefined,
  revalidatePath: () => undefined,
}))
vi.mock('../../inngest/emit', () => ({
  emitEvent: async () => true,
  emitEventOrThrow: async () => undefined,
}))

const TAG = 'settings'
const SEND = 'https://www.googleapis.com/auth/gmail.send'
const MODIFY = 'https://www.googleapis.com/auth/gmail.modify'
const LABELS = 'https://www.googleapis.com/auth/gmail.labels'

describe.skipIf(!DB_URL)('mailbox and sending settings · local database', () => {
  process.env.APP_ENV = 'test'
  let db: typeof import('@indus/ops-db').opsDb
  let admin: typeof import('../gmail/mailbox-admin')
  let envelope: typeof import('./envelope')
  let rules: typeof import('./sending-rules')
  let testSend: typeof import('./test-send')
  let storage: typeof import('../storage/storage')
  let world: QueueWorld
  let snapshot: Awaited<ReturnType<typeof db.sendingRule.findMany>> = []
  const tx = <T>(fn: (t: import('@indus/ops-db').Prisma.TransactionClient) => Promise<T>) =>
    db.$transaction(fn)

  beforeAll(async () => {
    ;({ opsDb: db } = await import('@indus/ops-db'))
    admin = await import('../gmail/mailbox-admin')
    envelope = await import('./envelope')
    rules = await import('./sending-rules')
    testSend = await import('./test-send')
    storage = await import('../storage/storage')
    storage.setStorageForTests(memoryStorage(new Map()))
    snapshot = await db.sendingRule.findMany()
  })

  beforeEach(async () => {
    world = await buildQueueWorld(db, TAG)
    await db.mailbox.updateMany({
      where: { id: { in: [world.salesId, world.purchaseId] } },
      data: { scopes: ['openid', 'email', MODIFY, LABELS, SEND], canRead: true, canLabel: true },
    })
  })

  afterAll(async () => {
    await disallowTestRecipient(db, CLIENT)
    // Put every rule back as it was (rows are shared with the other files).
    for (const r of snapshot) {
      const { kind, updatedAt: _u, ...data } = r
      await db.sendingRule.update({ where: { kind }, data })
    }
    storage.setStorageForTests(null)
    await cleanQueue(db, TAG)
    await db.$disconnect()
  })

  describe('board 85 · mailbox', () => {
    it('archive can never be enabled', async () => {
      await expect(
        tx((t) =>
          admin.setMailboxPermissions(t, world.salesId, {
            read: true,
            drafts: false,
            send: true,
            labels: true,
            archive: true,
          })
        )
      ).rejects.toThrow('Archive is always off')
    })

    it('a Read-only mailbox cannot send; choosing that role turns Send off', async () => {
      const out = await tx((t) => admin.setMailboxRole(t, world.salesId, 'read_only'))
      expect(out).toEqual({ before: 'client', after: 'read_only', sendTurnedOff: true })
      expect((await db.mailbox.findUniqueOrThrow({ where: { id: world.salesId } })).canSend).toBe(
        false
      )
      await expect(
        tx((t) =>
          admin.setMailboxPermissions(t, world.salesId, {
            read: true,
            drafts: false,
            send: true,
            labels: true,
          })
        )
      ).rejects.toThrow('never send')
    })

    it('a permission Google did not grant stays off; reading is needed for the rest', async () => {
      await db.mailbox.update({
        where: { id: world.salesId },
        data: { scopes: ['openid', MODIFY] },
      })
      await expect(
        tx((t) =>
          admin.setMailboxPermissions(t, world.salesId, {
            read: true,
            drafts: false,
            send: true,
            labels: false,
          })
        )
      ).rejects.toThrow('Google did not grant send')
      await db.mailbox.update({
        where: { id: world.salesId },
        data: { scopes: [MODIFY, LABELS, SEND] },
      })
      await expect(
        tx((t) =>
          admin.setMailboxPermissions(t, world.salesId, {
            read: false,
            drafts: false,
            send: true,
            labels: false,
          })
        )
      ).rejects.toThrow('Reading is needed')
      const ok = await tx((t) =>
        admin.setMailboxPermissions(t, world.salesId, {
          read: true,
          drafts: true,
          send: false,
          labels: true,
        })
      )
      expect(ok.after).toEqual({ read: true, drafts: true, send: false, labels: true })
    })

    it('pause keeps who and when; resume returns to the state it left', async () => {
      await db.mailbox.update({ where: { id: world.salesId }, data: { status: 'behind' } })
      await tx((t) => admin.pauseMailboxReading(t, world.salesId, world.ownerId))
      const paused = await db.mailbox.findUniqueOrThrow({ where: { id: world.salesId } })
      expect(paused).toMatchObject({
        status: 'paused',
        pausedById: world.ownerId,
        statusReason: 'paused_from:behind',
      })
      expect(paused.pausedAt).not.toBeNull()
      const resumed = await tx((t) => admin.resumeMailboxReading(t, world.salesId))
      expect(resumed?.after).toBe('behind')
      expect(await db.mailbox.findUniqueOrThrow({ where: { id: world.salesId } })).toMatchObject({
        status: 'behind',
        pausedAt: null,
        pausedById: null,
      })
      expect(await tx((t) => admin.resumeMailboxReading(t, world.salesId))).toBeNull()
    })

    it('a disconnected mailbox cannot be paused (reconnect first)', async () => {
      await db.mailbox.update({ where: { id: world.salesId }, data: { status: 'token_expired' } })
      await expect(
        tx((t) => admin.pauseMailboxReading(t, world.salesId, world.ownerId))
      ).rejects.toThrow('Reconnect')
    })
  })

  describe('resolveSendEnvelope', () => {
    it('every seeded kind resolves to a mailbox of its rule role, never Read-only or Personal', async () => {
      for (const rule of snapshot) {
        const out = await envelope.resolveSendEnvelope(rule.kind)
        expect(out.ok, rule.kind).toBe(true)
        if (!out.ok) continue
        // Another file's mailbox may be the oldest of that role, and gone by the time we look.
        const box = await db.mailbox.findUnique({ where: { id: out.envelope.mailboxId } })
        if (!box) continue
        expect([rule.kind, box.role]).toEqual([rule.kind, rule.fromRole])
        expect(out.envelope.threadMode).toBe(rule.threadMode)
        expect(out.envelope.holdMinutes).toBeGreaterThan(0)
      }
    })

    it('supplier mail copies the client mailbox; invoices name the accounts contact or say it is missing', async () => {
      const rfq = await envelope.resolveSendEnvelope('supplier_rfq')
      expect(rfq.ok && rfq.envelope.cc.length).toBe(1)
      const invoice = await envelope.resolveSendEnvelope('invoice', {
        accountsContactEmail: 'Accounts@Client.example.test',
      })
      expect(invoice.ok && invoice.envelope.cc).toEqual(['accounts@client.example.test'])
      const none = await envelope.resolveSendEnvelope('payment_reminder')
      expect(none.ok && none.envelope.notes).toContain('no_accounts_contact')
    })

    it("'other' needs the person's mailbox, and a Read-only one is refused", async () => {
      expect(await envelope.resolveSendEnvelope('other')).toMatchObject({
        ok: false,
        reason: 'mailbox_required',
      })
      await db.mailbox.update({ where: { id: world.purchaseId }, data: { role: 'read_only' } })
      expect(
        await envelope.resolveSendEnvelope('other', { mailboxId: world.purchaseId })
      ).toMatchObject({
        ok: false,
        reason: 'role_cannot_send',
      })
    })

    it('a thread in the other mailbox is not used; a new message starts and says why', async () => {
      const thread = await db.mailThread.create({
        data: { mailboxId: world.purchaseId, gmailThreadId: `thr-${TAG}-${Date.now()}` },
      })
      const out = await envelope.resolveSendEnvelope('other', {
        mailboxId: world.salesId,
        threadId: thread.id,
      })
      expect(out.ok && out.envelope.threadId).toBeNull()
      expect(out.ok && out.envelope.notes).toContain('thread_in_other_mailbox')
      const own = await db.mailThread.create({
        data: { mailboxId: world.salesId, gmailThreadId: `thr-${TAG}-own-${Date.now()}` },
      })
      const mine = await envelope.resolveSendEnvelope('other', {
        mailboxId: world.salesId,
        threadId: own.id,
      })
      expect(mine.ok && mine.envelope.threadId).toBe(own.id)
    })

    it('signature: the saved block wins over the Gmail one; none → the mailbox signature', async () => {
      await db.mailbox.update({
        where: { id: world.salesId },
        data: { ownerUserId: world.helperId },
      })
      const gmailOnly = await envelope.resolveSendEnvelope('other', { mailboxId: world.salesId })
      expect(gmailOnly.ok && gmailOnly.envelope.signature?.text).toContain('Example Trading LLC')
      const block = rules.signatureFromLines(
        ['Best regards,', 'Helper Example', 'Sourcing'],
        'Helper Example'
      )
      expect(block.html).toContain('<b>Helper Example</b>')
      const entry = await db.settingsEntry.findUniqueOrThrow({ where: { key: 'send.signatures' } })
      await db.settingsEntry.update({
        where: { key: 'send.signatures' },
        data: { value: { ...(entry.value as object), [world.helperId]: block } },
      })
      try {
        const saved = await envelope.resolveSendEnvelope('other', { mailboxId: world.salesId })
        expect(saved.ok && saved.envelope.signature?.text).toBe(
          'Best regards,\nHelper Example\nSourcing'
        )
      } finally {
        await db.settingsEntry.update({
          where: { key: 'send.signatures' },
          data: { value: entry.value ?? {} },
        })
      }
    })
  })

  describe('board 87 · rules', () => {
    it('saving a row writes every kind in it and signs the default off', async () => {
      const out = await tx((t) =>
        rules.saveSendingRuleRow(
          t,
          'quotation',
          {
            fromRole: 'client',
            cc: 'supplier',
            signatureUserId: world.ownerId,
            threadMode: 'client_thread',
          },
          world.ownerId
        )
      )
      expect(out.kinds).toEqual(['quotation', 'quotation_correction'])
      const rows = await db.sendingRule.findMany({
        where: { kind: { in: ['quotation', 'quotation_correction'] } },
      })
      expect(rows.every((r) => r.ccRole === 'supplier' && r.signoffStatus === 'signed_off')).toBe(
        true
      )
      expect(rows.every((r) => r.signedOffById === world.ownerId)).toBe(true)
    })

    it('refuses a CC to the sending mailbox itself and an unknown row', async () => {
      await expect(
        tx((t) =>
          rules.saveSendingRuleRow(
            t,
            'supplier_rfq',
            {
              fromRole: 'supplier',
              cc: 'supplier',
              signatureUserId: null,
              threadMode: 'new_thread_per_recipient',
            },
            world.ownerId
          )
        )
      ).rejects.toThrow('CC the other mailbox')
      await expect(
        tx((t) =>
          rules.saveSendingRuleRow(
            t,
            'nope',
            { fromRole: 'client', cc: 'none', signatureUserId: null, threadMode: 'new_thread' },
            world.ownerId
          )
        )
      ).rejects.toThrow('does not exist')
    })

    it('daily caps save per mailbox', async () => {
      const out = await tx((t) => rules.saveDailyCaps(t, [{ mailboxId: world.salesId, cap: 25 }]))
      expect(out).toEqual([{ mailboxId: world.salesId, before: 40, after: 25 }])
    })
  })

  describe('test email', () => {
    it('refuses an address not on the test list; queues one on it, in the latest thread when asked', async () => {
      await disallowTestRecipient(db, CLIENT)
      await expect(
        testSend.sendTestEmail({
          userId: world.ownerId,
          mailboxId: world.salesId,
          to: CLIENT,
          mode: 'new',
        })
      ).rejects.toThrow('test list')
      await allowTestRecipient(db, CLIENT)
      const thread = await db.mailThread.create({
        data: { mailboxId: world.salesId, gmailThreadId: `thr-${TAG}-test-${Date.now()}` },
      })
      await db.mailMessage.create({
        data: {
          mailboxId: world.salesId,
          threadId: thread.id,
          gmailMessageId: `gm-${TAG}-${Date.now()}`,
          direction: 'inbound',
          fromAddress: CLIENT,
          toAddresses: [],
          subject: 'Earlier note',
          sentAt: new Date(),
          rfcMessageId: '<earlier@client.example.test>',
        },
      })
      const out = await testSend.sendTestEmail({
        userId: world.ownerId,
        mailboxId: world.salesId,
        to: CLIENT,
        mode: 'reply',
      })
      expect(out).toMatchObject({ status: 'scheduled', threaded: true })
      const row = await db.outboundEmail.findUniqueOrThrow({ where: { id: out.outboundId } })
      expect(row).toMatchObject({
        kind: 'other',
        threadId: thread.id,
        inReplyToRfcId: '<earlier@client.example.test>',
        subject: 'Re: Earlier note',
        approvedById: world.ownerId,
      })
    })
  })
})
