import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * ops-pdf guards (S11-T02): render only, colours only from the generated tokens.pdf.ts, and imports limited to
 * @indus/ops-core, @react-pdf/renderer, react and node built-ins (CLAUDE.md §3: never ops-ui, ops-db, the
 * website's @indus/pdf or a storage client).
 */
const SRC = join(import.meta.dirname)

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n)
    return statSync(p).isDirectory() ? files(p) : /\.(ts|tsx)$/.test(n) ? [p] : []
  })
}

const sources = files(SRC).filter((f) => !/\.test\.tsx?$/.test(f))

describe('ops-pdf guards', () => {
  it('no colour literal outside tokens.pdf.ts', () => {
    const hits = sources
      .filter((f) => !f.endsWith('tokens.pdf.ts'))
      .flatMap((f) =>
        readFileSync(f, 'utf8')
          .split('\n')
          .map((l, i) => [l, i] as const)
          .filter(
            ([l]) => /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|oklch\(/i.test(l) && !/^\s*(\*|\/\/)/.test(l)
          )
          .map(([, i]) => `${relative(SRC, f)}:${i + 1}`)
      )
    expect(hits).toEqual([])
  })

  it('imports only ops-core, @react-pdf, react and node built-ins', () => {
    const allowed =
      /^(@indus\/ops-core(\/.*)?|@react-pdf\/renderer|react|node:[a-z/]+|\.{1,2}\/.*)$/
    const bad = sources.flatMap((f) =>
      [
        ...readFileSync(f, 'utf8').matchAll(
          /from\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g
        ),
      ]
        .map((m) => m[1] ?? m[2]!)
        .filter((spec) => !allowed.test(spec))
        .map((spec) => `${relative(SRC, f)}: ${spec}`)
    )
    expect(bad).toEqual([])
  })
})
