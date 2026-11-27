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
 * `regret_client` on the local database (S09-T06, board 168): the awaiting templates filled in code, from sales@ in
 * the client's thread; the reason chips (suggested from what suppliers said) and the "glad to quote on" switch; the
 * reverse identifier check (a supplier's name in the text fails the card, refuses approval with the term, and the
 * send gate stops the exact bytes); the money scan; and onSent: whole → Regretted with the reason, lines →
 * Regretted with it (a line that moved on is left and noted), open RFQ recipients asked to be withdrawn.
 */
const DB_URL = localDatabaseUrl()
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
vi.mock('../../../inngest/emit', () => ({
  emitEventOrThrow: async () => undefined,
  emitEvent: async () => true,
}))

await import('./index')
const { default: def } = await import('./regret-client')
const { gatherRegret, linesSentence, categoryList } = await import('../../enquiry/regret')
const { scopeVersion } = await import('../../enquiry/choose-path')
const { setActor } = await import('../write-tracked')
const { gateHooks } = await import('../../mail-send/hooks')
const { registerClientIdentityGate } = await import('../../identity/client-bound')

const TAG = `s09rg${Date.now()}`
const SUPPLIER = `Kestrel${TAG.slice(-5)} Valve Co`

describe.skipIf(!DB_URL)('regret to client · local database', () => {
  let world: QueueWorld
  let clientId = ''
  let supplierId = ''
  const enquiries: string[] = []
  let rfqSeq = 0

  async function enquiry(
    label: string,
    opts: { title?: string; stage?: 'qualifying' | 'sourcing' } = {}
  ) {
    const thread = await opsDb.mailThread.create({
      data: { mailboxId: world.salesId, gmailThreadId: `t-${TAG}-${label}` },
      select: { id: true },
    })
    const m = await opsDb.mailMessage.create({
      data: {
        mailboxId: world.salesId,
        threadId: thread.id,
        gmailMessageId: `g-${TAG}-${label}`,
        rfcMessageId: `${randomUUID()}@client.example.test`,
        direction: 'inbound',
        fromAddress: `buyer@${TAG}.example.test`,
        fromName: 'Sample Buyer',
        toAddresses: ['sales@example.test'],
        ccAddresses: [],
        subject: 'RFQ FC/MNT/26-311 kiln drive gearbox spares',
        bodyText: 'Please quote the attached spares for the kiln main drive gearbox.',
        bodyTextHash: randomUUID(),
        sentAt: new Date('2026-09-21T05:00:00Z'),
        labelsApplied: [],
        origin: 'live',
      },
      select: { id: true },
    })
    const e = await opsDb.enquiry.create({
      data: {
        ref: `ENQ-2099-${String(Date.now()).slice(-6)}${label.length}`,
        title: opts.title ?? 'Kiln drive gearbox spares',
        clientId,
        clientRef: 'FC/MNT/26-311',
        receivedVia: 'email',
        receivedAt: new Date('2026-09-21T05:00:00Z'),
        deadline: new Date(Date.now() + 6 * 86_400_000),
        stage: opts.stage ?? 'qualifying',
        lines: {
          create: Array.from({ length: 4 }, (_, i) => ({
            no: i + 1,
            description:
              i === 3 ? 'Final drive gearbox assembly, complete' : `Gearbox spare ${i + 1}`,
            qty: 2,
          })),
        },
      },
      select: { id: true, ref: true },
    })
    enquiries.push(e.id)
    await opsDb.intakeBatch.create({
      data: { source: 'mail', mailMessageId: m.id, status: 'confirmed', enquiryId: e.id },
    })
    // One RFQ to the supplier, still waiting, and the supplier declined another.
    const rfq = await opsDb.supplierRfq.create({
      data: {
        ref: `IH-RFQ-9${String(Date.now()).slice(-3)}-P${String(++rfqSeq).padStart(2, '0')}${String(Date.now()).slice(-4)}`,
        enquiryId: e.id,
      },
      select: { id: true },
    })
    const line4 = await opsDb.enquiryLine.findFirstOrThrow({ where: { enquiryId: e.id, no: 4 } })
    await opsDb.supplierRfqLine.create({
      data: { rfqId: rfq.id, lineId: line4.id, position: 1, qtyAsked: 2 },
    })
    await opsDb.supplierRfqRecipient.create({
      data: { rfqId: rfq.id, supplierId, status: 'regretted' },
    })
    return e
  }

  const request = (enquiryId: string, scope: 'whole' | 'lines', lineNos: number[] = []) => ({
    actionKey: 'regret_client',
    subjectType: 'enquiry' as const,
    subjectId: enquiryId,
    enquiryId,
    trigger: 'enquiry.path.chosen',
    origin: 'live' as const,
    sourceVersion: scopeVersion(scope, lineNos, new Date()),
  })

  beforeAll(async () => {
    world = await buildQueueWorld(opsDb, TAG)
    clientId = (
      await opsDb.company.create({
        data: { name: `Sample Client ${TAG}`, isClient: true },
        select: { id: true },
      })
    ).id
    supplierId = (
      await opsDb.company.create({
        data: {
          name: SUPPLIER,
          isSupplier: true,
          primaryDomain: `kestrel-${TAG}.example.test`,
          contacts: { create: { name: 'Sales desk', email: `sales@kestrel-${TAG}.example.test` } },
        },
        select: { id: true },
      })
    ).id
  })

  afterAll(async () => {
    await opsDb.outboundEmail.deleteMany({ where: { idempotencyKey: { startsWith: TAG } } })
    await opsDb.supplierRfq.deleteMany({ where: { enquiryId: { in: enquiries } } })
    await opsDb.intakeBatch.deleteMany({ where: { enquiryId: { in: enquiries } } })
    await opsDb.enquiry.updateMany({
      where: { id: { in: enquiries } },
      data: { closedReason: 'other', closeNote: 'test', closedAt: new Date() },
    })
    await cleanQueue(opsDb, TAG)
    await opsDb.$disconnect()
  })

  it('pure wording helpers', () => {
    expect(linesSentence([{ no: 14, description: 'the final drive gearbox assembly' }])).toBe(
      'line 14, the final drive gearbox assembly'
    )
    expect(
      linesSentence([
        { no: 3, description: 'a' },
        { no: 5, description: 'b' },
        { no: 9, description: 'c' },
      ])
    ).toBe('lines 3, 5 and 9')
    expect(categoryList(['hydraulic hoses and fittings', 'seals', 'bearings', 'valves'])).toBe(
      'hydraulic hoses and fittings, seals, bearings and valves'
    )
  })

  it('whole enquiry: the template in the client’s thread, reason suggested from the supplier’s decline', async () => {
    const e = await enquiry('whole')
    const req = request(e.id, 'whole')
    const input = await gatherRegret(e.id, req.sourceVersion)
    expect(input.scope).toBe('whole')
    expect(input.suggestedReason).toBe('no_source_found')
    expect(input.outcomes.declined).toEqual([SUPPLIER])
    const p = await def.propose(input, { call: async () => ({}) as never })
    if (!p.ok) throw new Error('propose failed')
    expect(p.out.subject).toBe('Re: RFQ FC/MNT/26-311 kiln drive gearbox spares')
    expect(
      p.out.body.startsWith(
        'Dear Sample Buyer,\n\nThank you for your enquiry FC/MNT/26-311 for kiln drive gearbox spares, and for considering us.'
      )
    ).toBe(true)
    expect(p.out.body).toContain('we are unable to offer the items requested.')
    expect(p.out.identity).toEqual([])
    const v = await def.verify(p.out, input)
    expect(v.confidence).toBe('sure')
    expect(v.checks.map((c) => [c.label, c.status])).toContainEqual([
      'No supplier names, prices or margins in the email',
      'pass',
    ])
    expect(v.checks.map((c) => c.label)).toContain('In the client’s thread, with the signature')
    const card = def.toProposal(v, input)
    expect(card.headline).toBe(
      `Send a regret to Sample Client ${TAG} and close ${e.ref} as Regretted.`
    )
    // Internal reasons may name the supplier; the email never does.
    expect(card.reasons[0]!.text).toBe(`${SUPPLIER} has declined.`)
    const preview = card.preview as {
      reasonChips: { options: Array<{ value: string }>; value: string }
      toggle?: { textOff: string }
    }
    expect(preview.reasonChips.value).toBe('no_source_found')
    expect(preview.reasonChips.options.map((o) => o.value)).toEqual([
      'no_source_found',
      'deadline_too_short',
      'not_our_range',
      'client_unresponsive',
      'other',
    ])
    // The switch exists only with quotation history (the "glad to quote on" line names its categories).
    expect(!!preview.toggle).toBe(input.categories.length > 0)
    const out = def.outbound!(v, input)!
    expect(out).toMatchObject({
      kind: 'regret',
      mailboxId: world.salesId,
      threadId: input.source!.threadId,
    })

    // Sent: Regretted with the reason, the waiting recipient asked to be withdrawn.
    await opsDb.supplierRfqRecipient.updateMany({
      where: { supplierId, rfq: { enquiryId: e.id } },
      data: { status: 'sent' },
    })
    const emit = await opsDb.$transaction(async (tx) => {
      await setActor(tx, { kind: 'system' })
      return def.onSent!(tx, {
        id: randomUUID(),
        output: p.out,
        request: req,
        decidedById: world.ownerId,
        chosenOption: 'not_our_range',
      })
    })
    const after = await opsDb.enquiry.findUniqueOrThrow({ where: { id: e.id } })
    expect(after.stage).toBe('regretted')
    expect(after.regretReason).toBe('not_our_range')
    expect((emit ?? []).map((x) => x.name)).toEqual(['ops/rfq.withdraw.requested'])
  })

  it('a supplier’s name in the text fails the card, blocks approval with the term, and stops the send', async () => {
    const e = await enquiry('named', { title: `${SUPPLIER.split(' ')[0]} gearbox spares` })
    const req = request(e.id, 'whole')
    const input = await gatherRegret(e.id, req.sourceVersion)
    const p = await def.propose(input, { call: async () => ({}) as never })
    if (!p.ok) throw new Error('propose failed')
    expect(p.out.identity.map((h) => h.kind)).toContain('supplier name')
    const v = await def.verify(p.out, input)
    expect(v.confidence).toBe('unsure')
    expect(v.checks.find((c) => c.label.startsWith('No supplier names'))).toMatchObject({
      status: 'fail',
      detail: expect.stringContaining('names a supplier'),
    })
    expect(def.outbound!(v, input)).toBeNull()

    // Approval re-checks the final text: an edit that adds the supplier's domain or a price is refused.
    expect(
      await def.approvalCheck!(
        { subject: 'Re: RFQ', body: 'Thank you. We could not source it.' },
        req
      )
    ).toBeNull()
    expect(
      await def.approvalCheck!(
        { subject: 'Re: RFQ', body: `Our partner kestrel-${TAG}.example.test declined.` },
        req
      )
    ).toContain(`kestrel-${TAG}.example.test`)
    expect(
      await def.approvalCheck!({ subject: 'Re: RFQ', body: 'It would cost USD 1,200.' }, req)
    ).toContain('“USD 1,200”')

    // The send gate scans the exact bytes of a regret row.
    registerClientIdentityGate()
    const gate = gateHooks().extra.get('client_identity')!
    const row = await opsDb.outboundEmail.create({
      data: {
        kind: 'regret',
        subject: 'Re: RFQ',
        bodyHtml: '<p>x</p>',
        bodyText: `Sorry, ${SUPPLIER} could not quote.`,
        idempotencyKey: `${TAG}:gate`,
        enquiryId: e.id,
        mailboxId: world.salesId,
      } as never,
      select: { id: true },
    })
    expect(await gate({ outboundId: row.id, kind: 'regret', basisHash: null })).toBe(
      'client_identity'
    )
    expect(await gate({ outboundId: row.id, kind: 'quotation', basisHash: null })).toBeNull()
  })

  it('lines only: the lines regretted with the reason; a line that moved on is left and noted', async () => {
    const e = await enquiry('lines', { stage: 'sourcing' })
    const req = request(e.id, 'lines', [3, 4])
    const input = await gatherRegret(e.id, req.sourceVersion)
    expect(input.lines.map((l) => l.no)).toEqual([3, 4])
    expect(input.otherLines).toBe(2)
    const p = await def.propose(input, { call: async () => ({}) as never })
    if (!p.ok) throw new Error('propose failed')
    expect(p.out.body).toContain('We are unable to quote lines 3 and 4.')
    const v = await def.verify(p.out, input)
    expect(def.toProposal(v, input).headline).toBe(
      `Regret lines 3, 4 to Sample Client ${TAG}; 2 lines still quoted.`
    )
    // Line 3 went to suppliers meanwhile: sourcing → regretted is not a move the machine allows.
    const l3 = await opsDb.enquiryLine.findFirstOrThrow({ where: { enquiryId: e.id, no: 3 } })
    await opsDb.enquiryLine.update({ where: { id: l3.id }, data: { status: 'sourcing' } })
    await opsDb.$transaction(async (tx) => {
      await setActor(tx, { kind: 'system' })
      await def.onSent!(tx, {
        id: randomUUID(),
        output: p.out,
        request: req,
        decidedById: world.ownerId,
        chosenOption: 'deadline_too_short',
      })
    })
    const lines = await opsDb.enquiryLine.findMany({
      where: { enquiryId: e.id },
      orderBy: { no: 'asc' },
      select: { no: true, status: true, regretReason: true },
    })
    expect(lines).toEqual([
      { no: 1, status: 'open', regretReason: null },
      { no: 2, status: 'open', regretReason: null },
      { no: 3, status: 'sourcing', regretReason: null },
      { no: 4, status: 'regretted', regretReason: 'deadline_too_short' },
    ])
    expect((await opsDb.enquiry.findUniqueOrThrow({ where: { id: e.id } })).stage).toBe('sourcing')
    const note = await opsDb.activityEvent.findFirst({
      where: { enquiryId: e.id, field: 'lineRegret' },
      select: { note: true },
    })
    expect(note?.note).toBe('The regret left, but line 3 had moved on and was not marked Regretted')
  })
})
