import type { Page } from '@playwright/test'
import { expect, test } from '../signed-in'

/**
 * CSP nonce check (S02-T09). The console's CSP is `script-src 'self' 'nonce-…' 'strict-dynamic'` (no
 * 'unsafe-inline', and 'unsafe-eval' only under `next dev`), so every parser-inserted `<script>` in the
 * server-rendered HTML must carry the request's nonce or the browser refuses it and logs a violation, which
 * would reach Sentry from every page.
 *
 * Two ways this broke before S02-T09, both caught here:
 * - a loading.tsx that reached a client module (the table barrel's DataTableClient): Next renders a
 *   loading boundary's chunks as `<script src async>` without the nonce (see
 *   src/app/loading-client-free.test.ts, the static twin of this test);
 * - a page prerendered at build time (/sign-in/forgot, /sign-in/two-factor…): static HTML has no nonce at
 *   all. The root layout awaits `connection()` so nothing prerenders.
 *
 * Runs in ops-e2e against `next dev`. To check a production build (the second failure only shows there):
 *   bun run --filter @indus/ops build && (cd apps/ops && bunx next start --port 3309)   # with the local env
 *   PLAYWRIGHT_REUSE_SERVER=1 PLAYWRIGHT_BASE_URL=http://localhost:3309 \
 *     bunx playwright test --project=ops-e2e tests/e2e/csp.spec.ts
 */

const ENQ = '/enquiries/ENQ-2026-0001'

const SIGNED_IN = [
  '/today',
  '/enquiries',
  ENQ,
  `${ENQ}/lines`,
  `${ENQ}/compare`,
  '/settings/team',
  '/money',
  '/orders/SO-0001/confirmation',
  '/tasks',
  '/welcome',
  '/setup/company',
]

const SIGNED_OUT = [
  '/sign-in',
  '/sign-in/forgot',
  '/sign-in/two-factor',
  '/sign-in/two-factor/setup',
  '/sign-in/reset/abcdefghijklmnopqrstuv',
  '/q/abcdefghijklmnopqrstuv',
]

/** The nonce the response's CSP grants, and every `<script …>` open tag in its HTML that lacks it. */
async function unnoncedScripts(page: Page, path: string) {
  const res = await page.context().request.get(path)
  expect(res.status(), path).toBe(200)
  const csp = res.headers()['content-security-policy'] ?? ''
  const nonce = /'nonce-([^']+)'/.exec(/script-src [^;]+/.exec(csp)?.[0] ?? '')?.[1]
  expect(nonce, `${path}: script-src carries a nonce`).toBeTruthy()
  expect(csp, `${path}: no 'unsafe-inline' in script-src`).not.toMatch(
    /script-src[^;]*'unsafe-inline'/
  )
  const html = await res.text()
  const tags = html.match(/<script\b[^>]*>/g) ?? []
  expect(tags.length, `${path}: has scripts`).toBeGreaterThan(0)
  return {
    unnonced: tags.filter((t) => !t.includes(`nonce="${nonce}"`)),
    // Only `next dev` adds 'unsafe-eval' (React Refresh), see lib/security-headers.ts.
    dev: /script-src[^;]*'unsafe-eval'/.test(csp),
  }
}

/**
 * The violations that fail. Under `next dev` only, Next's dev overlay and React's dev build apply inline
 * styles the CSP refuses ("Applying inline style violates … style-src"); a production build reports none,
 * and there every report fails.
 */
function failing(violations: string[], dev: boolean): string[] {
  return dev ? violations.filter((v) => !v.startsWith('Applying inline style')) : violations
}

/** CSP violations the browser reports while the page loads and hydrates. */
function watchCsp(page: Page): string[] {
  const seen: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error' && /Content Security Policy/.test(msg.text())) seen.push(msg.text())
  })
  return seen
}

async function loadAndHydrate(page: Page, path: string) {
  await page.goto(path)
  // Hydration done: React has attached its fiber to <html> (some pages have no link or button), and
  // every chunk the runtime loads afterwards has arrived.
  await page.waitForFunction(() =>
    Object.keys(document.documentElement).some((k) => k.startsWith('__reactFiber'))
  )
  await page.waitForLoadState('networkidle')
}

test.describe('csp', () => {
  test.describe.configure({ mode: 'parallel' })

  for (const path of SIGNED_IN) {
    test(`csp: every script on ${path} carries the nonce (Owner)`, async ({ page, signedInAs }) => {
      const violations = watchCsp(page)
      await signedInAs('owner')
      const { unnonced, dev } = await unnoncedScripts(page, path)
      expect(unnonced).toEqual([])
      await loadAndHydrate(page, path)
      expect(failing(violations, dev)).toEqual([])
    })
  }

  for (const path of SIGNED_OUT) {
    test(`csp: every script on ${path} carries the nonce (signed out)`, async ({ page }) => {
      const violations = watchCsp(page)
      const { unnonced, dev } = await unnoncedScripts(page, path)
      expect(unnonced).toEqual([])
      await loadAndHydrate(page, path)
      expect(failing(violations, dev)).toEqual([])
    })
  }
})
