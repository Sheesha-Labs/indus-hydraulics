import { z } from 'zod'

/**
 * The proposal every Assistant action writes (S06-T01, ADR-09), as it is stored on `assistant_action`
 * (headline, reasons, checks, confidence, unsure, options, on-approve, preview). One ProposalCard renders every
 * kind; the kind decides what `preview` holds. Validated when an action writes it (runner) and again when a
 * page reads it (data/proposal-mapper), so the renderer never trusts unchecked JSON.
 *
 * (decision) Reasons are 0–6, not the plan's 1–4: a detector verdict (a bounce, a newsletter) may carry none,
 * and the card shows "Found by the mail checks" instead.
 */
export const storedReason = z.object({
  text: z.string().min(1).max(600),
  spanIds: z.array(z.uuid()).max(6).optional(),
  evidenceLabel: z.string().max(80).optional(),
})
export type StoredReason = z.infer<typeof storedReason>

export const storedCheck = z.object({
  label: z.string().min(1).max(160),
  status: z.enum(['pass', 'warn', 'fail']),
  detail: z.string().max(400).nullish(),
  /** Cost, margin or sell: hidden from a Helper without canSeeMargins. */
  sensitive: z.boolean().optional(),
})
export type StoredCheck = z.infer<typeof storedCheck>

export const storedOption = z.object({
  key: z.string().min(1).max(200),
  label: z.string().min(1).max(200),
  consequence: z.string().max(300).default(''),
})
export type StoredOption = z.infer<typeof storedOption>

export const proposalBase = z.object({
  headline: z.string().min(1).max(200),
  reasons: z.array(storedReason).max(6),
  checks: z.array(storedCheck).max(12),
  confidence: z.enum(['sure', 'likely', 'unsure']).nullable(),
  unsureAbout: z.string().max(400).nullish(),
  options: z.array(storedOption).max(8).nullish(),
  onApproveText: z.string().max(300).nullish(),
})
export type ProposalBase = z.infer<typeof proposalBase>

/** What the runner stores and the mapper reads: the base columns plus `preview` (shape by kind). */
export interface StoredProposalInput extends ProposalBase {
  preview: unknown
  surface: string
}
