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
import type { ActionDefinition } from './types'

/**
 * S06-T02 decisions on the local database: approve (an email is queued once, with the 5-minute undo; an
 * internal effect runs now), edit and approve (diff kept, edit used for the send, signal recorded), reject
 * (reason required; redraft requested), Later, stale and version refusals, role refusals, undo of an approval
 * (the card returns with the edit), batch approve, and the send outcome settling the action.
 */
const DB_URL = localDatabaseUrl()
const TAG = 'decide'
const REF_PREFIX = 'A-DEC-'
const TO = 'decide-sender@example-valve.test'
const h = vi.hoisted(() => ({
  emitted: [] as Array<{ name: string; data: Record<string, unknown> }>,
}))

vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: () => undefined,
  revalidatePath: () => undefined,
}))
vi.mock('../../inngest/emit', () => ({
  emitEvent: async (e: { name: string; data: Record<string, unknown> }) => (
    h.emitted.push(e),
    true
  ),
  emitEventOrThrow: async (e: { name: string; data: Record<string, unknown> }) =>
    void h.emitted.push(e),
}))
vi.mock('./state', () => ({
  isAssistantPaused: async () => false,
  assistantPauseState: async () => null,
}))

describe.skipIf(!DB_URL)('review decisions · local database', () => {
  let db: typeof import('@indus/ops-db').opsDb
  let d: typeof import('./decisions')
  let registry: typeof import('./registry')
  let world: QueueWorld
  let owner: import('./decisions').Decider
  let helper: import('./decisions').Decider
  let seq = 0

  async function message() {
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
        flags: { passwordProtected: ['RFQ.pdf'] },
      },
      select: { id: true, threadId: true },
    })
    return m
  }

  async function card(
    over: {
      actionKey?: string
      subjectId?: string
      preview?: object | null
      options?: object[]
      basisHash?: string
    } = {}
  ) {
    seq += 1
    const m = over.subjectId ? { id: over.subjectId } : await message()
    const key = over.actionKey ?? 'ask_open_copy'
    return db.assistantAction.create({
      data: {
        ref: `A-DEC-${Date.now()}-${seq}`,
        actionKey: key,
        levelAtTime: 'draft_and_ask',
        guardrails: [],
        subjectType: 'mail_message',
        subjectId: m.id,
        headline: 'Ask the sender for an open copy of RFQ.pdf',
        reasons: [{ text: 'RFQ.pdf is password-protected' }],
        preview:
          over.preview === undefined
            ? {
                mailbox: 'purchase@example.test',
                to: [TO],
                subject: 'Re: RFQ list',
                text: 'Could you send it without a password?',
              }
            : (over.preview as never),
        checks: [{ label: 'Same thread and mailbox', status: 'pass' }],
        confidence: 'sure',
        options: (over.options ?? [
          { key: 'send', label: 'Send the reply', consequence: '' },
        ]) as never,
        state: 'proposed',
        surface: 'review',
        basisHash: over.basisHash ?? null,
        output: { note: 'x', problem: null },
        inputs: {
          request: {
            actionKey: key,
            subjectType: 'mail_message',
            subjectId: m.id,
            trigger: 'test',
            origin: 'live',
            sourceVersion: 1,
            mailboxId: world.purchaseId,
          },
        },
      },
      select: { id: true, ref: true, version: true },
    })
  }

  const fakeInternal: ActionDefinition<Record<string, never>, Record<string, never>> = {
    key: 'decide_equivalent',
    group: 'sourcing',
    aiPurpose: 'other',
    external: false,
    concurrencyGroup: 'test',
    surface: 'review',
    estimate: () => ({ chars: 0, maxTokens: 0 }),
    gather: async () => ({ input: {}, versions: {} }),
    propose: async () => ({
      ok: true,
      out: {},
      costUsd: '0',
      model: null,
      promptVersion: null,
      callIds: [],
    }),
    verify: async (out) => ({ out, checks: [], confidence: 'sure' }),
    toProposal: () => ({ headline: 'x', reasons: [], checks: [], confidence: 'sure' }),
    effect: async () => ({ note: 'Decided' }),
  }
  const fakeBatch = { ...fakeInternal, key: 'chase_suppliers', batchable: true }

  beforeAll(async () => {
    ;({ opsDb: db } = await import('@indus/ops-db'))
    d = await import('./decisions')
    registry = await import('./registry')
    await import('./actions')
    registry.registerAction(fakeInternal)
    registry.registerAction(fakeBatch)
    world = await buildQueueWorld(db, TAG)
    await allowTestRecipient(db, TO)
    owner = {
      id: world.ownerId,
      initials: 'KB',
      role: 'owner',
      canSendSupplierMail: true,
      canSeeMargins: true,
    }
    helper = {
      id: world.helperId,
      initials: 'AB',
      role: 'helper',
      canSendSupplierMail: false,
      canSeeMargins: false,
    }
  })

  afterAll(async () => {
    // Cards this file left open would crowd every later Review queue (actions are append-only).
    await db.assistantAction.updateMany({
      where: { ref: { startsWith: REF_PREFIX }, state: { in: ['proposed', 'later'] } },
      data: { state: 'cancelled' },
    })
    registry.unregisterAction('decide_equivalent')
    registry.unregisterAction('chase_suppliers')
    await disallowTestRecipient(db, TO)
    await cleanQueue(db, TAG)
    await db.$disconnect()
  })

  it('approve queues the email once, with the undo window; a second approve is refused', async () => {
    const a = await card()
    const out = await d.approve({ actionId: a.id, version: a.version }, owner)
    expect(out.state).toBe('queued')
    expect(out.undoRemainingMs).toBeGreaterThan(4 * 60_000)
    const rows = await db.outboundEmail.findMany({ where: { actionId: a.id } })
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      toAddresses: [TO],
      subject: 'Re: RFQ list',
      approvedById: world.ownerId,
    })
    expect(rows[0]!.idempotencyKey).toBe(`${a.id}:${a.version}`)
    await expect(d.approve({ actionId: a.id, version: a.version + 1 }, owner)).rejects.toThrow(
      /already decided/
    )
    expect(await db.outboundEmail.count({ where: { actionId: a.id } })).toBe(1)
    expect(h.emitted.map((e) => e.name)).toContain('ops/review.changed')
  })

  it('edit and approve: the edit is sent, the diff kept, a preference signal recorded', async () => {
    const a = await card()
    const out = await d.approve(
      {
        actionId: a.id,
        version: a.version,
        edits: {
          subject: 'Re: RFQ list (open copy)',
          body: 'Dear team, please send it again without a password.',
        },
      },
      owner
    )
    expect(out.state).toBe('queued')
    const row = await db.assistantAction.findUniqueOrThrow({ where: { id: a.id } })
    expect(row.effectivePayload).toMatchObject({ subject: 'Re: RFQ list (open copy)' })
    expect(row.editDiff).toMatchObject({ by: 'KB', fields: ['subject', 'body'] })
    // The proposal itself never changes.
    expect(row.headline).toBe('Ask the sender for an open copy of RFQ.pdf')
    const sent = await db.outboundEmail.findFirstOrThrow({ where: { actionId: a.id } })
    expect(sent.subject).toBe('Re: RFQ list (open copy)')
    expect(sent.bodyText).toContain('without a password')
    expect(
      await db.preferenceSignal.findFirst({ where: { actionId: a.id, kind: 'edit' } })
    ).not.toBeNull()
    expect(
      (await db.assistantActionEvent.findMany({ where: { actionId: a.id } })).map((e) => e.toState)
    ).toContain('edited_approved')
  })

  it('a changed version and a stale card are refused; the stale one is marked', async () => {
    const a = await card({ basisHash: 'drafted-on-old-thread' })
    await expect(
      d.approve({ actionId: a.id, version: a.version + 5 }, owner)
    ).rejects.toMatchObject({ code: 'changed' })
    await expect(d.approve({ actionId: a.id, version: a.version }, owner)).rejects.toMatchObject({
      code: 'stale',
    })
    expect(
      (await db.assistantAction.findUniqueOrThrow({ where: { id: a.id } })).staleAt
    ).not.toBeNull()
  })

  it('board 110: a saved edit refuses the old version; the queue shows the change; Keep mine restores it', async () => {
    const a = await card()
    const OTHER = 'other-sender@example-valve.test'
    // The initials the page shows come from the user row, not the decider passed in.
    const HE = (await db.user.findUniqueOrThrow({ where: { id: world.helperId } })).initials
    // The Helper saves an edit without approving: the version moves on, the trail keeps both versions.
    const saved = await d.saveEdits(
      { actionId: a.id, version: a.version, edits: { to: [OTHER], subject: 'Re: RFQ list (AB)' } },
      helper
    )
    expect(saved.fields).toEqual(['to', 'subject'])
    expect(saved.version).toBeGreaterThan(a.version)
    // The Owner approves the version they opened: refused as changed, nothing queued.
    await expect(d.approve({ actionId: a.id, version: a.version }, owner)).rejects.toMatchObject({
      code: 'changed',
    })
    expect(await db.outboundEmail.count({ where: { actionId: a.id } })).toBe(0)

    // The Review page, opened on ?seen=<old version>, shows what the Helper changed; Approve stays off.
    const { listReviewQueue } = await import('../../data/review')
    const ownerView = { id: owner.id, role: 'owner' as const, canSeeMargins: true }
    const q = await listReviewQueue(ownerView, {
      group: 'record',
      sort: 'oldest',
      card: a.ref,
      seen: a.version,
      edit: false,
    })
    expect(q.conflict).toMatchObject({
      ref: a.ref,
      by: HE,
      seen: a.version,
      version: saved.version,
      changes: [
        { field: 'the recipients', added: [OTHER], removed: [TO] },
        { field: 'the subject', added: [], removed: [] },
      ],
    })
    // Without ?seen= (Review his change) there is no conflict and the card carries the Helper's version.
    const plain = await listReviewQueue(ownerView, {
      group: 'record',
      sort: 'oldest',
      card: a.ref,
      edit: false,
    })
    expect(plain.conflict).toBeNull()

    // Keep mine: the Owner's version comes back, the Helper is told, both versions stay in the trail.
    const kept = await d.keepMyVersion(
      { actionId: a.id, version: saved.version, seen: a.version },
      owner
    )
    expect(kept.told).toEqual([HE])
    const row = await db.assistantAction.findUniqueOrThrow({ where: { id: a.id } })
    expect(row.effectivePayload).toBeNull()
    expect(row.version).toBe(kept.version)
    const trail = await db.activityEvent.findMany({
      where: { actionId: a.id, field: d.DRAFT_EDIT_FIELD },
      orderBy: { at: 'asc' },
    })
    expect(trail.map((t) => (t.after as { payload: object }).payload)).toEqual([
      { to: [OTHER], subject: 'Re: RFQ list (AB)' },
      {},
    ])
    expect(
      await db.notification.count({
        where: { userId: world.helperId, dedupeKey: `draft-kept:${a.id}:${kept.version}` },
      })
    ).toBe(1)
    expect(
      (await db.assistantActionEvent.findMany({ where: { actionId: a.id } })).map((e) => e.note)
    ).toEqual(
      expect.arrayContaining([
        'Edited by AB: to, subject',
        `KB kept their version over ${HE}'s edit`,
      ])
    )

    // Now approvable on the new version, and the Owner's (the Assistant's) recipients go out.
    const out = await d.approve({ actionId: a.id, version: kept.version }, owner)
    expect(out.state).toBe('queued')
    expect(
      (await db.outboundEmail.findFirstOrThrow({ where: { actionId: a.id } })).toAddresses
    ).toEqual([TO])
  })

  it('roles: a Helper cannot send a client-mailbox reply or supplier mail without the flag', async () => {
    const a = await card()
    await expect(d.approve({ actionId: a.id, version: a.version }, helper)).rejects.toMatchObject({
      code: 'forbidden',
    })
    const reply = await card({
      actionKey: 'manual_reply',
      preview: { mailbox: 'sales@example.test', to: [TO], subject: 'Re: x', html: '<p>x</p>' },
    })
    await expect(
      d.approve(
        { actionId: reply.id, version: reply.version },
        { ...helper, canSendSupplierMail: true }
      )
    ).rejects.toThrow(/client mailbox/)
  })

  it('a choice that sends nothing (Wait) is recorded and done, no email', async () => {
    const a = await card({
      actionKey: 'resend_alternate_contact',
      options: [
        { key: 'send', label: 'Send to Alex' },
        { key: 'wait', label: 'Wait' },
      ],
    })
    const out = await d.approve({ actionId: a.id, version: a.version, optionValue: 'wait' }, owner)
    expect(out.state).toBe('done')
    expect(await db.outboundEmail.count({ where: { actionId: a.id } })).toBe(0)
    expect((await db.assistantAction.findUniqueOrThrow({ where: { id: a.id } })).chosenOption).toBe(
      'wait'
    )
  })

  it('an internal action runs now and carries the internal undo window', async () => {
    const a = await card({ actionKey: 'decide_equivalent', preview: null, options: [] })
    const out = await d.approve({ actionId: a.id, version: a.version }, owner)
    expect(out.state).toBe('done')
    expect(out.undoRemainingMs).toBeGreaterThan(0)
  })

  it('reject needs a reason; with redraft a new draft is requested for the same subject', async () => {
    const a = await card()
    await expect(
      d.reject({ actionId: a.id, version: a.version, reason: ' ', redraft: false }, owner)
    ).rejects.toMatchObject({ code: 'invalid' })
    h.emitted.length = 0
    const out = await d.reject(
      {
        actionId: a.id,
        version: a.version,
        chip: 'not-needed',
        reason: 'Already resolved by phone',
        redraft: true,
      },
      owner
    )
    expect(out.redraftRequested).toBe(true)
    const row = await db.assistantAction.findUniqueOrThrow({ where: { id: a.id } })
    expect(row).toMatchObject({
      state: 'rejected',
      rejectReason: 'Already resolved by phone',
      chosenOption: 'not-needed',
    })
    const req = h.emitted.find((e) => e.name === 'ops/action.requested')
    expect(req?.data).toMatchObject({
      actionKey: 'ask_open_copy',
      redraftOfId: a.id,
      hint: 'Already resolved by phone',
    })
    expect(
      await db.preferenceSignal.findFirst({ where: { actionId: a.id, kind: 'reject' } })
    ).not.toBeNull()
  })

  it('Later: in an hour, or the next UAE working day at 09:00', async () => {
    const a = await card()
    const now = new Date('2026-11-26T06:00:00Z') // Thursday 10:00 GST
    const out = await d.later({ actionId: a.id, version: a.version, until: 'in-1h' }, owner, now)
    expect(out.laterUntil).toBe('2026-11-26T07:00:00.000Z')
    // Friday's "tomorrow" is a Saturday: the next UAE working day is Monday, 09:00 GST.
    expect(await d.laterUntil('tomorrow-0900', new Date('2026-10-16T06:00:00Z'))).toEqual(
      new Date('2026-10-19T05:00:00Z')
    )
    expect(await d.laterUntil('monday-0900', new Date('2026-10-14T06:00:00Z'))).toEqual(
      new Date('2026-10-19T05:00:00Z')
    )
    expect((await db.assistantAction.findUniqueOrThrow({ where: { id: a.id } })).state).toBe(
      'later'
    )
    await expect(d.laterUntil('2020-01-01T00:00:00Z', now)).rejects.toMatchObject({
      code: 'invalid',
    })
  })

  it('undo of an approval cancels the email and returns the card with its edit', async () => {
    const a = await card()
    await d.approve(
      { actionId: a.id, version: a.version, edits: { subject: 'Edited subject' } },
      owner
    )
    const back = await d.undoApproval({ actionId: a.id }, owner)
    expect((await db.assistantAction.findUniqueOrThrow({ where: { id: a.id } })).state).toBe(
      'undone'
    )
    expect((await db.outboundEmail.findFirstOrThrow({ where: { actionId: a.id } })).status).toBe(
      'cancelled'
    )
    const copy = await db.assistantAction.findUniqueOrThrow({ where: { ref: back.ref } })
    expect(copy).toMatchObject({ state: 'proposed', retryOfId: a.id })
    expect(copy.effectivePayload).toMatchObject({ subject: 'Edited subject' })
  })

  it('batch approve takes batchable cards only', async () => {
    const ok = await card({ actionKey: 'chase_suppliers', preview: null, options: [] })
    const no = await card()
    const out = await d.batchApprove(
      [
        { actionId: ok.id, version: ok.version },
        { actionId: no.id, version: no.version },
      ],
      owner
    )
    expect(out).toEqual([
      { actionId: ok.id, ok: true },
      { actionId: no.id, ok: false, error: 'This card is decided one at a time.' },
    ])
  })

  it('the send outcome settles the action: sent → done', async () => {
    const a = await card()
    const q = await d.approve({ actionId: a.id, version: a.version }, owner)
    await db.outboundEmail.update({ where: { id: q.outboundId! }, data: { status: 'sending' } })
    await db.outboundEmail.update({
      where: { id: q.outboundId! },
      data: { status: 'sent', sentAt: new Date(), gmailMessageId: `g-out-${randomUUID()}` },
    })
    expect(await d.settleActionForOutbound(q.outboundId!)).toBe('done')
    expect((await db.assistantAction.findUniqueOrThrow({ where: { id: a.id } })).state).toBe('done')
  })
})
