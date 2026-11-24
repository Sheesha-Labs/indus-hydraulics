/**
 * Look-alike folding for domains and display names (S05-T03, phishing.ts). `fold` maps characters that read
 * the same to one form, so "examp1e-va1ve.test" and "example-valve.test" compare equal after folding, and
 * `damerauLevenshtein` measures what is left.
 */

/** Cyrillic and Greek letters that render like Latin ones. */
const CONFUSABLE: Readonly<Record<string, string>> = {
  а: 'a',
  в: 'b',
  е: 'e',
  ё: 'e',
  к: 'k',
  м: 'm',
  н: 'h',
  о: 'o',
  р: 'p',
  с: 'c',
  т: 't',
  у: 'y',
  х: 'x',
  і: 'i',
  ј: 'j',
  ѕ: 's',
  ԁ: 'd',
  ԛ: 'q',
  ԝ: 'w',
  ӏ: 'l',
  α: 'a',
  β: 'b',
  ε: 'e',
  ι: 'i',
  κ: 'k',
  ν: 'v',
  ο: 'o',
  ρ: 'p',
  τ: 't',
  υ: 'u',
  χ: 'x',
  ω: 'w',
}

/** NFKC, lowercase, look-alike letters to Latin, then 0→o, 1→l, rn→m, vv→w, cl→d. */
export function fold(s: string): string {
  const base = s.normalize('NFKC').toLowerCase()
  let out = ''
  for (const ch of base) out += CONFUSABLE[ch] ?? ch
  return out
    .replace(/0/g, 'o')
    .replace(/[1|]/g, 'l')
    .replace(/rn/g, 'm')
    .replace(/vv/g, 'w')
    .replace(/cl/g, 'd')
}

/** Optimal string alignment distance (adjacent transpositions count as one edit). */
export function damerauLevenshtein(a: string, b: string): number {
  if (a === b) return 0
  const n = a.length
  const m = b.length
  if (n === 0) return m
  if (m === 0) return n
  const d: number[][] = Array.from({ length: n + 1 }, (_, i) =>
    Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      let v = Math.min(d[i - 1]![j]! + 1, d[i]![j - 1]! + 1, d[i - 1]![j - 1]! + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
        v = Math.min(v, d[i - 2]![j - 2]! + 1)
      d[i]![j] = v
    }
  }
  return d[n]![m]!
}
