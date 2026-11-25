import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { opsDb, Prisma } from '@indus/ops-db'
import {
  buildQueueWorld,
  cleanQueue,
  localDatabaseUrl,
  type QueueWorld,
} from '../mail-send/testing/fixture'

/**
 * Board 36 on the local database (S08-T05): "Read lines" opens one intake per message (a second call returns it);
 * the body becomes an email file and the attachment its own queued file; the client comes from the sender, the
 * client ref from the subject, "needed by" from the sentence that asks for a date; a line saying "same as last
 * order" with no history becomes Unsure "Which earlier order?", and with a past quotation it cites the line; the
 * quoted earlier reply is never read.
 */
const DB_URL = localDatabaseUrl()
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
const events: Array<{ name: string; data: Record<string, unknown> }> = []
vi.mock('../../inngest/emit', () => ({
  emitEventOrThrow: async (e: { name: string; data: Record<string, unknown> }) =>
    void events.push(e),
  emitEvent: async () => true,
}))

const { startEmailIntake } = await import('./email-body')
const { annotateSameAsBefore } = await import('./past-line')
const { getEmailLines } = await import('../../data/email-lines')

const TAG = `s08email${Date.now()}`
const BODY = [
  'Dear team,',
  '',
  'Please quote your best price and delivery for the below, required onboard by 30 Sep.',
  '',
  'Item\tDescription\tP/N\tQty',
  '1\tDirectional valve NG10, 24 VDC\tTEST-NG10-24\t2 nos',
  '2\tReturn filter element\tTEST-HF-220\t6 nos',
  '',
  'Also need 4 nos pressure gauge 0-250 bar, same as last order.',
  '',
  'Best regards,',
  'Sample Buyer',
  '',
  'On 2 Sep 2026, Example Sales <sales@example.test> wrote:',
  '> Please find our quotation attached for the gauges, 9 nos of TEST-OLD-1.',
].join('\n')

describe.skipIf(!DB_URL)('email-body intake · local database', () => {
  let world: QueueWorld
  let companyId = ''
  let threadId = ''
  let messageId = ''
  let batchId = ''
  const storedIds: string[] = []

  beforeAll(async () => {
    world = await buildQueueWorld(opsDb, TAG)
    const domain = `${TAG}.example.test`
    companyId = (
      await opsDb.company.create({
        data: { name: `Sample Client ${TAG}`, domains: [domain] },
        select: { id: true },
      })
    ).id
    threadId = (
      await opsDb.mailThread.create({
        data: { mailboxId: world.salesId, gmailThreadId: `t-${TAG}` },
        select: { id: true },
      })
    ).id
    const stored = await opsDb.storedFile.create({
      data: {
        bucket: 'ops-mail',
        path: `test/${TAG}/drawing.pdf`,
        filename: 'drawing.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1200,
        sha256: 'f'.repeat(64),
        source: 'gmail_attachment',
      },
      select: { id: true },
    })
    storedIds.push(stored.id)
    messageId = (
      await opsDb.mailMessage.create({
        data: {
          mailboxId: world.salesId,
          threadId,
          gmailMessageId: `g-${TAG}`,
          direction: 'inbound',
          fromAddress: `buyer@${domain}`,
          fromName: 'Sample Buyer',
          toAddresses: ['sales@example.test'],
          ccAddresses: [],
          subject: 'RFQ – hydraulic spares / SC-RFQ-0924',
          bodyText: BODY,
          bodyTextHash: randomUUID(),
          sentAt: new Date('2026-09-22T06:14:00Z'),
          labelsApplied: [],
          origin: 'live',
          hasAttachments: true,
          attachments: {
            create: [
              {
                gmailAttachmentId: `a-${TAG}`,
                filename: 'drawing.pdf',
                sizeBytes: 1200,
                fileId: stored.id,
              },
              { gmailAttachmentId: `b-${TAG}`, filename: 'logo.gif', sizeBytes: 900 },
            ],
          },
        },
        select: { id: true },
      })
    ).id
  })

  afterAll(async () => {
    await opsDb.intakeBatch.deleteMany({ where: { mailMessageId: messageId } })
    // ops_app may not delete a quotation or an enquiry (by grant): the enquiry is closed and the neutral test
    // client stays behind with them.
    await opsDb.enquiry.updateMany({
      where: { clientId: companyId },
      data: { closedReason: 'other', closeNote: 'test', closedAt: new Date() },
    })
    await opsDb.mailThread.deleteMany({ where: { id: threadId } })
    await opsDb.storedFile.deleteMany({ where: { id: { in: storedIds } } })
    await cleanQueue(opsDb, TAG)
    // Each test file has its own client under --isolate=modules: release it, or a full run passes ops_app's 15.
    await opsDb.$disconnect()
  })

  it('opens one intake for the message: body + the readable attachment, facts read by code', async () => {
    const r = await startEmailIntake({ id: world.ownerId }, messageId)
    expect(r.created).toBe(true)
    batchId = r.batchId
    const b = await opsDb.intakeBatch.findUniqueOrThrow({
      where: { id: batchId },
      include: { files: { orderBy: { createdAt: 'asc' } } },
    })
    expect(b).toMatchObject({
      source: 'mail',
      clientCompanyId: companyId,
      clientRef: 'SC-RFQ-0924',
    })
    expect(b.deadline?.toISOString()).toBe('2026-09-30T14:00:00.000Z')
    expect(b.files.map((f) => [f.kind, f.status])).toEqual([
      ['email', 'queued'],
      ['pdf', 'queued'],
    ])
    expect(events.filter((e) => e.name === 'ops/document.capture.requested')).toHaveLength(2)
    expect(await startEmailIntake({ id: world.ownerId }, messageId)).toEqual({
      batchId,
      created: false,
    })
  })

  it('board 36 marks the table, keeps the earlier reply ignored, and shows the facts with their evidence', async () => {
    const m = (await getEmailLines('inbox', threadId))!
    expect(m.batch?.id).toBe(batchId)
    expect(m.blocks.map((b) => b.kind)).toEqual(['text', 'table', 'text', 'ignored'])
    expect(m.facts.clientRef).toEqual({ value: 'SC-RFQ-0924', sub: 'Found in the subject' })
    expect(m.facts.neededBy).toEqual({ date: '30 Sep 2026', quote: 'required onboard by 30 Sep' })
    expect(m.facts.client?.sub).toBe('Known domain · 0 past enquiries')
    expect(m.attachments).toEqual([
      expect.objectContaining({ name: 'drawing.pdf', chip: 'Queued' }),
    ])
    expect(m.unitsNote).toBe('The quoted reply from 2 Sep is not read.')
  })

  async function stageGauge() {
    const body = await opsDb.intakeFile.findFirstOrThrow({ where: { batchId, kind: 'email' } })
    const at = BODY.indexOf('Also need')
    const span = await opsDb.sourceSpan.create({
      data: {
        sourceKind: 'email',
        sourceId: messageId,
        charStart: at,
        charEnd: at + 40,
        quote: 'pressure gauge 0-250 bar',
        resolved: 'exact',
      },
      select: { id: true },
    })
    await opsDb.intakeLineCandidate.deleteMany({ where: { fileId: body.id } })
    await opsDb.intakeLineCandidate.create({
      data: {
        batchId,
        fileId: body.id,
        ord: 7,
        description: 'Pressure gauge 0-250 bar',
        qty: new Prisma.Decimal(4),
        uom: 'EA',
        uomRaw: 'nos',
        confidence: 'sure',
        sourceKind: 'email',
        sourceDetail: 'text',
        spanIds: [span.id],
        fieldSpans: { description: span.id },
      },
    })
    return body.id
  }

  it('"same as last order" with no history is Unsure: which earlier order?', async () => {
    const fileId = await stageGauge()
    expect(await annotateSameAsBefore(fileId)).toBe(1)
    const c = await opsDb.intakeLineCandidate.findFirstOrThrow({ where: { fileId } })
    expect(c.confidence).toBe('unsure')
    expect(c.unsure).toMatchObject({ field: 'reference', question: 'Which earlier order?' })
  })

  it('with a past quotation line, the line cites it', async () => {
    const enq = await opsDb.enquiry.create({
      data: {
        ref: `ENQ-2099-${String(Date.now()).slice(-7)}`,
        title: 'Earlier',
        clientId: companyId,
        receivedVia: 'manual',
        receivedAt: new Date('2026-09-01T06:00:00Z'),
      },
      select: { id: true },
    })
    await opsDb.quotation.create({
      data: {
        enquiryId: enq.id,
        clientId: companyId,
        number: `INDUS/Q99${String(Date.now()).slice(-4)}`,
        currency: 'AED',
        vatTreatment: 'local_standard',
        lines: {
          create: [
            {
              position: 1,
              lineNo: 4,
              description: 'Pressure gauge 0-250 bar, glycerine filled',
              qty: new Prisma.Decimal(4),
              uom: 'EA',
            },
          ],
        },
      },
    })
    const fileId = await stageGauge()
    await annotateSameAsBefore(fileId)
    const c = await opsDb.intakeLineCandidate.findFirstOrThrow({ where: { fileId } })
    expect(c.confidence).toBe('likely')
    expect((c.reasons as string[])[0]).toMatch(/^“Same as last order” → INDUS\/Q99\d+ line 4$/)
    const m = (await getEmailLines('inbox', threadId))!
    expect(m.lines.find((l) => l.ord === 7)).toMatchObject({ source: 'Text', label: 'Check' })
    expect(m.unitsNote).toBe(
      'Units read as written: “nos” → EA. The quoted reply from 2 Sep is not read.'
    )
  })
})
