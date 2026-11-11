import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'

/**
 * The admin has no monospace (owner decision, 2026-11-11). Geist everywhere;
 * small labels are Geist uppercase with tracking, numbers use `tabular-nums`.
 * See the "Admin: no monospace" block in globals.css and docs/admin-design-language.md TY-3.
 *
 * Two guards, matching the two layers of the fix:
 *  1. No admin-owned source names mono — not the `font-mono` utility, not the
 *     `.mono` class, not the token, not a literal monospace stack. A new page
 *     copied from an old storefront component is the way it would come back.
 *  2. globals.css still re-points the mono TOKEN while an admin surface is on
 *     the page, which is what turns the shared packages/ui primitives and
 *     portalled overlays to Geist.
 */

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ADMIN_TREES = ['app/admin', 'components/admin']

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.(tsx?|css)$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(full)
  }
  return out
}

/** Strip // and /* *\/ comments so prose about mono does not trip the scan. */
function code(source: string): string {
  // Keep the newlines a block comment spanned, so reported line numbers hold.
  return source.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, '')).replace(/(^|[^:])\/\/.*$/gm, '$1')
}

const BANNED: { name: string; re: RegExp }[] = [
  { name: 'font-mono utility', re: /(?<![\w-])font-mono(?![\w-])/ },
  { name: '--font-mono token', re: /--font-mono|--font-jetbrains-mono/ },
  { name: 'monospace stack', re: /\bmonospace\b|JetBrains/ },
]

describe('admin has no monospace', () => {
  const files = ADMIN_TREES.flatMap((t) => walk(path.join(SRC, t)))

  test('scans the admin trees', () => {
    expect(files.length).toBeGreaterThan(100)
  })

  test('no admin source names a mono font', () => {
    const hits: string[] = []
    for (const file of files) {
      const lines = code(readFileSync(file, 'utf8')).split('\n')
      lines.forEach((line, i) => {
        const where = `${path.relative(SRC, file)}:${i + 1}`
        for (const { name, re } of BANNED) {
          if (re.test(line)) hits.push(`${where} ${name}: ${line.trim().slice(0, 120)}`)
        }
        // The .mono class: a bare `mono` token inside a string literal. A
        // `mono` prop or variable outside quotes is not a class.
        for (const [, body] of line.matchAll(/(["'`])((?:(?!\1).)*)\1/g)) {
          if (/(^|\s)mono(\s|$)/.test(body ?? '')) hits.push(`${where} .mono class: ${line.trim().slice(0, 120)}`)
        }
      })
    }
    expect(hits, `Use Geist + tabular-nums in the admin, never mono:\n${hits.join('\n')}`).toEqual([])
  })

  test('globals.css re-points the mono token on admin pages', () => {
    const css = readFileSync(path.join(SRC, 'app/globals.css'), 'utf8')
    expect(css).toMatch(/:root:has\(\[data-surface='admin'\]\)\s*\{[^}]*--font-mono:\s*var\(--font-sans\)/)
    expect(css).toMatch(/:root:has\(\[data-surface='admin'\]\)\s*\{[^}]*--default-mono-font-family:\s*var\(--font-sans\)/)
  })
})
