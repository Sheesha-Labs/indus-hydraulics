import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * ops-core is pure: Zod and relative imports only. No node: built-ins, no React,
 * no Prisma, no other package. Everything with I/O lives in apps/ops/src/server
 * or a package that depends on ops-core, never the other way round.
 */
const SRC = import.meta.dirname
const CORE_FOLDERS_MIN = 10

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) return files(full)
    return /\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry) ? [full] : []
  })
}

const IMPORT =
  /(?:^|\n)\s*(?:import|export)[^'"]*?from\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g

describe('ops-core purity', () => {
  const sources = files(SRC)

  it('scans the package', () => {
    expect(sources.length).toBeGreaterThan(CORE_FOLDERS_MIN)
  })

  it('imports only zod and relative paths', () => {
    const offending: string[] = []
    for (const file of sources) {
      for (const m of readFileSync(file, 'utf8').matchAll(IMPORT)) {
        const spec = m[1] ?? m[2] ?? ''
        if (spec === 'zod' || spec.startsWith('./') || spec.startsWith('../')) continue
        offending.push(`${relative(SRC, file)} imports ${spec}`)
      }
    }
    expect(offending).toEqual([])
  })
})
