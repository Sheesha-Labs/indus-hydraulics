/**
 * A supplier's three-letter short code for dense columns (board 05 "Sent to KES · ROT", "Best cost $1,690 · ROT").
 * Derived from the name until Directory (S10) stores one: the first three letters of the first word that has
 * any, upper case; legal suffixes and articles are skipped. Pure.
 */
const SKIP = new Set(['the', 'al', 'el', 'co', 'llc', 'ltd', 'gmbh', 'fze', 'fzco', 'spa', 'inc'])

export function supplierShortCode(name: string): string {
  const words = name
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
  const word = words.find((w) => !SKIP.has(w.toLowerCase()) && /\p{L}/u.test(w)) ?? words[0] ?? ''
  return (
    word
      .replace(/[^\p{L}]/gu, '')
      .slice(0, 3)
      .toUpperCase() || '—'
  )
}
