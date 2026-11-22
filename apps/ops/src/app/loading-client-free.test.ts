import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * CSP guard (S02-T09). Next 16.2 renders the client chunks of a segment's `loading.tsx` and
 * `template.tsx` as server-rendered `<script src async>` tags WITHOUT the request's nonce
 * (next/dist/server/app-render/create-component-styles-and-scripts.js; layouts and pages go through
 * get-layer-assets.js, which does add it). Under `script-src 'nonce-…' 'strict-dynamic'` the browser
 * refuses each such tag and logs a CSP violation on every page under that boundary.
 *
 * A boundary only gets client chunks when its module graph reaches a `'use client'` module, so the
 * rule is: no loading.tsx or template.tsx under src/app may reach one, not even through a kit barrel
 * (`@indus/ops-ui/table` re-exports DataTableClient, which is how /today got the table's chunk).
 * The static walk below follows relative imports and `@indus/*` workspace exports; third-party
 * packages are not followed. The e2e twin, tests/e2e/csp.spec.ts, checks the rendered HTML.
 */

const APP = resolve(import.meta.dirname, '..', '..')
const REPO = resolve(APP, '..', '..')
const BOUNDARY = /^(loading|template)\.(tsx|ts|jsx|js)$/
const EXTS = ['', '.tsx', '.ts', '/index.tsx', '/index.ts']

function boundaries(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return boundaries(path)
    return BOUNDARY.test(name) ? [path] : []
  })
}

/** The source with comments removed, so a commented-out import neither counts nor hides one. */
function code(path: string): string {
  return readFileSync(path, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

function isClient(path: string): boolean {
  return /^\s*['"]use client['"]/.test(code(path))
}

/** Value imports and re-exports (type-only ones create no client reference). */
function specifiers(path: string): string[] {
  const out: string[] = []
  const src = code(path)
  const re = /(?:^|\n)\s*(import|export)\s+(type\s+)?(?:[^'"]*?\sfrom\s+)?['"]([^'"]+)['"]/g
  for (const m of src.matchAll(re)) if (!m[2]) out.push(m[3]!)
  return out
}

function firstFile(base: string): string | null {
  for (const ext of EXTS) {
    const p = base + ext
    if (existsSync(p) && statSync(p).isFile()) return p
  }
  return null
}

const exportsCache = new Map<string, Record<string, string>>()
function workspaceExport(spec: string): string | null {
  const m = /^@indus\/([^/]+)(\/.*)?$/.exec(spec)
  if (!m) return null
  const pkgDir = join(REPO, 'packages', m[1]!)
  if (!existsSync(join(pkgDir, 'package.json'))) return null
  let map = exportsCache.get(pkgDir)
  if (!map) {
    const pkg = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8')) as {
      exports?: Record<string, string>
      main?: string
    }
    map = pkg.exports ?? { '.': pkg.main ?? './src/index.ts' }
    exportsCache.set(pkgDir, map)
  }
  const sub = `.${m[2] ?? ''}`
  const target = map[sub]
  if (target) return resolve(pkgDir, target)
  for (const [key, value] of Object.entries(map)) {
    if (!key.endsWith('/*')) continue
    const prefix = key.slice(0, -1)
    if (sub.startsWith(prefix))
      return firstFile(resolve(pkgDir, value.replace('*', sub.slice(prefix.length))))
  }
  return null
}

function resolveSpec(from: string, spec: string): string | null {
  if (spec.startsWith('.')) return firstFile(resolve(dirname(from), spec))
  if (spec.startsWith('@indus/')) return workspaceExport(spec)
  return null
}

/** The first `'use client'` module the file reaches, as a chain of paths, or null. */
function clientChain(entry: string): string[] | null {
  const seen = new Set<string>()
  const walk = (file: string, chain: string[]): string[] | null => {
    if (seen.has(file)) return null
    seen.add(file)
    if (!/\.(tsx?|jsx?)$/.test(file)) return null
    if (isClient(file)) return [...chain, file]
    for (const spec of specifiers(file)) {
      const next = resolveSpec(file, spec)
      if (next) {
        const hit = walk(next, [...chain, file])
        if (hit) return hit
      }
    }
    return null
  }
  return walk(entry, [])
}

describe('loading and template boundaries reach no client module (CSP nonce)', () => {
  const files = boundaries(join(APP, 'src', 'app'))

  it('has boundaries to check', () => {
    expect(files.length).toBeGreaterThan(50)
  })

  it('every loading.tsx / template.tsx stays server-only all the way down', () => {
    const offenders = files.flatMap((f) => {
      const chain = clientChain(f)
      return chain ? [chain.map((p) => relative(REPO, p)).join(' → ')] : []
    })
    expect(offenders).toEqual([])
  })

  it('catches a boundary that imports through a barrel holding a client part', () => {
    // The regression this guard exists for: the table barrel re-exports DataTableClient.
    const barrel = workspaceExport('@indus/ops-ui/table')!
    const chain = clientChain(barrel)
    expect(chain?.at(-1)).toMatch(/DataTableClient\.tsx$/)
    const skeleton = workspaceExport('@indus/ops-ui/table/skeleton')!
    expect(clientChain(skeleton)).toBeNull()
  })
})
