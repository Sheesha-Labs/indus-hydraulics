import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'

/**
 * Guard against form labels that name nothing.
 *
 * A `<label>` associates with a control in exactly two ways: it carries an
 * `htmlFor` matching the control's `id`, or it WRAPS the control. A label that
 * does neither is a styled string. Clicking it focuses nothing, and a screen
 * reader announces the field with no name at all — the user hears "edit text"
 * and has to guess.
 *
 * Nothing catches this. It compiles, it renders, and it is invisible in a
 * screenshot: the caption sits above the input looking exactly like a working
 * label. That is how ~150 of them accumulated across the storefront and the
 * console while every visual review passed.
 *
 * The structural fix is the `Field` primitive in packages/ui, which generates
 * the id and wires the label, the hint and the error together so association
 * is the default rather than something each caller has to remember. This scan
 * is the backstop for markup that does not go through it.
 *
 * SCOPE: the whole app — storefront and console — is held at zero.
 */

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Files with known-orphaned labels, pending conversion.
 *
 * EMPTY, and it should stay that way. Counts are exact, so a listed file
 * cannot quietly get worse and a fixed file cannot be left stale — the third
 * test fails if an entry claims more orphans than the file actually has.
 * Shrink this list; never add to it.
 */
const ALLOWED: Record<string, number> = {}

/** Anything that puts a control inside the label satisfies the association. */
const CONTROL = /<(input|textarea|select|Input|Textarea|Select|Checkbox)\b/

/**
 * A label that renders `{children}` (or any single JSX expression as its
 * control slot) is the wrapping idiom — the caller passes the control in, so
 * it IS a descendant at runtime even though no control tag appears in this
 * file. The console has ~11 of these and they are all correct.
 *
 * Whether an arbitrary expression renders a control cannot be decided
 * statically, so the scan declines to judge these rather than guessing. What
 * it still catches is the literal-sibling case — a `<label>` and a control
 * side by side — which is the shape that actually accumulated ~150 times.
 */
const RENDERS_CHILDREN = /\{\s*(children|control|field|input)\s*\}/

function sourceFiles(dir = SRC, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next') continue
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) sourceFiles(full, acc)
    else if (entry.endsWith('.tsx')) acc.push(path.relative(SRC, full))
  }
  return acc
}

function orphanedLabels(rel: string): number[] {
  const src = readFileSync(path.join(SRC, rel), 'utf8')
  const lines: number[] = []

  for (let i = src.indexOf('<label'); i !== -1; i = src.indexOf('<label', i + 1)) {
    const close = src.indexOf('</label>', i)
    if (close === -1) continue
    const body = src.slice(i, close)
    const headEnd = body.indexOf('>')
    const head = headEnd === -1 ? body : body.slice(0, headEnd + 1)

    if (head.includes('htmlFor')) continue
    if (CONTROL.test(body)) continue // wrapping label — implicitly associated
    if (RENDERS_CHILDREN.test(body)) continue // control arrives via props
    lines.push(src.slice(0, i).split('\n').length)
  }
  return lines
}

describe('every form label names a control', () => {
  const counts = new Map<string, number[]>()
  for (const rel of sourceFiles()) {
    if (rel.endsWith('.test.tsx')) continue
    const hits = orphanedLabels(rel)
    if (hits.length > 0) counts.set(rel.split(path.sep).join('/'), hits)
  }

  test('no customer-facing label is orphaned', () => {
    const offenders = [...counts.entries()]
      .filter(([rel]) => !(rel in ALLOWED))
      .map(([rel, lines]) => `${rel}: ${lines.join(', ')}`)
      .sort()

    expect(offenders).toEqual([])
  })

  test('the console backlog only ever shrinks', () => {
    const regressions: string[] = []
    for (const [rel, expected] of Object.entries(ALLOWED)) {
      const actual = counts.get(rel)?.length ?? 0
      if (actual > expected) {
        regressions.push(`${rel}: ${actual} orphaned labels, was ${expected}`)
      }
    }
    expect(regressions).toEqual([])
  })

  test('a fixed file is removed from the backlog rather than left stale', () => {
    const stale = Object.entries(ALLOWED)
      .filter(([rel, expected]) => (counts.get(rel)?.length ?? 0) < expected)
      .map(([rel, expected]) => `${rel}: now ${counts.get(rel)?.length ?? 0}, listed as ${expected}`)

    expect(stale).toEqual([])
  })
})
