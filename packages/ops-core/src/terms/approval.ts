import { z } from 'zod'
import type { TermsValues } from './variables'

/**
 * Approval rules on risky terms (S11-T06, board 39, ADR-08: the model proposes, code decides). A clause may
 * carry one rule; resolving a quotation's terms evaluates it in code against the filled values, and a clause
 * that needs approval holds the quotation for the Owner.
 */
export const approvalRuleSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('always') }).strict(),
  z
    .object({ kind: z.literal('payment_days_over'), days: z.number().int().min(1).max(365) })
    .strict(),
  z
    .object({ kind: z.literal('advance_pct_below'), pct: z.number().int().min(1).max(100) })
    .strict(),
])
export type ApprovalRule = z.infer<typeof approvalRuleSchema>

/** The chip on the clause card: "Approval always", "Approval above 60 days". */
export function approvalRuleLabel(rule: ApprovalRule): string {
  switch (rule.kind) {
    case 'always':
      return 'Approval always'
    case 'payment_days_over':
      return `Approval above ${rule.days} days`
    case 'advance_pct_below':
      return `Approval below ${rule.pct}% advance`
  }
}

export interface ApprovalVerdict {
  needsApproval: boolean
  reason: string | null
}

const num = (v: string | number | undefined): number | null => {
  if (v === undefined) return null
  const n = Number(String(v).trim())
  return Number.isFinite(n) ? n : null
}

/**
 * Does this clause, filled with these values, need the Owner? Payment days are `balance_days`, else `days`.
 * A rule that cannot be checked (the value is missing) needs approval: unknown is never treated as safe.
 */
export function evaluateApprovalRule(
  rule: ApprovalRule | null | undefined,
  values: TermsValues
): ApprovalVerdict {
  if (!rule) return { needsApproval: false, reason: null }
  switch (rule.kind) {
    case 'always':
      return { needsApproval: true, reason: 'This clause always needs approval' }
    case 'payment_days_over': {
      const d = num(values.balance_days) ?? num(values.days)
      if (d === null) return { needsApproval: true, reason: 'Payment days are not set' }
      return d > rule.days
        ? { needsApproval: true, reason: `Payment at ${d} days is over ${rule.days} days` }
        : { needsApproval: false, reason: null }
    }
    case 'advance_pct_below': {
      const p = num(values.advance_pct)
      if (p === null) return { needsApproval: true, reason: 'The advance is not set' }
      return p < rule.pct
        ? { needsApproval: true, reason: `An advance of ${p}% is below ${rule.pct}%` }
        : { needsApproval: false, reason: null }
    }
  }
}

/** A stored rule (jsonb) parsed, or null when there is none. Malformed is an error: never silently no rule. */
export function parseApprovalRule(v: unknown): ApprovalRule | null {
  if (v === null || v === undefined) return null
  return approvalRuleSchema.parse(v)
}
