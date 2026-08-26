import { expect, test } from '@playwright/test'

/**
 * An anonymous visitor must not cost a session lookup.
 *
 * The header resolves who you are after hydration, because reading the session
 * on the server made every storefront page dynamic (see app/api/me). But it
 * asked on EVERY page load, for every visitor — one `force-dynamic` invocation
 * and one database read per pageview, answered "signed out" almost every time.
 *
 * The session cookie is httpOnly and so invisible to the header. The proxy
 * mirrors its presence into a readable hint cookie, and the header only asks
 * when that hint is there.
 */
test.describe('viewer hint', () => {
  test('an anonymous visit makes no /api/me request', async ({ page }) => {
    const calls: string[] = []
    page.on('request', (r) => {
      if (new URL(r.url()).pathname === '/api/me') calls.push(r.url())
    })
    await page.goto('/')
    // Give hydration time to have made the call it should not make.
    await page.waitForLoadState('networkidle')
    expect(calls).toEqual([])
  })

  test('no hint cookie is set for an anonymous visitor', async ({ page }) => {
    await page.goto('/')
    const cookies = await page.context().cookies()
    expect(cookies.find((c) => c.name === 'indus.viewer')).toBeUndefined()
  })

  test('the header still renders its signed-out state', async ({ page }) => {
    // The saving must not come from the header failing to render. Signed-out
    // is the first paint for everyone, and it has to be a real one.
    await page.goto('/')
    await expect(page.locator('header').first()).toBeVisible()
  })

  test('a hint with no session behind it is cleared', async ({ browser }) => {
    // The self-healing half. The hint is set by the proxy from the real cookie,
    // so a stale or hand-set one must not survive: it would cost a wasted
    // lookup on every page load for a visitor who is not signed in.
    const context = await browser.newContext()
    const base = new URL(process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000')
    await context.addCookies([
      { name: 'indus.viewer', value: '1', domain: base.hostname, path: '/' },
    ])
    const page = await context.newPage()
    await page.goto('/')
    const cookies = await context.cookies()
    expect(cookies.find((c) => c.name === 'indus.viewer')).toBeUndefined()
    await context.close()
  })
})
