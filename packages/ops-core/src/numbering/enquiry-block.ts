/**
 * ENQ numbering while the website admin still allocates ENQ-YYYY-NNNN (S08-T06, C5). Ops starts its year's
 * series 1,000 above the highest legacy number, so the two never meet while both run; the nightly continuity
 * check warns when the admin comes within 200 of the Ops block and flags the sequence once it reaches it.
 */
export const ENQUIRY_BLOCK_GAP = 1000
export const ENQUIRY_BLOCK_WARN = 200

/** The next value to seed a year's ENQ series at: legacy max + 1000, and never below what Ops already issued. */
export function enquirySeedNext(legacyMax: number, opsMaxIssued: number | null = null): number {
  return Math.max(legacyMax + ENQUIRY_BLOCK_GAP, (opsMaxIssued ?? 0) + 1)
}

export type ContinuityStatus = 'ok' | 'approaching' | 'out_of_step'

/** Compares the legacy admin's highest number with Ops' next value for the same year. */
export function enquiryContinuity(legacyMax: number, opsNext: number): ContinuityStatus {
  if (legacyMax >= opsNext) return 'out_of_step'
  if (legacyMax >= opsNext - ENQUIRY_BLOCK_WARN) return 'approaching'
  return 'ok'
}

/** "ENQ-2026-1433" for a year and value (the sequence pattern ENQ-{yyyy}-{nnnn}). */
export function enquiryRefOf(year: number, value: number): string {
  return `ENQ-${year}-${String(value).padStart(4, '0')}`
}
