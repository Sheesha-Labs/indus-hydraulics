import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * The first Ops production deploy (2026-11-22) answered every database request
 * with "Prisma Client could not locate the Query Engine for runtime
 * rhel-openssl-3.0.x". Vercel Functions run Amazon Linux 2023; the engine for it
 * must be generated into this package's custom output path, and the Ops build
 * must generate it rather than trust a postinstall that Bun may skip.
 */
const ROOT = join(import.meta.dirname, '..', '..', '..')
const schema = readFileSync(join(ROOT, 'packages', 'ops-db', 'prisma', 'schema.prisma'), 'utf8')
const opsPkg = JSON.parse(readFileSync(join(ROOT, 'apps', 'ops', 'package.json'), 'utf8')) as {
  scripts: Record<string, string>
}

describe('Ops Prisma engine on Vercel', () => {
  it('generates the rhel-openssl-3.0.x engine', () => {
    const line = schema
      .split('\n')
      .map((l) => l.replace(/\/\/.*$/, '').trim())
      .find((l) => l.startsWith('binaryTargets'))
    expect(line).toContain('"rhel-openssl-3.0.x"')
  })

  it('runs prisma generate before next build', () => {
    expect(opsPkg.scripts['build']).toMatch(/db:generate && next build$/)
  })
})
