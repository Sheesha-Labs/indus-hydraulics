/**
 * The documents a new supplier provides (S10-T04, board 50). Pure. Nine kinds; product approvals are required only
 * when the line card has a trade (the approvals depend on the categories). A document counts as "in" when it is
 * received, signed or awaiting signature only for agreements (the code of conduct and the NDA go out from Indus).
 */

export const REQUIRED_DOCUMENTS = [
  { kind: 'trade_licence', label: 'Trade registry / licence', detail: 'Registry name and number' },
  { kind: 'vat_certificate', label: 'Tax certificate', detail: 'Tax or VAT registration' },
  {
    kind: 'iso_certificate',
    label: 'ISO 9001 certificate',
    detail: 'Issuer and certificate number',
  },
  {
    kind: 'approval',
    label: 'Product approvals',
    detail: 'Type tests and approvals for the categories',
  },
  {
    kind: 'bank_letter',
    label: 'Bank letter on bank letterhead',
    detail: 'Bank, account name and currencies',
  },
  { kind: 'company_profile', label: 'Company profile & plant list', detail: 'PDF' },
  {
    kind: 'code_of_conduct',
    label: 'Supplier code of conduct',
    detail: 'Signed, includes the export-control clause',
  },
  { kind: 'nda', label: 'Mutual NDA', detail: 'The Indus standard NDA' },
  { kind: 'ownership_declaration', label: 'Ownership declaration', detail: 'Owners over 25%' },
] as const

export type RequiredDocKind = (typeof REQUIRED_DOCUMENTS)[number]['kind']
export const REQUIRED_DOC_KINDS: readonly RequiredDocKind[] = REQUIRED_DOCUMENTS.map((d) => d.kind)

export type DocStatus =
  'requested' | 'received' | 'awaiting_signature' | 'signed' | 'missing' | 'expired'

export interface HeldDocument {
  kind: string
  status: string
  expiresAt: Date | null
  archivedAt?: Date | null
}

export interface RequiredRow {
  kind: RequiredDocKind
  label: string
  detail: string
  status: DocStatus
  /** Not needed now: approvals when the line card has no trade. */
  optional: boolean
  expiresAt: Date | null
}

const IN: ReadonlySet<string> = new Set(['received', 'signed'])

/** The nine rows with their current status (the newest live document of each kind wins). */
export function requiredDocuments(
  held: readonly HeldDocument[],
  opts: { hasTrades: boolean; today: Date }
): { rows: RequiredRow[]; inCount: number; of: number } {
  const rows = REQUIRED_DOCUMENTS.map((d) => {
    const mine = held.filter((h) => h.kind === d.kind && !h.archivedAt)
    const best =
      mine.find((h) => IN.has(h.status) && !(h.expiresAt && h.expiresAt < opts.today)) ??
      mine.find((h) => h.status === 'awaiting_signature') ??
      mine.find((h) => h.status === 'requested') ??
      mine[0]
    const expired = !!best?.expiresAt && best.expiresAt < opts.today
    const status: DocStatus = !best ? 'missing' : expired ? 'expired' : (best.status as DocStatus)
    return {
      kind: d.kind,
      label: d.label,
      detail: d.detail,
      status,
      optional: d.kind === 'approval' && !opts.hasTrades,
      expiresAt: best?.expiresAt ?? null,
    }
  })
  const counted = rows.filter((r) => !r.optional)
  return { rows, inCount: counted.filter((r) => IN.has(r.status)).length, of: counted.length }
}

/** The kinds still outstanding (what a document request asks for). */
export function outstandingKinds(rows: readonly RequiredRow[]): RequiredDocKind[] {
  return rows
    .filter((r) => !r.optional && !IN.has(r.status) && r.status !== 'awaiting_signature')
    .map((r) => r.kind)
}

export function documentLabel(kind: string): string {
  return REQUIRED_DOCUMENTS.find((d) => d.kind === kind)?.label ?? kind.replace(/_/g, ' ')
}

/** Onboarding states that keep a supplier out of every RFQ, research and PO selector (board 50). */
export const NOT_SELECTABLE = [
  'draft',
  'proposed',
  'under_review',
  'rejected',
  'suspended',
] as const

/**
 * May this supplier be chosen for an RFQ, research shortlist or PO? Never when blocked; never while its onboarding
 * is unfinished or rejected. A supplier never in the wizard (onboardingStatus null: contact-only, research) keeps
 * RFQ eligibility: tiers gate POs and payments, never RFQs (board 130).
 */
export function isSelectableSupplier(p: {
  tier: string
  onboardingStatus: string | null
}): boolean {
  if (p.tier === 'blocked') return false
  return (
    p.onboardingStatus === null ||
    !(NOT_SELECTABLE as readonly string[]).includes(p.onboardingStatus)
  )
}
