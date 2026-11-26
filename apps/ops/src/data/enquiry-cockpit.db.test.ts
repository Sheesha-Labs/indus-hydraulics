import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { opsDb } from '@indus/ops-db'
import { localDatabaseUrl } from '../server/mail-send/testing/fixture'

/**
 * The enquiry cockpit on the local database (S09-T01): one enquiry with lines in several states, an open client
 * question, a done and a pending Assistant action. The read is two statements; the header follows the stage,
 * the tab and the viewer; the stage machine refuses a bad move and records a good one.
 */
const DB_URL = localDatabaseUrl()
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
vi.mock('../server/settings/get', () => ({
  getSetting: async () => ({ default: [6, 0], byCountry: {} }),
}))

const { getEnquiryCockpit } = await import('./enquiry-cockpit')
const { changeEnquiryStage, changeLineStatus, TransitionRefused, VersionConflict } = await import(
  '../server/enquiry/transition'
)

const TAG = `s09ck${Date.now()}`

describe.skipIf(!DB_URL)('enquiry cockpit · local database', () => {
  let enquiryId = ''
  let ref = ''
  let ownerId = ''
  const lineIds: string[] = []

  beforeAll(async () => {
    ownerId = (await opsDb.user.findFirstOrThrow({ where: { role: 'owner' }, select: { id: true } })).id
    const company = await opsDb.company.create({ data: { name: `Sample Client LLC ${TAG}` } })
    ref = `ENQ-2099-${String(Date.now()).slice(-7)}`
    const e = await opsDb.enquiry.create({
      data: {
        ref,
        title: 'Plant spares',
        clientId: company.id,
        clientRef: 'SCL/MM/99-0001',
        receivedVia: 'email',
        receivedAt: new Date(),
        deadline: new Date(Date.now() + 20 * 86_400_000),
        ownerId,
        lines: {
          create: [
            { no: 1, description: 'Gate valve', qty: 2, status: 'held', heldReason: 'trim' },
            { no: 2, description: 'Bearing', qty: 4, status: 'no_source' },
            { no: 3, description: 'Gauge', qty: 1 },
          ],
        },
      },
      select: { id: true, lines: { select: { id: true }, orderBy: { no: 'asc' } } },
    })
    enquiryId = e.id
    lineIds.push(...e.lines.map((l) => l.id))
    await opsDb.clientQuestion.create({
      data: { enquiryId, lineId: lineIds[0]!, question: 'Which trim?', status: 'sent', sentAt: new Date() },
    })
    const base = {
      actionKey: 'ack_email',
      levelAtTime: 'draft_and_ask',
      subjectType: 'enquiry',
      subjectId: enquiryId,
      enquiryId,
      reasons: [],
      basisHash: 'x',
      surface: 'review',
    } as const
    await opsDb.assistantAction.create({
      data: {
        ...base,
        ref: `A-S09CK-${Date.now().toString().slice(-6)}1`,
        headline: 'Acknowledge Sample Client LLC',
        state: 'done',
        idempotencyKey: `t:${randomUUID()}`,
      } as never,
    })
    await opsDb.assistantAction.create({
      data: {
        ...base,
        ref: `A-S09CK-${Date.now().toString().slice(-6)}2`,
        headline: 'Ask the client',
        state: 'proposed',
        idempotencyKey: `t:${randomUUID()}`,
      } as never,
    })
  })

  afterAll(async () => {
    await opsDb.assistantAction.updateMany({ where: { enquiryId, state: 'proposed' }, data: { state: 'cancelled' } })
    await opsDb.$disconnect()
  })

  it('reads the record in two statements and resolves the header', async () => {
    const spy = vi.spyOn(opsDb, '$queryRaw')
    const c = await getEnquiryCockpit(ref, 'owner', true)
    expect(spy).toHaveBeenCalledTimes(2)
    spy.mockRestore()
    expect(c).not.toBeNull()
    expect(c!.counts).toMatchObject({ linesTotal: 3, held: 1, noSource: 1, openQuestions: 1, questionLines: 1 })
    expect(c!.pending).toBe(1)
    expect(c!.done).toEqual(['Acknowledge Sample Client LLC'])
    const h = c!.header('overview')
    expect(h.cta).toEqual({ label: 'Choose path', href: `/enquiries/${ref}#qualification` })
    expect(h.chip).toEqual({ tone: 'warn', label: 'Waiting on client · 1 line' })
    expect(h.did).toBe('acknowledged Sample Client LLC')
    expect(h.need).toEqual({ count: 1, href: `/review?record=${encodeURIComponent(`enquiry:${enquiryId}`)}` })
    expect(h.meta[3].label).toBe('Client deadline')
    expect(h.meta[3].value).toMatch(/working days left$/)
    expect(c!.header('questions').cta).toEqual({
      label: 'Add question',
      href: `/enquiries/${ref}/questions?add=1`,
    })
  })

  it('an unknown ref is null', async () => {
    expect(await getEnquiryCockpit('ENQ-2099-0000000', 'owner', true)).toBeNull()
  })

  it('the machine refuses a bad move and records a good one', async () => {
    await expect(
      opsDb.$transaction((tx) =>
        changeEnquiryStage(tx, { enquiryId, to: 'sourcing', actor: { kind: 'user', id: ownerId } })
      )
    ).rejects.toBeInstanceOf(TransitionRefused)
    const before = await opsDb.enquiry.findUniqueOrThrow({ where: { id: enquiryId } })
    await opsDb.$transaction((tx) =>
      changeEnquiryStage(tx, {
        enquiryId,
        to: 'sourcing',
        ctx: { chosenPath: 'quote_fully' },
        data: { chosenPath: 'quote_fully' },
        actor: { kind: 'user', id: ownerId },
        expectedVersion: before.version,
      })
    )
    const after = await opsDb.enquiry.findUniqueOrThrow({ where: { id: enquiryId } })
    expect(after).toMatchObject({ stage: 'sourcing', chosenPath: 'quote_fully', version: before.version + 1 })
    const ev = await opsDb.activityEvent.findFirstOrThrow({
      where: { subjectType: 'enquiry', subjectId: enquiryId, field: 'stage' },
      orderBy: { at: 'desc' },
    })
    expect(ev).toMatchObject({ before: 'new', after: 'sourcing', kind: 'status', actorId: ownerId })
    await expect(
      opsDb.$transaction((tx) =>
        changeEnquiryStage(tx, {
          enquiryId,
          to: 'quotes_in',
          actor: { kind: 'user', id: ownerId },
          expectedVersion: before.version,
        })
      )
    ).rejects.toBeInstanceOf(VersionConflict)
    // The cockpit's header follows: sourcing → "Send RFQs".
    expect((await getEnquiryCockpit(ref, 'owner', true))!.header('overview').cta?.label).toBe('Send RFQs')
  })

  it('lines move only through the line machine', async () => {
    await expect(
      opsDb.$transaction((tx) =>
        changeLineStatus(tx, { lineId: lineIds[2]!, to: 'quoted', actor: { kind: 'system' } })
      )
    ).rejects.toThrow('Open cannot move to Quoted')
    await opsDb.$transaction((tx) =>
      changeLineStatus(tx, {
        lineId: lineIds[2]!,
        to: 'held',
        data: { heldReason: 'connection size' },
        actor: { kind: 'system' },
      })
    )
    expect((await opsDb.enquiryLine.findUniqueOrThrow({ where: { id: lineIds[2]! } })).status).toBe('held')
  })
})
