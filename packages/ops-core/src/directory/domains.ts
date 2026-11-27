import { damerauLevenshtein, fold } from '../mail/homoglyph'

/**
 * Domains in the directory (S10-T01, 06-map-schema §8.4). Pure. A company is identified by its registrable domain
 * ("mail.example.co.uk" → "example.co.uk"); a public webmail domain never identifies one. Look-alike domains are
 * the bank-change fraud signal on board 132.
 */

/** Second-level public suffixes for the countries Indus trades with (registrable = one label below these). */
const MULTI_LABEL_SUFFIXES = new Set([
  'co.uk',
  'org.uk',
  'ac.uk',
  'com.sa',
  'net.sa',
  'org.sa',
  'com.qa',
  'com.kw',
  'com.om',
  'co.om',
  'com.bh',
  'co.ae',
  'net.ae',
  'org.ae',
  'gov.ae',
  'co.in',
  'net.in',
  'org.in',
  'com.cn',
  'net.cn',
  'org.cn',
  'com.tr',
  'net.tr',
  'com.eg',
  'com.pk',
  'com.sg',
  'com.my',
  'co.kr',
  'co.jp',
  'com.au',
  'net.au',
  'co.nz',
  'co.za',
  'com.br',
  'com.mx',
  'com.ng',
  'co.ke',
  'com.hk',
  'com.tw',
  'co.id',
  'com.vn',
  'co.th',
])

/** Lower-case, trimmed, without scheme, path, port, user part or a leading "www.". Null when nothing usable. */
export function normaliseDomain(input: string | null | undefined): string | null {
  if (!input) return null
  let s = input.trim().toLowerCase()
  if (!s) return null
  const at = s.lastIndexOf('@')
  if (at >= 0) s = s.slice(at + 1)
  s = s.replace(/^[a-z][a-z0-9+.-]*:\/\//, '')
  s = s.split(/[/?#]/)[0] ?? ''
  s = s.replace(/:\d+$/, '').replace(/\.+$/, '')
  s = s.replace(/^www\d?\./, '')
  if (!/^[a-z0-9¡-￿-]+(\.[a-z0-9¡-￿-]+)+$/.test(s)) return null
  return s
}

/** "mail.example.co.uk" → "example.co.uk"; "sub.example.com" → "example.com". */
export function registrableDomain(input: string | null | undefined): string | null {
  const d = normaliseDomain(input)
  if (!d) return null
  const labels = d.split('.')
  if (labels.length <= 2) return d
  const lastTwo = labels.slice(-2).join('.')
  const take = MULTI_LABEL_SUFFIXES.has(lastTwo) ? 3 : 2
  return labels.slice(-take).join('.')
}

/** A punycode label ("xn--…") is shown as the person typed it; we keep ASCII here and flag it for display. */
export function isPunycode(domain: string): boolean {
  return domain.split('.').some((l) => l.startsWith('xn--'))
}

/** The domain itself (not an address) is a public webmail domain from the settings list. */
export function isFreeMailDomain(
  domain: string | null | undefined,
  list: readonly string[]
): boolean {
  const d = normaliseDomain(domain)
  if (!d) return false
  const lower = list.map((x) => x.toLowerCase())
  return lower.includes(d) || lower.includes(registrableDomain(d) ?? d)
}

/** The label below the public suffix, for comparing "examp1e.com" with "example.ae". */
function stem(domain: string): string {
  const r = registrableDomain(domain) ?? domain
  return r.split('.')[0] ?? r
}

/**
 * Two different domains that a reader would take for the same (board 132): equal after homoglyph folding, or within
 * edit distance 2 of each other on the registrable stem. The same registrable domain is not a look-alike.
 */
export function lookalikeDomain(a: string, b: string): boolean {
  const ra = registrableDomain(a)
  const rb = registrableDomain(b)
  if (!ra || !rb || ra === rb) return false
  const fa = fold(stem(ra))
  const fb = fold(stem(rb))
  if (fa.length < 4 || fb.length < 4) return fa === fb
  return fa === fb || damerauLevenshtein(fa, fb) <= 2
}
