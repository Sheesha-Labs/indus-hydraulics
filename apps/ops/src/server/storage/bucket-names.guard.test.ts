import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { OPS_BUCKET_NAMES, STOREFRONT_BUCKETS } from './buckets'

/**
 * Bucket-name guard (S03-T05, ADR-21): `server/storage/buckets.ts` is the only place an Ops bucket is
 * named. Fails the build on
 *   1. a string literal passed to `storage.from(…)` / `.storage.from(…)` (use `OPS_BUCKETS.<x>`);
 *   2. an Ops bucket name written as a string literal anywhere else;
 *   3. a storefront bucket name (Ops never touches the website's buckets): the hyphenated ones anywhere,
 *      and `quotes` on any line that mentions a bucket or storage (it is also an ordinary route word).
 * Scans apps/ops/src and apps/ops/scripts, excluding buckets.ts itself; tests may name buckets in their
 * assertions (rules 2 and 3), never in a storage.from() call (rule 1).
 */

const APP = resolve(import.meta.dirname, '..', '..', '..')
const ROOTS = [join(APP, 'src'), join(APP, 'scripts')]
const SELF = new Set([
  resolve(import.meta.dirname, 'buckets.ts'),
  resolve(import.meta.dirname, 'bucket-names.guard.test.ts'),
])

function files(dir: string): string[] {
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return []
  }
  return entries.flatMap((name) => {
    if (name === 'node_modules' || name.startsWith('.')) return []
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return files(path)
    return /\.(ts|tsx|mts|cts)$/.test(name) && !SELF.has(path) ? [path] : []
  })
}

const ALL = ROOTS.flatMap((r) => files(r)).map((path) => ({
  path: relative(APP, path),
  text: readFileSync(path, 'utf8'),
}))
/** Code that ships: tests excluded (they assert names). */
const SOURCES = ALL.filter((s) => !/\.test\.tsx?$/.test(s.path))

const literal = (name: string) => new RegExp(`(['"\`])${name.replace(/-/g, '\\-')}\\1`)

describe('bucket names (ADR-21)', () => {
  it('scans the app', () => {
    expect(SOURCES.length).toBeGreaterThan(100)
  })

  it('no string literal is passed to storage.from()', () => {
    const hits = ALL.filter(
      (s) => /\.from\(\s*['"`]/.test(s.text) && /storage/.test(s.text)
    ).flatMap((s) =>
      s.text
        .split('\n')
        .map((line, i) => ({ line, i }))
        .filter(({ line }) => /storage\s*\.from\(\s*['"`]|\bfrom\(\s*['"`]ops-/.test(line))
        .map(({ i }) => `${s.path}:${i + 1}`)
    )
    expect(hits).toEqual([])
  })

  it('Ops bucket names appear only in buckets.ts', () => {
    const hits = SOURCES.flatMap((s) =>
      OPS_BUCKET_NAMES.filter((n) => literal(n).test(s.text)).map((n) => `${s.path}: ${n}`)
    )
    expect(hits).toEqual([])
  })

  it('no storefront bucket name in Ops code', () => {
    const hits = SOURCES.flatMap((s) =>
      s.text
        .split('\n')
        .flatMap((line, i) =>
          STOREFRONT_BUCKETS.filter(
            (n) => literal(n).test(line) && (n.includes('-') || /bucket|storage/i.test(line))
          ).map((n) => `${s.path}:${i + 1}: ${n}`)
        )
    )
    expect(hits).toEqual([])
  })

  it('the rules catch what they are for', () => {
    expect(literal('ops-company').test(`storage.from('ops-company')`)).toBe(true)
    expect(literal('ops-mail').test(`mkdtemp('ops-mail-sink-')`)).toBe(false)
    expect(literal('quotes').test(`const b = "quotes"`)).toBe(true)
  })
})
