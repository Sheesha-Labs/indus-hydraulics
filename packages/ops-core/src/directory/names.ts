/**
 * Company names in the directory (S10-T01). Pure. "Example Valve Co. L.L.C" and "EXAMPLE VALVE CO" are one name:
 * legal suffixes, punctuation, case and diacritics are dropped before comparing. Used by matching, merge
 * suggestions and the blocked-counterparty check.
 */

/** Legal-form words, compared after punctuation is removed and dots collapsed ("l.l.c" → "llc"). */
const LEGAL_SUFFIXES = [
  'llc',
  'fze',
  'fzco',
  'fzc',
  'fzllc',
  'ltd',
  'limited',
  'gmbh',
  'ag',
  'spa',
  'srl',
  'sa',
  'sas',
  'sarl',
  'as',
  'bv',
  'nv',
  'plc',
  'inc',
  'incorporated',
  'corp',
  'corporation',
  'co',
  'company',
  'pvt',
  'private',
  'pte',
  'pty',
  'kg',
  'oy',
  'ab',
  'wll',
  'est',
  'establishment',
  'trading',
  'sanayi',
  've',
  'ticaret',
] as const

const SUFFIX_SET = new Set<string>(LEGAL_SUFFIXES)

/** "Örnek Hidrolik Sanayi A.Ş." → "ornek hidrolik"; "Example Valve Co. L.L.C" → "example valve". */
export function normaliseCompanyName(name: string | null | undefined): string {
  if (!name) return ''
  const folded = name
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ß/g, 'ss')
    .replace(/&/g, ' and ')
  // Dotted abbreviations first ("l.l.c", "s.p.a", "a.s"), then any punctuation becomes a space.
  const undotted = folded.replace(/\b(?:[a-z]\.){1,4}[a-z]?\b\.?/g, (m) => m.replace(/\./g, ''))
  const words = undotted
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  // Strip legal words from the end only, so "Trading Partners" keeps its first word.
  while (words.length > 1 && SUFFIX_SET.has(words[words.length - 1]!)) words.pop()
  return words.join(' ')
}

/** Same company name after normalisation (exact). */
export function sameCompanyName(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  const na = normaliseCompanyName(a)
  return na.length > 0 && na === normaliseCompanyName(b)
}

/** Two-letter avatar initials from the normalised name ("Example Valve Co" → "EV"). */
export function companyInitials(name: string): string {
  const words = normaliseCompanyName(name).split(' ').filter(Boolean)
  const letters =
    words.length >= 2 ? [words[0]![0], words[1]![0]] : [...(words[0] ?? '?').slice(0, 2)]
  return letters.join('').toUpperCase()
}
