/**
 * How alike two line descriptions are (S08-T04 duplicates, S08-T06 revision detection): the Dice coefficient over
 * lower-cased word tokens, 0–1. Part numbers decide first; this only confirms two lines say the same thing.
 */
function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9/".#-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
}

export function descriptionSimilarity(a: string, b: string): number {
  const ta = tokens(a)
  const tb = tokens(b)
  if (!ta.length || !tb.length) return 0
  const pool = [...tb]
  let shared = 0
  for (const t of ta) {
    const i = pool.indexOf(t)
    if (i >= 0) {
      shared += 1
      pool.splice(i, 1)
    }
  }
  return (2 * shared) / (ta.length + tb.length)
}

export const DUPLICATE_SIMILARITY = 0.9

/**
 * Lines that repeat one another within one intake: the same normalised part number and descriptions at least 0.9
 * alike, or (no part number on either) descriptions identical after normalising. Returns duplicate → the first line
 * it repeats, in order.
 */
export function findDuplicates(
  lines: ReadonlyArray<{ id: string; partNoNorm: string | null; description: string }>
): Map<string, string> {
  const out = new Map<string, string>()
  for (let i = 0; i < lines.length; i++) {
    const a = lines[i]!
    if (out.has(a.id)) continue
    for (let j = i + 1; j < lines.length; j++) {
      const b = lines[j]!
      if (out.has(b.id)) continue
      const samePart = !!a.partNoNorm && a.partNoNorm === b.partNoNorm
      const sim = descriptionSimilarity(a.description, b.description)
      if (
        (samePart && sim >= DUPLICATE_SIMILARITY) ||
        (!a.partNoNorm && !b.partNoNorm && sim === 1)
      )
        out.set(b.id, a.id)
    }
  }
  return out
}
