/**
 * Attributing a pasted supplier reply back to the enquiry it answers.
 *
 * A mis-attributed reply prices the WRONG enquiry, silently — the numbers are
 * real, the quote looks fine, and the error surfaces only when a customer is
 * charged against someone else's costs. So the rule is: a unique confident
 * match, or nothing. A best guess is never returned.
 *
 * Our outbound RFQ carries "Our reference: ENQ-YYYY-NNNN" for exactly this
 * reason, and suppliers quote it back in the reply body or subject.
 */

/** ENQ-2026-0007, tolerant of spacing and case but not of shape. */
const ENQUIRY_CODE = /\bENQ[\s-]?(\d{4})[\s-]?(\d{4})\b/gi

export type AttributionMethod = 'reference_token' | 'manual' | 'fuzzy'

export type AttributionResult = {
  /** Normalised code, or null when no single confident match exists. */
  enquiryCode: string | null
  method: AttributionMethod
  /** Every distinct code seen. More than one means ambiguous, not "pick the first". */
  candidates: string[]
}

/**
 * Find the enquiry reference in a pasted reply.
 *
 * Returns null when zero or MORE THAN ONE distinct code appears. A supplier
 * replying to a forwarded thread can legitimately quote two references, and
 * guessing between them is exactly the failure this guards against.
 */
export function attributeReply(rawText: string): AttributionResult {
  if (typeof rawText !== 'string' || !rawText.trim()) {
    return { enquiryCode: null, method: 'manual', candidates: [] }
  }

  const seen = new Set<string>()
  const re = new RegExp(ENQUIRY_CODE.source, 'gi')
  let m: RegExpExecArray | null
  while ((m = re.exec(rawText)) !== null) {
    seen.add(`ENQ-${m[1]}-${m[2]}`.toUpperCase())
  }

  const candidates = [...seen].sort()
  if (candidates.length === 1) {
    return { enquiryCode: candidates[0]!, method: 'reference_token', candidates }
  }
  return { enquiryCode: null, method: 'manual', candidates }
}

/**
 * Guess which supplier sent a reply, from a set we actually wrote to.
 *
 * Matches on domain first — an address on the supplier's own domain is near
 * proof — then on a distinctive name appearing in the text. Returns null on a
 * tie, for the same reason as above.
 */
export function attributeSupplier(input: {
  rawText: string
  candidates: Array<{ id: string; name: string; domain: string | null }>
}): { supplierId: string | null; method: AttributionMethod } {
  const text = input.rawText.toLowerCase()

  const byDomain = input.candidates.filter(
    (c) => c.domain && text.includes(`@${c.domain.toLowerCase()}`),
  )
  if (byDomain.length === 1) return { supplierId: byDomain[0]!.id, method: 'reference_token' }
  if (byDomain.length > 1) return { supplierId: null, method: 'manual' }

  // Names shorter than this match too much ordinary prose to be evidence.
  const byName = input.candidates.filter(
    (c) => c.name.length >= 5 && text.includes(c.name.toLowerCase()),
  )
  if (byName.length === 1) return { supplierId: byName[0]!.id, method: 'fuzzy' }

  return { supplierId: null, method: 'manual' }
}
