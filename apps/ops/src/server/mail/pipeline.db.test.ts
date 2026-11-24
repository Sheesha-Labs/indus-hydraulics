import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import type { StructuredResult } from '@indus/ops-ai'
import {
  buildQueueWorld,
  cleanQueue,
  localDatabaseUrl,
  type QueueWorld,
} from '../mail-send/testing/fixture'
import type { ActionRequestedData } from '../assistant/request'
import type { ActionAi } from '../assistant/types'

/**
 * The mail pipeline on the local database with a fake model (S05-T04): detector short-circuits make no model
 * call; a sure classification is written with its spans; an unsure one writes nothing as fact and waits as a
 * mail_unsure proposal; a thread link is sure; label plans touch managed Indus ids only.
 */
const DB_URL = localDatabaseUrl()
const TAG = 'pipe'

vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
vi.mock('../../inngest/emit', () => ({
  emitEvent: async () => true,
  emitEventOrThrow: async () => undefined,
}))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: () => undefined,
  revalidatePath: () => undefined,
}))

describe.skipIf(!DB_URL)('mail pipeline · local database', () => {
  let db: typeof import('@indus/ops-db').opsDb
  let runner: typeof import('../assistant/runner')
  let labels: typeof import('./labels-apply')
  let classify: typeof import('../assistant/actions/classify-mail')
  let world: QueueWorld
  const suffix = randomUUID().slice(0, 8)
  const clientDomain = `client-${suffix}.example`
  let clientCompanyId: string
  let threadId: string
  const messageIds: string[] = []

  async function message(over: {
    subject: string
    body: string
    from?: string
    headerFlags?: Record<string, unknown>
    labels?: string[]
  }): Promise<string> {
    const m = await db.mailMessage.create({
      data: {
        mailboxId: world.salesId,
        threadId,
        gmailMessageId: `g-${TAG}-${randomUUID()}`,
        rfcMessageId: `${randomUUID()}@${clientDomain}`,
        direction: 'inbound',
        fromAddress: over.from ?? `buyer@${clientDomain}`,
        fromName: 'A Buyer',
        toAddresses: ['sales@example.test'],
        ccAddresses: [],
        subject: over.subject,
        bodyText: over.body,
        bodyTextHash: randomUUID(),
        sentAt: new Date(Date.now() - 60_000 + messageIds.length * 1_000),
        labelsApplied: [],
        gmailLabelIds: over.labels ?? ['INBOX'],
        origin: 'live',
        ...(over.headerFlags ? { headerFlags: over.headerFlags as never } : {}),
      },
      select: { id: true },
    })
    messageIds.push(m.id)
    return m.id
  }

  function request(messageId: string, actionKey = 'classify_mail'): ActionRequestedData {
    const base = {
      actionKey,
      subjectType: 'mail_message' as const,
      subjectId: messageId,
      enquiryId: null,
      trigger: 'test',
      origin: 'live' as const,
      sourceVersion: randomUUID(),
      mailboxId: null,
    }
    return {
      ...base,
      idempotencyKey: `${actionKey}:mail_message:${messageId}:${base.sourceVersion}`,
      group: 'mail',
      recordKey: `mail_message:${messageId}`,
    }
  }

  function fakeAi(value: unknown, calls: { n: number }): ActionAi {
    return {
      call: async () => {
        calls.n += 1
        return {
          ok: true,
          value,
          usage: {} as never,
          costUsd: '0.000120',
          stopReason: 'end_turn',
          model: 'claude-haiku-5-5',
          attempts: 1,
          callIds: [],
        } as unknown as StructuredResult<never>
      },
    }
  }

  async function run(
    messageId: string,
    ai: ActionAi,
    level: 'do_quietly' = 'do_quietly',
    key = 'classify_mail'
  ) {
    const data = request(messageId, key)
    const g = await runner.gatherRun(data)
    const p = await runner.proposeRun(data, g.input, ai)
    if (!p.ok) throw new Error(`propose failed: ${p.reason}`)
    const v = await runner.verifyRun(data, p.out, g.input)
    const d = await runner.decideRun({
      data,
      resolved: { level, base: level, hits: [], reasons: [] },
      basisHash: g.basisHash,
      input: g.input,
      proposal: {
        ok: true,
        verified: v,
        costUsd: p.costUsd,
        model: p.model,
        promptVersion: p.promptVersion,
        callIds: [],
      },
    })
    if (d.state === 'running') return { d, effect: await runner.effectRun(d.actionId) }
    return { d, proposed: await runner.proposedRun(d.actionId) }
  }

  beforeAll(async () => {
    ;({ opsDb: db } = await import('@indus/ops-db'))
    runner = await import('../assistant/runner')
    labels = await import('./labels-apply')
    classify = await import('../assistant/actions/classify-mail')
    await import('../assistant/actions')
    world = await buildQueueWorld(db, TAG)
    const company = await db.company.create({
      data: { name: `Sample Client ${suffix} LLC`, isClient: true, domains: [clientDomain] },
      select: { id: true },
    })
    clientCompanyId = company.id
    const thread = await db.mailThread.create({
      data: { mailboxId: world.salesId, gmailThreadId: `t-${TAG}-${suffix}` },
      select: { id: true },
    })
    threadId = thread.id
  })

  afterAll(async () => {
    await db.sourceSpan.deleteMany({ where: { sourceKind: 'email', sourceId: { in: messageIds } } })
    await cleanQueue(db, TAG)
    await db.company.deleteMany({ where: { id: clientCompanyId } })
    await db.$disconnect()
  })

  it('a bounce, a newsletter and an auto-reply are decided without a model call', async () => {
    const calls = { n: 0 }
    const ai = fakeAi({}, calls)
    const bounce = await message({
      subject: 'Delivery Status Notification',
      body: 'Address not found. 550 5.1.1',
      from: 'mailer-daemon@example.org',
    })
    const news = await message({
      subject: 'Our November news',
      body: 'Read more',
      headerFlags: { listUnsubscribe: true },
    })
    const ooo = await message({
      subject: 'Out of Office: RFQ',
      body: 'I am away',
      headerFlags: { autoSubmitted: 'auto-replied' },
    })
    for (const id of [bounce, news, ooo]) await run(id, ai)
    expect(calls.n).toBe(0)
    const rows = await db.mailMessage.findMany({
      where: { id: { in: [bounce, news, ooo] } },
      select: { id: true, classification: true, handledState: true },
    })
    const byId = new Map(rows.map((r) => [r.id, r]))
    expect(byId.get(bounce)).toMatchObject({ classification: 'bounce', handledState: 'handled' })
    expect(byId.get(news)).toMatchObject({
      classification: 'not_business',
      handledState: 'handled',
    })
    expect(byId.get(ooo)).toMatchObject({ classification: 'auto_reply', handledState: 'handled' })
  })

  it('a sure enquiry from a known client is written with its note, spans and an event', async () => {
    const calls = { n: 0 }
    const id = await message({
      subject: 'RFQ ball valves',
      body: 'Dear team,\nPlease quote 10 pcs ball valve 2 inch, class 300.\nDelivery Jebel Ali.',
    })
    const ai = fakeAi(
      {
        class: 'client_enquiry',
        confidence: 'sure',
        reasons: [{ text: 'Asks for a price', quote: 'Please quote 10 pcs ball valve 2 inch' }],
        alternatives: [{ class: 'client_reply', why: 'Could follow an earlier quote' }],
      },
      calls
    )
    const { d, effect } = await run(id, ai)
    expect(calls.n).toBe(1)
    expect(d.state).toBe('running')
    expect(effect).toMatchObject({ state: 'done', emit: [{ name: 'ops/mail.classified' }] })
    const row = await db.mailMessage.findUniqueOrThrow({ where: { id } })
    expect(row).toMatchObject({
      classification: 'client_enquiry',
      confidence: 'sure',
      handledState: 'not_linked',
      assistantNote: 'Client enquiry · Sure · from a known client domain',
      classifiedByActionId: d.actionId,
    })
    const spans = await db.sourceSpan.findMany({ where: { sourceId: id } })
    expect(spans).toMatchObject([
      { resolved: 'exact', quote: 'Please quote 10 pcs ball valve 2 inch' },
    ])
    const activity = await db.activityEvent.findMany({
      where: { actionId: d.actionId },
      select: { field: true },
    })
    // handledState stays not_linked, so only the changed fields are logged.
    expect(activity.map((a) => a.field).sort()).toEqual(['classification', 'confidence'])
  })

  it('a quote that is not in the email lowers confidence; unsure writes nothing as fact', async () => {
    const id = await message({ subject: 'Hello', body: 'Please see attached and advise.' })
    const ai = fakeAi(
      {
        class: 'supplier_quote', // conflicts with a known client sender
        confidence: 'likely',
        reasons: [{ text: 'Mentions a price', quote: 'our best price is attached' }],
        alternatives: [{ class: 'client_reply', why: 'A client following up' }],
      },
      { n: 0 }
    )
    const { d, proposed } = await run(id, ai)
    expect(d.state).toBe('proposed')
    expect(proposed).toEqual({ emit: [] })
    const action = await db.assistantAction.findUniqueOrThrow({ where: { id: d.actionId } })
    expect(action).toMatchObject({ surface: 'mail_unsure', confidence: 'unsure' })
    expect((action.options as Array<{ key: string }>).map((o) => o.key)).toEqual([
      'supplier_quote',
      'client_reply',
    ])
    const row = await db.mailMessage.findUniqueOrThrow({ where: { id } })
    expect(row).toMatchObject({
      classification: 'unclassified',
      confidence: 'unsure',
      handledState: 'unsure',
    })
    expect(row.unsureReason).toBeTruthy()
  })

  it('a reply in a thread already linked to a record is linked to it, sure', async () => {
    const earlier = await message({ subject: 'Re: RFQ', body: 'Earlier mail' })
    const recordId = randomUUID()
    await db.mailLink.create({
      data: { messageId: earlier, subjectType: 'enquiry', subjectId: recordId, linkedBy: 'user' },
    })
    const id = await message({ subject: 'Re: RFQ', body: 'Any update on this?' })
    await db.mailMessage.update({
      where: { id },
      data: { classification: 'client_reply', confidence: 'sure' },
    })
    const calls = { n: 0 }
    const { d, effect } = await run(id, fakeAi({}, calls), 'do_quietly', 'link_mail')
    expect(calls.n).toBe(0)
    expect(d.state).toBe('running')
    expect(effect).toMatchObject({ state: 'done', emit: [{ name: 'ops/mail.linked' }] })
    const link = await db.mailLink.findFirstOrThrow({ where: { messageId: id } })
    expect(link).toMatchObject({
      subjectType: 'enquiry',
      subjectId: recordId,
      linkedBy: 'assistant',
      confidence: 'sure',
    })
    expect((await db.mailMessage.findUniqueOrThrow({ where: { id } })).handledState).toBe('handled')
  })

  it('a known sender with no open record gets a company link only', async () => {
    const id = await message({
      subject: 'Hello',
      body: 'Nice to meet you at the exhibition.',
      from: `ceo@${clientDomain}`,
    })
    await db.mailMessage.update({
      where: { id },
      data: { classification: 'other', confidence: 'likely' },
    })
    // A fresh thread so the earlier thread link does not apply.
    const t = await db.mailThread.create({
      data: { mailboxId: world.salesId, gmailThreadId: `t2-${TAG}-${suffix}` },
      select: { id: true },
    })
    await db.mailMessage.update({ where: { id }, data: { threadId: t.id } })
    await run(id, fakeAi({}, { n: 0 }), 'do_quietly', 'link_mail')
    const link = await db.mailLink.findFirstOrThrow({ where: { messageId: id } })
    expect(link).toMatchObject({
      subjectType: 'company',
      subjectId: clientCompanyId,
      confidence: 'likely',
    })
  })

  it('label plans use this mailbox’s managed Indus ids only and skip non-live mail', async () => {
    const { getSetting } = await import('../settings/get')
    const names = await getSetting('mail.label_names')
    await db.gmailLabel.createMany({
      data: [
        { mailboxId: world.salesId, name: names.enquiry, gmailLabelId: 'L_ENQ' },
        { mailboxId: world.salesId, name: names.clientReply, gmailLabelId: 'L_REPLY' },
        { mailboxId: world.salesId, name: names.notBusiness, gmailLabelId: 'L_NB' },
        { mailboxId: world.salesId, name: names.ignore, gmailLabelId: 'L_IGNORE' },
      ],
      skipDuplicates: true,
    })
    const id = await message({ subject: 'Newsletter', body: 'x' })
    await db.mailMessage.update({
      where: { id },
      data: {
        classification: 'not_business',
        confidence: 'sure',
        labelsApplied: ['L_REPLY', 'L_IGNORE'],
      },
    })
    const plan = await labels.planLabels(id)
    expect(plan).toMatchObject({ add: ['L_NB'], remove: ['L_REPLY'] })
    expect(plan.next).toEqual(['L_IGNORE', 'L_NB'])
    for (const sys of ['INBOX', 'UNREAD', 'SPAM', 'TRASH', 'IMPORTANT', 'STARRED']) {
      expect([...plan.add, ...plan.remove]).not.toContain(sys)
    }
    const actionId = await labels.recordLabels(plan)
    expect(actionId).toEqual(expect.any(String))
    expect((await db.mailMessage.findUniqueOrThrow({ where: { id } })).labelsApplied).toEqual([
      'L_IGNORE',
      'L_NB',
    ])
    expect(await labels.planLabels(id)).toMatchObject({ skipped: 'unchanged' })

    await db.mailMessage.update({ where: { id }, data: { origin: 'backfill' } })
    expect(await labels.planLabels(id)).toMatchObject({ skipped: 'origin' })
  })

  it('detectorVerdict ranks a bounce above phishing, auto-reply and newsletter', () => {
    const facts = {
      bounce: { isBounce: true, hard: true },
      phishing: { flagged: true, reasons: [{ code: 'gmail_spam', text: 'Spam' }] },
      autoReply: { isAutoReply: true, kind: 'other', signals: ['X-Autoreply'] },
      bulk: { isBulk: true, signals: ['List-Id'] },
    }
    expect(classify.detectorVerdict({ facts } as never)?.class).toBe('bounce')
  })
})
