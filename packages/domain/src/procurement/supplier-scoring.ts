/**
 * Ranking supplier candidates for one enquiry line.
 *
 * Pure. No I/O. The ordering this produces decides who gets an RFQ, so it is
 * deterministic domain code with tests rather than a model call — a ranking
 * that cannot be explained cannot be corrected.
 *
 * Certification is a HARD FILTER, applied before scoring. In the measured
 * corpus 505 of 5,224 bids demanded 3.1 MTC and 233 demanded IACS class
 * approval in the title alone; a supplier who cannot certify is not a cheaper
 * option, it is a disqualified one.
 */

export type SupplierCandidate = {
  supplierId: string | null
  name: string
  country: string | null
  /** Does this supplier actually make or stock the item? 0-1, from research. */
  fit: number
  /** Already a known supplier — brand relationship or prior trade. */
  isKnownSupplier: boolean
  isAuthorizedDistributor: boolean
  rfqsSent: number
  repliesReceived: number
  /** Standards the supplier can certify to, canonical tokens. */
  certifications: string[]
  /** Best available contact channel. */
  contact: {
    hasEmail: boolean
    /** A generic sales@ inbox is worth less than a named person. */
    isRoleAddress: boolean
    /** Guessed addresses never count as reachable. */
    isGuessed: boolean
    verified: boolean
  } | null
}

export type ScoringContext = {
  /** Standards the LINE requires. Any one missing disqualifies. */
  requiredCertifications: string[]
  /** Where the goods must land. Used for the geography component. */
  destinationCountry: string
}

export type ScoredSupplier = {
  candidate: SupplierCandidate
  score: number
  components: {
    fit: number
    relationship: number
    responsiveness: number
    geography: number
    certification: number
    contactability: number
  }
  /** Populated only when the candidate is disqualified. */
  disqualifiedFor: string[]
}

/**
 * Weights sum to 100. Relationship is second only to fit because a supplier we
 * already trade with answers, quotes in a format we can read, and has terms —
 * none of which a cold candidate has.
 */
export const SCORING_WEIGHTS = {
  fit: 35,
  relationship: 25,
  responsiveness: 15,
  geography: 10,
  certification: 10,
  contactability: 5,
} as const

/** GCC and near neighbours ship to the UAE fastest. */
const NEAR_COUNTRIES = new Set(['AE', 'SA', 'OM', 'QA', 'KW', 'BH', 'IN', 'IR'])
/** Established industrial exporters — longer lead time, high capability. */
const MID_COUNTRIES = new Set(['DE', 'IT', 'TR', 'CN', 'GB', 'FR', 'ES', 'NL', 'JP', 'KR', 'US'])

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.min(1, Math.max(0, n))
}

/**
 * Reply rate, damped so a single lucky reply does not outrank a long record.
 *
 * A supplier with 1/1 scores lower than one with 8/10: the +2 pseudo-count in
 * the denominator means small samples pull toward the middle rather than to 1.
 */
export function responsivenessScore(rfqsSent: number, repliesReceived: number): number {
  if (rfqsSent <= 0) return 0.3 // untried — neither punished nor rewarded
  const replies = Math.min(repliesReceived, rfqsSent)
  return clamp01(replies / (rfqsSent + 2))
}

export function geographyScore(country: string | null, destination: string): number {
  if (!country) return 0.3
  const c = country.toUpperCase()
  if (c === destination.toUpperCase()) return 1
  if (NEAR_COUNTRIES.has(c)) return 0.8
  if (MID_COUNTRIES.has(c)) return 0.5
  return 0.3
}

export function contactabilityScore(contact: SupplierCandidate['contact']): number {
  if (!contact || !contact.hasEmail) return 0
  if (contact.isGuessed) return 0 // a guessed address is not a channel
  if (contact.verified) return 1
  return contact.isRoleAddress ? 0.6 : 0.8
}

function relationshipScore(c: SupplierCandidate): number {
  if (c.isAuthorizedDistributor) return 1
  if (c.isKnownSupplier) return 0.7
  return 0
}

/**
 * Which required certifications this candidate cannot meet.
 *
 * Case-insensitive on canonical tokens. An empty requirement list disqualifies
 * nobody.
 */
export function missingCertifications(
  candidate: SupplierCandidate,
  required: string[],
): string[] {
  if (required.length === 0) return []
  const held = new Set(candidate.certifications.map((s) => s.toLowerCase()))
  return required.filter((r) => !held.has(r.toLowerCase()))
}

/**
 * Score one candidate. Disqualified candidates score 0 and carry a reason.
 */
export function scoreSupplier(
  candidate: SupplierCandidate,
  context: ScoringContext,
): ScoredSupplier {
  const missing = missingCertifications(candidate, context.requiredCertifications)

  const components = {
    fit: clamp01(candidate.fit),
    relationship: relationshipScore(candidate),
    responsiveness: responsivenessScore(candidate.rfqsSent, candidate.repliesReceived),
    geography: geographyScore(candidate.country, context.destinationCountry),
    certification: missing.length === 0 ? 1 : 0,
    contactability: contactabilityScore(candidate.contact),
  }

  if (missing.length > 0) {
    return {
      candidate,
      score: 0,
      components,
      disqualifiedFor: missing.map((m) => `cannot certify ${m}`),
    }
  }

  const score =
    components.fit * SCORING_WEIGHTS.fit +
    components.relationship * SCORING_WEIGHTS.relationship +
    components.responsiveness * SCORING_WEIGHTS.responsiveness +
    components.geography * SCORING_WEIGHTS.geography +
    components.certification * SCORING_WEIGHTS.certification +
    components.contactability * SCORING_WEIGHTS.contactability

  return {
    candidate,
    score: Math.round(score * 100) / 100,
    components,
    disqualifiedFor: [],
  }
}

/**
 * Rank candidates, best first, dropping the disqualified.
 *
 * Returns "up to `limit`, honestly fewer" — padding a shortlist with suppliers
 * who cannot certify or cannot be reached makes the list look complete while
 * making it useless.
 */
export function rankSuppliers(
  candidates: SupplierCandidate[],
  context: ScoringContext,
  opts: { limit?: number; includeDisqualified?: boolean } = {},
): ScoredSupplier[] {
  const limit = opts.limit ?? 10
  const scored = candidates.map((c) => scoreSupplier(c, context))
  const eligible = opts.includeDisqualified
    ? scored
    : scored.filter((s) => s.disqualifiedFor.length === 0)

  return eligible
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      // Stable, explainable tiebreak rather than input order.
      return a.candidate.name.localeCompare(b.candidate.name)
    })
    .slice(0, limit)
}

/**
 * How many ranked candidates can actually be emailed.
 *
 * This — not the candidate count — is the number that says whether research
 * succeeded. A list of ten unreachable companies is a failed run.
 */
export function reachableCount(ranked: ScoredSupplier[]): number {
  return ranked.filter((r) => contactabilityScore(r.candidate.contact) > 0).length
}
