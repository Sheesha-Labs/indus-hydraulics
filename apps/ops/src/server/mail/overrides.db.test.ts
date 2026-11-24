import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import {
  buildQueueWorld,
  cleanQueue,
  localDatabaseUrl,
  type QueueWorld,
} from '../mail-send/testing/fixture'

/**
 * A person's corrections (S05-T05/T06) on the local database: Change type closes the Unsure item and records
 * an override signal; Link to… links, marks the thread's enquiry and closes a link proposal; Unlink keeps the
 * link as history; a Helper's reply on the client mailbox becomes a manual_reply proposal and queues nothing.
 */
const DB_URL = localDatabaseUrl()
const TAG = 'ovr'

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

describe.skipIf(!DB_URL)('mail overrides · local database', () => {
  let db: typeof import('@indus/ops-db').opsDb
  let o: typeof import('./overrides')
  let reply: typeof import('./reply')
  let world: QueueWorld
  let threadId: string
  const actor = { id: '', initials: 'KB' }

  async function msg(over: Record<string, unknown> = {}): Promise<string> {
    const m = await db.mailMessage.create({
      data: {
        mailboxId: world.salesId,
        threadId,
        gmailMessageId: `g-${TAG}-${randomUUID()}`,
        rfcMessageId: `${randomUUID()}@client.example`,
        direction: 'inbound',
        fromAddress: 'buyer@client.example',
        toAddresses: ['sales@example.test'],
        ccAddresses: [],
        subject: 'Price list',
        bodyText: 'See attached.',
        sentAt: new Date(),
        labelsApplied: [],
        origin: 'live',
        classification: 'unclassified',
        confidence: 'unsure',
        handledState: 'unsure',
        ...over,
      },
      select: { id: true },
    })
    return m.id
  }

  async function unsureItem(
    messageId: string,
    key: string,
    options: Array<{ key: string }>
  ): Promise<string> {
    const ref = `A-OVR-${randomUUID().slice(0, 8)}`
    const a = await db.assistantAction.create({
      data: {
        ref,
        actionKey: key,
        levelAtTime: 'do_quietly',
        guardrails: [],
        subjectType: 'mail_message',
        subjectId: messageId,
        headline: 'Unsure',
        reasons: [],
        state: 'proposed',
        surface: 'mail_unsure',
        options: options.map((x) => ({ ...x, label: x.key, consequence: '' })),
      },
      select: { id: true },
    })
    return a.id
  }

  beforeAll(async () => {
    ;({ opsDb: db } = await import('@indus/ops-db'))
    o = await import('./overrides')
    reply = await import('./reply')
    world = await buildQueueWorld(db, TAG)
    actor.id = world.ownerId
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

  it('Change type writes the class as sure, closes the Unsure item and records an override', async () => {
    const id = await msg()
    const item = await unsureItem(id, 'classify_mail', [
      { key: 'supplier_price_list' },
      { key: 'client_enquiry' },
    ])
    const out = await db.$transaction((tx) =>
      o.changeType(tx, { messageId: id, cls: 'supplier_price_list', actor })
    )
    expect(out.events.map((e) => e.name)).toEqual(['ops/mail.classified', 'ops/review.changed'])
    const m = await db.mailMessage.findUniqueOrThrow({ where: { id } })
    expect(m).toMatchObject({
      classification: 'supplier_price_list',
      confidence: 'sure',
      handledState: 'not_linked',
      unsureReason: null,
    })
    expect(m.assistantNote).toBe('Supplier price list · Sure · set by KB')
    const a = await db.assistantAction.findUniqueOrThrow({ where: { id: item } })
    expect(a).toMatchObject({
      state: 'done',
      chosenOption: 'supplier_price_list',
      decidedById: world.ownerId,
    })
    expect(a.undoUntil!.getTime()).toBeGreaterThan(Date.now())
    const states = await db.assistantActionEvent.findMany({
      where: { actionId: item },
      orderBy: { at: 'asc' },
      select: { toState: true, actorKind: true },
    })
    expect(states.map((e) => e.toState)).toEqual(['proposed', 'approved', 'running', 'done'])
    expect(states.slice(1).every((e) => e.actorKind === 'user')).toBe(true)
    const sig = await db.preferenceSignal.findFirstOrThrow({ where: { actionId: item } })
    expect(sig).toMatchObject({ kind: 'override', actionKey: 'classify_mail' })
    const act = await db.activityEvent.findMany({
      where: { subjectId: id },
      select: { actorKind: true, actorId: true },
    })
    expect(act.every((x) => x.actorKind === 'user' && x.actorId === world.ownerId)).toBe(true)
  })

  it('a choice outside the options is edited_approved; Not business is a Change type', async () => {
    const id = await msg()
    const item = await unsureItem(id, 'classify_mail', [{ key: 'client_enquiry' }])
    await db.$transaction((tx) => o.markNotBusiness(tx, { messageId: id, actor }))
    const events = await db.assistantActionEvent.findMany({ where: { actionId: item } })
    expect(events.map((e) => e.toState)).toContain('edited_approved')
    expect((await db.mailMessage.findUniqueOrThrow({ where: { id } })).handledState).toBe('handled')
  })

  it('Link to… links (sure), closes the link proposal; Unlink keeps the history', async () => {
    const id = await msg({
      classification: 'client_reply',
      confidence: 'likely',
      handledState: 'unsure',
    })
    const recordId = randomUUID()
    const item = await unsureItem(id, 'link_mail', [{ key: `enquiry:${recordId}` }])
    await db.$transaction((tx) =>
      o.linkTo(tx, {
        messageId: id,
        subjectType: 'enquiry',
        subjectId: recordId,
        enquiryId: null,
        actor,
        kind: 'unsure_choice',
      })
    )
    const link = await db.mailLink.findFirstOrThrow({ where: { messageId: id } })
    expect(link).toMatchObject({
      subjectId: recordId,
      linkedBy: 'user',
      confidence: 'sure',
      removedAt: null,
    })
    expect((await db.mailMessage.findUniqueOrThrow({ where: { id } })).handledState).toBe('handled')
    expect((await db.assistantAction.findUniqueOrThrow({ where: { id: item } })).state).toBe('done')
    expect((await db.preferenceSignal.findFirstOrThrow({ where: { actionId: item } })).kind).toBe(
      'unsure_choice'
    )

    await db.$transaction((tx) =>
      o.unlink(tx, { messageId: id, subjectType: 'enquiry', subjectId: recordId, actor })
    )
    const after = await db.mailLink.findFirstOrThrow({ where: { messageId: id } })
    expect(after.removedAt).not.toBeNull()
    expect((await db.mailMessage.findUniqueOrThrow({ where: { id } })).handledState).toBe(
      'not_linked'
    )
    await expect(
      db.$transaction((tx) =>
        o.unlink(tx, { messageId: id, subjectType: 'enquiry', subjectId: recordId, actor })
      )
    ).rejects.toThrow(/already removed/)
  })

  it('reply permissions: the Owner sends from either mailbox; a Helper only purchase@ with the flag; sales@ proposes', () => {
    const owner = { role: 'owner' as const, canSendSupplierMail: false }
    const helper = { role: 'helper' as const, canSendSupplierMail: false }
    const sender = { role: 'helper' as const, canSendSupplierMail: true }
    expect(reply.replyPermission(owner, 'client')).toBe('send')
    expect(reply.replyPermission(owner, 'supplier')).toBe('send')
    expect(reply.replyPermission(helper, 'supplier')).toBe('none')
    expect(reply.replyPermission(sender, 'supplier')).toBe('send')
    expect(reply.replyPermission(sender, 'client')).toBe('propose')
    expect(reply.replyPermission(owner, 'read_only')).toBe('none')
    expect(reply.replySubject('Price list')).toBe('Re: Price list')
    expect(reply.replySubject('RE: Price list')).toBe('RE: Price list')
  })

  it('a Helper reply on sales@ becomes a manual_reply proposal and queues nothing', async () => {
    await msg({ classification: 'client_enquiry', confidence: 'sure', handledState: 'not_linked' })
    // Under --randomize the Owner's reply below may already have queued one in this thread.
    const queuedBefore = await db.outboundEmail.count({ where: { threadId } })
    const helper = await db.user.findUniqueOrThrow({ where: { id: world.helperId } })
    const out = await reply.replyInThread({
      user: { ...helper, initials: 'AB', role: 'helper' } as never,
      threadId,
      to: ['buyer@client.example'],
      cc: [],
      html: '<p>We will revert shortly.</p>',
    })
    expect(out.kind).toBe('proposed')
    const a = await db.assistantAction.findFirstOrThrow({
      where: { actionKey: 'manual_reply', subjectId: threadId },
    })
    expect(a).toMatchObject({
      state: 'proposed',
      surface: 'review',
      levelAtTime: 'draft_and_ask',
      origin: 'manual',
    })
    expect(await db.outboundEmail.count({ where: { threadId } })).toBe(queuedBefore)
  })

  it('the Owner’s reply is queued in the thread’s own mailbox with an undo window', async () => {
    const owner = await db.user.findUniqueOrThrow({ where: { id: world.ownerId } })
    const out = await reply.replyInThread({
      user: { ...owner, role: 'owner' } as never,
      threadId,
      to: ['buyer@client.example'],
      cc: [],
      html: '<p>Our offer is attached.</p><script>bad()</script>',
    })
    expect(out.kind).toBe('scheduled')
    if (out.kind !== 'scheduled') return
    expect(out.undoRemainingMs).toBeGreaterThan(4 * 60_000)
    const row = await db.outboundEmail.findUniqueOrThrow({ where: { id: out.outboundId } })
    expect(row).toMatchObject({ mailboxId: world.salesId, threadId, status: 'scheduled' })
    expect(row.subject).toMatch(/^Re: /)
    expect(row.bodyHtml).not.toContain('<script')
  })
})
