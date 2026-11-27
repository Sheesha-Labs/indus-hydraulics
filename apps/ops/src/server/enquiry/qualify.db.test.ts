import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { opsDb } from '@indus/ops-db'
import {
  buildQueueWorld,
  cleanQueue,
  localDatabaseUrl,
  type QueueWorld,
} from '../mail-send/testing/fixture'

/**
 * The quick read and the path (S09-T06, board 167, 171b states 1–3) on the local database:
 *   - gather reads the sender, history, lines, deadline and the two probes, and never the company's country or city
 *     (the model's payload is checked for them)
 *   - three reads with a fake model: legitimate (Sure, partial suggested), suspicious (Unsure, "Is this a real
 *     buyer?"), a sign-in link (spam, Sure, whatever the model says)
 *   - the read lands on the enquiry and moves new → qualifying; the Overview shows the card and the paths
 *   - every path: quote fully / partial → Sourcing (+ the line regret request), ask first, regret, ignore (spam) with
 *     its undo; chosen once; a stale version is refused
 */
const DB_URL = localDatabaseUrl()
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
  emitEventOrThrow: async (e: { name: string; data: Record<string, unknown> }) =>
    void h.emitted.push(e),
  emitEvent: async (e: { name: string; data: Record<string, unknown> }) => (
    h.emitted.push(e),
    true
  ),
}))
vi.mock('../settings/get', () => ({
  getSetting: async (key: string) =>
    ({
      'qualify.free_mail_domains': { domains: ['webmail.example'] },
      'qualify.rdap_enabled': { enabled: true },
      'ack.revert_by': {
        pricingDays: 0.5,
        bufferDays: 2,
        defaultSupplierReplyDays: 2,
        defaultNoDeadlineDays: 3,
      },
      'calendar.country_weekends': { default: [6, 0], byCountry: {} },
      'pricing.defaults': { marginPct: 18 },
      'landed.defaults': {},
    })[key] ?? {},
}))

await import('../assistant/actions')
const { default: def } = await import('../assistant/actions/qualify-enquiry')
const { gatherQualify } = await import('./qualify')
const { choosePath, undoSpam, markQuickReadAsked, ChoosePathError } = await import('./choose-path')
const { VersionConflict } = await import('./transition')
const { getEnquiryOverview } = await import('../../data/enquiry-overview')
const { setActor } = await import('../assistant/write-tracked')

const TAG = `s09q${Date.now()}`
type ModelOut = import('../assistant/prompts/qualify-enquiry.v1').QualifyModelOut

describe.skipIf(!DB_URL)('quick read and path · local database', () => {
  let world: QueueWorld
  let clientId = ''
  const enquiries: string[] = []
  const users: Array<{ id: string; initials: string; role: 'owner' | 'helper' }> = []

  async function enquiry(
    label: string,
    body: string,
    from = `buyer@sample-mining-${TAG}.example.test`
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
        fromAddress: from,
        toAddresses: ['sales@example.test'],
        ccAddresses: [],
        subject: 'RFQ SMS/PR/2609-77 hydraulic spares',
        bodyText: body,
        bodyTextHash: randomUUID(),
        sentAt: new Date(Date.now() - 120_000),
        labelsApplied: [],
        origin: 'live',
        classification: 'client_enquiry',
      },
      select: { id: true },
    })
    const e = await opsDb.enquiry.create({
      data: {
        ref: `ENQ-2099-${String(Date.now()).slice(-6)}${label.length}`,
        title: 'Hydraulic hoses, fittings and excavator spares',
        clientId,
        clientRef: 'SMS/PR/2609-77',
        receivedVia: 'email',
        receivedAt: new Date(Date.now() - 120_000),
        deadline: new Date(Date.now() + 3 * 86_400_000),
        lines: {
          create: Array.from({ length: 5 }, (_, i) => ({
            no: i + 1,
            description:
              i === 4 ? 'Final drive gearbox, OEM part only' : `Hose assembly 1/2in R2 ${i + 1}`,
            specNotes: i === 4 ? 'OEM part number only' : null,
            qty: 2 + i,
          })),
        },
      },
      select: { id: true, ref: true, version: true },
    })
    enquiries.push(e.id)
    await opsDb.intakeBatch.create({
      data: { source: 'mail', mailMessageId: m.id, status: 'confirmed', enquiryId: e.id },
    })
    return { ...e, messageId: m.id }
  }

  const probes = {
    rdap: async () => ({ ageDays: 4000, year: 2015 }),
    head: async () => true,
  }
  const young = { rdap: async () => ({ ageDays: 21, year: 2026 }), head: async () => false }

  function fakeAi(out: ModelOut, seen: string[] = []) {
    return {
      seen,
      call: async (args: { user: unknown }) => {
        seen.push(JSON.stringify(args.user))
        return {
          ok: true,
          value: out,
          costUsd: '0.004000',
          model: 'claude-sonnet-5-5',
          callIds: [],
        } as never
      },
    }
  }
  const legit: ModelOut = {
    legitimacy: { verdict: 'legitimate', confidence: 'sure' },
    fit: { confidence: 'likely' },
    suggestedPath: 'quote_partial',
    pathConfidence: 'likely',
    regretLineNos: [5],
    askLineNos: [],
    reasons: ['Four lines are hose assemblies sourced before', 'Line 5 has no supplier on file'],
  }

  async function read(e: { id: string }, p = probes, model: ModelOut = legit, seen: string[] = []) {
    const input = await gatherQualify(e.id, p)
    const ai = fakeAi(model, seen)
    const r = await def.propose(input, ai as never)
    if (!r.ok) throw new Error('propose failed')
    const v = await def.verify(r.out, input)
    await opsDb.$transaction(async (tx) => {
      await setActor(tx, { kind: 'assistant' })
      await def.onProposed!(tx, v, {
        actionId: randomUUID(),
        ref: 'A-TEST',
        level: 'suggest',
        request: {
          actionKey: 'qualify_enquiry',
          subjectType: 'enquiry',
          subjectId: e.id,
          enquiryId: e.id,
          trigger: 'enquiry.created',
          origin: 'live',
          sourceVersion: 1,
        },
      })
    })
    return { input, v }
  }

  beforeAll(async () => {
    world = await buildQueueWorld(opsDb, TAG)
    clientId = (
      await opsDb.company.create({
        data: {
          name: `Sample Mining ${TAG}`,
          isClient: true,
          // Qualification must never read these: the payload test below looks for both.
          country: 'QZ',
          city: `Zedtown${TAG}`,
          trn: '000000000000000',
          primaryDomain: `sample-mining-${TAG}.example.test`,
        },
        select: { id: true },
      })
    ).id
    const trade = await opsDb.trade.upsert({
      where: { name: 'Hose assemblies' },
      create: { name: 'Hose assemblies', slug: 'hose-assemblies' },
      update: {},
      select: { id: true },
    })
    const supplier = await opsDb.company.create({
      data: { name: `Example Hose Co ${TAG}`, isSupplier: true },
      select: { id: true },
    })
    await opsDb.supplierLineCard.create({
      data: { supplierId: supplier.id, tradeId: trade.id, brand: TAG },
    })
    users.push(
      { id: world.ownerId, initials: 'KB', role: 'owner' },
      { id: world.ownerId, initials: 'KB', role: 'owner' }
    )
  })

  afterAll(async () => {
    await opsDb.intakeBatch.deleteMany({ where: { enquiryId: { in: enquiries } } })
    await opsDb.enquiry.updateMany({
      where: { id: { in: enquiries }, closedAt: null },
      data: { closedReason: 'other', closeNote: 'test', closedAt: new Date() },
    })
    await cleanQueue(opsDb, TAG)
    await opsDb.$disconnect()
  })

  /** Hose lines are in a sourced trade; line 5 has none. */
  async function tradeLines(enquiryId: string) {
    const trade = await opsDb.trade.findUniqueOrThrow({ where: { name: 'Hose assemblies' } })
    const g = await opsDb.tradeGroup.create({
      data: { enquiryId, name: 'Hoses', tradeId: trade.id },
      select: { id: true },
    })
    await opsDb.enquiryLine.updateMany({
      where: { enquiryId, no: { lte: 4 } },
      data: { tradeGroupId: g.id },
    })
  }

  it('legitimate: Sure, partial suggested; no country in the payload; the read lands and moves to Qualifying', async () => {
    const e = await enquiry('legit', 'Dear Sir, please quote the attached list.')
    await tradeLines(e.id)
    const seen: string[] = []
    const { input, v } = await read(e, probes, legit, seen)
    expect(input.input.sender).toMatchObject({
      freeMail: false,
      domainAgeDays: 4000,
      domainRegisteredYear: 2015,
      domainMatchesName: true,
      websiteReachable: true,
      registryFound: true,
    })
    expect(input.input.lines.map((l) => [l.no, l.tradeSourced, l.proprietary])).toEqual([
      [1, true, false],
      [2, true, false],
      [3, true, false],
      [4, true, false],
      [5, false, true],
    ])
    // The country and the city never reach the read or the model.
    for (const payload of [JSON.stringify(input), ...seen]) {
      expect(payload).not.toContain('QZ')
      expect(payload).not.toContain(`Zedtown${TAG}`)
    }
    expect(v.out.verdict).toMatchObject({
      legitimacy: 'legitimate',
      legitimacyConfidence: 'sure',
      suggestedPath: 'quote_partial',
      regretLineNos: [5],
    })
    expect(v.confidence).toBe('likely')
    const row = await opsDb.enquiry.findUniqueOrThrow({ where: { id: e.id } })
    expect(row.stage).toBe('qualifying')
    expect(row.suggestedPath).toBe('quote_partial')
    expect(row.legitimacy).toBe('sure')

    const o = await getEnquiryOverview(e.ref, { role: 'owner', canSeeMargins: true })
    const q = o!.qualification!
    if (q.state !== 'read') throw new Error(`expected read, got ${q.state}`)
    expect(q.chips.map((c) => c.label)).toEqual(['Legitimate · Sure', 'Fit 4 of 5 · Likely'])
    expect(q.cards.find((c) => c.tag)?.path).toBe('quote_partial')
    expect(q.cards[1]!.sub).toContain('Line 5 is regretted to the client')
    expect(q.defaults.regret).toEqual([5])
    expect(q.legitimacy[0]!.link).toMatchObject({ label: 'Domain record', external: true })

    // Quote what we can: Sourcing, the path event, and one line regret drafted for Review.
    h.emitted.length = 0
    const fresh = await opsDb.enquiry.findUniqueOrThrow({
      where: { id: e.id },
      select: { version: true },
    })
    const out = await opsDb.$transaction((tx) =>
      choosePath(tx, {
        enquiryId: e.id,
        path: 'quote_partial',
        lineNos: [5],
        version: fresh.version,
        actor: users[0]!,
      })
    )
    expect(out.emit.map((x) => x.name)).toEqual(['ops/enquiry.path.chosen', 'ops/action.requested'])
    expect(out.emit[1]!.data).toMatchObject({
      actionKey: 'regret_client',
      sourceVersion: expect.stringMatching(/^lines:5@/),
    })
    const after = await opsDb.enquiry.findUniqueOrThrow({ where: { id: e.id } })
    expect(after).toMatchObject({
      stage: 'sourcing',
      chosenPath: 'quote_partial',
      pathChosenById: world.ownerId,
    })
    // Chosen once.
    await expect(
      opsDb.$transaction((tx) =>
        choosePath(tx, {
          enquiryId: e.id,
          path: 'regret',
          version: after.version,
          actor: users[0]!,
        })
      )
    ).rejects.toBeInstanceOf(ChoosePathError)
    expect(
      (await getEnquiryOverview(e.ref, { role: 'owner', canSeeMargins: true }))!.qualification
    ).toBeNull()
  })

  it('suspicious: a three-week domain, no website: Unsure, "Is this a real buyer?"; ask first leads', async () => {
    const e = await enquiry('young', 'Please quote.')
    await tradeLines(e.id)
    const { v } = await read(e, young, {
      ...legit,
      legitimacy: { verdict: 'suspicious', confidence: 'likely' },
      suggestedPath: 'ask_client_first',
      regretLineNos: [],
    })
    expect(v.out.verdict.realBuyerQuestion).toBe(true)
    expect(v.confidence).toBe('unsure')
    expect(v.out.signals.legitimacy[0]!.text).toContain('registered 3 weeks ago')
    const o = await getEnquiryOverview(e.ref, { role: 'owner', canSeeMargins: true })
    const q = o!.qualification!
    if (q.state !== 'read') throw new Error('expected read')
    expect(q.realBuyerQuestion).toBe(true)
    expect(q.chips[0]!.label).toBe('Unsure')
    expect(q.cards.slice(0, 2).map((c) => c.title)).toEqual(['Ask the client first', 'Quote fully'])

    // Ask first: stays in Qualifying with the choice recorded (the questions action arrives with T07).
    const fresh = await opsDb.enquiry.findUniqueOrThrow({
      where: { id: e.id },
      select: { version: true },
    })
    await opsDb.$transaction((tx) =>
      choosePath(tx, {
        enquiryId: e.id,
        path: 'ask_client_first',
        version: fresh.version,
        actor: users[0]!,
      })
    )
    expect(await opsDb.enquiry.findUniqueOrThrow({ where: { id: e.id } })).toMatchObject({
      stage: 'qualifying',
      chosenPath: 'ask_client_first',
    })
  })

  it('a sign-in link is spam, Sure, whatever the model says; ignore files it and undo puts it back', async () => {
    const e = await enquiry(
      'spam',
      'RFQ documents: view to quote at https://docs-share.example/view?id=99 (sign in required).',
      'procurement@webmail.example'
    )
    const { v } = await read(e, probes, legit)
    expect(v.out.verdict).toMatchObject({
      legitimacy: 'spam',
      legitimacyConfidence: 'sure',
      suggestedPath: 'ignore_spam',
    })
    const o = await getEnquiryOverview(e.ref, { role: 'owner', canSeeMargins: true })
    const q = o!.qualification!
    if (q.state !== 'read') throw new Error('expected read')
    expect(q.chips.map((c) => c.label)).toEqual(['Ignore (spam) · Sure'])

    const fresh = await opsDb.enquiry.findUniqueOrThrow({
      where: { id: e.id },
      select: { version: true },
    })
    const out = await opsDb.$transaction((tx) =>
      choosePath(tx, {
        enquiryId: e.id,
        path: 'ignore_spam',
        version: fresh.version,
        actor: users[0]!,
      })
    )
    expect(out.undoUntil).not.toBeNull()
    expect(await opsDb.enquiry.findUniqueOrThrow({ where: { id: e.id } })).toMatchObject({
      stage: 'closed',
      closedReason: 'spam',
    })
    expect(
      (await opsDb.mailMessage.findUniqueOrThrow({ where: { id: e.messageId } })).classification
    ).toBe('not_business')
    const filed = await getEnquiryOverview(e.ref, { role: 'owner', canSeeMargins: true })
    expect(filed!.qualification).toMatchObject({
      state: 'spam_filed',
      text: 'Filed as Not business. No reply, no record.',
      reason: expect.stringContaining('docs-share.example'),
    })

    await opsDb.$transaction((tx) =>
      undoSpam(tx, { enquiryId: e.id, actor: { id: world.ownerId, initials: 'KB' } })
    )
    expect(await opsDb.enquiry.findUniqueOrThrow({ where: { id: e.id } })).toMatchObject({
      stage: 'qualifying',
      chosenPath: null,
      closedReason: null,
    })
    expect(
      (await opsDb.mailMessage.findUniqueOrThrow({ where: { id: e.messageId } })).classification
    ).toBe('client_enquiry')
  })

  it('quote fully and regret; a stale version is refused; "Read it now" shows reading', async () => {
    const e = await enquiry('full', 'Please quote.')
    await expect(
      opsDb.$transaction((tx) =>
        choosePath(tx, {
          enquiryId: e.id,
          path: 'quote_fully',
          version: e.version + 7,
          actor: users[0]!,
        })
      )
    ).rejects.toBeInstanceOf(VersionConflict)
    await expect(
      opsDb.$transaction((tx) =>
        choosePath(tx, {
          enquiryId: e.id,
          path: 'quote_partial',
          lineNos: [1, 2, 3, 4, 5],
          version: e.version,
          actor: users[0]!,
        })
      )
    ).rejects.toThrow('Every line would be regretted')
    const full = await opsDb.$transaction((tx) =>
      choosePath(tx, { enquiryId: e.id, path: 'quote_fully', version: e.version, actor: users[0]! })
    )
    expect(full.emit.map((x) => x.name)).toEqual(['ops/enquiry.path.chosen'])
    expect((await opsDb.enquiry.findUniqueOrThrow({ where: { id: e.id } })).stage).toBe('sourcing')

    const r = await enquiry('regret', 'Please quote.')
    const out = await opsDb.$transaction((tx) =>
      choosePath(tx, { enquiryId: r.id, path: 'regret', version: r.version, actor: users[0]! })
    )
    expect(out.emit[0]!.data).toMatchObject({
      actionKey: 'regret_client',
      sourceVersion: expect.stringMatching(/^whole@/),
    })
    // Regret does not end the enquiry on choose: it ends when the email has left.
    expect(await opsDb.enquiry.findUniqueOrThrow({ where: { id: r.id } })).toMatchObject({
      stage: 'qualifying',
      chosenPath: 'regret',
    })

    const old = await enquiry('old', 'Please quote.')
    await opsDb.enquiry.update({
      where: { id: old.id },
      data: { createdAt: new Date(Date.now() - 86_400_000) },
    })
    const before = await getEnquiryOverview(old.ref, { role: 'owner', canSeeMargins: true })
    expect(before!.qualification).toMatchObject({
      state: 'failed',
      reason: 'There is no quick read on this enquiry',
    })
    await opsDb.$transaction((tx) =>
      markQuickReadAsked(tx, { enquiryId: old.id, actor: { id: world.ownerId, initials: 'KB' } })
    )
    expect(
      (await getEnquiryOverview(old.ref, { role: 'owner', canSeeMargins: true }))!.qualification
    ).toEqual({
      state: 'reading',
    })
  })
})
