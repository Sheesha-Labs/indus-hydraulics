import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { untrackedMutations } from './write-tracked-scan'

/**
 * Guard (S05-T02, apps/ops/CLAUDE.md §6.7): an Assistant action changes business data only inside a
 * writeTracked callback, so every change has an activity_event with its before and after.
 *
 * Scans server/assistant/actions/*.ts (not tests): a mutating Prisma call (`.create(`, `.update(`, `.upsert(`,
 * `.delete(` and their Many forms) must sit inside the parentheses of a `writeTracked(` call, and the module
 * may not reach for `opsDb` mutations at all.
 */
const DIR = join(import.meta.dir, 'actions')

describe('writeTracked guard', () => {
  it('the scanner sees a mutation outside writeTracked and accepts one inside', () => {
    expect(untrackedMutations('await tx.mailMessage.update({ where })')).toHaveLength(1)
    expect(
      untrackedMutations(
        'await writeTracked(tx, w, async (t) => { await t.mailMessage.update({ data: f(x) }) })'
      )
    ).toEqual([])
  })

  const files = readdirSync(DIR).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'))

  it.each(files.length ? files : ['(none yet)'])('%s mutates only through writeTracked', (file) => {
    if (file === '(none yet)') return
    const src = readFileSync(join(DIR, file), 'utf8')
    expect(untrackedMutations(src)).toEqual([])
    expect(/opsDb\s*\.\s*\w+\s*\.\s*(create|update|upsert|delete)/.test(src)).toBe(false)
  })
})
