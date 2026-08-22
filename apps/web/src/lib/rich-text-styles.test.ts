import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'

/**
 * Guard the styling of HTML that comes out of the database.
 *
 * Product long descriptions and legacy blog bodies are stored as HTML and
 * rendered with `dangerouslySetInnerHTML`. Both were styled with `prose
 * prose-sm prose-headings:…` — and every one of those class names compiled to
 * NOTHING. `@tailwindcss/typography` is not a dependency, globals.css declares
 * no `@plugin`, and there is no tailwind.config. Tailwind's preflight does
 * apply, so headings lost their size and lists lost their markers: ~1,100
 * product descriptions and every legacy post rendered as flat, unmarked text.
 *
 * Nothing caught it. `prose` is a valid string, so typecheck passes; it is a
 * plausible class name, so lint passes; no test rendered the markup. It was
 * only visible by looking. These are the two checks that would have.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..')
const GLOBALS = path.join(ROOT, 'apps/web/src/app/globals.css')

/** Is the Tailwind Typography plugin actually wired up? */
function typographyIsInstalled(): boolean {
  const css = readFileSync(GLOBALS, 'utf8')
  if (/@plugin\s+["'][^"']*typography/.test(css)) return true
  const pkg = JSON.parse(readFileSync(path.join(ROOT, 'apps/web/package.json'), 'utf8')) as {
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
  }
  return Boolean(
    pkg.dependencies?.['@tailwindcss/typography'] ?? pkg.devDependencies?.['@tailwindcss/typography'],
  )
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next') continue
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.tsx$/.test(entry)) out.push(full)
  }
  return out
}

describe('CMS-authored HTML has real styles', () => {
  test('nothing renders stored HTML with the dead `prose` classes', () => {
    if (typographyIsInstalled()) return // the classes would be real; nothing to guard

    const offenders: string[] = []
    for (const file of walk(path.join(ROOT, 'apps/web/src'))) {
      const src = readFileSync(file, 'utf8')
      if (!src.includes('dangerouslySetInnerHTML')) continue
      // Only className strings, so a comment explaining this trap is not a hit.
      for (const match of src.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g)) {
        const value = match[1] ?? match[2] ?? ''
        if (/(^|\s)prose(\s|-|$)/.test(value)) {
          offenders.push(path.relative(ROOT, file))
          break
        }
      }
    }
    expect(
      offenders,
      '`prose` compiles to no CSS without @tailwindcss/typography — use `ih-rich-text`',
    ).toEqual([])
  })

  test('globals.css styles every element stored HTML actually contains', () => {
    const css = readFileSync(GLOBALS, 'utf8')
    // The tags the ferrule importer and the existing product descriptions emit.
    // A missing rule here is invisible: the element renders, preflight-reset.
    const required = [
      '.ih-rich-text p',
      '.ih-rich-text strong',
      '.ih-rich-text h3',
      '.ih-rich-text ul',
      '.ih-rich-text ol',
      '.ih-rich-text li',
      '.ih-rich-text table',
      '.ih-rich-text caption',
      '.ih-rich-text thead th',
      '.ih-rich-text .ih-table-scroll',
    ]
    for (const selector of required) {
      expect(css, `globals.css has no rule for ${selector}`).toContain(selector)
    }
  })

  test('the table rail can actually clip', () => {
    // overflow-x on the rail does nothing unless the rich-text block itself
    // carries min-width: 0 — as a grid/flex item it defaults to min-content,
    // and the page scrolls sideways instead of the table.
    const css = readFileSync(GLOBALS, 'utf8')
    const block = css.slice(css.indexOf('.ih-rich-text {'))
    expect(block.slice(0, block.indexOf('}'))).toContain('min-width: 0')
    expect(css).toMatch(/\.ih-rich-text \.ih-table-scroll \{[^}]*overflow-x:\s*auto/)
  })
})
