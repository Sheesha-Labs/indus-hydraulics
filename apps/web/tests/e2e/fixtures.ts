import { test as base, expect } from '@playwright/test'

/**
 * Production smoke runs from GitHub Actions in headless Chromium, which the
 * catalogue-filter firewall rules deny on filtered shelves (`/c/…?sort=`,
 * `?spec=`, `?brands=`): they exist to keep scrapers off those URLs. The
 * `smoke-bypass` firewall rule, first in the list, lets a request through when
 * it carries `x-indus-smoke` equal to the SMOKE_BYPASS_TOKEN secret.
 *
 * The header is added only to requests for the site under test, never to a
 * third party the page loads, so the token does not leave our own origin.
 * Without the env var (local runs, previews) nothing is added.
 */
const token = process.env.SMOKE_BYPASS_TOKEN

export const test = base.extend({
  // The second argument is Playwright's fixture callback, named `provide` so the React
  // hooks lint rule does not mistake it for React's `use`.
  context: async ({ context, baseURL }, provide) => {
    if (token && baseURL) {
      const origin = new URL(baseURL).origin
      await context.route(`${origin}/**`, (route) =>
        route.continue({ headers: { ...route.request().headers(), 'x-indus-smoke': token } })
      )
    }
    await provide(context)
  },
  request: async ({ playwright, baseURL }, provide) => {
    const request = await playwright.request.newContext({
      ...(baseURL ? { baseURL } : {}),
      extraHTTPHeaders: token ? { 'x-indus-smoke': token } : {},
    })
    await provide(request)
    await request.dispose()
  },
})

export { expect }
