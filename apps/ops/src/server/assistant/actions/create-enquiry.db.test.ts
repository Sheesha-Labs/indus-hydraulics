import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { opsDb, Prisma } from '@indus/ops-db'
import {
  buildQueueWorld,
  cleanQueue,
  localDatabaseUrl,
  type QueueWorld,
} from '../../mail-send/testing/fixture'

/**
 * Action #4 Create enquiry on the local database (S08-T06), with the model's unpack given (no network): a
 * forwarded email resolves to the original sender's company; the cover-email terms and the closing date are read
 * with spans; approving writes the enquiry with an ENQ number and its Sure and Likely lines only, asks for the
 * acknowledgement and one question card per Unsure line, and links the thread; the question card writes its line
 * as the person's decision; undo closes the enquiry, keeping its number, and reopens the intake. Revision and duplicate variants
 * are detected from open enquiries.
 */
const DB_URL = localDatabaseUrl()
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
vi.mock('../../../inngest/emit', () => ({
  emitEventOrThrow: async () => undefined,
  emitEvent: async () => true,
}))

vi.mock('../../settings/get', () => ({
  getSetting: async (key: string) =>
    key === 'intake'
      ? { callbackAlertMinutes: 45, duplicateWindowDays: 7, maxUploadMb: 20 }
      : key === 'calendar.country_weekends'
        ? { default: [6, 0], byCountry: {} }
        : {},
}))

await import('./index')
const { default: def, detectVariant, gatherCreateEnquiry } = await import('./create-enquiry')
const { default: resolveDef } = await import('./resolve-extracted-line')
const { setActor } = await import('../write-tracked')

const TAG = `s08enq${Date.now()}`
const BODY = [
  'Please address.',
  '',
  '---------- Forwarded message ---------',
  `From: Sample Buyer <buyer@${TAG}.example.test>`,
  'Date: Thu, 24 Sep 2026 at 08:14',
  'Subject: RFQ SC/MM/26-1203 compressor station spares',
  '',
  'Dear Sir, please quote your best price for the items in the attached RFQ, C&F Kuwait Port. Payment 100% LC/TT. Please list any deviations, otherwise 100% compliance will be assumed. Closing date 28 September.',
].join('\n')

const UNPACK = {
  realClient: {
    companyName: 'Sample Client LLC',
    contactName: 'Sample Buyer',
    email: `buyer@${TAG}.example.test`,
    quote: `From: Sample Buyer <buyer@${TAG}.example.test>`,
  },
  isForward: true,
  forwardedBy: 'Owner Example',
  clientRef: { value: 'SC/MM/26-1203', quote: 'RFQ SC/MM/26-1203 compressor station spares' },
  quoteDueBy: { value: '28 September', quote: 'Closing date 28 September' },
  goodsNeededBy: { value: '', quote: '' },
  terms: {
    incoterm: { value: 'C&F Kuwait Port', quote: 'C&F Kuwait Port' },
    payment: { value: '100% LC/TT', quote: 'Payment 100% LC/TT' },
    compliance: {
      value: 'List deviations, or 100% compliance is assumed',
      quote: 'Please list any deviations, otherwise 100% compliance will be assumed',
    },
    validity: { value: '', quote: '' },
    partial: { value: '', quote: '' },
  },
  revision: { isRevision: false, earlierRef: '', quote: '' },
  notes: [],
}

describe.skipIf(!DB_URL)('create enquiry (#4) · local database', () => {
  let world: QueueWorld
  let companyId = ''
  let messageId = ''
  let batchId = ''
  let enquiryId = ''
  let ref = ''
  let unsureId = ''
  const year = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai', year: 'numeric' }).format(
    new Date()
  )

  beforeAll(async () => {
    world = await buildQueueWorld(opsDb, TAG)
    const seq = await opsDb.numberSequence.findUniqueOrThrow({
      where: { key: 'enquiry' },
      select: { seededAt: true },
    })
    if (!seq.seededAt)
      await opsDb.$executeRaw`SELECT ops.seed_number_sequence('enquiry', 9001, '{"source":"local test"}'::jsonb, ${year}, ${world.ownerId}::uuid)`
    const co = await opsDb.company.create({
      data: { name: `Sample Client ${TAG}`, domains: [`${TAG}.example.test`] },
      select: { id: true },
    })
    companyId = co.id
    await opsDb.contact.create({
      data: { companyId, name: 'Sample Buyer', email: `buyer@${TAG}.example.test` },
    })
    const thread = await opsDb.mailThread.create({
      data: { mailboxId: world.purchaseId, gmailThreadId: `t-${TAG}` },
      select: { id: true },
    })
    messageId = (
      await opsDb.mailMessage.create({
        data: {
          mailboxId: world.purchaseId,
          threadId: thread.id,
          gmailMessageId: `g-${TAG}`,
          direction: 'inbound',
          fromAddress: `s04q-${TAG}-sales@example.test`,
          fromName: 'Owner Example',
          toAddresses: [`s04q-${TAG}-purchase@example.test`],
          ccAddresses: [],
          subject: 'Fwd: RFQ SC/MM/26-1203 — compressor station spares',
          bodyText: BODY,
          bodyTextHash: randomUUID(),
          isForward: true,
          sentAt: new Date('2026-09-24T06:05:00Z'),
          labelsApplied: [],
          origin: 'live',
          classification: 'client_enquiry',
        },
        select: { id: true },
      })
    ).id
    const b = await opsDb.intakeBatch.create({
      data: { source: 'mail', mailMessageId: messageId, clientRef: 'SC/MM/26-1203' },
      select: { id: true },
    })
    batchId = b.id
    const line = (
      ord: number,
      confidence: 'sure' | 'likely' | 'unsure',
      over: Partial<Prisma.IntakeLineCandidateUncheckedCreateInput> = {}
    ) =>
      opsDb.intakeLineCandidate.create({
        data: {
          batchId,
          ord,
          description: `Valve spare item ${ord}`,
          qty: new Prisma.Decimal(ord * 2),
          uom: 'EA',
          partNo: `TEST-${TAG.slice(-4)}-${ord}`,
          confidence,
          ...over,
        },
        select: { id: true },
      })
    await line(1, 'sure')
    await line(2, 'sure')
    await line(3, 'likely')
    unsureId = (
      await line(4, 'unsure', {
        partNo: 'TEST-1O-220',
        unsure: {
          field: 'partNumber',
          question: 'Line 4 · which part number is right?',
          options: [
            { value: 'TEST-10-220', label: 'TEST-10-220', sub: 'seen on 3 past RFQs' },
            { value: 'TEST-1O-220', label: 'TEST-1O-220', sub: 'as read' },
          ],
        },
      })
    ).id
  })

  afterAll(async () => {
    await opsDb.enquiry.updateMany({
      where: { clientId: companyId, closedAt: null },
      data: { closedReason: 'other', closeNote: 'test', closedAt: new Date() },
    })
    await opsDb.intakeBatch.deleteMany({ where: { id: batchId } })
    await cleanQueue(opsDb, TAG)
    await opsDb.$disconnect()
  })

  let verified: Awaited<ReturnType<typeof def.verify>>
  let input: Awaited<ReturnType<typeof gatherCreateEnquiry>>

  it('unpacks the forward: the original sender’s company, the reference, the deadline and three terms', async () => {
    input = await gatherCreateEnquiry(messageId, batchId)
    expect(input.lines).toHaveLength(4)
    verified = await def.verify({ unpack: UNPACK } as never, input)
    const o = verified.out
    expect(o.client).toMatchObject({ companyId, how: 'forward' })
    expect(o.clientRef).toBe('SC/MM/26-1203')
    expect(o.deadline).toBe('2026-09-28')
    expect(o.terms.map((t) => t.label)).toEqual(['Incoterm', 'Payment', 'Compliance'])
    expect(o.terms.every((t) => t.spanId)).toBe(true)
    expect(o.spans.forward).not.toBeNull()
    expect(o).toMatchObject({ lineCount: 4, unsure: 1, sure: 2, variant: null })
    expect(verified.confidence).toBe('sure')
    const p = def.toProposal(verified, input)
    expect(p.headline).toMatch(
      /^Create enquiry ENQ-\d{4}-\d+ for Sample Client s08enq\d+ from this email · 4 lines · deadline 28 Sep\.$/
    )
    expect(p.reasons[0]!.text).toMatch(
      /^Forwarded by Owner Example; the original sender is Sample Buyer, an existing client contact\.$/
    )
    expect(p.checks.map((c) => c.label)).toContain('Cover-email terms captured')
    expect(p.onApproveText).toMatch(/^Creates the enquiry, links this thread/)
  })

  it('approve: one enquiry, Sure and Likely lines only, the thread linked, the follow-ups requested', async () => {
    const out = await opsDb.$transaction(async (tx) => {
      await setActor(tx, { kind: 'assistant' })
      return def.effect(tx, verified, {
        actionId: randomUUID(),
        ref: 'A-TEST',
        request: {
          actionKey: 'create_enquiry',
          subjectType: 'mail_message',
          subjectId: messageId,
          trigger: 'intake.settled',
          origin: 'live',
          sourceVersion: batchId,
        },
        level: 'draft_and_ask',
        chosenOption: null,
        decidedById: world.ownerId,
      })
    })
    const b = await opsDb.intakeBatch.findUniqueOrThrow({ where: { id: batchId } })
    expect(b.status).toBe('confirmed')
    enquiryId = b.enquiryId!
    const e = await opsDb.enquiry.findUniqueOrThrow({
      where: { id: enquiryId },
      include: { lines: { orderBy: { no: 'asc' } } },
    })
    ref = e.ref
    expect(e).toMatchObject({
      clientId: companyId,
      clientRef: 'SC/MM/26-1203',
      receivedVia: 'forwarded_email',
      requestedIncoterm: 'C&F Kuwait Port',
      requestedPayment: '100% LC/TT',
    })
    expect(e.deadline?.toISOString()).toBe('2026-09-28T14:00:00.000Z')
    expect(e.lines.map((l) => l.description)).toEqual([
      'Valve spare item 1',
      'Valve spare item 2',
      'Valve spare item 3',
    ])
    expect(await opsDb.mailLink.count({ where: { messageId, enquiryId } })).toBe(1)
    const names = (out.emit ?? []).map((x) => [x.name, x.data.actionKey ?? null])
    expect(names).toContainEqual(['ops/enquiry.created', null])
    expect(names).toContainEqual(['ops/mail.linked', null])
    expect(names).toContainEqual(['ops/action.requested', 'resolve_extracted_line'])
  })

  it('the question card writes its line as the person’s decision', async () => {
    const { input: q } = await resolveDef.gather({
      request: {
        actionKey: 'resolve_extracted_line',
        subjectType: 'enquiry',
        subjectId: enquiryId,
        trigger: 'enquiry.created',
        origin: 'live',
        sourceVersion: unsureId,
      },
    })
    const v = await resolveDef.verify(q, q)
    const p = resolveDef.toProposal(v, q)
    expect(p.headline).toBe(`${ref} · Line 4 · which part number is right?`)
    expect(p.options?.map((o) => o.key)).toEqual(['TEST-10-220', 'TEST-1O-220', '__as_read'])
    await opsDb.$transaction(async (tx) => {
      await setActor(tx, { kind: 'user', id: world.ownerId })
      await resolveDef.effect(tx, v, {
        actionId: randomUUID(),
        ref: 'A-TEST-Q',
        request: {
          actionKey: 'resolve_extracted_line',
          subjectType: 'enquiry',
          subjectId: enquiryId,
          trigger: 't',
          origin: 'live',
          sourceVersion: unsureId,
        },
        level: 'draft_and_ask',
        chosenOption: 'TEST-10-220',
        decidedById: world.ownerId,
      })
    })
    const l = await opsDb.enquiryLine.findFirstOrThrow({ where: { enquiryId, no: 4 } })
    expect(l).toMatchObject({ clientPartNo: 'TEST-10-220', extractionConfidence: 'unsure' })
    const c = await opsDb.intakeLineCandidate.findUniqueOrThrow({ where: { id: unsureId } })
    expect(c.decision).toBe('edited')
    expect(c.reasons).toContain('Decided by OE')
  })

  it('undo closes the enquiry (its number stays on it) and reopens the intake', async () => {
    await opsDb.$transaction(async (tx) => {
      await setActor(tx, { kind: 'assistant' })
      await def.undo!(tx, { id: randomUUID(), output: verified.out })
    })
    const e = await opsDb.enquiry.findUniqueOrThrow({ where: { id: enquiryId } })
    expect(e).toMatchObject({ closedReason: 'other', closeNote: 'undone' })
    const n = await opsDb.issuedNumber.findFirstOrThrow({
      where: { sequenceKey: 'enquiry', formatted: ref },
    })
    expect(n).toMatchObject({ status: 'issued', recordId: enquiryId })
    expect((await opsDb.intakeBatch.findUniqueOrThrow({ where: { id: batchId } })).status).toBe(
      'open'
    )
    expect(await opsDb.mailLink.count({ where: { messageId, enquiryId } })).toBe(0)
  })

  it('variants: the same reference on an open enquiry is a revision, or a duplicate when the lines match', () => {
    const base = {
      lines: [
        {
          id: 'a',
          description: 'Ball valve 2" class 300',
          qty: '4',
          confidence: 'sure' as const,
          file: null,
        },
        {
          id: 'b',
          description: 'Gate valve 4" class 150',
          qty: '2',
          confidence: 'sure' as const,
          file: null,
        },
      ],
      windowDays: 7,
      sentAt: '2026-09-24T06:00:00Z',
    }
    const open = (lines: string[]) => [
      {
        enquiryId: 'e1',
        ref: 'ENQ-2026-0419',
        clientRef: 'SC/MM/26-1187',
        clientId: 'c1',
        receivedAt: '2026-09-23T06:00:00Z',
        lines,
      },
    ]
    const none = { isRevision: false, earlierRef: '', quote: '' }
    expect(
      detectVariant(
        { ...base, open: open(['Something else entirely']) },
        'SC/MM/26-1187',
        'c1',
        none
      )
    ).toMatchObject({ kind: 'revision', ref: 'ENQ-2026-0419' })
    expect(
      detectVariant(
        { ...base, open: open(['Ball valve 2" class 300', 'Gate valve 4" class 150']) },
        'SC/MM/26-1187',
        'c1',
        none
      )
    ).toMatchObject({ kind: 'duplicate' })
    expect(
      detectVariant(
        { ...base, open: open(['Ball valve 2" class 300', 'Gate valve 4" class 150']) },
        null,
        'c1',
        none
      )
    ).toMatchObject({
      kind: 'duplicate',
      reason: 'Most lines match ENQ-2026-0419, received yesterday.',
    })
    expect(detectVariant({ ...base, open: open(['Other']) }, 'SC-NEW-1', 'c1', none)).toBeNull()
    expect(
      detectVariant({ ...base, open: open(['Other']) }, 'SC-NEW-2', 'c1', {
        isRevision: true,
        earlierRef: 'SC/MM/26-1187',
        quote: 'Rev B',
      })
    ).toMatchObject({ kind: 'revision' })
  })
})
