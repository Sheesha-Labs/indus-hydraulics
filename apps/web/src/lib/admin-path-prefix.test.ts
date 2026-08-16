import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'

/**
 * Guard against un-prefixed admin paths.
 *
 * Every admin route lives under `/admin`. A missed prefix does not fail to
 * compile and does not throw — while admin is its own deployment it produces a
 * loud 404, but once the two apps share an origin it silently lands the user
 * on a *storefront* page. `revalidatePath('/products')` is worse still: it
 * quietly purges the public catalogue route instead of the admin list, and
 * nothing anywhere reports it.
 *
 * This scan is the mechanical backstop for the ~250 path literals rewritten in
 * the move. It is deliberately dumb: any absolute path literal whose first
 * segment is a known admin section must start with `/admin`.
 *
 * Scoped to ADMIN-OWNED trees only. Now that both surfaces live in one app,
 * `/brands` and `/industries` are legitimate *storefront* routes that happen
 * to share a name with an admin section — scanning storefront files would
 * flag every one of them.
 */

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** Trees whose path literals must be /admin-prefixed. */
const ADMIN_TREES = ['app/admin', 'components/admin', 'inngest']

/** Top-level admin sections. A path starting with one of these belongs to admin. */
const ADMIN_SECTIONS = [
  'products', 'categories', 'brands', 'industries', 'media', 'scraper', 'rfqs',
  'customers', 'cms', 'navigation', 'seo', 'users', 'settings', 'spec-templates',
]

/**
 * Storefront paths the admin legitimately targets — these must NOT be prefixed.
 * `revalidatePath('/blog/x')` and `revalidatePath('/p/x')` purge public routes
 * on purpose, and they only started working once the apps shared a cache.
 */
const STOREFRONT_ALLOWLIST = [/^\/p\//, /^\/blog\//, /^\/c\//, /^\/services\//, /^\/quote\//]

const SECTION_RE = new RegExp(`^/(${ADMIN_SECTIONS.join('|')})(/|$)`)

const IGNORED_DIRS = new Set(['node_modules', '.next', 'dist', '.turbo'])

/** Every .ts/.tsx under the admin-owned trees, relative to src/. */
function sourceFiles(): string[] {
  const out: string[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      if (IGNORED_DIRS.has(entry)) continue
      const full = path.join(dir, entry)
      if (statSync(full).isDirectory()) walk(full)
      else if (/\.tsx?$/.test(entry)) out.push(path.relative(SRC, full))
    }
  }
  for (const tree of ADMIN_TREES) walk(path.join(SRC, tree))
  return out
}

type Hit = { file: string; line: number; text: string }

/** Prose in comments mentions these paths on purpose — scan code only. */
function isComment(line: string): boolean {
  const t = line.trim()
  return t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')
}

function scan(pattern: RegExp): Hit[] {
  const hits: Hit[] = []
  const files = sourceFiles().filter((f) => !f.endsWith('.test.ts') && !f.endsWith('.test.tsx'))

  for (const rel of files) {
    const lines = readFileSync(path.join(SRC, rel), 'utf8').split('\n')
    lines.forEach((line, i) => {
      if (isComment(line)) return
      for (const m of line.matchAll(pattern)) {
        const value = m[1]
        if (!value?.startsWith('/')) continue
        if (STOREFRONT_ALLOWLIST.some((re) => re.test(value))) continue
        if (!SECTION_RE.test(value)) continue
        if (value.startsWith('/admin/')) continue
        hits.push({ file: rel, line: i + 1, text: line.trim() })
      }
    })
  }
  return hits
}

const format = (hits: Hit[]) => hits.map((h) => `${h.file}:${h.line}: ${h.text}`).join('\n')

/**
 * Dynamically-built paths.
 *
 * The literal scan above cannot see `href={`/${path}`}` — the captured value
 * is the source text `/${path}`, which matches no section name. AdminSidebar
 * built every primary nav link exactly that way from a data table, so all of
 * them pointed at the storefront and this file reported clean the whole time.
 *
 * Any absolute path interpolated inside an admin tree must start from the
 * ADMIN_PREFIX constant rather than a bare slash.
 */
function scanInterpolated(): Hit[] {
  const hits: Hit[] = []
  const files = sourceFiles().filter((f) => !f.endsWith('.test.ts') && !f.endsWith('.test.tsx'))
  const RE = /(?:href|action)=\{?\s*(?:[^`'"]*\?\s*)?`\/\$\{/g

  for (const rel of files) {
    const lines = readFileSync(path.join(SRC, rel), 'utf8').split('\n')
    lines.forEach((line, i) => {
      if (isComment(line)) return
      if (RE.test(line)) hits.push({ file: rel, line: i + 1, text: line.trim() })
      RE.lastIndex = 0
    })
  }
  return hits
}

/**
 * Template-literal paths.
 *
 * The scans above see quoted string literals and JSX `href={`/${x}`}`. They do
 * NOT see a backtick path whose first segment is a real admin section:
 *
 *     return `/products${qs ? `?${qs}` : ''}`      // filter + pagination URLs
 *     href: `/rfqs`                                 // dashboard quick link
 *     `/customers/${id}?tab=${t}`                   // account detail tabs
 *
 * Every one of those shipped. They do not 404 now that one app serves both
 * surfaces — they navigate OUT of the console onto a storefront route, so the
 * admin's own filters, pagination, tab strips and dashboard shortcuts quietly
 * dropped the user on the public site.
 *
 * Storefront paths built the same way are legitimate: the navigation editor
 * shows `/brands/${slug}` as a PREVIEW of where a public menu item points.
 * Those live in the files listed in STOREFRONT_LINK_FILES.
 */
const STOREFRONT_LINK_FILES = new Set([
  // Menu items point at public routes by design; the admin only previews them.
  'app/admin/(shell)/navigation/actions.ts',
  'app/admin/(shell)/navigation/[menuSlug]/page.tsx',
])

function scanTemplateLiterals(): Hit[] {
  const hits: Hit[] = []
  const files = sourceFiles().filter(
    (f) =>
      !f.endsWith('.test.ts') &&
      !f.endsWith('.test.tsx') &&
      !STOREFRONT_LINK_FILES.has(f.split(path.sep).join('/')),
  )
  const RE = /`\/([a-z][a-z0-9-]*)(?=[`/$?])/g

  for (const rel of files) {
    const lines = readFileSync(path.join(SRC, rel), 'utf8').split('\n')
    lines.forEach((line, i) => {
      if (isComment(line)) return
      for (const m of line.matchAll(RE)) {
        const first = m[1]!
        if (!ADMIN_SECTIONS.includes(first)) continue
        hits.push({ file: rel, line: i + 1, text: line.trim() })
      }
    })
  }
  return hits
}

describe('admin paths carry the /admin prefix', () => {
  test('a template-literal path starts from ADMIN_PREFIX, not a bare slash', () => {
    expect(format(scanTemplateLiterals())).toBe('')
  })

  test('an interpolated href/action starts from ADMIN_PREFIX, not a bare slash', () => {
    expect(format(scanInterpolated())).toBe('')
  })

  test('revalidatePath targets an admin route, not the storefront equivalent', () => {
    expect(format(scan(/revalidatePath\(\s*[`'"]([^`'"]+)/g))).toBe('')
  })

  test('redirect() targets an admin route', () => {
    expect(format(scan(/redirect\(\s*[`'"]([^`'"]+)/g))).toBe('')
  })

  test('router.push() targets an admin route', () => {
    expect(format(scan(/router\.push\(\s*[`'"]([^`'"]+)/g))).toBe('')
  })

  test('href targets an admin route', () => {
    expect(format(scan(/href=\{?\s*[`'"]([^`'"]+)/g))).toBe('')
  })

  test('no protocol-relative revalidatePath survives', () => {
    // 23 of these shipped for months as silent no-ops: `//products` is a
    // protocol-relative URL and matches no route at all. They were a
    // half-applied prefix migration with the slot left empty.
    const files = sourceFiles()
    const bad: string[] = []
    for (const rel of files) {
      readFileSync(path.join(SRC, rel), 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (isComment(line)) return
          if (/revalidatePath\(\s*[`'"]\/\//.test(line)) bad.push(`${rel}:${i + 1}: ${line.trim()}`)
        })
    }
    expect(bad.join('\n')).toBe('')
  })
})
