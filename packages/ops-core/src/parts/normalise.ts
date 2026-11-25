/**
 * Part numbers (S08-T02, 06-map-schema §7.2). One normal form for matching: uppercase, everything but A–Z and 0–9
 * removed ("6316-C3", "6316C3" and "6316 C3" are all 6316C3). The form is never shown: the part number is
 * displayed as the client wrote it.
 */
export function partNoNorm(s: string | null | undefined): string {
  return (s ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '')
}

/** Characters a scan, a fax or a tired typist swaps. */
const LOOKALIKE: Record<string, readonly string[]> = {
  O: ['0'],
  '0': ['O'],
  I: ['1', 'L'],
  L: ['1', 'I'],
  '1': ['I', 'L'],
  S: ['5'],
  '5': ['S'],
  B: ['8'],
  '8': ['B'],
  Z: ['2'],
  '2': ['Z'],
}

export const MAX_LOOKALIKE_VARIANTS = 8

/**
 * Other readings of a normalised part number, one swap at a time (then pairs), at most eight, for the "which
 * part number is right?" options (board 15 "Part no. unclear: '10' or '1O'"). The input itself is not included.
 */
export function lookalikeVariants(norm: string): string[] {
  const out = new Set<string>()
  const positions = [...norm]
    .map((ch, i) => ({ i, alts: LOOKALIKE[ch] ?? [] }))
    .filter((p) => p.alts.length)
  for (const p of positions) {
    for (const alt of p.alts) {
      out.add(norm.slice(0, p.i) + alt + norm.slice(p.i + 1))
      if (out.size >= MAX_LOOKALIKE_VARIANTS) return [...out]
    }
  }
  for (let a = 0; a < positions.length; a++) {
    for (let b = a + 1; b < positions.length; b++) {
      const pa = positions[a]!
      const pb = positions[b]!
      const chars = [...norm]
      chars[pa.i] = pa.alts[0]!
      chars[pb.i] = pb.alts[0]!
      out.add(chars.join(''))
      if (out.size >= MAX_LOOKALIKE_VARIANTS) return [...out]
    }
  }
  out.delete(norm)
  return [...out]
}

/**
 * Whether a string reads like a part number at all: 3–30 characters after normalising, at least two digits, not
 * only digits under four characters ("10" is a quantity, not a part).
 */
export function looksLikePartNumber(s: string | null | undefined): boolean {
  const n = partNoNorm(s)
  if (n.length < 3 || n.length > 30) return false
  const digits = n.replace(/\D/g, '').length
  if (digits < 2) return false
  return !(/^\d+$/.test(n) && n.length < 4)
}
