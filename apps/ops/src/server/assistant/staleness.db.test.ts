import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import {
  buildQueueWorld,
  CLIENT,
  cleanQueue,
  localDatabaseUrl,
  type QueueWorld,
} from '../mail-send/testing/fixture'

/**
 * S06-T01 on the local database: a new inbound in a thread marks its open proposals stale (worded for the
 * sender); a recomputed basis catches a change even without the mark; the send gate stops a queued send whose
 * proposal went stale; the card data redacts money for a Helper without "can see margins".
 */
const DB_URL = localDatabaseUrl()
const TAG = 'stale'
const REF_PREFIX = 'A-STALE-'
const PROD = { APP_ENV: 'production' as const, OPS_SEND_ALLOWLIST: [] as string[] }

vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
vi.mock('../assistant/pause', () => ({
  isAssistantPaused: async () => false,
  assistantPauseState: async () => null,
}))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: () => undefined,
  revalidatePath: () => undefined,
}))

describe.skipIf(!DB_URL)('stale proposals · local database', () => {
  let db: typeof import('@indus/ops-db').opsDb
  let st: typeof import('./staleness')
  let runner: typeof import('./runner')
  let gate: typeof import('../mail-send/gate')
  let schedule: typeof import('../mail-send/schedule')
  let mapper: typeof import('../../data/proposal-mapper')
  let world: QueueWorld
  let seq = 0

  async function thread(mailboxId: string) {
    return (
      await db.mailThread.create({
        data: { mailboxId, gmailThreadId: `t-${TAG}-${randomUUID()}` },
        select: { id: true },
      })
    ).id
  }

  async function inbound(mailboxId: string, threadId: string, minutesAgo: number) {
    const at = new Date(Date.now() - minutesAgo * 60_000)
    return (
      await db.mailMessage.create({
        data: {
          mailboxId,
          threadId,
          gmailMessageId: `g-${TAG}-${randomUUID()}`,
          direction: 'inbound',
          fromAddress: 'sender@example-valve.test',
          toAddresses: ['purchase@example.test'],
          ccAddresses: [],
          subject: 'RFQ',
          bodyText: 'Attached',
          sentAt: at,
          receivedAt: at,
          labelsApplied: [],
          origin: 'live',
          flags: { passwordProtected: ['RFQ.pdf'] },
        },
        select: { id: true },
      })
    ).id
  }

  async function openCopyAction(messageId: string, basisHash: string | null) {
    seq += 1
    return db.assistantAction.create({
      data: {
        ref: `A-STALE-${Date.now()}-${seq}`,
        actionKey: 'ask_open_copy',
        levelAtTime: 'draft_and_ask',
        guardrails: [],
        subjectType: 'mail_message',
        subjectId: messageId,
        headline: 'Ask the sender for an open copy of RFQ.pdf',
        reasons: [{ text: 'RFQ.pdf is password-protected' }],
        preview: {
          mailbox: 'purchase@example.test',
          to: ['sender@example-valve.test'],
          subject: 'Re: RFQ',
          text: 'Could you send it without a password?',
        },
        checks: [
          { label: 'Same thread and mailbox', status: 'pass' },
          { label: 'Landed cost', status: 'pass', detail: 'AED 1,200' },
        ],
        confidence: 'sure',
        state: 'proposed',
        surface: 'review',
        basisHash,
        inputs: {
          request: {
            actionKey: 'ask_open_copy',
            subjectType: 'mail_message',
            subjectId: messageId,
            trigger: 'test',
            origin: 'live',
            sourceVersion: 1,
          },
        },
      },
      select: { id: true, ref: true },
    })
  }

  beforeAll(async () => {
    ;({ opsDb: db } = await import('@indus/ops-db'))
    st = await import('./staleness')
    runner = await import('./runner')
    gate = await import('../mail-send/gate')
    schedule = await import('../mail-send/schedule')
    mapper = await import('../../data/proposal-mapper')
    await import('./actions')
    world = await buildQueueWorld(db, TAG)
  })

  afterAll(async () => {
    // Cards this file left open would crowd every later Review queue (actions are append-only).
    await db.assistantAction.updateMany({
      where: { ref: { startsWith: REF_PREFIX }, state: { in: ['proposed', 'later'] } },
      data: { state: 'cancelled' },
    })
    await cleanQueue(db, TAG)
    await db.$disconnect()
  })

  it('a reply in the thread marks its open proposals stale, worded for the sender', async () => {
    const t = await thread(world.purchaseId)
    const m1 = await inbound(world.purchaseId, t, 30)
    const a = await openCopyAction(m1, null)
    const m2 = await inbound(world.purchaseId, t, 0)
    expect(await st.markStaleOnInbound(m2)).toEqual([a.id])
    const row = await db.assistantAction.findUniqueOrThrow({ where: { id: a.id } })
    expect(row.staleAt).not.toBeNull()
    expect(row.staleReason).toMatch(
      /^The supplier replied since this was drafted \(\d{2}:\d{2}\)\.$/
    )
    expect(await st.isStale(a.id)).toMatchObject({ stale: true })
    // Marked once.
    expect(await st.markStaleOnInbound(m2)).toEqual([])
  })

  it('the recomputed basis catches a change without the mark; an unchanged one is fresh', async () => {
    const t = await thread(world.purchaseId)
    const m1 = await inbound(world.purchaseId, t, 30)
    const def = (await import('./registry')).actionDefinition('ask_open_copy')!
    const request = {
      actionKey: 'ask_open_copy',
      subjectType: 'mail_message' as const,
      subjectId: m1,
      trigger: 'test',
      origin: 'live' as const,
      sourceVersion: 1,
    }
    const hash = runner.basisHash(await def.currentVersions!(request))
    const a = await openCopyAction(m1, hash)
    expect(await st.isStale(a.id)).toEqual({ stale: false, reason: null })
    await inbound(world.purchaseId, t, 0)
    expect(await st.isStale(a.id)).toMatchObject({ stale: true })
  })

  it('the send gate stops a queued send whose proposal went stale', async () => {
    st.registerStalenessGate()
    const t = await thread(world.salesId)
    const m1 = await inbound(world.salesId, t, 30)
    const a = await openCopyAction(m1, 'hash-at-approval')
    seq += 1
    const r = await schedule.scheduleSend(
      {
        idempotencyKey: `s04q:${TAG}:${Date.now()}:${seq}`,
        kind: 'other',
        mailboxId: world.salesId,
        to: [CLIENT],
        subject: 'Re: RFQ',
        bodyHtml: '<p>Hello</p>',
        createdById: world.ownerId,
        approvedById: world.ownerId,
        actionId: a.id,
        basisHash: 'hash-at-approval',
      },
      { emit: async () => undefined }
    )
    await db.assistantAction.update({
      where: { id: a.id },
      data: {
        staleAt: new Date(),
        staleReason: 'The client replied since this was drafted (10:02).',
      },
    })
    await db.outboundEmail.update({ where: { id: r.outboundId }, data: { undoUntil: new Date(0) } })
    const g = await gate.sendGate(r.outboundId, { env: PROD, isPaused: async () => false })
    expect(g).toMatchObject({ kind: 'stop', reason: 'stale' })
    expect((await db.outboundEmail.findUniqueOrThrow({ where: { id: r.outboundId } })).status).toBe(
      'superseded'
    )
  })

  it('card data: edits applied over the proposal, evidence links, money hidden from a Helper', async () => {
    const t = await thread(world.purchaseId)
    const m1 = await inbound(world.purchaseId, t, 5)
    const a = await openCopyAction(m1, null)
    await db.assistantAction.update({
      where: { id: a.id },
      data: {
        effectivePayload: { subject: 'Re: RFQ (open copy)' },
        editDiff: { by: 'KB', fields: ['subject'] },
      },
    })
    const row = await db.assistantAction.findUniqueOrThrow({
      where: { id: a.id },
      include: {
        def: { select: { label: true, lockedLevel: true } },
        decidedBy: { select: { initials: true, name: true } },
      },
    })
    const owner = mapper.toProposalCardData(row as never, { role: 'owner', canSeeMargins: false })
    expect(owner).toMatchObject({
      kind: 'email',
      level: { label: 'Asks you', locked: false },
      email: { subject: 'Re: RFQ (open copy)', to: ['sender@example-valve.test'] },
      edited: { by: 'KB', fields: ['subject'] },
      invalid: null,
    })
    expect(owner.why[0]).toEqual({
      text: 'RFQ.pdf is password-protected',
      evidenceId: `${a.ref}~r0`,
    })
    expect(owner.checks.map((c) => c.text)).toContain('Landed cost')
    const helper = mapper.toProposalCardData(row as never, { role: 'helper', canSeeMargins: false })
    expect(helper.checks.map((c) => c.text)).toEqual(['Same thread and mailbox'])
    expect(JSON.stringify(helper)).not.toContain('1,200')
    const seesMargins = mapper.toProposalCardData(row as never, {
      role: 'helper',
      canSeeMargins: true,
    })
    expect(seesMargins.checks).toHaveLength(2)
  })

  it('the runner refuses a draft that does not fit its kind', () => {
    expect(
      runner.proposalProblem('ask_open_copy', 'review', {
        headline: 'Ask',
        reasons: [],
        checks: [],
        confidence: 'sure',
        preview: { mailbox: 'p@example.test', to: [], subject: 's', text: 'x' },
      })
    ).toMatch(/^email: /)
    expect(
      runner.proposalProblem('classify_mail', 'hint', {
        headline: 'Classified as Supplier quote',
        reasons: [{ text: 'from a known supplier domain' }],
        checks: [{ label: 'Quoted evidence', status: 'pass' }],
        confidence: 'sure',
      })
    ).toBeNull()
  })
})
