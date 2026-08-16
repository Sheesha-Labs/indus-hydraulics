import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'

/**
 * Every module with a top-level `'use server'` directive may export async
 * functions and nothing else.
 *
 * This is not a style rule. React validates it when the module is first
 * evaluated — which for a Server Action is the first time a visitor submits
 * the form, NOT at build or deploy time. `apps/web/src/app/admin/forgot-password/actions.ts`
 * exported one string constant alongside its action, and the result was that
 * every staff password reset in production died on
 * `A "use server" file can only export async functions, found string.`
 * with a 500 and the generic global-error page. Typecheck, lint and the whole
 * test suite were green throughout, and the page itself rendered fine — only
 * pressing the button failed.
 *
 * Constants and types that the client component needs belong in a plain
 * sibling module (see forgot-password/copy.ts).
 */

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next') continue
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.tsx?$/.test(entry)) out.push(full)
  }
  return out
}

/**
 * True only for a FILE-level directive. `'use server'` inside a function body
 * marks a single inline action and puts no constraint on the module's exports,
 * so the directive has to be the first statement to count.
 */
function isUseServerModule(src: string): boolean {
  const head = src
    // Strip leading block comments, line comments and blank lines.
    .replace(/^(\s*(\/\*[\s\S]*?\*\/|\/\/[^\n]*)\s*)*/, '')
    .trimStart()
  return head.startsWith(`'use server'`) || head.startsWith(`"use server"`)
}

/** Exported names that are not `async function` declarations. */
function illegalExports(src: string): string[] {
  const bad: string[] = []
  const lines = src.split('\n')

  for (const line of lines) {
    // Only top-level exports — anything indented is inside a block and cannot
    // be a module export.
    if (!line.startsWith('export')) continue

    // Legal: async function declarations, in either form.
    if (/^export\s+async\s+function\s/.test(line)) continue
    if (/^export\s+default\s+async\s+function\s/.test(line)) continue

    // Erased before the module ever runs, so React never sees them.
    if (/^export\s+(type|interface)\s/.test(line)) continue
    if (/^export\s+type\s*\{/.test(line)) continue

    bad.push(line.trim())
  }
  return bad
}

const offenders = walk(SRC)
  .map((file) => ({ file, src: readFileSync(file, 'utf8') }))
  .filter(({ src }) => isUseServerModule(src))
  .map(({ file, src }) => ({ file: path.relative(SRC, file), bad: illegalExports(src) }))
  .filter(({ bad }) => bad.length > 0)

describe(`'use server' modules`, () => {
  test('export async functions and nothing else', () => {
    expect(
      offenders.map((o) => `${o.file}: ${o.bad.join(' | ')}`),
      'move constants and types to a plain sibling module',
    ).toEqual([])
  })
})
