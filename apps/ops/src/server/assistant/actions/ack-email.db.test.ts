import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { opsDb } from '@indus/ops-db'
import {
  buildQueueWorld,
  cleanQueue,
  localDatabaseUrl,
  type QueueWorld,
} from '../../mail-send/testing/fixture'

/**
 * Action #6 Acknowledge client on the local database (S08-T07, board 93): the signed-off client_ack wording with
 * the revert-by computed on the working-day calendar (received Wed 24 Sep, closing Sun 28 Sep → 26 Sep, with the
 * steps as "Why 26 Sep"); from sales@ in the client's thread when sales@ holds it, else a new message from sales@
 * (never purchase@); queuing records the revert-by on the enquiry and undo takes it back; a client who asked for
 * no acknowledgement gets none, with the reason.
 */
const DB_URL = localDatabaseUrl()
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
vi.mock('../../../inngest/emit', () => ({
  emitEventOrThrow: async () => undefined,
  emitEvent: async () => true,
}))
vi.mock('../../settings/get', () => ({
  getSetting: async (key: string) =>
    key === 'ack.revert_by'
      ? { pricingDays: 0.5, bufferDays: 2, defaultSupplierReplyDays: 2, defaultNoDeadlineDays: 3 }
      : key === 'calendar.country_weekends'
        ? { default: [6, 0], byCountry: {} }
        : {},
}))

await import('./index')
const { default: def, gatherAck } = await import('./ack-email')
const { ackSkip } = await import('./create-enquiry')
const { releaseOnUndo } = await import('../undo-hooks')
const { setActor } = await import('../write-tracked')

const TAG = `s08ack${Date.now()}`

describe.skipIf(!DB_URL)('acknowledge client (#6) · local database', () => {
  let world: QueueWorld
  let companyId = ''
  const enquiries: string[] = []

  async function enquiryFrom(mailboxId: string, label: string) {
    const thread = await opsDb.mailThread.create({
      data: { mailboxId, gmailThreadId: `t-${TAG}-${label}` },
      select: { id: true },
    })
    const m = await opsDb.mailMessage.create({
      data: {
        mailboxId,
        threadId: thread.id,
        gmailMessageId: `g-${TAG}-${label}`,
        rfcMessageId: `${randomUUID()}@client.example.test`,
        direction: 'inbound',
        fromAddress: `buyer@${TAG}.example.test`,
        fromName: 'Sample Buyer',
        toAddresses: ['sales@example.test'],
        ccAddresses: [],
        subject: 'RFQ SC/MM/25-1203 — compressor station spares',
        bodyText: 'Dear Sir, please quote your best price for the 14 items.',
        bodyTextHash: randomUUID(),
        sentAt: new Date('2025-09-24T05:00:00Z'),
        labelsApplied: [],
        origin: 'live',
      },
      select: { id: true },
    })
    const e = await opsDb.enquiry.create({
      data: {
        ref: `ENQ-2099-${String(Date.now()).slice(-6)}${label.length}`,
        title: 'Compressor station spares',
        clientId: companyId,
        clientRef: 'SC/MM/25-1203',
        receivedVia: 'email',
        receivedAt: new Date('2025-09-24T05:00:00Z'),
        deadline: new Date('2025-09-28T14:00:00Z'),
        lines: {
          create: Array.from({ length: 14 }, (_, i) => ({
            no: i + 1,
            description: `Spare ${i + 1}`,
            qty: 1,
          })),
        },
      },
      select: { id: true },
    })
    enquiries.push(e.id)
    await opsDb.intakeBatch.create({
      data: { source: 'mail', mailMessageId: m.id, status: 'confirmed', enquiryId: e.id },
    })
    return e.id
  }

  beforeAll(async () => {
    world = await buildQueueWorld(opsDb, TAG)
    companyId = (
      await opsDb.company.create({ data: { name: `Sample Client ${TAG}` }, select: { id: true } })
    ).id
  })

  afterAll(async () => {
    await opsDb.intakeBatch.deleteMany({ where: { enquiryId: { in: enquiries } } })
    await opsDb.enquiry.updateMany({
      where: { id: { in: enquiries } },
      data: { closedReason: 'other', closeNote: 'test', closedAt: new Date() },
    })
    await opsDb.preference.deleteMany({ where: { companyId } })
    await cleanQueue(opsDb, TAG)
    await opsDb.$disconnect()
  })

  it('board 93: the signed-off wording, revert by 26 Sep, and why', async () => {
    const id = await enquiryFrom(world.salesId, 'sales')
    const input = await gatherAck(id)
    const p = await def.propose(input, { call: async () => ({}) as never })
    if (!p.ok) throw new Error('propose failed')
    expect(p.out.revertBy).toBe('2025-09-26')
    expect(p.out.body).toBe(
      'Dear Sample Buyer,\n\nWe have received your enquiry SC/MM/25-1203 (14 lines). Our reference is ' +
        `${input.enquiryRef}. We will revert by 26 September.`
    )
    expect(p.out.subject).toBe('Re: RFQ SC/MM/25-1203 — compressor station spares')
    expect(p.out.steps.map((s) => `${s.label}: ${s.value}`)).toEqual([
      'Client closing date: 28 Sep',
      'Typical supplier reply: 2 working days',
      'Pricing and your approval: half a day',
      'So we promise: 26 Sep',
    ])
    const v = await def.verify(p.out, input)
    expect(v.confidence).toBe('sure')
    expect(v.checks.map((c) => [c.label, c.status])).toContainEqual([
      'In the client’s thread from sales@',
      'pass',
    ])
    expect(v.checks.map((c) => c.label)).toContain('No supplier named')
    const card = def.toProposal(v, input)
    expect(card.headline).toBe(
      `Acknowledge Sample Client ${TAG}: ${input.enquiryRef}, revert by 26 Sep`
    )
    expect((card.preview as { whyDate: { title: string } }).whyDate.title).toBe('Why 26 Sep')
    const out = def.outbound!(v, input)!
    expect(out).toMatchObject({
      kind: 'client_acknowledgement',
      mailboxId: world.salesId,
      // the thread's own mailbox, which is sales@
      to: [`buyer@${TAG}.example.test`],
      threadId: input.source!.threadId,
    })
    expect(out.inReplyToRfcId).toBe(input.source!.rfcMessageId)

    // Queuing records the promise; undo of the send takes it back.
    const actionId = randomUUID()
    await opsDb.$transaction(async (tx) => {
      await setActor(tx, { kind: 'user', id: world.ownerId })
      await def.onScheduled!(tx, v, {
        actionId,
        decidedById: world.ownerId,
        request: {
          actionKey: 'ack_email',
          subjectType: 'enquiry',
          subjectId: id,
          trigger: 't',
          origin: 'live',
          sourceVersion: 1,
        },
      })
    })
    expect((await opsDb.enquiry.findUniqueOrThrow({ where: { id } })).revertBy?.toISOString()).toBe(
      '2025-09-26T14:00:00.000Z'
    )
  })

  it('a thread held only by purchase@: a new message from sales@, never purchase@', async () => {
    const id = await enquiryFrom(world.purchaseId, 'purchase')
    const input = await gatherAck(id)
    const p = await def.propose(input, { call: async () => ({}) as never })
    if (!p.ok) throw new Error('propose failed')
    const v = await def.verify(p.out, input)
    expect(v.checks).toContainEqual({
      label: 'New message from sales@',
      status: 'warn',
      detail: 'the thread is only in purchase@',
    })
    const out = def.outbound!(v, input)!
    // A client (sales@) mailbox, never the purchase@ one that holds the thread.
    expect(out.mailboxId).not.toBe(world.purchaseId)
    expect((await opsDb.mailbox.findUniqueOrThrow({ where: { id: out.mailboxId } })).role).toBe(
      'client'
    )
    expect(out.threadId).toBeNull()
    expect(out.subject).toBe('RFQ SC/MM/25-1203 — compressor station spares')
  })

  it('undo of a queued acknowledgement clears the revert-by', async () => {
    const id = enquiries[0]!
    const a = await opsDb.assistantAction.create({
      data: {
        ref: `A-S08ACK-${Date.now().toString().slice(-6)}`,
        actionKey: 'ack_email',
        levelAtTime: 'draft_and_ask',
        subjectType: 'enquiry',
        subjectId: id,
        enquiryId: id,
        headline: 'Acknowledge',
        reasons: [],
        state: 'queued',
        decidedById: world.ownerId,
        idempotencyKey: `ack_email:test:${randomUUID()}`,
        basisHash: 'x',
        surface: 'review',
      } as never,
      select: { id: true },
    })
    await opsDb.$transaction(async (tx) => {
      await setActor(tx, { kind: 'user', id: world.ownerId })
      expect(await releaseOnUndo(tx, { id: a.id, actionKey: 'ack_email', output: null })).toBe(true)
    })
    expect((await opsDb.enquiry.findUniqueOrThrow({ where: { id } })).revertBy).toBeNull()
  })

  it('a client who asked for none gets no acknowledgement, with the reason', async () => {
    expect(await opsDb.$transaction((tx) => ackSkip(tx, companyId))).toBeNull()
    const pref = await opsDb.preference.create({
      data: {
        scope: 'client',
        kind: 'acknowledgement_skip',
        companyId,
        description: 'no need to acknowledge, just send the offer',
        value: {},
        actionKey: 'ack_email',
        createdAt: new Date('2025-08-03T06:00:00Z'),
      } as never,
      select: { id: true },
    })
    expect(await opsDb.$transaction((tx) => ackSkip(tx, companyId))).toBe(
      `Not sent. Sample Client ${TAG} asked on 3 Aug: “no need to acknowledge, just send the offer” · preference ${pref.id}`
    )
  })
})
