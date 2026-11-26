import { planQuestionClock } from '@indus/ops-core'
import type { PrismaClient } from '@indus/ops-db'

/**
 * Test and parity seed for board 171 (S09-T07): an enquiry in Sourcing with twelve lines, three held for the
 * client's answers (#4 trim, #10 seal scope, #12 process connection), one quoted on its stated assumption (#8),
 * nine with suppliers, the questions sent two days ago with their clock planned, and the day-2 reminder card in
 * Review. `answers` adds the client's reply and the "Answers to 2 of 3" card. Neutral names; local databases only.
 */
const LINES: ReadonlyArray<readonly [string, number]> = [
  ['Gate valve 6in CL300, WCB, flanged RF', 8],
  ['Gate valve 2in CL800, A105, socket weld', 24],
  ['Ball valve 4in CL150, floating, SS316', 12],
  ['Globe valve 3in CL600, WCB, flanged RF', 6],
  ['Pneumatic actuator, double-acting, 4in', 12],
  ['Deep groove ball bearing 6316, C3', 40],
  ['Spherical roller bearing 22218 E', 16],
  ['Pressure transmitter 0–100 bar, HART', 10],
  ['Temperature transmitter, RTD PT100', 14],
  ['Cartridge mechanical seal 55 mm, API 682 Plan 53A', 6],
  ['Spiral wound gasket 6in CL300', 120],
  ['Magnetic level gauge 1200 mm C-C, SS316', 4],
]

const QUESTIONS: ReadonlyArray<readonly [number, string, string]> = [
  [
    4,
    'Trim material: 13Cr or Stellite 6 faced? The enquiry says “as per existing”.',
    'Supplied with 13Cr trim.',
  ],
  [
    10,
    'Is the Plan 53A barrier fluid system in scope, or the seal only?',
    'Seal only; barrier system not included.',
  ],
  [12, 'Process connection: flange size and rating?', '2 in CL300 RF flanges.'],
]

export interface QuestionsSeed {
  enquiryId: string
  ref: string
  threadId: string
  questionIds: Record<number, string>
  reminderRef: string
  answersRef: string | null
}

export async function seedQuestions(
  db: PrismaClient,
  opts: {
    tag: string
    ref: string
    rfqPrefix: string
    salesMailboxId: string
    salesAddress: string
    answers?: boolean
  }
): Promise<QuestionsSeed> {
  const now = Date.now()
  const client = await db.company.create({
    data: { name: 'Sample Petrochem Services', isClient: true },
  })
  const contact = await db.contact.create({
    data: {
      companyId: client.id,
      name: 'Sample Buyer',
      firstName: 'Sample',
      email: `buyer.${opts.tag}@sample-petrochem.example.test`,
      phone: '+971 00 000 0187',
    },
  })
  const supplier = await db.company.create({
    data: { name: `Example Valve Co ${opts.tag}`, isSupplier: true },
  })
  const thread = await db.mailThread.create({
    data: {
      mailboxId: opts.salesMailboxId,
      gmailThreadId: `t-${opts.tag}`,
      subject: 'RFQ GPS/MM/25-1187 turnaround spares',
    },
  })
  const received = new Date(now - 4 * 86_400_000)
  const message = await db.mailMessage.create({
    data: {
      mailboxId: opts.salesMailboxId,
      threadId: thread.id,
      gmailMessageId: `g-${opts.tag}`,
      rfcMessageId: `${opts.tag}@client.example.test`,
      direction: 'inbound',
      fromAddress: contact.email!,
      fromName: 'Sample Buyer',
      toAddresses: [opts.salesAddress],
      ccAddresses: [],
      subject: 'RFQ GPS/MM/25-1187 turnaround spares',
      bodyText: 'Please quote the twelve items listed.',
      bodyTextHash: `${opts.tag}-h`,
      sentAt: received,
      labelsApplied: [],
      origin: 'live',
      classification: 'client_enquiry',
    },
  })
  const held = new Set(QUESTIONS.map(([n]) => n))
  const e = await db.enquiry.create({
    data: {
      ref: opts.ref,
      title: 'Turnaround spares — valves, bearings and instruments',
      clientId: client.id,
      contactId: contact.id,
      clientRef: 'GPS/MM/25-1187',
      receivedVia: 'email',
      receivedAt: received,
      deadline: new Date(now + 14 * 86_400_000),
      revertBy: new Date(now + 9 * 86_400_000),
      stage: 'sourcing',
      chosenPath: 'ask_client_first',
      pathChosenAt: new Date(now - 3 * 86_400_000),
      responseClockPausedAt: new Date(now - 2 * 86_400_000),
      lines: {
        create: LINES.map(([d, qty], i) => ({
          no: i + 1,
          description: d,
          qty,
          uom: 'EA',
          status: held.has(i + 1) ? ('held' as const) : ('sourcing' as const),
          ...(held.has(i + 1) ? { heldReason: 'Waiting on the client: see Questions' } : {}),
        })),
      },
    },
    select: { id: true, lines: { orderBy: { no: 'asc' }, select: { id: true, no: true } } },
  })
  await db.mailThread.update({ where: { id: thread.id }, data: { enquiryId: e.id } })
  await db.intakeBatch.create({
    data: { source: 'mail', mailMessageId: message.id, status: 'confirmed', enquiryId: e.id },
  })
  const lineId = (n: number) => e.lines.find((l) => l.no === n)!.id
  // The nine lines with suppliers.
  await db.supplierRfq.create({
    data: {
      ref: `IH-RFQ-${opts.rfqPrefix}-P07`,
      enquiryId: e.id,
      status: 'sent',
      lines: {
        create: e.lines
          .filter((l) => !held.has(l.no) && l.no !== 8)
          .map((l, p) => ({ lineId: l.id, position: p + 1, qtyAsked: LINES[l.no - 1]![1] })),
      },
      recipients: {
        create: [
          { supplierId: supplier.id, status: 'sent', sentAt: new Date(now - 26 * 3_600_000) },
        ],
      },
    },
  })
  const sentAt = new Date(now - 2 * 86_400_000)
  const clock = planQuestionClock({
    sentAt,
    revertBy: new Date(now + 9 * 86_400_000),
    calendar: { holidays: [], weekends: { default: [6, 0], byCountry: {} } },
  })
  const questionIds: Record<number, string> = {}
  for (const [n, question, assumption] of QUESTIONS) {
    const q = await db.clientQuestion.create({
      data: {
        enquiryId: e.id,
        lineId: lineId(n),
        question,
        fallbackAssumption: assumption,
        status: 'sent',
        sentAt,
        reminderDueAt: clock.reminderDueAt,
        callTaskAt: clock.callTaskAt,
        fallbackAt: clock.fallbackAt,
      },
    })
    questionIds[n] = q.id
  }
  // Line 8: not asked; quoted on its stated assumption.
  await db.clientQuestion.create({
    data: {
      enquiryId: e.id,
      lineId: lineId(8),
      question: 'Display: local LCD or blind?',
      fallbackAssumption: 'Supplied with local LCD display.',
      status: 'proceeded_on_assumption',
      fallbackChoice: 'assume',
    },
  })
  await db.enquiryAssumption.create({
    data: {
      enquiryId: e.id,
      lineId: lineId(8),
      text: 'Supplied with local LCD display.',
      printOnQuotation: true,
    },
  })

  const reminderRef = `A-${opts.tag.slice(-10).toUpperCase()}-M`
  const reminderBody =
    'Dear Sample,\n\nA short reminder of our 3 open questions on GPS/MM/25-1187, listed below. If we have not heard by 17 September, we will quote these lines on the assumptions stated in the quotation.\n\n' +
    QUESTIONS.map(([n, q]) => `Line ${n} · ${LINES[n - 1]![0]}\n${q}`).join('\n\n')
  await db.assistantAction.create({
    data: {
      ref: reminderRef,
      actionKey: 'remind_client_questions',
      levelAtTime: 'draft_and_ask',
      guardrails: [],
      subjectType: 'enquiry',
      subjectId: e.id,
      enquiryId: e.id,
      headline: 'Remind Sample Buyer of the 3 open questions, in their thread.',
      reasons: [
        { text: '2 days without a reply; no out-of-office.' },
        { text: 'Sample Buyer usually answers within a day (last 3 replies).' },
        { text: 'Held lines must reach suppliers by 18 Sep.' },
      ],
      preview: {
        mailbox: opts.salesAddress,
        to: [contact.email],
        subject: 'Re: RFQ GPS/MM/25-1187 turnaround spares',
        text: reminderBody,
      },
      checks: [
        { label: 'No supplier names, prices or margins in the email', status: 'pass' },
        { label: 'In the client’s thread from sales@', status: 'pass', detail: opts.salesAddress },
      ],
      confidence: 'sure',
      onApproveText: `Sends from ${opts.salesAddress} in 5 minutes; if there is still no answer, a call goes on Today tomorrow.`,
      output: {
        subject: 'Re: RFQ GPS/MM/25-1187 turnaround spares',
        body: reminderBody,
        missing: [],
        identity: [],
        money: [],
      },
      state: 'proposed',
      surface: 'review',
      idempotencyKey: `remind_client_questions:enquiry:${e.id}:remind@${sentAt.getTime()}`,
      inputs: {
        request: {
          actionKey: 'remind_client_questions',
          subjectType: 'enquiry',
          subjectId: e.id,
          enquiryId: e.id,
          trigger: 'clock.questions.reminder',
          origin: 'live',
          sourceVersion: `remind@${sentAt.getTime()}`,
        },
      },
    } as never,
  })

  let answersRef: string | null = null
  if (opts.answers) {
    const replyText =
      'Dear Sir,\nLine 4: Stellite 6 faced trim please.\nLine 10: seal only, and we now need 8 pcs.\nWe will confirm line 12 tomorrow.\nRegards'
    const reply = await db.mailMessage.create({
      data: {
        mailboxId: opts.salesMailboxId,
        threadId: thread.id,
        gmailMessageId: `g-${opts.tag}-r`,
        rfcMessageId: `${opts.tag}-r@client.example.test`,
        direction: 'inbound',
        fromAddress: contact.email!,
        fromName: 'Sample Buyer',
        toAddresses: [opts.salesAddress],
        ccAddresses: [],
        subject: 'Re: RFQ GPS/MM/25-1187 turnaround spares',
        bodyText: replyText,
        bodyTextHash: `${opts.tag}-rh`,
        sentAt: new Date(now - 3_600_000),
        labelsApplied: [],
        origin: 'live',
        classification: 'client_reply',
      },
    })
    answersRef = `A-${opts.tag.slice(-10).toUpperCase()}-A`
    const answers = [
      {
        id: questionIds[4]!,
        answered: true,
        answerQuote: 'Stellite 6 faced trim please',
        implies: { spec: 'Stellite 6 faced trim' },
        resolved: true,
        spanId: null,
      },
      {
        id: questionIds[10]!,
        answered: true,
        answerQuote: 'seal only, and we now need 8 pcs',
        implies: { qty: '8', spec: 'seal only' },
        resolved: true,
        spanId: null,
      },
      { id: questionIds[12]!, answered: false, answerQuote: '', resolved: false, spanId: null },
    ]
    await db.assistantAction.create({
      data: {
        ref: answersRef,
        actionKey: 'match_client_answers',
        levelAtTime: 'draft_and_ask',
        guardrails: [],
        subjectType: 'mail_message',
        subjectId: reply.id,
        enquiryId: e.id,
        headline: `Answers to 2 of 3 questions on ${opts.ref}.`,
        reasons: [
          { text: 'Line 4: “Stellite 6 faced trim please” → Stellite 6 faced trim' },
          { text: 'Line 10: “seal only, and we now need 8 pcs” → quantity 8; seal only' },
        ],
        preview: { answers: answers.map((a) => ({ answered: a.answered, quote: a.answerQuote })) },
        checks: [
          { label: 'Every answer found in the reply', status: 'pass' },
          { label: 'Numbers read from the client’s words', status: 'pass' },
        ],
        confidence: 'likely',
        onApproveText:
          'Marks 2 answered and opens their lines for sourcing, applying what the answers change; the rest keep their clock.',
        output: { answers },
        state: 'proposed',
        surface: 'review',
        idempotencyKey: `match_client_answers:mail_message:${reply.id}:${opts.tag}`,
        inputs: {
          request: {
            actionKey: 'match_client_answers',
            subjectType: 'mail_message',
            subjectId: reply.id,
            enquiryId: e.id,
            trigger: 'mail.classified',
            origin: 'live',
            sourceVersion: `${opts.tag}-rh`,
          },
        },
      } as never,
    })
  }
  return {
    enquiryId: e.id,
    ref: opts.ref,
    threadId: thread.id,
    questionIds,
    reminderRef,
    answersRef,
  }
}
