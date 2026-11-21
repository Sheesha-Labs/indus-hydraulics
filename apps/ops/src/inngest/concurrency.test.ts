import { describe, expect, it, vi } from 'vitest'

// The registry imports the database client; the test reads configuration only.
vi.mock('@indus/ops-db', () => ({ opsDb: {} }))

const { opsFunctions } = await import('./functions')
const { OPS_INNGEST_CONCURRENCY_CAP } = await import('./plan')

type FnConfig = {
  id: string
  concurrency?: { limit?: number } | Array<{ limit?: number }> | number
  triggers?: Array<{ event?: string; cron?: string }>
}

const configs = opsFunctions.map((fn) => {
  const options = (fn as unknown as { opts: FnConfig }).opts
  const triggers = (fn as unknown as { trigger?: FnConfig['triggers'] }).trigger
  return { ...options, triggers: options.triggers ?? triggers ?? [] }
})

function limitOf(c: FnConfig['concurrency']): number | undefined {
  if (typeof c === 'number') return c
  if (Array.isArray(c)) return Math.max(...c.map((x) => x.limit ?? 0))
  return c?.limit
}

/**
 * Every Ops function declares its concurrency, and together they fit inside the
 * plan's cap (ADR-04): an unbounded function is how a burst exhausts the shared
 * database pooler.
 */
describe('Ops Inngest functions', () => {
  it('has at least one function', () => {
    expect(configs.length).toBeGreaterThan(0)
  })

  it('every function declares an explicit concurrency limit', () => {
    expect(configs.filter((c) => !limitOf(c.concurrency)).map((c) => c.id)).toEqual([])
  })

  it('every id is ops.* and every event trigger ops/*', () => {
    expect(configs.filter((c) => !c.id.startsWith('ops.')).map((c) => c.id)).toEqual([])
    const events = configs.flatMap((c) => c.triggers.map((t) => t.event).filter(Boolean))
    expect(events.filter((e) => !e!.startsWith('ops/'))).toEqual([])
  })

  it('the limits together fit the concurrency cap', () => {
    const total = configs.reduce((sum, c) => sum + (limitOf(c.concurrency) ?? 0), 0)
    expect(total).toBeLessThanOrEqual(OPS_INNGEST_CONCURRENCY_CAP)
  })
})
