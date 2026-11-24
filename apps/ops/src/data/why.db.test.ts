import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import {
  buildQueueWorld,
  cleanQueue,
  localDatabaseUrl,
  type QueueWorld,
} from '../server/mail-send/testing/fixture'

/**
 * Why? on the local database (S06-T05): an action's reasons resolve to highlighted spans, a reason id opens
 * Sources at its span, a changed source says so, a Helper gets sensitive history as "Hidden" and no cost, and
 * a correction writes the value, the override action that reverts the original, and the preference signal.
 */
const DB_URL = localDatabaseUrl()
const TAG = 'why'

vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
vi.mock('../inngest/emit', () => ({
  emitEvent: async () => true,
  emitEventOrThrow: async () => undefined,
}))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: () => undefined,
  revalidatePath: () => undefined,
}))

const QUOTE = 'please find attached our updated price list'
const SUBJECT = 'Price list Q4'
const BODY = `Dear team,\n\n${QUOTE} for Q4. Stock on the 22-series is good.`

describe.skipIf(!DB_URL)('Why? · local database', () => {
  let db: typeof import('@indus/ops-db').opsDb
  let why: typeof import('./why')
  let override: typeof import('../server/assistant/override')
  let spans: typeof import('../server/mail/spans')
  let world: QueueWorld
  let threadId: string
  const owner = { role: 'owner' as const, canSeeMargins: true }
  const helper = { role: 'helper' as const, canSeeMargins: false }

  async function scenario() {
    const m = await db.mailMessage.create({
      data: {
        mailboxId: world.salesId,
        threadId,
        gmailMessageId: `g-${TAG}-${randomUUID()}`,
        direction: 'inbound',
        fromAddress: 'sales@supplier.example.test',
        toAddresses: ['sales@example.test'],
        ccAddresses: [],
        subject: SUBJECT,
        bodyText: BODY,
        bodyTextHash: 'h1',
        sentAt: new Date(),
        labelsApplied: [],
        origin: 'live',
        classification: 'supplier_price_list',
        confidence: 'sure',
        handledState: 'not_linked',
      },
      select: { id: true },
    })
    const ref = `A-WHY-${randomUUID().slice(0, 8)}`
    const a = await db.assistantAction.create({
      data: {
        ref,
        actionKey: 'classify_mail',
        levelAtTime: 'do_quietly',
        guardrails: [],
        subjectType: 'mail_message',
        subjectId: m.id,
        headline: 'Classified as Supplier price list',
        reasons: [
          { text: `The sender sends a price list — “${QUOTE}”` },
          { text: 'The sender is a known supplier' },
        ],
        checks: [
          { label: 'Quoted evidence', status: 'pass', detail: '1 of 1 quotes found in the email' },
          { label: 'Landed cost', status: 'pass', detail: 'AED 10', sensitive: true },
        ],
        confidence: 'sure',
        state: 'done',
        surface: 'review',
        model: 'claude-haiku-5-5',
        promptVersion: 'classify-mail.v1',
        costUsd: 0.0012,
      },
      select: { id: true },
    })
    const [span] = await spans.saveEmailSpans(m.id, 'h1', `${SUBJECT}\n${BODY}`, [QUOTE])
    await db.activityEvent.createMany({
      data: [
        {
          actorKind: 'assistant',
          actionId: a.id,
          subjectType: 'mail_message',
          subjectId: m.id,
          kind: 'status',
          field: 'classification',
          before: 'unclassified',
          after: 'supplier_price_list',
        },
        {
          actorKind: 'assistant',
          actionId: a.id,
          subjectType: 'mail_message',
          subjectId: m.id,
          kind: 'money',
          field: 'cost',
          before: '100.00',
          after: '125.00',
          sensitive: true,
        },
      ],
    })
    return { messageId: m.id, ref, actionId: a.id, spanId: span!.spanId }
  }

  beforeAll(async () => {
    ;({ opsDb: db } = await import('@indus/ops-db'))
    why = await import('./why')
    override = await import('../server/assistant/override')
    spans = await import('../server/mail/spans')
    world = await buildQueueWorld(db, TAG)
    const t = await db.mailThread.create({
      data: { mailboxId: world.salesId, gmailThreadId: `t-${TAG}-${randomUUID()}` },
      select: { id: true },
    })
    threadId = t.id
  })

  afterAll(async () => {
    await cleanQueue(db, TAG)
    await db.$disconnect()
  })

  it('an action: reasons with source links, the exact span highlighted, alternatives and a correction', async () => {
    const s = await scenario()
    const v = (await why.getWhy(s.ref, owner))!
    expect(v.title).toBe('Classified as Supplier price list')
    expect(v.eyebrow).toBe('Why? · Mail')
    expect(v.initialTab).toBe('reasons')
    expect(v.reasons[0]!.evidence?.evidenceId).toBe(`${s.ref}~r0`)
    expect(v.reasons[1]!.evidence).toBeUndefined()
    expect(v.spans).toHaveLength(1)
    const sp = v.spans[0]!
    expect(sp.key).toBe(s.spanId)
    expect(sp.match).toBe(QUOTE)
    expect(sp.text.slice(sp.matchAt!, sp.matchAt! + QUOTE.length)).toBe(QUOTE)
    expect(sp.location).toBe('Paragraph 2')
    expect(sp.openHref).toBe(`/mail/all/${threadId}`)
    expect(sp.changed).toBe(false)
    expect(v.footnote).toContain('$0.0012')
    expect(v.checks.map((c) => c.text)).toContain('Landed cost')
    expect(v.correction?.label).toBe('Type')
    expect(v.correction?.choices.some((c) => c.key === 'supplier_price_list')).toBe(false)
    expect(v.history.map((h) => h.field)).toEqual(['classification'])
    expect(v.history[0]!.who).toBe(`Assistant · ${s.ref}`)
  })

  it('a reason id opens Sources at that reason’s span', async () => {
    const s = await scenario()
    const v = (await why.getWhy(`${s.ref}~r0`, owner))!
    expect(v.initialTab).toBe('sources')
    expect(v.activeSpan).toBe(s.spanId)
  })

  it('a source whose text changed since it was read says so and shows the quote as cited', async () => {
    const s = await scenario()
    await db.mailMessage.update({ where: { id: s.messageId }, data: { bodyTextHash: 'h2' } })
    const sp = (await why.getWhy(s.ref, owner))!.spans[0]!
    expect(sp.changed).toBe(true)
    expect(sp.text).toBe(`“${QUOTE}”`)
  })

  it('a Helper without margins: sensitive history is Hidden, no cost, no sensitive check', async () => {
    const s = await scenario()
    const h = (await why.getWhy(`${s.ref}~fcost`, helper))!
    expect(h.initialTab).toBe('history')
    expect(h.history).toHaveLength(1)
    expect(h.history[0]).toMatchObject({ before: 'Hidden', after: 'Hidden' })
    expect(JSON.stringify(h)).not.toContain('125.00')
    expect(h.footnote).not.toContain('$')
    expect(h.checks.map((c) => c.text)).not.toContain('Landed cost')
    const o = (await why.getWhy(`${s.ref}~fcost`, owner))!
    expect(o.history[0]).toMatchObject({ before: '100.00', after: '125.00' })
  })

  it('a correction writes the value, the override action, the revert and the signal', async () => {
    const s = await scenario()
    const out = await db.$transaction((tx) =>
      override.correctValue(tx, {
        actionRef: s.ref,
        value: 'client_enquiry',
        reason: 'They ask us for a price',
        actor: { id: world.ownerId, initials: 'KB' },
      })
    )
    expect(out.label).toBe('Client enquiry')
    expect(out.events.map((e) => e.name)).toContain('ops/mail.classified')
    const m = await db.mailMessage.findUniqueOrThrow({ where: { id: s.messageId } })
    expect(m.classification).toBe('client_enquiry')
    const original = await db.assistantAction.findUniqueOrThrow({ where: { id: s.actionId } })
    expect(original.state).toBe('reverted')
    const ov = await db.assistantAction.findUniqueOrThrow({ where: { ref: out.ref } })
    expect(ov).toMatchObject({
      actionKey: 'override_value',
      state: 'done',
      revertOfId: s.actionId,
      decidedById: world.ownerId,
      headline: 'Overridden by KB: Type → Client enquiry',
    })
    const signal = await db.preferenceSignal.findFirstOrThrow({
      where: { kind: 'override', createdById: world.ownerId, actionKey: 'classify_mail' },
      orderBy: { createdAt: 'desc' },
    })
    expect(signal.payload).toMatchObject({
      after: 'client_enquiry',
      reason: 'They ask us for a price',
      correctsAction: s.ref,
    })
    const v = (await why.getWhy(s.ref, owner))!
    expect(v.overridden).toContain('Reverted')
    expect(v.correction).toBeNull()
    const me = await db.user.findUniqueOrThrow({ where: { id: world.ownerId } })
    expect(v.history[0]).toMatchObject({ who: me.initials, after: 'client enquiry' })
    expect(v.history[0]!.time).toMatch(/^\d{1,2} [A-Z][a-z]{2} \d{2}:\d{2}$/)
    expect(v.history[0]!.note).toBe('Overridden by KB: Client enquiry')
    expect(v.history[0]!.evidenceId).toMatch(/^ae_/)
  })

  it('a correction needs a reason and an allowed value', async () => {
    const s = await scenario()
    const run = (value: string, reason: string) =>
      db.$transaction((tx) =>
        override.correctValue(tx, {
          actionRef: s.ref,
          value,
          reason,
          actor: { id: world.ownerId, initials: 'KB' },
        })
      )
    await expect(run('client_enquiry', '  ')).rejects.toThrow('Say in a line')
    await expect(run('unclassified', 'x')).rejects.toThrow('Choose a type')
    await expect(run('nonsense', 'x')).rejects.toThrow('Choose a type')
  })

  it('a link correction may pick any record the Link to… search finds; it must exist', async () => {
    const s = await scenario()
    const mk = (n: number) =>
      db.enquiry.create({
        data: {
          ref: `ENQ-2096-${n}${Date.now() % 100000}`,
          title: `Why link ${n}`,
          receivedVia: 'manual',
          receivedAt: new Date(),
        },
        select: { id: true, ref: true },
      })
    const offered = await mk(1)
    const searched = await mk(2)
    const ref = `A-WHY-${randomUUID().slice(0, 8)}`
    await db.assistantAction.create({
      data: {
        ref,
        actionKey: 'link_mail',
        levelAtTime: 'do_quietly',
        guardrails: [],
        subjectType: 'mail_message',
        subjectId: s.messageId,
        headline: `Linked to ${offered.ref}`,
        reasons: [],
        state: 'done',
        surface: 'review',
        options: [
          { key: `enquiry:${offered.id}`, label: offered.ref, consequence: 'Offered by the Assistant' },
        ],
      },
    })
    const v = (await why.getWhy(ref, owner))!
    expect(v.correction).toMatchObject({
      valueType: 'option',
      search: { kind: 'link', messageId: s.messageId },
    })
    const run = (value: string) =>
      db.$transaction((tx) =>
        override.correctValue(tx, {
          actionRef: ref,
          value,
          reason: 'It belongs to the other enquiry',
          actor: { id: world.ownerId, initials: 'KB' },
        })
      )
    await expect(run(`enquiry:${randomUUID()}`)).rejects.toThrow('no longer here')
    await expect(run('mail_thread:x')).rejects.toThrow('search for one')
    const out = await run(`enquiry:${searched.id}`)
    expect(out.label).toContain(searched.ref)
    expect(
      await db.mailLink.findFirst({
        where: { messageId: s.messageId, subjectId: searched.id, removedAt: null },
      })
    ).not.toBeNull()
  })

  it('unknown and malformed ids are null', async () => {
    expect(await why.getWhy('A-NOPE-00000000', owner)).toBeNull()
    expect(await why.getWhy('../etc', owner)).toBeNull()
    expect(await why.getWhy(`ae_${randomUUID()}`, owner)).toBeNull()
  })
})
