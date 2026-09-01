/**
 * Item signatures — the cache key for supplier research.
 *
 * Two enquiries a month apart will ask for the same thing in different words:
 *
 *     GATE VALVE 6 INCH 300LB CAST STEEL FLANGED WITH 3.1 MTC
 *     6" 300# CS GATE VALVE, FLANGED, EN 10204 3.1
 *
 * Researching both costs real money and real minutes against a 1.2-day median
 * response window. A signature canonicalises the parts that identify the thing
 * — commodity, size, pressure rating, material, standards — and hashes them, so
 * the second enquiry hits a cached supplier list instead of a fresh search.
 *
 * Pure. No I/O. Deliberately conservative: when a token cannot be classified it
 * stays in the commodity key rather than being dropped, because a signature that
 * collides two genuinely different items is far worse than one that misses a
 * cache hit.
 */

/** Words that carry no identifying information for a supplier search. */
const STOPWORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'by', 'for', 'from', 'in', 'of', 'on', 'or', 'the', 'to', 'with',
  'x', 'nos', 'no', 'pc', 'pcs', 'piece', 'pieces', 'set', 'sets', 'ea', 'each', 'unit', 'units',
  'qty', 'quantity', 'supply', 'supplying', 'provide', 'item', 'items', 'assorted', 'various',
  'required', 'reqd', 'spare', 'spares', 'new', 'genuine', 'original', 'equivalent', 'equiv',
])

/** Inch sizes: 6", 6 IN, 6 INCH, 6-INCH, 1/2", 1-1/2" */
const INCH =
  /\b(\d+(?:\s*-\s*\d+\s*\/\s*\d+|\s*\d+\s*\/\s*\d+|\.\d+)?|\d+\s*\/\s*\d+)\s*(?:"|''|inch(?:es)?\b|in\b)/gi

/** Metric sizes: 150MM, 150 MM, DN150 */
const MM = /\b(?:dn\s*)?(\d+(?:\.\d+)?)\s*mm\b|\bdn\s*(\d+)\b/gi

/** Pressure class: 300LB, 300#, CLASS 300, 300 LBS, PN16, ANSI 150 */
const CLASS_LB = /\b(?:class\s*|ansi\s*)?(\d{2,4})\s*(?:#|lbs?\b)|(?:\bclass|\bansi)\s*(\d{2,4})\b/gi
const CLASS_PN = /\bpn\s*(\d{1,3})\b/gi

const MATERIALS: Array<[RegExp, string]> = [
  [/\bss\s*316\s*l\b|\b316l\b|\bstainless\s*316l\b/i, 'ss316l'],
  [/\bss\s*316\b|\b316\s*ss\b|\bstainless\s*316\b/i, 'ss316'],
  [/\bss\s*304\b|\b304\s*ss\b|\bstainless\s*304\b/i, 'ss304'],
  [/\bstainless(?:\s*steel)?\b|\bss\b/i, 'stainless'],
  [/\bcast\s*steel\b|\bwcb\b/i, 'cast-steel'],
  [/\bcarbon\s*steel\b|\bcs\b|\ba105\b/i, 'carbon-steel'],
  [/\bduplex\b/i, 'duplex'],
  [/\bbrass\b/i, 'brass'],
  [/\bbronze\b|\bgunmetal\b/i, 'bronze'],
  [/\bcast\s*iron\b|\bci\b/i, 'cast-iron'],
  [/\bptfe\b|\bteflon\b/i, 'ptfe'],
  [/\bnitrile\b|\bnbr\b|\bbuna\b/i, 'nbr'],
  [/\bviton\b|\bfkm\b/i, 'fkm'],
  [/\bepdm\b/i, 'epdm'],
]

const STANDARDS: Array<[RegExp, string]> = [
  [/\ben\s*10204\s*3\.2\b|\b3\.2\s*mtc\b/i, 'en10204-3.2'],
  [/\ben\s*10204(?:\s*3\.1)?\b|\b3\.1\b(?:\s*mtc)?|\bmtc\b/i, 'en10204-3.1'],
  [/\biacs\b/i, 'iacs'],
  [/\bapi\s*(\d{3,4})\b/i, 'api'],
  [/\basme\b/i, 'asme'],
  [/\bastm\b/i, 'astm'],
  [/\bdin\b/i, 'din'],
  [/\biso\s*\d+/i, 'iso'],
  [/\batex\b/i, 'atex'],
]

export type ItemSignature = {
  /** Sorted, de-duplicated significant tokens. The thing itself. */
  commodityKey: string
  /** Canonical sizes, e.g. ["6in"], ["150mm"]. Sorted. */
  sizes: string[]
  /** Canonical pressure ratings, e.g. ["class300"], ["pn16"]. Sorted. */
  ratings: string[]
  /** Canonical material tokens. Sorted. */
  materials: string[]
  /** Canonical standards / certification tokens. Sorted. */
  standards: string[]
  /** Stable hash over every field above. The cache key. */
  signatureHash: string
}

/** Turn "1-1/2" or "1 1/2" or "1/2" into a decimal string. */
function fractionToDecimal(raw: string): string {
  const cleaned = raw.replace(/\s+/g, '')
  const mixed = /^(\d+)-?(\d+)\/(\d+)$/.exec(cleaned)
  if (mixed) {
    const value = Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3])
    return String(Number(value.toFixed(4)))
  }
  const simple = /^(\d+)\/(\d+)$/.exec(cleaned)
  if (simple) return String(Number((Number(simple[1]) / Number(simple[2])).toFixed(4)))
  return String(Number(cleaned))
}

/**
 * FNV-1a. Not cryptographic and does not need to be — this is a cache key, not
 * a security boundary. Chosen over a crypto import because @indus/domain
 * deliberately has no runtime dependency beyond zod.
 */
function stableHash(input: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

function collect(text: string, re: RegExp, map: (m: RegExpExecArray) => string | null): string[] {
  const out = new Set<string>()
  const scan = new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`)
  let m: RegExpExecArray | null
  while ((m = scan.exec(text)) !== null) {
    const value = map(m)
    if (value) out.add(value)
  }
  return [...out].sort()
}

/**
 * Build a signature from a free-text item description.
 *
 * Matched size/rating/material/standard tokens are REMOVED from the commodity
 * key so that "6in gate valve" and "gate valve 6 inch" produce the same key.
 * Anything unrecognised stays, which is the conservative direction.
 */
export function buildItemSignature(description: string): ItemSignature {
  const text = description.trim()

  const sizes = [
    ...collect(text, INCH, (m) => (m[1] ? `${fractionToDecimal(m[1])}in` : null)),
    ...collect(text, MM, (m) => {
      const value = m[1] ?? m[2]
      return value ? `${Number(value)}mm` : null
    }),
  ].sort()

  const ratings = [
    ...collect(text, CLASS_LB, (m) => {
      const value = m[1] ?? m[2]
      return value ? `class${Number(value)}` : null
    }),
    ...collect(text, CLASS_PN, (m) => (m[1] ? `pn${Number(m[1])}` : null)),
  ].sort()

  const materials = MATERIALS.filter(([re]) => re.test(text)).map(([, key]) => key)
  const standards = STANDARDS.filter(([re]) => re.test(text)).map(([, key]) => key)

  // Strip everything already captured, then reduce the remainder to a token set.
  let remainder = text
  for (const re of [INCH, MM, CLASS_LB, CLASS_PN]) {
    remainder = remainder.replace(new RegExp(re.source, 'gi'), ' ')
  }
  for (const [re] of [...MATERIALS, ...STANDARDS]) {
    remainder = remainder.replace(new RegExp(re.source, 'gi'), ' ')
  }

  const tokens = remainder
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((t) => t.length > 1 && !STOPWORDS.has(t) && !/^\d+$/.test(t))

  const commodityKey = [...new Set(tokens)].sort().join(' ')

  const canonical = JSON.stringify({
    c: commodityKey,
    s: sizes,
    r: ratings,
    m: materials.slice().sort(),
    t: standards.slice().sort(),
  })

  return {
    commodityKey,
    sizes,
    ratings,
    materials: materials.slice().sort(),
    standards: standards.slice().sort(),
    signatureHash: stableHash(canonical),
  }
}

/** True when two descriptions would share a research cache entry. */
export function sameSignature(a: string, b: string): boolean {
  return buildItemSignature(a).signatureHash === buildItemSignature(b).signatureHash
}
