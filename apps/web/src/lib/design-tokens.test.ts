import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'

/**
 * Guard against dangling design tokens.
 *
 * An unresolvable `var()` is invalid-at-computed-value-time: the declaration
 * does NOT fall back to whatever an earlier rule set, it computes to `unset`.
 * So a reference to a deleted token is not "the old colour" — it is no colour,
 * and for some properties that means invisible. When the v1 alias layer was
 * removed, six references survived and one of them was the scrollbar thumb:
 * declaring `::-webkit-scrollbar` at all opts the element off the native
 * scrollbar, so an unresolved thumb colour left every overflow region in
 * Chromium and WebKit with a scrollbar you could not see.
 *
 * They survived because the check used to confirm the cleanup was wrong. A
 * line-based `grep -rn 'var(--color-' | grep -v -- '--color-ih-'` drops any
 * line carrying BOTH a dead token and a live one, and those lines are exactly
 * where dead tokens hide. The fix is `grep -o`, which is what this test does
 * — plus the two things grep cannot do: ignore comments, and run in CI.
 *
 * Live tokens are the `--color-ih-*` namespace. Anything else in a `var()` is
 * either a Tailwind-generated token or a mistake, so the allow-list below is
 * explicit.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..')
const TREES = ['apps/web/src', 'packages/ui/src', 'packages/domain/src']

/** Non-`ih` custom properties that are legitimately referenced. */
const ALLOWED = new Set([
  '--color-transparent',
  '--color-current',
  '--color-inherit',
])

const VAR_REF = /var\(\s*(--color-[a-z0-9-]+)/g

/** Strip block comments so documentation about the anti-pattern is not a hit. */
function stripComments(src: string, file: string): string {
  if (file.endsWith('.css')) return src.replace(/\/\*[\s\S]*?\*\//g, '')
  // JS/TS: block comments and line comments. Not a parser — good enough, and
  // it only ever removes text, so it cannot manufacture a false positive.
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
}

function sourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next' || entry === 'dist') continue
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) sourceFiles(full, acc)
    else if (/\.(css|tsx?|jsx?)$/.test(entry)) acc.push(full)
  }
  return acc
}

describe('design tokens', () => {
  test('no var() references a token outside the --color-ih- namespace', () => {
    const dangling: string[] = []

    for (const tree of TREES) {
      const abs = path.join(ROOT, tree)
      for (const file of sourceFiles(abs)) {
        const raw = readFileSync(file, 'utf8')
        const src = stripComments(raw, file)
        for (const line of src.split('\n').entries()) {
          const [i, text] = line
          for (const m of text.matchAll(VAR_REF)) {
            const token = m[1]!
            if (token.startsWith('--color-ih-') || ALLOWED.has(token)) continue
            dangling.push(`${path.relative(ROOT, file)}:${i + 1}: ${token}`)
          }
        }
      }
    }

    expect(dangling).toEqual([])
  })

  test('the ih namespace is defined in exactly one place', () => {
    const globals = readFileSync(path.join(ROOT, 'apps/web/src/app/globals.css'), 'utf8')
    const declared = new Set(
      [...globals.matchAll(/^\s*(--color-ih-[a-z0-9-]+)\s*:/gm)].map((m) => m[1]!),
    )
    // Named, not counted — a count assertion breaks every time the palette
    // grows, and a regex that silently matched nothing would still pass one.
    for (const required of [
      '--color-ih-bg',
      '--color-ih-surface',
      '--color-ih-ink',
      '--color-ih-accent',
      '--color-ih-border-strong',
      '--color-ih-navy',
    ]) {
      expect([...declared]).toContain(required)
    }

    // Every token referenced anywhere must be one of them. This is the half
    // the grep could never do: a typo like --color-ih-acent is inside the
    // namespace, passes any prefix check, and still resolves to nothing.
    const unknown: string[] = []
    for (const tree of TREES) {
      const abs = path.join(ROOT, tree)
      for (const file of sourceFiles(abs)) {
        const src = stripComments(readFileSync(file, 'utf8'), file)
        for (const m of src.matchAll(VAR_REF)) {
          const token = m[1]!
          if (!token.startsWith('--color-ih-')) continue
          if (!declared.has(token)) unknown.push(`${path.relative(ROOT, file)}: ${token}`)
        }
      }
    }
    expect([...new Set(unknown)]).toEqual([])
  })
})
