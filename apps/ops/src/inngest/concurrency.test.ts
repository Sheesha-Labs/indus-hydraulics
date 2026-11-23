import { describe, expect, it, vi } from 'vitest'

// The registry imports the database client; the test reads configuration only.
vi.mock('@indus/ops-db', () => ({ opsDb: {} }))

const { opsFunctions } = await import('./functions')
const { OPS_INNGEST_CONCURRENCY_CAP, OPS_LANES, WEBSITE_RESERVE, laneKey } = await import('./plan')

type Constraint = { limit?: number; key?: string; scope?: string }
type FnConfig = {
  id: string
  concurrency?: Constraint | Constraint[] | number
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

  // Decision 2026-11-23 (docs/infra-decisions.md §1): the free plan's 5 concurrent steps are account-wide and
  // shared with the website. Functions do not get slots of their own; each runs in one shared lane, and the
  // lanes plus the website's reserve must fit the cap. This replaced "sum every function's limit".
  it('every function runs in exactly one shared lane, at the lane’s limit', () => {
    const lanes = new Map(
      (Object.keys(OPS_LANES) as Array<keyof typeof OPS_LANES>).map((l) => [
        laneKey(l),
        OPS_LANES[l],
      ])
    )
    const bad: string[] = []
    const membership: Record<string, string[]> = {}
    for (const c of configs) {
      const list = Array.isArray(c.concurrency)
        ? c.concurrency
        : typeof c.concurrency === 'object'
          ? [c.concurrency]
          : []
      const inLane = list.filter(
        (x) => x.scope === 'env' && x.key !== undefined && lanes.has(x.key)
      )
      if (inLane.length !== 1) bad.push(`${c.id}: ${inLane.length} lanes`)
      else if (inLane[0]!.limit !== lanes.get(inLane[0]!.key!))
        bad.push(`${c.id}: lane limit differs`)
      if (list.length > 2) bad.push(`${c.id}: more than two constraints`)
      for (const x of list)
        if (x !== inLane[0] && (!x.key || x.scope))
          bad.push(`${c.id}: an extra limit must be per key`)
      if (inLane[0]) (membership[inLane[0].key!] ??= []).push(c.id)
    }
    console.info(
      `Ops Inngest lanes (cap ${OPS_INNGEST_CONCURRENCY_CAP}, website reserve ${WEBSITE_RESERVE}) — ` +
        Object.entries(membership)
          .map(([k, ids]) => `${k} ${lanes.get(k)}: ${ids.join(', ')}`)
          .join(' | ')
    )
    expect(bad).toEqual([])
  })

  it('the lanes and the website’s reserve fit the account-wide cap (upgrade Inngest or narrow a lane otherwise)', () => {
    const total = Object.values(OPS_LANES).reduce((a, b) => a + b, 0) + WEBSITE_RESERVE
    expect(total).toBeLessThanOrEqual(OPS_INNGEST_CONCURRENCY_CAP)
  })

  it('every function declares a pause behaviour (defineOpsFunction)', async () => {
    const { PAUSE_BEHAVIOUR } = await import('./define')
    const missing = configs.map((c) => c.id).filter((id) => !PAUSE_BEHAVIOUR.has(id))
    expect(missing).toEqual([])
  })
})
