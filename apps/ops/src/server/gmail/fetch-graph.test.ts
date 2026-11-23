import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/** S04-T05: nothing on the fetch or backfill path can reach the send code (server/mail-send). */
function walk(entry: string): string[] {
  const seen = new Set<string>()
  const queue = [entry]
  while (queue.length) {
    const file = queue.pop()!
    if (seen.has(file)) continue
    seen.add(file)
    for (const m of readFileSync(file, 'utf8').matchAll(
      /(?:import|export)[^'"]*?from\s+['"](\.[^'"]+)['"]|import\(\s*['"](\.[^'"]+)['"]\s*\)/g
    )) {
      const base = resolve(dirname(file), m[1] ?? m[2]!)
      const hit = [`${base}.ts`, `${base}.tsx`, join(base, 'index.ts')].find((c) => existsSync(c))
      if (hit) queue.push(hit)
    }
  }
  return [...seen]
}

const ENTRIES = [
  'fetch.ts',
  'backfill.ts',
  'sync.ts',
  '../../inngest/gmail/message-fetch.ts',
  '../../inngest/gmail/backfill.ts',
]

describe('fetch and backfill never reach the send queue', () => {
  for (const entry of ENTRIES) {
    it(`no path to the send code from ${entry}`, () => {
      const files = walk(join(import.meta.dir, entry))
      expect(files.length).toBeGreaterThan(1)
      expect(files.filter((f) => f.includes('/mail-send/') || f.includes('/send-queue'))).toEqual(
        []
      )
    })
  }
})
