import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import {
  allowTestRecipient,
  buildQueueWorld,
  cleanQueue,
  disallowTestRecipient,
  localDatabaseUrl,
  type QueueWorld,
} from '../mail-send/testing/fixture'

/**
 * S06-T07 undo and corrections on the local database: undo inside the window cancels the queued email (no
 * Gmail call) and the card comes back with the person's edit, releasing what the approval consumed; after
 * the email left, undo is refused with when it left; an internal change undone inside its window goes back
 * as new rows; a later revert writes new rows and keeps the Assistant's; a correction card carries
 * correctionOfId, stays Draft and ask, and once sent marks the original corrected.
 */
const DB_URL = localDatabaseUrl()
const TAG = 'undo'
const REF_PREFIX = 'A-UNDO-'
const TO = 'undo-sender@example-valve.test'
const h = vi.hoisted(() => ({ emitted: [] as Array<{ name: string }> }))

vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: () => undefined,
  revalidatePath: () => undefined,
}))
vi.mock('../../inngest/emit', () => ({
  emitEvent: async (e: { name: string }) => (h.emitted.push(e), true),
  emitEventOrThrow: async (e: { name: string }) => void h.emitted.push(e),
}))
vi.mock('./state', () => ({
  isAssistantPaused: async () => false,
  assistantPauseState: async () => null,
}))

describe.skipIf(!DB_URL)('undo and corrections · local database', () => {
  let db: typeof import('@indus/ops-db').opsDb
  let d: typeof import('./decisions')
  let undo: typeof import('./undo')
  let revert: typeof import('./revert')
  let hooks: typeof import('./undo-hooks')
  let runner: typeof import('./runner')
  let world: QueueWorld
  let owner: import('./decisions').Decider
  let seq = 0

  async function thread() {
    const t = await db.mailThread.create({
      data: { mailboxId: world.purchaseId, gmailThreadId: `t-${TAG}-${randomUUID()}` },
      select: { id: true },
    })
    const m = await db.mailMessage.create({
      data: {
        mailboxId: world.purchaseId,
        threadId: t.id,
        gmailMessageId: `g-${TAG}-${randomUUID()}`,
        rfcMessageId: `<${randomUUID()}@example-valve.test>`,
        direction: 'inbound',
        fromAddress: TO,
        toAddresses: ['purchase@example.test'],
        ccAddresses: [],
        subject: 'RFQ list',
        bodyText: 'Attached',
        sentAt: new Date(Date.now() - 600_000),
        labelsApplied: [],
        origin: 'live',
        classification: 'supplier_quote',
        confidence: 'sure',
        handledState: 'not_linked',
        flags: { passwordProtected: ['RFQ.pdf'] },
      },
      select: { id: true, threadId: true },
    })
    return m
  }

  async function emailCard() {
    seq += 1
    const m = await thread()
    return db.assistantAction.create({
      data: {
        ref: `${REF_PREFIX}${Date.now()}-${seq}`,
        actionKey: 'ask_open_copy',
        levelAtTime: 'draft_and_ask',
        guardrails: [],
        subjectType: 'mail_message',
        subjectId: m.id,
        headline: 'Ask the sender for an open copy of RFQ.pdf',
        reasons: [{ text: 'RFQ.pdf is password-protected' }],
        preview: {
          mailbox: 'purchase@example.test',
          to: [TO],
          subject: 'Re: RFQ list',
          text: 'Could you send it without a password?',
        },
        checks: [{ label: 'Same thread and mailbox', status: 'pass' }],
        confidence: 'sure',
        options: [{ key: 'send', label: 'Send the reply', consequence: '' }],
        state: 'proposed',
        surface: 'review',
        output: { note: 'x', problem: null },
        inputs: {
          request: {
            actionKey: 'ask_open_copy',
            subjectType: 'mail_message',
            subjectId: m.id,
            trigger: 'test',
            origin: 'live',
            sourceVersion: 1,
            mailboxId: world.purchaseId,
          },
        },
      },
      select: { id: true, ref: true, version: true, subjectId: true },
    })
  }

  /** A done classify action that changed a message's class, with its undo window. */
  async function classified(undoMinutes: number) {
    seq += 1
    const m = await thread()
    const a = await db.assistantAction.create({
      data: {
        ref: `${REF_PREFIX}${Date.now()}-${seq}`,
        actionKey: 'classify_mail',
        levelAtTime: 'do_quietly',
        guardrails: [],
        subjectType: 'mail_message',
        subjectId: m.id,
        headline: 'Classified as Client enquiry',
        reasons: [],
        state: 'done',
        surface: 'review',
        undoUntil: new Date(Date.now() + undoMinutes * 60_000),
      },
      select: { id: true, ref: true },
    })
    await db.mailMessage.update({ where: { id: m.id }, data: { classification: 'client_enquiry' } })
    await db.activityEvent.create({
      data: {
        actorKind: 'assistant',
        actionId: a.id,
        subjectType: 'mail_message',
        subjectId: m.id,
        kind: 'status',
        field: 'classification',
        before: 'supplier_quote',
        after: 'client_enquiry',
      },
    })
    return { action: a, messageId: m.id }
  }

  beforeAll(async () => {
    ;({ opsDb: db } = await import('@indus/ops-db'))
    d = await import('./decisions')
    undo = await import('./undo')
    revert = await import('./revert')
    hooks = await import('./undo-hooks')
    runner = await import('./runner')
    await import('./actions')
    world = await buildQueueWorld(db, TAG)
    await allowTestRecipient(db, TO)
    owner = {
      id: world.ownerId,
      initials: 'KB',
      role: 'owner',
      canSendSupplierMail: true,
      canSeeMargins: true,
    }
  })

  afterAll(async () => {
    await db.assistantAction.updateMany({
      where: { ref: { startsWith: REF_PREFIX }, state: { in: ['proposed', 'later'] } },
      data: { state: 'cancelled' },
    })
    await db.assistantAction.updateMany({
      where: { actionKey: 'correction_email', state: { in: ['proposed', 'later'] } },
      data: { state: 'cancelled' },
    })
    hooks.unregisterUndoHooksForTest('ask_open_copy')
    await disallowTestRecipient(db, TO)
    await cleanQueue(db, TAG)
    await db.$disconnect()
  })

  it('undo inside the window: the send is cancelled, the card returns with the edit, the release hook runs', async () => {
    const released: string[] = []
    hooks.registerUndoRelease('ask_open_copy', async (_tx, a) => void released.push(a.id))
    const a = await emailCard()
    await d.approve(
      { actionId: a.id, version: a.version, edits: { body: 'Edited: please resend it open.' } },
      owner
    )
    const out = await undo.undoAction(a.id, owner)
    expect(out.undone).toBe(true)
    const o = await db.outboundEmail.findFirstOrThrow({ where: { actionId: a.id } })
    expect(o.status).toBe('cancelled')
    expect((await db.assistantAction.findUniqueOrThrow({ where: { id: a.id } })).state).toBe(
      'undone'
    )
    const back = await db.assistantAction.findFirstOrThrow({ where: { retryOfId: a.id } })
    expect(back.state).toBe('proposed')
    expect(back.effectivePayload).toMatchObject({ body: 'Edited: please resend it open.' })
    expect(released).toEqual([a.id])
    hooks.unregisterUndoHooksForTest('ask_open_copy')
  })

  it('after the email left, undo is refused with when it left', async () => {
    const a = await emailCard()
    await d.approve({ actionId: a.id, version: a.version }, owner)
    const sentAt = new Date()
    await db.outboundEmail.updateMany({
      where: { actionId: a.id },
      data: { status: 'sent', sentAt, gmailMessageId: `sent-${randomUUID()}` },
    })
    const out = await undo.undoAction(a.id, owner)
    expect(out).toMatchObject({ undone: false, left: { ref: a.ref } })
    if (!out.undone) expect(out.left.at).toMatch(/^\d{2}:\d{2}$/)
    expect((await db.assistantAction.findUniqueOrThrow({ where: { id: a.id } })).state).toBe(
      'queued'
    )
  })

  it('an internal change undone inside its window goes back as new rows; done → undone', async () => {
    const { action, messageId } = await classified(5)
    const out = await undo.undoAction(action.id, owner)
    expect(out.undone).toBe(true)
    const m = await db.mailMessage.findUniqueOrThrow({ where: { id: messageId } })
    expect(m.classification).toBe('supplier_quote')
    const rows = await db.activityEvent.findMany({
      where: { subjectId: messageId, field: 'classification' },
      orderBy: { at: 'asc' },
    })
    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({ actorKind: 'assistant', after: 'client_enquiry' })
    expect(rows[1]).toMatchObject({
      actorKind: 'user',
      before: 'client_enquiry',
      after: 'supplier_quote',
      revertsEventId: rows[0]!.id,
      note: 'Undone by KB',
    })
    const a = await db.assistantAction.findUniqueOrThrow({ where: { id: action.id } })
    expect(a.state).toBe('undone')
    if (out.undone) expect(out.events.map((e) => e.name)).toContain('ops/review.changed')
  })

  it('outside the window an internal undo is refused; revert later writes new rows and keeps the old', async () => {
    const { action, messageId } = await classified(-1)
    await expect(undo.undoAction(action.id, owner)).rejects.toThrow(/revert it from History/)
    const ev = await db.activityEvent.findFirstOrThrow({ where: { actionId: action.id } })
    const r = await revert.revertEvent(ev.id, { id: world.ownerId, initials: 'KB' })
    const m = await db.mailMessage.findUniqueOrThrow({ where: { id: messageId } })
    expect(m.classification).toBe('supplier_quote')
    // The Assistant's row is untouched.
    expect(await db.activityEvent.findUniqueOrThrow({ where: { id: ev.id } })).toMatchObject({
      before: 'supplier_quote',
      after: 'client_enquiry',
      actorKind: 'assistant',
    })
    const rev = await db.activityEvent.findFirstOrThrow({ where: { revertsEventId: ev.id } })
    expect(rev).toMatchObject({ note: 'Reverted by KB', after: 'supplier_quote' })
    const row = await db.assistantAction.findUniqueOrThrow({ where: { ref: r.ref } })
    expect(row).toMatchObject({ actionKey: 'revert_change', state: 'done', revertOfId: action.id })
    expect(rev.actionId).toBe(row.id)
    expect((await db.assistantAction.findUniqueOrThrow({ where: { id: action.id } })).state).toBe(
      'reverted'
    )
    await expect(revert.revertEvent(ev.id, { id: world.ownerId, initials: 'KB' })).rejects.toThrow(
      /already undone or reverted/
    )
  })

  it('a correction card: correctionOfId, Draft and ask, and sending it marks the original corrected', async () => {
    const a = await emailCard()
    await d.approve({ actionId: a.id, version: a.version }, owner)
    const o = await db.outboundEmail.findFirstOrThrow({ where: { actionId: a.id } })
    await db.outboundEmail.update({
      where: { id: o.id },
      data: { status: 'sent', sentAt: new Date(), gmailMessageId: `sent-${randomUUID()}` },
    })
    await d.settleActionForOutbound(o.id)
    expect((await db.assistantAction.findUniqueOrThrow({ where: { id: a.id } })).state).toBe('done')

    const data = (await import('./request')).actionRequestEvent({
      actionKey: 'correction_email',
      subjectType: 'mail_thread',
      subjectId: o.threadId!,
      trigger: 'person',
      origin: 'live',
      sourceVersion: `correction:${a.id}:${randomUUID()}`,
      mailboxId: o.mailboxId,
      correctionOfId: a.id,
      hint: 'Wrong attachment\nThe file was last year’s list',
    }).data
    const g = await runner.gatherRun(data)
    const fakeAi = {
      call: async () => ({
        ok: true as const,
        value: {
          note: 'Our previous email had the wrong attachment; apologies. The right file is attached below.',
        },
        costUsd: '0',
        model: 'claude-sonnet-5-5',
        callIds: [],
      }),
    }
    const p = await runner.proposeRun(data, g.input, fakeAi as never)
    expect(p.ok).toBe(true)
    if (!p.ok) return
    const v = await runner.verifyRun(data, p.out, g.input)
    const resolved = await runner.resolveRun(data)
    expect(resolved.level).toBe('draft_and_ask')
    const decided = await runner.decideRun({
      data,
      resolved,
      basisHash: g.basisHash,
      input: g.input,
      proposal: {
        ok: true,
        verified: v,
        costUsd: '0',
        model: p.model,
        promptVersion: p.promptVersion,
        callIds: [],
      },
    })
    expect(decided.state).toBe('proposed')
    const card = await db.assistantAction.findUniqueOrThrow({ where: { id: decided.actionId } })
    expect(card.correctionOfId).toBe(a.id)
    expect(card.headline).toBe(`Correction to ${a.ref}: Wrong attachment`)
    expect(card.preview).toMatchObject({ to: [TO], subject: 'Re: RFQ list' })

    // Approve it, then the send goes out: the original reads corrected.
    await d.approve({ actionId: card.id, version: card.version }, owner)
    const co = await db.outboundEmail.findFirstOrThrow({ where: { actionId: card.id } })
    expect(co.threadId).toBe(o.threadId)
    expect(co.mailboxId).toBe(o.mailboxId)
    await db.outboundEmail.update({
      where: { id: co.id },
      data: { status: 'sent', sentAt: new Date(), gmailMessageId: `sent-${randomUUID()}` },
    })
    await d.settleActionForOutbound(co.id)
    expect((await db.assistantAction.findUniqueOrThrow({ where: { id: a.id } })).state).toBe(
      'corrected'
    )
  })
})
