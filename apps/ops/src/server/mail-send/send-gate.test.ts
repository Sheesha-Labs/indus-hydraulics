import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildQueueWorld,
  CLIENT,
  cleanQueue,
  localDatabaseUrl,
  memoryStorage,
  SUPPLIER,
  storedFile,
  type QueueWorld,
} from './testing/fixture'

/**
 * The send gate, every branch (S04-T06, ADR-07, coverage gap G2). Against the local database; skips without one.
 * S12-T01b adds the identifier-check cases to this file.
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

const TAG = 'gate'
const PROD = { APP_ENV: 'production' as const, OPS_SEND_ALLOWLIST: undefined }

describe.skipIf(!DB_URL)('send gate · local database', () => {
  process.env.APP_ENV = 'test'
  let db: typeof import('@indus/ops-db').opsDb
  let gate: typeof import('./gate')
  let schedule: typeof import('./schedule')
  let hooks: typeof import('./hooks')
  let storage: typeof import('../storage/storage')
  let world: QueueWorld
  const objects = new Map<string, Uint8Array>()
  let seq = 0

  type Extra = Partial<import('./schedule').ScheduleInput>
  async function queue(extra: Extra = {}) {
    seq += 1
    const r = await schedule.scheduleSend(
      {
        idempotencyKey: `s04q:${TAG}:${Date.now()}:${seq}`,
        kind: 'follow_up',
        mailboxId: world.salesId,
        to: [CLIENT],
        subject: 'Following up',
        bodyHtml: '<p>Hello</p>',
        createdById: world.ownerId,
        ...extra,
      },
      { emit: async () => undefined }
    )
    return r.outboundId
  }
  const status = async (id: string) =>
    db.outboundEmail.findUniqueOrThrow({
      where: { id },
      select: { status: true, failureReason: true, holdReason: true, mailboxId: true },
    })

  async function approvedAction(actorKind: 'user' | 'assistant', actorId: string | null) {
    seq += 1
    const action = await db.assistantAction.create({
      data: {
        ref: `A-S04Q-${Date.now()}-${seq}`,
        actionKey: 'send_quotation',
        levelAtTime: 'draft_and_ask',
        headline: 'Send the quotation',
        reasons: [],
        state: 'approved',
      },
    })
    await db.assistantActionEvent.create({
      data: { actionId: action.id, fromState: 'proposed', toState: 'approved', actorKind, actorId },
    })
    return action.id
  }

  async function pricedDocument(kind: 'proforma_invoice' | 'datasheet_none' = 'proforma_invoice') {
    seq += 1
    const doc = await db.document.create({
      data: {
        kind: kind === 'proforma_invoice' ? 'proforma_invoice' : 'mill_test_certificate',
        direction: 'produced',
        status: 'approved',
        number: `S04Q/PI${Date.now()}-${seq}`,
      },
    })
    const fileId = await storedFile(db, objects, TAG, `pi-${seq}.pdf`)
    return { documentId: doc.id, fileId, filename: `INDUS-PI${seq}.pdf` }
  }

  beforeAll(async () => {
    ;({ opsDb: db } = await import('@indus/ops-db'))
    gate = await import('./gate')
    schedule = await import('./schedule')
    hooks = await import('./hooks')
    storage = await import('../storage/storage')
    storage.setStorageForTests(memoryStorage(objects))
  })

  beforeEach(async () => {
    objects.clear()
    world = await buildQueueWorld(db, TAG)
  })

  afterEach(() => hooks.resetGateHooks())

  afterAll(async () => {
    storage.setStorageForTests(null)
    await cleanQueue(db, TAG)
    await db.$disconnect()
  })

  it('go: an unpriced client email from its own live mailbox', async () => {
    const id = await queue()
    expect(await gate.sendGate(id, { env: PROD })).toEqual({ kind: 'go' })
    expect((await status(id)).status).toBe('scheduled')
  })

  it('stop: a row that is no longer pending (cancelled, sent) is left alone', async () => {
    const id = await queue()
    await db.outboundEmail.update({ where: { id }, data: { status: 'cancelled' } })
    expect(await gate.sendGate(id, { env: PROD })).toEqual({ kind: 'stop', reason: 'not_pending' })
    expect((await status(id)).status).toBe('cancelled')
    expect(await gate.sendGate('00000000-0000-7000-8000-000000000000', { env: PROD })).toEqual({
      kind: 'stop',
      reason: 'not_found',
    })
  })

  it('pause everything: held, wait for ops/assistant.resumed; after resume the row goes', async () => {
    const id = await queue()
    const paused = { env: PROD, isPaused: async () => true }
    expect(await gate.sendGate(id, paused)).toEqual({
      kind: 'wait',
      reason: 'pause',
      resumeEvent: 'ops/assistant.resumed',
    })
    expect(await status(id)).toMatchObject({ status: 'held', holdReason: 'pause' })
    expect(await gate.sendGate(id, { env: PROD, isPaused: async () => false })).toEqual({
      kind: 'go',
    })
    expect(await status(id)).toMatchObject({ status: 'scheduled', holdReason: null })
  })

  it('disconnected mailbox: waiting_for_mailbox on THIS mailbox, never another; reconnect → go', async () => {
    const id = await queue()
    await db.mailbox.update({ where: { id: world.salesId }, data: { status: 'token_expired' } })
    expect(await gate.sendGate(id, { env: PROD })).toEqual({
      kind: 'wait',
      reason: 'mailbox',
      resumeEvent: 'ops/mailbox.live',
      match: 'data.mailboxId',
    })
    expect(await status(id)).toMatchObject({
      status: 'waiting_for_mailbox',
      mailboxId: world.salesId,
    })
    await db.mailbox.update({ where: { id: world.salesId }, data: { status: 'live' } })
    expect(await gate.sendGate(id, { env: PROD })).toEqual({ kind: 'go' })
    expect(await status(id)).toMatchObject({ status: 'scheduled', mailboxId: world.salesId })
  })

  it('a mailbox without the send capability waits the same way', async () => {
    const id = await queue()
    await db.mailbox.update({ where: { id: world.salesId }, data: { canSend: false } })
    expect((await gate.sendGate(id, { env: PROD })).kind).toBe('wait')
    expect((await status(id)).status).toBe('waiting_for_mailbox')
  })

  it('mailbox paused by the Owner: held, wait for ops/mailbox.resumed', async () => {
    const id = await queue()
    await db.mailbox.update({ where: { id: world.salesId }, data: { pausedAt: new Date() } })
    expect(await gate.sendGate(id, { env: PROD })).toEqual({
      kind: 'wait',
      reason: 'mailbox_paused',
      resumeEvent: 'ops/mailbox.resumed',
      match: 'data.mailboxId',
    })
    expect(await status(id)).toMatchObject({ status: 'held', holdReason: 'pause' })
  })

  it('pause is read from the shared settings row (assistant.paused) when not injected', async () => {
    const pause = await import('../assistant/pause')
    expect(typeof (await pause.isAssistantPaused())).toBe('boolean')
  })

  it('a From alias no longer verified in send-as stops the send', async () => {
    const id = await queue({ fromAlias: 'old-alias@example.test' })
    expect(await gate.sendGate(id, { env: PROD })).toEqual({
      kind: 'stop',
      reason: 'alias_not_verified',
    })
    expect(await status(id)).toMatchObject({
      status: 'failed',
      failureReason: 'alias_not_verified',
    })
  })

  it('over the daily cap: held until the 04:00 GST reset, one notification per mailbox per day', async () => {
    const { capDay } = await import('./slot')
    const now = new Date()
    await db.mailboxSyncState.update({
      where: { mailboxId: world.salesId },
      data: { sentToday: 40, sentTodayDate: capDay(now) },
    })
    const a = await queue()
    const b = await queue()
    const first = await gate.sendGate(a, { env: PROD, now: () => now })
    expect(first).toMatchObject({ kind: 'wait', reason: 'cap' })
    expect(first.kind === 'wait' && first.until && new Date(first.until) > now).toBe(true)
    await gate.sendGate(b, { env: PROD, now: () => now })
    expect(await status(a)).toMatchObject({ status: 'held', holdReason: 'cap' })
    const notes = await db.notification.findMany({
      where: {
        userId: { in: [world.ownerId, world.helperId] },
        dedupeKey: { startsWith: `send_cap:${world.salesId}:` },
      },
    })
    expect(notes).toHaveLength(2)
    // Yesterday's count does not hold today's sends.
    await db.mailboxSyncState.update({
      where: { mailboxId: world.salesId },
      data: { sentTodayDate: new Date(capDay(now).getTime() - 86_400_000) },
    })
    expect(await gate.sendGate(a, { env: PROD, now: () => now })).toEqual({ kind: 'go' })
  })

  it('basis hook: a changed basis supersedes the row (stale), an unchanged one passes', async () => {
    const id = await queue({ basisHash: 'h1' })
    hooks.registerBasisHook(async () => 'h1')
    expect(await gate.sendGate(id, { env: PROD })).toEqual({ kind: 'go' })
    hooks.registerBasisHook(async () => 'h2')
    expect(await gate.sendGate(id, { env: PROD })).toEqual({ kind: 'stop', reason: 'stale' })
    expect(await status(id)).toMatchObject({ status: 'superseded', failureReason: 'stale' })
  })

  describe('priced client sends need a person (G2)', () => {
    it('a priced kind with approvedById null → needs_person', async () => {
      const id = await queue({ kind: 'quotation', approvedById: null })
      expect(await gate.sendGate(id, { env: PROD })).toEqual({
        kind: 'stop',
        reason: 'needs_person',
      })
      expect((await status(id)).status).toBe('failed')
    })

    it('a priced attachment on an unpriced kind with approvedById null → needs_person', async () => {
      const pi = await pricedDocument()
      const id = await queue({ kind: 'other', approvedById: null, attachments: [pi] })
      expect(await gate.sendGate(id, { env: PROD })).toEqual({
        kind: 'stop',
        reason: 'needs_person',
      })
    })

    it('approved only by the Assistant (system actor) → needs_person', async () => {
      const actionId = await approvedAction('assistant', null)
      const id = await queue({ kind: 'quotation', actionId, approvedById: world.ownerId })
      expect(await gate.sendGate(id, { env: PROD })).toEqual({
        kind: 'stop',
        reason: 'needs_person',
      })
    })

    it('a person with an approve decision on the action → go', async () => {
      const actionId = await approvedAction('user', world.ownerId)
      const id = await queue({ kind: 'quotation', actionId, approvedById: world.ownerId })
      expect(await gate.sendGate(id, { env: PROD })).toEqual({ kind: 'go' })
    })

    it('approvedById names a person who did not approve this action → needs_person', async () => {
      const actionId = await approvedAction('user', world.helperId)
      const id = await queue({ kind: 'invoice', actionId, approvedById: world.ownerId })
      expect(await gate.sendGate(id, { env: PROD })).toEqual({
        kind: 'stop',
        reason: 'needs_person',
      })
    })

    it('a hand-composed reply by the Owner carrying an INDUS/PI → go', async () => {
      const pi = await pricedDocument()
      const id = await queue({
        kind: 'other',
        approvedById: world.ownerId,
        createdById: world.ownerId,
        attachments: [pi],
      })
      expect(await gate.sendGate(id, { env: PROD })).toEqual({ kind: 'go' })
    })

    it('an approver who is no longer active → needs_person', async () => {
      await db.user.update({ where: { id: world.helperId }, data: { status: 'suspended' } })
      const id = await queue({
        kind: 'payment_reminder',
        approvedById: world.helperId,
        createdById: world.helperId,
      })
      expect(await gate.sendGate(id, { env: PROD })).toEqual({
        kind: 'stop',
        reason: 'needs_person',
      })
    })

    it('an unpriced attachment does not need a person', async () => {
      const doc = await pricedDocument('datasheet_none')
      const id = await queue({ kind: 'other', approvedById: null, attachments: [doc] })
      expect(await gate.sendGate(id, { env: PROD })).toEqual({ kind: 'go' })
    })
  })

  it('supplier mail needs a passing identifier check (stored result, or the S12 hook)', async () => {
    const base = { kind: 'supplier_rfq' as const, mailboxId: world.purchaseId, to: [SUPPLIER] }
    const unchecked = await queue(base)
    expect(await gate.sendGate(unchecked, { env: PROD })).toEqual({
      kind: 'stop',
      reason: 'identifier_check',
    })
    const checked = await queue(base)
    await db.outboundEmail.update({
      where: { id: checked },
      data: { identifierCheck: { passed: true } },
    })
    expect(await gate.sendGate(checked, { env: PROD })).toEqual({ kind: 'go' })
    hooks.registerIdentifierHook(async () => ({ passed: false, reason: 'client name' }))
    expect(await gate.sendGate(checked, { env: PROD })).toEqual({
      kind: 'stop',
      reason: 'identifier_check',
    })
  })

  it('a registered extra check (credit hold) stops with its reason', async () => {
    const id = await queue()
    hooks.registerGateCheck('credit_hold', async () => 'on_hold')
    expect(await gate.sendGate(id, { env: PROD })).toEqual({
      kind: 'stop',
      reason: 'credit_hold:on_hold',
    })
  })

  it('a missing attachment file stops the send', async () => {
    const fileId = await storedFile(db, objects, TAG, 'gone.pdf')
    const id = await queue({ attachments: [{ fileId, filename: 'gone.pdf' }] })
    objects.clear()
    expect(await gate.sendGate(id, { env: PROD })).toEqual({
      kind: 'stop',
      reason: 'attachment_missing',
    })
  })

  it('outside production: a recipient not on OPS_SEND_ALLOWLIST → suppressed_preview; allow-listed → go', async () => {
    const id = await queue({ cc: ['someone@example.test'] })
    const preview = { APP_ENV: 'preview' as const, OPS_SEND_ALLOWLIST: [CLIENT] }
    expect(await gate.sendGate(id, { env: preview })).toEqual({
      kind: 'stop',
      reason: 'suppressed_preview',
    })
    expect((await status(id)).status).toBe('suppressed_preview')
    const ok = await queue()
    expect(await gate.sendGate(ok, { env: preview })).toEqual({ kind: 'go' })
  })
})
