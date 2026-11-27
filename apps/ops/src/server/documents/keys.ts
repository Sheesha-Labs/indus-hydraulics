import type { $Enums } from '@indus/ops-db'

/**
 * Storage key of an issued document (07-map-repo-infra §3.11), in the ops-documents bucket:
 *
 *   <kind>/<yyyy>/<number-slug>-r<revision>-<sha8>.pdf      e.g. order_acknowledgement/2026/indus-oa1001-r1-3f2a9c1b.pdf
 *
 * The slug comes from the document number only: never a client or supplier name, never initials. The SHA
 * prefix makes a reissue a new object; an existing key is never overwritten.
 */
export function numberSlug(number: string): string {
  const slug = number
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  if (!slug) throw new Error('A document key needs a number')
  return slug
}

export function documentKey(i: {
  kind: $Enums.DocumentKind
  issuedAt: Date
  number: string
  revision: number
  sha256: string
}): string {
  if (!/^[0-9a-f]{64}$/.test(i.sha256)) throw new Error('A document key needs the file SHA-256')
  return `${i.kind}/${i.issuedAt.getUTCFullYear()}/${numberSlug(i.number)}-r${i.revision}-${i.sha256.slice(0, 8)}.pdf`
}

/** The file name a person downloads: the number, with its revision when there is one. */
export function downloadName(number: string, revision: number): string {
  const base = number.replace(/[^A-Za-z0-9._-]+/g, '-')
  return `${base}${revision > 1 ? `-R${revision}` : ''}.pdf`
}
