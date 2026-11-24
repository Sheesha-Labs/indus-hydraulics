import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * ADR-08 conformance guard (S05-T01). Current models reject sampling parameters with a 400, and forced tool
 * use is refused on Opus 5.5 and Sonnet 5.5, so none of them may appear in a request anywhere in Ops:
 *
 *   temperature, top_p, top_k                 sampling (structured output and effort replace them)
 *   tool_choice { type: 'any' | 'tool' }      forced tool use (structured output replaces it)
 *   thinking { type: 'enabled', budget_tokens } a fixed thinking budget (effort replaces it)
 *
 * Scans packages/ops-ai/src and apps/ops/src source files (not tests: they assert the absence by name).
 */
const ROOT = join(import.meta.dir, '../../../..')
const DIRS = ['packages/ops-ai/src', 'apps/ops/src']

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) return name === 'node_modules' ? [] : files(p)
    return /\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [p] : []
  })
}

const BANNED: Array<[string, RegExp]> = [
  ['temperature', /\btemperature\s*:/],
  ['top_p', /\btop_p\s*:/],
  ['top_k', /\btop_k\s*:/],
  ['forced tool_choice', /tool_choice\s*:\s*\{[^}]*type\s*:\s*['"](any|tool)['"]/],
  ['thinking budget', /budget_tokens\s*:/],
]

describe('ADR-08 · no sampling parameters, forced tool use or thinking budgets', () => {
  const sources = DIRS.flatMap((d) => files(join(ROOT, d)))

  it('finds the source files', () => {
    expect(sources.length).toBeGreaterThan(50)
  })

  it.each(BANNED)('%s appears nowhere', (_name, pattern) => {
    const hits = sources
      .filter((f) => pattern.test(readFileSync(f, 'utf8')))
      .map((f) => relative(ROOT, f))
    expect(hits).toEqual([])
  })
})
