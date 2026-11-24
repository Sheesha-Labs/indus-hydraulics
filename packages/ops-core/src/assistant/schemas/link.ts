import { z } from 'zod'

/**
 * Action #2 link (S05-T04): the deterministic chain decides almost every message; the model only breaks a tie
 * between two or three open records of one known company (prompt `link-mail@1`). Precision over recall: a
 * wrong link files a message against the wrong deal, so anything unclear is Unsure.
 */
export const linkTieBreakSchema = z.strictObject({
  /** One of the candidate ids given, or 'none'. */
  choice: z.string().min(1).max(64),
  reasons: z
    .array(z.strictObject({ text: z.string().min(1).max(300), quote: z.string().min(1).max(400) }))
    .min(1)
    .max(3),
})
export type LinkTieBreakOutput = z.infer<typeof linkTieBreakSchema>

export type LinkStep =
  'thread' | 'cross_mailbox' | 'reply_to_outbound' | 'reference' | 'sender_domain'

export interface LinkCandidate {
  /** Stable id for the tie-break: `${subjectType}:${subjectId}`. */
  key: string
  subjectType: string
  subjectId: string
  enquiryId: string | null
  label: string
  step: LinkStep
  reason: string
}

export type LinkDecision =
  | { kind: 'link'; candidate: LinkCandidate; confidence: 'sure' | 'likely' }
  | { kind: 'tie_break'; candidates: LinkCandidate[] }
  | { kind: 'unsure'; options: LinkCandidate[] }
  | { kind: 'company_only'; companyId: string }
  | { kind: 'none' }

/** At most this many open records go to the model; more is Unsure without asking it. */
export const TIE_BREAK_MAX = 3

const STRONG: ReadonlySet<LinkStep> = new Set([
  'thread',
  'cross_mailbox',
  'reply_to_outbound',
  'reference',
])

function unique(cands: readonly LinkCandidate[]): LinkCandidate[] {
  const seen = new Map<string, LinkCandidate>()
  for (const c of cands) if (!seen.has(c.key)) seen.set(c.key, c)
  return [...seen.values()]
}

/**
 * The chain's verdict, from candidates in step order:
 *   - the first strong step (thread, cross-mailbox, reply to our outbound, a reference) that yields exactly one
 *     record links it, sure; two or more different records in that step are Unsure (never a guess)
 *   - otherwise the sender domain: one open record → likely; 2–3 → the model breaks the tie; more → Unsure
 *   - no candidate: a company link when the domain is known, else nothing
 */
export function decideLink(input: {
  candidates: readonly LinkCandidate[]
  knownCompanyId: string | null
}): LinkDecision {
  for (const step of ['thread', 'cross_mailbox', 'reply_to_outbound', 'reference'] as const) {
    const here = unique(input.candidates.filter((c) => c.step === step))
    if (here.length === 1) return { kind: 'link', candidate: here[0]!, confidence: 'sure' }
    if (here.length > 1) return { kind: 'unsure', options: here.slice(0, 2) }
  }
  const byDomain = unique(
    input.candidates.filter((c) => c.step === 'sender_domain' && !STRONG.has(c.step))
  )
  if (byDomain.length === 1) return { kind: 'link', candidate: byDomain[0]!, confidence: 'likely' }
  if (byDomain.length >= 2 && byDomain.length <= TIE_BREAK_MAX)
    return { kind: 'tie_break', candidates: byDomain }
  if (byDomain.length > TIE_BREAK_MAX) return { kind: 'unsure', options: byDomain.slice(0, 2) }
  if (input.knownCompanyId) return { kind: 'company_only', companyId: input.knownCompanyId }
  return { kind: 'none' }
}
