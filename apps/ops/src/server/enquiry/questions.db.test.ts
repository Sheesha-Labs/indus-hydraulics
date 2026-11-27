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
 * Client questions before sourcing (S09-T07, board 171) on the local database:
 *   - #7 asks only the chosen lines (a line already with suppliers is left out); approving holds exactly those lines
 *     with draft questions; undo releases them; the email leaving plans the clock and pauses the response clock
 *   - the clocks fire once each: the day-2 reminder (moved when the contact is out of office), the day-3 call task
 *     on the Owner's Today, the fallback proposal
 *   - #8 reminds of the open questions; leaving stamps reminderSentAt
 *   - the fallback: assume (assumptions printed, lines open), leave out (held → not_quoted), wait
 *   - the client's answers: a quote found in the reply opens the line and applies the quantity it states; a quoted
 *     line whose quantity changes goes back to sourcing; when none are left open the response clock resumes
 */
const DB_URL = localDatabaseUrl()
const h = vi.hoisted(() => ({
  emitted: [] as Array<{ name: string; data: Record<string, unknown> }>,
}))
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
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
      'questions.clock': {
        reminderWorkingDays: 2,
        callTaskHour: '10:00',
        supplierLeadWorkingDays: 4,
      },
      'calendar.country_weekends': { default: [6, 0], byCountry: {} },
    })[key] ?? {},
}))

await import('../assistant/actions')
const ask = (await import('../assistant/actions/ask-client-questions')).default
const remind = (await import('../assistant/actions/remind-client-questions')).default
const fallback = (await import('../assistant/actions/client-question-fallback')).default
const match = (await import('../assistant/actions/match-client-answers')).default
const { gatherAsk } = await import('../assistant/actions/ask-client-questions')
const { gatherRemind } = await import('../assistant/actions/remind-client-questions')
const { gatherFallback } = await import('../assistant/actions/client-question-fallback')
const { gatherMatch } = await import('../assistant/actions/match-client-answers')
const { scopeVersion } = await import('./choose-path')
const { releaseOnUndo } = await import('../assistant/undo-hooks')
const { setActor } = await import('../assistant/write-tracked')
const { runClock } = await import('../clocks/registry')
await import('../clocks')
const qa = await import('./questions-actions')

const TAG = `s09qs${Date.now()}`

describe.skipIf(!DB_URL)('client questions · local database', () => {
  let world: QueueWorld
  let clientId = ''
  let contactId = ''
  const enquiries: string[] = []

  async function enquiry(label: string) {
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
        subject: 'RFQ GPS/MM/25-1187 turnaround spares',
        bodyText: 'Please quote the twelve items attached.',
        bodyTextHash: randomUUID(),
        sentAt: new Date('2026-09-14T05:00:00Z'),
        labelsApplied: [],
        origin: 'live',
      },
      select: { id: true },
    })
    const e = await opsDb.enquiry.create({
      data: {
        ref: `ENQ-2099-${String(Date.now()).slice(-6)}${label.length}`,
        title: 'Turnaround spares — valves, bearings and instruments',
        clientId,
        contactId,
        clientRef: 'GPS/MM/25-1187',
        receivedVia: 'email',
        receivedAt: new Date('2026-09-14T05:00:00Z'),
        revertBy: new Date('2026-09-25T14:00:00Z'),
        stage: 'sourcing',
        chosenPath: 'quote_fully',
        lines: {
          create: Array.from({ length: 6 }, (_, i) => ({
            no: i + 1,
            description: [
              'Globe valve 3in CL600',
              'Gate valve 2in',
              'Bearing 6316',
              'Cartridge seal 55 mm',
              'Gasket 6in',
              'Level gauge 1200 mm',
            ][i]!,
            qty: 4,
            status: i === 1 ? ('sourcing' as const) : ('open' as const),
          })),
        },
      },
      select: { id: true, ref: true },
    })
    enquiries.push(e.id)
    await opsDb.intakeBatch.create({
      data: { source: 'mail', mailMessageId: m.id, status: 'confirmed', enquiryId: e.id },
    })
    return { ...e, threadId: thread.id, messageId: m.id }
  }

  const request = (enquiryId: string, lineNos: number[]) => ({
    actionKey: 'ask_client_questions',
    subjectType: 'enquiry' as const,
    subjectId: enquiryId,
    enquiryId,
    trigger: 'person',
    origin: 'live' as const,
    sourceVersion: scopeVersion('lines', lineNos, new Date()),
  })

  const drafted = {
    questions: [
      {
        lineNo: 1,
        question: 'Trim material: 13Cr or Stellite 6 faced?',
        fallbackAssumption: 'Supplied with 13Cr trim.',
      },
      {
        lineNo: 4,
        question: 'Is the Plan 53A barrier system in scope, or the seal only?',
        fallbackAssumption: 'Seal only.',
      },
      {
        lineNo: 6,
        question: 'Process connection: flange size and rating?',
        fallbackAssumption: '2 in CL300 flanges.',
      },
    ],
  }
  const fakeAi = (value: unknown) => ({
    call: async () =>
      ({ ok: true, value, costUsd: '0.002000', model: 'claude-sonnet-5-5', callIds: [] }) as never,
  })

  async function askAndSend(label: string) {
    const e = await enquiry(label)
    const req = request(e.id, [1, 2, 4, 6])
    const input = await gatherAsk(e.id, req.sourceVersion, null)
    const p = await ask.propose(input, fakeAi(drafted) as never)
    if (!p.ok) throw new Error('propose failed')
    const v = await ask.verify(p.out, input)
    const actionId = randomUUID()
    await opsDb.$transaction(async (tx) => {
      await setActor(tx, { kind: 'user', id: world.ownerId })
      await ask.onScheduled!(tx, v, { actionId, request: req, decidedById: world.ownerId })
    })
    await opsDb.$transaction(async (tx) => {
      await setActor(tx, { kind: 'system' })
      await ask.onSent!(tx, {
        id: actionId,
        output: v.out,
        request: req,
        decidedById: world.ownerId,
        chosenOption: null,
      })
    })
    // The email "left" on Mon 14 Sep 11:20 Dubai: plan from there (onSent used now; reset to the board's day).
    const { questionClockFor, markQuestionsSent } = await import('./questions')
    void markQuestionsSent
    const sentAt = new Date('2026-09-14T07:20:00Z')
    const clock = await questionClockFor(
      { deadline: null, revertBy: new Date('2026-09-25T14:00:00Z') },
      sentAt
    )
    await opsDb.clientQuestion.updateMany({
      where: { enquiryId: e.id },
      data: {
        sentAt,
        reminderDueAt: clock.reminderDueAt,
        callTaskAt: clock.callTaskAt,
        fallbackAt: clock.fallbackAt,
      },
    })
    return { e, input, v, req, actionId }
  }

  beforeAll(async () => {
    world = await buildQueueWorld(opsDb, TAG)
    const c = await opsDb.company.create({
      data: { name: `Sample Petrochem ${TAG}`, isClient: true },
      select: { id: true },
    })
    clientId = c.id
    contactId = (
      await opsDb.contact.create({
        data: {
          companyId: c.id,
          name: 'Sample Buyer',
          firstName: 'Sample',
          email: `buyer@${TAG}.example.test`,
          phone: '+971 00 000 0000',
        },
        select: { id: true },
      })
    ).id
  })

  afterAll(async () => {
    await opsDb.task.deleteMany({ where: { enquiryId: { in: enquiries } } })
    await opsDb.intakeBatch.deleteMany({ where: { enquiryId: { in: enquiries } } })
    await opsDb.enquiry.updateMany({
      where: { id: { in: enquiries } },
      data: { closedReason: 'other', closeNote: 'test', closedAt: new Date() },
    })
    await cleanQueue(opsDb, TAG)
    await opsDb.$disconnect()
  })

  it('#7: only the asked lines that can wait; approval holds them; undo releases them', async () => {
    const e = await enquiry('undo')
    const req = request(e.id, [1, 2, 4, 6])
    const input = await gatherAsk(e.id, req.sourceVersion, 'Ask about trim')
    expect(input.lines.map((l) => l.no)).toEqual([1, 4, 6])
    expect(input.skipped).toEqual([2])
    expect(input.lines[0]!.unclear).toContain('no make or part number')
    const p = await ask.propose(input, fakeAi(drafted) as never)
    if (!p.ok) throw new Error('propose failed')
    expect(p.out.body).toContain('Before we source 3 of the lines on your enquiry GPS/MM/25-1187')
    expect(p.out.body).toContain(
      'Line 1 · Globe valve 3in CL600\nTrim material: 13Cr or Stellite 6 faced?'
    )
    const v = await ask.verify(p.out, input)
    expect(v.checks.find((c) => c.label.startsWith('Only the held lines'))?.status).toBe('pass')
    expect(ask.toProposal(v, input).reasons.map((r) => r.text)).toContain(
      'Line 2 already went to suppliers, so it is not asked about.'
    )
    expect(ask.outbound!(v, input)).toMatchObject({
      kind: 'client_questions',
      mailboxId: world.salesId,
    })

    // A question for a line that was not asked about fails the card.
    const stray = await ask.verify(
      {
        ...p.out,
        questions: [
          ...drafted.questions,
          { lineNo: 3, question: 'Which bearing?', fallbackAssumption: 'C3.' },
        ],
      },
      input
    )
    expect(stray.confidence).toBe('unsure')

    // The approved card, as decisions leaves it while its email waits in the queue.
    const actionId = (
      await opsDb.assistantAction.create({
        data: {
          ref: `A-${TAG.slice(-8).toUpperCase()}-U`,
          actionKey: 'ask_client_questions',
          levelAtTime: 'draft_and_ask',
          subjectType: 'enquiry',
          subjectId: e.id,
          enquiryId: e.id,
          headline: 'Ask',
          reasons: [],
          state: 'queued',
          decidedById: world.ownerId,
          idempotencyKey: `ask_client_questions:test:${randomUUID()}`,
          basisHash: 'x',
          surface: 'review',
        } as never,
        select: { id: true },
      })
    ).id
    await opsDb.$transaction(async (tx) => {
      await setActor(tx, { kind: 'user', id: world.ownerId })
      await ask.onScheduled!(tx, v, { actionId, request: req, decidedById: world.ownerId })
    })
    const held = await opsDb.enquiryLine.findMany({
      where: { enquiryId: e.id },
      orderBy: { no: 'asc' },
      select: { no: true, status: true },
    })
    expect(held.map((l) => l.status)).toEqual(['held', 'sourcing', 'open', 'held', 'open', 'held'])
    expect(await opsDb.clientQuestion.count({ where: { enquiryId: e.id, status: 'draft' } })).toBe(
      3
    )
    expect(await ask.approvalCheck!({ subject: 'Re: x', body: 'y' }, req)).toContain(
      'already waiting to send'
    )

    await opsDb.$transaction(async (tx) => {
      await setActor(tx, { kind: 'user', id: world.ownerId })
      expect(
        await releaseOnUndo(tx, { id: actionId, actionKey: 'ask_client_questions', output: null })
      ).toBe(true)
    })
    expect(
      (
        await opsDb.enquiryLine.findMany({ where: { enquiryId: e.id }, orderBy: { no: 'asc' } })
      ).map((l) => l.status)
    ).toEqual(['open', 'sourcing', 'open', 'open', 'open', 'open'])
    expect(await opsDb.clientQuestion.count({ where: { enquiryId: e.id } })).toBe(0)
  })

  it('sent: the clock is planned and the response clock paused; the clocks fire once each', async () => {
    const { e } = await askAndSend('clock')
    const qs = await opsDb.clientQuestion.findMany({ where: { enquiryId: e.id } })
    expect(qs.every((q) => q.status === 'sent')).toBe(true)
    expect(qs[0]!.reminderDueAt?.toISOString()).toBe('2026-09-16T05:00:00.000Z')
    expect(qs[0]!.callTaskAt?.toISOString()).toBe('2026-09-17T06:00:00.000Z')
    expect(qs[0]!.fallbackAt?.toISOString()).toBe('2026-09-17T06:00:00.000Z')
    expect(
      (await opsDb.enquiry.findUniqueOrThrow({ where: { id: e.id } })).responseClockPausedAt
    ).not.toBeNull()

    // Day 2: the reminder is requested once.
    h.emitted.length = 0
    const day2 = new Date('2026-09-16T05:30:00Z')
    await runClock('questions.reminder', day2)
    const reminders = h.emitted.filter(
      (x) => x.data.actionKey === 'remind_client_questions' && x.data.subjectId === e.id
    )
    expect(reminders).toHaveLength(1)

    // Day 3: one call task on the Owner's Today; a second tick adds none.
    await runClock('questions.call', new Date('2026-09-17T06:30:00Z'))
    await runClock('questions.call', new Date('2026-09-17T06:45:00Z'))
    const tasks = await opsDb.task.findMany({ where: { enquiryId: e.id, kind: 'call' } })
    expect(tasks).toHaveLength(1)
    expect(tasks[0]!.title).toBe(`Call Sample Buyer about 3 open questions on ${e.ref}`)
    expect(tasks[0]!.notes).toContain('Phone +971 00 000 0000')

    // The fallback is proposed.
    h.emitted.length = 0
    await runClock('questions.fallback', new Date('2026-09-17T06:30:00Z'))
    expect(
      h.emitted.filter(
        (x) => x.data.actionKey === 'client_question_fallback' && x.data.subjectId === e.id
      )
    ).toHaveLength(1)
  })

  it('a contact out of office: the reminder moves to the working day after they are back', async () => {
    const { e } = await askAndSend('ooo')
    await opsDb.contact.update({
      where: { id: contactId },
      data: { outOfOfficeUntil: new Date('2026-09-17T00:00:00Z') },
    })
    h.emitted.length = 0
    await runClock('questions.reminder', new Date('2026-09-16T05:30:00Z'))
    expect(h.emitted.filter((x) => x.data.subjectId === e.id)).toHaveLength(0)
    const q = await opsDb.clientQuestion.findFirstOrThrow({ where: { enquiryId: e.id } })
    // Back Thu 17 Sep: reminder Fri 18 Sep 09:00 Dubai.
    expect(q.reminderDueAt?.toISOString()).toBe('2026-09-18T05:00:00.000Z')
    await opsDb.contact.update({ where: { id: contactId }, data: { outOfOfficeUntil: null } })
  })

  it('#8 reminds of the open questions; leaving stamps reminderSentAt', async () => {
    const { e } = await askAndSend('remind')
    const input = await gatherRemind(e.id, new Date('2026-09-16T05:30:00Z'))
    expect(input.questions).toHaveLength(3)
    expect(input.fallbackLabel).toBe('17 September')
    const p = await remind.propose(input, fakeAi({}) as never)
    if (!p.ok) throw new Error('propose failed')
    expect(p.out.body).toContain('A short reminder of our 3 open questions on GPS/MM/25-1187')
    expect(p.out.body).toContain(
      'If we have not heard by 17 September, we will quote these lines on the assumptions'
    )
    const v = await remind.verify(p.out, input)
    expect(v.confidence).toBe('sure')
    expect(remind.toProposal(v, input).reasons.at(-1)?.text).toBe(
      'Held lines must reach suppliers by 18 Sep.'
    )
    expect(remind.outbound!(v, input)).toMatchObject({ kind: 'client_question_reminder' })
    await opsDb.$transaction(async (tx) => {
      await setActor(tx, { kind: 'system' })
      await remind.onSent!(tx, {
        id: randomUUID(),
        output: p.out,
        request: { ...request(e.id, []), actionKey: 'remind_client_questions' },
        decidedById: world.ownerId,
        chosenOption: null,
      })
    })
    expect(
      (await opsDb.clientQuestion.findMany({ where: { enquiryId: e.id } })).every(
        (q) => q.reminderSentAt
      )
    ).toBe(true)
  })

  it('fallback: leave out → not quoted; assume → assumptions printed, lines open; wait keeps waiting', async () => {
    const a = await askAndSend('leave')
    const fIn = await gatherFallback(a.e.id)
    const p = await fallback.propose(fIn, fakeAi({}) as never)
    if (!p.ok) throw new Error('propose failed')
    const v = await fallback.verify(p.out, fIn)
    expect(fallback.toProposal(v, fIn).options?.map((o) => o.key)).toEqual([
      'assume',
      'leave_out',
      'wait',
    ])
    const ctx = (chosenOption: string) => ({
      actionId: randomUUID(),
      ref: 'A-T',
      level: 'draft_and_ask' as const,
      chosenOption,
      decidedById: world.ownerId,
      request: { ...request(a.e.id, []), actionKey: 'client_question_fallback' },
    })
    await opsDb.$transaction(async (tx) => {
      await setActor(tx, { kind: 'user', id: world.ownerId })
      await fallback.effect(tx, v, ctx('leave_out'))
    })
    const lines = await opsDb.enquiryLine.findMany({
      where: { enquiryId: a.e.id, no: { in: [1, 4, 6] } },
    })
    expect(
      lines.every(
        (l) => l.status === 'not_quoted' && l.notQuotedReason === 'Awaiting client answer'
      )
    ).toBe(true)
    expect(
      (await opsDb.enquiry.findUniqueOrThrow({ where: { id: a.e.id } })).responseClockPausedAt
    ).toBeNull()

    const b = await askAndSend('assume')
    await opsDb.$transaction(async (tx) => {
      await setActor(tx, { kind: 'user', id: world.ownerId })
      const out = await qa.applyFallbackNow(
        tx,
        { enquiryId: b.e.id, choice: 'wait' },
        { id: world.ownerId, initials: 'KB' }
      )
      expect(out.applied).toBe(3)
    })
    expect(
      (await opsDb.clientQuestion.findMany({ where: { enquiryId: b.e.id } })).every(
        (q) => q.fallbackChoice === 'wait'
      )
    ).toBe(true)
    await opsDb.$transaction(async (tx) => {
      await qa.applyFallbackNow(
        tx,
        { enquiryId: b.e.id, choice: 'assume' },
        { id: world.ownerId, initials: 'KB' }
      )
    })
    const assumptions = await opsDb.enquiryAssumption.findMany({
      where: { enquiryId: b.e.id },
      orderBy: { text: 'asc' },
    })
    expect(assumptions.map((x) => x.text)).toEqual([
      '2 in CL300 flanges.',
      'Seal only.',
      'Supplied with 13Cr trim.',
    ])
    expect(
      (
        await opsDb.enquiryLine.findMany({ where: { enquiryId: b.e.id, no: { in: [1, 4, 6] } } })
      ).every((l) => l.status === 'open')
    ).toBe(true)
    // "Change" on an applied assumption changes what the quotation prints.
    const q1 = await opsDb.clientQuestion.findFirstOrThrow({
      where: { enquiryId: b.e.id, line: { no: 1 } },
    })
    await opsDb.$transaction((tx) =>
      qa.changeAssumptionNow(
        tx,
        { questionId: q1.id, text: 'Supplied with Stellite 6 faced trim.' },
        { id: world.ownerId, initials: 'KB' }
      )
    )
    expect(
      await opsDb.enquiryAssumption.count({
        where: { enquiryId: b.e.id, text: 'Supplied with Stellite 6 faced trim.' },
      })
    ).toBe(1)
  })

  it('answers: a found quote opens the line and applies the quantity; a quoted line goes back to sourcing; the clock resumes', async () => {
    const { e } = await askAndSend('answers')
    // Line 4 was quoted meanwhile (e.g. its seal-only part went out): an answer changing it re-sources it.
    const l4 = await opsDb.enquiryLine.findFirstOrThrow({ where: { enquiryId: e.id, no: 4 } })
    await opsDb.enquiryLine.update({ where: { id: l4.id }, data: { status: 'quoted' } })
    const reply = await opsDb.mailMessage.create({
      data: {
        mailboxId: world.salesId,
        threadId: (await opsDb.mailMessage.findFirstOrThrow({ where: { id: e.messageId } }))
          .threadId,
        gmailMessageId: `g-${TAG}-reply`,
        rfcMessageId: `${randomUUID()}@client.example.test`,
        direction: 'inbound',
        fromAddress: `buyer@${TAG}.example.test`,
        toAddresses: ['sales@example.test'],
        ccAddresses: [],
        subject: 'Re: RFQ GPS/MM/25-1187',
        bodyText:
          'Dear Sir,\nLine 1: Stellite 6 faced trim please.\nLine 4: seal only, and we now need 6 pcs.\nRegards',
        bodyTextHash: randomUUID(),
        sentAt: new Date('2026-09-15T07:00:00Z'),
        labelsApplied: [],
        origin: 'live',
      },
      select: { id: true },
    })
    const input = await gatherMatch(reply.id, e.id)
    const qs = new Map(input.questions.map((q) => [q.lineNo, q.id]))
    const p = await match.propose(
      input,
      fakeAi({
        answers: [
          {
            id: qs.get(1)!,
            answered: true,
            answerQuote: 'Stellite 6 faced trim please',
            implies: { spec: 'Stellite 6 faced trim' },
          },
          {
            id: qs.get(4)!,
            answered: true,
            answerQuote: 'seal only, and we now need 6 pcs',
            implies: { qty: '6', spec: 'seal only' },
          },
          {
            id: qs.get(6)!,
            answered: true,
            answerQuote: 'flanges are 3 inch CL600',
            implies: { spec: 'made up' },
          },
        ],
      }) as never
    )
    if (!p.ok) throw new Error('propose failed')
    const v = await match.verify(p.out, input)
    // The third quote is not in the reply: Unsure, and it is not applied.
    expect(v.out.answers.map((a) => [a.answered, a.resolved])).toEqual([
      [true, true],
      [true, true],
      [true, false],
    ])
    expect(v.confidence).toBe('unsure')
    expect(match.toProposal(v, input).headline).toBe(`Answers to 2 of 3 questions on ${e.ref}.`)
    await opsDb.$transaction(async (tx) => {
      await setActor(tx, { kind: 'user', id: world.ownerId })
      await match.effect(tx, v, {
        actionId: randomUUID(),
        ref: 'A-T',
        level: 'draft_and_ask',
        decidedById: world.ownerId,
        request: {
          actionKey: 'match_client_answers',
          subjectType: 'mail_message',
          subjectId: reply.id,
          enquiryId: e.id,
          trigger: 't',
          origin: 'live',
          sourceVersion: 1,
        },
      })
    })
    const lines = await opsDb.enquiryLine.findMany({
      where: { enquiryId: e.id, no: { in: [1, 4, 6] } },
      orderBy: { no: 'asc' },
    })
    expect(lines.map((l) => [l.no, l.status, l.qty.toString()])).toEqual([
      [1, 'open', '4'],
      [4, 'sourcing', '6'],
      [6, 'held', '4'],
    ])
    expect(lines[0]!.specNotes).toBe('Stellite 6 faced trim')
    // One question left: the response clock still waits; answering it by hand resumes it.
    expect(
      (await opsDb.enquiry.findUniqueOrThrow({ where: { id: e.id } })).responseClockPausedAt
    ).not.toBeNull()
    const q6 = await opsDb.clientQuestion.findFirstOrThrow({
      where: { enquiryId: e.id, status: 'sent' },
    })
    await opsDb.$transaction((tx) =>
      qa.answerManually(
        tx,
        { questionId: q6.id, text: '2 in CL300, by phone' },
        { id: world.ownerId, initials: 'KB' }
      )
    )
    expect(
      (await opsDb.enquiry.findUniqueOrThrow({ where: { id: e.id } })).responseClockPausedAt
    ).toBeNull()
    expect(
      (await opsDb.enquiryLine.findFirstOrThrow({ where: { enquiryId: e.id, no: 6 } })).status
    ).toBe('open')
  })
})
