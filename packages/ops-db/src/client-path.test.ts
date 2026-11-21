import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Two Prisma clients must never share a path.
 *
 * packages/db generates the website client into the default `@prisma/client` location. Under
 * Bun's isolated store both packages resolve the very same `@prisma/client` directory (one
 * version, one hash), so if Ops also generated to the default place, whichever ran
 * `prisma generate` last would win and the website would boot with the Ops client — or the
 * reverse. Ops therefore generates into packages/ops-db/generated/client (git-ignored).
 */
const PKG = join(import.meta.dirname, '..')
const opsSchema = readFileSync(join(PKG, 'prisma', 'schema.prisma'), 'utf8')
const webSchema = readFileSync(join(PKG, '..', 'db', 'prisma', 'schema.prisma'), 'utf8')

/** The body of the `generator client { … }` block. */
function generatorBlock(schema: string): string {
  const match = /generator\s+client\s*\{([^}]*)\}/.exec(schema)
  if (!match?.[1]) throw new Error('no generator client block')
  return match[1]
}

/** The generator's `output = "…"` value, ignoring comments. */
function outputOf(schema: string): string | undefined {
  const lines = generatorBlock(schema)
    .split('\n')
    .map((l) => l.replace(/\/\/.*$/, '').trim())
  const line = lines.find((l) => l.startsWith('output'))
  return line ? /"([^"]+)"/.exec(line)?.[1] : undefined
}

describe('prisma client paths', () => {
  it('ops-db generates into packages/ops-db/generated/client', () => {
    expect(outputOf(opsSchema)).toBe('../generated/client')
  })

  it('the generated Ops client exists after `db:generate` (postinstall)', () => {
    expect(
      existsSync(join(PKG, 'generated', 'client', 'index.d.ts')),
      'Run `bun run --filter @indus/ops-db db:generate`.'
    ).toBe(true)
  })

  it('the generated client is the Ops schema, not the website one', () => {
    const generated = readFileSync(join(PKG, 'generated', 'client', 'schema.prisma'), 'utf8')
    expect(generated).toContain('schemas   = ["ops"]')
  })

  it('packages/db still generates into the default @prisma/client path', () => {
    expect(outputOf(webSchema)).toBeUndefined()
  })
})
