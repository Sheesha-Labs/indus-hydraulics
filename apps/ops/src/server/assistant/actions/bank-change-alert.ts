import 'server-only'
import {
  bankChangeRisk,
  detectBankChangeRequest,
  domainOf,
  ibanLast4,
  lookalikeDomain,
  type BankChangeDetection,
} from '@indus/ops-core'
import { opsDb, type Prisma } from '@indus/ops-db'
import { sealIban, ibanHash } from '../../directory/iban-seal'
import { matchCompanyBySender } from '../../directory/match-company'
import { NETWORK_PROBES } from '../../enquiry/qualify'
import { registerAction } from '../registry'
import type { ActionDefinition, ProposalDraft } from '../types'
import { writeTracked } from '../write-tracked'

/**
 * `bank_change_alert` (S10-T07, board 132; C21, architecture §4.11). An email from a supplier that asks to change
 * bank details: payments are blocked at once (a pending account), a locked notification goes to the Owner and the
 * Helper (it cannot be muted), and the supplier shows the red banner. Internal and immediate at every level (locked
 * Do and tell); nothing external. The Assistant never verifies, never changes the account on file and never moves
 * money: only the Owner's call-back to the number on file can. One alert per message.
 */
export interface AlertInput {
  messageId: string
  supplierId: string | null
  supplierName: string | null
  fromAddress: string
  sentAt: string
  text: string
  knownLast4: string[]
  knownDomains: string[]
  firstEmailFromAddress: boolean
}
export interface AlertOut {
  detection: BankChangeDetection
  risk: 'high' | 'medium'
  domainRegisteredYear: number | null
}

const definition: ActionDefinition<AlertInput, AlertOut> = {
  key: 'bank_change_alert',
  group: 'money',
  aiPurpose: 'other',
  external: false,
  concurrencyGroup: 'directory',
  surface: 'review',

  estimate: () => ({ chars: 0, maxTokens: 0 }),

  async gather({ request }) {
    const m = await opsDb.mailMessage.findUniqueOrThrow({
      where: { id: request.subjectId },
      select: { id: true, fromAddress: true, bodyText: true, sentAt: true },
    })
    const match = (await matchCompanyBySender(m.fromAddress)).match
    const supplierId = match?.isSupplier ? match.companyId : null
    const [accounts, company, earlier] = await Promise.all([
      supplierId
        ? opsDb.supplierBankAccount.findMany({
            where: { supplierId, supersededAt: null },
            select: { ibanLast4: true },
          })
        : Promise.resolve([]),
      supplierId
        ? opsDb.company.findUnique({
            where: { id: supplierId },
            select: { domains: true, primaryDomain: true },
          })
        : Promise.resolve(null),
      opsDb.mailMessage.count({
        where: {
          fromAddress: { equals: m.fromAddress, mode: 'insensitive' },
          sentAt: { lt: m.sentAt },
        },
      }),
    ])
    return {
      input: {
        messageId: m.id,
        supplierId,
        supplierName: match?.name ?? null,
        fromAddress: m.fromAddress.toLowerCase(),
        sentAt: m.sentAt.toISOString(),
        text: (m.bodyText ?? '').slice(0, 20_000),
        knownLast4: accounts.map((a) => a.ibanLast4),
        knownDomains: [
          ...new Set([
            ...(company?.domains ?? []),
            ...(company?.primaryDomain ? [company.primaryDomain] : []),
          ]),
        ],
        firstEmailFromAddress: earlier === 0,
      },
      versions: { message: m.id },
    }
  },

  async propose(input) {
    const domain = domainOf(input.fromAddress)
    const lookalike = !!domain && input.knownDomains.some((k) => lookalikeDomain(domain, k))
    const rdap = domain ? await NETWORK_PROBES.rdap(domain).catch(() => null) : null
    const detection = detectBankChangeRequest({
      text: input.text,
      knownIbanLast4: input.knownLast4,
      lookalikeDomain: lookalike,
      firstEmailFromAddress: input.firstEmailFromAddress,
      domainAgeDays: rdap?.ageDays ?? null,
    })
    return {
      ok: true,
      out: { detection, risk: bankChangeRisk(detection), domainRegisteredYear: rdap?.year ?? null },
      costUsd: '0.000000',
      model: null,
      promptVersion: null,
      callIds: [],
    }
  },

  async verify(out, input) {
    const ok = out.detection.isRequest && !!input.supplierId
    return {
      out,
      checks: [
        {
          label: 'A request to change bank details',
          status: out.detection.isRequest ? 'pass' : 'fail',
        },
        { label: 'From a supplier we know', status: input.supplierId ? 'pass' : 'warn' },
      ],
      confidence: ok ? 'sure' : 'unsure',
      ...(ok
        ? {}
        : {
            unsure: [
              {
                field: 'bank_change',
                why: input.supplierId
                  ? 'No change request found'
                  : 'The sender is not a known supplier',
              },
            ],
          }),
    }
  },

  toProposal(v, input): ProposalDraft {
    const f = v.out.detection.flags
    return {
      headline: `Bank change requested${input.supplierName ? ` · payments to ${input.supplierName} blocked` : ''}`,
      reasons: [
        ...(f.lookalikeDomain
          ? [
              {
                text: `Sent from ${domainOf(input.fromAddress)}, which looks like the supplier's domain but is not`,
              },
            ]
          : []),
        ...(f.firstEmailFromAddress ? [{ text: 'First email from this address' }] : []),
        ...(f.urgency ? [{ text: 'Asks for payment now' }] : []),
        ...(f.domainAgeDays !== null && f.domainAgeDays < 90
          ? [{ text: `Domain registered ${f.domainAgeDays} days ago` }]
          : []),
        { text: `Risk: ${v.out.risk}` },
      ],
      preview: {
        from: input.fromAddress,
        ibansLast4: v.out.detection.ibans.map((b) => b.slice(-4)),
      },
      checks: v.checks,
      confidence: v.confidence,
      onApproveText:
        'Payments stay blocked until Krishan records a call-back to the number on file',
    }
  },

  async effect(tx, v, ctx) {
    const input = (
      await tx.assistantAction.findUniqueOrThrow({
        where: { id: ctx.actionId },
        select: { inputs: true },
      })
    ).inputs as unknown as {
      input: AlertInput
    }
    const i = input.input
    if (!v.out.detection.isRequest || !i.supplierId)
      return { note: 'Not a bank-change request from a known supplier' }
    const already = await tx.supplierBankAccount.findFirst({
      where: { requestedViaMessageId: i.messageId },
      select: { id: true },
    })
    if (already) return { note: 'Already recorded for this message' }
    const iban = v.out.detection.ibans.find((b) => !i.knownLast4.includes(ibanLast4(b))) ?? null
    const riskFlags = {
      ...v.out.detection.flags,
      risk: v.out.risk,
      domain: domainOf(i.fromAddress),
      domainRegisteredYear: v.out.domainRegisteredYear,
      ibanMissing: !iban,
    } as unknown as Prisma.InputJsonValue
    const account = await writeTracked(
      tx,
      {
        actor: { kind: 'assistant' },
        actionId: ctx.actionId,
        subjectType: 'company',
        subjectId: i.supplierId,
        changes: [
          {
            field: 'bankAccount',
            before: null,
            after: {
              status: 'pending_verification',
              last4: iban ? ibanLast4(iban) : null,
              risk: v.out.risk,
            },
            kind: 'money',
            sensitive: true,
          },
        ],
        note: 'Bank change requested by email: payments blocked until a call-back',
      },
      (t) =>
        t.supplierBankAccount.create({
          data: {
            supplierId: i.supplierId!,
            bankName: 'Requested by email',
            accountName: i.supplierName ?? 'Unknown',
            ibanEnc: sealIban(iban ?? 'XX00UNKNOWN0000000', i.supplierId!),
            ibanLast4: iban ? ibanLast4(iban) : '----',
            ...(iban ? { ibanHash: ibanHash(iban) } : {}),
            status: 'pending_verification',
            requestedViaMessageId: i.messageId,
            requestedAt: new Date(i.sentAt),
            riskFlags,
          },
          select: { id: true },
        })
    )
    // The locked notification (it cannot be muted), written in this transaction: never a second connection here.
    const users = await tx.user.findMany({ where: { status: 'active' }, select: { id: true } })
    await writeTracked(
      tx,
      {
        actor: { kind: 'assistant' },
        actionId: ctx.actionId,
        subjectType: 'company',
        subjectId: i.supplierId,
        changes: [
          {
            field: 'bankChangeNotice',
            before: null,
            after: { users: users.length },
            kind: 'money',
          },
        ],
      },
      (t) =>
        t.notification.createMany({
          data: users.map((u) => ({
            userId: u.id,
            event: 'bank_detail_change' as const,
            severity: 'critical' as const,
            title: `Bank change requested · payments to ${i.supplierName} blocked`,
            body: 'Call the number on file, not any number in the email. Only Krishan can record the call-back.',
            dedupeKey: `bank-change:${account.id}`,
            actionUrl: `/suppliers/${i.supplierId}/bank-change/${account.id}`,
            subjectType: 'company' as const,
            subjectId: i.supplierId,
            channels: ['in_app' as const],
          })),
          skipDuplicates: true,
        })
    )
    // The message waits on the Owner: "needs you" in Mail, and the Needs Krishan label in Gmail (after commit).
    const m = await tx.mailMessage.findUnique({
      where: { id: i.messageId },
      select: { handledState: true },
    })
    if (m && m.handledState !== 'needs_you')
      await writeTracked(
        tx,
        {
          actor: { kind: 'assistant' },
          actionId: ctx.actionId,
          subjectType: 'mail_message',
          subjectId: i.messageId,
          changes: [
            { field: 'handledState', before: m.handledState, after: 'needs_you', kind: 'status' },
          ],
          note: 'Bank change requested: waits for the call-back',
        },
        (t) =>
          t.mailMessage.update({ where: { id: i.messageId }, data: { handledState: 'needs_you' } })
      )
    return {
      note: `Payments to ${i.supplierName} blocked`,
      undoable: false,
      emit: [{ name: 'ops/review.changed', data: { messageId: i.messageId } }],
    }
  },
}

registerAction(definition)
export default definition
