import type { ActivityEventDraft, TransitionCheck } from './enquiry'
import { TransitionRefused } from './enquiry'
import { DOCUMENT_STATUS_WORD, type DocumentStatus } from './labels'

/**
 * The document machine (S11-T04, 06-map-schema §9.8).
 *
 * Produced documents:
 *   (create) → draft                      generated from data
 *   draft → approved                      approved with its parent record (the number is allocated then)
 *   approved → sent                       left in an email (the version is marked)
 *   draft → void                          discarded before issue (the number is released)
 *   approved | sent → superseded          reissued with a reason: a new row points at it (supersedesId)
 *   approved | sent → cancelled           cancelled without a replacement
 * Received documents:
 *   received → superseded                 a newer copy arrived
 *   received → void                       misfiled
 *
 * A tax invoice that has been sent never leaves `sent` (not cancelled, superseded or voided): it is corrected
 * by a credit note and a new invoice (C30 / §4.4). The database trigger repeats the rule.
 */
export type DocumentStatusValue = DocumentStatus

export interface DocumentTransitionContext {
  /** The record kind (Prisma DocumentKind): only `tax_invoice` changes the rules. */
  kind: string
  /** A reissue (→ superseded) needs the reason. */
  reissueReason?: string | null
}

type Guard = (c: DocumentTransitionContext, from: DocumentStatusValue) => string | null

const sentTaxInvoice: Guard = (c, from) =>
  c.kind === 'tax_invoice' && from === 'sent'
    ? 'A sent tax invoice stays as issued: issue a credit note instead'
    : null

export const DOCUMENT_RULES: ReadonlyArray<{
  from: readonly DocumentStatusValue[]
  to: DocumentStatusValue
  guard?: Guard
}> = [
  { from: ['draft'], to: 'approved' },
  { from: ['approved'], to: 'sent' },
  { from: ['draft'], to: 'void' },
  {
    from: ['approved', 'sent'],
    to: 'superseded',
    guard: (c, from) =>
      sentTaxInvoice(c, from) ?? (c.reissueReason ? null : 'Say why it is reissued'),
  },
  { from: ['approved', 'sent'], to: 'cancelled', guard: sentTaxInvoice },
  { from: ['received'], to: 'superseded' },
  { from: ['received'], to: 'void' },
]

const BY_EDGE = new Map<string, Guard | undefined>()
for (const r of DOCUMENT_RULES) for (const f of r.from) BY_EDGE.set(`${f}>${r.to}`, r.guard)

export function documentEdges(): ReadonlyArray<
  readonly [DocumentStatusValue, DocumentStatusValue]
> {
  return [...BY_EDGE.keys()].map((k) => k.split('>') as [DocumentStatusValue, DocumentStatusValue])
}

/** Statuses a document never leaves. */
export const DOCUMENT_FINAL: readonly DocumentStatusValue[] = ['superseded', 'cancelled', 'void']

export function canTransitionDocument(
  from: DocumentStatusValue,
  to: DocumentStatusValue,
  ctx: DocumentTransitionContext
): TransitionCheck {
  if (DOCUMENT_FINAL.includes(from))
    return {
      ok: false,
      reason: `A ${DOCUMENT_STATUS_WORD[from].toLowerCase()} document stays as it is`,
    }
  if (!BY_EDGE.has(`${from}>${to}`))
    return from === to
      ? { ok: false, reason: `It is already ${DOCUMENT_STATUS_WORD[to]}` }
      : {
          ok: false,
          reason: `${DOCUMENT_STATUS_WORD[from]} cannot move to ${DOCUMENT_STATUS_WORD[to]}`,
        }
  const reason = BY_EDGE.get(`${from}>${to}`)?.(ctx, from) ?? null
  return reason ? { ok: false, reason } : { ok: true }
}

export function transitionDocument(
  from: DocumentStatusValue,
  to: DocumentStatusValue,
  ctx: DocumentTransitionContext
): ActivityEventDraft {
  const c = canTransitionDocument(from, to, ctx)
  if (!c.ok) throw new TransitionRefused(from, to, c.reason)
  return { kind: 'status', field: 'status', before: from, after: to }
}

/** Issued: approved, sent or later. Its file is immutable from then on. */
export function isIssued(status: DocumentStatusValue): boolean {
  return status !== 'draft'
}
