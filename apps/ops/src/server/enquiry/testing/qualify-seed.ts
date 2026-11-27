import {
  effortSignals,
  fitCounts,
  fitSignals,
  legitimacyFromSignals,
  legitimacySignals,
  qualifyVerdict,
  type ModelRead,
  type QualifyInput,
} from '@indus/ops-core'
import type { Prisma, PrismaClient } from '@indus/ops-db'

/**
 * Test and parity seed for boards 167, 168 and 171b (S09-T06). One new enquiry from sales@ with the board's fourteen
 * lines (nine hose assemblies, two seal kits, two OEM-only parts, a gearbox outside the range) and a quick read stored
 * exactly as the qualify_enquiry action stores it: the signals and the verdict come from the ops-core rules, the
 * model's read is a fixed fixture. Variants: 'legit' (board 167), 'suspicious' (171b state 2), 'spam' (state 3),
 * 'reading' (state 1, no read yet). `regretCard` adds the board-168 regret card to Review. Local databases only.
 * Neutral names only; no country anywhere.
 */
export type QualifySeedVariant = 'legit' | 'suspicious' | 'spam' | 'reading'

const LINES: ReadonlyArray<readonly [string | null, string, number, boolean]> = [
  ...Array.from(
    { length: 9 },
    (_, i) =>
      [
        'Hose assemblies',
        `Hydraulic hose assembly 1/2in 2SN, ${600 + i * 100} mm`,
        4 + i * 3,
        false,
      ] as const
  ),
  ['Cylinder seal kits', 'Boom cylinder seal kit, 110 bore', 2, false],
  ['Cylinder seal kits', 'Arm cylinder seal kit, 95 bore', 2, false],
  ['OEM hydraulics', 'Main pump regulator, OEM part only', 2, true],
  ['OEM hydraulics', 'Swing motor relief valve, OEM part only', 2, true],
  [null, 'Final drive gearbox assembly', 1, false],
]

const MODEL: Record<Exclude<QualifySeedVariant, 'reading'>, ModelRead & { reasons: string[] }> = {
  legit: {
    legitimacy: { verdict: 'legitimate', confidence: 'sure' },
    fit: { confidence: 'likely' },
    suggestedPath: 'quote_partial',
    pathConfidence: 'likely',
    regretLineNos: [14],
    askLineNos: [],
    reasons: [
      'Thirteen lines are in categories sourced before',
      'Line 14 has never been quoted and no supplier is on file',
    ],
  },
  suspicious: {
    legitimacy: { verdict: 'suspicious', confidence: 'likely' },
    fit: { confidence: 'likely' },
    suggestedPath: 'ask_client_first',
    pathConfidence: 'unsure',
    regretLineNos: [],
    askLineNos: [],
    reasons: ['The domain is three weeks old with no website or registry entry'],
  },
  spam: {
    legitimacy: { verdict: 'spam', confidence: 'sure' },
    fit: { confidence: 'unsure' },
    suggestedPath: 'ignore_spam',
    pathConfidence: 'sure',
    regretLineNos: [],
    askLineNos: [],
    reasons: ['The email asks to sign in to view the documents'],
  },
}

export interface QualifySeed {
  enquiryId: string
  ref: string
  messageId: string
  clientId: string
  supplierId: string
  regretActionId: string | null
}

export async function seedQualify(
  db: PrismaClient,
  opts: {
    tag: string
    ref: string
    variant: QualifySeedVariant
    salesMailboxId: string
    salesAddress: string
    /** Board 168: also put the regret card (whole enquiry) in Review. */
    regretCard?: boolean
    rfqRef?: string
  }
): Promise<QualifySeed> {
  const now = Date.now()
  const spam = opts.variant === 'spam'
  const domain = `sample-mining-${opts.tag}.example.test`
  const from = spam ? `procurement.${opts.tag}@webmail.example` : `buyer@${domain}`
  const client = await db.company.create({
    data: {
      name: 'Sample Mining Services',
      isClient: true,
      primaryDomain: domain,
      trn: '000000000000000',
    },
  })
  const contact = await db.contact.create({
    data: { companyId: client.id, name: 'Sample Buyer', firstName: 'Sample', email: from },
  })
  const supplier = await db.company.create({
    data: {
      name: `Example Gearbox Co ${opts.tag}`,
      isSupplier: true,
      primaryDomain: `example-gearbox-${opts.tag}.example.test`,
    },
  })
  const thread = await db.mailThread.create({
    data: {
      mailboxId: opts.salesMailboxId,
      gmailThreadId: `t-${opts.tag}`,
      subject: 'RFQ SMS/PR/2609-77 hydraulic spares',
    },
  })
  const received = new Date(now - 2 * 60_000)
  const message = await db.mailMessage.create({
    data: {
      mailboxId: opts.salesMailboxId,
      threadId: thread.id,
      gmailMessageId: `g-${opts.tag}`,
      rfcMessageId: `${opts.tag}@client.example.test`,
      direction: 'inbound',
      fromAddress: from,
      fromName: 'Sample Buyer',
      toAddresses: [opts.salesAddress],
      ccAddresses: [],
      subject: 'RFQ SMS/PR/2609-77 hydraulic spares',
      bodyText: spam
        ? 'RFQ documents: view to quote at https://docs-share.example/view?id=7 (sign in required).'
        : 'Dear Sir, please quote the attached list of 14 items. Closing date Monday 12:00.',
      bodyTextHash: `${opts.tag}-h`,
      sentAt: received,
      labelsApplied: [],
      origin: 'live',
      classification: 'client_enquiry',
    },
  })
  const e = await db.enquiry.create({
    data: {
      ref: opts.ref,
      title: 'Hydraulic hoses, fittings and excavator spares',
      clientId: client.id,
      contactId: contact.id,
      clientRef: 'SMS/PR/2609-77',
      receivedVia: 'email',
      receivedAt: received,
      deadline: new Date(now + 3 * 86_400_000),
      stage: opts.variant === 'reading' ? 'new' : 'qualifying',
      lines: {
        create: LINES.map(([, d, qty], i) => ({
          no: i + 1,
          description: d,
          qty,
          uom: 'EA',
          ...(LINES[i]![3] ? { specNotes: 'OEM part number only' } : {}),
        })),
      },
    },
    select: { id: true, version: true },
  })
  await db.mailThread.update({ where: { id: thread.id }, data: { enquiryId: e.id } })
  await db.intakeBatch.create({
    data: { source: 'mail', mailMessageId: message.id, status: 'confirmed', enquiryId: e.id },
  })

  if (opts.variant !== 'reading') {
    const input: QualifyInput = {
      sender: spam
        ? {
            email: from,
            domain: 'webmail.example',
            freeMail: true,
            domainAgeDays: null,
            domainRegisteredYear: null,
            domainMatchesName: null,
            websiteReachable: null,
            registryFound: null,
            companyName: 'Sample Mining Services',
          }
        : opts.variant === 'suspicious'
          ? {
              email: from,
              domain,
              freeMail: false,
              domainAgeDays: 21,
              domainRegisteredYear: 2026,
              domainMatchesName: false,
              websiteReachable: false,
              registryFound: false,
              companyName: 'Sample Mining Services',
            }
          : {
              email: from,
              domain,
              freeMail: false,
              domainAgeDays: 4000,
              domainRegisteredYear: 2015,
              domainMatchesName: true,
              websiteReachable: true,
              registryFound: true,
              companyName: 'Sample Mining Services',
            },
      links: spam ? { suspicious: 2, hosts: ['docs-share.example'] } : { suspicious: 0, hosts: [] },
      history: { messages: 0, enquiries: 0, quotations: 0, orders: 0 },
      lines: LINES.map(([trade, , qty, prop], i) => ({
        no: i + 1,
        trade,
        tradeSourced: !!trade,
        proprietary: prop,
        qty,
        uom: 'EA',
      })),
      value: { currency: 'AED', min: 66000, max: 88000, lines: 11 },
      workingDaysLeft: 2,
      deadlineLabel: 'Mon 28 Sep, 12:00',
      supplierReplyDays: 2,
    }
    const signals = {
      legitimacy: legitimacySignals(input),
      fit: fitSignals(input),
      effort: effortSignals(input),
    }
    const m = MODEL[opts.variant]
    const fit = fitCounts(input)
    const v = qualifyVerdict({
      legitimacySignals: signals.legitimacy,
      fitSignals: signals.fit,
      codeLegitimacy: legitimacyFromSignals(signals.legitimacy),
      fit,
      lineNos: input.lines.map((l) => l.no),
      model: m,
    })
    const action = await db.assistantAction.create({
      data: {
        ref: `A-${opts.tag.slice(-10).toUpperCase()}-Q`,
        actionKey: 'qualify_enquiry',
        levelAtTime: 'suggest',
        guardrails: [],
        subjectType: 'enquiry',
        subjectId: e.id,
        enquiryId: e.id,
        headline: `${opts.ref}: quick read`,
        reasons: m.reasons.map((text) => ({ text })),
        checks: [{ label: 'No country, region or address read', status: 'pass' }],
        confidence: v.pathConfidence,
        state: 'proposed',
        surface: 'hint',
        idempotencyKey: `qualify_enquiry:enquiry:${e.id}:${opts.ref}`,
      } as never,
      select: { id: true },
    })
    await db.enquiry.update({
      where: { id: e.id },
      data: {
        legitimacy: v.legitimacyConfidence,
        suggestedPath: v.suggestedPath,
        legitimacyNotes: {
          verdict: v.legitimacy,
          confidence: v.legitimacyConfidence,
          signals: signals.legitimacy,
        } as unknown as Prisma.InputJsonValue,
        fitNotes: {
          fit: fit.fit,
          of: fit.of,
          confidence: v.fitConfidence,
          signals: signals.fit,
          regretLineNos: v.regretLineNos,
          askLineNos: v.askLineNos,
          proprietaryNos: input.lines.filter((l) => l.proprietary).map((l) => l.no),
          outsideNos: input.lines.filter((l) => !l.trade || !l.tradeSourced).map((l) => l.no),
        } as unknown as Prisma.InputJsonValue,
        effortNotes: {
          signals: signals.effort,
          reasons: m.reasons,
          pathConfidence: v.pathConfidence,
          realBuyerQuestion: v.realBuyerQuestion,
          actionId: action.id,
          readAt: new Date(now).toISOString(),
        } as unknown as Prisma.InputJsonValue,
      },
    })
  }

  let regretActionId: string | null = null
  if (opts.regretCard) {
    // The supplier the gearbox went to, so the reverse identifier check has a name to look for.
    if (opts.rfqRef) {
      const line = await db.enquiryLine.findFirstOrThrow({ where: { enquiryId: e.id, no: 14 } })
      await db.supplierRfq.create({
        data: {
          ref: opts.rfqRef,
          enquiryId: e.id,
          status: 'sent',
          lines: { create: [{ lineId: line.id, position: 1, qtyAsked: 1 }] },
          recipients: {
            create: [
              { supplierId: supplier.id, status: 'regretted', sentAt: new Date(now - 86_400_000) },
            ],
          },
        },
      })
    }
    const body =
      'Dear Sample,\n\nThank you for your enquiry SMS/PR/2609-77 for hydraulic hoses, fittings and excavator spares, and for considering us.\n\nWe have reviewed it carefully, and on this occasion we are unable to offer the items requested.'
    const glad =
      'We would be glad to quote on hose assemblies, cylinder seal kits and valves, and look forward to your next enquiry.'
    const quoted =
      '\n\nOn 24 Sep, Sample Buyer wrote: Dear Sir, please quote the attached list of 14 items…'
    const version = `whole@${now}`
    const a = await db.assistantAction.create({
      data: {
        ref: `A-${opts.tag.slice(-10).toUpperCase()}-R`,
        actionKey: 'regret_client',
        levelAtTime: 'draft_and_ask',
        guardrails: [],
        subjectType: 'enquiry',
        subjectId: e.id,
        enquiryId: e.id,
        headline: `Send a regret to Sample Mining Services and close ${opts.ref} as Regretted.`,
        reasons: [
          { text: `Example Gearbox Co ${opts.tag} has declined.` },
          { text: 'Line 14: never quoted, no supplier on file.' },
        ],
        preview: {
          mailbox: opts.salesAddress,
          to: [from],
          subject: 'Re: RFQ SMS/PR/2609-77 hydraulic spares',
          text: `${body}\n\n${glad}${quoted}`,
          reasonChips: {
            label: 'Reason',
            options: [
              { value: 'no_source_found', label: 'No source found' },
              { value: 'deadline_too_short', label: 'Deadline too short' },
              { value: 'not_our_range', label: 'Not our range' },
              { value: 'client_unresponsive', label: 'Client unresponsive' },
              { value: 'other', label: 'Other' },
            ],
            value: 'not_our_range',
          },
          toggle: {
            name: 'glad_line',
            label:
              'Include the “glad to quote on” line · categories from the last 12 months of quotations',
            defaultOn: true,
            textOff: `${body}${quoted}`,
          },
        },
        checks: [
          { label: 'No supplier names, prices or margins in the email', status: 'pass' },
          {
            label: 'In the client’s thread, with the signature',
            status: 'pass',
            detail: opts.salesAddress,
          },
          { label: 'Client deadline 28 Sep; sent 3 days early', status: 'pass' },
        ],
        confidence: 'sure',
        onApproveText: `Sends from ${opts.salesAddress} in 5 minutes. ${opts.ref} moves to Regretted with the reason once it has left.`,
        output: {
          subject: 'Re: RFQ SMS/PR/2609-77 hydraulic spares',
          body: `${body}\n\n${glad}`,
          bodyNoGlad: body,
          missing: [],
          identity: [],
          money: [],
        },
        state: 'proposed',
        surface: 'review',
        idempotencyKey: `regret_client:enquiry:${e.id}:${version}`,
        inputs: {
          request: {
            actionKey: 'regret_client',
            subjectType: 'enquiry',
            subjectId: e.id,
            enquiryId: e.id,
            trigger: 'enquiry.path.chosen',
            origin: 'live',
            sourceVersion: version,
          },
        },
      } as never,
      select: { id: true },
    })
    regretActionId = a.id
  }
  return {
    enquiryId: e.id,
    ref: opts.ref,
    messageId: message.id,
    clientId: client.id,
    supplierId: supplier.id,
    regretActionId,
  }
}
