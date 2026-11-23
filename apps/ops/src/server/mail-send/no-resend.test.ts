import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Guard (S04-T06, ADR-07): business mail is sent in exactly one place, once. Fails the build when
 *   - anything under apps/ops/src other than send-once.ts (and the Gmail client and its fake) calls messages.send
 *   - send-once.ts calls messages.send more than once, inside a loop, or through withBackoff / a retry helper
 *   - ops.mail.send is not declared with retries: 0 and a cancelOn
 * Never edit this test to make a change pass.
 */
const SRC = join(import.meta.dirname, '..', '..')

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return name === 'node_modules' ? [] : files(path)
    return /\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : []
  })
}

const ALLOWED = new Set([
  'server/mail-send/send-once.ts',
  'server/gmail/client.ts',
  'server/gmail/testing/fake-gmail.ts',
])

describe('no automatic resend', () => {
  it('only send-once.ts calls messages.send', () => {
    const callers = files(SRC)
      .filter((f) => /messages\.send\s*\(/.test(readFileSync(f, 'utf8')))
      .map((f) => relative(SRC, f))
    expect(callers.filter((f) => !ALLOWED.has(f))).toEqual([])
    expect(callers).toContain('server/mail-send/send-once.ts')
  })

  it('send-once.ts calls it once, outside any loop or retry helper', () => {
    const source = readFileSync(join(SRC, 'server/mail-send/send-once.ts'), 'utf8')
    expect(source.match(/messages\.send\s*\(/g)).toHaveLength(1)
    expect(source).not.toMatch(/withBackoff|retry\(|p-retry|for\s*\(|while\s*\(|\.forEach\(/)
  })

  it('ops.mail.send runs with retries: 0 and stops on ops/mail.send.cancelled', () => {
    const source = readFileSync(join(SRC, 'inngest/mail/send.ts'), 'utf8')
    expect(source).toMatch(/id: 'ops\.mail\.send',[\s\S]*?retries: 0,/)
    expect(source).toMatch(
      /cancelOn: \[\{ event: 'ops\/mail\.send\.cancelled', match: 'data\.outboundId' \}\]/
    )
    expect(source).not.toMatch(/sendOnce\([^)]*\)[\s\S]*sendOnce\(/)
  })

  it('reconcile never sends', () => {
    const source = readFileSync(join(SRC, 'server/mail-send/reconcile.ts'), 'utf8')
    expect(source).not.toMatch(/messages\.send\s*\(|sendOnce\s*\(/)
  })
})
