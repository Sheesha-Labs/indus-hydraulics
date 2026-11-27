import 'server-only'
import {
  buildSupplierDenyList,
  scanMoney,
  scanText,
  type DenyTerm,
  type ScanHit,
  type SupplierIdentity,
} from '@indus/ops-core'
import { opsDb, type Prisma } from '@indus/ops-db'
import { registerGateCheck } from '../mail-send/hooks'

/**
 * The reverse identifier check for client-bound text (ADR-13, apps/ops/CLAUDE.md §10.2–10.3; S09-T06 first use,
 * the model half arrives in S12). A regret, a question to a client, a reminder: no supplier's name, alias, domain,
 * contact address or supplier reference, and no amount or margin word. A deterministic hit hard-blocks: at
 * proposal build (a failing check), at approval (the final text, after edits) and in the send gate (the exact
 * bytes that leave).
 *
 * The deny list is the suppliers this enquiry touched: every RFQ recipient and every supplier that quoted.
 */

type Db = Pick<Prisma.TransactionClient, 'supplierRfqRecipient' | 'supplierQuote' | 'company'>

export async function enquiryDenyList(enquiryId: string, db: Db = opsDb): Promise<DenyTerm[]> {
  const [recipients, quotes] = await Promise.all([
    db.supplierRfqRecipient.findMany({
      where: { rfq: { enquiryId } },
      select: { supplierId: true },
    }),
    db.supplierQuote.findMany({
      where: { enquiryId },
      select: { supplierId: true, supplierRef: true },
    }),
  ])
  const ids = [...new Set([...recipients, ...quotes].map((r) => r.supplierId))]
  if (!ids.length) return []
  const companies = await db.company.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      name: true,
      legalName: true,
      aliases: true,
      primaryDomain: true,
      domains: true,
      contacts: { select: { email: true } },
    },
  })
  const refs = new Map<string, string[]>()
  for (const q of quotes)
    if (q.supplierRef) refs.set(q.supplierId, [...(refs.get(q.supplierId) ?? []), q.supplierRef])
  const ids2: SupplierIdentity[] = companies.map((c) => ({
    name: c.name,
    aliases: [...c.aliases, ...(c.legalName ? [c.legalName] : [])],
    domains: [...new Set([...(c.primaryDomain ? [c.primaryDomain] : []), ...c.domains])],
    emails: c.contacts.map((x) => x.email).filter((e): e is string => !!e),
    refs: refs.get(c.id) ?? [],
  }))
  return buildSupplierDenyList(ids2)
}

export interface ClientBoundScan {
  identity: ScanHit[]
  money: ScanHit[]
}

export function scanClientBound(text: string, deny: readonly DenyTerm[]): ClientBoundScan {
  return { identity: scanText(text, deny), money: scanMoney(text) }
}

/** The sentence a person sees when the check blocks: the terms, never more than three. */
export function blockReason(s: ClientBoundScan): string | null {
  if (s.identity.length) {
    const terms = [...new Set(s.identity.map((h) => `“${h.term}” (${h.kind})`))].slice(0, 3)
    return `The email names a supplier: ${terms.join(', ')}. Remove it before approving.`
  }
  if (s.money.length) {
    const terms = [...new Set(s.money.map((h) => `“${h.term}”`))].slice(0, 3)
    return `The email states ${s.money[0]!.kind === 'margin' ? 'a margin or cost' : 'an amount'}: ${terms.join(', ')}. A regret or a question never carries a price.`
  }
  return null
}

/** Client-bound kinds this check guards in the send gate (the quotation carries prices by design: not here). */
export const CLIENT_SCANNED_KINDS = new Set([
  'regret',
  'client_questions',
  'client_question_reminder',
])

async function gate(input: { outboundId: string; kind: string }): Promise<string | null> {
  if (!CLIENT_SCANNED_KINDS.has(input.kind)) return null
  const row = await opsDb.outboundEmail.findUnique({
    where: { id: input.outboundId },
    select: { subject: true, bodyText: true, enquiryId: true },
  })
  if (!row?.enquiryId) return null
  const deny = await enquiryDenyList(row.enquiryId)
  const reason = blockReason(scanClientBound(`${row.subject}\n${row.bodyText ?? ''}`, deny))
  return reason ? 'client_identity' : null
}

let registered = false
/** Called once where the send function loads (inngest/mail/send.ts). */
export function registerClientIdentityGate(): void {
  if (registered) return
  registerGateCheck('client_identity', gate)
  registered = true
}
