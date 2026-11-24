/**
 * The writeTracked guard's scanner (write-tracked.guard.test.ts): finds mutating Prisma calls that are not
 * inside the parentheses of a `writeTracked(` call. Text only; no imports.
 */
const MUTATION = /\.\s*(create|createMany|update|updateMany|upsert|delete|deleteMany)\s*\(/g

/** [start, end) spans of every `writeTracked( … )` call, by paren matching. */
export function trackedSpans(src: string): Array<[number, number]> {
  const spans: Array<[number, number]> = []
  const re = /writeTracked\s*\(/g
  for (let m = re.exec(src); m; m = re.exec(src)) {
    let depth = 0
    let i = m.index + m[0].length - 1
    for (; i < src.length; i++) {
      if (src[i] === '(') depth++
      else if (src[i] === ')' && --depth === 0) break
    }
    spans.push([m.index, i + 1])
  }
  return spans
}

export function untrackedMutations(src: string): string[] {
  const spans = trackedSpans(src)
  const hits: string[] = []
  for (let m = MUTATION.exec(src); m; m = MUTATION.exec(src)) {
    const at = m.index
    if (!spans.some(([a, b]) => at > a && at < b)) {
      const line = src.slice(0, at).split('\n').length
      hits.push(`line ${line}: ${m[0]}`)
    }
  }
  MUTATION.lastIndex = 0
  return hits
}
