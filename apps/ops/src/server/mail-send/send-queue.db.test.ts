import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildQueueWorld,
  CLIENT,
  cleanQueue,
  localDatabaseUrl,
  memoryStorage,
  salesAddress,
  storedFile,
  type QueueWorld,
} from './testing/fixture'

/**
 * The send queue end to end against the local database (S04-T06, ADR-07, ADR-11): schedule → undo → slot → gate
 * → claim → send once → reconcile. Gmail is the in-memory fake behind the real client. Skips without a local DB.
 */
const DB_URL = localDatabaseUrl()

vi.mock('@sentry/nextjs', () => ({
  withScope: (fn: (scope: { setTag: () => void }) => void) => fn({ setTag: () => undefined }),
  captureException: () => undefined,
}))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: () => undefined,
}))

const TAG = 'queue'
const SALES = salesAddress(TAG)
const PROD = { APP_ENV: 'production' as const, OPS_SEND_ALLOWLIST: undefined }

describe.skipIf(!DB_URL)('send queue · local database', () => {
  process.env.APP_ENV = 'test'
  let db: typeof import('@indus/ops-db').opsDb
  let schedule: typeof import('./schedule')
  let undo: typeof import('./undo')
  let gate: typeof import('./gate')
  let slot: typeof import('./slot')
  let once: typeof import('./send-once')
  let rec: typeof import('./reconcile')
  let client: typeof import('../gmail/client')
  let storage: typeof import('../storage/storage')
  let FakeGmail: typeof import('../gmail/testing/fake-gmail').FakeGmail
  let fake: InstanceType<typeof FakeGmail>
  let world: QueueWorld
  const objects = new Map<string, Uint8Array>()
  const emitted: Array<{ name: string; id?: string; data: Record<string, unknown> }> = []
  let seq = 0

  const gmail = () =>
    client.createGmailClient({
      mailboxId: world.salesId,
      budget: 'send',
      accessToken: async () => 'test',
      indusLabelIds: async () => new Set<string>(),
      transport: () => fake,
    })
  const sendDeps = () => ({ gmail: gmail(), preflight: async () => undefined })
  const emit = async (e: { name: string; id?: string; data: Record<string, unknown> }) => {
    emitted.push(e)
  }

  type Extra = Partial<import('./schedule').ScheduleInput>
  async function queue(extra: Extra = {}, now = new Date(Date.now() - 10 * 60_000)) {
    seq += 1
    return schedule.scheduleSend(
      {
        idempotencyKey: `s04q:${TAG}:${Date.now()}:${seq}`,
        kind: 'follow_up',
        mailboxId: world.salesId,
        to: [CLIENT],
        subject: 'Your enquiry',
        bodyHtml: '<p>Thank you for your enquiry.</p>',
        createdById: world.ownerId,
        ...extra,
      },
      { emit, now: () => now }
    )
  }
  const row = (id: string) => db.outboundEmail.findUniqueOrThrow({ where: { id } })

  /** What ops.mail.send does after the hold, without Inngest: gate then send once. */
  async function runSend(id: string) {
    const g = await gate.sendGate(id, { env: PROD })
    if (g.kind !== 'go') return { gate: g }
    return { gate: g, result: await once.sendOnce(id, sendDeps()) }
  }

  beforeAll(async () => {
    ;({ opsDb: db } = await import('@indus/ops-db'))
    schedule = await import('./schedule')
    undo = await import('./undo')
    gate = await import('./gate')
    slot = await import('./slot')
    once = await import('./send-once')
    rec = await import('./reconcile')
    client = await import('../gmail/client')
    storage = await import('../storage/storage')
    ;({ FakeGmail } = await import('../gmail/testing/fake-gmail'))
    storage.setStorageForTests(memoryStorage(objects))
  })

  beforeEach(async () => {
    objects.clear()
    emitted.length = 0
    world = await buildQueueWorld(db, TAG)
    fake = new FakeGmail(SALES)
  })

  afterAll(async () => {
    storage.setStorageForTests(null)
    await cleanQueue(db, TAG)
    await db.$disconnect()
  })

  describe('schedule', () => {
    it('holds for the undo setting, proposes a Message-ID and requests one run', async () => {
      const now = new Date()
      const r = await queue({}, now)
      expect(r).toMatchObject({
        status: 'scheduled',
        duplicate: false,
        undoRemainingMs: 5 * 60_000,
      })
      const saved = await row(r.outboundId)
      expect(saved.undoUntil?.getTime()).toBe(now.getTime() + 5 * 60_000)
      expect(saved.proposedRfcMessageId).toBe(`<ops.${r.outboundId}@indushydraulics.me>`)
      expect(emitted).toEqual([
        {
          name: 'ops/mail.send.requested',
          id: `send:${r.outboundId}`,
          data: {
            outboundId: r.outboundId,
            mailboxId: world.salesId,
            undoUntil: saved.undoUntil?.toISOString(),
          },
        },
      ])
      expect(await schedule.undoRemainingMs(r.outboundId, now)).toBe(5 * 60_000)
    })

    it('the same idempotency key twice (double approve) → one row, one request, one Gmail call', async () => {
      const key = `s04q:${TAG}:double:${Date.now()}`
      const [a, b] = await Promise.all([
        queue({ idempotencyKey: key }),
        queue({ idempotencyKey: key }),
      ])
      expect(a.outboundId).toBe(b.outboundId)
      expect([a.duplicate, b.duplicate].sort()).toEqual([false, true])
      expect(await db.outboundEmail.count({ where: { idempotencyKey: key } })).toBe(1)
      expect(emitted).toHaveLength(1)
      // Two runs for the same row (a redelivered event) still send once: the claim is conditional.
      const first = await runSend(a.outboundId)
      const second = await once.sendOnce(a.outboundId, sendDeps())
      expect(first.result?.kind).toBe('sent')
      expect(second.kind).toBe('not_claimed')
      expect(fake.calls.filter((c) => c === 'messages.send')).toHaveLength(1)
    })

    it('refuses a thread from the other mailbox, and a bad recipient', async () => {
      const thread = await db.mailThread.create({
        data: { mailboxId: world.purchaseId, gmailThreadId: `thr-other-${Date.now()}` },
      })
      await expect(queue({ threadId: thread.id })).rejects.toMatchObject({
        code: 'thread_in_other_mailbox',
      })
      await expect(queue({ to: ['not-an-address'] })).rejects.toMatchObject({
        code: 'bad_envelope',
      })
    })
  })

  describe('undo', () => {
    it('inside the window: cancelled, the cancel event, and no Gmail call', async () => {
      const r = await queue({}, new Date())
      const out = await undo.undoSend(r.outboundId, { emit: async (e) => (emitted.push(e), true) })
      expect(out).toEqual({
        success: true,
        data: { outboundId: r.outboundId, alreadyCancelled: false },
      })
      expect((await row(r.outboundId)).status).toBe('cancelled')
      expect(emitted.at(-1)).toMatchObject({
        name: 'ops/mail.send.cancelled',
        data: { outboundId: r.outboundId },
      })
      expect((await runSend(r.outboundId)).gate).toEqual({ kind: 'stop', reason: 'not_pending' })
      expect(await once.sendOnce(r.outboundId, sendDeps())).toEqual({ kind: 'not_claimed' })
      expect(fake.calls).not.toContain('messages.send')
      // A second Undo is harmless.
      expect(await undo.undoSend(r.outboundId, { emit: async () => true })).toMatchObject({
        success: true,
        data: { alreadyCancelled: true },
      })
    })

    it('after the window, a scheduled row is no longer undoable; a held one still is', async () => {
      const late = await queue()
      expect(await undo.undoSend(late.outboundId, { emit: async () => true })).toEqual({
        success: false,
        error: undo.TOO_LATE,
      })
      const held = await queue()
      await db.outboundEmail.update({
        where: { id: held.outboundId },
        data: { status: 'held', holdReason: 'cap' },
      })
      expect((await undo.undoSend(held.outboundId, { emit: async () => true })).success).toBe(true)
    })

    it('after the claim (sending, sent): refused with "Too late"', async () => {
      const r = await queue()
      await runSend(r.outboundId)
      expect(await undo.undoSend(r.outboundId, { emit: async () => true })).toEqual({
        success: false,
        error: 'Too late: this email has already left',
      })
    })
  })

  describe('send once', () => {
    it('sent: Gmail id, sentAt, the RFC Message-ID read back, counted against the cap', async () => {
      const r = await queue()
      const out = await runSend(r.outboundId)
      expect(out.result?.kind).toBe('sent')
      const saved = await row(r.outboundId)
      expect(saved.status).toBe('sent')
      expect(saved.gmailMessageId).toMatch(/^sent/)
      expect(saved.rfcMessageId).toBe(`<ops.${r.outboundId}@indushydraulics.me>`)
      expect(saved.claimedAt).not.toBeNull()
      const state = await db.mailboxSyncState.findUniqueOrThrow({
        where: { mailboxId: world.salesId },
      })
      expect(state.sentToday).toBe(1)
      expect(state.sentTodayDate?.getTime()).toBe(slot.capDay(new Date()).getTime())
    })

    it('MIME: X-Indus-Outbound, proposed Message-ID, threading headers, a single Re:, signature, Bcc kept', async () => {
      const thread = await db.mailThread.create({
        data: { mailboxId: world.salesId, gmailThreadId: `thr-own-${Date.now()}` },
      })
      const fileId = await storedFile(db, objects, TAG, 'quote.pdf')
      const r = await queue({
        threadId: thread.id,
        subject: 'RE: Re: Fwd: Hydraulic hose enquiry',
        inReplyToRfcId: '<orig@client.example.test>',
        referencesRfcIds: ['<a@client.example.test>', '<orig@client.example.test>'],
        bcc: ['archive@example.test'],
        attachments: [{ fileId, filename: 'INDUS-Q00001.pdf' }],
      })
      expect((await row(r.outboundId)).subject).toBe('Re: Hydraulic hose enquiry')
      await runSend(r.outboundId)
      const sent = fake.sent()[0]!
      expect(sent.threadId).toBe(thread.gmailThreadId)
      const text = fake.rawText(sent.id!)
      expect(text).toMatch(new RegExp(`^X-Indus-Outbound: ${r.outboundId}$`, 'm'))
      expect(text).toMatch(
        new RegExp(`^Message-ID: <ops\\.${r.outboundId}@indushydraulics\\.me>$`, 'mi')
      )
      expect(text).toMatch(/^In-Reply-To: <orig@client\.example\.test>$/m)
      expect(text).toMatch(/^References: <a@client\.example\.test> <orig@client\.example\.test>$/m)
      expect(text).toMatch(/^Subject: Re: Hydraulic hose enquiry$/m)
      expect(text).toMatch(/^Bcc: archive@example\.test$/m)
      expect(text).toMatch(/^From: "?Sales Example"? <s04q-queue-sales@example\.test>$/m)
      expect(text).toContain('multipart/alternative')
      expect(text).toContain('INDUS-Q00001.pdf')
      expect(text).toContain('Example Trading LLC')
    })

    it('a thread held only by the other mailbox is never used as threadId', async () => {
      const r = await queue()
      const other = await db.mailThread.create({
        data: { mailboxId: world.purchaseId, gmailThreadId: `thr-x-${Date.now()}` },
      })
      await db.outboundEmail.update({ where: { id: r.outboundId }, data: { threadId: other.id } })
      await runSend(r.outboundId)
      expect(fake.sent()[0]?.threadId).not.toBe(other.gmailThreadId)
    })

    it('a definite 4xx → failed, nothing to reconcile', async () => {
      const r = await queue()
      fake.failNext('messages.send', Object.assign(new Error('Invalid To header'), { status: 400 }))
      expect((await runSend(r.outboundId)).result).toEqual({ kind: 'failed', reason: 'http_400' })
      expect(await row(r.outboundId)).toMatchObject({ status: 'failed', failureReason: 'http_400' })
    })

    it('before dispatch (a missing attachment) → failed not_dispatched, nothing went to Google', async () => {
      const fileId = await storedFile(db, objects, TAG, 'gone.pdf')
      const r = await queue({ attachments: [{ fileId, filename: 'gone.pdf' }] })
      objects.clear()
      expect(await once.sendOnce(r.outboundId, sendDeps())).toEqual({
        kind: 'failed',
        reason: 'not_dispatched:attachment_missing',
      })
      expect((await row(r.outboundId)).status).toBe('failed')
      expect(fake.calls).not.toContain('messages.send')
    })

    it('a token refresh failure before the claim → failed not_dispatched', async () => {
      const { MailboxUnavailableError } = await import('../gmail/errors')
      const r = await queue()
      const out = await once.sendOnce(r.outboundId, {
        gmail: gmail(),
        preflight: async () => {
          throw new MailboxUnavailableError(world.salesId, 'token_expired')
        },
      })
      expect(out).toEqual({ kind: 'failed', reason: 'not_dispatched:token_expired' })
      expect(fake.calls).not.toContain('messages.send')
    })

    it('a timeout → unknown → reconcile finds X-Indus-Outbound in Sent → sent; no second send', async () => {
      const r = await queue()
      fake.failNext(
        'messages.send',
        Object.assign(new Error('socket hang up'), { code: 'ECONNRESET' })
      )
      expect((await runSend(r.outboundId)).result?.kind).toBe('ambiguous')
      expect((await row(r.outboundId)).status).toBe('unknown')
      // Google had in fact accepted it.
      fake.deliver({
        from: SALES,
        to: [CLIENT],
        subject: 'Your enquiry',
        labelIds: ['SENT'],
        internalDate: new Date(),
        headers: { 'X-Indus-Outbound': r.outboundId },
        messageIdHeader: `<ops.${r.outboundId}@indushydraulics.me>`,
      })
      const found = await rec.reconcile(r.outboundId, { gmail: gmail() })
      expect(found.kind).toBe('sent')
      expect(await row(r.outboundId)).toMatchObject({ status: 'sent' })
      expect(fake.calls.filter((c) => c === 'messages.send')).toHaveLength(1)
    })

    it('reconcile misses twice → stays unknown, one notification, never resent', async () => {
      const r = await queue()
      fake.failNext('messages.send', Object.assign(new Error('backend error'), { status: 503 }))
      await runSend(r.outboundId)
      expect(await rec.reconcile(r.outboundId, { gmail: gmail() })).toEqual({
        kind: 'unknown',
        checks: 1,
        notified: false,
      })
      const second = await rec.reconcile(r.outboundId, { gmail: gmail() })
      expect(second).toMatchObject({ kind: 'unknown', checks: 2, notified: true })
      await rec.reconcile(r.outboundId, { gmail: gmail() })
      const notes = await db.notification.findMany({
        where: { dedupeKey: `outbound_unknown:${r.outboundId}` },
      })
      expect(notes.length).toBeGreaterThan(0)
      expect(new Set(notes.map((n) => n.userId)).size).toBe(notes.length)
      expect(notes[0]?.title).toBe(rec.UNKNOWN_TITLE)
      expect((await row(r.outboundId)).status).toBe('unknown')
      expect(fake.calls.filter((c) => c === 'messages.send')).toHaveLength(1)
    })
  })

  it('disconnected mailbox → waiting_for_mailbox; reconnect → re-gated and sent from the SAME mailbox', async () => {
    const r = await queue()
    await db.mailbox.update({ where: { id: world.salesId }, data: { status: 'revoked' } })
    expect((await runSend(r.outboundId)).gate).toMatchObject({ kind: 'wait', reason: 'mailbox' })
    expect((await row(r.outboundId)).status).toBe('waiting_for_mailbox')
    expect(fake.calls).not.toContain('messages.send')
    await db.mailbox.update({ where: { id: world.salesId }, data: { status: 'live' } })
    const again = await runSend(r.outboundId)
    expect(again.result?.kind).toBe('sent')
    expect(await row(r.outboundId)).toMatchObject({ status: 'sent', mailboxId: world.salesId })
  })

  describe('slot', () => {
    it('a client email: the slot follows the UAE hours; a rule without a window sends at once', async () => {
      const r = await queue()
      // Friday 18:30 GST.
      const friday = new Date('2026-11-20T14:30:00Z')
      const decision = await slot.computeSlot(r.outboundId, { now: () => friday })
      expect(decision).toEqual({
        at: '2026-11-23T04:30:00.000Z',
        reason: 'client_release',
        held: false,
      })
      expect((await row(r.outboundId)).sendSlotAt?.toISOString()).toBe('2026-11-23T04:30:00.000Z')
    })

    it('over the cap at the slot → held for cap, slot after the 04:00 GST reset', async () => {
      const monday = new Date('2026-11-23T06:00:00Z') // 10:00 GST
      await db.mailboxSyncState.update({
        where: { mailboxId: world.salesId },
        data: { sentToday: 40, sentTodayDate: slot.capDay(monday) },
      })
      const r = await queue()
      const decision = await slot.computeSlot(r.outboundId, { now: () => monday })
      expect(decision).toEqual({ at: '2026-11-24T04:30:00.000Z', reason: 'cap', held: true })
      expect(await row(r.outboundId)).toMatchObject({ status: 'held', holdReason: 'cap' })
    })

    it('the cap counter resets with the cap day', async () => {
      const state = { sentToday: 7, sentTodayDate: slot.capDay(new Date('2026-11-23T06:00:00Z')) }
      expect(slot.sentInCapDay(state, new Date('2026-11-23T23:59:00Z'))).toBe(7)
      expect(slot.sentInCapDay(state, new Date('2026-11-24T00:00:00Z'))).toBe(0)
      expect(slot.sentInCapDay(null, new Date())).toBe(0)
    })
  })

  it('the sweep re-requests a row stranded in scheduled; it never sends', async () => {
    const r = await queue({}, new Date(Date.now() - 60 * 60_000))
    await db.$executeRaw`UPDATE ops.outbound_email SET "updatedAt" = now() - interval '1 hour' WHERE id = ${r.outboundId}::uuid`
    const requests: unknown[] = []
    const out = await rec.reconcileSweep({
      gmailFor: () => gmail(),
      emit: async (events) => (requests.push(...events), events.length),
    })
    expect(out.requeued).toBeGreaterThanOrEqual(1)
    expect(requests).toContainEqual(
      expect.objectContaining({
        name: 'ops/mail.send.requested',
        data: expect.objectContaining({ outboundId: r.outboundId }),
      })
    )
    expect(fake.calls).not.toContain('messages.send')
  })
})
