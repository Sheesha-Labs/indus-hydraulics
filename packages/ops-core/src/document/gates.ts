import type { DocKind } from './types'

/**
 * The bank-block gate (S11-T07, architecture §9.1 item 1). Until the Owner has confirmed the bank block printed
 * on client documents (read from his own Zoho estimate), no client document can be approved: a wrong account on
 * a quotation or invoice is how money goes astray. Supplier documents carry no bank block and are never gated.
 * S17 (quotation approval), S24 (order documents) and S26 (tax invoice) call it before approving.
 */
export const BANK_GATED_KINDS: ReadonlySet<DocKind> = new Set([
  'quotation',
  'oa',
  'pi',
  'invoice',
  'cn',
])

export const BANK_GATE_REASON =
  'Bank block not confirmed by the Owner · Settings › Company documents'

export interface GateBankAccount {
  currency: string
  confirmedAt: Date | string | null
  showOnDocuments: boolean
  archivedAt: Date | string | null
}

export type GateResult = { allowed: true } | { allowed: false; reason: string }

/**
 * Allowed when a confirmed, shown, live account exists for the document's currency, or a confirmed AED account
 * (the block falls back to AED, as the letterhead does).
 */
export function clientDocumentApprovalGate(i: {
  kind: DocKind
  currency: string | null
  ownBankAccounts: readonly GateBankAccount[]
}): GateResult {
  if (!BANK_GATED_KINDS.has(i.kind)) return { allowed: true }
  const ok = i.ownBankAccounts.filter((a) => a.confirmedAt && a.showOnDocuments && !a.archivedAt)
  if (ok.some((a) => a.currency === (i.currency ?? 'AED')) || ok.some((a) => a.currency === 'AED'))
    return { allowed: true }
  return { allowed: false, reason: BANK_GATE_REASON }
}
