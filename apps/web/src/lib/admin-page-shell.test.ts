import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'

/**
 * Every admin page renders the 60px bar.
 *
 * The bar used to live in `(shell)/layout.tsx`, which made it impossible for a
 * page to forget. v2 fills it with the page's own title, subtitle and actions,
 * so the page has to render it — and "a page can forget" comes back. Six pages
 * once shipped with no bar at all, which is exactly what moved it into the
 * layout in the first place.
 *
 * This is what replaces that guarantee, and it is the stronger of the two: a
 * missing bar fails CI instead of waiting for someone to notice. Nothing else
 * catches it — a page without a shell type-checks, lints, builds and renders;
 * its content just starts flush against the top of the column.
 *
 * A page is covered if it renders AdminPageShell itself, or if an ancestor
 * layout does (the SEO tree, where one layout owns the bar for 18 routes).
 */

const SHELL = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../app/admin/(shell)',
)

/**
 * Pages whose header has not been hoisted yet.
 *
 * Each is a page that still paints its own h1 in the body, so it currently
 * renders with NO bar. They are listed rather than silently skipped: the list
 * is asserted to be exact, so it can only shrink, and a page cannot be added
 * to it without editing this file.
 */
const PENDING = new Set<string>([])

/** Pure `redirect()` stubs — no JSX at all, so there is nothing to render. */
const REDIRECT_STUBS = new Set(['seo/page.tsx', 'seo/search/page.tsx'])

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, acc)
    else if (entry === 'page.tsx') acc.push(path.relative(SHELL, full).split(path.sep).join('/'))
  }
  return acc
}

/**
 * Strip comments before looking for the component.
 *
 * A plain substring check matched the WORD in `(shell)/layout.tsx`'s comment
 * explaining why the layout no longer renders a bar — so every page reported
 * as covered by a layout that renders nothing.
 */
function rendersShell(file: string): boolean {
  let src: string
  try {
    src = readFileSync(file, 'utf8')
  } catch {
    return false
  }
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
  return /<AdminPageShell[\s>]/.test(code)
}

/**
 * Components the page imports from its own directory.
 *
 * The editor pages keep their header in a 'use client' child, because it
 * carries `savedAt` — client state bumped by the editor's own child tabs.
 * Hoisting that to the server page would sever the indicator from every
 * writer, so the child renders the shell and the page renders the child.
 * One level is enough for every case here and keeps the rule easy to reason
 * about.
 */
function localChildren(rel: string): string[] {
  const file = path.join(SHELL, rel)
  let src: string
  try {
    src = readFileSync(file, 'utf8')
  } catch {
    return []
  }
  const dir = path.dirname(file)
  const out: string[] = []
  for (const m of src.matchAll(/from\s+'(\.\/[^']+)'/g)) {
    out.push(path.join(dir, `${m[1]!}.tsx`))
  }
  return out
}

/** True when this page, a local child it renders, or a layout above it, renders the shell. */
function covered(rel: string): boolean {
  if (rendersShell(path.join(SHELL, rel))) return true
  if (localChildren(rel).some(rendersShell)) return true

  let dir = path.dirname(rel)
  for (;;) {
    const layout = path.join(SHELL, dir === '.' ? '' : dir, 'layout.tsx')
    if (rendersShell(layout)) return true
    if (dir === '.' || dir === '') return false
    dir = path.dirname(dir)
  }
}

const pages = walk(SHELL)

describe('admin page shell', () => {
  test('the scan actually found the admin pages', () => {
    // Without this, a wrong SHELL path makes every assertion below pass on an
    // empty list.
    expect(pages.length).toBeGreaterThan(40)
  })

  test('every page renders the 60px bar, itself or via a layout', () => {
    const missing = pages
      .filter((rel) => !REDIRECT_STUBS.has(rel) && !PENDING.has(rel))
      .filter((rel) => !covered(rel))
      .sort()

    expect(missing).toEqual([])
  })

  test('the pending list only ever shrinks', () => {
    // A page that has been converted must be removed from PENDING, or the list
    // rots into a permanent exemption.
    const stale = [...PENDING].filter((rel) => pages.includes(rel) && covered(rel)).sort()
    expect(stale).toEqual([])
  })

  test('PENDING and REDIRECT_STUBS name real pages', () => {
    const ghosts = [...PENDING, ...REDIRECT_STUBS].filter((rel) => !pages.includes(rel)).sort()
    expect(ghosts).toEqual([])
  })

  test('the old AdminTopbar is gone', () => {
    // It rendered breadcrumbs v2 removes, a search box that was a plain <div>
    // with no input, and Help/Notifications buttons wired to nothing.
    const legacy = path.resolve(SHELL, '../../../components/admin/AdminTopbar.tsx')
    expect(() => readFileSync(legacy, 'utf8')).toThrow()
  })
})
