import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Test-only helpers for the serial auth journeys (S03-T07). They touch the LOCAL database only: the URL
 * must point at localhost, or they refuse.
 */
function localUrl(): string {
  const raw = process.env.DATABASE_URL ?? ''
  const host = (() => {
    try {
      return new URL(raw).hostname
    } catch {
      return ''
    }
  })()
  if (!['localhost', '127.0.0.1', '[::1]'].includes(host)) {
    throw new Error('the auth journeys reset demo users and run against a local DATABASE_URL only')
  }
  return raw
}

/**
 * Put the demo users' sign-in state back to "Google only, nothing locked" so the journeys can rerun. Runs
 * reset-demo-auth.ts under bun (the generated Prisma client is ESM, which Playwright's loader cannot import).
 */
export function resetDemoAuth(emails: readonly string[]): void {
  localUrl()
  execFileSync('bun', [join(__dirname, 'reset-demo-auth.ts'), ...emails], {
    stdio: 'inherit',
    env: process.env,
  })
}

/** The newest message the app wrote to OPS_E2E_MAIL_SINK for `to` (unredacted, local only). */
export function latestSinkMail(to: string, kind: string): { text: string; subject: string } | null {
  const dir = process.env.OPS_E2E_MAIL_SINK
  if (!dir) throw new Error('OPS_E2E_MAIL_SINK must be set for the dev server and the test run')
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .reverse()
  type Sunk = { to: string; kind: string; text: string; subject: string }
  for (const f of files) {
    let m: Sunk
    try {
      m = JSON.parse(readFileSync(join(dir, f), 'utf8')) as Sunk
    } catch {
      continue // still being written; the caller polls
    }
    if (m.to === to && m.kind === kind) return m
  }
  return null
}
