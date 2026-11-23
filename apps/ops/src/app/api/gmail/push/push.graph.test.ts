import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * ADR-04: the push route never touches the database. Walk its import graph (relative imports, transitively)
 * and fail if any module in it imports @indus/ops-db or Prisma.
 */
function resolveImport(from: string, spec: string): string | null {
  const base = resolve(dirname(from), spec)
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, join(base, 'index.ts')]) {
    if (existsSync(candidate) && candidate.match(/\.tsx?$/)) return candidate
  }
  return null
}

function graph(entry: string): { files: string[]; packages: Set<string> } {
  const seen = new Set<string>()
  const packages = new Set<string>()
  const queue = [entry]
  while (queue.length) {
    const file = queue.pop()!
    if (seen.has(file)) continue
    seen.add(file)
    const text = readFileSync(file, 'utf8')
    for (const m of text.matchAll(
      /(?:import|export)[^'"]*?from\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g
    )) {
      const spec = m[1] ?? m[2]!
      if (spec.startsWith('.')) {
        const next = resolveImport(file, spec)
        if (next) queue.push(next)
      } else {
        packages.add(spec)
      }
    }
  }
  return { files: [...seen], packages }
}

describe('push route module graph', () => {
  it('contains no @indus/ops-db or Prisma', () => {
    const { files, packages } = graph(join(import.meta.dir, 'route.ts'))
    expect(files.length).toBeGreaterThan(2)
    expect(
      [...packages].filter((p) => p.startsWith('@indus/ops-db') || p.startsWith('@prisma'))
    ).toEqual([])
  })
})
