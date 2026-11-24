import { readFileSync, existsSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { AUTOPILOT_LEVELS, MAX_LEVELS, resolveLevelInterim } from '@indus/ops-core'

/**
 * S06-T08 guard: an instruction is never an effect. The instruction action and everything it imports (inside
 * apps/ops/src) must not reach the send queue, Gmail, money, numbering, or another action's module, and the
 * `instruction` key can never resolve above Draft and ask, whatever preset or Custom level is set.
 */
const SRC = resolve(import.meta.dirname, '..', '..', '..')
const ENTRY = join(import.meta.dirname, 'instruction.ts')
const FORBIDDEN = ['server/mail-send', 'server/gmail', 'server/money', 'server/numbering']

function resolveImport(from: string, spec: string): string | null {
  if (!spec.startsWith('.')) return null
  const base = resolve(dirname(from), spec)
  for (const f of [`${base}.ts`, `${base}.tsx`, join(base, 'index.ts')]) if (existsSync(f)) return f
  return null
}

function importsOf(file: string): string[] {
  const src = readFileSync(file, 'utf8')
  return [
    ...src.matchAll(
      /^\s*(?:import|export)[^'"]*?from\s+['"]([^'"]+)['"]|^\s*import\s+['"]([^'"]+)['"]/gm
    ),
  ].map((m) => m[1] ?? m[2]!)
}

/** Every module reachable from the entry through relative imports, as paths relative to src. */
function closure(entry: string): string[] {
  const seen = new Set<string>()
  const stack = [entry]
  while (stack.length) {
    const f = stack.pop()!
    if (seen.has(f)) continue
    seen.add(f)
    for (const spec of importsOf(f)) {
      const r = resolveImport(f, spec)
      if (r) stack.push(r)
    }
  }
  return [...seen].map((f) => relative(SRC, f))
}

describe('instruction guard (S06-T08)', () => {
  const reach = closure(ENTRY)

  it('reaches no send queue, Gmail, money or numbering module', () => {
    expect(reach.length).toBeGreaterThan(1)
    expect(reach.filter((f) => FORBIDDEN.some((p) => f.startsWith(p)))).toEqual([])
  })

  it('imports no other action module (and so no other action’s effect)', () => {
    const others = reach.filter(
      (f) => f.startsWith('server/assistant/actions/') && !f.endsWith('actions/instruction.ts')
    )
    expect(others).toEqual([])
  })

  it('the catalogue row caps it at Draft and ask', () => {
    expect(MAX_LEVELS.instruction).toBe('draft_and_ask')
    const migrations = join(SRC, '..', '..', '..', 'packages', 'ops-db', 'migrations')
    const sql = readFileSync(join(migrations, '202611241705_ops_s06_action_defs.sql'), 'utf8')
    const row = sql.split('\n').find((l) => l.includes("('instruction'") && l.includes("'system'"))
    expect(row).toBeDefined()
    // (key, group, label, description, ruleText, position, configurable, lockedLevel, maxLevel, …)
    expect(row).toMatch(
      /false, NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', 'draft_and_ask'/
    )
  })

  it('no preset or Custom level resolves it above Draft and ask', () => {
    const def = {
      key: 'instruction',
      lockedLevel: null,
      maxLevel: 'draft_and_ask',
      defaultCareful: 'draft_and_ask',
      defaultBalanced: 'draft_and_ask',
      defaultHandsOff: 'draft_and_ask',
    } as const
    for (const level of [...AUTOPILOT_LEVELS, null]) {
      const r = resolveLevelInterim({
        def,
        setting: level ? { level } : null,
        origin: 'live',
        paused: false,
        budget: 'ok',
        mailboxLive: true,
        external: false,
      })
      expect(['off', 'suggest', 'draft_and_ask', 'never']).toContain(r.level)
    }
  })
})
