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
 * S05-T07 on the local database with a fake model: out-of-office facts (bounds, verbatim stand-in, the
 * contact marked away, a resend proposal when the reply answers our email), hard and soft bounces (linked by
 * X-Indus-Outbound; the send stays 'sent'), resend_alternate_contact always asking, ask_open_copy's note
 * check, "It's real", and the state the Mail view reads.
 */
const DB_URL = localDatabaseUrl()
const TAG = 'mstates'

const emitted: Array<{ name: string; data: Record<string, unknown> }> = []
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
vi.mock('../../inngest/emit', () => ({
  emitEvent: async (e: { name: string; data: Record<string, unknown> }) => {
    emitted.push(e)
    return true
  },
  emitEventOrThrow: async (e: { name: string; data: Record<string, unknown> }) => {
    emitted.push(e)
  },
}))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: () => undefined,
  revalidatePath: () => undefined,
}))

function addDays(iso: string, n: number): string {
  return new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10)
}

describe.skipIf(!DB_URL)('mail states · local database', () => {
  let db: typeof import('@indus/ops-db').opsDb
  let runner: typeof import('../assistant/runner')
  let bounce: typeof import('./bounce')
  let phishing: typeof import('./phishing')
  let router: typeof import('./router')
  let data: typeof import('../../data/mail')
  let translate: typeof import('./translate')
  let resendDef: typeof import('../assistant/actions/resend-alternate-contact').default
  let today: string
  let world: QueueWorld
  const suffix = randomUUID().slice(0, 8)
  const domain = `valve-${suffix}.example`
  let companyId: string
  let threadId: string
  const contactIds: string[] = []

  async function contact(email: string, over: { isPreferred?: boolean } = {}) {
    const c = await db.contact.create({
      data: { companyId, name: `Person ${email.split('@')[0]}`, email, ...over },
      select: { id: true },
    })
    contactIds.push(c.id)
    return c.id
  }

  async function outbound(to: string) {
    return db.outboundEmail.create({
      data: {
        kind: 'supplier_rfq',
        mailboxId: world.purchaseId,
        threadId,
        toAddresses: [to],
        ccAddresses: [],
        bccAddresses: [],
        subject: 'RFQ for ball valves',
        bodyHtml: '<p>Please quote the attached list.</p>',
        bodyText: 'Please quote the attached list.',
        status: 'sent',
        sentAt: new Date(Date.now() - 3_600_000),
        companyId,
        rfcMessageId: `<${randomUUID()}@example.test>`,
        gmailMessageId: `g-out-${randomUUID()}`,
        idempotencyKey: `s04q:${TAG}:${randomUUID()}`,
      },
      select: { id: true, rfcMessageId: true },
    })
  }

  async function inbound(over: {
    from: string
    subject?: string
    body: string
    classification?: 'auto_reply' | 'bounce' | 'phishing' | 'supplier_quote'
    flags?: Record<string, unknown>
    inReplyTo?: string | null
  }) {
    const m = await db.mailMessage.create({
      data: {
        mailboxId: world.purchaseId,
        threadId,
        gmailMessageId: `g-${TAG}-${randomUUID()}`,
        rfcMessageId: `${randomUUID()}@${domain}`,
        inReplyToRfcId: over.inReplyTo ?? null,
        direction: 'inbound',
        fromAddress: over.from,
        fromName: 'Away Person',
        toAddresses: ['purchase@example.test'],
        ccAddresses: [],
        subject: over.subject ?? 'Automatic reply: RFQ for ball valves',
        bodyText: over.body,
        bodyTextHash: randomUUID(),
        sentAt: new Date(),
        labelsApplied: [],
        origin: 'live',
        classification: over.classification ?? 'auto_reply',
        confidence: 'sure',
        handledState: 'handled',
        ...(over.flags ? { flags: over.flags as never } : {}),
      },
      select: { id: true },
    })
    return m.id
  }

  function request(messageId: string, actionKey: string): ActionRequestedData {
    const sourceVersion = randomUUID()
    return {
      actionKey,
      subjectType: 'mail_message',
      subjectId: messageId,
      enquiryId: null,
      trigger: 'test',
      origin: 'live',
      sourceVersion,
      mailboxId: world.purchaseId,
      idempotencyKey: `${actionKey}:mail_message:${messageId}:${sourceVersion}`,
      group: 'mail',
      recordKey: `mail_message:${messageId}`,
    }
  }

  function fakeAi(value: unknown, counter?: { n: number }): ActionAi {
    const calls = counter ?? { n: 0 }
    return {
      call: async () => {
        calls.n += 1
        return {
          ok: true,
          value,
          usage: {} as never,
          costUsd: '0.000100',
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
    key: string,
    ai: ActionAi,
    level: 'do_quietly' | 'do_and_tell' | 'draft_and_ask' = 'do_quietly'
  ) {
    const d0 = request(messageId, key)
    const g = await runner.gatherRun(d0)
    const p = await runner.proposeRun(d0, g.input, ai)
    if (!p.ok) throw new Error(`propose failed: ${p.reason}`)
    const v = await runner.verifyRun(d0, p.out, g.input)
    const d = await runner.decideRun({
      data: d0,
      resolved: { level, reasons: [] },
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
    const effect = d.state === 'running' ? await runner.effectRun(d.actionId) : null
    return { d, effect, input: g.input, verified: v }
  }

  beforeAll(async () => {
    ;({ opsDb: db } = await import('@indus/ops-db'))
    runner = await import('../assistant/runner')
    bounce = await import('./bounce')
    phishing = await import('./phishing')
    router = await import('./router')
    data = await import('../../data/mail')
    translate = await import('./translate')
    await import('../assistant/actions')
    resendDef = (await import('../assistant/actions/resend-alternate-contact')).default
    today = (await import('./out-of-office')).dubaiToday()
    world = await buildQueueWorld(db, TAG)
    companyId = (
      await db.company.create({
        data: { name: `Example Valve Co ${suffix}`, isSupplier: true, domains: [domain] },
        select: { id: true },
      })
    ).id
    threadId = (
      await db.mailThread.create({
        data: { mailboxId: world.purchaseId, gmailThreadId: `t-${TAG}-${suffix}` },
        select: { id: true },
      })
    ).id
  })

  afterAll(async () => {
    await db.preferenceSignal.deleteMany({ where: { mailboxId: world.purchaseId } })
    await cleanQueue(db, TAG)
    await db.contact.deleteMany({ where: { id: { in: contactIds } } })
    await db.company.deleteMany({ where: { id: companyId } })
    await db.$disconnect()
  })

  it('the router sends an out-of-office reply to ooo_facts and leaves an automatic acknowledgement', async () => {
    const ooo = await inbound({
      from: `x@${domain}`,
      body: 'Away',
      flags: { autoReply: { kind: 'out_of_office' } },
    })
    const ack = await inbound({
      from: `y@${domain}`,
      body: 'We received your message',
      flags: { autoReply: { kind: 'auto_ack' } },
    })
    emitted.length = 0
    expect(
      (await router.routeClassified({ messageId: ooo, class: 'auto_reply' })).requested
    ).toMatch(/^ooo_facts:/)
    expect(await router.routeClassified({ messageId: ack, class: 'auto_reply' })).toMatchObject({
      requested: null,
      skipped: 'auto_ack',
    })
    expect(
      await router.routeClassified({ messageId: ooo, class: 'auto_reply', origin: 'backfill' })
    ).toMatchObject({ skipped: 'origin' })
  })

  it('ooo_facts marks the contact away and asks about the stand-in when the reply answers our email', async () => {
    const away = `away-${suffix}@${domain}`
    const contactId = await contact(away)
    const out = await outbound(away)
    const back = addDays(today, 10)
    const body = `I am out of the office until next month. For urgent matters please contact Alex Example, alex@${domain}.`
    const id = await inbound({
      from: away,
      body,
      inReplyTo: out.rfcMessageId,
      flags: { autoReply: { kind: 'out_of_office', returnDateText: 'until next month' } },
    })
    const r = await run(
      id,
      'ooo_facts',
      fakeAi({
        returnDate: back,
        alternateContact: { name: 'Alex Example', email: `alex@${domain}` },
        reasons: [
          { text: 'Away until', quote: 'out of the office until next month' },
          { text: 'Stand-in', quote: `contact Alex Example, alex@${domain}` },
        ],
      })
    )
    expect(r.effect?.state).toBe('done')
    const c = await db.contact.findUniqueOrThrow({ where: { id: contactId } })
    expect(c.outOfOfficeUntil?.toISOString().slice(0, 10)).toBe(back)
    const m = await db.mailMessage.findUniqueOrThrow({ where: { id } })
    expect(m.outOfOfficeUntil?.toISOString().slice(0, 10)).toBe(back)
    expect(m.flags).toMatchObject({ ooo: { alternate: { email: `alex@${domain}` } } })
    const names = r.effect?.emit?.map((e) => e.name) ?? []
    expect(names).toContain('ops/contact.out_of_office')
    expect(r.effect?.emit?.find((e) => e.name === 'ops/action.requested')?.data).toMatchObject({
      actionKey: 'resend_alternate_contact',
      subjectId: id,
    })
    // and the reply is never counted as a reply: the class is untouched
    expect(m.classification).toBe('auto_reply')
  })

  it('a return date beyond 120 days and a stand-in not written in the email are not used', async () => {
    const away = `far-${suffix}@${domain}`
    const contactId = await contact(away)
    const id = await inbound({
      from: away,
      body: 'I am on leave until next year. Please write to my colleague.',
      flags: { autoReply: { kind: 'out_of_office', returnDateText: 'until next year' } },
    })
    const r = await run(
      id,
      'ooo_facts',
      fakeAi({
        returnDate: addDays(today, 200),
        alternateContact: { name: 'Colleague', email: `colleague@${domain}` },
        reasons: [{ text: 'Away', quote: 'on leave until next year' }],
      })
    )
    expect(r.verified.out).toMatchObject({ returnDate: null, alternate: null })
    expect(
      (await db.contact.findUniqueOrThrow({ where: { id: contactId } })).outOfOfficeUntil
    ).toBeNull()
    expect(r.effect?.emit ?? []).toEqual([])
  })

  it('a hard bounce is matched by X-Indus-Outbound: the send stays sent, the contact bounces, a person is asked', async () => {
    const gone = `gone-${suffix}@${domain}`
    const contactId = await contact(gone)
    const out = await outbound(gone)
    const id = await inbound({
      from: 'mailer-daemon@example.org',
      subject: 'Delivery Status Notification (Failure)',
      body: 'Address not found',
      classification: 'bounce',
      flags: {
        bounce: {
          hard: true,
          finalRecipient: gone,
          xIndusOutbound: out.id,
          diagnostic: '550 5.1.1 user unknown',
        },
      },
    })
    const asked: unknown[] = []
    const res = await bounce.handleBounce(id, null, {
      request: async (r) => {
        asked.push(r)
        return 'id'
      },
    })
    expect(res).toMatchObject({ kind: 'hard', outboundId: out.id, contactId, requested: true })
    const o = await db.outboundEmail.findUniqueOrThrow({ where: { id: out.id } })
    expect(o).toMatchObject({ status: 'sent', deliveryStatus: 'bounced' })
    expect(o.failureReason).toContain('550')
    const c = await db.contact.findUniqueOrThrow({ where: { id: contactId } })
    expect(c.status).toBe('bouncing')
    expect(c.bouncedAt).not.toBeNull()
    expect(asked[0]).toMatchObject({ actionKey: 'resend_alternate_contact', subjectId: id })
    const events = await db.activityEvent.findMany({ where: { subjectId: contactId } })
    expect(events.map((e) => e.field).sort()).toEqual(['bouncedAt', 'status'])
  })

  it('resend_alternate_contact always asks, and offers another address or only Fix contact', async () => {
    const gone = `gone2-${suffix}@${domain}`
    // Only this test's two addresses are live at the company.
    await db.contact.updateMany({ where: { companyId }, data: { archivedAt: new Date() } })
    await contact(gone)
    const otherId = await contact(`orders-${suffix}@${domain}`, { isPreferred: true })
    const out = await outbound(gone)
    const id = await inbound({
      from: 'mailer-daemon@example.org',
      subject: 'Undeliverable',
      body: 'Address not found',
      classification: 'bounce',
      flags: { bounce: { hard: true, finalRecipient: gone, xIndusOutbound: out.id } },
    })
    const calls = { n: 0 }
    const r = await run(
      id,
      'resend_alternate_contact',
      fakeAi(
        { note: 'Our message to {original} could not be delivered; please see it below.' },
        calls
      ),
      'do_and_tell'
    )
    expect(r.d.state).toBe('proposed')
    const row = await db.assistantAction.findUniqueOrThrow({ where: { id: r.d.actionId } })
    expect(row.guardrails).toEqual(['first_contact'])
    const options = row.options as Array<{ key: string; label: string }>
    expect(options.map((o) => o.label)).toEqual([`Resend to orders-${suffix}@`, 'Fix contact'])
    const draft = resendDef.outbound!(r.verified as never, r.input as never)
    expect(draft).toMatchObject({
      to: [`orders-${suffix}@${domain}`],
      threadId: null,
      mailboxId: world.purchaseId,
    })
    expect(draft?.bodyHtml).toContain('Please quote the attached list.')

    await db.contact.update({ where: { id: otherId }, data: { archivedAt: new Date() } })
    const none = await run(id, 'resend_alternate_contact', fakeAi({}, calls), 'do_and_tell')
    const row2 = await db.assistantAction.findUniqueOrThrow({ where: { id: none.d.actionId } })
    expect((row2.options as Array<{ label: string }>).map((o) => o.label)).toEqual(['Fix contact'])
    expect(calls.n).toBe(1)
  })

  it('a soft bounce waits, and shows only when nothing came back from that address', async () => {
    const slow = `slow-${suffix}@${domain}`
    const id = await inbound({
      from: 'mailer-daemon@example.org',
      subject: 'Delivery delayed',
      body: 'Still trying',
      classification: 'bounce',
      flags: { bounce: { hard: false, finalRecipient: slow } },
    })
    const sent: Array<{ name: string }> = []
    expect(
      await bounce.handleBounce(id, null, {
        emit: async (e) => {
          sent.push(e)
        },
      })
    ).toMatchObject({ kind: 'soft' })
    expect(sent[0]?.name).toBe('ops/mail.bounce.soft')

    const at = new Date(Date.now() - 60_000).toISOString()
    await inbound({ from: slow, body: 'Got it, thanks', classification: 'supplier_quote' })
    expect(await bounce.settleSoftBounce({ messageId: id, recipient: slow, at })).toEqual({
      shown: false,
    })
    expect(
      await bounce.settleSoftBounce({ messageId: id, recipient: `silent-${suffix}@${domain}`, at })
    ).toEqual({ shown: true })
    expect((await db.mailMessage.findUniqueOrThrow({ where: { id } })).handledState).toBe(
      'needs_you'
    )
  })

  it('ask_open_copy: a note with a figure is Unsure; a clean one names the files', async () => {
    const id = await inbound({
      from: `buyer-${suffix}@${domain}`,
      subject: 'Our enquiry',
      body: 'Please see attached',
      classification: 'supplier_quote',
      flags: { passwordProtected: ['Quote_2611.pdf'] },
    })
    const bad = await run(
      id,
      'ask_open_copy',
      fakeAi({ note: 'Send {files} within 2 days.' }),
      'draft_and_ask'
    )
    expect(bad.verified.confidence).toBe('unsure')
    const good = await run(
      id,
      'ask_open_copy',
      fakeAi({
        note: 'Thank you; we could not open {files} because it is password-protected. Could you send a copy without a password?',
      }),
      'draft_and_ask'
    )
    expect(good.d.state).toBe('proposed')
    const row = await db.assistantAction.findUniqueOrThrow({ where: { id: good.d.actionId } })
    expect((row.preview as { text: string; subject: string }).text).toContain('Quote_2611.pdf')
    expect((row.preview as { subject: string }).subject).toBe('Re: Our enquiry')
  })

  it('“It’s real” clears the flag, files it as the person’s choice and learns the domain', async () => {
    const realDomain = `real-${suffix}.example`
    const id = await inbound({
      from: `sales@${realDomain}`,
      subject: 'New RFQ',
      body: 'Log in to view',
      classification: 'phishing',
      flags: {
        phishing: {
          reasons: [{ code: 'lookalike_domain', text: 'The domain looks like a known one' }],
        },
      },
    })
    const out = await db.$transaction((tx) =>
      phishing.itsReal(tx, {
        messageId: id,
        cls: 'supplier_quote',
        companyId,
        actor: { id: world.helperId, initials: 'AB' },
      })
    )
    expect(out.learned).toContain(realDomain)
    const m = await db.mailMessage.findUniqueOrThrow({ where: { id } })
    expect(m.classification).toBe('supplier_quote')
    expect(m.flags).not.toHaveProperty('phishing')
    expect(m.flags).toHaveProperty('phishingCleared')
    const signal = await db.preferenceSignal.findFirstOrThrow({
      where: { mailboxId: world.purchaseId, payload: { path: ['phishingCleared'], equals: true } },
    })
    expect(signal.payload).toMatchObject({
      after: 'supplier_quote',
      phishingReasons: ['lookalike_domain'],
    })
    expect((await db.company.findUniqueOrThrow({ where: { id: companyId } })).domains).toContain(
      realDomain
    )
    await expect(
      db.$transaction((tx) =>
        phishing.itsReal(tx, {
          messageId: id,
          cls: 'phishing',
          actor: { id: world.helperId, initials: 'AB' },
        })
      )
    ).rejects.toThrow(/really is/)
  })

  it('the Mail view reads each state; a cached translation is returned without a model call', async () => {
    const t = await db.mailThread.create({
      data: { mailboxId: world.purchaseId, gmailThreadId: `t-${TAG}-states-${suffix}` },
      select: { id: true },
    })
    const m = await db.mailMessage.create({
      data: {
        mailboxId: world.purchaseId,
        threadId: t.id,
        gmailMessageId: `g-${TAG}-${randomUUID()}`,
        direction: 'inbound',
        fromAddress: `buyer@${domain}`,
        toAddresses: ['purchase@example.test'],
        ccAddresses: [],
        subject: 'طلب عرض سعر',
        bodyText: 'يرجى إرسال سعركم لعشرين طقم من أطقم الحشوات للأسطوانات الهيدروليكية',
        sentAt: new Date(),
        labelsApplied: [],
        origin: 'live',
        classification: 'phishing',
        confidence: 'sure',
        handledState: 'handled',
        flags: {
          phishing: { reasons: [{ code: 'login_to_view', text: 'Asks you to log in to view' }] },
        },
        summaryEn: 'Please send your price for twenty seal kits.',
        language: 'ar',
        attachments: {
          create: [
            {
              gmailAttachmentId: `a-${randomUUID()}`,
              filename: 'locked.pdf',
              extractionStatus: 'password_protected',
            },
            {
              gmailAttachmentId: `a-${randomUUID()}`,
              filename: 'big.zip',
              extractionStatus: 'unsupported',
              extractionNote: 'Over the zip limit',
            },
            {
              gmailAttachmentId: `a-${randomUUID()}`,
              filename: 'broken.xls',
              extractionStatus: 'unreadable',
            },
          ],
        },
      },
      select: { id: true },
    })
    const view = await data.getThread(t.id, { id: world.ownerId } as never)
    expect(view?.latest.state).toMatchObject({
      phishing: { reasons: ['Asks you to log in to view'] },
      protectedFiles: ['locked.pdf'],
      oversized: [{ name: 'big.zip' }],
      unreadable: ['broken.xls'],
      translation: {
        english: 'Please send your price for twenty seal kits.',
        languageName: 'Arabic',
      },
      bodyPending: false,
      ooo: null,
      bounce: null,
    })
    expect(await translate.translateMessage(m.id)).toMatchObject({
      cached: true,
      languageName: 'Arabic',
    })
  })
})
