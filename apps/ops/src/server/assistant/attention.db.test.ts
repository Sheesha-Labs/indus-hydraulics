import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import {
  buildQueueWorld,
  cleanQueue,
  localDatabaseUrl,
  type QueueWorld,
} from '../mail-send/testing/fixture'

/**
 * S06-T03 on the local database: Retry makes a new send with a new key and never runs on its own; Mark as sent
 * settles an unknown send; a send with no card of its own gets one attention card; Later cards come back by
 * the clock (stale ones stale); supersede links the old card to the new; the queue lists each send state.
 */
const DB_URL = localDatabaseUrl()
const TAG = 'attn'
const REF_PREFIX = 'A-ATTN-'
const h = vi.hoisted(() => ({ emitted: [] as string[] }))

vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: () => undefined,
  revalidatePath: () => undefined,
}))
vi.mock('../../inngest/emit', () => ({
  emitEvent: async (e: { name: string }) => (h.emitted.push(e.name), true),
  emitEventOrThrow: async (e: { name: string }) => void h.emitted.push(e.name),
}))
vi.mock('./state', () => ({
  isAssistantPaused: async () => false,
  assistantPauseState: async () => null,
}))

describe.skipIf(!DB_URL)('review states · local database', () => {
  let db: typeof import('@indus/ops-db').opsDb
  let at: typeof import('./attention')
  let sup: typeof import('./supersede')
  let clocks: typeof import('../clocks/registry')
  let review: typeof import('../../data/review')
  let world: QueueWorld
  let owner: import('./decisions').Decider
  let seq = 0

  async function action(
    state: 'failed' | 'queued' | 'proposed' | 'later',
    over: Record<string, unknown> = {}
  ) {
    seq += 1
    return db.assistantAction.create({
      data: {
        ref: `${REF_PREFIX}${Date.now()}-${seq}`,
        actionKey: 'ask_open_copy',
        levelAtTime: 'draft_and_ask',
        guardrails: [],
        headline: `Ask for an open copy ${seq}`,
        reasons: [],
        state,
        surface: 'review',
        decidedById: world.ownerId,
        decidedAt: new Date(),
        ...over,
      },
      select: { id: true, ref: true },
    })
  }

  async function outbound(status: string, actionId: string | null) {
    return db.outboundEmail.create({
      data: {
        kind: 'other',
        mailboxId: world.purchaseId,
        toAddresses: ['someone@example-valve.test'],
        ccAddresses: [],
        bccAddresses: [],
        subject: 'Re: RFQ',
        bodyHtml: '<p>Please send an open copy.</p>',
        bodyText: 'Please send an open copy.',
        status: status as never,
        failureReason: status === 'failed' ? 'purchase@ refused the connection' : null,
        actionId,
        idempotencyKey: `s04q:${TAG}:${randomUUID()}`,
      },
      select: { id: true },
    })
  }

  beforeAll(async () => {
    ;({ opsDb: db } = await import('@indus/ops-db'))
    at = await import('./attention')
    sup = await import('./supersede')
    clocks = await import('../clocks/registry')
    await import('../clocks')
    review = await import('../../data/review')
    world = await buildQueueWorld(db, TAG)
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
      where: {
        actionKey: 'outbound_attention',
        state: { in: ['proposed'] },
        subjectId: world.purchaseId,
      },
      data: { state: 'cancelled' },
    })
    await cleanQueue(db, TAG)
    await db.$disconnect()
  })

  it('Retry is a new send with a new key; nothing retries on its own', async () => {
    const a = await action('failed')
    const failed = await outbound('failed', a.id)
    const items = (
      await review.listReviewQueue(owner, { group: 'record', sort: 'oldest', edit: false })
    ).attention
    expect(items.find((i) => i.actionId === a.id)).toMatchObject({
      kind: 'failed',
      reason: 'purchase@ refused the connection',
    })
    h.emitted.length = 0
    const out = await at.retrySend({ actionId: a.id }, owner)
    const row = await db.outboundEmail.findUniqueOrThrow({ where: { id: out.outboundId } })
    expect(row).toMatchObject({ retryOfId: failed.id, actionId: a.id, status: 'scheduled' })
    expect(row.idempotencyKey).toMatch(new RegExp(`^${a.id}:retry:\\d+$`))
    expect(h.emitted).toEqual(['ops/mail.send.requested'])
    expect((await db.assistantAction.findUniqueOrThrow({ where: { id: a.id } })).state).toBe(
      'running'
    )
    // A second click is refused: the card is no longer failed.
    await expect(at.retrySend({ actionId: a.id }, owner)).rejects.toThrow()
  })

  it("Mark as sent records the person's word; only the Owner may", async () => {
    const a = await action('queued')
    const o = await outbound('unknown', a.id)
    await expect(
      at.markSent({ actionId: a.id }, { ...owner, role: 'helper' })
    ).rejects.toMatchObject({ code: 'forbidden' })
    await at.markSent({ actionId: a.id }, owner)
    // The row keeps its status until Gmail's message is found; the action records the person's word.
    expect((await db.outboundEmail.findUniqueOrThrow({ where: { id: o.id } })).status).toBe(
      'unknown'
    )
    expect(await db.assistantAction.findUniqueOrThrow({ where: { id: a.id } })).toMatchObject({
      state: 'done',
      rejectReason: 'Marked as sent by KB',
    })
  })

  it('a send with no card of its own gets one attention card, once', async () => {
    const o = await outbound('failed', null)
    const ref = await at.createOutboundAttention(o.id)
    expect(ref).toBeTruthy()
    expect(await at.createOutboundAttention(o.id)).toBe(ref)
    const card = await db.assistantAction.findUniqueOrThrow({ where: { ref: ref! } })
    expect(card).toMatchObject({
      actionKey: 'outbound_attention',
      state: 'proposed',
      surface: 'review',
    })
    expect(card.preview).toMatchObject({
      outboundId: o.id,
      actions: ['retry', 'copy', 'mark_sent', 'fix_mailbox'],
    })
    const items = (
      await review.listReviewQueue(owner, { group: 'record', sort: 'oldest', edit: false })
    ).attention
    expect(items.find((i) => i.ref === ref)).toMatchObject({ kind: 'failed' })
  })

  it('the Later clock brings due cards back; one that went stale comes back stale', async () => {
    const due = await action('later', {
      laterUntil: new Date(Date.now() - 60_000),
      decidedById: null,
      decidedAt: null,
    })
    const notYet = await action('later', {
      laterUntil: new Date(Date.now() + 3_600_000),
      decidedById: null,
      decidedAt: null,
    })
    const stale = await action('later', {
      laterUntil: new Date(Date.now() - 60_000),
      staleAt: new Date(),
      staleReason: 'The supplier replied since this was drafted (10:02).',
      decidedById: null,
      decidedAt: null,
    })
    const out = await clocks.runClock('review.later')
    expect(out.back ?? 0).toBeGreaterThanOrEqual(1)
    expect((await db.assistantAction.findUniqueOrThrow({ where: { id: due.id } })).state).toBe(
      'proposed'
    )
    expect((await db.assistantAction.findUniqueOrThrow({ where: { id: notYet.id } })).state).toBe(
      'later'
    )
    const s = await db.assistantAction.findUniqueOrThrow({ where: { id: stale.id } })
    expect(s.state).toBe('proposed')
    expect(s.staleAt).not.toBeNull()
  })

  it('supersede cancels the open card and points it at the new one', async () => {
    const old = await action('proposed', { decidedById: null, decidedAt: null })
    const fresh = await action('proposed', {
      decidedById: null,
      decidedAt: null,
      redraftOfId: old.id,
    })
    expect(await sup.supersedeAction(old.id, fresh.id, 'The supplier replied')).toBe(true)
    expect(await db.assistantAction.findUniqueOrThrow({ where: { id: old.id } })).toMatchObject({
      state: 'cancelled',
      supersededById: fresh.id,
      staleReason: 'The supplier replied',
    })
    const q = await review.listReviewQueue(owner, {
      group: 'flat',
      sort: 'oldest',
      edit: false,
      card: fresh.ref,
    })
    const card = q.groups.flatMap((g) => g.cards).find((c) => c.id === fresh.id)
    expect(card?.supersedes).toMatchObject({ reason: 'The supplier replied' })
  })
})
