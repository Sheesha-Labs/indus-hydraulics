import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * The website and Indus Operations are separate Inngest apps that must never
 * share a function id or an event name: an event sent by one would trigger the
 * other's function. Ops ids start 'ops.', Ops events start 'ops/', and Ops never
 * reuses the retired admin procurement or quote events. Read as text, so the test
 * never imports either app's Inngest client.
 */
const REPO = join(import.meta.dirname, '../../../..')

function scan(dir: string) {
  const ids = new Set<string>()
  const events = new Set<string>()
  if (!existsSync(dir)) return { ids, events }
  for (const file of readdirSync(dir, { recursive: true }) as string[]) {
    if (!/\.tsx?$/.test(file) || /\.test\.tsx?$/.test(file)) continue
    const text = readFileSync(join(dir, file), 'utf8')
    for (const m of text.matchAll(/\bid:\s*['"]([^'"]+)['"]/g)) ids.add(m[1]!)
    for (const m of text.matchAll(/\bevent:\s*['"]([^'"]+)['"]/g)) events.add(m[1]!)
  }
  return { ids, events }
}

describe('Inngest registries never overlap', () => {
  const web = scan(join(REPO, 'apps/web/src/inngest'))
  const ops = scan(join(REPO, 'apps/ops/src/inngest'))

  it('reads the website registry', () => {
    expect(web.ids.size).toBeGreaterThan(0)
  })

  it('names every Ops function ops.* and every Ops event ops/*', () => {
    const appIds = [...ops.ids].filter((id) => id !== 'indus-operations')
    expect(appIds.filter((id) => !id.startsWith('ops.'))).toEqual([])
    expect([...ops.events].filter((e) => !e.startsWith('ops/'))).toEqual([])
  })

  it('shares no function id or event name with the website', () => {
    expect([...ops.ids].filter((id) => web.ids.has(id))).toEqual([])
    expect([...ops.events].filter((e) => web.events.has(e))).toEqual([])
  })

  it('never reuses the retired admin procurement or quote events', () => {
    expect([...ops.events].filter((e) => /^(procurement\/|quote\.)/.test(e))).toEqual([])
  })
})
