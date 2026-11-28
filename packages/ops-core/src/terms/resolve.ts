import { parseApprovalRule, evaluateApprovalRule, type ApprovalRule } from './approval'
import { renderClause, type TermsValues } from './variables'

/**
 * Resolving the terms a document prints (S11-T06): a preset's clauses in category order, each filled from
 * (lowest first) the clause's own defaults, the preset's values, the enquiry's facts and a change on this one
 * document; then rendered upper case and checked against its approval rule. Used by the quotation, OA and
 * proforma builders through BuildContext.terms.
 */
export const TERMS_CATEGORIES = [
  'payment',
  'delivery',
  'lead_time',
  'validity',
  'make_origin',
  'vat',
  'documents',
  'inspection',
  'warranty',
  'packing',
  'disclaimer',
  'cancellation',
] as const
export type TermsCategory = (typeof TERMS_CATEGORIES)[number]

export const TERMS_CATEGORY_LABEL: Record<TermsCategory, string> = {
  payment: 'Payment',
  delivery: 'Delivery',
  lead_time: 'Lead time',
  validity: 'Validity',
  make_origin: 'Make / origin',
  vat: 'VAT',
  documents: 'Documents',
  inspection: 'Inspection',
  warranty: 'Warranty',
  packing: 'Packing',
  disclaimer: 'Disclaimer',
  cancellation: 'Cancellation',
}

export const isTermsCategory = (c: string): c is TermsCategory =>
  (TERMS_CATEGORIES as readonly string[]).includes(c)

export interface PresetClauseInput {
  code: string
  title: string
  category: string
  body: string
  locked: boolean
  approvalRule: ApprovalRule | unknown | null
  /** The clause's own defaults. */
  defaults: TermsValues
  /** The preset's values for this clause. */
  values: TermsValues
  position: number
}

export interface ResolvedTerm {
  code: string
  title: string
  category: TermsCategory
  label: string
  text: string
  locked: boolean
  needsApproval: boolean
  reason: string | null
  /** Set when the clause cannot print (unknown variable, missing value): the document is held. */
  error: string | null
}

export function resolveTerms(
  preset: { clauses: readonly PresetClauseInput[] },
  overrides: Readonly<Record<string, TermsValues>> = {},
  context: TermsValues = {}
): ResolvedTerm[] {
  const rank = (c: string) => {
    const i = (TERMS_CATEGORIES as readonly string[]).indexOf(c)
    return i < 0 ? TERMS_CATEGORIES.length : i
  }
  return [...preset.clauses]
    .sort((a, b) => rank(a.category) - rank(b.category) || a.position - b.position)
    .map((c) => {
      const category = (isTermsCategory(c.category) ? c.category : 'documents') as TermsCategory
      const values: TermsValues = { ...c.defaults, ...c.values, ...context, ...overrides[c.code] }
      const r = renderClause(c.body, values)
      const verdict = evaluateApprovalRule(parseApprovalRule(c.approvalRule), values)
      return {
        code: c.code,
        title: c.title,
        category,
        label: TERMS_CATEGORY_LABEL[category],
        text: r.ok ? r.text : '',
        locked: c.locked,
        needsApproval: verdict.needsApproval,
        reason: verdict.reason,
        error: r.ok ? null : r.error,
      }
    })
}

/** The rows a document prints: one per category, its clauses joined. Clauses that cannot print are left out. */
export function termsForDocument(terms: readonly ResolvedTerm[]): { label: string; text: string }[] {
  const out: { label: string; text: string }[] = []
  for (const t of terms) {
    if (t.error) continue
    const row = out.find((r) => r.label === t.label)
    if (row) row.text = `${row.text}; ${t.text}`
    else out.push({ label: t.label, text: t.text })
  }
  return out
}
