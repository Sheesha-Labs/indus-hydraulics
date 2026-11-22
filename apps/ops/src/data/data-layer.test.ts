import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * The data-layer boundary (05-map-frontend §7.1, apps/ops/CLAUDE.md §6.1 and §6.5), as a static
 * scan so it fails the build rather than a review:
 *
 *   1. every module in src/data starts with `import 'server-only'`, so no data function can be
 *      bundled into a client component;
 *   2. nothing under src/app, src/components or packages/ops-ui imports @indus/ops-db: pages and
 *      route handlers read through src/data (and write through defineAction), and the component
 *      kits never see Prisma.
 */

const APP = resolve(import.meta.dirname, '..', '..')
const REPO = resolve(APP, '..', '..')
const SOURCE = /\.(ts|tsx|mts|cts)$/

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
    return statSync(path).isDirectory() ? files(path) : SOURCE.test(name) ? [path] : []
  })
}

/** The source with comments removed, so a commented-out import neither counts nor hides one. */
function code(path: string): string {
  return readFileSync(path, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

const IMPORTS_OPS_DB =
  /(?:\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*|^\s*import\s+)['"]@indus\/ops-db(?:\/[^'"]*)?['"]/m

describe('data layer', () => {
  const dataFiles = files(join(APP, 'src', 'data')).filter((f) => !/\.test\.tsx?$/.test(f))

  it('has data modules to check', () => {
    expect(dataFiles.length).toBeGreaterThan(0)
  })

  it("starts every src/data module with import 'server-only'", () => {
    const missing = dataFiles
      .filter((f) => !/^\s*import\s+['"]server-only['"];?\s*$/m.test(code(f).trimStart().split('\n')[0] ?? ''))
      .map((f) => relative(APP, f))
    expect(missing).toEqual([])
  })

  it('keeps @indus/ops-db out of src/app, src/components and packages/ops-ui', () => {
    const scanned = [
      ...files(join(APP, 'src', 'app')),
      ...files(join(APP, 'src', 'components')),
      ...files(join(REPO, 'packages', 'ops-ui', 'src')),
    ]
    expect(scanned.length).toBeGreaterThan(0)
    const offenders = scanned.filter((f) => IMPORTS_OPS_DB.test(code(f))).map((f) => relative(REPO, f))
    expect(offenders).toEqual([])
  })

  it('recognises every import form it is meant to catch', () => {
    for (const line of [
      "import { opsDb } from '@indus/ops-db'",
      "import type { Prisma } from '@indus/ops-db'",
      "export { opsDb } from '@indus/ops-db'",
      "const m = await import('@indus/ops-db')",
      "import '@indus/ops-db'",
      'import { x } from "@indus/ops-db/src/index"',
    ]) {
      expect(IMPORTS_OPS_DB.test(line)).toBe(true)
    }
    expect(IMPORTS_OPS_DB.test("import { opsDb } from '../data/health'")).toBe(false)
  })
})
