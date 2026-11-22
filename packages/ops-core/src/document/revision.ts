/**
 * Revision labels (ADR-15, C6): a revised quotation keeps its base number and adds "-R{n}", always with
 * a capital R and a hyphen ("INDUS/Q10001-R2", never "r2").
 */

const REVISION = /^-?r?(\d+)$/i

/** The revision number in "2", "R2", "r2" or "-R2"; null for anything else. */
export function revisionNumber(revision: string | undefined): number | null {
  const m = REVISION.exec((revision ?? '').trim())
  if (!m) return null
  const n = Number(m[1])
  return n > 0 ? n : null
}

/** "-R2" for any accepted spelling of revision 2; "" when there is no revision. */
export function revisionSuffix(revision: string | undefined): string {
  const n = revisionNumber(revision)
  return n === null ? '' : `-R${n}`
}

/** The document number with its revision suffix, without doubling a suffix the number already has. */
export function documentNumber(no: string, revision?: string): string {
  const suffix = revisionSuffix(revision)
  if (!suffix) return no
  const base = no.replace(/-r\d+$/i, '')
  return `${base}${suffix}`
}

/** "Revision 2 — supersedes R1"; "" for no revision. */
export function revisionLabel(revision: string | undefined): string {
  const n = revisionNumber(revision)
  if (n === null) return ''
  return n > 1 ? `Revision ${n} — supersedes R${n - 1}` : `Revision ${n}`
}
